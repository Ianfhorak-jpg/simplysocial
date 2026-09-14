import { StyleSheet } from 'react-native';

import { Nutzungsbedingungen } from '@/components/Nutzungsbedingungen';
import { SsBack, SsScreen } from '@/components/ui';
import { spacing } from '@/theme';

/**
 * Nutzungsbedingungen — die Route.
 *
 * Seit dem 2026-09-14 nur noch die HÜLLE: Der Text steht in
 * `components/Nutzungsbedingungen.tsx`, weil er auch über dem Erstkonto-Formular
 * erscheinen muss und dort keine Route sein KANN (der `Stack` wird in diesem
 * Torwächter-Zustand nicht gezeichnet). Die Begründung im Volltext steht im Kopf
 * jener Datei; dieselbe Aufteilung wie bei `components/Profil.tsx`, harte Regel 7.
 */
export default function NutzungsbedingungenScreen() {
  return (
    <SsScreen scroll contentStyle={styles.seite}>
      <SsBack />
      <Nutzungsbedingungen />
    </SsScreen>
  );
}

const styles = StyleSheet.create({
  seite: { gap: spacing.lg, paddingTop: spacing.sm },
});
