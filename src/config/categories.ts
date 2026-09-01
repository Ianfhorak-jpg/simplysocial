import type { ActivityCategory } from '@/types/models';

/**
 * Wie die sechs Kategorien heißen und aussehen — die WÖRTER, nicht die Farben.
 * (Die Farben stehen in `@/theme/colors`.)
 *
 * Das Emoji ist im Prototyp der Kategorie-Marker. Es braucht keine Bilddateien,
 * rendert auf Web und iOS identisch und lässt sich später gegen echte Icons tauschen,
 * ohne dass ein Screen sich ändert.
 */
export interface CategoryMeta {
  label: string;
  emoji: string;
  /** Beispiele — für den Erstellen-Screen, damit die Kategorie nicht abstrakt bleibt. */
  examples: string;
}

export const CATEGORIES: Record<ActivityCategory, CategoryMeta> = {
  sport: { label: 'Sport', emoji: '🏃', examples: 'Tennis, Laufen, Fußball, Bouldern' },
  food: { label: 'Essen', emoji: '☕', examples: 'Kaffee, Mittagessen, Kochen' },
  study: { label: 'Lernen', emoji: '📚', examples: 'Schularbeit, Hausübung, Projektpartner' },
  culture: { label: 'Kultur', emoji: '🎬', examples: 'Kino, Konzert, Museum, Fortgehen' },
  outdoor: { label: 'Draußen', emoji: '🌳', examples: 'Spazieren, Donauinsel, Picknick' },
  creative: { label: 'Kreativ', emoji: '🎨', examples: 'Fotografieren, Musik, Zeichnen' },
};

/** Wie das Können-Niveau im Text auftaucht. `any` heißt bewusst "egal", nicht "Anfänger". */
export const LEVEL_LABELS = {
  any: 'Egal, wie gut',
  beginner: 'Anfänger',
  intermediate: 'Fortgeschritten',
  advanced: 'Sehr gut',
} as const;
