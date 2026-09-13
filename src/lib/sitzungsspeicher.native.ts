/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DER SITZUNGSSPEICHER — Geräte-Zweig (Phase 20.3-b2)
 *  Ians Entscheidung 55: der Dauerschlüssel in den Tresor, der Rest in die Datei.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Die einzige Datei, die `expo-secure-store` und `AsyncStorage` anfasst. Was
 * wohin gehört, steht NICHT hier, sondern in `features/auth/sitzungsspeicher.ts`
 * — dieselbe Trennung wie Regel-Datei gegen Zeichner bei der Karte (harte
 * Regel 52). Der Grund ist hier besonders handfest: Die Regel ist dadurch ohne
 * Gerät prüfbar (`npm run pruef-sitzung`), und ein iPhone meldet bei einem
 * abgelehnten Schlüsselbund-Eintrag nur eine nackte Zahl.
 *
 * ── Die Reihenfolge beim LÖSCHEN ist die einzige, die wirklich zählt ─────────
 * Der Tresor zuerst. Bricht die App dazwischen ab, liegt danach ein Ausweis ohne
 * Dauerschlüssel da — und der gilt nach Ians zweitem Halbsatz als abgemeldet.
 * Andersherum bliebe das Gegenteil liegen: der eine Wert, mit dem man dauerhaft
 * ins Konto kommt. **Dasselbe Muster wie `BILD_ZUERST` beim Kontolöschen** (harte
 * Regel 89): Zuerst weg, was am meisten wiegt.
 *
 * Beim SCHREIBEN ist die Reihenfolge dagegen gleichgültig, und das ist keine
 * Nachlässigkeit, sondern eine Folge derselben Entscheidung: Jede halbe Sitzung
 * gilt als abgemeldet, also ist jeder Abbruch zwischen den beiden Schreibvorgängen
 * derselbe harmlose Zustand.
 *
 * ── Warum hier nichts WIRFT ─────────────────────────────────────────────────
 * Ein Schlüsselbund kann ablehnen — zu große Werte, gesperrtes Gerät, ein
 * `OSStatus`, den niemand liest. Ein Absturz beim Start wäre die schlechteste
 * Antwort darauf: Die App wäre für diesen Menschen kaputt, und die Meldung
 * darunter sagt nichts. `null` heißt „nicht angemeldet", und das ist ein
 * Zustand, aus dem ein Mensch selbst herausfindet — er tippt einen Code.
 * Auf den BILDSCHIRM kommt der `OSStatus` nicht (der Fund vom 2026-09-03).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { aufteilen, zusammensetzen } from '@/features/auth/sitzungsspeicher';

/**
 * Wie gut der Dauerschlüssel weggesperrt wird.
 *
 * `WHEN_UNLOCKED_THIS_DEVICE_ONLY` heißt zweierlei, und beides ist gewollt:
 * lesbar **nur bei entsperrtem Gerät**, und **niemals in einem Backup oder im
 * iCloud-Schlüsselbund**. Die App arbeitet ausschließlich im Vordergrund — sie
 * hat heute keine Benachrichtigungen und nichts, was im Hintergrund aufwacht —,
 * also kostet die strengere Stufe nichts. Und eine Anmeldung, die über ein
 * Backup auf ein FREMDES Telefon wandert, ist genau das, was ein Anmeldeschlüssel
 * nicht tun soll.
 *
 * ⚠️ **Das ist meine AUSLEGUNG von Entscheidung 55 und wartet auf Ians Urteil**
 * (PLAN.md, Abschnitt 6, Punkt 36). Der Preis steht fest und ist klein:
 * Auf einem neuen iPhone meldet man sich einmal neu an. Kommt später etwas dazu,
 * das im Hintergrund läuft, muss hier `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`
 * stehen — sonst schlägt genau dann das Lesen fehl, wenn niemand hinsieht.
 */
const SCHUTZ = SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY;

/** Der Tresor meldet sich mit einem `OSStatus`; hier wird daraus ein `null`. */
async function tresorLesen(schluessel: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(schluessel, { keychainAccessible: SCHUTZ });
  } catch {
    return null;
  }
}

export function sitzungsSpeicher() {
  return {
    async getItem(schluessel: string): Promise<string | null> {
      const [tresor, datei] = await Promise.all([
        tresorLesen(schluessel),
        AsyncStorage.getItem(schluessel),
      ]);
      return zusammensetzen({ tresor, datei });
    },

    async setItem(schluessel: string, wert: string): Promise<void> {
      const teile = aufteilen(wert);
      await AsyncStorage.setItem(schluessel, teile.datei ?? '');
      if (teile.tresor === null) {
        // Kein Dauerschlüssel darin — dann darf auch keiner liegen bleiben, sonst
        // ergäbe ein ALTER Schlüssel mit einem NEUEN Ausweis eine Sitzung, die es
        // so nie gegeben hat.
        await SecureStore.deleteItemAsync(schluessel, { keychainAccessible: SCHUTZ });
        return;
      }
      await SecureStore.setItemAsync(schluessel, teile.tresor, { keychainAccessible: SCHUTZ });
    },

    async removeItem(schluessel: string): Promise<void> {
      // Der Tresor zuerst — siehe Kopf.
      await SecureStore.deleteItemAsync(schluessel, { keychainAccessible: SCHUTZ });
      await AsyncStorage.removeItem(schluessel);
    },
  };
}
