import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { SsText } from '@/components/ui';
import { useOffeneAnfragen } from '@/features/requests/hooks';
import { colors, spacing, status, type } from '@/theme';

/**
 * Die vier Tabs: Start · Anfragen · Chats · Profil.
 *
 * ── ACTA-Falle 1 (CLAUDE.md): jede Datei in `(tabs)/` wird automatisch ein Tab ────
 * Es reicht NICHT, eine Datei einfach nicht aufzulisten — sie taucht trotzdem in der
 * Leiste auf. Zum Ausblenden braucht es `options={{ href: null }}`. Deshalb liegt
 * `bausteine.tsx` bewusst AUSSERHALB dieses Ordners: die Werkstatt ist kein Tab.
 *
 * ── ACTA-Falle 2: der doppelte Sicherheitsabstand ─────────────────────────────
 * Die Tab-Leiste bringt ihren eigenen unteren Abstand mit. Legt der Screen darüber
 * noch einen drauf, steht ein toter Balken über der Leiste. Deshalb bekommt jeder
 * Screen hier `<SsScreen tabScreen>` — das setzt intern `edges={['top']}`.
 *
 * ── Warum die klassischen `Tabs` und nicht `NativeTabs` ───────────────────────
 * `NativeTabs` aus dem SDK-57-Template wird auf Web durch eine zweite, separate
 * Implementierung ersetzt — zwei Tab-Leisten, die man doppelt pflegt. Entschieden
 * in Phase 0 (PLAN.md).
 */
export default function TabsLayout() {
  const offene = useOffeneAnfragen();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarStyle: styles.leiste,
        tabBarLabelStyle: styles.beschriftung,
        tabBarItemStyle: styles.eintrag,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Start', tabBarIcon: symbol('🏠') }} />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Anfragen',
          tabBarIcon: symbol('🙋'),
          // Die Zahl macht sichtbar, dass jemand wartet — das ist der Punkt, an dem
          // die App etwas von einem will, und der Grund, sie wieder aufzumachen.
          tabBarBadge: offene.length > 0 ? offene.length : undefined,
          tabBarBadgeStyle: styles.zahl,
        }}
      />
      <Tabs.Screen name="chats" options={{ title: 'Chats', tabBarIcon: symbol('💬') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: symbol('👤') }} />
    </Tabs>
  );
}

/**
 * Emoji statt Icon-Schriftart — dieselbe Entscheidung wie bei den Kategorien.
 * Emoji nehmen keine Farbe an, deshalb macht die Deckkraft den Unterschied zwischen
 * ausgewählt und nicht: das aktive Symbol steht voll da, die anderen treten zurück.
 */
function symbol(emoji: string) {
  return ({ focused }: { focused: boolean }) => (
    <SsText style={[styles.symbol, !focused && styles.symbolAus]}>{emoji}</SsText>
  );
}

const styles = StyleSheet.create({
  leiste: {
    backgroundColor: colors.surface,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    paddingTop: spacing.xs,
  },
  eintrag: { paddingVertical: spacing.xs },
  beschriftung: { ...type.caption, fontWeight: '700' },
  symbol: { fontSize: 20, lineHeight: 24 },
  symbolAus: { opacity: 0.45 },
  zahl: { backgroundColor: status.danger, color: colors.surface, fontSize: 11, fontWeight: '700' },
});
