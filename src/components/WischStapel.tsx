import { useRef, useState, type ReactNode } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { PostCard } from './PostCard';
import { WischKarte, type WischKarteHandle } from './WischKarte';
import { SsButton, SsCard, SsIcon, SsText } from './ui';

import type { FeedEintrag } from '@/features/posts/hooks';
import { SICHTBARE_KARTEN, type WischRichtung } from '@/features/posts/wisch';
import { accent, categoryColors, colors, spacing } from '@/theme';
import type { IconName } from '@/theme/icons';

/**
 * Der Stapel: drei Karten übereinander, die vorderste kann man wegziehen.
 *
 * ── Warum die Knöpfe hier unten stehen und nicht im Screen ────────────────────
 * Sie tun dasselbe wie das Wischen und gehören deshalb zum Stapel, nicht zur Seite.
 * Wichtiger ist aber der zweite Grund: **Eine Geste allein ist keine Bedienung.**
 * Wer mit VoiceOver arbeitet oder am Schreibtisch eine Tastatur benutzt, kann nicht
 * wischen — für den wäre der Stapel eine Wand. Mit den Knöpfen ist er derselbe
 * Bildschirm mit zwei Wegen zum selben Ergebnis.
 *
 * Sie lösen bewusst dieselbe Animation aus wie der Finger (`wegwerfen`), statt die
 * Karte still verschwinden zu lassen: Wer den Knopf drückt und die Karte fliegen
 * sieht, lernt nebenbei, dass man sie auch schieben kann.
 *
 * ── Wer im Stapel mit VoiceOver oder Tastatur unterwegs ist ──────────────────
 * Für den sind die beiden Knöpfe der Weg: Die Karte selbst ist keine Schaltfläche
 * mehr, seit sie den Tipp selbst verarbeitet (Begründung in `WischKarte.tsx`). Der
 * Weg ins Post-Detail führt für ihn über die LISTE — dort ist jede Karte wie bisher
 * eine Schaltfläche. Das ist kein Trostpreis, sondern derselbe Grund, aus dem es
 * die Liste überhaupt noch gibt.
 *
 * ── Warum die Karte im Stapel dieselbe `PostCard` ist wie in der Liste ────────
 * Es ist derselbe Post. Eine zweite, größere Karte nur für den Stapel wäre ein
 * zweiter Ort, an dem steht, was ein Post über sich zeigt — und in dem Moment, in
 * dem jemand eine Zeile ergänzt, zeigen Liste und Stapel Verschiedenes. Dieselbe
 * Überlegung wie bei `components/Profil.tsx` (harte Regel 7).
 */

export interface WischStapelProps {
  eintraege: FeedEintrag[];
  /** Liegt beim allerersten Öffnen zuoberst und bringt die Geste bei. */
  anleitung: boolean;
  onAnleitungWeg: () => void;
  onWeg: (eintrag: FeedEintrag, richtung: WischRichtung) => void;
  onAntippen: (eintrag: FeedEintrag) => void;
  /**
   * Die Zeile ganz unten. Ohne Angabe steht dort der Hinweis auf die Geste; der
   * Screen schiebt für ein paar Sekunden „Rückgängig" hinein.
   *
   * Warum als Platz und nicht als schwebende Leiste: Etwas, das über den Knöpfen
   * liegt, verdeckt genau die Aktion, die man als Nächstes braucht. So bekommt der
   * Hinweis seinen eigenen Streifen — und weil der Streifen immer gleich hoch ist
   * (`fussnote` unten), zuckt der Stapel nicht, wenn der Inhalt wechselt.
   */
  fussnote?: ReactNode;
  /**
   * Etwas, das über den Karten liegt, solange es da ist — heute das Filterfeld.
   *
   * ── Warum das hier hineingereicht wird und nicht im Screen darüberliegt ──────
   * Weil NUR hier bekannt ist, wo die Karten aufhören und die Knöpfe anfangen.
   * Der erste Anlauf am 2026-09-03 legte das Feld im Screen über den ganzen
   * Stapelbereich — auf einem 360×600-Fenster verschwanden dadurch „Weg“ und
   * „Bin dabei“ vollständig dahinter. Als Kind der Kartenfläche kann das nicht
   * mehr passieren: `maxHeight: '100%'` heißt hier „bis zu den Knöpfen und keinen
   * Punkt weiter“, ohne dass irgendwo eine Höhe in Pixeln geraten wird.
   *
   * Es scrollt, statt abgeschnitten zu werden. Ein Filter, dessen unterste Reihe
   * hinter der Kante liegt, ist derselbe Fehler noch einmal — nur leiser.
   */
  blatt?: ReactNode;
}

type Karte = { art: 'anleitung' } | { art: 'post'; eintrag: FeedEintrag };

export function WischStapel({
  eintraege,
  anleitung,
  onAnleitungWeg,
  onWeg,
  onAntippen,
  fussnote,
  blatt,
}: WischStapelProps) {
  const obenRef = useRef<WischKarteHandle>(null);

  const alle: Karte[] = [
    ...(anleitung ? [{ art: 'anleitung' } as const] : []),
    ...eintraege.map((eintrag) => ({ art: 'post' as const, eintrag })),
  ];
  const gezeigt = alle.slice(0, SICHTBARE_KARTEN);

  // Ein leerer Stapel ist kein Fall für diesen Baustein, sondern für den Screen:
  // Dort steht dann die Liste des schon Gesehenen (PLAN.md, Phase 11).
  if (gezeigt.length === 0) return null;

  const oben = gezeigt[0];

  return (
    <>
      <View style={styles.flaeche}>
        {/* Von hinten nach vorne gezeichnet: Was später kommt, liegt oben — auf Web
            wie auf iOS, ohne dass jemand an `zIndex` denken muss. */}
        {gezeigt
          .map((karte, tiefe) => (
            <WischKarte
              key={karte.art === 'anleitung' ? 'anleitung' : karte.eintrag.post.id}
              ref={tiefe === 0 ? obenRef : undefined}
              tiefe={tiefe}
              palette={karte.art === 'post' ? categoryColors[karte.eintrag.post.category] : accent}
              onWeg={
                karte.art === 'anleitung'
                  ? onAnleitungWeg
                  : (richtung) => onWeg(karte.eintrag, richtung)
              }
              onAntippen={
                karte.art === 'anleitung' ? undefined : () => onAntippen(karte.eintrag)
              }>
              {/* Die `PostCard` bekommt hier bewusst KEIN `onPress`: Der Tipp
                  gehört der Karte darum herum. Warum, steht ausführlich in
                  `WischKarte.tsx` — kurz: sonst wischt man und landet trotzdem im
                  Post-Detail, weil der Browser nach jedem Ziehen zusätzlich ein
                  `click` schickt. */}
              {karte.art === 'anleitung' ? (
                <AnleitungsKarte />
              ) : (
                <PostCard eintrag={karte.eintrag} />
              )}
            </WischKarte>
          ))
          .reverse()}

        {/* Steht nach den Karten im Baum und liegt dadurch darüber. Ohne feste
            Höhe: Ist das Blatt kürzer als die Fläche, bleibt die Karte darunter
            sichtbar UND wischbar — es ist ein Blatt, kein Vorhang. */}
        {blatt ? <Blatt>{blatt}</Blatt> : null}
      </View>

      <View style={styles.knoepfe}>
        <SsButton
          variant="ghost"
          label="Weg"
          icon="kreuz"
          onPress={() => obenRef.current?.wegwerfen('links')}
        />
        {oben.art === 'post' ? (
          <SsButton
            variant="category"
            category={oben.eintrag.post.category}
            label="Bin dabei"
            icon="hand"
            onPress={() => obenRef.current?.wegwerfen('rechts')}
          />
        ) : (
          <SsButton
            label="Verstanden"
            icon="daumen"
            onPress={() => obenRef.current?.wegwerfen('rechts')}
          />
        )}
      </View>

      {/* Der Satz steht unter den Knöpfen und nicht auf der Karte: Auf der Karte
          stünde er bei jedem Post noch einmal, und ab dem dritten liest ihn niemand
          mehr. Hier ist er Beschriftung der Knöpfe — genau so lange lesbar, wie man
          ihn braucht. */}
      <View style={styles.fussnote}>
        {fussnote ?? (
          <SsText variant="caption" center color={colors.inkSoft}>
            Oder die Karte einfach zur Seite schieben.
          </SsText>
        )}
      </View>
    </>
  );
}

/**
 * Was über den Karten liegt — heute das Filterfeld.
 *
 * ── Warum es scrollt und wo seine Grenze herkommt ────────────────────────────
 * `maxHeight: '100%'` misst sich an der Kartenfläche, und die endet dort, wo die
 * Knöpfe anfangen. Dadurch kann kein Blatt „Weg“ und „Bin dabei“ verdecken, egal
 * wie viele Filterreihen einmal dazukommen — ohne dass irgendwo eine Höhe in
 * Pixeln steht, die jemand nachziehen müsste.
 *
 * ── Warum es unten eine weiche Kante braucht ─────────────────────────────────
 * Beim Abschneiden verliert der Kasten seine untere Rahmenlinie: Er sieht dann
 * abgerissen aus, nicht fortgesetzt — und wer nicht ahnt, dass da noch etwas ist,
 * findet den Alters-Filter nicht. Das ist derselbe Gedanke wie bei
 * `SsScrollReihe` (harte Regel 19), nur senkrecht. Die Technik ist absichtlich
 * dieselbe: gestapelte Flächen statt eines echten Verlaufs, weil
 * `react-native-web` `experimental_backgroundImage` nicht kennt und
 * `expo-linear-gradient` ein Native-Modul wäre (harte Regel 1).
 *
 * Und wie dort gilt: **Die Kante steht nur, wenn wirklich etwas abgeschnitten
 * ist.** Eine Kante, die immer da ist, verspricht Inhalt, den es nicht gibt.
 */
const KANTE_HOEHE = 28;
const STREIFEN = 7;

function Blatt({ children }: { children: ReactNode }) {
  const [y, setY] = useState(0);
  const [sichtbar, setSichtbar] = useState(0);
  const [inhalt, setInhalt] = useState(0);

  // Ein Pixel Toleranz, wie in `SsScrollReihe`: Auf Web sind das Fließkommazahlen,
  // und „ganz unten“ ist dort oft 295.98 statt 296.
  const untenAb = inhalt - (y + sichtbar) > 1;

  return (
    <View style={styles.blatt}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) =>
          setY(e.nativeEvent.contentOffset.y)
        }
        onLayout={(e: LayoutChangeEvent) => setSichtbar(e.nativeEvent.layout.height)}
        onContentSizeChange={(_, hoehe) => setInhalt(hoehe)}>
        {children}
      </ScrollView>

      {untenAb ? (
        <View style={styles.kante}>
          {Array.from({ length: STREIFEN }, (_, i) => {
            // Die Deckkraft eines Streifens ist die eines echten Verlaufs an seiner
            // Mitte: nach unten hin undurchsichtig, nach oben durchsichtig.
            const deckung = (i + 0.5) / STREIFEN;
            return (
              <View
                key={i}
                style={[styles.streifen, { backgroundColor: colors.surface, opacity: deckung }]}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

/**
 * Die erste Karte bringt sich selbst bei (PLAN.md, Phase 11).
 *
 * Statt eines Einführungs-Bildschirms, den man einmal wegtippt und nie wieder sieht,
 * ist die Anleitung die oberste Karte: Man lernt die Geste, indem man sie macht.
 * Sie ist bewusst genauso gebaut wie eine Post-Karte — sonst sähe sie aus wie ein
 * Hinweis, den man wegklickt, und nicht wie etwas, das man wischt.
 */
function AnleitungsKarte() {
  return (
    <SsCard>
      <SsText variant="heading">So funktioniert der Stapel</SsText>
      <Zeile pfeil="pfeilLinks" text="Nach links, wenn es nichts für dich ist." />
      <Zeile pfeil="pfeilRechts" text="Nach rechts, wenn du mitwillst." />
      <SsText variant="caption" color={colors.inkSoft}>
        Probier es gleich mit dieser Karte aus. Der Verfasser entscheidet danach, wer
        mitkommt — bis dahin passiert nichts.
      </SsText>
    </SsCard>
  );
}

function Zeile({ pfeil, text }: { pfeil: IconName; text: string }) {
  return (
    <View style={styles.zeile}>
      <View style={styles.pfeil}>
        <SsIcon name={pfeil} size={20} color={colors.inkSoft} />
      </View>
      <SsText variant="body" style={styles.zeileText}>
        {text}
      </SsText>
    </View>
  );
}

/**
 * Ob die Anleitungskarte schon gesehen wurde.
 *
 * Genau wie beim Prototyp-Hinweis aus Phase 8: `sessionStorage`, nicht
 * `localStorage`. Wer in drei Wochen wiederkommt, hat die Geste vergessen — dann
 * darf die Karte noch einmal kommen. Und alles in `try/catch`, weil im privaten
 * Modus schon der Zugriff wirft.
 */
const SCHLUESSEL = 'ss_anleitung_weg';
let gesehenImLauf = false;

export function anleitungGesehen(): boolean {
  if (gesehenImLauf) return true;
  if (Platform.OS !== 'web') return false;
  try {
    return window.sessionStorage.getItem(SCHLUESSEL) === '1';
  } catch {
    return false;
  }
}

export function anleitungMerken(): void {
  gesehenImLauf = true;
  if (Platform.OS !== 'web') return;
  try {
    window.sessionStorage.setItem(SCHLUESSEL, '1');
  } catch {
    // Privater Modus. Der Merker oben reicht, solange die Seite nicht neu lädt.
  }
}

const styles = StyleSheet.create({
  // Nimmt den Platz, der zwischen Filtern und Knöpfen übrig ist. Die Karten liegen
  // darin absolut übereinander (siehe `WischKarte`), deshalb braucht die Fläche
  // selbst keine Höhe — sie bekommt sie vom `flex: 1`.
  flaeche: { flex: 1, justifyContent: 'center', marginTop: spacing.xs },

  // `maxHeight: '100%'` ist die ganze Sicherung — Begründung bei `Blatt` oben.
  blatt: { position: 'absolute', top: 0, left: 0, right: 0, maxHeight: '100%' },

  // Wie in `SsScrollReihe`: ausgeschrieben statt `absoluteFillObject`, das es in
  // React Native 0.86 nicht mehr gibt. `pointerEvents` im `style`, sonst schluckt
  // die Kante die Tipps auf die unterste Filterreihe.
  kante: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: KANTE_HOEHE,
    pointerEvents: 'none',
  },
  streifen: { flex: 1 },

  knoepfe: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },

  // Feste Höhe, damit der Wechsel zwischen Hinweis und „Rückgängig" den Stapel
  // nicht anhebt.
  fussnote: { minHeight: 44, justifyContent: 'center' },

  zeile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pfeil: { width: 24, textAlign: 'center' },
  zeileText: { flex: 1 },
});
