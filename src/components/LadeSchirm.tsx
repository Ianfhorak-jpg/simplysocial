import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SsButton, SsIcon, SsText } from '@/components/ui';
import type { LadeFehler } from '@/data/laden';
import { ladeFehlerFolgen, ladeZeileFolgen } from '@/data/quelle';
import { abmelden } from '@/features/auth/hooks';
import { colors, MAX_CONTENT_WIDTH, radius, spacing } from '@/theme';

/**
 * Was dasteht, wenn die Daten nicht kommen — **Ians Entscheidung 43** vom
 * 2026-09-12 (`data/quelle.ts`, `LADE_FEHLER = 'vollbild'`).
 *
 * ── Warum ein VOLLBILD und keine Zeile über dem Feed ──────────────────────────
 * Weil ein leerer Feed und ein kaputter Feed sonst gleich aussehen. `supabase-js`
 * wirft nicht; ohne diese Unterscheidung stünde bei jedem Netzausfall „Noch nichts
 * los in deinem Feed", und das ist ein Satz, der lügt. Die verworfene Möglichkeit B
 * (leise Zeile, näher an Entscheidung 50) ist an ihrer eigenen Stärke gescheitert:
 * Ein LEERER Feed mit einem schmalen Streifen darüber sieht immer noch aus wie
 * „nichts los". Alle drei Möglichkeiten stehen samt Begründung in `data/quelle.ts`.
 *
 * **Der Haken ist benannt und gehört zu 20.3-b:** Wer im Tunnel aufmacht, sieht gar
 * nichts — auch nicht die Chats von vorhin. Das wird erst besser, wenn es einen
 * Speicher gibt, aus dem sich etwas zeigen ließe.
 *
 * ── Warum das Zeichen NICHT rot ist ───────────────────────────────────────────
 * `status.danger` gehört in dieser App dem Absagen, Blockieren und Melden — der
 * Kommentar an der Farbe in `theme/colors.ts` sagt es. Eine fehlende Verbindung ist
 * nichts davon: Niemand hat etwas falsch gemacht, nichts ist verloren, und meistens
 * ist es in zehn Sekunden vorbei. Rot hier verbraucht die stärkste Farbe der App für
 * einen Zustand, der von selbst vergeht — dieselbe Überlegung, mit der der
 * Doppel-Hinweis aus Phase 18d nicht rot geworden ist.
 *
 * ── Der Knopf tut ZWEI verschiedene Dinge, und das ist kein Beiwerk ───────────
 * Bei einer abgelaufenen Anmeldung (`42501`/`PGRST301`) ist ein neuer
 * Ladeversuch sinnlos: Die nächsten dreizehn Abfragen scheitern genauso, und man
 * sitzt in einer Schleife, die wie ein kaputter Knopf aussieht. Beim ersten Bauen
 * stand hier ein einziges `nochmal` — der Knopf sagte „Anmelden" und lud neu.
 * **Zwei für sich richtige Teile ergeben zusammen einen falschen Satz**, dieselbe
 * Sorte wie die Verlassen-Rückfrage in Phase 17.
 *
 * `anmeldenNoetig` entscheidet das in `data/quelle.ts` und nicht hier: Welcher
 * `code` welche Lage bedeutet, ist eine Regel und keine Oberfläche.
 *
 * ── Der Kasten baut auf `Anmelden` auf, und das ist Absicht ───────────────────
 * Beides sind Bildschirme ANSTELLE der App, gezeichnet von derselben Ebene
 * (`app/_layout.tsx`). Sähen sie verschieden aus, wirkte der eine wie ein Teil der
 * App und der andere wie ein Absturz.
 */
export function LadeSchirm({ fehler, nochmal }: { fehler: LadeFehler; nochmal: () => void }) {
  const insets = useSafeAreaInsets();
  const { titel, text, knopf, anmeldenNoetig } = ladeFehlerFolgen(fehler);

  return (
    <View
      style={[
        styles.huelle,
        {
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
        },
      ]}
    >
      <View style={styles.kasten}>
        <View style={styles.zeichen}>
          <SsIcon name="warnung" size={32} color={colors.inkSoft} />
        </View>
        <SsText variant="heading" center>
          {titel}
        </SsText>
        {/* Kein Tabellenname, kein Fehlercode, kein Pfad. Der `code` steht in der
            Konsole (`LadeFehler` trägt ihn) — am 2026-09-03 stand eine
            Entwickler-Notiz im gerenderten Text der Nutzungsbedingungen, auf einer
            öffentlich abrufbaren Adresse. */}
        <SsText variant="body" center color={colors.inkSoft}>
          {text}
        </SsText>
        {/* `abmelden()` und nicht `nochmal`: Danach zeichnet der Torwächter in
            `app/_layout.tsx` den Anmelde-Bildschirm, und es leert nebenbei den
            Zwischenspeicher — fremde Daten liegen nach einer abgelaufenen Sitzung
            sonst weiter im Speicher. */}
        <SsButton
          label={knopf}
          block
          size="lg"
          onPress={anmeldenNoetig ? abmelden : nochmal}
          style={styles.knopf}
        />
      </View>
    </View>
  );
}

/**
 * Die leise Zeile — **Ians Entscheidung 49** vom 2026-09-12 abends
 * (`data/quelle.ts`, `LADE_FEHLER = 'vollbild-dann-zeile'`).
 *
 * ── Warum es sie GEBEN darf, obwohl Entscheidung 43 sie verworfen hatte ──────
 * Weil sie damals eine andere Frage beantwortet hätte. Der Einwand lautete: *„Ein
 * LEERER Feed mit einem schmalen Streifen darüber sieht immer noch aus wie ‚nichts
 * los'."* Das stimmt — **und unter dieser Zeile ist der Feed nicht leer.** Sie
 * erscheint ausschließlich, wenn ein NACHladen gescheitert ist, also wenn die Daten
 * von vorhin noch dastehen. Der Haken aus Entscheidung 43 („Wer im U-Bahn-Tunnel
 * aufmacht, sieht von der App gar nichts") ist genau der Fall, den sie behebt.
 *
 * ── Sie liegt im FLUSS und nicht darüber ─────────────────────────────────────
 * Dieselbe Bauart wie `SchreibFehlerLeiste` seit Ians Entscheidung 48: Eine Leiste
 * oben am Bildschirm verdeckt sonst den Zurück-Pfeil, der dort auf jedem Screen
 * liegt (gemessen mit `elementFromPoint` am 2026-09-12). Der Inhalt rückt.
 *
 * ── Warum kein Vollbild-Kasten mit weniger Text ──────────────────────────────
 * Weil die Frage eine andere ist. Der Kasten beantwortet „kommen die Daten?" und
 * darf deshalb der ganze Bildschirm sein. Die Zeile beantwortet **„ist das, was ich
 * sehe, noch aktuell?"** — und die Antwort darauf darf nicht den Bildschirm
 * verdecken, um den es geht (harte Regel 63).
 */
export function LadeZeile({ fehler, nochmal }: { fehler: LadeFehler; nochmal: () => void }) {
  const insets = useSafeAreaInsets();
  const { text, knopf } = ladeZeileFolgen(fehler);
  // Dieselbe Regel wie im Kasten: Bei einer abgelaufenen Anmeldung hilft kein
  // neuer Ladeversuch, sondern nur ein neuer Anmeldevorgang.
  const { anmeldenNoetig } = ladeFehlerFolgen(fehler);

  return (
    <View style={[styles.zeilenHuelle, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.zeile}>
        {/* Nicht rot — siehe die Begründung am Kasten oben. */}
        <SsIcon name="warnung" size={16} color={colors.inkSoft} />
        <SsText variant="caption" color={colors.inkSoft} style={styles.zeilenText}>
          {text}
        </SsText>
        <SsButton label={knopf} variant="ghost" onPress={anmeldenNoetig ? abmelden : nochmal} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Ausgeschriebene Kanten statt `absoluteFill` — registrierte Style-ID, lässt sich
  // nicht mit eigenen Werten mischen (ACTA-Falle). Wie in `Anmelden`.
  huelle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  kasten: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.xl,
    gap: spacing.sm,
    alignItems: 'center',
  },
  zeichen: { marginBottom: spacing.xs },
  knopf: { marginTop: spacing.md, width: '100%' },

  // ── Die leise Zeile (Entscheidung 49) ──────────────────────────────────────
  // KEIN `position: 'absolute'`: Sie liegt im Fluss und schiebt den Inhalt nach
  // unten, statt ihn zu verdecken (Ians Entscheidung 48). Der Hintergrund ist
  // gesetzt, weil unter einer durchsichtigen Zeile der Feed durchscrollen würde.
  zeilenHuelle: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  zeile: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  // `flex: 1` an dem Text, der nachgeben soll — nicht `flexShrink` am anderen
  // (harte Regel 43).
  zeilenText: { flex: 1 },
});
