#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  Den Supabase-Zugang für die APP ablegen.  Aufruf:  npm run anon-key
#  (vorher in Supabase: Settings → API → "anon public" kopieren)
#
#  ── Warum das anders liegt als `db-url` ──────────────────────────────────────
#  Der Verbindungs-String ist ein Geheimnis und gehört nach ~/.simplysocial/.
#  Der anon key ist das GEGENTEIL: Er ist dafür gemacht, in der App zu stehen, und
#  landet zwangsläufig im gebauten Bundle — jeder, der die App hat, kann ihn lesen.
#  Das ist kein Versäumnis, sondern das Modell: Was er darf, entscheiden die 33
#  Policies, nicht seine Geheimhaltung.
#
#  Trotzdem steht er NICHT im Code (harte Regel aus dem Haupt-CLAUDE.md), sondern
#  in `.env` — git-ignoriert, mit `.env.example` als sichtbarer Vorlage. Grund:
#  Ein Wert im Quelltext wandert beim nächsten Projekt mit, und niemand merkt, dass
#  er getauscht werden müsste.
#
#  ── Der Wächter, auf den es hier ankommt ─────────────────────────────────────
#  Auf derselben Seite steht der `service_role` key. Der sieht dem anon key zum
#  Verwechseln ähnlich — gleiche Länge, gleicher Anfang `eyJ`, gleiche Stelle in
#  der Oberfläche. Er hebt aber JEDE Policy auf. Käme er in die App, wären die 121
#  Prüfungen mit einem Schlag wertlos, und zwar öffentlich abrufbar.
#  Die Rolle steht IM Token: Ein JWT trägt sie als `role` in seiner Nutzlast. Es
#  wird also nicht geraten und nicht auf den Namen vertraut, sondern nachgesehen.
# ═══════════════════════════════════════════════════════════════════════════════
set -e
HIER="$(cd "$(dirname "$0")/.." && pwd)"
KEY="$(pbpaste | tr -d '[:space:]')"

[ -n "$KEY" ] || { echo "✗ Die Zwischenablage ist leer. Supabase → Settings → API → 'anon public' kopieren."; exit 1; }

case "$KEY" in
  sb_secret_*)
    echo "✗ Das ist ein SECRET key — der darf nie in die App."
    echo "  Nimm auf derselben Seite den 'anon public' (bzw. 'publishable')."
    exit 1 ;;
  eyJ*) ;;
  sb_publishable_*) ;;
  *) echo "✗ Das sieht nicht nach einem Supabase-Schlüssel aus (${#KEY} Zeichen)."
     echo "  Erwartet wird etwas, das mit eyJ oder sb_publishable_ anfängt."
     exit 1 ;;
esac

# Bei einem JWT wird die Rolle AUS DEM TOKEN gelesen, nicht aus dem Namen des
# Feldes, aus dem er kopiert wurde. Der Schlüssel geht über stdin, damit er nicht
# als Argument in `ps` steht.
REF=""
case "$KEY" in eyJ*)
  ROLLE="$(printf '%s' "$KEY" | python3 -c "
import sys, base64, json
t = sys.stdin.read().strip().split('.')
d = json.loads(base64.urlsafe_b64decode(t[1] + '=' * (-len(t[1]) % 4)))
print(d.get('role',''), d.get('ref',''))")"
  set -- $ROLLE
  if [ "$1" != "anon" ]; then
    echo "✗ In diesem Token steht die Rolle '$1', nicht 'anon'."
    echo "  Ein service_role-Schlüssel hebt ALLE 33 Policies auf. Nicht in die App."
    exit 1
  fi
  REF="$2"
  echo "✓ Rolle im Token: anon  ·  Projekt: $REF"
;; esac

# Die Project URL wird ABGELEITET, nicht ein zweites Mal abgetippt — sie steckt als
# `ref` schon im Token. Zwei Quellen für dieselbe Angabe sind zwei Gelegenheiten,
# dass sie auseinanderlaufen (dieselbe Überlegung wie PROJEKTION in karte-geo.ts).
if [ -n "$REF" ]; then
  PROJEKT_URL="https://$REF.supabase.co"
else
  echo "✗ Aus diesem Schlüsseltyp lässt sich die Projekt-Adresse nicht ableiten."
  echo "  Bitte die Project URL aus Settings → API dazusagen."
  exit 1
fi

cat > "$HIER/.env" <<EOF
# Erzeugt von scripts/anon-key.sh — nicht von Hand ändern, nicht committen.
# Beide Werte sind dafür gemacht, in der App zu stehen; was sie DÜRFEN, sagen die
# Policies in supabase/migrations/0002_policies.sql.
EXPO_PUBLIC_SUPABASE_URL=$PROJEKT_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=$KEY
EOF
chmod 600 "$HIER/.env"

echo "✓ .env geschrieben (${#KEY} Zeichen Schlüssel)"
echo "  URL: $PROJEKT_URL"
echo
echo "── Erreicht die App den Server wirklich? ──"
ANTWORT="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 \
  -H "apikey: $KEY" "$PROJEKT_URL/rest/v1/posts?select=id&limit=1" || true)"
case "$ANTWORT" in
  200) echo "✓ HTTP 200 — PostgREST antwortet, und RLS lässt anon eine leere Liste sehen." ;;
  401|403) echo "✗ HTTP $ANTWORT — der Schlüssel wird abgelehnt." ; exit 1 ;;
  000) echo "✗ Keine Antwort — Netz oder Projekt schläft." ; exit 1 ;;
  *)   echo "? HTTP $ANTWORT — unerwartet, aber der Schlüssel steht." ;;
esac
