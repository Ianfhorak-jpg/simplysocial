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
    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.10)', // dito
  },
}).ersatz;

/**
 * Welches Farbschema das Glas annimmt — **`dark`, nicht `auto`.**
 *
 * `auto` folgt dem GERÄT. Die App steht aber fest auf DUNKEL
 * (`userInterfaceStyle: "dark"` in `app.json`, Ians Entscheidung 84): Auf einem
 * iPhone im Hellmodus läge sonst helles Glas über einer dunklen App. Das ist
 * keine Kleinigkeit — der Umschalter darin schreibt mit `colors.inkSoft`, und
 * der ist jetzt für dunklen Grund gemessen (5,78 gegen `bg`).
 *
 * Das Argument ist dasselbe wie am 2026-09-07, als hier `light` stand; nur die
 * App darunter hat die Seite gewechselt. **Die Regel lautet nicht „hell" oder
 * „dunkel", sondern: das Glas folgt der APP, nie dem Gerät.**
 */
export const GLAS_FARBSCHEMA = 'dark' as const;

/**
 * Wie dick das Glas ist. `regular` ist Apples Voreinstellung und die einzige, die
 * über einer Karte noch etwas durchlässt, ohne dass Text darauf unlesbar wird;
 * `clear` ist fast durchsichtig und gehört über Fotos, nicht über eine Liste.
 *
 * ⚠️ **Offen, und absichtlich noch nicht geändert (2026-09-14).** Der Plan nennt
 * `regular` einen Formfehler und schlägt `clear` vor. Das kann stimmen — die
 * Begründung oben („Text darauf unlesbar") ist am HELLEN Stand gemessen, und auf
 * dunklem Grund sind die Verhältnisse andere.
 *
 * **Es bleibt trotzdem stehen, bis es gemessen ist.** Der Dunkelmodus und die
 * Glasdicke gleichzeitig zu ändern macht jede Verbesserung unzuordenbar — das
 * ist dieselbe Begründung, mit der der Plan „dunkel vor NativeTabs" anordnet.
 * Erst die Abhebung am dunklen Stand messen, dann diesen einen Wert drehen und
 * dieselbe Stelle noch einmal messen.
 */
export const GLAS_STIL = 'regular' as const;

/**
 * Was auf Glas als AUSGEWÄHLT gilt — und warum es keine Farbe aus `colors.ts` ist.
 *
 * 🔴 **Der Befund vom 2026-09-20, an Ians Bildschirmaufnahme gemessen.** Sein Urteil
 * war *„Liquid Glass ist bis jetzt immer noch nur unten"*. Der Vergleich zweier
 * Ausschnitte aus DEMSELBEN Bild zeigte etwas anderes als erwartet: **Das Glas oben
 * arbeitet** — die Wien-Karte schimmert grün hindurch. Was das Bild beherrschte,
 * waren zwei völlig DECKENDE Flächen darin: die aktive Pille des Umschalters
 * (`colors.ink`, Reinweiß) und der Posten-Knopf (`accent.base`). Zusammen mehr als
 * die halbe Kapselbreite.
 *
 * Apples eigene Tab-Leiste darunter macht es anders: Ihre aktive Kapsel ist nur eine
 * Spur heller als das Glas, und der Hintergrund bricht sichtbar durch sie hindurch.
 * **Genau das ist der Unterschied, den Ian sieht.**
 *
 * ── Warum ein Literal und nicht `colors.*` ──────────────────────────────────
 * Weil es keine FARBE ist, sondern eine Aufhellung. Jede Farbe in `colors.ts` hat in
 * diesem Projekt eine Bedeutung und einen gemessenen Kontrast gegen einen bekannten
 * Grund. Diese Fläche hat keinen bekannten Grund — hinter ihr liegt, was gerade auf
 * dem Schirm ist. Sie sagt nicht „weiß", sie sagt „heller als das hier".
 *
 * ⚠️ **Der Kontrast der Schrift darauf ist deshalb NICHT gemessen und kann es nicht
 * sein.** Tragbar ist das nur, weil darauf ausschließlich weiße Zeichen mit eigener
 * Kante stehen — dieselbe Wette, die Apple in der Leiste darunter eingeht.
 */
export const GLAS_AUSWAHL = 'rgba(255, 255, 255, 0.22)';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🔴 IANS ENTSCHEIDUNG 99 (2026-09-20): KEIN LIQUID GLASS MEHR — MATT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sein Satz: *„wenn es nicht geht mit dem Liquid Glass, dann ist auch nicht schlimm
 * … dann probier es halt so zu machen, dass es halt nicht so wie Liquid Glass
 * aussieht, sondern einfach so matt halt, so wie die anderen Knöpfe."*
 *
 * ── Was vorausging, damit das niemand für Aufgeben hält ─────────────────────
 * Das Material war NIE nachgebaut: `SsGlas` ruft `expo-glass-effect` → `GlassView`
 * → Apples `UIGlassEffect` auf. An Ians Bildschirmaufnahme vom 2026-09-20 wurde
 * auch belegt, dass es arbeitet — die Wien-Karte schimmert durch die Kopfkapsel.
 *
 * **Was fehlt, ist Apples LEISTE, nicht Apples Material.** Die Tab-Leiste unten
 * sieht richtig aus, weil sie eine echte `UITabBar` ist. Für oben wäre die
 * Entsprechung die `UINavigationBar` — und die kann React Native heute nicht mit
 * Liquid Glass zeichnen. Aus der offenen Diskussion bei `react-native-screens`
 * (#4021): *„there's no way to make the Stack header adopt the system Liquid Glass
 * material"*; von drei nötigen Apple-Methoden wird `configureWithDefaultBackground`
 * gar nicht erst aufgerufen. Das ist eine Lücke in der Bibliothek, nichts, was in
 * diesem Projekt zu beheben wäre.
 *
 * Ein freistehendes `GlassView` daneben ist deshalb immer eine ANDERE Fläche als
 * die Leiste darunter — und zwei fast gleiche Materialien nebeneinander sehen
 * schlechter aus als zwei klar verschiedene.
 *
 * ── Was dieser Schalter tut ─────────────────────────────────────────────────
 * `false` zwingt die iOS-Fassung auf denselben Weg, den Browser und iOS 25 schon
 * immer gehen: `glasErsatz` plus `glasSchwebt` — eine matte Fläche mit Kante und
 * Schatten, also genau „wie die anderen Knöpfe".
 *
 * ⚠️ **Die Tab-Leiste unten ist davon NICHT betroffen.** Sie geht nicht durch
 * `SsGlas`, sondern ist Apples eigene Leiste (NativeTabs, Entscheidung 85). Sie
 * bleibt echtes Glas, und das ist der Punkt: Was Apple selbst zeichnet, bleibt;
 * was wir danebenstellen, gibt vor, nichts anderes zu sein als eine Fläche.
 *
 * **Auf `true` zurückzudrehen ist eine Zeile** — sobald `react-native-screens` die
 * Navigationsleiste kann, ist das die erste Stelle, die wieder zur Debatte steht.
 */
export const GLAS_AN = false;

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
