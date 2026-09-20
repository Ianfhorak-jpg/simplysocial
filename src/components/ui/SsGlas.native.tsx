import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { View } from 'react-native';

import {
  GLAS_AN,
  GLAS_FARBSCHEMA,
  GLAS_STIL,
  glasErsatz,
  glasSchwebt,
  type SsGlasProps,
} from './glas-typen';

/**
 * Die iOS-Fassung: echtes Liquid Glass — Phase 19e-2, Ians Entscheidung 43.
 *
 * ── Warum ZWEI Prüfungen und nicht eine ───────────────────────────────────────
 * `isLiquidGlassAvailable()` sagt, ob die App im Liquid-Glass-Design läuft (also
 * iOS 26 und aufwärts). `isGlassEffectAPIAvailable()` sagt, ob die API überhaupt
 * da ist — **es gibt iOS-26-Beta-Fassungen, in denen sie fehlt und der Aufruf
 * abstürzt** (expo/expo#40911). Die zweite Prüfung ist deshalb keine Zierde: Ohne
 * sie wäre die App auf genau diesen Geräten nicht schlicht, sondern zu.
 *
 * Beide werden **einmal beim Laden** gelesen und nicht bei jedem Zeichnen. Es sind
 * Eigenschaften des Geräts, keine des Zustands; die Funktionen darunter merken
 * sich ihr Ergebnis ohnehin selbst.
 *
 * ── Was das Glas NICHT bekommt ────────────────────────────────────────────────
 * `isInteractive` gibt es und bleibt aus: Es lässt das Glas auf Berührung reagieren
 * und wäre hier falsch, weil auf allen drei Flächen etwas ANDERES das Ziel ist —
 * der Umschalter, das ✕, ein Tab. Ein Glas, das selbst aufleuchtet, würde eine
 * Rückmeldung geben, die nichts mit dem Getroffenen zu tun hat.
 *
 * ── Die Falle aus der Doku, damit sie niemand zweimal findet ──────────────────
 * `opacity: 0` auf dem Glas ODER auf einem Elternteil schaltet den Effekt ab. Wer
 * eine dieser Flächen später einblenden will, nimmt `glassEffectStyle` mit
 * `animate`, nicht die Deckkraft.
 */

/**
 * Ob hier Glas gezeichnet wird.
 *
 * 🔴 **`GLAS_AN` steht seit Ians Entscheidung 99 auf `false`** — die Begründung
 * steht bei der Konstante in `glas-typen.ts` und ist zu lang für hier. Kurz: Das
 * Material ist Apples und funktioniert; was fehlt, ist Apples LEISTE, und die kann
 * React Native heute nicht. Deshalb steht hier bewusst eine matte Fläche.
 *
 * Die zwei Geräte-Prüfungen bleiben dahinter stehen und werden dank
 * Kurzschluss-Auswertung gar nicht mehr erreicht. Sie sind nicht tot, sondern die
 * Bedingung, die wieder zählt, sobald der Schalter umgelegt wird — die Reihenfolge
 * darin ist Absicht: erst „gibt es die API?", dann „ist das Design an?".
 */
const GLAS_DA = GLAS_AN && isGlassEffectAPIAvailable() && isLiquidGlassAvailable();

export function SsGlas({ children, schwebt, style }: SsGlasProps) {
  if (!GLAS_DA) return <View style={[glasErsatz, schwebt && glasSchwebt, style]}>{children}</View>;

  // KEIN `glasErsatz` und KEIN `glasSchwebt`: Eine deckende Fläche hinter dem Glas
  // ist genau das, was es zu sehen geben soll, und Kante und Schatten bringt es
  // selbst mit. Beides darüberzulegen war die erste Fassung — und der Grund, warum
  // Ian sagte, es sehe noch nicht aus wie sein Vorbild.
  return (
    <GlassView style={style} glassEffectStyle={GLAS_STIL} colorScheme={GLAS_FARBSCHEMA}>
      {children}
    </GlassView>
  );
}
