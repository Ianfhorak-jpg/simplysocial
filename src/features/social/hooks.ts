import { useMemo } from 'react';

import { getCurrentUserId, useCurrentUserId } from '../auth/hooks';
import { aendern, useSlice } from '../store';

import { istWienerBezirk } from '@/lib/bezirk';
import type { User } from '@/types/models';

/**
 * Alles rund um Menschen: wer bin ich, wer ist das, wer folgt wem.
 *
 * Bis Phase 20.3 stand hier: *„Kein Login im Prototyp — die Konstante steht in
 * `data/mock.ts` fest. Wenn später eine Anmeldung dazukommt, ändert sich nur diese
 * Datei: `useCurrentUser` liest dann aus der Sitzung statt aus einer Konstante."*
 *
 * **Genau das ist am 2026-09-09 eingetreten, und die Zusage hat zur Hälfte gehalten.**
 * `useCurrentUser()` liest jetzt aus der Sitzung (`features/auth/hooks.ts`), und
 * jeder Screen, der ihn ruft, hat nichts gemerkt. Nicht gehalten hat sie für die
 * 110 Stellen, die die Konstante DIREKT gelesen haben statt über einen Haken — und
 * das ist die Lehre daraus: **Eine Naht hält nur dort, wo wirklich jemand durchgeht.**
 */

/** Der Nutzer, als der man den Prototyp bedient. */
export function useCurrentUser(): User {
  const ichId = useCurrentUserId();
  const users = useSlice('users');
  const ich = users.find((u) => u.id === ichId);
  // Fehlt der eigene Nutzer, ist an den Daten etwas grundlegend kaputt. Lieber hier
  // laut scheitern als in jedem Screen einen Sonderfall für "kein Ich" mitschleppen.
  if (!ich) throw new Error(`Nutzer ${ichId} fehlt in den Daten`);
  return ich;
}

/** Ein einzelner Nutzer. `undefined`, wenn es die ID nicht gibt. */
export function useUser(id: string | undefined): User | undefined {
  const users = useSlice('users');
  return users.find((u) => u.id === id);
}

/** Alle Nutzer als Nachschlagetabelle — für Listen, damit nicht je Zeile gesucht wird. */
export function useUserMap(): Map<string, User> {
  const users = useSlice('users');
  return useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
}

/** Folge ICH dieser Person? */
export function useFolgeIch(id: string): boolean {
  const ich = useCurrentUser();
  return ich.followingIds.includes(id);
}

// ── Folgen und entfolgen ─────────────────────────────────────────────────────

/**
 * Jemandem folgen bzw. nicht mehr folgen.
 *
 * Keine Haken (`use…`), sondern reine Aktionen — dasselbe Muster wie `anfrageSenden`
 * in `requests/hooks.ts`: sie lesen nichts und zeichnen nichts neu, sie ändern nur
 * den Speicher. Die Screens erfahren es über ihre Haken von selbst.
 *
 * ── Warum beide Richtungen in EINEM `aendern` ─────────────────────────────────
 * Eine Folge-Beziehung steht im Datenmodell ZWEIMAL: als `followingIds` bei mir und
 * als `followerIds` bei der anderen Person. Das ist gewollt (eine Datenbank ohne
 * Joins muss beide Seiten kennen), aber die zwei Listen dürfen sich keine Millisekunde
 * lang widersprechen. Zwei getrennte Aufrufe hätten dazwischen einen Zustand, in dem
 * ich Lea schon folge, sie mich aber noch nicht als Follower führt — und genau in dem
 * Moment entscheidet `darfIchSehen` in `posts/hooks.ts` über ihre Follower-Posts.
 * Harte Regel 9 aus PLAN.md.
 */
export function folgen(id: string): void {
  const ichId = getCurrentUserId();
  aendern((alt) => ({ users: mitFolgeKante(alt.users, ichId, id, true) }));
}

export function entfolgen(id: string): void {
  const ichId = getCurrentUserId();
  aendern((alt) => ({ users: mitFolgeKante(alt.users, ichId, id, false) }));
}

/**
 * Den eigenen Heimatbezirk setzen — seit Phase 19h, Ians Entscheidung 64.
 *
 * ── Warum das überhaupt eine Einstellung ist ──────────────────────────────────
 * Seit Entscheidung 63 bestimmt der Bezirk die REIHENFOLGE des Feeds (`sort.ts`).
 * Eine Regel, die man nicht sehen und nicht verstellen kann, lässt sich am Gerät
 * auch nicht beurteilen — man müsste den Code lesen, um zu merken, dass sie wirkt.
 * Im fertigen Produkt fragt danach das Anmelden (Phase 20.3, *„man gibt am Anfang
 * seinen Bezirk an"*); bis dahin ist die Einstellung der einzige Weg dorthin.
 *
 * Ungültige Postleitzahlen werden still verworfen statt geworfen: Der Aufrufer ist
 * eine Auswahl aus `BEZIRKS_LISTE`, kann also gar nichts Falsches schicken — und
 * ein Absturz an dieser Stelle wäre teurer als ein Klick, der nichts tut.
 */
export function bezirkSetzen(plz: string): void {
  if (!istWienerBezirk(plz)) return;
  const ichId = getCurrentUserId();
  aendern((alt) => ({
    users: alt.users.map((u) => (u.id === ichId ? { ...u, district: plz } : u)),
  }));
}

/** Setzt die Kante `vonId → zuId` auf an oder aus und pflegt dabei beide Seiten. */
function mitFolgeKante(users: User[], vonId: string, zuId: string, an: boolean): User[] {
  // Sich selbst folgen gibt es nicht. Über die Oberfläche kann es nicht passieren
  // (der Knopf steht am eigenen Profil nicht), über einen direkten Link schon.
  if (vonId === zuId) return users;

  return users.map((u) => {
    if (u.id === vonId) return { ...u, followingIds: mitOderOhne(u.followingIds, zuId, an) };
    if (u.id === zuId) return { ...u, followerIds: mitOderOhne(u.followerIds, vonId, an) };
    return u;
  });
}

/**
 * Eine ID in einer Liste an- oder abschalten.
 *
 * Ist schon alles so, wie es sein soll, kommt die UNVERÄNDERTE Liste zurück — nicht
 * eine gleich aussehende Kopie. React vergleicht mit `===`; eine neue Liste mit
 * demselben Inhalt wäre für React eine Änderung und würde umsonst neu zeichnen.
 */
function mitOderOhne(ids: string[], id: string, an: boolean): string[] {
  if (an === ids.includes(id)) return ids;
  return an ? [...ids, id] : ids.filter((x) => x !== id);
}

// ── Wer folgt wem ────────────────────────────────────────────────────────────

/** Welche der beiden Listen ein Profil gerade zeigt. */
export type FolgeListe = 'follower' | 'following';

export const FOLGE_LISTE_TITEL: Record<FolgeListe, string> = {
  follower: 'Follower',
  following: 'Folgt',
};

/**
 * Die Follower- oder Folgt-Liste eines Nutzers, als ganze Nutzer statt als IDs.
 *
 * `undefined` heißt "diesen Nutzer gibt es nicht" — der Screen zeigt dann seine
 * Nicht-gefunden-Seite. Eine leere Liste ist etwas anderes: den Nutzer gibt es,
 * ihm folgt nur niemand.
 *
 * Die Reihenfolge ist umgekehrt zur Speicherung: Die Arrays wachsen hinten, also
 * steht nach `reverse()` die neueste Beziehung oben. Dieselbe Haltung wie im Feed
 * (Ians Regel 6.1) — was gerade passiert ist, soll man sehen, ohne zu suchen.
 */
export function useFolgeListe(id: string | undefined, art: FolgeListe): User[] | undefined {
  const users = useSlice('users');

  return useMemo(() => {
    const person = users.find((u) => u.id === id);
    if (!person) return undefined;

    const ids = art === 'follower' ? person.followerIds : person.followingIds;
    const nachId = new Map(users.map((u) => [u.id, u]));
    // `flatMap` statt `map(...).filter(...)`: eine ID ohne Nutzer fällt heraus, ohne
    // dass der Typ hinterher noch `undefined` enthält.
    return [...ids].reverse().flatMap((uid) => {
      const u = nachId.get(uid);
      return u ? [u] : [];
    });
  }, [users, id, art]);
}
