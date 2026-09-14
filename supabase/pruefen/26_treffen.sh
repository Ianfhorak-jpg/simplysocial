#!/usr/bin/env bash
# Einzellauf des Treffen-Prüfstands (Phase 20.12) — für den vollen Durchgang
# reicht `bash supabase/pruefen/aufbauen.sh`, dort läuft er mit.
#
# Er setzt eine Datenbank voraus, die schon steht (der Aufbau baut sie), und räumt
# vorne wie hinten hinter sich auf — deshalb darf er auch neben echten Daten laufen
# (harte Regel 83: nur eigene IDs, alle beginnen mit `2600…`).
set -euo pipefail
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
HIER="$(cd "$(dirname "$0")" && pwd)"
psql -h 127.0.0.1 -p 55432 -U postgres -d ss -v ON_ERROR_STOP=1 -f "$HIER/26_treffen.sql"
