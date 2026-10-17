/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DIE GEMERKTE SPRACHE — Gerätezweig
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Die Begründung steht vollständig im Kopf von `speicher.ts` (Web-Hälfte). Hier
 * nur, was an dieser Hälfte anders ist:
 *
 * **`AsyncStorage` statt `localStorage` — und dieselbe Bedeutung.** Das ist der
 * Unterschied zum Merker (harte Regel 97): Dort bedeuten die zwei Hälften
 * absichtlich Verschiedenes, hier bedeuten sie absichtlich DASSELBE. Eine
 * Sprachwahl gilt, bis jemand sie ändert, auf beiden Plattformen.
 *
 * ⚠️ **`@react-native-async-storage/async-storage` liegt seit Phase 8 im Projekt**
 * (2.2.0 in `package.json`) und ist im Gerätebuild drin — `merker.native.ts` lädt
 * es genauso. Deshalb braucht es hier KEINE `try/require`-Kapselung, anders als
 * bei ACTA: Dort war AsyncStorage neu, und die Native-Module-Falle (ein neuer
 * nativer Baustein crasht den BESTEHENDEN Build beim Import) war echt.
 * **Für `expo-localization` gilt sie hier aber doch** — das ist neu, und die
 * Kapselung dafür steht in `index.ts`.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Sprache } from './sprachen';
import { istSprache } from './sprachen';

const SCHLUESSEL = 'ss_sprache';

/**
 * Die gemerkte Handauswahl — oder `null`, wenn noch keine getroffen wurde.
 *
 * **`null` heißt „nie gewählt" und nicht „Deutsch"**, damit die Gerätesprache
 * überhaupt eine Gelegenheit bekommt. Die ausführliche Begründung steht in der
 * Web-Hälfte.
 */
export async function spracheLesen(): Promise<Sprache | null> {
  try {
    const wert = await AsyncStorage.getItem(SCHLUESSEL);
    return istSprache(wert) ? wert : null;
  } catch {
    return null;
  }
}

/** Ab jetzt gilt diese Sprache — über den App-Neustart hinaus. */
export async function spracheSchreiben(sprache: Sprache): Promise<void> {
  try {
    await AsyncStorage.setItem(SCHLUESSEL, sprache);
  } catch {
    // Wie im Web: Die Wahl gilt für diesen Lauf, nur das Gedächtnis fehlt.
    // Ein Umschalter, der wegen eines vollen Speichers nicht umschaltet, wäre
    // der schlechtere Fehler.
  }
}
