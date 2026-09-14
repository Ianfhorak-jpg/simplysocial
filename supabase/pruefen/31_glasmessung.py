#!/usr/bin/env python3
# ══════════════════════════════════════════════════════════════════════════════
#  DAS MESSGERÄT BEWACHEN — Phase 22, Teil 3
#
#  Aufruf: npm run pruef-glas   (braucht nichts: keine Datenbank, kein Gerät,
#                                keinen Simulator, keine Bildbibliothek)
#
#  ── Wozu ────────────────────────────────────────────────────────────────────
#  `scripts/glasmessung.py` liefert die Zahl, an der diese ganze Phase hängt:
#  **die Abhebung einer Glasfläche von ihrem Untergrund.** Ians Vorbild hebt sich
#  um 33,2 Helligkeitsstufen ab, SimplySocial um 3,3, Ziel ist ≥ 25.
#
#  Eine Zahl aus einem ungeprüften Messgerät ist keine Aussage, sondern eine
#  Behauptung mit Nachkommastelle. Und die gefährliche Form steht wörtlich als
#  Risiko 3 im Plan: *ein Bild, das aussieht wie ein Ergebnis* — und Claude
#  urteilt darauf und iteriert.
#
#  ── Warum SELBSTGEBAUTE Bilder und nicht die Belege ─────────────────────────
#  Der Plan sah vor, die bekannten Zahlen an den bekannten Screenshots zu
#  reproduzieren (33,2 am Vorbild, 3,3 an `z02-ios-kapsel-glas.png`). **Das geht
#  nicht, und der Grund ist lehrreich:** In PLAN.md steht das ERGEBNIS, aber nicht,
#  über welchen Rechtecken es gemessen wurde. Wer die Rechtecke sucht, bis 33,2
#  herauskommt, hat eine Kurve angepasst und nichts geprüft.
#
#  Deshalb misst dieser Prüfstand an Bildern, deren Antwort **vorher ausgerechnet**
#  ist. Zwei Flächen mit bekannter Farbe:
#
#      dunkel (20, 22, 26) → 0.299·20 + 0.587·22 + 0.114·26 = 21.858
#      hell   (70, 74, 82) → 0.299·70 + 0.587·74 + 0.114·82 = 73.716
#      Abhebung                                             = 51.858
#
#  Die Zahlen aus den Screenshots bleiben trotzdem prüfbar — nur als ANDERE Frage,
#  siehe Abschnitt 4: Lässt sich jedes Beleg-Bild überhaupt lesen?
#
#  ── Die Gegenprobe gegen sich selbst ────────────────────────────────────────
#  *Ein Pixelvergleich braucht eine Gegenprobe GEGEN SICH SELBST* (FALLEN.md).
#  Ein Testbild, das auch bei kaputtem Decoder grün leuchtet, prüft nichts.
#  Abschnitt 3 baut den Fehler deshalb absichtlich ein und verlangt, dass die
#  Zahl DANN abweicht.
# ══════════════════════════════════════════════════════════════════════════════
import pathlib, struct, sys, tempfile, zlib

WURZEL = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(WURZEL / 'scripts'))
import glasmessung  # noqa: E402

JA = NEIN = 0
def pruef(text, ok, dazu=''):
    global JA, NEIN
    if ok:
        print(f'  ✓ {text}'); JA += 1
    else:
        print(f'  ✗ {text}' + (f'  ({dazu})' if dazu else '')); NEIN += 1


# ══════════════════════════════════════════════════════════════════════════════
#  Der Bildbauer — die Umkehrung von `png_lesen`
# ══════════════════════════════════════════════════════════════════════════════

DUNKEL, HELL = (20, 22, 26), (70, 74, 82)
H_DUNKEL, H_HELL = 21.858, 73.716

def _chunk(art, inhalt):
    return (struct.pack('>I', len(inhalt)) + art + inhalt
            + struct.pack('>I', zlib.crc32(art + inhalt) & 0xFFFFFFFF))

def testbild(pfad, breite=200, hoehe=100, tiefe=8, farbtyp=2, filter_plan=(0,),
             links=DUNKEL, rechts=HELL):
    """Linke Hälfte DUNKEL, rechte Hälfte HELL. Jede Zeile ein anderer PNG-Filter.

    ⚠️ Das untere Byte eines 16-Bit-Wertes ist ABSICHTLICH ein anderer Wert.
    Der naheliegende Weg wäre `wert * 257` — dabei sind oberes und unteres Byte
    aber gleich (20 · 257 = 0x1414), und eine falsche Filter-Schrittweite fiele
    nicht auf. Das Testbild muss den Fehler ERZWINGEN, den es sucht
    (harte Regel 92).
    """
    kanaele = 3 if farbtyp == 2 else 4
    breite_byte = tiefe // 8
    bpp = kanaele * breite_byte

    zeilen = []
    for _ in range(hoehe):
        z = bytearray()
        for x in range(breite):
            f = links if x < breite // 2 else rechts
            for k in range(kanaele):
                wert = f[k] if k < 3 else 255          # Alpha, falls Typ 6
                if breite_byte == 1:
                    z.append(wert)
                else:
                    z += bytes([wert, (wert * 37 + 11) & 0xFF])
        zeilen.append(z)

    roh, vorher = bytearray(), bytearray(len(zeilen[0]))
    for y, z in enumerate(zeilen):
        filt = filter_plan[y % len(filter_plan)]
        aus = bytearray()
        for i in range(len(z)):
            a = z[i - bpp] if i >= bpp else 0
            b = vorher[i]
            c = vorher[i - bpp] if i >= bpp else 0
            if filt == 0:   v = z[i]
            elif filt == 1: v = z[i] - a
            elif filt == 2: v = z[i] - b
            elif filt == 3: v = z[i] - (a + b) // 2
            else:
                pp = a + b - c
                pa, pb, pc = abs(pp - a), abs(pp - b), abs(pp - c)
                v = z[i] - (a if pa <= pb and pa <= pc else b if pb <= pc else c)
            aus.append(v & 0xFF)
        roh += bytes([filt]) + aus
        vorher = z

    ihdr = struct.pack('>IIBBBBB', breite, hoehe, tiefe, farbtyp, 0, 0, 0)
    pfad.write_bytes(b'\x89PNG\r\n\x1a\n' + _chunk(b'IHDR', ihdr)
                     + _chunk(b'IDAT', zlib.compress(bytes(roh))) + _chunk(b'IEND', b''))
    return pfad


def miss(pfad):
    """Gibt (links, rechts, abhebung) zurück — die drei Zahlen, um die es geht."""
    b, h, px = glasmessung.png_lesen(str(pfad))
    l = glasmessung.feld_messen(px, b, h, 0, 0, b // 2, h)
    r = glasmessung.feld_messen(px, b, h, b // 2, 0, b // 2, h)
    return l['hell'], r['hell'], abs(l['hell'] - r['hell'])


with tempfile.TemporaryDirectory() as tmp:
    t = pathlib.Path(tmp)

    # ══════════════════════════════════════════════════════════════════════════
    print('── 1. Der Rechenkern trifft die vorher ausgerechneten Zahlen ───────────')
    # ══════════════════════════════════════════════════════════════════════════
    # Die Helligkeit ist Rec. 601 und NICHT der Mittelwert der drei Kanäle —
    # Grün trägt für das Auge weit mehr bei als Blau. Die Zahlen in PLAN.md sind
    # so gerechnet; eine andere Formel machte sie unvergleichbar.
    for name, tiefe, farbtyp in (('8 Bit RGB',  8, 2),
                                 ('8 Bit RGBA', 8, 6),
                                 ('16 Bit RGB', 16, 2),
                                 ('16 Bit RGBA', 16, 6)):
        p = testbild(t / f'k{tiefe}-{farbtyp}.png', tiefe=tiefe, farbtyp=farbtyp)
        li, re_, ab = miss(p)
        pruef(f'{name}: dunkel {li:.3f} · hell {re_:.3f} · Abhebung {ab:.3f}',
              abs(li - H_DUNKEL) < 0.001 and abs(re_ - H_HELL) < 0.001,
              f'erwartet {H_DUNKEL} / {H_HELL}')

    # 16 Bit ist kein exotischer Sonderfall: Ians Vorbild IST so gespeichert.
    # Die erste Gegenprobe (2026-09-14) scheiterte genau daran — das Werkzeug
    # konnte die eine Datei nicht lesen, an der es sich beweisen sollte.

    print('')
    # ══════════════════════════════════════════════════════════════════════════
    print('── 2. Alle fünf PNG-Filter ergeben dasselbe Bild ───────────────────────')
    # ══════════════════════════════════════════════════════════════════════════
    # Ohne korrekte Filter-Rückrechnung ist jede Zeile Müll — und zwar Müll, der
    # plausibel aussieht, weil die Bytes im gültigen Wertebereich liegen.
    for tiefe in (8, 16):
        for filt in range(5):
            p = testbild(t / f'f{tiefe}-{filt}.png', tiefe=tiefe, filter_plan=(filt,))
            li, _, ab = miss(p)
            pruef(f'{tiefe} Bit, Filter {filt}: Abhebung {ab:.3f}',
                  abs(ab - (H_HELL - H_DUNKEL)) < 0.001, f'erwartet {H_HELL - H_DUNKEL}')
    p = testbild(t / 'gemischt.png', tiefe=16, filter_plan=(0, 1, 2, 3, 4))
    li, _, ab = miss(p)
    pruef(f'16 Bit, alle fünf Filter gemischt: Abhebung {ab:.3f}',
          abs(ab - (H_HELL - H_DUNKEL)) < 0.001)

    print('')
    # ══════════════════════════════════════════════════════════════════════════
    print('── 3. Die Gegenprobe gegen sich selbst ─────────────────────────────────')
    # ══════════════════════════════════════════════════════════════════════════
    # Ein Testbild, das auch bei kaputtem Decoder grün leuchtet, prüft nichts.
    # Hier wird der behobene Fehler ABSICHTLICH wieder eingebaut: die Filter mit
    # `kanaele` als Schrittweite statt `bpp`. Bei 16 Bit holt das den linken
    # Nachbarn aus der MITTE eines Samples.
    quelle = (WURZEL / 'scripts' / 'glasmessung.py').read_text()
    kaputt = (quelle
              .replace('bpp = kanaele * breite_byte', 'bpp_echt = kanaele * breite_byte')
              .replace('zeilenbreite = breite * bpp',
                       'zeilenbreite = breite * bpp_echt\n    bpp = kanaele')
              .replace('pixel.append([tuple(zeile[x * bpp + k * breite_byte]',
                       'pixel.append([tuple(zeile[x * bpp_echt + k * breite_byte]'))
    pruef('Der Fehler ließ sich überhaupt einbauen (die Zeilen stehen noch so da)',
          kaputt != quelle, 'glasmessung.py wurde umgebaut — diesen Abschnitt nachziehen')

    raum = {}
    exec(compile(kaputt, '<glasmessung mit absichtlichem Fehler>', 'exec'), raum)
    b, h, px = raum['png_lesen'](str(t / 'gemischt.png'))
    falsch = raum['feld_messen'](px, b, h, 0, 0, b // 2, h)['hell']
    pruef(f'Mit falscher Schrittweite kommt {falsch:.3f} statt {H_DUNKEL} heraus',
          abs(falsch - H_DUNKEL) > 5,
          'das Testbild erzwingt den Fehler NICHT — es prüft nichts')

    print('')
    # ══════════════════════════════════════════════════════════════════════════
    print('── 4. Die Wächter weisen ab, statt still falsch zu rechnen ─────────────')
    # ══════════════════════════════════════════════════════════════════════════
    # Ein Format, das nicht unterstützt wird, MUSS abbrechen. Rechnet es weiter,
    # liegen die Werte im gültigen Bereich und sehen aus wie ein Ergebnis.
    def bricht_ab(pfad):
        try:
            glasmessung.png_lesen(str(pfad))
            return False
        except SystemExit:
            return True

    (t / 'keinpng.png').write_bytes(b'Das ist kein PNG.' * 20)
    pruef('Eine Datei ohne PNG-Kopf bricht ab', bricht_ab(t / 'keinpng.png'))

    # Farbtyp 3 (Palette) — kommt aus Bildbearbeitungsprogrammen, nicht aus simctl.
    p = t / 'palette.png'
    ihdr = struct.pack('>IIBBBBB', 4, 4, 8, 3, 0, 0, 0)
    p.write_bytes(b'\x89PNG\r\n\x1a\n' + _chunk(b'IHDR', ihdr)
                  + _chunk(b'PLTE', b'\x00\x00\x00') + _chunk(b'IDAT', zlib.compress(b'\x00' * 20))
                  + _chunk(b'IEND', b''))
    pruef('Ein Paletten-PNG (Typ 3) bricht ab', bricht_ab(p))

    # Adam7. Sieben Durchgänge mit je eigener Zeilenbreite; wer es wie ein normales
    # liest, bekommt verschobene Streifen — mit plausiblen Mittelwerten.
    p = t / 'adam7.png'
    ihdr = struct.pack('>IIBBBBB', 8, 8, 8, 2, 0, 0, 1)
    p.write_bytes(b'\x89PNG\r\n\x1a\n' + _chunk(b'IHDR', ihdr)
                  + _chunk(b'IDAT', zlib.compress(b'\x00' * 200)) + _chunk(b'IEND', b''))
    pruef('Ein Adam7-verschränktes PNG bricht ab', bricht_ab(p))

    # Ein Feld außerhalb des Bildes ist ein Tippfehler in den Koordinaten und
    # darf nicht als 0 durchgehen.
    b, h, px = glasmessung.png_lesen(str(t / 'gemischt.png'))
    try:
        glasmessung.feld_messen(px, b, h, 9999, 9999, 10, 10)
        draussen = False
    except SystemExit:
        draussen = True
    pruef('Ein Feld außerhalb des Bildes bricht ab', draussen)

    print('')
    # ══════════════════════════════════════════════════════════════════════════
    print('── 5. Die Schwarzbild-Erkennung ────────────────────────────────────────')
    # ══════════════════════════════════════════════════════════════════════════
    # ⚠️ Diese Prüfung wird mit dem Dunkelmodus ZWINGEND. Bisher galt „weiß = App,
    # schwarz = Fehler" — ein schlafender Mac-Bildschirm macht schwarze Bilder,
    # und das war eindeutig. **In einer dunklen App ist „fast alles schwarz" ein
    # plausibler App-Zustand.** An die Stelle der Helligkeit tritt die Zahl der
    # VERSCHIEDENEN Farben: Ein echter Screenshot hat tausende, ein Fehlbild eine.
    schwarz = testbild(t / 'schwarz.png', filter_plan=(0, 1, 2, 3, 4),
                       links=(0, 0, 0), rechts=(0, 0, 0))
    b, h, px = glasmessung.png_lesen(str(schwarz))
    k = glasmessung.bild_kennzahlen(px, b, h)
    pruef(f'Ein einfarbig schwarzes Bild zählt {k["farben"]} Farbe(n)', k['farben'] == 1)

    b, h, px = glasmessung.png_lesen(str(t / 'gemischt.png'))
    k2 = glasmessung.bild_kennzahlen(px, b, h)
    pruef(f'Das Testbild mit zwei Flächen zählt {k2["farben"]}', k2['farben'] == 2)

    # ── Der zweite Fehlbild-Fall, und er ist beim ERSTEN Lauf durchgerutscht ──
    # Ein Debug-Build ohne Metro zeigt den roten React-Native-Kasten. Das Bild
    # hatte **822 Farben** und kam glatt durch die Farbzählung — es sah aus wie
    # ein Ergebnis und war keines. Risiko 3 aus dem Plan, eingetreten.
    rot = testbild(t / 'rot.png', filter_plan=(0, 1, 2, 3, 4),
                   links=(216, 58, 69), rechts=(216, 58, 69))
    b, h, px = glasmessung.png_lesen(str(rot))
    kr = glasmessung.bild_kennzahlen(px, b, h)
    pruef(f'Eine Fläche in React-Native-Fehlerrot meldet {kr["rot"]:.0f} % rot',
          kr['rot'] >= 15)
    pruef(f'Das Testbild aus Abschnitt 1 meldet {k2["rot"]:.0f} % rot',
          k2['rot'] < 1, 'Fehlalarm — die Schwelle trifft normale Flächen')

    # Die Gegenprobe an ECHTEN App-Bildern: Rot ist in SimplySocial die Farbe
    # `danger`, aber nie als Fläche über ein Drittel des oberen Bildschirms.
    for beleg in ('z02-ios-kapsel-glas.png', 'ae08-bezirk-vollbild-ios.png'):
        bp = WURZEL.parent / '_belege' / beleg
        if bp.exists():
            b, h, px = glasmessung.png_lesen(str(bp))
            ke = glasmessung.bild_kennzahlen(px, b, h)
            pruef(f'{beleg:32} meldet {ke["rot"]:.2f} % rot', ke['rot'] < 1)

    # Und die Zählung muss wirklich ABBRECHEN, nicht nur so heißen: Ein Set über
    # 1,5 Mio. Bildpunkte kostet Zeit und Speicher ohne Erkenntnisgewinn — die
    # Frage ist beantwortet, sobald die Antwort „viele" lautet.
    belege = WURZEL.parent / '_belege'
    echt = belege / 'z02-ios-kapsel-glas.png'
    if echt.exists():
        b, h, px = glasmessung.png_lesen(str(echt))
        k3 = glasmessung.bild_kennzahlen(px, b, h)
        pruef(f'Ein echter Screenshot zählt {k3["farben"]}+ und bricht ab',
              k3['viele'] and k3['farben'] == 5000, 'die Zählung läuft weiter')
        # Die mittlere Helligkeit muss über ALLE Punkte laufen, nicht nur bis zum
        # Abbruch — sonst wäre sie der Mittelwert des oberen Bildrands.
        pruef(f'… und die mittlere Helligkeit ({k3["hell"]:.1f}) passt zum hellen Stand',
              k3['hell'] > 200, 'z02 ist der helle Stand vor dem Dunkelmodus')
    else:
        pruef('Beleg z02-ios-kapsel-glas.png liegt da', False, str(echt))

    print('')
    # ══════════════════════════════════════════════════════════════════════════
    print('── 6. Jedes Bild, an dem gemessen werden soll, ist LESBAR ──────────────')
    # ══════════════════════════════════════════════════════════════════════════
    # Das ist die Frage, an der die erste Gegenprobe scheiterte — nicht an einer
    # Zahl, sondern am Format. Sie steht hier, damit sie nicht wieder erst beim
    # Messen auffällt.
    for rel in ('vorbild-liquid-glass-bierbuddy.png',
                '_belege/z02-ios-kapsel-glas.png',
                '_belege/ae06-glas-kapsel-auf-karte-ios.png',
                '_belege/ae07-vorbild-kapsel-zum-vergleich.png'):
        p = WURZEL.parent / rel
        if not p.exists():
            pruef(f'{rel} liegt da', False); continue
        kopf = p.read_bytes()[16:29]
        bb, hh, tiefe, farbtyp = struct.unpack('>IIBB', kopf[:10])
        try:
            glasmessung.png_lesen(str(p))
            ok, warum = True, ''
        except SystemExit as e:
            ok, warum = False, str(e)
        pruef(f'{rel.split("/")[-1]:42} {bb}×{hh}, Typ {farbtyp}, {tiefe} Bit', ok, warum)

print('')
print(f'  {JA} Häkchen, {NEIN} Kreuze')
sys.exit(1 if NEIN else 0)
