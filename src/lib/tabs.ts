import { BottomTabBarHeightContext } from 'expo-router/js-tabs';
import { useContext } from 'react';

/**
 * Wie hoch die Tab-Leiste ist — oder **0**, wenn gerade keine da ist.
 *
 * ── Warum es das seit Phase 19e-2 überhaupt braucht ───────────────────────────
 * Bis dahin stand die Leiste IM Layout: Der Screen endete über ihr, und niemand
 * musste ihre Höhe kennen. Seit sie schwebt (`position: 'absolute'`, damit das Glas
 * etwas zu brechen hat), reicht der Screen bis zur Unterkante des Fensters — und
 * was dort steht, läge dahinter. Die Höhe ist damit eine Zahl, die mehrere Stellen
 * brauchen, also gehört sie an EINE.
 *
 * ── Warum der Kontext und nicht `useBottomTabBarHeight()` ─────────────────────
 * Der Haken daneben wirft, wenn er außerhalb einer Tab-Leiste gerufen wird — und
 * `SsScreen` steht auf jedem Screen der App, die meisten davon liegen außerhalb
 * (`/post/[id]`, `/chat/[id]`, `/create` …). Der Kontext liefert dort schlicht
 * `undefined`, und **das ist die richtige Antwort auf „wie viel Leiste ist unten?"**
 *
 * ── Warum die Zahl gemessen und nicht gerechnet ist ───────────────────────────
 * Sie ist Leistenhöhe **plus** unterer Sicherheitsabstand, und beides hängt am
 * Gerät: 49 + 34 auf einem iPhone mit Home-Anzeige, 49 + 0 im Browser. Dieselbe
 * Lehre wie bei `maxOben` in Phase 19e-1 — was schon da steht, wird gemessen.
 */
export function useTabRand(): number {
  return useContext(BottomTabBarHeightContext) ?? 0;
}
