import { router } from 'expo-router';
import { useMemo } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';

import { SsAvatar, SsButton, SsCard, SsScreen, SsText } from '@/components/ui';
import { CATEGORIES } from '@/config/categories';
import { useChatListe, type ChatEintrag } from '@/features/chat/hooks';
import { NACHKLANG_TAGE } from '@/features/chat/lifecycle';
import { CURRENT_USER_ID } from '@/features/store';
import { startOderSeit, vergangen } from '@/lib/zeit';
import { colors, spacing } from '@/theme';

/**
 * Der Chats-Tab: alle Verabredungen, an denen gerade geschrieben wird.
 *
 * ── Warum hier keine Kontaktliste steht ───────────────────────────────────────
 * In den meisten Apps ist die Chat-Liste eine Liste von MENSCHEN. Hier ist sie eine
 * Liste von TREFFEN — deshalb steht unter jedem Namen, worum es geht. Bei zwei
 * Verabredungen mit derselben Person sind das zwei Zeilen und nicht eine, in der
 * beides durcheinandergeht. Das ist die direkte Folge daraus, dass ein Chat immer an
 * einem Post hängt (`features/chat/logic.ts`).
 *
 * ── Die zwei Gruppen ──────────────────────────────────────────────────────────
 * Ians Regel aus `features/chat/lifecycle.ts`: Nach dem Treffen rutscht ein Chat unter
 * "Vorbei" und verschwindet dort nach einer Woche von selbst. Die Überschrift erscheint
 * nur, wenn es wirklich etwas zu unterscheiden gibt — meistens gibt es nur eine Gruppe,
 * und dann steht über der Liste kein Wort, das keine Frage beantwortet.
 *
 * Unter "Vorbei" steht ein Satz, der sagt, dass die Chats dort ablaufen. Etwas, das von
 * selbst verschwindet, muss das vorher ankündigen — sonst ist es eines Tages weg und
 * sieht aus wie ein Fehler.
 */
/**
 * Eine Gruppe in der Liste.
 *
 * Als eigener Typ und nicht inline: `SectionList` leitet seine Sektionsform sonst aus
 * dem ab, was beim ersten `push` hineingeht — und kennt `hinweis` dann nicht, weil die
 * erste Gruppe keinen hat.
 */
interface ChatGruppe {
  /** `null` heißt: keine Überschrift zeichnen (es gibt nur diese eine Gruppe). */
  titel: string | null;
  /** Ein Satz unter der Überschrift, der die Gruppe erklärt. */
  hinweis?: string;
  data: ChatEintrag[];
}

export default function ChatsScreen() {
  const chats = useChatListe();

  const sections = useMemo(() => {
    const aktiv = chats.filter((c) => c.zustand === 'aktiv');
    const vorbei = chats.filter((c) => c.zustand === 'vorbei');

    const gruppen: ChatGruppe[] = [];
    // Die Überschrift erscheint nur, wenn es etwas zu unterscheiden gibt. Über einer
    // einzigen Gruppe wäre "Verabredet" ein Wort, das keine Frage beantwortet.
    if (aktiv.length > 0) gruppen.push({ titel: vorbei.length > 0 ? 'Verabredet' : null, data: aktiv });
    if (vorbei.length > 0) {
      gruppen.push({
        titel: 'Vorbei',
        hinweis: `Verschwindet ${NACHKLANG_TAGE} Tage nach dem Treffen.`,
        data: vorbei,
      });
    }
    return gruppen;
  }, [chats]);

  return (
    <SsScreen tabScreen contentStyle={styles.seite}>
      <View style={styles.kopf}>
        <SsText variant="title">Chats</SsText>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(eintrag) => eintrag.thread.id}
        renderSectionHeader={({ section }) =>
          section.titel ? (
            <View style={styles.gruppenKopf}>
              <SsText variant="label" color={colors.inkSoft}>
                {section.titel}
              </SsText>
              {section.hinweis ? (
                <SsText variant="caption" color={colors.inkSoft}>
                  {section.hinweis}
                </SsText>
              ) : null}
            </View>
          ) : null
        }
        renderItem={({ item }) => <ChatZeile eintrag={item} />}
        ItemSeparatorComponent={() => <View style={styles.luecke} />}
        SectionSeparatorComponent={() => <View style={styles.luecke} />}
        // Wie im Anfragen-Tab: die Überschriften sind transparent und würden beim
        // Kleben über die Karten darunter wandern.
        stickySectionHeadersEnabled={false}
        style={styles.listeAussen}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<NochKeinChat />}
      />
    </SsScreen>
  );
}

/**
 * Eine Zeile: mit wem, worum, was zuletzt gesagt wurde.
 *
 * ── Warum die Vorschau der letzten Nachricht wichtiger ist als sie aussieht ───
 * Sie beantwortet die eigentliche Frage der Liste: "muss ich da rein?". Ohne sie
 * müsste man jeden Chat aufmachen, um zu sehen, ob etwas Neues drinsteht. Das „Du:"
 * davor gehört dazu — ohne das liest man die eigene letzte Nachricht als Antwort des
 * anderen und glaubt, man sei dran.
 */
function ChatZeile({ eintrag }: { eintrag: ChatEintrag }) {
  const { thread, post, gegenueber, letzte } = eintrag;
  const vonMir = letzte?.senderId === CURRENT_USER_ID;

  return (
    <SsCard
      category={post.category}
      onPress={() => router.push({ pathname: '/chat/[id]', params: { id: thread.id } })}>
      <View style={styles.zeile}>
        <SsAvatar emoji={gegenueber.avatar} seed={gegenueber.id} size="md" />

        <View style={styles.text}>
          <View style={styles.namensZeile}>
            <SsText variant="bodyStrong" numberOfLines={1} style={styles.name}>
              {gegenueber.displayName}
            </SsText>
            <SsText variant="caption" color={colors.inkSoft}>
              {vergangen(thread.lastMessageAt)}
            </SsText>
          </View>

          <SsText variant="caption" color={colors.inkSoft} numberOfLines={1}>
            {CATEGORIES[post.category].emoji} {post.title} · {startOderSeit(post.startsAt)}
          </SsText>

          {letzte ? (
            <SsText variant="body" numberOfLines={1} color={colors.ink}>
              {vonMir ? 'Du: ' : ''}
              {letzte.text}
            </SsText>
          ) : (
            <SsText variant="body" numberOfLines={1} color={colors.inkSoft}>
              Noch nichts geschrieben — fang an.
            </SsText>
          )}
        </View>
      </View>
    </SsCard>
  );
}

/**
 * Der leere Zustand. Er erklärt nicht nur, dass nichts da ist, sondern WARUM — dass
 * ein Chat hier nicht durch Anschreiben entsteht, sondern durch eine Zusage, ist die
 * ungewöhnlichste Regel der App. An keiner anderen Stelle hat man so viel Platz, sie
 * zu erklären.
 */
function NochKeinChat() {
  return (
    <View style={styles.leer}>
      <SsText style={styles.leerEmoji}>💬</SsText>
      <SsText variant="heading" center>
        Noch kein Chat
      </SsText>
      <SsText variant="body" center color={colors.inkSoft}>
        Chats entstehen hier nicht durch Anschreiben. Sobald jemand deine Anfrage bestätigt —
        oder du eine bestätigst — steht der Chat dazu hier.
      </SsText>
      <SsButton label="Zum Feed" icon="🏠" style={styles.leerKnopf} onPress={() => router.push('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  seite: { paddingHorizontal: 0 },
  kopf: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },

  listeAussen: { flex: 1 },
  liste: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  luecke: { height: spacing.md },
  gruppenKopf: { paddingTop: spacing.sm, paddingBottom: spacing.xs, gap: 2 },

  zeile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  // `minWidth: 0`, sonst schrumpft der Block nicht unter seine Eigenbreite und der
  // Zeitstempel rechts wird aus der Karte gedrückt (dieselbe Falle wie in SsInput).
  text: { flex: 1, minWidth: 0, gap: 2 },
  namensZeile: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  name: { flexShrink: 1 },

  leer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  leerEmoji: { fontSize: 44, lineHeight: 53 },
  leerKnopf: { marginTop: spacing.md, alignSelf: 'center' },
});
