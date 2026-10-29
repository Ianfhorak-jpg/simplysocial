#!/usr/bin/env python3
# ══════════════════════════════════════════════════════════════════════════════
#  JEDER SCREEN HAT EINEN BODEN — Guideline 4, aus ACTAs Ablehnung gelernt
#
#  Aufruf: npm run pruef-boden   (braucht nichts: kein Server, kein Gerät)
#
#  ── Wozu ────────────────────────────────────────────────────────────────────
#  Am 2026-09-22 hat Apple ACTA (Projekt 17) abgelehnt:
#
#      Guideline 4 — Design
#      „The login screen was not entirely visible."
#
#  Prüfgerät: iPad Air 11". ACTA ist iPhone-only, läuft auf iPadOS aber in einem
#  VERÄNDERBAREN Fenster — und der Nicht-Scroll-Zweig seiner Screen-Hülle schnitt
#  alles ab, was höher war als das Fenster. Die Knöpfe waren unerreichbar.
#
#  **SimplySocial war am 2026-09-26 Zeichen für Zeichen gleich konfiguriert:**
#  `supportsTablet: false`, `TARGETED_DEVICE_FAMILY = 1`,
#  `UIRequiresFullScreen = false`, Portrait-Sperre. Die Portrait-Sperre hat ACTA
#  nicht gerettet.
#
#  ── Was hier bewacht wird, und was NICHT ────────────────────────────────────
#  Bewacht wird die UMKEHRUNG der Voreinstellung: `SsScreen` rettet von selbst,
#  `scrolltSelbst` ist die Ausnahme für Screens mit eigener Liste oder
#  Gestenfläche. ACTAs Lehre war: *„Eine Prop, die Rettung ANBIETET, rettet nur
#  die, die sie setzen."* Ein Wächter, der nur zählt, wie viele `scroll` setzen,
#  hätte genau diese Lehre wieder verfehlt.
#
#  NICHT bewacht wird, ob es auf einem echten iPad gut AUSSIEHT. Das sagt ein
#  Bild, kein Textvergleich (dieselbe Grenze wie bei allen Wächtern hier).
# ══════════════════════════════════════════════════════════════════════════════
import pathlib, plistlib, re, sys, tempfile

WURZEL = pathlib.Path(__file__).resolve().parents[2]
QUELLE = WURZEL / 'src'
HUELLE = QUELLE / 'components' / 'ui' / 'SsScreen.tsx'

JA = NEIN = 0


def pruef(text, ok, dazu=''):
    global JA, NEIN
    if ok:
        print(f'  ✓ {text}'); JA += 1
    else:
        print(f'  ✗ {text}' + (f'  ({dazu})' if dazu else '')); NEIN += 1


def ohne_kommentare(text):
    """Blockkommentare und Zeilenkommentare entfernen.

    ⚠️ Zweimal in drei Tagen hat in diesem Projekt ein Wächter an der eigenen
    BEGRÜNDUNG rot gemacht, weil er sie für den Verstoss hielt. Hier stehen
    `<SsScreen …>`-Beispiele in mehreren Kommentaren — ohne diesen Schritt
    zählte der Wächter sie mit.
    """
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.S)
    return '\n'.join(z for z in text.splitlines() if not z.strip().startswith(('//', '*')))


print('── 1. Die Hülle rettet von SELBST ──────────────────────────────────────')
h = HUELLE.read_text()
hc = ohne_kommentare(h)
pruef('`SsScreen` kennt die Ausnahme `scrolltSelbst`', 'scrolltSelbst?: boolean' in h)
pruef('… und nimmt sie auch entgegen', re.search(r'\n\s*scrolltSelbst,', hc) is not None)
# DIE Zeile, an der alles hängt: Gerettet wird, solange NICHT ausdrücklich
# widersprochen wird. Stünde hier `if (!scroll)`, wäre die alte Lage zurück.
pruef('Der Rettungszweig greift bei `!scroll && !scrolltSelbst`',
      re.search(r'if \(!scroll && !scrolltSelbst\)', hc) is not None,
      'die Voreinstellung ist wieder „keine Rettung"')
pruef('Er zeichnet eine `ScrollView`, keinen nackten `View`',
      re.search(r'if \(!scroll && !scrolltSelbst\)[\s\S]{0,600}?<ScrollView', hc) is not None)
pruef('… mit `flexGrow: 1` im Inhalt (sonst gäbe es nie etwas zu scrollen)',
      'wachsen: { flexGrow: 1 }' in hc)

print('')
print('── 2. Keine Liste ohne `scrolltSelbst` ─────────────────────────────────')
# Eine FlatList in einer ScrollView verliert ihre Virtualisierung und waechst
# ins Unendliche — der klassische Bruch bei genau diesem Umbau. ACTA konnte den
# Fall ausschliessen (seine Listen liefen nicht durch die Huelle), SimplySocial
# nicht: hier tun es sieben.
offen = []
gesamt = 0
for p in sorted(QUELLE.rglob('*.tsx')):
    roh = p.read_text(errors='ignore')
    inhalt = ohne_kommentare(roh)
    if not re.search(r'<(FlatList|SectionList)\b', inhalt):
        continue
    for treffer in re.finditer(r'<SsScreen\b[^>]*>', inhalt):
        gesamt += 1
        if 'scrolltSelbst' not in treffer.group(0) and 'scroll' not in treffer.group(0):
            # Nur melden, wenn zwischen dieser Huelle und ihrem Ende wirklich
            # eine Liste steht — eine Fehlerseite in derselben Datei ist harmlos.
            rest = inhalt[treffer.end():]
            ende = rest.find('</SsScreen>')
            if ende > 0 and re.search(r'<(FlatList|SectionList)\b', rest[:ende]):
                zeile = inhalt[:treffer.start()].count('\n') + 1
                offen.append(f'{p.relative_to(WURZEL)}:{zeile}')
pruef(f'Alle Hüllen um eine Liste tragen `scrolltSelbst` ({gesamt} geprüft)',
      not offen, '; '.join(offen))

print('')
print('── 3. Der Anmelde-Bildschirm — der erste, den Apple sieht ──────────────')
# Er laeuft NICHT durch `SsScreen` (er ist der Torwaechter selbst) und braucht
# seine Rettung deshalb eigenhaendig.
a = ohne_kommentare((QUELLE / 'components' / 'Anmelden.tsx').read_text())
pruef('`Anmelden.tsx` liegt in einer `ScrollView`', '<ScrollView' in a)
pruef('… und zentriert über `contentContainerStyle`, nicht über `style`',
      re.search(r'contentContainerStyle=\{\[\s*styles\.inhalt', a) is not None,
      'auf einer ScrollView wirkt justifyContent im `style` nicht auf den Inhalt')
pruef('… der Inhalt wächst (`flexGrow: 1`)', re.search(r'inhalt: \{\s*flexGrow: 1', a) is not None)
pruef('… und ist weiterhin mittig', re.search(r'inhalt: \{[^}]*justifyContent', a) is not None)

print('')
print('── 4. Die Lage, die den Fehler überhaupt möglich macht ─────────────────')
# Sie ist kein Fehler — aber sie ist die VORAUSSETZUNG. Aendert sie sich,
# aendert sich auch, wie streng Abschnitt 1 bis 3 sein muessen.
plist = WURZEL / 'ios' / 'SimplySocial' / 'Info.plist'
if plist.exists():
    d = plistlib.load(open(plist, 'rb'))
    pruef('`UIRequiresFullScreen` steht auf false — die App ist fenstrig',
          d.get('UIRequiresFullScreen') is False,
          f"steht auf {d.get('UIRequiresFullScreen')} — dann ist Abschnitt 1–3 "
          f"vielleicht gar nicht mehr nötig, aber das gehört GEPRÜFT")
else:
    print('  · `ios/` fehlt (CNG, git-ignoriert) — diese Zeile hat NICHTS geprüft.')

print('')
print('── 5. Gegenprobe: merkt Abschnitt 1 die alte Lage? ─────────────────────')
# *Eine Regel, die nichts vorfindet, sieht aus wie eine Regel, die tut.*
with tempfile.TemporaryDirectory() as tmp:
    alt = pathlib.Path(tmp) / 'alt.tsx'
    alt.write_text('if (!scroll) {\n  return <View style={styles.fill} />;\n}\n')
    altc = ohne_kommentare(alt.read_text())
    pruef('Der alte Zweig `if (!scroll)` fällt durch',
          re.search(r'if \(!scroll && !scrolltSelbst\)', altc) is None)
    pruef('… und ein nackter `View` ebenfalls', '<ScrollView' not in altc)


# ══════════════════════════════════════════════════════════════════════════════
#  iOS 27: der UIScene-Lebenszyklus — Apples Ablehnung vom 2026-10-21 (2.1(a))
# ══════════════════════════════════════════════════════════════════════════════
print('')
print('── iOS 27: Szenen-Lebenszyklus und was am wegwerfbaren ios/-Ordner hängt ──')

# 🔴 **Build 6 stürzte bei Apple beim Start ab** (iPad Air 11", iPadOS 27.0.1,
# `EXC_BREAKPOINT`/SIGTRAP in `___UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`).
# Es war KEIN JavaScript-Fehler: iOS 27 beendet jede App ohne Szenen-Lebenszyklus, die mit dem
# iOS-27-SDK gebaut wurde — auf JEDEM Gerät mit iOS 27, nicht nur auf dem iPad. Auf iOS 26 (Ians
# iPhone) ist es nur eine Warnung im Log, deshalb hat es nie jemand gesehen.
#
# Der Bauplan steht in `app.json`, weil `ios/` git-ignoriert ist und `expo prebuild` es jedes
# Mal NEU erzeugt (selbst ohne `--clean`: „Cleared ios code"). Alles, was nur im ios/-Ordner
# stand, ist dabei weg — auch die Team-ID und `PrivacyInfo.xcprivacy`.
import json
APP = json.loads((WURZEL / 'app.json').read_text(encoding='utf-8'))['expo']
PAKET = json.loads((WURZEL / 'package.json').read_text(encoding='utf-8'))

def plugin(name):
    for p in APP.get('plugins', []):
        if (p if isinstance(p, str) else p[0]) == name:
            return {} if isinstance(p, str) else (p[1] if len(p) > 1 else {})
    return None

bp = plugin('expo-build-properties')
pruef('`expo-build-properties` steht unter plugins', bp is not None,
      'ohne das Plugin erzeugt `expo prebuild` kein Szenen-Manifest — iOS 27 beendet die App beim Start')
pruef('… mit `ios.enableSceneSupport: true`',
      bool(bp) and (bp.get('ios') or {}).get('enableSceneSupport') is True,
      'Expo SDK 57 hat das als Opt-in; ab SDK 58 ist es Standard und das Häkchen entfällt')

# Expo selbst: SDK 57 kann mit Xcode 27 erst ab 57.0.23 bauen (Maintainer, expo/expo#46664).
m = re.search(r'(\d+)\.(\d+)\.(\d+)', PAKET['dependencies'].get('expo', ''))
ver = tuple(int(x) for x in m.groups()) if m else (0, 0, 0)
pruef(f'`expo` ist mindestens 57.0.23 (steht: {PAKET["dependencies"].get("expo")})',
      ver >= (57, 0, 23) or ver[0] >= 58,
      'vorher fehlt die Laufzeit-Unterstützung (EXExpoAppSceneDelegate)')

# Was früher im ios/-Ordner von Hand stand und beim Neuerzeugen verschwand:
pruef('`ios.appleTeamId` ist gesetzt (sonst fehlt DEVELOPMENT_TEAM nach jedem prebuild)',
      bool(APP['ios'].get('appleTeamId')))
pm = APP['ios'].get('privacyManifests') or {}
sorten = {t.get('NSPrivacyAccessedAPIType') for t in pm.get('NSPrivacyAccessedAPITypes', [])}
pruef('Das Datenschutz-Manifest steht in `ios.privacyManifests` (3 Zugriffsgründe, wie Build 6)',
      sorten >= {'NSPrivacyAccessedAPICategoryFileTimestamp',
                 'NSPrivacyAccessedAPICategoryUserDefaults',
                 'NSPrivacyAccessedAPICategorySystemBootTime'} and pm.get('NSPrivacyTracking') is False,
      f'steht: {sorted(x for x in sorten if x)}')

# Die Gegenprobe ist KEINE Zeile in dieser Datei, sondern ein Lauf: `enableSceneSupport` in app.json auf
# false stellen und diesen Prüfstand fahren — er wird rot (am 2026-10-23 gesehen).

print('')
print(f'  {JA} Häkchen, {NEIN} Kreuze')
sys.exit(1 if NEIN else 0)
