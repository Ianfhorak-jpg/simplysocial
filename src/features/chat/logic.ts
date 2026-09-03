import { neueId } from '../store';

import { istDirektChat } from './direkt';

import type { ChatThread } from '@/types/models';

/**
 * Woher Chats kommen.
 *
 * ── Bis Phase 15: aus genau einer Quelle ──────────────────────────────────────
 * Ein Chat entstand nie dadurch, dass jemand jemanden anschreibt, sondern genau dann,
 * wenn der Verfasser eine Anfrage bestätigt (CLAUDE.md: „Der Poster bestätigt, dann
 * öffnet sich der Chat"). Das war das Sicherheitsversprechen der App in einer Zeile
 * Code: ohne Zusage kein Kanal.
 *
 * ── Seit Phase 16: aus zwei ───────────────────────────────────────────────────
 * Leopold hat die Lücke gemeldet, Ian hat die zweite Tür entschieden, und sie ist
 * enger als die erste: Ein Direktchat entsteht nur zwischen Leuten, die einander
 * FOLGEN (`chat/direkt.ts`). Das Versprechen ist damit nicht weg — es heißt jetzt
 * „ohne Zusage oder gegenseitiges Folgen kein Kanal".
 *
 * Beide Wege enden in derselben Liste und in demselben Screen. Der einzige
 * Unterschied im Datenmodell ist ein fehlendes `postId`, und danach fragt man mit
 * `istDirektChat()` und nie von Hand.
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

/**
 * Den Direktchat mit einer Person anlegen — falls es ihn nicht schon gibt.
 *
 * Gibt die neue Liste zurück oder die unveränderte. Wie oben: nie die alte verändern,
 * `store.ts` erkennt Änderungen an der Referenz.
 *
 * ── Warum hier NICHT geprüft wird, ob man schreiben darf ──────────────────────
 * Diese Datei legt Fäden an; die Regel, WER einen anlegen darf, steht in
 * `chat/direkt.ts` und wird eine Ebene höher gefragt (`direktChatOeffnen` in
 * `hooks.ts`). Stünde sie an beiden Stellen, gäbe es zwei Wahrheiten — und die
 * zweite würde bei einer Regeländerung vergessen.
 *
 * ── Warum es je Personenpaar genau EINEN gibt ─────────────────────────────────
 * Anders als bei Aktivitäts-Chats, wo pro Post und Gast ein eigener Faden entsteht:
 * Ein Direktchat hängt an nichts als an den zwei Menschen. Ein zweiter daneben wäre
 * ein zweites Postfach mit derselben Person — genau das, was in der Chat-Liste als
 * Fehler aussieht.
 */
export function mitDirektChat(threads: ChatThread[], meineId: string, andereId: string): ChatThread[] {
  if (meineId === andereId) return threads;

  const schonDa = threads.some(
    (t) =>
      istDirektChat(t) && t.participantIds.includes(meineId) && t.participantIds.includes(andereId),
  );
  if (schonDa) return threads;

  const neu: ChatThread = {
    id: neueId('t'),
    // KEIN `postId: undefined` hingeschrieben: Das Feld ist optional, und ein
    // ausdrückliches `undefined` sähe im Firestore-Dokument später wie ein Feld mit
    // dem Wert `null` aus — also wie „Aktivität gelöscht" statt „nie eine gehabt".
    participantIds: [meineId, andereId],
    lastMessageAt: new Date().toISOString(),
  };
  return [...threads, neu];
}
