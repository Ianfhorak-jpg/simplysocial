-- ═══════════════════════════════════════════════════════════════════════════════
--  0005 — REALTIME: welche Änderungen die App erfahren darf
--  Phase 20.4-b, 2026-09-12
-- ═══════════════════════════════════════════════════════════════════════════════
--
--  ── Warum es diese Datei überhaupt braucht ───────────────────────────────────
--  Die Publication `supabase_realtime` ist in einem frischen Projekt LEER. Ein Abo
--  auf `postgres_changes` verbindet sich dann sauber, meldet `SUBSCRIBED` — und
--  liefert nie ein Ereignis. Kein Fehler, keine Warnung. Für die App sähe das aus,
--  als passierte in Wien nichts. Dieselbe Familie wie „ein Kamerabefehl vor
--  `onMapReady` verpufft still": **Ein Aufruf, der nichts tut, sieht aus wie einer,
--  der nicht stattfindet.**
--
--  ── ELF Tabellen, nicht dreizehn — und die zwei fehlenden sind die Aussage ────
--
--  `blocks` steht NICHT drin, und das ist harte Regel 10 in ihrer schärfsten Form:
--  *Wer blockiert wird, darf es nicht merken.* Supabase wendet RLS auf
--  `postgres_changes` bei INSERT und UPDATE an — **bei DELETE nicht.** Dort geht
--  der Primärschlüssel der gelöschten Zeile an ALLE Abonnenten der Tabelle, und
--  der Primärschlüssel von `blocks` ist `(blocker_id, blocked_id)`. Ein
--  Entblocken wäre damit eine Nachricht an den Blockierten, dass die Kante je
--  bestanden hat. Die Tabelle ändert sich ohnehin nur durch eigenes Handeln, und
--  danach lädt die App von sich aus neu.
--
--  `reports` steht NICHT drin, aus dem verwandten Grund: Eine Meldung geht nur den
--  Melder an (`melder_sieht_eigene`, ergänzt in 20.4-a), und sie entsteht nur durch
--  sein eigenes Tun. Es gibt niemanden, dem sie ungefragt mitzuteilen wäre.
--
--  ── `REPLICA IDENTITY` bleibt DEFAULT ────────────────────────────────────────
--  Auf `FULL` gestellt schickt Postgres bei jedem UPDATE und DELETE **alle Spalten
--  der ALTEN Zeile** mit. Das ist die Einstellung, die überall empfohlen wird
--  („dann hat man `payload.old`"), und genau deshalb steht sie hier als
--  ausdrückliches NEIN: Die App braucht `payload` nicht — sie braucht nur zu
--  wissen, DASS sich etwas geändert hat, und lädt dann durch die Policies neu.
--  Was sie nicht braucht, darf nicht über die Leitung gehen.
--
--  ── Warum der Anstoß nur ein Signal ist ──────────────────────────────────────
--  `data/realtime.ts` liest aus keinem Ereignis auch nur ein Feld. Damit hängt die
--  Sichtbarkeit an EINER Stelle — den 33 Policies — und nicht an zwei. Ein
--  Handler, der `payload.new` in den Speicher legte, wäre eine zweite Fassung
--  derselben Regel, und die schwächere: Realtime prüft RLS an anderen Stellen
--  anders als PostgREST.
-- ═══════════════════════════════════════════════════════════════════════════════

alter publication supabase_realtime add table
  public.profiles,
  public.follows,
  public.posts,
  public.groups,
  public.group_members,
  public.group_requests,
  public.group_invites,
  public.join_requests,
  public.chat_threads,
  public.chat_participants,
  public.messages;

-- Gegenprobe in der Migration selbst: Stehen genau elf drin, und sind `blocks` und
-- `reports` wirklich draußen? Eine Migration, die ihr Ergebnis nicht misst, ist
-- eine Absicht — die Lehre vom 2026-09-11 (`BUILD SUCCEEDED` mit falschem Profil).
--
-- Die REIHENFOLGE der beiden Prüfungen ist keine Geschmacksfrage, und sie war beim
-- ersten Versuch falsch herum. Stand der Zähler vorn, brach er bei `blocks` mit
-- „12 statt 11" ab — und die Regel-10-Prüfung dahinter kam nie dran. Sie wäre also
-- ungeprüft geblieben, und der teure Fall ist ohnehin ein anderer: Wer `blocks`
-- gegen `follows` TAUSCHT, bleibt bei elf. **Ein Wächter hinter einem anderen ist
-- ein ungeprüfter Wächter.** Dieselbe Familie wie die Team-Prüfung in
-- `geraet-bauen.sh`, die still eine 0 ergab.
do $$
declare
  anzahl int;
  verboten text;
begin
  select string_agg(tablename, ', ') into verboten
    from pg_publication_tables
   where pubname = 'supabase_realtime'
     and schemaname = 'public'
     and tablename in ('blocks', 'reports');
  if verboten is not null then
    raise exception 'Realtime: % darf NICHT in der Publication stehen (harte Regel 10)', verboten;
  end if;

  select count(*) into anzahl
    from pg_publication_tables
   where pubname = 'supabase_realtime' and schemaname = 'public';
  if anzahl <> 11 then
    raise exception 'Realtime: % Tabellen in der Publication, erwartet 11', anzahl;
  end if;
end $$;
