import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, PanResponder, Platform, StyleSheet, View } from 'react-native';

import { SsGlas } from './SsGlas';

import { colors, MAX_CONTENT_WIDTH, radius } from '@/theme';

/**
 * Das ziehbare Blatt — Phase 19e, Ians Entscheidung 40.
 *
 * Es liegt über einer Vollbild-Karte und lässt sich an seinem Griff auf drei
 * Raststufen ziehen: **zu · halb · ganz**. Das Muster kennt jeder von Apple Karten,
 * und genau das war Ians Vorgabe — *„so wie wenn man bei Apple auf Karten geht."*
 *
 * ── Die teuerste Stelle der Phase, und sie ist die erste Zeile Code ───────────
 * Unter dem Blatt liegt ein Kartenzeichner mit `onStartShouldSetPanResponder:
 * () => true` — er beansprucht **jede** Berührung. Zwei Gesten-Erkenner übereinander,
 * die beide ziehen wollen, streiten sich um jeden Finger, und wer gewinnt, hängt an
 * der Reihenfolge im Baum. Dieselbe Familie wie harte Regel 44 (ein Regler in einer
 * ScrollReihe) und wie die Phase-11-Falle.
 *
 * **Der Ausweg ist keine Aushandlung, sondern eine Fläche: Nur der GRIFF zieht.**
 * Der Körper des Blattes ist ein gewöhnlicher Container ohne Erkenner, die Karte
 * daneben bekommt ihre Berührungen unverändert. Wer den Erkenner später auf die
 * ganze Blattfläche legt, macht aus einer klaren Trennung eine Aushandlung — und
 * die verhält sich auf Web und auf iOS verschieden, weil dort seit 19d-1 MapKit
 * selbst die Gesten mitbringt.
 *
 * ── Warum die Raststufen ANTEILE sind und keine Zahlen ────────────────────────
 * Die Lehre aus 19b, wörtlich: Mit festen 230 px bekam die Liste auf 390 × 844 gute
 * 266 px und auf **360 × 600 genau 22 px**. Was unter etwas Festem liegt, bemisst
 * sich am Anteil. Die Ausnahme ist die unterste Stufe: Sie ist genau so hoch wie der
 * Kopf des Blattes — und die wird deshalb GEMESSEN, nicht geschätzt. Ein Kopf ist
 * kein Anteil am Schirm, er ist eine Zeile Text mit einem Griff darüber.
 *
 * ── Warum der Körper eine feste Höhe bekommt und nicht `flex: 1` ──────────────
 * Ein Blatt in voller Containerhöhe, das man halb hinunterschiebt, hat die untere
 * Hälfte seiner Liste UNTER dem Bildrand — man scrollt und sieht die Hälfte nie.
 * Der Körper ist deshalb genau so hoch wie das, was von der aktuellen Raststufe
 * sichtbar ist. Er wird **beim Einrasten** neu gesetzt und nicht während des Ziehens:
 * Das sind drei Layouts statt sechzig je Sekunde, und im Ruhezustand stimmt es.
 *
 * ── Die Falle mit der gemessenen Höhe (`NOTHOEHE`) ────────────────────────────
 * Alles hier hängt an der Höhe des Platzes. Beim Web-Export gibt es kein Fenster,
 * `onLayout` feuert nie und die Höhe wäre **null** — das Blatt wäre unsichtbar und
 * der Screen sähe beim ersten Bildaufbau leer aus. Dieselbe Falle wie `NOTBREITE`
 * in `SsWienKarte` (2026-09-03) und derselbe Ausweg: ein Rückfall, gegen den
 * gerechnet wird, bis wirklich gemessen ist.
 */

/** Höhe, mit der gerechnet wird, solange nichts gemessen ist. Siehe oben. */
const NOTHOEHE = 480;

/** Kopfhöhe, solange sie nicht gemessen ist — Griff plus eine Zeile. */
const NOTKOPF = 76;

/**
 * Die drei Raststufen als Anteil an der Höhe des Platzes.
 *
 * `zu` ist bewusst 0: Diese Stufe kommt nicht von hier, sondern aus dem gemessenen
 * Kopf (siehe `stufenHoehen`). Der Eintrag steht trotzdem in der Liste, damit die
 * Reihenfolge der Stufen an EINER Stelle steht und nicht zweimal.
 */
export const BLATT_STUFEN = { zu: 0, halb: 0.5, ganz: 0.92 } as const;

export type BlattStufe = keyof typeof BLATT_STUFEN;

/** In welche Richtung eine Wischbewegung zählt, ab welcher Geschwindigkeit. */
const SCHWUNG = 0.4;

export interface SsBlattProps {
  /**
   * Der Kopf: Titelzeile und alles, was auch bei zugezogenem Blatt zu sehen sein
   * soll. Der Griff darüber gehört dazu — **gemessen wird beides zusammen, und
   * diese Höhe IST die unterste Raststufe.**
   *
   * ⚠️ **Das war in 19e-1 ein Fehler und ist am 2026-09-07 berichtigt:** Gemessen
   * wurde nur dieser Knoten, der Griff (28 px) aber mitgezeichnet. Bei zugezogenem
   * Blatt blieb deshalb genau der Griff stehen und die Titelzeile lag darunter
   * abgeschnitten — die Stufe hieß „zu" und zeigte weniger, als sie versprach. Der
   * `onLayout` sitzt jetzt an der Glasfläche, die Griff UND Kopf umfasst; damit
   * gibt es weiterhin EINE Messung und keine Addition, die jemand vergessen kann.
   */
  kopf: ReactNode;
  /** Der Körper — bekommt genau die Höhe, die die aktuelle Stufe hergibt. */
  children: ReactNode;
  /** Womit das Blatt aufschlägt. Voreinstellung: halb offen. */
  start?: BlattStufe;
  /**
   * Wie viele Bildpunkte oben frei bleiben müssen — die schwebende Leiste mit
   * Umschalter und „Posten"-Knopf.
   *
   * **Gefunden am 2026-09-07, und nur am Bild:** Mit `ganz` als reinem Anteil (0,92)
   * fuhr das Blatt UNTER die Pille — Griff und Überschrift lagen dahinter. Der
   * Anteil ist auf einem 552-px-Schirm eine andere Zahl als auf 844, die Leiste
   * dagegen ist überall gleich hoch. **Deshalb ist das ein gemessener Deckel und
   * kein weiterer Anteil** — dieselbe Unterscheidung wie unten beim Kopf.
   */
  maxOben?: number;
  /**
   * Mindestens so weit offen — das Blatt fährt hoch, wenn es tiefer steht, und
   * bleibt sonst, wo es ist.
   *
   * ── Warum das keine Steuerung von außen ist ─────────────────────────────────
   * Gebraucht wird es für den aufgeklappten Filterbereich: Der ist rund 250 px hoch
   * und passt bei halb offenem Blatt nicht hinein — er würde am `overflow: hidden`
   * abgeschnitten. Der naheliegende Weg wäre gewesen, das Blatt ganz von außen zu
   * steuern; dann gäbe es die Stufe aber ZWEIMAL (hier und im Screen), und die zwei
   * liefen beim ersten Zug am Griff auseinander. **Eine Untergrenze ist kein
   * zweiter Zustand**, sie ist eine Bitte — das Ziehen bleibt ungeteilt hier.
   */
  mindestens?: BlattStufe;
  /**
   * Wie viele Bildpunkte unten schon belegt sind — seit Phase 19e-2 die
   * schwebende Tab-Leiste (`useTabRand()`).
   *
   * **Dieselbe Unterscheidung wie `maxOben`, nur andersherum**: Was dort steht,
   * ist gemessen und kein Anteil. Ohne diesen Wert säße das zugezogene Blatt genau
   * hinter der Leiste — der Griff wäre unerreichbar, und zwar erst auf einem Gerät
   * mit Home-Anzeige (34 px Sicherheitsabstand) und nicht im Browser.
   */
  unten?: number;
  /** Wird beim Einrasten gerufen — nicht während des Ziehens. */
  onStufe?: (stufe: BlattStufe, sichtbar: number) => void;
}

/** Die Stufen von unten nach oben — die Reihenfolge trägt die Bedeutung „weiter offen". */
const REIHE: BlattStufe[] = ['zu', 'halb', 'ganz'];

export function SsBlatt({
  kopf,
  children,
  start = 'halb',
  maxOben = 0,
  mindestens,
  unten = 0,
  onStufe,
}: SsBlattProps) {
  const [platz, setPlatz] = useState(0);
  const [kopfHoehe, setKopfHoehe] = useState(0);
  const [stufe, setStufe] = useState<BlattStufe>(start);

  const hoehe = platz || NOTHOEHE;
  const kopfMass = kopfHoehe || NOTKOPF;

  /**
   * Wie viel bei jeder Stufe zu sehen ist, in Bildpunkten.
   *
   * `zu` ist der gemessene Kopf — und nie mehr als die halbe Stufe, sonst rasten
   * zwei Stufen auf demselben Wert ein und das Blatt lässt sich nicht mehr
   * zuziehen. Der Fall ist auf einem 600-px-Schirm mit einem hohen Kopf real.
   */
  const stufenHoehen = useMemo(() => {
    const halb = hoehe * BLATT_STUFEN.halb;
    return {
      zu: Math.min(kopfMass, halb - 1),
      halb,
      // Der Anteil sagt, wie weit das Blatt aufgehen SOLL; der Deckel sagt, wo etwas
      // anderes schon steht. Es gewinnt der kleinere — siehe `maxOben`.
      ganz: Math.min(hoehe * BLATT_STUFEN.ganz, hoehe - maxOben),
    } as Record<BlattStufe, number>;
  }, [hoehe, kopfMass, maxOben]);

  /**
   * Die sichtbare Höhe als `Animated.Value` — während des Ziehens rendert damit
   * nichts neu. Dieselbe Bauart wie das Schieben in `SsWienKarte`: Der Wert wird am
   * React-Baum vorbei gesetzt, und erst beim Einrasten übernimmt ihn der Zustand.
   */
  const sichtbar = useRef(new Animated.Value(0)).current;
  /** Derselbe Wert als gewöhnliche Zahl — die Handler brauchen ihn zum Rechnen. */
  const jetzt = useRef(0);
  const masse = useRef({ stufenHoehen, onStufe });
  /** Die aktuelle Stufe für den Effekt darunter — siehe dort, warum nicht als Abhängigkeit. */
  const stufeJetzt = useRef(stufe);
  stufeJetzt.current = stufe;

  useEffect(() => {
    masse.current = { stufenHoehen, onStufe };
  }, [stufenHoehen, onStufe]);

  /**
   * Beim ersten Messen und bei jeder Größenänderung (Drehen, Fenster ziehen) sitzt
   * das Blatt neu auf seiner Stufe. Ohne das bliebe es auf einer Höhe stehen, die zu
   * einem Schirm gehört, den es nicht mehr gibt.
   *
   * **`stufe` steht bewusst NICHT in der Abhängigkeitsliste**, sondern in einem Ref:
   * Sonst liefe dieser Effekt auch nach jedem Einrasten und setzte den Wert hart auf
   * das Ziel — die Feder wäre jedes Mal übersprungen und das Blatt spränge, statt zu
   * gleiten.
   */
  useEffect(() => {
    const ziel = stufenHoehen[stufeJetzt.current];
    jetzt.current = ziel;
    sichtbar.setValue(ziel);
    // Auch das ist eine Auskunft: Die Karte darunter muss wissen, wie viel von ihr
    // verdeckt ist, und beim ERSTEN Messen hat noch niemand gezogen. Ohne diese
    // Zeile bekäme sie ihren Wert erst, wenn jemand das Blatt anfasst.
    //
    // Gelesen wird `onStufe` aus dem Ref und nicht aus den Props: Sonst hinge dieser
    // Effekt an der IDENTITÄT einer Funktion, die der Screen bei jedem Rendern neu
    // erzeugt — er liefe dann bei jedem Rendern, nicht bei jeder Größenänderung.
    masse.current.onStufe?.(stufeJetzt.current, ziel);
  }, [stufenHoehen, sichtbar]);

  /**
   * Auf eine Stufe gleiten — der eine Weg, auf dem sich das Blatt bewegt.
   *
   * Es gibt drei Auslöser (Loslassen, Abbruch der Geste, `mindestens`), und alle
   * drei gehen hier durch: Sonst stünden Feder, Zustand und Rückmeldung dreimal da,
   * und beim nächsten Umbau wäre eine davon vergessen.
   */
  const gleiten = useCallback(
    (ziel: BlattStufe) => {
      const h = masse.current.stufenHoehen;
      jetzt.current = h[ziel];
      Animated.spring(sichtbar, {
        toValue: h[ziel],
        useNativeDriver: false,
        bounciness: 2,
        speed: 14,
      }).start();
      setStufe(ziel);
      masse.current.onStufe?.(ziel, h[ziel]);
    },
    [sichtbar],
  );

  // Eine Untergrenze von außen — siehe die Prop `mindestens`. Sie zieht nur hoch,
  // nie herunter: Wer das Blatt selbst ganz aufgezogen hat, soll es nicht dadurch
  // verlieren, dass er einen Filter zuklappt.
  useEffect(() => {
    if (!mindestens) return;
    if (REIHE.indexOf(stufeJetzt.current) >= REIHE.indexOf(mindestens)) return;
    gleiten(mindestens);
  }, [mindestens, gleiten]);

  const griff = useRef<View>(null);
  const responder = useMemo(() => {
    const einrasten = (wert: number, schwung: number) => {
      const h = masse.current.stufenHoehen;
      const naechste = REIHE.reduce((a, b) =>
        Math.abs(h[b] - wert) < Math.abs(h[a] - wert) ? b : a,
      );
      // Ein Schwung zählt mehr als die Nähe: Wer schnell nach unten wischt, will
      // zumachen, auch wenn er auf halbem Weg loslässt. `vy` ist beim Ziehen nach
      // OBEN negativ — dieselbe Vorzeichen-Falle wie bei `dy` im Move-Handler.
      let ziel = naechste;
      if (Math.abs(schwung) > SCHWUNG) {
        const hoch = schwung < 0;
        const weiter = hoch
          ? REIHE.find((s) => h[s] > wert + 1)
          : [...REIHE].reverse().find((s) => h[s] < wert - 1);
        ziel = weiter ?? naechste;
      }
      gleiten(ziel);
    };

    let basis = 0;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // Phase 11, teuer bezahlt: Sonst nimmt die Liste im Blatt oder die Karte
      // darunter dem Griff die Geste beim ersten Zucken ab.
      onPanResponderTerminationRequest: () => false,

      onPanResponderGrant: () => {
        basis = jetzt.current;
      },
      onPanResponderMove: (_e, geste) => {
        const h = masse.current.stufenHoehen;
        // Nach oben ziehen heißt „mehr zeigen", und `dy` ist dabei negativ.
        const wert = Math.max(h.zu, Math.min(h.ganz, basis - geste.dy));
        jetzt.current = wert;
        sichtbar.setValue(wert);
      },
      onPanResponderRelease: (_e, geste) => einrasten(jetzt.current, geste.vy),
      // Nimmt uns doch jemand die Geste ab, kommt kein `Release` mehr — das Blatt
      // bliebe zwischen zwei Stufen stehen. Dieselbe Überlegung wie beim
      // `onPanResponderTerminate` der Karte.
      onPanResponderTerminate: (_e, geste) => einrasten(jetzt.current, geste.vy),
    });
  }, [sichtbar, gleiten]);

  /**
   * Auf Web: Der Browser darf beim Ziehen am Griff nicht selbst scrollen.
   *
   * Ohne `touch-action: none` behandelt Chrome am Handy die senkrechte Bewegung als
   * Seiten-Scroll und der `PanResponder` sieht sie nie — dieselbe Zeile und
   * derselbe Grund wie in `SsWienKarte`.
   */
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const knoten = griff.current as unknown as HTMLElement | null;
    if (!knoten || !knoten.style) return;
    knoten.style.touchAction = 'none';
  }, []);

  const koerperHoehe = Math.max(0, stufenHoehen[stufe] - kopfMass);

  return (
    // `box-none`: Diese Schicht selbst fängt nichts ab, ihre Kinder schon — was
    // neben dem Blatt liegt, kommt weiter bei der Karte an. Im `style`, nie als
    // Prop (ACTA-Falle).
    <View
      style={[styles.huelle, { bottom: unten }]}
      onLayout={(e) => setPlatz(e.nativeEvent.layout.height)}>
      <Animated.View
        style={[
          styles.blatt,
          {
            height: hoehe,
            transform: [{ translateY: Animated.subtract(hoehe, sichtbar) }],
          },
        ]}>
        {/* Das GANZE Blatt ist auf iOS 26 aus echtem Glas (Phase 19e-2, Ians
            Entscheidung 43) — darunter liegt die Karte, also gibt es hier wirklich
            etwas zu brechen. Überall sonst ist es dieselbe helle Fläche wie bisher.

            **Erst war nur der KOPF aus Glas, und das war sichtbar falsch:** Direkt
            darunter begann die deckende Liste, und die Naht zwischen den zwei
            Materialien lief quer durchs Blatt. Ein Blatt ist EIN Ding — bei Apple
            Karten auch. Der Preis ist bekannt und angenommen: Die Liste liegt damit
            auf mattiertem Glas statt auf Weiß; `regular` ist dick genug, dass der
            Text steht (die dünne Stufe `clear` wäre es nicht, siehe `GLAS_STIL`).

            Der Kopf bleibt trotzdem die eine Stelle, die GEMESSEN wird: Griff plus
            Titelzeile zusammen ergeben die unterste Raststufe (siehe `kopf`). */}
        <SsGlas style={styles.blattGlas}>
          <View
            onLayout={(e) => setKopfHoehe(e.nativeEvent.layout.height)}
            style={styles.kopfInhalt}>
            <View ref={griff} style={styles.griffFlaeche} {...responder.panHandlers}>
              <View style={styles.griff} />
            </View>
            {kopf}
          </View>

          <View style={{ height: koerperHoehe }}>{children}</View>
        </SsGlas>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Ausgeschriebene Kanten statt `absoluteFill`: Das ist eine registrierte Style-ID
  // und lässt sich nicht mit eigenen Werten mischen (ACTA-Falle).
  huelle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  // KEIN `left/right: 0`: Ein absolutes Kind ohne waagrechte Kanten richtet sich
  // nach dem `alignItems` des Elternteils — nur so greift `maxWidth` und das Blatt
  // bleibt am Desktop so breit wie die App und nicht wie das Fenster.
  blatt: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    // KEINE eigene Farbe mehr seit Phase 19e-2: Der Kopf bringt seine mit (Glas
    // oder helle Fläche), der Körper darunter seine. Eine deckende Fläche hier
    // läge HINTER dem Glas und machte es zu einer teuren weißen Fläche.
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    // Der Schatten trägt Bedeutung und ist keine Zier: Das Blatt liegt ÜBER einer
    // Karte, und ohne Abhebung liest man es als Teil von ihr. Dieselbe Begründung
    // wie beim Prototyp-Hinweis — es sind die einzigen zwei Stellen mit Schatten.
    boxShadow: '0 -6px 24px rgba(23, 25, 28, 0.14)',
  },
  // Der Radius steht hier NOCH EINMAL, obwohl das Blatt `overflow: 'hidden'` hat:
  // Auf iOS ist das Glas eine native Ansicht, und die schneidet der Elternteil
  // nicht zuverlässig auf seine Rundung zurecht.
  blattGlas: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  kopfInhalt: { width: '100%' },
  // Der Griff ist der EINZIGE Ort mit einem Gesten-Erkenner. Die Fläche ist
  // absichtlich höher als der Strich darin: Ein 5 px hoher Balken ist kein Ziel für
  // einen Daumen, 28 px sind eines.
  griffFlaeche: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    // Ohne das markiert ein Zug am Griff im Browser den Text ringsum blau — die
    // Geste beginnt auf diesem Knoten, und Chrome fängt dort eine Auswahl an.
    // Dieselbe Zeile und derselbe Grund wie an der Blase in Phase 19c; auf dem
    // Gerät sieht man es nie, im Prototyp bei jedem Ziehen.
    userSelect: 'none',
  },
  griff: {
    width: 36,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.line,
  },
});
