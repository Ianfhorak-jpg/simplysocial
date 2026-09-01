import { istAktuell } from './lifecycle';

import type { Post } from '@/types/models';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS STEHT AUF EINEM PROFIL — NUR DAS LAUFENDE ODER AUCH DAS GEWESENE?
 *  Entschieden von Ian am 2026-09-01 (PLAN.md, Abschnitt 6.6). Die verworfenen
 *  Möglichkeiten bleiben unten stehen — als Gedächtnis, nicht als Einladung.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Die Frage folgt direkt aus zwei Regeln, die Ian schon getroffen hat:
 * Ein Post verschwindet am Ende seines Tages (6.2), ein Chat eine Woche nach dem
 * Treffen (6.4). In SimplySocial überlebt bisher nichts seinen Anlass.
 *
 * Das Profil ist die erste Stelle, an der das eine Frage aufwirft. Denn ein Profil
 * beantwortet für jemand Fremden: *„Soll ich mit dieser Person Tennis spielen?"* —
 * und wenn dort nur steht, was gerade läuft, steht dort meistens nichts.
 *
 * Die drei Möglichkeiten, jeweils mit ihrem Haken:
 *
 *   A. NUR WAS GERADE LÄUFT  (`nurAktuelle`)
 *      Das Profil zeigt genau die Posts, die auch im Feed stehen. Das Profil ist ein
 *      AUSHANG: was diese Person gerade vorhat, mehr nicht. Konsequent zu allem
 *      anderen in der App — nichts überlebt seinen Tag.
 *      Haken: Wer heute nichts geplant hat, hat ein leeres Profil. Ausgerechnet in dem
 *      Moment, in dem jemand überlegt, ob er dir schreiben soll, steht dort nichts.
 *
 *   B. AUCH DAS GEWESENE, UNTER „SCHON GEWESEN"  (`auchVergangene`)
 *      Unter den laufenden Posts eine zweite, ruhigere Gruppe mit dem, was schon war.
 *      Das Profil ist ein VERZEICHNIS: man sieht, dass Lea wirklich dreimal Tennis
 *      gespielt hat. Ohne Bewertungen und ohne Ausweis ist das das einzige echte
 *      Vertrauenssignal, das die App hat.
 *      Haken: Es widerspricht der Flüchtigkeit, die überall sonst gilt. Und es macht
 *      aus dem Profil eine Bilanz — wer viel postet, sieht "besser" aus als wer wenig
 *      postet, obwohl das über niemanden etwas aussagt.
 *
 *   C. DAS GEWESENE NUR ALS ZAHL  (`nurAktuelle` + eine Zahl im Kopf)
 *      "17 Treffen gepostet" steht oben bei den Followern, die Liste selbst bleibt
 *      kurz. Das Vertrauenssignal ohne die Chronik.
 *      Haken: Eine Zahl, die niemand nachprüfen kann, und sie belohnt Menge statt
 *      Verlässlichkeit. Zehn abgesagte Treffen zählen genauso wie zehn stattgefundene.
 *
 * ── Ians Entscheidung, 2026-09-01: NUR WAS GERADE LÄUFT. ─────────────────────
 * Möglichkeit A. Das Profil ist ein Aushang, kein Archiv — dieselbe Haltung wie bei
 * seinen Regeln 6.2 und 6.4: In SimplySocial überlebt nichts seinen Anlass. Ein
 * Profil, das jedes gewesene Treffen aufhebt, wäre der einzige Ort in der App, an dem
 * doch alles bleibt.
 *
 * **Den Haken hat er in Kauf genommen:** Wer gerade nichts geplant hat, hat ein
 * leeres Profil. Das trifft die meisten Leute die meiste Zeit — und ausgerechnet dann,
 * wenn jemand überlegt, ob er dir schreiben soll.
 *
 * Die Oberfläche fängt genau das ab: Ein Profil ohne laufende Posts zeigt nicht "nichts
 * gefunden", sondern Bio, Bezirk und Interessen — und darunter den Satz, dass gerade
 * nichts geplant ist. Die Interessen tragen dort die Last, die sonst die Post-Liste
 * trägt. Deshalb stehen sie auf dem Profil weit oben und nicht als Beiwerk unten.
 *
 * Falls sich das im Betrieb beißt, ist die Korrektur eine Zeile (`auchVergangene`
 * statt `nurAktuelle` in `gehoertAufsProfil`) plus die zweite Gruppe im Screen.
 * **Nicht ohne Rückfrage.**
 */

/** Was ein Profil über den Betrachter wissen darf. */
export interface ProfilKontext {
  jetzt: Date;
}

// ── Bausteine ────────────────────────────────────────────────────────────────

/** Möglichkeit A: nur, was auch im Feed stünde. */
export function nurAktuelle(post: Post, ctx: ProfilKontext): boolean {
  return istAktuell(post, ctx.jetzt);
}

/** Möglichkeit B: alles, was diese Person je gepostet hat. */
export function auchVergangene(_post: Post, _ctx: ProfilKontext): boolean {
  return true;
}

/** Ist dieser Post vorbei? Trennt in Möglichkeit B die zweite Gruppe ab. */
export function istGewesen(post: Post, ctx: ProfilKontext): boolean {
  return !istAktuell(post, ctx.jetzt);
}

/**
 * Gehört dieser Post auf das Profil seines Verfassers?
 *
 * Die Sichtbarkeitsregel („nur meine Follower") ist hier NICHT enthalten — die steht
 * in `posts/hooks.ts` und gilt für Feed und Profil gleichermaßen. Diese Datei
 * beantwortet nur die Frage nach der ZEIT.
 */
export function gehoertAufsProfil(post: Post, ctx: ProfilKontext): boolean {
  return nurAktuelle(post, ctx);
}
