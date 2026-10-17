/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  ENGLISH — the translation of `de.ts`
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * `Weiter<typeof de>` erzwingt **dieselben Schlüssel** wie `de.ts` — fehlt einer,
 * ist einer zu viel oder heißt einer anders, meldet `npx tsc --noEmit` genau den.
 * Die TEXTE sind frei, nur die Struktur ist gebunden.
 *
 * ── Woher die Wörter kommen ──────────────────────────────────────────────────
 * Die Begriffe stehen in **`WOERTERBUCH`/`WOERTER.md`** und sind Ians Entscheidung
 * vom 2026-10-17 — `host` (nicht „poster", das ist auf Englisch ein Plakat),
 * `meet-ups` (nicht „meetings", das klingt nach Büro), `district`, `Vienna`,
 * und der Ton ist das Lockere (`I'm in`, nicht `I will attend`). Abgeleitet, nicht
 * geraten: Die deutsche App sagt „Bin dabei" und nicht „Ich nehme teil".
 *
 * ⚠️ **Das lokale Modell (`lokal`, gemma4:12b) übersetzt gut, aber es RÄT die
 * Begriffe.** Im Probelauf am 2026-10-17 lagen 6 von 8 Zeilen richtig; die zwei
 * falschen waren beide Begriffsfragen (`poster`, `meetings`), keine
 * Übersetzungsfehler. Deshalb geht kein Block ungelesen hier hinein.
 */
import type { de } from './de';

/**
 * Macht aus den festen Texten von `de.ts` wieder gewöhnliche Strings — sonst
 * verlangte der Typ hier **wörtlich den deutschen Satz**.
 *
 * `de.ts` endet auf `as const`, damit die Punkt-Pfade in `index.ts` entstehen.
 * Dadurch ist der Typ jedes Blattes aber nicht `string`, sondern der eine Satz,
 * der dort steht. `Weiter` dreht genau das zurück: Struktur gebunden, Wortlaut frei.
 */
type Weiter<T> = {
  -readonly [K in keyof T]: T[K] extends string ? string : Weiter<T[K]>;
};

export const en: Weiter<typeof de> = {
  gemein: {
    abbrechen: 'Cancel',
    fertig: 'Done',
    weiter: 'Next',
    zurueck: 'Back',
    nochmal: 'Try again',
    verstanden: 'Got it',
  },

  feed: {
    leerMitFilter: 'Nothing going on with this filter',
    binDabei: "I'm in",
  },

  post: {
    // „host", nicht „poster" — ein `poster` ist auf Englisch ein Plakat.
    posterBestaetigt: 'The host confirmed you',
    bezirkFrage: 'Which district are you in?',
  },

  anfrage: {
    zuSpaet: 'Too late — the spot is gone',
  },

  konto: {
    // „meet-ups", nicht „meetings" — Letzteres klingt nach Büro.
    treffenGezaehlt: 'Meet-ups that actually happened',
    loeschenWarnung: "This can't be undone",
  },

  einstellungen: {
    spracheTitel: 'Language',
  },

  regeln: {
    keinDating: "This isn't a dating app",
  },
};
