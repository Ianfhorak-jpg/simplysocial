import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PostCard } from './PostCard';
import { SsAvatar, SsCard, SsChip, SsIconText, SsText } from './ui';

import { AGE_LABELS } from '@/config/alter';
import { useProfilPosts } from '@/features/posts/hooks';
import { CURRENT_USER_ID } from '@/features/store';
import { colors, radius, spacing } from '@/theme';
import type { User } from '@/types/models';

/**
 * Der Inhalt eines Profils — für das eigene (`(tabs)/profile.tsx`) und für fremde
 * (`user/[id]/index.tsx`) derselbe.
 *
 * ── Warum ein gemeinsamer Baustein und nicht zwei Screens ─────────────────────
 * Die beiden Screens unterscheiden sich in genau zwei Dingen: was oben in der Karte
 * als Aktion steht (Folgen-Knopf vs. nichts) und was ganz unten hängt. Alles andere —
 * Kopf, Zahlen, Interessen, Posts — ist identisch. Zweimal geschrieben würde es beim
 * ersten Umbau auseinanderlaufen, und dann sieht das eigene Profil anders aus als
 * das, was andere von einem sehen. Genau das darf nicht passieren: Man muss sich
 * darauf verlassen können, dass das eigene Profil zeigt, was Fremde sehen.
 *
 * Wie bei `PostCard` liegt der Baustein in `components/` und nicht in `components/ui/`
 * — er kennt das Datenmodell und wäre in einer anderen App nutzlos.
 *
 * ── Warum die Interessen ÜBER den Posts stehen ────────────────────────────────
 * Ians Regel 6.6 (`features/posts/profil.ts`): auf dem Profil steht nur, was gerade
 * läuft. Die meisten Leute haben die meiste Zeit nichts geplant — dann sind Bio,
 * Bezirk und Interessen alles, was die Frage „soll ich der Person schreiben?"
 * beantwortet. Sie tragen hier die Last, die sonst die Post-Liste trägt, und stehen
 * deshalb nicht als Beiwerk unten.
 */
export function Profil({
  person,
  aktion,
  fuss,
}: {
  person: User;
  /** Steht in der Kopfkarte unter den Zahlen — der Folgen-Knopf am fremden Profil. */
  aktion?: ReactNode;
  /** Ganz unten, nach den Posts. */
  fuss?: ReactNode;
}) {
  const { eintraege, verborgen } = useProfilPosts(person.id);
  const binIch = person.id === CURRENT_USER_ID;

  return (
    <>
      <SsCard>
        <View style={styles.kopf}>
          <SsAvatar name={person.displayName} seed={person.id} photoUrl={person.photoUrl} size="lg" />
          <View style={styles.kopfText}>
            <SsText variant="title" numberOfLines={1}>
              {person.displayName}
            </SsText>
            {/* Handle, Bezirk und seit Phase 15 die Altersgruppe — Darias Frage
                („Foto von der Person oder halt Altersgruppe") wird hier beantwortet,
                gleich neben dem Avatar. Der Bezirk einer PERSON ist Pflicht und wird
                deshalb direkt geschrieben; nur ein Post darf ohne auskommen (harte
                Regel 20). */}
            <SsText variant="caption" color={colors.inkSoft}>
              {person.handle} · {person.district} Wien · {AGE_LABELS[person.ageGroup]}
            </SsText>
          </View>
        </View>

        {person.bio ? <SsText variant="body">{person.bio}</SsText> : null}

        <View style={styles.zahlen}>
          <Zahl
            wert={person.followerIds.length}
            wort="Follower"
            onPress={() =>
              router.push({ pathname: '/user/[id]/follower', params: { id: person.id } })
            }
          />
          <View style={styles.zahlenTrenner} />
          <Zahl
            wert={person.followingIds.length}
            wort="Folgt"
            onPress={() =>
              router.push({ pathname: '/user/[id]/following', params: { id: person.id } })
            }
          />
        </View>

        {aktion}
      </SsCard>

      {person.interests.length > 0 ? (
        <View style={styles.block}>
          <SsText variant="label" color={colors.inkSoft}>
            Interessen
          </SsText>
          <View style={styles.pillen}>
            {person.interests.map((k) => (
              <SsChip key={k} category={k} />
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.block}>
        <SsText variant="label" color={colors.inkSoft}>
          {binIch ? 'Was du vorhast' : `Was ${person.displayName} vorhat`}
        </SsText>

        {eintraege.length > 0 ? (
          eintraege.map((eintrag) => (
            <PostCard
              key={eintrag.post.id}
              eintrag={eintrag}
              onPress={() =>
                router.push({ pathname: '/post/[id]', params: { id: eintrag.post.id } })
              }
            />
          ))
        ) : (
          <SsText variant="body" color={colors.inkSoft}>
            {binIch
              ? 'Du hast gerade nichts geplant. Was hier steht, verschwindet mit dem Tag — wie im Feed.'
              : `${person.displayName} hat gerade nichts geplant.`}
          </SsText>
        )}

        {/* Die Zahl ist der ehrlichste Grund zu folgen, den die App geben kann: Sie
            sagt, dass da etwas ist, ohne zu verraten, was. Steht auch (und gerade
            dann) da, wenn die Liste darüber leer ist. */}
        {verborgen.follower > 0 ? (
          <SsIconText icon="schloss">
            {`${postText(verborgen.follower)} nur für Follower sichtbar.`}
          </SsIconText>
        ) : null}

        {/* Seit Phase 17 eine zweite Zeile statt einer größeren Zahl. Ein
            Gruppen-Post unter „nur für Follower" wäre eine falsche Auskunft — sie
            legt nahe, dass Folgen hilft, und das tut es hier nicht. WELCHE Gruppe
            es ist, steht bewusst nicht da: Das gehört zu dem, was eine
            geschlossene Gruppe zurückhält. */}
        {verborgen.gruppe > 0 ? (
          <SsIconText icon="personen">
            {`${postText(verborgen.gruppe)} nur für eine Gruppe sichtbar.`}
          </SsIconText>
        ) : null}
      </View>

      {fuss}
    </>
  );
}

/**
 * Eine antippbare Zahl: „12 Follower".
 *
 * Zahl und Wort stehen absichtlich untereinander und nicht in einer Zeile — dadurch
 * ist die Zahl das Große und das Wort die Erklärung, und beide Blöcke sind gleich
 * breit, egal ob dort 3 oder 128 steht.
 */
function Zahl({ wert, wort, onPress }: { wert: number; wort: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${wert} ${wort}`}
      style={({ pressed }) => [styles.zahl, pressed && styles.zahlGedrueckt]}>
      <SsText variant="heading" center>
        {wert}
      </SsText>
      <SsText variant="caption" center color={colors.inkSoft}>
        {wort}
      </SsText>
    </Pressable>
  );
}

/** „1 Post ist" / „3 Posts sind" — Einzahl und Mehrzahl an einer Stelle. */
function postText(anzahl: number): string {
  return anzahl === 1 ? '1 Post ist' : `${anzahl} Posts sind`;
}

const styles = StyleSheet.create({
  kopf: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  // `minWidth: 0`, sonst schrumpft der Textblock nicht unter seine Eigenbreite und
  // ein langer Name drückt den Avatar aus der Karte (Falle aus Phase 3).
  kopfText: { flex: 1, minWidth: 0, gap: 2 },

  zahlen: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.md,
  },
  zahlenTrenner: { width: 1, alignSelf: 'stretch', backgroundColor: colors.line },
  zahl: { flex: 1, paddingVertical: spacing.xs, borderRadius: radius.sm, cursor: 'pointer' },
  zahlGedrueckt: { backgroundColor: colors.bg },

  block: { gap: spacing.sm },
  pillen: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
