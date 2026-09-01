/**
 * Datenmodell aus PLAN.md, Abschnitt 2.
 *
 * Die Feldnamen sind so gewählt, dass sie später 1:1 Firestore-Felder werden können —
 * flache Objekte, IDs als Strings, Zeitpunkte als ISO-8601-Strings.
 *
 * Bewusst NICHT enthalten: GPS-Koordinaten. Gespeichert wird nur der Bezirk.
 */

export type ActivityCategory =
  | 'sport' // Tennis, Laufen, Fußball, Bouldern
  | 'food' // Kaffee, Mittagessen, Kochen
  | 'study' // Lernen, Hausübung, Projektpartner
  | 'culture' // Kino, Konzert, Museum, Fortgehen
  | 'outdoor' // Spazieren, Wandern, Donauinsel, Picknick
  | 'creative'; // Fotografieren, Musik, Zeichnen, Basteln

export type SkillLevel = 'any' | 'beginner' | 'intermediate' | 'advanced';
export type Visibility = 'public' | 'followers';
export type PostStatus = 'open' | 'full' | 'past';
export type RequestStatus = 'pending' | 'accepted' | 'declined';

export interface Post {
  id: string;
  authorId: string;
  category: ActivityCategory;
  title: string; // "Tennis spielen"
  district: string; // "1220" — nur Bezirk, nie GPS
  startsAt: string; // ISO 8601
  level: SkillLevel;
  spotsTotal: number;
  spotsFilled: number;
  note: string; // "Hab 2 Schläger dabei"
  meetingPoint?: string; // OPTIONAL — der Poster entscheidet
  /**
   * Wann der Post aus dem Feed verschwindet. OPTIONAL: fehlt er, gilt die
   * Standardregel aus `features/posts/lifecycle.ts` (bis zum Ende des Tages).
   * Ians Entscheidung vom 2026-08-31, PLAN.md Abschnitt 6.2.
   */
  expiresAt?: string; // ISO 8601
  visibility: Visibility;
  status: PostStatus;
  createdAt: string;
}

export interface JoinRequest {
  id: string;
  postId: string;
  fromUserId: string;
  message: string; // "Hey, bin dabei! Passt 17:00?"
  status: RequestStatus;
  createdAt: string;
}

export interface User {
  id: string;
  handle: string; // "@ian"
  displayName: string;
  avatar: string; // Emoji im Prototyp, später Bild-URL
  bio: string;
  district: string;
  interests: ActivityCategory[];
  followerIds: string[];
  followingIds: string[];
  /**
   * Wen diese Person blockiert hat.
   *
   * Anders als eine Folge-Beziehung steht ein Block NUR EINMAL im Modell — beim
   * Blockierenden. Das ist kein Sparen, sondern der Kern der Sache: Wer blockiert
   * wird, darf es nicht merken. Stünde die Kante auch beim anderen (`blockedByIds`),
   * wäre sie über jede Abfrage sichtbar, die dieser Nutzer auf sich selbst macht.
   *
   * Die Wirkung geht trotzdem in beide Richtungen — sie wird gelesen, nicht
   * gespeichert: `istBlockiert` in `features/safety/hooks.ts` fragt beide Seiten ab.
   * Ians Entscheidung dazu, was ein Block überhaupt anfasst, steht in
   * `features/safety/block.ts`.
   */
  blockedIds: string[];
}

export interface ChatThread {
  id: string;
  postId: string;
  participantIds: string[];
  lastMessageAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  sentAt: string;
}

// ── Melden (Phase 7) ─────────────────────────────────────────────────────────

/** Was gemeldet wurde. Ein Post und ein Mensch sind zwei verschiedene Beschwerden. */
export type ReportTarget = 'post' | 'user';

/**
 * Warum gemeldet wurde.
 *
 * Bewusst eine feste Liste statt Freitext: Ein Grund, den man anklickt, ist im
 * Backend zählbar und sortierbar — bei fünf Meldungen wegen `gefahr` muss jemand
 * sofort hinschauen, bei fünf wegen `spam` nicht. Der Freitext kommt als `note`
 * zusätzlich dazu, aber er ist nicht das, wonach sortiert wird.
 *
 * `dating` ist SimplySocial-spezifisch und steht hier, weil „kein Dating“ laut
 * PLAN.md Abschnitt 1 zur Definition der App gehört. Ohne diesen Grund müssten
 * Leute die Verwendung, gegen die sich die App am deutlichsten abgrenzt, unter
 * „Anderes“ melden — und dann sieht man sie in keiner Statistik.
 */
export type ReportReason =
  | 'spam' // Werbung, Massenposts
  | 'belaestigung' // beleidigend, bedrängend
  | 'unangemessen' // Inhalt, der hier nichts verloren hat
  | 'dating' // gemeint als Anmache — SimplySocial ist kein Dating
  | 'fake' // Profil oder Treffen gibt es so nicht
  | 'gefahr' // jemand könnte zu Schaden kommen
  | 'anderes';

export interface Report {
  id: string;
  targetType: ReportTarget;
  targetId: string; // Post-ID oder Nutzer-ID, je nach `targetType`
  fromUserId: string;
  reason: ReportReason;
  note: string; // freiwillige Ergaenzung
  createdAt: string;
}
