import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';

import { SsAvatar, SsBack, SsCard, SsIcon, SsIconText, SsScreen, SsText } from './ui';

import {
  useCurrentUser,
  useFolgeListe,
  useUser,
  type FolgeListe as Art,
} from '@/features/social/hooks';
import { CURRENT_USER_ID } from '@/features/store';
import { colors, spacing } from '@/theme';
import type { User } from '@/types/models';

/**
 * Wer jemandem folgt bzw. wem jemand folgt — der Inhalt beider Listen-Screens.
 *
 * ── Warum hier kein Folgen-Knopf steht ────────────────────────────────────────
 * Instagram hat an jeder Zeile einen. Hier nicht: In einer App, in der man sich mit
 * Fremden verabredet, sollte „folgen" eine Entscheidung sein, die man trifft, nachdem
 * man auf das Profil geschaut hat — nicht eine, die man aus einer Namensliste heraus
 * abarbeitet. Die Zeile führt deshalb aufs Profil, und dort steht der Knopf.
 *
 * Rechts steht trotzdem, ob man der Person schon folgt. Das beantwortet die häufigste
 * Frage beim Durchsehen einer solchen Liste („kenne ich die schon?"), ohne eine
 * zweite Handlung anzubieten.
 */
export function FolgeListeScreen({ userId, art }: { userId: string | undefined; art: Art }) {
  const person = useUser(userId);
  const leute = useFolgeListe(userId, art);
  const ich = useCurrentUser();

  // `undefined` heißt "diesen Nutzer gibt es nicht" — eine LEERE Liste heißt "es gibt
  // ihn, ihm folgt nur niemand". Zwei verschiedene Aussagen, deshalb zwei Zweige.
  if (!person || !leute) return <NichtGefunden />;

  const wen = person.id === CURRENT_USER_ID ? { dativ: 'dir', nominativ: 'du' } : { dativ: person.displayName, nominativ: person.displayName };

  return (
    <SsScreen contentStyle={styles.seite}>
      <View style={styles.kopf}>
        <SsBack />
        <SsText variant="title">{art === 'follower' ? 'Follower' : 'Folgt'}</SsText>
        {/* „Wer … folgt" gegen „Wem … folgt": Im Deutschen macht der Fall den
            Unterschied zwischen den beiden Listen deutlicher als jedes Wort, das man
            in die Überschrift schreiben könnte. */}
        <SsText variant="caption" color={colors.inkSoft}>
          {art === 'follower' ? `Wer ${wen.dativ} folgt` : `Wem ${wen.nominativ} folgt`}
        </SsText>
      </View>

      <FlatList
        data={leute}
        keyExtractor={(u) => u.id}
        renderItem={({ item }) => (
          <PersonZeile person={item} folgeIch={ich.followingIds.includes(item.id)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.luecke} />}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <SsText variant="body" color={colors.inkSoft} center style={styles.leer}>
            {art === 'follower' ? 'Noch keine Follower.' : 'Folgt noch niemandem.'}
          </SsText>
        }
      />
    </SsScreen>
  );
}

function PersonZeile({ person, folgeIch }: { person: User; folgeIch: boolean }) {
  const binIch = person.id === CURRENT_USER_ID;

  return (
    <SsCard onPress={() => router.push({ pathname: '/user/[id]', params: { id: person.id } })}>
      <View style={styles.zeile}>
        <SsAvatar name={person.displayName} seed={person.id} photoUrl={person.photoUrl} size="md" />

        <View style={styles.text}>
          <SsText variant="bodyStrong" numberOfLines={1}>
            {person.displayName}
          </SsText>
          <SsText variant="caption" color={colors.inkSoft} numberOfLines={1}>
            {person.handle} · {person.district} Wien
          </SsText>
        </View>

        {binIch ? (
          <SsText variant="caption" color={colors.inkSoft}>
            Du
          </SsText>
        ) : folgeIch ? (
          <SsIconText icon="haken">Du folgst</SsIconText>
        ) : null}
      </View>
    </SsCard>
  );
}

function NichtGefunden() {
  return (
    <SsScreen contentStyle={styles.fehlerSeite}>
      <SsIcon name="frage" size={52} color={colors.inkSoft} />
      <SsText variant="heading" center>
        Diese Person gibt es nicht
      </SsText>
    </SsScreen>
  );
}

const styles = StyleSheet.create({
  seite: { paddingHorizontal: 0 },
  kopf: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md, gap: spacing.sm },

  liste: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  luecke: { height: spacing.md },
  leer: { marginTop: spacing.xl },

  zeile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  // `minWidth: 0`, sonst drückt ein langer Name den Status rechts aus der Karte.
  text: { flex: 1, minWidth: 0, gap: 2 },

  fehlerSeite: { alignItems: 'center', justifyContent: 'center', gap: spacing.md },
});
