-- ═════════════════════════════════════════════════════════════════════════════
--  0009 — DIE MELDUNGEN BEKOMMEN EINEN LESER
--  Phase 20.7, 2026-09-13. Ians Entscheidungen 58 und 59.
-- ═════════════════════════════════════════════════════════════════════════════
--
-- ── Was diese Migration NICHT tut, und das ist der wichtigste Satz ───────────
-- Sie erteilt **kein einziges neues Recht.** Ians Entscheidung 58 lautet: Die
-- Meldungen liest ein Befehl am Mac (`npm run meldungen`), über den
-- Verbindungs-String aus `~/.simplysocial/db-url` — also als `postgres`, und der
-- umgeht RLS ohnehin. Die verworfene Möglichkeit B (eine Admin-Rolle in der App)
-- hätte hier gestanden und wäre eine Rolle gewesen, die JEDEN Chat lesen und
-- jeden fremden Post löschen darf — auf einem Gerät, das man verliert. Die 34
-- Policies bleiben Zeichen für Zeichen, wie sie waren.
--
-- Auf `reports` gibt es weiterhin nur `select, insert` für `authenticated`
-- (0007). Kein `update` heißt: Niemand in der App kann `erledigt_am` setzen, und
-- das ist keine Lücke, sondern die Zusage aus Entscheidung 58 (harte Regel 70,
-- die Frage *Zusage oder Lücke?*).
--
-- ── 1. Der Fremdschlüssel, der ein Konto UNLÖSCHBAR gemacht hätte ────────────
-- **Gemessen am 2026-09-13 an der Wegwerf-Datenbank, nicht überlegt:**
--
--   insert into reports (…, erledigt_von) values (…, ians-uuid);
--   delete from auth.users where id = ians-uuid;
--   → FEHLER: … verletzt Fremdschlüssel-Constraint »reports_erledigt_von_fkey«
--
-- Und `delete from auth.users where id = ich` ist die LETZTE Zeile von
-- `konto_loeschen()`. Wer also je eine Meldung bearbeitet, kann sein eigenes
-- Konto nie wieder löschen — und Konto-löschen ist selbst eine Apple-1.2-Pflicht.
-- **Die Spalte, die es NUR wegen Apple 1.2 gibt, hätte Apple 1.2 gebrochen.**
--
-- Die Schwesterspalte drei Zeilen darüber hat die Antwort seit dem 2026-09-06:
--
--   from_user_id uuid references profiles (id) on delete set null   ← `n`
--   erledigt_von uuid references profiles (id)                      ← `a` = NO ACTION
--
-- Dieselbe Familie wie `groups_creator_id_fkey` (Entscheidung 39) und wie das
-- `not null` an `from_user_id`, vor dem der Kommentar in 0001 wörtlich warnt:
-- *„scheitert erst, wenn wirklich jemand sein Konto löscht — also genau an dem
-- Tag, an dem es niemand mehr in Ruhe nachsehen kann."* Die eine Spalte hat die
-- Lehre bekommen, die andere nicht.
--
-- `set null` und nicht `cascade`: Eine Meldung darf nicht verschwinden, weil der
-- BEARBEITER geht — sonst nähme ein Gründer mit seinem Konto den Beleg mit, dass
-- eine Sache angesehen wurde. `erledigt_am` bleibt stehen; was verlorengeht, ist
-- nur der Name dahinter, und das ist die harmlosere Hälfte.
--
-- ── 2. Ein Bearbeiter ohne Bearbeitungszeitpunkt ist undarstellbar ───────────
-- Dieselbe Technik wie `chef_oder_aufgeloest` (0001, Entscheidung 41) und wie das
-- diskriminierte Union bei `Visibility` (harte Regel 31): Von den vier möglichen
-- Kombinationen der zwei Spalten sind DREI sinnvoll und eine ist Unsinn —
--
--   beide null                  → offen
--   beide gesetzt               → erledigt, und man weiß von wem
--   nur `erledigt_am`           → erledigt, der Bearbeiter hat sein Konto gelöscht  ← neu durch 1.
--   nur `erledigt_von`          → ??? erledigt von jemandem, nie erledigt
--
-- Der letzte Zustand entsteht durch einen Tippfehler im Werkzeug und sieht in
-- jeder Liste aus wie „offen", während `erledigt_von` behauptet, jemand habe es
-- angefasst. Ein CHECK kostet nichts und nimmt die Frage weg.
--
-- ── 3. Der Index trägt jetzt die Frist, nicht nur das Alter ──────────────────
-- Ians Entscheidung 59: **24 h bei Gefahr und Belästigung, 48 h sonst.** Der
-- Index aus 0001 sortiert offene Meldungen nach `created_at desc` — also das
-- NEUESTE zuerst. Für einen Leser ist das genau falsch herum: Gesucht wird, was
-- am längsten liegt und was am schnellsten fällig ist. Der Index steht deshalb
-- auf `reason` und `created_at` **aufsteigend**.
--
-- ⚠️ **Die Frist selbst steht NICHT hier, sondern in `features/safety/meldung.ts`**
-- (harte Regel 17 und ihre Familie). Eine Zahl in einem Index ist ein
-- Geschwindigkeits-Hinweis; die Zusage, die in den Nutzungsbedingungen landet,
-- ist eine Regel und gehört an EINE Stelle, von der aus sie sowohl der Befehl am
-- Mac als auch der Bildschirm in der App liest.
-- ═════════════════════════════════════════════════════════════════════════════

-- ── 1. ───────────────────────────────────────────────────────────────────────
alter table reports drop constraint reports_erledigt_von_fkey;
alter table reports add constraint reports_erledigt_von_fkey
  foreign key (erledigt_von) references profiles (id) on delete set null;

-- ── 2. ───────────────────────────────────────────────────────────────────────
alter table reports add constraint bearbeiter_nur_mit_zeitpunkt
  check (erledigt_von is null or erledigt_am is not null);

-- ── 3. ───────────────────────────────────────────────────────────────────────
drop index if exists reports_created_at_idx;
create index reports_offen_idx on reports (reason, created_at) where erledigt_am is null;


-- ═════════════════════════════════════════════════════════════════════════════
--  DER WÄCHTER
--
--  Bauart wie am Ende von 0008. Er misst das ERGEBNIS am Katalog und nicht den
--  Text dieser Datei — sonst prüfte sich die Datei selbst (die Lehre aus
--  `einspielen.sh`, Zähler aus `information_schema` statt Zeilen in der Datei).
-- ═════════════════════════════════════════════════════════════════════════════
do $$
declare
  regel_erledigt   "char";
  regel_melder     "char";
  n_check          int;
  konto_def        text;
begin
  select confdeltype into regel_erledigt from pg_constraint
   where conrelid = 'reports'::regclass and conname = 'reports_erledigt_von_fkey';
  select confdeltype into regel_melder from pg_constraint
   where conrelid = 'reports'::regclass and conname = 'reports_from_user_id_fkey';

  -- 'n' = SET NULL, 'a' = NO ACTION, 'c' = CASCADE.
  if regel_erledigt <> 'n' then
    raise exception '0009: reports.erledigt_von hat Löschregel %, erwartet n (set null). Wer eine Meldung bearbeitet hat, könnte sein Konto nicht mehr löschen.', regel_erledigt;
  end if;

  -- Die zwei Spalten werden GEGENEINANDER gehalten und nicht je gegen einen
  -- festen Wert. Der Fehler war ja gerade, dass sie auseinanderliefen — eine
  -- Prüfung, die beide einzeln abfragt, hätte ihn nie als Unterschied gezeigt.
  if regel_erledigt <> regel_melder then
    raise exception '0009: die zwei Verweise auf profiles in reports haben verschiedene Löschregeln (% und %).', regel_melder, regel_erledigt;
  end if;

  select count(*) into n_check from pg_constraint
   where conrelid = 'reports'::regclass and conname = 'bearbeiter_nur_mit_zeitpunkt';
  if n_check <> 1 then
    raise exception '0009: CHECK bearbeiter_nur_mit_zeitpunkt fehlt.';
  end if;

  -- Der Wächter gegen die naheliegende „Verbesserung" von morgen: Entscheidung 58
  -- steht und fällt damit, dass `konto_loeschen()` KEINE fremde ID annimmt. Wer
  -- sie ihr gibt, damit das Werkzeug am Mac ein Konto entfernen kann, macht aus
  -- ihr genau das, wovor ihr eigener Kommentar in 0003 warnt: „ein Werkzeug, mit
  -- dem man fremde Konten löscht, und `security definer` hieße, dass sie es darf."
  select pg_get_function_identity_arguments('public.konto_loeschen'::regproc) into konto_def;
  if konto_def <> '' then
    raise exception '0009: konto_loeschen() nimmt jetzt Argumente (%) — siehe den Kommentar in 0003.', konto_def;
  end if;
end $$;
