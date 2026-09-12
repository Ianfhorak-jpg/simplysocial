/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DER ANSTOSS — Phase 20.4-b
 *  Woher die App erfährt, dass sich etwas geändert hat.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ── Der Entwurf in einem Satz ────────────────────────────────────────────────
 * **Ein Ereignis ist hier ein SIGNAL und kein Datentransport.** Aus keinem
 * `payload` wird auch nur ein Feld gelesen; es wird nachgeladen, und das Nachladen
 * geht durch die 33 Policies.
 *
 * Das ist keine Bequemlichkeit, sondern die Antwort auf zwei Fragen gleichzeitig:
 *
 *   1. **Sicherheit.** Supabase wendet RLS auf `postgres_changes` bei INSERT und
 *      UPDATE an — **bei DELETE nicht.** Wer `payload.new` in den Speicher legte,
 *      hätte damit eine ZWEITE Fassung der Sichtbarkeitsregel, und die schwächere.
 *      So hängt sie an EINER Stelle. (Welche Tabellen überhaupt senden dürfen und
 *      warum `blocks` nicht dabei ist, steht in `migrations/0005_realtime.sql`.)
 *   2. **Vollständigkeit.** Eine `posts`-Zeile kommt ohne ihren Autor, eine
 *      `group_members`-Zeile ohne ihre Gruppe. Wer sie einzeln einarbeiten will,
 *      braucht elf Sonderfälle — elf Gelegenheiten, einen zu vergessen, und der
 *      Fehler wäre eine Liste, in der eine Zeile fehlt. Genau die Sorte, die wie
 *      ein kaputter Sortierer aussieht (harte Regel 72).
 *
 * **Der Preis ist benannt:** Jede fremde Nachricht kostet dreizehn Abfragen. Das
 * ist bei vierzehn Posts folgenlos und wird es nicht bleiben — die Verfeinerung
 * steht im Plan (20.4: *„zuerst wird alles geladen wie bisher, damit man einen
 * Unterschied hat, an dem man messen kann"*). Wer hier einzelne Zeilen einarbeitet,
 * bevor es etwas zu messen gibt, tauscht einen bekannten Preis gegen elf
 * unbekannte Fehler.
 *
 * ── Warum entprellt wird ─────────────────────────────────────────────────────
 * Harte Regel 6 kommt hier RÜCKWÄRTS an. „Was zusammengehört, in EINEM `aendern`"
 * heißt in der Datenbank: `anfrage_bestaetigen()` ändert Anfrage, Post und Chat in
 * einer Transaktion (0004). Am Kanal werden daraus **drei** Ereignisse. Ohne
 * Entprellen sind das drei Nachladevorgänge für einen Vorgang — und der letzte
 * gewinnt, also stimmt das Ergebnis, und niemand würde es je bemerken.
 */

import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DAS SICHERHEITSNETZ — Ians 47. Entscheidung, vom 2026-09-12
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ── Warum es eines braucht ───────────────────────────────────────────────────
 * Nach dem ersten Laden ist ein Realtime-Anstoß der EINZIGE Anlass nachzuladen.
 * Geht einer verloren, steht der Bildschirm still, bis zufällig der nächste kommt
 * — und die App sieht aus wie leer oder kaputt.
 *
 * **Dass so ein Anstoß verlorengehen kann, ist gemessen und nicht befürchtet**
 * (2026-09-12, reproduziert): Nach zwölf Minuten ohne Verbindung ging der ERSTE
 * Anstoß nach `SUBSCRIBED` verloren, der zweite 1,5 s später kam an; warm kamen in
 * fünf von fünf Läufen beide an. Supabase bestätigt den Beitritt also, bevor sein
 * WAL-Leser an der aktuellen Stelle steht. Dazu kommen die Fälle, die niemand
 * nachstellen muss: Netz weg, Tunnel, WLAN-Wechsel, abgelaufenes Token.
 *
 * ── Drei Möglichkeiten — Ians Wahl ist B ─────────────────────────────────────
 *
 *   A. NICHTS MACHEN  (verworfen)
 *      Der nächste Anstoß holt es nach, und meistens kommt er schnell. Verloren
 *      hat sie daran, dass „meistens" hier nichts kostet zu beheben.
 *
 *   B. NACHLADEN, WENN DIE APP WIEDER NACH VORN KOMMT   ← **seine Wahl**
 *      Genau der Augenblick, in dem jemand hinsieht. Kein laufender Preis: Wer die
 *      App nicht anfasst, löst nichts aus.
 *      **Der Haken, den er kennt:** Wer die App stundenlang offen vor sich liegen
 *      hat, ohne zu wechseln, bekommt kein Netz. Genau dafür wäre C da.
 *
 *   C. ZUSÄTZLICH ALLE PAAR MINUTEN VON SELBST  (verworfen)
 *      Am sichersten und das einzige mit einem LAUFENDEN Preis: dreizehn Abfragen
 *      je Runde, für jeden Menschen, der die App offen hat — auch wenn sich nichts
 *      geändert hat. Bei vier Gründern ist das nichts und bei vierhundert nicht
 *      mehr nichts. Nachrüstbar, ohne etwas zurückzunehmen.
 */
export const NACHLADEN: 'nie' | 'beim-hervorholen' | 'auch-getaktet' = 'beim-hervorholen';

/**
 * Wie lange auf weitere Anstöße gewartet wird, bevor nachgeladen wird.
 *
 * 250 ms sind kürzer als jede Wahrnehmung („sofort" fängt bei ~100 ms an, lästig
 * wird es ab ~1 s) und lang genug, dass die drei Ereignisse einer Transaktion
 * sicher zusammenfallen — sie entstehen im selben Augenblick und reisen dieselbe
 * Strecke nach Irland.
 */
const SAMMELZEIT_MS = 250;

/**
 * Die elf Tabellen aus `0005_realtime.sql`.
 *
 * Sie stehen hier ein ZWEITES Mal, und das ist die Stelle, an der diese Datei
 * driften kann — dieselbe Lage wie `landing/stil.css` gegenüber `theme/colors.ts`
 * (harte Regel 13). Deshalb prüft `50_lesen.mjs` beide Listen gegeneinander,
 * statt sich auf Sorgfalt zu verlassen. Eine Tabelle, die hier fehlt, wäre sonst
 * ein Screen, der sich nie von selbst aktualisiert — und das merkt man erst, wenn
 * zwei Leute gleichzeitig dieselbe App benutzen.
 */
export const REALTIME_TABELLEN = [
  'profiles',
  'follows',
  'posts',
  'groups',
  'group_members',
  'group_requests',
  'group_invites',
  'join_requests',
  'chat_threads',
  'chat_participants',
  'messages',
] as const;

let kanal: RealtimeChannel | null = null;
let sammelUhr: ReturnType<typeof setTimeout> | null = null;

/**
 * Zuhören anfangen. `nachladen` wird gerufen, wenn sich irgendwo etwas geändert hat.
 *
 * Gibt es schon einen Kanal, passiert NICHTS — zwei Kanäle auf dieselbe Datenbank
 * hießen jedes Ereignis doppelt, und bei einem entprellten Nachladen sähe man davon
 * nichts als doppelte Last. Dieselbe Überlegung wie der zwischengespeicherte Client
 * in `lib/supabase.ts`.
 */
export function realtimeStarten(sb: SupabaseClient, nachladen: () => void): void {
  if (kanal) return;

  const anstossen = () => {
    if (sammelUhr) clearTimeout(sammelUhr);
    sammelUhr = setTimeout(() => {
      sammelUhr = null;
      nachladen();
    }, SAMMELZEIT_MS);
  };

  let neu = sb.channel('simplysocial-alles');
  for (const tabelle of REALTIME_TABELLEN) {
    neu = neu.on(
      'postgres_changes',
      // `event: '*'` deckt INSERT, UPDATE und DELETE ab. Das ist hier gefahrlos,
      // gerade WEIL die Nutzlast ungelesen bleibt — siehe Kopf, Punkt 1.
      { event: '*', schema: 'public', table: tabelle },
      anstossen,
    );
  }
  kanal = neu.subscribe();
}

/**
 * Zuhören aufhören — beim Abmelden.
 *
 * **Und das ist nicht nur Aufräumen:** Ein Kanal, der das Token des Abgemeldeten
 * trägt, hört weiter auf Tabellen, die den nächsten Angemeldeten nichts angehen.
 * Dieselbe Begründung wie `zwischenspeicherLeeren()` in `store.ts`.
 *
 * Die Sammeluhr wird MIT abgeräumt. Ohne das feuerte ein Anstoß von vor 200 ms
 * nach dem Abmelden noch ein Nachladen — mit dem Ergebnis, dass die neun Listen
 * genau nach dem Leeren wieder gefüllt würden. Ein Fehler, den man nur trifft,
 * wenn man sich im falschen Viertelsekundenfenster abmeldet, und dann nie wieder
 * nachstellen kann.
 */
export function realtimeStoppen(sb: SupabaseClient): void {
  if (sammelUhr) {
    clearTimeout(sammelUhr);
    sammelUhr = null;
  }
  if (kanal) {
    sb.removeChannel(kanal);
    kanal = null;
  }
}

/** Nur für den Prüfstand: Läuft gerade ein Kanal? */
export function realtimeLaeuft(): boolean {
  return kanal !== null;
}
