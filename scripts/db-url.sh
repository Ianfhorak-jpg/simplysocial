#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  Den Supabase-Verbindungs-String aus der ZWISCHENABLAGE ablegen.
#
#  Aufruf:  npm run db-url        (vorher in Supabase auf "Connect" → kopieren)
#
#  ── Warum über die Zwischenablage ────────────────────────────────────────────
#  Derselbe Weg wie die Issuer-ID am 2026-09-11: Was Ian mir in den Chat schreibt,
#  steht danach im Verlauf — und der String enthält das Datenbankpasswort. Über
#  `pbpaste` sieht ihn nur dieses Skript, und er landet sofort in einer Datei mit
#  Rechten 600 ausserhalb des Repos.
#
#  ── Was hier geprüft wird, und warum jede Prüfung einmal Zeit gekostet hätte ──
#  1. `[YOUR-PASSWORD]` noch drin → der häufigste Fehler überhaupt. Postgres sagt
#     dazu "password authentication failed", und das liest sich wie ein falsches
#     Passwort statt wie ein vergessener Platzhalter.
#  2. Transaction pooler (Port 6543) → kann keine Migrationen. Der Fehler käme
#     erst mitten im Einspielen, also nach der halben Arbeit.
#  3. Direct connection (`db.<ref>.supabase.co`) → nur über IPv6 erreichbar.
#     Ohne IPv6 meldet psql "could not connect to server", und auch das sieht aus
#     wie ein Tippfehler im Passwort.
#  Keine dieser drei Meldungen nennt ihre eigene Ursache — deshalb stehen sie hier.
# ═══════════════════════════════════════════════════════════════════════════════
set -e
ZIEL="$HOME/.simplysocial/db-url"
URL="$(pbpaste)"

[ -n "$URL" ] || { echo "✗ Die Zwischenablage ist leer. In Supabase auf 'Connect' → Session pooler → kopieren."; exit 1; }

case "$URL" in
  postgresql://*|postgres://*) ;;
  *) echo "✗ Das sieht nicht nach einem Verbindungs-String aus."
     echo "  Erwartet wird etwas, das mit postgresql:// anfängt."
     echo "  In der Zwischenablage stehen ${#URL} Zeichen."   # NICHT den Inhalt zeigen
     exit 1 ;;
esac

case "$URL" in
  *"[YOUR-PASSWORD]"*|*"[your-password]"*)
    echo "✗ Im String steht noch der Platzhalter [YOUR-PASSWORD]."
    echo "  Ersetze ihn durch dein Datenbankpasswort (eckige Klammern mit weg),"
    echo "  kopiere neu und ruf mich wieder auf."
    exit 1 ;;
esac

case "$URL" in
  *:6543/*)
    echo "✗ Das ist der Transaction pooler (Port 6543) — der kann keine Migrationen."
    echo "  Nimm im Connect-Fenster den Reiter 'Session pooler'."
    exit 1 ;;
esac

case "$URL" in
  *@db.*.supabase.co*)
    echo "⚠️  Das ist die Direct connection. Sie geht nur, wenn dein Anschluss IPv6"
    echo "    kann — sonst kommt 'could not connect', was wie ein falsches Passwort"
    echo "    aussieht. Der Session pooler geht immer."
    echo "    Ich lege sie trotzdem ab; wenn das Einspielen scheitert, hol den"
    echo "    anderen String." ;;
esac

mkdir -p "$HOME/.simplysocial"
chmod 700 "$HOME/.simplysocial"
printf '%s' "$URL" > "$ZIEL"
chmod 600 "$ZIEL"

# Nachmessen statt melden — und dabei nichts Geheimes zeigen.
HOST="$(printf '%s' "$URL" | sed -n 's|.*@\([^:/]*\).*|\1|p')"
echo "✓ Abgelegt in $ZIEL (Rechte $(stat -f '%Lp' "$ZIEL"), ${#URL} Zeichen)"
echo "  Server: $HOST"
echo "  Das Passwort steht in keiner Ausgabe und in keinem Chatverlauf."
echo
echo "Weiter mit:  npm run einspielen"
