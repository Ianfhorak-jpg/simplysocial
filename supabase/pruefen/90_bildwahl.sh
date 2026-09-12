#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  DER PRÜFSTEIN VON PHASE 20.6-b — base64 → BYTES
#
#  Der Bildwähler am Gerät steht und fällt mit einer Umrechnung, die niemand
#  sieht: `expo-image-picker` gibt base64 zurück, `storage-js` verlangt auf React
#  Native ausdrücklich `ArrayBuffer` statt `Blob` — und dazwischen liegt
#  `lib/base64.ts`.
#
#  ── Warum das OHNE Gerät und OHNE Datenbank geht ────────────────────────────
#  `base64.ts` hat keinen einzigen Import. Nach `tsc` läuft sie in blankem Node,
#  also lässt sie sich hier gegen ECHTE Bilddateien halten statt gegen erfundene
#  Zeichenketten — dieselbe Bauart wie `40_uebersetzung.sh`, nur eine Stufe
#  billiger, weil kein Postgres nötig ist.
#
#  ── Warum echte Dateien und nicht "SGVsbG8=" ────────────────────────────────
#  Weil genau die erfundene Zeichenkette der Fehler wäre. Ein von Hand getippter
#  base64-Text ist kurz, sauber umgebrochen und hat eine Länge, die durch vier
#  teilbar ist. Ein JPEG aus einer Kamera ist zwei Millionen Zeichen lang und
#  enthält jedes Byte von 0x00 bis 0xFF — einschließlich der Nullen, an denen ein
#  „binary string"-Umweg auffliegt. Die Lehre aus Phase 20.1: Eine Attrappe, die
#  vom Original abweicht, prüft die Attrappe.
#
#  Aufruf: npm run pruef-bildwahl
# ═══════════════════════════════════════════════════════════════════════════════
set -e
HIER="$(cd "$(dirname "$0")" && pwd)"
WURZEL="$(cd "$HIER/../.." && pwd)"
ARBEIT="$(mktemp -d)"
trap 'rm -rf "$ARBEIT"' EXIT

echo ''
echo '════ PHASE 20.6-b — der Bildwähler am Gerät ════════════════════════════'
echo '── `lib/base64.ts` nach JS bringen ──────────────────────────────────────'

cat > "$ARBEIT/tsconfig.json" <<JSON
{
  "compilerOptions": {
    "target": "es2022", "module": "es2022", "moduleResolution": "bundler",
    "strict": true, "skipLibCheck": true, "outDir": "$ARBEIT/js",
    "rootDir": "$WURZEL/src", "verbatimModuleSyntax": false,
    "paths": { "@/*": ["$WURZEL/src/*"] }
  },
  "files": [
    "$WURZEL/src/lib/base64.ts",
    "$WURZEL/src/features/social/bild.ts"
  ]
}
JSON
(cd "$WURZEL" && npx tsc -p "$ARBEIT/tsconfig.json")
for f in "$ARBEIT"/js/lib/*.js "$ARBEIT"/js/features/*/*.js; do mv "$f" "${f%.js}.mjs"; done

# ── Der Wächter: steht im erzeugten JS wirklich kein Import? ────────────────
# Ohne ihn wäre „läuft in blankem Node" eine Behauptung. Zieht `base64.ts` eines
# Tages doch etwas herein, sagt es diese Zeile — und nicht ein Absturz am Gerät.
if grep -qE "^(import|export .* from|require\()" "$ARBEIT/js/lib/base64.mjs"; then
  echo "✗ `lib/base64.ts` hat einen Laufzeit-Import bekommen — dann prüft dieser Stand nichts mehr."
  grep -nE "^(import|export .* from|require\()" "$ARBEIT/js/lib/base64.mjs"
  exit 1
fi
echo '✓ `base64.mjs` hat keinen Laufzeit-Import — läuft in blankem Node'

echo ''
echo '── Und jetzt gegen echte Bilddateien ────────────────────────────────────'
ARBEIT="$ARBEIT" WURZEL="$WURZEL" node "$HIER/90_bildwahl.mjs"
