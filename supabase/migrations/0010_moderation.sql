-- ═════════════════════════════════════════════════════════════════════════════
--  0010 — DER LESER DARF AUCH HANDELN
--  Phase 20.7-b, 2026-09-13. Ians Entscheidung 72.
-- ═════════════════════════════════════════════════════════════════════════════
--
-- 20.7 hat den Meldungen einen Leser gegeben. Was fehlte, ist die andere Hälfte
-- der Apple-1.2-Pflicht: **Inhalte entfernen und Nutzer ausschließen.** Gemessen
-- war der Zustand eindeutig — `posts_loeschen` lässt nur `author_id = auth.uid()`
-- durch, auf `profiles` gibt es gar kein `delete`: Das konnte bis heute NIEMAND,
-- auch nicht von Hand.
--
-- ── Ians Entscheidung 72: ausschließen heißt LÖSCHEN ─────────────────────────
-- Gefragt war, was passiert, wenn jemand aus SimplySocial fliegt. Drei
-- Möglichkeiten lagen vor:
--
--   A. **Konto löschen** — alles weg, wie beim Selbst-Löschen.   ← seine Wahl
--   B. Sperrliste — die Mailadresse kommt auf eine Liste, das Konto bleibt
--      stehen, er kommt nicht mehr hinein.
--   C. Beides, je nach Fall.
--
-- Den Haken kennt er und hat ihn gewählt: **Wer fliegt, macht sich in fünf
-- Minuten ein neues Konto mit einer anderen Mailadresse, und niemand merkt es.**
-- B wäre die ehrlichere Antwort auf Wiederholungstäter gewesen und hätte eine
-- neue Tabelle plus eine Prüfung bei JEDER Anmeldung gekostet — dazu Daten von
-- jemandem, der weg ist, die weiter dastehen.
--
-- ⚠️ **Wird die Sperrliste je nachgerüstet, ist das eine neue Entscheidung von
-- Ian und kein Nachtrag** (harte Regel 58).
--
-- ── Warum es KEIN `post_entfernen()` gibt, und das ist Absicht ───────────────
-- Harte Regel 70 sagt: *Ein fehlender Grant verlangt eine Funktion, WENN etwas
-- zu entscheiden ist.* Beim Post ist nichts zu entscheiden — gemessen:
--
--   join_requests.post_id  → CASCADE    die Anfragen gehen mit
--   chat_threads.post_id   → SET NULL   der Chat BLEIBT (Entscheidung 42)
--
-- Ein `delete from posts where id = …` ist damit vollständig, und das Werkzeug
-- läuft über die db-url ohnehin als `postgres`. Eine Funktion wäre hier dieselbe
-- Überflüssigkeit wie beim Trigger `nachricht_notiert`, vor der Regel 70 in
-- ihrem zweiten Halbsatz warnt.
--
-- Dass der Chat stehenbleibt, ist kein Versehen: Zwei Leute, die sich getroffen
-- haben, verlieren ihr Gespräch nicht, weil ein Dritter den Aushang gemeldet
-- hat. Oben im Chat steht dann `VERWAIST_TEXT` (Ians Entscheidung 42).
--
-- ── Der teuerste Fund, und er ist GEMESSEN ──────────────────────────────────
-- In Postgres bekommt `PUBLIC` standardmäßig `EXECUTE` auf **jede** neue
-- Funktion. Nachgemessen an der Wegwerf-Datenbank UND am echten Supabase, an
-- allen neun bestehenden `public.`-Funktionen:
--
--   anfrage_bestaetigen … konto_loeschen   | anon: true | auth: true
--
-- Für die neun ist das folgenlos — **jede prüft selbst**, wer sie ruft
-- (harte Regel 70), und `konto_loeschen()` bricht bei `auth.uid() is null` ab.
-- Die `grant execute … to authenticated` in 0004 erteilen also etwas, das ohnehin
-- da war; dieselbe Familie wie die Rechteliste aus 0002 (harte Regel 85).
--
-- **Für `konto_entfernen(wen)` gilt das NICHT, und darin liegt der Unterschied:**
-- Diese Funktion KANN keine Selbstprüfung haben — ihr Zweck IST das fremde
-- Konto. Ohne ein ausdrückliches `revoke` wäre sie ein Knopf, mit dem jeder
-- Angemeldete jedes Konto der App löscht. Genau das Gegenteil von Entscheidung 58
-- („der stärkste Schlüssel des Projekts liegt auf einem Mac, nicht auf einem
-- Handy"). Der Wächter am Dateiende misst es in beide Richtungen.
--
-- ── Warum `konto_loeschen()` umgebaut wird, obwohl sie läuft ────────────────
-- Der naheliegende Weg wäre gewesen, den Rumpf von 0003 zu kopieren und
-- `auth.uid()` durch `wen` zu ersetzen. Dann stünde die Erbfolge aus
-- Entscheidung 13 **zweimal** da — und wer sie eines Tages ändert, ändert eine
-- von beiden. Das fällt NIE auf, weil man selten fremde Konten löscht.
--
-- Also: ein gemeinsamer Rumpf (`konto_weg`), zwei Türen davor.
-- `konto_loeschen()` nimmt dabei **weiter keine Argumente** — der Wächter aus
-- 0009 bleibt Zeichen für Zeichen erfüllt, und ihr Kommentar in 0003 („mit einem
-- Parameter wäre sie ein Werkzeug, mit dem man fremde Konten löscht") stimmt
-- unverändert. Das fremde Konto hat jetzt eine EIGENE Tür, und die ist zu.
-- ═════════════════════════════════════════════════════════════════════════════

-- ── 1. Der gemeinsame Rumpf ─────────────────────────────────────────────────
--
-- Wortgleich der Rumpf aus 0003, mit `wen` statt `ich`. Er hat KEINE Prüfung auf
-- „darf der das?" — die sitzt an den zwei Türen davor, und das ist der ganze
-- Entwurf: Ein Rumpf, der selbst prüft, müsste beide Fälle kennen und wäre damit
-- die Verzweigung, die er vermeiden soll.
create function public.konto_weg(wen uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  gruppe record;
  erbe   uuid;
begin
  if wen is null then
    raise exception 'konto_weg: keine ID' using errcode = '22004';
  end if;

  -- 1. Gruppen weitergeben — Entscheidung 13, unverändert aus 0003.
  for gruppe in select id from public.groups where creator_id = wen loop
    select m.user_id into erbe
      from public.group_members m
     where m.group_id = gruppe.id and m.user_id <> wen
     order by m.joined_at
     limit 1;

    if erbe is null then
      -- AUFLÖSEN, nicht löschen — Entscheidung 41. Ein `delete` nähme über
      -- `on delete cascade` die Gruppen-Posts ANDERER Leute mit.
      update public.groups set aufgeloest_am = now(), creator_id = null
       where id = gruppe.id;
      delete from public.group_requests where group_id = gruppe.id;
      delete from public.group_invites  where group_id = gruppe.id;
    else
      update public.groups set creator_id = erbe where id = gruppe.id;
    end if;
  end loop;

  -- 2. Chats, in denen er war, verschwinden ganz. Übrig bliebe sonst ein Faden
  --    mit EINER Person darin, in den niemand mehr schreiben kann.
  delete from public.chat_threads t
   where exists (select 1 from public.chat_participants p
                  where p.thread_id = t.id and p.user_id = wen);

  -- 3. Das Konto selbst. Alles Übrige hängt an `on delete cascade`.
  --    NICHT daran hängen die MELDUNGEN — dort steht `on delete set null`, an
  --    BEIDEN Verweisen seit 0009 (harte Regel 98). Was jemand gemeldet hat und
  --    was jemand bearbeitet hat, überlebt sein Konto.
  delete from auth.users where id = wen;
end $$;

comment on function public.konto_weg(uuid) is
  'Der gemeinsame Rumpf hinter konto_loeschen() und konto_entfernen(). Prüft '
  'NICHT, wer ruft — das tun die zwei Türen davor. Kein grant, siehe Wächter.';

-- ⚠️ PFLICHT und nicht Zierde: Ohne diese Zeile darf sie jeder Angemeldete rufen
-- (und `anon` auch). Gemessen, siehe oben.
revoke all on function public.konto_weg(uuid) from public, anon, authenticated;

-- ── 2. Die eigene Tür: das eigene Konto ─────────────────────────────────────
--
-- Unverändert in Bedeutung und Rechten, nur der Rumpf ist jetzt ausgelagert.
-- **Weiterhin ohne Argumente** — der Wächter in 0009 verlangt das, und seine
-- Begründung in 0003 gilt Wort für Wort weiter.
create or replace function public.konto_loeschen() returns void
language plpgsql security definer set search_path = '' as $$
declare ich uuid := auth.uid();
begin
  -- Ohne Anmeldung gibt es kein Konto zu löschen. DIESE Zeile ist die Tür.
  if ich is null then
    raise exception 'nicht angemeldet' using errcode = '42501';
  end if;
  perform public.konto_weg(ich);
end $$;

comment on function public.konto_loeschen() is
  'Löscht das Konto des Aufrufers. Ians Entscheidung 39 (A, „alles mit") — mit '
  'Ausnahme der Gruppen, die nach Entscheidung 13 weitergegeben werden. Der '
  'Rumpf steht seit 0010 in konto_weg(); diese Funktion IST die Berechtigung.';

grant execute on function public.konto_loeschen() to authenticated;

-- ── 3. Die fremde Tür: ein Konto ausschließen ───────────────────────────────
--
-- Ians Entscheidung 72. Erreichbar AUSSCHLIESSLICH über die db-url, also als
-- `postgres` — das ist Entscheidung 58 in SQL gegossen: kein Weg aus der App
-- hinein, auf keinem Handy, für niemanden.
create function public.konto_entfernen(wen uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare vorhanden boolean;
begin
  -- Eine ID, die es nicht gibt, ist ein Tippfehler und keine erledigte Arbeit.
  -- Ohne diese Prüfung meldete das Werkzeug „erledigt" für ein Konto, das
  -- weiterbesteht — dieselbe Familie wie `update … returning` in psql, das
  -- Erfolg meldet, obwohl nichts geschah (20.7).
  select exists (select 1 from auth.users where id = wen) into vorhanden;
  if not vorhanden then
    raise exception 'konto_entfernen: kein Konto mit dieser ID' using errcode = 'P0002';
  end if;
  perform public.konto_weg(wen);
end $$;

comment on function public.konto_entfernen(uuid) is
  'Schließt jemanden aus: löscht sein Konto. Ians Entscheidung 72 (Phase 20.7-b, '
  'Apple 1.2). NUR über die db-url erreichbar — kein grant, siehe Wächter.';

revoke all on function public.konto_entfernen(uuid) from public, anon, authenticated;

-- ═════════════════════════════════════════════════════════════════════════════
--  DER WÄCHTER
-- ═════════════════════════════════════════════════════════════════════════════
do $$
declare
  offen text;
  konto_def text;
begin
  -- 1. Die zwei Moderations-Funktionen dürfen für NIEMANDEN in der App
  --    ausführbar sein. Gefragt wird `has_function_privilege` und nicht das
  --    rohe `proacl`: Ein NULL-ACL bedeutet „Standard", und der Standard ist
  --    hier ausgerechnet `true` — wer die Spalte liest, sieht nichts und
  --    schließt daraus das Gegenteil.
  select string_agg(p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')'
                    || ' → anon:' || has_function_privilege('anon', p.oid, 'EXECUTE')::text
                    || ' auth:'   || has_function_privilege('authenticated', p.oid, 'EXECUTE')::text,
                    ', ')
    into offen
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.proname in ('konto_weg', 'konto_entfernen')
     and (has_function_privilege('anon', p.oid, 'EXECUTE')
          or has_function_privilege('authenticated', p.oid, 'EXECUTE'));

  if offen is not null then
    raise exception '0010: aus der App erreichbar, obwohl Entscheidung 58 das Gegenteil sagt: %', offen;
  end if;

  -- 2. Die Gegenprobe dazu — sonst wäre Prüfung 1 auch grün, wenn es die
  --    Funktionen gar nicht gibt. Ein Wächter, der bei ABWESENHEIT zufrieden
  --    ist, deckt das Interessante nicht ab.
  if (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.proname in ('konto_weg', 'konto_entfernen')) <> 2 then
    raise exception '0010: konto_weg und/oder konto_entfernen fehlen.';
  end if;

  -- 3. Und das eigene Löschen muss WEITERHIN gehen — der Umbau darf die
  --    Apple-1.2-Pflicht nicht nebenbei zusperren.
  if not has_function_privilege('authenticated', 'public.konto_loeschen()', 'EXECUTE') then
    raise exception '0010: konto_loeschen() ist für authenticated nicht mehr ausführbar.';
  end if;

  -- 4. Derselbe Wächter wie in 0009, weil 0010 die Funktion ANFASST: Sie nimmt
  --    weiter keine Argumente. Der Kommentar in 0003 begründet das, und hier
  --    wäre die Gelegenheit gewesen, es aus Bequemlichkeit zu ändern.
  select pg_get_function_identity_arguments('public.konto_loeschen'::regproc) into konto_def;
  if konto_def <> '' then
    raise exception '0010: konto_loeschen() nimmt jetzt Argumente (%) — siehe 0003 und 0009.', konto_def;
  end if;
end $$;
