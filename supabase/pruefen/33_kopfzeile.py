#!/usr/bin/env python3
# ══════════════════════════════════════════════════════════════════════════════
#  DIE KOPFZEILE BEWACHEN — Ians Entscheidungen 90 und 93 (2026-09-19)
#
#  Aufruf: npm run pruef-kopf   (braucht nichts: kein Server, kein Gerät)
#
#  ── Wozu ────────────────────────────────────────────────────────────────────
#  Beide Entscheidungen gehen GEGEN eine ältere, gut begründete Fassung, und in
#  beiden Fällen steht die alte Begründung weiter im Code — als Absatz, der
#  erklärt, warum es früher andersherum war. **Das ist genau die Lage, in der
#  eine Entscheidung still zurückgedreht wird:** Wer den Absatz liest und den
#  Ort nicht kennt, hält die alte Fassung für die richtige.
#
#    · 90: die Kategorie-Chips standen IMMER sichtbar über dem Stapel, mit dem
#          Satz *„eingeklappt wäre der Feed eine Liste ohne Gesicht"*.
#    · 93: bei leerem Feed stand GAR KEINE Karte da, mit dem Satz *„eine Karte
#          ohne Posts ist nicht leer, sie ist 23 graue Flächen"*.
#
#  ⚠️ **Was dieser Prüfstand NICHT kann.** Er liest Text, er zeichnet nichts.
#  Ob die Kapsel gut aussieht, ob sie freisteht, ob das Suchfeld darin breit
#  genug ist — das sagt ein Bild und am Ende Ian. *Geometrie prüfen ist nicht
#  hinschauen* (FALLEN.md). Er hält fest, DASS die Entscheidung im Code steht,
#  nicht dass sie gelungen ist.
#
#  ── Warum jede Prüfung ihre Gegenprobe mitbringt ────────────────────────────
#  Eine Textsuche mit null Treffern beweist nichts — sie sieht genauso aus wie
#  eine Datei, die umgebaut wurde. Deshalb prüft jeder Abschnitt zuerst, dass
#  er seinen Gegenstand überhaupt GEFUNDEN hat.
# ══════════════════════════════════════════════════════════════════════════════
import pathlib, re, sys

WURZEL = pathlib.Path(__file__).resolve().parents[2]
FEED = WURZEL / 'src' / 'app' / '(tabs)' / 'index.tsx'

JA = NEIN = 0
def pruef(text, ok, dazu=''):
    global JA, NEIN
    if ok:
        print(f'  ✓ {text}'); JA += 1
    else:
        print(f'  ✗ {text}' + (f'  ({dazu})' if dazu else '')); NEIN += 1

if not FEED.exists():
    sys.exit(f'✗ {FEED} fehlt.')
roh = FEED.read_text()

# ── Kommentare weg ──────────────────────────────────────────────────────────
# In den Kommentaren steht die VERWORFENE Fassung ausdrücklich zitiert — das
# muss so sein, sonst ist die Entscheidung nicht nachvollziehbar. Ein Wächter,
# der die eigene Begründung für den Verstoß hält, wird abgeschaltet statt
# gelesen (FALLEN.md). Deshalb misst er nur den Code.
ohne_block = re.sub(r'/\*.*?\*/', '', roh, flags=re.S)
ohne_jsx = re.sub(r'\{/\*.*?\*/\}', '', ohne_block, flags=re.S)
code = '\n'.join(z for z in ohne_jsx.splitlines() if not z.strip().startswith('//'))

def block(quelle, kopf):
    # Der Docstring zitiert einen Regex — ohne `r` liest Python `\}` als
    # ungültige Fluchtsequenz und warnt bei jedem Lauf.
    r"""Der RUMPF einer Funktion — von `kopf` bis zu ihrer schliessenden Klammer.

    Zwei Anläufe, zwei verschiedene Fehler, und beide hat der Wächter „der
    Leser hat gefunden, was da ist" gefangen, bevor sie eine Aussage wurden:

      1. `re.search(kopf + '.*?\n\}', …, re.S)` — non-greedy hört bei der
         ERSTEN Zeile auf, die mit `}` beginnt, und das ist in einer
         React-Komponente das Ende des ersten verschachtelten Objekts.
      2. Geschweifte Klammern ab dem Kopf zählen — dann ist die erste `{` die
         **Destrukturierung der Parameter** (`function X({ filter, setzen }: …)`),
         und zurück kommt die Parameterliste statt des Rumpfs.

    ⚠️ Deshalb erst die RUNDEN Klammern bis auf Tiefe 0, und danach die
    geschweiften. *Eine Gegenprobe, die aus dem falschen Grund rot ist, belegt
    gar nichts* — hier hat sie zweimal das Richtige belegt: dass der Leser
    kaputt war, nicht der Code.

    Zeichenketten mit Klammern darin würden ihn stören; in dieser Datei gibt es
    keine, und ein echter Parser wäre für eine Ortsprüfung die falsche Größe.
    """
    i = quelle.find(kopf)
    if i < 0:
        return ''
    # Schritt 1: über die Parameterliste hinweg.
    j, rund, offen = i + len(kopf) - 1, 0, False
    while j < len(quelle):
        if quelle[j] == '(':
            rund += 1; offen = True
        elif quelle[j] == ')':
            rund -= 1
            if offen and rund == 0:
                break
        j += 1
    # Schritt 2: der Rumpf.
    tiefe, offen = 0, False
    while j < len(quelle):
        if quelle[j] == '{':
            tiefe += 1; offen = True
        elif quelle[j] == '}':
            tiefe -= 1
            if offen and tiefe == 0:
                return quelle[i:j + 1]
        j += 1
    return ''


def vor(text, a, b):
    """Steht `a` im Text vor `b`? — `False`, wenn eines FEHLT.

    ⚠️ `str.index` wirft dann, und ein Prüfstand, der abstürzt, hat kein
    Ergebnis: Die Zeile darunter läuft nie, und was er schon gemessen hatte,
    geht in der Ausnahme unter. Rot ist eine Auskunft, ein Traceback nicht.
    """
    i, j = text.find(a), text.find(b)
    return i >= 0 and j >= 0 and i < j


print('── 0. Der Leser hat gefunden, was da ist ───────────────────────────────')
pruef(f'`index.tsx` gelesen ({len(roh.splitlines())} Zeilen)', len(roh.splitlines()) > 800)
# Die Gegenprobe zum Kommentar-Filter: Er MUSS etwas weggenommen haben, sonst
# prüft er unten den Fliesstext mit.
pruef(f'Kommentare entfernt ({len(roh.splitlines()) - len(code.splitlines())} Zeilen)',
      len(code.splitlines()) < len(roh.splitlines()) * 0.75,
      'der Filter greift nicht — dann zählen zitierte Verstösse als Verstoss')
pruef('… und der Code ist noch da', 'export default function FeedScreen' in code)

print('')
print('── 1. Entscheidung 90: EINE Kapsel oben, Kategorien im Regler ──────────')
pruef('Die Kopfkapsel gibt es', 'const kopfKapsel = (' in code,
      'Ians Entscheidung 90 ist aus dem Code verschwunden')
# Sie muss DERSELBE Baustein sein wie unten, nicht ein zweiter, der auch so
# aussieht — Punkt 4 der vier Fragen im Plan.
# Die Kapsel ist kein `function`-Block, sondern ein `const … = (…)`. Sie endet
# an ihrer eigenen schliessenden Klammer.
i = code.find('const kopfKapsel = (')
kapsel = code[i:code.find('\n  );', i) + 5] if i >= 0 else ''
pruef('… und sie ist `SsGlas schwebt`, nicht eine nachgebaute Fläche',
      '<SsGlas schwebt' in kapsel,
      'harte Regel 61/62: Fläche, Kante und Schatten gehören dem Glas')
# ⚠️ **Eins, nicht zwei** — bis zu Ians Entscheidung 95 stand hier `== 2`
# (Suchfeld UND Regler). Das Suchfeld ist weg; wer die Zahl nicht nachzieht,
# hat einen Wächter, der eine alte Fassung verlangt.
pruef('… der Regler gibt seine Fläche ab (`umgebung="kapsel"`)',
      kapsel.count('umgebung="kapsel"') == 1,
      f'gefunden: {kapsel.count(chr(117) + chr(109) + "gebung=")} — zwei Untergründe übereinander wären einer zu viel')
# Entscheidung 95: *„gib die Suchleiste weg"*. Die verworfene Möglichkeit ist,
# sie wieder hineinzustellen — also wird genau darauf geprüft.
pruef('… und es steht KEIN Suchfeld in der Kapsel (Entscheidung 95)',
      '<SsInput' not in kapsel,
      'Ians Satz vom 19.09.: „Ne das oben find ich nicht gut, gib die Suchleiste weg"')
# Die Gegenprobe dazu: Die MECHANIK muss weiterhin da sein (harte Regel 51,
# ausbauen statt löschen). Ein Wächter, der nur das Verschwinden prüft, wäre mit
# einem `rm` auf `filter.ts` zufrieden.
FILTER = WURZEL / 'src' / 'features' / 'posts' / 'filter.ts'
pruef('… aber `passtZumText()` steht weiter da (ausgebaut, nicht gelöscht)',
      FILTER.exists() and 'export function passtZumText' in FILTER.read_text(),
      'harte Regel 51 — ein `<SsInput value={filter.suche} …>` muss sie zurückholen können')
pruef('… der Posten-Knopf steht DRAUSSEN und rund',
      vor(kapsel, '</SsGlas>', '<PostenKnopf />'),
      'er ist die wichtigste Handlung — in den Regler gehört er nicht')

# Die Kategorien: im Regler, nicht mehr daneben.
regler = block(code, 'function FilterBereich(')
pruef('Der Leser hat den Filterbereich gefunden', 'FilterGruppe' in regler)
pruef('Die Kategorien stehen IM Regler', 'CATEGORY_ORDER.map' in regler,
      'Entscheidung 90: aus drei Reihen wird eine')
# Und die Gegenprobe, die den Rückfall findet: Sie dürfen NICHT ausserdem
# noch einmal im Screen selbst stehen.
ohne_regler = code.replace(regler, '') if regler else code
pruef('… und NICHT mehr daneben im Screen',
      'CATEGORY_ORDER.map' not in ohne_regler,
      'dann stünden sie zweimal da und aus drei Reihen wären wieder zwei')

print('')
print('── 2. Entscheidung 93: die Karte bleibt sichtbar ───────────────────────')
vollbild = block(code, 'function KarteVollbild(')
pruef('Der Leser hat die Kartenansicht gefunden', '<SsKarte' in vollbild,
      'ohne sie messen die drei Prüfungen darunter nichts')
pruef('`nichtsDa` schaltet die Karte NICHT mehr ab',
      not re.search(r'\{nichtsDa \? \(\s*<View style=\{\[styles\.vollbildLeer', vollbild),
      'Ians Entscheidung 93: er will Wien auch sehen, wenn nichts los ist')
pruef('Der Ausweg ist eine Kapsel über der Karte',
      '<KarteNichtsLos' in vollbild,
      'ohne ihn steht bei leerem Feed eine Karte ohne jede Auskunft da')
pruef('… und sie ist ein GESCHWISTER der Karte, kein Kind (harte Regel 51)',
      vor(vollbild, '<SsKarte', '<KarteNichtsLos'),
      'die Kartenfläche klippt und zieht jede Berührung an sich')
# 🔴 **Der Fehler, den Ian am 2026-09-19 um 16:23 fotografiert hat.**
# `useTabRand()` gibt auf iOS 0 zurück — richtig für Inhalt im FLUSS, falsch für
# alles, was absolut über der Leiste liegt. Die Kapsel klebte damit IN der
# Tab-Leiste, halb unlesbar. Harte Regel 62 trennt die zwei Fälle; dieser
# Wächter hält fest, dass die Kapsel im zweiten steht.
m2 = re.search(r'styles\.nichtsLos, \{ bottom: (\w+)', vollbild)
pruef(f'Die „nichts los"-Kapsel weicht der ECHTEN Leiste aus (gefunden: {m2.group(1) if m2 else "NICHTS"})',
      bool(m2) and m2.group(1) == 'tabUeberdeckung',
      '`tabRand` ist auf iOS 0 — die Kapsel läge hinter Apples Tab-Leiste')
pruef('`LeererFeed` steht NICHT über der Karte',
      'LeererFeed' not in vollbild,
      'er ist ein Vollflächen-Zustand — er würde Wien wieder ersetzen statt ergänzen')
# Und er muss es weiterhin GEBEN, an seiner eigenen Stelle: die Liste.
pruef('… aber es gibt ihn weiter, für die Liste', 'function LeererFeed' in code,
      'die beiden leeren Zustände sind zwei Situationen, nicht einer')

print('')
print(f'  {JA} Häkchen, {NEIN} Kreuze')
sys.exit(1 if NEIN else 0)
