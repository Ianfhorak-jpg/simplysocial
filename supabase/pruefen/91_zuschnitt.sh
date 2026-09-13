#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  DER PRÜFSTEIN VON PHASE 20.6-d — Ians Entscheidung 77
#
#  Aufruf: npm run pruef-zuschnitt
#
#  ── Warum das OHNE Gerät und OHNE Datenbank geht ────────────────────────────
#  `features/social/zuschnitt.ts` ist IMPORTFREI — dieselbe Bauart wie
#  `lib/programmfehler.ts`. Nach `tsc` bleibt eine einzelne `.mjs` übrig, die in
#  blankem Node läuft. Der native Baustein (`expo-image-manipulator`) kommt darin
#  nicht vor: Er bekommt das Rechteck, er rechnet es nicht aus.
#
#  ── Was er NICHT leistet ────────────────────────────────────────────────────
#  Ob sich Schieben und Kneifen am Handy richtig ANFÜHLEN, beantwortet kein Node —
#  und ob `expo-image-manipulator` das Rechteck so umsetzt, wie es dasteht, auch
#  nicht. Beides gehört in den Gerätedurchgang.
# ═══════════════════════════════════════════════════════════════════════════════
set -e
HIER="$(cd "$(dirname "$0")" && pwd)"
WURZEL="$(cd "$HIER/../.." && pwd)"
ARBEIT="$(mktemp -d)"
trap 'rm -rf "$ARBEIT"' EXIT

# Baut die Regel-Datei aus $2 nach $1/js und macht .mjs daraus.
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
  "files": [ "$2/features/social/zuschnitt.ts" ]
}
JSON
  (cd "$WURZEL" && npx tsc -p "$ZIEL/tsconfig.json")
  mv "$ZIEL/js/features/social/zuschnitt.js" "$ZIEL/js/features/social/zuschnitt.mjs"
  # ── Der Alias-Wächter ─────────────────────────────────────────────────────
  # Kommt je ein `@/`-Import in die Regel-Datei, findet Node ihn nicht und der
  # Lauf stirbt mit ERR_MODULE_NOT_FOUND — einer Meldung, die nach kaputtem Node
  # aussieht statt nach einem neuen Import (die 20.7-Lehre, zweimal getroffen).
  if grep -qE "from '@/" "$ZIEL/js/features/social/zuschnitt.mjs"; then
    echo "✗ In zuschnitt.mjs steht ein @/-Alias, den Node nicht kennt:"
    grep -nE "from '@/" "$ZIEL/js/features/social/zuschnitt.mjs"
    exit 1
  fi
}

echo ''
echo '════ PHASE 20.6-d — wo das Quadrat im Foto liegt (Entscheidung 77) ═════'
echo '── Die Regel-Datei nach JS bringen ─────────────────────────────────────'
bauen "$ARBEIT" "$WURZEL/src"
echo '✓ zuschnitt.mjs läuft in blankem Node'

ARBEIT="$ARBEIT" node "$HIER/91_zuschnitt.mjs"

# ═══════════════════════════════════════════════════════════════════════════════
#  DIE GEGENPROBEN — ist der Prüfstand überhaupt scharf?
# ═══════════════════════════════════════════════════════════════════════════════
#  Zwei Stück, denn ein Wächter hinter einem anderen ist ein ungeprüfter Wächter
#  (FALLEN.md). Gebaut wird jedes Mal eine KOPIE der Quelle; das Repo wird nicht
#  angefasst — dieselbe Technik wie in 96 und 97.
KOPIE="$WURZEL/.pruef-zuschnitt"
trap 'rm -rf "$ARBEIT" "$KOPIE"' EXIT

# $1 = Name, $2 = sed-Ausdruck, $3 = wie oft er treffen muss
gegenprobe() {
  rm -rf "$KOPIE"
  mkdir -p "$KOPIE"
  cp -R "$WURZEL/src" "$KOPIE/src"
  local DATEI="$KOPIE/src/features/social/zuschnitt.ts"
  sed -i '' "$2" "$DATEI"
  local TREFFER
  TREFFER=$(grep -c "$4" "$DATEI" || true)
  if [ "$TREFFER" != "$3" ]; then
    echo "✗ Die Gegenprobe „$1\" hat $TREFFER statt $3 Stellen getroffen — sie misst nicht, was sie soll."
    exit 1
  fi
  bauen "$KOPIE" "$KOPIE/src"
  if ARBEIT="$KOPIE" node "$HIER/91_zuschnitt.mjs" >/dev/null 2>&1; then
    echo "✗ Mit „$1\" läuft der Prüfstand GRÜN durch — dann bewacht er nichts."
    exit 1
  fi
  local KREUZE
  KREUZE=$(ARBEIT="$KOPIE" node "$HIER/91_zuschnitt.mjs" 2>&1 | grep -oE '[0-9]+ Kreuze' | head -1)
  echo "✓ $1 ⇒ fällt durch ($KREUZE)"
}

echo '── Gegenproben: dieselbe Messung mit je EINEM umgedrehten Griff ────────'

# 1. Das Vorzeichen beim Schieben. Es ist der Griff, den man beim Umbauen dreht,
#    ohne es zu merken — das Bild bewegt sich ja weiterhin.
gegenprobe 'Schieben mit vertauschtem Vorzeichen' \
  's#mitteX: roh.mitteX - dx \* faktor#mitteX: roh.mitteX + dx * faktor#' \
  1 'mitteX: roh.mitteX + dx \* faktor'

# 2. Das Hochrechnen. Ohne diese Gegenprobe wäre `zuschnittZielKante()` eine
#    Zeile, die jeder für eine unnötige Verkomplizierung halten und „vereinfachen"
#    würde — genau der Fall, der Entscheidung 55 fast gekostet hätte.
gegenprobe 'Zielkante rechnet hoch, statt es zu lassen' \
  's#return Math.min(ZUSCHNITT_KANTE, rechteck.width);#return ZUSCHNITT_KANTE;#' \
  1 'return ZUSCHNITT_KANTE;$'

echo ''
