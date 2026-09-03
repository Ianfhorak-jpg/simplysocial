import '../global.css';

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PrototypHinweis } from '@/components/PrototypHinweis';
import { BRAND } from '@/config/brand';
import { colors } from '@/theme';

/**
 * Die Wurzel der App. Bewusst dünn: hier kommt später nur noch dazu, was WIRKLICH
 * überall gilt (Schriften laden, später der Auth-Zustand).
 *
 * `headerShown: false` — jeder Screen baut seine Kopfzeile selbst. Die Standard-
 * Kopfzeile von React Navigation sieht auf Web und iOS unterschiedlich aus; bei einem
 * Prototyp, der auf beidem gleich wirken soll, ist das der falsche Ausgangspunkt.
 *
 * `PrototypHinweis` liegt seit dem 2026-09-02 als Leiste UNTEN über der App, wie eine
 * Cookie-Abfrage — Ians Rückmeldung: oben war er schwerer zu verstehen. Er gilt auf
 * jedem Screen, weil ab Phase 8 jede Adresse die erste sein kann, die jemand öffnet
 * (CLAUDE.md, Regel 5). Er rendert sich nur im Browser und nur einmal je Sitzung;
 * beide Begründungen stehen in der Datei selbst.
 *
 * `startFlaecheWeg` blendet die Fläche aus `app/+html.tsx` aus. Das ist die zweite
 * Hälfte des Fixes gegen den halb fertigen Stapel beim Öffnen — die erste Hälfte
 * steht dort, samt Begründung und Sicherheitsnetz.
 */
export default function RootLayout() {
  startFlaecheWeg();
  tabTitel();

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={styles.app}>
        <View style={styles.buehne}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
            }}
          />
        </View>
        {/* NACH der Bühne und damit darüber: Die Leiste überdeckt unten, statt den
            Inhalt zu schieben — sonst wackelt beim Wegdrücken der ganze Bildschirm. */}
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
