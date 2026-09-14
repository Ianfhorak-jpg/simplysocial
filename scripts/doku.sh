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
#
# ── 🔴 `_gedaechtnis/` fehlte, und zwar einen Tag lang unbemerkt ─────────────
# Am 2026-09-13 zog Phase 20 das Langzeitgedächtnis aus CLAUDE.md heraus in
# `_gedaechtnis/` — HISTORIE (Phase 0 bis 20.9), HARTE_REGELN (alle 111 im
# Volltext) und FALLEN (179 Stück). **Dieses Skript wurde nicht nachgezogen.**
# Gefunden am 14.09. beim Anhängen von Regel 111: 440 kB Projektgedächtnis, in
# keinem Backup, seit einem Tag.
#
# Das ist die Falle *„Eine Liste von Dateinamen in einem Skript wird irgendwann
# nicht nachgezogen"* — dieselbe, die `einspielen.sh` schon einmal `0008`
# verschlucken liess, und dieselbe, die `60_konto.sh` in dieser Woche zweimal
# getroffen hat. Hier wog sie schwerer als sonst: **Der Index in CLAUDE.md trägt
# nur noch die TITEL.** Wäre `_gedaechtnis/` verloren gegangen, stünde von 111
# Regeln und 179 Fallen je eine Zeile da — und die Begründung, in der in diesem
# Projekt fast immer die Lehre steckt, wäre weg.
#
# Deshalb steht unten eine SCHLEIFE über den Ordner und keine Aufzählung: Eine
# vierte Datei in `_gedaechtnis/` käme von allein mit.

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

# _gedaechtnis: der Volltext von Historie, Regeln und Fallen. Seit dem 14.09.
# — der Grund steht oben. Aus dem ORDNER gelesen, nicht aufgezählt.
mkdir -p "$ZIEL/_gedaechtnis"
test -d "$OBEN/_gedaechtnis" || { echo "ABBRUCH: $OBEN/_gedaechtnis fehlt." >&2; exit 1; }
find "$OBEN/_gedaechtnis" -maxdepth 1 -name '*.md' -exec cp {} "$ZIEL/_gedaechtnis/" \;

# Ein leerer Spiegel ist gefährlicher als gar keiner: Er sieht aus wie eine
# Sicherung. Gezählt wird, was wirklich ankam.
GEDAECHTNIS_DA=$(find "$ZIEL/_gedaechtnis" -name '*.md' | wc -l | tr -d ' ')
if [ "$GEDAECHTNIS_DA" -lt 3 ]; then
  echo "ABBRUCH: nur $GEDAECHTNIS_DA Datei(en) in doku/_gedaechtnis/ — erwartet mindestens 3" >&2
  exit 1
fi

echo "→ Doku aufgefrischt: doku/ ($(find "$ZIEL" -name '*.md' | wc -l | tr -d ' ') Dateien, davon LIESMICH.md eigen)"
