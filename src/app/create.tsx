import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PostCard } from '@/components/PostCard';
import {
  SsBack,
  SsButton,
  SsChip,
  SsInput,
  SsScreen,
  SsSegment,
  SsText,
} from '@/components/ui';
import { BRAND } from '@/config/brand';
import { LEVEL_LABELS } from '@/config/categories';
import { postErstellen, type FeedEintrag } from '@/features/posts/hooks';
import {
  ablaufZeitpunkt,
  SICHTDAUER_STANDARD,
  SICHTDAUERN,
  type Sichtdauer,
} from '@/features/posts/lifecycle';
import { useCurrentUser } from '@/features/social/hooks';
import { istWienerBezirk } from '@/lib/bezirk';
import { parseUhrzeit, startText, tagText, uhrzeitText, zeitpunkt } from '@/lib/zeit';
import { CATEGORY_ORDER, colors, radius, spacing, status } from '@/theme';
import type { ActivityCategory, SkillLevel, Visibility } from '@/types/models';

/**
 * Einen Post schreiben — der Screen, ohne den die App nur ein Katalog wäre.
 *
 * ── Warum es hier keinen Kalender und keine Uhr-Auswahl gibt ──────────────────
 * Die schönen Rad-Auswahlfelder von iOS sind native Module. Harte Regel 1 aus
 * CLAUDE.md: im Prototyp bleibt alles JS-only, damit die Web-Version verlässlich
 * läuft. Also Tag-Pillen für die nächste Woche und ein Zahlenfeld für die Uhrzeit.
 * Das ist nicht der Notbehelf, für den es aussieht: fast alles in dieser App findet
 * heute oder morgen statt — sieben Pillen decken den echten Fall in einem Tipp ab,
 * ein Kalender bräuchte dafür drei.
 *
 * ── Warum die Vorschau ganz oben steht ────────────────────────────────────────
 * Ein Post ist kein Formular, sondern eine Karte, die andere im Feed sehen. Wer beim
 * Schreiben sieht, wie sie aussieht, schreibt kürzere Titel und bessere Notizen. Oben
 * und nicht unten, weil man sonst erst nach dem Ausfüllen dorthin kommt — dann ist es
 * keine Vorschau mehr, sondern eine Bestätigung.
 */

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
  const [sichtdauer, setSichtdauer] = useState<Sichtdauer>(SICHTDAUER_STANDARD);
  const [bezirk, setBezirk] = useState(ich.district);
  const [level, setLevel] = useState<SkillLevel>('any');
  const [plaetze, setPlaetze] = useState(2);
  const [treffpunkt, setTreffpunkt] = useState('');
  const [notiz, setNotiz] = useState('');
  const [sichtbarkeit, setSichtbarkeit] = useState<Visibility>('public');

  // Fehler erst nach dem ersten Versuch zu posten. Ein Formular, das einen anmeckert,
  // bevor man angefangen hat, liest sich wie ein Vorwurf.
  const [geprueft, setGeprueft] = useState(false);

  const titelSauber = titel.trim();
  const minuten = parseUhrzeit(zeitRoh);
  const startsAt = minuten === null ? null : zeitpunkt(tagVersatz, minuten);
  const laeuftAb = startsAt === null ? null : ablaufZeitpunkt(startsAt, sichtdauer);

  const fehler = {
    kategorie: kategorie ? '' : 'Wähle aus, worum es geht.',
    titel: titelSauber.length >= 3 ? '' : 'Ein paar Wörter, damit man weiß, was los ist.',
    bezirk: istWienerBezirk(bezirk) ? '' : 'Ein Wiener Bezirk zwischen 1010 und 1230.',
    zeit: zeitFehler(zeitRoh, startsAt),
  };
  const allesOk = Object.values(fehler).every((f) => f === '');

  // Die Zeit meldet sich sofort, der Rest erst nach dem Versuch: Tag und Uhrzeit hat
  // man gerade selbst eingestellt und sieht sie in der Vorschau stehen. Ein Termin,
  // der schon vorbei ist, muss genau dort auffallen und nicht erst am Ende.
  const zeigen = (feld: keyof typeof fehler) =>
    geprueft || feld === 'zeit' ? fehler[feld] : '';

  function absenden() {
    setGeprueft(true);
    if (!allesOk || !kategorie || !startsAt) return;

    const id = postErstellen({
      category: kategorie,
      title: titelSauber,
      district: bezirk.trim(),
      startsAt,
      expiresAt: ablaufZeitpunkt(startsAt, sichtdauer),
      level,
      spotsTotal: plaetze,
      note: notiz,
      meetingPoint: treffpunkt,
      visibility: sichtbarkeit,
    });

    // `replace` und nicht `push`: der halb ausgefüllte Erstellen-Screen soll nicht
    // hinter dem fertigen Post liegen bleiben. Zurück führt von dort in den Feed.
    router.replace({ pathname: '/post/[id]', params: { id } });
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
                  district: istWienerBezirk(bezirk) ? bezirk.trim() : ich.district,
                  startsAt: startsAt ?? zeitpunkt(tagVersatz, 12 * 60),
                  expiresAt: laeuftAb ?? undefined,
                  level,
                  spotsTotal: plaetze,
                  spotsFilled: 0,
                  note: notiz.trim(),
                  meetingPoint: treffpunkt.trim() || undefined,
                  visibility: sichtbarkeit,
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

      <SsInput
        label="Bezirk"
        hint="nur die Postleitzahl"
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

      <Feld titel="Wer soll es sehen?">
        <SsSegment<Visibility>
          value={sichtbarkeit}
          onChange={setSichtbarkeit}
          options={[
            { wert: 'public', label: 'Alle' },
            { wert: 'followers', label: 'Nur meine Follower' },
          ]}
        />
        <SsText variant="caption" color={colors.inkSoft}>
          {sichtbarkeit === 'public'
            ? `Jeder in ${BRAND.city} sieht deinen Post im Feed.`
            : `Nur wer dir folgt, sieht ihn — das sind gerade ${ich.followerIds.length} Leute.`}
        </SsText>
      </Feld>

      <View style={styles.abschluss}>
        {geprueft && !allesOk ? (
          <SsText variant="caption" color={status.danger} center>
            Oben fehlt noch was — die roten Stellen.
          </SsText>
        ) : null}
        <SsButton label="Posten" icon="✏️" block size="lg" onPress={absenden} />
      </View>
    </SsScreen>
  );
}

/**
 * Die Vorschau: exakt dieselbe `PostCard` wie im Feed, nicht eine nachgebaute.
 * Eine zweite Karte, die „ungefähr so" aussieht, wäre spätestens beim nächsten
 * Feed-Umbau eine Lüge — und die Vorschau ist genau das, was man nicht anzweifeln darf.
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
 * Was in der Uhrzeit steht, wenn der Screen aufgeht: die übernächste volle Stunde.
 * Also mindestens eine gute Stunde Vorlauf — genug, dass jemand die Anfrage sieht
 * und man noch hinkommt. Nachts wird daraus 10:00, weil „Morgen 01:00" niemand meint.
 */
function zeitVorschlag(jetzt: Date = new Date()): { tage: number; minuten: number } {
  const d = new Date(jetzt);
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 2);

  const tage = Math.round(
    (new Date(d).setHours(0, 0, 0, 0) - new Date(jetzt).setHours(0, 0, 0, 0)) / 86_400_000,
  );
  if (d.getHours() < 8) return { tage, minuten: 10 * 60 };
  return { tage, minuten: d.getHours() * 60 };
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
