#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  Apple und Google in Supabase eintragen — Feld für Feld, mit ⌘V
#  Aufruf:  npm run provider
#
#  ── Wofür das da ist ────────────────────────────────────────────────────────
#  Die Provider-Einstellungen lassen sich nur im Supabase-Dashboard setzen; dafür
#  bräuchte es sonst einen Management-Token, und den gibt es hier nicht. Es bleiben
#  also Klicks — aber niemand muss dabei einen 35-Zeichen-Schlüssel abtippen oder
#  raten, welcher Wert in welches Feld gehört.
#
#  Dasselbe Muster wie `db-url.sh`: Das Skript führt, die Zwischenablage trägt.
#
#  ── Warum am Ende die Zwischenablage überschrieben wird ─────────────────────
#  Weil zwischendurch das Client Secret und der private Apple-Schlüssel darin
#  liegen. Ein Passwort, das nach getaner Arbeit in der Zwischenablage
#  liegenbleibt, landet beim nächsten ⌘V irgendwo, wo es nicht hingehört — am
#  2026-09-12 genau einmal passiert, deshalb steht es hier als Schritt und nicht
#  als guter Vorsatz.
# ═══════════════════════════════════════════════════════════════════════════════
set -u

ORDNER="$HOME/.simplysocial"
APPLE_KEY="$ORDNER/AuthKey_F2M3N3K9M5.p8"
TEAM_ID="5TQTMP2L2H"
KEY_ID="F2M3N3K9M5"
BUNDLE="at.simplysocial.app"

blau()  { printf '\033[1;36m%s\033[0m\n' "$1"; }
grau()  { printf '\033[2m%s\033[0m\n' "$1"; }

# Legt einen Wert in die Zwischenablage und wartet, bis er eingefügt wurde.
schritt() {
  local feld="$1" wert="$2" geheim="${3:-nein}"
  printf '\n'
  blau "  Feld:  $feld"
  if [ "$geheim" = "ja" ]; then
    grau "         (in der Zwischenablage: ${#wert} Zeichen, nicht angezeigt)"
  else
    grau "         $wert"
  fi
  printf '%s' "$wert" | pbcopy
  # Gegengemessen: pbcopy meldet nicht, wenn etwas anderes die Ablage überschreibt.
  if [ "$(pbpaste | shasum | cut -c1-12)" != "$(printf '%s' "$wert" | shasum | cut -c1-12)" ]; then
    echo "  ✗ Die Zwischenablage trägt etwas anderes. Abbruch."
    exit 1
  fi
  printf '         → ⌘V, dann [Enter] hier: '
  warte
}

# Auf [Enter] warten -- mit Terminal, und sonst gar nicht erst so tun als ob.
warte() {
  if [ -r /dev/tty ]; then
    read -r _ < /dev/tty
  elif [ -t 0 ]; then
    read -r _
  else
    echo; echo "  ✗ Kein Terminal. Starte das Skript direkt: npm run provider"; exit 1
  fi
}

fehlt=0
for f in "$APPLE_KEY" "$ORDNER/google-client-secret" "$ORDNER/google-web-client-id"; do
  [ -s "$f" ] || { echo "✗ Fehlt: $f"; fehlt=1; }
done
[ "$fehlt" = "1" ] && exit 1

IOS_ID=""
[ -s "$ORDNER/google-ios-client-id" ] && IOS_ID=$(cat "$ORDNER/google-ios-client-id")

cat <<KOPF

═══════════════════════════════════════════════════════════════════════════
  Mach diese Seite auf:

    https://supabase.com/dashboard/project/iwvakdbefwpshzhlhmgj/auth/providers

  Dann hier [Enter] — ich gehe Feld für Feld mit dir durch.
═══════════════════════════════════════════════════════════════════════════
KOPF
printf '  [Enter] wenn die Seite offen ist: '
warte

# ── Apple ───────────────────────────────────────────────────────────────────
cat <<APPLE

───────────────────────────────────────────────────────────────────────────
  1/2  APPLE      → in der Liste "Apple" aufklappen, Schalter auf AN
───────────────────────────────────────────────────────────────────────────
APPLE
schritt "Services ID (Client ID)" "$BUNDLE"
schritt "Team ID"                 "$TEAM_ID"
schritt "Key ID"                  "$KEY_ID"
schritt "Private Key"             "$(cat "$APPLE_KEY")" ja
echo
echo "  → Jetzt bei Apple auf SAVE."
printf '  [Enter] wenn gespeichert: '
warte

# ── Google ──────────────────────────────────────────────────────────────────
cat <<GOOGLE

───────────────────────────────────────────────────────────────────────────
  2/2  GOOGLE     → in der Liste "Google" aufklappen, Schalter auf AN
───────────────────────────────────────────────────────────────────────────
GOOGLE

# Supabase nimmt mehrere Client IDs mit Komma getrennt. Die Web-ID ist die, mit
# der Supabase selbst den Anmelde-Umweg macht; die iOS-ID muss daneben stehen,
# sonst weist Supabase das Token der nativen App als "falscher Empfänger" ab.
if [ -n "$IOS_ID" ]; then
  schritt "Client IDs (beide, mit Komma)" "$(cat "$ORDNER/google-web-client-id"),$IOS_ID"
else
  schritt "Client IDs" "$(cat "$ORDNER/google-web-client-id")"
  echo
  echo "  ⚠️  Die iOS-Client-ID fehlt noch. Trag sie SPÄTER hier mit Komma dahinter"
  echo "      ein — ohne sie weist Supabase die Anmeldung aus der iPhone-App ab."
  echo "      Holen: Google-Client-Liste → SimplySocial iOS → Kopier-Symbol → dann"
  echo "      npm run google-key sichern"
fi
schritt "Client Secret" "$(cat "$ORDNER/google-client-secret")" ja
echo
echo "  → Jetzt bei Google auf SAVE."
printf '  [Enter] wenn gespeichert: '
warte

# ── Aufräumen ───────────────────────────────────────────────────────────────
printf 'https://supabase.com/dashboard' | pbcopy
cat <<ENDE

═══════════════════════════════════════════════════════════════════════════
  ✓ Fertig. Die Zwischenablage ist überschrieben — weder das Client Secret
    noch der Apple-Schlüssel liegen noch darin.
═══════════════════════════════════════════════════════════════════════════

ENDE
