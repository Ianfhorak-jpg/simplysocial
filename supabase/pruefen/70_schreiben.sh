#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  70 — DAS SCHREIBEN am ECHTEN Supabase (Phase 20.5, App-Seite)
#
#  Aufruf:  npm run pruef-schreiben
#
#  ── Was diese Prüfung leistet, die es vorher nicht gab ───────────────────────
#  `aufbauen.sh` prüft 124 Dinge gegen eine WEGWERF-Datenbank, `20_transaktionen`
#  die sieben Funktionen aus 0004 über `psql`. Hier laufen die 22 Schreibwege aus
#  `src/data/senden.ts` den Weg, den die APP wirklich geht — echtes JWT, PostgREST,
#  dieselbe Datei. Vier Dinge liegen darauf, die lokal nicht zu sehen sind: die
#  Spaltennamen, die ARGUMENTNAMEN der RPCs, ob `.select('id')` wirklich eine ID
#  zurückgibt, und der Trigger `nachricht_notiert`.
#
#  ── Der Wächter, der wichtiger ist als die Prüfung ───────────────────────────
#  Dieses Skript SCHREIBT in die Produktionsdatenbank. Es gilt Ians Entscheidung 45
#  wortgleich wie in `50_lesen.sh`: **Es fasst nur seine eigenen Zeilen an**, und
#  der Wächter fragt nur, ob die eigenen festen Prüf-IDs frei sind. Echte Konten
#  daneben sind kein Grund abzubrechen — sie werden nicht angefasst.
#
#  ⚠️ **Hier gibt es dabei etwas, das `50_lesen.sh` nicht hat, und es ist der
#  gefährlichste Teil der Datei:** Beim LESEN entstehen keine neuen Zeilen. Beim
#  SCHREIBEN vergibt der SERVER IDs (`gen_random_uuid()`), und die stehen in keiner
#  festen Liste. Besonders übel ist eine Gruppe, die dieser Lauf gründet und dann
#  VERLÄSST: Danach ist `creator_id` entweder vererbt oder `null` (Ians
#  Entscheidung 41), und `52_abraeumen.sql` findet Gruppen über ihren Gründer — sie
#  fiele durch das Netz und bliebe für immer liegen.
#
#  Deshalb schreibt `70_schreiben.mjs` **jede erzeugte ID sofort** nach
#  `$ERZEUGT` mit, und das Abräumen unten löscht sie beim Namen. „Sofort" ist der
#  Punkt: Bei einem Sammeln bis zum Schluss wäre die Liste nach einem Abbruch in
#  der Mitte leer — also genau dann, wenn man sie braucht.
#
#  ── Abgeräumt wird IMMER ─────────────────────────────────────────────────────
#  Über `trap … EXIT`, nicht am Ende. Ein `exit 1` mitten in der Messung, ein
#  Ctrl-C, ein Absturz von node — sonst liegen erfundene Menschen samt ihrer
#  erfundenen Gruppen in einer echten Datenbank.
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

echo "── 1. Sind die Prüf-IDs frei? ──"
# Die fünf Menschen; alles Weitere (Profile, Posts, Anfragen) hängt an ihrem
# Cascade. Dazu die zwei Chat-Fäden, weil `chat_threads` an KEINEM Konto hängt —
# genau sie bleiben nach einem mitten drin abgebrochenen Lauf liegen.
PRUEF_IDS="'11111111-1111-1111-1111-111111111111',
           '22222222-2222-2222-2222-222222222222',
           '33333333-3333-3333-3333-333333333333',
           '44444444-4444-4444-4444-444444444444',
           '55555555-5555-5555-5555-555555555555'"
BELEGT="$($PSQL -c "select
    (select count(*) from auth.users   where id in ($PRUEF_IDS))
  + (select count(*) from chat_threads where id in (
      '0c000001-0000-0000-0000-000000000001',
      '0c000002-0000-0000-0000-000000000002'));" 2>&1)" || {
  echo "✗ Keine Verbindung zur Datenbank: $BELEGT"; exit 2; }
if [ "$BELEGT" != "0" ]; then
  cat <<HINWEIS
✗ $BELEGT Prüf-Zeilen liegen noch in der Datenbank.

Das heißt NICHT, dass echte Nutzer im Weg sind — dieser Prüfstand fasst nur seine
eigenen, festen IDs an. Es heißt: Ein früherer Lauf ist mitten drin abgebrochen
und hat nicht abgeräumt. Von Hand nachholen:

    psql "\$(cat ~/.simplysocial/db-url)" -f supabase/pruefen/52_abraeumen.sql
HINWEIS
  exit 2
fi
# Informativ, nicht blockierend: Ians Entscheidung vom 2026-09-12 erlaubt das
# Mitlaufen. Die Zahl steht trotzdem da — wer sie SIEHT, merkt, wenn er sich in
# der Datenbank geirrt hat.
ECHTE="$($PSQL -c "select count(*) from auth.users where id not in ($PRUEF_IDS);" 2>/dev/null || echo '?')"
echo "✓ Alle Prüf-IDs frei. ($ECHTE echte Konten in der Datenbank — sie werden nicht angefasst.)"

# Die Liste der vom Server vergebenen IDs. Sie liegt AUSSERHALB von `$ARBEIT`,
# weil `$ARBEIT` am Ende gelöscht wird — und wenn etwas schiefgeht, ist genau diese
# Datei das Einzige, woran man noch sieht, was aufzuräumen wäre.
ERZEUGT="$(mktemp -t simplysocial-erzeugt)"
echo "  (erzeugte IDs werden mitgeschrieben nach $ERZEUGT)"

# ── Aufräumen, komme was wolle ───────────────────────────────────────────────
abraeumen() {
  echo
  echo "── Abräumen ──"
  # ZUERST die vom Server vergebenen IDs — beim Namen, nicht nach Muster. Eine
  # Gruppe, die dieser Lauf gegründet und dann verlassen hat, trägt einen anderen
  # Gründer (oder gar keinen) und wäre über `creator_id` nicht mehr zu finden.
  # Siehe Dateikopf; das ist der Unterschied zu `50_lesen.sh`.
  if [ -s "$ERZEUGT" ]; then
    echo "  ($(wc -l < "$ERZEUGT" | tr -d ' ') Zeilen hat der Server angelegt — die gehen beim Namen weg.)"
    # `while read` statt einer gebauten IN-Liste: Bricht eine Zeile ab, bleiben die
    # anderen trotzdem dran. Und jede ID wird als UUID geprüft, bevor sie in ein
    # `delete` wandert — was dort ankommt, kam aus einer Datei.
    while read -r ART ID; do
      case "$ID" in
        [0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]-*-*-*-*) ;;
        *) echo "  ✗ übersprungen, keine UUID: '$ID'"; continue ;;
      esac
      case "$ART" in
        gruppe) $PSQL -c "delete from groups       where id = '$ID';" >/dev/null ;;
        post)   $PSQL -c "delete from posts        where id = '$ID';" >/dev/null ;;
        faden)  $PSQL -c "delete from chat_threads where id = '$ID';" >/dev/null ;;
        *)      echo "  ✗ unbekannte Art: '$ART'" ;;
      esac
    done < "$ERZEUGT"
  fi
  # KEIN `>/dev/null 2>&1`. Beim ersten Lauf stand es hier — und hat genau die
  # Meldung verschluckt, die die Ursache nannte („chef_oder_aufgeloest"). Übrig
  # blieb „es stehen noch 5 Zeilen" ohne einen Grund. Dieselbe Falle wie das
  # `set -e`, das in `db-url.sh` die eigens gebaute Diagnose tötete.
  $PSQL -f "$HIER/52_abraeumen.sql"
  # Gefragt wird nach den EIGENEN Zeilen, nicht nach `count(*) = 0`. Die alte
  # Zeile stellte die falsche Frage gleich doppelt: Sie war rot, sobald ein echter
  # Mensch in der Datenbank stand (obwohl nichts liegengeblieben war), und sie wäre
  # grün gewesen, wenn das Abräumen MEHR gelöscht hätte als seine eigenen Zeilen.
  REST="$($PSQL -c "select
      (select count(*) from auth.users   where id in ($PRUEF_IDS))
    + (select count(*) from chat_threads where id in (
        '0c000001-0000-0000-0000-000000000001',
        '0c000002-0000-0000-0000-000000000002'));" 2>/dev/null || echo '?')"
  # Die erzeugten Zeilen zählen mit — sonst sagte „alles weg" etwas über die fünf
  # festen IDs und schwiege zu genau dem, was dieses Skript zusätzlich anlegt.
  if [ -s "$ERZEUGT" ]; then
    UEBRIG=0
    while read -r ART ID; do
      case "$ART" in
        gruppe) T=groups ;;
        post)   T=posts ;;
        faden)  T=chat_threads ;;
        *) continue ;;
      esac
      N="$($PSQL -c "select count(*) from $T where id = '$ID';" 2>/dev/null || echo 0)"
      UEBRIG=$((UEBRIG + N))
    done < "$ERZEUGT"
    REST=$((REST + UEBRIG))
  fi
  if [ "$REST" = "0" ]; then
    echo "✓ Alle Prüf-Zeilen sind wieder weg — die festen UND die vom Server vergebenen."
  else
    echo "✗ ACHTUNG: $REST Prüf-Zeilen liegen noch da. Von Hand nachsehen:"
    echo "    psql \"\$(cat ~/.simplysocial/db-url)\" -f supabase/pruefen/52_abraeumen.sql"
    echo "    und die Liste in $ERZEUGT"
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
    "$WURZEL/src/data/schreiben.ts",
    "$WURZEL/src/data/senden.ts"
  ]
}
JSON
(cd "$WURZEL" && npx tsc -p "$ARBEIT/tsconfig.json") || { echo "✗ tsc"; exit 1; }
sed -i '' "s#'@/data/zeilen'#'./zeilen.js'#g;s#'@/data/schreiben'#'./schreiben.js'#g" "$ARBEIT"/js/data/*.js
# `supabase-js` steht als Typ-Import drin und ist nach tsc weg — geprüft, nicht
# gehofft: Bliebe er stehen, fände Node ihn von $ARBEIT aus nicht.
if grep -q "@supabase/supabase-js" "$ARBEIT"/js/data/*.js; then
  echo "✗ In den gebauten Dateien steht noch ein Laufzeit-Import von supabase-js."
  exit 1
fi
# **`senden.ts` erreicht über `import type` die Haken-Dateien** (`PostEntwurf`,
# `GruppenEntwurf`) — und ein Typ-Import erzeugt keine Abhängigkeit. Nach `tsc`
# bleibt genau EIN Laufzeit-Import stehen (`@/data/schreiben`, denn `SchreibFehler`
# ist eine Klasse), und der wird oben umgeschrieben. Geprüft, nicht gehofft.
# Gefragt werden die VIER Dateien, die wirklich geladen werden — nicht alles, was
# im Ausgabeordner liegt. Der erste Entwurf fragte `*.js` und schlug sofort an:
# `mock.js` und `wien-bezirke.js` werden mitgebaut, weil `laden.ts` über
# `import type { AppState }` bis `store.ts` reicht und tsc alles TYPPRÜFT, was es
# erreicht. **Geladen wird davon nichts** — der Typ-Import erzeugt keine
# Abhängigkeit, und in `laden.js` steht nach tsc kein Import auf `mock` mehr.
# Ein Wächter, der auch Dateien prüft, die niemand öffnet, sperrt zu viel.
for DATEI in zeilen laden schreiben senden; do
  if grep -qE "from '@/" "$ARBEIT/js/data/$DATEI.js"; then
    echo "✗ In $DATEI.js steht noch ein @/-Alias, den Node nicht kennt:"
    grep -nE "from '@/" "$ARBEIT/js/data/$DATEI.js"
    exit 1
  fi
done
# Die Gegenprobe zur Verengung: Wird eine der vier über einen Umweg doch auf
# `mock` gezogen, steht es hier.
if grep -rn "mock" "$ARBEIT/js/data/senden.js" "$ARBEIT/js/data/laden.js" >/dev/null 2>&1; then
  echo "✗ senden.js oder laden.js zieht `mock` zur Laufzeit — das gehört nie in den Prüfstand."
  exit 1
fi
echo "✓ zeilen.js, laden.js, schreiben.js, senden.js laufen in blankem Node."

echo
echo "── 4. Messen ──"
ARBEIT="$ARBEIT" ERZEUGT="$ERZEUGT" PRUEF_PASSWORT="$PRUEF_PASSWORT" \
  node "$HIER/70_schreiben.mjs"
ERGEBNIS=$?

rm -rf "$ARBEIT"
exit $ERGEBNIS
