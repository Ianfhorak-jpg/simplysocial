import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SsButton, SsIcon, SsText } from '@/components/ui';
import { colors, MAX_CONTENT_WIDTH, radius, spacing } from '@/theme';

/**
 * Der Satz, den jeder braucht, der den Link bekommt — einmal, dann nie wieder.
 *
 * ── Warum es ihn ab Phase 8 gibt ──────────────────────────────────────────────
 * Bis jetzt hat den Prototyp nur angeschaut, wer daneben saß und die Erklärung
 * mitgeliefert bekam. Ab dem Deploy ist er ein Link in einer WhatsApp-Gruppe, und
 * Links werden weitergeleitet — die Erklärung nicht. Zwei Dinge fallen dann sofort
 * auf und sehen beide wie ein Fehler aus, obwohl beide Absicht sind:
 *   1. Neuladen setzt alles zurück (der Zustand lebt nur im Browser-Speicher).
 *   2. Wer den Link öffnet, IST Ian — es gibt keinen Login, also auch keine Wahl.
 * Ohne den Hinweis hält man Nummer 2 für ein Datenleck und Nummer 1 für einen Absturz.
 *
 * ── Warum er auf dem Server NICHTS rendert ────────────────────────────────────
 * Das ist keine Kleinigkeit, sondern der Grund für den Aufbau dieser Datei.
 * Der Web-Export backt zur Build-Zeit einen HTML-Schnappschuss jeder Seite. Wäre der
 * Balken dort schon drin, hätte das zwei Fehler zur Folge:
 *   • Er stünde auch für den, der ihn längst weggeklickt hat, im ausgelieferten HTML
 *     und würde erst verschwinden, wenn das JavaScript geladen hat — ein Blinken.
 *   • React vergleicht beim Hydrieren Server- und Browser-Ergebnis. Verschieden =
 *     Fehler in der Konsole.
 * Deshalb startet `sichtbar` auf `false` und wird erst in einem `useEffect` gesetzt.
 * Effekte laufen NUR im Browser, nie beim Vorrendern. Server und erster Browser-Lauf
 * liefern damit beide „nichts" — identisch, kein Mismatch —, und der Balken kommt
 * einen Wimpernschlag später dazu.
 *
 * ── Warum er UNTEN liegt und überdeckt (Ian, 2026-09-02) ──────────────────────
 * Er hat drei Fassungen erlebt, und die Begründung hat sich dabei zweimal gedreht —
 * deshalb steht sie hier ganz:
 *   1. Als Ebene über der App OBEN. Falsch: Verdeckt waren Wortmarke, „Posten" und
 *      der Umschalter — genau das, was man beim Herzeigen zuerst sieht.
 *   2. Im Fluss ganz oben, den Inhalt nach unten schiebend. Technisch sauber, aber
 *      Ians Urteil am Handy: **„oben ist es schwieriger zu verstehen."** Ein Kasten,
 *      der oben mitläuft, liest sich wie eine Kopfzeile der App — also wie etwas, das
 *      dazugehört, statt wie eine Ansage über sie.
 *   3. Jetzt: eine Leiste UNTEN über der App, wie eine Cookie-Abfrage, mit einem
 *      richtigen Knopf statt einem ✕. Das Muster kennt jeder, und es sagt von selbst,
 *      dass es etwas Vorübergehendes ist, das man wegdrückt.
 *
 * Der Einwand aus Fassung 1 gilt weiter — er wird nur anders beantwortet: Verdeckt ist
 * jetzt die Tab-Leiste, und die ist als einzige Stelle verkraftbar, weil man sie
 * ohnehin erst braucht, nachdem man den Feed gesehen hat. **Wer das wieder umbaut,
 * liest zuerst diese Liste**, sonst landet er bei einer der zwei Fassungen, die schon
 * durchgefallen sind.
 *
 * ── Warum `insets.bottom` und nicht `insets.top` ──────────────────────────────
 * Seit die Leiste unten sitzt, zählt der untere Sicherheitsabstand: die Streifen-Geste
 * am iPhone und die Navigationsleiste auf Android. Seit `app/+html.tsx` steht auch
 * `viewport-fit=cover` im HTML — vorher lieferte `env(safe-area-inset-*)` im Browser
 * gar nichts, und der Abstand war immer 0.
 *
 * ── Warum `sessionStorage` und nicht `localStorage` ───────────────────────────
 * `localStorage` würde den Balken für immer verstecken. Das ist zu viel: Wer den
 * Prototyp in drei Wochen wieder aufmacht, hat die zwei Sätze vergessen. Mit
 * `sessionStorage` gilt „weggeklickt" für diesen Tab — inklusive Neuladen, was am
 * Handy oft von selbst passiert (Tab-Wechsel, Speicherdruck) — und nicht darüber
 * hinaus. Beides in `try/catch`: Im privaten Modus wirft schon der Zugriff.
 */

const SCHLUESSEL = 'ss_hinweis_weg';

/** Merker für native und für den Fall, dass der Browser den Speicher verweigert. */
let weggeklickt = false;

function schonGesehen(): boolean {
  if (weggeklickt) return true;
  if (Platform.OS !== 'web') return false;
  try {
    return window.sessionStorage.getItem(SCHLUESSEL) === '1';
  } catch {
    return false;
  }
}

function merken(): void {
  weggeklickt = true;
  if (Platform.OS !== 'web') return;
  try {
    window.sessionStorage.setItem(SCHLUESSEL, '1');
  } catch {
    // Privater Modus. Der Merker oben reicht, solange die Seite nicht neu lädt.
  }
}

export function PrototypHinweis() {
  const [sichtbar, setSichtbar] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!schonGesehen()) setSichtbar(true);
  }, []);

  if (!sichtbar) return null;

  return (
    <View style={[styles.huelle, { paddingBottom: insets.bottom + spacing.sm }]}>
      <View style={styles.kasten}>
        {/* Seit Phase 14 ein gezeichnetes Icon statt 🧪. Der Grund, aus dem der
            Kommentar hier ueberhaupt stand, ist damit weg: Emojis brachten je nach
            Geraet ihre eigene Breite mit und klebten mal am Wort, mal nicht. Ein
            Icon ist ueberall gleich breit, der Abstand kommt aus `gap`. Der Titel
            ist einzeilig, deshalb ist `center` hier richtig; bei zwei Zeilen saesse
            das Icon an der zweiten (ACTA-Falle aus Phase 12). */}
        <View style={styles.titelZeile}>
          <SsIcon name="kolben" size={16} color={colors.ink} />
          <SsText variant="label">Das hier ist ein Prototyp</SsText>
        </View>
        <SsText variant="caption" color={colors.inkSoft}>
          Alle Namen, Posts und Chats sind erfunden. Es gibt keinen Login — du bist
          gerade Ian. Neuladen setzt alles zurück.
        </SsText>
        <SsButton
          label="Verstanden"
          block
          onPress={() => {
            merken();
            setSichtbar(false);
          }}
          style={styles.knopf}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Ausgeschriebene Kanten statt `absoluteFill`: Das ist eine registrierte Style-ID
  // und lässt sich nicht mit eigenen Werten mischen (ACTA-Falle, siehe CLAUDE.md).
  // `top` bleibt frei — die Leiste ist nur so hoch, wie ihr Inhalt braucht.
  huelle: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  kasten: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    gap: spacing.xs,
    // Der Schatten trägt hier Bedeutung und ist keine Zier: Die Leiste liegt ÜBER der
    // App und muss sich von ihr abheben, sonst liest man sie als Teil des Feeds. Es
    // ist die einzige Stelle mit Schatten — überall sonst genügt die Grundfläche.
    boxShadow: '0 -6px 24px rgba(23, 25, 28, 0.14)',
  },
  // `sm` und nicht `xs`: Mit 4 px gemessen klebte das Emoji optisch am Wort — eine
  // Emoji-Glyphe bringt rechts kaum eigenen Weißraum mit, anders als ein Buchstabe.
  titelZeile: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  knopf: { marginTop: spacing.sm },
});
