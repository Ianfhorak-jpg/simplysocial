import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors } from '@/theme';

/**
 * Eine waagrechte Reihe, der man ansieht, dass sie weitergeht.
 *
 * ── Warum es diesen Baustein gibt ─────────────────────────────────────────────
 * Ians Frage vom 2026-09-01 zur Kategorie-Leiste im Feed: „ob die Leute auch checken
 * werden, dass man da eben so nach rechts wischen kann." Am Handy passen sechs
 * Pillen plus „Alle" nie nebeneinander — die letzte endet einfach an der Kante, und
 * das sieht aus wie ein Ende, nicht wie eine Fortsetzung. Eine weiche Kante zeigt,
 * dass da etwas abgeschnitten ist; ein Pfeil oder ein Hinweistext wäre dieselbe
 * Aussage, nur lauter.
 *
 * ── Warum die Kante aus acht Streifen besteht und kein Verlauf ist ────────────
 * Ein echter `linear-gradient` ist auf keinem der beiden Wege zu haben:
 *   • React Native 0.86 kennt `experimental_backgroundImage` — `react-native-web`
 *     nicht (nachgesehen, kein Treffer in dessen `dist/`). Der Prototyp läuft aber
 *     zuerst im Browser.
 *   • `expo-linear-gradient` wäre ein Native-Modul; harte Regel 1 sagt: JS-only.
 * Also acht nebeneinanderliegende Flächen in der Grundfarbe mit steigender
 * Deckkraft. Bei 4 px je Streifen sieht man die Stufen nicht — und es läuft
 * überall gleich.
 *
 * ── Warum die Kante nur da ist, wenn wirklich etwas fehlt ─────────────────────
 * Eine Kante, die auch dann steht, wenn alles hineinpasst (breites Fenster) oder
 * wenn man schon ganz rechts ist, verspricht etwas, das nicht kommt. Deshalb wird
 * gemessen statt geraten: sichtbare Breite (`onLayout`), Inhaltsbreite
 * (`onContentSizeChange`) und Position (`onScroll`).
 */

/** Breite der weichen Kante und Anzahl der Streifen, aus denen sie besteht. */
const KANTE_BREITE = 32;
const STREIFEN = 8;

export interface SsScrollReiheProps {
  children: ReactNode;
  /** Kommt an die äußere Fläche — dort, wo vorher der `style` des ScrollViews saß. */
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Farbe, in die ausgeblendet wird. Standard: die Grundfläche der App. */
  grundfarbe?: string;
}

export function SsScrollReihe({
  children,
  style,
  contentContainerStyle,
  grundfarbe = colors.bg,
}: SsScrollReiheProps) {
  const [x, setX] = useState(0);
  const [sichtbar, setSichtbar] = useState(0);
  const [inhalt, setInhalt] = useState(0);

  // Ein Pixel Toleranz: Auf Web sind das Fließkommazahlen, und „ganz rechts" ist
  // dort oft 611.99 statt 612 — ohne Toleranz bliebe die Kante ewig stehen.
  const linksAb = x > 1;
  const rechtsAb = inhalt - (x + sichtbar) > 1;

  const messen = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setX(e.nativeEvent.contentOffset.x);
  const layout = (e: LayoutChangeEvent) => setSichtbar(e.nativeEvent.layout.width);

  return (
    // `flexShrink: 0` ist hier Pflicht und keine Kosmetik — dieselbe Falle wie in
    // Phase 2: Neben einer FlatList, die den ganzen Rest des Screens beansprucht,
    // wird alles zusammengedrückt, was nachgeben darf. Vorher stand der Wert am
    // ScrollView; seit dieser Hülle steht er hier.
    <View style={[styles.aussen, style]} onLayout={layout}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={messen}
        scrollEventThrottle={16}
        onContentSizeChange={(breite) => setInhalt(breite)}
        style={styles.roller}
        contentContainerStyle={contentContainerStyle}>
        {children}
      </ScrollView>

      {linksAb ? <Kante seite="links" farbe={grundfarbe} /> : null}
      {rechtsAb ? <Kante seite="rechts" farbe={grundfarbe} /> : null}
    </View>
  );
}

/**
 * Die weiche Kante selbst.
 *
 * `pointerEvents` steht im `style` und nicht in den Props — als Prop ist es seit
 * React Native 0.76 veraltet und schreibt je Aufruf eine Warnung in die Konsole.
 * Ohne die Angabe läge die Kante über den äußersten Pillen und würde ihre Tipps
 * schlucken.
 */
function Kante({ seite, farbe }: { seite: 'links' | 'rechts'; farbe: string }) {
  return (
    <View style={[styles.kante, seite === 'links' ? styles.kanteLinks : styles.kanteRechts]}>
      {Array.from({ length: STREIFEN }, (_, i) => {
        // Die Deckkraft eines Streifens ist die eines echten Verlaufs an seiner
        // Mitte. Nach außen (zur Kante hin) undurchsichtig, nach innen durchsichtig.
        const anteil = (i + 0.5) / STREIFEN;
        const deckung = seite === 'rechts' ? anteil : 1 - anteil;
        return (
          <View
            key={i}
            style={[styles.streifen, { backgroundColor: farbe, opacity: deckung }]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  aussen: { flexGrow: 0, flexShrink: 0 },
  roller: { flexGrow: 0, flexShrink: 0 },

  // `StyleSheet.absoluteFillObject` gibt es in React Native 0.86 nicht mehr, und
  // `absoluteFill` ist eine Style-ID, die sich nicht mit weiteren Werten mischen
  // lässt (Phase 4, beim Konfetti gelernt). Also ausgeschrieben.
  kante: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: KANTE_BREITE,
    flexDirection: 'row',
    pointerEvents: 'none',
  },
  kanteLinks: { left: 0 },
  kanteRechts: { right: 0 },
  streifen: { flex: 1 },
});
