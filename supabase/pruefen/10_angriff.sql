-- ═══════════════════════════════════════════════════════════════════════════════
--  DER PRÜFSTEIN VON PHASE 20.2
--
--  Aus PLAN.md, Abschnitt 5b: „Der Prüfstein für diese Phase ist nicht, dass die App
--  läuft. Sie läuft auch mit offenen Policies. Der Prüfstein ist: mit dem
--  Zugangsschlüssel eines zweiten Kontos direkt an der Datenbank vorbei versuchen,
--  einen Follower-Post zu lesen. Was dabei nicht kommt, ist geschützt. Alles andere
--  ist geglaubt."
--
--  Genau das steht hier. Jeder Block setzt sich in die Rolle `authenticated` und
--  legt ein JWT-Claim an — das ist Zeile für Zeile das, was PostgREST tut, wenn
--  jemand mit einem gültigen Schlüssel eines ZWEITEN Kontos die REST-Schnittstelle
--  aufruft. Die App kommt dabei nicht vor. Sie ist nicht die Absicherung.
--
--  ── Warum `set local role authenticated` nicht weggelassen werden darf ────────
--  Der EIGENTÜMER einer Tabelle umgeht seine eigenen Policies. Wer diese Prüfung als
--  `postgres` laufen lässt, bekommt überall Zeilen und hält das für ein Ergebnis.
--
--  Aufruf:  bash supabase/pruefen/aufbauen.sh
-- ═══════════════════════════════════════════════════════════════════════════════

\set ian  '11111111-1111-1111-1111-111111111111'
\set lea  '22222222-2222-2222-2222-222222222222'
\set mara '33333333-3333-3333-3333-333333333333'
\set tobi '44444444-4444-4444-4444-444444444444'
\set nora '55555555-5555-5555-5555-555555555555'

\echo '── Sichtbarkeit: der Follower-Post ──────────────────────────────────────'

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';
  select case when count(*) = 0 then '  ✓ ' else '  ✗ DURCHGELASSEN — ' end
      || 'Mara (fremd) kann Ians Follower-Post nicht lesen'
    from posts where id = '0a000002-0000-0000-0000-000000000002';
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222"}';
  select case when count(*) = 1 then '  ✓ ' else '  ✗ FEHLT — ' end
      || 'Lea (folgt Ian) kann ihn lesen'
    from posts where id = '0a000002-0000-0000-0000-000000000002';
rollback;

\echo '── Sichtbarkeit: der Gruppen-Post ───────────────────────────────────────'

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"55555555-5555-5555-5555-555555555555"}';
  -- Nora folgt Ian sogar GEGENSEITIG — sie ist nur nicht in der Gruppe. Der Fall
  -- trennt die zweite von der dritten Stufe: Folgen ist nicht Mitgliedschaft.
  select case when count(*) = 0 then '  ✓ ' else '  ✗ DURCHGELASSEN — ' end
      || 'Nora (folgt gegenseitig, aber kein Mitglied) sieht den Gruppen-Post nicht'
    from posts where id = '0a000003-0000-0000-0000-000000000003';
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222"}';
  select case when count(*) = 1 then '  ✓ ' else '  ✗ FEHLT — ' end
      || 'Lea (Mitglied) sieht ihn'
    from posts where id = '0a000003-0000-0000-0000-000000000003';
rollback;

\echo '── Blockieren: wirkt in BEIDE Richtungen, steht nur EINMAL da ───────────'

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"44444444-4444-4444-4444-444444444444"}';
  -- Ian hat Tobi blockiert. Gespeichert ist nur Ians Zeile — trotzdem sieht Tobi
  -- Ians ÖFFENTLICHEN Post nicht. Das ist `regel.sind_blockiert()`, nicht die App.
  select case when count(*) = 0 then '  ✓ ' else '  ✗ DURCHGELASSEN — ' end
      || 'Tobi (blockiert) sieht Ians öffentlichen Post nicht'
    from posts where id = '0a000001-0000-0000-0000-000000000001';
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  select case when count(*) = 0 then '  ✓ ' else '  ✗ DURCHGELASSEN — ' end
      || 'Ian sieht Tobis Post auch nicht (Gegenrichtung, ohne zweite Zeile)'
    from posts where id = '0a000004-0000-0000-0000-000000000004';
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"44444444-4444-4444-4444-444444444444"}';
  -- HARTE REGEL 10: Wer blockiert wird, darf es nicht merken. Tobi darf die Zeile,
  -- die ihn betrifft, nicht lesen — sonst wüsste er es mit einer einzigen Abfrage.
  select case when count(*) = 0 then '  ✓ ' else '  ✗ VERRATEN — ' end
      || 'Tobi kann die Block-Zeile über sich nicht lesen'
    from blocks;
rollback;

\echo '── Private Gruppe: die ZAHL ja, die LISTE nein ──────────────────────────'

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';
  select case when count(*) = 0 then '  ✓ ' else '  ✗ DURCHGELASSEN — ' end
      || 'Mara sieht die Mitgliederliste der privaten Gruppe nicht'
    from group_members where group_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  select case when count(*) = 1 then '  ✓ ' else '  ✗ FEHLT — ' end
      || 'Mara sieht die Gruppe selbst (Name, Kategorie, Bezirk) — PRIVAT_SICHT'
    from groups where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  -- Und hier der Grund, warum es `mitglieder_anzahl()` überhaupt gibt: Ein blankes
  -- `count(*)` gäbe Mara die Zahl 0 — keine Fehlermeldung, sondern eine FALSCHE
  -- Auskunft, die wie eine leere Gruppe aussieht.
  select case when regel.mitglieder_anzahl('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') = 2
              then '  ✓ ' else '  ✗ FALSCHE ZAHL — ' end
      || 'die Mitgliederzahl stimmt trotzdem (2)';
rollback;

\echo '── Harte Regel 47: fremde Termine bleiben fremd ─────────────────────────'

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  -- Lea hat zwei Anfragen laufen: eine an Ians Post, eine an Maras. Ian ist Poster
  -- der ersten. Sähe er auch die zweite, könnte er ausrechnen, wo Lea sonst noch
  -- hingeht — genau die verworfene dritte Möglichkeit aus Phase 18d.
  select case when count(*) = 1 then '  ✓ ' else '  ✗ ZU VIEL — ' end
      || 'Ian sieht genau EINE von Leas zwei Anfragen (nur die an seinen Post)'
    from join_requests where from_user_id = '22222222-2222-2222-2222-222222222222';
rollback;

\echo '── Chat ────────────────────────────────────────────────────────────────'

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';
  select case when count(*) = 0 then '  ✓ ' else '  ✗ MITGELESEN — ' end
      || 'Mara kann den Chat zwischen Ian und Lea nicht mitlesen'
    from messages where thread_id = '0c000001-0000-0000-0000-000000000001';
rollback;

\echo '── Schreiben: was die Oberfläche nur ausgeblendet hat ───────────────────'

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';
  -- SCHREIB_REGEL = 'gegenseitig'. Mara und Ian folgen sich NICHT. Im Prototyp war
  -- der Knopf ausgeblendet — hier ist es eine Regel.
  savepoint s;
  do $$ declare z text; begin
    insert into messages (thread_id, sender_id, text)
      values ('0c000002-0000-0000-0000-000000000002','33333333-3333-3333-3333-333333333333','hallo');
    raise notice '  ✗ DURCHGELASSEN — Mara konnte ohne gegenseitiges Folgen schreiben';
  exception when others then get stacked diagnostics z = returned_sqlstate;
    if z = '42501' then raise notice '  ✓ Mara kann im Direktchat nicht schreiben (SCHREIB_REGEL)';
    else raise notice '  ✗ FALSCHER GRUND (SQLSTATE=%) — Mara kann im Direktchat nicht schreiben (SCHREIB_REGEL)', z;
    end if;
  end $$;
  rollback to s;
  savepoint s2;
  do $$ declare z text; begin
    insert into posts (author_id, category, title, starts_at, spots_total)
      values ('11111111-1111-1111-1111-111111111111','sport','Gefaelscht', now(), 2);
    raise notice '  ✗ DURCHGELASSEN — Mara konnte einen Post in Ians Namen anlegen';
  exception when others then get stacked diagnostics z = returned_sqlstate;
    if z = '42501' then raise notice '  ✓ Mara kann keinen Post in Ians Namen anlegen';
    else raise notice '  ✗ FALSCHER GRUND (SQLSTATE=%) — Mara kann keinen Post in Ians Namen anlegen', z;
    end if;
  end $$;
  rollback to s2;
  savepoint s3;
  do $$ declare z text; begin
    insert into posts (author_id, category, title, starts_at, spots_total,
                       visibility_kind, visibility_group_id)
      values ('33333333-3333-3333-3333-333333333333','sport','Rein da', now(), 2,
              'group','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    raise notice '  ✗ DURCHGELASSEN — Mara konnte in eine fremde Gruppe posten';
  exception when others then get stacked diagnostics z = returned_sqlstate;
    if z = '42501' then raise notice '  ✓ Mara kann nicht in eine Gruppe posten, in der sie nicht ist';
    else raise notice '  ✗ FALSCHER GRUND (SQLSTATE=%) — Mara kann nicht in eine Gruppe posten, in der sie nicht ist', z;
    end if;
  end $$;
  rollback to s3;
  savepoint s4;
  do $$ declare z text; begin
    insert into group_members (group_id, user_id)
      values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','33333333-3333-3333-3333-333333333333');
    raise notice '  ✗ DURCHGELASSEN — Mara konnte sich selbst in die Gruppe schreiben';
  exception when others then get stacked diagnostics z = returned_sqlstate;
    if z = '42501' then raise notice '  ✓ Mara kann sich nicht selbst in die Gruppe schreiben';
    else raise notice '  ✗ FALSCHER GRUND (SQLSTATE=%) — Mara kann sich nicht selbst in die Gruppe schreiben', z;
    end if;
  end $$;
  rollback to s4;
rollback;

\echo '── Ohne Anmeldung ──────────────────────────────────────────────────────'

begin;
  set local role anon;
  -- Der `anon`-Schlüssel steht im ausgelieferten App-Bündel. Jeder, der die Seite
  -- öffnet, hat ihn. Er darf nichts.
  do $$ declare z text; begin
    perform count(*) from posts;
    raise notice '  ✗ DURCHGELASSEN — anon kann Posts lesen';
  exception when others then get stacked diagnostics z = returned_sqlstate;
    if z = '42501' then raise notice '  ✓ anon (nicht angemeldet) kommt an keine Posts';
    else raise notice '  ✗ FALSCHER GRUND (SQLSTATE=%)', z;
    end if;
  end $$;
rollback;

\echo '── Ein gelöschter Post sperrt keinen bestehenden Chat zu ────────────────'

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  -- Ian und Lea haben sich über `0a000001` verabredet. Lea folgt Ian, Ian folgt Lea
  -- NICHT — für einen Direktchat wäre das zu wenig (SCHREIB_REGEL = 'gegenseitig').
  -- Löscht Ian jetzt seinen Post, wird `post_id` null. Ohne `aus_aktivitaet` hielte
  -- die Policy den Faden ab hier für einen Direktchat und spräche beiden das
  -- Schreibrecht ab — wegen einer Sache, die mit ihrem Chat nichts zu tun hat.
  delete from posts where id = '0a000001-0000-0000-0000-000000000001';
  do $$ declare z text; begin
    insert into messages (thread_id, sender_id, text)
      values ('0c000001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','bin da');
    raise notice '  ✓ Ian kann weiter schreiben, obwohl der Post weg ist';
  exception when others then get stacked diagnostics z = returned_sqlstate;
    raise notice '  ✗ ZUGESPERRT (SQLSTATE=%) — der gelöschte Post hat den Chat gekippt', z;
  end $$;
rollback;
