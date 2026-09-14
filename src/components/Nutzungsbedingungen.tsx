import { StyleSheet, View } from 'react-native';

import { SsCard, SsIconText, SsText } from '@/components/ui';
import { BRAND } from '@/config/brand';
import { ANMELDE_QUELLE } from '@/features/auth/anmeldung';
import { zusageText } from '@/features/safety/meldung';
import { fassungText } from '@/features/auth/zustimmung';
import { colors, danger, spacing } from '@/theme';

/**
 * Der INHALT der Nutzungsbedingungen — ohne Hülle, ohne Zurück-Knopf.
 *
 * ── Warum das seit dem 2026-09-14 eine eigene Komponente ist ─────────────────
 * Dieselbe Bauart und derselbe Grund wie `components/Profil.tsx` (harte Regel 7):
 * Der Text steht jetzt an ZWEI Stellen im Bild, und er darf nur EINMAL im Code
 * stehen.
 *
 *   1. `app/nutzungsbedingungen.tsx` — die Route, erreichbar aus den Einstellungen.
 *   2. `components/ErstesKonto.tsx` — als Fläche über dem Formular, wenn jemand
 *      neben dem Häkchen auf „Nutzungsbedingungen" tippt (Ians Entscheidung 80).
 *
 * **Der zweite Weg kann KEINE Route sein**, und das ist kein Schönheitsfehler:
 * Solange der Torwächter `'erstes-konto'` zeigt, wird der `Stack` in `_layout.tsx`
 * gar nicht gezeichnet — bewusst, damit kein Feed dahinter „Noch nichts los" sagt
 * (Ians Entscheidung 43). Ein `router.push('/nutzungsbedingungen')` von dort aus
 * wechselt die Adresse und zeigt NICHTS. Verwandt mit der Falle *„Beim ABBAU eines
 * Navigators schreibt expo-router die Adresse neu"*: Die Route ist da, der Baum
 * nicht.
 *
 * ── Warum hier zwei verschiedene Sorten Text stehen ──────────────────────────
 * Der Text zerfällt in zwei Hälften, und die Trennung ist Absicht:
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
export function Nutzungsbedingungen() {
  return (
    <>
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
        {/*
          Der zweite Satz kommt aus `features/safety/meldung.ts` und ist NICHT hier
          getippt — Ians Entscheidung 59 (24 h bei Gefahr und Belästigung, 48 h
          sonst). Er steht damit an genau einer Stelle, aus der auch der Befehl am
          Mac (`npm run meldungen`) seine Fristen nimmt.

          **Der Grund ist ein Fehler, den dieses Projekt schon einmal gemacht hat:**
          Der Lösch-Screen versprach seit Phase 7 im JSX das GEGENTEIL dessen, was
          Ians Entscheidung 39 später festlegte (PLAN.md 20.1/20.2, Punkt 7) — ein
          getippter Satz wandert nicht mit. Hier wiegt das schwerer als dort: Diese
          Zusage liest ein Apple-Reviewer, und sie ist eine Zusage in Ians Namen.
        */}
        <Regel
          nr="6"
          titel="Melden statt streiten"
          text={`Wenn jemand sich danebenbenimmt: melden und blockieren. Beides erfährt die andere Person nicht. ${zusageText()}`}
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
              einer öffentlich abrufbaren Adresse nichts verloren hat (harte Regel 12). */}
        </SsCard>
      </View>

      <SsText variant="caption" color={colors.inkSoft} center style={styles.fuss}>
        {BRAND.name} · {fussText()}
      </SsText>
    </>
  );
}

/**
 * Was ganz unten steht.
 *
 * ── Der Satz, der die App fast aus dem Review geworfen hätte ─────────────────
 * Hier stand bis zum 2026-09-14 fest im JSX: **„Prototyp, noch nicht öffentlich"**.
 * Auf der öffentlichen Adresse stimmt das — dort ist es der Prototyp mit
 * Fake-Daten (Ians Entscheidung 75). **Im Build, der zu Apple geht, ist es ein
 * Ablehnungsgrund:** Apple weist Apps zurück, die sich selbst als Beta-, Demo-
 * oder Testfassung ausgeben, und die Nutzungsbedingungen sind ausgerechnet der
 * Screen, den ein Reviewer bei einer 1.2-App mit Sicherheit aufmacht.
 *
 * Der Gerätedurchgang vom 13.09. hat „kein Prototyp-Hinweis ✓" gemeldet und damit
 * das VOLLBILD `PrototypHinweis` gemeint — nicht diese Zeile. *Zwei Größen mit
 * fast gleichem Namen sind der Fehler, den man nur beim Lesen findet* (FALLEN.md).
 *
 * ── Warum die Ableitung HIER steht und nicht in `anmeldung.ts` ──────────────
 * Harte Regel 95: Eine Ableitung von `ANMELDE_QUELLE` steht dort, wo ihre Frage
 * gestellt wird. Die Frage lautet „was steht unter den Nutzungsbedingungen?", und
 * sie wird nirgendwo sonst gestellt.
 *
 * Was im echten Build stattdessen dasteht, ist nicht nur harmlos, sondern nützlich:
 * die FASSUNG, der man zustimmt. Damit kann ein Mensch nachsehen, welchem Stand er
 * zugestimmt hat — dieselbe Zeichenkette, die `zustimmung.ts` in die Datenbank
 * schreibt.
 */
function fussText(): string {
  return ANMELDE_QUELLE === 'attrappe' ? 'Prototyp, noch nicht öffentlich' : fassungText();
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
