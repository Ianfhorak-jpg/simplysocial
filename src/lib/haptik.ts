/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DER TASTSINN — was die App spüren lässt · Web-Zweig (Phase 20.12)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Ians Satz am 2026-09-14: *„Inspiriere dich von Tinder und anderen Plattformen,
 * GAMIFICATION ist ein Keyword."* Beim Nachmessen fehlte der App **jeder** Tastsinn:
 * kein `expo-haptics`, keine Vibration, nirgends. Der Match-Moment — der emotionale
 * Höhepunkt, für den es einen eigenen Screen und Konfetti gibt — wurde stumm
 * gefeiert. Genau da vibriert Tinder.
 *
 * ── Was diese Datei ist ──────────────────────────────────────────────────────
 * **Der Web-Zweig, und der tut absichtlich NICHTS.** Die iOS-Fassung steht daneben
 * in `haptik.native.ts`.
 *
 * `expo-haptics` bringt selbst einen Web-Rückfall mit, der auf `navigator.vibrate`
 * setzt. Er ist hier trotzdem nicht importiert, und zwar aus zwei Gründen:
 *   1. **`navigator.vibrate` gibt es in Safari nicht** — weder auf dem Mac noch auf
 *      dem iPhone. Der Prototyp läuft im Browser; dort wäre es tote Fracht.
 *   2. Ein Paket, das auf Web nichts tut, gehört nicht ins Web-Bündel (harte
 *      Regel 52, dieselbe Begründung wie bei `SsGlas`).
 *
 * ── Warum die Funktionen trotzdem hier stehen und nicht wegfallen ────────────
 * Damit kein Aufrufer `Platform.OS` fragen muss. Wer etwas spürbar machen will,
 * ruft `haptik.schwelle()` — auf dem Gerät passiert etwas, im Browser nicht, und der
 * Screen merkt den Unterschied nicht. Dieselbe Bauart wie `merker.ts`.
 *
 * ── Warum BENANNTE Anlässe und nicht die Stärken von Apple ───────────────────
 * Die Funktionen heißen nach dem, was PASSIERT (`schwelle`, `match`, `zurueck`), nicht nach
 * dem, was sie auslösen (`impactLight`, `notificationSuccess`). Das ist derselbe
 * Gedanke wie bei `theme/druck.ts`: **Ein Gefühl gehört nicht dem Screen, sondern
 * dem Anlass.** Stünde im Wischstapel `Haptics.impactAsync(Light)`, wäre die
 * Entscheidung „wie stark fühlt sich ein Wisch an" dort gefallen — und beim
 * nächsten Ort, der wischt, noch einmal, vielleicht anders. So gibt es sie einmal.
 */

/**
 * Was die App spüren lassen kann — im Browser jeweils nichts.
 *
 * Die Beschreibungen stehen im NATIVE-Zweig, weil dort die Stärken gewählt werden.
 * Hier ist nur wichtig, dass es dieselben Namen sind.
 */
export const haptik = {
  /** Eine Karte ist weit genug gezogen — ab hier ZÄHLT der Wisch. */
  schwelle: () => {},
  /** Eine Karte ist zurückgeschnappt, weil nicht weit genug gezogen wurde. */
  zurueck: () => {},
  /** Der Match-Moment: aus einer Anfrage ist eine Verabredung geworden. */
  match: () => {},
  /** Etwas ist bestätigt worden — „Bin dabei" abgeschickt, Anfrage angenommen. */
  erfolg: () => {},
  /** Etwas ist schiefgegangen. */
  fehler: () => {},
};
