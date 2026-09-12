-- ═════════════════════════════════════════════════════════════════════════════
--  0006 — EINE BEITRITTS-ANFRAGE ZURÜCKZIEHEN
--  Phase 20.5 (App-Seite), 2026-09-12.
-- ═════════════════════════════════════════════════════════════════════════════
--
-- ── Wie das gefunden wurde ───────────────────────────────────────────────────
-- Zum zweiten Mal hat die RECHTELISTE die Arbeitsliste geschrieben und nicht der
-- Plan (harte Regel 70, dieselbe Technik wie in 20.5-SQL). Beim Einordnen der 22
-- Schreib-Aktionen nach Ians Entscheidung 46 fiel auf: `beitrittZuruecknehmen`
-- hat am Server GAR KEINEN Weg.
--
--   join_requests   →  policy `anfragen_zuruecknehmen` (delete, from_user_id = ich)
--   group_requests  →  kein delete-Recht, und die einzige update-Policy heißt
--                      `gruppenanfrage_beantworten` und lässt nur den GRÜNDER durch.
--
-- ── Zusage oder Lücke? ───────────────────────────────────────────────────────
-- Harte Regel 70 verlangt genau diese Frage, und beide Antworten kommen vor:
-- Das fehlende `insert` auf `group_members` ist eine ZUSAGE („Beitreten ist das
-- Ergebnis einer Bestätigung", Regel 55). Hier ist es eine LÜCKE, und zwar aus
-- zwei Gründen, die beide nachprüfbar sind statt gefühlt:
--
--   1. **Die Schwestertabelle kann es.** Eine Anfrage an einen POST zieht man
--      zurück; eine Anfrage an eine GRUPPE ist dasselbe Muster (harte Regel 39
--      sagt, die beiden Typen tragen verschiedene DATEN — nicht verschiedene
--      Rechte).
--   2. **Der Knopf steht seit Phase 17 in der App.** `beitrittZuruecknehmen()` in
--      `features/groups/hooks.ts`, Screen `/gruppe/[id]`. Ein fehlender Grant, zu
--      dem es einen Knopf gibt, ist keine Regel, sondern ein Knopf, der nichts tut.
--
-- ── Warum LÖSCHEN und nicht `status = 'declined'` ────────────────────────────
-- Das Update-Recht wäre der kleinere Eingriff gewesen und ist trotzdem falsch:
-- `group_requests` trägt `unique (group_id, from_user_id)`. Bliebe die Zeile mit
-- einem anderen Status liegen, wäre eine ERNEUTE Anfrage kein `insert` mehr,
-- sondern ein Update zurück auf `'pending'` — also ein zweiter Schreibweg für
-- etwas, das es schon gibt, und eine zusätzliche Policy, die ihn erlaubt.
-- Gelöscht ist zurückgezogen; danach ist der Weg hinein wieder genau derselbe wie
-- beim ersten Mal. **Und es ist Zeichen für Zeichen das, was die Schwestertabelle
-- tut** — eine Abweichung müsste man erklären können.
--
-- Die Bedingung ist deshalb auch wortgleich `from_user_id = auth.uid()` und nicht
-- zusätzlich `status = 'pending'`. Eine bestätigte Anfrage zu löschen nimmt die
-- Mitgliedschaft NICHT weg (die steht in `group_members`), und ein erneutes
-- Anfragen scheitert weiter an `not regel.ist_mitglied(...)` in
-- `gruppenanfrage_stellen`. Eine Bedingung, die nichts verhindert, verspricht nur,
-- dass sie etwas verhindert.
-- ═════════════════════════════════════════════════════════════════════════════

create policy gruppenanfrage_zuruecknehmen on group_requests for delete to authenticated using (
  from_user_id = auth.uid()
);

grant delete on group_requests to authenticated;
