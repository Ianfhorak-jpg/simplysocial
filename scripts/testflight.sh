#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  EINEN BUILD NACH TESTFLIGHT BRINGEN — Phase 21.4
#  Aufruf:  npm run testflight
# ═══════════════════════════════════════════════════════════════════════════════
#
#  ── Warum es dieses Skript gibt ──────────────────────────────────────────────
#  Build 1 kam am 2026-09-11 nach TestFlight, aber WIE steht nirgends — und im
#  Konto ist keine Spur davon: kein Distribution-Zertifikat, kein Profil, und
#  `eas build:list` ist leer. Beim nächsten Mal hätte man wieder von vorn gesucht.
#  Jetzt steht der Weg hier, in der Reihenfolge, in der Apple ihn verlangt.
#
#  ── Was es tut, und was davon EINMALIG ist ──────────────────────────────────
#    1. Distribution-Zertifikat      nur beim ersten Lauf (dann liegt es da)
#    2. Bundle-ID + Profil           nur beim ersten Lauf
#    3. Zertifikat in den Schlüsselbund   nur beim ersten Lauf
#    4. Archivieren                  jedes Mal
#    5. Als .ipa exportieren         jedes Mal
#    6. Zu App Store Connect laden   jedes Mal
#
#  Die Schritte 1–3 fassen den SCHLÜSSELBUND und `~/.appstoreconnect/` an. Ein
#  Werkzeug, das das im Hintergrund tut, wäre genau das, wovor der Auto-Mode
#  schützt — deshalb läuft dieses Skript bewusst im Vordergrund, sagt vor jedem
#  Schritt, was es vorhat, und lässt sich mit Strg-C abbrechen.
#
#  ── Was NICHT hier passiert ─────────────────────────────────────────────────
#  Die Tester einladen. Die interne Gruppe `Gründer` steht auf
#  `hasAccessToAllBuilds = true` — jeder neue Build landet von selbst darin, und
#  Ian bekommt ihn in der TestFlight-App. Die anderen drei Gründer kommen dazu,
#  wenn er es sagt (und die Wahl intern/extern steht dann wieder an).
#
#  ⚠️ Der private Schlüssel des Zertifikats liegt in `~/.appstoreconnect/dist/`,
#  Rechte 600, AUSSERHALB des Repos — harte Regel 12 in ihrer schärfsten Form.
#  Wer ihn verliert, kann nur ein neues Zertifikat anlegen (Apple erlaubt zwei) —
#  das Zertifikat selbst ist ohne seinen privaten Schlüssel wertlos.

set -euo pipefail

HIER="$(cd "$(dirname "$0")" && pwd)"
PROJEKT="$(cd "$HIER/.." && pwd)"
GEHEIM="$HOME/.appstoreconnect"
DIST="$GEHEIM/dist"
BUNDLE_ID="at.simplysocial.app"
TEAM="5TQTMP2L2H"
KEY_ID="6244676353"
BAUPLATZ="$HOME/Library/Developer/Xcode/DerivedData/SimplySocial-testflight"

# Die Issuer-ID ist ein Geheimnis und wird aus JEDER Ausgabe gefiltert — Apple
# spiegelt sie in manchen Fehlermeldungen zurück (Lehre vom 2026-09-11).
ISSUER="$(cat "$GEHEIM/issuer_id")"
filtern() { sed "s|$ISSUER|«issuer-id»|g"; }

echo "═══ TestFlight — SimplySocial ═══"
echo

# ── 0. Die Voraussetzungen, bevor irgendetwas 20 Minuten läuft ───────────────
#
# Jede dieser Prüfungen hat schon einmal einen Abend gekostet — die Reihenfolge
# ist die der Kosten: Was ohne Build auffallen kann, fällt hier auf.
[ -f "$GEHEIM/private_keys/AuthKey_$KEY_ID.p8" ] || {
  echo "✗ Der App-Store-Connect-Schlüssel fehlt: $GEHEIM/private_keys/AuthKey_$KEY_ID.p8"; exit 1; }
[ -d "$PROJEKT/ios" ] || {
  echo "✗ Es gibt keinen ios/-Ordner. Erst 'npx expo prebuild --platform ios'."; exit 1; }

# Der Schalter. `deploy.sh` bewacht ihn für den Browser (harte Regel 96) — hier
# gilt das Gegenteil: Ein TestFlight-Build mit 'attrappe' wäre eine App voller
# erfundener Menschen, die Ian seinen Mitgründern schickt.
QUELLE="$(grep -oE "ANMELDE_QUELLE: 'attrappe' \| 'supabase' = '[a-z]+'" \
          "$PROJEKT/src/features/auth/anmeldung.ts" | grep -oE "'[a-z]+'$" | tr -d "'")"
if [ "$QUELLE" != "supabase" ]; then
  echo "✗ ANMELDE_QUELLE steht auf '$QUELLE', nicht auf 'supabase'."
  echo "  Ein TestFlight-Build mit Attrappen-Daten zeigt erfundene Menschen."
  exit 1
fi
echo "✓ ANMELDE_QUELLE = supabase"

BUILDNR="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleVersion' "$PROJEKT/ios/SimplySocial/Info.plist")"
VERSION="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$PROJEKT/ios/SimplySocial/Info.plist")"
echo "✓ Version $VERSION, Build $BUILDNR"

# Eine Build-Nummer, die es bei Apple schon gibt, wird NACH dem Upload abgelehnt —
# also nach zwanzig Minuten Bauzeit. Deshalb wird vorher gefragt.
echo -n "… frage App Store Connect nach vorhandenen Builds … "
# ⚠️ Die Antwort wird ERST gefangen, dann gezählt. Vorher lief `asc.py` direkt in
# `grep -c … || true` — als am 2026-10-17 ein Homebrew-Upgrade `python3` auf 3.15
# ohne `jwt` gezogen hatte, starb `asc.py` beim Import, `grep` zählte 0, und die
# Prüfung meldete „frei", ohne Apple je gefragt zu haben.
if ! BUILDS="$(cd "$PROJEKT" && python3 scripts/asc.py builds 2>&1)"; then
  echo
  echo "✗ App Store Connect liess sich nicht fragen — die Prüfung wäre blind."
  echo "$BUILDS" | tail -3 | sed 's/^/    /'
  echo "  Fehlt 'jwt': python3 -m pip install --user --break-system-packages pyjwt cryptography"
  exit 1
fi
SCHON="$(echo "$BUILDS" | grep -c "^  Build $BUILDNR " || true)"
if [ "${SCHON:-0}" != "0" ]; then
  echo
  echo "✗ Build $BUILDNR gibt es bei Apple schon."
  echo "  Zähl CFBundleVersion in app.json UND ios/SimplySocial/Info.plist hoch."
  exit 1
fi
echo "Build $BUILDNR ist frei."
echo

# ── 1. Das Distribution-Zertifikat ───────────────────────────────────────────
if [ -f "$DIST/dist.cer" ] && [ -f "$DIST/dist.key" ]; then
  echo "✓ Distribution-Zertifikat liegt schon in ~/.appstoreconnect/dist/"
else
  echo "── Schritt 1: Distribution-Zertifikat anlegen ──"
  # Keine feste Zahl in der Meldung: „du hast 0" stand hier am 2026-09-14 noch,
  # als der erste Lauf das Zertifikat schon angelegt hatte — eine Warnung mit einer
  # Zahl darin veraltet genauso still wie das, wovor sie warnt. `asc.py` zählt beim
  # Anlegen selbst nach und bricht ab, wenn keins mehr frei ist.
  echo "   Es wird in DEINEM Apple-Konto angelegt (Apple erlaubt zwei)."
  echo "   Der private Schlüssel bleibt in ~/.appstoreconnect/dist/, Rechte 600."
  echo "   Widerrufbar unter developer.apple.com → Certificates."
  echo
  umask 077
  mkdir -p "$DIST"
  [ -f "$DIST/dist.key" ] || openssl genrsa -out "$DIST/dist.key" 2048 2>/dev/null
  openssl req -new -key "$DIST/dist.key" -out "$DIST/dist.csr" \
    -subj "/emailAddress=ian.fhorak@gmail.com/CN=SimplySocial Distribution/C=AT" 2>/dev/null
  python3 "$HIER/asc.py" zertifikat-anlegen 2>&1 | filtern
fi

# ── 2. In den Schlüsselbund ──────────────────────────────────────────────────
if security find-identity -v -p codesigning 2>/dev/null | grep -q "Apple Distribution"; then
  echo "✓ Distribution-Identität ist im Schlüsselbund"
else
  echo "── Schritt 2: Zertifikat in den Schlüsselbund ──"
  # `.cer` + privater Schlüssel ergeben erst zusammen eine Identität. Der Umweg
  # über eine .p12 ist der einzige, den `security import` für beides kennt.
  #
  # ⚠️ **`-legacy` ist hier kein Schalter, sondern die Bedingung, unter der es
  # überhaupt geht.** Am 2026-09-14 scheiterte der erste Lauf mit
  #
  #     security: SecKeychainItemImport: MAC verification failed during
  #               PKCS12 import (wrong password?)
  #
  # — und das Passwort war nie das Problem. `openssl` ist auf diesem Mac das von
  # Homebrew (3.6.4), und OpenSSL 3 schreibt PKCS12 mit MAC **sha256** und
  # AES-256-CBC. Apples Security-Framework liest nur das alte Format (MAC sha1,
  # RC2). Es kann den MAC also gar nicht prüfen und meldet das als falsches
  # Passwort — die irreführendste Fehlermeldung dieses Projekts.
  #
  # Gemessen, nicht vermutet: dasselbe Zertifikat zweimal verpackt und beide in
  # einen Wegwerf-Schlüsselbund importiert. Ohne `-legacy` derselbe Fehler, mit
  # `-legacy` „1 identity imported".
  #
  # `/usr/bin/openssl` (Apples LibreSSL 3.3.6) täte es auch — aber es steht nicht
  # bei jedem im PATH vorn, und ein Skript, das vom PATH abhängt, ist genau das,
  # was hier schon einmal schiefging. `-legacy` sagt, was gemeint ist.
  openssl pkcs12 -export -legacy -inkey "$DIST/dist.key" -in "$DIST/dist.cer" \
    -out "$DIST/dist.p12" -passout pass:simplysocial -name "SimplySocial Distribution" 2>/dev/null
  chmod 600 "$DIST/dist.p12"
  security import "$DIST/dist.p12" -k ~/Library/Keychains/login.keychain-db \
    -P simplysocial -T /usr/bin/codesign -T /usr/bin/security
  # Die ANWESENHEIT der Identität prüfen, nicht den Exit-Code von `security`:
  # Es meldet auch dann 0, wenn es nichts importiert hat.
  if ! security find-identity -v -p codesigning 2>/dev/null | grep -q "Apple Distribution"; then
    echo "✗ Der Import lief durch, aber es gibt keine Distribution-Identität."
    echo "  Prüfen:  security find-identity -v -p codesigning"
    exit 1
  fi
  echo "✓ importiert"

  # ── Und die Freigabe, ohne die der Build an Dialogen erstickt ──────────────
  #
  # Am 2026-09-14 gemessen: Nach dem Import fragt macOS bei JEDEM Signiervorgang
  # „codesign möchte auf den Schlüssel „dist" zugreifen". Ein Archive signiert die
  # App UND jedes Framework einzeln — das sind dutzende Dialoge, und „Erlauben"
  # gilt immer nur für einen davon. („Immer erlauben" im Dialog täte dasselbe wie
  # die Zeile hier, aber nur, wenn man den richtigen der drei Knöpfe trifft.)
  #
  # `-T /usr/bin/codesign` beim Import reicht dafür NICHT: Das setzt die ACL des
  # Schlüssels, aber der Schlüsselbund verlangt zusätzlich, dass die *partition
  # list* die Werkzeuggruppe nennt. Solange sie leer ist, fragt er trotzdem.
  #
  # Das braucht das Mac-Anmeldepasswort. Es wird NICHT im Skript abgefragt und
  # nirgends gespeichert — ohne `-k` fragt `security` selbst danach, und das ist
  # die einzige Stelle, an der dieses Passwort auftauchen darf.
  echo
  echo "   Eine Freigabe noch — sonst fragt macOS bei jedem Framework einzeln."
  echo "   Gleich kommt die Frage nach deinem MAC-ANMELDEPASSWORT (zweimal, normal)."
  security set-key-partition-list -S apple-tool:,apple:,codesign: -s \
    -l dist ~/Library/Keychains/login.keychain-db >/dev/null 2>&1 \
  || security set-key-partition-list -S apple-tool:,apple:,codesign: -s \
    ~/Library/Keychains/login.keychain-db >/dev/null 2>&1 \
  || echo "   (Freigabe nicht gesetzt — dann im Dialog „Immer erlauben\" wählen.)"
  echo "✓ freigegeben"
fi

# ── 3. Das Provisioning-Profil ───────────────────────────────────────────────
PROFIL="$DIST/simplysocial_appstore.mobileprovision"
if [ -f "$PROFIL" ]; then
  echo "✓ Profil liegt schon da"
else
  echo "── Schritt 3: App-Store-Profil anlegen ──"
  python3 "$HIER/asc.py" profil-anlegen 2>&1 | filtern
fi
PROFIL_UUID="$(security cms -D -i "$PROFIL" 2>/dev/null | plutil -extract UUID raw - -o -)"
PROFIL_NAME="$(security cms -D -i "$PROFIL" 2>/dev/null | plutil -extract Name raw - -o -)"
mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
cp "$PROFIL" ~/Library/MobileDevice/Provisioning\ Profiles/"$PROFIL_UUID".mobileprovision
echo "✓ Profil: $PROFIL_NAME"
echo

# ── 4. Archivieren ───────────────────────────────────────────────────────────
echo "── Schritt 4: Archivieren (dauert einige Minuten) ──"
# ⚠️ **Hier kommt gleich ein Dialog, und er sieht beunruhigender aus als er ist.**
# macOS fragt: „codesign möchte auf den Schlüssel „dist" in deinem Schlüsselbund
# zugreifen." Das ist dieser Build — `codesign` ist der Teil von `xcodebuild`, der
# signiert, und `dist` der private Schlüssel aus Schritt 2.
#
# **„Immer erlauben" drücken, nicht „Erlauben".** Ein Archive signiert nicht nur die
# App, sondern jedes Framework darin einzeln; bei „Erlauben" käme der Dialog dutzende
# Male und der Build stünde dazwischen still. Das Passwort ist das ANMELDEpasswort
# des Macs, keins aus diesem Projekt.
#
# Warum der Dialog überhaupt kommt, obwohl der Import in Schritt 2 `-T /usr/bin/codesign`
# gesetzt hat: Die ACL erlaubt das Werkzeug, aber der Schlüsselbund verlangt trotzdem
# eine Freigabe, solange die *partition list* des Schlüssels leer ist. Sie zu setzen
# (`security set-key-partition-list`) bräuchte das Anmeldepasswort im Skript — und ein
# Skript, das nach dem Mac-Passwort fragt, ist schlechter als ein Dialog, den Apple
# selbst zeigt. Deshalb steht hier eine Erklärung statt einer Automatik.
echo "   ⚠️ Wenn macOS nach dem Schlüssel „dist\" fragt: „Immer erlauben\" wählen."
echo "      (Das ist dieser Build. Passwort = dein Mac-Anmeldepasswort.)"
PROTOKOLL="$BAUPLATZ/archive-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "$BAUPLATZ"
ARCHIV="$BAUPLATZ/SimplySocial.xcarchive"
rm -rf "$ARCHIV"

# ⚠️ Das Protokoll läuft NICHT durch `tail` (Falle aus der Liste) und wird auf
# ANWESENHEIT von "ARCHIVE SUCCEEDED" geprüft, nicht auf Abwesenheit von "error:"
# — ein gescheiterter Build hat nicht immer eine `error:`-Zeile.
set +e
xcodebuild -workspace "$PROJEKT/ios/SimplySocial.xcworkspace" \
  -scheme SimplySocial -configuration Release \
  -destination 'generic/platform=iOS' -archivePath "$ARCHIV" \
  DEVELOPMENT_TEAM="$TEAM" CODE_SIGN_STYLE=Manual \
  CODE_SIGN_IDENTITY="Apple Distribution" \
  PROVISIONING_PROFILE_SPECIFIER="$PROFIL_NAME" \
  archive > "$PROTOKOLL" 2>&1
set -e
if ! grep -q "ARCHIVE SUCCEEDED" "$PROTOKOLL"; then
  echo "✗ Das Archivieren ist gescheitert. Protokoll: $PROTOKOLL"
  grep -E "error:|The following build commands failed" "$PROTOKOLL" | head -10 | filtern
  exit 1
fi
echo "✓ Archiviert"

# ── 5. Exportieren ───────────────────────────────────────────────────────────
echo "── Schritt 5: Als .ipa exportieren ──"
EXPORT="$BAUPLATZ/export"
rm -rf "$EXPORT"
cat > "$BAUPLATZ/export.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>method</key><string>app-store-connect</string>
  <key>teamID</key><string>$TEAM</string>
  <key>uploadSymbols</key><true/>
  <key>signingStyle</key><string>manual</string>
  <key>provisioningProfiles</key><dict>
    <key>$BUNDLE_ID</key><string>$PROFIL_NAME</string>
  </dict>
</dict></plist>
PLIST
xcodebuild -exportArchive -archivePath "$ARCHIV" \
  -exportOptionsPlist "$BAUPLATZ/export.plist" -exportPath "$EXPORT" \
  > "$BAUPLATZ/export.log" 2>&1 || {
    echo "✗ Export gescheitert. Protokoll: $BAUPLATZ/export.log"
    grep -E "error|Error" "$BAUPLATZ/export.log" | head -8 | filtern; exit 1; }
IPA="$(find "$EXPORT" -name '*.ipa' | head -1)"
[ -n "$IPA" ] || { echo "✗ Keine .ipa gefunden."; exit 1; }
echo "✓ $(basename "$IPA") ($(du -h "$IPA" | cut -f1))"

# ── 6. Hochladen ─────────────────────────────────────────────────────────────
echo "── Schritt 6: Zu App Store Connect laden ──"
xcrun altool --upload-app -f "$IPA" -t ios \
  --apiKey "$KEY_ID" --apiIssuer "$ISSUER" 2>&1 | filtern

echo
echo "✓ Oben. Apple verarbeitet den Build jetzt — das dauert 5 bis 30 Minuten."
echo "  Fortschritt:  npm run asc builds"
echo "  Danach liegt er in TestFlight in der Gruppe „Gründer“ (automatisch)."
