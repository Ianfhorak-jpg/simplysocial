import * as ImagePicker from 'expo-image-picker';

import { BILD_QUALITAET, BILD_TYP_VOM_GERAET, ZUSCHNEIDEN } from '@/features/social/bild';
import { base64Bytes, base64ZuBytes } from '@/lib/base64';
import type { Bilddatei } from '@/lib/bild-waehlen-typen';

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
 * ── Was hier NICHT passiert: verkleinern ────────────────────────────────────
 * Die Auflösung bleibt, wie sie aus dem Zuschneide-Dialog kommt; kleiner rechnen
 * könnte nur `expo-image-manipulator`, und das wäre ein SECHSTER Baustein und ein
 * weiterer Build (gemessen: liegt nicht in `node_modules`). Gesteuert wird die
 * Größe deshalb über `BILD_QUALITAET` und über Ians Entscheidung 54 — ein
 * quadratischer Ausschnitt ist schon ein Bruchteil eines 12-Megapixel-Fotos.
 */
export const BILDWAHL_LAEUFT = true;

export async function bildWaehlen(): Promise<Bilddatei | null> {
  // ── Die Erlaubnis wird GEFRAGT, nicht vorausgesetzt ───────────────────────
  // `launchImageLibraryAsync` fragt auf neueren iOS-Fassungen selbst nach; wer sich
  // darauf verlässt, bekommt bei einer Ablehnung aber ein stilles `canceled` und
  // kann „abgebrochen" nicht von „darf nicht" unterscheiden. Hier wird deshalb
  // ausdrücklich gefragt — der Erlaubnis-Text dazu steht im gebauten `Info.plist`
  // (geprüft dort, nicht in `app.json` — die Lehre aus 19h-2).
  const erlaubnis = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!erlaubnis.granted) {
    // `null` wie beim Abbrechen: Der Screen sagt dann nichts. Das ist Absicht —
    // wer gerade selbst „Nicht erlauben" getippt hat, weiß, warum nichts passiert;
    // eine Meldung wäre eine Belehrung. Wird der Fall später doch sichtbar, gehört
    // der Satz nach `bildFolgen()` und nicht hierher (harte Regel 88).
    return null;
  }

  const ergebnis = await ImagePicker.launchImageLibraryAsync({
    // Nur Bilder. Ohne diese Zeile stünden auch Videos zur Wahl — und ein Video
    // als Profilbild wäre ein Fehler, den erst der Bucket meldet.
    mediaTypes: ['images'],
    // Ians Entscheidung 54. Steht als benannte Konstante in der Regel-Datei, damit
    // sie sich mit einem Wort zurücknehmen lässt (harte Regel 88).
    allowsEditing: ZUSCHNEIDEN,
    quality: BILD_QUALITAET,
    // **Das ist die Zeile, an der die Phase hängt** — siehe der HEIC-Absatz oben.
    base64: true,
    // Ein Bild, nicht mehrere. `allowsMultipleSelection` schließt `allowsEditing`
    // ohnehin aus, aber ein ausdrückliches `false` sagt, dass das gewollt ist.
    allowsMultipleSelection: false,
    // EXIF bleibt draußen. Ein Foto trägt dort den Aufnahmeort — und was die App
    // über den Ort eines Menschen weiß, sagt sie nach harter Regel 68 niemandem,
    // nicht einmal sich selbst. Wir würden es nie lesen; aber was man nicht holt,
    // kann man auch nicht versehentlich weiterreichen.
    exif: false,
  });

  // Abgebrochen ist kein Fehler, sondern die häufigste Antwort auf „Bild aussuchen".
  if (ergebnis.canceled) return null;

  const bild = ergebnis.assets?.[0];
  // `assets` ist im Typ optional, und `canceled: false` mit leerer Liste ist ein
  // Zustand, den die Bibliothek nicht ausschließt. Ohne diese Zeile wäre die Folge
  // kein Fehler, sondern ein `undefined`, das sich zwei Zeilen später als leeres
  // Bild tarnt.
  if (!bild?.base64) return null;

  // Die GRÖSSE wird gerechnet, BEVOR dekodiert wird — `base64Bytes()` fasst den
  // Text nicht an. Bei einem versehentlich gewählten Panorama ist das der
  // Unterschied zwischen einer Meldung und einem Speicher voller Bytes, die gleich
  // wieder weggeworfen werden.
  const bytes = base64Bytes(bild.base64);

  return {
    inhalt: base64ZuBytes(bild.base64),
    // NICHT `bild.mimeType`: Der beschreibt die Datei hinter `uri`, und die ist bei
    // einem iPhone-Foto HEIC — während der Inhalt hier nachweislich JPEG ist.
    typ: BILD_TYP_VOM_GERAET,
    bytes,
    // **Hier ist `uri` richtig** — und nur hier. Zum Anschauen taugt die Datei auch
    // als HEIC (iOS zeigt sie an), zum Hochladen nicht. Der Attrappen-Zweig von
    // `profilbildSetzen()` zeigt damit das ECHTE ausgesuchte Bild, ohne dass ein
    // Byte durch den Arbeitsspeicher wandert; ein `data:`-URI aus demselben base64
    // wäre die naheliegende Zeile und legte das Bild ein zweites Mal ab.
    vorschau: bild.uri,
  };
}
