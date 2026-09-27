#!/usr/bin/env bash
#
# Den SIMULATOR antippen.  Aufruf:
#
#     npm run tippen 660 1745            Gerätepixel (wie im simctl-Screenshot)
#     npm run tippen -- --anteil .5 .61  Anteile der Bildbreite/-höhe (0…1)
#     npm run tippen -- --messen         nur die Abbildung zeigen, nicht klicken
#
# ── Warum es das gibt ────────────────────────────────────────────────────────
# `schirm.sh` navigiert über Deep Links und TIPPT mit Absicht nicht. Damit sind
# alle Zustände unerreichbar, die keine Route haben: der Umschalter, der
# Wischstapel, die Kartenauswahl — und jeder Vorhang, der beim Start über der App
# liegt. In `CLAUDE.md` stand `tippen.sh` deshalb seit Phase 19 als „fehlt, blockiert
# durch die Bedienungshilfen-Berechtigung".
#
# ✅ Am 2026-09-26 nachgesehen: **Die Berechtigung ist erteilt.** `System Events`
# antwortet. Der Blocker stand nur noch in der Doku.
#
# ── 🔴 Was es NICHT tut: Ians iPHONE antippen ───────────────────────────────
# Nur der Simulator. Am Gerät steht `ANMELDE_QUELLE` auf `supabase`, die App hängt
# an der ECHTEN Datenbank — ein danebengegangener Tipp schickte ein „Bin dabei" an
# einen echten Menschen. Für das Gerät gibt es `npm run knipsen`, und das ist
# lesend. Diese Trennung ist Absicht und keine Lücke.
#
# ── Die Abbildung, und wie sie gemessen wurde ───────────────────────────────
# Der Simulator zeichnet den Geräteschirm unter der Titelleiste, waagrecht
# zentriert, unter Beibehaltung des Seitenverhältnisses. Gebraucht wird also nur
# eines: die Höhe der Titelleiste.
#
# **Am 2026-09-26 gemessen** (iPhone 17 Pro Max, macOS 26): Ein Fensterbild von
# 399×862 pt wird bei 2× zu 798×1724 px; der dunkle Geräteinhalt beginnt bei
# y = 48 px. Also **24 pt**. Das ist eine Eigenschaft des Fensters, keine der
# Fenstergrösse — Verschieben und Verkleinern ändern sie nicht.
#
# ⚠️ Die Zahl ist gemessen und nicht abgeleitet, also kann sie mit einer neuen
# macOS-Fassung falsch werden. Deshalb `--messen`, und deshalb prüft das Skript
# das Seitenverhältnis gegen: Passt die gerechnete Fläche nicht ins Fenster oder
# stimmt das Verhältnis nicht, bricht es ab, statt irgendwohin zu klicken.
#
# Belegt ist sie durch zwei Klicks, die getroffen haben: die iOS-Rückfrage
# „In SimplySocial öffnen?" und der Prototyp-Hinweis — beide sassen danach nicht
# mehr da.
#
# ⚠️ **Ein `osascript`-Klick, der ein UI-Element zurückgibt, ist noch kein Klick**
# (FALLEN.md). Die Ausgabe von `click at` wird deshalb verworfen; ob er gewirkt
# hat, sagt ausschliesslich das nächste Bild.
set -euo pipefail

WURZEL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$WURZEL"

TITELLEISTE=24     # pt, am 2026-09-26 gemessen (siehe Kopf)

ANTEIL=0; MESSEN=0
while [[ "${1:-}" == --* ]]; do
  case "$1" in
    --anteil) ANTEIL=1; shift ;;
    --messen) MESSEN=1; shift ;;
    *) echo "✗ Unbekannte Option: $1"; exit 1 ;;
  esac
done

# ── Schritt 1: Läuft ein Simulator, und wo steht sein Fenster? ───────────────
UDID="$(xcrun simctl list devices booted 2>/dev/null | grep -oE '[0-9A-F-]{36}' | head -1)"
[ -n "$UDID" ] || { echo "✗ Kein Simulator läuft. → npm run schirm -- --nur-bauen"; exit 1; }

# ⚠️ `item 1 of (position of w) as text` ist NICHT dasselbe wie
# `(item 1 of (position of w)) as text` — AppleScript bindet `as text` an die
# ganze Liste und meldet dann „kann nicht in Typ text umgewandelt werden (-1700)".
# Am ersten Lauf hier hineingelaufen. Deshalb erst in Variablen, dann verketten.
GEO="$(osascript -e 'tell application "System Events" to tell process "Simulator"
set p to position of first window
set s to size of first window
set {px, py} to p
set {sw, sh} to s
return (px as text) & " " & (py as text) & " " & (sw as text) & " " & (sh as text)
end tell' 2>&1)" || true
if ! [[ "$GEO" =~ ^-?[0-9]+\ -?[0-9]+\ [0-9]+\ [0-9]+$ ]]; then
  # ⚠️ Nicht die Ursache BEHAUPTEN. Beim ersten Lauf stand hier „Fehlt die
  # Bedienungshilfen-Berechtigung?" — die war erteilt, der Fehler lag im Skript.
  # Eine Meldung, die eine ungeprüfte Ursache nennt, schickt den Nächsten in die
  # falsche Richtung. Also: den Wortlaut zeigen und die Berechtigung PRÜFEN.
  echo "✗ Die Fenstergeometrie kam nicht heraus. AppleScript sagt:"
  echo "$GEO" | sed 's/^/    /'
  if ! osascript -e 'tell application "System Events" to return name of first process whose frontmost is true' >/dev/null 2>&1; then
    echo "  · Die Bedienungshilfen-Berechtigung fehlt: Systemeinstellungen →"
    echo "    Datenschutz & Sicherheit → Bedienungshilfen → Terminal erlauben."
    exit 2
  fi
  echo "  · Die Bedienungshilfen-Berechtigung IST erteilt — es liegt nicht daran."
  #
  # 🔴 Die häufigste Ursache, am 2026-09-26 nachts teuer gelernt: **Der Mac zeigt
  # den Ruhebildschirm.** Dann hat der Simulator KEIN Fenster mehr, und damit gibt
  # es nichts anzuklicken — während `simctl io screenshot` munter weiterläuft, weil
  # es aus dem Simulator-PROZESS zeichnet und nicht vom Fenster.
  #
  # Das Ergebnis sind Bilder, die aussehen wie ein Ergebnis und einen Vorhang
  # tragen. Acht Stück, hintereinander, ohne eine einzige Fehlermeldung.
  #
  # ⚠️ Eine HELLIGKEITSmessung beantwortet das NICHT: Der Ruhebildschirm ist
  # selbst hell (gemessen: 37 von 255 über das ganze Bild, mit Uhr und Foto).
  # Sie ist die Schwester der Falle „ein schlafender Mac-Bildschirm nimmt dem
  # Simulator sein Fenster" — nur mit Licht, und deshalb noch schwerer zu sehen.
  #
  # Gefragt wird deshalb die FENSTERZAHL, und das ist zugleich die Bedingung,
  # auf die es ankommt: kein Fenster, kein Klick.
  FENSTER="$(osascript -e 'tell application "System Events" to tell process "Simulator" to return count (every window)' 2>/dev/null || echo 0)"
  if [ "${FENSTER:-0}" = "0" ]; then
    echo "  · Der Simulator hat KEIN Fenster."
    echo "    Häufigste Ursache: der Mac zeigt den Ruhebildschirm oder ist gesperrt."
    echo "    → Mac aufwecken, Simulator öffnen, nochmal."
    echo "    ⚠️ Knipsen geht auch ohne Fenster — Tippen nicht. Ein Bild aus diesem"
    echo "       Zustand kann einen Vorhang tragen und sieht trotzdem richtig aus."
  else
    echo "    Der Simulator hat $FENSTER Fenster — dann liegt es an etwas anderem."
  fi
  exit 2
fi
read -r WX WY WW WH <<< "$GEO"

# ── Schritt 2: Wie gross ist der Geräteschirm in PIXELN? ────────────────────
# Gefragt wird ein echtes Bild, nicht eine Modell-Liste: Die Pixelmasse stehen
# darin, und genau in diesen Masseinheiten gibt man die Klickstelle an.
PROBE="$(mktemp -t tippenXXXX).png"
xcrun simctl io "$UDID" screenshot "$PROBE" >/dev/null 2>&1
GB="$(/usr/bin/sips -g pixelWidth "$PROBE" | awk '/pixelWidth/ {print $2}')"
GH="$(/usr/bin/sips -g pixelHeight "$PROBE" | awk '/pixelHeight/ {print $2}')"
rm -f "$PROBE"
[ -n "$GB" ] && [ -n "$GH" ] || { echo "✗ Kein Probebild vom Simulator."; exit 3; }

# ── Schritt 3: Rechnen, mit Gegenprobe ──────────────────────────────────────
read -r OX OY SKALA RB RH <<< "$(python3 - "$WX" "$WY" "$WW" "$WH" "$TITELLEISTE" "$GB" "$GH" <<'PY'
import sys
wx, wy, ww, wh, titel, gb, gh = (float(a) for a in sys.argv[1:8])
inhalt = wh - titel
s = min(ww / gb, inhalt / gh)          # Geraetepixel → Fensterpunkte
rb, rh = gb * s, gh * s
ox = wx + (ww - rb) / 2                # waagrecht zentriert
oy = wy + titel + (inhalt - rh) / 2
print(f"{ox:.3f} {oy:.3f} {s:.6f} {rb:.2f} {rh:.2f}")
PY
)"

# Gegenprobe: Die gerechnete Flaeche MUSS ins Fenster passen. Tut sie es nicht,
# stimmt die Titelleisten-Zahl nicht mehr — dann lieber abbrechen als irgendwohin
# klicken. Ein Klick daneben trifft im Zweifel einen Knopf, den niemand wollte.
python3 - "$RB" "$RH" "$WW" "$WH" "$TITELLEISTE" <<'PY' || exit 4
import sys
rb, rh, ww, wh, titel = (float(a) for a in sys.argv[1:6])
if rb > ww + 0.5 or rh > wh - titel + 0.5:
    print(f"✗ Die gerechnete Flaeche {rb:.0f}×{rh:.0f} passt nicht ins Fenster "
          f"{ww:.0f}×{wh - titel:.0f}.")
    print("  Vermutlich stimmt TITELLEISTE nicht mehr (macOS-Fassung?).")
    print("  → npm run tippen -- --messen  und die Zahl im Skriptkopf nachmessen.")
    sys.exit(1)
PY

if [ "$MESSEN" = "1" ]; then
  echo "Fenster      ${WW}×${WH} pt an (${WX}, ${WY})"
  echo "Geraetebild  ${GB}×${GH} px"
  echo "Gezeichnet   ${RB}×${RH} pt ab (${OX}, ${OY})"
  echo "Massstab     ${SKALA} (Geraetepixel → Fensterpunkte)"
  exit 0
fi

[ $# -ge 2 ] || { echo "Aufruf: npm run tippen <x> <y>   (Geraetepixel)"; exit 1; }

read -r MX MY <<< "$(python3 - "$1" "$2" "$ANTEIL" "$GB" "$GH" "$OX" "$OY" "$SKALA" <<'PY'
import sys
x, y, anteil, gb, gh, ox, oy, s = (float(a) for a in sys.argv[1:9])
if anteil:
    x, y = x * gb, y * gh
if not (0 <= x <= gb and 0 <= y <= gh):
    sys.exit(f"✗ ({x:.0f}, {y:.0f}) liegt ausserhalb des Bildes {gb:.0f}×{gh:.0f}.")
print(f"{round(ox + x * s)} {round(oy + y * s)}")
PY
)"

# Erst nach vorne holen: Ein Klick auf ein Fenster im Hintergrund aktiviert es nur.
osascript -e 'tell application "Simulator" to activate' >/dev/null 2>&1
osascript -e 'delay 0.3' >/dev/null 2>&1
# Die Rueckgabe wird VERWORFEN — sie ist ein UI-Element und kein Erfolg (FALLEN.md).
osascript -e "tell application \"System Events\" to click at {$MX, $MY}" >/dev/null 2>&1 || true
echo "· getippt bei Geraetepixel ($1, $2) → macOS ($MX, $MY)"
echo "  ⚠️ Ob es gewirkt hat, sagt nur das naechste Bild."
