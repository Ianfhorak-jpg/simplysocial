import { getState } from '@/features/store';

/**
 * Welche Adressen es beim BAUEN schon gibt — nur für den Web-Export (Phase 8).
 *
 * ── Das Problem, das diese Datei löst ─────────────────────────────────────────
 * `npx expo export --platform web` erzeugt je Routen-MUSTER eine Datei, nicht je
 * Adresse: aus `app/post/[id].tsx` wird `dist/post/[id].html` — mit eckigen Klammern
 * im Dateinamen. Ein Server, der nur Dateien ausliefert, findet unter `/post/p4`
 * also nichts und antwortet mit 404. Beim Klicken im Feed fällt das nie auf (der
 * Router wechselt den Screen, ohne die Seite neu zu laden), beim DIREKTEN Aufruf
 * immer — und ab Phase 8 ist der Direktaufruf der Normalfall (CLAUDE.md, Regel 5):
 * ein Link in der WhatsApp-Gruppe, ein Neuladen am Handy, ein Tab-Wechsel.
 *
 * ── Warum das hier geht und bei echten Apps nicht ─────────────────────────────
 * Der Prototyp läuft auf festen Fake-Daten. Jede ID, die es je geben kann, steht
 * beim Bauen schon fest. Expo Router hat dafür `generateStaticParams`: Die Funktion
 * läuft einmal in Node, bevor gebaut wird, und für jeden zurückgegebenen Eintrag
 * entsteht eine ECHTE Datei — `dist/post/p4.html`. Danach braucht es keinen
 * schlauen Server mehr, keine Umschreibe-Regeln, keinen 404-Umweg. Der Prototyp
 * läuft auf jedem dummen Datei-Hoster.
 *
 * ── Warum nicht direkt aus `data/mock.ts` gelesen wird ────────────────────────
 * Scharfe Regel 1: `mock.ts` importiert genau EINE Datei, nämlich `store.ts`.
 * `generateStaticParams` läuft außerhalb von React, kann also keinen Haken benutzen —
 * aber `getState()` gibt es im Store genau dafür schon. Beim Bauen ist der Zustand
 * der Anfangszustand, und das ist hier richtig: gefragt sind die Adressen, die es
 * beim Ausliefern gibt, nicht die, die ein Nutzer später erzeugt.
 *
 * ── ⚠️ Was mit dem echten Backend passieren MUSS ──────────────────────────────
 * Diese Datei ist eine Prototyp-Krücke und gehört dann WEG, nicht angepasst.
 * Zwei Gründe:
 *   1. Statisches Vorrendern backt den INHALT in die HTML-Datei. Bei Fake-Daten ist
 *      das ein Vorteil (die Seite steht da, bevor das JavaScript geladen hat), bei
 *      echten Daten wäre `chat/t1.html` ein öffentlich abrufbarer fremder Chat.
 *   2. Mit einer Datenbank sind die IDs beim Bauen nicht mehr bekannt.
 * Der Ersatz ist dann eine Umschreibe-Regel auf dem Server (`/post/:id` →
 * `/post/[id].html`) oder gleich Server-Rendering. Beides braucht einen Hoster,
 * der mehr kann als Dateien ausliefern — und ein Backend, das es beantwortet.
 */

/** Die Form, die `generateStaticParams` erwartet: ein Objekt je zu bauender Seite. */
type IdParam = { id: string };

/** Alle Post-Adressen — `/post/p4` und die anderen dreizehn. */
export function postIds(): IdParam[] {
  return getState().posts.map((post) => ({ id: post.id }));
}

/**
 * Alle Profil-Adressen — `/user/u_lea` und so weiter.
 *
 * Ian ist bewusst dabei, obwohl `/user/u_ian` sofort auf den Profil-Tab umleitet:
 * Die Umleitung ist ein React-Baustein, der erst LÄUFT, wenn die Seite geladen ist.
 * Ohne eigene Datei käme man vorher auf 404 und würde nie umgeleitet.
 */
export function userIds(): IdParam[] {
  return getState().users.map((user) => ({ id: user.id }));
}

/** Alle Chat-Adressen — `/chat/t1`, `/chat/t2`. */
export function chatIds(): IdParam[] {
  return getState().chatThreads.map((thread) => ({ id: thread.id }));
}

/**
 * Alle Gruppen-Adressen — `/gruppe/g1` und die anderen zwei. Phase 17.
 *
 * `/gruppe/neu` ist KEINE davon: Das ist eine eigene Datei (`app/gruppe/neu.tsx`)
 * und damit eine statische Route, die Expo Router beim Bauen von selbst erzeugt.
 * Statische Routen gewinnen gegen `[id]`, deshalb landet `/gruppe/neu` auch zur
 * Laufzeit nie in diesem Screen — solange keine Gruppe die ID `neu` bekommt.
 * `neueId('g')` vergibt `g_neu1`, `g_neu2` …, also passiert das nicht.
 */
export function gruppeIds(): IdParam[] {
  return getState().groups.map((gruppe) => ({ id: gruppe.id }));
}
