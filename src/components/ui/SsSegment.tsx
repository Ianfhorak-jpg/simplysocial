import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { SsText } from './SsText';

import { colors, radius, spacing } from '@/theme';

export interface SsSegmentOption<T> {
  wert: T;
  label: string;
}

export interface SsSegmentProps<T> {
  options: readonly SsSegmentOption<T>[];
  value: T;
  onChange: (wert: T) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Die geteilte Fläche für ein Entweder-oder: „Alle | Wem ich folge" im Feed,
 * „Für alle | Nur meine Follower" beim Posten.
 *
 * ── Warum nicht zwei Pillen wie bei den Kategorien ────────────────────────────
 * Pillen sind eine Liste, aus der man auswählt — man könnte auch keine nehmen. Eine
 * geteilte Fläche sagt von selbst „genau eins von beidem", ohne dass es jemand
 * erklärt. Im Feed käme dazu, dass zwei Chip-Reihen übereinander wie eine einzige
 * lange Filterliste aussähen und „Alle" zweimal dastünde.
 *
 * Der Typ ist offen (`T`), damit man den Wert direkt bekommt, den man weiterverwendet
 * — `true`/`false` im Feed, `'public'`/`'followers'` beim Posten. Ohne das müsste
 * jeder Screen einen Index in seinen eigenen Wert zurückübersetzen.
 */
export function SsSegment<T extends string | number | boolean>({
  options,
  value,
  onChange,
  style,
}: SsSegmentProps<T>) {
  return (
    <View style={[styles.leiste, style]}>
      {options.map((o) => {
        const aktiv = o.wert === value;
        return (
          <Pressable
            key={String(o.wert)}
            onPress={() => onChange(o.wert)}
            accessibilityRole="button"
            accessibilityState={{ selected: aktiv }}
            style={({ pressed }) => [
              styles.haelfte,
              aktiv && styles.haelfteAktiv,
              pressed && !aktiv && styles.haelfteGedrueckt,
            ]}>
            <SsText variant="label" center color={aktiv ? colors.surface : colors.inkSoft} numberOfLines={1}>
              {o.label}
            </SsText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  leiste: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
  },
  haelfte: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    cursor: 'pointer',
  },
  haelfteAktiv: { backgroundColor: colors.ink },
  haelfteGedrueckt: { backgroundColor: colors.bg },
});
