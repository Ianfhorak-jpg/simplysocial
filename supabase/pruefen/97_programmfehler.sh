#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  DER PRÜFSTEIN VON PHASE 20.9 — Ians Entscheidung 71
#
#  Aufruf: npm run pruef-programmfehler
#
#  ── Warum es diesen Prüfstand überhaupt gibt ────────────────────────────────
#  Am 2026-09-13 früh ist aufgefallen, dass Ians Entscheidung 55 von KEINER
#  Prüfung bewacht war: Die verworfene Möglichkeit bestand alle 24 Häkchen, also
#  hätte die nächste „Vereinfachung" sie still zurückgenommen. Entscheidung 71
#  wäre derselbe Fall — sie besteht aus drei `if`-Zweigen, die man löschen kann,
#  ohne dass irgendetwas rot wird. Danach fiele ein Programmfehler wieder in den
#  Rückfall und behauptete „meistens liegt es am Netz".
#
#  ── Warum das OHNE Gerät, OHNE Browser und OHNE Datenbank geht ──────────────
#  `lib/programmfehler.ts` ist importfrei, `data/schreiben.ts` importiert nur
#  sie, und `data/quelle.ts` zusätzlich einen TYP. Nach `tsc` bleibt genau ein
#  Laufzeit-Import übrig, und der wird unten umgeschrieben — dieselbe Bauart wie
#  `40_uebersetzung.sh` und `95_sitzung.sh`.
#
#  ── Was er NICHT leistet, und das gehört ausgesprochen ──────────────────────
#  Ob die Leiste am GERÄT wirklich erscheint, hängt an der Verdrahtung in
#  `features/store.ts` — und die zieht React und `supabase-js` herein, läuft also
#  in keinem Node. Geprüft ist hier die REGEL: was dasteht, wenn der Zustand
#  gesetzt ist. Dass er gesetzt WIRD, gehört in den Gerätedurchgang.
# ═══════════════════════════════════════════════════════════════════════════════
set -e
HIER="$(cd "$(dirname "$0")" && pwd)"
WURZEL="$(cd "$HIER/../.." && pwd)"
ARBEIT="$(mktemp -d)"
trap 'rm -rf "$ARBEIT"' EXIT

# Baut die drei Regel-Dateien aus $2 nach $1/js und macht .mjs daraus.
#
# ⚠️ Die GEGENPROBE baut aus einer Kopie, und die liegt deshalb INNERHALB des
# Projekts (`.pruef-programmfehler/`, git-ignoriert wie `.pruef-konto/`): In
# `/tmp` gibt es kein `node_modules`, der Bau scheiterte dort an
# `@supabase/supabase-js` (den `laden.ts` als Typ zieht) — und das SIEHT AUS wie
# ein Erfolg der Gegenprobe, denn sie fällt ja durch. **Eine Gegenprobe, die aus
# dem falschen Grund rot ist, belegt gar nichts.** (`baseUrl` + `paths` wären der
# andere Weg und sind seit TS 7 abgeschafft.)
bauen() {
  local ZIEL="$1"
  cat > "$ZIEL/tsconfig.json" <<JSON
{
  "compilerOptions": {
    "target": "es2022", "module": "es2022", "moduleResolution": "bundler",
    "strict": true, "skipLibCheck": true, "outDir": "$ZIEL/js",
    "rootDir": "$2", "verbatimModuleSyntax": false,
    "paths": { "@/*": ["$2/*"] },
    "types": ["node"],
    "typeRoots": ["$WURZEL/node_modules/@types"]
  },
  "files": [
    "$2/lib/programmfehler.ts",
    "$2/data/schreiben.ts",
    "$2/data/quelle.ts"
  ]
}
JSON
  (cd "$WURZEL" && npx tsc -p "$ZIEL/tsconfig.json")
  # `@/lib/programmfehler` steht in beiden Regel-Dateien als echter Import (die
  # Konstanten sind Werte, keine Typen) und muss auf den Pfad zeigen, den Node
  # kennt. `@/data/laden` ist ein reiner Typ-Import und nach tsc weg.
  sed -i '' "s#'@/lib/programmfehler'#'../lib/programmfehler.mjs'#g" "$ZIEL"/js/data/*.js
  for f in "$ZIEL"/js/*/*.js; do mv "$f" "${f%.js}.mjs"; done
  # ── Der Wächter, und er fragt GENAU DREI Dateien ──────────────────────────
  # Bleibt in einer davon ein `@/` stehen, findet Node sie nicht und der Lauf
  # stirbt mit ERR_MODULE_NOT_FOUND — einer Meldung, die nach kaputtem Prüfstand
  # aussieht statt nach einem neuen Import (die 20.7-Lehre).
  #
  # **Gefragt werden aber nur die drei, die wirklich GELADEN werden.** Der erste
  # Entwurf fragte `js/*/*.mjs` und schlug sofort an: `store.mjs`, `mock.mjs`,
  # `karte-geo.mjs` und neun weitere werden mitgebaut, weil `quelle.ts` über
  # `import type { LadeFehler }` bis `laden.ts` und von dort weiter reicht — und
  # tsc TYPPRÜFT alles, was es erreicht. Geladen wird davon nichts, denn ein
  # Typ-Import erzeugt keine Abhängigkeit. Dieselbe Verengung und dieselbe
  # Begründung wie in `70_schreiben.sh`, und ich bin trotzdem hineingelaufen.
  for DATEI in lib/programmfehler data/schreiben data/quelle; do
    if grep -qE "from '@/" "$ZIEL/js/$DATEI.mjs"; then
      echo "✗ In $DATEI.mjs steht noch ein @/-Alias, den Node nicht kennt:"
      grep -nE "from '@/" "$ZIEL/js/$DATEI.mjs"
      exit 1
    fi
  done
}

echo ''
echo '════ PHASE 20.9 — der Programmfehler hat einen Ort (Entscheidung 71) ═══'
echo '── Die drei Regel-Dateien nach JS bringen ──────────────────────────────'
bauen "$ARBEIT" "$WURZEL/src"
echo '✓ programmfehler.mjs, schreiben.mjs und quelle.mjs laufen in blankem Node'

ARBEIT="$ARBEIT" node "$HIER/97_programmfehler.mjs"

# ═══════════════════════════════════════════════════════════════════════════════
#  DIE GEGENPROBE — ist der Prüfstand überhaupt scharf?
# ═══════════════════════════════════════════════════════════════════════════════
#  Gebaut wird eine KOPIE der Quelle, aus der die drei Zweige entfernt sind — also
#  genau der Zustand von vor Phase 20.9. Das Repo wird dabei nicht angefasst
#  (dieselbe Technik wie das Erzwingen beider Schalterstellungen in 96).
#
#  Ohne diesen Block wäre ein grüner Lauf ohne Aussage: Er würde belegen, dass die
#  Sätze dastehen, aber nicht, dass sie OHNE die Zweige fehlten.
echo '── Gegenprobe: dieselbe Messung ohne Ians Zweige ───────────────────────'
KOPIE="$WURZEL/.pruef-programmfehler"
rm -rf "$KOPIE"
mkdir -p "$KOPIE"
trap 'rm -rf "$ARBEIT" "$KOPIE"' EXIT
cp -R "$WURZEL/src" "$KOPIE/src"
# Den Zweig in allen drei Funktionen unwirksam machen — nicht löschen, sondern auf
# `false` stellen: Das hält die Importe heil und ändert AUSSCHLIESSLICH die Regel.
sed -i '' 's#if (istProgrammFehler(fehler.code))#if (false \&\& istProgrammFehler(fehler.code))#g' \
  "$KOPIE/src/data/schreiben.ts" "$KOPIE/src/data/quelle.ts"
TREFFER=$(grep -c "false && istProgrammFehler" "$KOPIE/src/data/schreiben.ts" "$KOPIE/src/data/quelle.ts" | awk -F: '{s+=$2} END {print s}')
if [ "$TREFFER" != "3" ]; then
  echo "✗ Die Gegenprobe hat $TREFFER statt 3 Zweige getroffen — sie misst nicht, was sie soll."
  exit 1
fi
bauen "$KOPIE" "$KOPIE/src"
if ARBEIT="$KOPIE" node "$HIER/97_programmfehler.mjs" >/dev/null 2>&1; then
  echo '✗ OHNE Ians Zweige läuft der Prüfstand GRÜN durch — dann bewacht er die'
  echo '  Entscheidung nicht, und die nächste Vereinfachung nimmt sie still zurück.'
  exit 1
fi
KREUZE=$(ARBEIT="$KOPIE" node "$HIER/97_programmfehler.mjs" 2>&1 | grep -oE '[0-9]+ Kreuze' | head -1)
echo "✓ Ohne die Zweige fällt er durch ($KREUZE) — die Entscheidung ist bewacht."
echo ''
