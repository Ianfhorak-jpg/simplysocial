<!--
═══════════════════════════════════════════════════════════════════════════════
  DIE PRÜFNOTIZEN FÜR APPLE — der EINE Ort, an dem dieser Text steht.

  Geschrieben wird er mit:  npm run asc pruefnotizen -- --wirklich
  Angesehen mit:            npm run asc pruefnotizen

  ── 🔴 Warum es diese Datei gibt ────────────────────────────────────────────
  Am 2026-09-26 nachgesehen: Das Feld `notes` an Version 1.0 war **leer**.

  Genau das hat ACTA (Projekt 17) eine ganze Prüfrunde gekostet. Apples erste
  Antwort am 14.09. war kein Mangel an der App, sondern die
  Erstentwickler-Routine „Information Needed": Sie wollten ein Bildschirmvideo,
  den Zweck, die Zielgruppe und den Zugang wissen. Ians Antwort brauchte
  Formulieren, ein Video und acht Tage.

  In ACTAs Antworttext steht der Satz, aus dem hier die Lehre wird:
  *„I have also added all of it to the Notes field in the App Review Information
  section, as instructed."* — Was dort von Anfang an steht, muss nicht erfragt
  werden.

  ── Was hier hinein gehört ──────────────────────────────────────────────────
  Alles, wonach ein Prüfer sonst fragen müsste:
    · was die App ist und für wen
    · wie man hineinkommt (Demo-Konto)
    · wo die vier Pflichtfunktionen für Guideline 1.2 stecken — MIT WEG, nicht
      nur mit Namen. Ein Prüfer, der „Melden" nicht findet, lehnt ab.
    · was die App NICHT ist (kein Dating) und NICHT tut (kein Kauf, keine
      Werbung) — jede dieser Aussagen nimmt eine Frage vorweg.

  ⚠️ **Jeder Weg hier ist am 2026-09-26 im Code nachgeprüft** (`post/[id].tsx:353`,
  `user/[id]/index.tsx:193` und `:174`, `einstellungen.tsx:450` und `:488`).
  Ein falscher Weg in den Prüfnotizen ist schlimmer als keine Notiz: Er schickt
  den Prüfer an eine Stelle, an der nichts ist.

  ⚠️ Englisch, weil Apple auf Englisch prüft.

  Alles zwischen den Linien wird geschickt; dieser Kommentar nicht.
═══════════════════════════════════════════════════════════════════════════════
-->

SimplySocial is a meetup app for Vienna, Austria.

WHAT IT DOES
Someone posts an activity with a time and a district ("Tennis, 1220, today 17:00").
Other people see it in the feed and tap "Bin dabei" (I'm in). The person who posted
confirms who may come, and only then a group chat opens. Activities are everyday
things: sport, coffee, studying, cinema, going for a walk.

WHAT IT IS NOT
This is not a dating app. There is no matchmaking between individuals, no swiping
for people, no romantic intent anywhere in the product. The swipe gesture in the
feed applies to ACTIVITIES, not to people. There is also no chat with strangers:
a chat only exists after the host has confirmed a specific request.

TARGET AUDIENCE
People living in Vienna who want to do something and need someone to do it with.
Age rating 13+, which follows from user-generated content, messaging and a social
feed — it is not a marketing choice.

HOW TO SIGN IN
Please use the demo account in the fields above (email address and password).
It is a normal account with a password, which exists only so that this review is
possible; everyone else signs in with Apple, Google or a one-time email code.
The demo account is already filled with a small demo world (activities, requests
and a chat), so every feature is reachable right after signing in.

USER-GENERATED CONTENT — WHERE TO FIND THE REQUIRED CONTROLS (Guideline 1.2)
- Report content: open any activity from the feed -> "Melden" at the bottom of
  the detail screen.
- Report a person: open any profile (tap the author's name on an activity) ->
  "Melden".
- Block a person: on the same profile screen -> "Blockieren". Blocking removes
  the follow relationship in both directions, closes the chat and cancels open
  requests between the two accounts.
- Terms of use: Einstellungen (Settings tab, bottom right) -> Rechtliches ->
  Nutzungsbedingungen. Every new account must tick a box accepting them before
  the account is created; we store the time and the version that was accepted.
- Delete account: Einstellungen -> Konto löschen. The deletion runs on the
  server, removes the account and its content, and signs the person out.
  Reports are read and answered by us; every report has a deadline attached.

PRIVACY AND LOCATION
The app never stores a precise position. A person gives a Vienna district
(postal code) when creating their account, and each activity carries a district.
That is the whole location model.

NO PAYMENTS, NO ADVERTISING
There are no in-app purchases, no subscriptions and no payments of any kind, so
there is no purchase flow to review. The app contains no advertising SDK, no
analytics SDK and no crash-reporting SDK.

LANGUAGE
The interface is German, because the app is for Vienna. Happy to clarify any
screen on request.
