import type { Post } from '@/types/models';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WANN VERSCHWINDET EIN POST AUS DEM FEED?
 *  Entschieden von Ian am 2026-08-31 (PLAN.md, Abschnitt 6.2).
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Seine Antwort, in seinen Worten: *„Wenn man schreibt 'wer will heute Tennis
 * spielen', verschwindet es am nächsten Tag. Es sollte aber eine Option geben, wo man
 * beim Posten sagen kann, dass man's kürzer oder länger haben will — wenn man das
 * ignoriert, sollte es ein Tag sein."*
 *
 * Daraus folgen zwei Dinge:
 *
 *   1. STANDARD: bis zum Ende des Tages, an dem die Sache stattfindet.
 *      Wer um 17:05 in der U6 sitzt, sieht das Tennis von 17:00 noch — und kann
 *      hinfahren. Das war der Haken an „sofort zur Startzeit", und genau den
 *      räumt diese Regel weg.
 *
 *   2. Der Poster darf davon ABWEICHEN. Deshalb hat `Post` ein optionales
 *      `expiresAt`: eine Ablaufzeit, die der Post selbst mitbringt. Ist sie leer
 *      (alle Fake-Daten aus `mock.ts`), gilt der Standard aus Punkt 1.
 *
 * Die drei Möglichkeiten, die der Erstellen-Screen anbietet, stehen unten in
 * `SICHTDAUERN`. Sie sind die einzige Stelle, an der Wort und Rechenregel
 * zusammenkommen — der Screen zeigt nur an, was hier steht.
 *
 * ── Die Nebenwirkung, die man sehen muss ──────────────────────────────────────
 * Seit dieser Regel stehen Posts im Feed, die schon angefangen haben. „Heute 14:00"
 * um 23 Uhr läse sich wie eine Einladung. Deshalb schreiben Karte und Detail bei
 * solchen Posts „Seit 14:00" (`startOderSeit` in `lib/zeit.ts`).
 */

/** Wie lange ein Post nach seiner Startzeit noch im Feed steht. */
export type Sichtdauer = 'start' | 'tagesende' | 'morgen';

/** Was gilt, wenn der Poster die Option nicht anfasst — Ians „ein Tag". */
export const SICHTDAUER_STANDARD: Sichtdauer = 'tagesende';

export interface SichtdauerMeta {
  wert: Sichtdauer;
  label: string;
  /** Was das bedeutet, in einem Halbsatz — für den Erstellen-Screen. */
  erklaerung: string;
}

/**
 * Die drei Möglichkeiten, in der Reihenfolge kurz → lang.
 *
 * Bewusst nur drei und keine freie Stundenzahl: „wie viele Stunden soll mein Post
 * sichtbar sein" ist keine Frage, die sich jemand beim Posten stellt. Drei Pillen
 * beantworten sie, ohne sie zu stellen.
 */
export const SICHTDAUERN: readonly SichtdauerMeta[] = [
  {
    wert: 'start',
    label: 'Bis es losgeht',
    erklaerung: 'Für Sachen, bei denen man pünktlich sein muss — Kino, Zug, Konzert.',
  },
  {
    wert: 'tagesende',
    label: 'Bis Tagesende',
    erklaerung: 'Der Normalfall. Wer knapp zu spät dran ist, kann trotzdem noch dazukommen.',
  },
  {
    wert: 'morgen',
    label: 'Einen Tag länger',
    erklaerung: 'Für Offenes ohne feste Uhrzeit — „bin den ganzen Nachmittag am Donaukanal".',
  },
];

/**
 * Wann ein Post mit dieser Sichtdauer abläuft.
 *
 * Gerechnet wird auf den Kalendertag der Startzeit, nicht auf 24-Stunden-Blöcke:
 * „bis Tagesende" heißt Mitternacht des Tages, an dem die Sache stattfindet — egal
 * ob sie um 9 Uhr früh oder um 22 Uhr abends ist.
 */
export function ablaufZeitpunkt(startsAt: string, dauer: Sichtdauer): string {
  if (dauer === 'start') return startsAt;

  const d = new Date(startsAt);
  if (dauer === 'morgen') d.setDate(d.getDate() + 1);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

/** Wann dieser Post abläuft — seine eigene Angabe, sonst der Standard. */
export function ablaufVon(post: Post): string {
  return post.expiresAt ?? ablaufZeitpunkt(post.startsAt, SICHTDAUER_STANDARD);
}

/**
 * Gehört dieser Post noch in den Feed?
 *
 * `status: 'past'` steht davor und gilt immer: was der Verfasser selbst geschlossen
 * hat, kommt unabhängig von der Uhrzeit nicht zurück.
 */
export function istAktuell(post: Post, jetzt: Date): boolean {
  if (post.status === 'past') return false;
  return new Date(ablaufVon(post)).getTime() > jetzt.getTime();
}
