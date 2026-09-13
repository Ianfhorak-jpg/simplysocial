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
# Die Liste kommt aus dem ORDNER und steht nicht von Hand da.
#
# ⚠️ Bis zum 2026-09-13 standen hier neun getippte Zeilen. Genau diese Bauart hat
# in `einspielen.sh` `0008_bilder.sql` verschluckt (Phase 20.7): Die Datei lag im
# Ordner, das Skript kannte sie nicht, und **keine der neun nachgemessenen Zahlen
# hätte es gefunden.** Hier wäre es schlimmer gewesen als dort — ein Prüfstand,
# der eine Migration auslässt, misst grün an einer Datenbank, die es nicht gibt.
#
# Die lexikalische Sortierung ist richtig, WEIL jede Migration vier Ziffern
# trägt; ohne feste Stellenzahl liefe `0010` vor `0009`. Der Wächter fragt genau
# das, bevor irgendetwas läuft.
for M in $(ls -1 "$HIER"/../migrations/*.sql | sort); do
  B="$(basename "$M")"
  if ! [[ "$B" =~ ^[0-9]{4}_ ]]; then
    echo "✗ Migration ohne vierstellige Nummer: $B"
    echo "  Die Reihenfolge hängt an der Sortierung des Dateinamens."
    exit 1
  fi
  $PSQL -q -d ss -f "$M"
done
$PSQL -q -d ss -f "$HIER/05_daten.sql"
echo "Datenbank steht. Jetzt der Angriff:"
echo
$PSQL -tA -d ss -f "$HIER/10_angriff.sql"
$PSQL -tA -d ss -f "$HIER/20_transaktionen.sql"
$PSQL -tA -d ss -f "$HIER/25_bilder.sql"

# Das Wettrennen braucht ZWEI Verbindungen und geht deshalb nicht als .sql-Datei.
bash "$HIER/30_wettlauf.sh"

# Die Übersetzung (Phase 20.4) braucht Node und ÄNDERT die Datenbank — sie löst eine
# Gruppe auf und löscht einen Post, um die zwei Zustände herzustellen, die es im
# Prototyp nicht geben kann. Deshalb steht sie als LETZTE.
bash "$HIER/40_uebersetzung.sh"

# Die Moderation (Phase 20.7-b) steht GANZ am Ende, und zwar aus demselben Grund
# wie die Übersetzung darüber, nur schärfer: Sie LÖSCHT — einen Post und ein
# ganzes Konto. Alles, was danach käme, liefe auf einer Datenbank, in der Ian
# nicht mehr existiert.
bash "$HIER/98_moderation.sh"
