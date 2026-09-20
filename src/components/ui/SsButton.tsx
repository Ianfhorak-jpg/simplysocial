import { Animated, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { SsIcon } from './SsIcon';
import { SsText } from './SsText';

import { WARTE_TEXT } from '@/data/schreiben';
import { accent, categoryColors, colors, danger, KURVE, radius, spacing, useDruck } from '@/theme';
import type { IconName } from '@/theme/icons';
import type { ActivityCategory } from '@/types/models';

export type SsButtonVariant = 'primary' | 'category' | 'ghost' | 'danger';

interface SsButtonBase {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  /**
   * Wartet dieser Knopf gerade auf den Server? — Phase 20.5, Ians Entscheidung 46.
   *
   * Setzt `disabled` UND tauscht die Beschriftung gegen `WARTE_TEXT`. Beides
   * zusammen, weil einzeln jeweils die Hälfte fehlt: Nur ausgrauen sieht aus wie
   * „geht gerade nicht", nur beschriften lässt sich weiterdrücken.
   *
   * **Nur die acht Aktionen, bei denen `wartetAufServer()` wahr sagt, setzen das
   * je.** Bei den vierzehn anderen steht das Ergebnis schon da, bevor irgendetwas
   * zu warten hätte — das ist Entscheidung 46 und keine Nachlässigkeit.
   */
  wartet?: boolean;
  /**
   * Icon links vom Text — ein Name aus `theme/icons.ts`, seit Phase 14 kein Emoji
   * mehr. Der Typ ist bewusst eng: Als `string` war jede vergessene Ersetzung
   * unsichtbar, als Union zeigt `tsc` sie.
   */
  icon?: IconName;
  /** Über die volle Breite. Für den Hauptbutton am Seitenende. */
  block?: boolean;
  size?: 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

/**
 * Die Kategoriefarbe ist nur bei `variant="category"` erlaubt — und dort Pflicht.
 * Dadurch kann es keinen kategoriefarbigen Button ohne Farbe geben.
 */
type SsButtonVariantProps =
  | { variant?: 'primary' | 'ghost' | 'danger'; category?: never }
  | { variant: 'category'; category: ActivityCategory };

export type SsButtonProps = SsButtonBase & SsButtonVariantProps;

/**
 * Der wichtigste Baustein der App: seit Phase 20.10 eine **iOS-Kapsel**.
 *
 * ── Die Entscheidung vom 2026-09-14 (Ians Entscheidung 81) ───────────────────
 * Bis hierher trug jeder Knopf einen 4 pt dicken farbigen Rand unten (`DEPTH`), und
 * beim Drücken sank er genau um diesen Betrag ein. PLAN.md, Abschnitt 3 nannte das
 * **„die Signatur der App"** — sie ist mit dieser Phase aufgegeben, und das ist
 * keine Nachlässigkeit, sondern eine ausgesprochene Entscheidung.
 *
 * **Der Grund:** Ians Urteil war *„sieht immer noch wie Android aus"* — gefällt auf
 * dem iPhone, wo Liquid Glass längst läuft. Beim Nachmessen war nicht das Glas das
 * Problem, sondern dieser Rand. Ein Knopf mit dicker farbiger Unterkante, der sich
 * körperlich hinunterdrücken lässt, ist das Erkennungszeichen von Duolingo und von
 * Material Design. **iOS 26 macht das genaue Gegenteil:** randlose Kapseln, und
 * Tiefe entsteht durch Unschärfe und Bewegung, nie durch eine gezeichnete Kante.
 * Solange dieser Rand stand, konnte kein Glas der Welt das Bild drehen — er stand
 * auf jedem Bildschirm, mehrfach, und er war das Lauteste darauf.
 *
 * **Was dafür verloren geht, steht auch da:** Der alte Knopf war unverwechselbar.
 * Der neue ist es nicht — er sieht aus wie ein iOS-Knopf, weil er einer ist. Die
 * Wiedererkennung muss ab jetzt aus den Farben kommen (die sechs Aktivitätstöne
 * bleiben unangetastet), nicht mehr aus der Form.
 *
 * ── Warum `scale` und nicht mehr `marginTop` ─────────────────────────────────
 * Der alte Weg musste die Höhe konstant halten, weil ein wegfallender Rand das
 * Layout darunter hätte rucken lassen. Ein `transform` hat dieses Problem gar
 * nicht: Es wirkt NACH dem Layout, der Kasten belegt unverändert seinen Platz.
 * Deshalb ist die Rückmeldung jetzt reine Darstellung — und genau das ist auch der
 * Grund, warum sie auf beiden Plattformen gleich aussieht, ohne dass etwas
 * ausgeglichen werden muss.
 *
 * ── Warum `danger` ein Umriss ist und keine rote Fläche ───────────────────────
 * Die Variante kam in Phase 4 für „Ablehnen" dazu. Ein rot GEFÜLLTER Knopf neben
 * „Bestätigen" wäre das Lauteste auf einem Bildschirm, dessen Zweck das Zusagen ist —
 * das Auge landet zuerst auf der Absage. Rot als Umriss sagt dasselbe (das ist die
 * unfreundliche Aktion), ohne die Reihenfolge umzudrehen. Für Phase 7 (Blockieren,
 * Melden) passt es genauso: auch dort ist die zerstörerische Aktion nie der Hauptweg.
 */
export function SsButton({
  label,
  onPress,
  disabled: disabledRoh,
  wartet,
  icon,
  block,
  size = 'md',
  variant = 'primary',
  category,
  style,
}: SsButtonProps) {
  const druck = useDruck();
  const disabled = disabledRoh || wartet;
  const beschriftung = wartet ? WARTE_TEXT : label;

  // `primary` und `category` sind gefüllt, `ghost` und `danger` sind Umrisse auf Weiß.
  const gefuellt = variant === 'primary' || variant === 'category';
  const palette = variant === 'category' && category ? categoryColors[category] : accent;

  // Seit Phase 20.10 gibt es KEINEN `borderBottomColor` mehr und keinen Umriss an
  // den gefüllten Knöpfen: Eine iOS-Kapsel ist eine reine Fläche. Der `deep`-Ton
  // jeder Palette bleibt in `colors.ts` stehen — er trägt woanders noch (Umrisse
  // auf der Karte), nur hier zeichnet er nicht mehr.
  //
  // Deaktiviert: flache graue Fläche, unverändert. Sie war nie das Problem.
  const face: ViewStyle = disabled
    ? { backgroundColor: colors.line }
    : gefuellt
      ? { backgroundColor: palette.base }
      : variant === 'danger'
        ? // Rot außen, Weiß innen: die Absage ist als solche erkennbar, ohne lauter zu
          // sein als die Zusage daneben. Der Umriss ist von 2 auf 1 pt herunter — 2 pt
          // war die Stärke, die neben einer 4 pt dicken Unterkante nicht verschwand.
          // Ohne die Kante ist 1 pt das iOS-Maß, und 2 pt wirkt daneben grob.
          { backgroundColor: colors.surface, borderColor: danger.base, borderWidth: 1 }
        : { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1 };

  const textColor = disabled
    ? colors.inkSoft
    : gefuellt
      ? palette.onBase
      : variant === 'danger'
        ? danger.onSoft
        : colors.ink;

  return (
    // Die Griffe liegen auf dem `Pressable`, der Stil auf der FLÄCHE darunter. Ein
    // abgeschaltetes `Pressable` feuert gar keine Press-Events — die frühere Abfrage
    // `pressed && !disabled` braucht deshalb keine Entsprechung mehr.
    <Pressable
      onPress={onPress}
      disabled={disabled}
      {...druck.griff}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={[block ? styles.block : styles.inline, disabled && styles.notAllowed, style]}>
      {/* Der Stil bleibt auf dem INNEREN View. Zöge man ihn aufs `Pressable` hoch,
          änderte sich `alignSelf`/Flex — der Knopf säße anders im Screen. */}
      <Animated.View style={[styles.face, size === 'lg' ? styles.faceLg : styles.faceMd, face, druck.stil]}>
        {/* Das Icon wächst mit der Größe mit und nimmt die Textfarbe an — das ist
            der Unterschied zum Emoji davor, das immer bunt blieb und deshalb auf
            einem farbigen Knopf wie ein Aufkleber saß. */}
        {icon ? <SsIcon name={icon} size={size === 'lg' ? 20 : 17} color={textColor} /> : null}
        <SsText variant="label" color={textColor} numberOfLines={1} style={size === 'lg' && styles.labelLg}>
          {beschriftung}
        </SsText>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inline: { alignSelf: 'flex-start', cursor: 'pointer' },
  block: { alignSelf: 'stretch', cursor: 'pointer' },
  face: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    // Voll gerundet statt 14 pt — das ist die iOS-26-Form. `radius.pill` ist 999,
    // also „so rund, wie die Höhe es zulässt": Ein hoher Knopf wird zur Kapsel, ein
    // flacher zum Stäbchen, und keiner der beiden braucht eine eigene Zahl.
    borderRadius: radius.pill,
    // Bei `pill` hat die Kurve nichts mehr zu tun (ein Halbkreis ist ein Halbkreis).
    // Sie steht hier trotzdem, weil sie sofort greift, falls jemand den Radius
    // später herunternimmt — dann wäre sie sonst genau das, was man vergisst.
    borderCurve: KURVE,
  },
  faceMd: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  faceLg: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },


  // React Native kennt nur 'auto' und 'pointer' — 'not-allowed' waere reines Web-CSS.
  notAllowed: { cursor: 'auto' as const },
  labelLg: { fontSize: 17, lineHeight: 22 },
});
