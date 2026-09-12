/**
 * base64 → Bytes. **Eine Datei ohne einen einzigen Import, und das ist Absicht.**
 *
 * ── Warum es diese Datei überhaupt gibt ─────────────────────────────────────
 * `@supabase/storage-js` sagt in seinem eigenen Quelltext (`StorageFileApi.ts`,
 * am `upload`):
 *
 *   > For React Native, using either `Blob`, `File` or `FormData` does not work
 *   > as intended. Upload file using `ArrayBuffer` from base64 file data instead.
 *
 * Der Mechanismus steht dreißig Zeilen darüber: Ein `Blob` wird in ein `FormData`
 * gewickelt, und was React Native daraus über die Leitung schickt, ist nicht der
 * Inhalt. Ein `ArrayBuffer`/`Uint8Array` geht dagegen in den `else`-Zweig — und
 * **nur dort setzt storage-js `content-type` und `cache-control` als Header.**
 * Ians Entscheidung 51 (fünf Minuten Zwischenlager) hängt also mit daran.
 *
 * ── Warum selbst gerechnet und nicht `atob` ─────────────────────────────────
 * `atob` ist in Hermes nicht zugesichert, und selbst wo es liegt, gibt es einen
 * „binary string" zurück — aus dem müsste man Zeichen für Zeichen ein
 * `Uint8Array` bauen, also bei 2 MB zwei Millionen `charCodeAt`. Dieselbe
 * Überlegung wie die Umlaut-Tabelle in `posts/filter.ts`: Der Standardweg ist auf
 * Hermes nicht verlässlich, und die eigene Fassung ist kürzer als die Ausrede.
 *
 * ── Warum ohne Import ───────────────────────────────────────────────────────
 * Damit sie **einzeln prüfbar** ist. Nach `tsc` läuft sie in blankem Node, also
 * kann `pruefen/90_base64.mjs` sie gegen eine echte JPEG-Datei halten, ohne Expo,
 * ohne Metro, ohne Gerät. Stünde sie in `bild-waehlen.native.ts`, zöge jeder
 * Prüfversuch `expo-image-picker` mit.
 */

/** Das Standard-Alphabet (RFC 4648). URL-sicheres `-_` kommt hier nicht vor. */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Umkehrtabelle Zeichencode → 6-Bit-Wert, einmal gebaut.
 *
 * `255` heißt „gehört nicht zum Alphabet". Ein `indexOf` je Zeichen wäre die
 * naheliegende Zeile und bei zwei Millionen Zeichen eine lineare Suche je Byte.
 */
const WERT = (() => {
  const t = new Uint8Array(128).fill(255);
  for (let i = 0; i < ALPHABET.length; i++) t[ALPHABET.charCodeAt(i)] = i;
  return t;
})();

/**
 * Wie viele BYTES hinter einem base64-Text stecken — **ohne ihn zu dekodieren.**
 *
 * Das ist kein Geiz, sondern die Reihenfolge: `bildHuerdeText()` fragt die Größe,
 * BEVOR irgendetwas hochgeladen wird. Wer erst dekodiert und dann fragt, legt für
 * ein Bild, das er gleich ablehnt, dessen volle Größe in den Arbeitsspeicher —
 * bei einem versehentlich gewählten 50-MB-Panorama ist das der Unterschied
 * zwischen einer Meldung und einem Absturz.
 *
 * Vier base64-Zeichen tragen drei Bytes; jedes `=` am Ende nimmt eines davon weg.
 */
export function base64Bytes(text: string): number {
  let fuell = 0;
  if (text.endsWith('==')) fuell = 2;
  else if (text.endsWith('=')) fuell = 1;
  return Math.floor((text.length * 3) / 4) - fuell;
}

/**
 * base64 → `Uint8Array`.
 *
 * Zeichen außerhalb des Alphabets (Zeilenumbrüche, Leerzeichen, `=`) werden
 * übersprungen statt als Fehler behandelt: base64 aus einer fremden Quelle darf
 * umgebrochen sein, und ein Bild wegen eines `\n` abzulehnen wäre eine Absage
 * ohne Sache dahinter.
 *
 * **Der Rückgabewert ist absichtlich ein `Uint8Array` und kein `ArrayBuffer`:**
 * `FileBody` in storage-js nimmt `ArrayBufferView` ausdrücklich an, und ein
 * `.buffer` herauszureichen wäre nur dann derselbe Inhalt, wenn Offset und Länge
 * genau passen — eine Bedingung, die stimmt, bis sie es einmal nicht tut.
 */
export function base64ZuBytes(text: string): Uint8Array {
  const bytes = new Uint8Array(base64Bytes(text));
  let aus = 0;
  let puffer = 0;
  let bits = 0;

  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    const w = c < 128 ? WERT[c] : 255;
    if (w === 255) continue;

    puffer = (puffer << 6) | w;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      // Die Länge stand vorher fest. Stimmt sie nicht — etwa weil der Text
      // abgeschnitten ankam —, wird hier nichts über den Rand geschrieben:
      // Ein `Uint8Array` verwirft eine Zuweisung außerhalb seiner Grenzen still.
      // Genau deshalb wird unten NACHGEZÄHLT statt darauf vertraut.
      if (aus < bytes.length) bytes[aus++] = (puffer >> bits) & 0xff;
    }
  }

  // Kam weniger heraus als gerechnet, war der Text nicht vollständig. Dann lieber
  // die kürzere ECHTE Länge als ein Bild mit Nullen am Ende — ein halbes JPEG
  // erkennt man, ein mit Nullen aufgefülltes sieht heil aus.
  return aus === bytes.length ? bytes : bytes.slice(0, aus);
}
