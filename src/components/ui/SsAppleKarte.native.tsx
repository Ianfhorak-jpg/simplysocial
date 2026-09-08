import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polygon, PROVIDER_DEFAULT, type Region } from 'react-native-maps';

import { SsText } from './SsText';
import type { KartenAnker, SsKarteProps } from './karte-typen';
import { KARTE_BREITE, KARTE_HOEHE, PROJEKTION } from '@/data/wien-bezirke';
import {
  APPLE_KARTE_ART,
  APPLE_ZOOM_MAX,
  APPLE_ZOOM_MIN,
  KARTE_QUELLE,
  NENNUNG_MIN_KARTE,
  UEBERGANG_MS,
  ZURUECK_KNOPF_BEI_GANZ,
  STUFEN,
  appleFuellung,
  stufeFuer,
} from '@/features/posts/karte';
import { BEZIRKE_GEO, WIEN_REGION, nachRaster } from '@/lib/karte-geo';
import { bezirkAn } from '@/lib/karte-treffer';
import { colors } from '@/theme';

/**
 * Die Bezirke als Auflage auf einer echten Apple-Karte — der zweite Kartenzeichner.
 *
 * Phase 19d, **Ians Entscheidung 35 gegen meine Empfehlung** (ich hatte den
 * gezeichneten Apple-Stil vorgeschlagen: eine Datei mehr, läuft überall, kein neuer
 * Baustein). Sie wird gebaut, nicht neu verhandelt; der Preis steht in PLAN.md.
 *
 * ── Der Befund, der alles hier ordnet ─────────────────────────────────────────
 * **Eine echte Karte macht die App NICHT genauer.** Am Post steht seit Phase 2 nur
 * `district: '1070'`, nie eine Koordinate. Apple liefert den HINTERGRUND, unsere
 * Bezirksflächen bleiben oben drauf — `data/wien-bezirke.ts` wird nicht überflüssig,
 * sondern zur Auflage. Und **harte Regel 47 gilt jetzt gegen einen stärkeren Reiz**:
 * Wer eine echte Karte sieht, denkt an Stecknadeln, und eine Stecknadel verrät statt
 * „1220" die genaue Parkbank um 17:00.
 *
 * ── Warum eine eigene Datei mit `.native` und kein `Platform.OS`-Zweig ────────
 * Genau umgekehrt zu `SsIcon` (harte Regel 24), und der Unterschied ist der Grund:
 * Bei `SsIcon` zeichnen beide Zweige DASSELBE, nur heißen die Elemente anders — ein
 * Zweig in einer Datei hält die Pfade zusammen. Hier sind es wirklich zwei
 * verschiedene Karten-Bibliotheken. Ein `Platform.OS`-Zweig in einer Datei würde
 * `react-native-maps` in das WEB-Bündel importieren, wo es MapKit gar nicht gibt.
 *
 * ── Was dieser Zeichner NICHT selbst entscheidet ──────────────────────────────
 * Was eine Farbe bedeutet (`appleFuellung`), wie weit man zoomen darf, welche Sorte
 * Karte darunter liegt: alles in `features/posts/karte.ts`. Welcher Bezirk unter
 * einem Tipp liegt: `lib/karte-treffer.ts` — **dieselbe Antwort wie im Browser**,
 * weil die Koordinate erst ins Raster zurückgerechnet wird. Ein Treffer-Test, den
 * einmal MapKit und einmal JavaScript beantwortet, wären zwei Antworten auf dieselbe
 * Frage.
 *
 * ── Der Gewinn, den man beim Planen leicht übersieht ──────────────────────────
 * **Unser eigener `PanResponder` fällt hier weg** — MapKit schiebt und zoomt selbst.
 * Das ist ein Gesten-Erkenner weniger, und ausgerechnet der, dessen Verhalten unter
 * einem echten Finger noch ungeprüft war.
 */

/** Die Zahl in der Fläche, in Bildpunkten — wie beim gezeichneten Zeichner. */
const ZAHL_PX = 11;

/** Die Fuge zwischen zwei Bezirken. Dünner als auf der gezeichneten Karte: Dort
 *  trennt sie zwei Flächen, hier liegt ein Stadtplan darunter, den sie nicht
 *  zudecken soll. */
const FUGE = 1;
const AUSWAHL_STRICH = 3;

/**
 * Wie lange nach einer Änderung die Marker-Bilder neu aufgenommen werden.
 *
 * `tracksViewChanges` heißt für MapKit: „nimm bei jedem Bild ein neues Foto dieses
 * Markers auf". Dauerhaft an ist es eine Bremse (23 Marker × 60 Bilder), dauerhaft
 * aus zeichnet der erste Marker manchmal leer — er wird fotografiert, bevor sein
 * Text gemessen ist. Deshalb kurz an, dann aus.
 */
const MARKER_AUFNAHME_MS = 600;

export function SsAppleKarte({
  zaehlung,
  gewaehlt,
  onWaehlen,
  maxHoehe,
  fuellt,
  randUnten = 0,
  randOben = 0,
  blase,
}: SsKarteProps) {
  const karte = useRef<MapView>(null);
  const [platz, setPlatz] = useState({ breite: 0, hoehe: 0 });

  /**
   * Der Ausschnitt, wie er beim letzten Anhalten stand.
   *
   * Nur dafür rendert die Karte neu — dieselbe Bauart wie `sicht` in `SsWienKarte`:
   * Während der Geste rührt sich der React-Baum nicht, MapKit bewegt seine eigene
   * Ansicht. Gebraucht wird der Wert für zwei Fragen, die beide erst nach dem
   * Anhalten neu zu beantworten sind: Passt die Zahl in die Fläche? Und wo liegt der
   * Anker der Blase?
   */
  const [region, setRegion] = useState<Region>(WIEN_REGION);

  /** Wo die Blase hinzeigt. `null`, solange MapKit noch nicht geantwortet hat oder
   *  der Bezirk aus dem Bild geschoben wurde. */
  const [anker, setAnker] = useState<KartenAnker | null>(null);

  /**
   * Während einer Bewegung ist die Blase weg, danach setzt sie sich neu an.
   *
   * **Bewusst `Animated` und kein `useState`** — genau wie in `SsWienKarte`: Ein
   * `setState` beim Fingerauflegen würde 23 Polygone neu erzeugen, und das
   * ausgerechnet in dem Moment, in dem die Geste anfangen soll. Mitwandern wäre die
   * Alternative gewesen und ist verworfen: Die Blase müsste dann in MapKits eigene
   * Ansicht, würde also mitskaliert.
   */
  const blaseDeckkraft = useRef(new Animated.Value(1)).current;

  const [aufnahme, setAufnahme] = useState(true);
  /**
   * Ob MapKit schon steht. **Kamerabefehle verpuffen davor still** (Lehre aus
   * 19e-2) — ein Aufruf, der nichts tut, sieht aus wie einer, der nicht stattfindet.
   */
  const [bereit, setBereit] = useState(false);
  /**
   * Hat jemand die Karte selbst in die Hand genommen?
   *
   * ── Warum das ein eigenes Merkmal ist und nicht aus `region` folgt ───────────
   * Naheliegend wäre, den Ausschnitt mit `WIEN_REGION` zu vergleichen. Genau das tut
   * `verschoben` unten, und für den KNOPF ist es richtig. Als Gegenfrage zu „darf ich
   * neu einpassen?" ist es falsch: Solange Wien noch nicht richtig eingepasst IST,
   * steht der Ausschnitt weit daneben — die Bedingung wäre also genau dann erfüllt,
   * wenn sie es nicht sein darf, und die Einpassung fände nie statt. **Auf Ians Bild
   * sieht man dieselbe Ursache von der anderen Seite: Der „Ganz Wien"-Knopf stand
   * da, ohne dass er die Karte angefasst hatte.**
   *
   * `onPanDrag` ist auf iOS ein eigener Erkenner an der Karte und meldet nur echte
   * Finger. `isGesture` an `onRegionChange` wäre die direktere Auskunft — die gibt es
   * in `react-native-maps` **nur für Google Maps** (nachgesehen in der Typdatei).
   * Ein reines Kneifen ohne jedes Schieben bleibt damit unerkannt; das ist der
   * benannte Preis, und er ist klein.
   */
  const eigen = useRef(false);

  const breite = platz.breite;
  /**
   * Mit `fuellt` (Phase 19e) nimmt die Karte den ganzen Platz und ihre Höhe kommt
   * aus der Messung — nicht mehr aus dem Seitenverhältnis von Wien. Das ist der
   * ganze Unterschied zwischen „ein Element im Fluss" und „der Hintergrund, über dem
   * alles schwebt".
   */
  const hoehe = fuellt
    ? platz.hoehe
    : Math.min((breite * KARTE_HOEHE) / KARTE_BREITE, maxHoehe ?? Number.POSITIVE_INFINITY);

  /**
   * Wie viel unten wirklich abgezogen wird — gedeckelt durch `KARTE_MIN_BAND`.
   * Dieselbe Regel und dieselbe Konstante wie beim gezeichneten Zeichner: Ab der
   * Grenze läuft die Karte hinter das Blatt, statt ihren Ausschnitt weiter
   * zusammenzuziehen. **Die Bedeutung steht in `karte.ts`, nicht hier** (harte
   * Regel 52) — sonst hätte die App zwei Wahrheiten, eine je Zeichner.
   */
  /**
   * Wie viel MapKit unten aussparen soll.
   *
   * ⚠️ **Seit Phase 19g folgt das dem BLATT und nicht mehr `KARTE_MIN_BAND`** — Ians
   * Entscheidung 58. Der Grund steht bei `NENNUNG_MIN_KARTE`: `mapPadding` ist EIN
   * Regler für zwei Fragen (wo Wien sitzt, wo Apples Nennung sitzt), und die Nennung
   * ist Lizenzbedingung. Mit dem alten, gedeckelten Wert saß sie bei halb offenem
   * Blatt 122 Punkte HINTER der Blattkante — solange das Blatt durchsichtig war,
   * hat man das für einen Schönheitsfehler gehalten.
   *
   * `KARTE_MIN_BAND` gilt weiter, aber nur noch dort, wo es hingehört: im
   * gezeichneten Zeichner, dessen Maßstab wirklich am freien Streifen hängt.
   */
  const verdeckt = Math.min(randUnten, Math.max(0, hoehe - randOben - NENNUNG_MIN_KARTE));
  /** Über dem Blatt, aber nie hinter der schwebenden Leiste — siehe `fussHoehe` im
   *  gezeichneten Zeichner, dieselbe Rechnung und derselbe Grund. */
  const fussHoehe = Math.min(randUnten, Math.max(0, hoehe - randOben - 20));
  // **`verdeckt` und `randUnten` sind NICHT dasselbe, und die Verwechslung wäre
  // nicht zu sehen, sondern nur zu lesen:** `verdeckt` ist die Geometrie (wo Wien
  // sitzt), `randUnten` ist, wo das Blatt wirklich anfängt. Die Lizenzzeile und der
  // „Ganz Wien"-Knopf richten sich nach dem BLATT — mit dem gedeckelten Wert lägen
  // sie bei ganz aufgezogenem Blatt dahinter.

  /** Der stärkste Bezirk — er bekommt die dunkelste Fläche (Ians Entscheidung 32). */
  const hoechst = useMemo(
    () => Object.values(zaehlung).reduce((a, b) => Math.max(a, b), 0),
    [zaehlung],
  );

  /**
   * Passt die Zahl in die Fläche?
   *
   * Dieselbe Frage und dieselbe Formel wie in `SsWienKarte`, nur kommt der Maßstab
   * aus einer anderen Quelle: dort aus dem eigenen Zoom, hier aus MapKits Ausschnitt.
   * `longitudeDelta` ist die sichtbare Spanne in Grad; mal `k · massstab` sind das
   * Rastereinheiten, und daraus folgt, wie viele Bildpunkte eine Einheit gerade ist.
   */
  const flaechen = useMemo(() => {
    const sichtbareEinheiten = region.longitudeDelta * PROJEKTION.k * PROJEKTION.massstab;
    const proEinheit = sichtbareEinheiten > 0 && breite > 0 ? breite / sichtbareEinheiten : 0;
    const zahlEinheiten = proEinheit > 0 ? ZAHL_PX / proEinheit : Number.POSITIVE_INFINITY;
    return BEZIRKE_GEO.map((b) => {
      const anzahl = zaehlung[b.plz] ?? 0;
      const stufe = stufeFuer(anzahl, hoechst);
      const ziffern = String(anzahl).length;
      return {
        ...b,
        anzahl,
        fuellung: appleFuellung(stufe),
        zahlFarbe: stufe < 0 ? colors.inkSoft : STUFEN[stufe].zahl,
        zeigeZahl: anzahl > 0 && b.radius >= zahlEinheiten * (0.32 * ziffern + 0.3),
      };
    });
  }, [zaehlung, hoechst, region.longitudeDelta, breite]);

  /** Kurz aufnehmen, wenn sich die Zahlen geändert haben — siehe `MARKER_AUFNAHME_MS`. */
  const zahlenSchluessel = flaechen
    .filter((f) => f.zeigeZahl)
    .map((f) => `${f.plz}:${f.anzahl}`)
    .join(',');
  useEffect(() => {
    setAufnahme(true);
    const t = setTimeout(() => setAufnahme(false), MARKER_AUFNAHME_MS);
    return () => clearTimeout(t);
  }, [zahlenSchluessel]);

  /** Steht die Karte noch auf ihrem Grundausschnitt „ganz Wien"? */
  const verschoben =
    Math.abs(region.latitude - WIEN_REGION.latitude) > WIEN_REGION.latitudeDelta * 0.04 ||
    Math.abs(region.longitude - WIEN_REGION.longitude) > WIEN_REGION.longitudeDelta * 0.04 ||
    region.longitudeDelta < WIEN_REGION.longitudeDelta * 0.85;

  /**
   * Wo der gewählte Bezirk gerade auf dem Schirm liegt.
   *
   * **Die eine Frage, die ein neuer Zeichner beantworten muss** (siehe
   * `karte-typen.ts`). Die gezeichnete Karte rechnet sie aus ihrem eigenen Schiebe-
   * und Zoom-Zustand; hier beantwortet sie MapKit selbst mit `pointForCoordinate`.
   *
   * **Das ist Absicht und kein Umweg:** Die eigene Rechnung müsste MapKits
   * Projektion nachbauen — und eine nachgebaute Projektion, die um ein Prozent
   * abweicht, zeigt genau dann daneben, wenn jemand hineingezoomt hat.
   */
  const ankerHolen = useCallback(async () => {
    const ziel = BEZIRKE_GEO.find((b) => b.plz === gewaehlt);
    if (!ziel || !karte.current || breite <= 0 || hoehe <= 0) {
      setAnker(null);
      return;
    }
    try {
      const p = await karte.current.pointForCoordinate(ziel.mitte);
      // ⚠️ **Der freie Streifen, nicht die ganze Fläche** (Phase 19g). Die Karte ist
      // seit 19e Vollbild: Oben liegt die schwebende Leiste, unten das Blatt. Ein
      // Anker darunter zeigt auf etwas, das man nicht sieht, und der Platz über ihm
      // ist nicht der bis zum Bildrand, sondern der bis zur Leiste. Solange der Slot
      // leer stand (Entscheidung 46), fiel das niemandem auf.
      const obenAus = randOben;
      const untenAus = hoehe - randUnten;
      if (p.x < 0 || p.x > breite || p.y < obenAus || p.y > untenAus) {
        // Aus dem Bild geschoben. Eine Sprechblase, deren Spitze außerhalb sitzt,
        // zeigt auf nichts — dieselbe Entscheidung wie in `SsWienKarte`.
        setAnker(null);
        return;
      }
      setAnker({
        x: p.x,
        y: p.y,
        platzOben: p.y - obenAus,
        platzUnten: untenAus - p.y,
        breite,
        hoehe,
      });
    } catch {
      // `pointForCoordinate` kann fehlschlagen, solange die native Ansicht noch
      // nicht steht. Keine Blase ist der harmlosere Zustand von beiden.
      setAnker(null);
    }
  }, [gewaehlt, breite, hoehe, randOben, randUnten]);

  useEffect(() => {
    void ankerHolen();
  }, [ankerHolen, region]);

  /**
   * Wien neu in den freien Streifen einpassen, wenn sich die Polsterung ändert —
   * Phase 19g, und es beantwortet zwei von Ians Punkten mit einer Zeile.
   *
   * ── Warum das überhaupt sein muss ────────────────────────────────────────────
   * **MapKit ZOOMT, wenn `mapPadding` sich ändert.** Es hält den zuletzt gesetzten
   * Ausschnitt im nutzbaren Rechteck; wird das Rechteck kleiner, geht die Karte
   * heraus. Beim Aufschlagen passiert das zweimal hintereinander (erst ohne Blatt,
   * dann mit), und die Wirkung multipliziert sich: Auf dem Simulator standen danach
   * **Brünn, Bratislava und St. Pölten** im Bild und Wien war ein Fleck. Genau das
   * meint Ian mit *„es ist noch zu viel auf dem Bildschirm"*.
   *
   * ── Warum nur, wenn niemand die Karte angefasst hat ──────────────────────────
   * Hat jemand geschoben, gehört ihm die Ansicht — sie hier zurückzusetzen wäre, ihm
   * die Karte aus der Hand zu nehmen. Warum das an `eigen` hängt und nicht an
   * `verschoben`, steht oben bei `eigen`.
   *
   * ── Warum `animateToRegion` und nicht `fitToCoordinates` ─────────────────────
   * `fitToCoordinates` zählt `mapPadding` **nicht** mit (Lehre aus 19e-2) — es
   * würde genau den Fehler machen, den dieser Effekt behebt. Und die 280 ms sind
   * Ians Entscheidung 60: *„eine leichte Transition, die man fast gar nicht merkt."*
   */
  useEffect(() => {
    if (!bereit || eigen.current) return;
    karte.current?.animateToRegion(WIEN_REGION, UEBERGANG_MS);
  }, [bereit, verdeckt, randOben]);

  const tippen = useCallback(
    (koordinate: { latitude: number; longitude: number }) => {
      const { x, y } = nachRaster(koordinate);
      onWaehlen(bezirkAn(x, y));
    },
    [onWaehlen],
  );

  const gewaehltGeo = flaechen.find((f) => f.plz === gewaehlt);

  const blaseInhalt = blase && anker ? blase(anker) : null;

  /**
   * Ob unter der schwebenden Leiste noch genug Karte übrig ist, dass ein Knopf
   * darauf sinnvoll ist — Ians Entscheidung 59 (`ZURUECK_KNOPF_BEI_GANZ`).
   *
   * Gemessen wird am selben Streifen wie die Nennung und nicht an der Raststufe des
   * Blattes: Der Zeichner kennt keine Raststufen, er kennt nur, wie viel von ihm
   * verdeckt ist (harte Regel 52).
   */
  const knopfPlatz =
    ZURUECK_KNOPF_BEI_GANZ || hoehe - randOben - randUnten > NENNUNG_MIN_KARTE;

  return (
    <View style={[styles.rahmen, fuellt && styles.rahmenVoll]}>
      <View
        style={[styles.flaeche, fuellt ? styles.flaecheVoll : { height: hoehe }]}
        onLayout={(e) =>
          setPlatz({ breite: e.nativeEvent.layout.width, hoehe: e.nativeEvent.layout.height })
        }>
        <MapView
          ref={karte}
          style={StyleSheet.absoluteFill}
          // Apple, nicht Google — das war der ganze Punkt der Entscheidung.
          provider={PROVIDER_DEFAULT}
          mapType={APPLE_KARTE_ART}
          initialRegion={WIEN_REGION}
          /**
           * Der Streifen unten, der vom Blatt verdeckt ist (Phase 19e).
           *
           * MapKit rechnet den Ausschnitt danach: Wien wird über dem Blatt zentriert
           * statt in der Mitte des Schirms — und `pointForCoordinate` antwortet
           * weiter richtig, weil dieselbe Ansicht rechnet. **Genau deshalb steht hier
           * `mapPadding` und keine eigene Verschiebung:** Eine nachgebaute wäre eine
           * zweite Wahrheit neben MapKits eigener (harte Regel 52).
           */
          mapPadding={{ top: randOben, right: 0, bottom: verdeckt, left: 0 }}
          // Die beiden Zahlen sind auf dem Simulator gemessen, nicht gerechnet —
          // die Begründung steht bei ihnen in `karte.ts`. Mit 10 öffnete die Karte
          // auf einem Drittel von Wien.
          minZoomLevel={APPLE_ZOOM_MIN}
          maxZoomLevel={APPLE_ZOOM_MAX}
          rotateEnabled={false}
          pitchEnabled={false}
          showsCompass={false}
          toolbarEnabled={false}
          onMapReady={() => setBereit(true)}
          // Ab hier gehört die Ansicht dem Finger — siehe `eigen`.
          onPanDrag={() => {
            eigen.current = true;
          }}
          onRegionChange={() => blaseDeckkraft.setValue(0)}
          onRegionChangeComplete={(r) => {
            blaseDeckkraft.setValue(1);
            setRegion(r);
          }}
          onPress={(e) => tippen(e.nativeEvent.coordinate)}
          // Ein Tipp auf ein Geschäft oder eine Haltestelle löst KEIN `onPress` aus.
          // Ohne diese Zeile wäre die Karte an genau den Stellen taub, an denen auf
          // einem Stadtplan am meisten steht.
          onPoiClick={(e) => tippen(e.nativeEvent.coordinate)}>
          {flaechen.map((f) =>
            f.ringe.map((ring, i) => (
              <Polygon
                key={`${f.plz}-${i}`}
                coordinates={ring}
                fillColor={f.fuellung}
                strokeColor={colors.bg}
                strokeWidth={FUGE}
                // Der Treffer-Test läuft in JavaScript, nicht in MapKit — siehe
                // Kopf der Datei. Sonst gäbe es zwei Antworten auf dieselbe Frage.
                tappable={false}
              />
            )),
          )}

          {/* Der gewählte Bezirk wird ein zweites Mal gezeichnet — nur so liegt sein
              Umriss ÜBER den Nachbarn. Dieselbe Überlegung wie im SVG-Zeichner:
              Später gezeichnete Nachbarn legen sonst ihre eigene Fuge darüber. */}
          {gewaehltGeo?.ringe.map((ring, i) => (
            <Polygon
              key={`auswahl-${i}`}
              coordinates={ring}
              fillColor="transparent"
              strokeColor={colors.ink}
              strokeWidth={AUSWAHL_STRICH}
              tappable={false}
            />
          ))}

          {/* Die Zahlen sind Marker und keine eigene Schicht darüber: So wandern sie
              beim Schieben und Zoomen von MapKit MIT, ohne dass für jedes Bild
              jemand 23 Positionen neu rechnet. */}
          {flaechen
            .filter((f) => f.zeigeZahl)
            .map((f) => (
              <Marker
                key={`z${f.plz}`}
                coordinate={f.mitte}
                anchor={{ x: 0.5, y: 0.5 }}
                tracksViewChanges={aufnahme}
                // Der Marker ist eine Beschriftung, kein Knopf. Angetippt wird die
                // Karte darunter.
                tappable={false}>
                <SsText variant="caption" color={f.zahlFarbe} style={styles.zahl}>
                  {f.anzahl}
                </SsText>
              </Marker>
            ))}
        </MapView>

        {/* Die Blase — GESCHWISTER der Karte, nicht ihr Kind. MapKit ist eine native
            Ansicht; fremde React-Kinder darin sind entweder Marker oder gar nichts. */}
        {blaseInhalt ? (
          <Animated.View style={[styles.ueberKarte, { opacity: blaseDeckkraft }]}>
            {blaseInhalt}
          </Animated.View>
        ) : null}

        {/* Steht nur da, wenn er etwas tut — und seit Phase 19g auch nur dann,
            wenn überhaupt noch Karte zu sehen ist (Ians Entscheidung 59). */}
        {verschoben && knopfPlatz ? (
          <Pressable
            style={[styles.zurueck, fuellt && { bottom: fussHoehe + 22 }]}
            hitSlop={10}
            onPress={() => {
              // Der Knopf gibt die Karte zurück — danach passt sie sich wieder von
              // selbst ein, wenn das Blatt seine Stufe wechselt.
              eigen.current = false;
              karte.current?.animateToRegion(WIEN_REGION, UEBERGANG_MS);
            }}>
            <SsText variant="caption" color={colors.surface}>
              Ganz Wien
            </SsText>
          </Pressable>
        ) : null}
      </View>

      {/* Apples eigene Namensnennung zeichnet MapKit selbst in die Fläche. Diese
          Zeile betrifft etwas anderes: Die BEZIRKSGRENZEN kommen weiter von der
          Stadt Wien (CC BY 4.0), auch wenn der Hintergrund von Apple ist. */}
      <SsText
        variant="caption"
        color={colors.inkSoft}
        style={[styles.quelle, fuellt && [styles.quelleVoll, { bottom: fussHoehe + 4 }]]}>
        {KARTE_QUELLE}
      </SsText>
    </View>
  );
}

const styles = StyleSheet.create({
  rahmen: { position: 'relative' },
  /** Mit `fuellt` nimmt die Karte allen Platz, den sie bekommt — Phase 19e. */
  rahmenVoll: { flex: 1, alignSelf: 'stretch' },
  flaeche: { position: 'relative', overflow: 'hidden' },
  flaecheVoll: { flex: 1, alignSelf: 'stretch' },
  quelle: { fontSize: 10, lineHeight: 14, paddingTop: 2, textAlign: 'center' },
  // Über der Karte statt darunter — und oberhalb des Blattes, sonst wäre die
  // Lizenzzeile verdeckt. Apples eigene Nennung zeichnet MapKit selbst.
  quelleVoll: { position: 'absolute', left: 8, paddingTop: 0, textAlign: 'left' },
  zahl: { fontWeight: '600' },
  // `StyleSheet.absoluteFillObject` gibt es in React Native 0.86 nicht mehr (ACTA).
  ueberKarte: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    // Im `style`, nicht als Prop (ACTA-Falle).
    pointerEvents: 'box-none',
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
