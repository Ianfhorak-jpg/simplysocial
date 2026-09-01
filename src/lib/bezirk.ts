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
