import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

import { CATEGORY_ORDER, categoryColors, radius } from '@/theme';

/**
 * Der Match-Moment (PLAN.md, Abschnitt 3): 34 kleine Schnipsel in den
 * Aktivitätsfarben fallen über den Screen und drehen sich dabei.
 *
 * ── Warum `Animated` und keine Konfetti-Bibliothek ────────────────────────────
 * Harte Regel 1 aus CLAUDE.md: im Prototyp bleibt alles JS-only. Die verbreiteten
 * Konfetti-Pakete bringen native Module mit — die brauchen einen EAS-Build und
 * gefährden genau das, was hier zählt: dass die Web-Version verlässlich läuft.
 * `Animated` ist in React Native eingebaut und tut auf Web dasselbe wie auf iOS.
 *
 * ── Warum EIN Animated.Value für alles ────────────────────────────────────────
 * Naheliegend wäre je Schnipsel eine eigene Animation mit eigenem `delay`. Das wären
 * 34 laufende Timer, die einzeln aufgeräumt werden müssen. Stattdessen läuft ein
 * einziger Wert von 0 auf 1, und jeder Schnipsel rechnet sich daraus per
 * `interpolate` seinen Ausschnitt: Wer bei 0,2 loslegt, bekommt einen Eingabebereich,
 * der bei 0,2 anfängt. Die Verzögerung ist dann Mathematik statt Zeitsteuerung.
 */

const ANZAHL = 34;
const DAUER = 2800;

/** Die sechs Aktivitätsfarben — das Konfetti besteht aus der App selbst. */
const FARBEN = CATEGORY_ORDER.map((k) => categoryColors[k].base);

interface Schnipsel {
  links: number; // Anteil der Breite, 0…1
  breite: number;
  hoehe: number;
  farbe: string;
  rund: boolean;
  start: number; // wann er losfällt, als Anteil am Gesamtfortschritt
  spanne: number; // wie lange er fällt
  drehung: number; // Grad über die ganze Strecke, mit Vorzeichen
  seite: number; // Ausschlag des Pendelns nach links/rechts
}

function zufall(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function schnipselBauen(): Schnipsel[] {
  return Array.from({ length: ANZAHL }, () => {
    const breite = zufall(6, 13);
    return {
      links: Math.random(),
      breite,
      // Mal Streifen, mal fast quadratisch — gleich große Rechtecke sähen aus wie Regen.
      hoehe: breite * zufall(0.5, 1.8),
      farbe: FARBEN[Math.floor(Math.random() * FARBEN.length)],
      rund: Math.random() < 0.25,
      start: zufall(0, 0.32),
      spanne: zufall(0.5, 0.72),
      drehung: zufall(180, 900) * (Math.random() < 0.5 ? -1 : 1),
      seite: zufall(8, 26) * (Math.random() < 0.5 ? -1 : 1),
    };
  });
}

export function SsKonfetti() {
  const { width, height } = useWindowDimensions();
  const fortschritt = useRef(new Animated.Value(0)).current;
  const [ruhig, setRuhig] = useState(false);

  // Einmal würfeln und dann behalten. Ohne `useMemo` bekäme jeder Neuzeichnen-Durchlauf
  // andere Farben und Positionen — das Konfetti würde flackern statt fallen.
  const schnipsel = useMemo(schnipselBauen, []);

  // Wer im Betriebssystem "Bewegung reduzieren" eingeschaltet hat, bekommt kein
  // Konfetti. Der Screen sagt die frohe Botschaft ohnehin in Worten; die Animation
  // ist Schmuck, und Schmuck darf man abschalten können.
  useEffect(() => {
    let lebt = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((an) => {
        if (lebt && an) setRuhig(true);
      })
      .catch(() => {
        // Nicht jede Plattform beantwortet die Frage. Dann fällt Konfetti.
      });
    return () => {
      lebt = false;
    };
  }, []);

  useEffect(() => {
    if (ruhig) return;
    const lauf = Animated.timing(fortschritt, {
      toValue: 1,
      duration: DAUER,
      easing: Easing.linear,
      // Den nativen Treiber gibt es im Browser nicht — ohne diese Abfrage steht bei
      // jedem Match eine Warnung in der Konsole.
      useNativeDriver: Platform.OS !== 'web',
    });
    lauf.start();
    return () => lauf.stop();
  }, [fortschritt, ruhig]);

  if (ruhig) return null;

  return (
    // `pointerEvents: 'none'` steht im STYLE, nicht als Prop: als Prop ist es seit
    // React Native 0.76 veraltet und schreibt bei jedem Match eine Warnung in die
    // Konsole. Ohne die Einstellung läge das Konfetti über dem ganzen Screen und
    // finge genau den Knopf ab, zu dem es hinführen soll.
    <Animated.View style={styles.flaeche} accessible={false}>
      {schnipsel.map((s, i) => {
        const ende = Math.min(1, s.start + s.spanne);

        const fallen = fortschritt.interpolate({
          inputRange: [s.start, ende],
          outputRange: [-40, height + 40],
          extrapolate: 'clamp',
        });

        // Das Pendeln macht aus dem Fallen ein Flattern. Vier Stützstellen reichen —
        // mehr sieht man bei 13 Pixeln Kantenlänge ohnehin nicht.
        const pendeln = fortschritt.interpolate({
          inputRange: [s.start, s.start + (ende - s.start) * 0.33, s.start + (ende - s.start) * 0.66, ende],
          outputRange: [0, s.seite, -s.seite * 0.8, s.seite * 0.4],
          extrapolate: 'clamp',
        });

        const drehen = fortschritt.interpolate({
          inputRange: [s.start, ende],
          outputRange: ['0deg', `${s.drehung}deg`],
          extrapolate: 'clamp',
        });

        // Am Ende ausblenden, sonst verschwinden die letzten Schnipsel schlagartig,
        // wenn die Animation steht.
        const deckkraft = fortschritt.interpolate({
          inputRange: [0, 0.82, 1],
          outputRange: [1, 1, 0],
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.schnipsel,
              {
                left: s.links * width,
                width: s.breite,
                height: s.hoehe,
                backgroundColor: s.farbe,
                borderRadius: s.rund ? radius.pill : 1,
                opacity: deckkraft,
                transform: [{ translateY: fallen }, { translateX: pendeln }, { rotate: drehen }],
              },
            ]}
          />
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Ausgeschrieben statt `StyleSheet.absoluteFill`: das ist in dieser React-Native-
  // Version eine registrierte Style-ID und lässt sich nicht mit `overflow` mischen.
  flaeche: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  schnipsel: { position: 'absolute', top: 0 },
});
