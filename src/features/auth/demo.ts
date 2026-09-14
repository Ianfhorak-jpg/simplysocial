/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DER DEMO-ZUGANG — Phase 21.5 Punkt 1
 *  Was ein Demo-Zugang ist und wer ihn benutzen darf, steht HIER und nirgends
 *  sonst. Dieselbe Bauart wie `safety/block.ts` (harte Regel 17),
 *  `groups/gruppe.ts` (32), `requests/kollision.ts` (46), `posts/standort.ts` (68)
 *  und `features/safety/meldung.ts` (100).
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ── Das Problem, und es ist der am häufigsten vergessene Ablehnungsgrund ─────
 * Die App liegt hinter einer Anmeldung. Ein Apple-Reviewer, der nicht hineinkommt,
 * lehnt ab — nicht aus Bosheit, sondern weil er die App nicht prüfen KANN. Alle
 * drei Wege aus `ANMELDE_WEGE` scheitern bei ihm an etwas, das nicht in unserer
 * Hand liegt:
 *
 *   · **E-Mail-Code** — er bräuchte Zugriff auf ein fremdes Postfach.
 *   · **Apple** — ginge, aber er landet als NEUER Mensch im Erstes-Konto-Bildschirm
 *     und sieht danach, was jeder Neue in einem leeren Wien sieht.
 *   · **Google** — dasselbe.
 *
 * ── Vier Möglichkeiten, und Ian hat am 2026-09-14 die erste gewählt ──────────
 *
 *   A. **Ein Konto mit PASSWORT, und ein Feld, das nur für dieses eine Konto
 *      erscheint.** ← **Ians Wahl**
 *      Der Reviewer tippt zwei Felder und ist drin. Kein Postfach, kein Wechsel
 *      in eine andere App.
 *
 *   B. Ein Trigger auf `auth.*`, der für die Demo-Adresse den Code auf `123456`
 *      festnagelt. Kein App-Code — aber ein Eingriff in Supabases EIGENES Schema.
 *      Der im Netz kursierende Weg zielt auf `auth.users.recovery_token`; **unsere
 *      GoTrue-Fassung ist `v2.196.0` und legt Codes in `auth.one_time_tokens` ab**
 *      (gemessen an `/auth/v1/health`, 2026-09-14). Der Mechanismus wäre also
 *      erst zu erraten — *„ein Mechanismus, den man im fremden Quelltext FINDET,
 *      ist eine Hypothese"* (FALLEN.md) — und er kann bei jedem Supabase-Update
 *      still brechen. Ausgerechnet während des Reviews.
 *
 *   C. Ein echtes Postfach, dessen Zugangsdaten bei Apple stehen. Kostet keinen
 *      Code und bringt genau die drei Abbruchstellen zurück, wegen denen
 *      Entscheidung 27 gegen „nur E-Mail" ausgefallen ist.
 *
 *   D. Gar keiner — „der Reviewer nimmt halt Apple". Kostet nichts und riskiert
 *      einen Review-Zyklus.
 *
 * ── Warum das kein VERSTECKTES Feature im Sinn von Apple 2.3.1 ist ───────────
 * Apple verbietet Funktionen, die dem Reviewer verborgen bleiben. Dieses Feld ist
 * das Gegenteil: Es existiert **für** ihn, und es steht mitsamt Adresse und
 * Passwort im Feld „App Review Information" (`_FUER_IAN/DEMO_ZUGANG.md`). Was es
 * vor den ÜBRIGEN Menschen verbirgt, ist kein Feature, sondern ein Konto — und ein
 * viertes Anmeldefeld, das 99,99 % der Leute nie brauchen, wäre nach harter
 * Regel 63 sowieso falsch.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WARUM `.invalid` UND NICHT `simplysocial.at` — das ist ein LOCH, kein Geschmack
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Der erste Griff war `demo@simplysocial.at`. Er ist falsch, und der Grund steht
 * in `OFFENE_SACHEN.md` 5b: **Die Domain gehört uns noch nicht.** Wem sie gehört,
 * dem gehört ihr Postfach — und wer das Postfach hat, tippt die Demo-Adresse in
 * den GANZ NORMALEN E-Mail-Weg, bekommt den Code zugestellt und ist als
 * Demo-Konto angemeldet. Das Passwort schützt davor nichts: Es ist ein ZWEITER
 * Weg zum selben Konto, kein Riegel vor dem ersten.
 *
 * `.invalid` ist nach **RFC 2606** reserviert und kann von niemandem je
 * registriert werden. Damit ist der E-Mail-Weg für dieses eine Konto nicht
 * „unwahrscheinlich", sondern **strukturell tot** — es gibt kein Postfach, das
 * den Code empfangen könnte, und es kann nie eines geben. Der Passwort-Weg ist
 * der einzige Weg hinein, und zwar beweisbar statt hoffentlich.
 *
 * Der Preis ist benannt und klein: Die Adresse sieht für einen Menschen nach
 * einem Tippfehler aus. Deshalb steht in `_FUER_IAN/DEMO_ZUGANG.md` der Satz
 * dazu, den Ian mit ins Review-Feld kopiert.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS HIER ABSICHTLICH NICHT STEHT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * **Das Passwort.** Es steht in genau zwei Welten — gehasht in `auth.users` und
 * im Klartext in App Store Connect — und in keiner Datei dieses Projekts. Das ist
 * die Hausregel aus der Haupt-CLAUDE.md (*„API-Schlüssel niemals im Code"*) an
 * ihrer schärfsten Stelle: Der Prototyp liegt öffentlich auf GitHub Pages.
 *
 * Erzeugt wird es von `supabase/demo/anlegen.sh` — 24 zufällige Zeichen aus
 * `openssl rand`, einmal angezeigt, nie abgelegt. *Länge ist keine Geheimhaltung*
 * (FALLEN.md), aber Zufall ist es, und beides zusammen ist der Punkt.
 */

/**
 * Die eine Adresse, die den Passwort-Weg sieht.
 *
 * Kleingeschrieben, und das ist keine Formatierung: Verglichen wird gegen die
 * normalisierte Eingabe (siehe `istDemoZugang`). Stünde hier ein Großbuchstabe,
 * träfe die Bedingung nie zu — und der Bildschirm sähe aus, als wäre nichts
 * gebaut worden.
 */
export const DEMO_EMAIL = 'demo@simplysocial.invalid';

/**
 * Ist das die Demo-Adresse? — **normalisiert, nicht verglichen.**
 *
 * ── Warum `trim().toLowerCase()` und nicht `=== DEMO_EMAIL` ──────────────────
 * Weil ein Mensch tippt und nicht eine Zeile Code. Auf iOS schaltet die Tastatur
 * gern den ersten Buchstaben groß, beim Einfügen aus einer Notiz hängt ein
 * Leerzeichen hinten dran, und wer die Adresse aus App Store Connect kopiert,
 * nimmt manchmal die Zeile mit. Jedes davon macht aus einem richtig getippten
 * Zugang einen Bildschirm, auf dem der Knopf „Code schicken" heißt — und der
 * Reviewer ist dann genau dort, wo er nicht hinsollte: vor einem Postfach, das
 * es nicht gibt.
 *
 * Dieselbe Falle steht in der Supabase-Diskussion zu diesem Thema wörtlich:
 * *„The email is normalised by the Supabase client, while SQL is case-sensitive."*
 * Wir normalisieren deshalb auf BEIDEN Seiten gleich — hier und in
 * `supabase/demo/anlegen.sh`, das die Adresse ebenfalls kleingeschrieben einträgt.
 */
export function istDemoZugang(eingabe: string): boolean {
  return eingabe.trim().toLowerCase() === DEMO_EMAIL;
}

/**
 * Was dasteht, wenn das Demo-Passwort nicht durchgeht — eigene Funktion, nicht
 * `codeFehlerText()`.
 *
 * ── Warum nicht dieselbe Funktion ────────────────────────────────────────────
 * Weil die Codes andere sind und die nächste Handlung eine andere ist. Bei einem
 * abgelaufenen OTP fordert man einen neuen an; bei `invalid_credentials` gibt es
 * nichts anzufordern — dann stimmt das Passwort nicht, und der einzige sinnvolle
 * nächste Schritt ist, es in App Store Connect nachzulesen. Ein Satz, der
 * „Fordere einen neuen an" sagt, schickt genau die eine Person, die diesen
 * Bildschirm je sieht, in die Irre — und das ist der Apple-Reviewer.
 *
 * Derselbe Grund wie bei `anbieterFehlerText()` neben `codeFehlerText()`
 * (Phase 20.3-b2): zwei Wege, zwei Fehlerfamilien, zwei Sätze.
 */
export function passwortFehlerText(code: string): string {
  switch (code) {
    case 'invalid_credentials':
      return 'E-Mail oder Passwort stimmt nicht.';
    case 'over_request_rate_limit':
      return 'Gerade ging es zu schnell hintereinander. Probier es in ein paar Minuten.';
    case 'email_not_confirmed':
      // Kann nur eintreten, wenn `anlegen.sh` das Konto OHNE `email_confirmed_at`
      // angelegt hat — und dann hilft kein Satz an den Reviewer, sondern nur ein
      // erneuter Lauf des Skripts. Er steht trotzdem da, weil ein unbeantworteter
      // Code auf dem Bildschirm als „Das hat gerade nicht geklappt" landet und
      // damit nach einem Netzproblem aussieht (harte Regel 57 für den Menschen).
      return 'Dieses Konto ist noch nicht bestätigt.';
    default:
      return 'Das hat gerade nicht geklappt. Prüf dein Netz und probier es noch einmal.';
  }
}
