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
 * ── ✅ Was mit dem echten Backend WIRKLICH passiert ist (2026-09-13, Phase 20.8) ─
 * Hier stand bis heute: *„Diese Datei ist eine Prototyp-Krücke und gehört dann WEG,
 * nicht angepasst"* — mit zwei Gründen. **Beide sind nachgemessen, und keiner trägt
 * das Löschen noch.** Gemessen wurde mit zwei vollständigen Web-Exporten, einer je
 * Schalterstellung:
 *
 *                        HTML-Dateien   konkrete Adressen   mit Inhalt vorgerendert
 *   ANMELDE_QUELLE='attrappe'      72                  47                 17 Dateien
 *   ANMELDE_QUELLE='supabase'      25                   0                  0 Dateien
 *
 *   1. **Die GEFAHR ist weg — aber durch eine ANDERE Phase.** Der alte Grund 1 war,
 *      `chat/t1.html` wäre mit echten Daten ein öffentlich abrufbarer fremder Chat.
 *      Bei `'supabase'` entsteht die Datei überhaupt nicht: `startListen()` in
 *      `features/store.ts` gibt seit 20.4-b neun LEERE Listen zurück, also findet
 *      `generateStaticParams` nichts vor. Beseitigt hat das der leere Startzustand,
 *      nicht diese Datei — **und wer nur den alten Kommentar liest, hält eine
 *      erledigte Gefahr für offen** (harte Regel 83, innerhalb einer Datei).
 *   2. **Grund 2 stimmt und ist trotzdem kein Löschgrund.** Ja, mit einer Datenbank
 *      sind die IDs beim Bauen unbekannt — das ist genau die Zeile `0` oben. Nur
 *      deployt `scripts/deploy.sh` seit dem 2026-09-13 ausschließlich aus
 *      `'attrappe'` heraus (es bricht sonst ab). **Die öffentliche Adresse und die
 *      echte App sind zwei getrennte Stände**, und diese Datei gehört dem einen.
 *
 * **Ians Entscheidung am 2026-09-13: die öffentliche Adresse BLEIBT der Prototyp.**
 * Herzeigen mit echten Daten läuft über TestFlight; die Webseite ist das, was per
 * WhatsApp weitergeht, und ein Link auf einen einzelnen Post ist dort der Normalfall
 * (harte Regel 5). Damit ist diese Datei keine Krücke mehr, sondern das, was die 47
 * Direktlinks des Prototyps überhaupt gibt.
 *
 * ⚠️ **Wer sie trotzdem löscht, bekommt keine Fehlermeldung — er bekommt 404.** Der
 * Schalter-Wächter in `deploy.sh` merkt es nicht: Er fragt nach `'attrappe'`, und das
 * steht dann ja da. Deshalb misst der Deploy seit Phase 20.8 nach, ob die konkreten
 * Adressen wirklich entstanden sind. **Wer hier eine Funktion entfernt, entfernt den
 * Aufruf in ihrem Screen mit — und dann schlägt dort der Wächter an.**
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
