import { Platform, StyleSheet, View } from 'react-native';

import { ICONS, STRICH, type IconName } from '@/theme/icons';
import { colors } from '@/theme';

/**
 * Zeichnet ein Icon aus `theme/icons.ts`.
 *
 * ══ Warum hier KEIN `react-native-svg` steht ══════════════════════════════════
 * Der naheliegende Weg wäre `npx expo install react-native-svg`. Dagegen stehen
 * zwei Dinge, und beide sind älter als diese Datei:
 *
 *   · Harte Regel 1 (CLAUDE.md) und PLAN.md, Phase 14, wörtlich: „Kein
 *     Native-Modul, keine Schrift-Icons — gezeichnete Pfade in einer Datei."
 *   · Die ACTA-Falle: Ein Native-Import, der nach dem ersten EAS-Build dazukommt,
 *     lässt den bestehenden Dev-Build sofort abstürzen. Der Prototyp bleibt JS-only,
 *     damit die Web-Version verlässlich läuft — dieselbe Entscheidung wie beim
 *     Konfetti (`Animated` statt einer Native-Lib).
 *
 * Auf Web braucht es die Bibliothek auch gar nicht: `react-dom` rendert ein echtes
 * `<svg>`, und der Prototyp IST eine Webseite — jede Rückmeldung bisher kam aus
 * einem Handy-Browser.
 *
 * ══ Was das für iOS bedeutet — die ehrliche Lücke ═════════════════════════════
 * Auf Native gibt es kein `<svg>`. Diese Datei zeichnet dort einen sichtbaren
 * Platzhalter (Kreis in der Icon-Farbe), KEIN leeres Nichts. Der Unterschied ist
 * Absicht: Ein leerer Platz sieht aus wie Gestaltung, ein Kreis sieht aus wie eine
 * Baustelle. Wer die App zum ersten Mal auf einem Gerät startet, soll das sehen.
 *
 * Der Weg heraus ist EINE Datei, nicht dreißig Screens — das ist der ganze Zweck
 * der Aufteilung in `theme/icons.ts` (Daten) und diese Datei (Zeichnen):
 * beim ersten EAS-Build `npx expo install react-native-svg`, dann hier
 * `<Svg>`/`<Path>` statt `<svg>`/`<path>` — dieselben Pfadstrings, dieselben Props.
 * Kein Screen wird dafür angefasst. Steht so auch in `_FUER_IAN/OFFENE_SACHEN.md`.
 */

export interface SsIconProps {
  name: IconName;
  /** Kantenlänge in Pixeln. Der Strich passt sich an (siehe `strichFuer`). */
  size?: number;
  color?: string;
  /**
   * Nur setzen, wenn das Icon ALLEIN steht und selbst die Bedeutung trägt.
   * Neben einem Text ist es Verzierung und bleibt für Screenreader unsichtbar —
   * sonst liest die Sprachausgabe „Haken, Angefragt" statt „Angefragt".
   */
  titel?: string;
}

/**
 * Wie dick der Strich bei dieser Größe ist.
 *
 * Ohne Anpassung skaliert der Strich mit dem Icon: Bei 14 px wäre er 1,1 Gerätepixel
 * (blass und ausgefranst), bei 44 px 3,5 (fett und plump). Beides fällt an den
 * Rändern des Satzes auf — und der Feed zeigt beide Größen nebeneinander.
 *
 * Die Wurzel gleicht das zur HÄLFTE aus: kleine Icons werden spürbar kräftiger,
 * große bleiben trotzdem großzügiger gezeichnet als kleine. Voll ausgleichen wäre
 * falsch — dann sähe ein 44er-Icon aus wie ein mit der Lupe vergrößertes 14er.
 *
 * Das ist zugleich die Stellschraube für den Haken aus PLAN.md, Phase 14: Wenn die
 * Icons im Feed zu blass wirken, wird HIER gedreht (oder an `STRICH`), nicht an den
 * Emojis.
 */
function strichFuer(size: number): number {
  const BEZUG = 20;
  return STRICH * Math.sqrt(BEZUG / size);
}

export function SsIcon({ name, size = 20, color = colors.ink, titel }: SsIconProps) {
  const form = ICONS[name];
  const breite = strichFuer(size);

  if (Platform.OS !== 'web') {
    // Siehe Dateikopf: sichtbare Baustelle statt stiller Leerstelle.
    return (
      <View
        accessibilityRole={titel ? 'image' : undefined}
        accessibilityLabel={titel}
        style={[styles.nativePlatzhalter, { width: size, height: size, borderColor: color }]}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={breite}
      strokeLinecap="round"
      strokeLinejoin="round"
      // Ohne das schiebt sich das Icon in einer Textzeile auf die Grundlinie und
      // steht dadurch zu tief — im Browser ist ein <svg> ein Inline-Element.
      style={{ display: 'block', flexShrink: 0 }}
      role={titel ? 'img' : undefined}
      aria-hidden={titel ? undefined : true}
      aria-label={titel}>
      {form.striche.map((d, i) => (
        <path key={`s${i}`} d={d} />
      ))}
      {'flaechen' in form
        ? (form.flaechen as readonly string[]).map((d, i) => (
            <path key={`f${i}`} d={d} fill={color} stroke="none" />
          ))
        : null}
    </svg>
  );
}

const styles = StyleSheet.create({
  nativePlatzhalter: { borderWidth: 1.5, borderRadius: 999, opacity: 0.5 },
});
