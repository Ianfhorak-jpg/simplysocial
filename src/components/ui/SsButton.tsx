import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { SsIcon } from './SsIcon';
import { SsText } from './SsText';

import { accent, categoryColors, colors, danger, DEPTH, radius, spacing } from '@/theme';
import type { IconName } from '@/theme/icons';
import type { ActivityCategory } from '@/types/models';

export type SsButtonVariant = 'primary' | 'category' | 'ghost' | 'danger';

interface SsButtonBase {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
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
 * Der wichtigste Baustein der App (PLAN.md, Abschnitt 3): ein Button mit hartem
 * Rand unten, der beim Drücken verschwindet — er fühlt sich an, als würde man ihn
 * wirklich hinunterdrücken.
 *
 * ── Warum `marginTop` statt `translateY` ──────────────────────────────────────
 * Der untere Rand zählt zur Höhe des Elements. Fällt er beim Drücken einfach weg,
 * schrumpft der Button um DEPTH und alles darunter im Screen ruckt nach oben.
 * Mit `marginTop: DEPTH` gleicht sich das exakt aus: Rand weg (−4), Margin dazu (+4).
 * Höhe konstant, Kasten trotzdem sichtbar tiefer. Reines Layout, kein Transform —
 * dadurch auf Web und iOS Pixel für Pixel dasselbe.
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
  disabled,
  icon,
  block,
  size = 'md',
  variant = 'primary',
  category,
  style,
}: SsButtonProps) {
  // `primary` und `category` sind gefüllt, `ghost` und `danger` sind Umrisse auf Weiß.
  const gefuellt = variant === 'primary' || variant === 'category';
  const palette = variant === 'category' && category ? categoryColors[category] : accent;

  // Deaktiviert: flache graue Fläche. Der Rand unten bleibt in DERSELBEN Farbe wie
  // die Fläche — dadurch sieht der Button flach aus, behält aber exakt seine Höhe,
  // sodass beim Umschalten nichts im Layout springt.
  const face: ViewStyle = disabled
    ? { backgroundColor: colors.line, borderColor: colors.line, borderBottomColor: colors.line, borderWidth: 1 }
    : gefuellt
      ? // Der Umriss in derselben Farbe wie der Rand unten fasst den Knopf ein — dadurch
        // liest die dicke Unterkante als Fortsetzung der Kante und nicht als Streifen.
        { backgroundColor: palette.base, borderColor: palette.deep, borderBottomColor: palette.deep, borderWidth: 1 }
      : variant === 'danger'
        ? // Rot außen, Weiß innen: die Absage ist als solche erkennbar, ohne lauter zu
          // sein als die Zusage daneben. Unten der dunklere Ton, sonst wäre die
          // Unterkante nur ein Strich und keine Tiefe.
          { backgroundColor: colors.surface, borderColor: danger.base, borderBottomColor: danger.deep, borderWidth: 2 }
        : { backgroundColor: colors.surface, borderBottomColor: colors.line, borderWidth: 2, borderColor: colors.line };

  const textColor = disabled
    ? colors.inkSoft
    : gefuellt
      ? palette.onBase
      : variant === 'danger'
        ? danger.onSoft
        : colors.ink;

  // Wie tief der Rand im Ruhezustand ist und was beim Drücken davon übrig bleibt.
  // Übrig bleibt immer der Umriss — sonst hätte der Knopf gedrückt unten ein Loch im
  // Rahmen. Der Versatz nach unten ist genau die Differenz, dadurch bleibt die
  // Gesamthöhe bei jeder Variante gleich und im Layout ruckt nichts.
  const umriss = gefuellt ? 1 : 2;
  const randRuhe = DEPTH;
  const randGedrueckt = umriss;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={[block ? styles.block : styles.inline, disabled && styles.notAllowed, style]}>
      {({ pressed }) => (
        <View
          style={[
            styles.face,
            size === 'lg' ? styles.faceLg : styles.faceMd,
            face,
            pressed && !disabled
              ? { borderBottomWidth: randGedrueckt, marginTop: randRuhe - randGedrueckt }
              : { borderBottomWidth: randRuhe, marginTop: 0 },
          ]}>
          {/* Das Icon wächst mit der Größe mit und nimmt die Textfarbe an — das ist
              der Unterschied zum Emoji davor, das immer bunt blieb und deshalb auf
              einem farbigen Knopf wie ein Aufkleber saß. */}
          {icon ? <SsIcon name={icon} size={size === 'lg' ? 20 : 17} color={textColor} /> : null}
          <SsText variant="label" color={textColor} numberOfLines={1} style={size === 'lg' && styles.labelLg}>
            {label}
          </SsText>
        </View>
      )}
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
    borderRadius: radius.md,
  },
  faceMd: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  faceLg: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderRadius: radius.lg },
  // React Native kennt nur 'auto' und 'pointer' — 'not-allowed' waere reines Web-CSS.
  notAllowed: { cursor: 'auto' as const },
  labelLg: { fontSize: 17, lineHeight: 22 },
});
