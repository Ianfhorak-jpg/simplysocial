import type { PostAlter } from '@/types/models';

/**
 * Alles rund um den Jahrgang — die WÖRTER und die GRENZEN, nicht die Regeln.
 *
 * Die Regeln (wer zu wem passt) stehen in `features/posts/filter.ts`, die Typen in
 * `types/models.ts`. Dieselbe Dreiteilung wie bei den Kategorien: `config/` sagt,
 * wie etwas heißt, `features/` sagt, was es tut.
 *
 * ── Phase 18b: aus drei Bändern wurde ein Jahrgang ───────────────────────────
 * Bis zum 2026-09-05 stand hier eine Tabelle mit „14–17", „18–25", „26+" und zwei
 * Beschriftungs-Listen dazu (eine fürs Posten, eine für den Filter). Beides ist weg.
 * Ians Entscheidung 17: „mehr als Jahrgang brauchen wir nicht."
 *
 * Die zwei Listen sind trotzdem eine Lehre, die weiter gilt: Derselbe Wert bedeutet
 * an zwei Stellen zwei verschiedene Sätze — beim Posten „Für alle" (eine Ansage des
 * Verfassers), im Filter „Alter egal" (der Verzicht des Suchenden). Deshalb gibt es
 * unten `alterAmPost` und `FILTER_EGAL` getrennt und kein gemeinsames Wort.
 */

/**
 * Die Grenzen des Schiebereglers.
 *
 * Bewusst aus dem LAUFENDEN Jahr gerechnet und nicht als feste Jahreszahlen: Zwei
 * feste Zahlen wären am 1. Jänner still falsch, und niemand würde es merken — die
 * jüngste erlaubte Person wäre plötzlich 15.
 *
 * `MINDESTALTER` ist eine ANZEIGE-Grenze, keine Prüfung. Die App fragt kein Alter ab
 * und kann keines belegen; was hier steht, begrenzt nur, was ein Regler hergibt. Die
 * echte Frage (Mindestalter, DSGVO, Einwilligung der Eltern) steht offen in PLAN.md,
 * Abschnitt 8, Punkt 1 und wartet auf erwachsenen Rat.
 *
 * `HOECHSTALTER` war zuerst 70 — großzügig gedacht („SimplySocial ist keine
 * Schüler-App"), in der Bedienung das Gegenteil. Am Regler nachgemessen: Bei 14 bis 70
 * sind das 56 Jahrgänge auf 280 px, und ALLE wirklichen Nutzer drängen sich im rechten
 * Fünftel. Ein Regler, dessen brauchbarer Teil 50 px breit ist, ist keiner.
 *
 * 50 ist der Kompromiss: weit genug, dass die App nicht behauptet, sie sei nur für
 * Jugendliche, und eng genug, dass ein Jahrgang gut 7 px bekommt. **Beide Zahlen
 * ändern nichts an den Daten** — ein Jahrgang außerhalb bleibt gültig, er ist nur mit
 * diesem Regler nicht einstellbar.
 */
export const MINDESTALTER = 14;
export const HOECHSTALTER = 50;

/** Das laufende Jahr — als Funktion, damit Tests und der Prototyp dasselbe sehen. */
export function jetztJahr(jetzt: Date = new Date()): number {
  return jetzt.getFullYear();
}

/** Der ÄLTESTE wählbare Jahrgang (die kleinste Zahl). */
export function jahrgangMin(jetzt: Date = new Date()): number {
  return jetztJahr(jetzt) - HOECHSTALTER;
}

/** Der JÜNGSTE wählbare Jahrgang (die größte Zahl). */
export function jahrgangMax(jetzt: Date = new Date()): number {
  return jetztJahr(jetzt) - MINDESTALTER;
}

/**
 * Was am PROFIL steht — Ians Entscheidung 30 vom 2026-09-05.
 *
 *   'jahrgang' — „Jahrgang 2009". Seine Wahl.
 *   'alter'    — „17 Jahre", ausgerechnet. Dasselbe Wissen, nur direkter.
 *   'band'     — weiter ein grobes Band („14–17"), der Jahrgang nur zum Filtern.
 *                Hätte am wenigsten preisgegeben und dafür zwei Wahrheiten über
 *                dasselbe Feld nebeneinandergestellt.
 *
 * Der Haken, den er kennt: Aus einem Jahrgang rechnet jeder Fremde das Alter aus.
 * Bei einer App mit 16-Jährigen hängt das an PLAN.md, Abschnitt 8, Punkt 1. Die
 * Korrektur ist dieses eine Wort — deshalb steht es hier und nicht im Screen.
 */
export const JAHRGANG_ANZEIGE: 'jahrgang' | 'alter' | 'band' = 'jahrgang';

/** Wie alt jemand mit diesem Jahrgang dieses Jahr WIRD. */
export function alterAusJahrgang(jahrgang: number, jetzt: Date = new Date()): number {
  return jetztJahr(jetzt) - jahrgang;
}

/**
 * Was am Profil einer Person steht.
 *
 * Geht über `JAHRGANG_ANZEIGE`, damit Ians Entscheidung an EINER Stelle umkehrbar
 * bleibt. `'band'` rechnet die alten drei Bänder aus dem Jahrgang zurück — nicht als
 * Nostalgie, sondern damit die verworfene Möglichkeit ein echter Rückweg ist und
 * nicht bloß ein Kommentar.
 */
export function alterAmProfil(jahrgang: number, jetzt: Date = new Date()): string {
  if (JAHRGANG_ANZEIGE === 'jahrgang') return `Jahrgang ${jahrgang}`;
  const alter = alterAusJahrgang(jahrgang, jetzt);
  if (JAHRGANG_ANZEIGE === 'alter') return `${alter} Jahre`;
  if (alter <= 17) return '14–17';
  if (alter <= 25) return '18–25';
  return '26+';
}

/**
 * Eine Jahrgangs-Spanne als Text: „2009–2012" · „ab 2009" · „2009".
 *
 * Halbgeviertstrich, kein Bindestrich — das ist die richtige Form für einen Bereich.
 * (Die alte Tabelle hatte dafür Wert und Beschriftung getrennt; hier fällt das weg,
 * weil eine Zahl keine Schreibweise hat.)
 */
export function spanneText(vonJahrgang: number, bisJahrgang: number, jetzt: Date = new Date()): string {
  if (vonJahrgang === bisJahrgang) return `${vonJahrgang}`;
  if (vonJahrgang <= jahrgangMin(jetzt)) return `bis ${bisJahrgang}`;
  if (bisJahrgang >= jahrgangMax(jetzt)) return `ab ${vonJahrgang}`;
  return `${vonJahrgang}–${bisJahrgang}`;
}

/**
 * Was an einer Post-KARTE steht — oder nichts.
 *
 * `null` bei `egal`, und das ist der Sinn der Funktion: Ein Post „für alle" ist der
 * Normalfall, und der Normalfall braucht keine Beschriftung. Stünde an jeder zweiten
 * Karte „Für alle", wäre die Angabe dort, wo sie wirklich etwas sagt, nicht mehr zu
 * sehen — sie ginge im eigenen Rauschen unter.
 */
export function alterAmPost(alter: PostAlter, jetzt: Date = new Date()): string | null {
  if (alter.kind === 'egal') return null;
  return `Jg. ${spanneText(alter.vonJahrgang, alter.bisJahrgang, jetzt)}`;
}

/** Was im DETAIL steht, wo Platz für einen ganzen Satz ist. */
export function alterAmDetail(alter: PostAlter, jetzt: Date = new Date()): string {
  if (alter.kind === 'egal') return ALLE_LABEL;
  return `Jahrgang ${spanneText(alter.vonJahrgang, alter.bisJahrgang, jetzt)}`;
}

/** Beim Posten: „Für wen ist das?" */
export const ALLE_LABEL = 'Für alle';
/** Im Feed-Filter: der Verzicht des Suchenden auf eine Angabe. */
export const FILTER_EGAL = 'Alter egal';

/**
 * Wie weit die vorgeschlagene Spanne um den eigenen Jahrgang reicht.
 *
 * Der Wert ist ein VORSCHLAG, keine Regel: Er steht nur da, wenn jemand den Regler
 * das erste Mal einschaltet, und ist danach frei verschiebbar. Das ist der
 * Unterschied zu `ALTER_REGEL` in `features/posts/filter.ts` — dort steht, was der
 * Filter TUT.
 *
 * Warum nicht die volle Spanne als Vorschlag: Dann nähme der Filter im ersten Moment
 * nichts weg, die Zahl am Filter-Knopf zählte trotzdem einen mit, und man suchte den
 * Filter, der angeblich aktiv ist. Warum nicht null (nur der eigene Jahrgang): Bei
 * wenigen Posts ist das fast immer leer — dieselbe Falle, die `ALTER_REGEL` vermeidet.
 */
export const UMGEBUNG_JAHRE = 3;

/** Eine Spanne rund um einen Jahrgang, an den Grenzen des Reglers abgeschnitten. */
export function spanneUmJahrgang(
  jahrgang: number,
  jetzt: Date = new Date(),
): { vonJahrgang: number; bisJahrgang: number } {
  return {
    vonJahrgang: Math.max(jahrgang - UMGEBUNG_JAHRE, jahrgangMin(jetzt)),
    bisJahrgang: Math.min(jahrgang + UMGEBUNG_JAHRE, jahrgangMax(jetzt)),
  };
}
