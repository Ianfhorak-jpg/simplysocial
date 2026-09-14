#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  DIE ZUSTIMMUNG ZU DEN NUTZUNGSBEDINGUNGEN — Phase 21.2, Ians Entscheidung 80.
#  Aufruf: npm run pruef-zustimmung
#
#  Braucht KEINEN Server, KEINE Datenbank und KEIN Gerät.
#
#  ── Was hier bewacht wird und warum es keine Formalie ist ──────────────────
#  Apple Guideline 1.2 verlangt bei nutzergenerierten Inhalten eine Zustimmung.
#  Drei Zusagen hängen daran, und alle drei können still brechen:
#
#    1. **Ohne Häkchen entsteht kein Konto.** Der Riegel sitzt in
#       `profilAnlegen()`, nicht im Bildschirm — geprüft mit einer Attrappe als
#       ZEUGEN, genau wie in `93_demoregel.mjs`: Wird sie gerufen, ist der Riegel
#       gebrochen, und das ist eine Tatsache über den echten Code.
#    2. **Das Häkchen ist nicht vorab gesetzt.** Ein vorangekreuztes Kästchen ist
#       nach DSGVO keine Einwilligung. Es bricht mit EINEM Zeichen (`useState(true)`).
#    3. **In der eingereichten App steht nirgends „Prototyp".** Apple weist Apps
#       zurück, die sich als Beta oder Testfassung ausgeben — und der Satz stand
#       bis zum 2026-09-14 fest im JSX der Nutzungsbedingungen.
#
#  ── Warum der Arbeitsordner IM Projekt liegt ────────────────────────────────
#  Wie in `93_demoregel.sh`: `konten.ts` hat einen Laufzeit-Import (`sb = client()`
#  zieht `@supabase/supabase-js`), und von einem `mktemp -d` aus findet Node das
#  Paket nicht. `.pruef-*` steht in `.gitignore`.
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail
HIER="$(cd "$(dirname "$0")" && pwd)"
WURZEL="$(cd "$HIER/../.." && pwd)"
ARBEIT="$WURZEL/.pruef-zustimmung"

rm -rf "$ARBEIT"; mkdir -p "$ARBEIT"
cat > "$ARBEIT/tsconfig.json" <<JSON
{
  "compilerOptions": {
    "target": "es2022", "module": "es2022", "moduleResolution": "bundler",
    "strict": true, "skipLibCheck": true, "outDir": "$ARBEIT/js",
    "rootDir": "$WURZEL/src", "verbatimModuleSyntax": false,
    "paths": { "@/*": ["$WURZEL/src/*"] },
    "types": ["node"],
    "typeRoots": ["$WURZEL/node_modules/@types"]
  },
  "files": [
    "$WURZEL/src/features/auth/anmeldung.ts",
    "$WURZEL/src/features/auth/demo.ts",
    "$WURZEL/src/features/auth/konto.ts",
    "$WURZEL/src/features/auth/konten.ts",
    "$WURZEL/src/features/auth/zustimmung.ts",
    "$WURZEL/src/lib/handle.ts"
  ]
}
JSON

echo '── 1. Nach JS bringen ───────────────────────────────────────────────────'
(cd "$WURZEL" && npx tsc -p "$ARBEIT/tsconfig.json") || { echo "✗ tsc"; exit 1; }

# Dieselben Umschreibungen wie in `60_konto.sh` und `93_demoregel.sh`, aus
# denselben Gründen: die `@/`-Aliase auf relative Pfade, und die `.js`-Endung an
# jeden relativen Import (tsc schreibt sie nicht, blankes Node besteht darauf).
find "$ARBEIT/js" -name '*.js' -exec sed -i '' \
  -e "s#'@/lib/supabase'#'../../lib/supabase.js'#g" \
  -e "s#'@/lib/sitzungsspeicher'#'./sitzungsspeicher.js'#g" \
  -e "s#'@/lib/bezirk'#'../../lib/bezirk.js'#g" \
  -e "s#'@/config/alter'#'../../config/alter.js'#g" \
  -e "s#'@/data/wien-bezirke'#'../data/wien-bezirke.js'#g" \
  -e "s#'@/features/auth/anmeldung'#'../features/auth/anmeldung.js'#g" {} +
find "$ARBEIT/js" -name '*.js' -exec sed -i '' -E \
  "s#from '(\.\.?/[^']*[^.js'])';#from '\1.js';#g" {} +

# Der Alias-Wächter. Ohne ihn stirbt ein übrig gebliebener Alias als nacktes
# `ERR_MODULE_NOT_FOUND` und sieht nach kaputtem Node aus.
for DATEI in features/auth/anmeldung features/auth/demo features/auth/konto \
             features/auth/konten features/auth/zustimmung lib/supabase; do
  if grep -qE "from '@/" "$ARBEIT/js/$DATEI.js"; then
    echo "✗ In $DATEI.js steht noch ein @/-Alias, den Node nicht kennt:"
    grep -nE "from '@/" "$ARBEIT/js/$DATEI.js"
    exit 1
  fi
done
echo '{"type":"module"}' > "$ARBEIT/js/package.json"
echo "  ✓ zustimmung.js und konten.js laufen in blankem Node"

echo
echo '── 2. Messen ────────────────────────────────────────────────────────────'
# Kein `.env`: Diese Prüfung fasst kein Netz an, und ein Lauf, der ohne
# Zugangsdaten nicht durchginge, wäre ein Lauf, der heimlich doch eines braucht.
ARBEIT="$ARBEIT" WURZEL="$WURZEL" node "$HIER/95_zustimmung.mjs"
