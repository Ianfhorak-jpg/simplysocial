/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  70 — DAS SCHREIBEN, am ECHTEN Server
 *  Phase 20.5 (App-Seite). Aufruf über `70_schreiben.sh`, nie direkt.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  ── Was diese Prüfung kann, was `20_transaktionen.sql` nicht kann ────────────
 *  20 ruft die sieben Funktionen aus 0004 über `psql` auf, mit `set local role`.
 *  Hier laufen die 22 Schreibwege den Weg, den die APP wirklich geht: echtes
 *  Supabase → echtes JWT → PostgREST → `senden.ts`. Vier Dinge liegen auf dieser
 *  Strecke, die 20 nicht sehen kann:
 *
 *    1. **Heißen die Spalten wirklich so?** `senden.ts` schreibt Spaltennamen hin
 *       — ein Tippfehler dort ist lokal unsichtbar, weil 20 seine eigenen schreibt.
 *    2. **Die Argumentnamen der RPCs.** `sb.rpc('gruppe_gruenden', { p_name: … })`
 *       — heißt der Parameter am Server `p_name`? PostgREST sucht die Funktion
 *       ÜBER die Argumentnamen; ein falscher ergibt 404, nicht 42501.
 *    3. **Gibt `.select('id').single()` wirklich eine ID zurück?** Davon hängen
 *       drei Screens ab, die anschließend dorthin springen.
 *    4. **Der Trigger.** `last_message_at` zieht `nachricht_notiert` nach — über
 *       `psql` geprüft, über PostgREST noch nie.
 *
 *  ── Warum jede erzeugte ID sofort mitgeschrieben wird ────────────────────────
 *  Ians Entscheidung 45: Der Prüfstand fasst nur seine EIGENEN Zeilen an. Die
 *  festen UUIDs decken das ab, was `05_daten.sql` anlegt — **nicht aber, was der
 *  SERVER hier anlegt.** Der vergibt `gen_random_uuid()`, und eine Gruppe, die
 *  dieser Lauf gründet und dann VERLÄSST, hat danach `creator_id = null`
 *  (Entscheidung 41) und fällt durch `52_abraeumen.sql`, das Gruppen über ihren
 *  Gründer findet. Sie bliebe für immer liegen.
 *
 *  Deshalb `merken()` — und zwar **sofort nach dem Anlegen**, nicht am Ende.
 *  Bricht der Lauf in der Mitte ab, steht die Liste trotzdem da und
 *  `70_schreiben.sh` räumt sie über den `trap` weg. Ein Sammeln bis zum Schluss
 *  wäre genau der Fall, gegen den der `trap` dort überhaupt gebaut ist.
 */

import { createClient } from '@supabase/supabase-js';
import { appendFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HIER = dirname(fileURLToPath(import.meta.url));
const WURZEL = join(HIER, '..', '..');
const JS = join(process.env.ARBEIT, 'js', 'data');

const senden = await import(join(JS, 'senden.js'));
const { wartetAufServer, SchreibFehler } = await import(join(JS, 'schreiben.js'));

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

/** Eine vom SERVER vergebene ID mitschreiben — siehe Dateikopf. */
function merken(art, id) {
  appendFileSync(process.env.ERZEUGT, `${art} ${id}\n`);
  return id;
}

/**
 * Einen erwarteten Fehler abfangen und seinen `code` herausgeben.
 *
 * Harte Regel 57 eine Ebene höher: „ist fehlgeschlagen" ist zu wenig. `senden.ts`
 * wirft einen `SchreibFehler`, und der trägt den `code` — genau damit eine Prüfung
 * `42501` von `23505` unterscheiden kann, statt beides als „ging nicht" zu zählen.
 */
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
  console.error('✗ PRUEF_PASSWORT fehlt — dieses Skript wird über 70_schreiben.sh aufgerufen.');
  process.exit(2);
}

const IAN = '11111111-1111-1111-1111-111111111111';
const LEA = '22222222-2222-2222-2222-222222222222';
const MARA = '33333333-3333-3333-3333-333333333333';
const NORA = '55555555-5555-5555-5555-555555555555';
const POST_OFFEN = '0a000001-0000-0000-0000-000000000001';
const FADEN = '0c000001-0000-0000-0000-000000000001';
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

// ═════════════════════════════════════════════════════════════════════════════

const ian = await anmelden(IAN);
const mara = await anmelden(MARA);
const nora = await anmelden(NORA);
const lea = await anmelden(LEA);

abschnitt('Die Einordnung aus Ians Entscheidung 46');
// Nicht Geschmack, sondern Zusage: Genau diese acht warten. Wer eine davon auf
// `'sofort'` stellt, bekommt hier ein Kreuz statt eines stillen Verhaltenswechsels.
pruef(
  'acht Aktionen warten auf den Server',
  [
    'anfrageBestaetigen', 'blockieren', 'gruppeVerlassen', 'beitrittBestaetigen',
    'einladungAnnehmen', 'postErstellen', 'gruppeErstellen', 'direktChatOeffnen',
  ].every(wartetAufServer),
  true,
);
pruef(
  'und die vierzehn anderen nicht',
  [
    'anfrageSenden', 'anfrageZuruecknehmen', 'anfrageAblehnen', 'nachrichtSenden',
    'beitrittAnfragen', 'beitrittZuruecknehmen', 'beitrittAblehnen', 'einladen',
    'einladungAblehnen', 'folgen', 'entfolgen', 'bezirkSetzen', 'entblocken', 'melden',
  ].some(wartetAufServer),
  false,
);

abschnitt('postErstellen — und die ID kommt vom Server');
{
  const id = merken('post', await senden.postErstellen(ian, {
    category: 'sport',
    title: '  Prüf-Tennis  ',
    district: '1220',
    startsAt: new Date(Date.now() + 3600e3).toISOString(),
    expiresAt: new Date(Date.now() + 7200e3).toISOString(),
    level: 'any',
    alter: { kind: 'egal' },
    spotsTotal: 2,
    note: ' eine Notiz ',
    meetingPoint: '   ',
    visibility: { kind: 'public' },
  }, IAN));
  pruefWahr('eine UUID kommt zurück (nicht `p_neu1`)', /^[0-9a-f-]{36}$/.test(id));
  const { data } = await ian.from('posts').select('*').eq('id', id).single();
  pruef('der Titel ist getrimmt', data?.title, 'Prüf-Tennis');
  // Ein leeres Textfeld ist KEIN leerer Treffpunkt, sondern gar keiner — das Detail
  // zeigt darauf „Machen wir im Chat aus" statt einer leeren Zeile.
  pruef('ein leerer Treffpunkt wird `null`, nicht ""', data?.meeting_point, null);
  // Was NICHT mitgeschickt wurde: der Server setzt es.
  pruef('`spots_filled` kommt vom Server', data?.spots_filled, 0);
  pruef('`status` kommt vom Server', data?.status, 'open');
}

abschnitt('anfrageSenden und zurücknehmen');
{
  // Auf MARAS Post — auf den eigenen kann man nicht anfragen (`anfragen_stellen`).
  await senden.anfrageSenden(ian, '0a000005-0000-0000-0000-000000000005', ' Ich auch ', IAN);
  const { data: da } = await ian
    .from('join_requests')
    .select('*')
    .eq('post_id', '0a000005-0000-0000-0000-000000000005')
    .eq('from_user_id', IAN);
  pruef('die Anfrage steht da', da?.length, 1);
  pruef('… mit getrimmter Nachricht', da?.[0]?.message, 'Ich auch');

  await senden.anfrageZuruecknehmen(ian, '0a000005-0000-0000-0000-000000000005', IAN);
  const { data: danach } = await ian
    .from('join_requests')
    .select('id')
    .eq('post_id', '0a000005-0000-0000-0000-000000000005')
    .eq('from_user_id', IAN);
  pruef('… und ist nach dem Zurückziehen weg', danach?.length, 0);
}

abschnitt('anfrageBestaetigen — die Funktion aus 0004, mit echtem Token');
{
  await senden.anfrageSenden(mara, POST_OFFEN, 'Darf ich mit?', MARA);
  const { data: a } = await mara
    .from('join_requests').select('id').eq('post_id', POST_OFFEN).eq('from_user_id', MARA).single();

  // Gegenprobe ZUERST: Mara ist nicht die Verfasserin. Ohne sie könnte `42501`
  // überall stehen und das Häkchen darunter wäre wertlos.
  pruef('Mara darf ihre eigene Anfrage nicht bestätigen',
    await code(() => senden.anfrageBestaetigen(mara, a.id)), '42501');

  await senden.anfrageBestaetigen(ian, a.id);
  const { data: nachher } = await ian.from('join_requests').select('status').eq('id', a.id).single();
  pruef('Ian bestätigt — die Anfrage steht auf `accepted`', nachher?.status, 'accepted');
  const { data: post } = await ian.from('posts').select('spots_filled').eq('id', POST_OFFEN).single();
  // 0b000001 (Lea) war schon `accepted`, aber `spots_filled` steht in `05_daten.sql`
  // auf dem Vorgabewert 0 — die Zeile ist von Hand gesetzt, nicht über die Funktion.
  // Der Beleg ist also die ÄNDERUNG durch diesen Aufruf.
  pruefWahr('… und ein Platz ist belegt', (post?.spots_filled ?? 0) >= 1);
  const { data: faeden } = await ian
    .from('chat_threads').select('id, post_id, aus_aktivitaet').eq('post_id', POST_OFFEN);
  // Harte Regel 56: die Herkunft ist eine TATSACHE und kein abgeleiteter Wert.
  pruefWahr('… und ein Chat ist entstanden, mit `aus_aktivitaet`',
    faeden?.some((f) => f.aus_aktivitaet === true));
  for (const f of faeden ?? []) if (f.id !== FADEN) merken('faden', f.id);
}

abschnitt('anfrageAblehnen');
{
  await senden.anfrageSenden(nora, POST_OFFEN, 'Ich auch!', NORA);
  const { data: a } = await nora
    .from('join_requests').select('id').eq('post_id', POST_OFFEN).eq('from_user_id', NORA).single();
  await senden.anfrageAblehnen(ian, a.id);
  const { data: nachher } = await ian.from('join_requests').select('status').eq('id', a.id).single();
  pruef('abgelehnt heißt `declined` — kein Platz, kein Chat', nachher?.status, 'declined');
}

abschnitt('nachrichtSenden — und der TRIGGER aus 0004');
{
  const { data: vorher } = await ian
    .from('chat_threads').select('last_message_at').eq('id', FADEN).single();
  await new Promise((r) => setTimeout(r, 1100));
  await senden.nachrichtSenden(ian, FADEN, '  Passt, 17:00  ', IAN);
  const { data: m } = await ian
    .from('messages').select('text, sender_id').eq('thread_id', FADEN).eq('sender_id', IAN);
  pruef('die Nachricht steht im Faden, getrimmt', m?.[0]?.text, 'Passt, 17:00');
  const { data: nachher } = await ian
    .from('chat_threads').select('last_message_at').eq('id', FADEN).single();
  // **Der Grund, warum `last_message_at` ein Trigger ist und keine achte Funktion:**
  // Eine `security definer`-Funktion umgeht die Policies und müsste Ians
  // `SCHREIB_REGEL` nachbauen. Hier wird belegt, dass der Trigger über PostgREST
  // genauso läuft wie über psql.
  pruefWahr('… und der Trigger hat `last_message_at` nachgezogen',
    new Date(nachher.last_message_at) > new Date(vorher.last_message_at));

  // Gegenprobe: Mara ist kein Teilnehmer dieses Fadens.
  pruef('eine Fremde kann nicht in den Faden schreiben',
    await code(() => senden.nachrichtSenden(mara, FADEN, 'hallo', MARA)), '42501');
}

abschnitt('direktChatOeffnen — die zweite ID vom Server');
{
  // Ian und Nora folgen sich GEGENSEITIG (`05_daten.sql`) — Ians `SCHREIB_REGEL`.
  const id = merken('faden', await senden.direktChatOeffnen(ian, NORA));
  pruefWahr('eine UUID kommt zurück', /^[0-9a-f-]{36}$/.test(id));
  const { data } = await ian.from('chat_threads').select('*').eq('id', id).single();
  pruef('… und der Faden ist KEIN Aktivitäts-Chat', data?.aus_aktivitaet, false);
  pruef('… und hat keinen Post', data?.post_id, null);
  // Zweimal öffnen ergibt denselben Faden und keinen zweiten.
  pruef('zweimal öffnen gibt denselben Faden', await senden.direktChatOeffnen(ian, NORA), id);

  // Gegenprobe: Mara folgt Ian nicht — `SCHREIB_REGEL = 'gegenseitig'`, am Server.
  pruef('ohne gegenseitiges Folgen geht es nicht',
    await code(() => senden.direktChatOeffnen(mara, LEA)), '42501');
}

abschnitt('gruppeErstellen, beitreten, einladen, verlassen');
let gruppeId;
{
  gruppeId = merken('gruppe', await senden.gruppeErstellen(ian, {
    name: '  Prüf-Gruppe  ',
    description: 'zum Messen',
    category: 'sport',
    district: '1220',
    offen: true,
  }));
  pruefWahr('eine UUID kommt zurück', /^[0-9a-f-]{36}$/.test(gruppeId));
  const { data: g } = await ian.from('groups').select('*').eq('id', gruppeId).single();
  pruef('der Name ist getrimmt', g?.name, 'Prüf-Gruppe');
  // **Der Grund, warum das `gruppe_gruenden()` ist und kein `insert into groups`:**
  // `group_members` hat nur `select` (harte Regel 55).
  const { data: m } = await ian.from('group_members').select('user_id').eq('group_id', gruppeId);
  pruef('der Gründer ist sofort Mitglied', m?.map((x) => x.user_id), [IAN]);

  // ── beitrittAnfragen + der NEUE Weg aus 0006 ──────────────────────────────
  await senden.beitrittAnfragen(mara, gruppeId, ' Darf ich dazu? ', MARA);
  const { data: a1 } = await mara
    .from('group_requests').select('id').eq('group_id', gruppeId).eq('from_user_id', MARA).single();
  pruefWahr('Maras Anfrage steht da', typeof a1?.id === 'string');

  // **Das ist 0006 am ECHTEN Server, über PostgREST** — lokal ist es mit
  // `set local role` belegt, hier mit einem echten JWT.
  await senden.beitrittZuruecknehmen(mara, gruppeId, MARA);
  const { data: weg } = await mara
    .from('group_requests').select('id').eq('group_id', gruppeId).eq('from_user_id', MARA);
  pruef('… und Mara kann sie zurückziehen (0006)', weg?.length, 0);

  // Gegenprobe zu 0006: Ian ist der GRÜNDER, sieht die Anfrage und darf sie
  // beantworten — löschen darf sie trotzdem nur, wer sie gestellt hat. Ohne diesen
  // Fall wäre `from_user_id = auth.uid()` von einem blanken `true` nicht zu
  // unterscheiden.
  await senden.beitrittAnfragen(mara, gruppeId, 'Nochmal', MARA);
  const { data: a2 } = await mara
    .from('group_requests').select('id').eq('group_id', gruppeId).eq('from_user_id', MARA).single();
  await senden.beitrittZuruecknehmen(ian, gruppeId, MARA);
  const { data: steht } = await mara.from('group_requests').select('id').eq('id', a2.id);
  pruef('… und der Gründer kann eine fremde Anfrage NICHT löschen', steht?.length, 1);

  // ── beitrittBestaetigen ───────────────────────────────────────────────────
  pruef('Mara darf sich nicht selbst aufnehmen',
    await code(() => senden.beitrittBestaetigen(mara, a2.id)), '42501');
  await senden.beitrittBestaetigen(ian, a2.id);
  const { data: m2 } = await ian.from('group_members').select('user_id').eq('group_id', gruppeId);
  pruefWahr('Ian nimmt auf — Mara ist Mitglied', m2?.some((x) => x.user_id === MARA));

  // ── einladen + annehmen ───────────────────────────────────────────────────
  await senden.einladen(ian, gruppeId, LEA, IAN);
  const { data: e } = await ian
    .from('group_invites').select('id').eq('group_id', gruppeId).eq('to_user_id', LEA).single();
  pruefWahr('die Einladung steht da', typeof e?.id === 'string');
  await senden.einladungAnnehmen(lea, e.id);
  const { data: m3 } = await ian.from('group_members').select('user_id').eq('group_id', gruppeId);
  pruefWahr('Lea nimmt an und ist Mitglied', m3?.some((x) => x.user_id === LEA));

  // ── einladen + ablehnen ───────────────────────────────────────────────────
  await senden.einladen(ian, gruppeId, NORA, IAN);
  const { data: e2 } = await ian
    .from('group_invites').select('id').eq('group_id', gruppeId).eq('to_user_id', NORA).single();
  await senden.einladungAblehnen(nora, e2.id);
  const { data: e2n } = await ian.from('group_invites').select('status').eq('id', e2.id).single();
  // Ablehnen heißt `status` und nicht löschen — `group_invites` hat kein
  // delete-Recht, und das ist eine Zusage (harte Regel 70).
  pruef('abgelehnt heißt `declined` und nicht gelöscht', e2n?.status, 'declined');

  // ── beitrittAblehnen ──────────────────────────────────────────────────────
  await senden.beitrittAnfragen(nora, gruppeId, 'Doch dabei', NORA);
  const { data: a3 } = await nora
    .from('group_requests').select('id').eq('group_id', gruppeId).eq('from_user_id', NORA).single();
  await senden.beitrittAblehnen(ian, a3.id);
  const { data: a3n } = await ian.from('group_requests').select('status').eq('id', a3.id).single();
  pruef('eine abgelehnte Beitritts-Anfrage steht auf `declined`', a3n?.status, 'declined');

  // ── gruppeVerlassen: die ERBFOLGE, Ians Entscheidungen 13 und 41 ──────────
  // `memberIds` wächst hinten — der Nächste nach dem Gehenden erbt. Das ist Mara
  // (sie wurde vor Lea aufgenommen), und dass der SERVER das bestimmt und nicht die
  // App, ist der ganze Grund, warum diese Aktion wartet.
  await senden.gruppeVerlassen(ian, gruppeId);
  const { data: gn } = await mara.from('groups').select('creator_id, aufgeloest_am').eq('id', gruppeId).single();
  pruef('die Gruppe wird VERERBT, nicht aufgelöst', gn?.creator_id, MARA);
  pruef('… und hört nicht auf', gn?.aufgeloest_am, null);
  const { data: m4 } = await mara.from('group_members').select('user_id').eq('group_id', gruppeId);
  pruefWahr('… und Ian ist raus', !m4?.some((x) => x.user_id === IAN));
}

abschnitt('folgen, entfolgen, Bezirk');
{
  await senden.folgen(ian, MARA, IAN);
  const { data: f } = await ian.from('follows').select('*').eq('follower_id', IAN).eq('followee_id', MARA);
  // **EINE Zeile, obwohl die App zwei Listen führt** (harte Regel 8): In der
  // Datenbank ist es eine Kante, `zuUser()` baut beim Laden beide Seiten daraus.
  pruef('folgen ist EINE Kante', f?.length, 1);
  await senden.entfolgen(ian, MARA, IAN);
  const { data: fn } = await ian.from('follows').select('*').eq('follower_id', IAN).eq('followee_id', MARA);
  pruef('entfolgen nimmt sie weg', fn?.length, 0);

  await senden.bezirkSetzen(ian, '1210', IAN);
  const { data: p } = await ian.from('profiles').select('district').eq('id', IAN).single();
  pruef('der Heimatbezirk ist gesetzt', p?.district, '1210');
  // Gegenprobe: `profil_aendern` lässt nur das EIGENE Profil zu. PostgREST
  // meldet hier keinen Fehler, sondern trifft null Zeilen — die Policy FILTERT.
  await senden.bezirkSetzen(mara, '1010', IAN);
  const { data: p2 } = await ian.from('profiles').select('district').eq('id', IAN).single();
  pruef('… und eine Fremde kann ihn nicht ändern', p2?.district, '1210');
}

abschnitt('melden, blockieren, entblocken');
{
  await senden.melden(ian, 'user', MARA, 'spam', ' stört ', IAN);
  const { data: r } = await ian.from('reports').select('note').eq('from_user_id', IAN).eq('target_id', MARA);
  pruef('die Meldung steht da, getrimmt', r?.[0]?.note, 'stört');
  // Harte Regel 10: Der Gemeldete darf es nicht erfahren.
  const { data: rm } = await mara.from('reports').select('id').eq('target_id', MARA);
  pruef('… und die Gemeldete sieht sie nicht', rm?.length, 0);

  // **Ians Entscheidung 7 am echten Server.** Blockieren löst mehr auf als eine
  // Kante — der Chat mit Nora aus dem Abschnitt oben muss verschwinden.
  const { data: vorher } = await ian.from('chat_threads').select('id').eq('aus_aktivitaet', false);
  await senden.blockieren(ian, NORA);
  const { data: b } = await ian.from('blocks').select('*').eq('blocker_id', IAN).eq('blocked_id', NORA);
  pruef('der Block steht', b?.length, 1);
  const { data: nachher } = await ian.from('chat_threads').select('id').eq('aus_aktivitaet', false);
  pruefWahr('… und der Direktchat ist weg (Entscheidung 7: alles weg)',
    (nachher?.length ?? 0) < (vorher?.length ?? 0));
  const { data: fo } = await ian.from('follows').select('*')
    .or(`and(follower_id.eq.${IAN},followee_id.eq.${NORA}),and(follower_id.eq.${NORA},followee_id.eq.${IAN})`);
  pruef('… und die Folge-Beziehung ist in BEIDEN Richtungen gekappt', fo?.length, 0);

  await senden.entblocken(ian, NORA, IAN);
  const { data: bn } = await ian.from('blocks').select('*').eq('blocker_id', IAN).eq('blocked_id', NORA);
  pruef('entblocken nimmt den Block weg', bn?.length, 0);
  // Harte Regel 10 von der anderen Seite: Ein Block steht NUR beim Blockierenden.
  const { data: bm } = await nora.from('blocks').select('*');
  pruef('… und eine Blockierte sieht nie einen fremden Block', bm?.length, 0);
}

console.log(`\n  ${haken} Häkchen, ${kreuze} Kreuze\n`);
for (const sb of [ian, mara, nora, lea]) await sb.auth.signOut();
process.exit(kreuze === 0 ? 0 : 1);
