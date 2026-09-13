#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  80 — DIE PROFILBILDER am ECHTEN Supabase (Phase 20.6)
#
#  Aufruf:  npm run pruef-bilder
#
#  ── Warum es diesen Prüfstand zusätzlich zu `25_bilder.sql` gibt ─────────────
#  25 misst die vier Policies gegen eine Wegwerf-Datenbank, also gegen Postgres.
#  Bei einem OFFENEN Bucket (Ians Entscheidung 50) wird Postgres beim ABRUF aber
#  gar nicht gefragt — die Datei kommt vom Storage-Dienst. Die Zusage aus
#  `bildFolgen()` („wenn du es austauschst, ist das alte sofort weg") liegt damit
#  vollständig außerhalb dessen, was lokal messbar ist. Hier wird sie mit echten
#  HTTP-Anfragen an die echte Adresse gemessen.
#
#  ── Wächter und Abräumen: wie 70, mit EINEM Unterschied ─────────────────────
#  Ians Entscheidung 45, nur die eigenen festen IDs. Der Unterschied ist, dass
#  hier DATEIEN entstehen und die an keinem Fremdschlüssel hängen (der Fund aus
#  0008): Ein gelöschtes Konto nimmt sie nicht mit, und `52_abraeumen.sql` kann
#  nur die ZEILE löschen, nie die Datei. Deshalb räumt `80_bilder.mjs` am Ende
#  selbst über die Storage-Schnittstelle auf, solange die Konten noch angemeldet
#  sind — und das SQL-Abräumen ist nur das Netz für einen Abbruch.
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
PRUEF_IDS="'11111111-1111-1111-1111-111111111111',
           '22222222-2222-2222-2222-222222222222',
           '33333333-3333-3333-3333-333333333333',
           '44444444-4444-4444-4444-444444444444',
           '55555555-5555-5555-5555-555555555555'"
# Die Gruppe gehört AUSDRÜCKLICH dazu, und das hat am 2026-09-12 ein Lauf
# gekostet: `groups.creator_id` ist `on delete set null` (Ians Entscheidung 41 —
# eine Gruppe wird nicht gelöscht, sie hört auf), also überlebt sie ihren Gründer
# und fällt durch jedes Abräumen, das Gruppen über `creator_id` findet. Der Kopf
# von `70_schreiben.sh` beschreibt genau diesen Fall für die vom Server vergebenen
# IDs — er gilt genauso für die FESTE aus `05_daten.sql`, und dort fragte ihn
# niemand ab.
BELEGT="$($PSQL -c "select
    (select count(*) from auth.users where id in ($PRUEF_IDS))
  + (select count(*) from chat_threads where id in (
      '0c000001-0000-0000-0000-000000000001',
      '0c000002-0000-0000-0000-000000000002'))
  + (select count(*) from groups where id in (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'))
  + (select count(*) from storage.objects where bucket_id = 'avatars'
       and (storage.foldername(name))[1] in ($PRUEF_IDS));" 2>&1)" || {
  echo "✗ Keine Verbindung zur Datenbank: $BELEGT"; exit 2; }
if [ "$BELEGT" != "0" ]; then
  echo "✗ $BELEGT Prüf-Zeilen liegen noch in der Datenbank (abgebrochener Lauf)."
  echo "    psql \"\$(cat ~/.simplysocial/db-url)\" -f supabase/pruefen/52_abraeumen.sql"
  exit 2
fi
ECHTE="$($PSQL -c "select count(*) from auth.users where id not in ($PRUEF_IDS);" 2>/dev/null || echo '?')"
echo "✓ Alle Prüf-IDs frei. ($ECHTE echte Konten in der Datenbank — sie werden nicht angefasst.)"

abraeumen() {
  echo
  echo "── Abräumen ──"
  # Die ZEILEN in `storage.objects` zuerst und ausdrücklich: Sie hängen an keinem
  # Konto (der Fund aus 0008), also nimmt `52_abraeumen.sql` sie nicht mit. Was
  # `80_bilder.mjs` nicht mehr über die Schnittstelle wegräumen konnte, geht hier
  # weg — beim Namen der fünf festen IDs, nach Ians Entscheidung 45.
  #
  # ⚠️ **`set storage.allow_delete_query` ist genau der Schalter, den 0008
  # ausdrücklich NICHT benutzt** — und hier ist er trotzdem richtig, weil die Lage
  # eine andere ist. In der App geht es um das Bild eines Menschen, und ein
  # SQL-`delete` ließe seine Datei für immer und unauffindbar liegen. Hier geht es
  # um fünf erfundene Menschen, deren Konten in derselben Minute wieder weg sind;
  # der Preis ist ein 67-Byte-PNG, das im Speicher verwaist. **Eine Zeile in einer
  # echten Datenbank liegen zu lassen wäre teurer** (Ians Entscheidung 45), und der
  # nächste Lauf würde am eigenen Wächter abprallen.
  $PSQL -c "set storage.allow_delete_query = 'true';
            delete from storage.objects
             where bucket_id = 'avatars'
               and (storage.foldername(name))[1] in ($PRUEF_IDS);" >/dev/null 2>&1 || true
  $PSQL -f "$HIER/52_abraeumen.sql"
  # Die Gruppe beim NAMEN — siehe den Wächter oben. `52_abraeumen.sql` findet sie
  # über ihren Gründer, und der ist nach einem `konto_loeschen()` `null`.
  $PSQL -c "delete from groups where id in (
              'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
              'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');" >/dev/null 2>&1 || true
  REST="$($PSQL -c "select
      (select count(*) from auth.users where id in ($PRUEF_IDS))
    + (select count(*) from groups where id in (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'))
    + (select count(*) from storage.objects where bucket_id='avatars'
        and (storage.foldername(name))[1] in ($PRUEF_IDS));" 2>/dev/null || echo '?')"
  if [ "$REST" = "0" ]; then
    echo "✓ Alle Prüf-Zeilen sind wieder weg — Konten, Gruppe UND Bild-Zeilen."
  else
    echo "✗ ACHTUNG: $REST Prüf-Zeilen liegen noch da."
  fi
}
trap abraeumen EXIT

echo
echo "── 2. Prüfdaten anlegen ──"
PRUEF_PASSWORT="$(openssl rand -base64 24)"
$PSQL -f "$HIER/05_daten.sql" >/dev/null || { echo "✗ 05_daten.sql"; exit 1; }
$PSQL -v passwort="$PRUEF_PASSWORT" -f "$HIER/51_konten.sql" >/dev/null || {
  echo "✗ 51_konten.sql"; exit 1; }
echo "✓ fünf Menschen mit Anmeldedaten."

echo
echo "── 3. Der Bucket trägt, was in bild.ts steht ──"
# Über `psql` und nicht über den Client: `getBucket()` gibt einem gewöhnlichen
# Nutzer nur `public` heraus, die Grenzen kommen als `undefined` zurück (gemessen
# am 2026-09-12). Das ist richtig so — er braucht sie nicht —, aber es heißt, dass
# diese Frage nur hier zu stellen ist.
BUCKET="$($PSQL -c "select public::text || ' | ' || file_size_limit || ' | ' ||
                           array_to_string(allowed_mime_types, ',')
                      from storage.buckets where id = 'avatars';" 2>&1)"
if [ "$BUCKET" = "true | 5242880 | image/jpeg,image/png,image/webp" ]; then
  echo "✓ öffentlich, 5 MB, genau drei Bildtypen — dieselben Werte wie in bild.ts."
else
  echo "✗ Der Bucket steht anders da als bild.ts sagt:"
  echo "    ist:  $BUCKET"
  echo "    soll: true | 5242880 | image/jpeg,image/png,image/webp"
  exit 1
fi

echo
echo "── 4. Die Schreibwege nach JS bringen ──"
ARBEIT="$(mktemp -d)"
# Dieselbe Anordnung wie in `70_schreiben.sh`, samt der Begründungen dort —
# `types: ["node"]`, ausgeschriebene `typeRoots`, und `bild.ts` als eigene Datei,
# weil `senden.ts` sie als WERT importiert (`bildPfad`, `BILD_BUCKET`).
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
    "$WURZEL/src/data/senden.ts",
    "$WURZEL/src/features/social/bild.ts",
    "$WURZEL/src/features/safety/konto.ts",
    "$WURZEL/src/lib/zufall.ts",
    "$WURZEL/src/lib/programmfehler.ts"
  ]
}
JSON
(cd "$WURZEL" && npx tsc -p "$ARBEIT/tsconfig.json") || { echo "✗ tsc"; exit 1; }
# `@/lib/zufall` ist seit dem 2026-09-13 dabei: `senden.ts` holt den Dateinamen
# jetzt von dort statt aus `globalThis.crypto` in `bild.ts` — der Fehler, der Ians
# Profilbild am iPhone lautlos scheitern liess (siehe den Kopf von `lib/zufall.ts`).
# **In Node läuft die WEB-Fassung**, und das ist hier richtig: Gemessen wird der
# Weg durch storage-js, nicht die Zufallsquelle. Dass es am Gerät keine gibt, misst
# `90_bildwahl.mjs`, indem es `crypto` wegnimmt.
sed -i '' "s#'@/data/zeilen'#'./zeilen.js'#g;s#'@/data/schreiben'#'./schreiben.js'#g;s#'@/features/social/bild'#'../features/social/bild.js'#g;s#'@/lib/zufall'#'../lib/zufall.js'#g;s#'@/lib/programmfehler'#'../lib/programmfehler.js'#g" "$ARBEIT"/js/data/*.js
for DATEI in data/zeilen data/laden data/schreiben data/senden features/social/bild lib/zufall lib/programmfehler; do
  if grep -qE "from '@/" "$ARBEIT/js/$DATEI.js"; then
    echo "✗ In $DATEI.js steht noch ein @/-Alias, den Node nicht kennt:"
    grep -nE "from '@/" "$ARBEIT/js/$DATEI.js"
    exit 1
  fi
done
echo "✓ senden.js und bild.js laufen in blankem Node."

echo
echo "── 5. Messen ──"
ARBEIT="$ARBEIT" PRUEF_PASSWORT="$PRUEF_PASSWORT" node "$HIER/80_bilder.mjs"
ERGEBNIS=$?

rm -rf "$ARBEIT"
exit $ERGEBNIS
