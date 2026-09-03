import type { Post } from '@/types/models';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS HEISST LINKS, WAS HEISST RECHTS — UND WAS KOMMT ÜBERHAUPT IN DEN STAPEL?
 *  Ians zehnte und elfte Entscheidung, 2026-09-01 (PLAN.md, Phase 11 und
 *  Abschnitt 1, „Warum Feed statt Swipe"). Die verworfenen Möglichkeiten bleiben
 *  unten stehen — als Gedächtnis, nicht als Einladung.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ── Das Erste, bevor jemand hier etwas ändert: DER FEED BLEIBT. ───────────────
 * Das Argument von 2026-08-31 gegen das Wischen gilt weiter, Wort für Wort: Ein
 * Stapel braucht Nachschub. Bei fünfzig Leuten aus einer Schule gibt es an einem
 * Dienstag vielleicht fünf Posts — ein Stapel, der nach drei Wischern leer ist,
 * fühlt sich kaputt an; eine Liste mit fünf Einträgen fühlt sich normal an.
 *
 * Ian hat dieses Argument nicht überschrieben, sondern beantwortet: BEIDES. Der
 * Stapel steht vorn, die Liste fängt ihn auf. Ist der Stapel leer, steht dort keine
 * leere Fläche, sondern die Liste mit allem schon Gesehenen und die Aufforderung,
 * selbst zu posten. Das ist die teurere Variante, und zwar mit Absicht: Der leere
 * Dienstag ist der Moment, an dem jemand die App zum ersten Mal aufmacht und
 * entscheidet, ob sie tot ist.
 *
 * Wer diese Datei liest, um den Feed abzuschaffen, liest sie falsch herum.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  1. WAS BEDEUTET EIN WISCH NACH LINKS?
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   A. WEG FÜR DIESE SITZUNG  (`'sitzung'`)  ← Ians Wahl
 *      Der Post verlässt den Stapel und kommt nicht wieder. Ohne Backend gilt das
 *      für die Sitzung; nach dem Neuladen ist er wieder da, wie alles andere im
 *      Prototyp auch. In der LISTE steht er weiter — weggewischt heißt „nicht im
 *      Stapel", nicht „gelöscht".
 *      Haken: Nach dem Neuladen wischt man dieselben fünf Karten noch einmal weg.
 *      Mit echtem Backend ist das eine Zeile mehr (siehe unten), im Prototyp wäre
 *      es ein Speicher, den sonst nichts in dieser App benutzt.
 *
 *   B. WEG FÜR IMMER  (`'immer'`)
 *      Dasselbe, aber über das Neuladen hinaus gemerkt (`localStorage`, später eine
 *      echte Spalte am Nutzer).
 *      Haken: Ein Fehlwisch ist dann endgültig — und es gibt keinen Ort in der App,
 *      an dem man nachsehen könnte, was man alles weggewischt hat. Für einen
 *      Prototyp, der bei jedem Neuladen ohnehin von vorn anfängt, wäre das eine
 *      Endgültigkeit, die er gar nicht halten kann.
 *
 *   C. NUR NACH HINTEN  (`'nachHinten'`)
 *      Die Karte wandert unter den Stapel und kommt später wieder.
 *      Haken: Dann heißt links „nicht jetzt" statt „nein" — und der Stapel wird nie
 *      leer, sondern dreht sich im Kreis. Genau das Gefühl, das eine App bekommt,
 *      wenn man ihr nicht glaubt, dass sie fertig ist.
 *
 * ── Ians Entscheidung: A, weg für diese Sitzung. ─────────────────────────────
 * Und dazu ein Vorschlag von mir, den er streichen kann: ein kurzes „Rückgängig"
 * unten für ein paar Sekunden (`RUECKGAENGIG_MS`). Der Fehlwisch ist die häufigste
 * Beschwerde bei Wisch-Oberflächen überhaupt, und hier kostet er keine Kleinigkeit,
 * sondern eine mögliche Verabredung. Wer es nicht will: die Konstante auf 0 setzen,
 * der Screen zeigt die Leiste dann nicht mehr.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  2. WAS BEDEUTET EIN WISCH NACH RECHTS?
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   A. SOFORT ANFRAGEN, OHNE TEXT  (`'sofort'`)
 *      Rechts = „Bin dabei", die Anfrage geht ohne ein Wort raus.
 *      Haken: Der Poster entscheidet, wen er trifft — das ist das Sicherheits-
 *      versprechen dieser App. Woran soll er das festmachen, wenn zehn wortlose
 *      Anfragen untereinander stehen? Wischen wäre billig, und billig ist beim
 *      Zusagen falsch.
 *
 *   B. LEISTE MIT VORAUSGEFÜLLTEM GRUSS  (`'leiste'`)  ← Ians Wahl
 *      Die Karte fliegt raus, unten fährt eine schmale Leiste hoch: ein Textfeld,
 *      vorausgefüllt mit einem kurzen Gruß, und ein Senden-Knopf. Tippen ist
 *      freiwillig, Senden ist ein Tipp. Abbrechen legt die Karte zurück.
 *      Ians Worte: „mit einem vorgeschriebenen HEY oder so, damit wenn er keine
 *      Lust hat zu schreiben, einfach schicken kann."
 *      Haken: Ein Schritt mehr als bei A — und wenn alle den vorgeschlagenen Satz
 *      stehen lassen, steht beim Poster zehnmal derselbe. Dann ist es kein
 *      Unterscheidungsmerkmal mehr, sondern nur noch eine Bestätigung.
 *
 *   C. AUFS DETAIL SPRINGEN  (`'detail'`)
 *      Rechts öffnet den Post in voller Länge, dort steht „Bin dabei" wie bisher.
 *      Haken: Dann ist der Stapel nur eine andere Art zu blättern und der Wisch
 *      keine Antwort. Der ganze Punkt am Stapel ist, dass man entscheiden kann,
 *      ohne den Bildschirm zu wechseln.
 *
 * ── Ians Entscheidung: B, Leiste mit vorausgefülltem Gruß. ───────────────────
 * Der Poster bekommt einen Satz, an dem er sich festhalten kann, und wer nichts
 * schreiben will, muss trotzdem nichts schreiben.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  3. WAS GAR NICHT ERST IN DEN STAPEL KOMMT
 * ═══════════════════════════════════════════════════════════════════════════════
 * Eigene Posts, Posts mit schon gestellter Anfrage, volle Posts, schon Weggewischtes.
 * (Blockierte Personen sind hier nicht aufgeführt, weil sie schon vorher weg sind —
 * `useFeed` wirft sie raus, und der Stapel liest aus demselben Feed. Zweimal
 * dieselbe Prüfung wäre zweimal die Chance, sie unterschiedlich zu ändern.)
 *
 * Der Grund für die Strenge: Im Stapel ist jede Karte eine Frage, die beantwortet
 * werden will. Eine Karte, auf die es nichts zu antworten gibt, ist Arbeit ohne
 * Ergebnis. In der LISTE bleibt dasselbe alles sichtbar — dort ist Vollständigkeit
 * richtig, weil man dort schaut und nicht entscheidet.
 */

/** Links oder rechts. Mehr Richtungen gibt es nicht — hoch und runter sind Scrollen. */
export type WischRichtung = 'links' | 'rechts';

/** Was ein Wisch auslöst. Die drei mal drei Möglichkeiten stehen im Kopf dieser Datei. */
export interface WischWirkung {
  links: 'sitzung' | 'immer' | 'nachHinten';
  rechts: 'sofort' | 'leiste' | 'detail';
}

/** Ians Wahl, 2026-09-01. */
export const SITZUNG_UND_GRUSS: WischWirkung = { links: 'sitzung', rechts: 'leiste' };

/** Die schnelle Variante: wischen ist alles, nichts fragt nach. */
export const SCHNELL: WischWirkung = { links: 'immer', rechts: 'sofort' };

/** Die vorsichtige Variante: der Stapel blättert nur, entschieden wird im Detail. */
export const NUR_BLAETTERN: WischWirkung = { links: 'nachHinten', rechts: 'detail' };

/**
 * Die Regel, die gilt. Der Rest der App liest nur diesen einen Wert.
 *
 * Umstellen ist ein Wort — aber `'immer'` braucht zusätzlich einen Speicher in
 * `wegwischen()` (`posts/hooks.ts`) und `'nachHinten'` eine Warteschlange statt einer
 * Liste. **Nicht ohne Rückfrage.**
 */
export const WISCH_WIRKUNG: WischWirkung = SITZUNG_UND_GRUSS;

// ── Wann ein Zug als Wisch zählt ─────────────────────────────────────────────

/**
 * Ab welchem Anteil der Kartenbreite ein Zug den Stapel verlässt.
 *
 * 0,28 ist gemessen und nicht geraten: Darunter (0,15) löst schon das Anfassen der
 * Karte aus, darüber (0,45) muss man am Handy mit dem Daumen quer über den halben
 * Bildschirm — das geht mit einer Hand nicht mehr. Bis zur Schwelle passiert nichts
 * Endgültiges: Loslassen federt zurück.
 */
export const SCHWELLE = 0.28;

/**
 * Die Breite, mit der gerechnet wird, solange NICHTS gemessen werden kann.
 *
 * **Der Wert ist fast egal — dass er nicht 0 ist, ist der ganze Punkt.** Beim
 * Web-Export gibt es kein Fenster: `useWindowDimensions()` liefert 0, und `onLayout`
 * hat noch nie gefeuert. Ohne diesen Rückfall ist die Kartenbreite dort 0, und damit
 * wird jeder `inputRange` in `WischKarte` zu `[-0, 0, 0]` — eine Spanne der Breite
 * null. React Native gibt dann den ERSTEN Ausgabewert zurück statt den mittleren:
 * Die Karte liegt mit -16° schief und ist um 1,02 angehoben, als hielte man sie
 * gerade in der Hand.
 *
 * Das Bittere daran ist, dass es sich nicht von selbst repariert. Nach dem Start
 * wird die Karte gemessen und die Interpolation neu gebaut — aber eine
 * `AnimatedInterpolation` schreibt nur dann in den DOM, wenn ihr EINGANGSWERT sich
 * ändert. `pan.x` bleibt 0, bis jemand die Karte anfasst. Bis dahin steht der
 * Bau-Zustand da. Genau das hat Ian am 2026-09-03 gemeldet („warum ist die so
 * komisch gedreht"), und genau deshalb hat die Abdeckung aus Phase 13 es nicht
 * behoben: Die verdeckt den ersten Bildaufbau, sie repariert ihn nicht.
 *
 * 320 ist ein schmales Handy. Falls der Wert wider Erwarten stehen bleibt, ist die
 * Schwelle dadurch ~90 px — streng, aber bedienbar. Eine 1 wäre auch „nicht 0",
 * würde im Stehenbleiben aber jede Berührung als Wisch zählen.
 */
export const NOTBREITE = 320;

/**
 * Ein schneller Schnipser zählt auch dann, wenn er die Schwelle nicht erreicht.
 *
 * Ohne das fühlt sich der Stapel zäh an: Man schnippt die Karte kurz und kräftig zur
 * Seite — die eigentlich gemeinte Geste — und sie federt zurück, weil der Finger nur
 * 60 Pixel weit kam. Der Wert ist Pixel pro Millisekunde, wie React Native ihn liefert.
 */
export const SCHWUNG = 0.55;

/** Wie weit die Karte beim Ziehen kippt. Ians Bild: ein Post-it, das man abreißt. */
export const MAX_KIPPUNG_GRAD = 8;

/** Wie viele Karten man gleichzeitig sieht — die hinteren kleiner und versetzt. */
export const SICHTBARE_KARTEN = 3;

/**
 * Wie lange „Rückgängig" nach einem Wisch nach links stehen bleibt (Millisekunden).
 * Mein Vorschlag, siehe Kopf. **0 schaltet die Leiste ab.**
 */
export const RUECKGAENGIG_MS = 6000;

// ── Was in den Stapel kommt ──────────────────────────────────────────────────

/**
 * Was die Regel über den Betrachter wissen muss.
 *
 * `istOffen` wird HINEINGEREICHT und nicht importiert — genau wie `jetzt` in
 * `SortKontext`. Der Grund ist hier aber nicht nur Testbarkeit: `posts/hooks.ts`
 * importiert diese Datei, und würde diese Datei zurückimportieren, stünde ein Ring
 * zwischen Regel und Haken. Die Antwort trotzdem selbst auszurechnen wäre die
 * schlechtere Lösung — dann gäbe es zwei Stellen, an denen steht, wann ein Post
 * offen ist, und eines Tages sagen sie Verschiedenes.
 */
export interface StapelKontext {
  ichId: string;
  /** Aus `istOffen()` in `posts/hooks.ts` — die eine Wahrheit dazu. */
  istOffen: (post: Post) => boolean;
  /** Post-IDs, auf die ich schon eine Anfrage gestellt habe (auch abgelehnte). */
  angefragt: ReadonlySet<string>;
  /** Post-IDs, die ich in dieser Sitzung nach links gewischt habe. */
  weggewischt: ReadonlySet<string>;
}

/**
 * Kommt dieser Post in den Stapel? Die vier Gründe stehen im Kopf, Abschnitt 3.
 *
 * Abgelehnte Anfragen zählen bewusst als „angefragt": Wer einmal abgesagt hat, soll
 * nicht am nächsten Tag wieder ganz oben auf dem Stapel liegen. Die Karte im Feed
 * blendet die Absage nach einer Weile aus (`PostCard`) — der Stapel bietet sie gar
 * nicht erst noch einmal an.
 */
export function gehoertInDenStapel(post: Post, ctx: StapelKontext): boolean {
  if (post.authorId === ctx.ichId) return false;
  if (ctx.angefragt.has(post.id)) return false;
  if (ctx.weggewischt.has(post.id)) return false;
  return ctx.istOffen(post);
}

/**
 * Der Gruß, der in der Antwort-Leiste schon drinsteht.
 *
 * Steht hier bei der Regel und nicht im Baustein: Er ist Teil der Entscheidung
 * „rechts = Leiste mit vorausgefülltem Text" und nicht Gestaltung. Wenn Ian den Satz
 * ändern will, ändert er ihn an dieser einen Stelle.
 *
 * Nur der Vorname, nicht der Anzeigename: „Hey Lea Berger!" liest sich wie ein Brief
 * von der Bank. Und ein Ausrufezeichen statt eines Punktes, weil der Satz sonst
 * pflichtschuldig klingt — er soll klingen, als hätte man ihn selbst getippt.
 *
 * ── Warum das 🙌 in Phase 14 weggefallen ist ─────────────────────────────────
 * Es war das einzige Emoji, das die App einem Menschen in den Mund gelegt hat. Der
 * Haken an diesem Satz steht schon oben in der Datei: Lassen alle den Vorschlag
 * stehen, liest der Poster zehnmal dasselbe. Zehnmal derselbe Satz MIT demselben
 * Emoji ist genau das, was Christoph mit „schaut nach AI aus" gemeint hat.
 *
 * Emojis, die eine Person selbst tippt, bleiben davon unberührt — in `data/mock.ts`
 * schreibt Lea weiter „Cool, freut mich! 🎾". Das ist keine Oberfläche, das ist
 * jemand, der schreibt.
 */
export function grussVorschlag(anzeigename: string): string {
  const vorname = anzeigename.trim().split(' ')[0];
  return vorname ? `Hey ${vorname}! Bin dabei` : 'Hey! Bin dabei';
}
