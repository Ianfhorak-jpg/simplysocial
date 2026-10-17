/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DER SPRACH-UMSCHALTER — Deutsch / English
 *  Ians Wunsch vom 2026-10-17: „ACTA, also so ein englischer Button dann halt."
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Steht in `app/einstellungen.tsx` in einem eigenen Abschnitt.
 *
 * ── Warum `SsSegment` und keine zwei Knöpfe ──────────────────────────────────
 * ACTA hat hier zwei `Pressable` von Hand gebaut. **Hier wäre das ein Rückschritt:**
 * `SsSegment` gibt es in diesem Projekt schon, es trägt die gleitende Pille
 * (Ians Entscheidung 97, `lib/bewegung.ts`), das Drücken aus `useDruck` und das
 * `accessibilityLabel` je Hälfte — alles, was man an zwei nachgebauten Knöpfen
 * vergessen würde. Dass die Auswahl in diesem Projekt so aussieht, ist dieselbe
 * Antwort wie beim Posten („Alle / Follower / Gruppe").
 *
 * ⚠️ **Ohne `aufGlas`**, weil der Einstellungs-Abschnitt auf `colors.surface`
 * sitzt und nicht auf Glas — die Prop-Doku an `SsSegmentProps.aufGlas` sagt
 * genau das: Auf normalem Grund wäre eine Aufhellung um 22 % kaum zu sehen.
 *
 * ── Was beim Umschalten passiert, und wo ─────────────────────────────────────
 * Hier passiert nur `spracheSetzen()`. Dass die ganze Oberfläche danach in der
 * neuen Sprache dasteht, macht **das Wurzel-Layout** über sein `key` — nicht
 * dieser Baustein. Die Begründung dafür steht im Kopf von `i18n/index.ts`
 * („`t()` ist NICHT reaktiv").
 */
import { SsSegment } from '@/components/ui';
import type { Sprache } from '@/i18n';
import { SPRACH_WAHL, spracheSetzen, useSprache } from '@/i18n';

export function SprachWahl() {
  // **Der eine Ort, an dem `useSprache()` richtig ist** (neben dem Wurzel-Layout):
  // Der Umschalter muss zeigen, was gerade gewählt IST. Für Texte ist `t()` da.
  const sprache = useSprache();

  return (
    <SsSegment<Sprache>
      value={sprache}
      options={SPRACH_WAHL}
      // **Keine Haptik, und das ist nachgesehen, nicht vergessen:** `lib/haptik.ts`
      // kennt fünf Anlässe (`schwelle`, `zurueck`, `match`, `erfolg`, `fehler`) —
      // eine getroffene Auswahl ist keiner davon. `SsSegment` lässt sie auch beim
      // Posten weg. Ein sechstes Wort zu erfinden wäre eine Erweiterung von harter
      // Regel 115 und damit Ians Entscheidung, nicht ein Detail dieses Bausteins.
      onChange={spracheSetzen}
    />
  );
}
