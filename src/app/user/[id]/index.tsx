import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Profil } from '@/components/Profil';
import { SsAvatar, SsBack, SsButton, SsCard, SsScreen, SsText } from '@/components/ui';
import { blockFolgen } from '@/features/safety/block';
import { blockieren, entblocken, useHabeIchBlockiert, useMeineMeldung } from '@/features/safety/hooks';
import { entfolgen, folgen, useFolgeIch, useUser } from '@/features/social/hooks';
import { userIds } from '@/features/statisch';
import { CURRENT_USER_ID } from '@/features/store';
import { colors, danger, spacing } from '@/theme';
import type { User } from '@/types/models';

/**
 * Welche Adressen beim Bauen entstehen — siehe `features/statisch.ts`.
 * Ohne diese Funktion heißt die gebaute Datei `user/[id].html` und ein
 * Direktaufruf von `/user/u_lea` landet auf 404.
 */
export function generateStaticParams(): Array<{ id: string }> {
  return userIds();
}

/**
 * Ein fremdes Profil.
 *
 * Der Weg hierher führt über die Verfasser-Karte im Post-Detail und über die
 * Follower-Listen. Beides sind Stellen, an denen man sich gerade fragt, wer das
 * eigentlich ist — die Frage, die dieser Screen beantwortet.
 *
 * ── Warum das eigene Profil hier umgeleitet wird ──────────────────────────────
 * `/user/u_ian` würde denselben Inhalt zeigen wie der Profil-Tab, nur ohne Tab-Leiste
 * und mit einem Folgen-Knopf, der sich selbst meint. Auf Web ist diese Adresse kein
 * Sonderfall, sondern ein Link, den man weitergibt — deshalb landet man auf dem Tab,
 * wo das eigene Profil hingehört.
 *
 * ── Warum Melden und Blockieren ganz unten stehen (Phase 7) ───────────────────
 * Sie sind die seltensten Aktionen der App und die einzigen, die man versehentlich
 * nicht auslösen darf. Oben in der Karte steht, was man fast immer will (folgen);
 * unten, hinter allem anderen, steht das, was man einmal im Jahr will. Ein Profil,
 * das mit „Blockieren" aufmacht, unterstellt der Person etwas.
 *
 * ── Warum ein Block hier nachfragt, ein Entfolgen aber nicht ──────────────────
 * Entfolgen ist mit einem Tipp wieder behoben. Ein Block ist es NICHT ganz: Er kappt
 * die Folge-Beziehung in beide Richtungen und entfernt offene Anfragen, und
 * `entblocken` holt beides nicht zurück (Begründung in `safety/hooks.ts`). Eine
 * Aktion, deren Rücknahme nicht denselben Zustand herstellt, darf fragen.
 */
export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const person = useUser(id);
  const folgeIch = useFolgeIch(id);
  const habeIchBlockiert = useHabeIchBlockiert(id);
  const meldung = useMeineMeldung('user', id);
  const [fragt, setFragt] = useState(false);

  // Erst NACH allen Haken aussteigen — React verlangt in jedem Durchlauf dieselben
  // Haken in derselben Reihenfolge.
  if (id === CURRENT_USER_ID) return <Redirect href="/profile" />;
  if (!person) return <NichtGefunden />;

  if (habeIchBlockiert) return <BlockiertesProfil person={person} />;

  return (
    <SsScreen scroll contentStyle={styles.seite}>
      <SsBack />

      <Profil
        person={person}
        aktion={
          <View style={styles.aktion}>
            {folgeIch ? (
              // Kein Nachfragen beim Entfolgen: Der Fehler ist mit einem Tipp wieder
              // behoben, und ein Dialog für etwas so Kleines erzieht dazu, Dialoge
              // wegzuklicken, ohne sie zu lesen.
              <SsButton
                label="Du folgst"
                icon="✓"
                variant="ghost"
                block
                onPress={() => entfolgen(person.id)}
              />
            ) : (
              <>
                {/* Bewusst ohne Emoji: „➕" ist ein graues Glyph und nimmt keine Farbe
                    an — auf der dunklen Fläche des Hauptknopfes wird daraus ein
                    schmutziger Fleck. Dasselbe Problem wie bei den Tab-Symbolen, nur
                    umgekehrt. Der Text allein ist eindeutig. */}
                <SsButton label="Folgen" block onPress={() => folgen(person.id)} />
                <SsText variant="caption" color={colors.inkSoft} center>
                  Dann steht {person.displayName} im Feed unter „Wem ich folge" — und du siehst
                  Posts, die nur für Follower sind.
                </SsText>
              </>
            )}
          </View>
        }
        fuss={
          <View style={styles.fuss}>
            {fragt ? (
              <>
                <SsCard style={styles.warnung}>
                  <SsText variant="bodyStrong" color={danger.onSoft}>
                    {person.displayName} blockieren?
                  </SsText>
                  {/* Die Liste kommt aus `blockFolgen()` und nicht aus diesem Screen.
                      Ändert Ian in `block.ts` die Regel, ändert sich der Text mit —
                      ein Screen, der etwas anderes verspricht als die Regel tut, wäre
                      schlimmer als gar kein Text. */}
                  {blockFolgen().map((satz) => (
                    <SsText key={satz} variant="body">
                      · {satz}
                    </SsText>
                  ))}
                </SsCard>
                <SsButton
                  variant="danger"
                  label="Ja, blockieren"
                  block
                  onPress={() => {
                    blockieren(person.id);
                    setFragt(false);
                  }}
                />
                <SsButton label="Abbrechen" block onPress={() => setFragt(false)} />
              </>
            ) : (
              <>
                <SsText variant="caption" color={colors.inkSoft} center>
                  Stimmt hier etwas nicht?
                </SsText>
                <View style={styles.reihe}>
                  <SsButton
                    variant="ghost"
                    label={meldung ? 'Gemeldet' : 'Melden'}
                    icon="🚩"
                    disabled={Boolean(meldung)}
                    style={styles.halb}
                    onPress={() =>
                      router.push({
                        pathname: '/melden',
                        params: { art: 'user', id: person.id },
                      })
                    }
                  />
                  <SsButton
                    variant="danger"
                    label="Blockieren"
                    icon="🚫"
                    style={styles.halb}
                    onPress={() => setFragt(true)}
                  />
                </View>
              </>
            )}
          </View>
        }
      />
    </SsScreen>
  );
}

/**
 * Das Profil einer Person, die ICH blockiert habe.
 *
 * Zeigt Name und Avatar, aber nichts von ihr: keine Bio, keine Interessen, keine
 * Posts. Der Name muss bleiben — sonst weiß man nicht, wen man da vor sich hat, und
 * kann nicht entscheiden, ob man es aufheben will.
 *
 * ── Warum hier NICHT `components/Profil.tsx` steht ────────────────────────────
 * Harte Regel 7 sagt: Profil-Inhalt kommt aus dem gemeinsamen Baustein. Das gilt für
 * PROFILE. Das hier ist keins — es ist die Meldung, dass es keins zu sehen gibt. Ein
 * `Profil` mit allem Ausgeblendeten wäre eine Sammlung von Bedingungen im Baustein,
 * und die erste davon würde beim nächsten Umbau vergessen. Der Baustein zeigt ein
 * Profil, dieser Screen zeigt eine Sperre; das sind zwei Dinge.
 */
function BlockiertesProfil({ person }: { person: User }) {
  return (
    <SsScreen scroll contentStyle={styles.seite}>
      <SsBack />

      <SsCard>
        <View style={styles.kopf}>
          {/* Ohne Emoji-Avatar: Das Gesicht ist das Persönlichste an der Karte, und
              hier ist ausdrücklich nichts Persönliches mehr zu sehen. Der graue Kreis
              sagt dasselbe wie der Rest der Seite. */}
          <SsAvatar emoji="🚫" seed={person.id} size="lg" />
          <View style={styles.kopfText}>
            <SsText variant="title" numberOfLines={1}>
              {person.displayName}
            </SsText>
            <SsText variant="caption" color={colors.inkSoft}>
              {person.handle}
            </SsText>
          </View>
        </View>

        <SsText variant="bodyStrong" color={danger.onSoft}>
          Du hast diese Person blockiert
        </SsText>
        {blockFolgen().map((satz) => (
          <SsText key={satz} variant="body" color={colors.inkSoft}>
            · {satz}
          </SsText>
        ))}
      </SsCard>

      <View style={styles.fuss}>
        <SsButton label="Blockierung aufheben" block onPress={() => entblocken(person.id)} />
        <SsText variant="caption" color={colors.inkSoft} center>
          Ihr seht dann wieder die Posts des anderen. Was der Block mitgenommen hat,
          kommt nicht zurück — wer wem gefolgt ist, euer Chat und abgesagte Zusagen
          müsstet ihr neu machen.
        </SsText>
      </View>
    </SsScreen>
  );
}

function NichtGefunden() {
  return (
    <SsScreen contentStyle={styles.fehlerSeite}>
      <SsText style={styles.fehlerEmoji}>🤷</SsText>
      <SsText variant="heading" center>
        Diese Person gibt es nicht
      </SsText>
      <SsText variant="body" center color={colors.inkSoft}>
        Vielleicht hat sie ihr Konto gelöscht.
      </SsText>
      <SsButton label="Zurück zum Feed" onPress={() => router.replace('/')} />
    </SsScreen>
  );
}

const styles = StyleSheet.create({
  seite: { gap: spacing.lg, paddingTop: spacing.sm },
  aktion: { gap: spacing.sm, marginTop: spacing.xs },
  fuss: { gap: spacing.sm, marginTop: spacing.xl },

  // `flex: 1` auf beiden Hälften, damit die zwei Knöpfe gleich breit sind, egal wie
  // lang ihre Beschriftung ist. `minWidth: 0` dazu — sonst schrumpft ein Knopf nicht
  // unter seine Textbreite und die Reihe wird breiter als der Screen (Falle Phase 3).
  reihe: { flexDirection: 'row', gap: spacing.sm },
  halb: { flex: 1, minWidth: 0 },

  warnung: { backgroundColor: danger.soft, borderColor: danger.base },

  kopf: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  kopfText: { flex: 1, minWidth: 0, gap: 2 },

  fehlerSeite: { alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  fehlerEmoji: { fontSize: 48, lineHeight: 58 },
});
