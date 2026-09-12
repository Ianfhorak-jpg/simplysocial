/**
 * Ein Bild vom Gerät holen — **der native Zweig, und er kann es noch nicht.**
 *
 * Dafür braucht es `expo-image-picker`, und das ist ein Native-Baustein: neuer
 * Pod, neuer Build. **Gemessen, nicht vermutet** — anders als `expo-glass-effect`
 * in Phase 19e-2 liegt es NICHT schon über eine andere Abhängigkeit in
 * `node_modules`, und in `ios/Podfile.lock` steht es auch nicht.
 *
 * Er gehört deshalb in denselben Build wie 20.3-b2 (Apple-Sign-in, Google,
 * `expo-secure-store`, `AsyncStorage`) — aus vier Bausteinen in EINEM Build werden
 * fünf. Die Überlegung dahinter ist die aus Phase 19/20: Mehrere neue Bausteine
 * auf einmal heben den Nutzen wieder auf, mehrere Builds hintereinander kosten
 * Abende.
 *
 * **Warum hier `null` steht und nicht ein Absturz:** Der Aufrufer behandelt `null`
 * ohnehin (es ist die Antwort auf einen abgebrochenen Dialog). Was ein Mensch am
 * Gerät dazu SIEHT, sagt der Screen — nicht diese Datei; ein Knopf, der ohne
 * Erklärung nichts tut, ist genau der Eindruck, den Leopold im September hatte
 * („man kann niemandem schreiben"), und der kam von einem fehlenden Knopf.
 */
export const BILDWAHL_LAEUFT = false;

export async function bildWaehlen(): Promise<{ datei: Blob; typ: string } | null> {
  return null;
}
