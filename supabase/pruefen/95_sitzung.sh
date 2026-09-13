#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  DER PRÜFSTEIN VON PHASE 20.3-b2 — die GETEILTE Sitzung (Ians Entscheidung 55)
#
#  Aufruf: npm run pruef-sitzung
#
#  ── Warum das OHNE Gerät und OHNE Datenbank geht ────────────────────────────
#  `features/auth/sitzungsspeicher.ts` importiert nur Typen. Nach `tsc` bleibt in
#  der .js-Datei kein einziger Import übrig, also läuft sie in blankem Node —
#  dieselbe Bauart wie `lib/base64.ts` (90) und `data/zeilen.ts` (40).
#
#  **Und das ist hier mehr als eine Bequemlichkeit.** Die Regel entscheidet, was
#  auf einem iPhone in den Schlüsselbund geht. Läge sie in derselben Datei wie
#  `expo-secure-store`, wäre sie nur am Gerät prüfbar — also genau dort, wo man
#  nicht danebensteht und wo iOS bei Ablehnung eine nackte Zahl meldet.
#
#  ── Was er NICHT leistet, und das gehört ausgesprochen ──────────────────────
#  Ob der iOS-Schlüsselbund die 14 Byte wirklich annimmt und ob sie einen
#  Neustart überleben, kann kein Mac beantworten. Geprüft ist hier die REGEL:
#  was wohin geht, dass der Dauerschlüssel die Datei verlässt, und dass eine
#  halbe Sitzung als abgemeldet gilt. Der Rest gehört in den Gerätedurchgang.
# ═══════════════════════════════════════════════════════════════════════════════
set -e
HIER="$(cd "$(dirname "$0")" && pwd)"
WURZEL="$(cd "$HIER/../.." && pwd)"
ARBEIT="$(mktemp -d)"
trap 'rm -rf "$ARBEIT"' EXIT

echo ''
echo '════ PHASE 20.3-b2 — die geteilte Sitzung ══════════════════════════════'
echo '── `features/auth/sitzungsspeicher.ts` nach JS bringen ──────────────────'

cat > "$ARBEIT/tsconfig.json" <<JSON
{
  "compilerOptions": {
    "target": "es2022", "module": "es2022", "moduleResolution": "bundler",
    "strict": true, "skipLibCheck": true, "outDir": "$ARBEIT/js",
    "rootDir": "$WURZEL/src", "verbatimModuleSyntax": false,
    "paths": { "@/*": ["$WURZEL/src/*"] }
  },
  "files": [ "$WURZEL/src/features/auth/sitzungsspeicher.ts" ]
}
JSON
(cd "$WURZEL" && npx tsc -p "$ARBEIT/tsconfig.json")
for f in "$ARBEIT"/js/features/*/*.js; do mv "$f" "${f%.js}.mjs"; done

# ── Der Wächter: steht im erzeugten JS wirklich kein Import? ────────────────
# Ohne ihn wäre "läuft in blankem Node" eine Behauptung. Zieht die Regel-Datei
# eines Tages doch einen Baustein herein, sagt es diese Zeile — und nicht ein
# Absturz auf einem fremden iPhone.
if grep -qE "^(import|export .* from|require\()" "$ARBEIT/js/features/auth/sitzungsspeicher.mjs"; then
  echo '✗ sitzungsspeicher.ts hat einen Laufzeit-Import bekommen — dann prüft dieser Stand nichts mehr.'
  grep -nE "^(import|export .* from|require\()" "$ARBEIT/js/features/auth/sitzungsspeicher.mjs"
  exit 1
fi
echo '✓ sitzungsspeicher.mjs hat keinen Laufzeit-Import — läuft in blankem Node'

echo ''
ARBEIT="$ARBEIT" node "$HIER/95_sitzung.mjs"
