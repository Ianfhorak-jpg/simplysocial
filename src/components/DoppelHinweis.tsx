import { StyleSheet, View } from 'react-native';

import { SsIconText } from './ui';

import { doppelHinweisText, type Termin } from '@/features/requests/kollision';
import { accent, colors, radius, spacing } from '@/theme';

/**
 * „Du bist heute 17:00 schon bei ‚Tennis spielen'." — der Hinweis über dem Knopf,
 * wenn sich zwei Termine beißen (Phase 18d, Leopolds Wunsch).
 *
 * ── Warum ein Baustein für drei Zeilen ────────────────────────────────────────
 * Weil er an DREI Stellen steht: im Post-Detail über „Bin dabei", in der
 * Antwortleiste des Wischstapels und in der Vorschau des Erstellen-Screens
 * (Ians Entscheidung 33). Dreimal hingeschrieben wären es beim nächsten Umbau
 * drei verschiedene Sätze — und der Satz selbst kommt ohnehin aus
 * `doppelHinweisText()`, damit er sich mit Ians Regel mitändert.
 *
 * ── Warum er NICHT rot ist ────────────────────────────────────────────────────
 * `status.danger` ist in `theme/colors.ts` für Absagen, Blockieren und Melden
 * vergeben. Eine Überschneidung ist nichts davon: Ians Regel lässt sie
 * ausdrücklich zu (`DOPPEL_REGEL = 'warnen'`), der Hinweis ist also eine
 * Auskunft und kein Fehler. Rot hier würde die stärkste Farbe der App für etwas
 * verbrauchen, das man bewusst überschreiben darf — und wäre beim nächsten
 * echten Fehler abgenutzt.
 *
 * Der Streifen links ist dieselbe Sprache wie an der Chat-Zeile (Phase 18c) und
 * am Kategorie-Chip: eine Kante, die eine Zeile als „gehört zusammen" markiert,
 * ohne eine Karte daraus zu machen.
 *
 * Gibt `null` zurück, wenn nichts kollidiert — der Aufrufer braucht keine
 * Bedingung darum.
 */
export function DoppelHinweis({ kollisionen }: { kollisionen: Termin[] }) {
  const text = doppelHinweisText(kollisionen);
  if (!text) return null;

  return (
    <View style={styles.kasten}>
      {/* `uhr` und nicht `warnung`: Der Satz sagt eine Uhrzeit, keine Gefahr. Das
          Dreieck gehört zu Dingen, die man nicht tun sollte — hier darf man. */}
      <SsIconText icon="uhr" variant="caption" color={colors.ink} iconColor={accent.base}>
        {text}
      </SsIconText>
    </View>
  );
}

const styles = StyleSheet.create({
  kasten: {
    backgroundColor: accent.soft,
    borderLeftWidth: 3,
    borderLeftColor: accent.base,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
