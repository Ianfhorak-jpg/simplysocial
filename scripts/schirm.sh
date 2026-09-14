#!/usr/bin/env bash
#
# Einen Bildschirm der App am Simulator knipsen.  Aufruf:
#
#     npm run schirm <route> <name>          z. B.  npm run schirm / af01-start
#     npm run schirm --nur-bauen             nur die App bauen und installieren
#     GERAET="iPhone 17" npm run schirm …    ein anderes Modell
#
# ── Warum es dieses Skript gibt ──────────────────────────────────────────────
# Ians Entscheidung 87: Claude prüft sich SELBST am Simulator, statt Ian nach
# jedem Versuch um einen Screenshot zu bitten. Das geht nur, wenn das Bild
# verlässlich ist — und genau daran hängt Risiko 3 aus dem Plan:
#
#   **Die Selbstprüfung liefert ein überzeugendes falsches Bild.**
#
# Drei Fallen zeigen ab jetzt auf DASSELBE Ergebnis, und alle drei erzeugen ein
# Bild, das aussieht wie ein Ergebnis:
#
#   · schlafender Schirm          → schwarz. **Und schwarz ist bei einer dunklen
#                                    App ein plausibler Zustand.** Die alte
#                                    Unterscheidung „weiss = App, schwarz = Fehler"
#                                    fällt mit Teil 1 ersatzlos weg.
#   · `expo run:ios` EXIT 0       → man knipst die ALTE App, nicht die neue
#   · `terminate` ohne `pgrep`    → Fast Refresh, man knipst den ALTEN Zustand
#
# Deshalb der Leitsatz dieses Skripts: **Es gibt keine Datei heraus, die es nicht
# selbst geprüft hat.** Jeder Schritt unten ist ein Wächter, kein Komfort.
#
# ── Was es NICHT tut ─────────────────────────────────────────────────────────
# Es TIPPT nicht. Navigiert wird über Deep Links (`simplysocial://…`), und das
# braucht KEINE Bedienungshilfen-Berechtigung — Geometrie lesen und Klicken sind
# verschiedene Rechte. Wo es keine Route gibt (Umschalter, Wischstapel,
# Kartenauswahl), ist `scripts/tippen.sh` zuständig.
#
# ⚠️ **Der Torwächter.** `app/_layout.tsx` zeichnet den `Stack` nicht, solange
# niemand angemeldet ist — jeder Deep Link landet sonst auf `<Anmelden />`, und
# zwar OHNE Fehlermeldung (Falle: „Solange der Torwächter zeigt, gibt es den
# `Stack` NICHT"). Der Simulator muss einmal von Hand als Demo-Konto angemeldet
# werden; die Sitzung überlebt `terminate`/`launch`. Schritt 7 merkt es, wenn
# das fehlt, statt ein Anmelde-Bild als Ergebnis auszugeben.

set -euo pipefail

WURZEL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BELEGE="$(cd "$WURZEL/.." && pwd)/_belege"
BUNDLE="at.simplysocial.app"
GERAET="${GERAET:-iPhone 17 Pro}"
DERIVED="$HOME/Library/Developer/Xcode/DerivedData/SimplySocial-schirm"

NUR_BAUEN=0
[[ "${1:-}" == "--nur-bauen" ]] && NUR_BAUEN=1 && shift
ROUTE="${1:-/}"
NAME="${2:-}"

if [[ $NUR_BAUEN -eq 0 && -z "$NAME" ]]; then
  echo "Aufruf: npm run schirm <route> <name>      z. B.  npm run schirm / af01-start"
  echo "        npm run schirm --nur-bauen"
  exit 1
fi

sag() { echo ""; echo "── $* ────────────────────────────────────────────" | cut -c1-78; }

# ══════════════════════════════════════════════════════════════════════════════
sag "1. Schläft der Mac-Bildschirm?"
# ══════════════════════════════════════════════════════════════════════════════
# ZWEI Prüfungen, weil die zwei Ursachen gleich aussehen: ein schlafender Schirm
# und ein Simulator ohne Fenster liefern beide ein schwarzes Bild.
#
# ⚠️ Zu messen (Plan 3.4): `simctl io screenshot` zeichnet aus dem
# Simulator-PROZESS, nicht vom Fenster — es SOLLTE also auch bei schlafendem
# Schirm gehen; schwarz wird nur `screencapture`. Das steht so in keiner Falle.
# Bis es gemessen ist, warnt dieses Skript, statt abzubrechen.
if ! ioreg -n IODisplayWrangler -r 2>/dev/null | grep -q '"IOPowerManagement".*"CurrentPowerState"=4'; then
  echo "  ⚠️  Der Bildschirm scheint nicht wach zu sein."
  echo "     Ein schlafender Mac-Bildschirm nimmt dem Simulator sein FENSTER."
  echo "     (Noch ungemessen, ob simctl io screenshot das überhaupt stört —"
  echo "      steht als offene Messung im Plan, Abschnitt 3.4.)"
else
  echo "  ✓ Bildschirm wach"
fi

# ══════════════════════════════════════════════════════════════════════════════
sag "2. Läuft ein Simulator?"
# ══════════════════════════════════════════════════════════════════════════════
# Der Gerätename ist ein PARAMETER und keine Konstante: installiert ist iOS 26.5,
# Ians Gerät läuft 26.6 — ein fest verdrahtetes Modell wäre nach dem nächsten
# Xcode-Update still falsch.
UDID="$(xcrun simctl list devices available \
        | grep -F "$GERAET (" | head -1 \
        | grep -oE '\([0-9A-F-]{36}\)' | tr -d '()' || true)"
if [[ -z "$UDID" ]]; then
  echo "✗ Kein Simulator „$GERAET\" gefunden. Vorhanden:"
  xcrun simctl list devices available | grep -E "^\s+iPhone" | sed 's/^/    /'
  exit 1
fi
if ! xcrun simctl list devices booted | grep -q "$UDID"; then
  echo "  … boote $GERAET"
  xcrun simctl boot "$UDID"
fi
open -a Simulator
# Warten, bis das Gerät WIRKLICH oben ist — `boot` kehrt sofort zurück.
for _ in $(seq 1 60); do
  [[ "$(xcrun simctl bootstatus "$UDID" -b 2>&1 | tail -1)" == *"finished"* ]] && break
  sleep 1
done
echo "  ✓ $GERAET  ($UDID)"

# ══════════════════════════════════════════════════════════════════════════════
sag "3. Ist die installierte App die aktuelle?"
# ══════════════════════════════════════════════════════════════════════════════
# ⚠️ Der Beleg ist die MTIME des installierten Bündels, nicht der Rückgabewert
# des Builds: `npx expo run:ios` gibt EXIT 0 zurück, auch wenn `xcodebuild`
# darunter gescheitert ist. Wer auf den Exit-Code hört, knipst die alte App.
NEUSTE_QUELLE="$(find "$WURZEL/src" -name '*.ts*' -newer "$WURZEL/package.json" 2>/dev/null | head -1 || true)"
APP_PFAD="$(xcrun simctl get_app_container "$UDID" "$BUNDLE" 2>/dev/null || true)"

bauen() {
  echo "  … baue für den Simulator (das dauert beim ersten Mal ~10 Minuten)"
  # Ein SIMULATOR-Build braucht keine Apple-Signatur — ein Gerätebuild schon.
  # Deshalb geht das hier ohne Schlüsselbund, ohne Zertifikat, ohne Ian.
  mkdir -p "$DERIVED"
  local log="$DERIVED/build-$(date +%Y%m%d-%H%M%S).log"
  # Das Protokoll läuft NIE durch `tail` — Fehler stehen in der MITTE.
  set +e
  xcodebuild -workspace "$WURZEL/ios/SimplySocial.xcworkspace" \
    -scheme SimplySocial -configuration Debug \
    -destination "id=$UDID" -derivedDataPath "$DERIVED" \
    CODE_SIGNING_ALLOWED=NO > "$log" 2>&1
  set -e
  # Geprüft wird die ANWESENHEIT von BUILD SUCCEEDED, nicht die Abwesenheit von
  # „error:" — ein gescheiterter Build hat nicht immer eine `error:`-Zeile.
  if ! grep -q "BUILD SUCCEEDED" "$log"; then
    echo "✗ Der Build ist gescheitert. Protokoll: $log"
    grep -nE "error:|BUILD FAILED|The following build commands failed" "$log" | head -20
    exit 1
  fi
  local gebaut="$DERIVED/Build/Products/Debug-iphonesimulator/SimplySocial.app"
  [[ -d "$gebaut" ]] || { echo "✗ BUILD SUCCEEDED, aber $gebaut fehlt."; exit 1; }
  xcrun simctl install "$UDID" "$gebaut"
  echo "  ✓ gebaut und installiert"
}

if [[ -z "$APP_PFAD" ]]; then
  echo "  App ist nicht installiert."
  bauen
elif [[ -n "$NEUSTE_QUELLE" && "$NEUSTE_QUELLE" -nt "$APP_PFAD" ]]; then
  echo "  Quelle ist neuer als das installierte Bündel ($NEUSTE_QUELLE)."
  bauen
else
  echo "  ✓ installiert: $(basename "$APP_PFAD")"
fi
[[ $NUR_BAUEN -eq 1 ]] && { echo ""; echo "── fertig (--nur-bauen) ──"; exit 0; }

# ══════════════════════════════════════════════════════════════════════════════
sag "4. Echter Neustart der App"
# ══════════════════════════════════════════════════════════════════════════════
# ⚠️ `terminate` kehrt zurück, BEVOR der Prozess weg ist. Ohne die pgrep-Schleife
# greift Fast Refresh und man knipst den alten Zustand — „was wie ein Neustart
# aussieht, ist oft keiner".
xcrun simctl terminate "$UDID" "$BUNDLE" 2>/dev/null || true
for _ in $(seq 1 40); do
  pgrep -f "SimplySocial.app/SimplySocial" >/dev/null 2>&1 || break
  sleep 0.25
done
if pgrep -f "SimplySocial.app/SimplySocial" >/dev/null 2>&1; then
  echo "✗ Die App läuft nach 10 s immer noch. Abgebrochen statt den alten Zustand zu knipsen."
  exit 1
fi
echo "  ✓ Prozess ist wirklich weg"

# ══════════════════════════════════════════════════════════════════════════════
sag "5. Statusleiste festnageln"
# ══════════════════════════════════════════════════════════════════════════════
# Ohne das unterscheiden sich Vorher/Nachher an der UHR, und ein Bildvergleich
# meldet einen Unterschied, den niemand gebaut hat.
xcrun simctl status_bar "$UDID" override \
  --time "9:41" --dataNetwork wifi --wifiMode active --wifiBars 3 \
  --cellularMode active --cellularBars 4 --batteryState charged --batteryLevel 100
echo "  ✓ 9:41, volle Balken"

# ══════════════════════════════════════════════════════════════════════════════
sag "6. Starten und zur Route"
# ══════════════════════════════════════════════════════════════════════════════
xcrun simctl launch "$UDID" "$BUNDLE" >/dev/null
sleep 3
ZIEL="simplysocial://${ROUTE#/}"
echo "  … $ZIEL"
xcrun simctl openurl "$UDID" "$ZIEL"
sleep 3

# ══════════════════════════════════════════════════════════════════════════════
sag "7. Knipsen — und das Bild prüfen, bevor es herausgegeben wird"
# ══════════════════════════════════════════════════════════════════════════════
mkdir -p "$BELEGE"
BILD="$BELEGE/$NAME.png"
xcrun simctl io "$UDID" screenshot "$BILD" >/dev/null 2>&1
[[ -s "$BILD" ]] || { echo "✗ Kein Bild entstanden."; exit 1; }

# Der Leitsatz: keine Datei herausgeben, die nicht geprüft ist. Das Messgerät
# zählt die verschiedenen Farben — ein echter Screenshot hat tausende, ein
# Fehlbild eine. Bei einer DUNKLEN App ist das die einzig verbliebene
# Unterscheidung (siehe 31_glasmessung.py, Abschnitt 5).
if ! python3 "$WURZEL/scripts/glasmessung.py" "$BILD"; then
  echo ""
  echo "✗ Das Bild hat die Prüfung nicht bestanden — es wird NICHT als Beleg geführt."
  mv "$BILD" "$BILD.verworfen"
  exit 1
fi
echo ""
echo "  ✓ $BILD"
echo ""
echo "  ⚠️  Zeigt das Bild den Anmelde-Bildschirm, ist es KEIN Fehler dieses Skripts:"
echo "     Solange der Torwächter zeigt, gibt es den Stack nicht und jeder Deep Link"
echo "     landet dort. Einmal am Simulator als Demo-Konto anmelden (_FUER_IAN/DEMO_ZUGANG.md)."
