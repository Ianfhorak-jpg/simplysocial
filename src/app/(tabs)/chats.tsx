import { router } from 'expo-router';
import { useMemo } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';

import { SsAvatar, SsButton, SsCard, SsIcon, SsIconText, SsScreen, SsText } from '@/components/ui';
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
 *
 * ── Seit Phase 16 stehen hier zwei SORTEN Chats, aber nicht in zwei Gruppen ───
 * Direktnachrichten (`features/chat/direkt.ts`) haben keine Aktivität. Die
 * naheliegende Antwort wäre eine dritte Gruppe „Nachrichten" gewesen — sie ist
 * verworfen, und der Grund ist Ians Sortierregel:
 *
 * `chat/sort.ts` beantwortet die Frage, die man an diese Liste hat („wo muss ich
 * hin?"), über die ganze Liste hinweg. Eine Gruppe je Sorte würde diese Antwort
 * zerschneiden: Eine Direktnachricht von vor zwei Minuten stünde unter einem
 * Aktivitäts-Chat von gestern, nur weil sie aus einer anderen Quelle kommt. Warum
 * ein Chat entstanden ist, interessiert beim Suchen niemanden.
 *
 * Gruppiert wird deshalb weiter nach ZUSTAND (aktiv/vorbei — das ist Ians Regel),
 * und die SORTE erkennt man an der Zeile selbst: Ein Aktivitäts-Chat trägt den
 * Farbstreifen seiner Kategorie und eine Zeile, die sagt, worum es geht. Ein
 * Direktchat hat beides nicht, weil es beides nicht gibt.
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
    // einzigen Gruppe wäre sie ein Wort, das keine Frage beantwortet.
    //
    // „Aktuell" und nicht mehr „Verabredet": Seit Phase 16 stehen hier auch
    // Direktnachrichten, und die sind keine Verabredung. Eine Überschrift, die für
    // die Hälfte ihrer Zeilen nicht stimmt, ist schlimmer als keine.
    if (aktiv.length > 0) gruppen.push({ titel: vorbei.length > 0 ? 'Aktuell' : null, data: aktiv });
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
      // Ohne Post kein Streifen — und bewusst auch keine graue Ersatzfarbe. Ein
      // Direktchat HAT keine Kategorie; ihm eine zu geben wäre dieselbe Notlüge wie
      // ein Platzhalter-Post (siehe `ChatEintrag.post` in `chat/hooks.ts`). Dass die
      // Karte 6 px schmaler einrückt, ist kein Fehler, sondern die Auskunft.
      category={post?.category}
      onPress={() => router.push({ pathname: '/chat/[id]', params: { id: thread.id } })}>
      <View style={styles.zeile}>
        <SsAvatar name={gegenueber.displayName} seed={gegenueber.id} photoUrl={gegenueber.photoUrl} size="md" />

        <View style={styles.text}>
          <View style={styles.namensZeile}>
            <SsText variant="bodyStrong" numberOfLines={1} style={styles.name}>
              {gegenueber.displayName}
            </SsText>
            <SsText variant="caption" color={colors.inkSoft}>
              {vergangen(thread.lastMessageAt)}
            </SsText>
          </View>

          {/* Das Kategorie-Icon steht hier statt einer zweiten Pille: In einer Liste
              von Chats ist die Kategorie eine Nebenangabe, keine Überschrift.

              Bei einem Direktchat steht an derselben Stelle der Handle mit dem
              Personen-Icon. Die Zeile ganz wegzulassen wäre die Alternative gewesen —
              dann hätten die Zeilen zwei verschiedene Höhen, und eine Liste, in der
              die Karten unterschiedlich hoch sind, liest sich unruhig. Der Handle ist
              außerdem nicht bloß Füllung: Bei zwei Leuten mit demselben Vornamen ist
              er das Einzige, was sie in dieser Liste unterscheidet. */}
          {post ? (
            <SsIconText icon={CATEGORIES[post.category].icon}>
              {`${post.title} · ${startOderSeit(post.startsAt)}`}
            </SsIconText>
          ) : (
            <SsIconText icon="person" color={colors.inkSoft}>
              {gegenueber.handle}
            </SsIconText>
          )}

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
      <SsIcon name="sprechblase" size={46} color={colors.inkSoft} />
      <SsText variant="heading" center>
        Noch kein Chat
      </SsText>
      <SsText variant="body" center color={colors.inkSoft}>
        Sobald jemand deine Anfrage bestätigt — oder du eine bestätigst — steht der Chat
        dazu hier. Und wenn ihr einander folgt, kannst du direkt schreiben: der Knopf
        dafür steht auf dem Profil.
      </SsText>
      <SsButton label="Zum Feed" icon="haus" style={styles.leerKnopf} onPress={() => router.push('/')} />
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
  leerKnopf: { marginTop: spacing.md, alignSelf: 'center' },
});
