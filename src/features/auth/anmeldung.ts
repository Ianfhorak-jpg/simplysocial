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
export type Sitzung =
  /** Niemand angemeldet. Ein Screen, der ein Ich braucht, wird gar nicht gezeichnet. */
  | { zustand: 'aus' }
  /** Angemeldet. `ichId` ist eine `User.id`. */
  | { zustand: 'an'; ichId: string };

/**
 * Die Sätze, die die Oberfläche über einen Anmeldeweg sagt — an EINER Stelle.
 *
 * `bereit` sagt, ob der Weg WIRKLICH funktioniert. Er steht hier und nicht im Screen,
 * weil er sich in Phase 20.3-b je Weg einzeln ändert (Apple zuerst, dann Google) —
 * und weil ein Knopf, der nichts tut, ohne diese Auskunft aussieht wie ein Fehler.
 * Dasselbe Muster wie `schreibHuerdeText()` in `chat/direkt.ts`: Steht der Knopf
 * nicht da, steht ein Satz da.
 */
export function anmeldeFolgen(weg: AnmeldeWeg): {
  titel: string;
  hinweis: string;
  bereit: boolean;
} {
  const bereit = ANMELDE_QUELLE !== 'attrappe';
  switch (weg) {
    case 'apple':
      return {
        titel: 'Weiter mit Apple',
        hinweis: bereit ? '' : 'Kommt mit dem Konto — im Prototyp noch ohne Funktion.',
        bereit,
      };
    case 'google':
      return {
        titel: 'Weiter mit Google',
        hinweis: bereit ? '' : 'Kommt mit dem Konto — im Prototyp noch ohne Funktion.',
        bereit,
      };
    case 'email-code':
    default:
      return {
        titel: 'Mit E-Mail-Code',
        hinweis: bereit
          ? 'Wir schicken dir eine Zahl, kein Passwort.'
          : 'Kommt mit dem Konto — im Prototyp noch ohne Funktion.',
        bereit,
      };
  }
}
