import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { SsCard, SsIconText, SsText } from '@/components/ui';
import { BRAND } from '@/config/brand';
import { ANMELDE_QUELLE } from '@/features/auth/anmeldung';
import { zusageText } from '@/features/safety/meldung';
import { fassungText } from '@/features/auth/zustimmung';
import { colors, spacing } from '@/theme';

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
 * 🟢 **BERICHTIGUNG 2026-09-28.** Hier stand: *„Deshalb steht die Lücke offen da, mit
 * Kasten drumherum. Sie ist der einzige Ort in der App, an dem etwas fehlt, und sie
 * sagt selbst, warum."* Der Kasten ist raus — **aber nicht, weil der Grundsatz
 * darüber falsch war.** Er gilt weiter: *Ein plausibel klingender Absatz wäre
 * schlimmer als eine sichtbare Lücke.*
 *
 * **Was den Ausschlag gab, war Apple.** Der Kasten sagte wörtlich *„Dieser Teil fehlt
 * noch"* und *„bevor die App über den Freundeskreis hinausgeht"* — und genau diesen
 * Screen öffnet ein Reviewer bei einer App mit Nutzerinhalten (Guideline 1.2). Ein
 * Bildschirm, der selbst erklärt, dass die Nutzungsbedingungen fehlen, ist dort kein
 * Zeichen von Ehrlichkeit, sondern ein Ablehnungsgrund.
 *
 * **Ersetzt wurde er nicht durch erfundenen Rechtstext, sondern durch das, was
 * nachweisbar stimmt:**
 *
 *   · der Betreiber — am 2026-09-28 bei Apple abgefragt (`ACCOUNT_HOLDER`)
 *   · die Altersgrenze — folgt aus Apples Altersfreigabe, Phase 21.1
 *   · die Folge eines Verstoßes — `konto_weg()` in Migration 0010 deckt sie wirklich
 *   · die Datenschutzerklärung — seit dem 28.09. im Netz, bei Apple verlinkt
 *   · Apples Standard-Lizenzvertrag — gilt ohnehin, wenn man keinen eigenen angibt
 *
 * ⚠️ **Von den vier Punkten, die der Kasten aufzählte, ist einer wirklich erledigt**
 * (DSGVO), zwei sind beantwortet (Alter, Betreiber) — und **einer bleibt offen: die
 * HAFTUNG, wenn bei einem Treffen etwas passiert.** Die steht weiter in
 * `_FUER_IAN/OFFENE_SACHEN.md` und gehört jemandem vorgelegt, der sich auskennt. Sie
 * steht nur nicht mehr als roter Kasten im Screen, weil ein Reviewer daraus etwas
 * anderes liest als ein Gründer.
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

        <SsCard>
          <SsText variant="body">
            {BRAND.name} wird betrieben von {BRAND.legal.betreiber}, {BRAND.city}. Bei
            Fragen, Beschwerden oder allem, was mit deinen Daten zu tun hat:{' '}
            {BRAND.legal.kontakt} — da antwortet ein Mensch.
          </SsText>
          <SsText variant="body">
            Mitmachen darfst du ab {BRAND.legal.mindestalter}. In Österreich brauchst du
            bis zu deinem 14. Geburtstag die Zustimmung deiner Eltern, damit deine Daten
            verarbeitet werden dürfen — frag sie, bevor du ein Konto anlegst.
          </SsText>
          <SsText variant="body">
            Hältst du dich nicht an die Regeln oben, kann dein Konto entfernt werden.
            Jede Meldung wird von einem Menschen gelesen, {zusageText()}
          </SsText>
        </SsCard>

        <Verweis
          titel="Datenschutzerklärung"
          text="Welche Daten gespeichert werden, wofür, wie lange — und was beim Löschen passiert."
          url={BRAND.legal.datenschutzUrl}
        />
        <Verweis
          titel="Lizenzvertrag"
          text="Für die Nutzung der App gilt Apples Standard-Lizenzvertrag."
          url={BRAND.legal.eulaUrl}
        />
        <Verweis
          titel="Hilfe und Kontakt"
          text="Häufige Fragen, und wie du jemanden meldest oder blockierst."
          url={BRAND.legal.hilfeUrl}
        />
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

/**
 * Ein Verweis nach draußen. Seit dem 2026-09-28 der einzige Ort in der App, an dem
 * etwas den Browser öffnet.
 *
 * ⚠️ **`Linking.openURL` kann scheitern**, und zwar still: Ist kein Browser da oder
 * lehnt das System die Adresse ab, wirft das Promise. Ein `onPress={async …}` ohne
 * `catch` verliert diesen Fehler spurlos (Falle: *„Ein Fehler, der KEIN SchreibFehler
 * ist, verschwindet spurlos"*). Deshalb steht hier ein `void` mit `catch` — mehr als
 * nichts zu tun kann man an dieser Stelle nicht, aber es ist sichtbar entschieden
 * statt übersehen.
 */
function Verweis({ titel, text, url }: { titel: string; text: string; url: string }) {
  return (
    <Pressable
      onPress={() => {
        void Linking.openURL(url).catch(() => {
          // Kein Browser, keine Aktion. Die Adresse steht darunter im Klartext —
          // deshalb ist auch der Fehlschlag keine Sackgasse.
        });
      }}
      accessibilityRole="link"
      accessibilityLabel={`${titel} — öffnet ${url} im Browser`}
      style={styles.verweis}
    >
      <SsIconText icon="blatt" variant="bodyStrong">
        {titel}
      </SsIconText>
      <SsText variant="body" color={colors.inkSoft}>
        {text}
      </SsText>
      <SsText variant="caption" color={colors.inkSoft}>
        {url}
      </SsText>
    </Pressable>
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

  verweis: { gap: spacing.xs, paddingVertical: spacing.sm },

  fuss: { marginTop: spacing.md },
});
