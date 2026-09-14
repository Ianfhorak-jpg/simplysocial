#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  DIE APP-SEITE DES DEMO-ZUGANGS — Phase 21.5.  Aufruf: npm run pruef-demoregel
#
#  Braucht KEINEN Server, KEINE Datenbank und KEIN Gerät. Das Gegenstück dazu ist
#  `92_demo.sh`, das die Datenbank misst.
#
#  ── Warum der Arbeitsordner IM Projekt liegt ────────────────────────────────
#  `konten.ts` hat einen Laufzeit-Import: Der Standardwert `sb = client()` zieht
#  `lib/supabase.ts` und damit `@supabase/supabase-js` mit. Von einem `mktemp -d`
#  aus findet Node das Paket nicht. Der Ausweg ist derselbe wie in `60_konto.sh`
#  — ein git-ignorierter Ordner **im** Projekt (`.pruef-*` steht in `.gitignore`)
#  — und ausdrücklich NICHT eine Attrappe für `client()`: Die würde geladen
#  statt des echten Moduls, und dann prüfte der Lauf die Attrappe.
#
#  **Die Attrappe in der .mjs ist etwas anderes** und sie ist erlaubt: Sie wird
#  als Argument übergeben, ersetzt kein Modul, und ihre Aufgabe ist es, gerufen
#  zu WERDEN — oder eben nicht. Sie ist der Zeuge, nicht der Prüfling.
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail
HIER="$(cd "$(dirname "$0")" && pwd)"
WURZEL="$(cd "$HIER/../.." && pwd)"
ARBEIT="$WURZEL/.pruef-demoregel"

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
    "$WURZEL/src/lib/handle.ts"
  ]
}
JSON

echo '── 1. Nach JS bringen ───────────────────────────────────────────────────'
(cd "$WURZEL" && npx tsc -p "$ARBEIT/tsconfig.json") || { echo "✗ tsc"; exit 1; }

# Dieselben zwei Umschreibungen wie in `60_konto.sh`, und aus denselben Gründen:
# die `@/`-Aliase auf relative Pfade, und die `.js`-Endung an jeden relativen
# Import (tsc schreibt sie nicht, blankes Node besteht darauf).
find "$ARBEIT/js" -name '*.js' -exec sed -i '' \
  -e "s#'@/lib/supabase'#'../../lib/supabase.js'#g" \
  -e "s#'@/lib/sitzungsspeicher'#'./sitzungsspeicher.js'#g" \
  -e "s#'@/lib/bezirk'#'../../lib/bezirk.js'#g" \
  -e "s#'@/config/alter'#'../../config/alter.js'#g" \
  -e "s#'@/data/wien-bezirke'#'../data/wien-bezirke.js'#g" \
  -e "s#'@/features/auth/anmeldung'#'../features/auth/anmeldung.js'#g" {} +
find "$ARBEIT/js" -name '*.js' -exec sed -i '' -E \
  "s#from '(\.\.?/[^']*[^.js'])';#from '\1.js';#g" {} +

# Der Wächter aus `70_schreiben.sh`: Gefragt wird, was wirklich GELADEN wird.
# Ein übrig gebliebener Alias stirbt sonst als nacktes `ERR_MODULE_NOT_FOUND`
# tief in einem Stapelauszug und sieht nach kaputtem Node aus.
for DATEI in features/auth/anmeldung features/auth/demo features/auth/konto \
             features/auth/konten lib/supabase; do
  if grep -qE "from '@/" "$ARBEIT/js/$DATEI.js"; then
    echo "✗ In $DATEI.js steht noch ein @/-Alias, den Node nicht kennt:"
    grep -nE "from '@/" "$ARBEIT/js/$DATEI.js"
    exit 1
  fi
done
# Ohne diese Zeile meldet Node bei jedem Lauf MODULE_TYPELESS_PACKAGE_JSON —
# harmlos, aber Rauschen, und Rauschen verdeckt beim nächsten Mal einen Befund.
echo '{"type":"module"}' > "$ARBEIT/js/package.json"
echo "  ✓ demo.js und konten.js laufen in blankem Node"

echo
echo '── 2. Messen ────────────────────────────────────────────────────────────'
# `.env` wird bewusst NICHT geladen: Diese Prüfung fasst kein Netz an, und ein
# Lauf, der ohne Zugangsdaten nicht durchgeht, wäre ein Lauf, der heimlich doch
# eines braucht.
ARBEIT="$ARBEIT" node "$HIER/93_demoregel.mjs"
