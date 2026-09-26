#!/usr/bin/env bash
#
# Ein Bild von Ians iPhone holen.  Aufruf:  npm run knipsen [ziel.png]
#
# ── Warum es dieses Skript gibt ──────────────────────────────────────────────
# Jede Design-Runde in diesem Projekt endet mit „mach mir bitte einen
# Screenshot". Das kostet Ian einen Handgriff und mich eine Runde Wartezeit —
# und schlimmer: Ich kann an einem Bild NACHMESSEN, aber nur an einem, das ich
# auch bekomme. Mehrere Befunde dieses Projekts hingen daran, dass eine Zahl am
# Bild gemessen statt gerechnet wurde (Apples Nennung bei 184 pt, `insets.bottom`
# bei 83). Mit diesem Skript hole ich mir das Bild selbst.
#
# ── Die eine Sache, die Ian tun muss ─────────────────────────────────────────
# Seit iOS 17 geht das Knipsen nur über einen TUNNEL, und den darf nur root
# aufmachen (er legt ein Netzwerk-Interface an). Das ist kein Umweg, den man
# wegprogrammieren kann.
#
#   EINMAL pro Mac-Neustart:   sudo npm run tunnel
#
# Danach läuft `npm run knipsen` ohne Rückfrage, so oft man will.
#
# ✅ ERSTER ECHTER LAUF: 2026-09-26, 19:17. Beim Schreiben (23.09.) war nur Schritt 1
# belegt — das iPhone hing nicht am Kabel. Jetzt ist die ganze Kette gemessen:
# Tunnel → `developer dvt screenshot` → 1179×2556 von Ians iPhone 16.
#
# ⚠️ Was dabei unnötig Sorge gemacht hat, und deshalb hier steht: `sudo npm run tunnel`
# druckt „Waiting for user pairing" und BLEIBT so stehen. Das sieht aus wie Hängen,
# ist aber der Normalzustand — das Fenster gehört offen. Ob er WIRKLICH arbeitet,
# sagt nicht die letzte Zeile, sondern der Port:
#
#     curl -s http://127.0.0.1:49151
#     {"00008140-…":[{"tunnel-address":"fda1:…","tunnel-port":52541,…}]}
#
# Steht dort eine Adresse, läuft er. *Eine Meldung, die den eigenen Ablauf nicht
# kennt, ist keine Auskunft* — hier in der harmlosen Richtung, aber sie kostet
# trotzdem eine Rückfrage.
#
# ── 🔴 Was dieses Skript NICHT kann, und warum das so bleiben soll ───────────
# Es knipst, es TIPPT nicht. `devicectl` hat keinen URL-Befehl und
# `pymobiledevice3 developer dvt` keinen Tipp-Befehl (nachgesehen am 2026-09-26);
# bliebe `xcuitest`. Das wird hier auch nicht nachgerüstet: Am Gerät steht
# `ANMELDE_QUELLE` auf `supabase`, die App hängt also an der ECHTEN Datenbank. Ein
# danebengegangener Tipp schickt ein „Bin dabei" an einen echten Menschen oder
# stellt einen Post ein. Knipsen ist lesend, Tippen wäre es nicht.
# Am SIMULATOR ist das eine andere Frage — dafür gibt es `scripts/schirm.sh`.
#
# ── Fallen, die hier schon drinstecken ───────────────────────────────────────
#   1. `usbmux` sieht nur Geräte am KABEL. Xcodes `devicectl` sieht das iPhone
#      auch über WLAN und meldet „available (paired)" — das ist KEIN Beleg, dass
#      dieses Skript es erreicht. Deshalb wird hier `usbmux` gefragt, nicht
#      devicectl.
#   2. Ein gesperrtes iPhone gibt kein Bild heraus. Die Meldung sagt das nicht,
#      sie läuft nur in eine Zeitüberschreitung — deshalb die Vorprüfung.
#   3. `timeout` gibt es auf macOS nicht (FALLEN.md).
set -euo pipefail

WURZEL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$WURZEL"

VENV="scripts/.venv-geraet"
PMD="$VENV/bin/pymobiledevice3"
ZIEL="${1:-}"

# ── Schritt 0: Die Umgebung ──────────────────────────────────────────────────
# Sie ist git-ignoriert, es gibt sie also nach einem frischen Checkout nicht.
# Anlegen statt meckern — das ist genau die Sorte Handarbeit, die Ian nicht
# übernehmen soll.
if [ ! -x "$PMD" ]; then
  echo "· Lege die Python-Umgebung an (einmalig, ~1 Minute) …"
  python3 -m venv "$VENV"
  xattr -w 'com.apple.fileprovider.ignore#P' 1 "$VENV" 2>/dev/null || true
  "$VENV/bin/pip" install -q --upgrade pip
  "$VENV/bin/pip" install -q pymobiledevice3
  echo "✓ Umgebung steht."
fi

# ── Schritt 1: Hängt ein iPhone am Kabel? ────────────────────────────────────
GERAETE="$("$PMD" usbmux list 2>/dev/null || echo '[]')"
if [ "$(printf '%s' "$GERAETE" | tr -d '[:space:]')" = "[]" ]; then
  echo "✗ Kein iPhone am Kabel."
  # ⚠️ EINFACHE Anführungszeichen: In doppelten führt die Shell alles zwischen
  # Backticks AUS (FALLEN.md). Hier stünde sonst die Ausgabe von
  # `xcrun devicectl list devices` mitten im Hilfetext — und `usbmux` wäre ein
  # Befehl, den es gar nicht gibt. Beim ersten Lauf genau so passiert.
  echo '  usbmux sieht nur Geräte über USB. Dass devicectl eines zeigt, heisst nur,'
  echo '  dass Xcode es über WLAN kennt — knipsen geht damit nicht.'
  echo "  → Kabel anstecken, iPhone entsperren, nochmal."
  exit 1
fi
NAME="$(printf '%s' "$GERAETE" | "$VENV/bin/python" -c 'import json,sys; d=json.load(sys.stdin); print(d[0].get("DeviceName","?"))')"
UDID="$(printf '%s' "$GERAETE" | "$VENV/bin/python" -c 'import json,sys; d=json.load(sys.stdin); print(d[0].get("UniqueDeviceID",""))')"
echo "Gerät: $NAME"

# ── Schritt 2: Läuft der Tunnel? ─────────────────────────────────────────────
# Nicht selbst `sudo` aufrufen: Im Auto-Mode hängt das Skript dann an einer
# Passwortabfrage, die niemand sieht. Lieber sagen, was zu tun ist.
if ! curl -s --max-time 2 http://127.0.0.1:49151 >/dev/null 2>&1; then
  echo "✗ Der Tunnel läuft nicht — ohne ihn gibt iOS 17+ kein Bild heraus."
  echo ""
  echo "  Einmal pro Mac-Neustart, in einem eigenen Terminal:"
  echo "      cd $WURZEL && sudo npm run tunnel"
  echo ""
  echo "  Das Fenster bleibt offen, solange der Tunnel läuft."
  exit 2
fi

# ── Schritt 3: Knipsen ───────────────────────────────────────────────────────
if [ -z "$ZIEL" ]; then
  mkdir -p _schirm
  ZIEL="_schirm/$(date +%Y%m%d-%H%M%S).png"
fi
mkdir -p "$(dirname "$ZIEL")"

if ! "$PMD" developer dvt screenshot "$ZIEL" --tunnel "$UDID" >/dev/null 2>&1; then
  echo "✗ Das Knipsen ist gescheitert."
  echo "  Häufigste Ursache: Das iPhone ist GESPERRT. Aufmachen und nochmal."
  echo "  Sonst: Entwicklermodus prüfen (Einstellungen → Datenschutz & Sicherheit)."
  exit 3
fi

# Ein Bild mit 0 Bytes ist kein Bild — und ein Skript, das dann „✓" meldet,
# ist schlimmer als eines, das gar nichts sagt.
if [ ! -s "$ZIEL" ]; then
  echo "✗ Die Datei ist leer: $ZIEL"
  exit 4
fi
GROESSE="$(/usr/bin/sips -g pixelWidth -g pixelHeight "$ZIEL" 2>/dev/null | awk '/pixel/ {print $2}' | paste -sd'×' -)"
echo "✓ $ZIEL  ($GROESSE)"
