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

\echo '── Konto löschen: Ians Entscheidung 39 (A) + Entscheidung 13 ───────────'

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  -- Ian hat 3 Posts, eine Gruppe mit Lea drin, Chats und eine geschriebene Meldung.
  select konto_loeschen();
  reset role;   -- ab hier NACHSEHEN, nicht mehr angreifen

  select case when count(*) = 0 then '  ✓ ' else '  ✗ GEBLIEBEN — ' end
      || 'Ians Posts sind weg (Entscheidung 39: alles mit)'
    from posts where author_id = '11111111-1111-1111-1111-111111111111';

  select case when count(*) = 0 then '  ✓ ' else '  ✗ GEBLIEBEN — ' end
      || 'Ians Profil ist weg'
    from profiles where id = '11111111-1111-1111-1111-111111111111';

  -- DER Prüffall für Entscheidung 13: Die Gruppe darf NICHT verschwinden.
  select case when count(*) = 1 then '  ✓ ' else '  ✗ AUFGELÖST — ' end
      || 'die Gruppe mit Lea besteht weiter'
    from groups where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  select case when creator_id = '22222222-2222-2222-2222-222222222222'
              then '  ✓ ' else '  ✗ FALSCHER ERBE — ' end
      || 'und gehört jetzt Lea (wer am längsten dabei ist)'
    from groups where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  -- Der Beleg überlebt den Melder.
  select case when count(*) = 1 then '  ✓ ' else '  ✗ MITGENOMMEN — ' end
      || 'Ians Meldung steht noch da (from_user_id ist jetzt null)'
    from reports where target_id = '44444444-4444-4444-4444-444444444444'
      and reason = 'belaestigung' and from_user_id is null;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"55555555-5555-5555-5555-555555555555"}';
  -- Nora ist ALLEIN in ihrer Gruppe. „Weitergeben" ohne Nachfolger heißt auflösen —
  -- und das ist keine Ausnahme, sondern dieselbe Regel: Die Gruppe gehört den Leuten
  -- darin, und es sind keine mehr da.
  --
  -- 🔁 Seit Ians Entscheidung 41 (2026-09-10) heißt „auflösen" NICHT MEHR „die Zeile
  --    ist weg": Die Gruppe hört auf (`aufgeloest_am`), damit Gruppen-Posts anderer
  --    Leute stehen bleiben können (die Begründung an der Spalte in 0001). Diese
  --    Prüfung stand vorher auf `count(*) = 0` und ist beim Umbau ROT geworden —
  --    genau, wozu sie da ist.
  select konto_loeschen();
  reset role;
  select case when count(*) = 1 then '  ✓ ' else '  ✗ VERWAIST — ' end
      || 'Noras Gruppe hört auf, weil sie allein darin war (Datum gesetzt, kein Chef)'
    from groups
   where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
     and aufgeloest_am is not null and creator_id is null;
rollback;

begin;
  set local role anon;
  do $$ declare z text; begin
    perform konto_loeschen();
    raise notice '  ✗ DURCHGELASSEN — ohne Anmeldung ein Konto gelöscht';
  exception when others then get stacked diagnostics z = returned_sqlstate;
    if z = '42501' then raise notice '  ✓ ohne Anmeldung löscht konto_loeschen() nichts';
    else raise notice '  ✗ FALSCHER GRUND (SQLSTATE=%)', z;
    end if;
  end $$;
rollback;


\echo ''
\echo '── Meldungen: die EIGENE lesen ja, eine fremde nie (2026-09-10, Phase 20.4) ─'

-- In den Prüfdaten hat IAN Tobi gemeldet. Drei Fragen, drei Antworten.
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  -- Ohne diese Zeile käme in Phase 20.4 eine leere Liste zurück, und der Satz
  -- „Du hast das schon gemeldet" (Phase 7) verschwände lautlos. Genau deshalb
  -- steht seit dem 2026-09-10 `melder_sieht_eigene` in 0002.
  select case when count(*) = 1 then '  ✓ ' else '  ✗ FEHLT — ' end
      || 'der Melder sieht seine eigene Meldung' from reports;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222"}';
  -- Lea hat nichts gemeldet. Sie darf auch nicht sehen, DASS jemand etwas gemeldet
  -- hat — sonst wäre eine Meldung an ihrer Zahl abzulesen.
  select case when count(*) = 0 then '  ✓ ' else '  ✗ DURCHGELASSEN — ' end
      || 'eine Fremde sieht KEINE Meldung' from reports;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"44444444-4444-4444-4444-444444444444"}';
  -- Der GEMELDETE ist der Wichtigste: Er darf nicht erfahren, dass er gemeldet
  -- wurde, und schon gar nicht von wem. Harte Regel 10 in ihrer zweiten Form.
  select case when count(*) = 0 then '  ✓ ' else '  ✗ DURCHGELASSEN — ' end
      || 'der GEMELDETE sieht nicht, dass er gemeldet wurde' from reports;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222"}';
  -- Und eine Meldung im fremden Namen bleibt unmöglich — die insert-Policy von
  -- 20.2 ist durch das neue select-Recht unberührt.
  do $$ declare z text; begin
    insert into reports (target_type, target_id, from_user_id, reason)
      values ('user','44444444-4444-4444-4444-444444444444',
              '11111111-1111-1111-1111-111111111111','spam');
    raise notice '  ✗ DURCHGELASSEN — im Namen eines anderen gemeldet';
  exception when others then get stacked diagnostics z = returned_sqlstate;
    if z = '42501' then raise notice '  ✓ im Namen eines anderen melden geht nicht';
    else raise notice '  ✗ FALSCHER GRUND (SQLSTATE=%)', z;
    end if;
  end $$;
rollback;

\echo '── 0006: eine Beitritts-Anfrage zurückziehen ────────────────────────────'

-- Die Zeile entsteht in JEDEM Block neu, statt in `05_daten.sql` zu stehen: Dort
-- läge sie bis zum Ende herum, und `20_transaktionen.sql` legt dieselbe Anfrage
-- für seine eigene Prüfung an — mit fester ID, also als Schlüsselkonflikt.
-- Noras Gruppe (`bbbb…`) ist die einzige mit `offen = true`; ohne sie gäbe es
-- gar keine Anfrage zu prüfen (die 18d-Lehre).

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';
  insert into group_requests (id, group_id, from_user_id, message)
    values ('0d000002-0000-0000-0000-000000000002','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            '33333333-3333-3333-3333-333333333333','Darf ich dazu?');
  -- Mara hat die Anfrage gestellt, Mara zieht sie zurück. Bis 0006 ging das GAR
  -- NICHT: kein delete-Recht, und die einzige update-Policy lässt nur den Gründer
  -- durch. Ein Knopf, der seit Phase 17 in der App steht, ohne Weg am Server.
  delete from group_requests where id = '0d000002-0000-0000-0000-000000000002';
  select case when count(*) = 0 then '  ✓ ' else '  ✗ GEHT NICHT — ' end
      || 'Mara kann ihre eigene Beitritts-Anfrage zurückziehen'
    from group_requests where id = '0d000002-0000-0000-0000-000000000002';
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';
  insert into group_requests (id, group_id, from_user_id, message)
    values ('0d000002-0000-0000-0000-000000000002','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            '33333333-3333-3333-3333-333333333333','Darf ich dazu?');
  -- Lea geht die Anfrage nichts an — sie sieht sie nicht einmal
  -- (`gruppenanfrage_lesen`), und ein `delete` ohne sichtbare Zeile trifft nichts.
  set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222"}';
  delete from group_requests where id = '0d000002-0000-0000-0000-000000000002';
  set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';
  select case when count(*) = 1 then '  ✓ ' else '  ✗ DURCHGELASSEN — ' end
      || 'eine Fremde kann Maras Anfrage NICHT löschen'
    from group_requests where id = '0d000002-0000-0000-0000-000000000002';
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';
  insert into group_requests (id, group_id, from_user_id, message)
    values ('0d000002-0000-0000-0000-000000000002','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            '33333333-3333-3333-3333-333333333333','Darf ich dazu?');
  -- **Das ist die Prüfung, auf die es ankommt.** Die GRÜNDERIN sieht die Anfrage
  -- (`gruppenanfrage_lesen`) und darf sie beantworten (`gruppenanfrage_beantworten`)
  -- — zurückziehen kann sie trotzdem nur, wer sie gestellt hat. Ohne diesen Fall
  -- wäre `from_user_id = auth.uid()` von einem blanken `true` nicht zu unterscheiden,
  -- denn die zwei Prüfungen darüber liefen auch bei offener Tür grün bzw. an der
  -- Lesesperre.
  set local request.jwt.claims = '{"sub":"55555555-5555-5555-5555-555555555555"}';
  delete from group_requests where id = '0d000002-0000-0000-0000-000000000002';
  set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';
  select case when count(*) = 1 then '  ✓ ' else '  ✗ DURCHGELASSEN — ' end
      || 'die Gründerin kann eine fremde Anfrage nicht löschen (nur beantworten)'
    from group_requests where id = '0d000002-0000-0000-0000-000000000002';
rollback;
