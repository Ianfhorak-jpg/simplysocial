/**
 * Was ein Bildwähler liefert — **die gemeinsame Schnittstelle der zwei Zweige.**
 *
 * Dieselbe Bauart wie `components/ui/karte-typen.ts` (harte Regel 52): Es gibt zwei
 * Zeichner und EINE Bedeutung. `bild-waehlen.ts` greift auf `document`,
 * `bild-waehlen.native.ts` auf `expo-image-picker` — was beide liefern müssen, steht
 * hier und in keiner der beiden Dateien.
 */

/**
 * Ein ausgesuchtes Bild, fertig zum Hochladen.
 *
 * ── Warum `inhalt` zwei Gestalten hat ───────────────────────────────────────
 * Kein Versehen, sondern eine Zusage von `@supabase/storage-js`. In seinem
 * Quelltext steht am `upload`:
 *
 *   > For React Native, using either `Blob`, `File` or `FormData` does not work
 *   > as intended. Upload file using `ArrayBuffer` from base64 file data instead.
 *
 * Im Browser ist der `Blob` dagegen genau richtig — dort wickelt storage-js ihn in
 * ein `FormData`, und das funktioniert. **Zwei Plattformen, zwei Gestalten, ein
 * Empfänger.** Ein gemeinsamer Nenner („immer `Uint8Array`") wäre im Browser ein
 * unnötiges Umkopieren jedes Bildes durch den Arbeitsspeicher.
 *
 * ── Warum `bytes` DANEBENSTEHT statt abgeleitet zu werden ───────────────────
 * **Das ist die wichtigste Zeile dieser Datei.** Ein `Blob` hat `.size`, ein
 * `Uint8Array` hat `.byteLength` — und `undefined > BILD_MAX_BYTES` ist `false`.
 * Hätte der Aufrufer weiter `wahl.datei.size` gefragt, wäre auf dem Handy die
 * Größenprüfung **still ausgefallen**: kein Typfehler, keine Meldung, jedes Bild
 * geht durch, bis der Bucket es ablehnt — auf Englisch und nach dem Warten.
 *
 * Dieselbe Familie wie `Post.district` (`string | null` erzwingt in JSX nichts)
 * und `ChatThread.postId` (eine Lockerung meldet der Compiler nicht). Der Ausweg
 * ist auch derselbe: Die Angabe, auf die es ankommt, bekommt einen eigenen Namen,
 * statt aus der Form des Inhalts erraten zu werden.
 *
 * ── Warum `typ` nicht aus der Datei kommt ───────────────────────────────────
 * Auf dem Gerät ist er **immer** `BILD_TYP_VOM_GERAET` (`image/jpeg`), auch wenn
 * das Original ein HEIC war — die Begründung steht an dieser Konstante in
 * `features/social/bild.ts`.
 */
export type Bilddatei = {
  /** Was wirklich hochgeladen wird. Browser: `Blob`. Gerät: `Uint8Array`. */
  inhalt: Blob | Uint8Array;
  /** Der MIME-Typ des INHALTS — nicht der der Originaldatei. */
  typ: string;
  /** Wie viele Bytes das sind. Steht ausdrücklich da, siehe oben. */
  bytes: number;
  /**
   * Eine Adresse, unter der sich das Bild ANZEIGEN lässt, ohne es hochzuladen.
   *
   * Gebraucht wird sie vom Attrappen-Zweig in `profilbildSetzen()`: Dort gibt es
   * keinen Server, und trotzdem soll man SEIN Bild sehen und nicht irgendeines.
   *
   * **Sie ist ausdrücklich NICHT dasselbe wie `inhalt`, und das ist der Fund:**
   * Auf dem Gerät ist sie die `uri` von `expo-image-picker` — also die Datei, die
   * bei einem iPhone-Foto HEIC ist. Zum ANSCHAUEN ist das genau richtig, iOS zeigt
   * HEIC klaglos an; zum HOCHLADEN ist es falsch, weil `image/heic` nicht in
   * `BILD_TYPEN` steht. Ein Feld für beides hätte je nach Zweig einen der beiden
   * Fälle still kaputtgemacht.
   *
   * Ohne dieses Feld wäre `URL.createObjectURL(inhalt)` am Gerät auf ein
   * `Uint8Array` getroffen — und `ANMELDE_QUELLE` steht dort weiterhin auf
   * `'attrappe'`, der Zweig läuft also.
   */
  vorschau: string;
};
