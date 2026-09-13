/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DER SITZUNGSSPEICHER — Web-Zweig (Phase 20.3-b2)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Im Browser gibt es nichts zu tun: `auth-js` findet `localStorage` selbst, und
 * seit 20.3-b1 überlebt die Sitzung dort das Neuladen. `undefined` heißt
 * ausdrücklich **„such dir deinen Speicher selbst"** und nicht „kein Speicher" —
 * die zwei sind bei `createClient` nicht dasselbe.
 *
 * ── Warum Plattform-ENDUNG und kein `Platform.OS`-Zweig ─────────────────────
 * Dieselbe Begründung wie bei `SsGlas` (harte Regel 61) und `SsKarte` (52):
 * `expo-secure-store` und `AsyncStorage` werden beim LADEN nativ. Ein Zweig in
 * EINER Datei zöge beide ins Web-Bündel, wo es keinen Schlüsselbund gibt.
 */
export function sitzungsSpeicher(): undefined {
  return undefined;
}
