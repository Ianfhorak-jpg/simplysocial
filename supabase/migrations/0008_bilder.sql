-- ═════════════════════════════════════════════════════════════════════════════
--  0008 — PROFILBILDER
--  Phase 20.6, 2026-09-12. Ians Entscheidung 50: der Bucket ist OFFEN.
-- ═════════════════════════════════════════════════════════════════════════════
--
-- Darias Wunsch vom 2026-09-02. `profiles.photo_url` steht seit 0001 da und trägt
-- seither den Kommentar „Upload kommt in 20.6"; das hier ist 20.6.
--
-- Die Regel und die verworfenen Möglichkeiten stehen in `src/features/social/bild.ts`
-- und nicht hier — diese Datei setzt sie durch (harte Regel 17, eine Ebene tiefer).
--
-- ── Was „offen" für die Bauart heißt ────────────────────────────────────────
-- Bei einem öffentlichen Bucket liefert ein CDN die Datei aus. Postgres wird beim
-- ABRUF gar nicht mehr gefragt, also greift **keine einzige der 34 Policies**. Was
-- hier unten steht, regelt deshalb nur noch das SCHREIBEN und das NACHSEHEN, nicht
-- das Sehen. Wer das verwechselt, glaubt, eine Policy schütze ein Bild.
--
-- Was ein Bild stattdessen schützt, sind zwei Dinge, und beide stehen woanders:
-- der nicht zu ratende Dateiname (`bildPfad()`) und die Tatsache, dass die Adresse
-- nur in `profiles.photo_url` steht — also in einer Tabelle MIT Policy.
--
-- ── Der Fund, der diese Datei länger gemacht hat ────────────────────────────
-- **`storage.objects.owner` hat keinen Fremdschlüssel auf `auth.users`.** Gemessen
-- am 2026-09-12; der einzige FK der Tabelle zeigt auf `storage.buckets`:
--
--     objects_bucketId_fkey | a | FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id)
--
-- Ein gelöschtes Konto lässt seine Bilder also liegen — kein Cascade, kein
-- `set null`, die Zeile bleibt mit einer `owner`-UUID stehen, die auf niemanden
-- mehr zeigt. Bei einem OFFENEN Bucket heißt das: **Das Profilbild bliebe nach dem
-- Kontolöschen im Netz abrufbar.** Ians Entscheidung 39 („alles mit") hätte für
-- Bilder stillschweigend nicht gegolten, und niemand hätte es gemerkt — es gibt
-- keine Fehlermeldung für eine Datei, die zu viel da ist.
--
-- Deshalb löscht `konto_loeschen()` sie unten ausdrücklich mit. Das ist dieselbe
-- Sorte wie `reports.from_user_id` in 20.1: ein Fremdschlüssel, der das Falsche tat
-- — nur dass es hier gar keinen gibt.
-- ═════════════════════════════════════════════════════════════════════════════


-- ── Warum es hier KEIN `revoke` gibt wie in 0007 ────────────────────────────
-- Gemessen am 2026-09-12, und es sieht zuerst aus wie derselbe Fund:
--
--     storage.objects  | anon | DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE
--     storage.buckets  | anon | DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE
--
-- Dieselbe Supabase-Voreinstellung wie in `public`, und `0007_rechte.sql` hat sie
-- dort weggenommen. **Hier wird sie NICHT weggenommen, und der Unterschied ist der
-- Eigentümer:** `public` ist unser Schema, und die Rechteliste am Fuß von 0002 ist
-- unsere Aussage (harte Regel 70). `storage` gehört `supabase_storage_admin`, und
-- der Dienst, der diese Tabellen im Betrieb benutzt, arbeitet selbst unter
-- `authenticated`. Ein `revoke` dort nähme dem Storage-Server die Rechte, mit denen
-- er hochlädt — wir würden die App reparieren, indem wir sie abschalten.
--
-- **Daraus folgt etwas, das man wissen muss:** In `public` gibt es zwei Riegel
-- (Grant und Policy), hier gibt es nur EINEN. Jede der vier Policies unten ist die
-- ganze Absicherung ihrer Richtung — es gibt nichts, was danebensteht und
-- mitfängt.
--
-- Offen ist deswegen nichts: RLS ist auf beiden Tabellen an (`rls=true`, gemessen),
-- es gibt für `anon` keine einzige Policy, und `storage` ist über PostgREST gar
-- nicht erreichbar (exponiert sind `public` und `graphql_public`). Der Prüfstand
-- am echten Server misst beides, statt es zu glauben.


-- ── Der Bucket ──────────────────────────────────────────────────────────────
--
-- `file_size_limit` und `allowed_mime_types` stehen ABSICHTLICH auch in
-- `bild.ts`. Das ist keine Doppelung aus Versehen, sondern dieselbe Anordnung wie
-- bei `jahrgang` (App prüft beim Tippen, CHECK prüft gegen alles andere): Die App
-- prüft, damit ein Mensch vor dem Warten eine Antwort bekommt — der Server prüft,
-- weil jeder mit dem anon key an der App vorbei kommt.
--
-- **Kein `image/*`:** `image/svg+xml` ist ein Bild und kann Skript enthalten. Auf
-- einem öffentlichen Bucket wäre das eine Datei auf unserer eigenen Adresse, die im
-- Browser eines Besuchers läuft.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 'avatars', true,
  5242880,                                        -- = BILD_MAX_BYTES in bild.ts
  array['image/jpeg', 'image/png', 'image/webp']  -- = BILD_TYPEN in bild.ts
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;


-- ── Wer schreiben darf ──────────────────────────────────────────────────────
--
-- Der erste Teil des Pfades ist die eigene UUID (`bildPfad()`), und genau daran
-- hängen diese vier Zeilen. Damit kann niemand in einen fremden Ordner schreiben,
-- **ohne dass eine einzige Zeile Anwendungscode das prüfen müsste** — dieselbe
-- Überlegung wie überall sonst in 0002: Was die App prüft, prüft sie für sich; was
-- hier steht, gilt auch für jemanden, der die App gar nicht benutzt.
--
-- `storage.foldername(name)` gibt die Ordner als Array; `[1]` ist der erste.
drop policy if exists avatar_eigene_lesen   on storage.objects;
drop policy if exists avatar_eigene_anlegen on storage.objects;
drop policy if exists avatar_eigene_aendern on storage.objects;
drop policy if exists avatar_eigene_loeschen on storage.objects;

-- **Lesen heißt hier AUFLISTEN, nicht Abrufen** — und deshalb steht es auf „nur die
-- eigenen". Der Abruf läuft am CDN vorbei an dieser Zeile; was sie verhindert, ist,
-- dass jemand in einen fremden Ordner schaut und den zufälligen Dateinamen dort
-- ABLIEST, statt ihn raten zu müssen. Ohne sie wäre die ganze Absicherung aus
-- Entscheidung A eine Zeile weit weg.
create policy avatar_eigene_lesen on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy avatar_eigene_anlegen on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy avatar_eigene_aendern on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Die wichtigste der vier: Ohne sie könnte niemand sein eigenes Bild loswerden —
-- und bei einem offenen Bucket ist „loswerden" die einzige Rücknahme, die es gibt.
create policy avatar_eigene_loeschen on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);


-- ── Kontolöschen und das Bild: was hier NICHT steht, und warum ──────────────
--
-- ❌ **Hier stand zuerst eine neue Fassung von `konto_loeschen()` mit einem
-- vierten Schritt** — `delete from storage.objects where …`, damit ein gelöschtes
-- Konto sein Profilbild mitnimmt (Ians Entscheidung 39, „alles mit"). Der Grund
-- dafür gilt unverändert: `storage.objects` hängt an keinem Fremdschlüssel, das
-- Konto nimmt also von selbst nichts mit.
--
-- **Der Weg geht trotzdem nicht, und es hat die Prüfung am echten Server gezeigt:**
--
--     Direct deletion from storage tables is not allowed. Use the Storage API instead.
--
-- Supabase hängt an `storage.objects` einen `before delete`-Trigger
-- (`storage.protect_delete`), der jedes SQL-`delete` abweist, solange nicht die
-- Sitzungsvariable `storage.allow_delete_query` auf `'true'` steht. Sein Hinweis
-- sagt auch, wogegen er gebaut ist: *„This prevents accidental data loss from
-- orphaned objects."* Eine gelöschte ZEILE lässt die DATEI liegen — für immer und
-- unauffindbar. Der Trigger hat also recht, und ihn mit der Sitzungsvariable zu
-- umgehen hieße, Platz gegen Ordnung zu tauschen und beides zu verlieren.
--
-- ⚠️ **Lokal war das grün.** Die Wegwerf-Datenbank hatte den Trigger nicht, also
-- lief die Migration durch und `25_bilder.sql` bestätigte sie. Am echten Server
-- war dadurch ausgerechnet `konto_loeschen()` kaputt — die Funktion hinter einer
-- Apple-1.2-Pflicht. **Seit dem 2026-09-12 bringt `00_supabase_lokal.sql` den
-- Trigger wortgleich mit** (harte Regel 85, diesmal mit umgekehrtem Vorzeichen:
-- die Attrappe war SCHWÄCHER als das Original, nicht strenger).
--
-- ── Wo das Bild stattdessen wegkommt ────────────────────────────────────────
-- Bei der APP, über die Storage-Schnittstelle, VOR dem Aufruf von
-- `konto_loeschen()` — das ist der Weg, den Supabase vorgibt. In `senden.ts`
-- steht er als `profilbildEntfernen()`, und derselbe Aufruf räumt bei jedem
-- Bildwechsel auf (`alteBilderWeg`).
--
-- **Und das ist eine Schwächung, die benannt gehört:** Bricht die App zwischen
-- den beiden Schritten ab, bleibt das Bild liegen. Am Server gibt es dagegen kein
-- Netz mehr, und es wird auch keines geben, solange die einzige Alternative das
-- Umgehen eines fremden Sicherheitstriggers ist. Der saubere Weg wäre ein
-- Aufräumer, der verwaiste Dateien später wegräumt (pg_cron + Storage-API); er
-- steht in PLAN.md unter 20.6 als offener Punkt und nicht hier.
--
-- `konto_loeschen()` bleibt deshalb **unverändert die Fassung aus 0003**.


-- ── Die Rücknahme, die eine Datei allein nicht leistet ──────────────────────
--
-- Eine Migration, aus der man eine Zeile HERAUSNIMMT, nimmt sie am Server nicht
-- zurück: Dort steht die Funktion, die beim ersten Lauf eingespielt wurde. Genau
-- das ist am 2026-09-12 passiert — Ians Datenbank trug danach die kaputte Fassung
-- mit dem verbotenen `delete`, und `konto_loeschen()` wäre für jeden Menschen
-- abgebrochen, der sein Konto löschen will.
--
-- Deshalb setzt 0008 die Funktion AUSDRÜCKLICH auf den Stand von 0003 zurück,
-- statt sie nur nicht mehr zu ändern. Wortgleich mit 0003 — wer beide nebeneinander
-- legt, sieht keinen Unterschied, und das ist der Punkt.
create or replace function public.konto_loeschen() returns void
language plpgsql security definer set search_path = '' as $$
declare
  ich    uuid := auth.uid();
  gruppe record;
  erbe   uuid;
begin
  if ich is null then
    raise exception 'nicht angemeldet' using errcode = '42501';
  end if;

  -- 1. Gruppen weitergeben — Entscheidung 13, unverändert.
  for gruppe in select id from public.groups where creator_id = ich loop
    select m.user_id into erbe
      from public.group_members m
     where m.group_id = gruppe.id and m.user_id <> ich
     order by m.joined_at
     limit 1;

    if erbe is null then
      update public.groups set aufgeloest_am = now(), creator_id = null
       where id = gruppe.id;
      delete from public.group_requests where group_id = gruppe.id;
      delete from public.group_invites  where group_id = gruppe.id;
    else
      update public.groups set creator_id = erbe where id = gruppe.id;
    end if;
  end loop;

  -- 2. Chats, in denen ich war, verschwinden ganz.
  delete from public.chat_threads t
   where exists (select 1 from public.chat_participants p
                  where p.thread_id = t.id and p.user_id = ich);

  -- 3. Das Konto selbst. **Das Profilbild geht NICHT mit** — siehe den Absatz
  --    darüber; es ist die App, die es vorher wegräumt.
  delete from auth.users where id = ich;
end $$;

grant execute on function public.konto_loeschen() to authenticated;


-- ── Nachmessen statt „fertig" melden ────────────────────────────────────────
--
-- Die Lehre vom 2026-09-11 (ein Build meldete „erfolgreich" und hatte das falsche
-- Profil eingebacken) und von 0005 (der leeren Publication): Eine Migration, die
-- nur durchläuft, hat nichts belegt.
do $$
declare
  b_public  boolean;
  b_limit   bigint;
  b_typen   text[];
  n_policy  int;
begin
  select public, file_size_limit, allowed_mime_types
    into b_public, b_limit, b_typen
    from storage.buckets where id = 'avatars';

  if b_public is null then
    raise exception '0008: Bucket avatars fehlt.';
  end if;
  if not b_public then
    raise exception '0008: Bucket avatars ist nicht öffentlich — Entscheidung 50 ist A.';
  end if;
  if b_limit <> 5242880 then
    raise exception '0008: file_size_limit ist %, erwartet 5242880 (= BILD_MAX_BYTES).', b_limit;
  end if;
  -- Die Whitelist wird der LÄNGE nach geprüft und nicht nur auf „enthält jpeg":
  -- ein zusätzliches `image/svg+xml` wäre genau der Fall, den sie verhindern soll,
  -- und ein `@>` würde ihn durchlassen.
  if array_length(b_typen, 1) <> 3
     or not (b_typen @> array['image/jpeg','image/png','image/webp']) then
    raise exception '0008: allowed_mime_types ist %, erwartet genau die drei aus bild.ts.', b_typen;
  end if;

  select count(*) into n_policy from pg_policies
   where schemaname = 'storage' and tablename = 'objects' and policyname like 'avatar_%';
  if n_policy <> 4 then
    raise exception '0008: % avatar-Policies statt 4.', n_policy;
  end if;

  -- Der Wächter gegen den eigenen Fehler vom 2026-09-12: Steht in
  -- `konto_loeschen()` wieder ein `delete` auf `storage.objects`, bricht der
  -- Trigger `protect_delete` erst dann ab, wenn ein Mensch sein Konto löschen
  -- will — also an der Stelle, an der es niemand mehr rechtzeitig merkt.
  if pg_get_functiondef('public.konto_loeschen'::regproc) like '%storage.objects%' then
    raise exception '0008: konto_loeschen() fasst storage.objects an — das weist protect_delete ab.';
  end if;
end $$;
