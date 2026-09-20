-- ═══════════════════════════════════════════════════════════════════════════════
--  EIN ECHTES KONTO SIEHT DIE DEMO-WELT — Ians Wunsch vom 2026-09-20
-- ═══════════════════════════════════════════════════════════════════════════════
--
--  Sein Satz: *„am Simulator sehe ich ja, dass diese ganzen Beispiele da sind —
--  kannst du die bitte auch auf mein Handy geben … dass mein Konto das immer hat,
--  so mäßig so ein Developer Account."*
--
--  ── Warum das GEHT, ohne irgendetwas aufzuweichen ───────────────────────────
--  Die Demo-Welt ist `followers`-sichtbar (siehe `20_welt.sql`), und die fünf
--  Demo-Menschen folgen einander. Wer sie sehen will, muss ihnen FOLGEN — mehr
--  nicht. Diese Datei legt genau diese fünf Folge-Beziehungen für ein benanntes
--  echtes Konto an.
--
--  🔴 **Es wird NICHTS an der Sichtbarkeit geändert.** Kein Post wird `public`,
--  keine Policy wird angefasst, harte Regel 109 bleibt Wort für Wort gültig. Für
--  jedes andere echte Konto ist die Demo-Welt weiterhin unsichtbar. Das ist der
--  Unterschied zwischen „einer Person etwas zeigen" und „etwas öffentlich machen",
--  und er ist hier kein Detail: Die zweite Variante wäre erfundene Leute im Feed
--  jedes Menschen, der die App lädt.
--
--  ── Was es KOSTET, und warum Ian das wissen sollte ──────────────────────────
--  Sein Feed enthält ab jetzt fünf erfundene Menschen mit Aktivitäten. Das ist
--  gewollt, aber es heißt auch: **Sein Konto ist kein Maßstab mehr dafür, was ein
--  neuer Mensch in Wien sieht.** Für diese Frage — den leeren Anfangszustand —
--  braucht es ein Konto ohne diese Zeilen, oder ein `--mir-nicht-mehr`.
--
--  ── Rückgängig ─────────────────────────────────────────────────────────────
--  `npm run demo -- --mir-nicht-mehr <e-mail>` nimmt genau diese fünf Zeilen
--  wieder weg. `--abraeumen` erwischt sie ebenfalls: Dort steht
--  `or followee_id::text like 'dddddddd-%'`, und das ist genau dieser Fall.
-- ═══════════════════════════════════════════════════════════════════════════════

\set ON_ERROR_STOP on

-- ⚠️ **Die Prüfung „gibt es das Konto?" steht in `anlegen.sh`, nicht hier.**
-- Der naheliegende Weg wäre ein `do $$ … raise exception … $$` gewesen — und der
-- ist am 2026-09-20 gescheitert: **psql ersetzt `:'wer'` NICHT innerhalb eines
-- Dollar-Quoted Blocks.** Die Variable bleibt dort als Text stehen, und Postgres
-- meldet `syntax error at or near ":"`. Eine Prüfung in der Shell ist hier
-- ohnehin die ehrlichere: Sie kann den Namen in die Fehlermeldung schreiben.

insert into follows (follower_id, followee_id)
select u.id, d.id
from auth.users u,
     (select unnest(array[
        'dddddddd-dddd-dddd-dddd-dddddddddd01',
        'dddddddd-dddd-dddd-dddd-dddddddddd02',
        'dddddddd-dddd-dddd-dddd-dddddddddd03',
        'dddddddd-dddd-dddd-dddd-dddddddddd04',
        'dddddddd-dddd-dddd-dddd-dddddddddd05']::uuid[]) as id) d
where lower(u.email) = lower(:'wer')
  -- Sich selbst zu folgen ginge schief, falls die E-Mail je einem Demo-Konto
  -- gehört. Kostet nichts und schließt den Fall aus.
  and u.id <> d.id
on conflict do nothing;
