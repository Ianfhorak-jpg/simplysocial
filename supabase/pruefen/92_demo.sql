-- ═══════════════════════════════════════════════════════════════════════════════
--  DER DEMO-ZUGANG AUF DEM PRÜFSTAND — Phase 21.5
--  Aufruf:  npm run pruef-demo   (baut sich seine eigene Wegwerf-Datenbank)
-- ═══════════════════════════════════════════════════════════════════════════════
--
--  ── Was hier wirklich auf dem Spiel steht ───────────────────────────────────
--  Zwei Zusagen, und beide sind teuer, wenn sie still brechen:
--
--   1. **Der Reviewer kommt hinein und sieht etwas.** Bricht das, kostet es einen
--      Review-Zyklus — und man erfährt es aus einer Ablehnung, nicht aus einem Log.
--   2. **Kein echter Mensch sieht die Demo-Welt.** Bricht DAS, stehen erfundene
--      Leute im Feed von jedem, der die App lädt. Das ist der teurere Fall, weil er
--      nach Absicht aussieht.
--
--  Zusage 2 ist der Grund, warum dieser Prüfstand einen ANGRIFF fährt und nicht
--  nur nachzählt. Harte Regel 57: *Was am Server gilt, wird ANGEGRIFFEN, nicht
--  angeschaut.* Ein `select` als `postgres` bewiese gar nichts — der Eigentümer
--  einer Tabelle umgeht seine eigenen Policies.

\set demo   'dddddddd-dddd-dddd-dddd-dddddddddd01'
\set lena   'dddddddd-dddd-dddd-dddd-dddddddddd02'
\set tobias 'dddddddd-dddd-dddd-dddd-dddddddddd03'
\set fremd  'eeeeeeee-0000-0000-0000-00000000ee01'
\set postA  'dddddddd-dddd-dddd-dddd-ddddddddd0a1'
\set postE  'dddddddd-dddd-dddd-dddd-ddddddddd0a5'
\set faden  'dddddddd-dddd-dddd-dddd-ddddddddd0c1'

\echo '── 1. Das Konto: die Felder, an denen GoTrue sonst scheitert ────────────'

-- Die acht aus FALLEN.md. Geprüft wird `is not null`, NICHT `= ''` allein: Ein
-- NULL ist genau der Zustand, der „Database error querying schema" auslöst, und
-- ein Vergleich mit `= ''` liefert bei NULL selbst NULL — die Prüfung wäre dann
-- weder wahr noch falsch und ginge als „nicht gezählt" durch.
select case when count(*) = 1 then '  ✓ ' else '  ✗ FEHLT — ' end
    || 'Das Demo-Konto steht in auth.users'
  from auth.users where id = :'demo';

select case when count(*) = 1 then '  ✓ ' else '  ✗ NULL DABEI — ' end
    || 'Alle acht Textfelder sind leere Strings, keine NULLs (FALLEN.md)'
  from auth.users
 where id = :'demo'
   and confirmation_token is not null and recovery_token is not null
   and email_change is not null and email_change_token_new is not null
   and email_change_token_current is not null and phone_change is not null
   and phone_change_token is not null and reauthentication_token is not null;

select case when count(*) = 1 then '  ✓ ' else '  ✗ FEHLT — ' end
    || 'aud, role, instance_id und email_confirmed_at sind gesetzt'
  from auth.users
 where id = :'demo' and aud = 'authenticated' and role = 'authenticated'
   and instance_id is not null and email_confirmed_at is not null;

select case when count(*) = 1 then '  ✓ ' else '  ✗ FALSCH — ' end
    || 'Die Adresse ist kleingeschrieben (istDemoZugang vergleicht lowercase)'
  from auth.users where id = :'demo' and email = lower(email);

select case when count(*) = 1 then '  ✓ ' else '  ✗ ANGREIFBAR — ' end
    || 'Die Endung ist .invalid — es kann per RFC 2606 nie ein Postfach geben'
  from auth.users where id = :'demo' and email like '%@%.invalid';

select case when count(*) = 1 then '  ✓ ' else '  ✗ LEER — ' end
    || 'Es gibt einen Passwort-Hash, und er ist bcrypt'
  from auth.users where id = :'demo' and encrypted_password like '$2%';

select case when count(*) = 1 then '  ✓ ' else '  ✗ FEHLT — ' end
    || 'Das Profil steht da — der Reviewer landet NICHT im Erstes-Konto-Schritt'
  from profiles where id = :'demo';

\echo ''
\echo '── 2. Die Welt: kann der Reviewer den Durchgang überhaupt gehen? ────────'

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"dddddddd-dddd-dddd-dddd-dddddddddd01"}';

  select case when count(*) = 5 then '  ✓ ' else '  ✗ NUR ' || count(*) || ' — ' end
      || 'Das Demo-Konto sieht alle fünf Aktivitäten'
    from posts where id::text like 'dddddddd-%';

  -- Ohne einen fremden, offenen Post gibt es kein „Bin dabei" vorzuführen.
  select case when count(*) >= 3 then '  ✓ ' else '  ✗ NUR ' || count(*) || ' — ' end
      || 'Mindestens drei fremde Aktivitäten sind offen („Bin dabei" vorführbar)'
    from posts p
   where p.id::text like 'dddddddd-%' and p.status = 'open'
     and p.author_id <> 'dddddddd-dddd-dddd-dddd-dddddddddd01'
     and not exists (select 1 from join_requests r
                      where r.post_id = p.id
                        and r.from_user_id = 'dddddddd-dddd-dddd-dddd-dddddddddd01');

  -- Und ohne eine offene Anfrage AUF den eigenen Post gibt es kein „Bestätigen" —
  -- die eine Entscheidung, die diese App von einem Schwarzen Brett unterscheidet.
  select case when count(*) = 1 then '  ✓ ' else '  ✗ FEHLT — ' end
      || 'Genau eine offene Anfrage auf dem eigenen Post („Bestätigen" vorführbar)'
    from join_requests r join posts p on p.id = r.post_id
   where r.status = 'pending' and p.author_id = 'dddddddd-dddd-dddd-dddd-dddddddddd01';

  select case when count(*) = 3 then '  ✓ ' else '  ✗ ' || count(*) || ' — ' end
      || 'Der Chat hat drei Nachrichten und ist lesbar'
    from messages where thread_id = 'dddddddd-dddd-dddd-dddd-ddddddddd0c1';

  -- Ein Verlauf, der mit der EIGENEN Nachricht endet, sieht aus wie einer, auf den
  -- niemand geantwortet hat. Das ist kein Schönheitsfehler: Der Reviewer soll sehen,
  -- dass ein Match zu einem Gespräch führt, nicht zu einer Sackgasse.
  select case when count(*) = 1 then '  ✓ ' else '  ✗ FALSCH HERUM — ' end
      || 'Die letzte Nachricht kommt vom Gegenüber, nicht vom Demo-Konto'
    from (select sender_id from messages
           where thread_id = 'dddddddd-dddd-dddd-dddd-ddddddddd0c1'
           order by sent_at desc limit 1) m
   where m.sender_id <> 'dddddddd-dddd-dddd-dddd-dddddddddd01';
rollback;

\echo ''
\echo '── 3. Die Zeiten: ein Feed voller Vergangenheit ist ein Ablehnungsgrund ─'

select case when count(*) = 5 then '  ✓ ' else '  ✗ ' || count(*) || ' von 5 — ' end
    || 'Alle fünf Aktivitäten liegen in der ZUKUNFT'
  from posts where id::text like 'dddddddd-%' and starts_at > now();

select case when count(*) = 0 then '  ✓ ' else '  ✗ ' || count(*) || ' — ' end
    || 'Keine Aktivität steht auf past'
  from posts where id::text like 'dddddddd-%' and status = 'past';

\echo ''
\echo '── 4. DER ANGRIFF: sieht ein ECHTER Mensch die Demo-Welt? ───────────────'
\echo '   (harte Regel 57 — was am Server gilt, wird angegriffen, nicht angeschaut)'

-- Ein Konto, das mit der Demo-Welt nichts zu tun hat: niemandem folgend, von
-- niemandem gefolgt. Also genau das, was Ian, Christoph, Leopold, Daria und jeder
-- spätere Mensch in Wien für die Demo-Welt sind.
insert into auth.users (id, email) values (:'fremd', 'echt@simplysocial.invalid')
  on conflict do nothing;
insert into profiles (id, handle, display_name, district, jahrgang)
  values (:'fremd', 'echt', 'Echter Mensch', '1150', 2002)
  on conflict do nothing;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"eeeeeeee-0000-0000-0000-00000000ee01"}';

  select case when count(*) = 0 then '  ✓ ' else '  ✗ IM FEED — ' || count(*) || ' Stück, ' end
      || 'Ein echtes Konto sieht KEINE einzige Demo-Aktivität'
    from posts where id::text like 'dddddddd-%';

  select case when count(*) = 0 then '  ✓ ' else '  ✗ SICHTBAR — ' end
      || 'Ein echtes Konto sieht den Demo-Chat nicht'
    from chat_threads where id::text like 'dddddddd-%';

  select case when count(*) = 0 then '  ✓ ' else '  ✗ MITGELESEN — ' end
      || 'Ein echtes Konto liest die Demo-Nachrichten nicht'
    from messages where thread_id::text like 'dddddddd-%';

  select case when count(*) = 0 then '  ✓ ' else '  ✗ SICHTBAR — ' end
      || 'Ein echtes Konto sieht die Demo-Anfragen nicht'
    from join_requests where id::text like 'dddddddd-%';
rollback;

-- ⚠️ Die PROFILE sind absichtlich NICHT in dieser Liste. `profil_lesen` ist
-- `using (true)`, und das ist harte Regel 10: Wer blockiert wird, darf es nicht
-- merken — verschwände ein Profil, wäre der Block die auffälligste Sache der App.
-- Die fünf Demo-Profile sind damit für jeden lesbar, der ihre ID kennt. Das ist
-- KEINE Lücke, sondern die Policy, die es seit Phase 20.2 gibt: Ein Profil ohne
-- sichtbaren Post taucht in keiner Liste auf, weil jede Liste über Posts,
-- Anfragen oder Chats geht. Der Prüfstand sagt es hier, damit niemand die Zeile
-- später „vergessen" nachrüstet und dabei Regel 10 bricht.
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"eeeeeeee-0000-0000-0000-00000000ee01"}';
  select case when count(*) = 0 then '  ✓ ' else '  ✗ AUFFINDBAR — ' end
      || 'Kein Demo-Mensch taucht über einen sichtbaren Post auf'
    from posts p where p.author_id::text like 'dddddddd-%';
rollback;

\echo ''
\echo '── 5. Der Riegel: das Passwort gehört EINEM Konto ───────────────────────'

-- Kein zweites Konto darf ein Passwort haben. Das ist die Datenbank-Seite von
-- `demoAnmelden()`: Der Passwort-Weg ist am Server offen (gemessen 2026-09-14),
-- und was ihn für alle anderen nutzlos macht, ist ein leeres
-- `encrypted_password` — nicht die App.
select case when count(*) = 0 then '  ✓ ' else '  ✗ ' || count(*) || ' WEITERE — ' end
    || 'Kein anderes Konto in dieser Datenbank hat einen Passwort-Hash'
  from auth.users
 where id <> :'demo'
   and encrypted_password is not null and encrypted_password <> '';
