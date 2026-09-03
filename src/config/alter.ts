import type { AgeBand, AgeGroup } from '@/types/models';

/**
 * Wie die Altersgruppen heißen — die WÖRTER, nicht die Regeln.
 *
 * Die Regeln (wer zu wem passt) stehen in `features/posts/filter.ts`, die Typen in
 * `types/models.ts`. Dieselbe Dreiteilung wie bei den Kategorien: `config/` sagt,
 * wie etwas heißt, `features/` sagt, was es tut.
 *
 * ── Warum die Beschriftung am Post anders lautet als im Filter ────────────────
 * Derselbe Wert `egal` bedeutet an zwei Stellen zwei verschiedene Sätze:
 *   · Beim Posten heißt er „Für alle" — eine Ansage des Verfassers.
 *   · Im Filter heißt er „Alter egal" — der Verzicht des Suchenden auf eine Angabe.
 * Ein gemeinsames Wort für beides gäbe es (etwa „egal"), aber es wäre an einer der
 * beiden Stellen die falsche Aussage. Zwei kurze Listen sind billiger als ein Wort,
 * das man erklären muss.
 *
 * ── Zur Schreibweise ─────────────────────────────────────────────────────────
 * Im Datenmodell steht `'14-17'` mit einem gewöhnlichen Bindestrich (ein Wert, der
 * eines Tages in einer Datenbank steht und getippt werden muss), angezeigt wird
 * `14–17` mit Halbgeviertstrich — das ist die richtige Form für einen Bereich.
 * Deshalb sind Wert und Beschriftung hier überhaupt getrennt.
 */

/** Was beim Posten dasteht: „Für wen ist das?" */
export const AGE_LABELS: Record<AgeGroup, string> = {
  egal: 'Für alle',
  '14-17': '14–17',
  '18-25': '18–25',
  '26+': '26+',
};

/** Was im Feed-Filter dasteht: „Für wen suche ich?" */
export const AGE_FILTER_LABELS: Record<AgeGroup, string> = {
  egal: 'Alter egal',
  '14-17': '14–17',
  '18-25': '18–25',
  '26+': '26+',
};

/**
 * Die Reihenfolge in der Oberfläche — `egal` immer zuerst.
 *
 * Nicht alphabetisch und nicht nach Häufigkeit: `egal` ist die Voreinstellung, und
 * eine Voreinstellung, die man suchen muss, ist keine. Danach aufsteigend nach
 * Alter, weil jede andere Reihenfolge willkürlich wirkt.
 */
export const AGE_ORDER: readonly AgeGroup[] = ['egal', '14-17', '18-25', '26+'];

/** Dieselbe Reihe ohne `egal` — für ein Profil, das eine echte Person beschreibt. */
export const AGE_BAND_ORDER: readonly AgeBand[] = ['14-17', '18-25', '26+'];

/**
 * Was an einer Post-Karte steht — oder nichts.
 *
 * `null` bei `egal`, und das ist der Sinn der Funktion: Ein Post „für alle" ist der
 * Normalfall, und der Normalfall braucht keine Beschriftung. Stünde an jeder zweiten
 * Karte „Für alle", wäre die Angabe dort, wo sie wirklich etwas sagt („14–17"),
 * nicht mehr zu sehen — sie ginge im eigenen Rauschen unter.
 */
export function alterAmPost(gruppe: AgeGroup): string | null {
  return gruppe === 'egal' ? null : AGE_LABELS[gruppe];
}
