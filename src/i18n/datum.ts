/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DATUM — was sprachabhängig ist, aber kein String sein kann
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Hier stehen die zwei Dinge, die `lib/zeit.ts` braucht und die das Wörterbuch
 * nicht halten kann: die **Wochentagsliste** und die **Schreibweise eines Datums**.
 *
 * ── Warum nicht in `de.ts`/`en.ts` ───────────────────────────────────────────
 * Blätter im Wörterbuch müssen Strings sein — nur dann entstehen in `index.ts` die
 * Punkt-Pfade (`Blaetter<T>`). Eine LISTE als Blatt zerlegt diesen Typ: Er liefe
 * über die Index-Signatur des Arrays und erzeugte Pfade wie `zeit.tage.0.length`.
 * Punkt 3 im Kopf von `index.ts` sagt deshalb: Listen bekommen eine Helferfunktion
 * daneben, die `spracheJetzt()` liest. **ACTA hat dafür `i18n/dates.ts`**
 * (`17_Tennis_Optimma/acta/src/i18n/dates.ts`) — diese Datei ist dasselbe Muster.
 *
 * ── Warum nicht `Intl` ───────────────────────────────────────────────────────
 * Dieselbe Begründung wie in `lib/zeit.ts`, und sie zählt hier doppelt: `Intl`
 * richtet sich nach der Sprache des GERÄTS. Die App hat aber eine eigene Sprache,
 * die man in den Einstellungen umstellt — ein deutsches iPhone mit englischer App
 * bekäme von `Intl` deutsche Monatsnamen mitten in englische Sätze. Die Wahl in
 * der App muss gewinnen, und das tut sie nur bei eigenen Listen.
 *
 * ⚠️ **Diese Datei liegt in `i18n/` und wird deshalb vom Wächter
 * `npm run pruef-sprache` NICHT auf deutsche Literale durchsucht** (er überspringt
 * den ganzen Ordner — hier IST die Sprache der Inhalt). Was hier steht, sieht also
 * kein Wächter an: Wer eine Liste ändert, zählt selbst nach, dass beide Sprachen
 * **sieben** Wochentage und **zwölf** Monate haben.
 */
import { spracheJetzt } from './index';
import type { Sprache } from './sprachen';

/**
 * Kurze Wochentage, Index wie bei `Date.getDay()` — **0 ist Sonntag.**
 *
 * ⚠️ Nicht auf Montag-zuerst umbauen. `startText()` und `kurzStart()` greifen mit
 * `d.getDay()` direkt hinein; eine andere Reihenfolge verschöbe jeden Wochentag
 * der App um einen, und zwar lautlos.
 */
const WOCHENTAGE: Record<Sprache, readonly string[]> = {
  de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

/**
 * Kurze Monatsnamen, Index wie bei `Date.getMonth()` — 0 ist Januar.
 *
 * Nur Englisch braucht sie: Die deutsche Form schreibt den Monat als ZAHL
 * („15.9."), die englische als Wort („15 Sep"). Die deutsche Liste steht trotzdem
 * da, weil `Record<Sprache, …>` sie verlangt — und das ist der Punkt: Käme eine
 * dritte Sprache dazu, meldet `tsc` die fehlende Liste hier.
 */
const MONATE: Record<Sprache, readonly string[]> = {
  de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

/** Der kurze Wochentag zu diesem Datum: „Do" · „Thu". */
export function wochentag(d: Date): string {
  return WOCHENTAGE[spracheJetzt()][d.getDay()];
}

/**
 * Das Datum ohne Jahr, so kurz wie die Sprache es zulässt: „15.9." · „15 Sep".
 *
 * ── Warum Englisch nicht auch Zahlen nimmt ───────────────────────────────────
 * „15.9." ist auf Englisch nicht nur ungewohnt, sondern **zweideutig**: 9/15 und
 * 15/9 sehen gleich aus, solange eine der beiden Zahlen ≤ 12 ist. Ein Monatsname
 * kann nicht falsch verstanden werden. Die Reihenfolge Tag-vor-Monat ist dieselbe
 * wie in ACTA (`shortDate`), damit sich die zwei Apps nicht widersprechen.
 *
 * ⚠️ **Kein Jahr, in keiner Sprache** — und das ist eine Entscheidung aus dem
 * Zusammenhang, nicht Sparsamkeit: Ein Post lebt bis Tagesende
 * (`features/posts/lifecycle.ts`), ein Chat hängt an einem Post. Was die App
 * anzeigt, liegt nie ein Jahr auseinander.
 */
export function datumKurz(d: Date): string {
  if (spracheJetzt() === 'de') return `${d.getDate()}.${d.getMonth() + 1}.`;
  return `${d.getDate()} ${MONATE.en[d.getMonth()]}`;
}
