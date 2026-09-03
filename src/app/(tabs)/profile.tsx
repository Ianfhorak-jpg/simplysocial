import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Profil } from '@/components/Profil';
import { SsButton, SsScreen, SsText } from '@/components/ui';
import { useMeineGruppen } from '@/features/groups/hooks';
import { useCurrentUser } from '@/features/social/hooks';
import { colors, spacing } from '@/theme';

/**
 * Das eigene Profil — was andere von einem sehen.
 *
 * Der ganze Inhalt kommt aus `components/Profil.tsx`, demselben Baustein wie beim
 * fremden Profil. Das ist der Punkt: Man soll sich darauf verlassen können, dass das
 * hier genau das ist, was Lea sieht, wenn sie auf den Namen tippt. Zwei getrennte
 * Screens würden irgendwann auseinanderlaufen, und dann wüsste man es nicht mehr.
 *
 * Es gibt deshalb hier auch keinen "Bearbeiten"-Knopf: Ohne Login und ohne Backend
 * gäbe es nichts zu speichern (harte Regel 1). Er kommt, wenn es ein Konto gibt.
 *
 * ── Seit Phase 7 steht hier ein Zahnrad statt des Werkstatt-Knopfes ───────────
 * Der Werkstatt-Knopf (`/bausteine`) hing seit Phase 2 unten am Profil, mit der Notiz,
 * dass er „spätestens mit den Einstellungen aus Phase 7" verschwindet. Er ist nicht
 * verschwunden, sondern umgezogen: nach `/einstellungen`, zusammen mit allem anderen,
 * was kein Screen für sich ist. Das Profil ist ein Produkt-Screen — das Erste, was
 * Ians Freunde davon sehen —, und ein Knopf für Entwickler gehört dort nicht hin.
 *
 * Der Weg zu den Einstellungen liegt am eigenen Profil und NUR dort. Ein eigener Tab
 * dafür wäre die fünfte Schaltfläche in einer Leiste mit vier, für einen Screen, den
 * man dreimal im Jahr braucht. Am eigenen Profil sucht man ihn zuerst.
 */
export default function ProfileScreen() {
  const ich = useCurrentUser();
  const meineGruppen = useMeineGruppen();

  return (
    <SsScreen tabScreen scroll contentStyle={styles.seite}>
      <SsText variant="title">Dein Profil</SsText>

      <Profil
        person={ich}
        fuss={
          <View style={styles.fuss}>
            {/* Der Weg zu den Gruppen liegt hier und nicht in der Tab-Leiste (die
                Begründung steht im Kopf von `app/gruppen.tsx`). Die Zeile darunter
                sagt, was einen erwartet — ohne sie ist „Gruppen" ein Knopf, hinter
                dem alles Mögliche sein könnte. */}
            <SsButton
              label="Deine Gruppen"
              icon="personen"
              variant="ghost"
              block
              onPress={() => router.push('/gruppen')}
            />
            <SsText variant="caption" color={colors.inkSoft} center>
              {meineGruppen.length === 0
                ? `Noch in keiner. Für eine Gruppe kannst du gezielt posten.`
                : meineGruppen.map((g) => g.name).join(' · ')}
            </SsText>

            <SsButton
              label="Einstellungen"
              icon="regler"
              variant="ghost"
              block
              onPress={() => router.push('/einstellungen')}
            />
            <SsText variant="caption" color={colors.inkSoft} center>
              Blockierte Personen · Nutzungsbedingungen · Account löschen
            </SsText>
          </View>
        }
      />
    </SsScreen>
  );
}

const styles = StyleSheet.create({
  seite: { gap: spacing.lg, paddingTop: spacing.sm },
  // Die Zeile darunter nennt, was drinsteht. Ohne sie ist „Einstellungen" ein Knopf,
  // hinter dem alles Mögliche sein könnte — und genau die drei Sachen, die Apple
  // sehen will, findet man dann nicht.
  fuss: { marginTop: spacing.xl, gap: spacing.sm },
});
