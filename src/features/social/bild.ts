/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS EIN PROFILBILD IST — UND WER ES SEHEN KANN
 *  Phase 20.6. Die Ausführung von Ians Entscheidung 50 vom 2026-09-12.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Darias Wunsch vom 2026-09-02, und seit Phase 15 wartet alles darauf: `User.photoUrl`
 * gibt es, sechzehn Aufrufstellen reichen es durch, `SsAvatar` zeichnet es. Was fehlte,
 * war der Upload — und der brauchte einen Server.
 *
 * Diese Datei ist die eine Stelle, an der steht, was ein Profilbild darf. Screens lesen
 * `BILD_SICHT` und die Grenzen nie; die Sätze darüber kommen aus `bildFolgen()`.
 * Dieselbe Bauart wie `safety/block.ts` (harte Regel 17), `groups/gruppe.ts` (32),
 * `requests/kollision.ts` (46), `posts/standort.ts` (68), `auth/anmeldung.ts` (69),
 * `data/quelle.ts` (76), `auth/konto.ts` (78) und `data/schreiben.ts` (84).
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  IANS ENTSCHEIDUNG 50: WER EIN BILD SEHEN KANN
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Drei Möglichkeiten lagen vor, und sie unterscheiden sich nicht im Aussehen, sondern
 * in der BAUART — ein Bild wird auf jedem Weg anders ausgeliefert:
 *
 *   A. OFFEN  (`'offen'`) — GEWÄHLT
 *      Der Bucket ist öffentlich. Jedes Bild hat eine dauerhafte Adresse, die ein CDN
 *      ausliefert, und die steht als `photo_url` am Profil. Listen zeichnen sofort,
 *      kein Aufruf je Avatar, kein Ablaufen.
 *      **Der Preis, und er ist echt:** Beim Abruf wird die Datei von Postgres GAR
 *      NICHT mehr angefasst — es greift also keine einzige der 34 Policies. Wer eine
 *      Adresse einmal hat, behält sie: über einen Block hinweg und über das Löschen
 *      hinaus, bis das CDN sie vergisst. Deshalb zwei Gegenmaßnahmen, die beide in
 *      dieser Datei und in `0008_bilder.sql` stehen: Der DATEINAME ist nicht zu raten
 *      (siehe `bildPfad`), und ein gelöschtes Konto nimmt seine Bilder ausdrücklich
 *      mit (`konto_loeschen()`), statt sich auf einen Fremdschlüssel zu verlassen,
 *      **den es nicht gibt** — gemessen am 2026-09-12: `storage.objects.owner` hat
 *      keinen FK auf `auth.users`.
 *
 *   B. ABLAUFEND  (`'signiert'`)
 *      Privater Bucket, jede Anzeige holt eine Adresse, die nach einer Stunde
 *      ungültig wird. Weitergeben nützt nichts, ein Block wirkt sofort.
 *      Verworfen: Jeder Bildschirm mit Avataren bräuchte einen Netzaufruf mehr — die
 *      Chat-Liste zeigt sieben, der Feed bis zu zwölf. Und eine App, die lange offen
 *      liegt, zeigt danach leere Kreise, bis jemand nachlädt. Das ist dieselbe Sorte
 *      Fehler wie „Noch nichts los in deinem Feed" (Entscheidung 43): Es sieht nach
 *      kaputt aus und ist nur abgelaufen.
 *
 *   C. NUR FOLLOWER UND VERABREDETE  (`'nah'`)
 *      Fremde sehen die Initialen, ein Bild sieht nur, wer folgt oder verabredet ist.
 *      Verworfen, obwohl es am besten zu „kein Dating" passt: Ein Profilbild
 *      beantwortet die Frage *mit wem treffe ich mich* — und die stellt man, BEVOR
 *      man zusagt, nicht danach. Genau dort wäre es weg gewesen.
 *
 * ⚠️ **Wer `BILD_SICHT` ändert, ändert nicht eine Einstellung, sondern drei Dateien:**
 * den Bucket in `0008_bilder.sql`, den Rückgabewert von `bildAdresse()` und die
 * Sätze unten. Nicht ohne Rückfrage — es ist Ians Entscheidung.
 */

export const BILD_SICHT: 'offen' | 'signiert' | 'nah' = 'offen';

/** Der Name des Buckets. Steht genauso in `0008_bilder.sql`. */
export const BILD_BUCKET = 'avatars';

/**
 * Wie lange ein Bild im Zwischenlager vor dem Server liegen darf — **Ians
 * Entscheidung 51 vom 2026-09-12, und sie ist die Nachbesserung zu Entscheidung 50.**
 *
 * ── Der Befund, der sie nötig gemacht hat ───────────────────────────────────
 * Hier stand zuerst nichts, also galt der Standard von `supabase-js`:
 * `cacheControl: '3600'`. Am echten Server gemessen, mit `fetch` und ohne Token —
 * also so, wie ein Fremder mit einer weitergeleiteten Adresse ginge:
 *
 *     vor dem Löschen      200   cache-control: public, max-age=3600   cf=MISS
 *     nach dem Löschen     200   …                                     cf=HIT
 *     mit `?v=1` daran     400   (die Datei ist wirklich weg)
 *
 * **Die Datei ist sofort gelöscht; das CDN liefert sie trotzdem weiter.** Damit war
 * der Satz „wenn du es austauschst, ist das alte sofort weg" in `bildFolgen()` eine
 * Unwahrheit — dieselbe Familie wie „Noch nichts los in deinem Feed" bei einem
 * Netzausfall (Entscheidung 43). Ein Satz, der etwas verspricht, was die Technik
 * darunter nicht hält.
 *
 * ── Was an der Wahl NICHT hängt ─────────────────────────────────────────────
 * **Die Aktualität.** Jedes neue Bild bekommt einen neuen, zufälligen Namen
 * (`bildPfad()`), also ändert sich unter einer Adresse nie etwas — ein langer Cache
 * kann deshalb niemals ein veraltetes Bild zeigen. Er verlängert einzig das
 * Zeitfenster, in dem eine WEGGENOMMENE Adresse noch antwortet.
 *
 * Ians Wahl: **fünf Minuten**, gegen 3600 (schnellste Listen, bis zu eine Stunde
 * Nachhall) und gegen 0 (wörtlich sofort weg, dafür zwölf Anfragen bei jedem
 * Öffnen des Feeds). Der Preis ist benannt: Jedes Gerät holt jedes Avatar alle
 * fünf Minuten neu.
 */
export const BILD_CACHE_SEKUNDEN = 300;

/**
 * Wie groß eine Datei sein darf — **dieselbe Zahl steht am Bucket**, und das ist
 * Absicht, kein Versehen: Die App prüft, damit ein Mensch vor dem Warten eine Antwort
 * bekommt; der Server prüft, weil jeder mit dem anon key an der App vorbeikommt. Genau
 * die Anordnung wie `jahrgang` (App + CHECK in 0001).
 *
 * 5 MB: Ein iPhone-Foto liegt roh bei 2–4 MB. Die App verkleinert heute nichts — das
 * käme mit dem Bildwähler in 20.6-b.
 */
export const BILD_MAX_BYTES = 5 * 1024 * 1024;

/**
 * Was hochgeladen werden darf. **Kein `image/*`**, und das ist der Punkt: `image/svg+xml`
 * IST ein Bild und kann Skript enthalten — bei einem öffentlichen Bucket wäre das eine
 * Datei auf unserer Adresse, die im Browser läuft. Eine Whitelist statt eines Musters,
 * dieselbe Technik wie `IconName` (Phase 14), nur gegen einen Angreifer statt gegen
 * einen Vertipper.
 */
export const BILD_TYPEN = ['image/jpeg', 'image/png', 'image/webp'] as const;

/**
 * Darf man am Handy den Ausschnitt wählen? — **Ians Entscheidung 54 (2026-09-13).**
 *
 * Gilt nur für den nativen Zweig: Im Browser gibt es keinen Zuschneide-Dialog, dort
 * öffnet sich das Dateifeld des Betriebssystems.
 *
 * **Verworfen: sofort fertig.** Ein Tipp weniger, und harte Regel 63 spricht dafür.
 * Der Preis wäre aber an einer Stelle angefallen, an der man ihn nicht mehr
 * korrigieren kann: `SsAvatar` beschneidet ein Querformat-Foto MITTIG. Wer auf einem
 * Gruppenfoto links steht, bekommt einen Kreis ohne sich darin — und die einzige
 * Abhilfe wäre, ein anderes Foto zu suchen. Das ist kein „weniger sehen", sondern
 * ein Ergebnis, das man nicht beeinflussen kann.
 *
 * Der Zuschnitt ist auf iOS **immer ein Quadrat** (nachgelesen in den Optionen von
 * `expo-image-picker`: `aspect` und `shape` sind ausdrücklich Android-only) — also
 * genau die Form, die ein runder Avatar braucht. Auf Android käme `aspect: [1, 1]`
 * dazu, sobald es eine Android-Fassung gibt.
 *
 * **Der Nebeneffekt ist der eigentliche Gewinn und war nicht der Grund:** Aus einem
 * 12-Megapixel-Foto wird nur der gewählte Ausschnitt hochgeladen. Das ist weniger
 * Wartezeit für den, der es aussucht, und weniger von der einen Gigabyte, die
 * Supabase gratis gibt.
 */
export const ZUSCHNEIDEN = true;

/**
 * Wie stark das Bild beim Auslesen zusammengedrückt wird (0…1) — **und das ist
 * KEINE Bequemlichkeit, sondern die Zahl, die über die Hürde entscheidet.**
 *
 * Der native Zweig liest das Bild als base64, und `expo-image-picker` kodiert dabei
 * **immer neu als JPEG** mit genau diesem Wert (gemessen in `ios/ImageUtils.swift`,
 * `readJpegBase64From`). Bei `1.0` liegt ein 12-Megapixel-Foto erfahrungsgemäß im
 * Bereich von `BILD_MAX_BYTES` — die App lehnte dann ein gewöhnliches Handyfoto ab,
 * und der Mensch hätte nichts falsch gemacht.
 *
 * `0.8` ist der übliche Wert, ab dem ein Unterschied mit bloßem Auge nicht mehr
 * auffällt. Für einen Avatar, der auch auf einem 3x-Bildschirm keine 300 Punkte
 * breit wird, ist selbst das noch reichlich.
 *
 * ⚠️ **Die Zahl ist begründet, aber am Gerät NICHT nachgemessen** — dafür braucht es
 * ein iPhone mit echten Fotos. Sie gehört in denselben Durchgang wie der Dialog
 * selbst; die Stelle zum Nachsehen ist `bildHuerdeText()`, das die Größe meldet,
 * bevor irgendetwas hochgeladen wird.
 */
export const BILD_QUALITAET = 0.8;

/**
 * Als was ein am Gerät ausgesuchtes Bild ANKOMMT — **immer JPEG, und das ist ein
 * Fund, keine Festlegung.**
 *
 * `expo-image-picker` gibt zwei Dinge zurück, die man leicht verwechselt:
 * - `uri` zeigt auf die DATEI, und die bleibt bei einem iPhone-Foto **HEIC**
 *   (`ios/ImageUtils.swift:147` — `case UTType.heic.identifier: return (rawData, ".heic")`).
 * - `base64` ist laut derselben Datei (Zeile 206) *„always JPEG regardless of the
 *   source file's original format (e.g. HEIC, PNG)"*.
 *
 * `image/heic` steht nicht in `BILD_TYPEN`. Wer also `asset.mimeType` als Typ nimmt,
 * weist **jedes gewöhnliche iPhone-Foto** ab — nicht den Rand, sondern den Normalfall,
 * dieselbe Familie wie „wer nie ein Profilbild hatte" in 20.6-c.
 *
 * Deshalb steht der Typ hier als Konstante und wird nicht vom Bild übernommen: Der
 * Inhalt IST JPEG, also muss der `content-type` am Bucket JPEG sagen. Liefe beides
 * auseinander, läge im Bucket eine JPEG-Datei mit der Aufschrift „HEIC" — und kein
 * Browser zeigt sie an.
 */
export const BILD_TYP_VOM_GERAET = 'image/jpeg';

const ENDUNGEN: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/** Ist dieser Typ erlaubt? Screens fragen das nie selbst. */
export function istErlaubterTyp(typ: string): boolean {
  return (BILD_TYPEN as readonly string[]).includes(typ);
}

/**
 * Zufall, den man nicht vorhersagen kann — **und lieber ein Fehler als ein schwacher.**
 *
 * `Math.random()` wäre hier die naheliegende Zeile und die falsche: Bei Entscheidung A
 * ist der Dateiname das EINZIGE, was zwischen einem Bild und einem Fremden steht, und
 * `Math.random()` ist aus wenigen Beobachtungen vorhersagbar. Ein stiller Rückfall
 * darauf wäre genau die Sorte Fehler, die dieses Projekt sammelt — er sähe nie nach
 * einem aus.
 *
 * Also wird geworfen, wenn die Umgebung keinen sicheren Zufall hat. Dann merkt man es
 * beim ersten Upload; ein Rückfall merkt man nie.
 */
function zufallsName(): string {
  const c: Crypto | undefined = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID().replace(/-/g, '');
  if (c?.getRandomValues) {
    const b = c.getRandomValues(new Uint8Array(16));
    return Array.from(b, (n) => n.toString(16).padStart(2, '0')).join('');
  }
  throw new Error(
    'Kein sicherer Zufall verfügbar — ein Profilbild bekäme einen erratbaren Namen.',
  );
}

/**
 * Wo ein Bild liegt: `<meine uuid>/<zufall>.<endung>`.
 *
 * **Zwei Teile, zwei verschiedene Aufgaben — und nur der zweite ist geheim.**
 *
 *   • Der ORDNER ist die eigene UUID, und er ist bekannt. Er steht dort, weil die
 *     Policies in `0008_bilder.sql` daran hängen (`storage.foldername(name))[1] =
 *     auth.uid()::text`): So kann niemand in einen fremden Ordner schreiben, ohne dass
 *     eine einzige Zeile Anwendungscode das prüfen müsste.
 *   • Der DATEINAME ist Zufall, und er ist die ganze Absicherung aus Entscheidung A.
 *     Er ist NICHT aus der UUID abgeleitet — sonst wäre er aus dem Ordner errechenbar
 *     und die Absicherung hieße nur so.
 *
 * **Warum man den Ordner trotzdem nicht auflisten kann:** `select` auf
 * `storage.objects` ist in 0008 auf die eigenen Zeilen begrenzt. Öffentlich ist der
 * ABRUF einer bekannten Adresse, nicht das Nachsehen, was drin liegt. Die Adresse
 * bekommt die App aus `profiles.photo_url` — also aus einer Tabelle mit Policy.
 *
 * **Und jedes neue Bild bekommt einen neuen Namen** (kein festes `avatar.jpg`). Das
 * kostet nichts und erledigt zwei Dinge auf einmal: Die alte Adresse ist tot, sobald
 * die alte Datei weg ist — und kein CDN zeigt noch tagelang das vorige Bild, weil es
 * unter derselben Adresse lag.
 */
export function bildPfad(ichId: string, typ: string): string {
  const endung = ENDUNGEN[typ];
  if (!endung) throw new Error(`Kein Bildtyp für ${typ} — vorher \`istErlaubterTyp\` fragen.`);
  return `${ichId}/${zufallsName()}.${endung}`;
}

/**
 * Was einem Menschen über sein Bild gesagt wird. **Die Sätze stehen hier und nicht im
 * Screen** — sonst verspricht irgendwann einer etwas, das `BILD_SICHT` nicht mehr tut
 * (harte Regel 17, und der Fall aus Phase 20.1: Der Lösch-Screen versprach seit Phase 7
 * das Gegenteil der Regel).
 */
export function bildFolgen(): string[] {
  switch (BILD_SICHT) {
    case 'offen':
      return [
        'Dein Bild sehen alle, die SimplySocial benutzen.',
        // ❌ Hier stand „Wenn du es austauschst, ist das alte sofort weg." Das war
        // falsch und am echten Server gemessen: Die Datei ist sofort weg, das
        // Zwischenlager davor liefert sie aber noch eine Weile aus. Der Satz sagt
        // jetzt die Zahl, statt eine Gewissheit zu behaupten — und die Zahl kommt
        // aus der Konstante, nicht aus dem Text (harte Regel 17).
        `Wenn du es austauschst, ist das alte innerhalb von ${Math.round(BILD_CACHE_SEKUNDEN / 60)} Minuten überall weg.`,
        'Löschst du dein Konto, geht dein Bild mit.',
      ];
    case 'signiert':
      return [
        'Dein Bild sehen alle, die SimplySocial benutzen.',
        'Weitergeleitete Links laufen nach einer Stunde ab.',
        'Löschst du dein Konto, geht dein Bild mit.',
      ];
    case 'nah':
      return [
        'Dein Bild sehen nur Leute, die dir folgen oder mit dir verabredet sind.',
        'Alle anderen sehen deine Anfangsbuchstaben.',
        'Löschst du dein Konto, geht dein Bild mit.',
      ];
  }
}

/**
 * Warum eine Datei nicht geht — in Ians Sprache, nicht in der des Servers.
 *
 * Gibt `null` zurück, wenn nichts dagegen spricht. **Die Reihenfolge ist nicht egal:**
 * Ein 20-MB-SVG ist beides, und „das Format geht nicht" ist die Antwort, die dem
 * Menschen weiterhilft — „zu groß" führt ihn dazu, es kleiner zu machen und noch einmal
 * zu scheitern.
 */
export function bildHuerdeText(typ: string, bytes: number): string | null {
  if (!istErlaubterTyp(typ)) return 'Das geht nur als JPG, PNG oder WebP.';
  if (bytes > BILD_MAX_BYTES) {
    return `Das Bild ist zu groß — ${Math.round(BILD_MAX_BYTES / 1024 / 1024)} MB sind das Höchste.`;
  }
  return null;
}
