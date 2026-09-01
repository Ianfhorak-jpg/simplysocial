/**
 * Die EINZIGE Stelle, an der der Produktname steht.
 * Harte Regel aus CLAUDE.md — kein Screen tippt "SimplySocial" selbst.
 * Wenn der Name sich ändert oder das Logo vom Freund kommt: nur hier anfassen.
 */
export const BRAND = {
  name: 'SimplySocial',

  /** Kurzer Claim für Kopfzeile, Landing-Page und App-Store-Untertitel. */
  claim: 'Finde Leute, die jetzt Lust haben.',

  /** Ein Satz, der erklärt, was die App ist — für leere Zustände und Onboarding. */
  pitch: 'Poste, was du vorhast. Wer mitmachen will, meldet sich. Du entscheidest, wer dabei ist.',

  /**
   * Platzhalter-Wortmarke, bis das echte Logo da ist (siehe _FUER_IAN/OFFENE_SACHEN.md).
   * Zweigeteilt, damit die Wortmarke zweifarbig gesetzt werden kann: "Simply" + "Social".
   */
  wordmark: { first: 'Simply', second: 'Social' },

  /** Die Stadt, für die v1 gebaut ist. Steht im Feed-Header und in leeren Zuständen. */
  city: 'Wien',
} as const;
