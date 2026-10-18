import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';

import { t, tSatz } from '@/i18n';
import { SsBack, SsButton, SsCard, SsChip, SsIconText, SsScreen, SsText } from '@/components/ui';
import { mitgliederText } from '@/features/groups/gruppe';
import { useGruppenListe, type GruppenEintrag } from '@/features/groups/hooks';
import { ortText } from '@/lib/bezirk';
import { colors, spacing } from '@/theme';

/**
 * Alle Gruppen — Phase 17.
 *
 * ── Warum das kein Tab ist ────────────────────────────────────────────────────
 * Die Leiste hat vier Schaltflächen, und eine fünfte wäre schon eng. Wichtiger:
 * Gruppen sind nach Ians Entscheidung 1 KEIN zweiter Ort, sondern eine Einstellung
 * am Post. Ein eigener Tab würde genau das Gegenteil behaupten — man wäre „in der
 * Gruppe" statt im Feed, und der Hauptfeed liefe leer. Der Weg hierher führt über
 * das Profil, wie zu den Einstellungen.
 *
 * ── Warum EINE Liste und nicht „Meine" und „Entdecken" getrennt ───────────────
 * Weil die Trennung dieselbe Frage zweimal stellt. Wer hier landet, will entweder
 * in eine Gruppe hinein oder in eine hinein, in der er schon ist — und beides
 * beantwortet der Knopf an der Zeile. Zwei Listen hätten am Anfang, wenn man in
 * keiner Gruppe ist, eine leere Überschrift ganz oben.
 */
export default function GruppenScreen() {
  const eintraege = useGruppenListe();
  const meine = eintraege.filter((e) => e.mitglied).length;

  return (
    <SsScreen scrolltSelbst contentStyle={styles.seite}>
      <SsBack />

      <View style={styles.kopf}>
        <SsText variant="title">{t('gruppenliste.titel')}</SsText>
        <SsText variant="caption" color={colors.inkSoft}>
          {/* ⚠️ Dritter Mehrzahl-Fall: zwei Schlüssel, Verzweigung HIER. Ein
              Platzhalter im Satz („in {n} Gruppen") stimmt bei n = 1 in keiner
              der beiden Sprachen. */}
          {meine === 0
            ? t('gruppenliste.wasIstEineGruppe', { stadt: t('marke.stadt') })
            : meine === 1
              ? t('gruppenliste.inEinerGruppe')
              : t('gruppenliste.inMehrerenGruppen', { anzahl: meine })}
        </SsText>
      </View>

      <SsButton
        label={t('gruppe.gruppeErstellen')}
        icon="plus"
        block
        onPress={() => router.push('/gruppe/neu')}
      />

      <FlatList
        data={eintraege}
        keyExtractor={(e) => e.gruppe.id}
        renderItem={({ item }) => <GruppenZeile eintrag={item} />}
        ItemSeparatorComponent={() => <View style={styles.luecke} />}
        style={styles.listeAussen}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <SsText variant="caption" color={colors.inkSoft} center>
            {t('gruppenliste.nochKeine')}
          </SsText>
        }
      />
    </SsScreen>
  );
}

/**
 * Eine Zeile. Der Zustand steht rechts und ist der Grund, warum die Liste eine
 * Liste sein darf: „Drin" · „Angefragt" · nichts. Ohne diese Auskunft müsste man
 * jede Gruppe aufmachen, um zu sehen, ob man schon dabei ist.
 */
function GruppenZeile({ eintrag }: { eintrag: GruppenEintrag }) {
  const { gruppe, mitglied, angefragt } = eintrag;

  return (
    <SsCard
      category={gruppe.category}
      onPress={() => router.push({ pathname: '/gruppe/[id]', params: { id: gruppe.id } })}>
      <View style={styles.zeileKopf}>
        <SsChip category={gruppe.category} />
        {mitglied ? (
          <SsIconText icon="haken">{t('stand.dabei')}</SsIconText>
        ) : angefragt ? (
          <SsIconText icon="uhr">{t('gruppenliste.angefragt')}</SsIconText>
        ) : null}
      </View>

      <SsText variant="heading">{gruppe.name}</SsText>

      <SsText variant="caption" color={colors.inkSoft} numberOfLines={2}>
        {gruppe.description}
      </SsText>

      <SsText variant="caption" color={colors.inkSoft}>
        {/* Die Mitgliederzahl steht auch bei Gruppen, in denen man nicht ist — WER
            drin ist, dagegen nicht (`useMitglieder`). Ohne die Zahl könnte man
            nicht entscheiden, ob sich eine Anfrage lohnt. */}
        {tSatz(mitgliederText(gruppe.memberIds.length))}   ·   {ortText(gruppe.district)}
      </SsText>
    </SsCard>
  );
}

const styles = StyleSheet.create({
  seite: { gap: spacing.md, paddingTop: spacing.sm },
  kopf: { gap: spacing.xs },
  // Die Liste braucht ihre eigene Höhe, sonst fällt sie neben den Elementen
  // darüber zusammen — dieselbe ACTA-Falle wie bei den waagrechten Reihen.
  listeAussen: { flex: 1, marginHorizontal: -spacing.md },
  liste: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  luecke: { height: spacing.sm },
  zeileKopf: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
});
