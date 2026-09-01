import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SsText } from '@/components/ui';
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
 * ── Warum er den Inhalt SCHIEBT und nicht überdeckt ───────────────────────────
 * Erst lag er als Ebene über der App. Im Browser getestet war sofort zu sehen, warum
 * das falsch ist: Verdeckt waren die Wortmarke, der „Posten"-Knopf und der Umschalter
 * „Alle / Wem ich folge" — also genau das, was man beim Herzeigen als Erstes sieht.
 * Ein Hinweis, der erklären soll, was die App ist, darf nicht die App verdecken.
 * Jetzt sitzt er im Fluss ganz oben; beim Wegklicken rutscht alles hoch.
 *
 * ── Warum `insets.top` hier und nicht doppelt ─────────────────────────────────
 * Auf Web ist der obere Sicherheitsabstand 0 — Expo setzt im erzeugten HTML kein
 * `viewport-fit=cover`, also liefert `env(safe-area-inset-top)` nichts. Für Phase 8
 * (Browser) ist das exakt. Beim ersten nativen Build kommt der Abstand des Screens
 * darunter dazu; dann gehört er entweder hier weg oder dort. Nachschauen, nicht raten.
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
    <View style={[styles.huelle, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.kasten}>
        <View style={styles.zeile}>
          <SsText variant="label">🧪 Prototyp</SsText>
          <Pressable
            onPress={() => {
              merken();
              setSichtbar(false);
            }}
            accessibilityRole="button"
            accessibilityLabel="Hinweis schließen"
            hitSlop={spacing.md}
            style={styles.schliessen}
          >
            <SsText variant="label" color={colors.inkSoft}>
              ✕
            </SsText>
          </Pressable>
        </View>
        <SsText variant="caption" color={colors.inkSoft}>
          Alle Namen, Posts und Chats sind erfunden. Es gibt keinen Login — du bist
          gerade Ian. Neuladen setzt alles zurück.
        </SsText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  huelle: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
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
  },
  zeile: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  schliessen: { cursor: 'pointer' },
});
