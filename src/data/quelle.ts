/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS DASTEHT, WENN DIE DATEN NICHT KOMMEN
 *  Phase 20.4-b. Ians 43. Entscheidung, vom 2026-09-12.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Dieselbe Bauart wie `safety/block.ts` (harte Regel 17), `groups/gruppe.ts` (32),
 * `requests/kollision.ts` (46), `posts/standort.ts` (68) und
 * `auth/anmeldung.ts` (69): Screens lesen `LADE_FEHLER` nie, sie sehen nur das
 * Ergebnis, und die Sätze kommen aus `ladeFehlerFolgen()`.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DIE FRAGE — und warum sie überhaupt eine ist
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * `supabase-js` WIRFT NICHT. Es gibt `{ data, error }` zurück, und `data` ist im
 * Fehlerfall `null`. Der naheliegende Griff `data ?? []` macht aus **jedem**
 * Fehler — Netz weg, Token abgelaufen, Tabelle umbenannt — eine leere Liste. Und
 * eine leere Liste sagt in dieser App:
 *
 *     „Noch nichts los in deinem Feed"
 *
 * Das ist ein Satz, der lügt. **„Hier ist nichts" und „ich komme nicht dran" sind
 * zwei Lagen, und nur eine davon kann man beheben.** Dieselbe Familie wie der
 * unsichtbare Startbildschirm vom 2026-09-11 (weißes Logo auf Papierweiß): Ein
 * Fehler, der nur als ABWESENHEIT auftritt, überlebt jeden Typecheck und jeden
 * grünen Lauf, weil niemand hinsehen muss.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DREI MÖGLICHKEITEN — Ians Wahl ist A
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   A. VOLLBILD-KASTEN mit „Nochmal versuchen"  ← **seine Wahl**
 *      Die App zeigt keinen Feed, sondern sagt, was los ist. Unübersehbar, und
 *      der Ausweg steht daneben.
 *      **Der Haken, den er kennt:** Wer im U-Bahn-Tunnel aufmacht, sieht von der
 *      App gar nichts — auch nicht die Chats, die er vorhin gelesen hat. Das wird
 *      erst mit einem Speicher besser (20.3-b bringt `expo-secure-store` und
 *      `AsyncStorage` mit), und dann ist B die naheliegende Nachbesserung.
 *
 *   B. LEISE ZEILE über dem Feed  (verworfen)
 *      Näher an Entscheidung 50 — der Bildschirm bleibt der, weswegen man
 *      gekommen ist. Verloren hat sie an ihrer eigenen Stärke: Ein LEERER Feed
 *      mit einem schmalen Streifen darüber sieht auf den ersten Blick immer noch
 *      aus wie „nichts los", und genau das soll er nicht.
 *
 *   C. RÜCKFALL AUF `mock.ts`  (gar nicht erst angeboten, und der Grund gehört
 *      aufgeschrieben)
 *      Technisch der bequemste Weg — und der einzige, der WIRKLICH schadet: Er
 *      zeigt einem echten Menschen erfundene Leute mit erfundenen Verabredungen,
 *      ohne dass irgendwo steht, dass sie erfunden sind. Harte Regel 12 verbietet
 *      Persönliches in den Fake-Daten; hier wäre die Fälschung die Funktion.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS DER TEXT NICHT SAGEN DARF
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Keinen Tabellennamen, keinen Fehlercode, keinen Pfad. Am 2026-09-03 stand eine
 * Entwickler-Notiz im gerenderten Text der Nutzungsbedingungen, auf einer
 * öffentlich abrufbaren Adresse — in einem Kommentar sind Backticks Konvention,
 * in JSX-Text sind sie ein sichtbarer Fehler. **Der `code` gehört in die Konsole
 * (`LadeFehler` trägt ihn), nicht auf den Bildschirm.**
 */

import type { LadeFehler } from '@/data/laden';

/**
 * Ians 43. Entscheidung — **und seit dem 2026-09-12 abends seine 49.** Nicht ohne
 * Rückfrage ändern.
 *
 * ── Was sich geändert hat, und warum es kein Widerspruch ist ─────────────────
 * Hier stand `'vollbild' | 'zeile'` als EINE Wahl für alle Fälle, auf `'vollbild'`,
 * mit dem Satz: *„`'zeile'` ist die Nachbesserung, sobald es etwas zu zeigen gibt,
 * was schon da war."* **Dieser Augenblick ist eingetreten** — mit `'nachladen'`
 * (siehe unten) gibt es zum ersten Mal einen Ladevorgang, bei dem schon etwas
 * dasteht. Ians Entscheidung 49 beantwortet genau diese Frage, und sie beantwortet
 * sie so, wie Entscheidung 43 es vorgezeichnet hatte:
 *
 *   `'vollbild-dann-zeile'`  ← **seine Wahl**
 *      ERSTES Laden ohne Netz → der Vollbild-Kasten. Dort steht wirklich nichts, und
 *      ein leerer Feed mit einem Streifen darüber sieht immer noch aus wie „nichts
 *      los" — das ist Entscheidung 43, unverändert gültig.
 *      NACHladen ohne Netz → eine leise Zeile. Die Chats von vorhin bleiben lesbar.
 *      **Der Haken, den er kennt:** Was dasteht, ist dann nicht mehr taufrisch, und
 *      die Zeile ist das Einzige, was das sagt.
 *
 *   `'immer-vollbild'`  (die alte Fassung, verworfen)
 *      Man kann sich nie irren, was alt ist und was frisch. Verloren hat sie an
 *      ihrem eigenen Haken aus Entscheidung 43: **Jeder kurze Netzaussetzer räumt
 *      den Bildschirm leer, obwohl alles noch im Speicher liegt** — „Wer im
 *      U-Bahn-Tunnel aufmacht, sieht von der App gar nichts."
 */
export const LADE_FEHLER: 'immer-vollbild' | 'vollbild-dann-zeile' = 'vollbild-dann-zeile';

// ═════════════════════════════════════════════════════════════════════════════
//  ERSTES LADEN oder NACHLADEN — und warum das zwei Lagen sind
//  Gemessen am 2026-09-12 beim ersten Durchgang mit echten Daten.
// ═════════════════════════════════════════════════════════════════════════════
//
// Bis heute kannte `LadeStand` drei Lagen, und `app/_layout.tsx` fragte
// `laden.zustand === 'laeuft' ? null : <Stack/>`. Das war richtig, solange es
// nur EINEN Ladevorgang gab: den ersten. Dort steht wirklich nichts da, und ein
// Feed mit neun leeren Listen sagt „Noch nichts los in deinem Feed" — der Satz,
// den Entscheidung 43 verbietet.
//
// **Seit 20.5 lädt die App NACH — nach jedem der 22 Schreibvorgänge und nach
// jedem Realtime-Anstoß.** Und dann steht alles schon da. Gemessen, was die alte
// Frage in dieser Lage anrichtet:
//
//     Ian steht auf `/post/…` und rührt sich nicht. Lea schreibt in einen ganz
//     anderen Chat. Der Bildschirm wird für ~240 ms LEER (Textlänge 204 → 12),
//     `expo-router` baut den Navigator ab, schreibt die Adresse auf
//     `/account-loeschen` (alphabetisch die erste Route unter `app/`) und dann
//     auf `/` — und Ian steht auf dem Startbildschirm, ohne etwas getan zu haben.
//
// Das ist die Falle aus Phase 20.3-a an einer zweiten Stelle: **Wer einen
// Navigator bedingt zeichnet, baut ihn bei jeder Zustandsänderung ab.** Damals
// beim Abmelden, einmal je Sitzung; jetzt bei jeder fremden Nachricht.
//
// **Und die richtige Frage stand schon in der Datei** — drei Zeilen über der
// Stelle, die sie nicht stellt, im Kommentar an `useStartFlaecheWeg`:
//
//     Die Frage ist nicht „sind die Daten da?", sondern „steht etwas zum
//     Anschauen?"
//
// Dasselbe Muster wie harte Regel 73: Eine Regel, deren GRUND wegfällt,
// hinterlässt ihre Wirkung.

/**
 * Die vier Lagen beim Laden — als Wörter, damit `store.ts` und `_layout.tsx`
 * dieselben meinen.
 *
 * `'laeuft'` heißt **es war noch nie etwas da** (der Start, und nach dem
 * Abmelden). `'nachladen'` heißt **es steht etwas da und wird aufgefrischt** —
 * das ist der Unterschied, um den es geht, und es ist dieselbe Unterscheidung
 * wie `'unbekannt'` gegen `'aus'` bei `Sitzung` (harte Regel 77) und wie
 * „kommt noch" gegen „ist nichts" bei Entscheidung 43.
 */
export type LadeZustand = 'laeuft' | 'nachladen' | 'da' | 'fehler' | 'fehler-nachladen';

/**
 * Was die Bühne in `app/_layout.tsx` zeichnet.
 *
 * `'app-mit-zeile'` ist Ians Entscheidung 49: die App, und darüber ein schmaler
 * Streifen, der sagt, dass der Stand nicht mehr frisch ist.
 */
export type LadeSicht = 'nichts' | 'app' | 'fehler' | 'app-mit-zeile';

/**
 * Was beim Laden auf dem Bildschirm steht — **erschöpfend, mit `never`.**
 *
 * ── Warum eine Funktion und nicht ein `!==` im Layout ────────────────────────
 * Ein viertes Glied an `LadeZustand` ist eine LOCKERUNG, und die Phase-16-Lehre
 * sagt dazu das Unangenehme: **`tsc` meldet null Stellen.** `laden.zustand ===
 * 'laeuft' ? null : <Stack/>` bleibt gültiger Code, und `'nachladen'` fiele
 * still in den richtigen Zweig — richtig aus Versehen, nicht aus Entwurf. Beim
 * nächsten Glied ist das Versehen dann falsch, und niemand merkt es.
 *
 * Also entsteht die Enge hier, genau wie bei `torwaechterZeigt()`: Wer
 * `LadeZustand` erweitert, bekommt an dieser Stelle einen Typfehler statt eines
 * stillen Bildschirms.
 *
 * ── Warum es ZWEI Fehler-Glieder gibt und nicht eines mit einem Merkmal ──────
 * `'fehler'` heißt „es ist nichts da und es kommt nichts", `'fehler-nachladen'`
 * heißt „es steht etwas da, es ist nur nicht mehr frisch". Das sind zwei Lagen mit
 * zwei Antworten (Ians Entscheidung 49), und als zwei GLIEDER zwingt der Compiler
 * jede Stelle, beide zu beantworten. Ein `{ zustand: 'fehler'; hatteDaten: boolean }`
 * wäre dasselbe zum Vergessen — dieselbe Überlegung wie bei `Visibility` (harte
 * Regel 31) und `SchreibStand`.
 */
export function ladeSichtFuer(zustand: LadeZustand): LadeSicht {
  switch (zustand) {
    case 'laeuft':
      // Nichts. Auf Web deckt `#ss-start` aus `+html.tsx`, auf Native der Splash.
      return 'nichts';
    case 'nachladen':
      // **Der Bildschirm bleibt stehen.** Es ist etwas zum Anschauen da, und eine
      // Auffrischung im Hintergrund ist kein Grund, es wegzunehmen (Entscheidung 50).
      return 'app';
    case 'da':
      return 'app';
    case 'fehler':
      // Erstes Laden gescheitert: Es gibt nichts zu behalten. Entscheidung 43.
      return 'fehler';
    case 'fehler-nachladen':
      // Ians Entscheidung 49. `'immer-vollbild'` ist die verworfene Möglichkeit und
      // steht als Wert da, damit man sie ausprobieren kann, ohne etwas umzubauen —
      // nicht als Einladung.
      return LADE_FEHLER === 'vollbild-dann-zeile' ? 'app-mit-zeile' : 'fehler';
    default: {
      const nie: never = zustand;
      return nie;
    }
  }
}

/**
 * Steht gerade etwas auf dem Bildschirm, das ein Nachladen NICHT wegnehmen darf?
 *
 * ── Warum abgeleitet und nicht ein zweiter `switch` ──────────────────────────
 * Zwei erschöpfende `switch` über dasselbe Union wären zwei Wahrheiten, die
 * auseinanderlaufen können — genau das, wogegen `PROJEKTION` (harte Regel 53) und
 * der eine Schalter `ANMELDE_QUELLE` (74) gebaut sind. Es zählt, was die Bühne
 * WIRKLICH zeichnet, und das sagt `ladeSichtFuer()`.
 *
 * Damit stimmt es auch in der verworfenen Fassung: Steht `LADE_FEHLER` auf
 * `'immer-vollbild'`, ist bei `'fehler-nachladen'` der Kasten oben und darunter
 * nichts zu erhalten — dann darf das nächste Laden wieder `'laeuft'` sein.
 */
export function stehtSchonEtwas(zustand: LadeZustand): boolean {
  const sicht = ladeSichtFuer(zustand);
  return sicht === 'app' || sicht === 'app-mit-zeile';
}

/**
 * Was in der leisen Zeile steht — Ians Entscheidung 49.
 *
 * ── Warum kurz und warum ohne Titel ──────────────────────────────────────────
 * Der Vollbild-Kasten hat Platz für Titel, Satz und Knopf, weil er der ganze
 * Bildschirm ist. Die Zeile liegt über dem, weswegen man gekommen ist — harte
 * Regel 63 verlangt dort eine Begründung für jedes Wort. Es bleiben zwei Auskünfte:
 * **dass der Stand alt ist** (sonst hält man ihn für frisch) und **dass man etwas
 * tun kann**.
 *
 * Und wieder kein Fehlercode und kein Tabellenname (der Fund vom 2026-09-03) — der
 * `code` steht im `LadeFehler` und gehört in die Konsole.
 */
export function ladeZeileFolgen(fehler: LadeFehler): {
  text: string;
  knopf: string;
} {
  // Dieselbe Unterscheidung wie in `ladeFehlerFolgen()`: Eine abgelaufene Anmeldung
  // ist kein Netzproblem, und „Nochmal versuchen" wäre dort eine Schleife.
  if (fehler.code === '42501' || fehler.code === 'PGRST301') {
    return { text: 'Du bist nicht mehr angemeldet.', knopf: 'Anmelden' };
  }
  return { text: 'Kein Netz — du siehst den letzten Stand.', knopf: 'Nochmal' };
}

/**
 * Was auf dem Bildschirm steht, wenn nichts kommt.
 *
 * ── Warum das eine Funktion ist und keine drei Konstanten ────────────────────
 * Weil ein Fall anders lautet als die anderen, und man ihn NICHT verwechseln darf:
 * `42501` heißt, dass die Datenbank den Zugriff verweigert hat — die Policies haben
 * getan, wofür sie da sind, und die Ursache ist fast immer eine abgelaufene
 * Anmeldung. „Prüf dein Internet" wäre dort falsch beraten und schickt jemanden
 * eine Viertelstunde zum Router.
 *
 * Dieselbe Unterscheidung, die harte Regel 57 von einer PRÜFUNG verlangt („ist
 * fehlgeschlagen" ist zu wenig, es braucht den `SQLSTATE`) — hier für den Menschen
 * davor statt für den Prüfstand.
 */
export function ladeFehlerFolgen(fehler: LadeFehler): {
  titel: string;
  text: string;
  knopf: string;
  /** `true`, wenn ein neuer Versuch die Lage gar nicht ändern kann. */
  anmeldenNoetig: boolean;
} {
  if (fehler.code === '42501' || fehler.code === 'PGRST301') {
    return {
      titel: 'Du bist nicht mehr angemeldet',
      text: 'Melde dich noch einmal an, dann ist alles wieder da.',
      knopf: 'Anmelden',
      anmeldenNoetig: true,
    };
  }
  return {
    titel: 'Keine Verbindung',
    text: 'Wir kommen gerade nicht an deine Aktivitäten. Das liegt meistens am Netz.',
    knopf: 'Nochmal versuchen',
    anmeldenNoetig: false,
  };
}
