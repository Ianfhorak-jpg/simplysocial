#!/usr/bin/env python3
"""
Welche Schalterstellung steckt im GEBAUTEN Bundle?  Aufruf aus geraet-bauen.sh.

── Warum das gemessen wird und nicht erschlossen ───────────────────────────────
`BUILD SUCCEEDED` beantwortet „hat er gebaut?" — gebaut wird für den
Gerätedurchgang aber wegen „kann man sich damit anmelden?", und das sind zwei
verschiedene Antworten. Dieselbe Lehre wie das eingebettete Provisioning-Profil
am 2026-09-11: Dort meldete ein 20-Minuten-Build Erfolg und hatte trotzdem das
alte 7-Tage-Profil drin.

Der konkrete Anlass ist ein eigener Fehler vom 2026-09-13: Während der Build lief,
wurde `anmeldung.ts` für Gegenproben mehrfach umgestellt. Es ist gutgegangen (das
JS-Bundling passiert am App-Target, lange nach den Pods) — **aber verlassen kann
man sich darauf nicht.** Was im Bundle gelandet ist, sagt nur das Bundle.

── Die Falle, die diese Datei nötig macht: HERMES KODIERT ZWEIERLEI ────────────
Das Bundle ist Hermes-Bytecode, kein Text. Strings liegen in einer Tabelle ohne
Trennzeichen, und die Kodierung hängt am INHALT:

    reines ASCII            → Latin-1, ein Byte je Zeichen
    ein Nicht-ASCII-Zeichen → UTF-16LE, zwei Byte je Zeichen

Ein Gedankenstrich genügt. Gemessen am 2026-09-13: „Es gibt keinen Login" kam als
Latin-1 **null** mal vor und als UTF-16 **einmal** — der Text war die ganze Zeit
da. Wer nur `grep` nimmt, zählt für jeden Satz mit „—", „ä" oder „ß" eine Null und
hält ihn für wegoptimiert. **Deshalb wird hier in BEIDEN Kodierungen gesucht.**

── Der Marker, und warum gerade dieser ────────────────────────────────────────
Gesucht wird nicht nach dem Wort `'supabase'` (es steht als Paketname, in URLs und
in Fehlertexten sechzehnmal im Bundle und sagt nichts), sondern nach den zwei
Sätzen, die `anmeldeFolgen()` in genau EINER Stellung zurückgibt. Terser faltet
den Vergleich zu einem Wahrheitswert und wirft den toten Zweig weg — der Satz der
anderen Stellung ist danach in keiner Kodierung mehr auffindbar.
"""
import sys

# Beide müssen zusammenpassen; einer allein wäre mehrdeutig, wenn ein Satz
# irgendwann auch woanders auftaucht.
NUR_ATTRAPPE = 'im Prototyp noch ohne Funktion'   # aus anmeldeFolgen(), Attrappen-Zweig
NUR_SUPABASE = 'Geht nur in der App am Handy'     # aus anmeldeFolgen(), Web + 'supabase'


def steckt_drin(rumpf: bytes, text: str) -> bool:
    """In BEIDEN Hermes-Kodierungen suchen — siehe Kopf."""
    return text.encode('latin-1') in rumpf or text.encode('utf-16-le') in rumpf


def main() -> int:
    if len(sys.argv) != 3:
        print('Aufruf: bundle-schalter.py <main.jsbundle> <attrappe|supabase>')
        return 2
    pfad, erwartet = sys.argv[1], sys.argv[2]

    try:
        rumpf = open(pfad, 'rb').read()
    except OSError as fehler:
        print(f'✗ Bundle nicht lesbar: {fehler}')
        return 1

    a, s = steckt_drin(rumpf, NUR_ATTRAPPE), steckt_drin(rumpf, NUR_SUPABASE)

    # Beide oder keiner: Dann trägt der Marker keine Aussage mehr, und ein Urteil
    # wäre geraten. Das passiert, wenn jemand die Sätze in `anmeldung.ts` ändert —
    # dann gehören sie hier mitgeändert, und bis dahin sagt das Skript lieber
    # nichts, als das Falsche.
    if a == s:
        print('✗ Der Marker trägt keine Aussage mehr:')
        print(f'    "{NUR_ATTRAPPE}"  → {"da" if a else "weg"}')
        print(f'    "{NUR_SUPABASE}"  → {"da" if s else "weg"}')
        print('  Erwartet ist genau einer von beiden. Stehen die Sätze noch so in')
        print('  features/auth/anmeldung.ts? Dann hier mitziehen.')
        return 1

    ist = 'attrappe' if a else 'supabase'
    if ist != erwartet:
        print(f'✗ Im Bundle steckt ANMELDE_QUELLE = {ist}, erwartet war {erwartet}.')
        print('  Der Build ist damit für seinen Zweck wertlos:')
        if ist == 'attrappe':
            print('    Mit "attrappe" gibt es am Gerät KEINE Anmeldung — Apple, Google')
            print('    und der E-Mail-Code sind alle drei tot, und der Durchgang misst')
            print('    nichts von dem, wofür er gemacht wird.')
        else:
            print('    Mit "supabase" verlangt die App ein echtes Konto.')
        print('  Schalter in features/auth/anmeldung.ts richtigstellen und NEU bauen —')
        print('  die Quelle dabei nicht mehr anfassen, solange der Build läuft.')
        return 1

    print(f'  Im Bundle: ANMELDE_QUELLE = {ist}  (in beiden Hermes-Kodierungen gesucht)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
