import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { SsIcon } from './SsIcon';

import { zurueckOderFeed } from '@/lib/navigation';
import { colors, spacing } from '@/theme';

/** Apples Mindestmaß für eine Trefferfläche. Kein gerundeter Wert, sondern die Zahl
 *  aus den Human Interface Guidelines — deshalb steht sie hier benannt und nicht
 *  als 44 mitten im Style. */
const TREFFER = 44;
/** So groß ist der Pfeil selbst. Der Rest der 44 pt ist Luft. */
const PFEIL = 22;

/**
 * Der Zurück-Knopf. Es gibt genau diesen einen.
 *
 * ── Warum als Baustein und nicht als drei Zeilen im Screen ────────────────────
 * In CLAUDE.md steht die Regel „Zurück-Knöpfe nehmen `zurueckOderFeed()`, nie blankes
 * `router.back()`" — und sie ist schon einmal gebrochen worden (Phase 2, `bausteine.tsx`
 * hatte einen toten Knopf). Eine Regel, an die man sich erinnern muss, wird irgendwann
 * gebrochen. Ein Baustein, den man einfach nimmt, nicht.
 *
 * Kopfzeile von React Navigation wäre die Alternative, sieht aber auf Web und iOS
 * unterschiedlich aus — deshalb ist sie in `app/_layout.tsx` abgeschaltet und jeder
 * Screen setzt seine eigene.
 *
 * ── Seit Phase 19f: nur noch der Pfeil (Ians Entscheidung 52) ─────────────────
 * Das Wort „Zurück" ist weg. Es stand auf jedem Screen der App und hat nie etwas
 * gesagt, das der Pfeil nicht schon sagt — harte Regel 63 in ihrer einfachsten
 * Anwendung. Am Post-Screen war es sogar mehr als überflüssig: Dort standen
 * „Zurück", die Kategorie und der Titel untereinander, und Ians Satz dazu war
 * *„Sport, Zurück, Sport, Tennis spielen — alles untereinander."*
 *
 * **Der Preis ist die Trefferfläche, und der ist bezahlt.** Ein Pfeil allein ist
 * schmaler als Pfeil-plus-Wort — aus rund 90 × 26 pt wären 22 × 22 geworden, also
 * ein Viertel von Apples Mindestmaß. Deshalb ist die Fläche ausdrücklich 44 × 44,
 * und der Pfeil sitzt darin **links oben ausgerichtet statt zentriert**: So bleibt
 * er in einer Flucht mit dem Inhalt darunter, und die zusätzliche Fläche wächst
 * nach rechts und unten, wo Platz ist. Ein zentrierter Pfeil hätte einen negativen
 * Rand gebraucht — und negative Ränder gegen den Seitenrand von `SsScreen` sind in
 * diesem Projekt schon einmal schiefgegangen (Phase 12).
 *
 * `label` gibt es weiter, aber nur noch für VoiceOver. Ein Knopf ohne Namen ist
 * dort ein Knopf ohne Funktion.
 */
export function SsBack({ label = 'Zurück', style }: { label?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      onPress={zurueckOderFeed}
      accessibilityRole="button"
      accessibilityLabel={label}
      // Nach links und oben ist die Fläche zu Ende, weil dort der Seitenrand des
      // Screens beginnt. `hitSlop` holt genau diesen Streifen zurück — auf Native.
      // Im Browser ist es wirkungslos (react-native-web setzt es nicht um), dort
      // trägt allein die echte Fläche.
      hitSlop={{ left: spacing.lg, top: spacing.sm }}
      style={({ pressed }) => [styles.knopf, pressed && styles.gedrueckt, style]}>
      <View style={styles.pfeil}>
        <SsIcon name="pfeilLinks" size={PFEIL} color={colors.ink} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  knopf: {
    alignSelf: 'flex-start',
    width: TREFFER,
    height: TREFFER,
    justifyContent: 'center',
    cursor: 'pointer',
  },
  // Links bündig, nicht zentriert — siehe Kopfkommentar.
  pfeil: { width: PFEIL, height: PFEIL, alignItems: 'flex-start', justifyContent: 'center' },
  gedrueckt: { opacity: 0.6 },
});
