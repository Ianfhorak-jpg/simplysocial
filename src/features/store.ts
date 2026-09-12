import { useSyncExternalStore } from 'react';

import { ANMELDE_QUELLE, type Sitzung } from '@/features/auth/anmeldung';
import type { StandortStand } from '@/features/posts/standort';
import { allesLaden, LadeFehler } from '@/data/laden';
import { client, LIEST_AUS_SUPABASE } from '@/lib/supabase';

import {
  ATTRAPPE_ICH_ID,
  chatThreads as mockChats,
  groupInvites as mockGroupInvites,
  groupRequests as mockGroupRequests,
  groups as mockGroups,
  joinRequests as mockRequests,
  messages as mockMessages,
  posts as mockPosts,
  reports as mockReports,
  users as mockUsers,
} from '@/data/mock';
import type {
  ChatThread,
  Group,
  GroupInvite,
  GroupRequest,
  JoinRequest,
  Message,
  Post,
  Report,
  User,
} from '@/types/models';

/**
 * Der Zustand des Prototyps — die EINZIGE Datei, die `@/data/mock` importiert.
 *
 * ── Warum überhaupt ein Speicher? ─────────────────────────────────────────────
 * Bis Phase 1 hat die App nur angezeigt. Ab dem Feed drückt man "Bin dabei", und
 * diese Anfrage muss den Bildschirmwechsel überleben: Detail → zurück → wieder rein,
 * und sie ist immer noch da. Mit `useState` im Screen wäre sie beim Verlassen weg,
 * und der Prototyp würde sich kaputt anfühlen, obwohl nichts kaputt ist.
 *
 * ── Warum selbstgebaut und nicht Redux/Zustand? ───────────────────────────────
 * React bringt seit Version 18 `useSyncExternalStore` mit — genau für diesen Fall.
 * Das hier sind vierzig Zeilen ohne ein einziges zusätzliches Paket. Harte Regel 1
 * (nichts Natives, nichts, was die Web-Version gefährdet) gilt auch für Abhängigkeiten:
 * jedes Paket ist eins, das beim ersten iOS-Build Ärger machen kann.
 *
 * ── Die Naht zum Backend ──────────────────────────────────────────────────────
 * Später ersetzt Firestore (oder Supabase) das Innere dieser Datei. Die Hooks in
 * `features/<bereich>/hooks.ts` und damit alle Screens bleiben unverändert — sie
 * wissen nicht, woher die Daten kommen.
 */

export interface AppState {
  posts: Post[];
  users: User[];
  joinRequests: JoinRequest[];
  chatThreads: ChatThread[];
  messages: Message[];
  reports: Report[];
  /** Phase 17. Mitgliedschaften stehen IN der Gruppe, nicht am Nutzer. */
  groups: Group[];
  groupRequests: GroupRequest[];
  /**
   * Phase 18a. Die Gegenrichtung zu `groupRequests` — und eine EIGENE Liste, kein
   * Richtungsfeld in der bestehenden. Warum, steht am Typ in `types/models.ts`.
   */
  groupInvites: GroupInvite[];
  /**
   * Post-IDs, die ich im Wischstapel nach links geschoben habe (Phase 11).
   *
   * Die einzige Liste hier ohne Gegenstück in `mock.ts`, und das ist richtig so:
   * Weggewischtes ist nichts, was die Welt vorher schon wusste — es entsteht erst
   * beim Benutzen. Sie startet deshalb leer, und Neuladen bringt alle Karten zurück.
   * Das ist Ians Regel `'sitzung'` aus `posts/wisch.ts`, nicht eine Sparmaßnahme:
   * mit echtem Backend wird daraus eine Sammlung am Nutzer, und nur diese Datei
   * ändert sich.
   */
  weggewischt: string[];
  /**
   * Wo ich gerade bin — Phase 19h-2, und die einzige Angabe hier, die die App über
   * die WIRKLICHE Welt macht statt über ihre eigenen Daten.
   *
   * Sie steht aus demselben Grund hier wie `weggewischt` daneben: Sie entsteht erst
   * beim Benutzen, hat kein Gegenstück in `mock.ts`, und **Neuladen setzt sie
   * zurück**. Das ist bei `weggewischt` eine Regel (`'sitzung'` aus `posts/wisch.ts`)
   * und hier eine ZUSAGE — harte Regel 47, ausgeschrieben im Kopf von
   * `posts/standort.ts`: Der Standort wird nicht gespeichert.
   *
   * **Anders als bei `weggewischt` darf daraus mit dem Backend NICHTS werden.** Wo
   * dort später eine Sammlung am Nutzer entsteht, muss diese Zeile eine Zeile
   * bleiben. Wer sie in Phase 20.4 mit übernimmt, macht aus einer Reihenfolge eine
   * gespeicherte Ortsangabe.
   */
  standort: StandortStand;
  /**
   * Wer angemeldet ist — Phase 20.3, und der Nachfolger von `CURRENT_USER_ID`.
   *
   * Sie steht aus demselben Grund hier wie `weggewischt` und `standort` darüber: Sie
   * entsteht erst beim Benutzen und hat kein Gegenstück in `mock.ts`. Und sie liegt
   * IM Zustand und nicht in einem eigenen Speicher daneben, weil sie dann alles
   * mitbringt, was es hier schon gibt — `useSlice('sitzung')` zeichnet neu, wenn
   * jemand sich abmeldet, und `getState().sitzung` gilt für Aktionen. Ein zweiter
   * Mechanismus daneben hätte zwei Wahrheiten ergeben, die auseinanderlaufen können.
   *
   * **Gelesen wird sie über `features/auth/hooks.ts`, nie hier.** Dort steht auch,
   * warum der Zugang `string` liefert und nicht `string | null`.
   */
  sitzung: Sitzung;
  /**
   * Wie weit das Laden ist — Phase 20.4-b.
   *
   * Ein diskriminiertes Union und kein `boolean` daneben, aus demselben Grund wie
   * `Sitzung` und `Visibility`: Der Zustand „fertig geladen UND ein Fehler liegt an"
   * ist damit undarstellbar. Mit `laedt: boolean` plus `fehler: LadeFehler | null`
   * wäre er tippbar gewesen, und niemand hätte es gemerkt.
   *
   * Bei `mock` steht er vom ersten Augenblick an auf `'da'` — die Listen liegen ja
   * schon im Speicher. **Das ist der Grund, warum die öffentliche Adresse von 20.4-b
   * nichts merkt.**
   */
  laden: LadeStand;
}

/**
 * Die drei Lagen beim Laden.
 *
 * `'laeuft'` ist auch der ANFANG, nicht nur ein Zwischenschritt — deshalb steht in
 * den neun Listen zu dem Zeitpunkt nichts. Ein Screen, der währenddessen zeichnen
 * würde, sagte „Noch nichts los in deinem Feed", und das ist Ians Entscheidung 43
 * zufolge genau der Satz, der nicht dastehen darf. Wer hier etwas ändert, liest
 * zuerst `data/quelle.ts`.
 */
export type LadeStand =
  | { zustand: 'laeuft' }
  | { zustand: 'da' }
  | { zustand: 'fehler'; fehler: LadeFehler };

/**
 * Die neun Listen beim Start.
 *
 * Aus `mock.ts`, solange die App nicht aus Supabase liest — **und LEER, sobald sie
 * es tut.** Das ist keine Sparmaßnahme, sondern die Zusage aus `data/quelle.ts`:
 * Wenn die Daten aus der Datenbank kommen, darf keine einzige erfundene Person
 * dazwischen stehen. Ein Rückfall auf `mock.ts` wäre Möglichkeit C, und die ist
 * dort samt Grund verworfen.
 */
function startListen(): GeladeneListen {
  if (LIEST_AUS_SUPABASE) {
    return {
      posts: [],
      users: [],
      joinRequests: [],
      chatThreads: [],
      messages: [],
      reports: [],
      groups: [],
      groupRequests: [],
      groupInvites: [],
    };
  }
  return {
    posts: mockPosts,
    users: mockUsers,
    joinRequests: mockRequests,
    chatThreads: mockChats,
    messages: mockMessages,
    reports: mockReports,
    groups: mockGroups,
    groupRequests: mockGroupRequests,
    groupInvites: mockGroupInvites,
  };
}

/** Die neun Listen, die aus der Datenbank kommen — die fünf anderen Felder nicht. */
type GeladeneListen = Pick<
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

let state: AppState = {
  ...startListen(),
  weggewischt: [],
  standort: { zustand: 'aus', ort: null, gemessenUm: null },
  sitzung: startSitzung(),
  laden: LIEST_AUS_SUPABASE ? { zustand: 'laeuft' } : { zustand: 'da' },
};

/**
 * Womit die App startet.
 *
 * Solange `ANMELDE_QUELLE = 'attrappe'` gilt, ist der Prototyp beim Öffnen angemeldet
 * — genau wie an allen Tagen davor, als hier eine Konstante stand. **Das ist der
 * einzige Grund, warum die öffentliche Adresse von Phase 20.3 nichts merkt.** Steht
 * die Quelle auf `'supabase'`, beginnt die App ausgeloggt und der Torwächter in
 * `app/_layout.tsx` zeigt das Anmelden; die gespeicherte Sitzung kommt dann aus
 * `expo-secure-store` (Phase 20.3-b) und ersetzt diese Funktion.
 */
function startSitzung(): Sitzung {
  if (ANMELDE_QUELLE === 'attrappe') return attrappeSitzung();
  // **NICHT `'aus'`** — seit 20.3-b1 kann eine Sitzung gespeichert sein, und ob sie
  // noch gilt, weiß nur der Server. Diese Datei baut ihren Anfangszustand beim
  // LADEN auf, hier kann also nichts warten; aufgelöst wird er von
  // `sitzungWiederherstellen()` aus `features/auth/hooks.ts`.
  //
  // Stünde hier `'aus'`, sähe jeder mit gespeicherter Sitzung beim Öffnen für einen
  // Lidschlag den Anmelde-Bildschirm — und das ist derselbe Fehler wie neun leere
  // Listen mit `laden.zustand === 'da'`: „ist nichts" und „kommt noch" dürfen nicht
  // gleich aussehen.
  return { zustand: 'unbekannt' };
}

/**
 * Die Sitzung der Attrappe — der einzige Weg, wie der Seed-Nutzer aus `mock.ts` in
 * die App kommt.
 *
 * **Sie gibt eine `Sitzung` heraus und keine ID**, und das ist der ganze Punkt: Eine
 * exportierte ID wäre `CURRENT_USER_ID` unter neuem Namen, und die nächste Sitzung
 * würde sie irgendwo als „der aktuelle Nutzer" lesen. Ein `Sitzung`-Objekt kann man
 * nur an eine Stelle geben — dorthin, wo Sitzungen hingehören.
 *
 * Sie steht hier und nicht in `features/auth/`, weil diese Datei die EINZIGE ist, die
 * `@/data/mock` importieren darf (Kopf oben, harte Regel 2).
 */
export function attrappeSitzung(): Sitzung {
  return { zustand: 'an', ichId: ATTRAPPE_ICH_ID };
}

const zuhoerer = new Set<() => void>();

function abonnieren(melden: () => void): () => void {
  zuhoerer.add(melden);
  return () => {
    zuhoerer.delete(melden);
  };
}

/**
 * Zustand ändern. Immer eine NEUE Liste zurückgeben, nie die alte verändern —
 * React erkennt Änderungen am Vergleich der Referenz (`===`), nicht am Inhalt.
 * Ein `posts.push(...)` wäre für React unsichtbar und der Feed bliebe stehen.
 */
export function aendern(naechster: (alt: AppState) => Partial<AppState>): void {
  state = { ...state, ...naechster(state) };
  zuhoerer.forEach((melden) => melden());
}

/**
 * Eine Liste aus dem Zustand lesen und bei Änderungen neu zeichnen.
 *
 * ── Die Falle, die hier vermieden wird ────────────────────────────────────────
 * `useSyncExternalStore` ruft die Lesefunktion bei JEDEM Rendern auf und vergleicht
 * das Ergebnis mit `===`. Gäbe man ihm etwas Gerechnetes — `posts.filter(...)` —,
 * käme jedes Mal ein neues Array heraus, React hielte das für eine Änderung und
 * würde sofort wieder rendern: Endlosschleife.
 *
 * Deshalb liefert dieser Haken NUR die rohen Listen, deren Referenz sich genau dann
 * ändert, wenn wirklich etwas passiert ist. Gefiltert und sortiert wird eine Ebene
 * höher, in `useMemo`.
 */
export function useSlice<K extends keyof AppState>(key: K): AppState[K] {
  const lesen = () => state[key];
  return useSyncExternalStore(abonnieren, lesen, lesen);
}

/** Für Logik außerhalb von React (z. B. in Aktionen). */
export function getState(): AppState {
  return state;
}

/** Fortlaufende IDs für neu Erzeugtes. Im Backend macht das später die Datenbank. */
let zaehler = 0;
export function neueId(praefix: string): string {
  zaehler += 1;
  return `${praefix}_neu${zaehler}`;
}

// ═════════════════════════════════════════════════════════════════════════════
//  Das Laden — Phase 20.4-b
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Läuft gerade ein Ladevorgang? **Ein Wächter und kein Bequemlichkeitsfeld.**
 *
 * Ohne ihn startet jeder Aufruf von `datenHolen()` dreizehn neue Abfragen. Der
 * Torwächter in `app/_layout.tsx` zeichnet bei JEDER Zustandsänderung neu, und ein
 * Effekt, der beim Zeichnen lädt, lädt dann in einer Schleife — der Feed sähe
 * richtig aus und die Leitung liefe heiß. Er steht als Modulvariable und nicht in
 * `AppState`, weil ein `aendern()` darauf jedes Mal alle Screens neu zeichnen
 * würde, für eine Auskunft, die keinen Screen betrifft.
 */
let holtGerade = false;

/**
 * Alles holen und in den Speicher legen.
 *
 * ── Wann sie gerufen wird ────────────────────────────────────────────────────
 * Aus `app/_layout.tsx`, sobald jemand angemeldet ist — und **nur dann**. Vorher
 * hat es keinen Sinn: Ohne Token lassen die 33 Policies null Zeilen durch, und
 * das Ergebnis wäre nicht „leer", sondern „leer und nicht zu unterscheiden von
 * kaputt" (siehe `data/quelle.ts`).
 *
 * ── Warum sie nichts wirft ───────────────────────────────────────────────────
 * Der Fehler wird zu einem ZUSTAND (`laden.zustand === 'fehler'`), weil ein
 * geworfener Fehler in einem Effekt an genau einer Stelle ankommt: in der Konsole.
 * Ians Entscheidung 43 verlangt aber, dass er auf dem BILDSCHIRM ankommt.
 */
export async function datenHolen(): Promise<void> {
  if (!LIEST_AUS_SUPABASE || holtGerade) return;
  holtGerade = true;
  aendern(() => ({ laden: { zustand: 'laeuft' } }));
  try {
    const daten = await allesLaden(client());
    aendern(() => ({ ...daten, laden: { zustand: 'da' } }));
  } catch (fehler) {
    // Ein `LadeFehler` trägt Tabelle und `code` und ist damit beantwortbar (siehe
    // `ladeFehlerFolgen()`). Alles andere — ein fehlender Zugang, ein Tippfehler in
    // einer Übersetzung — ist ein PROGRAMMfehler und soll laut sein, nicht als
    // „Keine Verbindung" verkleidet werden. Das ist dieselbe Unterscheidung wie bei
    // `ZeilenFehler` in `zeilen.ts`.
    if (!(fehler instanceof LadeFehler)) {
      holtGerade = false;
      throw fehler;
    }
    console.warn(fehler.message);
    aendern(() => ({ laden: { zustand: 'fehler', fehler } }));
  } finally {
    holtGerade = false;
  }
}

/**
 * Den Zwischenspeicher leeren — beim Abmelden, und **das ist kein Aufräumen.**
 *
 * Heute wäre es folgenlos: `mock.ts` ist für alle dieselbe erfundene Welt. Mit
 * echten Daten liegen nach dem Abmelden fremde Chats, fremde Anfragen und fremde
 * Meldungen im Speicher — und wer sich als Nächstes anmeldet, sieht sie, bis das
 * neue Laden durch ist. **Ein Fehler, der wie ein Flackern aussieht und keiner
 * ist.** Dieselbe Begründung, mit der `abmelden()` seit 20.3-a schon `weggewischt`
 * und `standort` mitnimmt, nur mit dem Unterschied, dass es hier fremde Daten sind
 * und nicht eigene.
 *
 * Auf `'laeuft'` und nicht auf `'da'`: Wer abgemeldet ist, hat nichts geladen. Ein
 * `'da'` mit neun leeren Listen ist die Lüge aus Entscheidung 43 in ihrer reinsten
 * Form.
 */
export function zwischenspeicherLeeren(): void {
  if (!LIEST_AUS_SUPABASE) return;
  aendern(() => ({ ...startListen(), laden: { zustand: 'laeuft' } }));
}
