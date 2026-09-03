import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';

import { SsAvatar, SsButton, SsCard, SsChip, SsIcon, SsIconText, SsScreen, SsSegment, SsText } from '@/components/ui';
import { mitgliederText } from '@/features/groups/gruppe';
import {
  beitrittAblehnen,
  beitrittBestaetigen,
  useEingehendeGruppenAnfragen,
  useGesendeteGruppenAnfragen,
  type GruppenAnfrageEintrag,
} from '@/features/groups/hooks';
import { freiePlaetze } from '@/features/posts/hooks';
import {
  anfrageAblehnen,
  anfrageBestaetigen,
  useEingehendeAnfragen,
  useGesendeteAnfragen,
  type AnfrageEintrag,
} from '@/features/requests/hooks';
import { ortText } from '@/lib/bezirk';
import { startOderSeit, vergangen } from '@/lib/zeit';
import { colors, radius, spacing } from '@/theme';
import type { IconName } from '@/theme/icons';
import type { Group, Post, RequestStatus } from '@/types/models';

/**
 * Der Anfragen-Tab: hier wird aus einem „Bin dabei" eine Verabredung.
 *
 * ── Zwei Blickrichtungen, ein Tab ─────────────────────────────────────────────
 * "Bekommen" sind die Leute, die bei MEINEN Posts mitmachen wollen — das ist der
 * Teil, an dem die App etwas von mir will, und deshalb der Standard. "Geschickt"
 * ist der Gegenblick: worauf warte ich selbst? Ohne den zweiten gäbe es nach dem
 * Drücken von "Bin dabei" keinen Ort, an dem man den Stand nachsieht — man müsste
 * sich merken, welcher Post es war, und ihn im Feed wiederfinden.
 *
 * ── Seit Phase 17 liegen hier ZWEI Sorten Anfragen ────────────────────────────
 * „Bin dabei" bei einer Aktivität und „darf ich in die Gruppe". Sie stehen bewusst
 * in DEMSELBEN Tab und nicht in einem eigenen: Ians Entscheidung 2 zu Gruppen war,
 * bewusst dasselbe Muster zu nehmen — anfragen, bestätigen, drin —, damit es ein
 * Muster weniger zu lernen gibt. Zwei Tabs hätten daraus wieder zwei gemacht.
 *
 * Die Gruppen-Abschnitte stehen UNTER den Post-Abschnitten, und das ist keine
 * Rangfolge, sondern eine Uhr: Eine Post-Anfrage hat einen Termin, der vorbeigeht —
 * bestätigt man sie zu spät, ist die Aktivität gelaufen. Eine Gruppe wartet.
 *
 * ── Warum SectionList und nicht ScrollView mit map ────────────────────────────
 * Dieselbe Überlegung wie beim Feed: die Liste ist heute kurz und kann wachsen.
 * SectionList zeichnet nur, was sichtbar ist, und bringt die Gruppierung nach Post
 * gleich mit.
 */
/**
 * Ein Abschnitt in der Liste „Bekommen" — entweder ein Post oder eine Gruppe.
 *
 * Ein unterschiedenes Union statt zweier Listen: Die Alternative wären zwei
 * SectionLists untereinander gewesen, und die zweite hätte in einer scrollenden
 * Liste ihre eigene Höhe gebraucht (die ACTA-Falle mit `flexShrink`). `art` ist
 * dabei kein Beiwerk — daran entscheidet `renderSectionHeader`, was er zeichnet,
 * und ohne das Feld müsste er raten, welches Feld gesetzt ist.
 */
type Abschnitt =
  | { art: 'post'; post: Post }
  | { art: 'gruppe'; gruppe: Group };

/** Was in so einem Abschnitt liegt. Beide haben `anfrage`, sonst nichts gemeinsam. */
type Zeile = AnfrageEintrag | GruppenAnfrageEintrag;

export default function RequestsScreen() {
  const [ansicht, setAnsicht] = useState<'bekommen' | 'geschickt'>('bekommen');
  const gruppen = useEingehendeAnfragen();
  const gesendet = useGesendeteAnfragen();
  const gruppenAnfragen = useEingehendeGruppenAnfragen();
  const gruppenGesendet = useGesendeteGruppenAnfragen();

  const offeneAnzahl =
    gruppen.reduce((summe, g) => summe + g.eintraege.length, 0) +
    gruppenAnfragen.reduce((summe, g) => summe + g.eintraege.length, 0);

  // SectionList erwartet seine Zeilen unter dem Namen `data`. Die Haken liefern
  // `eintraege` — ein Wort, das etwas bedeutet. Übersetzt wird hier, damit die
  // Bezeichnung der Bibliothek nicht bis in die Datenschicht durchschlägt.
  const sections = useMemo(
    () => [
      ...gruppen.map((g) => ({ art: 'post' as const, post: g.post, data: g.eintraege as Zeile[] })),
      ...gruppenAnfragen.map((g) => ({
        art: 'gruppe' as const,
        gruppe: g.gruppe,
        data: g.eintraege as Zeile[],
      })),
    ],
    [gruppen, gruppenAnfragen],
  );

  /**
   * „Geschickt": beide Sorten in EINER Liste, das Neueste zuerst.
   *
   * Nicht nach Sorte getrennt — dieselbe Überlegung wie bei der Chat-Liste (harte
   * Regel 30): Wer nachsieht, worauf er wartet, fragt „was ist offen?", nicht
   * „was davon war eine Gruppe?". Woher eine Zeile kommt, sieht man an ihr selbst.
   */
  const gesendetAlles = useMemo(
    () =>
      [...gesendet, ...gruppenGesendet].sort((a, b) =>
        b.anfrage.createdAt.localeCompare(a.anfrage.createdAt),
      ),
    [gesendet, gruppenGesendet],
  );

  return (
    <SsScreen tabScreen contentStyle={styles.seite}>
      <View style={styles.kopf}>
        <SsText variant="title">Anfragen</SsText>
      </View>

      <SsSegment<'bekommen' | 'geschickt'>
        value={ansicht}
        onChange={setAnsicht}
        style={styles.umschalter}
        options={[
          { wert: 'bekommen', label: offeneAnzahl > 0 ? `Bekommen · ${offeneAnzahl}` : 'Bekommen' },
          { wert: 'geschickt', label: gesendet.length > 0 ? `Geschickt · ${gesendet.length}` : 'Geschickt' },
        ]}
      />

      {ansicht === 'bekommen' ? (
        <SectionList<Zeile, Abschnitt>
          sections={sections}
          // Post-Anfragen heißen `r…`, Gruppen-Anfragen `gr…` (`neueId` in
          // `store.ts`) — in einer gemeinsamen Liste sind die Schlüssel damit
          // eindeutig, ohne dass hier ein Präfix drangeklebt werden muss.
          keyExtractor={(e) => e.anfrage.id}
          renderSectionHeader={({ section }) =>
            section.art === 'post' ? (
              <GruppenKopf post={section.post} />
            ) : (
              <GruppeKopf gruppe={section.gruppe} />
            )
          }
          renderItem={({ item }) =>
            // Am ITEM unterschieden und nicht am Abschnitt: TypeScript weiß beim
            // Zeichnen nicht, dass die beiden zusammengehören — `'gruppe' in item`
            // ist die Prüfung, die es wirklich beweist.
            'gruppe' in item ? (
              <GruppenAnfrageZeile eintrag={item} />
            ) : (
              <EingehendeZeile eintrag={item} />
            )
          }
          SectionSeparatorComponent={() => <View style={styles.luecke} />}
          ItemSeparatorComponent={() => <View style={styles.luecke} />}
          // Standardmäßig kleben die Überschriften auf iOS oben fest. Sie sind hier
          // aber transparent und würden über die Karten darunter wandern.
          stickySectionHeadersEnabled={false}
          style={styles.listeAussen}
          contentContainerStyle={styles.liste}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<NochNichts art="bekommen" />}
        />
      ) : (
        <SectionList<Zeile, { art: 'gesendet' }>
          sections={[{ art: 'gesendet', data: gesendetAlles }]}
          keyExtractor={(e) => e.anfrage.id}
          renderSectionHeader={() => null}
          renderItem={({ item }) =>
            'gruppe' in item ? (
              <GesendeteGruppenZeile eintrag={item} />
            ) : (
              <GesendeteZeile eintrag={item} />
            )
          }
          ItemSeparatorComponent={() => <View style={styles.luecke} />}
          style={styles.listeAussen}
          contentContainerStyle={styles.liste}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<NochNichts art="geschickt" />}
        />
      )}
    </SsScreen>
  );
}

/**
 * Die Überschrift über einer Gruppe: um welchen Post geht es?
 *
 * Antippbar, weil die Frage "will ich diese Person dabeihaben?" oft nur mit dem
 * ganzen Post zu beantworten ist — wie viele Plätze, welcher Treffpunkt, was steht
 * in der Notiz.
 */
function GruppenKopf({ post }: { post: Post }) {
  const frei = freiePlaetze(post);

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })}
      accessibilityRole="button"
      style={({ pressed }) => [styles.gruppenKopf, pressed && styles.gedrueckt]}>
      <View style={styles.gruppenZeile}>
        <SsChip category={post.category} />
        <SsText variant="caption" color={frei > 0 ? colors.inkSoft : colors.ink}>
          {frei > 0 ? `${frei} von ${post.spotsTotal} frei` : 'Alle Plätze vergeben'}
        </SsText>
      </View>
      <SsText variant="heading" numberOfLines={1}>
        {post.title}
      </SsText>
      <SsText variant="caption" color={colors.inkSoft}>
        {startOderSeit(post.startsAt)}   ·   {ortText(post.district)}
      </SsText>
    </Pressable>
  );
}

/**
 * Eine Person, die mitmachen will.
 *
 * ── Warum Ablehnen links und Bestätigen rechts ────────────────────────────────
 * Rechts unten landet der Daumen von selbst. Dort soll die Zusage liegen, nicht die
 * Absage — ein versehentliches "Bestätigen" kostet ein Gespräch, ein versehentliches
 * "Ablehnen" kostet einer echten Person die Verabredung.
 */
function EingehendeZeile({ eintrag }: { eintrag: AnfrageEintrag }) {
  const { anfrage, person, post } = eintrag;
  const frei = freiePlaetze(post);
  const voll = frei <= 0;

  return (
    <SsCard>
      <Pressable
        onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })}
        accessibilityRole="button"
        style={styles.person}>
        <SsAvatar name={person.displayName} seed={person.id} photoUrl={person.photoUrl} size="md" />
        <View style={styles.personText}>
          <SsText variant="bodyStrong">{person.displayName}</SsText>
          <SsText variant="caption" color={colors.inkSoft}>
            {person.handle} · {person.district} Wien · {vergangen(anfrage.createdAt)}
          </SsText>
        </View>
      </Pressable>

      {anfrage.message ? (
        <View style={styles.nachricht}>
          <SsText variant="body">„{anfrage.message}“</SsText>
        </View>
      ) : (
        <SsText variant="caption" color={colors.inkSoft}>
          Ohne Nachricht angefragt.
        </SsText>
      )}

      {/* Ians Regel für volle Posts (PLAN.md 6.3, `requests/logic.ts`): übrige Anfragen
          bleiben stehen statt automatisch abgesagt zu werden. Dann steht hier aber ein
          Knopf, der nichts tut — und ein Knopf ohne Wirkung ist ein Fehler. Also sagt
          der Screen, warum er gerade nicht geht und was ihn wieder aufmacht. */}
      {voll ? (
        <SsText variant="caption" color={colors.inkSoft}>
          Alle Plätze sind vergeben. Die Anfrage bleibt stehen — springt jemand ab, kannst
          du sie bestätigen.
        </SsText>
      ) : null}

      <View style={styles.knopfZeile}>
        <SsButton
          variant="danger"
          label="Ablehnen"
          block
          style={styles.knopf}
          onPress={() => anfrageAblehnen(anfrage.id)}
        />
        <SsButton
          variant="category"
          category={post.category}
          label="Bestätigen"
          block
          disabled={voll}
          style={styles.knopf}
          onPress={() => {
            anfrageBestaetigen(anfrage.id);
            router.push({
              pathname: '/match',
              params: { postId: post.id, userId: person.id },
            });
          }}
        />
      </View>
    </SsCard>
  );
}

/**
 * Eine Anfrage, die ICH geschickt habe. Kompakter als die Post-Karte im Feed: hier
 * geht es nicht mehr um "ist das was für mich?", sondern nur noch um den Stand.
 */
function GesendeteZeile({ eintrag }: { eintrag: AnfrageEintrag }) {
  const { anfrage, person, post } = eintrag;
  const stand = STAND[anfrage.status];

  return (
    <SsCard
      category={post.category}
      onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })}>
      <View style={styles.gruppenZeile}>
        <SsText variant="heading" numberOfLines={1} style={styles.titelFlex}>
          {post.title}
        </SsText>
        <SsIconText icon={stand.icon} color={stand.stark ? colors.ink : colors.inkSoft}>
          {stand.text}
        </SsIconText>
      </View>
      <SsText variant="caption" color={colors.inkSoft}>
        {person.displayName} · {startOderSeit(post.startsAt)} · {ortText(post.district)}
      </SsText>
      {anfrage.message ? (
        <SsText variant="caption" color={colors.inkSoft} numberOfLines={2}>
          Du: „{anfrage.message}“
        </SsText>
      ) : null}
    </SsCard>
  );
}

/**
 * Die Überschrift über einer Gruppe von Beitritts-Anfragen — Phase 17.
 *
 * Absichtlich so gebaut wie `GruppenKopf` daneben und nicht anders: Es ist derselbe
 * Vorgang, nur an einem anderen Gegenstand. Was rechts steht, ist das Gegenstück
 * zu „2 von 3 frei" — bei einer Gruppe gibt es keine Plätze, also steht dort, wie
 * groß sie schon ist.
 */
function GruppeKopf({ gruppe }: { gruppe: Group }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/gruppe/[id]', params: { id: gruppe.id } })}
      accessibilityRole="button"
      style={({ pressed }) => [styles.gruppenKopf, pressed && styles.gedrueckt]}>
      <View style={styles.gruppenZeile}>
        <SsChip category={gruppe.category} />
        <SsText variant="caption" color={colors.inkSoft}>
          {mitgliederText(gruppe.memberIds.length)}
        </SsText>
      </View>
      <SsText variant="heading" numberOfLines={1}>
        {gruppe.name}
      </SsText>
      <SsText variant="caption" color={colors.inkSoft}>
        Will in deine Gruppe   ·   {ortText(gruppe.district)}
      </SsText>
    </Pressable>
  );
}

/**
 * Jemand, der in die Gruppe will.
 *
 * Zwei Unterschiede zur Post-Anfrage darüber, und beide folgen aus der Sache:
 * Es gibt keinen vollen Zustand (eine Gruppe hat keine Plätze), und nach dem
 * Bestätigen kommt kein Match-Screen — es entsteht ja kein Treffen und kein Chat,
 * sondern nur eine Mitgliedschaft. Ein Konfetti-Moment dafür wäre ein Versprechen,
 * das die App nicht einlöst.
 */
function GruppenAnfrageZeile({ eintrag }: { eintrag: GruppenAnfrageEintrag }) {
  const { anfrage, person, gruppe } = eintrag;

  return (
    <SsCard>
      <Pressable
        onPress={() => router.push({ pathname: '/user/[id]', params: { id: person.id } })}
        accessibilityRole="button"
        style={styles.person}>
        <SsAvatar name={person.displayName} seed={person.id} photoUrl={person.photoUrl} size="md" />
        <View style={styles.personText}>
          <SsText variant="bodyStrong">{person.displayName}</SsText>
          <SsText variant="caption" color={colors.inkSoft}>
            {person.handle} · {person.district} Wien · {vergangen(anfrage.createdAt)}
          </SsText>
        </View>
      </Pressable>

      {anfrage.message ? (
        <View style={styles.nachricht}>
          <SsText variant="body">„{anfrage.message}“</SsText>
        </View>
      ) : (
        <SsText variant="caption" color={colors.inkSoft}>
          Ohne Nachricht angefragt.
        </SsText>
      )}

      <View style={styles.knopfZeile}>
        <SsButton
          variant="danger"
          label="Ablehnen"
          block
          style={styles.knopf}
          onPress={() => beitrittAblehnen(anfrage.id)}
        />
        <SsButton
          variant="category"
          category={gruppe.category}
          label="Aufnehmen"
          block
          style={styles.knopf}
          onPress={() => beitrittBestaetigen(anfrage.id)}
        />
      </View>
    </SsCard>
  );
}

/** Eine Beitritts-Anfrage, die ICH geschickt habe. */
function GesendeteGruppenZeile({ eintrag }: { eintrag: GruppenAnfrageEintrag }) {
  const { anfrage, person, gruppe } = eintrag;
  const stand = GRUPPEN_STAND[anfrage.status];

  return (
    <SsCard
      category={gruppe.category}
      onPress={() => router.push({ pathname: '/gruppe/[id]', params: { id: gruppe.id } })}>
      <View style={styles.gruppenZeile}>
        <SsText variant="heading" numberOfLines={1} style={styles.titelFlex}>
          {gruppe.name}
        </SsText>
        <SsIconText icon={stand.icon} color={stand.stark ? colors.ink : colors.inkSoft}>
          {stand.text}
        </SsIconText>
      </View>
      <SsText variant="caption" color={colors.inkSoft}>
        Gruppe von {person.displayName} · {mitgliederText(gruppe.memberIds.length)}
      </SsText>
      {anfrage.message ? (
        <SsText variant="caption" color={colors.inkSoft} numberOfLines={2}>
          Du: „{anfrage.message}“
        </SsText>
      ) : null}
    </SsCard>
  );
}

/**
 * Dieselben drei Ausgänge, andere Worte. Eine gemeinsame Tabelle mit `STAND` wäre
 * verlockend, aber „Du bist dabei" heißt bei einer Aktivität etwas anderes als bei
 * einer Gruppe — dort ist man dabei, hier ist man DRIN, und zwar dauerhaft.
 */
const GRUPPEN_STAND = {
  pending: { icon: 'uhr', text: 'Wartet', stark: false },
  accepted: { icon: 'personen', text: 'Du bist drin', stark: true },
  declined: { icon: 'kreuzKreis', text: 'Diesmal nicht', stark: false },
} as const satisfies Record<RequestStatus, { icon: IconName; text: string; stark: boolean }>;

/**
 * Die drei Ausgänge einer Anfrage in drei Worten — an einer Stelle, nicht im JSX
 * verstreut. Seit Phase 14 mit Icon statt Emoji im Text: Nur so kann „Du bist dabei"
 * dunkel dastehen, während die beiden anderen grau bleiben (`stark`).
 */
const STAND = {
  pending: { icon: 'uhr', text: 'Wartet', stark: false },
  accepted: { icon: 'funken', text: 'Du bist dabei', stark: true },
  declined: { icon: 'kreuzKreis', text: 'Diesmal nicht', stark: false },
} as const satisfies Record<RequestStatus, { icon: IconName; text: string; stark: boolean }>;

/**
 * Zwei leere Zustände, weil es zwei verschiedene Situationen sind — dieselbe
 * Überlegung wie im Feed. "Niemand hat angefragt" ist kein Fehler des Nutzers;
 * "du hast noch nirgends zugesagt" hat dagegen einen naheliegenden nächsten Schritt.
 */
function NochNichts({ art }: { art: 'bekommen' | 'geschickt' }) {
  if (art === 'bekommen') {
    return (
      <View style={styles.leer}>
        <SsIcon name="hand" size={46} color={colors.inkSoft} />
        <SsText variant="heading" center>
          Noch will niemand mitmachen
        </SsText>
        <SsText variant="body" center color={colors.inkSoft}>
          Sobald jemand bei einem deiner Posts „Bin dabei“ drückt, steht er hier — und du
          entscheidest.
        </SsText>
      </View>
    );
  }

  return (
    <View style={styles.leer}>
      <SsIcon name="auge" size={46} color={colors.inkSoft} />
      <SsText variant="heading" center>
        Du hast noch nirgends zugesagt
      </SsText>
      <SsText variant="body" center color={colors.inkSoft}>
        Im Feed ist bestimmt was dabei.
      </SsText>
      <SsButton
        label="Zum Feed"
        icon="haus"
        style={styles.leerKnopf}
        onPress={() => router.push('/')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  seite: { paddingHorizontal: 0 },
  kopf: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  umschalter: { marginHorizontal: spacing.lg, marginBottom: spacing.md },

  listeAussen: { flex: 1 },
  liste: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  luecke: { height: spacing.md },

  gruppenKopf: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    cursor: 'pointer',
  },
  gruppenZeile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titelFlex: { flexShrink: 1 },
  gedrueckt: { opacity: 0.6 },

  person: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, cursor: 'pointer' },
  personText: { flex: 1, gap: 2 },

  nachricht: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
  },

  knopfZeile: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  knopf: { flex: 1 },

  leer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  leerKnopf: { marginTop: spacing.md, alignSelf: 'center' },
});
