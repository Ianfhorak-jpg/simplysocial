-- ═══════════════════════════════════════════════════════════════════════════════
--  DER PRÜFSTEIN VON PHASE 20.5 — die SCHREIBSEITE
--
--  `10_angriff.sql` fragt: *Kommt jemand an Daten, an die er nicht darf?*
--  Diese Datei fragt das Gegenstück: *Tut ein rechtmäßiger Schreibvorgang genau
--  das, was Ians Regel sagt — und ein unrechtmäßiger GAR NICHTS?*
--
--  Dieselbe Bauart wie 10: jeder Block `set local role authenticated` plus ein
--  JWT-Claim, alles in `begin … rollback`. Wer als `postgres` prüft, prüft nichts.
--
--  ── Was hier NICHT geprüft wird, und warum es dasteht ────────────────────────
--  Das Wettrennen zweier gleichzeitiger Bestätigungen. `select … for update` in
--  `anfrage_bestaetigen` ist gegen genau das gebaut, und zwei gleichzeitige
--  Sitzungen gibt es in EINER psql-Datei nicht. Dafür liegt daneben
--  `30_wettlauf.sh` — zwei echte Verbindungen, ein Post mit einem Platz.
-- ═══════════════════════════════════════════════════════════════════════════════

\set ian  '11111111-1111-1111-1111-111111111111'
\set lea  '22222222-2222-2222-2222-222222222222'
\set mara '33333333-3333-3333-3333-333333333333'
\set tobi '44444444-4444-4444-4444-444444444444'
\set nora '55555555-5555-5555-5555-555555555555'

\echo ''
\echo '════ PHASE 20.5 — die Schreibseite ══════════════════════════════════════'
\echo '── Anfrage bestätigen: Anfrage, Platz und Chat in EINEM Zug ─────────────'

-- Mara bestätigt Leas Anfrage an ihren eigenen Post (`0b000002` auf `0a000005`).
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';
  do $$
  declare faden uuid; r record; p record; n integer;
  begin
    faden := public.anfrage_bestaetigen('0b000002-0000-0000-0000-000000000002');

    select * into r from public.join_requests where id = '0b000002-0000-0000-0000-000000000002';
    if r.status = 'accepted' then raise notice '  ✓ die Anfrage steht auf accepted';
    else raise notice '  ✗ FEHLT — die Anfrage steht auf accepted (ist: %)', r.status; end if;

    select * into p from public.posts where id = '0a000005-0000-0000-0000-000000000005';
    if p.spots_filled = 1 then raise notice '  ✓ der Post hat einen Platz weniger';
    else raise notice '  ✗ FEHLT — der Post hat einen Platz weniger (ist: %)', p.spots_filled; end if;

    select count(*) into n from public.chat_participants where thread_id = faden;
    if faden is not null and n = 2 then raise notice '  ✓ der Chat ist da, mit beiden darin';
    else raise notice '  ✗ FEHLT — der Chat ist da, mit beiden darin'; end if;

    select count(*) into n from public.chat_threads
      where id = faden and aus_aktivitaet = true and post_id = '0a000005-0000-0000-0000-000000000005';
    if n = 1 then raise notice '  ✓ er ist als Aktivitäts-Chat vermerkt (harte Regel 56)';
    else raise notice '  ✗ FEHLT — er ist als Aktivitäts-Chat vermerkt'; end if;
  end $$;
rollback;

-- Derselbe Post, aber mit nur EINEM Platz: er muss sich danach selbst schließen.
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';
  update posts set spots_total = 1 where id = '0a000005-0000-0000-0000-000000000005';
  do $$
  declare p record;
  begin
    perform public.anfrage_bestaetigen('0b000002-0000-0000-0000-000000000002');
    select * into p from public.posts where id = '0a000005-0000-0000-0000-000000000005';
    if p.status = 'full' then raise notice '  ✓ der letzte Platz schließt den Post';
    else raise notice '  ✗ FEHLT — der letzte Platz schließt den Post (ist: %)', p.status; end if;
  end $$;
rollback;

-- Und ein Post, den der Verfasser selbst geschlossen hat, geht dadurch NICHT auf:
-- `past` bleibt `past` (`postNachBestaetigung`).
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';
  update posts set status = 'past' where id = '0a000005-0000-0000-0000-000000000005';
  do $$
  declare p record;
  begin
    perform public.anfrage_bestaetigen('0b000002-0000-0000-0000-000000000002');
    select * into p from public.posts where id = '0a000005-0000-0000-0000-000000000005';
    if p.status = 'past' then raise notice '  ✓ `past` bleibt `past`';
    else raise notice '  ✗ FALSCH — `past` bleibt `past` (ist: %)', p.status; end if;
  end $$;
rollback;

\echo '── Anfrage bestätigen: was NICHT geht ───────────────────────────────────'

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222"}';
  do $$ declare z text; r record; p record; begin
    perform public.anfrage_bestaetigen('0b000002-0000-0000-0000-000000000002');
    raise notice '  ✗ DURCHGELASSEN — Lea konnte ihre eigene Anfrage bestätigen';
  exception when others then get stacked diagnostics z = returned_sqlstate;
    if z = '42501' then raise notice '  ✓ nur der Verfasser bestätigt, nicht der Anfragende';
    else raise notice '  ✗ FALSCHER GRUND (SQLSTATE=%)', z; end if;
  end $$;
  -- Und danach steht alles unverändert da — kein halber Vorgang.
  select case when r.status = 'pending' and p.spots_filled = 0 then '  ✓ ' else '  ✗ FEHLT — ' end
      || 'nach dem abgewiesenen Versuch ist NICHTS passiert'
    from join_requests r, posts p
   where r.id = '0b000002-0000-0000-0000-000000000002'
     and p.id = '0a000005-0000-0000-0000-000000000005';
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';
  do $$ declare z text; begin
    perform public.anfrage_bestaetigen('0b000002-0000-0000-0000-000000000002');
    perform public.anfrage_bestaetigen('0b000002-0000-0000-0000-000000000002');
    raise notice '  ✗ DURCHGELASSEN — zweimal bestätigen ging';
  exception when others then get stacked diagnostics z = returned_sqlstate;
    if z = '42501' then raise notice '  ✓ zweimal bestätigen geht nicht (der Platz bliebe sonst doppelt weg)';
    else raise notice '  ✗ FALSCHER GRUND (SQLSTATE=%)', z; end if;
  end $$;
rollback;

begin;
  set local role anon;
  do $$ declare z text; begin
    perform public.anfrage_bestaetigen('0b000002-0000-0000-0000-000000000002');
    raise notice '  ✗ DURCHGELASSEN — ohne Anmeldung bestätigt';
  exception when others then get stacked diagnostics z = returned_sqlstate;
    raise notice '  ✓ ohne Anmeldung bestätigt niemand';
  end $$;
rollback;

\echo '── Blockieren: Ians Entscheidung 7 („alles weg") ────────────────────────'

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  -- Damit die Rücknahme etwas vorfindet: Leas Zusage auf Ians Post ist `accepted`,
  -- also steht der Platz auch als belegt da. (Die Lehre aus 18d — eine Regel ohne
  -- passende Daten sieht aus wie eine Regel, die tut.)
  update posts set spots_filled = 1, status = 'open'
   where id = '0a000001-0000-0000-0000-000000000001';
  do $$
  declare n integer; r record; p record;
  begin
    perform public.blockieren('22222222-2222-2222-2222-222222222222');

    select count(*) into n from public.blocks
     where blocker_id = '11111111-1111-1111-1111-111111111111'
       and blocked_id = '22222222-2222-2222-2222-222222222222';
    if n = 1 then raise notice '  ✓ der Block steht da';
    else raise notice '  ✗ FEHLT — der Block steht da'; end if;

    select count(*) into n from public.blocks
     where blocker_id = '22222222-2222-2222-2222-222222222222'
       and blocked_id = '11111111-1111-1111-1111-111111111111';
    if n = 0 then raise notice '  ✓ und NUR einmal (harte Regel 10: Lea darf es nicht merken)';
    else raise notice '  ✗ FALSCH — der Block steht zweimal da'; end if;

    select count(*) into n from public.follows
     where (follower_id = '22222222-2222-2222-2222-222222222222'
            and followee_id = '11111111-1111-1111-1111-111111111111')
        or (follower_id = '11111111-1111-1111-1111-111111111111'
            and followee_id = '22222222-2222-2222-2222-222222222222');
    if n = 0 then raise notice '  ✓ die Folge-Beziehung ist in BEIDE Richtungen weg';
    else raise notice '  ✗ FEHLT — die Folge-Beziehung ist in beide Richtungen weg'; end if;

    select * into r from public.join_requests where id = '0b000001-0000-0000-0000-000000000001';
    if r.status = 'declined' then raise notice '  ✓ die bestätigte Verabredung ist abgesagt';
    else raise notice '  ✗ FEHLT — die Verabredung ist abgesagt (ist: %)', r.status; end if;

    select * into p from public.posts where id = '0a000001-0000-0000-0000-000000000001';
    if p.spots_filled = 0 and p.status = 'open' then raise notice '  ✓ der Platz ist wieder frei und der Post wieder offen';
    else raise notice '  ✗ FEHLT — Platz frei und Post offen (ist: % / %)', p.spots_filled, p.status; end if;

    select count(*) into n from public.chat_threads where id = '0c000001-0000-0000-0000-000000000001';
    if n = 0 then raise notice '  ✓ der gemeinsame Chat ist verschwunden';
    else raise notice '  ✗ FEHLT — der gemeinsame Chat ist verschwunden'; end if;

    select count(*) into n from public.messages
     where thread_id = '0c000001-0000-0000-0000-000000000001';
    if n = 0 then raise notice '  ✓ und die Nachrichten darin mit';
    else raise notice '  ✗ FEHLT — die Nachrichten sind mit weg'; end if;

    select count(*) into n from public.chat_threads where id = '0c000002-0000-0000-0000-000000000002';
    if n = 1 then raise notice '  ✓ der Chat mit Mara ist unberührt';
    else raise notice '  ✗ FALSCH — ein fremder Chat wurde mitgelöscht'; end if;
  end $$;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  do $$ declare z text; begin
    perform public.blockieren('11111111-1111-1111-1111-111111111111');
    raise notice '  ✗ DURCHGELASSEN — sich selbst blockiert';
  exception when others then get stacked diagnostics z = returned_sqlstate;
    if z = '42501' then raise notice '  ✓ sich selbst blockiert man nicht';
    else raise notice '  ✗ FALSCHER GRUND (SQLSTATE=%)', z; end if;
  end $$;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  do $$ declare n integer; begin
    -- Ian blockiert Tobi, der schon blockiert IST. Das darf kein Fehler sein: Im
    -- Prototyp war ein zweiter Klick folgenlos, und ein Fehler hier sähe für die
    -- Person aus wie ein kaputter Knopf.
    perform public.blockieren('44444444-4444-4444-4444-444444444444');
    select count(*) into n from public.blocks
     where blocker_id = '11111111-1111-1111-1111-111111111111'
       and blocked_id = '44444444-4444-4444-4444-444444444444';
    if n = 1 then raise notice '  ✓ zweimal blockieren ist folgenlos, kein Fehler';
    else raise notice '  ✗ FALSCH — zweimal blockieren (Zeilen: %)', n; end if;
  end $$;
rollback;

\echo '── Gruppe verlassen: Ians Entscheidungen 12 und 13 ──────────────────────'

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222"}';
  do $$ declare n integer; g record; begin
    perform public.gruppe_verlassen('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    select count(*) into n from public.group_members
     where group_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
       and user_id = '22222222-2222-2222-2222-222222222222';
    select * into g from public.groups where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    if n = 0 and g.creator_id = '11111111-1111-1111-1111-111111111111'
      then raise notice '  ✓ ein Mitglied geht — die Gruppe bleibt, wie sie war';
      else raise notice '  ✗ FEHLT — ein Mitglied geht, die Gruppe bleibt'; end if;
  end $$;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  do $$ declare n integer; g record; begin
    perform public.gruppe_verlassen('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    select * into g from public.groups where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    select count(*) into n from public.group_members
     where group_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
       and user_id = '11111111-1111-1111-1111-111111111111';
    if g.creator_id = '22222222-2222-2222-2222-222222222222' and n = 0
      then raise notice '  ✓ der Gründer geht — Lea erbt (wer am längsten dabei ist)';
      else raise notice '  ✗ FEHLT — der Gründer vererbt an Lea'; end if;

    select count(*) into n from public.posts where id = '0a000003-0000-0000-0000-000000000003';
    if n = 1 then raise notice '  ✓ und seine Gruppen-Posts bleiben stehen (AUSTRITT_WIRKUNG)';
    else raise notice '  ✗ FEHLT — die Gruppen-Posts bleiben stehen'; end if;
  end $$;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"55555555-5555-5555-5555-555555555555"}';
  do $$ declare n integer; begin
    perform public.gruppe_verlassen('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    select count(*) into n from public.groups
     where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
       and aufgeloest_am is not null and creator_id is null;
    if n = 1 then raise notice '  ✓ der letzte geht — die Gruppe hört auf (Entscheidung 41)';
    else raise notice '  ✗ FEHLT — die Gruppe hört auf'; end if;
  end $$;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';
  do $$ declare z text; begin
    perform public.gruppe_verlassen('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    raise notice '  ✗ DURCHGELASSEN — Mara verließ eine Gruppe, in der sie nie war';
  exception when others then get stacked diagnostics z = returned_sqlstate;
    if z = '42501' then raise notice '  ✓ wer nicht drin ist, kann nicht heraus';
    else raise notice '  ✗ FALSCHER GRUND (SQLSTATE=%)', z; end if;
  end $$;
rollback;

\echo '── Löst sich die Gruppe auf: Ians Entscheidung 41 ──────────────────────'

-- Der Gruppen-Post BLEIBT (Entscheidung 41 vom 2026-09-10, dieselbe Regel wie
-- `AUSTRITT_WIRKUNG` = Entscheidung 12). Möglich ist das nur, weil die Gruppe nicht
-- gelöscht wird, sondern aufhört — mit `on delete cascade` wäre der Post mit weg,
-- mit `on delete set null` bräche der CHECK `sicht_vollstaendig`. Die Begründung
-- steht an der Spalte `aufgeloest_am` in 0001.
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222"}';
  select public.gruppe_verlassen('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') \gset weg_
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  do $$ declare n integer; g record; begin
    perform public.gruppe_verlassen('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

    select count(*) into n from public.posts where id = '0a000003-0000-0000-0000-000000000003';
    if n = 1 then raise notice '  ✓ der Gruppen-Post bleibt stehen (Entscheidung 41)';
    else raise notice '  ✗ FEHLT — der Gruppen-Post bleibt stehen'; end if;

    select * into g from public.groups where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    if g.aufgeloest_am is not null and g.creator_id is null
      then raise notice '  ✓ die Gruppe hat aufgehört: mit Datum und ohne Chef';
      else raise notice '  ✗ FEHLT — die Gruppe ist aufgelöst und chef-los'; end if;

    select count(*) into n from public.group_members
     where group_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    if n = 0 then raise notice '  ✓ und niemand ist mehr drin';
    else raise notice '  ✗ FEHLT — die Mitgliederliste ist leer (ist: %)', n; end if;
  end $$;
rollback;

-- Und damit ist der Post für alle unsichtbar außer für seinen Verfasser: `posts_lesen`
-- fragt `regel.ist_mitglied`, und Mitglieder gibt es keine mehr. DAS ist der Grund,
-- warum ein Stehenbleiben kein Datenschutzproblem ist — verworfen war ja gerade
-- „bleibt und wird öffentlich".
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222"}';
  select public.gruppe_verlassen('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') \gset weg2_
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  select public.gruppe_verlassen('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') \gset weg3_
  set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222"}';
  select case when count(*) = 0 then '  ✓ ' else '  ✗ DURCHGELASSEN — ' end
      || 'Lea sieht den Post der aufgelösten Gruppe nicht mehr'
    from posts where id = '0a000003-0000-0000-0000-000000000003';
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  select case when count(*) = 1 then '  ✓ ' else '  ✗ FEHLT — ' end
      || 'der Verfasser sieht ihn weiter'
    from posts where id = '0a000003-0000-0000-0000-000000000003';
rollback;

-- Eine Gruppe, die aufgehört hat, betritt niemand mehr.
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"55555555-5555-5555-5555-555555555555"}';
  select public.gruppe_verlassen('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb') \gset weg4_
  set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';
  do $$ declare z text; begin
    insert into public.group_requests (group_id, from_user_id)
      values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','33333333-3333-3333-3333-333333333333');
    raise notice '  ✗ DURCHGELASSEN — Anfrage an eine Gruppe, die es nicht mehr gibt';
  exception when others then get stacked diagnostics z = returned_sqlstate;
    if z = '42501' then raise notice '  ✓ an eine aufgelöste Gruppe stellt niemand mehr eine Anfrage';
    else raise notice '  ✗ FALSCHER GRUND (SQLSTATE=%)', z; end if;
  end $$;
rollback;

-- Und das Konto des Gründers lässt sich danach löschen. Ohne `on delete set null`
-- an `creator_id` scheiterte genau das an `groups_creator_id_fkey` — derselbe
-- Fehler, aus dem Entscheidung 39 entstanden ist, einen Schritt später.
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"55555555-5555-5555-5555-555555555555"}';
  do $$ declare n integer; begin
    perform public.konto_loeschen();
    select count(*) into n from public.groups
     where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' and aufgeloest_am is not null;
    if n = 1 then raise notice '  ✓ Kontolöschen löst die eigene letzte Gruppe auf, statt daran zu scheitern';
    else raise notice '  ✗ FEHLT — die Gruppe ist aufgelöst'; end if;
  end $$;
rollback;

\echo '── Gruppe gründen, beitreten, eingeladen werden ─────────────────────────'

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';
  do $$ declare neu uuid; g record; n integer; begin
    neu := public.gruppe_gruenden('Laufen im Prater','','sport', true, '1020');
    select * into g from public.groups where id = neu;
    select count(*) into n from public.group_members
     where group_id = neu and user_id = '33333333-3333-3333-3333-333333333333';
    if g.creator_id = '33333333-3333-3333-3333-333333333333' and n = 1
      then raise notice '  ✓ wer gründet, ist sofort Mitglied (sonst gäbe es eine Gruppe ohne Leute)';
      else raise notice '  ✗ FEHLT — der Gründer ist Mitglied'; end if;
  end $$;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';
  do $$ declare z text; begin
    perform public.gruppe_gruenden('   ','','sport', true, null);
    raise notice '  ✗ DURCHGELASSEN — Gruppe ohne Namen';
  exception when others then get stacked diagnostics z = returned_sqlstate;
    raise notice '  ✓ eine Gruppe ohne Namen gibt es nicht';
  end $$;
rollback;

-- Beitritt: Mara fragt Noras OFFENE Gruppe an, Nora nimmt sie auf.
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';
  insert into group_requests (id, group_id, from_user_id, message)
    values ('0d000001-0000-0000-0000-000000000001','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            '33333333-3333-3333-3333-333333333333','Darf ich?');
  savepoint s;
  do $$ declare z text; begin
    perform public.beitritt_bestaetigen('0d000001-0000-0000-0000-000000000001');
    raise notice '  ✗ DURCHGELASSEN — Mara nahm sich selbst auf';
  exception when others then get stacked diagnostics z = returned_sqlstate;
    if z = '42501' then raise notice '  ✓ nur der Gründer nimmt auf, nicht der Anfragende';
    else raise notice '  ✗ FALSCHER GRUND (SQLSTATE=%)', z; end if;
  end $$;
  rollback to s;
  set local request.jwt.claims = '{"sub":"55555555-5555-5555-5555-555555555555"}';
  do $$ declare n integer; r record; begin
    perform public.beitritt_bestaetigen('0d000001-0000-0000-0000-000000000001');
    select * into r from public.group_requests where id = '0d000001-0000-0000-0000-000000000001';
    select count(*) into n from public.group_members
     where group_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
       and user_id = '33333333-3333-3333-3333-333333333333';
    if r.status = 'accepted' and n = 1
      then raise notice '  ✓ der Gründer bestätigt — Anfrage und Mitgliedschaft in EINEM Zug';
      else raise notice '  ✗ FEHLT — Anfrage accepted und Mitgliedschaft da'; end if;
  end $$;
rollback;

-- Einladung: Ian lädt Mara in seine private Gruppe ein, Mara nimmt an.
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  insert into group_invites (id, group_id, from_user_id, to_user_id)
    values ('0e000001-0000-0000-0000-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            '11111111-1111-1111-1111-111111111111','33333333-3333-3333-3333-333333333333');
  savepoint s;
  set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222"}';
  do $$ declare z text; begin
    perform public.einladung_annehmen('0e000001-0000-0000-0000-000000000001');
    raise notice '  ✗ DURCHGELASSEN — Lea nahm eine Einladung an, die Mara galt';
  exception when others then get stacked diagnostics z = returned_sqlstate;
    if z = '42501' then raise notice '  ✓ eine Einladung nimmt nur an, wem sie gilt';
    else raise notice '  ✗ FALSCHER GRUND (SQLSTATE=%)', z; end if;
  end $$;
  rollback to s;
  set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';
  do $$ declare n integer; begin
    perform public.einladung_annehmen('0e000001-0000-0000-0000-000000000001');
    select count(*) into n from public.group_members
     where group_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
       and user_id = '33333333-3333-3333-3333-333333333333';
    if n = 1 then raise notice '  ✓ die Eingeladene nimmt an und ist drin';
    else raise notice '  ✗ FEHLT — die Eingeladene ist drin'; end if;
  end $$;
rollback;

\echo '── Direktchat: Ians SCHREIB_REGEL = „gegenseitig" ───────────────────────'

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  do $$ declare a uuid; b uuid; begin
    a := public.direktchat_oeffnen('55555555-5555-5555-5555-555555555555');
    b := public.direktchat_oeffnen('55555555-5555-5555-5555-555555555555');
    if a is not null and a = b
      then raise notice '  ✓ Ian und Nora folgen sich — ein Faden, und beim zweiten Mal derselbe';
      else raise notice '  ✗ FEHLT — je Personenpaar genau EIN Direktchat'; end if;
  end $$;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  do $$ declare z text; begin
    -- Lea folgt Ian, Ian folgt Lea NICHT. Einseitig reicht nicht.
    perform public.direktchat_oeffnen('22222222-2222-2222-2222-222222222222');
    raise notice '  ✗ DURCHGELASSEN — Direktchat ohne gegenseitiges Folgen';
  exception when others then get stacked diagnostics z = returned_sqlstate;
    if z = '42501' then raise notice '  ✓ einseitiges Folgen reicht nicht (SCHREIB_REGEL)';
    else raise notice '  ✗ FALSCHER GRUND (SQLSTATE=%)', z; end if;
  end $$;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  do $$ declare z text; begin
    perform public.direktchat_oeffnen('44444444-4444-4444-4444-444444444444');
    raise notice '  ✗ DURCHGELASSEN — Direktchat mit einem Blockierten';
  exception when others then get stacked diagnostics z = returned_sqlstate;
    if z = '42501' then raise notice '  ✓ mit jemandem, den man blockiert hat, gibt es keinen Chat';
    else raise notice '  ✗ FALSCHER GRUND (SQLSTATE=%)', z; end if;
  end $$;
rollback;

\echo '── Der Trigger: `last_message_at` ───────────────────────────────────────'

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222"}';
  do $$ declare vorher timestamptz; nachher timestamptz; begin
    select last_message_at into vorher from public.chat_threads
     where id = '0c000001-0000-0000-0000-000000000001';
    insert into messages (thread_id, sender_id, text)
      values ('0c000001-0000-0000-0000-000000000001',
              '22222222-2222-2222-2222-222222222222','Und 18:00?');
    select last_message_at into nachher from public.chat_threads
     where id = '0c000001-0000-0000-0000-000000000001';
    if nachher > vorher
      then raise notice '  ✓ eine Nachricht hebt `last_message_at` — ohne zweiten Aufruf';
      else raise notice '  ✗ FEHLT — `last_message_at` wandert mit'; end if;
  end $$;
rollback;

\echo '── Und der Weg daran vorbei bleibt zu ───────────────────────────────────'

-- Der eigentliche Beweis dieser Phase: Die Funktionen sind nicht EIN Weg, sondern
-- der EINZIGE. Ohne diese vier Prüfungen wäre alles oben nur eine Bequemlichkeit.
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';
  savepoint s;
  do $$ declare z text; begin
    insert into chat_threads (post_id, aus_aktivitaet) values (null, false);
    raise notice '  ✗ DURCHGELASSEN — Mara legte einen Chat von Hand an';
  exception when others then get stacked diagnostics z = returned_sqlstate;
    if z = '42501' then raise notice '  ✓ einen Chat legt nur eine Funktion an';
    else raise notice '  ✗ FALSCHER GRUND (SQLSTATE=%)', z; end if;
  end $$;
  rollback to s;
  savepoint s2;
  do $$ declare z text; begin
    delete from group_members where group_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    if not found then raise exception 'nichts gelöscht' using errcode = '42501'; end if;
    raise notice '  ✗ DURCHGELASSEN — Mara warf die Gruppe leer';
  exception when others then get stacked diagnostics z = returned_sqlstate;
    if z = '42501' then raise notice '  ✓ eine Mitgliedschaft löscht nur `gruppe_verlassen` (Erbfolge!)';
    else raise notice '  ✗ FALSCHER GRUND (SQLSTATE=%)', z; end if;
  end $$;
  rollback to s2;
  savepoint s3;
  do $$ declare z text; begin
    update chat_threads set last_message_at = now()
     where id = '0c000002-0000-0000-0000-000000000002';
    if not found then raise exception 'nichts geändert' using errcode = '42501'; end if;
    raise notice '  ✗ DURCHGELASSEN — Mara schob ihren Chat nach oben';
  exception when others then get stacked diagnostics z = returned_sqlstate;
    if z = '42501' then raise notice '  ✓ `last_message_at` setzt nur der Trigger';
    else raise notice '  ✗ FALSCHER GRUND (SQLSTATE=%)', z; end if;
  end $$;
  rollback to s3;
rollback;
