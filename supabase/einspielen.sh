#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  Die vier Migrationen in ein ECHTES Supabase-Projekt einspielen.
#
#  Aufruf:  npm run einspielen
#
#  ── Warum es dieses Skript gibt ──────────────────────────────────────────────
#  In `KONTEN_EINRICHTEN.md` stand bis heute: vier Dateien nacheinander in den
#  SQL-Editor kopieren und jeweils Run drücken. Das sind vier Gelegenheiten, eine
#  zu vergessen oder die Reihenfolge zu vertauschen — und beides fällt erst auf,
#  wenn die App später still nichts liest. Ian soll keine Handarbeit übernehmen,
#  wenn ein Skript sie machen kann.
#
#  ── Wo die Zugangsdaten liegen ───────────────────────────────────────────────
#  NICHT im Projekt. Der Verbindungs-String (er enthält das Datenbankpasswort)
#  liegt in ~/.simplysocial/db-url, Rechte 600 — dasselbe Muster wie
#  ~/.appstoreconnect/ für Apple, und aus demselben Grund (harte Regel 12: der
#  Prototyp ist öffentlich abrufbar).
#
#  ── Die drei Prüfungen VOR dem Einspielen ────────────────────────────────────
#  1. Ist das überhaupt ein echtes Supabase? Die Attrappe aus `pruefen/` bringt
#     `auth.uid()` genauso mit — wer die beiden verwechselt, spielt die Policies
#     gegen eine Datenbank ein, in der `auth.uid()` etwas anderes bedeutet, und
#     merkt es NIE. Gefragt wird deshalb nach Dingen, die NUR das echte Supabase
#     hat: dem Schema `storage` und der Rolle `service_role`.
#  2. Ist die Datenbank leer? Ein zweiter Lauf über ein bestehendes Schema
#     scheitert mitten drin — und lässt die Hälfte stehen.
#  3. Läuft alles in EINER Transaktion (`--single-transaction`). Harte Regel 6
#     eine Ebene tiefer: Ein Abbruch nach 0002 hinterliesse Tabellen ohne
#     Schreibwege — offen für alle, weil die Funktionen aus 0004 fehlen.
#
#  ── Und danach wird NACHGEMESSEN, nicht "fertig" gemeldet ────────────────────
#  Die Lehre vom 2026-09-11: Der Gerätebuild meldete `BUILD SUCCEEDED` und hatte
#  das falsche Profil eingebettet. `psql` gibt hier genauso 0 zurück, wenn alles
#  lief — die Frage ist aber nicht "lief es?", sondern "steht jetzt dasselbe da
#  wie lokal?". Die sieben Zahlen stammen aus der lokalen Datenbank, gegen die
#  121 Prüfungen grün sind.
# ═══════════════════════════════════════════════════════════════════════════════
set -e
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
HIER="$(cd "$(dirname "$0")" && pwd)"
URL_DATEI="$HOME/.simplysocial/db-url"

# Der lokale Stand ist die Messlatte. Ändert sich eine Migration, ändern sich
# diese Zahlen — dann gehören sie hier nachgezogen, nachdem `aufbauen.sh` wieder
# grün ist. Eine Zahl, die niemand nachzieht, wird zur nächsten Vorhersage 19.4.
ERWARTET_TABELLEN=13
ERWARTET_POLICIES=33
ERWARTET_RLS=13
ERWARTET_REGEL_FN=6
ERWARTET_PUBLIC_FN=9
ERWARTET_ENUMS=8
ERWARTET_TRIGGER=1

if [ ! -f "$URL_DATEI" ]; then
  cat <<HINWEIS
✗ Keine Verbindungsangabe in $URL_DATEI

So kommt sie dorthin (einmalig):
  1. Supabase → dein Projekt → Connect (oben) → Session pooler oder Direct connection
  2. Den String kopieren, [YOUR-PASSWORD] durch dein Datenbankpasswort ersetzen
  3. mkdir -p ~/.simplysocial && chmod 700 ~/.simplysocial
     printf '%s' 'postgresql://…' > ~/.simplysocial/db-url
     chmod 600 ~/.simplysocial/db-url

Die Datei liegt AUSSERHALB des Projekts — sie enthält dein Datenbankpasswort.
HINWEIS
  exit 1
fi

DB_URL="$(cat "$URL_DATEI")"
PSQL="psql \"$DB_URL\" -v ON_ERROR_STOP=1"

# Alles, was aus der Datenbank zurückkommt, wird gefiltert, bevor es auf den
# Schirm geht: Postgres spiegelt bei Verbindungsfehlern gern den ganzen String
# zurück, und darin steht das Passwort. Dieselbe Vorsicht wie bei der Issuer-ID
# in asc.py — und sie ist nachgemessen, nicht vermutet: Im Test stand das
# Passwort wirklich mitten in einer Fehlermeldung ("database ... does not exist").
#
# Der Filter ersetzt stumpf JEDES Vorkommen, auch mitten in einem Wort. Mit dem
# Testpasswort `x` wurde aus "does not exist" ein "does not e«PASSWORT»ist". Bei
# einem echten Supabase-Passwort kommt das nicht vor, und der Fehler geht in die
# harmlose Richtung: Er verstümmelt eine Meldung, statt ein Geheimnis
# durchzulassen. Wer das umdreht (z. B. auf Wortgrenzen prüft), tauscht einen
# Schönheitsfehler gegen ein Leck.
GEHEIM="$(printf '%s' "$DB_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')"
filtern() { if [ -n "$GEHEIM" ]; then sed "s|$GEHEIM|«PASSWORT»|g"; else cat; fi; }

frage() { psql "$DB_URL" -tA -c "$1" 2>&1 | filtern; }

echo "── 1. Ist das ein echtes Supabase? ──"
ECHT="$(frage "select count(*) from pg_namespace where nspname = 'storage';")"
ROLLE="$(frage "select count(*) from pg_roles where rolname = 'service_role';")"
if [ "$ECHT" != "1" ] || [ "$ROLLE" != "1" ]; then
  echo "✗ Das sieht nicht nach einem Supabase-Projekt aus."
  echo "  Schema 'storage': $ECHT (erwartet 1) · Rolle 'service_role': $ROLLE (erwartet 1)"
  echo "  Gegen die lokale Wegwerf-Datenbank gehört 'aufbauen.sh', nicht dieses Skript."
  exit 1
fi
echo "✓ Schema 'storage' und Rolle 'service_role' sind da — das ist Supabase."

AUTHFN="$(frage "select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='auth' and p.proname='uid';")"
[ "$AUTHFN" = "1" ] && echo "✓ auth.uid() bringt Supabase selbst mit — die Attrappe bleibt, wo sie ist." \
                    || { echo "✗ auth.uid() fehlt. Ohne sie wären alle 33 Policies still wirkungslos."; exit 1; }

echo
echo "── 2. Ist die Datenbank noch leer? ──"
SCHON="$(frage "select count(*) from pg_tables where schemaname='public' and tablename in ('profiles','posts','groups','chat_threads');")"
if [ "$SCHON" != "0" ]; then
  echo "✗ In 'public' stehen schon $SCHON unserer Tabellen."
  echo "  Dieses Skript spielt NUR in eine frische Datenbank ein — es überschreibt nichts."
  echo "  Wenn wirklich neu aufgebaut werden soll, ist das eine Entscheidung von Ian,"
  echo "  keine Nebenwirkung eines Skriptlaufs."
  exit 1
fi
echo "✓ 'public' ist frei."

echo
echo "── 3. Einspielen (alle vier in EINER Transaktion) ──"
psql "$DB_URL" -v ON_ERROR_STOP=1 --single-transaction -q \
  -f "$HIER/migrations/0001_schema.sql" \
  -f "$HIER/migrations/0002_policies.sql" \
  -f "$HIER/migrations/0003_konto_loeschen.sql" \
  -f "$HIER/migrations/0004_transaktionen.sql" 2>&1 | filtern
echo "✓ durchgelaufen — aber das ist noch kein Beleg."

echo
echo "── 4. Nachmessen: steht jetzt dasselbe da wie lokal? ──"
mess() { # name  sql  erwartet
  IST="$(frage "$2")"
  if [ "$IST" = "$3" ]; then
    printf '  ✓ %-22s %s\n' "$1" "$IST"
  else
    printf '  ✗ %-22s %s  (erwartet %s)\n' "$1" "$IST" "$3"
    FEHLER=1
  fi
}
FEHLER=0
mess "Tabellen"          "select count(*) from pg_tables where schemaname='public';" "$ERWARTET_TABELLEN"
mess "Policies"          "select count(*) from pg_policies where schemaname='public';" "$ERWARTET_POLICIES"
mess "RLS eingeschaltet" "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relrowsecurity;" "$ERWARTET_RLS"
mess "Funktionen regel." "select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='regel';" "$ERWARTET_REGEL_FN"
mess "Funktionen public." "select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public';" "$ERWARTET_PUBLIC_FN"
mess "Enums"             "select count(*) from pg_type t join pg_namespace n on n.oid=t.typnamespace where n.nspname='public' and t.typtype='e';" "$ERWARTET_ENUMS"
mess "Trigger"           "select count(*) from pg_trigger where not tgisinternal;" "$ERWARTET_TRIGGER"

echo
if [ "$FEHLER" = "1" ]; then
  echo "✗ Die Datenbank steht NICHT so da wie lokal. Nichts weiterbauen, bevor das stimmt."
  exit 1
fi
echo "✓ Alle sieben Zahlen stimmen. Die Datenbank ist eingerichtet."
echo "  Was jetzt fehlt, ist der Client (20.4-b) — und dafür brauche ich"
echo "  Project URL und anon key aus Settings → API."
