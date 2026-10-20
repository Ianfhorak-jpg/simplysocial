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
    /**
     * Der STADTNAME, wie er dasteht.
     *
     * ⚠️ **Nicht `BRAND.city` im Text benutzen.** `BRAND.city` ist die Tatsache
     * (die App ist für Wien); dieser Schlüssel ist die ANZEIGE davon, und auf
     * Englisch heißt die Stadt „Vienna" (Ians Wörterliste vom 2026-10-17).
     * Dieselbe Trennung wie beim Claim — und `pruef-sprache` hält die deutsche
     * Fassung gleich mit `BRAND.city`.
     */
    stadt: 'Wien',
  },

  /** Wörter, die überall vorkommen. */
  gemein: {
    abbrechen: 'Abbrechen',
    fertig: 'Fertig',
    zurueck: 'Zurück',
    verstanden: 'Verstanden',
    /** Das Wort, das zwei Aufzählungsglieder verbindet. */
    und: 'und',
  },

  /**
   * Die drei Ausgänge einer Anfrage, in drei Worten.
   *
   * ⚠️ **„Du bist dabei" und „Du bist drin" sind NICHT dasselbe**, und deshalb
   * stehen sie zweimal da: Bei einer Aktivität ist man einmal dabei, in einer
   * Gruppe ist man drin — dauerhaft. Die Begründung steht an `GRUPPEN_STAND` in
   * `app/(tabs)/requests.tsx`, und auf Englisch trägt erst „You're a member" sie
   * weiter.
   */
  stand: {
    wartet: 'Wartet',
    dabei: 'Du bist dabei',
    drin: 'Du bist drin',
    abgelehnt: 'Diesmal nicht',
  },

  /**
   * Zeitangaben, wie ein Mensch sie liest. Zusammengesetzt wird in
   * `lib/zeit.ts`, die Listen (Wochentage, Monate) stehen in `i18n/datum.ts` —
   * Blätter hier müssen Strings sein.
   *
   * ⚠️ **„Heute" und die Uhrzeit sind ZWEI Teile, nicht ein Satz mit
   * Platzhalter.** In beiden Sprachen steht die Uhrzeit hinter dem Tageswort
   * („Heute 18:30" · „Today 18:30"), und `startText()` fügt sie mit einem
   * Leerzeichen an. Dieselben drei Wörter braucht `tagText()` OHNE Uhrzeit für
   * enge Stellen — als Satzvorlage wären es sechs Schlüssel für drei Wörter.
   *
   * 🔴 **Mehrzahl steht als zwei Schlüssel da, nicht als `{n}` in einem Satz.**
   * Das ist die Falle, die in diesem Projekt sechsmal zugeschlagen hat. Wo nur
   * EIN Schlüssel steht, ist die Einzahl nachweislich unerreichbar, und der
   * Grund steht daneben — ein Text, den kein Bildschirm liest, landet trotzdem
   * im Bündel (siehe Kopf dieser Datei).
   */
  zeit: {
    heute: 'Heute',
    morgen: 'Morgen',
    gestern: 'Gestern',
    /** Ein Post, der heute schon läuft — groß, weil die Zeile damit anfängt. */
    seit: 'Seit {zeit}',
    /** Dasselbe in der Karten-Blase, wo es hinter dem Titel steht. */
    seitKlein: 'seit {zeit}',
    geradeEben: 'gerade eben',
    /**
     * **Einzahl gibt es nicht, und das ist gerechnet, nicht geschätzt:**
     * `vergangen()` antwortet unter zwei Minuten „gerade eben", der Zweig hier
     * beginnt also bei n = 2.
     */
    vorMin: 'vor {n} Min.',
    vorStunde: 'vor 1 Std.',
    vorStunden: 'vor {n} Std.',
    /** Die Einzahl von „vor {n} Tagen" ist ein eigenes Wort. */
    vorEinemTag: 'gestern',
    vorTagen: 'vor {n} Tagen',
  },

  /**
   * Der Anmelde-Bildschirm. **Der erste, den ein Apple-Prüfer sieht** — und der
   * einzige, der nicht durch `SsScreen` läuft, weil er selbst der Torwächter ist.
   */
  anmelden: {
    momentBitte: 'Einen Moment …',
    /**
     * Die Fehlersätze der Anmeldung.
     *
     * ⚠️ **`ginNichtNetz` steht in DREI Funktionen** (`anbieterFehlerText`,
     * `codeFehlerText`, `passwortFehlerText`) und `zuSchnell` in zweien — das
     * ist Absicht: Dieselbe Lage, derselbe Satz. Ein zweiter Schlüssel mit
     * demselben Wortlaut liefe beim nächsten Umformulieren auseinander.
     */
    nurInApp: 'Das geht nur in der App am Handy. Nimm hier die E-Mail.',
    wegNichtEingerichtet: 'Dieser Weg ist gerade nicht eingerichtet. Nimm die E-Mail.',
    anbieterNichts: 'Der Anbieter hat nichts zurückgeschickt. Probier es noch einmal.',
    ginNichtNetz: 'Das hat gerade nicht geklappt. Prüf dein Netz und probier es noch einmal.',
    codeFalsch: 'Der Code stimmt nicht oder ist abgelaufen. Fordere einen neuen an.',
    zuSchnell: 'Gerade ging es zu schnell hintereinander. Probier es in ein paar Minuten.',
    adresseFalsch: 'Die Adresse sieht nicht richtig aus.',
    kontenZu: 'Neue Konten sind gerade zu.',
    mailOderPasswort: 'E-Mail oder Passwort stimmt nicht.',
    kontoNichtBestaetigt: 'Dieses Konto ist noch nicht bestätigt.',
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
    binDabei: 'Bin dabei',
    zurueckKarte: 'Zurück zur Karte',
    posten: 'Posten',
    etwasPosten: 'Etwas posten',
    stapelDurch: 'Hier ist der Stapel durch',
    allesFuerHeute: 'Das war alles für heute',
    rueckgaengig: 'Rückgängig',
    weggewischt: '„{titel}" weggewischt',
    zumFeed: 'Zum Feed',
    stapelDurchFilter: 'Mit einem anderen Filter liegen vielleicht noch Karten da.',
    stapelDurchAlles: 'Alles, was du gesehen hast, steht unten weiter in der Liste.',
    nichtsDa: 'Dazu ist gerade nichts da',
    nichtsDaFilter: 'Mit einem anderen Filter findest du vielleicht mehr.',
    nochNichtsLos: 'Noch nichts los in deinem Feed',
    posteSelbst: 'Poste doch selbst was — irgendwer hat immer Zeit.',
    grussMitName: 'Hey {name}! Bin dabei',
    gruss: 'Hey! Bin dabei',
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

  /** Gruppen — Ansicht, Gründen, Beitritt. */
  gruppe: {
    gibtEsNichtMehr: 'Diese Gruppe gibt es nicht mehr.',
    vielleichtAufgeloest: 'Vielleicht hat sie der Gründer aufgelöst.',
    leuteEinladen: 'Leute einladen',
    fuerGruppePosten: 'Für die Gruppe posten',
    wasGeradeLaeuft: 'Was gerade läuft',
    jaVerlassen: 'Ja, verlassen',
    gruppeVerlassen: 'Gruppe verlassen',
    anfragenAnsehen: 'Anfragen ansehen',
    blockiertZumGruender: 'Zwischen dir und dem Gründer dieser Gruppe steht eine Blockierung.',
    einladungSofortDabei:
      'Nimm an, dann bist du sofort dabei — der Gründer muss nichts mehr bestätigen.',
    anfrageGeschicktGruender: 'Anfrage geschickt · der Gründer muss noch bestätigen',
    solangeNichtSichtbar: 'Solange siehst du noch nicht, was in der Gruppe läuft.',
    anfrageZurueckziehen: 'Anfrage zurückziehen',
    bleibtZu: 'Was hier läuft und wer dabei ist, bleibt zu.',
    erstAlsMitglied:
      'Was in dieser Gruppe läuft, siehst du erst als Mitglied. Frag an — der Gründer bestätigt, dann bist du dabei.',
    kurzDazuschreiben: 'Kurz dazuschreiben',
    dazuschreibenPlatzhalter: 'Servus! Würd gern dazukommen.',
    beitrittAnfragen: 'Beitritt anfragen',
    einladen: 'Einladen',
    gruender: 'Gründer',
    duBistGruender:
      'Du bist danach der Gründer. Anfragen von aussen bestätigst du; einladen darf später jeder, der drin ist.',
    name: 'Name',
    namePlatzhalter: 'Marswiese Tennis',
    beschreibung: 'Beschreibung',
    beschreibungPlatzhalter: 'Wir spielen meistens am Wochenende.',
    offenHinweis: 'Die Gruppe steht in der Liste. Wer hinein will, fragt an — du bestätigst.',
    privatHinweisNeu:
      'Die Gruppe steht in keiner Liste. Hinein kommt nur, wen jemand von drinnen einlädt.',
    gruppeErstellen: 'Gruppe erstellen',
    nameFehler: 'Ein Name, an dem man die Gruppe erkennt.',
    bezirkFehler: 'Vier Ziffern, z. B. 1070 — oder leer lassen.',
    /** ⚠️ Einzahl und Mehrzahl sind ZWEI Schlüssel (`mitgliederText`). */
    werDabeiIst: 'Wer dabei ist',
    wenHolen: 'Wen willst du holen?',
    duHastSieAufgemacht: 'Du hast sie aufgemacht.',
    aufgemachtVon: 'Aufgemacht von {name}.',
    hatDichEingeladen: '{name} hat dich eingeladen',
    auchAngefragt: 'Du hattest hier auch angefragt. Nimmst du an, erledigt sich das damit.',
    einMitglied: '1 Mitglied',
    mehrereMitglieder: '{anzahl} Mitglieder',
  },

  /**
   * Was eine Gruppe erlaubt und was ein Austritt anrichtet — der Wortlaut zu
   * `features/groups/gruppe.ts` (harte Regel 32). **Die Regeln selbst bleiben dort**,
   * hier stehen nur die Sätze.
   */
  gruppenregel: {
    hatAufgehoert:
      'Diese Gruppe gibt es nicht mehr. Sie hat sich aufgelöst, als die letzte Person sie verlassen hat.',
    privat:
      'Diese Gruppe ist privat. Hinein kommt man nur, wenn jemand von drinnen dich einlädt.',
    nurEinladung: 'In diese Gruppe kommt man nur, wenn jemand von drinnen dich einlädt.',
    privatKurz: 'Privat — hier kommt nur hinein, wer eingeladen wird.',
    austrittPostsWeg: 'Du siehst die Posts von „{gruppe}" nicht mehr.',
    austrittNurNeueAnfrage: 'Zurück kommst du nur über eine neue Anfrage.',
    austrittAufgeloest: 'Die Gruppe wird für alle aufgelöst — auch für die anderen Mitglieder.',
    austrittWeitergabe:
      'Die Gruppe geht an {name} — wer am längsten dabei ist, führt sie weiter.',
    austrittAllein: 'Du bist allein in der Gruppe: Sie wird damit aufgelöst.',
    austrittBleibtOhneGruender:
      'Die Gruppe bleibt bestehen, aber niemand kann mehr Beitritte bestätigen.',
    austrittPostsBleiben: 'Deine Posts für diese Gruppe laufen normal weiter.',
    austrittPostsWegGeloescht:
      'Deine Posts für diese Gruppe werden gelöscht — auch zugesagte Treffen.',
    austrittPostsOeffentlich: 'Deine Posts für diese Gruppe werden öffentlich sichtbar.',
  },

  /** Die Tab-Leiste und der Wischstapel. */
  tabs: {
    start: 'Start',
    chats: 'Chats',
    profil: 'Profil',
  },

  /** Der Wischstapel und seine Anleitungskarte. */
  stapel: {
    weg: 'Weg',
    soFunktioniert: 'So funktioniert der Stapel',
    nachLinks: 'Nach links, wenn es nichts für dich ist.',
    nachRechts: 'Nach rechts, wenn du mitwillst.',
    probierAus:
      'Probier es gleich mit dieser Karte aus. Der Verfasser entscheidet danach, wer mitkommt — bis dahin passiert nichts.',
    oderSchieben: 'Oder die Karte einfach zur Seite schieben.',
    duBistDabei: 'Du bist dabei',
    /** ⚠️ Vierter Mehrzahl-Fall — zwei Schlüssel. */
    einPlatzFrei: '1 Platz frei',
    mehrerePlaetzeFrei: '{anzahl} Plätze frei',
    allesDurch: 'Hier ist alles durch',
    bezirkDurch:
      'In diesem Bezirk hast du dir alles angesehen. Auf der Karte ist vielleicht nebenan noch etwas los.',
    ganzeStadt: 'Ganz {stadt}',
  },

  /** Die Filter-Überschriften über dem Feed. */
  filterTitel: {
    kategorie: 'Kategorie',
    wann: 'Wann',
    vonDerKarte: 'Von der Karte',
    jahrgang: 'Jahrgang',
    alterEgal: 'Alter egal',
    fuerAlle: 'Für alle',
  },

  /** Das erste Konto und die Antwortleiste. */
  erstesKonto: {
    wieHeisstDu: 'Wie heißt du?',
    bezirkGrund: 'Danach sortieren wir, was in deiner Nähe los ist.',
    haekchenFehlt: 'Setz noch das Häkchen, dann geht es los.',
    passwort: 'Passwort',
    fastGeschafft: 'Fast geschafft',
    dreiSachen: 'Drei Sachen, dann bist du drin.',
    losGehts: "Los geht's",
    deinVorname: 'Dein Vorname',
    woWohnstDu: 'Wo wohnst du?',
    welcherJahrgang: 'Welcher Jahrgang?',
    jahrgangOffen: 'Steht offen an deinem Profil.',
    ginNichtNochmal: 'Das hat gerade nicht geklappt. Probier es noch einmal.',
  },

  /** Die Antwortleiste unter einem Post. */
  antwort: {
    dazuschreiben: 'Kurz was dazuschreiben (optional)',
    schicken: 'Schicken',
    dochNicht: 'Doch nicht',
  },

  /** Der Bild-Zuschnitt. */
  zuschnitt: {
    schiebUndZieh: 'Schieb und zieh das Foto, bis im Kreis steht, was du willst.',
    nurImKreis: 'Gespeichert wird nur, was im Kreis liegt — der Rest ist weg.',
    ausschnittWaehlen: 'Ausschnitt wählen',
    uebernehmen: 'Übernehmen',
  },

  /** Der Match-Bildschirm. */
  match: {
    allesKlar: 'Alles klar',
    nichtsZuFeiern: 'Hier gibt es gerade nichts zu feiern',
    bestaetigungWeg:
      'Dieser Match-Bildschirm gehört zu einer Bestätigung, die es nicht mehr gibt.',
    zuDenAnfragen: 'Zu den Anfragen',
  },

  /** Die Gruppen-Übersicht. */
  gruppenliste: {
    /** ⚠️ Fünfter Mehrzahl-Fall — zwei Schlüssel. */
    inEinerGruppe: 'Du bist in einer Gruppe. Für sie kannst du beim Posten gezielt posten.',
    inMehrerenGruppen:
      'Du bist in {anzahl} Gruppen. Für sie kannst du beim Posten gezielt posten.',
    wasIstEineGruppe:
      'Eine Gruppe ist eine kleine Runde in {stadt}, für die du gezielt posten kannst.',
    nochKeine: 'Hier gibt es noch keine Gruppe. Mach die erste auf.',
    niemandEinladbar:
      'Du kannst Leute einladen, denen du folgst oder die dir folgen. Im Moment ist das niemand — folg jemandem, dann steht er hier.',
    gruppeLeer:
      'Gerade nichts. Diese Posts stehen auch im normalen Feed — hier siehst du sie nur beisammen.',
    titel: 'Gruppen',
    angefragt: 'Angefragt',
    duBistEingeladen: 'Du bist eingeladen',
    ausGruppeGeholt:
      'Jemand aus einer Gruppe hat dich geholt. Nimmst du an, bist du sofort dabei.',
  },

  /** Kleinteiliges, das an mehreren Stellen auftaucht. */
  klein: {
    nochNichtsGeschrieben: 'Noch nichts geschrieben — fang an.',
    dasVerschwindet: 'Das verschwindet',
    nochEinmalGefragt: 'Du wirst noch einmal gefragt.',
    soSehenEsDieAnderen: 'So sehen es die anderen',
    mehrEinstellen: 'Mehr einstellen',
    bezirkAntippen: 'Dein Bezirk: {bezirk} {stadt}. Zum Ändern antippen.',
    stimmtNichts: 'Stimmt hier etwas nicht?',
    eingabeLoeschen: 'Eingabe löschen',
    bezirkGibtEsNicht: 'Den Bezirk gibt es in {stadt} nicht.',
    bezirkPlatzhalter: '1220',
    interessen: 'Interessen',
    follower: 'Follower',
    folgt: 'Folgt',
    treffen: 'Treffen',
    netzFehler:
      'Wir kommen gerade nicht an deine Aktivitäten. Das liegt meistens am Netz.',
  },

  /** Der Chat-Raum, wenn eine Blockierung dazwischensteht. */
  chatGesperrt: {
    niemandSchreiben: 'Hier kann niemand mehr schreiben',
    blockierungDazwischen:
      'Zwischen euch steht eine Blockierung. Was ihr geschrieben habt, bleibt lesbar.',
  },

  /**
   * Konto löschen — der Wortlaut zu `features/safety/konto.ts`.
   * **Welche Folge bei welcher Wirkung gilt, bleibt dort** (`LOESCH_WIRKUNG`).
   *
   * ⚠️ **Sechster Mehrzahl-Fall, und er steckt in DREI Sätzen:** „Deine Gruppe"
   * gegen „Deine Gruppen". Deshalb je Satz zwei Schlüssel — ein eingesetztes
   * Bruchstück wäre in keiner der beiden Sprachen richtig.
   */
  loeschfolgen: {
    postsWeg:
      'Deine Posts verschwinden aus dem Feed — auch die, für die schon jemand zugesagt hat. Diese Verabredungen sind damit abgesagt, ohne dass die anderen erfahren, warum.',
    chatsWeg:
      'Eure gemeinsamen Chats verschwinden mitsamt allen Nachrichten, auch bei den anderen.',
    postsBleiben:
      'Deine Posts und Chats bleiben stehen. Statt deines Namens steht dort „Gelöschtes Konto" — die Nachrichten selbst kannst du aus fremden Verläufen nicht herauslöschen.',
    postsGeteilt:
      'Posts, für die noch niemand zugesagt hat, verschwinden. Posts mit Zusagen bleiben bis zu ihrem Ende stehen, damit die Verabredung hält.',
    gruppeAufgeloest: 'Deine Gruppe wird aufgelöst — auch für alle anderen darin.',
    gruppenAufgeloest: 'Deine Gruppen werden aufgelöst — auch für alle anderen darin.',
    gruppeGehtAn:
      'Deine Gruppe bleibt bestehen und geht an {name} — wer am längsten dabei ist, führt sie weiter.',
    gruppenGehenAn:
      'Deine Gruppen bleiben bestehen und gehen an {name} — wer am längsten dabei ist, führt sie weiter.',
    gruppeAllein: 'Deine Gruppe wird aufgelöst: Du bist allein darin.',
    gruppenAllein: 'Deine Gruppen werden aufgelöst: Du bist allein darin.',
    meldungenBleiben:
      'Meldungen, die du geschrieben hast, bleiben bei uns liegen — ohne deinen Namen.',
    quittung: 'Dein Konto wurde gelöscht.',
  },

  /** Die Fragen beim ersten Konto — Wortlaut zu `features/auth/konto.ts`. */
  ersteFragen: {
    nameFehlt: 'Schreib deinen Namen dazu.',
    nameKurz: 'Der Name ist ein bisschen kurz.',
    nameLang: 'Höchstens {max} Zeichen.',
    bezirkFehlt: 'Wähl deinen Bezirk.',
    bezirkFalsch: 'Das ist kein {stadt}er Bezirk.',
    jahrgangKeineZahl: 'Nur die Jahreszahl, zum Beispiel 2009.',
    jahrgangSpanne: 'Zwischen {min} und {max}.',
  },

  /** Direktchats — Wortlaut zu `features/chat/direkt.ts`. */
  direkt: {
    gegenseitig:
      'Schreiben könnt ihr euch, sobald ihr einander folgt. {name} muss dir also auch folgen.',
    schonGetroffen:
      'Schreiben könnt ihr euch, sobald ihr einmal gemeinsam bei einer Aktivität wart.',
    verwaist: 'Aus einer Aktivität, die es nicht mehr gibt.',
  },

  /** Wenn die Daten nicht kommen — Wortlaut zu `data/quelle.ts`. */
  laden: {
    keineVerbindung: 'Keine Verbindung',
  },

  /** Der Prototyp-Hinweis — nur im Browser (`ANMELDE_QUELLE = 'attrappe'`). */
  prototyp: {
    titel: 'Das hier ist ein Prototyp',
    text:
      'Alle Namen, Posts und Chats sind erfunden. Es gibt keinen Login — du bist gerade Ian. Neuladen setzt alles zurück.',
  },

  /**
   * Was dasteht, wenn etwas schiefgeht — Laden, Schreiben, Programmfehler.
   *
   * 🔴 **Diese Sätze standen bis zum 2026-10-18 fest in `data/quelle.ts`,
   * `data/schreiben.ts` und `lib/programmfehler.ts`** — drei Dateien, die
   * importfrei bleiben müssen (Prüfstände laden sie in blankem Node). Sie geben
   * jetzt SCHLÜSSEL heraus, und der Bildschirm wickelt sie in `t()`.
   *
   * ⚠️ Dabei kam ein echter Fehler heraus: `ladeFehlerFolgen()` gab schon
   * `'laden.keineVerbindung'` zurück, `LadeSchirm` zeichnete es aber ungewickelt
   * — auf dem Schirm stand der SCHLÜSSEL. Genau die Fehlerart aus Abschnitt 2c
   * von `pruef-sprache`, nur aus einer Quelle, die der Wächter nicht kannte.
   */
  fehler: {
    nichtMehrAngemeldet: 'Du bist nicht mehr angemeldet.',
    nichtMehrAngemeldetTitel: 'Du bist nicht mehr angemeldet',
    nochmalAnmelden: 'Melde dich noch einmal an, dann ist alles wieder da.',
    anmelden: 'Anmelden',
    keinNetzLetzterStand: 'Kein Netz — du siehst den letzten Stand.',
    nochmalKurz: 'Nochmal',
    allesKlar: 'Alles klar',
    nochmalVersuchen: 'Nochmal versuchen',
    schonGeklappt: 'Das hat schon geklappt.',
    nichtGeklapptNetz: 'Das hat nicht geklappt — meistens liegt es am Netz.',
    bildSchonWeg: 'Dein Konto ist noch da — dein Profilbild ist aber schon entfernt.',
    programmText: 'Da ist etwas schiefgegangen, das nicht an dir liegt.',
    programmTitel: 'Da ist etwas schiefgegangen',
    programmErklaerung:
      'Es liegt nicht an dir und nicht an deinem Netz — der Fehler steckt in der App selbst.',
  },

  /**
   * Der Hinweis über dem Zusagen-Knopf, wenn man zur selben Zeit schon etwas hat.
   *
   * ⚠️ **Die Anführungszeichen stehen im Satz, nicht im Code** — Deutsch setzt
   * „so", Englisch “so”. Ein festes Zeichenpaar im Code wäre in einer der beiden
   * Sprachen falsch, und das sieht niemand beim Übersetzen.
   */
  doppelt: {
    selbstGepostet: 'Du hast „{titel}“ {wann} selbst gepostet.',
    schonDabei: 'Du bist {wann} schon bei „{titel}“.',
    undNochEtwas: '{satz} Und noch etwas um die Zeit.',
    undNochMehrere: '{satz} Und noch {anzahl} Sachen um die Zeit.',
  },

  /** Die Chat-Liste. */
  chat: {
    gruppen: 'Gruppen',
    nochKeinChat: 'Noch kein Chat',
    nochKeinChatHinweis:
      'Sobald jemand deine Anfrage bestätigt — oder du eine bestätigst — steht der Chat dazu hier. Und wenn ihr einander folgt, kannst du direkt schreiben: der Knopf dafür steht auf dem Profil.',
  },

  /** Fremde Profile. */
  person: {
    duFolgst: 'Du folgst',
    folgen: 'Folgen',
    nurFuerFollower: 'Posts, die nur für Follower sind.',
    nachricht: 'Nachricht',
    jaBlockieren: 'Ja, blockieren',
    blockieren: 'Blockieren',
    blockierungAufheben: 'Blockierung aufheben',
    entblockenFolgen:
      'Ihr seht dann wieder die Posts des anderen. Was der Block mitgenommen hat, kommt nicht zurück — wer wem gefolgt ist, euer Chat und abgesagte Zusagen müsstet ihr neu machen.',
    blockiertTitel: 'Du hast diese Person blockiert',
    gibtEsNicht: 'Diese Person gibt es nicht',
    kontoGeloescht: 'Vielleicht hat sie ihr Konto gelöscht.',
    /**
     * ⚠️ **Vier Schlüssel für zwei Sätze, und das ist der dritte Mehrzahl-Fall.**
     * Vorher stand `${postText(n)} nur für Follower sichtbar.` — ein Satz mit
     * eingesetztem Bruchstück („1 Post ist" / „3 Posts sind"). Englisch beugt
     * genauso (`is`/`are`), und ein geteilter Satz ist in keiner der beiden
     * Sprachen zu retten.
     */
    einPostFollower: '1 Post ist nur für Follower sichtbar.',
    mehrerePostsFollower: '{anzahl} Posts sind nur für Follower sichtbar.',
    einPostGruppe: '1 Post ist nur für eine Gruppe sichtbar.',
    mehrerePostsGruppe: '{anzahl} Posts sind nur für eine Gruppe sichtbar.',
  },

  /**
   * Was ein Block anrichtet — der Wortlaut zu `features/safety/block.ts`
   * (harte Regel 17). **Welcher Satz bei welcher Wirkung gilt, bleibt dort.**
   */
  block: {
    postsWeg: 'Ihr seht die Posts des anderen nicht mehr.',
    keineAnfragen: 'Anfragen sind in beide Richtungen nicht mehr möglich.',
    chatWeg: 'Euer Chat verschwindet.',
    chatStillgelegt: 'Euer Chat bleibt lesbar, aber niemand kann mehr hineinschreiben.',
    chatBleibt: 'Euer Chat bleibt, wie er ist.',
    verabredungAbgesagt: 'Eine bestätigte Verabredung wird abgesagt.',
    verabredungBleibt:
      'Eine bestätigte Verabredung bleibt bestehen — absagen musst du selbst.',
    merktZusageWeg:
      'Dass du blockiert hast, erfährt die Person nicht — nur, dass die Zusage weg ist.',
    merktNichts: 'Die Person erfährt nichts davon.',
  },

  /** Der Chat-Bildschirm selbst. */
  chatraum: {
    treffpunktOffen: 'Treffpunkt noch offen',
    senden: 'Senden',
    verabredetTitel: 'Ihr seid verabredet',
    nochNichtsGeschrieben:
      'Noch hat niemand etwas geschrieben. Ein „Hi, passt es bei dir noch?" reicht völlig.',
    gibtEsNicht: 'Diesen Chat gibt es nicht',
    treffenWeg: 'Vielleicht gehört er zu einem Treffen, das es nicht mehr gibt.',
    zuDenChats: 'Zu den Chats',
  },

  /** Das eigene Profil. */
  profil: {
    wasDuVorhast: 'Was du vorhast',
    wasVorhat: 'Was {name} vorhat',
    nichtsGeplant:
      'Du hast gerade nichts geplant. Was hier steht, verschwindet mit dem Tag — wie im Feed.',
    nichtsGeplantAndere: '{name} hat gerade nichts geplant.',
    nochKeineFollower: 'Noch keine Follower.',
    folgtNochNiemandem: 'Folgt noch niemandem.',
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

  /** Eine Aktivität einstellen — der Kern-Ablauf der App. */
  erstellen: {
    kategorieFehler: 'Wähle aus, worum es geht.',
    titelFehler: 'Ein paar Wörter, damit man weiß, was los ist.',
    sichtFehler: 'Wähle die Gruppe aus, für die der Post gedacht ist.',
    wasHastDuVor: 'Was hast du vor?',
    worumGehtEs: 'Worum geht es?',
    titelInVorschau: 'Dein Titel steht hier',
    /**
     * Der Satz über dem Knopf, wenn Felder fehlen.
     *
     * ⚠️ **Die Feldnamen tragen die Präposition mit** („bei der Uhrzeit",
     * „at the time"), weil aus zwei Namen ohne Sonderfall ein Satz wird. Im
     * Deutschen ist es der Dativ, im Englischen „at the …" — in beiden Sprachen
     * gehört die Präposition zum NAMEN, nicht zur Vorlage.
     */
    fehltNochRot: 'Es fehlt noch was — die roten Stellen.',
    schauNochMal: 'Schau noch mal {felder}.',
    feldKategorie: 'bei der Kategorie',
    feldTitel: 'beim Titel',
    feldBezirk: 'beim Bezirk',
    feldZeit: 'bei der Uhrzeit',
    feldSicht: 'bei der Gruppe',
    titel: 'Titel',
    titelPlatzhalter: 'Tennis spielen',
    wann: 'Wann?',
    zeitPlatzhalter: '18:30',
    bezirk: 'Bezirk',
    bezirkFreiwillig: 'freiwillig — leer heißt „irgendwo in {stadt}"',
    bezirkPflicht: 'nur die Postleitzahl',
    bezirkPlatzhalter: '1070',
    wieViele: 'Wie viele können mitkommen?',
    duZaehlstNicht: 'du selbst zählst nicht mit',
    koennen: 'Können',
    niemandAbgehaengt: 'damit sich niemand abgehängt fühlt',
    fuerWen: 'Für wen ist das?',
    niemandFehlAmPlatz: 'damit niemand fehl am Platz ist',
    jahrgangHinweis:
      'Dein Post ist trotzdem für alle sichtbar. Der Jahrgang sagt nur, an wen er sich richtet — und andere können danach filtern.',
    treffpunkt: 'Treffpunkt',
    treffpunktPlatzhalter: 'Beim Eingang der Sportanlage',
    nochWas: 'Noch was dazu?',
    nochWasPlatzhalter: 'Hab zwei Schläger dabei, Bälle auch.',
    werSollSehen: 'Wer soll es sehen?',
    gruppeSpaeter: 'Sobald du in einer Gruppe bist, kannst du hier auch nur für sie posten.',
    wieLange: 'Wie lange sichtbar?',
    vorschauLeer: 'Sobald du unten eine Kategorie wählst, siehst du hier deine Karte.',
    obenInVorschau: 'Zeit, Bezirk, Plätze — oben in der Vorschau',
    bezirkFehlt: 'In welchem Bezirk?',
    bezirkFalsch: 'Ein {stadt}er Bezirk zwischen 1010 und 1230.',
    zeitFehlt: 'Wann geht es los?',
    zeitFalsch: 'Eine Uhrzeit wie 18:30.',
    zeitVorbei: 'Das ist schon vorbei.',
    sichtFollower: 'Follower',
    sichtNurFollower: 'Nur meine Follower',
    sichtGruppe: 'Gruppe',
    sichtAlleText: 'Jeder in {stadt} sieht deinen Post im Feed.',
    sichtFollowerText: 'Nur wer dir folgt, sieht ihn — das sind gerade {anzahl} Leute.',
    sichtGruppeText:
      'Nur die Leute in „{gruppe}" sehen ihn. Im Feed steht er bei ihnen wie jeder andere Post.',
  },

  /**
   * Wie lange ein Post sichtbar bleibt. Gehört `features/posts/lifecycle.ts` —
   * **die RECHENREGEL bleibt dort**, hier steht nur der Wortlaut.
   */
  sichtdauer: {
    startTitel: 'Bis es losgeht',
    startText: 'Für Sachen, bei denen man pünktlich sein muss — Kino, Zug, Konzert.',
    tagesendeTitel: 'Bis Tagesende',
    tagesendeText: 'Der Normalfall. Wer knapp zu spät dran ist, kann trotzdem noch dazukommen.',
    morgenTitel: 'Einen Tag länger',
    morgenText:
      'Für Offenes ohne feste Uhrzeit — „bin den ganzen Nachmittag am Donaukanal".',
  },

  /** Eine Aktivität einstellen und bestätigt werden. */
  post: {
  },

  /** Die Post-Ansicht — der Bildschirm, auf dem „Bin dabei" gedrückt wird. */
  postansicht: {
    blockiertTitel: 'Hier geht nichts',
    blockiertText:
      'Zwischen dir und dem Verfasser dieses Posts steht eine Blockierung. Blockierungen, die du selbst gesetzt hast, findest du in den Einstellungen.',
    deinPostTitel: 'Das ist dein Post',
    niemandAngefragt:
      'Noch hat niemand angefragt. Sobald jemand mitmachen will, siehst du es im Anfragen-Tab.',
    /** ⚠️ Einzahl und Mehrzahl sind ZWEI Schlüssel — kein Satz mit eingesetztem Verb. */
    einerWillMit: '{anzahl} Person will mitmachen. Bestätigen kannst du im Anfragen-Tab.',
    mehrereWollenMit: '{anzahl} Leute wollen mitmachen. Bestätigen kannst du im Anfragen-Tab.',
    verabredetTitel: 'Ihr seid verabredet',
    verabredetText: '{name} hat bestätigt. Alles Weitere macht ihr im Chat aus.',
    zumChat: 'Zum Chat',
    diesmalNichtTitel: 'Diesmal nicht',
    diesmalNichtText: '{name} hat abgesagt. Im Feed ist bestimmt was anderes.',
    anfrageGeschicktTitel: 'Anfrage geschickt',
    anfrageGeschicktText:
      '{name} muss noch bestätigen. Sobald das passiert, geht der Chat auf.',
    anfrageZuruecknehmen: 'Anfrage zurücknehmen',
    schonVoll: 'Schon voll',
    treffpunktOffen: 'Machen wir im Chat aus',
    fuerWen: 'Für wen',
    plaetze: 'Plätze',
    alleVergeben: 'Alle {gesamt} vergeben',
    sichtbarFuer: 'Sichtbar für',
    gibtEsNichtMehr: 'Diesen Post gibt es nicht mehr',
    abgelaufenOderGeloescht: 'Vielleicht ist er abgelaufen oder wurde gelöscht.',
  },

  /** Anfragen — jemand will mitkommen. */
  anfrage: {
  },

  /** Das eigene Konto. */
  konto: {
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

  /**
   * Der Rechtstext — Nutzungsbedingungen, Hausregeln, Rechtliches.
   *
   * 🔴 **Das ist der Bildschirm, den ein Guideline-1.2-Prüfer öffnet**, und die
   * Regeln darin sind eine Zusage in Ians Namen. Die deutschen Sätze sind
   * unverändert; die englischen sind WÖRTLICH TREU übersetzt und nicht neu
   * formuliert. **Eine Vorrang-Klausel („im Zweifel gilt die deutsche Fassung")
   * steht hier absichtlich NICHT** — das wäre eine Rechtsaussage, und die darf
   * Claude nicht erfinden (`_FUER_IAN/OFFENE_SACHEN.md`, Punkt 1).
   * ⚠️ Ian gehört vorgelegt, dass die Regeln jetzt auch auf Englisch gelten.
   */
  regeln: {
    titel: 'Nutzungsbedingungen',
    einleitung:
      '{app} ist dafür da, Leute zu treffen, die gerade dasselbe vorhaben. Damit das funktioniert, gelten ein paar Regeln.',
    wasGilt: 'Was hier gilt',
    rechtliches: 'Rechtliches',
    keinDating: 'Das hier ist kein Dating',
    keinDatingText:
      'Wer {app} als Dating-App benutzt, fliegt raus. Das ist keine Geschmacksfrage, sondern der Grund, warum die App existiert — man soll „Bin dabei" drücken können, ohne sich zu fragen, was gemeint ist.',
    duBistDu: 'Du bist du',
    duBistDuText:
      'Echter Name, echtes Alter, echtes Bild. Wer sich für jemand anderen ausgibt, macht jedes Treffen unsicher, an dem er teilnimmt.',
    zusagenGelten: 'Zusagen gelten',
    zusagenGeltenText:
      'Wenn du bestätigt hast, kommst du — oder du sagst rechtzeitig im Chat ab. Nicht aufzutauchen ist das Einzige, was diese App wirklich kaputt machen kann.',
    keineWerbung: 'Keine Werbung',
    keineWerbungText:
      'Posts sind Verabredungen, keine Anzeigen. Nichts verkaufen, nichts bewerben, niemanden anwerben.',
    oeffentlichTreffen: 'Triff dich zuerst öffentlich',
    oeffentlichTreffenText:
      'Beim ersten Mal an einem Ort, an dem andere Leute sind. Sag jemandem, wo du hingehst. Das ist keine Vorschrift, sondern der Rat, den dir jeder geben würde.',
    meldenStattStreiten: 'Melden statt streiten',
    meldenStattStreitenText:
      'Wenn jemand sich danebenbenimmt: melden und blockieren. Beides erfährt die andere Person nicht. {zusage}',
    betreiber:
      '{app} wird betrieben von {betreiber}, {stadt}. Bei Fragen, Beschwerden oder allem, was mit deinen Daten zu tun hat: {kontakt} — da antwortet ein Mensch.',
    alter:
      'Mitmachen darfst du ab {alter}. In Österreich brauchst du bis zu deinem 14. Geburtstag die Zustimmung deiner Eltern, damit deine Daten verarbeitet werden dürfen — frag sie, bevor du ein Konto anlegst.',
    regelbruch:
      'Hältst du dich nicht an die Regeln oben, kann dein Konto entfernt werden. Jede Meldung wird von einem Menschen gelesen, {zusage}',
    datenschutzTitel: 'Datenschutzerklärung',
    datenschutzText:
      'Welche Daten gespeichert werden, wofür, wie lange — und was beim Löschen passiert.',
    lizenzTitel: 'Lizenzvertrag',
    lizenzText: 'Für die Nutzung der App gilt Apples Standard-Lizenzvertrag.',
    hilfeTitel: 'Hilfe und Kontakt',
    hilfeText: 'Häufige Fragen, und wie du jemanden meldest oder blockierst.',
    prototypFassung: 'Prototyp, noch nicht öffentlich',
    oeffnetImBrowser: '{titel} — öffnet {url} im Browser',
  },

  /**
   * Die Moderations-Zusage. Gehört `features/safety/meldung.ts` (harte Regel 100) —
   * **die FRISTEN bleiben dort**, hier steht nur der Wortlaut drumherum.
   */
  zusage: {
    text:
      'Wir sehen uns jede Meldung an. Geht es um Gefahr oder Belästigung, innerhalb von {dringend} Stunden — bei allem anderen innerhalb von {gewoehnlich} Stunden.',
  },

  /** Der Melde-Bildschirm. */
  melden: {
    vonDir: 'Das ist von dir',
    gibtEsNicht: 'Das gibt es nicht',
    eigenesNichtMelden: 'Eigene Posts und sich selbst kann man nicht melden.',
    vielleichtWeg: 'Vielleicht ist es inzwischen verschwunden.',
    wasIstLos: 'Was ist los?',
    nochEtwas: 'Noch etwas dazu?',
    wasGenau: 'Was genau passiert ist',
    melden: 'Melden',
    personErfaehrtNicht: 'Die Person erfährt nicht, dass du sie gemeldet hast.',
    verfasserErfaehrtNicht: 'Der Verfasser erfährt nicht, dass du den Post gemeldet hast.',
    schonGemeldet: 'Das hast du schon gemeldet',
    dankeAngekommen: 'Danke, das ist angekommen',
    zweiteMeldung: 'Eine zweite Meldung ändert nichts. Deine erste liegt vor.',
    schauenAn: 'Wir schauen uns das an. Eine Rückmeldung darauf gibt es nicht.',
    aendertNichts:
      'Melden allein ändert nichts daran, dass ihr euch weiter seht. Wenn du das nicht willst:',
    personBlockieren: 'Person blockieren',
    zurueckZumFeed: 'Zurück zum Feed',
  },

  /**
   * Die Melde-Gründe. Gehören `config/melden.ts` — **welcher Grund bei welchem
   * Ziel steht, bleibt dort.** ⚠️ `spam` und `fake` haben je Ziel eine ANDERE
   * Erklärung; deshalb zwei Schlüssel, nicht einer.
   */
  meldegrund: {
    spamTitel: 'Spam oder Werbung',
    spamPost: 'Verkauft etwas oder wirbt für etwas',
    spamPerson: 'Schreibt oder postet nur Werbung',
    inhaltTitel: 'Unangemessener Inhalt',
    inhaltText: 'Beleidigend, verstörend oder für hier zu heftig',
    datingPostTitel: 'Gemeint als Anmache',
    datingPostText: 'Liest sich wie eine Dating-Anzeige — dafür ist {app} nicht da',
    datingPersonTitel: 'Macht mich an',
    datingPersonText: 'Behandelt die App wie eine Dating-App',
    fakePostTitel: 'Gibt es so nicht',
    fakePostText: 'Erfundenes Treffen oder falsche Angaben',
    fakePersonTitel: 'Fake-Profil',
    fakePersonText: 'Ist offensichtlich nicht, wer da steht',
    gefahrTitel: 'Könnte gefährlich werden',
    gefahrText: 'Ort, Uhrzeit oder Vorhaben sind unsicher',
    belaestigungTitel: 'Belästigt mich',
    belaestigungText: 'Bedrängt, beleidigt oder hört nicht auf zu schreiben',
    unsicherTitel: 'Ich fühle mich unsicher',
    unsicherText: 'Verhalten, bei dem jemand zu Schaden kommen könnte',
    anderesTitel: 'Etwas anderes',
    anderesText: 'Passt in keinen der Punkte oben',
  },

  /** Konto löschen — Guideline 5.1.1(v), der Prüfer sucht das gezielt. */
  loeschen: {
    /**
     * Die vier Zeilen, die zeigen, was verschwindet.
     *
     * ⚠️ **Einzahl und Mehrzahl sind je zwei Schlüssel** — und hier ist die
     * Einzahl wirklich erreichbar (ein Post, ein Chat). Englisch braucht dazu
     * nicht nur ein `s`: „1 connection" gegen „2 connections".
     */
    einPost: 'Post',
    mehrerePosts: 'Posts',
    postsZusatz: 'auch abgelaufene',
    einChat: 'Chat',
    mehrereChats: 'Chats',
    chatsZusatz: 'mit allen Nachrichten',
    eineAnfrage: 'Anfrage',
    mehrereAnfragen: 'Anfragen',
    anfragenZusatz: 'die du geschickt hast',
    eineVerbindung: 'Verbindung',
    mehrereVerbindungen: 'Verbindungen',
    verbindungenZusatz: '{follower} Follower · du folgst {folgt}',
    hierWaereSchluss: 'Hier wäre Schluss',
    prototypNichts:
      'Im echten Betrieb wäre dein Konto jetzt weg und du wärst abgemeldet. Im Prototyp gibt es noch keine Konten — es ist nichts gelöscht worden.',
    duBist:
      'Du bist {name} ({handle}). Wenn du dein Konto löschst, ist das endgültig — es gibt keinen Weg zurück.',
    wirklich: 'Wirklich löschen?',
    nichtRueckgaengig:
      'Das lässt sich nicht rückgängig machen. Dein Konto bei {app} und alles oben ist danach weg.',
    jaEndgueltig: 'Ja, Konto endgültig löschen',
    dochNicht: 'Doch nicht',
  },
} as const;
