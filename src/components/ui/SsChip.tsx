import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { SsIcon } from './SsIcon';
import { SsText } from './SsText';

import { CATEGORIES } from '@/config/categories';
import { categoryColors, colors, radius, spacing } from '@/theme';
import type { ActivityCategory } from '@/types/models';

interface SsChipBase {
  /** Ausgewählt — für die Filterleiste im Feed. */
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Entweder eine Kategorie (Label, Icon und Farbe kommen dann automatisch) oder
 * eine freie Beschriftung wie "1220" oder "Alle". Beides gleichzeitig ergibt keinen
 * Sinn, deshalb schließt der Typ es aus.
 */
type SsChipContent =
  | { category: ActivityCategory; label?: never }
  | { label: string; category?: never };

export type SsChipProps = SsChipBase & SsChipContent;

/** Die kleine Pille: Kategorie am Post, Filter über dem Feed, Bezirk und Uhrzeit. */
export function SsChip({ category, label, selected, onPress, style }: SsChipProps) {
  const meta = category ? CATEGORIES[category] : null;
  const palette = category ? categoryColors[category] : null;

  const flaeche: ViewStyle = palette
    ? { backgroundColor: selected ? palette.base : palette.soft, borderColor: selected ? palette.base : 'transparent' }
    : { backgroundColor: selected ? colors.ink : colors.surface, borderColor: selected ? colors.ink : colors.line };

  // Auf der hellen Pillenfläche braucht es die abgedunkelte Variante: das Gelb von
  // Sport käme auf seinem eigenen Hellton nur auf 1,85:1 und wäre unlesbar.
  const textFarbe = palette
    ? selected
      ? palette.onBase
      : palette.onSoft
    : selected
      ? colors.surface
      : colors.inkSoft;

  const inhalt = (
    <View style={[styles.chip, flaeche, style]}>
      {/* Das Icon in der TEXTFARBE, nicht in `base`: Auf der hellen Pille ist das
          `onSoft` und damit dieselbe abgedunkelte Variante wie die Schrift daneben —
          sonst wäre das Sport-Gelb auf seinem eigenen Hellton wieder unlesbar. */}
      {meta ? <SsIcon name={meta.icon} size={15} color={textFarbe} /> : null}
      <SsText variant="caption" color={textFarbe} numberOfLines={1} style={styles.text}>
        {meta ? meta.label : label}
      </SsText>
    </View>
  );

  if (!onPress) return inhalt;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
      {inhalt}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { cursor: 'pointer' },
  pressed: { opacity: 0.65 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: { fontWeight: '700' },
});
