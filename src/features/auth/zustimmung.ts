/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DIE ZUSTIMMUNG ZU DEN NUTZUNGSBEDINGUNGEN — Phase 21.2, Ians Entscheidung 80
 *  Was eine Zustimmung ist, welcher Fassung jemand zugestimmt hat und wann sie
 *  nicht mehr reicht, steht HIER und nirgends sonst. Dieselbe Bauart wie
 *  `safety/block.ts` (harte Regel 17), `groups/gruppe.ts` (32),
 *  `requests/kollision.ts` (46), `posts/standort.ts` (68), `auth/konto.ts` (78),
 *  `safety/meldung.ts` (100) und `auth/demo.ts` (108).
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ── Was Apple verlangt, und warum es nicht der Rechtstext ist ────────────────
 * Guideline 1.2 verlangt bei nutzergenerierten Inhalten, dass jemand den Regeln
 * ZUSTIMMT, bevor er mitmacht — nicht nur, dass die Regeln irgendwo abrufbar sind.
 * Das ist eine MECHANIK, und sie ist baubar, seit es in Phase 20 eine Anmeldung
 * gibt.
 *
 * **Der TEXT selbst ist weiterhin offen** (`_FUER_IAN/OFFENE_SACHEN.md` Punkt 1,
 * PLAN.md 21.2). Der rote Kasten in `nutzungsbedingungen.tsx` steht seit Phase 7
 * bewusst da und bleibt stehen. Diese Datei baut das Gefäß, nicht den Inhalt —
 * und die beiden lassen sich trennen, weil die Fassung eine ZEICHENKETTE ist:
 * Sobald Ian den Text hat, ändert sich hier genau eine Konstante.
 *
 * ── Ians Entscheidung 80, vom 2026-09-14 ────────────────────────────────────
 *
 * **Gefragt wurde ZWEIERLEI, und beide Antworten sind seine:**
 *
 *   1. WO das Häkchen steht → **beim ERSTEN Konto**, als vierte Zeile unter
 *      Name, Bezirk und Jahrgang.
 *
 *      Verworfen: der ANMELDE-Bildschirm. Er deckt alle drei Wege an einer
 *      Stelle ab und kostet dafür, dass jeder Mensch das Häkchen bei JEDER
 *      Anmeldung sieht — auch der, der zum zwanzigsten Mal kommt. Eine
 *      Zustimmung ist einmalig; ein Bildschirm, der sie jedes Mal einholt,
 *      behauptet das Gegenteil.
 *
 *      Verworfen: ein EIGENER Bildschirm davor. Sauberer getrennt und einen
 *      Bildschirm teurer, gegen harte Regel 63 — beim ersten Konto heißt die
 *      Entscheidung „ich will rein", und jeder zusätzliche Bildschirm davor ist
 *      eine Gelegenheit aufzuhören.
 *
 *   2. OB es festgehalten wird → **Zeitpunkt UND Fassung**, zwei Spalten in
 *      `profiles`.
 *
 *      Verworfen: nur der Zeitpunkt. Er beantwortet „hat zugestimmt, und wann",
 *      aber nicht „WEM". Das ist heute egal und genau dann teuer, wenn es darauf
 *      ankommt: Der Rechtstext existiert noch gar nicht. Wer jetzt ohne Fassung
 *      schreibt, kann später nicht mehr unterscheiden, ob jemand dem Platzhalter
 *      oder dem echten Text zugestimmt hat — und nachtragen lässt sich das nie.
 *
 *      Verworfen: gar nicht speichern. Kostet nichts und lässt die Frage „hat
 *      diese Person zugestimmt?" unbeantwortbar.
 *
 * ── Warum diese Datei KEINEN Import hat ──────────────────────────────────────
 * Wie `demo.ts`: Ohne Import lässt sie sich in blankem Node laden und einzeln
 * prüfen (`npm run pruef-zustimmung`). Ein einziger `import` aus `@/…` würde das
 * beenden — *ein neuer Import in einer Regel-Datei bricht JEDEN Prüfstand, der
 * sie lädt* (FALLEN.md).
 */

/**
 * Die Fassung, der man gerade zustimmt.
 *
 * ── Warum ein DATUM und keine Nummer ────────────────────────────────────────
 * `'1.0'` verlangt, dass jemand entscheidet, wann aus 1.0 eine 1.1 wird und wann
 * eine 2.0 — eine Frage, die niemand stellen wollte. Ein Datum beantwortet sich
 * selbst: Es ist der Tag, an dem der Text zuletzt geändert wurde.
 *
 * ⚠️ **Diese Zeichenkette gehört zum TEXT in `app/nutzungsbedingungen.tsx`, nicht
 * zum Code.** Wer dort etwas Inhaltliches ändert, zieht sie nach. Das ist genau
 * die Falle *„Ein Kommentar, der eine Sicherheitszusage begründet, veraltet
 * lautlos"* — nur dass hier keine Zusage veraltet, sondern eine Tatsache über
 * eine ANDERE Datei. Bewacht wird sie deshalb nicht hier, sondern mit dem
 * Prüfstand gegen den Screen.
 *
 * **Heute steht dort der Platzhalter** — die sechs Hausregeln stehen, der
 * rechtliche Teil ist der rote Kasten. `'2026-09-14-hausregeln'` sagt das
 * ausdrücklich: Wer diese Fassung in der Datenbank sieht, weiß, dass diese
 * Person dem Rechtstext NICHT zugestimmt hat, weil es keinen gab.
 */
export const FASSUNG = '2026-09-14-hausregeln';

/**
 * Die Fassung, wie sie einem MENSCHEN gezeigt wird — unter den Nutzungsbedingungen.
 *
 * `FASSUNG` ist eine Kennung für die Datenbank und darf hässlich sein; was unter
 * dem Text steht, liest jemand. Zwei getrennte Zeichenketten wären zwei Stellen,
 * die auseinanderlaufen können, deshalb wird diese aus jener GERECHNET: Der Teil
 * vor dem ersten Bindestrich-Wort ist das Datum.
 */
export function fassungText(): string {
  const [jahr, monat, tag] = FASSUNG.split('-');
  return `Fassung vom ${tag}.${monat}.${jahr}`;
}

/** Was in der Datenbank über eine Zustimmung steht. `null` heißt: keine. */
export interface Zustimmung {
  /** ISO-Zeitstempel aus `profiles.terms_accepted_at`. */
  wann: string;
  /** Die Fassung aus `profiles.terms_version`. */
  fassung: string;
}

/**
 * Der Satz neben dem Häkchen.
 *
 * Er steht hier und nicht im Screen, aus demselben Grund wie `zusageText()` in
 * `meldung.ts`: Ein getippter Satz wandert nicht mit. Der Lösch-Screen versprach
 * seit Phase 7 im JSX das Gegenteil dessen, was Ians Entscheidung 39 später
 * festlegte — dieser Satz hier ist eine Zusage in Ians Namen, die ein Apple-
 * Reviewer liest.
 *
 * **Zwei Teile**, weil der zweite antippbar ist und den Screen öffnet: Ein
 * Häkchen neben einem Text, den man nicht lesen KANN, ist keine Zustimmung.
 */
export const HAKEN_TEXT = { vor: 'Ich akzeptiere die', link: 'Nutzungsbedingungen' } as const;

/**
 * Darf das Konto angelegt werden?
 *
 * Die Frage steht hier statt als `if (!zugestimmt)` im Screen, damit der Screen
 * das Ergebnis sieht und nicht die Regel — harte Regel 78, dieselbe Bauart wie
 * `ERSTE_FRAGEN` in `konto.ts`.
 */
export function darfAnlegen(zugestimmt: boolean): boolean {
  return zugestimmt;
}

/**
 * Was dasteht, wenn jemand ohne Häkchen auf „Los geht's" tippt — oder `null`.
 *
 * **Ein SATZ und kein `boolean`**, aus demselben Grund wie `fehltNoch()` in
 * `konto.ts`: „Es fehlt noch was" ohne zu sagen, was, ist eine Sackgasse. Hier
 * kommt dazu, dass das Häkchen der einzige Mangel ist, den man nicht sieht,
 * indem man ein Feld ansieht — es ist leer, und leer sieht aus wie noch nicht
 * hingeschaut.
 *
 * Der Satz sagt NICHT „du musst" — er sagt, was zu tun ist. Wer gerade drei
 * Felder ausgefüllt hat, will weiter und nicht belehrt werden.
 */
export function zustimmungFehltText(zugestimmt: boolean): string | null {
  return darfAnlegen(zugestimmt) ? null : 'Setz noch das Häkchen, dann geht es los.';
}

/**
 * Was in die Datenbank geschrieben wird, wenn jemand zustimmt.
 *
 * ⚠️ **Der Zeitpunkt kommt vom GERÄT und ist deshalb eine Behauptung.** Ein
 * Handy mit falsch gestellter Uhr schreibt einen falschen Zeitstempel, und die
 * Zustimmung eines Menschen, der seine Uhr auf 1999 stellt, sieht dann aus wie
 * eine aus dem letzten Jahrtausend.
 *
 * Das ist hier hinnehmbar und anderswo nicht: Der Zeitstempel belegt, DASS
 * zugestimmt wurde, und dafür trägt die Zeile selbst die Last. Wo die Uhr
 * wirklich zählt — `created_at` an jeder Tabelle — steht `default now()` und
 * damit die Uhr des SERVERS. Wer das hier später auf Serverzeit umstellen will,
 * braucht einen Trigger; das ist Aufwand für einen Fall, der noch nie eingetreten
 * ist.
 */
export function zustimmungJetzt(jetzt: Date = new Date()): Zustimmung {
  return { wann: jetzt.toISOString(), fassung: FASSUNG };
}

/**
 * Muss diese Person NEU zustimmen?
 *
 * ── Die Frage, die erst in Zukunft gestellt wird ─────────────────────────────
 * Heute gibt es genau eine Fassung, also kann diese Funktion nur bei den Leuten
 * `true` sagen, die VOR dem 2026-09-14 ein Konto hatten — Ian, Christoph, Leopold
 * und Daria. Ihre `terms_accepted_at` ist `null`, und das ist die ehrliche
 * Antwort: Sie haben nie zugestimmt, weil es nichts zum Zustimmen gab.
 *
 * Interessant wird sie an dem Tag, an dem Ian den echten Rechtstext einsetzt.
 *
 * TODO(Ian): Die zweite Hälfte — was passiert, wenn sich der TEXT ändert?
 * Siehe PLAN.md, Abschnitt 6, Punkt 67. Drei Möglichkeiten stehen dort
 * ausgeschrieben; bis eine gewählt ist, fragt diese Funktion nur nach dem
 * Vorhandensein, nicht nach der Fassung.
 */
export function brauchtNeueZustimmung(hat: Zustimmung | null): boolean {
  return hat === null;
}
