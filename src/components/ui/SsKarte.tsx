import { SsWienKarte } from './SsWienKarte';
import type { SsKarteProps } from './karte-typen';

/**
 * Die Karte — welchen Zeichner der Screen bekommt, entscheidet die Plattform.
 *
 * **Diese Datei ist die WEB-Fassung** (`SsKarte.native.tsx` daneben ist die für
 * iOS). Sie zeichnet die eigene Karte aus Phase 19b.
 *
 * ── Warum im Browser (noch) keine Apple-Karte steht ───────────────────────────
 * MapKit JS wird nicht mit einem einfachen Schlüssel freigeschaltet, sondern mit
 * einem **signierten Token, das ablaufen soll**. Eines, das ein Jahr gilt und im
 * Quelltext einer öffentlich abrufbaren Seite steht, ist genau die Sorte
 * Schlüssel-im-Code, die die erste harte Regel des Projekts verbietet. Sauber
 * ausgestellt wird es von einer kleinen Serverfunktion — **und einen Server gibt es
 * ab Phase 20.** Bis dahin ist das hier kein Notbehelf, sondern die Bauart:
 * `SsWienKarte` ist das Netz unter 19d, und deshalb ist 19b nicht weggeworfen.
 *
 * ── Warum überhaupt eine Datei dafür ──────────────────────────────────────────
 * Der Screen soll nicht wissen, welche Karte er bekommt. Stünde die Wahl bei ihm,
 * stünde sie beim nächsten Screen noch einmal — und beim übernächsten anders.
 */
export function SsKarte(props: SsKarteProps) {
  return <SsWienKarte {...props} />;
}
