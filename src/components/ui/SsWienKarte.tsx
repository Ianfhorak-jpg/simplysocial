import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Platform, Pressable, StyleSheet, View } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';

import { SsText } from './SsText';
import { BEZIRKE, KARTE_BREITE, KARTE_HOEHE } from '@/data/wien-bezirke';
import {
  KARTE_LEER,
  KARTE_MIN_BAND,
  KARTE_QUELLE,
  STUFEN,
  TIPP_WEG_MAX,
  ZOOM_MAX,
  ZOOM_MIN,
  stufeFuer,
} from '@/features/posts/karte';
import { bezirkAn } from '@/lib/karte-treffer';
import type { KartenAnker, SsKarteProps } from './karte-typen';
import { colors } from '@/theme';

/**
 * Die Props sind seit Phase 19d **nicht mehr die dieses Bausteins**, sondern die
 * aller Kartenzeichner — sie stehen in `karte-typen.ts`, samt der Begründung, warum
 * sie keinem einzelnen Zeichner gehören. `SsWienKarteProps` bleibt als Name stehen,
 * damit im Zeichner selbst zu lesen ist, was er bekommt.
 */
export type SsWienKarteProps = SsKarteProps;

/**
 * Die Wien-Karte — 23 Bezirksflächen, eingefärbt nach „wie viel ist hier los".
 *
 * Phase 19b, aus Leopolds Wunsch. **Was eine Farbe bedeutet, steht nicht hier,
 * sondern in `features/posts/karte.ts`** — dieselbe Trennung wie zwischen
 * `theme/icons.ts` und `SsIcon`: Hier wird gezeichnet, dort wird entschieden.
 * Die Umrisse liegen als dritte Datei in `data/wien-bezirke.ts` und sind erzeugt.
 *
 * ── Warum sich die Karte schieben und zoomen lässt ────────────────────────────
 * Ians Entscheidung 33, und sie ist die Antwort auf eine Messung: Bei Handybreite
 * ist die **Josefstadt 14 × 11 Bildpunkte** groß. Die ganze Begründung samt der
 * beiden verworfenen Wege steht bei `KARTE_GESTE` in `karte.ts`.
 *
 * ── Warum die Geste die ANSICHT bewegt und nicht das SVG ──────────────────────
 * Der naheliegende Weg wäre, den `viewBox` mitzuziehen. Dann rechnet bei jedem
 * Fingerbreit jemand 886 Punkte neu und React zeichnet 23 Pfade — auf einem echten
 * Gerät ist das der Unterschied zwischen flüssig und ruckelig. Stattdessen liegt
 * das fertige SVG in einer `Animated.View`, und geschoben wird deren `transform`.
 * Während der Geste **rendert damit gar nichts neu**; erst beim Loslassen wird der
 * Zoom in den State übernommen, weil dann die Zahlen neu entschieden werden müssen
 * (siehe `zahlPasst`).
 *
 * ── Falle 1: die Geste (Phase 11, harte Regel 44) ─────────────────────────────
 * `onPanResponderTerminationRequest` steht per Voreinstellung auf „ja". Die Karte
 * liegt im Feed unter einer Liste, also nimmt ihr sonst der erste Scroll-Versuch
 * die Berührung ab — genau der Fehler, der den Wischstapel in Handybreite lahmlegte.
 *
 * ── Falle 2: die gemessene Breite (2026-09-03, `NOTBREITE`) ───────────────────
 * Alles hier hängt an der gemessenen Breite: die Größe des SVG, die Grenzen fürs
 * Schieben, das Umrechnen eines Tipps in Kartenkoordinaten. Beim Web-Export gibt es
 * kein Fenster und `onLayout` feuert nie. Mit **null** wäre die Karte unsichtbar und
 * jeder Tipp träfe rechnerisch die linke obere Ecke.
 *
 * ── Falle 3: der zusätzliche `click` (harte Regel 15) ─────────────────────────
 * Ein Browser schickt nach jedem Ziehen noch ein `click` hinterher. Deshalb
 * entscheidet der Erkenner beim LOSLASSEN selbst, ob es ein Tipp war — er merkt
 * sich, ob sich in der ganzen Berührung etwas bewegt hat (`TIPP_WEG_MAX`). Aus
 * demselben Grund haben die Flächen kein eigenes `onPress`.
 */

/** Breite, mit der gerechnet wird, solange nichts gemessen ist. Siehe Falle 2. */
const NOTBREITE = 328;

/** Dasselbe für die Höhe — gebraucht erst, seit die Karte auch füllen kann (19e). */
const NOTHOEHE = 480;

/** Die Zahl in der Fläche, in Bildpunkten — unabhängig vom Zoom. */
const ZAHL_PX = 11;

/** Die weiße Fuge zwischen zwei Bezirken, in Rastereinheiten. */
const FUGE = 2.5;

/** Der Umriss um den gewählten Bezirk. Dicker als die Fuge, sonst sieht man ihn nicht. */
const AUSWAHL_STRICH = 6;

export function SsWienKarte({
  zaehlung,
  gewaehlt,
  onWaehlen,
  maxHoehe,
  fuellt,
  randUnten = 0,
  randOben = 0,
  blase,
}: SsWienKarteProps) {
  const [gemessen, setGemessen] = useState({ breite: 0, hoehe: 0 });

  /**
   * Das FENSTER — die Fläche, die der Zeichner bekommt.
   *
   * Seit Phase 19e ist das nicht mehr dasselbe wie die Karte: Mit `fuellt` ist das
   * Fenster der ganze Schirm, die Karte selbst bleibt aber im Seitenverhältnis von
   * Wien und liegt zentriert darin. Vorher fielen beide zusammen, deshalb gab es nur
   * einen Satz Zahlen.
   */
  const fensterB = gemessen.breite || NOTBREITE;
  const fensterH = fuellt ? gemessen.hoehe || NOTHOEHE : 0;

  /**
   * Der freie Streifen: was vom Fenster übrig bleibt, wenn oben eine Leiste schwebt
   * und unten ein Blatt liegt. Wien wird DARIN zentriert und nicht im ganzen Fenster
   * — sonst läge die südliche Hälfte hinter dem Blatt und der Norden unter der
   * Pille (siehe `randOben`/`randUnten` in `karte-typen.ts`).
   *
   * `KARTE_MIN_BAND` ist der Boden: Ab da läuft die Karte lieber HINTER das Blatt,
   * statt weiter zu schrumpfen. Die Begründung samt gemessener Zahl steht bei der
   * Konstanten in `features/posts/karte.ts` — hier wird sie nur angewandt.
   */
  const freiUnten = Math.min(
    randUnten,
    Math.max(0, fensterH - randOben - fensterH * KARTE_MIN_BAND),
  );
  const band = Math.max(fensterH - randOben - freiUnten, 1);

  // Wien ist breiter als hoch (1000 : 777). Passt die Höhe nicht, wird die Breite
  // zurückgerechnet statt zu beschneiden — eine halbe Donaustadt sähe nach Fehler aus.
  const hoehenGrenze = fuellt ? band : maxHoehe;
  const breite = hoehenGrenze
    ? Math.min(fensterB, (hoehenGrenze * KARTE_BREITE) / KARTE_HOEHE)
    : fensterB;
  const hoehe = (breite * KARTE_HOEHE) / KARTE_BREITE;
  /** Wie viele Bildpunkte eine Rastereinheit bei dieser Breite ist. */
  const proEinheit = breite / KARTE_BREITE;

  /**
   * Wo die Mitte der Karte im Fenster liegt — in Bildpunkten.
   *
   * **Die eine Zahl, an der beide Rechnungen hängen** (ein Tipp nach innen, der
   * Anker nach außen). Ohne `fuellt` ist sie einfach die Fenstermitte, weil Karte
   * und Fenster deckungsgleich sind; mit `fuellt` ist sie die Mitte des freien
   * Streifens. Sie steht als EIN Wert da, damit die beiden Rechnungen nicht
   * auseinanderlaufen können — genau die Sorte Fehler, die man erst nach dem ersten
   * Zoom sieht.
   */
  const mitteX = fuellt ? fensterB / 2 : breite / 2;
  const mitteY = fuellt ? randOben + band / 2 : hoehe / 2;

  // Die Anzeige läuft über `Animated` (kein Rendern während der Geste), der
  // logische Zustand liegt daneben im Ref — die Handler brauchen ihn zum Rechnen
  // und Begrenzen. `useNativeDriver` bleibt aus: Im Browser gibt es ihn nicht, und
  // Werte, die aus einer Geste per `setValue` kommen, müssen ohnehin durch JS
  // (dieselbe Überlegung wie in `WischKarte`).
  const schiebenX = useRef(new Animated.Value(0)).current;
  const schiebenY = useRef(new Animated.Value(0)).current;
  const zoomWert = useRef(new Animated.Value(1)).current;

  /**
   * Die Ansicht, wie sie beim letzten Loslassen stand — nur dafür rendert die Karte
   * neu. Bis Phase 19c stand hier nur der Zoom (für `zahlPasst`); seit die Blase am
   * Bezirk hängt, wird auch das Schieben gebraucht: Der Anker ist die Umkehrung
   * derselben Rechnung, mit der ein Tipp in Kartenkoordinaten übersetzt wird.
   */
  const [sicht, setSicht] = useState({ zoom: 1, x: 0, y: 0 });
  const zoomStufe = sicht.zoom;

  /**
   * Während einer Geste ist die Blase weg, danach setzt sie sich neu an.
   *
   * **Bewusst `Animated` und kein `useState`.** Die Karte rendert während des
   * Schiebens absichtlich gar nichts neu (siehe oben) — ein `setInGeste(true)` beim
   * Fingerauflegen würde bei jeder Berührung 23 SVG-Pfade neu erzeugen, und das
   * ausgerechnet in dem Moment, in dem die Geste anfangen soll. Eine Deckkraft
   * lässt sich wie das Schieben selbst am React-Baum vorbei setzen.
   *
   * Mitwandern wäre die Alternative gewesen und ist verworfen: Dann müsste die
   * Blase in dieselbe `Animated.View` wie die Karte, würde also mitskaliert — eine
   * Sprechblase, die beim Hineinzoomen viermal so groß wird.
   */
  const blaseDeckkraft = useRef(new Animated.Value(1)).current;

  const zustand = useRef({ zoom: 1, x: 0, y: 0 });
  // Maße und `onWaehlen` gehören MIT ins Ref: Ein `PanResponder` wird einmal gebaut
  // und sähe sonst für immer die Werte des ersten Renderns.
  const masse = useRef({ breite, hoehe, proEinheit, mitteX, mitteY, onWaehlen });
  useEffect(() => {
    masse.current = { breite, hoehe, proEinheit, mitteX, mitteY, onWaehlen };
  }, [breite, hoehe, proEinheit, mitteX, mitteY, onWaehlen]);

  const responder = useMemo(() => {
    /**
     * Wie weit man höchstens schieben darf.
     *
     * `transform: scale` vergrößert um die MITTE der Ansicht. Bei Zoom `s` ragt die
     * Karte also auf jeder Seite um `breite × (s − 1) / 2` hinaus — genau so weit
     * darf man sie zurückschieben und keinen Fingerbreit weiter. Ohne diese Grenze
     * kann man die Karte aus dem Fenster ziehen und sitzt vor einer leeren Fläche.
     */
    const grenze = (laenge: number, zoom: number) => Math.max(0, (laenge * (zoom - 1)) / 2);
    const klemmen = (wert: number, max: number) => Math.max(-max, Math.min(max, wert));

    /** Der Zustand beim Beginn der aktuellen Finger-Stellung. Siehe `neuAnsetzen`. */
    let basis = { zoom: 1, x: 0, y: 0, mitteX: 0, mitteY: 0, abstand: 0, finger: 0 };
    let gewandert = 0;
    /**
     * Lag in dieser Berührung je ein zweiter Finger auf?
     *
     * **Ohne das ist ein Kneifen ein Tipp** — am 2026-09-06 mit echten
     * Touch-Ereignissen gefunden, nachdem ein Mausklick monatelang nichts gezeigt
     * hätte. Der Grund ist eine Eigenschaft von `PanResponder`, die man nicht
     * vermutet: `gestureState.dx/dy` misst bei mehreren Fingern den MITTELPUNKT.
     * Wer zwei Finger symmetrisch auseinanderzieht, lässt den Mittelpunkt stehen —
     * `dx` und `dy` bleiben null, und beim Loslassen sieht die Berührung aus wie
     * ein Tipp. In der Prüfung sprang die Auswahl dadurch vom 8. in den 1. Bezirk.
     *
     * Die Bewegungsgrenze allein kann das nicht abfangen, weil sie die falsche
     * Frage stellt. Die richtige ist nicht „hat sich der Finger bewegt?", sondern
     * „**war das überhaupt eine Ein-Finger-Geste?**" — ein Kneifen ist nie ein Tipp,
     * auch wenn es sich um keinen Pixel verschiebt.
     */
    let mehrfingrig = false;

    /**
     * Wechselt die Zahl der Finger, wird neu angesetzt.
     *
     * Ohne das springt die Karte in dem Moment, in dem ein zweiter Finger dazukommt
     * oder einer losgelassen wird: Der Erkenner rechnet dann eine Bewegung aus, die
     * niemand gemacht hat — er vergleicht mit einem Bezugspunkt, den es nicht mehr
     * gibt. Dieselbe Sorte Fehler wie ein Griffpaar, das über die Tipp-Stelle statt
     * über die Richtung entscheidet (harte Regel 45): Was fehlt, ist eine Auskunft,
     * und die entsteht erst neu.
     */
    const neuAnsetzen = (beruehrungen: { pageX: number; pageY: number }[]) => {
      const a = beruehrungen[0];
      const b = beruehrungen[1];
      basis = {
        ...zustand.current,
        mitteX: b ? (a.pageX + b.pageX) / 2 : a.pageX,
        mitteY: b ? (a.pageY + b.pageY) / 2 : a.pageY,
        abstand: b ? Math.hypot(b.pageX - a.pageX, b.pageY - a.pageY) : 0,
        finger: beruehrungen.length,
      };
    };

    const setzen = (zoom: number, x: number, y: number) => {
      const { breite: w, hoehe: h } = masse.current;
      const geklemmt = {
        zoom,
        x: klemmen(x, grenze(w, zoom)),
        y: klemmen(y, grenze(h, zoom)),
      };
      zustand.current = geklemmt;
      zoomWert.setValue(geklemmt.zoom);
      schiebenX.setValue(geklemmt.x);
      schiebenY.setValue(geklemmt.y);
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // Phase 11, teuer bezahlt: sonst nimmt die Liste darunter die Geste ab.
      onPanResponderTerminationRequest: () => false,

      onPanResponderGrant: (evt) => {
        gewandert = 0;
        blaseDeckkraft.setValue(0);
        mehrfingrig = evt.nativeEvent.touches.length >= 2;
        neuAnsetzen(evt.nativeEvent.touches);
      },

      onPanResponderMove: (evt, geste) => {
        const beruehrungen = evt.nativeEvent.touches;
        if (beruehrungen.length === 0) return;
        if (beruehrungen.length !== basis.finger) neuAnsetzen(beruehrungen);
        if (beruehrungen.length >= 2) mehrfingrig = true;
        gewandert = Math.max(gewandert, Math.abs(geste.dx) + Math.abs(geste.dy));

        if (beruehrungen.length >= 2) {
          const [a, b] = beruehrungen;
          const abstand = Math.hypot(b.pageX - a.pageX, b.pageY - a.pageY);
          if (basis.abstand <= 0) return;
          const zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, (basis.zoom * abstand) / basis.abstand));
          /**
           * Gezoomt wird um die MITTE der Ansicht, geschoben wird mit derselben
           * Bewegung mit.
           *
           * Der Lehrbuchweg wäre, die Stelle ZWISCHEN den Fingern festzuhalten. Er
           * braucht die Fingerposition relativ zur Karte — und was ein Erkenner in
           * `touches` liefert, ist `pageX`: Seitenkoordinaten. Der Unterschied ist
           * der Ursprung der Karte, und der kürzt sich nur in DIFFERENZEN weg, nicht
           * in „wie weit ist der Finger von der Mitte entfernt". Ihn zu besorgen
           * hieße, während der Geste zu messen — auf Web meldet `onLayout` erst nach
           * dem Zeichnen (2026-09-03), also käme die Zahl zu spät.
           *
           * Mit der Mitte als Angelpunkt bleibt nur Rechnen mit Differenzen übrig,
           * und das stimmt auf beiden Plattformen. Der Preis ist ehrlich: Man zoomt
           * in die Bildmitte und schiebt sein Ziel mit denselben zwei Fingern dorthin
           * — was man ohnehin tut. **Falls sich das am Gerät falsch anfühlt**, ist
           * der Weg heraus, die Kartenposition EINMAL nach dem Einblenden zu messen
           * und hier gegenzurechnen, nicht diese Formel zu erraten.
           */
          const faktor = zoom / basis.zoom;
          const mitteX = (a.pageX + b.pageX) / 2;
          const mitteY = (a.pageY + b.pageY) / 2;
          setzen(
            zoom,
            basis.x * faktor + (mitteX - basis.mitteX),
            basis.y * faktor + (mitteY - basis.mitteY),
          );
          return;
        }

        setzen(basis.zoom, basis.x + geste.dx, basis.y + geste.dy);
      },

      onPanResponderRelease: (evt) => {
        blaseDeckkraft.setValue(1);
        setSicht({ ...zustand.current });
        if (mehrfingrig || gewandert > TIPP_WEG_MAX) return;
        // Ein Tipp. `locationX/Y` liegt relativ zum FENSTER; daraus wird die Stelle
        // im Raster, indem man die Ansicht rückwärts rechnet: erst das Schieben
        // abziehen, dann um die Mitte herausskalieren, dann in Einheiten.
        //
        // Seit Phase 19e sind Fenster und Karte nicht mehr dasselbe: Der Bezugspunkt
        // im Fenster ist `mitteX/mitteY`, der in der Karte ihre halbe Größe. Ohne
        // `fuellt` fallen beide zusammen — die Formel ist dieselbe geblieben, nur
        // ausgeschrieben.
        const {
          breite: w,
          hoehe: h,
          proEinheit: pe,
          mitteX: mx,
          mitteY: my,
          onWaehlen: waehlen,
        } = masse.current;
        const { zoom, x: tx, y: ty } = zustand.current;
        const px = evt.nativeEvent.locationX;
        const py = evt.nativeEvent.locationY;
        const kx = (px - mx - tx) / zoom + w / 2;
        const ky = (py - my - ty) / zoom + h / 2;
        waehlen(bezirkAn(kx / pe, ky / pe));
      },

      /**
       * Nimmt uns doch jemand die Geste ab, kommt kein `Release` mehr — und die
       * Blase bliebe für immer unsichtbar. `onPanResponderTerminationRequest` steht
       * zwar auf `false`, aber das ist eine BITTE, die abgelehnt wird; das System
       * kann eine Geste trotzdem beenden (ein Anruf, ein Wechsel in den
       * Hintergrund). Ein unsichtbarer, aber antippbarer Kasten wäre der
       * unangenehmste Zustand von beiden.
       */
      onPanResponderTerminate: () => {
        blaseDeckkraft.setValue(1);
        setSicht({ ...zustand.current });
      },
    });
  }, [schiebenX, schiebenY, zoomWert, blaseDeckkraft]);

  /**
   * Auf Web zusätzlich: Mausrad zoomt, und der Browser darf die Seite nicht selbst
   * vergrößern.
   *
   * `touch-action: none` ist der Teil, der auf einem Handy-Browser den Unterschied
   * macht — ohne ihn behandelt Chrome eine Zwei-Finger-Bewegung als Seiten-Zoom und
   * der `PanResponder` sieht sie nie. Beides steht hinter `Platform.OS === 'web'`,
   * wie jeder andere DOM-Zugriff im Projekt.
   */
  const rahmen = useRef<View>(null);
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const knoten = rahmen.current as unknown as HTMLElement | null;
    if (!knoten || typeof knoten.addEventListener !== 'function') return;
    knoten.style.touchAction = 'none';
    const rad = (e: WheelEvent) => {
      e.preventDefault();
      const { zoom, x, y } = zustand.current;
      const neu = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12)));
      const w = masse.current.breite;
      const h = masse.current.hoehe;
      const max = (l: number) => Math.max(0, (l * (neu - 1)) / 2);
      const nx = Math.max(-max(w), Math.min(max(w), (x * neu) / zoom));
      const ny = Math.max(-max(h), Math.min(max(h), (y * neu) / zoom));
      zustand.current = { zoom: neu, x: nx, y: ny };
      zoomWert.setValue(neu);
      schiebenX.setValue(nx);
      schiebenY.setValue(ny);
      setSicht({ zoom: neu, x: nx, y: ny });
    };
    knoten.addEventListener('wheel', rad, { passive: false });
    return () => knoten.removeEventListener('wheel', rad);
  }, [schiebenX, schiebenY, zoomWert]);

  /** Der stärkste Bezirk — er bekommt die dunkelste Fläche (Ians Entscheidung 32). */
  const hoechst = useMemo(
    () => Object.values(zaehlung).reduce((a, b) => Math.max(a, b), 0),
    [zaehlung],
  );

  /**
   * Passt die Zahl in die Fläche?
   *
   * `label.r` ist der Abstand des Beschriftungspunktes zum Rand, in Rastereinheiten.
   * Die Zahl bleibt am Schirm immer gleich groß (`ZAHL_PX`), also wird sie in
   * Einheiten kleiner, je weiter man hineinzoomt — und passt irgendwann. Genau dafür
   * ist die Geste da.
   */
  const zahlEinheiten = ZAHL_PX / (proEinheit * zoomStufe);
  const zahlPasst = (radius: number, ziffern: number) =>
    radius >= zahlEinheiten * (0.32 * ziffern + 0.3);

  const flaechen = useMemo(
    () =>
      BEZIRKE.map((b) => {
        const anzahl = zaehlung[b.plz] ?? 0;
        const stufe = stufeFuer(anzahl, hoechst);
        const farben = stufe < 0 ? null : STUFEN[stufe];
        return {
          ...b,
          anzahl,
          fuellung: farben ? farben.flaeche : KARTE_LEER,
          zahlFarbe: farben ? farben.zahl : colors.inkSoft,
          zeigeZahl: anzahl > 0 && zahlPasst(b.label.r, String(anzahl).length),
        };
      }),
    // `zahlPasst` hängt an `zahlEinheiten` und wird bewusst nicht als Funktion in die
    // Liste geschrieben — sie bekäme bei jedem Rendern eine neue Identität.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [zaehlung, hoechst, zahlEinheiten],
  );

  const gewaehltePfad = flaechen.find((f) => f.plz === gewaehlt);
  const verschoben = zoomStufe > 1.01;

  /**
   * Wo der gewählte Bezirk gerade auf dem Schirm liegt — die Umkehrung der Rechnung
   * aus `onPanResponderRelease`.
   *
   * Dort wird aus einem Bildpunkt eine Rasterstelle: erst das Schieben abziehen, dann
   * um die Mitte herausskalieren. Hier geht es rückwärts — erst um die Mitte
   * skalieren, dann das Schieben addieren. **Beide müssen aus DEMSELBEN Zustand
   * rechnen**, sonst zeigt die Blase nach dem ersten Zoom neben den Bezirk, den man
   * angetippt hat.
   *
   * `null`, wenn der Anker aus der Kartenfläche herausgeschoben wurde: Eine
   * Sprechblase, deren Spitze außerhalb des Bildes sitzt, zeigt auf nichts.
   */
  const anker: KartenAnker | null = (() => {
    if (!gewaehltePfad) return null;
    const x = (gewaehltePfad.label.x * proEinheit - breite / 2) * sicht.zoom + mitteX + sicht.x;
    const y = (gewaehltePfad.label.y * proEinheit - hoehe / 2) * sicht.zoom + mitteY + sicht.y;
    // Der Platz, den die Blase hat, ist der des FENSTERS — nicht der der Karte.
    const platzB = fuellt ? fensterB : breite;
    const platzH = fuellt ? band : hoehe;
    if (x < 0 || x > platzB || y < 0 || y > platzH) return null;
    return { x, y, platzOben: y, platzUnten: platzH - y, breite: platzB, hoehe: platzH };
  })();

  /**
   * Wo Lizenzzeile und „Ganz Wien" sitzen — über dem Blatt, aber nie hinter der
   * schwebenden Leiste.
   *
   * **Das ist NICHT dasselbe wie `freiUnten`, und die Verwechslung wäre nicht zu
   * sehen, sondern nur zu lesen:** `freiUnten` ist Geometrie (wo Wien sitzt),
   * `randUnten` ist, wo das Blatt wirklich anfängt. Die Nennung muss dem BLATT
   * ausweichen — mit dem gedeckelten Wert läge sie bei aufgezogenem Blatt dahinter,
   * und eine Nennung, die niemand sehen kann, ist keine. Nach oben ist Schluss unter
   * der Leiste: Dort blitzte sie am 2026-09-07 hinter der Pille durch.
   */
  const fussHoehe = Math.min(randUnten, Math.max(0, fensterH - randOben - 20));

  const blaseInhalt = blase && anker ? blase(anker) : null;

  const inhalt = (
    <>
      {flaechen.map((f) => (
        <Path key={f.plz} d={f.d} fill={f.fuellung} stroke={colors.bg} strokeWidth={FUGE} />
      ))}
      {/* Der gewählte Bezirk wird ein zweites Mal gezeichnet — nur so liegt sein
          Umriss ÜBER den Nachbarn. Zeichnete man ihn an seiner Stelle in der Liste,
          würden die später gezeichneten Nachbarn ihre eigene Fuge darüberlegen und
          der Umriss wäre an drei Seiten halb verdeckt. */}
      {gewaehltePfad ? (
        <Path
          d={gewaehltePfad.d}
          fill="none"
          stroke={colors.ink}
          strokeWidth={AUSWAHL_STRICH}
          strokeLinejoin="round"
        />
      ) : null}
      {flaechen
        .filter((f) => f.zeigeZahl)
        .map((f) => (
          <SvgText
            key={`z${f.plz}`}
            x={f.label.x}
            y={f.label.y}
            fill={f.zahlFarbe}
            fontSize={zahlEinheiten}
            fontWeight="600"
            textAnchor="middle"
            // Auf Web kennt SVG `dominant-baseline`, `react-native-svg` nicht
            // verlässlich — deshalb wird von Hand um eine knappe halbe Zeilenhöhe
            // nach unten gerückt. Sonst sitzt die Zahl auf ihrer Grundlinie und
            // steht damit deutlich zu hoch in der Fläche.
            dy={zahlEinheiten * 0.35}>
            {f.anzahl}
          </SvgText>
        ))}
    </>
  );

  return (
    <View style={[styles.rahmen, fuellt && styles.rahmenVoll]}>
      <View
        style={[
          styles.flaeche,
          fuellt ? styles.flaecheVoll : { width: breite, height: hoehe },
        ]}>
        <View
          ref={rahmen}
          style={[styles.fenster, fuellt ? styles.fensterVoll : { height: hoehe, width: breite }]}
          onLayout={(e) =>
            setGemessen({
              breite: e.nativeEvent.layout.width,
              hoehe: e.nativeEvent.layout.height,
            })
          }
          {...responder.panHandlers}>
          {/* Ohne `fuellt` ist das Fenster genau so groß wie die Karte, und diese
              Hülle liegt bündig darauf. Mit `fuellt` schiebt sie Wien in die Mitte
              des freien Streifens — dieselben zwei Zahlen (`mitteX`/`mitteY`), aus
              denen auch der Tipp und der Anker gerechnet werden. */}
          <View
            style={[
              styles.mitte,
              { left: mitteX - breite / 2, top: mitteY - hoehe / 2, width: breite, height: hoehe },
            ]}>
            <Animated.View
              style={{
                transform: [
                  { translateX: schiebenX },
                  { translateY: schiebenY },
                  { scale: zoomWert },
                ],
              }}>
              <Svg width={breite} height={hoehe} viewBox={`0 0 ${KARTE_BREITE} ${KARTE_HOEHE}`}>
                <G>{inhalt}</G>
              </Svg>
            </Animated.View>
          </View>
        </View>

        {/* Die Blase — GESCHWISTER der Kartenfläche, nicht ihr Kind. Warum, steht bei
            der Prop `blase` oben. `box-none` heißt: Diese Schicht selbst fängt nichts
            ab, ihre Kinder schon — was neben der Blase liegt, kommt weiter bei der
            Karte an. */}
        {blaseInhalt ? (
          <Animated.View style={[styles.ueberKarte, { opacity: blaseDeckkraft }]}>
            {blaseInhalt}
          </Animated.View>
        ) : null}
      </View>

      {/* Die Namensnennung liegt IN der Karte und nicht daneben im Screen — sie ist
          Bedingung der Lizenz (CC BY), und was neben einem Baustein steht, bleibt beim
          nächsten Umbau liegen. So reist sie mit, wohin die Karte auch kommt.

          Mit `fuellt` steht sie ÜBER der Karte statt darunter, und zwar oberhalb von
          `randUnten`: Sonst läge die Lizenzzeile hinter dem Blatt, und eine Nennung,
          die niemand sehen kann, ist keine. */}
      <SsText
        variant="caption"
        color={colors.inkSoft}
        style={[styles.quelle, fuellt && [styles.quelleVoll, { bottom: fussHoehe + 4 }]]}>
        {KARTE_QUELLE}
      </SsText>

      {/* Steht nur da, wenn er etwas tut. Ein Knopf „Ganz Wien" auf einer Karte, die
          schon ganz Wien zeigt, sieht aus wie ein kaputter Knopf. */}
      {verschoben ? (
        <Pressable
          style={[styles.zurueck, fuellt && { bottom: fussHoehe + 22 }]}
          // Der Knopf ist 26 px hoch — unter Apples 44. Statt ihn aufzublasen und
          // damit die Karte zu verdecken, vergrößert `hitSlop` nur die empfindliche
          // Fläche. Das ist genau der Fall, für den es die Prop gibt.
          hitSlop={10}
          onPress={() => {
            zustand.current = { zoom: 1, x: 0, y: 0 };
            zoomWert.setValue(1);
            schiebenX.setValue(0);
            schiebenY.setValue(0);
            setSicht({ zoom: 1, x: 0, y: 0 });
          }}>
          <SsText variant="caption" color={colors.surface}>
            Ganz Wien
          </SsText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  rahmen: {
    position: 'relative',
    alignItems: 'center',
  },
  /** Mit `fuellt` nimmt die Karte allen Platz, den sie bekommt — Phase 19e. */
  rahmenVoll: { flex: 1, alignSelf: 'stretch' },
  quelle: { fontSize: 10, lineHeight: 14, paddingTop: 2 },
  quelleVoll: { position: 'absolute', left: 8, paddingTop: 0 },
  /** Karte und Blase liegen deckungsgleich übereinander — dafür braucht es einen
      gemeinsamen Bezugsrahmen. Ohne ihn müsste die Blase im `rahmen` positioniert
      werden, und der ist bei schmaler Karte breiter als sie (`alignItems: 'center'`). */
  flaeche: { position: 'relative' },
  flaecheVoll: { flex: 1, alignSelf: 'stretch' },
  fensterVoll: { flex: 1, alignSelf: 'stretch' },
  /** Wien in der Mitte des freien Streifens — nur mit `fuellt` überhaupt versetzt. */
  mitte: { position: 'absolute' },
  // `StyleSheet.absoluteFillObject` gibt es in React Native 0.86 nicht mehr (ACTA).
  ueberKarte: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    // Diese Schicht selbst fängt nichts ab, ihre Kinder schon — was neben der Blase
    // liegt, kommt weiter bei der Karte an. Im `style`, nicht als Prop (ACTA-Falle).
    pointerEvents: 'box-none',
  },
  fenster: {
    // Ohne das ragt die gezoomte Karte über ihren Platz hinaus und liegt über den
    // Kategorie-Pillen darüber und der Liste darunter.
    overflow: 'hidden',
    backgroundColor: colors.bg,
  },
  zurueck: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
});
