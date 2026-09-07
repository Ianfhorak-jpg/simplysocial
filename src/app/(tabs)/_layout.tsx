import { Tabs } from 'expo-router/js-tabs';
import { StyleSheet, type ColorValue } from 'react-native';

import { SsGlas, SsIcon } from '@/components/ui';
import { useMeineEinladungen, useOffeneGruppenAnfragen } from '@/features/groups/hooks';
import { useOffeneAnfragen } from '@/features/requests/hooks';
import { colors, spacing, status, type } from '@/theme';
import type { IconName } from '@/theme/icons';

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
 * in Phase 0 (PLAN.md). Der Import kommt seit Phase 19e-2 aus `expo-router/js-tabs`
 * statt aus `expo-router`: Dasselbe Modul, aber der Weg über `expo-router` ist in
 * SDK 57 als veraltet markiert, und nur der Unterweg gibt `BottomTabBarHeightContext`
 * her (siehe `lib/tabs.ts`).
 *
 * ── Seit Phase 19e-2: die Leiste SCHWEBT ──────────────────────────────────────
 * Ians Entscheidung 43 gibt ihr auf iOS 26 echtes Liquid Glass. Damit Glas etwas
 * zu brechen hat, muss darunter etwas liegen — also nimmt die Leiste keinen Platz
 * mehr im Layout weg (`position: 'absolute'`), und der Screen reicht bis an die
 * Unterkante. **Auf der Karte ist das der ganze Gewinn:** Wien läuft unter der
 * Leiste durch, statt an ihr aufzuhören.
 *
 * Der Preis steht an EINER Stelle und heißt `useTabRand()`: Was fest steht, weicht
 * der Leiste aus (`SsScreen` setzt einen Rand), was scrollt, scrollt darunter
 * durch. Ohne das läge die unterste Karte jedes Screens hinter der Leiste — auf
 * Web genauso wie auf iOS, denn die Geometrie ist auf beiden Plattformen dieselbe.
 * Verschieden ist nur, was man sieht (Entscheidung 43).
 */
export default function TabsLayout() {
  const offene = useOffeneAnfragen();
  // Seit Phase 17 zählt die Zahl BEIDE Sorten. Zwei getrennte Zahlen an einem Tab
  // gibt es nicht, und zwei Tabs wären genau die zweite Mechanik, die Ians
  // Entscheidung 2 vermeiden wollte. Addiert wird hier, einmal — die Haken bleiben
  // getrennt, damit niemand die zwei Listen wieder auseinandernehmen muss.
  const offeneGruppen = useOffeneGruppenAnfragen();
  // Phase 18a zählt eine dritte Sorte mit: Einladungen an mich. Bewusst DERSELBE
  // Haken, den der Screen benutzt, und nicht ein leichterer Filter daneben — der
  // Screen blendet Einladungen aus, in deren Gruppe ich inzwischen schon bin, und
  // ein eigener Zähler würde sie mitzählen. Das Ergebnis wäre eine Zahl am Tab, die
  // man nicht wegbekommt, weil die Zeile dazu gar nicht dasteht.
  const einladungen = useMeineEinladungen();
  const wartend = offene.length + offeneGruppen.length + einladungen.length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarStyle: styles.leiste,
        // Der Untergrund der Leiste — auf iOS 26 echtes Glas, sonst dieselbe helle
        // Fläche wie bisher. Er liegt HINTER den Symbolen; deshalb ist es ein
        // eigener Slot und nicht einfach eine Hintergrundfarbe am `tabBarStyle`.
        tabBarBackground: () => <SsGlas style={styles.glas} />,
        tabBarLabelStyle: styles.beschriftung,
        tabBarItemStyle: styles.eintrag,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Start', tabBarIcon: symbol('haus') }} />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Anfragen',
          tabBarIcon: symbol('hand'),
          // Die Zahl macht sichtbar, dass jemand wartet — das ist der Punkt, an dem
          // die App etwas von einem will, und der Grund, sie wieder aufzumachen.
          tabBarBadge: wartend > 0 ? wartend : undefined,
          tabBarBadgeStyle: styles.zahl,
        }}
      />
      <Tabs.Screen name="chats" options={{ title: 'Chats', tabBarIcon: symbol('sprechblase') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: symbol('person') }} />
    </Tabs>
  );
}

/**
 * Ein Icon aus `theme/icons.ts` — seit Phase 14, davor ein Emoji.
 *
 * Der Unterschied ist an dieser Stelle größer, als er klingt: Ein Emoji nimmt keine
 * Farbe an, deshalb musste die DECKKRAFT den aktiven Tab markieren („voll da" gegen
 * „zurückgetreten"). Ein halbdurchsichtiges Symbol ist aber etwas anderes als ein
 * graues — es sieht deaktiviert aus, nicht bloß unausgewählt. Jetzt steht dort eine
 * echte zweite Farbe, und zwar dieselbe, die die Beschriftung darunter schon immer
 * hatte (`tabBarActiveTintColor` / `…Inactive…` im `screenOptions` oben).
 */
function symbol(name: IconName) {
  // `color` kommt als `ColorValue` — das ist auf Web und iOS immer ein String, kann
  // laut Typ aber auch ein undurchsichtiger Plattform-Wert sein. Der Zweig kostet
  // nichts und erspart ein `as string`, das beim nächsten RN-Update still bricht.
  return ({ color }: { color: ColorValue }) => (
    <SsIcon name={name} size={22} color={typeof color === 'string' ? color : colors.inkSoft} />
  );
}

const styles = StyleSheet.create({
  // Seit Phase 19e-2 schwebend: kein Platz im Layout, keine eigene Farbe — die
  // kommt aus `tabBarBackground`. Die Kante bleibt, sie ist auch auf Glas die
  // Auskunft „hier hört die App auf".
  leiste: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderTopColor: colors.line,
    borderTopWidth: 1,
    paddingTop: spacing.xs,
    // Android zeichnet sonst einen eigenen Schlagschatten unter die Leiste, und
    // der steht dann auf dem Inhalt, der jetzt darunter durchläuft.
    elevation: 0,
  },
  // Ausgeschriebene Kanten statt `absoluteFill`: registrierte Style-ID, die sich
  // nicht mischen lässt (ACTA-Falle).
  glas: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  eintrag: { paddingVertical: spacing.xs },
  beschriftung: { ...type.caption, fontWeight: '700' },
  zahl: { backgroundColor: status.danger, color: colors.surface, fontSize: 11, fontWeight: '700' },
});
