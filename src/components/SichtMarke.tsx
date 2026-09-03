import { useGruppenName } from '@/features/groups/hooks';
import { GRUPPE_UNBEKANNT } from '@/features/groups/gruppe';
import type { Visibility } from '@/types/models';

import { SsIconText } from './ui';

/**
 * Die kleine Zeile „Nur Follower" bzw. „Nur Marswiese Tennis" an einer Post-Karte.
 *
 * ── Warum ein eigener Baustein für eine Zeile ─────────────────────────────────
 * Weil sie seit Phase 17 nicht mehr aus dem Post allein zu beantworten ist: Der
 * Gruppen-NAME steht in der Gruppe, nicht am Post, und dafür braucht es einen Haken.
 * Ein Haken in einer `? :`-Bedingung mitten in `PostCard` wäre ein Regelverstoß
 * (Haken laufen immer, nicht bedingt), und ihn oben in der Karte zu holen hieße, ihn
 * auch für die dreizehn Posts zu holen, die gar keine Gruppe haben.
 *
 * ── Warum der Name nicht am Post mitgespeichert wird ──────────────────────────
 * Das wäre eine zweite Wahrheit: Die Gruppe wird umbenannt, und auf allen alten
 * Karten stünde der alte Name. Dieselbe Überlegung wie bei `JoinRequest`, an dem
 * bewusst kein `toUserId` steht (`requests/hooks.ts`).
 *
 * ── Was hier NICHT steht ──────────────────────────────────────────────────────
 * Kein Knopf. Wer den Gruppennamen sieht, ist entweder drin oder es ist sein eigener
 * Post — der Weg zur Gruppe führt über das Post-Detail und die Gruppenliste, nicht
 * über ein Etikett im Feed, das man beim Scrollen streift.
 */
export function SichtMarke({ visibility }: { visibility: Visibility }) {
  // Der Haken läuft immer, auch bei einem öffentlichen Post — Haken dürfen nicht
  // bedingt aufgerufen werden. Er gibt dann `null` zurück und kostet nichts.
  const gruppenName = useGruppenName(visibility);

  switch (visibility.kind) {
    case 'public':
      return null;
    case 'followers':
      return <SsIconText icon="schloss">Nur Follower</SsIconText>;
    case 'group':
      // Ist die Gruppe weg (aufgelöst), steht trotzdem etwas da. Ein leerer Platz
      // sähe aus wie ein Fehler, und „irgendeiner Gruppe" ist die Wahrheit.
      return <SsIconText icon="personen">{`Nur ${gruppenName ?? GRUPPE_UNBEKANNT}`}</SsIconText>;
  }
}

/**
 * Derselbe Sachverhalt als Satz — für die Zeile im Post-Detail, wo mehr Platz ist.
 *
 * Steht hier neben der Marke und nicht im Screen, damit beide dasselbe sagen. Sonst
 * heißt es im Feed „Nur Marswiese Tennis" und im Detail „Nur für Gruppenmitglieder",
 * und niemand weiß, ob das dieselbe Regel ist.
 */
export function useSichtText(
  /** Darf `undefined` sein: Das Post-Detail steigt bei einer unbekannten ID früh
      aus, und ein Haken muss trotzdem VOR diesem Ausstieg gelaufen sein. */
  visibility: Visibility | undefined,
  autorName: string,
  istMeiner: boolean,
): string | null {
  const gruppenName = useGruppenName(visibility ?? { kind: 'public' });
  if (!visibility) return null;

  switch (visibility.kind) {
    case 'public':
      return null;
    case 'followers':
      return istMeiner ? 'Nur deine Follower' : `Nur wer ${autorName} folgt`;
    case 'group':
      return `Nur ${gruppenName ?? GRUPPE_UNBEKANNT}`;
  }
}
