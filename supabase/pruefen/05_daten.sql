-- Prüfdaten für `10_angriff.sql`. Bewusst klein und bewusst so gebaut, dass JEDE
-- Regel mindestens einen Fall hat, der sie SPRECHEN lässt — die Lehre aus Phase 18d
-- („eine Regel, die nichts vorfindet, sieht aus wie eine Regel, die tut").
--
-- Harte Regel 12 gilt: erfundene Namen, keine echten Menschen.

insert into auth.users (id) values
  ('11111111-1111-1111-1111-111111111111'),  -- Ian
  ('22222222-2222-2222-2222-222222222222'),  -- Lea   — folgt Ian, in seiner Gruppe
  ('33333333-3333-3333-3333-333333333333'),  -- Mara  — fremd, folgt niemandem
  ('44444444-4444-4444-4444-444444444444'),  -- Tobi  — von Ian blockiert
  ('55555555-5555-5555-5555-555555555555');  -- Nora  — folgt Ian gegenseitig

insert into profiles (id, handle, display_name, district, jahrgang) values
  ('11111111-1111-1111-1111-111111111111','@ian','Ian','1220',2009),
  ('22222222-2222-2222-2222-222222222222','@lea','Lea','1070',2009),
  ('33333333-3333-3333-3333-333333333333','@mara','Mara','1100',2008),
  ('44444444-4444-4444-4444-444444444444','@tobi','Tobi','1020',2010),
  ('55555555-5555-5555-5555-555555555555','@nora','Nora','1190',2009);

-- Lea folgt Ian (einseitig). Nora und Ian folgen sich gegenseitig.
insert into follows (follower_id, followee_id) values
  ('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111'),
  ('55555555-5555-5555-5555-555555555555','11111111-1111-1111-1111-111111111111'),
  ('11111111-1111-1111-1111-111111111111','55555555-5555-5555-5555-555555555555');

-- Ian blockiert Tobi. NUR diese eine Zeile — die Gegenrichtung gibt es nicht (Regel 10).
insert into blocks (blocker_id, blocked_id) values
  ('11111111-1111-1111-1111-111111111111','44444444-4444-4444-4444-444444444444');

-- Eine PRIVATE Gruppe: Ian (Gründer) und Lea. Mara ist draußen.
insert into groups (id, name, category, creator_id, offen, district) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Marswiese Tennis','sport',
   '11111111-1111-1111-1111-111111111111', false, '1170');
insert into group_members (group_id, user_id, joined_at) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-1111-1111-111111111111', now() - interval '10 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','22222222-2222-2222-2222-222222222222', now() - interval '3 days');

-- Vier Posts von Ian, einer je Sichtbarkeitsstufe, plus je einer von Tobi und Mara.
insert into posts (id, author_id, category, title, district, starts_at, spots_total,
                   visibility_kind, visibility_group_id) values
  ('0a000001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',
   'sport','Tennis offen','1220', now() + interval '2 hours', 2, 'public', null),
  ('0a000002-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111',
   'food','Kaffee nur Follower','1070', now() + interval '4 hours', 2, 'followers', null),
  ('0a000003-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111',
   'sport','Training nur Gruppe','1170', now() + interval '1 day', 4, 'group',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('0a000004-0000-0000-0000-000000000004','44444444-4444-4444-4444-444444444444',
   'culture','Kino','1020', now() + interval '5 hours', 3, 'public', null),
  ('0a000005-0000-0000-0000-000000000005','33333333-3333-3333-3333-333333333333',
   'study','Lernen','1100', now() + interval '6 hours', 2, 'public', null);

-- Lea hat zwei Anfragen laufen: eine an IANS Post, eine an MARAS Post.
-- Die zweite ist der Prüffall für harte Regel 47 — Ian darf sie NICHT sehen.
insert into join_requests (id, post_id, from_user_id, message, status) values
  ('0b000001-0000-0000-0000-000000000001','0a000001-0000-0000-0000-000000000001',
   '22222222-2222-2222-2222-222222222222','Bin dabei!','accepted'),
  ('0b000002-0000-0000-0000-000000000002','0a000005-0000-0000-0000-000000000005',
   '22222222-2222-2222-2222-222222222222','Ich auch','pending');

-- Zwei Chats: einer an einer Aktivität (Ian + Lea), einer als Direktchat (Ian + Mara).
insert into chat_threads (id, post_id, aus_aktivitaet) values
  ('0c000001-0000-0000-0000-000000000001','0a000001-0000-0000-0000-000000000001', true),
  ('0c000002-0000-0000-0000-000000000002', null, false);
insert into chat_participants (thread_id, user_id) values
  ('0c000001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111'),
  ('0c000001-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222'),
  ('0c000002-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111'),
  ('0c000002-0000-0000-0000-000000000002','33333333-3333-3333-3333-333333333333');
insert into messages (thread_id, sender_id, text) values
  ('0c000001-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222','Passt 17:00?');
