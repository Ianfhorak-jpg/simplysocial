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
#    · 99: die Kopfkapsel war echtes Liquid Glass, und `glas-typen.ts` erklärt
#          auf 170 Zeilen, warum das richtig ist. `GLAS_AN = false` steht in
#          EINER Zeile darunter. **Kein anderer Prüfstand sieht diese Zeile.**
#
#  🔴 **Warum Entscheidung 99 ausgerechnet hier steht.** `npm run pruef-glas`
#  klingt zuständig, ist es aber nicht: `31_glasmessung.py` bewacht das MESSGERÄT
#  `scripts/glasmessung.py` (PNG-Dekoder, Helligkeitsrechnung) und erwähnt
#  `SsGlas`, `GLAS_AN` und `glas-typen` mit keinem Wort. Seine 33 Häkchen sind
#  richtig und von `GLAS_AN` überhaupt nicht berührt — **der Name verspricht
#  mehr als der Wächter prüft**, und das ist die Falle *„Ein Wächter, der eine
#  ÄHNLICHE Frage stellt, ist kein Wächter"* in ihrer Namensform.
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

GLAS = WURZEL / 'src' / 'components' / 'ui' / 'glas-typen.ts'

if not FEED.exists():
    sys.exit(f'✗ {FEED} fehlt.')
if not GLAS.exists():
    sys.exit(f'✗ {GLAS} fehlt.')
roh = FEED.read_text()
glas_roh = GLAS.read_text()

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
# 🔴 **Adresse geändert am 2026-09-20 — Ians Entscheidung 105.**
# Hier stand `const kopfKapsel = (`. Es gab damals ZWEI Kapseln: `kopfKapsel`
# für den Stapel und `ansichtZeile` für die Karte, in getrennten Bäumen. Beim
# Umschalten wurde die eine gegen die andere getauscht — **das war das Springen,
# das Ian gesehen hat.** Seither gibt es EINE, und sie ist ein Bauteil.
#
# ⚠️ Die vier Prüfungen darunter sind INHALTLICH unverändert: Es sind dieselben
# Fragen an dieselben Entscheidungen (90, 95, 41), nur an der neuen Adresse.
# Vier Kreuze nach dem Umbau waren deshalb kein gebrochener Beschluss, sondern
# ein Wächter, der zu Recht sagte „das steht nicht mehr, wo ich suche".
pruef('Die Kopfleiste gibt es', 'function KopfLeiste(' in code,
      'Ians Entscheidungen 90 und 105 sind aus dem Code verschwunden')
kapsel = block(code, 'function KopfLeiste(')
# ⚠️ **Über das ÖFFNENDE TAG gesucht, nicht über die Zeichenkette
# `<SsGlas schwebt`.** Genau daran ist diese Prüfung am 2026-09-20 rot geworden,
# obwohl nichts kaputt war: Der Umbau hat das Tag auf mehrere Zeilen verteilt,
# und `schwebt` stand plötzlich in der nächsten. *Ein Wächter, der eine
# SCHREIBWEISE aufzählt, merkt nicht, wenn dieselbe Sache anders geschrieben
# dasteht* (FALLEN.md) — hier in seiner harmloseren, aber lästigeren Form: Er
# meldet einen Verstoss, den es nicht gibt, und wird beim dritten Mal
# abgeschaltet statt gelesen.
m_glas = re.search(r'<SsGlas\b[^>]*>', kapsel, re.S)
pruef('… und sie ist `SsGlas schwebt`, nicht eine nachgebaute Fläche',
      bool(m_glas) and re.search(r'\bschwebt\b', m_glas.group(0)) is not None,
      'harte Regel 61/62: Fläche, Kante und Schatten gehören dem Glas')
# ⚠️ **Eins, nicht zwei** — bis zu Ians Entscheidung 95 stand hier `== 2`
# (Suchfeld UND Regler). Das Suchfeld ist weg; wer die Zahl nicht nachzieht,
# hat einen Wächter, der eine alte Fassung verlangt.
pruef('… der Regler gibt seine Fläche ab (`umgebung="kapsel"`)',
      kapsel.count('umgebung="kapsel"') == 1,
      f'gefunden: {kapsel.count(chr(117) + chr(109) + "gebung=")} — zwei Untergründe übereinander wären einer zu viel')

# ── Ians Entscheidung 105: EINE Kapsel, nicht zwei ────────────────────────
# Die verworfene Fassung ist hier nicht bloss „anders", sie ist NAMENTLICH
# bekannt — also wird genau auf ihre Rückkehr geprüft.
pruef('… und es gibt sie nur EINMAL (Entscheidung 105)',
      'const kopfKapsel' not in code and 'const ansichtZeile' not in code,
      'zwei Kapseln in zwei Bäumen werden beim Umschalten getauscht statt bewegt')
# Der Umschalter muss MITWACHSEN, sonst wächst die Kapsel um eine leere Fläche
# und die weisse Pille bleibt stehen — der ganze Effekt hinge daran.
# 🔴 **Mechanismus gewechselt am 2026-09-20, Ians dritte Meldung.** Hier stand
# `flex: 1` — der Umschalter wuchs damit zwar mit, aber die Hälften vermassen
# sich bei JEDEM Bild neu, jede Messung war ein Neuzeichnen, und die Pille hinkte
# hinterher: *„sie springt so komisch und ist nicht smooth."*
#
# Jetzt bekommt er seine Innenbreite als ANIMIERTEN Wert aus demselben Takt wie
# die Kapsel (`segmentBreite` → `SsSegment`-Prop `breite`). Die Absicht ist
# dieselbe geblieben — der Umschalter wächst mit —, nur das Mittel ist ein
# anderes. Deshalb prüft dieser Abschnitt jetzt zwei Dinge:
pruef('… der Umschalter bekommt seine Breite ANIMIERT (`segmentBreite`)',
      'const segmentBreite = bereit' in code
      and 'umschalter(styles.umschalterInKapsel, true, segmentBreite)' in code,
      'ohne sie misst er sich pro Bild neu — das war das Ruckeln')
pruef('… und hat KEINE zweite Breitenangabe im Stil',
      "umschalterInKapsel: { backgroundColor: 'transparent', borderWidth: 0 }," in code,
      'ein `flex` oder `width` daneben wäre die zweite Wahrheit über dieselbe Sache')

# 🔴 **Der Fehler vom 2026-09-20, den weder tsc noch Lint noch ein Bild am Mac
# gezeigt hat.** Die animierte Breite stand auf `SsGlas` — und das rendert mit
# `GLAS_AN = false` ein gewöhnliches `View`, das eine
# `Animated.AnimatedInterpolation` STILL verwirft. Die Kapsel bekam nie eine
# Breite, und es bewegte sich nichts. Ian musste es zweimal melden.
#
# Geprüft wird deshalb die REIHENFOLGE im Baum: Zwischen der Interpolation und
# `SsGlas` darf nichts anderes stehen als eine `Animated.View`.
i_anim = code.find('<Animated.View')
i_glas = code.find('<SsGlas schwebt style={styles.kopfKapselGlas}>')
i_takt = code.find('takt.interpolate')
pruef('Die animierte Breite sitzt auf einer `Animated.View`, nicht auf `SsGlas`',
      i_anim >= 0 and i_glas > i_anim and 0 <= i_takt < i_glas,
      'ein gewöhnliches `View` verwirft eine Animated-Breite STILL — dann bewegt '
      'sich nichts, und kein Typcheck sagt es')
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

# ══════════════════════════════════════════════════════════════════════════════
#  IANS ENTSCHEIDUNG 99 — matt statt Liquid Glass
# ══════════════════════════════════════════════════════════════════════════════
#  Sein Satz: *„dann probier es halt so zu machen, dass es halt nicht so wie
#  Liquid Glass aussieht, sondern einfach so matt halt, so wie die anderen
#  Knöpfe."* Zurückzudrehen ist EINE Zeile — deshalb muss eine Prüfung sie sehen.
#
#  ⚠️ **Was dieser Abschnitt NICHT behauptet.** Er sagt nicht, dass die Flächen
#  matt AUSSEHEN. Ob `expo-glass-effect` auf diesem Gerät überhaupt zeichnet,
#  beantwortet nur ein Bild vom iPhone. Er hält fest, dass der Schalter steht,
#  dass er wirkt und dass er an genau einer Stelle steht.
print('')
print('── Ians Entscheidung 99: matt, nicht Liquid Glass ──')

glas_code = '\n'.join(
    z for z in re.sub(r'/\*.*?\*/', '', glas_roh, flags=re.S).splitlines()
    if not z.strip().startswith('//')
)
m_an = re.search(r'export const GLAS_AN = (\w+);', glas_code)
pruef(f'`GLAS_AN` steht in `glas-typen.ts` (gefunden: {m_an.group(1) if m_an else "NICHTS"})',
      bool(m_an),
      'ohne die Konstante hat Entscheidung 99 keinen Ort mehr')
pruef('… und zwar auf `false` — Ians Entscheidung 99',
      bool(m_an) and m_an.group(1) == 'false',
      'auf `true` ist die Kopfkapsel wieder echtes Glas; das hat Ian abgelehnt')

# Ein Schalter, den niemand liest, ist keiner. `SsGlas.native.tsx` ist die
# Stelle, an der er wirkt — im Web-Zweig gibt es ohnehin nie Glas.
NATIV = WURZEL / 'src' / 'components' / 'ui' / 'SsGlas.native.tsx'
nativ = NATIV.read_text() if NATIV.exists() else ''
pruef('Der iOS-Zeichner liest ihn', 'GLAS_AN' in nativ,
      'sonst steht die Entscheidung da und wirkt nicht')
m_da = re.search(r'const GLAS_DA = ([^;]+);', nativ)
pruef('… und zwar als ERSTE Bedingung, vor Apples Verfügbarkeitsfragen',
      bool(m_da) and m_da.group(1).strip().startswith('GLAS_AN &&'),
      'steht er dahinter, entscheidet weiter das Gerät statt Ian')

# Die Gegenprobe gegen den Wächter selbst: Fände er `GLAS_AN` nirgends, sähen
# beide Prüfungen oben genauso aus wie bei einer umgebauten Datei.
pruef('Gegenprobe: `glas-typen.ts` enthält überhaupt Glas-Konstanten',
      'GLAS_STIL' in glas_code and 'GLAS_FARBSCHEMA' in glas_code,
      'eine Textsuche mit null Treffern beweist nichts')

# ══════════════════════════════════════════════════════════════════════════════
#  IANS ENTSCHEIDUNG 96 — Kapsel links, Posten-Knopf RECHTS AM RAND
# ══════════════════════════════════════════════════════════════════════════════
#  🔴 **Diese Entscheidung ist am 2026-09-20 stillschweigend verschwunden**, und
#  kein einziger Prüfstand hat es bemerkt. Sie stand als
#  `justifyContent: 'space-between'` in `kopfZeile`; beim Umbau auf die EINE
#  Kapsel (Entscheidung 105) wurde `kopfZeile` nicht umbenannt, sondern durch
#  `kopfLeiste` ERSETZT — und ein Neubau erbt nichts. Der Knopf klebte danach am
#  `gap` der Kapsel und landete, weil die Kapsel im Stapel nur `schmal` breit
#  ist, in der Bildmitte. Ians Befund: *„der Post-Button ist irgendwie in der
#  Mitte gelandet."*
#
#  ⚠️ **Was dieser Abschnitt NICHT behauptet.** Er sagt nicht, dass der Knopf am
#  Rand SITZT — das sagt nur ein Bild vom Gerät. Er hält fest, dass die eine
#  Eigenschaft dasteht, ohne die er es sicher nicht tut.
print('')
print('── Ians Entscheidung 96: Kapsel links, Posten-Knopf rechts ──')

m_leiste = re.search(r'\n  kopfLeiste: \{(.*?)\n  \},', roh, re.S)
pruef('`kopfLeiste` ist gefunden',
      bool(m_leiste),
      'ohne den Style hat Entscheidung 96 keinen Ort — umbenannt? dann hier nachziehen')
leiste = m_leiste.group(1) if m_leiste else ''
pruef('… und trägt `space-between` — Ians Entscheidung 96',
      "justifyContent: 'space-between'" in leiste,
      'ohne sie klebt der Posten-Knopf an der Kapsel und steht im Stapel mittig')
# Die Kapsel muss weiterhin VOR dem Knopf stehen — `space-between` allein sagt
# nur „auseinander", nicht „in dieser Reihenfolge".
m_reihe = re.search(r'<SsGlas schwebt style=\{styles\.kopfKapselGlas\}>', roh)
pruef('Die Kapsel steht VOR dem Posten-Knopf im Baum',
      bool(m_reihe) and roh.index('<PostenKnopf />') > m_reihe.start(),
      'sonst verteilt `space-between` sie in der falschen Reihenfolge')

# ══════════════════════════════════════════════════════════════════════════════
#  DIE EINE BREITE — der Umschalter bekommt sie WIRKLICH (2026-09-20)
# ══════════════════════════════════════════════════════════════════════════════
#  🔴 `segmentBreite` ging ein halbes Jahr lang NUR in die Pillenrechnung. Die
#  Wurzel von `SsSegment` maß sich weiter nach ihrem Inhalt — zwei Wahrheiten
#  über dieselbe Breite, 84 gegen 104 Punkte. Ians *„dieser weiße Punkt ist
#  nicht mittig beim Stapel."*
#
#  Das ist die Falle *„Ein ungenutzter Parameter ist einer, den nie jemand
#  geprüft hat"*: Eine Prop, die ankommt und verpufft, sieht im Typcheck aus wie
#  eine, die wirkt.
print('')
print('── Eine Breite, eine Quelle ──')

SEG = WURZEL / 'src' / 'components' / 'ui' / 'SsSegment.tsx'
seg = SEG.read_text() if SEG.exists() else ''
pruef('`SsSegment.tsx` ist gefunden', bool(seg),
      'eine Textsuche mit null Treffern beweist nichts')
pruef('Die Wurzel setzt `breite` als eigene Breite',
      'breite !== undefined ? { width: breite } : null' in seg,
      'ohne das misst sich der Umschalter nach seinem Inhalt und die Pille rechnet daneben')
pruef('Die Pille zieht Rahmen, Polsterung und Zwischenraum ab (`spur`)',
      'const spur =' in seg and 'RAHMEN * 2 + spacing.xs * 2 + spacing.xs * (options.length - 1)' in seg,
      '`breite / anzahl` macht die Pille um Polsterung und Lücke zu breit')
pruef('… und startet an der linken Polsterung, nicht bei 0',
      'Animated.add(\n                        spacing.xs,' in seg,
      'ein absolut gesetztes Kind zählt vom Innenrand des RAHMENS, die Polsterung fehlt ihm')
pruef('Die Rahmenstärke hat EINEN Ort (`RAHMEN`)',
      'const RAHMEN = 1;' in seg and 'borderWidth: RAHMEN,' in seg,
      'eine 1 an zwei Stellen verschiebt die Pille lautlos um einen Punkt')

# Das ✕ ist ein Geschwister des Umschalters in derselben Kapsel. Seit die Breite
# echt ist, muss sie ihm Platz lassen — sonst ragt es aus der Kapsel heraus,
# und `kopfKapselGlas` hat bewusst kein `overflow: hidden`.
pruef('Die Kapselbreite lässt dem ✕ Platz (`abwaehlRaum`)',
      'const abwaehlRaum =' in roh and '- abwaehlRaum' in roh,
      'sonst nimmt der Umschalter die ganze Kapsel und das ✕ landet beim Posten-Knopf')
pruef('… und dieser Platz ist GEMESSEN, nicht geraten',
      'setAbwaehlNatur(e.nativeEvent.layout.width)' in roh,
      'die Breite hängt an der Schriftgröße des Geräts, nicht an einer Konstante')

# ══════════════════════════════════════════════════════════════════════════════
#  EINE STELLE IM BAUM — sonst wird die Kapsel neu gebaut statt bewegt
# ══════════════════════════════════════════════════════════════════════════════
#  🔴 **Das war die Wurzel der VIER gescheiterten Runden zu Entscheidung 105.**
#  Es gab zwei Rückgaben; in der einen war die Kopfleiste das zweite Kind des
#  Fragments, in der anderen steckte sie in `SsScreen`. React vergleicht Kind
#  für Kind — an Position 2 standen zwei verschiedene Typen, also wurde der
#  ganze Teilbaum verworfen und neu gebaut. Beim Neubau startet
#  `useState(() => new Animated.Value(aufKarte ? 1 : 0))` **direkt am Ziel**,
#  und `useEffect` animiert von 1 nach 1. Ians Befund vom 2026-09-20: *„die
#  Animation ist nur zwei Frames lang, also es ist nicht wirklich eine
#  Animation."*
#
#  ⚠️ **Was dieser Abschnitt NICHT kann.** Er sieht nicht, ob React neu baut —
#  das sagt nur ein laufendes Bild. Er hält fest, dass es GENAU EINE Stelle
#  gibt, an der die Leiste gerendert wird. Zwei Stellen sind der Fehler,
#  unabhängig davon, wie sie zustande kommen.
print('')
print('── Die Kopfleiste steht an EINER Stelle im Baum ──')

stellen = roh.count('<View style={styles.kopfSchwebend}>{kopfLeiste}</View>')
pruef(f'Sie wird genau EINMAL gerendert (gefunden: {stellen}×)',
      stellen == 1,
      'zwei Stellen heissen zwei Baumpositionen — React baut die Kapsel dann neu, '
      'statt sie zu bewegen, und der Taktgeber startet schon am Ziel')
pruef('… und NICHT innerhalb von `SsScreen`',
      bool(re.search(r'</SsScreen>\s*</>\s*\)\}\s*(?:\{/\*.*?\*/\}\s*)?<View style=\{styles\.kopfSchwebend\}>', roh, re.S)),
      'steckt sie im Screen, hat sie im Kartenzweig zwangsläufig eine andere Stelle')

# Der Sicherheitsabstand gehört damit IMMER ihr — ein `eigenerRandOben` wäre
# die zweite Wahrheit darüber, wer ihn trägt.
# Gesucht wird die PROP, nicht das Wort: Warum es sie einmal gab, steht weiter
# unten im Text und soll dort auch stehen bleiben. *Ein Wächter, der die eigene
# BEGRÜNDUNG für den Verstoß hält, wird abgeschaltet statt gelesen* (FALLEN.md).
alsProp = re.findall(r'eigenerRandOben\s*[=,:]', roh)
pruef(f'Der obere Sicherheitsabstand gehört immer der Kopfleiste (Prop-Reste: {len(alsProp)})',
      not alsProp
      and 'styles.kopfLeiste, { paddingTop: insets.top + spacing.sm }' in roh,
      'ohne `SsScreen` darüber trägt ihn sonst niemand — ein Schalter dafür wäre '
      'die zweite Wahrheit über die Frage, wer ihn trägt')

# Und der Stapel darf ihn nicht ein ZWEITES Mal polstern.
pruef('Der Stapel rechnet mit `kopfUeberInhalt`, nicht mit `kopfHoehe`',
      'const kopfUeberInhalt = Math.max(0, kopfHoehe - insets.top);' in roh
      and 'marginTop: kopfUeberInhalt' in roh
      and 'paddingTop: Math.max(0, kopfUeberInhalt - spacing.md)' in roh,
      '`SsScreen` hat `insets.top` schon abgezogen — sonst rund 59 pt Luft zu viel')
pruef('… und die Karte weiterhin mit `kopfHoehe`',
      'kopfHoehe={kopfHoehe}' in roh,
      'sie hat keinen Screen um sich, ihr Nullpunkt IST der Bildrand')

print('')
print(f'  {JA} Häkchen, {NEIN} Kreuze')
sys.exit(1 if NEIN else 0)
