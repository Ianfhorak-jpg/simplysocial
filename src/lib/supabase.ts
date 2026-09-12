/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DIE LEITUNG — Phase 20.4-b, erweitert in 20.3-b1
 *  Die einzige Datei, die einen Supabase-Client baut.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Harte Regel 1 sagt seit dem ersten Tag: *kein Netzwerk im Prototyp.* Diese Datei
 * hebt sie nicht auf, sie macht sie schaltbar — und der Schalter ist genau EINER,
 * siehe `ANMELDE_QUELLE` in `features/auth/anmeldung.ts`. Solange er auf
 * `'attrappe'` steht, wird hier **kein Client gebaut und kein Byte gesendet**; die
 * öffentliche Adresse bleibt, was sie war.
 *
 * ── Warum der Client NICHT beim Laden entsteht ────────────────────────────────
 * `createClient()` beim Import würde die Leitung auch dann aufbauen, wenn die App
 * gar nicht aus Supabase liest. Das ist dieselbe Sorte Fehler wie ein
 * `requireNativeViewManager` beim Laden (harte Regel 61): Ein Nebeneffekt beim
 * IMPORT trifft jeden, der die Datei anfasst, nicht nur den, der sie benutzt.
 *
 * ── `persistSession` stand bis 20.3-b1 auf `false`, und warum es jetzt `true` ist ─
 * Der Satz hier lautete: *eine gespeicherte Sitzung braucht einen Speicher, den es
 * auf Native ohne einen NATIVEN Baustein nicht gibt.* Die erste Hälfte stimmt, die
 * Folgerung war zu grob — **nachgesehen in `GoTrueClient.js` statt vermutet**:
 * `auth-js` sucht sich seinen Speicher selbst und fällt ohne `localStorage` STILL
 * auf einen Speicher im Arbeitsspeicher zurück. Es stürzt nicht ab, es warnt nicht.
 *
 * Also kostet `true` keinen Pod und keinen Build, und **der Preis ist halbiert statt
 * beseitigt**: Im Browser überlebt die Sitzung das Neuladen, am iPhone nicht. Die
 * zweite Hälfte gehört zu 20.3-b2, wo `expo-secure-store` und `AsyncStorage` mit den
 * anderen beiden Bausteinen in EINEN Build gehen. Einzelheiten stehen unten am Feld.
 *
 * ── Die Falle bei `EXPO_PUBLIC_*` ────────────────────────────────────────────
 * Metro ersetzt `process.env.EXPO_PUBLIC_FOO` **textuell beim Bauen**. Es gibt zur
 * Laufzeit kein `process.env`, in dem man nachschlagen könnte:
 *
 *     process.env.EXPO_PUBLIC_SUPABASE_URL        ✅ wird ersetzt
 *     process.env['EXPO_PUBLIC_' + 'SUPABASE_URL'] ❌ bleibt `undefined`
 *
 * Deshalb stehen beide Namen unten AUSGESCHRIEBEN und werden nicht gerechnet.
 *
 * ── Der anon key ist kein Geheimnis, und das muss man aussprechen ─────────────
 * Er landet zwangsläufig im gebauten Bundle — jeder, der die App hat, kann ihn
 * lesen. Das ist kein Versäumnis, sondern das Modell: **Was er darf, entscheiden
 * die 33 Policies in `supabase/migrations/0002_policies.sql`, nicht seine
 * Geheimhaltung.** Er steht trotzdem in `.env` und nicht im Code, weil ein Wert im
 * Quelltext beim nächsten Projekt mitwandert und niemand merkt, dass er zu
 * tauschen wäre.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { ANMELDE_QUELLE } from '@/features/auth/anmeldung';

/**
 * Woher die Daten kommen — **ABGELEITET, nicht danebengeschrieben.**
 *
 * Der naheliegende Entwurf wäre ein zweiter Schalter `DATEN_QUELLE` neben
 * `ANMELDE_QUELLE` gewesen. Von den vier Kombinationen funktionieren aber nur
 * zwei, und die beiden anderen scheitern **stumm**:
 *
 *   | Anmeldung  | Daten    |                                                    |
 *   |------------|----------|----------------------------------------------------|
 *   | attrappe   | mock     | ✅ der Prototyp, wie an allen Tagen davor           |
 *   | supabase   | supabase | ✅ das Ziel                                          |
 *   | attrappe   | supabase | ❌ kein Token → die Policies lassen **0 Zeilen** durch. |
 *   |            |          |    Sieht aus wie „die Datenbank ist leer".          |
 *   | supabase   | mock     | ❌ `ichId` ist eine Supabase-UUID, die in `mock.ts` |
 *   |            |          |    niemanden findet.                                |
 *
 * Ein Schalter, der einen unmöglichen Zustand DARSTELLEN kann, ist derselbe
 * Fehler wie `visibility: 'group'` mit `groupId: null` (harte Regel 31) — nur an
 * einer Stelle, an der kein Compiler hinsieht. Also gibt es ihn nicht: Die
 * Datenquelle IST die Anmeldequelle, gelesen an einer Stelle.
 */
export const LIEST_AUS_SUPABASE = ANMELDE_QUELLE === 'supabase';

/**
 * Die zwei Werte aus `.env`, ausgeschrieben (siehe „Falle" im Kopf).
 *
 * Sie stehen hier als Konstanten und nicht in `client()`, damit `fehlendeZugaenge()`
 * sie prüfen kann, OHNE eine Leitung aufzubauen.
 */
const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Fehlt etwas, um überhaupt loszulegen? Gibt die Namen zurück, nicht die Werte.
 *
 * **Der Grund, warum das eine eigene Funktion ist:** Eine fehlende `.env` ergibt
 * sonst einen Client mit `undefined` als Adresse, und der scheitert erst bei der
 * ERSTEN Abfrage — mit einer Netzwerkmeldung, die aussieht wie ein Serverproblem.
 * Dieselbe Familie wie `PGCONNECT_TIMEOUT` in `db-url.sh`: „keine Meldung" ist
 * schlimmer als „falsche Meldung".
 */
export function fehlendeZugaenge(): string[] {
  const fehlt: string[] = [];
  if (!URL) fehlt.push('EXPO_PUBLIC_SUPABASE_URL');
  if (!ANON_KEY) fehlt.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  return fehlt;
}

let zwischengespeichert: SupabaseClient | null = null;

/**
 * Die Leitung — gebaut beim ERSTEN Aufruf, danach dieselbe.
 *
 * Warum nur einmal: Jeder Client bringt einen eigenen Realtime-Kanal mit. Zwei
 * Clients hießen zwei WebSockets auf dieselbe Datenbank, und ein `aendern()` käme
 * doppelt an — eine Sorte Fehler, die man erst bei vielen Daten bemerkt.
 */
export function client(): SupabaseClient {
  if (zwischengespeichert) return zwischengespeichert;

  const fehlt = fehlendeZugaenge();
  if (fehlt.length > 0) {
    throw new Error(
      `Supabase-Zugang fehlt: ${fehlt.join(', ')}. ` +
        'Erzeugen mit `npm run anon-key` — die Vorlage steht in .env.example.',
    );
  }

  zwischengespeichert = createClient(URL as string, ANON_KEY as string, {
    auth: {
      // ── Seit 20.3-b1 `true` — und das kostet trotzdem KEINEN neuen Build ─────
      // `auth-js` sucht sich seinen Speicher selbst: Gibt es `localStorage`
      // (Browser), benutzt es das; gibt es keines (React Native), fällt es
      // **still auf einen Speicher im Arbeitsspeicher zurück** — nachgesehen in
      // `GoTrueClient.js`, nicht vermutet. Es stürzt also nicht ab und warnt
      // nicht, die Sitzung überlebt auf Native nur den Neustart nicht.
      //
      // **Damit ist der Preis genau halbiert statt beseitigt**, und die zweite
      // Hälfte gehört weiter zu 20.3-b2: Erst `expo-secure-store` bzw.
      // `AsyncStorage` machen daraus auch am iPhone eine gespeicherte Sitzung.
      // Genau das ist der Grund, warum die vier nativen Bausteine dort zusammen
      // in EINEN Build gehen und nicht einzeln hier.
      persistSession: true,
      autoRefreshToken: true,
      // Bleibt aus: Ians Anmeldeweg ist eine ZAHL, kein Link (`anmeldeFolgen`
      // sagt es wörtlich — „Wir schicken dir eine Zahl, kein Passwort"). `true`
      // würde bei jedem Seitenaufruf die Adresse nach Token durchsuchen und ist
      // für einen Weg da, den es hier nicht gibt.
      detectSessionInUrl: false,
    },
  });
  return zwischengespeichert;
}
