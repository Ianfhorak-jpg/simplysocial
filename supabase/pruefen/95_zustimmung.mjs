/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DIE ZUSTIMMUNG — Phase 21.2, Ians Entscheidung 80.
 *  Aufruf über `95_zustimmung.sh` (npm run pruef-zustimmung).
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  ── Die Attrappe ist auch hier der ZEUGE, nicht der Prüfling ───────────────
 *  Derselbe Kniff wie in `93_demoregel.mjs`. Geprüft wird, dass `profilAnlegen()`
 *  ohne Zustimmung **gar nicht erst sendet**. Die Attrappe steht nur da, um
 *  mitzuschreiben, ob sie gerufen wurde. Wird sie gerufen, ist der Riegel
 *  gebrochen — eine Tatsache über den echten Code, nicht über die Attrappe.
 */
const { pathToFileURL } = await import('node:url');
const { readFileSync } = await import('node:fs');
const js = (p) => pathToFileURL(`${process.env.ARBEIT}/js/${p}`).href;
const quelle = (p) => readFileSync(`${process.env.WURZEL}/${p}`, 'utf8');

/**
 * Derselbe Text ohne Kommentare.
 *
 * ⚠️ **Beim ersten Lauf am 2026-09-14 war dieser Prüfstand aus genau diesem Grund
 * rot** — zweimal, und beide Male zu Unrecht: „Prototyp" stand fünfmal in
 * `Nutzungsbedingungen.tsx`, weil der Kommentar ausführlich begründet, warum es
 * dort nicht mehr stehen darf. `not null` stand in der Migration, weil dort
 * erklärt wird, warum die Spalten KEIN `not null` haben.
 *
 * Das ist die Falle *„Ein `sed` auf einen Wert trifft auch den KOMMENTAR daneben"*,
 * eine Ebene höher: **Ein Wächter, der die eigene Begründung für den Verstoß hält,
 * wird abgeschaltet statt gelesen.** Gemessen wird ab jetzt, was LÄUFT.
 */
const ohneKommentare = (text) =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, '')   // /* … */ und JSDoc
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '') // {/* … */} in JSX
    .replace(/^\s*\/\/.*$/gm, '')        // // am Zeilenanfang
    .replace(/^\s*--.*$/gm, '');           // -- in SQL

const zustimmung = await import(js('features/auth/zustimmung.js'));
const konten = await import(js('features/auth/konten.js'));

let ja = 0;
let nein = 0;
function pruef(bedingung, satz) {
  if (bedingung) {
    ja += 1;
    console.log(`  ✓ ${satz}`);
  } else {
    nein += 1;
    console.log(`  ✗ ${satz}`);
  }
}

console.log('── 1. Die Fassung ───────────────────────────────────────────────────────');

pruef(typeof zustimmung.FASSUNG === 'string' && zustimmung.FASSUNG.length > 0,
  'FASSUNG ist gesetzt — ohne sie steht in der Datenbank eine leere Zusage');
// Nicht `includes('2026')`: Das wäre beim Jahreswechsel rot, ohne dass etwas
// kaputt ist. Geprüft wird die FORM, aus der `fassungText()` rechnet.
pruef(/^\d{4}-\d{2}-\d{2}(-|$)/.test(zustimmung.FASSUNG),
  'FASSUNG fängt mit einem Datum JJJJ-MM-TT an — daraus rechnet fassungText()');

const gezeigt = zustimmung.fassungText();
pruef(gezeigt.includes('.') && !gezeigt.includes('-'),
  `fassungText() ist für Menschen lesbar und nicht die rohe Kennung ("${gezeigt}")`);
// Die Gegenprobe zu „wird gerechnet, nicht zweimal getippt": Beide müssen
// dieselben Zahlen tragen. Liefe eine von beiden weg, fiele es hier auf.
const zahlenFassung = zustimmung.FASSUNG.match(/\d+/g).slice(0, 3).join('');
const zahlenText = gezeigt.match(/\d+/g).join('');
pruef([...zahlenFassung].sort().join('') === [...zahlenText].sort().join(''),
  'fassungText() trägt dieselben Ziffern wie FASSUNG — sie ist gerechnet, nicht getippt');

console.log();
console.log('── 2. Was die Regel sagt ────────────────────────────────────────────────');

pruef(zustimmung.darfAnlegen(true) === true, 'Mit Häkchen: darf angelegt werden');
pruef(zustimmung.darfAnlegen(false) === false, 'Ohne Häkchen: darf NICHT angelegt werden');

pruef(zustimmung.zustimmungFehltText(true) === null,
  'Mit Häkchen gibt es keinen Mangel');
const satz = zustimmung.zustimmungFehltText(false);
pruef(typeof satz === 'string' && satz.length > 0,
  'Ohne Häkchen kommt ein SATZ und kein blosses false');
// Dieselbe Überlegung wie bei `fehltNoch()` in `konto.ts`: „Es fehlt noch was"
// ohne zu sagen, was, ist eine Sackgasse.
pruef(/häkchen/i.test(satz), '… und der Satz nennt das Häkchen beim Namen');

const jetzt = zustimmung.zustimmungJetzt(new Date('2026-09-14T18:22:00Z'));
pruef(jetzt.wann === '2026-09-14T18:22:00.000Z',
  'zustimmungJetzt() schreibt einen ISO-Zeitstempel');
pruef(jetzt.fassung === zustimmung.FASSUNG,
  '… und IMMER die aktuelle FASSUNG, nie eine mitgegebene');

pruef(zustimmung.brauchtNeueZustimmung(null) === true,
  'Wer nie zugestimmt hat, braucht eine Zustimmung');
pruef(zustimmung.brauchtNeueZustimmung(jetzt) === false,
  'Wer zugestimmt hat, wird nicht noch einmal gefragt');

console.log();
console.log('── 3. Der RIEGEL — und er sitzt VOR dem Netz ────────────────────────────');

// Die Attrappe: Sie schreibt mit, ob jemand sie angefasst hat. Käme der Code
// bis hierher, hätte er bereits eine Zeile zu schreiben versucht.
let angefasst = false;
const zeuge = {
  from() {
    angefasst = true;
    return {
      insert: async () => {
        angefasst = true;
        return { error: null };
      },
    };
  },
};

const ohneHaken = {
  authId: '11111111-1111-1111-1111-111111111111',
  name: 'Testfall',
  bezirk: '1070',
  jahrgang: 2009,
  zugestimmt: false,
};

let geworfen = null;
try {
  await konten.profilAnlegen(ohneHaken, zeuge);
} catch (f) {
  geworfen = f;
}

pruef(geworfen !== null, 'Ohne Zustimmung wirft profilAnlegen()');
pruef(angefasst === false,
  '… und zwar OHNE die Datenbank anzufassen — der Riegel steht vor dem Netz');
pruef(geworfen !== null && geworfen.constructor.name === 'KontoFehler',
  '… als KontoFehler, damit der Weg nach oben derselbe ist wie bei jedem anderen Fehler');

// Die Gegenprobe: MIT Häkchen muss die Attrappe gerufen werden. Ohne sie prüfte
// der Lauf oben vielleicht nur, dass profilAnlegen() überhaupt nie sendet.
angefasst = false;
await konten.profilAnlegen({ ...ohneHaken, zugestimmt: true }, zeuge);
pruef(angefasst === true,
  'Gegenprobe: MIT Zustimmung wird wirklich geschrieben — sonst prüfte das oben nichts');

console.log();
console.log('── 4. Das Häkchen ist nicht vorab gesetzt ───────────────────────────────');

const erstesKonto = quelle('src/components/ErstesKonto.tsx');
pruef(/const \[zugestimmt, setZugestimmt\] = useState\(false\)/.test(erstesKonto),
  'Das Häkchen beginnt bei false — ein vorangekreuztes Kästchen ist keine Einwilligung');
// Gegenprobe im selben Text: Die Suche findet überhaupt `useState`-Zeilen.
// Eine Textsuche mit null Treffern beweist nichts (FALLEN.md).
pruef(/useState\(/.test(erstesKonto),
  'Gegenprobe: useState-Zeilen gibt es in dieser Datei wirklich');
pruef(erstesKonto.includes('zugestimmt,'),
  'Der Wert wird an kontoAnlegen() durchgereicht und nicht im Bildschirm verschluckt');

console.log();
console.log('── 5. Kein „Prototyp" im Build, der zu Apple geht ───────────────────────');

// Der Fund vom 2026-09-14: Der Satz stand fest im JSX der Nutzungsbedingungen —
// ausgerechnet auf dem Screen, den ein Reviewer bei einer 1.2-App aufmacht.
// Apple weist Apps zurueck, die sich als Beta- oder Testfassung ausgeben.
const bedingungen = ohneKommentare(quelle('src/components/Nutzungsbedingungen.tsx'));
pruef(/ANMELDE_QUELLE === 'attrappe'/.test(bedingungen),
  'Die Fußzeile hängt am Schalter und steht nicht fest im JSX');
// Die schärfere Frage: Steht „Prototyp" IRGENDWO im laufenden Code ausser in
// der einen Verzweigung? Gezählt wird, nicht gefühlt — und zwar ohne Kommentare,
// sonst zählte die Begründung als Verstoß.
const prototypStellen = (bedingungen.match(/Prototyp/g) ?? []).length;
pruef(prototypStellen === 1,
  `„Prototyp" steht im Code genau EINMAL, in der Verzweigung (gefunden: ${prototypStellen})`);
// Gegenprobe: Die Kommentar-Entfernung darf nicht einfach ALLES weggeputzt haben.
pruef(bedingungen.includes('fussText') && bedingungen.length > 500,
  'Gegenprobe: ohneKommentare() lässt den Code stehen und nicht nur Leerraum');
pruef(/fassungText\(\)/.test(bedingungen),
  'Im echten Build steht stattdessen die Fassung — nicht nur nichts');

console.log();
console.log('── 6. Die Datenbank trägt die Regel mit ─────────────────────────────────');

const migration = ohneKommentare(quelle('supabase/migrations/0011_zustimmung.sql'));
pruef(/add column terms_accepted_at/.test(migration) && /add column terms_version/.test(migration),
  'Beide Spalten werden angelegt');
pruef(/check \(\(terms_accepted_at is null\) = \(terms_version is null\)\)/.test(migration),
  'Der CHECK prüft sie GEGENEINANDER — ein Zeitpunkt ohne Fassung kann nicht entstehen');
// `add column X typ;` ohne `not null` und ohne `default` — geprüft an der
// Anweisung selbst, nicht an der ganzen Datei.
const addBlock = migration.split('add constraint')[0];
pruef(!/not null/i.test(addBlock),
  'Die Spalten sind null-fähig — wer nie gefragt wurde, trägt keine erfundene Zustimmung');
pruef(!/default/i.test(addBlock),
  '… und ohne default: ein Default wäre eine Zustimmung, die niemand gegeben hat');

console.log();
console.log(`════ ${ja} Häkchen · ${nein} Kreuze ════`);
process.exit(nein === 0 ? 0 : 1);
