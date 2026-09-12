-- ═══════════════════════════════════════════════════════════════════════════════
--  EIN Auth-Konto OHNE Profil — Phase 20.3-b1
--  Läuft NUR gegen ein echtes Supabase, nie lokal.
-- ═══════════════════════════════════════════════════════════════════════════════
--
--  ── Warum hier direkt in `auth.users` geschrieben wird ───────────────────────
--  Weil die ECHTE Runde nicht schließbar ist, ohne nach draußen zu handeln:
--  `signInWithOtp` verschickt eine Mail, und der Code steht danach in einem
--  Postfach — in der Datenbank liegt nur sein Hash (`auth.one_time_tokens`). Eine
--  Prüfung, die Mails an erfundene Adressen schickt, handelt nach außen für etwas,
--  das drinnen bleiben soll, und verbraucht dabei die Freigrenze des Projekts.
--
--  **Was danach geprüft wird, ist trotzdem der echte Weg:** Ab dem Augenblick, in
--  dem ein Token da ist, geht die App durch `sitzungLesen()` und `profilAnlegen()`
--  — und genau die laufen hier. Nicht geprüft ist allein das Stück davor
--  (`codeAnfordern`/`codePruefen`), und das gehört in Ians Postfach.
--
--  ── Die acht leeren Strings ─────────────────────────────────────────────────
--  Dieselbe Falle wie in `51_konten.sql`: GoTrue liest sie in ein Go-`string`, und
--  ein NULL ergibt „Database error querying schema" — eine Meldung, die weder die
--  Spalte noch den Grund nennt.

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  :'konto_id'::uuid,
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  :'konto_mail',
  crypt(:'passwort', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
  '', '', '', '', '', '', '', ''
);
