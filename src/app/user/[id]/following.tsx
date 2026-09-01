import { useLocalSearchParams } from 'expo-router';

import { FolgeListeScreen } from '@/components/FolgeListe';
import { userIds } from '@/features/statisch';

/** Wie in `follower.tsx` — sonst ist `/user/u_lea/following` beim Direktaufruf 404. */
export function generateStaticParams(): Array<{ id: string }> {
  return userIds();
}

/** Wem diese Person folgt. Gegenstück zu `follower.tsx` — Begründung steht dort. */
export default function FollowingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <FolgeListeScreen userId={id} art="following" />;
}
