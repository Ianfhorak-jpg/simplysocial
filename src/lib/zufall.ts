/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  SICHERER ZUFALL — die Web-Fassung
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ── Warum es diese Datei gibt, und zwar seit einem Fehler am GERÄT ───────────
 * Am 2026-09-13 hat Ian am iPhone ein Foto ausgesucht, zugeschnitten — und danach
 * war der Bildschirm unverändert. Kein Bild, keine Meldung, keine Fehlerleiste;
 * nachgemessen war `profiles.photo_url` leer UND der Bucket leer.
 *
 * Die Ursache lag in `zufallsName()` in `features/social/bild.ts`. Sie fragte
 * `globalThis.crypto` und warf, wenn es keines gibt — richtig gedacht (lieber ein
 * Fehler als ein erratbarer Dateiname, harte Regel 88), **nur gibt es auf React
 * Native keines.** Gemessen statt vermutet:
 *
 *   · `react-native/Libraries/Core/InitializeCore.js` richtet kein `crypto` ein.
 *   · `expo-crypto` setzt ein globales NUR auf Web (`ExpoCrypto.web.js`, Zeile 4).
 *   · Im gebauten `main.jsbundle` kommen `getRandomValues` und `randomUUID` je
 *     **genau einmal** vor — das waren diese beiden Zeilen. Niemand definiert sie.
 *
 * **Warum kein Prüfstand das finden konnte:** `pruef-bilder` läuft in Node, und
 * Node hat `globalThis.crypto`; der Browser auch. Die Attrappen-Falle in ihrer
 * schärfsten Form — die Prüfumgebung hatte etwas, das das Gerät nicht hat. Der
 * Wächter dagegen steht jetzt in `90_bildwahl.mjs` und nimmt `crypto` für die
 * Dauer einer Messung WEG.
 *
 * ── Und warum die Zufallsquelle nicht in `bild.ts` bleiben durfte ────────────
 * `bild.ts` hat KEINE Laufzeit-Importe, und das trägt zwei Prüfstände (`80_bilder`
 * und `90_bildwahl` laden sie in blankem Node). Ein `import * as Crypto from
 * 'expo-crypto'` dort hätte beide erledigt. Deshalb eine eigene Datei mit
 * Plattform-Endung — dieselbe Bauart wie `bild-waehlen.ts`/`.native.ts` und
 * `anmelde-anbieter.ts`/`.native.ts` (harte Regel 94).
 */

/** 16 Byte Zufall als 32 Hex-Zeichen. Wirft lieber, als schwachen Zufall zu liefern. */
export function zufallsHex(): string {
  const c: Crypto | undefined = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID().replace(/-/g, '');
  if (c?.getRandomValues) {
    const b = c.getRandomValues(new Uint8Array(16));
    return Array.from(b, (n) => n.toString(16).padStart(2, '0')).join('');
  }
  // Im Browser und in Node ist das unerreichbar (beide haben `crypto`). Die Zeile
  // bleibt trotzdem: Ein `Math.random()`-Rückfall wäre bei einem OFFENEN Bucket
  // die ganze Absicherung eines Profilbilds — und zwar eine, die niemand bemerkt.
  throw new Error('Kein sicherer Zufall verfügbar — ein Profilbild bekäme einen erratbaren Namen.');
}
