import { useLocalSearchParams } from 'expo-router';

import { FolgeListeScreen } from '@/components/FolgeListe';
import { userIds } from '@/features/statisch';

/**
 * Auch die verschachtelten Listen brauchen ihre eigene Liste von Adressen — der
 * `[id]` des Elternteils vererbt sich beim Bauen NICHT von allein.
 * Siehe `features/statisch.ts`.
 */
export function generateStaticParams(): Array<{ id: string }> {
  return userIds();
}

/**
 * Wer dieser Person folgt.
 *
 * ── Warum zwei Dateien und nicht `[liste].tsx` ────────────────────────────────
 * Es gibt genau zwei Listen, und beide heißen auch in der Adresse so
 * (`/user/u_lea/follower`, `/user/u_lea/following`). Als dynamisches Segment würde
 * `/user/u_lea/quatsch` mitmatchen, und der Screen bräuchte eine Behandlung für einen
 * Wert, den es gar nicht geben soll. Mit zwei echten Dateien kennt `typedRoutes`
 * beide Pfade als Literale — ein Tippfehler im `router.push` ist dann ein
 * Compile-Fehler und kein toter Klick.
 */
export default function FollowerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <FolgeListeScreen userId={id} art="follower" />;
}
