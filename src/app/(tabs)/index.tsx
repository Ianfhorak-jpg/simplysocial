import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AntwortLeiste } from '@/components/AntwortLeiste';
import { KartenBlase } from '@/components/KartenBlase';
import { PostCard } from '@/components/PostCard';
import { WischStapel, anleitungGesehen, anleitungMerken } from '@/components/WischStapel';
import {
  SsBlatt,
  SsButton,
  SsChip,
  SsGlas,
  SsIcon,
  SsInput,
  SsScreen,
  SsJahrgangBalken,
  SsScrollReihe,
  SsKarte,
  SsSegment,
  SsText,
  type BlattStufe,
} from '@/components/ui';
import { FILTER_EGAL, jahrgangMax, jahrgangMin, spanneUmJahrgang } from '@/config/alter';
import { useCurrentUser } from '@/features/social/hooks';
import {
  BEZIRK_ALLE,
  BEZIRK_OHNE,
  WANN_LABELS,
  WANN_ORDER,
} from '@/features/posts/filter';
import { bezirkPostText, ohneBezirkText } from '@/features/posts/karte';
import {
  FILTER_LEER,
  aktiveFilter,
  useBezirkeImFeed,
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
import { useTabRand } from '@/lib/tabs';
import { accent, CATEGORY_ORDER, categoryColors, colors, DEPTH, radius, spacing } from '@/theme';

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

type Ansicht = 'stapel' | 'liste' | 'karte';

/**
 * Wie weit das Blatt aufschlägt, wenn man die Karte öffnet.
 *
 * `halb` und nicht `zu`: Ians Entscheidung 45 — ein zugezogenes Blatt versteckt die
 * Filter, und die wollte er ausdrücklich sehen. `ganz` wäre das Gegenteil des
 * Wunsches, die Karte zu sehen.
 */
const BLATT_START: BlattStufe = 'halb';

export default function FeedScreen() {
  const [ansicht, setAnsicht] = useState<Ansicht>('stapel');

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
  const bezirke = useBezirkeImFeed(filter);
  // Phase 19b. Dieselbe Zählung speist Karte UND Filter-Pillen — die Regel „beim
  // Zählen wird genau der Bezirksfilter ausgeschaltet" steht damit an EINER Stelle
  // (`useBezirksZaehlung`), nicht zweimal fast gleich.
  const { proBezirk, ohneBezirk } = useBezirksZaehlung(filter);

  /** Ist der Filterbereich aufgeklappt? Zu beim Aufschlagen — wie beim Posten. */
  const [filterOffen, setFilterOffen] = useState(false);
  const anzahlFilter = aktiveFilter(filter);
  const filterAktiv = anzahlFilter > 0;
  const zuruecksetzen = () => setFilter(FILTER_LEER);

  // Beim allerersten Öffnen liegt die Anleitungskarte oben. Erst im Effekt gesetzt
  // und nicht schon beim ersten Rendern — sonst stünde sie im vorgerenderten HTML
  // und React fände beim Hydrieren einen Unterschied (dieselbe Überlegung wie bei
  // `PrototypHinweis`, Phase 8).
  const [anleitung, setAnleitung] = useState(false);
  useEffect(() => {
    if (!anleitungGesehen()) setAnleitung(true);
  }, []);

  // Die Karte, für die gerade die Antwort-Leiste offen ist. Sie ist so lange NICHT
  // im Stapel: „Abbrechen legt die Karte zurück" heißt, dass sie erst mit dem
  // Schicken wirklich weg ist. Weil sie dabei aus- und wieder einhängt, kommt sie
  // dann auch wieder mit einem sauberen Zustand zurück.
  const [antwortAuf, setAntwortAuf] = useState<FeedEintrag | null>(null);
  const karten = useMemo(
    () => (antwortAuf ? stapel.filter((e) => e.post.id !== antwortAuf.post.id) : stapel),
    [stapel, antwortAuf],
  );

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
  const filterFeld = filterOffen ? (
    <FilterBereich
      filter={filter}
      setzen={setzen}
      bezirke={bezirke}
      ohneBezirk={ohneBezirk}
      aktiv={filterAktiv}
      zuruecksetzen={zuruecksetzen}
      meinJahrgang={ich.jahrgang}
    />
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
  const sucheZeile = (
    <View style={styles.sucheZeile}>
      <SsInput
        value={filter.suche}
        onChangeText={(t) => setzen('suche', t)}
        onClear={() => setzen('suche', '')}
        placeholder="Suchen — Tennis, lernen, Kaffee …"
        icon="lupe"
        style={styles.sucheFeld}
      />
      <FilterKnopf
        offen={filterOffen}
        anzahl={anzahlFilter}
        umschalten={() => setFilterOffen((o) => !o)}
      />
    </View>
  );

  // Die Kategorien bleiben IMMER sichtbar und wandern nicht mit in den
  // Filterbereich. Sie sind der meistbenutzte Filter, und sie sind das
  // Erkennungszeichen der App — sechs Farben, die sonst nirgends vorkommen.
  // Eingeklappt wäre der Feed eine Liste ohne Gesicht.
  const chipZeile = (
    <SsScrollReihe style={styles.chipZeile} contentContainerStyle={styles.chipInhalt}>
      <SsChip
        label="Alle"
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
    </SsScrollReihe>
  );

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
  const umschalter = (style: StyleProp<ViewStyle>) => (
    <SsSegment<Ansicht>
      value={ansicht}
      onChange={setAnsicht}
      style={style}
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
        { wert: 'liste', label: 'Liste', icon: 'liste' },
        { wert: 'karte', label: 'Karte', icon: 'karte' },
      ]}
    />
  );

  const ansichtZeile = (schwebend: boolean) => (
    <>
      {schwebend ? (
        // Über der Karte steht die Pille auf Glas (Phase 19e-2, Entscheidung 43).
        // Der Umschalter darin gibt seine eigene Fläche ab — zwei Untergründe
        // übereinander wären einer zu viel, und der obere wäre der deckende.
        <SsGlas schwebt style={[styles.ansicht, styles.ansichtSchwebend]}>
          {umschalter(styles.ansichtImGlas)}
        </SsGlas>
      ) : (
        umschalter(styles.ansicht)
      )}
      <PostenKnopf />
    </>
  );

  // ── Die Kartenansicht: ein eigener Baum (Phase 19e) ─────────────────────────
  if (ansicht === 'karte') {
    return (
      <KarteVollbild
        zaehlung={proBezirk}
        ohneBezirk={ohneBezirk}
        filter={filter}
        setzen={setzen}
        eintraege={eintraege}
        filterAktiv={filterAktiv}
        zuruecksetzen={zuruecksetzen}
        filterOffen={filterOffen}
        filterFeld={filterFeld}
        sucheZeile={sucheZeile}
        chipZeile={chipZeile}
        ansichtZeile={ansichtZeile}
      />
    );
  }

  return (
    // `keyboard` steht hier wegen der Antwort-Leiste: Sie klebt am unteren Rand, und
    // auf iOS läge sie sonst unter der Tastatur. Fest gesetzt und nicht umgeschaltet
    // — ein Wechsel würde den ganzen Inhalt neu einhängen und mitten in der
    // Wischbewegung den Stapel zurücksetzen.
    <SsScreen tabScreen keyboard contentStyle={styles.seite}>
      <View style={styles.ansichtZeile}>{ansichtZeile(false)}</View>

      {sucheZeile}
      {chipZeile}

      {/* Im Fluss, wo darunter etwas scrollt. Im Stapel liegt dasselbe Feld weiter
          unten als Blatt über den Karten — Begründung bei `filterFeld` oben. */}
      {!stapelSichtbar ? (
        <View style={styles.filterImFluss}>{filterFeld}</View>
      ) : null}

      {ansicht === 'liste' ? (
        <FeedListe eintraege={eintraege} filterAktiv={filterAktiv} zuruecksetzen={zuruecksetzen} />
      ) : stapelLeer ? (
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
            <StapelDurch filterAktiv={filterAktiv} zurListe={() => setAnsicht('liste')} />
          ) : null}
          <FeedListe eintraege={eintraege} filterAktiv={filterAktiv} zuruecksetzen={zuruecksetzen} />
        </>
      ) : (
        <View style={styles.stapelBereich}>
          <WischStapel
            eintraege={karten}
            anleitung={anleitung}
            onAnleitungWeg={() => {
              anleitungMerken();
              setAnleitung(false);
            }}
            onWeg={gewischt}
            onAntippen={(e) =>
              router.push({ pathname: '/post/[id]', params: { id: e.post.id } })
            }
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
            blatt={filterFeld}
          />
        </View>
      )}

      {antwortAuf ? (
        <AntwortLeiste
          eintrag={antwortAuf}
          onAbbrechen={() => setAntwortAuf(null)}
          onSenden={anfrageAbschicken}
        />
      ) : null}
    </SsScreen>
  );
}

/**
 * „Posten" als runder Knopf — Ians Entscheidung 41.
 *
 * ── Warum kein `SsButton` ────────────────────────────────────────────────────
 * Der bringt einen Text mit, und genau der soll hier weg: Ein Kreis mit einem
 * Symbol steht neben dem Umschalter, ohne ihn schmaler zu machen. Die Signatur der
 * App kommt trotzdem mit — der harte Rand unten und der Versatz beim Drücken
 * (`DEPTH`, PLAN.md Abschnitt 3), damit er sich anfühlt wie jeder andere Knopf.
 *
 * ── Warum `stift` und nicht `plus` ───────────────────────────────────────────
 * Weil es in dieser App überall der Stift ist: `StapelDurch`, `LeererFeed` und der
 * frühere Kopf tragen alle „Posten" mit `stift`. Ein Plus wäre für sich genommen
 * verständlicher, aber es wäre das zweite Zeichen für dieselbe Sache — und wer den
 * Kreis einmal gedrückt hat, weiß es ohnehin. Der `accessibilityLabel` sagt es
 * jenen, die das Symbol nicht sehen.
 */
function PostenKnopf() {
  return (
    <Pressable
      onPress={() => router.push('/create')}
      accessibilityRole="button"
      accessibilityLabel="Posten"
      style={({ pressed }) => [styles.posten, pressed && styles.postenGedrueckt]}>
      <SsIcon name="stift" size={20} color={accent.onBase} />
    </Pressable>
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
      ItemSeparatorComponent={() => <View style={styles.luecke} />}
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
 * ── Warum bei einem völlig leeren Feed GAR KEINE Karte dasteht ───────────────
 * Eine Karte ohne Posts ist nicht leer, sie ist 23 graue Flächen — sie sieht kaputt
 * aus, nicht ruhig. Und stünde `LeererFeed` darunter, hätte der Screen wieder zwei
 * Antworten auf dieselbe Frage (die Lehre vom 2026-09-03 mit `StapelDurch`).
 * Deshalb: nichts da, keine Karte, nur der Satz mit dem Ausweg — der Umschalter
 * schwebt trotzdem darüber, sonst käme man nicht mehr weg.
 */
function KarteVollbild({
  zaehlung,
  ohneBezirk,
  filter,
  setzen,
  eintraege,
  filterAktiv,
  zuruecksetzen,
  filterOffen,
  filterFeld,
  sucheZeile,
  chipZeile,
  ansichtZeile,
}: {
  zaehlung: Record<string, number>;
  ohneBezirk: number;
  filter: FeedFilter;
  setzen: <K extends keyof FeedFilter>(feld: K, wert: FeedFilter[K]) => void;
  eintraege: FeedEintrag[];
  filterAktiv: boolean;
  zuruecksetzen: () => void;
  filterOffen: boolean;
  filterFeld: ReactNode;
  sucheZeile: ReactNode;
  chipZeile: ReactNode;
  ansichtZeile: (schwebend: boolean) => ReactNode;
}) {
  const insets = useSafeAreaInsets();
  /**
   * Wie hoch die schwebende Tab-Leiste ist (Phase 19e-2).
   *
   * Sie nimmt seit dem Glas keinen Platz mehr im Layout weg — **und genau das ist
   * hier der Gewinn:** Die Karte läuft unter ihr durch, statt an ihr aufzuhören.
   * Das Blatt darf das nicht, sein Griff wäre sonst unerreichbar; deshalb geht die
   * Zahl an zwei Stellen hin, mit zwei verschiedenen Bedeutungen (siehe unten).
   */
  const tabRand = useTabRand();
  const bezirk = filter.bezirk;

  /**
   * Wie viel von der Karte das Blatt gerade verdeckt.
   *
   * **Das ist keine Kosmetik.** Ohne diese Zahl zentriert die Karte Wien in der
   * Mitte des SCHIRMS, und die südliche Hälfte liegt hinter dem Blatt. Sie kommt vom
   * Blatt selbst und wechselt nur beim EINRASTEN — während des Ziehens rechnete
   * sonst bei jedem Fingerbreit jemand 23 Flächen neu.
   */
  const [blattRand, setBlattRand] = useState(0);

  /**
   * Eine EINMALIGE Bitte an das Blatt, mindestens so weit aufzugehen — Phase 19g,
   * für den Weg Blase → Blatt (Ians Entscheidung 57).
   *
   * ── Warum ein Zustand, der sich selbst zurücknimmt ───────────────────────────
   * `SsBlatt.mindestens` ist bewusst keine Steuerung von außen, sondern eine Bitte
   * (siehe dort): Sie wirkt, wenn sie sich ÄNDERT. Bliebe „ganz" stehen, wäre die
   * zweite Bitte keine Änderung mehr und das Blatt bliebe unten, wo der Nutzer es
   * hingezogen hat. Deshalb setzt `blattGezogen` sie zurück, sobald das Blatt
   * gerastet ist. **Das Ziehen bleibt ungeteilt beim Blatt** — hier steht nie eine
   * zweite Stufe daneben, die auseinanderlaufen könnte.
   */
  const [wunsch, setWunsch] = useState<BlattStufe | null>(null);

  /**
   * Wie viel die schwebende Leiste oben belegt — **gemessen, nicht gerechnet.**
   *
   * Sie ist die Höhe des Umschalters plus der Sicherheitsabstand darüber, und
   * beides hängt am Gerät. Der Wert geht an ZWEI Stellen: Die Karte zentriert Wien
   * darunter (`randOben`), und das Blatt fährt nicht weiter auf (`maxOben`). Genau
   * das war am 2026-09-07 der Fehler — mit einem reinen Anteil lag der Blattkopf
   * hinter der Pille.
   */
  const [leisteHoehe, setLeisteHoehe] = useState(0);
  const leisteBelegt = leisteHoehe > 0 ? insets.top + spacing.sm + leisteHoehe + spacing.sm : 0;
  // `useCallback`, damit das Blatt nicht bei jedem Rendern eine neue Funktion sieht.
  const blattGezogen = useCallback((_stufe: BlattStufe, sichtbar: number) => {
    setBlattRand(sichtbar);
    // Die Bitte ist erfüllt, sobald das Blatt irgendwo gerastet ist — siehe `wunsch`.
    setWunsch(null);
  }, []);

  const nichtsDa = Object.keys(zaehlung).length === 0 && ohneBezirk === 0;
  const gewaehlt = bezirk.kind === 'einer' ? bezirk.plz : null;
  const ueberschrift =
    bezirk.kind === 'einer'
      ? `${bezirk.plz} Wien · ${bezirkPostText(eintraege.length)}`
      : bezirk.kind === 'ohne'
        ? `Ohne Bezirk · ${bezirkPostText(eintraege.length)}`
        : `Ganz Wien · ${bezirkPostText(eintraege.length)}`;

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
   * Das ✕ im Blattkopf gibt es zusätzlich und nicht ersatzweise: Ein zweiter Tipp
   * auf einen 14 × 11 px großen Bezirk (die Josefstadt, gemessen in 19b) ist nicht
   * zuverlässig zu treffen.
   *
   * **Harte Regel 50 gilt weiter:** Was gewählt ist, IST der Bezirksfilter — das
   * Aufheben setzt `filter.bezirk`, nicht eine eigene Variable daneben.
   */
  const bezirkTippen = (plz: string | null) =>
    setzen('bezirk', plz === null || plz === gewaehlt ? BEZIRK_ALLE : { kind: 'einer', plz });

  return (
    // KEIN `SsScreen`: Der bringt Seitenrand und `edges={['top']}` mit, und genau
    // die stehen einer randlosen Karte im Weg (Ians Entscheidung 44). Der
    // Sicherheitsabstand wandert deshalb an die schwebende Leiste — sie ist das
    // einzige hier, das ihn braucht.
    <View style={styles.vollbild}>
      {nichtsDa ? (
        // Ohne den Rand stünde der Ausweg-Knopf hinter der schwebenden Leiste:
        // Der leere Zustand zentriert sich in seinem Platz, und der reicht seit
        // Phase 19e-2 bis an die Unterkante des Fensters.
        <View style={[styles.vollbildLeer, { marginBottom: tabRand }]}>
          <LeererFeed filterAktiv={filterAktiv} zuruecksetzen={zuruecksetzen} />
        </View>
      ) : (
        <>
          <SsKarte
            zaehlung={zaehlung}
            gewaehlt={gewaehlt}
            onWaehlen={bezirkTippen}
            fuellt
            // Seit Phase 19g ist das EINE Zahl statt einer Summe: Das Blatt
            // reicht bis an die Unterkante, die Kapsel liegt darauf. Was von
            // unten verdeckt ist, ist also genau die sichtbare Blatthöhe — und
            // die schließt den Sockel hinter der Kapsel schon ein.
            randUnten={blattRand}
            randOben={leisteBelegt}
            // Ians Entscheidung 57. Der Slot liegt als Geschwister ÜBER der
            // Kartenfläche (harte Regel 51) — die Karte selbst weiß nichts von
            // Posts, sie gibt nur her, wo der Bezirk gerade liegt.
            blase={(anker) =>
              // Ein leerer Bezirk bekommt KEINE Blase — sonst steht ein weißer
              // Balken mit Pfeil über der Stadt, der nichts sagt. Die Antwort auf
              // „hier ist nichts los" gibt der Blattkopf („1090 Wien · 0 Posts")
              // und der leere Zustand darunter; zwei Antworten auf dieselbe Frage
              // wären eine zu viel (die Lehre vom 2026-09-03).
              eintraege.length === 0 ? null : (
              <KartenBlase
                anker={anker}
                eintraege={eintraege}
                onPost={(id) => router.push({ pathname: '/post/[id]', params: { id } })}
                // *„dann kommt das Blatt und man kann sich's genau anschauen"* —
                // nicht mehr der Wechsel in die Listenansicht wie in 19c. `ganz`
                // und nicht `halb`: Wer „genau anschauen" tippt, will lesen.
                onAlle={() => setWunsch('ganz')}
              />
              )
            }
          />

          <SsBlatt
            start={BLATT_START}
            maxOben={leisteBelegt}
            // ⚠️ Seit Phase 19g: **Das Blatt hört NICHT mehr über der Kapsel auf,
            // es läuft bis an die Unterkante und die Kapsel liegt darauf.** Der
            // Wert ist jetzt der Sockel der untersten Raststufe, damit der Griff
            // nicht hinter der Kapsel landet — Begründung bei `SsBlatt.fuss`.
            fuss={tabRand}
            // Der aufgeklappte Filterbereich ist rund 250 px hoch und passt bei halb
            // offenem Blatt nicht hinein — er würde am `overflow: hidden` des
            // Blattes abgeschnitten. Nebenbefund: Damit kostet der weggefallene
            // Zähler (Entscheidung 47) hier gar nichts, weil beim Filtern die ganze
            // Liste danebensteht.
            mindestens={wunsch ?? (filterOffen ? 'ganz' : undefined)}
            onStufe={blattGezogen}
            kopf={
              <View style={styles.blattKopf}>
                <SsText variant="label" numberOfLines={1} style={styles.blattTitel}>
                  {ueberschrift}
                </SsText>
                {bezirk.kind !== 'alle' ? (
                  <Pressable
                    onPress={() => setzen('bezirk', BEZIRK_ALLE)}
                    accessibilityRole="button"
                    accessibilityLabel="Bezirks-Auswahl aufheben"
                    hitSlop={12}
                    style={styles.blattWeg}>
                    <SsIcon name="kreuz" size={16} color={colors.inkSoft} />
                  </Pressable>
                ) : null}
              </View>
            }>
            {sucheZeile}
            {chipZeile}
            {filterOffen ? <View style={styles.filterImFluss}>{filterFeld}</View> : null}

            {/* Posts ohne Bezirksangabe haben auf einer Karte keinen Ort. Sie hier
                wegzulassen hieße, dass die Ansicht still Posts verschluckt — Ians
                Entscheidung 31. Die Zeile steht bei den anderen Filtern statt im
                Kopf: Dort hätte „3 Posts ohne Bezirk" neben der Überschrift und dem
                ✕ auf 360 px keinen Platz.

                **Und sie steht nur bei ZUGEKLAPPTEM Filter da.** Ist er offen,
                enthält seine Bezirksreihe dieselbe Stufe schon („Ohne Bezirk") — der
                Chip wäre eine Dopplung, und auf 360 × 600 war er am 2026-09-07
                genau die eine Zeile, die unten aus dem Blatt hinausragte. */}
            {ohneBezirk > 0 && !filterOffen ? (
              <View style={styles.blattOhne}>
                <SsChip
                  label={ohneBezirkText(ohneBezirk)}
                  selected={bezirk.kind === 'ohne'}
                  onPress={() =>
                    setzen('bezirk', bezirk.kind === 'ohne' ? BEZIRK_ALLE : BEZIRK_OHNE)
                  }
                />
              </View>
            ) : null}

            {/* Der Sockel wandert in den SCROLL-INHALT, nicht in die Fläche —
                harte Regel 62, wörtlich dieselbe Unterscheidung wie in `SsScreen`:
                *Was scrollt, scrollt unter das Glas.* Ohne ihn liegt die letzte
                Karte hinter der Tab-Kapsel und man bekommt sie nicht hervor. */}
            <FeedListe
              eintraege={eintraege}
              filterAktiv={filterAktiv}
              zuruecksetzen={zuruecksetzen}
              randUnten={tabRand}
            />
          </SsBlatt>
        </>
      )}

      {/* Der Umschalter schwebt über der Karte (Entscheidung 44) — wie die
          Suchleiste bei Apple Karten. Auf iOS bekommt diese Pille in 19e-2 echtes
          Glas; bis dahin ist sie eine gewöhnliche helle Fläche mit Schatten. */}
      <View
        style={[styles.schwebeLeiste, { top: insets.top + spacing.sm }]}
        onLayout={(e) => setLeisteHoehe(e.nativeEvent.layout.height)}>
        {ansichtZeile(true)}
      </View>
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
function StapelDurch({
  filterAktiv,
  zurListe,
}: {
  filterAktiv: boolean;
  zurListe: () => void;
}) {
  return (
    <View style={styles.durch}>
      <View style={styles.durchText}>
        <SsText variant="heading">
          {filterAktiv ? 'Hier ist der Stapel durch' : 'Das war alles für heute'}
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
        label="Posten"
        icon="stift"
        style={styles.durchKnopf}
        onPress={() => router.push('/create')}
      />
      {/* Der Umschalter oben sagt weiter „Stapel", während unten eine Liste steht —
          das stimmt (der Stapel ist durch, die Liste fängt ihn auf), sieht aber
          erklärungsbedürftig aus. Diese Zeile ist die Erklärung und der Weg in
          einem. „Ganze Liste ansehen" stand hier zuerst und war falsch: Die Liste
          steht ja schon da, es wechselt nur die Ansicht. */}
      <Pressable onPress={zurListe} accessibilityRole="button" style={styles.durchLink}>
        <SsText variant="caption" color={categoryColors.creative.base}>
          Zur Listenansicht wechseln
        </SsText>
      </Pressable>
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
        „{eintrag.post.title}" weggewischt
      </SsText>
      <Pressable
        onPress={onZurueck}
        accessibilityRole="button"
        hitSlop={spacing.sm}
        style={styles.rueckKnopf}>
        <SsText variant="label" color={colors.bg}>
          Rückgängig
        </SsText>
      </Pressable>
    </View>
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
}: {
  offen: boolean;
  anzahl: number;
  umschalten: () => void;
}) {
  const hervor = anzahl > 0;
  return (
    <Pressable
      onPress={umschalten}
      accessibilityRole="button"
      accessibilityState={{ expanded: offen }}
      accessibilityLabel={anzahl > 0 ? `Filter, ${anzahl} aktiv` : 'Filter'}
      style={({ pressed }) => [
        styles.filterKnopf,
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
  bezirke,
  ohneBezirk,
  aktiv,
  zuruecksetzen,
  meinJahrgang,
}: {
  filter: FeedFilter;
  setzen: <K extends keyof FeedFilter>(feld: K, wert: FeedFilter[K]) => void;
  bezirke: string[];
  /** Wie viele Posts gerade GAR keinen Bezirk haben — Phase 19b. */
  ohneBezirk: number;
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

      <FilterGruppe titel="Wann">
        {WANN_ORDER.map((w) => (
          <SsChip
            key={w}
            label={WANN_LABELS[w]}
            selected={filter.wann === w}
            onPress={() => setzen('wann', w)}
          />
        ))}
      </FilterGruppe>

      {/* Nur die Bezirke, in denen gerade wirklich etwas los ist (`useBezirkeImFeed`).
          Eine Reihe mit allen 23 wäre zu 20 Teilen eine Sackgasse. */}
      <FilterGruppe
        titel="Bezirk"
        hinweis={bezirke.length === 0 ? 'gerade nichts mit Bezirk' : undefined}>
        <SsChip
          label="Überall"
          selected={filter.bezirk.kind === 'alle'}
          onPress={() => setzen('bezirk', BEZIRK_ALLE)}
        />
        {bezirke.map((b) => (
          <SsChip
            key={b}
            label={b}
            selected={filter.bezirk.kind === 'einer' && filter.bezirk.plz === b}
            onPress={() =>
              setzen(
                'bezirk',
                filter.bezirk.kind === 'einer' && filter.bezirk.plz === b
                  ? BEZIRK_ALLE
                  : { kind: 'einer', plz: b },
              )
            }
          />
        ))}
        {/* Seit Phase 19b eine eigene Stufe und keine Lücke mehr: Posts, bei denen
            niemand einen Bezirk angegeben hat. Sie steht nur da, wenn es welche
            gibt — eine Pille, die immer null Ergebnisse liefert, ist eine
            Sackgasse wie die 23 leeren Bezirke daneben. */}
        {ohneBezirk > 0 ? (
          <SsChip
            label="Ohne Bezirk"
            selected={filter.bezirk.kind === 'ohne'}
            onPress={() =>
              setzen('bezirk', filter.bezirk.kind === 'ohne' ? BEZIRK_ALLE : BEZIRK_OHNE)
            }
          />
        ) : null}
      </FilterGruppe>

      {/* Seit Phase 18b ein Schiebe-Balken statt einer Pillenreihe — Ians
          Entscheidung 17: „mehr als Jahrgang brauchen wir nicht."

          `reihe={false}`, und das ist keine Kleinigkeit: `SsScrollReihe` ist ein
          waagrechter ScrollView, und ein Regler DARIN würde sich mit ihm um jede
          Berührung streiten (die Phase-11-Falle, siehe `SsJahrgangBalken`). Der
          Regler steht deshalb im ruhigen Block.

          Der Vorschlag beim Einschalten kommt aus dem eigenen Jahrgang. Das ist NICHT
          die verworfene Regel `'zu-mir'` aus `filter.ts` — die würde still
          mitfiltern; hier steht die Spanne sichtbar da und ist sofort verschiebbar. */}
      <FilterGruppe titel="Jahrgang" reihe={false}>
        <View style={styles.filterPillen}>
          <SsChip
            label={FILTER_EGAL}
            selected={filter.alter.kind === 'egal'}
            onPress={() => setzen('alter', { kind: 'egal' })}
          />
          <SsChip
            label="Bestimmte Jahrgänge"
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
          <SsText variant="label" color={categoryColors.creative.base}>
            Alle Filter zurücksetzen
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
          <SsText variant="label" color={categoryColors.creative.base}>
            Filter zurücksetzen
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
        label="Etwas posten"
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

  ansichtZeile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },

  /**
   * Der runde „Posten"-Knopf. Die Höhe von 44 ist Apples Mindestmaß für ein
   * Berührungsziel und zugleich die Höhe des Umschalters daneben — der harte Rand
   * unten kommt oben drauf, wie bei jedem `SsButton`.
   */
  posten: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: accent.base,
    borderBottomWidth: DEPTH,
    borderColor: accent.deep,
    cursor: 'pointer',
  },
  // Rand weg (−4), Margin dazu (+4): Die Höhe bleibt gleich, der Knopf sitzt
  // sichtbar tiefer. Dieselbe Rechnung wie in `SsButton`, damit sich beide gleich
  // anfühlen.
  postenGedrueckt: { borderBottomWidth: 0, marginTop: DEPTH },

  // ── Phase 15: Suche und Filter ──────────────────────────────────────────
  sucheZeile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  // `minWidth: 0` ist hier Pflicht und nicht Vorsicht: Ohne das schrumpft ein
  // `flex: 1`-Kind im Browser nicht unter seine Eigenbreite (`min-width: auto`),
  // und der lange Platzhaltertext schiebt den Filter-Knopf aus dem Bild.
  sucheFeld: { flex: 1, minWidth: 0 },

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
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
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
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  filterGruppe: { gap: spacing.sm },
  filterKopf: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  filterPillen: { flexDirection: 'row', gap: spacing.sm },
  filterBalken: { marginTop: spacing.sm },
  filterZuruecksetzen: { alignSelf: 'flex-start', cursor: 'pointer' },

  // Die Reihe geht von Kante zu Kante (damit die Pillen unter dem Rand
  // hindurchscrollen), das Innenmaß unten setzt die erste Pille bündig unter den
  // Rest. KEIN negativer Rand mehr: Der stammte aus Phase 2, als `SsScreen` noch
  // seine eigenen 16 px Seitenrand hatte. Seit `seite: { paddingHorizontal: 0 }`
  // gab es nichts mehr aufzuheben — er zog die Reihe 16 px ÜBER die Kante hinaus,
  // und das Innenmaß schob die erste Pille dadurch exakt auf x = 0. Genau das hat
  // Ian am Handy gesehen: „Alle" klebte am Bildschirmrand.
  //
  // `flexGrow/flexShrink: 0` stehen jetzt in `SsScrollReihe` selbst — es war nie
  // eine Eigenschaft dieses Screens, sondern eine jeder waagrechten Reihe neben
  // einer Liste.
  chipZeile: {},
  chipInhalt: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

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
  vollbildLeer: { flex: 1 },

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
  luecke: { height: spacing.md },

  durch: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  durchText: { alignItems: 'center', gap: spacing.xs },
  durchKnopf: { alignSelf: 'center' },
  durchLink: { cursor: 'pointer' },

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
});
