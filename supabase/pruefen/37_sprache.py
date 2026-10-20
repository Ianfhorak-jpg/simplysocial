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
GRENZE = 108

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
#  1b · Der Claim steht zweimal — und muss gleich bleiben
# ══════════════════════════════════════════════════════════════════════════════
print('')
print('── Der doppelte Claim ──')

# ⚠️ **Warum er überhaupt zweimal dasteht**, steht ausführlich an `marke` in
# `de.ts`: `app/+html.tsx` wird ausgeliefert, BEVOR das JavaScript läuft (harte
# Regel 21) — dort gibt es kein `t()`, nur eine `<meta description>`. Der Satz
# muss deshalb auch als gewöhnliche Konstante in `config/brand.ts` existieren.
#
# **Eine Doppelung, die niemand bewacht, läuft auseinander.** Wer den Claim in der
# App ändert und `brand.ts` vergisst, hinterlässt eine Suchmaschinen-Beschreibung,
# die etwas anderes verspricht als der erste Bildschirm — und merkt es nie, weil
# die Hülle niemand ansieht, der die App benutzt.
BRAND_DATEI = SRC / 'config' / 'brand.ts'
brand = BRAND_DATEI.read_text(encoding='utf-8') if BRAND_DATEI.exists() else ''
m_brand = re.search(r"claim:\s*'([^']+)'", brand)
m_de = re.search(r"marke:\s*\{[^}]*?claim:\s*'([^']+)'", de_text, re.S)

# 🔴 **Harte Regel 3: „Der Name `SimplySocial` steht an genau einer Stelle"**
# (`config/brand.ts`). Am 2026-10-17 **gebrochen vorgefunden, an vier Stellen** —
# `features/social/bild.ts` dreimal und `config/melden.ts` einmal, alle in Text,
# den ein Mensch liest. Keine davon war neu; es hatte nur nie jemand nachgesehen.
#
# **Gefunden hat es IAN**, nicht dieser Prüfstand: Er hat die englische Oberfläche
# im Browser aufgemacht und gesagt, „Alle, die SimplySocial verwenden" stehe noch
# auf Deutsch. Ein fest eingetippter Name überlebt jede Übersetzung — er steht in
# keinem Wörterbuch, also übersetzt ihn niemand. In der Übersetzung heißt er
# deshalb `{app}`, und den Wert setzt der Bildschirm ein.
NAME_ERLAUBT = {
    pathlib.Path('config') / 'brand.ts',   # die eine erlaubte Stelle
}
namensstellen: list[str] = []
for datei in sorted(SRC.rglob('*.ts*')):
    if datei.suffix not in ('.ts', '.tsx'):
        continue
    rel = datei.relative_to(SRC)
    if rel in NAME_ERLAUBT or I18N in datei.parents or datei.parent == I18N:
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
        # Nur in einer Zeichenkette — ein Bündel-Name oder eine URL ist kein Text.
        if re.search(r"['\"`][^'\"`\n]*SimplySocial[^'\"`\n]*['\"`]", zeile):
            namensstellen.append(f'{datei.relative_to(WURZEL)}:{nr}  {blank[:55]}')

pruef(f'Der Name steht nur in `config/brand.ts` ({len(namensstellen)} andere Stellen)',
      not namensstellen,
      'harte Regel 3 — und ein fest eingetippter Name wird NIE übersetzt, weil er '
      'in keinem Wörterbuch steht')
for ort in namensstellen[:5]:
    print(f'     {ort}')

pruef('`brand.ts` nennt einen Claim', m_brand is not None,
      'eine Textsuche mit null Treffern beweist nichts')
pruef('`de.ts` nennt denselben Claim unter `marke`', m_de is not None)
if m_brand and m_de:
    pruef('… und beide sind Zeichen für Zeichen gleich',
          m_brand.group(1) == m_de.group(1),
          f'brand.ts: {m_brand.group(1)[:40]!r} · de.ts: {m_de.group(1)[:40]!r}')

# Dasselbe für den STADTNAMEN, und aus demselben Grund. `BRAND.city` ist die
# Tatsache (die App ist für Wien), `marke.stadt` die Anzeige davon — auf Englisch
# „Vienna" (Ians Wörterliste). **Laufen die deutschen Fassungen auseinander, steht
# in einem Satz eine andere Stadt als im anderen.**
m_city = re.search(r"city:\s*'([^']+)'", brand)
m_stadt = re.search(r"marke:\s*\{.*?stadt:\s*'([^']+)'", de_text, re.S)
pruef('`brand.ts` nennt eine Stadt', m_city is not None)
pruef('`de.ts` nennt sie unter `marke.stadt`', m_stadt is not None)
if m_city and m_stadt:
    pruef('… und beide sind gleich',
          m_city.group(1) == m_stadt.group(1),
          f'brand.ts: {m_city.group(1)!r} · de.ts: {m_stadt.group(1)!r}')

# ══════════════════════════════════════════════════════════════════════════════
#  1c · Schlüssel, die KEIN Bildschirm liest — sie landen trotzdem im Bündel
# ══════════════════════════════════════════════════════════════════════════════
print('')
print('── Schlüssel ohne Fundstelle ──')

# 🔴 **Die Lehre kommt aus ACTAs Apple-Prüfung, und sie steht im Kopf von `de.ts`:**
# Dort wurden Paywall-Wörter IM BÜNDEL nachgewiesen, obwohl kein Bildschirm sie
# las. **Ein Wörterbuch wird ganz ausgeliefert** — ein Schlüssel, den niemand
# aufruft, ist kein harmloser Rest, sondern Text, den Apple findet und wir nicht
# erklären können.
#
# Am 2026-10-20 waren es ZEHN: `feed.leerMitFilter`, `erstesKonto.nameZuLang`,
# `erstesKonto.bezirkWaehlen`, `post.posterBestaetigt`, `post.bezirkFrage`,
# `anfrage.zuSpaet`, `konto.treffenGezaehlt`, `konto.loeschenWarnung`,
# `gemein.weiter`, `gemein.nochmal` — Reste der ersten Übersetzungsrunde. Keiner
# stand irgendwo im Code, und keiner war als fester Satz in einen Bildschirm
# abgeschrieben (beides geprüft, bevor sie weg sind).
#
# ⚠️ **Diese Prüfung ist nur deshalb erlaubt, weil es KEINE zusammengesetzten
# Schlüssel gibt.** Gemessen am 2026-10-20: kein einziges `t(`-Backtick und kein
# `as TSchluessel` in `src/`. Käme je ein `t(`${bereich}.${x}`)` dazu, meldete
# dieser Abschnitt reihenweise Fehlalarme — dann ist ER zu ändern, nicht die
# Schlüssel zu löschen.
schluessel_pfade: list[str] = []
bereich: str | None = None
for zeile in de_text.splitlines():
    kopf = re.match(r'^  (\w+): \{', zeile)
    if kopf:
        bereich = kopf.group(1)
        continue
    blatt = re.match(r'^    (\w+):', zeile)
    if blatt and bereich:
        schluessel_pfade.append(f'{bereich}.{blatt.group(1)}')

code = '\n'.join(
    d.read_text(encoding='utf-8')
    for d in SRC.rglob('*.ts*')
    if d.suffix in ('.ts', '.tsx') and I18N not in d.parents and d.parent != I18N
)
ohne = [k for k in schluessel_pfade if f"'{k}'" not in code and f'"{k}"' not in code]

# Gegenprobe gegen sich selbst: Hat er die Pfade überhaupt gefunden?
pruef(f'Er liest die Schlüssel-Pfade (gefunden: {len(schluessel_pfade)})',
      len(schluessel_pfade) >= 100,
      'findet er keine, meldet er den Rest grün, ohne etwas geprüft zu haben')
pruef(f'Jeder Schlüssel wird irgendwo gelesen ({len(ohne)} ohne Fundstelle)',
      not ohne,
      'das ganze Wörterbuch landet im Bündel — ein Schlüssel, den kein Bildschirm '
      'liest, ist Text, den Apple findet und niemand erklären kann')
for k in ohne[:8]:
    print(f'     {k}')
if len(ohne) > 8:
    print(f'     … und {len(ohne) - 8} weitere')

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
GRENZE_PROPS = 20

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
#  2d · Deutsche SÄTZE ohne Umlaut — die Lücke, die zwei Messungen offen ließen
# ══════════════════════════════════════════════════════════════════════════════
print('')
print('── Deutsche Sätze ohne Umlaut ──')

# 🔴 **Warum es eine DRITTE Messung braucht, und wie sie gefunden wurde.**
# Am 2026-10-18 standen beide Zahlen oben auf ihrer Grenze und `pruef-sprache`
# meldete 24 Häkchen — während in der englischen Oberfläche weiter rund 45
# deutsche Sätze standen. Keine der beiden Messungen konnte sie sehen:
#
#   · Die **Umlaut-Suche** (2) findet „Du bist dabei" nicht — kein Umlaut.
#   · Die **Eigenschafts-Suche** (2b) findet es nicht — es steht nicht an
#     `label=`, sondern als JSX-Textknoten oder in einer Tabelle.
#
# Gefunden wurden sie, indem nach deutschen FUNKTIONSWÖRTERN gesucht wurde
# („du", „nicht", „noch", „dabei"). Die stehen in fast jedem deutschen Satz und
# in keinem englischen. Zwei davon in einer Zeile sind kein Zufall mehr.
#
# ⚠️ **Zwei Wörter, nicht eines** — und das ist gemessen: Bei einem Wort meldet
# `die`, `was` oder `man` jede zweite Zeile Code (`const die = …` gibt es nicht,
# aber `data.filter(...)` enthält `der` als Teilwort). Deshalb wird vor der Suche
# jeder Bezeichner weggeworfen, der wie Code aussieht, und erst der Rest gezählt.
#
# ⚠️ **Was er NICHT findet**, und das gehört dazu: einen kurzen deutschen Satz
# ohne Funktionswörter („Wartet", „Angefragt"). Dafür gibt es 2b. *Ein Wächter,
# der eine ÄHNLICHE Frage stellt, ist kein Wächter* — diese drei stellen drei
# verschiedene, und keine ersetzt eine andere.
DEUTSCHE_WOERTER = re.compile(
    r'(?<![\w/@.])(Du|du|Dein|dein|Deine|deine|Dich|dich|nicht|noch|schon|und|oder'
    r'|wenn|wer|Wer|was|Was|hier|Hier|wird|sind|hast|bist|keine|kein|etwas|selbst'
    r'|jetzt|dabei|der|die|das|ein|eine|einen|mit|von|zum|zur|auf|aus|für|bei'
    r'|gerade|alle|alles|man|sich|dann|auch)(?![\w])'
)
LITERAL = re.compile(r"""(['"`])((?:[^'"`\\\n]|\\.){5,}?)\1""")
# Ein JSX-Textknoten: eine Zeile, die mit einem Großbuchstaben anfängt und weder
# Klammern noch Zuweisungen trägt — also kein Code sein kann.
JSX_TEXT = re.compile(r'^[A-ZÄÖÜ][^<>{}=]{10,}$')

# ⚠️ **Diese drei Dateien sind bewusst NICHT übersetzt** (Entscheidung vom
# 2026-10-18): `bausteine.tsx` und `post-fassungen.tsx` sind Werkzeuge für die
# Entwicklung, `mock.ts` sind die Fake-Daten des Prototyps. Kein Nutzer der
# echten App liest einen dieser Texte — und **das ganze Wörterbuch landet im
# Bündel**, also wäre ihre Übersetzung reines Gewicht.
NICHT_UEBERSETZT = {
    pathlib.Path('app') / 'bausteine.tsx',
    pathlib.Path('data') / 'mock.ts',
    pathlib.Path('app') / 'post-fassungen.tsx',
    # 🔴 **`brand.ts` ist die begründete Ausnahme.** Claim und Pitch stehen dort
    # auf Deutsch, weil `app/+html.tsx` sie VOR dem JavaScript ausliefert (harte
    # Regel 21) — dort gibt es kein `t()`. Unbewacht ist das trotzdem nicht: Der
    # Abschnitt 1b oben hält `brand.ts` Zeichen für Zeichen gleich mit
    # `de.marke.claim`, und DIE Fassung ist übersetzt.
    pathlib.Path('config') / 'brand.ts',
}

# Was in die KONSOLE geht, bleibt deutsch — und muss es bleiben: Ein geworfener
# Fehler ist eine Nachricht an den Entwickler, nicht an den Nutzer. Harte Regel 76
# verbietet umgekehrt, dass so ein Text je auf den Bildschirm kommt.
#
# ⚠️ **Drei Zeilen Nachlauf**, weil ein `throw new Fehler(` seine Sätze oft erst
# in der zweiten oder dritten Zeile trägt. Mehr wäre zu großzügig: Dann verschwände
# ein echter Satz, der zufällig unter einem `console.warn` steht.
NUR_KONSOLE = re.compile(r'\bthrow\b|\bconsole\.|\bsuper\(|new Error\(')

# ⚠️ Darf nur FALLEN — dieselbe Abmachung wie bei GRENZE.
# **Der eine erlaubte Treffer ist `PROGRAMM_TABELLE`** in `lib/programmfehler.ts`:
# „(keine — die App selbst)" steht als Tabellenname in einem `LadeFehler` und geht
# in die Konsole. Harte Regel 76 verbietet ausdrücklich, dass ein Tabellenname je
# auf den Bildschirm kommt — er ist damit kein Oberflächentext. Er steht nicht in
# einem `throw`, deshalb fängt ihn der Konsolen-Filter unten nicht.
GRENZE_SAETZE = 1

saetze: list[str] = []
for datei in sorted(SRC.rglob('*.ts*')):
    if datei.suffix not in ('.ts', '.tsx'):
        continue
    rel = datei.relative_to(SRC)
    if I18N in datei.parents or datei.parent == I18N or rel in NICHT_UEBERSETZT:
        continue
    im_block = False
    letzte: list[str] = []
    for nr, roh in enumerate(datei.read_text(encoding='utf-8').splitlines(), 1):
        blank = roh.strip()
        if im_block:
            if '*/' in roh:
                im_block = False
            continue
        if '/*' in roh and '*/' not in roh:
            im_block = True
            continue
        if blank.startswith(('*', '//', '/*')):
            continue
        letzte = (letzte + [blank])[-4:]
        if any(NUR_KONSOLE.search(z) for z in letzte):
            continue
        getroffen = False
        for m in LITERAL.finditer(roh):
            inhalt = m.group(2)
            if ' ' not in inhalt or inhalt.startswith(('@/', 'http', './')):
                continue
            if len(DEUTSCHE_WOERTER.findall(inhalt)) >= 2:
                getroffen = True
                break
        if not getroffen and JSX_TEXT.match(blank):
            getroffen = len(DEUTSCHE_WOERTER.findall(blank)) >= 2
        if getroffen:
            saetze.append(f'{datei.relative_to(WURZEL)}:{nr}  {blank[:60]}')

pruef(f'Deutsche Sätze ohne Umlaut: {len(saetze)} (Grenze {GRENZE_SAETZE})',
      len(saetze) <= GRENZE_SAETZE,
      'die Zahl darf nur FALLEN — ein deutscher Satz in der englischen Oberfläche '
      'ist genau der Fehler, der ACTAs Build 1 zu Apple geschickt hat')
if len(saetze) < GRENZE_SAETZE:
    print(f'     → die Grenze kann auf {len(saetze)} nachgezogen werden')
for ort in saetze[:6]:
    print(f'     {ort}')
if len(saetze) > 6:
    print(f'     … und {len(saetze) - 6} weitere')

# Gegenprobe gegen sich selbst: Findet der Ausdruck überhaupt deutsche Sätze?
# Bei NULL Treffern in einer Datei, die GARANTIERT deutsch ist, misst er nichts.
# `data/mock.ts` ist dafür der richtige Zeuge: bewusst deutsch, und bleibt es.
zeuge = SRC / 'data' / 'mock.ts'
zeugen_treffer = 0
if zeuge.exists():
    for roh in zeuge.read_text(encoding='utf-8').splitlines():
        for m in LITERAL.finditer(roh):
            if len(DEUTSCHE_WOERTER.findall(m.group(2))) >= 2:
                zeugen_treffer += 1
                break
pruef(f'Die Suche findet deutsche Sätze überhaupt (in mock.ts: {zeugen_treffer})',
      zeugen_treffer >= 10,
      'eine Textsuche mit null Treffern beweist nichts — ohne diese Gegenprobe wäre '
      'eine kaputte Regex nicht von einer sauberen Oberfläche zu unterscheiden')


# ══════════════════════════════════════════════════════════════════════════════
#  2c · Ein Schlüssel, der ungewickelt im JSX landet
# ══════════════════════════════════════════════════════════════════════════════
print('')
print('── Schlüssel, die ohne `t()` angezeigt würden ──')

# 🔴 **Die Fehlerart, die KEIN Compiler fängt — und sie ist zweimal passiert.**
# Die Regel-Dateien geben Wörterbuch-SCHLÜSSEL zurück statt Sätze (sie müssen
# importfrei bleiben). Ein Schlüssel ist aber auch nur ein String:
# `<SsText>{huerde}</SsText>` typecheckt sauber und zeigt dem Menschen
# `gruppenregel.privat`.
#
#   · 2026-10-17, `standortFolgen()` → drei Stellen in `einstellungen.tsx`
#   · 2026-10-18, `privatHinweis()` und `beitrittHuerdeText()` in `gruppe/[id].tsx`
#
# 🔴 **Der erste Anlauf dieses Wächters war selbst falsch** und ist an der
# Gegenprobe aufgefallen: Er prüfte die AUFRUFSTELLE (`beitrittHuerdeText(...)`).
# Die ist aber fast immer `const huerde = …` — harmlos. Der Fehler sitzt dort, wo
# die VARIABLE angezeigt wird, eine ganz andere Zeile. *Ein Wächter, der eine
# ÄHNLICHE Frage stellt, ist kein Wächter* — hier zum dritten Mal in dieser Datei,
# und die ersten zwei Male hat es nur niemand gemerkt, weil der Code zufällig
# richtig war.
#
# Gefragt wird jetzt: Welche Namen tragen einen Schlüssel — aus `const x = fn()`
# oder aus `.map((x) => …)` — und wird jeder davon in `{…}` gewickelt angezeigt?
# 🔴 **Am 2026-10-18 um NEUN Quellen erweitert — und zwei davon waren bereits
# falsch gezeichnet.** `ladeFehlerFolgen()` gab schon `'laden.keineVerbindung'`
# zurück, `LadeSchirm` zeichnete es ungewickelt: Auf dem Fehlerbildschirm stand
# der SCHLÜSSEL. *Eine Prüfung, die eine Quelle nicht kennt, prüft sie nicht* —
# wer eine Funktion auf Schlüssel umstellt, trägt sie hier ein.
SCHLUESSEL_QUELLEN = [
    'beitrittHuerdeText', 'privatHinweis', 'blockFolgen', 'austrittFolgen',
    'bildFolgen', 'bildHuerde', 'bildFehlerText', 'standortFolgen',
    'mitgliederText', 'zusageText',
    'ladeFehlerFolgen', 'schreibFehlerFolgen', 'kontoFolgen', 'zuschnittFolgen',
    'anbieterFehlerText', 'codeFehlerText', 'passwortFehlerText',
    'loeschFehlerText', 'grussVorschlag',
]
QUELLEN_RE = '|'.join(SCHLUESSEL_QUELLEN)

ungewickelt: list[str] = []
traeger_gesamt = 0
for datei in sorted(SRC.rglob('*.tsx')):
    if I18N in datei.parents:
        continue

    # ⚠️ **Zeilenweise mit Zustand, nicht per Regex über die ganze Datei.**
    # Der erste Anlauf hat die Kommentare aus dem Gesamttext geschnitten und die
    # Nummern darauf gezählt — Ergebnis: `gruppe/[id].tsx:413` statt `415`. Beim
    # Nachsehen stand dort `return (`, und der richtige Befund sah nach einem
    # Fehlalarm aus. *Eine dokumentierte ZAHL ohne ihre Messstelle ist nicht
    # reproduzierbar* — hier: eine Zeilennummer muss aus DERSELBEN Zählung kommen
    # wie der Text. Dieselbe Bauart wie die Prüfungen weiter oben in dieser Datei.
    zeilen: list[tuple[int, str]] = []
    im_block = False
    for nr, roh in enumerate(datei.read_text(encoding='utf-8').splitlines(), 1):
        blank = roh.strip()
        if im_block:
            if '*/' in roh:
                im_block = False
            continue
        if '/*' in roh and '*/' not in roh:
            im_block = True
            continue
        if blank.startswith(('*', '//', '/*')):
            continue
        zeilen.append((nr, roh))

    ganz = '\n'.join(z for _, z in zeilen)
    traeger: set[str] = set()
    # `const huerde = beitrittHuerdeText(...)`
    for m in re.finditer(rf'\b(?:const|let)\s+(\w+)\s*=\s*(?:{QUELLEN_RE})\(', ganz):
        traeger.add(m.group(1))
    # 🔴 `const { titel, text, knopf } = ladeFehlerFolgen(fehler)` — **genau so
    # war der Fehler vom 2026-10-18 geschrieben**, und der Ausdruck darüber sieht
    # ihn nicht: Nach `const` steht dort keine Variable, sondern eine Klammer.
    # Jeder Name aus der Klammer trägt einen Schlüssel.
    for m in re.finditer(rf'\b(?:const|let)\s+\{{([^}}]+)\}}\s*=\s*(?:{QUELLEN_RE})\(', ganz):
        for stueck in m.group(1).split(','):
            # `{ titel, text: satz }` — der NAME in dieser Datei steht rechts.
            name = stueck.split(':')[-1].strip()
            if re.fullmatch(r'\w+', name):
                traeger.add(name)
    # `blockFolgen().map((satz) => …)` — der Schleifenname trägt ihn
    for m in re.finditer(rf'(?:{QUELLEN_RE})\([^)]*\)\s*\.map\(\s*\(?(\w+)', ganz):
        traeger.add(m.group(1))
    traeger_gesamt += len(traeger)

    for name in sorted(traeger):
        # Jede Anzeige `{name}` oder `{name.feld}` in JSX — ohne `t(` davor.
        #
        # ⚠️ **`key={…}` ist KEINE Anzeige** und wird übersprungen: Ein React-`key`
        # darf und soll der Schlüssel sein (eindeutig und stabil), er landet nie
        # auf dem Schirm. Der erste Anlauf hat vier solche Stellen gemeldet — alle
        # vier richtig gebaut.
        for nr, roh in zeilen:
            # ⚠️ **Die Deklaration ist keine Anzeige.** `const { knopf } = fn()`
            # trägt dasselbe Muster wie `{knopf}` im JSX — seit die
            # Destrukturierung oben mitgelesen wird, meldete sich jede
            # Deklarationszeile selbst. *Ein Wächter, der eine ÄHNLICHE Frage
            # stellt, ist kein Wächter*, und hier war es die eigene Quelle.
            if re.match(r'^\s*(?:const|let|var)\b', roh):
                continue
            for m in re.finditer(rf'(\w+=)?\{{\s*{name}(\.\w+)?\s*\}}', roh):
                if m.group(1) in ('key=', 'accessibilityLabel='):
                    continue
                ungewickelt.append(
                    f'{datei.relative_to(WURZEL)}:{nr}  {{{name}{m.group(2) or ""}}}')

# Gegenprobe gegen sich selbst: Findet er überhaupt Träger? Bei 0 wäre die
# Null oben wertlos (Falle: *eine Textsuche mit NULL Treffern beweist nichts*).
pruef(f'Er findet überhaupt Schlüssel-Träger (gefunden: {traeger_gesamt})',
      traeger_gesamt >= 5,
      'findet er keine, meldet er den Rest grün, ohne etwas geprüft zu haben')
pruef(f'Jeder Schlüssel-Träger wird gewickelt angezeigt ({len(ungewickelt)} offen)',
      not ungewickelt,
      'ein Schlüssel ohne `t()` typecheckt sauber und zeigt dem Menschen '
      '`gruppenregel.privat` — kein Compiler fängt das')
for ort in ungewickelt[:6]:
    print(f'     {ort}')

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

    # ⚠️ **Kommentare raus, zeilenweise mit Zustand.** Der erste Anlauf suchte im
    # GANZEN Dateitext — und meldete am 2026-10-18 die Zeile, in der ich erklärt
    # habe, WARUM der Timer nicht `t` heißen darf. *Ein Wächter, der die eigene
    # Begründung für den Verstoß hält, wird abgeschaltet statt gelesen* (FALLEN.md),
    # und er stand hier einen Lauf lang genau so da.
    im_block = False
    for nr, roh in enumerate(quelle.splitlines(), 1):
        blank = roh.strip()
        if im_block:
            if '*/' in roh:
                im_block = False
            continue
        if '/*' in roh and '*/' not in roh:
            im_block = True
            continue
        if blank.startswith(('*', '//', '/*')):
            continue
        for muster in (r'\bconst t\b', r'\blet t\b', r'\(\s*t\s*\)\s*=>', r'catch \(\s*t\s*\)'):
            if re.search(muster, roh):
                schatten.append(f'{datei.relative_to(WURZEL)}:{nr}')

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
