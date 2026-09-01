import { ablaufVon } from '../posts/lifecycle';

import { istVorbei, tageEntfernt } from '@/lib/zeit';
import type { Post } from '@/types/models';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS PASSIERT MIT EINEM CHAT, WENN DAS TREFFEN VORBEI IST?
 *  Entschieden von Ian am 2026-09-01: ERST C, DANN B (PLAN.md, Abschnitt 6.4).
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Die Frage taucht erst in Phase 5 auf, folgt aber direkt aus Ians eigener Regel aus
 * Abschnitt 6.2: Ein Post verschwindet am Ende seines Tages aus dem Feed. Der Chat
 * dazu aber lebt weiter — und niemand hat bisher gesagt, wie lange.
 *
 * Das ist keine Kleinigkeit, weil sich daran entscheidet, was die App über ein Jahr
 * ist. Bleiben alle Chats stehen, wächst aus jedem Treffen ein Kontakt und die App
 * wird nebenbei ein Freundesverzeichnis. Verschwinden sie, bleibt sie ein Werkzeug
 * für heute Nachmittag und ist morgen wieder leer.
 *
 * Die drei Möglichkeiten, mit ihrem jeweiligen Haken:
 *
 *   A. BLEIBT FÜR IMMER  (`chatZustand` gibt immer 'aktiv' zurück)
 *      Der Chat steht in der Liste wie jeder andere. Aus zehn Treffen werden zehn
 *      Leute, die man wieder anschreiben kann — das ist der Weg, auf dem aus einer
 *      Treff-App ein Freundeskreis wird.
 *      Haken: Nach zwei Monaten stehen dreißig tote Chats über dem einen, in dem es
 *      um heute Abend geht. Genau das, was man sucht, ist am schwersten zu finden.
 *
 *   B. VERSCHWINDET MIT DEM POST  (`'weg'`, sobald `nachAblauf` wahr ist)
 *      Die Liste zeigt ausschließlich, was ansteht. Immer aufgeräumt, nie ein
 *      Karteileichen-Friedhof — und datensparsam, was bei einer App für Minderjährige
 *      kein Nebenaspekt ist.
 *      Haken: Um 23:30 ist der Chat weg, in dem man gerade noch geschrieben hat.
 *      "Hast du meinen Schläger gesehen?" am nächsten Morgen geht nicht mehr — und
 *      man kann die Person auch nicht mehr erreichen, um es zu fragen.
 *
 *   C. RUTSCHT IN "VORBEI"  (`'vorbei'`, sobald `nachAblauf` wahr ist)
 *      Zwei Gruppen in der Liste: oben, was ansteht, darunter, was war. Ehrlich —
 *      es sagt genau das, was Sache ist, und nichts geht verloren.
 *      Haken: ein Begriff mehr, den die App erklären muss, und die Liste hat eine
 *      Struktur, die man erst versteht, wenn man scrollt.
 *
 * ── Ians Entscheidung, 2026-09-01: ERST C, DANN B. ───────────────────────────
 * Seine Antwort auf die drei Möglichkeiten war „B ist gut und C auch". In ihrer reinen
 * Form schließen die beiden einander aus — B löscht, C hebt auf. Nacheinander sind sie
 * aber genau eins, und zwar das, was beiden ihren Haken nimmt:
 *
 *   Der Chat rutscht nach dem Treffen in die Gruppe „Vorbei" (C) und verschwindet
 *   dort nach NACHKLANG_TAGE von selbst (B).
 *
 * Bs Haken war, dass der Chat um 23:30 weg ist, während man noch schreibt — die Woche
 * Nachklang räumt ihn weg. Cs Haken war, dass „Vorbei" mit der Zeit zum Friedhof wird
 * — dass die Gruppe sich selbst leert, räumt ihn weg. Übrig bleibt eine Liste, die
 * ohne Zutun aufgeräumt ist und trotzdem niemanden mitten im Gespräch abschneidet.
 *
 * Was Ian dabei in Kauf genommen hat: Nach der Woche ist der Kontakt wirklich weg. Wer
 * Lea wieder treffen will, findet sie über ihren Post oder ihr Profil — nicht über den
 * alten Chat. Damit ist Möglichkeit A (aus Treffen wachsen dauerhafte Kontakte)
 * bewusst verworfen; die Freundschaftsfunktion ist der Social-Layer aus Phase 6, nicht
 * das Postfach.
 *
 * ── Woran "vorbei" gemessen wird ──────────────────────────────────────────────
 * An `ablaufVon(post)`, also an Ians Lebensdauer-Regel, und NICHT an der Startzeit.
 * Sonst wäre der Chat um 17:05 schon "vorbei", während man noch auf dem Weg zum
 * Platz ist. `nachStart` steht trotzdem als Baustein bereit, falls Ian das anders
 * sieht.
 */

/**
 * In welche Schublade ein Chat gehört.
 *
 *   'aktiv'   — steht in der Liste, ganz normal
 *   'vorbei'  — steht in der Liste, aber in einer eigenen Gruppe darunter
 *   'weg'     — steht nicht mehr in der Liste
 */
export type ChatZustand = 'aktiv' | 'vorbei' | 'weg';

// ── Bausteine ────────────────────────────────────────────────────────────────
// Beide beantworten "ist das Treffen durch?" — nur an verschiedenen Zeitpunkten.

/** Ist der Post aus dem Feed gelaufen? (Ians Regel: Ende seines Tages.) */
export function nachAblauf(post: Post, jetzt: Date): boolean {
  return istVorbei(ablaufVon(post), jetzt);
}

/** Hat das Treffen bereits angefangen? Früher als `nachAblauf`, oft zu früh. */
export function nachStart(post: Post, jetzt: Date): boolean {
  return istVorbei(post.startsAt, jetzt);
}

/**
 * Wie lange ein Chat nach dem Treffen noch unter „Vorbei" steht.
 *
 * Eine Woche, und die Zahl steht hier als EINE Zahl, weil sie erfahrungsabhängig ist:
 * Sie muss lang genug sein für „hast du meinen Schläger gesehen?" am nächsten Morgen
 * und kurz genug, dass „Vorbei" nie zur längsten Liste der App wird. Sieben Tage ist
 * Ians Ausgangswert — wenn sich das im Betrieb falsch anfühlt, ist es diese Zeile und
 * sonst nichts.
 */
export const NACHKLANG_TAGE = 7;

/**
 * Wann ein Chat endgültig verschwindet.
 *
 * Gerechnet ab dem Ablauf des Posts (Ians Regel 6.2), nicht ab der letzten Nachricht:
 * Sonst hielten zwei Leute, die sich noch eine Woche schreiben, den Chat unbegrenzt am
 * Leben — und „Vorbei" wäre wieder unbegrenzt. Der Bezugspunkt ist das Treffen, nicht
 * das Gespräch darüber.
 *
 * Über `setDate` addiert und nicht über Millisekunden: an den zwei Tagen im Jahr, an
 * denen die Uhr umgestellt wird, hat ein Tag 23 oder 25 Stunden (dieselbe Überlegung
 * wie in `posts/lifecycle.ts` und `lib/zeit.ts`).
 */
export function nachklangEnde(post: Post): string {
  const d = new Date(ablaufVon(post));
  d.setDate(d.getDate() + NACHKLANG_TAGE);
  return d.toISOString();
}

/**
 * Wie viele Kalendertage ein Chat unter „Vorbei" noch übrig hat.
 *
 * Als ZAHL und nicht als fertiger Satz: Wie es dasteht, entscheidet der Screen — im
 * Chat selbst („verschwindet morgen") liest es sich anders als in einer Liste. Die
 * Regel gehört hierher, die Wortwahl nicht.
 *
 * Gerechnet in Kalendertagen (`tageEntfernt`), nicht in 24-Stunden-Blöcken: „morgen"
 * ist eine Auskunft über den Kalender, nicht über den Abstand in Stunden.
 */
export function nachklangTageUebrig(post: Post, jetzt: Date): number {
  return Math.max(0, tageEntfernt(nachklangEnde(post), jetzt));
}

/**
 * Ians Regel: erst „Vorbei", dann weg (siehe Kopf dieser Datei).
 *
 * Die Reihenfolge der Prüfungen ist die Regel selbst — läuft, dann klingt nach, dann
 * ist Schluss.
 */
export function chatZustand(post: Post, jetzt: Date): ChatZustand {
  if (!nachAblauf(post, jetzt)) return 'aktiv';
  if (istVorbei(nachklangEnde(post), jetzt)) return 'weg';
  return 'vorbei';
}
