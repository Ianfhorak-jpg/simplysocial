import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Nutzungsbedingungen } from '@/components/Nutzungsbedingungen';
import { SsBezirkFeld, SsButton, SsHaken, SsInput, SsText } from '@/components/ui';
import { jahrgangMax, jahrgangMin } from '@/config/alter';
import { kontoAnlegen } from '@/features/auth/hooks';
import { BEZIRK_GRUND, fehltNoch, handleVorschlag, kontoFolgen } from '@/features/auth/konto';
import { KontoFehler } from '@/features/auth/konten';
import { HAKEN_TEXT, zustimmungFehltText } from '@/features/auth/zustimmung';
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
export function ErstesKonto({ authId, name: vorschlag }: { authId: string; name?: string }) {
  const insets = useSafeAreaInsets();
  const texte = kontoFolgen();

  /**
   * Der Name kommt VORAUSGEFÜLLT, wenn Apple ihn mitgegeben hat — Phase 20.3-b2.
   *
   * ── Warum als Anfangswert und nicht per Effekt ──────────────────────────────
   * `useState(vorschlag ?? '')` liest ihn genau einmal, beim ersten Zeichnen. Ein
   * `useEffect`, der ihn nachträglich hineinschreibt, würde jemandem, der gerade
   * tippt, das Feld unter den Fingern überschreiben — dieser Bildschirm steht
   * seinerseits nur einmal je Mensch, also gibt es nichts nachzuziehen.
   *
   * ── Und warum er ÄNDERBAR bleibt ───────────────────────────────────────────
   * Apple schickt den Namen aus dem Apple-Konto, und der ist oft der amtliche.
   * In dieser App steht der Name unter jedem Post und in jedem Chat; wer dort
   * anders heißen will, tippt darüber. Ein festgeschriebenes Feld wäre eine
   * Antwort auf eine Frage, die Ians Entscheidung 44 ausdrücklich STELLT.
   *
   * ⚠️ **Das Vorausfüllen ist meine Auslegung und wartet auf Ians Urteil**
   * (PLAN.md, Abschnitt 6, Punkt 37). Verworfen wäre es mit einer Zeile:
   * `useState('')`.
   */
  const [name, setName] = useState(vorschlag ?? '');
  const [bezirk, setBezirk] = useState('');
  const [jahrgang, setJahrgang] = useState('');
  /**
   * Das Häkchen — Ians Entscheidung 80, Phase 21.2.
   *
   * **Beginnt bei `false`, und das ist keine Nachlässigkeit.** Ein vorab gesetztes
   * Häkchen ist nach DSGVO keine Einwilligung, und Apple sieht es genauso: Eine
   * Zustimmung, die man WEGnehmen muss, hat niemand gegeben.
   */
  const [zugestimmt, setZugestimmt] = useState(false);
  /** Liegen die Nutzungsbedingungen gerade über dem Formular? */
  const [liestBedingungen, setLiestBedingungen] = useState(false);
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
    // Nicht aus `fehltNoch()`: Die Zustimmung ist kein FELD, sondern eine Handlung,
    // und ihre Regel steht in `zustimmung.ts`. Der Grund im Volltext steht bei
    // `ERSTE_FRAGEN` in `konto.ts`.
    zustimmung: zustimmungFehltText(zugestimmt),
  };
  const vollstaendig =
    !maengel.name && !maengel.bezirk && !maengel.jahrgang && !maengel.zustimmung;

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
        // Der Wert des Häkchens, nicht der fertige Zeitstempel: Woraus in der
        // Datenbank `terms_accepted_at` und `terms_version` werden, entscheidet
        // `zustimmung.ts`. Dieser Bildschirm sagt nur, was der Mensch getan hat.
        zugestimmt,
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

  // ── Die Nutzungsbedingungen über dem Formular ────────────────────────────
  // **Sie können KEINE Route sein.** Solange der Torwächter `'erstes-konto'`
  // zeigt, zeichnet `_layout.tsx` den `Stack` gar nicht — ein
  // `router.push('/nutzungsbedingungen')` wechselte die Adresse und zeigte
  // nichts. Der Text kommt deshalb aus `components/Nutzungsbedingungen.tsx`,
  // derselben Komponente, die auch die Route füllt (harte Regel 7).
  //
  // Und kein `Modal`: dieselbe Überlegung wie in `PrototypHinweis` — auf Web eine
  // eigene Ebene mit eigener Größenlogik, auf iOS eine eigene Präsentation. Eine
  // Fläche, die alles verdeckt und nichts durchlässt, tut dasselbe auf beiden.
  if (liestBedingungen) {
    return (
      <ScrollView
        style={styles.huelle}
        contentContainerStyle={[
          styles.inhalt,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
        ]}>
        <View style={styles.kasten}>
          <Nutzungsbedingungen />
          {/* „Zurück" und nicht „Akzeptieren": Zugestimmt wird am Häkchen, und
              zwar bewusst. Ein zweiter Knopf, der dasselbe tut, machte aus dem
              Lesen eine Zustimmung — wer hierher kam, wollte erst einmal nur
              nachsehen. */}
          <SsButton
            label="Zurück"
            block
            size="lg"
            variant="ghost"
            onPress={() => setLiestBedingungen(false)}
          />
        </View>
      </ScrollView>
    );
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

        {/* Ein FELD, kein Raster aus 23 Chips — Ians Rückmeldung vom 2026-09-12,
            nachdem er den Bildschirm zum ersten Mal selbst benutzt hatte. Die
            Begründung steht im Kopf von `SsBezirkFeld`; sie ist keine
            Geschmacksfrage, sondern der Unterschied zwischen etwas AUSWÄHLEN und
            etwas ANGEBEN, das man ohnehin weiß. */}
        <SsBezirkFeld
          wert={bezirk}
          setzen={setBezirk}
          label={texte.bezirkTitel}
          hinweis={BEZIRK_GRUND}
          fehler={gezeigt ? maengel.bezirk ?? undefined : undefined}
        />

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

        {/* Die vierte Sache auf diesem Bildschirm, und die einzige, die kein Feld
            ist — Ians Entscheidung 80 vom 2026-09-14. Sie steht UNTER den drei
            Feldern und ÜBER dem Knopf, weil genau das die Reihenfolge ist, in der
            man sie braucht: erst ausfüllen, dann zustimmen, dann los.

            Die verworfene Stelle war der Anmelde-Bildschirm. Er hätte alle drei
            Wege an einer Stelle abgedeckt und dafür jedem Menschen bei JEDER
            Anmeldung ein Häkchen vorgelegt — eine Zustimmung ist einmalig, und ein
            Bildschirm, der sie jedes Mal einholt, behauptet das Gegenteil. */}
        <SsHaken
          an={zugestimmt}
          setzen={setZugestimmt}
          vor={HAKEN_TEXT.vor}
          link={HAKEN_TEXT.link}
          onLink={() => setLiestBedingungen(true)}
          fehler={gezeigt ? maengel.zustimmung ?? undefined : undefined}
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
});
