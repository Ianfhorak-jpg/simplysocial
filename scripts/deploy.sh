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

# ── Sind die DIREKTLINKS wirklich entstanden? (2026-09-13, Phase 20.8) ───────
#
# Die Prüfung, die hier bis heute fehlte — und die einzige, die den Zweck der
# Adresse misst. Ein Link auf EINEN Post ist auf dieser Seite der Normalfall
# (harte Regel 5, seit Phase 8): eine Nachricht in der WhatsApp-Gruppe, ein
# Neuladen am Handy. Damit `/post/p4` auf einem Datei-Hoster überhaupt etwas
# findet, muss beim Bauen eine echte `dist/post/p4.html` entstehen; das leistet
# `generateStaticParams` aus `src/features/statisch.ts`.
#
# ⚠️ Warum der Schalter-Wächter dreissig Zeilen weiter oben das NICHT abdeckt:
# Er fragt, ob `ANMELDE_QUELLE` auf `'attrappe'` steht. Wer `statisch.ts` löscht
# oder einen der sechs `generateStaticParams`-Aufrufe aus einem Screen nimmt,
# lässt den Schalter dabei unberührt — der Wächter ist zufrieden, der Deploy
# läuft durch, und danach ist jeder weitergeschickte Link ein 404. **Es gäbe
# keine Fehlermeldung**, weil Expo Router dann einfach `post/[id].html` schreibt,
# mit eckigen Klammern im Dateinamen. Zwei Gründe an einem Wächter sind einer zu
# viel: Wird der Schalter-Wächter eines Tages neu gefasst (sein eigener Text
# lädt dazu ein), fiele dieser Schutz lautlos mit weg.
#
# Gemessen am 2026-09-13, beide Schalterstellungen, je ein voller Export:
#   'attrappe' → 72 HTML-Dateien, davon 47 konkrete Adressen
#   'supabase' → 25 HTML-Dateien, davon  0 konkrete Adressen
#
# ── Wie GEZÄHLT wird, und warum nicht einfach `grep -v '['` ──────────────────
#
# Der erste Entwurf zählte jede HTML-Datei ohne eckige Klammern im Pfad. Gemessen
# an den zwei Exporten: 'attrappe' 48, 'supabase' **1** — und die eine ist
# `gruppe/neu.html`. Die ist keine erzeugte Adresse, sondern eine STATISCHE Route
# (`src/app/gruppe/neu.tsx`); `generateStaticParams` hat mit ihr nichts zu tun.
# **Ein `-eq 0` hätte den Deploy also genau in dem Zustand durchgelassen, gegen
# den dieser Wächter gebaut ist.** Der Kommentar in `statisch.ts` warnt wörtlich
# davor — gelesen und trotzdem hineingelaufen.
#
# Ausgenommen wird deshalb nicht ein NAME (das wäre eine zweite Quelle, die beim
# nächsten statischen Screen veraltet), sondern die EIGENSCHAFT: Zu einer
# statischen Route gibt es eine gleichnamige Quelldatei unter `src/app/`. Der
# Wächter sieht selbst nach.
#
# ⚠️ Und `find … | grep -v …` darf hier gar nicht stehen: Bleibt keine Zeile
# übrig, gibt `grep` EXIT 1, `pipefail` reicht das durch und `set -e` tötet das
# Skript — **stumm, vor jeder Fehlermeldung.** Genau der Fall, um den es geht.
zaehle_familie() {
  local ORDNER="$1" ANZAHL=0 HTML ROUTE
  while IFS= read -r HTML; do
    case "$HTML" in *'['*) continue ;; esac          # post/[id].html — das Muster
    ROUTE="${HTML#dist/}"; ROUTE="${ROUTE%.html}"
    if [ -f "src/app/$ROUTE.tsx" ]; then continue; fi # gruppe/neu — statische Route
    ANZAHL=$((ANZAHL + 1))
  done < <(find "dist/$ORDNER" -name '*.html' 2>/dev/null)
  echo "$ANZAHL"
}

POSTS=$(zaehle_familie post)
PROFILE=$(zaehle_familie user)
CHATS=$(zaehle_familie chat)
GRUPPEN=$(zaehle_familie gruppe)
ECHTE=$((POSTS + PROFILE + CHATS + GRUPPEN))

# ── TODO(Ian): wie streng ist die Latte? ─────────────────────────────────────
# Gezählt ist jetzt sauber — offen ist, wann der Deploy abbrechen soll. Die vier
# Zahlen stehen als $POSTS $PROFILE $CHATS $GRUPPEN bereit, die Summe als $ECHTE.
# Gemessen am 2026-09-13: 'attrappe' → 20 / 18 / 4 / 5 (= 47), 'supabase' → 0 / 0 / 0 / 0.
#
#   (c) "je Familie mindestens eine" — vier Vergleiche auf > 0.
#       Fängt: Datei gelöscht, ein Screen-Aufruf entfernt, falsche Stellung,
#              und auch den Ausfall EINER Familie (z. B. nur die Chats fehlen).
#       Fängt NICHT: wenn von zwanzig Posts nur noch einer entsteht.
#       Kostet keine zweite Quelle — der Wächter weiss nichts, was er nicht sieht.
#
#   (d) "genau die erwarteten Zahlen" — 20 / 18 / 4 / 5 hart hingeschrieben.
#       Schärfer, fängt auch den Teilausfall.
#       Der Preis: Diese Zahlen stünden ZWEIMAL da (in mock.ts und hier). Wer
#       einen Post ergänzt, muss hier nachziehen, sonst bricht ein Deploy ab, an
#       dem nichts kaputt ist — die Falle aus harter Regel 53 (PROJEKTION).
#
# Die Bedingung unten ist ein PLATZHALTER, keine Entscheidung (18d-Lehre):
# Sie fängt heute nur den Totalausfall.
if [ "$ECHTE" -eq 0 ]; then
  echo "ABBRUCH: keine einzige konkrete Adresse gebaut (dist/post/p1.html & Co.)." >&2
  echo "         Gezählt: $POSTS Posts, $PROFILE Profile, $CHATS Chats, $GRUPPEN Gruppen." >&2
  echo >&2
  echo "  Jeder weitergeschickte Link wäre ein 404. Drei mögliche Ursachen:" >&2
  echo "    1. src/features/statisch.ts fehlt oder gibt leere Listen zurück" >&2
  echo "    2. ein Screen hat sein generateStaticParams verloren — es sind sechs:" >&2
  echo "       post/[id], user/[id]/index, .../follower, .../following," >&2
  echo "       chat/[id], gruppe/[id]" >&2
  echo "    3. der Store startet leer, obwohl der Schalter auf 'attrappe' steht" >&2
  echo "       (startListen() in features/store.ts, seit Phase 20.4-b)" >&2
  exit 1
fi
echo "  ✓ $ECHTE konkrete Adressen ($POSTS Posts, $PROFILE Profile, $CHATS Chats, $GRUPPEN Gruppen)"

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
