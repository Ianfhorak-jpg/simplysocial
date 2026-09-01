import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { SsBack, SsButton, SsChip, SsInput, SsScreen, SsText } from '@/components/ui';
import { useIstBlockiert } from '@/features/safety/hooks';
import { nachrichtSenden, useChat } from '@/features/chat/hooks';
import { nachklangTageUebrig } from '@/features/chat/lifecycle';
import { chatIds } from '@/features/statisch';
import { CURRENT_USER_ID } from '@/features/store';
import { startOderSeit, tagText, uhrzeit } from '@/lib/zeit';
import { categoryColors, colors, radius, spacing, type CategoryPalette } from '@/theme';
import type { Message, Post } from '@/types/models';

/**
 * Welche Adressen beim Bauen entstehen — siehe `features/statisch.ts`.
 * Ohne diese Funktion heißt die gebaute Datei `chat/[id].html` und ein
 * Direktaufruf von `/chat/t1` landet auf 404.
 */
export function generateStaticParams(): Array<{ id: string }> {
  return chatIds();
}

/**
 * Ein Chat.
 *
 * ── Warum oben immer der Post steht ───────────────────────────────────────────
 * Ein Chat gehört in dieser App IMMER zu einer Verabredung — er entsteht gar nicht
 * anders (`features/chat/logic.ts`). Die Kopfzeile macht das sichtbar und beantwortet
 * nebenbei die Fragen, die im Chat sonst als Erstes gestellt werden: wann, wo, welcher
 * Treffpunkt. Sie ist antippbar, weil "wie viele Plätze waren das nochmal" im Post
 * steht und nicht im Gespräch.
 *
 * ── Warum dieser Screen NICHT `SsScreen scroll` benutzt ───────────────────────
 * Harte Regel 4 sagt: Screens mit Eingabefeldern bekommen `scroll keyboard`. Für ein
 * Formular stimmt das — dort gehört das Feld mitten in den Inhalt. Ein Chat ist anders
 * gebaut: die Kopfzeile steht fest oben, das Eingabefeld fest unten, und NUR der
 * Verlauf dazwischen scrollt. Wäre alles ein Scroll-Bereich, müsste man vor jeder
 * Nachricht ans Ende der Seite scrollen, um das Feld zu finden.
 *
 * Deshalb `SsScreen keyboard` ohne `scroll` und eine `FlatList` in der Mitte. Die
 * ACTA-Falle "ScrollView neben FlatList fällt auf Höhe 0 zusammen" (Phase 2) greift
 * hier nicht, weil es keinen zweiten Scroll-Bereich gibt — genau deswegen ist diese
 * Aufteilung die sichere.
 */
export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const verlauf = useChat(id);
  const [entwurf, setEntwurf] = useState('');
  const listeRef = useRef<FlatList<Zeile>>(null);

  // Alle Haken VOR dem Aussteigen — React verlangt in jedem Durchlauf dieselben
  // Haken in derselben Reihenfolge.
  const zeilen = useMemo(() => zuZeilen(verlauf?.nachrichten ?? []), [verlauf?.nachrichten]);
  const blockiert = useIstBlockiert(verlauf?.eintrag.gegenueber.id);

  if (!verlauf) return <KeinChat />;

  const { eintrag } = verlauf;
  const { post, gegenueber, thread } = eintrag;
  const palette = categoryColors[post.category];

  const senden = () => {
    if (!entwurf.trim()) return;
    nachrichtSenden(thread.id, entwurf);
    // Erst leeren, dann ans Ende: das Neuzeichnen übernimmt `onContentSizeChange`.
    setEntwurf('');
  };

  return (
    <SsScreen keyboard contentStyle={styles.seite}>
      <View style={styles.kopf}>
        <SsBack />
        <PostKopf post={post} name={gegenueber.displayName} />
      </View>

      {eintrag.zustand === 'vorbei' ? (
        <SsText variant="caption" center color={colors.inkSoft} style={styles.vorbei}>
          Dieses Treffen ist vorbei. Der Chat verschwindet {ablaufText(post, new Date())}.
        </SsText>
      ) : null}

      <FlatList
        ref={listeRef}
        data={zeilen}
        keyExtractor={(zeile) => zeile.key}
        renderItem={({ item }) =>
          item.art === 'tag' ? (
            <TagTrenner text={item.text} />
          ) : (
            <Blase nachricht={item.nachricht} palette={palette} />
          )
        }
        style={styles.listeAussen}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
        // Immer unten anfangen und unten bleiben: Das Neueste ist im Chat das
        // Wichtigste, und niemand liest einen Verlauf von oben nach unten durch.
        // `animated: false`, damit es beim Öffnen nicht sichtbar hinunterfährt.
        onContentSizeChange={() => listeRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={<NochStill name={gegenueber.displayName} />}
      />

      {/* Phase 7: Steht eine Blockierung dazwischen, verschwindet das Eingabefeld und
          der Verlauf bleibt lesbar.

          Unter Ians Regel (HART, `features/safety/block.ts`) ist dieser Zweig derzeit
          NICHT erreichbar: Blockieren löscht den Faden, und wer die Adresse danach
          aufruft, landet bei `KeinChat` weiter oben. Er bleibt trotzdem stehen, weil
          er zu `BLOCK_WIRKUNG` gehört — stellt Ian auf `stillgelegt`, ist er sofort
          richtig, ohne dass jemand diesen Screen wieder anfassen muss. Der Screen
          fragt deshalb nur nach dem Block und nie nach der Regel: Was hier ankommt,
          ist schon ihr Ergebnis. */}
      {blockiert ? (
        <View style={styles.gesperrt}>
          <SsText variant="bodyStrong" center>
            🚫 Hier kann niemand mehr schreiben
          </SsText>
          <SsText variant="caption" center color={colors.inkSoft}>
            Zwischen euch steht eine Blockierung. Was ihr geschrieben habt, bleibt
            lesbar.
          </SsText>
        </View>
      ) : (
        <View style={styles.eingabe}>
          <SsInput
            value={entwurf}
            onChangeText={setEntwurf}
            placeholder={`Nachricht an ${gegenueber.displayName}`}
            maxLength={500}
            onSubmitEditing={senden}
            style={styles.feld}
          />
          <SsButton
            variant="category"
            category={post.category}
            label="Senden"
            disabled={!entwurf.trim()}
            onPress={senden}
          />
        </View>
      )}
    </SsScreen>
  );
}

/**
 * Die Kopfzeile: worum geht es hier eigentlich.
 *
 * Bewusst flach und nicht als `SsCard` — eine Karte sähe aus wie der erste Eintrag im
 * Verlauf. Die Trennlinie darunter sagt stattdessen "hier hört die Kopfzeile auf",
 * und die Kategoriefarbe verbindet sie mit den eigenen Blasen weiter unten.
 */
function PostKopf({ post, name }: { post: Post; name: string }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })}
      accessibilityRole="button"
      style={({ pressed }) => [styles.postKopf, pressed && styles.gedrueckt]}>
      <View style={styles.postZeile}>
        <SsChip category={post.category} />
        <SsText variant="caption" color={colors.inkSoft}>
          mit {name}
        </SsText>
      </View>
      <SsText variant="heading" numberOfLines={1}>
        {post.title}
      </SsText>
      <SsText variant="caption" color={colors.inkSoft} numberOfLines={1}>
        {startOderSeit(post.startsAt)}   ·   {post.district} Wien   ·{' '}
        {post.meetingPoint ? `🚩 ${post.meetingPoint}` : '🚩 Treffpunkt noch offen'}
      </SsText>
    </Pressable>
  );
}

/**
 * Eine Nachricht.
 *
 * ── Warum die eigenen Blasen die Kategoriefarbe tragen ────────────────────────
 * Der Chat ist der einzige Screen, auf dem man länger als ein paar Sekunden bleibt.
 * Die Farbe des Treffens hält ihn mit dem Rest der App zusammen — sonst wäre es ein
 * grauer Messenger, der zufällig in SimplySocial eingebaut ist. Die Textfarbe kommt
 * aus `onBase` und nicht pauschal in Weiß: Sport ist gelb, und weißer Text darauf
 * wäre unlesbar (siehe `theme/colors.ts`).
 */
function Blase({ nachricht, palette }: { nachricht: Message; palette: CategoryPalette }) {
  const meins = nachricht.senderId === CURRENT_USER_ID;

  return (
    <View style={[styles.blaseZeile, meins ? styles.rechts : styles.links]}>
      <View
        style={[
          styles.blase,
          meins
            ? { backgroundColor: palette.base, borderColor: palette.deep, borderBottomRightRadius: radius.sm }
            : { backgroundColor: colors.surface, borderColor: colors.line, borderBottomLeftRadius: radius.sm },
        ]}>
        <SsText variant="body" color={meins ? palette.onBase : colors.ink}>
          {nachricht.text}
        </SsText>
      </View>
      <SsText variant="caption" color={colors.inkSoft} style={styles.zeit}>
        {uhrzeit(nachricht.sentAt)}
      </SsText>
    </View>
  );
}

/**
 * "Heute" / "Gestern" / "Do" zwischen den Nachrichten.
 *
 * Ohne diese Zeile stehen die Uhrzeiten ohne Bezug da: "14:20" über "09:15" sieht aus
 * wie eine falsch sortierte Liste, obwohl einfach ein Tag dazwischenliegt.
 */
function TagTrenner({ text }: { text: string }) {
  return (
    <View style={styles.tagZeile}>
      <View style={styles.tagLinie} />
      <SsText variant="caption" color={colors.inkSoft}>
        {text}
      </SsText>
      <View style={styles.tagLinie} />
    </View>
  );
}

/** Ein frisch bestätigtes Treffen, in dem noch niemand geschrieben hat. */
function NochStill({ name }: { name: string }) {
  return (
    <View style={styles.still}>
      <SsText style={styles.stillEmoji}>🤝</SsText>
      <SsText variant="heading" center>
        Ihr seid verabredet
      </SsText>
      <SsText variant="body" center color={colors.inkSoft}>
        Noch hat niemand etwas geschrieben. Ein „Hi, passt es bei dir noch?“ reicht völlig.
      </SsText>
    </View>
  );
}

/**
 * Wenn die Adresse auf einen Chat zeigt, den es nicht (mehr) gibt — oder auf einen
 * fremden. Im Browser ist jede Adresse frei tippbar.
 */
function KeinChat() {
  return (
    <SsScreen contentStyle={styles.fehlerSeite}>
      <SsText style={styles.fehlerEmoji}>💬</SsText>
      <SsText variant="heading" center>
        Diesen Chat gibt es nicht
      </SsText>
      <SsText variant="body" center color={colors.inkSoft}>
        Vielleicht gehört er zu einem Treffen, das es nicht mehr gibt.
      </SsText>
      <SsButton label="Zu den Chats" onPress={() => router.replace('/chats')} />
    </SsScreen>
  );
}

/**
 * Wann der Chat verschwindet, in Worten: „heute" · „morgen" · „in 5 Tagen".
 *
 * Der Satz steht ausgerechnet hier, weil das der Ort ist, an dem er zählt: Wer diesen
 * Screen offen hat, schreibt gerade — und soll wissen, dass das Gespräch ein Ablaufdatum
 * hat, BEVOR es weg ist. In der Liste reicht die Gruppenüberschrift.
 *
 * Die Zahl kommt aus `chat/lifecycle.ts` (Ians Regel), die Wortwahl gehört dem Screen.
 */
function ablaufText(post: Post, jetzt: Date): string {
  const tage = nachklangTageUebrig(post, jetzt);
  if (tage === 0) return 'heute';
  if (tage === 1) return 'morgen';
  return `in ${tage} Tagen`;
}

// ── Verlauf in Zeilen übersetzen ─────────────────────────────────────────────

/**
 * Was die Liste zeichnet: Nachrichten UND die Tagestrenner dazwischen.
 *
 * Beides in einer flachen Liste statt einer verschachtelten Struktur, weil `FlatList`
 * genau das erwartet — und weil ein Trenner damit ein ganz normaler Eintrag mit
 * eigenem `key` ist. Eine `SectionList` wäre die Alternative gewesen, aber ihre
 * Überschriften kleben oben fest; in einem Chat wandert der Tag mit dem Verlauf.
 */
type Zeile =
  | { art: 'tag'; key: string; text: string }
  | { art: 'nachricht'; key: string; nachricht: Message };

function zuZeilen(nachrichten: Message[]): Zeile[] {
  const zeilen: Zeile[] = [];
  let letzterTag = '';

  for (const nachricht of nachrichten) {
    const tag = new Date(nachricht.sentAt).toDateString();
    if (tag !== letzterTag) {
      zeilen.push({ art: 'tag', key: `tag_${tag}`, text: tagText(nachricht.sentAt) });
      letzterTag = tag;
    }
    zeilen.push({ art: 'nachricht', key: nachricht.id, nachricht });
  }

  return zeilen;
}

const styles = StyleSheet.create({
  seite: { paddingHorizontal: 0 },

  kopf: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  postKopf: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    cursor: 'pointer',
  },
  postZeile: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  gedrueckt: { opacity: 0.6 },
  vorbei: { paddingTop: spacing.sm },

  listeAussen: { flex: 1 },
  liste: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, gap: spacing.sm, flexGrow: 1 },

  blaseZeile: { maxWidth: '84%', gap: 2 },
  links: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  rechts: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  blase: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  zeit: { paddingHorizontal: spacing.xs },

  tagZeile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  tagLinie: { flex: 1, height: 1, backgroundColor: colors.line },

  still: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  stillEmoji: { fontSize: 40, lineHeight: 48 },

  eingabe: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },
  // `minWidth: 0` aus demselben Grund wie in SsInput: ohne das schrumpft ein
  // `flex: 1`-Kind nicht unter seine Eigenbreite und drückt den Senden-Knopf hinaus.
  feld: { flex: 1, minWidth: 0 },

  // Dieselbe Kante und derselbe Grund wie bei `eingabe` — der gesperrte Bereich sitzt
  // an genau der Stelle, an der sonst das Feld steht. Springt der Rahmen beim
  // Blockieren, sieht es aus, als wäre etwas kaputtgegangen.
  gesperrt: {
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },

  fehlerSeite: { alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  fehlerEmoji: { fontSize: 48, lineHeight: 58 },
});
