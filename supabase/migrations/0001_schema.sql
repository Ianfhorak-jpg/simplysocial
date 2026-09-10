-- ═══════════════════════════════════════════════════════════════════════════════
--  SimplySocial — das Schema.  Phase 20.1, PLAN.md Abschnitt 5b.
--
--  Die Übersetzung von `src/types/models.ts` nach Postgres. An drei Stellen ist sie
--  KEINE Übersetzung, sondern eine Entscheidung — die drei stehen unten jeweils dort,
--  wo sie wirksam werden, nicht gesammelt in einem Vorwort.
--
--  ── Was diese Datei NICHT tut ────────────────────────────────────────────────
--  Sie vergibt keine Rechte. Ohne `0002_policies.sql` ist jede Tabelle hier für
--  jeden lesbar. Das ist Absicht: Schema und Regel sind zwei Dateien, weil man die
--  zweite prüfen können muss, ohne die erste zu verstehen (`supabase/pruefen/`).
--
--  ── Keine Koordinaten. Nirgends. ─────────────────────────────────────────────
--  Es gibt in diesem Schema keine Spalte für Länge und Breite, und das ist kein
--  Vergessen: Am Post steht `district` und sonst nichts (harte Regel 47). Wer je
--  eine `lat`/`lng`-Spalte hinzufügt, hebt die Regel auf, die die App seit Phase 2
--  trägt — eine Stecknadel verrät statt „1220" die genaue Parkbank um 17:00.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Aufzählungen ─────────────────────────────────────────────────────────────
--
-- Als echte Postgres-Typen und nicht als `text`: Ein Vertipper ist damit ein Fehler
-- beim Schreiben statt eine Zeile, die niemand mehr findet. Das ist dieselbe
-- Überlegung wie `IconName` in Phase 14 — eine Whitelist erzwingt, ein `string` nicht.

create type activity_category as enum ('sport', 'food', 'study', 'culture', 'outdoor', 'creative');
create type skill_level      as enum ('any', 'beginner', 'intermediate', 'advanced');
create type post_status      as enum ('open', 'full', 'past');
create type request_status   as enum ('pending', 'accepted', 'declined');
create type report_target    as enum ('post', 'user');
create type report_reason    as enum ('spam', 'belaestigung', 'unangemessen', 'dating', 'fake', 'gefahr', 'anderes');

-- Die beiden Schlüssel der Union-Typen aus `models.ts`. Sie sind hier NUR der
-- Schlüssel — die Daten daneben hält der `CHECK` an der jeweiligen Tabelle zusammen.
create type visibility_kind  as enum ('public', 'followers', 'group');
create type alter_kind       as enum ('egal', 'spanne');


-- ── Menschen ─────────────────────────────────────────────────────────────────
--
-- Heißt `profiles` und nicht `users`: `auth.users` gehört Supabase und trägt die
-- Anmeldedaten (E-Mail, Passwort-Hash, Anbieter). Was die App zeigt, steht hier.
-- Die `id` ist dieselbe — ein Profil OHNE Konto kann es damit nicht geben.
create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  handle       text        not null unique,
  display_name text        not null,
  photo_url    text,                    -- Darias Wunsch, Upload kommt in 20.6
  bio          text        not null default '',

  -- Der Bezirk eines MENSCHEN ist Pflicht, der eines POSTS nicht (Ians Entscheidung 9).
  -- In SQL ist dieser Unterschied genau ein `not null` — und damit zum ersten Mal an
  -- einer Stelle, an der ihn niemand versehentlich aufweichen kann.
  district     text        not null,

  -- Eine Zahl, kein Geburtsdatum (Phase 18b). Die Grenzen stehen in `config/alter.ts`
  -- und hier — bewusst zweimal: Die App prüft beim Eintippen, die Datenbank prüft
  -- gegen alles andere, was je schreiben wird.
  jahrgang     integer     not null check (jahrgang between 1930 and 2030),

  -- BLEIBT ein Array. Postgres kann das, und es ist eine Werteliste, keine
  -- Beziehung: Niemand fragt je „wer interessiert sich für Sport" mit einem Join.
  interests    activity_category[] not null default '{}',

  created_at   timestamptz not null default now()
);

-- ── Folgen ───────────────────────────────────────────────────────────────────
--
-- HARTE REGEL 8 LÖST SICH HIER AUF, und das ist die sichtbarste Verbesserung des
-- ganzen Umzugs. Bisher stand eine Folge-Beziehung ZWEIMAL im Modell
-- (`followingIds` bei mir, `followerIds` beim anderen), weil ein Objektmodell kein
-- besseres Mittel hatte — und die Regel „nur über folgen()/entfolgen() anfassen"
-- war die Krücke, die die beiden zusammenhielt. Eine Zeile kann nicht halb
-- geschrieben sein.
create table follows (
  follower_id uuid not null references profiles (id) on delete cascade,
  followee_id uuid not null references profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, followee_id),
  constraint nicht_sich_selbst check (follower_id <> followee_id)
);
create index on follows (followee_id);

-- ── Blockieren ───────────────────────────────────────────────────────────────
--
-- EINSEITIG BLEIBT EINSEITIG (harte Regel 10). Es gibt keine Gegenzeile beim
-- Blockierten — nicht aus Sparsamkeit, sondern weil er es nicht merken darf.
-- Dass die WIRKUNG trotzdem in beide Richtungen geht, ist eine Sache des Lesens
-- und steht in `0002_policies.sql`, nicht hier.
create table blocks (
  blocker_id uuid not null references profiles (id) on delete cascade,
  blocked_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint nicht_sich_selbst check (blocker_id <> blocked_id)
);
create index on blocks (blocked_id);

-- ── Gruppen ──────────────────────────────────────────────────────────────────
create table groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  category    activity_category not null,   -- PFLICHT, siehe Kommentar am Typ `Group`
  -- ⚠️ NULL-FÄHIG, und zwar seit Ians Entscheidung 41 (2026-09-10). Vorher stand
  -- hier `not null`, weil eine Gruppe immer jemandem gehörte: Ging der Gründer,
  -- erbte jemand (Entscheidung 13) oder die Gruppe wurde gelöscht. Seit sie
  -- stattdessen AUFHÖRT (siehe `aufgeloest_am` unten), gibt es einen dritten Fall —
  -- eine Gruppe ohne Mitglieder und damit ohne Chef.
  --
  -- Zwei Dinge hängen daran, und beide fallen erst später auf:
  --   • `on delete set null` ist PFLICHT. Ohne es scheitert `konto_loeschen()` an
  --     `groups_creator_id_fkey` — genau der Fehler, aus dem Entscheidung 39
  --     überhaupt entstanden ist, nur einen Schritt später.
  --   • Der CHECK unten sorgt dafür, dass „ohne Chef" NUR bei einer aufgelösten
  --     Gruppe darstellbar ist. Eine lebende Gruppe ohne Gründer wäre eine, in der
  --     niemand mehr Anfragen bestätigt — die Zeilen lägen für immer da.
  creator_id  uuid references profiles (id) on delete set null,
  offen       boolean not null default true, -- Ians Entscheidung 28
  district    text,                          -- null heißt „ganz Wien"
  created_at  timestamptz not null default now(),

  -- ═══════════════════════════════════════════════════════════════════════════
  --  EINE AUFGELÖSTE GRUPPE WIRD NICHT GELÖSCHT, SIE HÖRT AUF
  --  Ians Entscheidung 41 vom 2026-09-10 — und die Spalte ist ihre Folge, nicht
  --  ihr Inhalt.
  --
  --  Gefragt war, was mit einem Post passiert, der „nur für diese Gruppe" war,
  --  wenn die Gruppe sich auflöst (der Gründer geht, niemand ist mehr drin).
  --  Seine Antwort: **der Post bleibt stehen** — dieselbe Regel wie
  --  `AUSTRITT_WIRKUNG = 'posts-bleiben'` (Entscheidung 12), und der Prototyp
  --  macht es seit Phase 17 genau so.
  --
  --  Der naheliegende Weg dorthin wäre `on delete set null` an
  --  `posts.visibility_group_id` gewesen. Er geht nicht, und der Grund ist eine
  --  gute Nachricht: Dann stünde am Post `visibility_kind = 'group'` OHNE
  --  Gruppen-ID — genau der Zustand, den Phase 17 mit einem diskriminierten Union
  --  UNDARSTELLBAR gemacht hat (harte Regel 31). Der CHECK `sicht_vollstaendig`
  --  unten bricht den Löschvorgang ab. **Die Absicherung von damals hat hier zum
  --  ersten Mal wirklich etwas verhindert.**
  --
  --  Also verschwindet die Gruppe nicht. Sie bekommt ein Datum, ihre
  --  Mitgliederliste ist leer, und damit ist sie für alle unsichtbar außer für
  --  den Verfasser eines Posts, der auf sie zeigt (`posts_lesen` fragt
  --  `regel.ist_mitglied`, und Mitglieder gibt es keine). Zwei Zusagen bleiben
  --  gleichzeitig heil: der Union ist vollständig, der Fremdschlüssel gültig.
  --
  --  ⚠️ ZU TUN IN 20.4: Der Prototyp löscht die Gruppe aus seinem Array und zeigt
  --  am Post `GRUPPE_UNBEKANNT = 'einer Gruppe'`. Sobald `store.ts` aus der
  --  Datenbank liest, muss `Group` ein `aufgeloestAm?` bekommen und jede
  --  Gruppen-LISTE es herausfiltern — sonst steht eine tote Gruppe unter „Deine
  --  Gruppen". Dieselbe abgesprochene Schuld wie `aus_aktivitaet` (harte Regel 56).
  -- ═══════════════════════════════════════════════════════════════════════════
  aufgeloest_am timestamptz,

  constraint chef_oder_aufgeloest check (creator_id is not null or aufgeloest_am is not null)
);

-- Aus `Group.memberIds` wird eine Tabelle — und die REIHENFOLGE wird dabei ehrlich.
--
-- Harte Regel 33 sagt: Die Liste wächst hinten, also erbt der zweite Eintrag die
-- Gruppe, wenn der Gründer geht (`nachfolgerId()`, Ians Entscheidung 13). Eine
-- Tabelle hat keine Reihenfolge. Sie muss als `joined_at` ausgeschrieben und mit
-- `order by` gelesen werden.
--
-- Das ist eine VERBESSERUNG, keine Anpassung: Heute hängt eine Erbfolge an einer
-- Array-Reihenfolge, die jeder unabsichtlich umsortieren kann, und niemand würde es
-- merken. Danach steht sie als Datum da.
create table group_members (
  group_id  uuid not null references groups (id) on delete cascade,
  user_id   uuid not null references profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index on group_members (user_id);
create index on group_members (group_id, joined_at);

-- ── Posts ────────────────────────────────────────────────────────────────────
create table posts (
  id         uuid primary key default gen_random_uuid(),
  -- `cascade` ist Ians Entscheidung 39 vom 2026-09-06 („alles mit"): Löscht jemand
  -- sein Konto, gehen seine Posts mit. Den Haken kennt er und hat ihn gewählt — wer
  -- morgen 17:00 mit vier Leuten verabredet war, sagt allen vier kommentarlos ab.
  -- Seine GRUPPEN gehen NICHT mit; die werden vererbt (Entscheidung 13, siehe 0003).
  author_id  uuid not null references profiles (id) on delete cascade,
  category   activity_category not null,
  title      text not null check (length(title) between 1 and 80),

  -- `null` heißt „kein Bezirk angegeben", nicht „leer" (Ians Entscheidung 9).
  -- Bewusst NICHT der leere String: `ortText()` in `lib/bezirk.ts` unterscheidet
  -- die beiden, und mit '' stünde dort still „ Wien".
  district   text,

  starts_at  timestamptz not null,
  level      skill_level not null default 'any',

  -- ── Der Union `PostAlter` als zwei Spalten plus ein CHECK ──────────────────
  alter_kind          alter_kind not null default 'egal',
  alter_von_jahrgang  integer,
  alter_bis_jahrgang  integer,

  spots_total  integer not null check (spots_total > 0),
  spots_filled integer not null default 0 check (spots_filled >= 0),
  note         text not null default '',
  meeting_point text,
  expires_at   timestamptz,

  -- ── Der Union `Visibility` als zwei Spalten plus ein CHECK ─────────────────
  visibility_kind     visibility_kind not null default 'public',
  visibility_group_id uuid references groups (id) on delete cascade,

  status     post_status not null default 'open',
  created_at timestamptz not null default now(),

  -- ═════════════════════════════════════════════════════════════════════════
  --  DIE DREI CHECKS, WEGEN DERER DIESE PHASE ÜBERHAUPT SORGFALT BRAUCHT
  --
  --  `Visibility` und `PostAlter` sind in Phase 17 und 18b mit viel Bedacht als
  --  diskriminierte Unions gebaut worden, damit ein Zustand wie „Gruppen-Post
  --  ohne Gruppe" UNDARSTELLBAR ist. Zwei Spalten nebeneinander können ihn
  --  wieder darstellen — die Garantie überlebt die Reise nach SQL nicht von
  --  selbst, und zwar LAUTLOS.
  --
  --  Das ist die Phase-16-Lehre zum fünften Mal: „Wo ein Typ weiter wird, muss
  --  die Enge eine Ebene höher neu entstehen." Hier ist die Ebene der CHECK.
  -- ═════════════════════════════════════════════════════════════════════════

  constraint sicht_vollstaendig check (
    (visibility_kind = 'group') = (visibility_group_id is not null)
  ),

  constraint alter_vollstaendig check (
    (alter_kind = 'spanne') = (alter_von_jahrgang is not null)
    and (alter_kind = 'spanne') = (alter_bis_jahrgang is not null)
  ),

  -- `vonJahrgang` ist der ÄLTERE Rand (die kleinere Zahl), `bisJahrgang` der
  -- jüngere — siehe den Kommentar am Typ. Verdreht eingegeben ist die Spanne
  -- leer, und der Filter würfe still alles weg.
  constraint alter_spanne_richtig_herum check (
    alter_von_jahrgang is null or alter_von_jahrgang <= alter_bis_jahrgang
  ),

  -- Ein Post kann nicht voller als voll sein. Im Prototyp hielt das die
  -- Oberfläche; hier hält es die Datenbank, auch gegen zwei gleichzeitige
  -- Bestätigungen (siehe `anfrage_bestaetigen` in 0003).
  constraint plaetze_plausibel check (spots_filled <= spots_total)
);
create index on posts (author_id);
create index on posts (starts_at);
create index on posts (visibility_group_id);

-- ── Anfragen an einen Post ───────────────────────────────────────────────────
create table join_requests (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid not null references posts (id) on delete cascade,
  from_user_id uuid not null references profiles (id) on delete cascade,
  message      text not null default '',
  status       request_status not null default 'pending',
  created_at   timestamptz not null default now(),
  -- Zweimal „Bin dabei" auf denselben Post gibt es nicht. Im Prototyp verhinderte
  -- das der ausgegraute Knopf — also die Oberfläche, also nichts.
  unique (post_id, from_user_id)
);
create index on join_requests (from_user_id);

-- ── Gruppen-Anfragen und -Einladungen: ZWEI Tabellen ─────────────────────────
--
-- Harte Regel 39: Eine Einladung ist KEINE Anfrage mit umgedrehtem Vorzeichen.
-- Der Grund ist in SQL sogar sichtbarer als in TypeScript — `group_requests` hat
-- eine `message` und keinen Empfänger, `group_invites` einen Empfänger und keine
-- `message`. Eine Tabelle mit einem Richtungsfeld hätte in jeder Zeile eine Spalte,
-- die nichts bedeutet.
create table group_requests (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid not null references groups (id) on delete cascade,
  from_user_id uuid not null references profiles (id) on delete cascade,
  message      text not null default '',
  status       request_status not null default 'pending',
  created_at   timestamptz not null default now(),
  unique (group_id, from_user_id)
);

create table group_invites (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid not null references groups (id) on delete cascade,
  from_user_id uuid not null references profiles (id) on delete cascade, -- wer eingeladen hat
  to_user_id   uuid not null references profiles (id) on delete cascade, -- wer eingeladen wurde
  status       request_status not null default 'pending',
  created_at   timestamptz not null default now(),
  unique (group_id, to_user_id)
);
create index on group_invites (to_user_id);

-- ── Chats ────────────────────────────────────────────────────────────────────
create table chat_threads (
  id              uuid primary key default gen_random_uuid(),

  -- OPTIONAL seit Phase 16: kein Post heißt DIREKTCHAT (harte Regel 28).
  post_id         uuid references posts (id) on delete set null,

  -- ═══════════════════════════════════════════════════════════════════════════
  --  WARUM DIE HERKUNFT EXTRA DASTEHT, OBWOHL `post_id` SIE SCHON SAGT
  --
  --  In der App ist `istDirektChat(t)` genau `t.postId === undefined`, und das war
  --  bis hierher richtig — im Prototyp kann man einen Post gar nicht löschen.
  --  Mit einer echten Datenbank kann man es, und `on delete set null` macht dann
  --  aus einem Aktivitäts-Chat LAUTLOS einen Direktchat.
  --
  --  Die Folge wäre nicht kosmetisch: Für einen Direktchat gilt Ians
  --  `SCHREIB_REGEL = 'gegenseitig'`. Zwei Leute, die sich über eine Aktivität
  --  verabredet haben und einander NICHT folgen, könnten einander plötzlich nicht
  --  mehr schreiben — weil eine dritte Sache (der Post) verschwunden ist. Niemand
  --  hat das entschieden, und gemerkt hätte es nur, wer es ausprobiert.
  --
  --  Die Herkunft eines Chats ist eine TATSACHE über seine Entstehung, kein
  --  abgeleiteter Wert. Deshalb steht sie da. `post_id` bleibt der Zeiger auf die
  --  Aktivität, solange es sie gibt — die beiden beantworten verschiedene Fragen:
  --  „woraus ist dieser Chat entstanden" und „welche Aktivität ist das gerade".
  -- ═══════════════════════════════════════════════════════════════════════════
  aus_aktivitaet  boolean not null,

  -- Ein Chat, der aus einer Aktivität kam, MUSS beim Anlegen einen Post haben.
  -- Verlieren darf er ihn später (siehe oben) — erfinden nie.
  constraint herkunft_plausibel check (aus_aktivitaet or post_id is null),

  created_at      timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

-- Aus `participantIds` wird eine Tabelle.
create table chat_participants (
  thread_id uuid not null references chat_threads (id) on delete cascade,
  user_id   uuid not null references profiles (id) on delete cascade,
  primary key (thread_id, user_id)
);
create index on chat_participants (user_id);

create table messages (
  id        uuid primary key default gen_random_uuid(),
  thread_id uuid not null references chat_threads (id) on delete cascade,
  sender_id uuid not null references profiles (id) on delete cascade,
  text      text not null check (length(text) between 1 and 2000),
  sent_at   timestamptz not null default now()
);
create index on messages (thread_id, sent_at);

-- ── Meldungen ────────────────────────────────────────────────────────────────
--
-- `target_id` ist bewusst OHNE Fremdschlüssel: Sie zeigt je nach `target_type` auf
-- einen Post oder auf ein Profil, und ein Fremdschlüssel kann nur auf eine Tabelle
-- zeigen. Wichtiger noch — eine Meldung muss den gemeldeten Post ÜBERLEBEN. Mit
-- `on delete cascade` löschte der Gemeldete den Beleg, indem er den Post löscht.
create table reports (
  id           uuid primary key default gen_random_uuid(),
  target_type  report_target not null,
  target_id    uuid not null,
  -- ⚠️ BEWUSST OHNE `not null`, und das ist kein Schlampen — hier stand es zuerst,
  -- zusammen mit `on delete set null`. Postgres NIMMT diese Kombination an und
  -- scheitert erst, wenn wirklich jemand sein Konto löscht:
  --   `null value in column "from_user_id" violates not-null constraint`
  -- Also genau an dem Tag, an dem es niemand mehr in Ruhe nachsehen kann. Am
  -- 2026-09-06 gemessen, nicht überlegt.
  --
  -- `null` heißt hier „der Melder hat sein Konto gelöscht" — die MELDUNG bleibt.
  -- Sonst nähme jeder, der jemanden anzeigt, mit dem Löschen den Beleg mit, und wer
  -- gemeldet wird, hätte einen Weg, ihn verschwinden zu lassen.
  from_user_id uuid references profiles (id) on delete set null,
  reason       report_reason not null,
  note         text not null default '',
  created_at   timestamptz not null default now(),
  -- 20.7: Die Meldungen bekommen einen Leser. Diese zwei Spalten sind der Unterschied
  -- zwischen „gespeichert" und „gelesen", und Apple fragt im Review danach.
  erledigt_am  timestamptz,
  erledigt_von uuid references profiles (id)
);
create index on reports (created_at desc) where erledigt_am is null;
