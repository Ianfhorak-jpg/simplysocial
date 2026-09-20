import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
 * könnte — sie gehört Apple.
 *
 * 🔴 **BERICHTIGUNG vom 2026-09-20.** Hier stand: *„Wer sie auf iOS liest,
 * bekommt jetzt einen Typfehler statt einer stillen Falschmessung."* **Den
 * Typfehler gibt es nicht.** `tsc` löst `@/lib/tabs` IMMER auf `tabs.ts` auf;
 * die Plattform-Endungen kennt nur Metro, TypeScript bräuchte dafür
 * `moduleSuffixes` in der `tsconfig.json`, und das steht dort nicht.
 *
 * Genau diese stille Falschmessung ist dann passiert: `AntwortLeiste.tsx`
 * holte `TAB_KAPSEL_SEITE`, tsc war sauber, und am iPhone klebte die Leiste
 * schmal am linken Rand — `undefined` als `left`/`right`, von
 * `StyleSheet.create` eingefroren.
 *
 * Die Absicherung heißt seither **`npm run pruef-plattform`** und prüft ALLE
 * `.native`-Paare, nicht nur dieses. `moduleSuffixes` wäre die naheliegende
 * Antwort und ist die falsche: Damit läge auch der WEB-Zweig ungeprüft da,
 * und die Dateien gibt es ja gerade deshalb doppelt.
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

/**
 * Wie hoch Apples Tab-Leiste am unteren Rand WIRKLICH steht — **gemessen, nicht
 * aus der Dokumentation.**
 *
 * 🔴 **Warum es diese Zahl geben muss:** `useTabRand()` gibt hier 0 zurück, und
 * das ist für Inhalt im Fluss richtig. Wer aber absolut über der Leiste liegt,
 * bekommt mit der 0 die Position *hinter* ihr. Genau das ist am 2026-09-19
 * passiert — die „nichts los"-Kapsel klebte in der Tab-Leiste, halb unlesbar,
 * und Ian hat es am Gerät gesehen. **Zwei verschiedene Fragen brauchen zwei
 * Funktionen**, sonst beantwortet die eine irgendwann die andere falsch.
 *
 * ⚠️ **NativeTabs gibt die Höhe nicht her.** Weder `BottomTabBarHeightContext`
 * (der gehört `expo-router/js-tabs`) noch ein eigener Haken — `hooks.d.ts`
 * exportiert allein `usePlacement` für die BottomAccessory. Nachgesehen, nicht
 * vermutet. Also bleibt Messen.
 *
 * 🔴 **`insets.bottom` IST die Antwort — hier stand zuerst `insets.bottom + 66`,
 * und das hat doppelt gezählt.** Der Weg dahin ist die Lehre:
 *
 * Zuerst am Bild gemessen (Beleg `at07`, zeilenweise Helligkeit über die
 * untersten 140 pt): Die Leiste zeichnet von **100 pt** über der Unterkante bis
 * etwa 13 pt. Bei angenommenen 34 pt Sicherheitsabstand schienen das **66 pt**
 * Leiste zu sein — also `insets.bottom + 66`.
 *
 * **Die 34 waren die Annahme, und sie war falsch.** Der Messstreifen in `at11`
 * hat `insets.bottom` direkt ausgelesen: **83**. Das sind 34 pt Home-Indikator
 * plus 49 pt `UITabBar` — *`react-native-screens` trägt Apples Leiste bereits
 * in die Safe Area ein.* Genau das behauptet der Kopfkommentar dieser Datei
 * seit Entscheidung 85; ich habe es gelesen, geglaubt — und trotzdem noch
 * einmal 66 draufgelegt. Ergebnis war ein `mapPadding` von 149 statt 83, und
 * die Karte zoomte entsprechend heraus.
 *
 * ⚠️ **Eine am BILD gemessene Zahl kann richtig sein und trotzdem falsch
 * verwendet** — die 100 pt stimmen, nur waren sie nicht `insets.bottom + X`,
 * sondern `insets.bottom` plus Rundung. Wer eine Zahl aus einem Screenshot
 * ableitet, muss die Größe, gegen die er sie rechnet, AUCH messen.
 */
export function useTabUeberdeckung(): number {
  return useSafeAreaInsets().bottom;
}
