#!/usr/bin/env python3
"""
Das Messgerät — wie stark hebt sich eine Glasfläche von ihrem Untergrund ab?

Aufruf:
    python3 scripts/glasmessung.py <bild.png> --feld kapsel x,y,b,h --feld grund x,y,b,h
    python3 scripts/glasmessung.py <bild.png>                    # nur Kennzahlen des Bildes
    npm run pruef-glas                                           # die Gegenprobe

── Warum es dieses Werkzeug gibt ────────────────────────────────────────────
Ians Satz am 2026-09-14: *„ICH WILL LIQUID GLASS VON APPLE DIREKT NICHT VON DIR
NACHGEBAUT."* Der Befund war, dass es Apples echtes Glas IST — es ist nur
unsichtbar, weil hinter jeder Glasfläche Papierweiß liegt. Glas zeigt sich als
UNTERSCHIED zum Untergrund, und wo keiner ist, ist auch kein Glas zu sehen.

Damit ist der Erfolg dieser Phase eine ZAHL und kein Gefühl:

    Ians Vorbild (dunkle Karte)      33,2 Helligkeitsstufen Abhebung
    SimplySocial, Startbildschirm     3,3
    SimplySocial über der Karte       1,5
    Ziel nach dem Dunkelmodus        ≥ 25

Ohne dieses Werkzeug gäbe es kein „fertig", nur „sieht dunkler aus".

── Die Methode ist geliehen, und zwar bewusst ──────────────────────────────
`supabase/pruefen/94_altersfreigabe.py` beginnt mit dem Abschnitt „0. Zuerst das
Messgerät" und begründet: *eine Suche mit null Treffern beweist nichts.* Hier gilt
dasselbe zum Quadrat. **Deshalb muss dieses Werkzeug zuerst die BEKANNTEN Zahlen
treffen** — 33,2 am Vorbild, 3,3 am heutigen Stand (`npm run pruef-glas`). Erst
wenn es die reproduziert, ist eine neue Zahl eine Aussage und keine Behauptung.

── Warum keine Bildbibliothek ──────────────────────────────────────────────
PNG wird mit `zlib` und `struct` aus der Standardbibliothek dekodiert. Eine neue
Abhängigkeit wäre hier teurer als sie aussieht: `supabase/pruefen/94_altersfreigabe.py`
zählt die Einträge in `package.json['dependencies']` und vergleicht sie mit der Zahl
in `_FUER_IAN/ALTERSFREIGABE.md` — jedes neue Paket macht `npm run pruef-alter` rot
und verlangt die Frage „sammelt es Daten?". Für eine Mittelwertbildung über ein
Rechteck lohnt das nicht.
"""
import sys, zlib, struct


# ═════════════════════════════════════════════════════════════════════════════
#  PNG lesen
# ═════════════════════════════════════════════════════════════════════════════

def png_lesen(pfad):
    """Gibt (breite, hoehe, pixel) zurück; pixel[y][x] = (r, g, b).

    Unterstützt Farbtyp 2 (RGB) und 6 (RGBA), 8 **und 16** Bit. Ein anderer Typ
    bricht mit einer Meldung ab, die sagt WAS es ist, statt still etwas Falsches zu
    rechnen.

    ⚠️ **16 Bit ist kein Sonderfall, sondern Ians Vorbild.** Die erste Gegenprobe
    dieses Werkzeugs (2026-09-14) scheiterte nicht an einer Zahl, sondern am Format:
    `vorbild-liquid-glass-bierbuddy.png` ist **1179×2556, Farbtyp 2, 16 Bit** — so
    speichert ein iPhone einen Screenshot in P3. Das Werkzeug konnte die eine Datei
    nicht lesen, an der es sich beweisen sollte.

    Der gefährliche Teil steckt in der FILTER-Schleife, nicht im Auslesen: Die fünf
    PNG-Filter rechnen auf **Bytes**, nicht auf Farbwerten. Bei 16 Bit sind das sechs
    Bytes je Pixel, nicht drei. Wer `kanaele` weiter als Schrittweite nimmt, bekommt
    für Filter 1, 3 und 4 den Vorgänger-Nachbarn aus der Mitte eines Samples — das
    Bild sieht dann verrauscht aus, aber die Werte liegen im gültigen Bereich. Deshalb
    heißt die Schrittweite hier `bpp` und wird getrennt gerechnet.
    """
    with open(pfad, 'rb') as f:
        roh = f.read()
    if roh[:8] != b'\x89PNG\r\n\x1a\n':
        sys.exit(f'✗ Keine PNG-Datei: {pfad}')

    pos, daten, breite, hoehe, farbtyp, tiefe, verschraenkt = 8, b'', 0, 0, None, 0, 0
    while pos < len(roh):
        (laenge,) = struct.unpack('>I', roh[pos:pos + 4])
        art = roh[pos + 4:pos + 8]
        inhalt = roh[pos + 8:pos + 8 + laenge]
        if art == b'IHDR':
            breite, hoehe, tiefe, farbtyp = struct.unpack('>IIBB', inhalt[:10])
            verschraenkt = inhalt[12]
        elif art == b'IDAT':
            daten += inhalt
        elif art == b'IEND':
            break
        pos += 12 + laenge

    if farbtyp not in (2, 6) or tiefe not in (8, 16):
        sys.exit(f'✗ Nur RGB/RGBA mit 8 oder 16 Bit — dieses Bild ist Typ {farbtyp}, {tiefe} Bit.')

    # Adam7. Ein verschränktes PNG liegt in SIEBEN Durchgängen mit je eigener
    # Zeilenbreite da; wer es wie ein normales liest, bekommt ein Bild, das aus
    # verschobenen Streifen besteht — und dessen Mittelwerte trotzdem plausibel
    # aussehen. Weder `simctl io screenshot` noch `screencapture` erzeugen so etwas,
    # deshalb wird es NICHT unterstützt, sondern ABGEWIESEN. Ungeprüft wäre es ein
    # stiller Fehlerpfad, und stille Fehlerpfade sind in diesem Projekt die teuren.
    if verschraenkt:
        sys.exit('✗ Adam7-verschränktes PNG — wird nicht gelesen (siehe Kommentar im Code).')

    kanaele = 3 if farbtyp == 2 else 4
    breite_byte = tiefe // 8          # 1 oder 2 Bytes je Farbwert
    bpp = kanaele * breite_byte       # Schrittweite der FILTER — nicht `kanaele`!
    strom = zlib.decompress(daten)
    zeilenbreite = breite * bpp

    # Die fünf PNG-Filter. Ohne sie ist jede Zeile Müll — und zwar Müll, der
    # plausibel aussieht, weil die Bytes im richtigen Wertebereich liegen.
    pixel, vorher, p = [], bytearray(zeilenbreite), 0
    for _ in range(hoehe):
        filt = strom[p]; p += 1
        zeile = bytearray(strom[p:p + zeilenbreite]); p += zeilenbreite
        for i in range(zeilenbreite):
            a = zeile[i - bpp] if i >= bpp else 0
            b = vorher[i]
            c = vorher[i - bpp] if i >= bpp else 0
            if filt == 1:   zeile[i] = (zeile[i] + a) & 0xFF
            elif filt == 2: zeile[i] = (zeile[i] + b) & 0xFF
            elif filt == 3: zeile[i] = (zeile[i] + (a + b) // 2) & 0xFF
            elif filt == 4:
                pp = a + b - c
                pa, pb, pc = abs(pp - a), abs(pp - b), abs(pp - c)
                zeile[i] = (zeile[i] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 0xFF
        # Bei 16 Bit zählt das OBERE Byte jedes Samples. Das ist keine Rundung im
        # eigentlichen Sinn, sondern genau die Zahl, die ein 8-Bit-Screenshot an
        # derselben Stelle trüge — nur so sind die Werte mit den bisherigen
        # Messungen aus PLAN.md vergleichbar.
        pixel.append([tuple(zeile[x * bpp + k * breite_byte] for k in range(3))
                      for x in range(breite)])
        vorher = zeile
    return breite, hoehe, pixel


# ═════════════════════════════════════════════════════════════════════════════
#  Kennzahlen
# ═════════════════════════════════════════════════════════════════════════════

def helligkeit(p):
    """Wahrgenommene Helligkeit 0–255 (Rec. 601).

    Nicht der arithmetische Mittelwert der drei Kanäle: Grün trägt für das Auge
    weit mehr bei als Blau. Die Zahlen in PLAN.md sind so gerechnet, und eine
    andere Formel hier machte sie unvergleichbar.
    """
    return 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]


def feld_messen(pixel, breite, hoehe, x, y, b, h):
    """Mittelwerte über ein Rechteck. Schneidet am Bildrand ab statt abzustürzen."""
    x2, y2 = min(x + b, breite), min(y + h, hoehe)
    x, y = max(x, 0), max(y, 0)
    if x >= x2 or y >= y2:
        sys.exit(f'✗ Feld liegt außerhalb des Bildes ({breite}×{hoehe}): {x},{y},{b},{h}')
    n = summe = r = g = bl = 0
    for zy in range(y, y2):
        for zx in range(x, x2):
            p = pixel[zy][zx]
            summe += helligkeit(p); r += p[0]; g += p[1]; bl += p[2]; n += 1
    return {'hell': summe / n, 'r': r / n, 'g': g / n, 'b': bl / n, 'n': n}


def bild_kennzahlen(pixel, breite, hoehe):
    """Was das ganze Bild über sich verrät — für die Schwarzbild-Erkennung.

    ⚠️ **Diese Prüfung wird mit dem Dunkelmodus ZWINGEND.** Bisher galt „weiß =
    App, schwarz = Fehler": Ein schlafender Mac-Bildschirm macht `screencapture`-
    Bilder komplett schwarz (Falle aus Phase 19h-2), und das war eindeutig zu
    erkennen. **In einer dunklen App ist „fast alles schwarz" ein plausibler
    App-Zustand.** Die alte Unterscheidung fällt ersatzlos weg, und an ihre Stelle
    tritt die Zahl der VERSCHIEDENEN Farben: Ein echter Screenshot hat tausende,
    ein schwarzes Bild hat eine.
    """
    farben = set()
    summe = 0
    # Jeder vierte Pixel genügt — für „tausende oder eine?" braucht es keine
    # Vollzählung. Bei 5000 ist Schluss: Die Frage ist beantwortet, sobald die
    # Antwort „viele" lautet, und ein Set über 1,5 Mio. Bildpunkte kostet ohne
    # jeden Erkenntnisgewinn Zeit und Speicher.
    #
    # ⚠️ Die Helligkeit muss trotzdem über ALLE Punkte laufen, sonst wäre sie der
    # Mittelwert des oberen Bildrands. Deshalb zwei getrennte Schleifen-Anteile
    # und KEIN gemeinsames `break`.
    genug = False
    for y in range(0, hoehe, 2):
        for x in range(0, breite, 2):
            p = pixel[y][x]
            summe += helligkeit(p)
            if not genug:
                farben.add(p)
                if len(farben) >= 5000:
                    genug = True
    n = len(range(0, hoehe, 2)) * len(range(0, breite, 2))
    return {'farben': len(farben), 'viele': genug, 'hell': summe / n,
            'breite': breite, 'hoehe': hoehe}


# ═════════════════════════════════════════════════════════════════════════════
#  Ausgabe
# ═════════════════════════════════════════════════════════════════════════════

def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__.strip().split('\n\n')[1])

    pfad = sys.argv[1]
    felder = []
    i = 2
    while i < len(sys.argv):
        if sys.argv[i] == '--feld' and i + 2 < len(sys.argv):
            name = sys.argv[i + 1]
            try:
                x, y, b, h = (int(t) for t in sys.argv[i + 2].split(','))
            except ValueError:
                sys.exit(f'✗ Feld „{name}" braucht x,y,b,h als vier ganze Zahlen.')
            felder.append((name, x, y, b, h))
            i += 3
        else:
            i += 1

    breite, hoehe, pixel = png_lesen(pfad)
    k = bild_kennzahlen(pixel, breite, hoehe)

    print(f'  Bild:    {breite}×{hoehe}')
    print(f'  Farben:  {k["farben"]}{"+ (Zählung abgebrochen)" if k["viele"] else ""}')
    print(f'  mittlere Helligkeit: {k["hell"]:.1f}')

    # Die Schwarzbild-Erkennung meldet sich laut und sagt, was zu tun ist —
    # eine Zahl allein würde hier übersehen.
    if k['farben'] < 3:
        print()
        print('  ⚠️  FAST EINFARBIG — das ist wahrscheinlich kein App-Bild.')
        print('     Häufigste Ursache: der Mac-Bildschirm schlief beim Aufnehmen.')
        print('     (Bei einer dunklen App ist schwarz KEIN Beweis mehr für einen Fehler,')
        print('      deshalb zählt hier die Zahl der Farben und nicht die Helligkeit.)')
        return 2

    if not felder:
        return 0

    print()
    gemessen = []
    for name, x, y, b, h in felder:
        m = feld_messen(pixel, breite, hoehe, x, y, b, h)
        stich = m['g'] - m['b']
        print(f'  {name:12} Helligkeit {m["hell"]:6.1f}   '
              f'R{m["r"]:5.1f} G{m["g"]:5.1f} B{m["b"]:5.1f}   '
              f'Grün−Blau {stich:+5.1f}   ({m["n"]} Punkte)')
        gemessen.append((name, m))

    # Die Abhebung — die Zahl, um die es geht.
    if len(gemessen) >= 2:
        (n1, m1), (n2, m2) = gemessen[0], gemessen[1]
        abhebung = abs(m1['hell'] - m2['hell'])
        print()
        print(f'  ► ABHEBUNG {n1} gegen {n2}: {abhebung:.1f} Helligkeitsstufen')
        print(f'    (Ians Vorbild 33,2 · heutiger heller Stand 3,3 · Ziel ≥ 25)')

        # Der Farbstich ist der zweite Beleg, und er sagt etwas anderes als die
        # Abhebung: Er zeigt, DASS das Glas den Untergrund aufnimmt. Eine deckende
        # Fläche kann keinen Stich vom Untergrund haben — in Phase 19i wurden so
        # +9,2 auf der Apple-Karte gemessen.
        stich1, stich2 = m1['g'] - m1['b'], m2['g'] - m2['b']
        print(f'  ► Farbstich {n1}: {stich1:+.1f} · {n2}: {stich2:+.1f} '
              f'(nimmt das Glas den Untergrund auf?)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
