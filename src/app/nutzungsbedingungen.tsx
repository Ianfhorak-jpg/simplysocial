import { StyleSheet, View } from 'react-native';

import { SsBack, SsCard, SsIconText, SsScreen, SsText } from '@/components/ui';
import { BRAND } from '@/config/brand';
import { colors, danger, spacing } from '@/theme';

/**
 * Nutzungsbedingungen.
 *
 * ── Warum hier zwei verschiedene Sorten Text stehen ───────────────────────────
 * Der Screen zerfällt in zwei Hälften, und die Trennung ist Absicht:
 *
 *   HAUSREGELN — was in dieser App gilt und was nicht. Das ist eine Produktfrage,
 *   keine Rechtsfrage. Sie steht hier ausformuliert, weil sie aus PLAN.md folgt
 *   („kein Dating", „der Poster entscheidet") und weil sie das Einzige ist, was Leute
 *   tatsächlich lesen.
 *
 *   RECHTLICHES — Mindestalter, Haftung, Datenschutz, wer die App betreibt. Das darf
 *   hier NICHT erfunden werden. Ian ist 16, die App führt Fremde zusammen; was dort
 *   steht, muss jemand mit Ahnung geschrieben haben (PLAN.md, Abschnitt 8 und
 *   `_FUER_IAN/OFFENE_SACHEN.md`). Ein plausibel klingender Absatz wäre schlimmer als
 *   eine sichtbare Lücke — man würde ihn für geprüft halten.
 *
 * Deshalb steht die Lücke offen da, mit Kasten drumherum. Sie ist der einzige Ort in
 * der App, an dem etwas fehlt, und sie sagt selbst, warum.
 */
export default function NutzungsbedingungenScreen() {
  return (
    <SsScreen scroll contentStyle={styles.seite}>
      <SsBack />

      <SsText variant="title">Nutzungsbedingungen</SsText>
      <SsText variant="body" color={colors.inkSoft}>
        {BRAND.name} ist dafür da, Leute zu treffen, die gerade dasselbe vorhaben. Damit
        das funktioniert, gelten ein paar Regeln.
      </SsText>

      <View style={styles.block}>
        <SsText variant="label" color={colors.inkSoft}>
          Was hier gilt
        </SsText>

        <Regel
          nr="1"
          titel="Das hier ist kein Dating"
          text={`Wer ${BRAND.name} als Dating-App benutzt, fliegt raus. Das ist keine Geschmacksfrage, sondern der Grund, warum die App existiert — man soll „Bin dabei" drücken können, ohne sich zu fragen, was gemeint ist.`}
        />
        <Regel
          nr="2"
          titel="Du bist du"
          text="Echter Name, echtes Alter, echtes Bild. Wer sich für jemand anderen ausgibt, macht jedes Treffen unsicher, an dem er teilnimmt."
        />
        <Regel
          nr="3"
          titel="Zusagen gelten"
          text="Wenn du bestätigt hast, kommst du — oder du sagst rechtzeitig im Chat ab. Nicht aufzutauchen ist das Einzige, was diese App wirklich kaputt machen kann."
        />
        <Regel
          nr="4"
          titel="Keine Werbung"
          text="Posts sind Verabredungen, keine Anzeigen. Nichts verkaufen, nichts bewerben, niemanden anwerben."
        />
        <Regel
          nr="5"
          titel="Triff dich zuerst öffentlich"
          text="Beim ersten Mal an einem Ort, an dem andere Leute sind. Sag jemandem, wo du hingehst. Das ist keine Vorschrift, sondern der Rat, den dir jeder geben würde."
        />
        <Regel
          nr="6"
          titel="Melden statt streiten"
          text="Wenn jemand sich danebenbenimmt: melden und blockieren. Beides erfährt die andere Person nicht."
        />
      </View>

      <View style={styles.block}>
        <SsText variant="label" color={colors.inkSoft}>
          Rechtliches
        </SsText>

        <SsCard style={styles.luecke}>
          <SsIconText icon="warnung" variant="bodyStrong" color={danger.onSoft}>
            Dieser Teil fehlt noch — mit Absicht
          </SsIconText>
          <SsText variant="body">
            Was hier stehen muss, kann niemand aus dem Team schreiben. {BRAND.name} bringt
            Fremde zusammen, und die Gründer sind selbst noch minderjährig. Diese Punkte
            gehören jemandem vorgelegt, der sich damit auskennt, bevor die App über den
            Freundeskreis hinausgeht:
          </SsText>
          <View style={styles.offenListe}>
            <Offen text="Ab welchem Alter man mitmachen darf — und wie das geprüft wird" />
            <Offen text="Wer die App betreibt und haftet, wenn bei einem Treffen etwas passiert" />
            <Offen text="Was mit den Daten passiert (DSGVO), wie lange sie bleiben" />
            <Offen text="Was bei einem Verstoß passiert und wie man dagegen Einspruch erhebt" />
          </View>
          {/* Hier stand „Steht auch in `_FUER_IAN/OFFENE_SACHEN.md`." — eine Notiz an
              Ian, mitten in einem Screen, den Fremde lesen. Zwei Fehler in einer Zeile:
              Die Backticks sind eine Markdown-Konvention und wurden als Zeichen
              mitgerendert, und `_FUER_IAN/` ist ein privater Arbeitsordner, der auf
              einer öffentlich abrufbaren Adresse nichts verloren hat (harte Regel 12).
              Der Zeiger auf die Datei steht im Dateikopf, wo er hingehört. */}
        </SsCard>
      </View>

      <SsText variant="caption" color={colors.inkSoft} center style={styles.fuss}>
        {BRAND.name} · Prototyp, noch nicht öffentlich
      </SsText>
    </SsScreen>
  );
}

/**
 * Eine Hausregel.
 *
 * Die Nummer steht in einem eigenen Kästchen links, damit die sechs Regeln beim
 * Überfliegen als Liste lesbar sind. Ein Fließtext mit Absätzen würde niemand lesen —
 * und Regeln, die keiner liest, sind keine.
 */
function Regel({ nr, titel, text }: { nr: string; titel: string; text: string }) {
  return (
    <SsCard>
      <View style={styles.regelKopf}>
        <View style={styles.nummer}>
          <SsText variant="caption" color={colors.surface}>
            {nr}
          </SsText>
        </View>
        <SsText variant="bodyStrong" style={styles.regelTitel}>
          {titel}
        </SsText>
      </View>
      <SsText variant="body" color={colors.inkSoft}>
        {text}
      </SsText>
    </SsCard>
  );
}

function Offen({ text }: { text: string }) {
  return (
    <View style={styles.offen}>
      <SsText variant="body" color={colors.inkSoft}>
        ·
      </SsText>
      <SsText variant="body" color={colors.inkSoft} style={styles.offenText}>
        {text}
      </SsText>
    </View>
  );
}

const NUMMER = 22;

const styles = StyleSheet.create({
  seite: { gap: spacing.lg, paddingTop: spacing.sm },
  block: { gap: spacing.sm },

  regelKopf: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  nummer: {
    width: NUMMER,
    height: NUMMER,
    borderRadius: NUMMER / 2,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regelTitel: { flex: 1, minWidth: 0 },

  luecke: { backgroundColor: danger.soft, borderColor: danger.base },
  offenListe: { gap: spacing.xs },
  offen: { flexDirection: 'row', gap: spacing.sm },
  offenText: { flex: 1, minWidth: 0 },

  fuss: { marginTop: spacing.md },
});
