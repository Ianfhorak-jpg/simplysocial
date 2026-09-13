/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DER MERKER — „das hat die Person schon gesehen" · Web-Zweig
 *  Ians Entscheidung 57 (2026-09-13). Nicht ohne Rückfrage ändern.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Ein Ja/Nein je Schlüssel, mehr nicht. Heute hängt genau eine Sache daran — die
 * Anleitungskarte im Wischstapel (`ss_anleitung_weg`) —, und trotzdem steht es in
 * einer eigenen Datei statt zweimal kopiert in zwei Komponenten: Bis zum
 * 2026-09-13 gab es die Funktion WIRKLICH zweimal, in `WischStapel.tsx` und in
 * `PrototypHinweis.tsx`, Zeile für Zeile gleich. Genau davor warnt harte Regel 13.
 *
 * ── Der Punkt, um den es geht, und er ist ABSICHT ────────────────────────────
 * **Derselbe Aufruf bedeutet auf den zwei Plattformen Verschiedenes**, und das ist
 * keine Ungenauigkeit, sondern Ians Entscheidung 57:
 *
 *   Web (hier)      `sessionStorage` — gilt für den Tab, Neuladen eingeschlossen.
 *                   Wer in drei Wochen wiederkommt, hat die Wischgeste vergessen,
 *                   und dann DARF die Karte noch einmal kommen. Das ist die alte
 *                   Begründung aus Phase 8; sie stimmt im Browser weiter.
 *   Gerät (.native) `AsyncStorage` — für immer. Dort gibt es keine Tab-Sitzung:
 *                   Jedes Öffnen der App wäre eine neue, und die Karte stünde bei
 *                   JEDEM Start im Weg. Genau das nennt `PrototypHinweis.tsx` in
 *                   seinem eigenen Kopf „eine Wand vor jeder Sitzung".
 *
 * ⚠️ **Und der Preis daran ist benannt:** Am Gerät gilt die Drei-Wochen-Überlegung
 * nicht mehr. Wer die App einen Monat nicht aufmacht, hat die Geste genauso
 * vergessen — bekommt die Karte aber nie wieder. Ian hatte die Wahl zwischen
 * „für immer" und „bei jedem Start"; ein Mittelweg („nach 30 Tagen wieder") lag
 * ihm nicht vor und wäre eine eigene Entscheidung, kein Fix.
 *
 * ── Warum Plattform-ENDUNG und kein `Platform.OS`-Zweig ─────────────────────
 * Dieselbe Begründung wie bei `sitzungsspeicher.ts`, `SsGlas` (harte Regel 61) und
 * `SsKarte` (52): `AsyncStorage` wird beim LADEN nativ. Ein Zweig in EINER Datei
 * zöge es ins Web-Bündel, wo es nichts zu suchen hat. Und ein `await import(…)`
 * wäre hier die Falle aus Phase 19h-2 — ein nachgeladener Brocken für einen
 * Speicherzugriff, der beim App-Start gebraucht wird.
 *
 * ── Warum das Ergebnis ein `Promise` ist, obwohl der Browser sofort antwortet ─
 * Weil der andere Zweig es nicht kann. Eine Signatur, die auf einer Plattform
 * synchron ist und auf der anderen nicht, wäre zwei Funktionen mit einem Namen.
 */

/** Der Merker im Arbeitsspeicher — er gilt auf BEIDEN Plattformen und geht vor. */
const imLauf = new Set<string>();

/**
 * Wurde das hier schon weggeklickt?
 *
 * **Ein Speicher, der nicht antwortet, gilt als „noch nicht gesehen".** Das ist
 * der Bestand seit Phase 8 und bleibt es: Im privaten Modus wirft schon der
 * Zugriff. Die Folge ist eine Karte, die man noch einmal wegwischt — die
 * Gegenrichtung wäre ein Erstnutzer, der die Geste nie erklärt bekommt, und das
 * ist der teurere der beiden Fehler.
 */
export async function merkerGesehen(schluessel: string): Promise<boolean> {
  if (imLauf.has(schluessel)) return true;
  try {
    return window.sessionStorage.getItem(schluessel) === '1';
  } catch {
    return false;
  }
}

/** Ab jetzt gesehen. Der Aufrufer wartet nicht — ein Merker ist nichts, was fehlschlägt. */
export async function merkerSetzen(schluessel: string): Promise<void> {
  imLauf.add(schluessel);
  try {
    window.sessionStorage.setItem(schluessel, '1');
  } catch {
    // Privater Modus. `imLauf` reicht, solange die Seite nicht neu lädt.
  }
}
