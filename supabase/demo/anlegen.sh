#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  DEN DEMO-ZUGANG ANLEGEN — Phase 21.5 Punkt 1.  Aufruf: npm run demo
#
#    npm run demo                     anlegen / auffrischen, Passwort UNBERÜHRT
#    npm run demo -- --neues-passwort ein neues Passwort erzeugen und anzeigen
#    npm run demo -- --abraeumen      die ganze Demo-Welt wieder löschen
#
#  ── Was es tut ──────────────────────────────────────────────────────────────
#  Es legt das eine Konto an, das der Apple-Reviewer benutzt, gibt ihm ein Profil
#  und stellt die Welt darum herum auf (`10_konto.sql`, `20_welt.sql`). Warum es
#  diesen Zugang gibt, steht in `src/features/auth/demo.ts`; was der Reviewer
#  damit sieht, in `20_welt.sql`.
#
#  ── Das Passwort ist die heikle Stelle, und zwar in ZWEI Richtungen ──────────
#
#   1. **Es darf nirgends abgelegt werden.** Keine Datei im Projekt, kein `.env`,
#      keine Zeile in einem Protokoll. Es wird erzeugt, einmal angezeigt und ist
#      danach nur noch als bcrypt-Hash in `auth.users` vorhanden. Die Hausregel
#      aus der Haupt-CLAUDE.md (*„API-Schlüssel niemals im Code"*) gilt hier
#      besonders scharf, weil der Prototyp öffentlich auf GitHub Pages liegt.
#
#   2. **Es darf sich nicht STILL ändern.** Sobald es in App Store Connect steht,
#      macht ein zweiter Lauf mit neuem Passwort den hinterlegten Zugang ungültig
#      — und das merkt niemand, bis der Reviewer es merkt. Deshalb frischt der
#      normale Lauf nur die WELT auf (vor allem die Zeiten, siehe `20_welt.sql`)
#      und lässt das Passwort in Ruhe. Ein neues gibt es nur auf ausdrückliche
#      Ansage.
#
#  ── Warum `openssl rand` und nicht etwas Merkbares ──────────────────────────
#  Weil es niemand merken muss: Es wird einmal in ein Formular kopiert. *„Länge
#  ist keine Geheimhaltung"* (FALLEN.md) — Zufall ist es, und 24 Zeichen aus
#  `base64` tragen rund 144 Bit. Ein merkbares Passwort wäre die einzige
#  Schwachstelle an einem Konto, das sonst keine hat.
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail
HIER="$(cd "$(dirname "$0")" && pwd)"

# Die Wegwerf-Datenbank aus `pruefen/aufbauen.sh` — nur für den Prüfstand, der
# dieses Skript gegen echtes Postgres hält. Ohne `DEMO_DB` geht es an den echten
# Server, und zwar über dieselbe Datei wie jedes andere Skript hier.
if [ -n "${DEMO_DB:-}" ]; then
  DB="$DEMO_DB"
else
  DB_DATEI="$HOME/.simplysocial/db-url"
  [ -f "$DB_DATEI" ] || {
    echo "✗ Keine Datenbank-Adresse. Erst 'npm run db-url' ausführen."
    exit 1
  }
  DB="$(cat "$DB_DATEI")"
fi
PSQL="psql $DB -X -q -v ON_ERROR_STOP=1"

case "${1:-}" in
  --abraeumen)
    echo "Räume die Demo-Welt ab …"
    $PSQL -f "$HIER/30_abraeumen.sql"
    echo "✓ Weg. Der Zugang in App Store Connect funktioniert ab jetzt NICHT mehr."
    exit 0
    ;;
  --neues-passwort) SETZEN=true ;;
  '')               SETZEN=false ;;
  *)
    echo "✗ Unbekannt: $1"
    echo "  Erlaubt: (nichts) · --neues-passwort · --abraeumen"
    exit 1
    ;;
esac

# ── Gibt es das Konto schon? ─────────────────────────────────────────────────
#
# Die Frage entscheidet nur, WAS am Ende dasteht — nicht, was passiert. Beim
# allerersten Lauf gibt es nichts zu erhalten, also muss ein Passwort gesetzt
# werden, auch ohne `--neues-passwort`. Wer das vergisst, legt ein Konto mit
# einem Hash an, den niemand kennt, und sucht den Fehler beim Anmelden.
VORHANDEN="$($PSQL -tA -c \
  "select count(*) from auth.users where id = 'dddddddd-dddd-dddd-dddd-dddddddddd01';")"
if [ "$VORHANDEN" = "0" ]; then SETZEN=true; fi

# 24 Zeichen. Erzeugt wird es IMMER — auch wenn es nicht gesetzt wird, weil
# `10_konto.sql` die Variable `:passwort` in jedem Fall braucht. Ein leerer Wert
# wäre ein gültiger bcrypt-Eingang und damit ein Konto mit leerem Passwort, falls
# die Bedingung darin je umgebaut wird.
PASSWORT="$(openssl rand -base64 18 | tr -d '\n' | tr '+/' 'Aa')"

echo "Lege den Demo-Zugang an …"
$PSQL -v passwort="$PASSWORT" -v setze_passwort="$SETZEN" -f "$HIER/10_konto.sql"
$PSQL -f "$HIER/20_welt.sql"

# ── Was wirklich dasteht, wird GEZÄHLT und nicht behauptet ──────────────────
#
# Ein `psql`, das durchläuft, sagt nur, dass kein Fehler kam. Ob der Reviewer
# etwas sieht, hängt an Zahlen — und zwar an genau diesen vier. Fehlt eine, ist
# der Durchgang unvollständig, und das soll HIER auffallen und nicht dort.
LAGE="$($PSQL -tA -c "
  select
    (select count(*) from profiles      where id::text like 'dddddddd-%') || ' Profile, ' ||
    (select count(*) from posts         where id::text like 'dddddddd-%') || ' Aktivitäten, ' ||
    (select count(*) from join_requests where id::text like 'dddddddd-%' and status = 'pending')
      || ' offene Anfrage, ' ||
    (select count(*) from messages      where id::text like 'dddddddd-%') || ' Nachrichten';")"

echo
echo "✓ Demo-Welt steht: $LAGE"
echo
echo "  E-Mail:    demo@simplysocial.invalid"
if [ "$SETZEN" = "true" ]; then
  echo "  Passwort:  $PASSWORT"
  echo
  echo "  ⚠️  Dieses Passwort steht nirgendwo sonst. Jetzt nach App Store Connect"
  echo "      → App-Prüfungsinformationen übertragen. Danach ist es weg."
else
  echo "  Passwort:  unverändert — das aus App Store Connect gilt weiter."
fi
echo
echo "  Vor JEDEM Einreichen einmal laufen lassen: Die Aktivitäten hängen an"
echo "  'now()', und ein Feed voller vergangener Termine ist ein Ablehnungsgrund."
