import { BILD_TYPEN } from '@/features/social/bild';
import type { Bilddatei } from '@/lib/bild-waehlen-typen';

/**
 * Ein Bild vom Gerät holen — **der Web-Zweig.**
 *
 * ── Warum eine Plattform-Endung und keine `Platform.OS`-Weiche ──────────────
 * Dieselbe Begründung wie bei `SsKarte` (harte Regel 52): Hier stehen nicht zwei
 * Wege zum selben Ziel, sondern zwei verschiedene Werkzeuge. Der Web-Zweig greift
 * auf `document`, das es auf Native nicht gibt; der native Zweig nimmt
 * `expo-image-picker`, und das ist ein Baustein, der auf Web nichts zu suchen hat.
 * Eine Weiche in EINER Datei zöge beides überallhin.
 *
 * ── Warum `document.createElement` und kein `<input>` im Baum ───────────────
 * Ein Datei-Feld kann man nicht aus dem Code heraus öffnen, ohne dass ein Mensch
 * es angeklickt hat — der Browser verlangt eine echte Geste. Ein verstecktes
 * `<input>` im JSX-Baum wäre trotzdem ein Element mehr in jedem Render von
 * `/einstellungen`, und `react-native-web` müsste es durchreichen. Der Aufruf hier
 * passiert INNERHALB des Klick-Handlers, also zählt die Geste.
 *
 * Gibt `null` zurück, wenn jemand den Dialog abbricht — und das ist **kein
 * Fehler**: Es ist die häufigste Antwort auf „Bild aussuchen".
 */
/** Kann diese Plattform überhaupt ein Bild aussuchen? Siehe den nativen Zweig. */
export const BILDWAHL_LAEUFT = true;

export async function bildWaehlen(): Promise<Bilddatei | null> {
  return new Promise((fertig) => {
    const feld = document.createElement('input');
    feld.type = 'file';
    // Die Liste kommt aus der Regel-Datei und ist NICHT `image/*`: Ein Vorschlag,
    // der SVG anbietet, endet in einer Absage vom Bucket — und der Mensch hätte
    // nichts falsch gemacht.
    feld.accept = BILD_TYPEN.join(',');

    feld.onchange = () => {
      const datei = feld.files?.[0];
      // `bytes` steht ausdrücklich im Ergebnis und wird nicht später aus dem Inhalt
      // gelesen — die Begründung steht an `Bilddatei`: Auf dem Gerät ist der Inhalt
      // ein `Uint8Array` und hat gar kein `.size`, und `undefined > BILD_MAX_BYTES`
      // wäre `false`. Hier IST es ein `Blob`; die Zeile sieht deshalb überflüssig
      // aus und ist die Hälfte, die verhindert, dass die Prüfung drüben still
      // ausfällt.
      fertig(
        datei
          ? {
              inhalt: datei,
              typ: datei.type,
              bytes: datei.size,
              // Im Browser sind Inhalt und Vorschau dieselbe Sache — auf dem Gerät
              // nicht (siehe `Bilddatei`). Die Adresse wird beim Hochladen an den
              // echten Server nicht gebraucht und kostet dort nichts: Ein Object-URL
              // ist ein Eintrag in einer Tabelle, kein Umkopieren der Bytes.
              vorschau: URL.createObjectURL(datei),
            }
          : null,
      );
    };
    // Ein abgebrochener Dialog feuert in den meisten Browsern `cancel`; wo nicht,
    // bleibt das Versprechen offen und der Knopf einfach unbenutzt. Das ist besser
    // als ein erfundener Fehler.
    feld.oncancel = () => fertig(null);
    feld.click();
  });
}
