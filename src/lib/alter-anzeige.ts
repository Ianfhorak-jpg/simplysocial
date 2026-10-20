/**
 * Die WÖRTER zum Jahrgang — was am Profil, an der Karte und im Detail steht.
 *
 * Die Zahlen und Grenzen stehen in `config/alter.ts`; hier steht nur, wie sie
 * ausgesprochen werden. Getrennt wurde am 2026-10-20, als diese Texte übersetzt
 * wurden: `config/alter.ts` wird von drei Prüfständen in blankem Node geladen
 * (`60_konto`, `93_demoregel`, `95_zustimmung`) und muss importfrei bleiben — ein
 * `t()` darin zöge React hinein. Diese Datei darf `t()` benutzen, weil keiner
 * dieser Prüfstände sie lädt.
 */
import {
  alterAusJahrgang,
  jahrgangMax,
  jahrgangMin,
  JAHRGANG_ANZEIGE,
} from '@/config/alter';
import { t } from '@/i18n';
import type { PostAlter } from '@/types/models';

/**
 * Eine Jahrgangs-Spanne als Text: „2009–2012" · „ab 2009" · „bis 2012" · „2009".
 *
 * Halbgeviertstrich, kein Bindestrich — das ist die richtige Form für einen Bereich.
 * „ab"/„bis" kommen aus dem Wörterbuch; die Zahlen sind in beiden Sprachen gleich.
 */
export function spanneText(vonJahrgang: number, bisJahrgang: number, jetzt: Date = new Date()): string {
  if (vonJahrgang === bisJahrgang) return `${vonJahrgang}`;
  if (vonJahrgang <= jahrgangMin(jetzt)) return t('jahrgang.bis', { jahr: bisJahrgang });
  if (bisJahrgang >= jahrgangMax(jetzt)) return t('jahrgang.ab', { jahr: vonJahrgang });
  return `${vonJahrgang}–${bisJahrgang}`;
}

/**
 * Was am PROFIL steht — Ians Entscheidung 30, am 2026-10-20 auf `'band'` gestellt.
 *
 * Die Bänder sind sprachneutral („14–17"), deshalb braucht nur der Rückweg ein Wort.
 */
export function alterAmProfil(jahrgang: number, jetzt: Date = new Date()): string {
  if (JAHRGANG_ANZEIGE === 'jahrgang') return t('jahrgang.imProfil', { jahrgang });
  const alter = alterAusJahrgang(jahrgang, jetzt);
  if (JAHRGANG_ANZEIGE === 'alter') return t('jahrgang.jahreAlt', { alter });
  if (alter <= 17) return '14–17';
  if (alter <= 25) return '18–25';
  return '26+';
}

/**
 * Was an einer Post-KARTE steht — oder nichts.
 *
 * `null` bei `egal`: Ein Post „für alle" ist der Normalfall und braucht keine
 * Beschriftung. Stünde an jeder zweiten Karte „Für alle", ginge die Angabe dort
 * unter, wo sie wirklich etwas sagt.
 */
export function alterAmPost(alter: PostAlter, jetzt: Date = new Date()): string | null {
  if (alter.kind === 'egal') return null;
  return t('jahrgang.kurz', { spanne: spanneText(alter.vonJahrgang, alter.bisJahrgang, jetzt) });
}

/** Was im DETAIL steht, wo Platz für einen ganzen Satz ist. */
export function alterAmDetail(alter: PostAlter, jetzt: Date = new Date()): string {
  if (alter.kind === 'egal') return t('filterTitel.fuerAlle');
  return t('jahrgang.imDetail', { spanne: spanneText(alter.vonJahrgang, alter.bisJahrgang, jetzt) });
}
