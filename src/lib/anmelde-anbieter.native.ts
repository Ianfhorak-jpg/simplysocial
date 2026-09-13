/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  APPLE UND GOOGLE — Geräte-Zweig (Phase 20.3-b2, 2026-09-13)
 *  Die einzige Datei, die `expo-apple-authentication` und `expo-auth-session`
 *  anfasst.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Was WARUM so läuft, steht in `features/auth/anmeldung.ts` — dort sind die drei
 * Messungen aufgeschrieben, aus denen dieser Entwurf folgt (kein Browser-Umweg,
 * kein Nonce bei Apple, PKCE bei Google). Hier steht nur, wie es gemacht wird.
 * Dieselbe Trennung wie Regel-Datei gegen Zeichner bei der Karte (harte Regel 52)
 * und beim Sitzungsspeicher.
 *
 * ── Warum hier KEIN neuer Baustein und KEIN neuer Build dazukommt ───────────
 * Beide Pakete liegen seit dem 12.09. nachts im Binary (24 Treffer in
 * `ios/Podfile.lock`, Prebuild durch). Der naheliegende Griff für Google wäre
 * `@react-native-google-signin/google-signin` gewesen — der native Kontowähler,
 * schöner anzusehen —, und er wäre ein sechster Baustein plus ein Build plus ein
 * weiterer Eintrag in Google Cloud. `expo-auth-session` kann dasselbe mit dem,
 * was schon da ist.
 */
import * as AppleAuthentication from 'expo-apple-authentication';
import { AuthRequest, exchangeCodeAsync, type DiscoveryDocument } from 'expo-auth-session';

import { AnbieterFehler, type AnbieterLage, googleRueckweg } from '@/features/auth/anmeldung';

import type { Ausweis } from './anmelde-anbieter-typen';

/**
 * Die Google-Client-ID für iOS — aus `.env`, wie der anon key und aus demselben
 * Grund öffentlich: Sie landet zwangsläufig im gebauten Bundle. Eine Client-ID
 * ist kein Geheimnis; das Geheimnis ist der Client-SECRET, und der liegt in
 * `~/.simplysocial/` und ausschließlich bei Supabase.
 *
 * **Ausgeschrieben und nicht gerechnet** — Metro ersetzt `process.env.EXPO_PUBLIC_*`
 * textuell beim Bauen, ein zusammengesetzter Name bliebe `undefined` (die Falle
 * steht im Kopf von `lib/supabase.ts`).
 */
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

/** Googles Adressen. Abgeschrieben aus `expo-auth-session/providers/Google.js`. */
const GOOGLE_ADRESSEN: DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

/**
 * Was dieses Gerät kann. SYNCHRON, und das ist eine Abwägung.
 *
 * Die genauere Auskunft wäre `AppleAuthentication.isAvailableAsync()` — nur ist
 * sie asynchron, und der Bildschirm zeichnet sofort. Ein Knopf, der eine
 * Zehntelsekunde ausgegraut ist und dann angeht, flackert; einer, der von Anfang
 * an richtig dasteht, tut es nicht. Der Ersatz ist hier ehrlich, weil er nur in
 * EINE Richtung falsch sein kann: Apples Anmeldung gibt es ab iOS 13, und diese
 * App verlangt iOS 26.
 *
 * Die genaue Frage wird trotzdem gestellt — eine Zeile tiefer, im Augenblick des
 * Antippens, wo sie nichts kostet.
 */
export function anbieterLage(): AnbieterLage {
  return { apple: true, google: Boolean(GOOGLE_CLIENT_ID) };
}

/**
 * Apple. Der kurze Weg: Das Betriebssystem zeigt seinen eigenen Dialog, und was
 * herauskommt, geht unverändert an Supabase.
 *
 * ── Der `nonce` fehlt hier ABSICHTLICH ──────────────────────────────────────
 * `expo-apple-authentication` reicht ihn unverändert an Apple durch
 * (`AppleAuthenticationRequest.swift`, Zeile 31), Supabase vergleicht dagegen den
 * HASH des mitgegebenen Werts (`auth-js/types.d.ts`, Zeile 639) — und in welchem
 * Format gehasht wird, ist von hier aus nicht nachprüfbar. Die ganze Begründung
 * steht in `features/auth/anmeldung.ts`. **Wer hier einen Nonce ergänzt, prüft
 * ihn am GERÄT nach und nicht im Kopf.**
 */
export async function appleAusweis(): Promise<Ausweis> {
  if (!(await AppleAuthentication.isAvailableAsync())) {
    throw new AnbieterFehler('apple', 'nicht-hier', 'Dieses Gerät kann keine Apple-Anmeldung.');
  }

  let ausweis: AppleAuthentication.AppleAuthenticationCredential;
  try {
    ausweis = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
  } catch (fehler) {
    // Ein Abbruch ist KEIN Fehler. `anbieterFehlerText('abgebrochen')` gibt
    // deshalb `null` zurück, und auf dem Bildschirm steht danach nichts — wer
    // den Dialog wegwischt, hat entschieden und nicht versagt.
    const code = (fehler as { code?: string })?.code;
    if (code === 'ERR_REQUEST_CANCELED') {
      throw new AnbieterFehler('apple', 'abgebrochen', 'Der Dialog wurde weggewischt.');
    }
    throw new AnbieterFehler('apple', code ?? 'unbekannt', String(fehler));
  }

  if (!ausweis.identityToken) {
    // `signInAsync` wirft dafür schon selbst (`ERR_REQUEST_FAILED`, nachgelesen).
    // Die Prüfung steht trotzdem hier, weil der TYP `string | null` sagt — und
    // ohne sie wäre `idToken: ausweis.identityToken` ein Typfehler, den man mit
    // einem `!` wegdrückt statt zu beantworten.
    throw new AnbieterFehler('apple', 'kein-ausweis', 'Apple hat keinen identityToken geschickt.');
  }

  return { idToken: ausweis.identityToken, name: appleName(ausweis.fullName) };
}

/**
 * Aus Apples zerlegtem Namen einen machen — oder `null`.
 *
 * Apple gibt Vor- und Nachnamen getrennt, und **jedes Feld darf fehlen**: Wer im
 * Dialog den Namen ausblendet, bekommt überall `null`. Deshalb wird hier
 * zusammengesetzt, was da ist, und wenn nichts da ist, ist die Antwort `null` und
 * nicht `''` — siehe den Kommentar am Feld in `anmelde-anbieter-typen.ts`.
 *
 * `formatFullName()` aus dem Paket wäre der elegantere Weg und ist der falsche:
 * Es wirft, wenn der native Baustein fehlt, und liefert bei leerem Namen eine
 * leere Zeichenkette statt einer Auskunft.
 */
function appleName(voll: AppleAuthentication.AppleAuthenticationFullName | null): string | null {
  if (!voll) return null;
  const teile = [voll.givenName, voll.familyName].filter(
    (t): t is string => typeof t === 'string' && t.trim().length > 0,
  );
  return teile.length > 0 ? teile.join(' ').trim() : null;
}

/**
 * Google. Der Code-Weg mit PKCE, in zwei Schritten: Fenster auf, Code eintauschen.
 *
 * ── Warum nicht der kürzere Weg ─────────────────────────────────────────────
 * `response_type=id_token` spart den zweiten Schritt und ERZWINGT dafür einen
 * Nonce (OIDC verlangt ihn im impliziten Ablauf) — also genau das ungeprüfte
 * Hash-Format aus der Apple-Begründung. Der Code-Weg schützt stattdessen mit
 * PKCE: Der zurückkommende Code ist an ein Geheimnis gebunden, das diese eine
 * Anfrage erzeugt hat und das nie durch das Browserfenster lief.
 *
 * ── Und warum kein Client-SECRET dabei ist ──────────────────────────────────
 * Ein iOS-Client ist bei Google ein *öffentlicher* Client: Der Tausch läuft ohne
 * Secret, PKCE tritt an dessen Stelle. Das Secret aus `~/.simplysocial/` gehört
 * ausschließlich zum Web-Client und liegt bei Supabase — in eine App gehört es
 * nie, dort wäre es nach dem ersten Auspacken des Bundles keines mehr.
 */
export async function googleAusweis(): Promise<Ausweis> {
  if (!GOOGLE_CLIENT_ID) {
    throw new AnbieterFehler(
      'google',
      'kein-zugang',
      'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID fehlt in .env — anlegen mit `npm run google-app-id`.',
    );
  }

  const ziel = googleRueckweg(GOOGLE_CLIENT_ID);
  const anfrage = new AuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    redirectUri: ziel,
    // `openid` holt den Ausweis, `profile` und `email` füllen ihn mit Name und
    // Adresse — daraus macht Supabase die `user_metadata`, aus der wiederum der
    // Bildschirm fürs erste Konto nichts liest. Gebraucht wird nur `email`:
    // `profiles` verlangt sie nicht, aber `auth.users` hängt daran, und ohne sie
    // hätte dasselbe Konto beim nächsten Mal über einen anderen Weg keine
    // Verbindung zum ersten.
    scopes: ['openid', 'profile', 'email'],
    usePKCE: true,
  });

  const antwort = await anfrage.promptAsync(GOOGLE_ADRESSEN);

  // ── Die Reihenfolge dieser zwei Prüfungen ist eine Typfrage, keine Stilfrage ──
  // `AuthSessionResult` ist ein Union aus ZWEI Formen, und nur die zweite
  // (`'error' | 'success'`) trägt überhaupt ein Feld `error`. Die erste Fassung
  // fragte zuerst die Abbrüche ab und danach `!== 'success'` — darin steckt
  // `'opened'` noch, also blieb die erste Form im Typ, und `antwort.error` gab
  // es dort nicht. **`tsc` hat es gemeldet, bevor es je ein Gerät gesehen hat.**
  if (antwort.type === 'error') {
    throw new AnbieterFehler('google', antwort.error?.code ?? 'unbekannt', String(antwort.error));
  }
  if (antwort.type !== 'success') {
    // Bleiben vier: `cancel` (weggetippt), `dismiss` (Fenster zugezogen),
    // `locked` (es steht schon ein Fenster offen) und `opened` (nur Web — das
    // Fenster ist auf, die Antwort kommt anderswo an). Für diesen Weg heißen
    // alle vier dasselbe: **es gibt keinen Code.** Und alle vier gelten als
    // Abbruch, also steht danach nichts auf dem Bildschirm — bei den ersten
    // dreien ist das richtig, und der vierte kann hier gar nicht auftreten,
    // weil diese Datei nur am Gerät läuft.
    throw new AnbieterFehler('google', 'abgebrochen', `Fenster beendet (${antwort.type}).`);
  }

  const code = antwort.params.code;
  if (!code) {
    throw new AnbieterFehler('google', 'kein-ausweis', 'Google hat keinen Code zurückgeschickt.');
  }

  const getauscht = await exchangeCodeAsync(
    {
      clientId: GOOGLE_CLIENT_ID,
      code,
      redirectUri: ziel,
      // Das PKCE-Geheimnis. Es steht am `AuthRequest`, weil DER es erzeugt hat —
      // ein zweites hier gebautes wäre ein anderes, und Google wiese den Tausch
      // ab. `?? ''` ist kein Notbehelf: `usePKCE: true` setzt es, und ein leerer
      // Wert scheitert LAUT bei Google statt still bei uns.
      extraParams: { code_verifier: anfrage.codeVerifier ?? '' },
    },
    GOOGLE_ADRESSEN,
  );

  if (!getauscht.idToken) {
    // Das passiert genau dann, wenn `openid` aus den `scopes` fällt — und dann
    // ist der Zugriffs-Token da und der Ausweis nicht. Ohne diese Prüfung ginge
    // `undefined` an Supabase und käme als unverständliche Absage zurück.
    throw new AnbieterFehler('google', 'kein-ausweis', 'Im Tausch war kein idToken — fehlt `openid`?');
  }

  // Kein Name: Er steht im Ausweis, und den liest Supabase. Hier ihn selbst
  // aufzumachen hieße, einem ungeprüften JWT zu glauben (siehe den Typ).
  return { idToken: getauscht.idToken, name: null };
}
