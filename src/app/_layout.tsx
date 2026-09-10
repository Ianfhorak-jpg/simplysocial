import '../global.css';

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Anmelden } from '@/components/Anmelden';
import { PrototypHinweis } from '@/components/PrototypHinweis';
import { BRAND } from '@/config/brand';
import { useSitzung } from '@/features/auth/hooks';
import { colors } from '@/theme';

/**
 * Die Wurzel der App. Bewusst dünn: hier steht nur, was WIRKLICH überall gilt.
 *
 * ── Der Torwächter (Phase 20.3) ───────────────────────────────────────────────
 * Seit dem 2026-09-09 steht hier der Auth-Zustand — genau da, wo dieser Kommentar
 * ihn seit Phase 1 angekündigt hat. Ist niemand angemeldet, wird der `Stack` GAR
 * NICHT gezeichnet, und an seiner Stelle steht `<Anmelden />`.
 *
 * **Das ist keine Geschmacksfrage, sondern die Bedingung dafür, dass
 * `useCurrentUserId()` ein `string` sein darf und kein `string | null`.** Jeder
 * Screen darunter setzt ein Ich voraus; hinge er im Baum, würde er zeichnen und
 * werfen. Der ausgeloggte Zustand wird deshalb eine Ebene HÖHER behandelt, und diese
 * Ebene ist die einzige, die über dem Stack liegt.
 *
 * Warum das keine `/anmelden`-Route ist, steht im Kopf von `components/Anmelden.tsx`:
 * Die Adresse bleibt stehen, also landet man nach dem Anmelden dort, wohin der Link
 * zeigte — ohne dass sich irgendetwas ein Ziel merken muss.
 *
 * `headerShown: false` — jeder Screen baut seine Kopfzeile selbst. Die Standard-
 * Kopfzeile von React Navigation sieht auf Web und iOS unterschiedlich aus; bei einem
 * Prototyp, der auf beidem gleich wirken soll, ist das der falsche Ausgangspunkt.
 *
 * `PrototypHinweis` ist seit dem 2026-09-07 ein VOLLBILD beim ersten Öffnen (Ians
 * Entscheidung 48) — vorher eine Leiste unten, davor zwei Fassungen oben. Alle vier
 * stehen samt Begründung in der Datei; wer ihn verschiebt, liest zuerst diese Liste
 * (harte Regel 22). Er gilt auf jedem Screen, weil ab Phase 8 jede Adresse die erste
 * sein kann, die jemand öffnet (CLAUDE.md, Regel 5), und er rendert sich nur im
 * Browser und nur einmal je Sitzung.
 *
 * `startFlaecheWeg` blendet die Fläche aus `app/+html.tsx` aus. Das ist die zweite
 * Hälfte des Fixes gegen den halb fertigen Stapel beim Öffnen — die erste Hälfte
 * steht dort, samt Begründung und Sicherheitsnetz.
 */
export default function RootLayout() {
  startFlaecheWeg();
  tabTitel();
  const angemeldet = useSitzung().zustand === 'an';

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={styles.app}>
        <View style={styles.buehne}>
          {angemeldet ? (
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg },
              }}
            />
          ) : (
            <Anmelden />
          )}
        </View>
        {/* NACH der Bühne und damit darüber: Das Vollbild überdeckt, statt den Inhalt
            zu schieben — sonst wackelt beim Wegdrücken der ganze Bildschirm. Und es
            liegt ÜBER der Tab-Leiste, was seit Entscheidung 48 kein Preis mehr ist,
            sondern der Zweck: Man kommt nur mit „Verstanden" weiter. */}
        <PrototypHinweis />
      </View>
    </SafeAreaProvider>
  );
}

/**
 * Die Startfläche aus `+html.tsx` wegblenden, sobald React steht.
 *
 * Ein Effekt und kein Aufruf im Rendern: Effekte laufen NUR im Browser, nie beim
 * Vorrendern — und genau dort gibt es weder `document` noch etwas wegzublenden.
 * Die Klasse setzt den Übergang in Gang, das Aufräumen erledigt der Browser.
 */
function startFlaecheWeg() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    document.documentElement.classList.add('ss-bereit');
  }, []);
}

/**
 * Den Namen in den Browser-Tab schreiben.
 *
 * ── Warum das nicht in `+html.tsx` reicht ─────────────────────────────────────
 * Dort steht er auch, und im gebauten HTML sieht er richtig aus. Live blieb der Tab
 * trotzdem leer. Nachgesehen, warum: Es gibt ZWEI `title`-Tags. Expo Router rendert
 * beim Bauen einen leeren über react-helmet (erkennbar am `data-rh="true"`), und der
 * steht VOR dem eigenen — `document.title` nimmt den ersten.
 *
 * `screenOptions={{ title }}` am Stack hilft nicht: Das ist der Titel für die
 * Navigations-Kopfzeile, nicht für das Dokument. Und `<Head>` aus `expo-router/head`
 * geht hier nicht, weil es `useIsFocused` benutzt und damit INNERHALB eines Navigators
 * stehen muss — dieses Layout ist der Navigator.
 *
 * Bleibt der direkte Weg. Er ist zulässig, weil er nach der Hydration läuft: Der leere
 * Helmet-Titel stammt aus dem Vorrendern und wird danach nicht neu gesetzt, solange
 * kein Screen ein eigenes `<Head>` mitbringt. **Baut jemand später eines ein** (etwa
 * für einen Post-Titel im geteilten Link), gewinnt Helmet wieder — dann gehört der
 * Titel dorthin und diese Funktion weg.
 */
function tabTitel() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    document.title = BRAND.name;
  }, []);
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.bg },
  // Die Bühne nimmt die volle Höhe. Bis zum 2026-09-02 stand hier, sie brauche das,
  // weil der Hinweis daneben liege — der liegt jetzt DARÜBER und nimmt keinen Platz
  // mehr weg. `flex: 1` bleibt trotzdem richtig, nur die Begründung ist eine andere.
  buehne: { flex: 1 },
});
