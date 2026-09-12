/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS EIN NEUES KONTO BRAUCHT — Ians 44. Entscheidung, vom 2026-09-12
 *  Phase 20.3-b1.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Dieselbe Bauart wie `safety/block.ts` (harte Regel 17), `groups/gruppe.ts` (32),
 * `requests/kollision.ts` (46), `posts/standort.ts` (68), `auth/anmeldung.ts` (69)
 * und `data/quelle.ts` (76): Screens lesen `ERSTE_FRAGEN` nie, sie sehen nur das
 * Ergebnis, und die Sätze kommen aus `kontoFolgen()`.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DIE FRAGE — und warum die DATENBANK sie gestellt hat
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Wer sich zum ersten Mal anmeldet, hat bei Supabase eine UUID und eine E-Mail und
 * sonst nichts. `profiles` in `0001_schema.sql` verlangt vier Felder `not null`:
 *
 *     handle · display_name · district · jahrgang
 *
 * **Ohne sie gibt es kein Profil, und ohne Profil ist der Feed leer.** Das ist kein
 * Versehen im Schema, sondern jedes Mal eine getroffene Entscheidung: Der Bezirk
 * eines Menschen ist Pflicht (Entscheidung 9), der Jahrgang trägt den Alters-Filter
 * (Phase 18b) und steht offen am Profil (Entscheidung 30).
 *
 * Dagegen steht harte Regel 63 — *ein Bildschirm zeigt nur, was für die Entscheidung
 * HIER nötig ist.* Beim ersten Konto heißt die Entscheidung „ich will rein", und
 * jedes Feld davor ist eine Gelegenheit aufzuhören. Genau das Argument, mit dem Ian
 * Entscheidung 27 getroffen hat (drei Anmeldewege statt einem).
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DREI MÖGLICHKEITEN — Ians Wahl ist A
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   A. NAME · BEZIRK · JAHRGANG, der @-Name wird ABGELEITET  ← **seine Wahl**
 *      Drei Felder auf einem Bildschirm. Der `handle` entsteht aus dem Namen und
 *      lässt sich später in den Einstellungen ändern.
 *      Begründung: Die drei gefragten Felder tragen alle eine Regel, die schon
 *      entschieden ist. Der `handle` ist das einzige der vier, das niemand
 *      ENTSCHEIDEN muss — er ist ein Name, kein Urteil.
 *      **Der Haken, den er kennt:** Wer „Ian" heißt und @ian schon vergeben
 *      vorfindet, bekommt @ian2, ohne gefragt zu werden. Das ist der Preis dafür,
 *      dass niemand an der Frage „ist das noch frei?" hängenbleibt.
 *
 *   B. ALLE VIER FRAGEN  (verworfen)
 *      Ehrlicher — nichts wird geraten. Verloren hat sie an dem Feld, das am
 *      wenigsten trägt: Ein @-Name, der schon vergeben ist, hält jemanden auf,
 *      bevor er die App ein einziges Mal gesehen hat.
 *
 *   C. NUR NAME UND BEZIRK  (verworfen)
 *      Die kürzeste Fassung, und die einzige mit einem Preis, den man nicht
 *      zurücknehmen kann: Der Jahrgang ist `not null`. Übrig blieben ein
 *      ERFUNDENER Jahrgang — der steht dann offen am Profil (Entscheidung 30) und
 *      ist eine Lüge über einen Menschen — oder ein kaputter Alters-Filter.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS HIER AUSDRÜCKLICH NICHT GEFRAGT WIRD
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   • **Der Standort.** `STANDORT_FRAGE = 'einstellung'` (Entscheidung 70): iOS
 *     zeigt den Systemdialog EIN EINZIGES MAL. Wer ihn hier wegdrückt, drückt ihn
 *     für immer weg.
 *   • **Bio und Interessen.** Beide haben eine Voreinstellung, die für sich allein
 *     ein gültiges Profil ergibt (`''` und `{}`) — dieselbe Überlegung wie
 *     `STANDARD` im Erstellen-Screen (harte Regel 18).
 *   • **Ein Profilbild.** Es gibt noch keinen Upload (20.6), und `SsAvatar`
 *     zeichnet ohne Bild die Initialen aus Phase 14.
 */

import { jahrgangMax, jahrgangMin } from '@/config/alter';
import { istWienerBezirk } from '@/lib/bezirk';

/**
 * Ians 44. Entscheidung. Nicht ohne Rückfrage ändern.
 *
 * Die Reihenfolge IST die Reihenfolge auf dem Bildschirm. `'handle'` steht bewusst
 * nicht drin — wer ihn hier einträgt, macht aus A die verworfene Möglichkeit B.
 */
export const ERSTE_FRAGEN = ['name', 'bezirk', 'jahrgang'] as const;
export type ErsteFrage = (typeof ERSTE_FRAGEN)[number];

/** Wie lang ein Anzeigename sein darf. Die Datenbank hat dazu keine Meinung. */
export const NAME_MIN = 2;
export const NAME_MAX = 30;

/**
 * Was an einem Feld noch fehlt — oder `null`, wenn es in Ordnung ist.
 *
 * **Sie gibt einen SATZ zurück und kein `boolean`.** Das ist dieselbe Entscheidung
 * wie `FEHLER_ANTWORT` im Erstellen-Screen (Ians 15.): „Es fehlt noch was" ohne zu
 * sagen, was, ist eine Sackgasse — und zwei der drei Felder hier können ausgefüllt
 * UND falsch sein (ein Bezirk, den es nicht gibt; ein Jahrgang außerhalb der
 * Spanne). Ein `boolean` könnte das nicht unterscheiden.
 */
export function fehltNoch(frage: ErsteFrage, wert: string, jetzt: Date = new Date()): string | null {
  switch (frage) {
    case 'name': {
      const name = wert.trim();
      if (name.length === 0) return 'Schreib deinen Namen dazu.';
      if (name.length < NAME_MIN) return 'Der Name ist ein bisschen kurz.';
      if (name.length > NAME_MAX) return `Höchstens ${NAME_MAX} Zeichen.`;
      return null;
    }
    case 'bezirk': {
      if (wert.trim().length === 0) return 'Wähl deinen Bezirk.';
      // Nicht „vierstellig, fängt mit 1 an" — das ließe 1000 und 1240 durch.
      if (!istWienerBezirk(wert)) return 'Das ist kein Wiener Bezirk.';
      return null;
    }
    case 'jahrgang':
    default: {
      const jahr = Number(wert.trim());
      if (!Number.isInteger(jahr)) return 'Nur die Jahreszahl, zum Beispiel 2009.';
      const min = jahrgangMin(jetzt);
      const max = jahrgangMax(jetzt);
      if (jahr < min || jahr > max) return `Zwischen ${min} und ${max}.`;
      return null;
    }
  }
}

/**
 * Aus einem Namen einen @-Namen machen — die Hälfte von Entscheidung 44, die
 * niemand sieht.
 *
 * ── Warum das mehr ist als ein `toLowerCase()` ───────────────────────────────
 * `handle` ist in `0001_schema.sql` `not null unique`, und er steht an jedem
 * Profil. Drei Dinge müssen also stimmen, bevor er in die Datenbank darf:
 *
 *   1. **Umlaute.** `'Jürgen'` darf nicht `'jrgen'` werden. Die Tabelle dafür steht
 *      in `posts/filter.ts` und ist dort begründet: `normalize('NFD')` mit
 *      `\p{Diacritic}` ist auf Hermes nicht verlässlich (ACTA-Falle), und aus `ß`
 *      werden ZWEI Zeichen — eine Tabelle, keine Zeichenabbildung.
 *   2. **Alles andere weg.** Ein Leerzeichen oder ein Punkt in einem @-Namen sieht
 *      aus wie zwei Namen.
 *   3. **Es muss etwas übrig bleiben.** Wer sich „🙂" nennt, bekäme sonst einen
 *      leeren `handle`, und `not null` ist gegen `''` machtlos.
 */
export function handleVorschlag(name: string): string {
  const ersetzt = name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]/g, '');
  // Der Rückfall ist kein Schönheitsfehler, sondern die Zusage aus Punkt 3: Diese
  // Funktion gibt IMMER etwas zurück, womit `not null` zufrieden ist.
  return ersetzt.length > 0 ? ersetzt.slice(0, 20) : 'mensch';
}

/**
 * Der nächste Versuch, wenn der @-Name schon vergeben ist: @ian → @ian2 → @ian3.
 *
 * ── Warum NACH dem Fehler und nicht davor gefragt wird ───────────────────────
 * Der naheliegende Weg wäre, vorher nachzusehen, ob `@ian` noch frei ist. Zwischen
 * dem Nachsehen und dem Schreiben liegt aber genau das Fenster, gegen das harte
 * Regel 71 gebaut ist — zwei Menschen, die gleichzeitig „Ian" tippen, bekommen
 * beide ein „ist frei", und einer von beiden scheitert trotzdem.
 *
 * **Die Datenbank ist die einzige Stelle, die es wirklich weiß**, und sie sagt es
 * mit `23505`. Also wird geschrieben und der Fehler als Antwort genommen.
 */
export function naechsterHandle(versuch: string, nummer: number): string {
  return `${versuch}${nummer + 1}`;
}

/** Wie oft es höchstens probiert wird, bevor ein echter Fehler daraus wird. */
export const HANDLE_VERSUCHE = 20;

/**
 * Die Sätze auf dem Bildschirm — an EINER Stelle, wie `blockFolgen()`.
 *
 * Der Titel sagt ausdrücklich NICHT „Profil anlegen". Wer gerade seinen Code
 * eingetippt hat, ist in seinem Kopf schon drin; ein Bildschirm, der wie ein
 * zweiter Anmeldevorgang aussieht, macht aus einem Schritt gefühlt zwei.
 */
export function kontoFolgen(): {
  titel: string;
  unterzeile: string;
  knopf: string;
  namePlatzhalter: string;
  bezirkTitel: string;
  jahrgangTitel: string;
  jahrgangHinweis: string;
} {
  return {
    titel: 'Fast geschafft',
    unterzeile: 'Drei Sachen, dann bist du drin.',
    knopf: "Los geht's",
    namePlatzhalter: 'Dein Vorname',
    bezirkTitel: 'Wo wohnst du?',
    // Der Bezirk bekommt den Grund dazugeschrieben, die anderen beiden nicht: Er
    // ist das einzige der drei Felder, dessen Wirkung man nicht errät — seit
    // Entscheidung 63 sortiert er den ganzen Feed.
    jahrgangTitel: 'Welcher Jahrgang?',
    jahrgangHinweis: 'Steht offen an deinem Profil.',
  };
}

/** Warum der Bezirk gefragt wird — steht unter dem Feld, nicht im Screen getippt. */
export const BEZIRK_GRUND = 'Danach sortieren wir, was in deiner Nähe los ist.';
