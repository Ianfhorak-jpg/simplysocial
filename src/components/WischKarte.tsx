import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  StyleSheet,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { SsText } from './ui';

import {
  MAX_KIPPUNG_GRAD,
  NOTBREITE,
  SCHWELLE,
  SCHWUNG,
  type WischRichtung,
} from '@/features/posts/wisch';
import { colors, radius, spacing, type CategoryPalette } from '@/theme';

/**
 * Eine Karte, die man wegziehen kann.
 *
 * ── Warum `PanResponder` und nicht `react-native-gesture-handler` ─────────────
 * Beide Pakete (`gesture-handler`, `reanimated`) liegen im Projekt, weil Expo sie
 * mitbringt. Benutzt werden sie trotzdem nicht: Sie sind der Teil des Stapels, der
 * auf Web am ehesten anders läuft als auf iOS — und die Web-Version ist gerade das
 * Einzige, was Ian herzeigen kann (harte Regel 1, dieselbe Überlegung wie beim
 * Konfetti in Phase 4). `PanResponder` und `Animated` sind in React Native
 * eingebaut und tun im Browser dasselbe wie am Handy.
 * **Wenn es sich am Handy zäh anfühlt: erst messen, dann tauschen.**
 *
 * ── Warum der Schatten fehlt, den PLAN.md beschreibt ──────────────────────────
 * In PLAN.md steht „hebt sich (Schatten wächst)". In SimplySocial hat aber KEINE
 * Karte einen Schatten — die Tiefe gehört den Buttons, das ist die Design-Regel aus
 * Abschnitt 3 und der Grund, warum `SsCard` bewusst flach ist. Ein Schatten nur an
 * dieser einen Stelle wäre ein zweites Gestaltungsprinzip für einen Effekt. Das
 * Abheben macht deshalb die Abrisskante zusammen mit einer Winzigkeit Vergrößerung:
 * dieselbe Aussage, ohne die Sprache der App zu brechen.
 *
 * ── Warum kein `useNativeDriver` ──────────────────────────────────────────────
 * Im Browser gibt es ihn nicht (siehe `SsKonfetti`), und ein Wert, der per
 * `setValue` aus einer Geste kommt, muss ohnehin durch JavaScript. Einmal `false`
 * überall ist ehrlicher als eine Mischung, bei der die Hälfte der Karte woanders
 * gerechnet wird als die andere.
 */

/** Was der Stapel von außen an der Karte auslösen kann — für die Knöpfe darunter. */
export interface WischKarteHandle {
  wegwerfen: (richtung: WischRichtung) => void;
}

export interface WischKarteProps {
  children: ReactNode;
  /** 0 = ganz oben und anfassbar. 1 und 2 liegen dahinter und reagieren nicht. */
  tiefe: number;
  /** Die Kategoriefarbe der Karte — färbt den „Bin dabei"-Stempel. */
  palette: CategoryPalette;
  onWeg: (richtung: WischRichtung) => void;
  /**
   * Ein Tipp auf die Karte. Kommt bewusst HIER an und nicht über ein `Pressable`
   * im Inhalt — die Begründung steht unten bei `onStartShouldSetPanResponder`.
   */
  onAntippen?: () => void;
}

/** Wie weit die hinteren Karten nach unten rutschen und wie stark sie schrumpfen. */
const VERSATZ = [0, 14, 26];
const SKALA = [1, 0.95, 0.9];

/** Zähne der Abrisskante. Ungerade Zahl, damit in der Mitte einer sitzt. */
const ZAEHNE = 19;

export const WischKarte = forwardRef<WischKarteHandle, WischKarteProps>(function WischKarte(
  { children, tiefe, palette, onWeg, onAntippen },
  ref,
) {
  const { width: fensterBreite } = useWindowDimensions();
  const [breite, setBreite] = useState(0);
  // Bis die Karte einmal gemessen ist, ist die Fensterbreite die beste Schätzung.
  // Sie ist etwas zu groß (die Karte hat Seitenabstände) — dadurch ist die Schwelle
  // beim allerersten Zug minimal strenger und nie zu locker.
  //
  // `NOTBREITE` am Ende ist kein Schönheitsfehler, sondern das, was die Karte gerade
  // hält: Beim Web-Export sind BEIDE Werte 0, und eine Breite von 0 macht aus jedem
  // `inputRange` unten eine Spanne der Breite null. Die Begründung in ganzer Länge
  // steht bei `NOTBREITE` in `features/posts/wisch.ts`.
  const b = breite || fensterBreite || NOTBREITE;

  const pan = useRef(new Animated.ValueXY()).current;
  // Hat sich in DIESER Berührung überhaupt etwas bewegt? Ohne diese Merkerin wäre
  // „hinziehen und wieder zurück" ein Tipp — beim Loslassen ist `dx` dann nämlich
  // wieder null. Im Browser sofort passiert: Karte zurückgeschoben, Post-Detail auf.
  const bewegt = useRef(false);
  // Die Tiefe ist ein eigener Wert und keine Zahl im Style: Wenn die oberste Karte
  // wegfliegt, soll die nächste sichtbar AUFRÜCKEN. Ein Sprung von 0,95 auf 1,0
  // wäre genau der Moment, in dem der Stapel wie eine Liste aussieht.
  const tiefeWert = useRef(new Animated.Value(tiefe)).current;

  // PanResponder wird EINMAL gebaut (siehe unten) und muss trotzdem immer die
  // aktuellen Werte sehen. Deshalb der Umweg über Refs: Props ändern sich, die
  // Handler nicht.
  const onWegRef = useRef(onWeg);
  const onAntippenRef = useRef(onAntippen);
  const tiefeRef = useRef(tiefe);
  const breiteRef = useRef(b);
  useEffect(() => {
    onWegRef.current = onWeg;
    onAntippenRef.current = onAntippen;
    tiefeRef.current = tiefe;
    breiteRef.current = b;
  }, [onWeg, onAntippen, tiefe, b]);

  useEffect(() => {
    Animated.spring(tiefeWert, {
      toValue: tiefe,
      friction: 8,
      tension: 70,
      useNativeDriver: false,
    }).start();
  }, [tiefe, tiefeWert]);

  /** Die Karte verlässt den Stapel: erst hinausfliegen, dann Bescheid sagen. */
  const fliegen = useCallback(
    (richtung: WischRichtung, schwungY = 0) => {
      const ziel = (richtung === 'rechts' ? 1 : -1) * (breiteRef.current + 240);
      Animated.timing(pan, {
        toValue: { x: ziel, y: schwungY * 80 },
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start(({ finished }) => {
        // Nur melden, wenn die Animation wirklich durchgelaufen ist. Wird sie
        // unterbrochen (Karte neu angefasst), wäre „weg" eine Lüge.
        if (finished) onWegRef.current(richtung);
      });
    },
    [pan],
  );

  useImperativeHandle(ref, () => ({ wegwerfen: fliegen }), [fliegen]);

  /**
   * Ist das ein Wisch — oder nur ein Zittern beim Tippen?
   *
   * Waagrecht muss deutlich überwiegen: Sonst fängt die Karte auch senkrechte
   * Bewegungen ab, und die sind im Browser das Scrollen der Seite.
   */
  // Liest `tiefeRef` und sonst nichts aus dem Bauteil — deshalb darf der
  // PanResponder unten diese eine Fassung für immer festhalten.
  const zieht = (dx: number, dy: number) =>
    tiefeRef.current === 0 && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy) * 1.2;

  const responder = useRef(
    PanResponder.create({
      // ── Warum die Karte JEDE Berührung annimmt — und der Inhalt keine ──────
      // In Phase 11 gemessen, und es war nicht die erste Vermutung:
      //
      // Zuerst stand hier `false`, und der Tipp gehörte einem `Pressable` in der
      // `PostCard` (Tipp → Post-Detail). Das Ziehen funktionierte damit sogar —
      // über die Capture-Variante unten holt sich die Karte die Geste zurück,
      // sobald es eine echte Bewegung ist. Kaputt war das LOSLASSEN: Ein Browser
      // erzeugt nach `mousedown` und `mouseup` zusätzlich ein `click` auf dem
      // gemeinsamen Vorfahren beider Punkte — egal, wie weit die Maus dazwischen
      // gewandert ist. Das Responder-System von React Native kennt dieses
      // Ereignis nicht und kann es nicht abbestellen; das `Pressable` von
      // react-native-web hört aber darauf (es braucht es für die Tastatur). Also:
      // Karte weggewischt UND Post-Detail geöffnet.
      //
      // Deshalb nimmt die Karte die Berührung selbst an und entscheidet beim
      // Loslassen, ob es ein Tipp oder ein Wisch war. Ein Weg statt zweier, die
      // sich um dieselbe Berührung streiten. Der Inhalt bekommt dafür KEIN
      // `onPress` mehr (siehe `WischStapel`).
      onStartShouldSetPanResponder: () => tiefeRef.current === 0,

      // Bleibt als Netz: Sollte im Inhalt doch einmal etwas die Geste beanspruchen,
      // holt die Capture-Variante sie zurück, sobald wirklich gezogen wird. Sie
      // wird auf dem Weg NACH UNTEN gefragt, also vor dem Kind — die normale Frage
      // stellt React Native einem Elternteil gar nicht mehr, sobald ein Kind
      // Empfänger ist.
      onMoveShouldSetPanResponder: (_, g) => zieht(g.dx, g.dy),
      onMoveShouldSetPanResponderCapture: (_, g) => zieht(g.dx, g.dy),

      // ── Und die Falle DAHINTER, die nur am schmalen Fenster auftrat ─────────
      // Am Schreibtisch (900 px breit) lief das Wischen einwandfrei, in Handybreite
      // (390 px) bewegte sich die Karte keinen Millimeter. Gemessen mit einer
      // Sonde in genau diesen Handlern sah die Spur so aus:
      //
      //     start:0 · grant · move:-18 · terminationRequest · TERMINATE
      //
      // Nach dem ERSTEN Move fragt jemand, ob er die Geste haben darf — und die
      // Voreinstellung von `PanResponder` lautet „ja". Danach ist die Karte raus
      // und federt zurück, während der Finger weiterzieht. Am breiten Fenster
      // fragte nie jemand, deshalb fiel es dort nicht auf.
      //
      // Für einen Wischstapel ist die Antwort immer NEIN: Wer die Karte einmal
      // angefasst hat, behält sie, bis er loslässt. Ein Zug, der auf halber
      // Strecke den Besitzer wechselt, ist kein Zug mehr.
      onPanResponderTerminationRequest: () => false,

      onPanResponderGrant: () => {
        bewegt.current = false;
        // Eine Karte, die gerade zurückfedert, kann man erneut anfassen. Ohne das
        // Anhalten läuft die alte Animation weiter und zerrt gegen den Finger.
        pan.stopAnimation();
      },

      onPanResponderMove: (_, g) => {
        if (Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6) bewegt.current = true;
        // Senkrecht stark gedämpft: Die Karte darf dem Finger folgen, aber sie soll
        // sichtbar an einer waagrechten Schiene hängen.
        pan.setValue({ x: g.dx, y: g.dy * 0.25 });
      },

      onPanResponderRelease: (_, g) => {
        // Nichts bewegt, in der GANZEN Berührung nicht: Das war ein Tipp. Auf
        // `g.dx` allein wäre Verlass — bis jemand die Karte anschiebt, es sich
        // anders überlegt und sie zurückschiebt. Dann steht `dx` beim Loslassen
        // wieder auf null, und die App öffnete den Post, den man gerade NICHT
        // wollte.
        if (!bewegt.current && Math.abs(g.dx) < 6 && Math.abs(g.dy) < 6) {
          onAntippenRef.current?.();
          return;
        }

        const weitGenug = Math.abs(g.dx) > breiteRef.current * SCHWELLE;
        const schnellGenug = Math.abs(g.vx) > SCHWUNG;
        if (weitGenug || schnellGenug) {
          fliegen(g.dx > 0 ? 'rechts' : 'links', g.vy);
          return;
        }
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          friction: 6,
          tension: 90,
          useNativeDriver: false,
        }).start();
      },

      onPanResponderTerminate: () => {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          friction: 6,
          tension: 90,
          useNativeDriver: false,
        }).start();
      },
    }),
  ).current;

  // Alles, was aus der Zugstrecke folgt. `useMemo`, weil `interpolate` bei jedem
  // Rendern sonst neue Objekte baut — bei 60 Bildern je Sekunde ist das messbar.
  const { kippung, stempelLinks, stempelRechts, abriss, anheben } = useMemo(() => {
    const s = b * SCHWELLE;
    return {
      kippung: pan.x.interpolate({
        inputRange: [-b, 0, b],
        outputRange: [`-${MAX_KIPPUNG_GRAD * 2}deg`, '0deg', `${MAX_KIPPUNG_GRAD * 2}deg`],
        extrapolate: 'clamp',
      }),
      // Der Stempel erscheint erst kurz vor der Schwelle und ist genau dort voll da.
      // Damit ist er nicht Dekoration, sondern die Antwort auf „reicht das schon?".
      stempelLinks: pan.x.interpolate({
        inputRange: [-s, -s * 0.35, 0],
        outputRange: [1, 0, 0],
        extrapolate: 'clamp',
      }),
      stempelRechts: pan.x.interpolate({
        inputRange: [0, s * 0.35, s],
        outputRange: [0, 0, 1],
        extrapolate: 'clamp',
      }),
      // Ein V: nach beiden Seiten gleich. So sieht man die Abrisskante, sobald sich
      // die Karte überhaupt löst — egal wohin.
      abriss: pan.x.interpolate({
        inputRange: [-s, 0, s],
        outputRange: [1, 0, 1],
        extrapolate: 'clamp',
      }),
      anheben: pan.x.interpolate({
        inputRange: [-s, 0, s],
        outputRange: [1.02, 1, 1.02],
        extrapolate: 'clamp',
      }),
    };
  }, [b, pan.x]);

  const versatzY = tiefeWert.interpolate({
    inputRange: [0, 1, 2],
    outputRange: VERSATZ,
    extrapolate: 'clamp',
  });
  const stapelSkala = tiefeWert.interpolate({
    inputRange: [0, 1, 2],
    outputRange: SKALA,
    extrapolate: 'clamp',
  });

  const messen = (e: LayoutChangeEvent) => setBreite(e.nativeEvent.layout.width);

  return (
    <Animated.View
      onLayout={messen}
      style={[
        styles.karte,
        {
          transform: [
            { translateX: pan.x },
            { translateY: Animated.add(pan.y, versatzY) },
            { rotate: kippung },
            { scale: Animated.multiply(stapelSkala, anheben) },
          ],
        },
      ]}
      // Nur die oberste Karte hört zu. Die hinteren dürfen nicht einmal einen Tipp
      // abfangen — sonst öffnet man ein Post-Detail, das man gar nicht sieht.
      {...(tiefe === 0 ? responder.panHandlers : {})}>
      {children}

      <Abrisskante deckkraft={abriss} />

      {/* Die Stempel sitzen auf der GEGENÜBERLIEGENDEN Seite der Zugrichtung, und
          das ist kein Versehen: Zieht man die Karte nach rechts, verlässt ihr
          rechter Rand als Erstes das Bild — ein Stempel dort wäre genau dann nicht
          mehr zu sehen, wenn er die Frage „reicht das schon?" beantworten soll.
          Beim ersten Bauen stand es andersherum, im Browser war es sofort zu
          sehen. */}
      <Stempel
        deckkraft={stempelRechts}
        text="Bin dabei"
        farbe={palette.base}
        style={[styles.stempelLinks, { transform: [{ rotate: '-12deg' }] }]}
      />
      <Stempel
        deckkraft={stempelLinks}
        text="Weg"
        farbe={colors.inkSoft}
        style={[styles.stempelRechts, { transform: [{ rotate: '12deg' }] }]}
      />
    </Animated.View>
  );
});

/**
 * Die Kante, an der sich die Karte vom Block löst — Ians Bild vom Post-it.
 *
 * Gezeichnet aus Views statt aus einem Bild: neunzehn Kreise in der Hintergrund-
 * farbe, halb über den oberen Rand hinausgeschoben und vom `overflow: hidden`
 * abgeschnitten. Übrig bleiben die unteren Hälften — eine Perforation. Das ist
 * dieselbe Bauart wie beim Konfetti: keine Datei, kein Paket, überall gleich.
 */
function Abrisskante({ deckkraft }: { deckkraft: Animated.AnimatedInterpolation<number> }) {
  return (
    <Animated.View style={[styles.abriss, { opacity: deckkraft }]}>
      {Array.from({ length: ZAEHNE }, (_, i) => (
        <View key={i} style={styles.zahn} />
      ))}
    </Animated.View>
  );
}

function Stempel({
  deckkraft,
  text,
  farbe,
  style,
}: {
  deckkraft: Animated.AnimatedInterpolation<number>;
  text: string;
  farbe: string;
  style: StyleProp<ViewStyle>;
}) {
  return (
    <Animated.View
      style={[styles.stempel, { borderColor: farbe, opacity: deckkraft }, style]}
      accessible={false}>
      <SsText variant="label" color={farbe}>
        {text}
      </SsText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Alle Karten des Stapels liegen an derselben Stelle übereinander. Die Höhe
  // bestimmt jede Karte selbst — dadurch ist eine Karte mit langer Notiz höher,
  // statt dass alle auf das größte Maß aufgeblasen werden.
  //
  // `top` fehlt mit Absicht: Ohne Angabe entscheidet das `justifyContent` der
  // Stapelfläche, wo die Karte senkrecht sitzt — die Karten stehen dadurch in der
  // Mitte statt oben zu kleben. Yoga rechnet das so, Browser rechnen es für
  // absolute Kinder eines Flex-Kastens genauso. Sollte es eine Plattform doch
  // anders machen, fallen die Karten nach oben — also auf das Verhalten, das sie
  // vorher hatten. Ein Fehler entsteht dabei nicht.
  karte: {
    position: 'absolute',
    left: 0,
    right: 0,
    // Beim Ziehen markiert der Browser sonst den Text der Karte — blaue Fläche
    // über einer Karte, die gerade wegfliegt. Auf nativ tut die Angabe nichts.
    userSelect: 'none',
  },

  abriss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    overflow: 'hidden',
    // Als Prop wäre `pointerEvents` seit React Native 0.76 veraltet (Phase 4).
    pointerEvents: 'none',
  },
  zahn: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.bg, marginTop: -5 },

  stempel: {
    position: 'absolute',
    // UNTEN und nicht oben: Der Stempel deckt zu, was unter ihm liegt, und oben
    // steht der Titel — also genau das, woran man die Karte erkennt. Unten liegt
    // die Fußzeile mit Name und Plätzen; die hat man gelesen, bevor man zieht.
    bottom: spacing.lg,
    borderWidth: 3,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    pointerEvents: 'none',
  },
  stempelLinks: { left: spacing.lg },
  stempelRechts: { right: spacing.lg },
});
