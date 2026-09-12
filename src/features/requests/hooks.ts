import { useMemo } from 'react';

import { getCurrentUserId, useCurrentUserId } from '../auth/hooks';
import { mitChatFuerTreffen } from '../chat/logic';
import { istBlockiert } from '../safety/hooks';
import { useUserMap } from '../social/hooks';
import { getState, neueId, schreibVorgang, useSlice } from '../store';
import * as senden from '@/data/senden';

import { kollidiert, zaehltAlsTermin, type Termin } from './kollision';
import { istDannVoll, postNachBestaetigung, uebrigeAnfragenBeiVollemPost } from './logic';

import type { JoinRequest, Post, User } from '@/types/models';

/**
 * "Bin dabei" — der Moment, in dem der Prototyp zum ersten Mal etwas VERÄNDERT.
 *
 * Wichtig fürs Verständnis der App: eine Anfrage füllt noch keinen Platz. Der
 * Verfasser bestätigt zuerst (PLAN.md, Abschnitt 1) — erst dann steigt `spotsFilled`
 * und der Chat geht auf. Beides steht seit Phase 4 weiter unten in dieser Datei
 * (`anfrageBestaetigen`); „Bin dabei" erzeugt hier oben nur den Wunsch.
 */

/** Meine Anfrage auf diesen Post — falls ich schon eine geschickt habe. */
export function useMeineAnfrage(postId: string | undefined): JoinRequest | undefined {
  const ichId = useCurrentUserId();
  const anfragen = useSlice('joinRequests');
  return anfragen.find((a) => a.postId === postId && a.fromUserId === ichId);
}

/**
 * Anfrage abschicken.
 *
 * Keine Funktion mit `use`-Namen, weil es kein Haken ist: sie liest nichts und zeichnet
 * nichts neu, sie ändert nur den Speicher. Die Screens, die davon betroffen sind,
 * erfahren es über ihre Haken von selbst.
 */
export function anfrageSenden(postId: string, message: string): Promise<void> {
  const ichId = getCurrentUserId();
  // Doppelt drücken darf keine zweite Anfrage erzeugen — auf Web ist ein Doppelklick
  // schnell passiert. Die Prüfung ist aus dem `aendern` herausgewandert und steht
  // jetzt DAVOR: Sonst liefe der Schreibvorgang trotzdem los und liefe in `23505`
  // (`unique (post_id, from_user_id)` in 0001) — ein Fehler für etwas, das in
  // Ordnung ist.
  if (getState().joinRequests.some((a) => a.postId === postId && a.fromUserId === ichId)) {
    return Promise.resolve();
  }

  return schreibVorgang('anfrageSenden', postId, (alt) => {
    // Phase 7: Steht ein Block dazwischen, entsteht keine Anfrage. Der Screen bietet
    // den Knopf gar nicht erst an — diese Prüfung ist das Netz darunter, für den Fall,
    // dass jemand den Post über einen direkten Link öffnet und der Screen ihn wegen
    // eines alten Renderzustands doch zeigt. Sicherheitsregeln gehören dorthin, wo die
    // Daten sich ändern, nicht dorthin, wo Knöpfe gezeichnet werden.
    const post = alt.posts.find((p) => p.id === postId);
    const ich = alt.users.find((u) => u.id === ichId);
    const verfasser = alt.users.find((u) => u.id === post?.authorId);
    if (ich && verfasser && istBlockiert(ich, verfasser)) return {};

    const neu: JoinRequest = {
      id: neueId('r'),
      postId,
      fromUserId: ichId,
      message: message.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    return { joinRequests: [...alt.joinRequests, neu] };
  }, (sb) => senden.anfrageSenden(sb, postId, message, ichId));
}

/** Anfrage zurückziehen, solange sie noch nicht bestätigt ist. */
export function anfrageZuruecknehmen(postId: string): Promise<void> {
  const ichId = getCurrentUserId();
  return schreibVorgang(
    'anfrageZuruecknehmen',
    postId,
    (alt) => ({
      joinRequests: alt.joinRequests.filter(
        (a) => !(a.postId === postId && a.fromUserId === ichId && a.status === 'pending'),
      ),
    }),
    (sb) => senden.anfrageZuruecknehmen(sb, postId, ichId),
  );
}

/**
 * Wie viele Leute gerade auf meine Bestätigung warten — die Zahl am Anfragen-Tab.
 *
 * Gezählt wird über den Umweg der Posts: eine Anfrage ist für MICH, wenn sie auf
 * einem Post liegt, den ich geschrieben habe. Im Datenmodell steht am `JoinRequest`
 * bewusst kein `toUserId` — der wäre eine zweite Wahrheit, die irgendwann von der
 * ersten abweicht, sobald ein Post den Besitzer wechselt oder gelöscht wird.
 */
export function useOffeneAnfragen(): JoinRequest[] {
  const ichId = useCurrentUserId();
  const anfragen = useSlice('joinRequests');
  const posts = useSlice('posts');
  const meinePostIds = new Set(
    posts.filter((p) => p.authorId === ichId).map((p) => p.id),
  );
  return anfragen.filter((a) => a.status === 'pending' && meinePostIds.has(a.postId));
}

// ── Phase 4: bestätigen und ablehnen ─────────────────────────────────────────

/** Eine Anfrage mit allem, was eine Zeile im Anfragen-Tab zeigen muss. */
export interface AnfrageEintrag {
  anfrage: JoinRequest;
  /** Bei eingehenden Anfragen: wer mitmachen will. Bei gesendeten: wem der Post gehört. */
  person: User;
  post: Post;
}

/** Alle Anfragen auf EINEN meiner Posts — im Screen eine Gruppe mit Überschrift. */
export interface AnfragenGruppe {
  post: Post;
  eintraege: AnfrageEintrag[];
}

/**
 * Die eingehenden Anfragen, gruppiert nach Post.
 *
 * ── Warum gruppiert und nicht eine flache Liste ───────────────────────────────
 * "Sara will mitmachen" ist ohne "wobei?" keine Information. Man könnte den
 * Post-Titel in jede Zeile schreiben, aber wenn drei Leute dasselbe Tennis anfragen,
 * steht er dreimal da und die Zeilen sehen aus wie drei verschiedene Sachen.
 * Die Überschrift sagt es einmal, darunter stehen die Menschen.
 *
 * Sortiert: der Post, dessen Termin am nächsten ist, steht oben — dort drängt die
 * Entscheidung am meisten. Innerhalb einer Gruppe die älteste Anfrage zuerst: wer
 * zuerst gefragt hat, steht zuerst da.
 */
export function useEingehendeAnfragen(): AnfragenGruppe[] {
  const ichId = useCurrentUserId();
  const anfragen = useSlice('joinRequests');
  const posts = useSlice('posts');
  const userMap = useUserMap();

  return useMemo(() => {
    const meine = posts.filter((p) => p.authorId === ichId);
    const ich = userMap.get(ichId);
    const gruppen: AnfragenGruppe[] = [];

    for (const post of meine) {
      const eintraege: AnfrageEintrag[] = [];
      for (const anfrage of anfragen) {
        if (anfrage.postId !== post.id || anfrage.status !== 'pending') continue;
        const person = userMap.get(anfrage.fromUserId);
        if (!person) continue;
        // Phase 7: Wer blockiert ist, taucht auch hier nicht mehr auf. `blockieren`
        // räumt offene Anfragen zwar auf, aber eine Blockierung kann auch NACH einer
        // Anfrage kommen, die inzwischen wieder offen ist — und dann stünde hier ein
        // Bestätigen-Knopf für jemanden, mit dem man nichts mehr zu tun haben will.
        if (ich && istBlockiert(ich, person)) continue;
        eintraege.push({ anfrage, person, post });
      }
      if (eintraege.length === 0) continue;
      eintraege.sort((a, b) => a.anfrage.createdAt.localeCompare(b.anfrage.createdAt));
      gruppen.push({ post, eintraege });
    }

    return gruppen.sort((a, b) => a.post.startsAt.localeCompare(b.post.startsAt));
  }, [anfragen, posts, userMap, ichId]);
}

/**
 * Was ICH angefragt habe — der zweite Blick auf denselben Tab.
 *
 * Stand nicht im Phasenplan, fehlte aber sofort: Nach "Bin dabei" gibt es keinen Ort,
 * an dem man nachschaut, worauf man eigentlich wartet. Man müsste sich erinnern,
 * welcher Post es war, und ihn im Feed wiederfinden.
 *
 * Das Neueste zuerst — dieselbe Regel wie im Feed (`posts/sort.ts`).
 */
export function useGesendeteAnfragen(): AnfrageEintrag[] {
  const ichId = useCurrentUserId();
  const anfragen = useSlice('joinRequests');
  const posts = useSlice('posts');
  const userMap = useUserMap();

  return useMemo(() => {
    const ich = userMap.get(ichId);
    const eintraege: AnfrageEintrag[] = [];
    for (const anfrage of anfragen) {
      if (anfrage.fromUserId !== ichId) continue;
      const post = posts.find((p) => p.id === anfrage.postId);
      if (!post) continue;
      const person = userMap.get(post.authorId);
      if (!person) continue;
      // Phase 7: Ohne das stünde nach einem Block der Post der blockierten Person mit
      // Name und Avatar weiter unter „Geschickt" — unter Ians Regel HART sogar mit der
      // Absage, die der Block selbst ausgelöst hat. Man würde sich ansehen, wie man
      // gerade abserviert wurde.
      if (ich && istBlockiert(ich, person)) continue;
      eintraege.push({ anfrage, person, post });
    }
    return eintraege.sort((a, b) => b.anfrage.createdAt.localeCompare(a.anfrage.createdAt));
  }, [anfragen, posts, userMap, ichId]);
}

/**
 * Bestätigen — der wichtigste Klick der App.
 *
 * Vier Dinge passieren gleichzeitig, und sie müssen zusammen passieren:
 *   1. Die Anfrage wird `accepted`.
 *   2. Der Post bekommt einen Platz weniger und schließt sich, wenn es der letzte war.
 *   3. Der Chat entsteht (`features/chat/logic.ts`).
 *   4. Wenn der Post dadurch voll ist: was mit den übrigen Anfragen passiert —
 *      das ist Ians offene Entscheidung in `logic.ts` (PLAN.md, Abschnitt 6.3).
 *
 * Alles in EINEM `aendern`: Der Speicher meldet seinen Zuhörern erst danach. Zwei
 * getrennte Aufrufe hätten dazwischen einen Zustand, in dem die Anfrage schon
 * bestätigt, der Platz aber noch frei ist — und React würde ihn zeichnen.
 */
export function anfrageBestaetigen(anfrageId: string): Promise<void> {
  const ichId = getCurrentUserId();
  // **Die teuerste der acht wartenden Aktionen.** Die zwei Netze hier unten sind
  // gegen zwei Klicks DERSELBEN Person richtig und gegen zwei gleichzeitige
  // Verbindungen wirkungslos — das ist gemessen (`30_wettlauf.sh`), nicht überlegt.
  // Mit Supabase entscheidet `anfrage_bestaetigen()` mit `select … for update`, und
  // genau deshalb darf der Bildschirm das Ergebnis nicht vorwegnehmen.
  return schreibVorgang('anfrageBestaetigen', anfrageId, (alt) => {
    const anfrage = alt.joinRequests.find((a) => a.id === anfrageId);
    if (!anfrage || anfrage.status !== 'pending') return {};

    const post = alt.posts.find((p) => p.id === anfrage.postId);
    if (!post) return {};

    // Zwei Sicherheitsnetze gegen den Doppelklick auf Web: nur der Verfasser
    // bestätigt, und nur solange wirklich ein Platz frei ist. Ohne das zweite käme
    // `spotsFilled` über `spotsTotal` — und "−1 Plätze frei" steht dann im Feed.
    if (post.authorId !== ichId) return {};
    if (post.spotsFilled >= post.spotsTotal) return {};

    const voll = istDannVoll(post);
    const neuerPost = postNachBestaetigung(post);

    let joinRequests = alt.joinRequests.map((a) =>
      a.id === anfrageId ? { ...a, status: 'accepted' as const } : a,
    );

    if (voll) {
      const uebrige = joinRequests.filter((a) => a.postId === post.id && a.status === 'pending');
      const behandelt = uebrigeAnfragenBeiVollemPost(uebrige, neuerPost);
      const nachId = new Map(behandelt.map((a) => [a.id, a]));
      joinRequests = joinRequests.map((a) => nachId.get(a.id) ?? a);
    }

    return {
      joinRequests,
      posts: alt.posts.map((p) => (p.id === post.id ? neuerPost : p)),
      chatThreads: mitChatFuerTreffen(alt.chatThreads, post.id, post.authorId, anfrage.fromUserId),
    };
  }, (sb) => senden.anfrageBestaetigen(sb, anfrageId));
}

/**
 * Ablehnen. Kein Platz wird berührt, kein Chat entsteht — die Anfrage ist erledigt.
 *
 * Bewusst ohne Rückfrage ("Wirklich ablehnen?"): Der Prototyp soll sich flüssig
 * anfühlen, und eine Absage ist nichts Unwiderrufliches — der andere kann erneut
 * anfragen, solange Plätze frei sind.
 */
export function anfrageAblehnen(anfrageId: string): Promise<void> {
  return schreibVorgang(
    'anfrageAblehnen',
    anfrageId,
    (alt) => ({
      joinRequests: alt.joinRequests.map((a) =>
        a.id === anfrageId && a.status === 'pending' ? { ...a, status: 'declined' as const } : a,
      ),
    }),
    (sb) => senden.anfrageAblehnen(sb, anfrageId),
  );
}

// ── Phase 18d: zwei Sachen gleichzeitig ──────────────────────────────────────

/**
 * Womit sich ein Termin um `startsAt` beißen würde — Leopolds Wunsch, Ians
 * Entscheidungen 31–33 (`requests/kollision.ts`).
 *
 * ── Warum der Haken die Regel NICHT enthält ───────────────────────────────────
 * Er sammelt nur, was in Frage kommt, und lässt `zaehltAlsTermin()` und
 * `kollidiert()` entscheiden. Dieselbe Trennung wie bei `filter.ts` und `sort.ts`:
 * Der Datenzugriff lebt hier, die Regel dort — sonst steht Ians Entscheidung in
 * einem Haken, den beim nächsten Umbau jemand umschreibt.
 *
 * `ausserPostId` ist der Post, um den es gerade geht. Ohne ihn meldet der Post
 * sich selbst als Kollision, sobald man ihn geschrieben hat.
 *
 * Sortiert nach Startzeit: Der Hinweis nennt den ERSTEN, und das soll der frühere
 * sein und nicht der, der zufällig oben im Speicher liegt.
 */
export function useKollisionen(
  startsAt: string | undefined,
  ausserPostId?: string,
): Termin[] {
  const ichId = useCurrentUserId();
  const posts = useSlice('posts');
  const anfragen = useSlice('joinRequests');

  return useMemo(() => {
    if (!startsAt) return [];

    const kandidaten: Termin[] = [];

    for (const post of posts) {
      if (post.id === ausserPostId) continue;
      // Ein vorbeigegangener Post ist keine Verabredung mehr. `past` setzt der
      // Verfasser selbst (`lifecycle.ts`) — die reine Uhrzeit reicht nicht, weil ein
      // Post nach Ians Regel bis Tagesende stehen bleibt.
      if (post.status === 'past') continue;

      if (post.authorId === ichId) {
        kandidaten.push({ post, rolle: 'gastgeber', jemandDabei: post.spotsFilled > 0 });
        continue;
      }

      // Nur BESTÄTIGTE Anfragen. Eine geschickte ist eine Frage, keine Zusage —
      // sonst warnt die App bei jedem, der sich mehrere Sachen offenhält.
      const zugesagt = anfragen.some(
        (a) =>
          a.postId === post.id && a.fromUserId === ichId && a.status === 'accepted',
      );
      if (zugesagt) kandidaten.push({ post, rolle: 'zugesagt', jemandDabei: true });
    }

    return kandidaten
      .filter((t) => zaehltAlsTermin(t) && kollidiert(startsAt, t.post.startsAt))
      .sort((a, b) => a.post.startsAt.localeCompare(b.post.startsAt));
  }, [posts, anfragen, startsAt, ausserPostId, ichId]);
}
