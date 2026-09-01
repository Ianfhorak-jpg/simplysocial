import '../global.css';

import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PrototypHinweis } from '@/components/PrototypHinweis';
import { colors } from '@/theme';

/**
 * Die Wurzel der App. Bewusst dünn: hier kommt später nur noch dazu, was WIRKLICH
 * überall gilt (Schriften laden, später der Auth-Zustand).
 *
 * `headerShown: false` — jeder Screen baut seine Kopfzeile selbst. Die Standard-
 * Kopfzeile von React Navigation sieht auf Web und iOS unterschiedlich aus; bei einem
 * Prototyp, der auf beidem gleich wirken soll, ist das der falsche Ausgangspunkt.
 *
 * `PrototypHinweis` steht VOR dem Stack und schiebt die App nach unten, statt sie zu
 * überdecken — hier oben, weil er auf jedem Screen gelten muss: Ab Phase 8 kann jede
 * Adresse die erste sein, die jemand öffnet (CLAUDE.md, Regel 5). Er rendert sich nur
 * im Browser und nur einmal je Sitzung; beide Begründungen stehen in der Datei selbst.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={styles.app}>
        <PrototypHinweis />
        <View style={styles.buehne}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
            }}
          />
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.bg },
  // Der Stack braucht eine Fläche mit fester Höhe, sonst fällt er neben dem Hinweis
  // auf 0 zusammen — dieselbe Mechanik wie die ScrollView-neben-FlatList-Falle.
  buehne: { flex: 1 },
});
