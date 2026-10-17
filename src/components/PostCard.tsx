import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { SichtMarke } from './SichtMarke';
import { SsAvatar, SsIconText, SsText } from './ui';

import { t } from '@/i18n';
import { alterAmPost } from '@/config/alter';
import { CATEGORIES } from '@/config/categories';
import { freiePlaetze, istOffen, type FeedEintrag } from '@/features/posts/hooks';
import { useMeineAnfrage } from '@/features/requests/hooks';
import { ortText } from '@/lib/bezirk';
import { startOderSeit } from '@/lib/zeit';
import { categoryColors, colors, ecke, spacing, useDruck } from '@/theme';

/**
 * Ein Post.
 *
 * Warum liegt die Datei hier und nicht in `components/ui/`? Weil sie das Datenmodell
 * kennt. Die Bausteine in `ui/` wissen nichts von Posts — man könnte sie in einer ganz
 * anderen App verwenden. Diesen Baustein gibt es nur, weil es Posts gibt.
 *
 * ── Was auf der Karte steht und was nicht ─────────────────────────────────────
 * Drin: Kategorie, Titel, wann, wo, wer, wie viele Plätze, zwei Zeilen Notiz.
 * Draußen: Treffpunkt und Können-Niveau. Beides interessiert erst, wenn man den Post
 * ernsthaft erwägt — im Vorbeiscrollen sind es zwei Zeilen mehr, die man überliest.
 * Die Karte soll die Frage „ist das was für mich?" beantworten, nicht schon die
 * Frage „wie komme ich hin?".
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  PHASE 20.11 — „groß und ruhig" (Ians Entscheidung 82)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Ians Satz am 2026-09-14: *„die Posts sollen cooler aussehen."* Aus drei vorgelegten
 * Fassungen hat er **„groß und ruhig"** gewählt: kein Kasten, viel Luft, der Titel
 * deutlich größer, die Kategorie als kleines farbiges Wort darüber statt als Pille.
 *
 * **Was dabei aufgegeben wird, steht hier, weil es eine begründete Entscheidung war:**
 * Der 6 pt breite Farbstreifen links (`SsCard`) war bis hierher *das einzige*, was die
 * Kategorie einfärbte — ausdrücklich, damit zehn Posts untereinander kein
 * Flickenteppich werden. Diese Sorge bleibt richtig, und deshalb ist die Kategorie
 * jetzt **ein Wort in Farbe** und keine Fläche: Sie ist im Vorbeiscrollen genauso
 * schnell zu erkennen, nimmt aber keine Fläche ein.
 *
 * ── Warum es `umgebung` gibt, und warum das KEINE zwei Karten sind ───────────
 * „Kein Kasten" kann nicht überall dasselbe heißen. **Die `WischKarte` hat keine
 * eigene Fläche** — sie ist ein absolut positionierter Rahmen mit Abrisskante und
 * Stempel, und die weiße Fläche, die man im Stapel wischt, kam bis Phase 20.11 aus
 * genau der `SsCard`, die hier wegfällt. Ersatzlos entfernt hätte man im Stapel
 * durchsichtigen Text gewischt.
 *
 * Deshalb sagt der Aufrufer, **wo** die Karte steht, und sie bringt die Fläche nur
 * dort mit, wo keine ist:
 *
 *   `'liste'`   Feed, Profil, Gruppe — keine Fläche, eine feine Linie unten
 *   `'karte'`   Wischstapel, Vorschau im Erstellen-Screen — weiße Fläche mit Ecke
 *
 * **Das ist dasselbe Muster wie beim Umschalter in der Glas-Pille** (*„der Umschalter
 * darin gibt seine eigene Fläche ab — zwei Untergründe übereinander wären einer zu
 * viel"*) und aus demselben Grund. Es sind **nicht** zwei Karten: Inhalt, Reihenfolge,
 * Schriftgrößen und jede Regel darüber, was draufsteht, sind in beiden Fällen
 * identisch. Verschieden ist nur der Untergrund, und über den entscheidet nicht die
 * Karte, sondern der Ort.
 *
 * ⚠️ **Harte Regel 18 bleibt damit unangetastet:** Die Vorschau im Erstellen-Screen ist
 * dieselbe Karte wie im Stapel (`'karte'`), nicht eine nachgebaute — sie ist die
 * Absicherung dafür, dass niemand etwas postet, das anders aussieht als gedacht.
 */

/**
 * Wo dieser Post steht — und damit, ob er seine eigene Fläche mitbringt.
 *
 * Kein `boolean` wie `mitRahmen`: Der Aufrufer weiß, wo er ist, aber nicht, welchen
 * Untergrund das nach sich zieht. Ein Name für den ORT hält die Entscheidung hier;
 * ein `true`/`false` hätte sie an fünf Stellen verteilt.
 */
export type PostUmgebung = 'liste' | 'karte';

export function PostCard({
  eintrag,
  onPress,
  umgebung = 'liste',
}: {
  eintrag: FeedEintrag;
  /** Ohne `onPress` ist die Karte nicht antippbar — so steht sie als Vorschau im
      Erstellen-Screen, wo ein Klick ins Leere führen würde, und im Wischstapel, wo
      der Tipp der Karte darum herum gehört (harte Regel 15). */
  onPress?: () => void;
  umgebung?: PostUmgebung;
}) {
  // Der Hook steht IMMER hier, auch für `umgebung === 'karte'` — Hooks dürfen nicht in
  // einer Abzweigung stehen. Ob seine Bewegung ankommt, entscheidet erst der Stil
  // unten; die Griffe hängen ohnehin nur am `Pressable`, das es auf der Karte nicht
  // gibt.
  const druck = useDruck();
  const { post, author } = eintrag;
  // Eine abgelehnte Anfrage ist erledigt und wird nicht mehr angezeigt — sonst
  // stünde an der Karte dauerhaft eine Absage, die man nicht wegbekommt.
  const anfrage = useMeineAnfrage(post.id);
  const meineAnfrage = anfrage?.status === 'declined' ? undefined : anfrage;
  const offen = istOffen(post);
  const frei = freiePlaetze(post);
  const palette = categoryColors[post.category];

  const inhalt = (
    <>
      {/* Die Kopfzeile: Kategorie in ihrer Farbe, daneben Zeit und Ort — alles in
          EINER kleinen Zeile über dem Titel. Bis Phase 20.11 war die Kategorie eine
          Pille und die Zeit stand UNTER dem Titel; zusammengefasst ist es eine Zeile
          weniger und liest sich als ein Satz („Sport, heute um fünf"). */}
      <View style={styles.kopf}>
        {/* `CATEGORIES[…].labelKey` und NICHT `post.category` — der Schlüssel der
            KATEGORIE heißt `food`, der Schlüssel des WORTES `kategorie.essen`. Wer
            hier `post.category` nimmt, schreibt englische Brocken in die Oberfläche.
            ⚠️ Seit dem 2026-10-17 steht in `CATEGORIES` ein Wörterbuch-Schlüssel
            statt des Wortes — übersetzt wird beim ZEICHNEN, weil eine modulweite
            Konstante sonst die Startsprache einfriert (`i18n/index.ts`). */}
        <SsText variant="caption" color={palette.onSoft} style={styles.kategorie}>
          {t(CATEGORIES[post.category].labelKey).toUpperCase()}
        </SsText>
        <SsText variant="caption" color={colors.inkSoft} numberOfLines={1} style={styles.wann}>
          {'·  '}
          {startOderSeit(post.startsAt)}
        </SsText>
        <SichtMarke visibility={post.visibility} />
      </View>

      {/* Der Titel ist das Größte auf der Karte — 26 statt 19 pt. Er ist das, wonach
          man im Vorbeiscrollen entscheidet, und `title` ist die Stufe, die es in
          `theme/type.ts` dafür schon gibt (keine neue Größe erfinden). */}
      <SsText variant="title" numberOfLines={2}>
        {post.title}
      </SsText>

      <SsText variant="caption" color={colors.inkSoft}>
        {ortText(post.district)}
        {alterAmPost(post.alter) ? `   ·   ${alterAmPost(post.alter)}` : ''}
      </SsText>

      {post.note ? (
        <SsText variant="body" color={colors.inkSoft} numberOfLines={2} style={styles.notiz}>
          {post.note}
        </SsText>
      ) : null}

      <View style={styles.fuss}>
        <View style={styles.person}>
          <SsAvatar name={author.displayName} seed={author.id} photoUrl={author.photoUrl} size="sm" />
          <SsText variant="caption" color={colors.ink} numberOfLines={1} style={styles.name}>
            {author.displayName}
          </SsText>
        </View>

        {meineAnfrage ? (
          // Bestätigt bekommt die Kategoriefarbe, angefragt bleibt grau: Der Unterschied
          // zwischen „läuft" und „wartet" ist der wichtigste auf der Karte, und Farbe
          // sieht man im Vorbeiscrollen, ein anderes Wort nicht.
          meineAnfrage.status === 'accepted' ? (
            <SsIconText icon="funken" color={colors.ink} iconColor={palette.onSoft}>
              Du bist dabei
            </SsIconText>
          ) : (
            <SsIconText icon="haken">Angefragt</SsIconText>
          )
        ) : (
          <SsText variant="caption" color={offen ? colors.ink : colors.inkSoft}>
            {plaetzeText(frei, offen)}
          </SsText>
        )}
      </View>
    </>
  );

  const flaeche = (
    <Animated.View
      style={[
        styles.block,
        umgebung === 'karte' ? styles.alsKarte : styles.alsZeile,
        !offen && styles.geschlossen,
        // In der Liste ist die Rückmeldung `useDruck()` (harte Regel 113) wie an jedem
        // anderen antippbaren Ding.
        //
        // 🔴 Auf der KARTE nicht, und das ist keine Geschmacksfrage: Dort beschreibt
        // der `PanResponder` der `WischKarte` DENSELBEN `transform`. Zwei Quellen auf
        // einer Eigenschaft schreiben abwechselnd — die Karte würde beim Wischen
        // zucken. Der Tipp gehört ohnehin der Karte darum herum (harte Regel 15), und
        // die bringt ihre eigene Rückmeldung mit.
        umgebung === 'liste' && druck.stil,
      ]}>
      {inhalt}
    </Animated.View>
  );

  if (!onPress) return flaeche;

  return (
    <Pressable onPress={onPress} {...druck.griff} accessibilityRole="button" style={styles.pressable}>
      {flaeche}
    </Pressable>
  );
}

/** "2 Plätze frei" · "1 Platz frei" · "Voll". Einzahl und Mehrzahl an einer Stelle. */
function plaetzeText(frei: number, offen: boolean): string {
  if (!offen || frei === 0) return 'Voll';
  return frei === 1 ? '1 Platz frei' : `${frei} Plätze frei`;
}

const styles = StyleSheet.create({
  pressable: { cursor: 'pointer' },

  /** Was in BEIDEN Umgebungen gilt — der Inhalt und sein Rhythmus. */
  block: { gap: spacing.sm },

  /**
   * In der Liste: keine Fläche, keine Kante, nur Luft und eine feine Linie unten.
   *
   * Die Linie ist `hairlineWidth` und nicht 1 px — das ist auf einem 3× -Schirm ein
   * Drittel davon und Apples Maß für eine Trennlinie. Sie darf hier so fein sein, weil
   * sie nichts TRÄGT: Bis Phase 20.11 hielt eine 1-px-Kante die Karte auf dem
   * Papierweiß zusammen, jetzt trennt die Linie nur noch zwei Einträge.
   */
  alsZeile: {
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },

  /**
   * Auf der Karte: die weiße Fläche, die vorher aus `SsCard` kam.
   *
   * **Ohne sie wischt man im Stapel durchsichtigen Text** — die `WischKarte` bringt
   * keine eigene mit (siehe Kopfkommentar). Kante und Schatten bekommt sie bewusst
   * NICHT: Im Stapel liegen die Karten ohnehin sichtbar übereinander, und ein Schatten
   * je Karte wäre bei drei Lagen dreimal derselbe.
   */
  alsKarte: {
    backgroundColor: colors.surface,
    ...ecke.lg,
    padding: spacing.lg,
  },

  // Volle Posts bleiben sichtbar, treten aber zurück: man soll sehen, dass etwas
  // läuft, ohne es für eine Einladung zu halten.
  geschlossen: { opacity: 0.62 },

  kopf: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  /**
   * Die Kategorie: klein, fett, weit gesperrt und in ihrer eigenen Farbe.
   *
   * `letterSpacing` ist der Grund, warum GROSSBUCHSTABEN hier lesbar bleiben und
   * nicht wie geschrien wirken — ohne die Sperrung kleben Versalien aneinander. Der
   * Farbton ist `onSoft` und nicht `base`: `base` ist für Flächen gemessen, `onSoft`
   * für Text auf hellem Grund (mindestens 4,5:1). Bei Gelb ist der Unterschied
   * zwischen beiden der zwischen lesbar und unlesbar.
   */
  kategorie: { fontWeight: '800', letterSpacing: 0.8 },
  /** `flex: 1` am nachgebenden Text, nicht `flexShrink` am anderen — harte Regel 43. */
  wann: { flex: 1 },

  /** Die Notiz ist `body` statt `caption`: Sie ist der einzige Satz, den die Person
   *  selbst geschrieben hat, und in der ruhigen Fassung hat sie den Platz dafür. */
  notiz: { marginTop: spacing.xs },

  fuss: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  person: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  name: { fontWeight: '700' },
});
