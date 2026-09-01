import { Platform, type TextStyle } from 'react-native';

/**
 * Typografie.
 *
 * ── Die ACTA-Falle ────────────────────────────────────────────────────────────
 * iOS schneidet bei großen Schriftgraden die Oberlängen ab, wenn `lineHeight`
 * kleiner als etwa das 1,2-fache der Schriftgröße ist. Deshalb wird `lineHeight`
 * hier NIE weggelassen und nie unter 1,2 gesetzt. `leading()` erzwingt das.
 *
 * Fließtext bekommt bewusst MEHR als 1,2 (nämlich 1,4): 1,2 ist die Untergrenze
 * gegen das Clipping, nicht der Wert, bei dem sich ein Absatz gut liest.
 */

const MIN_LEADING = 1.2;

/** Zeilenhöhe aus Schriftgröße — nie unter dem Faktor 1,2 (siehe oben). */
export const leading = (size: number, factor = MIN_LEADING) =>
  Math.round(size * Math.max(factor, MIN_LEADING));

/**
 * Schriftfamilien an EINER Stelle. Im Prototyp die Systemschriften — die sind auf
 * jedem Gerät sofort da und flackern nicht nach. Wenn in Phase 1 eine echte
 * Display-Schrift dazukommt, wird nur dieses Objekt getauscht.
 */
export const fonts = {
  display: Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  }),
  body: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  }),
} as const;

/**
 * Die Stufen. Mehr braucht der Prototyp nicht — je weniger Stufen, desto
 * einheitlicher wirken 9 Screens.
 */
export const type = {
  /** Der Match-Moment, leere Zustände — das Größte, was die App zeigt. */
  display: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: leading(34),
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  /** Bildschirm-Überschriften. */
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: leading(26),
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  /** Der Titel auf einer Post-Karte. */
  heading: {
    fontFamily: fonts.display,
    fontSize: 19,
    lineHeight: leading(19, 1.3),
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  /** Fließtext, Notizen, Chat-Nachrichten. */
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: leading(16, 1.4),
    fontWeight: '400',
  },
  /** Fließtext, wenn er etwas hervorheben soll. */
  bodyStrong: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: leading(16, 1.4),
    fontWeight: '700',
  },
  /** Button-Beschriftung, Kategorie-Pillen. */
  label: {
    fontFamily: fonts.display,
    fontSize: 15,
    lineHeight: leading(15, 1.3),
    fontWeight: '700',
  },
  /** Uhrzeit, Bezirk, "vor 2 Std." */
  caption: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: leading(13, 1.35),
    fontWeight: '500',
  },
} as const satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;
