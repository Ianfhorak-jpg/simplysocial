-- ═══════════════════════════════════════════════════════════════════════════════
--  Die Prüfdaten wieder entfernen — Phase 20.4-b
-- ═══════════════════════════════════════════════════════════════════════════════
--
--  ── Warum nicht einfach `delete from auth.users` ─────────────────────────────
--  Weil Ians Entscheidung 41 im Weg steht, und zwar zu Recht: `groups.creator_id`
--  hat `on delete set null` UND einen `constraint chef_oder_aufgeloest` — eine
--  Gruppe ohne Chef ist nur darstellbar, wenn sie aufgelöst IST. Ein blankes
--  Löschen des Gründers scheitert also am CHECK. Deshalb zuerst die Gruppen, dann
--  die Menschen; der Rest hängt an `on delete cascade`.
--
--  ── Die Gruppen werden ABGELEITET, nicht aufgezählt ──────────────────────────
--  Der erste Entwurf zählte eine Gruppen-ID auf — und übersah die zweite („Nora
--  allein"), weil sie in `05_daten.sql` weiter unten steht. Das Abräumen scheiterte
--  am CHECK und ließ fünf erfundene Menschen in einer echten Datenbank liegen.
--
--  **Eine Liste, die aus einer anderen Datei abgeschrieben wird, ist eine Kopie**
--  — dieselbe Lage wie `landing/stil.css` gegenüber `theme/colors.ts` (harte
--  Regel 13), und dieselbe Antwort: ableiten statt abschreiben. Kommt in
--  `05_daten.sql` eine dritte Gruppe dazu, geht sie hier von selbst mit.
--
--  ── Und trotzdem kein `truncate` ─────────────────────────────────────────────
--  Die fünf UUIDs stehen ausgeschrieben da. Was nicht an ihnen hängt, wird nicht
--  angefasst. `50_lesen.sh` prüft zwar vorher, dass die Datenbank leer ist — aber
--  ein Abräumen, das sich auf einen Wächter in einer ANDEREN Datei verlässt, ist
--  genau so lange harmlos, bis jemand es einzeln aufruft.

-- ── ZUERST, was die Löschregeln ABSICHTLICH überleben lassen ────────────────
-- Beim ersten Lauf blieben nach dem Abräumen `reports = 1` und `chat_threads = 2`
-- stehen, und das war KEIN kaputtes Cascade, sondern zwei richtige Regeln:
--
--   • Eine MELDUNG überlebt das Konto ihres Melders (`from_user_id on delete set
--     null`, 0001). Anders ginge es nicht — sonst löschte man sich durch
--     Kontolöschen aus jeder Meldung heraus.
--   • Ein CHAT überlebt seinen Post und seine Teilnehmer (harte Regel 56, Ians
--     Entscheidung 42). Ein verwaister Chat ist ein gültiger Zustand.
--
-- **Beide sind hier nur zu erfassen, SOLANGE die Verbindung noch besteht** — nach
-- dem `delete` der Konten steht an der Meldung `null` und am Faden niemand mehr,
-- und dann ist sie von einer echten verwaisten Meldung nicht mehr zu unterscheiden.
-- Ein `delete from reports where from_user_id is null` wäre also genau falsch: Es
-- löschte die Sorte Zeile, die das Schema ausdrücklich aufheben will.
delete from reports where from_user_id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
) or target_id::text in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
);

-- Zwei Bedingungen, und die zweite kam aus einem gescheiterten Lauf:
--   1. Fäden, an denen ein Prüfmensch hängt — der gewöhnliche Fall.
--   2. Fäden OHNE jeden Teilnehmer. Bricht das Abräumen mitten drin ab, sind die
--      Konten schon weg und `chat_participants` mit ihnen (Cascade) — dann findet
--      (1) nichts mehr, und die Fäden bleiben mit ihren FESTEN IDs liegen. Der
--      nächste Lauf scheitert dann an einem Schlüsselkonflikt in `05_daten.sql`,
--      und das sieht aus wie kaputte Prüfdaten.
--      **Ein Abräumen, das den Zustand eines gescheiterten Abräumens nicht
--      aufräumen kann, ist nur beim Schönwetter-Lauf vollständig.**
--
--      ⚠️ **Berichtigt am 2026-09-12, und der Fehler stand im eigenen Kommentar.**
--      Hier hieß (2) einmal „jeder Faden OHNE jeden Teilnehmer" — ein Rundumschlag
--      durch eine fremde Datenbank. Die Begründung dafür („ein Faden ohne
--      Teilnehmer kann von niemandem mehr geöffnet werden") ist FALSCH, und zwar
--      ausgerechnet wegen Ians Entscheidung 42: Ein verwaister Chat ist ein
--      gültiger Zustand, den ein echter Mensch haben darf (harte Regel 56). Die
--      Zeile hätte also genau die Sorte Daten gelöscht, die das Schema ausdrücklich
--      aufheben will — dieselbe Verwechslung, die der Absatz über die verwaiste
--      MELDUNG drei Zeilen weiter oben schon einmal richtig vermeidet.
--
--      **Und das scharfe Werkzeug stand im selben Satz:** „die Fäden bleiben mit
--      ihren FESTEN IDs liegen." Es sind genau zwei, sie stehen in `05_daten.sql`,
--      also werden sie beim Namen genannt. Was nicht an ihnen hängt, wird nicht
--      angefasst — und damit gilt die Zusage aus dem Kopf dieser Datei wirklich.
delete from chat_threads
 where id in (
   select thread_id from chat_participants where user_id in (
     '11111111-1111-1111-1111-111111111111',
     '22222222-2222-2222-2222-222222222222',
     '33333333-3333-3333-3333-333333333333',
     '44444444-4444-4444-4444-444444444444',
     '55555555-5555-5555-5555-555555555555'
   )
 )
    or id in ('0c000001-0000-0000-0000-000000000001',
              '0c000002-0000-0000-0000-000000000002');

-- Alles, was diese fünf gegründet haben — egal wie viele Gruppen es inzwischen sind.
delete from groups where creator_id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
);

delete from auth.users where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
);
