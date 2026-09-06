-- ═══════════════════════════════════════════════════════════════════════════════
--  Was Supabase MITBRINGT — hier nachgebaut, damit die Migrationen ohne Konto
--  gegen einen echten Postgres laufen. Diese Datei geht NIE nach Supabase.
--
--  Der Nachbau ist wortgleich mit dem Original, und das ist der ganze Punkt:
--  `auth.uid()` ist bei Supabase kein Zauber, sondern genau diese eine Zeile — sie
--  liest die `sub`-Angabe aus dem JWT, das PostgREST je Anfrage in eine
--  Sitzungsvariable schreibt. Wer hier etwas Eigenes einsetzt (z. B. eine
--  Konstante), prüft hinterher seine Attrappe statt seiner Regeln.
-- ═══════════════════════════════════════════════════════════════════════════════

create schema if not exists auth;

-- Supabase' eigene Nutzertabelle. Es interessiert hier nur die `id` — alles andere
-- (E-Mail, Anbieter, Passwort-Hash) gehört Supabase und wird von der App nie gelesen.
create table if not exists auth.users (
  id    uuid primary key default gen_random_uuid(),
  email text
);

create or replace function auth.uid() returns uuid
language sql stable
as $$
  select nullif(current_setting('request.jwt.claims', true)::json ->> 'sub', '')::uuid
$$;

-- Die zwei Rollen, unter denen PostgREST arbeitet. `anon` ist der nicht angemeldete
-- Besucher, `authenticated` der angemeldete. Beide sind NICHT Eigentümer der
-- Tabellen — und nur deshalb greift RLS überhaupt: Der Eigentümer einer Tabelle
-- umgeht seine eigenen Policies, solange nicht `force row level security` gesetzt
-- ist. Wer als `postgres` prüft, prüft nichts.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
end $$;

grant usage on schema public to anon, authenticated;
grant usage on schema auth  to anon, authenticated;
