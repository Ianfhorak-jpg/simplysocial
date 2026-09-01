import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, MAX_CONTENT_WIDTH, spacing } from '@/theme';

export interface SsScreenProps {
  children: ReactNode;
  /**
   * Für Screens, die IN der Tab-Leiste liegen, auf `true` setzen.
   *
   * ACTA-Falle: Die Tab-Leiste bringt ihren eigenen unteren Sicherheitsabstand mit.
   * Legt der Screen noch einen drauf, entsteht ein toter schwarzer Balken über der
   * Leiste. Deshalb hier nur `top` als Kante.
   */
  tabScreen?: boolean;
  /** Inhalt scrollbar machen. Für Listen und lange Formulare. */
  scroll?: boolean;
  /**
   * Für Screens mit Eingabefeldern: der Inhalt weicht der Tastatur aus.
   *
   * Nur auf iOS nötig und deshalb auch nur dort aktiv. Android schiebt den Screen
   * selbst hoch (`windowSoftInputMode`), und im Browser gibt es das Problem nicht —
   * `behavior="padding"` würde dort nur unten Luft einfügen, die niemand braucht.
   */
  keyboard?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * Die Grundfläche jedes Screens: Sicherheitsabstände, Hintergrund und die
 * Breitenbegrenzung, damit die App am Desktop nicht auseinanderläuft.
 *
 * ── Warum der untere Abstand bei `scroll` NACH INNEN wandert ──────────────────
 * Läge er außen am SafeAreaView, wäre der Scroll-Bereich selbst kleiner und der
 * Inhalt würde über dem Rand enden statt sanft darunter zu verschwinden. Als
 * `paddingBottom` IM Scroll-Inhalt scrollt das letzte Element sauber frei.
 *
 * Dazu kommt ein fester Grundabstand: ein Button, der exakt an der Unterkante
 * klebt, ist am Handy kaum zu treffen — und wenn die Browser-Leiste ein Stück
 * überlappt, gar nicht mehr.
 */
export function SsScreen({ children, tabScreen, scroll, keyboard, style, contentStyle }: SsScreenProps) {
  const insets = useSafeAreaInsets();

  // Beim Scrollen übernimmt der Inhalt den unteren Abstand selbst (siehe oben).
  const kanten: ('top' | 'bottom')[] = tabScreen || scroll ? ['top'] : ['top', 'bottom'];

  if (!scroll) {
    return (
      <SafeAreaView style={[styles.safe, style]} edges={kanten}>
        <Tastatur an={keyboard}>
          <View style={[styles.content, styles.fill, contentStyle]}>{children}</View>
        </Tastatur>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, style]} edges={kanten}>
      <Tastatur an={keyboard}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            contentStyle,
            { paddingBottom: insets.bottom + spacing.xxxl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </Tastatur>
    </SafeAreaView>
  );
}

/**
 * Wickelt den Inhalt in einen `KeyboardAvoidingView` — aber nur, wenn er gebraucht
 * wird. Ein zusätzliches View um JEDEN Screen wäre eine Ebene mehr im Baum, die auf
 * Web und Android nichts tut.
 */
function Tastatur({ an, children }: { an?: boolean; children: ReactNode }) {
  if (!an || Platform.OS !== 'ios') return <>{children}</>;
  return (
    <KeyboardAvoidingView style={styles.fill} behavior="padding">
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  fill: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
  },
});
