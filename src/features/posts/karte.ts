import { colors } from '@/theme';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS DIE WIEN-KARTE ZEIGT UND WAS EINE FARBE BEDEUTET
 *  Phase 19b · Leopolds Idee, Ians Entscheidungen 28 bis 32 (PLAN.md, Phase 19b)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Leopolds zweite Idee aus dem BENUTZEN (nicht aus dem Anschauen): eine Karte, auf
 * der man sieht, wo gerade etwas los ist. Ians Zusatz: „klein anfangen, nur Wien."
 *
 * ── Warum die Regeln hier stehen und nicht im Screen ──────────────────────────
 * Dieselbe Bauart wie `wisch.ts`, `filter.ts` und `requests/kollision.ts`: Der
 * Screen zeigt Flächen, die BEDEUTUNG einer Farbe steht hier. Wer wissen will, was
 * „dunkel" heißt, soll eine Datei aufmachen und keine 300 Zeilen Oberfläche lesen.
 *
 * ── Was diese Karte NICHT ist ─────────────────────────────────────────────────
 * Keine echte Landkarte mit Stecknadeln. Das war Ians Entscheidung 28, und der
 * Grund ist harte Regel 47: Ein Pin verrät statt „1220" die genaue Parkbank. Die
 * App weiß auch gar nicht mehr — am Post steht seit Phase 2 nur `district`, nie
 * eine Koordinate. **B bleibt offen, bis echte Leute die App benutzen.**
 */

// ── Woher die Flächen kommen ─────────────────────────────────────────────────

/**
 * Die Namensnennung. Sie ist **Bedingung der Lizenz**, nicht Höflichkeit: Die
 * Umrisse in `data/wien-bezirke.ts` stammen von der Stadt Wien und stehen unter
 * CC BY 4.0. Der Satz steht unter der Karte; wer die Karte woanders einbaut, nimmt
 * ihn mit.
 *
 * Bewusst hier und nicht im Screen — aus demselben Grund wie alles andere in dieser
 * Datei: Eine Lizenzzeile, die in einem Screen lebt, verschwindet beim nächsten
 * Umbau, und dann verstößt die App still gegen eine Lizenz.
 */
export const KARTE_QUELLE = 'Bezirksgrenzen: Stadt Wien (data.wien.gv.at), CC BY 4.0';

// ── Wie eingefärbt wird ──────────────────────────────────────────────────────

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Ians Entscheidung 32: RELATIV zum stärksten Bezirk, nicht in festen Stufen.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Die dunkelste Fläche ist immer der Bezirk mit den meisten Posts — auch wenn das
 * heute drei sind. Die Karte beantwortet damit „**wo** ist am meisten los", nicht
 * „ist in Wien viel los".
 *
 * Verworfen, mit Begründung — als Gedächtnis, nicht als Einladung:
 *   'fest'    Feste Schwellen (1–2 hell, 3–5 mittel, ab 6 dunkel). Ehrlicher über
 *             die absolute Menge — und am Anfang wäre ganz Wien blassgrau, weil
 *             nirgends sechs Posts liegen. Eine Karte, die beim Start aussieht wie
 *             ein leeres Blatt, macht niemand ein zweites Mal auf.
 *   'zahlen'  Gar nicht einfärben, nur Zahlen hineinschreiben. Dann ist es eine
 *             Tabelle in Kartenform — und der eine Vorteil einer Karte, dass man
 *             das Muster sieht, ohne zu lesen, ist weg.
 *
 * **Den Haken kennt er:** Die Karte sieht bei drei Posts genauso „voll" aus wie bei
 * dreihundert. Deshalb steht die Zahl in der Fläche (siehe `STUFEN` unten) — sie
 * ist die einzige absolute Angabe auf der ganzen Karte.
 */
export const EINFAERBUNG: 'relativ' | 'fest' | 'zahlen' = 'relativ';

/**
 * Die Farbskala. Fünf Zustände: leer, dann vier Stufen.
 *
 * ── Warum Grau und keine der sechs Kategoriefarben ────────────────────────────
 * Die Karte zeigt Menge, nicht Art. Nähme sie eine Kategoriefarbe, behauptete jede
 * Fläche eine Kategorie, die sie nicht meint — derselbe Fehler, den `accent` in
 * `theme/colors.ts` beim „Posten"-Knopf vermeidet und den harte Regel 29 beim
 * Direktchat noch einmal beschreibt. Die Skala läuft deshalb auf `accent.base` zu,
 * die Grundfarbe der App.
 *
 * ── Alle Werte sind gemessen, nicht geschätzt (WCAG) ──────────────────────────
 * Die Zahl in der Fläche erreicht auf jeder Stufe mindestens **4,89:1**:
 *   Stufe 1 #CFCDC3 · dunkler Text · 11,05:1
 *   Stufe 2 #A6A49C · dunkler Text ·  7,06:1
 *   Stufe 3 #6F7174 · weißer Text  ·  4,89:1
 *   Stufe 4 #3E4043 · weißer Text  · 10,40:1
 *
 * ── Warum ausgerechnet der wichtigste Sprung der schwächste ist ───────────────
 * Zwischen „leer" und „ein Post" liegen nur **1,41:1** — und das ist genau die
 * Grenze, auf die es ankommt. Sie über die Farbe zu tragen ginge nur mit einem
 * harten Bruch, und der ließe die Karte fleckig aussehen. **Getragen wird sie
 * deshalb von der ZAHL: Eine leere Fläche bekommt gar keine.** Das ist zugleich die
 * Antwort auf Punkt 2 aus PLAN.md, Phase 19b — wer Farben schlecht unterscheidet,
 * bekommt sonst gar nichts.
 */
export const KARTE_LEER = '#F3F1EC';

export const STUFEN: readonly { flaeche: string; zahl: string }[] = [
  { flaeche: '#CFCDC3', zahl: colors.ink },
  { flaeche: '#A6A49C', zahl: colors.ink },
  { flaeche: '#6F7174', zahl: colors.surface },
  { flaeche: '#3E4043', zahl: colors.surface },
];

/**
 * Welche Stufe bekommt ein Bezirk mit `anzahl` Posts, wenn der stärkste `hoechst`
 * hat? `-1` heißt „leer" — dann wird `KARTE_LEER` gezeichnet und keine Zahl.
 *
 * ── Warum aufgerundet wird ────────────────────────────────────────────────────
 * Bei `hoechst = 5` und vier Stufen ist ein einzelner Post rechnerisch Stufe 0,8.
 * Abgerundet wäre er Stufe 0 — dieselbe Farbe wie zwei Posts, und der Unterschied
 * zwischen „hier war jemand" und „hier ist was los" verschwindet ausgerechnet am
 * unteren Ende, wo die App die längste Zeit ihres Lebens steht. Aufgerundet
 * bekommt jeder Bezirk mit mindestens einem Post mindestens Stufe 1.
 */
export function stufeFuer(anzahl: number, hoechst: number): number {
  if (anzahl <= 0) return -1;
  if (hoechst <= 0) return -1;
  const anteil = anzahl / hoechst;
  return Math.min(STUFEN.length - 1, Math.ceil(anteil * STUFEN.length) - 1);
}

// ── Schieben und Zoomen ──────────────────────────────────────────────────────

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Ians Entscheidung 33, 2026-09-06: Die Karte lässt sich SCHIEBEN und ZOOMEN.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Die Frage kam beim Bauen auf und ist eine Messung, keine Meinung: Bei einer Karte,
 * die einen 360-px-Schirm füllt, ist die **Josefstadt 14 × 11 Bildpunkte** groß.
 * Apple verlangt 44 × 44. Neun der 23 Bezirke liegen unter 30 px, und ausgerechnet
 * dort liegen die meisten Posts (1070 fünfmal, dazu 1050, 1030, 1010, 1060, 1040).
 *
 * **Kein Trick beim Treffer-Test repariert das.** Nachgemessen wurde auch der
 * naheliegendste: „der Bezirk mit dem nächsten Beschriftungspunkt gewinnt" ergibt
 * für Neubau, Josefstadt und Mariahilf eine Fläche von **11 × 11 px** — schlechter
 * als nichts zu tun. Die Bezirke selbst liegen nur 11 bis 20 px auseinander; was zu
 * klein ist, ist das BILD und nicht die Logik.
 *
 * Verworfen, mit Begründung:
 *   'lupe'    Ein zweites, größeres Kärtchen nur für die Bezirke 1 bis 9 (so machen
 *             es Papierkarten). Braucht KEINE Geste und wäre damit das Sicherste —
 *             **das war meine Empfehlung, Ian hat anders entschieden.** Sein
 *             Argument ist das bessere: Von einer Karte erwartet man heute, dass man
 *             hineinzoomt; zwei Karten übereinander muss man erst verstehen.
 *   'liste'   Karte nur zum Anschauen, ausgewählt wird über eine Reihe darunter.
 *             Am wenigsten Arbeit — und praktisch das, was Ian beim Filter schon
 *             verworfen hat („dann ist es ein Filter-Werkzeug, nicht auf die Karte
 *             gehen").
 *
 * **Den Haken kennt er, und er ist der teuerste des Projekts:** Das ist der dritte
 * Gesten-Erkenner in derselben App, und Wischstapel wie Jahrgangs-Balken sind auf
 * einem echten iPhone noch UNGEPRÜFT (Phase 19.5). Was hier schiefgeht, geht unter
 * einem Finger schief und nicht am Mac — genau die Lehre aus Phase 18b.
 */
export const KARTE_GESTE: 'zoom' | 'lupe' | 'liste' = 'zoom';

/** Wie weit man hineinzoomen darf. Bei 4× ist die Josefstadt 56 × 44 px — also über
 *  Apples Mindestmaß, und das ist der Zweck der ganzen Geste. */
export const ZOOM_MAX = 4;

/** Weiter als „ganz Wien" darf niemand herausziehen: Eine Karte, die kleiner ist als
 *  ihr Platz, schwimmt in einer leeren Fläche und sieht kaputt aus. */
export const ZOOM_MIN = 1;

/**
 * Wie weit ein Finger wandern darf, damit es noch ein Tipp ist und kein Schieben.
 *
 * Dieselbe Frage wie in `WischKarte` (harte Regel 15) und dieselbe Antwort: Der
 * Erkenner merkt sich, ob sich in der ganzen Berührung etwas bewegt hat. Ein
 * Browser schickt nach jedem Ziehen zusätzlich ein `click` — ohne diese Grenze
 * schiebt man die Karte und wählt dabei den Bezirk aus, auf dem man losgelassen hat.
 */
export const TIPP_WEG_MAX = 6;

// ── Posts ohne Bezirk ────────────────────────────────────────────────────────

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Ians Entscheidung 31: Posts ohne Bezirk stehen als Zeile UNTER der Karte.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Seit dem 2026-09-02 darf ein Post keinen Bezirk haben (`district: null`,
 * `BEZIRK_FREIWILLIG`). Auf einer Karte haben solche Posts keinen Ort — und eine
 * Ansicht, die still Posts verschluckt, ist genau die Sorte Fehler wie die zwei
 * Leer-Zustände vom 2026-09-03.
 *
 * Verworfen: weglassen (siehe oben) und überall mitfärben (behauptet Aktivität an
 * 23 Orten, die es nicht gibt).
 */
export function ohneBezirkText(anzahl: number): string {
  return anzahl === 1 ? '1 Post ohne Bezirk' : `${anzahl} Posts ohne Bezirk`;
}

/** „5 Posts" bzw. „1 Post" — die Zeile über der Liste, wenn ein Bezirk gewählt ist. */
export function bezirkPostText(anzahl: number): string {
  return anzahl === 1 ? '1 Post' : `${anzahl} Posts`;
}
