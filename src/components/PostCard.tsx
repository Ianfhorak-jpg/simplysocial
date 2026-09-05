import { StyleSheet, View } from 'react-native';

import { SichtMarke } from './SichtMarke';
import { SsAvatar, SsCard, SsChip, SsIconText, SsText } from './ui';

import { alterAmPost } from '@/config/alter';
import { freiePlaetze, istOffen, type FeedEintrag } from '@/features/posts/hooks';
import { useMeineAnfrage } from '@/features/requests/hooks';
import { ortText } from '@/lib/bezirk';
import { startOderSeit } from '@/lib/zeit';
import { categoryColors, colors, spacing } from '@/theme';

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
        {/* Seit Phase 17 drei Stufen statt zwei — welche hier steht, entscheidet
            `SichtMarke`, weil der Gruppenname aus der Gruppe kommt und nicht aus
            dem Post. */}
        <SichtMarke visibility={post.visibility} />
      </View>

      <SsText variant="heading">{post.title}</SsText>

      {/* Zeit, Ort und — seit Phase 15 — für wen. Die Jahrgangs-Spanne steht hier in
          der ruhigen Zeile und nicht als eigene Pille: Sie ist eine Angabe wie der
          Ort, keine Auszeichnung. Und `alterAmPost` gibt `null` zurück, solange der
          Post für alle offen ist — das ist der Normalfall, und der braucht kein Wort.

          Auf der KARTE steht die Kurzform („Jg. 2009–2012"), im Detail der ganze Satz
          — beide kommen aus `config/alter.ts`, damit die Schreibweise einer Spanne
          nicht an zwei Stellen entsteht. */}
      <SsText variant="caption" color={colors.inkSoft}>
        {startOderSeit(post.startsAt)}   ·   {ortText(post.district)}
        {alterAmPost(post.alter) ? `   ·   ${alterAmPost(post.alter)}` : ''}
      </SsText>

      {post.note ? (
        <SsText variant="caption" color={colors.inkSoft} numberOfLines={2}>
          {post.note}
        </SsText>
      ) : null}

      <View style={styles.fuss}>
        <View style={styles.person}>
          <SsAvatar name={author.displayName} seed={author.id} photoUrl={author.photoUrl} size="sm" />
          <SsText variant="caption" color={colors.ink} numberOfLines={1} style={styles.name}>
            {author.displayName}
          </SsText>
        </View>

        {meineAnfrage ? (
          // Bestätigt bekommt die Kategoriefarbe, angefragt bleibt grau: Der Unterschied
          // zwischen „läuft" und „wartet" ist der wichtigste auf der Karte, und Farbe
          // sieht man im Vorbeiscrollen, ein anderes Wort nicht.
          meineAnfrage.status === 'accepted' ? (
            <SsIconText icon="funken" color={colors.ink} iconColor={categoryColors[post.category].onSoft}>
              Du bist dabei
            </SsIconText>
          ) : (
            <SsIconText icon="haken">Angefragt</SsIconText>
          )
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
