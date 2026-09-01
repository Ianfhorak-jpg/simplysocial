import type { ActivityCategory } from '@/types/models';

/**
 * Farben. Grundlage ist PLAN.md, Abschnitt 3 — mit zwei Änderungen von Ian
 * am 2026-08-31: Sport ist gelb statt grün, Essen grün statt Terrakotta.
 *
 * Aufbau: eine ruhige Grundfläche, die sich nie ändert, und darüber sechs kräftige
 * Aktivitätsfarben. Der Feed lebt von den Aktivitätsfarben — die Grundfläche hält sich
 * bewusst zurück, damit sie wirken können.
 */

/** Grundfläche — gilt in der ganzen App gleich. */
export const colors = {
  bg: '#FAF9F6', // Papierweiß, nicht Reinweiß: nimmt dem Screen die Härte
  surface: '#FFFFFF', // Karten heben sich dadurch vom Hintergrund ab, ganz ohne Schatten
  ink: '#17191C', // Text
  inkSoft: '#6B7280', // Sekundärtext
  line: '#E8E6E0', // Trennlinien
} as const;

/**
 * Eine Aktivitätsfarbe besteht aus vier Werten:
 *   base   — der Farbstreifen, gefüllte Buttons, farbiger Text auf hellem Grund
 *   soft   — Flächen hinter base (Kategorie-Pillen, Karten-Kopf)
 *   deep   — der Umriss und der 4px-Rand unten am Button, der die Tiefe macht
 *   onBase — die Textfarbe AUF base
 *   onSoft — die Textfarbe AUF soft
 *
 * Die beiden `on…`-Farben gibt es, seit Sport gelb ist. Vorher stand überall pauschal
 * weißer Text auf base und base als Text auf soft — mit Gelb ergab das 1,85:1, also
 * praktisch unlesbar. Statt das an jeder Stelle neu zu entscheiden, bringt jede Farbe
 * ihre passenden Textfarben gleich mit; dann kann man es beim nächsten Farbwunsch
 * nicht mehr vergessen.
 *
 * Alle Werte sind gemessen, nicht geschätzt (WCAG-Kontrastverhältnis):
 * onBase/onSoft erreichen mindestens 4,5:1, deep mindestens 2,0:1 gegen base —
 * darunter sieht man die Tiefe des Buttons nicht mehr.
 */
export interface CategoryPalette {
  base: string;
  soft: string;
  deep: string;
  onBase: string;
  onSoft: string;
}

export const categoryColors: Record<ActivityCategory, CategoryPalette> = {
  // Gelb — als einzige Farbe hell genug, dass der Text darauf dunkel sein muss.
  sport: { base: '#EDA803', soft: '#FDF2D8', deep: '#A47402', onBase: '#17191C', onSoft: '#916602' },
  food: { base: '#2E7D5B', soft: '#E6F2EC', deep: '#1B4A36', onBase: '#FFFFFF', onSoft: '#2D7958' },
  study: { base: '#3D6BC2', soft: '#E4EBF8', deep: '#243F72', onBase: '#FFFFFF', onSoft: '#3B68BC' },
  culture: { base: '#7B4FC2', soft: '#EDE6F8', deep: '#462D6F', onBase: '#FFFFFF', onSoft: '#7B4FC2' },
  outdoor: { base: '#6B8C28', soft: '#EEF4E0', deep: '#435819', onBase: '#FFFFFF', onSoft: '#5B7722' },
  creative: { base: '#C23D7B', soft: '#F8E4EF', deep: '#74254A', onBase: '#FFFFFF', onSoft: '#B63974' },
};

/**
 * Die Farbe für Aktionen, die zu keiner Kategorie gehören ("Bin dabei" im Detail,
 * "Posten"). Bewusst keine der sechs Kategoriefarben, sonst behauptet der Button
 * eine Kategorie, die er nicht meint.
 *
 * `base` ist bewusst NICHT reines Schwarz wie der Text (Ians Anmerkung vom 2026-08-31,
 * er hat den Schatten nicht gesehen): der Tiefen-Rand darunter ist schwarz, und zwischen
 * #17191C und #000000 liegt ein Kontrast von 1,15:1 — man sieht schlicht keinen
 * Unterschied, der Button hatte seine Tiefe verloren. #3E4043 ist der hellste Ton, der
 * noch klar als "dunkler Knopf" liest und gegen Schwarz auf 2,0:1 kommt.
 */
export const accent: CategoryPalette = {
  base: '#3E4043',
  soft: '#EFEEEA',
  deep: '#000000',
  onBase: '#FFFFFF',
  onSoft: '#3E4043',
};

/**
 * Rot — für Absagen, Blockieren, Melden. Aufgebaut wie jede andere Palette, damit der
 * Button-Baustein sie ohne Sonderfall verarbeiten kann.
 *
 * Gemessen wie alles andere: Weiß auf `base` 5,46:1 · `deep` gegen `base` 2,12:1 ·
 * `onSoft` auf Weiß 7,01:1. Der naheliegende Ton #7A1C18 als `deep` kam auf 1,92:1 —
 * unter der Grenze von 2,0, ab der man die Tiefe des Knopfes nicht mehr sieht.
 */
export const danger: CategoryPalette = {
  base: '#C2352F',
  soft: '#F8E5E4',
  deep: '#6E1916',
  onBase: '#FFFFFF',
  onSoft: '#A62B26',
};

/**
 * Zustandsfarben — sparsam einsetzen, sie sollen aus den Kategoriefarben herausstechen.
 *
 * Bewusst aus `danger` abgeleitet und nicht noch einmal hingeschrieben: dasselbe Rot an
 * zwei Stellen ist zwei Wahrheiten, und die laufen beim nächsten Farbwunsch auseinander.
 */
export const status = {
  danger: danger.base, // Zahl am Anfragen-Tab, Ablehnen, Blockieren, Melden
  dangerSoft: danger.soft,
} as const;

/** Die sechs Kategorien in der Reihenfolge, in der sie überall auftauchen sollen. */
export const CATEGORY_ORDER = [
  'sport',
  'food',
  'study',
  'culture',
  'outdoor',
  'creative',
] as const satisfies readonly ActivityCategory[];
