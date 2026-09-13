import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Modal, PanResponder, StyleSheet, useWindowDimensions, View } from 'react-native';

import { SsButton, SsText } from '@/components/ui';
import {
  zuschnittAnfang,
  zuschnittFolgen,
  zuschnittRechteck,
  zuschnittSchieben,
  zuschnittZoomen,
  type BildGroesse,
  type ZuschnittSicht,
} from '@/features/social/zuschnitt';
import type { Bildquelle } from '@/lib/bild-waehlen-typen';
import { colors, spacing } from '@/theme';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DAS RUNDE FENSTER — Phase 20.6-d, Ians Wunsch vom 2026-09-13
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sein Satz war: *„bitte kreisförmiges Zuschneiden."* Gespeichert wird trotzdem ein
 * QUADRAT — die Begründung steht im Kopf von `features/social/zuschnitt.ts` (JPEG hat
 * keinen Alphakanal). Rund ist das Fenster, durch das man schaut, und `SsAvatar`
 * zeichnet später denselben Kreis.
 *
 * ── Dieser Bildschirm rechnet NICHT ─────────────────────────────────────────
 * Er hält einen `ZuschnittSicht` und fragt bei jeder Frage die Regel-Datei. Wo das
 * Quadrat liegt, wie weit man zoomen darf, in welche Richtung ein Finger schiebt:
 * alles dort, alles von `91_zuschnitt.mjs` gemessen (47 Häkchen, zwei Gegenproben).
 * Hier steht nur, wie es AUSSIEHT. Dieselbe Arbeitsteilung wie `SsWienKarte` zu
 * `lib/karte-geo.ts` (harte Regel 48).
 *
 * ── Warum es einen Kreis gibt, obwohl React Native keine Maske kennt ────────
 * Es gibt kein `mask-image`. Der Kreis entsteht **geometrisch**: Im quadratischen
 * Fenster (`overflow: 'hidden'`) liegt ein Ring — ein View der doppelten Kantenlänge,
 * mittig versetzt, mit `borderRadius` = Kantenlänge und `borderWidth` = halbe
 * Kantenlänge. Sein Rand füllt damit alles zwischen Radius F/2 und F, und die Ecken
 * des Quadrats liegen bei F·√2/2 ≈ 0,71·F — also mitten im Ring. Innen bleibt der
 * Kreis frei.
 *
 * ⚠️ **Der Ring ist `pointerEvents: 'none'`, und das steht im `style`** — nicht als
 * Prop. `pointerEvents` als eigene Prop ist in React Native 0.86 abgeschafft
 * (FALLEN.md). Stünde es falsch, läge über dem ganzen Fenster eine Fläche, die jede
 * Berührung schluckt, und das Bild ließe sich nicht mehr schieben.
 *
 * ── Warum das Fenster NICHT dunkel ist ──────────────────────────────────────
 * Jede Foto-App macht den Zuschneide-Bildschirm schwarz. Diese hier ist Papierweiß
 * (`colors.bg`), und ein schwarzer Vollbild-Einschub mitten im Ablauf wäre ein
 * fremder Bildschirm — dazu käme weißer Text auf dunklem Grund, den es in der ganzen
 * App sonst nirgends gibt. Abgedunkelt wird deshalb nur der RING, also genau das,
 * was weggeschnitten wird.
 */

type Props = {
  quelle: Bildquelle;
  /** Läuft gerade das Zuschneiden oder Hochladen? Dann warten beide Knöpfe. */
  wartet?: boolean;
  onAbbrechen: () => void;
  onUebernehmen: (sicht: ZuschnittSicht) => void;
};

/** Wie stark der Ring abdunkelt. Dunkel genug zum Unterscheiden, hell genug zum Erkennen. */
const RING = 'rgba(23, 25, 28, 0.55)';

export function BildZuschneiden({ quelle, wartet, onAbbrechen, onUebernehmen }: Props) {
  const schirm = useWindowDimensions();

  // ── Die Fenstergröße wird GERECHNET, nicht gemessen ───────────────────────
  // `onLayout` wäre der naheliegende Weg und meldet auf Web erst NACH dem ersten
  // Zeichnen (FALLEN.md) — das Fenster hätte also einen Bildschirm lang die Breite
  // null, und `zuschnittPixelJePunkt()` müsste genau dafür einen Notwert liefern.
  // Aus `useWindowDimensions` steht die Zahl beim ersten Render schon da.
  //
  // Der Deckel über die HÖHE ist die Lehre aus „Eine feste Höhe ist auf einem
  // kleinen Schirm eine ganz andere Höhe": Auf einem iPhone SE bliebe für Sätze und
  // Knöpfe sonst nichts übrig.
  const fenster = Math.max(120, Math.min(schirm.width - spacing.lg * 2, schirm.height * 0.5));

  // Ein eigenes Objekt je Render wäre für `useMemo` jedes Mal ein neuer Wert — und
  // damit ein neuer `PanResponder` bei jedem Bild einer Geste.
  const bild = useMemo<BildGroesse>(
    () => ({ breite: quelle.breite, hoehe: quelle.hoehe }),
    [quelle.breite, quelle.hoehe],
  );

  // Die Wahrheit steht im Ref, die Anzeige im State. Der Ref, weil eine Fingergeste
  // dreißigmal in der Sekunde fragt, was gerade gilt — und `sicht` aus dem State
  // wäre in den Handlern der Stand vom letzten Render.
  //
  // **Der State steht ZUERST und das Ref bekommt seinen Wert von ihm**, nicht
  // umgekehrt: `useState(sichtRef.current)` liest während des Renderns aus einem
  // Ref, und genau das ist die Falle „Eine Fabrik-Funktion, die ein Ref anfasst, ist
  // ein Lint-Fehler" (FALLEN.md).
  const [sicht, setSicht] = useState<ZuschnittSicht>(() => zuschnittAnfang(bild));
  const sichtRef = useRef<ZuschnittSicht>(sicht);
  const letzte = useRef({ dx: 0, dy: 0, abstand: 0 });

  // Maße gehören MIT ins Ref — dieselbe Bauart und dieselbe Begründung wie `masse`
  // in `SsWienKarte`: Ein `PanResponder` wird EINMAL gebaut und sähe sonst für immer
  // die Werte des ersten Renderns. Dreht jemand das Handy, ändert sich `fenster`,
  // und die Umrechnung Finger → Pixel wäre ab da falsch.
  const masse = useRef({ bild, fenster });
  useEffect(() => {
    masse.current = { bild, fenster };
  }, [bild, fenster]);

  function setzen(neu: ZuschnittSicht) {
    sichtRef.current = neu;
    setSicht(neu);
  }

  const greifer = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        // ⚠️ **Die Zeile aus Phase 11, und sie gilt hier genauso.** Fragt ein
        // Elternteil (ein ScrollView, ein Navigator) nach der Geste, ist die
        // Voreinstellung „ja" — und das Bild bliebe mitten im Ziehen stehen.
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          letzte.current = { dx: 0, dy: 0, abstand: 0 };
        },
        onPanResponderMove: (ereignis, geste) => {
          const finger = ereignis.nativeEvent.touches;

          if (finger.length >= 2) {
            // ── Kneifen ──────────────────────────────────────────────────────
            // Gemessen wird der ABSTAND der zwei Finger, nicht `gestureState`:
            // `dx`/`dy` ist bei mehreren Fingern der MITTELPUNKT (FALLEN.md) und
            // sagt über das Kneifen gar nichts.
            const abstand = Math.hypot(
              finger[0].pageX - finger[1].pageX,
              finger[0].pageY - finger[1].pageY,
            );
            if (letzte.current.abstand > 0 && abstand > 0) {
              // Ein Verhältnis gehört multipliziert — die Begründung steht an
              // `zuschnittZoomen()`.
              setzen(zuschnittZoomen(masse.current.bild, sichtRef.current, abstand / letzte.current.abstand));
            }
            letzte.current.abstand = abstand;
            // Der Mittelpunkt wird trotzdem mitgeschrieben: Hebt gleich ein Finger
            // ab, springt `geste.dx` vom Mittelpunkt auf den verbliebenen Finger.
            // Ohne diese zwei Zeilen wäre dieser Sprung ein Ruck im Bild.
            letzte.current.dx = geste.dx;
            letzte.current.dy = geste.dy;
            return;
          }

          // ── Schieben ─────────────────────────────────────────────────────
          // `geste.dx` zählt vom BEGINN der Geste, nicht vom letzten Bild. Wer ihn
          // direkt weiterreicht, verschiebt bei jedem Bild um den gesamten
          // bisherigen Weg — das Bild schösse aus dem Fenster.
          const dx = geste.dx - letzte.current.dx;
          const dy = geste.dy - letzte.current.dy;
          letzte.current.dx = geste.dx;
          letzte.current.dy = geste.dy;
          letzte.current.abstand = 0;
          setzen(
            zuschnittSchieben(masse.current.bild, sichtRef.current, dx, dy, masse.current.fenster),
          );
        },
        onPanResponderRelease: () => {
          letzte.current = { dx: 0, dy: 0, abstand: 0 };
        },
        onPanResponderTerminate: () => {
          letzte.current = { dx: 0, dy: 0, abstand: 0 };
        },
      }),
    // Leer, und das ist der Punkt: Der Responder wird EINMAL gebaut. Alles, was sich
    // ändern kann, holt er sich bei jedem Griff frisch aus `masse.current`.
    [],
  );

  // ── Wo das Bild liegt, folgt aus demselben Rechteck, das gleich geschnitten wird ──
  // **Das ist der Grund, warum man dem Fenster glauben kann.** Die Anzeige wird nicht
  // aus `sicht` nachgerechnet, sondern aus `zuschnittRechteck()` — also aus genau der
  // Zahl, die später bei `crop` ankommt, gerundet und geklemmt und alles. Was im
  // Kreis steht, IST der Ausschnitt; es gibt keine zweite Rechnung, die davon
  // abweichen könnte.
  const rechteck = zuschnittRechteck(bild, sicht);
  const massstab = fenster / rechteck.width;

  return (
    <Modal visible transparent={false} animationType="fade" onRequestClose={onAbbrechen}>
      <View style={styles.schirm}>
        <SsText variant="title" center>
          Ausschnitt wählen
        </SsText>

        <View
          style={[styles.fenster, { width: fenster, height: fenster, borderRadius: fenster / 2 }]}
          {...greifer.panHandlers}>
          <Image
            source={{ uri: quelle.uri }}
            // `stretch` und nicht `cover`: Breite und Höhe sind hier auf das Pixel
            // ausgerechnet, das Seitenverhältnis stimmt also schon. `cover` würde
            // noch einmal selbst anpassen — und dann zeigte das Fenster etwas
            // anderes als das Rechteck sagt.
            resizeMode="stretch"
            style={{
              position: 'absolute',
              left: -rechteck.originX * massstab,
              top: -rechteck.originY * massstab,
              width: bild.breite * massstab,
              height: bild.hoehe * massstab,
            }}
          />
          {/* Der Ring — siehe der Kopf dieser Datei. `pointerEvents` steht im `style`. */}
          <View
            style={[
              styles.ring,
              {
                left: -fenster / 2,
                top: -fenster / 2,
                width: fenster * 2,
                height: fenster * 2,
                borderRadius: fenster,
                borderWidth: fenster / 2,
              },
            ]}
          />
        </View>

        <View style={styles.saetze}>
          {zuschnittFolgen().map((satz) => (
            <SsText key={satz} variant="caption" color={colors.inkSoft} center>
              {satz}
            </SsText>
          ))}
        </View>

        <View style={styles.knoepfe}>
          {/* Abbrechen steht links und ist ein Umriss: Es ist der Weg zurück, nicht
              die Absicht. Wer hier ist, wollte ein Bild setzen. */}
          <SsButton label="Abbrechen" variant="ghost" onPress={onAbbrechen} disabled={wartet} style={styles.knopf} />
          <SsButton
            label="Übernehmen"
            onPress={() => onUebernehmen(sichtRef.current)}
            wartet={wartet}
            style={styles.knopf}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  schirm: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    padding: spacing.lg,
  },
  fenster: {
    // Das Quadrat klippt alles, was über seinen Rand hinausragt — also das Bild UND
    // den Ring. Ohne `overflow` stünde der Ring über den halben Bildschirm.
    overflow: 'hidden',
    backgroundColor: colors.line,
  },
  ring: {
    position: 'absolute',
    borderColor: RING,
    // Der Ring liegt ÜBER dem Bild und darf keine Berührung annehmen — sonst ließe
    // sich das Foto nicht mehr schieben. `pointerEvents` gehört seit React Native
    // 0.86 in den `style` und nicht mehr an die Prop (FALLEN.md).
    pointerEvents: 'none',
  },
  saetze: { gap: spacing.xs, alignItems: 'center' },
  knoepfe: { flexDirection: 'row', gap: spacing.md, alignSelf: 'stretch' },
  // Beide Knöpfe teilen sich die Breite. `flex: 1` heißt in React Native
  // `flexBasis: 0` (FALLEN.md) — also wirklich halbe/halbe, unabhängig davon, dass
  // „Übernehmen" das längere Wort ist.
  knopf: { flex: 1 },
});
