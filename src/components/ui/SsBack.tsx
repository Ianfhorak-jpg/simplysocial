import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { SsGlas } from './SsGlas';
import { SsIcon } from './SsIcon';

import { zurueckOderFeed } from '@/lib/navigation';
import { colors, DRUCK, radius, spacing } from '@/theme';

/** Apples Mindestmaß für eine Trefferfläche. Kein gerundeter Wert, sondern die Zahl
 *  aus den Human Interface Guidelines — deshalb steht sie hier benannt und nicht
 *  als 44 mitten im Style. */
const TREFFER = 44;
/** So groß ist der Pfeil selbst. Der Rest der 44 pt ist Luft. */
const PFEIL = 22;

/**
 * Der Zurück-Knopf. Es gibt genau diesen einen.
 *
 * ── Warum als Baustein und nicht als drei Zeilen im Screen ────────────────────
 * In CLAUDE.md steht die Regel „Zurück-Knöpfe nehmen `zurueckOderFeed()`, nie blankes
 * `router.back()`" — und sie ist schon einmal gebrochen worden (Phase 2, `bausteine.tsx`
 * hatte einen toten Knopf). Eine Regel, an die man sich erinnern muss, wird irgendwann
 * gebrochen. Ein Baustein, den man einfach nimmt, nicht.
 *
 * Kopfzeile von React Navigation wäre die Alternative, sieht aber auf Web und iOS
 * unterschiedlich aus — deshalb ist sie in `app/_layout.tsx` abgeschaltet und jeder
 * Screen setzt seine eigene.
 *
 * ── Seit Phase 19f: nur noch der Pfeil (Ians Entscheidung 52) ─────────────────
 * Das Wort „Zurück" ist weg. Es stand auf jedem Screen der App und hat nie etwas
 * gesagt, das der Pfeil nicht schon sagt — harte Regel 63 in ihrer einfachsten
 * Anwendung. Am Post-Screen war es sogar mehr als überflüssig: Dort standen
 * „Zurück", die Kategorie und der Titel untereinander, und Ians Satz dazu war
 * *„Sport, Zurück, Sport, Tennis spielen — alles untereinander."*
 *
 * **Der Preis ist die Trefferfläche, und der ist bezahlt.** Ein Pfeil allein ist
 * schmaler als Pfeil-plus-Wort — aus rund 90 × 26 pt wären 22 × 22 geworden, also
 * ein Viertel von Apples Mindestmaß. Deshalb ist die Fläche ausdrücklich 44 × 44.
 *
 * `label` gibt es weiter, aber nur noch für VoiceOver. Ein Knopf ohne Namen ist
 * dort ein Knopf ohne Funktion.
 *
 * ── Seit Phase 20.10: der Pfeil sitzt in einer GLASKAPSEL ───────────────────
 * Ians Urteil am 2026-09-14 war *„sieht immer noch wie Android aus"* — gefällt am
 * iPhone, auf dem Liquid Glass seit Phase 19e-2 läuft. Es lief nur an drei Flächen,
 * und keine davon steht auf den elf Screens außerhalb der Tabs. Dort war oben links
 * ein nackter schwarzer Pfeil auf Papierweiß, also genau das Bild, das die Phase
 * abstellen sollte.
 *
 * Auf Ians Vorbild (`vorbild-liquid-glass-bierbuddy.png`, Grundlage von Entscheidung
 * 41 und 43) ist dieser Knopf oben links **die zweite Glasfläche neben der
 * Tab-Kapsel** — ein Kreis, sonst nichts. Genau den gibt es jetzt.
 *
 * ── Was das an der Ausrichtung ÄNDERT, und warum das richtig ist ────────────
 * Bis hierher saß der Pfeil links oben in seinen 44 × 44 statt zentriert, damit er
 * in einer Flucht mit dem Inhalt darunter steht; ein zentrierter Pfeil hätte einen
 * negativen Rand gebraucht, und die sind in diesem Projekt schon einmal
 * schiefgegangen (Phase 12).
 *
 * **Sobald die Fläche SICHTBAR ist, dreht sich das Argument um.** Ein Kreis, dessen
 * Zeichen in der linken oberen Ecke klebt, sieht schlicht kaputt aus. Und die Flucht
 * ist nicht verloren, sondern gewechselt: Ab jetzt fluchtet die **Kapsel** mit dem
 * Inhalt darunter, nicht mehr der Pfeil darin — der rückt dabei um 11 pt nach rechts.
 * Das ist genau, was iOS 26 selbst tut, und es braucht keinen negativen Rand.
 *
 * ── Wo KEIN Glas ist, sieht man den Knopf trotzdem ──────────────────────────
 * `SsGlas` mit `schwebt` (harte Regel 61): Im Browser und auf iOS vor 26 steht dort
 * eine weiße Kreisfläche mit Kante und Schatten. Das ist nicht der Rückfall „wie
 * vorher" — vorher gab es gar keine Fläche. Der Knopf wird dadurch auf BEIDEN
 * Plattformen deutlicher als er war, nur auf einer davon ist er aus Glas.
 *
 * ── Seit Phase 19i: `onPress` darf überschrieben werden ──────────────────────
 * Nicht jedes „zurück" ist ein Screen-Wechsel. Das Bezirks-Vollbild (Ians
 * Entscheidung 65) ist ein ZUSTAND im Feed-Screen und keine eigene Adresse —
 * dort führt `zurueckOderFeed()` aus der Karte hinaus statt eine Ebene zurück.
 *
 * **Harte Regel 5 bleibt damit unangetastet, und zwar absichtlich so gebaut:**
 * Wer nichts angibt, bekommt weiter `zurueckOderFeed()`. Es gibt keinen zweiten
 * Zurück-Knopf und keinen Screen, der sich seinen eigenen baut — nur eine Stelle,
 * an der der Rückweg ein anderer ist, und die sagt es ausdrücklich.
 */
export function SsBack({
  label = 'Zurück',
  onPress,
  style,
}: {
  label?: string;
  /** Nur setzen, wo „zurück" KEIN Screen-Wechsel ist — siehe Kopfkommentar. */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress ?? zurueckOderFeed}
      accessibilityRole="button"
      accessibilityLabel={label}
      // Nach links und oben ist die Fläche zu Ende, weil dort der Seitenrand des
      // Screens beginnt. `hitSlop` holt genau diesen Streifen zurück — auf Native.
      // Im Browser ist es wirkungslos (react-native-web setzt es nicht um), dort
      // trägt allein die echte Fläche.
      hitSlop={{ left: spacing.lg, top: spacing.sm }}
      style={({ pressed }) => [styles.knopf, pressed && DRUCK, style]}>
      {/* `schwebt`: Der Knopf liegt über dem Screen-Inhalt, also bekommt er dort,
          wo es kein Glas gibt, Kante und Schatten als Ersatz (harte Regel 61). */}
      <SsGlas schwebt style={styles.kapsel}>
        <SsIcon name="pfeilLinks" size={PFEIL} color={colors.ink} />
      </SsGlas>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  knopf: { alignSelf: 'flex-start', cursor: 'pointer' },
  /**
   * Die Kapsel IST die Trefferfläche — 44 × 44, nicht ein kleinerer Kreis in einer
   * größeren unsichtbaren Fläche. Das ging, solange die Fläche unsichtbar war; jetzt
   * wäre ein Kreis, der kleiner ist als das, was man treffen kann, eine zweite
   * Wahrheit über dieselbe Sache.
   *
   * Kein `borderCurve`: Bei `pill` an einem Quadrat ist die Ecke ein Viertelkreis
   * mit Radius 22 — da gibt es nichts mehr weicher zu machen.
   */
  kapsel: {
    width: TREFFER,
    height: TREFFER,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    // `SsGlas` reicht sein `style` im Glas-Zweig an `GlassView` durch, und das
    // klippt sein Kind nicht von selbst. Hier ragt nichts heraus, aber die Absicht
    // „rund" soll am Kasten stehen und nicht am Zufall der Maße hängen.
    overflow: 'hidden',
  },
});
