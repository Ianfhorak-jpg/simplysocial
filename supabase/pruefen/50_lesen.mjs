/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  50 — DAS LESEN, am ECHTEN Server
 *  Phase 20.4-b. Aufruf über `50_lesen.sh`, nie direkt.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  ── Was diese Prüfung kann, was `40_uebersetzung` nicht kann ─────────────────
 *  40 schickt Zeilen aus einer LOKALEN Datenbank durch `zeilen.ts` — über `psql`,
 *  also am Client und an PostgREST vorbei. Hier laufen dieselben Zeilen den Weg,
 *  den die App wirklich geht: echtes Supabase → PostgREST → JSON → `supabase-js`
 *  → `zeilen.ts`. **Auf dieser Strecke liegen drei Dinge, die 40 nicht sehen
 *  kann:** die Policies (statt `set local role`), die JSON-Serialisierung von
 *  Postgres-Typen (Enum-Arrays, `timestamptz`) und die Frage, ob die Spalten
 *  überhaupt so heißen wie die Zeilentypen behaupten.
 *
 *  ── Warum die Übersetzer über die gebauten .js laufen ────────────────────────
 *  Dieselbe Technik wie in `40_uebersetzung.mjs`: `zeilen.ts` importiert
 *  AUSSCHLIESSLICH Typen, also bleibt nach `tsc` keine Zeile Import übrig und die
 *  Datei läuft in blankem Node — ohne Expo, ohne Metro, ohne React. Wer dort
 *  einen Baustein hineinimportiert, macht genau diese Prüfung unmöglich.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HIER = dirname(fileURLToPath(import.meta.url));
const WURZEL = join(HIER, '..', '..');
const JS = join(process.env.ARBEIT, 'js', 'data');

let haken = 0;
let kreuze = 0;
function pruef(was, ist, soll) {
  const gleich = JSON.stringify(ist) === JSON.stringify(soll);
  if (gleich) {
    haken += 1;
    console.log(`  ✓ ${was}`);
  } else {
    kreuze += 1;
    console.log(`  ✗ ${was}\n      ist:  ${JSON.stringify(ist)}\n      soll: ${JSON.stringify(soll)}`);
  }
}
function pruefWahr(was, bedingung) {
  pruef(was, bedingung === true, true);
}
function abschnitt(titel) {
  console.log(`\n  ${titel}`);
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
  console.error('✗ PRUEF_PASSWORT fehlt — dieses Skript wird über 50_lesen.sh aufgerufen.');
  process.exit(2);
}

const IAN = '11111111-1111-1111-1111-111111111111';
const MARA = '33333333-3333-3333-3333-333333333333';
const mail = (id) => `pruef-${id.slice(0, 8)}@simplysocial.invalid`;

function neuerClient() {
  return createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

// ═════════════════════════════════════════════════════════════════════════════

console.log('\n── Ohne Anmeldung: die Policies halten ──────────────────────────────────');
{
  const anon = neuerClient();
  const { data, error, status } = await anon.from('posts').select('*');
  pruef('anon bekommt HTTP 200 …', status, 200);
  pruef('… und NULL Posts (nicht etwa einen Fehler)', data?.length, 0);
  pruef('… ohne Fehlermeldung — RLS filtert, es verweigert nicht', error, null);

  // Die Gegenprobe, ohne die „0 Zeilen" alles sein könnte, was dieses Skript sagt.
  const { error: e404, status: s404 } = await anon.from('gibt_es_nicht').select('*');
  pruef('eine erfundene Tabelle ergibt 404 …', s404, 404);
  pruef('… mit PGRST205 — das Skript sagt nicht zu allem „nichts da"', e404?.code, 'PGRST205');

  // Harte Regel 57: der SQLSTATE, nicht „ist fehlgeschlagen".
  const { error: eIns } = await anon.from('posts').insert({ title: 'x' });
  pruef('anon darf nicht schreiben — SQLSTATE 42501', eIns?.code, '42501');
}

console.log('\n── Angemeldet als Ian: der Weg, den die App geht ────────────────────────');
const sb = neuerClient();
{
  const { data, error } = await sb.auth.signInWithPassword({
    email: mail(IAN),
    password: PASSWORT,
  });
  if (error) {
    console.error(`  ✗ Anmelden gescheitert: ${error.message}`);
    process.exit(1);
  }
  pruefWahr('angemeldet, es gibt ein Token', typeof data.session?.access_token === 'string');
  // Der Beleg, dass das Token WIRKLICH auf Ian lautet — nicht nur, dass eines da ist.
  const rolle = JSON.parse(
    Buffer.from(data.session.access_token.split('.')[1], 'base64').toString('utf8'),
  );
  pruef('das Token trägt Ians id als `sub`', rolle.sub, IAN);
  pruef('… und die Rolle `authenticated`', rolle.role, 'authenticated');
}

// ── Die Abfragen, genau wie `laden.ts` sie stellt ────────────────────────────
const { allesLaden } = await import(join(JS, 'laden.js'));
const daten = await allesLaden(sb);

abschnitt('Die dreizehn Abfragen kommen durch');
pruefWahr('es kamen Profile an', daten.users.length > 0);
pruefWahr('es kamen Posts an', daten.posts.length > 0);

abschnitt('Sichtbarkeit — dieselben Regeln wie in 10_angriff, nur über HTTP');
{
  const titel = daten.posts.map((p) => p.title).sort();
  // Ian sieht: seinen öffentlichen, seinen Follower-Post, seinen Gruppen-Post,
  // Maras öffentlichen. NICHT Tobis Kino — Ian hat Tobi blockiert (Entscheidung 7).
  pruef('Ian sieht genau vier Posts', titel, [
    'Kaffee nur Follower',
    'Lernen',
    'Tennis offen',
    'Training nur Gruppe',
  ]);
  pruefWahr(
    'Tobis Post fehlt — der Block wirkt über PostgREST genauso',
    !titel.includes('Kino'),
  );
}

abschnitt('Die Übersetzung an Zeilen, die durch PostgREST kamen');
{
  const gruppe = daten.posts.find((p) => p.title === 'Training nur Gruppe');
  pruef('aus zwei Spalten wird der Union zurück', gruppe.visibility, {
    kind: 'group',
    groupId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  });
  const offen = daten.posts.find((p) => p.title === 'Tennis offen');
  pruef('ein öffentlicher Post trägt keine Gruppe', offen.visibility, { kind: 'public' });
  pruef('`alter` ohne Spanne wird `egal`', offen.alter, { kind: 'egal' });

  // Harte Regel 72 — der Fund, der `zeilen.ts` rechtfertigt. Über PostgREST kommt
  // ein `timestamptz` als `2026-09-12T…+00:00`; die App vergleicht Zeitstempel an
  // neun Stellen als TEXT. Hier steht, dass die Taufe auch auf DIESEM Weg greift.
  pruefWahr(
    'Zeitstempel sind getauft: enden auf Z, nicht auf +00:00',
    daten.posts.every((p) => p.createdAt.endsWith('Z') && !p.createdAt.includes('+')),
  );
  pruefWahr(
    '… und sind gültige Zeitpunkte',
    daten.posts.every((p) => !Number.isNaN(Date.parse(p.createdAt))),
  );
}

abschnitt('Harte Regeln 8 und 10 über den echten Weg');
{
  const ian = daten.users.find((u) => u.id === IAN);
  pruefWahr('Lea folgt Ian → steht in seinen `followerIds`', ian.followerIds.includes('22222222-2222-2222-2222-222222222222'));
  pruefWahr('Ian blockiert Tobi → steht in seinen `blockedIds`', ian.blockedIds.includes('44444444-4444-4444-4444-444444444444'));
  const tobi = daten.users.find((u) => u.id === '44444444-4444-4444-4444-444444444444');
  // Regel 10: Ian SIEHT seine eigene Block-Kante; bei Tobi darf sie nirgends stehen.
  // Dass Tobi hier überhaupt auftaucht, liegt an der Profil-Policy — das ist richtig
  // so, ein Blockierter verschwindet nicht aus der Welt, nur aus dem Feed.
  pruef('bei Tobi steht kein Block — er merkt nichts (Regel 10)', tobi?.blockedIds, []);
}

abschnitt('Die Gruppe — und die Erbfolge, die in der Reihenfolge steckt');
{
  const g = daten.groups.find((x) => x.id === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
  pruef('Ian steht vorn, Lea dahinter — sortiert nach `joined_at`', g.memberIds, [
    IAN,
    '22222222-2222-2222-2222-222222222222',
  ]);
  pruef('die Gruppe ist nicht aufgelöst', g.aufgeloestAm, undefined);
}

abschnitt('Harte Regel 47 — was die App über fremde Pläne weiß');
{
  // Lea hat zwei Anfragen: eine an Ians Post, eine an Maras. Ian darf nur die erste
  // sehen. Das ist in 10_angriff schon geprüft — hier steht, dass die Policy auch
  // über PostgREST greift und nicht etwa durch ein `select *` umgangen wird.
  const ids = daten.joinRequests.map((a) => a.postId).sort();
  pruef('Ian sieht nur die Anfrage an SEINEN Post', ids, [
    '0a000001-0000-0000-0000-000000000001',
  ]);
}

console.log('\n── Realtime: meldet der Kanal wirklich etwas? ───────────────────────────');
{
  const { REALTIME_TABELLEN } = await import(join(JS, 'realtime.js'));

  // Die Drift-Prüfung, die im Kopf von `realtime.ts` angekündigt ist: Die elf Namen
  // stehen dort ein ZWEITES Mal neben `0005_realtime.sql`. Dieselbe Lage wie
  // `landing/stil.css` gegenüber `theme/colors.ts` (harte Regel 13) — und dieselbe
  // Antwort: messen statt sich auf Sorgfalt verlassen. Eine Tabelle, die in
  // `realtime.ts` fehlt, wäre ein Screen, der sich nie von selbst aktualisiert.
  // Kommt über psql aus `50_lesen.sh`, NICHT über eine Datenbankfunktion: Der erste
  // Entwurf hing an einer RPC, die es gar nicht gibt, und war mit einem Rückfall auf
  // `null` abgesichert — die Prüfung hätte sich damit still selbst übersprungen.
  const inDB = (process.env.REALTIME_IST ?? '').split(',').filter(Boolean);
  pruefWahr('die Publication ist nicht leer (sonst misst das hier nichts)', inDB.length > 0);
  pruef('`REALTIME_TABELLEN` stimmt mit der Publication überein',
    [...REALTIME_TABELLEN].sort(), [...inDB].sort());

  // Drei Messungen statt einer — und die ersten beiden sind der Grund, warum die
  // dritte überhaupt etwas aussagt. Beim ersten Lauf stand hier nur „kommt das
  // Ereignis an?", und die Antwort war nein. Das kann DREIERLEI heißen: Der Kanal
  // ist gar nicht verbunden, die Änderung hat nie stattgefunden, oder Realtime
  // schweigt. Harte Regel 57 in ihrer allgemeinen Form: **Ein Test, der nur „hat
  // nicht geklappt" abfragt, prüft zu wenig.**
  const lage = await new Promise((fertig) => {
    const ergebnis = { verbunden: false, geschrieben: null, gehoert: false };
    const uhr = setTimeout(() => fertig(ergebnis), 15000);
    const kanal = sb
      .channel('pruef-lesen')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        ergebnis.gehoert = true;
        clearTimeout(uhr);
        sb.removeChannel(kanal);
        fertig(ergebnis);
      })
      .subscribe(async (stand, fehler) => {
        if (stand !== 'SUBSCRIBED') {
          if (fehler) ergebnis.geschrieben = `Kanal: ${stand} ${fehler.message}`;
          return;
        }
        ergebnis.verbunden = true;
        // Erst NACH `SUBSCRIBED` schreiben. Andersherum ist die Änderung durch,
        // bevor jemand zuhört — und die Prüfung liefe in ihren Timeout und sähe
        // aus wie ein kaputtes Realtime. Dieselbe Familie wie Kamerabefehle vor
        // `onMapReady`.
        const { error } = await sb
          .from('posts')
          .update({ note: 'angestupst ' + Date.now() })
          .eq('id', '0a000001-0000-0000-0000-000000000001');
        ergebnis.geschrieben = error ? `${error.code} ${error.message}` : 'ok';
      });
  });
  pruefWahr('der Kanal ist verbunden (SUBSCRIBED)', lage.verbunden);
  pruef('die Änderung ging wirklich durch', lage.geschrieben, 'ok');
  pruefWahr('… und kommt am Kanal an', lage.gehoert);
}

console.log(`\n  ${haken} Häkchen, ${kreuze} Kreuze\n`);
await sb.auth.signOut();
process.exit(kreuze === 0 ? 0 : 1);
