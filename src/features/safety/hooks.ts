import { useMemo } from 'react';

import { CURRENT_USER_ID, aendern, neueId, useSlice } from '../store';

import { BLOCK_WIRKUNG } from './block';

import type { Report, ReportReason, ReportTarget, User } from '@/types/models';

/**
 * Melden und Blockieren — die zwei Dinge, ohne die Apple die App nach Guideline 1.2
 * nicht durchlässt (CLAUDE.md, letzter Abschnitt).
 *
 * ── Was im Prototyp WIRKLICH passiert ────────────────────────────────────────
 * Blockieren wirkt echt: Die Person verschwindet aus dem Feed, Anfragen gehen nicht
 * mehr, der Chat reagiert. Das ist bewusst nicht nur Oberfläche — an einer Sperre,
 * die man ausprobieren kann, sieht man sofort, ob sie sich richtig anfühlt. Genau
 * das ist die Frage, die Ian in `block.ts` beantworten soll.
 *
 * Melden wirkt NICHT, und das kann es auch nicht: Eine Meldung braucht jemanden,
 * der sie liest. Im Prototyp wird sie gespeichert (`state.reports`) und der Screen
 * merkt sich, dass man gemeldet hat — mehr geht ohne Backend nicht, und mehr zu
 * behaupten wäre gelogen.
 */

// ── Blockieren ───────────────────────────────────────────────────────────────

/**
 * Steht zwischen diesen beiden ein Block — egal, wer ihn gesetzt hat?
 *
 * Eine reine Funktion und kein Haken, weil `posts/hooks.ts` sie mitten in einer
 * Schleife braucht. Sie bekommt die zwei Nutzer fertig herein: Feed und Profil haben
 * beide ohnehin in der Hand, und ein Nachschlagen je Post wäre ein Durchlauf durch
 * die Nutzerliste pro Karte.
 *
 * ── Warum beide Richtungen, obwohl der Block nur einmal gespeichert ist ───────
 * `blockedIds` steht nur beim Blockierenden (Begründung am Feld in `models.ts`).
 * Die WIRKUNG muss trotzdem symmetrisch sein: Wenn Lea mich blockiert, darf ich
 * ihre Posts genauso wenig sehen, wie sie meine sieht — sonst hätte Blockieren für
 * denjenigen, der sich schützen will, gar keinen Effekt auf das, was der andere
 * von ihm mitbekommt. Gespeichert einseitig, gelesen zweiseitig.
 */
export function istBlockiert(a: User, b: User): boolean {
  if (a.id === b.id) return false;
  return a.blockedIds.includes(b.id) || b.blockedIds.includes(a.id);
}

/** Steht zwischen mir und dieser Person ein Block? Für Screens. */
export function useIstBlockiert(id: string | undefined): boolean {
  const users = useSlice('users');
  const ich = users.find((u) => u.id === CURRENT_USER_ID);
  const andere = users.find((u) => u.id === id);
  return Boolean(ich && andere && istBlockiert(ich, andere));
}

/**
 * Habe ICH blockiert — oder wurde ich blockiert?
 *
 * Der Unterschied zählt an genau einer Stelle: dem Knopf. Nur was ich selbst gesetzt
 * habe, kann ich wieder aufheben. Wäre der Knopf auch dann „Blockierung aufheben",
 * wenn der andere mich blockiert hat, würde die App verraten, dass er es getan hat —
 * und das ist das Einzige, was ein Block auf keinen Fall tun darf.
 */
export function useHabeIchBlockiert(id: string | undefined): boolean {
  const users = useSlice('users');
  const ich = users.find((u) => u.id === CURRENT_USER_ID);
  return Boolean(id && ich?.blockedIds.includes(id));
}

/** Alle, die ich blockiert habe — die Liste in den Einstellungen. */
export function useBlockierte(): User[] {
  const users = useSlice('users');
  return useMemo(() => {
    const ich = users.find((u) => u.id === CURRENT_USER_ID);
    if (!ich) return [];
    const nachId = new Map(users.map((u) => [u.id, u]));
    return [...ich.blockedIds].reverse().flatMap((id) => {
      const u = nachId.get(id);
      return u ? [u] : [];
    });
  }, [users]);
}

/**
 * Jemanden blockieren.
 *
 * ── Alles in EINEM `aendern` (harte Regel 9) ─────────────────────────────────
 * Ein Block fasst je nach Ians Regel bis zu fünf Listen gleichzeitig an. Zwei
 * getrennte Aufrufe hätten dazwischen einen Zustand, in dem die Person schon
 * blockiert ist, der Chat aber noch offen steht — und React zeichnet ihn.
 *
 * Drei Wirkungen sind bei allen drei Möglichkeiten aus `block.ts` gleich und stehen
 * deshalb fest:
 *
 *   1. Der Block selbst.
 *   2. Die Folge-Beziehung fällt in BEIDE Richtungen weg. Sonst bliebe die Person
 *      unter „Follower" stehen und dürfte über `darfIchSehen` weiter meine
 *      Follower-Posts sehen — ein Block, der die Person weiter hereinlässt, ist
 *      keiner. Das ist überall so und keine Entscheidung, die Ian treffen muss.
 *   3. Offene Anfragen zwischen uns verschwinden. „Anfragen sind nicht mehr möglich"
 *      muss auch für die gelten, die schon unterwegs sind — sonst könnte man eine
 *      Anfrage bestätigen, die man gar nicht mehr bekommen dürfte.
 *      Entfernt und nicht abgelehnt: Eine Absage ist etwas, das der andere SIEHT.
 *      Verschwinden ist das Stillere, und still ist bei einem Block richtig.
 *
 * Was mit dem laufenden Chat und einer bestätigten Verabredung passiert, kommt aus
 * `BLOCK_WIRKUNG` — das ist Ians offene Entscheidung.
 */
export function blockieren(id: string): void {
  if (id === CURRENT_USER_ID) return;

  aendern((alt) => {
    const ich = alt.users.find((u) => u.id === CURRENT_USER_ID);
    if (!ich || ich.blockedIds.includes(id)) return {};

    // 1 + 2: Block setzen, Folge-Beziehung in beide Richtungen kappen.
    const users = alt.users.map((u) => {
      if (u.id === CURRENT_USER_ID) {
        return {
          ...u,
          blockedIds: [...u.blockedIds, id],
          followingIds: u.followingIds.filter((x) => x !== id),
          followerIds: u.followerIds.filter((x) => x !== id),
        };
      }
      if (u.id === id) {
        return {
          ...u,
          followingIds: u.followingIds.filter((x) => x !== CURRENT_USER_ID),
          followerIds: u.followerIds.filter((x) => x !== CURRENT_USER_ID),
        };
      }
      return u;
    });

    // Welche Posts gehören uns beiden? Über sie läuft alles Weitere.
    const meineIds = new Set(alt.posts.filter((p) => p.authorId === CURRENT_USER_ID).map((p) => p.id));
    const seineIds = new Set(alt.posts.filter((p) => p.authorId === id).map((p) => p.id));

    /** Betrifft diese Anfrage genau uns beide — in der einen oder anderen Richtung? */
    const zwischenUns = (postId: string, vonId: string) =>
      (vonId === id && meineIds.has(postId)) || (vonId === CURRENT_USER_ID && seineIds.has(postId));

    // 3: offene Anfragen zwischen uns entfernen.
    let joinRequests = alt.joinRequests.filter(
      (a) => !(a.status === 'pending' && zwischenUns(a.postId, a.fromUserId)),
    );

    let posts = alt.posts;

    // Ians Regel, Teil 1: die bestätigte Verabredung.
    if (BLOCK_WIRKUNG.verabredung === 'abgesagt') {
      const abgesagt = joinRequests.filter(
        (a) => a.status === 'accepted' && zwischenUns(a.postId, a.fromUserId),
      );
      const freiWerdend = new Map<string, number>();
      for (const a of abgesagt) {
        freiWerdend.set(a.postId, (freiWerdend.get(a.postId) ?? 0) + 1);
      }

      const abgesagteIds = new Set(abgesagt.map((a) => a.id));
      joinRequests = joinRequests.map((a) =>
        abgesagteIds.has(a.id) ? { ...a, status: 'declined' as const } : a,
      );

      // Der Platz wird wieder frei — und ein Post, der dadurch nicht mehr voll ist,
      // geht wieder auf. `past` bleibt `past`, genau wie in `postNachBestaetigung`:
      // was der Verfasser selbst geschlossen hat, macht eine Absage nicht wieder auf.
      posts = posts.map((p) => {
        const frei = freiWerdend.get(p.id);
        if (!frei) return p;
        const gefuellt = Math.max(0, p.spotsFilled - frei);
        return {
          ...p,
          spotsFilled: gefuellt,
          status: p.status === 'past' ? 'past' : gefuellt >= p.spotsTotal ? 'full' : 'open',
        };
      });
    }

    // Ians Regel, Teil 2: der laufende Chat.
    //
    // `stillgelegt` und `bleibt` ändern hier NICHTS an den Daten — bei `stillgelegt`
    // fragt der Chat-Screen selbst nach dem Block und nimmt das Eingabefeld weg.
    // Das ist mit Absicht so: Der Block ist die einzige Wahrheit. Ein zusätzliches
    // Feld `gesperrt` am Faden wäre eine zweite, die beim Aufheben nicht mitkommt.
    let chatThreads = alt.chatThreads;
    let messages = alt.messages;
    if (BLOCK_WIRKUNG.chat === 'weg') {
      const wegIds = new Set(
        chatThreads
          .filter((t) => t.participantIds.includes(id) && t.participantIds.includes(CURRENT_USER_ID))
          .map((t) => t.id),
      );
      chatThreads = chatThreads.filter((t) => !wegIds.has(t.id));
      messages = messages.filter((m) => !wegIds.has(m.threadId));
    }

    return { users, joinRequests, posts, chatThreads, messages };
  });
}

/**
 * Blockierung aufheben.
 *
 * Bewusst NICHT die Umkehrung von `blockieren`: Die Folge-Beziehung kommt nicht
 * zurück, die entfernten Anfragen auch nicht, und eine abgesagte Verabredung bleibt
 * abgesagt. Aufheben heißt „ich lasse dich wieder herein", nicht „es war nie".
 * Alles andere müsste man aufbewahren, um es zurückholen zu können — und dann läge
 * eine Liste im Speicher, die nur für den Fall existiert, dass jemand es sich anders
 * überlegt. Das ist genau die Art Nebenwahrheit, die später auseinanderläuft.
 */
export function entblocken(id: string): void {
  aendern((alt) => ({
    users: alt.users.map((u) =>
      u.id === CURRENT_USER_ID ? { ...u, blockedIds: u.blockedIds.filter((x) => x !== id) } : u,
    ),
  }));
}

// ── Melden ───────────────────────────────────────────────────────────────────

/**
 * Habe ich das hier schon gemeldet?
 *
 * Der Screen macht daraus keinen zweiten Melde-Knopf, sondern den Satz „Du hast das
 * schon gemeldet". Zweimal dasselbe zu melden hilft niemandem und erzeugt beim
 * Melder das Gefühl, das erste Mal sei nicht angekommen.
 */
export function useMeineMeldung(
  targetType: ReportTarget,
  targetId: string | undefined,
): Report | undefined {
  const reports = useSlice('reports');
  return reports.find(
    (r) =>
      r.fromUserId === CURRENT_USER_ID && r.targetType === targetType && r.targetId === targetId,
  );
}

/**
 * Melden. Reine Aktion, kein Haken — wie `anfrageSenden` und `folgen`.
 *
 * Im Prototyp legt sie nur einen Eintrag an. Genau das würde sie mit Backend auch
 * tun: Eine Meldung ist ein Dokument in einer Sammlung, das ein Mensch später liest.
 * Der einzige Unterschied ist, wo die Sammlung liegt.
 */
export function melden(
  targetType: ReportTarget,
  targetId: string,
  reason: ReportReason,
  note: string,
): void {
  aendern((alt) => {
    const schonDa = alt.reports.some(
      (r) =>
        r.fromUserId === CURRENT_USER_ID && r.targetType === targetType && r.targetId === targetId,
    );
    if (schonDa) return {};

    const neu: Report = {
      id: neueId('rep'),
      targetType,
      targetId,
      fromUserId: CURRENT_USER_ID,
      reason,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };
    return { reports: [...alt.reports, neu] };
  });
}

// ── Account löschen ──────────────────────────────────────────────────────────

/** Was von mir in der App steht — die Zahlen auf dem Lösch-Screen. */
export interface MeineSpuren {
  posts: number;
  chats: number;
  anfragen: number;
  follower: number;
  folgt: number;
}

/**
 * Was das Löschen meines Kontos mitnehmen würde.
 *
 * ── Warum echte Zahlen und nicht ein allgemeiner Satz ─────────────────────────
 * „Alle deine Daten werden gelöscht" ist ein Satz, den man wegklickt. „3 Posts, 2
 * Chats und 12 Follower" ist eine Entscheidung. Genau an dieser Stelle soll man kurz
 * innehalten — es ist der einzige Knopf in der App, den man nicht rückgängig machen
 * kann.
 *
 * Gezählt werden ALLE Posts, auch abgelaufene: Was im Feed nicht mehr steht
 * (Ians Regel 6.2), liegt trotzdem noch in der Datenbank. Der Lösch-Screen ist der
 * eine Ort, an dem die Datenbank zählt und nicht der Feed.
 */
export function useMeineSpuren(): MeineSpuren {
  const posts = useSlice('posts');
  const chatThreads = useSlice('chatThreads');
  const joinRequests = useSlice('joinRequests');
  const users = useSlice('users');

  return useMemo(() => {
    const ich = users.find((u) => u.id === CURRENT_USER_ID);
    return {
      posts: posts.filter((p) => p.authorId === CURRENT_USER_ID).length,
      chats: chatThreads.filter((t) => t.participantIds.includes(CURRENT_USER_ID)).length,
      anfragen: joinRequests.filter((a) => a.fromUserId === CURRENT_USER_ID).length,
      follower: ich?.followerIds.length ?? 0,
      folgt: ich?.followingIds.length ?? 0,
    };
  }, [posts, chatThreads, joinRequests, users]);
}
