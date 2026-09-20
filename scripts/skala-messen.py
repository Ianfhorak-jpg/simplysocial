#!/usr/bin/env python3
# ══════════════════════════════════════════════════════════════════════════════
#  DIE KARTENSKALA NACHRECHNEN — die Messstelle zu STUFEN und KARTE_LEER
#
#  Aufruf: python3 scripts/skala-messen.py     (braucht nichts, liest den Code)
#
#  ── Wozu ────────────────────────────────────────────────────────────────────
#  In `features/posts/karte.ts` stehen zehn Zahlen im Kommentar: vier Sprünge der
#  Farbskala und vier bis sechs Textkontraste. Am 2026-09-20 stellte sich heraus,
#  dass zwei davon **veraltet** waren — 8,63 und 4,53 stammten von vor Ians
#  Entscheidung 92, die `colors.ink` auf Reinweiss gezogen hat. Stufe 3 und 4
#  stimmten weiter, weil sie `DUNKLE_ZAHL` benutzen und die sich nicht geändert
#  hat. *Eine Warnung mit einer ZAHL darin veraltet genauso still wie das, wovor
#  sie warnt* (FALLEN.md).
#
#  Dieses Skript liest die Werte AUS DEM CODE, nicht aus dem Kommentar. Es ändert
#  nichts und urteilt nicht — es druckt, was gerade gilt.
#
#  ⚠️ **Es ist kein Prüfstand.** Ein Prüfstand bräuchte eine Soll-Zahl, und die
#  steht nur im Fliesstext daneben; wer sie hier einträgt, hätte sie zweimal.
#  Was dieses Skript kann, ist die Frage beantworten „stimmt der Kommentar noch?"
#  — von Hand, in drei Sekunden, statt gar nicht.
# ══════════════════════════════════════════════════════════════════════════════
import pathlib, re, sys

WURZEL = pathlib.Path(__file__).resolve().parents[1]
KARTE = WURZEL / 'src' / 'features' / 'posts' / 'karte.ts'
FARBEN = WURZEL / 'src' / 'theme' / 'colors.ts'


def zahl(kanal):
    kanal /= 255
    return kanal / 12.92 if kanal <= 0.04045 else ((kanal + 0.055) / 1.055) ** 2.4


def helligkeit(hexwert):
    h = hexwert.lstrip('#')
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * zahl(r) + 0.7152 * zahl(g) + 0.0722 * zahl(b)


def kontrast(a, b):
    la, lb = helligkeit(a), helligkeit(b)
    hoch, tief = max(la, lb), min(la, lb)
    return (hoch + 0.05) / (tief + 0.05)


def main():
    if not KARTE.exists() or not FARBEN.exists():
        sys.exit('✗ karte.ts oder colors.ts fehlt.')
    karte, farben = KARTE.read_text(), FARBEN.read_text()

    def eine(quelle, muster, was):
        m = re.search(muster, quelle)
        if not m:
            sys.exit(f'✗ {was} nicht gefunden — ist der Code umgebaut?')
        return m.group(1)

    leer = eine(karte, r"KARTE_LEER = '(#[0-9A-Fa-f]{6})'", 'KARTE_LEER')
    dunkle = eine(karte, r"DUNKLE_ZAHL = '(#[0-9A-Fa-f]{6})'", 'DUNKLE_ZAHL')
    ink = eine(farben, r"ink: '(#[0-9A-Fa-f]{6})'", 'colors.ink')
    bg = eine(farben, r"bg: '(#[0-9A-Fa-f]{6})'", 'colors.bg')
    # `zahl:` steht entweder als `colors.ink` (mit Punkt) oder als `DUNKLE_ZAHL`
    # — deshalb `[\w.]`, nicht `\w`. Mit `\w+` fand die Suche nur die zwei
    # dunklen Stufen und meldete „zwei statt vier", was nach Umbau aussah.
    stufen = re.findall(r"\{ flaeche: '(#[0-9A-Fa-f]{6})', zahl: ([\w.]+) \}", karte)
    if len(stufen) != 4:
        sys.exit(f'✗ Vier Stufen erwartet, {len(stufen)} gefunden.')

    print(f'\n  bg {bg} · leer {leer} · ink {ink} · DUNKLE_ZAHL {dunkle}\n')
    print(f'  {"":8s} {"Fläche":9s} {"Sprung":>7s} | {"hell":>6s} {"dunkel":>7s} '
          f'| {"Zahl nimmt":>11s} {"erreicht":>9s}')
    print('  ' + '─' * 72)
    print(f'  {"bg→leer":8s} {leer:9s} {kontrast(bg, leer):7.2f} |')
    vor, spruenge = leer, []
    for i, (flaeche, welche) in enumerate(stufen, 1):
        text = ink if welche.startswith('colors') else dunkle
        sprung = kontrast(vor, flaeche)
        spruenge.append(sprung)
        print(f'  Stufe {i}  {flaeche:9s} {sprung:7.2f} | '
              f'{kontrast(flaeche, ink):6.2f} {kontrast(flaeche, dunkle):7.2f} | '
              f'{text:>11s} {kontrast(flaeche, text):9.2f}')
        vor = flaeche

    print()
    print(f'  leer → Stufe 4 gesamt   {kontrast(leer, stufen[-1][0]):.2f}')
    print(f'  schwächster Sprung      {min(spruenge):.2f}')
    print(f'  Spannweite der Sprünge  {max(spruenge) - min(spruenge):.2f}')
    schwach = min(kontrast(f, ink if w.startswith('colors') else dunkle)
                  for f, w in stufen)
    print(f'  schwächster Textkontrast {schwach:.2f}'
          f'   {"✓ über WCAG AA (4,5)" if schwach >= 4.5 else "⚠ UNTER WCAG AA (4,5)"}')
    print('\n  ⚠️ Der Textkontrast zählt nur, wenn `ZAHLEN_AN` wieder `true` ist.')
    print(f'     Er steht gerade auf: '
          f'{eine(karte, r"ZAHLEN_AN = (\w+)", "ZAHLEN_AN")}\n')


if __name__ == '__main__':
    main()
