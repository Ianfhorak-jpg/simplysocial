#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  Den Brevo-SMTP-Schlüssel in die Zwischenablage legen
#  Aufruf:  npm run brevo-key
#
#  ── Wofür das da ist ────────────────────────────────────────────────────────
#  Brevo zeigt einen frisch erzeugten SMTP-Schlüssel **genau einmal**. Wer ihn
#  aus der Zwischenablage verliert, bevor er in Supabase steht, muss einen neuen
#  erzeugen — am 2026-09-12 genau so passiert. Deshalb liegt er in
#  `~/.simplysocial/brevo-smtp-key` (Rechte 600), **außerhalb des Repos**:
#  dasselbe Muster wie der Verbindungs-String und wie `~/.appstoreconnect/`.
#
#  ── Warum er NICHT in `.env` liegt, obwohl der anon key dort liegt ──────────
#  Weil er ein echtes Geheimnis ist und der anon key keines. Der anon key landet
#  zwangsläufig im gebauten Bundle, und was er darf, entscheiden die 33 Policies.
#  Dieser hier darf in Ians Namen Mails verschicken — er gehört in keine Datei,
#  die je in ein Bundle oder in ein Repo geraten kann.
#
#  ── Und warum er GAR NICHT im Code gebraucht wird ───────────────────────────
#  Die App sieht ihn nie. Er steht ausschließlich in Supabases SMTP-Einstellungen;
#  GoTrue verschickt die Mails, nicht wir. Diese Datei ist reine Wiederbeschaffung
#  für den Fall, dass das Einfügen dort schiefgeht.
# ═══════════════════════════════════════════════════════════════════════════════
set -u
DATEI="$HOME/.simplysocial/brevo-smtp-key"

if [ ! -s "$DATEI" ]; then
  cat <<HINWEIS
✗ Kein gesicherter Schlüssel in $DATEI.

So kommst du an einen neuen:
  brevo.com → oben rechts dein Name → SMTP & API → Reiter SMTP
  → "Generate a new SMTP key"

Danach hierher zurück und den Schlüssel sichern:
  pbpaste > "$DATEI" && chmod 600 "$DATEI"
HINWEIS
  exit 1
fi

# Ohne abschließenden Zeilenumbruch. Ein unsichtbares \\n am Ende eines Passworts
# erscheint als "falsches Passwort" — dieselbe Familie wie die acht NULLs in
# `auth.users`: `null` und `''` sind nicht dasselbe, und `x` und `x\\n` auch nicht.
printf '%s' "$(cat "$DATEI")" | pbcopy

# **Gegengemessen, nicht gehofft.** `pbcopy` meldet keinen Fehler, wenn die
# Zwischenablage von einem anderen Programm gleich wieder überschrieben wird —
# verglichen werden Prüfsummen, damit der Schlüssel nirgends im Klartext steht.
A=$(printf '%s' "$(cat "$DATEI")" | shasum | cut -c1-12)
B=$(pbpaste | shasum | cut -c1-12)
if [ "$A" != "$B" ]; then
  echo "✗ In der Zwischenablage steht etwas anderes. Nicht einfügen."
  exit 1
fi

echo "✓ In der Zwischenablage: $(pbpaste | wc -c | tr -d ' ') Zeichen, beginnt mit $(pbpaste | cut -c1-9)…"
echo
echo "  Supabase → Authentication → Emails → Set up SMTP → Feld \"Password\" → ⌘V"
