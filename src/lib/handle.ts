/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WIE EIN @-NAME DASTEHT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Das Gegenstück zu `ortText()` in `lib/bezirk.ts`, und aus demselben Grund eine
 * eigene Datei: **Diese Datei hat keine Importe.** Damit läuft sie in blankem
 * Node, und `scripts/meldungen.sh` liest dieselbe Funktion, die auch die App
 * benutzt, statt ein `'@' + handle` daneben.
 *
 * `handleVorschlag()` in `features/auth/konto.ts` sagt, was GESPEICHERT wird
 * (`'ian'`); diese Datei sagt, was DASTEHT (`'@ian'`).
 */

/**
 * Der @-Name, wie ein Mensch ihn SIEHT — `'ian'` → `'@ian'`.
 *
 * ── Warum das eine Funktion ist und kein `@{person.handle}` im Screen ────────
 * **Gemessen am 2026-09-13, und der Fehler war schon da:** Zehn Screens zeichnen
 * `{person.handle}` roh. In `mock.ts` und in den lokalen Prüfdaten stand das `@`
 * IM WERT (`'@ian'`), also sah der Prototyp vier Wochen lang richtig aus —
 * `handleVorschlag()` gibt aber `'ian'` zurück (von `60_konto.mjs` am echten
 * Server gemessen), und genau das schreibt `profilAnlegen()` in die Spalte. Mit
 * `ANMELDE_QUELLE = 'supabase'` hätten alle zehn Stellen den @-Namen ohne `@`
 * gezeigt: im Profil, im Chat-Kopf, im Post-Detail, im Anfragen-Tab und in der
 * Löschbestätigung. **`tsc` sagt dazu nichts — beides ist `string`.**
 *
 * Dieselbe Bauart und derselbe Grund wie `ortText()` (harte Regel 20): Der
 * Unterschied zwischen dem, was gespeichert ist, und dem, was dasteht, gehört an
 * EINE Stelle. Zehn getippte `@` sind zehn Gelegenheiten zu driften — und es
 * driftet nicht auffällig, sondern still.
 *
 * ── Und warum das `@` NICHT in die Spalte gehört ─────────────────────────────
 * `handle` ist `unique`. Ein Zeichen, das jeder Wert trägt, unterscheidet nichts —
 * es macht nur `'@ian'` und `'ian'` zu zwei verschiedenen Namen, und damit wäre
 * jede Anmeldung, die es vergisst, ein zweites Konto mit demselben Namen.
 */

export function handleText(handle: string): string {
  // Nachsichtig gegenüber dem, was schon dasteht: Sollte irgendwo doch ein Wert
  // MIT `@` liegen (alte Zeile, von Hand eingespielte Prüfdaten), wird daraus kein
  // `@@ian`. Das ist keine Schlamperei, sondern der Unterschied zwischen einer
  // Anzeige und einer Prüfung — ob der Wert sauber ist, misst `60_konto.mjs`.
  return handle.startsWith('@') ? handle : `@${handle}`;
}
