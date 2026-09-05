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
  darfEinladen,
  istGruender,
  istMitglied,
  mitgliederText,
  nachfolgerId,
  privatHinweis,
} from '@/features/groups/gruppe';
import {
  beitrittAnfragen,
  beitrittZuruecknehmen,
  einladen,
  einladungAblehnen,
  einladungAnnehmen,
  gruppeVerlassen,
  useEinladbare,
  useGruppe,
  useMeineEinladung,
  useMeineGruppenAnfrage,
  useMitglieder,
  type EinladbarEintrag,
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
  const meineEinladung = useMeineEinladung(id);
  const einladbare = useEinladbare(gruppe);
  const gruender = useUser(gruppe?.creatorId);
  // WER eingeladen hat, ist bei einer privaten Gruppe die einzige Auskunft, die man
  // von aussen bekommt — und die, an der man entscheidet. „Lea hat dich geholt" ist
  // etwas anderes als „jemand hat dich geholt".
  const einlader = useUser(meineEinladung?.fromUserId);
  const blockiert = useIstBlockiert(gruppe?.creatorId);

  const [nachricht, setNachricht] = useState('');
  const [fragt, setFragt] = useState(false);
  const [laedtEin, setLaedtEin] = useState(false);

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
  // Phase 18a: NICHT `meine` — seit Ians Entscheidung 26 sind Gründen und Einladen
  // zwei verschiedene Rechte. In einer frisch gegründeten Gruppe geben beide
  // dieselbe Antwort, deshalb fällt eine Verwechslung hier nie auf.
  const darfHolen = darfEinladen(gruppe, ich.id);
  const privat = privatHinweis(gruppe);
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

        {/* Der Satz kommt aus `gruppe.ts` und nicht von hier — dieselbe Trennung
            wie bei `austrittFolgen()` weiter unten. Von INNEN ist „privat" eine
            Auskunft (deine Posts laufen enger), von AUSSEN eine Hürde; welcher der
            beiden Sätze fällt, entscheidet die Regel, nicht der Screen. */}
        {privat && drin ? <SsIconText icon="schloss">{privat}</SsIconText> : null}

        {/* ⚠️ Beim Durchklicken am 2026-09-05 gefunden, und nur dort zu finden: Bei
            einer PRIVATEN Gruppe, in der man nicht ist, stand hier „Aufgemacht von
            Mira." — ein Name aus genau der Mitgliederliste, die zubleiben soll.
            Zwei Regeln, die einzeln stimmen: Phase 17 zeigt den Gründer, damit man
            weiß, wer die Anfrage bestätigt; Phase 18a verbirgt die Mitglieder. Bei
            einer privaten Gruppe gibt es gar keine Anfrage zu bestätigen — der
            Grund für die erste Regel fällt weg, das Leck der zweiten bleibt. */}
        {gruender && (drin || gruppe.offen) ? (
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

          {/* Phase 18a — Leopolds Loch. Der Knopf steht direkt unter „Wer dabei
              ist", weil das die Stelle ist, an der die Frage aufkommt: Man sieht,
              wer da ist, und merkt, wer fehlt. Zugeklappt, weil die Liste so lang
              ist wie mein Folge-Graph und die Gruppenseite nicht davon leben soll. */}
          {darfHolen ? (
            <View style={styles.block}>
              {laedtEin ? (
                <>
                  <SsText variant="label">Wen willst du holen?</SsText>
                  {einladbare.length === 0 ? (
                    <SsText variant="caption" color={colors.inkSoft}>
                      Du kannst Leute einladen, denen du folgst oder die dir folgen. Im
                      Moment ist das niemand — folg jemandem, dann steht er hier.
                    </SsText>
                  ) : (
                    einladbare.map((eintrag) => (
                      <EinladbarZeile
                        key={eintrag.person.id}
                        eintrag={eintrag}
                        gruppe={gruppe}
                      />
                    ))
                  )}
                  <SsButton label="Fertig" block onPress={() => setLaedtEin(false)} />
                </>
              ) : (
                <SsButton
                  label="Leute einladen"
                  icon="personen"
                  block
                  onPress={() => setLaedtEin(true)}
                />
              )}
            </View>
          ) : null}

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
          einladungId={meineEinladung?.id}
          einladerName={einlader?.displayName}
          blockiert={blockiert}
          nachricht={nachricht}
          setNachricht={setNachricht}
        />
      )}

      {/* Ganz unten und nur für den Gründer: DASS Anfragen warten, nicht wie man sie
          beantwortet. Das steht im Anfragen-Tab.

          Seit Phase 18a NICHT bei einer privaten Gruppe: In die kommt niemand über
          eine Anfrage, also kann hier auch keine warten. Ein Knopf, der auf einen
          Vorgang zeigt, den es für diese Gruppe nicht gibt, ist dasselbe wie ein
          Satz, der etwas verspricht, was die Regel nicht tut (harte Regel 32). */}
      {meine && gruppe.offen ? (
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
  einladungId,
  einladerName,
  blockiert,
  nachricht,
  setNachricht,
}: {
  gruppe: Group;
  angefragt: boolean;
  /** Phase 18a: Liegt eine Einladung für mich vor, gibt es hier einen Weg hinein. */
  einladungId?: string;
  einladerName?: string;
  blockiert: boolean;
  nachricht: string;
  setNachricht: (t: string) => void;
}) {
  const huerde = beitrittHuerdeText(gruppe);

  if (blockiert) {
    return (
      <SsText variant="caption" color={colors.inkSoft} center>
        Zwischen dir und dem Gründer dieser Gruppe steht eine Blockierung.
      </SsText>
    );
  }

  // Die Einladung steht VOR allem anderen — auch vor „Anfrage geschickt" und vor
  // der Privat-Hürde. Sie ist der einzige Zustand hier, in dem ein Weg hinein
  // offen ist, und bei einer privaten Gruppe der einzige überhaupt. Stünde sie
  // weiter unten, läse man erst „hier kommst du nicht hinein" und darunter den
  // Knopf, der genau das widerlegt.
  if (einladungId) {
    return (
      <View style={styles.block}>
        <SsIconText icon="funken">
          {einladerName ? `${einladerName} hat dich eingeladen` : 'Du bist eingeladen'}
        </SsIconText>
        <SsText variant="caption" color={colors.inkSoft}>
          {angefragt
            ? // Der Fall aus `data/mock.ts` (gr3 + gi1): Man hat angefragt UND
              // wird eingeladen. Der Satz sagt, was mit der Anfrage passiert —
              // sonst sucht man sie hinterher im Anfragen-Tab.
              'Du hattest hier auch angefragt. Nimmst du an, erledigt sich das damit.'
            : 'Nimm an, dann bist du sofort dabei — der Gründer muss nichts mehr bestätigen.'}
        </SsText>
        <SsButton
          label="Annehmen"
          icon="haken"
          variant="category"
          category={gruppe.category}
          block
          size="lg"
          onPress={() => einladungAnnehmen(einladungId)}
        />
        <SsButton label="Nein danke" block onPress={() => einladungAblehnen(einladungId)} />
      </View>
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

  // Ians Entscheidung 27: Name, Kategorie, Bezirk und Mitgliederzahl stehen oben
  // in der Karte und bleiben stehen — hier kommt nur dazu, dass es keinen Weg
  // hinein gibt. Kein „gibt es nicht", keine leere Fläche: beides sähe aus wie ein
  // Fehler, und der Screen sagt zwei Zeilen höher schon etwas anderes für den Fall,
  // dass es die Gruppe wirklich nicht mehr gibt.
  if (huerde) {
    return (
      <View style={styles.block}>
        <SsIconText icon="schloss">{huerde}</SsIconText>
        <SsText variant="caption" color={colors.inkSoft}>
          Was hier läuft und wer dabei ist, bleibt zu.
        </SsText>
      </View>
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

/**
 * Eine Person, die man holen könnte — Phase 18a.
 *
 * ── Warum vier Zustände und nicht ein ausgegrauter Knopf ──────────────────────
 * „Schon drin", „schon eingeladen" und „hat selbst angefragt" sind drei
 * verschiedene Auskünfte, und keine davon passt in einen `disabled`-Knopf: Der
 * sagt nur, dass gerade nichts geht, nicht warum. Bei „hat selbst angefragt" ist
 * das besonders wichtig — dort liegt die Handlung woanders, nämlich im
 * Anfragen-Tab beim Gründer.
 *
 * Ein Textfeld je Person gibt es bewusst nicht (siehe `GroupInvite` in
 * `types/models.ts`): Eine Einladung ist ein Tipp, sonst lädt niemand jemanden ein.
 */
function EinladbarZeile({ eintrag, gruppe }: { eintrag: EinladbarEintrag; gruppe: Group }) {
  const { person, zustand } = eintrag;

  return (
    <SsCard>
      <View style={styles.person}>
        <SsAvatar name={person.displayName} seed={person.id} photoUrl={person.photoUrl} size="sm" />
        <SsText variant="body" style={styles.name} numberOfLines={1}>
          {person.displayName}
        </SsText>

        {zustand === 'einladbar' ? (
          <SsButton
            label="Einladen"
            variant="category"
            category={gruppe.category}
            onPress={() => einladen(gruppe.id, person.id)}
          />
        ) : zustand === 'eingeladen' ? (
          <SsIconText icon="uhr">Eingeladen</SsIconText>
        ) : zustand === 'angefragt' ? (
          <SsIconText icon="hand">Fragt schon an</SsIconText>
        ) : (
          <SsIconText icon="haken">Dabei</SsIconText>
        )}
      </View>
    </SsCard>
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
