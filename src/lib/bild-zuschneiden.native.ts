import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { BILD_QUALITAET, BILD_TYP_VOM_GERAET, BildWahlFehler } from '@/features/social/bild';
import { zuschnittRechteck, zuschnittZielKante, type BildGroesse, type ZuschnittSicht } from '@/features/social/zuschnitt';
import { base64Bytes, base64ZuBytes } from '@/lib/base64';
import type { Bilddatei, Bildquelle } from '@/lib/bild-waehlen-typen';

/**
 * Aus einem Foto den runden Ausschnitt machen — **der native Zweig, Phase 20.6-d.**
 *
 * ── Was diese Datei NICHT tut ───────────────────────────────────────────────
 * Sie rechnet nicht. Wo das Quadrat liegt, steht in `features/social/zuschnitt.ts`
 * und ist dort von `91_zuschnitt.mjs` mit 47 Häkchen und zwei Gegenproben gemessen.
 * Hier wird es nur ausgeführt. Dieselbe Arbeitsteilung wie `lib/bild-waehlen` zu
 * `features/social/bild` — der Baustein weiß, WIE, die Regel-Datei weiß, WAS.
 *
 * ── Der Nebeneffekt, der größer ist als der Anlass ──────────────────────────
 * Bis heute stand in `bild.ts` an `BILD_TYP_VOM_GERAET` eine BEOBACHTUNG: dass
 * `expo-image-picker` sein base64 „always JPEG" liefert, nachgelesen in dessen
 * `ios/ImageUtils.swift`. Die Zusage war fremder Quelltext, und ein Mechanismus,
 * den man im fremden Quelltext FINDET, ist eine Hypothese (FALLEN.md).
 *
 * Seit dieser Datei ist es eine ANWEISUNG: `format: SaveFormat.JPEG`. Dieselbe
 * Konstante, dieselbe Wirkung — nur steht sie jetzt bei uns. Damit ist die HEIC-Falle
 * nicht mehr umgangen, sondern erledigt.
 *
 * ── Und die Kette ist eine einzige Überfahrt ────────────────────────────────
 * `crop` und `resize` laufen beide im nativen Baustein, bevor irgendetwas nach
 * JavaScript zurückkommt. Ein 12-Megapixel-Foto wandert also NICHT als base64 durch
 * den Arbeitsspeicher, um danach verkleinert zu werden — es kommt gleich als 512er
 * an. Das ist der Unterschied zwischen ~30 KB und ~1,5 MB je Versuch.
 */

/**
 * Die Maße eines Fotos — aus dem DEKODIERTEN Bild, nicht aus dem Bildwähler.
 *
 * Die Begründung steht am Typ `Bildquelle`: `asset.width` darf laut den eigenen
 * Typen von `expo-image-picker` `0` sein, und die EXIF-Drehung kann Breite und Höhe
 * vertauschen. Ein `renderAsync()` ohne jede Aktion dekodiert das Bild einmal und
 * sagt, wie groß es WIRKLICH ist.
 *
 * ⚠️ **Am Gerät noch nicht nachgemessen** — dass `ImageRef.width` die gedrehte und
 * nicht die gespeicherte Breite meldet, ist die begründete Erwartung und gehört in
 * den Gerätedurchgang. Der Prüfstein dafür ist ein quer aufgenommenes Foto: Sitzt
 * der Kreis dort, wo er im Fenster stand, stimmt es.
 */
export async function bildQuelleLesen(uri: string): Promise<Bildquelle> {
  try {
    const bild = await ImageManipulator.manipulate(uri).renderAsync();
    return { uri, breite: bild.width, hoehe: bild.height };
  } catch (fehler) {
    // Dieselbe Stufe wie beim Bildwähler: Das Foto kam zurück, ließ sich aber nicht
    // lesen. Der häufigste Fall bei einem modernen iPhone ist ein Live Photo oder
    // ein ProRAW — und `bildFehlerText('lesen')` rät deshalb zu einem anderen Foto
    // und nicht zu „nochmal".
    throw new BildWahlFehler('lesen', fehler);
  }
}

/**
 * Den gewählten Ausschnitt herausschneiden und auf Ians 512 bringen.
 *
 * ── Warum `resize` NUR manchmal in der Kette steht ──────────────────────────
 * `zuschnittZielKante()` gibt bei einem kleinen Ausschnitt dessen eigene Kante
 * zurück — dann würde `resize` auf genau dieselbe Größe rechnen. Das ist keine
 * teure, aber eine LÜGENDE Zeile: Sie sähe aus, als werde etwas angepasst. Der
 * Vergleich steht deshalb hier und die Entscheidung darüber in der Regel-Datei.
 */
export async function bildZuschneiden(
  quelle: Bildquelle,
  sicht: ZuschnittSicht,
): Promise<Bilddatei> {
  const bild: BildGroesse = { breite: quelle.breite, hoehe: quelle.hoehe };
  // Wirft, wenn das Bild keine Fläche hat — der Screen fragt vorher mit
  // `istZuschneidbar()`, aber diese Funktion verlässt sich nicht darauf.
  const rechteck = zuschnittRechteck(bild, sicht);
  const kante = zuschnittZielKante(rechteck);

  let ergebnis;
  try {
    let kette = ImageManipulator.manipulate(quelle.uri).crop(rechteck);
    if (kante < rechteck.width) kette = kette.resize({ width: kante, height: kante });
    const fertig = await kette.renderAsync();
    ergebnis = await fertig.saveAsync({
      // **Die Anweisung, die vorher eine Beobachtung war.** Siehe der Kopf.
      format: SaveFormat.JPEG,
      // Dieselbe Zahl wie beim Bildwähler (Ians Begründung steht dort): der Wert,
      // ab dem ein Unterschied mit bloßem Auge nicht mehr auffällt.
      compress: BILD_QUALITAET,
      // Gebraucht, weil `@supabase/storage-js` auf React Native keinen `Blob` nimmt
      // (harte Regel 91). Der Weg base64 → `Uint8Array` ist derselbe wie im
      // Bildwähler und von `90_bildwahl.mjs` an echten Bilddateien gemessen.
      base64: true,
    });
  } catch (fehler) {
    // `umwandeln` und nicht `lesen`: Gelesen wurde erfolgreich — beim Aussuchen war
    // das Bild ja schon zu sehen. Was hier scheitert, ist das Vorbereiten, und
    // `bildFehlerText('umwandeln')` rät entsprechend zu einem kleineren Foto.
    throw new BildWahlFehler('umwandeln', fehler);
  }

  if (!ergebnis.base64) {
    // Der Baustein gibt `base64` nie absichtlich weg, wenn man es angefordert hat.
    // Fehlt es trotzdem, ist etwas schiefgegangen — und das gehört gesagt, statt als
    // leeres Bild weiterzureisen. Dieselbe Zeile und derselbe Grund wie im
    // Bildwähler bei `bild.base64`.
    throw new BildWahlFehler('umwandeln');
  }

  let bytes: number;
  let inhalt;
  try {
    // Die Größe wird gerechnet, BEVOR dekodiert wird — `base64Bytes()` fasst den
    // Text nicht an. Bei 512 px ist das kaum noch ein Argument; die Zeile steht
    // trotzdem so da wie im Bildwähler, damit die zwei Wege sich gleichen.
    bytes = base64Bytes(ergebnis.base64);
    inhalt = base64ZuBytes(ergebnis.base64);
  } catch (fehler) {
    throw new BildWahlFehler('umwandeln', fehler);
  }

  return {
    inhalt,
    typ: BILD_TYP_VOM_GERAET,
    bytes,
    // **Hier ist die neue `uri` richtig und die alte falsch.** `ergebnis.uri` zeigt
    // auf die zugeschnittene Datei im Zwischenspeicher — also auf das, was gleich
    // hochgeladen wird. Stünde hier weiter `quelle.uri`, zeigte der Attrappen-Zweig
    // von `profilbildSetzen()` das ganze Foto statt des Ausschnitts, und niemand
    // sähe im Prototyp, dass der Zuschnitt überhaupt wirkt.
    vorschau: ergebnis.uri,
  };
}
