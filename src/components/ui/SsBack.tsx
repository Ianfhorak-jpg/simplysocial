import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { SsText } from './SsText';

import { zurueckOderFeed } from '@/lib/navigation';
import { colors, spacing } from '@/theme';

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
 */
export function SsBack({ label = 'Zurück', style }: { label?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      onPress={zurueckOderFeed}
      accessibilityRole="button"
      style={({ pressed }) => [styles.knopf, pressed && styles.gedrueckt, style]}>
      <SsText variant="label" color={colors.inkSoft}>
        ← {label}
      </SsText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  knopf: { alignSelf: 'flex-start', paddingVertical: spacing.xs, cursor: 'pointer' },
  gedrueckt: { opacity: 0.6 },
});
