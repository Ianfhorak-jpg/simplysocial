import { BEZIRKE, KARTE_BREITE, KARTE_HOEHE, PROJEKTION } from '@/data/wien-bezirke';
import { ringeAus } from './karte-treffer';

/**
 * Zwischen dem Raster der Bezirksflächen und der Erde.
 *
 * ── Wozu es diese Datei seit Phase 19d gibt ───────────────────────────────────
 * Bis 19c gab es EINEN Kartenzeichner, und der zeichnete das Raster direkt in ein
 * SVG — Längen- und Breitengrade kamen nie vor. Seit Ians Entscheidung 35 liegt auf
 * iOS eine echte Apple-Karte darunter, und MapKit kennt nur Geo-Koordinaten.
 *
 * ── Warum umgerechnet und nicht ein zweites Mal gespeichert wird ──────────────
 * Die naheliegende Lösung wäre gewesen, `scripts/bezirke-bauen.py` die Punkte
 * ZUSÄTZLICH in Grad ausgeben zu lassen. Dann stünde dieselbe Geometrie zweimal in
 * derselben Datei, in zwei Einheiten — und die zweite wäre die, die beim nächsten
 * Skriptlauf oder beim nächsten Handgriff still veraltet. Dieselbe Sorte Doppelung
 * wie `landing/stil.css` gegen `theme/colors.ts` (harte Regel 13), nur hier
 * vermeidbar: Die Projektion des Skripts ist flach mit Kosinus-Korrektur und damit
 * **exakt umkehrbar**. Vier Zahlen (`PROJEKTION`) ersetzen 886 Punkte.
 *
 * ── Was diese Datei NICHT tut ─────────────────────────────────────────────────
 * Sie rechnet nichts auf den SCHIRM. Wo ein Bezirk gerade zu sehen ist, hängt an
 * der Karte, die ihn zeigt — das beantwortet jeder Zeichner für sich (auf iOS
 * `pointForCoordinate` von MapKit). Hier steht nur, wo er auf der ERDE liegt, und
 * das ist auf jeder Plattform dieselbe Antwort.
 */

/** Ein Punkt auf der Erde. Absichtlich so benannt wie MapKits `LatLng`. */
export interface GeoPunkt {
  latitude: number;
  longitude: number;
}

const { lon0, lat1, k, massstab } = PROJEKTION;

/**
 * Rasterstelle → Ort auf der Erde. Die Umkehrung der Rechnung in
 * `scripts/bezirke-bauen.py`:
 *
 *     x = (lon − lon0) · k · massstab        y = (lat1 − lat) · massstab
 *
 * `y` wächst nach UNTEN (Bildschirm-Sitte), die Breite nach oben — daher das Minus.
 */
export function nachGeo(x: number, y: number): GeoPunkt {
  return {
    longitude: lon0 + x / (k * massstab),
    latitude: lat1 - y / massstab,
  };
}

/**
 * Ort auf der Erde → Rasterstelle. Gebraucht für den Treffer-Test: Ein Tipp auf die
 * Apple-Karte kommt als Koordinate herein, und `bezirkAn()` rechnet im Raster.
 *
 * **Das ist der Grund, warum der Treffer-Test auf beiden Plattformen derselbe
 * bleibt** — die Begründung dafür steht im Kopf von `karte-treffer.ts` und gilt
 * unverändert: Ein Test, den einmal der Browser und einmal MapKit beantwortet, sind
 * zwei Antworten auf dieselbe Frage.
 */
export function nachRaster(p: GeoPunkt): { x: number; y: number } {
  return {
    x: (p.longitude - lon0) * k * massstab,
    y: (lat1 - p.latitude) * massstab,
  };
}

/**
 * Ganz Wien, in der Form, die MapKit für einen Ausschnitt erwartet.
 *
 * Die Deltas sind die volle Spanne des Rasters — also genau das Bild, das die
 * gezeichnete Karte im Ruhezustand zeigt. Damit fangen beide Zeichner beim selben
 * Ausschnitt an, und „Ganz Wien" bedeutet auf beiden dasselbe.
 */
export const WIEN_REGION = {
  latitude: nachGeo(KARTE_BREITE / 2, KARTE_HOEHE / 2).latitude,
  longitude: nachGeo(KARTE_BREITE / 2, KARTE_HOEHE / 2).longitude,
  latitudeDelta: KARTE_HOEHE / massstab,
  longitudeDelta: KARTE_BREITE / (k * massstab),
};

/** Ein Bezirk als Geo-Polygone. Mehrere Ringe kommen vor, sobald der Generator ein
 *  Multipolygon liefert (heute hat kein Wiener Bezirk eines). */
export interface BezirkGeo {
  plz: string;
  nr: number;
  /** Der Beschriftungspunkt aus `wien-bezirke.ts`, umgerechnet. */
  mitte: GeoPunkt;
  /**
   * Sein Abstand zum Rand, **in Rastereinheiten** — bewusst NICHT umgerechnet.
   *
   * Die Frage, für die er da ist, lautet „passt die Zahl in die Fläche?", und die
   * beantwortet man in Bildpunkten. Der Weg dorthin führt über den Maßstab der
   * gerade sichtbaren Karte, den nur der Zeichner kennt. Ein Radius in Metern wäre
   * eine dritte Einheit, die niemand braucht.
   */
  radius: number;
  ringe: GeoPunkt[][];
}

/**
 * Alle 23 Bezirke in Geo-Koordinaten — **einmal beim Laden** gerechnet, wie die
 * Punktlisten in `karte-treffer.ts`. Es sind 886 Punkte; das kostet weniger als das
 * Zeichnen eines einzigen Bildes.
 */
export const BEZIRKE_GEO: readonly BezirkGeo[] = BEZIRKE.map((b) => ({
  plz: b.plz,
  nr: b.nr,
  mitte: nachGeo(b.label.x, b.label.y),
  radius: b.label.r,
  ringe: ringeAus(b.d).map((ring) => {
    const punkte: GeoPunkt[] = [];
    for (let i = 0; i < ring.length; i += 2) punkte.push(nachGeo(ring[i], ring[i + 1]));
    return punkte;
  }),
}));
