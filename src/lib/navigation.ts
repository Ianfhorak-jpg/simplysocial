import { router } from 'expo-router';

/**
 * Zurück — und wenn es kein Zurück gibt, zum Feed.
 *
 * ── Warum das nicht einfach `router.back()` sein darf ─────────────────────────
 * Im Browser kann jeder Screen direkt per Adresse aufgerufen werden. Genau das wird
 * ab Phase 8 der Normalfall: Ian schickt seinen Freunden einen Link auf einen Post.
 * Wer so einsteigt, hat keinen Schritt zurück — `router.back()` schreibt dann
 * "The action 'GO_BACK' was not handled by any navigator" in die Konsole, und der
 * Knopf tut sichtbar nichts. Auf iOS fällt das nie auf, weil man dort immer über
 * einen anderen Screen kommt; auf Web ist es der Regelfall.
 *
 * Als Funktion und nicht als Kommentar-Notiz, weil man es sonst beim nächsten Screen
 * wieder vergisst — es ist schon einmal passiert.
 */
export function zurueckOderFeed(): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace('/');
}
