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
print('── 4c. Der Hinweis-Ton — und warum er auf iOS keinen Text tragen darf ──')
# Ians Entscheidung 91 vom 2026-09-19: Die Zahl am Anfragen-Tab ist TÜRKIS, nicht
# rot. Sein Befund, ohne den Code zu kennen: *„warum ist die Hand rot?"* — eine
# Anfrage ist das Gegenteil von Gefahr, jemand will mitmachen.
#
# ⚠️ **Der zweite Wert ist hier kein Beiwerk.** Weiss auf Türkis ist 1,60. Wer
# nur den Hintergrund tauscht und die helle Zahl stehen lässt, macht sie
# unlesbar und merkt es nicht — *`tsc` sieht keine Farben*, und das ist der Satz,
# der über diesem ganzen Prüfstand steht.
STATUS = {}
teil = text.split('export const status')
if len(teil) > 1:
    STATUS = dict(re.findall(r"(\w+): '(#[0-9A-Fa-f]{6})'", teil[1].split('} as const')[0]))
# Die Gegenprobe des Lesers, wie in Abschnitt 1: *Eine Textsuche mit null
# Treffern beweist nichts.* Findet er die zwei Werte nicht, prüft er unten Luft.
pruef(f'`status` gelesen ({", ".join(sorted(STATUS)) or "NICHTS"})',
      {'hinweis', 'hinweisAufFlaeche'} <= set(STATUS),
      'der Aufbau von `status` in colors.ts hat sich geändert')

if {'hinweis', 'hinweisAufFlaeche'} <= set(STATUS):
    k = kontrast(STATUS['hinweis'], GRUND['bg'])
    pruef(f'{"hinweis":9} hebt sich vom Grund ab: {k:6.2f} ≥ 4,5', k >= 4.5,
          'der Punkt am Anfragen-Tab verschwindet im Grund')
    k = kontrast(STATUS['hinweisAufFlaeche'], STATUS['hinweis'])
    pruef(f'{"":9} Zahl auf dem Hinweis (Web): {k:6.2f} ≥ 4,5', k >= 4.5,
          'die Zahl am Anfragen-Tab ist auf ihrer eigenen Fläche unlesbar')
    # Und der Abstand zur nächsten Kategorie — ein Hinweis, den man für eine
    # Kategorie hält, ist ein falscher Hinweis. 1,29 ist der Abstand zu Sport
    # und AUSDRÜCKLICH in Ordnung: Das ist ein Abstand in der HELLIGKEIT, nicht
    # im Farbton. Geprüft wird deshalb nicht der Kontrast, sondern dass der Ton
    # nicht mit einer Kategoriefarbe ZUSAMMENFÄLLT.
    gleich = [n for n, pp in PALETTEN.items() if pp['base'].upper() == STATUS['hinweis'].upper()]
    pruef(f'{"":9} `hinweis` ist keine Kategoriefarbe', not gleich,
          f'er ist derselbe Ton wie {gleich} — dann behauptet er eine Kategorie')

    # ── Der Befund, der KEINE Sperre ist ────────────────────────────────────
    # Auf iOS lässt sich die Schriftfarbe des Badges nicht setzen: `types.d.ts`
    # markiert `badgeTextColor` als android/web, `appearance.ios.js` reicht nur
    # `badgeBackgroundColor` durch, und `RNSTabBarAppearanceCoordinator.mm:258`
    # schreibt entsprechend nur den Hintergrund. **UIKit zeichnet die Zahl
    # weiss.** Deshalb steht dort seit Ians Entscheidung 94 ein PUNKT.
    weiss = kontrast('#FFFFFF', STATUS['hinweis'])
    print(f'  ⚠️  Weiss auf `hinweis`: {weiss:5.2f} — **deshalb trägt der iOS-Badge keinen Text.**')
    print(f'      Das ist kein Fehler, sondern Ians Entscheidung 94. Der Wächter darunter hält sie fest.')

# ── Dass die Entscheidung im Code steht, und nicht nur im Kommentar ─────────
# ⚠️ **Eine ENTSCHEIDUNG kann von keiner einzigen Prüfung bewacht sein** — und
# das sieht man nur, indem man die verworfene Möglichkeit hinschreibt (FALLEN.md).
# Die verworfene Möglichkeit ist hier `String(wartend)` im Badge.
NATIV = WURZEL / 'src' / 'app' / '(tabs)' / '_layout.native.tsx'
if not NATIV.exists():
    pruef('`_layout.native.tsx` liegt da', False, 'ohne sie gilt auf iOS die Web-Fassung')
else:
    n_text = NATIV.read_text()
    # Nur der JSX-Teil zählt. Im Kommentar darüber STEHT `String(children)` als
    # Zitat aus dem fremden Code — ein Wächter, der die eigene BEGRÜNDUNG für
    # den Verstoß hält, wird abgeschaltet statt gelesen (FALLEN.md).
    code = '\n'.join(z for z in n_text.splitlines()
                     if not z.strip().startswith(('*', '//', '/*', '·')))
    pruef('iOS-Badge trägt KEINE Zahl (Entscheidung 94)',
          'String(wartend)' not in code,
          'Weiss auf Türkis ist 1,60 — die Zahl wäre am Gerät nicht zu lesen')
    pruef('iOS-Badge ist bei 0 Anfragen `hidden`',
          'hidden={wartend === 0}' in code,
          'ohne das setzt `appendBadgeOptions` selbst ein Leerzeichen — '
          'ein Punkt, der NIE weggeht')
    pruef('iOS-Badge nimmt den Hinweis-Ton',
          'badgeBackgroundColor={status.hinweis}' in code)
    # Die Gegenprobe: Findet der Leser überhaupt das Badge? Sonst meldet er
    # oben dreimal grün, weil die Datei umgebaut wurde.
    pruef('… und der Leser hat das Badge wirklich gefunden',
          'NativeTabs.Trigger.Badge' in code,
          'die Datei ist umgebaut — die drei Prüfungen darüber messen nichts')

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

# ══════════════════════════════════════════════════════════════════════════════
#  DIE FARBEN IN `app.json` — die einzigen, die NICHT aus `colors.ts` kommen
# ══════════════════════════════════════════════════════════════════════════════
#  🔴 **Der Fehler vom 2026-09-23.** Ians Bild zeigte weiße Streifen oben und
#  unten am Rand der App. React zeichnet dort überall `colors.bg`: Der Wurzel-
#  `View` hat sie (`_layout.tsx`, `styles.app`), die Stack-Screens auch
#  (`contentStyle`). **Das Weiß kam von UNTER React** — aus der Wurzel-Ansicht
#  von React Native, und die behält ihren Standard, solange niemand ihr etwas
#  anderes sagt.
#
#  Gesagt wird es in `app.json`. `expo-system-ui` liest dort
#  `ios.backgroundColor || backgroundColor` und schreibt daraus
#  `RCTRootViewBackgroundColor` in die `Info.plist`
#  (`plugin/build/withIosRootViewBackgroundColor.js`). Stand nichts da, kehrte
#  das Plugin mit `if (!backgroundColor) return;` einfach um — kein Schlüssel,
#  keine Meldung, und sichtbar wird es nur, wenn eine Bewegung die Ansicht
#  darunter kurz freilegt.
#
#  ⚠️ **`app.json` kann `colors.ts` nicht importieren.** Diese Farbe MUSS also
#  zweimal dastehen — und genau deshalb steht sie hier unter Bewachung. Es ist
#  die einzige erlaubte Ausnahme von *„eine Farbe hat EINEN Ort"*, und sie ist
#  nur erlaubt, weil sie geprüft wird.
#
#  ⚠️ **Was dieser Abschnitt NICHT kann.** Er sieht nicht, ob der Wert im Bündel
#  ankommt — dazwischen liegt ein `prebuild`. Dass die `Info.plist` ihn trägt,
#  prüft der Abschnitt darunter, und ob am Gerät wirklich kein Weiß mehr
#  aufblitzt, sagt nur ein Bild.
print('')
print('── Die zwei Farben in `app.json` ──')

import json as _json
APPJSON = WURZEL / 'app.json'
pruef('`app.json` ist gefunden', APPJSON.exists(),
      'eine Textsuche mit null Treffern beweist nichts')
konfig = _json.loads(APPJSON.read_text())['expo'] if APPJSON.exists() else {}

# `colors.bg` ist die Wahrheit. Aus der Quelle gelesen, nicht hier wiederholt.
m_bg = re.search(r"bg: '(#[0-9A-Fa-f]{6})'", QUELLE.read_text())
pruef(f'`colors.bg` ist gefunden (gefunden: {m_bg.group(1) if m_bg else "NICHTS"})',
      bool(m_bg),
      'ohne sie hat dieser Abschnitt nichts, womit er vergleichen könnte')
BG = m_bg.group(1).upper() if m_bg else None

wurzel_farbe = konfig.get('ios', {}).get('backgroundColor') or konfig.get('backgroundColor')
pruef(f'`expo.backgroundColor` steht da (gefunden: {wurzel_farbe or "NICHTS"})',
      bool(wurzel_farbe),
      'ohne sie schreibt `expo-system-ui` kein `RCTRootViewBackgroundColor` — '
      'die Wurzel-Ansicht bleibt auf ihrem Standard und blitzt bei jeder Bewegung durch')
pruef('… und ist `colors.bg`',
      bool(wurzel_farbe) and wurzel_farbe.upper() == BG,
      'eine zweite Grundfarbe ist genau der Streifen, den man am Rand sieht')

splash = next((p[1] for p in konfig.get('plugins', [])
               if isinstance(p, list) and p[0] == 'expo-splash-screen'), None)
pruef('Der Splash-Eintrag ist gefunden', isinstance(splash, dict),
      'ohne ihn prüft die Zeile darunter einen Eintrag, den es nicht gibt')
pruef(f'… und seine Farbe ist `colors.bg` (gefunden: {splash.get("backgroundColor") if splash else "NICHTS"})',
      bool(splash) and str(splash.get('backgroundColor', '')).upper() == BG,
      'sonst springt die Farbe beim Start von der Splash-Fläche auf die App')

# ── Und was davon im nativen Projekt ANKOMMT ────────────────────────────────
# `ios/` ist git-ignoriert (CNG) und nach einem frischen Checkout nicht da.
# Fehlt der Ordner, ist das kein Verstoß — aber auch kein Häkchen, das etwas
# behauptet: Dann sagt die Zeile ausdrücklich, dass sie nichts geprüft hat.
PLIST = WURZEL / 'ios' / 'SimplySocial' / 'Info.plist'
if PLIST.exists():
    plist = PLIST.read_text()
    # Die Plist trägt die Farbe als ARGB-GANZZAHL, nicht als `#RRGGBB` — das
    # Plugin rechnet sie um. Also zurückrechnen und vergleichen: Die blosse
    # Anwesenheit des Schlüssels sagt nur, dass IRGENDEINE Farbe dasteht.
    m_plist = re.search(r'<key>RCTRootViewBackgroundColor</key>\s*<integer>(\d+)</integer>', plist)
    pruef(f'Die `Info.plist` trägt `RCTRootViewBackgroundColor` (gefunden: {m_plist.group(1) if m_plist else "NICHTS"})',
          bool(m_plist),
          'die Zeile entsteht erst beim `prebuild` — ohne sie ist die Änderung in '
          'app.json am Gerät noch nicht angekommen')
    argb = int(m_plist.group(1)) if m_plist else 0
    pruef(f'… und zwar `colors.bg`, deckend (gerechnet: #{argb & 0xFFFFFF:06X}, Alpha {argb >> 24})',
          bool(m_plist) and f'#{argb & 0xFFFFFF:06X}' == BG and (argb >> 24) == 255,
          'eine durchsichtige oder andere Farbe hier ist genau der Streifen am Rand')
else:
    print('  · ios/ ist nicht da (CNG, git-ignoriert) — nichts geprüft')

print('')
print(f'  {JA} Häkchen, {NEIN} Kreuze')
sys.exit(1 if NEIN else 0)
