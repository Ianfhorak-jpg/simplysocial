-- ═══════════════════════════════════════════════════════════════════════════════
--  DIE DEMO-WELT WIEDER WEGRÄUMEN — Phase 21.5
--  Aufruf:  bash supabase/demo/anlegen.sh --abraeumen
-- ═══════════════════════════════════════════════════════════════════════════════
--
--  ── Wann das gebraucht wird ─────────────────────────────────────────────────
--  Wenn die App durch ist und die echten Menschen kommen. Die Demo-Welt ist
--  `followers`-sichtbar und stört deshalb niemanden — aber sie steht in derselben
--  Datenbank, sie zählt in jeder Statistik mit, und *„was dort einmal steht, steht
--  auch im Backup"*. Sie soll gehen können, und zwar vollständig.
--
--  ── Gelöscht wird nach ID-MUSTER, nicht über Verknüpfungen ──────────────────
--  Das ist die Lehre aus `52_abraeumen.sql` (FALLEN.md): Jenes Skript löscht
--  Chat-Fäden über ihre TEILNEHMER. Bricht der Lauf mittendrin ab, sind die Konten
--  schon weg, `chat_participants` mit ihnen — und die Fäden liegen für immer
--  herrenlos da, weil die Abfrage, die sie finden sollte, nichts mehr findet.
--
--  Hier trägt jede erzeugte Zeile ein `dddddddd-`-Präfix in ihrer EIGENEN ID. Ein
--  halb abgebrochener Lauf ist damit kein Sonderfall: Der nächste findet genau
--  dasselbe wieder, egal wie weit der vorige kam. Und es fasst nichts an, was
--  nicht von hier stammt (harte Regel 83) — `gen_random_uuid()` erzeugt niemals
--  acht gleiche Anfangszeichen.

delete from messages          where id::text        like 'dddddddd-%';
delete from chat_participants where thread_id::text like 'dddddddd-%';
delete from chat_threads      where id::text        like 'dddddddd-%';
delete from join_requests     where id::text        like 'dddddddd-%';
delete from posts             where id::text        like 'dddddddd-%';
delete from follows           where follower_id::text like 'dddddddd-%'
                                 or followee_id::text like 'dddddddd-%';
delete from profiles          where id::text        like 'dddddddd-%';
-- Zuletzt, und es räumt per Cascade auch alles nach, was oben jemand vergessen
-- hätte: `profiles.id` hängt mit `on delete cascade` an dieser Tabelle.
delete from auth.users        where id::text        like 'dddddddd-%';
