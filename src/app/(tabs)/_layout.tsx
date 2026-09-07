import { Tabs } from 'expo-router/js-tabs';
import { StyleSheet, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SsGlas, SsIcon } from '@/components/ui';
import { TAB_KAPSEL_HOEHE, TAB_KAPSEL_SEITE, tabKapselUnten } from '@/lib/tabs';
import { useMeineEinladungen, useOffeneGruppenAnfragen } from '@/features/groups/hooks';
import { useOffeneAnfragen } from '@/features/requests/hooks';
import { colors, radius, status, type } from '@/theme';
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
 * ── Seit Phase 19e-2: die Leiste ist eine freistehende KAPSEL ─────────────────
 * Ians Entscheidung 43 gibt ihr auf iOS 26 echtes Liquid Glass — und sein Vorbild
 * liegt als Bild im Projekt (`vorbild-liquid-glass-bierbuddy.png`). Die erste
 * Fassung war eine Leiste über die ganze Breite mit Trennlinie oben, also die
 * gewohnte iOS-Leiste mit Glas dahinter; sein Urteil war *„noch nicht wie ich es
 * dir gezeigt habe"*. **Der Unterschied ist nicht der Effekt, sondern die Form:**
 * eine Kapsel mit Abstand zu allen vier Kanten, voll gerundet, ohne Linie. Glas
 * braucht Rand, nicht nur Hintergrund — erst wenn Inhalt daneben UND darunter
 * durchläuft, sieht man, dass es bricht. Die Maße stehen in `lib/tabs.ts`.
 *
 * Der Preis steht an EINER Stelle und heißt `useTabRand()`: Was fest steht, weicht
 * der Leiste aus (`SsScreen` setzt einen Rand), was scrollt, scrollt darunter
 * durch. Ohne das läge die unterste Karte jedes Screens hinter der Leiste — auf
 * Web genauso wie auf iOS, denn die Geometrie ist auf beiden Plattformen dieselbe.
 * Verschieden ist nur, was man sieht (Entscheidung 43).
 */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const kapselUnten = tabKapselUnten(insets.bottom);
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
        tabBarStyle: [
          styles.leiste,
          { left: TAB_KAPSEL_SEITE, right: TAB_KAPSEL_SEITE, bottom: kapselUnten },
        ],
        // Der Untergrund der Kapsel — auf iOS 26 echtes Glas, sonst eine helle
        // Fläche mit Kante und Schatten (`schwebt`). Er liegt HINTER den Symbolen;
        // deshalb ist es ein eigener Slot und nicht eine Hintergrundfarbe am
        // `tabBarStyle`.
        tabBarBackground: () => <SsGlas schwebt style={styles.glas} />,
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
  // Die Kapsel: Abstand zu allen vier Kanten, voll gerundet, KEINE Trennlinie —
  // siehe den Kopfkommentar und `lib/tabs.ts`. Die Farbe kommt aus
  // `tabBarBackground`, deshalb steht hier nur Geometrie.
  //
  // `paddingBottom: 0` ist kein Schönheitsfehler: Die Leiste legt sonst den unteren
  // Sicherheitsabstand selbst noch einmal drauf, und die Kapsel wäre 34 px zu hoch.
  // `overflow: 'hidden'` beschneidet das Glas auf die Rundung.
  leiste: {
    position: 'absolute',
    height: TAB_KAPSEL_HOEHE,
    borderRadius: radius.pill,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    // KEINE eigene Polsterung: Die Kapsel hat eine feste Höhe, und die Leiste legt
    // sonst oben ihren Abstand und unten den Sicherheitsabstand noch einmal drauf —
    // dann ragen Symbol und Beschriftung unten aus der Rundung heraus und
    // `overflow: 'hidden'` schneidet sie ab. Genau so passiert, siehe `z01`.
    paddingTop: 0,
    paddingBottom: 0,
    overflow: 'hidden',
    // Android zeichnet sonst einen eigenen Schlagschatten unter die Leiste, und
    // der steht dann auf dem Inhalt, der jetzt darunter durchläuft.
    elevation: 0,
  },
  // Ausgeschriebene Kanten statt `absoluteFill`: registrierte Style-ID, die sich
  // nicht mischen lässt (ACTA-Falle).
  glas: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  // Auch hier keine senkrechte Polsterung — die Höhe kommt von der Kapsel, und die
  // Leiste zentriert ihre Einträge darin.
  eintrag: { paddingVertical: 0 },
  beschriftung: { ...type.caption, fontWeight: '700' },
  zahl: { backgroundColor: status.danger, color: colors.surface, fontSize: 11, fontWeight: '700' },
});
