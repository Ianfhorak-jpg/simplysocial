import { istVorbei, startText, uhrzeit } from '@/lib/zeit';
import type { Post } from '@/types/models';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  ZWEI SACHEN GLEICHZEITIG — WAS TUT DIE APP DAGEGEN?
 *  Entschieden von Ian am 2026-09-05 (PLAN.md, Abschnitt 6, Punkte 31–33).
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Leopold beim Benutzen am 2026-09-03: *„nicht 2 Sachen gleichzeitig."* Bis heute
 * prüfte das nichts. Man konnte um 17:00 beim Tennis zusagen und um 17:15 beim
 * Kaffee — und musste dann einem von beiden absagen. Das ist genau die Enttäuschung,
 * an der sich so eine App herumspricht: jemand kommt nicht.
 *
 * ── Die drei Möglichkeiten ────────────────────────────────────────────────────
 *
 *   A. WARNEN, ABER DURCHLASSEN
 *      Über dem Knopf steht, womit es sich beißt. Tippen kann man trotzdem.
 *      Haken: Wer den Hinweis wegklickt, sagt am Ende trotzdem ab — die App hat
 *      dann nur gesagt, dass sie es kommen sah.
 *
 *   B. HART SPERREN
 *      Der Knopf ist aus. Niemand kann sich doppelt verabreden.
 *      Haken: Die App weiß nicht, wie lange etwas dauert (siehe unten) — sie würde
 *      also nach einer GESCHÄTZTEN Stunde etwas verbieten, das in Wirklichkeit
 *      vielleicht gut zusammengeht. Ein Verbot auf einer Schätzung ist zu hart.
 *      Und manchmal will man wirklich beides und sagt eines rechtzeitig ab.
 *
 *   C. NUR DER POSTER SIEHT ES
 *      Anfragen geht wie immer; wer bestätigt, liest „Sara ist um die Zeit schon
 *      woanders" und entscheidet.
 *      Haken: Damit verrät die App Saras Pläne an jemanden, den sie nichts angehen —
 *      auch Pläne aus privaten Gruppen und aus Posts nur für Follower. Das ist
 *      derselbe Fehler wie der Gründername an einer privaten Gruppe (Phase 18a),
 *      nur schlimmer, weil er hier eingebaut wäre statt vergessen.
 *
 * ── Ians Entscheidung, 2026-09-05: A, WARNEN. ────────────────────────────────
 * Die App sagt, was sie weiß, und lässt den Menschen entscheiden. Sie weiß es
 * nämlich nur ungefähr: Ein Post hat eine Startzeit und KEINE Dauer.
 *
 * Das ist der eigentliche Grund gegen B — nicht Bequemlichkeit. Eine Sperre
 * behauptet Gewissheit; das Fenster unten ist eine Schätzung.
 *
 * ── Der Haken, den Ian dabei kennt ───────────────────────────────────────────
 * Wer die Warnung wegklickt, ist trotzdem doppelt verabredet. Die App verhindert
 * das nicht, sie macht es nur sichtbar. Falls sich das im Betrieb beißt, ist der
 * Wechsel EIN Wort: `DOPPEL_REGEL`. Alle drei Regeln stehen fertig da.
 * **Nicht ohne Rückfrage ändern.**
 */

/** Was passiert, wenn sich zwei Termine überschneiden. */
export type DoppelRegel = 'warnen' | 'sperren' | 'nur-poster';

/**
 * Ians Entscheidung 31 vom 2026-09-05 (siehe Kopf dieser Datei).
 *
 * Der Rest der App liest nur diesen Wert — `doppelHinweisText()` schreibt ihn auf
 * und `sperrtDoppelbuchung()` führt ihn aus.
 */
export const DOPPEL_REGEL: DoppelRegel = 'warnen';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS HEISST „GLEICHZEITIG", WENN ES KEINE DAUER GIBT?
 *  Ians Entscheidung 32 vom 2026-09-05: EINE STUNDE.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Ein `Post` hat `startsAt` und sonst nichts über die Zeit. „Überschneidung" ist
 * damit kein Fakt, den die Daten hergeben, sondern eine Festlegung. Drei standen
 * zur Wahl:
 *
 *   60 Minuten   — Tennis 17:00 und Kaffee 17:45 beißen sich, Kino um 19:00 nicht.
 *   120 Minuten  — vorsichtiger, warnt aber oft ohne Not. Eine Warnung, die man
 *                  dauernd wegklickt, liest nach der dritten niemand mehr — und
 *                  dann ist auch die richtige weg.
 *   Eigenes Feld `dauerMinuten` am Post — ehrlich statt geschätzt. Verworfen, weil
 *                  Phase 12 den Erstellen-Screen gerade auf zwei Felder leergeräumt
 *                  hat (harte Regel 18) und alte Posts keins hätten. Das wäre der
 *                  Weg, wenn sich 60 Minuten im Betrieb als zu grob erweisen — dann
 *                  fällt hier eine Konstante weg und ein Feld kommt dazu.
 *
 * **Es ist eine ANZEIGE-Regel, keine Prüfung** — wie `MINDESTALTER` in
 * `config/alter.ts`. Wer sich doppelt verabreden will, kann es.
 */
export const KOLLISION_FENSTER_MIN = 60;

/**
 * Ians Entscheidung 33 vom 2026-09-05: Die Regel gilt auch beim SELBST-Posten.
 *
 * Doppelbuchung ist Doppelbuchung, egal von welcher Seite man hineinläuft — und
 * weil es dieselbe Funktion ist, kostet die zweite Stelle fast nichts. Der
 * Erstellen-Screen zeigt den Hinweis in der Vorschau (harte Regel 18: dort steht
 * ohnehin, was die Voreinstellungen gesetzt haben).
 *
 * Verworfen: nur beim Anfragen. Das Argument dafür war, dass ein eigener Post noch
 * keine Verabredung ist — es kann ja niemand kommen. Genau das steht jetzt in
 * `zaehltAlsTermin()` unten, an der richtigen Stelle: Ob ein eigener Post zählt,
 * ist eine Frage an den Post, nicht an den Screen.
 */
export const PRUEFT_BEIM_POSTEN = true;

// ── Die Regel ausführen ──────────────────────────────────────────────────────

/**
 * Beißen sich diese zwei Zeitpunkte?
 *
 * Verglichen werden ABSOLUTE Zeitpunkte, nicht Uhrzeiten: „heute 17:00" und
 * „morgen 17:15" liegen 24 Stunden auseinander und beißen sich nicht. Ein
 * Vergleich über `uhrzeit()` hätte hier eine Kollision gemeldet — die Sorte
 * Fehler, die man nur an einem Tag im Test sieht und nie am eigenen Gerät.
 */
export function kollidiert(aISO: string, bISO: string): boolean {
  const abstandMin = Math.abs(new Date(aISO).getTime() - new Date(bISO).getTime()) / 60_000;
  return abstandMin < KOLLISION_FENSTER_MIN;
}

/**
 * Meine Rolle bei einem Termin, der im Weg stehen könnte.
 *
 *   'gastgeber' — ich habe den Post geschrieben.
 *   'zugesagt'  — ich habe angefragt und der Verfasser hat bestätigt.
 *
 * Eine bloß GESCHICKTE Anfrage ist keine der beiden und taucht hier nie auf: Sie
 * ist noch keine Verabredung, sondern eine Frage. Wer auf drei Sachen anfragt und
 * eine Zusage bekommt, hat nichts falsch gemacht.
 */
export type TerminRolle = 'gastgeber' | 'zugesagt';

/** Ein Termin, der einer neuen Zusage im Weg stehen könnte. */
export interface Termin {
  post: Post;
  rolle: TerminRolle;
  /**
   * Hat bei diesem Post wirklich schon jemand zugesagt?
   *
   * Bei `rolle: 'zugesagt'` immer `true` — ich bin ja der Zusagende. Bei
   * `rolle: 'gastgeber'` ist es die Frage, ob außer mir jemand kommt.
   */
  jemandDabei: boolean;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  TODO IAN — WAS ZÄHLT ALS „SCHON VERABREDET"?
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Die Frage ist beim Bauen aufgetaucht und stand in keinem Plan. Sie entscheidet,
 * wie oft die Warnung überhaupt kommt:
 *
 *   a) `return true;`
 *      Alles zählt — auch ein eigener Post, bei dem noch niemand zugesagt hat.
 *      Streng und einfach zu erklären. Haken: Wer sich am Sonntag drei Sachen
 *      hintereinander ausdenkt und postet, wird ab dem zweiten gewarnt, obwohl
 *      noch gar nichts feststeht.
 *
 *   b) `return t.rolle === 'zugesagt';`
 *      Nur, wo ich selbst zugesagt habe. Am leisesten. Haken: Der eigene Post ist
 *      auch eine Verabredung, sobald jemand kommt — und ausgerechnet dort wäre die
 *      Warnung still.
 *
 *   c) `return t.rolle === 'zugesagt' || t.jemandDabei;`
 *      Ein eigener Post zählt erst, wenn wirklich jemand dabei ist. Haken: eine
 *      Bedingung mehr, die man erklären muss, wenn jemand fragt „warum warnt es
 *      hier und dort nicht?"
 *
 * Schreib die eine Zeile, die du willst, hin — und den Grund als Kommentar
 * darüber, so wie in den anderen Regel-Dateien.
 */
export function zaehltAlsTermin(t: Termin): boolean {
  // TODO Ian: eine der drei Zeilen von oben.
  return t.rolle === 'zugesagt' || t.jemandDabei;
}

/**
 * Sperrt die Regel die Zusage, oder warnt sie nur?
 *
 * Unter Ians Regel immer `false`. Die Funktion steht trotzdem da, damit ein
 * Wechsel auf `'sperren'` wirklich ein Wort ist und kein Umbau — dieselbe Bauart
 * wie `darfSchreiben()` in `chat/direkt.ts`.
 */
export function sperrtDoppelbuchung(): boolean {
  return DOPPEL_REGEL === 'sperren';
}

/**
 * Der Satz, der über dem Knopf steht. `undefined` heißt: kein Hinweis.
 *
 * Steht hier neben der Regel und nicht im Screen — dieselbe Überlegung wie bei
 * `blockFolgen()` und `schreibHuerdeText()`: Ändert Ian die Regel, ändert sich der
 * Satz mit. Ein Screen, der etwas anderes behauptet, als die App prüft, ist
 * schlimmer als gar kein Hinweis.
 *
 * Genannt wird der TITEL des anderen Termins und seine Zeit, nicht die Person:
 * Woran man einen eigenen Termin wiedererkennt, ist die Sache — dieselbe
 * Überlegung wie in der Chat-Liste (Phase 18c, Ians Entscheidung 29).
 */
export function doppelHinweisText(kollisionen: Termin[]): string | undefined {
  const erster = kollisionen[0];
  if (!erster) return undefined;

  const wann = istVorbei(erster.post.startsAt)
    ? `seit ${uhrzeit(erster.post.startsAt)}`
    : startText(erster.post.startsAt).toLowerCase();

  const satz =
    erster.rolle === 'gastgeber'
      ? `Du hast „${erster.post.title}“ ${wann} selbst gepostet.`
      : `Du bist ${wann} schon bei „${erster.post.title}“.`;

  // Mehr als zwei nennt niemand namentlich — die Zahl reicht, und der Hinweis
  // bleibt einzeilig.
  if (kollisionen.length > 1) {
    const rest = kollisionen.length - 1;
    return `${satz} Und ${rest === 1 ? 'noch etwas' : `noch ${rest} Sachen`} um die Zeit.`;
  }
  return satz;
}
