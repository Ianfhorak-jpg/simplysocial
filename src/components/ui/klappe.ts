import { useEffect, useRef, useState } from 'react';
import { Animated, type LayoutChangeEvent } from 'react-native';

import { bewegung } from '@/lib/bewegung';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS AUFKLAPPT — der Regler, der Jahrgangs-Balken (Phase 20.13)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Ians Satz am 2026-09-20 über den Regler oben: *„es kommt ja noch nicht runter …
 * ich will, dass es so mäßig rauskommt. Und dann diese Bar eben zeigt."*
 *
 * Bis dahin war der Regler ein `filterOffen ? <FilterBereich/> : null` — **halbe
 * Bildschirmhöhe in einem einzigen Frame**, und seit Entscheidung 90 der
 * meistbenutzte Sprung der App.
 *
 * ── Warum KEIN `LayoutAnimation`, obwohl es eine Zeile wäre ──────────────────
 * Weil es auf diesem Gerät vielleicht gar nichts tut. React Native 0.86 sagt es im
 * eigenen Quelltext (`Libraries/LayoutAnimation/LayoutAnimation.js:92`):
 *
 * > *„In Fabric, LayoutAnimations are unconditionally enabled for Android, and
 * > **conditionally enabled on iOS** (pending fully shipping; this is a temporary
 * > state)."*
 *
 * Dieses Projekt läuft auf Fabric (Expo 57 / RN 0.86). Eine Animation, die still
 * ausfallen kann, ist hier die schlechteste Sorte Code: **Man sieht denselben harten
 * Sprung wie vorher und sucht den Fehler im Timing** statt in der Plattform. Das ist
 * wörtlich die Falle *„Ein Effekt, der nicht zu sehen ist, ist nicht dasselbe wie ein
 * Effekt, der nicht läuft."*
 *
 * `Animated` mit gemessener Höhe tut es überall und ist dasselbe System wie die
 * sieben Animationen, die es im Projekt schon gibt. Kein zweites.
 *
 * ── Warum ein Hook und kein Baustein mit Kindern ─────────────────────────────
 * 🔴 **Weil `null` eine Bedeutung trägt, die erhalten bleiben muss.** Der Regler
 * hängt an ZWEI Stellen: im Fluss unter der Kopfzeile, und im Wischstapel als
 * `blatt` über den Karten (harte Regel 36). `WischStapel` prüft `blatt ? … : null`
 * — ein Baustein, der immer ein Element zurückgibt, gäbe dem Stapel **dauerhaft ein
 * Blatt über den Karten**, auch geschlossen und unsichtbar. Ein Hook, der `sichtbar`
 * meldet, lässt die bestehende Bedingung stehen.
 *
 * ── Was die Messung wert ist ─────────────────────────────────────────────────
 * Die Höhe kommt aus `onLayout` und nicht aus einer Zahl im Code. Eine feste Zahl
 * wäre hier besonders falsch: Der Regler ist je nach Filterstand verschieden hoch
 * (Kategorien, Wann, Jahrgang), und auf einem kleinen Schirm ist eine feste Höhe
 * *„eine ganz andere Höhe"*.
 *
 * ⚠️ Beim ERSTEN Öffnen ist noch nichts gemessen. Dann läuft der Inhalt bei Höhe 0
 * unter `overflow: 'hidden'` — er ist eine Bildwiederholung lang unsichtbar, und die
 * Animation startet, sobald `messen` die Zahl geliefert hat.
 */

/**
 * Ein Auf- und Zuklappen, das die Höhe seines Inhalts selbst misst.
 *
 * ```tsx
 * const klappe = useKlappe(filterOffen);
 * const feld = klappe.sichtbar ? (
 *   <Animated.View style={klappe.stil}>
 *     <View onLayout={klappe.messen}>
 *       <FilterBereich … />
 *     </View>
 *   </Animated.View>
 * ) : null;
 * ```
 *
 * ⚠️ `onLayout` gehört an das INNERE View, nicht an das animierte: Das animierte hat
 * ja gerade die Höhe, die wir setzen — es würde seine eigene Vorgabe zurückmelden und
 * die Klappe bei 0 festnageln.
 */
export function useKlappe(offen: boolean) {
  // Nicht `useRef(…).current`: Der Wert wird im Render gelesen (`stil` unten), und
  // `react-hooks/refs` verbietet das zu Recht. Siehe `theme/druck.ts`.
  const [auf] = useState(() => new Animated.Value(offen ? 1 : 0));
  const [hoehe, setHoehe] = useState(0);
  /**
   * Was die zuletzt FERTIGE Bewegung hinterlassen hat.
   *
   * ⚠️ Das ist absichtlich nicht „ist sichtbar" — sonst müsste es beim Öffnen im
   * Effekt-Körper gesetzt werden, und `setState` synchron im Effekt ist ein Fehler
   * (kaskadierende Renders, React-Compiler-Regel). So wird es **nur im Rückruf der
   * Animation** gesetzt, also asynchron, und `sichtbar` ist eine reine Ableitung.
   */
  const [zeigtNoch, setZeigtNoch] = useState(offen);
  // Die zuletzt gemessene Höhe, ohne dass die Messung ein neues Zeichnen auslöst.
  const gemessen = useRef(0);

  // Offen heißt sofort sichtbar; geschlossen bleibt so lange stehen, bis die
  // Bewegung durch ist — sonst wäre der Inhalt weg, bevor man ihn hat gehen sehen.
  const sichtbar = offen || zeigtNoch;

  useEffect(() => {
    const lauf = Animated.timing(auf, {
      toValue: offen ? 1 : 0,
      ...(offen ? bewegung.klappeAuf : bewegung.klappeZu),
      // Höhe lässt sich nicht nativ treiben — sie ist Layout, keine Darstellung.
      useNativeDriver: false,
    });
    lauf.start(({ finished }) => {
      if (finished) setZeigtNoch(offen);
    });
    return () => lauf.stop();
  }, [offen, auf]);

  return {
    /** Ob der Inhalt überhaupt gebaut werden soll — schließt den Nachlauf mit ein. */
    sichtbar,
    /** Ans INNERE View, nicht ans animierte. */
    messen: (e: LayoutChangeEvent) => {
      const h = e.nativeEvent.layout.height;
      // Nur bei echter Änderung neu zeichnen. Ohne diese Schranke meldet `onLayout`
      // während der Bewegung laufend neue Werte und die Klappe jagt sich selbst.
      if (h > 0 && Math.abs(h - gemessen.current) > 0.5) {
        gemessen.current = h;
        setHoehe(h);
      }
    },
    stil: {
      overflow: 'hidden' as const,
      // Vor der ersten Messung gibt es keine Höhe, die man anfahren könnte. Dann
      // steht die Klappe offen auf `auto` — sichtbar ohne Bewegung ist besser als
      // unsichtbar mit.
      height: hoehe === 0 ? undefined : auf.interpolate({ inputRange: [0, 1], outputRange: [0, hoehe] }),
      // Die Deckkraft zieht mit, damit der Inhalt nicht an der eigenen Kante
      // abgeschnitten wirkt, sondern kommt.
      //
      // ⚠️ Sie darf hier nur, weil unter dem Regler KEIN Glas liegt: Eltern-Opazität
      // gilt für den ganzen Teilbaum und schaltet Liquid Glass ab (harte Regel 61).
      // Wer diese Klappe später über etwas aus Glas legt, nimmt die Zeile heraus.
      opacity: auf,
    },
  };
}
