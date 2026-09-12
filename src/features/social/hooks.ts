import { useMemo } from 'react';

import { getCurrentUserId, useCurrentUserId } from '../auth/hooks';
import { aendern, schreibVorgang, schreibVorgangMitId, useSlice } from '../store';
import * as senden from '@/data/senden';

import { istWienerBezirk } from '@/lib/bezirk';
import type { Bilddatei } from '@/lib/bild-waehlen-typen';
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
export function folgen(id: string): Promise<void> {
  const ichId = getCurrentUserId();
  // Der Griff steht hier und nicht nur in `mitFolgeKante`: Dort lässt er das lokale
  // `aendern` folgenlos durchlaufen — der SERVER bekäme die Zeile trotzdem, und
  // `follows` hat keinen CHECK dagegen. Zwei Wege müssen dieselbe Antwort geben.
  if (id === ichId) return Promise.resolve();
  return schreibVorgang(
    'folgen',
    id,
    (alt) => ({ users: mitFolgeKante(alt.users, ichId, id, true) }),
    (sb) => senden.folgen(sb, id, ichId),
  );
}

export function entfolgen(id: string): Promise<void> {
  const ichId = getCurrentUserId();
  if (id === ichId) return Promise.resolve();
  return schreibVorgang(
    'entfolgen',
    id,
    (alt) => ({ users: mitFolgeKante(alt.users, ichId, id, false) }),
    (sb) => senden.entfolgen(sb, id, ichId),
  );
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
export function bezirkSetzen(plz: string): Promise<void> {
  if (!istWienerBezirk(plz)) return Promise.resolve();
  const ichId = getCurrentUserId();
  return schreibVorgang(
    'bezirkSetzen',
    ichId,
    (alt) => ({
      users: alt.users.map((u) => (u.id === ichId ? { ...u, district: plz } : u)),
    }),
    (sb) => senden.bezirkSetzen(sb, plz, ichId),
  );
}

/**
 * Ein Profilbild setzen — Phase 20.6.
 *
 * ── Warum `schreibVorgangMitId` und nicht `schreibVorgang` ──────────────────
 * Weil die Adresse vom Server kommt und der Bildschirm sie gleich braucht: Ohne
 * sie stünde nach dem Hochladen weiter der alte Avatar da, und es sähe aus, als
 * hätte es nicht geklappt. Die Aktion steht deshalb in `EINORDNUNG` auf
 * `'warten'` (Ians Entscheidung 46) — dort steht auch der dritte Grund zu warten,
 * den sie neu eingeführt hat: es DAUERT messbar.
 *
 * ── Was im Prototyp passiert ────────────────────────────────────────────────
 * `URL.createObjectURL` — das Bild liegt dann im Speicher des Browsers und ist
 * beim Neuladen weg. Das ist genau das, was der Prototyp-Hinweis ohnehin sagt
 * („Neuladen setzt zurück"), und es ist ehrlicher als ein Platzhalterbild: Man
 * sieht SEIN Bild, nicht irgendeines.
 */
export function profilbildSetzen(bild: Bilddatei): Promise<string> {
  const ichId = getCurrentUserId();
  return schreibVorgangMitId(
    'profilbildSetzen',
    ichId,
    // Vorher passiert NICHTS am Zustand — die Adresse gibt es ja noch nicht. Das
    // ist der Unterschied zu `bezirkSetzen`, wo die App das Ergebnis kennt.
    () => ({}),
    async (sb) => {
      const adresse = await senden.profilbildSetzen(sb, bild, ichId);
      adresseEintragen(ichId, adresse);
      return adresse;
    },
    () => {
      // `bild.vorschau` statt `URL.createObjectURL(bild.inhalt)` — auf dem Gerät ist
      // `inhalt` ein `Uint8Array`, und der Attrappen-Zweig läuft dort genauso
      // (`ANMELDE_QUELLE` steht weiter auf `'attrappe'`). Die Adresse hat der
      // Wähler schon, weil nur er weiß, welche seiner beiden Gestalten anzeigbar
      // ist (siehe `Bilddatei`).
      const adresse = bild.vorschau;
      adresseEintragen(ichId, adresse);
      return adresse;
    },
  );
}

/** Ein Profilbild wieder wegnehmen. */
export function profilbildEntfernen(): Promise<void> {
  const ichId = getCurrentUserId();
  return schreibVorgang(
    'profilbildEntfernen',
    ichId,
    (alt) => ({
      users: alt.users.map((u) => (u.id === ichId ? { ...u, photoUrl: undefined } : u)),
    }),
    (sb) => senden.profilbildEntfernen(sb, ichId),
  );
}

/**
 * Die neue Adresse in den Speicher schreiben.
 *
 * Eine eigene Funktion, weil sie in BEIDEN Zweigen gebraucht wird (echt und
 * Attrappe) und der Zeitpunkt in beiden derselbe ist: erst, wenn die Adresse
 * wirklich feststeht. Ein `aendern` VOR dem Hochladen zeigte ein Bild, das
 * vielleicht nie ankommt — und `SCHREIB_ANTWORT` hat für genau diesen Fall kein
 * Zurückrollen (harte Regel 84: das Nachladen IST die Rücknahme).
 */
function adresseEintragen(ichId: string, adresse: string): void {
  aendern((alt) => ({
    users: alt.users.map((u) => (u.id === ichId ? { ...u, photoUrl: adresse } : u)),
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
