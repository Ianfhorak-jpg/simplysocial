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

echo "→ Typecheck"
npx tsc --noEmit

echo "→ Bauen"
rm -rf dist
npx expo export --platform web

# public/.nojekyll wird mitkopiert; ohne sie verschluckt Jekyll den _expo/-Ordner
# und die Seite lädt kein einziges Skript.
test -f dist/.nojekyll || { echo "ABBRUCH: dist/.nojekyll fehlt." >&2; exit 1; }

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
