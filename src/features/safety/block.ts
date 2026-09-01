/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS BEDEUTET „BLOCKIEREN" IN EINER TREFF-APP?
 *  Entschieden von Ian am 2026-09-01 (PLAN.md, Abschnitt 6.7). Die verworfenen
 *  Möglichkeiten bleiben unten stehen — als Gedächtnis, nicht als Einladung.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * In einer App, in der man nur schreibt, ist Blockieren einfach: Nachrichten weg,
 * fertig. SimplySocial führt Leute ZUSAMMEN — deshalb kann ein Block hier etwas
 * treffen, das es in einer Chat-App nicht gibt: eine bestätigte Verabredung. Ein
 * Termin, an dem zwei Menschen an einem Ort auftauchen wollen.
 *
 * Drei Dinge sind bei jeder Antwort gleich, die stehen schon (`safety/hooks.ts`):
 *   · Ihre Posts verschwinden aus meinem Feed, meine aus ihrem.
 *   · Sie kann mich nicht mehr anfragen, ich sie auch nicht.
 *   · Ihr Profil ist erreichbar, zeigt aber nichts mehr von ihr.
 *
 * Offen sind nur die zwei Fragen, die wirklich wehtun: der laufende CHAT und die
 * bestätigte VERABREDUNG.
 *
 * Die drei Möglichkeiten, jeweils mit ihrem Haken:
 *
 *   A. LEISE — nur nichts Neues mehr.
 *      Der Chat bleibt stehen, die Verabredung gilt. Blockieren heißt: „Ich will
 *      nichts Neues mehr von dir." Nichts, was schon vereinbart ist, wird umgeworfen.
 *      Haken: Man blockiert meistens WEGEN etwas, das gerade passiert ist — und das
 *      passiert im Chat. Genau der bleibt dann offen stehen. Wer sich unwohl fühlt,
 *      drückt „Blockieren" und es ändert sich fast nichts.
 *
 *   B. HART — alles weg.
 *      Der Chat verschwindet, die bestätigte Verabredung wird abgesagt, der Platz im
 *      Post wird wieder frei. Ein Knopf, und die Person ist aus meiner App heraus.
 *      Das ist es, was jemand erwartet, der sich bedroht fühlt.
 *      Haken: Blockieren wird zur Abrissbirne. Ein Fehlgriff kostet eine Verabredung,
 *      und die andere Person erlebt es als kommentarlose Absage ohne Grund. Und wer
 *      nur „lass mich in Ruhe" meinte, sagt ungewollt das Tennis am Samstag ab.
 *
 *   C. GETRENNT — blockieren macht stumm, absagen ist ein eigener Knopf.
 *      Der Chat wird stillgelegt: er steht unter „Vorbei", man kann ihn lesen, aber
 *      niemand kann mehr hineinschreiben. Die Verabredung bleibt bestehen — absagen
 *      ist eine zweite, ausdrückliche Entscheidung.
 *      Warum der Chat lesbar bleibt: Wenn jemand einen Grund hat zu blockieren, ist
 *      der Beweis dafür im Chat. Ihn beim Blockieren zu löschen heißt, das Belastende
 *      zu vernichten — das ist genau falsch herum.
 *      Haken: Zwei halbe Zustände. Man muss verstehen, dass „blockiert" nicht
 *      „abgesagt" heißt, sonst steht man am Samstag beim Tennis.
 *
 * ── Ians Entscheidung, 2026-09-01: ALLES WEG. ────────────────────────────────
 * Möglichkeit B. Blockieren ist in dieser App die Notbremse und nicht eine
 * Lautstärkeregelung. Wer sie zieht, will die Person aus seiner App heraus haben —
 * und zwar ganz, nicht zu zwei Dritteln.
 *
 * Das ist die härteste der drei Möglichkeiten, und sie passt zu dem, was diese App
 * von allen anderen unterscheidet: Bei Instagram bedeutet Blockieren, dass jemand
 * meine Bilder nicht mehr sieht. Hier bedeutet es, dass jemand nicht mehr am selben
 * Ort auftaucht wie ich. Eine Verabredung, die man nach einem Block stehen lässt,
 * ist genau das Problem, vor dem der Block schützen soll.
 *
 * **Den Haken hat er in Kauf genommen:** Ein Fehlgriff kostet eine echte
 * Verabredung, und die andere Person erlebt sie als kommentarlose Absage ohne
 * Grund. Sie erfährt nicht, dass sie blockiert wurde — sie sieht nur, dass die
 * Zusage weg ist.
 *
 * Die Oberfläche fängt genau das ab: Blockieren ist die einzige Aktion in
 * SimplySocial neben dem Löschen des Kontos, die NACHFRAGT, bevor sie passiert
 * (`user/[id]/index.tsx`). Und in dieser Rückfrage steht als eigene Zeile, dass eine
 * bestätigte Verabredung abgesagt wird — der Satz kommt aus `blockFolgen()` weiter
 * unten und ändert sich mit der Regel mit, damit dort nie etwas anderes steht, als
 * die App tut.
 *
 * Was der Block NICHT mitnimmt: den Beleg. Der Chat verschwindet, aber eine Meldung
 * (`safety/hooks.ts`) bleibt bestehen — wer erst meldet und dann blockiert, hat den
 * Vorgang bei der Moderation abgelegt, bevor er ihn bei sich wegräumt. Deshalb steht
 * auf dem Melde-Screen der Blockieren-Knopf HINTER dem Melden und nicht davor.
 *
 * Falls sich das im Betrieb beißt, ist die Korrektur ein Wort: `HART` unten gegen
 * `LEISE` oder `GETRENNT` tauschen, beide stehen fertig da. **Nicht ohne Rückfrage.**
 */

/**
 * Was ein Block anfasst — die zwei Dinge, über die die drei Möglichkeiten sich
 * uneinig sind. Alles andere ist bei allen dreien gleich und steht in `hooks.ts`.
 */
export interface BlockWirkung {
  /**
   * `bleibt`      — nichts ändert sich, man kann weiterschreiben.
   * `stillgelegt` — lesbar, aber niemand kann mehr hineinschreiben.
   * `weg`         — der Faden ist aus der Liste verschwunden.
   */
  chat: 'bleibt' | 'stillgelegt' | 'weg';
  /**
   * `bleibt`   — der Termin gilt, absagen muss man selbst.
   * `abgesagt` — die Zusage wird zurückgenommen, der Platz im Post wird frei.
   */
  verabredung: 'bleibt' | 'abgesagt';
}

/** Möglichkeit A: nur nichts Neues mehr. */
export const LEISE: BlockWirkung = { chat: 'bleibt', verabredung: 'bleibt' };

/** Möglichkeit B: alles weg. */
export const HART: BlockWirkung = { chat: 'weg', verabredung: 'abgesagt' };

/** Möglichkeit C: stumm, aber nicht abgesagt. */
export const GETRENNT: BlockWirkung = { chat: 'stillgelegt', verabredung: 'bleibt' };

/**
 * Die Regel, die gilt: Ians Entscheidung vom 2026-09-01 (siehe Kopf dieser Datei).
 *
 * Der Rest der App liest nur diesen einen Wert — `safety/hooks.ts` führt ihn aus,
 * `blockFolgen()` unten schreibt ihn auf.
 */
export const BLOCK_WIRKUNG: BlockWirkung = HART;

/**
 * Der Satz, der beim Blockieren auf dem Bestätigungs-Screen steht.
 *
 * Steht hier neben der Regel und nicht im Screen: Ändert Ian die Regel, ändert sich
 * der Satz mit. Ein Screen, der „Euer Chat verschwindet" behauptet, während die Regel
 * ihn stehen lässt, ist schlimmer als gar kein Satz — er ist ein Versprechen, das
 * die App nicht hält.
 */
export function blockFolgen(wirkung: BlockWirkung = BLOCK_WIRKUNG): string[] {
  const folgen = [
    'Ihr seht die Posts des anderen nicht mehr.',
    'Anfragen sind in beide Richtungen nicht mehr möglich.',
  ];

  if (wirkung.chat === 'weg') folgen.push('Euer Chat verschwindet.');
  if (wirkung.chat === 'stillgelegt')
    folgen.push('Euer Chat bleibt lesbar, aber niemand kann mehr hineinschreiben.');
  if (wirkung.chat === 'bleibt') folgen.push('Euer Chat bleibt, wie er ist.');

  folgen.push(
    wirkung.verabredung === 'abgesagt'
      ? 'Eine bestätigte Verabredung wird abgesagt.'
      : 'Eine bestätigte Verabredung bleibt bestehen — absagen musst du selbst.',
  );

  // Der wichtigste Satz zum Schluss, weil er die Angst wegnimmt, die Leute vom
  // Blockieren abhält: dass der andere es erfährt und darauf reagiert.
  //
  // Unter Ians Regel HART ist er nicht mehr ganz wahr, und deshalb steht er dort auch
  // nicht mehr so da: Wessen Zusage zurückgenommen wird, DER MERKT ETWAS. Nicht was,
  // aber dass. Ein pauschales „erfährt nichts davon" wäre an dieser Stelle die eine
  // Lüge, die man nie bemerkt — man sieht ja nur die eigene Seite.
  folgen.push(
    wirkung.verabredung === 'abgesagt'
      ? 'Dass du blockiert hast, erfährt die Person nicht — nur, dass die Zusage weg ist.'
      : 'Die Person erfährt nichts davon.',
  );

  return folgen;
}
