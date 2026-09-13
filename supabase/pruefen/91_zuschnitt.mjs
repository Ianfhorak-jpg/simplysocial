// ═══════════════════════════════════════════════════════════════════════════════
//  PHASE 20.6-d — wo das Quadrat im Foto liegt (Ians Entscheidung 77)
//
//  Läuft in blankem Node. Gemessen wird die REGEL aus `features/social/zuschnitt.ts`:
//  dass der Ausschnitt NIE über den Bildrand hängt, dass er aus ganzen Pixeln
//  besteht, dass das Vorzeichen beim Schieben stimmt — und dass nie hochgerechnet
//  wird.
//
//  ── Was er NICHT leistet, und das gehört ausgesprochen ──────────────────────
//  Ob sich die Geste am Handy richtig ANFÜHLT, beantwortet kein Node. Geprüft ist
//  die Rechnung dahinter. Das Gefühl gehört in den Gerätedurchgang.
// ═══════════════════════════════════════════════════════════════════════════════
const A = process.env.ARBEIT;
const Z = await import(`${A}/js/features/social/zuschnitt.mjs`);

let ok = 0;
let weg = 0;
function pruef(was, ist, soll) {
  const gleich = JSON.stringify(ist) === JSON.stringify(soll);
  if (gleich) ok++;
  else weg++;
  console.log(
    `  ${gleich ? '✓' : '✗'} ${was}${gleich ? '' : `\n      ist:  ${JSON.stringify(ist)}\n      soll: ${JSON.stringify(soll)}`}`,
  );
}
function abschnitt(t) {
  console.log(`\n── ${t} ${'─'.repeat(Math.max(0, 68 - t.length))}`);
}

/** Ein gewöhnliches iPhone-Foto, hochkant. Die Maße sind echt (12 MP). */
const HOCHKANT = { breite: 3024, hoehe: 4032 };
const QUER = { breite: 4032, hoehe: 3024 };
const QUADRAT = { breite: 2000, hoehe: 2000 };
/** Ein Bild, das KLEINER ist als die Zielkante — aus WhatsApp, aus einem Screenshot. */
const KLEIN = { breite: 300, hoehe: 400 };

abschnitt('Ians Entscheidung 77 steht als Zahl da');
pruef('die Zielkante ist 512', Z.ZUSCHNITT_KANTE, 512);
// **Die Begründung aus der Datei wird hier GEMESSEN, nicht geglaubt.** Dort steht,
// der höchste Zoom koste bei einem 12-MP-Foto keine Schärfe. Das ist eine Aussage
// über zwei Zahlen, die unabhängig voneinander geändert werden können — also genau
// die Sorte Satz, die lautlos veraltet (FALLEN.md, „Ein Kommentar, der eine
// Sicherheitszusage begründet, veraltet lautlos").
const beiVollzoom = Z.zuschnittRechteck(HOCHKANT, { zoom: Z.ZUSCHNITT_MAX_ZOOM, mitteX: 1512, mitteY: 2016 });
pruef('… und bei Vollzoom liefert ein 12-MP-Foto noch mindestens so viel', beiVollzoom.width >= Z.ZUSCHNITT_KANTE, true);

abschnitt('Der Anfangszustand zeigt genau das, was ohne den Screen herauskäme');
pruef('Zoom 1, mittig', Z.zuschnittAnfang(HOCHKANT), { zoom: 1, mitteX: 1512, mitteY: 2016 });
pruef(
  'das größtmögliche Quadrat, mittig im Hochformat',
  Z.zuschnittRechteck(HOCHKANT, Z.zuschnittAnfang(HOCHKANT)),
  { originX: 0, originY: 504, width: 3024, height: 3024 },
);
pruef(
  '… und mittig im Querformat',
  Z.zuschnittRechteck(QUER, Z.zuschnittAnfang(QUER)),
  { originX: 504, originY: 0, width: 3024, height: 3024 },
);

abschnitt('Der Spielraum der Breite null — und er ist jedes zweite Handyfoto');
// Bei Hochkant und Zoom 1 ist das Quadrat so breit wie das Bild. Egal, wohin
// jemand schiebt: waagrecht kann es nicht wandern. Eine Interpolation gäbe hier
// den Extremwert (FALLEN.md); Klemmen gibt den einen erlaubten Wert.
for (const mitteX of [-99999, 0, 1512, 99999, NaN, Infinity]) {
  pruef(
    `mitteX = ${mitteX} ⇒ originX bleibt 0`,
    Z.zuschnittRechteck(HOCHKANT, { zoom: 1, mitteX, mitteY: 2016 }).originX,
    0,
  );
}

abschnitt('Der Ausschnitt hängt NIE über den Bildrand — 4000 Zufallsproben');
// ── Warum gewürfelt und nicht aufgezählt ────────────────────────────────────
// Die Fehler dieser Rechnung stecken nicht in besonderen Zahlen, sondern im
// RUNDEN: ein `Math.round`, das einen Wert an der Grenze um ein halbes Pixel
// darüber schiebt. So etwas trifft man mit ausgedachten Beispielen fast nie und
// mit tausend gewürfelten sofort.
//
// Der Würfel ist absichtlich ein eigener und kein `Math.random()`: Ein Fehlschlag
// muss sich beim nächsten Lauf WIEDER zeigen, sonst sucht man ein Gespenst.
let same = 20260913;
const wuerfel = () => ((same = (same * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const bereich = (a, b) => a + wuerfel() * (b - a);

const ausreisser = [];
let ganzzahlig = true;
for (let i = 0; i < 4000; i++) {
  const bild = { breite: Math.round(bereich(1, 6000)), hoehe: Math.round(bereich(1, 6000)) };
  const roh = {
    // Absichtlich AUSSERHALB der Grenzen gewürfelt, und in jedem zehnten Fall
    // etwas, das gar keine Zahl ist: Der Screen füttert diese Funktion aus einer
    // Fingergeste, und die kennt keine Grenzen.
    zoom: i % 11 === 0 ? [NaN, Infinity, -1, 0][i % 4] : bereich(-2, 12),
    mitteX: i % 13 === 0 ? [NaN, -Infinity, Infinity][i % 3] : bereich(-3000, 9000),
    mitteY: i % 17 === 0 ? NaN : bereich(-3000, 9000),
  };
  const r = Z.zuschnittRechteck(bild, roh);
  if (!Number.isInteger(r.originX) || !Number.isInteger(r.originY) || !Number.isInteger(r.width) || !Number.isInteger(r.height)) {
    ganzzahlig = false;
  }
  const drin =
    r.originX >= 0 &&
    r.originY >= 0 &&
    r.width >= 1 &&
    r.width === r.height &&
    r.originX + r.width <= bild.breite &&
    r.originY + r.height <= bild.hoehe;
  if (!drin) ausreisser.push({ bild, roh, r });
}
pruef('keine einzige Probe ragt hinaus', ausreisser.slice(0, 3), []);
pruef('… und alle vier Werte sind ganze Pixel', ganzzahlig, true);

abschnitt('Der Zoom hat zwei Enden, und beide halten');
pruef(
  'weiter herausgezoomt als das Bild geht nicht',
  Z.zuschnittRechteck(HOCHKANT, { zoom: 0.001, mitteX: 1512, mitteY: 2016 }).width,
  3024,
);
pruef(
  'weiter hinein als MAX_ZOOM auch nicht',
  Z.zuschnittRechteck(HOCHKANT, { zoom: 999, mitteX: 1512, mitteY: 2016 }).width,
  Math.floor(3024 / Z.ZUSCHNITT_MAX_ZOOM),
);
pruef('ein Quadrat kann in beide Richtungen wandern', Z.zuschnittRechteck(QUADRAT, { zoom: 2, mitteX: 0, mitteY: 0 }), {
  originX: 0,
  originY: 0,
  width: 1000,
  height: 1000,
});

abschnitt('Die Reihenfolge: erst der Zoom, dann der Mittelpunkt');
// ⚠️ **Der Fall, für den die Reihenfolge in `zuschnittSicht()` da ist.** Wer ganz
// hineinzoomt, in die linke obere Ecke schiebt und dann wieder herauszoomt, hätte
// bei falscher Reihenfolge ein Quadrat, das links oben aus dem Bild hängt — also
// weiße Ecken im Kreis. Bei richtiger Reihenfolge zieht der wachsende Ausschnitt
// den Mittelpunkt von selbst zurück.
let s = { zoom: Z.ZUSCHNITT_MAX_ZOOM, mitteX: 0, mitteY: 0 };
s = Z.zuschnittZoomen(HOCHKANT, s, 1); // klemmt in die Ecke
const ecke = Z.zuschnittRechteck(HOCHKANT, s);
pruef('ganz hineingezoomt sitzt er in der Ecke', [ecke.originX, ecke.originY], [0, 0]);
s = Z.zuschnittZoomen(HOCHKANT, s, 0.01); // ganz heraus
const heraus = Z.zuschnittRechteck(HOCHKANT, s);
pruef(
  'nach dem Herauszoomen h\u00e4ngt er nicht mehr heraus',
  heraus.originX >= 0 && heraus.originY >= 0 && heraus.originY + heraus.height <= HOCHKANT.hoehe,
  true,
);
// ⚠️ **Hier stand zuerst die Erwartung, er sitze wieder MITTIG (originY 504) — und
// das war der Fehler des Pr\u00fcfstands, nicht der Regel.** Mittig zur\u00fcckspringen w\u00fcrde
// die Wahl wegwerfen, die der Mensch gerade getroffen hat. Richtig ist: nur so weit
// zur\u00fcckziehen, bis es hineinpasst. Deshalb wird jetzt beides gefragt — dass er
// drin liegt UND dass er oben geblieben ist.
pruef('… und bleibt oben, wo der Mensch hingeschoben hatte', heraus.originY, 0);

abschnitt('Kneifen multipliziert, es addiert nicht');
pruef('zweimal 1,5 ist 2,25 — nicht 2,0', Z.zuschnittZoomen(QUADRAT, Z.zuschnittZoomen(QUADRAT, Z.zuschnittAnfang(QUADRAT), 1.5), 1.5).zoom, 2.25);
pruef('ein Faktor 0 ändert nichts, statt alles zu zerlegen', Z.zuschnittZoomen(QUADRAT, { zoom: 2, mitteX: 1000, mitteY: 1000 }, 0).zoom, 2);
pruef('ein NaN-Faktor auch nicht', Z.zuschnittZoomen(QUADRAT, { zoom: 2, mitteX: 1000, mitteY: 1000 }, NaN).zoom, 2);

abschnitt('Das Vorzeichen beim Schieben — der Finger zieht das BILD');
// Zieht man das Bild nach RECHTS (dx > 0), wandert das FENSTER nach links, der
// Ausschnitt zeigt also weiter links liegende Pixel. Ohne diese Prüfung wäre ein
// vertauschtes Minus im Screen nie aufgefallen — das Bild bewegt sich ja.
const mitte = { zoom: 2, mitteX: 2016, mitteY: 1512 };
const nachRechts = Z.zuschnittSchieben(QUER, mitte, 50, 0, 390);
pruef('Bild nach rechts ⇒ Ausschnitt wandert nach links', nachRechts.mitteX < mitte.mitteX, true);
const nachUnten = Z.zuschnittSchieben(QUER, mitte, 0, 50, 390);
pruef('Bild nach unten ⇒ Ausschnitt wandert nach oben', nachUnten.mitteY < mitte.mitteY, true);
// Ein Punkt Fingerweg entspricht genau `Ausschnittkante / Fensterbreite` Pixeln.
// Bei Zoom 2 auf einem 390-Punkte-Fenster: 3024/2/390 = 3,877… Pixel je Punkt.
pruef(
  '… und ein Punkt ist genau Kante/Fenster Pixel',
  Math.abs(mitte.mitteX - nachRechts.mitteX - 50 * (3024 / 2 / 390)) < 1e-9,
  true,
);
pruef('ein Fenster ohne Breite macht daraus kein NaN', Number.isFinite(Z.zuschnittSchieben(QUER, mitte, 50, 0, 0).mitteX), true);
pruef('ein NaN-Fingerweg lässt die Sicht stehen', Z.zuschnittSchieben(QUER, mitte, NaN, NaN, 390), mitte);

abschnitt('Es wird nie hochgerechnet');
pruef('ein großer Ausschnitt wird auf Ians 512 gebracht', Z.zuschnittZielKante({ originX: 0, originY: 0, width: 3024, height: 3024 }), 512);
pruef('ein kleiner bleibt, wie er ist', Z.zuschnittZielKante({ originX: 0, originY: 0, width: 200, height: 200 }), 200);
pruef('genau 512 bleibt 512', Z.zuschnittZielKante({ originX: 0, originY: 0, width: 512, height: 512 }), 512);
pruef(
  '… und ein 300er-Foto liefert einen 300er-Ausschnitt, keinen aufgeblasenen',
  Z.zuschnittZielKante(Z.zuschnittRechteck(KLEIN, Z.zuschnittAnfang(KLEIN))),
  300,
);

abschnitt('Ein Bild, das keines ist, wird nicht stillschweigend gerechnet');
for (const kaputt of [{ breite: 0, hoehe: 100 }, { breite: 100, hoehe: 0 }, { breite: NaN, hoehe: 100 }, { breite: -5, hoehe: 5 }]) {
  pruef(`${JSON.stringify(kaputt)} gilt nicht als zuschneidbar`, Z.istZuschneidbar(kaputt), false);
  let warf = false;
  try {
    Z.zuschnittRechteck(kaputt, Z.zuschnittAnfang(kaputt));
  } catch {
    warf = true;
  }
  pruef('… und das Rechteck wirft, statt Unsinn zu liefern', warf, true);
}
pruef('ein gewöhnliches Foto schon', Z.istZuschneidbar(HOCHKANT), true);

abschnitt('Die Sätze sind in Ians Sprache');
const folgen = Z.zuschnittFolgen();
pruef('es sind zwei', folgen.length, 2);
// Derselbe Maßstab wie bei `bildFolgen()`: Was auf dem Schirm steht, darf nicht
// nach Werkstatt klingen (der Fund vom 2026-09-03).
for (const wort of ['px', 'Pixel', 'JPEG', 'Zoom', 'crop']) {
  pruef(`kein „${wort}" auf dem Bildschirm`, folgen.some((f) => f.includes(wort)), false);
}
pruef('… und gesagt wird, dass der Rest weg ist', folgen.some((f) => f.includes('weg')), true);

console.log(`\n  ${ok} Häkchen, ${weg} Kreuze\n`);
process.exit(weg === 0 ? 0 : 1);
