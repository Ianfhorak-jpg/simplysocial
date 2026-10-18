/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  ENGLISH — the translation of `de.ts`
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * `Weiter<typeof de>` erzwingt **dieselben Schlüssel** wie `de.ts` — fehlt einer,
 * ist einer zu viel oder heißt einer anders, meldet `npx tsc --noEmit` genau den.
 * Die TEXTE sind frei, nur die Struktur ist gebunden.
 *
 * ── Woher die Wörter kommen ──────────────────────────────────────────────────
 * Die Begriffe stehen in **`WOERTERBUCH`/`WOERTER.md`** und sind Ians Entscheidung
 * vom 2026-10-17 — `host` (nicht „poster", das ist auf Englisch ein Plakat),
 * `meet-ups` (nicht „meetings", das klingt nach Büro), `district`, `Vienna`,
 * und der Ton ist das Lockere (`I'm in`, nicht `I will attend`). Abgeleitet, nicht
 * geraten: Die deutsche App sagt „Bin dabei" und nicht „Ich nehme teil".
 *
 * ⚠️ **Das lokale Modell (`lokal`, gemma4:12b) übersetzt gut, aber es RÄT die
 * Begriffe.** Im Probelauf am 2026-10-17 lagen 6 von 8 Zeilen richtig; die zwei
 * falschen waren beide Begriffsfragen (`poster`, `meetings`), keine
 * Übersetzungsfehler. Deshalb geht kein Block ungelesen hier hinein.
 */
import type { de } from './de';

/**
 * Macht aus den festen Texten von `de.ts` wieder gewöhnliche Strings — sonst
 * verlangte der Typ hier **wörtlich den deutschen Satz**.
 *
 * `de.ts` endet auf `as const`, damit die Punkt-Pfade in `index.ts` entstehen.
 * Dadurch ist der Typ jedes Blattes aber nicht `string`, sondern der eine Satz,
 * der dort steht. `Weiter` dreht genau das zurück: Struktur gebunden, Wortlaut frei.
 */
type Weiter<T> = {
  -readonly [K in keyof T]: T[K] extends string ? string : Weiter<T[K]>;
};

export const en: Weiter<typeof de> = {
  marke: {
    // ⚠️ **Markentext — das ist Ians Stimme, nicht meine.** „jetzt Lust haben"
    // ist im Deutschen beiläufig und auf Englisch schwer zu halten; „up for it
    // right now" trifft es am nächsten. Es ist der ERSTE Satz, den ein
    // Apple-Prüfer liest, deshalb steht hier etwas statt einer Lücke — aber er
    // gehört vorgelegt (wie der Leitsatz in `i18n/WOERTER.md`).
    claim: 'Find people who are up for it right now.',
  },

  gemein: {
    abbrechen: 'Cancel',
    fertig: 'Done',
    weiter: 'Next',
    zurueck: 'Back',
    nochmal: 'Try again',
    verstanden: 'Got it',
  },

  anmelden: {
    momentBitte: 'One moment …',
    // Apples eigene Wortwahl. „Continue with Apple" ist eine der vom
    // Sign-in-with-Apple-Leitfaden erlaubten Beschriftungen — eine freie
    // Übersetzung wäre hier ein Markenverstoß, kein Geschmack.
    mitApple: 'Continue with Apple',
    mitGoogle: 'Continue with Google',
    // Modell: „With email code" — als Knopf holprig, weil ihm das Verb fehlt.
    mitEmailCode: 'Use an email code',
    emailHinweis: "We'll send you a number, not a password.",
    nurAmHandy: 'Only works in the phone app.',
    // Modell: „Comes with the account — without function in the prototype."
    // Deutsche Wortstellung, und „without function" ist kein Englisch.
    ohneKonto: 'Comes with accounts — not working in the prototype yet.',
    weiterAlsIan: 'Continue as Ian',
    attrappeHinweis: 'There are no accounts in the prototype — this is the only way in.',
    emailFeld: 'Your email',
    // Die Endung bleibt `.at`: Die App ist für Wien, und ein Beispiel soll
    // aussehen wie die Adressen der Leute, die es lesen.
    emailPlatzhalter: 'you@example.at',
    codeSchicken: 'Send code',
    wirdGeschickt: 'Sending …',
    // Modell: „We sent you a number to {email}" — „send someone something TO
    // an address" geht im Englischen nicht zusammen.
    codeGeschickt: "We've sent a number to {email}.",
    codeFeld: 'The number from the email',
    codePlatzhalter: '123456',
    // **Nicht `gemein.weiter` („Next").** Hier ist es ein Absenden-Knopf, kein
    // Schritt in einer Folge — dasselbe deutsche Wort, zwei englische.
    weiter: 'Continue',
    // Modell: „Log in differently". Verständlich, aber kein Satz, den jemand sagt.
    dochAnders: 'Sign in another way',
    andereAdresse: 'Another address',
  },

  feed: {
    leerMitFilter: 'Nothing going on with this filter',
    binDabei: "I'm in",
    zurueckKarte: 'Back to the map',
    posten: 'Post',
    etwasPosten: 'Post something',
    stapelDurch: "That's the whole stack",
    allesFuerHeute: "That's it for today",
    // Hier heisst „Rückgängig" WIRKLICH rückgängig — ein Wisch wird zurückgeholt.
    // (Anders als `einstellungen.aufheben`, wo es eine Blockierung aufhebt.)
    rueckgaengig: 'Undo',
    weggewischt: '"{titel}" swiped away',
    zumFeed: 'Go to feed',
  },

  filter: {
    alle: 'All',
    // Gefiltert wird über eine Spanne von Jahrgängen. „Certain birth years" wäre
    // wörtlich und unverständlich; in einem Filter liest sich die Altersspanne.
    bestimmteJahrgaenge: 'Specific age range',
    alleZuruecksetzen: 'Reset all filters',
    zuruecksetzen: 'Reset filters',
  },

  kategorie: {
    sport: 'Sport',
    essen: 'Food',
    lernen: 'Study',
    kultur: 'Culture',
    draussen: 'Outdoors',
    kreativ: 'Creative',
  },

  niveau: {
    egal: "Any level",
    anfaenger: 'Beginner',
    fortgeschritten: 'Intermediate',
    sehrGut: 'Advanced',
  },

  anfragen: {
    freiVon: '{frei} of {gesamt} spots left',
    allePlaetzeVergeben: 'All spots taken',
    vollHinweis:
      'All spots are taken. The request stays — if someone drops out, you can confirm it.',
    ohneNachricht: 'Asked without a message.',
    ablehnen: 'Decline',
    bestaetigen: 'Confirm',
    // „Aufnehmen" heisst: jemanden in DEINE Gruppe lassen. Gegenstück zu
    // „Decline", deshalb „Approve" — nicht „Accept", das steht unten für den
    // umgekehrten Fall (man nimmt selbst eine Einladung an).
    aufnehmen: 'Approve',
    neinDanke: 'No thanks',
    annehmen: 'Accept',
    niemandMitmachen: 'Nobody wants in yet',
    niemandMitmachenHinweis:
      'When someone taps "I\'m in" on one of your posts, they show up here — and you decide.',
    nirgendsZugesagt: "You haven't joined anything yet",
    imFeedWasDabei: "There's bound to be something in the feed.",
  },

  chat: {
    gruppen: 'Groups',
    nochKeinChat: 'No chats yet',
    nochKeinChatHinweis:
      'Once someone confirms your request — or you confirm one — the chat shows up here. And if you follow each other, you can message directly: the button for that is on their profile.',
  },

  profil: {
    einstellungen: 'Settings',
    fuss: 'Blocked people · Terms of Use · Delete account',
  },

  // ⚠️ **Von Claude übersetzt, nicht vom lokalen Modell.** `lokal` ist bei diesem
  // Block viermal in Folge still hängen geblieben (kein Prozess, leere Datei) —
  // nach der Regel in CLAUDE.md macht die Haupt-KI es dann selbst und sagt es.
  bild: {
    // Umgedreht gebaut: Deutsch stellt das Bild voran, Englisch den Handelnden.
    offenAlle: 'Anyone using {app} can see your photo.',
    offenTausch: 'If you swap it, the old one is gone everywhere within {min} minutes.',
    kontoWeg: 'Delete your account and your photo goes with it.',
    linksAblauf: 'Forwarded links expire after an hour.',
    // „have plans with you" — nicht „are meeting you": Die Verabredung steht, das
    // Treffen hat noch nicht stattgefunden. Genau dieser Unterschied ist die App.
    nurFollower: 'Only people who follow you or have plans with you can see your photo.',
    andereBuchstaben: 'Everyone else sees your initials.',
    nurFormate: 'Only JPG, PNG or WebP work.',
    zuGross: 'That photo is too big — {mb} MB is the limit.',
    keinZugriff:
      "Your photos couldn't be opened. Check in Settings whether {app} is allowed to access them.",
    nichtUmwandelbar:
      "Your phone couldn't convert this photo. Try another one — this happens with Live Photos and RAW.",
    nichtVorbereitet: "The photo couldn't be prepared. A smaller one usually helps.",
    // „Sag Ian Bescheid" bleibt sinngemäss: Es ist eine echte Anweisung an den
    // Menschen davor, kein Platzhalter — und Ian ist der Betreiber (Entscheidung 112).
    hochladenUnerwartet: 'The upload failed unexpectedly. Please let Ian know.',
  },

  post: {
    // „host", nicht „poster" — ein `poster` ist auf Englisch ein Plakat.
    posterBestaetigt: 'The host confirmed you',
    bezirkFrage: 'Which district are you in?',
  },

  anfrage: {
    zuSpaet: 'Too late — the spot is gone',
  },

  konto: {
    // „meet-ups", nicht „meetings" — Letzteres klingt nach Büro.
    treffenGezaehlt: 'Meet-ups that actually happened',
    loeschenWarnung: "This can't be undone",
  },

  einstellungen: {
    spracheTitel: 'Language',
    // „photo", nicht „image": Es ist ein Profilbild von einem Menschen.
    deinBild: 'Your photo',
    bildEntfernen: 'Remove photo',
    // Modell: „Selecting an image is not yet possible … It is already available …"
    // Zweimal „available" und durchweg Beamtendeutsch auf Englisch.
    bildwahlLaeuft:
      "Picking a photo doesn't work on the phone yet — that comes with the next app update. It already works in the browser.",
    deinBezirk: 'Your district',
    // Modell: „From here, your feed is sorted by outward" — kein Englisch.
    bezirkHinweis: 'Your feed sorts outward from here',
    heimatbezirk: 'Your home district',
    blockiert: 'Blocked',
    niemandBlockiert: "You haven't blocked anyone.",
    blockierenWo: "You can block someone from their profile.",
    // 🔴 Modell: „Undo". **Bedeutungsfehler, kein Sprachfehler:** Dieser Knopf
    // hebt eine BLOCKIERUNG auf (`entblocken()`), er macht nichts rückgängig.
    // „Undo" neben einem Namen in einer Blockierliste hätte jeder falsch gelesen.
    aufheben: 'Unblock',
    // Apples eigene Schreibweise in Store und System.
    nutzungsbedingungen: 'Terms of Use',
    nutzungsbedingungenHinweis: 'The rules here, and the minimum age',
    deinKonto: 'Your account',
    // „Sign out" und nicht „Log out" — weil der Anmelde-Bildschirm „Sign in"
    // sagt (`anmelden.dochAnders`). Zwei Wörter für dieselbe Tür wären eines zu viel.
    abmelden: 'Sign out',
    abmeldenHinweis: 'Back to the {app} sign-in',
    accountLoeschen: 'Delete account',
    accountLoeschenHinweis: 'Your profile, your posts and your chats',
    fuerEntwicklung: 'For development',
    // Modell: „View building blocks" — wörtlich. Gemeint sind die UI-Bausteine,
    // und das Wort dafür ist im Englischen „components".
    bausteine: 'View components',
    bausteineHinweis: 'All elements of the app side by side',
    postFassungen: 'Compare post versions',
    postFassungenHinweis: 'Three drafts side by side — pick one',
  },

  standort: {
    anTitel: 'From your location',
    // Modell: „Your feed sorted from where you are" — falsche Zeitform.
    anAusgangspunkt: 'Your feed sorts from where you are right now. Nobody sees your location.',
    anBezirk: 'Your district is set automatically. Nobody sees your location.',
    ausTitel: 'Location is off',
    // Modell: „You declined this — this is changed in your phone's settings."
    // Passiv und unpersönlich; die App spricht die Person an.
    verweigert:
      "You turned this down — you can change that in your phone's settings. Your feed keeps sorting from your district.",
    // 🔴 Modell: „Location does not exist here". Gemeint ist: **auf dieser
    // Plattform gibt es keinen Standort** (Browser) — nicht, dass es den Ort nicht gibt.
    unmoeglichTitel: "Location isn't available here",
    unmoeglich: 'Your feed sorts from your district.',
    ausErklaerung:
      'Instead of your district, your feed will sort from where you are right now. Your location is never shown and never saved.',
  },

  // 🔴 **WÖRTLICH TREU übersetzt, nicht neu formuliert.** Das ist der Bildschirm,
  // den ein Guideline-1.2-Prüfer öffnet, und die Regeln sind eine Zusage in Ians
  // Namen. Keine Glättung, keine Zusätze — und ausdrücklich KEINE Vorrang-Klausel.
  regeln: {
    titel: 'Terms of Use',
    einleitung:
      '{app} is for meeting people who are up for the same thing right now. A few rules keep that working.',
    wasGilt: 'The rules here',
    rechtliches: 'Legal',
    keinDating: "This isn't a dating app",
    keinDatingText:
      'Use {app} as a dating app and you\'re out. That\'s not a matter of taste — it\'s why the app exists: you should be able to tap "I\'m in" without wondering what someone meant by it.',
    duBistDu: 'Be yourself',
    duBistDuText:
      'Real name, real age, real photo. Anyone pretending to be someone else makes every meet-up they join unsafe.',
    // „Zusagen gelten" wörtlich wäre „commitments apply" — richtig und tot.
    zusagenGelten: 'A yes is a yes',
    zusagenGeltenText:
      "If you've confirmed, you show up — or you cancel in the chat in good time. Not showing up is the one thing that can really break this app.",
    keineWerbung: 'No advertising',
    keineWerbungText:
      "Posts are plans, not ads. Don't sell anything, don't promote anything, don't recruit anyone.",
    oeffentlichTreffen: 'Meet in public the first time',
    oeffentlichTreffenText:
      "The first time, pick somewhere with other people around. Tell someone where you're going. That's not a rule, it's the advice anyone would give you.",
    meldenStattStreiten: "Report, don't argue",
    meldenStattStreitenText:
      'If someone behaves badly: report and block. The other person is told about neither. {zusage}',
    betreiber:
      '{app} is run by {betreiber}, {stadt}. For questions, complaints or anything to do with your data: {kontakt} — a human answers.',
    // ⚠️ Die österreichische Rechtslage bleibt benannt wie sie ist. „14. Geburtstag"
    // ist kein runder Satz auf Englisch, aber eine Glättung wäre hier eine
    // inhaltliche Änderung.
    alter:
      "You can join from age {alter}. In Austria, until your 14th birthday you need your parents' consent for your data to be processed — ask them before you create an account.",
    regelbruch:
      "If you don't follow the rules above, your account can be removed. Every report is read by a human, {zusage}",
    datenschutzTitel: 'Privacy Policy',
    datenschutzText:
      'What data is stored, what for, how long — and what happens when you delete.',
    // Britisches „licence", weil der Rest der App britisch schreibt
    // („behaviour" unten) — eine App für Wien ist näher an britischem Englisch.
    lizenzTitel: 'Licence agreement',
    lizenzText: "Apple's standard licence agreement applies to use of this app.",
    hilfeTitel: 'Help and contact',
    hilfeText: 'Common questions, and how to report or block someone.',
    prototypFassung: 'Prototype, not public yet',
    oeffnetImBrowser: '{titel} — opens {url} in the browser',
  },

  zusage: {
    text:
      "We look at every report. If it's about danger or harassment, within {dringend} hours — for everything else within {gewoehnlich} hours.",
  },

  melden: {
    wasIstLos: "What's going on?",
    nochEtwas: 'Anything to add?',
    wasGenau: 'What exactly happened',
    melden: 'Report',
    personErfaehrtNicht: "The person won't be told you reported them.",
    verfasserErfaehrtNicht: "Whoever posted it won't be told you reported it.",
    schonGemeldet: "You've already reported this",
    dankeAngekommen: 'Thanks, we got it',
    zweiteMeldung: 'A second report changes nothing. Your first one is on file.',
    schauenAn: "We'll look into it. You won't get a reply about it.",
    aendertNichts:
      "Reporting on its own doesn't stop you seeing each other. If you'd rather not:",
    personBlockieren: 'Block this person',
    zurueckZumFeed: 'Back to the feed',
  },

  meldegrund: {
    spamTitel: 'Spam or advertising',
    spamPost: 'Selling or promoting something',
    spamPerson: 'Only messages or posts ads',
    inhaltTitel: 'Inappropriate content',
    inhaltText: 'Offensive, disturbing or too much for here',
    datingPostTitel: 'Meant as a pick-up',
    datingPostText: "Reads like a dating ad — that's not what {app} is for",
    datingPersonTitel: 'Hitting on me',
    datingPersonText: 'Treating the app like a dating app',
    fakePostTitel: 'Not a real thing',
    fakePostText: 'Made-up meet-up or false details',
    fakePersonTitel: 'Fake profile',
    fakePersonText: "Clearly isn't who they say they are",
    gefahrTitel: 'Could get dangerous',
    gefahrText: "The place, time or plan isn't safe",
    belaestigungTitel: 'Harassing me',
    belaestigungText: "Pressuring, insulting or won't stop messaging",
    unsicherTitel: 'I feel unsafe',
    unsicherText: 'Behaviour that could get someone hurt',
    anderesTitel: 'Something else',
    anderesText: "Doesn't fit any of the above",
  },

  loeschen: {
    hierWaereSchluss: 'This would be the end',
    prototypNichts:
      "In real use your account would now be gone and you'd be signed out. There are no accounts in the prototype — nothing has been deleted.",
    duBist:
      "You're {name} ({handle}). Deleting your account is final — there's no way back.",
    wirklich: 'Really delete?',
    nichtRueckgaengig:
      "This can't be undone. Your {app} account and everything above is gone afterwards.",
    jaEndgueltig: 'Yes, delete my account for good',
    dochNicht: 'Never mind',
  },
};
