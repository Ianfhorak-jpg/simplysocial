import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { colors } from '@/theme';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS „GLAS" IN DIESER APP HEISST (Phase 19e-2)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Ians Entscheidung 43: **Liquid Glass nur auf iOS, der Browser bleibt schlicht.**
 * `expo-glass-effect` ist Apples echtes Glas und braucht **iOS 26+**; überall sonst
 * steht dieselbe helle Fläche wie bisher. Der Haken ist ausgesprochen und
 * angenommen: Genau die Fassung, die Ian den drei Mitgründern schickt, ist die
 * schlichtere.
 *
 * ── Warum diese Datei existiert und die Werte nicht bei einem Zeichner stehen ──
 * Es gibt zwei Zeichner (`SsGlas.tsx` für Web, `SsGlas.native.tsx` für iOS) und
 * **genau eine** Bedeutung. Dieselbe Bauart wie `karte-typen.ts` neben den beiden
 * Kartenzeichnern und aus demselben Grund (harte Regel 52): Stünde der Rückfall bei
 * einem von ihnen, wäre dieser der heimliche Maßstab, und die zwei Flächen liefen
 * beim nächsten Farbwechsel auseinander.
 *
 * ── Glas ersetzt die FLÄCHE, nicht den Rahmen ─────────────────────────────────
 * `SsGlas` bringt genau eine Eigenschaft mit: den Untergrund. Radius, Kante,
 * Schatten, Polsterung und `flex` kommen vom Aufrufer und gelten in **beiden**
 * Zweigen. Das ist der Grund, warum der Umbau keinen einzigen Stil verdoppelt hat:
 * Eine Pille bleibt dieselbe Pille, sie steht nur auf einem anderen Grund.
 *
 * ── Warum Plattform-Endungen und kein `Platform.OS`-Zweig ─────────────────────
 * Harte Regel 52. `expo-glass-effect` bringt zwar selbst einen Rückfall für Web
 * mit (`GlassView.tsx` ist dort ein blankes `View`) — aber im Web-Bündel hat das
 * Paket nichts zu suchen, und die Endung kostet nichts. Anders als bei `SsIcon`
 * (Regel 24), wo beide Zweige DASSELBE zeichnen und eine Datei richtig ist.
 */

/**
 * Der Untergrund, wo es kein Glas gibt: dieselbe helle Fläche, die die App seit
 * Phase 1 überall benutzt.
 *
 * **Bewusst nur die Farbe.** Kante und Schatten gehören dem Aufrufer — sonst bekäme
 * die Tab-Leiste den Schatten der Umschalter-Pille, und niemand fände heraus, woher.
 */
export const glasErsatz = StyleSheet.create({
  flaeche: { backgroundColor: colors.surface },
}).flaeche;

/**
 * Welches Farbschema das Glas annimmt — **`light`, nicht `auto`.**
 *
 * `auto` folgt dem GERÄT. Die App steht aber fest auf hell (`userInterfaceStyle:
 * "light"` in `app.json`): Auf einem iPhone im Dunkelmodus läge dann dunkles Glas
 * über einer hellen App. Das ist keine Kleinigkeit — der Umschalter darin schreibt
 * mit `colors.inkSoft`, und der ist für hellen Grund gemessen.
 */
export const GLAS_FARBSCHEMA = 'light' as const;

/**
 * Wie dick das Glas ist. `regular` ist Apples Voreinstellung und die einzige, die
 * über einer Karte noch etwas durchlässt, ohne dass Text darauf unlesbar wird;
 * `clear` ist fast durchsichtig und gehört über Fotos, nicht über eine Liste.
 */
export const GLAS_STIL = 'regular' as const;

/** Was jeder Glas-Zeichner können muss. */
export interface SsGlasProps {
  children?: ReactNode;
  /**
   * Alles Geometrische: Radius, Kante, Schatten, Polsterung, `flex`. Gilt in
   * beiden Zweigen gleich — siehe „Glas ersetzt die Fläche, nicht den Rahmen".
   */
  style?: StyleProp<ViewStyle>;
}
