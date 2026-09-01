/**
 * Zeitangaben, wie ein Mensch sie liest.
 *
 * Im Feed steht nie ein Datum wie "2026-09-01T18:30:00.000Z", sondern "Heute 18:30".
 * Diese Übersetzung passiert an genau einer Stelle — sonst schreibt jeder Screen sein
 * eigenes Format und die App wirkt zusammengestückelt.
 *
 * Bewusst ohne `Intl.RelativeTimeFormat` und ohne Bibliothek: die Ausgabe soll auf
 * jedem Gerät identisch sein. `Intl` richtet sich nach der Sprache des Geräts — ein
 * Handy auf Englisch würde "Today" schreiben, mitten in einer deutschen App.
 */

const WOCHENTAGE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'] as const;
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

  if (tage === 0) return `Heute ${zeit}`;
  if (tage === 1) return `Morgen ${zeit}`;
  if (tage === -1) return `Gestern ${zeit}`;
  if (tage > 1 && tage < 7) return `${WOCHENTAGE[d.getDay()]} ${zeit}`;
  return `${WOCHENTAGE[d.getDay()]}, ${d.getDate()}.${d.getMonth() + 1}. ${zeit}`;
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
  return `Seit ${uhrzeit(iso)}`;
}

/** Kurzform ohne Uhrzeit für enge Stellen: "Heute" · "Morgen" · "Do". */
export function tagText(iso: string, jetzt: Date = new Date()): string {
  const tage = tageEntfernt(iso, jetzt);
  if (tage === 0) return 'Heute';
  if (tage === 1) return 'Morgen';
  if (tage === -1) return 'Gestern';
  const d = new Date(iso);
  if (tage > 1 && tage < 7) return WOCHENTAGE[d.getDay()];
  return `${d.getDate()}.${d.getMonth() + 1}.`;
}

/** Liegt der Zeitpunkt in der Vergangenheit? */
export function istVorbei(iso: string, jetzt: Date = new Date()): boolean {
  return new Date(iso).getTime() < jetzt.getTime();
}

/**
 * Wie lange etwas her ist: "gerade eben" · "vor 20 Min." · "vor 3 Std." · "vor 2 Tagen".
 * Für `createdAt` an Anfragen und Chat-Nachrichten.
 */
export function vergangen(iso: string, jetzt: Date = new Date()): string {
  const minuten = Math.floor((jetzt.getTime() - new Date(iso).getTime()) / 60_000);
  if (minuten < 2) return 'gerade eben';
  if (minuten < 60) return `vor ${minuten} Min.`;
  const stunden = Math.floor(minuten / 60);
  if (stunden < 24) return `vor ${stunden} Std.`;
  const tage = Math.floor(stunden / 24);
  return tage === 1 ? 'gestern' : `vor ${tage} Tagen`;
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
