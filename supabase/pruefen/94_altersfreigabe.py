#!/usr/bin/env python3
# ══════════════════════════════════════════════════════════════════════════════
#  DIE ALTERSFREIGABE BEWACHEN — Phase 21.1
#
#  Aufruf: npm run pruef-alter   (braucht nichts: keine Datenbank, kein Gerät)
#
#  ── Wozu, und warum die Richtung wieder umgedreht wird ──────────────────────
#  `_FUER_IAN/ALTERSFREIGABE.md` beantwortet 28 Fragen von Apple. Die JA-Antworten
#  sind ungefährlich: „Es gibt einen Chat" bleibt wahr, solange es die App gibt.
#  **Gefährlich sind die NEIN-Antworten** — sie sind Zusagen über etwas, das
#  NICHT da ist, und so etwas wird still falsch, sobald jemand ein Paket
#  nachinstalliert oder eine Zeile schreibt.
#
#  Drei davon hängen an nachprüfbaren Tatsachen im Code, und genau die stehen
#  hier. Nicht das Dokument sagt, was die App tut — der Code sagt, was im
#  Dokument stehen muss. Dieselbe Leserichtung wie `99_etikett.py`
#  (harte Regel 107).
#
#  ── Was er NICHT leistet ────────────────────────────────────────────────────
#  Er beantwortet keine URTEILSFRAGE. Ob „Bier trinken gehen" als Alkoholbezug
#  zählt und ob Sport ein „Wellness-Thema" ist, steht als Frage an Ian im
#  Dokument — das ist eine Auslegung von Apples Wortlaut und keine Messung.
#  Und er weiß nicht, was in App Store Connect eingetragen WURDE: Er bewacht das
#  Dokument, nicht das Formular.
# ══════════════════════════════════════════════════════════════════════════════
import json, pathlib, re, subprocess, sys, tempfile

WURZEL = pathlib.Path(__file__).resolve().parents[2]
DOK = WURZEL.parent / '_FUER_IAN' / 'ALTERSFREIGABE.md'

JA = NEIN = 0
def pruef(text, ok, dazu=''):
    global JA, NEIN
    if ok:
        print(f'  ✓ {text}'); JA += 1
    else:
        print(f'  ✗ {text}' + (f'  ({dazu})' if dazu else '')); NEIN += 1

if not DOK.exists():
    sys.exit(f'✗ {DOK} fehlt — ohne das Dokument gibt es nichts zu bewachen.')
text = DOK.read_text()
quelle = WURZEL / 'src'

# ── Der Scanner, und seine Gegenprobe steht direkt darunter ──────────────────
#
# ⚠️ *Eine Textsuche mit NULL Treffern beweist nichts* (FALLEN.md) — sie kann
# auch bedeuten, dass man sich vertippt hat oder im falschen Ordner sucht.
# Deshalb wird derselbe Scanner an einer Datei gemessen, in der die Wörter
# GARANTIERT vorkommen. Erst dann ist ein leeres Ergebnis eine Aussage.
def sucht(woerter, ordner):
    treffer = []
    for p in sorted(pathlib.Path(ordner).rglob('*.ts*')):
        inhalt = p.read_text(errors='ignore')
        for zeile_nr, zeile in enumerate(inhalt.splitlines(), 1):
            # Kommentare zählen nicht: In `anmeldung.ts` steht `ASWebAuthenticationSession`
            # in einem Absatz, der ERKLÄRT, warum nichts in die Info.plist muss.
            nackt = zeile.strip()
            if nackt.startswith(('*', '//', '/*')):
                continue
            for w in woerter:
                if w in zeile:
                    # `relative_to` nur, wo es geht: Die Gegenprobe weiter
                    # unten liegt absichtlich AUSSERHALB des Projekts.
                    try:
                        wo = p.relative_to(WURZEL)
                    except ValueError:
                        wo = p
                    treffer.append(f'{wo}:{zeile_nr} → {w}')
    return treffer

print('── 0. Zuerst das Messgerät ─────────────────────────────────────────────')
with tempfile.TemporaryDirectory() as tmp:
    probe = pathlib.Path(tmp) / 'gegenprobe.tsx'
    probe.write_text("import { Linking } from 'react-native';\n"
                     "export const auf = () => Linking.openURL('https://example.com');\n")
    gefunden = sucht(['openURL', 'Linking.'], tmp)
    pruef('Der Scanner FINDET openURL, wenn es dasteht (sonst misst er nichts)',
          len(gefunden) >= 1, f'{len(gefunden)} Treffer in der Wegwerf-Datei')
    # Und er darf sich nicht von einem Kommentar täuschen lassen — sonst wäre
    # jede Erklärung im Dateikopf ein Fehlalarm.
    probe.write_text("// hier stünde openURL, aber nur als Erklärung\n"
                     " * Linking.openURL im Fließtext eines Kommentars\n")
    pruef('… und ignoriert dieselben Wörter im KOMMENTAR',
          len(sucht(['openURL', 'Linking.'], tmp)) == 0)

print('')
print('── 1. „Uneingeschränkter Webzugriff: NEIN" ─────────────────────────────')
web = sucht(['openURL', 'Linking.', 'WebBrowser.', 'openBrowserAsync'], quelle)
pruef('Der Quellcode öffnet keine fremden Adressen',
      not web, '; '.join(web[:3]))
pruef('Das Dokument sagt bei Webzugriff NEIN',
      re.search(r'Uneingeschränkter Webzugriff\s*\|\s*\*\*NEIN\*\*', text) is not None)

print('')
print('── 2. „Werbung: NEIN" ──────────────────────────────────────────────────')
pak = json.loads((WURZEL / 'package.json').read_text())['dependencies']

# ⚠️ **Die ZAHL ist der Wächter, die Namensliste ist nur die Bequemlichkeit.**
# Das ist am 2026-09-14 gemessen worden, und zwar am eigenen Leib: Die Gegenprobe
# schmuggelte `react-native-google-mobile-ads` ein — ein waschechtes Werbepaket —
# und die Namensliste unten ließ es DURCH, weil dort `admob` stand und nicht
# `mobile-ads`. Rot wurde der Lauf nur über die Zahl.
#
# Das ist wörtlich die Falle, gegen die dieser Wächter gebaut ist (*„Eine Prüfung,
# die NAMEN aufzählt, merkt nicht, wenn etwas dazukommt"*) — einmal mehr, eine
# Etage höher, im Wächter selbst. **Eine Namensliste kann nicht vollständig sein**,
# weil sie Pakete kennen müsste, die es noch nicht gibt.
#
# Die Zahl kann es: Jede neue Abhängigkeit macht den Lauf rot, und dann sieht ein
# Mensch hin. Die Namensliste bleibt trotzdem stehen — sie sagt im Klartext, WAS
# dazugekommen ist, statt nur DASS etwas dazukam.
verdacht = [k for k in pak if any(w in k.lower() for w in (
    'admob', 'mobile-ads', 'adjust', 'analytic', 'appsflyer', 'amplitude',
    'mixpanel', 'sentry', 'segment', 'firebase', 'facebook', 'crashlytics',
    'bugsnag', 'posthog', 'datadog', 'onesignal', 'branch', 'revenuecat',
    'purchases', 'tenjin', 'singular', 'ironsource', 'applovin', 'unity-ads'))]
pruef(f'Kein bekanntes Werbe-/Analysepaket unter den {len(pak)} Abhängigkeiten',
      not verdacht, ', '.join(verdacht))
pruef('Die ZAHL der Abhängigkeiten ist unverändert — der eigentliche Wächter',
      f'**{len(pak)}**' in text,
      f'package.json sagt {len(pak)}, das Dokument etwas anderes — '
      f'kam ein Paket dazu? Dann prüfen, ob es Daten sammelt')

print('')
print('── 3. „Altersprüfung: NEIN" und „altersbeschränkt: NEIN" ───────────────')
# Beide Antworten hängen daran, dass die App das Alter NICHT verifiziert. Täte
# sie es, wäre nicht nur der Fragebogen falsch — es hinge eine ganze Pflichtkette
# daran (Declared Age Range API, Unter-13-Sperre).
alter = sucht(['DeclaredAgeRange', 'declaredAgeRange', 'AgeRangeService',
               'requestAgeRange'], quelle)
pruef('Die App benutzt Apples Declared-Age-Range-API NICHT',
      not alter, '; '.join(alter[:3]))
pruef('Der Jahrgang wird EINGETIPPT — er steht als Zahl im Profil',
      'jahrgang' in (WURZEL / 'src/features/auth/konto.ts').read_text())
pruef('Das Dokument sagt bei Altersprüfung NEIN',
      re.search(r'Altersprüfung.*\|\s*\*\*NEIN\*\*', text) is not None)

print('')
print('── 4. Die drei JA-Antworten stehen auf echten Tabellen ─────────────────')
# Sie können nicht still falsch werden — aber sie können still VERSCHWINDEN,
# und dann stünde im Fragebogen etwas, das es nicht mehr gibt.
schema = (WURZEL / 'supabase/migrations/0001_schema.sql').read_text()
for tabelle, frage in (('messages', 'Nachrichten und Chat'),
                       ('follows', 'Social-Media-Funktionen'),
                       ('posts', 'Nutzergenerierte Inhalte')):
    pruef(f'`{tabelle}` gibt es — trägt „{frage}: JA"',
          f'create table {tabelle} (' in schema)

print('')
print('── 5. Das Ergebnis selbst ──────────────────────────────────────────────')
pruef('Das Dokument nennt 13+ als Ergebnis', '13+' in text)
pruef('… und sagt dazu, dass es eine FESTSTELLUNG ist und keine Wahl',
      'keine Wahl' in text or 'nicht eine Wahl' in text)
pruef('Die Kinder-Kategorie bleibt ausdrücklich leer',
      'Leer lassen' in text)
pruef('Es steht dabei, dass Apples 13+ kein Rechtsurteil ist',
      'Store-Einstufung' in text)

print('')
print(f'  {JA} Häkchen, {NEIN} Kreuze')
sys.exit(1 if NEIN else 0)
