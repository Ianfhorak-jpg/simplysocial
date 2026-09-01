import type { ReportReason, ReportTarget } from '@/types/models';

/**
 * Die Gründe, aus denen man melden kann — die WÖRTER, nicht die Logik.
 * (Was ein Block bewirkt, steht in `features/safety/block.ts`.)
 *
 * ── Warum ein Post und ein Mensch verschiedene Listen bekommen ────────────────
 * „Belästigung" ist keine Eigenschaft eines Posts, „Fake-Profil" keine eines
 * Treffens. Eine gemeinsame Liste hätte an beiden Stellen Gründe, die dort nicht
 * hingehören — und wer den passenden nicht findet, nimmt „Anderes". Dann steht in
 * der Statistik nichts Brauchbares mehr, und genau dafür gibt es die Gründe.
 *
 * ── Warum jeder Grund eine Erklärung mitbringt ───────────────────────────────
 * „Unangemessen" heißt für jeden etwas anderes. Der Halbsatz darunter macht aus der
 * Meldung eine Entscheidung statt eines Ratespiels — und er ist das Einzige, was
 * später verhindert, dass jemand einen Post meldet, weil ihm die Uhrzeit nicht passt.
 */
export interface MeldeGrund {
  wert: ReportReason;
  label: string;
  /** Ein Halbsatz darunter — wann dieser Grund gemeint ist. */
  erklaerung: string;
}

const POST_GRUENDE: MeldeGrund[] = [
  { wert: 'spam', label: 'Spam oder Werbung', erklaerung: 'Verkauft etwas oder wirbt für etwas' },
  {
    wert: 'unangemessen',
    label: 'Unangemessener Inhalt',
    erklaerung: 'Beleidigend, verstörend oder für hier zu heftig',
  },
  {
    wert: 'dating',
    label: 'Gemeint als Anmache',
    erklaerung: 'Liest sich wie eine Dating-Anzeige — dafür ist SimplySocial nicht da',
  },
  { wert: 'fake', label: 'Gibt es so nicht', erklaerung: 'Erfundenes Treffen oder falsche Angaben' },
  {
    wert: 'gefahr',
    label: 'Könnte gefährlich werden',
    erklaerung: 'Ort, Uhrzeit oder Vorhaben sind unsicher',
  },
  { wert: 'anderes', label: 'Etwas anderes', erklaerung: 'Passt in keinen der Punkte oben' },
];

const USER_GRUENDE: MeldeGrund[] = [
  {
    wert: 'belaestigung',
    label: 'Belästigt mich',
    erklaerung: 'Bedrängt, beleidigt oder hört nicht auf zu schreiben',
  },
  {
    wert: 'dating',
    label: 'Macht mich an',
    erklaerung: 'Behandelt die App wie eine Dating-App',
  },
  { wert: 'spam', label: 'Spam oder Werbung', erklaerung: 'Schreibt oder postet nur Werbung' },
  { wert: 'fake', label: 'Fake-Profil', erklaerung: 'Ist offensichtlich nicht, wer da steht' },
  {
    wert: 'gefahr',
    label: 'Ich fühle mich unsicher',
    erklaerung: 'Verhalten, bei dem jemand zu Schaden kommen könnte',
  },
  { wert: 'anderes', label: 'Etwas anderes', erklaerung: 'Passt in keinen der Punkte oben' },
];

export const MELDE_GRUENDE: Record<ReportTarget, MeldeGrund[]> = {
  post: POST_GRUENDE,
  user: USER_GRUENDE,
};

/**
 * Die Überschriften des Melde-Screens, je nachdem, was gemeldet wird.
 *
 * Steht hier und nicht im Screen, damit „Post" und „Person" an einer Stelle benannt
 * sind. Sonst heißt es an der einen Stelle „Beitrag" und an der anderen „Post".
 */
export const MELDE_TITEL: Record<ReportTarget, string> = {
  post: 'Post melden',
  user: 'Person melden',
};
