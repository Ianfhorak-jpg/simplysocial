import { tageEntfernt } from '@/lib/zeit';
import type { AgeGroup, Post } from '@/types/models';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WONACH MAN IM FEED FILTERN KANN
 *  Phase 15 · Ians Entscheidung vom 2026-09-02 (PLAN.md, Abschnitt 6, Punkt 13)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Leopolds Rückmeldung nach dem Durchklicken: „man kann nicht so genau filtern, was
 * ein Problem wird, wenn es viele Anfragen gibt." Sein Vorschlag waren Hashtags.
 * Gebaut wurden stattdessen vier Filter: **Bezirk · Wann · Altersgruppe · Suche**.
 *
 * Warum nicht Hashtags (die Begründung gehört hierher, weil hier jemand nachschaut,
 * der sie wieder einbauen will):
 *   · Drei der vier Filter brauchen KEINE neuen Daten — Bezirk, Startzeit und die
 *     neue Altersgruppe stehen ohnehin an jedem Post. Hashtags müsste jemand tippen,
 *     und zwar beim Posten, wo Phase 12 die Felder gerade von zehn auf zwei gekürzt
 *     hat.
 *   · Zwei Ordnungssysteme nebeneinander — sechs feste Kategorien UND freie Tags —
 *     verwirren mehr, als sie helfen. Die sechs Farben der App hängen an den
 *     Kategorien; freie Tags hätten keine.
 * **Falls die Filter Leopolds Problem nicht lösen, kommen Hashtags zurück auf den
 * Tisch.** Das ist keine Ablehnung für immer, sondern eine Reihenfolge.
 *
 * ── Warum die Regeln hier stehen und nicht im Feed-Screen ─────────────────────
 * Dieselbe Trennung wie bei `sort.ts`, `lifecycle.ts` und `wisch.ts`: Der Screen
 * zeigt Pillen und hält den Zustand, die BEDEUTUNG einer Pille steht hier. Sonst
 * lebt die Antwort auf „was heißt eigentlich diese Woche?" in einem `useState`
 * mitten in 550 Zeilen Oberfläche — und beim nächsten Umbau ist sie weg.
 *
 * Alle Funktionen hier sind rein: Post rein, ja/nein raus. Kein Zugriff auf den
 * Speicher, keine Hooks, kein `new Date()` ohne übergebenes `jetzt`. So kann der
 * Feed sie in einer Schleife aufrufen, ohne dass jemand über Kosten nachdenkt.
 */

// ── Wann ─────────────────────────────────────────────────────────────────────

/**
 * Das Zeitfenster. `egal` ist die Voreinstellung und heißt „alles, was im Feed
 * ohnehin gerade aktuell ist" — der Filter nimmt dann gar nichts weg.
 */
export type WannFilter = 'egal' | 'heute' | 'morgen' | 'woche';

export const WANN_LABELS: Record<WannFilter, string> = {
  egal: 'Wann egal',
  heute: 'Heute',
  morgen: 'Morgen',
  woche: 'Diese Woche',
};

export const WANN_ORDER: readonly WannFilter[] = ['egal', 'heute', 'morgen', 'woche'];

/** Wie weit „Diese Woche" reicht: heute plus sechs Tage — dieselben sieben Tage,
 *  die man beim Posten auswählen kann (`TAGE_VORAUS` in `app/create.tsx`). */
const WOCHE_TAGE = 6;

/**
 * Passt der Post ins gewählte Zeitfenster?
 *
 * ── Warum „Heute" und „Morgen" ausschließend sind, „Diese Woche" aber nicht ────
 * Wer „Morgen" tippt, meint morgen — nicht „ab morgen". Wer „Diese Woche" tippt,
 * meint alles bis Sonntag, heute eingeschlossen. Das ist nicht sauber symmetrisch,
 * aber es ist, was die Wörter im Alltag heißen; eine Regel, die stattdessen überall
 * „ab" bedeutete, müsste man erklären.
 *
 * Gerechnet wird in KALENDERTAGEN (`tageEntfernt`), nicht in Stunden. „Heute" ist
 * bis Mitternacht heute — auch um 23:50 noch. Ein 24-Stunden-Fenster hätte um 23:50
 * bis morgen abends gereicht und damit unter „Heute" Posts von morgen gezeigt.
 *
 * Negative Werte (etwas, das schon läuft) zählen zu heute: Ein Post von heute 17:00
 * ist um 17:30 immer noch „heute". Dass er überhaupt noch im Feed steht, hat vorher
 * schon `istAktuell` aus `lifecycle.ts` entschieden — dieser Filter ist ein zweites
 * Sieb, kein erstes.
 */
export function passtZurZeit(post: Post, wann: WannFilter, jetzt: Date): boolean {
  if (wann === 'egal') return true;
  const tage = tageEntfernt(post.startsAt, jetzt);
  if (wann === 'heute') return tage <= 0;
  if (wann === 'morgen') return tage === 1;
  return tage <= WOCHE_TAGE;
}

// ── Bezirk ───────────────────────────────────────────────────────────────────

/**
 * Passt der Post zum gewählten Bezirk? `null` heißt „überall", und dann passt alles.
 *
 * ── Der Fall, den man leicht übersieht ───────────────────────────────────────
 * Seit dem 2026-09-02 kann ein Post SELBST keinen Bezirk haben (`district: null`,
 * Ians Entscheidung). Filtert jemand auf „1220", fällt so ein Post heraus — und das
 * ist richtig: „Donauinsel spazieren" ohne Bezirksangabe ist kein Versprechen, dass
 * es in Floridsdorf stattfindet. Wer nach einem bestimmten Bezirk sucht, will keine
 * Posts, bei denen der Ort offen ist.
 *
 * Die Kehrseite gehört dazu: Solche Posts sind NUR unter „Überall" zu finden. Wenn
 * viele Leute das Feld leer lassen, verstecken sich die Posts vor dem Bezirksfilter.
 * Genau davor warnt der Haken in `app/create.tsx` (`BEZIRK_FREIWILLIG`) — hier ist
 * die Stelle, an der er sich auswirkt.
 */
export function passtZumBezirk(post: Post, bezirk: string | null): boolean {
  if (bezirk === null) return true;
  return post.district === bezirk;
}

// ── Altersgruppe ─────────────────────────────────────────────────────────────

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS DER ALTERS-FILTER MIT „FÜR ALLE"-POSTS MACHT
 *  Ians Entscheidung, 2026-09-02 (PLAN.md, Abschnitt 6, Punkt 18)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Die Frage klingt nach einer Zeile Code und ist die wichtigste dieser Phase: Wenn
 * jemand „18–25" wählt — sieht er dann auch die Posts, die für ALLE offen sind?
 *
 * **Ians Antwort: ja.** Ein Post „für alle" passt zu jedem Filter.
 *
 * Warum das die richtige Wahl ist: „Für alle" ist die Voreinstellung beim Posten
 * (`STANDARD.alter` in `app/create.tsx`), die meisten Posts werden sie also tragen.
 * Unter 'streng' würde der Alters-Filter ausgerechnet die offensten Posts wegwerfen
 * — man tippt auf „18–25" und der Feed schrumpft von zwölf Karten auf eine. Einen
 * Filter, der das tut, benutzt man genau einmal.
 *
 * **Den Haken kennt er:** Der Filter fühlt sich dadurch weich an. Man wählt „14–17"
 * und sieht trotzdem fast alles, weil fast alles „für alle" ist. Er wird erst
 * scharf, wenn Leute die Altersgruppe wirklich setzen — und das tun sie erst, wenn
 * es viele Posts gibt. Genau in dieser Reihenfolge ist es richtig herum.
 *
 * Verworfen, mit Begründung — als Gedächtnis, nicht als Einladung:
 *   'streng'  Nur exakte Übereinstimmung. Tut genau, was draufsteht, und löst
 *             Leopolds Problem am direktesten. Aber: bei wenigen Nutzern fast immer
 *             leer, und er belohnt Poster dafür, das Feld eng zu stellen — bei einer
 *             App, die Leute zusammenbringen soll, die falsche Richtung.
 *   'zu-mir'  Kein Band zum Auswählen, sondern EIN Schalter: „Nur, wo ich
 *             hineinpasse." Nimmt das eigene `ageGroup` vom Profil. Beantwortet die
 *             eigentliche Frage mit einem Tipp — aber man kann dann nicht mehr für
 *             jemand anderen schauen, und die App entscheidet still anhand eines
 *             Profilfelds mit.
 *
 * **Nicht ohne Rückfrage ändern.** Falls sich der Filter im Betrieb als zu weich
 * erweist, ist der Wechsel ein Wort — deshalb steht die Regel als Konstante da und
 * nicht als `if` mitten in der Funktion.
 */
export const ALTER_REGEL: 'offen' | 'streng' | 'zu-mir' = 'offen';

/**
 * Passt der Post zur gewählten Altersgruppe?
 *
 * `egal` als FILTER heißt immer „zeig alles" — das ist die Voreinstellung und keine
 * Auswahl. Nur die andere Richtung ist die Streitfrage oben: was ein Post mit
 * `ageGroup: 'egal'` unter einem gesetzten Filter tut.
 *
 * `'zu-mir'` steht bewusst nicht in dieser Funktion: Die Regel bräuchte das eigene
 * Profil, und damit wäre die Funktion nicht mehr rein. Sie käme über den Aufrufer
 * herein — der Feed setzt den Filter dann einfach auf das eigene Band. Der Screen
 * würde einen Schalter statt einer Pillenreihe zeigen; die Regel hier bliebe, wie
 * sie ist.
 */
export function passtZumAlter(post: Post, alter: AgeGroup): boolean {
  if (alter === 'egal') return true;
  if (post.ageGroup === alter) return true;
  return ALTER_REGEL !== 'streng' && post.ageGroup === 'egal';
}

// ── Freitext-Suche ───────────────────────────────────────────────────────────

/**
 * Gesucht wird in **Titel und Notiz**, sonst nirgends.
 *
 * Nicht im Namen des Verfassers: „Lea" als Suchbegriff würde dann jeden Post von Lea
 * zeigen, und aus der Aktivitätensuche würde eine Personensuche — dafür gibt es
 * Profile und den Folgen-Knopf. Nicht im Treffpunkt: Der ist oft leer und ändert
 * sich im Chat.
 */
const SUCHFELDER = (post: Post): string => `${post.title} ${post.note}`;

/**
 * Text vergleichbar machen: klein, ohne Umlaute, ohne doppelte Leerzeichen.
 *
 * ── Warum die Umlaut-Tabelle von Hand steht ──────────────────────────────────
 * Wer „fussball" tippt, muss „Fußball" finden — sonst ist die Suche für die Hälfte
 * der deutschen Wörter kaputt, und zwar auf eine Art, die niemand meldet: Man tippt,
 * es kommt nichts, man hält die App für leer.
 *
 * Der übliche Kniff dafür ist `normalize('NFD')` plus ein Regex mit
 * `\p{Diacritic}`. Beides ist im Browser in Ordnung und auf Hermes (der
 * JS-Engine von React Native) nicht verlässlich — Unicode-Property-Escapes sind
 * genau die Sorte Feature, die auf einem alten Android fehlt und dann zur Laufzeit
 * einen Fehler wirft, den man am Mac nie sieht. Sechs Ersetzungen sind langweilig
 * und funktionieren überall.
 *
 * `ß → ss` ist dabei der Grund, warum es eine Tabelle sein muss und keine
 * Zeichen-für-Zeichen-Abbildung: Aus einem Zeichen werden zwei.
 */
const UMLAUTE: readonly (readonly [RegExp, string])[] = [
  [/ä/g, 'a'],
  [/ö/g, 'o'],
  [/ü/g, 'u'],
  [/ß/g, 'ss'],
  [/é|è|ê/g, 'e'],
  [/á|à|â/g, 'a'],
];

export function normalisieren(text: string): string {
  let t = text.toLowerCase();
  for (const [muster, ersatz] of UMLAUTE) t = t.replace(muster, ersatz);
  return t.replace(/\s+/g, ' ').trim();
}

/**
 * Passt der Post zum Suchtext?
 *
 * ── Alle Wörter müssen vorkommen, aber in beliebiger Reihenfolge ──────────────
 * „tennis 1220" findet den Tennis-Post in Floridsdorf; „1220 tennis" auch. Als eine
 * einzige Zeichenkette gesucht („enthält den Text tennis 1220") fände keins von
 * beidem etwas, weil so kein Titel geschrieben ist.
 *
 * Gesucht wird nach Wortteilen, nicht nach ganzen Wörtern: „foto" findet
 * „Fotospaziergang". Im Deutschen ist das keine Kleinigkeit, sondern der halbe
 * Nutzen — die Sprache klebt Wörter zusammen, und niemand tippt das ganze.
 */
export function passtZumText(post: Post, suche: string): boolean {
  const begriffe = normalisieren(suche).split(' ').filter(Boolean);
  if (begriffe.length === 0) return true;
  const heuhaufen = normalisieren(SUCHFELDER(post));
  return begriffe.every((wort) => heuhaufen.includes(wort));
}
