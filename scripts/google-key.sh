#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  Die Google-Zugänge sichern und zurückholen
#  Aufruf:  npm run google-key sichern     ← nimmt, was in der Zwischenablage steht
#           npm run google-key             ← zeigt den Stand, legt das Secret zurück
#
#  ── Wofür das da ist ────────────────────────────────────────────────────────
#  Google zeigt ein frisch erzeugtes **Client-Geheimnis seit Juni 2025 genau
#  einmal**; danach stehen nur noch die letzten vier Zeichen da. Das ist dieselbe
#  Falle wie beim Brevo-SMTP-Schlüssel und beim Apple-`.p8` — dreimal dasselbe
#  Muster an einem Tag, und zweimal davon hat es schon Zeit gekostet.
#
#  ── Warum das Skript den Typ SELBST erkennt ─────────────────────────────────
#  Weil die Verwechslung der eigentliche Fehler ist, nicht der Verlust. Bei Brevo
#  liegen SMTP-Schlüssel (`xsmtpsib-`) und API-Schlüssel (`xkeysib-`) auf derselben
#  Seite, sehen gleich aus, und nur einer davon ist der richtige. Hier ist es
#  genauso: Client ID und Client Secret stehen nebeneinander. Also wird nicht
#  gefragt, sondern am PRÄFIX entschieden — eine Angabe, die man nicht falsch
#  machen kann, ist besser als eine Warnung, die man überliest.
#
#  ── Was wohin gehört, und warum das nicht dasselbe ist ──────────────────────
#  Client IDs sind **keine Geheimnisse** — sie landen zwangsläufig in der gebauten
#  App, genau wie der anon key (harte Regel: was er darf, entscheiden die Policies,
#  nicht seine Geheimhaltung). Sie dürfen deshalb nach `.env`.
#  Das Client SECRET ist eines. Es steht ausschließlich in Supabases
#  Provider-Einstellungen, die App sieht es nie — also `~/.simplysocial/`,
#  außerhalb des Repos, wie der Verbindungs-String und der Brevo-Schlüssel.
# ═══════════════════════════════════════════════════════════════════════════════
set -u

ORDNER="$HOME/.simplysocial"
SECRET="$ORDNER/google-client-secret"
WEB_ID="$ORDNER/google-web-client-id"
IOS_ID="$ORDNER/google-ios-client-id"

mkdir -p "$ORDNER"
chmod 700 "$ORDNER" 2>/dev/null

# ── Zurückholen und Stand zeigen ────────────────────────────────────────────
if [ "${1:-}" != "sichern" ]; then
  echo "Stand der Google-Zugänge:"
  for paar in "$SECRET:Client Secret (geheim)" "$WEB_ID:Web Client ID" "$IOS_ID:iOS Client ID"; do
    datei="${paar%%:*}"; name="${paar#*:}"
    if [ -s "$datei" ]; then
      # Bei der ID sind die letzten Zeichen unverfänglich; beim Secret NICHT die
      # ersten — `GOCSPX-` steht bei jedem gleich und sagt nichts über den Wert.
      echo "  ✓ $name"
    else
      echo "  ✗ $name — fehlt"
    fi
  done

  if [ -s "$SECRET" ]; then
    printf '%s' "$(cat "$SECRET")" | pbcopy
    # Gegengemessen statt gehofft: `pbcopy` meldet nicht, wenn ein anderes
    # Programm die Zwischenablage gleich wieder überschreibt. Verglichen werden
    # Prüfsummen, damit das Geheimnis nirgends im Klartext auftaucht.
    A=$(printf '%s' "$(cat "$SECRET")" | shasum | cut -c1-12)
    B=$(pbpaste | shasum | cut -c1-12)
    if [ "$A" != "$B" ]; then
      echo; echo "✗ In der Zwischenablage steht etwas anderes. Nicht einfügen."
      exit 1
    fi
    echo
    echo "✓ Das Client Secret liegt in der Zwischenablage ($(pbpaste | wc -c | tr -d ' ') Zeichen)."
    echo "  Supabase → Authentication → Sign In / Providers → Google → \"Client Secret\" → ⌘V"
  else
    echo
    echo "So sicherst du einen Wert: bei Google kopieren, dann"
    echo "  npm run google-key sichern"
  fi
  exit 0
fi

# ── Sichern: am Präfix entscheiden, was es ist ──────────────────────────────
WERT=$(pbpaste)
# Unsichtbare Zeilenumbrüche am Ende sind der Klassiker — ein `x\n` ist bei einem
# Passwortfeld etwas anderes als `x`, und die Meldung sagt nie, warum.
WERT=$(printf '%s' "$WERT" | tr -d '\r\n')

if [ -z "$WERT" ]; then
  echo "✗ Die Zwischenablage ist leer. Erst bei Google auf \"Kopieren\" klicken."
  exit 1
fi

case "$WERT" in
  GOCSPX-*)
    printf '%s' "$WERT" > "$SECRET"; chmod 600 "$SECRET"
    echo "✓ Client SECRET gesichert → $SECRET (Rechte 600, außerhalb des Repos)"
    echo "  Das braucht nur Supabase. Die App sieht es nie."
    ;;
  *.apps.googleusercontent.com)
    # Web- und iOS-Client-ID sehen fast gleich aus. Google hängt bei iOS-Clients
    # KEIN Suffix an, das sie unterscheidbar macht — also wird gefragt, aber mit
    # einer Vorauswahl aus dem, was noch fehlt.
    if [ ! -s "$WEB_ID" ]; then
      ZIEL="$WEB_ID"; NAME="Web Client ID"
    elif [ ! -s "$IOS_ID" ]; then
      ZIEL="$IOS_ID"; NAME="iOS Client ID"
    else
      echo "✗ Beide Client IDs sind schon gesichert."
      echo "  Zum Überschreiben die Datei löschen: $WEB_ID  oder  $IOS_ID"
      exit 1
    fi
    printf '%s' "$WERT" > "$ZIEL"; chmod 600 "$ZIEL"
    echo "✓ $NAME gesichert → $ZIEL"
    [ "$ZIEL" = "$WEB_ID" ] && echo "  Als Nächstes die iOS-Client-ID kopieren und den Befehl nochmal."
    ;;
  *)
    echo "✗ Das sieht nach keinem Google-Zugang aus."
    echo "  Erwartet wird eines von beiden:"
    echo "    GOCSPX-…                        das Client Secret"
    echo "    …-….apps.googleusercontent.com  eine Client ID"
    echo "  In der Zwischenablage steht: $(printf '%s' "$WERT" | cut -c1-12)… ($(printf '%s' "$WERT" | wc -c | tr -d ' ') Zeichen)"
    exit 1
    ;;
esac
