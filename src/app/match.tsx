import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { SsAvatar, SsButton, SsCard, SsChip, SsIcon, SsIconText, SsKonfetti, SsScreen, SsText } from '@/components/ui';
import { useChatZuPost } from '@/features/chat/hooks';
import { usePost } from '@/features/posts/hooks';
import { useCurrentUser, useUser } from '@/features/social/hooks';
import { ortText } from '@/lib/bezirk';
import { haptik } from '@/lib/haptik';
import { zurueckOderFeed } from '@/lib/navigation';
import { startOderSeit } from '@/lib/zeit';
import { categoryColors, colors, spacing } from '@/theme';

/**
 * Der Match-Moment — der emotionale Höhepunkt der App (PLAN.md, Abschnitt 1).
 *
 * Er kommt genau einmal im Ablauf vor: jemand hat "Bin dabei" gedrückt, du hast
 * bestätigt, und ab jetzt ist es eine Verabredung. Deshalb ist das ein eigener
 * Screen und keine Meldung in der Liste — eine Zeile, die nach drei Sekunden
 * verschwindet, kann man verpassen.
 *
 * ── Warum der Screen nichts verändert ─────────────────────────────────────────
 * Bestätigt wird im Anfragen-Tab, hier wird nur gefeiert. Ein Screen, der beim
 * Öffnen etwas speichert, würde beim Neuladen der Seite im Browser ein zweites Mal
 * speichern — auf Web ist die Adresse eines Screens jederzeit erreichbar.
 */
export default function MatchScreen() {
  const { postId, userId } = useLocalSearchParams<{ postId?: string; userId?: string }>();
  const eintrag = usePost(postId);
  const gast = useUser(userId);
  const ich = useCurrentUser();
  // Angelegt hat ihn `anfrageBestaetigen` im selben Klick (`features/chat/logic.ts`) —
  // hier wird er nur nachgeschlagen. Mit `userId`, weil bei mehreren Plätzen mehrere
  // Fäden am selben Post hängen und der Knopf in DIESEN führen soll.
  const chat = useChatZuPost(postId, userId);

  /**
   * Der Match vibriert — Phase 20.12.
   *
   * **Der einzige Anlass in der App, den man spürt, ohne ihn selbst ausgelöst zu
   * haben.** Bis hierher wurde der emotionale Höhepunkt der App stumm gefeiert:
   * eigener Screen, Konfetti, und kein Ton, kein Zucken. Genau das macht Tinder
   * anders, und es ist der billigste Unterschied im ganzen Projekt.
   *
   * ── Warum ein Effekt mit leerer Abhängigkeitsliste ──────────────────────────
   * Einmal beim Öffnen des Screens, nie wieder. Ein Aufruf im Rumpf würde bei JEDEM
   * Rendern vibrieren — und dieser Screen rendert neu, sobald der Chat geladen ist.
   *
   * ── Warum das NICHT gegen „der Screen verändert nichts" verstößt ────────────
   * Der Kopfkommentar oben sagt, dieser Screen speichere bewusst nichts, weil man
   * eine Adresse im Browser neu laden kann und dann zweimal speichern würde. Eine
   * Vibration ist keine Speicherung: Sie hinterlässt nichts, und wer den Screen
   * zweimal öffnet, darf sie zweimal spüren. **Auf Web passiert ohnehin nichts**
   * (`lib/haptik.ts` ist dort leer).
   */
  /**
   * ⚠️ **Die Bedingung steht IM Effekt, nicht davor** — und sie ist nicht
   * vorsorglich: `/match` ist auf Web eine ganz normale Adresse, die jeder direkt
   * aufrufen kann, und `NichtsZuFeiern` unten ist genau für diesen Fall da. Ein
   * `useEffect` mit leerer Liste hätte dort trotzdem vibriert — eine Erfolgsmeldung
   * für einen Bildschirm, auf dem steht, dass es nichts zu feiern gibt.
   *
   * Davor darf die Bedingung nicht stehen, weil ein Hook nach einem bedingten
   * `return` nicht mehr in jedem Durchlauf aufgerufen würde.
   */
  const gibtEsWasZuFeiern = Boolean(eintrag && gast);
  useEffect(() => {
    if (gibtEsWasZuFeiern) haptik.match();
  }, [gibtEsWasZuFeiern]);

  if (!eintrag || !gast) return <NichtsZuFeiern />;

  const { post } = eintrag;

  return (
    <View style={styles.wurzel}>
      <SsScreen scroll contentStyle={styles.seite}>
        <View style={styles.gesichter}>
          <SsAvatar name={ich.displayName} seed={ich.id} photoUrl={ich.photoUrl} size="lg" />
          {/* Zwischen den beiden Avataren, in der Kategoriefarbe des Posts: Auf dem
              einen Screen, der ein Ergebnis feiert, soll das Zeichen dazwischen nicht
              grau sein. */}
          <SsIcon name="treffen" size={30} color={categoryColors[post.category].aufGrund} />
          <SsAvatar name={gast.displayName} seed={gast.id} photoUrl={gast.photoUrl} size="lg" />
        </View>

        <SsText variant="display" center>
          Ihr seid verabredet
        </SsText>

        <SsText variant="body" center color={colors.inkSoft}>
          {gast.displayName} ist bei „{post.title}“ dabei.
        </SsText>

        <SsCard category={post.category} style={styles.karte}>
          <SsChip category={post.category} />
          <SsText variant="heading">{post.title}</SsText>
          <SsText variant="caption" color={colors.inkSoft}>
            {startOderSeit(post.startsAt)}   ·   {ortText(post.district)}
          </SsText>
          <SsIconText icon="fahne">
            {post.meetingPoint ?? 'Treffpunkt macht ihr im Chat aus'}
          </SsIconText>
        </SsCard>

        <View style={styles.aktion}>
          {/* Seit Phase 5 der Hauptweg: Der Match-Moment endet nicht in einer
              Bestätigung, sondern im Gespräch — Treffpunkt und Uhrzeit macht man dort
              aus. Deshalb steht "Zum Chat" oben und in der Kategoriefarbe, und "Alles
              klar" darunter als Umriss. */}
          {chat ? (
            <SsButton
              variant="category"
              category={post.category}
              label="Zum Chat"
              icon="sprechblase"
              block
              size="lg"
              onPress={() =>
                router.replace({ pathname: '/chat/[id]', params: { id: chat.id } })
              }
            />
          ) : null}
          <SsButton
            variant={chat ? 'ghost' : 'primary'}
            label="Alles klar"
            icon="daumen"
            block
            size="lg"
            onPress={zurueckOderFeed}
          />
          <SsText variant="caption" center color={colors.inkSoft}>
            {gast.displayName} sieht die Verabredung jetzt auch.
          </SsText>
        </View>
      </SsScreen>

      {/* Nach dem Inhalt und damit darüber. Fängt keine Klicks ab (`pointerEvents`
          im Baustein), sonst läge es genau auf dem Knopf. */}
      <SsKonfetti />
    </View>
  );
}

/**
 * Wenn jemand `/match` ohne gültige Angaben aufruft — im Browser ist jede Adresse
 * direkt erreichbar, und ein Screen, der dann leer bleibt, sieht kaputt aus.
 */
function NichtsZuFeiern() {
  return (
    <SsScreen contentStyle={styles.fehlerSeite}>
      <SsIcon name="funken" size={52} color={colors.inkSoft} />
      <SsText variant="heading" center>
        Hier gibt es gerade nichts zu feiern
      </SsText>
      <SsText variant="body" center color={colors.inkSoft}>
        Dieser Match-Bildschirm gehört zu einer Bestätigung, die es nicht mehr gibt.
      </SsText>
      <SsButton label="Zu den Anfragen" onPress={() => router.replace('/requests')} />
    </SsScreen>
  );
}

const styles = StyleSheet.create({
  wurzel: { flex: 1, backgroundColor: colors.bg },
  seite: { flexGrow: 1, justifyContent: 'center', gap: spacing.lg, paddingVertical: spacing.xl },

  gesichter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md },

  karte: { marginTop: spacing.sm },
  aktion: { gap: spacing.md, marginTop: spacing.sm },

  fehlerSeite: { alignItems: 'center', justifyContent: 'center', gap: spacing.md },
});
