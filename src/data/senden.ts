/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DIE SCHREIBWEGE — Phase 20.5 (App-Seite), 2026-09-12
 *  Das Gegenstück zu `laden.ts`: 22 Aktionen, gegen das echte Supabase.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ── Was hier NICHT steht ─────────────────────────────────────────────────────
 * Keine Regel. Ob ein Platz frei ist, wer eine Gruppe erbt, wer wem schreiben
 * darf — das steht in den 34 Policies und in `0004_transaktionen.sql`, und diese
 * Datei ruft es nur auf. **Der Grund ist harte Regel 70:** Eine Prüfung hier wäre
 * eine ZWEITE Fassung derselben Regel, und die schwächere — jeder mit dem anon key
 * kommt an PostgREST vorbei an dieser Datei vorbei.
 *
 * Was hier steht, sind die Vorprüfungen, die AUCH in der App gelten müssen, damit
 * ein Knopf gar nicht erst gedrückt wird (`istOffen`, `darfSchreiben`) — die
 * stehen weiter in den Haken, nicht hier.
 *
 * ── Sieben Aufrufe gehen an eine FUNKTION, fünfzehn an eine Tabelle ──────────
 * Die Teilung hat die Rechteliste vorgegeben und nicht der Geschmack (harte
 * Regel 70): Wo `0002_policies.sql` ein `insert`/`update`/`delete` erteilt, geht
 * es direkt an die Tabelle. Wo es fehlt — `group_members`, `chat_threads`,
 * `chat_participants` — ist das eine ZUSAGE und keine Lücke, und der Weg ist die
 * Funktion aus 0004.
 *
 * **Eine Lücke war trotzdem dabei, und sie hat eine eigene Migration bekommen:**
 * `beitrittZuruecknehmen` hatte am Server gar keinen Weg (siehe
 * `0006_zuruecknehmen.sql`).
 *
 * ── Warum jede Funktion `sb` als ERSTES Argument nimmt ──────────────────────
 * Damit sie ohne die App prüfbar ist. `50_lesen.mjs` und `70_schreiben.mjs` rufen
 * sie mit einem eigenen Client auf — dieselbe Überlegung wie bei `zeilen.ts`, das
 * nur Typen importiert und deshalb in blankem Node läuft. Wer hier `client()` aus
 * `lib/supabase.ts` fest verdrahtet, macht den Prüfstand unmöglich.
 */

import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';

import { SchreibFehler, type SchreibAktion } from '@/data/schreiben';
import type { PostEntwurf } from '@/features/posts/hooks';
import type { GruppenEntwurf } from '@/features/groups/hooks';
import type { ReportReason, ReportTarget } from '@/types/models';

/**
 * Aus `{ error }` einen Fehler machen, den man werfen kann — und **niemals still
 * weitergehen.**
 *
 * Derselbe Grund wie bei `tabelle()` in `laden.ts`: `supabase-js` wirft nicht. Wer
 * das Ergebnis ignoriert, bekommt eine App, in der „Bin dabei" nichts tut und
 * nichts sagt — und weil der Bildschirm bei den `'sofort'`-Aktionen die Änderung
 * schon zeigt, sähe es sogar aus, als hätte es geklappt. **Bis zum nächsten
 * Nachladen.**
 */
function pruefen(aktion: SchreibAktion, error: PostgrestError | null): void {
  if (error) throw new SchreibFehler(aktion, error.code ?? '—', error.message);
}

/**
 * Eine Funktion aus 0004 rufen, die eine ID zurückgibt.
 *
 * `rpc()` liefert den Rückgabewert als `data`. Ein `null` dort ist KEIN Fehler im
 * Sinne von PostgREST, aber für uns einer: Alle drei Funktionen, die hier
 * durchgehen, geben eine `uuid` zurück, und der Bildschirm springt gleich dorthin.
 * Eine fehlende ID würde zu `/post/null` führen.
 */
async function rufenMitId(
  sb: SupabaseClient,
  aktion: SchreibAktion,
  name: string,
  argumente: Record<string, unknown>,
): Promise<string> {
  const { data, error } = await sb.rpc(name, argumente);
  pruefen(aktion, error);
  if (typeof data !== 'string') {
    throw new SchreibFehler(aktion, '—', `${name} gab keine ID zurück`);
  }
  return data;
}

// ═════════════════════════════════════════════════════════════════════════════
//  Posts
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Einen Post anlegen und **seine ID vom Server zurückgeben.**
 *
 * `.select('id').single()` ist kein Komfort, sondern der Grund, warum diese Aktion
 * in `EINORDNUNG` auf `'warten'` steht: Der Screen springt anschließend auf
 * `/post/<id>`, und eine erfundene ID führt dort auf „Diesen Post gibt es nicht
 * mehr" — eine halbe Sekunde, nachdem man ihn geschrieben hat.
 *
 * Was NICHT mitgeschickt wird, steht am Typ `PostEntwurf`: `spots_filled`,
 * `status` und `created_at` gehören der Datenbank (Vorgabewerte in 0001). Ein
 * `status: 'open'` von hier wäre eine Behauptung über etwas, das der Server führt.
 */
export async function postErstellen(sb: SupabaseClient, entwurf: PostEntwurf, ichId: string): Promise<string> {
  const { data, error } = await sb
    .from('posts')
    .insert({
      author_id: ichId,
      category: entwurf.category,
      title: entwurf.title.trim(),
      district: entwurf.district,
      starts_at: entwurf.startsAt,
      expires_at: entwurf.expiresAt,
      level: entwurf.level,
      alter_kind: entwurf.alter.kind,
      alter_von_jahrgang: entwurf.alter.kind === 'spanne' ? entwurf.alter.vonJahrgang : null,
      alter_bis_jahrgang: entwurf.alter.kind === 'spanne' ? entwurf.alter.bisJahrgang : null,
      spots_total: entwurf.spotsTotal,
      note: entwurf.note.trim(),
      // Wie in der App: ein leeres Textfeld ist KEIN leerer Treffpunkt, sondern
      // gar keiner. Das Detail zeigt darauf „Machen wir im Chat aus".
      meeting_point: entwurf.meetingPoint?.trim() ? entwurf.meetingPoint.trim() : null,
      visibility_kind: entwurf.visibility.kind,
      visibility_group_id: entwurf.visibility.kind === 'group' ? entwurf.visibility.groupId : null,
    })
    .select('id')
    .single();
  pruefen('postErstellen', error);
  if (!data) throw new SchreibFehler('postErstellen', '—', 'kein Post zurückgekommen');
  return (data as { id: string }).id;
}

// ═════════════════════════════════════════════════════════════════════════════
//  Anfragen an einen Post
// ═════════════════════════════════════════════════════════════════════════════

export async function anfrageSenden(
  sb: SupabaseClient,
  postId: string,
  message: string,
  ichId: string,
): Promise<void> {
  const { error } = await sb
    .from('join_requests')
    .insert({ post_id: postId, from_user_id: ichId, message: message.trim() });
  pruefen('anfrageSenden', error);
}

/**
 * Zurückziehen heißt LÖSCHEN, nicht `status` umstellen.
 *
 * `join_requests` trägt `unique (post_id, from_user_id)` — bliebe die Zeile mit
 * einem anderen Status liegen, wäre ein erneutes „Bin dabei" kein `insert` mehr.
 * Die Policy dazu heißt `anfragen_zuruecknehmen` und steht seit 20.2.
 */
export async function anfrageZuruecknehmen(
  sb: SupabaseClient,
  postId: string,
  ichId: string,
): Promise<void> {
  const { error } = await sb
    .from('join_requests')
    .delete()
    .eq('post_id', postId)
    .eq('from_user_id', ichId)
    .eq('status', 'pending');
  pruefen('anfrageZuruecknehmen', error);
}

/**
 * Bestätigen — die Funktion aus 0004, nicht drei Schreibvorgänge.
 *
 * Harte Regel 6 als DATEN-Regel: Anfrage, Post und Chat ändern sich zusammen oder
 * gar nicht. Und `select … for update` darin ist der Grund, warum diese Aktion
 * wartet — zwei gleichzeitige Bestätigungen auf einen Post mit einem Platz sind
 * nachgestellt (`30_wettlauf.sh`), nicht überlegt.
 */
export async function anfrageBestaetigen(sb: SupabaseClient, anfrageId: string): Promise<void> {
  const { error } = await sb.rpc('anfrage_bestaetigen', { anfrage_id: anfrageId });
  pruefen('anfrageBestaetigen', error);
}

export async function anfrageAblehnen(sb: SupabaseClient, anfrageId: string): Promise<void> {
  const { error } = await sb
    .from('join_requests')
    .update({ status: 'declined' })
    .eq('id', anfrageId)
    .eq('status', 'pending');
  pruefen('anfrageAblehnen', error);
}

// ═════════════════════════════════════════════════════════════════════════════
//  Chat
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Eine Nachricht schreiben — ein gewöhnliches `insert`, und das ist Absicht.
 *
 * `last_message_at` zieht der TRIGGER `nachricht_notiert` nach (0004). Eine
 * Funktion dafür hätte Ians `SCHREIB_REGEL` aus `chat/direkt.ts` ein zweites Mal
 * hinschreiben müssen, weil `security definer` die Policy `nachricht_schreiben`
 * umgeht — die Begründung steht in 0004 und in harter Regel 70.
 */
export async function nachrichtSenden(
  sb: SupabaseClient,
  threadId: string,
  text: string,
  ichId: string,
): Promise<void> {
  const { error } = await sb
    .from('messages')
    .insert({ thread_id: threadId, sender_id: ichId, text: text.trim() });
  pruefen('nachrichtSenden', error);
}

/**
 * Einen Direktchat öffnen. Gibt die Faden-ID zurück — deshalb `'warten'`.
 *
 * `chat_threads` und `chat_participants` haben nur `select` (harte Regel 70): Ein
 * Chat ist das ERGEBNIS einer Zusage oder einer Nachricht, kein Schreibvorgang.
 * Die Funktion prüft Ians `SCHREIB_REGEL` selbst.
 */
export async function direktChatOeffnen(sb: SupabaseClient, wem: string): Promise<string> {
  return rufenMitId(sb, 'direktChatOeffnen', 'direktchat_oeffnen', { wem });
}

// ═════════════════════════════════════════════════════════════════════════════
//  Gruppen
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Gründen — die Funktion, obwohl `groups` ein `insert`-Recht hat.
 *
 * Der Grund steht eine Zeile tiefer in der Rechteliste: `group_members` hat nur
 * `select`. Ein blankes `insert into groups` ergäbe eine Gruppe **ohne ein
 * einziges Mitglied**, also auch ohne ihren Gründer — und damit eine, die in
 * `useMeineGruppen()` nicht auftaucht und deren Erbregel (`nachfolgerId`) keinen
 * ersten Eintrag hat.
 */
export async function gruppeErstellen(sb: SupabaseClient, entwurf: GruppenEntwurf): Promise<string> {
  return rufenMitId(sb, 'gruppeErstellen', 'gruppe_gruenden', {
    p_name: entwurf.name.trim(),
    p_beschreibung: entwurf.description.trim(),
    p_kategorie: entwurf.category,
    p_offen: entwurf.offen,
    p_bezirk: entwurf.district,
  });
}

export async function beitrittAnfragen(
  sb: SupabaseClient,
  gruppeId: string,
  message: string,
  ichId: string,
): Promise<void> {
  const { error } = await sb
    .from('group_requests')
    .insert({ group_id: gruppeId, from_user_id: ichId, message: message.trim() });
  pruefen('beitrittAnfragen', error);
}

/**
 * **Der Weg dafür ist erst am 2026-09-12 entstanden** — `0006_zuruecknehmen.sql`.
 *
 * Bis dahin hatte `group_requests` kein `delete`-Recht und die einzige
 * update-Policy ließ nur den Gründer durch: Der Knopf stand seit Phase 17 in der
 * App und kam am Server nicht durch. Gefunden hat es die Rechteliste beim
 * Einordnen der 22 Aktionen, nicht der Plan.
 */
export async function beitrittZuruecknehmen(
  sb: SupabaseClient,
  gruppeId: string,
  ichId: string,
): Promise<void> {
  const { error } = await sb
    .from('group_requests')
    .delete()
    .eq('group_id', gruppeId)
    .eq('from_user_id', ichId)
    .eq('status', 'pending');
  pruefen('beitrittZuruecknehmen', error);
}

export async function beitrittBestaetigen(sb: SupabaseClient, anfrageId: string): Promise<void> {
  const { error } = await sb.rpc('beitritt_bestaetigen', { anfrage_id: anfrageId });
  pruefen('beitrittBestaetigen', error);
}

export async function beitrittAblehnen(sb: SupabaseClient, anfrageId: string): Promise<void> {
  const { error } = await sb
    .from('group_requests')
    .update({ status: 'declined' })
    .eq('id', anfrageId)
    .eq('status', 'pending');
  pruefen('beitrittAblehnen', error);
}

/**
 * Verlassen — die Funktion, weil hier Ians Entscheidungen 13 und 41 hängen.
 *
 * Wer die Gruppe erbt (`nachfolgerId`, Entscheidung 13) und was mit ihr passiert,
 * wenn der Letzte geht (Entscheidung 41: sie hört auf, sie verschwindet nicht),
 * bestimmt `gruppe_verlassen()`. Ein `delete from group_members` gäbe es ohnehin
 * nicht — die Tabelle hat kein delete-Recht (harte Regel 55).
 */
export async function gruppeVerlassen(sb: SupabaseClient, gruppeId: string): Promise<void> {
  const { error } = await sb.rpc('gruppe_verlassen', { gruppe_id: gruppeId });
  pruefen('gruppeVerlassen', error);
}

export async function einladen(
  sb: SupabaseClient,
  gruppeId: string,
  toUserId: string,
  ichId: string,
): Promise<void> {
  const { error } = await sb
    .from('group_invites')
    .insert({ group_id: gruppeId, from_user_id: ichId, to_user_id: toUserId });
  pruefen('einladen', error);
}

export async function einladungAnnehmen(sb: SupabaseClient, einladungId: string): Promise<void> {
  const { error } = await sb.rpc('einladung_annehmen', { einladung_id: einladungId });
  pruefen('einladungAnnehmen', error);
}

/**
 * Ablehnen heißt hier `status`, nicht löschen — anders als bei den zwei
 * Zurücknehmen-Wegen, und der Unterschied ist die Rechteliste.
 *
 * `group_invites` hat kein `delete`-Recht, und das ist eine Zusage: Eine
 * abgelehnte Einladung bleibt stehen, damit der Einladende sie nicht endlos
 * wiederholt (`unique (group_id, to_user_id)`). Zurückziehen tut man die EIGENE
 * Anfrage; eine fremde Einladung lehnt man ab.
 */
export async function einladungAblehnen(sb: SupabaseClient, einladungId: string): Promise<void> {
  const { error } = await sb
    .from('group_invites')
    .update({ status: 'declined' })
    .eq('id', einladungId)
    .eq('status', 'pending');
  pruefen('einladungAblehnen', error);
}

// ═════════════════════════════════════════════════════════════════════════════
//  Social
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Folgen — **EINE Zeile, obwohl die App zwei Listen führt.**
 *
 * Harte Regel 8 sagt, eine Folge-Beziehung stehe im Datenmodell ZWEIMAL
 * (`followingIds` bei mir, `followerIds` beim anderen). Das gilt für den Speicher
 * der App, nicht für die Datenbank: Dort ist es eine Kante in `follows`, und
 * `zuUser()` in `zeilen.ts` baut daraus beim Laden wieder beide Seiten. Wer hier
 * zwei Zeilen schriebe, hätte zwei Wahrheiten.
 */
export async function folgen(sb: SupabaseClient, wem: string, ichId: string): Promise<void> {
  const { error } = await sb.from('follows').insert({ follower_id: ichId, followee_id: wem });
  pruefen('folgen', error);
}

export async function entfolgen(sb: SupabaseClient, wem: string, ichId: string): Promise<void> {
  const { error } = await sb
    .from('follows')
    .delete()
    .eq('follower_id', ichId)
    .eq('followee_id', wem);
  pruefen('entfolgen', error);
}

export async function bezirkSetzen(sb: SupabaseClient, plz: string, ichId: string): Promise<void> {
  const { error } = await sb.from('profiles').update({ district: plz }).eq('id', ichId);
  pruefen('bezirkSetzen', error);
}

// ═════════════════════════════════════════════════════════════════════════════
//  Sicherheit
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Blockieren — Ians Entscheidung 7 („alles weg"), und deshalb die Funktion.
 *
 * `blocks` hat zwar ein `insert`-Recht, aber ein blanker Eintrag dort setzt nur
 * die Kante. Die Entscheidung verlangt mehr: Der Chat verschwindet, eine
 * bestätigte Verabredung wird abgesagt, der Platz wird frei — in EINER
 * Transaktion (harte Regel 6). Ein `insert` hier hieße, dass die App das
 * anschließend nachholt, und ein Abbruch dazwischen ließe einen Block ohne Wirkung
 * stehen.
 */
export async function blockieren(sb: SupabaseClient, wen: string): Promise<void> {
  const { error } = await sb.rpc('blockieren', { wen });
  pruefen('blockieren', error);
}

/**
 * Entblocken ist die einfache Gegenrichtung — und **nicht** die Umkehrung.
 *
 * Was das Blockieren aufgelöst hat, kommt nicht zurück: Der Chat ist weg, die
 * Zusage abgesagt. Das steht so in `blockFolgen()` und ist der Grund, warum
 * Blockieren als einzige Aktion neben dem Kontolöschen vorher fragt.
 */
export async function entblocken(sb: SupabaseClient, wen: string, ichId: string): Promise<void> {
  const { error } = await sb
    .from('blocks')
    .delete()
    .eq('blocker_id', ichId)
    .eq('blocked_id', wen);
  pruefen('entblocken', error);
}

export async function melden(
  sb: SupabaseClient,
  targetType: ReportTarget,
  targetId: string,
  reason: ReportReason,
  note: string,
  ichId: string,
): Promise<void> {
  const { error } = await sb
    .from('reports')
    .insert({
      target_type: targetType,
      target_id: targetId,
      from_user_id: ichId,
      reason,
      note: note.trim(),
    });
  pruefen('melden', error);
}
