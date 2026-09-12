import { StyleSheet, View } from 'react-native';

import { SsInput } from './SsInput';
import { SsText } from './SsText';
import { BEZIRKS_LISTE, istWienerBezirk } from '@/lib/bezirk';
import { colors, spacing, status } from '@/theme';

/**
 * Den eigenen Bezirk ANGEBEN — als Postleitzahl, nicht als Auswahl.
 *
 * **Ians Rückmeldung vom 2026-09-12, beim ersten eigenen Durchgang durch den
 * Bildschirm fürs erste Konto:** *„bitte merk dir das endlich mit den Bezirken dass
 * das nicht geht, bitte ein Feld wo man seine Postleitzahl eingeben soll weil das
 * geht so gar nicht."*
 *
 * ── Warum 23 Chips hier falsch waren, obwohl sie im FILTER richtig sind ──────
 * Das ist derselbe Unterschied wie bei `BEZIRKS_LISTE` gegen `useBezirkeImFeed`,
 * nur eine Stufe grundsätzlicher: **Beim Filtern WÄHLT man aus dem, was da ist —
 * hier GIBT man etwas an, das man weiß.** Jeder Wiener kennt seine vier Ziffern
 * auswendig; sie unter 23 Chips zu suchen ist mehr Arbeit als sie zu tippen, und
 * auf 360 px sind es sechs Zeilen, die alles darunter aus dem Bild schieben
 * (gemessen: 132 px Überhang allein durch das Raster). Harte Regel 63.
 *
 * ── Was ein Feld dafür mitbringen muss, und eine Liste nicht braucht ─────────
 * Eine Liste bestätigt sich selbst — was dasteht, gibt es. Ein freies Feld tut das
 * nicht: `1240` sieht aus wie ein Bezirk und ist keiner. Deshalb zeigt das Feld bei
 * einer gültigen Zahl den NAMEN dazu („1220 · Donaustadt"). **Das ist keine Zierde,
 * sondern der Ersatz für die Bestätigung, die die Liste geschenkt hat** — und es
 * fängt den Zahlendreher ab, den eine reine Gültigkeitsprüfung durchlässt: Wer 1120
 * statt 1210 tippt, liest „Meidling" und nicht „Floridsdorf".
 *
 * Geprüft wird über `istWienerBezirk()` aus `lib/bezirk.ts` — die Regel „vierstellig,
 * fängt mit 1 an" ließe 1000, 1240 und 1234 durch, die es alle nicht gibt.
 */
export function SsBezirkFeld({
  wert,
  setzen,
  label = 'Wo wohnst du?',
  hinweis,
  fehler,
}: {
  wert: string;
  setzen: (plz: string) => void;
  label?: string;
  /** Warum gefragt wird. Steht unter dem Label, nicht daneben. */
  hinweis?: string;
  /** Nur zeigen, wenn jemand schon abgeschickt hat — sonst schimpft das Feld sofort. */
  fehler?: string;
}) {
  const fertig = wert.length === 4;
  const gueltig = istWienerBezirk(wert);
  const name = gueltig ? BEZIRKS_LISTE.find((b) => b.plz === wert)?.name : undefined;

  return (
    <View style={styles.block}>
      <SsText variant="label">{label}</SsText>
      {hinweis ? (
        <SsText variant="caption" color={colors.inkSoft}>
          {hinweis}
        </SsText>
      ) : null}
      <SsInput
        value={wert}
        // Nur Ziffern. Beim Tippen auf einem Handy rutscht sonst leicht ein
        // Leerzeichen mit, und ein unsichtbares Zeichen lässt `istWienerBezirk`
        // scheitern, ohne dass man sieht, warum — dieselbe Falle wie beim Code.
        onChangeText={(t) => setzen(t.replace(/\D/g, '').slice(0, 4))}
        placeholder="1220"
        keyboardType="number-pad"
        maxLength={4}
        error={fehler}
      />
      {/* Die Rückmeldung kommt erst bei VIER Ziffern. Vorher wäre „das ist kein
          Wiener Bezirk" richtig und trotzdem falsch: Nach der ersten Ziffer hat
          noch niemand etwas falsch gemacht. */}
      {fertig && name ? (
        <SsText variant="caption" color={colors.inkSoft}>
          {wert} · {name}
        </SsText>
      ) : fertig && !gueltig ? (
        <SsText variant="caption" color={status.danger}>
          Den Bezirk gibt es in Wien nicht.
        </SsText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: spacing.xs },
});
