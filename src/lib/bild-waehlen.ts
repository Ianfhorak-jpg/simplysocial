import { BILD_TYPEN } from '@/features/social/bild';

/**
 * Ein Bild vom Gerät holen — **der Web-Zweig.**
 *
 * ── Warum eine Plattform-Endung und keine `Platform.OS`-Weiche ──────────────
 * Dieselbe Begründung wie bei `SsKarte` (harte Regel 52): Hier stehen nicht zwei
 * Wege zum selben Ziel, sondern zwei verschiedene Werkzeuge. Der Web-Zweig greift
 * auf `document`, das es auf Native nicht gibt; der native Zweig bräuchte
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

export async function bildWaehlen(): Promise<{ datei: Blob; typ: string } | null> {
  return new Promise((fertig) => {
    const feld = document.createElement('input');
    feld.type = 'file';
    // Die Liste kommt aus der Regel-Datei und ist NICHT `image/*`: Ein Vorschlag,
    // der SVG anbietet, endet in einer Absage vom Bucket — und der Mensch hätte
    // nichts falsch gemacht.
    feld.accept = BILD_TYPEN.join(',');

    feld.onchange = () => {
      const datei = feld.files?.[0];
      fertig(datei ? { datei, typ: datei.type } : null);
    };
    // Ein abgebrochener Dialog feuert in den meisten Browsern `cancel`; wo nicht,
    // bleibt das Versprechen offen und der Knopf einfach unbenutzt. Das ist besser
    // als ein erfundener Fehler.
    feld.oncancel = () => fertig(null);
    feld.click();
  });
}
