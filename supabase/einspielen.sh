#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  Alle Migrationen in ein ECHTES Supabase-Projekt einspielen.
#  (Die Liste kommt aus dem ORDNER — seit 20.7, weil eine getippte Liste 0008
#   verschluckt hatte.)
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
#     scheitert mitten drin — und lässt die Hälfte stehen. Steht schon etwas da,
#     wird nur nachgemessen statt abgebrochen.
#  3. Läuft alles in EINER Transaktion (`--single-transaction`). Harte Regel 6
#     eine Ebene tiefer: Ein Abbruch nach 0002 hinterliesse Tabellen ohne
#     Schreibwege — offen für alle, weil die Funktionen aus 0004 fehlen.
#
#  ── Und danach wird NACHGEMESSEN, nicht "fertig" gemeldet ────────────────────
#  Die Lehre vom 2026-09-11: Der Gerätebuild meldete `BUILD SUCCEEDED` und hatte
#  das falsche Profil eingebettet. `psql` gibt hier genauso 0 zurück, wenn alles
#  lief — die Frage ist aber nicht "lief es?", sondern "steht jetzt dasselbe da
#  wie lokal?". Die Zahlen stammen aus der lokalen Datenbank, gegen die
#  `aufbauen.sh` grün ist (Stand 2026-09-13: 171 Häkchen).
# ═══════════════════════════════════════════════════════════════════════════════
set -e
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
HIER="$(cd "$(dirname "$0")" && pwd)"
URL_DATEI="$HOME/.simplysocial/db-url"

# ── Eine EINZELNE Migration nachziehen ───────────────────────────────────────
#     npm run einspielen -- 0005_realtime.sql
#
# Warum es das gibt: Der dritte Wächter unten bricht ab, wenn 'public' nicht mehr
# leer ist — richtig so, eine Produktionsdatenbank neu aufzubauen ist Ians
# Entscheidung und keine Nebenwirkung. Nur stand danach niemand mehr, der eine
# NEUE Migration einspielen konnte: Am 2026-09-12 meldete das Nachmessen
# „Realtime-Tabellen 0 (erwartet 11)" und nannte keinen Weg, das zu beheben.
# **Eine Prüfung, die einen Mangel findet und keinen Ausweg nennt, ist eine halbe
# Prüfung.** Die Vorprüfungen (ist das echtes Supabase?) und das Nachmessen laufen
# unverändert mit — nur das Einspielen betrifft dann eine Datei statt fünf.
NUR_DIESE="${1:-}"
if [ -n "$NUR_DIESE" ] && [ ! -f "$HIER/migrations/$NUR_DIESE" ]; then
  echo "✗ Migration nicht gefunden: migrations/$NUR_DIESE"
  echo "  Vorhanden:"
  ls -1 "$HIER/migrations/" | sed 's/^/    /'
  exit 1
fi

# Der lokale Stand ist die Messlatte. Ändert sich eine Migration, ändern sich
# diese Zahlen — dann gehören sie hier nachgezogen, nachdem `aufbauen.sh` wieder
# grün ist. Eine Zahl, die niemand nachzieht, wird zur nächsten Vorhersage 19.4.
ERWARTET_TABELLEN=13
ERWARTET_POLICIES=34
ERWARTET_RLS=13
ERWARTET_REGEL_FN=6
# 9 bis 0009, seit 0010 elf: `konto_weg` und `konto_entfernen` (Phase 20.7-b).
ERWARTET_PUBLIC_FN=11
ERWARTET_ENUMS=8
ERWARTET_TRIGGER=1
# Neu mit 0005 (Phase 20.4-b). Elf der dreizehn Tabellen — `blocks` und `reports`
# gehören ausdrücklich NICHT dazu, der Grund steht im Kopf der Migration.
# **Diese zwei Zahlen sind der Wächter gegen die Falle vom 2026-09-12:** Die
# Publication `supabase_realtime` ist in einem frischen Projekt LEER, und ein Abo
# darauf verbindet sich sauber und meldet nie etwas. Ohne Messung sähe das aus, als
# passierte in Wien nichts.
ERWARTET_REALTIME=11
ERWARTET_REALTIME_VERBOTEN=0
# Neu mit 0007 (Phase 20.5). **Der Wächter, der am nötigsten war:** Supabase gibt
# jeder neuen Tabelle in `public` per Voreinstellung ALLE Rechte an `anon` und
# `authenticated` — die Liste im Fuß von 0002 kam nur hinzu und nahm nichts weg.
# Lokal fiel das nie auf, weil die Wegwerf-Datenbank diese Voreinstellung nicht
# hatte (dieselbe Attrappen-Falle wie am 2026-09-06, und sie ist jetzt auch dort
# eingebaut). Gezählt werden die Einträge aus `information_schema`, nicht die
# Zeilen in der Datei — sonst prüfte sich die Datei selbst.
ERWARTET_ANON_RECHTE=0
ERWARTET_AUTH_RECHTE=34
# Neu mit 0010 (Phase 20.7-b). **Die Zahl, auf die es bei Entscheidung 58 und 72
# ankommt:** Wie viele der Moderations-Funktionen sind aus der APP erreichbar?
# Antwort: keine. Sie muss hier stehen und nicht nur im Wächter der Migration,
# weil ein `grant` von Hand am Server sie später aufheben könnte, ohne dass eine
# Migration läuft — und dann wäre `konto_entfernen` ein Knopf, mit dem jeder
# Angemeldete jedes Konto löscht.
#
# ⚠️ Gefragt wird `has_function_privilege` und NICHT das rohe `proacl`: Ein
# leeres ACL heißt „Standard", und der Standard ist in Postgres ausgerechnet
# `EXECUTE für PUBLIC` (gemessen am 2026-09-13 an beiden Datenbanken). Wer die
# Spalte liest, sieht nichts und schließt daraus das Gegenteil.
ERWARTET_MODERATION_OFFEN=0
# ── 🔴 Neu am 2026-09-14, und der Anlass war ein FALSCHES GRÜN ───────────────
# `0011_zustimmung.sql` ist die erste Migration, die nur SPALTEN hinzufügt
# (`alter table profiles add column …`). Ian liess `npm run einspielen` laufen, der
# dritte Wächter übersprang richtigerweise das Einspielen — und das Nachmessen
# meldete danach **alle zwölf Zahlen grün** und den Satz „Die Datenbank war schon
# richtig eingerichtet". Sie war es nicht: Die zwei Spalten fehlten, und **keine
# der zwölf Zahlen konnte das sehen**, weil keine Spalten zählt.
#
# Das ist die gefährlichste Bauart einer Prüfung: Sie war nicht rot, wo sie hätte
# rot sein müssen — sie war GRÜN und hat eine Auskunft gegeben, die sie nicht
# geben konnte. Ein Mensch liest „richtig eingerichtet" und hört auf zu suchen.
#
# Verwandt mit der Lehre aus 20.7 („keine der neun Zahlen hätte 0008 gefunden,
# weil keine den Bucket zählt"), nur eine Stufe feiner: Damals fehlte ein Objekt,
# hier fehlt ein Teil eines Objekts, das es schon gibt.
ERWARTET_SPALTEN=87
ERWARTET_CHECKS=15

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
                    || { echo "✗ auth.uid() fehlt. Ohne sie wären alle 34 Policies still wirkungslos."; exit 1; }

echo
echo "── 2. Ist die Datenbank noch leer? ──"
SCHON="$(frage "select count(*) from pg_tables where schemaname='public' and tablename in ('profiles','posts','groups','chat_threads');")"
if [ "$SCHON" != "0" ]; then
  # Nicht abbrechen, sondern NACHMESSEN. Der Unterschied ist die Auskunft: "steht
  # schon alles richtig da" und "da liegt etwas Halbes" sind zwei verschiedene
  # Lagen, und nur eine davon ist ein Problem. Beim ersten echten Lauf am
  # 2026-09-12 war die Datenbank nach einem falsch gemessenen Kreuz bereits
  # vollständig eingespielt — und ein blankes "✗ nicht leer" hätte das verschwiegen.
  echo "→ In 'public' stehen schon $SCHON unserer Tabellen — es wird NICHT noch"
  echo "  einmal eingespielt. Stattdessen nur nachgemessen:"
  echo
  NUR_MESSEN=1
else
  echo "✓ 'public' ist frei."
  NUR_MESSEN=0
fi

echo
if [ "$NUR_MESSEN" = "1" ] && [ -n "$NUR_DIESE" ]; then
  echo "── 3. Nur '$NUR_DIESE' einspielen (Nachziehen) ──"
  psql "$DB_URL" -v ON_ERROR_STOP=1 --single-transaction -q \
    -f "$HIER/migrations/$NUR_DIESE" 2>&1 | filtern
  echo "✓ durchgelaufen — aber das ist noch kein Beleg."
elif [ "$NUR_MESSEN" = "1" ]; then
  echo "── 3. Einspielen übersprungen (siehe oben) ──"
else
# ⚠️ Hier stand bis zum 2026-09-13 eine Liste von Hand, und sie hörte bei 0007 auf
# — **0008 (die Bilder) fehlte darin**, obwohl die Migration seit dem 12.09. im
# Ordner liegt und `aufbauen.sh` sie längst einspielt. Wer die Datenbank frisch
# aufgebaut hätte, bekäme keinen `avatars`-Bucket und keine der vier Policies
# darauf; das Nachmessen unten hätte es NICHT gefunden, weil keine seiner neun
# Zahlen den Bucket zählt. Dieselbe Sorte Drift wie harte Regel 83: eine Liste,
# die jemand nachziehen muss, wird irgendwann nicht nachgezogen.
#
# Jetzt kommt die Liste aus dem ORDNER. Die lexikalische Sortierung ist hier die
# richtige (`0001` … `0009` … `0010`), weil jede Migration vier Ziffern trägt —
# und genau das prüft der Wächter, bevor irgendetwas läuft.
MIGRATIONEN=()
while IFS= read -r DATEI; do
  BASIS="$(basename "$DATEI")"
  if ! [[ "$BASIS" =~ ^[0-9]{4}_ ]]; then
    echo "✗ Migration ohne vierstellige Nummer: $BASIS"
    echo "  Die Reihenfolge hängt an der Sortierung des Dateinamens — ohne feste"
    echo "  Stellenzahl liefe 0010 vor 0009, und ein Abbruch fiele erst am Ergebnis auf."
    exit 1
  fi
  MIGRATIONEN+=(-f "$DATEI")
done < <(ls -1 "$HIER"/migrations/*.sql | sort)

echo "── 3. Einspielen (alle $(( ${#MIGRATIONEN[@]} / 2 )) in EINER Transaktion) ──"
ls -1 "$HIER"/migrations/*.sql | sort | xargs -n1 basename | sed 's/^/     /'
psql "$DB_URL" -v ON_ERROR_STOP=1 --single-transaction -q "${MIGRATIONEN[@]}" 2>&1 | filtern
echo "✓ durchgelaufen — aber das ist noch kein Beleg."
fi

echo
echo "── 4. Nachmessen: steht jetzt dasselbe da wie lokal? ──"
mess() { # name  sql  erwartet
  GEMESSEN=$((GEMESSEN+1))
  IST="$(frage "$2")"
  if [ "$IST" = "$3" ]; then
    printf '  ✓ %-22s %s\n' "$1" "$IST"
  else
    printf '  ✗ %-22s %s  (erwartet %s)\n' "$1" "$IST" "$3"
    FEHLER=1
  fi
}
FEHLER=0
GEMESSEN=0
mess "Tabellen"          "select count(*) from pg_tables where schemaname='public';" "$ERWARTET_TABELLEN"
mess "Policies"          "select count(*) from pg_policies where schemaname='public';" "$ERWARTET_POLICIES"
mess "RLS eingeschaltet" "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relrowsecurity;" "$ERWARTET_RLS"
mess "Funktionen regel." "select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='regel';" "$ERWARTET_REGEL_FN"
mess "Funktionen public." "select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public';" "$ERWARTET_PUBLIC_FN"
mess "Enums"             "select count(*) from pg_type t join pg_namespace n on n.oid=t.typnamespace where n.nspname='public' and t.typtype='e';" "$ERWARTET_ENUMS"
# ⚠️ Der `nspname='public'`-Filter ist hier KEINE Schönheit, und er hat beim ersten
# echten Lauf am 2026-09-12 zugeschlagen: Ohne ihn zählt die Abfrage auch Supabases
# eigene Trigger in `storage` und `realtime` mit — gemessen SECHS statt einem.
# Lokal fällt das nie auf, weil die Wegwerf-Datenbank diese Schemas gar nicht hat.
# Dieselbe Familie wie die Attrappen-Falle vom 2026-09-06: Eine Nachbildung, die
# WENIGER mitbringt als das Original, lässt eine Messung durchgehen, die am
# Original falsch ist. Die anderen sechs Zahlen waren von Anfang an eingeschränkt.
mess "Trigger (public)"   "select count(*) from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where not t.tgisinternal and n.nspname='public';" "$ERWARTET_TRIGGER"
mess "Realtime-Tabellen"  "select count(*) from pg_publication_tables where pubname='supabase_realtime' and schemaname='public';" "$ERWARTET_REALTIME"
# Die zweite Realtime-Zahl misst etwas ANDERES als die erste, und deshalb steht sie
# daneben statt in ihr: Wer `blocks` gegen `follows` tauscht, bleibt bei elf. Beim
# Bauen von 0005 hing die Gegenprobe zuerst am Zähler, und die Regel-10-Prüfung
# dahinter kam nie dran — ein Wächter hinter einem anderen ist ein ungeprüfter.
mess "Rechte für anon"    "select count(*) from information_schema.role_table_grants where table_schema='public' and grantee='anon';" "$ERWARTET_ANON_RECHTE"
mess "Rechte für auth."   "select count(*) from information_schema.role_table_grants where table_schema='public' and grantee='authenticated';" "$ERWARTET_AUTH_RECHTE"
mess "Realtime verboten"  "select count(*) from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename in ('blocks','reports');" "$ERWARTET_REALTIME_VERBOTEN"
mess "Moderation dicht"   "select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('konto_weg','konto_entfernen') and (has_function_privilege('anon',p.oid,'EXECUTE') or has_function_privilege('authenticated',p.oid,'EXECUTE'));" "$ERWARTET_MODERATION_OFFEN"
# ── Die Spalten beim NAMEN, nicht nur ihre Zahl ─────────────────────────────
# `Spalten 87` ist eine ZAHL. Zwei ganz andere Spalten ergaeben dieselbe 87 — die
# Zahl faende einen VERLUST, aber nicht eine Verwechslung. Das ist die Umkehrung
# der Falle „Eine Pruefung, die NAMEN aufzaehlt, merkt nicht, wenn etwas
# dazukommt": Eine Pruefung, die nur ZAEHLT, weiss nicht, was sie gezaehlt hat.
#
# Die Liste kommt aus den MIGRATIONEN, nicht von Hand — sonst waere sie beim
# naechsten `add column` still unvollstaendig (dieselbe Lehre wie die Liste der
# Migrationen selbst, Phase 20.7).
SPALTEN_SOLL="$(grep -ho 'add column \(if not exists \)\?[a-z_]*' "$HIER"/migrations/*.sql \
                | awk '{print $NF}' | sort -u)"
if [ -n "$SPALTEN_SOLL" ]; then
  for SP in $SPALTEN_SOLL; do
    DA="$(frage "select count(*) from information_schema.columns where table_schema='public' and column_name='$SP';")"
    GEMESSEN=$((GEMESSEN+1))
    if [ "$DA" != "0" ]; then
      printf '  ✓ %-22s %s\n' "Spalte $SP" "da"
    else
      printf '  ✗ %-22s %s\n' "Spalte $SP" "FEHLT — eine add-column-Migration ist nicht drin"
      FEHLER=1
    fi
  done
fi

# Die zwei, die eine reine `add column`-Migration ueberhaupt sichtbar machen.
mess "Spalten (public)"   "select count(*) from information_schema.columns where table_schema='public';" "$ERWARTET_SPALTEN"
mess "CHECK-Constraints"  "select count(*) from pg_constraint c join pg_class t on t.oid=c.conrelid join pg_namespace n on n.oid=t.relnamespace where n.nspname='public' and c.contype='c';" "$ERWARTET_CHECKS"

echo
if [ "$FEHLER" = "1" ]; then
  echo "✗ Die Datenbank steht NICHT so da wie lokal. Nichts weiterbauen, bevor das stimmt."
  if [ "$NUR_MESSEN" = "1" ] && [ -z "$NUR_DIESE" ]; then
    echo
    echo "  Fehlt eine NEUE Migration, zieh sie einzeln nach — zum Beispiel:"
    echo "      npm run einspielen -- $(ls -1 "$HIER/migrations/" | tail -1)"
    echo "  (Die Vorprüfungen und das Nachmessen laufen dabei genauso mit.)"
  fi
  exit 1
fi
# ⚠️ **Der Satz sagt, WAS gemessen wurde — nicht „alles in Ordnung".**
# Bis zum 2026-09-14 stand hier „Die Datenbank war schon richtig eingerichtet", und
# genau das hat der Wächter behauptet, während zwei Spalten fehlten. Eine Prüfung
# darf nur die Frage beantworten, die sie wirklich gestellt hat.
# ⚠️ **DREI Faelle, nicht zwei.** Hier stand am 2026-09-14 kurzzeitig „es wurde
# NICHTS eingespielt" auch dann, wenn mit `-- 0011_…sql` sehr wohl eingespielt
# worden war — derselbe Fehler, den diese Meldung eine Stunde vorher beheben
# sollte, nur andersherum. Eine Meldung, die den eigenen Ablauf nicht kennt, ist
# keine Auskunft.
if [ "$NUR_MESSEN" = "1" ] && [ -n "$NUR_DIESE" ]; then
  echo "✓ Alle $GEMESSEN Zahlen stimmen — '$NUR_DIESE' ist eingespielt und nachgemessen."
elif [ "$NUR_MESSEN" = "1" ]; then
  echo "✓ Alle $GEMESSEN Zahlen stimmen — es wurde NICHTS eingespielt, nur nachgemessen."
  echo
  echo "  Ist eine NEUE Migration dazugekommen, ist sie damit NICHT drin."
  echo "  Die Zahlen oben sehen nur, was sie zaehlen. Nachziehen mit:"
  echo "      npm run einspielen -- $(ls -1 "$HIER/migrations/" | tail -1)"
else
  echo "✓ Alle $GEMESSEN Zahlen stimmen. Die Datenbank ist eingerichtet."
fi
