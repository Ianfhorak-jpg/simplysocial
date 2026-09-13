# CLAUDE.md — SimplySocial

Kontext für Claude Code in diesem Projekt. Chatsprache: **Deutsch** (englische Fachbegriffe OK).

---

## Vor jeder Aufgabe

> **[`PLAN.md`](PLAN.md) ist die Source of Truth.** Vor der Arbeit lesen, danach die
> Checkboxen aktualisieren. Diese Datei hier gibt nur den Überblick.

> 📚 **Das Langzeitgedächtnis liegt seit dem 2026-09-13 in `_gedaechtnis/`**, weil diese
> Datei auf 406 KB (~101.500 Tokens) gewachsen war und bei **jeder** Sitzung automatisch
> geladen wurde — auch nach `/clear`. **Verschoben, nicht gelöscht**, kein Zeichen
> geändert:
>
> | Datei | Inhalt | statt |
> |---|---|---|
> | `_gedaechtnis/HISTORIE.md` | Phase 0 bis 20.9 im Volltext, alle 75 Entscheidungen | ~49.500 Tk |
> | `_gedaechtnis/HARTE_REGELN.md` | die 105 Regeln im Volltext | ~24.500 Tk |
> | `_gedaechtnis/FALLEN.md` | die 166 Fallen im Volltext | ~23.200 Tk |
>
> **Unten steht von Regeln und Fallen nur der TITEL** (Ians Entscheidung 76). Das genügt,
> um zu wissen, DASS eine Regel existiert — **wer eine anfasst, liest vorher ihren
> Volltext nach.** Ein Titel ist kein Ersatz für die Begründung, und in diesem Projekt
> steckt die Lehre fast immer in der Begründung.

## Was SimplySocial ist

Eine Treff-App für Wien. Man postet eine Aktivität („Tennis, 1220, heute 17:00"),
andere sehen das im Feed und tippen „Bin dabei". Der Poster bestätigt, dann öffnet
sich der Chat. **Kein Dating.** Nicht nur Sport — auch Kaffee, Lernen, Kino, Skaten.

Obendrauf ein Social-Layer wie bei Instagram: Follower, und pro Post ein Schalter
„für alle" vs. „nur meine Follower".

## Team & Rollen

- **Ian** (16, Graphische Wien, 3AHMP) — codet als Einziger. Vier Gründer insgesamt,
  die anderen drei haben keine Coding-Erfahrung.
- Das **Logo zeichnet ein Freund** — bis es da ist: Platzhalter-Schriftzug.
- Arbeitsweise: *mit* Ian, nicht *für* ihn. Bei Entscheidungen mit echten Trade-offs
  fragen und ihn selbst Code schreiben lassen (siehe PLAN.md, Abschnitt „Ian schreibt selbst").

---

## Stand heute (2026-09-13)

> 🔗 **Prototyp: https://ianfhorak-jpg.github.io/simplysocial/** (Code: `simplysocial/`, hochladen: `npm run deploy`)
> 🔗 **Landing-Page: https://ianfhorak-jpg.github.io/simplysocial-landing/** (Code: `landing/`, `git push` genügt)
> 📁 **Belege: `_belege/`** (304 Screenshots, Dateinamen unverändert — jeder Verweis in PLAN.md geht weiter auf). Was Ian selbst schickte: `_belege/von-ian/`.

**Es gibt ZWEI getrennte Stände, und das ist Absicht (Entscheidung 75):**

| | Öffentliche Adresse | Ians iPhone |
|---|---|---|
| Schalter | `ANMELDE_QUELLE = 'attrappe'` | `'supabase'` |
| Daten | `mock.ts`, erfundene Namen | echtes Supabase |
| Anmelden | „Weiter als Ian" | Apple · Google · E-Mail-Code |
| Kommt von | `npm run deploy` | `npm run geraet` |

**`deploy.sh` deployt NUR aus `'attrappe'` heraus** (harte Regel 96) — ein versehentlicher
Deploy mit umgelegtem Schalter bricht ab, bevor irgendetwas gebaut wird.

🎉 **Die App läuft auf Ians iPhone** (iPhone 16, iOS 26.6.1, `at.simplysocial.app`,
gültig bis **2027-09-13**). Der Gerätedurchgang ist gemacht: **7 von 7** — Apple-Login ·
Google-Login · angemeldet über Neustart · Profilbild · Merker · kein Prototyp-Hinweis ·
@-Namen.

🎉 **Apple Guideline 1.2 ist VOLLSTÄNDIG** (seit 20.7-b): Melden · Blockieren ·
Nutzungsbedingungen · Konto löschen — und sie werden gelesen UND beantwortet:
`npm run meldungen`, dazu `-- post-loeschen <id>` und `-- konto-loeschen <@name>`
(beide zeigen ohne `--wirklich` nur eine Vorschau).

**Fertige Phasen:** 0–19i · 20.1 bis 20.9 · **20.6-d**. Zuletzt **20.6-d, der runde
Zuschnitt** (Ians Wunsch vom 13.09.): ein eigener Zuschneide-Bildschirm mit rundem
Fenster, dazu **Ians Entscheidung 77 — 512 px**. Volltext aller Phasen in
`_gedaechtnis/HISTORIE.md`.

⚠️ **Der Gerätebuild dazu ist gebaut, aber noch NICHT aufgespielt** — `npm run geraet`
ist danach ein Aufruf von Sekunden (iPhone entsperrt lassen). Bis dahin trägt die App
auf Ians iPhone den Stand vom 13.09. nachmittags **ohne** den runden Zuschnitt.

### Gemessene Zahlen (grün, Stand 20.9/20.8)

| Prüfstand | Häkchen | braucht |
|---|---|---|
| `bash supabase/pruefen/aufbauen.sh` | **171** | nichts (Wegwerf-DB) |
| `npm run pruef-schreiben` | 50 | echten Server |
| `npm run pruef-konto` | 32 | echten Server |
| `npm run pruef-bilder` | 32 | echten Server |
| `npm run pruef-lesen` | 29 | echten Server |
| `npm run pruef-anbieter` | 48 | nichts |
| `npm run pruef-bildwahl` | 47 | nichts |
| `npm run pruef-moderation` | 31 | nichts |
| `npm run pruef-sitzung` | 29 | nichts |
| `npm run pruef-programmfehler` | 25 | nichts |
| `npm run pruef-zuschnitt` | **47** | nichts |

Dazu: `npx tsc --noEmit` sauber · `expo lint` **82 Probleme** (81 vorbestehend plus
**einer mit Namen**: `react-hooks/refs` in `BildZuschneiden.tsx` — derselbe, den
`SsWienKarte.tsx:552` trägt, und aus demselben Grund, ein `PanResponder` muss seine
Werte aus einem Ref holen. Jede ANDERE Zahl ist ein Befund, kein Rauschen).

---

## Was als Nächstes ansteht

1. **Phase 21 — App Store.** 13+ (Apples neue Altersfrage ist seit Sept. 2026 Pflicht,
   die Antwort ist ja), Rechtstexte, TestFlight, einreichen.
2. ~~**Phase 20.6-d — runder Zuschnitt.**~~ ✅ **fertig am 2026-09-13 nachts.** Offen ist
   nur noch das Aufspielen und der Gerätedurchgang 4 (`HANDY_DURCHGANG.md`): Fühlt sich
   Schieben und Kneifen richtig an, und sitzt der Kreis bei einem QUER aufgenommenen
   Foto dort, wo er im Fenster stand?
3. **19d-2** (MapKit JS im Browser) — fällt nach Phase 20 nebenbei ab.

## Was auf Ian wartet

| | Wo | Blockiert? |
|---|---|---|
| 🔑 **Management-Token widerrufen** — darf alles im Supabase-Konto, wird nie wieder gebraucht | `supabase.com/dashboard/account/tokens` → Revoke | nein, aber offen seit 13.09. |
| **Der Knopf unter dem Vollbild-Kasten** — „Nochmal versuchen" oder nichts | PLAN.md 5b, 20.9 | nein |
| **`meldungLage()` bei ZU SPÄT bearbeitet** | `TODO(Ian)`, PLAN.md 6 Punkt 60 | nein |
| **Apple-Programm auf wessen Namen?** — mit 16 üblicherweise über einen Elternteil; daran hängen Anbietername, Verträge und der Sign-in-Schlüssel | `_FUER_IAN/OFFENE_SACHEN.md` | später teuer |
| **Rechtstext für die Nutzungsbedingungen** — kein Text, den Claude erfinden darf | `_FUER_IAN/OFFENE_SACHEN.md` Punkt 1 | für Phase 21 ja |
| **Landing-Page-Farbe** — Olivgrün, Weinrot oder Türkis, dazu bunt vs. Leitfarbe | `landing-vorschau/LIESMICH.md`, OFFENE_SACHEN 4b | nein |

## Stack

**Expo + Expo Router + React Native Web** — ein Projekt, zwei Ausgänge: Browser jetzt,
iOS-App später ohne Neuschreiben. Ordner: `simplysocial/`.

Die **Landing-Page** liegt daneben in `landing/` und ist bewusst etwas ganz anderes:
reines HTML/CSS/JS, kein npm, kein Bundler. Sie hat ein eigenes Repo und einen eigenen Deploy.

```bash
cd simplysocial
npm install
npx expo start --web      # Web-Preview
npx tsc --noEmit          # Typecheck
npm run deploy            # bauen + auf GitHub Pages schieben (NUR gh-pages!)
npm run geraet            # auf Ians iPhone spielen (iPhone entsperrt lassen)
npm run doku              # Doku nach doku/ spiegeln (macht der pre-commit-Hook selbst)
git add -A && git commit && git push   # ← die Sicherung. Der Deploy ist keine.
```

---

## Harte Regeln — Index

> **Volltext: [`_gedaechtnis/HARTE_REGELN.md`](_gedaechtnis/HARTE_REGELN.md).**
> Hier steht nur der Titel. **Wer eine Regel anfasst, liest zuerst ihren Volltext** —
> dort stehen die Begründung, die verworfenen Möglichkeiten und die Messung.
> Regeln mit „nicht ohne Rückfrage" sind Ians Entscheidungen (harte Regel 58).

  1. Kein Firebase, kein Login, kein Netzwerk im Prototyp
  2. Screens lesen niemals direkt aus `mock.ts`
  3. Der Name `SimplySocial` steht an genau einer Stelle
  4. `_FUER_IAN/OFFENE_SACHEN.md` pflegen
  5. Zurück-Knöpfe nehmen `zurueckOderFeed()`
  6. Was zusammengehört, in EINEM `aendern`
  7. Profil-Inhalt kommt aus `components/Profil.tsx`
  8. Eine Folge-Beziehung steht ZWEIMAL im Datenmodell
  9. Der Chat-Screen ist die eine begründete Ausnahme von „Eingabefeld → `scroll`"
 10. Ein BLOCK steht nur EINMAL im Datenmodell
 11. Jede neue dynamische Route braucht `generateStaticParams`
 12. Fake-Daten enthalten nichts Persönliches
 13. `landing/stil.css` ist eine KOPIE des Design-Systems, keine Verbindung
 14. Die Landing-Page bekommt kein Formular ohne Backend
 15. Im Wischstapel gehört der Tipp der KARTE, nicht ihrem Inhalt
 16. Der Stapel liest über `useStapel`, und das liest über `useFeed`
 17. Was ein Block bewirkt, steht in `safety/block.ts` und nirgends sonst
 18. Die Vorschau im Erstellen-Screen ist kein Extra, sie ist die Absicherung
 19. Eine waagrechte Reihe neben einer Liste ist `SsScrollReihe`
 20. Der Ort eines Posts kommt aus `ortText()`
 21. Was der Browser VOR dem JavaScript sieht, steht in `app/+html.tsx`
 22. Der Prototyp-Hinweis ist ein VOLLBILD beim ersten Öffnen
 23. Es gibt keine Emojis in der Oberfläche — Icons kommen aus `theme/icons.ts`
 24. `SsIcon` zeichnet auf BEIDEN Plattformen — seit Phase 19 auch nativ
 25. `landing/icons.js` ist eine KOPIE von `theme/icons.ts`, keine Verbindung
 26. Ein neuer Feed-Filter geht über `FeedFilter` und `features/posts/filter.ts`
 27. Ein Mensch hat einen `jahrgang: number`, ein Post ein Union `PostAlter`
 28. Ein Chat hat seit Phase 16 vielleicht KEINEN Post
 29. Einem Direktchat NIE einen Ersatz-Post oder eine Ersatz-Kategorie geben
 30. Die Chat-Liste gruppiert nach ZUSTAND, nicht nach SORTE
 31. `Post.visibility` ist ein OBJEKT, kein String
 32. Was eine Gruppe ist und was ein Austritt anrichtet, steht in `features/groups/gruppe.ts` und nirgends sonst
 33. Mitgliedschaft steht NUR EINMAL im Modell
 34. Gruppen bekommen KEINEN eigenen Feed und KEINEN eigenen Tab
 35. `npm run deploy` ist KEINE Sicherung — es schiebt nur `gh-pages`
 36. Was über dem Wischstapel liegen soll, geht durch `WischStapel.blatt` — nie über den Stapelbereich im Screen
 37. „Aufgeklappt" ist nicht „sichtbar", und ein roter Hinweis muss auf etwas zeigen, das im Bild ist
 38. Gründen und Einladen sind zwei verschiedene Rechte
 39. Eine Einladung ist KEINE Anfrage mit umgedrehtem Vorzeichen
 40. Eine Zahl an einem Tab liest denselben Haken wie der Screen darunter
 41. `StapelDurch` ist eine ÜBERSCHRIFT über einer Liste, kein Leer-Zustand
 42. Die Chat-Liste besteht aus ZEILEN, jede andere Liste der App aus Karten
 43. Sollen zwei Texte nebeneinander ungleich nachgeben, bekommt der nachgebende `flex: 1` — nicht der andere ein höheres `flexShrink`
 44. Ein Schiebe-Regler gehört NIE in `SsScrollReihe`
 45. Sind zwei Dinge in einem Moment ununterscheidbar, wird die Entscheidung VERTAGT, nicht geraten
 46. Was eine Terminüberschneidung bedeutet, steht in `features/requests/kollision.ts` und nirgends sonst
 47. Was die App über die Pläne einer Person weiß, sagt sie NUR dieser Person
 48. Die Wien-Karte besteht aus SIEBEN Dateien, und keine davon ist ein Screen
 49. Ein Kneifen ist NIE ein Tipp — auch wenn sich nichts bewegt hat
 50. Was auf einer Karte gewählt ist, IST der Bezirksfilter
 51. Was über der Karte schweben soll, geht durch `SsWienKarte.blase` — nie als Kind der Kartenfläche
 52. Es gibt mehr als einen Kartenzeichner und GENAU EINE Bedeutung
 53. Die Geometrie der Bezirke steht EINMAL da — im Raster
 54. Eine Server-Regel steht im Schema `regel` und NIE in einer Policy
 55. Auf `group_members` gibt es KEIN Insert-Recht, und das ist die Aussage
 56. Die HERKUNFT eines Chats ist eine Tatsache, kein abgeleiteter Wert
 57. Was am Server gilt, wird ANGEGRIFFEN, nicht angeschaut
 58. Eine neue Entscheidung überschreibt NIE still eine alte Regel-Datei
 59. Am Blatt zieht NUR der Griff
 60. Was oben und unten schon STEHT, wird gemessen — nur der Rest ist ein Anteil
 61. Glas bringt seine eigene Kante mit — Kante und Schatten sind der ERSATZ, wo keines ist
 62. Glas braucht RAND, nicht nur Hintergrund — die Tab-Leiste ist eine freistehende Kapsel
 63. Ein Bildschirm zeigt nur, was für die Entscheidung HIER nötig ist
 64. Ein React-Native-`View` klippt seine Kinder NICHT — geklippt wird auf die Höhe, die man SIEHT
 65. Die Reihenfolge des Feeds ist die ENTFERNUNG — und `sort.ts` trägt ZWEI Entscheidungen von Ian, nicht eine
 66. Ein `start`/`end` schlägt ein `left`/`right`, egal wer später kommt — und Web verrät es nicht
 67. Auf dem Bezirks-Vollbild steht nichts außer Karten, Bar, Zurück und dem Bezirksnamen
 68. Was der Standort darf, steht in `features/posts/standort.ts` und nirgends sonst
 69. Wer ich bin, kommt aus der SITZUNG — nie aus einer Konstante
 70. Was die Rechteliste verbietet, macht GENAU EINE Funktion — und ein fehlender `grant` ist eine Zusage, keine Lücke
 71. Ein Sicherheitsnetz gegen den Doppelklick ist KEINES gegen zwei Verbindungen
 72. Ein Zeitstempel aus der Datenbank wird GETAUFT, bevor ihn jemand vergleicht
 73. Eine aufgelöste Gruppe wird nicht gelöscht, sie HÖRT AUF — und gefragt wird mit `istAufgeloest()`
 74. Es gibt EINEN Schalter für Anmeldung und Daten, und er heißt `ANMELDE_QUELLE`
 75. Ein Realtime-Ereignis ist ein SIGNAL und wird nie gelesen
 76. Was dasteht, wenn die Daten nicht kommen, steht in `data/quelle.ts`
 77. Wer den Torwächter liest, nimmt `torwaechterZeigt()` — nie `zustand === 'an'`
 78. Was beim ERSTEN Konto gefragt wird, steht in `features/auth/konto.ts`
 79. Ein abgeleiteter Wert, der `unique` sein muss, wird GESCHRIEBEN und der Fehler als Antwort genommen
 80. Die Startfläche aus `+html.tsx` hängt am TORWÄCHTER, nicht am Laden der Daten
 81. Einen Bezirk gibt man an, man wählt ihn nicht — `SsBezirkFeld`, nie 23 Chips
 82. Eine Längenbegrenzung an einem Eingabefeld ist eine ANNAHME — und `maxLength` schneidet stillschweigend ab
 83. Ein Prüfstand fasst NUR seine eigenen IDs an — und jede Zählung darin auch
 84. Was der Bildschirm macht, während geschrieben wird, steht in `data/schreiben.ts` — und „Zurückrollen" gibt es nicht
 85. Am echten Supabase bekommt JEDE neue Tabelle in `public` alle Rechte — eine Rechteliste gilt erst nach einem `revoke`
 86. Ein Prüfstand, der SCHREIBT, schreibt jede erzeugte ID sofort mit
 87. „Es wird geladen" und „es wird NACHgeladen" sind zwei Lagen — gefragt wird mit `ladeSichtFuer()`, nie mit `laden.zustand === …`
 88. Was ein Profilbild ist und wer es sehen kann, steht in `features/social/bild.ts` — und bei einem OFFENEN Bucket schützt nur der NAME
 89. In `storage` gibt es nur EINEN Riegel, und ein SQL-`delete` gibt es gar nicht
 90. Ein Bild vom GERÄT kommt als base64 herein, nie über seine `uri` — und der Typ ist IMMER `image/jpeg`
 91. `@supabase/storage-js` nimmt auf React Native KEINEN `Blob` — und die Größenangabe muss danebenstehen
 92. Ein Prüfstand, der Beispiele AUSWÄHLT, muss die Eigenschaft erzwingen, an der der Fehler hängt — sonst prüft er den Zufall
 93. Bei Apple und Google gibt es KEINEN Nonce — und das ist gemessen, nicht vergessen
 94. Ein Anmeldeweg ist eine Frage an das GERÄT, nicht an die Plattform — und die Antwort ist ein Pflichtfeld
 95. Eine ABLEITUNG von `ANMELDE_QUELLE` steht NIE in `anmeldung.ts` — sie steht dort, wo ihre Frage gestellt wird
 96. Was am Gerät gilt, entscheidet der Schalter — und `deploy.sh` bewacht ihn seit dem Tag, an dem das WARNSIGNAL wegfiel
 97. Ein „schon gesehen" gehört in `lib/merker.ts` / `.native.ts` — und bedeutet auf den zwei Plattformen absichtlich VERSCHIEDENES
 98. Zwei Spalten, die auf dieselbe Tabelle zeigen, werden GEGENEINANDER geprüft — nicht je gegen einen festen Wert
 99. Ein Sigil gehört der ANZEIGE — `handleText()` aus `lib/handle.ts`, nie `@{person.handle}` im Screen
100. Was eine Meldung ist und wie schnell sie beantwortet wird, steht in `features/safety/meldung.ts` — und das Werkzeug LIEST sie, statt die Zahl zu wiederholen
101. Auf React Native gibt es kein `globalThis.crypto` — und eine Prüfumgebung, die REICHER ist als das Gerät, beweist nichts
102. Ein Fehler, der KEIN `SchreibFehler` ist, verschwindet spurlos — und `onPress={async …}` ist das Loch, durch das er geht
103. Ein PROGRAMMfehler hat einen Ort, und er steht in `lib/programmfehler.ts`
104. In Postgres darf `PUBLIC` jede neue Funktion AUSFÜHREN — ein fehlender `grant` ist bei Funktionen KEINE Zusage
105. `deploy.sh` hat VIER Wächter, und jeder deckt genau eine Frage — wer einen anfasst, liest zuerst, was er allein trägt
106. Ein rundes BILD gibt es nicht — rund ist das FENSTER, und wo das Quadrat liegt, steht in `features/social/zuschnitt.ts`
## Fallen — Index

> **Volltext: [`_gedaechtnis/FALLEN.md`](_gedaechtnis/FALLEN.md).** 166 Stück, jede schon
> einmal einen Abend gekostet — die meisten stammen aus ACTA (`17_Tennis_Optimma`), der
> Rest aus diesem Projekt. Hier steht nur der Titel; **die Diagnose steht im Volltext.**

- Große Display-Fonts clippen auf iOS
- SafeArea auf Tab-Screens:
- Jeder Ordner in `(tabs)/` wird automatisch ein Tab
- Native Module brauchen einen neuen EAS-Build
- Ein `ScrollView` neben einer `FlatList` fällt auf Höhe 0 zusammen
- `StyleSheet.absoluteFillObject` gibt es in React Native 0.86 nicht mehr
- `pointerEvents` gehört in den `style`
- Zwei `Date.now()`-Aufrufe können dieselbe Millisekunde treffen
- `PanResponder` gibt die Geste her, wenn jemand fragt
- Ein Browser schickt nach jedem Ziehen zusätzlich ein `click`
- `flex: 1` heißt in React Native `flexBasis: 0`, im Browser `auto`
- Zwei Stilwerte, die einzeln stimmen, ergeben zusammen den Fehler
- `react-native-web` kennt `experimental_backgroundImage` nicht
- `as const` an einem Standardwerte-Block friert `useState` ein
- Symbol links, zweizeiliger Text daneben: Das Symbol landet an der zweiten Zeile
- In einem Template-Literal gibt es keine Kommentare
- Der statische Web-Export zeigt einen Zustand, den es am Gerät nie gibt
- Der `<title>` war leer und `lang` stand auf `en`
- `string | null` erzwingt in JSX gar nichts
- Eine Summe von Zeichencodes ist kein Hash
- `<svg>` typecheckt in einer `.tsx`, läuft aber nur auf Web
- Ein Union-Typ ist ein Werkzeug, kein bloßer Typ
- Ein Icon in einer Textzeile setzt sich auf die Grundlinie
- Ein Filter, der seine eigene Auswahlliste füttert, sperrt sich selbst ein
- `normalize('NFD')` und `\p{Diacritic}` sind auf Hermes nicht verlässlich
- Ein Typ WEITER zu machen zeigt der Compiler nicht an
- Eine Lockerung kann man auch ENG bauen
- Zwei Regeln, die einzeln richtig sind, ergeben zusammen einen falschen SATZ
- Eine Interpolation mit einer Spanne der Breite null liefert den EXTREMWERT, nicht die Mitte
- Eine `AnimatedInterpolation` ist ein Kanal, kein Wert — ein falscher Anfangswert bleibt stehen
- Ein Metro-Hash ist kein „hat sich etwas geändert"-Test
- Ein `flex: 1`-Kasten mit absolut positionierten Kindern hat keine Mindesthöhe
- Ob ein Knopf verdeckt ist, sagt `document.elementFromPoint`
- Ein Union-Typ schützt nur die Props, die ihn tragen
- Geometrie prüfen ist nicht hinschauen
- Die Prüfung auf durchgerutschte Icon-Namen ist eine TEXT-Prüfung
- `elementFromPoint` sagt, ob etwas getroffen wird — nicht, ob das richtig ist
- Entwickler-Notizen in JSX-TEXT sind öffentlich
- Ein Screen weiss nicht, was im Bild ist
- Zwei Bausteine, die einzeln stimmen, geben zusammen zwei Antworten auf dieselbe Frage
- `onLayout` misst relativ zum ELTERN-Element und meldet auf Web erst nach dem Zeichnen
- Eine Fabrik-Funktion, die ein Ref anfasst, ist ein Lint-Fehler
- Ein NEUER Typ ist kein Netz — nur eine Verengung ist eins
- `SsSegment` schneidet Beschriftungen ab, ohne sich zu beschweren
- Eine Regel, deren GRUND wegfällt, hinterlässt ihre Wirkung
- `scrollWidth > clientWidth` findet abgeschnittenen Text
- Eine Auswahl-Spanne, die 80 % ihrer Breite an niemanden vergibt, ist keine
- Ein Regler, auf den man nur klickt, ist nicht geprüft
- Eine Regel, die nichts vorfindet, sieht aus wie eine Regel, die tut
- Eine relative Zeitangabe in Fake-Daten braucht einen relativen PARTNER
- Eine Farbe hat in diesem Projekt eine Bedeutung, nicht nur einen Kontrastwert
- Ein `click` auf einen Wischstapel-Knopf ist keine Wisch-Prüfung, aber auch keine verlässliche Navigation
- `100dvh` ist auf dem Handy keine verlässliche Antwort, `visualViewport` schon
- Ein Fehler, den man am Mac nicht sieht, wird am Screenshot GERECHNET
- Ein Build-Protokoll darf nie durch `tail` laufen
- Ein Simulator-Build braucht keine Apple-Signatur — ein Gerätebuild schon
- Was wie ein Neustart aussieht, ist oft keiner
- Benachbarte Flächen einzeln zu vereinfachen reißt Lücken
- Der Schwerpunkt einer Fläche liegt oft nicht IN ihr
- `gestureState.dx/dy` ist bei mehreren Fingern der MITTELPUNKT
- Eine feste Höhe ist auf einem kleinen Schirm eine ganz andere Höhe
- Der Web-Export und `visualViewport` können ein Bild verfälschen, ohne dass am Code etwas falsch ist
- `box-none` vererbt sich im Browser anders als auf dem Gerät
- Ein Prüflauf, der das Neue anfasst, misst das Neue und nicht das Alte
- Eine gerechnete Zahl braucht die Angabe, welcher Fall sie ist
- Eine Zoomstufe von `react-native-maps` ist nicht die Zoomstufe aus der Formel
- Drei aufgeschriebene Möglichkeiten sind noch keine drei
- Fast Refresh behält `useState` — ein Anfangswert ändert sich davon nicht
- Ein Klick OHNE jede Bewegung ist im Prüfbrowser kein Tipp
- Ein Anteil kann nicht ausweichen, ein gemessener Deckel schon
- Zwei Größen mit fast gleichem Namen sind der Fehler, den man nur beim Lesen findet
- Ein Native-Baustein ist vielleicht schon da
- Ein Bild, das falsch aussieht, ist noch kein Fehler
- Kamerabefehle an `react-native-maps` verpuffen still vor `onMapReady`
- `npx expo run:ios` gibt EXIT 0 zurück, auch wenn `xcodebuild` darunter gescheitert ist
- Die Team-ID steht im OU-Feld, nicht in der Klammer
- `ios/` ist git-ignoriert (CNG) — was dort eingetragen wird, ist flüchtig
- `CoreDeviceError 12040` heißt fast immer: Das Handy ist GESPERRT — nicht, dass Xcode zu alt ist
- Das Disk-Image braucht man zum DEBUGGEN, nicht zum INSTALLIEREN — und für einen Gestentest ist ein RELEASE-Build ohnehin der richtige
- Eine WEB-Einstellung hat den iOS-Release-Build zerlegt — und im Debug fällt so etwas nie auf
- Der BAUPLATZ darf nicht in iCloud liegen — der Quellcode schon
- Ein gescheiterter Build hat nicht immer eine `error:`-Zeile
- Ein Viewport-Wechsel im Prüfbrowser ist KEIN Tastatur-Test — die App merkt ihn nicht
- `scrollToEnd` landet in diesem Projekt 16 px vor dem rechnerischen Ende, und das ist richtig so
- `minZoomLevel` wird in `react-native-maps` auf iOS NACHGERECHNET — und die Rechnung kennt `mapPadding` nicht
- `isGesture` gibt es in `react-native-maps` nur für Google Maps
- „Steht die Karte auf ihrem Grundausschnitt?" ist NICHT dieselbe Frage wie „hat jemand sie angefasst?"
- Ein Screenshot trägt eine FASSUNG, und die ist erst einmal unbekannt
- Der Simulator lässt sich fernsteuern — die Umrechnung misst man an einer Fläche, die in BEIDEN Bildern vorkommt
- Ein ungenutzter Parameter ist einer, den nie jemand geprüft hat
- Ein Sortierer, den man nur in EINER Stellung sieht, ist nicht geprüft
- Ein echtes Neuladen setzt den Prototyp-Speicher zurück, eine Client-Navigation nicht
- Ein Beleg auf der falschen Plattform ist kein Beleg
- Ein Effekt, der nicht zu sehen ist, ist nicht dasselbe wie ein Effekt, der nicht läuft
- Der Simulator lässt sich nur mit Bedienungshilfen-Berechtigung antippen
- Fast Refresh übernimmt eine geänderte Position im `tabBarStyle` NICHT
- `pod install` verlangt inzwischen `cmake` — und meldet den Fehlschlag mit EXIT 0
- Ein `expo prebuild` OHNE `--clean` wirft die Signatur-Zeilen genauso weg
- Ein `await import(...)` wird im Dev-Server zu einem nachgeladenen Brocken
- Ein schlafender Mac-Bildschirm nimmt dem Simulator sein FENSTER
- Beim ABBAU eines Navigators schreibt `expo-router` die Adresse neu — auf die erste Route im Verzeichnis
- Ein Prüfklick, der „danebengeht", hat oft eine Entscheidung getroffen
- Ein Haken je LISTENZEILE abonniert den Speicher je Zeile
- Eine Prüfung mit Backticks in doppelten Anführungszeichen misst NICHTS und meldet grün
- `perform` gibt es nur INNERHALB von plpgsql
- Eine Prüfung, die eine BEDEUTUNGSÄNDERUNG nicht merkt, prüft die Umsetzung
- Ein veraltetes Metro-Bündel meldet einen Fehler, den es nicht gibt
- Ein `import type` erzeugt keine Abhängigkeit — das macht Regel-Dateien einzeln prüfbar
- `-allowProvisioningUpdates` holt nur ein neues Profil, wenn GAR KEINES passt — ein fast abgelaufenes ist ihm lieber als keines
- Ein Zertifikat und ein Profil laufen verschieden ab, und nur eines davon war je das Problem
- Die Publication `supabase_realtime` ist in einem frischen Projekt LEER — und ein Abo darauf verbindet sich trotzdem sauber
- „Database error querying schema" von GoTrue heißt fast immer: acht `NULL`s in `auth.users`
- Ein Wächter hinter einem anderen ist ein ungeprüfter Wächter
- `n_live_tup` ist ein SCHÄTZWERT, kein Zähler
- Ein Abräumen, das den Zustand eines GESCHEITERTEN Abräumens nicht aufräumen kann, ist nur beim Schönwetter-Lauf vollständig
- Ein verwaister Playwright-Lock sieht aus wie ein laufender Browser
- `auth-js` fällt ohne `localStorage` STILL auf Arbeitsspeicher zurück
- Ein ESM-Import in blankem Node braucht die `.js`-Endung, tsc schreibt sie nicht
- Ein Prüfstand, der eigenes `node_modules` braucht, gehört INS Projekt
- Ein Screenshot beantwortet nicht, was man ihn fragt
- Ein Playwright-Lock ist NICHT immer verwaist
- `signInWithOtp` nimmt bei einem NEUEN Konto die Vorlage „Confirm signup", nicht „Magic Link"
- Ein Kommentar, der eine Sicherheitszusage begründet, veraltet lautlos
- Eine Prüfung mit `count(*)` über eine ganze Tabelle prüft die Tabelle, nicht sich selbst
- Ein Prüfstand darf neben echten Daten laufen — der Beleg ist nicht sein grüner Lauf
- Supabase Realtime verliert nach einer Ruhepause das ERSTE Ereignis — und meldet trotzdem `SUBSCRIBED`
- Ein Mechanismus, den man im fremden Quelltext FINDET, ist eine Hypothese
- Zwei Konfigurationen nacheinander zu messen misst auch die Reihenfolge
- Ein `grant` in einer Migration NIMMT am echten Supabase nichts weg
- Ein Wächter, der auch Dateien prüft, die niemand öffnet, sperrt zu viel
- Ein falscher Enum-Wert meldet sich als `22P02` und ist ein guter Beleg
- Ein Playwright-Lock ist NICHT immer verwaist — und diesmal war es keines
- Zwei Screenshots im gleichen Zustand vergleichen, nicht zwei Screenshots
- Eine Attrappe kann auch SCHWÄCHER sein als das Original — und das ist die gefährlichere Richtung
- Eine Migration, aus der man eine Zeile HERAUSNIMMT, nimmt sie am Server nicht zurück
- Eine gelöschte Datei ist weg, ihre ADRESSE antwortet trotzdem
- `getBucket()` meldet „Bucket not found", wenn man ihn nicht sehen DARF
- Es gibt ZWEI Knöpfe mit der Aufschrift „Verstanden", und sie tun Verschiedenes
- Eine Prüfung, die NAMEN aufzählt, merkt nicht, wenn etwas dazukommt
- `UID` ist in zsh reserviert
- Ein Pixelvergleich braucht eine Gegenprobe GEGEN SICH SELBST
- Länge ist keine Geheimhaltung
- Ein Wächter, der eine ÄHNLICHE Frage stellt, ist kein Wächter
- Ein `403` auf mehreren Endpunkten heißt NICHT „der Token kann gar nichts"
- Eine Einstellung ist angenommen, bevor sie gilt — und eine Prüfung, die zu früh fragt, ist ein Fehlalarm
- Apples `.p8` ist der Stempel, nicht das Dokument
- Supabase gibt eingetragene Geheimnisse als ABDRUCK zurück, nicht als Wert
- Ein Prüfstand kann eine Ordnung verlangen, die seine eigene Schwesterprüfung ZERSTÖRT
- Eine ENTSCHEIDUNG kann von keiner einzigen Prüfung bewacht sein, und das sieht man nur, indem man die verworfene Möglichkeit BAUT
- Ein Promise ist immer truthy — `tsc` sagt dazu NICHTS
- Eine Signatur von synchron auf asynchron zu ändern ist eine LOCKERUNG
- Ein Prüfstand, der einen REPO-ZUSTAND voraussetzt, wird nach der ersten geplanten Änderung abgeschaltet statt gelesen
- Die Quelle NICHT anfassen, während ein Gerätebuild läuft
- Ein `update … returning` in psql meldet Erfolg, auch wenn es nichts getan hat
- Ein Gegenproben-Aufbau, der Fehler verschluckt, kann NUR falsche Entwarnung geben
- Ein Wächter, der EINE Datei prüft, während drei geladen werden, deckt zwei nicht ab
- Eine Liste von Dateinamen in einem Skript wird irgendwann nicht nachgezogen
- Zweimal die STILLE repariert, bevor die URSACHE gesucht war
- Ein `main.jsbundle` lässt sich nach dem eigenen Code durchsuchen — in ZWEI Kodierungen
- Ein neuer Import in einer Regel-Datei bricht JEDEN Prüfstand, der sie lädt — und das merkt nur, wer ihn laufen lässt
- Ein Prüfstand OHNE Alias-Wächter stirbt mit einer Meldung, die nach kaputtem Node aussieht
- Ein `sed` auf einen Wert trifft auch den KOMMENTAR daneben
- Eine Gegenprobe, die aus dem FALSCHEN Grund rot ist, belegt gar nichts
- `find … | grep -v …` unter `set -euo pipefail` tötet das Skript STUMM, sobald nichts übrig bleibt
- Ein Export erzeugt ZWEI Sorten Dateien, und nur eine davon ist eine Adresse
- Expo-Docs versioniert lesen
- Ein `asset.width` vom Bildwähler darf `0` sein — und die EXIF-Drehung vertauscht Breite und Höhe
- `geraet-bauen.sh` macht KEIN `prebuild` und KEIN `pod install` — ein neuer nativer Baustein kommt so nie im Xcode-Projekt an
- React Native kennt keine Maske — ein Kreis entsteht aus einem RING der doppelten Kantenlänge
- Eine Textsuche mit NULL Treffern beweist nichts — sie braucht die Gegenprobe im selben Ordner
- Eine Prüf-Erwartung, die BEQUEMLICHKEIT verlangt, prüft nicht die Regel
- Ein Prüfstand mit Gegenprobe legt eine Kopie von `src/` INS Projekt — und `.gitignore` zählte die Namen einzeln auf
---

## Was Apple verlangt (Guideline 1.2, User-Generated Content)

✅ **Vollständig seit dem 2026-09-13.** Alle vier stehen seit Phase 7 in der App —
**Melden · Blockieren · Nutzungsbedingungen · Konto löschen** — sie wirken wirklich, und
seit 20.7/20.7-b werden sie auch **gelesen und beantwortet** (`npm run meldungen`).

Was für den Review noch fehlt: das Häkchen „Nutzungsbedingungen akzeptiert" beim Anmelden
— und der **Rechtstext**, den es bestätigen soll. Der fehlt **bewusst sichtbar** (roter
Kasten in `nutzungsbedingungen.tsx`): Er ist kein Text, den Claude erfinden darf
(`_FUER_IAN/OFFENE_SACHEN.md`, Punkt 1).

---

## Wegweiser

| Wenn du … brauchst | lies |
|---|---|
| den Plan, die offenen Punkte, Ians 75 Entscheidungen | `PLAN.md` (Source of Truth) |
| warum eine Phase so gebaut wurde, was sie gekostet hat | `_gedaechtnis/HISTORIE.md` |
| den Volltext einer harten Regel | `_gedaechtnis/HARTE_REGELN.md` |
| die Diagnose zu einer Falle | `_gedaechtnis/FALLEN.md` |
| was nur Ian entscheiden kann | `_FUER_IAN/OFFENE_SACHEN.md` |
| die Schritte für den Gerätedurchgang | `_FUER_IAN/HANDY_DURCHGANG.md` |
| Klick-für-Klick-Anleitungen für Konten | `_FUER_IAN/KONTEN_EINRICHTEN.md` |
| einen Beleg (`am01`, `ao01`, …) | `_belege/`, Register in `_belege/LIESMICH.md` |

> ⚠️ **Diese Datei wächst nicht mehr mit.** Eine fertige Phase gehört nach
> `_gedaechtnis/HISTORIE.md` (oben anhängen), eine neue Regel mit **Volltext** nach
> `HARTE_REGELN.md` und mit **Titel** in den Index hier. Wer stattdessen hier
> weiterschreibt, baut die 406 KB wieder auf — und die nächste Sitzung beginnt wieder bei
> 150.000 Tokens.
