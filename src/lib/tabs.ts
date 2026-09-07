import { BottomTabBarHeightContext } from 'expo-router/js-tabs';
import { useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@/theme';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DIE TAB-LEISTE IST EINE SCHWEBENDE KAPSEL — Phase 19e-2
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * **Ians Vorbild liegt als Bild im Projekt: `vorbild-liquid-glass-bierbuddy.png`.**
 * Es ist derselbe Screenshot, aus dem Entscheidung 41 kommt (runder Knopf neben der
 * Leiste). Am 2026-09-07 hat er die erste Glas-Fassung gesehen und gesagt, sie sei
 * *„noch nicht wie ich es dir gezeigt habe"* — und er hatte recht. Der Unterschied
 * war nicht der Effekt, sondern die FORM:
 *
 *   erste Fassung   eine Leiste über die ganze Breite, unten bündig, mit Trennlinie
 *                   oben — also die gewohnte iOS-Leiste, nur mit Glas dahinter
 *   Vorbild         eine **freistehende Kapsel**: rundum Abstand zum Rand, voll
 *                   gerundet, keine Linie. Die Karte läuft an allen vier Seiten
 *                   daran vorbei, und genau davon lebt Glas.
 *
 * **Glas braucht Rand, nicht nur Hintergrund.** Eine Fläche, die an drei Kanten am
 * Schirm klebt, sieht aus wie eine getönte Leiste; erst wenn Inhalt daneben UND
 * darunter durchläuft, sieht man, dass sie bricht. Das ist der ganze Unterschied
 * zwischen den zwei Fassungen.
 *
 * ── Warum die Maße hier stehen und nicht im Layout ────────────────────────────
 * Drei Stellen brauchen sie: die Leiste selbst (`(tabs)/_layout.tsx`), jeder
 * Screen darüber (`SsScreen`) und das Blatt auf der Karte (`SsBlatt.unten`).
 * Stünden sie im Layout, müssten die anderen zwei sie schätzen — und eine
 * geschätzte Höhe ist der Grund, warum eine Zeile hinter der Leiste landet.
 */

/**
 * Wie hoch die Kapsel ist. Fest und nicht gemessen: Sie enthält Symbol plus
 * Beschriftung, und beides hat eine feste Größe — anders als der Blattkopf, der
 * einen Text mit unbekannter Länge trägt (harte Regel 60).
 */
export const TAB_KAPSEL_HOEHE = 56;

/** Seitlicher Abstand — dasselbe Maß wie der Seitenrand jedes Screens. */
export const TAB_KAPSEL_SEITE = spacing.lg;

/**
 * Wie weit die Kapsel über dem unteren Rand schwebt.
 *
 * Am Vorbild abgelesen (≈ 25 pt auf einem 852-pt-Schirm) und auf das Raster der App
 * gerundet. Auf einem Gerät mit Home-Anzeige ist der Sicherheitsabstand 34 pt — die
 * Kapsel darf ein Stück hineinragen, sonst schwebt sie mitten im Bild; unter der
 * Anzeige liegen darf sie nicht. Im Browser gibt es keinen Inset, dort ist es ein
 * fester kleiner Abstand.
 */
export function tabKapselUnten(insetUnten: number): number {
  return insetUnten > 0 ? Math.max(insetUnten - 10, spacing.md) : spacing.md;
}

/**
 * Wie viele Bildpunkte unten von der schwebenden Kapsel belegt sind — oder **0**,
 * wenn gerade keine Tab-Leiste da ist.
 *
 * ── Warum der Kontext und nicht `useBottomTabBarHeight()` ─────────────────────
 * Der Haken daneben wirft, wenn er außerhalb einer Tab-Leiste gerufen wird — und
 * `SsScreen` steht auf jedem Screen der App, die meisten davon liegen außerhalb
 * (`/post/[id]`, `/chat/[id]`, `/create` …). Der Kontext liefert dort `undefined`,
 * und **das ist die richtige Antwort auf „wie viel Leiste ist unten?"**
 *
 * ── Warum die Höhe NICHT aus dem Kontext kommt ────────────────────────────────
 * Er meldet die Höhe der Leiste selbst. Seit sie schwebt, ist der belegte Platz
 * aber Höhe **plus** Abstand nach unten — und den kennt nur diese Datei.
 */
export function useTabRand(): number {
  const insets = useSafeAreaInsets();
  const inLeiste = useContext(BottomTabBarHeightContext) != null;
  if (!inLeiste) return 0;
  return TAB_KAPSEL_HOEHE + tabKapselUnten(insets.bottom) + spacing.sm;
}
