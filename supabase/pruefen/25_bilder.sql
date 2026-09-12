-- ═══════════════════════════════════════════════════════════════════════════════
--  DER PRÜFSTEIN VON PHASE 20.6 — die PROFILBILDER
--
--  `10_angriff.sql` fragt *kommt jemand an Daten, an die er nicht darf?*,
--  `20_transaktionen.sql` *tut ein Schreibvorgang, was Ians Regel sagt?* — und
--  diese Datei fragt beides für einen Ort, an dem es nur EINEN Riegel gibt.
--
--  ── Warum das hier anders liegt als überall sonst ──────────────────────────
--  In `public` sichern zwei Dinge: die Rechteliste (harte Regel 70, seit 0007 auch
--  am echten Server durchgesetzt) UND die Policy. In `storage` gibt es nur die
--  Policy — `anon` und `authenticated` haben dort am echten Supabase alle Rechte,
--  und wegnehmen darf man sie nicht, ohne den Storage-Dienst abzuschalten (siehe
--  den Kopf von 0008). **Jede der vier Policies ist die ganze Absicherung ihrer
--  Richtung.**
--
--  ── Was hier NICHT geprüft wird, und wo es steht ───────────────────────────
--  Ob eine gelöschte Zeile den öffentlichen ABRUF wirklich beendet. Das ist eine
--  Frage an das CDN und nicht an Postgres — sie gehört an den echten Server und
--  steht in `80_bilder.mjs`.
-- ═══════════════════════════════════════════════════════════════════════════════

\set ian  '11111111-1111-1111-1111-111111111111'
\set lea  '22222222-2222-2222-2222-222222222222'

\echo ''
\echo '════ PHASE 20.6 — Profilbilder ══════════════════════════════════════════'
\echo '── Der Bucket trägt Ians Entscheidung 50 ────────────────────────────────'

do $$
declare b record; n int;
begin
  select * into b from storage.buckets where id = 'avatars';

  if b.public then raise notice '  ✓ der Bucket ist OFFEN (Entscheidung 50, A)';
  else raise notice '  ✗ FEHLT — der Bucket ist offen'; end if;

  if b.file_size_limit = 5242880 then raise notice '  ✓ 5 MB Obergrenze, dieselbe Zahl wie BILD_MAX_BYTES';
  else raise notice '  ✗ FEHLT — 5 MB Obergrenze (ist: %)', b.file_size_limit; end if;

  -- Der LÄNGE nach, nicht nur „enthält jpeg": Ein zusätzliches `image/svg+xml`
  -- wäre genau der Fall, den die Whitelist verhindern soll.
  if array_length(b.allowed_mime_types,1) = 3
     and b.allowed_mime_types @> array['image/jpeg','image/png','image/webp']
  then raise notice '  ✓ genau drei Bildtypen — kein `image/*`, also kein SVG';
  else raise notice '  ✗ FEHLT — genau drei Bildtypen (ist: %)', b.allowed_mime_types; end if;

  select count(*) into n from pg_policies
   where schemaname='storage' and tablename='objects' and policyname like 'avatar_%';
  if n = 4 then raise notice '  ✓ vier Policies, und sie sind der EINZIGE Riegel';
  else raise notice '  ✗ FEHLT — vier avatar-Policies (ist: %)', n; end if;
end $$;

\echo '── In den EIGENEN Ordner schreiben: geht ────────────────────────────────'
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  do $$
  declare n int;
  begin
    insert into storage.objects (bucket_id, name, owner)
    values ('avatars', '11111111-1111-1111-1111-111111111111/a1b2c3.jpg',
            '11111111-1111-1111-1111-111111111111');
    select count(*) into n from storage.objects
     where name = '11111111-1111-1111-1111-111111111111/a1b2c3.jpg';
    if n = 1 then raise notice '  ✓ Ian legt ein Bild in seinen eigenen Ordner';
    else raise notice '  ✗ FEHLT — Ian legt ein Bild in seinen eigenen Ordner'; end if;
  end $$;
rollback;

\echo '── In einen FREMDEN Ordner schreiben: 42501 ─────────────────────────────'
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  do $$
  begin
    -- Ians Pfad, aber Leas Ordner. Das ist der Angriff, gegen den der Pfad
    -- überhaupt so gebaut ist (`bildPfad()` setzt die eigene UUID nach vorn).
    insert into storage.objects (bucket_id, name, owner)
    values ('avatars', '22222222-2222-2222-2222-222222222222/untergeschoben.jpg',
            '11111111-1111-1111-1111-111111111111');
    raise notice '  ✗ OFFEN — Ian hat in Leas Ordner geschrieben!';
  exception when others then
    -- Verlangt wird der CODE und nicht „ist fehlgeschlagen" (harte Regel 57):
    -- Ein Insert, der an einem CHECK scheitert, wäre sonst „von RLS abgewiesen".
    if SQLSTATE = '42501' then raise notice '  ✓ ein fremder Ordner wird abgewiesen (42501)';
    else raise notice '  ✗ abgewiesen, aber mit % statt 42501', SQLSTATE; end if;
  end $$;
rollback;

\echo '── Der Grenzfall von `storage.foldername`: kein Ordner ──────────────────'
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  do $$
  begin
    -- Ein Name OHNE `/`. `foldername` gibt dann ein LEERES Array zurück
    -- (`_parts[1:0]`), also ist `[1]` null und der Vergleich ergibt null — also
    -- nicht wahr. Das ist richtig, aber es steht nirgends hingeschrieben: Es ist
    -- eine Nebenwirkung der Supabase-Funktion. Deshalb wird es gemessen.
    insert into storage.objects (bucket_id, name, owner)
    values ('avatars', 'direkt-in-die-wurzel.jpg', '11111111-1111-1111-1111-111111111111');
    raise notice '  ✗ OFFEN — eine Datei ohne Ordner ist durchgekommen!';
  exception when others then
    if SQLSTATE = '42501' then raise notice '  ✓ eine Datei ohne Ordner wird abgewiesen (null [1])';
    else raise notice '  ✗ abgewiesen, aber mit % statt 42501', SQLSTATE; end if;
  end $$;
rollback;

\echo '── Fremde Zeilen: nicht sehen, nicht ändern ────────────────────────────'
begin;
  set local role postgres;
  insert into storage.objects (bucket_id, name, owner)
  values ('avatars', '22222222-2222-2222-2222-222222222222/leas-bild.jpg',
          '22222222-2222-2222-2222-222222222222');

  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  do $$
  declare n int; geaendert int;
  begin
    -- NACHSEHEN. Der Abruf einer bekannten Adresse ist bei einem offenen Bucket
    -- Absicht; was hier verhindert wird, ist das AUFLISTEN — sonst liest jemand
    -- den zufälligen Dateinamen ab, statt ihn raten zu müssen, und die ganze
    -- Absicherung aus Entscheidung 50 wäre eine Zeile weit weg.
    select count(*) into n from storage.objects
     where name like '22222222-2222-2222-2222-222222222222/%';
    if n = 0 then raise notice '  ✓ Ian sieht Leas Ordner nicht — der Zufallsname bleibt geheim';
    else raise notice '  ✗ OFFEN — Ian sieht % Zeile(n) in Leas Ordner', n; end if;

    -- ÄNDERN. Hier ist die Abweisung STILL: kein Fehler, null Zeilen — dieselbe
    -- Sorte, an der `beitrittZuruecknehmen` am 2026-09-12 aufgefallen ist (harte
    -- Regel 85). Deshalb wird gezählt und nicht auf einen Code gewartet.
    update storage.objects set name = '11111111-1111-1111-1111-111111111111/geklaut.jpg'
     where name like '22222222-2222-2222-2222-222222222222/%';
    get diagnostics geaendert = row_count;

    set local role postgres;
    select count(*) into n from storage.objects
     where name = '22222222-2222-2222-2222-222222222222/leas-bild.jpg';
    if geaendert = 0 and n = 1 then
      raise notice '  ✓ … und kann Leas Zeile auch nicht auf sich umschreiben (still, 0 Zeilen)';
    else
      raise notice '  ✗ OFFEN — Ian hat % Zeile(n) geändert, Leas übrig: %', geaendert, n;
    end if;
  end $$;
rollback;

-- ⚠️ **Was hier NICHT geprüft werden KANN, und das ist kein Versäumnis:** die
-- `delete`-Policy. Jedes SQL-`delete` auf `storage.objects` scheitert vorher am
-- Trigger `protect_delete` — er ist `BEFORE DELETE FOR EACH STATEMENT` und läuft
-- damit VOR RLS. Die Policy `avatar_eigene_loeschen` ist über SQL also gar nicht
-- erreichbar; sie wirkt ausschließlich über die Storage-Schnittstelle, die die
-- Sitzungsvariable setzt. **Gemessen wird sie deshalb in `80_bilder.mjs`, am
-- echten Server, über dieselbe Schnittstelle, die auch die App benutzt.**
--
-- Der erste Entwurf dieser Datei hat das nicht gewusst und ein `delete` geprüft;
-- er war grün, solange die Attrappe den Trigger nicht hatte. Das ist dieselbe
-- Lehre wie eine Zeile weiter unten, nur an der Prüfung statt an der Migration.

\echo '── Kontolöschen fasst das Bild NICHT an — und das ist gemessen ─────────'
begin;
  set local role postgres;
  insert into storage.objects (bucket_id, name, owner)
  values ('avatars', '11111111-1111-1111-1111-111111111111/ians-bild.jpg',
          '11111111-1111-1111-1111-111111111111');

  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  do $$
  declare meins int;
  begin
    -- ❌ **Hier stand am 2026-09-12 das Gegenteil, und die Prüfung war GRÜN.**
    -- 0008 hatte einen vierten Schritt in `konto_loeschen()`, der das Bild
    -- mitlöschte; lokal lief er durch, weil die Attrappe Supabases Trigger
    -- `protect_delete` nicht hatte. Am echten Server brach genau diese Funktion
    -- ab — die hinter einer Apple-1.2-Pflicht. **Seither bringt
    -- `00_supabase_lokal.sql` den Trigger wortgleich mit**, und diese Prüfung
    -- misst, was wirklich gilt.
    perform public.konto_loeschen();

    set local role postgres;
    select count(*) into meins from storage.objects
     where name like '11111111-1111-1111-1111-111111111111/%';

    if meins = 1 then raise notice '  ✓ `konto_loeschen` läuft durch und lässt das Bild stehen';
    else raise notice '  ✗ FEHLT — das Bild steht noch da (ist: % Zeile(n))', meins; end if;
  end $$;
rollback;

\echo '── Warum es nicht anders geht: der Trigger von Supabase ─────────────────'
begin;
  set local role postgres;
  insert into storage.objects (bucket_id, name, owner)
  values ('avatars', '11111111-1111-1111-1111-111111111111/ians-bild.jpg',
          '11111111-1111-1111-1111-111111111111');
  do $$
  begin
    -- Die Gegenprobe zur Prüfung darüber, und die eigentliche Aussage: Ein
    -- SQL-`delete` auf `storage.objects` wird abgewiesen, auch als `postgres`.
    -- Wer in `konto_loeschen()` wieder eines hinschreibt, bekommt hier ein Kreuz
    -- — statt es erst zu merken, wenn ein Mensch sein Konto löschen will.
    delete from storage.objects where bucket_id = 'avatars';
    raise notice '  ✗ ACHTUNG — das SQL-delete ist durchgekommen (Trigger fehlt in der Attrappe?)';
  exception when others then
    if SQLSTATE = '42501' then
      raise notice '  ✓ ein SQL-`delete` weist `protect_delete` ab — auch als postgres';
    else
      raise notice '  ✗ abgewiesen, aber mit % statt 42501', SQLSTATE;
    end if;
  end $$;
rollback;

\echo '── Ein anderer Bucket geht niemanden etwas an ───────────────────────────'
begin;
  set local role postgres;
  insert into storage.buckets (id, name, public) values ('geheim', 'geheim', false)
    on conflict (id) do nothing;

  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  do $$
  begin
    -- Der eigene Ordner, aber ein fremder Bucket. Alle vier Policies fragen
    -- `bucket_id = 'avatars'` UND den Ordner — nicht nur den Ordner. Ohne den
    -- ersten Teil wäre jeder künftige Bucket (Post-Bilder, Belege) ab seiner
    -- Anlage für jeden offen, und zwar ohne dass jemand etwas geändert hätte.
    insert into storage.objects (bucket_id, name, owner)
    values ('geheim', '11111111-1111-1111-1111-111111111111/x.jpg',
            '11111111-1111-1111-1111-111111111111');
    raise notice '  ✗ OFFEN — in einen fremden Bucket geschrieben!';
  exception when others then
    if SQLSTATE = '42501' then raise notice '  ✓ ein anderer Bucket wird abgewiesen (42501)';
    else raise notice '  ✗ abgewiesen, aber mit % statt 42501', SQLSTATE; end if;
  end $$;
rollback;
