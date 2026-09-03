import type { ReactNode } from 'react';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  SsAvatar,
  SsBack,
  SsButton,
  SsCard,
  SsChip,
  SsIcon,
  SsIconText,
  SsInput,
  SsScreen,
  SsScrollReihe,
  SsSegment,
  SsText,
} from '@/components/ui';
import { CATEGORIES } from '@/config/categories';
import { CATEGORY_ORDER, categoryColors, colors, radius, spacing } from '@/theme';
import { ICONS, type IconName } from '@/theme/icons';

/** Alle Icons, in der Reihenfolge, in der sie in `theme/icons.ts` stehen. */
const ICON_NAMEN = Object.keys(ICONS) as IconName[];

/**
 * Der Werkstatt-Screen: zeigt jeden Baustein in jedem Zustand.
 *
 * Er ist NICHT Teil der App, die Ians Freunde sehen — er existiert, damit man das
 * Gefühl beurteilen kann, BEVOR neun Screens darauf aufbauen. Wenn hier ein Button
 * falsch wirkt, kostet die Änderung fünf Minuten. Nach neun Screens kostet sie einen Tag.
 *
 * Wichtig: Dieser Screen liest bewusst KEINE Daten aus mock.ts, sondern nutzt eigene
 * Beispieltexte. Er zeigt Bausteine, nicht Inhalte.
 */
export default function BausteineScreen() {
  const [text, setText] = useState('');
  const [kaputt, setKaputt] = useState('25:99');
  const [suche, setSuche] = useState('Tennis');
  const [wahl, setWahl] = useState<'links' | 'rechts'>('links');

  return (
    <SsScreen scroll keyboard contentStyle={styles.page}>
      <View style={styles.kopf}>
        <SsText variant="title">Bausteine</SsText>
        <SsText variant="body" color={colors.inkSoft}>
          Jeder Baustein in jedem Zustand. Drück die Buttons — sie sollen sich anfassbar anfühlen.
        </SsText>
      </View>

      <Abschnitt titel="Buttons" hinweis="Der harte Rand unten verschwindet beim Drücken.">
        <View style={styles.reihe}>
          <SsButton label="Bin dabei" />
          <SsButton label="Posten" icon="stift" />
          <SsButton label="Abbrechen" variant="ghost" />
        </View>
        <View style={styles.reihe}>
          {/* Rot als Umriss, nicht als Fläche: neben „Bestätigen" soll die Absage
              erkennbar sein, ohne die lauteste Sache auf dem Bildschirm zu werden. */}
          <SsButton label="Ablehnen" variant="danger" />
          <SsButton label="Voll" disabled />
          <SsButton label="Schon angefragt" variant="ghost" disabled />
        </View>
        <SsButton label="Bin dabei" size="lg" block variant="category" category="sport" />
      </Abschnitt>

      <Abschnitt titel="Buttons in den Kategoriefarben">
        <View style={styles.reihe}>
          {CATEGORY_ORDER.map((k) => (
            <SsButton key={k} label={CATEGORIES[k].label} variant="category" category={k} />
          ))}
        </View>
      </Abschnitt>

      <Abschnitt titel="Pillen" hinweis="Links die Kategorie am Post, rechts die Filterleiste.">
        <View style={styles.reihe}>
          {CATEGORY_ORDER.map((k) => (
            <SsChip key={k} category={k} />
          ))}
        </View>
        <View style={styles.reihe}>
          <SsChip label="Alle" selected />
          <SsChip label="Nur Follower" />
          <SsChip category="sport" selected />
          <SsChip label="1220" />
          <SsChip label="Heute 17:30" />
        </View>
      </Abschnitt>

      <Abschnitt
        titel="Waagrechte Reihe"
        hinweis="Die Kante rechts steht nur, wenn wirklich etwas abgeschnitten ist — oben passt alles hinein, unten nicht.">
        <SsScrollReihe contentContainerStyle={styles.scrollReihe}>
          <SsChip label="Alle" selected />
          <SsChip category="sport" />
        </SsScrollReihe>
        <SsScrollReihe contentContainerStyle={styles.scrollReihe}>
          <SsChip label="Alle" selected />
          {CATEGORY_ORDER.map((k) => (
            <SsChip key={k} category={k} />
          ))}
        </SsScrollReihe>
      </Abschnitt>

      <Abschnitt titel="Eingabefelder" hinweis="Der Rahmen wird beim Tippen dunkel — auf iOS gibt es sonst keine Rückmeldung.">
        <SsInput
          label="Titel"
          placeholder="Tennis spielen"
          value={text}
          onChangeText={setText}
          maxLength={60}
        />
        <SsInput
          label="Bezirk"
          hint="nur die Postleitzahl"
          value={kaputt}
          onChangeText={setKaputt}
          suffix="Wien"
          error="Ein Wiener Bezirk zwischen 1010 und 1230."
        />
        <SsInput
          label="Noch was dazu?"
          hint="freiwillig"
          placeholder="Hab zwei Schläger dabei."
          value={text}
          onChangeText={setText}
          multiline
        />
        {/* Phase 15: dasselbe Feld als Suchfeld. Das X steht nur da, solange etwas
            drinsteht — hier sieht man beide Zustände, indem man tippt und löscht. */}
        <SsInput
          label="Suchfeld"
          hint="Icon links, X rechts"
          placeholder="Suchen — Tennis, lernen, Kaffee …"
          icon="lupe"
          value={suche}
          onChangeText={setSuche}
          onClear={() => setSuche('')}
        />
      </Abschnitt>

      <Abschnitt titel="Geteilte Fläche" hinweis="Für ein Entweder-oder. Im Feed und beim Posten dieselbe.">
        <SsSegment<'links' | 'rechts'>
          value={wahl}
          onChange={setWahl}
          options={[
            { wert: 'links', label: 'Alle' },
            { wert: 'rechts', label: 'Nur meine Follower' },
          ]}
        />
      </Abschnitt>

      <Abschnitt titel="Karten" hinweis="Der Streifen links zeigt die Kategorie. Sonst bleibt die Karte ruhig.">
        <SsCard category="sport" onPress={() => {}}>
          <SsText variant="heading">Tennis spielen</SsText>
          <SsText variant="caption" color={colors.inkSoft}>
            1220 · Heute 17:30 · 1 von 2 Plätzen frei
          </SsText>
          <SsText variant="body" color={colors.inkSoft}>
            Hab zwei Schläger dabei, du brauchst nur Sportschuhe.
          </SsText>
        </SsCard>
        <SsCard category="creative">
          <SsText variant="heading">Fotospaziergang am Karlsplatz</SsText>
          <SsText variant="caption" color={colors.inkSoft}>
            1040 · Morgen 18:30 · für Anfänger
          </SsText>
        </SsCard>
        <SsCard>
          <SsText variant="body">Karte ohne Kategorie — zum Beispiel für Einstellungen.</SsText>
        </SsCard>
      </Abschnitt>

      <Abschnitt
        titel="Der Icon-Satz"
        hinweis="Alle Icons in einer Größe und einer Strichstärke. Wenn eines hier aus der Reihe fällt, fällt es überall auf.">
        <View style={styles.iconGitter}>
          {ICON_NAMEN.map((name) => (
            <View key={name} style={styles.iconFeld}>
              <SsIcon name={name} size={26} />
              <SsText variant="caption" color={colors.inkSoft} numberOfLines={1}>
                {name}
              </SsText>
            </View>
          ))}
        </View>
      </Abschnitt>

      <Abschnitt
        titel="Icons in drei Größen"
        hinweis="Der Strich wird bei kleinen Icons kräftiger und bei großen zarter — sonst franst er unten aus und wird oben plump.">
        <View style={styles.reiheMitte}>
          <SsIcon name="fahne" size={14} />
          <SsIcon name="fahne" size={20} />
          <SsIcon name="fahne" size={30} />
          <SsIcon name="fahne" size={44} />
        </View>
        <SsIconText icon="schloss">Icon neben Text, einzeilig</SsIconText>
        <SsIconText icon="warnung" variant="bodyStrong">
          {'Und mehrzeilig: Das Icon bleibt an der ERSTEN Zeile stehen und rutscht nicht in die Mitte des Blocks — das war die Falle aus Phase 12.'}
        </SsIconText>
      </Abschnitt>

      <Abschnitt titel="Profilbilder" hinweis="Initialen auf der Farbe, die aus der Nutzer-ID kommt — derselbe Mensch also immer gleich.">
        <View style={styles.reiheMitte}>
          <SsAvatar name="Ian" seed="u_ian" size="lg" />
          <SsAvatar name="Lea" seed="u_lea" size="md" />
          <SsAvatar name="Tobias" seed="u_tobi" size="md" />
          <SsAvatar name="Mira" seed="u_mira" size="sm" />
          <SsAvatar name="Florian" seed="u_flo" size="sm" />
          <SsAvatar name="Sara" seed="u_sara" size="sm" />
        </View>
      </Abschnitt>

      <Abschnitt titel="Die sechs Aktivitätsfarben" hinweis="Fläche · Grundfarbe · Tiefe (der Rand unten am Button).">
        {CATEGORY_ORDER.map((k) => {
          const p = categoryColors[k];
          return (
            <View key={k} style={styles.farbzeile}>
              <View style={styles.farbname}>
                <SsIcon name={CATEGORIES[k].icon} size={17} color={p.onSoft} />
                <SsText variant="label" color={p.onSoft} style={styles.farbnameText}>
                  {CATEGORIES[k].label}
                </SsText>
              </View>
              <View style={[styles.farbfeld, { backgroundColor: p.soft }]} />
              <View style={[styles.farbfeld, { backgroundColor: p.base }]} />
              <View style={[styles.farbfeld, { backgroundColor: p.deep }]} />
            </View>
          );
        })}
      </Abschnitt>

      <Abschnitt titel="Schriftstufen" hinweis="Alle mit fester Zeilenhöhe — sonst schneidet iOS die Oberlängen ab.">
        <SsText variant="display">Ihr seid verabredet</SsText>
        <SsText variant="title">Anfragen</SsText>
        <SsText variant="heading">Tennis spielen</SsText>
        <SsText variant="body">
          Fließtext, wie er in Notizen und im Chat vorkommt. Zwei Zeilen, damit man den
          Zeilenabstand beurteilen kann.
        </SsText>
        <SsText variant="bodyStrong">Fließtext, hervorgehoben</SsText>
        <SsText variant="label">Button-Beschriftung</SsText>
        <SsText variant="caption" color={colors.inkSoft}>
          1220 · Heute 17:30 · vor 2 Stunden
        </SsText>
      </Abschnitt>

      <Abschnitt titel="Zurück" hinweis="Der einzige Zurück-Knopf der App — er kennt den Fall, dass der Screen direkt per Link geöffnet wurde.">
        <SsBack />
      </Abschnitt>
    </SsScreen>
  );
}

function Abschnitt({ titel, hinweis, children }: { titel: string; hinweis?: string; children: ReactNode }) {
  return (
    <View style={styles.abschnitt}>
      <SsText variant="label" color={colors.inkSoft} style={styles.abschnittTitel}>
        {titel.toUpperCase()}
      </SsText>
      {hinweis ? (
        <SsText variant="caption" color={colors.inkSoft}>
          {hinweis}
        </SsText>
      ) : null}
      <View style={styles.abschnittInhalt}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingTop: spacing.xl, gap: spacing.xxl },
  kopf: { gap: spacing.sm },
  abschnitt: { gap: spacing.xs },
  abschnittTitel: { letterSpacing: 1.2, fontSize: 12 },
  abschnittInhalt: { gap: spacing.md, marginTop: spacing.sm },
  iconGitter: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  // Feste Breite, damit die Namen darunter ein Raster bilden statt zu treppen.
  iconFeld: { width: 88, alignItems: 'center', gap: spacing.xs },
  reihe: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'flex-start' },
  reiheMitte: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignItems: 'center' },
  // Fuer SsScrollReihe: die Pillen liegen in EINER Zeile, kein Umbruch.
  scrollReihe: { gap: spacing.sm, paddingRight: spacing.lg },
  farbzeile: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  farbname: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  farbnameText: { fontSize: 14 },
  farbfeld: { width: 34, height: 26, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line },
});
