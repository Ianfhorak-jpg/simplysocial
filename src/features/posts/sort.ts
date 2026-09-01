import type { Post } from '@/types/models';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS STEHT IM FEED GANZ OBEN?
 *  Entschieden von Ian am 2026-08-31 (PLAN.md, Abschnitt 6.1). Die drei Möglichkeiten
 *  bleiben unten stehen — mit dem, was für und gegen sie sprach.
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
 * Es gibt keine richtige Antwort. Kombinationen sind erlaubt und meistens besser als
 * eine einzelne Regel — die Bausteine unten sind so gebaut, dass man sie aneinander-
 * hängen kann: die erste Regel, die nicht 0 sagt, gewinnt.
 *
 * ── Ians Entscheidung, 2026-08-31: DAS NEUESTE ZUERST. ───────────────────────
 * Möglichkeit 2. Der Feed verhält sich damit wie Instagram: Wer etwas postet, steht
 * oben und wird gesehen — und das ist es, was eine App am Anfang braucht. Bei fünfzig
 * Leuten aus einer Schule ist das Problem nicht "zu viele Posts", sondern "postet
 * überhaupt jemand". Eine Reihenfolge, die das Posten belohnt, arbeitet dagegen an.
 *
 * Den Haken hat Ian gekannt und in Kauf genommen: Ein Post für ein Konzert in drei
 * Wochen steht direkt nach dem Absenden über dem Tennis, das in zwei Stunden anfängt.
 * Er rutscht zwar mit jedem neueren Post nach unten — aber in dem Moment, in dem er
 * frisch ist, drängt er sich vor.
 *
 * Falls sich das im echten Betrieb beißt, ist die Korrektur zwei Zeilen und KEINE
 * Abkehr von der Entscheidung — heutige Sachen zuerst, innerhalb davon weiter das
 * Neueste:
 *
 *     const heute = heuteZuerst(a, b, ctx.jetzt);
 *     if (heute !== 0) return heute;
 *     return nachErstellung(a, b);
 */

/** Was die Sortierung über den Betrachter wissen darf. */
export interface SortKontext {
  /** Jetzt. Wird durchgereicht statt in der Funktion geholt, damit sie testbar bleibt. */
  jetzt: Date;
  /** Der Bezirk des angemeldeten Nutzers, z. B. "1070". */
  meinBezirk: string;
}

// ── Bausteine ────────────────────────────────────────────────────────────────
// Alle drei geben die Vergleichszahl zurück, die `Array.sort` erwartet:
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
 * Die Reihenfolge des Feeds — Ians Regel (siehe Kopf dieser Datei).
 *
 * `ctx` wird noch nicht gebraucht, bleibt aber in der Signatur: die Alternativen oben
 * brauchen `jetzt` bzw. `meinBezirk`, und eine Signatur zu ändern ist teurer, als ein
 * Feld ungenutzt zu lassen.
 *
 * @returns negativ = a steht vor b · 0 = unentschieden · positiv = a steht nach b
 */
export function vergleichePosts(a: Post, b: Post, _ctx: SortKontext): number {
  return nachErstellung(a, b);
}
