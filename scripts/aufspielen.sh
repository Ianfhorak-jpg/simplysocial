#!/usr/bin/env bash
#
# Die SCHON GEBAUTE App aufs iPhone spielen, sobald es offen ist.
#
#     npm run aufspielen            wartet bis zu 45 Minuten auf ein offenes iPhone
#     npm run aufspielen -- 0       spielt sofort auf oder bricht ab (kein Warten)
#
# ── Warum es das getrennt von `npm run geraet` gibt ─────────────────────────
# `geraet-bauen.sh` macht beides in einem Zug, und darin steckt ein
# Kopplungsfehler, der am 2026-09-26 zugeschlagen hat:
#
#     Bauen     ~15 Minuten   braucht das iPhone NICHT
#     Aufspielen  Sekunden    braucht es OFFEN
#
# Der Schritt mit der Vorbedingung steht hinter dem Schritt, der sie am
# zuverlässigsten zerstört. Ian hatte sein iPhone entsperrt hingelegt; nach einer
# Viertelstunde Bauzeit war es zu, und ein fertiger, richtig signierter Build lag
# ungenutzt da. Die Vorprüfung „ist das Handy offen?" lief zum falschen
# Zeitpunkt — vor dem Bauen gar nicht, danach zu spät.
#
# Getrennt ist das kein Problem mehr: Der Build bleibt liegen, und dieses Skript
# wartet, bis jemand sein Telefon in die Hand nimmt.
#
# ── Was es NICHT tut ────────────────────────────────────────────────────────
# Es baut nicht. Es prüft auch nicht, ob der Build AKTUELL ist — dafür ist
# `geraet-bauen.sh` zuständig, und eine zweite Antwort auf dieselbe Frage wäre
# eine zu viel. Es sagt aber, WIE ALT die App ist, die es aufspielt: Eine Datei
# von gestern sieht im Finder genauso aus wie eine von eben.
set -euo pipefail

WURZEL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$WURZEL"

UDID="${SS_UDID:-09CDB3CF-11DC-5B42-AC22-C4C99AE803A6}"
APP="$HOME/Library/Developer/Xcode/DerivedData/SimplySocial-geraet/Build/Products/Release-iphoneos/SimplySocial.app"
# Voreinstellung 45 Minuten. Lange genug, dass es sich lohnt, kurz genug, dass
# nichts über Nacht im Hintergrund pollt.
WARTE_MIN="${1:-45}"

# ── Schritt 1: Gibt es überhaupt etwas aufzuspielen? ────────────────────────
if [ ! -d "$APP" ]; then
  echo "✗ Kein gebautes Bündel: $APP"
  echo "  → npm run geraet   (baut und spielt auf)"
  exit 1
fi

# `-f %Sm` statt eines gerechneten Alters: Ein Zeitstempel sagt, WANN — ein
# „3 Stunden alt" lässt offen, ob das viel ist.
#
# 🔴 Gefragt wird `main.jsbundle`, NICHT `Info.plist`. Am ersten Lauf dieses
# Skripts (2026-09-26) gemessen, und es war sofort ein Befund:
#
#     .app selbst      2026-09-26 18:50
#     main.jsbundle    2026-09-26 18:50   ← der Build von eben
#     SimplySocial     2026-09-26 18:50
#     Info.plist       2026-09-23 19:20   ← DREI TAGE ALT
#
# `xcodebuild` baut inkrementell und schreibt die `Info.plist` nur neu, wenn sich
# an ihr etwas ändert. Sie ist deshalb kein Anker für „wann wurde gebaut" — und
# eine Zeile, die „Bündel gebaut: 23.09." meldet, während die App von eben ist,
# ist schlimmer als keine Zeile: Sie lädt dazu ein, einen frischen Build für alt
# zu halten und noch einmal zu bauen.
#
# `main.jsbundle` ist hier der richtige Anker, weil in diesem Projekt fast jede
# Änderung eine JS-Änderung ist — die Design-Runden fassen das native Projekt
# nicht an.
GEBAUT="$(stat -f '%Sm' -t '%Y-%m-%d %H:%M' "$APP/main.jsbundle" 2>/dev/null \
          || stat -f '%Sm' -t '%Y-%m-%d %H:%M' "$APP")"
echo "Bündel gebaut: $GEBAUT"

# ⚠️ Ohne das wäre nicht gesagt, WELCHE App drauf geht. `deploy.sh` bewacht den
# Schalter für die öffentliche Adresse (harte Regel 96); hier ist die Frage
# umgekehrt: Auf dem GERÄT muss `supabase` stehen, nicht `attrappe`. Gesucht wird
# im gebauten Bündel, nicht in der Quelle — die Quelle sagt nicht, was gebaut wurde.
BUENDEL="$APP/main.jsbundle"
if [ -f "$BUENDEL" ]; then
  if grep -qa 'supabase' "$BUENDEL" && ! grep -qa "ANMELDE_QUELLE.\{0,8\}attrappe" "$BUENDEL"; then
    echo "Schalter im Bündel: supabase ✓"
  else
    echo "⚠️  Der Schalter im Bündel sieht nicht nach 'supabase' aus — nachsehen,"
    echo "    bevor das aufs Gerät geht."
  fi
fi

# ── Schritt 2: Hängt das iPhone überhaupt? ──────────────────────────────────
if ! xcrun devicectl list devices 2>/dev/null | grep -q "$UDID"; then
  echo "✗ Das iPhone ist nicht da (UDID $UDID)."
  echo "  → Kabel anstecken und nochmal."
  exit 2
fi

offen() { xcrun devicectl device info ddiServices --device "$UDID" 2>&1 | grep -q "isUsable: true"; }

# ── Schritt 3: Warten, bis es offen ist ─────────────────────────────────────
if ! offen; then
  if [ "$WARTE_MIN" = "0" ]; then
    echo "✗ Das iPhone ist gesperrt, und es soll nicht gewartet werden."
    exit 3
  fi
  echo "🔓 Das iPhone ist zu. Ich warte bis zu $WARTE_MIN Minuten — mach es"
  echo "   einfach irgendwann auf, der Rest geht von selbst."
  # Alle 10 Sekunden. Jede Abfrage redet mit dem Gerät; im Sekundentakt zu
  # fragen hat am 2026-09-07 das Rennen gegen die Auto-Sperre auch nicht gewonnen.
  ENDE=$(( $(date +%s) + WARTE_MIN * 60 ))
  while [ "$(date +%s)" -lt "$ENDE" ]; do
    sleep 10
    if offen; then echo "✓ Offen."; break; fi
  done
  if ! offen; then
    echo "✗ Nach $WARTE_MIN Minuten immer noch zu."
    echo "  → Einstellungen → Anzeige & Helligkeit → Automatische Sperre → Nie"
    echo "    Danach: npm run aufspielen"
    exit 3
  fi
fi

# ── Schritt 4: Aufspielen ───────────────────────────────────────────────────
xcrun devicectl device install app --device "$UDID" "$APP"
echo
echo "✓ Drauf. Gebaut am $GEBAUT."
echo "  Beim ERSTEN Mal mit einem neuen Team einmal am iPhone bestätigen:"
echo "  Einstellungen → Allgemein → VPN & Geräteverwaltung → Profil → Vertrauen."
