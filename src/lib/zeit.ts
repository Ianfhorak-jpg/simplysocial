/**
 * Zeitangaben, wie ein Mensch sie liest.
 *
 * Im Feed steht nie ein Datum wie "2026-09-01T18:30:00.000Z", sondern "Heute 18:30".
 * Diese Übersetzung passiert an genau einer Stelle — sonst schreibt jeder Screen sein
 * eigenes Format und die App wirkt zusammengestückelt.
 *
 * Bewusst ohne `Intl.RelativeTimeFormat` und ohne Bibliothek — **und seit der
 * englischen Fassung gilt die Begründung erst recht:** `Intl` richtet sich nach der
 * Sprache des GERÄTS, die App hat aber eine eigene, die man in den Einstellungen
 * umstellt. Ein deutsches iPhone mit englischer Oberfläche bekäme von `Intl`
 * deutsche Zeitangaben mitten in englische Sätze. Die Wahl in der App muss gewinnen.
 *
 * ── Wo die Wörter herkommen ──────────────────────────────────────────────────
 * Die WÖRTER stehen im Wörterbuch (`i18n/de.ts` · `en.ts`, Bereich `zeit`), die
 * LISTEN (Wochentage, Monate) und die Datumsschreibweise in `i18n/datum.ts` —
 * Blätter im Wörterbuch müssen Strings sein. Hier steht nur die Rechnung: welcher
 * Fall gilt, und was zusammengesetzt wird.
 *
 * ⚠️ **Die Reihenfolge „Tageswort, dann Uhrzeit" ist hier fest verdrahtet**
 * (`${t('zeit.heute')} ${zeit}`) und stimmt für Deutsch und Englisch. Käme eine
 * Sprache dazu, die das anders macht, müssten aus den drei Tageswörtern
 * Satzvorlagen mit `{zeit}` werden — wie bei `zeit.seit`, das genau deshalb eine ist.
 */
import { t } from '@/i18n';
import { datumKurz, wochentag } from '@/i18n/datum';

const MS_PRO_TAG = 86_400_000;

/** Mitternacht des Tages, in dem `d` liegt. */
function tagesBeginn(d: Date): Date {
  const kopie = new Date(d);
  kopie.setHours(0, 0, 0, 0);
  return kopie;
}

/**
 * Ganze Kalendertage zwischen heute und `iso`: heute 0, morgen 1, gestern −1.
 *
 * Gerechnet wird von Mitternacht zu Mitternacht, nicht in 24-Stunden-Blöcken.
 * "In 20 Stunden" kann heute Abend oder morgen früh sein — für den Text "Heute" /
 * "Morgen" zählt der Kalendertag, nicht der Abstand. `Math.round` fängt dabei die
 * Zeitumstellung ab, an der ein Tag nur 23 oder schon 25 Stunden hat.
 */
export function tageEntfernt(iso: string, jetzt: Date = new Date()): number {
  const differenz = tagesBeginn(new Date(iso)).getTime() - tagesBeginn(jetzt).getTime();
  return Math.round(differenz / MS_PRO_TAG);
}

/** Nur die Uhrzeit, immer zweistellig: "18:30". */
export function uhrzeit(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * Wann etwas losgeht, für Feed und Detail:
 * "Heute 18:30" · "Morgen 14:00" · "Do 16:30" · "Mo, 15.9. 20:00" · "Gestern 07:00"
 *
 * Ab einer Woche kommt das Datum dazu. Ohne das wäre "Do 16:30" zweideutig — der
 * Donnerstag dieser Woche oder der in drei Wochen sieht gleich aus.
 */
export function startText(iso: string, jetzt: Date = new Date()): string {
  const tage = tageEntfernt(iso, jetzt);
  const zeit = uhrzeit(iso);
  const d = new Date(iso);

  if (tage === 0) return `${t('zeit.heute')} ${zeit}`;
  if (tage === 1) return `${t('zeit.morgen')} ${zeit}`;
  if (tage === -1) return `${t('zeit.gestern')} ${zeit}`;
  if (tage > 1 && tage < 7) return `${wochentag(d)} ${zeit}`;
  return `${wochentag(d)}, ${datumKurz(d)} ${zeit}`;
}

/**
 * Wie `startText`, aber ehrlich zu Posts, die schon angefangen haben: "Seit 18:30".
 *
 * Nötig geworden mit Ians Lebensdauer-Regel (bis Tagesende, siehe
 * `features/posts/lifecycle.ts`): Seitdem steht ein Post um 23 Uhr noch im Feed,
 * obwohl er um 14:00 losging. "Heute 14:00" läse sich dann wie eine Einladung für
 * später — "Seit 14:00" sagt in derselben Zeilenlänge, was Sache ist.
 *
 * Nur für HEUTE. An anderen Tagen trägt "Gestern 14:00" die Information schon selbst.
 */
export function startOderSeit(iso: string, jetzt: Date = new Date()): string {
  if (!istVorbei(iso, jetzt) || tageEntfernt(iso, jetzt) !== 0) return startText(iso, jetzt);
  return t('zeit.seit', { zeit: uhrzeit(iso) });
}

/**
 * Die kürzeste ehrliche Zeitangabe: "18:30" · "seit 18:30" · "Do 16:30".
 *
 * Gebaut für die Karten-Blase (Phase 19c), wo neben der Zeit noch ein Titel stehen
 * muss und die ganze Zeile rund 200 px breit ist. "Heute 18:30" nimmt dort ein
 * Drittel der Breite für eine Auskunft, die der Zusammenhang schon gibt — man hat
 * gerade selbst auf einen Bezirk getippt und sieht dessen heutige Posts.
 *
 * Das Wort "Heute" fällt deshalb weg, "Morgen" wird zum Wochentag. Was NICHT
 * wegfällt, ist "seit": Ein Post, der schon läuft, sieht sonst aus wie eine
 * Einladung für später — dieselbe Überlegung wie bei `startOderSeit`, nur enger.
 *
 * **Nicht im Feed verwenden.** Dort fehlt der Zusammenhang, der "Do" eindeutig macht:
 * Ein Donnerstag in dieser und einer in drei Wochen sähen gleich aus. Genau dagegen
 * setzt `startText` ab einer Woche das Datum davor.
 */
export function kurzStart(iso: string, jetzt: Date = new Date()): string {
  if (tageEntfernt(iso, jetzt) === 0) {
    return istVorbei(iso, jetzt)
      ? t('zeit.seitKlein', { zeit: uhrzeit(iso) })
      : uhrzeit(iso);
  }
  return `${wochentag(new Date(iso))} ${uhrzeit(iso)}`;
}

/** Kurzform ohne Uhrzeit für enge Stellen: "Heute" · "Morgen" · "Do". */
export function tagText(iso: string, jetzt: Date = new Date()): string {
  const tage = tageEntfernt(iso, jetzt);
  if (tage === 0) return t('zeit.heute');
  if (tage === 1) return t('zeit.morgen');
  if (tage === -1) return t('zeit.gestern');
  const d = new Date(iso);
  if (tage > 1 && tage < 7) return wochentag(d);
  return datumKurz(d);
}

/** Liegt der Zeitpunkt in der Vergangenheit? */
export function istVorbei(iso: string, jetzt: Date = new Date()): boolean {
  return new Date(iso).getTime() < jetzt.getTime();
}

/**
 * Wie lange etwas her ist: "gerade eben" · "vor 20 Min." · "vor 3 Std." · "vor 2 Tagen"
 * — auf Englisch "just now" · "20 min ago" · "3 hours ago" · "2 days ago".
 * Für `createdAt` an Anfragen und Chat-Nachrichten.
 */
export function vergangen(iso: string, jetzt: Date = new Date()): string {
  const minuten = Math.floor((jetzt.getTime() - new Date(iso).getTime()) / 60_000);
  if (minuten < 2) return t('zeit.geradeEben');
  // **Hier ist n immer ≥ 2** — die Zeile darüber hat die Einzahl schon
  // abgefangen. Deshalb gibt es zu `zeit.vorMin` als einzigem der drei
  // Abstände keine Einzahl-Fassung.
  if (minuten < 60) return t('zeit.vorMin', { n: minuten });
  const stunden = Math.floor(minuten / 60);
  if (stunden < 24) {
    return stunden === 1 ? t('zeit.vorStunde') : t('zeit.vorStunden', { n: stunden });
  }
  const tage = Math.floor(stunden / 24);
  return tage === 1 ? t('zeit.vorEinemTag') : t('zeit.vorTagen', { n: tage });
}

/**
 * Eine getippte Uhrzeit verstehen: "18:30" · "1830" · "18.30" · "18" · " 8:5 ".
 * Rückgabe sind Minuten seit Mitternacht, oder `null`, wenn es keine Zeit ist.
 *
 * ── Warum so großzügig ────────────────────────────────────────────────────────
 * Auf dem Handy tippt man in ein Zahlenfeld, und der Doppelpunkt liegt dort auf der
 * zweiten Tastaturebene. Wer "1830" schreibt, meint halb sieben abends — daran soll
 * ein Formular nicht scheitern. Streng bleibt es nur bei dem, was wirklich keine
 * Uhrzeit ist: 25:00 und 18:70 gibt es nicht.
 */
export function parseUhrzeit(text: string): number | null {
  const ziffern = text.replace(/\D/g, '');
  if (ziffern.length === 0 || ziffern.length > 4) return null;

  // 1–2 Ziffern sind die volle Stunde ("18" → 18:00), 3–4 Ziffern Stunde+Minute
  // ("830" → 8:30, "1830" → 18:30).
  const stunden = ziffern.length <= 2 ? Number(ziffern) : Number(ziffern.slice(0, -2));
  const minuten = ziffern.length <= 2 ? 0 : Number(ziffern.slice(-2));

  if (stunden > 23 || minuten > 59) return null;
  return stunden * 60 + minuten;
}

/** Minuten seit Mitternacht als "18:30" — die Gegenrichtung zu `parseUhrzeit`. */
export function uhrzeitText(minutenSeitMitternacht: number): string {
  const h = Math.floor(minutenSeitMitternacht / 60);
  const m = minutenSeitMitternacht % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Ein ISO-Zeitpunkt aus "in `tage` Tagen" und "`minuten` nach Mitternacht" —
 * genau die zwei Angaben, die der Erstellen-Screen einsammelt.
 *
 * Über `setDate`/`setHours` gerechnet und nicht über Millisekunden addiert: an den
 * zwei Tagen im Jahr, an denen die Uhr umgestellt wird, hat ein Tag 23 oder 25
 * Stunden. "Morgen um 18:00" soll dann trotzdem 18:00 heißen.
 */
export function zeitpunkt(tage: number, minuten: number, jetzt: Date = new Date()): string {
  const d = new Date(jetzt);
  d.setDate(d.getDate() + tage);
  d.setHours(Math.floor(minuten / 60), minuten % 60, 0, 0);
  return d.toISOString();
}

/**
 * Auf die nächste halbe Stunde aufrunden: 17:07 → 17:30, 17:31 → 18:00, 17:30 bleibt.
 *
 * Steht hier und nicht im Erstellen-Screen, weil zwei Stellen dieselbe Rundung
 * brauchen: der Vorschlag beim Posten und die Fake-Daten in `data/mock.ts`. Aus dem
 * Screen in `mock.ts` zu greifen verbietet harte Regel 2 — also wandert die Regel
 * dorthin, wo beide sie holen dürfen.
 *
 * Warum überhaupt gerundet wird: „Treffen wir uns um 18:07" schreibt niemand. Eine
 * Voreinstellung, die auf die Minute genau ist, sieht nach Maschine aus und wird
 * deshalb angefasst — obwohl sie stimmt.
 */
export function naechsteHalbeStunde(d: Date): Date {
  const gerundet = new Date(d);
  gerundet.setSeconds(0, 0);
  const rest = gerundet.getMinutes() % 30;
  if (rest !== 0) gerundet.setMinutes(gerundet.getMinutes() + (30 - rest));
  return gerundet;
}
