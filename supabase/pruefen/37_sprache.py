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
GRENZE = 284

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

# Ein deutscher Text verrät sich nicht am Wort, sondern an den Zeichen, die es im
# Englischen nicht gibt — Umlaute und ß. **Das findet nicht alles** („Bin dabei"
# hat keinen Umlaut) und soll es nicht: Ein Wächter, der RÄT, welcher Satz deutsch
# ist, meldet Fehlalarme und wird abgeschaltet statt gelesen. Er findet die sichere
# Teilmenge, und die ist groß genug, um Verschlechterung zu sehen.
#
# 🔴 **Gesucht wird die ganze ZEILE, nicht nur die Anführungszeichen — und das ist
# der Unterschied zwischen einem Wächter und keinem.** Der erste Anlauf suchte
# `'…äöü…'`, also nur Literale in Anführungszeichen. Am 2026-10-17 beim ersten
# echten Einsatz gemessen: **201 Treffer in Anführungszeichen, 90 OHNE** — ein
# Drittel übersehen. Ein JSX-Textknoten steht nämlich ohne:
#
#     <SsText>Im Prototyp gibt es keine Konten …</SsText>
#
# **Und genau so war ACTAs `DEIN COACH` geschrieben**, der Fehler, gegen den dieser
# Prüfstand überhaupt existiert. Er hätte ihn nicht gefunden. *Ein Wächter, der
# eine ÄHNLICHE Frage stellt, ist kein Wächter* — hier zum dritten Mal in derselben
# Datei, und diesmal hätte es den Zweck der Datei verfehlt.
DEUTSCH = re.compile(r'[äöüÄÖÜß]')

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
        if DEUTSCH.search(zeile):
            treffer.append((str(datei.relative_to(WURZEL)), nr, blank[:60]))

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
#  2b · Feste Texte in UI-Eigenschaften — das SPRACHUNABHÄNGIGE Maß
# ══════════════════════════════════════════════════════════════════════════════
print('')
print('── Feste Texte in UI-Eigenschaften ──')

# 🔴 **Warum es diese zweite Messung überhaupt gibt, und sie ist die bessere.**
# Am 2026-10-17 wurde der ganze Anmelde-Bildschirm übersetzt — 18 Texte, alle raus
# aus dem JSX und ins Wörterbuch. **Die Umlaut-Zahl oben hat sich dabei um NULL
# bewegt**, weil kein einziger dieser Sätze einen Umlaut trägt („Einen Moment",
# „Weiter als Ian", „Code schicken"). Eine Messung, die bei echter Arbeit
# stillsteht, zeigt keinen Fortschritt und findet auch keinen Rückschritt.
#
# Diese hier fragt nicht nach der SPRACHE, sondern nach der FORM: Steht in
# `label=`, `placeholder=` oder `accessibilityLabel=` ein fester Text statt eines
# `t(…)`? Das ist unabhängig davon, welche Sprache er hat — und deshalb fällt die
# Zahl mit jedem übersetzten Bildschirm. **Die beiden Messungen ergänzen sich:**
# Die Umlaut-Suche findet deutsche Prosa zwischen JSX-Klammern, diese hier findet
# jeden festen Text an einer Eigenschaft, die man liest.
PROPS = re.compile(
    r'\b(label|placeholder|title|accessibilityLabel|accessibilityHint)=(["\'])([^"\'\n]{2,})\2'
)

# ⚠️ Darf nur FALLEN — dieselbe Abmachung wie bei GRENZE.
GRENZE_PROPS = 123

fest: list[str] = []
for datei in sorted(SRC.rglob('*.tsx')):
    if I18N in datei.parents or datei.parent == I18N:
        continue
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
        if blank.startswith(('*', '//', '/*')):
            continue
        for m in PROPS.finditer(zeile):
            fest.append(f'{datei.relative_to(WURZEL)}:{nr}  {m.group(1)}="{m.group(3)[:40]}"')

pruef(f'Feste Texte in UI-Eigenschaften: {len(fest)} (Grenze {GRENZE_PROPS})',
      len(fest) <= GRENZE_PROPS,
      'die Zahl darf nur FALLEN — steht sie höher, hat ein Bildschirm einen festen '
      'Text an einer Stelle bekommen, die jemand liest')
if len(fest) < GRENZE_PROPS:
    print(f'     → die Grenze kann auf {len(fest)} nachgezogen werden')
for ort in fest[:5]:
    print(f'     {ort}')
if len(fest) > 5:
    print(f'     … und {len(fest) - 5} weitere')

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
#  4b · Die importfreien Regel-Dateien bleiben importfrei
# ══════════════════════════════════════════════════════════════════════════════
print('')
print('── Importfreie Regel-Dateien ──')

# 🔴 **Dieser Wächter hätte einen Fehler gefunden, den ich zweimal gemacht habe.**
# Am 2026-10-17 bekam `features/auth/anmeldung.ts` beim Übersetzen erst ein
# `import { t }`, dann ein `import type { TSchluessel }`. Beide waren falsch:
#
#   · Das erste hätte über `@/i18n` React und `react-native` in eine Datei
#     gezogen, die ACHT Prüfstände in blankem Node laden.
#   · Das zweite starb an `TS2307: Cannot find module '@/i18n'` —
#     `96_anbieter.sh` kopiert die Datei EINZELN in einen Wegwerf-Ordner und
#     übersetzt sie mit eigener `tsconfig.json`, die den `@/`-Kurznamen nicht
#     kennt. Ein `import type` verschwindet erst beim Übersetzen; aufgelöst
#     werden muss er vorher.
#
# **Die Datei sagt ihre Zusage zweimal in ihren eigenen Köpfen** („importfreie
# Regel-Datei") — und ein Kommentar ist kein Riegel. Jetzt ist einer da.
#
# ⚠️ Gezählt werden `import`-Zeilen, auch `import type`. Genau das ist die Frage:
# Nicht „kostet es zur Laufzeit was", sondern „muss jemand es auflösen können".
IMPORTFREI = [
    pathlib.Path('features') / 'auth' / 'anmeldung.ts',
]
for rel in IMPORTFREI:
    datei = SRC / rel
    if not datei.exists():
        pruef(f'`{rel}` ist gefunden', False, 'umbenannt? dann prüft hier nichts etwas')
        continue
    zeilen = [
        z for z in datei.read_text(encoding='utf-8').splitlines()
        if re.match(r'^import\b', z.strip())
    ]
    pruef(f'`{rel}` hat keinen einzigen Import ({len(zeilen)} gefunden)',
          not zeilen,
          'acht Prüfstände laden diese Datei in blankem Node oder übersetzen sie '
          'einzeln ohne @/-Kurznamen — jeder Import erschlägt sie')
    for z in zeilen[:3]:
        print(f'     {z.strip()[:70]}')

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
