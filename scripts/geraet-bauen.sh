#!/usr/bin/env bash
#
# SimplySocial auf Ians iPhone bauen und aufspielen.  Aufruf:  npm run geraet
#
# ── Warum es dieses Skript gibt ──────────────────────────────────────────────
# Der Weg ist seit dem 2026-09-08 erprobt, stand aber nur als Prosa in der
# Fallen-Liste von CLAUDE.md. Sechs Fallen stecken darin, jede hat schon einmal
# einen Abend gekostet:
#
#   1. Der BAUPLATZ darf nicht in iCloud liegen. Der Projektordner liegt auf dem
#      Schreibtisch, den iCloud verwaltet; iCloud hängt `com.apple.FinderInfo` an
#      Framework-Ordner, und `codesign` bricht dann ab. Wegräumen hilft nicht —
#      nach fünf Sekunden ist das Attribut zurück. Deshalb DERIVED unter ~/Library.
#   2. `xcodebuild` meldet einen Fehlschlag NICHT verlässlich über den Rückgabewert
#      (`expo run:ios` gibt sogar EXIT 0 zurück, wenn xcodebuild darunter gescheitert
#      ist). Geprüft wird deshalb die ANWESENHEIT von "BUILD SUCCEEDED", nicht die
#      Abwesenheit von "error:" — der codesign-Fehler am 2026-09-08 hatte gar keine
#      `error:`-Zeile.
#   3. Ein Build-Protokoll darf nie durch `tail` laufen. Fehler stehen in der MITTE.
#      Es geht ganz in eine Datei und wird hinterher gegrept.
#   4. Ein iPhone lässt keine App installieren, solange es GESPERRT ist. Die Meldung
#      (`CoreDeviceError 12040`) nennt den Grund nicht; er steht nur in der
#      Detailausgabe von `devicectl` (`kAMDMobileImageMounterDeviceLocked`).
#   5. Im WLAN hängen fremde Geräte — Ians eigener Hinweis. Vor dem Installieren wird
#      der Gerätename angezeigt und bestätigt, nie das erstbeste genommen.
#   6. Ein `expo prebuild` wirft DEVELOPMENT_TEAM und CODE_SIGN_STYLE aus
#      project.pbxproj. Dieses Skript prebuildet nicht, es prüft die Zeilen nur —
#      und sagt, wenn sie fehlen.
#
# ── Was es NICHT tut ─────────────────────────────────────────────────────────
# Es meldet sich nicht bei Apple an und legt keine Zertifikate an. Wenn Xcode das
# Team nicht kennt, kann das Skript nur sagen, was zu tun ist.

set -euo pipefail

WURZEL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$WURZEL"

DERIVED="$HOME/Library/Developer/Xcode/DerivedData/SimplySocial-geraet"
PROTOKOLL="$DERIVED/build-$(date +%Y%m%d-%H%M%S).log"
PBXPROJ="ios/SimplySocial.xcodeproj/project.pbxproj"

# ── Schritt 0: Signatur prüfen ───────────────────────────────────────────────
if [ ! -f "$PBXPROJ" ]; then
  echo "✗ Es gibt keinen ios/-Ordner. Erst 'npx expo prebuild --platform ios' laufen lassen."
  exit 1
fi

TEAM="$(grep -m1 'DEVELOPMENT_TEAM' "$PBXPROJ" | sed 's/.*= *//; s/;.*//' | tr -d ' ')"
if [ -z "$TEAM" ]; then
  echo "✗ DEVELOPMENT_TEAM fehlt in $PBXPROJ."
  echo "  Das passiert nach jedem 'expo prebuild'. Die Zeile gehört an BEIDE Stellen"
  echo "  (Debug und Release), zusammen mit CODE_SIGN_STYLE = Automatic."
  exit 1
fi

# Ein Personal Team signiert nur 7 Tage. Das ist kein Fehler, aber es soll dastehen,
# BEVOR gebaut wird — sonst merkt man es erst, wenn die App eine Woche später stirbt.
# Gefragt wird der TYP, nicht die ID — und das ist der eigentliche Grund:
# Tritt jemand mit derselben Apple-ID dem Developer-Programm bei, wertet Apple das
# bestehende Personal Team AUF; die Team-ID bleibt Zeichen für Zeichen dieselbe
# (gemessen am 2026-09-11: 5TQTMP2L2H vorher wie nachher, "Personal Team" → "Individual").
# Ein Skript, das an der ID erkennen will, ob 7 Tage oder 12 Monate gelten, erkennt
# also GAR NICHTS.
#
# Gefragt wird `teamType`, nicht `isFreeProvisioningTeam` — und das ist kein Geschmack:
# Letzteres steht in der plist VOR der teamID (ein `grep -A` findet es also nie) und
# `plutil -p` schreibt `=> true`, nicht `=> 1`. Beide Fehler ergaben still eine 0, und
# eine Prüfung, die nichts findet, sieht aus wie eine, die Entwarnung gibt.
FREI="$(plutil -p ~/Library/Preferences/com.apple.dt.Xcode.plist 2>/dev/null \
        | grep -A3 "\"teamID\" => \"$TEAM\"" | grep -c 'Personal Team' || true)"
echo "Team: $TEAM"
if [ "$FREI" != "0" ]; then
  echo "⚠️  Das ist ein PERSONAL TEAM (gratis). Die App gilt dann 7 TAGE."
  echo "   Mit dem Developer-Programm wären es 12 Monate — dafür muss Xcode die"
  echo "   Mitgliedschaft kennen: Xcode → Settings → Accounts → Apple-ID auswählen."
  echo "   Danach die neue Team-ID in $PBXPROJ eintragen (beide Stellen)."
  echo
  read -r -p "   Trotzdem mit 7 Tagen bauen? [j/N] " ANTWORT
  [ "$ANTWORT" = "j" ] || exit 1
fi

# ── Schritt 0b: Ein veraltetes 7-Tage-Profil wegräumen ───────────────────────
#
# Am 2026-09-11 hat genau das einen kompletten Build wertlos gemacht: Der Beitritt
# zum Developer-Programm war durch, Xcode zeigte "Individual" — und `xcodebuild`
# hat trotzdem das ZWISCHENGESPEICHERTE Profil vom 2026-09-07 eingebettet, mit
# `TimeToLive: 7`. Der Build meldete BUILD SUCCEEDED, und die App wäre am 14.09.
# genauso gestorben wie vorher. `-allowProvisioningUpdates` holt nämlich nur ein
# neues Profil, wenn KEINES passt — ein abgelaufenes ist ihm lieber als keines.
#
# Deshalb: Passt das Team (zahlend) nicht zum Profil (7 Tage), fliegt das Profil
# raus, BEVOR gebaut wird. Weggeräumt heisst verschoben, nicht gelöscht.
PROFILE="$HOME/Library/Developer/Xcode/UserData/Provisioning Profiles"
if [ "$FREI" = "0" ] && [ -d "$PROFILE" ]; then
  for PRO in "$PROFILE"/*.mobileprovision; do
    [ -e "$PRO" ] || continue
    security cms -D -i "$PRO" > /tmp/ss-pruef.plist 2>/dev/null || continue
    TTL="$(plutil -extract TimeToLive raw /tmp/ss-pruef.plist 2>/dev/null || true)"
    if [ "$TTL" = "7" ]; then
      mkdir -p /tmp/ss-profile-alt
      mv "$PRO" /tmp/ss-profile-alt/
      echo "→ 7-Tage-Profil weggeräumt ($(basename "$PRO")) — Xcode holt ein neues."
      echo "  (liegt in /tmp/ss-profile-alt, falls es doch gebraucht wird)"
    fi
  done
fi

# ── Schritt 1: Bauen ─────────────────────────────────────────────────────────
mkdir -p "$DERIVED"
echo "Baue (Release, generic/platform=iOS). Protokoll: $PROTOKOLL"
set +e
xcodebuild -workspace "$WURZEL/ios/SimplySocial.xcworkspace" \
  -scheme SimplySocial \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -derivedDataPath "$DERIVED" \
  -allowProvisioningUpdates > "$PROTOKOLL" 2>&1
set -e

# Falle 2: Die ANWESENHEIT des Erfolgs zählt, nicht der Rückgabewert.
if ! grep -q "BUILD SUCCEEDED" "$PROTOKOLL"; then
  echo "✗ Der Build ist gescheitert. Der Grund steht VOR einer dieser Zeilen:"
  grep -nE "error:|failed with a nonzero exit code|BUILD FAILED" "$PROTOKOLL" | head -10
  echo "  Ganzes Protokoll: $PROTOKOLL"
  exit 1
fi
APP="$DERIVED/Build/Products/Release-iphoneos/SimplySocial.app"
echo "✓ Gebaut: $APP"

# Wie lange die App gilt, steht im eingebetteten Profil — gemessen, nicht geschätzt.
# Und das ist eine PRÜFUNG, keine Auskunft: "BUILD SUCCEEDED" beantwortet
# "hat er gebaut?", nicht "gilt sie ein Jahr?" — und gebaut wird wegen der zweiten
# Frage. Am 2026-09-11 waren beide Antworten verschieden.
if security cms -D -i "$APP/embedded.mobileprovision" > /tmp/ss-profil.plist 2>/dev/null; then
  TTL="$(plutil -extract TimeToLive raw /tmp/ss-profil.plist 2>/dev/null || true)"
  BIS="$(plutil -extract ExpirationDate raw /tmp/ss-profil.plist 2>/dev/null || true)"
  echo "  Gültig bis: $BIS  (TimeToLive: ${TTL:-?} Tage)"
  if [ "$FREI" = "0" ] && [ "$TTL" = "7" ]; then
    echo "✗ Das Team zahlt, die App gilt trotzdem nur 7 TAGE."
    echo "  Xcode hat ein altes Profil eingebettet. Dieses hier wegräumen und neu bauen:"
    echo "  mv ~/Library/Developer/Xcode/UserData/Provisioning\\ Profiles/*.mobileprovision /tmp/"
    exit 1
  fi
fi

# ── Schritt 2: Das richtige Gerät ────────────────────────────────────────────
echo
echo "Gefundene Geräte:"
xcrun devicectl list devices 2>/dev/null | sed -n '3,20p'
echo
read -r -p "UDID des Geräts (Ians iPhone!): " UDID
[ -n "$UDID" ] || { echo "✗ Ohne UDID geht es nicht."; exit 1; }

NAME="$(xcrun devicectl list devices 2>/dev/null | grep "$UDID" | awk '{print $1}')"
echo "Gerät: ${NAME:-unbekannt}"
read -r -p "Ist das wirklich dein iPhone? [j/N] " OK
[ "$OK" = "j" ] || { echo "Abgebrochen — richtig so."; exit 1; }

# ── Schritt 3: Ist das Display offen? ────────────────────────────────────────
# Der beste Sperr-Test, den es gibt (gemessen am 2026-09-08): Ein TUNNEL braucht nur
# Vertrauen, das DISK-IMAGE braucht ein offenes Display. Mountet es, ist das Handy auf.
geraet_offen() {
  xcrun devicectl device info ddiServices --device "$1" 2>&1 | grep -q "isUsable: true"
}

# ── Ians Entscheidung: Was passiert, wenn das Handy zu ist? ──────────────────
#
# Am 2026-09-07 ist genau das schiefgegangen: 30 Wiederholungen im Sekundentakt
# haben das Rennen gegen die automatische Sperre NICHT gewonnen. Drei Möglichkeiten,
# und sie unterscheiden sich wirklich:
#
#   'abbrechen'  — sofort raus, mit der Bitte, die Auto-Sperre auf „Nie“ zu stellen.
#                  Ehrlich und schnell. Haken: Wer gerade nebendran sitzt und das
#                  Handy in zwei Sekunden entsperrt, muss alles neu starten.
#   'warten'     — in Ruhe pollen (z. B. 60× alle 2 s) und losfahren, sobald es auf
#                  ist. Bequem. Haken: Steht das Handy in einem anderen Zimmer,
#                  hängt das Skript zwei Minuten und sagt nicht, worauf es wartet.
#   'bitten'     — einmal auffordern („mach es jetzt auf“), dann kurz warten, und
#                  wenn es dann noch zu ist, abbrechen. Der Mittelweg.
#
# TODO(Ian): Dein Wort hier hinein — mehr ist es nicht.
SPERR_ANTWORT='bitten'   # ← Platzhalter, KEINE Entscheidung (vgl. zaehltAlsTermin)

if ! geraet_offen "$UDID"; then
  case "$SPERR_ANTWORT" in
    abbrechen)
      echo "✗ Das Handy ist gesperrt. Einstellungen → Anzeige & Helligkeit →"
      echo "  Automatische Sperre → „Nie“, dann noch einmal starten."
      exit 1 ;;
    warten)
      echo "⏳ Das Handy ist gesperrt. Ich warte, bis du es aufmachst (max. 2 Minuten)…"
      for _ in $(seq 60); do sleep 2; geraet_offen "$UDID" && break; done ;;
    bitten)
      echo "🔓 Mach das iPhone bitte JETZT auf — ich warte 20 Sekunden."
      for _ in $(seq 10); do sleep 2; geraet_offen "$UDID" && break; done ;;
  esac
  if ! geraet_offen "$UDID"; then
    echo "✗ Immer noch zu. Stell die automatische Sperre auf „Nie“ und starte neu."
    exit 1
  fi
fi

# ── Schritt 4: Aufspielen ────────────────────────────────────────────────────
xcrun devicectl device install app --device "$UDID" "$APP"
echo
echo "✓ Drauf. Beim ERSTEN Mal mit einem neuen Team einmal am iPhone bestätigen:"
echo "  Einstellungen → Allgemein → VPN & Geräteverwaltung → Profil → Vertrauen."
