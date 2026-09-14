import { Pressable, StyleSheet, View } from 'react-native';

import { SsIcon } from './SsIcon';
import { SsText } from './SsText';
import { colors, radius, spacing, status } from '@/theme';

/**
 * Ein Häkchen zum Ankreuzen — gebaut für Phase 21.2 (Ians Entscheidung 80), aber
 * bewusst ohne Wissen darüber, wozu es angekreuzt wird.
 *
 * ── Warum ein eigener Baustein und kein `Switch` ─────────────────────────────
 * React Native bringt `Switch` mit, und er wäre in einer Zeile da. Er ist hier
 * trotzdem falsch: Ein Schiebeschalter sagt „an oder aus" und gehört zu einer
 * EINSTELLUNG, die man jederzeit zurücknehmen kann — so einer steht in
 * `einstellungen.tsx`. Eine Zustimmung ist keine Einstellung, sondern eine
 * einmalige Handlung, und ein Kästchen mit Haken ist das Bild, das jeder Mensch
 * dafür kennt. Dazu kommt, dass `Switch` auf iOS, Android und Web drei
 * verschiedene Dinge zeichnet — dieselbe Überlegung, mit der `PrototypHinweis`
 * sich gegen `Modal` entschieden hat.
 *
 * ── Warum der Text zweigeteilt ist ──────────────────────────────────────────
 * `vor` ist gewöhnlicher Text, `link` öffnet etwas. **Ein Häkchen neben einem
 * Text, den man nicht lesen KANN, ist keine Zustimmung** — und für Apple ist
 * genau das der Punkt, an dem eine Zustimmung zählt oder nicht.
 *
 * Die beiden Flächen sind deshalb GETRENNT antippbar: Wer auf „Nutzungsbedingungen"
 * tippt, will lesen und nicht zustimmen. Läge der Link innerhalb der Häkchen-
 * Fläche, setzte ein Tipp darauf das Häkchen — man hätte zugestimmt, indem man
 * nachsehen wollte. Das ist die Falle *„Ein Prüfklick, der ‚danebengeht', hat oft
 * eine Entscheidung getroffen"*, nur trifft sie hier einen Menschen.
 *
 * ── Kein Emoji, kein ☑ ──────────────────────────────────────────────────────
 * Harte Regel 23: Das Zeichen kommt aus `theme/icons.ts` (`haken`), nicht aus der
 * Schriftart. Ein ☑ sieht auf jeder Plattform anders aus und färbt sich nicht mit.
 */
export interface SsHakenProps {
  /** Ist es angekreuzt? */
  an: boolean;
  /** Umschalten. Bekommt den NEUEN Wert, nicht den alten. */
  setzen: (an: boolean) => void;
  /** Der gewöhnliche Teil des Satzes, vor dem Link. */
  vor: string;
  /** Der antippbare Teil. Ohne `onLink` bleibt er gewöhnlicher Text. */
  link?: string;
  /** Was passiert, wenn auf `link` getippt wird. */
  onLink?: () => void;
  /**
   * Ein Mangel, der ERST angezeigt wird, wenn jemand abschicken wollte —
   * dieselbe Bauart wie `gezeigt` in `ErstesKonto`. Ein roter Rahmen an einem
   * Kästchen, das noch niemand gesehen hat, beschuldigt jemanden für nichts.
   */
  fehler?: string;
}

const KASTEN = 24;

export function SsHaken({ an, setzen, vor, link, onLink, fehler }: SsHakenProps) {
  const rot = Boolean(fehler);

  return (
    <View style={styles.aussen}>
      <View style={styles.zeile}>
        <Pressable
          onPress={() => setzen(!an)}
          // `checkbox` statt `button`: Die Sprachausgabe soll „Kontrollkästchen,
          // nicht aktiviert" sagen und nicht „Schaltfläche". `accessibilityState`
          // trägt den Zustand — ohne ihn liest sie den Haken gar nicht vor.
          accessibilityRole="checkbox"
          accessibilityState={{ checked: an }}
          accessibilityLabel={link ? `${vor} ${link}` : vor}
          // Die Fläche ist größer als das Kästchen: 24 px sind unter Apples
          // 44-px-Empfehlung, und ein Kästchen, das man dreimal treffen muss,
          // sieht aus wie eins, das klemmt.
          hitSlop={spacing.sm}
          style={styles.hakenFlaeche}>
          <View
            style={[
              styles.kasten,
              an && styles.kastenAn,
              rot && !an && styles.kastenRot,
            ]}>
            {/* Das Icon steht nur da, wenn angekreuzt. Ein blasser Haken im leeren
                Kästchen wäre ein dritter Zustand, den es nicht gibt. */}
            {an ? <SsIcon name="haken" size={16} color={colors.surface} /> : null}
          </View>
        </Pressable>

        {/* Der Satz. `flex: 1` am nachgebenden Teil, harte Regel 43 — sonst schiebt
            ein langer Text das Kästchen aus dem Bild. */}
        <View style={styles.satz}>
          <SsText variant="body" color={colors.inkSoft}>
            {vor}{' '}
            {link ? (
              <SsText
                variant="body"
                color={colors.ink}
                onPress={onLink}
                style={styles.link}
                accessibilityRole="link">
                {link}
              </SsText>
            ) : null}
          </SsText>
        </View>
      </View>

      {fehler ? (
        <SsText variant="caption" color={status.danger} style={styles.fehler}>
          {fehler}
        </SsText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  aussen: { gap: spacing.xs },
  zeile: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },

  // Das Kästchen sitzt an der ERSTEN Textzeile, nicht in der Mitte des Absatzes:
  // die Falle „Symbol links, zweizeiliger Text daneben — das Symbol landet an der
  // zweiten Zeile". Ein winziger Versatz nach unten bringt es auf die Grundlinie.
  hakenFlaeche: { paddingTop: 2 },

  kasten: {
    width: KASTEN,
    height: KASTEN,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kastenAn: { backgroundColor: colors.ink, borderColor: colors.ink },
  kastenRot: { borderColor: status.danger },

  satz: { flex: 1, minWidth: 0 },
  link: { textDecorationLine: 'underline' },
  fehler: { marginStart: KASTEN + spacing.md },
});
