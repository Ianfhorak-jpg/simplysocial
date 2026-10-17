import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { PostCard } from '@/components/PostCard';
import { SsAvatar, SsBack, SsScreen, SsText } from '@/components/ui';
import { CATEGORIES } from '@/config/categories';
import type { FeedEintrag } from '@/features/posts/hooks';
import { ortText } from '@/lib/bezirk';
import { startOderSeit } from '@/lib/zeit';
import { categoryColors, colors, ecke, radius, spacing } from '@/theme';
import type { Post, User } from '@/types/models';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DREI FASSUNGEN ZUM ANSCHAUEN — WEGWERF-SCREEN (Phase 20.11-b)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Ians Satz am 2026-09-14: *„Ja zeig sie mir auf meinem Handy oder auf Simulator."* —
 * gemeint sind die drei Fassungen der Post-Karte, die vorher nur als ASCII-Entwurf
 * zur Wahl standen. Er hatte „groß und ruhig" gewählt, ohne sie gesehen zu haben.
 *
 * ⚠️ **DIESER SCREEN WIRD GELÖSCHT, sobald Ian gewählt hat.** Er hat keine Aufgabe in
 * der App; er existiert, damit eine Design-Entscheidung an Bildern getroffen wird und
 * nicht an Beschreibungen (dieselbe Arbeitsweise wie beim Vorbild-Screenshot für die
 * Tab-Leiste). Erreichbar über Einstellungen → „Für die Entwicklung", genau wie
 * `/bausteine` — und aus demselben Grund NICHT über einen Tab.
 *
 * ── Was hier echt ist und was nachgebaut ─────────────────────────────────────
 * **Fassung C ist die echte `PostCard`**, wie sie gerade in der App steht — kein
 * Nachbau. Die Fassungen A und B sind **nachgebaut** und bewusst Wegwerf-Code: Sie
 * benutzen dieselben Daten, dieselben Bausteine (`SsText`, `SsAvatar`) und
 * dieselbe Reihenfolge der Angaben; verschieden ist nur das Styling.
 *
 * **Warum nachgebaut und nicht als Prop in `PostCard`:** Die drei Fassungen
 * unterscheiden sich nicht in einem Wert, sondern im Aufbau — ein Farbband oben ist
 * ein anderer Baum als eine Zeile ohne Kasten. Als `fassung`-Prop wäre `PostCard`
 * dreimal so lang und trüge zwei Entwürfe mit sich herum, die spätestens morgen
 * niemand mehr will. **Der Preis ist benannt:** Wählt Ian A oder B, wird sie in
 * `PostCard` richtig gebaut — was hier steht, ist zum Anschauen, nicht zum Behalten.
 *
 * ── Warum drei Beispiel-Posts und nicht einer ────────────────────────────────
 * Eine einzelne Karte sagt nichts darüber, wie sich zehn davon untereinander
 * anfühlen — und genau das war das Argument gegen die bunte Fassung (der
 * Flickenteppich, siehe `SsCard`-Kommentar vor Phase 20.11). Drei Kategorien mit
 * verschiedenen Farben zeigen das; mit einer Karte hätte man es geraten.
 */

// ── Beispieldaten ────────────────────────────────────────────────────────────
// Bewusst hier und nicht aus `mock.ts`: Der Schalter steht auf `supabase`, dort gibt
// es keine Attrappen-Daten. Und harte Regel 12 gilt auch hier — nichts Persönliches.

const JETZT = Date.now();

function beispielPerson(id: string, name: string, handle: string): User {
  return {
    id,
    handle,
    displayName: name,
    bio: '',
    district: '1220',
    jahrgang: 2009,
    interests: [],
    treffenAnzahl: 4,
    followerIds: [],
    followingIds: [],
    blockedIds: [],
  };
}

function beispielPost(
  id: string,
  category: Post['category'],
  title: string,
  note: string,
  inStunden: number,
  frei: number,
): Post {
  return {
    id,
    authorId: `u-${id}`,
    category,
    title,
    district: '1220',
    startsAt: new Date(JETZT + inStunden * 3600_000).toISOString(),
    level: 'any',
    alter: { kind: 'egal' },
    spotsTotal: frei + 1,
    spotsFilled: 1,
    note,
    visibility: { kind: 'public' },
    status: 'open',
    createdAt: new Date(JETZT).toISOString(),
  };
}

const BEISPIELE: FeedEintrag[] = [
  {
    post: beispielPost('f1', 'sport', 'Tennis spielen', 'Hab zwei Schläger dabei.', 3, 2),
    author: beispielPerson('u-f1', 'Alex', 'alex'),
  },
  {
    post: beispielPost('f2', 'food', 'Kaffee trinken gehen', 'Kenn ein gutes Café am Eck.', 6, 3),
    author: beispielPerson('u-f2', 'Mira', 'mira'),
  },
  {
    post: beispielPost('f3', 'culture', 'Ins Kino', '', 28, 1),
    author: beispielPerson('u-f3', 'Jonas', 'jonas'),
  },
];

export default function PostFassungen() {
  return (
    <SsScreen scroll contentStyle={styles.seite}>
      <SsBack />

      <View style={styles.einleitung}>
        <SsText variant="title">Drei Fassungen</SsText>
        <SsText variant="body" color={colors.inkSoft}>
          Dieselben drei Posts, dreimal anders gezeichnet. Schau, welche dir am besten
          gefällt — dann bau ich die in die ganze App ein und werfe diesen Bildschirm
          wieder weg.
        </SsText>
      </View>

      <Abschnitt
        buchstabe="A"
        titel="Farbband oben"
        erklaerung="Die Kategorie ist ein kräftiges Band über der Karte. Auffällig, aber die Karte bleibt weiß — auch bei zehn Posts untereinander."
      >
        {BEISPIELE.map((e) => (
          <FassungBand key={e.post.id} eintrag={e} />
        ))}
      </Abschnitt>

      <Abschnitt
        buchstabe="B"
        titel="Ganz in der Kategoriefarbe"
        erklaerung="Die ganze Karte in der Farbe. Am auffälligsten — und genau deshalb hier drei verschiedene Kategorien: So siehst du, ob es untereinander unruhig wird."
      >
        {BEISPIELE.map((e) => (
          <FassungBunt key={e.post.id} eintrag={e} />
        ))}
      </Abschnitt>

      <Abschnitt
        buchstabe="C"
        titel="Groß und ruhig"
        erklaerung="Was gerade in der App steht — deine erste Wahl. Kein Kasten, große Schrift, die Kategorie als farbiges Wort. Das hier ist die echte Karte, nicht nachgebaut."
      >
        <View style={styles.ruhigListe}>
          {BEISPIELE.map((e) => (
            <PostCard key={e.post.id} eintrag={e} umgebung="liste" />
          ))}
        </View>
      </Abschnitt>

      <View style={styles.einleitung}>
        <SsText variant="body" color={colors.inkSoft}>
          Sag mir einfach „A", „B" oder „C". Und wenn dir an einer etwas fehlt oder zu
          viel ist, sag das dazu — das lässt sich einzeln ändern.
        </SsText>
      </View>
    </SsScreen>
  );
}

function Abschnitt({
  buchstabe,
  titel,
  erklaerung,
  children,
}: {
  buchstabe: string;
  titel: string;
  erklaerung: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.abschnitt}>
      <View style={styles.kopfZeile}>
        <View style={styles.buchstabe}>
          <SsText variant="label" color={colors.surface}>
            {buchstabe}
          </SsText>
        </View>
        <SsText variant="heading" style={styles.abschnittTitel}>
          {titel}
        </SsText>
      </View>
      <SsText variant="caption" color={colors.inkSoft}>
        {erklaerung}
      </SsText>
      <View style={styles.proben}>{children}</View>
    </View>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  FASSUNG A — Farbband oben          ⚠️ Wegwerf-Code, siehe Kopfkommentar
// ═════════════════════════════════════════════════════════════════════════════

function FassungBand({ eintrag }: { eintrag: FeedEintrag }) {
  const { post, author } = eintrag;
  const palette = categoryColors[post.category];
  const frei = post.spotsTotal - post.spotsFilled;

  return (
    <View style={styles.bandKarte}>
      <View style={[styles.band, { backgroundColor: palette.base }]}>
        <SsText variant="label" color={palette.onBase} style={styles.bandWort}>
          {t(CATEGORIES[post.category].labelKey).toUpperCase()}
        </SsText>
        <SsText variant="caption" color={palette.onBase} style={styles.bandZeit}>
          {startOderSeit(post.startsAt)}
        </SsText>
      </View>

      <View style={styles.bandKoerper}>
        <SsText variant="title" numberOfLines={2}>
          {post.title}
        </SsText>
        <SsText variant="caption" color={colors.inkSoft}>
          {ortText(post.district)}
        </SsText>
        {post.note ? (
          <SsText variant="body" color={colors.inkSoft} numberOfLines={2}>
            {post.note}
          </SsText>
        ) : null}
        <View style={styles.fuss}>
          <View style={styles.person}>
            <SsAvatar name={author.displayName} seed={author.id} size="sm" />
            <SsText variant="caption" color={colors.ink} style={styles.name}>
              {author.displayName}
            </SsText>
          </View>
          <SsText variant="caption" color={colors.ink}>
            {frei === 1 ? '1 Platz frei' : `${frei} Plätze frei`}
          </SsText>
        </View>
      </View>
    </View>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  FASSUNG B — ganz in der Kategoriefarbe   ⚠️ Wegwerf-Code
// ═════════════════════════════════════════════════════════════════════════════

function FassungBunt({ eintrag }: { eintrag: FeedEintrag }) {
  const { post, author } = eintrag;
  const palette = categoryColors[post.category];
  const frei = post.spotsTotal - post.spotsFilled;
  // `onBase` und nicht pauschal Weiß: Auf dem Gelb von Sport wäre weiße Schrift bei
  // 1,85:1 praktisch unlesbar — genau der Grund, warum es die Farbe überhaupt gibt.
  const auf = palette.onBase;

  return (
    <View style={[styles.buntKarte, { backgroundColor: palette.base }]}>
      <View style={styles.buntKopf}>
        <SsText variant="label" color={auf} style={styles.bandWort}>
          {t(CATEGORIES[post.category].labelKey).toUpperCase()}
        </SsText>
        <SsText variant="caption" color={auf}>
          {startOderSeit(post.startsAt)}
        </SsText>
      </View>

      <SsText variant="title" color={auf} numberOfLines={2}>
        {post.title}
      </SsText>
      <SsText variant="caption" color={auf} style={styles.buntLeise}>
        {ortText(post.district)}
      </SsText>
      {post.note ? (
        <SsText variant="body" color={auf} numberOfLines={2} style={styles.buntLeise}>
          {post.note}
        </SsText>
      ) : null}

      <View style={styles.fuss}>
        <View style={styles.person}>
          <SsAvatar name={author.displayName} seed={author.id} size="sm" />
          <SsText variant="caption" color={auf} style={styles.name}>
            {author.displayName}
          </SsText>
        </View>
        <SsText variant="caption" color={auf}>
          {frei === 1 ? '1 Platz frei' : `${frei} Plätze frei`}
        </SsText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  seite: { gap: spacing.xl },
  einleitung: { gap: spacing.sm },

  abschnitt: { gap: spacing.sm },
  kopfZeile: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  buchstabe: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  abschnittTitel: { flex: 1 },
  proben: { gap: spacing.md, marginTop: spacing.sm },

  ruhigListe: { gap: 0 },

  // ── A ──
  bandKarte: { backgroundColor: colors.surface, ...ecke.lg, overflow: 'hidden' },
  band: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  bandWort: { letterSpacing: 0.8 },
  bandZeit: { fontWeight: '700' },
  bandKoerper: { padding: spacing.lg, gap: spacing.sm },

  // ── B ──
  buntKarte: { ...ecke.lg, padding: spacing.lg, gap: spacing.sm },
  buntKopf: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  // Die Nebenangaben treten zurück, ohne die Farbe zu wechseln — auf einer farbigen
  // Fläche gibt es kein „grau", das auf allen sechs Tönen funktioniert.
  buntLeise: { opacity: 0.85 },

  // ── beiden gemeinsam ──
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
