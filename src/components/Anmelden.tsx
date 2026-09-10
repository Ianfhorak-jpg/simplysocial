import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SsButton, SsText } from '@/components/ui';
import { BRAND } from '@/config/brand';
import { ANMELDE_QUELLE, ANMELDE_WEGE, anmeldeFolgen } from '@/features/auth/anmeldung';
import { attrappeAnmelden } from '@/features/auth/hooks';
import { categoryColors, colors, MAX_CONTENT_WIDTH, radius, spacing } from '@/theme';

/**
 * Der Weg hinein — Phase 20.3.
 *
 * ── Warum das eine KOMPONENTE ist und keine Route ─────────────────────────────
 * `app/_layout.tsx` zeichnet sie ANSTELLE des Stacks, wenn niemand angemeldet ist.
 * Eine Route `/anmelden` wäre der naheliegende Weg und hat zwei Nachteile, die beide
 * erst später auffallen:
 *
 *   1. **Die Adresse würde verlorengehen.** Seit Phase 8 kann jeder Bildschirm der
 *      erste sein, den jemand öffnet (harte Regel 5). Wer einen Link auf `/post/p1`
 *      bekommt und nicht angemeldet ist, soll nach dem Anmelden BEI `/post/p1`
 *      landen. Wird hier nicht navigiert, bleibt die Adresse einfach stehen und der
 *      Stack löst sie auf, sobald er kommt. Ein Umweg über `/anmelden` müsste sich
 *      das Ziel merken und danach dorthin zurückspringen — zwei Zustände statt keinem.
 *   2. **Eine Route wäre umgehbar.** Solange die Screens im Baum hängen, zeichnen sie
 *      — und jeder, der `useCurrentUserId()` ruft, wirft. Der Torwächter muss sie
 *      GAR NICHT ERST zeichnen, und das kann nur die Ebene über dem Stack.
 *
 * ── Was hier NICHT steht ──────────────────────────────────────────────────────
 * Die Frage nach dem Heimatbezirk (Ians Entscheidung 64: *„man gibt am Anfang seinen
 * Bezirk an"*). Sie gehört hierher, sobald es ein NEUES Konto gibt — heute meldet
 * sich die Attrappe als ein Mensch an, der seinen Bezirk längst hat, und ein Schritt,
 * der etwas Beantwortetes fragt, ist kein Beleg für den Schritt. Er kommt in 20.3-b,
 * zusammen mit dem ersten echten Konto. Die Regel dazu steht schon geschrieben, im
 * Kopf von `features/auth/anmeldung.ts`.
 *
 * Und der Standort steht hier ausdrücklich nicht: `STANDORT_FRAGE = 'einstellung'`
 * (Ians Entscheidung 70). iOS fragt EINMAL — wer hier wegdrückt, drückt für immer weg.
 */
export function Anmelden() {
  const insets = useSafeAreaInsets();
  const hinweise = [...new Set(ANMELDE_WEGE.map((weg) => anmeldeFolgen(weg).hinweis))].filter(
    Boolean,
  );

  return (
    <View
      style={[
        styles.huelle,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg },
      ]}>
      <View style={styles.kasten}>
        <SsText variant="display" center>
          <SsText variant="display" color={colors.ink}>
            {BRAND.wordmark.first}
          </SsText>
          {/* Dieselbe Farbe wie im Startbild (`app/+html.tsx`) und auf der
              Landing-Page: die Wortmarke ist an allen drei Orten dieselbe, sonst
              wechselt sie beim ausgeloggten Kaltstart mitten im Bildaufbau. */}
          <SsText variant="display" color={categoryColors.creative.base}>
            {BRAND.wordmark.second}
          </SsText>
        </SsText>
        <SsText variant="body" center color={colors.inkSoft} style={styles.claim}>
          {BRAND.claim}
        </SsText>

        <View style={styles.wege}>
          {ANMELDE_WEGE.map((weg) => {
            const { titel, bereit } = anmeldeFolgen(weg);
            return <SsButton key={weg} label={titel} block size="lg" disabled={!bereit} />;
          })}
        </View>

        {/* Die Hinweise stehen EINMAL je verschiedenem Satz unter der ganzen Gruppe,
            nicht je Knopf. Heute sagen alle drei dasselbe („kommt mit dem Konto"),
            und dreimal derselbe Satz ist genau das, wogegen Entscheidung 50 gebaut
            ist — nachgemessen kostete er auf 360 × 600 zwölf Bildpunkte zu viel und
            schob den Kasten über beide Kanten hinaus. In 20.3-b werden es von selbst
            weniger: Was fertig ist, bringt gar keinen Hinweis mehr mit. */}
        {hinweise.map((satz) => (
          <SsText key={satz} variant="caption" center color={colors.inkSoft}>
            {satz}
          </SsText>
        ))}

        {/* Der Weg, den es nur im Prototyp gibt. Er steht ABGESETZT unter den drei
            echten und nicht zwischen ihnen: Sonst sähe die Anordnung aus wie vier
            gleichwertige Anmeldewege, und genau das ist er nicht. */}
        {ANMELDE_QUELLE === 'attrappe' ? (
          <View style={styles.attrappe}>
            <SsButton
              label="Weiter als Ian"
              variant="ghost"
              block
              onPress={attrappeAnmelden}
            />
            <SsText variant="caption" center color={colors.inkSoft}>
              Im Prototyp gibt es keine Konten — das ist der einzige Weg hinein.
            </SsText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Ausgeschriebene Kanten statt `absoluteFill` — das ist eine registrierte Style-ID
  // und lässt sich nicht mit eigenen Werten mischen (ACTA-Falle, siehe CLAUDE.md).
  huelle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  kasten: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  claim: { marginBottom: spacing.md },
  wege: { gap: spacing.md },
  weg: { gap: spacing.xs },
  attrappe: { marginTop: spacing.lg, gap: spacing.xs },
});
