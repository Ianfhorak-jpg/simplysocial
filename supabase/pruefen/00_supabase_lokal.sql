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

-- ⚠️ Die REIHENFOLGE der beiden Schritte ist keine Geschmacksfrage, und sie hat am
-- 2026-09-06 eine Prüfung falsch rot gemacht. `nullif(..., '')` steht VOR dem Cast,
-- genau wie im Original.
--
-- Der Grund: Eine Sitzungsvariable, die einmal mit `set local` gesetzt und dann
-- zurückgerollt wurde, ist danach nicht WEG — sie steht auf dem leeren String. Wer
-- zuerst castet, bekommt `''::json` und damit `22P02 invalid input syntax`, wo eine
-- schlichte `null` hingehört. Das sieht dann aus wie ein Fehler in der Policy und ist
-- einer in der Attrappe.
create or replace function auth.uid() returns uuid
language sql stable
as $$
  select (nullif(current_setting('request.jwt.claims', true), '')::json ->> 'sub')::uuid
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

-- ── Und was Supabase SONST NOCH mitbringt, ohne dass es jemand hinschreibt ───
--
-- ⚠️ **Gefunden am 2026-09-12, beim ersten Lauf von `70_schreiben.sh`, und es ist
-- der teuerste Unterschied zwischen dieser Attrappe und dem Original.**
--
-- Ein echtes Supabase-Projekt trägt für das Schema `public` eine Voreinstellung
-- (`alter default privileges`), die JEDER neuen Tabelle automatisch ALLE Rechte an
-- `anon`, `authenticated` und `service_role` gibt. Gemessen, nicht gelesen:
--
--     group_members   lokal: SELECT
--     group_members   echt : DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE
--
-- **Damit wirkt harte Regel 70 an den zwei Orten verschieden.** Lokal sperrt der
-- fehlende Grant, und er sperrt LAUT (`42501`). Am Original sperrt nur die
-- fehlende Policy — und bei DELETE und UPDATE heißt das **null Zeilen, still**.
-- Beides schützt; aber wer lokal prüft, misst die falsche Sorte Sperre.
--
-- Das ist die Attrappen-Falle vom 2026-09-06 in ihrer scharfen Form: *Eine
-- Nachbildung, die WENIGER mitbringt als das Original, lässt eine Messung
-- durchgehen, die am Original falsch ist.* Deshalb bringt sie es ab heute mit —
-- und `0007_rechte.sql` nimmt es beiden gleichermaßen wieder weg.
alter default privileges in schema public grant all on tables to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- Die Realtime-Publication — nachgetragen am 2026-09-12 für Migration 0005.
--
-- Sie steht hier aus GENAU dem Grund, der am selben Tag den Trigger-Zähler
-- getroffen hat: **Eine Nachbildung, die WENIGER mitbringt als das Original,
-- lässt eine Messung durchgehen, die am Original falsch ist.** Ohne diese Zeile
-- scheitert 0005 lokal mit „publication does not exist" — und das wäre noch der
-- gute Fall. Der schlechte: Jemand baut die Migration so um, dass sie die
-- Publication selbst anlegt, und dann prüft sie am echten Server eine andere
-- Publication als die, die Supabase benutzt.
--
-- Sie wird LEER angelegt, genau wie in einem frischen Supabase-Projekt
-- (`puballtables = false`, keine Tabellen). Was hineinkommt, sagt 0005.
do $$ begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;
