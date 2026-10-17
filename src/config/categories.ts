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
/**
 * Die Wörterbuch-Schlüssel der Kategorien — **eigene Unions, ohne Import.**
 * Dieselbe Bauart wie bei `anmeldeFolgen()`; `t(meta.labelKey)` am Aufruf prüft sie.
 */
type KategorieSchluessel =
  | 'kategorie.sport'
  | 'kategorie.essen'
  | 'kategorie.lernen'
  | 'kategorie.kultur'
  | 'kategorie.draussen'
  | 'kategorie.kreativ';

export interface CategoryMeta {
  /**
   * Der Schlüssel zum Namen, **nicht der Name**.
   *
   * 🔴 **Warum kein `t()` hier:** `CATEGORIES` unten ist eine MODULWEITE
   * Konstante. Sie wird einmal ausgewertet, wenn die Datei geladen wird — ein
   * `t()` darin hielte für immer die Sprache, die beim App-Start galt. Genau das
   * ist in ACTA passiert (`i18n/README.md`, zweite Regel), und es ist der Fehler,
   * den man nur beim Umschalten sieht: Alles wechselt, die Kategorien nicht.
   * Übersetzt wird deshalb beim ZEICHNEN, über `t(CATEGORIES[k].labelKey)`.
   */
  labelKey: KategorieSchluessel;
  icon: IconName;
}

export const CATEGORIES: Record<ActivityCategory, CategoryMeta> = {
  sport: { labelKey: 'kategorie.sport', icon: 'laufen' },
  food: { labelKey: 'kategorie.essen', icon: 'tasse' },
  study: { labelKey: 'kategorie.lernen', icon: 'buch' },
  culture: { labelKey: 'kategorie.kultur', icon: 'ticket' },
  outdoor: { labelKey: 'kategorie.draussen', icon: 'baum' },
  creative: { labelKey: 'kategorie.kreativ', icon: 'pinsel' },
};

/**
 * Wie das Können-Niveau im Text auftaucht. `any` heißt bewusst „egal", nicht
 * „Anfänger".
 *
 * ⚠️ **Schlüssel, keine Texte** — aus demselben Grund wie bei `CATEGORIES`
 * darüber: eine modulweite Konstante friert die Startsprache ein.
 */
export const LEVEL_LABELS = {
  any: 'niveau.egal',
  beginner: 'niveau.anfaenger',
  intermediate: 'niveau.fortgeschritten',
  advanced: 'niveau.sehrGut',
} as const;
