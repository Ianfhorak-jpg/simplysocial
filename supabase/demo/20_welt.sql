-- ═══════════════════════════════════════════════════════════════════════════════
--  DIE DEMO-WELT — Phase 21.5, Punkt 1 und Punkt 5 in einem
--  Vier Menschen, fünf Aktivitäten, eine offene Anfrage und ein laufender Chat.
-- ═══════════════════════════════════════════════════════════════════════════════
--
--  ── Warum es diese Datei gibt, obwohl `LeererFeed` die ehrlichere Antwort wäre ─
--  Punkt 5 aus PLAN.md 21.5 lautet: *„Ein Reviewer öffnet die App in einem leeren
--  Wien."* Der leere Zustand ist gebaut und richtig — nur beantwortet er die Frage
--  des Reviewers nicht. Er prüft nicht, ob die App hübsch ist, sondern ob sie das
--  TUT, was der Store-Eintrag behauptet. Das Herzstück dieser App sind drei
--  Schritte — „Bin dabei" → bestätigen → Chat —, und keiner davon lässt sich an
--  einem leeren Feed vorführen. Eine App, deren Kernfunktion der Reviewer nicht
--  erreichen kann, wird nach Guideline 2.1 als unvollständig abgelehnt.
--
--  ═══════════════════════════════════════════════════════════════════════════════
--   WARUM KEIN EINZIGER POST `public` IST — das ist der wichtigste Absatz hier
--  ═══════════════════════════════════════════════════════════════════════════════
--
--  Der naheliegende Weg wäre `visibility_kind = 'public'`. Er ist falsch, und der
--  Grund steht in `0002_policies.sql`, Zeile 209: Ein öffentlicher Post ist für
--  JEDEN Angemeldeten sichtbar. Die Demo-Welt stünde damit im Feed von Ian, von
--  Christoph, Leopold und Daria — und später im Feed jedes Menschen, der die App
--  lädt. **Erfundene Leute in der echten Datenbank**, also genau das, wogegen
--  harte Regel 12 steht, nur eine Ebene gefährlicher: nicht in `mock.ts`, sondern
--  in der Datenbank, in der auch die echten Verabredungen liegen.
--
--  Alle Posts sind deshalb `followers`, und alle fünf Demo-Menschen folgen
--  einander GEGENSEITIG. Damit greift `regel.folgt(auth.uid(), author_id)`:
--
--    · das Demo-Konto sieht die Demo-Welt vollständig,
--    · jedes echte Konto sieht **nichts davon** — keinen Post, keine Aktivität,
--      keinen Chat,
--    · und das ist keine Einstellung, die jemand vergessen kann, sondern dieselbe
--      Policy, die auch sonst über Follower-Posts entscheidet.
--
--  Der Preis ist benannt: Der Reviewer sieht an jeder Karte die Sicht-Marke „nur
--  meine Follower". Das ist kein Makel — es führt ihm nebenbei eine Funktion vor,
--  die er sonst selbst hätte suchen müssen.
--
--  ── Die Zeiten sind RELATIV, und trotzdem verfällt diese Datei ───────────────
--  Jedes `starts_at` hängt an `now()`. Ein fester Zeitstempel wäre schon beim
--  zweiten Einreichen vergangen, und `post_status` stünde auf `past` — der
--  Reviewer sähe einen Feed voller abgelaufener Aktivitäten. Relativ heißt aber
--  nur: relativ zum LAUF. Liegt der Lauf vier Wochen vor dem Review, ist wieder
--  alles vorbei. **Deshalb ist `anlegen.sh` wiederholbar, und deshalb steht in
--  `_FUER_IAN/DEMO_ZUGANG.md` der Satz, es vor jedem Einreichen einmal laufen zu
--  lassen.** Das Passwort bleibt dabei unangetastet.

-- ── 1. Die vier Gegenüber ────────────────────────────────────────────────────
--
-- Sie bekommen einen `auth.users`-Eintrag, weil `profiles.id` darauf zeigt — aber
-- KEIN Passwort und kein bestätigtes `email_confirmed_at`. Es sind Zeilen, keine
-- Zugänge: Niemand kann sich als sie anmelden, auf keinem Weg.
--
-- Die acht leeren Strings stehen trotzdem da. Sie sind hier nicht nötig, um sich
-- anzumelden — aber GoTrue liest `auth.users` auch bei fremden Abfragen, und ein
-- NULL an dieser Stelle ist die Sorte Fehler, die an einer ganz anderen Stelle
-- auftaucht (FALLEN.md, „Database error querying schema").
insert into auth.users (
  id, instance_id, aud, role, email, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
)
select
  v.id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  v.email, now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
  '', '', '', '', '', '', '', ''
from (values
  ('dddddddd-dddd-dddd-dddd-dddddddddd02'::uuid, 'demo-lena@simplysocial.invalid'),
  ('dddddddd-dddd-dddd-dddd-dddddddddd03'::uuid, 'demo-tobias@simplysocial.invalid'),
  ('dddddddd-dddd-dddd-dddd-dddddddddd04'::uuid, 'demo-mira@simplysocial.invalid'),
  ('dddddddd-dddd-dddd-dddd-dddddddddd05'::uuid, 'demo-jonas@simplysocial.invalid')
) as v(id, email)
on conflict (id) do nothing;

-- Vornamen ohne Nachnamen, Bezirke ohne Adressen, keine Fotos. Harte Regel 12
-- gilt hier schärfer als in `mock.ts`: Das sind Zeilen in der ECHTEN Datenbank,
-- und was dort einmal steht, steht auch im Backup.
insert into profiles (id, handle, display_name, district, jahrgang, bio, interests)
values
  ('dddddddd-dddd-dddd-dddd-dddddddddd02', 'demo_lena',   'Lena',   '1220', 2003,
   'Spiele seit zwei Jahren Tennis, suche jemanden für regelmäßige Matches.', '{sport,outdoor}'),
  ('dddddddd-dddd-dddd-dddd-dddddddddd03', 'demo_tobias', 'Tobias', '1070', 2001,
   'Neu in Wien. Immer für einen Kaffee zu haben.', '{food,culture}'),
  ('dddddddd-dddd-dddd-dddd-dddddddddd04', 'demo_mira',   'Mira',   '1040', 2005,
   'Studiere Architektur, lerne lieber nicht allein.', '{study,creative}'),
  ('dddddddd-dddd-dddd-dddd-dddddddddd05', 'demo_jonas',  'Jonas',  '1010', 2000,
   'Kino, Ausstellungen, alles was man danach besprechen kann.', '{culture,food}')
on conflict (id) do update set
  handle = excluded.handle, display_name = excluded.display_name,
  district = excluded.district, jahrgang = excluded.jahrgang,
  bio = excluded.bio, interests = excluded.interests;

-- ── 2. Alle folgen allen ─────────────────────────────────────────────────────
--
-- Das ist nicht Geselligkeit, sondern die Bedingung dafür, dass oben kein Post
-- `public` sein muss. Harte Regel 8: Eine Folge-Beziehung steht ZWEIMAL im
-- Datenmodell — hier entsteht sie durch das Kreuzprodukt in beide Richtungen.
insert into follows (follower_id, followee_id)
select a.id, b.id
from (select unnest(array[
        'dddddddd-dddd-dddd-dddd-dddddddddd01',
        'dddddddd-dddd-dddd-dddd-dddddddddd02',
        'dddddddd-dddd-dddd-dddd-dddddddddd03',
        'dddddddd-dddd-dddd-dddd-dddddddddd04',
        'dddddddd-dddd-dddd-dddd-dddddddddd05']::uuid[]) as id) a,
     (select unnest(array[
        'dddddddd-dddd-dddd-dddd-dddddddddd01',
        'dddddddd-dddd-dddd-dddd-dddddddddd02',
        'dddddddd-dddd-dddd-dddd-dddddddddd03',
        'dddddddd-dddd-dddd-dddd-dddddddddd04',
        'dddddddd-dddd-dddd-dddd-dddddddddd05']::uuid[]) as id) b
where a.id <> b.id
on conflict do nothing;

-- ── 3. Die Aktivitäten ───────────────────────────────────────────────────────
--
-- Fünf Stück, und jede hat eine Aufgabe im Durchgang des Reviewers:
--
--   A (Lena, Tennis)   — hier ist er schon dabei. Zeigt den Zustand NACH dem Match
--                        und hängt am Chat weiter unten.
--   B, C, D            — offen und ohne Anfrage von ihm: Daran führt er „Bin dabei"
--                        vor. Drei statt einer, damit der Feed nach einer Liste
--                        aussieht und nicht nach einem Einzelfall.
--   E (sein eigener)   — trägt die offene Anfrage von Tobias, an der er das
--                        BESTÄTIGEN vorführt. Ohne sie fehlt die Hälfte des
--                        Herzstücks: Bis Phase 4 war „der Poster bestätigt" die
--                        eine Entscheidung, die diese App von einem Schwarzen
--                        Brett unterscheidet.
insert into posts (
  id, author_id, category, title, district, starts_at, level,
  spots_total, spots_filled, note, meeting_point, visibility_kind, status
) values
  ('dddddddd-dddd-dddd-dddd-ddddddddd0a1', 'dddddddd-dddd-dddd-dddd-dddddddddd02',
   'sport', 'Tennis, zwei Sätze', '1220', now() + interval '2 days' + interval '9 hours',
   'intermediate', 2, 1, 'Platz ist reserviert. Bälle bring ich mit.',
   'Tennisplatz Donaustadt, beim Eingang', 'followers', 'open'),

  ('dddddddd-dddd-dddd-dddd-ddddddddd0a2', 'dddddddd-dddd-dddd-dddd-dddddddddd03',
   'food', 'Kaffee am Nachmittag', '1070', now() + interval '3 days' + interval '7 hours',
   'any', 3, 0, 'Einfach reden, kein Programm.',
   'Cafe am Spittelberg', 'followers', 'open'),

  ('dddddddd-dddd-dddd-dddd-ddddddddd0a3', 'dddddddd-dddd-dddd-dddd-dddddddddd04',
   'study', 'Zusammen lernen für die Statik-Prüfung', '1040', now() + interval '5 days' + interval '10 hours',
   'any', 4, 1, 'Bibliothek, ruhiger Teil im ersten Stock.',
   'TU-Bibliothek', 'followers', 'open'),

  ('dddddddd-dddd-dddd-dddd-ddddddddd0a4', 'dddddddd-dddd-dddd-dddd-dddddddddd05',
   'culture', 'Kino am Abend', '1010', now() + interval '8 days' + interval '11 hours',
   'any', 3, 0, 'Was Gutes im Original. Danach noch etwas trinken.',
   'Vor dem Kino', 'followers', 'open'),

  -- Der eigene. `spots_filled = 0`, weil Tobias' Anfrage noch OFFEN ist — eine
  -- bestätigte Anfrage und ein unberührter Zähler wären zwei Aussagen über
  -- denselben Zustand, und der Reviewer sähe beim Bestätigen eine Zahl springen,
  -- die schon gesprungen war.
  ('dddddddd-dddd-dddd-dddd-ddddddddd0a5', 'dddddddd-dddd-dddd-dddd-dddddddddd01',
   'outdoor', 'Spaziergang durch den Prater', '1020', now() + interval '4 days' + interval '8 hours',
   'any', 3, 0, 'Gemütlich, ohne Eile.',
   'Beim Riesenrad', 'followers', 'open')
on conflict (id) do update set
  -- Beim zweiten Lauf werden vor allem die ZEITEN aufgefrischt — das ist der
  -- eigentliche Zweck des `on conflict` hier (siehe Kopf).
  starts_at = excluded.starts_at,
  status = excluded.status,
  spots_filled = excluded.spots_filled,
  title = excluded.title,
  note = excluded.note,
  visibility_kind = excluded.visibility_kind;

-- ── 4. Die zwei Anfragen ─────────────────────────────────────────────────────
insert into join_requests (id, post_id, from_user_id, message, status) values
  -- Angenommen: Darum ist der Reviewer bei Lenas Tennis dabei, darum steht dort
  -- `spots_filled = 1`, und darum gibt es den Chat unten.
  ('dddddddd-dddd-dddd-dddd-ddddddddd0b1', 'dddddddd-dddd-dddd-dddd-ddddddddd0a1',
   'dddddddd-dddd-dddd-dddd-dddddddddd01', 'Spiele seit dem Sommer wieder, passt das?', 'accepted'),
  -- Offen: DAS ist der Knopf, den der Reviewer drücken soll.
  ('dddddddd-dddd-dddd-dddd-ddddddddd0b2', 'dddddddd-dddd-dddd-dddd-ddddddddd0a5',
   'dddddddd-dddd-dddd-dddd-dddddddddd03', 'Bin dabei, kenne den Prater noch gar nicht.', 'pending')
on conflict (id) do update set status = excluded.status, message = excluded.message;

-- ── 5. Der Chat ──────────────────────────────────────────────────────────────
--
-- `aus_aktivitaet = true` mit `post_id` — die HERKUNFT eines Chats ist eine
-- Tatsache und kein abgeleiteter Wert (harte Regel 56). Ein Direktchat mit einem
-- untergeschobenen Post wäre die Regel 29 in ihrer verbotenen Richtung.
insert into chat_threads (id, post_id, aus_aktivitaet, created_at, last_message_at)
values ('dddddddd-dddd-dddd-dddd-ddddddddd0c1', 'dddddddd-dddd-dddd-dddd-ddddddddd0a1',
        true, now() - interval '2 hours', now() - interval '20 minutes')
on conflict (id) do update set last_message_at = excluded.last_message_at;

insert into chat_participants (thread_id, user_id) values
  ('dddddddd-dddd-dddd-dddd-ddddddddd0c1', 'dddddddd-dddd-dddd-dddd-dddddddddd01'),
  ('dddddddd-dddd-dddd-dddd-ddddddddd0c1', 'dddddddd-dddd-dddd-dddd-dddddddddd02')
on conflict do nothing;

-- Drei Nachrichten, und die letzte kommt von Lena. Das ist kein Zufall: Ein
-- Verlauf, der mit der eigenen Nachricht endet, sieht aus wie ein Chat, auf den
-- niemand geantwortet hat.
insert into messages (id, thread_id, sender_id, text, sent_at) values
  ('dddddddd-dddd-dddd-dddd-ddddddddd0d1', 'dddddddd-dddd-dddd-dddd-ddddddddd0c1',
   'dddddddd-dddd-dddd-dddd-dddddddddd02', 'Super, freut mich! Passt dir 9 Uhr?',
   now() - interval '2 hours'),
  ('dddddddd-dddd-dddd-dddd-ddddddddd0d2', 'dddddddd-dddd-dddd-dddd-ddddddddd0c1',
   'dddddddd-dddd-dddd-dddd-dddddddddd01', 'Ja, 9 geht. Brauche ich einen eigenen Schläger?',
   now() - interval '90 minutes'),
  ('dddddddd-dddd-dddd-dddd-ddddddddd0d3', 'dddddddd-dddd-dddd-dddd-ddddddddd0c1',
   'dddddddd-dddd-dddd-dddd-dddddddddd02', 'Ich hab einen zweiten dabei, kein Problem.',
   now() - interval '20 minutes')
on conflict (id) do update set sent_at = excluded.sent_at;
