#!/usr/bin/env python3
# ══════════════════════════════════════════════════════════════════════════════
#  DIE FARBEN BEWACHEN — Phase 22, Teil 1
#
#  Aufruf: npm run pruef-farben   (braucht nichts: kein Server, kein Gerät)
#
#  ── Wozu ────────────────────────────────────────────────────────────────────
#  Der Dunkelmodus ist die billigste Änderung dieser Phase — **eine Datei ändern,
#  58 folgen** — und genau das ist die Gefahr. `tsc` gibt 0 zurück, `expo lint`
#  meldet unverändert 89, und die App ist stellenweise unlesbar. Gerechnet fällt
#  `ink` von 16,73 auf **1,03** und `accent.base` von 9,88 auf **1,74**, sobald
#  `bg` dunkel wird. **`tsc` und `eslint` sehen keine Farben.**
#
#  Verschärfend: **Sport wird als einzige Kategorie besser** (1,95 → 8,80). Ein
#  Blick auf einen Sport-Post gibt also einen falschen Eindruck von „passt".
#
#  ── Warum er GRÜN sein muss, bevor irgendetwas geändert wird ────────────────
#  Er wird am hellen Stand geschrieben und muss dort grün sein. Ein Prüfstand,
#  den man erst nach der Änderung zum ersten Mal laufen lässt, kann nicht
#  unterscheiden, ob er einen echten Fehler gefunden hat oder selbst falsch ist.
#
#  ⚠️ **Und deshalb stehen hier nicht die Wunschschwellen.** Beim Schreiben am
#  2026-09-14 kam heraus, dass zwei davon am HELLEN Stand schon verletzt sind:
#
#      surface/bg              1,05   (der Plan wollte ≥ 1,10)
#      outdoor.onBase/base     3,88   (WCAG AA verlangt 4,5)
#
#  Hätte ich sie trotzdem hingeschrieben, wäre der Wächter am ersten Tag rot
#  gewesen — *und ein Wächter, der zu viel sperrt, wird abgeschaltet statt
#  gelesen* (FALLEN.md). Also: harte Schwellen nur dort, wo sie heute erfüllt
#  sind; für den Rest der **eingefrorene Ist-Wert**. Der Wächter findet damit
#  VERSCHLECHTERUNG, nicht Unvollkommenheit. Was unter WCAG liegt, steht als
#  Befund in Abschnitt 4 — sichtbar, aber nicht als Sperre.
#
#  ── Was die Umkehr überlebt und was nicht ───────────────────────────────────
#  Zwei Drittel der Messungen sind ÖRTLICHE Verhältnisse — ein Element gegen sich
#  selbst (`onBase` gegen `base`, `deep` gegen `base`). Die sind vom Untergrund
#  unabhängig und gelten nach der Umkehr unverändert. Was sich ändert, ist alles
#  mit `bg` darin. Deshalb sind die zwei Gruppen hier getrennt aufgeschrieben.
# ══════════════════════════════════════════════════════════════════════════════
import pathlib, re, sys

WURZEL = pathlib.Path(__file__).resolve().parents[2]
QUELLE = WURZEL / 'src' / 'theme' / 'colors.ts'

JA = NEIN = 0
def pruef(text, ok, dazu=''):
    global JA, NEIN
    if ok:
        print(f'  ✓ {text}'); JA += 1
    else:
        print(f'  ✗ {text}' + (f'  ({dazu})' if dazu else '')); NEIN += 1


# ── Das Messgerät, und es ist ein ANDERES als in glasmessung.py ──────────────
# Dort geht es um WAHRGENOMMENE HELLIGKEIT (Rec. 601) — „wie hell sieht diese
# Fläche aus". Hier geht es um LESBARKEIT, und dafür gilt WCAG: relative
# Luminanz mit sRGB-Linearisierung, dann das Verhältnis (L+0,05)/(L+0,05).
# Die zwei Formeln sehen ähnlich aus und beantworten verschiedene Fragen; sie zu
# verwechseln ist der naheliegende Fehler.
def luminanz(h):
    def kanal(c):
        c /= 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (kanal(int(h[i:i + 2], 16)) for i in (1, 3, 5))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def kontrast(a, b):
    l1, l2 = sorted((luminanz(a), luminanz(b)), reverse=True)
    return (l1 + 0.05) / (l2 + 0.05)


if not QUELLE.exists():
    sys.exit(f'✗ {QUELLE} fehlt.')
text = QUELLE.read_text()

# Die Grundfarben stehen im ersten Block, vor dem Interface.
GRUND = dict(re.findall(r"(\w+): '(#[0-9A-Fa-f]{6})'", text.split('export interface')[0]))
for noetig in ('bg', 'surface', 'ink', 'inkSoft', 'line'):
    if noetig not in GRUND:
        sys.exit(f'✗ `{noetig}` nicht in colors.ts gefunden — der Aufbau hat sich geändert.')

# Die sechs Kategorien plus accent und danger.
PALETTEN = {}
#
# ⚠️ **Nicht die Reihenfolge der Schlüssel abfragen.** Der erste Versuch verlangte
# `base, soft, deep, onBase, onSoft` in genau dieser Folge — als `aufGrund`
# dazukam, fand er die sechs Kategorien NICHT MEHR und meldete für die zwei
# übrigen Paletten brav „alles grün". Nur die Gegenprobe in Abschnitt 1
# („alle acht gelesen?") hat das gezeigt. *Eine Textsuche mit null Treffern
# beweist nichts* — auch auf Prüfstandsebene.
for m in re.finditer(r"(\w+): \{ ((?:\w+: '#\w{6}',?\s*)+)\}", text):
    n, inhalt = m.groups()
    werte = dict(re.findall(r"(\w+): '(#\w{6})'", inhalt))
    if {'base', 'soft', 'deep', 'onBase', 'onSoft'} <= set(werte):
        PALETTEN[n] = werte
for name in ('accent', 'danger'):
    teil = text.split(f'export const {name}')
    if len(teil) > 1:
        PALETTEN[name] = dict(re.findall(r"(\w+): '(#\w{6})'", teil[1].split('}')[0]))

# Die Gegenprobe des Lesers: *Eine Textsuche mit NULL Treffern beweist nichts.*
# Findet der Leser weniger Paletten als es gibt, prüft er den Rest umsonst.
ERWARTET = {'sport', 'food', 'study', 'culture', 'outdoor', 'creative', 'accent', 'danger'}

print('── 1. Der Leser hat gefunden, was da ist ───────────────────────────────')
pruef(f'{len(GRUND)} Grundfarben gelesen: {", ".join(sorted(GRUND))}', len(GRUND) >= 5)
fehlt = ERWARTET - set(PALETTEN)
pruef(f'Alle acht Paletten gelesen ({", ".join(sorted(PALETTEN))})', not fehlt,
      f'es fehlen: {fehlt} — der Aufbau von colors.ts hat sich geändert')
for n, p in PALETTEN.items():
    if set(p) != {'base', 'soft', 'deep', 'onBase', 'onSoft'} - set():
        pruef(f'Palette `{n}` hat alle fünf Werte', set(p) >= {'base', 'soft', 'deep', 'onBase', 'onSoft'},
              f'gefunden: {sorted(p)}')

print('')
print('── 2. Örtliche Verhältnisse — sie überleben die Umkehr unverändert ─────')
# Ein Element gegen sich selbst. Vom Untergrund unabhängig, gilt hell wie dunkel.
# Diese Schwellen sind heute ALLE erfüllt, deshalb dürfen sie hart sein.
for n, p in sorted(PALETTEN.items()):
    k = kontrast(p['onSoft'], p['soft'])
    pruef(f'{n:9} Text auf der weichen Fläche: {k:5.2f} ≥ 4,5', k >= 4.5)
for n, p in sorted(PALETTEN.items()):
    k = kontrast(p['deep'], p['base'])
    pruef(f'{n:9} tiefe Stufe gegen Grundfarbe: {k:5.2f} ≥ 2,0', k >= 2.0)

print('')
print('── 3. Alles mit `bg` — hier ändert die Umkehr die Zahlen ───────────────')
# Diese Zahlen kippen mit dem Untergrund. Sie sind der eigentliche Grund für
# diesen Prüfstand.
for wer, schwelle in (('ink', 7.0), ('inkSoft', 4.5)):
    k = kontrast(GRUND[wer], GRUND['bg'])
    pruef(f'{wer:9} auf dem Grund: {k:6.2f} ≥ {schwelle}', k >= schwelle,
          'auf Dunkel muss dieser Ton gedreht werden')

# ⚠️ surface/bg ist heute 1,05 — der Plan wollte 1,10. Eingefroren statt
# gewünscht: Die Karte darf nicht WENIGER sichtbar werden als heute.
k = kontrast(GRUND['surface'], GRUND['bg'])
pruef(f'{"surface":9} hebt sich vom Grund ab: {k:6.2f} ≥ 1,05 (Ist-Wert eingefroren)',
      k >= 1.05, 'die Karte verschwindet im Grund')
k = kontrast(GRUND['line'], GRUND['bg'])
pruef(f'{"line":9} ist vom Grund zu unterscheiden: {k:6.2f} ≥ 1,15', k >= 1.15)

print('')
print('── 4. Was HEUTE schon unter WCAG liegt — Befund, keine Sperre ──────────')
# Aufgeschrieben, damit es nicht in der Umkehr untergeht: Nach dem Dunkelmodus
# wäre sonst nicht zu unterscheiden, was die Umkehr kaputt gemacht hat und was
# vorher schon so war.
EINGEFROREN = {}
for n, p in sorted(PALETTEN.items()):
    k = kontrast(p['onBase'], p['base'])
    if k < 4.5:
        EINGEFROREN[n] = k
        print(f'  ⚠️  {n:9} Text auf der Grundfarbe: {k:5.2f} < 4,5 (WCAG AA)')
        print(f'      Das ist HEUTE schon so und keine Folge des Dunkelmodus.')
    pruef(f'{n:9} Text auf der Grundfarbe: {k:5.2f} ≥ {max(3.8, 4.5) if k >= 4.5 else 3.85:.2f}',
          k >= (4.5 if n not in EINGEFROREN else 3.85),
          'schlechter als der eingefrorene Ist-Wert')

print('')
print('── 4b. `aufGrund` — der Wert, den es auf hellem Grund nicht brauchte ────')
# Acht Stellen der App benutzen eine Kategoriefarbe als VORDERGRUND (ein Icon,
# eine Beschriftung, die Wortmarke). Auf Papierweiss war das `base`; auf Dunkel
# kommt `culture.base` auf 3,23 und `accent.base` auf 1,74.
for n, p in sorted(PALETTEN.items()):
    if 'aufGrund' not in p:
        pruef(f'{n:9} hat einen `aufGrund`-Wert', False, 'Pflichtfeld im Interface')
        continue
    k = kontrast(p['aufGrund'], GRUND['bg'])
    pruef(f'{n:9} aufGrund auf der Grundfläche: {k:5.2f} ≥ 4,5', k >= 4.5)
# Und die Kategorie-Identität: `base` darf sich NICHT geändert haben. Sport bleibt
# Sport. Ein aufgehelltes `base` wäre die bequeme Antwort gewesen und eine
# Identitätsänderung — *eine Prüf-Erwartung, die BEQUEMLICHKEIT verlangt, prüft
# nicht die Regel* (FALLEN.md).
IDENTITAET = {'sport': '#EDA803', 'food': '#2E7D5B', 'study': '#3D6BC2',
              'culture': '#7B4FC2', 'outdoor': '#6B8C28', 'creative': '#C23D7B',
              'danger': '#C2352F'}
for n, soll in sorted(IDENTITAET.items()):
    pruef(f'{n:9} base ist unverändert {soll}', PALETTEN.get(n, {}).get('base') == soll,
          f"steht auf {PALETTEN.get(n, {}).get('base')} — das ist eine Identitätsänderung")

print('')
print('── 5. Kein Farbliteral ausserhalb von colors.ts ────────────────────────')
# `tsc` sieht keine Farben. Wer `#FFFFFF` in einen Screen schreibt, hat eine
# Farbe gebaut, die der Dunkelmodus nicht erreicht — und sie fällt erst am
# Gerät auf, wenn überhaupt.
#
# ⚠️ Die Ausnahmen stehen NAMENTLICH da. *Eine Prüfung, die NAMEN aufzählt,
# merkt nicht, wenn etwas dazukommt* — deshalb ist die Liste hier nicht die
# Erlaubnis, sondern die ARBEITSLISTE für Teil 1, Schritt 7 des Plans.
AUSNAHMEN = {
    'theme/colors.ts':                 'die Quelle selbst',
    'features/posts/karte.ts':         'Kartenskala — läuft auf accent.base zu, dreht mit',
    'components/PrototypHinweis.tsx':  'rendert nur auf Web',
    'components/BildZuschneiden.tsx':  'Abdunkelung ausserhalb des Zuschnitts',
    # ⚠️ Der Plan nannte `components/ui/KartenBlase.tsx` — die Datei liegt eine
    # Ebene höher. Erst der erweiterte Scanner hat das gezeigt; mit dem alten
    # Muster meldete der falsche Pfad brav „0 Literale" und sah richtig aus.
    'components/KartenBlase.tsx':      'boxShadow — wird auf Dunkel eine helle Kante',
    'components/ui/SsBlatt.tsx':       'boxShadow — dito',
    'components/ui/glas-typen.ts':     'boxShadow — dito',
}
#
# ⚠️ **Der erste Versuch suchte nur `#rrggbb` und fand 5 von 12.** Die Literale
# in `PrototypHinweis.tsx`, `BildZuschneiden.tsx`, `SsBlatt.tsx` und
# `glas-typen.ts` stehen als **`rgba(23, 25, 28, 0.55)`** da — dieselbe Sache,
# andere Schreibweise. Der Scanner meldete für diese Dateien „0 Literale" und
# sah dabei völlig gesund aus. *Ein Wächter, der eine SCHREIBWEISE aufzählt,
# merkt nicht, wenn dieselbe Sache anders geschrieben dazukommt* (FALLEN.md) —
# und die Gegenprobe half nicht, weil sie an `colors.ts` gemessen hat, wo
# ausschliesslich `#rrggbb` steht. **Eine Gegenprobe muss jede Schreibweise
# abdecken, die sie freigibt.**
#
# `'transparent'` steht ABSICHTLICH nicht im Muster: Es ist keine Farbe, sondern
# deren Abwesenheit — eine transparente Fläche nimmt den Untergrund an, und das
# ist genau das, was der Dunkelmodus will. Sie zu melden wäre ein Fehlalarm an
# drei Stellen (`(tabs)/_layout.tsx`, `(tabs)/index.tsx`, `SsChip.tsx`), die
# nichts zu tun haben.
FARBE = re.compile(r"#[0-9A-Fa-f]{3,8}\b|\brgba?\s*\(|'(?:white|black)'")
gefunden = {}
for p in sorted((WURZEL / 'src').rglob('*.ts*')):
    rel = str(p.relative_to(WURZEL / 'src'))
    for nr, zeile in enumerate(p.read_text(errors='ignore').splitlines(), 1):
        nackt = zeile.strip()
        if nackt.startswith(('*', '//', '/*')):
            continue          # Kommentare zählen nicht — dort stehen Messwerte
        if FARBE.search(zeile):
            gefunden.setdefault(rel, []).append(nr)

# Die Gegenprobe: Findet der Scanner in colors.ts selbst nichts, sucht er falsch.
pruef(f'Der Scanner findet `#rrggbb` (colors.ts, {len(gefunden.get("theme/colors.ts", []))} Zeilen)',
      len(gefunden.get('theme/colors.ts', [])) >= 10,
      'der Scanner sucht falsch — eine Suche mit null Treffern beweist nichts')
# Und die zweite Schreibweise, an einer Datei, in der sie GARANTIERT vorkommt.
pruef('Der Scanner findet auch `rgba(…)`',
      bool(FARBE.search('  backgroundColor: \'rgba(23, 25, 28, 0.55)\',')),
      'er sieht nur Doppelkreuz-Literale und meldet für halbe Dateien fälschlich 0')
pruef('… und Farbnamen wie `white`',
      bool(FARBE.search("  color: 'white',")))
pruef('… aber NICHT `transparent` (das ist keine Farbe)',
      not FARBE.search("  backgroundColor: 'transparent',"))

neu = {f: z for f, z in gefunden.items() if f not in AUSNAHMEN}
pruef(f'Keine unbekannte Datei mit Farbliteralen ({len(gefunden)} bekannte)', not neu,
      '; '.join(f'{f}:{z[0]}' for f, z in sorted(neu.items())[:4]))
for f, warum in sorted(AUSNAHMEN.items()):
    if f == 'theme/colors.ts':
        continue
    n = len(gefunden.get(f, []))
    print(f'     · {f:34} {n:2} Literal(e) — {warum}')

print('')
print(f'  {JA} Häkchen, {NEIN} Kreuze')
sys.exit(1 if NEIN else 0)
