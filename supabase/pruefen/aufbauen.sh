#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  Baut die Datenbank lokal neu auf und lässt den Angriff laufen.
#
#  Warum lokal und nicht gegen Supabase: RLS ist ein POSTGRES-Feature, kein
#  Supabase-Feature. Alles, was `0002_policies.sql` tut, lässt sich hier prüfen —
#  ohne Konto, ohne Netz, ohne dass ein Fehlversuch echte Daten trifft. Was Supabase
#  mitbringt (`auth.users`, `auth.uid()`), steht in `00_supabase_lokal.sql`.
#
#  Voraussetzung:  brew install postgresql@17
#  Aufruf:         bash supabase/pruefen/aufbauen.sh
# ═══════════════════════════════════════════════════════════════════════════════
set -e
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
HIER="$(cd "$(dirname "$0")" && pwd)"
DATEN="${PGDATEN:-/tmp/simplysocial-pgdata}"
PORT=55432
PSQL="psql -h 127.0.0.1 -p $PORT -U postgres -v ON_ERROR_STOP=1"

# Gefragt wird der PORT, nicht der Datenordner: Läuft auf 55432 schon ein Server
# (z. B. aus einer früheren Sitzung mit anderem Datenordner), würde ein zweiter
# Start dort scheitern — mit einer Meldung, die nach einem kaputten Cluster aussieht
# statt nach einem belegten Port.
if ! pg_isready -h 127.0.0.1 -p $PORT -q; then
  [ -d "$DATEN" ] || initdb -D "$DATEN" -U postgres --auth=trust > /dev/null
  pg_ctl -D "$DATEN" -o "-p $PORT -k /tmp -h 127.0.0.1" -l "$DATEN/pg.log" start > /dev/null
  sleep 2
fi

$PSQL -q -c "drop database if exists ss;" -c "create database ss;" > /dev/null 2>&1
$PSQL -q -d ss -f "$HIER/00_supabase_lokal.sql"
$PSQL -q -d ss -f "$HIER/../migrations/0001_schema.sql"
$PSQL -q -d ss -f "$HIER/../migrations/0002_policies.sql"
$PSQL -q -d ss -f "$HIER/../migrations/0003_konto_loeschen.sql"
$PSQL -q -d ss -f "$HIER/05_daten.sql"
echo "Datenbank steht. Jetzt der Angriff:"
echo
$PSQL -tA -d ss -f "$HIER/10_angriff.sql"
