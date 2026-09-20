import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DoppelHinweis } from './DoppelHinweis';
import { SsAvatar, SsButton, SsInput, SsText } from './ui';

import type { FeedEintrag } from '@/features/posts/hooks';
import { grussVorschlag } from '@/features/posts/wisch';
import { useKollisionen } from '@/features/requests/hooks';
import { useTabUeberdeckung } from '@/lib/tabs';
import { categoryColors, colors, KURVE, radius, spacing } from '@/theme';

/**
 * Was nach dem Wisch nach rechts hochfährt — Ians elfte Entscheidung, 2026-09-01.
 *
 * Seine Worte: *„mit einem vorgeschriebenen HEY oder so, damit wenn er keine Lust
 * hat zu schreiben, einfach schicken kann."* Genau das ist der Bauplan: Der Text
 * steht schon drin, Tippen ist freiwillig, Senden ist ein Tipp.
 *
 * ── Warum überhaupt ein Schritt dazwischen ────────────────────────────────────
 * Ein Wisch nach rechts könnte die Anfrage einfach abschicken. Aber der Poster
 * entscheidet, wen er trifft — das ist das Sicherheitsversprechen dieser App
 * (PLAN.md, Abschnitt 1). Woran soll er das festmachen, wenn zehn wortlose Anfragen
 * untereinander stehen? Ein Satz ist das Wenigste, woran man einen Menschen erkennt.
 * Die Begründung samt der beiden verworfenen Möglichkeiten steht in
 * `features/posts/wisch.ts`.
 *
 * ── Warum das Feld NICHT von selbst den Fokus bekommt ─────────────────────────
 * Naheliegend wäre `autoFocus`. Am Handy fährt dann aber sofort die Tastatur hoch
 * und verdeckt die halbe Leiste — für jemanden, der genau nicht tippen wollte, ist
 * das ein Bildschirm voller Arbeit statt eines Knopfes. Wer schreiben will, tippt
 * ins Feld; wer nicht, drückt Schicken.
 */

export interface AntwortLeisteProps {
  eintrag: FeedEintrag;
  onAbbrechen: () => void;
  onSenden: (text: string) => void;
}

export function AntwortLeiste({ eintrag, onAbbrechen, onSenden }: AntwortLeisteProps) {
  const { post, author } = eintrag;
  const palette = categoryColors[post.category];
  const [text, setText] = useState(() => grussVorschlag(author.displayName));
  /**
   * 🔴 **Die Leiste lag unter der Tab-Kapsel** — Ians Befund vom 2026-09-20:
   * *„wenn man nach rechts wischt, dann ist dieses Feld, was von unten raufkommt,
   * auch von dem Liquid-Glass-Ding … das sieht nicht gut aus."*
   *
   * `bottom: 0` heißt auf einem Tab-Screen die Bildschirmkante und nicht die
   * Oberkante der schwebenden Kapsel: `SsScreen` gibt unten keinen Abstand
   * (`edges={['top']}`, und `useTabRand()` ist auf iOS 0). Dieselbe Ursache wie bei
   * den Knöpfen im `WischStapel`.
   */
  const tabUeberdeckung = useTabUeberdeckung();
  /**
   * Wie weit der Schleier nach OBEN über seinen Platz hinausreichen muss.
   *
   * 🔴 Ians zweiter Befund am selben Moment: *„alles wird ja so ein bisschen
   * grau-weiß, und oben wird es aber nicht grau-weiß — da wo dann meine Kamera
   * ist."* Der Schleier ist ein Kind des Screen-Inhalts, und der beginnt UNTER der
   * `SafeAreaView`-Kante. Die Statusleiste blieb deshalb als heller Streifen stehen,
   * während darunter alles abdunkelte — und dieser Streifen ist genau der Ort, an
   * den man ohnehin schaut.
   *
   * ⚠️ Ein negativer Rand, und die sind in diesem Projekt schon schiefgegangen
   * (Phase 12). Hier ist er tragbar, weil die Fläche **absolut positioniert** ist
   * und nichts verschiebt: Sie deckt zu, sie schiebt nicht.
   */
  const insets = useSafeAreaInsets();
  // Phase 18d: dieselbe Pruefung wie im Post-Detail, weil der Wischstapel derselbe
  // Weg zu derselben Anfrage ist. Stuende sie nur im Detail, waere sie ausgerechnet
  // auf dem Startbildschirm still — dort, wo am schnellsten zugesagt wird.
  const kollisionen = useKollisionen(post.startsAt, post.id);

  // Ein Wert für beides: die Leiste fährt hoch, während der Schleier dunkler wird.
  // Zwei getrennte Animationen könnten auseinanderlaufen — das sieht man sofort.
  const auf = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(auf, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [auf]);

  const hoch = auf.interpolate({ inputRange: [0, 1], outputRange: [320, 0] });
  const schleier = auf.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] });

  return (
    <>
      {/* Der Schleier ist nicht Dekoration: Er sagt, dass der Stapel gerade nicht
          dran ist, und er ist die zweite Art abzubrechen — daneben tippen. */}
      <Animated.View style={[styles.schleier, { top: -insets.top, opacity: schleier }]}>
        <Pressable
          onPress={onAbbrechen}
          accessibilityRole="button"
          accessibilityLabel="Abbrechen"
          style={styles.schleierFlaeche}
        />
      </Animated.View>

      <Animated.View
        style={[styles.leiste, { bottom: tabUeberdeckung, transform: [{ translateY: hoch }] }]}>
        <View style={styles.kopf}>
          <SsAvatar name={author.displayName} seed={author.id} photoUrl={author.photoUrl} size="sm" />
          <View style={styles.kopfText}>
            <SsText variant="bodyStrong" numberOfLines={1}>
              An {author.displayName}
            </SsText>
            <SsText variant="caption" color={colors.inkSoft} numberOfLines={1}>
              {post.title}
            </SsText>
          </View>
        </View>

        <SsInput
          value={text}
          onChangeText={setText}
          placeholder="Kurz was dazuschreiben (optional)"
          multiline
          maxLength={200}
        />

        <DoppelHinweis kollisionen={kollisionen} />

        <SsButton
          variant="category"
          category={post.category}
          label="Schicken"
          icon="hand"
          block
          size="lg"
          onPress={() => onSenden(text)}
        />

        <SsText variant="caption" center color={palette.onSoft}>
          {author.displayName} entscheidet, wer mitkommt.
        </SsText>

        <SsButton variant="ghost" label="Doch nicht" block onPress={onAbbrechen} />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  // Ausgeschrieben statt `StyleSheet.absoluteFill` — das ist in dieser React-Native-
  // Version eine registrierte Style-ID und mischt sich nicht mit anderen Angaben
  // (in Phase 4 am Konfetti gelernt).
  schleier: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: colors.ink },
  schleierFlaeche: { flex: 1, cursor: 'pointer' },

  leiste: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.line,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    // Apples Squircle. Hier NICHT über `ecke`, weil das alle vier Ecken rundet —
    // eine Leiste, die unten am Schirm klebt, ist nur oben rund.
    borderCurve: KURVE,
  },
  kopf: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  kopfText: { flex: 1, gap: 1 },
});
