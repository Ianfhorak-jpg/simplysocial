import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { categoryColors, colors, radius, spacing } from '@/theme';
import type { ActivityCategory } from '@/types/models';

export interface SsCardProps {
  children: ReactNode;
  /** Färbt den Streifen am linken Rand. Ohne Angabe: Karte ohne Streifen. */
  category?: ActivityCategory;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Die weiße Fläche, auf der im Feed alles sitzt.
 *
 * Der Farbstreifen links ist bewusst das EINZIGE, was die Kategorie in der Karte
 * einfärbt. Eine komplett kategoriefarbige Karte würde bei zehn Posts untereinander
 * zu einem Flickenteppich — der schmale Streifen reicht völlig, um beim Scrollen
 * "Sport" von "Kaffee" zu unterscheiden.
 *
 * Karten bekommen ausdrücklich KEINE Tiefe wie die Buttons. Wenn im Feed alles
 * hervorsteht, sticht nichts mehr hervor; die Tiefe bleibt den Aktionen vorbehalten.
 */
export function SsCard({ children, category, onPress, style }: SsCardProps) {
  const inhalt = (gedrueckt: boolean) => (
    <View style={[styles.card, gedrueckt && styles.pressed, style]}>
      {category ? (
        <View style={[styles.stripe, { backgroundColor: categoryColors[category].base }]} />
      ) : null}
      <View style={styles.body}>{children}</View>
    </View>
  );

  if (!onPress) return inhalt(false);

  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.pressable}>
      {({ pressed }) => inhalt(pressed)}
    </Pressable>
  );
}

const STRIPE_WIDTH = 6;

const styles = StyleSheet.create({
  pressable: { cursor: 'pointer' },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.72 },
  stripe: { width: STRIPE_WIDTH },
  body: { flex: 1, padding: spacing.lg, gap: spacing.sm },
});
