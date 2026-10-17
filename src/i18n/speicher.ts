/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DIE GEMERKTE SPRACHE — Web-Zweig
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Ein Wert je App, nicht ein Ja/Nein je Schlüssel.
 *
 * ── Warum das NICHT in `lib/merker.ts` steht ─────────────────────────────────
 * Zwei Gründe, und der zweite ist der eigentliche:
 *
 *   1. **Der Merker kann es technisch nicht.** `merkerGesehen()` gibt einen
 *      Wahrheitswert zurück und `merkerSetzen()` schreibt die `'1'` — es gibt dort
 *      keinen Weg, `'de'` oder `'en'` abzulegen. Man müsste ihn erweitern.
 *   2. **Der Merker bedeutet auf den zwei Plattformen ABSICHTLICH Verschiedenes**
 *      (Ians Entscheidung 57, harte Regel 97): im Web die Tab-Sitzung, am Gerät für
 *      immer. Für „hat die Anleitungskarte gesehen" ist dieser Unterschied
 *      begründet. **Für eine Sprachwahl wäre er ein Fehler** — wer Englisch wählt,
 *      will beim nächsten Öffnen nicht wieder Deutsch lesen, und zwar im Browser
 *      genauso wie am iPhone. Die Sprache in den Merker zu legen hieße, seine
 *      Bedeutung zu verbiegen, damit ein zweiter Zweck hineinpasst.
 *
 * Deshalb hier `localStorage` und nicht `sessionStorage` — der eine bewusste
 * Unterschied zum Merker, und der ganze Grund für eine eigene Datei.
 *
 * ── Warum Plattform-ENDUNG und kein `Platform.OS`-Zweig ─────────────────────
 * Dieselbe Begründung wie bei `merker.ts` und `sitzungsspeicher.ts`: `AsyncStorage`
 * wird beim LADEN nativ. Ein Zweig in EINER Datei zöge es ins Web-Bündel.
 * `pruef-plattform` vergleicht die Namen der beiden Hälften — sie müssen gleich
 * bleiben.
 *
 * ── Warum das Ergebnis ein `Promise` ist, obwohl der Browser sofort antwortet ─
 * Weil der andere Zweig es nicht kann. Eine Signatur, die auf einer Plattform
 * synchron ist und auf der anderen nicht, wäre zwei Funktionen mit einem Namen.
 */
import type { Sprache } from './sprachen';
import { istSprache } from './sprachen';

const SCHLUESSEL = 'ss_sprache';

/**
 * Die gemerkte Handauswahl — oder `null`, wenn noch keine getroffen wurde.
 *
 * **`null` heißt „nie gewählt" und nicht „Deutsch".** Der Unterschied trägt:
 * Nur bei `null` darf die Gerätesprache entscheiden. Stünde hier ein Ersatzwert,
 * wäre die automatische Erkennung für immer tot — sie bekäme nie eine Gelegenheit.
 */
export async function spracheLesen(): Promise<Sprache | null> {
  try {
    const wert = globalThis.localStorage?.getItem(SCHLUESSEL);
    return istSprache(wert) ? wert : null;
  } catch {
    // Im privaten Modus wirft schon der Zugriff. Dann gilt „nie gewählt" — die
    // Gerätesprache übernimmt, und das ist die harmlosere Richtung: Jemand sieht
    // die Sprache seines Systems statt einer Wahl, die er für diesen Browser
    // vielleicht nie getroffen hat.
    return null;
  }
}

/** Ab jetzt gilt diese Sprache — über das Neuladen hinaus. */
export async function spracheSchreiben(sprache: Sprache): Promise<void> {
  try {
    globalThis.localStorage?.setItem(SCHLUESSEL, sprache);
  } catch {
    // Platte voll, privater Modus, Speicher gesperrt. Die Wahl gilt trotzdem für
    // diesen Lauf — sie steht im Arbeitsspeicher von `index.ts`. Verloren ist nur
    // das Gedächtnis darüber hinaus, und das ist kein Grund, den Umschalter
    // scheitern zu lassen.
  }
}
