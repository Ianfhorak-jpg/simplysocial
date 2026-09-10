// Die Prüfungen zu `40_uebersetzung.sh`. Getrennte Datei, weil das Herstellen der
// Zustände SQL ist und das Prüfen JavaScript — dieselbe Trennung wie bei
// `30_wettlauf.sh`, nur andersherum.
import { readFileSync } from 'node:fs';

const A = process.env.ARBEIT;
const lies = (n) => JSON.parse(readFileSync(`${A}/${n}.json`, 'utf8'));
const {
  zuUser, zuPost, zuPosts, zuGroup, zuChatThread, zuMessage, zeitpunkt, ZeilenFehler,
} = await import(`${A}/js/data/zeilen.mjs`);
const { istAufgeloest, istGruender, istMitglied, inGruppenListe } =
  await import(`${A}/js/features/groups/gruppe.mjs`);
const { istDirektChat, herkunftText, VERWAIST_TEXT } =
  await import(`${A}/js/features/chat/direkt.mjs`);

let gut = 0, schlecht = 0;
const pruef = (was, ist, soll) => {
  const a = JSON.stringify(ist), b = JSON.stringify(soll);
  if (a === b) { console.log(`  ✓ ${was}`); gut++; }
  else { console.log(`  ✗ FEHLT — ${was}\n      ist:  ${a}\n      soll: ${b}`); schlecht++; }
};

const profile = lies('profile'), folgt = lies('folgt'), blocks = lies('blocks');
const posts = lies('posts'), gruppen = lies('gruppen'), mitglieder = lies('mitglieder');
const faeden = lies('faeden'), teilnehmer = lies('teilnehmer'), nachrichten = lies('nachrichten');

const IAN = '11111111-1111-1111-1111-111111111111';
const LEA = '22222222-2222-2222-2222-222222222222';
const TOBI = '44444444-4444-4444-4444-444444444444';
const GRUPPE_AUF = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

// ── 1. Zeitstempel ──────────────────────────────────────────────────────────
console.log('\n  Zeitstempel — der Fund, wegen dessen diese Datei existiert');
const rohZeit = posts[0].created_at;
pruef('Postgres liefert wirklich einen Versatz und Mikrosekunden',
  /^\d{4}-\d{2}-\d{2}T[\d:.]+[+-]\d{2}:\d{2}$/.test(rohZeit), true);
const appPosts = zuPosts(posts);
pruef('nach der Übersetzung steht überall die App-Schreibweise (…Z)',
  appPosts.every((p) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(p.createdAt)), true);
pruef('und es ist derselbe Zeitpunkt',
  new Date(appPosts[0].createdAt).getTime(), new Date(rohZeit).getTime());

// Die Gegenprobe: gemischt sortiert wie ein Textvergleich sortiert.
const appZeit = new Date(rohZeit).toISOString();
pruef('UNGETAUFT sortiert der Textvergleich denselben Augenblick falsch',
  rohZeit.localeCompare(appZeit) !== 0, true);
pruef('getauft sortiert er ihn gleich',
  zeitpunkt(rohZeit).localeCompare(appZeit), 0);

// ── 2. Die Unions aus Phase 17 und 18b ──────────────────────────────────────
console.log('\n  Die Unions — zwei Spalten plus CHECK werden wieder ein Typ');
const gruppenPost = appPosts.find((p) => p.id === '0a000003-0000-0000-0000-000000000003');
pruef('ein Gruppen-Post wird `{ kind: "group", groupId }`',
  gruppenPost.visibility, { kind: 'group', groupId: GRUPPE_AUF });
pruef('ein Follower-Post wird `{ kind: "followers" }`',
  appPosts.find((p) => p.visibility.kind === 'followers') !== undefined, true);
pruef('`alter_kind = egal` wird `{ kind: "egal" }`',
  appPosts.every((p) => p.alter.kind !== 'egal' || Object.keys(p.alter).length === 1), true);

// Die kaputte Zeile, die die Datenbank gar nicht zulässt — hier von Hand gebaut.
let geworfen = null;
try { zuPost({ ...posts[0], visibility_kind: 'group', visibility_group_id: null }); }
catch (e) { geworfen = e; }
pruef('ein Gruppen-Post OHNE Gruppe wirft, statt „public" zu raten',
  geworfen instanceof ZeilenFehler, true);
pruef('und `zuPosts` lässt genau diese eine Zeile fallen',
  zuPosts([...posts, { ...posts[0], id: 'kaputt', visibility_kind: 'group', visibility_group_id: null }]).length,
  appPosts.length);

// ── 3. Ians Entscheidung 41 — die aufgelöste Gruppe ─────────────────────────
console.log('\n  Ians Entscheidung 41 — eine Gruppe verschwindet nicht, sie hört auf');
const zeileAuf = gruppen.find((g) => g.id === GRUPPE_AUF);
pruef('die Zeile ist NOCH DA (kein `delete`)', zeileAuf !== undefined, true);
const aufgeloest = zuGroup(zeileAuf, mitglieder);
pruef('`aufgeloestAm` ist gesetzt', typeof aufgeloest.aufgeloestAm, 'string');
pruef('`creatorId` ist null — die Gruppe hat keinen Chef mehr', aufgeloest.creatorId, null);
pruef('`memberIds` ist leer', aufgeloest.memberIds, []);
pruef('`istAufgeloest()` sagt ja', istAufgeloest(aufgeloest), true);
pruef('niemand ist mehr Mitglied', istMitglied(aufgeloest, IAN), false);
pruef('niemand ist mehr Gründer', istGruender(aufgeloest, IAN), false);
pruef('sie steht in KEINER Gruppenliste mehr', inGruppenListe(aufgeloest, IAN), false);
pruef('der Gruppen-Post lebt weiter — das IST Entscheidung 41',
  gruppenPost !== undefined && gruppenPost.visibility.kind === 'group', true);

// ── 4. Die Reihenfolge von `memberIds` (harte Regel 33) ─────────────────────
console.log('\n  Harte Regel 33 — die Reihenfolge trägt Ians Erbregel');
const lebende = gruppen.filter((g) => g.aufgeloest_am === null);
const nora = zuGroup(lebende[0], mitglieder);
pruef('eine lebende Gruppe hat Mitglieder', nora.memberIds.length > 0, true);
// Absichtlich VERDREHT hineingeben: die Übersetzung muss nach `joined_at` sortieren.
const verdreht = [
  { group_id: 'g', user_id: 'spaet', joined_at: '2026-09-09T10:00:00+00:00' },
  { group_id: 'g', user_id: 'frueh', joined_at: '2026-09-01T10:00:00+00:00' },
];
pruef('verdreht hineingegeben kommt sie nach `joined_at` heraus',
  zuGroup({ ...lebende[0], id: 'g' }, verdreht).memberIds, ['frueh', 'spaet']);

// ── 5. Harte Regel 56 — der verwaiste Chat ──────────────────────────────────
console.log('\n  Harte Regel 56 — ein Chat verliert seine Aktivität');
const verwaist = faeden.find((f) => f.id === '0c000001-0000-0000-0000-000000000001');
pruef('der Chat hat den Post verloren (`on delete set null`)', verwaist.post_id, null);
pruef('aber `aus_aktivitaet` steht weiter auf true', verwaist.aus_aktivitaet, true);
const chatVerwaist = zuChatThread(verwaist, teilnehmer);
pruef('übersetzt: `postId` fehlt', chatVerwaist.postId, undefined);
pruef('übersetzt: `ausAktivitaet` bleibt', chatVerwaist.ausAktivitaet, true);
pruef('`istDirektChat()` sagt NEIN — hier hing der ganze Fehler',
  istDirektChat(chatVerwaist), false);
pruef('Ians Entscheidung 42: oben steht der Satz',
  herkunftText(chatVerwaist, undefined), VERWAIST_TEXT);
const echterDirekt = zuChatThread(faeden.find((f) => f.id === '0c000002-0000-0000-0000-000000000002'), teilnehmer);
pruef('ein echter Direktchat bleibt einer', istDirektChat(echterDirekt), true);
pruef('und bekommt KEINEN Satz', herkunftText(echterDirekt, undefined), undefined);
pruef('die Nachricht im verwaisten Chat ist noch da',
  nachrichten.filter((n) => n.thread_id === verwaist.id).length > 0, true);

// ── 6. Harte Regel 8 und 10 — die Beziehungen ───────────────────────────────
console.log('\n  Harte Regeln 8 und 10 — eine Kante, zwei Seiten; ein Block, eine Seite');
const kanten = { folgt, blocks };
const ian = zuUser(profile.find((p) => p.id === IAN), kanten);
const tobi = zuUser(profile.find((p) => p.id === TOBI), kanten);
pruef('Lea folgt Ian → steht bei Ian in `followerIds`', ian.followerIds.includes(LEA), true);
pruef('… und NICHT in `followingIds`', ian.followingIds.includes(LEA), false);
pruef('Ian blockiert Tobi → steht bei Ian', ian.blockedIds.includes(TOBI), true);
pruef('… und bei Tobi steht NICHTS (Regel 10)', tobi.blockedIds, []);
pruef('`photoUrl` fehlt, statt ein leerer String zu sein', ian.photoUrl, undefined);

// ── 7. Was der Prototyp als `null` schreiben würde ──────────────────────────
console.log('\n  null gegen undefined — die Stelle, an der man es verwechselt');
const ohneBezirk = appPosts.find((p) => p.district === null);
pruef('`Post.district` bleibt `null` (Ians Entscheidung 9)',
  ohneBezirk === undefined || ohneBezirk.district === null, true);
pruef('`meetingPoint` wird `undefined`', appPosts.every((p) => p.meetingPoint !== null), true);
pruef('`expiresAt` wird `undefined`', appPosts.every((p) => p.expiresAt !== null), true);
pruef('eine Nachricht übersetzt vollständig',
  Object.keys(zuMessage(nachrichten[0])).sort(),
  ['id', 'senderId', 'sentAt', 'text', 'threadId']);

console.log(`\n  ${gut} Häkchen, ${schlecht} Kreuze`);
process.exit(schlecht === 0 ? 0 : 1);
