import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DoppelHinweis } from './DoppelHinweis';
import { SsAvatar, SsButton, SsInput, SsText } from './ui';

import { t } from '@/i18n';
import type { FeedEintrag } from '@/features/posts/hooks';
import { grussVorschlag } from '@/features/posts/wisch';
import { useKollisionen } from '@/features/requests/hooks';
import { useTabUeberdeckung } from '@/lib/tabs';
import { colors, ecke, spacing, type } from '@/theme';

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
          accessibilityLabel={t('gemein.abbrechen')}
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

        {/* 🔴 **Zwei Zeilen statt vier** — Ians Entscheidung vom 2026-09-20.
            Vier Zeilen waren das größte Element der Leiste, für einen Satz, der
            optional ist und meistens „Hey X! Bin dabei" lautet. `multiline`
            bleibt: Wer mehr schreibt, bekommt mehr Platz, das Feld wächst mit.
            Die Höhe ist die VORGABE, nicht die Grenze. */}
        <SsInput
          value={text}
          onChangeText={setText}
          placeholder={t('antwort.dazuschreiben')}
          multiline
          // GERECHNET, nicht hingeschrieben: zwei Zeilen der Grundschrift. Ein
          // blankes `minHeight: 45` wäre beim nächsten Schriftwechsel falsch,
          // ohne dass es jemandem auffällt. Die Voreinstellung in `SsInput`
          // (76) sind gut drei Zeilen und gilt weiter, wo mehr geschrieben wird.
          inputStyle={{ minHeight: type.body.lineHeight * 2 }}
          maxLength={200}
        />

        <DoppelHinweis kollisionen={kollisionen} />

        <SsButton
          variant="category"
          category={post.category}
          label={t('antwort.schicken')}
          icon="hand"
          block
          size="lg"
          onPress={() => onSenden(text)}
        />

        {/* 🔴 **`colors.inkSoft`, nicht `palette.onSoft` — gemessen am 2026-09-20.**
            `onSoft` ist laut seiner eigenen Definition „die Textfarbe AUF soft".
            Dieser Satz steht aber nicht auf `soft`, sondern auf `colors.surface`,
            der Fläche der Leiste. Auf der falschen Fläche gemessen:

              Essen 4,43 · Kultur 4,37 · Kreativ 4,39   ← unter WCAG AA (4,5)
              Lernen 4,50 · Outdoor 4,61 · Sport 7,36

            Drei von sechs Kategorien fallen durch, und Lernen liegt genau auf
            der Kante. `aufGrund` wäre die richtige Frage, aber die falsche
            Antwort: Es ist gegen `colors.bg` gemessen und kommt auf der Leiste
            nur auf 3,87.

            **Derselbe Satz im Detail-Screen stand immer schon auf `inkSoft`**
            (`post/[id].tsx`). Zwei Antworten auf dieselbe Frage, und der
            Ausreißer war der, der durchfällt — 5,21:1 statt 4,37. */}
        <SsText variant="caption" center color={colors.inkSoft}>
          {author.displayName} entscheidet, wer mitkommt.
        </SsText>

        {/* 🔴 **Text statt Knopf** — Ians Entscheidung vom 2026-09-20.
            Als Knopf in voller Breite war „{t('antwort.dochNicht')}" das zweitgrößte Element,
            obwohl es schon zwei andere Wege hinaus gibt: danebentippen (der
            Schleier oben) und die Leiste nach unten schieben. Harte Regel 63:
            Ein Bildschirm zeigt, was für DIESE Entscheidung nötig ist — und die
            Entscheidung hier heißt „schicken oder nicht", nicht „drei gleich
            große Knöpfe".

            ⚠️ **Es bleibt ein echtes Berührungsziel.** `hitSlop` macht die
            Fläche auf Apples 44 Punkte, ohne den Text größer zu zeichnen — ein
            Ausstieg, den man nicht trifft, ist keiner. */}
        <Pressable
          onPress={onAbbrechen}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('antwort.dochNicht')}
          style={styles.abbrechen}>
          <SsText variant="caption" center color={colors.inkSoft}>
            Doch nicht
          </SsText>
        </Pressable>
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

  /**
   * 🔴 **Eine schwebende KARTE, nicht mehr eine randlose Leiste** — Ians
   * Entscheidung vom 2026-09-20.
   *
   * ── Was vorher nicht mehr stimmte ──────────────────────────────────────
   * Hier standen nur `borderTopLeftRadius`/`borderTopRightRadius`, mit der
   * Begründung: *„eine Leiste, die unten am Schirm klebt, ist nur oben rund."*
   * **Sie klebt aber nicht mehr unten.** Seit sie mit
   * `bottom: tabUeberdeckung` der Tab-Kapsel ausweicht (harte Regel 62),
   * schwebt sie — mit zwei harten Ecken unten, unter denen der Schleier
   * durchscheint. Genau die Kante auf Ians Bild.
   *
   * *Eine Regel, deren GRUND wegfällt, hinterlässt ihre Wirkung* (FALLEN.md).
   *
   * ── 🔴 Warum `spacing.lg` und NICHT `TAB_KAPSEL_SEITE` ──────────────────
   * Der erste Anlauf nahm `TAB_KAPSEL_SEITE` aus `lib/tabs`, um mit der
   * Tab-Kapsel auf einer Linie zu stehen. **Am Gerät war die Leiste danach
   * schmal und klebte links am Rand** (Ians Bild, 2026-09-20, 21:04).
   *
   * `lib/tabs.native.ts` exportiert die Kapsel-Maße mit ABSICHT nicht: Auf iOS
   * gibt es keine eigene Kapsel mehr, die man messen könnte — sie gehört Apple
   * (Entscheidung 85, NativeTabs). Der Import lief trotzdem durch, denn
   * `tsc` löst `@/lib/tabs` immer auf `tabs.ts` auf; `moduleSuffixes` steht in
   * der `tsconfig.json` nicht. Zur Laufzeit war der Wert damit `undefined`, und
   * ein absolutes Kind ohne `left`/`right` wird inhaltsbreit und setzt sich an
   * seine statische Position — x = 0.
   *
   * **Der Bezugspunkt ist jetzt ein anderer, und ein besserer:** `spacing.lg`
   * ist der Seitenrand, den `stapelBereich` den Post-Karten gibt. Die Leiste
   * steht also mit dem auf einer Linie, worüber sie liegt. Apples Leiste
   * darunter hat ihren eigenen Rand, und den kennen wir nicht — sich daran
   * ausrichten zu wollen war von vornherein eine Frage ohne Antwort.
   *
   * `ecke.xl` statt zweier Radien: Jetzt sollen wirklich alle vier Ecken rund
   * sein, und damit ist es der Fall, für den es `ecke` gibt (harte Regel 112).
   */
  leiste: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 0,
    left: spacing.lg,
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    ...ecke.xl,
  },
  // 44 sind Apples Mindestmaß für ein Berührungsziel — hier als Höhe des
  // Bereichs, nicht als Größe der Schrift.
  abbrechen: { minHeight: 44, justifyContent: 'center', cursor: 'pointer' },
  kopf: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  kopfText: { flex: 1, gap: 1 },
});
