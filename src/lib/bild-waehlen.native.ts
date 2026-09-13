import * as ImagePicker from 'expo-image-picker';

import { BILD_QUALITAET, ZUSCHNEIDEN, BildWahlFehler } from '@/features/social/bild';
import { ZUSCHNITT_EIGENES_FENSTER } from '@/features/social/zuschnitt';
import { bildQuelleLesen } from '@/lib/bild-zuschneiden';
import type { Bildwahl } from '@/lib/bild-waehlen-typen';

/**
 * Ein Bild vom Gerät holen — **der native Zweig, und seit Phase 20.6-b kann er es.**
 *
 * ── Was sich seit dem 12.09. geändert hat ───────────────────────────────────
 * Hier stand vier Wochen lang, `expo-image-picker` liege NICHT in `node_modules`
 * und nicht in `ios/Podfile.lock`. Beides war richtig gemessen und ist seit dem
 * Build vom 12.09. nachts überholt (20 Treffer in `Podfile.lock`). Der Baustein
 * kam mit denselben fünf, die 20.3-b2 braucht.
 *
 * **Was er NICHT braucht, ist Ians Supabase-Klick.** `expo-image-picker` redet mit
 * iOS, nicht mit Supabase — deshalb ließ sich 20.6-b vorziehen, während Apple und
 * Google noch auf die sieben Felder im Dashboard warten. Dieselbe Trennung wie
 * 20.3-a vor 20.3-b und 19e vor 19h-2.
 *
 * ── Der teuerste Fund: `uri` ist HEIC, `base64` ist JPEG ────────────────────
 * Gemessen in `node_modules/expo-image-picker/ios/ImageUtils.swift`:
 *
 *   Zeile 147:  `case UTType.heic.identifier: return (rawData, ".heic")`
 *   Zeile 206:  base64 wird „always JPEG regardless of the source file's original
 *               format (e.g. HEIC, PNG)"
 *
 * `image/heic` steht nicht in `BILD_TYPEN`. Der naheliegende Weg — die Datei hinter
 * `uri` lesen und `asset.mimeType` als Typ nehmen — hätte also **jedem gewöhnlichen
 * iPhone-Foto** die Absage „Das geht nur als JPG, PNG oder WebP" gegeben. Nicht dem
 * Rand: dem Normalfall, dieselbe Familie wie „wer nie ein Profilbild hatte" (20.6-c).
 *
 * ── Und derselbe Weg löst das zweite Problem gleich mit ─────────────────────
 * `@supabase/storage-js` sagt in seinem Quelltext, dass ein `Blob` auf React Native
 * nicht funktioniert und man `ArrayBuffer` nehmen soll. Aus base64 wird genau der —
 * über `lib/base64.ts`, gemessen in `90_bildwahl.mjs` gegen echte Bilddateien.
 *
 * ── Was hier seit Phase 20.6-d NICHT MEHR passiert ──────────────────────────
 * **Diese Datei liest das Bild nicht mehr.** Hier stand bis zum 2026-09-13 der
 * ganze Weg bis zum `Uint8Array`: `base64: true`, `base64Bytes()`, `base64ZuBytes()`
 * und der Typ `image/jpeg`. Das ist jetzt in `lib/bild-zuschneiden.native.ts`, denn
 * gelesen wird erst NACH dem Zuschnitt — und zwar der Ausschnitt, nicht das ganze
 * Foto.
 *
 * Der Gewinn ist nicht die Aufräumarbeit, sondern der Speicher: Ein
 * 12-Megapixel-Foto kam bisher als base64-Text (rund 4 MB Zeichen) nach JavaScript
 * und wurde dort noch einmal zu Bytes. Jetzt kommt ein fertiger 512er an, also etwa
 * ein Fünfzigstel — und das auf einem Gerät, dem iOS den Speicher jederzeit
 * wegnehmen darf.
 *
 * ── Und `allowsEditing` ist deshalb AUS ─────────────────────────────────────
 * Nicht, weil Ians Entscheidung 54 zurückgenommen wäre — sie gilt, zugeschnitten
 * WIRD. Nur macht es seit 20.6-d unser eigenes rundes Fenster. Die ganze
 * Begründung steht an `ZUSCHNITT_EIGENES_FENSTER` in `features/social/zuschnitt.ts`
 * (harte Regel 58: eine neue Entscheidung überschreibt nie still eine alte).
 */
export const BILDWAHL_LAEUFT = true;

export async function bildWaehlen(): Promise<Bildwahl | null> {
  // ── Die Erlaubnis wird GEFRAGT, nicht vorausgesetzt ───────────────────────
  // `launchImageLibraryAsync` fragt auf neueren iOS-Fassungen selbst nach; wer sich
  // darauf verlässt, bekommt bei einer Ablehnung aber ein stilles `canceled` und
  // kann „abgebrochen" nicht von „darf nicht" unterscheiden. Hier wird deshalb
  // ausdrücklich gefragt — der Erlaubnis-Text dazu steht im gebauten `Info.plist`
  // (geprüft dort, nicht in `app.json` — die Lehre aus 19h-2).
  let erlaubnis;
  try {
    erlaubnis = await ImagePicker.requestMediaLibraryPermissionsAsync();
  } catch (fehler) {
    // Bis zum 2026-09-13 lief jeder Wurf von hier bis zum Screen durch und
    // verschwand dort spurlos (`onPress={async …}`). Jetzt trägt er eine Stufe.
    throw new BildWahlFehler('oeffnen', fehler);
  }
  if (!erlaubnis.granted) {
    // `null` wie beim Abbrechen: Der Screen sagt dann nichts. Das ist Absicht —
    // wer gerade selbst „Nicht erlauben" getippt hat, weiß, warum nichts passiert;
    // eine Meldung wäre eine Belehrung. Wird der Fall später doch sichtbar, gehört
    // der Satz nach `bildFolgen()` und nicht hierher (harte Regel 88).
    return null;
  }

  // ⚠️ **Hier ist Ians Fehler vom 13.09. herausgekommen, und zwar dem Ort nach:**
  // Der Bildwähler ging auf, der Zuschnitt kam, und danach war der Bildschirm
  // unverändert. `launchImageLibraryAsync` löst sich nicht nur mit `canceled` auf,
  // es WIRFT auch — die Bibliothek baut das base64 im nativen Code, NACHDEM der
  // Mensch zugeschnitten hat (`MediaHandler.swift`, Zeile 94), und
  // `readJpegBase64From` wirft `FailedToReadImageDataForBase64Exception`, wenn
  // `UIImage.jpegData()` nichts hergibt. Genau dieser Wurf kam bis heute nirgends an.
  let ergebnis;
  try {
    ergebnis = await ImagePicker.launchImageLibraryAsync({
      // Nur Bilder. Ohne diese Zeile stünden auch Videos zur Wahl — und ein Video
      // als Profilbild wäre ein Fehler, den erst der Bucket meldet.
      mediaTypes: ['images'],
      // Ians Entscheidung 54 („zugeschnitten wird") in ihrer NEUEN Ausführung:
      // Apples quadratischer Dialog bleibt zu, weil unser rundes Fenster ihn
      // ersetzt. Beide Konstanten stehen absichtlich da — `ZUSCHNEIDEN` sagt OB,
      // `ZUSCHNITT_EIGENES_FENSTER` sagt VON WEM. Stellt jemand das Fenster ab,
      // kommt Apples Dialog von selbst zurück, statt dass gar nichts zuschneidet.
      allowsEditing: ZUSCHNEIDEN && !ZUSCHNITT_EIGENES_FENSTER,
      // `quality` steht hier NUR noch für den Fall, dass jemand
      // `ZUSCHNITT_EIGENES_FENSTER` abstellt: Dann schneidet wieder Apples Dialog
      // zu und kodiert dabei neu. Solange unser Fenster an ist, wird an dieser
      // Stelle nichts kodiert — komprimiert wird beim `saveAsync()` in
      // `bild-zuschneiden.native.ts`, mit derselben Konstante.
      quality: BILD_QUALITAET,
      // ❌ Hier stand `base64: true`, und daran hing Phase 20.6-b: Es war der
      // einzige Weg, an JPEG-Bytes statt an eine HEIC-Datei zu kommen. Seit 20.6-d
      // ist der Weg ein anderer und ein besserer — `expo-image-manipulator`
      // schreibt JPEG, weil wir es ihm SAGEN (`format: SaveFormat.JPEG`), statt
      // weil wir es in fremdem Quelltext gelesen haben. Ein Mechanismus, den man im
      // fremden Quelltext findet, ist eine Hypothese (FALLEN.md).
      //
      // Und es spart die 4 MB base64-Text je Versuch — siehe der Absatz oben.
      // Ein Bild, nicht mehrere. `allowsMultipleSelection` schließt `allowsEditing`
      // ohnehin aus, aber ein ausdrückliches `false` sagt, dass das gewollt ist.
      allowsMultipleSelection: false,
      // EXIF bleibt draußen. Ein Foto trägt dort den Aufnahmeort — und was die App
      // über den Ort eines Menschen weiß, sagt sie nach harter Regel 68 niemandem,
      // nicht einmal sich selbst. Wir würden es nie lesen; aber was man nicht holt,
      // kann man auch nicht versehentlich weiterreichen.
      exif: false,
    });
  } catch (fehler) {
    throw new BildWahlFehler('lesen', fehler);
  }

  // Abgebrochen ist kein Fehler, sondern die häufigste Antwort auf „Bild aussuchen".
  if (ergebnis.canceled) return null;

  const bild = ergebnis.assets?.[0];
  // `assets` ist im Typ optional, und `canceled: false` mit leerer Liste ist ein
  // Zustand, den die Bibliothek nicht ausschließt. Ohne diese Zeile wäre die Folge
  // kein Fehler, sondern ein `undefined`, das sich zwei Zeilen später als leeres
  // Bild tarnt — und bis zum 2026-09-13 war es ein stilles `return null`, also
  // nicht von „abgebrochen" zu unterscheiden. Jetzt trägt es eine Stufe.
  if (!bild) throw new BildWahlFehler('lesen');

  // ── Und hier endet die Aufgabe dieser Datei ───────────────────────────────
  // Sie hat ein Foto besorgt. Wie groß es IST und was davon in den Kreis kommt,
  // beantwortet `lib/bild-zuschneiden`; gelesen wird es erst danach.
  //
  // ⚠️ **Die Maße kommen bewusst NICHT aus `bild.width`/`bild.height`.** Deren
  // eigener Typ sagt *„Can be `0` if the system did not provide the width"*, und
  // eine Null wäre hier ein Bild ohne Fläche. Dazu die EXIF-Drehung: Ein quer
  // gehaltenes iPhone speichert aufrecht und merkt sich den Winkel daneben — wer
  // die Maße von hier nimmt und gegen das DEKODIERTE Bild zuschneidet, vertauscht
  // bei solchen Fotos Breite und Höhe. Die ganze Begründung steht am Typ
  // `Bildquelle`.
  return { art: 'zuschneiden', quelle: await bildQuelleLesen(bild.uri) };
}
