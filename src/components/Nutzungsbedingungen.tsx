import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { SsCard, SsIconText, SsText } from '@/components/ui';
import { BRAND } from '@/config/brand';
import { ANMELDE_QUELLE } from '@/features/auth/anmeldung';
import { zusageText } from '@/features/safety/meldung';
import { t } from '@/i18n';
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
/**
 * Die Moderations-Zusage als fertiger Satz.
 *
 * ⚠️ `zusageText()` gibt seit dem 2026-10-18 Schlüssel UND Fristen zurück, keinen
 * Satz — die Zahlen bleiben in `features/safety/meldung.ts` (harte Regel 100).
 * Hier wird beides zusammengesetzt, und zwar an EINER Stelle: Der Satz steckt in
 * zwei Regeln, und zweimal dasselbe zu schreiben ist zweimal die Gelegenheit,
 * es verschieden zu schreiben.
 */
function zusageSatz(): string {
  const { schluessel, werte } = zusageText();
  return t(schluessel, werte);
}

export function Nutzungsbedingungen() {
  return (
    <>
      <SsText variant="title">{t('regeln.titel')}</SsText>
      <SsText variant="body" color={colors.inkSoft}>
        {t('regeln.einleitung', { app: BRAND.name })}
      </SsText>

      <View style={styles.block}>
        <SsText variant="label" color={colors.inkSoft}>
          {t('regeln.wasGilt')}
        </SsText>

        <Regel
          nr="1"
          titel={t('regeln.keinDating')}
          text={t('regeln.keinDatingText', { app: BRAND.name })}
        />
        <Regel
          nr="2"
          titel={t('regeln.duBistDu')}
          text={t('regeln.duBistDuText')}
        />
        <Regel
          nr="3"
          titel={t('regeln.zusagenGelten')}
          text={t('regeln.zusagenGeltenText')}
        />
        <Regel
          nr="4"
          titel={t('regeln.keineWerbung')}
          text={t('regeln.keineWerbungText')}
        />
        <Regel
          nr="5"
          titel={t('regeln.oeffentlichTreffen')}
          text={t('regeln.oeffentlichTreffenText')}
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
          titel={t('regeln.meldenStattStreiten')}
          text={t('regeln.meldenStattStreitenText', { zusage: zusageSatz() })}
        />
      </View>

      <View style={styles.block}>
        <SsText variant="label" color={colors.inkSoft}>
          {t('regeln.rechtliches')}
        </SsText>

        <SsCard>
          <SsText variant="body">
            {t('regeln.betreiber', {
              app: BRAND.name,
              betreiber: BRAND.legal.betreiber,
              stadt: BRAND.city,
              kontakt: BRAND.legal.kontakt,
            })}
          </SsText>
          <SsText variant="body">
            {t('regeln.alter', { alter: BRAND.legal.mindestalter })}
          </SsText>
          <SsText variant="body">
            {t('regeln.regelbruch', { zusage: zusageSatz() })}
          </SsText>
        </SsCard>

        <Verweis
          titel={t('regeln.datenschutzTitel')}
          text={t('regeln.datenschutzText')}
          url={BRAND.legal.datenschutzUrl}
        />
        <Verweis
          titel={t('regeln.lizenzTitel')}
          text={t('regeln.lizenzText')}
          url={BRAND.legal.eulaUrl}
        />
        <Verweis
          titel={t('regeln.hilfeTitel')}
          text={t('regeln.hilfeText')}
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
  return ANMELDE_QUELLE === 'attrappe' ? t('regeln.prototypFassung') : fassungText();
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
      accessibilityLabel={t('regeln.oeffnetImBrowser', { titel, url })}
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
