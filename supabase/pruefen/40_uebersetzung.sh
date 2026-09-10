#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  DER PRÜFSTEIN VON PHASE 20.4 — die ÜBERSETZUNG
#
#  `10_angriff.sql` fragt: kommt jemand an Daten, an die er nicht darf?
#  `20_transaktionen.sql` fragt: tut ein Schreibvorgang, was Ians Regel sagt?
#  Diese Datei fragt das Dritte: **wird aus einer echten Zeile das richtige
#  App-Objekt?**
#
#  ── Warum das nicht als Unit-Test mit erfundenen Zeilen geht ─────────────────
#  Weil genau die erfundene Zeile der Fehler wäre. Ein Zeitstempel, den ich selbst
#  hinschreibe, hat die Form, die ich erwarte; Postgres liefert
#  `2026-09-10T07:59:29.833382+01:00`, und die App vergleicht Zeitstempel an neun
#  Stellen als TEXT. Eine Attrappe, die vom Original abweicht, prüft die Attrappe
#  (die Lehre aus Phase 20.1).
#
#  Deshalb: erst die interessanten Zustände mit den ECHTEN Funktionen aus 0004
#  herstellen, dann die Zeilen als JSON herausholen, dann durch `data/zeilen.ts`
#  schicken — dieselbe Datei, die später die App benutzt.
#
#  ⚠️ Diese Datei ÄNDERT die Prüfdatenbank (löst eine Gruppe auf, löscht einen
#  Post). Sie läuft deshalb als LETZTE in `aufbauen.sh`.
# ═══════════════════════════════════════════════════════════════════════════════
set -e
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
HIER="$(cd "$(dirname "$0")" && pwd)"
WURZEL="$(cd "$HIER/../.." && pwd)"
PSQL="psql -h 127.0.0.1 -p 55432 -U postgres -d ss -v ON_ERROR_STOP=1 -tA"
ARBEIT="$(mktemp -d)"
trap 'rm -rf "$ARBEIT"' EXIT

IAN=11111111-1111-1111-1111-111111111111
LEA=22222222-2222-2222-2222-222222222222

echo ''
echo '════ PHASE 20.4 — die Übersetzung ══════════════════════════════════════'
echo '── Erst die zwei Zustände herstellen, die es im Prototyp nicht gibt ─────'

# 1) Die Gruppe `aaaa` auflösen — mit der echten Funktion, nicht mit einem UPDATE.
#    Ian geht (Lea erbt), dann geht Lea (niemand mehr da → aufgelöst).
#    Post `0a000003` zeigt auf diese Gruppe und muss STEHEN BLEIBEN (Ians 41.).
$PSQL -q <<SQL
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"$IAN"}';
  select public.gruppe_verlassen('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
commit;
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"$LEA"}';
  select public.gruppe_verlassen('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
commit;
SQL

# 2) Den Post `0a000001` löschen. An ihm hängt der Chat `0c000001` — er bekommt
#    `post_id = null` und behält `aus_aktivitaet = true`. Genau der Zustand, für
#    den harte Regel 56 gebaut ist, und im Prototyp unerreichbar.
$PSQL -q <<SQL
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"$IAN"}';
  delete from public.posts where id = '0a000001-0000-0000-0000-000000000001';
commit;
SQL

# ── Die Zeilen herausholen, so wie PostgREST sie liefert ────────────────────
holen() { $PSQL -c "select coalesce(json_agg(z), '[]') from ($1) z;" > "$ARBEIT/$2.json"; }
holen "select * from profiles order by handle"                 profile
holen "select follower_id, followee_id from follows"           folgt
holen "select blocker_id, blocked_id from blocks"              blocks
holen "select * from posts order by created_at, id"            posts
holen "select * from groups order by created_at, id"           gruppen
holen "select group_id, user_id, joined_at from group_members" mitglieder
holen "select * from chat_threads order by id"                 faeden
holen "select thread_id, user_id from chat_participants"       teilnehmer
holen "select * from messages order by sent_at"                nachrichten

# ── Die Übersetzung nach JS bringen ────────────────────────────────────────
# `zeilen.ts`, `gruppe.ts` und `direkt.ts` importieren AUSSCHLIESSLICH Typen
# (`import type`), also bleibt vom Import nach dem Übersetzen nichts übrig — die
# erzeugten .js-Dateien haben keine Abhängigkeit und laufen in blankem Node.
cat > "$ARBEIT/tsconfig.json" <<JSON
{
  "compilerOptions": {
    "target": "es2022", "module": "es2022", "moduleResolution": "bundler",
    "strict": true, "skipLibCheck": true, "outDir": "$ARBEIT/js",
    "rootDir": "$WURZEL/src", "verbatimModuleSyntax": false,
    "paths": { "@/*": ["$WURZEL/src/*"] }
  },
  "files": [
    "$WURZEL/src/data/zeilen.ts",
    "$WURZEL/src/features/groups/gruppe.ts",
    "$WURZEL/src/features/chat/direkt.ts"
  ]
}
JSON
(cd "$WURZEL" && npx tsc -p "$ARBEIT/tsconfig.json")
for f in "$ARBEIT"/js/data/*.js "$ARBEIT"/js/features/*/*.js; do mv "$f" "${f%.js}.mjs"; done

echo ''
echo '── Und jetzt durch `data/zeilen.ts` ─────────────────────────────────────'
ARBEIT="$ARBEIT" node "$HIER/40_uebersetzung.mjs"
