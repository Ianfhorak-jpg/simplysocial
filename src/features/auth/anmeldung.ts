/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WER BIN ICH — UND WORAN HÄNGT DAS
 *  Phase 20.3. Die App-Seite von Ians 27. Entscheidung vom 2026-09-06.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Bis heute war „wer bin ich" eine KONSTANTE: `CURRENT_USER_ID = 'u_ian'` stand in
 * `data/mock.ts`, und 110 Stellen haben sie direkt gelesen. Das war richtig, solange
 * es keinen Login gab — und es ist genau die Sorte Wahrheit, die beim Umstellen
 * lautlos falsch wird. Deshalb ist die Konstante **ersatzlos gelöscht** und nicht auf
 * `string | null` gesetzt worden:
 *
 *     Ein `string | null` wäre die `Post.district`-Falle zum fünften Mal. In JSX
 *     rendert `null` klaglos als Nichts, `find(u => u.id === null)` ist gültiger
 *     Code, und `tsc` hätte zu allen 110 Stellen geschwiegen. Verschwindet der
 *     Export dagegen ganz, schreibt der Compiler die Arbeitsliste — dieselbe
 *     Technik wie `IconName` in Phase 14.
 *
 * Diese Datei sagt, was an ihre Stelle tritt und was daran Ians Entscheidung ist.
 * Screens lesen die Konstanten hier nie; sie sehen nur das Ergebnis, und die Sätze
 * über das Anmelden kommen aus `anmeldeFolgen()`. Dieselbe Bauart wie
 * `safety/block.ts` (harte Regel 17), `groups/gruppe.ts` (32),
 * `requests/kollision.ts` (46) und `posts/standort.ts` (68).
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DREI WEGE HINEIN — Ians Entscheidung 27, gegen meine Empfehlung
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   A. NUR E-MAIL-CODE  (meine Empfehlung, verworfen)
 *      Ein Weg statt drei: einer zu bauen, einer zu testen, einer zum Kaputtgehen.
 *      Und Richtlinie 4.8 von Apple wird gar nicht erst ausgelöst.
 *      Haken — und er ist der Grund, warum A verloren hat: Eine abgetippte
 *      E-Mail-Adresse plus ein Wechsel in die Mail-App plus ein abgetippter Code
 *      sind drei Gelegenheiten aufzuhören, und sie liegen ALLE vor dem ersten
 *      Blick in den Feed. Eine App mit leerem Feed verliert genau dort.
 *
 *   B. E-MAIL-CODE UND GOOGLE UND APPLE  ← **Ians Wahl**
 *      Ein Tipp statt einer Tipperei. Sein Argument ist das bessere Produkt, meins
 *      der geringere Aufwand.
 *
 * ── Die Folge, die er beim Entscheiden kannte ─────────────────────────────────
 * Sobald Google dabei ist, verlangt Apple nach **Richtlinie 4.8** zusätzlich einen
 * Anmeldeweg, der nur Name und E-Mail nimmt und das Verstecken der Adresse erlaubt.
 * „Anmelden mit Apple" erfüllt das und ist damit **Pflicht, nicht Zierde**. Weil er
 * Apple ohnehin gewählt hat, entsteht daraus keine Extraarbeit — aber eine
 * REIHENFOLGE, und die ist in `ANMELDE_WEGE` ausgeschrieben:
 *
 *     **Apple muss fertig sein, BEVOR Google live geht.** Umgekehrt ist es eine
 *     Ablehnung im Review, und zwar erst am Ende von Phase 21.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS BEIM ANMELDEN GEFRAGT WIRD — und was ausdrücklich nicht
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Der Heimatbezirk gehört ins Anmelden. Das ist Ians Entscheidung 64 vom
 * 2026-09-08, wörtlich: *„man gibt am Anfang seinen Bezirk an."* Seit Entscheidung
 * 63 bestimmt er die REIHENFOLGE des Feeds (`posts/sort.ts`), also ist er keine
 * Zierangabe — ohne ihn sortiert der Feed ab einem Bezirk, den niemand gewählt hat.
 * Der Schalter in `/einstellungen` bleibt daneben bestehen und wird nicht ersetzt.
 *
 * **Nicht gefragt wird der Standort.** `STANDORT_FRAGE = 'einstellung'`
 * (Entscheidung 70) sagt das ausdrücklich, und der Grund steht dort: iOS zeigt den
 * Systemdialog **ein einziges Mal**. Wer ihn im Anmelden wegdrückt, drückt ihn für
 * immer weg. Wer hier eine Standortfrage einbaut, hebt Entscheidung 70 auf.
 */

/** Die drei Wege hinein. Reihenfolge = Reihenfolge auf dem Bildschirm. */
export type AnmeldeWeg = 'apple' | 'google' | 'email-code';

/**
 * Ians Entscheidung 27. Nicht ohne Rückfrage ändern.
 *
 * Apple steht **vorn**, und das ist keine Geschmacksfrage: Richtlinie 4.8 verlangt
 * ihn, sobald Google dasteht (siehe Kopf). Wer Google vorzieht oder Apple streicht,
 * ändert damit still die Reihenfolge, in der die Wege live gehen dürfen.
 */
export const ANMELDE_WEGE: readonly AnmeldeWeg[] = ['apple', 'google', 'email-code'];

/**
 * Woher die Sitzung kommt — **der eine Schalter, den Phase 20.3-b umlegt.**
 *
 * `'attrappe'` heißt: kein Netz, kein Konto, kein Token. Die Sitzung wird beim Start
 * auf den Seed-Nutzer aus `data/mock.ts` gesetzt, damit der Prototyp auf der
 * öffentlichen Adresse genau das bleibt, was er war. Alles ÜBER dieser Zeile —
 * `useCurrentUserId()`, der ausgeloggte Zustand, die 110 umgestellten Stellen — ist
 * schon das Echte und ändert sich beim Umlegen um kein Zeichen.
 *
 * Das ist dieselbe Trennung, die bei 20.1/20.2 getragen hat: *halten die Regeln?*
 * und *ist das Projekt eingerichtet?* sind zwei Fragen, und nur die zweite braucht
 * Ians Konten.
 */
export const ANMELDE_QUELLE: 'attrappe' | 'supabase' = 'attrappe';

/**
 * Wer gerade angemeldet ist — als diskriminiertes Union, nicht als `string | null`.
 *
 * Das ist die fünfte Runde derselben Frage nach `Post.district`, `ChatThread.postId`,
 * `Visibility` und `PostAlter`, und die Antwort ist wieder dieselbe: **Braucht eine
 * Stufe zusätzliche Daten, ist es ein Union.** Der Zustand „angemeldet, aber ohne
 * ID" ist damit undarstellbar; bei `ichId: string | null` wäre er tippbar gewesen
 * und niemand hätte es gemerkt.
 */
export type Sitzung =
  /**
   * Noch nicht nachgesehen — der ANFANGSZUSTAND mit `ANMELDE_QUELLE = 'supabase'`.
   * Phase 20.3-b1.
   *
   * Er dauert einen Augenblick und ist trotzdem ein eigener Zustand, weil er sonst
   * mit `'aus'` zusammenfiele — und das ist etwas anderes: „wir wissen es noch
   * nicht" gegen „niemand ist angemeldet". Wer beides gleichsetzt, zeigt jedem, der
   * die App mit gespeicherter Sitzung öffnet, für einen Lidschlag den
   * Anmelde-Bildschirm. **Dieselbe Unterscheidung wie `laden.zustand === 'laeuft'`
   * gegen neun leere Listen** (Ians Entscheidung 43): „ist nichts" und „kommt noch"
   * dürfen nicht gleich aussehen.
   */
  | { zustand: 'unbekannt' }
  /** Niemand angemeldet. Ein Screen, der ein Ich braucht, wird gar nicht gezeichnet. */
  | { zustand: 'aus' }
  /**
   * Bei Supabase angemeldet — und noch OHNE Profil. Phase 20.3-b1.
   *
   * Der Zustand entsteht genau einmal je Mensch: Nach dem ersten richtigen Code hat
   * jemand eine UUID und eine E-Mail, aber `profiles` verlangt vier Felder `not null`
   * (siehe `auth/konto.ts`). Er trägt `authId` und NICHT `ichId`, und das ist kein
   * Namensunterschied: `ichId` ist eine `User.id`, also der Verweis auf eine Zeile,
   * die es noch nicht gibt. Hieße das Feld an beiden Stellen gleich, wäre
   * `useCurrentUserId()` für diesen Zustand ohne Weiteres gültiger Code — und
   * fünfzig Screens suchten einen Menschen, den niemand angelegt hat.
   */
  | { zustand: 'neu'; authId: string; email: string }
  /** Angemeldet. `ichId` ist eine `User.id`. */
  | { zustand: 'an'; ichId: string };

/**
 * Was der Torwächter in `app/_layout.tsx` zeichnet — **und warum das hier steht.**
 *
 * Ein drittes Glied an `Sitzung` ist eine LOCKERUNG, und die Phase-16-Lehre sagt
 * dazu das Unangenehme: `tsc` meldet null Stellen. Der Torwächter fragte bis
 * 20.3-a `zustand === 'an'`, und das bleibt gültiger Code — `'neu'` wäre still in
 * den `else`-Zweig gefallen, und jemand mit gültigem Token säße wieder vor dem
 * Anmelde-Bildschirm und bekäme einen zweiten Code geschickt.
 *
 * **Also entsteht die Enge eine Ebene höher**, genau wie `ChatEintrag.post` in
 * Phase 16: Diese Funktion hat einen erschöpfenden `switch` mit `never`-Abschluss.
 * Wer `Sitzung` um ein viertes Glied erweitert, bekommt hier einen Typfehler statt
 * eines stillen Bildschirms.
 */
export type TorwaechterZeigt = 'wartet' | 'anmelden' | 'erstes-konto' | 'app';

export function torwaechterZeigt(sitzung: Sitzung): TorwaechterZeigt {
  switch (sitzung.zustand) {
    case 'unbekannt':
      return 'wartet';
    case 'aus':
      return 'anmelden';
    case 'neu':
      return 'erstes-konto';
    case 'an':
      return 'app';
    default: {
      const nie: never = sitzung;
      return nie;
    }
  }
}

/**
 * Die Sätze, die die Oberfläche über einen Anmeldeweg sagt — an EINER Stelle.
 *
 * `bereit` sagt, ob der Weg WIRKLICH funktioniert. Er steht hier und nicht im Screen,
 * weil er sich in Phase 20.3-b je Weg einzeln ändert (Apple zuerst, dann Google) —
 * und weil ein Knopf, der nichts tut, ohne diese Auskunft aussieht wie ein Fehler.
 * Dasselbe Muster wie `schreibHuerdeText()` in `chat/direkt.ts`: Steht der Knopf
 * nicht da, steht ein Satz da.
 */
export function anmeldeFolgen(weg: AnmeldeWeg): {
  titel: string;
  hinweis: string;
  bereit: boolean;
} {
  // `bereit` ist seit 20.3-b1 JE WEG verschieden, und genau das hatte der Kopf
  // dieser Funktion vorhergesagt. Am Server nachgemessen (`/auth/v1/settings`):
  // `email: true`, `apple: false`, `google: false`. Der E-Mail-Weg braucht nur
  // Supabase und steht; die anderen beiden brauchen zusätzlich einen
  // Sign-in-Schlüssel von Apple und ein OAuth-Konto bei Google.
  const quelleSteht = ANMELDE_QUELLE !== 'attrappe';
  const nochNicht = quelleSteht
    ? 'Kommt als Nächstes — heute geht es über die E-Mail.'
    : 'Kommt mit dem Konto — im Prototyp noch ohne Funktion.';
  switch (weg) {
    case 'apple':
      return { titel: 'Weiter mit Apple', hinweis: nochNicht, bereit: false };
    case 'google':
      return { titel: 'Weiter mit Google', hinweis: nochNicht, bereit: false };
    case 'email-code':
    default:
      return {
        titel: 'Mit E-Mail-Code',
        hinweis: quelleSteht ? 'Wir schicken dir eine Zahl, kein Passwort.' : nochNicht,
        bereit: quelleSteht,
      };
  }
}

/**
 * Wie viele Ziffern der Code aus der Mail hat — **eine Spanne, keine Zahl.**
 *
 * ── Warum das hier steht und nicht als `maxLength={6}` im Screen ─────────────
 * Weil die Zahl gar nicht uns gehört: Supabase lässt sie im Dashboard von **6 bis
 * 10** einstellen (Authentication → Sign In / Providers → Email → „Email OTP
 * Length"). Eine feste 6 im Eingabefeld ist damit eine ANNAHME über eine fremde
 * Einstellung — und am 2026-09-12 war sie falsch.
 *
 * ── Wie sie gescheitert ist, ist der eigentliche Grund für diesen Absatz ─────
 * `maxLength` schneidet **stillschweigend** ab. Ian hat den richtigen Code
 * eingetippt, das Feld hat die letzten Ziffern verworfen, und die App hat ihm
 * gesagt, der Code stimme nicht. **Sie hat ihn für ihren eigenen Fehler
 * beschuldigt** — dieselbe Familie wie „Noch nichts los in deinem Feed" bei einem
 * Netzausfall (Ians Entscheidung 43): ein Satz, der lügt, weil niemand geprüft
 * hat, ob seine Voraussetzung gilt.
 *
 * Deshalb steht `MAX` auf der OBERGRENZE dessen, was Supabase überhaupt schicken
 * kann, und nicht auf dem, was wir erwarten: **Ein zu großzügiges Feld kostet
 * nichts, ein zu kleines verwirft Eingaben.** Geprüft wird die Länge nicht hier,
 * sondern von GoTrue — das ist die einzige Stelle, die den Code wirklich kennt.
 */
export const CODE_MIN = 6;
export const CODE_MAX = 10;

/**
 * Was dasteht, wenn der Code nicht durchgeht — Phase 20.3-b1.
 *
 * ── Warum eine Funktion und nicht ein Satz ───────────────────────────────────
 * Dieselbe Begründung wie bei `ladeFehlerFolgen()` (Ians Entscheidung 43): Ein
 * abgelaufener Code, ein vertippter Code und „du hast es zu oft probiert" sehen für
 * `supabase-js` gleich aus — es gibt `{ error }` zurück, sonst nichts — und führen
 * für den Menschen davor zu **drei verschiedenen nächsten Handlungen**: neu
 * anfordern, genauer hinsehen, warten. Ein einziger Satz („Das hat nicht geklappt")
 * schickt zwei von drei Leuten in die falsche Richtung.
 *
 * **Und genau das ist harte Regel 57 für den Menschen statt für den Prüfstand:**
 * „ist fehlgeschlagen" ist zu wenig, es braucht den Code.
 *
 * Der `code` selbst kommt NIE auf den Bildschirm (die Lehre vom 2026-09-03) — er
 * steht in der Konsole, weil `KontoFehler` ihn trägt.
 */
export function codeFehlerText(code: string): string {
  switch (code) {
    case 'otp_expired':
      return 'Der Code stimmt nicht oder ist abgelaufen. Fordere einen neuen an.';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      // Die Freigrenze von Supabase liegt bei wenigen Mails je Stunde. Das ist kein
      // Fehler, sondern eine Grenze — und sie gehört als solche dagestanden, sonst
      // tippt jemand zehnmal auf einen Knopf, der nichts mehr tun darf.
      return 'Gerade ging es zu schnell hintereinander. Probier es in ein paar Minuten.';
    case 'email_address_invalid':
    case 'validation_failed':
      return 'Die Adresse sieht nicht richtig aus.';
    case 'signup_disabled':
      return 'Neue Konten sind gerade zu.';
    default:
      return 'Das hat gerade nicht geklappt. Prüf dein Netz und probier es noch einmal.';
  }
}
