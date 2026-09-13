/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS EIN ZUSCHNITT IST — UND WO DAS QUADRAT IM FOTO LIEGT
 *  Phase 20.6-d. Ians Wunsch vom 2026-09-13: „bitte kreisförmiges Zuschneiden."
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Diese Datei ist die eine Stelle, an der steht, welcher Teil eines Fotos im Kreis
 * landet. Der Zuschneide-Screen rechnet nie selbst; er hält einen `ZuschnittSicht`
 * und fragt hier nach. Dieselbe Bauart wie `safety/block.ts` (harte Regel 17),
 * `groups/gruppe.ts` (32), `requests/kollision.ts` (46), `posts/standort.ts` (68),
 * `data/quelle.ts` (76), `auth/konto.ts` (78), `data/schreiben.ts` (84) und
 * `social/bild.ts` (88).
 *
 * ⚠️ **Die Datei bleibt IMPORTFREI.** `supabase/pruefen/91_zuschnitt.mjs` lädt sie in
 * blankem Node; ein einziger `import` aus `@/…` bricht diesen Prüfstand mit einer
 * Meldung, die nach kaputtem Node aussieht (FALLEN.md, zweimal getroffen).
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DER DENKFEHLER, DEN EIN FRISCHER KOPF HIER MACHT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * **Ein rundes BILD gibt es nicht.** JPEG hat keinen Alphakanal; ein PNG mit runder
 * Maske wäre größer und stünde in `BILD_TYPEN` als dritter Fall herum. Was Ian will,
 * ist ein rundes **FENSTER** beim Aussuchen — damit er sieht, was vom Foto im Kreis
 * landet. Gespeichert wird weiter ein Quadrat, und `SsAvatar` zeichnet es rund
 * (`borderRadius: radius.pill` plus `overflow: hidden`, seit Phase 14).
 *
 * Daraus folgt, was diese Datei rechnet: **ein Quadrat, kein Kreis.** Der Kreis ist
 * dem Quadrat einbeschrieben und kommt in keiner Formel vor.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WARUM DER ZUSTAND IN ORIGINAL-PIXELN STEHT UND NICHT IN BILDSCHIRMPUNKTEN
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Der naheliegende Zustand wäre „das Bild ist um (vx, vy) Punkte verschoben und um z
 * vergrößert". Verworfen, aus zwei Gründen:
 *
 *   1. **Jede Frage bräuchte eine Umrechnung.** `expo-image-manipulator` will
 *      `{ originX, originY, width, height }` in Pixeln des Originals. Steht der
 *      Zustand schon so da, ist `zuschnittRechteck()` fast eine Identität — und es
 *      gibt keine zweite Stelle, an der ein Faktor falsch herum stehen kann.
 *   2. **Der Bildschirm darf sich ändern, der Zuschnitt nicht.** Ein Zustand in
 *      Punkten hinge an der Fenstergröße; dreht jemand das Handy oder klappt die
 *      Tastatur auf, wäre der gewählte Ausschnitt ein anderer.
 *
 * Der Zustand ist deshalb: **Mittelpunkt des Quadrats (in Pixeln) + Zoomstufe.** Der
 * Mittelpunkt und nicht die linke obere Ecke — beim Zoomen soll der Mensch das
 * behalten, was er in der Mitte hat, und mit einer Ecke wäre das eine Rechnung mehr.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  GEKLEMMT, NICHT INTERPOLIERT — UND DAS IST EINE ABSICHERUNG
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Bei einem Hochkant-Foto (3024 × 4032) ist das größtmögliche Quadrat 3024 breit —
 * der waagrechte Spielraum bei Zoom 1 ist also **exakt null**. Das ist kein Randfall,
 * sondern jedes zweite Handyfoto.
 *
 * In diesem Projekt hat genau diese Null schon einen Abend gekostet: Eine
 * `Animated`-Interpolation über eine Spanne der Breite null liefert in React Native
 * nicht die Mitte, sondern den **Extremwert** (FALLEN.md, „Eine Interpolation mit
 * einer Spanne der Breite null liefert den EXTREMWERT"). Hier wird deshalb nirgends
 * interpoliert, sondern nur geklemmt: `min(max(x, a), b)` mit `a === b` gibt `a`, und
 * das ist genau richtig — das Quadrat kann waagrecht nicht wandern, weil es nirgends
 * hin kann.
 */

/**
 * Wie groß der fertige Ausschnitt hochgeladen wird — **Ians Entscheidung 77 vom
 * 2026-09-13.**
 *
 * ── Was gemessen wurde ──────────────────────────────────────────────────────
 * Der größte Avatar der App ist `SIZES.lg.box` = **72 Punkte** (`SsAvatar.tsx`), auf
 * einem 3x-iPhone also **216 echte Pixel**. Alles darüber ist Vorrat, kein Bedarf.
 *
 * Dateigrößen an zwei echten Fotos gemessen (JPEG, Qualität 0,8):
 *
 *     256 px     ~8–10 KB     1 GB gratis reicht für ~110.000 Bilder
 *     512 px    ~25–30 KB     …für ~35.000
 *    1024 px   ~85–160 KB     …für ~8.000
 *   ohne Verkleinern (3000 px)  0,7–1,5 MB   …für ~1.000
 *
 * ── Ians Wahl: 512 ──────────────────────────────────────────────────────────
 * Das 2,4-fache dessen, was heute gebraucht wird. **Verworfen: 256** — es ist genau
 * der heutige Bedarf und damit ohne jeden Vorrat; sobald ein Profilbild irgendwo
 * größer als 72 Punkte steht, ist es sichtbar unscharf, und die bereits
 * hochgeladenen Bilder lassen sich nicht nachschärfen. **Verworfen: ohne
 * Verkleinern** (der heutige Zustand) — dreißigmal so viel Speicher und Wartezeit
 * für einen 72-Punkte-Kreis.
 */
export const ZUSCHNITT_KANTE = 512;

/**
 * Wie weit man hineinzoomen darf.
 *
 * **Die Zahl ist nicht gegriffen, sondern an `ZUSCHNITT_KANTE` gebunden.** Bei einem
 * gewöhnlichen iPhone-Foto (12 MP, 3024 × 4032) ist die kurze Seite 3024. Bei Zoom 4
 * ist das Quadrat 3024 / 4 = **756 px** — immer noch mehr als die 512, die gespeichert
 * werden. Heißt: **Auch die höchste Zoomstufe kostet bei einem normalen Handyfoto
 * keine Schärfe.** Erst ab Zoom 5,9 fiele das Quadrat unter 512, und dann griffe
 * ohnehin `zuschnittZielKante()` und verkleinerte nicht mehr.
 *
 * Wer die Zahl erhöht, verschiebt damit still die Grenze, ab der ein Ausschnitt
 * hochgerechnet aussieht — deshalb steht die Rechnung hier und nicht im Screen.
 */
export const ZUSCHNITT_MAX_ZOOM = 4;

/**
 * Wer zuschneidet — **unser rundes Fenster oder Apples quadratischer Dialog.**
 *
 * ⚠️ **Diese Konstante LÖST Ians Entscheidung 54 ab, sie nimmt sie nicht zurück**
 * (harte Regel 58: eine neue Entscheidung überschreibt nie still eine alte).
 *
 * Entscheidung 54 vom 2026-09-13 lautete: *zugeschnitten wird* — gegen „sofort
 * fertig". Der Grund war, dass `SsAvatar` ein Querformat MITTIG beschneidet und wer
 * auf einem Gruppenfoto links steht, sonst einen Kreis ohne sich darin bekommt.
 * **Dieser Grund gilt unverändert.** Was sich ändert, ist nur das Werkzeug: Bis
 * 20.6-d tat es `allowsEditing: true`, also Apples eigener Dialog; seit 20.6-d tut
 * es der Screen `BildZuschneiden` — und der zeigt einen KREIS statt eines Quadrats,
 * was Ian am 13.09. ausdrücklich gewünscht hat („bitte kreisförmiges Zuschneiden").
 *
 * ── Warum nicht beides ──────────────────────────────────────────────────────
 * Zwei Zuschnitte hintereinander wären zwei Entscheidungen über denselben
 * Ausschnitt, und die erste nähme der zweiten Pixel weg, die sie nicht
 * zurückbekommt. Der Mensch müsste außerdem zweimal dasselbe tun und sähe beim
 * ersten Mal ein Quadrat, beim zweiten einen Kreis.
 *
 * `ZUSCHNEIDEN` in `bild.ts` bleibt deshalb stehen und behält seine Bedeutung
 * („es WIRD zugeschnitten"); diese Konstante beantwortet die zweite Frage
 * („von wem"). Wer sie auf `false` stellt, bekommt Entscheidung 54 in ihrer
 * ursprünglichen Ausführung zurück — mit einem Wort, wie es harte Regel 88 verlangt.
 */
export const ZUSCHNITT_EIGENES_FENSTER = true;

/** Die Maße eines Fotos in echten Pixeln. Kommt von `expo-image-picker` (`asset.width/height`). */
export type BildGroesse = {
  breite: number;
  hoehe: number;
};

/**
 * Was der Mensch gerade eingestellt hat.
 *
 * `mitteX`/`mitteY` sind der Mittelpunkt des Quadrats **in Pixeln des Originals**,
 * `zoom` ist 1 (größtmögliches Quadrat) bis `ZUSCHNITT_MAX_ZOOM`.
 *
 * ⚠️ **Ein `ZuschnittSicht` darf ungültig sein** — er kommt aus einer Fingergeste, und
 * die kennt keine Grenzen. Geklemmt wird nicht beim Schreiben, sondern bei jeder
 * Frage (`zuschnittRechteck`, `zuschnittSicht`). Der Grund ist derselbe wie beim
 * Bezirksfeld (harte Regel 81): Beim Ziehen durchläuft der Wert Zustände, die kein
 * gültiger Zuschnitt sind — wer sie unterwegs zurechtbiegt, macht die Geste zäh.
 */
export type ZuschnittSicht = {
  zoom: number;
  mitteX: number;
  mitteY: number;
};

/** Was `expo-image-manipulator` als `crop` haben will — Feldnamen absichtlich seine. */
export type ZuschnittRechteck = {
  originX: number;
  originY: number;
  width: number;
  height: number;
};

/**
 * Klemmen, das mit `NaN` umgehen kann.
 *
 * **`Math.min(Math.max(NaN, a), b)` ist `NaN`** — und ein `NaN` als `originX` ginge
 * durch jeden Typ, durch jede Prüfung und käme erst am nativen Baustein als
 * unverständlicher Fehler an. `PanResponder` liefert bei einer abgebrochenen Geste
 * durchaus einmal etwas, das keine Zahl ist (FALLEN.md, `gestureState.dx/dy` bei
 * mehreren Fingern). Also: Was keine Zahl ist, gilt als `min`.
 */
function klemm(wert: number, min: number, max: number): number {
  if (!Number.isFinite(wert)) return min;
  if (wert < min) return min;
  if (wert > max) return max;
  return wert;
}

/**
 * Wie groß ein Foto sein muss, damit man es überhaupt zuschneiden kann.
 *
 * Ein Bild mit 0 Pixeln Kantenlänge ist kein Randfall, den man abfangen „sollte" —
 * es wäre eine Division, deren Ergebnis `Infinity` ist, und die reicht das stumm
 * weiter. Deshalb wirft es. Der Screen fragt vorher mit `istZuschneidbar()`.
 */
export function istZuschneidbar(bild: BildGroesse): boolean {
  return (
    Number.isFinite(bild.breite) &&
    Number.isFinite(bild.hoehe) &&
    bild.breite >= 1 &&
    bild.hoehe >= 1
  );
}

/** Die Seite des größtmöglichen Quadrats: die kürzere Bildseite. Das ist Zoom 1. */
export function zuschnittGrundkante(bild: BildGroesse): number {
  return Math.min(bild.breite, bild.hoehe);
}

/**
 * Die Sicht, mit der der Zuschneide-Screen aufgeht: **ganz herausgezoomt und mittig.**
 *
 * **Verworfen: dort anfangen, wo das Gesicht ist.** Das bräuchte Gesichtserkennung,
 * also einen weiteren nativen Baustein — und wenn sie danebenliegt, ist das Ergebnis
 * schlechter als die Mitte, weil der Mensch es erst korrigieren muss. Die Mitte ist
 * dasselbe, was `SsAvatar` heute schon tut; der Screen ändert also nichts, solange
 * niemand etwas anfasst. Das ist der ehrlichste Anfangszustand: Er zeigt genau das,
 * was ohne diesen Screen herausgekommen wäre.
 */
export function zuschnittAnfang(bild: BildGroesse): ZuschnittSicht {
  return { zoom: 1, mitteX: bild.breite / 2, mitteY: bild.hoehe / 2 };
}

/**
 * Eine Sicht in ihre Grenzen bringen — **die eine Stelle, an der geklemmt wird.**
 *
 * Die Reihenfolge ist nicht beliebig: Erst der Zoom, denn er bestimmt die Kantenlänge
 * und damit erst den Spielraum des Mittelpunkts. Wer zuerst den Mittelpunkt klemmt
 * und dann den Zoom ändert, bekommt bei jedem Herauszoomen ein Quadrat, das über den
 * Bildrand hängt — also weiße Ecken im Kreis.
 */
export function zuschnittSicht(bild: BildGroesse, roh: ZuschnittSicht): ZuschnittSicht {
  const zoom = klemm(roh.zoom, 1, ZUSCHNITT_MAX_ZOOM);
  const kante = zuschnittGrundkante(bild) / zoom;
  const halb = kante / 2;
  return {
    zoom,
    // Bei einem Hochkant-Foto und Zoom 1 ist `halb === bild.breite - halb`. Dann sind
    // Unter- und Obergrenze derselbe Wert, und `klemm` gibt ihn zurück — das Quadrat
    // steht waagrecht fest, weil es nirgends hin kann. Siehe Kopf dieser Datei.
    mitteX: klemm(roh.mitteX, halb, bild.breite - halb),
    mitteY: klemm(roh.mitteY, halb, bild.hoehe - halb),
  };
}

/**
 * Der Ausschnitt in ganzen Pixeln — genau das, was `crop` haben will.
 *
 * ── Warum hier zweimal geklemmt wird ────────────────────────────────────────
 * Die Kantenlänge wird **abgerundet** (`floor`), nie aufgerundet: Ein Quadrat, das um
 * ein Pixel größer ist als das Bild, ist auf iOS kein „fast passend", sondern ein
 * Fehler aus dem nativen Baustein. Danach wird die Ecke gerundet — und **nach** dem
 * Runden noch einmal geklemmt, weil `Math.round` einen bereits an der Grenze
 * liegenden Wert um ein halbes Pixel darüber schieben kann. Zwei Zeilen, die einzeln
 * überflüssig aussehen und zusammen der Grund sind, dass es keinen Fehlerfall gibt
 * (FALLEN.md, „Zwei Stilwerte, die einzeln stimmen, ergeben zusammen den Fehler" —
 * hier einmal andersherum).
 */
export function zuschnittRechteck(bild: BildGroesse, roh: ZuschnittSicht): ZuschnittRechteck {
  if (!istZuschneidbar(bild)) {
    throw new Error(`Kein zuschneidbares Bild: ${bild.breite} × ${bild.hoehe}.`);
  }
  const sicht = zuschnittSicht(bild, roh);
  const kante = Math.max(1, Math.floor(zuschnittGrundkante(bild) / sicht.zoom));
  return {
    originX: klemm(Math.round(sicht.mitteX - kante / 2), 0, Math.floor(bild.breite) - kante),
    originY: klemm(Math.round(sicht.mitteY - kante / 2), 0, Math.floor(bild.hoehe) - kante),
    width: kante,
    height: kante,
  };
}

/**
 * Auf welche Kantenlänge der Ausschnitt danach gerechnet wird — **und warum nie
 * nach oben.**
 *
 * Ist der gewählte Ausschnitt kleiner als `ZUSCHNITT_KANTE` (ein kleines Bild aus
 * WhatsApp, ein weit hineingezoomter Ausschnitt), dann bleibt er, wie er ist.
 * Hochrechnen fügt **keine Information hinzu**, kostet aber Bytes — und es ist
 * schlimmer als nutzlos: Ein 200-px-Ausschnitt, der als 512er gespeichert wird, sieht
 * in der Datei aus wie ein scharfes Bild und ist erst auf dem Schirm unscharf. Der
 * Fehler wäre dann nicht mehr rückgängig zu machen, weil das Original weg ist.
 *
 * Dieselbe Haltung wie bei `BILD_QUALITAET`: lieber die Grenze benennen, als eine
 * Schärfe behaupten, die nicht da ist.
 */
export function zuschnittZielKante(rechteck: ZuschnittRechteck): number {
  return Math.min(ZUSCHNITT_KANTE, rechteck.width);
}

/**
 * Wie viele Pixel des Originals auf einen Bildschirmpunkt kommen.
 *
 * Der Screen zeichnet das Quadrat auf `fensterPunkte` Punkte Breite, egal wie groß es
 * in Pixeln ist. **Diese Zahl ist die ganze Brücke zwischen Finger und Foto** — sie
 * steht hier und nicht im Screen, damit es nur einen Ort gibt, an dem sie falsch
 * herum stehen kann.
 */
export function zuschnittPixelJePunkt(
  bild: BildGroesse,
  roh: ZuschnittSicht,
  fensterPunkte: number,
): number {
  const sicht = zuschnittSicht(bild, roh);
  const kante = zuschnittGrundkante(bild) / sicht.zoom;
  // Ein Fenster ohne Breite gibt es beim ersten Zeichnen, bevor `onLayout` gemessen
  // hat (FALLEN.md: `onLayout` meldet auf Web erst nach dem Zeichnen). Dann ist die
  // Antwort „ein Pixel je Punkt" — falsch, aber endlich; `Infinity` wäre ein NaN
  // zwei Zeilen später.
  if (!Number.isFinite(fensterPunkte) || fensterPunkte <= 0) return 1;
  return kante / fensterPunkte;
}

/**
 * Das Foto unter dem Fenster verschieben.
 *
 * ⚠️ **Das Vorzeichen ist der Punkt dieser Funktion.** Der Finger schiebt das BILD,
 * das Rechteck beschreibt aber das FENSTER. Zieht man das Bild nach rechts, wandert
 * der Ausschnitt nach **links**. Ohne diese eine Funktion stünde das Minus im Screen,
 * und wer dort später etwas umbaut, dreht es irgendwann um — und merkt es nicht,
 * weil sich das Bild ja bewegt.
 */
export function zuschnittSchieben(
  bild: BildGroesse,
  roh: ZuschnittSicht,
  dxPunkte: number,
  dyPunkte: number,
  fensterPunkte: number,
): ZuschnittSicht {
  const faktor = zuschnittPixelJePunkt(bild, roh, fensterPunkte);
  const dx = Number.isFinite(dxPunkte) ? dxPunkte : 0;
  const dy = Number.isFinite(dyPunkte) ? dyPunkte : 0;
  return zuschnittSicht(bild, {
    zoom: roh.zoom,
    mitteX: roh.mitteX - dx * faktor,
    mitteY: roh.mitteY - dy * faktor,
  });
}

/**
 * Kneifen: den Zoom mit einem Faktor multiplizieren.
 *
 * **Multiplizieren, nicht addieren.** Eine Kneifgeste liefert ein Verhältnis („die
 * Finger sind jetzt 1,3-mal so weit auseinander"), und ein Verhältnis gehört
 * multipliziert — sonst fühlt sich dieselbe Fingerbewegung bei starker Vergrößerung
 * anders an als bei schwacher.
 *
 * Der Mittelpunkt bleibt, wo er ist, und wird danach neu geklemmt: Beim Herauszoomen
 * wächst das Quadrat, also schrumpft sein Spielraum — ein Mittelpunkt am Rand rutscht
 * dabei von selbst wieder herein. Genau das erledigt `zuschnittSicht()`, und deshalb
 * steht hier keine zweite Rechnung.
 */
export function zuschnittZoomen(
  bild: BildGroesse,
  roh: ZuschnittSicht,
  faktor: number,
): ZuschnittSicht {
  const f = Number.isFinite(faktor) && faktor > 0 ? faktor : 1;
  return zuschnittSicht(bild, { ...roh, zoom: roh.zoom * f });
}

/**
 * Was dem Menschen über den Zuschnitt gesagt wird. **Die Sätze stehen hier**, aus
 * demselben Grund wie `bildFolgen()` in `bild.ts` (harte Regel 88): Sonst verspricht
 * irgendwann ein Screen etwas, das die Regel nicht mehr tut.
 */
export function zuschnittFolgen(): string[] {
  return [
    'Schieb und zieh das Foto, bis im Kreis steht, was du willst.',
    'Gespeichert wird nur, was im Kreis liegt — der Rest ist weg.',
  ];
}
