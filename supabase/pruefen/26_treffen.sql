-- ═════════════════════════════════════════════════════════════════════════════
--  26 — DER TREFFEN-ZÄHLER WIRD ANGEGRIFFEN (Migration 0012, Phase 20.12)
-- ═════════════════════════════════════════════════════════════════════════════
--
-- Harte Regel 57: Was am Server gilt, wird ANGEGRIFFEN, nicht angeschaut. Dass die
-- Spalte existiert und der Trigger dranhängt, sagt nichts darüber, ob er das
-- Richtige zählt — und der Zähler hat vier Fälle, von denen drei leicht
-- danebengehen.
--
-- ⚠️ Harte Regel 83: Dieser Prüfstand fasst NUR seine eigenen IDs an. Alle beginnen
-- mit `2600…`, und jede Zählung unten filtert darauf. Er darf deshalb neben echten
-- Daten laufen.

\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

create temporary table haken (nr serial, text text, ok boolean);
create or replace function pruef(t text, b boolean) returns void
language plpgsql as $$ begin insert into haken (text, ok) values (t, b); end $$;

\echo ''
\echo '── Aufbau: drei Menschen, ein Post mit zwei Plätzen ────────────────────'

-- ⚠️ **Abgeräumt wird VORNE, nicht nur hinten.** Beim ersten Lauf dieser Datei
-- scheiterte der Farm-Angriff mitten im Skript — und weil `ON_ERROR_STOP` sofort
-- abbricht, lief das Aufräumen am Ende nie. Der nächste Lauf starb dann am
-- `users_pkey`, also an den Leichen des vorigen, und die Meldung sah nach einem
-- kaputten Prüfstand aus statt nach liegengebliebenen Daten.
--
-- Genau die Falle *„Ein Abräumen, das den Zustand eines GESCHEITERTEN Abräumens
-- nicht aufräumen kann, ist nur beim Schönwetter-Lauf vollständig."* Ein Prüfstand,
-- der sich nur selbst hinterherräumt, ist nach dem ersten roten Lauf unbrauchbar —
-- und das ist der Lauf, bei dem man ihn am dringendsten braucht.
--
-- Die Reihenfolge ist die der Fremdschlüssel, von innen nach außen.
delete from join_requests where id::text like '26000000%';
delete from posts         where id::text like '26000000%';
delete from profiles      where id::text like '26000000%';
delete from auth.users    where id::text like '26000000%';

insert into auth.users (id, email) values
  ('26000000-0000-0000-0000-000000000001', 'a26@example.invalid'),
  ('26000000-0000-0000-0000-000000000002', 'b26@example.invalid'),
  ('26000000-0000-0000-0000-000000000003', 'c26@example.invalid');

insert into profiles (id, handle, display_name, district, jahrgang) values
  ('26000000-0000-0000-0000-000000000001', 'poster26',  'Poster',  '1220', 2008),
  ('26000000-0000-0000-0000-000000000002', 'gast26a',   'Gast A',  '1220', 2009),
  ('26000000-0000-0000-0000-000000000003', 'gast26b',   'Gast B',  '1220', 2009);

insert into posts (id, author_id, category, title, district, starts_at, level, alter_kind,
                   spots_total, spots_filled, note, visibility_kind, status)
values ('26000000-0000-0000-0000-0000000000a1',
        '26000000-0000-0000-0000-000000000001', 'sport', 'Tennis 26', '1220',
        now() + interval '3 hours', 'any', 'egal', 3, 1, '', 'public', 'open');

insert into join_requests (id, post_id, from_user_id, message, status) values
  ('26000000-0000-0000-0000-0000000000b1', '26000000-0000-0000-0000-0000000000a1',
   '26000000-0000-0000-0000-000000000002', 'bin dabei', 'pending'),
  ('26000000-0000-0000-0000-0000000000b2', '26000000-0000-0000-0000-0000000000a1',
   '26000000-0000-0000-0000-000000000003', 'ich auch', 'pending');

select pruef('alle drei starten bei 0',
  (select count(*) = 3 from profiles where id::text like '26000000%' and treffen_anzahl = 0));
select pruef('eine offene Anfrage zaehlt NICHT',
  (select treffen_anzahl = 0 from profiles where handle = 'gast26a'));

\echo ''
\echo '── Der erste Gast wird bestätigt ───────────────────────────────────────'

update join_requests set status = 'accepted' where id = '26000000-0000-0000-0000-0000000000b1';

select pruef('der Gast hat jetzt 1',
  (select treffen_anzahl = 1 from profiles where handle = 'gast26a'));
select pruef('der Poster hat jetzt auch 1',
  (select treffen_anzahl = 1 from profiles where handle = 'poster26'));
select pruef('der unbeteiligte Gast B steht weiter bei 0',
  (select treffen_anzahl = 0 from profiles where handle = 'gast26b'));

\echo ''
\echo '── Der ZWEITE Gast am SELBEN Post — der Kern der Regel ─────────────────'
-- Ein Post mit drei Plätzen ist EIN Termin, nicht drei. Ginge der Poster hier auf 2,
-- belohnte der Zähler das Anlegen großer Runden statt das Treffen.

update join_requests set status = 'accepted' where id = '26000000-0000-0000-0000-0000000000b2';

select pruef('Gast B hat jetzt 1',
  (select treffen_anzahl = 1 from profiles where handle = 'gast26b'));
select pruef('der Poster steht WEITER bei 1 — ein Post ist ein Treffen',
  (select treffen_anzahl = 1 from profiles where handle = 'poster26'));

\echo ''
\echo '── Zurücknehmen per DELETE — der Weg, den Policy 0006 erlaubt ──────────'
-- Das ist der Fall, an dem Zähler-Code in `anfrage_bestaetigen` vorbeiliefe: Dort
-- kommt ein DELETE nie an.

delete from join_requests where id = '26000000-0000-0000-0000-0000000000b2';

select pruef('Gast B ist wieder bei 0',
  (select treffen_anzahl = 0 from profiles where handle = 'gast26b'));
select pruef('der Poster behält seine 1 — Gast A ist ja noch da',
  (select treffen_anzahl = 1 from profiles where handle = 'poster26'));

\echo ''
\echo '── Und der LETZTE Gast geht auch ───────────────────────────────────────'

delete from join_requests where id = '26000000-0000-0000-0000-0000000000b1';

select pruef('Gast A ist wieder bei 0',
  (select treffen_anzahl = 0 from profiles where handle = 'gast26a'));
select pruef('jetzt verliert auch der Poster sein Treffen',
  (select treffen_anzahl = 0 from profiles where handle = 'poster26'));

\echo ''
\echo '── Absagen statt löschen: derselbe Weg, anderer Status ─────────────────'

insert into join_requests (id, post_id, from_user_id, message, status) values
  ('26000000-0000-0000-0000-0000000000b3', '26000000-0000-0000-0000-0000000000a1',
   '26000000-0000-0000-0000-000000000002', 'nochmal', 'pending');
update join_requests set status = 'accepted' where id = '26000000-0000-0000-0000-0000000000b3';
select pruef('bestätigt: Gast A wieder bei 1',
  (select treffen_anzahl = 1 from profiles where handle = 'gast26a'));

update join_requests set status = 'declined' where id = '26000000-0000-0000-0000-0000000000b3';
select pruef('abgesagt: Gast A wieder bei 0',
  (select treffen_anzahl = 0 from profiles where handle = 'gast26a'));
select pruef('und der Poster ebenso',
  (select treffen_anzahl = 0 from profiles where handle = 'poster26'));

\echo ''
\echo '── Der Zähler ist nicht farmbar ────────────────────────────────────────'
-- Genau die Schleife, die den Zähler wertlos machen würde: bestätigen lassen,
-- löschen, wiederholen. Wer nur beim Bestätigen hochzählt, steht danach bei 3.
--
-- ⚠️ **Beim ersten Bauen lief die Schleife über EINEN Post und scheiterte am
-- Schema:** `join_requests` trägt `unique (post_id, from_user_id)` — dieselbe
-- Person kann an demselben Post gar nicht zweimal anfragen. Das ist ein echter
-- Schutz, aber ein schwächerer als gedacht: Über DREI Posts geht es sehr wohl, und
-- genau so sähe der Missbrauch auch aus (ein Komplize legt mehrere Posts an).
-- Deshalb prüft die Schleife jetzt den Weg, den es wirklich gibt.
--
-- Vorher weg, was noch liegt: `b3` steht auf `declined` und belegt das Paar
-- (Post a1, Gast A) — ohne das Löschen misst die Prüfung den Constraint statt den
-- Zähler.
delete from join_requests where id = '26000000-0000-0000-0000-0000000000b3';

do $$
declare i integer;
begin
  for i in 1..3 loop
    insert into posts (id, author_id, category, title, district, starts_at, level,
                       alter_kind, spots_total, spots_filled, note, visibility_kind, status)
    values (('26000000-0000-0000-0000-0000000000f' || i)::uuid,
            '26000000-0000-0000-0000-000000000001', 'sport', 'Farm ' || i, '1220',
            now() + interval '3 hours', 'any', 'egal', 2, 1, '', 'public', 'open');

    insert into join_requests (id, post_id, from_user_id, message, status)
    values (('26000000-0000-0000-0000-0000000000c' || i)::uuid,
            ('26000000-0000-0000-0000-0000000000f' || i)::uuid,
            '26000000-0000-0000-0000-000000000002', 'farm', 'pending');
    update join_requests set status = 'accepted'
     where id = ('26000000-0000-0000-0000-0000000000c' || i)::uuid;
    delete from join_requests where id = ('26000000-0000-0000-0000-0000000000c' || i)::uuid;
  end loop;
end $$;

select pruef('dreimal bestätigen und löschen lässt beim Gast NICHTS stehen',
  (select treffen_anzahl = 0 from profiles where handle = 'gast26a'));
select pruef('… und beim Poster auch nicht',
  (select treffen_anzahl = 0 from profiles where handle = 'poster26'));

\echo ''
\echo '── Der Zähler geht nie unter null ──────────────────────────────────────'
-- Der CHECK aus 0012 und das `greatest(…, 0)` sind zwei Netze. Geprüft wird, dass
-- eine doppelte Rücknahme die HANDLUNG nicht unmöglich macht.

insert into join_requests (id, post_id, from_user_id, message, status) values
  ('26000000-0000-0000-0000-0000000000d1', '26000000-0000-0000-0000-0000000000a1',
   '26000000-0000-0000-0000-000000000003', 'test', 'accepted');
delete from join_requests where id = '26000000-0000-0000-0000-0000000000d1';

select pruef('Gast B bleibt bei 0 statt auf -1 zu fallen',
  (select treffen_anzahl = 0 from profiles where handle = 'gast26b'));
select pruef('kein Profil der Prüfung steht im Minus',
  (select count(*) = 0 from profiles where id::text like '26000000%' and treffen_anzahl < 0));

\echo ''
\echo '── Die App darf den Zähler NICHT schreiben ─────────────────────────────'
-- Harte Regel 85: Eine neue Spalte erbt die Rechte der Tabelle. Ohne den `revoke`
-- in 0012 könnte jeder seinen eigenen Zähler hochsetzen.

select pruef('authenticated hat KEIN update-Recht auf treffen_anzahl',
  (select count(*) = 0 from information_schema.column_privileges
    where table_name = 'profiles' and grantee = 'authenticated'
      and privilege_type = 'UPDATE' and column_name = 'treffen_anzahl'));
select pruef('… aber sehr wohl auf display_name — die Gegenprobe',
  (select count(*) = 1 from information_schema.column_privileges
    where table_name = 'profiles' and grantee = 'authenticated'
      and privilege_type = 'UPDATE' and column_name = 'display_name'));
select pruef('PUBLIC darf treffen_buchen() nicht ausführen (harte Regel 104)',
  (select not has_function_privilege('public', 'public.treffen_buchen()', 'execute')));

\echo ''
\echo '── Aufräumen ───────────────────────────────────────────────────────────'

delete from join_requests where id::text like '26000000%';
delete from posts         where id::text like '26000000%';
delete from profiles      where id::text like '26000000%';
delete from auth.users    where id::text like '26000000%';

select pruef('nichts von dieser Prüfung bleibt liegen',
  (select count(*) = 0 from profiles where id::text like '26000000%'));

\echo ''
\echo '───────────────────────────────────────────────────────────────────────'
select '  ' || count(*) filter (where ok) || ' Häkchen, '
            || count(*) filter (where not ok) || ' Kreuze' from haken;
select '  ✗ ' || text from haken where not ok;

-- Ein roter Lauf muss das Skript scheitern lassen — sonst meldet ein Prüfstand
-- grün, weil niemand die Zeilen darüber liest.
do $$
declare schlecht integer;
begin
  select count(*) into schlecht from haken where not ok;
  if schlecht > 0 then
    raise exception '% Prüfung(en) fehlgeschlagen', schlecht;
  end if;
end $$;
