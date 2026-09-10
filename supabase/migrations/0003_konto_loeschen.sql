-- ═══════════════════════════════════════════════════════════════════════════════
--  KONTO LÖSCHEN — Ians Entscheidung 39 vom 2026-09-06.
--
--  Gewählt: **A, „alles mit"** — mit einer Ausnahme, die er selbst gezogen hat.
--
--  ── Die Entscheidung, und warum sie zwei Teile hat ───────────────────────────
--  Gefragt war, was mit den Sachen eines Menschen passiert, der geht. Ian hat A
--  genommen: Posts weg, Nachrichten weg, alles weg. Verworfen sind B („das Profil
--  wird geleert, das Verabredete bleibt") und C („nur Posts ohne Zusagen gehen").
--
--  Den Haken kennt er und hat ihn gewählt: Wer morgen um 17:00 mit vier Leuten
--  verabredet war, sagt allen vieren kommentarlos ab.
--
--  Beim Umsetzen kollidierte A aber mit einer Regel, die schon galt und in
--  `features/groups/gruppe.ts` als „nicht ohne Rückfrage ändern" markiert ist:
--  `GRUENDER_AUSTRITT = 'weitergeben'` (Entscheidung 13). Ein Konto zu löschen IST
--  ein Verlassen. Nachgefragt, und seine Antwort war die genauere von beiden:
--
--      **A gilt für alles, was NUR mir gehört. Eine Gruppe gehört acht Leuten.**
--
--  Damit bleibt Entscheidung 13 unangetastet — die Gruppe geht an das Mitglied, das
--  am längsten dabei ist. Ist niemand sonst drin, löst sie sich auf, und auch das
--  ist keine Ausnahme, sondern dieselbe Regel: Die Gruppe gehört den Leuten darin,
--  und es sind keine mehr da. (Genau so steht es schon im Kopf von `nachfolgerId()`.)
--
--  ── Warum eine FUNKTION und nicht nur Fremdschlüssel ─────────────────────────
--  Das meiste erledigt `on delete cascade` in 0001. Zwei Dinge kann ein
--  Fremdschlüssel nicht:
--    1. eine Gruppe WEITERGEBEN (das ist ein `update`, kein `delete`),
--    2. entscheiden, ob es überhaupt einen Nachfolger gibt.
--  Und harte Regel 6 gilt hier schärfer als je zuvor: Bräche die Verbindung
--  zwischen „Gruppe weitergegeben" und „Konto gelöscht", stünde eine Gruppe unter
--  einem Gründer, den es nicht mehr gibt — dauerhaft, für alle. Eine Funktion ist
--  EINE Transaktion.
-- ═══════════════════════════════════════════════════════════════════════════════

create function public.konto_loeschen() returns void
language plpgsql security definer set search_path = '' as $$
declare
  ich    uuid := auth.uid();
  gruppe record;
  erbe   uuid;
begin
  -- Ohne Anmeldung gibt es kein Konto zu löschen. Die Funktion nimmt bewusst KEINE
  -- ID entgegen: Mit einem Parameter wäre sie ein Werkzeug, mit dem man fremde
  -- Konten löscht, und `security definer` hieße, dass sie es darf.
  if ich is null then
    raise exception 'nicht angemeldet' using errcode = '42501';
  end if;

  -- 1. Gruppen weitergeben — Entscheidung 13, unverändert.
  for gruppe in select id from public.groups where creator_id = ich loop
    -- „Wer am längsten dabei ist" — im Prototyp war das der erste Eintrag in
    -- `memberIds`, hier ist es das kleinste `joined_at`. Das ist die Stelle, an der
    -- die Erbfolge aufhört, an einer Array-Reihenfolge zu hängen, die jeder
    -- unabsichtlich umsortieren kann (harte Regel 33).
    select m.user_id into erbe
      from public.group_members m
     where m.group_id = gruppe.id and m.user_id <> ich
     order by m.joined_at
     limit 1;

    if erbe is null then
      -- AUFLÖSEN, nicht löschen — Ians Entscheidung 41 vom 2026-09-10. Ein `delete`
      -- nähme über `on delete cascade` die Gruppen-Posts ANDERER Leute mit, und
      -- Entscheidung 39 gilt ausdrücklich nur für das, was NUR mir gehört. Die
      -- ganze Begründung steht an der Spalte `aufgeloest_am` in 0001; dieselbe
      -- Stelle in `gruppe_verlassen` (0004) macht es genauso, denn ein Konto zu
      -- löschen IST ein Verlassen.
      update public.groups set aufgeloest_am = now(), creator_id = null
       where id = gruppe.id;
      delete from public.group_requests where group_id = gruppe.id;
      delete from public.group_invites  where group_id = gruppe.id;
    else
      update public.groups set creator_id = erbe where id = gruppe.id;
    end if;
  end loop;

  -- 2. Chats, in denen ich war, verschwinden ganz.
  --
  -- Das folgt aus A und ist keine eigene Entscheidung: Meine Nachrichten gehen
  -- ohnehin (`messages.sender_id` cascade). Übrig bliebe ein Faden mit EINER Person
  -- darin, in den niemand mehr schreiben kann — ein Chat mit einem Gespenst. Der
  -- ist keine Auskunft, sondern nur ein Rest.
  delete from public.chat_threads t
   where exists (select 1 from public.chat_participants p
                  where p.thread_id = t.id and p.user_id = ich);

  -- 3. Das Konto selbst. Alles Übrige hängt an `on delete cascade`: Profil, Posts,
  --    Anfragen, Mitgliedschaften, Folgen, Blocks, Nachrichten.
  --    NICHT daran hängen die MELDUNGEN — dort steht `on delete set null`, und die
  --    Spalte ist deshalb `null`-fähig (siehe den Kommentar in 0001).
  delete from auth.users where id = ich;
end $$;

comment on function public.konto_loeschen() is
  'Löscht das Konto des Aufrufers. Ians Entscheidung 39 (A, „alles mit") — mit '
  'Ausnahme der Gruppen, die nach Entscheidung 13 weitergegeben werden.';

grant execute on function public.konto_loeschen() to authenticated;
