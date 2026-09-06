import { Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { ICONS, STRICH, type IconName } from '@/theme/icons';
import { colors } from '@/theme';

/**
 * Zeichnet ein Icon aus `theme/icons.ts`.
 *
 * ══ Warum hier seit Phase 19 `react-native-svg` steht ═════════════════════════
 * Bis zum 2026-09-06 stand an dieser Stelle das Gegenteil: kein Native-Modul, und
 * auf iOS ein sichtbarer Platzhalter-Kreis. Beides war richtig, solange der
 * Prototyp eine Webseite war — und beides ist mit dem ersten EAS-Build hinfällig.
 *
 * Die Begründung von damals kippt nicht, sie läuft ab. Harte Regel 1 („kein
 * Native-Modul") gilt dem PROTOTYP, damit die Web-Version verlässlich läuft; die
 * ACTA-Falle („ein Native-Import nach dem Build lässt den Dev-Build abstürzen")
 * gilt allem, was NACH einem Build dazukommt. Deshalb steht dieser Tausch VOR dem
 * ersten Build und nicht danach — PLAN.md, Phase 19.3.
 *
 * ══ Warum der Web-Zweig trotzdem bleibt ═══════════════════════════════════════
 * `react-native-svg` kann auch Web. Es ersatzlos für beide Seiten zu nehmen wäre
 * weniger Code — und würde die eine Fassung anfassen, die seit vier Wochen läuft
 * und die alle Rückmeldungen geliefert hat. `react-dom` zeichnet dort ein echtes
 * `<svg>`; es gibt nichts zu gewinnen und eine laufende Seite zu verlieren.
 *
 * Was die beiden Zweige verbindet, ist wichtiger als dass es zwei sind: Sie lesen
 * DIESELBEN Pfadstrings aus `theme/icons.ts` und setzen dieselben Werte. Ein neues
 * Icon kommt weiter in EINE Datei, und kein Screen wird angefasst — das war der
 * ganze Zweck der Trennung von Daten und Zeichner.
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
  const flaechen = 'flaechen' in form ? (form.flaechen as readonly string[]) : [];

  if (Platform.OS !== 'web') {
    return (
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={breite}
        strokeLinecap="round"
        strokeLinejoin="round"
        // Ohne `accessible={false}` liest VoiceOver auf iOS jedes Icon einzeln vor,
        // auch das neben einem Text — dasselbe „Haken, Angefragt", gegen das oben
        // schon `titel` gebaut ist. Auf Web erledigt das `aria-hidden`.
        accessible={titel ? true : false}
        accessibilityRole={titel ? 'image' : undefined}
        accessibilityLabel={titel}>
        {form.striche.map((d, i) => (
          <Path key={`s${i}`} d={d} />
        ))}
        {flaechen.map((d, i) => (
          <Path key={`f${i}`} d={d} fill={color} stroke="none" />
        ))}
      </Svg>
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
      {flaechen.map((d, i) => (
        <path key={`f${i}`} d={d} fill={color} stroke="none" />
      ))}
    </svg>
  );
}
