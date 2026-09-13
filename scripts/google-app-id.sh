#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  Die Google-Client-ID für iOS in `.env` legen.  Aufruf:  npm run google-app-id
#  Phase 20.3-b2.
#
#  ── Warum eine Client-ID in die App darf und ein Secret nie ─────────────────
#  Sie landet zwangsläufig im gebauten Bundle — dieselbe Lage wie beim anon key,
#  und dieselbe Antwort: Das ist kein Leck, sondern das Modell. Eine Client-ID
#  sagt nur, WER fragt; sie erlaubt nichts. Was Google wirklich schützt, ist der
#  Client-SECRET, und der gehört zum WEB-Client, liegt in `~/.simplysocial/` und
#  ausschließlich bei Supabase. In eine App gehört er nie — dort wäre er nach dem
#  ersten Auspacken des Bundles keiner mehr.
#
#  ── Warum die iOS-ID und nicht die Web-ID ──────────────────────────────────
#  Weil der Ausweis von diesem GERÄT kommt: `expo-auth-session` fragt Google als
#  iOS-Client, und der Ausweis trägt dann die iOS-ID als Empfänger. Supabase
#  kennt beide (am 13.09. nachts eingetragen, nachgemessen) und lässt beide
#  durch — mit der Web-ID hier käme ein Ausweis heraus, den kein iPhone erzeugen
#  darf.
#
#  ── Und warum der Rückweg NICHT hier steht ─────────────────────────────────
#  `com.googleusercontent.apps.<id>:/oauthredirect` wird in
#  `src/lib/anmelde-anbieter.native.ts` aus der ID GERECHNET. Zwei Quellen für
#  dieselbe Angabe sind zwei Gelegenheiten, dass sie auseinanderlaufen —
#  dieselbe Überlegung wie PROJEKTION (harte Regel 53) und wie die Project URL,
#  die anon-key.sh aus dem Token ableitet statt sie abzutippen.
# ═══════════════════════════════════════════════════════════════════════════════
set -u
HIER="$(cd "$(dirname "$0")/.." && pwd)"
QUELLE="$HOME/.simplysocial/google-ios-client-id"
ENV="$HIER/.env"
NAME="EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID"

[ -f "$QUELLE" ] || {
  echo "✗ $QUELLE fehlt."
  echo "  Sie entsteht beim Anlegen des iOS-OAuth-Clients — siehe"
  echo "  _FUER_IAN/KONTEN_EINRICHTEN.md, Abschnitt Google."
  exit 2
}
[ -f "$ENV" ] || { echo "✗ Keine .env — erst 'npm run anon-key'."; exit 2; }

ID="$(tr -d '[:space:]' < "$QUELLE")"

# Der Wächter fragt nach der FORM, nicht nach der Länge. Eine Web-Client-ID sieht
# genauso aus wie eine iOS-Client-ID — beide enden auf `.apps.googleusercontent.com`
# —, deshalb kann diese Prüfung die zwei NICHT auseinanderhalten. Sie fängt das ab,
# was sie abfangen kann: eine leere Datei, ein mitkopiertes Secret, einen Pfad.
# Die Verwechslung Web/iOS fällt dagegen erst am Gerät auf, und genau darum steht
# sie im Kopf dieser Datei ausgeschrieben.
case "$ID" in
  *.apps.googleusercontent.com) : ;;
  *) echo "✗ Das sieht nicht nach einer Google-Client-ID aus (erwartet: …apps.googleusercontent.com)."; exit 1 ;;
esac

# Eine vorhandene Zeile wird ERSETZT und nicht angehängt: Zwei Zeilen mit
# demselben Namen sind ein Zustand, in dem Metro die letzte nimmt und ein Mensch
# die erste liest.
TMP="$(mktemp)"
grep -v "^$NAME=" "$ENV" > "$TMP" 2>/dev/null || true
{
  echo ""
  echo "# Phase 20.3-b2 — von scripts/google-app-id.sh. KEIN Geheimnis (siehe dort)."
  echo "$NAME=$ID"
} >> "$TMP"
mv "$TMP" "$ENV"
chmod 600 "$ENV"

echo "✓ .env ergänzt: $NAME"
echo "  …${ID#"${ID%??????????????????????????????}"}"
echo "  Rückweg daraus gerechnet: com.googleusercontent.apps.${ID%.apps.googleusercontent.com}:/oauthredirect"
