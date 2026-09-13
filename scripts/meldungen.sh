#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  DIE MELDUNGEN LESEN — Phase 20.7, Ians Entscheidungen 58 und 59.
#
#  Aufruf:  npm run meldungen                    offene Meldungen, dringendste zuerst
#           npm run meldungen -- alle            auch die erledigten
#           npm run meldungen -- erledigt <id> "was getan wurde"
#
#  ── Warum ein Befehl am Mac und kein Bereich in der App ─────────────────────
#  Ians Entscheidung 58 vom 2026-09-13. Die verworfenen Möglichkeiten:
#
#    B. Ein Admin-Bereich in der App. Bequem vom Handy, auch für Christoph,
#       Leopold und Daria. Preis: eine Rolle, die JEDEN Chat lesen und jeden
#       fremden Post löschen darf — auf einem Gerät, das man verliert, verleiht
#       oder ungesperrt liegen lässt. Und sie bräuchte neue Policies neben den 34.
#    C. Die Supabase-Tabellenansicht im Browser. Gar kein Code — das hatte der
#       Plan vorgesehen. Preis, gemessen: Dort steht `gefahr · 8f3a-… · 11e2-…`.
#       Man sieht nicht, WELCHER Post gemeint ist und WER gemeldet hat.
#
#  Der Zugang ist der Verbindungs-String aus ~/.simplysocial/db-url (600,
#  außerhalb des Repos) — also `postgres`, und der umgeht RLS ohnehin. **Dadurch
#  kostet dieses Werkzeug KEINE einzige neue Berechtigung in der App:** Auf
#  `reports` steht weiterhin nur `select, insert` für `authenticated` (0007), es
#  gibt kein `update`, und niemand außer dem Melder sieht seine eigene Meldung.
#  Der stärkste Schlüssel des Projekts liegt auf einem Mac, nicht auf einem Handy.
#
#  ── Warum das Werkzeug die Regel nicht selbst kennt ─────────────────────────
#  Die Frist steht in `src/features/safety/meldung.ts` und NUR dort — dieselbe
#  Datei, aus der `/nutzungsbedingungen` seinen Satz nimmt. Sie wird hier nach JS
#  übersetzt und in blankem Node ausgeführt (dieselbe Technik wie
#  `40_uebersetzung.sh`), statt die 24 und die 48 ein zweites Mal hinzuschreiben.
#  Sonst verspräche die App eines Tages etwas anderes, als dieses Werkzeug misst.
# ═══════════════════════════════════════════════════════════════════════════════
set -e
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
HIER="$(cd "$(dirname "$0")" && pwd)"
WURZEL="$(cd "$HIER/.." && pwd)"
URL_DATEI="$HOME/.simplysocial/db-url"
ICH_DATEI="$HOME/.simplysocial/ich"
ARBEIT="$(mktemp -d)"
trap 'rm -rf "$ARBEIT"' EXIT

if [ ! -f "$URL_DATEI" ]; then
  echo "✗ Keine Verbindungsangabe in $URL_DATEI"
  echo "  Sie entsteht mit:  npm run db-url"
  exit 1
fi
DB_URL="$(cat "$URL_DATEI")"

# Derselbe Filter wie in `einspielen.sh`: Postgres spiegelt bei Verbindungsfehlern
# den ganzen String zurück, und darin steht das Datenbankpasswort.
GEHEIM="$(printf '%s' "$DB_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')"
filtern() { if [ -n "$GEHEIM" ]; then sed "s|$GEHEIM|«PASSWORT»|g"; else cat; fi; }
frage() { PGCONNECT_TIMEOUT=15 psql "$DB_URL" -tA -v ON_ERROR_STOP=1 -c "$1" 2>&1 | filtern; }

BEFEHL="${1:-offen}"

# ── Wer bin ich? ────────────────────────────────────────────────────────────
# `erledigt_von` verweist auf `profiles` — ein Skript hat keine Anmeldung, also
# muss der Mensch am Mac gesagt haben, wer er ist. Eine Datei statt eines
# Arguments, damit die Angabe nicht bei jedem Aufruf neu getippt (und vertippt)
# wird. Sie steht neben der db-url und nicht im Repo: Sie sagt, WER moderiert.
ich_uuid() {
  if [ ! -f "$ICH_DATEI" ]; then
    echo "✗ Ich weiß nicht, wer du bist — $ICH_DATEI fehlt." >&2
    echo "" >&2
    echo "  Diese Konten gibt es:" >&2
    frage "select '    @' || handle || '  ' || display_name from profiles order by handle;" >&2
    echo "" >&2
    echo "  Einmalig anlegen (ohne @):" >&2
    echo "    printf '%s' 'ian' > ~/.simplysocial/ich && chmod 600 ~/.simplysocial/ich" >&2
    return 1
  fi
  H="$(tr -d ' \n@' < "$ICH_DATEI")"
  U="$(frage "select id from profiles where handle = '$(printf '%s' "$H" | sed "s/'/''/g")';")"
  if [ -z "$U" ]; then
    echo "✗ Kein Profil mit dem @-Namen '$H' (steht in $ICH_DATEI)." >&2
    return 1
  fi
  printf '%s' "$U"
}

# ── Eine Meldung abhaken ────────────────────────────────────────────────────
if [ "$BEFEHL" = "erledigt" ]; then
  ID="${2:-}"
  NOTIZ="${3:-}"
  if [ -z "$ID" ]; then
    echo "✗ Welche Meldung? →  npm run meldungen -- erledigt <id> \"was getan wurde\""
    exit 1
  fi
  ICH="$(ich_uuid)" || exit 1
  # Die Notiz wird ANGEHÄNGT und ersetzt nichts: Was der Melder geschrieben hat,
  # ist der Beleg — dieselbe Überlegung wie `on delete set null` an `from_user_id`.
  SICHER_NOTIZ="$(printf '%s' "$NOTIZ" | sed "s/'/''/g")"
  # ⚠️ `with … select` und nicht `update … returning` direkt: psql hängt bei einem
  # UPDATE IMMER seinen Befehlszähler an die Ausgabe, auch mit `-tA` und auch mit
  # `returning`. Beim ersten Bauen stand deshalb `✓ Abgehakt: UPDATE 0` da —
  # **das Werkzeug meldete Erfolg, obwohl es nichts getan hatte**, weil die
  # Leerprüfung einen nicht-leeren Text sah. Gefunden nur dadurch, dass derselbe
  # Aufruf ZWEIMAL gemacht wurde; ein einzelner Lauf sah tadellos aus. Als CTE ist
  # es eine SELECT-Abfrage, und die gibt genau die Zeilen zurück, die es gibt.
  ERG="$(frage "
    with abgehakt as (
    update reports
       set erledigt_am = now(),
           erledigt_von = '$ICH',
           note = case when '$SICHER_NOTIZ' = '' then note
                       when note = '' then '[erledigt] $SICHER_NOTIZ'
                       else note || E'\n[erledigt] $SICHER_NOTIZ' end
     where id::text = '$(printf '%s' "$ID" | sed "s/'/''/g")'
       and erledigt_am is null
    returning id)
    select id from abgehakt;")"
  if [ -z "$ERG" ]; then
    echo "✗ Nichts abgehakt. Entweder gibt es die ID nicht — oder die Meldung war"
    echo "  schon erledigt. Beides steht in:  npm run meldungen -- alle"
    exit 1
  fi
  echo "✓ Abgehakt: $ERG"
  exit 0
fi

# ── Lesen ───────────────────────────────────────────────────────────────────
#
# Die zwei `left join` auf dieselbe Spalte sind der Kern: `target_id` trägt je
# nach `target_type` eine Post- oder eine Profil-ID und hat deshalb GAR KEINEN
# Fremdschlüssel — Postgres kann einen nicht auf zwei Tabellen richten. Folge:
# **Eine Meldung kann ins Leere zeigen, und kein Constraint warnt.** Genau
# deshalb wird hier `is not null` mitgeholt statt nur der Titel: Ein Leser, der
# das nicht ausspricht, schickt jemanden auf die Suche nach einem Post, den es
# nicht mehr gibt, und der hält dann das Werkzeug für kaputt.
WO="where r.erledigt_am is null"
[ "$BEFEHL" = "alle" ] && WO=""

psql "$DB_URL" -tA -v ON_ERROR_STOP=1 -c "
select coalesce(json_agg(z), '[]') from (
  select r.id, r.target_type, r.target_id, r.reason, r.note,
         r.created_at, r.erledigt_am,
         bearb.handle             as erledigt_von_handle,
         r.erledigt_von is not null as hat_bearbeiter,
         melder.handle            as melder,
         r.from_user_id is null   as melder_weg,
         p.id is not null         as ziel_da_post,
         p.title, p.category, p.district, p.starts_at,
         pa.handle                as post_autor,
         u.id is not null         as ziel_da_user,
         u.handle                 as ziel_handle,
         u.display_name           as ziel_name,
         (select count(*) from reports r2
           where r2.target_id = r.target_id and r2.target_type = r.target_type) as anzahl_gegen_ziel
    from reports r
    left join profiles melder on melder.id = r.from_user_id
    left join profiles bearb  on bearb.id  = r.erledigt_von
    left join posts    p      on p.id = r.target_id and r.target_type = 'post'
    left join profiles pa     on pa.id = p.author_id
    left join profiles u      on u.id = r.target_id and r.target_type = 'user'
    $WO
   order by r.created_at
) z;" 2>&1 | filtern > "$ARBEIT/meldungen.json"

if ! head -c1 "$ARBEIT/meldungen.json" | grep -q '\['; then
  echo "✗ Die Abfrage kam nicht durch:"
  cat "$ARBEIT/meldungen.json" | sed 's/^/  /'
  exit 1
fi

# ── Die Regel-Dateien nach JS bringen ───────────────────────────────────────
# `meldung.ts` und `config/melden.ts` importieren AUSSCHLIESSLICH Typen, also
# bleibt nach `tsc` kein Import übrig und beide laufen in blankem Node. Das ist
# der Unterschied zwischen „das Werkzeug wendet Ians Regel an" und „das Werkzeug
# hat dieselbe Zahl noch einmal hingeschrieben".
cat > "$ARBEIT/tsconfig.json" <<JSON
{
  "compilerOptions": {
    "target": "es2022", "module": "es2022", "moduleResolution": "bundler",
    "strict": true, "skipLibCheck": true, "outDir": "$ARBEIT/js",
    "rootDir": "$WURZEL/src", "verbatimModuleSyntax": false,
    "paths": { "@/*": ["$WURZEL/src/*"] }
  },
  "files": [
    "$WURZEL/src/features/safety/meldung.ts",
    "$WURZEL/src/config/melden.ts",
    "$WURZEL/src/lib/handle.ts"
  ]
}
JSON
(cd "$WURZEL" && npx tsc -p "$ARBEIT/tsconfig.json")
find "$ARBEIT/js" -name "*.js" -exec sh -c 'mv "$1" "${1%.js}.mjs"' _ {} \;

# Ein Wächter gegen das, was diese ganze Bauart trägt: Bliebe nach dem Übersetzen
# ein Laufzeit-Import übrig, liefe die Datei in blankem Node gar nicht — und der
# nächste Mensch hätte die Zahl „24" aus Bequemlichkeit hier hineingeschrieben.
#
# ⚠️ Er fragt ALLE übersetzten Dateien, nicht die eine, an die man gerade denkt.
# Die erste Fassung prüfte nur `meldung.mjs` — und der Lauf starb am 2026-09-13
# trotzdem mit `ERR_MODULE_NOT_FOUND: '@/config'`, weil der Import in einer
# ANDEREN mitgeladenen Datei stand (`auth/konto.ts`, die `@/config/alter` zieht).
# Dieselbe Familie wie „ein Wächter hinter einem anderen ist ein ungeprüfter
# Wächter": Eine Prüfung, die nur einen Teil dessen abdeckt, was sie schützen
# soll, meldet grün für den ungedeckten Rest.
SCHMUTZ="$(grep -lE "^import .* from|require\(" "$ARBEIT"/js/**/*.mjs "$ARBEIT"/js/*.mjs 2>/dev/null || true)"
if [ -n "$SCHMUTZ" ]; then
  echo "✗ Diese Regel-Dateien haben einen LAUFZEIT-Import und laufen nicht in"
  echo "  blankem Node (siehe den Kopf dieser Datei):"
  for D in $SCHMUTZ; do
    echo "    ${D#$ARBEIT/js/}"
    grep -nE "^import .* from|require\(" "$D" | sed 's/^/       /'
  done
  exit 1
fi

ARBEIT="$ARBEIT" BEFEHL="$BEFEHL" node "$HIER/meldungen.mjs"
