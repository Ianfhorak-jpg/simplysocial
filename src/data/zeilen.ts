/**
 * Was aus einer DATENBANKZEILE wird — Phase 20.4, Teil 1: Lesen.
 *
 * Diese Datei ist die Naht, die `store.ts` seit dem 2026-08-31 verspricht: *„Später
 * ersetzt Supabase das Innere dieser Datei. Die Hooks und damit alle Screens bleiben
 * unverändert."* Damit das hält, muss irgendwo aus `visibility_kind` +
 * `visibility_group_id` wieder ein `Visibility` werden. Hier.
 *
 * ── Warum das eine eigene Datei ist und keine Handvoll `map()`-Aufrufe ─────────
 * Weil die Übersetzung an drei Stellen etwas ENTSCHEIDET und nicht nur umbenennt:
 * bei den Unions, bei der Reihenfolge von `memberIds` und bei den Zeitstempeln.
 * Verstreut in `store.ts` wären das drei Entscheidungen, die niemand mehr findet —
 * dieselbe Überlegung wie `theme/icons.ts` neben `SsIcon` (harte Regel 48).
 *
 * ── Nur EINE Richtung ─────────────────────────────────────────────────────────
 * Hier steht Datenbank → App und nicht zurück. Geschrieben wird über die sieben
 * Funktionen aus `migrations/0004_transaktionen.sql` (Phase 20.5) und nicht durch
 * das Zusammensetzen von Zeilen; ein Rück-Übersetzer wäre eine zweite Stelle, an der
 * jemand `visibility_kind` und `visibility_group_id` auseinanderhalten muss.
 *
 * ── Die Zeilentypen sind ABSICHTLICH snake_case ───────────────────────────────
 * Sie beschreiben, was PostgREST liefert, nicht, was die App will. Ein Zwischentyp
 * in camelCase wäre eine dritte Schreibweise und damit eine dritte Gelegenheit,
 * `alter_von_jahrgang` und `vonJahrgang` zu verwechseln.
 */

import type {
  ActivityCategory,
  ChatThread,
  Group,
  GroupInvite,
  GroupRequest,
  JoinRequest,
  Message,
  Post,
  PostAlter,
  PostStatus,
  Report,
  ReportReason,
  ReportTarget,
  RequestStatus,
  SkillLevel,
  User,
  Visibility,
} from '@/types/models';

// ═════════════════════════════════════════════════════════════════════════════
//  Zeitstempel — der Fund, der die ganze Datei rechtfertigt
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Einen Zeitpunkt aus der Datenbank in die Schreibweise bringen, die die App
 * vergleicht.
 *
 * ── Warum das kein Beiwerk ist ────────────────────────────────────────────────
 * Postgres liefert `2026-09-10T07:59:29.833382+01:00` — sechs Nachkommastellen und
 * ein Zeitzonen-VERSATZ. Supabase steht auf UTC und liefert `…+00:00`. Die App
 * schreibt `new Date().toISOString()`, also `2026-09-10T06:59:29.833Z`.
 *
 * Alle drei bezeichnen denselben Zeitpunkt. **Aber neun Stellen der App sortieren
 * Zeitstempel mit `localeCompare`, also als TEXT** (`posts/sort.ts`,
 * `chat/sort.ts`, `requests/hooks.ts`, `groups/hooks.ts`). Gemessen am 2026-09-10:
 *
 *     '…07:59:29.833382+01:00'.localeCompare('…06:59:29.833Z')  →  1  (später)
 *     '…06:59:29.833382+00:00'.localeCompare('…06:59:29.833Z')  → -1  (früher)
 *
 * Derselbe Augenblick, einmal „später" und einmal „früher". Wäre das ungetauft
 * durchgelaufen, stünde im Feed und in der Chat-Liste eine falsche Reihenfolge —
 * und zwar eine, die aussieht wie ein kaputter Sortierer und keiner ist.
 *
 * Der Ausweg ist NICHT, die neun Stellen auf `Date`-Vergleiche umzubauen. Das wären
 * neun Gelegenheiten, eine zu vergessen. Hier ist es eine Zeile — dieselbe
 * Überlegung wie bei `istDirektChat()`.
 */
export function zeitpunkt(roh: string): string {
  return new Date(roh).toISOString();
}

/** Dasselbe für ein Feld, das fehlen darf. `null` wird `undefined`, nicht `''`. */
function zeitpunktOderNichts(roh: string | null): string | undefined {
  return roh === null ? undefined : zeitpunkt(roh);
}

// ═════════════════════════════════════════════════════════════════════════════
//  Wenn eine Zeile nicht stimmt
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Eine Zeile, aus der sich kein gültiges App-Objekt bauen lässt.
 *
 * ── Warum das wirft und nicht rät ─────────────────────────────────────────────
 * Der einzige Fall, der das auslösen kann, ist ein Post mit
 * `visibility_kind = 'group'` und ohne `visibility_group_id`. Die Datenbank lässt
 * ihn nicht zu (`constraint sicht_vollstaendig` in 0001), also kann er nur
 * entstehen, wenn jemand das Schema ändert.
 *
 * Trotzdem darf hier kein Rückfall auf `{ kind: 'public' }` stehen. Das wäre ein
 * Post, den sein Verfasser für seine Tennisgruppe geschrieben hat und den ganz Wien
 * sieht — der teuerste Fehler, den diese App machen kann, aus einer Zeile
 * Bequemlichkeit. **Im Zweifel verschwindet ein Post, er wird nicht
 * veröffentlicht.** Deshalb wirft `zuPost` und `zuPosts` lässt die Zeile fallen.
 */
export class ZeilenFehler extends Error {
  constructor(was: string, id: string) {
    super(`Zeile nicht übersetzbar (${was}, id=${id})`);
    this.name = 'ZeilenFehler';
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  Die Zeilen, so wie PostgREST sie liefert
// ═════════════════════════════════════════════════════════════════════════════

export interface ProfilZeile {
  id: string;
  handle: string;
  display_name: string;
  photo_url: string | null;
  bio: string;
  district: string;
  jahrgang: number;
  interests: ActivityCategory[];
  created_at: string;
}

/** Eine Kante aus `follows`. */
export interface FolgtZeile {
  follower_id: string;
  followee_id: string;
}

/** Eine Kante aus `blocks` — EINSEITIG, siehe harte Regel 10. */
export interface BlockZeile {
  blocker_id: string;
  blocked_id: string;
}

export interface PostZeile {
  id: string;
  author_id: string;
  category: ActivityCategory;
  title: string;
  district: string | null;
  starts_at: string;
  level: SkillLevel;
  alter_kind: 'egal' | 'spanne';
  alter_von_jahrgang: number | null;
  alter_bis_jahrgang: number | null;
  spots_total: number;
  spots_filled: number;
  note: string;
  meeting_point: string | null;
  expires_at: string | null;
  visibility_kind: 'public' | 'followers' | 'group';
  visibility_group_id: string | null;
  status: PostStatus;
  created_at: string;
}

export interface GruppenZeile {
  id: string;
  name: string;
  description: string;
  category: ActivityCategory;
  creator_id: string | null;
  offen: boolean;
  district: string | null;
  created_at: string;
  aufgeloest_am: string | null;
}

/** Eine Zeile aus `group_members`. `joined_at` ist keine Zierde — siehe `zuGroup`. */
export interface MitgliedZeile {
  group_id: string;
  user_id: string;
  joined_at: string;
}

export interface AnfrageZeile {
  id: string;
  post_id: string;
  from_user_id: string;
  message: string;
  status: RequestStatus;
  created_at: string;
}

export interface GruppenAnfrageZeile {
  id: string;
  group_id: string;
  from_user_id: string;
  message: string;
  status: RequestStatus;
  created_at: string;
}

export interface EinladungZeile {
  id: string;
  group_id: string;
  from_user_id: string;
  to_user_id: string;
  status: RequestStatus;
  created_at: string;
}

export interface FadenZeile {
  id: string;
  post_id: string | null;
  aus_aktivitaet: boolean;
  created_at: string;
  last_message_at: string;
}

export interface TeilnehmerZeile {
  thread_id: string;
  user_id: string;
}

export interface NachrichtZeile {
  id: string;
  thread_id: string;
  sender_id: string;
  text: string;
  sent_at: string;
}

export interface MeldungZeile {
  id: string;
  target_type: ReportTarget;
  target_id: string;
  from_user_id: string | null;
  reason: ReportReason;
  note: string;
  created_at: string;
}

// ═════════════════════════════════════════════════════════════════════════════
//  Die Übersetzung
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Ein Mensch.
 *
 * Die drei Beziehungslisten stehen NICHT in der Zeile — sie kommen aus `follows`
 * und `blocks`. Das ist die Auflösung von harter Regel 8: Eine Folge-Beziehung
 * stand im Prototyp zweimal im Modell (`followingIds` bei mir, `followerIds` beim
 * anderen), und die Regel „nur über folgen()/entfolgen() anfassen" war die Krücke,
 * die die beiden zusammenhielt. In der Datenbank ist es EINE Zeile; hier wird sie
 * für die App wieder auf beide Seiten verteilt, aber aus einer Quelle.
 */
export function zuUser(
  zeile: ProfilZeile,
  kanten: { folgt: FolgtZeile[]; blocks: BlockZeile[] },
): User {
  return {
    id: zeile.id,
    handle: zeile.handle,
    displayName: zeile.display_name,
    // `?? undefined` und nicht `?? ''`: `User.photoUrl` ist optional, und `SsAvatar`
    // unterscheidet „kein Bild" von „leere Adresse". Ein leerer String würde als
    // Bildquelle durchgereicht.
    photoUrl: zeile.photo_url ?? undefined,
    bio: zeile.bio,
    district: zeile.district,
    jahrgang: zeile.jahrgang,
    interests: zeile.interests,
    followerIds: kanten.folgt.filter((f) => f.followee_id === zeile.id).map((f) => f.follower_id),
    followingIds: kanten.folgt.filter((f) => f.follower_id === zeile.id).map((f) => f.followee_id),
    // Nur die eigene Richtung. Ein `blockedByIds` gäbe es hier zu bauen — und genau
    // das darf es nicht geben (harte Regel 10): Wer blockiert wird, darf es nicht
    // merken, also darf die Kante bei ihm nirgends auftauchen.
    blockedIds: kanten.blocks.filter((b) => b.blocker_id === zeile.id).map((b) => b.blocked_id),
  };
}

/** Aus zwei Spalten plus CHECK wird der Union aus Phase 17 zurück. */
function zuVisibility(zeile: PostZeile): Visibility {
  switch (zeile.visibility_kind) {
    case 'public':
      return { kind: 'public' };
    case 'followers':
      return { kind: 'followers' };
    case 'group':
      if (zeile.visibility_group_id === null) {
        throw new ZeilenFehler('Gruppen-Post ohne Gruppe', zeile.id);
      }
      return { kind: 'group', groupId: zeile.visibility_group_id };
  }
}

/** Dasselbe für den Union aus Phase 18b. */
function zuAlter(zeile: PostZeile): PostAlter {
  if (zeile.alter_kind === 'egal') return { kind: 'egal' };
  if (zeile.alter_von_jahrgang === null || zeile.alter_bis_jahrgang === null) {
    throw new ZeilenFehler('Alters-Spanne ohne Grenzen', zeile.id);
  }
  return {
    kind: 'spanne',
    vonJahrgang: zeile.alter_von_jahrgang,
    bisJahrgang: zeile.alter_bis_jahrgang,
  };
}

/** Wirft bei einer Zeile, die keinen gültigen Post ergibt — siehe `ZeilenFehler`. */
export function zuPost(zeile: PostZeile): Post {
  return {
    id: zeile.id,
    authorId: zeile.author_id,
    category: zeile.category,
    title: zeile.title,
    // BLEIBT `null`. `Post.district` ist `string | null` und nicht optional (Ians
    // Entscheidung 9), und `ortText()` unterscheidet die beiden Fälle. Aus `null`
    // hier `undefined` zu machen wäre die Sorte Vereinheitlichung, die eine
    // Entscheidung wegräumt.
    district: zeile.district,
    startsAt: zeitpunkt(zeile.starts_at),
    level: zeile.level,
    alter: zuAlter(zeile),
    spotsTotal: zeile.spots_total,
    spotsFilled: zeile.spots_filled,
    note: zeile.note,
    meetingPoint: zeile.meeting_point ?? undefined,
    expiresAt: zeitpunktOderNichts(zeile.expires_at),
    visibility: zuVisibility(zeile),
    status: zeile.status,
    createdAt: zeitpunkt(zeile.created_at),
  };
}

/**
 * Viele Posts. Eine Zeile, die keinen gültigen Post ergibt, FÄLLT WEG.
 *
 * Das ist die einzige Stelle der App, an der etwas still verschwindet, und sie
 * widerspricht Ians Entscheidung 31 („keine Ansicht verschluckt still Posts") nicht:
 * Dort ging es um FILTER, hier um eine Zeile, die die Datenbank gar nicht
 * hätte anlegen dürfen. Die Alternative wäre, die ganze Liste scheitern zu lassen —
 * dann nähme ein kaputter Datensatz allen den Feed.
 */
export function zuPosts(zeilen: PostZeile[]): Post[] {
  const posts: Post[] = [];
  for (const zeile of zeilen) {
    try {
      posts.push(zuPost(zeile));
    } catch (fehler) {
      if (!(fehler instanceof ZeilenFehler)) throw fehler;
      // Sichtbar in der Konsole, unsichtbar im Feed. Ein Post, dessen Sichtbarkeit
      // unklar ist, wird nicht gezeigt — siehe `ZeilenFehler`.
      console.warn(fehler.message);
    }
  }
  return posts;
}

/**
 * Eine Gruppe.
 *
 * ── Die REIHENFOLGE von `memberIds` trägt eine Regel ──────────────────────────
 * Harte Regel 33: Die Liste wächst hinten, also erbt der zweite Eintrag die Gruppe,
 * wenn der Gründer geht (`nachfolgerId()`, Ians Entscheidung 13). Eine Tabelle hat
 * keine Reihenfolge — sie steht in `joined_at`, und hier wird sie danach sortiert.
 *
 * Das ist eine VERBESSERUNG und keine Anpassung: Bisher hing eine Erbfolge an einer
 * Array-Reihenfolge, die jeder unabsichtlich umsortieren konnte. Jetzt an einem
 * Datum. **Wer diese Sortierung entfernt, ändert still, wem eine Gruppe gehört.**
 */
export function zuGroup(zeile: GruppenZeile, mitglieder: MitgliedZeile[]): Group {
  return {
    id: zeile.id,
    name: zeile.name,
    description: zeile.description,
    category: zeile.category,
    // BLEIBT `null` — eine aufgelöste Gruppe hat keinen Chef (0001,
    // `constraint chef_oder_aufgeloest`). Gefragt wird über `istGruender()`.
    creatorId: zeile.creator_id,
    memberIds: mitglieder
      .filter((m) => m.group_id === zeile.id)
      .sort((a, b) => a.joined_at.localeCompare(b.joined_at))
      .map((m) => m.user_id),
    offen: zeile.offen,
    district: zeile.district,
    createdAt: zeitpunkt(zeile.created_at),
    // `undefined` und nicht `null`: `istAufgeloest()` vergleicht mit `undefined`,
    // weil `Group.aufgeloestAm` optional ist. Genau diese Übersetzung ist der Grund,
    // warum die Frage in EINER Funktion steht und nicht als `!g.aufgeloestAm` in
    // fünf Screens — dort wäre `null` genauso falsch wie `undefined` richtig.
    aufgeloestAm: zeitpunktOderNichts(zeile.aufgeloest_am),
  };
}

export function zuJoinRequest(zeile: AnfrageZeile): JoinRequest {
  return {
    id: zeile.id,
    postId: zeile.post_id,
    fromUserId: zeile.from_user_id,
    message: zeile.message,
    status: zeile.status,
    createdAt: zeitpunkt(zeile.created_at),
  };
}

export function zuGroupRequest(zeile: GruppenAnfrageZeile): GroupRequest {
  return {
    id: zeile.id,
    groupId: zeile.group_id,
    fromUserId: zeile.from_user_id,
    message: zeile.message,
    status: zeile.status,
    createdAt: zeitpunkt(zeile.created_at),
  };
}

export function zuGroupInvite(zeile: EinladungZeile): GroupInvite {
  return {
    id: zeile.id,
    groupId: zeile.group_id,
    fromUserId: zeile.from_user_id,
    toUserId: zeile.to_user_id,
    status: zeile.status,
    createdAt: zeitpunkt(zeile.created_at),
  };
}

/**
 * Ein Chat-Faden.
 *
 * `aus_aktivitaet` wird MITGENOMMEN und nicht aus `post_id` gerechnet — harte
 * Regel 56. Genau hier würde der Fehler entstehen, gegen den sie gebaut ist: Ein
 * Aktivitäts-Chat, dessen Post gelöscht wurde, hat `post_id = null`, und wer die
 * Herkunft daraus ableitet, macht daraus lautlos einen Direktchat. Dann gälte Ians
 * `SCHREIB_REGEL = 'gegenseitig'` für zwei Leute, die sich längst getroffen haben.
 */
export function zuChatThread(zeile: FadenZeile, teilnehmer: TeilnehmerZeile[]): ChatThread {
  return {
    id: zeile.id,
    postId: zeile.post_id ?? undefined,
    ausAktivitaet: zeile.aus_aktivitaet,
    participantIds: teilnehmer.filter((t) => t.thread_id === zeile.id).map((t) => t.user_id),
    lastMessageAt: zeitpunkt(zeile.last_message_at),
  };
}

export function zuMessage(zeile: NachrichtZeile): Message {
  return {
    id: zeile.id,
    threadId: zeile.thread_id,
    senderId: zeile.sender_id,
    text: zeile.text,
    sentAt: zeitpunkt(zeile.sent_at),
  };
}

/**
 * Eine Meldung.
 *
 * `from_user_id` darf in der Datenbank `null` sein — dann hat der Melder sein Konto
 * gelöscht, und die MELDUNG bleibt (0001). Für die App gibt es diesen Fall nicht:
 * Sie liest über `melder_sieht_eigene` nur die EIGENEN Meldungen, und wer sein Konto
 * gelöscht hat, liest gar nichts mehr. Die Zeile wäre also nur über den
 * Dienstschlüssel sichtbar, und das ist 20.7 — ein Mensch, kein Screen.
 */
export function zuReport(zeile: MeldungZeile): Report {
  if (zeile.from_user_id === null) {
    throw new ZeilenFehler('Meldung ohne Melder', zeile.id);
  }
  return {
    id: zeile.id,
    targetType: zeile.target_type,
    targetId: zeile.target_id,
    fromUserId: zeile.from_user_id,
    reason: zeile.reason,
    note: zeile.note,
    createdAt: zeitpunkt(zeile.created_at),
  };
}
