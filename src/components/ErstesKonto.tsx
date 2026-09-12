import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SsButton, SsChip, SsInput, SsText } from '@/components/ui';
import { jahrgangMax, jahrgangMin } from '@/config/alter';
import { kontoAnlegen } from '@/features/auth/hooks';
import { BEZIRK_GRUND, fehltNoch, handleVorschlag, kontoFolgen } from '@/features/auth/konto';
import { KontoFehler } from '@/features/auth/konten';
import { BEZIRKS_LISTE } from '@/lib/bezirk';
import { colors, MAX_CONTENT_WIDTH, radius, spacing, status } from '@/theme';

/**
 * Das erste Konto fertig machen — **Ians 44. Entscheidung** vom 2026-09-12.
 * Phase 20.3-b1.
 *
 * ── Warum das ein dritter Torwächter-Zustand ist und keine Route ──────────────
 * Aus demselben Grund wie `Anmelden` (siehe dessen Kopf): Eine Route `/erstes-konto`
 * müsste sich merken, wohin jemand eigentlich wollte, und danach dorthin
 * zurückspringen. So bleibt die Adresse einfach stehen — wer über einen Link auf
 * `/post/p1` kommt und sich zum ersten Mal anmeldet, steht nach „Los geht's" bei
 * genau diesem Post. **Und derselbe zweite Grund gilt auch hier:** Ein Screen im
 * Baum ruft `useCurrentUserId()`, und die gibt es noch nicht — es gibt ja noch
 * keine `User.id`.
 *
 * ── Was gefragt wird, steht NICHT hier ───────────────────────────────────────
 * `ERSTE_FRAGEN` und die Sätze stehen in `features/auth/konto.ts` (harte Regel 17
 * und ihre Verwandten). Dieser Screen weiß nicht, warum drei Felder dastehen und
 * nicht vier — er weiß nur, wie man sie zeichnet. Der `@handle` wird abgeleitet und
 * darunter ANGEZEIGT, aber nicht zum Eintippen angeboten: Er ist Ergebnis, keine
 * Frage. Wer ihn hier eintippbar macht, macht aus Entscheidung 44 die verworfene
 * Möglichkeit B.
 *
 * ── Warum ein `ScrollView` und kein fester Kasten ────────────────────────────
 * Weil die Bezirksliste 23 Einträge hat. Der Anmelde-Bildschirm daneben ist ein
 * zentrierter Kasten und darf es sein — er hat drei Knöpfe. Auf 360 × 600 mit
 * offener Tastatur ist das hier höher als der Schirm, und ein Knopf, den man nicht
 * erreicht, ist kein Knopf (die Lehre vom 2026-09-03, `VERSTECKTER_FEHLER`).
 */
export function ErstesKonto({ authId }: { authId: string }) {
  const insets = useSafeAreaInsets();
  const texte = kontoFolgen();

  const [name, setName] = useState('');
  const [bezirk, setBezirk] = useState('');
  const [jahrgang, setJahrgang] = useState('');
  const [gezeigt, setGezeigt] = useState(false);
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  // Die Grenzen kommen aus `config/alter.ts` und werden NICHT hier gerechnet: Sie
  // hängen am heutigen Jahr (`MINDESTALTER`/`HOECHSTALTER`), und zwei Rechnungen
  // für dieselbe Spanne laufen beim Jahreswechsel auseinander.
  const spanne = useMemo(() => ({ min: jahrgangMin(), max: jahrgangMax() }), []);

  const maengel = {
    name: fehltNoch('name', name),
    bezirk: fehltNoch('bezirk', bezirk),
    jahrgang: fehltNoch('jahrgang', jahrgang),
  };
  const vollstaendig = !maengel.name && !maengel.bezirk && !maengel.jahrgang;

  async function absenden() {
    // Die Mängel werden erst NACH dem ersten Tippen auf den Knopf rot. Ein Formular,
    // das beim Öffnen schon dreimal „fehlt noch" sagt, schimpft mit jemandem, der
    // noch gar nichts falsch gemacht hat.
    setGezeigt(true);
    if (!vollstaendig || laeuft) return;
    setLaeuft(true);
    setFehler(null);
    try {
      await kontoAnlegen({
        authId,
        name: name.trim(),
        bezirk,
        jahrgang: Number(jahrgang.trim()),
      });
      // Kein `setLaeuft(false)` im Erfolgsfall: Der Torwächter tauscht diesen Screen
      // im selben Augenblick aus, und ein `setState` auf einer abgebauten Komponente
      // ist genau die Warnung, die sonst niemand mehr zuordnen kann.
    } catch (f) {
      // Der `code` gehört in die KONSOLE und nicht auf den Bildschirm — die Lehre
      // vom 2026-09-03 (Entwickler-Notizen in JSX-Text sind öffentlich), und
      // `data/quelle.ts` sagt dasselbe für das Lesen.
      console.warn(f instanceof KontoFehler ? f.message : String(f));
      setFehler('Das hat gerade nicht geklappt. Probier es noch einmal.');
      setLaeuft(false);
    }
  }

  return (
    <ScrollView
      style={styles.huelle}
      contentContainerStyle={[
        styles.inhalt,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
      keyboardShouldPersistTaps="handled">
      <View style={styles.kasten}>
        <SsText variant="title">{texte.titel}</SsText>
        <SsText variant="body" color={colors.inkSoft} style={styles.unterzeile}>
          {texte.unterzeile}
        </SsText>

        <SsInput
          label="Wie heißt du?"
          value={name}
          onChangeText={setName}
          placeholder={texte.namePlatzhalter}
          error={gezeigt ? maengel.name ?? undefined : undefined}
        />
        {/* Der abgeleitete @-Name steht unter dem Feld und nicht darin: Was man
            nicht ändern kann, gehört nicht in einen Rahmen, der zum Tippen einlädt. */}
        {name.trim().length > 0 ? (
          <SsText variant="caption" color={colors.inkSoft}>
            Dein Name in der App: @{handleVorschlag(name)}
          </SsText>
        ) : null}

        <View style={styles.block}>
          <SsText variant="label">{texte.bezirkTitel}</SsText>
          <SsText variant="caption" color={colors.inkSoft}>
            {BEZIRK_GRUND}
          </SsText>
          <View style={styles.bezirke}>
            {BEZIRKS_LISTE.map((b) => (
              <SsChip
                key={b.plz}
                label={b.plz}
                selected={bezirk === b.plz}
                onPress={() => setBezirk(b.plz)}
              />
            ))}
          </View>
          {gezeigt && maengel.bezirk ? (
            <SsText variant="caption" color={status.danger}>
              {maengel.bezirk}
            </SsText>
          ) : null}
        </View>

        {/* Der Hinweis steht UNTER dem Titel und nicht daneben — dasselbe Muster wie
            der Grund beim Bezirk darüber. Als `hint` teilte er sich die Zeile mit dem
            Titel, und „Welcher Jahrgang?" brach dadurch auf 360 px in zwei Zeilen um.
            Zwei Muster für dieselbe Sache auf einem Bildschirm sind genau das, was
            Ian am 2026-09-05 mit „noch nicht ganz übersichtlich" gemeint hat. */}
        <SsText variant="label">{texte.jahrgangTitel}</SsText>
        <SsText variant="caption" color={colors.inkSoft} style={styles.grund}>
          {texte.jahrgangHinweis}
        </SsText>
        <SsInput
          value={jahrgang}
          onChangeText={setJahrgang}
          placeholder={String(spanne.max)}
          keyboardType="number-pad"
          maxLength={4}
          error={gezeigt ? maengel.jahrgang ?? undefined : undefined}
        />

        {fehler ? (
          <SsText variant="caption" color={status.danger} center>
            {fehler}
          </SsText>
        ) : null}

        <SsButton
          label={laeuft ? 'Einen Moment …' : texte.knopf}
          block
          size="lg"
          disabled={laeuft}
          onPress={() => void absenden()}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  huelle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.bg,
  },
  inhalt: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  kasten: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.xl,
    gap: spacing.md,
  },
  unterzeile: { marginBottom: spacing.xs },
  block: { gap: spacing.xs },
  // Negativer Abstand: Die Unterzeile gehört zum Titel darüber, nicht zum Feld
  // darunter — der `gap` des Kastens würde sie sonst gleich weit von beiden weg
  // setzen und damit freischwebend aussehen lassen.
  grund: { marginTop: -spacing.xs },
  bezirke: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
