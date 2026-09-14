#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  DER DEMO-ZUGANG AUF DEM PRÜFSTAND — Phase 21.5.  Aufruf: npm run pruef-demo
#
#  Braucht KEINEN echten Server und KEIN Gerät: Er baut sich eine Wegwerf-
#  Datenbank, spielt alle Migrationen ein, lässt `supabase/demo/anlegen.sh`
#  darauf laufen und greift das Ergebnis an.
#
#  ── Die Attrappe muss hier REICHER sein als sonst, und das ist der Haken ────
#  `pruefen/00_supabase_lokal.sql` baut `auth.users` mit genau zwei Spalten nach —
#  `id` und `email`. Für die Policies genügt das, denn die App liest von dort
#  nichts. `10_konto.sql` schreibt aber genau die Spalten, an denen GoTrue sonst
#  scheitert, und ohne sie läuft es gar nicht erst an.
#
#  Die Spalten werden deshalb HIER ergänzt und nicht in `00_supabase_lokal.sql`:
#  Jene Datei ist die Grundlage von 171 Häkchen, und eine breitere Attrappe dort
#  wäre eine Änderung an allen. Der Preis steht in FALLEN.md und wird hier
#  ausdrücklich bezahlt: *„Eine Attrappe kann auch SCHWÄCHER sein als das
#  Original — und das ist die gefährlichere Richtung."* Was dieser Prüfstand über
#  die acht leeren Strings sagt, ist deshalb eine Aussage über `10_konto.sql`
#  und **keine** über GoTrue. Dass GoTrue an NULLs scheitert, ist am 2026-09-12
#  einmal bezahlt worden und steht als Falle da — es wird hier nicht neu belegt,
#  sondern eingehalten.
#
#  ── Was er dagegen WIRKLICH belegt ─────────────────────────────────────────
#  Den Angriff aus Abschnitt 4: dass ein echtes Konto nichts von der Demo-Welt
#  sieht. Das ist reines Postgres-RLS, dieselbe Maschinerie wie am Server, und
#  dafür ist die Wegwerf-Datenbank kein Ersatz, sondern das Original.
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
HIER="$(cd "$(dirname "$0")" && pwd)"
DATEN="${PGDATEN:-/tmp/simplysocial-pgdata}"
PORT=55432
DB="postgresql://postgres@127.0.0.1:$PORT/demopruef"

command -v psql > /dev/null || { echo "✗ Kein psql. brew install postgresql@17"; exit 1; }

if ! pg_isready -h 127.0.0.1 -p $PORT -q; then
  [ -d "$DATEN" ] || initdb -D "$DATEN" -U postgres --auth=trust > /dev/null
  pg_ctl -D "$DATEN" -o "-p $PORT -k /tmp -h 127.0.0.1" -l "$DATEN/pg.log" start > /dev/null
  sleep 2
fi

P="psql -h 127.0.0.1 -p $PORT -U postgres -v ON_ERROR_STOP=1 -q -d demopruef"
psql -h 127.0.0.1 -p $PORT -U postgres -q \
  -c "drop database if exists demopruef;" -c "create database demopruef;" > /dev/null 2>&1

$P -f "$HIER/00_supabase_lokal.sql" 2>/dev/null
# Dieselbe Schleife und derselbe Wächter wie in `aufbauen.sh`: Die Liste kommt aus
# dem ORDNER. Eine getippte Liste hat in `einspielen.sh` schon einmal eine
# Migration verschluckt, und kein einziger nachgemessener Wert hätte es gefunden.
for M in $(ls -1 "$HIER"/../migrations/*.sql | sort); do
  B="$(basename "$M")"
  [[ "$B" =~ ^[0-9]{4}_ ]] || { echo "✗ Migration ohne vierstellige Nummer: $B"; exit 1; }
  $P -f "$M" 2>/dev/null
done

# ── Die Attrappe auf GoTrue-Breite bringen (siehe Kopf) ─────────────────────
$P <<'EOSQL' 2>/dev/null
alter table auth.users
  add column if not exists instance_id        uuid,
  add column if not exists aud                text,
  add column if not exists role               text,
  add column if not exists encrypted_password text,
  add column if not exists email_confirmed_at timestamptz,
  add column if not exists created_at         timestamptz,
  add column if not exists updated_at         timestamptz,
  add column if not exists raw_app_meta_data  jsonb,
  add column if not exists raw_user_meta_data jsonb,
  add column if not exists confirmation_token         text,
  add column if not exists recovery_token             text,
  add column if not exists email_change               text,
  add column if not exists email_change_token_new     text,
  add column if not exists email_change_token_current text,
  add column if not exists phone_change               text,
  add column if not exists phone_change_token         text,
  add column if not exists reauthentication_token     text;
create extension if not exists pgcrypto;
EOSQL

echo '── Das Anlege-Skript läuft ──────────────────────────────────────────────'
DEMO_DB="$DB" bash "$HIER/../demo/anlegen.sh" | sed 's/^/  /'
echo

# ── Der eigentliche Lauf ────────────────────────────────────────────────────
AUSGABE="$($P -tA -f "$HIER/92_demo.sql" 2>&1)"
echo "$AUSGABE"
echo

JA="$(grep -c '✓' <<< "$AUSGABE" || true)"
NEIN="$(grep -c '✗' <<< "$AUSGABE" || true)"

# ═══════════════════════════════════════════════════════════════════════════════
#  DIE GEGENPROBEN — ohne sie ist ein grüner Lauf nur eine Behauptung
#
#  Beide greifen die Zusage an, die wirklich zählt: dass kein echter Mensch die
#  Demo-Welt sieht. Eine Prüfung, die auch dann grün ist, wenn die Sache kaputt
#  ist, prüft nichts (FALLEN.md, gleich mehrfach).
# ═══════════════════════════════════════════════════════════════════════════════
echo '── Gegenprobe 1: EIN Post auf public gestellt ───────────────────────────'
$P -c "update posts set visibility_kind = 'public'
        where id = 'dddddddd-dddd-dddd-dddd-ddddddddd0a2';" > /dev/null
G1="$($P -tA -f "$HIER/92_demo.sql" 2>&1 | grep -c '✗ IM FEED' || true)"
if [ "$G1" = "1" ]; then
  echo "  ✓ Der Angriff wird rot und nennt den Grund beim Namen"
else
  echo "  ✗ DER ANGRIFF MERKT ES NICHT — er prüft nicht, was er zu prüfen behauptet"
  NEIN=$((NEIN + 1))
fi
$P -c "update posts set visibility_kind = 'followers'
        where id = 'dddddddd-dddd-dddd-dddd-ddddddddd0a2';" > /dev/null

echo '── Gegenprobe 2: das echte Konto folgt einem Demo-Menschen ──────────────'
# Die schärfere der beiden: Hier ist an den POSTS nichts falsch. Falsch ist die
# BEZIEHUNG — und genau davon hängt die ganze Zusage ab.
$P -c "insert into follows (follower_id, followee_id)
       values ('eeeeeeee-0000-0000-0000-00000000ee01',
               'dddddddd-dddd-dddd-dddd-dddddddddd03') on conflict do nothing;" > /dev/null
G2="$($P -tA -f "$HIER/92_demo.sql" 2>&1 | grep -c '✗ IM FEED' || true)"
if [ "$G2" = "1" ]; then
  echo "  ✓ Auch das wird rot — geprüft wird die Sichtbarkeit, nicht das Feld"
else
  echo "  ✗ UNGEPRÜFT — die Zusage hängt an einer Beziehung, die niemand misst"
  NEIN=$((NEIN + 1))
fi
$P -c "delete from follows where follower_id = 'eeeeeeee-0000-0000-0000-00000000ee01';" > /dev/null

echo '── Der zweite Lauf: was er anfassen darf und was nicht ──────────────────'
# ═══════════════════════════════════════════════════════════════════════════════
#  Die teuerste Zusage des ganzen Demo-Zugangs steht hier, und sie ist doppelt:
#
#    · Das Passwort bleibt STEHEN. Sobald es in App Store Connect eingetragen ist,
#      macht ein stillschweigend neues den hinterlegten Zugang ungültig — und das
#      merkt niemand, bis der Reviewer es merkt. Es gibt keinen Fehler, kein Log,
#      keine Meldung: nur eine Ablehnung Tage später.
#    · Die ZEITEN frischen auf. Genau dafür wird das Skript ja ein zweites Mal
#      gerufen; täte es das nicht, liefe man vor jedem Einreichen ein Skript, das
#      nichts tut, und hielte den Feed für frisch.
#
#  Beide zusammen sind der Grund für das `case when :setze_passwort` in
#  `10_konto.sql`. Eine Bedingung, die nur in EINER Stellung gemessen wird, ist
#  eine ungeprüfte Bedingung — deshalb steht die Gegenprobe direkt daneben.
# ═══════════════════════════════════════════════════════════════════════════════
HASH1="$($P -tA -c "select encrypted_password from auth.users where id = 'dddddddd-dddd-dddd-dddd-dddddddddd01';")"
ZEIT1="$($P -tA -c "select starts_at from posts where id = 'dddddddd-dddd-dddd-dddd-ddddddddd0a1';")"
sleep 1
DEMO_DB="$DB" bash "$HIER/../demo/anlegen.sh" > /dev/null
HASH2="$($P -tA -c "select encrypted_password from auth.users where id = 'dddddddd-dddd-dddd-dddd-dddddddddd01';")"
ZEIT2="$($P -tA -c "select starts_at from posts where id = 'dddddddd-dddd-dddd-dddd-ddddddddd0a1';")"

if [ "$HASH1" = "$HASH2" ]; then
  echo "  ✓ Ein zweiter Lauf lässt das Passwort UNANGETASTET"
  JA=$((JA + 1))
else
  echo "  ✗ PASSWORT GEÄNDERT — der Zugang in App Store Connect wäre jetzt tot"
  NEIN=$((NEIN + 1))
fi

if [ "$ZEIT1" != "$ZEIT2" ]; then
  echo "  ✓ Ein zweiter Lauf frischt die Zeiten auf (das ist sein Zweck)"
  JA=$((JA + 1))
else
  echo "  ✗ ZEITEN STEHEN STILL — der Lauf vor dem Einreichen täte nichts"
  NEIN=$((NEIN + 1))
fi

# Gegenprobe zur Bedingung selbst: In der ANDEREN Stellung muss sie greifen.
# Ohne sie wäre „das Passwort bleibt stehen" auch dann grün, wenn das Skript
# NIE eines setzt — und das erste Konto hätte einen Hash, den niemand kennt.
DEMO_DB="$DB" bash "$HIER/../demo/anlegen.sh" --neues-passwort > /dev/null
HASH3="$($P -tA -c "select encrypted_password from auth.users where id = 'dddddddd-dddd-dddd-dddd-dddddddddd01';")"
if [ "$HASH2" != "$HASH3" ]; then
  echo "  ✓ Mit --neues-passwort ändert es sich wirklich (Gegenprobe zur Bedingung)"
  JA=$((JA + 1))
else
  echo "  ✗ --neues-passwort TUT NICHTS — die Bedingung ist in beiden Stellungen gleich"
  NEIN=$((NEIN + 1))
fi

echo '── Abräumen: geht die Demo-Welt auch wieder ganz weg? ───────────────────'
# `anlegen.sh --abraeumen` ist der Weg zurück, und er wird gebraucht, sobald die
# echten Menschen kommen. Ein Abräumen, das Reste lässt, merkt man erst, wenn ein
# echter Feed plötzlich eine erfundene Person enthält.
DEMO_DB="$DB" bash "$HIER/../demo/anlegen.sh" --abraeumen > /dev/null
REST="$($P -tA -c "
  select (select count(*) from auth.users        where id::text        like 'dddddddd-%')
       + (select count(*) from profiles          where id::text        like 'dddddddd-%')
       + (select count(*) from posts             where id::text        like 'dddddddd-%')
       + (select count(*) from join_requests     where id::text        like 'dddddddd-%')
       + (select count(*) from chat_threads      where id::text        like 'dddddddd-%')
       + (select count(*) from chat_participants where thread_id::text like 'dddddddd-%')
       + (select count(*) from messages          where id::text        like 'dddddddd-%')
       + (select count(*) from follows           where follower_id::text like 'dddddddd-%'
                                                    or followee_id::text like 'dddddddd-%');")"
if [ "$REST" = "0" ]; then
  echo "  ✓ Nach --abraeumen ist in acht Tabellen keine Demo-Zeile mehr übrig"
  JA=$((JA + 1))
else
  echo "  ✗ $REST ZEILEN BLEIBEN LIEGEN — das Abräumen ist unvollständig"
  NEIN=$((NEIN + 1))
fi

# Und es darf NUR das Eigene angefasst haben (harte Regel 83). Das fremde Konto
# aus Abschnitt 4 ist der Zeuge: Es steht daneben und muss den Lauf überleben.
ECHT="$($P -tA -c "select count(*) from profiles where id = 'eeeeeeee-0000-0000-0000-00000000ee01';")"
if [ "$ECHT" = "1" ]; then
  echo "  ✓ Das fremde Konto daneben ist unberührt (harte Regel 83)"
  JA=$((JA + 1))
else
  echo "  ✗ ZU VIEL GELÖSCHT — das Abräumen greift über die eigenen IDs hinaus"
  NEIN=$((NEIN + 1))
fi

echo
if [ "$NEIN" -gt 0 ]; then
  echo "✗ $NEIN Kreuze bei $JA Häkchen."
  exit 1
fi
echo "✓ $JA Häkchen, 0 Kreuze — dazu zwei Gegenproben."
