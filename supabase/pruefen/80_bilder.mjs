/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  80 — DIE PROFILBILDER, am ECHTEN Server
 *  Phase 20.6. Aufruf über `80_bilder.sh`, nie direkt.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  ── Was hier geprüft wird, das `25_bilder.sql` prinzipiell nicht kann ────────
 *  25 prüft die vier Policies gegen eine Wegwerf-Datenbank — also gegen Postgres.
 *  Bei einem OFFENEN Bucket wird Postgres beim Abruf aber gar nicht gefragt: Die
 *  Datei kommt vom Storage-Dienst und aus dem CDN davor. **Die zentrale Zusage aus
 *  Ians Entscheidung 50 liegt damit vollständig außerhalb von allem, was lokal
 *  messbar ist:**
 *
 *      „Wenn du es austauschst, ist das alte sofort weg."
 *
 *  Ob das stimmt, weiß nur eine echte HTTP-Anfrage an die echte Adresse. Genau
 *  darum gibt es diese Datei — und sie fragt mit `fetch`, nicht mit `supabase-js`:
 *  Ein Client, der ein Token mitschickt, prüft einen anderen Weg als den, den ein
 *  Fremder mit einer weitergeleiteten Adresse geht.
 *
 *  ── Der Wächter ─────────────────────────────────────────────────────────────
 *  Wie 50, 60 und 70: Ians Entscheidung 45, nur die eigenen festen IDs. Die
 *  Bilder liegen unter genau diesen UUIDs als Ordnernamen — der Prüfstand kann
 *  also gar nicht in einen fremden Ordner greifen, das verhindern dieselben
 *  Policies, die er misst.
 *
 *  ⚠️ **Und er räumt die DATEIEN selbst weg, nicht nur die Zeilen.** Ein `delete`
 *  in `storage.objects` nimmt die Zeile; die Datei im Speicher bleibt. Weil
 *  `storage.objects` an keinem Fremdschlüssel hängt (der Fund aus 0008), hilft auch
 *  das Löschen der Konten nicht. Deshalb steht das Aufräumen hier über die
 *  Storage-Schnittstelle, SOLANGE die Konten noch angemeldet sind.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HIER = dirname(fileURLToPath(import.meta.url));
const WURZEL = join(HIER, '..', '..');
const JS = join(process.env.ARBEIT, 'js');

const senden = await import(join(JS, 'data', 'senden.js'));
const { SchreibFehler } = await import(join(JS, 'data', 'schreiben.js'));
const bild = await import(join(JS, 'features', 'social', 'bild.js'));
const konto = await import(join(JS, 'features', 'safety', 'konto.js'));

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
const pruefWahr = (was, b) => pruef(was, b === true, true);
const abschnitt = (t) => console.log(`\n── ${t} ${'─'.repeat(Math.max(0, 70 - t.length))}`);

async function code(fn) {
  try {
    await fn();
    return 'DURCHGELASSEN';
  } catch (f) {
    if (f instanceof SchreibFehler) return f.code;
    return `FALSCHE SORTE: ${f?.message ?? f}`;
  }
}

// ── Zugang ───────────────────────────────────────────────────────────────────
const env = Object.fromEntries(
  readFileSync(join(WURZEL, '.env'), 'utf8')
    .split('\n')
    .filter((z) => z.includes('=') && !z.trimStart().startsWith('#'))
    .map((z) => [z.slice(0, z.indexOf('=')).trim(), z.slice(z.indexOf('=') + 1).trim()]),
);
const PASSWORT = process.env.PRUEF_PASSWORT;
if (!PASSWORT) {
  console.error('✗ PRUEF_PASSWORT fehlt — dieses Skript wird über 80_bilder.sh aufgerufen.');
  process.exit(2);
}

const IAN = '11111111-1111-1111-1111-111111111111';
const LEA = '22222222-2222-2222-2222-222222222222';
const mail = (id) => `pruef-${id.slice(0, 8)}@simplysocial.invalid`;

function neuerClient() {
  return createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
async function anmelden(id) {
  const sb = neuerClient();
  const { error } = await sb.auth.signInWithPassword({ email: mail(id), password: PASSWORT });
  if (error) {
    console.error(`  ✗ Anmelden als ${id.slice(0, 4)} gescheitert: ${error.message}`);
    process.exit(1);
  }
  return sb;
}

/**
 * Ein echtes 1×1-PNG, 67 Byte.
 *
 * Ein erfundener Buffer täte es NICHT: Supabase liest den Inhaltstyp aus dem, was
 * geschickt wird, und ein Bucket mit `allowed_mime_types` weist ab, was nicht
 * dazu passt. Eine Prüfung mit Zufallsbytes würde also entweder aus dem falschen
 * Grund scheitern oder aus dem falschen Grund durchgehen.
 */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

/** Die Adresse holen — so, wie ein Fremder sie ginge: ohne Token, ohne Client. */
async function abrufen(adresse) {
  const antwort = await fetch(adresse, { cache: 'no-store' });
  return {
    status: antwort.status,
    bytes: antwort.ok ? (await antwort.arrayBuffer()).byteLength : 0,
    // Seit 20.6-b mitgelesen: Auf dem Geräte-Weg (`Uint8Array`) reisen Typ und
    // Cache-Dauer als HEADER mit statt im `FormData`. Ob sie ankommen, sieht man
    // nur hier — am Objekt selbst steht danach nichts anderes.
    typ: antwort.headers.get('content-type'),
    cache: antwort.headers.get('cache-control'),
  };
}

/** Was die Adresse über ihr eigenes Zwischenlager sagt (Ians Entscheidung 51). */
async function kopfVon(adresse) {
  const antwort = await fetch(adresse, { cache: 'no-store' });
  await antwort.arrayBuffer();
  return antwort.headers.get('cache-control');
}

// ═════════════════════════════════════════════════════════════════════════════

const ian = await anmelden(IAN);
const lea = await anmelden(LEA);

// ⚠️ **Hier stand ein Abschnitt „Der Bucket steht", und er ist ganz weggefallen.**
// Er fragte `getBucket()` mit einem angemeldeten Client. Gemessen am 2026-09-12:
//
//     storage.buckets   rls = true,  policies = 0
//     getBucket()   →   "Bucket not found"
//
// Ein gewöhnlicher Nutzer darf Buckets gar nicht abfragen — und die Meldung sagt
// *es gibt ihn nicht*, wo *du darfst ihn nicht sehen* gemeint ist. Wer diesen Satz
// für bare Münze nimmt, sucht den Fehler in der Migration; dort ist keiner.
// (Ein früherer Lauf bekam `public: true` heraus, ein späterer „not found" —
// **warum, ist nicht geklärt**, und es wird hier auch nicht erfunden. Die Frage
// erübrigt sich, weil der Client die Antwort nicht braucht.)
//
// Die Bucket-Einstellungen misst deshalb `80_bilder.sh` über `psql` — dort, wo sie
// stehen. **Was sie BEWIRKEN, misst der Abschnitt „Der Server prüft selbst"
// weiter unten**, und das ist ohnehin die belastbarere Frage: Eine Zahl in einer
// Spalte ist eine Absicht, ein abgewiesenes SVG ist eine Wirkung.

// ── Wie eine `Bilddatei` aussieht, seit 20.6-b ─────────────────────────────────
// Der Typ trägt `inhalt` in zwei Gestalten: Im Browser ein `Blob`, auf dem Gerät
// ein `Uint8Array` (weil `storage-js` sagt, dass ein Blob auf React Native nicht
// funktioniert). `vorschau` braucht nur der Attrappen-Zweig und ist hier egal.
const alsBrowser = (bytes, typ = 'image/png') => ({
  inhalt: new Blob([bytes], { type: typ }),
  typ,
  bytes: bytes.length,
  vorschau: 'egal://prüfstand',
});
const alsGeraet = (bytes, typ = 'image/png') => ({
  inhalt: new Uint8Array(bytes),
  typ,
  bytes: bytes.length,
  vorschau: 'egal://prüfstand',
});

abschnitt('Ian setzt ein Profilbild');
let adresse1;
{
  adresse1 = await senden.profilbildSetzen(ian, alsBrowser(PNG), IAN);
  pruefWahr('`profilbildSetzen` gibt eine Adresse zurück', typeof adresse1 === 'string' && adresse1.length > 0);

  const { data } = await ian.from('profiles').select('photo_url').eq('id', IAN).single();
  pruef('… und sie steht am Profil', data?.photo_url, adresse1);

  // DIE Messung, für die es diese Datei gibt: ohne Token, ohne Client, wie ein
  // Fremder mit einer weitergeleiteten Adresse.
  const a = await abrufen(adresse1);
  pruef('… und ein Fremder ohne Anmeldung bekommt das Bild (Entscheidung 50 = A)', a.status, 200);
  pruef('… und zwar genau die hochgeladenen Bytes', a.bytes, PNG.length);
}

abschnitt('Der Weg, den das GERÄT nimmt — `Uint8Array` statt `Blob` (20.6-b)');
{
  // ── Warum das vom Mac aus messbar ist, obwohl hier kein iPhone steht ────────
  // `storage-js` entscheidet den Weg am TYP des Inhalts, nicht an der Plattform:
  // Ein `Blob` wird in ein `FormData` gewickelt, alles andere geht als roher Rumpf
  // hinaus — und nur dort setzt es `content-type` und `cache-control` als HEADER
  // (nachgelesen in `StorageFileApi.ts`, Zeile 99 ff.).
  //
  // Ein `Uint8Array`-Upload aus Node nimmt also **denselben Zweig wie React
  // Native**. Was hier NICHT geprüft wird, ist der Dialog davor — der gehört aufs
  // Gerät, wie der Erlaubnis-Dialog in 19h-2.
  const geraet = await abrufen(await senden.profilbildSetzen(ian, alsGeraet(PNG), IAN));
  pruefWahr('ein `Uint8Array` wird angenommen', geraet.status === 200);
  pruef('… und liefert genau die Bytes, die hineingingen', geraet.bytes, PNG.length);
  pruef('… und zwar mit dem richtigen Typ am Objekt', geraet.typ, 'image/png');

  // **Die Zeile, wegen der der Abschnitt hier steht:** Auf dem ArrayBuffer-Weg
  // reist Ians Entscheidung 51 als HEADER mit statt als FormData-Feld. Wäre sie
  // dabei verlorengegangen, nähme Supabase seine Voreinstellung von einer Stunde —
  // und `bildFolgen()` verspräche fünf Minuten. Genau der Satz, der am 12.09. schon
  // einmal gelogen hat.
  //
  // ⚠️ **Gefragt wird nicht nach einer Zeichenkette, sondern nach der GLEICHHEIT
  // der beiden Wege.** Die erste Fassung verglich mit `max-age=300` und war rot:
  // Supabase schreibt `public, max-age=300`. Das war kein Fehler im Code, sondern
  // eine zu wörtliche Erwartung — und hätte sie gestimmt, wäre sie trotzdem beim
  // nächsten `immutable` in Supabases Antwort rot geworden, ohne dass Ians
  // Entscheidung verletzt wäre. So misst die Zeile, worauf es ankommt: Das Gerät
  // bekommt dieselbe Zusage wie der Browser.
  const browser = await abrufen(await senden.profilbildSetzen(ian, alsBrowser(PNG), IAN));
  pruef('… und `cacheControl` überlebt den anderen Zweig (Entscheidung 51)',
    geraet.cache, browser.cache);
  pruefWahr(`… und beide tragen wirklich Ians ${bild.BILD_CACHE_SEKUNDEN} Sekunden`,
    /(^|[\s,])max-age=300($|[\s,;])/.test(geraet.cache ?? ''));
}

abschnitt('Der Dateiname ist die ganze Absicherung — also ist er nicht abzulesen');
{
  // Lea sieht Ians Ordner NICHT. Ohne diese Policy könnte sie den zufälligen Namen
  // ablesen, statt ihn raten zu müssen — und die Absicherung aus A wäre eine Zeile
  // weit weg (siehe `bildPfad()`).
  const { data } = await lea.storage.from(bild.BILD_BUCKET).list(IAN);
  pruef('Lea sieht in Ians Ordner nichts', (data ?? []).length, 0);

  // Und sie kann auch nichts hineinlegen.
  const hoch = await lea.storage
    .from(bild.BILD_BUCKET)
    .upload(`${IAN}/untergeschoben.png`, new Blob([PNG], { type: 'image/png' }), { contentType: 'image/png' });
  pruefWahr('… und kann Ian auch kein Bild unterschieben', hoch.error !== null);
  pruef('… und zwar mit 403, nicht mit „schon da"', hoch.error?.statusCode ?? hoch.error?.status, '403');
}

abschnitt('Austauschen — und der Befund, der Entscheidung 51 ausgelöst hat');
let adresse2;
{
  adresse2 = await senden.profilbildSetzen(ian, alsBrowser(PNG), IAN);
  pruefWahr('das zweite Bild bekommt eine ANDERE Adresse', adresse2 !== adresse1);

  const { data } = await ian.storage.from(bild.BILD_BUCKET).list(IAN);
  pruef('… und im Ordner liegt danach genau EINE Datei', (data ?? []).length, 1);

  const neu = await abrufen(adresse2);
  pruef('… und die neue Adresse liefert', neu.status, 200);

  // ❌ **Hier stand zuerst „… und die ALTE Adresse ist tot" mit `soll: 400`, und
  // die Prüfung war ROT.** Das war kein Fehler im Code, sondern eine falsche
  // Annahme über die Technik: Die DATEI ist sofort weg, aber Cloudflare liefert
  // sie aus seinem Zwischenlager weiter. Beide Tatsachen werden jetzt getrennt
  // gemessen, statt eine davon zu behaupten.
  const mitBuster = await abrufen(adresse1 + '?ohne-cache=' + Date.now());
  pruef('die alte DATEI ist wirklich weg (am Cache vorbei gefragt)', mitBuster.status, 400);

  // Und die Zahl, die Ian entschieden hat (51). Ohne sie stünde hier 3600 — der
  // Standard von `supabase-js` —, und `bildFolgen()` verspräche eine Stunde lang
  // etwas Falsches.
  const kopf = await kopfVon(adresse2);
  pruef(
    `die Adresse trägt Ians ${bild.BILD_CACHE_SEKUNDEN} Sekunden, nicht die 3600 von supabase-js`,
    kopf,
    `public, max-age=${bild.BILD_CACHE_SEKUNDEN}`,
  );
}

abschnitt('Der Server prüft selbst — nicht nur die App');
{
  // Ein SVG. `bildHuerdeText()` fängt es in der App ab; hier geht es absichtlich
  // an der App vorbei, direkt an den Bucket. **Das ist der Grund für die
  // Whitelist:** Ein SVG ist ein Bild und kann Skript enthalten, und es läge auf
  // unserer eigenen Adresse.
  const svg = new Blob(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], { type: 'image/svg+xml' });
  const hoch = await ian.storage
    .from(bild.BILD_BUCKET)
    .upload(`${IAN}/angriff.svg`, svg, { contentType: 'image/svg+xml' });
  pruefWahr('ein SVG wird vom BUCKET abgewiesen, nicht erst von der App', hoch.error !== null);

  // Und die Größe. 5 MB + 1 Byte — die Grenze steht am Bucket, nicht nur in
  // `BILD_MAX_BYTES`.
  const zuGross = new Blob([Buffer.alloc(bild.BILD_MAX_BYTES + 1)], { type: 'image/png' });
  const hoch2 = await ian.storage
    .from(bild.BILD_BUCKET)
    .upload(`${IAN}/zugross.png`, zuGross, { contentType: 'image/png' });
  pruefWahr('… und eine zu große Datei ebenso', hoch2.error !== null);

  // Die App sagt dazu einen Satz, den ein Mensch versteht — und zwar den über das
  // FORMAT, wenn beides zutrifft (siehe `bildHuerdeText()`).
  pruef('… und die App nennt bei beidem zuerst das Format',
        bild.bildHuerdeText('image/svg+xml', bild.BILD_MAX_BYTES * 4),
        'Das geht nur als JPG, PNG oder WebP.');
}

abschnitt('Entfernen');
{
  await senden.profilbildEntfernen(ian, IAN);
  const { data } = await ian.from('profiles').select('photo_url').eq('id', IAN).single();
  pruef('`photo_url` steht wieder auf null', data?.photo_url, null);

  const { data: liste } = await ian.storage.from(bild.BILD_BUCKET).list(IAN);
  pruef('… und der Ordner ist leer', (liste ?? []).length, 0);

  const weg = await abrufen(adresse2 + '?ohne-cache=' + Date.now());
  pruef('… und die Datei ist am Cache vorbei nicht mehr da', weg.status, 400);
}

abschnitt('Wer NIE ein Bild hatte — der Weg, den heute die Mehrheit geht');
{
  // `loeschVorgang()` in `safety/hooks.ts` räumt IMMER zuerst das Bild weg, auch bei
  // jemandem, der nie eines gesetzt hat. **Würde das werfen, wäre sein Konto
  // unlöschbar** — und Kontolöschen ist eine Apple-1.2-Pflicht. Das ist kein
  // Randfall: Am Handy lässt sich bis 20.6-b überhaupt kein Bild aussuchen.
  // Lea hat an dieser Stelle keines; der Abschnitt steht deshalb VOR dem nächsten.
  let geworfen = null;
  try {
    await senden.profilbildEntfernen(lea, LEA);
  } catch (f) {
    geworfen = f;
  }
  pruef('profilbildEntfernen läuft durch, obwohl gar kein Bild da ist',
        geworfen?.message ?? 'kein Fehler', 'kein Fehler');

  // Und die zweite Hälfte desselben Falls: Die Leiste darf dann auch nichts
  // behaupten. `loeschFehlerText` ist die eine Stelle, die das entscheidet.
  pruef('… und die Fehlerleiste behauptet keinen Verlust', konto.loeschFehlerText(false), null);
  pruefWahr('… während sie ihn benennt, wenn es eines gab',
            (konto.loeschFehlerText(true) ?? '').includes('Profilbild'));
}

abschnitt('Kontolöschen — die Reihenfolge ist die ganze Zusage');
{
  const adresse = await senden.profilbildSetzen(lea, alsBrowser(PNG), LEA);
  pruef('Lea hat ein Bild', (await abrufen(adresse)).status, 200);

  // ❌ **Hier stand zuerst, `konto_loeschen()` nehme das Bild mit.** Es tat es in
  // der ersten Fassung von 0008 auch — lokal. Am echten Server wies Supabases
  // Trigger `protect_delete` das SQL-`delete` ab, und damit war ausgerechnet die
  // Funktion hinter einer Apple-1.2-Pflicht kaputt. Der Weg ist deshalb der, den
  // Supabase vorgibt: **erst die App über die Schnittstelle, dann das Konto.**
  await senden.profilbildEntfernen(lea, LEA);
  pruef('erst räumt die App das Bild weg …',
        (await abrufen(adresse + '?ohne-cache=' + Date.now())).status, 400);

  const { error } = await lea.rpc('konto_loeschen');
  pruef('… dann löscht sie das Konto, und das läuft durch', error?.message ?? 'weg', 'weg');

  const { count } = await ian.from('profiles').select('*', { count: 'exact', head: true }).eq('id', LEA);
  pruef('… und Leas Profil ist weg', count, 0);
}

abschnitt('Und was passiert, wenn die App dazwischen abstürzt');
{
  // Die Schwächung, die 0008 im Kommentar benennt — hier wird sie GEMESSEN statt
  // behauptet. Wer sein Konto löscht, ohne dass die App vorher aufgeräumt hat,
  // lässt sein Bild stehen. Es gibt dagegen am Server kein Netz, solange die
  // einzige Alternative das Umgehen eines fremden Sicherheitstriggers ist.
  const adresse = await senden.profilbildSetzen(ian, alsBrowser(PNG), IAN);
  const { error } = await ian.rpc('konto_loeschen');
  pruef('das Konto ist weg', error?.message ?? 'weg', 'weg');
  pruef('… aber das Bild steht noch da — die benannte Lücke aus 0008',
        (await abrufen(adresse + '?ohne-cache=' + Date.now())).status, 200);
}

// ── Aufräumen: die DATEIEN, nicht nur die Zeilen ─────────────────────────────
// Beide Prüf-Konten sind am Ende gelöscht, also kann sich niemand mehr anmelden,
// um über die Schnittstelle aufzuräumen. Die eine Datei, die der letzte Block
// absichtlich stehen lässt, geht deshalb über einen frisch angemeldeten Ian weg —
// `80_bilder.sh` legt die Konten für den nächsten Lauf ohnehin neu an, und das
// SQL-Abräumen dort nimmt die Zeilen.
//
// **Es bleibt eine verwaiste DATEI übrig, und das wird nicht verschwiegen:** Genau
// das ist die Lücke, die der Block darüber misst. Sie kostet 67 Byte und steht als
// offener Punkt in PLAN.md unter 20.6.
console.log('  (die Datei aus dem Absturz-Block bleibt verwaist — das ist der gemessene Preis)');

console.log(`\n  ${haken} Häkchen, ${kreuze} Kreuze\n`);
process.exit(kreuze === 0 ? 0 : 1);
