#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  Den Supabase-MANAGEMENT-Token ablegen.  Aufruf:  npm run mgmt-token
#  (vorher: https://supabase.com/dashboard/account/tokens → "Generate new token")
#
#  ── Warum es ihn überhaupt gibt ─────────────────────────────────────────────
#  Im Kopf von `provider-einrichten.sh` steht seit dem 12.09.: *„Die
#  Provider-Einstellungen lassen sich nur im Dashboard setzen; dafür bräuchte es
#  sonst einen Management-Token, und den gibt es hier nicht."* Der Satz stimmte —
#  nur war die Folgerung daraus teuer: Ian ist auf der Dashboard-Seite ZWEIMAL
#  falsch gelandet (Authentication → Emails statt Sign In / Providers), weil
#  beide unter „Authentication" liegen und er die Mail-Vorlagen vorher schon
#  bearbeitet hatte. Zwanzig Klicks an einer verwechselbaren Stelle gegen drei an
#  einer eindeutigen — die Rechnung geht anders aus, sobald es den Token gibt.
#
#  ── Der Unterschied zu allen anderen Zugängen hier, und er ist groß ─────────
#  `db-url` öffnet EINE Datenbank, der anon key darf nur, was 34 Policies
#  erlauben. Dieser Token darf **alles in Ians Supabase-Konto** — Projekte
#  anlegen, löschen, Schlüssel auslesen. Deshalb drei Dinge:
#    · er geht nie durch den Chat, sondern über die Zwischenablage (wie `db-url`),
#    · er liegt mit Rechten 600 ausserhalb des Repos,
#    · und er ist zum WEGWERFEN gedacht: Nach dem Eintragen kann Ian ihn auf
#      derselben Seite widerrufen, ohne dass die App etwas davon merkt. Das
#      Skript sagt es am Ende noch einmal.
#
#  ── Und er wird GEPRÜFT, nicht geglaubt — an der Stelle, die zählt ──────────
#  Ein Token, der beim Ablegen nicht ausprobiert wird, meldet sich erst beim
#  Eintragen — mit einem 401 mitten in einem Ablauf, der schon halb gelaufen ist.
#  Dieselbe Lehre wie `db-url.sh`: Danach wird die Verbindung wirklich aufgebaut.
#
#  **Geprüft wird GENAU der Aufruf, den `provider-api.py` danach braucht**, und
#  nicht ein ähnlicher daneben. Die erste Fassung fragte die Projektliste ab
#  (`/v1/projects`) — bequem, weil die Antwort den Projekt-Verweis enthält, und
#  falsch, seit es fein einstellbare Token gibt: Einer, der die Auth-Einstellungen
#  ändern darf, aber keine Projektliste lesen, wäre hier durchgefallen, obwohl er
#  kann, wofür er geholt wurde. Ein Wächter, der die falsche Frage stellt, sperrt
#  zu viel oder zu wenig (harte Regel 83, an einer zweiten Stelle).
#
#  ── Und er prüft SCHREIBEN, weil Lesen nicht Schreiben ist ──────────────────
#  Die zweite Fassung prüfte nur das Lesen und sagte brav dazu, das Schreiben
#  werde erst im nächsten Schritt sichtbar. Am 2026-09-13 ist genau das
#  eingetreten: Ians Token hatte „Auth Config" auf READ, `mgmt-token` meldete
#  „✓ er darf lesen", und der 403 kam eine Minute später — nachdem das Apple-
#  Geheimnis schon erzeugt und die halbe Ausgabe gelaufen war.
#
#  **Ein Wächter, der eine ÄHNLICHE Frage stellt, ist kein Wächter.** Geprüft
#  wird deshalb mit einem PATCH, der nichts ändert: ein vorhandenes Feld wird auf
#  seinen EIGENEN Wert gesetzt. Das ist die einzige ehrliche Probe — dieselbe
#  Berechtigung, derselbe Endpunkt, dieselbe Methode — und sie hinterlässt
#  nachweislich nichts.
# ═══════════════════════════════════════════════════════════════════════════════
set -e
ORDNER="$HOME/.simplysocial"
ZIEL="$ORDNER/mgmt-token"
REF="iwvakdbefwpshzhlhmgj"

mkdir -p "$ORDNER"; chmod 700 "$ORDNER" 2>/dev/null || true

TOKEN="$(pbpaste | tr -d '[:space:]')"
[ -n "$TOKEN" ] || {
  echo "✗ Die Zwischenablage ist leer."
  echo "  https://supabase.com/dashboard/account/tokens → 'Generate new token' → kopieren."
  exit 1; }

# Der Wächter fragt nach dem, was NUR ein Management-Token hat. Ein anon key
# (`eyJ…`) und ein Datenbank-String sehen an dieser Stelle plausibel aus.
case "$TOKEN" in
  sbp_*) ;;
  eyJ*) echo "✗ Das ist ein API-Schlüssel aus dem Projekt, kein Management-Token."
        echo "  Der richtige fängt mit sbp_ an und steht unter Account → Access Tokens."
        exit 1 ;;
  postgresql*) echo "✗ Das ist der Datenbank-String (gehört in 'npm run db-url')."; exit 1 ;;
  *) echo "✗ Das sieht nicht nach einem Management-Token aus (${#TOKEN} Zeichen)."
     echo "  Erwartet wird etwas, das mit sbp_ anfängt."
     exit 1 ;;
esac

echo "── Darf er, wofür er geholt wurde? ──"
# Genau der Aufruf, den `provider-api.py` gleich braucht — Lesen der
# Auth-Einstellungen dieses einen Projekts.
ANTWORT="$(curl -s -w '\n%{http_code}' --max-time 25 \
  -H "Authorization: Bearer $TOKEN" \
  "https://api.supabase.com/v1/projects/$REF/config/auth")" \
  || { echo "✗ Keine Verbindung zu api.supabase.com."; exit 1; }
CODE="$(printf '%s' "$ANTWORT" | tail -1)"
RUMPF="$(printf '%s' "$ANTWORT" | sed '$d')"

# Der Token darf in KEINER Ausgabe auftauchen — Supabase spiegelt ihn bei
# manchen Fehlern zurück (dasselbe Muster wie der Filter in `db-url.sh`).
melde() { printf '%s' "$RUMPF" | sed "s|$TOKEN|«Token»|g" | head -3; }

case "$CODE" in
  200) ;;
  401) echo "✗ Supabase weist den Token ab (401)."
       echo "  Entweder ist er schon widerrufen, oder beim Kopieren ist etwas verlorengegangen."
       melde; exit 1 ;;
  403) echo "✗ Der Token ist gültig, darf aber die Auth-Einstellungen nicht lesen (403)."
       echo "  Bei einem fein einstellbaren Token fehlt die Berechtigung für Auth;"
       echo "  ein gewöhnlicher Personal Access Token hat sie immer."
       melde; exit 1 ;;
  404) echo "✗ Der Token ist gültig, sieht das Projekt $REF aber nicht (404)."
       echo "  Gehört er zum selben Supabase-Konto wie SimplySocial?"
       melde; exit 1 ;;
  *)   echo "✗ Supabase antwortet mit HTTP $CODE."; melde; exit 1 ;;
esac

# Gegenprobe auf den INHALT: Ein 200 mit einer Antwort, in der die
# Anbieter-Felder gar nicht vorkommen, wäre ein anderer Endpunkt als gedacht.
printf '%s' "$RUMPF" | grep -q 'external_apple_enabled' || {
  echo "✗ Die Antwort enthält kein 'external_apple_enabled' — das ist nicht die"
  echo "  Auth-Konfiguration, die erwartet wird. Hier nichts raten."
  exit 1; }
echo "✓ Er darf die Auth-Einstellungen von $REF lesen."

echo "── Und darf er sie auch ÄNDERN? ──"
# Ein PATCH, der nichts ändert: `external_apple_email_optional` wird auf den
# Wert gesetzt, den es schon hat. Gelesen wird er aus der Antwort von eben —
# nicht geraten, sonst wäre die Probe selbst eine Änderung.
IST="$(printf '%s' "$RUMPF" | python3 -c \
  "import json,sys; print(str(json.load(sys.stdin).get('external_apple_email_optional', False)).lower())")"
SCHREIB="$(curl -s -w '\n%{http_code}' --max-time 25 -X PATCH \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"external_apple_email_optional\": $IST}" \
  "https://api.supabase.com/v1/projects/$REF/config/auth")" \
  || { echo "✗ Keine Verbindung zu api.supabase.com."; exit 1; }
SCODE="$(printf '%s' "$SCHREIB" | tail -1)"

if [ "$SCODE" != "200" ]; then
  echo "✗ Er darf LESEN, aber nicht ÄNDERN (HTTP $SCODE)."
  echo "  Auf https://supabase.com/dashboard/account/tokens einen Token mit"
  echo "  'Auth Config' auf READ-WRITE erzeugen — READ allein reicht nicht."
  printf '%s' "$SCHREIB" | sed '$d' | sed "s|$TOKEN|«Token»|g" | head -2
  exit 1
fi
echo "✓ Er darf sie auch ändern (mit einem PATCH, der nichts geändert hat)."

printf '%s' "$TOKEN" > "$ZIEL"
chmod 600 "$ZIEL"
printf 'https://supabase.com/dashboard' | pbcopy

cat <<ENDE

✓ Angenommen, geprüft und abgelegt: $ZIEL (Rechte 600)
  Die Zwischenablage ist überschrieben — der Token liegt nicht mehr darin.
  Lesen UND Ändern sind geprüft, nicht angenommen.

  Weiter mit:  npm run provider-api

  ⚠️  Wenn alles steht, darfst du ihn widerrufen — die App braucht ihn NIE:
      https://supabase.com/dashboard/account/tokens → Revoke
ENDE
