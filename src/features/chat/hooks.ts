import { useMemo } from 'react';

import { getCurrentUserId, useCurrentUserId } from '../auth/hooks';
import { useCurrentUser, useUserMap } from '../social/hooks';
import { aendern, getState, neueId, useSlice } from '../store';

import { ENTSTEHUNG, darfSchreiben, istDirektChat } from './direkt';
import { chatZustand, type ChatZustand } from './lifecycle';
import { mitDirektChat } from './logic';
import { vergleicheChats } from './sort';

import type { ChatThread, Message, Post, User } from '@/types/models';

/**
 * Der Zugang zu Chats. Wie überall lesen Screens hier und nie aus `data/mock.ts`
 * (harte Regel 2 aus CLAUDE.md).
 *
 * ── Was ein Chat in dieser App ist ────────────────────────────────────────────
 * Bis Phase 15 kein Postfach, sondern das Anhängsel einer Verabredung: Er entstand
 * nicht dadurch, dass jemand jemanden anschreibt, sondern beim Bestätigen einer
 * Anfrage (`chat/logic.ts`) — ohne Zusage kein Kanal.
 *
 * Seit Phase 16 gibt es zwei Sorten, und der Unterschied zieht sich durch diese ganze
 * Datei:
 *
 *   AKTIVITÄTS-CHAT — hat einen Post. Läuft nach Ians Regel ab (`lifecycle.ts`),
 *                     zeigt in der Liste, worum es geht, und steht auch stumm ganz
 *                     oben: „ihr seid verabredet und keiner hat sich gemeldet".
 *   DIREKTCHAT      — hat keinen. Läuft nie ab, und stumm steht er NIRGENDS
 *                     (`ENTSTEHUNG`, siehe `useChatListe`).
 *
 * Deshalb ist `ChatEintrag.post` seit Phase 16 OPTIONAL. Das ist die eigentliche
 * Absicherung des ganzen Umbaus: Am Modell (`ChatThread.postId?`) hätte der
 * Typecheck nichts gesagt — `find(p => p.id === undefined)` ist gültiger Code. Hier
 * sagt er es, und zwar in jedem Screen, der einen Post voraussetzt.
 */

/** Ein Chat mit allem, was eine Zeile in der Liste zeigen muss. */
export interface ChatEintrag {
  thread: ChatThread;
  /**
   * Die Aktivität — FEHLT bei einem Direktchat (Phase 16).
   *
   * Bewusst optional und nicht mit einem Platzhalter-Post gefüllt: Ein erfundener
   * Post („Direktnachricht", Kategorie irgendwas) würde durch jede Karte, jede
   * Farbe und jeden Ablauf-Zeitpunkt der App wandern und dort still falsche
   * Antworten geben. Ein fehlendes Feld beantwortet nichts falsch — es zwingt jede
   * Stelle, den Fall anzusehen.
   */
  post?: Post;
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

/**
 * Aus einem Faden die andere Person heraussuchen.
 *
 * `ichId` kommt als Argument herein und wird nicht hier gelesen: Seit Phase 20.3
 * beantwortet die SITZUNG „wer bin ich", und ein Haken darf in einer gewöhnlichen
 * Funktion nicht gerufen werden. Wer sie hier hineinholt, macht aus einem Helfer
 * eine Stelle, die nur noch in React läuft.
 */
function gegenueberVon(
  thread: ChatThread,
  userMap: Map<string, User>,
  ichId: string,
): User | undefined {
  const id = thread.participantIds.find((teilnehmer) => teilnehmer !== ichId);
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
  const ichId = useCurrentUserId();
  const threads = useSlice('chatThreads');
  const messages = useSlice('messages');
  const posts = useSlice('posts');
  const userMap = useUserMap();

  return useMemo(() => {
    const jetzt = new Date();
    const letzte = letzteJeFaden(messages);
    const eintraege: ChatEintrag[] = [];

    for (const thread of threads) {
      if (!thread.participantIds.includes(ichId)) continue;

      const direkt = istDirektChat(thread);
      // Ein fehlender Post ist bei einem Direktchat der Normalfall — und bei einem
      // Aktivitäts-Chat seit Phase 20.4 KEIN kaputter Datensatz mehr, sondern eine
      // gelöschte Aktivität (`on delete set null`). Hier stand bis dahin ein
      // `continue`: Der Chat wäre aus der Liste verschwunden, weil eine DRITTE
      // Sache weg ist. Ians Entscheidung 42 sagt, was stattdessen dasteht.
      const post = direkt ? undefined : posts.find((p) => p.id === thread.postId);

      const gegenueber = gegenueberVon(thread, userMap, ichId);
      if (!gegenueber) continue;

      const zustand = chatZustand(post, jetzt);
      if (zustand === 'weg') continue;

      const letzteNachricht = letzte.get(thread.id);

      // `ENTSTEHUNG = 'beim-senden'` (siehe `chat/direkt.ts`): Ein Direktchat, in dem
      // noch nichts steht, taucht in KEINER Liste auf — auch nicht in meiner eigenen.
      // Der Faden liegt trotzdem schon im Speicher; er ist der Raum, in dem getippt
      // wird, und beim nächsten Mal wird derselbe wiederverwendet.
      //
      // Warum das nicht mit Ians Regel aus `sort.ts` kollidiert: Dort stehen die
      // stummen Chats ganz oben, weil ein stummer AKTIVITÄTS-Chat etwas bedeutet
      // („ihr seid verabredet, keiner hat sich gemeldet"). Ein stummer Direktchat
      // bedeutet nichts — er wäre eine Zeile über einer Absicht.
      if (direkt && !letzteNachricht && ENTSTEHUNG === 'beim-senden') continue;

      eintraege.push({ thread, post, gegenueber, letzte: letzteNachricht, zustand });
    }

    return eintraege.sort(vergleicheChats);
  }, [threads, messages, posts, userMap, ichId]);
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
  const ichId = useCurrentUserId();
  const threads = useSlice('chatThreads');
  const messages = useSlice('messages');
  const posts = useSlice('posts');
  const userMap = useUserMap();

  return useMemo(() => {
    const thread = threads.find((t) => t.id === threadId);
    // Nur Beteiligte. Im Prototyp gäbe es keinen Weg in einen fremden Chat, aber die
    // Adresse ist im Browser frei tippbar — und dieselbe Prüfung muss später ohnehin
    // in den Firestore-Regeln stehen.
    if (!thread || !thread.participantIds.includes(ichId)) return undefined;

    const direkt = istDirektChat(thread);
    // Siehe `useChatListe`: Ohne Post ist der Chat nicht kaputt, sondern verwaist.
    // Das `return undefined`, das hier stand, hätte ihn UNÖFFENBAR gemacht — man
    // hätte ihn in der Liste gesehen und wäre auf „Diesen Chat gibt es nicht" gelandet.
    const post = direkt ? undefined : posts.find((p) => p.id === thread.postId);

    const gegenueber = gegenueberVon(thread, userMap, ichId);
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
  }, [threads, messages, posts, userMap, threadId, ichId]);
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
  const ichId = useCurrentUserId();
  const threads = useSlice('chatThreads');
  if (!postId) return undefined;
  return threads.find(
    (t) =>
      t.postId === postId &&
      t.participantIds.includes(ichId) &&
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

  const ichId = getCurrentUserId();
  aendern((alt) => {
    const thread = alt.chatThreads.find((t) => t.id === threadId);
    if (!thread || !thread.participantIds.includes(ichId)) return {};

    const sentAt = new Date().toISOString();
    const neu: Message = {
      id: neueId('m'),
      threadId,
      senderId: ichId,
      text: inhalt,
      sentAt,
    };

    return {
      messages: [...alt.messages, neu],
      chatThreads: alt.chatThreads.map((t) => (t.id === threadId ? { ...t, lastMessageAt: sentAt } : t)),
    };
  });
}

// ── Direktnachrichten (Phase 16) ─────────────────────────────────────────────

/**
 * Darf ich dieser Person schreiben? Ians Regel steht in `chat/direkt.ts`.
 *
 * ── Warum `schonGetroffen` hier gerechnet wird, obwohl es niemand liest ───────
 * Unter der geltenden Regel (`'gegenseitig'`) wird der Wert nicht gebraucht. Er
 * kostet einen Durchlauf durch die Anfragen und steht trotzdem da, weil sonst ein
 * Wechsel auf `'schon-getroffen'` kein Wort wäre, sondern ein Umbau in zwei Dateien
 * — und dann würde die Möglichkeit im Kopf von `direkt.ts` stehen, ohne dass man sie
 * wirklich ausprobieren kann. Eine dokumentierte Alternative, die nicht läuft, ist
 * keine.
 *
 * „Getroffen" heißt: eine BESTÄTIGTE Anfrage in der einen oder anderen Richtung —
 * nicht, dass das Treffen schon vorbei ist. Wer zugesagt hat, hat den Kanal ohnehin.
 */
export function useDarfSchreiben(id: string | undefined): boolean {
  const ich = useCurrentUser();
  const users = useSlice('users');
  const posts = useSlice('posts');
  const anfragen = useSlice('joinRequests');

  return useMemo(() => {
    const andere = users.find((u) => u.id === id);
    if (!andere) return false;

    const meineIds = new Set(posts.filter((p) => p.authorId === ich.id).map((p) => p.id));
    const seineIds = new Set(posts.filter((p) => p.authorId === andere.id).map((p) => p.id));
    const schonGetroffen = anfragen.some(
      (a) =>
        a.status === 'accepted' &&
        ((a.fromUserId === andere.id && meineIds.has(a.postId)) ||
          (a.fromUserId === ich.id && seineIds.has(a.postId))),
    );

    return darfSchreiben(ich, andere, schonGetroffen);
  }, [ich, users, posts, anfragen, id]);
}

/**
 * Der Direktchat mit einer Person — falls es ihn schon gibt.
 *
 * Kein `useMemo` nötig, aus demselben Grund wie bei `useChatZuPost`: `find` gibt ein
 * Objekt AUS der Liste zurück.
 */
export function useDirektChat(id: string | undefined): ChatThread | undefined {
  const ichId = useCurrentUserId();
  const threads = useSlice('chatThreads');
  if (!id) return undefined;
  return threads.find(
    (t) => istDirektChat(t) && t.participantIds.includes(ichId) && t.participantIds.includes(id),
  );
}

/**
 * Einen Direktchat öffnen: anlegen, falls nötig, und die Faden-ID zurückgeben.
 *
 * Reine Aktion wie `folgen` oder `melden` — der Screen ruft sie im `onPress` und
 * navigiert mit dem Ergebnis weiter.
 *
 * ── Warum die Regel HIER geprüft wird und nicht im Screen ────────────────────
 * Der Knopf steht am Profil nur, wenn man schreiben darf — aber ein Knopf ist keine
 * Sperre. Auf Web ist jede Adresse tippbar, und später kommt vielleicht ein zweiter
 * Weg hierher (aus einer Follower-Liste etwa). Dieselbe Überlegung wie bei
 * `useChat`, das den Faden auf Beteiligung prüft, obwohl es im Prototyp keinen Weg
 * in einen fremden Chat gibt: Was die Firestore-Regeln später ohnehin prüfen müssen,
 * steht schon jetzt an der Stelle, an der es hingehört.
 *
 * `undefined` heißt „darf nicht" — der Screen navigiert dann einfach nicht.
 */
export function direktChatOeffnen(id: string): string | undefined {
  const ichId = getCurrentUserId();
  const vorher = getState();
  const ich = vorher.users.find((u) => u.id === ichId);
  const andere = vorher.users.find((u) => u.id === id);
  if (!ich || !andere) return undefined;

  const meineIds = new Set(vorher.posts.filter((p) => p.authorId === ich.id).map((p) => p.id));
  const seineIds = new Set(vorher.posts.filter((p) => p.authorId === andere.id).map((p) => p.id));
  const schonGetroffen = vorher.joinRequests.some(
    (a) =>
      a.status === 'accepted' &&
      ((a.fromUserId === andere.id && meineIds.has(a.postId)) ||
        (a.fromUserId === ich.id && seineIds.has(a.postId))),
  );
  if (!darfSchreiben(ich, andere, schonGetroffen)) return undefined;

  aendern((alt) => ({ chatThreads: mitDirektChat(alt.chatThreads, ichId, id) }));

  // Nach dem Ändern nachsehen: `mitDirektChat` gibt entweder den vorhandenen Faden
  // unverändert zurück oder legt einen an, und in beiden Fällen ist die gesuchte ID
  // danach die eine passende in der Liste. Sie aus `neueId()` vorherzusagen wäre die
  // Alternative — dann wüssten zwei Stellen, wie IDs entstehen.
  return getState().chatThreads.find(
    (t) => istDirektChat(t) && t.participantIds.includes(ichId) && t.participantIds.includes(id),
  )?.id;
}
