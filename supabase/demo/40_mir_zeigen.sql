-- ═══════════════════════════════════════════════════════════════════════════════
--  EIN ECHTES KONTO SIEHT DIE DEMO-WELT — Ians Wunsch vom 2026-09-20
-- ═══════════════════════════════════════════════════════════════════════════════
--
--  Sein Satz: *„am Simulator sehe ich ja, dass diese ganzen Beispiele da sind —
--  kannst du die bitte auch auf mein Handy geben … dass mein Konto das immer hat,
--  so mäßig so ein Developer Account."*
--
--  ── Warum das GEHT, ohne irgendetwas aufzuweichen ───────────────────────────
--  Die Demo-Welt ist `followers`-sichtbar (siehe `20_welt.sql`), und die fünf
--  Demo-Menschen folgen einander. Wer sie sehen will, muss ihnen FOLGEN — mehr
--  nicht. Diese Datei legt genau diese fünf Folge-Beziehungen für ein benanntes
--  echtes Konto an.
--
--  🔴 **Es wird NICHTS an der Sichtbarkeit geändert.** Kein Post wird `public`,
--  keine Policy wird angefasst, harte Regel 109 bleibt Wort für Wort gültig. Für
--  jedes andere echte Konto ist die Demo-Welt weiterhin unsichtbar. Das ist der
--  Unterschied zwischen „einer Person etwas zeigen" und „etwas öffentlich machen",
--  und er ist hier kein Detail: Die zweite Variante wäre erfundene Leute im Feed
--  jedes Menschen, der die App lädt.
--
--  ── Was es KOSTET, und warum Ian das wissen sollte ──────────────────────────
--  Sein Feed enthält ab jetzt fünf erfundene Menschen mit Aktivitäten. Das ist
--  gewollt, aber es heißt auch: **Sein Konto ist kein Maßstab mehr dafür, was ein
--  neuer Mensch in Wien sieht.** Für diese Frage — den leeren Anfangszustand —
--  braucht es ein Konto ohne diese Zeilen, oder ein `--mir-nicht-mehr`.
--
--  ── Rückgängig ─────────────────────────────────────────────────────────────
--  `npm run demo -- --mir-nicht-mehr <e-mail>` nimmt genau diese fünf Zeilen
--  wieder weg. `--abraeumen` erwischt sie ebenfalls: Dort steht
--  `or followee_id::text like 'dddddddd-%'`, und das ist genau dieser Fall.
-- ═══════════════════════════════════════════════════════════════════════════════

\set ON_ERROR_STOP on

-- ⚠️ **Die Prüfung „gibt es das Konto?" steht in `anlegen.sh`, nicht hier.**
-- Der naheliegende Weg wäre ein `do $$ … raise exception … $$` gewesen — und der
-- ist am 2026-09-20 gescheitert: **psql ersetzt `:'wer'` NICHT innerhalb eines
-- Dollar-Quoted Blocks.** Die Variable bleibt dort als Text stehen, und Postgres
-- meldet `syntax error at or near ":"`. Eine Prüfung in der Shell ist hier
-- ohnehin die ehrlichere: Sie kann den Namen in die Fehlermeldung schreiben.

insert into follows (follower_id, followee_id)
select u.id, d.id
from auth.users u,
     (select unnest(array[
        'dddddddd-dddd-dddd-dddd-dddddddddd01',
        'dddddddd-dddd-dddd-dddd-dddddddddd02',
        'dddddddd-dddd-dddd-dddd-dddddddddd03',
        'dddddddd-dddd-dddd-dddd-dddddddddd04',
        'dddddddd-dddd-dddd-dddd-dddddddddd05']::uuid[]) as id) d
where lower(u.email) = lower(:'wer')
  -- Sich selbst zu folgen ginge schief, falls die E-Mail je einem Demo-Konto
  -- gehört. Kostet nichts und schließt den Fall aus.
  and u.id <> d.id
on conflict do nothing;

-- ═══════════════════════════════════════════════════════════════════════════════
--  TEIL 2: EIN PROFIL, DAS NICHT LEER AUSSIEHT
-- ═══════════════════════════════════════════════════════════════════════════════
--
--  Ians Wunsch vom 2026-09-20: *„kann man das auch mit den Anfragen, mit den Chats
--  und mit meinem Profil machen, dass es halt so aussieht, als hätte ich schon ein
--  paar Sachen gemacht."*
--
--  ── Warum EIGENE Zeilen und nicht ein Platz in der bestehenden Welt ─────────
--  Der naheliegende Weg wäre, ihn bei einer der fünf Demo-Aktivitäten mitmachen zu
--  lassen. Das geht schief: `20_welt.sql` schreibt beim Auffrischen `spots_filled`
--  über (`on conflict do update`), und der normale Lauf `npm run demo` kennt diese
--  Datei hier gar nicht. Nach jedem Auffrischen stünde eine bestätigte Anfrage
--  neben einem Zähler auf null — **zwei Aussagen über denselben Zustand**, genau
--  das, was der Kommentar bei Post E in `20_welt.sql` vermeiden soll.
--
--  Mit eigenen Zeilen fasst die Demo-Welt seine Sachen nie an, und seine Sachen
--  fassen die Demo-Welt nie an.
--
--  ── Die IDs beginnen trotzdem mit `dddddddd-` ──────────────────────────────
--  Absicht: `30_abraeumen.sql` räumt nach diesem Muster ab. Zeilen, die Ian
--  gehören, aber beim Abräumen liegen blieben, wären erfundene Aktivitäten in
--  einer echten Datenbank ohne Weg zurück.
--
--  **Das Schema dahinter:** Der Buchstabe sagt die TABELLE (`a` Aktivität,
--  `b` Anfrage, `c` Chat, `d` Nachricht) — genau wie in `20_welt.sql`. Die Ziffer
--  davor sagt, WESSEN Welt: `0` die Demo-Welt, `1` das eigene Konto.
--
--  ⚠️ **Es gibt keine Buchstaben nach `f`.** Hier standen zuerst `…0g1` und
--  `…0h1` — in einer Reihe von Platzhalter-IDs sieht das völlig normal aus, ist
--  aber keine gültige UUID: erlaubt sind nur `0-9a-f`. Postgres meldet das als
--  `invalid input syntax for type uuid` und zeigt dabei auf die ganze Zeile.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Die Demo-Menschen folgen zurück ─────────────────────────────────────────
-- Ohne das hätte sein Profil null Follower — und die Anfragen unten kämen von
-- Leuten, die seine `followers`-Aktivität gar nicht sehen könnten. Harte Regel 8:
-- Eine Folge-Beziehung steht ZWEIMAL im Modell, und die Gegenrichtung ist eine
-- eigene Zeile.
insert into follows (follower_id, followee_id)
select d.id, u.id
from auth.users u,
     (select unnest(array[
        'dddddddd-dddd-dddd-dddd-dddddddddd02',
        'dddddddd-dddd-dddd-dddd-dddddddddd03',
        'dddddddd-dddd-dddd-dddd-dddddddddd04',
        'dddddddd-dddd-dddd-dddd-dddddddddd05']::uuid[]) as id) d
where lower(u.email) = lower(:'wer') and u.id <> d.id
on conflict do nothing;

-- ── Seine eigene Aktivität ──────────────────────────────────────────────────
-- `spots_filled = 1`, weil unten eine Anfrage `accepted` ist. Die zweite bleibt
-- offen — DAS ist der türkise Punkt am Anfragen-Tab und der Knopf, an dem das
-- Bestätigen hängt.
insert into posts (
  id, author_id, category, title, district, starts_at, level,
  spots_total, spots_filled, note, meeting_point, visibility_kind, status
)
select 'dddddddd-dddd-dddd-dddd-ddddddddd1a1', u.id,
  'sport', 'Laufen an der Alten Donau', '1220',
  now() + interval '1 day' + interval '8 hours',
  'any', 3, 1, 'Gemuetliches Tempo, so 5 bis 6 Kilometer.',
  'U1 Alte Donau, beim Ausgang', 'followers', 'open'
from auth.users u where lower(u.email) = lower(:'wer')
on conflict (id) do update set
  starts_at = excluded.starts_at,
  spots_filled = excluded.spots_filled,
  status = excluded.status;

-- ── Zwei Anfragen auf SEINE Aktivität ───────────────────────────────────────
insert into join_requests (id, post_id, from_user_id, message, status) values
  ('dddddddd-dddd-dddd-dddd-ddddddddd1b1', 'dddddddd-dddd-dddd-dddd-ddddddddd1a1',
   'dddddddd-dddd-dddd-dddd-dddddddddd02', 'Bin dabei, laufe die Strecke oft.', 'accepted'),
  ('dddddddd-dddd-dddd-dddd-ddddddddd1b2', 'dddddddd-dddd-dddd-dddd-ddddddddd1a1',
   'dddddddd-dddd-dddd-dddd-dddddddddd04', 'Passt 5 km auch fuer Anfaenger?', 'pending')
on conflict (id) do update set status = excluded.status, message = excluded.message;

-- ── Und der Chat, der aus der bestätigten Anfrage entstanden ist ────────────
-- `aus_aktivitaet = true` mit `post_id` — die HERKUNFT ist eine Tatsache und kein
-- abgeleiteter Wert (harte Regel 56).
insert into chat_threads (id, post_id, aus_aktivitaet, created_at, last_message_at)
values ('dddddddd-dddd-dddd-dddd-ddddddddd1c1', 'dddddddd-dddd-dddd-dddd-ddddddddd1a1',
        true, now() - interval '5 hours', now() - interval '35 minutes')
on conflict (id) do update set last_message_at = excluded.last_message_at;

insert into chat_participants (thread_id, user_id)
select 'dddddddd-dddd-dddd-dddd-ddddddddd1c1', u.id
from auth.users u where lower(u.email) = lower(:'wer')
on conflict do nothing;
insert into chat_participants (thread_id, user_id) values
  ('dddddddd-dddd-dddd-dddd-ddddddddd1c1', 'dddddddd-dddd-dddd-dddd-dddddddddd02')
on conflict do nothing;

-- Die letzte Nachricht kommt vom ANDEREN. Dieselbe Überlegung wie in
-- `20_welt.sql`: Ein Verlauf, der mit der eigenen Nachricht endet, sieht aus wie
-- ein Chat, auf den niemand geantwortet hat.
insert into messages (id, thread_id, sender_id, text, sent_at)
select 'dddddddd-dddd-dddd-dddd-ddddddddd1d1', 'dddddddd-dddd-dddd-dddd-ddddddddd1c1',
       u.id, 'Super! Treffpunkt beim Ausgang, ich bin puenktlich da.',
       now() - interval '4 hours'
from auth.users u where lower(u.email) = lower(:'wer')
on conflict (id) do update set sent_at = excluded.sent_at;

insert into messages (id, thread_id, sender_id, text, sent_at) values
  ('dddddddd-dddd-dddd-dddd-ddddddddd1d2', 'dddddddd-dddd-dddd-dddd-ddddddddd1c1',
   'dddddddd-dddd-dddd-dddd-dddddddddd02', 'Perfekt. Soll ich Wasser mitnehmen?',
   now() - interval '35 minutes')
on conflict (id) do update set sent_at = excluded.sent_at;
