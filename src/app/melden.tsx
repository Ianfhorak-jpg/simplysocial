import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SsAvatar, SsBack, SsButton, SsCard, SsChip, SsIcon, SsInput, SsScreen, SsText } from '@/components/ui';
import { MELDE_GRUENDE, MELDE_TITEL, type MeldeGrund } from '@/config/melden';
import { usePost } from '@/features/posts/hooks';
import { melden, useHabeIchBlockiert, useMeineMeldung } from '@/features/safety/hooks';
import { useUser } from '@/features/social/hooks';
import { CURRENT_USER_ID } from '@/features/store';
import { ortText } from '@/lib/bezirk';
import { colors, danger, radius, spacing } from '@/theme';
import type { ReportReason, ReportTarget } from '@/types/models';

/**
 * Melden — für einen Post (`/melden?art=post&id=p4`) oder für eine Person
 * (`/melden?art=user&id=u_lea`).
 *
 * ── Warum ein eigener Screen und kein Dialog ──────────────────────────────────
 * Ein Melde-Dialog wäre die erste Stelle in SimplySocial, an der etwas über dem
 * Screen schwebt — bisher ist alles eine Seite. Ein `Modal` verhält sich auf Web und
 * iOS verschieden (Scroll-Verriegelung, Tastatur, Zurück-Taste), und der Prototyp muss
 * vor allem im Browser verlässlich laufen (harte Regel 1). Dazu kommt: Auf Web hat
 * eine Seite eine Adresse. `/melden?art=user&id=u_lea` kann man aufrufen, verlinken
 * und im Test direkt ansteuern — ein Dialog kann das nicht.
 *
 * ── Warum Melden und Blockieren getrennt sind ─────────────────────────────────
 * Sie beantworten verschiedene Fragen. Melden heißt „schaut euch das an" und richtet
 * sich an die Moderation. Blockieren heißt „ich will damit nichts zu tun haben" und
 * richtet sich an niemanden. Ein Knopf für beides würde Leute dazu bringen, das eine
 * zu tun, weil sie das andere wollten. Nach dem Melden einer PERSON steht der
 * Blockieren-Knopf trotzdem da — dort ist es keine Kopplung, sondern der naheliegende
 * nächste Schritt in dem Moment, in dem er wirklich naheliegt.
 */
export default function MeldenScreen() {
  const { art, id } = useLocalSearchParams<{ art?: string; id?: string }>();
  // Alles, was nicht ausdrücklich 'user' ist, ist ein Post — der Screen darf bei einer
  // kaputten Adresse nicht abstürzen, sondern zeigt unten „gibt es nicht".
  const targetType: ReportTarget = art === 'user' ? 'user' : 'post';

  const eintrag = usePost(targetType === 'post' ? id : undefined);
  const person = useUser(targetType === 'user' ? id : undefined);
  const schonGemeldet = useMeineMeldung(targetType, id);
  const habeIchBlockiert = useHabeIchBlockiert(targetType === 'user' ? id : undefined);

  const [grund, setGrund] = useState<ReportReason | null>(null);
  const [notiz, setNotiz] = useState('');
  const [gesendet, setGesendet] = useState(false);

  // Erst NACH allen Haken aussteigen — React verlangt in jedem Durchlauf dieselben
  // Haken in derselben Reihenfolge.
  const ziel = targetType === 'post' ? eintrag : person;
  if (!id || !ziel) return <NichtGefunden />;

  // Den eigenen Post oder sich selbst zu melden ergibt keinen Sinn. Über die
  // Oberfläche kann es nicht passieren, über einen direkten Link schon.
  const istMeins =
    targetType === 'post' ? eintrag?.post.authorId === CURRENT_USER_ID : id === CURRENT_USER_ID;
  if (istMeins) return <NichtGefunden eigenes />;

  const fertig = gesendet || Boolean(schonGemeldet);

  return (
    <SsScreen scroll keyboard contentStyle={styles.seite}>
      <SsBack />

      <SsText variant="title">{MELDE_TITEL[targetType]}</SsText>

      {/* Was gemeldet wird, steht oben — sonst weiß man nach zwei Klicks nicht mehr,
          worum es ging. Bei Posts mit Kategorie-Pille, weil sie den Post im Feed
          wiedererkennbar macht. */}
      <SsCard>
        {eintrag ? (
          <>
            <SsChip category={eintrag.post.category} />
            <SsText variant="bodyStrong">{eintrag.post.title}</SsText>
            <SsText variant="caption" color={colors.inkSoft}>
              von {eintrag.author.displayName} · {ortText(eintrag.post.district)}
            </SsText>
          </>
        ) : person ? (
          <View style={styles.person}>
            <SsAvatar name={person.displayName} seed={person.id} photoUrl={person.photoUrl} size="md" />
            <View style={styles.personText}>
              <SsText variant="bodyStrong">{person.displayName}</SsText>
              <SsText variant="caption" color={colors.inkSoft}>
                {person.handle}
              </SsText>
            </View>
          </View>
        ) : null}
      </SsCard>

      {fertig ? (
        <Danke
          targetType={targetType}
          personId={person?.id}
          schonBlockiert={habeIchBlockiert}
          erneut={Boolean(schonGemeldet) && !gesendet}
        />
      ) : (
        <>
          <View style={styles.block}>
            <SsText variant="label" color={colors.inkSoft}>
              Was ist los?
            </SsText>
            {MELDE_GRUENDE[targetType].map((g) => (
              <GrundZeile
                key={g.wert}
                grund={g}
                gewaehlt={grund === g.wert}
                onPress={() => setGrund(g.wert)}
              />
            ))}
          </View>

          <SsInput
            label="Noch etwas dazu?"
            hint="Freiwillig"
            value={notiz}
            onChangeText={setNotiz}
            placeholder="Was genau passiert ist"
            multiline
            maxLength={300}
          />

          {/* Der Knopf bleibt sichtbar und wird nur stumpf, statt zu erscheinen, sobald
              ein Grund gewählt ist. Ein Knopf, der aus dem Nichts auftaucht, verschiebt
              alles darüber — und man drückt daneben. */}
          <SsButton
            variant="danger"
            label="Melden"
            icon="fahne"
            block
            size="lg"
            disabled={grund === null}
            onPress={() => {
              if (!grund) return;
              melden(targetType, id, grund, notiz);
              setGesendet(true);
            }}
          />

          <SsText variant="caption" color={colors.inkSoft} center>
            {targetType === 'user'
              ? 'Die Person erfährt nicht, dass du sie gemeldet hast.'
              : 'Der Verfasser erfährt nicht, dass du den Post gemeldet hast.'}
          </SsText>
        </>
      )}
    </SsScreen>
  );
}

/**
 * Eine Zeile in der Gründe-Liste.
 *
 * Der Haken steht RECHTS und ist im ungewählten Zustand ein leerer Kreis. Ein Kreis,
 * der schon da ist und sich füllt, sagt „eins davon musst du wählen"; ein Haken, der
 * erst beim Tippen erscheint, sieht aus wie eine Liste von Links.
 */
function GrundZeile({
  grund,
  gewaehlt,
  onPress,
}: {
  grund: MeldeGrund;
  gewaehlt: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: gewaehlt }}
      style={({ pressed }) => [
        styles.grund,
        gewaehlt && styles.grundGewaehlt,
        pressed && !gewaehlt && styles.grundGedrueckt,
      ]}>
      <View style={styles.grundText}>
        <SsText variant="bodyStrong" color={gewaehlt ? danger.onSoft : colors.ink}>
          {grund.label}
        </SsText>
        <SsText variant="caption" color={colors.inkSoft}>
          {grund.erklaerung}
        </SsText>
      </View>
      <View style={[styles.kreis, gewaehlt && styles.kreisGewaehlt]}>
        {gewaehlt ? <SsIcon name="haken" size={13} color={colors.surface} /> : null}
      </View>
    </Pressable>
  );
}

/**
 * Was nach dem Melden dasteht.
 *
 * Sagt bewusst NICHT „wir kümmern uns darum" — im Prototyp kümmert sich niemand, und
 * mit Backend wäre es ein Versprechen über eine Frist, die niemand zugesagt hat.
 * „Wir schauen es uns an" ist das, was die App halten kann.
 */
function Danke({
  targetType,
  personId,
  schonBlockiert,
  erneut,
}: {
  targetType: ReportTarget;
  personId?: string;
  schonBlockiert: boolean;
  erneut: boolean;
}) {
  return (
    <View style={styles.block}>
      <View style={styles.danke}>
        <View style={styles.dankeIcon}>
          <SsIcon name={erneut ? 'blatt' : 'hakenKreis'} size={24} color={colors.ink} />
        </View>
        <View style={styles.dankeText}>
          <SsText variant="bodyStrong">
            {erneut ? 'Das hast du schon gemeldet' : 'Danke, das ist angekommen'}
          </SsText>
          <SsText variant="caption" color={colors.inkSoft}>
            {erneut
              ? 'Eine zweite Meldung ändert nichts. Deine erste liegt vor.'
              : 'Wir schauen uns das an. Eine Rückmeldung darauf gibt es nicht.'}
          </SsText>
        </View>
      </View>

      {/* Nur bei Personen und nur, wenn noch nicht blockiert: Der naheliegende nächste
          Schritt, in dem Moment, in dem er naheliegt — aber als eigene Entscheidung. */}
      {targetType === 'user' && personId && !schonBlockiert ? (
        <>
          <SsText variant="caption" color={colors.inkSoft}>
            Melden allein ändert nichts daran, dass ihr euch weiter seht. Wenn du das
            nicht willst:
          </SsText>
          <SsButton
            variant="danger"
            label="Person blockieren"
            icon="verboten"
            block
            onPress={() => router.replace({ pathname: '/user/[id]', params: { id: personId } })}
          />
        </>
      ) : null}

      <SsButton label="Fertig" block onPress={() => router.back()} />
    </View>
  );
}

function NichtGefunden({ eigenes }: { eigenes?: boolean }) {
  return (
    <SsScreen contentStyle={styles.fehlerSeite}>
      <SsIcon name="frage" size={52} color={colors.inkSoft} />
      <SsText variant="heading" center>
        {eigenes ? 'Das ist von dir' : 'Das gibt es nicht'}
      </SsText>
      <SsText variant="body" center color={colors.inkSoft}>
        {eigenes
          ? 'Eigene Posts und sich selbst kann man nicht melden.'
          : 'Vielleicht ist es inzwischen verschwunden.'}
      </SsText>
      <SsButton label="Zurück zum Feed" onPress={() => router.replace('/')} />
    </SsScreen>
  );
}

const KREIS = 22;

const styles = StyleSheet.create({
  seite: { gap: spacing.md, paddingTop: spacing.sm },
  block: { gap: spacing.sm },

  person: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  personText: { flex: 1, minWidth: 0, gap: 2 },

  grund: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: radius.lg,
    cursor: 'pointer',
  },
  grundGewaehlt: { borderColor: danger.base, backgroundColor: danger.soft },
  grundGedrueckt: { backgroundColor: colors.bg },
  grundText: { flex: 1, minWidth: 0, gap: 1 },

  kreis: {
    width: KREIS,
    height: KREIS,
    borderRadius: KREIS / 2,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kreisGewaehlt: { backgroundColor: danger.base, borderColor: danger.base },

  danke: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
  },
  // Mitte der ERSTEN Zeile, nicht des Blocks — ACTA-Falle aus Phase 12.
  dankeIcon: { marginTop: 1 },
  dankeText: { flex: 1, gap: spacing.xs },

  fehlerSeite: { alignItems: 'center', justifyContent: 'center', gap: spacing.md },
});
