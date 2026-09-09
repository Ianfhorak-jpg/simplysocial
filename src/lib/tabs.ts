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
 * Wie hoch die Kapsel ist. Fest und nicht gemessen: Sie enthält nur Symbole, und
 * die haben eine feste Größe — anders als der Blattkopf, der einen Text mit
 * unbekannter Länge trägt (harte Regel 60).
 *
 * **Der Wert bleibt bei 56, obwohl seit Phase 19h die Beschriftung fehlt.** Das ist
 * Absicht: Ians Entscheidung 62 nimmt die WÖRTER weg, nicht die Form — die Kapsel
 * ist dieselbe wie auf seinem Vorbild, und eine flachere Leiste wäre eine zweite,
 * ungefragte Änderung. Der frei gewordene Platz geht ans Symbol (`TAB_SYMBOL` in
 * `(tabs)/_layout.tsx`, 22 → 26).
 */
export const TAB_KAPSEL_HOEHE = 56;

/**
 * Seitlicher Abstand — dasselbe Maß wie der Seitenrand jedes Screens.
 *
 * ⚠️ **Er muss als `start`/`end` gesetzt werden, nicht als `left`/`right`** — siehe
 * `TAB_KAPSEL_SEITE_KANTEN` gleich darunter. Das war von Phase 19e-2 bis 19i der
 * Grund, warum die Kapsel auf iOS an beiden Rändern klebte.
 */
export const TAB_KAPSEL_SEITE = spacing.lg;

/**
 * Der seitliche Abstand als Style — **und der Name der Eigenschaften ist hier die
 * ganze Nachricht** (Phase 19i, 2026-09-09).
 *
 * ── Der Fehler, den das behebt ────────────────────────────────────────────────
 * Die Tab-Leiste bringt in `BottomTabBar.js` einen eigenen Style mit:
 *
 *     bottom: { start: 0, end: 0, bottom: 0, elevation: 8 }
 *
 * Bis Phase 19i stand hier `left: 16, right: 16`. Im Style-Array kam das SPÄTER,
 * also schien es zu gewinnen — **aber `start`/`end` und `left`/`right` sind in
 * Yoga zwei verschiedene Eigenschaften, und die richtungsabhängige gewinnt gegen
 * die absolute, unabhängig von der Reihenfolge.** Auf iOS lag die Kapsel damit an
 * `start: 0` / `end: 0`: über die volle Bildschirmbreite, an beiden Rändern
 * klebend.
 *
 * ── Warum es vier Wochen niemand gesehen hat ──────────────────────────────────
 * **Auf Web stimmte es.** `react-native-web` macht aus `start`/`end` und
 * `left`/`right` dieselben CSS-Eigenschaften, dort gewinnt die spätere Angabe —
 * und der Beleg `z01-web-kapsel-360.png` zeigte brav „x = 16, 328 breit". Geprüft
 * wurde also genau die Plattform, auf der der Fehler nicht auftritt.
 *
 * ── Warum das mehr ist als ein Schönheitsfehler ───────────────────────────────
 * Harte Regel 62 sagt wörtlich: *Glas braucht RAND, nicht nur Hintergrund. Eine
 * Fläche, die an drei Kanten am Schirm klebt, sieht aus wie eine getönte Leiste;
 * erst wenn Inhalt daneben UND darunter durchläuft, sieht man, dass sie bricht.*
 * Genau diese Bedingung war auf dem einzigen Gerät, das echtes Glas zeichnet, nie
 * erfüllt. **Ians Urteil „das ist immer noch kein richtiges Liquid Glass"
 * (Entscheidung 68) hat hier eine seiner Ursachen** — zum dritten Mal lag es an
 * der Form und nicht am Effekt.
 *
 * Gemessen auf seinem iPhone (`IMG_0713.PNG`, 393 × 852 pt) und am Simulator
 * (402 × 874): Kapselbreite = Bildschirmbreite, Seitenrand **0** statt 16.
 */
export const TAB_KAPSEL_SEITE_KANTEN = {
  start: TAB_KAPSEL_SEITE,
  end: TAB_KAPSEL_SEITE,
} as const;

/** Höhe des Symbol-Rahmens in `BottomTabItem.js` (`ICON_SIZE_TALL`). */
export const TAB_SYMBOL_RAHMEN = 28;
/** Innenabstand eines Tab-Eintrags in `BottomTabItem.js` (`tabVerticalUiKit`). */
export const TAB_EINTRAG_POLSTER = 5;

/**
 * Wie weit das Tab-Symbol nach unten geschoben wird, damit es in der Kapsel
 * **mittig** sitzt — Ians Entscheidung 67 (Phase 19i).
 *
 * ── Der Fehler, den das behebt ────────────────────────────────────────────────
 * Seit Phase 19h trägt die Kapsel keine Wörter mehr (`tabBarShowLabel: false`).
 * Der PLATZ für das Wort wird aber weiter gerechnet: Ein Tab-Eintrag ist in
 * `BottomTabItem.js` eine Spalte mit `justifyContent: 'flex-start'` und
 * `padding: 5` — Symbol oben, Beschriftung darunter. Fällt die Beschriftung weg,
 * bleibt das Symbol oben kleben und der leere Platz steht darunter.
 *
 * ── Die Zahl ist gerechnet UND gemessen, und beides stimmt überein ────────────
 * In einer 56 pt hohen Kapsel sitzt die Symbolmitte bei
 *
 *     5 + 28/2 = 19        statt bei        56/2 = 28
 *
 * also **9 pt zu hoch** — und genau 9,0 pt sind auf Ians Screenshot nachgemessen
 * (`IMG_0713.PNG`: Symbolmitte y = 2372,5 px, Kapselmitte y = 2399,5 px, bei 3×).
 * Dass Rechnung und Messung sich decken, ist der Grund, warum hier eine Formel
 * stehen darf und nicht bloß eine Zahl.
 *
 * ── Warum ein Versatz und nicht `justifyContent: 'center'` ────────────────────
 * Weil man an die Stelle nicht herankommt: `tabBarItemStyle` landet auf dem
 * ÄUSSEREN View, das `justifyContent: 'flex-start'` sitzt auf dem Knopf darin,
 * und der bekommt sein `flex: 1` von der Leiste selbst. Ein `height`/`flex` am
 * Symbol-Rahmen (`tabBarIconStyle`) wäre der andere naheliegende Weg und ist
 * falsch: **Die Zahl am Anfragen-Tab hängt mit `top: -3` an genau diesem Rahmen**
 * und wäre nach oben aus der Kapsel gewandert. Ein `marginTop` verschiebt Symbol
 * und Zahl gemeinsam — das ist der einzige Griff, der beide zusammenhält.
 */
export const TAB_SYMBOL_VERSATZ =
  (TAB_KAPSEL_HOEHE - 2 * TAB_EINTRAG_POLSTER - TAB_SYMBOL_RAHMEN) / 2;

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
