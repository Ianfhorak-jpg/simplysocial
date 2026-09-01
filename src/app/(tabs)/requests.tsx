import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';

import { SsAvatar, SsButton, SsCard, SsChip, SsScreen, SsSegment, SsText } from '@/components/ui';
import { freiePlaetze } from '@/features/posts/hooks';
import {
  anfrageAblehnen,
  anfrageBestaetigen,
  useEingehendeAnfragen,
  useGesendeteAnfragen,
  type AnfrageEintrag,
} from '@/features/requests/hooks';
import { startOderSeit, vergangen } from '@/lib/zeit';
import { colors, radius, spacing } from '@/theme';
import type { Post } from '@/types/models';

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
 * ── Warum SectionList und nicht ScrollView mit map ────────────────────────────
 * Dieselbe Überlegung wie beim Feed: die Liste ist heute kurz und kann wachsen.
 * SectionList zeichnet nur, was sichtbar ist, und bringt die Gruppierung nach Post
 * gleich mit.
 */
export default function RequestsScreen() {
  const [ansicht, setAnsicht] = useState<'bekommen' | 'geschickt'>('bekommen');
  const gruppen = useEingehendeAnfragen();
  const gesendet = useGesendeteAnfragen();

  const offeneAnzahl = gruppen.reduce((summe, g) => summe + g.eintraege.length, 0);

  // SectionList erwartet seine Zeilen unter dem Namen `data`. Der Haken liefert
  // `eintraege` — ein Wort, das etwas bedeutet. Übersetzt wird hier, damit die
  // Bezeichnung der Bibliothek nicht bis in die Datenschicht durchschlägt.
  const sections = useMemo(
    () => gruppen.map((g) => ({ post: g.post, data: g.eintraege })),
    [gruppen],
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
        <SectionList
          sections={sections}
          keyExtractor={(e) => e.anfrage.id}
          renderSectionHeader={({ section }) => <GruppenKopf post={section.post} />}
          renderItem={({ item }) => <EingehendeZeile eintrag={item} />}
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
        <SectionList
          sections={[{ post: null, data: gesendet }]}
          keyExtractor={(e) => e.anfrage.id}
          renderSectionHeader={() => null}
          renderItem={({ item }) => <GesendeteZeile eintrag={item} />}
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
        {startOderSeit(post.startsAt)}   ·   {post.district} Wien
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
        <SsAvatar emoji={person.avatar} seed={person.id} size="md" />
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
        <SsText variant="caption" color={stand.stark ? colors.ink : colors.inkSoft}>
          {stand.text}
        </SsText>
      </View>
      <SsText variant="caption" color={colors.inkSoft}>
        {person.displayName} · {startOderSeit(post.startsAt)} · {post.district} Wien
      </SsText>
      {anfrage.message ? (
        <SsText variant="caption" color={colors.inkSoft} numberOfLines={2}>
          Du: „{anfrage.message}“
        </SsText>
      ) : null}
    </SsCard>
  );
}

/** Die drei Ausgänge einer Anfrage in drei Worten — an einer Stelle, nicht im JSX verstreut. */
const STAND = {
  pending: { text: '⏳ Wartet', stark: false },
  accepted: { text: '🎉 Du bist dabei', stark: true },
  declined: { text: '🙁 Diesmal nicht', stark: false },
} as const;

/**
 * Zwei leere Zustände, weil es zwei verschiedene Situationen sind — dieselbe
 * Überlegung wie im Feed. "Niemand hat angefragt" ist kein Fehler des Nutzers;
 * "du hast noch nirgends zugesagt" hat dagegen einen naheliegenden nächsten Schritt.
 */
function NochNichts({ art }: { art: 'bekommen' | 'geschickt' }) {
  if (art === 'bekommen') {
    return (
      <View style={styles.leer}>
        <SsText style={styles.leerEmoji}>🙋</SsText>
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
      <SsText style={styles.leerEmoji}>👀</SsText>
      <SsText variant="heading" center>
        Du hast noch nirgends zugesagt
      </SsText>
      <SsText variant="body" center color={colors.inkSoft}>
        Im Feed ist bestimmt was dabei.
      </SsText>
      <SsButton
        label="Zum Feed"
        icon="🏠"
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
  leerEmoji: { fontSize: 44, lineHeight: 53 },
  leerKnopf: { marginTop: spacing.md, alignSelf: 'center' },
});
