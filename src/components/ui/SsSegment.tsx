import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { SsIcon } from './SsIcon';
import { SsText } from './SsText';

import { colors, radius, spacing } from '@/theme';
import type { IconName } from '@/theme/icons';

export interface SsSegmentOption<T> {
  wert: T;
  label: string;
  /**
   * Statt der Beschriftung ein Zeichen — Phase 19f, Ians Entscheidung 54.
   *
   * `label` bleibt trotzdem Pflicht und verschwindet nicht: Es wird zum
   * `accessibilityLabel`. Ein Knopf ohne Namen ist für VoiceOver ein Knopf ohne
   * Funktion, und beim App-Store-Review ist das kein Detail.
   */
  icon?: IconName;
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
            accessibilityLabel={o.label}
            style={({ pressed }) => [
              styles.haelfte,
              aktiv && styles.haelfteAktiv,
              pressed && !aktiv && styles.haelfteGedrueckt,
            ]}>
            {o.icon ? (
              <SsIcon name={o.icon} size={19} color={aktiv ? colors.surface : colors.inkSoft} />
            ) : (
              <SsText variant="label" center color={aktiv ? colors.surface : colors.inkSoft} numberOfLines={1}>
                {o.label}
              </SsText>
            )}
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
    // Die Icon-Fassung (Entscheidung 54) zentriert ihr Zeichen — ohne das klebt es
    // links, weil ein `SsIcon` anders als ein `SsText center` keine Breite füllt.
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    // 8 statt 12 seit Phase 19b, und das ist eine Messung: Mit DREI Stufen
    // („Stapel · Liste · Karte") passt die Leiste auf einem 360-px-Schirm neben
    // „Noch 12 Karten" höchstens 232 px breit sein. Bei 12 px Innenabstand bekommt
    // „Stapel" davon 47,33 px und braucht 47 — es ging also rechnerisch gerade
    // eben auf, und beim nächsten Gerät mit einer Spur breiterer Schrift stünde
    // wieder „Sta…" da (Phase 11), wie schon „Jeder kann anfr…" (Phase 18a).
    // Mit 8 px sind es 55,3 gegen 47. Die zweistufigen Leisten gewinnen dadurch
    // ebenfalls Platz für ihre Beschriftung — die Änderung schadet keiner.
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    cursor: 'pointer',
  },
  haelfteAktiv: { backgroundColor: colors.ink },
  haelfteGedrueckt: { backgroundColor: colors.bg },
});
