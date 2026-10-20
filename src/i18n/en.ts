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
    // Ians Wörterliste vom 2026-10-17: die Stadt heisst auf Englisch „Vienna".
    // ⚠️ Das ist die ANZEIGE, nicht `BRAND.city` — das bleibt die Tatsache „Wien".
    stadt: 'Vienna',
  },

  gemein: {
    abbrechen: 'Cancel',
    fertig: 'Done',
    zurueck: 'Back',
    verstanden: 'Got it',
    und: 'and',
  },

  stand: {
    wartet: 'Pending',
    dabei: "You're in",
    // Nicht dasselbe Wort wie oben: Eine Gruppe verlässt man wieder, eine
    // Zusage läuft ab. „Member" trägt die Dauer, die „in" nicht hat.
    drin: "You're a member",
    abgelehnt: 'Not this time',
  },

  zeit: {
    heute: 'Today',
    morgen: 'Tomorrow',
    gestern: 'Yesterday',
    seit: 'Since {zeit}',
    seitKlein: 'since {zeit}',
    geradeEben: 'just now',
    // „min" bleibt abgekürzt wie im Deutschen — die Angabe steht in engen
    // Zeilen neben einem Namen. „hour" wird ausgeschrieben, weil „1 hr" in
    // einem Fließtext wie eine Maßeinheit aussieht, nicht wie eine Zeitangabe.
    vorMin: '{n} min ago',
    vorStunde: '1 hour ago',
    vorStunden: '{n} hours ago',
    vorEinemTag: 'yesterday',
    vorTagen: '{n} days ago',
  },

  anmelden: {
    momentBitte: 'One moment …',
    nurInApp: 'That only works in the phone app. Use email here.',
    wegNichtEingerichtet: "This way isn't set up right now. Use email.",
    anbieterNichts: "The provider didn't send anything back. Give it another try.",
    ginNichtNetz: "That didn't work just now. Check your connection and try again.",
    codeFalsch: "That code is wrong or expired. Request a new one.",
    zuSchnell: 'That was a bit too fast. Try again in a few minutes.',
    adresseFalsch: "That address doesn't look right.",
    kontenZu: 'New accounts are closed right now.',
    mailOderPasswort: "Email or password isn't right.",
    kontoNichtBestaetigt: "This account hasn't been confirmed yet.",
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
    stapelDurchFilter: 'With a different filter there may be more cards waiting.',
    stapelDurchAlles: "Everything you've seen is still in the list below.",
    nichtsDa: 'Nothing for that right now',
    nichtsDaFilter: 'A different filter might turn up more.',
    nochNichtsLos: 'Nothing in your feed yet',
    posteSelbst: 'Post something yourself — someone always has time.',
    // „I'm in" ist Ians Wort für „Bin dabei" (WOERTER.md) — hier mit Gruß davor.
    grussMitName: "Hey {name}! I'm in",
    gruss: "Hey! I'm in",
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

  gruppe: {
    gibtEsNichtMehr: 'This group is gone.',
    // „Gründer" durchgehend „founder" — nicht „owner" oder „admin": Er hat sie
    // gegründet, und das ist in diesem Modell seine einzige Sonderstellung.
    vielleichtAufgeloest: 'The founder may have dissolved it.',
    leuteEinladen: 'Invite people',
    fuerGruppePosten: 'Post for the group',
    wasGeradeLaeuft: "What's on right now",
    jaVerlassen: 'Yes, leave',
    gruppeVerlassen: 'Leave group',
    anfragenAnsehen: 'View requests',
    blockiertZumGruender: "There's a block between you and this group's founder.",
    einladungSofortDabei:
      "Accept and you're in right away — the founder doesn't have to confirm anything.",
    anfrageGeschicktGruender: 'Request sent · the founder still has to confirm',
    solangeNichtSichtbar: "Until then you can't see what's on in the group.",
    anfrageZurueckziehen: 'Withdraw request',
    bleibtZu: "What's on here and who's in stays closed.",
    erstAlsMitglied:
      "You'll see what's on in this group once you're a member. Ask to join — the founder confirms and you're in.",
    kurzDazuschreiben: 'Add a short note',
    // „Servus" ist wienerisch und hat kein englisches Gegenstück, das so klingt.
    // „Hi" ist der Ton, den ein englischsprachiger Wiener hier schreiben würde.
    dazuschreibenPlatzhalter: "Hi! I'd like to join.",
    beitrittAnfragen: 'Ask to join',
    einladen: 'Invite',
    gruender: 'Founder',
    duBistGruender:
      "You'll be the founder. You confirm requests from outside; later, anyone inside can invite.",
    name: 'Name',
    // Ein Ortsname in Wien bleibt, wie er heisst — wie die Donauinsel.
    namePlatzhalter: 'Marswiese Tennis',
    beschreibung: 'Description',
    beschreibungPlatzhalter: 'We usually play at weekends.',
    offenHinweis: 'The group is listed. Anyone who wants in asks — you confirm.',
    privatHinweisNeu:
      "The group isn't listed. The only way in is an invite from someone inside.",
    nameFehler: 'A name people will recognise the group by.',
    bezirkFehler: 'Four digits, e.g. 1070 — or leave it empty.',
    gruppeErstellen: 'Create group',
    werDabeiIst: "Who's in",
    wenHolen: 'Who do you want to bring in?',
    duHastSieAufgemacht: 'You started it.',
    aufgemachtVon: 'Started by {name}.',
    hatDichEingeladen: '{name} invited you',
    auchAngefragt: "You also asked to join. If you accept, that takes care of it.",
    einMitglied: '1 member',
    mehrereMitglieder: '{anzahl} members',
  },

  gruppenregel: {
    hatAufgehoert:
      'This group is gone. It dissolved when the last person left.',
    privat: 'This group is private. The only way in is an invite from someone inside.',
    nurEinladung: 'The only way into this group is an invite from someone inside.',
    privatKurz: 'Private — only people who are invited get in.',
    austrittPostsWeg: 'You\'ll no longer see posts from "{gruppe}".',
    austrittNurNeueAnfrage: 'The only way back is a new request.',
    austrittAufgeloest: 'The group is dissolved for everyone — the other members too.',
    austrittWeitergabe:
      'The group passes to {name} — whoever has been in longest takes it on.',
    austrittAllein: "You're the only one in the group, so it will be dissolved.",
    austrittBleibtOhneGruender:
      'The group stays, but nobody can confirm new members any more.',
    austrittPostsBleiben: 'Your posts for this group carry on as normal.',
    austrittPostsWegGeloescht:
      'Your posts for this group are deleted — including meet-ups people agreed to.',
    austrittPostsOeffentlich: 'Your posts for this group become publicly visible.',
  },

  tabs: {
    start: 'Home',
    chats: 'Chats',
    profil: 'Profile',
  },

  stapel: {
    // „Weg" ist der Wisch nach links. „Pass" ist das Wort, das englische Apps
    // dafür nehmen — „Away" wäre eine Richtung, keine Entscheidung.
    weg: 'Pass',
    soFunktioniert: 'How the stack works',
    nachLinks: "Swipe left if it's not for you.",
    nachRechts: "Swipe right if you're in.",
    probierAus:
      'Try it on this card. Whoever posted it then decides who comes along — nothing happens until then.',
    oderSchieben: 'Or just push the card aside.',
    duBistDabei: "You're in",
    einPlatzFrei: '1 spot left',
    mehrerePlaetzeFrei: '{anzahl} spots left',
    allesDurch: "That's everything",
    bezirkDurch:
      "You've seen everything in this district. There might be something going on next door — check the map.",
    ganzeStadt: 'All of {stadt}',
  },

  filterTitel: {
    kategorie: 'Category',
    wann: 'When',
    vonDerKarte: 'From the map',
    // Gefiltert wird nach Jahrgang; die Überschrift sagt auf Englisch, was man
    // damit tut — „Birth year" wäre richtig und im Filter unlesbar.
    jahrgang: 'Age',
    alterEgal: 'Any age',
    fuerAlle: 'For everyone',
  },

  erstesKonto: {
    wieHeisstDu: "What's your name?",
    bezirkGrund: "We use it to sort what's going on near you.",
    haekchenFehlt: 'Just tick the box and off we go.',
    passwort: 'Password',
    fastGeschafft: 'Almost there',
    dreiSachen: "Three things and you're in.",
    losGehts: "Let's go",
    deinVorname: 'Your first name',
    woWohnstDu: 'Where do you live?',
    welcherJahrgang: 'Which year were you born?',
    jahrgangOffen: 'Shown openly on your profile.',
    ginNichtNochmal: "That didn't work just now. Give it another try.",
  },

  antwort: {
    dazuschreiben: 'Add a short note (optional)',
    schicken: 'Send',
    dochNicht: 'Never mind',
  },

  zuschnitt: {
    schiebUndZieh: 'Drag and pinch the photo until the circle shows what you want.',
    nurImKreis: 'Only what sits inside the circle is saved — the rest is gone.',
    ausschnittWaehlen: 'Choose the crop',
    uebernehmen: 'Use this',
  },

  match: {
    allesKlar: 'Got it',
    nichtsZuFeiern: 'Nothing to celebrate right now',
    bestaetigungWeg:
      "This match screen belongs to a confirmation that doesn't exist any more.",
    zuDenAnfragen: 'Go to requests',
  },

  gruppenliste: {
    inEinerGruppe: "You're in one group. You can post just for them.",
    inMehrerenGruppen: "You're in {anzahl} groups. You can post just for them.",
    wasIstEineGruppe:
      'A group is a small circle in {stadt} you can post to directly.',
    nochKeine: "There's no group here yet. Start the first one.",
    niemandEinladbar:
      "You can invite people you follow or who follow you. Right now that's nobody — follow someone and they'll show up here.",
    gruppeLeer:
      "Nothing right now. These posts also appear in the normal feed — here you just see them together.",
    titel: 'Groups',
    angefragt: 'Requested',
    duBistEingeladen: "You're invited",
    ausGruppeGeholt:
      "Someone from a group brought you in. Accept and you're in right away.",
  },

  klein: {
    nochNichtsGeschrieben: 'Nothing written yet — go ahead.',
    dasVerschwindet: 'This goes away',
    nochEinmalGefragt: "You'll be asked once more.",
    soSehenEsDieAnderen: 'This is how others see it',
    mehrEinstellen: 'More settings',
    bezirkAntippen: 'Your district: {bezirk} {stadt}. Tap to change.',
    stimmtNichts: 'Something not right here?',
    eingabeLoeschen: 'Clear input',
    bezirkGibtEsNicht: "That district doesn't exist in {stadt}.",
    bezirkPlatzhalter: '1220',
    interessen: 'Interests',
    follower: 'Followers',
    // Zustand des eigenen Profils: „wie vielen folge ich" — nicht „Follows".
    folgt: 'Following',
    treffen: 'Meet-ups',
    netzFehler:
      "We can't reach your activities right now. That's usually the network.",
  },

  chatGesperrt: {
    niemandSchreiben: 'Nobody can write here any more',
    blockierungDazwischen:
      "There's a block between you. What you wrote stays readable.",
  },

  loeschfolgen: {
    postsWeg:
      "Your posts disappear from the feed — including the ones people already said yes to. Those plans are cancelled, and the others aren't told why.",
    chatsWeg: 'Your shared chats disappear along with every message, for the others too.',
    postsBleiben:
      'Your posts and chats stay. Your name is replaced by "Deleted account" — the messages themselves can\'t be removed from other people\'s histories.',
    postsGeteilt:
      "Posts nobody has said yes to disappear. Posts with confirmations stay until they're over, so the plan holds.",
    gruppeAufgeloest: 'Your group is dissolved — for everyone else in it too.',
    gruppenAufgeloest: 'Your groups are dissolved — for everyone else in them too.',
    gruppeGehtAn:
      'Your group stays and passes to {name} — whoever has been in longest takes it on.',
    gruppenGehenAn:
      'Your groups stay and pass to {name} — whoever has been in longest takes them on.',
    gruppeAllein: "Your group is dissolved: you're the only one in it.",
    gruppenAllein: "Your groups are dissolved: you're the only one in them.",
    meldungenBleiben: 'Reports you wrote stay with us — without your name.',
    quittung: 'Your account has been deleted.',
  },

  ersteFragen: {
    nameFehlt: 'Add your name.',
    nameKurz: "That name's a bit short.",
    nameLang: '{max} characters at most.',
    bezirkFehlt: 'Pick your district.',
    bezirkFalsch: "That's not a {stadt} district.",
    jahrgangKeineZahl: 'Just the year, for example 2009.',
    jahrgangSpanne: 'Between {min} and {max}.',
  },

  direkt: {
    gegenseitig:
      'You can message each other once you follow each other. So {name} has to follow you too.',
    schonGetroffen:
      "You can message each other once you've been at an activity together.",
    verwaist: "From an activity that doesn't exist any more.",
  },

  laden: {
    keineVerbindung: 'No connection',
  },

  prototyp: {
    titel: 'This is a prototype',
    text:
      "All names, posts and chats are made up. There's no login — right now you're Ian. Reloading resets everything.",
  },

  fehler: {
    nichtMehrAngemeldet: "You're signed out.",
    nichtMehrAngemeldetTitel: "You're signed out",
    nochmalAnmelden: 'Sign in again and everything is back.',
    anmelden: 'Sign in',
    keinNetzLetzterStand: "No connection — you're seeing the last state.",
    nochmalKurz: 'Retry',
    allesKlar: 'Got it',
    nochmalVersuchen: 'Try again',
    schonGeklappt: 'That already worked.',
    nichtGeklapptNetz: "That didn't work — usually it's the connection.",
    bildSchonWeg: 'Your account is still there — but your profile picture is already gone.',
    programmText: "Something went wrong, and it's not on you.",
    programmTitel: 'Something went wrong',
    programmErklaerung:
      "It's not you and it's not your connection — the bug is in the app itself.",
  },

  doppelt: {
    selbstGepostet: 'You posted “{titel}” {wann} yourself.',
    schonDabei: 'You’re already in for “{titel}” {wann}.',
    undNochEtwas: '{satz} And something else around then.',
    undNochMehrere: '{satz} And {anzahl} other things around then.',
  },

  chat: {
    gruppen: 'Groups',
    nochKeinChat: 'No chats yet',
    nochKeinChatHinweis:
      'Once someone confirms your request — or you confirm one — the chat shows up here. And if you follow each other, you can message directly: the button for that is on their profile.',
  },

  person: {
    // Zustand, nicht Knopf: Deutsch „Du folgst", Englisch „Following" —
    // dasselbe Muster wie bei Instagram, und es liest sich als Zustand.
    duFolgst: 'Following',
    folgen: 'Follow',
    nurFuerFollower: 'Posts that are followers-only.',
    nachricht: 'Message',
    jaBlockieren: 'Yes, block',
    blockieren: 'Block',
    blockierungAufheben: 'Unblock',
    entblockenFolgen:
      "You'll see each other's posts again. What the block took with it doesn't come back — who followed whom, your chat and cancelled plans would have to be redone.",
    blockiertTitel: 'You have blocked this person',
    gibtEsNicht: "This person doesn't exist",
    kontoGeloescht: 'They may have deleted their account.',
    // ⚠️ Vier Schlüssel für zwei Sätze — `is`/`are` lässt sich nicht einsetzen.
    einPostFollower: '1 post is visible to followers only.',
    mehrerePostsFollower: '{anzahl} posts are visible to followers only.',
    einPostGruppe: '1 post is visible to one group only.',
    mehrerePostsGruppe: '{anzahl} posts are visible to one group only.',
  },

  block: {
    postsWeg: "You won't see each other's posts any more.",
    keineAnfragen: 'Requests are no longer possible in either direction.',
    chatWeg: 'Your chat disappears.',
    chatStillgelegt: 'Your chat stays readable, but nobody can write in it any more.',
    chatBleibt: 'Your chat stays as it is.',
    verabredungAbgesagt: 'A confirmed plan gets cancelled.',
    verabredungBleibt: 'A confirmed plan stays — you have to cancel it yourself.',
    merktZusageWeg:
      "The person isn't told that you blocked them — only that the confirmation is gone.",
    merktNichts: "The person isn't told anything about it.",
  },

  chatraum: {
    treffpunktOffen: 'Meeting point still open',
    senden: 'Send',
    verabredetTitel: "You're set",
    nochNichtsGeschrieben:
      'Nobody has written anything yet. A "Hi, still good for you?" is plenty.',
    gibtEsNicht: "This chat doesn't exist",
    treffenWeg: 'It may belong to a meet-up that no longer exists.',
    zuDenChats: 'Go to chats',
  },

  profil: {
    wasDuVorhast: "What you're up to",
    wasVorhat: "What {name} is up to",
    nichtsGeplant:
      "You haven't planned anything right now. What shows up here goes away with the day — just like the feed.",
    nichtsGeplantAndere: "{name} hasn't planned anything right now.",
    nochKeineFollower: 'No followers yet.',
    folgtNochNiemandem: 'Not following anyone yet.',
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

  erstellen: {
    kategorieFehler: "Pick what it's about.",
    titelFehler: "A few words so people know what's up.",
    sichtFehler: 'Pick the group this post is for.',
    wasHastDuVor: "What are you up to?",
    worumGehtEs: "What's it about?",
    titel: 'Title',
    titelPlatzhalter: 'Playing tennis',
    wann: 'When?',
    zeitPlatzhalter: '18:30',
    bezirk: 'District',
    bezirkFreiwillig: 'optional — empty means "somewhere in {stadt}"',
    bezirkPflicht: 'postcode only',
    bezirkPlatzhalter: '1070',
    wieViele: 'How many can come along?',
    duZaehlstNicht: "you don't count yourself",
    // „Können" ist hier das Niveau, nicht die Fähigkeit zu kommen.
    koennen: 'Skill level',
    niemandAbgehaengt: 'so nobody feels left behind',
    fuerWen: "Who's it for?",
    niemandFehlAmPlatz: 'so nobody feels out of place',
    jahrgangHinweis:
      "Your post stays visible to everyone. The age range only says who it's aimed at — and others can filter by it.",
    treffpunkt: 'Meeting point',
    treffpunktPlatzhalter: 'At the entrance to the sports ground',
    nochWas: 'Anything to add?',
    nochWasPlatzhalter: "I've got two rackets, balls too.",
    werSollSehen: 'Who should see it?',
    gruppeSpaeter: "Once you're in a group, you can post just for them here.",
    wieLange: 'Visible for how long?',
    titelInVorschau: 'Your title goes here',
    fehltNochRot: "Something's missing — the red bits.",
    schauNochMal: 'Take another look {felder}.',
    feldKategorie: 'at the category',
    feldTitel: 'at the title',
    feldBezirk: 'at the district',
    feldZeit: 'at the time',
    feldSicht: 'at the group',
    vorschauLeer: 'Pick a category below and your card shows up here.',
    obenInVorschau: 'Time, district, spots — in the preview above',
    bezirkFehlt: 'Which district?',
    // Im Deutschen „ein Wiener Bezirk", im Englischen „a Vienna district" —
    // deshalb steht der Platzhalter hier VOR dem Wort und nicht daran geklebt.
    bezirkFalsch: 'A {stadt} district between 1010 and 1230.',
    zeitFehlt: 'When does it start?',
    zeitFalsch: 'A time like 18:30.',
    zeitVorbei: "That's already passed.",
    sichtFollower: 'Followers',
    sichtNurFollower: 'Only my followers',
    sichtGruppe: 'Group',
    sichtAlleText: 'Everyone in {stadt} sees your post in the feed.',
    sichtFollowerText: "Only people who follow you see it — that's {anzahl} people right now.",
    sichtGruppeText:
      'Only the people in "{gruppe}" see it. It shows in their feed like any other post.',
  },

  sichtdauer: {
    startTitel: 'Until it starts',
    startText: 'For things you have to be on time for — cinema, trains, concerts.',
    tagesendeTitel: 'Until end of day',
    tagesendeText: 'The normal case. Anyone running a little late can still join.',
    morgenTitel: 'One more day',
    // Der Donaukanal behält seinen Namen — ein Ort in Wien hat keinen englischen.
    morgenText:
      'For open-ended things with no fixed time — "I\'m at the Donaukanal all afternoon".',
  },

  post: {
    // „host", nicht „poster" — ein `poster` ist auf Englisch ein Plakat.
  },

  postansicht: {
    blockiertTitel: 'Nothing doing here',
    blockiertText:
      "There's a block between you and whoever posted this. Blocks you set yourself are in Settings.",
    deinPostTitel: 'This is your post',
    niemandAngefragt:
      "Nobody has asked yet. As soon as someone wants in, you'll see it in the Requests tab.",
    // ⚠️ Zwei Schlüssel, nicht ein Satz mit eingesetztem Verb: Englisch beugt
    // „person/people" UND „wants/want", Deutsch „Person will/Leute wollen" —
    // ein gemeinsamer Satz mit Platzhalter geht in keiner der beiden Sprachen.
    einerWillMit: '{anzahl} person wants in. You can confirm in the Requests tab.',
    mehrereWollenMit: '{anzahl} people want in. You can confirm in the Requests tab.',
    verabredetTitel: "You're set",
    verabredetText: '{name} confirmed. Sort out the rest in the chat.',
    zumChat: 'Go to chat',
    diesmalNichtTitel: 'Not this time',
    diesmalNichtText: "{name} said no. There's bound to be something else in the feed.",
    anfrageGeschicktTitel: 'Request sent',
    anfrageGeschicktText:
      '{name} still has to confirm. As soon as that happens, the chat opens.',
    anfrageZuruecknehmen: 'Withdraw request',
    schonVoll: 'Already full',
    treffpunktOffen: "We'll sort it out in the chat",
    fuerWen: 'Who for',
    plaetze: 'Spots',
    alleVergeben: 'All {gesamt} taken',
    sichtbarFuer: 'Visible to',
    gibtEsNichtMehr: 'This post is gone',
    abgelaufenOderGeloescht: 'It may have expired or been deleted.',
  },

  anfrage: {
  },

  konto: {
    // „meet-ups", nicht „meetings" — Letzteres klingt nach Büro.
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
    vonDir: "That's yours",
    gibtEsNicht: "That doesn't exist",
    eigenesNichtMelden: "You can't report your own posts or yourself.",
    vielleichtWeg: "Maybe it's gone by now.",
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
    einPost: 'post',
    mehrerePosts: 'posts',
    postsZusatz: 'including expired ones',
    einChat: 'chat',
    mehrereChats: 'chats',
    chatsZusatz: 'with every message',
    eineAnfrage: 'request',
    mehrereAnfragen: 'requests',
    anfragenZusatz: 'the ones you sent',
    eineVerbindung: 'connection',
    mehrereVerbindungen: 'connections',
    verbindungenZusatz: '{follower} followers · you follow {folgt}',
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
