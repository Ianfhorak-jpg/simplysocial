// ═══════════════════════════════════════════════════════════════════════════════
//  Ians Entscheidung 71 — was dasteht, wenn die APP SELBST einen Fehler hat.
//
//  Läuft in blankem Node. Gemessen wird die REGEL: dass ein Programmfehler an
//  allen drei Orten seinen eigenen Satz bekommt statt in den Netz-Rückfall zu
//  fallen — und dass auf keinem der drei ein Code oder Tabellenname steht.
// ═══════════════════════════════════════════════════════════════════════════════
const A = process.env.ARBEIT;
const { PROGRAMM_CODE, PROGRAMM_TEXT, PROGRAMM_TITEL, PROGRAMM_ERKLAERUNG, PROGRAMM_TABELLE, istProgrammFehler } =
  await import(`${A}/js/lib/programmfehler.mjs`);
const { schreibFehlerFolgen } = await import(`${A}/js/data/schreiben.mjs`);
const { ladeFehlerFolgen, ladeZeileFolgen } = await import(`${A}/js/data/quelle.mjs`);

let ok = 0;
let weg = 0;
function pruef(was, ist, soll) {
  const gleich = JSON.stringify(ist) === JSON.stringify(soll);
  if (gleich) ok++;
  else weg++;
  console.log(`  ${gleich ? '✓' : '✗'} ${was}${gleich ? '' : `\n      ist:  ${JSON.stringify(ist)}\n      soll: ${JSON.stringify(soll)}`}`);
}
function abschnitt(t) {
  console.log(`\n── ${t} ${'─'.repeat(Math.max(0, 68 - t.length))}`);
}

// Ein `SchreibFehler`/`LadeFehler` wird hier NICHT nachgebaut: Beide Funktionen
// lesen ausschließlich `.code`, und eine Attrappe der Klasse würde die Klasse
// prüfen statt die Regel.
const alsFehler = (code) => ({ code });

abschnitt('Der Code kollidiert mit keinem echten Fehlercode');
// Ein SQLSTATE ist FÜNF alphanumerische Zeichen. Stünde hier einer, bekäme eines
// Tages ein echter Datenbankfehler Ians Satz — und niemand würde es merken.
pruef('er ist kein SQLSTATE-Format', /^[0-9A-Za-z]{5}$/.test(PROGRAMM_CODE), false);
pruef('er trägt ein Zeichen, das in keinem SQLSTATE vorkommt', PROGRAMM_CODE.includes('/'), true);
for (const echt of ['42501', '23505', 'PGRST301', 'P0001', '22P02', '23514']) {
  pruef(`\`${echt}\` gilt NICHT als Programmfehler`, istProgrammFehler(echt), false);
}
pruef('der eigene Code schon', istProgrammFehler(PROGRAMM_CODE), true);

abschnitt('Die Leiste (Schreiben) — Ians Wortlaut steht da');
const s = schreibFehlerFolgen(alsFehler(PROGRAMM_CODE));
pruef('der Satz ist Ians', s.text, PROGRAMM_TEXT);
// **Die Gegenprobe, auf die es ankommt.** Ohne den neuen Zweig fiele ein
// Programmfehler in den Rückfall und behauptete „meistens liegt es am Netz" —
// genau die Verwechslung, die Entscheidung 71 abschafft. Verglichen wird deshalb
// GEGEN den Rückfall und nicht gegen eine Zeichenkette.
const sNetz = schreibFehlerFolgen(alsFehler('08006'));
pruef('… und ein ANDERER als der Netz-Satz', s.text === sNetz.text, false);
pruef('… der Netz-Satz nennt wirklich das Netz', sNetz.text.includes('Netz'), true);
pruef('… Ians Satz nennt es NICHT', s.text.includes('Netz'), false);
// Ein Knopf, der erkennbar nichts ändert, ist eine Schleife, die wie ein Defekt
// aussieht (harte Regel 76). Bei der Leiste steht der Inhalt darunter schon.
pruef('… und der Knopf lädt nicht neu', s.knopf === sNetz.knopf, false);
pruef('… „nicht mehr angemeldet" bleibt unberührt', schreibFehlerFolgen(alsFehler('42501')).anmeldenNoetig, true);

abschnitt('Der Kasten (erstes Laden) — Titel UND Erklärung');
const k = ladeFehlerFolgen(alsFehler(PROGRAMM_CODE));
pruef('Titel und Erklärung kommen aus der Regel-Datei', [k.titel, k.text], [PROGRAMM_TITEL, PROGRAMM_ERKLAERUNG]);
const kNetz = ladeFehlerFolgen(alsFehler('08006'));
pruef('… und sind andere als beim Netz', k.titel === kNetz.titel, false);
// Der Kasten IST der Bildschirm — ohne Knopf verlässt man ihn nur durch einen
// Neustart. Das ist die Auslegung, die in `lib/programmfehler.ts` steht.
pruef('… der Knopf ist nicht leer (keine Sackgasse)', k.knopf.length > 0, true);
pruef('… und er meldet nicht fälschlich „anmelden"', k.anmeldenNoetig, false);

abschnitt('Die leise Zeile (Nachladen) — derselbe kurze Satz');
const z = ladeZeileFolgen(alsFehler(PROGRAMM_CODE));
pruef('sie sagt dasselbe wie die Leiste', z.text, PROGRAMM_TEXT);
pruef('… und nicht dasselbe wie bei kein Netz', z.text === ladeZeileFolgen(alsFehler('08006')).text, false);

abschnitt('Kein Code, kein Tabellenname auf dem Bildschirm');
// Der Fund vom 2026-09-03: Entwickler-Notizen in JSX-Text sind öffentlich.
for (const [wo, text] of [['Leiste', s.text], ['Kasten-Titel', k.titel], ['Kasten-Text', k.text], ['Zeile', z.text]]) {
  pruef(`${wo} trägt weder Code noch Tabelle`, text.includes(PROGRAMM_CODE) || text.includes(PROGRAMM_TABELLE), false);
}

console.log(`\n  ${ok} Häkchen, ${weg} Kreuze\n`);
process.exit(weg === 0 ? 0 : 1);
