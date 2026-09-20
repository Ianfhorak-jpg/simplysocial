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
 * CC BY 4.0.
 *
 * 🔴 **Seit dem 2026-09-20 steht sie in Einstellungen → Rechtliches, nicht mehr
 * auf der Karte** — Ians Entscheidung. Auf der Karte überschnitt sie sich mit
 * Apples eigener Nennung, die MapKit selbst zeichnet und deren Lage uns nicht
 * gehört. CC BY 4.0 verlangt die Nennung „in angemessener Weise, dem Medium
 * entsprechend"; eine Rechtliches-Seite ist dafür in einer App der übliche Ort.
 *
 * ⚠️ **Der Text bleibt trotzdem HIER und nicht im Screen** — und das ist jetzt
 * wichtiger als vorher, nicht weniger: Eine Lizenzzeile, die in einem Screen
 * lebt, verschwindet beim nächsten Umbau, und dann verstößt die App still gegen
 * eine Lizenz. Der Screen holt sich die Konstante; **dass er sie überhaupt noch
 * anzeigt, bewacht `npm run pruef-nennung`.** Solange sie auf der Karte stand,
 * trug die Karte selbst diese Sicherung — dieser Wächter ist ihr Ersatz.
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
 * dreihundert. Dagegen stand bis zum 2026-09-20 die Zahl in der Fläche — sie war
 * die einzige absolute Angabe auf der ganzen Karte. 🔴 **Sie ist seit Ians
 * Entscheidung 101 weg** (`ZAHLEN_AN` gleich unten); der Haken bleibt also
 * unbeantwortet, und das ist bewusst so entschieden, nicht übersehen.
 */
export const EINFAERBUNG: 'relativ' | 'fest' | 'zahlen' = 'relativ';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🔴 IANS ENTSCHEIDUNG 101 (2026-09-20): KEINE ZAHLEN AUF DER KARTE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Seine Worte: *„vielleicht, dass man gar keine zwei oder so sieht — also dass man
 * nicht mehr sieht, wie viele Anfragen da sind."* Vorgelegt wurden drei Wege
 * (Zahlen weg und die Farbe trägt es · Zahlen weg und leere Bezirke gar nicht
 * antippbar · Zahlen bleiben); **er hat den ersten gewählt.**
 *
 * ── Warum das hier steht und nicht in einem Zeichner ────────────────────────
 * Es gibt zwei Kartenzeichner und GENAU EINE Bedeutung (harte Regel 52). Stünde
 * der Schalter bei einem von ihnen, wäre dieser der heimliche Maßstab, und Web
 * und iOS liefen beim nächsten Handgriff auseinander. Dieselbe Bauart wie
 * `GLAS_AN` in `glas-typen.ts` — **auf `true` zurückzudrehen ist eine Zeile.**
 *
 * ── ⚠️ Was die Zahlen mitgetragen haben, und was jetzt offen ist ────────────
 * Sie waren nicht nur Auskunft, sie waren ein BARRIEREFREIHEITS-Argument. Der
 * Abstand zwischen „leer" und „ein Post" ist mit **1,62:1** der schwächste
 * Sprung der ganzen Skala (gemessen, siehe `STUFEN` unten) — und ausgerechnet
 * der wichtigste. Getragen wurde er von der Zahl: *eine leere Fläche bekommt gar
 * keine.* **Diesen Träger gibt es nicht mehr.**
 *
 * Verschärft wird es durch Ians Entscheidung 102: Ein Tipp geht jetzt DIREKT in
 * den Stapel. Wer einen leeren Bezirk erwischt, landet ohne Zwischenschritt bei
 * „Hier ist alles durch".
 *
 * 🔴 **Das ist Ian vorgelegt und wartet auf sein Urteil** — die Behebung wäre
 * EINE Zahl: Stufe 1 war nur deshalb so nah an `KARTE_LEER`, weil eine weiße
 * Zahl darauf lesbar sein musste (8,63:1). Ohne Zahl ist diese Fessel weg, die
 * Stufe darf also weiter weg von „leer" rücken. Die Skala ist heute
 * 1,62 · 1,91 · 1,95 · 2,12; gleichmäßig wären es 1,89 je Schritt.
 * **Nicht in einem Zug mit den Zahlen geändert**, sonst ist nachher nicht mehr
 * zuzuordnen, welche der beiden Änderungen gewirkt hat — dieselbe Begründung,
 * mit der `GLAS_STIL` unverändert stehen blieb.
 */
export const ZAHLEN_AN = false;

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
 * ── Seit dem Dunkelmodus läuft sie in die andere Richtung (2026-09-14) ───────
 * Die Regel ist unverändert — *die Skala läuft auf `accent.base` zu* —, und genau
 * deshalb dreht sie sich mit: `accent.base` war `#3E4043` (dunkler Knopf auf
 * heller Seite) und ist jetzt `#E8E7E3`. **Ein Bezirk mit vielen Posts ist also
 * nicht mehr der dunkelste, sondern der hellste.** Das ist keine neue
 * Entscheidung, sondern dieselbe: „voll" heißt *am weitesten von der
 * Grundfläche entfernt*.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  🔴 IANS ENTSCHEIDUNG 104 (2026-09-20): DIE SKALA WIRD GLEICHMÄSSIG
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Was vorher hier stand, und warum es nicht mehr gilt ────────────────────
 * *„Zwischen ‚leer' und ‚ein Post' liegen nur 1,62:1 — und das ist genau die
 * Grenze, auf die es ankommt. Getragen wird sie deshalb von der ZAHL: Eine leere
 * Fläche bekommt gar keine."* Das war richtig, solange es Zahlen gab.
 * **Entscheidung 101 hat sie weggenommen, und damit stand die wichtigste
 * Unterscheidung der Karte ohne Träger da** — verschärft durch Entscheidung 102,
 * seit der ein Tipp auf einen leeren Bezirk direkt bei „Hier ist alles durch"
 * landet. Vorgelegt, gemessen, und Ian hat „gleich stärker machen" gewählt.
 *
 * ── Warum die Farbe das jetzt DARF ────────────────────────────────────────
 * Stufe 1 lag nur deshalb so dicht an `KARTE_LEER`, weil eine weiße Zahl darauf
 * lesbar bleiben musste. **Ohne Zahl ist diese Fessel weg.**
 *
 * ── Was geändert wurde: vier Zahlen, keine Farbe ───────────────────────────
 * Die Skala ist keine Sammlung ausgesuchter Grautöne, sondern eine GERADE im
 * sRGB-Raum von `KARTE_LEER` nach `accent.base`, abgetastet bei vier Werten.
 * Nachgerechnet am 2026-09-20: Die alten Hex-Werte liegen auf dieser Geraden bei
 * t = 0,171 · 0,382 · 0,638 · 1,0, auf das Byte genau. **Verschoben wurden nur
 * die Abtastpunkte** — die Regel *„die Skala läuft auf `accent.base` zu"* und die
 * Tonwanderung von bläulich-dunkel nach warm-hell sind unberührt.
 *
 *     alt  0,171 · 0,382 · 0,638 · 1,0   Sprünge 1,62 · 1,91 · 1,95 · 2,12
 *     neu  0,219 · 0,426 · 0,686 · 1,0   Sprünge 1,89 · 1,84 · 1,93 · 1,90
 *
 * Die Spannweite fällt von 0,50 auf 0,10 — **fünfmal gleichmäßiger**, und der
 * wichtigste Sprung wächst von 1,62 auf 1,89.
 *
 * ── Warum Stufe 2 nicht exakt auf der Gleichverteilung sitzt ───────────────
 * Rechnerisch gleichmäßig wäre t = 0,435 (`#777878`). Dort fällt heller Text auf
 * **4,43:1** und damit unter WCAG AA. Das ist heute folgenlos — es gibt keine
 * Zahlen —, aber `ZAHLEN_AN` ist ausdrücklich mit EINER Zeile umlegbar, und eine
 * Skala, die beim Zurückdrehen still unter AA fällt, ist eine Falle für später.
 * t = 0,426 hält 4,54:1 und kostet an Gleichmäßigkeit 0,05 Spannweite.
 *
 * ── Alle Werte sind gemessen, nicht geschätzt (WCAG) ──────────────────────────
 * ⚠️ **Die Zahlen, die hier bis zum 2026-09-20 standen (8,63 und 4,53), waren
 * veraltet.** Sie stammten von vor Ians Entscheidung 92, die `colors.ink` auf
 * Reinweiß gezogen hat; Stufe 3 und 4 stimmten weiter, weil sie `DUNKLE_ZAHL`
 * benutzen. Gemessen mit `ink = #FFFFFF`, für den Fall, dass `ZAHLEN_AN` wieder
 * `true` wird:
 *
 *   Stufe 1 #4D4E4F · heller Text ·  8,34:1   (alt #434446 ·  9,75)
 *   Stufe 2 #767677 · heller Text ·  4,54:1   (alt #6D6E6E ·  5,11)
 *   Stufe 3 #AAA9A8 · dunkler Text ·  7,51:1  (alt #A0A09F ·  6,73)
 *   Stufe 4 #E8E7E3 · dunkler Text · 14,23:1  (unverändert)
 *
 * Nachrechnen: `python3 scripts/skala-messen.py`.
 */
/**
 * Die Zahl auf den beiden HELLEN Stufen. Sie ist nicht `colors.bg`: Der Grund ist
 * `#14161A` und käme auf der hellsten Fläche zwar auf 15,9, aber eine Zahl soll
 * lesbar sein und nicht ein Loch in die Fläche stanzen. `#17191C` ist der Textton
 * der hellen App — er hat genau diese Aufgabe schon einmal gehabt.
 */
const DUNKLE_ZAHL = '#17191C';

export const KARTE_LEER = '#212326'; // knapp über bg — 1,15:1, die leere Fläche soll nicht auffallen

export const STUFEN: readonly { flaeche: string; zahl: string }[] = [
  { flaeche: '#4D4E4F', zahl: colors.ink },
  { flaeche: '#767677', zahl: colors.ink },
  { flaeche: '#AAA9A8', zahl: DUNKLE_ZAHL },
  { flaeche: '#E8E7E3', zahl: DUNKLE_ZAHL },
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

// ── Was aus einem Bezirk herausspringt (Phase 19c) ───────────────────────────

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Ians Entscheidung 34: BIS ZU DREI Aktivitäten springen heraus, darunter „alle
 *  N ansehen".
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Seine Rückmeldung zu 19b: „wenn man auf einen Bezirk klickt, sollen die Aktivitäten
 * über dem Klick herausspringen, klein, mit dem Minimum an Info — und wenn ich
 * interessiert bin, klicke ich drauf und sehe die ganze."
 *
 * Verworfen, mit Begründung — als Gedächtnis, nicht als Einladung:
 *   'alle'   Alle, waagrecht durchwischbar (wie die Ortskarten in Apple Karten).
 *            Kommt an alles heran und wäre der VIERTE Wisch-Erkenner der App — direkt
 *            über einer Karte, die selbst geschoben wird. Genau der Streit, vor dem
 *            harte Regel 44 warnt.
 *   'eine'   Eine große mit Blätterpfeilen. Am ruhigsten, aber man muss fünfmal
 *            tippen, um zu sehen, was es gibt — und das Überblicken war der Grund
 *            für die ganze Karte.
 *
 * ── Warum das eine OBERGRENZE ist und keine Zusage ────────────────────────────
 * Drei passen fast nie. Nachgerechnet vor dem Bauen, nicht danach: Auf 360 × 600 ist
 * die Kartenfläche 216 × 168 px, und der Beschriftungspunkt der Inneren Stadt sitzt
 * bei y = 94 — es bleiben **90 px** über ihm. Eine Zeile ist 30 px hoch, dazu Rahmen,
 * Pfeil und Fußzeile. Es passt **eine**; auf 390 × 844 (230 px Karte, 125 px über dem
 * Anker) passen **zwei**.
 *
 * Die Antwort darauf ist nicht kleinere Schrift, sondern weniger Zeilen — dieselbe
 * Rechnung wie bei `KARTE_ANTEIL`. Wie viele wirklich passen, entscheidet der
 * Zeichner aus dem gemessenen Platz (`KartenBlase`); hier steht nur, wie viele es
 * höchstens sein dürfen.
 */
export const BLASE_MAX = 3;

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Ians Entscheidung 37, 2026-09-06: In der Blase steht oben, WAS ALS NÄCHSTES
 *  LOSGEHT.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Die Frage kam beim Bauen auf und stand in keinem Plan: Auf einen Bezirk mit fünf
 * Posts passen ein bis zwei Zeilen — welche zwei?
 *
 * Verworfen:
 *   'neueste'  Dieselbe Reihenfolge wie die Liste darunter (`sort.ts`, Ians
 *              Entscheidung 1). Eine Wahrheit statt zweier — und genau daran
 *              scheitert es: Ein Post, der in zwanzig Minuten losgeht, fällt aus der
 *              Blase, weil jemand später etwas für Samstag gepostet hat. Im Feed ist
 *              das Neueste richtig, weil dort ALLES steht und man weiterscrollt; in
 *              einer Auswahl von zwei aus fünf ist es die falsche Frage.
 *   'frei'     Erst die mit freien Plätzen. Klingt hilfsbereit, sortiert sich aber
 *              um, während man hinschaut — ein bestätigter Platz verschiebt die
 *              Blase, ohne dass jemand etwas getan hat.
 *
 * **Den Haken kennt er:** Blase und Liste darunter sortieren verschieden. Das ist
 * vertretbar, weil die Blase eine AUSWAHL ist und die Liste die vollständige Menge —
 * anders als bei `StapelDurch` und `LeererFeed` (2026-09-03) geben sie nicht zwei
 * Antworten auf dieselbe Frage, sondern eine kurze und eine lange auf zwei.
 *
 * Der Vergleich selbst steht als `nachStartzeit` schon in `sort.ts` und wird von dort
 * genommen: Was die Reihenfolge von Posts angeht, soll es keine zweite Rechnung geben.
 */
export const BLASE_REIHENFOLGE: 'naechste' | 'neueste' | 'frei' = 'naechste';

/** „alle 5 ansehen" — die Fußzeile der Blase, wenn nicht alles hineinpasst. */
export function blaseAlleText(gesamt: number): string {
  return `alle ${gesamt} ansehen`;
}

// ── Die echte Apple-Karte (Phase 19d) ────────────────────────────────────────

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Ians Entscheidung 36, 2026-09-06: Auf der echten Karte werden die Bezirke ZART
 *  GETÖNT — je mehr los ist, desto kräftiger.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Gefragt war, wie eine geografische Karte zeigt, wo etwas los ist. Verworfen, mit
 * Begründung — als Gedächtnis, nicht als Einladung:
 *   'blasen'  Zahlen-Blasen wie Apples eigene Pins. **Das war meine Empfehlung**: am
 *             nächsten an Apples Sprache, und sie lösen nebenbei, dass die Zahl im
 *             7., 8. und 1. Bezirk nicht in die Fläche passt. Ian hat anders
 *             entschieden, und das wird gebaut, nicht neu verhandelt.
 *   'beides'  Tönung UND Blasen. Die meiste Auskunft — und das meiste, was
 *             gleichzeitig um Aufmerksamkeit kämpft.
 *
 * **Den Haken kennt er:** Mit dem Tönen bleibt die Zahl IN der Fläche, also bleibt
 * auch das Problem aus 19b — im 1., 7. und 8. Bezirk erscheint sie erst beim
 * Hineinzoomen. Eine Blase hätte keinen Platz in der Fläche gebraucht. Das ist der
 * erste Ort, an dem man nachsieht, falls sich die Karte später „zu leer" anfühlt.
 */
export const APPLE_DARSTELLUNG: 'toenen' | 'blasen' | 'beides' = 'toenen';

/**
 * Wie kräftig die Tönung über der echten Karte ist.
 *
 * Auf der gezeichneten Karte sind die Stufen DECKEND — dort gibt es nichts
 * darunter. Über einer Apple-Karte muss die Straße durchscheinen, sonst hat man
 * eine graue Fläche gekauft und eine echte Karte bezahlt. Bei 0,45 bleibt die
 * Reihenfolge der vier Stufen unterscheidbar und der Stadtplan lesbar.
 *
 * ⚠️ **Der Haken, der beim Bauen sichtbar wird und noch offen ist:** Ein Farbschleier
 * macht Apples gesättigtes Wasserblau schmutzig — Donau und Donaukanal sehen dann
 * nach Fleck aus, nicht nach Auskunft. Der Ausweg wäre, den Schleier nur auf das
 * LAND zu legen; Apple liefert dafür keine Maske, die Stadt Wien aber schon
 * (`GRUENGEWOGD`, sieben Flächen). **Vorschlag zum Ausprobieren, nicht beschlossen** —
 * steht so in PLAN.md, Phase 19d.
 */
export const APPLE_TOENUNG = 0.45;

/**
 * Die Füllfarbe einer Stufe auf der echten Karte — dieselbe Farbe wie auf der
 * gezeichneten, nur durchscheinend.
 *
 * **Warum das hier steht und nicht im Zeichner:** Es gibt ab 19d drei Zeichner und
 * genau eine Bedeutung von „viel los". Rechnete jeder seine eigene Deckkraft aus,
 * hätte die App drei Wahrheiten darüber — und auffallen würde es nur dem, der alle
 * drei nebeneinanderhält.
 *
 * `stufe < 0` heißt leer, und über einer echten Karte ist die ehrliche Antwort
 * darauf **gar keine Fläche**: Auf der gezeichneten Karte steht dort `KARTE_LEER`,
 * weil es sonst ein Loch gäbe; hier liegt darunter schon ein Stadtplan. Ein grauer
 * Schleier über einem leeren Bezirk behauptete Auskunft, wo keine ist.
 */
export function appleFuellung(stufe: number): string {
  if (stufe < 0) return 'transparent';
  const hex = STUFEN[stufe].flaeche;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${APPLE_TOENUNG})`;
}

/**
 * Wie weit man auf der Apple-Karte heraus- und hineinzoomen darf.
 *
 * **Die Zahlen sind bewusst NICHT `ZOOM_MIN`/`ZOOM_MAX`.** Jene sind ein Faktor auf
 * unser eigenes Bild, MapKit rechnet in Kamera-Entfernungen — beides gleich zu
 * nennen wäre eine Scheingenauigkeit. Gemeinsam ist die REGEL, nicht die Zahl.
 *
 * ── Und sie sind GEMESSEN, nicht gerechnet (2026-09-06) ──────────────────────
 * Zuerst stand hier 10, hergeleitet aus der üblichen Formel (Weltbreite
 * 256 · 2^z Punkte). Auf dem Simulator öffnete die Karte damit auf **rund einem
 * Drittel** von Wien — `react-native-maps` setzt `minZoomLevel` auf iOS über
 * `cameraZoomRange` in ENTFERNUNGEN um, und seine Umrechnung liegt gut anderthalb
 * Stufen neben der Lehrbuchformel. Bei 9 passt ganz Wien hinein, bei 10 nicht.
 * **Das ist genau die Falle, die in PLAN.md, Phase 19d als Punkt 4 vorhergesagt
 * war** — nur schärfer: Die Grenze verschob nicht bloß den erlaubten Bereich, sie
 * überschrieb den ANFANGSAUSSCHNITT.
 *
 * `9` heißt: Man kann etwa auf das Doppelte von Wien herauszoomen und nicht weiter.
 * `15` ist die Stadtviertel-Ebene, und die Obergrenze ist eine Entscheidung, keine
 * technische Grenze: **Die App kennt keine Koordinaten** (am Post steht nur
 * `district`). Wer bis auf ein einzelnes Haus hineinzoomen darf, dem verspricht die
 * Karte eine Genauigkeit, die die Daten nicht haben — harte Regel 47, diesmal nicht
 * gegen einen Pin, sondern gegen den Zoom.
 */
export const APPLE_ZOOM_MIN = 8;

/*
 * ⚠️ **Am 2026-09-08 von 9 auf 8 gesenkt, und die Begründung ist der Fund der
 * Phase 19g** — sie erklärt zugleich, warum die Karte auf Ians Gerät mit Stockerau
 * und Baden aufging (*„es ist noch zu viel auf dem Bildschirm"*).
 *
 * `react-native-maps` erzwingt diese Grenze auf iOS nicht über MapKits
 * `cameraZoomRange`, sondern über eine EIGENE Nachrechnung: `applyLegacyZoomConstrains`
 * läuft nach JEDER Ausschnittsänderung, rechnet aus der Kartenbreite und
 * `region.span` eine Zoomstufe und setzt den Ausschnitt hart neu, wenn sie unter der
 * Grenze liegt (`AIRMapManager.m`, `getZoomLevel`). **Diese Rechnung kennt
 * `mapPadding` nicht.**
 *
 * Damit kollidiert sie mit Ians Entscheidung 58: Sobald das Blatt unten Platz
 * wegnimmt, wird Wien in einen schmalen Streifen eingepasst — über die GANZE
 * Kartenfläche gerechnet ist das eine kleinere Zoomstufe, obwohl auf dem Schirm
 * nichts kleiner wird. Gemessen: Bei halb offenem Blatt ergibt der richtige
 * Ausschnitt **8,97**, die Grenze stand auf 9. Die Bibliothek hat ihn also jedes Mal
 * eine Sekunde später wieder aufgerissen — auf einen Zoom-9-Ausschnitt über die
 * volle Höhe, und der zeigt halb Niederösterreich.
 *
 * **Das war nicht zu sehen, sondern nur zu messen:** Am Bild sah es aus wie ein
 * falscher `initialRegion`, und genau als solcher stand es im Plan („dritter
 * Befund"). Die Zahlenfolge im Protokoll — 0,5641 richtig, eine Sekunde später
 * 2,2032 — hat es entschieden.
 *
 * 8 heißt rund 82 km Breite, also knapp das Dreifache von Wien. Der Abstand zu 8,97
 * ist Absicht: Jede künftige Änderung an der Polsterung verschiebt die gerechnete
 * Stufe mit.
 */
export const APPLE_ZOOM_MAX = 15;

// ── Wie viel ein Blatt von der Karte verdecken darf (Phase 19e) ──────────────

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Ab wann die Karte NICHT mehr kleiner wird, obwohl das Blatt weiter aufgeht.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Seit Ians Entscheidung 40 liegt über der Karte ein ziehbares Blatt, und die Karte
 * zeichnet Wien in den freien Streifen DARÜBER — sonst läge die halbe Stadt dahinter
 * (siehe `randUnten` in `components/ui/karte-typen.ts`).
 *
 * ── Der Befund, aus dem diese Zahl kommt, ist gemessen ────────────────────────
 * Ohne Grenze schrumpfte Wien beim Aufziehen auf die oberste Stufe auf **44 px
 * Höhe** (360 × 600, am 2026-09-07 nachgemessen) — ein Fleck. Schlimmer als klein
 * ist dabei, dass die Karte bei JEDEM Zug am Griff ihren Maßstab wechselt: Man zieht
 * eine Liste hoch und die Stadt darunter zappelt.
 *
 * Ab dieser Grenze läuft die Karte lieber HINTER das Blatt, statt weiter zu
 * schrumpfen. Sichtbar ist davon nichts — was verdeckt ist, ist verdeckt —, aber der
 * Maßstab bleibt stehen, und beim Zuziehen wächst die Karte wieder auf den vollen
 * Platz.
 *
 * `0.5` ist die mittlere Raststufe des Blattes. Das ist kein Zufall und auch keine
 * Kopplung: Es ist die Stufe, auf der das Blatt aufschlägt — also der Maßstab, den
 * jemand als ersten sieht und wiedererkennt.
 */
export const KARTE_MIN_BAND = 0.5;

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Wie viel Karte übrig bleiben muss, damit Apples Nennung noch Platz hat
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * **Ians Entscheidung 58 (2026-09-08):** Die Nennung steht direkt über der
 * Blattkante und fährt mit. Auf seinem Bild lag sie MITTEN im Blatt und schien
 * hindurch — solange das Blatt deckte, war sie richtig platziert; seit 19g deckt
 * es, und dann wäre sie schlicht verschwunden.
 *
 * ── Warum das keine Geschmacksfrage ist ───────────────────────────────────────
 * MapKit zeichnet Logo und Rechtelink SELBST, und zwar an den unteren Rand seines
 * gepolsterten Bereichs (`mapPadding`). Es gibt also genau EINEN Regler für zwei
 * Fragen: wo Wien sitzt und wo die Nennung sitzt. **Die Nennung gewinnt** — sie ist
 * Lizenzbedingung, Wiens Lage ist eine Vorliebe.
 *
 * Diese Zahl ist die Untergrenze: So viel Karte muss über dem Blatt stehen bleiben,
 * sonst hört das Mitfahren auf. Bei ganz aufgezogenem Blatt ist von der Karte
 * ohnehin nur ein Streifen da — dort ist die Karte nicht mehr „dargestellt", und
 * die Nennung darf mit ihr verschwinden.
 */
export const NENNUNG_MIN_KARTE = 96;

/**
 * Ob der „Ganz Wien"-Knopf auch bei ganz aufgezogenem Blatt dasteht.
 *
 * **Ians Entscheidung 59 (2026-09-08): nein.** Sein Argument ist Entscheidung 50 —
 * wer gerade eine Liste liest, braucht den Knopf nicht, der die Karte zurücksetzt.
 * Auf seinem Bild schimmerte er ohnehin durchs Blatt; jetzt läge er dahinter, und
 * ein Knopf, den man nicht sieht, ist einer, den man nicht wegbekommt.
 */
export const ZURUECK_KNOPF_BEI_GANZ = false;

/**
 * Wie lang ein Übergang auf der Karte dauert, in Millisekunden.
 *
 * **Ians Entscheidung 60 (2026-09-08):** *„Es ist ja jetzt eigentlich instant —
 * vielleicht, dass es so rauspoppt, so eine leichte Transition, die man fast gar
 * nicht merkt."* Der zweite Halbsatz ist die Vorgabe, nicht der erste: Es soll
 * nicht auffallen, es soll nur nicht springen.
 *
 * 280 ms sind Apples eigene Größenordnung für eine Ansichtsänderung. Kürzer wirkt
 * wie ein Sprung, länger fühlt sich zäh an — und auf der Karte hängt daran mehr als
 * Schönheit: Ein Ausschnittwechsel ohne Bewegung sieht aus wie ein Bildfehler.
 *
 * Die Zahl steht hier und nicht bei einem Zeichner, weil sie an mehreren Stellen
 * gebraucht wird (Einpassen, „Ganz Wien", Blase) — harte Regel 52.
 */
export const UEBERGANG_MS = 280;

/**
 * Welche Sorte Apple-Karte darunter liegt.
 *
 * `mutedStandard` ist Apples eigene Fassung für genau diesen Fall: dieselbe Karte,
 * nur mit zurückgenommenen Farben, damit eine Auflage darüber lesbar bleibt. Ian
 * wollte „Karten von Apple" — das ist eine, und zwar die, die Apple selbst
 * empfiehlt, wenn etwas darüberliegt. Sonst kämpfen Straßennamen und Geschäfte mit
 * dem, was die App sagen will.
 *
 * **Falls es ihm zu blass ist, ist der Rückweg ein Wort:** `'standard'`.
 */
export const APPLE_KARTE_ART: 'mutedStandard' | 'standard' = 'mutedStandard';

/**
 * Apples Namensnennung steht NICHT hier — und das ist kein Vergessen.
 *
 * MapKit zeichnet Logo und Rechtelink selbst in die Kartenfläche; sie zusätzlich
 * hinzuschreiben wäre eine zweite, verschiebbare Fassung derselben Pflicht. Was
 * bleibt, ist `KARTE_QUELLE` oben: Die BEZIRKSFLÄCHEN kommen weiter von der Stadt
 * Wien (CC BY 4.0), auch wenn der Hintergrund von Apple ist. Beide Nennungen stehen
 * nebeneinander, weil sie zwei verschiedene Dinge betreffen.
 */
export const APPLE_NENNUNG_KOMMT_VON = 'mapkit';
