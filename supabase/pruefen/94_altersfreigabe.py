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
import ast, json, pathlib, re, subprocess, sys, tempfile

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
# 🔴 VERENGT am 2026-09-28 — und das ist ausdrücklich KEINE Lockerung.
#
# Bis dahin galt: `openURL` · `Linking.` · `WebBrowser.` · `openBrowserAsync`
# nirgends. Das war richtig, solange die App keine einzige Adresse öffnete. Seit
# der Rechtliches-Block im Zustimmungs-Screen auf die Datenschutzerklärung, Apples
# Standard-Lizenzvertrag und die Hilfe-Seite verweist, stimmt es nicht mehr.
#
# ── Warum die Antwort „NEIN" trotzdem richtig bleibt ────────────────────────
# Apples Beschreibung von *Unrestricted Web Access*: „users can navigate to any
# webpage WITHIN THE APP or freely browse the web, and may include embedded
# browser functionality". Gemeint ist ein Browser IN der App.
#
#   `Linking.openURL(feste_adresse)`  verlässt die App und übergibt an Safari.
#                                     Kein eingebetteter Browser, keine freie
#                                     Navigation — man kommt an genau EINE Seite.
#   `WebBrowser.openBrowserAsync`     öffnet einen Browser INNERHALB der App
#                                     (SFSafariViewController). Das ist der Fall,
#                                     den Apple meint.
#
# Deshalb bleibt das zweite absolut verboten, und das erste wird eng erlaubt.
#
# ⚠️ **Eng heißt eng, sonst wäre der Wächter abgeschafft statt verengt:**
#   1. nur in DIESER einen Datei,
#   2. nur mit Adressen aus `BRAND.legal` — keine Literale, keine Nutzereingabe.
# Eine Adresse aus einem Post oder Profil wäre genau der Fall, den die Zusage an
# Apple ausschließt, und sie bliebe hier rot.
WEB_DATEI = 'src/components/Nutzungsbedingungen.tsx'

# Das absolute Verbot zuerst: ein Browser IN der App, überall.
eingebettet = sucht(['WebBrowser.', 'openBrowserAsync'], quelle)
pruef('Kein eingebetteter Browser (das ist, was Apple „unrestricted" nennt)',
      not eingebettet, '; '.join(eingebettet[:3]))

# Und nun das eng Erlaubte.
raus = sucht(['openURL', 'Linking.'], quelle)
fremde = [t for t in raus if WEB_DATEI not in t]
pruef(f'`openURL` steht NUR in {WEB_DATEI}',
      not fremde, '; '.join(fremde[:3]))

_wb = (WURZEL / WEB_DATEI).read_text(encoding='utf-8')
_wb_code = '\n'.join(z for z in _wb.splitlines()
                     if not z.lstrip().startswith(('*', '//', '/*')))
pruef('… und öffnet nur Adressen aus BRAND.legal, keine Literale',
      'BRAND.legal' in _wb_code and 'openURL(\'http' not in _wb_code
      and 'openURL("http' not in _wb_code)

# Gegenprobe: Würde eine eingeschmuggelte fremde Adresse auffallen? Ohne sie ist
# „0 Treffer" nur die Abwesenheit eines Beweises (Falle: *„Eine Textsuche mit NULL
# Treffern beweist nichts"*).
_probe = WURZEL / 'src' / '_wegwerf_webzugriff.tsx'
try:
    _probe.write_text("import { Linking } from 'react-native';\n"
                      "export const x = () => Linking.openURL('https://example.com');\n")
    _gegen = [t for t in sucht(['openURL', 'Linking.'], quelle) if WEB_DATEI not in t]
    pruef('Gegenprobe: eine Adresse in einer ANDEREN Datei wird rot',
          len(_gegen) >= 1, f'{len(_gegen)} Treffer')
finally:
    _probe.unlink(missing_ok=True)
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
print('── 6. Die Tabelle, die WIRKLICH zu Apple geht ──────────────────────────')
# 🔴 Seit dem 2026-09-26 gibt es die Antworten an ZWEI Orten: in diesem Dokument
# (fuer Ian) und als Tabelle `ALTERSFREIGABE` in `scripts/asc.py` (fuer Apple).
# Bis dahin war das Dokument der einzige Ort, und „eintragen" hiess abtippen.
#
# Zwei Orte fuer dieselbe Aussage laufen auseinander, und zwar lautlos: Das
# Dokument liest ein Mensch, die Tabelle liest Apple. Ab hier wird gemessen, dass
# sie dasselbe sagen — und zwar in der Richtung von harter Regel 107: Der CODE
# sagt, was in beiden stehen muss.
#
# ⚠️ Gelesen wird mit `ast`, NICHT mit `import`. Ein Import wuerde `asc.py`
# ausfuehren, und das Modul kann nach aussen schreiben. Ein Pruefstand, der das
# tut, um eine Konstante zu erfahren, ist die falsche Bauart.
ASC = WURZEL / 'scripts' / 'asc.py'

def tabelle_aus(pfad, name='ALTERSFREIGABE'):
    """Den Dict-Literal `name` aus einer Python-Datei lesen, ohne sie zu starten."""
    baum = ast.parse(pathlib.Path(pfad).read_text())
    for k in baum.body:
        if isinstance(k, ast.Assign) and any(
                getattr(z, 'id', None) == name for z in k.targets):
            return ast.literal_eval(k.value)
    return None

pruef(f'`{ASC.name}` traegt eine Tabelle ALTERSFREIGABE', ASC.exists()
      and tabelle_aus(ASC) is not None)
TAB = tabelle_aus(ASC) or {}

# Die drei JA — sie koennen nicht still falsch werden, aber still verschwinden.
for feld in ('userGeneratedContent', 'messagingAndChat', 'socialMedia'):
    pruef(f'{feld} steht auf True — daraus FOLGT 13+',
          TAB.get(feld) is True, f'steht auf {TAB.get(feld)!r}')

# Die drei NEIN von September 2026. Das sind Zusagen ueber etwas, das NICHT da
# ist — die gefaehrliche Richtung.
for feld in ('socialMediaAgeRestricted', 'ageAssurance', 'parentalControls'):
    pruef(f'{feld} steht auf False — es ist nichts davon gebaut',
          TAB.get(feld) is False, f'steht auf {TAB.get(feld)!r}')

# Diese zwei haengen an den Messungen aus Abschnitt 1 und 2 DIESES Pruefstands.
# Waere die Tabelle hier anders, wuerde oben der Code gemessen und unten etwas
# anderes an Apple geschickt.
pruef('advertising steht auf False — und Abschnitt 2 hat das am package.json gemessen',
      TAB.get('advertising') is False, f"steht auf {TAB.get('advertising')!r}")
pruef('unrestrictedWebAccess steht auf False — Abschnitt 1 hat das am Quellcode gemessen',
      TAB.get('unrestrictedWebAccess') is False,
      f"steht auf {TAB.get('unrestrictedWebAccess')!r}")

# Ians Auslegung aus dem Dokument, Frage 2. Anders als in ACTA (dort True, weil
# der KI-Coach wirklich Training plant).
pruef('healthOrWellnessTopics steht auf False — wie im Dokument beantwortet',
      TAB.get('healthOrWellnessTopics') is False,
      f"steht auf {TAB.get('healthOrWellnessTopics')!r}")

# `kidsAgeBand` DARF nicht in der Tabelle stehen: Ein Wert dort waere eine Zusage
# an Apples „Kids"-Kategorie, nicht eine Antwort. Das Dokument sagt „Leer lassen",
# und ein Feld, das gar nicht geschickt wird, bleibt `null`.
pruef('kidsAgeBand steht NICHT in der Tabelle — Kinder-Kategorie bleibt leer',
      'kidsAgeBand' not in TAB)

# 🔴 **Der Override (seit 2026-10-20): 13+ — nicht weniger, nicht 18+.** Gemessen an Apples
# eigener Ausgabe rechnete Apple bei Chat + nutzergenerierten Inhalten + Social Media
# trotzdem `FOUR_PLUS`; die Annahme "daraus FOLGT 13+" (siehe oben) war falsch. Der Override
# ist die einzige Stelle, an der die Altersfreigabe wirklich 13+ wird.
#   · NICHT weniger: Die Mindestgrenze der App ist 14, ein 4+ beschriftet sie falsch.
#   · NICHT 18+: Ian ist 17 und dürfte seine eigene App nicht laden.
pruef('ageRatingOverrideV2 steht auf THIRTEEN_PLUS oder SIXTEEN_PLUS — nie NONE, nie 18+',
      TAB.get('ageRatingOverrideV2') in ('THIRTEEN_PLUS', 'SIXTEEN_PLUS'),
      f"steht auf {TAB.get('ageRatingOverrideV2')!r}")

# Und die Inhaltsfragen sagen alle „keine". Gezaehlt statt aufgezaehlt: Eine Liste
# von Namen merkt nicht, wenn eine Frage dazukommt (dieselbe Lehre wie bei den
# Paketen in Abschnitt 2).
inhalt = {f: w for f, w in TAB.items() if f not in (
    'userGeneratedContent', 'messagingAndChat', 'socialMedia',
    'socialMediaAgeRestricted', 'ageAssurance', 'parentalControls',
    'ageRatingOverride', 'ageRatingOverrideV2')}
laut = [f for f, w in inhalt.items() if w not in ('NONE', False)]
pruef(f'Alle {len(inhalt)} Inhaltsfragen stehen auf „keine"', not laut,
      f'nicht auf keine: {laut}')

print('')
print('── 7. Gegenprobe: merkt Abschnitt 6 eine falsche Antwort? ──────────────')
# *Eine Pruefung, die nichts vorfindet, sieht aus wie eine Pruefung, die tut.*
# Also einmal eine falsche Tabelle bauen und nachsehen, ob sie auffaellt.
with tempfile.TemporaryDirectory() as tmp:
    gefaelscht = pathlib.Path(tmp) / 'gefaelscht.py'
    gefaelscht.write_text(
        "ALTERSFREIGABE = {\n"
        "    'userGeneratedContent': False,\n"   # die Luege, die 13+ kippen wuerde
        "    'advertising': True,\n"             # und die, die Apple aergern wuerde
        "    'kidsAgeBand': 'FIVE_AND_UNDER',\n" # und die Zusage, die keine Antwort ist
        "}\n")
    falsch = tabelle_aus(gefaelscht)
    pruef('Eine gefaelschte Tabelle wird ueberhaupt gelesen', falsch is not None)
    pruef('… userGeneratedContent=False faellt auf', falsch.get('userGeneratedContent') is not True)
    pruef('… advertising=True faellt auf', falsch.get('advertising') is not False)
    pruef('… ein gesetztes kidsAgeBand faellt auf', 'kidsAgeBand' in falsch)

print('')
print(f'  {JA} Häkchen, {NEIN} Kreuze')
sys.exit(1 if NEIN else 0)
