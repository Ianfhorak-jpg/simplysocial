#!/usr/bin/env python3
# ══════════════════════════════════════════════════════════════════════════════
#  VORHÄNGE WEGRÄUMEN — was beim Start über der App liegt
#
#  Aufruf:  python3 scripts/vorhang-weg.py          (räumt, bis nichts mehr da ist)
#           python3 scripts/vorhang-weg.py --sehen  (nur sagen, was liegt)
#
#  ── Wozu ────────────────────────────────────────────────────────────────────
#  Beim ersten Versuch, Store-Bilder zu holen (2026-09-26), lagen auf dem ersten
#  Bild GLEICH ZWEI Schichten über der App:
#
#    1. iOS' eigene Rückfrage „In ‚SimplySocial' öffnen?" — die kommt von
#       `simctl openurl` und gehört dem System, nicht uns.
#    2. Der Prototyp-Hinweis (harte Regel 22). Er hängt an `IST_PROTOTYP` und
#       erscheint deshalb NUR in der Attrappe — in Ians echter App nie.
#       ⚠️ Er merkt sich sein Wegklicken über `window.sessionStorage`, und die
#       gibt es auf dem Gerät nicht: Auf iOS kommt er bei JEDEM Start wieder.
#       Deshalb genügt es nicht, ihn einmal wegzuklicken.
#
#  Eine dritte Schicht (die Stapel-Anleitung) räumt sich selbst dauerhaft weg —
#  sie benutzt `merker.native.ts` → AsyncStorage, und das überlebt den Neustart.
#
#  ── Warum GESEHEN und nicht blind getippt ───────────────────────────────────
#  Blind auf zwei feste Stellen zu klicken wäre kürzer. Aber liegt dort gerade
#  kein Vorhang, trifft der Klick, was darunter ist — auf `/create` ein
#  Eingabefeld, in den Anfragen ein „Bestätigen". Das Bild sähe danach aus wie
#  ein Ergebnis und wäre keines.
#
#  Also: erst nachsehen, ob die Farbe an der Stelle zu dem Knopf passt, den es
#  dort geben müsste — und nur dann tippen.
# ══════════════════════════════════════════════════════════════════════════════
import pathlib, subprocess, sys, tempfile

WURZEL = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(WURZEL / 'scripts'))
from glasmessung import png_lesen  # noqa: E402


def udid():
    aus = subprocess.run(['xcrun', 'simctl', 'list', 'devices', 'booted'],
                         capture_output=True, text=True).stdout
    import re
    m = re.search(r'[0-9A-F]{8}-[0-9A-F-]{27}', aus)
    return m.group(0) if m else None


def bild(ud):
    p = pathlib.Path(tempfile.mkdtemp()) / 'schirm.png'
    subprocess.run(['xcrun', 'simctl', 'io', ud, 'screenshot', str(p)],
                   capture_output=True)
    return png_lesen(str(p)) if p.exists() and p.stat().st_size else (0, 0, None)


def fleck(px, b, h, ax, ay, r=9):
    """Median je Kanal um einen ANTEIL der Bildgrösse — nicht ein Pixel.
    Ein Knopf hat Schrift darauf, und die trifft man sonst."""
    x, y = int(ax * b), int(ay * h)
    ks = [[], [], []]
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            p = px[y + dy][x + dx]
            for i in range(3):
                ks[i].append(p[i])
    return [sorted(k)[len(k) // 2] for k in ks]


# Die Stellen sind ANTEILE, keine Pixel: Damit gelten sie auf jedem Simulator.
# Gemessen am iPhone 17 Pro Max (1320×2868), 2026-09-26.
#
# 🔴 MESSEN und TIPPEN sind zwei verschiedene Stellen, und das ist der ganze
# Witz: Beim ersten Lauf lag der Messfleck mitten auf der Beschriftung
# „Verstanden". Der Median über 19×19 Pixel nahm die dunkle Schrift mit und kam
# auf #B1B1AF statt auf das Cremeweiss des Knopfes — die Prüfung sagte „kein
# Vorhang da", während der Vorhang bildfüllend dastand.
#
# Gemessen wird deshalb LINKS im Knopf, wo keine Schrift ist; getippt wird in
# seiner Mitte. *Ein Messpunkt auf einer Beschriftung misst die Beschriftung.*
VORHAENGE = [
    # (Name, mess_x, mess_y, tipp_x, tipp_y, Prüfung auf die Farbe DES KNOPFES)
    ('iOS-Rückfrage „Öffnen"', 0.545, 0.539, 0.667, 0.539,
     lambda r, g, b: b > 170 and r < 130 and b - r > 80),        # Apples Blau
    ('Prototyp-Hinweis „Verstanden"', 0.200, 0.608, 0.499, 0.608,
     lambda r, g, b: min(r, g, b) > 200 and max(r, g, b) - min(r, g, b) < 30),  # Creme
]


def main():
    nur_sehen = '--sehen' in sys.argv
    ud = udid()
    if not ud:
        sys.exit('✗ Kein Simulator läuft.')

    weg = 0
    for runde in range(4):
        b, h, px = bild(ud)
        if px is None:
            sys.exit('✗ Kein Bild vom Simulator.')
        gefunden = None
        for name, mx, my, tx, ty, passt in VORHAENGE:
            r, g, bl = fleck(px, b, h, mx, my)
            if passt(r, g, bl):
                gefunden = (name, mx, my, tx, ty, (r, g, bl))
                break
        if not gefunden:
            if runde == 0:
                print('· Kein Vorhang da.')
            break
        name, mx, my, tx, ty, farbe = gefunden
        print(f'· {name}  (gemessen #%02X%02X%02X an {mx}/{my})' % tuple(farbe))
        if nur_sehen:
            break
        # 🔴 Den Fehlschlag NICHT verschlucken. Am 2026-09-26 nachts hat genau
        # das hier vier Runden lang ins Leere getippt: Der Mac zeigte den
        # Ruhebildschirm, der Simulator hatte kein Fenster, `tippen.sh` scheiterte
        # sauber und laut — und `capture_output=True` warf die Meldung weg. Heraus
        # kamen acht Bilder mit Vorhang, die aussahen wie ein Ergebnis.
        #
        # *Ein Schritt, dessen Fehlermeldung ins Nichts geht, ist kein Schritt,
        # sondern eine Annahme* — derselbe Satz steht in `schirm.sh` über
        # `simctl launch`, und er gilt hier genauso.
        r = subprocess.run(['bash', str(WURZEL / 'scripts' / 'tippen.sh'),
                            '--anteil', str(tx), str(ty)],
                           capture_output=True, text=True)
        if r.returncode != 0:
            print('  ✗ Der Tipp ist gescheitert — der Vorhang bleibt liegen:')
            for zeile in (r.stdout + r.stderr).strip().splitlines():
                print(f'    {zeile}')
            return 2
        weg += 1
        # Kurz warten: Der Vorhang blendet aus, und ein Bild MITTEN in der
        # Bewegung sieht aus wie ein halber Vorhang.
        subprocess.run(['sleep', '1.2'])
    else:
        print('⚠️ Nach vier Runden liegt immer noch etwas da.')
        return 1

    if weg and not nur_sehen:
        print(f'✓ {weg} weggeräumt.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
