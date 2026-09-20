import { useMemo, useState } from 'react';
import { Animated, Platform, Pressable } from 'react-native';

import { bewegung, type Spur } from '@/lib/bewegung';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS BEIM DRÜCKEN PASSIERT — an EINER Stelle (Phase 20.10, bewegt seit 20.13)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Bis Phase 20.10 gab es die Rückmeldung zweimal: `SsButton` rechnete sie aus
 * `DEPTH` und dem Umriss aus, und der runde „Posten"-Knopf im Feed rechnete
 * dieselbe Rechnung noch einmal nach — mit einem Kommentar daneben, der sagte
 * *„dieselbe Rechnung wie in `SsButton`, damit sich beide gleich anfühlen"*.
 *
 * **Genau dieser Kommentar ist der Grund für diese Datei.** Wo einer steht, ist die
 * Gleichheit eine Absichtserklärung und keine Tatsache: Sie hält genau so lange,
 * wie sich jemand daran erinnert. Beim nächsten Drehen an der Zahl hätte einer der
 * beiden Knöpfe sie mitbekommen und der andere nicht — und aufgefallen wäre das
 * niemandem, weil die zwei Knöpfe nebeneinander stehen und man Bewegung nicht
 * vergleicht, sondern nur spürt.
 *
 * Dieselbe Bauart und derselbe Grund wie bei `glas-typen.ts` (harte Regel 61) und
 * `karte-typen.ts` (52).
 *
 * ── Warum Schrumpfen und Opazität, und warum BEIDES ──────────────────────────
 * Das Schrumpfen ist das iOS-Idiom: So verhält sich jedes Symbol auf dem
 * Homescreen und jeder Schalter im Kontrollzentrum. Allein reicht es aber nicht —
 * auf einem `block`-Knopf über die volle Breite sind 4 % von rund 340 pt etwa 13 pt,
 * verteilt auf zwei Seiten, und das sieht man kaum. Die Opazität trägt den Rest und
 * wirkt bei jeder Knopfgröße gleich stark.
 *
 * ── Warum `transform` und nicht mehr Layout ─────────────────────────────────
 * Der alte Weg (`borderBottomWidth` weg, `marginTop` dazu) musste die Höhe von Hand
 * konstant halten, sonst wäre alles darunter im Screen geruckt. Ein `transform`
 * wirkt NACH dem Layout: Der Kasten belegt unverändert seinen Platz, es gibt nichts
 * auszugleichen. Deshalb ist die Rückmeldung reine Darstellung.
 *
 * ── Diese zwei Zahlen sind Gefühl und gehören Ian ────────────────────────────
 * Sie sind am Gerät zu beurteilen, nicht am Mac. Ab etwa 0,92 sieht ein breiter
 * Knopf aus, als kippe er weg, statt gedrückt zu werden — die Bewegung liest sich
 * dann als Animation und nicht mehr als Berührung. Wer dreht, dreht HIER, und es
 * gilt sofort für jeden Knopf der App.
 *
 * ── Seit Phase 20.13: der WEG dorthin ist eine Bewegung ──────────────────────
 * Ians Auftrag am 2026-09-20 war, *„dass die Änderungen nicht instant kommen"*. Beim
 * Nachsehen stellte sich heraus: **`DRUCK` war gar keine Animation.** Ein statischer
 * Style, angewandt über `pressed && DRUCK` — der Knopf sprang auf 96 % und hart
 * zurück. Das war wörtlich das „instant", das weg soll.
 *
 * **Die zwei Zahlen sind unverändert.** Neu ist allein, dass sie angefahren werden
 * statt gesetzt. Das Tempo steht nicht hier, sondern in `lib/bewegung.ts`: Diese
 * Datei besitzt weiter das **Gefühl** (wie weit, wie durchsichtig, welche Art wo),
 * jene das **Tempo** der ganzen App.
 */

/** Wie weit ein Knopf nachgibt. Ians Zahl — siehe Kopfkommentar. */
const SKALA = 0.96;
/** Wie durchsichtig er dabei wird. Ians Zahl. */
const DECKKRAFT = 0.82;

/**
 * Welche Art von Rückmeldung eine Fläche gibt.
 *
 * **`'knopf'`** — Schrumpfen UND Deckkraft. Der Normalfall, das iOS-Idiom.
 *
 * **`'glas'`** — **nur** Schrumpfen, dieselbe 0,96, keine Deckkraft. Eltern-Opazität
 * gilt für den ganzen Teilbaum: Läge sie auf einem `Pressable`, das ein `<SsGlas
 * schwebt>` enthält, **schaltete der Knopf sein Liquid Glass beim Drücken ab** —
 * ausgerechnet der Knopf aus Ians Vorbild (harte Regel 61). Genau das tat `SsBack`
 * bis Phase 20.13.
 *
 * Statisch wären 4 % von 44 pt zu wenig gewesen, um die fehlende Deckkraft zu
 * ersetzen — **animiert nicht**: Bewegung sieht das Auge weit besser als einen
 * Versatz. Die Animation ist also nicht nur schöner, sie macht diese Art erst möglich.
 *
 * *Verworfen: die Opazität aufs KIND statt auf die Fläche zu legen. Technisch erlaubt,
 * aber dann hätte die App zwei Drucksprachen, je nachdem ob zufällig Glas darunter
 * liegt.*
 */
export type DruckArt = 'knopf' | 'glas';

/**
 * Die Rückmeldung fürs Drücken — Stil und Griffe für ein `Pressable`.
 *
 * ```tsx
 * const druck = useDruck();
 * <DruckFlaeche {...druck.griff} style={[styles.knopf, druck.stil]} />
 * ```
 *
 * ⚠️ **`druck.stil` steht im Array ZULETZT.** Sonst überschreibt ein durchgereichtes
 * `style` die Animation still — kein Fehler, keine Bewegung, und gesucht hätte man
 * lange.
 *
 * ── Warum EIN Wert für Skala und Deckkraft ──────────────────────────────────
 * Beide hängen an demselben `Animated.Value` und können nicht auseinanderlaufen.
 * Zwei getrennte Animationen mit derselben Dauer sind nicht dasselbe wie eine —
 * dasselbe Argument wie in `AntwortLeiste.tsx:50-52`.
 */
export function useDruck(art: DruckArt = 'knopf') {
  // 0 ist Ruhe, 1 ist gedrückt. Nicht die Zahlen selbst, damit die Interpolation
  // beide Eigenschaften aus EINEM Wert speisen kann.
  //
  // ⚠️ Ein `useRef(new Animated.Value(0)).current` wäre der naheliegende Weg und steht
  // so in `AntwortLeiste:51`. **Hier geht er nicht:** Dort wird der Wert nur im
  // `useEffect` angefasst, hier im RENDER (`interpolate` unten). `react-hooks/refs`
  // verbietet genau das, und die Regel hat recht — ein Render darf kein Ref lesen.
  // Ein `useState` mit Initialisierer-Funktion erzeugt das Objekt ebenso genau einmal
  // und darf gelesen werden. Gesetzt wird es nie; der Setzer fehlt deshalb absichtlich.
  const [wert] = useState(() => new Animated.Value(0));

  return useMemo(() => {
    const fahre = (zu: number, spur: Spur) =>
      Animated.timing(wert, {
        toValue: zu,
        ...spur,
        // Den nativen Treiber gibt es im Browser nicht — ohne diese Abfrage steht bei
        // jedem Druck eine Warnung in der Konsole. Bauart wie `SsKonfetti:105`.
        useNativeDriver: Platform.OS !== 'web',
      }).start();

    const skala = wert.interpolate({ inputRange: [0, 1], outputRange: [1, SKALA] });

    return {
      griff: {
        onPressIn: () => fahre(1, bewegung.druckHinein),
        onPressOut: () => fahre(0, bewegung.druckHeraus),
      },
      stil:
        art === 'glas'
          ? { transform: [{ scale: skala }] }
          : {
              transform: [{ scale: skala }],
              opacity: wert.interpolate({ inputRange: [0, 1], outputRange: [1, DECKKRAFT] }),
            },
    };
  }, [wert, art]);
}

/**
 * Ein `Pressable`, das `druck.stil` tragen kann.
 *
 * Ein blankes `Pressable` nimmt keine `Animated`-Knoten an — der Stil käme still nicht
 * an. Wo der Stil auf einem INNEREN View sitzt (`SsButton`, `PostCard`, `SsCard`),
 * braucht es das hier nicht; dort tut es ein `Animated.View`, und der Stil muss dort
 * auch bleiben: Zöge man ihn aufs `Pressable` hoch, änderte sich `alignSelf`/Flex.
 *
 * ⚠️ Anders als beim blanken `Pressable` ist `style` hier **kein Funktions-Prop mehr**.
 * Das ist kein Verlust, sondern der Punkt: `pressed` wird nicht mehr gebraucht, weil
 * die Griffe den Zustand führen.
 */
export const DruckFlaeche = Animated.createAnimatedComponent(Pressable);
