/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS EIN ANBIETER ZURÜCKGIBT — die gemeinsame Naht (Phase 20.3-b2)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Dieselbe Bauart wie `bild-waehlen-typen.ts` (20.6-b) und
 * `components/ui/karte-typen.ts` (19d): Zwei Plattform-Zweige brauchen EINEN Typ,
 * und der kann in keinem von beiden stehen — sonst importierte der Web-Zweig den
 * Geräte-Zweig, um seinen eigenen Rückgabewert zu benennen.
 */

/**
 * Ein fertiger Ausweis. Beide Anbieter liefern dasselbe, und das ist der Grund,
 * warum es in `konten.ts` nur EINE Funktion gibt und nicht zwei.
 */
export interface Ausweis {
  /**
   * Der OIDC-Ausweis. Supabase prüft daran Unterschrift und Empfänger — die App
   * liest ihn **nie selbst**. Ein JWT im Browser aufzumachen und seinem Inhalt zu
   * glauben, wäre dasselbe wie einem Realtime-`payload` zu glauben (harte
   * Regel 75): Die Prüfung gehört auf die Seite, die den Schlüssel hat.
   */
  idToken: string;

  /**
   * Der volle Name — **nur bei Apple, und dort nur EINMAL im Leben.**
   *
   * `null` heißt „diesmal nicht dabei" und ist der Normalfall: bei Google immer
   * (der Name steckt im Ausweis und wird von Supabase ausgelesen), bei Apple ab
   * der zweiten Anmeldung. Ein `''` darf hier nie stehen — leer und fehlend sind
   * zwei Lagen, und der Bildschirm fürs erste Konto würde aus dem einen ein
   * vorausgefülltes leeres Feld machen und aus dem anderen ein unberührtes.
   */
  name: string | null;
}
