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
      "Picking a photo doesn't work on the phone yet \u2014 that comes with the next app update. It already works in the browser.",
    deinBezirk: 'Your district',
    // Modell: „From here, your feed is sorted by outward" \u2014 kein Englisch.
    bezirkHinweis: 'Your feed sorts outward from here',
    heimatbezirk: 'Your home district',
    blockiert: 'Blocked',
    niemandBlockiert: "You haven't blocked anyone.",
    blockierenWo: "You can block someone from their profile.",
    // \ud83d\udd34 Modell: „Undo". **Bedeutungsfehler, kein Sprachfehler:** Dieser Knopf
    // hebt eine BLOCKIERUNG auf (`entblocken()`), er macht nichts r\u00fcckg\u00e4ngig.
    // „Undo" neben einem Namen in einer Blockierliste h\u00e4tte jeder falsch gelesen.
    aufheben: 'Unblock',
    // Apples eigene Schreibweise in Store und System.
    nutzungsbedingungen: 'Terms of Use',
    nutzungsbedingungenHinweis: 'The rules here, and the minimum age',
    deinKonto: 'Your account',
    // „Sign out" und nicht „Log out" \u2014 weil der Anmelde-Bildschirm „Sign in"
    // sagt (`anmelden.dochAnders`). Zwei W\u00f6rter f\u00fcr dieselbe T\u00fcr w\u00e4ren eines zu viel.
    abmelden: 'Sign out',
    abmeldenHinweis: 'Back to the {app} sign-in',
    accountLoeschen: 'Delete account',
    accountLoeschenHinweis: 'Your profile, your posts and your chats',
    fuerEntwicklung: 'For development',
    // Modell: „View building blocks" \u2014 w\u00f6rtlich. Gemeint sind die UI-Bausteine,
    // und das Wort daf\u00fcr ist im Englischen „components".
    bausteine: 'View components',
    bausteineHinweis: 'All elements of the app side by side',
    postFassungen: 'Compare post versions',
    postFassungenHinweis: 'Three drafts side by side \u2014 pick one',
  },

  standort: {
    anTitel: 'From your location',
    // Modell: „Your feed sorted from where you are" \u2014 falsche Zeitform.
    anAusgangspunkt: 'Your feed sorts from where you are right now. Nobody sees your location.',
    anBezirk: 'Your district is set automatically. Nobody sees your location.',
    ausTitel: 'Location is off',
    // Modell: „You declined this \u2014 this is changed in your phone's settings."
    // Passiv und unpers\u00f6nlich; die App spricht die Person an.
    verweigert:
      "You turned this down \u2014 you can change that in your phone's settings. Your feed keeps sorting from your district.",
    // \ud83d\udd34 Modell: „Location does not exist here". Gemeint ist: **auf dieser
    // Plattform gibt es keinen Standort** (Browser) \u2014 nicht, dass es den Ort nicht gibt.
    unmoeglichTitel: "Location isn't available here",
    unmoeglich: 'Your feed sorts from your district.',
    ausErklaerung:
      'Instead of your district, your feed will sort from where you are right now. Your location is never shown and never saved.',
  },

  regeln: {
    keinDating: "This isn't a dating app",
  },
};
