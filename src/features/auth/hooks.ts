import type { Sitzung } from './anmeldung';

import { aendern, attrappeSitzung, getState, useSlice } from '../store';

/**
 * Der Zugang zur Sitzung — die Stelle, die `CURRENT_USER_ID` ersetzt.
 *
 * ── Warum es ZWEI Zugänge zu derselben Sache gibt ─────────────────────────────
 * Die 110 alten Fundstellen zerfallen in zwei Sorten, und der Unterschied ist keine
 * Geschmacksfrage, sondern eine Regel von React:
 *
 *   • In einem HAKEN (`useFeed`, `useChats` …) darf man einen Haken rufen, und man
 *     MUSS es, damit der Screen neu zeichnet, wenn sich die Sitzung ändert
 *     → `useCurrentUserId()`.
 *   • In einer AKTION (`folgen`, `blockieren`, `anfrageSenden` …) darf man keinen
 *     rufen. Aktionen lesen nichts und zeichnen nichts, sie ändern nur den Speicher
 *     → `getCurrentUserId()`.
 *
 * Genau dieselbe Teilung steht seit Phase 1 eine Ebene tiefer nebeneinander:
 * `useSlice()` und `getState()` in `store.ts`.
 *
 * ── Warum beide `string` liefern und nicht `string | null` ────────────────────
 * Weil sonst 110 Stellen einen Sonderfall für „kein Ich" mitschleppen müssten, den
 * es an keiner davon geben kann: **Der ausgeloggte Zustand wird eine Ebene höher
 * behandelt** (`app/_layout.tsx`) — ein Screen, der ein Ich braucht, wird gar nicht
 * erst gezeichnet. Kommt hier trotzdem jemand ohne Sitzung an, ist an der App etwas
 * grundlegend kaputt, und dann ist ein lauter Fehler besser als 110 stille.
 *
 * Das ist dasselbe Urteil, das `useCurrentUser()` in `social/hooks.ts` seit Phase 6
 * fällt (*„Lieber hier laut scheitern als in jedem Screen einen Sonderfall"*) — nur
 * dass die Bedingung jetzt eintreten KANN und deshalb oben abgefangen wird.
 */

/** Roh: wer angemeldet ist, oder ob niemand es ist. Nur der Torwächter liest das. */
export function useSitzung(): Sitzung {
  return useSlice('sitzung');
}

/** Meine `User.id`. Wirft, wenn niemand angemeldet ist — siehe Kopf dieser Datei. */
export function useCurrentUserId(): string {
  return meineId(useSlice('sitzung'));
}

/** Dasselbe für Aktionen, außerhalb von React. */
export function getCurrentUserId(): string {
  return meineId(getState().sitzung);
}

function meineId(sitzung: Sitzung): string {
  if (sitzung.zustand !== 'an') {
    throw new Error(
      'Kein angemeldeter Nutzer. Ein Screen, der ein Ich braucht, darf ohne Sitzung ' +
        'nicht gezeichnet werden — der Torwächter steht in app/_layout.tsx.',
    );
  }
  return sitzung.ichId;
}

/**
 * Anmelden. Im Prototyp (`ANMELDE_QUELLE = 'attrappe'`) ist das der ganze Vorgang:
 * kein Netz, kein Token, kein Konto. In 20.3-b kommt davor der echte Weg, und diese
 * Zeile bleibt die letzte davon.
 */
export function anmelden(ichId: string): void {
  aendern(() => ({ sitzung: { zustand: 'an', ichId } }));
}

/**
 * Anmelden ohne Anmeldung — solange `ANMELDE_QUELLE = 'attrappe'` ist.
 *
 * Der Knopf „Weiter als Ian" auf dem Anmelde-Bildschirm ruft sie. In 20.3-b fällt sie
 * ersatzlos weg; was dann übrig bleibt, ist `anmelden()` mit einer ID, die von
 * Supabase kommt.
 */
export function attrappeAnmelden(): void {
  aendern(() => ({ sitzung: attrappeSitzung() }));
}

/**
 * Abmelden.
 *
 * **`weggewischt` und `standort` gehen mit**, und das ist keine Aufräumarbeit,
 * sondern die Zusage aus `store.ts`: Beide entstehen erst beim Benutzen und gehören
 * dem, der sie benutzt hat. Wer sich abmeldet und jemand anderer meldet sich an,
 * bekäme sonst fremde weggewischte Karten und einen fremden gemessenen Ort — den
 * zweiten verbietet harte Regel 47 ausdrücklich.
 */
export function abmelden(): void {
  aendern(() => ({
    sitzung: { zustand: 'aus' },
    weggewischt: [],
    standort: { zustand: 'aus', ort: null, gemessenUm: null },
  }));
}
