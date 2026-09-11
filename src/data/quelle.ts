/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS DASTEHT, WENN DIE DATEN NICHT KOMMEN
 *  Phase 20.4-b. Ians 43. Entscheidung, vom 2026-09-12.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Dieselbe Bauart wie `safety/block.ts` (harte Regel 17), `groups/gruppe.ts` (32),
 * `requests/kollision.ts` (46), `posts/standort.ts` (68) und
 * `auth/anmeldung.ts` (69): Screens lesen `LADE_FEHLER` nie, sie sehen nur das
 * Ergebnis, und die Sätze kommen aus `ladeFehlerFolgen()`.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DIE FRAGE — und warum sie überhaupt eine ist
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * `supabase-js` WIRFT NICHT. Es gibt `{ data, error }` zurück, und `data` ist im
 * Fehlerfall `null`. Der naheliegende Griff `data ?? []` macht aus **jedem**
 * Fehler — Netz weg, Token abgelaufen, Tabelle umbenannt — eine leere Liste. Und
 * eine leere Liste sagt in dieser App:
 *
 *     „Noch nichts los in deinem Feed"
 *
 * Das ist ein Satz, der lügt. **„Hier ist nichts" und „ich komme nicht dran" sind
 * zwei Lagen, und nur eine davon kann man beheben.** Dieselbe Familie wie der
 * unsichtbare Startbildschirm vom 2026-09-11 (weißes Logo auf Papierweiß): Ein
 * Fehler, der nur als ABWESENHEIT auftritt, überlebt jeden Typecheck und jeden
 * grünen Lauf, weil niemand hinsehen muss.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DREI MÖGLICHKEITEN — Ians Wahl ist A
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   A. VOLLBILD-KASTEN mit „Nochmal versuchen"  ← **seine Wahl**
 *      Die App zeigt keinen Feed, sondern sagt, was los ist. Unübersehbar, und
 *      der Ausweg steht daneben.
 *      **Der Haken, den er kennt:** Wer im U-Bahn-Tunnel aufmacht, sieht von der
 *      App gar nichts — auch nicht die Chats, die er vorhin gelesen hat. Das wird
 *      erst mit einem Speicher besser (20.3-b bringt `expo-secure-store` und
 *      `AsyncStorage` mit), und dann ist B die naheliegende Nachbesserung.
 *
 *   B. LEISE ZEILE über dem Feed  (verworfen)
 *      Näher an Entscheidung 50 — der Bildschirm bleibt der, weswegen man
 *      gekommen ist. Verloren hat sie an ihrer eigenen Stärke: Ein LEERER Feed
 *      mit einem schmalen Streifen darüber sieht auf den ersten Blick immer noch
 *      aus wie „nichts los", und genau das soll er nicht.
 *
 *   C. RÜCKFALL AUF `mock.ts`  (gar nicht erst angeboten, und der Grund gehört
 *      aufgeschrieben)
 *      Technisch der bequemste Weg — und der einzige, der WIRKLICH schadet: Er
 *      zeigt einem echten Menschen erfundene Leute mit erfundenen Verabredungen,
 *      ohne dass irgendwo steht, dass sie erfunden sind. Harte Regel 12 verbietet
 *      Persönliches in den Fake-Daten; hier wäre die Fälschung die Funktion.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS DER TEXT NICHT SAGEN DARF
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Keinen Tabellennamen, keinen Fehlercode, keinen Pfad. Am 2026-09-03 stand eine
 * Entwickler-Notiz im gerenderten Text der Nutzungsbedingungen, auf einer
 * öffentlich abrufbaren Adresse — in einem Kommentar sind Backticks Konvention,
 * in JSX-Text sind sie ein sichtbarer Fehler. **Der `code` gehört in die Konsole
 * (`LadeFehler` trägt ihn), nicht auf den Bildschirm.**
 */

import type { LadeFehler } from '@/data/laden';

/**
 * Ians 43. Entscheidung. Nicht ohne Rückfrage ändern.
 *
 * Steht auf `'vollbild'`, weil ein leerer Feed und ein kaputter Feed nicht gleich
 * aussehen dürfen. `'zeile'` ist die Nachbesserung, sobald es etwas zu zeigen gibt,
 * was schon da war — also NACH 20.3-b, nicht vorher (siehe Kopf, Möglichkeit A).
 */
export const LADE_FEHLER: 'vollbild' | 'zeile' = 'vollbild';

/**
 * Was auf dem Bildschirm steht, wenn nichts kommt.
 *
 * ── Warum das eine Funktion ist und keine drei Konstanten ────────────────────
 * Weil ein Fall anders lautet als die anderen, und man ihn NICHT verwechseln darf:
 * `42501` heißt, dass die Datenbank den Zugriff verweigert hat — die Policies haben
 * getan, wofür sie da sind, und die Ursache ist fast immer eine abgelaufene
 * Anmeldung. „Prüf dein Internet" wäre dort falsch beraten und schickt jemanden
 * eine Viertelstunde zum Router.
 *
 * Dieselbe Unterscheidung, die harte Regel 57 von einer PRÜFUNG verlangt („ist
 * fehlgeschlagen" ist zu wenig, es braucht den `SQLSTATE`) — hier für den Menschen
 * davor statt für den Prüfstand.
 */
export function ladeFehlerFolgen(fehler: LadeFehler): {
  titel: string;
  text: string;
  knopf: string;
  /** `true`, wenn ein neuer Versuch die Lage gar nicht ändern kann. */
  anmeldenNoetig: boolean;
} {
  if (fehler.code === '42501' || fehler.code === 'PGRST301') {
    return {
      titel: 'Du bist nicht mehr angemeldet',
      text: 'Melde dich noch einmal an, dann ist alles wieder da.',
      knopf: 'Anmelden',
      anmeldenNoetig: true,
    };
  }
  return {
    titel: 'Keine Verbindung',
    text: 'Wir kommen gerade nicht an deine Aktivitäten. Das liegt meistens am Netz.',
    knopf: 'Nochmal versuchen',
    anmeldenNoetig: false,
  };
}
