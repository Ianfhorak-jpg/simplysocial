import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SsBack, SsButton, SsCard, SsIcon, SsScreen, SsText } from '@/components/ui';
import { BRAND } from '@/config/brand';
import { loeschFolgen } from '@/features/safety/konto';
import { kontoLoeschen, useMeineSpuren } from '@/features/safety/hooks';
import { useWartetAuf } from '@/features/store';
import { useCurrentUser } from '@/features/social/hooks';
import { colors, danger, spacing } from '@/theme';

/**
 * Account löschen — der vierte Punkt aus Apples Guideline 1.2.
 *
 * ── Warum ein eigener Screen und keine Rückfrage in den Einstellungen ─────────
 * Sonst steht der gefährlichste Knopf der App zwischen „Nutzungsbedingungen" und
 * „Bausteine" und ist einen Fehlgriff weit entfernt. Ein eigener Screen kostet einen
 * Klick und macht aus dem Versehen eine Absicht. Er ist außerdem der Ort, an dem
 * stehen kann, WAS verschwindet — in einer Zeile hätte das keinen Platz.
 *
 * ── Warum es zwei Schritte sind ───────────────────────────────────────────────
 * In dieser App wird sonst nirgends nachgefragt: Entfolgen, Ablehnen, Anfrage
 * zurücknehmen — alles passiert sofort, weil man alles davon rückgängig machen kann
 * (Begründungen in `user/[id]/index.tsx` und `requests/hooks.ts`). Löschen kann man
 * nicht rückgängig machen. Das ist der einzige Grund für eine Rückfrage, und deshalb
 * ist es hier der einzige Ort mit einer.
 *
 * ── Seit dem 2026-09-12 löscht der letzte Knopf WIRKLICH ──────────────────────
 * Hier stand über Wochen, die letzte Zeile könne „ohne Backend niemand schreiben".
 * Sie ist geschrieben: `kontoLoeschen()` ruft `konto_loeschen()` aus 0003 auf, und
 * danach steht man abgemeldet vor dem Anmelde-Bildschirm mit einer Quittung (Ians
 * Entscheidung 52). Von Apples vier Pflichten aus Richtlinie 1.2 ist das die
 * einzige, die ein Prüfer wirklich AUSPROBIERT.
 *
 * ── Und warum der Prototyp trotzdem „Hier wäre Schluss" zeigt ─────────────────
 * Auf der öffentlichen Adresse steht `ANMELDE_QUELLE` weiter auf `'attrappe'`: Es
 * gibt genau einen Nutzer, und der ist der, als den man die App bedient. Löschte man
 * ihn, wäre der Prototyp danach kaputt und Ian könnte ihn niemandem mehr zeigen.
 * Der Screen entscheidet das aber NICHT selbst — er fragt nicht nach
 * `LIEST_AUS_SUPABASE`, sondern liest den AUSGANG (`LoeschAusgang`). Sonst stünde
 * die Frage „läuft hier echte Anmeldung?" an einer Stelle mehr, und harte Regel 74
 * gilt auch für das, was man aus einem Schalter ABLEITET.
 */
export default function AccountLoeschenScreen() {
  const ich = useCurrentUser();
  const spuren = useMeineSpuren();
  const [schritt, setSchritt] = useState<'info' | 'sicher' | 'fertig'>('info');
  // `'fertig'` bedeutet seit heute nur noch EINES: der Prototyp-Ausgang. Wer wirklich
  // löscht, sieht diesen Screen nie wieder — der Torwächter baut den Stack ab, sobald
  // `hinausNachLoeschen()` durch ist (Ians Entscheidung 52).
  const wartet = useWartetAuf('kontoLoeschen', ich.id);

  /**
   * Der letzte Klick.
   *
   * Bei `'fehler'` passiert hier NICHTS — und das ist kein vergessener Zweig: Die
   * Fehlerleiste steht dann schon oben, samt dem Satz aus Ians Entscheidung 53, und
   * der Screen ist unverändert der, auf dem der Knopf steht. Ein zweiter Hinweis
   * daneben wäre dieselbe Auskunft zweimal (harte Regel 63) — genau der Fehler, den
   * `StapelDurch` über `LeererFeed` einmal gemacht hat.
   */
  async function loeschen(): Promise<void> {
    if (await kontoLoeschen() === 'prototyp') setSchritt('fertig');
  }

  if (schritt === 'fertig') {
    return (
      <SsScreen contentStyle={styles.endeSeite}>
        {/* Ein durchgestrichener Kreis: Der Screen sagt, hier waere Schluss — die
            einzige Stelle der App, an der das Icon ein Ende meint und keinen Weg. */}
        <SsIcon name="kreuzKreis" size={52} color={colors.inkSoft} />
        <SsText variant="heading" center>
          Hier wäre Schluss
        </SsText>
        <SsText variant="body" center color={colors.inkSoft}>
          Im echten Betrieb wäre dein Konto jetzt weg und du wärst abgemeldet. Im
          Prototyp gibt es noch keine Konten — es ist nichts gelöscht worden.
        </SsText>
        <SsButton label="Zurück zum Feed" onPress={() => router.replace('/')} />
      </SsScreen>
    );
  }

  return (
    <SsScreen scroll contentStyle={styles.seite}>
      <SsBack />

      <SsText variant="title">Account löschen</SsText>
      <SsText variant="body" color={colors.inkSoft}>
        Du bist {ich.displayName} ({ich.handle}). Wenn du dein Konto löschst, ist das
        endgültig — es gibt keinen Weg zurück.
      </SsText>

      <View style={styles.block}>
        <SsText variant="label" color={colors.inkSoft}>
          Das verschwindet
        </SsText>
        <SsCard>
          <Zahl wert={spuren.posts} einzahl="Post" mehrzahl="Posts" zusatz="auch abgelaufene" />
          <Zahl wert={spuren.chats} einzahl="Chat" mehrzahl="Chats" zusatz="mit allen Nachrichten" />
          <Zahl
            wert={spuren.anfragen}
            einzahl="Anfrage"
            mehrzahl="Anfragen"
            zusatz="die du geschickt hast"
          />
          <Zahl
            wert={spuren.follower + spuren.folgt}
            einzahl="Verbindung"
            mehrzahl="Verbindungen"
            zusatz={`${spuren.follower} Follower · du folgst ${spuren.folgt}`}
          />
        </SsCard>
      </View>

      {/* Was mit den ANDEREN passiert, steht extra. Es ist der Teil, an den man beim
          Löschen zuletzt denkt — und der Einzige, den man hinterher nicht mehr
          richtigstellen kann.

          Die Sätze kommen aus `loeschFolgen()` neben der Regel und stehen NICHT hier
          im JSX (harte Regel 17, dieselbe Bauart wie `blockFolgen()`). Bis zum
          2026-09-06 standen sie hier — und behaupteten „die Nachrichten bleiben bei
          den anderen stehen", also Möglichkeit B, während Ian A gewählt hat. Ein fest
          getippter Satz ändert sich nicht mit, wenn jemand die Regel ändert. */}
      <SsCard>
        <SsText variant="bodyStrong">Was die anderen merken</SsText>
        {loeschFolgen(spuren.gruppenAlsGruender, spuren.nachfolgerName).map((satz) => (
          <SsText key={satz} variant="body" color={colors.inkSoft}>
            {satz}
          </SsText>
        ))}
      </SsCard>

      {schritt === 'info' ? (
        <View style={styles.aktion}>
          <SsButton
            variant="danger"
            label="Account löschen"
            icon="muell"
            block
            size="lg"
            onPress={() => setSchritt('sicher')}
          />
          <SsText variant="caption" color={colors.inkSoft} center>
            Du wirst noch einmal gefragt.
          </SsText>
        </View>
      ) : (
        <View style={styles.aktion}>
          <SsCard style={styles.warnung}>
            <SsText variant="bodyStrong" color={danger.onSoft}>
              Wirklich löschen?
            </SsText>
            <SsText variant="body">
              Das lässt sich nicht rückgängig machen. Dein Konto bei {BRAND.name} und
              alles oben ist danach weg.
            </SsText>
          </SsCard>
          {/* Der zerstörerische Knopf ist hier der Umriss und „Doch nicht" der gefüllte:
              Wer bis hierher gekommen ist, soll den Ausweg als Hauptweg vorfinden.
              Dieselbe Haltung wie bei „Ablehnen" neben „Bestätigen" in Phase 4. */}
          <SsButton
            variant="danger"
            label="Ja, Konto endgültig löschen"
            block
            size="lg"
            wartet={wartet}
            onPress={() => void loeschen()}
          />
          {/* Während gelöscht wird, bleibt „Doch nicht" stehen und wird nur stumm.
              Ihn zu ENTFERNEN wäre der naheliegende Weg und der schlechtere: Der
              Bildschirm spränge unter der Hand, und zwar genau in dem Augenblick,
              in dem jemand vielleicht doch noch danach greift. */}
          <SsButton
            label="Doch nicht"
            block
            disabled={wartet}
            onPress={() => setSchritt('info')}
          />
        </View>
      )}
    </SsScreen>
  );
}

/**
 * Eine Zeile „3 Posts — auch abgelaufene".
 *
 * Die Zahl steht vorne und in Textfarbe, der Zusatz dahinter leise. Bei 0 bleibt die
 * Zeile stehen, statt zu verschwinden: „0 Chats" ist eine Auskunft, eine fehlende
 * Zeile ist keine — und wer beim zweiten Lesen zählt, soll dieselbe Liste vorfinden.
 */
function Zahl({
  wert,
  einzahl,
  mehrzahl,
  zusatz,
}: {
  wert: number;
  einzahl: string;
  mehrzahl: string;
  zusatz: string;
}) {
  return (
    <View style={styles.zahl}>
      <SsText variant="bodyStrong">
        {wert} {wert === 1 ? einzahl : mehrzahl}
      </SsText>
      <SsText variant="caption" color={colors.inkSoft}>
        {zusatz}
      </SsText>
    </View>
  );
}

const styles = StyleSheet.create({
  seite: { gap: spacing.md, paddingTop: spacing.sm },
  block: { gap: spacing.sm },
  zahl: { gap: 1 },
  aktion: { gap: spacing.md, marginTop: spacing.sm },
  warnung: { backgroundColor: danger.soft, borderColor: danger.base },

  endeSeite: { alignItems: 'center', justifyContent: 'center', gap: spacing.md },
});
