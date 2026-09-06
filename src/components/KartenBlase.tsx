import { Pressable, StyleSheet, View } from 'react-native';

import { SsText } from './ui';

import type { FeedEintrag } from '@/features/posts/hooks';
import { BLASE_MAX, blaseAlleText } from '@/features/posts/karte';
import { nachStartzeit } from '@/features/posts/sort';
import type { KartenAnker } from '@/components/ui/karte-typen';
import { kurzStart } from '@/lib/zeit';
import { categoryColors, colors, radius } from '@/theme';

/**
 * Die Sprechblase über einem angetippten Bezirk — Phase 19c.
 *
 * Aus Ians Rückmeldung zur Karte: „wenn man auf einen Bezirk klickt, sollen die
 * Aktivitäten über dem Klick herausspringen, klein, mit dem Minimum an Info — und
 * wenn ich interessiert bin, klicke ich drauf und sehe die ganze."
 *
 * Warum sie hier liegt und nicht in `components/ui/`: Sie kennt das Datenmodell,
 * genau wie `PostCard`. Die Bausteine in `ui/` wissen nichts von Posts — `SsWienKarte`
 * gibt deshalb nur die Geometrie her (`KartenAnker`) und bekommt den Inhalt als Slot
 * zurück.
 *
 * ── Was hier NICHT entschieden wird ───────────────────────────────────────────
 * Wie viele höchstens (`BLASE_MAX`) und in welcher Reihenfolge (`BLASE_REIHENFOLGE`)
 * steht in `features/posts/karte.ts`, wie jede andere Kartenregel (harte Regel 48).
 * Hier steht nur, wie viele bei DIESEM Platz wirklich hineinpassen — das ist eine
 * Frage der Bildpunkte und gehört zum Zeichner.
 */

/** Eine Zeile. Hoch genug für `caption` (17,5 px) plus 6 px Luft oben und unten. */
const ZEILE = 30;
/** Die Haarlinie zwischen zwei Zeilen. */
const TRENN = 1;
/** Innenabstand des Blasenkörpers, oben und unten. */
const PAD = 6;
/** Die Fußzeile „alle 5 ansehen" — steht nur da, wenn nicht alles hineinpasst. */
const FUSS = 24;
/** Höhe der Spitze. Die Breite ist doppelt so groß. */
const PFEIL = 7;
/** Abstand, den die Blase zu jedem Kartenrand hält. */
const LUFT = 4;
/** Breiter als das wird sie auch auf einem großen Schirm nicht — sonst ist sie die Karte. */
const BREITE_MAX = 240;

/** Wie hoch der Körper bei `n` Zeilen wird. Ohne Pfeil. */
function koerperHoehe(n: number, mitFuss: boolean): number {
  return 2 * PAD + n * ZEILE + (n - 1) * TRENN + (mitFuss ? FUSS : 0);
}

/**
 * Wie viele Zeilen bei diesem Platz wirklich hineinpassen — und nach welcher Seite.
 *
 * **Das ist die Rechnung, die der Plan vor dem Bauen verlangt hat, nicht danach.**
 * Nachgemessen: Auf 360 × 600 ist die Kartenfläche 168 px hoch, der Anker der Inneren
 * Stadt sitzt bei y = 94 — es bleiben 90 px, und das reicht für EINE Zeile mit
 * Fußzeile. Auf 390 × 844 (230 px Karte, 125 px über dem Anker) sind es ZWEI. Ians
 * Drei ist damit eine Obergrenze und keine Zusage; die Antwort auf zu wenig Platz ist
 * weniger Text, nicht kleinerer.
 *
 * Gekippt wird zur größeren Seite. Bei den Bezirken 19, 21 und 22 liegt der Anker so
 * weit oben, dass über ihm nichts mehr ist — ohne das Kippen wäre die halbe Karte
 * unbrauchbar.
 */
function passform(anker: KartenAnker, vorhanden: number) {
  const nachOben = anker.platzOben >= anker.platzUnten;
  const platz = Math.max(anker.platzOben, anker.platzUnten) - PFEIL - LUFT;

  let zeigen = Math.min(BLASE_MAX, vorhanden);
  // Mindestens eine Zeile steht immer da: Wer einen Bezirk antippt, in dem etwas
  // los ist, hat eine Antwort verdient — auch auf einem sehr kleinen Schirm.
  while (zeigen > 1 && koerperHoehe(zeigen, vorhanden > zeigen) > platz) zeigen--;

  return { nachOben, zeigen };
}

export function KartenBlase({
  anker,
  eintraege,
  onPost,
  onAlle,
}: {
  anker: KartenAnker;
  /** Alle Posts des angetippten Bezirks — ungeschnitten und in beliebiger Reihenfolge. */
  eintraege: FeedEintrag[];
  onPost: (id: string) => void;
  /** „alle 5 ansehen" — wechselt in die Listenansicht, der Bezirksfilter bleibt stehen. */
  onAlle: () => void;
}) {
  // Ians Entscheidung 37: das zeitlich Nächste zuerst. Der Vergleich kommt aus
  // `sort.ts` — über die Reihenfolge von Posts soll es keine zweite Rechnung geben.
  const sortiert = [...eintraege].sort((a, b) => nachStartzeit(a.post, b.post));
  const { nachOben, zeigen } = passform(anker, sortiert.length);
  const sichtbar = sortiert.slice(0, zeigen);
  const mitFuss = sortiert.length > zeigen;

  // Waagrecht: an der Spitze ausrichten, aber nie über den Kartenrand hinaus. Die
  // Spitze wandert dann innerhalb der Blase mit — bei den Randbezirken (1., 23.) ist
  // das der Unterschied zwischen „zeigt auf den Bezirk" und „steht halb daneben".
  const breite = Math.min(BREITE_MAX, anker.breite - 2 * LUFT);
  const links = Math.max(LUFT, Math.min(anker.breite - LUFT - breite, anker.x - breite / 2));
  const spitzeLinks = Math.max(PFEIL + 4, Math.min(breite - PFEIL - 4, anker.x - links)) - PFEIL;

  const koerper = (
    <View style={[styles.koerper, { width: breite }]}>
      {sichtbar.map((e, i) => (
        <View key={e.post.id}>
          {i > 0 ? <View style={styles.trenner} /> : null}
          <Pressable style={styles.zeile} onPress={() => onPost(e.post.id)}>
            {/* Die Kategoriefarbe als Punkt statt als Streifen: In einer 30 px hohen
                Zeile ist ein Streifen ein Strich, den man für eine Trennlinie hält. */}
            <View
              style={[styles.punkt, { backgroundColor: categoryColors[e.post.category].base }]}
            />
            {/* `caption` und nicht `label`: 13 px statt 15, und die Body-Schrift ist
                schmaler als die Display-Schrift. Das ist kein Sparen an der falschen
                Stelle, sondern Ians „klein, mit dem Minimum an Info" — die Hierarchie
                zur Zeit daneben trägt die FARBE (ink gegen inkSoft), nicht die Größe. */}
            <SsText variant="caption" numberOfLines={1} style={styles.titel}>
              {e.post.title}
            </SsText>
            {/* Was bewusst FEHLT, ist der Bezirk: Den hat man gerade selbst angetippt,
                er stünde in jeder Zeile dasselbe. */}
            <SsText variant="caption" color={colors.inkSoft}>
              {kurzStart(e.post.startsAt)}
            </SsText>
          </Pressable>
        </View>
      ))}

      {mitFuss ? (
        <Pressable style={styles.fuss} onPress={onAlle}>
          <SsText variant="caption" color={colors.inkSoft}>
            {blaseAlleText(sortiert.length)}
          </SsText>
        </Pressable>
      ) : null}
    </View>
  );

  const spitze = (
    <View
      style={[nachOben ? styles.spitzeUnten : styles.spitzeOben, { marginLeft: spitzeLinks }]}
    />
  );

  return (
    <View
      style={[
        styles.halter,
        { left: links, width: breite },
        // Nach oben: Unterkante = Anker. Nach unten: Oberkante = Anker. Beides ohne
        // die Höhe zu kennen — sie ergibt sich aus dem Inhalt, und eine gerechnete
        // Höhe wäre beim nächsten Textwechsel falsch.
        nachOben ? { bottom: anker.hoehe - anker.y } : { top: anker.y },
      ]}>
      {nachOben ? koerper : spitze}
      {nachOben ? spitze : koerper}
    </View>
  );
}

const styles = StyleSheet.create({
  halter: {
    position: 'absolute',
    // `box-none`: Der Kasten ist so breit wie erlaubt, die Blase darin vielleicht
    // schmaler — ohne das fängt der Rand rundherum Tipps ab, die auf die Karte
    // gehören. **Im `style` und nicht als Prop** (ACTA-Falle, CLAUDE.md): als Prop
    // seit React Native 0.76 veraltet, mit einer Konsolenwarnung je Aufruf.
    pointerEvents: 'box-none',
  },
  koerper: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingVertical: PAD,
    /**
     * Der Körper fängt Berührungen, der Halter um ihn herum nicht.
     *
     * **Ohne diese Zeile hängt es an einer Eigenheit von react-native-web:** Ein
     * `box-none` weiter oben wird dort zu CSS `pointer-events: none`, und CSS vererbt
     * das an alle Nachkommen — an alle außer den Text-Knoten, denen RNW selbst ein
     * `auto` mitgibt. Ergebnis war ein Kasten, der überall durchließ AUSSER auf den
     * Buchstaben: Ein Zug über die Blase markierte Text, statt die Karte zu schieben.
     * Ein ausdrückliches `auto` am Körper macht daraus wieder eine Fläche mit einer
     * Kante — und stimmt auf Native genauso (dort heißt `box-none` „Kinder ja").
     */
    pointerEvents: 'auto',
    // Eine Sprechblase ist kein Textabschnitt. Ohne das zieht ein Wisch über die
    // Blase eine blaue Markierung hinter sich her.
    userSelect: 'none',
    // Kein Rahmen, sondern ein Schatten: Ein Rahmen müsste am Pfeil um die Spitze
    // herumlaufen, und dafür bräuchte es zwei übereinanderliegende Dreiecke.
    //
    // Als STRING und nicht als `shadowColor`/`shadowOpacity`/`shadowRadius`: Die
    // Einzelprops sind seit React Native 0.76 veraltet und melden das bei jedem
    // Aufruf in der Konsole — dieselbe Sorte Rückstand wie `pointerEvents` als Prop.
    // `PrototypHinweis` schreibt es seit Phase 13 schon so.
    boxShadow: '0 3px 10px rgba(23, 25, 28, 0.18)',
  },
  zeile: {
    height: ZEILE,
    flexDirection: 'row',
    alignItems: 'center',
    // Eng gerechnet, nicht geschätzt: Bei 10 px Polster und 8 px Abstand blieben dem
    // Titel auf 360 px Schirmbreite **109 px** — „Fußball am Käfig" braucht mehr und
    // wurde zu „Fußball am …". Dieselbe Sorte Fund wie „Sta…" in Phase 11 und 19b,
    // nur eine Ebene tiefer.
    paddingHorizontal: 8,
    gap: 6,
  },
  punkt: { width: 8, height: 8, borderRadius: 4 },
  /**
   * Der Titel gibt nach, die Zeit nicht (harte Regel 43).
   *
   * `flex: 1` heißt `flexBasis: 0` — der Titel bekommt exakt den Rest, und zwischen
   * ihm und der Zeit entsteht gar kein Fehlbetrag, den sich beide teilen könnten.
   * Ein höheres `flexShrink` an der Zeit hätte beide gekürzt; genau daran ist die
   * Chat-Zeile in 18c zweimal gescheitert.
   */
  titel: { flex: 1 },
  trenner: { height: TRENN, backgroundColor: colors.line, marginHorizontal: 8 },
  fuss: {
    height: FUSS,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: TRENN,
    borderTopColor: colors.line,
    marginTop: PAD - 2,
  },
  // Ein Dreieck aus Rändern — der übliche Weg in React Native, und er funktioniert
  // auf Web genauso. Die durchsichtigen Seiten schneiden die Spitze aus.
  spitzeUnten: {
    width: 0,
    height: 0,
    borderLeftWidth: PFEIL,
    borderRightWidth: PFEIL,
    borderTopWidth: PFEIL,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.surface,
  },
  spitzeOben: {
    width: 0,
    height: 0,
    borderLeftWidth: PFEIL,
    borderRightWidth: PFEIL,
    borderBottomWidth: PFEIL,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.surface,
  },
});
