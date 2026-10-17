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
  },

  /** Die Hausregeln. */
  regeln: {
    keinDating: 'Das hier ist kein Dating',
  },
} as const;
