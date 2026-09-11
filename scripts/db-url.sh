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
ENTWURF="$HOME/.simplysocial/db-url.entwurf"
URL="$(pbpaste)"

[ -n "$URL" ] || { echo "✗ Die Zwischenablage ist leer. In Supabase auf 'Connect' → Session pooler → kopieren."; exit 1; }

# ── Zweiter Aufruf: in der Zwischenablage steht nur noch das PASSWORT ─────────
# Erkannt daran, dass es KEIN Verbindungs-String ist und ein Entwurf wartet. So
# muss niemand 96 Zeichen von Hand bearbeiten — und das Passwort geht weder durch
# den Chat noch durch eine Kommandozeile, die im Verlauf stehen bliebe.
case "$URL" in
  postgresql://*|postgres://*) ;;
  *)
    if [ -f "$ENTWURF" ]; then
      # Ein Passwort mit Leerzeichen oder Zeilenumbruch am Rand ist fast immer ein
      # Kopierfehler, kein Passwort. Weggeschnitten wird nur aussen.
      PW="$(printf '%s' "$URL" | tr -d '\r\n' | sed 's/^[[:space:]]*//; s/[[:space:]]*$//')"
      if [ -z "$PW" ]; then
        echo "✗ In der Zwischenablage steht nur Leerraum."; exit 1
      fi
      # Das Passwort steht in einer URL und muss deshalb kodiert werden: Supabase
      # erzeugt Passwörter mit Zeichen wie @ : / ? # — ein blankes @ macht aus dem
      # Rest des Passworts einen Hostnamen, und psql meldet dann "could not
      # translate host name". Das sieht aus wie ein Netzproblem und ist eines der
      # Kodierung.
      #
      # Das Passwort geht über die STANDARDEINGABE an python, nicht als Argument:
      # Argumente stehen in `ps` und wären damit für jeden Prozess auf dem Rechner
      # lesbar. Dieselbe Überlegung wie "nicht in den Chat".
      PW_ENC="$(printf '%s' "$PW" | python3 -c 'import sys,urllib.parse; sys.stdout.write(urllib.parse.quote(sys.stdin.read(), safe=""))')"
      # Nach der Kodierung besteht PW_ENC nur noch aus A-Za-z0-9 und _.-~% —
      # also aus nichts, was sed als Sonderzeichen liest. Erst deshalb darf hier
      # ein schlichtes sed stehen.
      URL="$(sed "s|\\[YOUR-PASSWORD\\]|$PW_ENC|I" "$ENTWURF")"
      case "$URL" in
        *"[YOUR-PASSWORD]"*|*"[your-password]"*)
          echo "✗ Das Einsetzen hat nicht gegriffen — der Platzhalter steht noch da."
          echo "  Das ist ein Fehler in mir, nicht in deiner Eingabe."
          exit 1 ;;
      esac
      echo "→ Passwort eingesetzt (${#PW} Zeichen), Entwurf verwendet."
    fi ;;
esac

case "$URL" in
  postgresql://*|postgres://*) ;;
  *) echo "✗ Das sieht nicht nach einem Verbindungs-String aus."
     echo "  Erwartet wird etwas, das mit postgresql:// anfängt."
     echo "  In der Zwischenablage stehen ${#URL} Zeichen."   # NICHT den Inhalt zeigen
     exit 1 ;;
esac

case "$URL" in
  *"[YOUR-PASSWORD]"*|*"[your-password]"*)
    # Statt Ian den 96 Zeichen langen String von Hand bearbeiten zu lassen, wird er
    # als ENTWURF abgelegt. Beim nächsten Aufruf steht dann nur noch das Passwort in
    # der Zwischenablage, und das Skript setzt es ein (siehe oben, Zweig ENTWURF).
    # Der Entwurf enthält KEIN Geheimnis — nur Host und Benutzername.
    mkdir -p "$HOME/.simplysocial"; chmod 700 "$HOME/.simplysocial"
    printf '%s' "$URL" > "$ENTWURF"; chmod 600 "$ENTWURF"
    echo "→ Der String steht, aber das Passwort fehlt noch ([YOUR-PASSWORD])."
    echo "  Ich habe ihn gemerkt. Jetzt reicht es, wenn du NUR dein"
    echo "  Datenbankpasswort kopierst und mich noch einmal aufrufst —"
    echo "  einsetzen mache ich."
    exit 2 ;;
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

# ── Und jetzt wird die Verbindung WIRKLICH aufgebaut ──────────────────────────
# Eine abgelegte Datei ist kein Beleg — dieselbe Lehre wie "BUILD SUCCEEDED mit
# dem falschen Profil" (2026-09-11). Ohne diesen Schritt fiele ein Tippfehler im
# Passwort erst in `einspielen.sh` auf, also nach dem Reden über Transaktionen.
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
echo "── Verbindung probieren ──"
# PGCONNECT_TIMEOUT ist Pflicht und keine Feinheit: Ohne ihn wartet psql bei einem
# nicht erreichbaren Server minutenlang, und das sieht aus wie ein hängendes Skript
# statt wie ein Verbindungsfehler. Gemessen an einem erfundenen Host — ohne die
# Zeitgrenze kam gar keine Antwort zurück.
# Das `|| true` ist der Grund, warum diese Diagnose überhaupt je zu sehen ist:
# Oben steht `set -e`, und psql gibt bei einem Verbindungsfehler 2 zurück. Ohne
# den Zusatz stirbt das Skript GENAU HIER — mit einer leeren Zeile unter
# "Verbindung probieren" und ohne ein Wort dazu, was schiefging. Beim ersten
# Bauen genau so passiert: drei Läufe, drei Mal nur exit=2 und kein Text.
ANTWORT="$(PGCONNECT_TIMEOUT=10 psql "$URL" -tA \
  -c "select 'verbunden mit ' || current_database() || ' als ' || current_user;" 2>&1 || true)"
if printf '%s' "$ANTWORT" | grep -q "^verbunden mit "; then
  echo "✓ $ANTWORT"
  rm -f "$ENTWURF"          # erst jetzt — vorher wäre ein zweiter Versuch verbaut
  echo
  echo "Weiter mit:  npm run einspielen"
else
  # Der String steht im Klartext in psql-Fehlern. Vor dem Anzeigen herausfiltern.
  GEHEIM="$(printf '%s' "$URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')"
  MELDUNG="$(printf '%s' "$ANTWORT" | sed "s|$GEHEIM|«PASSWORT»|g" | head -3)"
  echo "✗ Die Verbindung kam NICHT zustande:"
  printf '%s\n' "$MELDUNG" | sed 's/^/    /'
  echo
  case "$MELDUNG" in
    *"password authentication failed"*)
      echo "  → Das Passwort stimmt nicht. In Supabase: Settings → Database →"
      echo "    'Reset database password'. Danach neu kopieren und nochmal." ;;
    *"could not translate host name"*|*"could not connect"*|*"Network is unreachable"*)
      echo "  → Der Server ist nicht erreichbar. Häufigste Ursache: die Direct"
      echo "    connection statt des Session poolers (die braucht IPv6), oder das"
      echo "    Projekt ist noch am Aufwachen." ;;
    *"tenant"*|*"Tenant"*)
      # Der Wortlaut ist gemessen, nicht geraten: Supabase antwortet
      # "FATAL: (ENOTFOUND) tenant/user postgres.<ref> not found" — mit
      # KLEINEM t und Schrägstrich. Das erste Muster hier hiess
      # "Tenant or user not found" und traf deshalb nie zu.
      echo "  → Der Pooler kennt dieses Projekt nicht. Entweder ist der"
      echo "    Projekt-Verweis falsch abgeschrieben, oder der String kommt aus"
      echo "    einem anderen Projekt. Hol ihn unverändert aus dem Reiter"
      echo "    'Session pooler' — dort steht postgres.<ref>, nicht bloss"
      echo "    postgres." ;;
  esac
  echo
  echo "  Die Datei bleibt liegen; ein neuer Aufruf überschreibt sie."
  exit 1
fi
