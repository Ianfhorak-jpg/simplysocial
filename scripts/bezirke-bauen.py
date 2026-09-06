#!/usr/bin/env python3
"""
Baut `src/data/wien-bezirke.ts` aus den amtlichen Bezirksgrenzen der Stadt Wien.

    python3 scripts/bezirke-bauen.py

Läuft EINMAL. Danach steht das Ergebnis als gewöhnliche TypeScript-Datei im Repo und
niemand braucht mehr Python, ein Netz oder 3 MB GeoJSON, um die App zu bauen — genau
wie `theme/icons.ts` eine Datei mit Pfadstrings ist und kein Icon-Paket.

── Quelle und Lizenz ─────────────────────────────────────────────────────────────
Stadt Wien — data.wien.gv.at, Datensatz BEZIRKSGRENZEOGD, **CC BY 4.0**. Die
Namensnennung ist Pflicht und steht in der App unter der Karte (`KARTE_QUELLE`).

── Die drei Entscheidungen, die dieses Skript trifft ─────────────────────────────
1. **Projektion:** flach, mit Kosinus-Korrektur auf Wiens Breite. Über 29 km ist der
   Unterschied zu Web-Mercator kleiner als ein Bildpunkt — und eine flache Rechnung
   kann man in zwei Zeilen nachlesen.
2. **Erst runden, dann vereinfachen.** Zwei Nachbarbezirke teilen sich eine Grenze.
   Vereinfacht jeder sie für sich, entstehen Lücken und Überlappungen. Auf ein Raster
   gerundet sind die geteilten Punkte vorher bitgleich, und Douglas-Peucker ist
   umkehrungsinvariant — es bleiben höchstens Abweichungen in Höhe der Toleranz, und
   die sind bei der Anzeigegröße unter einem halben Bildpunkt.
3. **Der Beschriftungspunkt ist NICHT der Schwerpunkt.** Bei einem gebogenen Bezirk
   (13., 21., 22.) liegt der Schwerpunkt außerhalb der Fläche, und die Zahl steht im
   Nachbarbezirk. Gesucht wird stattdessen der Punkt mit dem größten Abstand zum Rand
   — grob im Raster, dann zweimal verfeinert.
"""

import json
import math
import urllib.request

QUELLE = (
    'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature'
    '&version=1.1.0&typeName=ogdwien:BEZIRKSGRENZEOGD'
    '&srsName=EPSG:4326&outputFormat=json'
)

BREITE = 1000.0   # Einheiten im viewBox. 1 Einheit ≈ 29 m.
RASTER = 1.0      # Punkte werden hierauf gerundet (siehe Entscheidung 2).
TOLERANZ = 2.0    # Douglas-Peucker. Bei ~320 px Anzeigebreite sind das 0,6 px.


def ringe(geom):
    """Alle Ringe eines (Multi-)Polygons — der äußere zuerst."""
    if geom['type'] == 'Polygon':
        return geom['coordinates']
    return [ring for poly in geom['coordinates'] for ring in poly]


def vereinfachen(punkte, tol):
    """Douglas-Peucker, iterativ (Wien hat Ringe mit 5000 Punkten — Rekursion reicht
    zwar, aber die Grenze ist unnötig knapp)."""
    if len(punkte) < 3:
        return punkte
    behalten = [False] * len(punkte)
    behalten[0] = behalten[-1] = True
    stapel = [(0, len(punkte) - 1)]
    while stapel:
        a, b = stapel.pop()
        if b <= a + 1:
            continue
        ax, ay = punkte[a]
        bx, by = punkte[b]
        dx, dy = bx - ax, by - ay
        laenge = math.hypot(dx, dy)
        weit, weitest = -1.0, a
        for i in range(a + 1, b):
            px, py = punkte[i]
            if laenge == 0:
                abstand = math.hypot(px - ax, py - ay)
            else:
                abstand = abs(dy * px - dx * py + bx * ay - by * ax) / laenge
            if abstand > weit:
                weit, weitest = abstand, i
        if weit > tol:
            behalten[weitest] = True
            stapel.append((a, weitest))
            stapel.append((weitest, b))
    return [p for p, ja in zip(punkte, behalten) if ja]


def abstand_zum_rand(px, py, ringe_xy):
    """Kürzester Abstand zu irgendeiner Kante. Negativ, wenn außerhalb."""
    best = float('inf')
    for ring in ringe_xy:
        for i in range(len(ring) - 1):
            ax, ay = ring[i]
            bx, by = ring[i + 1]
            dx, dy = bx - ax, by - ay
            q = dx * dx + dy * dy
            t = 0.0 if q == 0 else max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / q))
            best = min(best, math.hypot(px - (ax + t * dx), py - (ay + t * dy)))
    return best if drinnen(px, py, ringe_xy) else -best


def drinnen(px, py, ringe_xy):
    """Strahlensatz-Test gegen alle Ringe (Löcher heben sich dabei von selbst auf)."""
    treffer = False
    for ring in ringe_xy:
        for i in range(len(ring) - 1):
            ax, ay = ring[i]
            bx, by = ring[i + 1]
            if (ay > py) != (by > py):
                x = ax + (py - ay) / (by - ay) * (bx - ax)
                if px < x:
                    treffer = not treffer
    return treffer


def beschriftungspunkt(ringe_xy):
    """Der Punkt mit dem größten Abstand zum Rand — grob, dann zweimal feiner."""
    xs = [x for r in ringe_xy for x, _ in r]
    ys = [y for r in ringe_xy for _, y in r]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    bester, bestwert = ((x0 + x1) / 2, (y0 + y1) / 2), -1e9
    spanne = max(x1 - x0, y1 - y0)
    for runde in range(3):
        schritt = spanne / (24 if runde == 0 else 8)
        cx, cy = bester
        radius = spanne / 2 if runde == 0 else schritt * 6
        n = 24 if runde == 0 else 12
        for i in range(n + 1):
            for j in range(n + 1):
                px = cx - radius + 2 * radius * i / n
                py = cy - radius + 2 * radius * j / n
                if not (x0 <= px <= x1 and y0 <= py <= y1):
                    continue
                wert = abstand_zum_rand(px, py, ringe_xy)
                if wert > bestwert:
                    bestwert, bester = wert, (px, py)
        spanne = radius
    return bester, bestwert


def main():
    print('Lade', QUELLE.split('?')[0], '…')
    with urllib.request.urlopen(QUELLE, timeout=60) as antwort:
        daten = json.load(antwort)
    feats = sorted(daten['features'], key=lambda f: f['properties']['BEZNR'])
    print(f'{len(feats)} Bezirke.')

    alle = [pt for f in feats for r in ringe(f['geometry']) for pt in r]
    lon0 = min(p[0] for p in alle)
    lat1 = max(p[1] for p in alle)
    lat0 = (min(p[1] for p in alle) + lat1) / 2
    k = math.cos(math.radians(lat0))
    spanne_lon = (max(p[0] for p in alle) - lon0) * k
    massstab = BREITE / spanne_lon
    hoehe = round((lat1 - min(p[1] for p in alle)) * massstab, 1)

    zeilen, roh, fein = [], 0, 0
    for f in feats:
        props = f['properties']
        pfad, ringe_xy = [], []
        for ring in ringe(f['geometry']):
            roh += len(ring)
            punkte, letzter = [], None
            for lon, lat in ring:
                x = round((lon - lon0) * k * massstab / RASTER) * RASTER
                y = round((lat1 - lat) * massstab / RASTER) * RASTER
                if (x, y) != letzter:
                    punkte.append((x, y))
                    letzter = (x, y)
            if len(punkte) < 4:
                continue
            if punkte[0] != punkte[-1]:
                punkte.append(punkte[0])
            punkte = vereinfachen(punkte, TOLERANZ)
            if len(punkte) < 4:
                continue
            fein += len(punkte)
            ringe_xy.append(punkte)
            pfad.append(
                'M' + ' '.join(f'{x:g},{y:g}' for x, y in punkte[:-1]) + 'Z'
            )
        (lx, ly), abstand = beschriftungspunkt(ringe_xy)
        plz = f'1{props["BEZNR"]:02d}0'
        zeilen.append(
            f'  {{ plz: {plz!r}, nr: {props["BEZNR"]}, name: {props["NAMEK"]!r}, '
            f'label: {{ x: {lx:.0f}, y: {ly:.0f}, r: {abstand:.0f} }},\n'
            f'    d: {"".join(pfad)!r} }},'
        )
        print(f'  {plz} {props["NAMEK"]:<22} {fein:>5} Punkte gesamt, '
              f'Beschriftung {abstand:.0f} Einheiten vom Rand')

    kopf = f'''/**
 * Die 23 Wiener Bezirke als SVG-Pfade.
 *
 * ⚠️ **Diese Datei ist ERZEUGT.** Nicht von Hand ändern —
 * `python3 scripts/bezirke-bauen.py` baut sie aus den amtlichen Grenzen neu.
 *
 * ── Quelle und Namensnennung ────────────────────────────────────────────────
 * Stadt Wien (data.wien.gv.at), Datensatz BEZIRKSGRENZEOGD, **CC BY 4.0**. Die
 * Nennung ist Bedingung der Lizenz und steht in der App unter der Karte —
 * `KARTE_QUELLE` in `features/posts/karte.ts`. Wer die Karte woanders einbaut,
 * nimmt die Zeile mit.
 *
 * ── Warum Daten und Zeichner getrennt liegen ────────────────────────────────
 * Dieselbe Bauart wie `theme/icons.ts`: Hier stehen nur Pfadstrings, gezeichnet
 * wird in `components/ui/SsWienKarte.tsx`, und was eine Farbe bedeutet, steht in
 * `features/posts/karte.ts`. Ein neuer Grenzverlauf ist damit ein Skriptlauf und
 * kein Screen.
 *
 * ── Wie genau das ist ───────────────────────────────────────────────────────
 * Aus {roh} amtlichen Stützpunkten sind {fein} geworden ({fein / roh:.1%}) — auf
 * ein Raster von {RASTER:g} Einheiten gerundet und mit Douglas-Peucker geglättet
 * (Toleranz {TOLERANZ:g}). Eine Einheit sind rund {1000 / massstab * k * 111320 / 1000:.0f} m;
 * bei der Anzeigebreite der App ist die Abweichung kleiner als ein Bildpunkt.
 * **Das ist eine Übersichtskarte, keine Vermessung** — sie beantwortet „wo ist
 * gerade etwas los", nicht „wo genau verläuft die Grenze".
 */

/** Ein Bezirk als Fläche. `plz` ist derselbe Wert wie `Post.district`. */
export interface BezirkFlaeche {{
  /** "1010" — passt direkt auf `Post.district`. */
  plz: string;
  /** 1 bis 23. Das, was in der Fläche steht, wenn Platz ist. */
  nr: number;
  /** "Innere Stadt" */
  name: string;
  /**
   * Wo die Zahl hineinpasst — und wie viel Platz dort ist.
   *
   * `x`/`y` ist der Punkt mit dem größten Abstand zum Rand, `r` genau dieser
   * Abstand. **`r` ist kein Schmuck:** Die Josefstadt ist bei Handybreite 14 × 11
   * Bildpunkte groß, eine Zahl passt dort erst hinein, wenn jemand hineingezoomt
   * hat. Der Zeichner entscheidet daran, ob er sie überhaupt schreibt — Farbe
   * allein ist keine Auskunft (PLAN.md, Phase 19b, Punkt 2), eine Zahl, die über
   * ihre Fläche hinausragt, aber auch nicht.
   */
  label: {{ x: number; y: number; r: number }};
  /** Der SVG-Pfad im Raster unten. */
  d: string;
}}

/** Das Raster, in dem alle Pfade unten liegen. */
export const KARTE_BREITE = {BREITE:g};
export const KARTE_HOEHE = {hoehe:g};

export const BEZIRKE: readonly BezirkFlaeche[] = [
'''
    ziel = 'src/data/wien-bezirke.ts'
    with open(ziel, 'w') as datei:
        datei.write(kopf + '\n'.join(zeilen) + '\n];\n')
    import os
    print(f'\n→ {ziel}  ({os.path.getsize(ziel) / 1024:.0f} kB, '
          f'{roh} → {fein} Punkte, viewBox 0 0 {BREITE:g} {hoehe:g})')


if __name__ == '__main__':
    main()
