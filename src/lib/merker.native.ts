/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DER MERKER — „das hat die Person schon gesehen" · Geräte-Zweig
 *  Ians Entscheidung 57 (2026-09-13). Nicht ohne Rückfrage ändern.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * **Die ganze Begründung steht in `merker.ts`** — hier nur, was diesen Zweig
 * unterscheidet. Wer eine der beiden Dateien anfasst, liest zuerst die andere.
 *
 * ── Warum `AsyncStorage` und nicht `expo-secure-store` ──────────────────────
 * Ians Entscheidung 55 (der Sitzungsspeicher) trennt nach dem, was ein Diebstahl
 * wert ist: die 14 Byte, die dauerhaft ins Konto lassen, in den Schlüsselbund —
 * alles andere in eine gewöhnliche Datei. **Ein „schon gesehen" ist kein
 * Geheimnis**, es ist das Gegenteil davon: Es steht in dem Moment auf dem
 * Bildschirm, in dem es entsteht. Der Schlüsselbund ist dafür der falsche Ort, und
 * zwar nicht nur überflüssig: Er überlebt auf iOS das LÖSCHEN der App. Wer die App
 * wegwirft und neu installiert, bekäme die Anleitung nie wieder zu sehen.
 *
 * ── Was hier absichtlich fehlt: ein Aufräumen ───────────────────────────────
 * Der Merker wird nie gelöscht, auch nicht beim Abmelden. Er gehört dem GERÄT und
 * nicht dem Konto: Wer sich abmeldet, hat die Wischgeste trotzdem gelernt. Das ist
 * der Unterschied zum Zwischenspeicher in `store.ts`, der beim Abmelden geleert
 * werden MUSS (sonst lägen fremde Chats darin, Phase 20.4-b).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Der Merker im Arbeitsspeicher — er gilt auf BEIDEN Plattformen und geht vor. */
const imLauf = new Set<string>();

/**
 * Wurde das hier schon weggeklickt?
 *
 * **Ein Speicher, der nicht antwortet, gilt als „noch nicht gesehen"** — dieselbe
 * Wahl wie im Web-Zweig, und aus demselben Grund: Eine Karte zu viel ist billiger
 * als ein Erstnutzer, dem niemand die Geste erklärt.
 */
export async function merkerGesehen(schluessel: string): Promise<boolean> {
  if (imLauf.has(schluessel)) return true;
  try {
    return (await AsyncStorage.getItem(schluessel)) === '1';
  } catch {
    return false;
  }
}

/**
 * Ab jetzt gesehen.
 *
 * `imLauf` wird **vor** dem Schreiben gesetzt und nicht danach: Schlägt
 * `AsyncStorage` fehl, ist die Karte wenigstens für diesen App-Lauf weg. Andersherum
 * wischt man sie weg, und beim nächsten Blick auf den Stapel steht sie wieder da —
 * ein Knopf, der sichtbar nichts tut.
 */
export async function merkerSetzen(schluessel: string): Promise<void> {
  imLauf.add(schluessel);
  try {
    await AsyncStorage.setItem(schluessel, '1');
  } catch {
    // Der Schlüsselbund ist nicht zuständig, und eine Platte kann voll sein.
    // `imLauf` trägt es durch diesen Lauf; beim nächsten Start kommt die Karte
    // noch einmal. Das ist der harmlosere der beiden möglichen Fehler.
  }
}
