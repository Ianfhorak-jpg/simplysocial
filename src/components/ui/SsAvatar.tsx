import { Image, StyleSheet, View } from 'react-native';

import { SsIcon } from './SsIcon';
import { SsText } from './SsText';

import { CATEGORY_ORDER, categoryColors, colors, radius } from '@/theme';
import type { IconName } from '@/theme/icons';

export interface SsAvatarProps {
  /** Der angezeigte Name. Daraus werden die Initialen — siehe `initialen()`. */
  name?: string;
  /**
   * Statt Initialen ein Icon. Genau ein Fall braucht das: eine blockierte Person,
   * deren Name gar nicht mehr dastehen soll.
   */
  icon?: IconName;
  /** Die Nutzer-ID. Bestimmt die Hintergrundfarbe — derselbe Mensch, immer dieselbe Farbe. */
  seed?: string;
  /**
   * Ein echtes Profilbild (`User.photoUrl`). Fehlt es, stehen die Initialen —
   * Phase 15.
   *
   * Im Prototyp ist es IMMER leer: Es gibt keinen Upload, und in `data/mock.ts`
   * steht kein Bild (harte Regel 12). Das Prop ist trotzdem schon da und wird an
   * allen zwölf Aufrufstellen durchgereicht — damit „Fotos einbauen" später eine
   * Aufgabe ist (den Upload bauen) und nicht zwölf.
   */
  photoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Profilbild ohne Bilddatei.
 *
 * ── Was sich in Phase 14 geändert hat ────────────────────────────────────────
 * Bis 2026-09-02 stand hier ein Emoji je Person (🎧 🌿 ⚡ …). Das war der
 * auffälligste Teil von Christophs „schaut nach AI aus": sechs bunte Fremdbilder,
 * die mit den Menschen nichts zu tun hatten und in jeder Liste mitliefen.
 *
 * Jetzt sind es Initialen auf farbigem Grund. Zwei Gründe, beide aus PLAN.md:
 *   · Es sieht nach Produkt aus statt nach Platzhalter — jede Messenger-App der
 *     Welt macht es so, und niemand hält es für unfertig.
 *   · Es ist genau der Platz, den in Phase 15 ein echtes Foto bekommt: gleiche
 *     Stelle, gleiche Größe, gleicher Rahmen. Dann fehlt nur noch der Upload.
 *
 * ── Warum die Farbe gerechnet und nicht gewählt wird ─────────────────────────
 * Zufällig hieße, dass Lea bei jedem Neuladen anders aussieht. So bekommt jeder
 * Mensch dauerhaft seine Farbe — und zwar eine aus der bestehenden Palette, damit
 * die Avatare nicht neben den Kategoriefarben stehen, sondern dazugehören.
 */
export function SsAvatar({ name = '', icon, seed = '', photoUrl, size = 'md' }: SsAvatarProps) {
  const palette = categoryColors[CATEGORY_ORDER[streuen(seed) % CATEGORY_ORDER.length]];
  const masse = SIZES[size];

  return (
    <View
      style={[
        styles.circle,
        { width: masse.box, height: masse.box, backgroundColor: palette.soft, borderColor: colors.line },
      ]}>
      {photoUrl && !icon ? (
        // Das Bild liegt IM Kreis und wird von ihm beschnitten (`overflow: hidden`
        // am Kreis), statt selbst rund zu sein: So bleibt der farbige Grund als
        // Rahmen stehen, während das Bild lädt — und ein Bild, das nie kommt, sieht
        // aus wie ein Avatar ohne Foto und nicht wie ein Loch.
        //
        // `icon` schlägt das Foto: Der eine Fall dafür ist eine blockierte Person,
        // und die soll gerade NICHT mehr zu sehen sein.
        <Image
          source={{ uri: photoUrl }}
          style={styles.foto}
          accessibilityLabel={name ? `Profilbild von ${name}` : 'Profilbild'}
        />
      ) : icon ? (
        <SsIcon name={icon} size={masse.glyph + 2} color={palette.onSoft} />
      ) : (
        // `onSoft` und nicht `base`: Auf dem eigenen Hellton käme das Sport-Gelb auf
        // 1,85:1 und wäre unlesbar — derselbe Grund wie bei der Kategorie-Pille.
        <SsText
          variant="body"
          color={palette.onSoft}
          style={[styles.initialen, { fontSize: masse.glyph, lineHeight: Math.round(masse.glyph * 1.2) }]}>
          {initialen(name)}
        </SsText>
      )}
    </View>
  );
}

/**
 * Aus einer Nutzer-ID eine gut gestreute Zahl.
 *
 * ── Warum nicht einfach die Zeichen addieren ────────────────────────────────
 * Genau das stand hier bis Phase 14, und es war falsch — nur unsichtbar, solange
 * ein Emoji über der Farbe lag. Eine Summe ist positionsblind: „u_ian" ergibt 524,
 * „u_lea" 518, und bei sechs Farben landen beide auf derselben. Auf dem
 * Match-Bildschirm standen Ian und Lea damit als zwei identische Kreise
 * nebeneinander — auf dem einen Screen, dessen ganzer Inhalt „ihr zwei" ist.
 *
 * FNV-1a mit einem Mischschritt am Ende verteilt gleichmäßig (gemessen: 6000 IDs
 * auf sechs Farben, 965 bis 1061 je Farbe — vorher klumpte es). Zwei bestimmte
 * Menschen können sich trotzdem eine Farbe teilen; das ist bei sechs Farben
 * unvermeidbar und harmlos, solange sie nicht systematisch zusammenfallen.
 *
 * `Math.imul` und nicht `*`: JavaScript rechnet sonst in Fließkomma weiter und
 * verliert bei großen Zahlen die unteren Bits — genau die, auf die es hier ankommt.
 */
function streuen(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  return h >>> 0;
}

/**
 * „Lea" → „L" · „Lea Mayer" → „LM" · „" → „?"
 *
 * Höchstens zwei Buchstaben. Drei passen im kleinen Avatar (32 px) nicht mehr, und
 * ein Avatar, der bei manchen Namen enger gesetzt ist als bei anderen, fällt in
 * einer Liste sofort auf.
 */
function initialen(name: string): string {
  const woerter = name.trim().split(/\s+/).filter(Boolean);
  if (woerter.length === 0) return '?';
  const ersteBuchstaben = woerter.slice(0, 2).map((w) => [...w][0] ?? '');
  return ersteBuchstaben.join('').toUpperCase();
}

const SIZES = {
  sm: { box: 32, glyph: 14 },
  md: { box: 44, glyph: 18 },
  lg: { box: 72, glyph: 28 },
} as const;

const styles = StyleSheet.create({
  circle: {
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Beschneidet ein Profilbild auf den Kreis. Ohne das ragt ein quadratisches
    // Foto über den Rand hinaus — auf Web sichtbar, auf iOS ebenfalls.
    overflow: 'hidden',
  },
  // Absolut und nicht `width: '100%'`: Als Kind eines Flex-Containers mit
  // `alignItems: center` würde das Bild sonst auf seine Eigengröße zusammenfallen.
  foto: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  // Etwas weiter gesperrt: Zwei Großbuchstaben ohne Sperrung kleben im Kreis
  // aneinander und lesen als ein Zeichen.
  initialen: { fontWeight: '700', letterSpacing: 0.5 },
});
