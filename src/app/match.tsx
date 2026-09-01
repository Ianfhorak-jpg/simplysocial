import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { SsAvatar, SsButton, SsCard, SsChip, SsKonfetti, SsScreen, SsText } from '@/components/ui';
import { useChatZuPost } from '@/features/chat/hooks';
import { usePost } from '@/features/posts/hooks';
import { useCurrentUser, useUser } from '@/features/social/hooks';
import { zurueckOderFeed } from '@/lib/navigation';
import { startOderSeit } from '@/lib/zeit';
import { colors, spacing } from '@/theme';

/**
 * Der Match-Moment — der emotionale Höhepunkt der App (PLAN.md, Abschnitt 1).
 *
 * Er kommt genau einmal im Ablauf vor: jemand hat "Bin dabei" gedrückt, du hast
 * bestätigt, und ab jetzt ist es eine Verabredung. Deshalb ist das ein eigener
 * Screen und keine Meldung in der Liste — eine Zeile, die nach drei Sekunden
 * verschwindet, kann man verpassen.
 *
 * ── Warum der Screen nichts verändert ─────────────────────────────────────────
 * Bestätigt wird im Anfragen-Tab, hier wird nur gefeiert. Ein Screen, der beim
 * Öffnen etwas speichert, würde beim Neuladen der Seite im Browser ein zweites Mal
 * speichern — auf Web ist die Adresse eines Screens jederzeit erreichbar.
 */
export default function MatchScreen() {
  const { postId, userId } = useLocalSearchParams<{ postId?: string; userId?: string }>();
  const eintrag = usePost(postId);
  const gast = useUser(userId);
  const ich = useCurrentUser();
  // Angelegt hat ihn `anfrageBestaetigen` im selben Klick (`features/chat/logic.ts`) —
  // hier wird er nur nachgeschlagen. Mit `userId`, weil bei mehreren Plätzen mehrere
  // Fäden am selben Post hängen und der Knopf in DIESEN führen soll.
  const chat = useChatZuPost(postId, userId);

  if (!eintrag || !gast) return <NichtsZuFeiern />;

  const { post } = eintrag;

  return (
    <View style={styles.wurzel}>
      <SsScreen scroll contentStyle={styles.seite}>
        <View style={styles.gesichter}>
          <SsAvatar emoji={ich.avatar} seed={ich.id} size="lg" />
          <SsText style={styles.haende}>🤝</SsText>
          <SsAvatar emoji={gast.avatar} seed={gast.id} size="lg" />
        </View>

        <SsText variant="display" center>
          Ihr seid verabredet
        </SsText>

        <SsText variant="body" center color={colors.inkSoft}>
          {gast.displayName} ist bei „{post.title}“ dabei.
        </SsText>

        <SsCard category={post.category} style={styles.karte}>
          <SsChip category={post.category} />
          <SsText variant="heading">{post.title}</SsText>
          <SsText variant="caption" color={colors.inkSoft}>
            {startOderSeit(post.startsAt)}   ·   {post.district} Wien
          </SsText>
          <SsText variant="caption" color={colors.inkSoft}>
            {post.meetingPoint ? `🚩 ${post.meetingPoint}` : '🚩 Treffpunkt macht ihr im Chat aus'}
          </SsText>
        </SsCard>

        <View style={styles.aktion}>
          {/* Seit Phase 5 der Hauptweg: Der Match-Moment endet nicht in einer
              Bestätigung, sondern im Gespräch — Treffpunkt und Uhrzeit macht man dort
              aus. Deshalb steht "Zum Chat" oben und in der Kategoriefarbe, und "Alles
              klar" darunter als Umriss. */}
          {chat ? (
            <SsButton
              variant="category"
              category={post.category}
              label="Zum Chat"
              icon="💬"
              block
              size="lg"
              onPress={() =>
                router.replace({ pathname: '/chat/[id]', params: { id: chat.id } })
              }
            />
          ) : null}
          <SsButton
            variant={chat ? 'ghost' : 'primary'}
            label="Alles klar"
            icon="👍"
            block
            size="lg"
            onPress={zurueckOderFeed}
          />
          <SsText variant="caption" center color={colors.inkSoft}>
            {gast.displayName} sieht die Verabredung jetzt auch.
          </SsText>
        </View>
      </SsScreen>

      {/* Nach dem Inhalt und damit darüber. Fängt keine Klicks ab (`pointerEvents`
          im Baustein), sonst läge es genau auf dem Knopf. */}
      <SsKonfetti />
    </View>
  );
}

/**
 * Wenn jemand `/match` ohne gültige Angaben aufruft — im Browser ist jede Adresse
 * direkt erreichbar, und ein Screen, der dann leer bleibt, sieht kaputt aus.
 */
function NichtsZuFeiern() {
  return (
    <SsScreen contentStyle={styles.fehlerSeite}>
      <SsText style={styles.fehlerEmoji}>🎊</SsText>
      <SsText variant="heading" center>
        Hier gibt es gerade nichts zu feiern
      </SsText>
      <SsText variant="body" center color={colors.inkSoft}>
        Dieser Match-Bildschirm gehört zu einer Bestätigung, die es nicht mehr gibt.
      </SsText>
      <SsButton label="Zu den Anfragen" onPress={() => router.replace('/requests')} />
    </SsScreen>
  );
}

const styles = StyleSheet.create({
  wurzel: { flex: 1, backgroundColor: colors.bg },
  seite: { flexGrow: 1, justifyContent: 'center', gap: spacing.lg, paddingVertical: spacing.xl },

  gesichter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  haende: { fontSize: 26, lineHeight: 32 },

  karte: { marginTop: spacing.sm },
  aktion: { gap: spacing.md, marginTop: spacing.sm },

  fehlerSeite: { alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  fehlerEmoji: { fontSize: 48, lineHeight: 58 },
});
