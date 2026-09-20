#!/usr/bin/env python3
# ══════════════════════════════════════════════════════════════════════════════
#  WAS KOSTET EINE FEINERE BEZIRKSGRENZE? — die Messstelle zu RASTER/TOLERANZ
#
#  Aufruf: python3 scripts/bezirke-messen.py     (lädt beim ersten Mal ~3 MB)
#
#  ── Wozu es dieses Skript gibt ──────────────────────────────────────────────
#  `bezirke-bauen.py` trägt zwei Zahlen, an denen alles hängt: `RASTER` (worauf
#  Punkte gerundet werden) und `TOLERANZ` (Douglas-Peucker). Am 2026-09-20
#  wurden sie von 1.0/2.0 auf 0.1/0.1 gesetzt, weil Ian sagte, die Umrandungen
#  seien *„noch zu zackig … wenn man da so reinzoomt"*.
#
#  **Eine dokumentierte Zahl ohne ihre Messstelle ist nicht reproduzierbar**
#  (FALLEN.md). Dieses Skript IST die Messstelle. Es ändert nichts, es druckt
#  nur — und es importiert die echten Funktionen aus `bezirke-bauen.py`, statt
#  sie nachzubauen (*eine Attrappe kann auch SCHWÄCHER sein als das Original*).
#
#  ── Die zwei Befunde, die die Wahl entschieden haben ────────────────────────
#  1. **Das Raster ist kein Sparhebel, sondern reiner Verlust.** Gerundet wird
#     VOR Douglas-Peucker (`bezirke-bauen.py`, in `main()`). Ein grobes Raster
#     nimmt ihm die Auswahl, und er braucht dann MEHR Punkte für dieselbe
#     Abweichung. Gemessen: 0.25/0.5 ergibt 1863 Punkte und 21766 Zeichen,
#     0.1/0.5 nur 1780 Punkte und 20178 Zeichen — bei 2,4× feinerem Gitter.
#     Gespart wird also über `TOLERANZ`, nie über `RASTER`.
#  2. **Unter `TOLERANZ = RASTER` bricht der Nutzen weg.** Von 0.1 auf 0.07
#     springen die Punkte um das 1,9-Fache für 1,4× Genauigkeit: Die Toleranz
#     liegt dann unter dem Gitter, und es gibt nichts mehr wegzulassen.
#     Deshalb stehen beide auf 0.1.
#
#  ── Warum 0.1 und nicht gröber ──────────────────────────────────────────────
#  `APPLE_ZOOM_MAX = 15` (features/posts/karte.ts) ist die Stadtviertel-Ebene,
#  nach Lehrbuch rund 3,18 m je Punkt. Dieselbe Datei warnt aber, dass
#  `react-native-maps` „gut anderthalb Stufen neben der Lehrbuchformel" liegt —
#  im ungünstigsten Fall also 1,12 m je Punkt. 0.1 sind 2,0 m und damit 0,61 pt
#  im guten, 1,75 pt im schlechten Fall. Die alte Einstellung lag bei 39,1 m,
#  also 12 bis 35 pt: **das war Ians Zacken.**
# ══════════════════════════════════════════════════════════════════════════════
import gzip, importlib.util, json, math, pathlib, urllib.request

HIER = pathlib.Path(__file__).resolve().parent
QUELLE = (
    'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature'
    '&version=1.1.0&typeName=ogdwien:BEZIRKSGRENZEOGD'
    '&srsName=EPSG:4326&outputFormat=json'
)
# Die Rohdaten liegen NEBEN dem Skript und sind git-ignoriert: 3 MB, die sich
# nicht ändern, aber auch nicht ins Repo gehören.
ZWISCHENLAGER = HIER / '.bezirke-roh.json'

# `bezirke-bauen` hat einen Bindestrich im Namen und ist damit kein Modulname,
# den `import` annimmt — deshalb über die Datei laden.
_spec = importlib.util.spec_from_file_location('bezirke_bauen', HIER / 'bezirke-bauen.py')
bb = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(bb)   # `main()` steht hinter `if __name__`, läuft also nicht


def rohdaten():
    if not ZWISCHENLAGER.exists():
        print('Lade', QUELLE.split('?')[0], '…')
        with urllib.request.urlopen(QUELLE, timeout=90) as antwort:
            ZWISCHENLAGER.write_bytes(antwort.read())
    return json.loads(ZWISCHENLAGER.read_text())


def main():
    feats = sorted(rohdaten()['features'], key=lambda f: f['properties']['BEZNR'])
    alle = [pt for f in feats for r in bb.ringe(f['geometry']) for pt in r]
    lon0, lat1 = min(p[0] for p in alle), max(p[1] for p in alle)
    k = math.cos(math.radians((min(p[1] for p in alle) + lat1) / 2))
    massstab = bb.BREITE / ((max(p[0] for p in alle) - lon0) * k)
    meter = 1000 / massstab * k * 111320 / 1000

    def bauen(raster, toleranz):
        """Nur die Rasterung und die Vereinfachung — wie in `bb.main()`."""
        punkte, teile = 0, []
        for f in feats:
            for ring in bb.ringe(f['geometry']):
                pts, letzter = [], None
                for lon, lat in ring:
                    x = round((lon - lon0) * k * massstab / raster) * raster
                    y = round((lat1 - lat) * massstab / raster) * raster
                    if (x, y) != letzter:
                        pts.append((x, y))
                        letzter = (x, y)
                if len(pts) < 4:
                    continue
                if pts[0] != pts[-1]:
                    pts.append(pts[0])
                pts = bb.vereinfachen(pts, toleranz)
                if len(pts) < 4:
                    continue
                punkte += len(pts)
                teile.append('M' + ' '.join(f'{x:g},{y:g}' for x, y in pts[:-1]) + 'Z')
        pfad = ''.join(teile).encode()
        return punkte, len(pfad), len(gzip.compress(pfad, 9))

    # Zoom 15: Lehrbuch gegen den ungünstigsten Fall aus karte.ts.
    LOCKER, STRENG = 3.18, 1.12
    print(f'\nEine Rastereinheit = {meter:.1f} m · {len(feats)} Bezirke · '
          f'{len(alle)} amtliche Stützpunkte\n')
    print(f'{"Raster":>7} {"Toleranz":>9} {"Abweichung":>11} | {"Punkte":>7} '
          f'{"Zeichen":>8} {"gzip":>7} | {"@3,18":>7} {"@1,12":>7}')
    print('─' * 82)
    for raster, tol, note in [
        (1.0, 2.0, 'bis 2026-09-20'),
        (0.25, 0.5, 'Raster als Sparhebel — schlechter als 0.1/0.5'),
        (0.1, 0.5, ''),
        (0.1, 0.3, ''),
        (0.1, 0.2, ''),
        (0.1, 0.1, '◀ seit 2026-09-20: Toleranz = Raster'),
        (0.1, 0.07, 'Knick — 1,9× Punkte für 1,4× Genauigkeit'),
        (0.05, 0.05, ''),
    ]:
        p, z, g = bauen(raster, tol)
        abw = tol * meter
        print(f'{raster:>7g} {tol:>9g} {abw:>10.1f}m | {p:>7d} {z:>8d} {g:>7d} | '
              f'{abw / LOCKER:>6.2f}pt {abw / STRENG:>6.2f}pt  {note}')
    print()


if __name__ == '__main__':
    main()
