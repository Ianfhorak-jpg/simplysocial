import type { Bilddatei, Bildquelle } from '@/lib/bild-waehlen-typen';
import type { ZuschnittSicht } from '@/features/social/zuschnitt';

/**
 * Zuschneiden — **der Web-Zweig, und er ist absichtlich leer.**
 *
 * ── Warum es die Datei trotzdem gibt ────────────────────────────────────────
 * Metro löst `bild-zuschneiden` auf Web zu DIESER Datei auf und auf dem Gerät zu
 * `.native.ts` (dieselbe Bauart wie `bild-waehlen`, `merker`, `zufall`,
 * `sitzungsspeicher`). Ohne sie zöge der Web-Bau `expo-image-manipulator` herein —
 * einen nativen Baustein, der im Browser nichts zu suchen hat.
 *
 * ── Warum es wirft und nicht still etwas zurückgibt ─────────────────────────
 * `bildWaehlen()` liefert auf Web **nie** `art: 'zuschneiden'` (siehe `Bildwahl`),
 * also kommt hier niemand an. Ein stiller Rückgabewert wäre die gefährlichere Wahl:
 * Käme eines Tages doch ein Web-Zweig mit Zuschnitt, liefe er ohne Meldung ins Leere
 * — und die Attrappe wäre SCHWÄCHER als das Original, ohne dass es auffällt
 * (FALLEN.md, und das ist dort ausdrücklich die gefährlichere Richtung).
 *
 * ── Warum `async` und nicht ein einfacher Wurf ──────────────────────────────
 * Eine Funktion, die `Promise<…>` verspricht und SYNCHRON wirft, geht an jedem
 * `.catch()` vorbei und landet nur in einem `try` um den Aufruf herum. Die zwei
 * Zweige müssen sich aber gleich verhalten, sonst prüft der Gerätedurchgang etwas
 * anderes als der Browser. `async` macht aus dem Wurf eine Ablehnung — dieselbe
 * Gestalt wie drüben.
 *
 * Geworfen wird ein gewöhnlicher `Error` mit einem Satz für Entwickler, so wie
 * `bildPfad()` in `bild.ts` es tut. Auf einen Bildschirm kommt er nicht: Käme er
 * doch, wäre das ein Programmfehler und hätte seinen eigenen Satz (harte Regel 103).
 */

export async function bildQuelleLesen(_uri: string): Promise<Bildquelle> {
  throw new Error('bildQuelleLesen im Browser — auf Web gibt es kein Zuschneiden (siehe `Bildwahl`).');
}

export async function bildZuschneiden(_quelle: Bildquelle, _sicht: ZuschnittSicht): Promise<Bilddatei> {
  throw new Error('bildZuschneiden im Browser — auf Web gibt es kein Zuschneiden (siehe `Bildwahl`).');
}
