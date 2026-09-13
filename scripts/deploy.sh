#!/usr/bin/env bash
#
# Prototyp bauen und auf GitHub Pages schieben.  Aufruf:  npm run deploy
#
# Ergebnis:  https://ianfhorak-jpg.github.io/simplysocial/
#
# ── Warum ein eigener Zweig und nicht `main` ─────────────────────────────────
# Auf `main` liegt der Quellcode, auf `gh-pages` das GEBAUTE Bündel. Beides in
# einem Zweig hieße, `dist/` mitzuversionieren — 2 MB erzeugte Dateien, die sich
# bei jeder Änderung komplett unterscheiden. Der Verlauf wäre nach zehn Deploys
# unlesbar. Deshalb bekommt `gh-pages` bei jedem Deploy genau EINEN Commit
# (`--force`): Was dort steht, ist kein Verlauf, sondern ein Zustand.
#
# ── Was hier NICHT passieren darf ────────────────────────────────────────────
# `experiments.baseUrl` in app.json muss auf "/simplysocial" stehen — das ist der
# Unterordner, in dem GitHub Pages die Seite ausliefert. Ohne das laden alle
# Skripte von "/" und die Seite bleibt weiß. Das Skript prüft es unten.

set -euo pipefail

REPO="https://github.com/Ianfhorak-jpg/simplysocial.git"
WURZEL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$WURZEL"

if ! grep -q '"baseUrl": "/simplysocial"' app.json; then
  echo "ABBRUCH: experiments.baseUrl fehlt in app.json — die Seite bliebe weiß." >&2
  exit 1
fi

# ── Der Schalter: steht hier wirklich der PROTOTYP? (2026-09-13) ─────────────
#
# Anlass ist Ians Entscheidung 56, und sie hat diese Prüfung nötig GEMACHT statt
# überflüssig. Vorher fiel ein versehentlich umgelegter Schalter von selbst auf:
# Auf der öffentlichen Adresse standen dann zwei tote Knöpfe (Apple und Google
# gehen im Browser gar nicht, harte Regel 94) und darüber ein Vollbild, das „Es
# gibt keinen Login" behauptete. Das sieht kaputt aus, also sieht man es.
#
# Seit Entscheidung 56 erscheint genau dieses Vollbild bei `'supabase'` NICHT
# mehr. Ein versehentlicher Deploy sähe damit sauber aus — und läge mit ECHTEN
# Daten und einer echten Anmeldung auf einer Adresse, die Ian per WhatsApp
# weitergibt. **Die Verbesserung hat das Warnsignal weggenommen; hier kommt es
# als Messung zurück.**
#
# ⚠️ Warum ausnahmsweise die QUELLE geprüft wird und nicht das Ergebnis — anders
# als bei der baseUrl dreissig Zeilen weiter unten: Dort war die Wahrheit in eine
# ZWEITE Datei gewandert (`app.config.js`), und die Prüfung las die erste. Hier
# gibt es nur eine Quelle, und die überlebt das Bündeln nicht: Der Minifier löst
# `ANMELDE_QUELLE === 'attrappe'` zu einem Wahrheitswert auf, die Zeichenkette
# kann verschwinden. Eine Prüfung, die MANCHMAL nichts findet, ist schlechter als
# eine, die immer dieselbe Zeile liest.
QUELLE="src/features/auth/anmeldung.ts"
if ! grep -q "^export const ANMELDE_QUELLE.* = 'attrappe';" "$QUELLE"; then
  echo "ABBRUCH: ANMELDE_QUELLE steht nicht auf 'attrappe'." >&2
  echo "  Gefunden: $(grep -m1 'export const ANMELDE_QUELLE' "$QUELLE" | sed 's/^ *//')" >&2
  echo >&2
  echo "  Der Deploy geht auf die ÖFFENTLICHE Adresse. Mit 'supabase' läge dort" >&2
  echo "  eine echte Anmeldung auf echten Daten — und seit Entscheidung 56 ohne" >&2
  echo "  den Hinweis, der sagt, dass es ein Prototyp ist." >&2
  echo >&2
  echo "  Ist das Absicht, gehört der Satz in PrototypHinweis.tsx vorher neu" >&2
  echo "  geschrieben (harte Regel 22 — er ist Ians) und diese Prüfung hier mit." >&2
  echo "  Für einen GERÄTEbuild ist sie nicht im Weg: 'npm run geraet' ist ein" >&2
  echo "  anderer Befehl und fasst gh-pages nicht an (harte Regel 35)." >&2
  exit 1
fi

echo "→ Typecheck"
npx tsc --noEmit

echo "→ Bauen"
rm -rf dist
# SS_WEB_EXPORT sagt `app.config.js`, dass die baseUrl gesetzt werden soll. Seit dem
# 2026-09-07 steht sie NICHT mehr unbedingt in der Config: Metro stellt sie sonst auch
# den iOS-Asset-Pfaden voran, und dort kollidiert der Ordner `simplysocial/` mit der
# Binärdatei `SimplySocial` (macOS unterscheidet die Groß-/Kleinschreibung nicht).
# Die Begründung steht ganz in `app.config.js`.
SS_WEB_EXPORT=1 npx expo export --platform web

# public/.nojekyll wird mitkopiert; ohne sie verschluckt Jekyll den _expo/-Ordner
# und die Seite lädt kein einziges Skript.
test -f dist/.nojekyll || { echo "ABBRUCH: dist/.nojekyll fehlt." >&2; exit 1; }

# Die Prüfung oben liest app.json, die Wahrheit steht aber seit dem 2026-09-07 in
# `app.config.js` — also wird hier das ERGEBNIS geprüft, nicht die Absicht. Ohne
# baseUrl lädt das gebaute HTML seine Skripte von "/" und die Seite bleibt weiß.
grep -q '"/simplysocial/_expo/' dist/index.html || {
  echo "ABBRUCH: dist/index.html lädt nicht aus /simplysocial/ — baseUrl kam nicht an." >&2
  echo "         Prüfen: app.config.js (SS_WEB_EXPORT) und app.json." >&2
  exit 1
}

echo "→ Hochladen"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
cp -R dist/. "$TMP/"
cd "$TMP"
git init -q -b gh-pages
git add -A
git -c user.name="Ian" -c user.email="Ian.fhorak@gmail.com" \
    commit -q -m "Prototyp-Bündel ($(date +%Y-%m-%d\ %H:%M))"
git push -q --force "$REPO" gh-pages

echo "✓ https://ianfhorak-jpg.github.io/simplysocial/  (ein bis zwei Minuten bis sichtbar)"
