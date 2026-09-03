import type { IconName } from '@/theme/icons';
import type { ActivityCategory } from '@/types/models';

/**
 * Wie die sechs Kategorien heißen und aussehen — die WÖRTER, nicht die Farben.
 * (Die Farben stehen in `@/theme/colors`.)
 *
 * Seit Phase 14 ist der Marker ein gezeichnetes Icon aus `theme/icons.ts`, kein
 * Emoji mehr. Der Vorteil, den das Emoji nie hatte: Das Icon nimmt die Farbe der
 * Kategorie an. Vorher stand ein buntes Fremdbild auf einer farbigen Pille, jetzt
 * ist der Marker aus demselben Material wie alles daneben.
 *
 * Achtung, das sind KEINE sechs beliebigen Bildchen: Sie sind das Erkennungszeichen
 * der Kategorie. Wird eines unklar, ist die Kategorie unklar — nicht bloß hässlich
 * (PLAN.md, Phase 14).
 */
export interface CategoryMeta {
  label: string;
  icon: IconName;
  /** Beispiele — für den Erstellen-Screen, damit die Kategorie nicht abstrakt bleibt. */
  examples: string;
}

export const CATEGORIES: Record<ActivityCategory, CategoryMeta> = {
  sport: { label: 'Sport', icon: 'laufen', examples: 'Tennis, Laufen, Fußball, Bouldern' },
  food: { label: 'Essen', icon: 'tasse', examples: 'Kaffee, Mittagessen, Kochen' },
  study: { label: 'Lernen', icon: 'buch', examples: 'Schularbeit, Hausübung, Projektpartner' },
  culture: { label: 'Kultur', icon: 'ticket', examples: 'Kino, Konzert, Museum, Fortgehen' },
  outdoor: { label: 'Draußen', icon: 'baum', examples: 'Spazieren, Donauinsel, Picknick' },
  creative: { label: 'Kreativ', icon: 'pinsel', examples: 'Fotografieren, Musik, Zeichnen' },
};

/** Wie das Können-Niveau im Text auftaucht. `any` heißt bewusst "egal", nicht "Anfänger". */
export const LEVEL_LABELS = {
  any: 'Egal, wie gut',
  beginner: 'Anfänger',
  intermediate: 'Fortgeschritten',
  advanced: 'Sehr gut',
} as const;
