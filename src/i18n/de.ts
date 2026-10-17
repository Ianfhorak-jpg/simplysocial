/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DEUTSCH — die QUELLE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Was hier steht, ist der Wortlaut der App. `en.ts` ist die Übersetzung davon und
 * als `Weiter<typeof de>` getippt: **Jeder Schlüssel, der hier dazukommt, ist in
 * `en.ts` sofort ein `tsc`-Fehler, bis er dort auch steht.** Das ist die
 * Vollständigkeitsprüfung, und sie kostet nichts.
 *
 * ── Aufbau ───────────────────────────────────────────────────────────────────
 * Bereiche nach FACHGEBIET, nicht nach Bildschirm. Ein Satz kann an zwei Stellen
 * stehen; ein Bildschirm kann verschwinden. „Was eine Anfrage sagt" bleibt.
 * Dieselbe Ordnung, die `features/` schon hat.
 *
 * ── ⚠️ Was NICHT hierher gehört ──────────────────────────────────────────────
 * - **Listen** (Wochentage, Bezirksnamen). Blätter müssen Strings sein, sonst
 *   zerfällt die Punkt-Pfad-Autovervollständigung. Eine Helferfunktion danebenstellen,
 *   die `spracheJetzt()` liest.
 * - **Namen von Sprachen** — die stehen in `SPRACH_WAHL` in `index.ts`, weil sich
 *   jede Sprache in einer Sprachliste selbst nennt.
 * - 🔴 **Texte, die in der App nicht erreichbar sind.** Bei ACTAs Apple-Prüfung
 *   wurden Paywall-Wörter im Bündel nachgewiesen, obwohl kein Bildschirm sie liest
 *   — **das ganze Wörterbuch landet im Bündel.** Wer ein Wort loswerden muss, muss
 *   es hier löschen, nicht nur in der Oberfläche.
 */

export const de = {
  /** Wörter, die überall vorkommen. */
  gemein: {
    abbrechen: 'Abbrechen',
    fertig: 'Fertig',
    weiter: 'Weiter',
    zurueck: 'Zurück',
    nochmal: 'Nochmal versuchen',
    verstanden: 'Verstanden',
  },

  /**
   * Der Anmelde-Bildschirm. **Der erste, den ein Apple-Prüfer sieht** — und der
   * einzige, der nicht durch `SsScreen` läuft, weil er selbst der Torwächter ist.
   */
  anmelden: {
    momentBitte: 'Einen Moment …',
    mitApple: 'Weiter mit Apple',
    mitGoogle: 'Weiter mit Google',
    mitEmailCode: 'Mit E-Mail-Code',
    emailHinweis: 'Wir schicken dir eine Zahl, kein Passwort.',
    nurAmHandy: 'Geht nur in der App am Handy.',
    ohneKonto: 'Kommt mit dem Konto — im Prototyp noch ohne Funktion.',
    weiterAlsIan: 'Weiter als Ian',
    attrappeHinweis: 'Im Prototyp gibt es keine Konten — das ist der einzige Weg hinein.',
    emailFeld: 'Deine E-Mail',
    emailPlatzhalter: 'du@beispiel.at',
    codeSchicken: 'Code schicken',
    wirdGeschickt: 'Wird geschickt …',
    codeGeschickt: 'Wir haben dir eine Zahl an {email} geschickt.',
    codeFeld: 'Die Zahl aus der Mail',
    codePlatzhalter: '123456',
    weiter: 'Weiter',
    dochAnders: 'Doch anders anmelden',
    andereAdresse: 'Andere Adresse',
  },

  /** Der Feed und der Wischstapel. */
  feed: {
    leerMitFilter: 'Mit diesem Filter ist gerade nichts los',
    binDabei: 'Bin dabei',
  },

  /** Eine Aktivität einstellen und bestätigt werden. */
  post: {
    posterBestaetigt: 'Der Poster hat dich bestätigt',
    bezirkFrage: 'In welchem Bezirk bist du unterwegs?',
  },

  /** Anfragen — jemand will mitkommen. */
  anfrage: {
    zuSpaet: 'Zu spät — der Platz ist weg',
  },

  /** Das eigene Konto. */
  konto: {
    treffenGezaehlt: 'Treffen, die wirklich stattgefunden haben',
    loeschenWarnung: 'Das lässt sich nicht zurückholen',
  },

  /** Einstellungen. */
  einstellungen: {
    spracheTitel: 'Sprache',
    deinBild: 'Dein Bild',
    bildEntfernen: 'Bild entfernen',
    bildwahlLaeuft:
      'Ein Bild aussuchen geht am Handy noch nicht \u2014 das kommt mit dem n\u00e4chsten App-Update. Im Browser geht es schon.',
    deinBezirk: 'Dein Bezirk',
    bezirkHinweis: 'Von hier aus sortiert dein Feed nach au\u00dfen',
    heimatbezirk: 'Dein Heimatbezirk',
    blockiert: 'Blockiert',
    niemandBlockiert: 'Du hast niemanden blockiert.',
    blockierenWo: 'Blockieren kannst du auf dem Profil einer Person.',
    aufheben: 'Aufheben',
    nutzungsbedingungen: 'Nutzungsbedingungen',
    nutzungsbedingungenHinweis: 'Was hier gilt und ab welchem Alter',
    deinKonto: 'Dein Konto',
    abmelden: 'Abmelden',
    abmeldenHinweis: 'Zur\u00fcck zum Anmelden von {app}',
    accountLoeschen: 'Account l\u00f6schen',
    accountLoeschenHinweis: 'Dein Profil, deine Posts und deine Chats',
    fuerEntwicklung: 'F\u00fcr die Entwicklung',
    bausteine: 'Bausteine anschauen',
    bausteineHinweis: 'Alle Elemente der App nebeneinander',
    postFassungen: 'Post-Fassungen vergleichen',
    postFassungenHinweis: 'Drei Entw\u00fcrfe nebeneinander \u2014 zum Aussuchen',
  },

  /**
   * Der Standort. Die S\u00e4tze geh\u00f6ren `features/posts/standort.ts` \u2014 sie stehen hier
   * nur als Wortlaut, die ENTSCHEIDUNG welcher wann gilt bleibt dort.
   */
  standort: {
    anTitel: 'Von deinem Standort aus',
    anAusgangspunkt:
      'Dein Feed sortiert ab da, wo du gerade bist. Niemand sieht deinen Standort.',
    anBezirk: 'Dein Bezirk wird automatisch gesetzt. Niemand sieht deinen Standort.',
    ausTitel: 'Standort ist aus',
    verweigert:
      'Du hast das abgelehnt \u2014 das \u00e4ndert man in den Einstellungen deines Handys. Dein Feed sortiert weiter ab deinem Bezirk.',
    unmoeglichTitel: 'Standort gibt es hier nicht',
    unmoeglich: 'Dein Feed sortiert ab deinem Bezirk.',
    ausErklaerung:
      'Statt ab deinem Bezirk sortiert der Feed dann ab da, wo du gerade bist. Der Standort wird nirgends angezeigt und nicht gespeichert.',
  },

  /** Die Hausregeln. */
  regeln: {
    keinDating: 'Das hier ist kein Dating',
  },
} as const;
