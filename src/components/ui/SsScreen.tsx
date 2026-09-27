import type { ReactNode, RefObject } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTabRand } from '@/lib/tabs';
import { colors, MAX_CONTENT_WIDTH, spacing } from '@/theme';

export interface SsScreenProps {
  children: ReactNode;
  /**
   * Für Screens, die IN der Tab-Leiste liegen, auf `true` setzen.
   *
   * ACTA-Falle: Die Tab-Leiste bringt ihren eigenen unteren Sicherheitsabstand mit.
   * Legt der Screen noch einen drauf, entsteht ein toter schwarzer Balken über der
   * Leiste. Deshalb hier nur `top` als Kante.
   */
  tabScreen?: boolean;
  /**
   * Inhalt scrollbar machen — mit dem Abstandsverhalten für LANGE Inhalte.
   *
   * ⚠️ Seit dem 2026-09-26 ist das **nicht mehr der Unterschied zwischen
   * „scrollt" und „scrollt nicht"**: Auch ohne `scroll` liegt der Inhalt jetzt
   * in einem Scroll-Bereich (siehe `scrolltSelbst` und der Abschnitt „Der Boden"
   * unten). `scroll` steuert nur noch, wohin der untere Abstand wandert.
   */
  scroll?: boolean;
  /**
   * „Dieser Screen bringt sein eigenes Scrollen mit" — für Listen und Gesten.
   *
   * ── 🔴 Warum es diese Prop gibt (ACTA, Guideline 4) ────────────────────────
   * Am 2026-09-22 hat Apple ACTA (Projekt 17) abgelehnt: *„The login screen was
   * not entirely visible."* Prüfgerät ein iPad Air 11". Die App ist iPhone-only,
   * läuft auf iPadOS aber in einem **veränderbaren Fenster** — und der
   * Nicht-Scroll-Zweig der dortigen Hülle schnitt alles ab, was höher war als das
   * Fenster. Ohne jede Rettung: Die Knöpfe waren unerreichbar.
   *
   * **SimplySocial ist Zeichen für Zeichen gleich konfiguriert** (nachgemessen am
   * 2026-09-26): `supportsTablet: false`, `TARGETED_DEVICE_FAMILY = 1`,
   * `UIRequiresFullScreen = false`, Portrait-Sperre. Die Portrait-Sperre hat ACTA
   * nicht gerettet, also rettet sie diese App auch nicht.
   *
   * ── Und ACTAs eigentliche Lehre ───────────────────────────────────────────
   * *„Eine Prop, die Rettung ANBIETET, rettet nur die, die sie setzen."* Dort
   * setzten 23 Screens `scroll` und 8 nicht — und die 8 hatten keinen Boden.
   * Deshalb wird hier nicht `scroll` nachgetragen, sondern die **Voreinstellung
   * umgedreht**: Gerettet ist der Normalfall, `scrolltSelbst` ist die Ausnahme.
   *
   * ── Wann sie gesetzt gehört ───────────────────────────────────────────────
   * Wenn der Screen eine `FlatList`/`SectionList` enthält (eine Liste in einem
   * ScrollView verliert ihre Virtualisierung und wächst ins Unendliche — der
   * klassische Bruch bei genau diesem Umbau) oder eine Gestenfläche, die den
   * ganzen Schirm einnimmt (der Wischstapel).
   *
   * ⚠️ **ACTA konnte diesen Fall ausschliessen, SimplySocial nicht:** Dort liefen
   * die beiden Listen-Screens gar nicht durch die Hülle. Hier tun es sieben.
   * Deshalb ist die Behebung eine andere als dort — abgeschrieben wäre sie falsch
   * gewesen. `npm run pruef-boden` bewacht, dass keine Liste ohne diese Prop
   * dasteht.
   */
  scrolltSelbst?: boolean;
  /**
   * Für Screens mit Eingabefeldern: der Inhalt weicht der Tastatur aus.
   *
   * Nur auf iOS nötig und deshalb auch nur dort aktiv. Android schiebt den Screen
   * selbst hoch (`windowSoftInputMode`), und im Browser gibt es das Problem nicht —
   * `behavior="padding"` würde dort nur unten Luft einfügen, die niemand braucht.
   */
  keyboard?: boolean;
  /**
   * Griff auf den Scroll-Bereich — nur zusammen mit `scroll` sinnvoll.
   *
   * Gibt es, weil ein Screen manchmal selbst irgendwohin scrollen muss und der
   * Scroll-Bereich hier drin liegt: `create.tsx` springt nach einem misslungenen
   * „Posten" zur ersten roten Stelle (Ians Entscheidung 15). Bewusst ein Ref und
   * keine `scrollZu()`-Prop: Wer scrollen will, braucht auch `scrollToEnd` oder
   * `flashScrollIndicators`, und jede davon einzeln durchzureichen wäre eine
   * Nachbildung von `ScrollView` in diesem Baustein.
   */
  scrollRef?: RefObject<ScrollView | null>;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * Die Grundfläche jedes Screens: Sicherheitsabstände, Hintergrund und die
 * Breitenbegrenzung, damit die App am Desktop nicht auseinanderläuft.
 *
 * ── Warum der untere Abstand bei `scroll` NACH INNEN wandert ──────────────────
 * Läge er außen am SafeAreaView, wäre der Scroll-Bereich selbst kleiner und der
 * Inhalt würde über dem Rand enden statt sanft darunter zu verschwinden. Als
 * `paddingBottom` IM Scroll-Inhalt scrollt das letzte Element sauber frei.
 *
 * Dazu kommt ein fester Grundabstand: ein Button, der exakt an der Unterkante
 * klebt, ist am Handy kaum zu treffen — und wenn die Browser-Leiste ein Stück
 * überlappt, gar nicht mehr.
 *
 * ── Seit Phase 19e-2: die Tab-Leiste nimmt keinen Platz mehr weg ──────────────
 * Sie schwebt, damit ihr Glas etwas zu brechen hat (`(tabs)/_layout.tsx`). Ein
 * Tab-Screen reicht deshalb bis an die Unterkante des Fensters, und ohne Zutun
 * läge seine unterste Zeile dahinter. Die Regel dagegen ist eine einzige und steht
 * hier:
 *
 *   **Was scrollt, scrollt unter das Glas. Was fest steht, weicht ihm aus.**
 *
 * Also: beim `scroll`-Zweig wandert die Leistenhöhe in den SCROLL-INHALT (das
 * letzte Element fährt sauber darunter durch und ist trotzdem ganz erreichbar),
 * beim festen Zweig begrenzt sie die FLÄCHE (sonst lägen die Stapel-Knöpfe und die
 * Antwort-Leiste dahinter — beide stehen unten und scrollen nie).
 *
 * ── Warum `marginBottom` und nicht `paddingBottom` ────────────────────────────
 * Weil im festen Zweig absolut positionierte Kinder darin liegen (die Antwort-
 * Leiste, die Wischkarten). **Yoga rechnet die Polsterung des Elternteils bei
 * absoluten Kindern an, der Browser macht es andersherum** — dieselbe Falle, die
 * in `(tabs)/index.tsx` schon einmal kommentiert steht. Ein Rand AUSSEN ist auf
 * beiden Plattformen derselbe.
 */
export function SsScreen({
  children,
  tabScreen,
  scroll,
  scrolltSelbst,
  keyboard,
  scrollRef,
  style,
  contentStyle,
}: SsScreenProps) {
  const insets = useSafeAreaInsets();
  // 0, wo keine Tab-Leiste ist — also auf allen Screens außerhalb von `(tabs)`.
  const tabRand = useTabRand();
  const leiste = tabScreen ? tabRand : 0;

  // Beim Scrollen übernimmt der Inhalt den unteren Abstand selbst (siehe oben).
  const kanten: ('top' | 'bottom')[] = tabScreen || scroll ? ['top'] : ['top', 'bottom'];

  // ── Der Boden: ein Screen, der nicht scrollt, hat keinen ──────────────────
  //
  // Ein Screen, der weder `scroll` noch `scrolltSelbst` setzt, lag bis zum
  // 2026-09-26 in einem `View` mit `flex: 1`. Passt der Inhalt nicht, wird er
  // abgeschnitten — nicht gestaucht, nicht scrollbar, WEG. Auf einem iPhone
  // fällt das nie auf, weil die Höhe immer reicht; auf dem iPad in einem
  // verkleinerten Fenster hat genau das ACTA eine Ablehnung gekostet.
  //
  // `flexGrow: 1` im Inhalt ist der ganze Trick: Passt alles, füllt der Inhalt
  // die Höhe wie vorher — `justifyContent`/`flex` der Kinder wirken unverändert,
  // das Bild ist identisch. Passt es nicht, scrollt es, statt zu verschwinden.
  if (!scroll && !scrolltSelbst) {
    return (
      <SafeAreaView style={[styles.safe, style]} edges={kanten}>
        <Tastatur an={keyboard}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.content,
              styles.wachsen,
              contentStyle,
              { marginBottom: leiste },
            ]}
            // Ohne das federt der Inhalt auf dem iPhone, wo gar nichts zu
            // scrollen ist — und eine Fläche, die nachgibt, ohne dass es etwas
            // zu sehen gibt, liest sich als Fehler.
            bounces={false}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </Tastatur>
      </SafeAreaView>
    );
  }

  // `scrolltSelbst`: der alte Zweig, unverändert. Eine Liste oder eine
  // Gestenfläche bringt ihr eigenes Scrollen mit.
  if (!scroll) {
    return (
      <SafeAreaView style={[styles.safe, style]} edges={kanten}>
        <Tastatur an={keyboard}>
          <View style={[styles.content, styles.fill, contentStyle, { marginBottom: leiste }]}>
            {children}
          </View>
        </Tastatur>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, style]} edges={kanten}>
      <Tastatur an={keyboard}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            contentStyle,
            // Auf einem Tab-Screen steckt der untere Sicherheitsabstand schon in
            // der Leistenhöhe — beide zu addieren gäbe 34 px Luft zu viel.
            { paddingBottom: (tabScreen ? leiste : insets.bottom) + spacing.xxxl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </Tastatur>
    </SafeAreaView>
  );
}

/**
 * Wickelt den Inhalt in einen `KeyboardAvoidingView` — aber nur, wenn er gebraucht
 * wird. Ein zusätzliches View um JEDEN Screen wäre eine Ebene mehr im Baum, die auf
 * Web und Android nichts tut.
 */
function Tastatur({ an, children }: { an?: boolean; children: ReactNode }) {
  if (!an || Platform.OS !== 'ios') return <>{children}</>;
  return (
    <KeyboardAvoidingView style={styles.fill} behavior="padding">
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  fill: { flex: 1 },
  // `flexGrow` statt `flex`: In einem `contentContainerStyle` heisst `flex: 1`
  // „nimm genau die Höhe des Scroll-Bereichs" — dann gäbe es nie etwas zu
  // scrollen, und der Inhalt wäre wieder abgeschnitten. `flexGrow: 1` heisst
  // „mindestens so hoch, gerne höher", und genau das ist gemeint.
  wachsen: { flexGrow: 1 },
  content: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
  },
});
