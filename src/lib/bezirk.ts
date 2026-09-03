/**
 * Wiener Bezirke.
 *
 * Im Datenmodell steht bewusst NUR die Postleitzahl und nie eine GPS-Koordinate
 * (PLAN.md, Abschnitt 2). Damit daraus keine Fantasiezahl wird, prüft diese Datei,
 * ob es den Bezirk überhaupt gibt.
 */

/**
 * Ist das eine Wiener Bezirks-Postleitzahl? 1010 (1. Bezirk) bis 1230 (23. Bezirk).
 *
 * Die Regel „vierstellig, fängt mit 1 an" würde auch 1000, 1240 und 1234 durchlassen —
 * die gibt es alle nicht. Deshalb steht die Bezirksnummer explizit im Muster.
 */
export function istWienerBezirk(text: string): boolean {
  return /^1(0[1-9]|1\d|2[0-3])0$/.test(text.trim());
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WIE EIN POST OHNE BEZIRK DASTEHT
 *  Ians Entscheidung, 2026-09-02.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Seit der Bezirk beim Posten freiwillig ist, kann `post.district` `null` sein.
 * Angezeigt wird er an sieben Stellen — Feed, Detail, Chat, Anfragen, Treffer,
 * Melden, Vorschau — und ueberall in derselben Form: "1220 Wien".
 *
 * Diese Funktion ist die EINE Stelle, an der entschieden wird, was stattdessen
 * dasteht. Nicht, weil es kompliziert waere, sondern weil sieben Screens sonst
 * sieben Antworten geben: einer schreibt "Wien", einer "—", einer laesst die Zeile
 * ganz weg, und die App wirkt zusammengestueckelt. Genau dafuer gibt es
 * `lib/zeit.ts` schon im selben Ordner.
 *
 * `OHNE_BEZIRK` ist ein Wort zum Aendern. Verworfen wurden:
 *   • `'Ort offen'` — klingt nach einer Luecke, die noch gefuellt wird. Ist sie
 *     aber nicht: Der Poster hat sich entschieden, keinen anzugeben.
 *   • `'Bezirk egal'` — behauptet etwas ueber die Aktivitaet, das niemand gesagt hat.
 *   • `''` (Zeile ganz weg) — dann wandert das Trennzeichen "·" davor ins Leere,
 *     und jeder der sieben Screens muesste das einzeln abfangen.
 *
 * "Wien" gewinnt, weil es als einziges schlicht wahr ist und in dieselbe
 * Zeilenlaenge passt.
 */
const OHNE_BEZIRK = 'Wien';

/** Wo etwas stattfindet: "1220 Wien" — oder "Wien", wenn niemand einen Bezirk nannte. */
export function ortText(district: string | null): string {
  return district ? `${district} Wien` : OHNE_BEZIRK;
}
