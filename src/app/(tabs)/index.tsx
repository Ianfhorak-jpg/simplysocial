import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PostCard } from '@/components/PostCard';
import { SsButton, SsChip, SsScreen, SsSegment, SsText } from '@/components/ui';
import { BRAND } from '@/config/brand';
import { useFeed, type KategorieFilter } from '@/features/posts/hooks';
import { CATEGORY_ORDER, categoryColors, colors, spacing } from '@/theme';

/**
 * Der Feed — der erste Screen der App und der einzige, den man täglich sieht.
 *
 * ── Warum FlatList und nicht `<SsScreen scroll>` mit einem `.map()` ───────────
 * Bei 14 Fake-Posts wäre beides gleich. Aber die FlatList zeichnet nur, was gerade
 * sichtbar ist — bei 300 echten Posts ist das der Unterschied zwischen flüssig und
 * ruckelig. Weil das später sowieso nötig wird, steht es jetzt schon richtig da.
 * (Deshalb bekommt `SsScreen` hier KEIN `scroll`: eine FlatList in einem ScrollView
 * verliert genau diese Fähigkeit und warnt zu Recht.)
 *
 * ── Warum Kopf und Filter stehen bleiben ──────────────────────────────────────
 * Sie könnten mitscrollen (`ListHeaderComponent`). Aber wer filtert, will das
 * Ergebnis sehen und sofort weiterfiltern — ein Filter, den man erst wieder
 * hochscrollen muss, wird nicht benutzt.
 */
export default function FeedScreen() {
  const [kategorie, setKategorie] = useState<KategorieFilter>('alle');
  const [nurGefolgte, setNurGefolgte] = useState(false);

  // Ohne useMemo wäre `filter` bei jedem Rendern ein neues Objekt und die
  // Sortierung im Feed liefe jedes Mal neu, obwohl sich nichts geändert hat.
  const filter = useMemo(() => ({ kategorie, nurGefolgte }), [kategorie, nurGefolgte]);
  const eintraege = useFeed(filter);

  const filterAktiv = kategorie !== 'alle' || nurGefolgte;

  return (
    <SsScreen tabScreen contentStyle={styles.seite}>
      <View style={styles.kopf}>
        <View style={styles.marke}>
          <SsText variant="title">
            {BRAND.wordmark.first}
            <SsText variant="title" color={categoryColors.creative.base}>
              {BRAND.wordmark.second}
            </SsText>
          </SsText>
          <SsText variant="caption" color={colors.inkSoft}>
            {BRAND.city}
          </SsText>
        </View>
        {/* Der Weg zum Posten steht im Kopf und nicht als schwebender Knopf über der
            Liste: ein schwebender Knopf verdeckt immer genau die Karte, die man
            gerade lesen will — und unten ist schon die Tab-Leiste. */}
        <SsButton label="Posten" icon="✏️" onPress={() => router.push('/create')} />
      </View>

      <Umschalter nurGefolgte={nurGefolgte} setzen={setNurGefolgte} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipZeile}
        contentContainerStyle={styles.chipInhalt}>
        <SsChip
          label="Alle"
          selected={kategorie === 'alle'}
          onPress={() => setKategorie('alle')}
        />
        {CATEGORY_ORDER.map((k) => (
          <SsChip
            key={k}
            category={k}
            selected={kategorie === k}
            onPress={() => setKategorie(kategorie === k ? 'alle' : k)}
          />
        ))}
      </ScrollView>

      <FlatList
        data={eintraege}
        keyExtractor={(e) => e.post.id}
        renderItem={({ item }) => (
          <PostCard
            eintrag={item}
            onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.post.id } })}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.luecke} />}
        style={styles.listeAussen}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<LeererFeed filterAktiv={filterAktiv} zuruecksetzen={() => {
          setKategorie('alle');
          setNurGefolgte(false);
        }} />}
      />
    </SsScreen>
  );
}

/**
 * "Alle" gegen "Wem ich folge".
 *
 * Bewusst als geteilte Fläche (`SsSegment`) und nicht als zwei Pillen wie die
 * Kategorien darunter: zwei Chip-Reihen übereinander sähen aus wie eine lange
 * Filterliste, und "Alle" stünde zweimal da — einmal für Leute, einmal für
 * Kategorien. Die geteilte Fläche sagt von selbst "entweder-oder".
 *
 * Zur Beschriftung: In PLAN.md heißt der Filter "Nur Follower". Wörtlich genommen
 * wären das die Leute, die MIR folgen — nützlich ist aber die andere Richtung: die
 * Leute, denen ICH folge. Deshalb steht hier "Wem ich folge".
 */
function Umschalter({
  nurGefolgte,
  setzen,
}: {
  nurGefolgte: boolean;
  setzen: (wert: boolean) => void;
}) {
  return (
    <SsSegment<boolean>
      value={nurGefolgte}
      onChange={setzen}
      style={styles.umschalter}
      options={[
        { wert: false, label: 'Alle' },
        { wert: true, label: 'Wem ich folge' },
      ]}
    />
  );
}

/**
 * Zwei verschiedene leere Zustände, weil es zwei verschiedene Situationen sind.
 *
 * "Der Filter ist zu eng" ist ein Bedienungsproblem — dort gehört der Ausweg hin,
 * nicht die Aufforderung, selbst zu posten. Und "in Wien ist gerade wirklich nichts
 * los" ist der Moment, in dem die App um einen Beitrag bitten darf. Ein einziger
 * Text für beides wäre in mindestens einem der Fälle die falsche Antwort.
 */
function LeererFeed({
  filterAktiv,
  zuruecksetzen,
}: {
  filterAktiv: boolean;
  zuruecksetzen: () => void;
}) {
  if (filterAktiv) {
    return (
      <View style={styles.leer}>
        <SsText style={styles.leerEmoji}>🔍</SsText>
        <SsText variant="heading" center>
          Dazu ist gerade nichts da
        </SsText>
        <SsText variant="body" center color={colors.inkSoft}>
          Mit einem anderen Filter findest du vielleicht mehr.
        </SsText>
        <Pressable onPress={zuruecksetzen} accessibilityRole="button" style={styles.leerLink}>
          <SsText variant="label" color={categoryColors.creative.base}>
            Filter zurücksetzen
          </SsText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.leer}>
      <SsText style={styles.leerEmoji}>🌱</SsText>
      <SsText variant="heading" center>
        Noch nichts los in deinem Feed
      </SsText>
      <SsText variant="body" center color={colors.inkSoft}>
        Poste doch selbst was — irgendwer hat immer Zeit.
      </SsText>
      {/* Der Satz allein wäre eine Aufforderung ohne Weg. Hier ist der leere Feed der
          einzige Ort, an dem der ganze Bildschirm nichts Besseres zu tun hat. */}
      <SsButton
        label="Etwas posten"
        icon="✏️"
        size="lg"
        style={styles.leerKnopf}
        onPress={() => router.push('/create')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  seite: { paddingHorizontal: 0 },
  kopf: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  marke: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },

  umschalter: { marginHorizontal: spacing.lg },

  // Der negative Rand hebt die Seitenabstände auf, das Innenmaß bringt sie zurück:
  // dadurch scrollen die Pillen von Kante zu Kante, stehen aber bündig unter dem Rest.
  //
  // `flexShrink: 0` ist hier nicht Kosmetik, sondern notwendig: ein ScrollView bringt
  // von sich aus `flexGrow: 1, flexShrink: 1` mit. Neben der FlatList, die den ganzen
  // Rest des Screens beansprucht, wurde die Pillenreihe dadurch auf Höhe 0
  // zusammengedrückt — im DOM war sie da, zu sehen war ein Strich.
  chipZeile: { flexGrow: 0, flexShrink: 0, marginHorizontal: -spacing.lg },
  chipInhalt: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  listeAussen: { flex: 1 },
  // `flexGrow: 1` am Inhalt, damit der leere Zustand die volle Höhe bekommt und
  // mittig sitzt statt oben zu kleben.
  liste: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  luecke: { height: spacing.md },

  leer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingBottom: spacing.xxxl },
  leerEmoji: { fontSize: 44, lineHeight: 53 },
  leerLink: { marginTop: spacing.sm, cursor: 'pointer' },
  // SsButton setzt für schmale Knöpfe selbst 'flex-start' und schlägt damit das
  // 'alignItems: center' des leeren Zustands.
  leerKnopf: { marginTop: spacing.md, alignSelf: 'center' },
});
