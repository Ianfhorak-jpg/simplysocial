import { StyleSheet, View } from 'react-native';

import { SsAvatar, SsCard, SsChip, SsText } from './ui';

import { freiePlaetze, istOffen, type FeedEintrag } from '@/features/posts/hooks';
import { useMeineAnfrage } from '@/features/requests/hooks';
import { startOderSeit } from '@/lib/zeit';
import { colors, spacing } from '@/theme';

/**
 * Eine Zeile im Feed.
 *
 * Warum liegt die hier und nicht in `components/ui/`? Weil sie das Datenmodell kennt.
 * Die Bausteine in `ui/` wissen nichts von Posts — man könnte sie in einer ganz anderen
 * App verwenden. Diese Karte gibt es nur, weil es Posts gibt. Die Trennung hält `ui/`
 * klein und austauschbar.
 *
 * ── Was auf der Karte steht und was nicht ─────────────────────────────────────
 * Drin: Kategorie, Titel, wann, wo, wer, wie viele Plätze, zwei Zeilen Notiz.
 * Draußen: Treffpunkt und Können-Niveau. Beides interessiert erst, wenn man den Post
 * ernsthaft erwägt — im Vorbeiscrollen sind es zwei Zeilen mehr, die man überliest.
 * Die Karte soll die Frage "ist das was für mich?" beantworten, nicht schon die
 * Frage "wie komme ich hin?".
 */
export function PostCard({
  eintrag,
  onPress,
}: {
  eintrag: FeedEintrag;
  /** Ohne `onPress` ist die Karte nicht antippbar — so steht sie als Vorschau im
      Erstellen-Screen, wo ein Klick ins Leere führen würde. */
  onPress?: () => void;
}) {
  const { post, author } = eintrag;
  // Eine abgelehnte Anfrage ist erledigt und wird nicht mehr angezeigt — sonst
  // stünde an der Karte dauerhaft eine Absage, die man nicht wegbekommt.
  const anfrage = useMeineAnfrage(post.id);
  const meineAnfrage = anfrage?.status === 'declined' ? undefined : anfrage;
  const offen = istOffen(post);
  const frei = freiePlaetze(post);

  return (
    <SsCard category={post.category} onPress={onPress} style={!offen && styles.geschlossen}>
      <View style={styles.kopf}>
        <SsChip category={post.category} />
        {post.visibility === 'followers' ? (
          <SsText variant="caption" color={colors.inkSoft}>
            🔒 Nur Follower
          </SsText>
        ) : null}
      </View>

      <SsText variant="heading">{post.title}</SsText>

      <SsText variant="caption" color={colors.inkSoft}>
        {startOderSeit(post.startsAt)}   ·   {post.district} Wien
      </SsText>

      {post.note ? (
        <SsText variant="caption" color={colors.inkSoft} numberOfLines={2}>
          {post.note}
        </SsText>
      ) : null}

      <View style={styles.fuss}>
        <View style={styles.person}>
          <SsAvatar emoji={author.avatar} seed={author.id} size="sm" />
          <SsText variant="caption" color={colors.ink} numberOfLines={1} style={styles.name}>
            {author.displayName}
          </SsText>
        </View>

        {meineAnfrage ? (
          <SsText
            variant="caption"
            color={meineAnfrage.status === 'accepted' ? colors.ink : colors.inkSoft}>
            {meineAnfrage.status === 'accepted' ? '🎉 Du bist dabei' : '✓ Angefragt'}
          </SsText>
        ) : (
          <SsText variant="caption" color={offen ? colors.ink : colors.inkSoft}>
            {plaetzeText(frei, offen)}
          </SsText>
        )}
      </View>
    </SsCard>
  );
}

/** "2 Plätze frei" · "1 Platz frei" · "Voll". Einzahl und Mehrzahl an einer Stelle. */
function plaetzeText(frei: number, offen: boolean): string {
  if (!offen || frei === 0) return 'Voll';
  return frei === 1 ? '1 Platz frei' : `${frei} Plätze frei`;
}

const styles = StyleSheet.create({
  // Volle Posts bleiben sichtbar, treten aber zurück: man soll sehen, dass etwas
  // läuft, ohne es für eine Einladung zu halten.
  geschlossen: { opacity: 0.62 },
  kopf: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  fuss: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  person: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  name: { fontWeight: '700' },
});
