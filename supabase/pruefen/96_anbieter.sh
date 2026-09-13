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

# ── BEIDE Fassungen werden erzeugt, keine wird übernommen (2026-09-13) ───────
#
# Bis zum Gerätebuild vom 2026-09-13 nahm dieser Prüfstand die Repo-Datei als
# „die Attrappen-Fassung" und erzeugte daneben die umgelegte. Das ging gut,
# solange der Schalter im Repo IMMER auf `'attrappe'` stand — und genau diese
# Annahme ist an dem Tag weggefallen, an dem er für den Gerätebuild umgelegt
# wurde. Der Lauf meldete **12 Kreuze**, und keines davon war ein Fehler im Code.
#
# **Schlimmer war, was dabei NICHT anschlug:** Der alte Wächter fragte
# `grep -q "= 'supabase';"` an der erzeugten Datei. Steht im Repo schon
# `'supabase'`, ist das trivial wahr — die beiden Fassungen sind dann IDENTISCH,
# und der zweite Block misst denselben Code noch einmal. Wörtlich derselbe
# Zustand, vor dem der Wächter warnen sollte; sein eigener Kommentar beschrieb
# ihn („grün, und ohne Aussage"). **Ein Wächter, der die falsche Frage stellt,
# ist keiner** (harte Regel 83, hier innerhalb einer Datei).
#
# Also: Beide Fassungen entstehen aus derselben Quelle und bekommen ihren Wert
# ERZWUNGEN. Der Prüfstand ist damit unabhängig davon, wie der Schalter gerade
# steht — und misst in jeder Stellung dasselbe.
erzwinge() {  # $1 = Wert, $2 = Zieldatei
  sed -E "s/^(export const ANMELDE_QUELLE: 'attrappe' \| 'supabase' = )'[a-z]+';/\1'$1';/" \
    "$QUELLE" > "$2"
  if ! grep -q "^export const ANMELDE_QUELLE.* = '$1';" "$2"; then
    echo "✗ ANMELDE_QUELLE liess sich nicht auf '$1' setzen."
    echo '  Dann misst dieser Block etwas anderes als er behauptet.'
    grep -n 'ANMELDE_QUELLE' "$QUELLE"
    exit 1
  fi
}
erzwinge attrappe "$ARBEIT/anmeldung-attrappe.ts"
erzwinge supabase "$ARBEIT/anmeldung-supabase.ts"

# Der Wächter, auf den es ankommt: Die zwei Fassungen müssen sich UNTERSCHEIDEN,
# und zwar in genau einer Zeile. Das ist die Frage, die der alte nicht gestellt
# hat — „steht der Wert drin?" beantwortet ein `grep` auch dann mit ja, wenn gar
# nichts ersetzt wurde.
UNTERSCHIED="$(diff "$ARBEIT/anmeldung-attrappe.ts" "$ARBEIT/anmeldung-supabase.ts" | grep -c '^[<>]' || true)"
if [ "$UNTERSCHIED" != "2" ]; then
  echo "✗ Die zwei Fassungen unterscheiden sich in $UNTERSCHIED Zeilen statt in 2 (eine je Seite)."
  echo '  Bei 0 misst der zweite Block dieselbe Fassung wie der erste — also nichts.'
  diff "$ARBEIT/anmeldung-attrappe.ts" "$ARBEIT/anmeldung-supabase.ts" | head -10
  exit 1
fi
IM_REPO="$(grep -m1 -oE "= '(attrappe|supabase)';" "$QUELLE" | tr -d "= ';")"
echo "✓ zwei Fassungen erzeugt, Unterschied genau eine Zeile — Repo unberührt (steht dort: $IM_REPO)"

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
baue "$ARBEIT/anmeldung-attrappe.ts" attrappe
baue "$ARBEIT/anmeldung-supabase.ts" supabase

# ── Derselbe Wächter wie in 95: läuft das wirklich ohne Baustein? ───────────
if grep -qE "^(import|export .* from|require\()" "$ARBEIT/attrappe/anmeldung.mjs"; then
  echo '✗ anmeldung.ts hat einen Laufzeit-Import bekommen — dann prüft dieser Stand nichts mehr.'
  grep -nE "^(import|export .* from|require\()" "$ARBEIT/attrappe/anmeldung.mjs"
  exit 1
fi
echo '✓ anmeldung.mjs hat keinen Laufzeit-Import — läuft in blankem Node'

echo ''
ARBEIT="$ARBEIT" node "$HIER/96_anbieter.mjs"
