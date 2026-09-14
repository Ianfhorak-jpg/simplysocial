import { LIEST_AUS_SUPABASE } from '@/lib/supabase';

import { appleAusweis, googleAusweis } from '@/lib/anmelde-anbieter';

import type { AbmeldeGrund, Anbieter, Sitzung } from './anmeldung';
import {
  codeAnfordern,
  codePruefen,
  demoAnmelden,
  mitAusweisAnmelden,
  profilAnlegen,
  sitzungLesen,
  supabaseAbmelden,
  type NeuesProfil,
} from './konten';

import { aendern, attrappeSitzung, datenHolen, getState, useSlice, zwischenspeicherLeeren } from '../store';

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
  abmeldenIntern();
}

/**
 * Hinausgehen, nachdem das Konto gelöscht wurde — Ians Entscheidung 52.
 *
 * ── Warum das eine ZWEITE Funktion ist und kein Parameter an `abmelden()` ────
 * Der naheliegende Weg war `abmelden(grund?: AbmeldeGrund)`, und er war eine Falle,
 * die `tsc` nicht gesehen hätte: `abmelden` steht an drei Stellen direkt als
 * `onPress={abmelden}` (`SchreibFehler.tsx`, `LadeSchirm.tsx` zweimal).
 * `SsButton.onPress` ist zwar als `() => void` DEKLARIERT — React Native ruft es
 * zur Laufzeit aber mit dem `GestureResponderEvent` auf, und ein optionaler
 * Parameter ist an `() => void` zuweisbar. Das Event wäre also als `grund` in der
 * Sitzung gelandet.
 *
 * Sichtbar wäre davon nichts gewesen (ein Event ist nie `'konto-geloescht'`) —
 * genau deshalb steht es hier: **Ein Fehler, der nichts kaputtmacht, wird nie
 * gefunden**, und beim nächsten Grund wäre er es dann doch.
 *
 * Der Name sagt außerdem, was wirklich passiert. Abmelden ist etwas, das ein Mensch
 * TUT; hier gibt es nichts mehr, wovon man sich abmelden könnte.
 */
export function hinausNachLoeschen(): void {
  abmeldenIntern('konto-geloescht');
}

function abmeldenIntern(grund?: AbmeldeGrund): void {
  // Am SERVER abmelden, ohne darauf zu warten. Das ist Absicht: Wer auf „Abmelden"
  // tippt, will jetzt weg — und ein `await` vor dem Leeren hieße, dass bei einem
  // langsamen Netz sekundenlang fremde Chats sichtbar bleiben. Der Aufruf räumt
  // den gespeicherten Token auf; scheitert er, sagt `konten.ts` es der Konsole.
  if (LIEST_AUS_SUPABASE) void supabaseAbmelden();
  // Die neun Listen aus der Datenbank gehen MIT — aus derselben Begründung wie
  // `weggewischt` und `standort`, nur schärfer: Das sind FREMDE Daten. Siehe
  // `zwischenspeicherLeeren()` in `store.ts`. Zuerst, damit zwischen dem Leeren und
  // dem Abmelden kein Augenblick liegt, in dem ein Screen noch zeichnet.
  zwischenspeicherLeeren();
  aendern(() => ({
    // `grund` ist fast immer `undefined` — nur `kontoLoeschen()` gibt einen mit
    // (Ians Entscheidung 52). Er steht IN der Sitzung und nicht daneben, weil er
    // sonst das Abmelden nicht überlebte: Genau in dem Augenblick baut der
    // Torwächter den Navigator ab, und was nur im Screen liegt, ist dann weg.
    sitzung: { zustand: 'aus', grund },
    weggewischt: [],
    standort: { zustand: 'aus', ort: null, gemessenUm: null },
  }));
}

/* ═══════════════════════════════════════════════════════════════════════════════
 *  DER ECHTE WEG HINEIN — Phase 20.3-b1
 *
 *  Alles darunter ruft `features/auth/konten.ts`; alles darüber ist seit 20.3-a
 *  unverändert. Das ist die Naht, die `ANMELDE_QUELLE` schaltet — **und sie ist
 *  hier und nicht im Screen**, weil sonst der Anmelde-Bildschirm wüsste, welcher
 *  Anmeldedienst dahintersteht.
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Beim Start nachsehen, ob noch eine Sitzung liegt.
 *
 * ── Warum das ein eigener Schritt ist und nicht `startSitzung()` ─────────────
 * Weil es NETZ braucht: Ob hinter einem gespeicherten Token noch ein Profil steht,
 * weiß nur die Datenbank. `store.ts` baut seinen Anfangszustand beim Laden der
 * Datei auf — dort kann nichts warten. Also beginnt die Sitzung auf `'unbekannt'`,
 * und diese Funktion löst sie auf.
 *
 * ── Und warum ein FEHLER hier zu `'aus'` wird ────────────────────────────────
 * Er ist die einzige Antwort, die nicht in eine Sackgasse führt: Ein Token, das
 * sich nicht prüfen lässt, ist für die App wertlos, und `'unbekannt'` stehen zu
 * lassen hieße, jemanden für immer vor einem wartenden Bildschirm sitzen zu lassen.
 * **Das ist NICHT dieselbe Lage wie beim Lesen** (Entscheidung 43, wo ein Fehler
 * sichtbar werden muss): Dort ist der Ausweg „nochmal versuchen", hier ist der
 * Ausweg der Anmelde-Bildschirm, und der steht dann ja da.
 */
export async function sitzungWiederherstellen(): Promise<void> {
  if (!LIEST_AUS_SUPABASE) return;
  try {
    const sitzung = await sitzungLesen();
    aendern(() => ({ sitzung }));
    if (sitzung.zustand === 'an') void datenHolen();
  } catch (fehler) {
    console.warn(`Sitzung nicht lesbar, also abgemeldet: ${String(fehler)}`);
    aendern(() => ({ sitzung: { zustand: 'aus' } }));
  }
}

/** Schritt 1: „Schick mir eine Zahl." Wirft einen `KontoFehler`, der Screen zeigt ihn. */
export async function codeSchicken(email: string): Promise<void> {
  await codeAnfordern(email);
}

/**
 * Schritt 2: Code eintippen. Danach steht die Sitzung — auf `'an'`, wenn es schon
 * ein Profil gibt, sonst auf `'neu'`, und dann übernimmt der Torwächter.
 *
 * **Das Laden startet NUR bei `'an'`.** Ohne Profil hat es keinen Sinn: Der eigene
 * Feed hängt an der eigenen Zeile in `profiles`, und dreizehn Abfragen, die
 * garantiert nichts finden, wären dreizehn Umläufe nach Irland für einen leeren
 * Bildschirm, den sowieso niemand sieht.
 */
export async function anmeldenMitCode(email: string, code: string): Promise<void> {
  await codePruefen(email, code);
  await sitzungUebernehmen();
}

/**
 * Der Demo-Zugang — Phase 21.5 Punkt 1.
 *
 * ── Warum das eine eigene Funktion ist und kein Argument an `anmeldenMitCode` ─
 * Weil es ein anderer WEG ist und nicht ein anderer Wert. Ein
 * `anmeldenMitCode(email, code, alsPasswort?)` hätte einen Schalter in eine
 * Funktion gelegt, die zwei verschiedene Dinge tut — und der Riegel in
 * `demoAnmelden()` säße dann hinter einem `if`, das jemand beim nächsten Umbau
 * anders verzweigt. Dieselbe Überlegung wie bei `anbieterFehlerText()` neben
 * `codeFehlerText()`: zwei Wege, zwei Funktionen.
 *
 * Was DANACH passiert, ist Wort für Wort dasselbe wie bei den drei anderen Wegen
 * — deshalb `sitzungUebernehmen()` und keine eigene Zeile. Das Demo-Konto hat
 * ein Profil (`supabase/demo/anlegen.sh` legt es mit an), landet also auf `'an'`
 * und nicht im Erstes-Konto-Bildschirm. **Hätte es keines, wäre das kein Fehler,
 * sondern der Reviewer stünde vor drei Fragen** — und genau deshalb legt das
 * Skript das Profil an, statt sich darauf zu verlassen.
 */
export async function anmeldenAlsDemo(email: string, passwort: string): Promise<void> {
  await demoAnmelden(email, passwort);
  await sitzungUebernehmen();
}

/**
 * Der Weg über Apple oder Google — Phase 20.3-b2.
 *
 * Drei Schritte, und der mittlere ist der einzige, der Supabase kennt:
 * Ausweis holen (`lib/anmelde-anbieter`, Plattform-Endung) → Ausweis einlösen
 * (`konten.ts`) → nachsehen, ob ein Profil dahintersteht.
 *
 * ── Warum EIN `weg` als Argument und nicht zwei Funktionen ───────────────────
 * Weil der Unterschied genau eine Zeile ist — welchen Ausweis man holt — und der
 * Rest Wort für Wort derselbe. Zwei Funktionen wären zwei Gelegenheiten, eine der
 * beiden beim nächsten Umbau zu vergessen. `Anbieter` ist dabei abgeleitet
 * (`Exclude<AnmeldeWeg, 'email-code'>`): Ein `switch` ohne Rückfallzweig, also
 * meldet `tsc` einen vierten Weg.
 */
export async function anmeldenMitAnbieter(weg: Anbieter): Promise<void> {
  const ausweis = weg === 'apple' ? await appleAusweis() : await googleAusweis();
  await mitAusweisAnmelden(weg, ausweis.idToken);
  await sitzungUebernehmen(ausweis.name);
}

/**
 * Was nach JEDEM erfolgreichen Anmelden passiert — an EINER Stelle.
 *
 * Vorher stand dieser Absatz in `anmeldenMitCode()`, und mit Apple und Google
 * hätte er dreimal dagestanden. Der teure Teil daran ist nicht die Wiederholung,
 * sondern die Zeile darunter: **Das Laden startet NUR bei `'an'`.** Ohne Profil
 * hat es keinen Sinn — der eigene Feed hängt an der eigenen Zeile in `profiles`,
 * und dreizehn Abfragen, die garantiert nichts finden, wären dreizehn Umläufe
 * nach Irland für einen Bildschirm, den niemand sieht. Eine von drei Kopien ohne
 * diese Bedingung hätte niemand bemerkt.
 *
 * ── `name` ist der Grund, warum die Funktion überhaupt ein Argument hat ──────
 * Apple gibt den vollen Namen **nur bei der allerersten Freigabe** heraus (steht
 * wörtlich in `AppleAuthentication.js`) — danach nie wieder, auch nicht nach dem
 * Neuinstallieren. Er kommt aus dem Anmelde-Dialog und steht in KEINER Antwort
 * von Supabase; wer ihn in diesem Augenblick nicht weiterreicht, wirft ihn
 * endgültig weg. Also reist er in die Sitzung und von dort ins Namensfeld des
 * Bildschirms fürs erste Konto.
 *
 * Er wird nur an `'neu'` gehängt. An `'an'` wäre er sinnlos: Dort gibt es längst
 * ein Profil mit einem Namen, den ein Mensch selbst gewählt hat, und der zählt
 * mehr als der aus dem Ausweis.
 */
async function sitzungUebernehmen(name?: string | null): Promise<void> {
  const gelesen = await sitzungLesen();
  const sitzung: Sitzung =
    gelesen.zustand === 'neu' && name ? { ...gelesen, name } : gelesen;
  aendern(() => ({ sitzung }));
  if (sitzung.zustand === 'an') void datenHolen();
}

/**
 * Das erste Konto fertig machen — Ians Entscheidung 44.
 *
 * Sie nimmt `authId` als Argument und liest sie NICHT aus dem Speicher, obwohl sie
 * dort steht. Grund: Eine Aktion, die sich ihr eigenes Ziel sucht, kann das falsche
 * finden — meldet sich jemand während des Tippens ab, schriebe sie das Profil auf
 * eine UUID, die inzwischen einer anderen Sitzung gehört. Der Screen hat die ID
 * ohnehin, er zeichnet ja den Zustand, in dem sie steht.
 */
export async function kontoAnlegen(neu: NeuesProfil): Promise<void> {
  const sitzung = await profilAnlegen(neu);
  aendern(() => ({ sitzung }));
  void datenHolen();
}
