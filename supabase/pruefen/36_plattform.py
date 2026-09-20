#!/usr/bin/env python3
# ══════════════════════════════════════════════════════════════════════════════
#  DIE .native-PAARE BEWACHEN — was tsc auf diesem Mac NICHT sehen kann
#
#  Aufruf: npm run pruef-plattform   (braucht nichts: kein Server, kein Gerät)
#
#  ── Der Fehler, aus dem dieser Prüfstand entstand (2026-09-20) ──────────────
#  `AntwortLeiste.tsx` holte `TAB_KAPSEL_SEITE` aus `@/lib/tabs`. `tsc` war
#  sauber, `expo lint` stand auf 89, alle Wächter grün — und am iPhone war die
#  Leiste schmal und klebte links am Rand.
#
#  **`lib/tabs.native.ts` exportiert die Kapsel-Maße mit ABSICHT nicht.** Auf
#  iOS gehört die Tab-Leiste Apple (Entscheidung 85), es gibt keine eigene
#  Kapsel zu messen. Die Datei sagt das auch — und verspricht dabei:
#
#      „Wer sie auf iOS liest, bekommt jetzt einen Typfehler statt einer
#       stillen Falschmessung."
#
#  🔴 **Diesen Typfehler gibt es nicht.** `tsc` löst `@/lib/tabs` IMMER auf
#  `tabs.ts` auf — Metro kennt die Plattform-Endungen, TypeScript nur mit
#  `moduleSuffixes` in der `tsconfig.json`, und das steht dort nicht. Der
#  Wert war zur Laufzeit `undefined`; `StyleSheet.create` friert ihn so ein,
#  und ein absolutes Kind ohne `left`/`right` wird inhaltsbreit.
#
#  *Das ist die Falle „Eine Regel, die nichts vorfindet, sieht aus wie eine
#  Regel, die tut" in ihrer teuersten Form:* Die Begründung stand da, sie war
#  richtig, und die Absicherung dazu hat es nie gegeben.
#
#  ── Warum nicht einfach `moduleSuffixes` setzen ─────────────────────────────
#  Das würde tsc ALLE Importe auf die `.native`-Fassung auflösen — dann ist der
#  Web-Zweig ungeprüft, und die Dateien gibt es ja gerade deshalb doppelt. Ein
#  Prüfstand trifft genau die eine Frage: Holt jemand einen Namen, den es auf
#  dem Gerät nicht gibt?
#
#  ⚠️ **Was er NICHT kann.** Er vergleicht NAMEN. Ob eine `.native`-Fassung
#  etwas anderes TUT als ihre Schwester, sieht er nicht — dafür gibt es
#  `useTabRand()`, das auf iOS absichtlich 0 liefert (harte Regel 62).
# ══════════════════════════════════════════════════════════════════════════════
import pathlib, re, sys

WURZEL = pathlib.Path(__file__).resolve().parents[2]
SRC = WURZEL / 'src'

JA = NEIN = 0
def pruef(text, ok, dazu=''):
    global JA, NEIN
    if ok:
        print(f'  ✓ {text}'); JA += 1
    else:
        print(f'  ✗ {text}' + (f'  ({dazu})' if dazu else '')); NEIN += 1

if not SRC.is_dir():
    sys.exit(f'✗ {SRC} fehlt.')


def namen(quelle: str) -> set[str]:
    """Die Namen, die eine Datei ZUR LAUFZEIT hergibt.

    Typen zählen nicht mit: Sie sind nach dem Übersetzen weg und können am
    Gerät gar nicht fehlen. Genau deshalb muss der Wächter sie kennen — sonst
    meldet er jedes `import type` als Verstoß.
    """
    raus = set()
    for m in re.finditer(r'^export (?:async )?(?:const|let|function|class)\s+(\w+)', quelle, re.M):
        raus.add(m.group(1))
    for m in re.finditer(r'^export \{([^}]*)\}', quelle, re.M):
        for teil in m.group(1).split(','):
            teil = teil.strip()
            if not teil or teil.startswith('type '):
                continue
            raus.add(teil.split(' as ')[-1].strip())
    return raus


def typnamen(quelle: str) -> set[str]:
    raus = set()
    for m in re.finditer(r'^export (?:type|interface)\s+(\w+)', quelle, re.M):
        raus.add(m.group(1))
    return raus


# ══════════════════════════════════════════════════════════════════════════════
#  1 · Die Paare finden
# ══════════════════════════════════════════════════════════════════════════════
print('── Die .native-Paare ──')

paare = {}
for nativ in sorted(SRC.rglob('*.native.*')):
    if nativ.suffix not in ('.ts', '.tsx'):
        continue
    stamm = nativ.name[: -len('.native' + nativ.suffix)]
    for endung in ('.ts', '.tsx'):
        web = nativ.parent / (stamm + endung)
        if web.exists():
            paare[nativ.parent / stamm] = (web, nativ)
            break

pruef(f'Es gibt überhaupt .native-Paare (gefunden: {len(paare)})',
      len(paare) >= 2,
      'sind sie weg oder umbenannt, prüft dieser Prüfstand NICHTS und meldet grün')
for pfad, (web, nativ) in paare.items():
    print(f'     · {web.relative_to(SRC)}  ↔  {nativ.name}')

# ══════════════════════════════════════════════════════════════════════════════
#  2 · Welche Namen gibt es NUR auf Web?
# ══════════════════════════════════════════════════════════════════════════════
print('')
print('── Namen, die es am GERÄT nicht gibt ──')

nur_web = {}
for pfad, (web, nativ) in paare.items():
    fehlt = namen(web.read_text()) - namen(nativ.read_text())
    if fehlt:
        nur_web[pfad] = fehlt
        print(f'     · {web.stem}: {", ".join(sorted(fehlt))}')
if not nur_web:
    print('     (keine — beide Fassungen geben dasselbe her)')

# ══════════════════════════════════════════════════════════════════════════════
#  3 · Holt sie jemand? Das ist die eigentliche Frage
# ══════════════════════════════════════════════════════════════════════════════
print('')
print('── Wer holt sie trotzdem ──')

# `import { a, b } from '…'` über mehrere Zeilen. `import type { … }` und
# `{ type X }` werden ausgelassen: Typen sind am Gerät gar nicht da.
IMPORT = re.compile(r'import\s+(type\s+)?\{([^}]*)\}\s+from\s+[\'"]([^\'"]+)[\'"]', re.S)

verstoesse = []
# 🔴 **Die WEB-Hälfte eines Paars wird übersprungen, die .native-Hälfte NICHT.**
# Der erste Anlauf hatte es genau andersherum und meldete vier Verstöße in
# `app/(tabs)/_layout.tsx` — die Datei hat selbst eine `.native`-Schwester,
# läuft also nie auf dem Gerät und darf die Kapsel-Maße sehr wohl lesen. Eine
# `.native`-Datei umgekehrt läuft dort und bekäme denselben `undefined`-Wert
# wie jede andere. *Ein Wächter, der auch Dateien prüft, die niemand öffnet,
# sperrt zu viel* (FALLEN.md).
NUR_WEB_DATEIEN = {web for web, _ in paare.values()}

for datei in sorted(SRC.rglob('*.ts')) + sorted(SRC.rglob('*.tsx')):
    if datei in NUR_WEB_DATEIEN:
        continue
    roh = datei.read_text()
    for m in IMPORT.finditer(roh):
        nur_typ, liste, ziel = m.group(1), m.group(2), m.group(3)
        if nur_typ:
            continue
        if ziel.startswith('@/'):
            aufgeloest = SRC / ziel[2:]
        elif ziel.startswith('.'):
            aufgeloest = (datei.parent / ziel).resolve()
        else:
            continue
        fehlt = nur_web.get(aufgeloest)
        if not fehlt:
            continue
        for teil in liste.split(','):
            teil = teil.strip()
            if not teil or teil.startswith('type '):
                continue
            name = teil.split(' as ')[0].strip()
            if name in fehlt:
                verstoesse.append((datei.relative_to(WURZEL), name, ziel))

for d, n, z in verstoesse:
    print(f'     ✗ {d}  holt  {n}  aus  {z}')
pruef(f'Niemand holt einen Namen, den die .native-Fassung nicht hat (Verstöße: {len(verstoesse)})',
      not verstoesse,
      'tsc sieht das NICHT — es löst immer auf die Web-Datei auf. Am Gerät ist der '
      'Wert `undefined`, und in einem `StyleSheet.create` ist er dann eingefroren')

# Gegenprobe gegen den Wächter selbst: Findet er die Importe überhaupt?
treffer = sum(1 for d in SRC.rglob('*.tsx') for _ in IMPORT.finditer(d.read_text()))
pruef(f'Gegenprobe: er findet überhaupt Importe (gefunden: {treffer})',
      treffer > 50,
      'ein Muster, das nichts trifft, meldet immer grün')

# ── Und der Zeiger auf diesen Prüfstand ─────────────────────────────────────
# `tabs.native.ts` erklärt auf zwanzig Zeilen, warum es die Kapsel-Maße nicht
# hergibt. Wer das liest, muss auch erfahren, WER die Zusage trägt — sonst
# schreibt der Nächste wieder „gibt einen Typfehler" hin und verlässt sich
# darauf.
#
# ⚠️ Bewusst ein POSITIVER Test. Der erste Anlauf suchte das falsche Versprechen
# als Text und ging schon an der BERICHTIGUNG darüber rot — *ein Wächter, der
# eine Schreibweise aufzählt, merkt nicht, wenn dieselbe Sache anders
# geschrieben dazukommt*, und einer, der die eigene Begründung für den Verstoß
# hält, wird abgeschaltet statt gelesen (FALLEN.md, beide).
TS = WURZEL / 'tsconfig.json'
hat_suffixe = 'moduleSuffixes' in TS.read_text() if TS.exists() else False
TABS = SRC / 'lib' / 'tabs.native.ts'
tabs_nativ = TABS.read_text() if TABS.exists() else ''
pruef('`tabs.native.ts` ist gefunden', bool(tabs_nativ),
      'eine Textsuche mit null Treffern beweist nichts')
pruef('… und verweist auf den Wächter, der seine Zusage wirklich trägt',
      hat_suffixe or 'pruef-plattform' in tabs_nativ,
      'ohne `moduleSuffixes` löst tsc immer auf die Web-Datei auf — steht der Verweis '
      'nicht da, hält der Nächste die Auslassung wieder für selbsttragend')

print('')
print(f'  {JA} Häkchen, {NEIN} Kreuze')
sys.exit(1 if NEIN else 0)
