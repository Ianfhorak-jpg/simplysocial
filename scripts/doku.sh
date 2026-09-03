#!/usr/bin/env bash
#
# Die Projekt-Doku in den Ordner `doku/` kopieren, damit sie mitversioniert wird.
# Aufruf:  npm run doku      (läuft ausserdem automatisch vor jedem Commit)
#
# ── Warum eine Kopie und kein Hardlink ───────────────────────────────────────
# PLAN.md, CLAUDE.md und _FUER_IAN/ liegen eine Ebene ÜBER dem Repo. Git kann
# nichts einpacken, was ausserhalb der Wurzel liegt — es bleiben drei Wege:
#
#   Hardlink   elegant, aber bricht LAUTLOS: viele Editoren schreiben eine neue
#              Datei und benennen sie um, statt die alte zu beschreiben. Danach
#              zeigen zwei Namen auf zwei verschiedene Inhalte und niemand merkt es.
#   Symlink    Git speichert den Link, nicht den Inhalt — auf GitHub stünde ein
#              toter Verweis nach draussen. Als Sicherung wertlos.
#   Kopie      veraltet, wenn man sie vergisst. Genau das ist bei `landing/stil.css`
#              (harte Regel 13) das bekannte Problem.
#
# Also Kopie — aber das Vergessen ist abgestellt: `.git/hooks/pre-commit` ruft
# dieses Skript bei JEDEM Commit auf und legt das Ergebnis gleich mit dazu.
#
# ── Was NICHT mitkommt ──────────────────────────────────────────────────────
# Die grosse CLAUDE.md in C.C.Projekts_Ian/ gehört allen 33 Projekten, nicht
# diesem. Sie hat hier nichts verloren.

set -euo pipefail

WURZEL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OBEN="$(cd "$WURZEL/.." && pwd)"
ZIEL="$WURZEL/doku"

mkdir -p "$ZIEL/_FUER_IAN"

for f in PLAN.md CLAUDE.md; do
  test -f "$OBEN/$f" || { echo "ABBRUCH: $OBEN/$f fehlt." >&2; exit 1; }
  cp "$OBEN/$f" "$ZIEL/$f"
done

# _FUER_IAN: nur Text. Ergebnisse (Videos, PDFs) gehören nicht ins Repo.
find "$OBEN/_FUER_IAN" -maxdepth 1 -name '*.md' -exec cp {} "$ZIEL/_FUER_IAN/" \;

echo "→ Doku kopiert nach doku/ ($(find "$ZIEL" -name '*.md' | wc -l | tr -d ' ') Dateien)"
