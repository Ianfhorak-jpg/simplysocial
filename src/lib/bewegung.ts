import { Easing } from 'react-native';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DAS TEMPO — wie lange die App für eine Bewegung braucht (Phase 20.13)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Ians Auftrag am 2026-09-20: *„Apple hat das natürlich auch, dass wenn man auf einen
 * Button klickt, dass die Änderungen nicht instant kommen, sondern so eine kurze kleine
 * minimalistische Animation. Das macht einen Riesenunterschied … Ich will, dass du die
 * App einfach smoother machst."*
 *
 * Beim Nachsehen war der Befund schärfer als erwartet: **`DRUCK` in `theme/druck.ts`
 * war gar keine Animation.** Ein statischer Style, angewandt über `pressed && DRUCK` —
 * der Knopf sprang auf 96 % und hart zurück. Genau das „instant", das Ian meint.
 *
 * ── Was diese Datei ist, und was sie NICHT ist ───────────────────────────────
 * Hier steht das **Tempo** der App, nicht ihr Gefühl. Die zwei Zahlen 0,96 und 0,82
 * gehören weiter `theme/druck.ts` und gehören weiter Ian (harte Regel 113). Neu ist
 * allein der WEG dorthin: nicht mehr ein Sprung, sondern eine Dauer und eine Kurve.
 *
 * Dieselbe Bauart und derselbe Grund wie `lib/haptik.ts` (harte Regel 115): Die
 * Einträge heißen nach dem **ANLASS** (`druckHinein`, `druckHeraus`), nie nach der
 * Stärke (`timing90`). Stünde im Screen `duration: 90`, wäre die Entscheidung „wie
 * schnell reagiert ein Knopf" dort gefallen — und beim nächsten Knopf noch einmal,
 * vielleicht anders. So gibt es sie einmal.
 *
 * ── Warum Timing und nicht Spring ────────────────────────────────────────────
 * Eine Feder schwingt über: Beim Loslassen ginge die Skalierung kurz auf etwa 1,02.
 * Das wäre **eine dritte Zahl, die niemand gewählt hat**, und sie widerspricht der
 * Vorgabe — 0,96 ist der Boden, 1,0 die Ruhe, dazwischen ist alles. Dazu kommt, dass
 * sich „schnell hinein, langsam heraus" mit `speed`/`bounciness` gar nicht asymmetrisch
 * ausdrücken lässt; eine Feder ist in beide Richtungen dieselbe Feder.
 *
 * ── Warum die zwei Richtungen VERSCHIEDEN lang sind ──────────────────────────
 * Hinein und heraus sind nicht dieselbe Bewegung, obwohl sie denselben Weg gehen.
 *
 * **90 ms hinein:** Unterhalb von etwa 100 ms liest der Mensch die Reaktion noch als
 * Teil der eigenen Berührung — der Knopf gibt nach, weil man drückt. Darüber wirkt es,
 * als überlege er erst.
 *
 * **240 ms heraus:** Der Rückweg ist nicht mehr Ians Bewegung, sondern die App, die
 * loslässt. Er darf Zeit haben. `Easing.out(Easing.cubic)` ist **dieselbe Kurve, mit
 * der die `AntwortLeiste` hereinfährt** (`AntwortLeiste.tsx:55-58`) — damit bekommt die
 * App *eine* Sprache fürs Zur-Ruhe-Kommen statt zweier, die sich ähnlich sehen.
 *
 * ── Wo bewusst NICHT animiert wird ───────────────────────────────────────────
 * Regel 115 gilt hier wörtlich mit: *„Wo alles vibriert, bedeutet es nichts."* Dasselbe
 * für Bewegung. Nicht animiert werden deshalb (Ians Entscheidung 97):
 *
 *   • **Listen.** Beim Scrollen kann es ruckeln, und im Feed streitet es sich mit dem
 *     `PanResponder` des Wischstapels um dieselbe Eigenschaft.
 *   • **Die Karte im Wischstapel** (harte Regel 15). Dort beschreibt der `PanResponder`
 *     denselben `transform`; zwei Quellen auf einer Eigenschaft schreiben abwechselnd.
 *   • **Glasflächen mit Deckkraft** (harte Regel 61). Eltern-Opazität gilt für den
 *     ganzen Teilbaum und schaltet das Liquid Glass darunter ab.
 *
 * ── Kein `.native`-Zweig, anders als bei `haptik` ────────────────────────────
 * `Animated` und `Easing` verhalten sich im Browser gleich; es gibt nichts zu
 * unterscheiden. Der einzige Unterschied ist `useNativeDriver`, und der ist eine Zeile
 * dort, wo tatsächlich animiert wird — nicht hier.
 *
 * ── Warum ein blankes Objekt und kein `StyleSheet.create` ───────────────────
 * Dieselbe Falle, die `ecke` in `theme/spacing.ts` beschreibt: Ein registrierter
 * Eintrag ist je nach Fassung nur eine Kennung und kein Objekt. Er kann keine
 * `Animated`-Knoten tragen und täte still **nichts** — kein Fehler, keine Bewegung.
 */
export const bewegung = {
  /** Ein Knopf gibt unter dem Finger nach. Teil der Berührung, deshalb kurz. */
  druckHinein: { duration: 90, easing: Easing.out(Easing.quad) },
  /** Der Finger ist weg, die App lässt los. Darf Zeit haben. */
  druckHeraus: { duration: 240, easing: Easing.out(Easing.cubic) },
  /**
   * Etwas klappt auf und schiebt dabei weg, was darunter steht — der Regler, der
   * Jahrgangs-Balken. Länger als ein Knopfdruck, weil hier nicht eine Fläche
   * nachgibt, sondern sich der halbe Bildschirm neu ordnet: Wer das zu schnell
   * macht, zeigt einen Sprung mit Unschärfe statt einer Bewegung.
   */
  klappeAuf: { duration: 260, easing: Easing.out(Easing.cubic) },
  /**
   * Und wieder zu. **Kürzer als das Aufklappen, und das ist Absicht:** Beim Öffnen
   * muss das Auge dem Neuen folgen können. Beim Schließen ist die Entscheidung
   * schon gefallen — da wartet man nur noch.
   */
  klappeZu: { duration: 190, easing: Easing.in(Easing.cubic) },
  /**
   * Etwas GLEITET von einer Stelle zur anderen, ohne zu erscheinen oder zu
   * verschwinden — die Pille im Umschalter Stapel/Karte.
   *
   * `inOut` statt `out`, und das ist der Unterschied zu allem anderen hier: Eine
   * Fläche, die schon da ist und nur umzieht, hat keinen Anfang, den jemand
   * ausgelöst hat — sie fährt an und wieder ab. Ein `out` sähe aus, als würde sie
   * geworfen.
   *
   * ⚠️ **420 ist Ians Zahl, nicht meine, und sie ist in ZWEI Durchgängen
   * entstanden** (2026-09-20). Mein Vorschlag waren 240. Sein erstes Urteil am
   * Gerät: *„das muss mäßig so schnell sein wie die Leiste, die dann so runterkommt
   * … ein bisschen länger noch"* → 320. Sein zweites: *„die ist mir noch zu schnell,
   * kannst du das noch langsamer machen?"* → 420.
   *
   * **Sie ist damit die langsamste Bewegung der App** und deutlich langsamer als die
   * Klappe, an der sie sich ursprünglich orientieren sollte. Das ist kein Versehen:
   * Die Klappe schiebt Inhalt weg, da drängt das Auge weiterzukommen. Hier zieht
   * eine Fläche um, und das darf man ansehen.
   *
   * Wer hier dreht, dreht an einem Wert, der zweimal am GERÄT beurteilt wurde, nie
   * am Mac.
   */
  gleiten: { duration: 420, easing: Easing.inOut(Easing.cubic) },
} as const;

/**
 * Eine Spur, die man fahren kann — Dauer plus Kurve, wie `Animated.timing` sie nimmt.
 *
 * Abgeleitet statt von Hand geschrieben: Käme ein dritter Anlass dazu, wäre er ohne
 * Zutun mitgemeint. Der Umweg über `keyof` ist nötig, weil `as const` die Dauern als
 * LITERALE einfriert — `typeof bewegung.druckHinein` beschreibt sonst den Hinweg
 * allein, und der Rückweg mit seinen 240 ms passt nicht hinein.
 */
export type Spur = (typeof bewegung)[keyof typeof bewegung];
