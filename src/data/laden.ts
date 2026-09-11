/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DIE ABFRAGEN — Phase 20.4-b, das Lesen
 *  13 Tabellen rein, 9 Listen raus.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * `zeilen.ts` sagt, was aus EINER Zeile wird. Diese Datei sagt, WELCHE Zeilen
 * überhaupt geholt werden — und sie ist die einzige Stelle, die beides kennt: die
 * Tabellennamen aus `migrations/0001_schema.sql` und die Form von `AppState`.
 *
 * ── Warum erst einmal ALLES ──────────────────────────────────────────────────
 * Der Plan sagt es ausdrücklich (Abschnitt 5b, 20.4): *„zuerst wird alles geladen
 * wie bisher, damit man einen Unterschied hat, an dem man messen kann."* Heute
 * liegen vierzehn Posts im Speicher; mit echten Daten wird daraus ein
 * ZWISCHENSPEICHER, und die Sortier- und Filterarbeit aus `posts/sort.ts` und
 * `posts/filter.ts` wandert schrittweise in die Abfrage. **Das ist der nächste
 * Schritt und nicht dieser** — wer beides auf einmal umbaut, kann einen
 * Unterschied nicht mehr zuordnen. Dieselbe Überlegung wie „Gerät vor Backend".
 *
 * ── Was hier NICHT steht: die Sichtbarkeit ───────────────────────────────────
 * Kein `.eq('visibility_kind', 'public')`, kein Filter auf Follower oder Gruppe.
 * **Das entscheiden die 33 Policies**, und zwar an der einzigen Stelle, an der es
 * sicher ist. Ein Filter hier wäre eine ZWEITE Fassung derselben Regel — und die
 * schwächere, weil sie im Bundle steht, das jeder lesen und ändern kann. Was
 * durchkommt, kommt durch, weil die Datenbank es erlaubt hat.
 *
 * ── Die 13 Tabellen sind NICHT 13 Listen ─────────────────────────────────────
 * Vier davon sind Kanten und haben in `AppState` kein Gegenstück: `follows` und
 * `blocks` gehen in `zuUser`, `group_members` in `zuGroup`, `chat_participants` in
 * `zuChatThread`. Das ist die Auflösung von harter Regel 8 — was im Prototyp
 * zweimal im Modell stand, ist in der Datenbank EINE Zeile und wird hier für die
 * App wieder auf beide Seiten verteilt, aber aus einer Quelle.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { AppState } from '@/features/store';

import {
  zuChatThread,
  zuGroup,
  zuGroupInvite,
  zuGroupRequest,
  zuJoinRequest,
  zuMessage,
  zuPosts,
  zuReport,
  zuUser,
  type AnfrageZeile,
  type BlockZeile,
  type EinladungZeile,
  type FadenZeile,
  type FolgtZeile,
  type GruppenAnfrageZeile,
  type GruppenZeile,
  type MeldungZeile,
  type MitgliedZeile,
  type NachrichtZeile,
  type PostZeile,
  type ProfilZeile,
  type TeilnehmerZeile,
} from '@/data/zeilen';

/** Die neun Listen aus `AppState`, die aus der Datenbank kommen. */
export type GeladeneDaten = Pick<
  AppState,
  | 'posts'
  | 'users'
  | 'joinRequests'
  | 'chatThreads'
  | 'messages'
  | 'reports'
  | 'groups'
  | 'groupRequests'
  | 'groupInvites'
>;

/**
 * Eine Tabelle holen — und **niemals still eine leere Liste liefern.**
 *
 * Das ist der Grund, warum diese kleine Funktion existiert. `supabase-js` wirft
 * nicht; es gibt `{ data, error }` zurück, und `data` ist im Fehlerfall `null`.
 * Der naheliegende Griff `data ?? []` macht aus **jedem** Fehler — abgelaufenes
 * Token, Netz weg, Tabelle umbenannt — eine leere Liste, und die App sagt dann
 * „Noch nichts los in deinem Feed".
 *
 * Das ist genau die Sorte Fehler, gegen die dieses Projekt seit dem 2026-09-10
 * gebaut ist: **Ein Fehler, der nur als Abwesenheit auftritt, überlebt jeden
 * Typecheck und jeden grünen Lauf.** Dieselbe Familie wie der unsichtbare
 * Startbildschirm (weißes Logo auf Weiß) und wie `useMeineMeldung()` ohne
 * select-Recht.
 */
async function tabelle<Z>(sb: SupabaseClient, name: string): Promise<Z[]> {
  const { data, error } = await sb.from(name).select('*');
  if (error) {
    throw new LadeFehler(name, error.code ?? '—', error.message);
  }
  return (data ?? []) as Z[];
}

/**
 * Eine Abfrage, die nicht durchkam.
 *
 * Trägt den TABELLENNAMEN und den `code`, nicht nur einen Satz. Der Grund steht in
 * harter Regel 57: Ein Test, der nur „ist fehlgeschlagen" abfragt, prüft zu wenig
 * — `42501` (die Policy hat abgewiesen) und `PGRST205` (die Tabelle gibt es nicht)
 * sind zwei völlig verschiedene Lagen, und nur eine davon ist ein Programmfehler.
 */
export class LadeFehler extends Error {
  constructor(
    readonly tabelle: string,
    readonly code: string,
    grund: string,
  ) {
    super(`Tabelle "${tabelle}" konnte nicht gelesen werden (${code}): ${grund}`);
    this.name = 'LadeFehler';
  }
}

/**
 * Alles holen, was die App kennt — in EINEM Rutsch.
 *
 * ── Warum `Promise.all` und nicht nacheinander ───────────────────────────────
 * Dreizehn Abfragen nacheinander sind dreizehn Umläufe nach Irland (`eu-west-1`),
 * und die Adresse des Servers ist nicht die Zeit, die eine Abfrage braucht — die
 * LATENZ ist es. Nebenläufig ist es EIN Umlauf für alle dreizehn.
 *
 * ── Und warum das trotzdem keine Transaktion ist ─────────────────────────────
 * Dreizehn Abfragen sehen dreizehn leicht verschiedene Augenblicke. Für die Sorte
 * Daten hier ist das folgenlos: Kommt ein Post an, dessen Autor noch fehlt, zeigt
 * `useUserMap()` ihn nicht, und der nächste Realtime-Anstoß richtet es. **Das
 * wäre falsch, wenn hier GESCHRIEBEN würde** — dort gilt harte Regel 6, und
 * deshalb sind die drei zusammengesetzten Schreibwege Postgres-Funktionen (20.5).
 */
export async function allesLaden(sb: SupabaseClient): Promise<GeladeneDaten> {
  const [
    profile,
    folgt,
    blocks,
    posts,
    gruppen,
    mitglieder,
    anfragen,
    gruppenAnfragen,
    einladungen,
    faeden,
    teilnehmer,
    nachrichten,
    meldungen,
  ] = await Promise.all([
    tabelle<ProfilZeile>(sb, 'profiles'),
    tabelle<FolgtZeile>(sb, 'follows'),
    tabelle<BlockZeile>(sb, 'blocks'),
    tabelle<PostZeile>(sb, 'posts'),
    tabelle<GruppenZeile>(sb, 'groups'),
    tabelle<MitgliedZeile>(sb, 'group_members'),
    tabelle<AnfrageZeile>(sb, 'join_requests'),
    tabelle<GruppenAnfrageZeile>(sb, 'group_requests'),
    tabelle<EinladungZeile>(sb, 'group_invites'),
    tabelle<FadenZeile>(sb, 'chat_threads'),
    tabelle<TeilnehmerZeile>(sb, 'chat_participants'),
    tabelle<NachrichtZeile>(sb, 'messages'),
    tabelle<MeldungZeile>(sb, 'reports'),
  ]);

  return {
    // Die Kanten gehen MIT hinein, nicht daneben — siehe Kopf.
    users: profile.map((z) => zuUser(z, { folgt, blocks })),
    // `zuPosts` und nicht `posts.map(zuPost)`: Eine Zeile, aus der sich kein
    // gültiger Post bauen lässt, wird übersprungen und gemeldet, statt die ganze
    // Liste mitzureißen. Bei den anderen acht gibt es diesen Fall nicht.
    posts: zuPosts(posts),
    groups: gruppen.map((z) => zuGroup(z, mitglieder)),
    joinRequests: anfragen.map(zuJoinRequest),
    groupRequests: gruppenAnfragen.map(zuGroupRequest),
    groupInvites: einladungen.map(zuGroupInvite),
    chatThreads: faeden.map((z) => zuChatThread(z, teilnehmer)),
    messages: nachrichten.map(zuMessage),
    // Dieselbe Nachsicht wie bei den Posts, aus dem Grund an `zuReport`: Eine
    // Meldung, deren Melder sein Konto gelöscht hat, ist für die App keine.
    reports: meldungen.flatMap((z) => {
      try {
        return [zuReport(z)];
      } catch {
        return [];
      }
    }),
  };
}
