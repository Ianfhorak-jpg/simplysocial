import { StyleSheet, View } from 'react-native';

import { SsText } from './SsText';

import { CATEGORY_ORDER, categoryColors, colors, radius } from '@/theme';

export interface SsAvatarProps {
  /** Im Prototyp ein Emoji, später die Bild-URL. */
  emoji: string;
  /** Die Nutzer-ID. Bestimmt die Hintergrundfarbe — derselbe Mensch, immer dieselbe Farbe. */
  seed?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Profilbild ohne Bilddatei.
 *
 * Die Hintergrundfarbe wird aus der Nutzer-ID gerechnet statt zufällig gewählt:
 * zufällig hieße, dass Lea bei jedem Neuladen anders aussieht. So bekommt jeder
 * Mensch dauerhaft seine Farbe — und zwar eine aus der bestehenden Palette, damit
 * die Avatare nicht neben den Kategoriefarben stehen, sondern dazugehören.
 */
export function SsAvatar({ emoji, seed = '', size = 'md' }: SsAvatarProps) {
  let summe = 0;
  for (let i = 0; i < seed.length; i++) summe += seed.charCodeAt(i);
  const palette = categoryColors[CATEGORY_ORDER[summe % CATEGORY_ORDER.length]];

  const masse = SIZES[size];

  return (
    <View
      style={[
        styles.circle,
        { width: masse.box, height: masse.box, backgroundColor: palette.soft, borderColor: colors.line },
      ]}>
      <SsText variant="body" style={{ fontSize: masse.glyph, lineHeight: Math.round(masse.glyph * 1.2) }}>
        {emoji}
      </SsText>
    </View>
  );
}

const SIZES = {
  sm: { box: 32, glyph: 15 },
  md: { box: 44, glyph: 21 },
  lg: { box: 72, glyph: 34 },
} as const;

const styles = StyleSheet.create({
  circle: {
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
