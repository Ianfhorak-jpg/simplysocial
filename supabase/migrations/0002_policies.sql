-- ═══════════════════════════════════════════════════════════════════════════════
--  SimplySocial — die Regeln auf dem Server.  Phase 20.2, PLAN.md Abschnitt 5b.
--
--  „Was der Browser ausfiltert, hat er vorher heruntergeladen." Der Satz steht seit
--  Phase 2 im PLAN.md und wird hier eingelöst. Jede Regel, die heute in einer
--  Regel-Datei lebt, bekommt ihr Gegenstück als Policy:
--
--    posts/hooks.ts   darfIchSehen()   →  policy posts_lesen
--    safety/block.ts  BLOCK_WIRKUNG    →  regel.sind_blockiert(), beide Richtungen
--    groups/gruppe.ts PRIVAT_SICHT     →  policy mitglieder_lesen + mitglieder_anzahl()
--    chat/direkt.ts   SCHREIB_REGEL    →  policy nachricht_schreiben
--    requests/kollision.ts / Regel 47  →  policy anfragen_lesen (siehe dort)
--
--  ── Der Prüfstein dieser Datei ist NICHT, dass die App läuft ─────────────────
--  Sie läuft auch mit offenen Policies. Der Prüfstein ist der Angriff von außen:
--  mit dem Schlüssel eines zweiten Kontos an der App vorbei einen Follower-Post
--  lesen. Was dabei nicht kommt, ist geschützt; alles andere ist geglaubt.
--  Der Angriff steht als Datei da: `supabase/pruefen/10_angriff.sql`.
-- ═══════════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════════════
--  1. DIE REGELN ALS FUNKTIONEN — und warum sie `security definer` sein MÜSSEN
--
--  Der naheliegende Weg wäre, „nur Mitglieder sehen die Mitgliederliste" direkt in
--  die Policy zu schreiben:
--
--      create policy ... on group_members for select using (
--        exists (select 1 from group_members m where m.group_id = ... ) );
--
--  Das ist am 2026-09-06 ausprobiert worden und Postgres antwortet:
--  **`infinite recursion detected in policy for relation "group_members"`.**
--  Die Policy fragt die Tabelle ab, auf der sie liegt — also greift beim Lesen
--  wieder sie selbst. Kein Nachdenken hätte das verhindert, und die Meldung kommt
--  erst, wenn zum ersten Mal jemand liest.
--
--  `security definer` heißt: Die Funktion läuft mit den Rechten ihres Eigentümers,
--  und der umgeht RLS auf seinen eigenen Tabellen. Damit endet die Kette nach genau
--  einem Schritt. Der Preis ist, dass jede dieser Funktionen ein Loch in die
--  Absicherung ist — deshalb sind es so wenige wie möglich, sie stehen alle hier
--  beieinander, und jede beantwortet genau eine Ja/Nein-Frage über EINE ID.
--
--  `set search_path = ''` ist dabei Pflicht und keine Sorgfalt: Ohne ihn könnte
--  jemand mit Schreibrecht auf einem eigenen Schema eine Tabelle `group_members`
--  davorschieben und die Funktion damit auf seine eigenen Daten umlenken.
-- ═══════════════════════════════════════════════════════════════════════════════

create schema regel;
comment on schema regel is
  'Die Regeln der App als Funktionen. Bewusst NICHT in `public`: PostgREST stellt nur '
  '`public` als API bereit, also ist hier nichts von außen aufrufbar. Wer eine Regel '
  'ändern will, ändert sie hier — nie in einer Policy und nie in einem Screen.';

-- ── Blockieren, in BEIDE Richtungen gefragt ──────────────────────────────────
--
-- Harte Regel 10: Gespeichert ist ein Block nur EINMAL (beim Blockierenden), gefragt
-- wird trotzdem in beide Richtungen. Genau wie `istBlockiert(a, b)` in
-- `features/safety/hooks.ts` — und aus demselben Grund: Wer die eine Richtung prüft
-- und die andere vergisst, merkt es nie.
create function regel.sind_blockiert(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b)
       or (blocker_id = b and blocked_id = a)
  )
$$;

create function regel.folgt(follower uuid, followee uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.follows f
                 where f.follower_id = follower and f.followee_id = followee)
$$;

-- `SCHREIB_REGEL = 'gegenseitig'` (Ians Entscheidung 11). Die anderen zwei
-- Möglichkeiten stehen im Kopf von `features/chat/direkt.ts`; ändert Ian sie dort,
-- ändert sich HIER die eine Zeile mit — nicht fünf Policies.
create function regel.folgen_sich_gegenseitig(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select regel.folgt(a, b) and regel.folgt(b, a)
$$;

create function regel.ist_mitglied(gid uuid, uid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.group_members m
                 where m.group_id = gid and m.user_id = uid)
$$;

-- ── Die ZAHL ja, die LISTE nein ──────────────────────────────────────────────
--
-- `PRIVAT_SICHT = 'name-und-kategorie'` (Ians Entscheidung 27) sagt: Bei einer
-- privaten Gruppe sieht ein Fremder Name, Kategorie, Bezirk UND die Mitgliederzahl —
-- nur nicht, WER drin ist.
--
-- Das ist mit einer Policy allein nicht zu haben, und der Grund ist eine
-- Kleinigkeit mit großer Wirkung: `select count(*) from group_members` zählt nur die
-- Zeilen, die die Policy durchlässt. Ein Fremder bekäme also nicht „Zugriff
-- verweigert", sondern die Zahl **0** — eine Auskunft, die schlicht falsch ist und
-- wie eine leere Gruppe aussieht.
create function regel.mitglieder_anzahl(gid uuid) returns integer
language sql stable security definer set search_path = '' as $$
  select count(*)::integer from public.group_members m where m.group_id = gid
$$;

create function regel.ist_teilnehmer(tid uuid, uid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.chat_participants p
                 where p.thread_id = tid and p.user_id = uid)
$$;

grant usage on schema regel to anon, authenticated;
grant execute on all functions in schema regel to anon, authenticated;


-- ═══════════════════════════════════════════════════════════════════════════════
--  2. RLS ANSCHALTEN — auf JEDER Tabelle
--
--  Eine Tabelle ohne `enable row level security` ist für jeden lesbar, der einen
--  Schlüssel hat, und der `anon`-Schlüssel steht im ausgelieferten App-Bündel. Es
--  gibt hier keine Tabelle, die das verträgt — deshalb steht die Liste vollständig
--  da und nicht bei den einzelnen Policies verstreut: Eine vergessene Tabelle fällt
--  in einer Liste auf, in 200 Zeilen Policies nicht.
-- ═══════════════════════════════════════════════════════════════════════════════

alter table profiles          enable row level security;
alter table follows           enable row level security;
alter table blocks            enable row level security;
alter table groups            enable row level security;
alter table group_members     enable row level security;
alter table posts             enable row level security;
alter table join_requests     enable row level security;
alter table group_requests    enable row level security;
alter table group_invites     enable row level security;
alter table chat_threads      enable row level security;
alter table chat_participants enable row level security;
alter table messages          enable row level security;
alter table reports           enable row level security;


-- ═══════════════════════════════════════════════════════════════════════════════
--  3. DIE POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Profile ──────────────────────────────────────────────────────────────────
--
-- Ein Profil ist lesbar, auch für jemanden, den ich blockiert habe — und das ist
-- Absicht, nicht Nachlässigkeit. Harte Regel 10: Wer blockiert wird, darf es nicht
-- merken. Verschwände mein Profil für ihn, wäre der Block die auffälligste Sache
-- der App. Was der Block wirklich abschneidet, sind Posts, Anfragen und Chat.
create policy profil_lesen on profiles for select to authenticated using (true);
create policy profil_anlegen on profiles for insert to authenticated with check (id = auth.uid());
create policy profil_aendern on profiles for update to authenticated using (id = auth.uid());

-- ── Folgen ───────────────────────────────────────────────────────────────────
create policy folgen_lesen on follows for select to authenticated using (true);
create policy folgen_anfangen on follows for insert to authenticated
  with check (follower_id = auth.uid() and not regel.sind_blockiert(follower_id, followee_id));
create policy folgen_aufhoeren on follows for delete to authenticated using (follower_id = auth.uid());

-- ── Blockieren ───────────────────────────────────────────────────────────────
--
-- DIE EINSEITIGSTE POLICY DER GANZEN DATEI, und die wichtigste dieser drei Zeilen
-- ist, dass es keine vierte gibt: Es existiert KEINE Möglichkeit für den
-- Blockierten, diese Zeile zu lesen. Am Modell stand die Einseitigkeit schon
-- (Regel 10); hier wird sie zum ersten Mal auch gegen jemanden durchgesetzt, der
-- nicht die App benutzt, sondern die Datenbank direkt fragt.
create policy block_lesen on blocks for select to authenticated using (blocker_id = auth.uid());
create policy block_setzen on blocks for insert to authenticated with check (blocker_id = auth.uid());
create policy block_loesen on blocks for delete to authenticated using (blocker_id = auth.uid());

-- ── Gruppen ──────────────────────────────────────────────────────────────────
--
-- Auch eine PRIVATE Gruppe ist hier lesbar, und das ist `PRIVAT_SICHT` und kein
-- Loch: `offen = false` heißt nicht „unsichtbar", sondern „kein Weg hinein". Wer
-- die Adresse hat, sieht Name, Kategorie, Bezirk und die Zahl. Was zubleibt, ist
-- die Mitgliederliste (`group_members`) und die Posts (`posts`).
create policy gruppe_lesen on groups for select to authenticated using (true);
create policy gruppe_gruenden on groups for insert to authenticated with check (creator_id = auth.uid());
create policy gruppe_aendern on groups for update to authenticated using (creator_id = auth.uid());

-- ── Mitgliedschaften: die LISTE nur für Mitglieder ───────────────────────────
create policy mitglieder_lesen on group_members for select to authenticated using (
  user_id = auth.uid()                        -- die eigene Mitgliedschaft immer
  or regel.ist_mitglied(group_id, auth.uid()) -- die der anderen nur von drinnen
);
--
-- ⚠️ KEINE insert/update/delete-Policy, und das ist die Aussage.
--
-- Beitreten ist kein Schreibvorgang, sondern das ERGEBNIS einer bestätigten Anfrage
-- oder einer angenommenen Einladung. Stünde hier ein `insert`, könnte sich jeder mit
-- einer Zeile selbst in jede Gruppe schreiben — und die ganze Phase 17 (der Gründer
-- bestätigt) wäre eine Höflichkeitsform. Mitgliedschaften ändern sich nur über die
-- Funktionen aus Phase 20.5, die als `security definer` laufen und vorher prüfen.
--
-- Dasselbe gilt fürs Austreten: `gruppeVerlassen` muss `nachfolgerId()` mitführen
-- (Ians Entscheidung 13, die Gruppe wird vererbt). Ein blankes `delete` würde die
-- Erbfolge stillschweigend überspringen.

-- ── Posts: die zentrale Regel der App ────────────────────────────────────────
--
-- Das ist `darfIchSehen()` aus `features/posts/hooks.ts`, Zeile für Zeile — nur eine
-- Ebene tiefer, und damit an der Stelle, an der sie auch gegen jemanden hält, der
-- nicht die App benutzt. Die Reihenfolge ist dieselbe wie im TypeScript: erst der
-- Block (er schlägt alles), dann die eigene Urheberschaft, dann die drei Stufen.
create policy posts_lesen on posts for select to authenticated using (
  not regel.sind_blockiert(auth.uid(), author_id)
  and (
       author_id = auth.uid()
    or visibility_kind = 'public'
    or (visibility_kind = 'followers' and regel.folgt(auth.uid(), author_id))
    or (visibility_kind = 'group'     and regel.ist_mitglied(visibility_group_id, auth.uid()))
  )
);
--
-- Beim SCHREIBEN kommt eine Bedingung dazu, die es im Prototyp nur als Auswahlliste
-- gab: In eine Gruppe posten darf nur, wer drin ist. Die Oberfläche bietet einem
-- Fremden die Gruppe gar nicht an — aber „wird nicht angeboten" ist keine Regel.
create policy posts_schreiben on posts for insert to authenticated with check (
  author_id = auth.uid()
  and (visibility_kind <> 'group' or regel.ist_mitglied(visibility_group_id, auth.uid()))
);
create policy posts_aendern on posts for update to authenticated using (author_id = auth.uid());
create policy posts_loeschen on posts for delete to authenticated using (author_id = auth.uid());

-- ── Anfragen an einen Post ───────────────────────────────────────────────────
--
-- ⚠️ HIER STECKT HARTE REGEL 47, und sie ist der Grund, warum diese Policy so eng
-- ist. Die Doppelbuchungs-Warnung (`requests/kollision.ts`) rechnet aus TERMINEN
-- einer Person. Dürfte der Poster die Anfragen des Anfragenden an ANDERE Posts
-- lesen, könnte er ausrechnen, wo dieser sonst noch hingeht — auch aus privaten
-- Gruppen und aus Posts, die nur für dessen Follower sichtbar sind.
--
-- Genau das war die verworfene dritte Möglichkeit in Phase 18d: dem Poster beim
-- Bestätigen anzeigen, dass der Anfragende zur selben Zeit woanders ist. Sie ist
-- hier nicht „nicht eingebaut", sie ist UNMÖGLICH — der Poster sieht nur Anfragen,
-- die an seine eigenen Posts gehen.
create policy anfragen_lesen on join_requests for select to authenticated using (
  from_user_id = auth.uid()
  or exists (select 1 from posts p where p.id = post_id and p.author_id = auth.uid())
);
create policy anfragen_stellen on join_requests for insert to authenticated with check (
  from_user_id = auth.uid()
  and exists (select 1 from posts p where p.id = post_id and p.author_id <> auth.uid())
);
-- Bestätigen und Absagen darf nur der Poster. Dass dabei Anfrage, Post UND Chat in
-- EINEM Zug geändert werden müssen (harte Regel 6), erledigt die Funktion aus 20.5 —
-- diese Policy ist die Untergrenze, nicht der Weg.
create policy anfragen_beantworten on join_requests for update to authenticated using (
  exists (select 1 from posts p where p.id = post_id and p.author_id = auth.uid())
);
create policy anfragen_zuruecknehmen on join_requests for delete to authenticated using (
  from_user_id = auth.uid()
);

-- ── Gruppen-Anfragen und Einladungen ─────────────────────────────────────────
create policy gruppenanfrage_lesen on group_requests for select to authenticated using (
  from_user_id = auth.uid()
  or exists (select 1 from groups g where g.id = group_id and g.creator_id = auth.uid())
);
-- Anfragen kann man nur an OFFENE Gruppen — `darfBeitreten()` aus `gruppe.ts`.
-- Bei einer privaten Gruppe gibt es diesen Weg nicht, und zwar nicht nur im Screen.
create policy gruppenanfrage_stellen on group_requests for insert to authenticated with check (
  from_user_id = auth.uid()
  and exists (select 1 from groups g where g.id = group_id and g.offen)
  and not regel.ist_mitglied(group_id, auth.uid())
);
create policy gruppenanfrage_beantworten on group_requests for update to authenticated using (
  exists (select 1 from groups g where g.id = group_id and g.creator_id = auth.uid())
);

create policy einladung_lesen on group_invites for select to authenticated using (
  to_user_id = auth.uid() or from_user_id = auth.uid()
);
-- `darfEinladen()`, NICHT `istGruender()` — harte Regel 38. Jedes Mitglied darf
-- einladen (Ians Entscheidung 26). Die Verwechslung fällt in einer frisch
-- gegründeten Gruppe nie auf, weil dort beide dasselbe antworten.
create policy einladung_aussprechen on group_invites for insert to authenticated with check (
  from_user_id = auth.uid()
  and regel.ist_mitglied(group_id, auth.uid())
  and not regel.sind_blockiert(from_user_id, to_user_id)
);
create policy einladung_beantworten on group_invites for update to authenticated using (
  to_user_id = auth.uid()
);

-- ── Chat ─────────────────────────────────────────────────────────────────────
create policy faden_lesen on chat_threads for select to authenticated using (
  regel.ist_teilnehmer(id, auth.uid())
);
create policy teilnehmer_lesen on chat_participants for select to authenticated using (
  regel.ist_teilnehmer(thread_id, auth.uid())
);
create policy nachricht_lesen on messages for select to authenticated using (
  regel.ist_teilnehmer(thread_id, auth.uid())
);

-- `SCHREIB_REGEL` als Policy — der Punkt, an dem aus einem ausgeblendeten Knopf
-- eine Regel wird.
--
-- Zwei Sorten Chat, zwei Bedingungen (harte Regel 28): Hängt am Faden ein POST, ist
-- die Verabredung der Grund, dass man schreiben darf — mehr braucht es nicht. Hängt
-- KEINER daran, ist es ein Direktchat, und dann gilt Ians `'gegenseitig'`.
--
-- Der Block steht in beiden Fällen davor. Er ist die einzige Bedingung, die auch
-- einen BESTEHENDEN Chat schließt: `BLOCK_WIRKUNG = HART` (Ians Entscheidung 7)
-- sagt „der Chat verschwindet", und im Prototyp erledigte das eine Zeile im Speicher.
-- Hier verschwindet er nicht von selbst — aber hineinschreiben kann niemand mehr.
create policy nachricht_schreiben on messages for insert to authenticated with check (
  sender_id = auth.uid()
  and regel.ist_teilnehmer(thread_id, auth.uid())
  and not exists (
    select 1 from chat_participants p
    where p.thread_id = messages.thread_id
      and p.user_id <> auth.uid()
      and (
        regel.sind_blockiert(auth.uid(), p.user_id)
        or (
          -- Direktchat → die strengere Tür. Gefragt wird an der HERKUNFT
          -- (`aus_aktivitaet`) und NICHT an `post_id`: Ein gelöschter Post darf
          -- einen bestehenden Chat nicht nachträglich zusperren. Siehe den
          -- Kommentar an `chat_threads` in 0001.
          not exists (select 1 from chat_threads t
                      where t.id = messages.thread_id and t.aus_aktivitaet)
          and not regel.folgen_sich_gegenseitig(auth.uid(), p.user_id)
        )
      )
  )
);

-- ── Meldungen ────────────────────────────────────────────────────────────────
--
-- Schreiben ja, LESEN NEIN — für niemanden. Es gibt hier bewusst keine
-- select-Policy: Eine Meldung enthält den Namen dessen, der gemeldet hat, und wer
-- sie lesen könnte, wüsste, wer ihn angezeigt hat. Gelesen wird sie in der
-- Supabase-Tabellenansicht mit dem Dienstschlüssel — von einem Menschen, und das ist
-- 20.7 und Apples Auflage 1.2.
create policy melden on reports for insert to authenticated with check (from_user_id = auth.uid());


-- ═══════════════════════════════════════════════════════════════════════════════
--  4. RECHTE
--
--  RLS greift erst NACH den Rechten: Ohne `grant` kommt gar nichts durch, mit
--  `grant` und ohne Policy ebenfalls nichts. Beides ist nötig, und das ist der
--  Grund, warum diese Liste am Ende steht statt am Anfang — hier ist schon jede
--  Tabelle abgesichert.
--
--  `anon` bekommt NICHTS. SimplySocial hat keinen ausgeloggten Zustand, in dem man
--  Posts sieht: Ohne Anmeldung gibt es keinen Feed, weil ohne `auth.uid()` jede
--  Policy oben auf `null` läuft und damit auf „nein".
-- ═══════════════════════════════════════════════════════════════════════════════

grant select, insert, update           on profiles          to authenticated;
grant select, insert, delete           on follows           to authenticated;
grant select, insert, delete           on blocks            to authenticated;
grant select, insert, update           on groups            to authenticated;
grant select                           on group_members     to authenticated;
grant select, insert, update, delete   on posts             to authenticated;
grant select, insert, update, delete   on join_requests     to authenticated;
grant select, insert, update           on group_requests    to authenticated;
grant select, insert, update           on group_invites     to authenticated;
grant select                           on chat_threads      to authenticated;
grant select                           on chat_participants to authenticated;
grant select, insert                   on messages          to authenticated;
grant insert                           on reports           to authenticated;
