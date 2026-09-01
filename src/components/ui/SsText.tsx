import { Text, type TextProps } from 'react-native';

import { colors, type, type TypeVariant } from '@/theme';

export interface SsTextProps extends TextProps {
  /** Welche Stufe aus der Typo-Skala. Standard: Fließtext. */
  variant?: TypeVariant;
  /** Textfarbe. Standard: `colors.ink`. Für farbige Kategorie-Texte durchreichen. */
  color?: string;
  center?: boolean;
}

/**
 * Jeder Text in der App geht hier durch.
 *
 * Der Grund ist die ACTA-Falle: ein blankes <Text> ohne `lineHeight` clippt auf iOS
 * bei großen Graden die Oberlängen. Weil SsText die Zeilenhöhe immer aus der Skala
 * mitbringt, kann man diesen Fehler gar nicht mehr machen.
 */
export function SsText({ variant = 'body', color = colors.ink, center, style, ...rest }: SsTextProps) {
  return <Text style={[type[variant], { color }, center && { textAlign: 'center' }, style]} {...rest} />;
}
