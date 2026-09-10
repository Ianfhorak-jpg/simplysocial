#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  DAS WETTRENNEN — die eine Prüfung, die in EINER psql-Datei nicht geht
#
#  `anfrage_bestaetigen()` sperrt die Post-Zeile mit `select … for update`. Das ist
#  der einzige Teil der Funktion, der im Prototyp keine Entsprechung HAT: Dort
#  standen zwei Prüfungen „gegen den Doppelklick auf Web", und die waren richtig —
#  gegen zwei Klicks derselben Person. Zwei GLEICHZEITIGE Verbindungen sind etwas
#  anderes, und die gibt es erst mit einer echten Datenbank.
#
#  Ohne die Sperre lesen beide Sitzungen `spots_filled = 0`, beide finden einen
#  Platz frei, beide schreiben `spots_filled = 1` — und danach sind ZWEI Anfragen
#  bestätigt und EIN Platz vergeben. Niemand bekommt einen Fehler; einer der beiden
#  hat schlicht keinen Sitz und erfährt es beim Hingehen.
#
#  Aufruf:  bash supabase/pruefen/30_wettlauf.sh   (nach `aufbauen.sh`)
# ═══════════════════════════════════════════════════════════════════════════════
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
PORT=55432
PSQL="psql -h 127.0.0.1 -p $PORT -U postgres -q -d ss -v ON_ERROR_STOP=1"

IAN=11111111-1111-1111-1111-111111111111
LEA=22222222-2222-2222-2222-222222222222
MARA=33333333-3333-3333-3333-333333333333
POST=0a0000ff-0000-0000-0000-0000000000ff
RA=0b0000ff-0000-0000-0000-0000000000a1
RB=0b0000ff-0000-0000-0000-0000000000b2

echo
echo '════ Das Wettrennen — ein Platz, zwei gleichzeitige Bestätigungen ═══════'

# Ein Post mit GENAU EINEM Platz und zwei offenen Anfragen darauf. Als `postgres`
# angelegt: Das ist der Aufbau, nicht die Prüfung — geprüft wird gleich unten, und
# zwar als `authenticated` (harte Regel 57).
$PSQL >/dev/null <<SQL
delete from join_requests where post_id = '$POST';
delete from posts where id = '$POST';
insert into posts (id, author_id, category, title, district, starts_at, spots_total)
  values ('$POST','$IAN','sport','Ein Platz','1220', now() + interval '3 hours', 1);
insert into join_requests (id, post_id, from_user_id, message)
  values ('$RA','$POST','$LEA','Ich!'), ('$RB','$POST','$MARA','Ich auch!');
SQL

# Sitzung A hält die Sperre eine Sekunde, damit B garantiert hineinläuft.
# `\set ON_ERROR_STOP off`, weil eine der beiden scheitern SOLL.
lauf() {
  psql -h 127.0.0.1 -p $PORT -U postgres -q -d ss -tA <<SQL 2>&1
\set ON_ERROR_STOP off
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"$IAN"}';
  select 'ok' from public.anfrage_bestaetigen('$1');
  select pg_sleep($2);
commit;
SQL
}

lauf "$RA" 1 > /tmp/ss-wettlauf-a.txt &
sleep 0.3
lauf "$RB" 0 > /tmp/ss-wettlauf-b.txt &
wait

A_OK=$(grep -c '^ok$' /tmp/ss-wettlauf-a.txt)
B_OK=$(grep -c '^ok$' /tmp/ss-wettlauf-b.txt)
B_GRUND=$(grep -o 'kein Platz frei' /tmp/ss-wettlauf-b.txt | head -1)

GEFUELLT=$($PSQL -tA -c "select spots_filled from posts where id = '$POST';")
STATUS=$($PSQL -tA -c "select status from posts where id = '$POST';")
ACCEPTED=$($PSQL -tA -c "select count(*) from join_requests where post_id = '$POST' and status = 'accepted';")
PENDING=$($PSQL -tA -c "select count(*) from join_requests where post_id = '$POST' and status = 'pending';")
FAEDEN=$($PSQL -tA -c "select count(*) from chat_threads where post_id = '$POST';")

pruef() { if [ "$2" = "$3" ]; then echo "  ✓ $1"; else echo "  ✗ FEHLT — $1 (ist: $2, erwartet: $3)"; fi; }

pruef "die erste Bestätigung geht durch"                 "$A_OK"    "1"
pruef "die zweite wird abgewiesen"                       "$B_OK"    "0"
pruef "und zwar mit dem RICHTIGEN Grund: kein Platz frei" "$B_GRUND" "kein Platz frei"
pruef "der Post hat genau EINEN belegten Platz"           "$GEFUELLT" "1"
pruef 'der Post steht auf full'                           "$STATUS"  'full'
pruef "genau eine Anfrage ist bestätigt"                  "$ACCEPTED" "1"
pruef "die andere steht unverändert offen (Warteliste, still)" "$PENDING" "1"
pruef "es ist genau EIN Chat entstanden"                  "$FAEDEN"  "1"

$PSQL >/dev/null <<SQL
delete from join_requests where post_id = '$POST';
delete from chat_threads where post_id = '$POST';
delete from posts where id = '$POST';
SQL
