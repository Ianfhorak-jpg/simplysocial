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
  /**
   * Die Marke in Worten.
   *
   * ⚠️ **Der Claim steht ZWEIMAL, und das ist kein Versehen.** Hier für die App —
   * und in `config/brand.ts` für `app/+html.tsx`, die HTML-Hülle. Die wird
   * ausgeliefert, **bevor** das JavaScript läuft (harte Regel 21): Dort gibt es
   * kein `t()`, keine Sprache und keine Wahl, nur eine `<meta description>`.
   * Zusammenführen geht nicht, ohne die Hülle übersetzbar zu machen — und die
   * sieht niemand, der die App benutzt, sondern nur Suchmaschinen.
   * **`npm run pruef-sprache` hält die deutschen Fassungen gleich.**
   */
  marke: {
    claim: 'Finde Leute, die jetzt Lust haben.',
  },

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
    zurueckKarte: 'Zurück zur Karte',
    posten: 'Posten',
    etwasPosten: 'Etwas posten',
    stapelDurch: 'Hier ist der Stapel durch',
    allesFuerHeute: 'Das war alles für heute',
    rueckgaengig: 'Rückgängig',
    weggewischt: '„{titel}" weggewischt',
    zumFeed: 'Zum Feed',
  },

  /** Die Filter über dem Feed. */
  filter: {
    alle: 'Alle',
    bestimmteJahrgaenge: 'Bestimmte Jahrgänge',
    alleZuruecksetzen: 'Alle Filter zurücksetzen',
    zuruecksetzen: 'Filter zurücksetzen',
  },

  /** Die Kategorien. Der Name kommt aus `CATEGORIES` (harte Regel 114). */
  kategorie: {
    sport: 'Sport',
    essen: 'Essen',
    lernen: 'Lernen',
    kultur: 'Kultur',
    draussen: 'Draußen',
    kreativ: 'Kreativ',
  },

  /** Das Können-Niveau. `egal` heißt bewusst „egal", nicht „Anfänger". */
  niveau: {
    egal: 'Egal, wie gut',
    anfaenger: 'Anfänger',
    fortgeschritten: 'Fortgeschritten',
    sehrGut: 'Sehr gut',
  },

  /** Anfragen, Beitritte und Einladungen. */
  anfragen: {
    freiVon: '{frei} von {gesamt} frei',
    allePlaetzeVergeben: 'Alle Plätze vergeben',
    vollHinweis:
      'Alle Plätze sind vergeben. Die Anfrage bleibt stehen — springt jemand ab, kannst du sie bestätigen.',
    ohneNachricht: 'Ohne Nachricht angefragt.',
    ablehnen: 'Ablehnen',
    bestaetigen: 'Bestätigen',
    aufnehmen: 'Aufnehmen',
    neinDanke: 'Nein danke',
    annehmen: 'Annehmen',
    niemandMitmachen: 'Noch will niemand mitmachen',
    niemandMitmachenHinweis:
      'Sobald jemand bei einem deiner Posts „Bin dabei" drückt, steht er hier — und du entscheidest.',
    nirgendsZugesagt: 'Du hast noch nirgends zugesagt',
    imFeedWasDabei: 'Im Feed ist bestimmt was dabei.',
  },

  /** Die Chat-Liste. */
  chat: {
    gruppen: 'Gruppen',
    nochKeinChat: 'Noch kein Chat',
    nochKeinChatHinweis:
      'Sobald jemand deine Anfrage bestätigt — oder du eine bestätigst — steht der Chat dazu hier. Und wenn ihr einander folgt, kannst du direkt schreiben: der Knopf dafür steht auf dem Profil.',
  },

  /** Das eigene Profil. */
  profil: {
    einstellungen: 'Einstellungen',
    fuss: 'Blockierte Personen · Nutzungsbedingungen · Account löschen',
  },

  /**
   * Das Profilbild. Die Sätze gehören `features/social/bild.ts` (harte Regel 88) —
   * hier steht nur der Wortlaut.
   *
   * ⚠️ **`{app}` statt `SimplySocial`.** Hier stand der Name dreimal fest im Text,
   * und das war ein Verstoss gegen harte Regel 3 („Der Name steht an genau einer
   * Stelle") — älter als die Übersetzung und von keinem Prüfstand bemerkt. Ian hat
   * den Satz am 2026-10-17 im Browser auf Deutsch stehen gesehen und gemeldet.
   * `bild.ts` ist importfrei und kann `BRAND` nicht lesen — den Namen setzt deshalb
   * der Bildschirm ein.
   */
  bild: {
    offenAlle: 'Dein Bild sehen alle, die {app} benutzen.',
    offenTausch:
      'Wenn du es austauschst, ist das alte innerhalb von {min} Minuten überall weg.',
    kontoWeg: 'Löschst du dein Konto, geht dein Bild mit.',
    linksAblauf: 'Weitergeleitete Links laufen nach einer Stunde ab.',
    nurFollower: 'Dein Bild sehen nur Leute, die dir folgen oder mit dir verabredet sind.',
    andereBuchstaben: 'Alle anderen sehen deine Anfangsbuchstaben.',
    nurFormate: 'Das geht nur als JPG, PNG oder WebP.',
    zuGross: 'Das Bild ist zu groß — {mb} MB sind das Höchste.',
    keinZugriff:
      'Deine Fotos ließen sich nicht öffnen. Schau in den Einstellungen nach, ob {app} darauf zugreifen darf.',
    nichtUmwandelbar:
      'Dieses Foto konnte dein Handy nicht umwandeln. Nimm ein anderes — bei Live Photos und RAW kommt das vor.',
    nichtVorbereitet: 'Das Foto ließ sich nicht vorbereiten. Meistens hilft ein kleineres.',
    hochladenUnerwartet: 'Das Hochladen ist an etwas Unerwartetem gescheitert. Sag Ian Bescheid.',
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
      'Ein Bild aussuchen geht am Handy noch nicht — das kommt mit dem nächsten App-Update. Im Browser geht es schon.',
    deinBezirk: 'Dein Bezirk',
    bezirkHinweis: 'Von hier aus sortiert dein Feed nach außen',
    heimatbezirk: 'Dein Heimatbezirk',
    blockiert: 'Blockiert',
    niemandBlockiert: 'Du hast niemanden blockiert.',
    blockierenWo: 'Blockieren kannst du auf dem Profil einer Person.',
    aufheben: 'Aufheben',
    nutzungsbedingungen: 'Nutzungsbedingungen',
    nutzungsbedingungenHinweis: 'Was hier gilt und ab welchem Alter',
    deinKonto: 'Dein Konto',
    abmelden: 'Abmelden',
    abmeldenHinweis: 'Zurück zum Anmelden von {app}',
    accountLoeschen: 'Account löschen',
    accountLoeschenHinweis: 'Dein Profil, deine Posts und deine Chats',
    fuerEntwicklung: 'Für die Entwicklung',
    bausteine: 'Bausteine anschauen',
    bausteineHinweis: 'Alle Elemente der App nebeneinander',
    postFassungen: 'Post-Fassungen vergleichen',
    postFassungenHinweis: 'Drei Entwürfe nebeneinander — zum Aussuchen',
  },

  /**
   * Der Standort. Die Sätze gehören `features/posts/standort.ts` — sie stehen hier
   * nur als Wortlaut, die ENTSCHEIDUNG welcher wann gilt bleibt dort.
   */
  standort: {
    anTitel: 'Von deinem Standort aus',
    anAusgangspunkt:
      'Dein Feed sortiert ab da, wo du gerade bist. Niemand sieht deinen Standort.',
    anBezirk: 'Dein Bezirk wird automatisch gesetzt. Niemand sieht deinen Standort.',
    ausTitel: 'Standort ist aus',
    verweigert:
      'Du hast das abgelehnt — das ändert man in den Einstellungen deines Handys. Dein Feed sortiert weiter ab deinem Bezirk.',
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
