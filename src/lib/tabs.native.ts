/**
 * Was die Tab-Leiste an Platz kostet — **die iOS-Fassung, seit Phase 22 Teil 2.**
 *
 * ── Warum es diese Datei überhaupt gibt ──────────────────────────────────────
 * Auf iOS zeichnet seit Ians Entscheidung 85 Apples eigene `UITabBar`
 * (`NativeTabs`), nicht mehr die JS-Leiste von `expo-router/js-tabs`. Und Apples
 * Leiste legt dem Inhalt ihre Insets **selbst** unter — `react-native-screens`
 * meldet sie an den Scroll-Container. Wer dort zusätzlich einen Rand aufschlägt,
 * schiebt den Inhalt doppelt nach oben.
 *
 * ⚠️ **Der Wächter in `tabs.ts` täte auch ohne diese Datei das Richtige** — und
 * genau deshalb steht sie hier. `useTabRand()` fragt dort
 * `useContext(BottomTabBarHeightContext) != null`, und diesen Kontext liefert nur
 * `expo-router/js-tabs`. Unter `NativeTabs` gibt es ihn nicht, die Funktion gäbe
 * also von selbst 0 zurück. **Zufällig richtig zu sein ist kein Zustand, auf den
 * man baut**: Ein Import, der den Kontext eines Tages doch bereitstellt, änderte
 * das Verhalten der ganzen App, ohne dass jemand diese Zeile anfasst. Hier steht
 * es ausgesprochen.
 *
 * ── Was diese Datei mit ABSICHT nicht exportiert ─────────────────────────────
 * Die Kapsel-Maße (`TAB_KAPSEL_HOEHE`, `TAB_KAPSEL_SEITE`, `TAB_SYMBOL_VERSATZ`,
 * `tabKapselUnten` …). Auf iOS gibt es keine eigene Kapsel mehr, die man messen
 * könnte — sie gehört Apple. **Wer sie auf iOS liest, bekommt jetzt einen
 * Typfehler statt einer stillen Falschmessung.** Das ist dieselbe Technik wie
 * `aufGrund` als Pflichtfeld in `colors.ts`: `tsc` schreibt die Arbeitsliste.
 *
 * Auf Web bleibt `tabs.ts` unverändert und liefert weiter alles — dort steht die
 * Kapsel ja noch (Entscheidung 43: zwei Dateien mit Absicht, wie `SsGlas`).
 */

/**
 * Wie viel Platz die Tab-Leiste dem Inhalt wegnimmt — auf iOS **nichts**.
 *
 * `react-native-screens` trägt die Insets der nativen Leiste selbst in den
 * Scroll-Container ein. Der Rand wäre ein zweiter.
 */
export function useTabRand(): number {
  return 0;
}
