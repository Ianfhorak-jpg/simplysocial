import { useSyncExternalStore } from 'react';

import {
  CURRENT_USER_ID,
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

export { CURRENT_USER_ID };

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
}

let state: AppState = {
  posts: mockPosts,
  users: mockUsers,
  joinRequests: mockRequests,
  chatThreads: mockChats,
  messages: mockMessages,
  reports: mockReports,
  groups: mockGroups,
  groupRequests: mockGroupRequests,
  groupInvites: mockGroupInvites,
  weggewischt: [],
};

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
