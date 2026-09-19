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
# ⚠️ **Der Weg aus dem Plan funktioniert auf diesem Mac nicht** (gemessen am
# 2026-09-14). Dort stand `ioreg -n IODisplayWrangler` + `CurrentPowerState=4`.
# Der Knoten EXISTIERT auf Apple Silicon — er hat nur **keinen**
# `IOPowerManagement`-Eintrag; `pmset -g powerstate IODisplayWrangler` antwortet
# mit „Internal failure". Der Wächter hätte also **immer** gewarnt, und ein
# Wächter, der immer warnt, wird abgeschaltet statt gelesen (FALLEN.md).
#
# An seiner Stelle zwei Fragen, die hier messbar antworten:
#   a) Hat der Simulator ein FENSTER? Das ist die Ursache aus der Falle, direkt
#      gefragt statt über den Umweg Bildschirm-Stromzustand.
#   b) Ist überhaupt jemand am Mac (`UserIsActive`)?
#
# ⚠️ Zu messen bleibt (Plan 3.4): `simctl io screenshot` zeichnet aus dem
# Simulator-PROZESS, nicht vom Fenster — es SOLLTE also auch bei schlafendem
# Schirm gehen; schwarz wird nur `screencapture`. Deshalb WARNT dieser Schritt
# und bricht nicht ab. **Der harte Wächter ist Schritt 7**, und der wirkt
# unabhängig davon, warum ein Bild schwarz ist.
#
# ⚠️ Kein `exit` im awk und ein `|| true` an jeder Pipeline. Beim ersten Lauf
# stand hier `awk '/UserIsActive/ {print $2; exit}'` — das `exit` beendet awk
# früh, schliesst die Pipe, `pmset` bekommt SIGPIPE, und unter `set -o pipefail`
# ist die ganze Pipeline ein Fehler. `set -e` hat das Skript daraufhin STUMM
# getötet, mitten in einer Zeile, die richtig aussieht. Dieselbe Mechanik wie
# `find … | grep -v …` in FALLEN.md: ein Erfolg am linken Ende, der wie ein
# Fehler aussieht.
FENSTER="$(osascript -e 'tell application "System Events" to count (every window of process "Simulator")' 2>/dev/null || echo 0)"
AKTIV="$(pmset -g assertions 2>/dev/null | grep -m1 UserIsActive | awk '{print $2}' || true)"
if [[ "${FENSTER:-0}" -lt 1 ]]; then
  echo "  ⚠️  Der Simulator hat kein Fenster (noch nicht gestartet, oder der Schirm schläft)."
elif [[ "${AKTIV:-1}" == "0" ]]; then
  echo "  ⚠️  Niemand ist am Mac aktiv — der Bildschirm könnte schlafen."
else
  echo "  ✓ Simulator hat $FENSTER Fenster, jemand ist am Mac"
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
#
# ⚠️⚠️ **Und der Vergleichsanker muss das BÜNDEL sein, nichts anderes.** Der
# erste Versuch fragte `find src -newer package.json` — beim ersten Lauf am
# 2026-09-14 hatte ich `package.json` selbst gerade geändert (der npm-Eintrag für
# dieses Skript), also war keine Quelldatei neuer, und der Wächter winkte eine
# **fünf Tage alte** App durch. Genau der Fall, gegen den er gebaut war.
# Ein Anker, der mit der Arbeit mitwandert, ist kein Anker.
#
# ⚠️⚠️⚠️ **Und die KONFIGURATION gehört dazu.** Beim zweiten Lauf am 2026-09-14
# war das Skript schon auf Release umgestellt — aber installiert lag noch die
# Debug-App von zwanzig Minuten vorher, und die ist NEUER als jede Quelldatei.
# Schritt 3 sagte „installiert und aktuell", und der rote Metro-Kasten kam ein
# zweites Mal. **Eine Debug-App und eine Release-App sind verschiedene Dinge,
# heissen aber beide `SimplySocial.app`** — nach `simctl install` ist dem Bündel
# nicht mehr anzusehen, woher es kam.
#
# Deshalb eine Marke neben dem Build: Sie hält fest, WAS auf WELCHES Gerät
# installiert wurde. Fehlt sie oder passt sie nicht, wird gebaut.
MARKE="$DERIVED/installiert-$UDID.txt"
SOLL="Release $UDID"
APP_PFAD="$(xcrun simctl get_app_container "$UDID" "$BUNDLE" 2>/dev/null || true)"
NEUSTE_QUELLE=""
if [[ -n "$APP_PFAD" ]]; then
  # Direkt gegen das installierte Bündel — und `src` allein genügt nicht:
  # `app.json`, die Migrationen und `package.json` gehören genauso ins Bündel.
  # ⚠️ **Dieses Skript gehört in die Liste.** Am 2026-09-19 stand hier nur
  # `src`, `app.json`, `package.json` — dann wurde die BUILD-KONFIGURATION
  # geändert (`CODE_SIGNING_ALLOWED=NO` raus), und der Wächter meldete brav
  # „installiert und aktuell". Die Quelle war ja unverändert. **Was gebaut wird,
  # ist nicht dasselbe wie WIE gebaut wird** — und beides entscheidet, ob das
  # installierte Bündel noch das richtige ist.
  NEUSTE_QUELLE="$(find "$WURZEL/src" "$WURZEL/app.json" "$WURZEL/package.json" \
                      "${BASH_SOURCE[0]}" -newer "$APP_PFAD" 2>/dev/null | head -1 || true)"
fi

bauen() {
  echo "  … baue für den Simulator (das dauert beim ersten Mal ~10 Minuten)"
  # Ein SIMULATOR-Build braucht keine Apple-Signatur — ein Gerätebuild schon.
  # Deshalb geht das hier ohne Schlüsselbund, ohne Zertifikat, ohne Ian.
  #
  # ⚠️⚠️ **KEIN `CODE_SIGNING_ALLOWED=NO`** — und das ist die teuerste Zeile
  # dieses Skripts (2026-09-19). Die Fallen-Liste sagt *„Ein Simulator-Build
  # braucht keine Apple-Signatur"*, und das stimmt — aber daraus folgt NICHT, dass
  # man die Signierung abschalten darf. Ein Simulator-Build wird ad-hoc signiert
  # (`Signature=adhoc`, ohne Apple-Konto, ohne Zertifikat), und **erst dabei
  # bekommt die App ihre ENTITLEMENTS**.
  #
  # Ohne sie gibt es keine `keychain-access-groups`, und `expo-secure-store`
  # scheitert beim Schreiben der Sitzung mit
  #
  #     KeyChainException: Eine erforderliche Berechtigung fehlt.
  #     (ExpoSecureStore/SecureStoreModule.swift)
  #
  # Die Anmeldung sieht dann **erfolgreich** aus — der Server antwortet mit 200,
  # das Log zeigt `SecItemAdd_ios` (den AUFRUF, nicht den Erfolg) — und die App
  # bleibt trotzdem auf dem Anmeldebildschirm, mit der Meldung „Prüf dein Netz".
  # Zwei Stunden Fehlersuche an der falschen Stelle.
  #
  # ⚠️ **RELEASE, nicht Debug** — und das ist beim ersten Lauf am 2026-09-14
  # teuer gelernt worden. Ein Debug-Build holt sein JS-Bündel vom Metro-Server;
  # ohne laufenden Metro zeigt er den roten Kasten *„No script URL provided"*.
  # Das Bild hatte 822 Farben und kam glatt durch die Schwarzbild-Erkennung.
  #
  # Im Release ist das Bündel eingebettet: kein Dev-Server, kein Dev-Menü, kein
  # Fast Refresh — und kein veraltetes Metro-Bündel, das einen Fehler meldet, den
  # es nicht gibt (FALLEN.md). Für Belege ist Release ohnehin der richtige Stand.
  mkdir -p "$DERIVED"
  local log="$DERIVED/build-$(date +%Y%m%d-%H%M%S).log"
  # Das Protokoll läuft NIE durch `tail` — Fehler stehen in der MITTE.
  set +e
  xcodebuild -workspace "$WURZEL/ios/SimplySocial.xcworkspace" \
    -scheme SimplySocial -configuration Release \
    -destination "id=$UDID" -derivedDataPath "$DERIVED" \
    > "$log" 2>&1
  set -e
  # Geprüft wird die ANWESENHEIT von BUILD SUCCEEDED, nicht die Abwesenheit von
  # „error:" — ein gescheiterter Build hat nicht immer eine `error:`-Zeile.
  if ! grep -q "BUILD SUCCEEDED" "$log"; then
    echo "✗ Der Build ist gescheitert. Protokoll: $log"
    grep -nE "error:|BUILD FAILED|The following build commands failed" "$log" | head -20
    exit 1
  fi
  local gebaut="$DERIVED/Build/Products/Release-iphonesimulator/SimplySocial.app"
  [[ -d "$gebaut" ]] || { echo "✗ BUILD SUCCEEDED, aber $gebaut fehlt."; exit 1; }

  # ⚠️ **Hier stand bis zum 2026-09-19 ein Nachsignieren mit eigenen
  # Entitlements** (`keychain-access-groups`), weil `expo-secure-store` ohne sie
  # mit *„Eine erforderliche Berechtigung fehlt"* scheiterte. **Es ist wieder
  # draussen: Der Simulator startet die App dann gar nicht mehr** — ad hoc
  # signiert nimmt er das restricted entitlement nicht an, und mit einer echten
  # „Apple Development"-Identität verlangt er ein Provisioning-Profil, das es im
  # Simulator nicht gibt. `codesign` meldet beide Male Erfolg, die Rechte stehen
  # nachweislich drin, und `simctl launch` sagt „denied by service delegate".
  #
  # Was bleibt: **nicht eingreifen.** Ohne `CODE_SIGNING_ALLOWED=NO` signiert
  # Xcode den Simulator-Build selbst, und das ist der einzige Stand, den der
  # Simulator akzeptiert.
  xcrun simctl install "$UDID" "$gebaut"
  echo "$SOLL" > "$MARKE"
  echo "  ✓ gebaut und installiert (Release)"
}

if [[ -z "$APP_PFAD" ]]; then
  echo "  App ist nicht installiert."
  bauen
elif [[ "$(cat "$MARKE" 2>/dev/null || echo '—')" != "$SOLL" ]]; then
  echo "  Die installierte App stammt nicht aus einem Release-Build dieses Skripts."
  echo "    erwartet: $SOLL"
  echo "    gefunden: $(cat "$MARKE" 2>/dev/null || echo 'keine Marke')"
  # Deinstallieren, nicht überschreiben: Ein `install` über eine App mit anderer
  # Konfiguration lässt Reste stehen, und die sind später nicht zuzuordnen.
  xcrun simctl uninstall "$UDID" "$BUNDLE" 2>/dev/null || true
  bauen
elif [[ -n "$NEUSTE_QUELLE" ]]; then
  echo "  Quelle ist neuer als das installierte Bündel:"
  echo "    $(basename "$NEUSTE_QUELLE")  ($(stat -f '%Sm' "$NEUSTE_QUELLE"))"
  echo "    Bündel von $(stat -f '%Sm' "$APP_PFAD")"
  bauen
else
  echo "  ✓ installiert und aktuell ($(stat -f '%Sm' "$APP_PFAD"))"
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
# ⚠️ `simctl launch` scheitert LAUT, aber der Rückgabewert allein reichte nicht:
# Am 2026-09-19 stand hier `>/dev/null`, der Start scheiterte an einer falschen
# Entitlement — und das Skript meldete danach fröhlich „App läuft". **Ein Schritt,
# dessen Fehlermeldung ins Nichts geht, ist kein Schritt, sondern eine Annahme.**
if ! START="$(xcrun simctl launch "$UDID" "$BUNDLE" 2>&1)"; then
  echo "✗ Die App startet nicht:"
  echo "$START" | sed 's/^/    /'
  echo "    (Bei 'denied by service delegate' sind meist die Entitlements schuld -"
  echo "     siehe den Abschnitt Nachsignieren weiter oben.)"
  exit 1
fi
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
