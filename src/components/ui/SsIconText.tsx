import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { SsIcon } from './SsIcon';
import { SsText } from './SsText';

import { colors, spacing, type, type TypeVariant } from '@/theme';
import type { IconName } from '@/theme/icons';

export interface SsIconTextProps {
  icon: IconName;
  children: string;
  variant?: TypeVariant;
  color?: string;
  /** Das Icon abweichend von der Schrift einfärben — für Zustände wie „du bist dabei". */
  iconColor?: string;
  center?: boolean;
  /** Wie beim `SsText` darunter: begrenzt die Zeilen und kürzt mit „…". */
  numberOfLines?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Ein Icon und ein Text nebeneinander — „Nur Follower", „Du bist dabei", „Angefragt".
 *
 * ── Warum das ein Baustein ist und keine drei Zeilen im Screen ───────────────
 * Bis Phase 14 stand an diesen Stellen ein Emoji IM Text: `🔒 Nur Follower`. Das war
 * bequem (ein String) und hatte zwei Fehler, die man erst am Gerät sieht: Das Emoji
 * nahm die Textfarbe nicht an, und der Abstand dahinter war ein Leerzeichen in der
 * jeweiligen Schrift — also je Stelle ein anderer. Ein gezeichnetes Icon kann beides
 * nicht selbst regeln, es braucht eine Zeile darum. Diese hier, ein Mal.
 *
 * ── Die ACTA-Falle aus Phase 12, die hier eingebaut vermieden ist ────────────
 * „Symbol links, zweizeiliger Text daneben: Das Symbol landet an der zweiten Zeile."
 * Ursache ist `alignItems: 'center'`, das über den GANZEN Textblock zentriert. Hier
 * steht deshalb `flex-start` und das Icon bekommt einen eigenen `marginTop`, der es
 * auf die Mitte der ERSTEN Zeile schiebt. Bei einer Zeile sieht das aus wie
 * zentriert, bei drei bleibt es oben, wo es hingehört.
 */
export function SsIconText({
  icon,
  children,
  variant = 'caption',
  color = colors.inkSoft,
  iconColor,
  center,
  numberOfLines,
  style,
}: SsIconTextProps) {
  const groesse = ICON_GROESSE[variant];
  // Mitte der ersten Zeile minus halbe Icon-Höhe. Beide Werte kommen aus der
  // Typo-Skala, damit der Versatz nicht nachgemessen werden muss, wenn sich eine
  // Stufe ändert.
  const versatz = Math.max(0, Math.round((type[variant].lineHeight - groesse) / 2));

  return (
    <View style={[styles.zeile, center && styles.mitte, style]}>
      <View style={{ marginTop: versatz }}>
        <SsIcon name={icon} size={groesse} color={iconColor ?? color} />
      </View>
      <SsText variant={variant} color={color} numberOfLines={numberOfLines} style={styles.text}>
        {children}
      </SsText>
    </View>
  );
}

/**
 * Wie groß das Icon zu welcher Schriftstufe ist — durchweg etwas UNTER der
 * Zeilenhöhe. Ein Icon, das die Zeilenhöhe ausfüllt, wirkt größer als die Schrift
 * daneben, weil Buchstaben ihre Zeile nie ganz ausnutzen.
 */
const ICON_GROESSE: Record<TypeVariant, number> = {
  display: 30,
  title: 24,
  heading: 20,
  body: 17,
  bodyStrong: 17,
  label: 16,
  caption: 14,
};

const styles = StyleSheet.create({
  zeile: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs + 2 },
  mitte: { justifyContent: 'center' },
  text: { flexShrink: 1 },
});
