import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

import { SsText } from './SsText';
import { spanneText } from '@/config/alter';
import { accent, colors, radius, spacing } from '@/theme';

export interface SsJahrgangBalkenProps {
  /** Der ÄLTERE Rand (kleinere Zahl). */
  von: number;
  /** Der JÜNGERE Rand (größere Zahl). */
  bis: number;
  min: number;
  max: number;
  onChange: (von: number, bis: number) => void;
}

/**
 * Der Schiebe-Balken für Jahrgänge — Ians Entscheidung 17, gebaut in Phase 18b.
 *
 * Zwei Griffe auf einer Schiene: „von Jahrgang X bis Jahrgang Y". Benutzt an ZWEI
 * Stellen — im Feed-Filter („wen suche ich") und im Erstellen-Screen („für wen ist
 * das"). Deshalb ist er ein Baustein und keine lokale Komponente: Zwei Regler mit
 * verschiedenem Rastverhalten wären ein Fehler, den man erst merkt, wenn jemand
 * beides hintereinander benutzt.
 *
 * ── Warum kein Native-Modul ──────────────────────────────────────────────────
 * Harte Regel 1. Für Regler gibt es fertige Bibliotheken, alle mit nativem Anteil —
 * und der Prototyp läuft zuerst im Browser. `PanResponder` ist JS und tut es.
 *
 * ── Falle 1: die Geste (Phase 11, teuer bezahlt) ─────────────────────────────
 * `onPanResponderTerminationRequest` steht per Voreinstellung auf „ja" — der
 * Responder gibt die Geste her, sobald jemand fragt. Beim Wischstapel war genau das
 * der Grund, warum das Wischen am breiten Fenster lief und in Handybreite nicht: Ein
 * ScrollView darüber nahm sie nach dem ersten Move ab. Ein Regler liegt hier IN einem
 * Scroll-Bereich (Filterblatt, Erstellen-Screen), also gilt dasselbe: `false`.
 *
 * ── Falle 2: die gemessene Breite (2026-09-03) ───────────────────────────────
 * Die Position eines Griffs ist `(wert − min) / (max − min) × breite`. Beim
 * Web-Export gibt es kein Fenster, `onLayout` feuert nie, und `breite` ist **null** —
 * dann stehen beide Griffe links übereinander, und der HTML-Schnappschuss zeigt einen
 * Zustand, den es am Gerät nie gibt. `NOTBREITE` fängt das ab. Anders als beim
 * Wischstapel repariert sich das hier nach der Messung von selbst: Das sind gewöhnliche
 * Styles und keine `AnimatedInterpolation`, die auf einen Eingang wartet.
 *
 * ── Warum EIN Responder auf der Schiene und nicht einer je Griff ─────────────
 * Zwei verschachtelte Responder streiten sich um dieselbe Berührung, und wer gewinnt,
 * hängt an der Reihenfolge im Baum. Mit einem Responder auf der Schiene ist die Frage
 * „welchen Griff meinst du?" schlicht Rechnen: der nähere. Das gibt nebenbei das
 * Verhalten, das man erwartet — ein Tipp irgendwo auf die Schiene holt den nächsten
 * Griff dorthin, statt nichts zu tun.
 */
export function SsJahrgangBalken({ von, bis, min, max, onChange }: SsJahrgangBalkenProps) {
  const [breite, setBreite] = useState(0);

  // Die Griffe wandern, während der Finger unten ist — deshalb müssen die Handler
  // immer die AKTUELLEN Werte sehen. Ein `useRef` statt der Closure-Werte: Ein
  // `PanResponder` wird einmal gebaut und behielte sonst die Werte des ersten
  // Renderns (dieselbe Falle wie ein `setInterval` mit veraltetem State).
  //
  // `onChange` liegt bewusst MIT im Ref und nicht in einer Abhängigkeitsliste: Die
  // Prop bekommt bei jedem Rendern eine neue Identität, und stünde sie in den Deps,
  // würde der Responder mitten in der Geste neu gebaut.
  //
  // Nachgezogen wird im EFFEKT und nicht beim Rendern — dasselbe Muster wie in
  // `WischKarte`, und `react-hooks/refs` verbietet das Zweite zu Recht. Für die
  // Handler macht es keinen Unterschied: Ein Effekt läuft lange vor der nächsten
  // Berührung.
  const werte = useRef({ von, bis, breite, onChange });
  useEffect(() => {
    werte.current = { von, bis, breite, onChange };
  }, [von, bis, breite, onChange]);

  /**
   * Welcher Griff gerade am Finger hängt — `null` heißt „noch nicht entschieden".
   *
   * Den Fall gibt es nur, wenn beide Griffe auf DEMSELBEN Wert stehen. Dann sagt die
   * Tipp-Stelle nichts: Wer die Mitte des Paares um ein paar Pixel verfehlt, bekäme
   * den Griff, der in die falsche Richtung kann — und das Paar klebt fest. Die
   * fehlende Auskunft ist die RICHTUNG, und die gibt es erst bei der ersten Bewegung.
   */
  const aktiv = useRef<'von' | 'bis' | null>('von');
  /** Wo der Finger aufgesetzt hat — für den Fall, dass er sich nie bewegt hat. */
  const startWert = useRef(0);
  /** Der linke Rand der Schiene im Fenster — für die Umrechnung von Finger zu Wert. */
  const links = useRef(0);
  const schiene = useRef<View>(null);

  const messen = () => {
    schiene.current?.measureInWindow((x, _y, w) => {
      links.current = x;
      setBreite(w);
    });
  };

  /** Fingerposition im Fenster → Jahrgang, gerastet und in den Grenzen. */
  const zuWert = useCallback(
    (fingerX: number): number => {
      const spanne = werte.current.breite || NOTBREITE;
      const anteil = Math.min(Math.max((fingerX - links.current) / spanne, 0), 1);
      return Math.round(min + anteil * (max - min));
    },
    [min, max],
  );

  /**
   * Den aktiven Griff auf `wert` setzen — und die beiden nie kreuzen lassen.
   *
   * Der andere Griff ist die Grenze, nicht `min`/`max`: Zöge man „von" über „bis"
   * hinaus, hieße die Spanne „von 2012 bis 2009", und jede Anzeige darunter müsste
   * raten, ob sie das umdrehen soll. Ein Zustand, den es nicht geben kann, ist
   * besser als einer, den sieben Stellen abfangen.
   */
  const schieben = useCallback((wert: number) => {
    const { von: v, bis: b, onChange: melden } = werte.current;
    if (aktiv.current === null) {
      // Noch keine Richtung erkennbar — nichts tun, aber auch nichts festlegen.
      if (wert === v) return;
      aktiv.current = wert > v ? 'bis' : 'von';
    }
    if (aktiv.current === 'von') melden(Math.min(wert, b), b);
    else melden(v, Math.max(wert, v));
  }, []);

  /**
   * Welchen Griff meint diese Berührung? Den näheren — und der Tipp holt ihn her.
   *
   * Der Sonderfall sind zwei Griffe auf demselben Wert. Der erste Versuch entschied
   * auch dort über die Tipp-Stelle, und am Regler nachgemessen klemmte das Paar
   * dann fest: Ein Druck acht Pixel links der Mitte wählte „von", und „von" kommt
   * von dort nur nach links. Wer nach rechts zog, bewegte nichts.
   *
   * Deshalb wird die Entscheidung vertagt, statt sie zu raten (`aktiv = null`) —
   * `schieben` fällt sie bei der ersten Bewegung aus der RICHTUNG, und `loslassen`
   * holt sie nach, falls es nie eine Bewegung gab.
   */
  const greifen = useCallback(
    (wert: number) => {
      const { von: v, bis: b } = werte.current;
      startWert.current = wert;
      if (v === b) {
        aktiv.current = null;
        return;
      }
      aktiv.current = Math.abs(wert - v) <= Math.abs(wert - b) ? 'von' : 'bis';
      schieben(wert);
    },
    [schieben],
  );

  /**
   * Ein TIPP auf ein zusammengeschobenes Paar — es gab keine Bewegung, also hat
   * `schieben` nie entschieden. Dann zählt doch die Tipp-Stelle: Sie sagt, in
   * welche Richtung das Paar aufgehen soll.
   */
  const loslassen = useCallback(() => {
    if (aktiv.current === null) schieben(startWert.current);
  }, [schieben]);

  // Der Responder wird einmal gebaut und enthält nur stabile Rückrufe — kein Ref
  // wird hier beim Rendern angefasst. Deshalb `useMemo` und nicht
  // `useRef(…).current`: Ein Ref beim Rendern zu lesen ist ein Fehler
  // (`react-hooks/refs`), und `responder.panHandlers` weiter unten wäre genau das.
  // `WischKarte` nimmt dort noch ein Ref; das ist älter als die Regel.
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        // Siehe Falle 1 oben. Ohne diese Zeile klemmt der Regler am Handy und läuft
        // am Schreibtisch — der Unterschied ist nur, ob ein ScrollView danebensteht.
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (_e, g) => greifen(zuWert(g.x0)),
        onPanResponderMove: (_e, g) => schieben(zuWert(g.moveX)),
        onPanResponderRelease: loslassen,
      }),
    [greifen, loslassen, schieben, zuWert],
  );

  const b = breite || NOTBREITE;
  const anteil = (wert: number) => (wert - min) / (max - min);
  const xVon = anteil(von) * b;
  const xBis = anteil(bis) * b;

  return (
    <View>
      <SsText variant="label" center>
        {spanneText(von, bis)}
      </SsText>

      <View
        ref={schiene}
        onLayout={messen}
        style={styles.schiene}
        accessibilityRole="adjustable"
        accessibilityLabel={`Jahrgang ${spanneText(von, bis)}`}
        {...responder.panHandlers}>
        <View style={styles.gleis} />
        <View style={[styles.gewaehlt, { left: xVon, width: Math.max(xBis - xVon, 0) }]} />
        <View style={[styles.griff, { left: xVon - GRIFF / 2 }]} />
        <View style={[styles.griff, { left: xBis - GRIFF / 2 }]} />
      </View>

      <View style={styles.enden}>
        <SsText variant="caption" color={colors.inkSoft}>
          {min}
        </SsText>
        <SsText variant="caption" color={colors.inkSoft}>
          {max}
        </SsText>
      </View>
    </View>
  );
}

/**
 * Die Breite, mit der gerechnet wird, solange nichts gemessen ist.
 *
 * Dieselbe Absicherung wie `NOTBREITE` in `features/posts/wisch.ts` und aus
 * demselben Anlass: Beim statischen Web-Export gibt es kein Fenster. Der Wert ist
 * nur für den ersten Bildaufbau da — sobald `onLayout` gefeuert hat, gilt die echte
 * Breite.
 */
const NOTBREITE = 280;
const GRIFF = 26;
const GLEIS = 6;
/** Höhe der Berührungsfläche. Deutlich mehr als der Griff — 26 px sind am Handy
 *  knapp, und danebengreifen heißt hier: die Seite scrollt statt zu schieben. */
const SCHIENE_HOEHE = 44;

const styles = StyleSheet.create({
  schiene: {
    height: SCHIENE_HOEHE,
    justifyContent: 'center',
    marginTop: spacing.sm,
    // Der Griff ragt an den Enden um seine halbe Breite über die Schiene hinaus.
    // Ohne diesen Rand schneidet der Elternteil ihn bei 0 % und 100 % an.
    marginHorizontal: GRIFF / 2,
  },
  gleis: { height: GLEIS, borderRadius: radius.pill, backgroundColor: colors.line },
  gewaehlt: {
    position: 'absolute',
    height: GLEIS,
    borderRadius: radius.pill,
    backgroundColor: accent.base,
  },
  griff: {
    position: 'absolute',
    width: GRIFF,
    height: GRIFF,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: accent.base,
    // Die Signatur der App: der harte Rand unten. Am Griff macht er sichtbar, dass
    // er ein Ding zum Anfassen ist und keine Markierung.
    borderBottomWidth: 4,
    borderBottomColor: accent.deep,
    // `'grab'` wäre die richtige Geste, aber `CursorValue` in React Native kennt sie
    // nicht — und die App zeigt überall `pointer` (siehe `SsCard`).
    cursor: 'pointer',
  },
  enden: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
});
