import { router } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { AntwortLeiste } from '@/components/AntwortLeiste';
import { KartenBlase } from '@/components/KartenBlase';
import { PostCard } from '@/components/PostCard';
import { WischStapel, anleitungGesehen, anleitungMerken } from '@/components/WischStapel';
import {
  SsBack,
  SsButton,
  SsChip,
  SsGlas,
  SsIcon,
  SsScreen,
  SsJahrgangBalken,
  SsScrollReihe,
  SsKarte,
  SsSegment,
  SsText,
  GLAS_AN,
  useKlappe,
} from '@/components/ui';
import { FILTER_EGAL, jahrgangMax, jahrgangMin, spanneUmJahrgang } from '@/config/alter';
import { useCurrentUser } from '@/features/social/hooks';
import {
  BEZIRK_ALLE,
  gewaehlterBezirk,
  WANN_LABELS,
  WANN_ORDER,
} from '@/features/posts/filter';
import { bezirkPostText } from '@/features/posts/karte';
import {
  FILTER_LEER,
  aktiveFilter,
  useBezirksZaehlung,
  useFeed,
  useStapel,
  wegwischen,
  wischRueckgaengig,
  type FeedEintrag,
  type FeedFilter,
} from '@/features/posts/hooks';
import {
  RUECKGAENGIG_MS,
  WISCH_WIRKUNG,
  grussVorschlag,
  type WischRichtung,
} from '@/features/posts/wisch';
import { anfrageSenden } from '@/features/requests/hooks';
import { bewegung } from '@/lib/bewegung';
import { useTabUeberdeckung } from '@/lib/tabs';
import { accent, CATEGORY_ORDER, categoryColors, colors, DruckFlaeche, ecke, radius, spacing, useDruck } from '@/theme';

/**
 * Der Feed — der erste Screen der App und der einzige, den man täglich sieht.
 *
 * ── Seit Phase 11: zwei Ansichten, ein Bildschirm ─────────────────────────────
 * Der **Stapel** steht vorn (Ians Entscheidung vom 2026-09-01), die **Liste** ist
 * dieselbe wie vorher. Was NICHT passiert ist: die Liste abzuschaffen. Sie ist das
 * Auffangnetz für den leeren Dienstag — ist der Stapel durch, steht hier keine leere
 * Fläche, sondern alles noch einmal in Ruhe. Die ganze Begründung steht in
 * `features/posts/wisch.ts` und in PLAN.md, Abschnitt 1.
 *
 * Deshalb ist es auch kein zweiter Tab und keine zweite Adresse: **Es sind dieselben
 * Daten mit denselben Filtern**, nur anders angeordnet. Alle sechs Filter gelten in
 * beiden Ansichten und überleben das Umschalten — wer filtert und dann die Ansicht
 * wechselt, würde einen zurückgesetzten Filter für einen Fehler halten.
 *
 * ── Seit Phase 15: sechs Filter statt zwei ────────────────────────────────────
 * Leopolds Rückmeldung vom 2026-09-02 war „man kann nicht so genau filtern, was ein
 * Problem wird, wenn es viele Anfragen gibt". Dazugekommen sind **Suche, Bezirk,
 * Wann und Altersgruppe**; was sie bedeuten, steht in `features/posts/filter.ts`,
 * dieser Screen zeigt nur Pillen.
 *
 * Sichtbar bleiben davon nur zwei Dinge: die **Suchzeile** (ein Suchfeld, das man
 * erst aufklappen muss, wird nicht benutzt) und die **Kategorien** (der
 * meistbenutzte Filter, und die sechs Farben sind das Gesicht der App). Der Rest
 * liegt hinter dem Filter-Knopf — mit der Zahl daneben, denn ein zugeklappter
 * Filter, den man nicht mehr sieht, ist der schnellste Weg zu einem Feed, den
 * jemand für kaputt hält.
 *
 * ── Warum FlatList und nicht `<SsScreen scroll>` mit einem `.map()` ───────────
 * Bei 14 Fake-Posts wäre beides gleich. Aber die FlatList zeichnet nur, was gerade
 * sichtbar ist — bei 300 echten Posts ist das der Unterschied zwischen flüssig und
 * ruckelig. Weil das später sowieso nötig wird, steht es jetzt schon richtig da.
 * (Deshalb bekommt `SsScreen` hier KEIN `scroll`: eine FlatList in einem ScrollView
 * verliert genau diese Fähigkeit und warnt zu Recht.)
 *
 * ── Warum Kopf und Filter stehen bleiben ──────────────────────────────────────
 * Sie könnten mitscrollen (`ListHeaderComponent`). Aber wer filtert, will das
 * Ergebnis sehen und sofort weiterfiltern — ein Filter, den man erst wieder
 * hochscrollen muss, wird nicht benutzt. Im Stapel gilt dasselbe doppelt: dort
 * scrollt gar nichts.
 *
 * ── Seit Phase 19e: die Karte ist ein anderer Screen ──────────────────────────
 * Ians Entscheidung 40: *„wenn man auf Karte drückt, sieht man wirklich nur die
 * Karte auf dem ganzen Screen."* Deshalb hat dieser Screen jetzt **zwei Bäume** und
 * nicht mehr eine Ansicht unter dreien:
 *
 *   Stapel und Liste   ein gewöhnlicher `SsScreen` mit Zeilen untereinander
 *   Karte              Vollbild ohne `SsScreen`, mit einem ziehbaren Blatt darüber
 *
 * **Der Zustand ist trotzdem EINER** — dieselben sechs Filter, derselbe Feed,
 * dieselbe Auswahl (harte Regel 26 und 50). Wer von der Karte auf die Liste
 * umschaltet, findet seinen Bezirk wieder. Das ist der ganze Grund, warum die Karte
 * hier drin bleibt und kein vierter Tab wird.
 *
 * Was dabei WEGGEFALLEN ist, steht hier, weil es sonst niemand mehr findet:
 *   • Der Schriftzug „SimplySocial" oben. Er stand nur auf diesem Screen; die
 *     anderen Tabs haben eigene Titel. Ians Entscheidung, damit die Karte randlos
 *     nach oben laufen kann.
 *   • Der Zähler „Noch 8 Karten" neben dem Umschalter — Ians Entscheidung 47, die
 *     einzige dieser Runde gegen meine Empfehlung. **Der Preis ist benannt:** Er
 *     war die Stütze von Entscheidung 14 (das Filterfeld überdeckt den Stapel,
 *     statt zu schieben) und die einzige Rückmeldung, dass gerade gefiltert wird.
 *     Ohne ihn filtert man im STAPEL blind, bis man zuklappt; in der Karte nicht,
 *     dort steht die Liste im Blatt daneben. **Die Korrektur wäre eine Zeile:**
 *     `kartenZahl(karten.length)` klein unter den Stapel, statt neben den
 *     Umschalter — dort ist Platz, seit „Posten" ein runder Knopf ist.
 */

/**
 * **Zwei Ansichten seit Phase 20.11** — bis dahin drei.
 *
 * Ians Satz am 2026-09-14: *„gib die Liste weg brauchen wir nicht mehr."* Gemeint war
 * die STUFE IM UMSCHALTER, nicht die Liste als Darstellung: Die steht weiterhin unter
 * dem durchgewischten Stapel (Ians Regel aus Phase 11 — am Ende des Stapels keine
 * leere Fläche, sondern das schon Gesehene) und im Blatt der Kartenansicht
 * (Entscheidung 40). **Beide haben dort eine Aufgabe, die der Umschalter nicht hatte.**
 *
 * Was wegfällt, ist die Möglichkeit, den Stapel zu ÜBERSPRINGEN und gleich alles als
 * Liste zu sehen. Das ist die Entscheidung, nicht ein Nebeneffekt: Der Stapel ist seit
 * dem 2026-09-01 die Startansicht, und eine Stufe daneben, die ihn umgeht, macht ihn
 * zu einem Angebot statt zum Weg.
 */
type Ansicht = 'stapel' | 'karte';

/**
 * Wo bin ich hier? — die eine Zeile, die auf dem Bezirks-Vollbild stehen bleibt.
 *
 * Ians Entscheidung 66 nimmt von diesem Fenster alles weg außer den Karten und der
 * Leiste unten. **Diese Zeile ist keine Ausnahme davon, sondern ihre Anwendung:**
 * Man ist dort, weil man einen Bezirk gewählt hat; ohne den Namen wären es dieselben
 * Karten wie am Start, nur ohne Bedienung. Sie beantwortet genau die Frage, die der
 * Bildschirm sonst offenließe.
 *
 * Bis Phase 19i stand derselbe Text im Blattkopf. Er ist mitgewandert und nicht neu
 * erfunden — dieselbe Rechnung, damit Blase, Karte und Vollbild nie verschiedene
 * Zahlen zeigen.
 */
function bezirkUeberschrift(bezirk: FeedFilter['bezirk'], anzahl: number): string {
  if (bezirk.kind === 'einer') return `${bezirk.plz} Wien · ${bezirkPostText(anzahl)}`;
  if (bezirk.kind === 'ohne') return `Ohne Bezirk · ${bezirkPostText(anzahl)}`;
  return `Ganz Wien · ${bezirkPostText(anzahl)}`;
}

export default function FeedScreen() {
  const [ansicht, setAnsichtRoh] = useState<Ansicht>('stapel');

  /**
   * Steht gerade das Bezirks-Vollbild da? — **Ians Entscheidung 65** (Phase 19i).
   *
   * ── Warum ein Zustand und keine eigene Route ─────────────────────────────────
   * `/bezirk/[plz]` wäre der erste Gedanke und bricht harte Regel 50: *Was auf der
   * Karte gewählt ist, IST der Bezirksfilter — es gibt keinen zweiten Zustand
   * daneben.* Eine Route trüge die Auswahl in der Adresse, und damit gäbe es sie
   * zweimal. Hier steht sie weiter genau einmal, in `filter.bezirk`; diese Variable
   * sagt nur, ob das Fenster offen ist, so wie `ansicht` sagt, welche Ansicht dran
   * ist. (Nebenbei erspart es `generateStaticParams`, harte Regel 11.)
   *
   * ── Warum es beim Ansichtswechsel zufällt ────────────────────────────────────
   * Sonst käme man aus der Liste zurück auf „Karte" und stünde ohne Vorwarnung in
   * einem Vollbild ohne Karte. Der Bezirksfilter selbst überlebt den Wechsel
   * weiter — das ist der Teil, den Regel 50 verlangt.
   */
  const [bezirkStapel, setBezirkStapel] = useState(false);
  /**
   * Ob die Karte im Baum BLEIBT, auch wenn sie gerade nicht dran ist.
   *
   * 🔴 **Ians Befund vom 2026-09-20, an seiner Bildschirmaufnahme nachgesehen:**
   * *„es switcht irgendwie komisch."* Im Video ist der Ablauf dreistufig — bei
   * 2,75 s steht die Karte noch WEISS und leer da (MapKits Kachel-Platzhalter),
   * dann erscheint sie hart, und **danach** fährt erst die Kamera auf Wien zu.
   *
   * Das war kein Animationsproblem: Die Karte wurde bei jedem Wechsel **neu
   * aufgebaut**, weil der Kartenzweig ein eigenes `return` war. MapKit fängt dann
   * jedes Mal bei null an — Kacheln laden, `onMapReady`, Kamerafahrt. Eine längere
   * Pillen-Animation hätte das eher verschlimmert: Sie liefe noch, während die
   * Karte schon springt.
   *
   * ⚠️ **Erst beim ersten Mal, nicht von Anfang an.** Wer die Karte nie öffnet,
   * soll MapKit auch nicht im Rücken laufen haben — das kostet Speicher und Akku
   * auf einem Bildschirm, den es gar nicht betrifft. Deshalb ein Zustand, der nur
   * EINMAL wächst und nie wieder zurückgeht.
   */
  const [karteBleibt, setKarteBleibt] = useState(false);
  const setAnsicht = (a: Ansicht) => {
    if (a === 'karte') setKarteBleibt(true);
    setBezirkStapel(false);
    setAnsichtRoh(a);
  };

  // Seit Phase 15 EIN Objekt statt sechs Einzelwerte. Der Nebeneffekt ist der
  // eigentliche Grund: `useState` gibt dasselbe Objekt zurück, solange niemand es
  // ändert — der Feed rechnet also nur neu, wenn wirklich jemand gefiltert hat.
  // (Vorher stand hier ein `useMemo`, das genau das von Hand nachgebaut hat.)
  const [filter, setFilter] = useState<FeedFilter>(FILTER_LEER);
  // Nur für den Vorschlag im Jahrgangs-Regler — der Feed filtert NICHT nach mir.
  const ich = useCurrentUser();
  const setzen = <K extends keyof FeedFilter>(feld: K, wert: FeedFilter[K]) =>
    setFilter((alt) => ({ ...alt, [feld]: wert }));

  const eintraege = useFeed(filter);
  const stapel = useStapel(filter);
  // Phase 19b. Dieselbe Zählung speist Karte UND Filter-Pillen — die Regel „beim
  // Zählen wird genau der Bezirksfilter ausgeschaltet" steht damit an EINER Stelle
  // (`useBezirksZaehlung`), nicht zweimal fast gleich.
  const { proBezirk, ohneBezirk } = useBezirksZaehlung(filter);

  /** Ist der Filterbereich aufgeklappt? Zu beim Aufschlagen — wie beim Posten. */
  const [filterOffen, setFilterOffen] = useState(false);
  // Ians Auftrag vom 2026-09-20: *„es kommt ja noch nicht runter … ich will, dass es
  // so mäßig rauskommt."* Der Regler ist der größte Sprung der App — halbe
  // Bildschirmhöhe in einem Frame. Siehe `ui/klappe.ts`, auch dazu, warum das KEIN
  // `LayoutAnimation` ist.
  const klappe = useKlappe(filterOffen);
  /**
   * Wie hoch die Kopfzeile wirklich ist — gemessen, nicht gerechnet.
   *
   * Ians Urteil am 2026-09-20: *„das oben ist noch nicht wirklich Liquid Glass."*
   * Der Befund dazu war kein Materialfehler, sondern die SCHICHTUNG: Die Kapsel
   * stand im Fluss, der Inhalt begann darunter — **hinter dem Glas lag nichts als
   * die einfarbige Seitenfläche.** Liquid Glass bricht, was dahinter liegt; über
   * einer einzigen Farbe kann es nichts anderes sein als eine getönte Fläche.
   *
   * Apples eigene Leisten liegen deshalb ÜBER dem Inhalt — die Tab-Kapsel unten tut
   * das seit Entscheidung 85 auch, und genau die hat Ian als Vergleich vor Augen.
   *
   * Gemessen und nicht als Zahl hingeschrieben, weil die Zeile ihre Höhe aus
   * Kapsel, Posten-Knopf und Polsterung bezieht — drei Dinge, die sich schon
   * mehrfach geändert haben (harte Regel 60).
   */
  // Gebraucht für `kopfUeberInhalt` darunter: Die Kopfleiste trägt den oberen
  // Sicherheitsabstand seit dem 2026-09-20 selbst, `SsScreen` ebenfalls.
  const insets = useSafeAreaInsets();
  const [kopfHoehe, setKopfHoehe] = useState(0);
  /**
   * 🔴 **Wie weit die Kopfleiste in den INHALT des Stapels ragt — und das ist
   * eine andere Zahl als `kopfHoehe`.**
   *
   * `kopfHoehe` wird ab dem 2026-09-20 vom oberen BILDRAND aus gemessen: Die
   * Leiste steht in beiden Ansichten außerhalb von `SsScreen` und bringt
   * `insets.top` selbst mit. Für die Karte ist das genau richtig, sie hat
   * keinen Screen um sich.
   *
   * ⚠️ **Der Stapel steckt dagegen IN `SsScreen`, und der hat `insets.top`
   * schon abgezogen** (`edges={['top']}`). Wer dort mit `kopfHoehe` polstert,
   * polstert den Sicherheitsabstand ein zweites Mal — auf einem iPhone 16 rund
   * 59 Punkte Luft zu viel.
   *
   * *Das ist die Falle „Zwei Größen mit fast gleichem Namen sind der Fehler,
   * den man nur beim Lesen findet" — und zugleich der Grund, warum es sie als
   * eigene Zeile mit eigenem Namen gibt und nicht als `- insets.top` an zwei
   * Stellen im JSX.*
   *
   * Vorher gab es diesen Unterschied auch schon, nur unausgesprochen: Da
   * MEINTE `kopfHoehe` in der Karte etwas anderes als im Stapel, je nachdem,
   * welcher Zweig gerade lief. Jetzt hat es EINE Bedeutung und eine benannte
   * Ableitung daneben.
   */
  const kopfUeberInhalt = Math.max(0, kopfHoehe - insets.top);
  const anzahlFilter = aktiveFilter(filter);
  const filterAktiv = anzahlFilter > 0;
  // Dieselbe Ableitung, die `KarteVollbild` für die Karte benutzt — aus
  // `features/posts/filter.ts`, nicht zweimal hingeschrieben. Gebraucht für das
  // ✕ in der Kapsel (Ians Entscheidung 103).
  const gewaehltImFilter = gewaehlterBezirk(filter.bezirk);
  const zuruecksetzen = () => setFilter(FILTER_LEER);

  // Beim allerersten Öffnen liegt die Anleitungskarte oben. Erst im Effekt gesetzt
  // und nicht schon beim ersten Rendern — sonst stünde sie im vorgerenderten HTML
  // und React fände beim Hydrieren einen Unterschied (dieselbe Überlegung wie bei
  // `PrototypHinweis`, Phase 8).
  const [anleitung, setAnleitung] = useState(false);
  useEffect(() => {
    // Seit Ians Entscheidung 57 wird am Gerät wirklich nachgesehen, und `AsyncStorage`
    // antwortet erst später. **Der Anfangswert bleibt trotzdem `false` und braucht
    // KEINEN dritten Zustand** — anders als bei der Sitzung (Entscheidung 43, wo
    // `'unbekannt'` und `'aus'` zwei verschiedene Bildschirme zeigen): Hier zeichnen
    // „wird noch nachgesehen" und „schon gesehen" dasselbe, nämlich keine Karte. Ein
    // `true` als Anfangswert wäre der Fehler, den man sieht: Die Anleitung blitzte bei
    // jedem Start kurz auf, auch bei dem, der sie längst weggewischt hat.
    //
    // ⚠️ Und der Grund für das `lebt`: Ohne den Riegel setzt eine Antwort, die nach dem
    // Verlassen des Tabs eintrifft, den Zustand einer abgebauten Komponente.
    let lebt = true;
    anleitungGesehen().then((ja) => {
      if (lebt && !ja) setAnleitung(true);
    });
    return () => {
      lebt = false;
    };
  }, []);

  /**
   * Die Karte, für die gerade die Antwort-Leiste offen ist.
   *
   * 🔴 **Sie bleibt seit dem 2026-09-20 IM Stapel liegen — Ians Entscheidung.**
   *
   * Vorher wurde sie herausgefiltert, solange die Leiste offen war. Das war die
   * Umsetzung von *„Abbrechen legt die Karte zurück"*: Sie hängte aus und wieder
   * ein und kam dadurch mit sauberem Zustand zurück. Der Preis stand auf Ians
   * Bild vom 2026-09-20 — hinter der Leiste lag der NÄCHSTE Post. Er schrieb an
   * Mira über die Statik-Prüfung, dahinter „Spaziergang durch den Prater".
   *
   * Das Aushängen war ohnehin nur die halbe Miete: Die Karte war zu diesem
   * Zeitpunkt schon AUS DEM BILD geflogen (`fliegen`, x = Breite + 240), der
   * Filter räumte nur hinterher auf. Jetzt federt sie stattdessen zurück
   * (`haeltRechts` in `WischKarte`) und liegt da, bis wirklich abgeschickt ist —
   * dann fällt der Post von selbst aus dem Stapel (Regel in `wisch.ts`).
   *
   * **Damit stimmt der Satz „Abbrechen legt die Karte zurück" wörtlich**, statt
   * über zwei Umwege hergestellt zu werden.
   */
  const [antwortAuf, setAntwortAuf] = useState<FeedEintrag | null>(null);
  const karten = stapel;

  const [rueckgaengig, setRueckgaengig] = useState<FeedEintrag | null>(null);
  const uhr = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => (uhr.current ? clearTimeout(uhr.current) : undefined), []);

  function fristStarten(eintrag: FeedEintrag) {
    if (uhr.current) clearTimeout(uhr.current);
    setRueckgaengig(eintrag);
    uhr.current = setTimeout(() => setRueckgaengig(null), RUECKGAENGIG_MS);
  }

  function fristBeenden() {
    if (uhr.current) clearTimeout(uhr.current);
    setRueckgaengig(null);
  }

  /**
   * Ein Wisch ist durch. Was er bedeutet, steht NICHT hier, sondern in
   * `features/posts/wisch.ts` — dieser Screen führt nur aus, was dort entschieden
   * ist. Deshalb die Abfragen auf `WISCH_WIRKUNG`: Ändert Ian die Regel, ändert
   * sich das Verhalten mit, ohne dass jemand diesen Screen anfassen muss.
   */
  function gewischt(eintrag: FeedEintrag, richtung: WischRichtung) {
    if (richtung === 'links') {
      wegwischen(eintrag.post.id);
      if (RUECKGAENGIG_MS > 0) fristStarten(eintrag);
      return;
    }

    if (WISCH_WIRKUNG.rechts === 'sofort') {
      anfrageSenden(eintrag.post.id, grussVorschlag(eintrag.author.displayName));
      return;
    }
    if (WISCH_WIRKUNG.rechts === 'detail') {
      router.push({ pathname: '/post/[id]', params: { id: eintrag.post.id } });
      return;
    }
    setAntwortAuf(eintrag);
  }

  function anfrageAbschicken(text: string) {
    if (!antwortAuf) return;
    anfrageSenden(antwortAuf.post.id, text);
    // Erst danach schließen: Der Post fällt durch die Anfrage von selbst aus dem
    // Stapel (Regel in `wisch.ts`), also muss ihn hier niemand zusätzlich
    // wegräumen. Zwei Stellen, die dasselbe entfernen, wären eine zu viel.
    setAntwortAuf(null);
  }

  const stapelLeer = karten.length === 0 && !anleitung;
  // Liegt der Stapel wirklich da? Nur dann ist der Platz senkrecht fest — die Liste
  // und der durchgeschaute Stapel scrollen beide.
  const stapelSichtbar = ansicht === 'stapel' && !stapelLeer;
  /**
   * Zwei verschiedene Sorten „leer", und der Unterschied trägt eine Überschrift.
   *
   * `stapelLeer` heisst „durchgewischt" — die Liste darunter ist trotzdem voll,
   * denn der Stapel nimmt weg, was man schon gesehen hat (`wisch.ts`), die Liste
   * nicht. `!listeHatWas` heisst dagegen „es gibt wirklich nichts": ein zu enger
   * Filter, oder der stille Dienstag aus Abschnitt 8. Nur im ersten Fall darf
   * `StapelDurch` erscheinen.
   */
  const listeHatWas = eintraege.length > 0;

  /**
   * Das Filterfeld wird EINMAL gebaut und an zwei Stellen eingehängt.
   *
   * ── Warum es im Stapel über den Karten liegt und sie nicht wegschiebt ────────
   * Ians Entscheidung vom 2026-09-03, und sie behebt einen echten Fehler: Die Liste
   * scrollt, der Stapel nicht. Ein Feld, das den Stapel wegschiebt, nimmt ihm Platz,
   * den es nicht gibt — die Karten liegen absolut und schrumpfen dabei NICHT mit,
   * sie quellen nach oben über die Kategorien und nach unten über die Knöpfe. Am
   * Handy war der Alters-Filter dadurch hinter der Karte nicht mehr erreichbar.
   *
   * Dasselbe Muster wie beim Prototyp-Hinweis (harte Regel 22): Was nur eine Weile
   * da ist, überdeckt — es schiebt nicht.
   *
   * Der Zähler oben („Noch 8 Karten“) steht ÜBER dem Feld und zählt beim Tippen mit.
   * Er ist der Grund, warum Überdecken hier reicht: Man sieht das Ergebnis, ohne die
   * Karten zu sehen.
   */
  const filterFeld = klappe.sichtbar ? (
    // ⚠️ **Zwei Views, und beide werden gebraucht.** Das äußere trägt die animierte
    // Höhe; das innere wird gemessen. Stünde `onLayout` am äußeren, meldete es die
    // Höhe zurück, die wir ihm gerade selbst gegeben haben — die Klappe bliebe bei 0
    // stehen und niemand sähe, warum.
    <Animated.View style={klappe.stil}>
      <View onLayout={klappe.messen}>
        <FilterBereich
          filter={filter}
          setzen={setzen}
          aktiv={filterAktiv}
          zuruecksetzen={zuruecksetzen}
          meinJahrgang={ich.jahrgang}
        />
      </View>
    </Animated.View>
  ) : null;

  /**
   * Suchzeile und Kategorien werden EINMAL gebaut und in beiden Bäumen eingehängt —
   * im Screen für Stapel und Liste, im Blatt für die Karte (Ians Entscheidung 42:
   * die Filter leben IM Blatt, damit die Karte frei von Bedienelementen bleibt).
   *
   * Zwei gleich aussehende Kopien wären der schnellste Weg dahin, dass die Karte
   * eines Tages einen Filter weniger hat als die Liste — und auffallen würde es nur
   * dem, der umschaltet (dieselbe Überlegung wie bei `useStapel`, harte Regel 16).
   */

  // ⚠️ **Die Kategorien stehen seit dem 2026-09-19 IM Regler** — Ians
  // Entscheidung 90. Hier stand vorher das Gegenteil, und die Begründung war
  // gut: *„Sie sind der meistbenutzte Filter und das Erkennungszeichen der App
  // — eingeklappt wäre der Feed eine Liste ohne Gesicht."*
  //
  // **Was die Entscheidung dagegen setzt, ist eine andere Frage als die alte.**
  // Die alte lautete „welcher Filter ist wichtig genug für eine eigene Reihe?".
  // Ians lautet: *„ich würde gerne oben und unten ein Dings haben, dass es
  // einfach schlichter aussieht … es muss ja ein Problem lösen."* Drei Reihen
  // über einem Wischstapel sind das Problem; welche der drei am nützlichsten
  // ist, beantwortet es nicht.
  //
  // 🔴 **Der Preis ist benannt und Ian vorzulegen:** Wer den Feed öffnet, sieht
  // nicht mehr auf einen Blick, welche Kategorien es gibt. Die sechs Farben
  // sind einen Tipp entfernt statt sichtbar. Das ist eine
  // Verhaltensänderung, kein Umräumen — sie gehört ihm am BILD gezeigt, bevor
  // sie bleibt.

  /**
   * Der Umschalter und der runde „Posten"-Knopf — Ians Entscheidung 41.
   *
   * Seine Vorgabe war „Posten auf die Ebene von Stapel · Liste · Karte". Als
   * VIERTES FELD im Umschalter wäre das falsch gewesen: Die ersten drei wechseln
   * eine Ansicht und bleiben gedrückt, „Posten" öffnet einen anderen Screen und
   * springt zurück. Ein runder Knopf DANEBEN steht auf derselben Ebene und sagt
   * durch seine Form, dass er etwas anderes tut. **Das Muster stammt von Ian
   * selbst** — aus dem BierBuddy-Screenshot, den er geschickt hat.
   *
   * Auch diese Zeile gibt es nur einmal: In der Kartenansicht schwebt sie über der
   * Karte (Entscheidung 44), sonst steht sie im Fluss.
   */
  const umschalter = (
    style: StyleProp<ViewStyle>,
    aufGlas?: boolean,
    breite?: Animated.AnimatedInterpolation<number>,
  ) => (
    <SsSegment<Ansicht>
      value={ansicht}
      onChange={setAnsicht}
      style={style}
      // `aufGlas` nur dort, wo wirklich Glas darunter liegt. Im Fluss bleibt die
      // Auswahl eine deckende Fläche; eine Aufhellung um 22 % wäre auf `surface`
      // kaum zu sehen.
      //
      // 🔴 Seit Ians Entscheidung 99 ist `GLAS_AN` false, also greift das nirgends
      // mehr — die Kapseln sind matt, und auf matt ist die deckende Pille richtig.
      // **Die Stelle bleibt trotzdem stehen und wird nicht gelöscht:** Sie hängt am
      // selben Schalter wie das Glas, kommt also mit ihm zurück. Ein `aufGlas`, das
      // von Hand nachgezogen werden müsste, wäre genau die Sorte Wissen, die beim
      // Umlegen vergessen wird.
      aufGlas={aufGlas && GLAS_AN}
      // 🔴 Die Innenbreite als ANIMIERTER Wert, wenn die Kapsel sie fährt. Damit
      // rechnet die Pille aus demselben Takt, statt sich pro Bild neu zu messen —
      // die Begründung steht bei `breite` in `SsSegment`. Ians „sie springt so
      // komisch und ist nicht smooth" kam genau von der Messung.
      breite={breite}
      // Ians Entscheidung 54 (Phase 19f): drei Zeichen statt drei Woerter. Er hatte
      // den Stapel zuerst als Vollbild beschrieben („alles weg, nur Zurueck-Pfeil,
      // Karten und die Leiste unten") und auf die Frage, wie man dann zur Karte
      // kommt, die vorsichtigste der drei Moeglichkeiten gewaehlt: Der Umschalter
      // bleibt, er wird nur leiser.
      //
      // `label` bleibt stehen und ist nicht tot — SsSegment macht daraus das
      // `accessibilityLabel`. **Nebengewinn:** Damit ist das „Sta…"-Problem zum
      // vierten Mal erledigt (Phase 11, 18a, 19b), diesmal endgueltig — ein Zeichen
      // kann nicht abgeschnitten werden.
      options={[
        { wert: 'stapel', label: 'Stapel', icon: 'stapel' },
        { wert: 'karte', label: 'Karte', icon: 'karte' },
      ]}
    />
  );

  /**
   * Die EINE Kopfleiste (Ians Entscheidung 105).
   *
   * 🔴 **Hier standen bis zum 2026-09-20 ZWEI Bausteine** — `ansichtZeile` für die
   * Karte und `kopfKapsel` für den Stapel. Sie zeichneten dieselbe Leiste an
   * derselben Stelle, waren aber verschieden breit gebaut, und beim Umschalten
   * wurde die eine gegen die andere getauscht. **Das war das Springen, das Ian
   * gesehen hat.** Der Volltext steht am Kopf von `KopfLeiste`.
   *
   * Sie wird AUSSERHALB beider Bäume gerendert — sonst gäbe es sie beim Wechsel
   * wieder zweimal, und der Umbau wäre umsonst.
   */
  const kopfLeiste = (
    <KopfLeiste
      aufKarte={ansicht === 'karte'}
      umschalter={umschalter}
      filterOffen={filterOffen}
      anzahlFilter={anzahlFilter}
      filterUmschalten={() => setFilterOffen((o) => !o)}
      gewaehlt={gewaehltImFilter}
      abwaehlen={() => setzen('bezirk', BEZIRK_ALLE)}
      onHoehe={setKopfHoehe}
    />
  );

  /**
   * Der Wischstapel — **einmal gebaut, an zwei Stellen eingehängt** (Phase 19i).
   *
   * Am Start steht er unter Umschalter, Suche und Kategorien; im Bezirks-Vollbild
   * steht er allein. Es sind dieselben Karten aus derselben Quelle: `useStapel`
   * filtert schon nach `filter.bezirk`, den die Karte gesetzt hat (harte Regel 50),
   * also muss hier nichts ein zweites Mal gefiltert werden. **Eine zweite Kopie
   * wäre der schnellste Weg dahin, dass das Vollbild eines Tages andere Karten
   * zeigt als der Start** — dieselbe Überlegung wie bei `useStapel` selbst
   * (harte Regel 16).
   *
   * `anleitung` bekommt nur der Start: Die Anleitungskarte erklärt das Wischen beim
   * allerersten Öffnen der App. Im Bezirks-Vollbild ist man schon dreimal
   * abgebogen — dort wäre sie eine Karte, die im Weg steht (harte Regel 63).
   */
  const stapelBaum = (mitAnleitung: boolean) => (
    <WischStapel
      eintraege={karten}
      anleitung={mitAnleitung && anleitung}
      onAnleitungWeg={() => {
        anleitungMerken();
        setAnleitung(false);
      }}
      onWeg={gewischt}
      // Was ein Rechts-Wisch tut, steht in `wisch.ts` und nicht hier. Bei
      // `'leiste'` ist nach dem Wisch noch nichts entschieden — also bleibt die
      // Karte liegen, statt wegzufliegen.
      haeltRechts={WISCH_WIRKUNG.rechts === 'leiste'}
      onAntippen={(e) => router.push({ pathname: '/post/[id]', params: { id: e.post.id } })}
      fussnote={
        rueckgaengig ? (
          <Rueckgaengig
            eintrag={rueckgaengig}
            onZurueck={() => {
              wischRueckgaengig(rueckgaengig.post.id);
              fristBeenden();
            }}
          />
        ) : undefined
      }
      blatt={mitAnleitung ? filterFeld : undefined}
    />
  );

  const antwortLeiste = antwortAuf ? (
    <AntwortLeiste
      eintrag={antwortAuf}
      onAbbrechen={() => setAntwortAuf(null)}
      onSenden={anfrageAbschicken}
    />
  ) : null;

  /**
   * ── Das Bezirks-Vollbild — Ians Entscheidungen 65 und 66 (Phase 19i) ─────────
   *
   * *„Würde die Leiste weglassen und es so machen, dass man direkt, wenn man auf
   * einen Bezirk draufklickt, auf ein Fenster kommt, auf den Stapel."* — und
   * dazu: *„Sport und so weg, Suchleiste und Filter weg, Posten weg und drei Icons
   * auch weg — also man sollte nur das unten sehen können."* (Rückgefragt und
   * bestätigt: **nur auf diesem Fenster**; der Startbildschirm behält alles.)
   *
   * Das ist harte Regel 63 in Reinform: Man ist hier, weil man einen Bezirk gewählt
   * hat, und die Entscheidung lautet „hingehen oder nicht". Suche, Kategorien und
   * Filter beantworten eine andere Frage — die hat man eine Ebene höher schon
   * beantwortet.
   *
   * **Zwei Dinge stehen trotzdem da, und beide stehen im zweiten Halbsatz von
   * Entscheidung 50** (*„wenn die Person etwas wissen will, dann soll's auch einfach
   * für sie sein"*):
   *   • **Der Zurück-Pfeil.** Ein Vollbild ohne Rückweg ist eine Sackgasse. 44 × 44
   *     wie überall (Entscheidung 52) — und mit eigenem `onPress`, weil „zurück"
   *     hier kein Screen-Wechsel ist, sondern das Schließen dieses Zustands.
   *   • **Die Zeile „1100 Wien · 3 Posts."** Ohne sie sind es dieselben Karten wie
   *     am Start, nur ohne Bedienung — siehe `bezirkUeberschrift()`.
   *
   * `SsScreen tabScreen` bringt den Rest mit, und zwar denselben wie auf jedem
   * anderen Screen: SafeArea oben, und unten den Abstand zur schwebenden Tab-Kapsel
   * (harte Regel 62 — *was fest steht, weicht ihr aus*; der Stapel hat absolut
   * positionierte Kinder, deshalb ist es dort ein `marginBottom`).
   */
  if (ansicht === 'karte' && bezirkStapel) {
    return (
      <SsScreen tabScreen keyboard scrolltSelbst contentStyle={styles.seite}>
        <View style={styles.bezirkKopf}>
          <SsBack label={t('feed.zurueckKarte')} onPress={() => setBezirkStapel(false)} />
          <SsText variant="label" numberOfLines={1} style={styles.bezirkTitel}>
            {bezirkUeberschrift(filter.bezirk, eintraege.length)}
          </SsText>
        </View>

        <View style={styles.stapelBereich}>
          {karten.length > 0 ? (
            stapelBaum(false)
          ) : (
            // Kein `StapelDurch`: Das ist eine ÜBERSCHRIFT über einer Liste und
            // verspricht sie im Text (harte Regel 41) — hier steht keine darunter.
            // Der Ausweg ist deshalb der Rückweg zur Karte, nicht ein Filter.
            <View style={styles.leer}>
              <SsText variant="heading">{t('stapel.allesDurch')}</SsText>
              <SsText variant="caption" color={colors.inkSoft} style={styles.bezirkLeerText}>
                {t('stapel.bezirkDurch')}
              </SsText>
              <SsButton
                label={t('feed.zurueckKarte')}
                icon="karte"
                variant="ghost"
                onPress={() => setBezirkStapel(false)}
                style={styles.leerKnopf}
              />
            </View>
          )}
        </View>

        {antwortLeiste}
      </SsScreen>
    );
  }

  // ── Die Kartenansicht: ein eigener Baum (Phase 19e) ─────────────────────────
  //
  // Seit dem 2026-09-20 steht sie NEBEN dem anderen Baum statt an seiner Stelle —
  // siehe `karteBleibt` oben. Sichtbar ist trotzdem immer nur eine von beiden.
  const karteBaum = karteBleibt ? (
    <View style={[styles.vollbild, ansicht !== 'karte' && styles.ausgeblendet]}>
      <KarteVollbild
        zaehlung={proBezirk}
        ohneBezirk={ohneBezirk}
        filter={filter}
        setzen={setzen}
        eintraege={eintraege}
        filterAktiv={filterAktiv}
        zuruecksetzen={zuruecksetzen}
        kopfHoehe={kopfHoehe}
        oeffneBezirk={() => setBezirkStapel(true)}
      />
    </View>
  ) : null;

  // ⚠️ **Als LETZTES Kind in beiden Zweigen, und das ist kein Stil.** Ohne
  // `zIndex` liegt in React Native oben, was später im Baum steht — ein
  // `zIndex` wäre die zweite Wahrheit über dieselbe Sache.
  /**
   * 🔴 **EINE Rückgabe für Karte UND Stapel — Ians Befund vom 2026-09-20:**
   * *„die Animation ist nur zwei Frames lang, also es ist nicht wirklich eine
   * Animation, und das ist direkt wenn man auf den Stapel klickt."*
   *
   * ── Was hier vorher stand und warum es die Animation zerstörte ────────────
   * Es gab ZWEI Rückgaben. In der einen war die Kopfleiste das zweite Kind des
   * Fragments, in der anderen steckte sie tief in `SsScreen`:
   *
   *     Karte   <>{karteBaum}<View>{kopfLeiste}</View></>
   *     Stapel  <>{karteBaum}<SsScreen> … <View>{kopfLeiste}</View> … </SsScreen></>
   *
   * React vergleicht Kind für Kind. An Position 2 stand einmal ein `View` und
   * einmal ein `SsScreen` — **zwei verschiedene Typen, also wirft React den
   * ganzen Teilbaum weg und baut ihn neu**, `KopfLeiste` mit. Und beim Neubau
   * gilt `useState(() => new Animated.Value(aufKarte ? 1 : 0))`: Der Taktgeber
   * **startet direkt am Ziel**. Das `useEffect` animiert danach von 1 nach 1 —
   * es bewegt sich nichts. Dazu stehen `zeile`, `filterNatur` und
   * `abwaehlNatur` wieder auf 0, `bereit` ist also für ein, zwei Bilder false,
   * und es gibt überhaupt keine Breiten. Genau die zwei Frames.
   *
   * 🔴 **Das war die Wurzel der vier gescheiterten Runden zu Entscheidung 105.**
   * Tempo, Pillenbreite und Kapselbreite waren jede für sich richtig zu
   * reparieren — sie liefen nur alle auf einem `Animated.Value`, der beim
   * Umschalten jedes Mal neu geboren wurde und schon am Ziel stand. *Zweimal
   * die STILLE repariert, bevor die URSACHE gesucht war* (FALLEN.md).
   *
   * ── Warum `null` und nicht zwei Rückgaben ─────────────────────────────────
   * Die Kinder dieses Fragments stehen fest an ihrer Stelle: `karteBaum`, der
   * Stapel-Baum, die Kopfleiste. Ein `null` an Platz zwei RÄUMT den Stapel ab,
   * ohne Platz drei zu verschieben — und nur darauf kommt es an.
   *
   * ⚠️ **Der Bezirks-Zweig weiter oben bleibt eine eigene Rückgabe.** Dort gibt
   * es die Kopfleiste gar nicht (harte Regel 67), also auch keine Bewegung,
   * die ein Neubau zerstören könnte.
   */
  return (
    <>
      {karteBaum}

      {ansicht === 'karte' ? null : (
      <>
      {/* `keyboard` steht hier wegen der Antwort-Leiste: Sie klebt am unteren Rand,
          und auf iOS läge sie sonst unter der Tastatur. Fest gesetzt und nicht
          umgeschaltet — ein Wechsel würde den ganzen Inhalt neu einhängen und
          mitten in der Wischbewegung den Stapel zurücksetzen. */}
      <SsScreen tabScreen keyboard scrolltSelbst contentStyle={styles.seite}>
      {/* Im Fluss, wo darunter etwas scrollt. Im Stapel liegt dasselbe Feld weiter
          unten als Blatt über den Karten — Begründung bei `filterFeld` oben.

          `marginTop` in Höhe des Kopfes: Hier soll nichts UNTER die Kapsel laufen.
          Ein Filterfeld, das halb hinter Glas beginnt, ist nicht schön, sondern
          unlesbar — der Stapel darunter ist der Fall, der das Glas trägt. */}
      {!stapelSichtbar ? (
        <View style={[styles.filterImFluss, { marginTop: kopfUeberInhalt }]}>{filterFeld}</View>
      ) : null}

      {stapelLeer ? (
        // Ians Regel, Phase 11: Am Ende des Stapels steht keine leere Fläche,
        // sondern die Liste des schon Gesehenen.
        //
        // `listeHatWas` ist die Bedingung dafür, dass dieser Satz überhaupt stimmt.
        // StapelDurch ist eine ÜBERSCHRIFT über einer Liste — es sagt „unten steht
        // alles weiter" bzw. „mit einem anderen Filter liegen noch Karten da". Ist
        // die Liste darunter auch leer, zeigt der Screen zwei Leer-Zustände
        // übereinander, die einander widersprechen: Die Überschrift verspricht eine
        // Liste, die es nicht gibt, und darunter sagt `LeererFeed` dasselbe noch
        // einmal — mit dem Ausweg, den die Überschrift nicht hat. Gefunden am
        // 2026-09-03 beim Durchklicken auf 360 × 600, Suche nach einem Wort, das
        // in keinem Post vorkommt.
        <>
          {listeHatWas ? (
            <StapelDurch filterAktiv={filterAktiv} />
          ) : null}
          <FeedListe eintraege={eintraege} filterAktiv={filterAktiv} zuruecksetzen={zuruecksetzen} />
        </>
      ) : (
        // 🔴 **Hier entsteht das Glas.** Der Stapel beginnt eine Spur HÖHER als die
        // Kapsel endet, also läuft die oberste Karte unter ihr hindurch — und erst
        // damit hat das Material etwas zu brechen. Genau das Bild aus Ians Vorbild
        // (`vorbild-liquid-glass-bierbuddy.png`, Entscheidung 41/43): eine Karte,
        // die unter der Leiste verschwindet, statt vor ihr aufzuhören.
        //
        // ⚠️ Die Überlappung ist bewusst klein. Die `PostCard` bringt oben ihre
        // eigene Polsterung mit; verschwände mehr als dieser Rand, wäre Inhalt
        // verdeckt statt Fläche.
        <View style={[styles.stapelBereich, { paddingTop: Math.max(0, kopfUeberInhalt - spacing.md) }]}>
          {stapelBaum(true)}
        </View>
      )}

        {antwortLeiste}
      </SsScreen>
      </>
      )}

      {/* ⚠️ **Als LETZTES Kind, und das ist kein Stil, sondern die Reihenfolge.**
          Ohne `zIndex` liegt in React Native oben, was später im Baum steht. Ein
          `zIndex` wäre die zweite Wahrheit über dieselbe Sache — dieselbe
          Überlegung wie bei der Pille in `SsSegment`.

          🔴 **Und es ist die EINE Stelle, an der die Kopfleiste steht** — in der
          Karte wie im Stapel, unverändert über den Wechsel hinweg. Nur deshalb
          überlebt ihr Taktgeber den Umschalter und bewegt sich wirklich, statt
          neu geboren zu werden und schon am Ziel zu stehen. Die Begründung im
          Volltext steht bei der Rückgabe oben.

          Der obere Sicherheitsabstand kommt jetzt aus `KopfLeiste` selbst: Hier
          gibt es keinen `SsScreen` mehr darüber, der ihn tragen könnte. */}
      <View style={styles.kopfSchwebend}>{kopfLeiste}</View>
    </>
  );
}

/**
 * „Posten" als runder Knopf — Ians Entscheidung 41.
 *
 * ── Warum kein `SsButton` ────────────────────────────────────────────────────
 * Der bringt einen Text mit, und genau der soll hier weg: Ein Kreis mit einem
 * Symbol steht neben dem Umschalter, ohne ihn schmaler zu machen. Damit er sich
 * anfühlt wie jeder andere Knopf, nimmt er `useDruck()` aus dem Theme — seit Phase
 * 20.10 dieselbe Quelle wie `SsButton` und nicht mehr dieselbe Rechnung daneben.
 *
 * ── Warum `stift` und nicht `plus` ───────────────────────────────────────────
 * Weil es in dieser App überall der Stift ist: `StapelDurch`, `LeererFeed` und der
 * frühere Kopf tragen alle „Posten" mit `stift`. Ein Plus wäre für sich genommen
 * verständlicher, aber es wäre das zweite Zeichen für dieselbe Sache — und wer den
 * Kreis einmal gedrückt hat, weiß es ohnehin. Der `accessibilityLabel` sagt es
 * jenen, die das Symbol nicht sehen.
 */
function PostenKnopf() {
  const druck = useDruck();

  return (
    <DruckFlaeche
      onPress={() => router.push('/create')}
      {...druck.griff}
      accessibilityRole="button"
      accessibilityLabel={t('feed.posten')}
      // `druck.stil` zuletzt — sonst überschriebe der Style die Animation still.
      style={[styles.posten, druck.stil]}>
      <SsIcon name="stift" size={20} color={accent.onBase} />
    </DruckFlaeche>
  );
}

/** Die Liste — bis Phase 11 der ganze Screen, jetzt eine von zwei Ansichten. */
function FeedListe({
  eintraege,
  filterAktiv,
  zuruecksetzen,
  randUnten = 0,
}: {
  eintraege: FeedEintrag[];
  filterAktiv: boolean;
  zuruecksetzen: () => void;
  /**
   * Zusätzlicher Platz unter der letzten Karte — im Blatt auf der Karte die Höhe
   * der schwebenden Tab-Kapsel (Phase 19g). Am Scroll-INHALT, nicht an der Fläche:
   * Der Inhalt soll unter dem Glas durchlaufen, nur nicht darunter enden.
   */
  randUnten?: number;
}) {
  // Seit Phase 20.11 gibt es hier KEINEN `ItemSeparatorComponent` mehr: Jeder Post
  // bringt seine feine Linie selbst mit (`umgebung="liste"`). Eine Lücke dazwischen
  // würde die Linien freistellen, statt sie zwei Einträge trennen zu lassen — und der
  // Abstand steckt bereits in der Polsterung des Posts.
  return (
    <FlatList
      data={eintraege}
      keyExtractor={(e) => e.post.id}
      renderItem={({ item }) => (
        <PostCard
          eintrag={item}
          onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.post.id } })}
        />
      )}
      style={styles.listeAussen}
      contentContainerStyle={[styles.liste, randUnten > 0 && { paddingBottom: randUnten }]}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<LeererFeed filterAktiv={filterAktiv} zuruecksetzen={zuruecksetzen} />}
    />
  );
}

/**
 * Die dritte Ansicht: Wien als Karte — seit Phase 19e im Vollbild.
 *
 * Phase 19b, aus Leopolds Wunsch. **Sie ist kein eigener Ort** — dieselben Posts,
 * dieselben sechs Filter, nur nach Bezirken angeordnet (harte Regel 16, dieselbe
 * Begründung wie beim Stapel). Der Umschalter hat deshalb eine dritte Stufe bekommen
 * und die Tab-Leiste keinen vierten Tab: Ein eigener Tab hätte den Hauptfeed
 * geleert, und ein leerer Hauptfeed ist am Anfang das größere Problem (dasselbe
 * Argument wie bei den Gruppen, harte Regel 34).
 *
 * ── Was Phase 19e daran geändert hat, und warum ───────────────────────────────
 * Bis 19d war die Karte ein Element im Fluss: 28 % der Schirmhöhe, darunter eine
 * Zeile und darunter die Liste. Ians Urteil nach dem BENUTZEN war eindeutig — er
 * wollte die Karte sehen, nicht ein Kartenfeld. Jetzt füllt sie den Schirm, und die
 * Liste liegt in einem ziehbaren Blatt darüber (Entscheidung 40).
 *
 * ── Die Blase war weg und ist wieder da (Entscheidung 46, dann 57) ───────────
 * In 19e-1 nahm Entscheidung 46 die Blase aus der Anzeige: Das Blatt beantworte
 * dieselbe Frage vollständig. Am 2026-09-08, nach dem Durchgang am eigenen Handy,
 * hat Ian sie zurückgeholt (Entscheidung 57): *„Wenn man auf einen Bezirk klickt,
 * sollten über dem Finger die verschiedenen Posts kommen. Und wenn's mehrere sind,
 * kann man draufklicken — dann kommt das Blatt und man kann sich's genau anschauen."*
 *
 * **Der Weg BLASE → BLATT ist das Neue daran**, und er ist der Grund, warum die
 * beiden Entscheidungen einander nicht widersprechen: Die Blase ist die kurze
 * Antwort am Ort des Fingers, das Blatt die lange. In 19c führte „alle 3 ansehen" in
 * die LISTENANSICHT — das war richtig, solange es kein Blatt gab.
 *
 * **Zurückgeholt hat es EIN Aufruf**, genau wie harte Regel 51 es am 2026-09-07
 * versprochen hat: *„Ein Aufruf holt sie zurück. Wer sie löscht, wirft sie weg."*
 * Elf Tage später ist der Fall eingetreten. Was trotzdem Arbeit war: Der Anker
 * rechnete seinen freien Platz gegen die ganze Kartenfläche statt gegen den freien
 * Streifen zwischen Leiste und Blatt — im Vollbild ist das ein Unterschied, und
 * solange der Slot leer stand, fiel er niemandem auf.
 *
 * ── Der Tipp setzt den GANZ NORMALEN Bezirksfilter ───────────────────────────
 * Und das ist der Grund, warum die Karte so billig war: Es gibt keinen zweiten
 * Zustand „auf der Karte gewählt" neben `filter.bezirk`. Wer einen Bezirk antippt
 * und dann auf „Liste" umschaltet, sieht dieselbe Auswahl weiter — das ist keine
 * Zugabe, sondern das, was harte Regel 26 verlangt.
 *
 * ── Die Karte bleibt sichtbar, auch wenn nichts los ist ─────────────────────
 * **Ians Entscheidung 93 vom 2026-09-19**, und sie geht gegen den Absatz, der hier
 * stand. Er lautete: *„Eine Karte ohne Posts ist nicht leer, sie ist 23 graue
 * Flächen — sie sieht kaputt aus, nicht ruhig."* Deshalb wurde bei `nichtsDa` gar
 * keine Karte gezeichnet, sondern nur ein Satz mit Ausweg.
 *
 * **Ian hat genau das am Gerät gesehen und es als Fehler gelesen:** *„ich würde
 * gerne, dass man die Karte auch sieht, wenn nichts los ist."* Sein Feed ist leer,
 * also bekam er die Kartenansicht ohne Karte — ein Bildschirm, der nach seinem
 * eigenen Namen nicht aussieht. **Eine Ansicht, die ihren Gegenstand versteckt,
 * sobald er leer ist, beantwortet die Frage „wo ist gerade was los?" gar nicht** —
 * sie beantwortet sie mit „nirgends", und das ist eine Auskunft, für die man Wien
 * sehen darf.
 *
 * ⚠️ **Der alte Einwand ist damit NICHT widerlegt, sondern eingepreist.** Er hatte
 * zwei Teile, und nur einer fällt weg:
 *
 *   · *„sieht kaputt aus"* — das ist Ians Urteil, und er hat es getroffen.
 *   · *„zwei Antworten auf dieselbe Frage"* — **das gilt weiter und ist der Grund
 *     für die Bauform.** `LeererFeed` steht hier NICHT: Er ist ein
 *     Vollflächen-Zustand mit 46-pt-Icon und würde Wien verdecken, also wieder
 *     ersetzen statt ergänzen. Stattdessen `KarteNichtsLos` — EINE Kapsel unten,
 *     eine Zeile, ein Ausweg. Dieselben zwei Fälle wie in `LeererFeed`
 *     (Filter zu eng · wirklich nichts los), dieselben zwei Antworten, nur in der
 *     Form, die neben eine Karte passt statt an ihre Stelle.
 *
 * Und harte Regel 51 gilt unverändert: Die Kapsel ist ein GESCHWISTER der Karte,
 * kein Kind. Die Kartenfläche hat `overflow: hidden` und einen `PanResponder`, der
 * jede Berührung an sich zieht — ein Ausweg-Knopf darin wäre halb abgeschnitten
 * und nicht antippbar.
 */
function KarteVollbild({
  zaehlung,
  ohneBezirk,
  filter,
  setzen,
  eintraege,
  filterAktiv,
  zuruecksetzen,
  kopfHoehe,
  oeffneBezirk,
}: {
  zaehlung: Record<string, number>;
  /**
   * Wie viele Posts keinen Bezirk haben. Seit Phase 19i wird die Zahl hier nur noch
   * gebraucht, um zu erkennen, dass überhaupt etwas da ist (`nichtsDa`) — der Chip
   * dazu ist mit dem Blatt weggefallen. Warum das Ians Entscheidung 31 nicht bricht,
   * steht im Kopfkommentar dieser Funktion.
   */
  ohneBezirk: number;
  filter: FeedFilter;
  setzen: <K extends keyof FeedFilter>(feld: K, wert: FeedFilter[K]) => void;
  eintraege: FeedEintrag[];
  filterAktiv: boolean;
  zuruecksetzen: () => void;
  /**
   * Wie hoch die Kopfleiste ist — GEMESSEN, von `KopfLeiste` gemeldet.
   *
   * 🔴 Hier stand bis zum 2026-09-20 `ansichtZeile`, also die Leiste SELBST.
   * Seit Entscheidung 105 steht sie außerhalb beider Bäume, und dieser
   * Bildschirm braucht von ihr nur noch eine Zahl.
   */
  kopfHoehe: number;
  /** Ians Entscheidung 65: Aus der Blase heraus ins Bezirks-Vollbild. */
  oeffneBezirk: () => void;
}) {
  /**
   * Wie hoch die schwebende Tab-Leiste ist (Phase 19e-2).
   *
   * Sie nimmt seit dem Glas keinen Platz mehr im Layout weg — **und genau das ist
   * hier der Gewinn:** Die Karte läuft unter ihr durch, statt an ihr aufzuhören.
   * Das Blatt darf das nicht, sein Griff wäre sonst unerreichbar; deshalb geht die
   * Zahl an zwei Stellen hin, mit zwei verschiedenen Bedeutungen (siehe unten).
   */
  /**
   * ⚠️ **Hier stand bis zum 2026-09-19 `useTabRand()`, und das war der Fehler.**
   *
   * Es gibt zwei Zahlen, die auf Web gleich sind und auf iOS auseinanderlaufen:
   *
   *   `useTabRand()`         was Inhalt im FLUSS an Rand braucht. Auf iOS **0**,
   *                          weil Apples Leiste ihre Insets selbst in den
   *                          Scroll-Container einträgt — das ist richtig.
   *   `useTabUeberdeckung()` wie hoch die Leiste WIRKLICH steht. Wer absolut
   *                          darüber liegt, braucht diese.
   *
   * Harte Regel 62 trennt genau das: *Was scrollt, scrollt unter das Glas; was
   * fest steht, weicht ihm aus.* **Dieser Screen hat nur festes** — die
   * Kartenfläche und die „nichts los"-Kapsel darüber. Mit der 0 klebte die
   * Kapsel in der Tab-Leiste und die Karte zoomte nach Niederösterreich hinaus;
   * beides hat Ian am Gerät gesehen, bevor es jemand im Code gefunden hat.
   */
  const tabUeberdeckung = useTabUeberdeckung();
  const bezirk = filter.bezirk;

  /**
   * Wie viel die schwebende Leiste oben belegt — **gemessen, nicht gerechnet.**
   *
   * Sie ist die Höhe des Umschalters plus der Sicherheitsabstand darüber, und
   * beides hängt am Gerät; die Karte zentriert Wien darunter (`randOben`). Bis
   * Phase 19i ging dieselbe Zahl noch an das Blatt (`maxOben`), damit es nicht
   * unter die Pille fuhr — das Blatt gibt es nicht mehr, der Grund für die Messung
   * bleibt.
   */
  // 🔴 Bis zum 2026-09-20 maß dieser Bildschirm die Leiste selbst. Seit
  // Entscheidung 105 gibt es sie hier gar nicht mehr.
  //
  // ⚠️ **Ohne `insets.top` davor — die Berichtigung eines Fehlers, den kein
  // Typcheck sieht.** `KopfLeiste` trägt den oberen Sicherheitsabstand SELBST
  // (seit dem 2026-09-20 in beiden Ansichten, siehe `kopfUeberInhalt`). Er
  // steckt also schon in der gemessenen Höhe; ihn hier noch einmal zu addieren
  // hätte Wien ein zweites Mal nach unten geschoben — Ians Befund verdoppelt.
  const leisteBelegt = kopfHoehe;

  const nichtsDa = Object.keys(zaehlung).length === 0 && ohneBezirk === 0;
  const gewaehlt = gewaehlterBezirk(bezirk);

  /**
   * Ians Entscheidung 49: **Ein Tipp auf denselben Bezirk hebt die Auswahl auf.**
   *
   * Seine Worte: *„wenn man dann noch mal auf diesen Bezirk klickt, dass es dann
   * weggeht, weil das kann echt stören."* Bis 19d klebte eine einmal getroffene
   * Auswahl — der Kommentar an dieser Stelle argumentierte sogar dafür („auf einer
   * Karte heißt nochmal draufdrücken *genauer hinsehen*"). Das war nicht falsch
   * gedacht, aber es hat den Fall übersehen, den Ian beim BENUTZEN traf: Man
   * kommt ohne Umweg nicht mehr zu ganz Wien zurück.
   *
   * 🔴 **Ians Entscheidung 102 (2026-09-20): Der Tipp geht DIREKT in den Stapel.**
   * Seine Worte: *„dass man nicht mehr sieht, wie viele Anfragen da sind, sondern
   * eher einfach draufklickt und dann redirected wird … dass man so swipen kann
   * eben direkt."* Vorher war es zweistufig: tippen wählte aus, die Karte blieb
   * stehen, und erst „Alle" in der Blase öffnete den Stapel.
   *
   * ── Was dadurch WEGFÄLLT, und warum es ersetzt ist ──────────────────────────
   * **Der zweite Tipp auf denselben Bezirk war seit Phase 19i der einzige Weg
   * zurück zu ganz Wien** (Entscheidung 49). Er kann es nicht mehr sein: Der erste
   * Tipp verlässt die Karte, also kommt nie ein zweiter auf derselben Ansicht.
   * Deshalb hebt hier auch nichts mehr auf — ein Tipp auf den schon gewählten
   * Bezirk geht wieder hinein, und das ist die Lesart, die zu „draufklicken und
   * redirected werden" gehört.
   *
   * **Der Ersatz ist Ians Entscheidung 103: das ✕ in der Kapsel** (`BezirkAbwaehlen`
   * in `ansichtZeile`). Es war schon einmal da — bis Phase 19i im Blattkopf,
   * ausdrücklich „zusätzlich und nicht ersatzweise", weil ein zweiter Tipp auf einen
   * 14 × 11 px großen Bezirk (die Josefstadt, gemessen in 19b) nicht zuverlässig zu
   * treffen ist. Mit dem Blatt fiel es weg, **der Grund dafür war nie erledigt** —
   * nur der Ort. Jetzt hat es einen neuen.
   *
   * ⚠️ **Die Blase ist damit NICHT tot** (Entscheidung 57, harte Regel 51). Sie
   * hängt an `gewaehlt`, nicht am Tippen: Kommt man aus dem Stapel auf die Karte
   * zurück, steht der Bezirk noch gewählt da und sie zeigt seine Posts.
   *
   * **Harte Regel 50 gilt weiter:** Was gewählt ist, IST der Bezirksfilter — das
   * Aufheben setzt `filter.bezirk`, nicht eine eigene Variable daneben.
   */
  const bezirkTippen = (plz: string | null) => {
    if (plz === null) {
      setzen('bezirk', BEZIRK_ALLE);
      return;
    }
    setzen('bezirk', { kind: 'einer', plz });
    oeffneBezirk();
  };

  return (
    // KEIN `SsScreen`: Der bringt Seitenrand und `edges={['top']}` mit, und genau
    // die stehen einer randlosen Karte im Weg (Ians Entscheidung 44). Der
    // Sicherheitsabstand wandert deshalb an die schwebende Leiste — sie ist das
    // einzige hier, das ihn braucht.
    <View style={styles.vollbild}>
      {/* ⚠️ **Hier stand bis zum 2026-09-19 ein `nichtsDa ? … : …`**, das die Karte
          gegen `LeererFeed` TAUSCHTE. Ians Entscheidung 93 dreht das um: Die Karte
          steht immer, der Ausweg kommt als Kapsel darüber (`KarteNichtsLos`, weiter
          unten in diesem Baum). Die Begründung steht im Kopfkommentar. */}
      <SsKarte
          zaehlung={zaehlung}
          gewaehlt={gewaehlt}
          onWaehlen={bezirkTippen}
          fuellt
          // Seit Phase 19i gibt es kein Blatt mehr, das von unten verdeckt —
          // übrig bleibt die schwebende Tab-Kapsel. Wien wird zwischen ihr und
          // der Leiste oben zentriert, und **die Apple-Nennung weicht ihr aus**
          // (`NENNUNG_MIN_KARTE`, Phase 19g): Eine Nennung, die niemand sehen
          // kann, ist keine. Dass die Karte selbst unter der Kapsel durchläuft,
          // bleibt gewollt (harte Regel 62, letzter Absatz).
          // 🔴 **`tabUeberdeckung`, nicht `tabRand` — das behebt einen Fehler,
          // den Ian am 2026-09-19 fotografiert hat.** Die Karte stand viel zu
          // weit draußen: Stockerau, Mödling, Schwechat im Bild, Wien ein
          // Fleck. Genau der Zustand, den der Effekt bei `verdeckt` in
          // `SsAppleKarte.native.tsx` beschreibt (*„Brünn, Bratislava und
          // St. Pölten"*) — und den er beheben SOLLTE.
          //
          // **Warum er es nicht mehr tat:** `verdeckt` wird aus `randUnten`
          // gerechnet, und `useTabRand()` gibt seit Entscheidung 85
          // (NativeTabs) auf iOS **0** zurück. Damit war `verdeckt` konstant 0,
          // der Effekt lief nur EINMAL — beim `bereit`-Wechsel — und wenn
          // dieser eine `animateToRegion` vor `onMapReady` verpufft (die
          // dokumentierte Falle), kam nie ein zweiter. Mit der JS-Leiste sprang
          // `randUnten` von 0 auf ~100, sobald die Höhe bekannt war, und der
          // zweite Lauf hat Wien eingefangen.
          randUnten={tabUeberdeckung}
          randOben={leisteBelegt}
          // Ians Entscheidung 57. Der Slot liegt als Geschwister ÜBER der
          // Kartenfläche (harte Regel 51) — die Karte selbst weiß nichts von
          // Posts, sie gibt nur her, wo der Bezirk gerade liegt.
          blase={(anker) =>
            // Ein leerer Bezirk bekommt KEINE Blase — sonst steht ein weißer
            // Balken mit Pfeil über der Stadt, der nichts sagt. Seit Phase 19i
            // ist das zugleich die einzige Antwort auf „hier ist nichts los":
            // Der Blattkopf, der sie vorher auch gab („1090 Wien · 0 Posts"),
            // ist weg. Eine Antwort ist richtig, zwei wären eine zu viel — die
            // Lehre vom 2026-09-03.
            eintraege.length === 0 ? null : (
            <KartenBlase
              anker={anker}
              eintraege={eintraege}
              onPost={(id) => router.push({ pathname: '/post/[id]', params: { id } })}
              // **Ians Entscheidung 65 (Phase 19i):** Von hier geht es ins
              // Bezirks-Vollbild. Dritte Fassung derselben Zeile — 19c wechselte
              // in die Listenansicht, 19g zog das Blatt auf. Der Bezirksfilter
              // bleibt in allen dreien stehen (harte Regel 50).
              onAlle={oeffneBezirk}
            />
            )
          }
        />

        {/* ⚠️ **Hier lag bis Phase 19i das Blatt** (`SsBlatt`) — Ians
            Entscheidung 65 hat es weggenommen: *„Die Leiste ist okay, aber würde
            sie ehrlich gesagt weglassen und es so machen, dass man direkt, wenn
            man auf einen Bezirk draufklickt, auf ein Fenster kommt, auf den
            Stapel."*

            **Mit ihm sind Suche, Kategorien, Filter, die Überschrift, das ✕ und
            der Chip „3 Posts ohne Bezirk" aus der KARTENANSICHT verschwunden.**
            Übrig bleibt oben der Umschalter samt Posten-Knopf (sonst käme man
            nicht mehr von der Karte weg) und sonst Karte.

            ── Warum der Chip „ohne Bezirk" ohne Ersatz weggehen darf ───────────
            Er stand für Ians Entscheidung 31: *eine Ansicht darf nicht still
            Posts verschlucken.* Das Wort, auf das es ankommt, ist **still** —
            gemeint war eine LISTE, in der etwas fehlt. Seit 19i gibt es in der
            Kartenansicht keine Liste mehr, aus der etwas fehlen könnte: Die Karte
            zeigt Orte, und ein Post ohne Ort hat dort keinen. Vollständig sind
            Stapel und Liste, und beide sind einen Tipp entfernt — der Umschalter
            steht darüber. **Es ist trotzdem meine Auslegung und nicht seine
            Entscheidung; sie gehört ihm am Bild vorgelegt.**

            `SsBlatt` selbst bleibt stehen und wird NICHT gelöscht — harte Regel 51,
            dieselbe Lehre wie bei der Blase: Die war elf Tage aus der Anzeige und
            kam mit EINEM Aufruf zurück. Wer eine geprüfte Arbeit ausbaut, löscht
            sie nicht. */}

      {/* 🔴 **Ians Entscheidung 98 (2026-09-20): „In Wien ist gerade nichts los"
          ist WEG.** Sein Satz dazu: *„That's not needed because that's what you
          see."* Das ist harte Regel 63 in Reinform — eine leere Karte sagt schon,
          dass nichts los ist; ein Kasten davor sagt dasselbe noch einmal und nimmt
          dabei Sicht auf genau das, worüber er spricht.

          ⚠️ **Der Fall MIT Filter bleibt, und das ist kein Zögern.** Dort sagt die
          Kapsel etwas, das man NICHT sieht: dass die Leere am Filter liegt und
          nicht an Wien. Ohne sie stünde man vor einer leeren Karte ohne Ausweg und
          ohne Grund — das wäre die Falle *„eine Regel, deren GRUND wegfällt,
          hinterlässt ihre Wirkung"*, nur andersherum.

          Sie liegt über der Tab-Kapsel, nicht dahinter: `tabUeberdeckung` ist deren
          GEMESSENE Höhe samt Sicherheitsabstand — nicht `tabRand`, der auf iOS 0
          ist. Ein Ausweg-Knopf, den die Leiste verdeckt, ist keiner. */}
      {nichtsDa && filterAktiv ? (
        <View style={[styles.nichtsLos, { bottom: tabUeberdeckung + spacing.md }]}>
          <KarteNichtsLos zuruecksetzen={zuruecksetzen} />
        </View>
      ) : null}

      {/* 🔴 **Hier schwebte bis zum 2026-09-20 der Umschalter** (Entscheidung 44).
          Er ist nicht weg, er steht nur eine Ebene höher: Seit Entscheidung 105
          gibt es EINE Kopfleiste außerhalb beider Bäume, damit sie beim
          Umschalten bewegt statt ausgetauscht wird. */}
    </View>
  );
}

/**
 * Das Ende des Stapels — und zwar als Überschrift über der Liste, nicht als
 * eigener Bildschirm.
 *
 * Genau hier entscheidet sich, ob die App an einem stillen Dienstag tot wirkt. Ein
 * leerer Wischstapel mit einem Achselzucken wäre das Ende des Besuchs. Ein Satz,
 * der sagt, dass man durch ist, und darunter alles noch einmal — das ist derselbe
 * Bildschirm mit einer Aufgabe mehr.
 */
function StapelDurch({ filterAktiv }: { filterAktiv: boolean }) {
  return (
    <View style={styles.durch}>
      <View style={styles.durchText}>
        <SsText variant="heading">
          {t(filterAktiv ? 'feed.stapelDurch' : 'feed.allesFuerHeute')}
        </SsText>
        <SsText variant="caption" color={colors.inkSoft}>
          {filterAktiv
            ? 'Mit einem anderen Filter liegen vielleicht noch Karten da.'
            : 'Alles, was du gesehen hast, steht unten weiter in der Liste.'}
        </SsText>
      </View>
      {/* `alignSelf` muss sein: SsButton setzt für schmale Knöpfe selbst
          'flex-start' und schlägt damit das 'alignItems: center' hier. */}
      <SsButton
        label={t('feed.posten')}
        icon="stift"
        style={styles.durchKnopf}
        onPress={() => router.push('/create')}
      />
      {/* Hier stand bis Phase 20.11 „Zur Listenansicht wechseln" — die Erklärung
          dafür, dass der Umschalter oben weiter „Stapel" sagt, während unten eine
          Liste steht, und der Weg dorthin in einem. **Die Stufe gibt es nicht mehr**
          (Ians Satz vom 14.09.), also hat der Link kein Ziel. Und die Erklärung
          braucht es auch nicht mehr: Es gibt keine zweite Ansicht, in die man
          wechseln könnte — was hier steht, ist das Einzige, was es gibt. Der
          Untertitel oben sagt es bereits („steht unten weiter in der Liste"). */}
    </View>
  );
}

/**
 * „Rückgängig" — mein Vorschlag, den Ian streichen kann (`wisch.ts`, Kopf).
 *
 * Ein Fehlwisch ist die häufigste Beschwerde bei Wisch-Oberflächen, und hier kostet
 * er keine Kleinigkeit, sondern eine mögliche Verabredung. Der Titel steht mit
 * dabei, weil „Weggewischt · Rückgängig" allein die Frage offenlässt, WAS man
 * gerade zurückholt — nach zwei schnellen Wischern weiß man das nicht mehr.
 */
function Rueckgaengig({ eintrag, onZurueck }: { eintrag: FeedEintrag; onZurueck: () => void }) {
  return (
    <View style={styles.rueck}>
      <SsText variant="caption" color={colors.bg} numberOfLines={1} style={styles.rueckText}>
        {t('feed.weggewischt', { titel: eintrag.post.title })}
      </SsText>
      <Pressable
        onPress={onZurueck}
        accessibilityRole="button"
        hitSlop={spacing.sm}
        style={styles.rueckKnopf}>
        <SsText variant="label" color={colors.bg}>
          {t('feed.rueckgaengig')}
        </SsText>
      </Pressable>
    </View>
  );
}

/**
 * Die zwei Zahlen, aus denen `KopfLeiste` die schmale Kapselbreite rechnet.
 * Sie standen bisher nur in `styles.posten` (44) und `styles.umschalterInKapsel`
 * (104) — eine Rechnung, die Zahlen aus fremden Stilen abliest, veraltet beim
 * ersten Handgriff dort.
 */
const POSTEN_GROESSE = 44;
const UMSCHALTER_BREITE = 104;

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DIE KOPFLEISTE — **eine** Kapsel für beide Ansichten (Ians Entscheidung 105)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Ians Beobachtung am Gerät: *„dass eben dieses weiße Dings eben größer wird zuerst
 * und dann mit dem grauen nach rechts kommt … so dass dieses Einstellungsraster
 * wegkommt, und genau das gleiche in reverse, wenn ich wieder auf Stapel klicke."*
 *
 * ── Warum das sprang, und warum seine Beschreibung STIMMTE ─────────────────
 * Es gab **zwei** Kapseln in zwei getrennten Bäumen, verschieden gebaut:
 *
 *   Stapel  `kopfGlas`  so breit wie ihr Inhalt (Entscheidung 96) — Umschalter
 *                       (feste 104) plus Filterknopf
 *   Karte   `ansicht`   `flex: 1` — sie füllt die Zeile bis zum Posten-Knopf
 *
 * Beim Wechsel wurde die eine aus- und die andere eingeblendet. Die Pille glitt
 * zwar sauber (`bewegung.gleiten`), aber **innerhalb einer Kapsel, die im selben
 * Moment ausgetauscht wurde.** Ian hat damit nicht beschrieben, was er sich
 * wünscht, sondern **was ohnehin passiert — nur ohne die Bilder dazwischen.**
 *
 * ── Was jetzt passiert ────────────────────────────────────────────────────
 * Eine Kapsel, außerhalb beider Bäume. Ein Taktgeber (`takt`, 0 = Stapel,
 * 1 = Karte) fährt zwei Dinge gleichzeitig: die **Breite der Kapsel** und die
 * **Breite des Filterknopfs** (auf null, mit Ausblenden).
 *
 * Die weiße Pille braucht dafür **keine Zeile Code**: `SsSegment` misst seine
 * Hälften selbst (`onLayout`) und interpoliert zwischen den gemeldeten Lagen.
 * Wächst die Kapsel, melden die Hälften neue Maße, und die Pille wächst und
 * wandert mit. *Genau deshalb wird die Kapsel bewegt und nicht die Pille.*
 *
 * ── Warum der Filterknopf ein absolut gesetztes Kind ist ──────────────────
 * Seine natürliche Breite schwankt (mit Zahl ist er breiter), muss also gemessen
 * werden — aber messen kann man nur, was nicht gerade animiert wird. **Ein Kind
 * mit `position: absolute` in einer klippenden Hülle behält seine natürliche
 * Breite**, egal wie schmal die Hülle ist. Damit hängt die Messung nicht an der
 * Animation, die sie steuert.
 *
 * ⚠️ **Der Zwischenraum gehört IN die Hülle.** Läge er als `gap` in der Kapsel,
 * blieben am Ende 4 Punkte Luft stehen, wo nichts mehr ist.
 */
function KopfLeiste({
  aufKarte,
  /**
   * Trägt dieser Baum den oberen Sicherheitsabstand schon?
   *
   * Im Stapel ja — `SsScreen` hat `edges={['top']}`. Auf der Karte gibt es keinen
   * Screen darum (Entscheidung 44, randlose Karte), dort bringt die Leiste ihn
   * selbst mit. **Eine Prop und kein `ansicht === 'karte'` daneben:** Die Frage
   * ist „steckt oben schon ein Abstand drin", nicht „welche Ansicht ist dran".
   */
  umschalter,
  filterOffen,
  anzahlFilter,
  filterUmschalten,
  gewaehlt,
  abwaehlen,
  onHoehe,
}: {
  aufKarte: boolean;
  umschalter: (
    style: StyleProp<ViewStyle>,
    aufGlas?: boolean,
    breite?: Animated.AnimatedInterpolation<number>,
  ) => ReactNode;
  filterOffen: boolean;
  anzahlFilter: number;
  filterUmschalten: () => void;
  gewaehlt: string | null;
  abwaehlen: () => void;
  onHoehe: (h: number) => void;
}) {
  const insets = useSafeAreaInsets();
  // Der EINE Taktgeber. Dieselbe Spur wie die Pille in `SsSegment` — deshalb
  // kommen Kapsel, Filterknopf und Pille zur selben Zeit an (harte Regel 118).
  const [takt] = useState(() => new Animated.Value(aufKarte ? 1 : 0));
  useEffect(() => {
    const lauf = Animated.timing(takt, {
      toValue: aufKarte ? 1 : 0,
      ...bewegung.gleiten,
      // Breite kann der native Treiber nicht — dieselbe Lage wie in `SsSegment`.
      useNativeDriver: false,
    });
    lauf.start();
    return () => lauf.stop();
  }, [aufKarte, takt]);

  // Hängt NICHT an der Animation und ist deshalb gefahrlos zu messen.
  const [zeile, setZeile] = useState(0);
  const [filterNatur, setFilterNatur] = useState(0);
  /**
   * 🔴 **Die natürliche Breite des ✕ — nötig, seit der Umschalter seine Breite
   * WIRKLICH bekommt (2026-09-20).**
   *
   * Bis dahin ging `segmentBreite` nur in die Pillenrechnung; die Wurzel des
   * Umschalters maß sich nach ihrem Inhalt (≈84 pt) und ließ dem ✕ reichlich
   * Platz. Jetzt ist die Breite echt — und ihr weites Ende war die GANZE
   * Innenbreite der Kapsel. Das ✕ (Entscheidung 103) steht als Geschwister
   * daneben, `flexShrink` ist in React Native von Haus aus 0, und
   * `kopfKapselGlas` hat bewusst kein `overflow: hidden`: Es wäre rechts aus
   * der Kapsel herausgeragt, genau dorthin, wo der Posten-Knopf sitzt.
   *
   * Gemessen statt gerechnet, und zwar aus demselben Grund wie `filterNatur`:
   * Die Breite hängt an der Schriftgröße des Geräts, nicht an einer Konstante.
   */
  const [abwaehlNatur, setAbwaehlNatur] = useState(0);

  const bereit = zeile > 0 && filterNatur > 0;
  /**
   * 🔴 **`- spacing.lg * 2` — der Fehler auf Ians Bild vom 2026-09-20, 17:41.**
   *
   * `onLayout` meldet die Breite EINSCHLIESSLICH der eigenen Polsterung
   * (border-box). `kopfLeiste` hat `paddingHorizontal: spacing.lg`, also sind in
   * `zeile` 32 Punkte enthalten, die dem Inhalt gar nicht gehören. Ohne den Abzug
   * wurde die Kapsel um genau diese 32 Punkte zu breit, schob den Posten-Knopf
   * über den Bildrand — und an der rechten Kante blieb ein heller Schnipsel von
   * ihm stehen. Ians Worte: *„when you look behind the liquid glass, you see that
   * there is something there."* Das war er.
   */
  const inhalt = Math.max(0, zeile - spacing.lg * 2);
  const voll = Math.max(0, inhalt - POSTEN_GROESSE - spacing.md);
  /**
   * ⚠️ **Gedeckelt, und der Deckel ist kein Schmuck.** `schmal` ist eine gerechnete
   * Summe; wird einer ihrer Summanden zu gross (wie `filterNatur` es war), wächst
   * die Kapsel aus dem Bild. Ein Anteil kann nicht ausweichen, ein gemessener
   * Deckel schon (FALLEN.md) — mehr als `voll` gibt es nie.
   */
  const schmal = Math.min(
    voll,
    spacing.xs * 2 + UMSCHALTER_BREITE + spacing.xs + filterNatur,
  );

  /**
   * Die Innenbreite des Umschalters in den zwei Endzuständen — **gerechnet, nicht
   * gemessen**, und aus demselben Takt gespeist wie die Kapsel.
   *
   *   Stapel  die feste Breite des Umschalters; rechts daneben steht der Filter
   *   Karte   alles, was die Kapsel innerhalb ihrer Polsterung hergibt, weil der
   *           Filter dort auf null gefahren ist
   *
   * Dass beide Enden hier stehen, ist der Punkt: Dazwischen interpoliert Animated,
   * ohne dass irgendwer messen oder neu zeichnen muss.
   */
  // Auf der Karte teilt sich der Umschalter die Kapsel mit dem ✕, sonst mit
  // nichts. `0`, solange nicht gemessen — ein Bild lang, beim allerersten Mal.
  const abwaehlRaum = aufKarte && gewaehlt ? abwaehlNatur : 0;
  const segmentBreite = bereit
    ? takt.interpolate({
        inputRange: [0, 1],
        outputRange: [UMSCHALTER_BREITE, Math.max(0, voll - spacing.xs * 2 - abwaehlRaum)],
      })
    : undefined;

  return (
    <View
      /**
       * 🔴 **Der obere Sicherheitsabstand gehört seit dem 2026-09-20 IMMER der
       * Kopfleiste selbst** — vorher nur in der Kartenansicht (`eigenerRandOben`).
       *
       * Der Grund ist der Umbau darunter: Die Leiste steht jetzt in BEIDEN
       * Ansichten außerhalb von `SsScreen`, an einer festen Stelle im Baum.
       * Damit gibt es keinen `SafeAreaView` mehr über ihr, der den Abstand
       * trägt — und keine zwei Fälle mehr, die man verwechseln kann.
       *
       * Die Geometrie bleibt Punkt für Punkt dieselbe: Im Stapel kam der
       * Abstand bisher von `SsScreen` (`edges={['top']}`) und `spacing.sm` von
       * hier. Jetzt kommt beides von hier.
       */
      style={[styles.kopfLeiste, { paddingTop: insets.top + spacing.sm }]}
      onLayout={(e) => {
        setZeile(e.nativeEvent.layout.width);
        onHoehe(e.nativeEvent.layout.height);
      }}>
      {/* 🔴 **Die animierte Breite sitzt auf einer `Animated.View` HÜLLE, nicht
          auf `SsGlas` — und das ist kein Stilfrage, sondern der Fehler, den Ian
          am 2026-09-20 zweimal gemeldet hat.**

          `SsGlas` rendert mit `GLAS_AN = false` ein gewöhnliches `View`
          (`SsGlas.native.tsx`). Ein gewöhnliches `View` kann mit einer
          `Animated.AnimatedInterpolation` als `width` NICHTS anfangen — der Wert
          wird still verworfen. Die Kapsel bekam also nie eine gerechnete Breite,
          sondern ihre natürliche, und bewegt hat sich gar nichts. Ians Satz *„the
          animation is completely wrong"* war wörtlich zu nehmen.

          ⚠️ **Das verschluckt keine Fehlermeldung und kein Typcheck:** `style`
          nimmt beides an, und auf Web (wo `SsGlas` ebenfalls ein `View` ist) fällt
          es genauso wenig auf. Sichtbar wird es nur am laufenden Bild.

          Die Hülle ist eine Spalte mit `alignItems: 'stretch'` (Voreinstellung),
          deshalb nimmt `SsGlas` ihre Breite von selbst an — es braucht dafür
          keine eigene Eigenschaft. */}
      <Animated.View
        style={
          // Vor der ersten Messung KEINE gerechnete Breite — eine Kapsel mit
          // Breite 0 wäre ein Blitzer im ersten Bild.
          bereit
            ? { width: takt.interpolate({ inputRange: [0, 1], outputRange: [schmal, voll] }) }
            : undefined
        }>
      <SsGlas schwebt style={styles.kopfKapselGlas}>
        {/* 🔴 **`flex: 1`, nicht die feste 104 — daran hängt Ians ganzer Effekt.**
            Bliebe der Umschalter 104 breit, bliebe auch die Pille gleich groß,
            und die Kapsel wüchse um eine leere Fläche daneben. */}
        {umschalter(styles.umschalterInKapsel, true, segmentBreite)}
        {/* ⚠️ **Nur auf der KARTE** — Ians Entscheidung 103. Im Stapel sagt es
            schon der Filterknopf (`aktiveFilter()` zählt den Bezirk mit). Beides
            zugleich wären zwei Antworten auf dieselbe Frage. Seit die Kapsel EINE
            ist, muss das dastehen — vorher trug es die Trennung der zwei Bäume. */}
        {aufKarte && gewaehlt ? (
          <View onLayout={(e) => setAbwaehlNatur(e.nativeEvent.layout.width)}>
            <BezirkAbwaehlen plz={gewaehlt} abwaehlen={abwaehlen} />
          </View>
        ) : null}
        <Animated.View
          style={[
            styles.filterHuelle,
            bereit
              ? {
                  width: takt.interpolate({
                    inputRange: [0, 1],
                    outputRange: [filterNatur + spacing.xs, 0],
                  }),
                  opacity: takt.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                }
              : null,
          ]}
          // Auf der Karte gibt es ihn nicht mehr — dann darf ihn auch niemand
          // treffen. Im `style`, nie als Prop (ACTA-Falle).
          pointerEvents={aufKarte ? 'none' : 'auto'}>
          <View
            style={styles.filterNatuerlich}
            onLayout={(e) => setFilterNatur(e.nativeEvent.layout.width)}>
            <FilterKnopf
              offen={filterOffen}
              anzahl={anzahlFilter}
              umschalten={filterUmschalten}
              umgebung="kapsel"
            />
          </View>
        </Animated.View>
      </SsGlas>
      </Animated.View>
      {/* Der Posten-Knopf bleibt DRAUSSEN und rund — Ians Entscheidung 41. */}
      <PostenKnopf />
    </View>
  );
}

/**
 * Das ✕, das den Bezirk wieder abwählt — **Ians Entscheidung 103 (2026-09-20).**
 *
 * ── Was es beantwortet ──────────────────────────────────────────────────────
 * Zwei Fragen, die dieselbe sind. Erstens Ians Beobachtung, dass ein Bezirk weiß
 * umrandet bleibt, obwohl er ihn „nicht angeklickt" hat — er IST gewählt, und die
 * Karte sagt es nicht. Zweitens den Rückweg: Seit Entscheidung 102 springt ein
 * Tipp direkt in den Stapel, also gibt es den zweiten Tipp nicht mehr, der bis
 * dahin der einzige Weg zurück zu ganz Wien war (Entscheidung 49).
 *
 * **Ein Knopf für beides ist richtig und nicht Sparsamkeit:** Beide Male fehlt
 * dieselbe Sache — eine sichtbare Stelle, an der „ich sehe gerade nur diesen
 * Bezirk" steht und weggenommen werden kann.
 *
 * ── Warum die PLZ danebensteht und nicht nur ein ✕ ──────────────────────────
 * Ein nacktes ✕ in einer Leiste sagt „schließen", nicht „Filter weg" — und was
 * hier zu schließen wäre, ist nicht zu sehen. Mit der Postleitzahl liest sich die
 * Kapsel als Satz: *Karte · Stapel · nur 1140 ✕*. Dieselbe Sprache wie der Chip
 * „Nur 1140 Wien" im Regler, der dasselbe tut — nur dass man den erst aufklappen
 * muss. (Das ist KEINE Bezirksauswahl: Ian hat die gestrichen, Entscheidung 63.
 * Hier wird nichts gewählt, nur weggenommen.)
 *
 * ── Die Geometrie ist geerbt, nicht geraten ─────────────────────────────────
 * Höhe 36 statt 44 und `radius.pill` statt `ecke.md` — beides aus
 * `filterKnopfInKapsel`, wo es am 2026-09-20 an Ians Befund gemessen wurde
 * (*„der ist dann größer als die ganze Leiste"*). `kopfGlas` hat kein vertikales
 * Polster, die Kapsel ist also genau so hoch wie ihr höchster Inhalt; ein Knopf
 * mit 44 würde sie aufblähen und mit engeren Ecken über ihre Rundung ragen.
 * **Damit fällt er unter Apples 44** — deshalb `hitSlop`, wie bei `SsBack`.
 *
 * `useDruck('glas')`: nur Skalierung, keine Deckkraft. Harte Regel 119 — auf Glas
 * (oder auf dem matten Ersatz, der seine Kante trägt) nimmt eine Deckkraft dem
 * Knopf genau das weg, was ihn sichtbar macht.
 */
function BezirkAbwaehlen({ plz, abwaehlen }: { plz: string; abwaehlen: () => void }) {
  const druck = useDruck('glas');
  return (
    <DruckFlaeche
      onPress={abwaehlen}
      {...druck.griff}
      accessibilityRole="button"
      accessibilityLabel={`Bezirk ${plz} nicht mehr filtern`}
      hitSlop={{ top: 4, bottom: 4 }}
      // `druck.stil` zuletzt — sonst überschriebe das Array die Animation still.
      style={[styles.bezirkWeg, druck.stil]}>
      <SsText variant="label" color={colors.ink}>
        Nur {plz}
      </SsText>
      <SsIcon name="kreuz" size={14} color={colors.inkSoft} />
    </DruckFlaeche>
  );
}

/**
 * Der Knopf, der den Filterbereich auf- und zuklappt — mit der Zahl daneben.
 *
 * ── Warum die Zahl das Wichtigste an diesem Knopf ist ────────────────────────
 * Ein zugeklappter Filterbereich hat genau ein Problem: Man sieht nicht mehr, was
 * eingestellt ist. Wer gestern „1220" gewählt hat und heute einen leeren Feed
 * vorfindet, sucht den Fehler bei der App, nicht bei sich. Die Zahl ist die
 * Antwort darauf — und deshalb wechselt der Knopf zusätzlich die Farbe, sobald
 * etwas aktiv ist: Man sieht es im Vorbeischauen, ohne zu lesen.
 *
 * Kein `SsButton`, weil der eine feste Höhe und den harten Rand unten hat — neben
 * einem Eingabefeld säße er entweder zu hoch oder zu tief. Dies hier ist eine
 * Pille in Feldhöhe, wie sie sonst nur `SsChip` baut; `SsChip` selbst kann kein
 * Icon neben freiem Text tragen.
 */
function FilterKnopf({
  offen,
  anzahl,
  umschalten,
  umgebung = 'block',
}: {
  offen: boolean;
  anzahl: number;
  umschalten: () => void;
  /**
   * Wo steht der Knopf? — dieselbe Frage wie bei `SsInput.umgebung`, harte
   * Regel 114. In der Glaskapsel gibt er Fläche und Kante ab (Regel 61); im
   * Fluss bringt er beides mit.
   *
   * ⚠️ **Der AKTIVE Zustand bleibt in beiden Umgebungen gefüllt.** Er ist die
   * einzige Stelle, an der ein vergessener Filter noch auffällt — ihn in der
   * Kapsel mit der Ruhefläche zusammen wegzunehmen wäre genau der Fehler, vor
   * dem harte Regel 26 seit Phase 15 warnt.
   */
  umgebung?: 'block' | 'kapsel';
}) {
  const hervor = anzahl > 0;
  return (
    <Pressable
      onPress={umschalten}
      accessibilityRole="button"
      accessibilityState={{ expanded: offen }}
      accessibilityLabel={anzahl > 0 ? `Filter, ${anzahl} aktiv` : 'Filter'}
      // In der Kapsel ist die sichtbare Fläche 36 hoch statt 44 (siehe
      // `filterKnopfInKapsel`). `hitSlop` holt Apples Mindestmaß zurück, ohne dass
      // man es sieht — dieselbe Bauart wie bei `SsBack`.
      hitSlop={umgebung === 'kapsel' ? { top: 4, bottom: 4 } : undefined}
      style={({ pressed }) => [
        styles.filterKnopf,
        umgebung === 'kapsel' && styles.filterKnopfInKapsel,
        hervor && styles.filterKnopfAktiv,
        pressed && styles.filterKnopfGedrueckt,
      ]}>
      <SsIcon name="regler" size={18} color={hervor ? colors.bg : colors.ink} />
      {/* Ians Entscheidung 53 (Phase 19f): Das WORT „Filter" faellt weg, die ZAHL
          bleibt. Das ist die Grenze aus Entscheidung 50 in ihrer ersten Anwendung
          — was der Regler tut, sagt sein Zeichen; dass gerade drei Filter gesetzt
          sind, sagt nichts ausser dieser Zahl. Ohne sie ist ein vergessener Filter
          der schnellste Weg zu einem Feed, den jemand fuer kaputt haelt (harte
          Regel 26, Phase 15). */}
      {anzahl > 0 ? (
        <SsText variant="label" color={colors.bg}>
          {anzahl}
        </SsText>
      ) : null}
    </Pressable>
  );
}

/**
 * Der aufgeklappte Filterbereich — Phase 15.
 *
 * ── Warum überhaupt zugeklappt ───────────────────────────────────────────────
 * Vier Filterreihen offen hinzustellen wäre die halbe Bildschirmhöhe, und der
 * Wischstapel darunter hätte keine mehr. Dasselbe Muster wie beim Posten
 * („Mehr einstellen", Phase 12): Der häufige Fall braucht nichts davon, und wer
 * etwas sucht, klappt einmal auf.
 *
 * ── Was NICHT zuklappt ───────────────────────────────────────────────────────
 * Suche und Kategorien. Die Suche ist Leopolds direkteste Antwort („man kann nicht
 * genau genug filtern") — ein Suchfeld, das man erst suchen muss, wird nicht
 * benutzt. Und die Kategorien sind das Gesicht der App.
 *
 * ── Warum sich beim Filtern nichts schließt ──────────────────────────────────
 * Man stellt selten nur eines ein. Die Rückmeldung kommt stattdessen von der Zahl
 * über dem Bereich („Noch 5 Karten") — sie ändert sich bei jedem Tipp, und man
 * sieht sofort, ob der Filter zu eng ist, ohne etwas zuzuklappen.
 */
function FilterBereich({
  filter,
  setzen,
  aktiv,
  zuruecksetzen,
  meinJahrgang,
}: {
  filter: FeedFilter;
  setzen: <K extends keyof FeedFilter>(feld: K, wert: FeedFilter[K]) => void;
  aktiv: boolean;
  zuruecksetzen: () => void;
  /** Nur für den VORSCHLAG beim Einschalten des Reglers, nicht für die Regel. */
  meinJahrgang: number;
}) {
  return (
    <View style={styles.filterBereich}>
      {/* „Wem ich folge" stand bis Phase 15 oben im Kopf. Es ist aber ein Filter wie
          jeder andere, und mit sechs Stück an drei verschiedenen Orten sähe niemand
          mehr, was gerade eingestellt ist. Zur Beschriftung: In PLAN.md heißt es
          „Nur Follower" — wörtlich wären das die Leute, die MIR folgen. Nützlich ist
          die andere Richtung, deshalb „Wem ich folge". */}
      <SsSegment<boolean>
        value={filter.nurGefolgte}
        onChange={(wert) => setzen('nurGefolgte', wert)}
        options={[
          { wert: false, label: 'Alle' },
          { wert: true, label: 'Wem ich folge' },
        ]}
      />

      {/* Die Kategorien — seit Ians Entscheidung 90 hier statt in einer eigenen
          Reihe über dem Stapel. Sie stehen ZUERST, weil sie der meistbenutzte
          Filter sind: Was am häufigsten angefasst wird, steht beim Aufklappen
          ohne Scrollen da.

          `FilterGruppe` bringt `SsScrollReihe` mit (harte Regel 19) — sieben
          Pillen passen auf kein Handy nebeneinander, und eine Reihe, die
          umbricht, schiebt beim Tippen den ganzen Bereich auseinander. */}
      <FilterGruppe titel={t('filterTitel.kategorie')}>
        <SsChip
          label={t('filter.alle')}
          selected={filter.kategorie === 'alle'}
          onPress={() => setzen('kategorie', 'alle')}
        />
        {CATEGORY_ORDER.map((k) => (
          <SsChip
            key={k}
            category={k}
            selected={filter.kategorie === k}
            onPress={() => setzen('kategorie', filter.kategorie === k ? 'alle' : k)}
          />
        ))}
      </FilterGruppe>

      <FilterGruppe titel={t('filterTitel.wann')}>
        {WANN_ORDER.map((w) => (
          <SsChip
            key={w}
            label={WANN_LABELS[w]}
            selected={filter.wann === w}
            onPress={() => setzen('wann', w)}
          />
        ))}
      </FilterGruppe>

      {/* ── Der Bezirks-Filter ist seit Phase 19h WEG ─────────────────────────
          Ians Entscheidung 63: *„Bezirk ist too viel, das sieht echt nicht gut
          aus."* Hier stand eine Reihe mit „Überall", jedem Bezirk, in dem gerade
          etwas los ist, und „Ohne Bezirk". Sie ist ersatzlos gestrichen — die Nähe
          erledigt die Aufgabe jetzt ohne einen Handgriff: Der Feed steht ohnehin
          von der eigenen Haustür aus sortiert da (`sort.ts`).

          ── Was NICHT gestrichen ist, und warum ────────────────────────────────
          `filter.bezirk` selbst. Harte Regel 50 sagt: Was auf der KARTE gewählt
          ist, IST der Bezirksfilter — es gibt keinen zweiten Zustand daneben. Ein
          Tipp auf die Karte setzt ihn also weiter, und er überlebt das Umschalten
          auf Stapel oder Liste.

          Genau daraus folgt die Zeile unten. Ohne sie käme man in einen Zustand,
          den man nur noch mit „Alle Filter zurücksetzen" verlässt — also mit dem
          Holzhammer, der auch Suche und Jahrgang wegwirft. **Das ist die Grenze in
          Ians Entscheidung 50** („wenn die Person etwas wissen will, dann soll's
          auch einfach für sie sein"): Wegräumen darf nicht heißen, dass ein
          Zustand ohne Ausweg entsteht. Deshalb steht hier keine Auswahl, sondern
          eine RÜCKNAHME — und nur dann, wenn es etwas zurückzunehmen gibt. */}
      {filter.bezirk.kind !== 'alle' ? (
        <FilterGruppe titel={t('filterTitel.vonDerKarte')} reihe={false}>
          <View style={styles.filterPillen}>
            <SsChip
              label={
                filter.bezirk.kind === 'einer'
                  ? `Nur ${filter.bezirk.plz} Wien`
                  : 'Nur ohne Bezirk'
              }
              selected
              onPress={() => setzen('bezirk', BEZIRK_ALLE)}
            />
          </View>
        </FilterGruppe>
      ) : null}

      {/* Seit Phase 18b ein Schiebe-Balken statt einer Pillenreihe — Ians
          Entscheidung 17: „mehr als Jahrgang brauchen wir nicht."

          `reihe={false}`, und das ist keine Kleinigkeit: `SsScrollReihe` ist ein
          waagrechter ScrollView, und ein Regler DARIN würde sich mit ihm um jede
          Berührung streiten (die Phase-11-Falle, siehe `SsJahrgangBalken`). Der
          Regler steht deshalb im ruhigen Block.

          Der Vorschlag beim Einschalten kommt aus dem eigenen Jahrgang. Das ist NICHT
          die verworfene Regel `'zu-mir'` aus `filter.ts` — die würde still
          mitfiltern; hier steht die Spanne sichtbar da und ist sofort verschiebbar. */}
      <FilterGruppe titel={t('filterTitel.jahrgang')} reihe={false}>
        <View style={styles.filterPillen}>
          <SsChip
            label={FILTER_EGAL}
            selected={filter.alter.kind === 'egal'}
            onPress={() => setzen('alter', { kind: 'egal' })}
          />
          <SsChip
            label={t('filter.bestimmteJahrgaenge')}
            selected={filter.alter.kind === 'spanne'}
            onPress={() =>
              setzen('alter', { kind: 'spanne', ...spanneUmJahrgang(meinJahrgang) })
            }
          />
        </View>

        {filter.alter.kind === 'spanne' ? (
          <View style={styles.filterBalken}>
            <SsJahrgangBalken
              von={filter.alter.vonJahrgang}
              bis={filter.alter.bisJahrgang}
              min={jahrgangMin()}
              max={jahrgangMax()}
              onChange={(vonJahrgang, bisJahrgang) =>
                setzen('alter', { kind: 'spanne', vonJahrgang, bisJahrgang })
              }
            />
          </View>
        ) : null}
      </FilterGruppe>

      {aktiv ? (
        <Pressable onPress={zuruecksetzen} accessibilityRole="button" style={styles.filterZuruecksetzen}>
          <SsText variant="label" color={categoryColors.creative.aufGrund}>
            {t('filter.alleZuruecksetzen')}
          </SsText>
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * Eine beschriftete Reihe im Filterbereich.
 *
 * Die Pillen liegen in `SsScrollReihe` und nicht in einem umbrechenden `View`
 * (harte Regel 19): Die Bezirksreihe wird bei einem lebhaften Tag lang, und eine
 * Reihe, die umbricht, schiebt in dem Moment den ganzen Stapel aus dem Bild. Eine
 * Reihe, die scrollt, bleibt gleich hoch — und die weiche Kante rechts steht nur
 * dann, wenn wirklich etwas abgeschnitten ist.
 */
function FilterGruppe({
  titel,
  hinweis,
  reihe = true,
  children,
}: {
  titel: string;
  hinweis?: string;
  /**
   * `false` für Inhalte, die NICHT in einen waagrechten ScrollView dürfen.
   *
   * Seit Phase 18b gibt es genau einen solchen Inhalt: den Jahrgangs-Regler. Zwei
   * Gesten-Erkenner übereinander, die beide waagrecht ziehen wollen, streiten sich
   * um jede Berührung — und wer gewinnt, hängt an der Reihenfolge im Baum. Das ist
   * die Phase-11-Falle, nur mit umgekehrten Rollen.
   */
  reihe?: boolean;
  children: ReactNode;
}) {
  return (
    <View style={styles.filterGruppe}>
      <View style={styles.filterKopf}>
        <SsText variant="label" color={colors.inkSoft}>
          {titel}
        </SsText>
        {hinweis ? (
          <SsText variant="caption" color={colors.inkSoft}>
            {hinweis}
          </SsText>
        ) : null}
      </View>
      {reihe ? (
        <SsScrollReihe contentContainerStyle={styles.filterPillen}>{children}</SsScrollReihe>
      ) : (
        <View>{children}</View>
      )}
    </View>
  );
}

/**
 * „Hier ist gerade nichts los" — **über der Karte, nicht an ihrer Stelle.**
 *
 * Ians Entscheidung 93. Es ist derselbe Sachverhalt wie in `LeererFeed` und
 * bewusst ein zweiter Baustein, nicht ein Prop an jenem: **Die Form ist der
 * ganze Unterschied.** `LeererFeed` nimmt die Fläche ein (`flex: 1`, 46-pt-Icon,
 * mittig) — das ist richtig, wo sonst nichts steht, und falsch über einer Karte,
 * die man gerade sehen soll. Hier ist es eine Kapsel: eine Zeile, ein Ausweg.
 *
 * **Die zwei Fälle sind dieselben wie dort und werden gleich beantwortet** —
 * *ein zu enger Filter* ist ein Bedienungsproblem und bekommt den Weg zurück,
 * *wirklich nichts los* ist der Moment, in dem die App um einen Beitrag bitten
 * darf. Ein einziger Text für beides wäre in mindestens einem Fall die falsche
 * Antwort; das gilt hier unverändert.
 *
 * ⚠️ **Kein Icon.** In `LeererFeed` trägt die Lupe die Aussage mit, weil dort
 * sonst nichts steht. Hier steht Wien darunter — ein Zeichen mehr wäre das
 * Gegenteil von dem, was Ian mit *„schlichter"* meint (harte Regel 63).
 */
function KarteNichtsLos({ zuruecksetzen }: { zuruecksetzen: () => void }) {
  return (
    <SsGlas schwebt style={styles.nichtsLosGlas}>
      <SsText variant="body" center>Dazu ist gerade nichts da</SsText>
      <Pressable onPress={zuruecksetzen} accessibilityRole="button" style={styles.leerLink}>
        <SsText variant="label" color={categoryColors.creative.aufGrund}>
          {t('filter.zuruecksetzen')}
        </SsText>
      </Pressable>
    </SsGlas>
  );
}

/**
 * Zwei verschiedene leere Zustände, weil es zwei verschiedene Situationen sind.
 *
 * "Der Filter ist zu eng" ist ein Bedienungsproblem — dort gehört der Ausweg hin,
 * nicht die Aufforderung, selbst zu posten. Und "in Wien ist gerade wirklich nichts
 * los" ist der Moment, in dem die App um einen Beitrag bitten darf. Ein einziger
 * Text für beides wäre in mindestens einem der Fälle die falsche Antwort.
 */
function LeererFeed({
  filterAktiv,
  zuruecksetzen,
}: {
  filterAktiv: boolean;
  zuruecksetzen: () => void;
}) {
  if (filterAktiv) {
    return (
      <View style={styles.leer}>
        <SsIcon name="lupe" size={46} color={colors.inkSoft} />
        <SsText variant="heading" center>
          Dazu ist gerade nichts da
        </SsText>
        <SsText variant="body" center color={colors.inkSoft}>
          Mit einem anderen Filter findest du vielleicht mehr.
        </SsText>
        <Pressable onPress={zuruecksetzen} accessibilityRole="button" style={styles.leerLink}>
          <SsText variant="label" color={categoryColors.creative.aufGrund}>
            {t('filter.zuruecksetzen')}
          </SsText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.leer}>
      <SsIcon name="spross" size={46} color={colors.inkSoft} />
      <SsText variant="heading" center>
        Noch nichts los in deinem Feed
      </SsText>
      <SsText variant="body" center color={colors.inkSoft}>
        Poste doch selbst was — irgendwer hat immer Zeit.
      </SsText>
      {/* Der Satz allein wäre eine Aufforderung ohne Weg. Hier ist der leere Feed der
          einzige Ort, an dem der ganze Bildschirm nichts Besseres zu tun hat. */}
      <SsButton
        label={t('feed.etwasPosten')}
        icon="stift"
        size="lg"
        style={styles.leerKnopf}
        onPress={() => router.push('/create')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  seite: { paddingHorizontal: 0 },

  /**
   * Die Kopfzeile schwebt über dem Inhalt, statt ihn wegzuschieben — siehe
   * `kopfHoehe` oben, warum das die ganze Glas-Frage ist.
   *
   * Kein `backgroundColor`: Was hier eine Fläche braucht, ist die Kapsel darin, und
   * die ist aus Glas (harte Regel 61). Eine Farbe an dieser Stelle legte einen
   * deckenden Streifen über genau das, was das Glas zeigen soll.
   */
  kopfSchwebend: { position: 'absolute', top: 0, left: 0, right: 0 },

  /**
   * Die Zeile der EINEN Kopfleiste (Entscheidung 105). Sie ersetzt `kopfZeile`
   * UND `schwebeLeiste` — zwei Zeilen für dieselbe Sache an derselben Stelle,
   * und genau daher kam das Springen.
   */
  kopfLeiste: {
    flexDirection: 'row',
    alignItems: 'center',
    /**
     * 🔴 **`space-between` ist Ians Entscheidung 96 wörtlich: Kapsel links,
     * Posten-Knopf rechts am Rand.**
     *
     * Die Vorgängerin `kopfZeile` trug es; `kopfLeiste` hat es beim Umbau auf
     * die EINE Kapsel (Entscheidung 105) nicht mitbekommen. Ohne die Zeile
     * klebt der Knopf am `gap` der Kapsel — und weil die Kapsel im Stapel nur
     * `schmal` breit ist (≈160 pt statt der vollen Zeile), landet er in der
     * BILDMITTE. Ians Befund am 2026-09-20: *„der Post-Button ist irgendwie in
     * der Mitte gelandet."*
     *
     * ⚠️ Am weiten Ende ist es folgenlos und muss es sein: `voll` ist als
     * `inhalt − POSTEN_GROESSE − spacing.md` gerechnet, Kapsel + Lücke + Knopf
     * füllen die Zeile also genau aus. `space-between` verteilt dann nichts —
     * es wirkt ausschließlich am schmalen Ende. Das `gap` bleibt daneben
     * stehen: Es ist der Mindestabstand, `space-between` nur der Rest.
     */
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    // Die Leiste selbst fängt nichts ab, ihre Kinder schon. Im `style`, nie als
    // Prop (ACTA-Falle).
    pointerEvents: 'box-none',
  },
  /** Die Kapsel. Die BREITE kommt animiert von `KopfLeiste`. */
  kopfKapselGlas: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
    // ⚠️ **KEIN `overflow: hidden`.** Es klänge richtig — die Kapsel schrumpft —,
    // würde aber auf iOS `clipsToBounds` setzen und damit den SCHATTEN
    // abschneiden, den `glasSchwebt` mitbringt. Der ist keine Zierde, sondern
    // der Ersatz für Apples Glaskante (harte Regel 61). Gebraucht wird er auch
    // nicht: Am schmalen Ende ist die Kapsel genau so breit wie ihr Inhalt.
  },
  /**
   * Die klippende Hülle um den Filterknopf. Ihre Breite fährt auf null; das Kind
   * darin steht absolut und behält seine natürliche Breite, die gemessen werden
   * kann, ohne an der Animation zu hängen.
   */
  /**
   * 🔴 **`alignItems: 'flex-end'` ist hier Pflicht, nicht Geschmack.**
   *
   * Diese Hülle hat kein `flexDirection`, ist also eine SPALTE — ihre Querachse
   * ist damit die waagrechte. Und `alignItems` steht in React Native von Haus aus
   * auf `stretch`. Das gilt auch für ein absolut gesetztes Kind, das nur EINE
   * waagrechte Kante gesetzt hat: Es wurde auf die Breite der Hülle gezogen.
   *
   * **Damit maß `onLayout` nicht den Filterknopf, sondern die Hülle** — und der
   * Wert ging als `filterNatur` in `schmal` ein, das daraufhin die halbe Zeile
   * breit wurde. Der zweite Teil von Ians Befund am 2026-09-20.
   *
   * *Das ist die Falle „Zwei Stilwerte, die einzeln stimmen, ergeben zusammen den
   * Fehler": `position: absolute` ist richtig (es hält die Messung aus der
   * Animation heraus), `stretch` ist die Voreinstellung — zusammen messen sie das
   * Falsche.*
   */
  filterHuelle: {
    height: POSTEN_GROESSE,
    justifyContent: 'center',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  filterNatuerlich: { position: 'absolute', right: 0 },

  // `flex: 1` gibt dem Umschalter den Rest der Zeile, die Mindestbreite ist der
  // Boden darunter. Beides zusammen ist die Reparatur einer Falle: `flex: 1` heißt
  // in React Native `flexBasis: 0` (im Browser wäre es `auto`). Die Hälften von
  // `SsSegment` melden damit Breite null an, und wo nichts sie streckt, fällt das
  // Segment auf seine Polsterung zusammen — aus „Stapel" wurde „Sta…".
  //
  // Die 232 sind nachgemessen und stehen seit Phase 19e günstiger da: Die Zeile hat
  // auf 360 px 328, rechts sitzt jetzt der runde Knopf (44 px) statt eines Zählers
  // (84 px), dazwischen 12 px Lücke — es bleiben **272**. `flex: 1` teilt sie zu
  // dritt, der längste Text („Stapel", 47 px) bekommt also 90 statt 77.
  ansicht: { flex: 1, minWidth: 232 },
  // Über der Karte braucht der Umschalter eine Kante, sonst verschwimmt eine helle
  // Fläche auf hellen Bezirken. Der Schatten ist dabei kein Schmuck, sondern die
  // Aussage „das hier liegt darüber" — dieselbe Begründung wie beim Blatt und beim
  // Prototyp-Hinweis. **In 19e-2 wird genau diese Fläche zu echtem Glas.**
  // Nur noch Geometrie: Kante und Schatten kommen aus `SsGlas` mit `schwebt` — und
  // dort auch nur, wo es KEIN Glas gibt. Echtes Glas bringt seine eigene helle Kante
  // mit; eine 1-px-Linie plus Schlagschatten darüber macht daraus wieder eine Karte
  // mit unscharfem Hintergrund (Ians Rückmeldung, 2026-09-07).
  ansichtSchwebend: { borderRadius: radius.pill },
  // Der Umschalter IM Glas: keine eigene Fläche, keine eigene Kante — beides
  // gehört jetzt der Glas-Pille darum. Die Polsterung behält er, sonst kleben die
  // drei Stufen am Rand.
  ansichtImGlas: { backgroundColor: 'transparent', borderWidth: 0 },
  /**
   * Der Umschalter IN der Kopfkapsel — wie `ansichtImGlas`, **aber mit fester
   * Breite**, und die ist nicht Geschmack, sondern die Behebung eines gemessenen
   * Fehlers.
   *
   * 🔴 **Ohne sie nahm er die ganze Kapsel ein und drückte Suchfeld und Regler
   * auf Breite null.** Gemessen am Beleg `at05` (erste Fassung), spaltenweise über
   * die Kapselzeile: bei x 80–500 das aktive Feld, bei 520–1000 das inaktive,
   * danach nur noch der Posten-Knopf — **dazwischen nichts.** Am Bild allein war
   * das nicht zu entscheiden, weil der Prototyp-Hinweis darüberliegt und alles
   * abdunkelt; erst die Zahlenreihe hat es gezeigt.
   *
   * ⚠️ **Warum eine feste Breite und kein `flexShrink`:** Das Suchfeld daneben hat
   * `flex: 1`, und das heißt in React Native `flexBasis: 0` — es darf also bis auf
   * null schrumpfen, ohne dass etwas dagegen spricht (ACTA-Falle). Wer stattdessen
   * dem Umschalter das Schrumpfen erlaubt, verlagert den Streit nur: Dann quetscht
   * ein langer Platzhaltertext die zwei Symbole zusammen. **Ein zweistufiger
   * Icon-Umschalter hat keine variable Breite zu verteidigen** — zwei Zeichen à 19
   * pt, ihre Polsterung und der Zwischenraum, das ist alles.
   *
   * **In der KARTENANSICHT gilt das nicht** (`ansichtZeile`, `ansichtImGlas`):
   * Dort steht der Umschalter allein in seiner Pille, es gibt nichts, dem er
   * Platz wegnehmen könnte.
   */
  /**
   * 🔴 **Seit Entscheidung 105 `flex: 1` statt der festen Breite.**
   *
   * Die feste 104 kam aus einem gemessenen Fehler (Beleg `at05`): Der Umschalter
   * nahm die ganze Kapsel ein und drückte **Suchfeld** und Regler auf Breite
   * null, weil `flex: 1` in React Native `flexBasis: 0` heißt. **Das Suchfeld
   * gibt es seit Entscheidung 95 nicht mehr** — und die zwei Nachbarn von heute
   * können gar nicht gequetscht werden: Die Filter-Hülle hat eine gesetzte
   * (animierte) Breite, das ✕ eine Inhaltsbreite, und `flexShrink` ist in React
   * Native von Haus aus 0.
   *
   * *Eine Regel, deren GRUND wegfällt, hinterlässt ihre Wirkung* — hier wäre die
   * Wirkung eine Kapsel, die wächst, während der Umschalter darin stehen bleibt.
   * Die `minWidth` bleibt als Boden: Sie ist das, was die feste Breite schützte.
   */
  /**
   * 🔴 **Kein `flex: 1` mehr, und kein `width` — die Breite kommt als ANIMIERTER
   * Wert von `KopfLeiste` (Prop `breite`).**
   *
   * Die Geschichte dieser Zeile in drei Schritten:
   *   · feste 104 — richtig, solange ein Suchfeld daneben stand (Beleg `at05`)
   *   · `flex: 1` — damit der Umschalter mit der Kapsel wächst (Entscheidung 105)
   *   · gar nichts — weil `flex: 1` die Hälften bei JEDEM Bild neu vermessen ließ
   *     und die Pille dadurch hinterherhinkte (Ians „springt so komisch")
   *
   * Eine zweite Breitenangabe hier wäre die zweite Wahrheit über dieselbe Sache.
   */
  umschalterInKapsel: { backgroundColor: 'transparent', borderWidth: 0 },

  /**
   * Der runde „Posten"-Knopf. Die Höhe von 44 ist Apples Mindestmaß für ein
   * Berührungsziel und zugleich die Höhe des Umschalters daneben. Seit Phase 20.10
   * ohne Tiefenrand: Die 44 sind jetzt die ganze Höhe und nicht mehr 44 plus 4.
   */
  posten: {
    width: POSTEN_GROESSE,
    height: POSTEN_GROESSE,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: accent.base,
    cursor: 'pointer',
  },

  /**
   * ── Die Kopfzeile, seit Ians Entscheidung 90 EINE Reihe ──────────────────
   *
   * Hier standen bis zum 2026-09-19 drei: Umschalter samt Posten-Knopf ·
   * Suche samt Regler · sechs Kategorie-Chips. Ians Satz: *„ich würde gerne
   * oben und unten halt ein Dings haben, dass es halt einfach schlichter
   * aussieht."* Das „Dings" ist die Glaskapsel der Tab-Leiste.
   *
   * ⚠️ **Harte Regel 62 gilt hier genauso wie unten: Glas braucht RAND.** Die
   * Kapsel hat nach links und rechts `spacing.lg` und nach oben `spacing.sm`
   * unter der Statusleiste — sie klebt an keiner Kante. Eine Fläche, die an
   * drei Kanten am Schirm klebt, sieht aus wie eine getönte Leiste; das war
   * unten vier Wochen lang der Fehler (19i).
   *
   * **Was sie NICHT tut: schweben.** Die Tab-Leiste liegt absolut, und der
   * Inhalt scrollt unter ihr durch. Diese hier steht im Fluss. Der Unterschied
   * ist Absicht und keine Nachlässigkeit — darunter liegt der Wischstapel, und
   * der scrollt nicht; eine Kapsel, unter der nichts durchläuft, gewinnt nichts
   * und nähme dem Stapel Höhe. **Ob sie trotzdem schweben soll, sieht man am
   * Bild, nicht am Code.**
   */
  kopfZeile: {
    flexDirection: 'row',
    alignItems: 'center',
    // Seit Entscheidung 96 trägt die ZEILE die Verteilung, nicht die Kapsel:
    // Kapsel links, Posten-Knopf rechts am Rand. Der Zwischenraum gehört damit
    // niemandem — und genau das ist der Unterschied zu einer leeren Kapsel,
    // die so tut, als stünde etwas darin.
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  /**
   * Die Kapsel selbst — **nur Geometrie.** Fläche, Kante und Schatten gehören
   * `SsGlas` (harte Regel 61); stünde hier eine `backgroundColor`, wäre das
   * Glas wieder eine Karte mit unscharfem Hintergrund.
   *
   * `minWidth: 0` ist Pflicht und nicht Vorsicht: Ohne das schrumpft ein
   * `flex: 1`-Kind im Browser nicht unter seine Eigenbreite, und der
   * Platzhalter im Suchfeld schiebt den Regler aus der Kapsel heraus.
   * Die kleine Polsterung hält Umschalter und Regler von der Rundung weg.
   */
  kopfGlas: {
    // ⚠️ **KEIN `flex: 1` — Ians Entscheidung 96 vom 2026-09-19.** Die Kapsel
    // ist so breit wie ihr Inhalt, nicht wie der Bildschirm.
    //
    // Beide Zwischenstände sahen falsch aus, und der Grund war jedes Mal
    // derselbe: **Eine Glaskapsel behauptet, dass in ihr etwas steht.** Mit
    // Suchfeld (Entscheidung 90) füllte der Inhalt die Breite; ohne Suchfeld
    // (Entscheidung 95) blieb sie breit und leer — erst links
    // zusammengedrängt, dann mit `space-between` auseinandergezogen. Ians
    // Urteil zu beidem: *„sieht nicht gut aus"*. **Eine leere Fläche liest
    // sich als Fehler, nicht als Ruhe.**
    //
    // Die Verteilung trägt jetzt `kopfZeile`: Kapsel links, Posten-Knopf
    // rechts. Die Kapsel misst nur noch ihren Inhalt — Umschalter (feste 104)
    // und Regler (mindestens 44).
    flexDirection: 'row',
    alignItems: 'center',
    // ⚠️ **`space-between` seit Ians Entscheidung 95.** Solange das Suchfeld
    // dazwischenstand, füllte es den Raum und ein `gap` genügte. Ohne es
    // stünden Umschalter und Regler links zusammengedrängt, und rechts wäre
    // die halbe Kapsel leer — das sähe nach einem Fehler aus, nicht nach
    // Absicht. Verteilt liest sie sich wie die Tab-Leiste unten, und genau
    // das war Ians Bild: *„oben und unten halt ein Dings"*.
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
  },

  // ── Phase 15: Suche und Filter ──────────────────────────────────────────
  // ⚠️ **`sucheFeld` ist mit Ians Entscheidung 95 weggefallen.** Der Stil trug
  // die Lehre `minWidth: 0` (ein `flex: 1`-Kind schrumpft im Browser sonst nicht
  // unter seine Eigenbreite) — sie steht weiter in `_gedaechtnis/FALLEN.md` und
  // an `umschalterInKapsel`, wo sie heute wirkt.

  filterKnopf: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    // Dieselbe Höhe wie ein `SsInput`: 12 oben und unten plus 20 Zeilenhöhe.
    paddingVertical: spacing.md,
    // Seit Entscheidung 53 steht hier kein Wort mehr, sondern ein Zeichen und
    // manchmal eine einstellige Zahl. `minWidth` statt fester Breite: Mit Zahl ist
    // der Knopf ein paar Punkte breiter, und das ist richtig so — er soll auffallen,
    // wenn ein Filter läuft. 44 ist Apples Mindestmaß für eine Trefferfläche; die
    // Höhe kommt über die Polsterung ohnehin darüber.
    minWidth: 44,
    paddingHorizontal: spacing.md,
    ...ecke.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    cursor: 'pointer',
  },
  // In der Glaskapsel: keine eigene Fläche, keine Ruhekante. Die `borderWidth`
  // bleibt stehen und wird nur durchsichtig — sonst springt der Knopf, sobald
  // ein Filter läuft und `filterKnopfAktiv` die Kante zurückholt.
  /**
   * 🔴 **Der Knopf IN der Kapsel ist kleiner als die Kapsel — Ians Befund vom
   * 2026-09-20.** Sein Satz: *„wenn ich einen Filter aussuche, dann wird dieser
   * Filterknopf weiß und der ist dann größer als die ganze Leiste."*
   *
   * Das war keine Geschmacksfrage, sondern Geometrie. `kopfGlas` hat **kein**
   * vertikales Polster, also war die Kapsel genau so hoch wie ihr höchster Inhalt —
   * und das war dieser Knopf mit 12 + 20 + 12 = **44**. Dazu kam der Eckradius: Der
   * Knopf trug `ecke.md` (**14**), die Kapsel `radius.pill` (**22**). Eine Fläche
   * gleicher Höhe mit ENGEREN Ecken ragt an allen vier Ecken über die Rundung
   * hinaus. Sichtbar wurde es erst, als die Fläche bei aktivem Filter WEISS wurde —
   * vorher war sie durchsichtig und die Ecken hatten nichts zu zeigen.
   *
   * Die Behebung ist dieselbe wie bei der Pille in `SsSegment`: 8 statt 12 Polster
   * (Höhe 36, also 4 Punkte Luft) und `radius.pill` statt `ecke.md`.
   *
   * ⚠️ **Damit fällt er unter Apples 44** — deshalb trägt der Knopf in dieser
   * Umgebung `hitSlop`. Die Trefferfläche bleibt, nur die sichtbare Fläche schrumpft.
   */
  filterKnopfInKapsel: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  /**
   * Das ✕ neben dem Umschalter (Ians Entscheidung 103). Geometrie wie
   * `filterKnopfInKapsel` — 36 hoch, `radius.pill` — damit es die Kapsel nicht
   * aufbläht und nicht über ihre Rundung ragt. Keine eigene Fläche und keine
   * Kante: Die bringt das Glas mit (harte Regel 61).
   */
  bezirkWeg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    cursor: 'pointer',
  },
  filterKnopfAktiv: { backgroundColor: colors.ink, borderColor: colors.ink },
  filterKnopfGedrueckt: { opacity: 0.7 },

  // KEIN `marginHorizontal`: Das Feld steht an zwei Stellen mit verschiedenen
  // Seitenabständen — im Fluss als Kind des Screens (der hat keinen, deshalb
  // `filterImFluss`) und im Stapel als Blatt in der Kartenfläche (die hat schon
  // 16 px von `stapelBereich`). Ein eigener Rand hier hieße an der zweiten Stelle
  // 32 px. Genau die Falle aus der PLAN-Liste: zwei Werte, jeder für sich richtig.
  filterBereich: {
    gap: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...ecke.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  filterGruppe: { gap: spacing.sm },
  filterKopf: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  filterPillen: { flexDirection: 'row', gap: spacing.sm },
  filterBalken: { marginTop: spacing.sm },
  filterZuruecksetzen: { alignSelf: 'flex-start', cursor: 'pointer' },

  // ⚠️ **Hier standen `chipZeile` und `chipInhalt`** — die Maße der
  // Kategorie-Reihe samt der Lehre, warum sie KEINEN negativen Rand haben darf
  // (Ian am Handy: „Alle" klebte am Bildschirmrand). Mit Entscheidung 90 ist die
  // Reihe in den Regler gewandert und benutzt dort `filterPillen`; die Maße
  // hatten kein Zuhause mehr. **Die Lehre selbst ist nicht verloren** — sie steht
  // im Volltext in `_gedaechtnis/FALLEN.md`, und `SsScrollReihe` trägt
  // `flexGrow/flexShrink: 0` seit Phase 19 ohnehin selbst.

  // Der Stapel bekommt seinen Seitenabstand von hier und nicht von der Kartenfläche
  // darin: Die Karten liegen absolut übereinander, und wo Yoga bei absoluten Kindern
  // die Polsterung des Elternteils anrechnet, macht der Browser es anders herum.
  // Ein Rand außen ist auf beiden Plattformen derselbe.
  // Der Seitenabstand des Filterfelds, wenn es im Fluss steht. Im Stapel kommt er
  // von `stapelBereich` unten.
  filterImFluss: { marginHorizontal: spacing.lg },

  stapelBereich: { flex: 1, paddingHorizontal: spacing.lg },

  // ── Phase 19e: die Karte im Vollbild ────────────────────────────────────
  // Kein Seitenrand, keine SafeArea, kein `maxWidth`: Die Karte läuft bis an jede
  // Kante. Was Abstand braucht, holt ihn sich selbst (die schwebende Leiste den
  // oberen, das Blatt seinen eigenen).
  vollbild: { flex: 1, backgroundColor: colors.bg },
  /**
   * Die Karte ist da, aber nicht dran — siehe `karteBleibt` oben.
   *
   * `display: 'none'` und nicht `opacity: 0` oder eine Verschiebung ins Abseits:
   * Nur `display` nimmt die Fläche wirklich aus dem Layout, sodass der andere Baum
   * daneben den ganzen Platz bekommt. Die native View bleibt dabei bestehen —
   * genau darum geht es, MapKit soll seine Kacheln behalten.
   *
   * ⚠️ `opacity: 0` wäre hier doppelt falsch: Es nimmt keinen Platz weg UND es
   * schaltet auf iOS Glaseffekte im ganzen Teilbaum ab (harte Regel 61).
   */
  ausgeblendet: { display: 'none' },
  // ⚠️ `vollbildLeer` ist mit Ians Entscheidung 93 weggefallen — der leere
  // Zustand nimmt die Kartenfläche nicht mehr ein, er legt sich als Kapsel
  // darüber (`nichtsLos`).

  // Die Kapsel „nichts los" liegt absolut über der Karte und ist ihr
  // GESCHWISTER, nie ihr Kind (harte Regel 51: `overflow: hidden` und ein
  // PanResponder, der jede Berührung an sich zieht). `left`/`right` statt
  // einer Breite, genau wie bei `schwebeLeiste` darüber: gleicher Abstand zu
  // den Kanten auf jedem Schirm. Das `bottom` kommt vom Aufrufer, weil nur
  // dort die Höhe der Tab-Kapsel bekannt ist.
  nichtsLos: { position: 'absolute', left: spacing.lg, right: spacing.lg },
  // Nur Geometrie — Fläche, Kante und Schatten gehören `SsGlas` (harte Regel 61).
  nichtsLosGlas: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    ...ecke.lg,
  },

  // Die Pille schwebt über der Karte und liegt deshalb absolut. `left`/`right`
  // statt einer Breite: So bleibt sie auf jedem Schirm gleich weit von den Kanten,
  // und der Umschalter darin bekommt seine Breite wie im Fluss.
  schwebeLeiste: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    // Die Leiste selbst fängt nichts ab, ihre Kinder schon — ein Tipp DANEBEN geht
    // an die Karte darunter. Im `style`, nie als Prop (ACTA-Falle).
    pointerEvents: 'box-none',
  },

  blattKopf: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  // `flexShrink: 1` und nicht `flex: 1`: Die Überschrift soll nachgeben, wenn das ✕
  // daneben Platz braucht — aber sie soll den Platz nicht ERZWINGEN, wenn keines da
  // ist (harte Regel 43, die Kehrseite).
  blattTitel: { flexShrink: 1 },
  blattWeg: { cursor: 'pointer' },
  blattOhne: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },

  listeAussen: { flex: 1 },
  // `flexGrow: 1` am Inhalt, damit der leere Zustand die volle Höhe bekommt und
  // mittig sitzt statt oben zu kleben.
  liste: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },

  durch: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  durchText: { alignItems: 'center', gap: spacing.xs },
  durchKnopf: { alignSelf: 'center' },

  rueck: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
  },
  rueckText: { flexShrink: 1 },
  rueckKnopf: { cursor: 'pointer' },

  leer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingBottom: spacing.xxxl },
  leerLink: { marginTop: spacing.sm, cursor: 'pointer' },
  // SsButton setzt für schmale Knöpfe selbst 'flex-start' und schlägt damit das
  // 'alignItems: center' des leeren Zustands.
  leerKnopf: { marginTop: spacing.md, alignSelf: 'center' },

  // ── Phase 19i: das Bezirks-Vollbild (Ians Entscheidungen 65 und 66) ─────────
  // Zurück-Pfeil und Bezirksname in EINER Zeile. Mehr steht auf diesem Fenster
  // nicht — die Karten holen sich den Rest der Höhe über `stapelBereich`.
  bezirkKopf: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  // `flexShrink: 1` und nicht `flex: 1` — dieselbe Überlegung wie beim alten
  // Blattkopf: Der Name gibt nach, wenn der Pfeil daneben Platz braucht, erzwingt
  // ihn aber nicht (harte Regel 43, die Kehrseite).
  bezirkTitel: { flexShrink: 1 },
  bezirkLeerText: { maxWidth: 260 },
});
