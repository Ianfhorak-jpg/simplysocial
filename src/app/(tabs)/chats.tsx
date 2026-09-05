import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';

import { SsAvatar, SsButton, SsIcon, SsScreen, SsText } from '@/components/ui';
import { useChatListe, type ChatEintrag } from '@/features/chat/hooks';
import { NACHKLANG_TAGE } from '@/features/chat/lifecycle';
import { CURRENT_USER_ID } from '@/features/store';
import { categoryColors, colors, spacing } from '@/theme';
import { vergangen } from '@/lib/zeit';

/**
 * Der Chats-Tab: alle Verabredungen, an denen gerade geschrieben wird.
 *
 * ── Warum hier keine Kontaktliste steht ───────────────────────────────────────
 * In den meisten Apps ist die Chat-Liste eine Liste von MENSCHEN. Hier ist sie eine
 * Liste von TREFFEN — deshalb steht hinter jedem Namen, worum es geht. Bei zwei
 * Verabredungen mit derselben Person sind das zwei Zeilen und nicht eine, in der
 * beides durcheinandergeht. Das ist die direkte Folge daraus, dass ein Chat immer an
 * einem Post hängt (`features/chat/logic.ts`).
 *
 * ── Phase 18c: aus Karten wurden ZEILEN (Ians Entscheidung 29) ────────────────
 * Ian am 2026-09-03: „ich finde es ist noch nicht ganz übersichtlich, inspiriere dich
 * von WhatsApp oder so für die Chats." Nachgemessen auf 360 × 600 war das keine
 * Geschmacksfrage, sondern eine Zahl: **4 Chats** passten auf den Schirm, bei WhatsApp
 * sind es 7. Zwei Ursachen, beide behoben:
 *
 *   1. Jeder Chat war eine `SsCard` — Rahmen, Radius, 12 px Lücke zur nächsten. Eine
 *      Karte ist im Feed richtig (dort ist sie ein ANGEBOT, das man annehmen kann);
 *      in einer Chat-Liste ist eine Zeile ein WEG. Jetzt: volle Breite, eine dünne
 *      Trennlinie, keine Lücke.
 *   2. Drei Textzeilen je Chat (Name+Zeit · Aktivität · Nachricht) ergaben 100–118 px
 *      — ungleich hoch, weil die Nachricht umbrach. Ungleiche Höhen sind der
 *      Hauptgrund, warum eine Liste „unruhig" aussieht.
 *
 * **Ians Entscheidung 29** war, welche der drei Zeilen weichen muss: Die Aktivität
 * rückt klein HINTER den Namen, die Verabredungs-Zeit fällt aus der Liste heraus.
 * Verworfen: die Verabredungs-Zeit behalten und dafür den Titel streichen (die
 * Kategorie trägt zwar der Farbstreifen, aber „Tennis spielen" ist das, woran man
 * einen Chat wiedererkennt — eine Uhrzeit ist es nicht), und alle drei Zeilen zu
 * behalten (hätte nur den halben Gewinn gebracht).
 *
 * Der Preis, den er kennt: **Wann das Treffen ist, steht hier nicht mehr.** Es steht
 * im Chat selbst, gleich oben. Und bei einem Direktchat fällt der Handle weg, der
 * bisher die zweite Zeile füllte — bei zwei Leuten mit demselben Vornamen unterscheidet
 * sie jetzt nur noch die Avatarfarbe.
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
 * Farbstreifen seiner Kategorie und den Titel hinter dem Namen. Ein Direktchat hat
 * beides nicht, weil es beides nicht gibt.
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

/**
 * Die Maße der Zeile — an einer Stelle, weil die Trennlinie sie NACHRECHNEN muss.
 *
 * Die Linie beginnt nicht am linken Rand, sondern erst hinter dem Avatar (wie in
 * jeder Messenger-Liste): Sie trennt dann die Textblöcke und nicht die Bilder, und
 * die Avatare bilden eine ununterbrochene Spalte. Dafür braucht sie exakt die Summe
 * aus Streifen + Rand + Avatarbreite + Abstand — stünde die Zahl hart im Style,
 * würde sie beim nächsten Größenwechsel still falsch.
 */
const STREIFEN = 6;
const RAND = spacing.lg;
const AVATAR = 44; // `size="md"` in SsAvatar
const TEXT_LINKS = STREIFEN + RAND + AVATAR + spacing.md;

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
        // Die Trennlinie steht ZWISCHEN den Zeilen, nicht an jeder Zeile unten: sonst
        // hat die letzte Zeile vor der nächsten Überschrift eine Linie, die nichts
        // trennt.
        ItemSeparatorComponent={() => <View style={styles.trenner} />}
        SectionSeparatorComponent={() => <View style={styles.gruppenLuecke} />}
        // Wie im Anfragen-Tab: die Überschriften sind transparent und würden beim
        // Kleben über die Zeilen darunter wandern.
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
 *
 * ── Warum der Streifen-Platz auch dann steht, wenn er leer bleibt ─────────────
 * Harte Regel 29 verbietet einen grauen ERSATZ-Streifen für Direktchats, und das gilt
 * unverändert: Ein Direktchat hat keine Kategorie, also bekommt er keine Farbe. Aber
 * er bekommt seit Phase 18c denselben 6 px breiten PLATZ, nur ungefärbt. In einer
 * Karte durfte der Inhalt 6 px weiter links anfangen — das war die Auskunft. In einer
 * Zeilenliste sind ausgefranste Avatar-Spalten genau das „unruhig", gegen das diese
 * Phase gebaut ist. Die Auskunft steckt weiter im Platz: keine Farbe = keine Aktivität.
 */
function ChatZeile({ eintrag }: { eintrag: ChatEintrag }) {
  const { thread, post, gegenueber, letzte } = eintrag;
  const vonMir = letzte?.senderId === CURRENT_USER_ID;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/chat/[id]', params: { id: thread.id } })}
      accessibilityRole="button"
      style={({ pressed }) => [styles.zeile, pressed && styles.gedrueckt]}>
      <View
        style={[
          styles.streifen,
          post ? { backgroundColor: categoryColors[post.category].base } : null,
        ]}
      />

      <View style={styles.inhalt}>
        <SsAvatar name={gegenueber.displayName} seed={gegenueber.id} photoUrl={gegenueber.photoUrl} size="md" />

        <View style={styles.text}>
          <View style={styles.kopfZeile}>
            {/* Name und Aktivität teilen sich den Platz links, die Uhrzeit steht rechts.
                Von den beiden muss die AKTIVITÄT nachgeben — „Tobi… · Kaffee nach der
                Sch…" ist zweimal halb statt einmal ganz.

                Der erste Versuch war, das über `flexShrink` zu gewichten (1 gegen 24).
                Am Gerät nachgemessen war der Name trotzdem „Tobi…", und der Grund steht
                in den berechneten Stilen: Beide Texte haben `flexBasis: auto`, also
                ihre natürliche Breite. Damit gibt es einen Fehlbetrag, den sich beide
                teilen — jede Gewichtung dagegen ist ein Wert, der beim nächsten längeren
                Titel wieder falsch ist.

                `flex: 1` an der Aktivität (also `flexBasis: 0`) nimmt den Fehlbetrag
                ganz weg: Der Name behält seine natürliche Breite, die Aktivität bekommt
                exakt den Rest und kürzt sich darin selbst. Erst wenn der Name ALLEIN
                breiter ist als die Zeile, greift Shrink — und dann muss er es auch,
                sonst drückt ein langer Name die Uhrzeit aus dem Bild. */}
            <View style={styles.namensBlock}>
              <SsText variant="bodyStrong" numberOfLines={1} style={styles.name}>
                {gegenueber.displayName}
              </SsText>
              {post ? (
                <SsText
                  variant="caption"
                  color={colors.inkSoft}
                  numberOfLines={1}
                  style={styles.aktivitaet}>
                  {`· ${post.title}`}
                </SsText>
              ) : null}
            </View>

            <SsText variant="caption" color={colors.inkSoft} style={styles.zeit}>
              {vergangen(thread.lastMessageAt)}
            </SsText>
          </View>

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
    </Pressable>
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
  // Kein `paddingHorizontal` mehr: Die Zeilen gehen über die volle Breite, so wie in
  // jeder Messenger-Liste. Den Seitenrand bringt die Zeile selbst mit.
  liste: { paddingBottom: spacing.xxl, flexGrow: 1 },
  gruppenKopf: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: 2,
  },
  gruppenLuecke: { height: spacing.sm },
  trenner: { height: 1, marginLeft: TEXT_LINKS, backgroundColor: colors.line },

  zeile: { flexDirection: 'row', backgroundColor: colors.surface, cursor: 'pointer' },
  gedrueckt: { opacity: 0.72 },
  streifen: { width: STREIFEN },
  inhalt: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingLeft: RAND,
    paddingRight: RAND,
    paddingVertical: spacing.md,
  },

  // `minWidth: 0`, sonst schrumpft der Block nicht unter seine Eigenbreite und der
  // Zeitstempel rechts wird aus der Zeile gedrückt (dieselbe Falle wie in SsInput).
  text: { flex: 1, minWidth: 0, gap: 2 },
  kopfZeile: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  namensBlock: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'baseline' },
  name: { flexShrink: 1 },
  // Der Abstand vor dem Trennpunkt steht im STYLE und nicht als Leerzeichen im
  // Text: `react-native-web` rendert Text als HTML, und HTML frisst führende
  // Leerzeichen — aus „Lea · Tennis" wurde am Schirm „Lea· Tennis". Auf Native
  // würde ein Leerzeichen dagegen stehen bleiben, also wären es dort zwei.
  aktivitaet: { flex: 1, minWidth: 0, marginLeft: 5 },
  // Die Uhrzeit gibt nie nach — sie ist kurz, und eine halbe Uhrzeit ist keine.
  zeit: { flexShrink: 0 },

  leer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  leerKnopf: { marginTop: spacing.md, alignSelf: 'center' },
});
