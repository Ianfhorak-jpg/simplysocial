import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { SsScreen, SsText } from './ui';

import { colors, spacing } from '@/theme';

/**
 * Ein Tab, den es noch nicht gibt.
 *
 * Warum die drei leeren Tabs überhaupt schon in der Leiste stehen: Der Feed soll sich
 * anfühlen wie eine App und nicht wie eine Webseite. Dazu gehört, dass unten vier
 * Symbole sind — und die Leiste nimmt Platz weg, den man beim Beurteilen des Feeds
 * mitsehen muss. Ein Tab, der ehrlich sagt "kommt noch", ist dafür besser als eine
 * halbe Leiste, die später wächst und alles verschiebt.
 */
export function Platzhalter({
  emoji,
  titel,
  text,
  phase,
  children,
}: {
  emoji: string;
  titel: string;
  text: string;
  phase: string;
  /** Platz für etwas, das schon funktioniert — z. B. den Weg in die Werkstatt. */
  children?: ReactNode;
}) {
  return (
    <SsScreen tabScreen contentStyle={styles.seite}>
      <View style={styles.mitte}>
        <SsText style={styles.emoji}>{emoji}</SsText>
        <SsText variant="heading" center>
          {titel}
        </SsText>
        <SsText variant="body" center color={colors.inkSoft}>
          {text}
        </SsText>
        <SsText variant="caption" center color={colors.inkSoft} style={styles.phase}>
          {phase}
        </SsText>
        {children}
      </View>
    </SsScreen>
  );
}

const styles = StyleSheet.create({
  seite: { flex: 1 },
  mitte: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emoji: { fontSize: 44, lineHeight: 53 },
  phase: { marginTop: spacing.md, opacity: 0.7 },
});
