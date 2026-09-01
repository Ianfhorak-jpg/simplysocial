import { useMemo } from 'react';

import { useUserMap } from '../social/hooks';
import { CURRENT_USER_ID, aendern, neueId, useSlice } from '../store';

import { chatZustand, type ChatZustand } from './lifecycle';
import { vergleicheChats } from './sort';

import type { ChatThread, Message, Post, User } from '@/types/models';

/**
 * Der Zugang zu Chats. Wie überall lesen Screens hier und nie aus `data/mock.ts`
 * (harte Regel 2 aus CLAUDE.md).
 *
 * ── Was ein Chat in dieser App ist ────────────────────────────────────────────
 * Kein Postfach, sondern das Anhängsel einer Verabredung. Er entsteht nicht dadurch,
 * dass jemand jemanden anschreibt, sondern beim Bestätigen einer Anfrage
 * (`chat/logic.ts`) — ohne Zusage kein Kanal. Deshalb liefert jeder Haken hier den
 * Post gleich mit: Ein Chat ohne sein Treffen wäre in dieser App eine Nachricht von
 * einem Fremden, und das ist genau das, was die App nicht sein soll.
 */

/** Ein Chat mit allem, was eine Zeile in der Liste zeigen muss. */
export interface ChatEintrag {
  thread: ChatThread;
  post: Post;
  /** Die andere Person. Im Prototyp sind Chats immer zu zweit (`chat/logic.ts`). */
  gegenueber: User;
  /** Die letzte Nachricht. Fehlt bei einem frisch bestätigten Treffen — dort hat
   *  noch niemand geschrieben, und der Screen sagt das auch so. */
  letzte?: Message;
  /** Aktiv, vorbei oder weg — Ians offene Entscheidung in `chat/lifecycle.ts`. */
  zustand: ChatZustand;
}

/** Ein Chat samt seinem Verlauf — für `chat/[id]`. */
export interface ChatVerlauf {
  eintrag: ChatEintrag;
  /** Älteste zuerst, so wie man einen Verlauf liest. */
  nachrichten: Message[];
}

/**
 * Die letzte Nachricht je Faden, in EINEM Durchlauf.
 *
 * Der naheliegende Weg wäre, pro Chat einmal durch alle Nachrichten zu filtern. Bei
 * zwei Chats ist das egal; bei fünfzig Chats und tausend Nachrichten sind es fünfzig
 * Durchläufe für dieselbe Information. Eine Nachschlagetabelle kostet einen.
 *
 * Verglichen wird auf den ISO-Strings: die sind alle in derselben Form und in UTC
 * (`toISOString`), da ist die alphabetische Reihenfolge die zeitliche.
 *
 * ── Warum `>=` und nicht `>` ──────────────────────────────────────────────────
 * Zwei Nachrichten können denselben Zeitstempel tragen. `Date.now()` löst in
 * Millisekunden auf, und zwei Zeilen Code laufen ohne Weiteres in derselben — in
 * `data/mock.ts` ist genau das passiert: die letzten zwei Nachrichten von Chat t2
 * sind auf die Millisekunde gleich alt. Mit `>` gewinnt dann die ZUERST gefundene,
 * und die Liste zeigte Tobis Frage statt der Antwort darauf.
 *
 * `>=` lässt bei Gleichstand die spätere Position gewinnen. Das ist hier die
 * richtige Wahrheit, weil Nachrichten nur hinten angehängt werden (`nachrichtSenden`)
 * — wer weiter hinten steht, kam später.
 */
function letzteJeFaden(messages: Message[]): Map<string, Message> {
  const map = new Map<string, Message>();
  for (const m of messages) {
    const bisher = map.get(m.threadId);
    if (!bisher || m.sentAt >= bisher.sentAt) map.set(m.threadId, m);
  }
  return map;
}

/** Aus einem Faden die andere Person heraussuchen. */
function gegenueberVon(thread: ChatThread, userMap: Map<string, User>): User | undefined {
  const id = thread.participantIds.find((teilnehmer) => teilnehmer !== CURRENT_USER_ID);
  return id ? userMap.get(id) : undefined;
}

/**
 * Meine Chats. Die Reihenfolge ist Ians Regel und steht in `chat/sort.ts`:
 * die stummen zuerst, darunter der zuletzt bewegte.
 *
 * ── Warum `lastMessageAt` am Faden und nicht die Zeit der letzten Nachricht ───
 * Es sieht nach derselben Information aus, ist aber eine andere: Ein frisch
 * bestätigtes Treffen hat noch keine Nachricht, aber sehr wohl einen Zeitpunkt. Ohne
 * `lastMessageAt` hätte so ein Chat gar keine Zeit, nach der man ihn einordnen könnte.
 * Im Backend ist es außerdem das Feld, auf dem der Index liegt; "letzte Nachricht
 * suchen und danach sortieren" wäre dort eine teure Abfrage.
 */
export function useChatListe(): ChatEintrag[] {
  const threads = useSlice('chatThreads');
  const messages = useSlice('messages');
  const posts = useSlice('posts');
  const userMap = useUserMap();

  return useMemo(() => {
    const jetzt = new Date();
    const letzte = letzteJeFaden(messages);
    const eintraege: ChatEintrag[] = [];

    for (const thread of threads) {
      if (!thread.participantIds.includes(CURRENT_USER_ID)) continue;

      const post = posts.find((p) => p.id === thread.postId);
      if (!post) continue;
      const gegenueber = gegenueberVon(thread, userMap);
      if (!gegenueber) continue;

      const zustand = chatZustand(post, jetzt);
      if (zustand === 'weg') continue;

      eintraege.push({ thread, post, gegenueber, letzte: letzte.get(thread.id), zustand });
    }

    return eintraege.sort(vergleicheChats);
  }, [threads, messages, posts, userMap]);
}

/**
 * Ein Chat mit seinem ganzen Verlauf.
 *
 * Filtert bewusst NICHT nach `zustand`: Was in der Liste steht, entscheidet
 * `useChatListe`. Wer schon im Chat drin ist oder einen Link darauf hat, soll ihn
 * lesen können — der Screen sagt oben dazu, wenn das Treffen durch ist. Ein Chat,
 * der sich beim Öffnen weigert, sähe kaputt aus statt aufgeräumt.
 */
export function useChat(threadId: string | undefined): ChatVerlauf | undefined {
  const threads = useSlice('chatThreads');
  const messages = useSlice('messages');
  const posts = useSlice('posts');
  const userMap = useUserMap();

  return useMemo(() => {
    const thread = threads.find((t) => t.id === threadId);
    // Nur Beteiligte. Im Prototyp gäbe es keinen Weg in einen fremden Chat, aber die
    // Adresse ist im Browser frei tippbar — und dieselbe Prüfung muss später ohnehin
    // in den Firestore-Regeln stehen.
    if (!thread || !thread.participantIds.includes(CURRENT_USER_ID)) return undefined;

    const post = posts.find((p) => p.id === thread.postId);
    if (!post) return undefined;
    const gegenueber = gegenueberVon(thread, userMap);
    if (!gegenueber) return undefined;

    const nachrichten = messages
      .filter((m) => m.threadId === thread.id)
      .sort((a, b) => a.sentAt.localeCompare(b.sentAt));

    return {
      eintrag: {
        thread,
        post,
        gegenueber,
        letzte: nachrichten[nachrichten.length - 1],
        zustand: chatZustand(post, new Date()),
      },
      nachrichten,
    };
  }, [threads, messages, posts, userMap, threadId]);
}

/**
 * Der Chat zu einem Treffen — der Weg vom Match-Screen und vom Post-Detail hinein.
 *
 * `gastId` nur angeben, wenn man weiß, um WEN es geht: Bei einem Post mit drei
 * Plätzen hängen drei Fäden am selben Post (siehe `chat/logic.ts`). Aus dem Detail
 * heraus ist man selbst der Gast und es gibt genau einen; vom Match-Screen aus ist
 * man der Verfasser und muss sagen, wer gemeint ist.
 *
 * Kein `useMemo` nötig: `find` gibt ein Objekt AUS der Liste zurück, dessen Referenz
 * sich nur ändert, wenn sich der Faden wirklich ändert.
 */
export function useChatZuPost(postId: string | undefined, gastId?: string): ChatThread | undefined {
  const threads = useSlice('chatThreads');
  if (!postId) return undefined;
  return threads.find(
    (t) =>
      t.postId === postId &&
      t.participantIds.includes(CURRENT_USER_ID) &&
      (gastId === undefined || t.participantIds.includes(gastId)),
  );
}

/**
 * Eine Nachricht abschicken.
 *
 * Zwei Listen ändern sich, und sie ändern sich in EINEM `aendern` (harte Regel 9):
 * die Nachricht selbst und `lastMessageAt` am Faden. Getrennt aufgerufen gäbe es
 * dazwischen einen Moment, in dem die Nachricht schon im Verlauf steht, die Liste
 * den Chat aber noch nicht nach oben sortiert hat — und React zeichnet ihn.
 *
 * Leere Nachrichten fallen still weg. Der Senden-Knopf ist dann ohnehin deaktiviert;
 * das hier ist das Netz darunter, weil der Knopf nicht der einzige Weg bleiben muss
 * (Enter-Taste, später eine Tastatur-Aktion auf iOS).
 */
export function nachrichtSenden(threadId: string, text: string): void {
  const inhalt = text.trim();
  if (!inhalt) return;

  aendern((alt) => {
    const thread = alt.chatThreads.find((t) => t.id === threadId);
    if (!thread || !thread.participantIds.includes(CURRENT_USER_ID)) return {};

    const sentAt = new Date().toISOString();
    const neu: Message = {
      id: neueId('m'),
      threadId,
      senderId: CURRENT_USER_ID,
      text: inhalt,
      sentAt,
    };

    return {
      messages: [...alt.messages, neu],
      chatThreads: alt.chatThreads.map((t) => (t.id === threadId ? { ...t, lastMessageAt: sentAt } : t)),
    };
  });
}
