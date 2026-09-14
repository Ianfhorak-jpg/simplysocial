-- ═════════════════════════════════════════════════════════════════════════════
--  0012 — DER TREFFEN-ZÄHLER
--  Phase 20.12 (Gamification), 2026-09-14. Ians Entscheidung 83.
-- ═════════════════════════════════════════════════════════════════════════════
--
-- Ians Satz: *„Inspiriere dich von Tinder und anderen Plattformen, GAMIFICATION ist
-- ein Keyword."* Aus vier vorgelegten Möglichkeiten hat er „Wischgefühl" und
-- „Zähler im Profil" gewählt — und beim Zähler den Weg über den Server.
--
-- ── WARUM ES DIESE SPALTE ÜBERHAUPT BRAUCHT ─────────────────────────────────
-- Die naheliegende Lösung wäre, die Zahl im Client aus `join_requests` zu rechnen.
-- **Das ist unmöglich, und zwar mit Absicht.** Policy `anfragen_lesen` (0002):
--
--     from_user_id = auth.uid()
--     or exists (select 1 from posts p where p.id = post_id and p.author_id = auth.uid())
--
-- Man sieht nur die eigenen Anfragen und die an die eigenen Posts. Der Kommentar
-- daneben sagt ausdrücklich, dass das keine Lücke ist: *„Sie ist hier nicht 'nicht
-- eingebaut', sie ist UNMÖGLICH."* Wer die Zahl eines FREMDEN Profils rechnen
-- wollte, müsste dessen Anfragen lesen dürfen — und genau daraus ließe sich
-- ableiten, wo diese Person sonst noch hingeht, auch aus privaten Gruppen.
--
-- **Eine aggregierte Zahl verrät das nicht.** „12 Treffen" sagt nichts darüber, mit
-- wem, wann oder wo. Deshalb ist eine gezählte Spalte hier nicht der bequemere Weg,
-- sondern der einzige, der die Zusage von 0002 nicht bricht.
--
-- ── WARUM EIN TRIGGER UND KEIN CODE IN `anfrage_bestaetigen` ────────────────
-- Der bestehende Trigger `nachricht_notiert` (0004) beantwortet die Frage schon:
-- *„Ein fehlender Grant verlangt eine Funktion, WENN etwas zu entscheiden ist. Hier
-- ist nichts zu entscheiden — es ist eine Buchhaltung, die immer gilt."*
--
-- Bei einem Zähler kommt ein zweiter Grund dazu, und der ist der wichtigere:
-- **Zähler-Code in `anfrage_bestaetigen` wäre farmbar.** Zurücknehmen ist ein
-- DELETE (Policy `anfragen_zuruecknehmen`, 0006) **ohne Status-Prüfung** — auch eine
-- BESTÄTIGTE Anfrage lässt sich löschen. Wer nur beim Bestätigen hochzählt, lässt
-- sich von einem Komplizen zehnmal bestätigen, löscht jedes Mal und steht bei zehn
-- Treffen. Ein Trigger sieht den Statuswechsel UND das Löschen, und er sieht sie
-- auch dann, wenn irgendwann ein zweiter Schreibweg dazukommt, an den heute niemand
-- denkt.
--
-- ── WAS ALS TREFFEN ZÄHLT, UND FÜR WEN ──────────────────────────────────────
-- Eine bestätigte Anfrage ist EIN Treffen für ZWEI Menschen:
--
--     der Gast    (`from_user_id`)  — zählt bei jeder eigenen Zusage
--     der Poster  (`posts.author_id`) — zählt NUR beim ERSTEN bestätigten Gast
--
-- **Die Einschränkung beim Poster ist der Kern.** Ein Post mit drei Plätzen ist ein
-- Termin, nicht drei: Wer einmal Tennis spielt und drei Leute mitnimmt, war bei
-- EINEM Treffen. Ohne diese Bedingung stünde bei jemandem, der große Runden
-- organisiert, das Dreifache von jemandem, der gleich oft dabei war — und der
-- Zähler belohnte das Anlegen großer Posts statt das Treffen.
--
-- ⚠️ **Was bewusst NICHT geprüft wird: ob das Treffen stattgefunden hat.** Die App
-- weiß das nicht und kann es nicht wissen — es gibt kein „war da"-Häkchen (und das
-- wäre eine eigene Entscheidung, keine Ergänzung hier). Gezählt wird die ZUSAGE.
-- Wer absagt, indem er die Anfrage zurückzieht, verliert sie wieder.

-- ── Die Spalte ───────────────────────────────────────────────────────────────
--
-- `not null default 0`: Es gibt keinen Unterschied zwischen „noch nie" und „null
-- Treffen" — beides ist dieselbe Aussage, und ein `null` zwänge jede Anzeige zu
-- einer Fallunterscheidung ohne Bedeutung. (Anders als bei `terms_accepted_at` in
-- 0011, wo `null` „nie gefragt worden" heißt und damit etwas ANDERES als ein Wert.)
--
-- Der CHECK ist kein Schmuck: Ein Zähler, der durch einen Fehler unter null
-- rutscht, ist stiller Unsinn — erst recht, weil der Trigger unten auch
-- herunterzählt. Lieber ein lauter Abbruch als eine Zahl, der niemand mehr glaubt.
alter table profiles
  add column treffen_anzahl integer not null default 0
    check (treffen_anzahl >= 0);

comment on column profiles.treffen_anzahl is
  'Bestätigte Verabredungen dieser Person. Gepflegt AUSSCHLIESSLICH vom Trigger '
  '`treffen_buchen` — nie von Hand und nie aus der App schreiben. Ein Post mit '
  'mehreren Gästen zählt für den Verfasser als EIN Treffen (erster Gast).';

-- ── Die Buchhaltung ──────────────────────────────────────────────────────────
--
-- Eine Funktion für beide Richtungen: `+1` und `-1` sind dieselbe Regel mit anderem
-- Vorzeichen, und zweimal geschrieben liefen sie beim nächsten Umbau auseinander.
create function regel.treffen_buchen_fuer(wer uuid, wieviel integer) returns void
language plpgsql security definer set search_path = '' as $$
begin
  -- `greatest(…, 0)` ist der Gürtel zum Hosenträger des CHECKs oben: Sollte je eine
  -- Buchung doppelt herunterzählen, bleibt der Zähler bei 0 stehen, statt dass der
  -- CHECK die ganze Transaktion abbricht — und damit das Zurücknehmen einer Anfrage
  -- unmöglich machte. **Der CHECK fängt den Programmfehler, das `greatest` schützt
  -- die Handlung des Menschen davor.**
  update public.profiles
     set treffen_anzahl = greatest(treffen_anzahl + wieviel, 0)
   where id = wer;
end $$;

comment on function regel.treffen_buchen_fuer(uuid, integer) is
  'Zählt den Treffen-Zähler einer Person hoch oder herunter. Nur für `treffen_buchen`.';

create function public.treffen_buchen() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  verfasser uuid;
  andere    integer;
begin
  -- ── Wurde aus einer offenen Anfrage eine Zusage? ──────────────────────────
  if (tg_op = 'UPDATE' and old.status <> 'accepted' and new.status = 'accepted') then
    select p.author_id into verfasser from public.posts p where p.id = new.post_id;
    perform regel.treffen_buchen_fuer(new.from_user_id, 1);

    -- Der Verfasser zählt nur beim ERSTEN Gast — siehe Kopfkommentar. Gezählt wird
    -- über die ANDEREN bereits bestätigten Anfragen an denselben Post: Gibt es
    -- keine, ist dieser Gast der erste.
    --
    -- ⚠️ Warum nicht `posts.spots_filled = 1`? Weil das eine ZWEITE Wahrheit über
    -- dieselbe Sache wäre. `spots_filled` wird von `anfrage_bestaetigen` gepflegt;
    -- dieser Trigger hängt an `join_requests` und läuft auch, wenn jemand den
    -- Status auf einem anderen Weg setzt. Er darf sich nur auf das verlassen, was er
    -- selbst sieht.
    select count(*) into andere
      from public.join_requests r
     where r.post_id = new.post_id and r.status = 'accepted' and r.id <> new.id;
    if andere = 0 and verfasser is not null then
      perform regel.treffen_buchen_fuer(verfasser, 1);
    end if;
    return new;
  end if;

  -- ── Wurde eine Zusage zurückgenommen? ─────────────────────────────────────
  -- Zwei Wege führen hierher, und beide müssen abgedeckt sein: ein UPDATE weg von
  -- `accepted` und ein DELETE der ganzen Zeile (Policy `anfragen_zuruecknehmen`
  -- aus 0006 erlaubt genau das, OHNE auf den Status zu sehen).
  if (tg_op = 'UPDATE' and old.status = 'accepted' and new.status <> 'accepted')
     or (tg_op = 'DELETE' and old.status = 'accepted') then
    select p.author_id into verfasser from public.posts p where p.id = old.post_id;
    perform regel.treffen_buchen_fuer(old.from_user_id, -1);

    -- Spiegelbildlich zu oben: Der Verfasser verliert sein Treffen erst, wenn der
    -- LETZTE bestätigte Gast weg ist. Deshalb wieder die anderen zählen — und hier
    -- ist die Reihenfolge wichtig: Beim DELETE läuft der Trigger NACH dem Löschen
    -- (`after`), die Zeile ist also schon fort und wird nicht mitgezählt.
    select count(*) into andere
      from public.join_requests r
     where r.post_id = old.post_id and r.status = 'accepted' and r.id <> old.id;
    if andere = 0 and verfasser is not null then
      perform regel.treffen_buchen_fuer(verfasser, -1);
    end if;
  end if;

  -- Bei DELETE muss `old` zurück, sonst verschluckt ein `after`-Trigger nichts,
  -- aber ein späterer `before`-Trigger bekäme `null`. `return new` wäre bei DELETE
  -- ohnehin `null`.
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end $$;

-- `after` und nicht `before`: Der Zähler soll erst gelten, wenn die Änderung
-- wirklich durch ist — ein `before`-Trigger bucht auch dann, wenn ein CHECK danach
-- die Zeile ablehnt.
create trigger treffen_buchen
  after update or delete on public.join_requests
  for each row execute function public.treffen_buchen();

comment on function public.treffen_buchen() is
  'Pflegt profiles.treffen_anzahl bei jeder Zusage und jeder Rücknahme. '
  'Ein Trigger und keine Funktion, weil hier nichts zu entscheiden ist — und weil '
  'Zähler-Code in anfrage_bestaetigen das Zurücknehmen nicht mitbekäme.';

-- ── Der Bestand ──────────────────────────────────────────────────────────────
--
-- Was vor dieser Migration schon bestätigt wurde, zählt mit. Ohne diesen Block
-- stünde bei allen, die die App bisher benutzt haben, eine 0 — und der Zähler
-- behauptete, sie hätten nie jemanden getroffen.
--
-- **Einmalig und nicht wiederholbar**: Der Block läuft genau bei dieser Migration.
-- Ein zweiter Lauf addierte auf die inzwischen vom Trigger gebuchten Werte drauf;
-- deshalb wird hier GESETZT (`=`) und nicht erhöht (`+=`) — ein versehentlich
-- wiederholter Lauf ergibt dann dasselbe Ergebnis statt das doppelte.
with gast as (
  select from_user_id as id, count(*) as n
    from join_requests where status = 'accepted'
   group by from_user_id
), verfasser as (
  -- `distinct p.id` im Unterausdruck: EIN Post ist EIN Treffen für den Verfasser,
  -- egal wie viele Gäste bestätigt sind — dieselbe Regel wie im Trigger oben.
  select p.author_id as id, count(distinct p.id) as n
    from posts p
   where exists (select 1 from join_requests r where r.post_id = p.id and r.status = 'accepted')
   group by p.author_id
), zusammen as (
  select id, sum(n) as n from (select * from gast union all select * from verfasser) x
   group by id
)
update profiles pr
   set treffen_anzahl = z.n
  from zusammen z
 where pr.id = z.id;

-- ── Rechte ───────────────────────────────────────────────────────────────────
--
-- **Die Spalte ist für alle LESBAR und für niemanden schreibbar.** Lesen kommt über
-- die bestehende `profiles`-Select-Policy, da ist nichts zu tun — und das ist der
-- Sinn der Sache: Die Zahl soll auf jedem Profil stehen.
--
-- ⚠️ Harte Regel 85: Am echten Supabase bekommt eine neue Spalte alle Rechte, die
-- die Tabelle hat — ein fehlender `grant` nimmt nichts weg. `profiles` trägt
-- `grant … update … to authenticated` (0002/0007), also DARF die App diese Spalte
-- schreiben, solange man es nicht ausdrücklich verbietet. Genau das tut die
-- folgende Zeile: Sie zählt die Spalten auf, die ein Mensch an seinem Profil ändern
-- darf — und `treffen_anzahl` ist nicht dabei.
--
-- ⚠️ Harte Regel 104: `PUBLIC` darf jede neue Funktion ausführen. Beide Funktionen
-- oben sind `security definer` und würden damit von jedem aufrufbar — der Zähler
-- wäre per RPC frei setzbar. Deshalb der `revoke`.
revoke update on profiles from authenticated;
grant update (handle, display_name, photo_url, bio, district, jahrgang, interests,
              terms_accepted_at, terms_version)
  on profiles to authenticated;

revoke execute on function regel.treffen_buchen_fuer(uuid, integer) from public;
revoke execute on function public.treffen_buchen() from public;
