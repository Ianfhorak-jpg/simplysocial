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

/**
 * Ein Foto, so wie es auf dem Gerät LIEGT — noch nicht zugeschnitten, noch nicht
 * gelesen. Phase 20.6-d.
 *
 * ⚠️ **Die Maße kommen NICHT von `expo-image-picker`, und das ist ein Fund.** Sein
 * `asset.width` trägt in den eigenen Typen den Satz *„Can be `0` if the system did
 * not provide the width"* — eine Null, die durch `zuschnittRechteck()` als „Bild
 * ohne Fläche" ginge. Dazu kommt die Drehung: Ein quer gehaltenes iPhone speichert
 * das Foto aufrecht und merkt sich im EXIF, dass es gedreht gehört. Wer die Maße
 * vor dem Dekodieren nimmt und den Zuschnitt danach rechnet, vertauscht bei solchen
 * Fotos Breite und Höhe — und der Kreis sitzt woanders, als er aussah.
 *
 * Deshalb liest `bildQuelleLesen()` die Maße aus dem DEKODIERTEN Bild, also aus
 * derselben Quelle, die gleich auch zuschneidet.
 */
export type Bildquelle = {
  /** Die Datei auf dem Gerät. Bei einem iPhone-Foto ein HEIC — zum Anschauen richtig. */
  uri: string;
  /** Breite des dekodierten Bildes in echten Pixeln. */
  breite: number;
  /** Höhe des dekodierten Bildes in echten Pixeln. */
  hoehe: number;
};

/**
 * Was beim Aussuchen herauskommt — **und es sind zwei verschiedene Dinge, nicht
 * eines mit einem Zusatzfeld.**
 *
 * ── Warum ein Union und kein `Bilddatei` mit optionalem `quelle` ────────────
 * Weil die zwei Fälle nicht zusammen vorkommen und der Bildschirm mit ihnen
 * VERSCHIEDENES tut: `'fertig'` geht direkt hochladen, `'zuschneiden'` öffnet erst
 * das runde Fenster. Mit zwei optionalen Feldern wäre „beides gesetzt" und „keines
 * gesetzt" je ein Zustand, den es nicht gibt und den trotzdem jemand prüfen müsste.
 *
 * Dieselbe Überlegung wie bei `Post.alter` (harte Regel 27) und `Post.visibility`
 * (31): *„Ein Union-Typ ist ein Werkzeug, kein bloßer Typ"* — er macht einen
 * vergessenen Fall zu einem Übersetzungsfehler statt zu einem leeren Bildschirm.
 *
 * ── Warum es auf Web KEIN `'zuschneiden'` gibt ─────────────────────────────
 * Die öffentliche Adresse ist der Prototyp mit erfundenen Daten; dort wird nichts
 * hochgeladen, was zugeschnitten werden müsste. Ein rundes Fenster auch dort wäre
 * Arbeit für einen Bildschirm, den nach harter Regel 63 niemand braucht. Der Typ
 * lässt es offen — kommt es doch, ist es kein Umbau, sondern ein zweiter Zweig.
 */
export type Bildwahl =
  | { art: 'fertig'; datei: Bilddatei }
  | { art: 'zuschneiden'; quelle: Bildquelle };
