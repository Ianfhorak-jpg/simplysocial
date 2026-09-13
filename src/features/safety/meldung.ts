/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WIE SCHNELL WIRD AUF EINE MELDUNG REAGIERT?
 *  Entschieden von Ian am 2026-09-13 (Entscheidung 59, PLAN.md Abschnitt 6).
 *  Die verworfenen Möglichkeiten bleiben unten stehen — als Gedächtnis, nicht als
 *  Einladung.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Apple verlangt für nutzergenerierte Inhalte (Richtlinie 1.2) ausdrücklich
 * *„timely responses to concerns"*. Das ist keine Zahl, die man sich aussucht, um
 * gut dazustehen — es ist eine Zusage, die in den Nutzungsbedingungen steht und
 * die ein Reviewer liest. **Eine Zusage, die man bricht, ist schlechter als eine
 * vorsichtigere.**
 *
 * Die vier Möglichkeiten, jeweils mit ihrem Haken:
 *
 *   A. 24 STUNDEN für alles.
 *      Apples Erwartung, die stärkste Antwort im Review.
 *      Haken: Jemand muss JEDEN Tag nachsehen — am Wochenende, in der Schulwoche,
 *      in den Ferien. Vier 16-Jährige, und niemand wird benachrichtigt.
 *
 *   B. 48 STUNDEN für alles.
 *      Haltbar auch in einer vollen Woche, immer noch eine klare Zahl.
 *      Haken: Bei `gefahr` sind zwei Tage lang — und das ist ausgerechnet der
 *      Grund, bei dem jemand sofort hinschauen müsste.
 *
 *   C. NACH GRUND GETEILT — 24 h bei Gefahr und Belästigung, 48 h sonst. ← GEWÄHLT
 *      Die Zusage hängt an dem, worum es geht. Spam kann warten, „ich fühle mich
 *      unsicher" nicht. Ehrlich, begründbar, und haltbar.
 *      Haken: zwei Zahlen im Rechtstext statt einer — und die Einteilung muss im
 *      Werkzeug SICHTBAR sein, sonst ist sie nur eine Behauptung. Genau deshalb
 *      sortiert `npm run meldungen` nach Fälligkeit und nicht nach Datum.
 *
 *   D. KEINE ZAHL — „so schnell wie möglich".
 *      Nichts, was man brechen kann.
 *      Haken: die schwächste Antwort auf Apples Frage, und sie kann eine Ablehnung
 *      kosten. Eine Zusage ohne Zahl ist keine Zusage.
 *
 * ── Warum das hier steht und nicht in der Migration ──────────────────────────
 * Dieselbe Bauart wie `safety/block.ts` (harte Regel 17), `groups/gruppe.ts` (32),
 * `requests/kollision.ts` (46), `posts/standort.ts` (68), `auth/anmeldung.ts` (69),
 * `data/quelle.ts` (76), `auth/konto.ts` (78), `data/schreiben.ts` (84) und
 * `social/bild.ts` (88). **ZWEI ganz verschiedene Stellen lesen diese Regel:** der
 * Befehl am Mac (`npm run meldungen`, Ians Entscheidung 58) und der Bildschirm in
 * der App (`/nutzungsbedingungen`). Stünde die Zahl an beiden Stellen getippt,
 * verspräche die App eines Tages etwas anderes, als das Werkzeug misst — und
 * gemerkt hätte es niemand.
 *
 * **Das ist im Kleinen genau das, was am 2026-09-06 im Großen passiert ist:** Der
 * Lösch-Screen versprach seit Phase 7 im JSX etwas, das die Regel nie tat (PLAN.md
 * 20.1/20.2, Punkt 7). Ein getippter Satz wandert nicht mit.
 *
 * ── Diese Datei hat KEINE Laufzeit-Importe, und das ist Absicht ──────────────
 * Nur `import type`. Nach `tsc` bleibt in der .js-Datei kein einziger Import übrig,
 * also läuft sie in blankem Node — ohne Expo, ohne Metro, ohne React. Genau darauf
 * steht `scripts/meldungen.mjs`: derselbe Code, den die App ausführt, und nicht
 * eine Nachbildung davon (die Lehre aus `40_uebersetzung.sh`).
 */

import type { ReportReason } from '@/types/models';

/**
 * Die Gründe, bei denen die Zusage 24 Stunden ist.
 *
 * `gefahr` steht in BEIDEN Listen von `config/melden.ts` („Könnte gefährlich
 * werden" an einem Post, „Ich fühle mich unsicher" an einem Menschen);
 * `belaestigung` gibt es nur an Menschen, und das ist richtig — ein Post
 * belästigt niemanden über Wochen, ein Mensch schon.
 *
 * ⚠️ **Wer hier einen Grund ergänzt, verschärft eine Zusage in Ians Namen** — die
 * Zahl steht in den Nutzungsbedingungen. Nicht ohne Rückfrage.
 */
export const DRINGENDE_GRUENDE: readonly ReportReason[] = ['gefahr', 'belaestigung'];

/** Ians Entscheidung 59, in Stunden. */
export const FRIST_STUNDEN = { dringend: 24, gewoehnlich: 48 } as const;

export function istDringend(grund: ReportReason): boolean {
  return DRINGENDE_GRUENDE.includes(grund);
}

export function fristStunden(grund: ReportReason): number {
  return istDringend(grund) ? FRIST_STUNDEN.dringend : FRIST_STUNDEN.gewoehnlich;
}

/**
 * Wann eine Meldung spätestens bearbeitet sein muss — als ISO-Zeitpunkt.
 *
 * Gerechnet wird über `Date`, verglichen wird danach als TEXT (`localeCompare`),
 * wie überall sonst in dieser App. Deshalb muss die Ausgabe dieselbe Schreibweise
 * haben wie alles andere — harte Regel 72, dieselbe Falle wie `zeitpunkt()` in
 * `data/zeilen.ts`: Postgres liefert `+01:00`, die App schreibt `…Z`, und als Text
 * ist derselbe Augenblick dann einmal „früher" und einmal „später".
 */
export function fristEndeAm(erstelltAm: string, grund: ReportReason): string {
  const ms = new Date(erstelltAm).getTime() + fristStunden(grund) * 3600_000;
  return new Date(ms).toISOString();
}

/**
 * Der Satz, der in den Nutzungsbedingungen steht — und der einzige Ort, an dem er
 * steht. Er nennt die Zahlen, statt sie zu umschreiben: „zeitnah" ist genau die
 * Formulierung, die Möglichkeit D war.
 */
export function zusageText(): string {
  return (
    `Wir sehen uns jede Meldung an. Geht es um Gefahr oder Belästigung, ` +
    `innerhalb von ${FRIST_STUNDEN.dringend} Stunden — bei allem anderen ` +
    `innerhalb von ${FRIST_STUNDEN.gewoehnlich} Stunden.`
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DIE LAGE EINER MELDUNG
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Was mit einer Meldung los ist.
 *
 * Vier davon sind offensichtlich. Das fünfte — `'spaet-erledigt'` — ist die
 * eigentliche Frage dieser Datei, siehe `meldungLage()`.
 */
export type MeldungsLage =
  | 'offen' // liegt da, Frist läuft noch
  | 'faellig' // weniger als ein Viertel der Frist übrig
  | 'ueberfaellig' // die Zusage ist gebrochen, und sie liegt immer noch da
  | 'erledigt' // innerhalb der Zusage bearbeitet
  | 'spaet-erledigt'; // bearbeitet, aber zu spät

/** Ab wann `'faellig'` gilt — ein Viertel der Frist vor Schluss. */
export const WARNUNG_ANTEIL = 0.25;

/**
 * TODO(Ian) — hier fehlt deine Entscheidung, und sie ist keine Formsache.
 *
 * ── Die Frage ────────────────────────────────────────────────────────────────
 * Eine Meldung wegen `gefahr` kommt am Freitagabend. Niemand sieht sie. Am
 * Montag, nach 62 Stunden, wird sie bearbeitet. **Was steht danach in der Liste?**
 *
 *   A. `'erledigt'` — erledigt ist erledigt.
 *      Die Liste bleibt ruhig, man sieht nur, was noch zu tun ist.
 *      Haken: Das Werkzeug kann dann NIE sagen „wir haben unsere Zusage diesen
 *      Monat viermal gebrochen". Und genau diese Zahl ist die, auf die es
 *      ankommt — gegenüber Apple, und gegenüber den Leuten, denen wir 24 Stunden
 *      versprochen haben. Eine Zusage, deren Bruch sich selbst aufräumt, ist
 *      keine.
 *
 *   B. `'spaet-erledigt'` — die Verspätung bleibt stehen.
 *      Man kann sie zählen, und beim nächsten Mal weiß man, ob 24 Stunden
 *      realistisch waren oder ob die Zahl zu ändern ist.
 *      Haken: Eine abgehakte Sache steht dauerhaft als Vorwurf in der Liste. Bei
 *      vier Gründern, die das nebenbei machen, kann das mutlos machen — und eine
 *      Liste, die nur noch aus Vorwürfen besteht, sieht irgendwann niemand mehr an.
 *
 * ── Wo du schreibst ──────────────────────────────────────────────────────────
 * Genau in dieser Funktion, in dem markierten Zweig — fünf bis zehn Zeilen. Alles
 * andere steht schon: `fristEndeAm()` sagt dir, wann Schluss war, und
 * `erledigtAm` sagt dir, wann es wirklich passiert ist. Zwei Zeitpunkte
 * vergleichen, mehr ist es nicht.
 *
 * ⚠️ Was DRIN steht, ist ein **Platzhalter, keine Entscheidung** — dieselbe
 * Unterscheidung wie bei `SPERR_ANTWORT` in `geraet-bauen.sh` und bei
 * `zaehltAlsTermin()`. Er tut heute A, damit `npm run meldungen` läuft.
 */
export function meldungLage(
  erstelltAm: string,
  grund: ReportReason,
  erledigtAm: string | null,
  jetzt: string,
): MeldungsLage {
  const schluss = fristEndeAm(erstelltAm, grund);

  if (erledigtAm !== null) {
    // ▼▼▼ HIER SCHREIBT IAN ▼▼▼
    return 'erledigt';
    // ▲▲▲ Platzhalter: tut heute A. ▲▲▲
  }

  if (jetzt.localeCompare(schluss) >= 0) return 'ueberfaellig';

  // Das letzte Viertel der Frist. Gerechnet wird ab dem ENDE rückwärts, nicht ab
  // dem Anfang vorwärts — sonst hätte eine 24-Stunden-Meldung eine andere
  // Warnspanne als eine 48-Stunden-Meldung, obwohl beide „gleich knapp" sind.
  const warnAb = new Date(
    new Date(schluss).getTime() - fristStunden(grund) * WARNUNG_ANTEIL * 3600_000,
  ).toISOString();
  return jetzt.localeCompare(warnAb) >= 0 ? 'faellig' : 'offen';
}
