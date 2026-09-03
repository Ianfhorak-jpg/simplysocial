import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useSichtText } from '@/components/SichtMarke';
import { SsAvatar, SsBack, SsButton, SsCard, SsChip, SsIcon, SsInput, SsScreen, SsText } from '@/components/ui';
import { AGE_LABELS } from '@/config/alter';
import { LEVEL_LABELS } from '@/config/categories';
import { useChatZuPost } from '@/features/chat/hooks';
import { freiePlaetze, istOffen, usePost } from '@/features/posts/hooks';
import { anfrageSenden, anfrageZuruecknehmen, useMeineAnfrage } from '@/features/requests/hooks';
import { useIstBlockiert, useMeineMeldung } from '@/features/safety/hooks';
import { useCurrentUser } from '@/features/social/hooks';
import { postIds } from '@/features/statisch';
import { useSlice } from '@/features/store';
import { ortText } from '@/lib/bezirk';
import { startOderSeit, vergangen } from '@/lib/zeit';
import { categoryColors, colors, radius, spacing } from '@/theme';
import type { IconName } from '@/theme/icons';

/**
 * Welche Adressen beim Bauen entstehen — siehe `features/statisch.ts`.
 * Ohne diese Funktion heißt die gebaute Datei `post/[id].html` und ein
 * Direktaufruf von `/post/p4` landet auf 404.
 */
export function generateStaticParams(): Array<{ id: string }> {
  return postIds();
}

/**
 * Ein einzelner Post in voller Länge — hier fällt die Entscheidung "mach ich mit?".
 *
 * ── Was dieser Screen mehr zeigt als die Karte im Feed ────────────────────────
 * Treffpunkt, Können-Niveau, die ganze Notiz und die Sichtbarkeit. Genau die Dinge,
 * die man erst wissen will, wenn man ernsthaft überlegt — im Feed wären sie Ballast.
 *
 * ── Warum "Bin dabei" keinen Platz belegt ─────────────────────────────────────
 * Der Verfasser bestätigt zuerst (PLAN.md, Abschnitt 1). Das ist gleichzeitig das
 * Sicherheitsversprechen der App — man entscheidet selbst, wen man trifft — und der
 * emotionale Höhepunkt in Phase 4. Deshalb steigt `spotsFilled` hier NICHT; es
 * entsteht nur eine Anfrage mit Status "pending".
 */
export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eintrag = usePost(id);
  const ich = useCurrentUser();
  const meineAnfrage = useMeineAnfrage(id);
  // Ohne `gastId`: Aus diesem Screen heraus bin ICH der Gast, und dann gibt es zu
  // einem Post genau einen Faden mit mir. Gebraucht wird er nur im Zweig „bestätigt"
  // weiter unten — beim eigenen Post hängen mehrere Fäden dran, und welcher gemeint
  // wäre, ist von hier aus nicht zu beantworten. Der Weg dorthin ist der Chats-Tab.
  const chat = useChatZuPost(id);
  const alleAnfragen = useSlice('joinRequests');
  // Beide Haken laufen bedingungslos, auch wenn es den Post gar nicht gibt — React
  // verlangt in jedem Durchlauf dieselbe Reihenfolge. `undefined` ist für beide ein
  // gültiger Eingabewert.
  const blockiert = useIstBlockiert(eintrag?.author.id);
  const meldung = useMeineMeldung('post', id);
  const [nachricht, setNachricht] = useState('');
  // Vor dem frühen Ausstieg weiter unten: Haken laufen immer, nie bedingt.
  const sichtText = useSichtText(
    eintrag?.post.visibility,
    eintrag?.author.displayName ?? '',
    eintrag?.post.authorId === ich.id,
  );

  // Erst NACH allen Haken aussteigen — React verlangt, dass in jedem Durchlauf
  // dieselben Haken in derselben Reihenfolge aufgerufen werden.
  if (!eintrag) return <NichtGefunden />;

  const { post, author } = eintrag;
  const palette = categoryColors[post.category];
  const istMeiner = post.authorId === ich.id;
  const offen = istOffen(post);
  const frei = freiePlaetze(post);
  const anfragenAufDiesen = alleAnfragen.filter(
    (a) => a.postId === post.id && a.status === 'pending',
  );

  return (
    <SsScreen scroll keyboard contentStyle={styles.seite}>
      <SsBack />

      <View style={styles.titelBlock}>
        <SsChip category={post.category} />
        <SsText variant="title">{post.title}</SsText>
      </View>

      {/* Seit Phase 6 führt die Verfasser-Karte aufs Profil. Das ist der Weg, auf dem
          man vor dem „Bin dabei" nachsehen kann, mit wem man es zu tun hat — genau die
          Frage, die sich an dieser Stelle stellt. Das Winkelzeichen rechts sagt, dass
          es weitergeht; ohne das sieht die Karte aus wie die Infokarte darunter. */}
      <SsCard onPress={() => router.push({ pathname: '/user/[id]', params: { id: author.id } })}>
        <View style={styles.person}>
          <SsAvatar name={author.displayName} seed={author.id} photoUrl={author.photoUrl} size="md" />
          <View style={styles.personText}>
            <SsText variant="bodyStrong">{author.displayName}</SsText>
            <SsText variant="caption" color={colors.inkSoft}>
              {author.handle} · {author.district} Wien
            </SsText>
          </View>
          <SsIcon name="chevronRechts" size={18} color={colors.inkSoft} />
        </View>
        {author.bio ? (
          <SsText variant="caption" color={colors.inkSoft}>
            {author.bio}
          </SsText>
        ) : null}
      </SsCard>

      <SsCard>
        <Zeile icon="uhr" label="Wann" wert={startOderSeit(post.startsAt)} />
        <Trenner />
        <Zeile icon="pin" label="Wo" wert={ortText(post.district)} />
        <Trenner />
        <Zeile
          icon="fahne"
          label="Treffpunkt"
          wert={post.meetingPoint ?? 'Machen wir im Chat aus'}
          leise={!post.meetingPoint}
        />
        <Trenner />
        <Zeile icon="ziel" label="Können" wert={LEVEL_LABELS[post.level]} />
        {/* Nur, wenn der Verfasser wirklich eingeschränkt hat. Eine Zeile „Für wen:
            Für alle" wäre an jedem zweiten Post eine Zeile, die nichts sagt — und
            genau dadurch übersieht man sie dort, wo sie etwas sagt. Dieselbe Regel
            wie bei „Sichtbar für" weiter unten. */}
        {post.ageGroup !== 'egal' ? (
          <>
            <Trenner />
            <Zeile icon="person" label="Für wen" wert={AGE_LABELS[post.ageGroup]} />
          </>
        ) : null}
        <Trenner />
        <Zeile
          icon="personen"
          label="Plätze"
          wert={frei > 0 ? `${frei} von ${post.spotsTotal} frei` : `Alle ${post.spotsTotal} vergeben`}
        />
        {sichtText ? (
          <>
            <Trenner />
            <Zeile
              icon={post.visibility.kind === 'group' ? 'personen' : 'schloss'}
              label="Sichtbar für"
              wert={sichtText}
            />
          </>
        ) : null}
      </SsCard>

      {post.note ? (
        <SsCard style={{ backgroundColor: palette.soft, borderColor: palette.soft }}>
          <SsText variant="caption" color={palette.onSoft}>
            {author.displayName} schreibt
          </SsText>
          <SsText variant="body">{post.note}</SsText>
        </SsCard>
      ) : null}

      <SsText variant="caption" color={colors.inkSoft} center>
        Gepostet {vergangen(post.createdAt)}
      </SsText>

      <View style={styles.aktion}>
        {blockiert ? (
          // Steht vor allen anderen Zweigen: Ein Block hebt jeden anderen Zustand auf.
          // Erreichbar ist der Screen trotzdem — auf Web ist jede Adresse ein Link, den
          // jemand geschickt haben kann, und ein „gibt es nicht" wäre gelogen.
          //
          // Bewusst ohne Namen: Wer hier landet, weiß, wen er blockiert hat, und wenn
          // die ANDERE Seite blockiert hat, verrät ein „Du und Lea…" genau das, was
          // ein Block verbergen soll. Derselbe Satz für beide Richtungen.
          <Hinweis
            icon="verboten"
            titel="Hier geht nichts"
            text="Zwischen dir und dem Verfasser dieses Posts steht eine Blockierung. Blockierungen, die du selbst gesetzt hast, findest du in den Einstellungen."
          />
        ) : istMeiner ? (
          <Hinweis
            icon="stift"
            titel="Das ist dein Post"
            text={
              anfragenAufDiesen.length === 0
                ? 'Noch hat niemand angefragt. Sobald jemand mitmachen will, siehst du es im Anfragen-Tab.'
                : `${anfragenAufDiesen.length} ${anfragenAufDiesen.length === 1 ? 'Person will' : 'Leute wollen'} mitmachen. Bestätigen kannst du im Anfragen-Tab.`
            }
          />
        ) : meineAnfrage ? (
          <>
            {/* Drei verschiedene Ausgänge einer Anfrage — und drei verschiedene Sätze.
                "Anfrage geschickt" über einem bestätigten Treffen zu lassen wäre der
                Fehler, der den Match-Moment aus Phase 4 im Keim erstickt. */}
            {meineAnfrage.status === 'accepted' ? (
              <>
                <Hinweis
                  icon="funken"
                  titel="Ihr seid verabredet"
                  text={`${author.displayName} hat bestätigt. Alles Weitere macht ihr im Chat aus.`}
                />
                {/* Seit Phase 5 ein echter Weg statt eines Hinweises. Der Knopf steht
                    nur da, wenn der Faden wirklich existiert — er zeigt nie auf einen
                    Chat, den es nicht gibt. */}
                {chat ? (
                  <SsButton
                    variant="category"
                    category={post.category}
                    label="Zum Chat"
                    icon="sprechblase"
                    block
                    onPress={() => router.push({ pathname: '/chat/[id]', params: { id: chat.id } })}
                  />
                ) : null}
              </>
            ) : meineAnfrage.status === 'declined' ? (
              <Hinweis
                icon="kreuzKreis"
                titel="Diesmal nicht"
                text={`${author.displayName} hat abgesagt. Im Feed ist bestimmt was anderes.`}
              />
            ) : (
              <Hinweis
                icon="hakenKreis"
                titel="Anfrage geschickt"
                text={`${author.displayName} muss noch bestätigen. Sobald das passiert, geht der Chat auf.`}
              />
            )}
            {meineAnfrage.message ? (
              <SsText variant="caption" color={colors.inkSoft} style={styles.echo}>
                Du hast geschrieben: „{meineAnfrage.message}“
              </SsText>
            ) : null}
            {meineAnfrage.status === 'pending' ? (
              <SsButton
                variant="ghost"
                label="Anfrage zurücknehmen"
                block
                onPress={() => anfrageZuruecknehmen(post.id)}
              />
            ) : null}
          </>
        ) : !offen ? (
          <SsButton label="Schon voll" block size="lg" disabled />
        ) : (
          <>
            <SsInput
              value={nachricht}
              onChangeText={setNachricht}
              placeholder={`Kurz was an ${author.displayName} schreiben (optional)`}
              multiline
              maxLength={200}
            />
            <SsButton
              label="Bin dabei"
              icon="hand"
              block
              size="lg"
              onPress={() => anfrageSenden(post.id, nachricht)}
            />
            <SsText variant="caption" color={colors.inkSoft} center>
              {author.displayName} entscheidet, wer mitkommt.
            </SsText>
          </>
        )}
      </View>

      {/* Ganz unten und leise — wie am Profil. „Melden" ist die seltenste Handlung
          des Screens; sie soll auffindbar sein, ohne neben „Bin dabei" um
          Aufmerksamkeit zu konkurrieren. Beim eigenen Post steht sie gar nicht da:
          Sich selbst zu melden ergibt keinen Sinn (`melden.tsx` fängt es zusätzlich
          ab, falls jemand die Adresse direkt aufruft). */}
      {!istMeiner && !blockiert ? (
        <SsButton
          variant="ghost"
          label={meldung ? 'Gemeldet' : 'Post melden'}
          icon="fahne"
          disabled={Boolean(meldung)}
          style={styles.melden}
          onPress={() => router.push({ pathname: '/melden', params: { art: 'post', id: post.id } })}
        />
      ) : null}
    </SsScreen>
  );
}

function Zeile({
  icon,
  label,
  wert,
  leise,
}: {
  icon: IconName;
  label: string;
  wert: string;
  /** Für Werte, die kein echter Inhalt sind, sondern deren Fehlen erklären. */
  leise?: boolean;
}) {
  return (
    <View style={styles.zeile}>
      {/* Die feste Breite in `zeileIcon` stammt aus der Emoji-Zeit: Emojis sind je
          nach Gerät verschieden breit, deshalb brauchten sie eine Spalte. Gezeichnete
          Icons sind alle exakt gleich breit — die Spalte bleibt trotzdem, sie hält
          jetzt die Beschriftungen darunter in einer Flucht. */}
      <View style={styles.zeileIcon}>
        <SsIcon name={icon} size={19} color={colors.inkSoft} />
      </View>
      <View style={styles.zeileText}>
        <SsText variant="caption" color={colors.inkSoft}>
          {label}
        </SsText>
        <SsText variant="bodyStrong" color={leise ? colors.inkSoft : colors.ink}>
          {wert}
        </SsText>
      </View>
    </View>
  );
}

function Trenner() {
  return <View style={styles.trenner} />;
}

function Hinweis({ icon, titel, text }: { icon: IconName; titel: string; text: string }) {
  return (
    <View style={styles.hinweis}>
      <View style={styles.hinweisIcon}>
        <SsIcon name={icon} size={24} color={colors.ink} />
      </View>
      <View style={styles.hinweisText}>
        <SsText variant="bodyStrong">{titel}</SsText>
        <SsText variant="caption" color={colors.inkSoft}>
          {text}
        </SsText>
      </View>
    </View>
  );
}

function NichtGefunden() {
  return (
    <SsScreen contentStyle={styles.fehlerSeite}>
      <SsIcon name="frage" size={52} color={colors.inkSoft} />
      <SsText variant="heading" center>
        Diesen Post gibt es nicht mehr
      </SsText>
      <SsText variant="body" center color={colors.inkSoft}>
        Vielleicht ist er abgelaufen oder wurde gelöscht.
      </SsText>
      <SsButton label="Zurück zum Feed" onPress={() => router.replace('/')} />
    </SsScreen>
  );
}

const styles = StyleSheet.create({
  seite: { gap: spacing.md, paddingTop: spacing.sm },

  titelBlock: { gap: spacing.sm },

  person: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  personText: { flex: 1, gap: 2 },

  zeile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  zeileIcon: { width: 22, alignItems: 'center' },
  zeileText: { flex: 1, gap: 1 },
  trenner: { height: 1, backgroundColor: colors.line, marginVertical: spacing.xs },

  aktion: { gap: spacing.md, marginTop: spacing.sm },
  // `alignSelf` muss sein: SsButton setzt für schmale Knöpfe selbst 'flex-start'.
  melden: { alignSelf: 'center', marginTop: spacing.lg },

  hinweis: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
  },
  // Auf die Mitte der ersten Zeile, nicht des ganzen Blocks — sonst rutscht das
  // Icon bei dreizeiligen Hinweisen in die Mitte (ACTA-Falle aus Phase 12).
  hinweisIcon: { marginTop: 1 },
  hinweisText: { flex: 1, gap: spacing.xs },
  echo: { marginTop: -spacing.xs },

  fehlerSeite: { alignItems: 'center', justifyContent: 'center', gap: spacing.md },
});
