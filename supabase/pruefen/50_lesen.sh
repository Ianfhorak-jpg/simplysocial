#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  50 — DAS LESEN am ECHTEN Supabase (Phase 20.4-b)
#
#  Aufruf:  npm run pruef-lesen
#
#  ── Was diese Prüfung leistet, die es vorher nicht gab ───────────────────────
#  `aufbauen.sh` prüft 121 Dinge gegen eine WEGWERF-Datenbank: die Policies mit
#  `set local role`, die Übersetzung mit `psql`. Das ist viel und es ist nicht
#  alles — auf dem Weg, den die App wirklich geht, liegen drei Dinge, die dort
#  gar nicht vorkommen können:
#
#    1. **PostgREST statt psql.** Heißen die Spalten wirklich so, wie die
#       Zeilentypen behaupten? Wie serialisiert es ein Enum-Array, wie ein
#       `timestamptz`?
#    2. **Ein echtes JWT statt `set local role`.** `10_angriff.sql` setzt die
#       Rolle von Hand — hier stellt GoTrue das Token aus und PostgREST liest es.
#    3. **Realtime.** Gibt es lokal überhaupt nicht.
#
#  ── Der Wächter, der wichtiger ist als die Prüfung ───────────────────────────
#  Dieses Skript SCHREIBT in die Produktionsdatenbank und räumt danach wieder ab.
#  Solange dort niemand ist, ist das harmlos. Sobald echte Menschen drin sind,
#  wäre derselbe Ablauf ein Eingriff in fremde Daten — und ein Abräumen, das einen
#  Schritt zu weit geht, ist nicht rückholbar. Deshalb bricht es ab, wenn
#  `auth.users` nicht leer ist. Dieselbe Bauart wie der dritte Wächter in
#  `einspielen.sh`, und derselbe Grund: Eine Produktionsdatenbank anzufassen ist
#  Ians Entscheidung, keine Nebenwirkung.
#
#  ── Abgeräumt wird IMMER ─────────────────────────────────────────────────────
#  Über `trap … EXIT`, nicht am Ende des Skripts. Ein `exit 1` mitten in der
#  Messung, ein Ctrl-C, ein Absturz von node — in allen drei Fällen liegen sonst
#  fünf erfundene Menschen in einer echten Datenbank.
# ═══════════════════════════════════════════════════════════════════════════════
set -u
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
export PGCONNECT_TIMEOUT=15
HIER="$(cd "$(dirname "$0")" && pwd)"
WURZEL="$(cd "$HIER/../.." && pwd)"
URL_DATEI="$HOME/.simplysocial/db-url"

if [ ! -f "$URL_DATEI" ]; then
  echo "✗ Keine Verbindungsangabe in $URL_DATEI — erst 'npm run db-url'."
  exit 2
fi
if [ ! -f "$WURZEL/.env" ]; then
  echo "✗ Keine .env — erst 'npm run anon-key'."
  exit 2
fi
DB_URL="$(cat "$URL_DATEI")"
PSQL="psql $DB_URL -v ON_ERROR_STOP=1 -qAt"

echo "── 1. Ist die Datenbank noch leer? ──"
BELEGT="$($PSQL -c "select count(*) from auth.users;" 2>&1)" || {
  echo "✗ Keine Verbindung zur Datenbank: $BELEGT"; exit 2; }
if [ "$BELEGT" != "0" ]; then
  cat <<HINWEIS
✗ In auth.users stehen $BELEGT Konten.

Dieses Skript legt Prüfdaten an und löscht sie danach wieder. Solange die
Datenbank leer ist, ist das harmlos — sobald echte Menschen drin sind, ist es
ein Eingriff in fremde Daten, und das Abräumen unterscheidet nicht, wem eine
Zeile gehört.

Ab hier gehört diese Prüfung in ein ZWEITES Supabase-Projekt (Entwicklung),
nicht in das, an dem Leute hängen.
HINWEIS
  exit 2
fi
echo "✓ auth.users ist leer — Aufbauen und Abräumen sind gefahrlos."

# ── Aufräumen, komme was wolle ───────────────────────────────────────────────
abraeumen() {
  echo
  echo "── Abräumen ──"
  # KEIN `>/dev/null 2>&1`. Beim ersten Lauf stand es hier — und hat genau die
  # Meldung verschluckt, die die Ursache nannte („chef_oder_aufgeloest"). Übrig
  # blieb „es stehen noch 5 Zeilen" ohne einen Grund. Dieselbe Falle wie das
  # `set -e`, das in `db-url.sh` die eigens gebaute Diagnose tötete.
  $PSQL -f "$HIER/52_abraeumen.sql"
  REST="$($PSQL -c "select count(*) from auth.users;" 2>/dev/null || echo '?')"
  if [ "$REST" = "0" ]; then
    echo "✓ Die Datenbank ist wieder leer."
  else
    echo "✗ ACHTUNG: In auth.users stehen noch $REST Zeilen. Von Hand nachsehen:"
    echo "    psql \"\$(cat ~/.simplysocial/db-url)\" -f supabase/pruefen/52_abraeumen.sql"
  fi
}
trap abraeumen EXIT

echo
echo "── 2. Prüfdaten anlegen (dieselben wie lokal) ──"
# Ein frisches Passwort je Lauf. Es steht damit nirgends im Repo, und weil die
# Konten am Ende desselben Laufs gelöscht werden, gibt es nichts, wozu es später
# noch passen könnte. `openssl` statt `$RANDOM`: letzteres hat 15 Bit.
PRUEF_PASSWORT="$(openssl rand -base64 24)"
$PSQL -f "$HIER/05_daten.sql" >/dev/null || { echo "✗ 05_daten.sql"; exit 1; }
# Das Passwort geht über eine psql-VARIABLE hinein, nicht in den SQL-Text: So
# steht es in keiner Datei und in keinem Kommandozeilen-Argument, das `ps` zeigt.
$PSQL -v passwort="$PRUEF_PASSWORT" -f "$HIER/51_konten.sql" >/dev/null || {
  echo "✗ 51_konten.sql"; exit 1; }
echo "✓ fünf Menschen, eine Gruppe, fünf Posts — und Anmeldedaten dazu."

echo
echo "── 3. Die Übersetzung nach JS bringen ──"
ARBEIT="$(mktemp -d)"
# `typeRoots` muss ausgeschrieben werden, weil diese tsconfig in einem
# mktemp-Verzeichnis liegt: `@types` wird relativ zur TSCONFIG gesucht, nicht
# relativ zu den Quellen, und dort oben gibt es kein node_modules.
#
# `"types": ["node"]` ist nötig, obwohl hier nichts von Node importiert wird:
# `laden.ts` erreicht über `import type { AppState }` die Datei `store.ts` und von
# dort `lib/supabase.ts`, und tsc TYPPRÜFT alles, was es erreicht — auch das, was
# es nicht ausgibt. Dort steht `process.env.EXPO_PUBLIC_…`, und in der App kennt
# `expo/types` dieses `process`. Die schmale Prüf-tsconfig kennt es nicht, und der
# Fehler sieht aus wie ein Fehler in `supabase.ts` (der es nicht ist).
#
# `laden.ts` importiert `zeilen.ts` als WERT und nicht nur als Typ — anders als die
# drei Dateien in `40_uebersetzung.sh`. Nach `tsc` bleibt deshalb ein Import stehen,
# und darin steht das `@/`-Alias, das Node nicht kennt. Es wird unten auf einen
# relativen Pfad umgeschrieben; ein Bundler dafür wäre ein Werkzeug mehr im Projekt
# für genau eine Zeile Arbeit.
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
    "$WURZEL/src/data/zeilen.ts",
    "$WURZEL/src/data/laden.ts",
    "$WURZEL/src/data/realtime.ts"
  ]
}
JSON
(cd "$WURZEL" && npx tsc -p "$ARBEIT/tsconfig.json") || { echo "✗ tsc"; exit 1; }
sed -i '' "s#'@/data/zeilen'#'./zeilen.js'#g" "$ARBEIT"/js/data/*.js
# `supabase-js` steht als Typ-Import drin und ist nach tsc weg — geprüft, nicht
# gehofft: Bliebe er stehen, fände Node ihn von $ARBEIT aus nicht.
if grep -q "@supabase/supabase-js" "$ARBEIT"/js/data/*.js; then
  echo "✗ In den gebauten Dateien steht noch ein Laufzeit-Import von supabase-js."
  exit 1
fi
echo "✓ zeilen.js, laden.js, realtime.js laufen in blankem Node."

echo
echo "── 4. Messen ──"
# Die elf Tabellen aus der Publication — für die Drift-Prüfung gegen
# `REALTIME_TABELLEN` in `realtime.ts`. Sie kommt über psql und nicht über eine
# eigens gebaute Datenbankfunktion: Beim ersten Entwurf hing sie an einer RPC, die
# es gar nicht gibt, und hätte sich damit STILL übersprungen — ein Häkchen ohne
# Messung, dieselbe Familie wie die Backticks in `30_wettlauf.sh`.
REALTIME_IST="$($PSQL -c "select string_agg(tablename, ',' order by tablename) from pg_publication_tables where pubname='supabase_realtime' and schemaname='public';")"

ARBEIT="$ARBEIT" PRUEF_PASSWORT="$PRUEF_PASSWORT" REALTIME_IST="$REALTIME_IST" \
  node "$HIER/50_lesen.mjs"
ERGEBNIS=$?

rm -rf "$ARBEIT"
exit $ERGEBNIS
