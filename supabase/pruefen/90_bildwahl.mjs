/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  90 — base64 → BYTES, gegen ECHTE Bilddateien
 *  Phase 20.6-b. Aufruf über `90_bildwahl.sh`, nie direkt.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  ── Was hier geprüft wird ───────────────────────────────────────────────────
 *  Die einzige Stelle des Bildwählers, die weder ein Gerät noch eine Datenbank
 *  braucht — und ausgerechnet die, an der ein Fehler UNSICHTBAR wäre: Ein um ein
 *  Byte verschobener Dekoder ergibt kein Bild, das schief aussieht, sondern eine
 *  Datei, die der Bucket klaglos annimmt und die niemand öffnen kann.
 *
 *  ── Warum gegen echte Dateien ───────────────────────────────────────────────
 *  Ein von Hand getippter base64-Text ist kurz, sauber und durch vier teilbar. Ein
 *  echtes Bild enthält jedes Byte von 0x00 bis 0xFF, ist Millionen Zeichen lang und
 *  endet je nach Größe mit `=`, `==` oder gar nichts — also genau die drei Fälle,
 *  die der Dekoder unterscheiden muss, ohne dass man sie extra baut.
 *
 *  Die Gegenprobe ist Node selbst: `Buffer.from(b64, 'base64')` ist eine ANDERE
 *  Umsetzung derselben Norm. Stimmen beide überein, ist das ein Vergleich und
 *  keine Wiederholung derselben Annahme.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ARBEIT = process.env.ARBEIT;
const WURZEL = process.env.WURZEL;
if (!ARBEIT || !WURZEL) {
  console.error('Nicht direkt aufrufen — `90_bildwahl.sh` benutzen.');
  process.exit(2);
}
const JS = join(ARBEIT, 'js');

const { base64ZuBytes, base64Bytes } = await import(join(JS, 'lib', 'base64.mjs'));
const { BILD_MAX_BYTES, bildHuerdeText } = await import(join(JS, 'features', 'social', 'bild.mjs'));

let haken = 0;
let kreuze = 0;
function pruef(was, ist, soll) {
  if (JSON.stringify(ist) === JSON.stringify(soll)) {
    haken += 1;
    console.log(`  ✓ ${was}`);
  } else {
    kreuze += 1;
    console.log(`  ✗ ${was}\n      ist:  ${JSON.stringify(ist)}\n      soll: ${JSON.stringify(soll)}`);
  }
}
const abschnitt = (t) => console.log(`\n── ${t} ${'─'.repeat(Math.max(0, 70 - t.length))}`);

// ═══════════════════════════════════════════════════════════════════════════════
//  1. ECHTE BILDER — der Kern
// ═══════════════════════════════════════════════════════════════════════════════
abschnitt('Echte Bilddateien, hin und zurück');

// Die Belege aus dem Projekt: echte PNGs vom Simulator und ein Foto von Ians
// Handy. Bewusst NICHT erzeugt — ein selbst geschriebenes Bild hätte die
// Gleichförmigkeit, an der ein Dekoder-Fehler vorbeirutscht.
const BELEGE = join(WURZEL, '..', '_belege');
let dateien = [];
try {
  dateien = readdirSync(BELEGE)
    .filter((n) => /\.(png|jpe?g)$/i.test(n))
    .map((n) => join(BELEGE, n))
    .filter((p) => statSync(p).size > 1024)
    .sort((a, b) => statSync(a).size - statSync(b).size);
} catch {
  /* Ordner fehlt — wird unten gemeldet */
}
// Dazu Ians Vorbild-Screenshot (2,6 MB) aus dem Projektordner: das größte echte
// Bild, das hier ohne Netz erreichbar ist.
for (const n of ['vorbild-liquid-glass-bierbuddy.png']) {
  const p = join(WURZEL, '..', n);
  try { if (statSync(p).size > 0) dateien.push(p); } catch { /* egal */ }
}

if (dateien.length < 3) {
  console.log(`  ✗ Zu wenige echte Bilder gefunden (${dateien.length}) — der Prüfstand misst dann nichts.`);
  process.exit(1);
}

// Drei Größen: das kleinste, ein mittleres, das größte.
const auswahl = [dateien[0], dateien[Math.floor(dateien.length / 2)], dateien[dateien.length - 1]];

// ── Und JEDE davon in allen drei Restklassen von `% 3` ──────────────────────
// **Das ist die eigentliche Prüfung, und sie steht hier, weil die erste Fassung
// am Zufall hing.** Die Füllzeichen (`=`, `==`, keines) hängen an `länge % 3`,
// nicht an der Größe — eine Auswahl nach „kleinstes/mittleres/größtes" trifft
// die drei Fälle also nur mit Glück. Gemessen: Ein absichtlich eingebauter
// Bit-Versatz (`bits >= 8` → `bits > 8`) fiel AUSSCHLIESSLICH bei `% 3 == 0`
// auf; wäre der eine Beleg mit dieser Länge nicht dabei gewesen, wäre der Lauf
// grün und der Dekoder kaputt gewesen.
//
// Der Kommentar der ersten Fassung wusste das übrigens schon und der Code nicht
// — dieselbe Lage wie der Wächter in `50_lesen.sh` (harte Regel 83).
for (const pfad of auswahl) {
  const ganz = readFileSync(pfad);
  const kurz = pfad.split('/').pop().slice(0, 30);

  for (const abzug of [0, 1, 2]) {
    // Hinten anschneiden statt vorne: Ein PNG/JPEG behält so seinen echten Kopf,
    // und die Bytes bleiben die einer echten Datei.
    const roh = ganz.subarray(0, ganz.length - abzug);
    const b64 = roh.toString('base64');
    const rest = roh.length % 3;
    const fuell = rest === 0 ? 'ohne =' : rest === 1 ? '=='    : '=';

    const bytes = base64ZuBytes(b64);
    pruef(`${kurz} · ${roh.length} B · %3=${rest} · ${fuell} · Byte für Byte gleich`,
      Buffer.from(bytes).equals(Buffer.from(roh)), true);
    pruef(`${kurz} · ${roh.length} B · base64Bytes() ohne Dekodieren`, base64Bytes(b64), roh.length);
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
//  2. GEGEN EINE ZWEITE UMSETZUNG — kein Selbstgespräch
// ═══════════════════════════════════════════════════════════════════════════════
abschnitt('Gegenprobe gegen Nodes eigenen Dekoder');

// Alle drei Restklassen von `% 3` ausdrücklich, damit keine davon nur zufällig
// vorkam. 0xFF und 0x00 sind absichtlich dabei: Ein „binary string"-Umweg über
// `atob` verliert genau an diesen beiden.
for (const n of [1, 2, 3, 255, 256, 257]) {
  const roh = Buffer.alloc(n);
  for (let i = 0; i < n; i++) roh[i] = (i * 37) % 256;
  const b64 = roh.toString('base64');
  pruef(`${n} Byte · gleich wie Buffer.from(…, 'base64')`,
    Buffer.from(base64ZuBytes(b64)).equals(Buffer.from(b64, 'base64')), true);
}
{
  // Alle 256 Bytewerte in einer Datei — der Fall, den ein Zeichenketten-Umweg
  // nicht überlebt.
  const alle = Buffer.from(Array.from({ length: 256 }, (_, i) => i));
  pruef('alle 256 Bytewerte · Byte für Byte gleich',
    Buffer.from(base64ZuBytes(alle.toString('base64'))).equals(alle), true);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  3. RÄNDER — was ankommen kann, ohne dass jemand etwas falsch gemacht hat
// ═══════════════════════════════════════════════════════════════════════════════
abschnitt('Ränder');

pruef('leerer Text ergibt 0 Byte', base64ZuBytes('').length, 0);
pruef('leerer Text · base64Bytes()', base64Bytes(''), 0);

// Umgebrochener base64 kommt aus fremden Quellen vor. Ein Bild deswegen
// abzulehnen wäre eine Absage ohne Sache dahinter.
{
  const roh = Buffer.from('Ein Bild ist auch nur eine Folge von Bytes.', 'utf8');
  const b64 = roh.toString('base64');
  const umgebrochen = b64.replace(/(.{8})/g, '$1\n');
  pruef('mit Zeilenumbrüchen · trotzdem derselbe Inhalt',
    Buffer.from(base64ZuBytes(umgebrochen)).equals(roh), true);
}

// Ein abgeschnittener Text darf KEIN mit Nullen aufgefülltes Bild ergeben: Ein
// halbes JPEG erkennt man, ein aufgefülltes sieht heil aus.
{
  const roh = Buffer.alloc(300, 7);
  const b64 = roh.toString('base64');
  const halb = b64.slice(0, 200);
  const bytes = base64ZuBytes(halb);
  pruef('abgeschnitten · kürzer statt mit Nullen aufgefüllt', bytes.length < 300 && bytes.length > 0, true);
  pruef('abgeschnitten · kein einziges Null-Byte angehängt', bytes.every((b) => b === 7), true);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  4. DIE HÜRDE — die Größe wird VOR dem Dekodieren gefragt
// ═══════════════════════════════════════════════════════════════════════════════
abschnitt('Die Hürde greift vor dem Dekodieren');

{
  // Der Grund, warum `base64Bytes()` überhaupt getrennt existiert: Bei einem zu
  // großen Bild darf nichts dekodiert werden. Gemessen wird die ZAHL, nicht der
  // Speicher — aber die Zahl ist das, woran die Entscheidung hängt.
  const zuGross = BILD_MAX_BYTES + 1;
  const b64Laenge = Math.ceil(zuGross / 3) * 4;
  pruef('gerechnete Größe trifft die Grenze',
    base64Bytes('A'.repeat(b64Laenge)) > BILD_MAX_BYTES, true);
  pruef('und die Hürde sagt es auf Deutsch',
    bildHuerdeText('image/jpeg', zuGross), 'Das Bild ist zu groß — 5 MB sind das Höchste.');
  pruef('ein Bild knapp darunter geht durch',
    bildHuerdeText('image/jpeg', BILD_MAX_BYTES), null);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  5. DER FUND DER PHASE — HEIC
// ═══════════════════════════════════════════════════════════════════════════════
abschnitt('HEIC — der Grund für `base64: true`');

// Gemessen in `node_modules/expo-image-picker/ios/ImageUtils.swift`:
//   Zeile 147: `case UTType.heic.identifier: return (rawData, ".heic")`
//   Zeile 206: base64 wird „always JPEG regardless of the source format"
// Hätte der native Zweig `asset.mimeType` genommen, bekäme jedes gewöhnliche
// iPhone-Foto eine Absage. Diese zwei Zeilen halten das fest, damit es auffällt,
// falls jemand `BILD_TYPEN` oder den Zweig später umstellt.
pruef('image/heic ist NICHT erlaubt — deshalb darf `uri` nicht die Quelle sein',
  bildHuerdeText('image/heic', 1000), 'Das geht nur als JPG, PNG oder WebP.');
pruef('image/jpeg ist erlaubt — und base64 liefert immer JPEG',
  bildHuerdeText('image/jpeg', 1000), null);

// ═══════════════════════════════════════════════════════════════════════════════
//  6. DER FUND VOM GERÄT — ES GIBT DORT KEIN `crypto`
//
//  Am 2026-09-13 ist Ians Profilbild am iPhone lautlos gescheitert: Bildwähler und
//  Zuschnitt liefen, danach war der Bildschirm unverändert, `photo_url` leer und
//  der Bucket leer. Ursache war `zufallsName()` in `bild.ts` — sie holte den
//  Dateinamen aus `globalThis.crypto`, und **React Native hat keines**.
//
//  ⚠️ **Warum dieser Prüfstand ihn nicht finden KONNTE, und das ist die Lehre:**
//  Er läuft in Node, und Node HAT `globalThis.crypto`. Der Browser auch. Die
//  Attrappen-Falle in ihrer schärfsten Form — die Prüfumgebung bringt etwas mit,
//  das das Gerät nicht hat, und deshalb war jede Messung grün und wertlos.
//
//  Der Wächter dagegen muss die Umgebung ÄRMER machen, nicht reicher: `crypto`
//  wird für die Dauer der Messung weggenommen. Das ist dasselbe Vorgehen wie die
//  Gegenprobe in 96_anbieter (beide Schalterstellungen erzwingen) — nicht messen,
//  was hier gilt, sondern was DORT gilt.
// ═══════════════════════════════════════════════════════════════════════════════
abschnitt('Kein `crypto` — die Lage auf dem Gerät');

const { bildPfad, ZUFALL_MUSTER } = await import(`${ARBEIT}/js/features/social/bild.mjs`);
const { zufallsHex } = await import(`${ARBEIT}/js/lib/zufall.mjs`);

const ICH = '11111111-1111-1111-1111-111111111111';

// Erst: Tut der Pfad, was er soll, wenn der Zufall in Ordnung ist?
const guterZufall = zufallsHex();
pruef('zufallsHex() gibt 32 Hex-Zeichen', ZUFALL_MUSTER.test(guterZufall), true);
pruef('zwei Aufrufe sind verschieden', zufallsHex() !== zufallsHex(), true);
pruef('der Pfad fängt mit meiner UUID an',
  bildPfad(ICH, 'image/jpeg', guterZufall).startsWith(`${ICH}/`), true);
pruef('und endet auf die Endung des Typs',
  bildPfad(ICH, 'image/jpeg', guterZufall).endsWith('.jpg'), true);

// **Die Gegenprobe, auf die es ankommt.** `bildPfad()` muss einen schwachen Namen
// ABWEISEN — bei einem offenen Bucket ist er die ganze Absicherung (Entscheidung
// 50). Ohne diese Prüfung sähe ein Pfad mit `Math.random()` genauso aus.
for (const [was, wert] of [
  ['zu kurz', 'abc'],
  ['keine Hex-Zeichen', 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz'],
  ['leer', ''],
  ['Großbuchstaben (nicht unser Format)', 'A'.repeat(32)],
]) {
  let geworfen = false;
  try { bildPfad(ICH, 'image/jpeg', wert); } catch { geworfen = true; }
  pruef(`ein Zufall, der ${was} ist, wird abgewiesen`, geworfen, true);
}

// **Und jetzt die Lage auf dem Gerät, nachgestellt.** Ohne `globalThis.crypto`
// muss die WEB-Fassung werfen — ein stiller Rückfall auf `Math.random()` wäre
// genau der Fehler, den `bild.ts` in seinem Kommentar ausschließt. Am Gerät nimmt
// `zufall.native.ts` diesen Weg gar nicht erst; geprüft wird hier, dass der
// Rückfall NICHT existiert.
const echtesCrypto = globalThis.crypto;
let ohneCryptoGeworfen = false;
try {
  Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true });
  zufallsHex();
} catch {
  ohneCryptoGeworfen = true;
} finally {
  Object.defineProperty(globalThis, 'crypto', { value: echtesCrypto, configurable: true });
}
pruef('ohne globalThis.crypto wird geworfen statt schwach geraten', ohneCryptoGeworfen, true);
pruef('und danach geht es wieder', ZUFALL_MUSTER.test(zufallsHex()), true);

// Der Wächter gegen den Rückweg: `bild.ts` darf `globalThis.crypto` nicht mehr
// kennen. Stünde es wieder drin, wäre der Fehler vom 13.09. zurück — und dieser
// Prüfstand bliebe grün, weil Node ein `crypto` hat.
const quelle = readFileSync(new URL('../../src/features/social/bild.ts', import.meta.url), 'utf8');
// ⚠️ Die KOMMENTARE werden vorher weggeschnitten, und das ist kein Feinschliff:
// Die erste Fassung greppte den rohen Text und schlug sofort an — an dem Absatz,
// der den Fehler vom 13.09. ERKLÄRT. In diesem Projekt steht die Begründung immer
// neben dem Code; ein Wächter, der Prosa nicht von Code unterscheidet, zwingt
// jemanden dazu, die Begründung zu löschen, um grün zu werden. Dann ist die Prüfung
// scharf und das Gedächtnis weg — und das ist der schlechtere Tausch.
const ohneKommentare = quelle
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((z) => !z.trimStart().startsWith('//'))
  .join('\n');
pruef('bild.ts fragt `globalThis.crypto` NICHT mehr (im CODE)',
  ohneKommentare.includes('globalThis.crypto'), false);
pruef('bild.ts hat weiterhin keine Laufzeit-Importe',
  /^import (?!type )/m.test(quelle), false);

console.log(`\n  ${haken} Häkchen, ${kreuze} Kreuze\n`);
process.exit(kreuze === 0 ? 0 : 1);
