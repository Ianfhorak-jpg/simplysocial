import { neueId } from '../store';

import type { ChatThread } from '@/types/models';

/**
 * Woher Chats kommen.
 *
 * Ein Chat entsteht in dieser App nie dadurch, dass jemand jemanden anschreibt. Er
 * entsteht genau dann, wenn der Verfasser eine Anfrage bestätigt (CLAUDE.md: „Der
 * Poster bestätigt, dann öffnet sich der Chat"). Das ist das Sicherheitsversprechen
 * der App in einer Zeile Code: ohne Zusage kein Kanal.
 *
 * Deshalb liegt das hier und nicht in `requests/hooks.ts` — Phase 5 baut die Chats
 * und findet an dieser Stelle, wo ihre Daten herkommen.
 */

/**
 * Den Chat zu einem bestätigten Treffen anlegen — falls es ihn nicht schon gibt.
 *
 * Gibt die neue Liste zurück oder die unveränderte, wenn nichts zu tun war. Nie die
 * alte verändern: `store.ts` erkennt Änderungen an der Referenz.
 */
export function mitChatFuerTreffen(
  threads: ChatThread[],
  postId: string,
  posterId: string,
  gastId: string,
): ChatThread[] {
  // Ein Post, ein Gast, ein Chat. Sagt jemand ab und fragt später erneut an, soll der
  // alte Verlauf zurückkommen und nicht ein zweiter leerer Faden danebenstehen.
  const schonDa = threads.some((t) => t.postId === postId && t.participantIds.includes(gastId));
  if (schonDa) return threads;

  const neu: ChatThread = {
    id: neueId('t'),
    postId,
    // Im Prototyp immer zu zweit. Bei mehreren Plätzen entsteht pro Zusage ein
    // eigener Faden — ein Gruppenchat mit Leuten, die einander nicht kennen, wäre
    // eine andere App. (Falls das später anders soll: hier ist die eine Stelle.)
    participantIds: [posterId, gastId],
    lastMessageAt: new Date().toISOString(),
  };
  return [...threads, neu];
}
