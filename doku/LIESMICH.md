# `doku/` — die Projekt-Doku, mitversioniert

**Hier wird nichts bearbeitet.** Die Dateien in diesem Ordner sind Kopien. Wer sie
hier ändert, verliert die Änderung beim nächsten Commit.

## Wo das Original liegt

| Kopie hier | Original |
|---|---|
| `doku/PLAN.md` | `../PLAN.md` — die Source of Truth des Projekts |
| `doku/CLAUDE.md` | `../CLAUDE.md` — Kontext für Claude Code |
| `doku/_FUER_IAN/*.md` | `../_FUER_IAN/*.md` — die Texte für Ian |

Die Originale liegen eine Ebene **über** der Repo-Wurzel, und Git kann nichts
einpacken, was ausserhalb liegt. Deshalb die Kopie.

## Warum es diesen Ordner gibt

Bis zum 03.09.2026 lag die gesamte Doku in **gar keinem** Repo — PLAN.md allein
2.587 Zeilen. Die einzige Sicherung war iCloud, und iCloud spiegelt nur: Was hier
kaputtgeht, geht dort mit kaputt. Es gab keine Version zum Zurückspringen.

Dasselbe galt für den Quellcode. `npm run deploy` schiebt nur den **gebauten**
Zweig `gh-pages` hoch und fasst `main` nie an — dadurch stand als Quellcode noch
„Phase 0 bis 8" vom 01.09., während neun Phasen Arbeit nur lokal lagen.

## Wie die Kopie aktuell bleibt

`scripts/doku.sh` kopiert. Aufgerufen wird es automatisch von
`.git/hooks/pre-commit`, also bei **jedem** Commit — die Aktualität hängt damit
nicht an Disziplin. Von Hand geht es mit `npm run doku`.

> ⚠️ **Nach einem frischen `git clone` fehlt der Hook.** Git-Hooks liegen in
> `.git/hooks/` und werden nicht mitversioniert. Ohne ihn veraltet dieser Ordner
> wieder still. Zum Wiederherstellen:
>
> ```bash
> printf '#!/usr/bin/env bash\nset -euo pipefail\nW="$(git rev-parse --show-toplevel)"\nbash "$W/scripts/doku.sh"\ngit add "$W/doku"\n' > .git/hooks/pre-commit
> chmod +x .git/hooks/pre-commit
> ```

> ⚠️ **Eine Lücke, die der Hook nicht schließen kann:** Wenn sich **NUR** die Doku
> geändert hat und keine einzige Datei im Repo, hält Git den Commit für leer und bricht
> ab — **bevor** der Hook läuft. Der Hook frischt `doku/` dann zwar auf und merkt es vor,
> aber die Entscheidung ist schon gefallen. Es sieht aus, als hätte er versagt; er kam
> nur zu spät. Der zweite Versuch geht durch, weil jetzt etwas vorgemerkt ist. Sauberer
> ist es andersherum:
>
> ```bash
> npm run doku && git add -A && git commit -m "…"
> ```

## Was NICHT hier landet

Die grosse `CLAUDE.md` aus `C.C.Projekts_Ian/` gehört allen 33 Projekten, nicht
diesem. Und aus `_FUER_IAN/` kommt nur Text mit — Ergebnisse wie Videos oder PDFs
gehören nicht in ein Git-Repo.
