-- ═════════════════════════════════════════════════════════════════════════════
--  0011 — DIE ZUSTIMMUNG ZU DEN NUTZUNGSBEDINGUNGEN
--  Phase 21.2, 2026-09-14. Ians Entscheidung 80.
-- ═════════════════════════════════════════════════════════════════════════════
--
-- Apple Guideline 1.2 verlangt bei nutzergenerierten Inhalten, dass jemand den
-- Regeln ZUSTIMMT, bevor er mitmacht — nicht nur, dass sie abrufbar sind. Die
-- Mechanik dafür ist baubar, seit es in Phase 20 eine Anmeldung gibt; der TEXT
-- selbst ist weiterhin Ians offener Punkt (`_FUER_IAN/OFFENE_SACHEN.md` Punkt 1).
--
-- Die Regel dazu steht in `src/features/auth/zustimmung.ts` und nirgends sonst.
--
-- ── Warum NULLABLE, obwohl jedes neue Konto beides mitbringt ─────────────────
-- `not null` bräuchte einen `default` für die Zeilen, die es schon gibt — Ian,
-- Christoph, Leopold, Daria und die fünf Demo-Menschen. Jeder denkbare Default
-- wäre eine BEHAUPTUNG über einen Menschen, der nie gefragt wurde: Er trüge ein
-- Datum, an dem diese Person zugestimmt haben soll, und stünde in derselben
-- Spalte wie eine echte Zustimmung, ununterscheidbar.
--
-- `null` ist die ehrliche Antwort: **nie zugestimmt, weil es nichts zum
-- Zustimmen gab.** `brauchtNeueZustimmung()` in `zustimmung.ts` liest genau das.
--
-- Dass neue Konten trotzdem nicht ohne durchkommen, trägt nicht diese Spalte,
-- sondern der Bildschirm — und das ist eine bewusste Aufteilung, keine Lücke:
-- Eine Zustimmung ist eine HANDLUNG eines Menschen. Die Datenbank kann festhalten,
-- dass sie stattfand; ob sie stattfand, weiß nur der Bildschirm, auf dem getippt
-- wurde. Das ist die andere Lage als bei `jahrgang` (0001), wo `not null` richtig
-- ist, weil dort jeder denkbare Wert ein Wert ist und keiner eine Aussage über
-- einen Vorgang.
--
-- ── Der CHECK ist der eigentliche Riegel ─────────────────────────────────────
-- Zwei Spalten, die zusammengehören, können einzeln gesetzt werden — und ein
-- Zeitpunkt ohne Fassung ist genau die Angabe, gegen die Ian sich entschieden
-- hat (die verworfene Möglichkeit „nur den Zeitpunkt"). Ohne diesen CHECK könnte
-- sie über einen Programmfehler doch entstehen und sähe aus wie eine gültige
-- Zustimmung.
--
-- Geprüft wird GEGENEINANDER, nicht je gegen einen festen Wert — harte Regel 98,
-- dieselbe Bauart wie die zwei Spalten, die auf dieselbe Tabelle zeigen.

alter table profiles
  add column terms_accepted_at timestamptz,
  add column terms_version     text;

alter table profiles
  add constraint profiles_zustimmung_vollstaendig
  check ((terms_accepted_at is null) = (terms_version is null));

-- ── Was diese Migration NICHT tut ────────────────────────────────────────────
--
-- **Kein neues Recht.** `grant select, insert, update on profiles to
-- authenticated` (0007) gilt tabellenweit und deckt neue Spalten mit ab. Harte
-- Regel 85 greift hier NICHT: Sie handelt von neuen TABELLEN in `public`, die am
-- echten Supabase alle Rechte geschenkt bekommen. Eine neue Spalte an einer
-- Tabelle, deren Rechte schon gesetzt sind, erbt genau diese Rechte — nachgesehen
-- statt angenommen: In 0007 steht kein einziges Spaltenrecht (`grant … (spalte)`),
-- sonst fiele die neue Spalte still daneben.
--
-- **Keine neue Policy.** `profil_anlegen` (`with check (id = auth.uid())`) und
-- `profil_aendern` (`using (id = auth.uid())`) gelten für die ganze Zeile.
--
-- ⚠️ **Was daraus folgt und benannt gehört:** Ein Mensch schreibt seine eigene
-- Zustimmung. Er könnte also über die Schnittstelle ein beliebiges Datum
-- eintragen, und die Datenbank nähme es an. Das ist hinnehmbar, weil der Beleg
-- die ZEILE ist und nicht ihre Unfälschbarkeit — wer seine eigene Zustimmung
-- fälscht, fälscht sie zu seinen eigenen Ungunsten. Wäre das anders, bräuchte es
-- einen Trigger mit `now()`; das ist Aufwand für einen Fall, der niemandem nützt.
--
-- ⚠️ **`profil_lesen` ist `using (true)`** — jeder Angemeldete liest jedes Profil,
-- und `laden.ts` holt sie mit `select('*')`. Die zwei neuen Spalten gehen damit an
-- jedes Gerät. Das ist geprüft und in Ordnung: Sie verraten nichts, was nicht
-- schon dastünde. Dass jemand zugestimmt hat, gilt für jeden in der App, und
-- WANN er dazukam, sagt `created_at` seit 0001 ohnehin.
