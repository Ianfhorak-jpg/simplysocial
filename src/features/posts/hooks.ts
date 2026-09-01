import { useMemo } from 'react';

import { CURRENT_USER_ID, aendern, neueId, useSlice } from '../store';
import { istBlockiert } from '../safety/hooks';
import { useUserMap } from '../social/hooks';

import { istAktuell } from './lifecycle';
import { gehoertAufsProfil } from './profil';
import { vergleichePosts } from './sort';

import type { ActivityCategory, Post, SkillLevel, User, Visibility } from '@/types/models';

/**
 * Der Zugang zu Posts. Screens lesen NIE aus `data/mock.ts` (harte Regel 2 aus
 * CLAUDE.md) — sie fragen hier.
 *
 * Was ein Screen bekommt, ist bewusst schon zusammengesetzt: Post UND Verfasser.
 * Eine echte Datenbankabfrage würde beides in einem Rutsch liefern; wenn die Screens
 * sich jetzt schon so verhalten, ändert sich beim Umstieg auf Firestore nichts an
 * ihnen.
 */

/** Ein Post samt seinem Verfasser — was eine Karte im Feed braucht. */
export interface FeedEintrag {
  post: Post;
  author: User;
}

/** "alle" ist bewusst Teil des Typs: der Feed hat immer genau einen Zustand, nie keinen. */
export type KategorieFilter = ActivityCategory | 'alle';

export interface FeedFilter {
  kategorie: KategorieFilter;
  /** Nur Posts von Leuten, denen ich folge. */
  nurGefolgte: boolean;
}

/**
 * Darf ICH diesen Post überhaupt sehen?
 *
 * Das ist KEIN Filter, den man wegklicken kann, sondern die Sichtbarkeitsregel des
 * Verfassers: "nur meine Follower" heißt, dass ihn nur sieht, wer dem Verfasser
 * folgt. Eigene Posts sieht man immer.
 *
 * Im Prototyp entscheidet das der Browser. Mit echtem Backend muss dieselbe Regel
 * ZUSÄTZLICH auf dem Server stehen (Firestore Security Rules) — was der Browser
 * filtert, hat er vorher trotzdem heruntergeladen.
 */
function darfIchSehen(post: Post, verfasser: User, ichId: string): boolean {
  if (post.authorId === ichId) return true;
  if (post.visibility === 'public') return true;
  return verfasser.followerIds.includes(ichId);
}

/**
 * Der Block als EIGENE Regel neben `darfIchSehen` — bewusst nicht hineingezogen.
 *
 * Beide werfen Posts aus dem Feed, aber aus verschiedenen Gründen, und `useProfilPosts`
 * zählt die von `darfIchSehen` verworfenen als `verborgen` („3 Posts sind nur für
 * Follower sichtbar"). Stünde der Block mit drin, stünde dieser Satz auf dem Profil
 * einer blockierten Person — und würde damit ausgerechnet dort etwas verraten, wo
 * nichts mehr zu sehen sein soll.
 *
 * Phase 7. Die Wirkung geht in beide Richtungen, gespeichert ist sie nur einmal
 * (`features/safety/hooks.ts`).
 */
function blockDazwischen(ich: User, verfasser: User): boolean {
  return istBlockiert(ich, verfasser);
}

/**
 * Der Feed: gefiltert, sortiert, fertig für die Anzeige.
 *
 * Die Reihenfolge kommt aus `sort.ts` — seit Ians Entscheidung vom 2026-08-31 steht
 * dort „das Neueste zuerst".
 */
export function useFeed(filter: FeedFilter): FeedEintrag[] {
  const posts = useSlice('posts');
  const userMap = useUserMap();
  const ich = userMap.get(CURRENT_USER_ID);

  return useMemo(() => {
    if (!ich) return [];
    const jetzt = new Date();

    const eintraege: FeedEintrag[] = [];
    for (const post of posts) {
      const author = userMap.get(post.authorId);
      if (!author) continue;
      if (blockDazwischen(ich, author)) continue;
      if (!darfIchSehen(post, author, ich.id)) continue;
      if (!istAktuell(post, jetzt)) continue;
      if (filter.kategorie !== 'alle' && post.category !== filter.kategorie) continue;
      if (filter.nurGefolgte && !ich.followingIds.includes(post.authorId)) continue;
      eintraege.push({ post, author });
    }

    // Kopie sortieren, nicht das Original: `sort` verändert das Array an Ort und
    // Stelle, und `posts` gehört dem Speicher.
    return eintraege.sort((a, b) =>
      vergleichePosts(a.post, b.post, { jetzt, meinBezirk: ich.district }),
    );
  }, [posts, userMap, ich, filter.kategorie, filter.nurGefolgte]);
}

/** Ein einzelner Post samt Verfasser — für `post/[id]`. */
export function usePost(id: string | undefined): FeedEintrag | undefined {
  const posts = useSlice('posts');
  const userMap = useUserMap();

  return useMemo(() => {
    const post = posts.find((p) => p.id === id);
    if (!post) return undefined;
    const author = userMap.get(post.authorId);
    if (!author) return undefined;
    return { post, author };
  }, [posts, userMap, id]);
}

/** Wie viele Plätze noch frei sind. Nie negativ, auch wenn die Daten mal nicht stimmen. */
export function freiePlaetze(post: Post): number {
  return Math.max(0, post.spotsTotal - post.spotsFilled);
}

/** Ist der Post noch offen für Anfragen? */
export function istOffen(post: Post): boolean {
  return post.status === 'open' && freiePlaetze(post) > 0;
}

// ── Posten ───────────────────────────────────────────────────────────────────

/**
 * Was der Erstellen-Screen einsammelt.
 *
 * Bewusst NICHT einfach `Post`: `id`, `authorId`, `createdAt`, `status` und
 * `spotsFilled` gehören nicht dem Formular. Sie entstehen beim Speichern, und mit
 * echtem Backend entstehen sie auf dem Server. Ein Screen, der sie mitschickt,
 * würde etwas behaupten, das er nicht wissen kann — und beim Umstieg auf Firestore
 * müsste man ihn wieder anfassen.
 */
export type PostEntwurf = {
  category: ActivityCategory;
  title: string;
  district: string;
  startsAt: string;
  /** Wann der Post aus dem Feed verschwindet — gerechnet in `lifecycle.ts`. */
  expiresAt: string;
  level: SkillLevel;
  spotsTotal: number;
  note: string;
  meetingPoint?: string;
  visibility: Visibility;
};

/**
 * Einen Post anlegen. Gibt die neue ID zurück, damit der Screen direkt dorthin
 * springen kann — der beste Beweis, dass es geklappt hat.
 *
 * Kein Haken (`use…`), sondern eine reine Aktion: sie liest nichts und zeichnet
 * nichts neu, sie ändert nur den Speicher. Die Screens erfahren es über ihre Haken.
 */
export function postErstellen(entwurf: PostEntwurf): string {
  const id = neueId('p');

  aendern((alt) => {
    const neu: Post = {
      ...entwurf,
      id,
      authorId: CURRENT_USER_ID,
      spotsFilled: 0,
      status: 'open',
      createdAt: new Date().toISOString(),
      // Ein leeres Textfeld ist im Datenmodell KEIN leerer String, sondern gar kein
      // Treffpunkt (`meetingPoint?`). Das Detail zeigt darauf "Machen wir im Chat aus"
      // statt einer leeren Zeile.
      meetingPoint: entwurf.meetingPoint?.trim() ? entwurf.meetingPoint.trim() : undefined,
      title: entwurf.title.trim(),
      note: entwurf.note.trim(),
    };
    return { posts: [...alt.posts, neu] };
  });

  return id;
}

// ── Phase 6: die Posts einer Person ──────────────────────────────────────────

export interface ProfilPosts {
  /** Was auf dem Profil steht — schon gefiltert und sortiert. */
  eintraege: FeedEintrag[];
  /**
   * Wie viele laufende Posts diese Person hat, die ich NICHT sehen darf, weil sie
   * „nur für Follower" sind. Das Profil macht daraus eine Zeile — eine Zahl ist der
   * ehrlichste Grund zu folgen, den die App geben kann, und verrät nichts über den
   * Inhalt.
   */
  verborgen: number;
}

/**
 * Alle Posts einer Person für ihr Profil.
 *
 * Drei Regeln greifen hier hintereinander, und sie sind bewusst getrennt:
 *   0. Steht ein BLOCK dazwischen (`blockDazwischen`) — dann ist das Profil leer,
 *      noch bevor die anderen beiden überhaupt gefragt werden. Phase 7.
 *   1. DARF ich ihn sehen (`darfIchSehen`) — die Sichtbarkeitsregel des Verfassers,
 *      dieselbe wie im Feed.
 *   2. GEHÖRT er aufs Profil (`gehoertAufsProfil`) — Ians Regel 6.6, nur Zeit.
 *
 * Wären sie eine Funktion, könnte man `verborgen` nicht zählen: dann wüsste man am
 * Ende nur, dass ein Post fehlt, aber nicht, warum.
 */
export function useProfilPosts(userId: string | undefined): ProfilPosts {
  const posts = useSlice('posts');
  const userMap = useUserMap();

  return useMemo(() => {
    const person = userId ? userMap.get(userId) : undefined;
    if (!person) return { eintraege: [], verborgen: 0 };

    // Ein Block leert das Profil, ohne `verborgen` hochzuzählen — sonst stünde dort
    // „N Posts sind nur für Follower sichtbar" und die leere Seite hätte eine falsche
    // Erklärung. Was der Screen STATTDESSEN zeigt, entscheidet er selbst: Habe ich
    // blockiert, steht dort der Aufheben-Knopf; hat die andere Person mich blockiert,
    // sieht es aus wie ein Profil ohne Pläne. Das ist Absicht (`safety/hooks.ts`).
    const ich = userMap.get(CURRENT_USER_ID);
    if (ich && blockDazwischen(ich, person)) return { eintraege: [], verborgen: 0 };

    const jetzt = new Date();
    const ctx = { jetzt };
    const eintraege: FeedEintrag[] = [];
    let verborgen = 0;

    for (const post of posts) {
      if (post.authorId !== person.id) continue;
      if (!gehoertAufsProfil(post, ctx)) continue;
      if (!darfIchSehen(post, person, CURRENT_USER_ID)) {
        verborgen += 1;
        continue;
      }
      eintraege.push({ post, author: person });
    }

    // Dieselbe Reihenfolge wie im Feed — ein Profil ist ein Feed mit nur einem
    // Verfasser, und zwei Reihenfolgen für dieselbe Sache müsste man erklären.
    return {
      eintraege: eintraege.sort((a, b) =>
        vergleichePosts(a.post, b.post, { jetzt, meinBezirk: person.district }),
      ),
      verborgen,
    };
  }, [posts, userMap, userId]);
}
