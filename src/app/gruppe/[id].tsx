import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PostCard } from '@/components/PostCard';
import {
  SsAvatar,
  SsBack,
  SsButton,
  SsCard,
  SsChip,
  SsIconText,
  SsInput,
  SsScreen,
  SsText,
} from '@/components/ui';
import {
  austrittFolgen,
  beitrittHuerdeText,
  istGruender,
  istMitglied,
  mitgliederText,
  nachfolgerId,
} from '@/features/groups/gruppe';
import {
  beitrittAnfragen,
  beitrittZuruecknehmen,
  gruppeVerlassen,
  useGruppe,
  useMeineGruppenAnfrage,
  useMitglieder,
} from '@/features/groups/hooks';
import { useGruppenPosts } from '@/features/posts/hooks';
import { useIstBlockiert } from '@/features/safety/hooks';
import { useCurrentUser, useUser } from '@/features/social/hooks';
import { gruppeIds } from '@/features/statisch';
import { ortText } from '@/lib/bezirk';
import { zurueckOderFeed } from '@/lib/navigation';
import { colors, danger, spacing } from '@/theme';
import type { Group, User } from '@/types/models';

/**
 * Welche Adressen beim Bauen entstehen — harte Regel 11. Ohne diese Funktion heißt
 * die gebaute Datei `gruppe/[id].html` und jeder Direktaufruf ist 404.
 */
export function generateStaticParams(): Array<{ id: string }> {
  return gruppeIds();
}

/**
 * Eine Gruppe ansehen — Phase 17.
 *
 * ── Der Screen zeigt zwei verschiedene Seiten ─────────────────────────────────
 * Von INNEN: Mitglieder, laufende Posts, „Für die Gruppe posten", „Verlassen".
 * Von AUSSEN: Name, Kategorie, Bezirk, wie viele drin sind — und der Weg hinein.
 *
 * Das ist keine Halbierung aus Bequemlichkeit, sondern Ians Entscheidung 2: Man
 * soll die Gruppe FINDEN können (sonst kann man nichts anfragen), aber noch nichts
 * von ihr lesen. Wer eine Anfrage laufen hat, sieht deshalb weiterhin die
 * Außenseite — „auf Anfrage" hieße sonst „auf Anfrage, aber lesen darfst du sofort".
 *
 * ── Warum die Beitritts-Anfragen hier NICHT bearbeitet werden ─────────────────
 * Sie liegen im Anfragen-Tab, zusammen mit den Post-Anfragen. Zwei Orte für
 * dieselbe Handlung wären zwei Screens, die dasselbe können müssen — und einer
 * davon bekäme die nächste Änderung nicht mit. Hier steht nur, DASS welche warten,
 * mit dem Weg dorthin.
 */
export default function GruppeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ich = useCurrentUser();
  const gruppe = useGruppe(id);
  const mitglieder = useMitglieder(gruppe);
  const posts = useGruppenPosts(gruppe);
  const meineAnfrage = useMeineGruppenAnfrage(id);
  const gruender = useUser(gruppe?.creatorId);
  const blockiert = useIstBlockiert(gruppe?.creatorId);

  const [nachricht, setNachricht] = useState('');
  const [fragt, setFragt] = useState(false);

  if (!gruppe) {
    return (
      <SsScreen contentStyle={styles.seite}>
        <SsBack />
        <SsText variant="title">Diese Gruppe gibt es nicht mehr.</SsText>
        <SsText variant="caption" color={colors.inkSoft}>
          Vielleicht hat sie der Gründer aufgelöst.
        </SsText>
        <SsButton label="Zum Feed" block onPress={zurueckOderFeed} />
      </SsScreen>
    );
  }

  const drin = istMitglied(gruppe, ich.id);
  const meine = istGruender(gruppe, ich.id);
  // Ians Entscheidung 2: Wer die Gruppe verlässt, gibt sie an den weiter, der am
  // längsten dabei ist. Der Name steht in der Rückfrage — sonst tippt jemand auf
  // „Verlassen" und erfährt erst hinterher, dass er seine Gruppe verschenkt hat.
  const erbeId = meine ? nachfolgerId(gruppe, ich.id) : null;
  const erbe = mitglieder.find((m) => m.id === erbeId);

  return (
    <SsScreen scroll keyboard contentStyle={styles.seite}>
      <SsBack />

      <SsCard category={gruppe.category}>
        <View style={styles.kopf}>
          <SsChip category={gruppe.category} />
          {drin ? <SsIconText icon="haken">Du bist dabei</SsIconText> : null}
        </View>

        <SsText variant="title">{gruppe.name}</SsText>

        {gruppe.description ? <SsText variant="body">{gruppe.description}</SsText> : null}

        <SsText variant="caption" color={colors.inkSoft}>
          {mitgliederText(gruppe.memberIds.length)}   ·   {ortText(gruppe.district)}
        </SsText>

        {gruender ? (
          <SsText variant="caption" color={colors.inkSoft}>
            {meine ? 'Du hast sie aufgemacht.' : `Aufgemacht von ${gruender.displayName}.`}
          </SsText>
        ) : null}
      </SsCard>

      {drin ? (
        <>
          <View style={styles.block}>
            <SsText variant="label">Wer dabei ist</SsText>
            {/* Blockierte Personen stehen hier MIT drin — anders als im Feed und im
                Anfragen-Tab. Der Unterschied: Dort geht es um Inhalt und Kontakt,
                hier um eine Tatsache über die Gruppe. Würde die App sie herausnehmen,
                stimmte die Mitgliederzahl darüber nicht mehr mit der Liste überein,
                und genau das fiele auf. Ihr Profil zeigt den Block weiterhin. */}
            {mitglieder.map((person) => (
              <MitgliedZeile key={person.id} person={person} gruppe={gruppe} ichId={ich.id} />
            ))}
          </View>

          <SsButton
            label="Für die Gruppe posten"
            icon="plus"
            variant="category"
            category={gruppe.category}
            block
            onPress={() => router.push('/create')}
          />

          <View style={styles.block}>
            <SsText variant="label">Was gerade läuft</SsText>
            {posts.length === 0 ? (
              <SsText variant="caption" color={colors.inkSoft}>
                Gerade nichts. Diese Posts stehen auch im normalen Feed — hier siehst
                du sie nur beisammen.
              </SsText>
            ) : (
              posts.map((eintrag) => (
                <PostCard
                  key={eintrag.post.id}
                  eintrag={eintrag}
                  onPress={() =>
                    router.push({ pathname: '/post/[id]', params: { id: eintrag.post.id } })
                  }
                />
              ))
            )}
          </View>

          {fragt ? (
            <View style={styles.block}>
              <SsCard style={styles.warnung}>
                <SsText variant="bodyStrong" color={danger.onSoft}>
                  {`„${gruppe.name}" verlassen?`}
                </SsText>
                {/* Die Sätze kommen aus `austrittFolgen()` und nicht aus diesem
                    Screen: Ändert Ian eine der beiden Regeln in `gruppe.ts`, ändert
                    sich der Text mit. Ein Screen, der etwas anderes verspricht, als
                    die Regel tut, ist schlimmer als gar kein Text. */}
                {austrittFolgen(gruppe, ich.id, erbe?.displayName).map((satz) => (
                  <SsText key={satz} variant="body">
                    · {satz}
                  </SsText>
                ))}
              </SsCard>
              <SsButton
                variant="danger"
                label="Ja, verlassen"
                block
                onPress={() => {
                  gruppeVerlassen(gruppe.id);
                  setFragt(false);
                  // Nach dem Austritt zeigt dieser Screen die Außenseite — oder, wenn
                  // die Gruppe sich aufgelöst hat, die Nicht-mehr-da-Seite. Beides ist
                  // richtig, also bleibt man hier stehen.
                }}
              />
              <SsButton label="Abbrechen" block onPress={() => setFragt(false)} />
            </View>
          ) : (
            <SsButton label="Gruppe verlassen" icon="verboten" block onPress={() => setFragt(true)} />
          )}
        </>
      ) : (
        <Aussenseite
          gruppe={gruppe}
          angefragt={meineAnfrage !== undefined}
          blockiert={blockiert}
          nachricht={nachricht}
          setNachricht={setNachricht}
        />
      )}

      {/* Ganz unten und nur für den Gründer: DASS Anfragen warten, nicht wie man sie
          beantwortet. Das steht im Anfragen-Tab. */}
      {meine ? (
        <SsButton
          label="Anfragen ansehen"
          icon="hand"
          variant="ghost"
          block
          onPress={() => router.push('/requests')}
        />
      ) : null}

      <View style={{ height: spacing.xl }} />
    </SsScreen>
  );
}

/**
 * Was ein Nichtmitglied sieht: genug, um zu entscheiden — und der Weg hinein.
 *
 * Der Gruß ist vorausgefüllt, wie beim Rechts-Wischen (`grussVorschlag()`). Ein
 * leeres Feld über einem Knopf ist eine Hürde, die viele nicht nehmen; ein Satz,
 * den man überschreiben kann, ist keine.
 */
function Aussenseite({
  gruppe,
  angefragt,
  blockiert,
  nachricht,
  setNachricht,
}: {
  gruppe: Group;
  angefragt: boolean;
  blockiert: boolean;
  nachricht: string;
  setNachricht: (t: string) => void;
}) {
  const huerde = beitrittHuerdeText();

  if (blockiert) {
    return (
      <SsText variant="caption" color={colors.inkSoft} center>
        Zwischen dir und dem Gründer dieser Gruppe steht eine Blockierung.
      </SsText>
    );
  }

  if (angefragt) {
    return (
      <View style={styles.block}>
        <SsIconText icon="uhr">Anfrage geschickt · der Gründer muss noch bestätigen</SsIconText>
        <SsText variant="caption" color={colors.inkSoft}>
          Solange siehst du noch nicht, was in der Gruppe läuft.
        </SsText>
        <SsButton label="Anfrage zurückziehen" block onPress={() => beitrittZuruecknehmen(gruppe.id)} />
      </View>
    );
  }

  if (huerde) {
    return (
      <SsText variant="caption" color={colors.inkSoft} center>
        {huerde}
      </SsText>
    );
  }

  return (
    <View style={styles.block}>
      <SsText variant="caption" color={colors.inkSoft}>
        Was in dieser Gruppe läuft, siehst du erst als Mitglied. Frag an — der Gründer
        bestätigt, dann bist du dabei.
      </SsText>
      <SsInput
        label="Kurz dazuschreiben"
        hint="freiwillig"
        value={nachricht}
        onChangeText={setNachricht}
        placeholder="Servus! Würd gern dazukommen."
        multiline
        maxLength={160}
      />
      <SsButton
        label="Beitritt anfragen"
        icon="hand"
        variant="category"
        category={gruppe.category}
        block
        size="lg"
        onPress={() => beitrittAnfragen(gruppe.id, nachricht)}
      />
    </View>
  );
}

/** Eine Person in der Mitgliederliste. Tippen führt aufs Profil, wie überall sonst. */
function MitgliedZeile({ person, gruppe, ichId }: { person: User; gruppe: Group; ichId: string }) {
  const binIch = person.id === ichId;

  return (
    <SsCard
      onPress={
        binIch
          ? undefined
          : () => router.push({ pathname: '/user/[id]', params: { id: person.id } })
      }>
      <View style={styles.person}>
        <SsAvatar name={person.displayName} seed={person.id} photoUrl={person.photoUrl} size="sm" />
        <SsText variant="body" style={styles.name} numberOfLines={1}>
          {binIch ? 'Du' : person.displayName}
        </SsText>
        {istGruender(gruppe, person.id) ? <SsIconText icon="fahne">Gründer</SsIconText> : null}
      </View>
    </SsCard>
  );
}

const styles = StyleSheet.create({
  seite: { gap: spacing.md, paddingTop: spacing.sm },
  kopf: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  block: { gap: spacing.sm },
  person: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { flex: 1, fontWeight: '700' },
  warnung: { backgroundColor: danger.soft, borderColor: danger.soft },
});
