import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { SsIcon } from './SsIcon';
import { SsText } from './SsText';

import { GLAS_AUSWAHL } from './glas-typen';

import { bewegung } from '@/lib/bewegung';
import { colors, radius, spacing } from '@/theme';
import type { IconName } from '@/theme/icons';

export interface SsSegmentOption<T> {
  wert: T;
  label: string;
  /**
   * Statt der Beschriftung ein Zeichen — Phase 19f, Ians Entscheidung 54.
   *
   * `label` bleibt trotzdem Pflicht und verschwindet nicht: Es wird zum
   * `accessibilityLabel`. Ein Knopf ohne Namen ist für VoiceOver ein Knopf ohne
   * Funktion, und beim App-Store-Review ist das kein Detail.
   */
  icon?: IconName;
}

export interface SsSegmentProps<T> {
  options: readonly SsSegmentOption<T>[];
  value: T;
  onChange: (wert: T) => void;
  style?: StyleProp<ViewStyle>;
  /**
   * Der Umschalter steht auf GLAS — dann wird die Auswahl eine Aufhellung statt
   * einer deckenden Fläche (siehe `GLAS_AUSWAHL`).
   *
   * ⚠️ **Nicht die Voreinstellung, und das ist Absicht.** Auf normalem Grund
   * (`colors.surface`, etwa beim Posten) wäre eine Aufhellung um 22 % kaum zu sehen
   * — dort trägt gerade die deckende Fläche die Aussage „genau dieses von beidem".
   */
  aufGlas?: boolean;
}

/**
 * Die geteilte Fläche für ein Entweder-oder: „Alle | Wem ich folge" im Feed,
 * „Für alle | Nur meine Follower" beim Posten.
 *
 * ── Warum nicht zwei Pillen wie bei den Kategorien ────────────────────────────
 * Pillen sind eine Liste, aus der man auswählt — man könnte auch keine nehmen. Eine
 * geteilte Fläche sagt von selbst „genau eins von beidem", ohne dass es jemand
 * erklärt. Im Feed käme dazu, dass zwei Chip-Reihen übereinander wie eine einzige
 * lange Filterliste aussähen und „Alle" zweimal dastünde.
 *
 * Der Typ ist offen (`T`), damit man den Wert direkt bekommt, den man weiterverwendet
 * — `true`/`false` im Feed, `'public'`/`'followers'` beim Posten. Ohne das müsste
 * jeder Screen einen Index in seinen eigenen Wert zurückübersetzen.
 *
 * ── Seit Phase 20.13: die dunkle Fläche GLEITET ──────────────────────────────
 * Ians Satz am 2026-09-20: *„diese Transition zwischen Karte und Feed, da muss man
 * auch eine sehr gute Animation machen."* Vorher sprang die Fläche von einer Hälfte
 * zur anderen — zwei Flächen, von denen eine an- und eine ausging. Jetzt ist es
 * **eine** Fläche, die umzieht; das ist Apples eigenes Idiom im `UISegmentedControl`.
 *
 * ── Warum die Hälften sich MESSEN und nichts gerechnet wird ──────────────────
 * Die Pille müsste sonst aus Innenabstand, Zwischenraum, Rahmenstärke und Anzahl
 * zusammengerechnet werden — vier Zahlen, die alle in `styles` stehen und sich
 * ändern dürfen, ohne dass es hier jemand merkt. Jede Hälfte meldet stattdessen
 * ihre eigene Lage (`onLayout`), und die Pille interpoliert zwischen den gemeldeten
 * Werten. Das überlebt jede Layout-Änderung und gilt für zwei Stufen wie für drei.
 *
 * ⚠️ **Bis gemessen ist, sitzt die Fläche wie früher an der Hälfte selbst.** Ohne
 * diesen Rückfall stünde im ersten Bild weiße Schrift auf hellem Grund.
 */
export function SsSegment<T extends string | number | boolean>({
  options,
  value,
  onChange,
  style,
  aufGlas,
}: SsSegmentProps<T>) {
  const index = Math.max(0, options.findIndex((o) => o.wert === value));
  // Lage und Breite jeder Hälfte, wie sie sich selbst gemeldet haben.
  const [masse, setMasse] = useState<{ x: number; breite: number }[]>([]);
  const bereit = masse.length === options.length && options.length > 0;

  const [gleit] = useState(() => new Animated.Value(index));
  useEffect(() => {
    const lauf = Animated.timing(gleit, {
      toValue: index,
      ...bewegung.gleiten,
      // `translateX` und `width` in einem: Die Breite muss mit, sobald die Hälften
      // einmal ungleich breit sind — und Breite kann der native Treiber nicht.
      useNativeDriver: false,
    });
    lauf.start();
    return () => lauf.stop();
  }, [index, gleit]);

  // Eine Spanne der Breite null liefert bei `interpolate` den EXTREMWERT statt der
  // Mitte — deshalb braucht die einstufige Leiste einen zweiten Stützpunkt.
  const stuetzen = options.length > 1 ? options.map((_, i) => i) : [0, 1];
  const werte = (feld: 'x' | 'breite') =>
    options.length > 1 ? masse.map((m) => m[feld]) : [masse[0]?.[feld] ?? 0, masse[0]?.[feld] ?? 0];

  return (
    <View style={[styles.leiste, style]}>
      {bereit ? (
        // Die Pille steht als ERSTES Kind im Baum und liegt damit unter den Hälften.
        // Ein `zIndex` wäre die zweite Wahrheit über dieselbe Sache.
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pille,
            aufGlas && styles.pilleAufGlas,
            {
              transform: [{ translateX: gleit.interpolate({ inputRange: stuetzen, outputRange: werte('x') }) }],
              width: gleit.interpolate({ inputRange: stuetzen, outputRange: werte('breite') }),
            },
          ]}
        />
      ) : null}
      {options.map((o, i) => {
        const aktiv = o.wert === value;
        return (
          <Pressable
            key={String(o.wert)}
            onPress={() => onChange(o.wert)}
            onLayout={(e) => {
              const { x, width } = e.nativeEvent.layout;
              setMasse((alt) => {
                if (alt[i] && Math.abs(alt[i].x - x) < 0.5 && Math.abs(alt[i].breite - width) < 0.5) return alt;
                const neu = [...alt];
                neu[i] = { x, breite: width };
                return neu;
              });
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: aktiv }}
            accessibilityLabel={o.label}
            style={({ pressed }) => [
              styles.haelfte,
              // Nur solange die Pille noch nicht messen konnte — siehe Kopfkommentar.
              aktiv && !bereit && styles.haelfteAktiv,
              pressed && !aktiv && styles.haelfteGedrueckt,
            ]}>
            {o.icon ? (
              // Auf Glas bleibt das aktive Zeichen HELL: Die Pille darunter ist dort
              // keine weiße Fläche mehr, sondern eine Aufhellung. Ein dunkles Zeichen
              // hätte nichts mehr, worauf es dunkel wäre.
              <SsIcon
                name={o.icon}
                size={19}
                color={aktiv ? (aufGlas ? colors.ink : colors.surface) : colors.inkSoft}
              />
            ) : (
              <SsText
                variant="label"
                center
                color={aktiv ? (aufGlas ? colors.ink : colors.surface) : colors.inkSoft}
                numberOfLines={1}>
                {o.label}
              </SsText>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  leiste: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
  },
  haelfte: {
    flex: 1,
    // Die Icon-Fassung (Entscheidung 54) zentriert ihr Zeichen — ohne das klebt es
    // links, weil ein `SsIcon` anders als ein `SsText center` keine Breite füllt.
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    // 8 statt 12 seit Phase 19b, und das ist eine Messung: Mit DREI Stufen
    // („Stapel · Liste · Karte") passt die Leiste auf einem 360-px-Schirm neben
    // „Noch 12 Karten" höchstens 232 px breit sein. Bei 12 px Innenabstand bekommt
    // „Stapel" davon 47,33 px und braucht 47 — es ging also rechnerisch gerade
    // eben auf, und beim nächsten Gerät mit einer Spur breiterer Schrift stünde
    // wieder „Sta…" da (Phase 11), wie schon „Jeder kann anfr…" (Phase 18a).
    // Mit 8 px sind es 55,3 gegen 47. Die zweistufigen Leisten gewinnen dadurch
    // ebenfalls Platz für ihre Beschriftung — die Änderung schadet keiner.
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    cursor: 'pointer',
  },
  /**
   * Die gleitende Fläche. `top`/`bottom` statt einer Höhe: Sie soll genau so hoch
   * sein wie eine Hälfte, und wie hoch das ist, entscheidet deren Innenabstand.
   */
  pille: {
    position: 'absolute',
    top: spacing.xs,
    bottom: spacing.xs,
    left: 0,
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
  },
  /** Auf Glas: eine Aufhellung statt einer Fläche — siehe `GLAS_AUSWAHL`. */
  pilleAufGlas: { backgroundColor: GLAS_AUSWAHL },
  /** Nur noch der Rückfall, bis die Pille ihre erste Messung hat. */
  haelfteAktiv: { backgroundColor: colors.ink },
  haelfteGedrueckt: { backgroundColor: colors.bg },
});
