import { abstandVonOrtMeter, bezirksAbstandMeter } from '@/lib/karte-geo';
import { STANDORT_ROLLE, type MeinOrt } from './standort';
import type { Post } from '@/types/models';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS STEHT IM FEED GANZ OBEN?
 *  Entschieden von Ian am 2026-08-31 (Entscheidung 1) — und am 2026-09-08 ERSETZT
 *  durch seine Entscheidung 63 (PLAN.md, Abschnitt 5b, Phase 19h).
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Das ist keine Kleinigkeit. Was oben steht, wird gesehen; was auf Platz zwölf steht,
 * praktisch nie. Diese Funktion entscheidet also, was die App an einem Dienstagabend
 * über sich selbst behauptet.
 *
 * Die drei Möglichkeiten aus PLAN.md, mit ihrem jeweiligen Haken:
 *
 *   1. DAS ZEITLICH NÄCHSTE ZUERST  (`nachStartzeit`)
 *      Oben steht, was gleich losgeht — man kann sofort hin. Dringlich und nützlich.
 *      Haken: Ein Post für nächsten Monat steht dauerhaft ganz unten und wird nie
 *      gesehen, egal wie oft man scrollt. Wer weit vorausplant, postet ins Leere.
 *
 *   2. DAS NEUESTE ZUERST  (`nachErstellung`)
 *      Wie Instagram: was gerade gepostet wurde, steht oben. Fühlt sich lebendig an,
 *      belohnt Leute, die posten.
 *      Haken: Jemand plant heute ein Konzert in drei Wochen — und drängt sich damit
 *      vor das Tennis, das in zwei Stunden anfängt. Genau falsch herum für eine App,
 *      in der es ums Jetzt geht.
 *
 *   3. EIGENER BEZIRK ZUERST  (`gleicherBezirkZuerst`)
 *      Wien ist groß. Von 1220 nach 1060 sind es 40 Minuten mit den Öffis.
 *      Haken: Allein reicht das nie — innerhalb des Bezirks braucht es trotzdem eine
 *      Reihenfolge. Das ist eher ein VORSORTIERER, den man mit 1 oder 2 kombiniert.
 *
 * ── Ians Entscheidung, 2026-08-31: DAS NEUESTE ZUERST ────────────────────────
 * Möglichkeit 2. Der Feed verhält sich damit wie Instagram: Wer etwas postet, steht
 * oben und wird gesehen — und das ist es, was eine App am Anfang braucht. Bei fünfzig
 * Leuten aus einer Schule ist das Problem nicht "zu viele Posts", sondern "postet
 * überhaupt jemand". Eine Reihenfolge, die das Posten belohnt, arbeitet dagegen an.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  ── Ians Entscheidung 63, 2026-09-08: NACH ENTFERNUNG. ──────────────────────
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Möglichkeit 3, und zwar als HAUPTregel statt als Vorsortierer. Sie kommt aus dem
 * Durchgang am eigenen Handy und richtet sich zuerst gegen etwas anderes — den
 * Bezirks-Filter: *„Bezirk ist too viel, das sieht echt nicht gut aus."* Sein
 * Gegenentwurf war kein besserer Filter, sondern **gar keiner**: Man gibt seinen
 * Bezirk einmal an, und die App zeigt von dort aus nach außen — *„und dann entfernt
 * man sich immer weiter."*
 *
 * **Das ersetzt Entscheidung 1, und es ist nicht still passiert.** Ihm wurden am
 * 2026-09-08 drei Lesarten seines Satzes vorgelegt (harte Regel 58: eine neue
 * Entscheidung überschreibt keine alte Regel-Datei, ohne dass jemand gefragt hat),
 * und er hat die stärkste gewählt — gegen meine Empfehlung:
 *
 *   (a) ein Umkreis, der beim Durchwischen mitwächst; innerhalb bleibt das Neueste
 *       oben. Meine Empfehlung, weil Entscheidung 1 dabei unangetastet bliebe.
 *   (b) ✅ **die Reihenfolge selbst**: das Nächste ganz oben, das Weiteste unten.
 *   (c) beides zusammen — Ringe UND innerhalb nach Entfernung.
 *
 * **Den Haken kennt er, er stand in der Frage:** Ein frisch geposteter Post aus 1220
 * kommt bei jemandem aus 1070 nie mehr nach oben. Das ist genau der Haken, gegen den
 * Entscheidung 1 gebaut war („postet überhaupt jemand"). Was ihn kleiner macht: Die
 * Liste ist kurz und Wien ist an der weitesten Stelle 29 km breit — „ganz unten"
 * heißt hier nicht „nie", sondern „drei Wischer später".
 *
 * ── Was von Entscheidung 1 BLEIBT, und das ist mehr, als es klingt ────────────
 * Sie ist nicht weg, sie ist die **zweite Stufe**: Bei gleicher Entfernung steht
 * weiter das Neueste oben. Und gleiche Entfernung heißt in der Praxis **derselbe
 * Bezirk** — die Posts, die einem am nächsten sind, sind also weiter nach dem
 * Neuesten sortiert. Genau dort, wo man am ehesten hingeht, gilt seine alte Regel
 * unverändert.
 *
 * Die Bausteine unten sind so gebaut, dass man sie aneinanderhängen kann: die erste
 * Regel, die nicht 0 sagt, gewinnt. Ein Zurück auf Entscheidung 1 ist eine Zeile in
 * `vergleichePosts`, kein Umbau.
 */

/** Was die Sortierung über den Betrachter wissen darf. */
export interface SortKontext {
  /** Jetzt. Wird durchgereicht statt in der Funktion geholt, damit sie testbar bleibt. */
  jetzt: Date;
  /** Der Bezirk des angemeldeten Nutzers, z. B. "1070". Die GRUNDLAGE (Entscheidung 61). */
  meinBezirk: string;
  /**
   * Wo der Betrachter gerade wirklich steht — **Phase 19h-2**, `null`, wenn es
   * keine Erlaubnis, keine Messung oder keinen Schalter gibt.
   *
   * **Pflichtfeld und nicht optional, und das ist Absicht.** Ein `meinOrt?:` hätte
   * alle drei Aufrufstellen stumm durchlaufen lassen — dieselbe Falle wie
   * `ChatThread.postId` (Phase 16) und `Post.district` (Phase 12), und ausgerechnet
   * eine dieser Stellen hat in 19h-1 vier Wochen lang den falschen Bezirk
   * durchgereicht, weil niemand hinsehen musste. So schreibt `tsc` die Arbeitsliste.
   */
  meinOrt: MeinOrt;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WO EIN POST OHNE BEZIRK LANDET
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Seit dem 2026-09-02 darf ein Post keinen Bezirk haben (Ians Entscheidung 9,
 * `BEZIRK_FREIWILLIG`). Für eine Reihenfolge nach Entfernung ist das eine Lücke:
 * „Donauinsel spazieren" hat keine.
 *
 * Gewählt ist `'ans-ende'`, und der Grund ist **Übereinstimmung mit einer Regel, die
 * es schon gibt**: `passtZumBezirk()` in `filter.ts` wirft so einen Post bei einem
 * Bezirksfilter ebenfalls heraus, mit der ausgeschriebenen Begründung, dass ein Post
 * ohne Ortsangabe kein Versprechen über den Ort macht. Eine Sortierung nach Nähe
 * beantwortet dieselbe Frage — sie kann keine Nähe behaupten, wo keine angegeben ist.
 *
 * Verworfen, mit Begründung — als Gedächtnis, nicht als Einladung:
 *   'nach-vorn'  Sie stünden immer oben. Das belohnt das WEGLASSEN des Bezirks: Wer
 *                den Ort offen lässt, bekommt den besten Platz. Bei einer App, die
 *                Leute an einen Ort bringen soll, die falsche Richtung.
 *   'mitte'      Die halbe Stadtbreite als Ersatzwert (≈ 15 km). Klingt fair und ist
 *                eine erfundene Zahl — sie behauptet eine Entfernung, die niemand
 *                angegeben hat, und der Feed sähe je nach Wohnbezirk anders sortiert
 *                aus, ohne dass es dafür Daten gäbe.
 *
 * **Der bekannte Preis** steht schon in `app/create.tsx`: Lassen viele das Feld leer,
 * sammeln sich ihre Posts unten. Die Korrektur ist ein Wort.
 */
export const OHNE_BEZIRK_POSITION: 'ans-ende' | 'nach-vorn' | 'mitte' = 'ans-ende';

// ── Bausteine ────────────────────────────────────────────────────────────────
// Alle geben die Vergleichszahl zurück, die `Array.sort` erwartet:
//   negativ  → a steht VOR b        0 → unentschieden        positiv → a steht NACH b

/** Was früher losgeht, steht oben. */
export function nachStartzeit(a: Post, b: Post): number {
  return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
}

/** Was zuletzt gepostet wurde, steht oben. */
export function nachErstellung(a: Post, b: Post): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

/** Posts aus dem eigenen Bezirk nach oben, der Rest bleibt untereinander unentschieden. */
export function gleicherBezirkZuerst(a: Post, b: Post, meinBezirk: string): number {
  const aHier = a.district === meinBezirk ? 0 : 1;
  const bHier = b.district === meinBezirk ? 0 : 1;
  return aHier - bHier;
}

/** Was heute stattfindet, nach oben — unabhängig von der Uhrzeit. */
export function heuteZuerst(a: Post, b: Post, jetzt: Date): number {
  const istHeute = (iso: string) => new Date(iso).toDateString() === jetzt.toDateString();
  return Number(istHeute(b.startsAt)) - Number(istHeute(a.startsAt));
}

/**
 * Wie weit ein Post von mir weg ist, in Metern — **null**, wenn er keinen Bezirk hat
 * oder der Bezirk unbekannt ist.
 *
 * Der eigene Bezirk ergibt **0**, nicht „ungefähr null": `bezirksAbstandMeter` misst
 * dann eine Mitte gegen sich selbst. Alle Posts aus dem eigenen Bezirk sind damit
 * gleich weit weg und fallen an die zweite Stufe — das ist die Stelle, an der
 * Entscheidung 1 weiterlebt.
 */
export function entfernungMeter(post: Post, ctx: SortKontext): number | null {
  if (post.district === null) return null;

  // Phase 19h-2: Wenn ein gemessener Ort da ist, wird ab IHM gemessen statt ab der
  // eigenen Bezirksmitte. Der Zielpunkt bleibt in beiden Fällen die Bezirksmitte des
  // Posts — ein Post hat keine Koordinate (harte Regel 47). Deshalb bleiben alle
  // Posts eines Bezirks auch mit GPS gleich weit weg, und die zweite Stufe unten
  // (Entscheidung 1) greift unverändert.
  //
  // Welche Rolle der Standort überhaupt spielen darf, steht in `standort.ts` und
  // nicht hier: `'ausgangspunkt'` ist die einzige Rolle, die diese Rechnung ändert.
  if (STANDORT_ROLLE === 'ausgangspunkt' && ctx.meinOrt) {
    return abstandVonOrtMeter(ctx.meinOrt, post.district);
  }

  return bezirksAbstandMeter(ctx.meinBezirk, post.district);
}

/**
 * Was näher ist, steht oben — Ians Entscheidung 63.
 *
 * Posts ohne Entfernung behandelt `OHNE_BEZIRK_POSITION`. Zwei davon sind
 * untereinander unentschieden (0), damit die nächste Stufe greift und sie nicht in
 * einer zufälligen Reihenfolge stehen bleiben.
 */
export function nachEntfernung(a: Post, b: Post, ctx: SortKontext): number {
  const ea = entfernungMeter(a, ctx);
  const eb = entfernungMeter(b, ctx);
  if (ea === null && eb === null) return 0;
  if (ea === null) return OHNE_BEZIRK_POSITION === 'nach-vorn' ? -1 : 1;
  if (eb === null) return OHNE_BEZIRK_POSITION === 'nach-vorn' ? 1 : -1;
  return ea - eb;
}

/**
 * Die Reihenfolge des Feeds — Ians Regel (siehe Kopf dieser Datei).
 *
 * Zwei Stufen, und beide sind seine Entscheidungen: erst die Entfernung
 * (Entscheidung 63), bei Gleichstand das Neueste (Entscheidung 1). Gleichstand ist
 * dabei der häufige Fall und nicht der Ausnahmefall — alle Posts aus einem Bezirk
 * teilen sich eine Entfernung.
 *
 * `ctx.jetzt` wird weiterhin nicht gebraucht, bleibt aber in der Signatur: die
 * Alternativen oben brauchen es, und eine Signatur zu ändern ist teurer, als ein
 * Feld ungenutzt zu lassen.
 *
 * @returns negativ = a steht vor b · 0 = unentschieden · positiv = a steht nach b
 */
export function vergleichePosts(a: Post, b: Post, ctx: SortKontext): number {
  const weite = nachEntfernung(a, b, ctx);
  if (weite !== 0) return weite;
  return nachErstellung(a, b);
}
