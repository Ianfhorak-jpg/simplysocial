import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AntwortLeiste } from '@/components/AntwortLeiste';
import { PostCard } from '@/components/PostCard';
import { WischStapel, anleitungGesehen, anleitungMerken } from '@/components/WischStapel';
import {
  SsButton,
  SsChip,
  SsIcon,
  SsInput,
  SsScreen,
  SsJahrgangBalken,
  SsScrollReihe,
  SsSegment,
  SsText,
} from '@/components/ui';
import { FILTER_EGAL, jahrgangMax, jahrgangMin, spanneUmJahrgang } from '@/config/alter';
import { BRAND } from '@/config/brand';
import { useCurrentUser } from '@/features/social/hooks';
import { WANN_LABELS, WANN_ORDER } from '@/features/posts/filter';
import {
  FILTER_LEER,
  aktiveFilter,
  useBezirkeImFeed,
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
import { CATEGORY_ORDER, categoryColors, colors, radius, spacing } from '@/theme';

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
 */

type Ansicht = 'stapel' | 'liste';

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
      aktiv={filterAktiv}
      zuruecksetzen={zuruecksetzen}
      meinJahrgang={ich.jahrgang}
    />
  ) : null;

  return (
    // `keyboard` steht hier wegen der Antwort-Leiste: Sie klebt am unteren Rand, und
    // auf iOS läge sie sonst unter der Tastatur. Fest gesetzt und nicht umgeschaltet
    // — ein Wechsel würde den ganzen Inhalt neu einhängen und mitten in der
    // Wischbewegung den Stapel zurücksetzen.
    <SsScreen tabScreen keyboard contentStyle={styles.seite}>
      <View style={styles.kopf}>
        <View style={styles.marke}>
          <SsText variant="title">
            {BRAND.wordmark.first}
            <SsText variant="title" color={categoryColors.creative.base}>
              {BRAND.wordmark.second}
            </SsText>
          </SsText>
          <SsText variant="caption" color={colors.inkSoft}>
            {BRAND.city}
          </SsText>
        </View>
        {/* Der Weg zum Posten steht im Kopf und nicht als schwebender Knopf über der
            Liste: ein schwebender Knopf verdeckt immer genau die Karte, die man
            gerade lesen will — und unten ist schon die Tab-Leiste. */}
        <SsButton label="Posten" icon="stift" onPress={() => router.push('/create')} />
      </View>

      {/* Die Zeile verdient ihre Höhe zweimal: links der Umschalter, rechts die
          Zahl. Gerade im Stapel ist "wie viel kommt noch" die Frage, die man sich
          nach der zweiten Karte stellt — ohne Antwort fühlt sich jeder Stapel
          unendlich oder gleich zu Ende an. */}
      <View style={styles.ansichtZeile}>
        <SsSegment<Ansicht>
          value={ansicht}
          onChange={setAnsicht}
          style={styles.ansicht}
          options={[
            { wert: 'stapel', label: 'Stapel' },
            { wert: 'liste', label: 'Liste' },
          ]}
        />
        <SsText variant="caption" color={colors.inkSoft}>
          {ansicht === 'stapel' ? kartenZahl(karten.length) : postZahl(eintraege.length)}
        </SsText>
      </View>

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

      {/* Die Kategorien bleiben IMMER sichtbar und wandern nicht mit in den
          Filterbereich. Sie sind der meistbenutzte Filter, und sie sind das
          Erkennungszeichen der App — sechs Farben, die sonst nirgends vorkommen.
          Eingeklappt wäre der Feed eine Liste ohne Gesicht. */}
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

/** "Noch 7 Karten" · "Noch 1 Karte" · "Durch". Einzahl und Mehrzahl an einer Stelle. */
function kartenZahl(anzahl: number): string {
  if (anzahl === 0) return 'Durch';
  return anzahl === 1 ? 'Noch 1 Karte' : `Noch ${anzahl} Karten`;
}

function postZahl(anzahl: number): string {
  return anzahl === 1 ? '1 Post' : `${anzahl} Posts`;
}

/** Die Liste — bis Phase 11 der ganze Screen, jetzt eine von zwei Ansichten. */
function FeedListe({
  eintraege,
  filterAktiv,
  zuruecksetzen,
}: {
  eintraege: FeedEintrag[];
  filterAktiv: boolean;
  zuruecksetzen: () => void;
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
      contentContainerStyle={styles.liste}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<LeererFeed filterAktiv={filterAktiv} zuruecksetzen={zuruecksetzen} />}
    />
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
      <SsText variant="label" color={hervor ? colors.bg : colors.ink}>
        {anzahl > 0 ? `Filter · ${anzahl}` : 'Filter'}
      </SsText>
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
  aktiv,
  zuruecksetzen,
  meinJahrgang,
}: {
  filter: FeedFilter;
  setzen: <K extends keyof FeedFilter>(feld: K, wert: FeedFilter[K]) => void;
  bezirke: string[];
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
          selected={filter.bezirk === null}
          onPress={() => setzen('bezirk', null)}
        />
        {bezirke.map((b) => (
          <SsChip
            key={b}
            label={b}
            selected={filter.bezirk === b}
            onPress={() => setzen('bezirk', filter.bezirk === b ? null : b)}
          />
        ))}
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
  kopf: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  marke: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },

  // Die Mindestbreite ist keine Kosmetik, sondern die Reparatur einer Falle:
  // `flex: 1` heißt in React Native `flexBasis: 0` (im Browser wäre es `auto`). Die
  // beiden Hälften von `SsSegment` melden damit Breite null an. Als einziges Kind
  // einer Spalte wird das Segment trotzdem auf volle Breite gestreckt — in dieser
  // ZEILE hier gibt es nichts, was es streckt, und es fiel auf seine Polsterung
  // zusammen: aus „Stapel" wurde „Sta…". 78 px je Hälfte reichen für die
  // 15-px-Beschriftung.
  ansicht: { minWidth: 168 },

  ansichtZeile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },

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
    gap: spacing.sm,
    // Dieselbe Höhe wie ein `SsInput`: 12 oben und unten plus 20 Zeilenhöhe.
    paddingVertical: spacing.md,
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
