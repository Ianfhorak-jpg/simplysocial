import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SsButton, SsIcon, SsText } from '@/components/ui';
import { schreibFehlerFolgen, type SchreibFehler as SchreibFehlerTyp } from '@/data/schreiben';
import { abmelden } from '@/features/auth/hooks';
import { schreibFehlerWeg } from '@/features/store';
import { colors, MAX_CONTENT_WIDTH, radius, spacing } from '@/theme';

/**
 * Was dasteht, wenn ein Schreibvorgang nicht durchkam — Phase 20.5.
 *
 * ── Warum eine LEISTE und kein Vollbild wie bei `LadeSchirm` ─────────────────
 * Weil die Lage eine andere ist, und der Unterschied steht im Kopf von
 * `data/schreiben.ts`. Beim LADEN ist der Bildschirm leer, und die Frage lautet
 * „kommen die Daten?" — ein Vollbild ist dort die Antwort, weil es sonst nichts zu
 * sehen gäbe (Ians Entscheidung 43). Beim SCHREIBEN steht alles da, und die Frage
 * lautet „ist das, was ich gerade getan habe, wirklich passiert?". Ein Vollbild
 * nähme dafür den ganzen Bildschirm weg, auf dem die Antwort steht.
 *
 * Das ist ausdrücklich **nicht** Möglichkeit B aus `quelle.ts` durch die Hintertür:
 * Dort war die leise Zeile falsch, weil ein leerer Feed darunter immer noch wie
 * „nichts los" aussieht. Hier ist unter der Leiste der richtige Inhalt.
 *
 * ── Der Bildschirm darunter stimmt schon wieder ──────────────────────────────
 * `schreibVorgang` lädt bei einem Fehler nach, wenn vorher lokal etwas geändert
 * wurde — **das Nachladen IST die Rücknahme.** Wenn diese Leiste erscheint, steht
 * darunter also bereits der Stand der Datenbank und nicht mehr die Änderung, die
 * nicht durchkam. Deshalb reicht hier ein Wegklicken; es gibt nichts zu reparieren.
 *
 * ── Warum kein „Nochmal" ─────────────────────────────────────────────────────
 * Der Knopf müsste sich merken, WAS zu wiederholen wäre — also eine zweite Fassung
 * der Aktion samt ihrer Argumente, für jede der 22. Die Wiederholung steht schon
 * da, wo sie hingehört: Der Knopf, den man gedrückt hat, ist noch auf dem
 * Bildschirm. `schreibFehlerFolgen()` liefert deshalb nur bei einer abgelaufenen
 * Anmeldung einen Weg, der woanders hinführt.
 */
export function SchreibFehlerLeiste({
  fehler,
}: {
  fehler: SchreibFehlerTyp;
}) {
  const insets = useSafeAreaInsets();
  const { text, knopf, anmeldenNoetig } = schreibFehlerFolgen(fehler);

  return (
    <View style={[styles.huelle, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.leiste}>
        {/* Nicht rot — dieselbe Überlegung wie am `LadeSchirm` und am
            Doppel-Hinweis aus Phase 18d: `status.danger` gehört dem Absagen,
            Blockieren und Melden. Ein Schreibvorgang, der am Netz gescheitert ist,
            ist nichts davon. */}
        <SsIcon name="warnung" size={18} color={colors.inkSoft} />
        {/* Kein Fehlercode, kein Tabellenname (der Fund vom 2026-09-03). */}
        <SsText variant="caption" style={styles.text}>
          {text}
        </SsText>
        <SsButton
          label={knopf}
          variant="ghost"
          onPress={anmeldenNoetig ? abmelden : schreibFehlerWeg}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Ausgeschriebene Kanten statt `absoluteFill` — registrierte Style-ID, lässt sich
  // nicht mit eigenen Werten mischen (ACTA-Falle). Wie in `LadeSchirm`.
  huelle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  leiste: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  // `flex: 1` an dem Text, der nachgeben soll — nicht `flexShrink` am anderen
  // (harte Regel 43, am 2026-09-05 zweimal falsch geraten).
  text: { flex: 1 },
});
