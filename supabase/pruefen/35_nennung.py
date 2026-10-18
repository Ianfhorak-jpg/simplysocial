#!/usr/bin/env python3
# ══════════════════════════════════════════════════════════════════════════════
#  DIE NAMENSNENNUNG BEWACHEN — Lizenzbedingung, nicht Höflichkeit
#
#  Aufruf: npm run pruef-nennung   (braucht nichts: kein Server, kein Gerät)
#
#  ── Warum es diesen Wächter seit dem 2026-09-20 gibt ────────────────────────
#  Die Bezirksumrisse in `data/wien-bezirke.ts` stammen von der Stadt Wien und
#  stehen unter CC BY 4.0. Die Nennung ist **Bedingung** dieser Lizenz.
#
#  Bis zum 2026-09-20 stand sie IN der Karte, und der Kommentar an
#  `KARTE_QUELLE` nannte auch den Grund: *„Eine Lizenzzeile, die in einem Screen
#  lebt, verschwindet beim nächsten Umbau, und dann verstößt die App still gegen
#  eine Lizenz."* Die Karte selbst war ihre Sicherung — sie reiste mit.
#
#  🔴 **Genau diese Sicherung ist mit Ians Entscheidung weggefallen.** Auf der
#  Karte überschnitt sich die Zeile mit Apples eigener Nennung, die MapKit
#  zeichnet und deren Lage uns nicht gehört; sie steht jetzt in Einstellungen →
#  Rechtliches. Das ist der übliche Ort in einer App — aber es ist ein SCREEN,
#  also genau der Fall, vor dem der Kommentar warnt. Dieser Prüfstand ist der
#  Ersatz für die Sicherung, die die Karte war.
#
#  ⚠️ **Was er NICHT kann.** Er liest Text. Ob die Zeile am Gerät sichtbar ist,
#  ob sie hinter etwas liegt oder abgeschnitten wird, sagt nur ein Bild.
#  *Geometrie prüfen ist nicht hinschauen* (FALLEN.md).
#
#  ── Warum jede Prüfung ihre Gegenprobe mitbringt ────────────────────────────
#  Eine Textsuche mit null Treffern sieht genauso aus wie eine umgebaute Datei.
#  Deshalb prüft jeder Abschnitt zuerst, dass er seinen Gegenstand GEFUNDEN hat.
# ══════════════════════════════════════════════════════════════════════════════
import pathlib, re, sys

WURZEL = pathlib.Path(__file__).resolve().parents[2]
KARTE = WURZEL / 'src' / 'features' / 'posts' / 'karte.ts'
EINST = WURZEL / 'src' / 'app' / 'einstellungen.tsx'
DATEN = WURZEL / 'src' / 'data' / 'wien-bezirke.ts'

JA = NEIN = 0
def pruef(text, ok, dazu=''):
    global JA, NEIN
    if ok:
        print(f'  ✓ {text}'); JA += 1
    else:
        print(f'  ✗ {text}' + (f'  ({dazu})' if dazu else '')); NEIN += 1

for datei in (KARTE, EINST, DATEN):
    if not datei.exists():
        sys.exit(f'✗ {datei} fehlt.')

karte = KARTE.read_text()
einst = EINST.read_text()

# ══════════════════════════════════════════════════════════════════════════════
#  1 · Die Konstante steht an EINER Stelle, und es ist nicht der Screen
# ══════════════════════════════════════════════════════════════════════════════
print('── Der Text hat EINEN Ort ──')

m = re.search(r"export const KARTE_QUELLE = '([^']+)';", karte)
pruef(f'`KARTE_QUELLE` steht in `features/posts/karte.ts`',
      bool(m),
      'ohne die Konstante hat die Nennung keinen Ort mehr')
text = m.group(1) if m else ''
pruef('… und nennt die Stadt Wien als Urheberin',
      'Stadt Wien' in text,
      'CC BY verlangt die Nennung der Urheberin, nicht nur der Lizenz')
pruef('… und die Lizenz beim Namen',
      'CC BY' in text,
      'ohne Lizenzangabe ist es keine CC-BY-konforme Nennung')
pruef('… und die Quelle, aus der die Daten kommen',
      'data.wien.gv.at' in text,
      'CC BY verlangt einen Verweis auf das Material, soweit zumutbar')

# Der Screen darf den Satz NICHT selbst hinschreiben — dann gäbe es ihn zweimal,
# und die Kopie im Screen wäre die, die niemand pflegt.
pruef('Der Screen schreibt den Satz NICHT selbst hin',
      'Stadt Wien' not in einst,
      'eine zweite Fassung im Screen ist die, die beim nächsten Umbau falsch wird')

# ══════════════════════════════════════════════════════════════════════════════
#  2 · Sie wird auch wirklich ANGEZEIGT — der Ersatz für die alte Sicherung
# ══════════════════════════════════════════════════════════════════════════════
print('')
print('── Sie steht in Einstellungen → Rechtliches ──')

pruef('Die Einstellungen holen sich `KARTE_QUELLE`',
      re.search(r"import \{ KARTE_QUELLE \} from '@/features/posts/karte';", einst) is not None,
      'ohne den Import kann der Screen sie gar nicht zeigen')
pruef('… und zeigen sie an',
      '{KARTE_QUELLE}' in einst,
      'ein Import, den niemand rendert, ist keine Nennung')

# Und zwar im Rechtliches-Block, nicht irgendwo. Gemessen wird die REIHENFOLGE
# im Text: Der Block beginnt bei der Überschrift und endet beim nächsten Block.
#
# ⚠️ **Hier stand bis zum 2026-10-18 das Wort „Rechtliches" selbst.** Seit der
# Übersetzung kommt die Überschrift aus dem Wörterbuch, und der Wächter fand den
# Block nicht mehr — er meldete, Apples Nennung stehe am falschen Ort, obwohl sie
# unverändert richtig stand. **Nachgezogen VERENGT:** gesucht wird der SCHLÜSSEL,
# und zusätzlich geprüft, dass er in beiden Wörterbüchern einen Text hat. Ein
# Tippfehler im Schlüssel hätte sonst eine Überschrift erzeugt, die keiner liest —
# und die Prüfung wäre grün geblieben.
m_block = re.search(r"t\('regeln\.rechtliches'\)\}\s*</SsText>(.*?)</View>", einst, re.S)
pruef('… und zwar im Block „Rechtliches"',
      bool(m_block) and '{KARTE_QUELLE}' in m_block.group(1),
      'unter „Dein Konto" oder „Für die Entwicklung" sucht sie niemand — '
      'und „Für die Entwicklung" fliegt eines Tages raus')
for _spr in ('de', 'en'):
    _w = (WURZEL / 'src' / 'i18n' / f'{_spr}.ts').read_text(encoding='utf-8')
    pruef(f'… und {_spr}.ts gibt der Überschrift einen Text',
          re.search(r"rechtliches:\s*'[^']+'", _w) is not None,
          'ein Schlüssel ohne Eintrag zeigt dem Menschen den Schlüssel')

# ══════════════════════════════════════════════════════════════════════════════
#  3 · Sie steht NICHT mehr auf der Karte (Ians Entscheidung, 2026-09-20)
# ══════════════════════════════════════════════════════════════════════════════
print('')
print('── Nicht mehr auf der Karte — beide Zeichner ──')

# Harte Regel 52: Es gibt mehr als einen Kartenzeichner und GENAU EINE Bedeutung.
# Ein Zeichner, der sie wieder zeichnet, bringt die Überlappung zurück.
for name in ('SsWienKarte.tsx', 'SsAppleKarte.native.tsx'):
    datei = WURZEL / 'src' / 'components' / 'ui' / name
    roh = datei.read_text() if datei.exists() else ''
    pruef(f'`{name}` ist gefunden', bool(roh),
          'eine Textsuche mit null Treffern beweist nichts')
    pruef(f'… und zeichnet `KARTE_QUELLE` nicht mehr',
          '{KARTE_QUELLE}' not in roh,
          'auf der Karte überschneidet sie sich mit Apples Nennung, deren Lage MapKit gehört')

# Die Gegenprobe gegen den Wächter selbst: Fände er die Zeichner gar nicht mehr
# (umbenannt, verschoben), sähen die zwei Prüfungen oben genauso grün aus.
zeichner = list((WURZEL / 'src' / 'components' / 'ui').glob('Ss*Karte*.tsx'))
pruef(f'Gegenprobe: es gibt überhaupt Kartenzeichner (gefunden: {len(zeichner)})',
      len(zeichner) >= 2,
      'sind sie umbenannt, prüft dieser Abschnitt zwei Dateien, die es nicht gibt')

print('')
print(f'  {JA} Häkchen, {NEIN} Kreuze')
sys.exit(1 if NEIN else 0)
