-- ═════════════════════════════════════════════════════════════════════════════
--  0007 — DIE RECHTELISTE AUS 0002 WIRKLICH DURCHSETZEN
--  Phase 20.5 (App-Seite), 2026-09-12.
-- ═════════════════════════════════════════════════════════════════════════════
--
-- ── Der Befund ──────────────────────────────────────────────────────────────
-- `0002_policies.sql` endet mit einer Rechteliste, und auf ihr steht das halbe
-- Gebäude dieses Projekts: harte Regel 55 („auf `group_members` gibt es KEIN
-- Insert-Recht, und das ist die Aussage"), harte Regel 70 („ein fehlender `grant`
-- ist eine Zusage, keine Lücke"), und die ganze Begründung dafür, warum es die
-- sieben Funktionen in 0004 überhaupt gibt.
--
-- **Am echten Supabase galt sie nicht.** Gemessen am 2026-09-12:
--
--     group_members   lokal: SELECT
--     group_members   echt : DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE
--
-- Supabase trägt für `public` eine Voreinstellung (`alter default privileges`),
-- die jeder neuen Tabelle automatisch ALLE Rechte an `anon` und `authenticated`
-- gibt. Unsere `grant`-Zeilen kommen danach und fügen nur hinzu — wegnehmen tun
-- sie nichts. Die Liste war also am Original eine Absichtserklärung.
--
-- ── War damit etwas OFFEN? Nein — und der Unterschied ist trotzdem wichtig ───
-- RLS ist auf allen 13 Tabellen an, und eine Tabelle mit RLS ohne passende Policy
-- weist ab, auch mit Grant. Es war also nie jemand hineingekommen. **Was sich
-- unterscheidet, ist die Art der Abweisung:**
--
--     fehlender GRANT   → `42501`, sofort, LAUT
--     fehlende POLICY   → bei INSERT `42501`; bei DELETE und UPDATE
--                         **null Zeilen, ohne jeden Fehler** — STILL
--
-- Und still ist in diesem Projekt die teure Sorte: Genau so ist der Fehler
-- aufgefallen. `beitrittZuruecknehmen` löschte am echten Server nichts und meldete
-- nichts; die App hätte „zurückgezogen" angezeigt und beim nächsten Laden stünde
-- die Anfrage wieder da. Dieselbe Familie wie `data ?? []` (Ians Entscheidung 43)
-- und wie die leere Publication in 0005.
--
-- ── Was hier passiert ───────────────────────────────────────────────────────
-- Erst alles wegnehmen, dann genau die Liste aus 0002 wieder erteilen. Damit gilt
-- sie an BEIDEN Orten, und der lokale Prüfstand misst wieder dasselbe wie das
-- Original (`00_supabase_lokal.sql` bringt die Voreinstellung jetzt ebenfalls mit,
-- damit dieses `revoke` lokal überhaupt etwas zu tun hat).
--
-- ⚠️ **`service_role` wird NICHT angefasst.** Sie ist die Rolle, die jede Policy
-- aufhebt und mit der Supabase selbst arbeitet; ihr Rechte zu nehmen legt Dinge
-- lahm, die nichts mit dieser App zu tun haben. Die App benutzt sie nie — der
-- Schlüssel dafür liegt bewusst nicht in `.env` (siehe `scripts/anon-key.sh`).
--
-- ⚠️ **Und `anon` behält NICHTS.** Das ist keine Verschärfung, sondern das, was
-- 0002 immer schon sagte: Dort steht keine einzige Zeile `to anon`. Ein nicht
-- angemeldeter Besucher sieht in dieser App nichts — belegt in `10_angriff.sql`
-- und in `50_lesen.mjs` („anon bekommt HTTP 200 und NULL Posts").
-- ═════════════════════════════════════════════════════════════════════════════

revoke all on all tables in schema public from anon, authenticated;

-- Wortgleich die Liste aus dem Fuß von `0002_policies.sql`. Sie steht damit
-- ZWEIMAL da, und das ist die Stelle, an der diese Datei driften kann — dieselbe
-- Lage wie `landing/stil.css` gegenüber `theme/colors.ts` (harte Regel 13).
-- Deshalb prüft `einspielen.sh` die Rechte nach, statt sich auf Sorgfalt zu
-- verlassen: Wer in 0002 einen Grant ändert und hier nicht, bekommt ein Kreuz.
grant select, insert, update           on profiles          to authenticated;
grant select, insert, delete           on follows           to authenticated;
grant select, insert, delete           on blocks            to authenticated;
grant select, insert, update           on groups            to authenticated;
grant select                           on group_members     to authenticated;
grant select, insert, update, delete   on posts             to authenticated;
grant select, insert, update, delete   on join_requests     to authenticated;
-- `delete` seit 0006: eine Beitritts-Anfrage zieht man zurück.
grant select, insert, update, delete   on group_requests    to authenticated;
grant select, insert, update           on group_invites     to authenticated;
grant select                           on chat_threads      to authenticated;
grant select                           on chat_participants to authenticated;
grant select, insert                   on messages          to authenticated;
grant select, insert                   on reports           to authenticated;
