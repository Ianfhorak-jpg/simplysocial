/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DIE SPRACHE — Deutsch und Englisch, handgeschrieben
 *  Ians Wunsch vom 2026-10-17: „ACTA, also so ein englischer Button dann halt."
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Das Muster ist von ACTA (`17_Tennis_Optimma/acta/src/i18n/`) abgeschaut und an
 * den Dateien gegengeprüft: 565 Schlüssel je Sprache, keine i18n-Bibliothek, der
 * Typ erzwingt die Vollständigkeit. **Was hier anders ist, ist unten je einzeln
 * begründet** — abgeschrieben wäre es an drei Stellen falsch gewesen.
 *
 * ── Wie man einen Text hinzufügt oder ändert ─────────────────────────────────
 *   1. Schlüssel in **`de.ts`** eintragen (die Quelle) und denselben in `en.ts`.
 *      `en` ist `Weiter<typeof de>` getippt — ein fehlender, zusätzlicher oder
 *      umbenannter Schlüssel ist ein **`tsc`-Fehler**. `npx tsc --noEmit` sagt
 *      genau, welcher. **Das ist der Vollständigkeitsbeweis**, keine Disziplinfrage.
 *   2. Benutzen: `import { t } from '@/i18n'` → `t('bereich.schluessel')`.
 *      Platzhalter: `t('feed.treffen', { n: 3 })` füllt `{n}`.
 *   3. Blätter müssen **Strings** sein — nur dann gibt es die Punkt-Pfade mit
 *      Autovervollständigung. Für sprachabhängige **Listen** (Wochentage) oder
 *      Mehrzahl-Verzweigungen eine Helferfunktion danebenstellen, die
 *      `spracheJetzt()` liest. Listen NICHT ins Wörterbuch zwingen.
 *
 * ── Die drei Regeln, die das tragen (ACTAs Lehren, hier geprüft) ─────────────
 * - **`t()` ist NICHT reaktiv.** Es liest die Sprache direkt aus dem Modul und ist
 *   deshalb überall sicher: im Render, in einem `onPress`, in einer reinen
 *   Hilfsdatei wie `features/posts/sort.ts`. Dass die Oberfläche beim Umschalten
 *   neu zeichnet, macht nicht ein Haken je Text, sondern **ein `key` im
 *   Wurzel-Layout** — der Wechsel baut den Baum neu auf, und jedes `t()` liest
 *   frisch. Ein Haken je Text wäre bei ~800 Texten in 39 Dateien gar nicht
 *   durchzuhalten (und ACTA hat denselben Weg aus demselben Grund genommen).
 * - 🔴 **Modulweite `const`-Listen frieren die Startsprache EIN.** Ein
 *   `const WAHL = [{ text: t('…') }]` auf Modulebene hält für immer die Sprache,
 *   die beim App-Start galt. Solche Listen **im Render bauen** oder als
 *   `bauWahl()`-Funktion. In ACTA ist genau das passiert.
 * - 🔴 **Auf ein beschattetes `t` achten.** Eine Schleifenvariable `t`
 *   (`posts.map((t) => …)`), ein `const t = …`, ein Timer-Handle `t` — alle
 *   überdecken das importierte `t()`. **`tsc` sieht das nicht immer, es stürzt
 *   zur Laufzeit ab.** `npm run pruef-sprache` sucht danach.
 *
 * ── 🔴 Die teuerste Lehre aus ACTA, und sie ist KEIN Typ-Problem ─────────────
 * In ACTA stand `DEIN COACH` fest im JSX, obwohl der englische Schlüssel existierte.
 * Der Typ merkt das nicht — ein Literal im Bildschirm umgeht das Wörterbuch
 * einfach. **Englische Nutzer sahen mitten in der App ein deutsches Wort, und
 * Build 1 ging so zu Apple.** Dagegen hilft kein Vorsatz, sondern
 * `npm run pruef-sprache`: Er sucht deutsche Textliterale in `src/` außerhalb
 * dieses Ordners.
 *
 * ── Warum kein zustand, obwohl ACTA einen Store hat ──────────────────────────
 * ACTA hat `zustand` als Abhängigkeit, **dieses Projekt nicht** (nachgesehen am
 * 2026-10-17: `package.json` kennt es nicht, und `createContext` kommt in `src/`
 * kein einziges Mal vor). Eine Bibliothek für eine Variable und einen Hörer wäre
 * hier die teurere Antwort. React bringt `useSyncExternalStore` selbst mit, und
 * genau dafür ist es gedacht.
 */
import { useEffect, useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

import { de } from './de';
import { en } from './en';
import { spracheLesen, spracheSchreiben } from './speicher';
import type { Sprache } from './sprachen';
import { istSprache } from './sprachen';

export type { Sprache } from './sprachen';
export { SPRACHEN } from './sprachen';

/**
 * Die Wörterbücher, nach Sprache.
 *
 * ⚠️ `Record<Sprache, …>` und nicht ein blankes Objekt: Käme in `sprachen.ts` eine
 * Sprache dazu, ohne dass hier ein Wörterbuch dafür steht, meldet `tsc` es hier.
 */
const WOERTERBUECHER: Record<Sprache, unknown> = { de, en };

/**
 * Alle Punkt-Pfade, die zu einem Text führen — aus dem deutschen Wörterbuch
 * errechnet. `t('feed.leer')` bekommt damit Autovervollständigung, und ein
 * Tippfehler ist ein Übersetzungsfehler, der nie in einen Build kommt.
 *
 * ⚠️ **Dieser Typ ist rekursiv und kostet `tsc` Zeit.** In ACTAs `PLAN.md` steht er
 * als Grund, warum automatisches Typechecken in Sitzungen zu lange brauchte — bei
 * 565 Schlüsseln. Hier werden es mehr. Wird `npx tsc --noEmit` unerträglich, ist
 * das die Stelle; der Ausweg wäre ein flacher `Record<string, string>` je Bereich,
 * und der Preis dafür wäre genau die Sicherheit, für die er hier steht.
 */
type Blaetter<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${Blaetter<T[K]>}`;
}[keyof T & string];

export type TSchluessel = Blaetter<typeof de>;

type Platzhalter = Record<string, string | number>;

// ── Welche Sprache gerade gilt ───────────────────────────────────────────────

/**
 * Die laufende Sprache. Modulweit, absichtlich außerhalb von React.
 *
 * Erster Wert ist die **Gerätesprache**, synchron ermittelt — damit das erste Bild
 * schon stimmt, wenn niemand je von Hand gewählt hat. Gibt es eine Handauswahl,
 * überschreibt `spracheLaden()` das gleich danach. **Handauswahl gewinnt immer.**
 */
let jetzt: Sprache = geraeteSprache();
let geladen = false;

const hoerer = new Set<() => void>();

function abonnieren(ruf: () => void): () => void {
  hoerer.add(ruf);
  return () => hoerer.delete(ruf);
}

/**
 * Die laufende Sprache, ohne Haken — für `t()` und für alles außerhalb von React.
 *
 * Auch der Weg für sprachabhängige Listen (siehe Punkt 3 oben): Eine
 * Helferfunktion fragt hier, statt ihre Liste ins Wörterbuch zu zwingen.
 */
export function spracheJetzt(): Sprache {
  return jetzt;
}

/**
 * Die laufende Sprache MIT Haken — nur für den Umschalter und das Wurzel-Layout.
 *
 * ⚠️ **Nicht in einem Bildschirm benutzen, um einen Text zu holen.** Dafür ist
 * `t()` da. Dieser Haken existiert für die zwei Stellen, die auf den Wechsel
 * reagieren müssen: der Umschalter selbst (er zeigt, was gewählt ist) und das
 * Wurzel-Layout (es baut den Baum neu auf).
 */
export function useSprache(): Sprache {
  return useSyncExternalStore(abonnieren, spracheJetzt, spracheJetzt);
}

/** Ab jetzt diese Sprache — und sie wird gemerkt. */
export function spracheSetzen(sprache: Sprache): void {
  if (sprache === jetzt) return;
  jetzt = sprache;
  hoerer.forEach((ruf) => ruf());
  void spracheSchreiben(sprache);
}

/** Wurde die gemerkte Wahl schon gelesen? Das Wurzel-Layout wartet darauf. */
export function spracheGeladen(): boolean {
  return geladen;
}

// ── Übersetzen ───────────────────────────────────────────────────────────────

function aufloesen(woerterbuch: unknown, pfad: string[]): string | undefined {
  let knoten: unknown = woerterbuch;
  for (const glied of pfad) {
    if (knoten == null || typeof knoten !== 'object') return undefined;
    knoten = (knoten as Record<string, unknown>)[glied];
  }
  return typeof knoten === 'string' ? knoten : undefined;
}

function einsetzen(vorlage: string, werte?: Platzhalter): string {
  if (!werte) return vorlage;
  return vorlage.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in werte ? String(werte[name]) : `{${name}}`,
  );
}

/**
 * Der Text zu diesem Schlüssel, in der laufenden Sprache.
 *
 * **Fällt auf DEUTSCH zurück, dann auf den Schlüssel selbst — und wirft nie.**
 * Die Reihenfolge ist eine Entscheidung: Ein fehlender englischer Text zeigt den
 * deutschen (jemand liest ein Wort in der falschen Sprache), ein leerer Bildschirm
 * oder ein Absturz wäre der teurere Fehler. Dass es dazu gar nicht kommt, hält der
 * Typ `Weiter<typeof de>` in `en.ts` — dieser Zweig ist das Netz darunter, nicht
 * der Plan.
 */
export function t(schluessel: TSchluessel, werte?: Platzhalter): string {
  const pfad = schluessel.split('.');
  const treffer = aufloesen(WOERTERBUECHER[jetzt], pfad) ?? aufloesen(de, pfad);
  return einsetzen(treffer ?? schluessel, werte);
}

/**
 * Ein Satz, den eine Regel-Datei als SCHLÜSSEL samt Werten zurückgegeben hat.
 *
 * ── Warum es diesen Helfer gibt ──────────────────────────────────────────────
 * Die Regel-Dateien dieses Projekts (`features/social/bild.ts`,
 * `features/groups/gruppe.ts`, `features/safety/meldung.ts`,
 * `features/posts/standort.ts`) müssen **importfrei** bleiben — mehrere
 * Prüfstände laden sie in blankem Node oder übersetzen sie einzeln ohne den
 * `@/`-Kurznamen. Sie können `t()` deshalb nicht selbst aufrufen und geben
 * stattdessen `{ schluessel, werte }` heraus. **Das Muster kam am 2026-10-18 zum
 * vierten Mal**, und viermal `t(x.schluessel, x.werte)` von Hand ist dreimal die
 * Gelegenheit, die Werte zu vergessen.
 *
 * ⚠️ `werte` ist optional, weil die meisten Sätze keine brauchen — und ein
 * fehlendes `werte` ist dann kein Fehler, sondern der Normalfall.
 */
export function tSatz(satz: {
  schluessel: TSchluessel;
  werte?: Platzhalter;
}): string {
  return t(satz.schluessel, satz.werte);
}

// ── Gerätesprache und die gemerkte Wahl ──────────────────────────────────────

/**
 * Welche Sprache spricht das Gerät?
 *
 * 🔴 **`expo-localization` ist ein NEUER nativer Baustein**, und hier gilt ACTAs
 * Native-Module-Falle: Ein neuer nativer Import crasht den BESTEHENDEN Build beim
 * Laden. Ians iPhone trägt gerade Build 4 — ohne dieses Modul. Deshalb steht der
 * Zugriff in `try/require`: Fehlt es, **ist die Antwort Deutsch**, und die App
 * verhält sich genau wie vor dieser Datei. Scharf wird die Erkennung mit dem
 * nächsten Build.
 *
 * ⚠️ `require` und nicht `import`: Ein `import` oben in der Datei lädt das Modul
 * beim Start der App und lässt sich nicht fangen. Ein `await import(…)` wäre die
 * Falle aus Phase 19h-2 — ein nachgeladener Brocken für etwas, das beim ersten
 * Bild gebraucht wird.
 */
function geraeteSprache(): Sprache {
  try {
    if (Platform.OS === 'web') {
      const sprache = String(globalThis.navigator?.language ?? '').toLowerCase();
      return sprache.startsWith('de') ? 'de' : 'en';
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Ort = require('expo-localization');
    const code = String(Ort.getLocales?.()?.[0]?.languageCode ?? '').toLowerCase();
    // **Ein leerer Code ist nicht „Englisch".** Antwortet das Modul, sagt aber
    // nichts, gilt dieselbe Vorsicht wie beim fehlenden Modul: Deutsch.
    if (!code) return 'de';
    return code.startsWith('de') ? 'de' : 'en';
  } catch {
    return 'de';
  }
}

/**
 * Die gemerkte Handauswahl lesen und anwenden. **Einmal** aus dem Wurzel-Layout.
 *
 * Gibt es keine, bleibt die Gerätesprache stehen. In beiden Fällen gilt die
 * Sprache danach als geladen — sonst wartet das Layout für immer.
 *
 * ⚠️ **Schreibt NICHT zurück in den Speicher.** Was von dort kam, muss nicht
 * dorthin zurück — und `spracheSetzen()` zu benutzen hieße, die Gerätesprache als
 * Handauswahl zu verewigen, sobald sie einmal gegolten hat.
 */
export async function spracheLaden(): Promise<void> {
  const gemerkt = await spracheLesen();
  if (istSprache(gemerkt) && gemerkt !== jetzt) {
    jetzt = gemerkt;
  }
  geladen = true;
  hoerer.forEach((ruf) => ruf());
}

/**
 * `spracheLaden()` genau einmal je App-Lauf anstoßen. Aus dem Wurzel-Layout.
 *
 * ⚠️ **Der Riegel ist `geladen`, nicht die leere Abhängigkeitsliste.** Ein
 * `useEffect` mit `[]` feuert erneut, sobald die Komponente neu aufgebaut wird —
 * und genau das tut das Wurzel-Layout bei jedem Sprachwechsel (sein `key`). Ohne
 * den Riegel läse jeder Wechsel den Speicher noch einmal und setzte die gerade
 * getroffene Wahl auf den gemerkten Wert zurück: Der Umschalter sähe aus, als
 * würde er zurückspringen.
 */
export function useSpracheLaden(): void {
  useEffect(() => {
    if (!geladen) void spracheLaden();
  }, []);
}

/**
 * Was im Umschalter steht.
 *
 * **Die Namen sind NICHT übersetzt, und das ist Absicht:** „Deutsch" heißt auf
 * Englisch nicht „German", wenn es in einer Sprachliste steht — jede Sprache nennt
 * sich dort selbst. Wer Englisch sucht, sucht „English", auch in einer deutschen
 * Oberfläche. Deshalb stehen die zwei Wörter hier fest und nicht im Wörterbuch.
 *
 * ⚠️ **Dass diese Liste modulweit steht, ist nur deshalb erlaubt** — die zweite
 * Regel oben verbietet modulweite Listen, die `t()` aufrufen, weil sie die
 * Startsprache einfrieren. Hier steht kein `t()`, und genau darum ist sie
 * ungefährlich. Käme je ein übersetzter Text hinzu, muss sie in eine Funktion.
 *
 * Die Form ist die von `SsSegmentOption` (`wert` + `label`), damit der Umschalter
 * sie ohne Umbau durchgeben kann.
 */
export const SPRACH_WAHL: readonly { wert: Sprache; label: string }[] = [
  { wert: 'de', label: 'Deutsch' },
  { wert: 'en', label: 'English' },
];
