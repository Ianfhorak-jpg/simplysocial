-- ═══════════════════════════════════════════════════════════════════════════════
--  Anmeldedaten für die fünf Prüf-Menschen aus `05_daten.sql`
--  Phase 20.4-b. Läuft NUR gegen ein echtes Supabase, nie lokal.
-- ═══════════════════════════════════════════════════════════════════════════════
--
--  ── Warum das nicht über `signUp` geht ───────────────────────────────────────
--  Ein `signUp` über die API lässt Supabase eine Bestätigungsmail verschicken — an
--  eine erfundene Adresse, die niemandem gehört. Das ist eine Handlung nach AUSSEN
--  für eine Prüfung, die drinnen bleiben soll, und bei genug Rückläufern drosselt
--  Supabase den Mailversand des Projekts. Hier wird stattdessen direkt
--  geschrieben, was `signUp` schreiben würde, mit `email_confirmed_at` gesetzt:
--  **es geht keine einzige Mail raus.**
--
--  ── Die vier Felder, ohne die `signInWithPassword` scheitert ─────────────────
--  Nur `id` ist in `auth.users` wirklich NOT NULL — GoTrue verlangt trotzdem
--  `aud`, `role`, `instance_id` und ein bestätigtes `email_confirmed_at`, sonst
--  antwortet es mit „Invalid login credentials". Das sieht dann aus wie ein
--  falsches Passwort und ist ein fehlendes Feld.
--
--  ── Das Passwort kommt von außen ────────────────────────────────────────────
--  Als psql-Variable `:passwort`, erzeugt von `50_lesen.sh` bei jedem Lauf neu.
--  Es steht damit nicht im Repo — und weil die Konten am Ende desselben Laufs
--  wieder gelöscht werden, gibt es nichts, wozu es später noch passen könnte.

update auth.users set
  instance_id       = '00000000-0000-0000-0000-000000000000',
  aud               = 'authenticated',
  role              = 'authenticated',
  email             = 'pruef-' || left(id::text, 8) || '@simplysocial.invalid',
  encrypted_password = crypt(:'passwort', gen_salt('bf')),
  email_confirmed_at = now(),
  created_at        = coalesce(created_at, now()),
  updated_at        = now(),
  raw_app_meta_data  = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = '{}'::jsonb,
  -- ── Diese acht sind der Grund, warum der erste Anmeldeversuch scheiterte ────
  -- GoTrue meldete `Database error querying schema` — das klingt nach einem
  -- kaputten Schema und ist etwas ganz anderes: Der Dienst ist in Go geschrieben
  -- und liest diese Textspalten in ein `string`, nicht in ein `*string`. Ein NULL
  -- lässt sich dorthin nicht scannen, und der Fehler, den Go daraus macht, nennt
  -- weder die Spalte noch den Grund.
  --
  -- **`null` und `''` sind nicht dasselbe** — dieselbe Unterscheidung, die
  -- `zeilen.ts` an sieben Stellen trifft (`photoUrl: null` würde als leere
  -- Bildadresse durchgereicht). Beim normalen `signUp` schreibt GoTrue selbst
  -- leere Strings hinein; wer direkt in `auth.users` schreibt, macht es nach.
  confirmation_token         = '',
  recovery_token             = '',
  email_change               = '',
  email_change_token_new     = '',
  email_change_token_current = '',
  phone_change               = '',
  phone_change_token         = '',
  reauthentication_token     = ''
where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
);

-- `.invalid` ist die von der IETF dafür reservierte Endung (RFC 2606): Sie kann
-- per Definition nie jemandem gehören. `example.com` gehört der IANA und bekommt
-- die Rückläufer wirklich zugestellt.
