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

  /** Eine Aktivität einstellen — der Kern-Ablauf der App. */
  erstellen: {
    kategorieFehler: 'Wähle aus, worum es geht.',
    titelFehler: 'Ein paar Wörter, damit man weiß, was los ist.',
    sichtFehler: 'Wähle die Gruppe aus, für die der Post gedacht ist.',
    worumGehtEs: 'Worum geht es?',
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
    posterBestaetigt: 'Der Poster hat dich bestätigt',
    bezirkFrage: 'In welchem Bezirk bist du unterwegs?',
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
