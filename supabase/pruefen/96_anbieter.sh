#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  DER PRÜFSTEIN VON PHASE 20.3-b2 — APPLE UND GOOGLE
#
#  Aufruf: npm run pruef-anbieter
#
#  ── Warum das OHNE Gerät, OHNE Browser und OHNE Datenbank geht ──────────────
#  `features/auth/anmeldung.ts` importiert nichts. Nach `tsc` bleibt in der
#  .js-Datei kein Laufzeit-Import übrig, also läuft sie in blankem Node —
#  dieselbe Bauart wie `lib/base64.ts` (90), `data/zeilen.ts` (40) und
#  `features/auth/sitzungsspeicher.ts` (95).
#
#  ── Und er misst BEIDE Schalterstellungen, nicht nur die heutige ────────────
#  Das ist der eigentliche Grund für diese Datei. `ANMELDE_QUELLE` steht auf
#  `'attrappe'`, und in dieser Stellung geben ALLE drei Wege `bereit: false`
#  zurück — die ganze neue Regel wäre also unsichtbar, und ein Prüfstand, der
#  sie „grün" meldet, hätte nichts gemessen (die 18d-Lehre: eine Regel, die
#  nichts vorfindet, sieht aus wie eine, die tut).
#
#  Also wird die Datei ZWEIMAL nach JS gebracht: einmal wie sie ist, einmal mit
#  `'supabase'` an dieser einen Stelle. Die zweite Fassung entsteht in einem
#  Wegwerf-Ordner — **das Repo wird nicht angefasst**, und der Wächter unten
#  belegt, dass die Ersetzung wirklich gegriffen hat. Damit ist beantwortet, was
#  am Tag des Umlegens passiert, ohne dass jemand den Schalter umlegen muss.
#
#  ── Was er NICHT leistet, und das gehört ausgesprochen ──────────────────────
#  Ob Apple seinen Dialog zeigt, ob Google das Fenster öffnet und ob Supabase
#  den Ausweis annimmt. Das braucht ein iPhone mit einer echten Apple-ID und
#  gehört in den Gerätedurchgang. Geprüft ist hier die REGEL: wer wann bereit
#  ist, was danebensteht, dass ein Abbruch SCHWEIGT — und die Rücksprung-Adresse,
#  an der ein einziges falsches Zeichen die Google-Anmeldung kippt.
# ═══════════════════════════════════════════════════════════════════════════════
set -e
HIER="$(cd "$(dirname "$0")" && pwd)"
WURZEL="$(cd "$HIER/../.." && pwd)"
ARBEIT="$(mktemp -d)"
trap 'rm -rf "$ARBEIT"' EXIT

echo ''
echo '════ PHASE 20.3-b2 — Apple und Google ══════════════════════════════════'

QUELLE="$WURZEL/src/features/auth/anmeldung.ts"

# ── Die zweite Fassung: derselbe Text, EIN Wort anders ──────────────────────
mkdir -p "$ARBEIT/umgelegt/features/auth"
sed "s/export const ANMELDE_QUELLE: 'attrappe' | 'supabase' = 'attrappe';/export const ANMELDE_QUELLE: 'attrappe' | 'supabase' = 'supabase';/" \
  "$QUELLE" > "$ARBEIT/anmeldung-umgelegt.ts"

# Der Wächter. Ohne ihn wäre „gemessen mit umgelegtem Schalter" eine Behauptung:
# Ändert sich die Zeile in `anmeldung.ts` je (anderer Name, andere Anführungs-
# zeichen), liefe `sed` ins Leere, und der ganze zweite Block prüfte STILL
# dieselbe Fassung noch einmal — grün, und ohne Aussage. Dieselbe Familie wie
# „ein Wächter hinter einem anderen ist ein ungeprüfter Wächter" (20.4-b).
if ! grep -q "= 'supabase';" "$ARBEIT/anmeldung-umgelegt.ts"; then
  echo '✗ Die Ersetzung von ANMELDE_QUELLE hat nicht gegriffen.'
  echo '  Dann misst der zweite Block dieselbe Fassung wie der erste — also nichts.'
  grep -n 'ANMELDE_QUELLE' "$QUELLE"
  exit 1
fi
echo '✓ zweite Fassung erzeugt (ANMELDE_QUELLE = supabase), Repo unberührt'

echo '── nach JS bringen ──────────────────────────────────────────────────────'
baue() {  # $1 = Quelldatei, $2 = Zielordner
  # Erst NEBENEINANDER kopieren, dann übersetzen. Ohne das liegen die zwei
  # Fassungen in verschiedenen Ordnern, und `tsc` will einen `rootDir`, der beide
  # enthält — er wählte sonst das Elternverzeichnis und legte das Ergebnis
  # irgendwo tief darunter ab.
  mkdir -p "$ARBEIT/quelle-$2"
  cp "$1" "$ARBEIT/quelle-$2/anmeldung.ts"
  cat > "$ARBEIT/tsconfig-$2.json" <<JSON
{
  "compilerOptions": {
    "target": "es2022", "module": "es2022", "moduleResolution": "bundler",
    "strict": true, "skipLibCheck": true, "outDir": "$ARBEIT/$2",
    "rootDir": "$ARBEIT/quelle-$2", "verbatimModuleSyntax": false
  },
  "files": [ "$ARBEIT/quelle-$2/anmeldung.ts" ]
}
JSON
  (cd "$WURZEL" && npx tsc -p "$ARBEIT/tsconfig-$2.json")
  # tsc legt die Datei unter ihrem eigenen Namen ab; für Node muss sie .mjs heißen.
  mv "$ARBEIT/$2/anmeldung.js" "$ARBEIT/$2/anmeldung.mjs"
}
baue "$QUELLE" jetzt
baue "$ARBEIT/anmeldung-umgelegt.ts" umgelegt

# ── Derselbe Wächter wie in 95: läuft das wirklich ohne Baustein? ───────────
if grep -qE "^(import|export .* from|require\()" "$ARBEIT/jetzt/anmeldung.mjs"; then
  echo '✗ anmeldung.ts hat einen Laufzeit-Import bekommen — dann prüft dieser Stand nichts mehr.'
  grep -nE "^(import|export .* from|require\()" "$ARBEIT/jetzt/anmeldung.mjs"
  exit 1
fi
echo '✓ anmeldung.mjs hat keinen Laufzeit-Import — läuft in blankem Node'

echo ''
ARBEIT="$ARBEIT" node "$HIER/96_anbieter.mjs"
