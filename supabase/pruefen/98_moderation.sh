#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  DAS WERKZEUG, DAS LÖSCHT — Phase 20.7-b, Ians Entscheidung 72.
#
#  10_angriff.sql prüft die SQL-Seite: dass `konto_entfernen` aus der App nicht
#  erreichbar ist und als `postgres` wirkt. Was dort NICHT geprüft werden kann,
#  ist das Werkzeug davor — und darin sitzt die Zeile, auf die es ankommt:
#
#      if [ "${3:-}" != "--wirklich" ]; then … exit 0
#
#  **Das `--wirklich`-Gate ist das Einzige zwischen einem Tippfehler und einem
#  gelöschten Konto.** Gegen den echten Server ist es nicht prüfbar: Der Beleg
#  wäre ein wirklich gelöschtes Konto. Also gegen die Wegwerf-Datenbank, über
#  `SS_DB_URL`.
#
#  ⚠️ Gemessen wird nicht, dass das Werkzeug „durchläuft", sondern was danach in
#  der Datenbank steht — die Lehre vom 2026-09-11 („BUILD SUCCEEDED beantwortet
#  nicht die Frage, wegen der man gebaut hat") und vom 20.7 („psql hängt an ein
#  DELETE immer seinen Befehlszähler an, auch wenn nichts geschah").
#
#  Aufruf:  bash supabase/pruefen/98_moderation.sh   (nach `aufbauen.sh`)
# ═══════════════════════════════════════════════════════════════════════════════
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
HIER="$(cd "$(dirname "$0")" && pwd)"
WURZEL="$(cd "$HIER/../.." && pwd)"
PORT=55432
export SS_DB_URL="postgresql://postgres@127.0.0.1:$PORT/ss"
PSQL="psql -h 127.0.0.1 -p $PORT -U postgres -tA -d ss -v ON_ERROR_STOP=1"
WERKZEUG="$WURZEL/scripts/meldungen.sh"

JA=0; NEIN=0
pruef() { # text  ist  soll
  if [ "$2" = "$3" ]; then echo "  ✓ $1"; JA=$((JA+1));
  else echo "  ✗ $1  (ist: '$2', soll: '$3')"; NEIN=$((NEIN+1)); fi
}
# „kommt vor" statt „kommt genau einmal vor": Der @-Name steht in der Ausgabe
# zweimal (Vorschau und der Hinweis darunter), und die ZAHL ist nicht die
# Aussage. Ein Test, der an ihr hängt, wird beim nächsten Satz rot, ohne dass
# etwas kaputt ist.
steht() { # text  ausgabe  muster
  if printf '%s' "$2" | grep -q "$3"; then echo "  ✓ $1"; JA=$((JA+1));
  else echo "  ✗ $1  (»$3« steht nicht in der Ausgabe)"; NEIN=$((NEIN+1)); fi
}

IAN=11111111-1111-1111-1111-111111111111
LEA=22222222-2222-2222-2222-222222222222
NORA=55555555-5555-5555-5555-555555555555
POST=0a00aa00-0000-0000-0000-0000000000aa
FADEN=0c00aa00-0000-0000-0000-0000000000aa
ERBGRUPPE=0e00aa00-0000-0000-0000-0000000000aa

echo
echo '════ Das Werkzeug, das löscht (20.7-b) ═════════════════════════════════'

# ── Aufbau ──────────────────────────────────────────────────────────────────
# Ein Post mit einer Anfrage UND einem Chat daran. Der Chat ist der Punkt: Er
# muss die Löschung ÜBERLEBEN (Entscheidung 42), und das ist die einzige Folge,
# die man nicht errät.
# ⚠️ KEIN `>/dev/null` hier, und das ist der zweite Anlauf.
#
# Die erste Fassung schickte den Aufbau dorthin — und als das `insert` an einem
# falschen Spaltennamen scheiterte (`beschreibung` statt `description`; das
# Schema ist GEMISCHT: `offen` und `aufgeloest_am` deutsch, `description`,
# `category`, `district` englisch), sah der Lauf aus, als wäre die ERBFOLGE
# kaputt. Vier Kreuze, und keines davon am geprüften Code.
#
# Das ist die 20.4-b-Lehre wörtlich: *eine unterdrückte Fehlermeldung
# verschluckte genau die Ursache.* Ein Messaufbau versagt in die Richtung, die
# aussieht, als wäre das Geprüfte kaputt.
#
# ⚠️ Und das Heredoc ist QUOTIERT (`<<'SQL'`), die Werte kommen über psql-`-v`
# herein — das ist der dritte Anlauf, gemessen am 2026-09-14.
#
# Vorher stand hier `<<SQL` mit `'$POST'` im SQL. Damit las die SHELL den ganzen
# Rumpf, und in den Kommentaren darunter stehen Backticks: `05_daten.sql`,
# `konto_loeschen()`, `delete`. Die hat sie als BEFEHLE ausgeführt — 6 Zeilen
# `command not found` je Lauf. Der Prüfstand blieb grün, weil nur Kommentare
# zerschossen wurden; er war einen Tippfehler davon entfernt, eine `insert`-Zeile
# zu treffen. Wörtlich die Falle *„Eine Prüfung mit Backticks in doppelten
# Anführungszeichen misst NICHTS und meldet grün"*, nur eine Etage tiefer.
#
# ⚠️ NUR zu quotieren wäre falsch gewesen und ist NACHGEMESSEN falsch: Dann steht
# wörtlich `values ('$POST', …)` im SQL — keine UUID, der Aufbau scheitert. Die
# Werte müssen also von jemand anderem eingesetzt werden, und das ist psql selbst.
# Damit ist die Shell aus dem SQL heraus, dauerhaft: Backticks, `$`, `"` im Rumpf
# sind ab jetzt harmlos, statt es nur zufällig zu sein.
if ! $PSQL -v post="$POST" -v faden="$FADEN" -v erbgruppe="$ERBGRUPPE" \
          -v ian="$IAN"  -v lea="$LEA"     -v nora="$NORA" <<'SQL'
delete from chat_threads where id = :'faden';
delete from posts where id = :'post';
insert into posts (id, author_id, category, title, district, starts_at, spots_total)
  values (:'post',:'lea','sport','Gemeldeter Post','1070', now() + interval '3 hours', 3);
insert into join_requests (post_id, from_user_id, message)
  values (:'post',:'ian','bin dabei');
insert into chat_threads (id, post_id, aus_aktivitaet)
  values (:'faden',:'post', true);
insert into chat_participants (thread_id, user_id) values (:'faden',:'ian'), (:'faden',:'lea');

-- ⚠️ Eine Gruppe, in der eine ERBFOLGE stattfinden kann — und die muss dieser
-- Prüfstand selbst anlegen. Gemessen am 2026-09-13: In `05_daten.sql` gibt es
-- KEINE. „Marswiese Tennis" ist schon aufgelöst, in „Nora allein" ist Nora
-- allein. Damit war der Erbfolge-Pfad in `konto_loeschen()` nie gelaufen —
-- ausgerechnet der Teil, der die Funktion überhaupt rechtfertigt (ein blankes
-- `delete` kann eine Gruppe nicht WEITERGEBEN).
--
-- Die 18d-Lehre: *Eine Regel, die nichts vorfindet, sieht aus wie eine Regel,
-- die tut.* `20_transaktionen.sql` prüft die Erbfolge über `gruppe_verlassen`,
-- und der Test an `konto_loeschen` deckt allein den AUFLÖSUNGS-Fall ab.
--
-- `joined_at` ausdrücklich gesetzt und nicht dem Standardwert überlassen: „Wer
-- am längsten dabei ist" hängt an dieser Spalte (harte Regel 33), und zwei
-- Zeilen in derselben Transaktion bekommen dieselbe `now()`.
delete from groups where id = :'erbgruppe';
insert into groups (id, creator_id, name, description, category, offen, district)
  values (:'erbgruppe',:'ian','Erbgruppe','','sport', true, '1070');
insert into group_members (group_id, user_id, joined_at) values
  (:'erbgruppe',:'ian',  now() - interval '10 days'),
  (:'erbgruppe',:'lea',  now() - interval '5 days'),
  (:'erbgruppe',:'nora', now() - interval '1 day');
SQL
then
  echo "  ✗ Der AUFBAU ist gescheitert — was danach käme, sagt nichts über den Code."
  exit 1
fi

echo
echo '── Ohne `--wirklich` passiert NICHTS ───────────────────────────────────'

AUS="$(bash "$WERKZEUG" post-loeschen "$POST" 2>&1)"
pruef "die Vorschau nennt den Titel"          "$(printf '%s' "$AUS" | grep -c 'Gemeldeter Post')" "1"
pruef "… und den Autor mit @"                 "$(printf '%s' "$AUS" | grep -c '@lea')"            "1"
pruef "… und sagt, dass der Chat BLEIBT"      "$(printf '%s' "$AUS" | grep -c 'Chats, die BLEIBEN')" "1"
pruef "… und sagt ausdrücklich, dass nichts geschah" \
      "$(printf '%s' "$AUS" | grep -c 'NICHTS passiert')" "1"
pruef "und der Post steht wirklich noch da"   "$($PSQL -c "select count(*) from posts where id='$POST';")" "1"

echo
echo '── Mit `--wirklich` ────────────────────────────────────────────────────'

AUS="$(bash "$WERKZEUG" post-loeschen "$POST" --wirklich 2>&1)"
pruef "meldet Entfernt"                       "$(printf '%s' "$AUS" | grep -c '✓ Entfernt')" "1"
pruef "der Post ist weg"                      "$($PSQL -c "select count(*) from posts where id='$POST';")" "0"
pruef "die Anfrage ging mit (CASCADE)"        "$($PSQL -c "select count(*) from join_requests where post_id='$POST';")" "0"
pruef "der CHAT steht noch (Entscheidung 42)" "$($PSQL -c "select count(*) from chat_threads where id='$FADEN';")" "1"
pruef "… und weiß, dass er aus einer Aktivität kam (harte Regel 56)" \
      "$($PSQL -c "select aus_aktivitaet from chat_threads where id='$FADEN';")" "t"
pruef "… und sein post_id ist null, nicht verwaist-kaputt" \
      "$($PSQL -c "select post_id is null from chat_threads where id='$FADEN';")" "t"

# Die Gegenprobe zum Gate: ein zweiter Lauf darf nicht „erledigt" melden.
AUS="$(bash "$WERKZEUG" post-loeschen "$POST" --wirklich 2>&1)"; RC=$?
pruef "ein zweiter Lauf meldet NICHT Erfolg"  "$(printf '%s' "$AUS" | grep -c '✓ Entfernt')" "0"
pruef "… sondern bricht ab"                   "$RC" "1"

echo
echo '── Jemanden ausschließen: die Vorschau sagt vorher, was Entscheidung 13 tut ─'

# Nora (55555555) ist allein in ihrer Gruppe — die muss AUFHÖREN.
# Ian (11111111) hat eine Gruppe mit Lea darin — die muss VERERBT werden.
AUS="$(bash "$WERKZEUG" konto-loeschen @nora 2>&1)"
steht "der @-Name findet das Konto"          "$AUS" '@nora'
pruef "die Vorschau sagt „hört auf\""          "$(printf '%s' "$AUS" | grep -c 'hört auf')" "1"
pruef "… und nennt Entscheidung 41 als Grund" "$(printf '%s' "$AUS" | grep -c 'Entscheidung 41')" "1"
pruef "… und warnt vor dem bekannten Haken"   "$(printf '%s' "$AUS" | grep -c 'andere. Mailadresse\|anderen Mailadresse')" "1"
pruef "und Nora ist noch da"                  "$($PSQL -c "select count(*) from auth.users where id='55555555-5555-5555-5555-555555555555';")" "1"

AUS="$(bash "$WERKZEUG" konto-loeschen "$IAN" 2>&1)"
steht "auch eine rohe UUID findet das Konto" "$AUS" '@ian'
steht "die Vorschau sagt, WER erbt"          "$AUS" 'erbt sie'
# Und WEN sie nennt, ist die eigentliche Aussage: Lea ist seit 5 Tagen dabei,
# Nora seit einem. Stünde hier @nora, liefe die Erbfolge verkehrt herum — und
# ein Test auf „irgendwer erbt" hätte das durchgelassen.
steht "… und es ist die, die am längsten dabei ist" "$AUS" '@lea erbt sie'

echo
echo '── Und dann wirklich ───────────────────────────────────────────────────'

AUS="$(bash "$WERKZEUG" konto-loeschen "$IAN" --wirklich 2>&1)"
pruef "meldet Ausgeschlossen"                 "$(printf '%s' "$AUS" | grep -c '✓ Ausgeschlossen')" "1"
pruef "… und sagt, dass NACHgemessen wurde"   "$(printf '%s' "$AUS" | grep -c 'Nachgemessen')" "1"
pruef "das Konto ist weg"                     "$($PSQL -c "select count(*) from auth.users where id='$IAN';")" "0"
pruef "das Profil auch (cascade)"             "$($PSQL -c "select count(*) from profiles where id='$IAN';")" "0"
pruef "seine Gruppe lebt weiter (Entscheidung 13)" \
      "$($PSQL -c "select aufgeloest_am is null from groups where id='$ERBGRUPPE';")" "t"
pruef "… und Lea hat sie geerbt, nicht Nora" \
      "$($PSQL -c "select p.handle from groups g join profiles p on p.id=g.creator_id where g.id='$ERBGRUPPE';")" "lea"

echo
echo '── Ein Tippfehler ist keine erledigte Arbeit ───────────────────────────'

AUS="$(bash "$WERKZEUG" konto-loeschen @gibtsnicht 2>&1)"; RC=$?
pruef "ein erfundener @-Name bricht ab"       "$RC" "1"
pruef "… und zeigt, wen es gibt"              "$(printf '%s' "$AUS" | grep -c '@lea')" "1"

AUS="$(bash "$WERKZEUG" post-loeschen 00000000-0000-0000-0000-000000000000 --wirklich 2>&1)"; RC=$?
pruef "eine erfundene Post-ID bricht ab"      "$RC" "1"
pruef "… und löscht nichts"                   "$(printf '%s' "$AUS" | grep -c '✓')" "0"

echo
echo "  $JA Häkchen, $NEIN Kreuze"
[ "$NEIN" -eq 0 ]
