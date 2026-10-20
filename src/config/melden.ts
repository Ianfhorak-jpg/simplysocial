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
/**
 * Die Wörterbuch-Schlüssel der Melde-Gründe — **eigene Unions, ohne Import.**
 *
 * 🔴 **Warum kein `t()` in den Listen unten:** `POST_GRUENDE` und `PERSON_GRUENDE`
 * sind MODULWEITE Konstanten. Sie werden einmal ausgewertet, wenn die Datei
 * geladen wird — ein `t()` darin hielte für immer die Sprache beim App-Start.
 * Dieselbe Falle wie bei `CATEGORIES` (`i18n/index.ts`, zweite Regel).
 *
 * ⚠️ **`spam` und `fake` haben je ZIEL eine andere Erklärung** (ein Post verkauft
 * etwas, eine Person schreibt nur Werbung). Deshalb `spamPost`/`spamPerson` und
 * nicht ein Schlüssel für beide.
 */
type MeldeTitel =
  | 'meldegrund.spamTitel'
  | 'meldegrund.inhaltTitel'
  | 'meldegrund.datingPostTitel'
  | 'meldegrund.datingPersonTitel'
  | 'meldegrund.fakePostTitel'
  | 'meldegrund.fakePersonTitel'
  | 'meldegrund.gefahrTitel'
  | 'meldegrund.unsicherTitel'
  | 'meldegrund.belaestigungTitel'
  | 'meldegrund.anderesTitel';
type MeldeErklaerung =
  | 'meldegrund.spamPost'
  | 'meldegrund.spamPerson'
  | 'meldegrund.inhaltText'
  | 'meldegrund.datingPostText'
  | 'meldegrund.datingPersonText'
  | 'meldegrund.fakePostText'
  | 'meldegrund.fakePersonText'
  | 'meldegrund.gefahrText'
  | 'meldegrund.unsicherText'
  | 'meldegrund.belaestigungText'
  | 'meldegrund.anderesText';

export interface MeldeGrund {
  wert: ReportReason;
  label: MeldeTitel;
  /** Ein Halbsatz darunter — wann dieser Grund gemeint ist. */
  erklaerung: MeldeErklaerung;
}

const POST_GRUENDE: MeldeGrund[] = [
  { wert: 'spam', label: 'meldegrund.spamTitel', erklaerung: 'meldegrund.spamPost' },
  {
    wert: 'unangemessen',
    label: 'meldegrund.inhaltTitel',
    erklaerung: 'meldegrund.inhaltText',
  },
  {
    wert: 'dating',
    label: 'meldegrund.datingPostTitel',
    // ⚠️ Der Name steckt jetzt im Wörterbuch-Text als `{app}`, den der Bildschirm
    // einsetzt — harte Regel 3, und `BRAND` wird hier nicht mehr gebraucht.
    erklaerung: 'meldegrund.datingPostText',
  },
  { wert: 'fake', label: 'meldegrund.fakePostTitel', erklaerung: 'meldegrund.fakePostText' },
  {
    wert: 'gefahr',
    label: 'meldegrund.gefahrTitel',
    erklaerung: 'meldegrund.gefahrText',
  },
  { wert: 'anderes', label: 'meldegrund.anderesTitel', erklaerung: 'meldegrund.anderesText' },
];

const USER_GRUENDE: MeldeGrund[] = [
  {
    wert: 'belaestigung',
    label: 'meldegrund.belaestigungTitel',
    erklaerung: 'meldegrund.belaestigungText',
  },
  {
    wert: 'dating',
    label: 'meldegrund.datingPersonTitel',
    erklaerung: 'meldegrund.datingPersonText',
  },
  { wert: 'spam', label: 'meldegrund.spamTitel', erklaerung: 'meldegrund.spamPerson' },
  { wert: 'fake', label: 'meldegrund.fakePersonTitel', erklaerung: 'meldegrund.fakePersonText' },
  {
    wert: 'gefahr',
    label: 'meldegrund.unsicherTitel',
    erklaerung: 'meldegrund.unsicherText',
  },
  { wert: 'anderes', label: 'meldegrund.anderesTitel', erklaerung: 'meldegrund.anderesText' },
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
export const MELDE_TITEL = {
  post: 'melden.postMelden',
  user: 'melden.personMelden',
} as const satisfies Record<ReportTarget, string>;
