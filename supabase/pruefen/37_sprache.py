#!/usr/bin/env python3
# ══════════════════════════════════════════════════════════════════════════════
#  DIE SPRACHE BEWACHEN — was der Typ NICHT sehen kann
#
#  Aufruf: npm run pruef-sprache   (braucht nichts: kein Server, kein Gerät)
#
#  ── Der Fehler, aus dem dieser Prüfstand entstand — und er ist FREMD ────────
#  Er stammt nicht aus diesem Projekt, sondern aus ACTA (`17_Tennis_Optimma`),
#  und er hat dort einen Apple-Build gekostet:
#
#      In `CoachFeedbackCard.tsx` stand im Ergebniszustand das Literal
#      `DEIN COACH` fest im JSX — **obwohl der englische Schlüssel existierte.**
#      Englische Nutzer sahen mitten in der App ein deutsches Wort, und
#      **Build 1 ging so zu Apple.**
#
#  🔴 **Der Typ merkt das nicht, und das ist der ganze Punkt.** `Weiter<typeof de>`
#  in `en.ts` beweist, dass jeder Schlüssel übersetzt IST. Er beweist nicht, dass
#  der Bildschirm den Schlüssel BENUTZT. Ein Literal umgeht das Wörterbuch
#  einfach, und `tsc` hat dazu nichts zu sagen. *Eine Prüfung, die eine
#  BEDEUTUNGSÄNDERUNG nicht merkt, prüft die Umsetzung* (FALLEN.md) — hier ist es
#  umgekehrt: Der Compiler prüft die Umsetzung, und die Bedeutung („alles, was man
#  liest, kommt aus dem Wörterbuch") braucht einen eigenen Wächter.
#
#  ── Was er prüft ───────────────────────────────────────────────────────────
#   1. Die Wörterbücher stehen und sind gleich groß (der Typ deckt das zwar ab,
#      die ZAHL liest aber ein Mensch — *die Zahl findet Verlust, die Namen
#      finden Verwechslung*).
#   2. Kein deutsches Textliteral in `src/` außerhalb von `src/i18n/`.
#   3. Keine modulweite Liste mit `t()` darin (sie friert die Startsprache ein).
#   4. Kein beschattetes `t` (stürzt zur Laufzeit ab, `tsc` sieht es nicht).
#
#  ⚠️ **Punkt 2 wächst mit.** Solange die Übersetzung läuft, stehen noch deutsche
#  Literale in `src/` — das ist KEIN Verstoß, sondern unfertige Arbeit. Deshalb
#  arbeitet er gegen eine **Obergrenze, die nur fallen darf** (`GRENZE` unten).
#  Steigt die Zahl, hat jemand einen neuen deutschen Satz fest in einen Bildschirm
#  geschrieben; sinkt sie, wird `GRENZE` nachgezogen. *Eine Warnung mit einer ZAHL
#  darin veraltet genauso still wie das, wovor sie warnt* — deshalb steht die
#  Messstelle im Befehl selbst und die Zahl an genau einer Stelle.
import pathlib
import re
import sys

WURZEL = pathlib.Path(__file__).resolve().parents[2]
SRC = WURZEL / 'src'
I18N = SRC / 'i18n'

# ⚠️ **Diese Zahl darf nur FALLEN.** Sie ist der Stand der Übersetzung, nicht ein
# erlaubtes Maß an Schlamperei. Wer sie hochsetzt, macht den Wächter wertlos:
# Genau der Fehler, der ACTAs Build 1 zu Apple geschickt hat, würde dann grün
# gemeldet. Sinkt sie, wird sie hier nachgezogen — das ist der Fortschritt.
GRENZE = 201

JA = NEIN = 0


def pruef(text, ok, dazu=''):
    global JA, NEIN
    if ok:
        print(f'  ✓ {text}')
        JA += 1
    else:
        print(f'  ✗ {text}' + (f'  ({dazu})' if dazu else ''))
        NEIN += 1


if not SRC.is_dir():
    sys.exit(f'✗ {SRC} fehlt.')

# ══════════════════════════════════════════════════════════════════════════════
#  1 · Die Wörterbücher
# ══════════════════════════════════════════════════════════════════════════════
print('── Die Wörterbücher ──')

DE = I18N / 'de.ts'
EN = I18N / 'en.ts'

pruef('`i18n/de.ts` ist da', DE.exists(), 'ohne Quelle prüft hier nichts etwas')
pruef('`i18n/en.ts` ist da', EN.exists())

if not (DE.exists() and EN.exists()):
    print('')
    print(f'  {JA} Häkchen, {NEIN} Kreuze')
    sys.exit(1)

de_text = DE.read_text(encoding='utf-8')
en_text = EN.read_text(encoding='utf-8')


def schluessel(quelle: str) -> list[str]:
    """Die Blätter — `name: 'text'`. Bereiche (`name: {`) zählen nicht mit."""
    return re.findall(r'^\s+(\w+):\s*[\'"`]', quelle, re.M)


de_s = schluessel(de_text)
en_s = schluessel(en_text)

pruef(f'Deutsch hat überhaupt Texte (gefunden: {len(de_s)})', len(de_s) >= 5,
      'findet er keine, meldet er den Rest grün, ohne etwas geprüft zu haben')
pruef(f'Beide Sprachen haben gleich viele Texte ({len(de_s)} / {len(en_s)})',
      len(de_s) == len(en_s),
      'der Typ in en.ts meldet das auch — aber `npx tsc --noEmit` liest niemand nebenbei')

# **Der Typ `Weiter<typeof de>` ist die eigentliche Zusage** — steht er nicht da,
# ist die Vollständigkeit nur noch Disziplin.
pruef('`en.ts` ist als `Weiter<typeof de>` getippt',
      re.search(r'en:\s*Weiter<typeof de>', en_text) is not None,
      'ohne diesen Typ meldet tsc einen fehlenden englischen Text NICHT')
pruef('`de.ts` endet auf `as const`',
      'as const' in de_text,
      'ohne `as const` gibt es die Punkt-Pfade in index.ts nicht')

# ══════════════════════════════════════════════════════════════════════════════
#  2 · Deutsche Literale außerhalb von i18n/ — ACTAs teurer Fehler
# ══════════════════════════════════════════════════════════════════════════════
print('')
print('── Deutsche Texte, die das Wörterbuch umgehen ──')

# Ein deutsches Textliteral erkennt man nicht am Wort, sondern an den Zeichen, die
# es im Englischen nicht gibt — Umlaute und ß. **Das findet nicht alles** („Bin
# dabei" hat keinen Umlaut) und soll es nicht: Ein Wächter, der RÄT, welcher Satz
# deutsch ist, meldet Fehlalarme und wird abgeschaltet statt gelesen. Er findet
# die sichere Teilmenge, und die ist groß genug, um Verschlechterung zu sehen.
DEUTSCH = re.compile(r'[\'"`][^\'"`\n]*[äöüÄÖÜß][^\'"`\n]*[\'"`]')

treffer: list[tuple[str, int, str]] = []
for datei in sorted(SRC.rglob('*.ts*')):
    if datei.suffix not in ('.ts', '.tsx'):
        continue
    if I18N in datei.parents or datei.parent == I18N:
        continue
    # ⚠️ **Der Block-Kommentar wird MITGEZÄHLT, nicht nur die Zeile daran erkannt.**
    # Der erste Anlauf prüfte nur, ob eine Zeile mit `*` oder `//` beginnt — und
    # meldete dann mitten aus den langen Köpfen dieses Projekts Treffer wie
    # „` heißt dort wirklich „kein Badge"", weil eine fortgesetzte Kommentarzeile
    # nicht immer mit `*` anfängt. Die Doku hier IST deutsch und soll es bleiben;
    # sie zu zählen ist der Fehlalarm, der einen Wächter abgeschaltet statt
    # gelesen bekommt.
    im_block = False
    for nr, zeile in enumerate(datei.read_text(encoding='utf-8').splitlines(), 1):
        blank = zeile.strip()
        if im_block:
            if '*/' in zeile:
                im_block = False
            continue
        if '/*' in zeile and '*/' not in zeile:
            im_block = True
            continue
        if blank.startswith(('*', '//', '/*', '#')):
            continue
        fund = DEUTSCH.search(zeile)
        if fund:
            treffer.append((str(datei.relative_to(WURZEL)), nr, fund.group(0)[:50]))

pruef(f'Deutsche Literale außerhalb von i18n/: {len(treffer)} (Grenze {GRENZE})',
      len(treffer) <= GRENZE,
      f'die Zahl darf nur FALLEN — steht sie höher, ist ein neuer deutscher Satz '
      f'fest in einen Bildschirm geschrieben worden')
if len(treffer) < GRENZE:
    print(f'     → die Grenze kann auf {len(treffer)} nachgezogen werden')
for ort, nr, was in treffer[:5]:
    print(f'     {ort}:{nr}  {was}')
if len(treffer) > 5:
    print(f'     … und {len(treffer) - 5} weitere')

# ══════════════════════════════════════════════════════════════════════════════
#  3 · Modulweite Listen mit t() — sie frieren die Startsprache ein
# ══════════════════════════════════════════════════════════════════════════════
print('')
print('── Modulweite Listen mit t() darin ──')

# `const X = [ … t('…') … ]` auf SPALTE NULL: Das wird einmal beim Laden der Datei
# ausgewertet und behält für immer die Sprache, die beim App-Start galt. In ACTA
# genau so passiert (`onboarding/steps.ts`, `log-activity.tsx`).
eingefroren: list[str] = []
for datei in sorted(SRC.rglob('*.ts*')):
    if datei.suffix not in ('.ts', '.tsx'):
        continue
    if I18N in datei.parents or datei.parent == I18N:
        continue
    quelle = datei.read_text(encoding='utf-8')
    # Ein modulweites `const NAME = … ` bis zum nächsten Eintrag auf Spalte null.
    for m in re.finditer(r'^(?:export )?const \w+[^\n]*=\s*[\[{]', quelle, re.M):
        rest = quelle[m.start():]
        ende = re.search(r'^\}|^\]|^(?:export )?(?:const|function|type|interface) ',
                         rest[1:], re.M)
        block = rest[: (ende.start() + 1 if ende else len(rest))]
        if re.search(r'\bt\(\s*[\'"`]', block):
            zeile = quelle[: m.start()].count('\n') + 1
            eingefroren.append(f'{datei.relative_to(WURZEL)}:{zeile}')

pruef('Keine modulweite Liste ruft `t()` auf',
      not eingefroren,
      'so eine Liste behält für immer die Sprache beim App-Start — im Render bauen')
for ort in eingefroren[:5]:
    print(f'     {ort}')

# ══════════════════════════════════════════════════════════════════════════════
#  4 · Beschattetes t — stürzt zur Laufzeit ab
# ══════════════════════════════════════════════════════════════════════════════
print('')
print('── Beschattetes `t` ──')

# `posts.map((t) => …)`, `const t = …`, `catch (t)`. Geprüft wird NUR in Dateien,
# die `t` auch importieren — woanders ist ein `t` als Variable völlig in Ordnung.
schatten: list[str] = []
for datei in sorted(SRC.rglob('*.ts*')):
    if datei.suffix not in ('.ts', '.tsx'):
        continue
    if I18N in datei.parents or datei.parent == I18N:
        continue
    quelle = datei.read_text(encoding='utf-8')
    if not re.search(r'import \{[^}]*\bt\b[^}]*\} from \'@/i18n\'', quelle):
        continue
    for muster in (r'\bconst t\b', r'\blet t\b', r'\(\s*t\s*\)\s*=>', r'catch \(\s*t\s*\)'):
        for m in re.finditer(muster, quelle):
            schatten.append(f'{datei.relative_to(WURZEL)}:{quelle[: m.start()].count(chr(10)) + 1}')

pruef('Kein `t` wird in einer Datei beschattet, die `t()` importiert',
      not schatten,
      'das überdeckt das importierte t() und stürzt zur LAUFZEIT ab — tsc sieht es nicht')
for ort in schatten[:5]:
    print(f'     {ort}')

# ══════════════════════════════════════════════════════════════════════════════
#  5 · Dass der Wechsel überhaupt ankommt
# ══════════════════════════════════════════════════════════════════════════════
print('')
print('── Der Sprachwechsel greift ──')

LAYOUT = SRC / 'app' / '_layout.tsx'
layout = LAYOUT.read_text(encoding='utf-8') if LAYOUT.exists() else ''
pruef('Das Wurzel-Layout ist gefunden', bool(layout),
      'eine Textsuche mit null Treffern beweist nichts')
pruef('… und trägt das `key={sprache}`',
      'key={sprache}' in layout,
      'ohne das baut der Baum beim Umschalten nicht neu auf — `t()` ist NICHT reaktiv, '
      'die Oberfläche bliebe in der alten Sprache stehen')

# Es muss ÜBER dem Torwächter liegen: Solange der zeigt, gibt es den `Stack` nicht
# (Falle im Register), und der Anmelde-Bildschirm ist der erste, den Apple sieht.
#
# ⚠️ **Gefragt wird nach der Stelle im BAUM, nicht nach der Deklaration.** Der
# erste Anlauf verglich `key={sprache}` mit `const zeigt` — und ging rot, obwohl
# der Code richtig war: Eine Deklaration steht immer oben in der Funktion, der
# Baum kommt erst im `return`. *Ein Wächter, der eine ÄHNLICHE Frage stellt, ist
# kein Wächter* (FALLEN.md). Die richtige Frage ist, ob das `key` vor der
# VERZWEIGUNG im JSX steht, denn die ist der Torwächter im Baum.
#
# ⚠️ **Und zwar `{zeigt`, MIT der Klammer.** Der zweite Anlauf suchte `zeigt ===`
# und ging wieder rot: Das steht auch oben in `const angemeldet = zeigt === 'app'`
# (Zeile 77), also vor jedem JSX. Erst die geschweifte Klammer trennt die
# Verzweigung im Baum (Zeile 152) von der Rechnung darüber. **Zweimal dieselbe
# Falle in einem Wächter, und beide Male sah der CODE falsch aus statt der Frage.**
MARKE = '{zeigt'
if 'key={sprache}' in layout and MARKE in layout:
    pruef('… und zwar ÜBER dem Torwächter im Baum',
          layout.index('key={sprache}') < layout.index(MARKE),
          'liegt es darunter, wechselt der Anmelde-Bildschirm die Sprache nie — und das '
          'ist der erste Bildschirm, den ein Apple-Prüfer sieht')

INDEX = I18N / 'index.ts'
index = INDEX.read_text(encoding='utf-8') if INDEX.exists() else ''
pruef('`spracheLaden()` hat einen Riegel gegen den zweiten Lauf',
      'if (!geladen)' in index,
      'ohne ihn liest JEDER Sprachwechsel den Speicher neu (das Layout wird dabei neu '
      'aufgebaut) und setzt die gerade getroffene Wahl zurück')

print('')
print(f'  {JA} Häkchen, {NEIN} Kreuze')
sys.exit(1 if NEIN else 0)
