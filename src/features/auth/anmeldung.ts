/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WER BIN ICH — UND WORAN HÄNGT DAS
 *  Phase 20.3. Die App-Seite von Ians 27. Entscheidung vom 2026-09-06.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Bis heute war „wer bin ich" eine KONSTANTE: `CURRENT_USER_ID = 'u_ian'` stand in
 * `data/mock.ts`, und 110 Stellen haben sie direkt gelesen. Das war richtig, solange
 * es keinen Login gab — und es ist genau die Sorte Wahrheit, die beim Umstellen
 * lautlos falsch wird. Deshalb ist die Konstante **ersatzlos gelöscht** und nicht auf
 * `string | null` gesetzt worden:
 *
 *     Ein `string | null` wäre die `Post.district`-Falle zum fünften Mal. In JSX
 *     rendert `null` klaglos als Nichts, `find(u => u.id === null)` ist gültiger
 *     Code, und `tsc` hätte zu allen 110 Stellen geschwiegen. Verschwindet der
 *     Export dagegen ganz, schreibt der Compiler die Arbeitsliste — dieselbe
 *     Technik wie `IconName` in Phase 14.
 *
 * Diese Datei sagt, was an ihre Stelle tritt und was daran Ians Entscheidung ist.
 * Screens lesen die Konstanten hier nie; sie sehen nur das Ergebnis, und die Sätze
 * über das Anmelden kommen aus `anmeldeFolgen()`. Dieselbe Bauart wie
 * `safety/block.ts` (harte Regel 17), `groups/gruppe.ts` (32),
 * `requests/kollision.ts` (46) und `posts/standort.ts` (68).
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DREI WEGE HINEIN — Ians Entscheidung 27, gegen meine Empfehlung
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   A. NUR E-MAIL-CODE  (meine Empfehlung, verworfen)
 *      Ein Weg statt drei: einer zu bauen, einer zu testen, einer zum Kaputtgehen.
 *      Und Richtlinie 4.8 von Apple wird gar nicht erst ausgelöst.
 *      Haken — und er ist der Grund, warum A verloren hat: Eine abgetippte
 *      E-Mail-Adresse plus ein Wechsel in die Mail-App plus ein abgetippter Code
 *      sind drei Gelegenheiten aufzuhören, und sie liegen ALLE vor dem ersten
 *      Blick in den Feed. Eine App mit leerem Feed verliert genau dort.
 *
 *   B. E-MAIL-CODE UND GOOGLE UND APPLE  ← **Ians Wahl**
 *      Ein Tipp statt einer Tipperei. Sein Argument ist das bessere Produkt, meins
 *      der geringere Aufwand.
 *
 * ── Die Folge, die er beim Entscheiden kannte ─────────────────────────────────
 * Sobald Google dabei ist, verlangt Apple nach **Richtlinie 4.8** zusätzlich einen
 * Anmeldeweg, der nur Name und E-Mail nimmt und das Verstecken der Adresse erlaubt.
 * „Anmelden mit Apple" erfüllt das und ist damit **Pflicht, nicht Zierde**. Weil er
 * Apple ohnehin gewählt hat, entsteht daraus keine Extraarbeit — aber eine
 * REIHENFOLGE, und die ist in `ANMELDE_WEGE` ausgeschrieben:
 *
 *     **Apple muss fertig sein, BEVOR Google live geht.** Umgekehrt ist es eine
 *     Ablehnung im Review, und zwar erst am Ende von Phase 21.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS BEIM ANMELDEN GEFRAGT WIRD — und was ausdrücklich nicht
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Der Heimatbezirk gehört ins Anmelden. Das ist Ians Entscheidung 64 vom
 * 2026-09-08, wörtlich: *„man gibt am Anfang seinen Bezirk an."* Seit Entscheidung
 * 63 bestimmt er die REIHENFOLGE des Feeds (`posts/sort.ts`), also ist er keine
 * Zierangabe — ohne ihn sortiert der Feed ab einem Bezirk, den niemand gewählt hat.
 * Der Schalter in `/einstellungen` bleibt daneben bestehen und wird nicht ersetzt.
 *
 * **Nicht gefragt wird der Standort.** `STANDORT_FRAGE = 'einstellung'`
 * (Entscheidung 70) sagt das ausdrücklich, und der Grund steht dort: iOS zeigt den
 * Systemdialog **ein einziges Mal**. Wer ihn im Anmelden wegdrückt, drückt ihn für
 * immer weg. Wer hier eine Standortfrage einbaut, hebt Entscheidung 70 auf.
 */

/** Die drei Wege hinein. Reihenfolge = Reihenfolge auf dem Bildschirm. */
export type AnmeldeWeg = 'apple' | 'google' | 'email-code';

/**
 * Ians Entscheidung 27. Nicht ohne Rückfrage ändern.
 *
 * Apple steht **vorn**, und das ist keine Geschmacksfrage: Richtlinie 4.8 verlangt
 * ihn, sobald Google dasteht (siehe Kopf). Wer Google vorzieht oder Apple streicht,
 * ändert damit still die Reihenfolge, in der die Wege live gehen dürfen.
 */
export const ANMELDE_WEGE: readonly AnmeldeWeg[] = ['apple', 'google', 'email-code'];

/**
 * Woher die Sitzung kommt — **der eine Schalter, den Phase 20.3-b umlegt.**
 *
 * `'attrappe'` heißt: kein Netz, kein Konto, kein Token. Die Sitzung wird beim Start
 * auf den Seed-Nutzer aus `data/mock.ts` gesetzt, damit der Prototyp auf der
 * öffentlichen Adresse genau das bleibt, was er war. Alles ÜBER dieser Zeile —
 * `useCurrentUserId()`, der ausgeloggte Zustand, die 110 umgestellten Stellen — ist
 * schon das Echte und ändert sich beim Umlegen um kein Zeichen.
 *
 * Das ist dieselbe Trennung, die bei 20.1/20.2 getragen hat: *halten die Regeln?*
 * und *ist das Projekt eingerichtet?* sind zwei Fragen, und nur die zweite braucht
 * Ians Konten.
 */
export const ANMELDE_QUELLE: 'attrappe' | 'supabase' = 'attrappe';

/**
 * Wer gerade angemeldet ist — als diskriminiertes Union, nicht als `string | null`.
 *
 * Das ist die fünfte Runde derselben Frage nach `Post.district`, `ChatThread.postId`,
 * `Visibility` und `PostAlter`, und die Antwort ist wieder dieselbe: **Braucht eine
 * Stufe zusätzliche Daten, ist es ein Union.** Der Zustand „angemeldet, aber ohne
 * ID" ist damit undarstellbar; bei `ichId: string | null` wäre er tippbar gewesen
 * und niemand hätte es gemerkt.
 */
/**
 * Warum jemand gerade NICHT angemeldet ist — soweit die App etwas dazu zu sagen hat.
 *
 * Es gibt genau einen Grund, und das ist Absicht: Ein gewöhnliches Abmelden braucht
 * keine Erklärung (man hat es selbst getan, gerade eben), und ein abgelaufenes Token
 * sagt schon die Fehlerleiste (`schreibFehlerFolgen()`). Nur beim Kontolöschen fehlt
 * sonst jede Rückmeldung, dass die stärkste Handlung der App stattgefunden hat.
 */
export type AbmeldeGrund = 'konto-geloescht';

export type Sitzung =
  /**
   * Noch nicht nachgesehen — der ANFANGSZUSTAND mit `ANMELDE_QUELLE = 'supabase'`.
   * Phase 20.3-b1.
   *
   * Er dauert einen Augenblick und ist trotzdem ein eigener Zustand, weil er sonst
   * mit `'aus'` zusammenfiele — und das ist etwas anderes: „wir wissen es noch
   * nicht" gegen „niemand ist angemeldet". Wer beides gleichsetzt, zeigt jedem, der
   * die App mit gespeicherter Sitzung öffnet, für einen Lidschlag den
   * Anmelde-Bildschirm. **Dieselbe Unterscheidung wie `laden.zustand === 'laeuft'`
   * gegen neun leere Listen** (Ians Entscheidung 43): „ist nichts" und „kommt noch"
   * dürfen nicht gleich aussehen.
   */
  | { zustand: 'unbekannt' }
  /**
   * Niemand angemeldet. Ein Screen, der ein Ich braucht, wird gar nicht gezeichnet.
   *
   * `grund` trägt seit dem 2026-09-12 Ians Entscheidung 52: Wer sein Konto gelöscht
   * hat, landet hier — und soll auf dem Anmelde-Bildschirm eine Quittung lesen
   * (`LOESCH_QUITTUNG` in `safety/konto.ts`).
   *
   * **Ein optionales Feld und kein fünftes Glied**, und das ist eine Abwägung gegen
   * harte Regel 77: Ein neues Glied hätte `torwaechterZeigt()` zu einem Typfehler
   * gezwungen — nur wäre die Antwort dort `'anmelden'` gewesen, also dieselbe.
   * Der Torwächter unterscheidet Sitzungen danach, WAS er zeichnet; beide Fälle
   * zeichnen den Anmelde-Bildschirm. Ein Glied, das sich vom Nachbarn nur durch
   * eine Zeile TEXT unterscheidet, ist kein eigener Zustand.
   *
   * Der Preis ist benannt: `tsc` meldet zu diesem Feld nichts (Phase-16-Lehre). Wer
   * einen zweiten Grund ergänzt, prüft die EINE Stelle, die ihn liest — den
   * Anmelde-Bildschirm — von Hand.
   */
  | { zustand: 'aus'; grund?: AbmeldeGrund }
  /**
   * Bei Supabase angemeldet — und noch OHNE Profil. Phase 20.3-b1.
   *
   * Der Zustand entsteht genau einmal je Mensch: Nach dem ersten richtigen Code hat
   * jemand eine UUID und eine E-Mail, aber `profiles` verlangt vier Felder `not null`
   * (siehe `auth/konto.ts`). Er trägt `authId` und NICHT `ichId`, und das ist kein
   * Namensunterschied: `ichId` ist eine `User.id`, also der Verweis auf eine Zeile,
   * die es noch nicht gibt. Hieße das Feld an beiden Stellen gleich, wäre
   * `useCurrentUserId()` für diesen Zustand ohne Weiteres gültiger Code — und
   * fünfzig Screens suchten einen Menschen, den niemand angelegt hat.
   */
  /**
   * `name` seit 20.3-b2, und dieses Feld ist ein MESSERGEBNIS.
   *
   * Apple gibt den vollen Namen **ausschließlich bei der allerersten
   * Freigabe** heraus (steht wörtlich in `AppleAuthentication.js`: *„you will
   * only receive Apple Authentication Credentials the first time users sign
   * into your app, so you must store it for later use"*). Bei jeder späteren
   * Anmeldung ist `fullName` `null` — auch nach dem Löschen und
   * Neuinstallieren der App.
   *
   * Wer ihn in diesem einen Augenblick wegwirft, bekommt ihn NIE zurück. Also
   * reist er mit bis zum Bildschirm fürs erste Konto und steht dort im
   * Namensfeld — änderbar, nicht festgeschrieben.
   *
   * ⚠️ **Das Vorausfüllen ist meine AUSLEGUNG von Entscheidung 44 und wartet
   * auf Ians Urteil** (PLAN.md, Abschnitt 6, Punkt 37): Gefragt werden
   * weiter drei Dinge, nur ist eines davon schon beantwortet. Die Korrektur
   * wäre, das Feld nicht durchzureichen — eine Zeile.
   *
   * Optional, und der Preis ist benannt: `tsc` meldet zu einer Lockerung
   * nichts (die Phase-16-Lehre). Es gibt genau EINE Stelle, die es liest —
   * `components/ErstesKonto.tsx` —, und die ist von Hand geprüft.
   */
  | { zustand: 'neu'; authId: string; email: string; name?: string }
  /** Angemeldet. `ichId` ist eine `User.id`. */
  | { zustand: 'an'; ichId: string };

/**
 * Was der Torwächter in `app/_layout.tsx` zeichnet — **und warum das hier steht.**
 *
 * Ein drittes Glied an `Sitzung` ist eine LOCKERUNG, und die Phase-16-Lehre sagt
 * dazu das Unangenehme: `tsc` meldet null Stellen. Der Torwächter fragte bis
 * 20.3-a `zustand === 'an'`, und das bleibt gültiger Code — `'neu'` wäre still in
 * den `else`-Zweig gefallen, und jemand mit gültigem Token säße wieder vor dem
 * Anmelde-Bildschirm und bekäme einen zweiten Code geschickt.
 *
 * **Also entsteht die Enge eine Ebene höher**, genau wie `ChatEintrag.post` in
 * Phase 16: Diese Funktion hat einen erschöpfenden `switch` mit `never`-Abschluss.
 * Wer `Sitzung` um ein viertes Glied erweitert, bekommt hier einen Typfehler statt
 * eines stillen Bildschirms.
 */
export type TorwaechterZeigt = 'wartet' | 'anmelden' | 'erstes-konto' | 'app';

export function torwaechterZeigt(sitzung: Sitzung): TorwaechterZeigt {
  switch (sitzung.zustand) {
    case 'unbekannt':
      return 'wartet';
    case 'aus':
      return 'anmelden';
    case 'neu':
      return 'erstes-konto';
    case 'an':
      return 'app';
    default: {
      const nie: never = sitzung;
      return nie;
    }
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  APPLE UND GOOGLE — Phase 20.3-b2 (2026-09-13)
 *  Was gemessen wurde, bevor eine Zeile davon gebaut war.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Am Server steht seit dem 13.09. nachts `apple: true, google: true` — gemessen
 * an `/auth/v1/settings`, live. Damit ist die KONTEN-Seite fertig, und die drei
 * Entscheidungen darunter sind reine Technik. Sie stehen trotzdem hier und nicht
 * im Zeichner, weil jede von ihnen aus einer MESSUNG kommt, die niemand ein
 * zweites Mal machen soll.
 *
 * ── 1. Beide Wege gehen über einen AUSWEIS, nicht über einen Browser ─────────
 * Der naheliegende Weg wäre `signInWithOAuth()` gewesen: eine Funktion für beide
 * Anbieter, dieselbe auf Web und Gerät, Supabase erledigt den ganzen Tanz. Er
 * scheitert an einer Kleinigkeit mit Folgen — der Rücksprung ginge dann DURCH
 * Supabase zurück in die App (`simplysocial://…`), und diese Adresse muss in
 * Supabases Erlaubnisliste stehen. Das ist ein Dashboard-Feld, also **ein neuer
 * Handgriff von Ian**, und der Management-Token dafür ist widerrufen (richtig
 * so — er darf alles im Konto).
 *
 * `signInWithIdToken()` braucht davon nichts: Der Ausweis entsteht zwischen dem
 * GERÄT und dem Anbieter, Supabase bekommt ihn fertig gereicht und prüft nur
 * Unterschrift und Empfänger. **Kein neues Feld, kein neuer Klick, kein neuer
 * Baustein.**
 *
 * ── 2. Beide Wege sind GERÄTE-Wege, und bei Apple ist das keine Bequemlichkeit ─
 * Apples Client-ID in Supabase ist die Bundle-ID `at.simplysocial.app`. Das ist
 * eine NATIVE Kennung; Apples Anmeldung im Browser verlangt eine eigene
 * *Services ID*, die es nicht gibt. „Anmelden mit Apple" ist im Browser also
 * nicht halb fertig, sondern **unmöglich** — und ein Knopf dafür wäre ein Knopf,
 * der lügt. Deshalb gibt es `AnbieterLage`, und deshalb ist sie ein PFLICHTFELD
 * (siehe dort).
 *
 * ── 3. NONCE: keiner bei Apple, PKCE bei Google — und das ist gemessen ───────
 * Der übliche Schutz gegen einen wiederverwendeten Ausweis ist ein Nonce. Er ist
 * hier eine Falle, und zwar eine, die nur am Gerät zuschlägt:
 *
 *     `expo-apple-authentication/ios/AppleAuthenticationRequest.swift`, Zeile 31:
 *         request.nonce = options.nonce          ← reicht durch, hasht NICHT
 *     `@supabase/auth-js/…/types.d.ts`, Zeile 639:
 *         „If the ID token contains a `nonce` claim, then the HASH of this value
 *          is compared to the value in the ID token."
 *
 * Wer denselben Rohwert an beide gibt, bekommt eine Absage, die nach einem
 * kaputten Schlüssel aussieht. Richtig wäre: gehashten Wert an Apple, rohen an
 * Supabase. **Nur ist nicht nachprüfbar, WIE Supabase hasht** — hex oder
 * base64url —, und ein geratenes Format scheitert ausschließlich auf einem
 * fremden iPhone, mit einer Meldung, die niemand lesen wird. Ein Zustand, den man
 * nur beim Nutzer sieht, ist keiner, den man annimmt (dieselbe Überlegung wie bei
 * Ians Entscheidung 55, Möglichkeit A).
 *
 * Also **kein Nonce bei Apple** — das ist zugleich der Weg, den Supabase selbst
 * dokumentiert. Was damit fehlt, ist benannt und klein: Der Ausweis reist
 * unmittelbar vom Betriebssystem zu Supabase, lebt zehn Minuten und trägt
 * `at.simplysocial.app` als Empfänger. Ihn abzufangen hieße, schon IN der App zu
 * sein.
 *
 * Bei Google entsteht der Ausweis dagegen über ein Browserfenster, und dort gäbe
 * es wirklich etwas abzufangen. Deshalb nimmt Google **nicht** den kurzen Weg
 * (`response_type=id_token`, der einen Nonce ERZWINGT), sondern den Code-Weg mit
 * **PKCE**: Der zurückkommende Code ist an ein Geheimnis gebunden, das diese eine
 * Anfrage erzeugt hat und das nie durch den Browser lief. Das ist derselbe Schutz,
 * ohne das ungeprüfte Hash-Format.
 */

/**
 * Was dieses GERÄT kann — **ein Pflichtfeld, kein `?`.**
 *
 * `anmeldeFolgen()` hatte bis heute einen Parameter und braucht jetzt zwei. Das
 * ist Absicht und dieselbe Technik wie `meinOrt` in `SortKontext` (Phase 19h-2):
 * Mit einem optionalen Feld wäre jede Aufrufstelle stumm durchgelaufen, und der
 * Apple-Knopf stünde im Browser als klickbarer Knopf da, der gar nicht kann.
 * So schreibt `tsc` die Arbeitsliste.
 *
 * Woher die Antwort kommt, steht in `lib/anmelde-anbieter.ts` (Web) bzw.
 * `.native.ts` (Gerät) — eine Plattform-ENDUNG, weil dort die Bausteine liegen.
 */
export type AnbieterLage = { apple: boolean; google: boolean };

/**
 * Die zwei Wege, hinter denen ein fremder Dienst steht — **abgeleitet, nicht
 * aufgezählt.**
 *
 * `Exclude<AnmeldeWeg, 'email-code'>` statt `'apple' | 'google'`: Käme je ein
 * vierter Weg dazu, wäre er hier automatisch dabei und müsste beantwortet
 * werden, statt still zu fehlen. Dieselbe Überlegung wie `AgeBand =
 * Exclude<AgeGroup, 'egal'>` aus Phase 15 und wie `LIEST_AUS_SUPABASE`
 * (harte Regel 74): zwei Aufzählungen für dieselbe Menge laufen auseinander.
 */
export type Anbieter = Exclude<AnmeldeWeg, 'email-code'>;

/**
 * Wohin Google zurückspringt — **ABGELEITET aus der Client-ID, nicht danebengelegt.**
 *
 * Google verlangt für einen iOS-Client die umgedrehte Client-ID als Schema: aus
 * `132215-abc.apps.googleusercontent.com` wird
 * `com.googleusercontent.apps.132215-abc:/oauthredirect`. Dieselbe Angabe zweimal
 * abzulegen wären zwei Gelegenheiten, dass sie auseinanderlaufen — genau die
 * Überlegung hinter `PROJEKTION` (harte Regel 53) und hinter der Project URL, die
 * `anon-key.sh` aus dem Token liest statt sie abzutippen.
 *
 * ── Warum sie HIER steht und nicht beim Zeichner ────────────────────────────
 * Sie stand zuerst in `lib/anmelde-anbieter.native.ts`, zwischen den nativen
 * Importen — und war damit **nur am Gerät prüfbar.** Das ist genau der Fehler,
 * vor dem `95_sitzung.sh` in seinem eigenen Kopf warnt, und er wiegt hier
 * schwer: Stimmt ein Zeichen nicht, weist Google die Anmeldung mit
 * `redirect_uri_mismatch` ab — in einem Browserfenster, auf einem fremden
 * iPhone, wo niemand danebensteht. Als reine Funktion in einer importfreien
 * Datei misst sie `npm run pruef-anbieter` in blankem Node.
 *
 * ── Und warum dafür NICHTS in die Info.plist muss ───────────────────────────
 * `expo-auth-session` öffnet auf iOS eine `ASWebAuthenticationSession`, und die
 * fängt ihr Rücksprung-Schema **selbst ab** — kein `CFBundleURLScheme` nötig.
 * Stünde dort eines, wäre das ein Prebuild und damit ein neuer Build (und die
 * Prebuild-Falle zum vierten Mal).
 */
export function googleRueckweg(clientId: string): string {
  const kurz = clientId.replace(/\.apps\.googleusercontent\.com$/, '');
  return `com.googleusercontent.apps.${kurz}:/oauthredirect`;
}

/**
 * Ein Anbieter-Weg ist gescheitert — mit `code`, wie `KontoFehler`.
 *
 * Er steht in dieser importfreien Regel-Datei und nicht in `konten.ts`, weil ihn
 * BEIDE Zweige von `lib/anmelde-anbieter` werfen: Ein Import von `konten.ts`
 * zöge über `lib/supabase.ts` die ganze Leitung in eine Datei, die nur ein
 * Betriebssystem fragt.
 */
export class AnbieterFehler extends Error {
  constructor(
    readonly weg: Anbieter,
    readonly code: string,
    grund: string,
  ) {
    super(`Anmelden über "${weg}" gescheitert (${code}): ${grund}`);
    this.name = 'AnbieterFehler';
  }
}

/**
 * Was dasteht, wenn ein Anbieter-Weg nicht durchgeht — **`null` heißt: gar nichts.**
 *
 * ── Warum eine eigene Funktion neben `codeFehlerText()` ──────────────────────
 * Weil es hier einen Fall gibt, den der E-Mail-Weg nicht kennt: **Abbrechen.**
 * Wer den Apple-Dialog wegwischt, hat keinen Fehler erlebt, sondern eine
 * Entscheidung getroffen — und eine rote Zeile danach behauptet, etwas sei
 * schiefgegangen. Dieselbe Familie wie „Noch nichts los in deinem Feed" bei einem
 * Netzausfall (Ians Entscheidung 43): ein Satz, der lügt. `null` ist deshalb ein
 * gültiges Ergebnis und kein Versäumnis.
 */
export function anbieterFehlerText(code: string): string | null {
  switch (code) {
    case 'abgebrochen':
      return null;
    case 'nicht-hier':
      return 'Das geht nur in der App am Handy. Nimm hier die E-Mail.';
    case 'kein-zugang':
      // Die Client-ID fehlt in `.env`. Für den Menschen davor ist das dasselbe
      // wie „geht gerade nicht" — der Grund steht in der Konsole, nicht hier
      // (der Fund vom 2026-09-03: Entwickler-Notizen in JSX-Text sind öffentlich).
      return 'Dieser Weg ist gerade nicht eingerichtet. Nimm die E-Mail.';
    case 'kein-ausweis':
      return 'Der Anbieter hat nichts zurückgeschickt. Probier es noch einmal.';
    default:
      return 'Das hat gerade nicht geklappt. Prüf dein Netz und probier es noch einmal.';
  }
}

/**
 * Die Sätze, die die Oberfläche über einen Anmeldeweg sagt — an EINER Stelle.
 *
 * `bereit` sagt, ob der Weg WIRKLICH funktioniert — und seit 20.3-b2 hängt das an
 * ZWEI Dingen: ob es überhaupt ein Konto gibt (`ANMELDE_QUELLE`) und ob dieses
 * Gerät den Weg kann (`lage`). Der zweite Teil ist neu und der Grund für das
 * Pflichtfeld: Apple im Browser ist nicht „noch nicht", sondern „nie" (siehe
 * Kopf). Dasselbe Muster wie `schreibHuerdeText()` in `chat/direkt.ts`: Steht der
 * Knopf nicht da, steht ein Satz da.
 */
export function anmeldeFolgen(
  weg: AnmeldeWeg,
  lage: AnbieterLage,
): {
  titel: string;
  hinweis: string;
  bereit: boolean;
} {
  const quelleSteht = ANMELDE_QUELLE !== 'attrappe';
  // Ohne Konto sagen alle drei dasselbe, und der Bildschirm zeigt den Satz
  // deshalb EINMAL unter der ganzen Gruppe (Ians Entscheidung 50).
  const ohneKonto = 'Kommt mit dem Konto — im Prototyp noch ohne Funktion.';
  // Der leere Satz ist kein Platzhalter: Ein fertiger Weg BRINGT keinen Hinweis
  // mit, und der Bildschirm filtert Leeres weg. Harte Regel 63 — wegräumen, was
  // für die Entscheidung hier nicht nötig ist.
  const fertig = '';

  function anbieter(titel: string, kann: boolean) {
    if (!quelleSteht) return { titel, hinweis: ohneKonto, bereit: false };
    if (!kann) return { titel, hinweis: 'Geht nur in der App am Handy.', bereit: false };
    return { titel, hinweis: fertig, bereit: true };
  }

  switch (weg) {
    case 'apple':
      return anbieter('Weiter mit Apple', lage.apple);
    case 'google':
      return anbieter('Weiter mit Google', lage.google);
    case 'email-code':
    default:
      return {
        titel: 'Mit E-Mail-Code',
        hinweis: quelleSteht ? 'Wir schicken dir eine Zahl, kein Passwort.' : ohneKonto,
        bereit: quelleSteht,
      };
  }
}

/**
 * Wie viele Ziffern der Code aus der Mail hat — **eine Spanne, keine Zahl.**
 *
 * ── Warum das hier steht und nicht als `maxLength={6}` im Screen ─────────────
 * Weil die Zahl gar nicht uns gehört: Supabase lässt sie im Dashboard von **6 bis
 * 10** einstellen (Authentication → Sign In / Providers → Email → „Email OTP
 * Length"). Eine feste 6 im Eingabefeld ist damit eine ANNAHME über eine fremde
 * Einstellung — und am 2026-09-12 war sie falsch.
 *
 * ── Wie sie gescheitert ist, ist der eigentliche Grund für diesen Absatz ─────
 * `maxLength` schneidet **stillschweigend** ab. Ian hat den richtigen Code
 * eingetippt, das Feld hat die letzten Ziffern verworfen, und die App hat ihm
 * gesagt, der Code stimme nicht. **Sie hat ihn für ihren eigenen Fehler
 * beschuldigt** — dieselbe Familie wie „Noch nichts los in deinem Feed" bei einem
 * Netzausfall (Ians Entscheidung 43): ein Satz, der lügt, weil niemand geprüft
 * hat, ob seine Voraussetzung gilt.
 *
 * Deshalb steht `MAX` auf der OBERGRENZE dessen, was Supabase überhaupt schicken
 * kann, und nicht auf dem, was wir erwarten: **Ein zu großzügiges Feld kostet
 * nichts, ein zu kleines verwirft Eingaben.** Geprüft wird die Länge nicht hier,
 * sondern von GoTrue — das ist die einzige Stelle, die den Code wirklich kennt.
 */
export const CODE_MIN = 6;
export const CODE_MAX = 10;

/**
 * Was dasteht, wenn der Code nicht durchgeht — Phase 20.3-b1.
 *
 * ── Warum eine Funktion und nicht ein Satz ───────────────────────────────────
 * Dieselbe Begründung wie bei `ladeFehlerFolgen()` (Ians Entscheidung 43): Ein
 * abgelaufener Code, ein vertippter Code und „du hast es zu oft probiert" sehen für
 * `supabase-js` gleich aus — es gibt `{ error }` zurück, sonst nichts — und führen
 * für den Menschen davor zu **drei verschiedenen nächsten Handlungen**: neu
 * anfordern, genauer hinsehen, warten. Ein einziger Satz („Das hat nicht geklappt")
 * schickt zwei von drei Leuten in die falsche Richtung.
 *
 * **Und genau das ist harte Regel 57 für den Menschen statt für den Prüfstand:**
 * „ist fehlgeschlagen" ist zu wenig, es braucht den Code.
 *
 * Der `code` selbst kommt NIE auf den Bildschirm (die Lehre vom 2026-09-03) — er
 * steht in der Konsole, weil `KontoFehler` ihn trägt.
 */
export function codeFehlerText(code: string): string {
  switch (code) {
    case 'otp_expired':
      return 'Der Code stimmt nicht oder ist abgelaufen. Fordere einen neuen an.';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      // Die Freigrenze von Supabase liegt bei wenigen Mails je Stunde. Das ist kein
      // Fehler, sondern eine Grenze — und sie gehört als solche dagestanden, sonst
      // tippt jemand zehnmal auf einen Knopf, der nichts mehr tun darf.
      return 'Gerade ging es zu schnell hintereinander. Probier es in ein paar Minuten.';
    case 'email_address_invalid':
    case 'validation_failed':
      return 'Die Adresse sieht nicht richtig aus.';
    case 'signup_disabled':
      return 'Neue Konten sind gerade zu.';
    default:
      return 'Das hat gerade nicht geklappt. Prüf dein Netz und probier es noch einmal.';
  }
}
