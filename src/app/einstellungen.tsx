import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { SsAvatar, SsBack, SsButton, SsCard, SsScreen, SsText } from '@/components/ui';
import { BRAND } from '@/config/brand';
import { entblocken, useBlockierte } from '@/features/safety/hooks';
import { colors, danger, radius, spacing } from '@/theme';

/**
 * Einstellungen — der Ort für alles, was kein Screen für sich ist.
 *
 * ── Warum es diesen Screen gibt ───────────────────────────────────────────────
 * Apple verlangt nach Guideline 1.2 vier Dinge (CLAUDE.md, letzter Abschnitt).
 * Melden und Blockieren gehören dorthin, wo der Anlass ist — an den Post und an das
 * Profil. Die anderen beiden, Nutzungsbedingungen und Account löschen, haben keinen
 * Anlass: Man sucht sie, wenn man sie braucht. Genau dafür ist ein Einstellungs-Screen
 * da, und deshalb entsteht er erst jetzt und nicht auf Vorrat in Phase 1.
 *
 * ── Warum die blockierten Personen HIER stehen und nicht auf einem eigenen Screen ──
 * Ein Block ist etwas, das man setzt und dann vergisst. Die Liste braucht man genau
 * einmal: wenn man sich anders überlegt hat. Als eigener Screen wäre sie ein Eintrag
 * mehr, hinter dem meistens nichts steht — hier steht direkt da, dass niemand
 * blockiert ist, und man muss nicht nachsehen, um es zu wissen.
 *
 * ── Der Werkstatt-Knopf ist von hier aus erreichbar ───────────────────────────
 * Er stand seit Phase 2 auf dem Profil-Tab, mit der Notiz, dass er „spätestens mit den
 * Einstellungen aus Phase 7" verschwindet. Er verschwindet nicht ganz, sondern zieht
 * um: `/bausteine` ist die einzige Seite, auf der alle Bausteine nebeneinander stehen,
 * und solange der Prototyp beurteilt wird, ist der Weg dorthin mehr wert als die
 * Reinheit des Screens. Nur gehört er nicht mehr aufs Profil — das ist ein
 * Produkt-Screen, den Ians Freunde sehen.
 */
export default function EinstellungenScreen() {
  const blockierte = useBlockierte();

  return (
    <SsScreen scroll contentStyle={styles.seite}>
      <SsBack />

      <SsText variant="title">Einstellungen</SsText>

      <View style={styles.block}>
        <SsText variant="label" color={colors.inkSoft}>
          Blockiert
        </SsText>

        {blockierte.length === 0 ? (
          <SsCard>
            <SsText variant="body" color={colors.inkSoft}>
              Du hast niemanden blockiert.
            </SsText>
            <SsText variant="caption" color={colors.inkSoft}>
              Blockieren kannst du auf dem Profil einer Person.
            </SsText>
          </SsCard>
        ) : (
          blockierte.map((person) => (
            <SsCard key={person.id}>
              <View style={styles.person}>
                <SsAvatar emoji={person.avatar} seed={person.id} size="md" />
                <View style={styles.personText}>
                  <SsText variant="bodyStrong" numberOfLines={1}>
                    {person.displayName}
                  </SsText>
                  <SsText variant="caption" color={colors.inkSoft}>
                    {person.handle}
                  </SsText>
                </View>
                {/* „Aufheben" und nicht „Entblocken": Das Wort steht neben einem Namen,
                    und es soll die harmlosere der beiden Richtungen sein. */}
                <SsButton variant="ghost" label="Aufheben" onPress={() => entblocken(person.id)} />
              </View>
            </SsCard>
          ))
        )}
      </View>

      <View style={styles.block}>
        <SsText variant="label" color={colors.inkSoft}>
          Rechtliches
        </SsText>
        <Zeile
          icon="📄"
          label="Nutzungsbedingungen"
          hinweis="Was hier gilt und ab welchem Alter"
          href="/nutzungsbedingungen"
        />
      </View>

      <View style={styles.block}>
        <SsText variant="label" color={colors.inkSoft}>
          Dein Konto
        </SsText>
        <Zeile
          icon="🗑️"
          label="Account löschen"
          hinweis="Dein Profil, deine Posts und deine Chats"
          href="/account-loeschen"
          rot
        />
      </View>

      <View style={styles.block}>
        <SsText variant="label" color={colors.inkSoft}>
          Für die Entwicklung
        </SsText>
        <Zeile
          icon="🧱"
          label="Bausteine anschauen"
          hinweis="Alle Elemente der App nebeneinander"
          href="/bausteine"
        />
      </View>

      <SsText variant="caption" color={colors.inkSoft} center style={styles.fuss}>
        {BRAND.name} · Prototyp
      </SsText>
    </SsScreen>
  );
}

/**
 * Eine Zeile, die woanders hinführt.
 *
 * Das Winkelzeichen rechts ist dasselbe wie auf der Verfasser-Karte im Post-Detail —
 * in dieser App heißt „›" immer: hier geht es weiter. `rot` färbt nur den Text, nicht
 * die Fläche; dieselbe Haltung wie bei `SsButton variant="danger"` (Begründung im Kopf
 * von `SsButton.tsx`): Die unfreundliche Aktion soll erkennbar sein, ohne der lauteste
 * Punkt auf dem Bildschirm zu werden.
 */
function Zeile({
  icon,
  label,
  hinweis,
  href,
  rot,
}: {
  icon: string;
  label: string;
  hinweis: string;
  href: Href;
  rot?: boolean;
}) {
  return (
    <Pressable
      onPress={() => router.push(href)}
      accessibilityRole="button"
      style={({ pressed }) => [styles.zeile, pressed && styles.zeileGedrueckt]}>
      <SsText style={styles.zeileIcon}>{icon}</SsText>
      <View style={styles.zeileText}>
        <SsText variant="bodyStrong" color={rot ? danger.onSoft : colors.ink}>
          {label}
        </SsText>
        <SsText variant="caption" color={colors.inkSoft}>
          {hinweis}
        </SsText>
      </View>
      <SsText variant="heading" color={colors.inkSoft}>
        ›
      </SsText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  seite: { gap: spacing.lg, paddingTop: spacing.sm },
  block: { gap: spacing.sm },

  person: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  personText: { flex: 1, minWidth: 0, gap: 2 },

  zeile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    cursor: 'pointer',
  },
  zeileGedrueckt: { backgroundColor: colors.bg },
  zeileIcon: { fontSize: 17, lineHeight: 21, width: 22, textAlign: 'center' },
  zeileText: { flex: 1, minWidth: 0, gap: 1 },

  fuss: { marginTop: spacing.md },
});
