import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { SsText } from './SsText';

import { colors, radius, spacing, status, type } from '@/theme';

export interface SsInputProps {
  value: string;
  onChangeText: (wert: string) => void;
  /** Überschrift über dem Feld. Ohne Label ist ein Formularfeld auf Dauer nicht bedienbar. */
  label?: string;
  /** Erklärung neben dem Label — für Regeln, die man sonst durch Ausprobieren lernt. */
  hint?: string;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  keyboardType?: KeyboardTypeOptions;
  /** Fester Text rechts im Feld, z. B. "Wien" hinter dem Bezirk. */
  suffix?: string;
  /** Rot umrandet, Text darunter. Leer lassen heißt: alles in Ordnung. */
  error?: string;
  /**
   * Was die Enter-Taste auslöst. Nur bei einzeiligen Feldern sinnvoll — bei
   * `multiline` macht Enter einen Zeilenumbruch, und das soll es auch.
   *
   * Dazugekommen in Phase 5 fürs Chat-Eingabefeld: Eine Nachricht abzuschicken, ohne
   * die Hand von der Tastatur zu nehmen, ist der halbe Unterschied zwischen "Chat"
   * und "Formular". Als Prop am Baustein und nicht als eigener TextInput im Screen,
   * damit harte Regel 6 (neue Felder sind SsInput) nicht am ersten Sonderfall bricht.
   */
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

/**
 * Ein Eingabefeld. Der Baustein, den Phase 3 gebraucht hat und der bis dahin fehlte:
 * das Nachrichtenfeld im Post-Detail war ein `TextInput`, direkt im Screen gestylt.
 * Bei einem Formular mit acht Feldern wäre daraus achtmal dasselbe Styling geworden.
 *
 * ── Warum der Rahmen beim Tippen die Farbe wechselt ───────────────────────────
 * Auf iOS gibt es keinen Systemfokus wie im Browser: ohne eigene Rückmeldung sieht
 * man nicht, in welchem Feld man gerade schreibt, sobald die Tastatur die halbe Seite
 * verdeckt. Deshalb bekommt das Feld beim Fokus einen dunklen Rahmen — dieselbe
 * Information, die der Browser von sich aus gibt.
 *
 * ── Warum der Fehler das Feld nicht springen lässt ────────────────────────────
 * Der Rahmen wird nur umgefärbt, nicht dicker, und der Fehlertext steht in einer
 * eigenen Zeile UNTER dem Feld. Ein Rahmen, der bei einem Tippfehler von 1 auf 2
 * wächst, verschiebt alles darunter — mitten im Tippen ist das der Moment, in dem
 * man den falschen Knopf trifft.
 */
export function SsInput({
  value,
  onChangeText,
  label,
  hint,
  placeholder,
  multiline,
  maxLength,
  keyboardType,
  suffix,
  error,
  onSubmitEditing,
  autoFocus,
  style,
  inputStyle,
}: SsInputProps) {
  const [fokus, setFokus] = useState(false);

  const rahmen = error ? status.danger : fokus ? colors.ink : colors.line;

  return (
    <View style={[styles.block, style]}>
      {label ? (
        <View style={styles.kopf}>
          <SsText variant="label">{label}</SsText>
          {hint ? (
            <SsText variant="caption" color={colors.inkSoft}>
              {hint}
            </SsText>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.feld, { borderColor: rahmen }, multiline && styles.feldHoch]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFokus(true)}
          onBlur={() => setFokus(false)}
          placeholder={placeholder}
          placeholderTextColor={colors.inkSoft}
          multiline={multiline}
          maxLength={maxLength}
          keyboardType={keyboardType}
          onSubmitEditing={onSubmitEditing}
          // Nach dem Abschicken im Feld bleiben, statt die Tastatur zuzuklappen —
          // sonst muss man vor jeder zweiten Nachricht wieder hineintippen.
          submitBehavior={onSubmitEditing ? 'submit' : undefined}
          autoFocus={autoFocus}
          style={[styles.eingabe, multiline && styles.eingabeHoch, inputStyle]}
        />
        {suffix ? (
          <SsText variant="body" color={colors.inkSoft}>
            {suffix}
          </SsText>
        ) : null}
      </View>

      {error ? (
        <SsText variant="caption" color={status.danger}>
          {error}
        </SsText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: spacing.sm },
  kopf: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },

  feld: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  feldHoch: { alignItems: 'flex-start' },

  eingabe: {
    ...type.body,
    flex: 1,
    // Ohne `minWidth: 0` schrumpft ein `flex: 1`-Kind NICHT unter seine Eigenbreite —
    // in CSS steht `min-width` standardmäßig auf `auto`. In einem schmalen Feld (die
    // Uhrzeit ist auf 160px begrenzt) quoll das Suffix "Uhr" dadurch rechts aus dem
    // Rahmen heraus, statt dass das Eingabefeld Platz macht.
    minWidth: 0,
    color: colors.ink,
    paddingVertical: spacing.md,
    // Web zeichnet um ein fokussiertes Feld von sich aus einen blauen Ring. Der wäre
    // hier eine zweite, fremde Umrandung neben unserer eigenen — und in einer Farbe,
    // die in der App sonst nirgends vorkommt. Sichtbar bleibt der Fokus trotzdem:
    // der eigene Rahmen wird dunkel (siehe `rahmen` oben).
    //
    // BEIDE Zeilen sind nötig. `outlineWidth: 0` allein reicht nicht, weil der
    // Browser-Ring `outline-style: auto` benutzt — und bei `auto` zeichnet Chrome
    // seinen Ring in fester Breite und ignoriert die Angabe. Erst ein echter Stil
    // ("solid") macht die 0 wirksam. `outlineStyle: 'none'` wäre das Naheliegende,
    // ist aber reines Web-CSS: React Native kennt nur 'solid' | 'dotted' | 'dashed'
    // und wirft sonst einen Typfehler. (Dieselbe Falle wie bei `cursor`.)
    outlineStyle: 'solid',
    outlineWidth: 0,
  },
  eingabeHoch: { minHeight: 76, textAlignVertical: 'top' },
});
