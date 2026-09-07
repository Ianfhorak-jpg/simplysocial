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
 * ── Was `SsGlas` mitbringt und was der Aufrufer mitbringt ─────────────────────
 * `SsGlas` verantwortet den **Untergrund samt seiner Kante**: auf iOS 26 das Glas,
 * das seine helle Kante selbst zeichnet, sonst die helle Fläche — und, wenn die
 * Fläche `schwebt`, die 1-px-Linie und den Schatten, die dort das Gleiche sagen.
 * Der Aufrufer bringt nur Geometrie mit: Radius, Polsterung, `flex`, Position.
 * **Warum das nicht andersherum geht, steht bei `glasSchwebt`** — es ist die
 * Berichtigung, die aus Ians Rückmeldung zur ersten Fassung kam.
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
 */
export const glasErsatz = StyleSheet.create({
  flaeche: { backgroundColor: colors.surface },
}).flaeche;

/**
 * Was eine SCHWEBENDE Fläche zusätzlich braucht — **aber nur dort, wo es kein Glas
 * gibt.**
 *
 * ── Die Berichtigung vom 2026-09-07 (Ians Rückmeldung zur ersten Glas-Fassung) ──
 * Zuerst stand hier: „Glas ersetzt die Fläche, nicht den Rahmen" — Kante und
 * Schatten kamen vom Aufrufer und galten in BEIDEN Zweigen. Am Bild war das falsch:
 * Echtes Liquid Glass bringt seine eigene helle Kante mit und wirft keinen
 * Schlagschatten. Eine 1-px-Linie plus Schatten darüber macht daraus wieder eine
 * Karte mit unscharfem Hintergrund — genau der Eindruck, den Ian als *„sieht noch
 * nicht so gut aus"* beschrieben hat.
 *
 * **Kante und Schatten sind also nicht Zierde, sondern der ERSATZ für das, was Glas
 * selbst mitbringt.** Deshalb stehen sie hier und werden im Glas-Zweig weggelassen.
 * Und deshalb sind sie an einer Prop und nicht immer an: Der Blattkopf schwebt
 * nicht, er sitzt oben in einem Blatt, das seine eigene Kante und seinen eigenen
 * Schatten schon hat.
 */
export const glasSchwebt = StyleSheet.create({
  ersatz: {
    borderWidth: 1,
    borderColor: colors.line,
    boxShadow: '0 4px 16px rgba(23, 25, 28, 0.16)',
  },
}).ersatz;

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
   * Die Fläche steht frei über etwas anderem — die Tab-Kapsel und die
   * Umschalter-Pille tun das, der Blattkopf nicht.
   *
   * Wirkt **nur im Rückfall**: Dort bekommt sie Kante und Schatten, damit man ihr
   * ansieht, dass sie darüberliegt. Echtes Glas sagt das von selbst.
   */
  schwebt?: boolean;
  /** Nur Geometrie: Radius, Polsterung, `flex`, Position. */
  style?: StyleProp<ViewStyle>;
}
