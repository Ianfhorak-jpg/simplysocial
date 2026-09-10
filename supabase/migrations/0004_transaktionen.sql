-- ═══════════════════════════════════════════════════════════════════════════════
--  DIE SCHREIBSEITE — Phase 20.5, der Teil, der ohne Konto zu beweisen ist.
--
--  PLAN.md, Abschnitt 5b, 20.5: „23 Stellen rufen `aendern()`. Bei den meisten ist
--  es eine Zeile mehr. Bei dreien nicht." Beim Bauen sind es SIEBEN geworden, und
--  die vier zusätzlichen hat nicht jemand gefunden, sondern `0002_policies.sql`
--  aufgeschrieben:
--
--      grant select on group_members  to authenticated;   -- kein insert, kein delete
--      grant select on chat_threads   to authenticated;   -- kein insert, kein update
--      grant select on chat_participants to authenticated;
--
--  Ein fehlender Grant ist in diesem Projekt keine Lücke, sondern eine ZUSAGE: Es
--  gibt genau einen Weg, und der prüft vorher. Solange diese Datei fehlt, kann
--  niemand einer Gruppe beitreten, keine Gruppe gründen und keinen Chat anfangen —
--  auch nicht rechtmäßig. **Die Rechteliste hat die Arbeitsliste geschrieben**,
--  dieselbe Technik wie `IconName` in Phase 14 (Typ) und das Löschen von
--  `CURRENT_USER_ID` in 20.3-a (Export), nur mit Rechten.
--
--  ── Warum überhaupt Funktionen und nicht mehrere Aufrufe aus der App ──────────
--  Harte Regel 6 („was zusammengehört, in EINEM `aendern`") wird hier von einer
--  OBERFLÄCHEN-Regel zu einer DATEN-Regel. Im Prototyp heißt sie: React zeichnet
--  keinen Zwischenzustand. Mit einer Datenbank heißt sie: es BLEIBT keiner stehen.
--  Bricht die Verbindung nach dem ersten Schreibvorgang, wäre eine Anfrage
--  bestätigt und der Platz noch frei — dauerhaft, für alle, bis jemand es von Hand
--  richtet. Eine Funktion ist EINE Transaktion: ganz passiert oder gar nicht.
--
--  ── Die Bauart ist die von `konto_loeschen` (0003) ───────────────────────────
--  `security definer`, damit die Funktion darf, was der Aufrufer nicht darf; und
--  `set search_path = ''` ist Pflicht, sonst schiebt jemand mit eigenem Schema eine
--  Tabelle davor (die Begründung steht ausgeschrieben in 0002, harte Regel 54).
--  Jede Funktion nimmt deshalb auch KEINE Nutzer-ID entgegen — sie liest `auth.uid()`
--  selbst. Mit einem Parameter wäre sie ein Werkzeug, mit dem man fremde Konten
--  bedient, und `security definer` hieße, dass sie es darf.
--
--  ── Was hier NICHT steht ─────────────────────────────────────────────────────
--  Keine Regel. Was ein Block bewirkt, steht in `features/safety/block.ts`; wer
--  eine Gruppe erbt, in `features/groups/gruppe.ts`; ob ein Post nach der letzten
--  Zusage zugeht, in `features/requests/logic.ts`. Diese Datei FÜHRT sie aus, an
--  der Stelle, an der sie auch gegen jemanden hält, der nicht die App benutzt.
--  Jede Stelle, an der eine Entscheidung Ians steckt, ist unten benannt.
-- ═══════════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════════════
--  1. EINE ANFRAGE BESTÄTIGEN — der wichtigste Klick der App
--
--  Die SQL-Fassung von `anfrageBestaetigen()` in `features/requests/hooks.ts`.
--  Vier Dinge passieren gleichzeitig und müssen zusammen passieren:
--    1. Die Anfrage wird `accepted`.
--    2. Der Post bekommt einen Platz weniger und schließt sich, wenn es der letzte
--       war (`postNachBestaetigung`, PLAN.md Phase 4 — nie offen gewesen).
--    3. Der Chat entsteht (`mitChatFuerTreffen` in `features/chat/logic.ts`).
--    4. Was mit den ÜBRIGEN Anfragen passiert — Ians Entscheidung 3, siehe unten.
-- ═══════════════════════════════════════════════════════════════════════════════

create function public.anfrage_bestaetigen(anfrage_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  ich      uuid := auth.uid();
  a        record;
  p        record;
  gefuellt integer;
  neuer    public.post_status;
  faden    uuid;
begin
  if ich is null then
    raise exception 'nicht angemeldet' using errcode = '42501';
  end if;

  select * into a from public.join_requests where id = anfrage_id;
  if not found then
    raise exception 'Anfrage gibt es nicht' using errcode = '42501';
  end if;

  -- ── `for update` ist der Ersatz für die zwei Sicherheitsnetze der App ────────
  -- In `hooks.ts` stehen an dieser Stelle zwei Prüfungen „gegen den Doppelklick auf
  -- Web". Sie waren richtig und sie reichen hier NICHT: Zwei Bestätigungen können
  -- wirklich gleichzeitig laufen, beide lesen `spots_filled = 1` bei `spots_total
  -- = 2`, beide finden einen Platz frei, und danach steht 3 von 2. Die Zeilensperre
  -- macht daraus ein Nacheinander — die zweite liest, was die erste geschrieben hat.
  --
  -- Der CHECK `plaetze_plausibel` in 0001 fängt den Rest ab, aber als ABBRUCH mit
  -- einer Fehlermeldung. Ein Poster, der zweimal tippt, soll keinen Fehler sehen,
  -- sondern beim zweiten Mal ein „kein Platz frei".
  select * into p from public.posts where id = a.post_id for update;
  if not found then
    raise exception 'Post gibt es nicht' using errcode = '42501';
  end if;

  -- Nur der Verfasser bestätigt. Das ist dieselbe Bedingung wie in der Policy
  -- `anfragen_beantworten` — sie steht hier NOCH einmal, weil `security definer`
  -- die Policies umgeht. Eine Funktion, die sich auf die Policy darunter verlässt,
  -- verlässt sich auf etwas, das für sie ausgeschaltet ist.
  if p.author_id <> ich then
    raise exception 'nur der Verfasser bestätigt' using errcode = '42501';
  end if;

  -- Schon bestätigt oder schon abgelehnt: nichts tun, aber sagen, dass nichts
  -- geschah. Im Prototyp war das ein stilles `return {}` — dort ist ein zweiter
  -- Klick folgenlos, hier soll der Aufrufer den Unterschied merken.
  if a.status <> 'pending' then
    raise exception 'Anfrage ist nicht mehr offen' using errcode = '42501';
  end if;

  if p.spots_filled >= p.spots_total then
    raise exception 'kein Platz frei' using errcode = '42501';
  end if;

  update public.join_requests set status = 'accepted' where id = anfrage_id;

  -- `postNachBestaetigung()`: ein Platz weniger, und `past` bleibt `past` — was der
  -- Verfasser selbst geschlossen hat, macht eine Bestätigung nicht wieder auf.
  gefuellt := p.spots_filled + 1;
  neuer := case
             when p.status = 'past' then 'past'::public.post_status
             when gefuellt >= p.spots_total then 'full'::public.post_status
             else 'open'::public.post_status
           end;
  update public.posts set spots_filled = gefuellt, status = neuer where id = p.id;

  -- ── Ians Entscheidung 3: WARTELISTE, STILL ──────────────────────────────────
  -- Ist der Post jetzt voll, bleiben die übrigen offenen Anfragen unverändert
  -- stehen. Deshalb steht hier keine Anweisung — und trotzdem dieser Absatz:
  -- `uebrigeAnfragenBeiVollemPost()` ist im Prototyp eine eigene Funktion, die ihre
  -- Liste unverändert zurückgibt, „damit die Entscheidung auffindbar bleibt".
  -- Dasselbe hier. Für A) automatisch absagen stünde an dieser Stelle:
  --
  --   if gefuellt >= p.spots_total then
  --     update public.join_requests set status = 'declined'
  --      where post_id = p.id and status = 'pending';
  --   end if;
  --
  -- **Nicht ohne Rückfrage.**

  -- ── Der Chat ────────────────────────────────────────────────────────────────
  -- Ein Post, ein Gast, ein Chat (`mitChatFuerTreffen`): Sagt jemand ab und fragt
  -- später erneut an, kommt der alte Verlauf zurück, statt dass ein zweiter leerer
  -- Faden danebensteht.
  select t.id into faden
    from public.chat_threads t
    join public.chat_participants cp on cp.thread_id = t.id
   where t.post_id = p.id and cp.user_id = a.from_user_id
   limit 1;

  if faden is null then
    -- `aus_aktivitaet` ist eine TATSACHE über die Entstehung und kein abgeleiteter
    -- Wert (harte Regel 56). Sie steht hier fest auf `true` und wird nie aus
    -- `post_id` zurückgerechnet — sonst würde aus diesem Chat lautlos ein
    -- Direktchat, sobald jemand den Post löscht, und dann gälte plötzlich
    -- `SCHREIB_REGEL = 'gegenseitig'` zwischen zwei Leuten, die sich getroffen haben.
    insert into public.chat_threads (post_id, aus_aktivitaet)
         values (p.id, true)
      returning id into faden;

    -- Im Prototyp immer zu zweit. Bei mehreren Plätzen entsteht pro Zusage ein
    -- eigener Faden — ein Gruppenchat mit Leuten, die einander nicht kennen, wäre
    -- eine andere App (`chat/logic.ts`, dort steht die Stelle zum Ändern).
    insert into public.chat_participants (thread_id, user_id)
         values (faden, p.author_id), (faden, a.from_user_id);
  end if;

  return faden;
end $$;

comment on function public.anfrage_bestaetigen(uuid) is
  'Bestätigt eine Anfrage: Anfrage, Platz und Chat in EINER Transaktion (harte '
  'Regel 6). Gibt die Faden-ID für den Match-Screen zurück.';


-- ═══════════════════════════════════════════════════════════════════════════════
--  2. BLOCKIEREN — Ians Entscheidung 7 vom 2026-09-01: „alles weg"
--
--  Die SQL-Fassung von `blockieren()` in `features/safety/hooks.ts`.
--  `BLOCK_WIRKUNG = HART` heißt `{ chat: 'weg', verabredung: 'abgesagt' }`. Die
--  Regel steht in `features/safety/block.ts` und NUR dort; hier wird sie ausgeführt.
--  Wer sie dort ändert, ändert sie hier mit — die drei markierten Stellen unten.
-- ═══════════════════════════════════════════════════════════════════════════════

create function public.blockieren(wen uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  ich uuid := auth.uid();
begin
  if ich is null then
    raise exception 'nicht angemeldet' using errcode = '42501';
  end if;

  -- Sich selbst blockieren gibt es nicht. Über die Oberfläche unmöglich (das eigene
  -- Profil zeigt den Knopf nicht), über einen getippten Aufruf schon.
  if wen = ich then
    raise exception 'sich selbst blockiert man nicht' using errcode = '42501';
  end if;

  if not exists (select 1 from public.profiles where id = wen) then
    raise exception 'diese Person gibt es nicht' using errcode = '42501';
  end if;

  -- 1. Der Block selbst. EINSEITIG (harte Regel 10): Wer blockiert wird, darf es
  --    nicht merken, also steht die Zeile nur beim Blockierenden. Gefragt wird
  --    trotzdem in beide Richtungen — `regel.sind_blockiert()` in 0002.
  --    `on conflict` macht ein zweites Blockieren folgenlos statt zu einem Fehler.
  insert into public.blocks (blocker_id, blocked_id) values (ich, wen)
    on conflict do nothing;

  -- 2. Die Folge-Beziehung fällt in BEIDE Richtungen weg. Das ist KEINE Entscheidung
  --    Ians, sondern überall so: Bliebe sie stehen, dürfte die Person über
  --    `posts_lesen` weiter meine Follower-Posts sehen — ein Block, der die Person
  --    weiter hereinlässt, ist keiner.
  delete from public.follows
   where (follower_id = ich and followee_id = wen)
      or (follower_id = wen and followee_id = ich);

  -- 3. Offene Anfragen zwischen uns verschwinden. ENTFERNT und nicht abgelehnt:
  --    Eine Absage ist etwas, das der andere SIEHT. Verschwinden ist das Stillere,
  --    und still ist bei einem Block richtig.
  delete from public.join_requests r
   where r.status = 'pending'
     and exists (select 1 from public.posts p where p.id = r.post_id
                  and ((r.from_user_id = wen and p.author_id = ich)
                    or (r.from_user_id = ich and p.author_id = wen)));

  -- ── Ians Regel, Teil 1: `verabredung = 'abgesagt'` ──────────────────────────
  -- Die Zusage wird zurückgenommen und der Platz wird wieder frei. Ein Post, der
  -- dadurch nicht mehr voll ist, geht wieder auf — `past` bleibt `past`, genau wie
  -- beim Bestätigen.
  --
  -- Der Platz wird über eine ZWISCHENTABELLE gezählt und nicht Zeile für Zeile:
  -- Bei zwei abgesagten Zusagen auf demselben Post würde ein einfaches `-1` je
  -- Zeile in einem einzigen `update` nur einmal wirken.
  with betroffen as (
    select r.id, r.post_id
      from public.join_requests r
      join public.posts p on p.id = r.post_id
     where r.status = 'accepted'
       and ((r.from_user_id = wen and p.author_id = ich)
         or (r.from_user_id = ich and p.author_id = wen))
  ),
  abgesagt as (
    update public.join_requests set status = 'declined'
     where id in (select id from betroffen)
     returning post_id
  ),
  frei as (
    select post_id, count(*)::integer as anzahl from abgesagt group by post_id
  )
  update public.posts p
     set spots_filled = greatest(0, p.spots_filled - frei.anzahl),
         status = case
                    when p.status = 'past' then 'past'::public.post_status
                    when greatest(0, p.spots_filled - frei.anzahl) >= p.spots_total
                      then 'full'::public.post_status
                    else 'open'::public.post_status
                  end
    from frei
   where p.id = frei.post_id;

  -- ── Ians Regel, Teil 2: `chat = 'weg'` ──────────────────────────────────────
  -- Der Faden verschwindet, die Nachrichten hängen mit `on delete cascade` daran.
  --
  -- Bei `stillgelegt` und `bleibt` stünde hier NICHTS: Der Chat-Screen fragt dann
  -- selbst nach dem Block und nimmt das Eingabefeld weg. Das ist mit Absicht so —
  -- der Block ist die einzige Wahrheit, ein zusätzliches Feld `gesperrt` am Faden
  -- wäre eine zweite, die beim Aufheben nicht mitkommt.
  delete from public.chat_threads t
   where exists (select 1 from public.chat_participants a
                  where a.thread_id = t.id and a.user_id = ich)
     and exists (select 1 from public.chat_participants b
                  where b.thread_id = t.id and b.user_id = wen);
end $$;

comment on function public.blockieren(uuid) is
  'Blockiert eine Person. Ians Entscheidung 7 (HART): Chat weg, bestätigte '
  'Verabredung abgesagt, Platz wieder frei. Die Regel steht in safety/block.ts.';


-- ═══════════════════════════════════════════════════════════════════════════════
--  3. EINE GRUPPE VERLASSEN — Ians Entscheidungen 12 und 13 vom 2026-09-02
--
--  Die SQL-Fassung von `gruppeVerlassen()` in `features/groups/hooks.ts`.
--    `AUSTRITT_WIRKUNG  = 'posts-bleiben'`  (12)
--    `GRUENDER_AUSTRITT = 'weitergeben'`    (13) — an das Mitglied, das am längsten
--                                                 dabei ist.
--  Beide stehen in `features/groups/gruppe.ts` und tragen dort „nicht ohne
--  Rückfrage". Dieselbe Erbfolge steht schon in `konto_loeschen()` (0003) — ein
--  Konto zu löschen IST ein Verlassen.
-- ═══════════════════════════════════════════════════════════════════════════════

create function public.gruppe_verlassen(gruppe_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  ich  uuid := auth.uid();
  g    record;
  erbe uuid;
begin
  if ich is null then
    raise exception 'nicht angemeldet' using errcode = '42501';
  end if;

  -- `for update`, weil gleich entschieden wird, wem die Gruppe gehört. Zwei
  -- gleichzeitige Austritte dürfen nicht beide denselben Nachfolger finden.
  select * into g from public.groups where id = gruppe_id for update;
  if not found then
    raise exception 'diese Gruppe gibt es nicht' using errcode = '42501';
  end if;

  if not exists (select 1 from public.group_members
                  where group_id = gruppe_id and user_id = ich) then
    raise exception 'du bist nicht in dieser Gruppe' using errcode = '42501';
  end if;

  if g.creator_id = ich then
    -- „Wer am längsten dabei ist" — im Prototyp der erste Eintrag in `memberIds`,
    -- hier das kleinste `joined_at`. Genau hier hört die Erbfolge auf, an einer
    -- Array-Reihenfolge zu hängen, die jeder unabsichtlich umsortieren kann
    -- (harte Regel 33).
    select m.user_id into erbe
      from public.group_members m
     where m.group_id = gruppe_id and m.user_id <> ich
     order by m.joined_at
     limit 1;

    if erbe is null then
      -- Gründer ohne Nachfolger heißt: niemand mehr da. Die Gruppe hört auf, und
      -- das ist keine Ausnahme von Entscheidung 13, sondern dieselbe Regel — die
      -- Gruppe gehört den Leuten darin, und es sind keine mehr da.
      --
      -- ── Warum `update` und nicht `delete` — Ians Entscheidung 41 ─────────────
      -- Ein `delete` nähme über `on delete cascade` die Gruppen-Posts mit. Ian hat
      -- am 2026-09-10 entschieden, dass sie stehen bleiben (dieselbe Regel wie
      -- `AUSTRITT_WIRKUNG`, Entscheidung 12). Der Weg dorthin ist NICHT
      -- `on delete set null` — das ergäbe einen Post mit `visibility_kind = 'group'`
      -- ohne Gruppen-ID, also genau den Zustand, den harte Regel 31 undarstellbar
      -- macht, und der CHECK `sicht_vollstaendig` bräche den Vorgang ab.
      -- Die ganze Begründung steht an der Spalte in 0001.
      -- `creator_id = null`: Eine aufgelöste Gruppe hat keine Mitglieder, also auch
      -- keinen Chef. Bliebe ich als Gründer stehen, dürfte ich sie über die Policy
      -- `gruppe_aendern` weiter umbenennen — ein Recht an etwas, das ich gerade
      -- verlassen habe. Der CHECK `chef_oder_aufgeloest` in 0001 lässt das genau
      -- hier und nirgends sonst zu.
      update public.groups set aufgeloest_am = now(), creator_id = null
       where id = gruppe_id;
      delete from public.group_members where group_id = gruppe_id and user_id = ich;

      -- Was auf die Gruppe zeigte und niemanden mehr erreicht, geht trotzdem: Eine
      -- Anfrage oder Einladung an eine Gruppe, die aufgehört hat, wäre eine Zeile
      -- im Anfragen-Tab, die niemand beantworten kann und die niemand wegbekommt.
      -- Beim `delete` erledigte das der Fremdschlüssel; jetzt steht es hier.
      delete from public.group_requests where group_id = gruppe_id;
      delete from public.group_invites  where group_id = gruppe_id;
      return;
    end if;

    update public.groups set creator_id = erbe where id = gruppe_id;
  end if;

  delete from public.group_members where group_id = gruppe_id and user_id = ich;

  -- `AUSTRITT_WIRKUNG = 'posts-bleiben'`: Meine Posts für diese Gruppe bleiben
  -- stehen. Deshalb steht hier keine Anweisung. Für „Posts löschen" stünde:
  --   delete from public.posts
  --    where author_id = ich and visibility_group_id = gruppe_id;
  -- Verworfen, weil das fremde Verabredungen absagt wegen einer Sache, die nichts
  -- damit zu tun hat. **Nicht ohne Rückfrage.**

  -- Meine eigene alte Anfrage auf diese Gruppe ist erledigt — ich war ja drin. Ohne
  -- das stünde nach dem Austritt „Anfrage läuft" bei einer Gruppe, die ich gerade
  -- verlassen habe.
  delete from public.group_requests
   where group_id = gruppe_id and from_user_id = ich;
end $$;

comment on function public.gruppe_verlassen(uuid) is
  'Verlässt eine Gruppe. Ians Entscheidung 13: der Gründer vererbt an das Mitglied '
  'mit dem kleinsten joined_at; ist keines da, löst sich die Gruppe auf.';


-- ═══════════════════════════════════════════════════════════════════════════════
--  4. EINE GRUPPE GRÜNDEN
--
--  Die SQL-Fassung von `gruppeErstellen()`. Sie steht hier und nicht als schlichtes
--  `insert into groups`, weil beim Gründen ZWEI Zeilen entstehen: die Gruppe und die
--  Mitgliedschaft des Gründers. Und `group_members` hat kein Insert-Recht.
--
--  Das ist kein Umstand, sondern die Absicherung von harter Regel 33: Der Gründer
--  ist Mitglied, und zwar mit dem KLEINSTEN `joined_at`. Entstünde die
--  Mitgliedschaft in einem zweiten Aufruf, gäbe es einen Moment mit einer Gruppe
--  ohne Mitglieder — und `nachfolgerId()` liest genau diese Liste.
-- ═══════════════════════════════════════════════════════════════════════════════

create function public.gruppe_gruenden(
  p_name        text,
  p_beschreibung text,
  p_kategorie   public.activity_category,
  p_offen       boolean,
  p_bezirk      text
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  ich uuid := auth.uid();
  neu uuid;
begin
  if ich is null then
    raise exception 'nicht angemeldet' using errcode = '42501';
  end if;

  if length(btrim(p_name)) = 0 then
    raise exception 'eine Gruppe braucht einen Namen' using errcode = '22000';
  end if;

  insert into public.groups (name, description, category, creator_id, offen, district)
       values (btrim(p_name), btrim(p_beschreibung), p_kategorie, ich, p_offen, p_bezirk)
    returning id into neu;

  -- Der Gründer ist Mitglied, und zwar an erster Stelle. Beides trägt: Er soll seine
  -- eigene Gruppe im Feed sehen, und die Reihenfolge ist die Grundlage für Ians
  -- Erbregel. `joined_at` bekommt hier absichtlich `now()` aus derselben
  -- Transaktion — damit ist er nachweislich der Älteste.
  insert into public.group_members (group_id, user_id) values (neu, ich);

  return neu;
end $$;

comment on function public.gruppe_gruenden(text, text, public.activity_category, boolean, text) is
  'Legt eine Gruppe an und macht den Gründer zum ersten Mitglied — in EINER '
  'Transaktion, damit nie eine Gruppe ohne Mitglieder existiert (harte Regel 33).';


-- ═══════════════════════════════════════════════════════════════════════════════
--  5. EINE BEITRITTS-ANFRAGE BESTÄTIGEN — der Gründer nimmt jemanden auf
--
--  Die SQL-Fassung von `beitrittBestaetigen()`. `BEITRITT = 'anfrage'` (Ians
--  Entscheidung 16): Man kommt auf Anfrage hinein, der Gründer bestätigt — dasselbe
--  Muster wie „Bin dabei".
--
--  ⚠️ Hier ist `istGruender()` richtig und `darfEinladen()` FALSCH — das Gegenstück
--  zu harter Regel 38. Aufnehmen darf nur der Gründer, einladen jedes Mitglied. Die
--  Verwechslung fällt in einer frisch gegründeten Gruppe nie auf.
-- ═══════════════════════════════════════════════════════════════════════════════

create function public.beitritt_bestaetigen(anfrage_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  ich uuid := auth.uid();
  a   record;
  g   record;
begin
  if ich is null then
    raise exception 'nicht angemeldet' using errcode = '42501';
  end if;

  select * into a from public.group_requests where id = anfrage_id for update;
  if not found then
    raise exception 'Anfrage gibt es nicht' using errcode = '42501';
  end if;

  select * into g from public.groups where id = a.group_id;
  if g.creator_id <> ich then
    raise exception 'nur der Gründer nimmt auf' using errcode = '42501';
  end if;

  -- In eine Gruppe, die aufgehört hat, nimmt niemand mehr jemanden auf. Der
  -- `creator_id` steht dort weiter — er ist die Erinnerung daran, wem sie gehörte,
  -- kein laufendes Recht (Ians Entscheidung 41, siehe 0001).
  if g.aufgeloest_am is not null then
    raise exception 'diese Gruppe gibt es nicht mehr' using errcode = '42501';
  end if;

  if a.status <> 'pending' then
    raise exception 'Anfrage ist nicht mehr offen' using errcode = '42501';
  end if;

  update public.group_requests set status = 'accepted' where id = anfrage_id;

  -- `on conflict do nothing`: Wer über eine Einladung schon drin ist, bleibt drin
  -- und behält sein altes `joined_at`. Ein neues würde die Erbfolge verschieben.
  insert into public.group_members (group_id, user_id) values (a.group_id, a.from_user_id)
    on conflict do nothing;
end $$;

comment on function public.beitritt_bestaetigen(uuid) is
  'Der Gründer nimmt jemanden auf: Anfrage und Mitgliedschaft in EINER Transaktion.';


-- ═══════════════════════════════════════════════════════════════════════════════
--  6. EINE EINLADUNG ANNEHMEN
--
--  Die SQL-Fassung von `einladungAnnehmen()`. Spiegelbild von 5, aber mit dem
--  ANDEREN Menschen als Aufrufer — annehmen darf nur der Eingeladene.
--
--  Harte Regel 39 ist hier sichtbarer als in TypeScript: Es sind zwei Tabellen und
--  zwei Funktionen, weil es zwei verschiedene Vorgänge sind. Eine gemeinsame
--  Funktion mit einem Richtungsfeld hätte in jedem Aufruf einen Parameter, der
--  nichts bedeutet.
-- ═══════════════════════════════════════════════════════════════════════════════

create function public.einladung_annehmen(einladung_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  ich uuid := auth.uid();
  e   record;
begin
  if ich is null then
    raise exception 'nicht angemeldet' using errcode = '42501';
  end if;

  select * into e from public.group_invites where id = einladung_id for update;
  if not found then
    raise exception 'Einladung gibt es nicht' using errcode = '42501';
  end if;

  if e.to_user_id <> ich then
    raise exception 'diese Einladung ist nicht an dich' using errcode = '42501';
  end if;

  if e.status <> 'pending' then
    raise exception 'Einladung ist nicht mehr offen' using errcode = '42501';
  end if;

  if exists (select 1 from public.groups g
              where g.id = e.group_id and g.aufgeloest_am is not null) then
    raise exception 'diese Gruppe gibt es nicht mehr' using errcode = '42501';
  end if;

  -- Wer inzwischen blockiert ist, kommt nicht über eine alte Einladung herein. Die
  -- Policy `einladung_aussprechen` prüft das beim AUSSPRECHEN; zwischen Aussprechen
  -- und Annehmen liegt aber Zeit, und in der kann jemand blockieren.
  if regel.sind_blockiert(e.from_user_id, ich) then
    raise exception 'diese Einladung gilt nicht mehr' using errcode = '42501';
  end if;

  update public.group_invites set status = 'accepted' where id = einladung_id;

  insert into public.group_members (group_id, user_id) values (e.group_id, ich)
    on conflict do nothing;
end $$;

comment on function public.einladung_annehmen(uuid) is
  'Der Eingeladene nimmt an: Einladung und Mitgliedschaft in EINER Transaktion.';


-- ═══════════════════════════════════════════════════════════════════════════════
--  7. EINEN DIREKTCHAT ÖFFNEN — Ians Entscheidungen 11 und 18
--
--  Die SQL-Fassung von `direktChatOeffnen()`. `SCHREIB_REGEL = 'gegenseitig'`
--  (Entscheidung 18, `features/chat/direkt.ts`): schreiben darf, wem die andere
--  Person auch folgt.
--
--  ── Warum der Faden hier entsteht und nicht beim Senden ─────────────────────
--  `ENTSTEHUNG = 'beim-senden'` (Entscheidung 11) ist eine Regel über die ANZEIGE,
--  nicht über die Daten: Der Faden liegt schon da, er ist „der Raum, in dem getippt
--  wird", und `useChatListe()` blendet ihn aus, solange keine Nachricht darin
--  steht. Genau so steht es im Prototyp, und es bleibt genau so — sonst müsste die
--  erste Nachricht den Faden miterzeugen, und dann gäbe es zwei Stellen, an denen
--  Fäden entstehen.
-- ═══════════════════════════════════════════════════════════════════════════════

create function public.direktchat_oeffnen(wem uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  ich   uuid := auth.uid();
  faden uuid;
begin
  if ich is null then
    raise exception 'nicht angemeldet' using errcode = '42501';
  end if;

  -- Sich selbst schreiben gibt es nicht. Über die Oberfläche unmöglich (das eigene
  -- Profil leitet um), über einen getippten Aufruf schon.
  if wem = ich then
    raise exception 'dir selbst schreibst du nicht' using errcode = '42501';
  end if;

  if regel.sind_blockiert(ich, wem) then
    raise exception 'das geht nicht' using errcode = '42501';
  end if;

  -- `SCHREIB_REGEL = 'gegenseitig'`. Für `'jeder'` fiele diese Prüfung weg, für
  -- `'schon-getroffen'` stünde hier eine Abfrage auf `join_requests` mit
  -- `status = 'accepted'` in beiden Richtungen. **Nicht ohne Rückfrage.**
  if not regel.folgen_sich_gegenseitig(ich, wem) then
    raise exception 'ihr müsst einander folgen' using errcode = '42501';
  end if;

  -- Je Personenpaar genau EINER (`mitDirektChat`). Anders als bei Aktivitäts-Chats,
  -- wo pro Post und Gast ein eigener Faden entsteht: Ein Direktchat hängt an nichts
  -- als an den zwei Menschen. Ein zweiter daneben wäre ein zweites Postfach mit
  -- derselben Person.
  select t.id into faden
    from public.chat_threads t
   where t.aus_aktivitaet = false
     and exists (select 1 from public.chat_participants a
                  where a.thread_id = t.id and a.user_id = ich)
     and exists (select 1 from public.chat_participants b
                  where b.thread_id = t.id and b.user_id = wem)
   limit 1;

  if faden is null then
    insert into public.chat_threads (post_id, aus_aktivitaet) values (null, false)
      returning id into faden;
    insert into public.chat_participants (thread_id, user_id)
         values (faden, ich), (faden, wem);
  end if;

  return faden;
end $$;

comment on function public.direktchat_oeffnen(uuid) is
  'Öffnet den Direktchat mit einer Person — je Paar genau einen. Setzt Ians '
  'SCHREIB_REGEL = gegenseitig durch (features/chat/direkt.ts).';


-- ═══════════════════════════════════════════════════════════════════════════════
--  8. `last_message_at` — ein TRIGGER, keine achte Funktion
--
--  `nachrichtSenden()` ändert zwei Dinge: die Nachricht und das `lastMessageAt` am
--  Faden (harte Regel 6, dort ausdrücklich genannt). `chat_threads` hat aber kein
--  Update-Recht — nach der Logik von oben wäre das die achte Funktion.
--
--  Ein Trigger ist hier das Bessere, und der Grund ist nicht Bequemlichkeit:
--
--    • Er läuft in DERSELBEN Transaktion wie das `insert`. Harte Regel 6 ist damit
--      genauso erfüllt wie bei einer Funktion — nur kann sie hier niemand umgehen,
--      auch nicht ein späterer Import oder eine Migration.
--    • Das Senden bleibt ein gewöhnliches `insert into messages` und damit unter
--      der Policy `nachricht_schreiben` aus 0002 — also unter Ians `SCHREIB_REGEL`.
--      Eine `security definer`-Funktion müsste diese Policy NACHBAUEN, weil sie sie
--      umgeht (siehe den Absatz bei `anfrage_bestaetigen`). Dann stünde Ians Regel
--      zweimal da, und die zweite wäre die, die man beim Ändern vergisst.
--
--  Das ist die Umkehrung der Überlegung ganz oben: Ein fehlender Grant verlangt
--  eine Funktion, WENN etwas zu entscheiden ist. Hier ist nichts zu entscheiden —
--  es ist eine Buchhaltung, die immer gilt.
-- ═══════════════════════════════════════════════════════════════════════════════

create function public.nachricht_notiert() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.chat_threads set last_message_at = new.sent_at where id = new.thread_id;
  return new;
end $$;

create trigger nachricht_notiert
  after insert on public.messages
  for each row execute function public.nachricht_notiert();


-- ═══════════════════════════════════════════════════════════════════════════════
--  RECHTE
--
--  `authenticated` darf die Funktionen AUFRUFEN — mehr nicht. Was sie tun, prüfen
--  sie selbst. `anon` bekommt nichts, wie in 0002: Ohne Anmeldung ist `auth.uid()`
--  null, und jede Funktion oben bricht in ihrer ersten Zeile ab.
-- ═══════════════════════════════════════════════════════════════════════════════

grant execute on function public.anfrage_bestaetigen(uuid)  to authenticated;
grant execute on function public.blockieren(uuid)           to authenticated;
grant execute on function public.gruppe_verlassen(uuid)     to authenticated;
grant execute on function public.gruppe_gruenden(text, text, public.activity_category, boolean, text)
                                                            to authenticated;
grant execute on function public.beitritt_bestaetigen(uuid) to authenticated;
grant execute on function public.einladung_annehmen(uuid)   to authenticated;
grant execute on function public.direktchat_oeffnen(uuid)   to authenticated;
