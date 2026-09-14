-- ═══════════════════════════════════════════════════════════════════════════════
--  DAS DEMO-KONTO — Phase 21.5 Punkt 1
--  Ein Konto mit Passwort, für den Apple-Reviewer und für niemanden sonst.
--  Läuft NUR gegen ein echtes Supabase (`auth.users`), nie im Prototyp.
-- ═══════════════════════════════════════════════════════════════════════════════
--
--  Aufruf über `supabase/demo/anlegen.sh` — nie von Hand. Das Skript erzeugt das
--  Passwort, entscheidet, ob es NEU gesetzt wird, und zeigt es genau einmal an.
--
--  ── Warum die acht leeren Strings hier NOCH EINMAL stehen ────────────────────
--  Sie stehen schon in `pruefen/51_konten.sql`, und die Versuchung ist, sich
--  darauf zu verlassen. Das wäre falsch: Jene Datei macht ein `update` auf Zeilen,
--  die `05_daten.sql` angelegt hat, und läuft gegen eine Wegwerf-Welt. Diese hier
--  legt eine Zeile NEU an, gegen die echte Datenbank. Die beiden teilen die Lehre,
--  nicht den Code — und die Lehre steht in FALLEN.md:
--
--    „Database error querying schema" von GoTrue heißt fast immer: acht `NULL`s in
--    `auth.users`. GoTrue ist in Go geschrieben und liest diese Textspalten in ein
--    `string`, nicht in ein `*string`. Ein NULL lässt sich dorthin nicht scannen,
--    und der Fehler nennt weder Spalte noch Grund.
--
--  Dazu `aud`, `role`, `instance_id` und ein gesetztes `email_confirmed_at` —
--  fehlt eines davon, antwortet GoTrue „Invalid login credentials", und das sieht
--  aus wie ein falsches Passwort, obwohl ein Feld fehlt. Genau diese Meldung würde
--  der Reviewer sehen, und er hätte keine Möglichkeit, sie richtig zu deuten.
--
--  ── `.invalid` ist eine Entscheidung und keine Verlegenheit ─────────────────
--  RFC 2606 reserviert die Endung; sie kann per Definition nie jemandem gehören.
--  Damit gibt es für dieses Konto KEINEN E-Mail-Weg — nicht „einen unwahrschein-
--  lichen", sondern keinen. Stünde hier `demo@simplysocial.at`, könnte jeder, dem
--  diese Domain eines Tages gehört, sich einen Code schicken lassen und wäre als
--  Demo-Konto drin; das Passwort schützt davor nichts, weil es ein ZWEITER Weg
--  zum selben Konto ist und kein Riegel vor dem ersten. Die Begründung im
--  Volltext steht in `src/features/auth/demo.ts`.
--
--  ── Wiederholbar, und das ist der Punkt ─────────────────────────────────────
--  Die IDs sind FEST (`dddddddd-…`, „d" wie Demo, und in keiner echten UUID aus
--  `gen_random_uuid()` steht so ein Muster). Ein zweiter Lauf ändert dieselbe
--  Zeile, statt eine zweite anzulegen — und `30_abraeumen.sql` fasst genau diese
--  IDs an und keine daneben (harte Regel 83).

-- ── 1. Der Eintrag bei GoTrue ────────────────────────────────────────────────
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  'dddddddd-dddd-dddd-dddd-dddddddddd01',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  -- Kleingeschrieben, und das ist keine Formatierung: `istDemoZugang()` in der App
  -- vergleicht `trim().toLowerCase()`. Stünde hier ein Großbuchstabe, fände GoTrue
  -- die Adresse nicht, die die App schickt.
  'demo@simplysocial.invalid',
  crypt(:'passwort', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  '', '', '', '', '', '', '', ''
)
on conflict (id) do update set
  -- Beim ZWEITEN Lauf wird das Passwort nur angefasst, wenn `anlegen.sh` es
  -- ausdrücklich verlangt. Der Grund ist unangenehm konkret: Sobald die
  -- Zugangsdaten in App Store Connect stehen, macht ein stillschweigend neues
  -- Passwort den dort hinterlegten Zugang ungültig — und das merkt niemand,
  -- bis der Reviewer es merkt.
  encrypted_password = case when :setze_passwort
                         then crypt(:'passwort', gen_salt('bf'))
                         else auth.users.encrypted_password end,
  email_confirmed_at = now(),
  updated_at         = now(),
  -- Auch beim `update`, denn eine Zeile, die einmal mit NULLs angelegt wurde,
  -- bleibt sonst kaputt — und zwar mit einer Meldung, die nach dem Passwort
  -- aussieht statt nach dem Feld.
  confirmation_token = '', recovery_token = '', email_change = '',
  email_change_token_new = '', email_change_token_current = '',
  phone_change = '', phone_change_token = '', reauthentication_token = '';

-- ── 2. Das Profil ────────────────────────────────────────────────────────────
--
-- **Ohne diese Zeile stünde der Reviewer im Erstes-Konto-Bildschirm** und müsste
-- Name, Bezirk und Jahrgang ausfüllen, bevor er irgendetwas sieht. Das ist kein
-- Fehler, aber es ist drei Fragen mehr als nötig — und `torwaechterZeigt()`
-- entscheidet das an genau einer Tatsache: ob es hier eine Zeile gibt.
--
-- Der Jahrgang ist 2004: Der Reviewer soll eine VOLLJÄHRIGE Ansicht sehen. Ein
-- Demo-Konto mit Jahrgang 2010 wäre in einer App, deren Altersfreigabe gerade
-- auf 13+ festgestellt wird (Phase 21.1), eine unnötige zweite Frage.
insert into profiles (id, handle, display_name, district, jahrgang, bio, interests)
values (
  'dddddddd-dddd-dddd-dddd-dddddddddd01',
  'demo', 'Demo', '1070', 2004,
  'Testzugang für die App-Prüfung.',
  '{sport,food,culture}'::activity_category[]
)
on conflict (id) do update set
  handle = excluded.handle,
  display_name = excluded.display_name,
  district = excluded.district,
  jahrgang = excluded.jahrgang,
  bio = excluded.bio,
  interests = excluded.interests;
