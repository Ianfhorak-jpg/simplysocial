import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PostCard } from '@/components/PostCard';
import {
  SsBack,
  SsButton,
  SsChip,
  SsIcon,
  SsInput,
  SsScreen,
  SsSegment,
  SsText,
} from '@/components/ui';
import { BRAND } from '@/config/brand';
import { AGE_LABELS, AGE_ORDER } from '@/config/alter';
import { LEVEL_LABELS } from '@/config/categories';
import { sichtbarkeitBauen } from '@/features/groups/gruppe';
import { useMeineGruppen } from '@/features/groups/hooks';
import { postErstellen, type FeedEintrag } from '@/features/posts/hooks';
import {
  ablaufZeitpunkt,
  SICHTDAUER_STANDARD,
  SICHTDAUERN,
  type Sichtdauer,
} from '@/features/posts/lifecycle';
import { useCurrentUser } from '@/features/social/hooks';
import { istWienerBezirk } from '@/lib/bezirk';
import {
  naechsteHalbeStunde,
  parseUhrzeit,
  startText,
  tagText,
  tageEntfernt,
  uhrzeitText,
  zeitpunkt,
} from '@/lib/zeit';
import { CATEGORY_ORDER, colors, radius, spacing, status } from '@/theme';
import type { IconName } from '@/theme/icons';
import type { ActivityCategory, AgeGroup, SkillLevel, VisibilityKind } from '@/types/models';

/**
 * Einen Post schreiben — der Screen, ohne den die App nur ein Katalog wäre.
 *
 * ── Seit Phase 12: zwei Felder statt zehn ─────────────────────────────────────
 * Ians Entscheidung vom 2026-09-01 (Phase 12), nachdem er den Prototyp am Handy
 * ausprobiert hat: Sichtbar sind **Kategorie und Titel**, mehr nicht. Alles andere
 * liegt hinter der Zeile „Mehr einstellen".
 *
 * Das funktioniert nur, weil jedes versteckte Feld eine Voreinstellung hat, die für
 * sich allein einen gültigen Post ergibt (`STANDARD` unten). Wer nie aufklappt,
 * postet trotzdem etwas Vollständiges.
 *
 * **Ich habe ihm widersprochen:** Ein Treffen ohne Zeit und Ort ist keines, und
 * Voreinstellungen, die niemand liest, sind Voreinstellungen, die niemand meint —
 * zehn Posts um dieselbe Uhrzeit im selben Bezirk. Er hat sich trotzdem für das
 * Minimum entschieden, und das ist seine App. Die **Vorschau ist die Absicherung
 * dafür**: Sie steht ganz oben und ist ab jetzt die einzige Stelle, an der man
 * sieht, was die Standardwerte gesetzt haben — „Heute 18:30 · 1070 Wien" steht dort,
 * bevor man auf Posten tippt. Wer sie ignoriert, hat es zumindest gesehen.
 *
 * ── Warum doch das Burger-Symbol ──────────────────────────────────────────────
 * Ian hat „Burger-Icon“ gesagt. Ich hatte ein Zahnrad eingebaut und dagegengehalten: drei
 * Striche heißen überall Menü oder Navigation, in einem Formular sucht man dahinter
 * den Weg woandershin und keine Einstellungen. Am 2026-09-02 hat er es sich noch
 * einmal angesehen und bei den drei Strichen bleiben wollen — **es ist seine App**.
 * Steht in `MEHR_SYMBOL`, ein Wort.
 *
 * ── Warum es hier keinen Kalender und keine Uhr-Auswahl gibt ──────────────────
 * Die schönen Rad-Auswahlfelder von iOS sind native Module. Harte Regel 1 aus
 * CLAUDE.md: im Prototyp bleibt alles JS-only, damit die Web-Version verlässlich
 * läuft. Also Tag-Pillen für die nächste Woche und ein Zahlenfeld für die Uhrzeit.
 * Das ist nicht der Notbehelf, für den es aussieht: fast alles in dieser App findet
 * heute oder morgen statt — sieben Pillen decken den echten Fall in einem Tipp ab,
 * ein Kalender bräuchte dafür drei.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS DASTEHT, WENN NIEMAND AUFKLAPPT
 *  Ians Entscheidung, 2026-09-01 (PLAN.md, Phase 12).
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Diese sechs Werte sind seit Phase 12 keine Vorbelegung mehr, sondern der Post,
 * den die meisten Leute wirklich abschicken werden. Wer einen davon ändert, ändert
 * das Verhalten der App für alle, die das Formular nie öffnen. **Nicht ohne
 * Rückfrage.**
 */
const STANDARD = {
  /** Vorlauf, aus dem sich „Wann" ergibt — aufgerundet auf die nächste halbe Stunde. */
  vorlaufMinuten: 90,
  /** Wie viele mitkönnen. Drei, weil zwei nach Verabredung klingt und fünf nach Verein. */
  plaetze: 3,
  /** Können: keine Hürde. Wer „Fortgeschritten" will, klappt auf und sagt es. */
  level: 'any' as SkillLevel,
  /**
   * Altersgruppe: für alle. Phase 15.
   *
   * Die Voreinstellung ist hier mehr als Bequemlichkeit — sie ist die Haltung der
   * App. Ein Vorschlag ist offen, bis jemand ihn ausdrücklich einschränkt; niemand
   * grenzt versehentlich Leute aus, weil er ein Feld nicht aufgeklappt hat.
   */
  alter: 'egal' as AgeGroup,
  /**
   * Sichtbarkeit: alle. Ein Post, den nur Follower oder eine Gruppe sehen, ist eine
   * bewusste Ansage.
   *
   * Nur der SCHLÜSSEL, nicht die ganze `Visibility`: Die dritte Stufe (Phase 17)
   * braucht eine Gruppen-ID, und die kann in einer Voreinstellung für alle nicht
   * stehen — jeder ist in anderen Gruppen, und die meisten in gar keiner.
   */
  sichtbarkeit: 'public' as VisibilityKind,
  /** Sichtdauer: Ians Regel aus `lifecycle.ts` — bis zum Ende des Tages. */
  sichtdauer: SICHTDAUER_STANDARD,
  // Der Bezirk steht nicht hier, weil er nicht für alle gleich ist: Er kommt aus dem
  // eigenen Profil — und ist seit 2026-09-02 als einziges Feld ganz freiwillig, siehe
  // `BEZIRK_FREIWILLIG` unten. Später soll die App einmal nach dem Standort fragen und
  // daraus NUR den Bezirk behalten — siehe `_FUER_IAN/OFFENE_SACHEN.md`.
} as const;

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DER BEZIRK IST FREIWILLIG
 *  Ians Entscheidung, 2026-09-02.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Gefragt war eigentlich etwas anderes: was passieren soll, wenn ein zugeklapptes
 * Feld ungültig ist. Seine Antwort war, die Frage wegzunehmen — **wer keinen Bezirk
 * angeben will, muss keinen angeben.** Ein leeres Feld ist dann kein Fehler mehr,
 * und der häufigste Fall des Problems verschwindet, statt behandelt zu werden.
 *
 * Das ist mehr als eine Formular-Erleichterung, es ändert das Datenmodell:
 * `post.district` ist seit dieser Entscheidung `string | null` (`types/models.ts`),
 * und was stattdessen dasteht, entscheidet `ortText()` in `lib/bezirk.ts` an genau
 * einer Stelle für alle sieben Screens.
 *
 * **Der Haken, den er kennt:** „Wien“ ist als Ortsangabe fast nichts. Wenn viele das
 * Feld leer lassen, verliert der Feed genau die Angabe, mit der man entscheidet, ob
 * man hingeht. Falls das im Betrieb auffällt, ist die Korrektur klein und steht
 * hier: `BEZIRK_FREIWILLIG` auf `false`, dann ist das Feld wieder Pflicht.
 */
const BEZIRK_FREIWILLIG = true;

/**
 * ── Was bleibt: ein VERSTECKTES Feld mit einem Vertipper ──────────────────────
 *
 * Ians Entscheidung nimmt den häufigen Fall weg, nicht den ganzen. Übrig bleibt:
 * jemand klappt auf, tippt „9999“ oder „99:99“, klappt zu und drückt auf „Posten“.
 * Das ist kein leeres Feld, sondern ein falsches — und das darf nicht durchgehen.
 *
 * Eingebaut ist `'aufklappen'`: Der Bereich geht von selbst auf, der rote Satz steht
 * da, wo er hingehört. Es ist als einziges weder ein Versprechen noch ein Wegwerfen.
 * Die anderen beiden bleiben als Gedächtnis stehen, nicht als Einladung:
 *   • `'reparieren'` — still auf den Standard zurücksetzen und posten. Angenehm, aber
 *     die App ändert dann heimlich, was jemand getippt hat. Aus „19:00“ würde „10:00“,
 *     und jemand stünde zur falschen Zeit am Treffpunkt.
 *   • `'nur melden'` — Fehler zeigen, zugeklappt lassen. Ehrlich, aber der Satz zeigt
 *     auf eine Stelle, die man erst suchen muss.
 *
 * Seit der Bezirk freiwillig ist, ist dieser Fall selten genug, dass er keine eigene
 * Frage mehr wert ist — aber häufig genug, dass er nicht stillschweigend posten darf.
 */
const VERSTECKTER_FEHLER: 'aufklappen' | 'reparieren' | 'nur melden' = 'aufklappen';

/**
 * Das Symbol vor „Mehr einstellen“. Ians Wahl vom 2026-09-02: die drei Striche.
 *
 * Seit Phase 14 gezeichnet statt als Zeichen ☰ gesetzt — dieselbe Form, aber jetzt
 * exakt so dick wie jeder andere Strich der App. Das Schriftzeichen war je nach
 * Systemschrift mal fetter, mal dünner als alles daneben.
 */
const MEHR_SYMBOL: IconName = 'menu';
/** Feste Spaltenbreite fuers Symbol — siehe `mehrSymbol` unten. */
const SYMBOL_BREITE = 22;

/**
 * Was am Bezirksfeld falsch ist — leerer String heisst "nichts".
 *
 * Zwei verschiedene Fehler, die verschieden klingen muessen: gar nichts eingetippt
 * (nur ein Fehler, wenn `BEZIRK_FREIWILLIG` aus ist) und etwas Falsches eingetippt.
 * "9999" ist kein leeres Feld, sondern ein Vertipper — und den will man wissen,
 * sonst steht am Post eine Zahl, die es in Wien nicht gibt.
 */
function bezirkFehler(roh: string): string {
  if (roh.trim() === '') {
    return BEZIRK_FREIWILLIG ? '' : 'In welchem Bezirk?';
  }
  return istWienerBezirk(roh) ? '' : 'Ein Wiener Bezirk zwischen 1010 und 1230.';
}

/** Wie weit im Voraus man posten kann: heute plus sechs Tage. */
const TAGE_VORAUS = 7;
const LEVELS: readonly SkillLevel[] = ['any', 'beginner', 'intermediate', 'advanced'];
const MIN_PLAETZE = 1;
const MAX_PLAETZE = 10;

export default function CreateScreen() {
  const ich = useCurrentUser();
  const vorschlag = zeitVorschlag();

  const [kategorie, setKategorie] = useState<ActivityCategory | null>(null);
  const [titel, setTitel] = useState('');
  const [tagVersatz, setTagVersatz] = useState(vorschlag.tage);
  const [zeitRoh, setZeitRoh] = useState(uhrzeitText(vorschlag.minuten));
  const [sichtdauer, setSichtdauer] = useState<Sichtdauer>(STANDARD.sichtdauer);
  const [bezirk, setBezirk] = useState(ich.district);
  const [level, setLevel] = useState<SkillLevel>(STANDARD.level);
  const [alter, setAlter] = useState<AgeGroup>(STANDARD.alter);
  // Ausdrücklich `<number>`: `STANDARD` ist `as const`, sonst erbte der Zustand den
  // Literaltyp `3` und der Zähler dürfte ihn nicht mehr ändern.
  const [plaetze, setPlaetze] = useState<number>(STANDARD.plaetze);
  const [treffpunkt, setTreffpunkt] = useState('');
  const [notiz, setNotiz] = useState('');
  // Phase 17: Der Zustand ist der SCHLÜSSEL plus die gewählte Gruppe, nicht die
  // fertige `Visibility` — `SsSegment` vergleicht mit `===`, und zwei gleich
  // aussehende Objekte sind nie `===`. Zusammengesetzt wird beim Absenden, mit
  // `sichtbarkeitBauen()`. Die Begründung steht ausführlich in `types/models.ts`.
  const [sichtArt, setSichtArt] = useState<VisibilityKind>(STANDARD.sichtbarkeit);
  const [gruppeId, setGruppeId] = useState<string | null>(null);

  /** Ist der Bereich hinter „Mehr einstellen" offen? Zu beim Aufschlagen. */
  const [mehr, setMehr] = useState(false);

  // Fehler erst nach dem ersten Versuch zu posten. Ein Formular, das einen anmeckert,
  // bevor man angefangen hat, liest sich wie ein Vorwurf.
  const [geprueft, setGeprueft] = useState(false);

  const meineGruppen = useMeineGruppen();
  /**
   * Die fertige Sichtbarkeit — `null`, wenn „Gruppe" gewählt ist, aber keine.
   *
   * Erreichbar ist das über die Oberfläche nicht (die Stufe wird nur angeboten,
   * wenn man in einer Gruppe ist, und beim Umschalten wird die erste vorbelegt).
   * Erreichbar ist es trotzdem: Wer diesen Screen offen hat und in einem anderen
   * Tab seine letzte Gruppe verlässt, steht genau hier. Deshalb ist es ein Fehler
   * mit Text und kein stiller Rückfall auf „Alle".
   */
  const sichtbarkeit = sichtbarkeitBauen(sichtArt, gruppeId);

  const titelSauber = titel.trim();
  /** Leeres Feld heisst "kein Bezirk" — nicht "noch nicht ausgefuellt". */
  const bezirkLeer = bezirk.trim() === '';
  const minuten = parseUhrzeit(zeitRoh);
  const startsAt = minuten === null ? null : zeitpunkt(tagVersatz, minuten);
  const laeuftAb = startsAt === null ? null : ablaufZeitpunkt(startsAt, sichtdauer);

  const fehler = {
    kategorie: kategorie ? '' : 'Wähle aus, worum es geht.',
    titel: titelSauber.length >= 3 ? '' : 'Ein paar Wörter, damit man weiß, was los ist.',
    bezirk: bezirkFehler(bezirk),
    zeit: zeitFehler(zeitRoh, startsAt),
    sicht: sichtbarkeit === null ? 'Wähle die Gruppe aus, für die der Post gedacht ist.' : '',
  };
  const allesOk = Object.values(fehler).every((f) => f === '');

  /** Die Felder, die seit Phase 12 hinter „Mehr einstellen" liegen können. */
  const versteckterFehler = fehler.bezirk !== '' || fehler.zeit !== '' || fehler.sicht !== '';

  // Die Zeit meldet sich sofort, der Rest erst nach dem Versuch: Tag und Uhrzeit hat
  // man gerade selbst eingestellt und sieht sie in der Vorschau stehen. Ein Termin,
  // der schon vorbei ist, muss genau dort auffallen und nicht erst am Ende.
  const zeigen = (feld: keyof typeof fehler) =>
    geprueft || feld === 'zeit' ? fehler[feld] : '';

  function absenden() {
    setGeprueft(true);

    if (!allesOk) {
      // Siehe `VERSTECKTER_FEHLER` oben: Ein roter Hinweis auf ein zugeklapptes Feld
      // wäre ein Fingerzeig ins Leere.
      if (versteckterFehler && VERSTECKTER_FEHLER === 'aufklappen') setMehr(true);
      if (versteckterFehler && VERSTECKTER_FEHLER === 'reparieren') zurueckAufStandard();
      return;
    }
    if (!kategorie || !startsAt || !sichtbarkeit) return;

    const id = postErstellen({
      category: kategorie,
      title: titelSauber,
      district: bezirkLeer ? null : bezirk.trim(),
      startsAt,
      expiresAt: ablaufZeitpunkt(startsAt, sichtdauer),
      level,
      ageGroup: alter,
      spotsTotal: plaetze,
      note: notiz,
      meetingPoint: treffpunkt,
      visibility: sichtbarkeit,
    });

    // `replace` und nicht `push`: der halb ausgefüllte Erstellen-Screen soll nicht
    // hinter dem fertigen Post liegen bleiben. Zurück führt von dort in den Feed.
    router.replace({ pathname: '/post/[id]', params: { id } });
  }

  /** Nur für `VERSTECKTER_FEHLER === 'reparieren'` — eingebaut ist es nicht. */
  function zurueckAufStandard() {
    const frisch = zeitVorschlag();
    if (fehler.zeit !== '') {
      setTagVersatz(frisch.tage);
      setZeitRoh(uhrzeitText(frisch.minuten));
    }
    if (fehler.bezirk !== '') setBezirk(ich.district);
  }

  return (
    <SsScreen scroll keyboard contentStyle={styles.seite}>
      <SsBack />

      <SsText variant="title">Was hast du vor?</SsText>

      <Vorschau
        eintrag={
          kategorie
            ? {
                post: {
                  id: 'vorschau',
                  authorId: ich.id,
                  category: kategorie,
                  title: titelSauber || 'Dein Titel steht hier',
                  // Leerst du das Feld, steht hier "Wien" — nicht heimlich dein
                  // Profilbezirk. Vorher stand da `: ich.district`, und die Vorschau
                  // zeigte damit einen Bezirk, den der Post nie bekommen haette.
                  // Genau das darf sie nicht: sie ist die Absicherung, nicht Deko.
                  district: istWienerBezirk(bezirk) ? bezirk.trim() : null,
                  startsAt: startsAt ?? zeitpunkt(tagVersatz, 12 * 60),
                  expiresAt: laeuftAb ?? undefined,
                  level,
                  ageGroup: alter,
                  spotsTotal: plaetze,
                  spotsFilled: 0,
                  note: notiz.trim(),
                  meetingPoint: treffpunkt.trim() || undefined,
                  // Steht „Gruppe" ohne Gruppe da, zeigt die Vorschau „Nur einer
                  // Gruppe" — NICHT heimlich „Alle". Harte Regel 18: Die Vorschau
                  // ist die Absicherung, sie darf den Zustand nicht schönen.
                  visibility: sichtbarkeit ?? { kind: 'group', groupId: '' },
                  status: 'open',
                  createdAt: new Date().toISOString(),
                },
                author: ich,
              }
            : null
        }
      />

      <Feld titel="Worum geht es?" fehler={zeigen('kategorie')}>
        <View style={styles.pillen}>
          {CATEGORY_ORDER.map((k) => (
            <SsChip
              key={k}
              category={k}
              selected={kategorie === k}
              onPress={() => setKategorie(k)}
            />
          ))}
        </View>
      </Feld>

      <SsInput
        label="Titel"
        placeholder="Tennis spielen"
        value={titel}
        onChangeText={setTitel}
        maxLength={60}
        error={zeigen('titel')}
      />

      <MehrEinstellen offen={mehr} umschalten={() => setMehr((o) => !o)} />

      {mehr ? (
        <View style={styles.mehrBereich}>
          <Feld titel="Wann?">
            <View style={styles.pillen}>
              {Array.from({ length: TAGE_VORAUS }, (_, i) => (
                <SsChip
                  key={i}
                  label={tagText(zeitpunkt(i, 12 * 60))}
                  selected={tagVersatz === i}
                  onPress={() => setTagVersatz(i)}
                />
              ))}
            </View>
            <SsInput
              value={zeitRoh}
              onChangeText={setZeitRoh}
              placeholder="18:30"
              keyboardType="numbers-and-punctuation"
              maxLength={5}
              suffix="Uhr"
              error={zeigen('zeit')}
              style={styles.zeitFeld}
            />
          </Feld>

          <SsInput
            label="Bezirk"
            hint={BEZIRK_FREIWILLIG ? 'freiwillig — leer heißt „irgendwo in Wien“' : 'nur die Postleitzahl'}
            value={bezirk}
            onChangeText={setBezirk}
            placeholder="1070"
            keyboardType="number-pad"
            maxLength={4}
            suffix="Wien"
            error={zeigen('bezirk')}
          />

          <Feld titel="Wie viele können mitkommen?" hinweis="du selbst zählst nicht mit">
            <Zaehler wert={plaetze} setzen={setPlaetze} />
          </Feld>

          <Feld titel="Können" hinweis="damit sich niemand abgehängt fühlt">
            <View style={styles.pillen}>
              {LEVELS.map((l) => (
                <SsChip
                  key={l}
                  label={LEVEL_LABELS[l]}
                  selected={level === l}
                  onPress={() => setLevel(l)}
                />
              ))}
            </View>
          </Feld>

          <Feld titel="Für wen ist das?" hinweis="damit niemand fehl am Platz ist">
            <View style={styles.pillen}>
              {AGE_ORDER.map((a) => (
                <SsChip
                  key={a}
                  label={AGE_LABELS[a]}
                  selected={alter === a}
                  onPress={() => setAlter(a)}
                />
              ))}
            </View>
            {/* Der Satz steht nur da, wenn jemand einschränkt. Bei „Für alle" wäre
                er eine Erklärung für etwas, das gar nichts tut — und der Screen hat
                seit Phase 12 die Regel, nichts zu zeigen, was nichts sagt. */}
            {alter !== 'egal' ? (
              <SsText variant="caption" color={colors.inkSoft}>
                Dein Post ist trotzdem für alle sichtbar. Die Altersgruppe sagt nur, an
                wen er sich richtet — und andere können danach filtern.
              </SsText>
            ) : null}
          </Feld>

          <SsInput
            label="Treffpunkt"
            hint="freiwillig"
            value={treffpunkt}
            onChangeText={setTreffpunkt}
            placeholder="Beim Eingang der Sportanlage"
            maxLength={80}
          />

          <SsInput
            label="Noch was dazu?"
            hint="freiwillig"
            value={notiz}
            onChangeText={setNotiz}
            placeholder="Hab zwei Schläger dabei, Bälle auch."
            multiline
            maxLength={200}
          />

          {/* Seit Phase 17 drei Stufen. Die dritte steht nur da, wenn man in einer
              Gruppe ist — eine Auswahl, die zu nichts führt, ist keine Auswahl,
              sondern eine Sackgasse (dieselbe Überlegung wie bei den Bezirks-Pillen
              im Feed, die nur zeigen, wo wirklich etwas los ist). */}
          <Feld titel="Wer soll es sehen?" fehler={zeigen('sicht')}>
            <SsSegment<VisibilityKind>
              value={sichtArt}
              onChange={(art) => {
                setSichtArt(art);
                // Beim Umschalten auf „Gruppe" gleich die erste vorbelegen. Ohne
                // das stünde einen Moment lang „Gruppe" ohne Gruppe da — ein
                // Fehler, den niemand gemacht hat und den man trotzdem wegklicken
                // müsste.
                if (art === 'group' && gruppeId === null) setGruppeId(meineGruppen[0]?.id ?? null);
              }}
              options={
                meineGruppen.length > 0
                  ? [
                      { wert: 'public', label: 'Alle' },
                      { wert: 'followers', label: 'Follower' },
                      { wert: 'group', label: 'Gruppe' },
                    ]
                  : [
                      { wert: 'public', label: 'Alle' },
                      { wert: 'followers', label: 'Nur meine Follower' },
                    ]
              }
            />

            {sichtArt === 'group' && meineGruppen.length > 1 ? (
              <View style={styles.pillen}>
                {meineGruppen.map((g) => (
                  <SsChip
                    key={g.id}
                    label={g.name}
                    selected={gruppeId === g.id}
                    onPress={() => setGruppeId(g.id)}
                  />
                ))}
              </View>
            ) : null}

            <SsText variant="caption" color={colors.inkSoft}>
              {sichtErklaerung(sichtArt, ich.followerIds.length, gruppenName(meineGruppen, gruppeId))}
            </SsText>

            {meineGruppen.length === 0 ? (
              // Kein Knopf, nur ein Satz: Wer gerade einen Post schreibt, soll nicht
              // auf einen anderen Screen gelockt werden — der halb getippte Post
              // wäre weg. Der Weg zu den Gruppen steht am Profil.
              <SsText variant="caption" color={colors.inkSoft}>
                Sobald du in einer Gruppe bist, kannst du hier auch nur für sie posten.
              </SsText>
            ) : null}
          </Feld>

          <Feld
            titel="Wie lange sichtbar?"
            hinweis={laeuftAb ? `bis ${startText(laeuftAb)}` : undefined}>
            <View style={styles.pillen}>
              {SICHTDAUERN.map((d) => (
                <SsChip
                  key={d.wert}
                  label={d.label}
                  selected={sichtdauer === d.wert}
                  onPress={() => setSichtdauer(d.wert)}
                />
              ))}
            </View>
            <SsText variant="caption" color={colors.inkSoft}>
              {SICHTDAUERN.find((d) => d.wert === sichtdauer)?.erklaerung}
            </SsText>
          </Feld>
        </View>
      ) : null}

      <View style={styles.abschluss}>
        {geprueft && !allesOk ? (
          <SsText variant="caption" color={status.danger} center>
            Es fehlt noch was — die roten Stellen.
          </SsText>
        ) : null}
        <SsButton label="Posten" icon="stift" block size="lg" onPress={absenden} />
      </View>
    </SsScreen>
  );
}

/**
 * Die Vorschau: exakt dieselbe `PostCard` wie im Feed, nicht eine nachgebaute.
 * Eine zweite Karte, die „ungefähr so" aussieht, wäre spätestens beim nächsten
 * Feed-Umbau eine Lüge — und die Vorschau ist genau das, was man nicht anzweifeln darf.
 *
 * Seit Phase 12 trägt sie mehr: Sie ist die einzige Stelle, an der man Zeit, Bezirk
 * und Plätze sieht, ohne aufzuklappen. Deshalb sagt der Satz darüber jetzt auch, was
 * zu tun ist, wenn dort etwas Falsches steht.
 */
function Vorschau({ eintrag }: { eintrag: FeedEintrag | null }) {
  return (
    <View style={styles.vorschau}>
      <SsText variant="caption" color={colors.inkSoft}>
        So sehen es die anderen
      </SsText>
      {eintrag ? (
        <PostCard eintrag={eintrag} />
      ) : (
        <View style={styles.vorschauLeer}>
          <SsText variant="caption" color={colors.inkSoft} center>
            Sobald du unten eine Kategorie wählst, siehst du hier deine Karte.
          </SsText>
        </View>
      )}
    </View>
  );
}

/**
 * Die Zeile, hinter der die anderen acht Felder liegen.
 *
 * Der Untertitel steht bewusst dabei: „Mehr einstellen" allein sagt nicht, dass es
 * ohne Aufklappen weitergeht — jemand könnte es für einen Pflichtschritt halten und
 * genau das Formular öffnen, das Phase 12 wegräumen sollte.
 */
function MehrEinstellen({ offen, umschalten }: { offen: boolean; umschalten: () => void }) {
  return (
    <Pressable
      onPress={umschalten}
      accessibilityRole="button"
      accessibilityState={{ expanded: offen }}
      style={({ pressed }) => [styles.mehr, pressed && styles.mehrGedrueckt]}>
      {/* Symbol, Beschriftung und Pfeil in EINER Zeile, der Untertitel darunter.
          Als Spalte neben dem Symbol stand das Zahnrad auf halber Höhe des Blocks
          und damit neben der zweiten Zeile statt neben der Beschriftung — am
          Bildschirmfoto sofort zu sehen, im Code nicht. */}
      <View style={styles.mehrZeile}>
        <View style={styles.mehrSymbol}>
          <SsIcon name={MEHR_SYMBOL} size={18} color={colors.ink} />
        </View>
        <SsText variant="label" style={styles.mehrTitel}>
          Mehr einstellen
        </SsText>
        <SsIcon name={offen ? 'chevronUnten' : 'chevronRechts'} size={16} color={colors.inkSoft} />
      </View>
      {offen ? null : (
        <SsText variant="caption" color={colors.inkSoft} style={styles.mehrUnter}>
          Zeit, Bezirk, Plätze — oben in der Vorschau
        </SsText>
      )}
    </Pressable>
  );
}

/** Beschriftung + Inhalt + Fehlerzeile — dasselbe Gerüst, das `SsInput` intern hat. */
function Feld({
  titel,
  hinweis,
  fehler,
  children,
}: {
  titel: string;
  hinweis?: string;
  fehler?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.feld}>
      <View style={styles.feldKopf}>
        <SsText variant="label">{titel}</SsText>
        {hinweis ? (
          <SsText variant="caption" color={colors.inkSoft}>
            {hinweis}
          </SsText>
        ) : null}
      </View>
      {children}
      {fehler ? (
        <SsText variant="caption" color={status.danger}>
          {fehler}
        </SsText>
      ) : null}
    </View>
  );
}

/**
 * Minus, Zahl, Plus.
 *
 * Ein Zahlenfeld wäre weniger Code, aber „wie viele Leute" ist eine Zahl zwischen 1
 * und 10 — dafür die Tastatur aufgehen zu lassen, ist ein Aufwand, der in keinem
 * Verhältnis steht. Zwei Tipps statt Tastatur auf, tippen, Tastatur zu.
 */
function Zaehler({ wert, setzen }: { wert: number; setzen: (n: number) => void }) {
  return (
    <View style={styles.zaehler}>
      <Rund
        zeichen="−"
        aus={wert <= MIN_PLAETZE}
        onPress={() => setzen(Math.max(MIN_PLAETZE, wert - 1))}
      />
      <SsText variant="bodyStrong" center style={styles.zaehlerZahl}>
        {wert}
      </SsText>
      <Rund
        zeichen="+"
        aus={wert >= MAX_PLAETZE}
        onPress={() => setzen(Math.min(MAX_PLAETZE, wert + 1))}
      />
    </View>
  );
}

function Rund({ zeichen, aus, onPress }: { zeichen: string; aus: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={aus}
      accessibilityRole="button"
      accessibilityState={{ disabled: aus }}
      style={({ pressed }) => [styles.rund, aus && styles.rundAus, pressed && !aus && styles.rundGedrueckt]}>
      <SsText variant="title" center color={aus ? colors.line : colors.ink} style={styles.rundZeichen}>
        {zeichen}
      </SsText>
    </Pressable>
  );
}

// ── Kleinkram ────────────────────────────────────────────────────────────────

/**
 * Was in Tag und Uhrzeit steht, wenn der Screen aufgeht.
 *
 * Seit Phase 12 ist das kein Vorschlag mehr, sondern für die meisten Posts die
 * echte Startzeit — das Feld ist zugeklappt. Deshalb ist die Rundung auf die halbe
 * Stunde wichtiger als vorher: „Heute 18:30" liest sich wie eine Verabredung,
 * „Heute 18:07" wie ein Rechenergebnis.
 *
 * Die Rundung selbst steht in `lib/zeit.ts`, weil die Fake-Daten in `data/mock.ts`
 * dieselbe brauchen — und ein Screen darf dort nicht hineingreifen (harte Regel 2).
 *
 * Anderthalb Stunden Vorlauf: genug, dass jemand die Anfrage sieht und man noch
 * hinkommt. Nachts wird daraus 10:00 am nächsten Morgen, weil „Morgen 01:00"
 * niemand meint.
 */
const NACHT_AB = 22;
const NACHT_BIS = 8;
const NACHT_ERSATZ_MINUTEN = 10 * 60;

function zeitVorschlag(jetzt: Date = new Date()): { tage: number; minuten: number } {
  const d = naechsteHalbeStunde(new Date(jetzt.getTime() + STANDARD.vorlaufMinuten * 60_000));
  const tage = tageEntfernt(d.toISOString(), jetzt);

  if (d.getHours() >= NACHT_AB) return { tage: tage + 1, minuten: NACHT_ERSATZ_MINUTEN };
  if (d.getHours() < NACHT_BIS) return { tage, minuten: NACHT_ERSATZ_MINUTEN };
  return { tage, minuten: d.getHours() * 60 + d.getMinutes() };
}

/**
 * Die Uhrzeit ist der einzige Wert, den man beim Tippen kurzzeitig ungültig macht —
 * beim Löschen des Feldes, bevor man neu schreibt. Deshalb schweigt ein leeres Feld,
 * solange man nicht auf „Posten" gedrückt hat (das erledigt `zeigen` oben); alles
 * andere meldet sich sofort.
 */
function zeitFehler(roh: string, startsAt: string | null): string {
  if (roh.trim() === '') return 'Wann geht es los?';
  if (startsAt === null) return 'Eine Uhrzeit wie 18:30.';
  if (new Date(startsAt).getTime() <= Date.now()) return 'Das ist schon vorbei.';
  return '';
}

/**
 * Was unter der Auswahl steht — ein Satz je Stufe.
 *
 * Der Satz nennt bei „Gruppe" den NAMEN und nicht „deine Gruppe": Wer in dreien ist,
 * muss sonst hochschauen, um zu prüfen, welche gerade ausgewählt ist.
 */
function sichtErklaerung(art: VisibilityKind, follower: number, gruppe: string | null): string {
  switch (art) {
    case 'public':
      return `Jeder in ${BRAND.city} sieht deinen Post im Feed.`;
    case 'followers':
      return `Nur wer dir folgt, sieht ihn — das sind gerade ${follower} Leute.`;
    case 'group':
      return gruppe
        ? `Nur die Leute in „${gruppe}" sehen ihn. Im Feed steht er bei ihnen wie jeder andere Post.`
        : 'Wähle noch aus, für welche Gruppe der Post gedacht ist.';
  }
}

/** Der Name der gewählten Gruppe, oder `null`. */
function gruppenName(gruppen: { id: string; name: string }[], id: string | null): string | null {
  return gruppen.find((g) => g.id === id)?.name ?? null;
}

const styles = StyleSheet.create({
  seite: { gap: spacing.xl, paddingTop: spacing.sm },

  vorschau: { gap: spacing.sm },
  vorschauLeer: {
    borderWidth: 1,
    borderColor: colors.line,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    padding: spacing.xl,
    justifyContent: 'center',
    minHeight: 96,
  },

  // Die Zeile sieht bewusst aus wie eine Einstellungszeile und nicht wie ein Button:
  // Sie führt weiter, sie tut nichts. Ein Button mit der Tiefe der App (`DEPTH`)
  // stünde in Konkurrenz zu „Posten" — und es gibt hier nur eine Handlung.
  mehr: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    cursor: 'pointer',
  },
  mehrGedrueckt: { backgroundColor: colors.bg },
  mehrZeile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  // Feste Breite, damit der Untertitel unten genau unter der Beschriftung anfängt
  // und nicht unter dem Symbol. Emojis sind je nach Gerät verschieden breit — ohne
  // die feste Breite wäre der Einzug unten auf jedem Handy ein anderer.
  mehrSymbol: { width: SYMBOL_BREITE, alignItems: 'center' },
  mehrTitel: { flex: 1 },
  mehrUnter: { marginLeft: SYMBOL_BREITE + spacing.md },
  // Derselbe Abstand wie zwischen den Feldern oben — der aufgeklappte Bereich soll
  // wie eine Fortsetzung des Formulars aussehen, nicht wie ein eingelegter Kasten.
  mehrBereich: { gap: spacing.xl },

  feld: { gap: spacing.sm },
  feldKopf: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  pillen: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  zeitFeld: { maxWidth: 160 },

  zaehler: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, alignSelf: 'flex-start' },
  zaehlerZahl: { minWidth: 32 },
  rund: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  rundAus: { cursor: 'auto' as const },
  rundGedrueckt: { backgroundColor: colors.bg },
  // Das Minuszeichen sitzt in seiner Zeile höher als das Plus. Ohne die feste
  // Zeilenhöhe stünden die beiden Knöpfe nebeneinander unterschiedlich hoch.
  rundZeichen: { lineHeight: 30 },

  abschluss: { gap: spacing.md, marginTop: spacing.sm },
});
