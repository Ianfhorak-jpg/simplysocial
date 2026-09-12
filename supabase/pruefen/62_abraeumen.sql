-- ═══════════════════════════════════════════════════════════════════════════════
--  Die Prüfkonten wieder entfernen — 60_konto.sh
-- ═══════════════════════════════════════════════════════════════════════════════
--
--  ── Warum hier seit dem 2026-09-12 zwei IDs stehen und kein `delete from` ────
--  Vorher stand hier `delete from auth.users;` — ALLE Konten — mit der Begründung,
--  der Wächter in `60_konto.sh` habe vorher sichergestellt, dass die Datenbank
--  leer ist. Genau davor warnt die Schwesterdatei `52_abraeumen.sql` wörtlich:
--  *„ein Abräumen, das sich auf einen Wächter in einer ANDEREN Datei verlässt, ist
--  genau so lange harmlos, bis jemand es einzeln aufruft."* Die beiden Dateien
--  waren sich uneinig darüber, was sicher ist.
--
--  **Und das scharfe Werkzeug lag die ganze Zeit in der Hand:** `60_konto.sh`
--  erzeugt die Konten mit FESTEN UUIDs (`KONTO_A`, `KONTO_B`) und reicht sie schon
--  beim Anlegen als psql-Variablen herein. Sie hier ein zweites Mal zu nehmen
--  kostet nichts und macht das Abräumen unabhängig von jedem Wächter.
--
--  Der eigentliche Ertrag ist ein anderer: Solange dieses Skript ALLE Konten
--  löschte, MUSSTE der Wächter jede nicht-leere Datenbank abweisen — und damit war
--  die Prüfung ab dem ersten echten Nutzer tot. Jetzt ist sie es nicht mehr.
--
--  ── Die Gruppen zuerst, wie nebenan ─────────────────────────────────────────
--  `groups.creator_id` hat `on delete set null` UND `constraint
--  chef_oder_aufgeloest` (Ians Entscheidung 41): Eine Gruppe ohne Chef ist nur
--  darstellbar, wenn sie aufgelöst IST. Ein blankes Löschen des Gründers scheitert
--  also am CHECK. Heute gründet `60_konto.mjs` keine Gruppe — die drei Zeilen
--  stehen trotzdem da, damit die erste, die dazukommt, nicht einen Abbruch mitten
--  im Abräumen erzeugt. Dieselbe Überlegung wie die abgeleitete Gruppenliste in
--  `52_abraeumen.sql`.
-- ═══════════════════════════════════════════════════════════════════════════════

delete from groups where creator_id in (:'konto_a'::uuid, :'konto_b'::uuid);

-- Profile, Posts, Chats und alles Weitere hängen an `on delete cascade`.
delete from auth.users where id in (:'konto_a'::uuid, :'konto_b'::uuid);
