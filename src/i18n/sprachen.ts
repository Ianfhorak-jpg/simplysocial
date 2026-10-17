/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WELCHE SPRACHEN ES GIBT — und sonst nichts
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Eine winzige Datei, und sie hat einen Grund: `speicher.ts` und
 * `speicher.native.ts` brauchen den Typ, `index.ts` braucht ihn auch — und
 * `index.ts` importiert den Speicher. Stünde der Typ in `index.ts`, wäre das ein
 * Kreis. Dieselbe Trennung wie bei `glas-typen.ts`.
 *
 * ⚠️ **Wer hier eine dritte Sprache einträgt, hat damit NICHTS übersetzt.** Der
 * Typ `Sprache` ist der Schlüssel zu `WOERTERBUECHER` in `index.ts` — eine Sprache
 * ohne Wörterbuch meldet `tsc` sofort. Das ist Absicht: Die Liste hier und die
 * Wörterbücher dort können nicht auseinanderlaufen.
 */

/** Die Sprachen, die die App spricht. Deutsch ist die Quelle, Englisch die Übersetzung. */
export const SPRACHEN = ['de', 'en'] as const;

export type Sprache = (typeof SPRACHEN)[number];

/**
 * Ist das ein Wert, den wir kennen?
 *
 * **Gefragt wird an genau zwei Stellen** — beim Lesen aus dem Speicher und beim
 * Deuten der Gerätesprache. Beide bekommen ihren Wert von außen (`localStorage`
 * kann alles enthalten, auch Müll von einer alten Fassung), und beide dürfen ihn
 * deshalb nicht einfach für eine `Sprache` erklären.
 */
export function istSprache(wert: unknown): wert is Sprache {
  return typeof wert === 'string' && (SPRACHEN as readonly string[]).includes(wert);
}
