# ═══════════════════════════════════════════════════════════════════════════════
#  Die Wegwerf-Datenbank hochfahren — der EINE Ort, an dem das steht.
#
#  Wird mit `source` geladen, nicht ausgeführt.  Aufruf:
#
#      source "$HIER/wegwerf-db.sh"   # setzt DATEN und PORT, fährt hoch
#
#  ── Warum das hier und nicht zweimal danebensteht ───────────────────────────
#  Bis zum 2026-09-26 stand derselbe Vierzeiler Zeichen für Zeichen in
#  `aufbauen.sh` UND `92_demo.sh`. Beide trugen denselben Fehler, und eine
#  Behebung an einer Stelle hätte die andere stehen gelassen.
#
#  ── 🔴 Der Fehler, den das hier behebt (FALLEN.md) ──────────────────────────
#  Dort stand:
#
#      [ -d "$DATEN" ] || initdb -D "$DATEN" …
#
#  Das fragt, ob es ein VERZEICHNIS gibt — gebraucht wird, ob es ein CLUSTER
#  gibt. macOS räumt `/tmp` periodisch auf und löscht dabei alte DATEIEN, nicht
#  die Verzeichnisse. Übrig bleibt ein vollständiger Ordnerbaum (`base/`,
#  `global/`, `pg_wal/`) OHNE `PG_VERSION` und ohne `postgresql.conf`. `[ -d ]`
#  liest das als gültiges Cluster, `initdb` wird übersprungen, und `pg_ctl`
#  scheitert mit
#
#      directory "/tmp/simplysocial-pgdata" is not a database cluster directory
#
#  — eine Meldung, die nach kaputtem Postgres aussieht und keines ist. Am
#  2026-09-26 genau so zugeschlagen: Die Server-Prüfung lief gar nicht an, und
#  das nach drei Tagen Pause, ohne dass irgendetwas am Code geändert war.
#
#  Die in FALLEN.md notierte Behebung war `rm -rf` von Hand. Handarbeit an einer
#  Sache, die alle paar Tage wiederkommt, ist keine Behebung — ein WEGWERF-
#  Cluster darf man wegwerfen, und zwar ohne zu fragen.
#
#  ⚠️ `PG_VERSION` ist die richtige Frage, nicht `postgresql.conf`: Sie ist die
#  Datei, an der `pg_ctl` selbst ein Cluster erkennt.
# ═══════════════════════════════════════════════════════════════════════════════
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
DATEN="${PGDATEN:-/tmp/simplysocial-pgdata}"
PORT=55432

command -v psql > /dev/null || { echo "✗ Kein psql. brew install postgresql@17"; exit 1; }

# Gefragt wird der PORT, nicht der Datenordner: Läuft auf 55432 schon ein Server
# (z. B. aus einer früheren Sitzung mit anderem Datenordner), würde ein zweiter
# Start dort scheitern — mit einer Meldung, die nach einem kaputten Cluster
# aussieht statt nach einem belegten Port.
if ! pg_isready -h 127.0.0.1 -p $PORT -q; then

  if [ ! -f "$DATEN/PG_VERSION" ]; then

    # Ein `rm -rf` auf eine Variable. `PGDATEN` kommt von aussen, also wird vorher
    # gefragt, ob der Pfad überhaupt einer sein KANN — und ob dort wirklich eine
    # Postgres-Leiche liegt. Ein fremder Ordner wird nicht angefasst, sondern
    # gemeldet: Wer sich bei `PGDATEN` vertippt, soll das lesen und nicht seine
    # Dateien verlieren.
    if [ -d "$DATEN" ]; then
      case "$DATEN" in
        /|/[A-Za-z]|/Users|/Users/*/|""|*/..*) echo "✗ PGDATEN sieht nicht nach einem Wegwerf-Ordner aus: $DATEN"; exit 1;;
      esac
      if [ -d "$DATEN/base" ] || [ -d "$DATEN/global" ] || [ -z "$(ls -A "$DATEN")" ]; then
        echo "· Halbe Postgres-Leiche in $DATEN (kein PG_VERSION) — wird neu gebaut."
        rm -rf "$DATEN"
      else
        echo "✗ $DATEN ist kein Cluster, aber auch keine Postgres-Leiche."
        echo "  Inhalt:"; ls -A "$DATEN" | head -5 | sed 's/^/    /'
        echo "  → Von Hand ansehen. Ich lösche keinen Ordner, den ich nicht erkenne."
        exit 1
      fi
    fi

    initdb -D "$DATEN" -U postgres --auth=trust > /dev/null
  fi

  pg_ctl -D "$DATEN" -o "-p $PORT -k /tmp -h 127.0.0.1" -l "$DATEN/pg.log" start > /dev/null
  sleep 2

  # `pg_ctl start` gibt auch 0 zurück, wenn der Server danach gleich wieder
  # stirbt. Gefragt wird deshalb der Server, nicht der Startbefehl.
  pg_isready -h 127.0.0.1 -p $PORT -q || {
    echo "✗ Der Server läuft nach dem Start nicht. Letzte Zeilen aus $DATEN/pg.log:"
    tail -5 "$DATEN/pg.log" 2>/dev/null | sed 's/^/    /'
    exit 1
  }
fi
