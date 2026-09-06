import { BEZIRKE } from '@/data/wien-bezirke';

/**
 * Welcher Bezirk liegt unter diesem Punkt?
 *
 * ── Warum das in JavaScript passiert und nicht im SVG ─────────────────────────
 * Beide Zeichner können es von selbst: Im Browser hat ein `<path>` ein `onClick`,
 * und `react-native-svg` kennt `onPress` an einem `<Path>`. Beides ist hier
 * unbrauchbar, und zwar aus demselben Grund, aus dem harte Regel 15 existiert:
 * Über der ganzen Karte liegt ein `PanResponder` fürs Schieben und Zoomen. Wer den
 * Responder hat, bekommt die Berührung — ein `onPress` am Kind feuert daneben oder
 * gar nicht, je nach Plattform. **Tipp und Zug gehören in EINE Hand**, also
 * entscheidet der Erkenner beim Loslassen selbst, und dafür braucht er diese Datei.
 *
 * Der Nebengewinn ist, dass die Antwort auf beiden Plattformen dieselbe ist. Ein
 * Treffer-Test, den einmal der Browser und einmal iOS beantwortet, ist zwei
 * Antworten auf dieselbe Frage — dieselbe Sorte Falle wie zwei Leer-Zustände
 * übereinander (2026-09-03).
 *
 * Die Pfade werden **einmal beim Laden** in Punktlisten zerlegt. Es sind 886 Punkte
 * über alle 23 Bezirke — der Test kostet damit weniger als das Zeichnen eines
 * einzigen Bildes, und niemand muss über Kosten nachdenken.
 */

interface Flaeche {
  plz: string;
  ringe: number[][];
}

/**
 * Zerlegt einen erzeugten Pfad in Ringe.
 *
 * Das geht nur, weil `scripts/bezirke-bauen.py` genau EINE Form schreibt:
 * `M x,y x,y … Z`, gegebenenfalls mehrfach hintereinander. Ein allgemeiner
 * SVG-Parser (Kurven, relative Befehle, Kurzschreibweisen) wäre hundertmal so groß
 * und würde eine Freiheit abdecken, die die erzeugte Datei nie benutzt. **Wer den
 * Generator ändert, ändert diese Funktion mit** — deshalb steht der Hinweis in
 * beiden Dateien.
 *
 * ── Warum sie seit Phase 19d exportiert ist ───────────────────────────────────
 * `lib/karte-geo.ts` braucht dieselben Punktlisten, nur in Längen- und Breitengraden
 * statt im Raster. Ein zweiter Parser daneben wäre die zweite Fassung DERSELBEN
 * Auskunft — genau das, was `PROJEKTION` in `wien-bezirke.ts` bei den Punkten
 * vermeidet. Dass die Funktion in dieser Datei wohnt und nicht in `karte-geo.ts`,
 * hat einen schlichten Grund: Hier war sie zuerst, und sie ist hier auch dann noch
 * richtig, wenn es die Apple-Karte einmal nicht mehr gibt.
 */
export function ringeAus(d: string): number[][] {
  const ringe: number[][] = [];
  for (const teil of d.split('M')) {
    if (!teil) continue;
    const zahlen: number[] = [];
    for (const paar of teil.replace(/Z/g, '').trim().split(' ')) {
      const [x, y] = paar.split(',');
      if (x === undefined || y === undefined) continue;
      zahlen.push(Number(x), Number(y));
    }
    if (zahlen.length >= 6) ringe.push(zahlen);
  }
  return ringe;
}

const FLAECHEN: readonly Flaeche[] = BEZIRKE.map((b) => ({ plz: b.plz, ringe: ringeAus(b.d) }));

/**
 * Liegt der Punkt in dieser Fläche? Strahlensatz-Test: Man zählt, wie oft ein
 * Strahl nach links die Kanten kreuzt — ungerade heißt drinnen.
 *
 * Über ALLE Ringe gezählt und nicht ring-für-ring: Damit heben sich Löcher von
 * selbst auf. Wien hat heute keine, aber der Generator kann welche liefern (der
 * 1. Bezirk hätte eines, wenn man ihn je aus dem 2. ausstanzt), und ein Test, der
 * bei Löchern still falsch antwortet, ist schlimmer als einer, der sie nicht kennt.
 */
function drinnen(ringe: number[][], x: number, y: number): boolean {
  let treffer = false;
  for (const ring of ringe) {
    for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
      const xi = ring[i];
      const yi = ring[i + 1];
      const xj = ring[j];
      const yj = ring[j + 1];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) treffer = !treffer;
    }
  }
  return treffer;
}

/**
 * Der Bezirk unter dem Punkt — oder `null`, wenn dort Umland ist.
 *
 * `null` ist ein gültiges Ergebnis und kein Fehler: Wien ist nicht rechteckig, in
 * den Ecken der Karte liegt Niederösterreich. Ein Tipp dorthin **hebt die Auswahl
 * auf**; der Screen entscheidet das, nicht diese Datei.
 *
 * Die Koordinaten sind Einheiten des Rasters aus `data/wien-bezirke.ts`
 * (0 … `KARTE_BREITE`), nicht Bildpunkte. Das Umrechnen macht der, der die
 * Bildschirmgröße kennt — hier gibt es keine.
 */
export function bezirkAn(x: number, y: number): string | null {
  for (const f of FLAECHEN) if (drinnen(f.ringe, x, y)) return f.plz;
  return null;
}
