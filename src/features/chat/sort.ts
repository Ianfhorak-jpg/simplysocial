import type { ChatThread, Message } from '@/types/models';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS STEHT IN DER CHAT-LISTE GANZ OBEN?
 *  Entschieden von Ian am 2026-09-01: DIE NEUEN CHATS, IMMER.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Ians Satz: *„Die neuen Chats sollten immer ganz oben sein."*
 *
 * Das „immer" ist der eigentliche Inhalt der Entscheidung. Nach Zeit sortiert wäre ein
 * frisch bestätigtes Treffen zwar auch oben — aber nur, bis in einem alten Chat jemand
 * etwas schreibt. Dann rutscht es darunter, und ausgerechnet der eine Chat, in dem noch
 * NIE etwas gesagt wurde, verschwindet aus dem Blick.
 *
 * Genau der ist aber der wichtigste: Er bedeutet „ihr seid verabredet und keiner hat
 * sich gemeldet". Solange dort nichts steht, ist der Treffpunkt nicht ausgemacht.
 *
 * Es ist dieselbe Haltung wie bei seiner Feed-Regel (`posts/sort.ts`, das Neueste
 * zuerst): Was gerade entstanden ist, soll gesehen werden.
 *
 * ── Der Haken, den man kennen muss ────────────────────────────────────────────
 * Ein leerer Chat bleibt oben stehen, bis jemand hineinschreibt — auch wenn darunter
 * ein Gespräch läuft, das gerade wichtiger ist. Das ist keine Nebenwirkung, sondern die
 * Regel selbst. Sie räumt sich von allein wieder auf: Mit der ersten Nachricht ist der
 * Chat nicht mehr „neu" und ordnet sich normal ein.
 *
 * Falls sich das im Betrieb festfährt (fünf leere Chats, in die niemand schreibt), ist
 * die Verfeinerung eine Zeile — `frischeZuerst` weglassen und nur nach Bewegung
 * sortieren. Das wäre eine Abschwächung, keine Abkehr. **Nicht ohne Rückfrage.**
 */

/**
 * Was die Sortierung von einem Chat wissen muss.
 *
 * Bewusst nur diese zwei Felder und nicht `ChatEintrag` aus `hooks.ts`: Sonst müsste
 * `sort.ts` die Haken importieren und die Haken die Sortierung — ein Kreis. So kann
 * jeder, der einen Faden und dessen letzte Nachricht hat, hier vergleichen.
 */
export interface ChatSortEintrag {
  thread: ChatThread;
  letzte?: Message;
}

// ── Bausteine ────────────────────────────────────────────────────────────────
// Beide geben die Vergleichszahl zurück, die `Array.sort` erwartet:
//   negativ → a steht VOR b        0 → unentschieden        positiv → a steht NACH b

/**
 * Chats, in denen noch niemand geschrieben hat, nach oben — Ians Regel.
 *
 * „Neu" heißt hier NICHT „zuletzt angelegt", sondern „noch stumm". Das ist der
 * belastbarere Maßstab: Ein Chat von gestern, in dem nie jemand etwas gesagt hat,
 * braucht denselben Anstoß wie einer von vor fünf Minuten.
 */
export function frischeZuerst(a: ChatSortEintrag, b: ChatSortEintrag): number {
  return Number(!!a.letzte) - Number(!!b.letzte);
}

/** Der zuletzt bewegte Chat nach oben — die übliche Messenger-Reihenfolge. */
export function nachLetzterBewegung(a: ChatSortEintrag, b: ChatSortEintrag): number {
  return b.thread.lastMessageAt.localeCompare(a.thread.lastMessageAt);
}

/**
 * Die Reihenfolge der Chat-Liste — Ians Regel (siehe Kopf dieser Datei).
 *
 * Zuerst die stummen, darunter alles nach Bewegung. Innerhalb der stummen Gruppe
 * entscheidet ebenfalls die Zeit: Bei einem frischen Chat ist `lastMessageAt` der
 * Zeitpunkt der Zusage (`chat/logic.ts`), also steht die jüngste Verabredung oben.
 *
 * @returns negativ = a steht vor b · 0 = unentschieden · positiv = a steht nach b
 */
export function vergleicheChats(a: ChatSortEintrag, b: ChatSortEintrag): number {
  const frisch = frischeZuerst(a, b);
  if (frisch !== 0) return frisch;
  return nachLetzterBewegung(a, b);
}
