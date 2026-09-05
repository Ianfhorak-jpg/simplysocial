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

/**
 * Wer einen Post sehen darf. Seit Phase 17 drei Stufen statt zwei.
 *
 * ── Warum ein Objekt und nicht drei Zeichenketten ─────────────────────────────
 * Die dritte Stufe braucht mehr als ihren Namen: „nur die Gruppe" ist ohne die
 * Frage „welche?" keine Regel. Der naheliegende Weg wäre gewesen, den Typ auf
 * `'public' | 'followers' | 'group'` zu erweitern und die ID als zweites Feld
 * `groupId: string | null` danebenzulegen.
 *
 * Genau dieser Weg hat in diesem Projekt schon zweimal Zeit gekostet — bei
 * `Post.district` und bei `ChatThread.postId` (siehe die Lehren in CLAUDE.md).
 * Beide Male war ein Feld weiter geworden, und der Compiler hat dazu **nichts**
 * gesagt: `visibility === 'group'` mit `groupId === null` wäre gültiger Code, und
 * herausgekommen wäre ein Post, den niemand sieht — sichtbar erst am Gerät.
 *
 * Als Union kann dieser Zustand nicht entstehen. An `groupId` kommt man erst,
 * nachdem man `kind` geprüft hat; TypeScript lässt es sonst nicht zu. Und weil der
 * Vergleich `post.visibility === 'followers'` damit ungültig wird, hat `tsc` beim
 * Umbau die Arbeitsliste geschrieben statt sie zu verschweigen — dieselbe Technik
 * wie bei `IconName` in Phase 14.
 *
 * ── Was das für die Datenbank heißt ───────────────────────────────────────────
 * Firestore speichert verschachtelte Objekte als Map, und Abfragen gehen über den
 * Pfad: `where('visibility.kind', '==', 'public')`. Der Plan aus Abschnitt 2
 * (flache Objekte, IDs als Strings) bleibt damit eingehalten — es ist eine Ebene
 * mehr, keine Beziehung mehr.
 *
 * ── Wo die Enge NICHT hinreicht ───────────────────────────────────────────────
 * Der Erstellen-Screen kann diesen Typ nicht direkt als Zustand halten:
 * `SsSegment` vergleicht Auswahlmöglichkeiten mit `===`, und zwei gleich aussehende
 * Objekte sind nie `===`. Dort liegt deshalb `VisibilityKind` im Zustand, und das
 * Objekt entsteht beim Absenden (`sichtbarkeitBauen` in `features/groups/gruppe.ts`).
 * Der ungültige Zwischenzustand „Gruppe gewählt, aber keine" lebt damit im Screen,
 * wo er hingehört und behandelt wird — und nicht in den Daten.
 */
export type Visibility =
  | { kind: 'public' }
  | { kind: 'followers' }
  | { kind: 'group'; groupId: string };

/** Nur der Schlüssel — für Auswahlflächen und Beschriftungen, wo die ID nicht zählt. */
export type VisibilityKind = Visibility['kind'];

/**
 * Für WEN eine Aktivität gedacht ist — Phase 15, Leopolds vereinfachte Form.
 *
 * Die App rechnet KEINE Menschen zusammen: Es gibt kein Geburtsdatum, keine
 * Altersprüfung und kein Matching. Der Poster stellt selbst ein, für wen sein
 * Vorschlag gedacht ist, und `egal` ist die Voreinstellung — das ist der ganze
 * Mechanismus.
 *
 * ── Phase 18b: aus drei Bändern wurde EIN Jahrgang ───────────────────────────
 * Bis zum 2026-09-05 standen hier `AgeGroup` ('egal' | '14-17' | '18-25' | '26+')
 * und `AgeBand` (dasselbe ohne 'egal'). Beide sind weg. **Ians Entscheidung 17:**
 * „mehr als Jahrgang brauchen wir nicht."
 *
 * Ich hatte dagegengehalten — ein Schieberegler über drei Bändern wäre eine
 * schlechtere Pillenreihe, und das Modell kannte kein Geburtsdatum. Seine Antwort
 * war eine, die ich nicht angeboten hatte: **nur das JAHR**. Damit ist ein
 * Schieberegler sinnvoll (47 Stufen statt drei), und ein Geburtsdatum gibt es
 * weiterhin nicht — ein Jahrgang ist kein Geburtstag.
 *
 * Der Grund, warum `AgeBand` überhaupt ein eigener Typ war, bleibt wahr: Eine
 * Aktivität kann „für alle" sein, ein Mensch nicht. Im neuen Modell ist das
 * sauberer als vorher, weil es sich gar nicht mehr AUSDRÜCKEN lässt — ein
 * `User.jahrgang` ist eine Zahl und kann nicht „egal" sein.
 *
 * ── Warum ein Union und nicht zwei Zahlen mit `| null` ───────────────────────
 * Vierte Runde derselben Frage nach `Post.district`, `ChatThread.postId` und
 * `Visibility`. Mit `vonJahrgang: number | null` wäre „Spanne ohne Grenzen"
 * darstellbar, und jede Anzeigestelle müsste raten, ob das „für alle" heißt oder
 * „halb ausgefüllt". Mit dem Union ist der Zustand UNDARSTELLBAR — und weil
 * `post.ageGroup === 'egal'` dadurch ungültig wird, schreibt `tsc` die Arbeitsliste.
 */

/**
 * Für wen eine Aktivität gedacht ist.
 *
 * `egal` ist die Voreinstellung und der Normalfall. Ians Entscheidung 18 hängt
 * daran: Ein Post „für alle" passt zu JEDEM Alters-Filter (`ALTER_REGEL` in
 * `features/posts/filter.ts`) — sonst würfe der Filter ausgerechnet die offensten
 * Posts weg.
 *
 * Die Spanne ist in JAHRGÄNGEN angegeben, nicht in Jahren: `vonJahrgang` ist der
 * ÄLTERE Rand (die kleinere Zahl), `bisJahrgang` der jüngere. Das ist auf den
 * ersten Blick verdreht — „von 2001 bis 2008" heißt „von 25 bis 18 Jahre" — aber
 * jede andere Wahl hätte irgendwo eine Umkehrung versteckt, und eine versteckte
 * Umkehrung ist genau die Sorte Fehler, die niemand sieht.
 */
export type PostAlter =
  | { kind: 'egal' }
  | { kind: 'spanne'; vonJahrgang: number; bisJahrgang: number };

export type PostStatus = 'open' | 'full' | 'past';
export type RequestStatus = 'pending' | 'accepted' | 'declined';

export interface Post {
  id: string;
  authorId: string;
  category: ActivityCategory;
  title: string; // "Tennis spielen"
  /**
   * Der Bezirk, z. B. "1220" — nur die Postleitzahl, nie GPS.
   *
   * OPTIONAL seit Ians Entscheidung vom 2026-09-02: `null` heißt "kein Bezirk
   * angegeben", nicht "leer". Wer beim Posten das Feld leert, meint das auch —
   * für einen Spaziergang durch die halbe Stadt gibt es keine eine Zahl.
   *
   * Bewusst `string | null` und NICHT der leere String: Angezeigt wird der Bezirk
   * an sieben Stellen, immer als `{post.district} Wien`. Mit `''` staende dort
   * still " Wien" und kein Typecheck haette etwas dagegen. Mit `null` muss jede
   * Stelle den Fall anfassen — und tut es über `ortText()` aus `lib/bezirk.ts`.
   */
  district: string | null;
  startsAt: string; // ISO 8601
  level: SkillLevel;
  /**
   * Für wen die Aktivität gedacht ist. Phase 15, seit Phase 18b eine Jahrgangs-Spanne.
   *
   * PFLICHTFELD und nicht optional, obwohl `egal` die Voreinstellung ist: Ein
   * fehlendes Feld und ein bewusstes "egal" sähen im Code gleich aus, und der
   * Filter müsste beide Fälle erraten. Der Erstellen-Screen setzt es immer.
   */
  alter: PostAlter;
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

// ── Gruppen (Phase 17) ───────────────────────────────────────────────────────

/**
 * Eine Gruppe — Leopolds Wunsch vom 2026-09-02, Ians Entscheidung dazu in PLAN.md
 * Abschnitt 6, Punkte 16 und 17.
 *
 * ── Was eine Gruppe IST ───────────────────────────────────────────────────────
 * Eine **dritte Sichtbarkeits-Stufe**, kein zweiter Ort. Beim Posten wählt man
 * „Alle", „Nur meine Follower" oder „Nur Marswiese Tennis". Der Feed bleibt EIN
 * Feed; ein Gruppen-Post steht dort wie jeder andere, nur mit dem Gruppennamen an
 * der Karte. Warum kein eigener Tab je Gruppe: Er hätte den Hauptfeed geleert, und
 * ein leerer Hauptfeed ist am Anfang das größere Problem.
 *
 * ── Warum die Kategorie PFLICHT ist ───────────────────────────────────────────
 * Das ganze Design der App hängt an der Kategoriefarbe — jede Karte, jede Pille,
 * jeder Streifen. Eine Gruppe ohne Kategorie wäre das eine graue Ding darin, und
 * jede Anzeigestelle bräuchte einen Sonderfall für „keine Farbe".
 *
 * Das ist NICHT der Widerspruch zu harter Regel 29 („einem Direktchat nie eine
 * Ersatz-Kategorie geben"), sondern ihre andere Seite: Ein Direktchat HAT keine
 * Kategorie, man müsste eine erfinden. Eine Gruppe hat eine — der Gründer wählt sie
 * beim Anlegen aus, genau wie beim Posten. Erfunden wird nichts.
 */
export interface Group {
  id: string;
  name: string; // "Marswiese Tennis"
  /** Ein Satz, worum es geht. Steht auf der Gruppenseite unter dem Namen. */
  description: string;
  category: ActivityCategory;
  /**
   * Wer die Gruppe angelegt hat. Er bestätigt die Beitritte — dasselbe Muster wie
   * der Verfasser eines Posts bei „Bin dabei" (Ians Entscheidung, Punkt 17).
   *
   * Bewusst EIN Gründer und keine Liste von Verwaltern: Zwei Leute mit Rechten
   * heißt, dass die App erklären muss, wer wen ernennen darf und was passiert, wenn
   * sie sich uneinig sind. Für eine Tennisgruppe aus acht Leuten ist das mehr
   * Regelwerk als Nutzen. Kommt später ein Bedarf, ist es ein Feld mehr.
   */
  creatorId: string;
  /**
   * Alle Mitglieder — der Gründer IST darin enthalten und steht an erster Stelle.
   *
   * Warum er mitgezählt wird, obwohl er auch in `creatorId` steht: Sonst müsste
   * jede Stelle, die „ist X drin?" fragt, zwei Felder prüfen — und eine davon würde
   * irgendwo vergessen. Gefragt wird nur über `istMitglied()` aus
   * `features/groups/gruppe.ts`.
   *
   * Anders als eine Folge-Beziehung (harte Regel 8) steht eine Mitgliedschaft NUR
   * EINMAL im Modell, nämlich hier. Am Nutzer gibt es kein `groupIds`. Grund: Eine
   * Gruppe hat acht Mitglieder, ein Mensch ist in drei Gruppen — beide Listen sind
   * kurz, und zwei Wahrheiten wären nur zwei Gelegenheiten, auseinanderzulaufen.
   */
  memberIds: string[];
  /**
   * Findet man diese Gruppe von selbst — oder kommt man nur hinein, wenn jemand von
   * drinnen einen holt? Phase 18a, Ians Entscheidung 28 (Standard: `true`).
   *
   * ── Warum ein Boolean und KEIN Union ──────────────────────────────────────
   * Phase 17 hat gelernt: „Braucht eine neue Stufe zusätzliche Daten, ist es ein
   * Union" (`Visibility`). Die Betonung liegt auf BRAUCHT. Eine private Gruppe
   * trägt nichts mit sich, was eine offene nicht auch hat — kein Passwort, keine
   * Liste von Berechtigten, keinen Link. Ein Union wäre hier zwei Fälle mit
   * demselben Inhalt, also nur Zeremonie.
   *
   * ── Was `false` NICHT heißt ───────────────────────────────────────────────
   * Nicht „unsichtbar". Wer die Adresse hat, sieht Name, Kategorie, Bezirk und die
   * Mitgliederzahl — nur keine Posts, keine Mitgliederliste und keinen Weg hinein
   * (Ians Entscheidung 27). Die Regel dazu steht in `features/groups/gruppe.ts`
   * unter `PRIVAT_SICHT`, nicht in einem Screen.
   */
  offen: boolean;
  /** Wo die Gruppe hauptsächlich unterwegs ist. `null` heißt „ganz Wien". */
  district: string | null;
  createdAt: string;
}

/**
 * Eine Beitritts-Anfrage. Ians Entscheidung vom 2026-09-02 (Punkt 17): **auf
 * Anfrage, der Gründer bestätigt** — bewusst dasselbe Muster wie „Bin dabei".
 *
 * ── Warum ein eigener Typ und nicht `JoinRequest` mit optionalem `postId` ─────
 * Weil das genau die Falle aus Phase 16 wäre, nur andersherum. `JoinRequest.postId`
 * optional zu machen hätte den Typ WEITER gemacht — und der Compiler hätte zu
 * keiner der bestehenden Stellen etwas gesagt, die einen Post voraussetzen
 * (`useEingehendeAnfragen`, `anfrageBestaetigen`, der ganze Anfragen-Screen).
 * Sie hätten still `undefined` bekommen.
 *
 * Zwei Typen sind hier auch sachlich richtig: Eine Post-Anfrage belegt einen PLATZ
 * und öffnet einen CHAT, eine Gruppen-Anfrage tut beides nicht. Gleich ist nur das
 * Muster an der Oberfläche — und das ist Absicht, nicht Anlass, die Daten zu
 * verschmelzen.
 */
export interface GroupRequest {
  id: string;
  groupId: string;
  fromUserId: string;
  message: string;
  /** Dieselben drei Zustände wie bei einer Post-Anfrage, und dieselbe Bedeutung. */
  status: RequestStatus;
  createdAt: string;
}

/**
 * Eine Einladung in eine Gruppe — Phase 18a. Die Gegenrichtung zu `GroupRequest`.
 *
 * ── Warum Phase 18 überhaupt nötig war ────────────────────────────────────────
 * Phase 17 hat nur EINE Richtung gebaut: von außen anfragen, der Gründer bestätigt.
 * Leopold hat am 2026-09-03 als Erster die App wirklich BENUTZT statt angeschaut,
 * eine Gruppe gegründet — und sass allein darin. Es gab keinen Weg, jemanden
 * hineinzuholen. Zehn Minuten Benutzung haben gefunden, was ein ganzer Tag
 * Durchklicken nicht gefunden hat.
 *
 * ── Warum ein EIGENER Typ und nicht `GroupRequest` mit einem Richtungs-Feld ───
 * Das ist dieselbe Frage zum vierten Mal (`ChatThread.postId`, `GroupRequest`,
 * `Visibility`) und dieselbe Antwort. Ein Feld `richtung: 'rein' | 'raus'` hätte
 * jede bestehende Stelle still weiterlaufen lassen: `useEingehendeGruppenAnfragen`
 * hätte plötzlich auch Einladungen gefunden und sie dem Gründer zum Bestätigen
 * hingelegt — Unsinn, und der Compiler hätte geschwiegen.
 *
 * Sachlich sind es auch zwei Dinge. Eine Anfrage hat einen ABSENDER, der etwas
 * will, und eine `message`, die er geschrieben hat. Eine Einladung hat einen
 * EMPFÄNGER, der nichts wollte — deshalb steht hier `toUserId`, und deshalb steht
 * hier KEINE Nachricht: Wer einlädt, tippt in einer Liste seiner Follower auf
 * „Einladen". Ein Textfeld je Person wäre die Hürde, die genau das verhindert,
 * wofür die Einladung da ist.
 */
export interface GroupInvite {
  id: string;
  groupId: string;
  /** Wer eingeladen hat. Jedes Mitglied darf das — Ians Entscheidung 26. */
  fromUserId: string;
  /** Wer eingeladen wurde. Das Feld, das es bei `GroupRequest` nicht gibt. */
  toUserId: string;
  /** Dieselben drei Zustände. `accepted` heißt: drin. */
  status: RequestStatus;
  createdAt: string;
}

export interface User {
  id: string;
  handle: string; // "@ian"
  displayName: string;
  /**
   * KEIN Avatarfeld mehr.
   *
   * Bis Phase 14 stand hier `avatar: string` mit einem Emoji je Person. Das Feld ist
   * ersatzlos weg statt umbenannt: Der Avatar wird jetzt aus `displayName` gerechnet
   * (Initialen, siehe `components/ui/SsAvatar`) und aus `id` eingefärbt — es gibt
   * nichts mehr zu speichern.
   *
   * Phase 15 hat an dieselbe Stelle `photoUrl?` gesetzt — das Feld direkt darunter.
   * Es ist ein Feld, das wirklich Daten trägt, und die Initialen sind das, was ohne
   * Bild dasteht. Ein umbenanntes Emoji-Feld hätte nur Müll gehalten.
   */
  /**
   * Ein echtes Profilbild. OPTIONAL, und das ist im Prototyp der Normalfall:
   * Solange es keinen Upload gibt, hat niemand eines, und `SsAvatar` zeigt die
   * Initialen aus Phase 14.
   *
   * Warum das Feld trotzdem jetzt schon dasteht (PLAN.md, Phase 15): Es ist genau
   * die Naht, an der später der Upload andockt. Weil jede Avatar-Stelle der App
   * über `SsAvatar` geht und der Baustein das Feld bereits kennt, wird aus „Fotos
   * einbauen" später EINE Aufgabe — den Upload bauen — statt siebzehn Screens
   * anzufassen.
   *
   * In `data/mock.ts` steht bewusst KEINES: Harte Regel 12 — der Prototyp ist
   * öffentlich abrufbar, und ein Foto ist das Persönlichste, was ein Profil hat.
   */
  photoUrl?: string;
  bio: string;
  district: string;
  /**
   * In welchem Jahr diese Person geboren ist — Darias Frage aus dem Feedback vom
   * 2026-09-02 („Foto von der Person oder halt Altersgruppe"), seit Phase 18b als
   * Jahrgang statt als Band (Ians Entscheidung 17).
   *
   * Eine blanke `number`, und das ist der einzige Punkt, an dem dieser Umbau WENIGER
   * abgesichert ist als vorher: `AgeBand` war eine Whitelist, `2009` ist eine Zahl
   * wie jede andere. Der Compiler prüft nicht, ob sie plausibel ist — das tun
   * `JAHRGANG_MIN` und `JAHRGANG_MAX` in `config/alter.ts`, und zwar an der einen
   * Stelle, an der ein Mensch sie eingibt.
   *
   * Ein Pflichtfeld, wie das Band vorher: Ein Profil ohne Altersangabe beantwortet
   * die Frage nicht, für die es da ist.
   *
   * Was hier NICHT steht, ist ein Geburtsdatum — nur das Jahr. Die App prüft kein
   * Alter, sie zeigt nur, in welcher Gegend es liegt. **Am Profil steht der Jahrgang
   * offen** (Ians Entscheidung 30, `JAHRGANG_ANZEIGE`); daraus rechnet jeder Fremde
   * das Alter aus, und das hängt an der offenen DSGVO-Frage in PLAN.md, Abschnitt 8.
   */
  jahrgang: number;
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
  /**
   * Die Aktivität, an der dieser Chat hängt. OPTIONAL seit Phase 16 — fehlt er,
   * ist es ein DIREKTCHAT ohne Aktivität.
   *
   * Bis dahin war das Feld Pflicht, und das war keine Nachlässigkeit, sondern eine
   * Zusage: Es GAB keine Nachricht ohne Verabredung (`chat/logic.ts`, „ohne Zusage
   * kein Kanal"). Genau das hat Leopold am 2026-09-02 als Lücke gemeldet. Die Zusage
   * gilt weiter, sie hat nur eine zweite, engere Tür bekommen — wer schreiben darf,
   * steht in `features/chat/direkt.ts` und ist Ians Entscheidung.
   *
   * ⚠️ **Der Typecheck fängt diese Lockerung NICHT.** `posts.find(p => p.id ===
   * thread.postId)` bleibt mit `undefined` gültiger Code und gibt still `undefined`
   * zurück — dieselbe Falle wie bei `Post.district` am 2026-09-02. Die Enge ist
   * deshalb eine Ebene höher wieder aufgebaut: `ChatEintrag.post` in
   * `chat/hooks.ts` ist optional, und DORT zeigt `tsc` jede Stelle, die einen Post
   * voraussetzt. Gefragt wird nie mit `!thread.postId`, sondern mit
   * `istDirektChat()`.
   */
  postId?: string;
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
