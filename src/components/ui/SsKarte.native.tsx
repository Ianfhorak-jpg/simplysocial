import { SsAppleKarte } from './SsAppleKarte.native';
import type { SsKarteProps } from './karte-typen';

/**
 * Die Karte — welchen Zeichner der Screen bekommt, entscheidet die Plattform.
 *
 * **Diese Datei ist die NATIVE Fassung** (`SsKarte.tsx` daneben ist die fürs Web).
 * Auf iOS liegt seit Phase 19d eine echte Apple-Karte darunter, Ians Entscheidung 35.
 *
 * ── Warum die Wahl hier steht und nicht als `Platform.OS` im Zeichner ─────────
 * Ein Zweig in EINER Datei würde `react-native-maps` auch ins Web-Bündel
 * importieren, wo es MapKit nicht gibt. Die Dateiendung ist der einzige Weg, an dem
 * eine Bibliothek gar nicht erst mitreist — deshalb liegt die Trennung hier oben,
 * an der dünnsten Stelle, und nicht mitten im Zeichnen.
 *
 * **Auf Android bleibt es bei der gezeichneten Karte**: Dort wäre der Anbieter
 * Google, und eine App, die auf dem iPhone Apple und auf Android Google zeigt, hat
 * zwei Gesichter. Android steht ohnehin nicht auf dem Weg (PLAN.md, Phase 21).
 */
export function SsKarte(props: SsKarteProps) {
  return <SsAppleKarte {...props} />;
}
