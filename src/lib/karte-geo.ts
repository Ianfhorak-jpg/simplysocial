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

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WIE WEIT ZWEI BEZIRKE AUSEINANDERLIEGEN — Phase 19h
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Seit Ians Entscheidung 63 bestimmt die Entfernung die Reihenfolge im Feed. Die
 * Regel dazu steht in `features/posts/sort.ts`; hier steht nur die Rechnung, denn
 * „wie weit ist das?" ist eine Frage an die Erde und keine an den Feed.
 *
 * ── Warum das fast geschenkt ist ──────────────────────────────────────────────
 * `PROJEKTION` trägt die Kosinus-Korrektur bereits IN sich (`k`). Im Raster ist ein
 * Schritt nach rechts damit genauso lang wie einer nach unten — die Fläche ist
 * winkeltreu genug, dass `Math.hypot` reicht. Mit rohen Längen- und Breitengraden
 * ginge das nicht: 0,01° Länge sind in Wien nur 74 % von 0,01° Breite, und es
 * bräuchte die Haversine-Formel. **Der Umweg über das Raster ist hier der kürzere.**
 *
 * ── Was als „Mitte" eines Bezirks gilt ────────────────────────────────────────
 * Der Beschriftungspunkt (`label`), also der Punkt mit dem größten Abstand zum
 * Rand. Nicht der Schwerpunkt — und das ist ein Vorteil: Bei den gebogenen Bezirken
 * (13., 21., 22.) liegt der Schwerpunkt teilweise gar nicht IN der Fläche (Lehre
 * aus 19b), und eine Entfernung, gemessen ab einem Punkt im Nachbarbezirk, wäre
 * eine falsche Auskunft. Genauigkeit ist trotzdem keine zu erwarten: **Das ist eine
 * Übersichtskarte, keine Vermessung** — die Antwort auf „ist das bei mir um die
 * Ecke oder am anderen Ende der Stadt?" trägt sie, mehr nicht.
 *
 * ── Die bekannte Schwäche, nachgemessen und angenommen ────────────────────────
 * Bei den großen Flächenbezirken liegt der innerste Punkt im Grünen und nicht dort,
 * wo Leute wohnen: Hietzings Mitte sitzt im Lainzer Tiergarten, und von Neubau aus
 * kommen dadurch **8,7 km** heraus — vom Bahnhof Hietzing wären es rund 5. Der 13.,
 * 21., 22. und 23. werden also systematisch zu weit gemessen.
 *
 * **Angenommen, weil die Zahl nirgends steht.** Sie geht ausschließlich in eine
 * REIHENFOLGE ein (`sort.ts`), und die Ordnung stimmt trotzdem: Hietzing ist von
 * Neubau aus wirklich weiter weg als die Josefstadt, egal ob 5 oder 8,7 km. Sobald
 * eine Entfernung ANGEZEIGT werden soll („4 km entfernt"), ist dieser Absatz die
 * Stelle, an der jemand zuerst nachrechnen muss — dann trägt die Zahl plötzlich ein
 * Versprechen, das sie heute nicht abgibt.
 */

/** Meter je Breitengrad. Auf der Kugel überall gleich, anders als beim Längengrad. */
const METER_JE_GRAD = 111_320;

/**
 * Wie viele Meter eine Rastereinheit ist — rund **29 m**.
 *
 * (Der erzeugte Kopf von `wien-bezirke.ts` sagt „rund 20 m"; das ist eine grobe
 * Angabe aus dem Skript. Gerechnet: 111 320 / 3793,17 = 29,3. Nachprüfbar an der
 * Kartenhöhe — 776,7 Einheiten sind 22,8 km, und Wien ist von Nord nach Süd
 * tatsächlich rund 22,4 km lang.)
 */
export const METER_JE_EINHEIT = METER_JE_GRAD / massstab;

/** plz → Mitte im Raster. Einmal beim Laden gebaut, wie `BEZIRKE_GEO` unten. */
const MITTEN = new Map(BEZIRKE.map((b) => [b.plz, b.label]));

/**
 * Luftlinie zwischen zwei Bezirksmitten, in Metern — oder **null**, wenn eine der
 * beiden Postleitzahlen kein Wiener Bezirk ist.
 *
 * `null` und nicht `Infinity`: Ein unbekannter Bezirk ist keine große Entfernung,
 * sondern eine fehlende Auskunft. Was daraus folgt, entscheidet der Aufrufer —
 * `sort.ts` tut das sichtbar über `OHNE_BEZIRK_POSITION`.
 */
export function bezirksAbstandMeter(a: string, b: string): number | null {
  const pa = MITTEN.get(a);
  const pb = MITTEN.get(b);
  if (!pa || !pb) return null;
  return Math.hypot(pa.x - pb.x, pa.y - pb.y) * METER_JE_EINHEIT;
}

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
