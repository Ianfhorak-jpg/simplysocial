/**
 * Abstände und Radien. Alles ist ein Vielfaches von 4 — dadurch rasten Abstände
 * automatisch aufeinander ein, ohne dass man je nachmisst.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

/**
 * Die Signatur der App (PLAN.md, Abschnitt 3): der harte Rand unten am Button.
 * Beim Drücken wandert der Button um genau diesen Betrag nach unten und der Rand
 * verschwindet — dadurch wirkt er körperlich heruntergedrückt statt nur eingefärbt.
 * Als Konstante, damit Versatz und Randstärke nie auseinanderlaufen.
 */
export const DEPTH = 4;

/** Breite, ab der der Inhalt im Browser nicht weiter mitwächst — sonst zerreißt es das Handy-Layout am Desktop. */
export const MAX_CONTENT_WIDTH = 520;
