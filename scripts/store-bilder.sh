#!/usr/bin/env bash
#
# Die Bilder für den App Store holen.  Aufruf:  npm run store-bilder
#
# ── Warum es das gibt ────────────────────────────────────────────────────────
# Am 2026-09-26 zum ersten Mal die ganze Einreich-Liste bei Apple abgefragt: Von
# zehn Punkten waren neun offen, und einer davon war **„bei Apple liegt kein
# einziges Bild"**. In diesem Projekt gab es Store-Bilder nicht einmal als Datei.
#
# Von Hand hiesse das für Ian: Simulator starten, anmelden, durch sieben
# Bildschirme klicken, jedes einzeln knipsen, Grösse prüfen. Genau die Handarbeit,
# die hier nicht bei ihm anfallen soll.
#
# ── 🔴 Der Grund, warum das überhaupt geht: `'attrappe'` ─────────────────────
# Mit `ANMELDE_QUELLE = 'attrappe'` startet die App **bereits angemeldet**
# (`store.ts:260` gibt `attrappeSitzung()` zurück). Der Torwächter zeigt sofort
# `'app'`, und damit greifen Deep Links — ohne eine einzige Berührung.
#
# Mit `'supabase'` ginge es NICHT: Dort steht der Torwächter davor, jeder Deep
# Link landet stumm auf `<Anmelden />` (FALLEN.md), und man bräuchte ein
# angemeldetes Demo-Konto im Simulator.
#
# **Und `'attrappe'` ist hier nicht nur der bequemere, sondern der RICHTIGE
# Stand:** Store-Bilder mit echten Daten zeigten echte Menschen — Namen, Bezirke,
# Profilbilder. `mock.ts` enthält nichts Persönliches (harte Regel 12).
#
# ⚠️ **Der Schalter muss danach zurück.** Dieses Skript stellt ihn NICHT um und
# baut auch nicht — es prüft nur, dass er passt, und sagt sonst, was zu tun ist.
# Umstellen und zurückstellen ist ein bewusster Handgriff und keine Nebenwirkung.
#
# ── Was Apple verlangt ───────────────────────────────────────────────────────
# Das Pflichtformat ist das 6,9"-iPhone: **1320 × 2868**. Apple skaliert davon
# für alle kleineren Geräte herunter, ein zweiter Satz ist nicht nötig.
#
# 🔴 **Ians eigenes iPhone 16 taugt dafür NICHT** — es liefert 1179 × 2556, und
# das ist keine der Grössen, die Apple annimmt. `npm run knipsen` ist zum MESSEN
# da, nicht für den Store. Deshalb der Simulator „iPhone 17 Pro Max".
set -euo pipefail

WURZEL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$WURZEL"

ZIEL="${SS_STORE_ZIEL:-$WURZEL/../_FUER_IAN/App-Store-Screenshots}"
export GERAET="${GERAET:-iPhone 17 Pro Max}"
SOLL_B=1320
SOLL_H=2868

# ── Schritt 1: Steht der Schalter richtig? ───────────────────────────────────
# Zuerst, weil alles danach sonst Bilder eines Anmelde-Bildschirms wären — und
# die sehen aus wie ein Ergebnis.
QUELLE="$(grep -oE "ANMELDE_QUELLE: 'attrappe' \| 'supabase' = '[a-z]+'" \
          src/features/auth/anmeldung.ts | grep -oE "'[a-z]+';?$" | tr -d "';")"
if [ "$QUELLE" != "attrappe" ]; then
  echo "✗ ANMELDE_QUELLE steht auf '$QUELLE', gebraucht wird 'attrappe'."
  echo
  echo "  Mit 'supabase' steht der Torwaechter davor: Jeder Deep Link landet"
  echo "  stumm auf <Anmelden />, und herauskaemen sieben Bilder desselben"
  echo "  Anmeldebildschirms."
  echo
  echo "  → in src/features/auth/anmeldung.ts auf 'attrappe' stellen,"
  echo "    danach EINMAL neu bauen, und hinterher NICHT vergessen"
  echo "    zurueckzustellen (deploy.sh und geraet-bauen.sh bewachen das)."
  exit 1
fi
echo "Schalter: attrappe ✓   Geraet: $GERAET"

# ── Schritt 2: Die Bildfolge ─────────────────────────────────────────────────
#
# ⚠️ **Die REIHENFOLGE und die Auswahl gehoeren Ian**, nicht diesem Skript. Was
# im Store auf Platz 1 steht, ist eine Marketing-Entscheidung und liegt in
# `34_SimplySocial_Marketing`. Hier entsteht das ROHMATERIAL — lieber eines zu
# viel als eines zu wenig, aussuchen kann man danach.
#
# Die Folge erzaehlt trotzdem eine: die Schleife des Produkts, so wie sie in
# CLAUDE.md steht — posten → „Bin dabei" → bestaetigen → Chat.
#
# 🔴 Die KARTE fehlt hier und das ist kein Versehen: Sie ist ein Zustand des
# Start-Screens (`ansicht`), keine Route. Ohne Tippen ist sie nicht erreichbar,
# und `schirm.sh` tippt mit Absicht nicht. Dafuer waere `scripts/tippen.sh`
# zustaendig — der braucht die Bedienungshilfen-Berechtigung.
BILDER=(
  "/                  01-stapel"        # der Wischstapel — der Kern der App
  "/create            02-posten"        # eine Aktivitaet einstellen
  "/(tabs)/requests   03-anfragen"      # wer mitkommen will
  # ⚠️ `/match` ist die EINZIGE Route hier, die Parameter braucht
  # (`useLocalSearchParams<{postId, userId}>`, match.tsx:29). Ohne sie stuende
  # ein leerer Bildschirm da — und der saehe aus wie ein Ergebnis.
  # `p1` ist „Tennis spielen, 1220" von `u_lea`: genau das Beispiel, mit dem
  # CLAUDE.md die App erklaert.
  "/match?postId=p1&userId=u_lea  04-match"
  "/(tabs)/chats      05-chats"         # danach wird geredet
  "/chat/t1           06-chat"          # ein Gespraech
  "/(tabs)/profile    07-profil"        # das eigene Konto
  "/gruppen           08-gruppen"       # die Gruppen
)

mkdir -p "$ZIEL"
GEMACHT=0; DANEBEN=0

# 🔴 Vorhaenge wegraeumen, bevor geknipst wird. Ohne das trug das erste Bild des
# ersten Laufs (2026-09-26) gleich zwei Schichten: iOS' „In SimplySocial
# oeffnen?" und den Prototyp-Hinweis. Der Hinweis kommt in der Attrappe bei
# JEDEM Start wieder — sein Merker ist `sessionStorage`, und die gibt es am
# Geraet nicht. Deshalb vor jedem Bild, nicht einmal am Anfang.
export SS_VOR_KNIPSEN="python3 '$WURZEL/scripts/vorhang-weg.py'"

# schirm.sh legt nach `_belege/` ab, NICHT nach `_schirm/`. Im ersten Lauf stand
# hier `_schirm/`, `ls` fand nichts, und unter `set -euo pipefail` hat die leere
# Kommandoersetzung das Skript STUMM getoetet — nach genau einem Bild, ohne eine
# Zeile Fehlermeldung. Das ist die Falle „find … | grep -v … unter set -e toetet
# das Skript stumm", nur mit `ls`.
BELEGE="$(cd "$WURZEL/.." && pwd)/_belege"

for eintrag in "${BILDER[@]}"; do
  ROUTE="$(echo "$eintrag" | awk '{print $1}')"
  NAME="$(echo "$eintrag" | awk '{print $2}')"
  echo
  echo "── $NAME  ($ROUTE)"
  if ! bash scripts/schirm.sh "$ROUTE" "$NAME" > /tmp/store-bild.log 2>&1; then
    echo "  ✗ schirm.sh ist gescheitert:"
    tail -4 /tmp/store-bild.log | sed 's/^/     /'
    DANEBEN=$((DANEBEN + 1))
    continue
  fi

  # `|| true` ist hier kein Schoenheitsfehler, sondern die Behebung von oben:
  # Eine leere Kommandoersetzung darf das Skript nicht toeten, sie ist ein
  # BEFUND und soll als solcher gemeldet werden.
  QUELLBILD="$(ls -t "$BELEGE/$NAME".png 2>/dev/null | head -1 || true)"
  if [ -z "$QUELLBILD" ]; then
    echo "  ✗ schirm.sh meldete Erfolg, aber es liegt keine Datei da."
    DANEBEN=$((DANEBEN + 1))
    continue
  fi

  # ⚠️ Die GROESSE wird gemessen, nicht angenommen. Ein Bild in der falschen
  # Groesse nimmt Apple beim Hochladen klaglos an und weist es erst spaeter
  # zurueck — dieselbe Klasse wie `assetDeliveryState`.
  B="$(/usr/bin/sips -g pixelWidth "$QUELLBILD" | awk '/pixelWidth/ {print $2}')"
  H="$(/usr/bin/sips -g pixelHeight "$QUELLBILD" | awk '/pixelHeight/ {print $2}')"
  # VERSCHIEBEN, nicht kopieren: `_belege/` traegt eine eigene
  # Namenskonvention (`au01`, `at13`, …) und ist das Register fuer MESSUNGEN.
  # Store-Bilder gehoeren nicht hinein, sie wuerden es nur zuwachsen lassen.
  mv "$QUELLBILD" "$ZIEL/$NAME.png"
  if [ "$B" = "$SOLL_B" ] && [ "$H" = "$SOLL_H" ]; then
    echo "  ✓ $NAME.png  ${B}×${H}"
    GEMACHT=$((GEMACHT + 1))
  else
    echo "  ⚠ $NAME.png  ${B}×${H} — Apple verlangt ${SOLL_B}×${SOLL_H}."
    echo "    Anderer Simulator? GERAET=\"iPhone 17 Pro Max\""
    DANEBEN=$((DANEBEN + 1))
  fi
done

echo
echo "════ $GEMACHT in der richtigen Groesse · $DANEBEN daneben ════"
echo "Abgelegt in: $ZIEL"
echo
echo "🔴 NICHT VERGESSEN: ANMELDE_QUELLE zurueck auf 'supabase',"
echo "   sonst baut der naechste Geraetebau die Attrappe aufs iPhone."
[ "$DANEBEN" -eq 0 ]
