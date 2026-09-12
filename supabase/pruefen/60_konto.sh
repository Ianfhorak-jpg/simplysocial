#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  60 — DAS ERSTE KONTO am ECHTEN Supabase (Phase 20.3-b1)
#
#  Aufruf:  npm run pruef-konto
#
#  ── Was diese Prüfung leistet, die es vorher nicht gab ───────────────────────
#  `50_lesen.sh` prüft das LESEN mit fünf Menschen, die schon ein Profil haben.
#  Hier geht es um den Augenblick davor: Jemand hat eine UUID und eine E-Mail und
#  sonst nichts — der Zustand, den es bis 20.3-a gar nicht geben konnte.
#
#  ── Was sie NICHT leistet, und das gehört ausgesprochen ──────────────────────
#  Die Runde `codeAnfordern` → Mail → `codePruefen` läuft hier nicht. Der Code
#  steht nach dem Verschicken in einem POSTFACH; in der Datenbank liegt nur sein
#  Hash (`auth.one_time_tokens`). Eine Prüfung, die Mails an erfundene Adressen
#  schickt, handelt nach außen für etwas, das drinnen bleiben soll, und verbraucht
#  die Freigrenze des Projekts. **Dieses eine Stück gehört in Ians Postfach** und
#  steht als solches in `_FUER_IAN/KONTEN_EINRICHTEN.md`.
#  Alles AB dem gültigen Token läuft hier echt: dieselben Dateien, dieselben
#  Policies, dasselbe PostgREST.
#
#  ── Der Wächter ist derselbe wie bei 50 ──────────────────────────────────────
#  Es wird in die Produktionsdatenbank geschrieben und danach abgeräumt. Solange
#  dort niemand ist, ist das harmlos; sobald echte Menschen drin sind, wäre es ein
#  Eingriff in fremde Daten. Deshalb bricht es ab, wenn `auth.users` nicht leer ist.
# ═══════════════════════════════════════════════════════════════════════════════
set -u
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
export PGCONNECT_TIMEOUT=15
HIER="$(cd "$(dirname "$0")" && pwd)"
WURZEL="$(cd "$HIER/../.." && pwd)"
URL_DATEI="$HOME/.simplysocial/db-url"

[ -f "$URL_DATEI" ] || { echo "✗ Keine Verbindungsangabe in $URL_DATEI — erst 'npm run db-url'."; exit 2; }
[ -f "$WURZEL/.env" ] || { echo "✗ Keine .env — erst 'npm run anon-key'."; exit 2; }
DB_URL="$(cat "$URL_DATEI")"
PSQL="psql $DB_URL -v ON_ERROR_STOP=1 -qAt"

echo "── 1. Ist die Datenbank noch leer? ──"
BELEGT="$($PSQL -c "select count(*) from auth.users;" 2>&1)" || {
  echo "✗ Keine Verbindung zur Datenbank: $BELEGT"; exit 2; }
if [ "$BELEGT" != "0" ]; then
  echo "✗ In auth.users stehen $BELEGT Konten. Diese Prüfung legt an und löscht"
  echo "  danach — das ist nur gefahrlos, solange niemand drinsteht."
  exit 2
fi
echo "✓ auth.users ist leer — Aufbauen und Abräumen sind gefahrlos."

ARBEIT=""
abraeumen() {
  echo
  echo "── Abräumen ──"
  # KEIN `>/dev/null 2>&1` — beim ersten Lauf von 50_lesen.sh hat genau das die
  # Meldung verschluckt, die die Ursache nannte.
  $PSQL -f "$HIER/62_abraeumen.sql"
  REST="$($PSQL -c "select count(*) from auth.users;" 2>/dev/null || echo '?')"
  if [ "$REST" = "0" ]; then
    echo "✓ Die Datenbank ist wieder leer."
  else
    echo "✗ ACHTUNG: In auth.users stehen noch $REST Zeilen."
  fi
  [ -n "$ARBEIT" ] && rm -rf "$ARBEIT"
}
trap abraeumen EXIT

echo
echo "── 2. Zwei Konten OHNE Profil anlegen ──"
PRUEF_PASSWORT="$(openssl rand -base64 24)"
KONTO_A="aaaaaaaa-0000-4000-8000-000000000001"
KONTO_B="bbbbbbbb-0000-4000-8000-000000000002"
MAIL_A="erstkonto-a@simplysocial.invalid"
MAIL_B="erstkonto-b@simplysocial.invalid"
for PAAR in "$KONTO_A:$MAIL_A" "$KONTO_B:$MAIL_B"; do
  $PSQL -v konto_id="${PAAR%%:*}" -v konto_mail="${PAAR##*:}" -v passwort="$PRUEF_PASSWORT" \
    -f "$HIER/61_einkonto.sql" >/dev/null || { echo "✗ 61_einkonto.sql"; exit 1; }
done
# Gegengemessen statt angenommen: Zwei Konten, NULL Profile. Ohne diese Zeile wäre
# der „dritte Zustand" weiter unten auch dann grün, wenn er aus einem ganz anderen
# Grund entstünde.
PROFILE="$($PSQL -c "select count(*) from public.profiles;")"
KONTEN="$($PSQL -c "select count(*) from auth.users;")"
[ "$KONTEN" = "2" ] && [ "$PROFILE" = "0" ] || {
  echo "✗ Erwartet: 2 Konten, 0 Profile. Ist: $KONTEN / $PROFILE"; exit 1; }
echo "✓ zwei Konten, null Profile — genau der Zustand nach dem ersten Code."

echo
echo "── 3. Die drei Auth-Dateien nach JS bringen ──"
# **Innerhalb des Projekts**, anders als bei `50_lesen.sh` — und das ist kein
# Geschmack: `konten.ts` importiert `lib/supabase.ts` als WERT (der Standardwert
# von `sb`), und das zieht `@supabase/supabase-js` mit. Von einem mktemp-Ordner
# außerhalb fände Node das Paket nicht. Der Ordner ist git-ignoriert und wird beim
# Aufräumen gelöscht.
ARBEIT="$WURZEL/.pruef-konto"
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
    "$WURZEL/src/features/auth/konto.ts",
    "$WURZEL/src/features/auth/konten.ts"
  ]
}
JSON
(cd "$WURZEL" && npx tsc -p "$ARBEIT/tsconfig.json") || { echo "✗ tsc"; exit 1; }
# Die `@/`-Aliase auf relative Pfade umschreiben. Ein Bundler dafür wäre ein
# Werkzeug mehr im Projekt für drei Zeilen Arbeit.
find "$ARBEIT/js" -name '*.js' -exec sed -i '' \
  -e "s#'@/config/alter'#'../../config/alter.js'#g" \
  -e "s#'@/lib/bezirk'#'../../lib/bezirk.js'#g" \
  -e "s#'@/data/wien-bezirke'#'../data/wien-bezirke.js'#g" \
  -e "s#'@/lib/supabase'#'../../lib/supabase.js'#g" \
  -e "s#'@/features/auth/anmeldung'#'../features/auth/anmeldung.js'#g" {} +
# Und die RELATIVEN Importe bekommen ihre `.js`-Endung. tsc schreibt sie nicht
# dazu (`moduleResolution: bundler` geht davon aus, dass ein Bundler folgt) —
# blankes Node besteht bei ESM aber darauf und meldet `ERR_MODULE_NOT_FOUND` mit
# einem Pfad, der bis auf die fehlenden drei Zeichen richtig aussieht.
find "$ARBEIT/js" -name '*.js' -exec sed -i '' -E \
  "s#from '(\.\.?/[^']*[^.js'])';#from '\1.js';#g" {} +
echo "✓ anmeldung.js, konto.js, konten.js laufen in blankem Node."

echo
echo "── 4. Messen ──"
set -a; . "$WURZEL/.env"; set +a
ARBEIT="$ARBEIT" PRUEF_PASSWORT="$PRUEF_PASSWORT" \
  KONTO_A="$KONTO_A" KONTO_B="$KONTO_B" MAIL_A="$MAIL_A" MAIL_B="$MAIL_B" \
  node "$HIER/60_konto.mjs"
exit $?
