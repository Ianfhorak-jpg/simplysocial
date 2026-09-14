#!/usr/bin/env python3
# ══════════════════════════════════════════════════════════════════════════════
#  DAS ETIKETT BEWACHEN — Phase 21.3
#
#  Aufruf: npm run pruef-etikett   (braucht nichts: keine Datenbank, kein Gerät)
#
#  ── Wozu ────────────────────────────────────────────────────────────────────
#  `_FUER_IAN/DATENSCHUTZ_ETIKETT.md` ist eine LISTE VON FELDNAMEN. Damit trägt
#  es genau die Falle aus FALLEN.md: *Eine Prüfung, die NAMEN aufzählt, merkt
#  nicht, wenn etwas dazukommt.* Kommt in einer Migration eine Spalte `phone`
#  dazu, ist das Etikett still falsch — und bei Apple ist „still falsch" der
#  teure Fall, weil er nach Absicht aussieht.
#
#  Dieser Wächter dreht die Richtung um: Er liest das SCHEMA und fragt, ob jede
#  Spalte im Etikett vorkommt. Nicht das Etikett sagt, was es gibt, sondern der
#  Code sagt, was im Etikett stehen muss.
#
#  ── Was er NICHT leistet ────────────────────────────────────────────────────
#  Er prüft, ob eine Spalte ERWÄHNT ist — nicht, ob sie der richtigen
#  Apple-Kategorie zugeordnet wurde. Das ist ein Urteil, keine Messung.
# ══════════════════════════════════════════════════════════════════════════════
import re, sys, json, pathlib

WURZEL = pathlib.Path(__file__).resolve().parents[2]
ETIKETT = WURZEL.parent / '_FUER_IAN' / 'DATENSCHUTZ_ETIKETT.md'
MIGRATIONEN = WURZEL / 'supabase' / 'migrations'
SENDEN = WURZEL / 'src' / 'data' / 'senden.ts'
PAKET = WURZEL / 'package.json'

JA = NEIN = 0
def pruef(text, ok, dazu=''):
    global JA, NEIN
    if ok: print(f'  ✓ {text}'); JA += 1
    else:  print(f'  ✗ {text}' + (f'  ({dazu})' if dazu else '')); NEIN += 1

# ── Spalten, die KEINE personenbezogenen Daten sind ───────────────────────────
# Sie stehen bewusst NICHT im Etikett, und diese Liste ist der Grund dafür.
# Wer hier etwas einträgt, sagt: „Das ist keine Angabe über einen Menschen."
TECHNIK = {
    # Zeitstempel und Zustände — sie entstehen, sie werden nicht angegeben
    'created_at', 'sent_at', 'joined_at', 'starts_at', 'expires_at',
    'last_message_at', 'aufgeloest_am', 'erledigt_am', 'status',
    # Fremdschlüssel: sie zeigen auf eine ID, die als „Benutzer-ID" schon im
    # Etikett steht. Zweimal nennen machte das Etikett nicht genauer.
    'id', 'post_id', 'thread_id', 'group_id', 'user_id', 'sender_id',
    'from_user_id', 'to_user_id', 'follower_id', 'followee_id',
    'blocker_id', 'blocked_id', 'author_id', 'creator_id', 'target_id',
    'visibility_group_id', 'erledigt_von',
    # Einstellungen an einem Post/einer Gruppe, keine Angabe über eine Person
    'category', 'level', 'spots_total', 'spots_filled', 'offen',
    'alter_kind', 'alter_von_jahrgang', 'alter_bis_jahrgang',
    'visibility_kind', 'target_type',
    # Die HERKUNFT eines Chats (harte Regel 56) — eine Tatsache ueber den Chat,
    # keine Angabe ueber einen Menschen. Was IN dem Chat steht, ist als
    # `messages.text` im Etikett; dieser Boolean sagt nur, wo er herkam.
    'aus_aktivitaet',
}

def spalten_aus_migrationen():
    """
    Jede Spalte aus allen Migrationen — aus `create table` UND aus
    `alter table … add column`.

    ⚠️ **Der zweite Weg fehlte bis zum 2026-09-14, und das war ein Loch im
    Wächter**, gefunden bei der ersten Migration, die ihn überhaupt benutzt
    (0011, die Zustimmung). Bis dahin legte jede Migration ihre Spalten in einem
    `create table` an, also fiel es niemandem auf — der Wächter war grün und
    hätte zwei neue Spalten schlicht nicht gesehen. Harte Regel 107 („der Code
    sagt, was im Etikett stehen MUSS") wäre ab 0011 still gebrochen gewesen.

    Das ist dieselbe Familie wie die Falle, gegen die dieser Prüfstand gebaut
    ist: *Eine Prüfung, die NAMEN aufzählt, merkt nicht, wenn etwas dazukommt* —
    hier zählte er keine Namen, sondern eine SCHREIBWEISE auf, und das ist
    derselbe Fehler eine Ebene höher.
    """
    gefunden = {}
    for datei in sorted(MIGRATIONEN.glob('*.sql')):
        text = datei.read_text()
        for m in re.finditer(r'create table (?:if not exists )?(\w+)\s*\((.*?)\n\);', text, re.S):
            tabelle, rumpf = m.group(1), m.group(2)
            for zeile in rumpf.splitlines():
                z = zeile.strip()
                if not z or z.startswith('--') or z.startswith('constraint'):
                    continue
                if re.match(r'(primary key|unique|check|foreign key)\b', z):
                    continue
                sp = re.match(r'(\w+)\s+[\w\[\]. ]', z)
                if sp:
                    gefunden.setdefault(sp.group(1), []).append(f'{tabelle}.{sp.group(1)}')

        # `alter table X add column a …, add column b …;` — eine Anweisung, die
        # bis zum `;` läuft und mehrere Spalten tragen kann. Gesucht wird jedes
        # `add column`, nicht nur das erste: Genau daran wäre 0011 durchgerutscht,
        # die zwei davon hat.
        for m in re.finditer(r'alter table (?:if exists )?(\w+)\s+(.*?);', text, re.S):
            tabelle, rumpf = m.group(1), m.group(2)
            for sp in re.finditer(r'add column (?:if not exists )?(\w+)\s+[\w\[\]. ]', rumpf):
                gefunden.setdefault(sp.group(1), []).append(f'{tabelle}.{sp.group(1)}')
    return gefunden

print()
print('════ Das Datenschutz-Etikett gegen den Code (21.3) ═════════════════════')
print()

pruef('das Etikett gibt es überhaupt', ETIKETT.exists(), str(ETIKETT))
if not ETIKETT.exists():
    sys.exit(1)
text = ETIKETT.read_text()

# ── 1. Jede Spalte im Schema ist entweder Technik oder steht im Etikett ───────
print('── Jede Spalte ist eingeordnet ─────────────────────────────────────────')
spalten = spalten_aus_migrationen()
pruef(f'{len(spalten)} verschiedene Spaltennamen im Schema gefunden', len(spalten) > 20, str(len(spalten)))

offen = []
for name, orte in sorted(spalten.items()):
    if name in TECHNIK:
        continue
    if name not in text:
        offen.append(f'{name} ({orte[0]})')
pruef('keine Spalte fehlt im Etikett', not offen, '; '.join(offen))

# Gegenprobe: eine erfundene Spalte MUSS auffallen, sonst misst der Test nichts.
erfunden = 'telefonnummer_xyz'
pruef('Gegenprobe: eine erfundene Spalte fiele auf',
      erfunden not in text and erfunden not in TECHNIK)

# ── 2. Kein Tracking-, Werbe- oder Analyse-Paket ─────────────────────────────
print()
print('── Keine Drittanbieter, die mitlesen ───────────────────────────────────')
abh = json.loads(PAKET.read_text()).get('dependencies', {})
VERDACHT = ('analytics', 'sentry', 'firebase', 'amplitude', 'mixpanel',
            'facebook', 'appsflyer', 'adjust', 'segment', 'bugsnag',
            'crashlytics', 'branch', 'onesignal', 'posthog')
treffer = [p for p in abh if any(v in p.lower() for v in VERDACHT)]
pruef(f'kein Analyse-/Werbe-Paket unter {len(abh)} Abhängigkeiten', not treffer, ', '.join(treffer))
pruef('Gegenprobe: die Verdachtsliste greift überhaupt',
      any(v in 'react-native-firebase-analytics' for v in VERDACHT))

# ── 3. Der Standort verlässt das Gerät nicht ────────────────────────────────
print()
print('── Der Standort verlässt das Gerät nicht ───────────────────────────────')
# Das ist die schärfste Zusage des Etiketts (harte Regel 47). Sie hängt daran,
# dass der Weg nach draußen — `senden.ts` — Koordinaten gar nicht kennt.
senden = SENDEN.read_text()
KOORD = ('GeoPunkt', 'latitude', 'longitude', 'coords', 'getCurrentPosition')
drin = [k for k in KOORD if k in senden]
pruef('senden.ts kennt keine Koordinaten', not drin, ', '.join(drin))

# Gegenprobe: Die Wörter MÜSSEN anderswo vorkommen — sonst prüft der Test nur,
# dass man sie falsch geschrieben hat. (FALLEN.md: „Eine Textsuche mit NULL
# Treffern beweist nichts — sie braucht die Gegenprobe im selben Ordner.")
geo = (WURZEL / 'src' / 'lib' / 'karte-geo.ts')
pruef('Gegenprobe: die Wörter gibt es wirklich (karte-geo.ts)',
      geo.exists() and any(k in geo.read_text() for k in KOORD))

# Kein Koordinatenfeld im Schema
GEO_SPALTEN = {'lat', 'lng', 'latitude', 'longitude', 'geo', 'location', 'coords', 'point'}
geo_treffer = [s for s in spalten if s in GEO_SPALTEN]
pruef('kein Koordinatenfeld in den 13 Tabellen', not geo_treffer, ', '.join(geo_treffer))

# ── 4. Die Entscheidungen stehen drin ───────────────────────────────────────
print()
print('── Die Entscheidungen stehen drin ──────────────────────────────────────')
pruef('Entscheidung 78 (Bezirk = grober Standort) ist vermerkt', 'Entscheidung 78' in text)
pruef('… und der Satz für die Datenschutzerklärung steht dabei',
      'speichern keine' in text and 'Koordinaten' in text)
# ⚠️ Diese Zeile stand beim ersten Lauf als `'kein Geburtsdatum' in text.lower()`
# da — grosses G gegen einen kleingeschriebenen Text, das kann NIE zutreffen. Sie
# war also rot, obwohl der Satz im Etikett steht. Ein Pruefstand, der aus dem
# falschen Grund rot ist, belegt gar nichts (FALLEN.md) — hier hat er immerhin in
# die sichere Richtung versagt.
pruef('kein Geburtsdatum behauptet', 'kein geburtsdatum' in text.lower())

print()
print(f'  {JA} Häkchen, {NEIN} Kreuze')
print()
sys.exit(1 if NEIN else 0)
