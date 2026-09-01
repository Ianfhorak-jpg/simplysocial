import type { ChatThread, JoinRequest, Message, Post, Report, User } from '@/types/models';

/**
 * ALLE Fake-Daten des Prototyps — an genau dieser einen Stelle.
 *
 * WICHTIG: Screens lesen hier NIE direkt heraus. Sie gehen immer über die Hooks in
 * `src/features/<bereich>/hooks.ts`. Nur dadurch bleibt der spätere Tausch gegen eine echte
 * Datenbank eine Änderung an einer Handvoll Dateien statt einer Suchen-und-Ersetzen-
 * Aktion durch alle Screens.
 */

/** Wer der Prototyp gerade "ist". Kein Login — der Nutzer steht einfach fest. */
export const CURRENT_USER_ID = 'u_ian';

// ── Keine echten Personen und keine echte Schule ─────────────────────────────
// Ab Phase 8 liegt der Prototyp auf einer öffentlichen Adresse, und Links werden
// weitergeleitet. Deshalb steht hier NICHTS, was eine echte Person identifiziert:
// keine Schule, keine Klasse, kein Lehrername. In Ians Bio standen bis 01.09. seine
// Schule und seine Klasse, in einem Fake-Post der echte Name eines Lehrers — unter
// 200 Leuten, die dieselbe Schule besuchen, harmlos; auf einer offenen URL nicht.
// (Sie hier als Beispiel hinzuschreiben wäre derselbe Fehler noch einmal.)
// Wer neue Fake-Daten dazuschreibt, hält sich daran. `public/robots.txt` hält Google
// draußen, aber abrufbar bleibt die Seite für jeden, der den Link hat.

// ── Zeit ─────────────────────────────────────────────────────────────────────
// Die Termine werden RELATIV zum heutigen Tag gerechnet, nicht fest eingetippt.
// Grund: Ian zeigt den Prototyp vielleicht erst nächste Woche her. Feste Daten wären
// dann alle abgelaufen und der Feed leer — der schlechteste erste Eindruck.
//
// Nebenwirkung: Beim statischen Web-Export entsteht der HTML-Schnappschuss zur
// Build-Zeit, der Browser rechnet aber neu. React meldet dann in der Konsole eine
// Hydration-Warnung. Sichtbar ist davon nichts, und mit echtem Backend fällt es weg.

/** ISO-Zeitpunkt: `tage` Tage von heute, zur Uhrzeit `hhmm`. */
function at(tage: number, hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setDate(d.getDate() + tage);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

/** ISO-Zeitpunkt: vor `stunden` Stunden. Für `createdAt` und Chat-Zeitstempel. */
function vorStunden(stunden: number): string {
  return new Date(Date.now() - stunden * 3600_000).toISOString();
}

/**
 * ISO-Zeitpunkt für Posts, die HEUTE noch stattfinden.
 *
 * Nicht `at(0, '17:00')` — das wäre schon vorbei, wenn man den Prototyp um 18 Uhr
 * aufmacht, und ein abgelaufener Post mit Status "offen" ist genau der Widerspruch,
 * den Ian am Prototyp eigentlich beurteilen soll.
 *
 * Aufgerundet auf die nächste halbe Stunde, damit "18:30" dasteht und nicht "18:07".
 * Zwischen 22 und 8 Uhr rutscht der Termin auf morgen — "Fußball um 03:00" wäre albern.
 */
function bald(stundenVoraus: number, ersatzUhrzeitMorgen: string): string {
  const d = new Date(Date.now() + stundenVoraus * 3600_000);
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() <= 30 ? 30 : 60);
  if (d.getHours() < 8 || d.getHours() >= 22) return at(1, ersatzUhrzeitMorgen);
  return d.toISOString();
}

// ── Nutzer ───────────────────────────────────────────────────────────────────

/**
 * Wer wem folgt, als Kantenliste [folgt, wird gefolgt].
 * Aus dieser einen Liste werden unten BEIDE Richtungen (`followerIds`, `followingIds`)
 * berechnet — von Hand gepflegt würden die zwei Arrays unweigerlich auseinanderlaufen.
 */
const FOLLOW_EDGES: [string, string][] = [
  ['u_ian', 'u_lea'],
  ['u_ian', 'u_tobi'],
  ['u_ian', 'u_mira'],
  ['u_ian', 'u_flo'],
  ['u_lea', 'u_ian'],
  ['u_lea', 'u_mira'],
  ['u_tobi', 'u_ian'],
  ['u_tobi', 'u_flo'],
  ['u_mira', 'u_ian'],
  ['u_mira', 'u_lea'],
  ['u_mira', 'u_sara'],
  ['u_flo', 'u_tobi'],
  ['u_sara', 'u_ian'],
  ['u_sara', 'u_mira'],
];

// Alle drei Beziehungslisten werden unten berechnet und stehen deshalb nicht am Seed:
// wer wem folgt, kommt aus `FOLLOW_EDGES`, und blockiert ist niemand.
type UserSeed = Omit<User, 'followerIds' | 'followingIds' | 'blockedIds'>;

const USER_SEEDS: UserSeed[] = [
  {
    id: 'u_ian',
    handle: '@ian',
    displayName: 'Ian',
    avatar: '🎧',
    bio: 'Bau gerade diese App. Immer für spontan zu haben.',
    district: '1070',
    interests: ['creative', 'sport', 'study'],
  },
  {
    id: 'u_lea',
    handle: '@lea',
    displayName: 'Lea',
    avatar: '🌿',
    bio: 'Draußen lieber als drinnen. Tennis seit ich acht bin.',
    district: '1220',
    interests: ['sport', 'outdoor', 'culture'],
  },
  {
    id: 'u_tobi',
    handle: '@tobi',
    displayName: 'Tobias',
    avatar: '⚡',
    bio: 'Koffein und Kletterhalle. Sag Bescheid, wenn wer mit will.',
    district: '1100',
    interests: ['sport', 'food'],
  },
  {
    id: 'u_mira',
    handle: '@mira',
    displayName: 'Mira',
    avatar: '🎨',
    bio: 'Fotografiere analog, esse zu viel Ramen. Zeig dir gern, wie die Kamera geht.',
    district: '1050',
    interests: ['creative', 'food', 'culture'],
  },
  {
    id: 'u_flo',
    handle: '@flo',
    displayName: 'Florian',
    avatar: '🏀',
    bio: 'Käfig, Kahlenberg, alles was draußen ist.',
    district: '1020',
    interests: ['sport', 'outdoor'],
  },
  {
    id: 'u_sara',
    handle: '@sara',
    displayName: 'Sara',
    avatar: '📚',
    bio: 'Lerne lieber zu zweit als allein. Und geh gern ins Kino.',
    district: '1030',
    interests: ['study', 'culture'],
  },
];

export const users: User[] = USER_SEEDS.map((seed) => ({
  ...seed,
  followerIds: FOLLOW_EDGES.filter(([, zu]) => zu === seed.id).map(([von]) => von),
  followingIds: FOLLOW_EDGES.filter(([von]) => von === seed.id).map(([, zu]) => zu),
  // Niemand blockiert jemanden. Absicht: Ein vorgefertigter Block wäre die einzige
  // Beziehung in den Fake-Daten, die man nicht erklären kann, ohne sich eine
  // hässliche Geschichte zwischen zwei Leuten auszudenken, die Ian seinen Freunden
  // zeigt. Blockieren prüft man im Prototyp, indem man es tut.
  blockedIds: [],
}));

// ── Posts ────────────────────────────────────────────────────────────────────

export const posts: Post[] = [
  {
    id: 'p1',
    authorId: 'u_lea',
    category: 'sport',
    title: 'Tennis spielen',
    district: '1220',
    startsAt: bald(2, '17:00'),
    level: 'any',
    spotsTotal: 2,
    spotsFilled: 1,
    note: 'Hab zwei Schläger dabei, du brauchst nur Sportschuhe.',
    meetingPoint: 'Tennisplätze Alte Donau, beim Eingang',
    visibility: 'public',
    status: 'open',
    createdAt: vorStunden(5),
  },
  {
    id: 'p2',
    authorId: 'u_tobi',
    category: 'food',
    title: 'Kaffee nach der Schule',
    district: '1140',
    startsAt: bald(1, '15:30'),
    level: 'any',
    spotsTotal: 4,
    spotsFilled: 2,
    note: 'Kaffee gegen den Nachmittagsdurchhänger. Ich hab danach nichts mehr vor.',
    meetingPoint: 'Café gegenüber der Schule',
    visibility: 'public',
    status: 'open',
    createdAt: vorStunden(8),
  },
  {
    id: 'p3',
    authorId: 'u_ian',
    category: 'study',
    title: 'Für die Mathe-Schularbeit lernen',
    district: '1140',
    startsAt: at(1, '14:00'),
    level: 'any',
    spotsTotal: 3,
    spotsFilled: 1,
    note: 'Kurvendiskussion. Ich hab die alten Angaben vom Vorjahr mit.',
    meetingPoint: 'Bibliothek, zweiter Stock',
    visibility: 'followers',
    status: 'open',
    createdAt: vorStunden(20),
  },
  {
    id: 'p4',
    authorId: 'u_mira',
    category: 'creative',
    title: 'Fotospaziergang am Karlsplatz',
    district: '1040',
    startsAt: at(1, '18:30'),
    level: 'beginner',
    spotsTotal: 5,
    spotsFilled: 2,
    note: 'Analog oder digital, egal. Ich zeig dir gern, wie man manuell belichtet.',
    visibility: 'public',
    status: 'open',
    createdAt: vorStunden(26),
  },
  {
    id: 'p5',
    authorId: 'u_flo',
    category: 'sport',
    title: 'Fußball am Käfig',
    district: '1020',
    startsAt: bald(4, '19:00'),
    level: 'intermediate',
    spotsTotal: 8,
    spotsFilled: 8,
    note: 'Vier gegen vier. Bring was Helles und was Dunkles mit.',
    meetingPoint: 'Käfig beim Praterstern',
    visibility: 'public',
    status: 'full',
    createdAt: vorStunden(30),
  },
  {
    id: 'p6',
    authorId: 'u_sara',
    category: 'culture',
    title: 'Kino, Spätvorstellung',
    district: '1060',
    startsAt: at(2, '20:45'),
    level: 'any',
    spotsTotal: 3,
    spotsFilled: 0,
    note: 'Irgendwas im Original mit Untertiteln. Welcher Film, entscheiden wir gemeinsam.',
    visibility: 'public',
    status: 'open',
    createdAt: vorStunden(11),
  },
  {
    id: 'p7',
    authorId: 'u_lea',
    category: 'outdoor',
    title: 'Donauinsel spazieren',
    district: '1220',
    startsAt: at(1, '16:00'),
    level: 'any',
    spotsTotal: 4,
    spotsFilled: 1,
    note: 'Einmal von der U6 bis zur Brücke und zurück. Gemütlich, kein Sport.',
    visibility: 'public',
    status: 'open',
    createdAt: vorStunden(14),
  },
  {
    id: 'p8',
    authorId: 'u_ian',
    category: 'creative',
    title: 'Skizzieren im Museumsquartier',
    district: '1070',
    startsAt: at(3, '15:00'),
    level: 'any',
    spotsTotal: 3,
    spotsFilled: 0,
    note: 'Nur Block und Bleistift. Ich sitz sowieso dort, kommt gern wer dazu.',
    visibility: 'public',
    status: 'open',
    createdAt: vorStunden(4),
  },
  {
    id: 'p9',
    authorId: 'u_tobi',
    category: 'sport',
    title: 'Bouldern in der Halle',
    district: '1100',
    startsAt: at(2, '17:30'),
    level: 'beginner',
    spotsTotal: 3,
    spotsFilled: 1,
    note: 'Ich kletter seit einem Jahr. Anfänger sind ausdrücklich willkommen.',
    meetingPoint: 'Beim Kassabereich',
    visibility: 'public',
    status: 'open',
    createdAt: vorStunden(33),
  },
  {
    id: 'p10',
    authorId: 'u_mira',
    category: 'food',
    title: 'Ramen essen gehen',
    district: '1070',
    startsAt: at(1, '19:00'),
    level: 'any',
    spotsTotal: 4,
    spotsFilled: 2,
    note: 'Das kleine Lokal in der Neubaugasse. Reservieren geht nicht, wir stellen uns an.',
    visibility: 'followers',
    status: 'open',
    createdAt: vorStunden(9),
  },
  {
    id: 'p11',
    authorId: 'u_sara',
    category: 'study',
    title: 'Englisch-Referat üben',
    district: '1030',
    startsAt: at(2, '16:30'),
    level: 'any',
    spotsTotal: 2,
    spotsFilled: 0,
    note: 'Ich muss vor Publikum reden können, ohne rot zu werden. Du hörst zu, ich dir auch.',
    visibility: 'followers',
    status: 'open',
    createdAt: vorStunden(2),
  },
  {
    id: 'p12',
    authorId: 'u_flo',
    category: 'outdoor',
    title: 'Sonnenuntergang am Kahlenberg',
    district: '1190',
    startsAt: at(4, '19:15'),
    level: 'any',
    spotsTotal: 6,
    spotsFilled: 3,
    note: 'Mit dem 38A rauf. Nimm was zum Draufsitzen mit, die Bänke sind immer voll.',
    meetingPoint: 'Endstation 38A',
    visibility: 'public',
    status: 'open',
    createdAt: vorStunden(48),
  },
  {
    id: 'p13',
    authorId: 'u_lea',
    category: 'culture',
    title: 'Konzert in der Arena',
    district: '1030',
    startsAt: at(5, '20:00'),
    level: 'any',
    spotsTotal: 3,
    spotsFilled: 1,
    note: 'Karten gibts an der Abendkassa, ungefähr 18 Euro.',
    visibility: 'public',
    status: 'open',
    createdAt: vorStunden(52),
  },
  {
    id: 'p14',
    authorId: 'u_ian',
    category: 'sport',
    title: 'Laufen um den Ring',
    district: '1010',
    startsAt: at(-1, '07:00'),
    level: 'any',
    spotsTotal: 3,
    spotsFilled: 2,
    note: 'Frühe Runde vor der Schule, gut fünf Kilometer, gemütliches Tempo.',
    visibility: 'public',
    status: 'past',
    createdAt: vorStunden(56),
  },
];

// ── Anfragen ─────────────────────────────────────────────────────────────────
// Die vier offenen liegen alle auf Posts von Ian — sonst wäre der Anfragen-Tab leer,
// und genau der ist laut PLAN.md das Herzstück, das zuerst richtig sitzen muss.

export const joinRequests: JoinRequest[] = [
  {
    id: 'r1',
    postId: 'p3',
    fromUserId: 'u_sara',
    message: 'Ich schreib die Schularbeit auch am Donnerstag. Bin dabei!',
    status: 'pending',
    createdAt: vorStunden(6),
  },
  {
    id: 'r2',
    postId: 'p3',
    fromUserId: 'u_tobi',
    message: 'Kann ich mitlernen? Kurvendiskussion ist genau mein Problem.',
    status: 'pending',
    createdAt: vorStunden(3),
  },
  // Die dritte Anfrage auf p3 ist Absicht (dazugekommen in Phase 4): der Post hat noch
  // zwei freie Plätze. Bestätigt man beide, bleibt genau eine Anfrage übrig, für die
  // kein Platz mehr da ist — der Fall, um den es in PLAN.md, Abschnitt 6.3 geht. Ohne
  // sie könnte man die Frage im Prototyp gar nicht auslösen.
  {
    id: 'r7',
    postId: 'p3',
    fromUserId: 'u_mira',
    message: 'Mathe ist nicht meins, aber ich sitz eh in der Bibliothek. Darf ich mich dazusetzen?',
    status: 'pending',
    createdAt: vorStunden(1.5),
  },
  {
    id: 'r3',
    postId: 'p8',
    fromUserId: 'u_mira',
    message: 'Ich bring Tusche mit, falls du was anderes probieren magst.',
    status: 'pending',
    createdAt: vorStunden(2),
  },
  {
    id: 'r4',
    postId: 'p8',
    fromUserId: 'u_flo',
    message: 'Bin dabei, ich sitz eh oft im MQ.',
    status: 'pending',
    createdAt: vorStunden(1),
  },
  // Diese zwei sind bereits bestätigt — aus ihnen sind die beiden Chats entstanden.
  {
    id: 'r5',
    postId: 'p1',
    fromUserId: 'u_ian',
    message: 'Hey, bin dabei! Ich bring nur Schuhe mit, passt das?',
    status: 'accepted',
    createdAt: vorStunden(4),
  },
  {
    id: 'r6',
    postId: 'p2',
    fromUserId: 'u_ian',
    message: 'Kaffee klingt gut, ich komm mit.',
    status: 'accepted',
    createdAt: vorStunden(7),
  },
];

// ── Chats ────────────────────────────────────────────────────────────────────

export const chatThreads: ChatThread[] = [
  {
    id: 't1',
    postId: 'p1',
    participantIds: ['u_ian', 'u_lea'],
    lastMessageAt: vorStunden(1),
  },
  {
    id: 't2',
    postId: 'p2',
    participantIds: ['u_ian', 'u_tobi'],
    lastMessageAt: vorStunden(6),
  },
];

export const messages: Message[] = [
  { id: 'm1', threadId: 't1', senderId: 'u_lea', text: 'Cool, freut mich! 🎾', sentAt: vorStunden(4) },
  { id: 'm2', threadId: 't1', senderId: 'u_ian', text: 'Ich mich auch. Wie kommst du hin?', sentAt: vorStunden(4) },
  {
    id: 'm3',
    threadId: 't1',
    senderId: 'u_lea',
    text: 'U1 bis Kagran, dann zehn Minuten zu Fuß. Bin eher zu früh als zu spät.',
    sentAt: vorStunden(3),
  },
  { id: 'm4', threadId: 't1', senderId: 'u_ian', text: 'Passt, dann treffen wir uns direkt am Platz.', sentAt: vorStunden(2) },
  { id: 'm5', threadId: 't1', senderId: 'u_lea', text: 'Bis später!', sentAt: vorStunden(1) },

  {
    id: 'm6',
    threadId: 't2',
    senderId: 'u_tobi',
    text: 'Super. Ich hab vorher noch Werkstätte, kann sein dass ich fünf Minuten später bin.',
    sentAt: vorStunden(7),
  },
  { id: 'm7', threadId: 't2', senderId: 'u_ian', text: 'Kein Stress, ich wart.', sentAt: vorStunden(7) },
  { id: 'm8', threadId: 't2', senderId: 'u_tobi', text: 'Top. Sitzen wir drinnen oder draußen?', sentAt: vorStunden(6) },
  { id: 'm9', threadId: 't2', senderId: 'u_ian', text: 'Draußen, solang das Wetter noch mitmacht.', sentAt: vorStunden(6) },
];

// ── Meldungen ────────────────────────────────────────────────────────────────

/**
 * Leer, und das bleibt auch so.
 *
 * Eine vorgefertigte Meldung hätte niemanden, der sie bearbeitet — im Prototyp gibt
 * es keine Moderation, die sie wegräumen könnte. Sie stünde also für immer da. Die
 * Liste existiert trotzdem: Sie ist die Form, die im Backend eine eigene Sammlung
 * wird, und sie sorgt dafür, dass ein gemeldeter Post im Screen als gemeldet gilt.
 */
export const reports: Report[] = [];
