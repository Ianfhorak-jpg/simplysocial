# SimplySocial — 166 Fallen

> Herausgelöst aus `CLAUDE.md` am 2026-09-13. **Kein Zeichen geändert** — nur
> verschoben, damit die auto-geladene `CLAUDE.md` nicht mehr ~101.500 Tokens je
> Sitzung kostet. Der Index dazu steht in `../CLAUDE.md`; **wer hier etwas anfasst,
> zieht den Index mit.**
>
> Aus ACTA (`17_Tennis_Optimma`) und aus diesem Projekt. Jede hat schon einmal einen Abend gekostet.

---

## Fallen aus ACTA (17_Tennis_Optimma) — schon einmal teuer bezahlt

- **Große Display-Fonts clippen auf iOS.** `lineHeight ≈ 1.2 × fontSize` setzen, sonst
  schneidet iOS die Oberlängen ab.
- **SafeArea auf Tab-Screens:** Tab-Screen-Roots mit `edges={['top']}`, sonst doppelter
  Inset = toter schwarzer Balken über der Tab-Leiste.
- **Jeder Ordner in `(tabs)/` wird automatisch ein Tab.** Zum Ausblenden
  `<Tabs.Screen name="..." options={{ href: null }} />` — es reicht nicht, ihn wegzulassen.
- **Native Module brauchen einen neuen EAS-Build.** *Jetzt* unkritisch (der erste Build
  kommt sowieso noch), *nach* dem ersten Build gefährlich: ein neuer Native-Import crasht
  den bestehenden Dev-Build sofort. Im Prototyp trotzdem JS-only bleiben, damit die
  Web-Version verlässlich läuft (Konfetti mit `Animated`, nicht mit einer Native-Lib).
- **Ein `ScrollView` neben einer `FlatList` fällt auf Höhe 0 zusammen.** In Phase 2
  selbst gefunden: die Kategorie-Pillen waren im DOM vollständig da und auf dem Schirm
  ein Strich. ScrollView bringt `flexShrink: 1` mit — horizontale Leisten neben einer
  Liste brauchen `flexShrink: 0`.
- **`StyleSheet.absoluteFillObject` gibt es in React Native 0.86 nicht mehr**, und
  `absoluteFill` ist eine registrierte Style-ID, die sich nicht mit `overflow` mischen
  lässt. In Phase 4 beim Konfetti aufgefallen: `position`, `top`, `right`, `bottom`,
  `left` ausschreiben.
- **`pointerEvents` gehört in den `style`**, nicht in die Props — als Prop seit React
  Native 0.76 veraltet und eine Warnung in der Konsole je Aufruf.
- **Zwei `Date.now()`-Aufrufe können dieselbe Millisekunde treffen.** In Phase 5 gefunden:
  „die neueste Nachricht suchen" mit `>` nahm bei Gleichstand die falsche. Bei Listen, die
  nur hinten wachsen, ist `>=` richtig.
- **`PanResponder` gibt die Geste her, wenn jemand fragt** — die Voreinstellung von
  `onPanResponderTerminationRequest` ist „ja". In Phase 11 war das der Grund, warum das
  Wischen am breiten Fenster lief und in Handybreite nicht: Nach dem ersten Move nahm
  jemand der Karte die Geste ab. Für einen Wischstapel gehört dort `false` hin. Und:
  Wenn eine Geste „manchmal" nicht geht, in die Handler hineinmessen, nicht Größen
  variieren.
- **Ein Browser schickt nach jedem Ziehen zusätzlich ein `click`** — auf dem gemeinsamen
  Vorfahren von Anfang und Ende der Bewegung. In Phase 11 teuer gelernt (siehe harte
  Regel 15). Die Lösung ist nie, den Klick zu unterdrücken, sondern Tipp und Zug aus
  einer Hand zu bedienen.
- **`flex: 1` heißt in React Native `flexBasis: 0`, im Browser `auto`.** (Phase 11)
  Ein `SsSegment` in einer ZEILE fällt dadurch auf seine Polsterung zusammen — aus
  „Stapel" wurde „Sta…". In Spalten fällt es nie auf, weil es dort gestreckt wird.
- **Zwei Stilwerte, die einzeln stimmen, ergeben zusammen den Fehler.** (Phase 12) Der
  negative Rand an der Pillenreihe war richtig, solange `SsScreen` seine 16 px
  Seitenrand hatte; seit der Feed sie mit `paddingHorizontal: 0` überschreibt, zog er
  die Reihe über die Kante hinaus. Im Code sieht man so etwas nie — nur am Gerät.
- **`react-native-web` kennt `experimental_backgroundImage` nicht**, obwohl React
  Native 0.86 es kennt. (Phase 12, nachgesehen in dessen `dist/`.) Für alles, was nach
  Verlauf aussehen soll, gilt im Browser weiter: selbst bauen. Vor dem Einbauen einer
  RN-Neuerung immer prüfen, ob RNW sie mitmacht — der Prototyp läuft zuerst im Browser.
- **`as const` an einem Standardwerte-Block friert `useState` ein.** (Phase 12)
  `STANDARD.plaetze = 3` bekam den Literaltyp `3`; `useState(STANDARD.plaetze)` erbte
  ihn, und der Zähler durfte die Zahl nicht mehr ändern. `useState<number>(…)`
  ausschreiben. Der Typecheck findet das, der Browser nicht.
- **Symbol links, zweizeiliger Text daneben: Das Symbol landet an der zweiten Zeile.**
  (Phase 12) `alignItems: 'center'` zentriert es über den ganzen Block. Symbol, Titel
  und Pfeil gehören in EINE Zeile, der Untertitel darunter — eingerückt über eine feste
  Symbolbreite, weil Emojis je nach Gerät verschieden breit sind.
- **In einem Template-Literal gibt es keine Kommentare.** (2026-09-02) Im CSS-Block von
  `+html.tsx` stand ein Dateiname in Backticks — Projektkonvention in Kommentaren, hier
  aber das Ende der Zeichenkette. 22 Folgefehler, alle ab genau dieser Zeile. In
  eingebettetem CSS ohne Backticks schreiben.
- **Der statische Web-Export zeigt einen Zustand, den es am Gerät nie gibt.** (2026-09-02)
  Ians „sieht kurz komisch aus" auf Chrome war nicht zu erraten und im Browser am Mac
  nicht zu sehen. Gefunden, indem `dist/index.html` OHNE seine `<script>`-Tags gerendert
  wurde — das ist exakt der erste Bildaufbau, und dort lag die oberste Wischkarte schief
  und der Stempel „Weg" war sichtbar. **Das Verfahren merken**: Es macht einen
  Zwischenzustand anschaubar, den kein Screenshot einer laufenden App zeigt.
- **Der `<title>` war leer und `lang` stand auf `en`.** (2026-09-02) Beides erzeugt Expo
  selbst, solange es kein `+html.tsx` gibt — bei einer deutschen App heißt `lang="en"`,
  dass Chrome auf Android „Seite übersetzen?" anbietet.
  **Der Titel braucht ZWEI Stellen**, und das war im gebauten HTML nicht zu sehen: Dort
  stand er korrekt, live blieb der Tab trotzdem leer. Der Grund sind **zwei
  `title`-Tags** — Expo Router rendert beim Bauen einen leeren über react-helmet
  (`data-rh="true"`), und der steht VOR dem eigenen; `document.title` nimmt den ersten.
  `screenOptions={{ title }}` hilft nicht (das ist der Titel der Navigations-Kopfzeile),
  `<Head>` aus `expo-router/head` auch nicht (braucht `useIsFocused`, muss also INNERHALB
  eines Navigators stehen). Es bleibt `document.title` in einem Effekt — siehe
  `tabTitel()` in `app/_layout.tsx`, samt der Bedingung, unter der es wieder bricht.
  Also **auf der echten Adresse** `document.title` prüfen, nicht nur
  `grep '<title' dist/index.html`.
- **`string | null` erzwingt in JSX gar nichts.** (2026-09-02) Beim Optionalmachen des
  Bezirks war die Annahme, TypeScript würde alle sieben Anzeigestellen anmahnen. Tut es
  nicht: `{post.district}` mit `null` ist gültiges JSX, und `` `${post.district} Wien` ``
  ergibt klaglos „null Wien". Der Typ hilft trotzdem — aber als Anlass, vorher zu
  **suchen** (`grep`), nicht als Netz, das hinterher hält.
- **Eine Summe von Zeichencodes ist kein Hash.** (Phase 14) Die Avatarfarbe kam aus
  `for (…) summe += seed.charCodeAt(i)`, und `'u_ian'` (524) und `'u_lea'` (518) landen
  bei sechs Farben beide auf Rest 2 — auf dem Match-Screen zwei identische Kreise
  nebeneinander. Eine Summe ist positionsblind: Anagramme kollidieren immer, ähnliche
  Strings liegen dicht beieinander. **Und `%` nutzt nur die untersten Bits** — auch
  djb2 klumpte deshalb (drei von sechs auf derselben Farbe). Es braucht einen
  Mischschritt am Ende (FNV-1a + Shift/Multiplikation, `streuen()` in `SsAvatar.tsx`).
  Nachgemessen an 6000 IDs, nicht geschätzt.
- **`<svg>` typecheckt in einer `.tsx`, läuft aber nur auf Web.** (Phase 14)
  `@types/react` bringt die SVG-Intrinsics mit, und React Native überschreibt
  `JSX.IntrinsicElements` nicht — `tsc` sagt also nichts. Zur Laufzeit kennt der
  RN-Renderer den Tag nicht. Ein `Platform.OS`-Zweig ist Pflicht, der Typecheck ist
  hier kein Netz.
- **Ein Union-Typ ist ein Werkzeug, kein bloßer Typ.** (Phase 14) Der ganze Umbau von
  ~100 Emojis war nur deshalb vollständig, weil `SsButton.icon` von `string` auf
  `IconName` umgestellt wurde, BEVOR die Ersetzung anfing: Danach hat `tsc` die
  Arbeitsliste geschrieben. Bei einer Änderung, die viele Aufrufstellen betrifft, lohnt
  es sich, zuerst den Typ eng zu machen. Was der Compiler NICHT sieht, sind Werte im
  Text (`🔒 Nur Follower`) — die brauchen weiter `grep`.
- **Ein Icon in einer Textzeile setzt sich auf die Grundlinie.** (Phase 14) Im Browser
  ist `<svg>` ein Inline-Element und steht dadurch zu tief; in React Native braucht es
  `alignItems: 'flex-start'` plus einen `marginTop`, sonst zentriert es über den GANZEN
  Textblock (dieselbe Falle wie mit dem Emoji in Phase 12). Beides erledigt
  `SsIconText` — deshalb gibt es den Baustein.
- **Ein Filter, der seine eigene Auswahlliste füttert, sperrt sich selbst ein.**
  (Phase 15) Die Bezirks-Pillen zeigen nur Bezirke, in denen gerade etwas los ist —
  gerechnet aus dem gefilterten Feed. Läuft der Bezirksfilter dabei mit, ist die Liste
  nach dem ersten Tipp genau EINEN Eintrag lang, und man kommt ohne Zurücksetzen nicht
  mehr heraus. `useBezirkeImFeed` schaltet deshalb genau diesen einen Filter aus und
  lässt alle anderen gelten. Die Falle gilt für jede Auswahl, die sich aus den Daten
  ergibt, die sie selbst filtert.
- **`normalize('NFD')` und `\p{Diacritic}` sind auf Hermes nicht verlässlich.**
  (Phase 15) Der übliche Kniff, um „fussball" auf „Fußball" passen zu lassen, benutzt
  Unicode-Property-Escapes — im Browser in Ordnung, auf einem alten Android ein Fehler
  zur Laufzeit, den man am Mac nie sieht. In `filter.ts` steht deshalb eine Tabelle mit
  sechs Ersetzungen. `ß → ss` ist dabei der Grund, warum es eine Tabelle sein muss und
  keine Zeichen-für-Zeichen-Abbildung: Aus einem Zeichen werden zwei.
- **Ein Typ WEITER zu machen zeigt der Compiler nicht an.** (Phase 16) Die Annahme war,
  `ChatThread.postId` optional zu machen würde die Stellen anmahnen, die einen Post
  voraussetzen. Es waren null — `posts.find(p => p.id === thread.postId)` bleibt mit
  `undefined` gültig und gibt still `undefined` zurück. Dieselbe Falle wie bei
  `Post.district` zwei Stunden vorher, nur mit `undefined` statt `null`. Der Ausweg ist
  nicht `grep`, sondern die richtige EBENE: `ChatEintrag.post` optional zu machen ergab
  acht Fehler in genau den zwei Screens, um die es ging. **Bei einer Lockerung überlegen,
  wo die Enge stattdessen hin soll** — sonst verliert man sie ersatzlos.
- **Eine Lockerung kann man auch ENG bauen.** (Phase 17) Dritte Runde derselben Frage
  nach `Post.district` und `ChatThread.postId`. Diesmal hat der Compiler geholfen,
  weil `Visibility` ein diskriminiertes Union wurde statt eines erweiterten Strings
  mit Extrafeld: sieben Fehler in vier Dateien, alle gefunden, bevor irgendetwas lief.
  **Faustregel: Braucht eine neue Stufe zusätzliche Daten, ist es ein Union.** Der
  Preis ist bekannt und klein — `SsSegment` vergleicht mit `===` und kann keine
  Objekte auswählen, also hält der Erstellen-Screen den Schlüssel und baut das Objekt
  beim Absenden (`sichtbarkeitBauen`).
- **Zwei Regeln, die einzeln richtig sind, ergeben zusammen einen falschen SATZ.**
  (Phase 17) In der Verlassen-Rückfrage stand „deine Posts laufen weiter — du siehst
  sie nur nicht mehr". Falsch: `darfIchSehen()` lässt eigene Posts immer durch, eine
  ältere und unabhängige Regel. Kein Typecheck findet so etwas, im Code sieht man es
  auch nicht — es fällt beim DURCHKLICKEN auf und nur dort. Der Schaden blieb klein,
  weil der Text neben der Regel steht (`austrittFolgen()`) und nicht im Screen.
- **Eine Interpolation mit einer Spanne der Breite null liefert den EXTREMWERT, nicht
  die Mitte.** (2026-09-03, von Ian gemeldet: „warum ist die Karteikarte so komisch
  gedreht") In `WischKarte` stand `inputRange: [-b, 0, b]` mit `b` = Kartenbreite. Beim
  Web-Export ist `b` null — es gibt kein Fenster, also ist `useWindowDimensions()` 0,
  und `onLayout` hat nie gefeuert. Aus `[-b, 0, b]` wird `[-0, 0, 0]`, und React Native
  gibt bei `inputMin === inputMax` den ERSTEN Ausgabewert zurück statt den mittleren:
  Kippung `-16deg` statt `0deg`, Anheben `1.02` statt `1`, und der „Weg"-Stempel
  Deckkraft **1** statt 0 (seine Ausgabe ist `[1, 0, 0]` — deshalb war ausgerechnet
  „Weg" sichtbar und „Bin dabei" nicht). **Jede gemessene Größe, die in einen
  `inputRange` fließt, braucht einen Rückfall gegen null** — hier `NOTBREITE` in
  `features/posts/wisch.ts`.
- **Eine `AnimatedInterpolation` ist ein Kanal, kein Wert — ein falscher Anfangswert
  bleibt stehen.** (2026-09-03) Das war der bittere Teil des Fehlers oben: Nach dem
  Start wird die Karte gemessen, `b` stimmt, die Interpolation wird neu gebaut — und
  trotzdem ändert sich am Bild nichts. Eine Interpolation schreibt nur, wenn ihr
  EINGANG sich bewegt, und `pan.x` bleibt 0, bis jemand die Karte anfasst. Bis dahin
  steht der Bau-Zustand im DOM. **Deshalb hat die Abdeckung aus Phase 13 es nicht
  behoben: Verdecken repariert keinen eingefrorenen Wert.** Wer so etwas sucht,
  vergleicht `dist/index.html` mit dem laufenden DOM — stehen dort dieselben Zahlen,
  hat nie jemand nachgeschrieben.
- **Ein Metro-Hash ist kein „hat sich etwas geändert"-Test.** (2026-09-03) Metro
  vergibt die Modul-IDs bei jedem Lauf neu, also ändert schon ein geänderter Kommentar
  den Dateinamen des Bündels. Wer nur den Hash vergleicht, deployt aus Angst neu. Der
  belastbare Vergleich schneidet das `},<id>,[deps])` am Modulende weg und vergleicht
  die Rümpfe als MENGE — dann bleibt genau das letzte Modul übrig, und dessen einziger
  Unterschied sind die `__r()`-Startaufrufe.
- **Ein `flex: 1`-Kasten mit absolut positionierten Kindern hat keine Mindesthöhe.**
  (2026-09-03) `flex: 1` heißt **Restplatz**, nicht Mindestplatz. Nimmt ein
  aufgeklapptes Feld daneben 250 px, bleibt weniger übrig, als eine Karte hoch ist —
  und ein absolut positioniertes Kind schrumpft nicht mit, es quillt heraus. Mit
  `justifyContent: 'center'` gleich nach beiden Seiten. Der Kommentar an der Stelle
  behauptete das Gegenteil („bekommt sie vom `flex: 1`") und stand seit Phase 11 da.
- **Ob ein Knopf verdeckt ist, sagt `document.elementFromPoint`**, nicht das Auge und
  nicht die Geometrie des Textknotens darin. (2026-09-03)
- **Ein Union-Typ schützt nur die Props, die ihn tragen.** (2026-09-03) Phase 14 war
  vollständig, WEIL `SsButton.icon` vorher von `string` auf `IconName` verengt wurde —
  danach hat `tsc` die Arbeitsliste geschrieben. Die lokale `Zeile` in
  `einstellungen.tsx` hatte ihre eigene Prop, und die blieb `string`: „blatt" war
  gültig, die Stelle stand auf keiner Liste, und der Screen zeigte monatelang die Namen
  als Text. **Beim nächsten Massen-Umbau nicht nur die Bausteine verengen, sondern auch
  die lokalen Komponenten, die deren Werte durchreichen.**
- **Geometrie prüfen ist nicht hinschauen.** (2026-09-03) Auf `/einstellungen` lief das
  Raster (Überquellen, `elementFromPoint`) sauber durch — und der Screen war trotzdem
  kaputt. Schlimmer: Der Beweis stand in der eigenen Ausgabe („txt": „muellAccount
  löschen…"), im Feld daneben. **Wer misst, liest den ganzen Datensatz, nicht nur die
  Spalte, wegen der er gemessen hat — und macht von jedem Screen einen Screenshot.**
- **Die Prüfung auf durchgerutschte Icon-Namen ist eine TEXT-Prüfung.** (2026-09-03)
  `document.body.innerText` über alle Routen gegen die Namensliste aus `theme/icons.ts`.
  Zwei richtige Treffer sind zu erwarten: „treffen" als deutsches Wort in einem Chat,
  und `/bausteine`, das die Namen absichtlich zeigt.
- **`elementFromPoint` sagt, ob etwas getroffen wird — nicht, ob das richtig ist.**
  (2026-09-03) Auf `/einstellungen` meldete die Prüfung zwei verdeckte Knöpfe. Oben lag
  der **Prototyp-Hinweis**, und der SOLL überdecken (Regel 22, Ians Entscheidung); sein
  „Verstanden" ist erreichbar, danach ist nichts mehr verdeckt. Wer nur die Zahl liest,
  repariert eine Entscheidung.
- **Entwickler-Notizen in JSX-TEXT sind öffentlich.** (2026-09-03) „Steht auch in
  `_FUER_IAN/OFFENE_SACHEN.md`." stand nicht im Kommentar, sondern im gerenderten Text
  der Nutzungsbedingungen — samt Backticks, die React Native als Zeichen ausgibt. In
  einem Kommentar sind Backticks Projektkonvention, in JSX-Text sind sie ein sichtbarer
  Formatierungsfehler. Zum Suchen: `document.body.innerText` auf Backticks und interne
  Pfade prüfen, nicht den Quelltext greppen — dort stehen sie überall zu Recht.
- **Ein Screen weiss nicht, was im Bild ist.** (2026-09-03) `VERSTECKTER_FEHLER`
  behandelt genau den Fall „rote Stelle nicht sichtbar" — setzt sichtbar aber mit
  *aufgeklappt* gleich. Ein aufgeklapptes Feld kann trotzdem 752 px weit weg sein.
  Wer „ist das zu sehen?" beantworten will, braucht eine Position und eine
  Fensterhöhe, kein `useState` über offen/zu.
- **Zwei Bausteine, die einzeln stimmen, geben zusammen zwei Antworten auf dieselbe
  Frage.** (2026-09-03) `StapelDurch` ist als Überschrift über einer Liste gebaut,
  `LeererFeed` als das Einzige auf dem Schirm. Leert ein Filter beide, stehen sie
  übereinander und widersprechen einander. Keiner kennt den anderen, und die
  Zusammensetzung hat die Frage nie gestellt.
- **`onLayout` misst relativ zum ELTERN-Element und meldet auf Web erst nach dem
  Zeichnen.** (2026-09-03) Beides zusammen heisst: verschachtelte Positionen erst beim
  LESEN addieren (der Elternteil meldet womöglich später als seine Kinder), und nach
  einem Einblenden zwei `requestAnimationFrame` warten. Ein einzelnes reicht am Mac
  und auf einem langsameren Gerät nicht.
- **Eine Fabrik-Funktion, die ein Ref anfasst, ist ein Lint-Fehler.** (2026-09-03)
  `merkePosition(feld)` gab einen Handler zurück — die Fabrik wird aber beim RENDERN
  aufgerufen, und `react-hooks/refs` verbietet das zu Recht. Der Ausweg ist eine
  gewöhnliche Funktion, aufgerufen aus dem `onLayout`-Handler heraus.
- **Ein NEUER Typ ist kein Netz — nur eine Verengung ist eins.** (Phase 18a)
  `Group.offen: boolean` hinzuzufügen meldete sofort vier Stellen; `GroupInvite`
  einzuführen meldete **null**, weil ihn noch niemand las. Das ist die dritte Fassung
  derselben Lehre (Phase 16: Lockerung meldet nichts; Phase 14: Verengung schreibt die
  Arbeitsliste). **Bei einem neuen Typ muss man selbst suchen, wo die alte
  Unterscheidung jetzt mehrdeutig wird** — hier war es `'gruppe' in item` in
  `requests.tsx`.
- **`SsSegment` schneidet Beschriftungen ab, ohne sich zu beschweren.** (Phase 18a)
  Auf 360 px wurde „Jeder kann anfragen" zu „Jeder kann anfr…". Dieselbe Falle wie
  „Sta…" in Phase 11, aber mit ANDERER Ursache: dort `flex: 1`, hier schlicht zu langer
  Text. Faustregel für einen Umschalter: **ein Wort je Seite**, die Erklärung in die
  Zeile darunter — und dasselbe Wort nehmen, das das Ergebnis später auch heißt.
- **Eine Regel, deren GRUND wegfällt, hinterlässt ihre Wirkung.** (Phase 18a) Phase 17
  zeigt den Gründer auf der Gruppenseite, damit man weiß, wer die Anfrage bestätigt. Bei
  einer privaten Gruppe gibt es keine Anfrage — der Grund ist weg, der Name stand
  trotzdem da, und er kam aus genau der Mitgliederliste, die zubleiben soll. Beim
  Einbau einer neuen Stufe also nicht nur fragen „was zeige ich neu?", sondern **„welche
  bestehende Anzeige hat ihren Grund verloren?"**
- **`scrollWidth > clientWidth` findet abgeschnittenen Text.** (Phase 18a) Das
  Gegenstück zu `document.elementFromPoint` für verdeckte Knöpfe. Zusammen mit der
  Überquell- und der Icon-Namen-Prüfung ist der Durchgang in Handybreite EIN Aufruf.
- **Eine Auswahl-Spanne, die 80 % ihrer Breite an niemanden vergibt, ist keine.**
  (Phase 18b) `HOECHSTALTER = 70` war großzügig gedacht — 56 Jahrgänge auf 280 px, und
  alle wirklichen Nutzer der App drängen sich im rechten Fünftel. Im Code sieht man das
  nie; auf dem ersten Screenshot des Reglers sofort. **Bei jedem Wertebereich fragen, wo
  die echten Werte LIEGEN, nicht nur, welche möglich sind.**
- **Ein Regler, auf den man nur klickt, ist nicht geprüft.** (Phase 18b) `click` löst
  weder `onPanResponderMove` noch das Kreuzungsverbot aus. Es braucht echte
  Zeigergesten (`mouse.down` → mehrere `mouse.move` → `mouse.up`) und die Grenzfälle:
  kreuzen, zusammenschieben, wieder auseinanderziehen, tippen ohne Bewegung. Der
  eigentliche Fehler steckte im dritten davon.
- **Eine Regel, die nichts vorfindet, sieht aus wie eine Regel, die tut.** (Phase 18d)
  Die Doppelbuchungs-Prüfung war fertig, getippt, typecheck-sauber — und in den
  Fake-Daten gab es keine einzige Überschneidung. Ians zwei bestätigte Zusagen liegen
  genau eine Stunde auseinander (die Grenze ist `<`, also KEINE Kollision), alle anderen
  Posts an anderen Tagen. Ohne `p18` wäre die ganze Phase unsichtbar geblieben. **Zweite
  Fassung der 18c-Lehre: Nach dem Bauen nicht fragen „läuft der Code?", sondern „welche
  Daten bringen ihn zum Sprechen?" — und wenn es keine gibt, welche dazuschreiben.**
- **Eine relative Zeitangabe in Fake-Daten braucht einen relativen PARTNER.** (Phase 18d)
  `p18` sollte 30 Minuten nach `p1` liegen. Mit einer festen Uhrzeit hätte das nur
  tagsüber gestimmt: `bald()` schiebt einen Termin nach 22 Uhr auf morgen, und dann wäre
  die Kollision abends still verschwunden — für jeden, der den Prototyp am Abend
  aufmacht. `bald(2.5, …)` neben `bald(2, …)` rundet auf dieselbe halbe Stunde und hält
  den Abstand zu jeder Tageszeit.
- **Eine Farbe hat in diesem Projekt eine Bedeutung, nicht nur einen Kontrastwert.**
  (Phase 18d) Der naheliegende Griff für eine Warnung ist `status.danger`. Der Kommentar
  in `theme/colors.ts` sagt aber, wofür das Rot da ist: Absagen, Blockieren, Melden. Ein
  Hinweis, den die Regel ausdrücklich überschreiben lässt, gehört nicht dazu — sonst ist
  das Rot beim nächsten echten Fehler abgenutzt. **Vor dem Einfärben den Kommentar an
  der Farbe lesen.**
- **Ein `click` auf einen Wischstapel-Knopf ist keine Wisch-Prüfung, aber auch keine
  verlässliche Navigation.** (Phase 18d) Beim Durchklicken verschwanden Karten scheinbar
  zu zweit, und der Wisch-Zustand überlebte ein `browser_navigate` auf dieselbe Adresse
  (Expo Router macht daraus eine Navigation im Client, kein Neuladen). Wer den Stapel in
  einen bestimmten Zustand bringen will, erzwingt ein echtes Neuladen mit einer
  veränderten Adresse (`?x=` + Zeitstempel).
- **`100dvh` ist auf dem Handy keine verlässliche Antwort, `visualViewport` schon.**
  (2026-09-06, von Ian gemeldet: unter der Tab-Leiste stand ein toter Streifen, ein
  Neuladen machte ihn weg.) Am Screenshot nachgemessen: **661 pt sichtbar, 610 pt App**,
  Lücke **51 pt** — fast genau die Höhe von Chromes eigener unterer Leiste. Chrome am
  iPhone mit der Adressleiste UNTEN zieht sie zweimal ab: Das Fenster endet ohnehin über
  ihr, und `dvh` rechnet sie noch einmal heraus. **Das Bittere ist, dass `100dvh` selbst
  ein Fix war** — gegen `100vh`, das zu GROSS war und den Inhalt unter der Adressleiste
  versteckte. Dieselbe Zeile erzeugt jetzt den umgekehrten Fehler. Eine CSS-Einheit rührt
  der Browser nur an, wenn er ohnehin neu rechnet; deshalb half das Neuladen. Der
  belastbare Wert ist `window.visualViewport.height` — als einziger definiert als „was
  gerade zu sehen ist", und er MELDET seine Änderung. Die drei Stufen stehen in
  `src/global.css`, das Messen in `app/+html.tsx`.
- **Ein Fehler, den man am Mac nicht sieht, wird am Screenshot GERECHNET.** (2026-09-06)
  Der Browser am Schreibtisch kennt keine Trennung von Layout- und Sicht-Fenster, also
  war die Lücke dort mit `browser_resize` nicht zu erzeugen — drei Versuche gingen ins
  Leere. Gefunden wurde sie, indem aus Ians Bild die vier Kanten abgelesen und in
  Punkte umgerechnet wurden (Anzeige × 1.28, dann ÷ 3). Erst die Zahl **51 pt** hat die
  Ursache benannt; vorher standen drei gleich plausible Vermutungen nebeneinander.
  **Ein Screenshot ist eine Messung, wenn man ihn ausmisst.**
- **Ein Build-Protokoll darf nie durch `tail` laufen.** (Phase 19, 2026-09-06)
  `npx expo run:ios 2>&1 | tail -60` zeigte am Ende „2 error(s)" — und keinen einzigen
  Grund, weil `tail` genau die `error:`-Zeilen weggeworfen hatte, wegen derer der Aufruf
  lief. Ein Build erzeugt hunderte Zeilen und meldet Fehler in der MITTE. Ganz in eine
  Datei schreiben, hinterher `grep -n "error:"`.
- **Ein Simulator-Build braucht keine Apple-Signatur — ein Gerätebuild schon.**
  (Phase 19) Das ist der Unterschied zwischen „heute" und „wenn Ian Zeit hat": Zertifikate,
  Provisioning und registrierte Geräte verlangt Apple nur für echte Hardware. `npx expo
  run:ios` baut lokal, installiert und startet — und `xcrun simctl openurl booted
  "simplysocial://<route>"` navigiert per Deep Link, macht also den Screen-Durchgang ohne
  Finger möglich. **Was er NICHT ersetzt, sind Gesten** (Phase-18b-Lehre: ein `click` löst
  weder `onPanResponderMove` noch das Kreuzungsverbot aus).
- **Was wie ein Neustart aussieht, ist oft keiner.** (Phase 19) `xcrun simctl terminate`
  + `launch` zeigte die Kaltstart-Hinweise NICHT — und hätte damit die Vorhersage aus
  19.6 scheinbar widerlegt. Der Prozess war nur gar nicht tot; `launch` holte die App
  bloß nach vorn. Mit `pgrep` dazwischen kamen beide Hinweise wie erwartet. Dieselbe
  Falle wie das `browser_navigate` in Phase 18d.
- **Benachbarte Flächen einzeln zu vereinfachen reißt Lücken.** (Phase 19b) Zwei
  Bezirke teilen sich eine Grenze. Douglas-Peucker ist zwar umkehrungsinvariant, teilt
  aber verschiedene Teilstücke verschieden auf. Der Ausweg ist die REIHENFOLGE: erst
  alle Punkte auf ein Raster runden (dann sind geteilte Stützpunkte bitgleich), dann
  glätten. Gilt für jede Karte, jedes Diagramm mit angrenzenden Formen.
- **Der Schwerpunkt einer Fläche liegt oft nicht IN ihr.** (Phase 19b) Bei den
  gebogenen Bezirken (13., 21., 22.) stünde die Zahl beim Nachbarn. Gesucht ist der
  Punkt mit dem größten Abstand zum Rand — und dieser Abstand gehört MITGESPEICHERT
  (`label.r`), weil erst er die Frage „passt die Zahl überhaupt hinein?" beantwortet.
- **`gestureState.dx/dy` ist bei mehreren Fingern der MITTELPUNKT.** (Phase 19b) Ein
  symmetrisches Kneifen bewegt ihn nicht — die Berührung sieht beim Loslassen aus wie
  ein Tipp, und die Auswahl sprang vom 8. in den 1. Bezirk. Gefunden nur mit CDP
  `Input.dispatchTouchEvent`; mit `page.mouse` ist der Fall gar nicht erzeugbar. Dritte
  Fassung der Phase-18b-Lehre.
- **Eine feste Höhe ist auf einem kleinen Schirm eine ganz andere Höhe.** (Phase 19b)
  Über der Karte stehen 235 px Kopf, Umschalter, Suche und Kategorien — **unabhängig
  von der Schirmhöhe**. Eine feste Kartenhöhe von 230 px ließ auf 390 × 844 eine
  Liste von 266 px und auf 360 × 600 **genau 22 px**. Was unter etwas Festem liegt,
  bemisst sich am Anteil, nicht an einer Zahl.
- **Der Web-Export und `visualViewport` können ein Bild verfälschen, ohne dass am Code
  etwas falsch ist.** (Phase 19b) Ein Screenshot zeigte plötzlich angeschnittene Ränder;
  Verdacht war das eigene `preventDefault` beim Mausrad. Gemessen: `visualViewport.scale`
  stand auf 1,089, der Kartenzoom lief davon unabhängig richtig. Ein hängengebliebener
  Seitenzoom im Prüfbrowser — zurückzusetzen nur über CDP `Emulation.setPageScaleFactor`,
  Strg+0 half nicht. **Vor der Fehlersuche im eigenen Code prüfen, ob das MESSGERÄT
  verstellt ist.**
- **`box-none` vererbt sich im Browser anders als auf dem Gerät.** (Phase 19c)
  `react-native-web` macht daraus CSS `pointer-events: none`, und CSS gibt das an ALLE
  Nachkommen weiter — außer an Text-Knoten, denen RNW selbst ein `auto` mitgibt. Ein
  Kasten mit `box-none` ist im Browser also durchlässig, seine Buchstaben aber nicht.
  Das Symptom sieht nach etwas ganz anderem aus: Ein Zug über die Blase markierte Text,
  statt die Karte zu schieben. **Wer einen Kasten über einer Geste baut, sagt an jedem
  Kind ausdrücklich, ob es fängt oder nicht** — `pointerEvents: 'auto'` am Körper.
- **Ein Prüflauf, der das Neue anfasst, misst das Neue und nicht das Alte.** (Phase 19c)
  Der Schiebe-Test griff die Karte in ihrer Mitte an — dort lag seit fünf Minuten die
  neue Blase. Der erste Befund („Schieben geht gar nicht mehr") war falsch, alles lief
  längst richtig. **Gestentests gehören an eine Stelle, die das neue Element NICHT
  bedeckt.** Dieselbe Sorte Fehler wie das `browser_navigate` in 18d: Das Messgerät stand
  im Weg, nicht der Code.
- **Eine gerechnete Zahl braucht die Angabe, welcher Fall sie ist.** (Phase 19c) Die
  Platzrechnung vor dem Bauen stimmte auf den Pixel — die Folgerung „es passt fast nie
  mehr als eine Zeile" war trotzdem falsch, weil sie mit dem ungünstigsten Anker
  gerechnet war und als allgemeine Aussage hergezeigt wurde. Bei einer Spanne immer
  mitsagen: schlechtester Fall oder mittlerer.
- **Eine Zoomstufe von `react-native-maps` ist nicht die Zoomstufe aus der Formel.**
  (Phase 19d) `minZoomLevel={10}`, aus der üblichen Rechnung (Weltbreite 256 · 2^z)
  hergeleitet, ließ die Karte auf **einem Drittel von Wien** aufgehen — die Grenze
  überschrieb den `initialRegion`. Auf iOS wird sie über `cameraZoomRange` in
  ENTFERNUNGEN umgesetzt, und die Umrechnung liegt gut anderthalb Stufen daneben. Bei 9
  passt Wien hinein. **Grenzen einer fremden Kartenbibliothek werden gemessen, nicht
  gerechnet** — und eine Grenze, die den Anfangszustand verändert, sieht aus wie ein
  Fehler im eigenen Code.
- **Drei aufgeschriebene Möglichkeiten sind noch keine drei.** (2026-09-06, Punkt 35)
  „Aufrunden gegen Abrunden" stand drei Wochen als echte Wahl im Plan. `Math.ceil(x)−1`
  und `Math.floor(x)` unterscheiden sich aber nur, wenn `x` genau eine ganze Zahl trifft
  — bei fünf Posts also bei **null von fünf** Werten. Es war eine Randkonvention, keine
  Aussage über die Karte. **Vor dem Fragen nachrechnen, ob die Möglichkeiten sich
  wirklich unterscheiden.**
- **Fast Refresh behält `useState` — ein Anfangswert ändert sich davon nicht.**
  (Phase 19d) Um die Kartenansicht zu prüfen, wurde `useState<Ansicht>('stapel')` auf
  `'karte'` gestellt; auf dem Simulator änderte sich nichts, weil Fast Refresh den
  Zustand rettet. Es braucht `terminate` + `pgrep` + `launch` (dieselbe Falle wie in
  Phase 19). Und: Der Simulator lässt sich ohne Bedienungshilfen-Berechtigung gar nicht
  antippen — **einen Zustand, den man nicht ertippen kann, setzt man vorübergehend im
  Code und nimmt ihn nachweislich zurück** (`git diff` lesen, nicht erinnern).
- **Ein Klick OHNE jede Bewegung ist im Prüfbrowser kein Tipp.** (Phase 19e-1,
  2026-09-07) `mouse.down` gefolgt von `mouse.up` an derselben Stelle löst keinen
  `onPanResponderRelease` aus — der erste Tippversuch auf einen Bezirk tat nichts, und
  das sah nach einer durch `fuellt` kaputten Trefferrechnung aus. Sie war unversehrt:
  Mit einem Ein-Pixel-Ruck dazwischen (was ein echter Finger immer tut) wählte derselbe
  Punkt sofort den richtigen Bezirk. **Vierte Fassung der Phase-18b-Lehre, und diesmal
  andersherum** — nicht „ein `click` ist zu grob für eine Geste", sondern „eine Geste
  ohne Bewegung ist zu sauber für den Erkenner".
- **Ein Anteil kann nicht ausweichen, ein gemessener Deckel schon.** (Phase 19e-1) Die
  oberste Raststufe des Blattes stand als 0,92 der Höhe da — auf 552 px ist das etwas
  anderes als auf 844, und die schwebende Leiste darüber ist auf beiden gleich hoch. Das
  Blatt fuhr darunter, Griff und Überschrift lagen dahinter. Im Code sieht man so etwas
  nie, am Screenshot sofort. **Wer einen Anteil vergibt, fragt: gibt es an dieser Kante
  etwas Festes? Dann gehört dorthin ein gemessener Deckel, kein zweiter Anteil.**
- **Zwei Größen mit fast gleichem Namen sind der Fehler, den man nur beim Lesen
  findet.** (Phase 19e-1) `randUnten` ist, wo das Blatt anfängt; `verdeckt` ist die
  Geometrie nach einem Deckel. Beide sind Zahlen in Bildpunkten, beide betreffen
  „unten", und der Unterschied fällt an keinem Screenshot auf: Die Lizenzzeile lag mit
  dem falschen Wert bei aufgezogenem Blatt dahinter — also genau dann, wenn kaum jemand
  hinsieht. **Beim Einführen einer abgeleiteten Größe beide benennen und danebenschreiben,
  wer welche braucht.**
- **Ein Native-Baustein ist vielleicht schon da.** (Phase 19e-2) `expo-glass-effect`
  musste nie installiert werden: **`expo-router` 57 hängt selbst davon ab**, Autolinking
  nimmt jedes Expo-Modul aus `node_modules` mit, und es war seit dem 19d-1-Build ins
  Binary kompiliert. Aus „ein Baustein, ein Build" wurde eine reine JS-Änderung. **Vor
  dem Einplanen eines Builds nachsehen:** `grep` in `ios/Podfile.lock` und `strings` auf
  `…app/SimplySocial.debug.dylib`.
- **Ein Bild, das falsch aussieht, ist noch kein Fehler.** (Phase 19e-2) Die Apple-Karte
  öffnet auf dem Simulator mit viel Umland und Wiens Süden hinter dem Blatt — das sah
  nach einem kaputten `initialRegion` aus und kostete vier Versuche. Es ist
  `KARTE_MIN_BAND = 0.5`, das die Karte ausdrücklich hinter das Blatt laufen lässt; auf
  Web steht dasselbe Bild. **Vor dem Reparieren die Regel nachrechnen, die das Bild
  erzeugt** — hier stand sie seit einem Tag als benannte Konstante da.
- **Kamerabefehle an `react-native-maps` verpuffen still vor `onMapReady`.**
  (Phase 19e-2) `animateToRegion` und `fitToCoordinates` tun vorher nichts und melden
  nichts — ein Aufruf, der nichts bewirkt, sieht aus wie einer, der gar nicht
  stattfindet. Dazu: **`fitToCoordinates` zählt `mapPadding` NICHT mit** (beides
  zusammen zoomt auf halb Niederösterreich hinaus), `setRegion` schon.
- **`npx expo run:ios` gibt EXIT 0 zurück, auch wenn `xcodebuild` darunter gescheitert
  ist.** (2026-09-07, Gerätebuild) Der Aufruf endete mit 0, und im Protokoll stand
  `xcodebuild: error: Timed out waiting for all destinations…`. **Das ist die
  Phase-19-Lehre in schärferer Form:** Dort warf `tail` die Fehlerzeilen weg, hier lügt
  der Rückgabewert selbst. Ein Build gilt erst als gelaufen, wenn
  `grep -cE "error:|BUILD FAILED"` über das GANZE Protokoll null ergibt — nicht, wenn
  die Shell 0 sagt. (Zweimal am selben Abend zugeschlagen: das zweite Mal bei einem
  falschen `-workspace`-Pfad, auch dort EXIT 0.)
- **Die Team-ID steht im OU-Feld, nicht in der Klammer.** (2026-09-07)
  `security find-identity` zeigt `Apple Development: ian.fhorak@gmail.com (27A3U8F4TS)`
  — die Klammer ist die **Zertifikats**-ID. Die Team-ID ist `OU` aus dem Subject:
  `openssl x509 -noout -subject` → `OU=5TQTMP2L2H`. Wer die Klammer nimmt, bekommt einen
  Signing-Fehler, der wie ein Projektfehler aussieht. `O=Ian Faye horak` (eine Person,
  keine Firma) ist der Beleg, dass es ein **Personal Team** ist — daher die 7 Tage.
- **`ios/` ist git-ignoriert (CNG) — was dort eingetragen wird, ist flüchtig.**
  (2026-09-07) `DEVELOPMENT_TEAM = 5TQTMP2L2H` und `CODE_SIGN_STYLE = Automatic` stehen
  in `ios/SimplySocial.xcodeproj/project.pbxproj`, an beiden Stellen (Debug und
  Release). **Ein `expo prebuild --clean` wirft sie weg**, und der nächste Gerätebuild
  scheitert dann an etwas, das schon einmal gelöst war. Wer den Ordner neu erzeugt,
  setzt beide Zeilen wieder.
- **`CoreDeviceError 12040` heißt fast immer: Das Handy ist GESPERRT — nicht, dass Xcode
  zu alt ist.** (2026-09-07, und ich bin selbst darauf hereingefallen) Die Meldung lautet
  `The developer disk image could not be mounted on this device (CoreDeviceError 12040)`
  und nennt keinen Grund. Ians iPhone läuft auf **iOS 26.6**, Xcode ist **26.5 (Build
  17F42)**, das vorhandene Disk-Image trägt genau diese Build-Nummer — **daraus habe ich
  „Gerät neuer als Xcode" geschlossen, und das war falsch.** Der echte Grund steht erst
  in der Detailausgabe von `xcrun devicectl device install app`:
  `kAMDMobileImageMounterDeviceLocked: The device is locked.`
  **Der Denkfehler ist der lehrreiche Teil:** Eine Zeile darüber stand `Acquired tunnel
  connection to device`, und `developerModeStatus: enabled` — daraus schien zu folgen,
  dass das Gerät offen ist. **Ein Tunnel braucht VERTRAUEN, kein entsperrtes Display.**
  Das sind zwei verschiedene Zustände, und nur einer davon steht in der Ausgabe.
  Merksätze: **`expo run:ios` zeigt nur die generische Hülle** — für den echten Grund
  `devicectl` direkt aufrufen und die ganze Ausgabe lesen. Und: **Ein iPhone sperrt sich
  während des Installierens wieder zu.** Vor dem Versuch die automatische Sperre auf
  „Nie" stellen; eine Wiederholschleife im Sekundentakt gewinnt das Rennen nicht
  zuverlässig (30 Versuche, kein Treffer).
- **Das Disk-Image braucht man zum DEBUGGEN, nicht zum INSTALLIEREN — und für einen
  Gestentest ist ein RELEASE-Build ohnehin der richtige.** (2026-09-07) Gegen
  `-destination 'generic/platform=iOS'` bauen (braucht kein verbundenes Gerät und läuft
  durch, während das Handy weggelegt ist), dann mit `xcrun devicectl device install app`
  aufspielen. Der Release-Build hat sein JavaScript eingebacken, läuft also **ohne Kabel
  und ohne Mac** — genau das, was man jemandem in die Hand drückt. Ein Debug-Build holt
  sein JS live vom Metro-Server und ist dafür der schlechtere.
  ✅ **Am 2026-09-08 beantwortet: iOS 26.6 und Xcode 26.5 passen zusammen.** Das Gerät
  sagt es selbst — `xcrun devicectl device info ddiServices` meldet `buildUpdate: 17F42`
  (genau das Image von Xcode 26.5), dazu `contentIsCompatible: true` und `isUsable: true`.
  Meine Vermutung von gestern ist damit nicht nur unbelegt, sondern **widerlegt**; die
  Sperre war der einzige Grund. **Derselbe Aufruf ist der beste SPERR-TEST, den es gibt:**
  Ein Tunnel braucht Vertrauen, das Disk-Image braucht ein offenes Display — mountet es,
  ist das Handy offen. Das ist eine Messung an genau der Unterscheidung, an der ich mich
  gestern verrannt habe.
- **Eine WEB-Einstellung hat den iOS-Release-Build zerlegt — und im Debug fällt so etwas
  nie auf.** (2026-09-07, der teuerste Fund des Abends) `experiments.baseUrl:
  "/simplysocial"` in `app.json` ist der GitHub-Pages-Unterordner; ohne ihn bleibt die
  Seite weiß, `deploy.sh` prüft ihn deshalb. **Metro stellt dieselbe `baseUrl` aber auch
  beim iOS-Embed allen Asset-Pfaden voran.** Im App-Bundle entsteht dadurch ein Ordner
  `simplysocial/` — und der kollidiert mit der Binärdatei `SimplySocial`, weil macOS
  Groß- und Kleinschreibung **nicht** unterscheidet. Der Build stirbt mit `ENOTDIR: not
  a directory, mkdir …/SimplySocial.app/simplysocial/assets/…`, **nach** dem erfolgreichen
  Bündeln (`iOS Bundled 8894ms (1343 modules)`), im Schritt „Copying 22 asset files".
  **Der Debug-Build sieht das nie**, weil er keine Assets einbackt — das JS kommt live
  vom Metro-Server. Deshalb lief der Simulator-Build vom 2026-09-06 sauber und der erste
  RELEASE-Build ist gescheitert; **auch der App-Store-Build in Phase 21 wäre daran
  gescheitert.** Behoben mit `app.config.js`: `app.json` behält den Wert (lesbar, und
  `deploy.sh` grept ihn), die Config nimmt ihn für alles heraus, was nicht Web ist.
  **Die Ursache war ohne Xcode zu beweisen** — `expo export:embed` mit `--assets-dest`
  in einen Testordner, einmal mit und einmal ohne `baseUrl`: 15 Sekunden statt 15
  Minuten Build. Und die Deploy-Sicherung prüft jetzt das **Ergebnis**
  (`"/simplysocial/_expo/` in `dist/index.html`), nicht mehr nur die Absicht in
  `app.json`: Die Wahrheit steht seit diesem Tag in einer zweiten Datei.
- **Der BAUPLATZ darf nicht in iCloud liegen — der Quellcode schon.** (2026-09-08, und
  der Fehler war meiner) `C.C.Projekts_Ian` liegt auf dem Schreibtisch, und der wird von
  iCloud verwaltet („Schreibtisch & Dokumente"). iCloud hängt an Ordner das Attribut
  `com.apple.FinderInfo` — und `codesign` verweigert dann die Unterschrift:
  `ExpoFileSystem.framework: resource fork, Finder information, or similar detritus not
  allowed`. **Wegräumen hilft nicht, es kommt zurück:** `xattr -c` gefolgt von einer
  Messung nach fünf Sekunden zeigt `com.apple.FinderInfo` und `com.apple.fileprovider.fpfs#P`
  wieder da. Der Ausweg ist ein `-derivedDataPath` **außerhalb** von iCloud
  (`~/Library/Developer/Xcode/DerivedData/…`); die Quellen dürfen bleiben, wo sie sind,
  denn **`rsync -a` kopiert auf macOS keine erweiterten Attribute** — die Markierung am
  gebauten Framework war nicht mitgekommen, sondern am Zielort neu entstanden.
  **Wie ich hineingeraten bin, ist der lehrreiche Teil:** Am Vortag lief derselbe Build
  durch, weil er im Sitzungs-Zwischenspeicher unter `/private/tmp` lag. Ich habe ihn
  danach ausdrücklich in den Projektordner verlegt, *damit die fertige App die Sitzung
  überlebt* — und genau diese Verbesserung war der Fehler. **Ein Ortswechsel ist eine
  Änderung, auch wenn keine Zeile Code anders ist.**
- **Ein gescheiterter Build hat nicht immer eine `error:`-Zeile.** (2026-09-08) Der
  codesign-Fehler oben stand als nackter Satz im Protokoll, gefolgt von `Command
  PhaseScriptExecution failed with a nonzero exit code` — **mitten drin**, 30 Zeilen vor
  dem Ende, und `grep -cE "error:|BUILD FAILED"` zählte trotzdem nur 1 (das `BUILD
  FAILED` selbst). Die gestrige Regel greift also zu kurz: Der belastbare Test ist
  `grep -E "BUILD SUCCEEDED"` — **die Anwesenheit des Erfolgs, nicht die Abwesenheit von
  Fehlern.** Wer den Grund sucht, greppt zusätzlich nach `failed with a nonzero exit
  code` und liest die Zeilen DAVOR.
- **Ein Viewport-Wechsel im Prüfbrowser ist KEIN Tastatur-Test — die App merkt ihn
  nicht.** (Phase 19f, 2026-09-08) Seit dem Fix vom 2026-09-06 nimmt die App ihre Höhe
  aus `window.visualViewport` und schreibt sie in `--ss-hoehe`. Playwrights
  `setViewportSize` löst dessen `resize`-Ereignis **nicht** aus: `window.innerHeight`
  meldet brav 420, `--ss-hoehe` steht weiter auf 600, und die Liste rührt sich nicht.
  Der erste Befund war deshalb „`onLayout` feuert nicht" — falsch, es gab nichts zu
  feuern. Mit `document.documentElement.style.setProperty('--ss-hoehe', '420px')` war
  die Tastatur echt nachgestellt (sichtbare Fläche 386 → 206) und die Liste sprang ans
  Ende. **Wer eine Größenänderung prüft, prüft zuerst, ob die App sie überhaupt
  mitbekommen hat** — dieselbe Sorte Fehler wie der hängengebliebene Seitenzoom in 19b.
- **`scrollToEnd` landet in diesem Projekt 16 px vor dem rechnerischen Ende, und das
  ist richtig so.** (Phase 19f) Gemessen: Inhalt 534, Fläche 386, rechnerisches Maximum
  148 — angefahren wird 132. Die Differenz ist exakt das `paddingBottom` des
  `contentContainer`. Die letzte Nachricht steht dadurch bündig am unteren Rand statt
  16 px darüber. **Wichtig ist nicht die Zahl, sondern dass Öffnen und Fokussieren
  dieselbe Stelle anfahren** — eine Abweichung dazwischen wäre der Fehler gewesen.
- **`minZoomLevel` wird in `react-native-maps` auf iOS NACHGERECHNET — und die
  Rechnung kennt `mapPadding` nicht.** (Phase 19g, 2026-09-08) Nicht MapKits
  `cameraZoomRange` erzwingt die Grenze, sondern `applyLegacyZoomConstrains` in
  `AIRMapManager.m`: Es läuft nach JEDER Ausschnittsänderung, rechnet aus
  `frame.size.width` und `region.span` eine Zoomstufe (`getZoomLevel`) und setzt den
  Ausschnitt **hart neu**, wenn sie unter der Grenze liegt — über die volle
  Kartenfläche, ohne Polsterung. Sobald ein Blatt unten Platz wegnimmt, wird Wien in
  einen schmalen Streifen eingepasst; über die ganze Höhe gerechnet ist das eine
  KLEINERE Stufe, obwohl auf dem Schirm nichts kleiner wird. Gemessen: 8,97 gegen
  eine Grenze von 9 — die Bibliothek riss die Karte **eine Sekunde später** wieder
  auf und zeigte halb Niederösterreich. **Am Bild sah das nach einem falschen
  `initialRegion` aus und stand als solcher im Plan.** Entschieden hat die
  Zahlenfolge im Protokoll: 0,5641 richtig, eine Sekunde später 2,2032. **Wer eine
  Kamera-Grenze setzt, prüft sie mit der Polsterung, die später wirklich anliegt.**
- **`isGesture` gibt es in `react-native-maps` nur für Google Maps.** (Phase 19g)
  Steht in der Typdatei, in drei Kommentaren, und beantwortet die Frage „hat jemand
  die Karte selbst angefasst?" auf Apple nicht. Ersatz ist `onPanDrag` (echter
  Erkenner an der Karte); ein reines Kneifen ohne Schieben bleibt damit unerkannt,
  und das ist der benannte Preis. **Nachgesehen, nicht vermutet** — es sah aus wie
  die naheliegende Lösung.
- **„Steht die Karte auf ihrem Grundausschnitt?" ist NICHT dieselbe Frage wie „hat
  jemand sie angefasst?"** (Phase 19g) Der Vergleich mit `WIEN_REGION` ist für den
  „Ganz Wien"-Knopf richtig und als Bedingung fürs EINPASSEN falsch: Solange Wien
  noch nicht eingepasst IST, steht der Ausschnitt daneben — die Bedingung wäre genau
  dann erfüllt, wenn sie es nicht sein darf, und das Einpassen fände nie statt. Auf
  Ians Bild sieht man dieselbe Ursache von der anderen Seite: Der „Ganz Wien"-Knopf
  stand da, ohne dass er die Karte angefasst hatte. **Eine abgeleitete Bedingung, die
  ihre eigene Wirkung mitmisst, ist keine.**
- **Ein Screenshot trägt eine FASSUNG, und die ist erst einmal unbekannt.** (Phase
  19g) Zwei der gemeldeten Punkte betrafen den Umschalter und den Filter-Knopf — beide
  waren auf Ians Bild noch die Fassung VOR Phase 19f, die am selben Tag ersetzt wurde.
  Nachgemessen: Der Knopf war 109 pt breit, heute 44. **Wer einen Screenshot bekommt,
  liest zuerst ab, was darauf schon anders ist als im Code**, sonst repariert er
  etwas, das es nicht mehr gibt.
- **Der Simulator lässt sich fernsteuern — die Umrechnung misst man an einer Fläche,
  die in BEIDEN Bildern vorkommt.** (Phase 19g) `xcrun simctl io … screenshot` liefert
  das Geräte­bild, `screencapture -R` das Fenster; dazwischen liegen Titelleiste,
  Rahmen und ein Maßstab. Der Rahmen täuscht (er ist an den Ecken gerundet und außen
  liegt Fensterschatten); belastbar ist eine **helle Fläche, die in beiden Bildern
  steht** — hier der weiße Prototyp-Kasten. Zwei Ecken geben Maßstab und Ursprung,
  danach stimmen Tippen und Ziehen aufs Pixel. Gezogen wird mit **echter Bewegung**
  dazwischen (Phase-19e-1-Lehre) und nicht zu langsam: Ein zäher Zug öffnet das
  React-Native-Entwicklermenü.
- **Ein ungenutzter Parameter ist einer, den nie jemand geprüft hat.** (Phase 19h-1,
  2026-09-08) `useProfilPosts` reichte seit Phase 6 `meinBezirk: person.district` in
  die Sortierung — den Bezirk der ANGESCHAUTEN Person statt des eigenen. Vier Wochen
  lang folgenlos, weil `vergleichePosts` den Kontext gar nicht las; der Parameter hieß
  dort `_ctx`, **und genau der Unterstrich war das Warnzeichen**. Sobald die Funktion
  ihn benutzte, war der Fehler sofort wirksam. Wer einen Parameter „für später" in
  einer Signatur stehen lässt, prüft beim ersten echten Gebrauch JEDE Aufrufstelle
  nach — der Compiler schweigt, die Typen stimmen ja.
- **Ein Sortierer, den man nur in EINER Stellung sieht, ist nicht geprüft.**
  (Phase 19h-1) Der Feed sah aus 1070 heraus richtig sortiert aus — er hätte aber
  genauso nach der Postleitzahl aufsteigend sortiert sein können, das Bild wäre fast
  dasselbe gewesen. Der Beleg ist erst das UMSTELLEN: Aus 1220 dreht sich die Folge
  vollständig um. **Bei jeder Regel, die von einem Wert abhängt, den Wert ändern und
  ein zweites Mal messen** — und beide Folgen gegen die gerechneten Zahlen halten.
- **Ein echtes Neuladen setzt den Prototyp-Speicher zurück, eine Client-Navigation
  nicht.** (Phase 19h-1) `browser_navigate` auf eine ANDERE Adresse lädt die Seite
  wirklich neu, und `data/store.ts` lebt im Arbeitsspeicher: Ein gerade umgestellter
  Heimatbezirk war damit wieder weg, und die Prüfung zeigte den alten Zustand. Zu
  erkennen daran, dass der Prototyp-Hinweis wieder aufpoppt. Wer einen ZUSTAND prüft,
  klickt sich durch die Oberfläche (Tab → Screen → zurück) statt zu navigieren.
  **Das ist das Gegenstück zur 18d-Falle**: Dort überlebte ein Zustand ein
  `browser_navigate` auf DIESELBE Adresse, weil Expo Router daraus eine
  Client-Navigation macht. Beide Male ist die Frage dieselbe — hat die App gerade neu
  gestartet oder nicht?
- **Ein Beleg auf der falschen Plattform ist kein Beleg.** (Phase 19i, 2026-09-09)
  Die Kapsel-Maße wurden in 19e-2 im Browser nachgemessen (`z01`, „x = 16, 328 breit")
  — und stimmten dort. Auf iOS klebte die Kapsel an beiden Rändern, weil `start`/`end`
  ein `left`/`right` schlägt (harte Regel 66). **Vier Wochen unbemerkt, und es war eine
  der Ursachen dafür, dass Ian zweimal sagte, das sei kein richtiges Liquid Glass.**
  Wer eine Plattform-Eigenschaft misst, misst sie auf der Plattform, um die es geht —
  bei Glas ist das nur iOS.
- **Ein Effekt, der nicht zu sehen ist, ist nicht dasselbe wie ein Effekt, der nicht
  läuft.** (Phase 19i) Zwei Runden lang stand die Frage „ist das echtes Liquid Glass?"
  im Raum. Sie ist mit einer Farbmessung zu beantworten: **Das Blatt nimmt auf der
  Karte einen Grünstich vom Untergrund an (Grün minus Blau +9,2)** — eine deckende
  Fläche könnte das nicht. Der Effekt lief also. Was fehlte, war Untergrund: 33,2
  Helligkeitsstufen Unterschied auf Ians Vorbild gegen 1,5 bei uns. **Bei einem
  Effekt, der vom Untergrund lebt, misst man den Untergrund und nicht den Effekt.**
- **Der Simulator lässt sich nur mit Bedienungshilfen-Berechtigung antippen.**
  (Phase 19i) `osascript … click at` scheitert mit **−25211** („keine Berechtigung für
  den Hilfszugriff"), und die kann nur Ian geben (Systemeinstellungen → Datenschutz →
  Bedienungshilfen). Das Auslesen der Fenstergeometrie geht trotzdem — **die zwei
  Rechte sind verschieden, und der Unterschied sieht aus wie ein Zufall.** Der Ausweg
  ohne Ian: Interaktives im Browser prüfen (die Geometrie ist laut 19e-2 dieselbe), am
  Simulator nur, was ohne Berührung erreichbar ist, und einen sonst unerreichbaren
  Zustand **vorübergehend im Code setzen und per `git diff` nachweislich zurücknehmen**
  (die 19d-Methode).
- **Fast Refresh übernimmt eine geänderte Position im `tabBarStyle` NICHT.**
  (Phase 19i) Nach dem Fix an der Kapsel zeigte der Simulator weiterhin Seitenrand 0;
  erst `terminate` + `launch` brachte die 16 pt. Dieselbe Familie wie „Fast Refresh
  behält `useState`" (Phase 19d) — **wer eine Layout-Konstante ändert, startet die App
  neu, bevor er misst.**
- **`pod install` verlangt inzwischen `cmake` — und meldet den Fehlschlag mit EXIT 0.**
  (Phase 19h-2, 2026-09-09) `hermes-engine.podspec` ruft
  `Pod::Executable::which!('cmake')`; ohne cmake bricht es mit *„Unable to locate the
  executable cmake"* ab. `npx expo prebuild` schluckt das zu einer Warnzeile und gibt
  **0 zurück** — dieselbe Familie wie „`expo run:ios` gibt EXIT 0 zurück, auch wenn
  `xcodebuild` gescheitert ist". **Der belastbare Test nach einem Prebuild ist deshalb
  nicht der Rückgabewert, sondern `ios/Podfile.lock`**: Sie ist nach einem
  gescheiterten Lauf schlicht WEG, und der neue Baustein steht nicht drin.
  Behoben mit `brew install cmake`.
- **Ein `expo prebuild` OHNE `--clean` wirft die Signatur-Zeilen genauso weg.**
  (Phase 19h-2) Die Notiz vom 2026-09-07 nennt nur `--clean`; es trifft auch den
  gewöhnlichen Lauf. `DEVELOPMENT_TEAM` und `CODE_SIGN_STYLE` waren beide Male aus
  `project.pbxproj` verschwunden. **Vor jedem Prebuild eine Kopie der Datei anlegen**
  — für einen Simulator-Build fällt es nicht auf (der braucht keine Signatur), und
  genau deshalb merkt man es erst beim nächsten GERÄTEbuild, also Tage später.
  Und: Der Erlaubnis-Text aus einem Config-Plugin (`locationWhenInUsePermission`)
  entsteht **nur** beim Prebuild — wer ihn nur in `app.json` einträgt und nicht
  prebuildet, hat ihn nirgends. Geprüft wird er im GEBAUTEN Bundle
  (`PlistBuddy -c Print :NSLocation… SimplySocial.app/Info.plist`), nicht in `app.json`.
- **Ein `await import(...)` wird im Dev-Server zu einem nachgeladenen Brocken.**
  (Phase 19h-2) Metro bündelt mit `lazy=true`, also holt der dynamische Import beim
  Klick eine neue Datei vom Server — und braucht Metro genau in dem Moment. Beim
  Prüfen war Metro unter der Last eines parallel laufenden Xcode-Builds kurz weg, die
  Seite lud neu, **und damit war der ganze Prüfzustand zurückgesetzt** (Speicher,
  nachgestellter Standort). Das sah nach einem kaputten Schalter aus. Ein dynamischer
  Import lohnt nur gegen einen Modul-Nebeneffekt beim Laden — gibt es keinen (kein
  `requireNativeViewManager`, keine View), ist er reine Fehlerquelle.
- **Ein schlafender Mac-Bildschirm nimmt dem Simulator sein FENSTER.** (Phase 19h-2)
  `count of windows` meldet dann 0, das Fenstermenü kennt das Gerät trotzdem, und ein
  `screencapture` liefert ein komplett schwarzes Bild. **Das sieht aus wie eine
  fehlende Bedienungshilfen-Berechtigung und ist eine andere Ursache** — daran zu
  unterscheiden, dass sich Menüleiste und Menüeinträge des Simulators problemlos
  AUSLESEN lassen (das verlangt dieselbe Berechtigung). Wer am Simulator tippen will,
  prüft zuerst, ob überhaupt ein Bildschirm wach ist.
- **Beim ABBAU eines Navigators schreibt `expo-router` die Adresse neu — auf die erste
  Route im Verzeichnis.** (Phase 20.3-a, 2026-09-09) Der Torwächter zeichnet den
  `Stack` beim Abmelden nicht mehr; die Adresse sprang dabei von `/einstellungen` auf
  **`/account-loeschen`**, eine Seite, die niemand geöffnet hatte — sie ist nur
  alphabetisch die erste unter `app/`. **Sichtbar war davon NICHTS**, der
  Anmelde-Bildschirm stand richtig da; erst ein Neuladen hätte jemanden auf dem
  Lösch-Screen abgesetzt. Der Ausweg ist, die Adresse ABSICHTLICH zu setzen
  (`router.replace('/')` vor dem Abmelden) — dann hat der Abbau nichts zu raten.
  **Allgemein: Wer einen Navigator bedingt rendert, misst nach dem Umschalten
  `location.href`, nicht nur den Bildschirm.**
- **Ein Prüfklick, der „danebengeht", hat oft eine Entscheidung getroffen.**
  (Phase 20.3-a) Ein Klick auf die Abmelden-Zeile lief in einen Timeout mit
  *„`Verstanden` intercepts pointer events"* — das ist der Prototyp-Hinweis, und er
  SOLL alles überdecken (Ians Entscheidung 48, harte Regel 22). Zweite Fassung der
  `elementFromPoint`-Lehre vom 2026-09-03: Wer die Meldung als Fehler liest,
  repariert eine Entscheidung. Im Prüfbrowser gehört deshalb vor jeden Screen-Test
  ein „Verstanden".
- **Ein Haken je LISTENZEILE abonniert den Speicher je Zeile.** (Phase 20.3-a) Die
  naheliegende Umstellung war, `useCurrentUserId()` in `ChatZeile` und `Blase` zu
  rufen — bei fünfzig Nachrichten fünfzig Abonnements für eine Antwort, die für alle
  Zeilen dieselbe ist. Sie kommt jetzt als Prop von oben, dieselbe Überlegung wie
  `useUserMap()` statt `find` je Zeile. **Gilt für jeden Wert, der in einer Liste
  konstant ist.**
- **Eine Prüfung mit Backticks in doppelten Anführungszeichen misst NICHTS und meldet
  grün.** (Phase 20.5, 2026-09-10) In `30_wettlauf.sh` stand
  ``pruef "… auf `full`" "$STATUS" "full"`` — Projektkonvention in Kommentaren, in der
  Shell aber eine Befehlsersetzung. `full` wurde ausgeführt, beide Seiten des
  Vergleichs waren leer, und `"" = ""` ist wahr: **ein Häkchen ohne Messung.**
  Aufgefallen nur, weil `full: command not found` danebenstand. Dieselbe Familie wie
  die Backticks im CSS-Template vom 2026-09-02 — **Backticks sind in Kommentaren
  Konvention und überall sonst Syntax.**
- **`perform` gibt es nur INNERHALB von plpgsql.** (Phase 20.5) In einer `.sql`-Datei
  außerhalb eines `do $$ … $$` heißt es `select`. Die Meldung lautet schlicht
  `syntax error at or near "perform"` und sieht aus, als wäre die Funktion kaputt.
- **Eine Prüfung, die eine BEDEUTUNGSÄNDERUNG nicht merkt, prüft die Umsetzung.**
  (Phase 20.5) Nach Ians Entscheidung 41 wird eine aufgelöste Gruppe nicht mehr
  gelöscht, sondern bekommt ein Datum. Zwei bestehende Prüfungen fragten
  `count(*) = 0` und wurden rot — **richtig so**: Sie hingen an „die Zeile ist weg"
  statt an „die Gruppe hat aufgehört". Wer eine Regel prüft, formuliert die Prüfung in
  den Worten der REGEL, nicht in denen der Zeile.
- **Ein veraltetes Metro-Bündel meldet einen Fehler, den es nicht gibt.** (Phase 20.4,
  2026-09-10, zweimal hineingetappt) Nach dem Anlegen eines neuen Posts in `mock.ts`
  zeigte `/post/p20` „Diesen Post gibt es nicht mehr" — und das sah nach einer kaputten
  Sichtbarkeitsregel aus. Der Post war in Ordnung; Metros Dateiwächter hatte die
  Änderung nicht übernommen und lieferte weiter das alte Bündel („Web Bundled 17ms
  (1 module)"). **Ein neuer Query-Parameter hilft nicht** — der lädt die SEITE neu, nicht
  das Bündel. Erkennbar daran, dass `curl` auf die `.bundle`-Adresse den neuen Text
  schon enthält, der Browser aber nicht; behoben mit `pkill -f "expo start"` und
  `--clear`. **Dieselbe Familie wie der hängengebliebene Seitenzoom in 19b: vor der
  Fehlersuche im eigenen Code prüfen, ob das Messgerät den Code überhaupt kennt.**
- **Ein `import type` erzeugt keine Abhängigkeit — das macht Regel-Dateien einzeln
  prüfbar.** (Phase 20.4) `data/zeilen.ts`, `groups/gruppe.ts` und `chat/direkt.ts`
  importieren ausschließlich Typen. Nach `tsc` bleibt in den .js-Dateien kein einziger
  Import übrig, also laufen sie in blankem Node — ohne Expo, ohne Metro, ohne React.
  Genau darauf steht `40_uebersetzung.sh`: echte Zeilen aus Postgres durch die echte
  Regel-Datei. **Wer eine Regel-Datei so hält, kann sie später gegen echte Daten
  prüfen; wer einen Baustein hineinimportiert, kann es nicht mehr.**
- **`-allowProvisioningUpdates` holt nur ein neues Profil, wenn GAR KEINES passt — ein
  fast abgelaufenes ist ihm lieber als keines.** (2026-09-11, und es hat einen
  20-Minuten-Build wertlos gemacht.) Ian war dem Developer-Programm beigetreten, Xcode
  zeigte „Individual“, das Zertifikat gilt bis 2027 — und `xcodebuild` bettete trotzdem
  das zwischengespeicherte Profil vom 2026-09-07 ein: `TimeToLive: 7`,
  `ExpirationDate 2026-09-14`. **Der Build meldete `BUILD SUCCEEDED`, und die App wäre
  am 14.09. genauso gestorben wie vorher.**
  **Die Lehre ist schärfer als „grep nach dem Erfolg“:** `BUILD SUCCEEDED` beantwortet
  *„hat er gebaut?“* — gebaut wurde aber wegen *„gilt sie ein Jahr?“*, und die beiden
  Antworten waren verschieden. **Nach jedem Gerätebuild wird das eingebettete Profil
  gemessen** (`security cms -D -i …/embedded.mobileprovision`, dann `TimeToLive`), nicht
  das Protokoll gelesen. Der Ausweg ist, das alte Profil aus
  `~/Library/Developer/Xcode/UserData/Provisioning Profiles/` **wegzuräumen, bevor**
  gebaut wird; danach stand dort `TimeToLive: 365`. Beides steckt seither in
  `scripts/geraet-bauen.sh` — die Nachprüfung bricht mit einem Fehler ab, statt „fertig“
  zu melden.
- **Ein Zertifikat und ein Profil laufen verschieden ab, und nur eines davon war je das
  Problem.** (2026-09-11) Das Zertifikat gilt immer ~1 Jahr (hier bis 2027-05-22) und
  bleibt beim Programmbeitritt dasselbe; die 7-Tage-Grenze einer Gratis-Apple-ID steckt
  **ausschließlich im Profil**. Wer bei „läuft in 3 Tagen ab“ das Zertifikat prüft,
  misst die falsche Hälfte.
- **Die Publication `supabase_realtime` ist in einem frischen Projekt LEER — und ein
  Abo darauf verbindet sich trotzdem sauber.** (Phase 20.4-b, 2026-09-12) `subscribe()`
  meldet `SUBSCRIBED`, der Kanal steht, und es kommt nie ein Ereignis. Kein Fehler,
  keine Warnung. Für die App sieht das aus, als passierte nichts. Dieselbe Familie wie
  „Kamerabefehle verpuffen still vor `onMapReady`": **Ein Aufruf, der nichts tut, sieht
  aus wie einer, der nicht stattfindet.** Der Wächter dagegen ist eine Messung —
  `einspielen.sh` zählt die Tabellen in der Publication mit.
- **„Database error querying schema" von GoTrue heißt fast immer: acht `NULL`s in
  `auth.users`.** (Phase 20.4-b) Wer einen Nutzer direkt per SQL anlegt, muss
  `confirmation_token`, `recovery_token`, `email_change`, `email_change_token_new`,
  `email_change_token_current`, `phone_change`, `phone_change_token` und
  `reauthentication_token` auf **`''`** setzen, nicht auf `NULL`: GoTrue ist in Go
  geschrieben und scannt sie in ein `string`, nicht in ein `*string`. Die Meldung nennt
  weder Spalte noch Grund und klingt nach kaputtem Schema. Dazu gehören `aud`, `role`,
  `instance_id` und ein gesetztes `email_confirmed_at` — sonst kommt „Invalid login
  credentials", was wie ein falsches Passwort aussieht und ein fehlendes Feld ist.
- **Ein Wächter hinter einem anderen ist ein ungeprüfter Wächter.** (Phase 20.4-b) In
  `0005_realtime.sql` standen zwei Prüfungen: erst der Zähler („elf Tabellen?"), dann
  die Regel-10-Prüfung („steht `blocks` drin?"). Die Gegenprobe mit `blocks` brach am
  ZÄHLER ab (12 statt 11) — die zweite Prüfung kam nie dran und war damit unbelegt.
  **Und der teure Fall ist ein anderer:** Wer `blocks` gegen `follows` TAUSCHT, bleibt
  bei elf. Reihenfolge gedreht, beide jetzt einzeln belegt. Dieselbe Familie wie die
  Team-Prüfung in `geraet-bauen.sh`, die still eine 0 ergab.
- **`n_live_tup` ist ein SCHÄTZWERT, kein Zähler.** (Phase 20.4-b) Nach dem Abräumen
  meldete `pg_stat_user_tables` `profiles=5`, während `select count(*)` 0 ergab — die
  Statistiken waren einfach noch nicht nachgezogen. Wer prüft, ob wirklich etwas weg
  ist, zählt. Dieselbe Familie wie der hängengebliebene Seitenzoom in 19b: **vor der
  Fehlersuche prüfen, ob das Messgerät stimmt.**
- **Ein Abräumen, das den Zustand eines GESCHEITERTEN Abräumens nicht aufräumen kann,
  ist nur beim Schönwetter-Lauf vollständig.** (Phase 20.4-b) `52_abraeumen.sql` löscht
  Chat-Fäden über ihre Teilnehmer. Bricht der Lauf mitten drin ab, sind die Konten schon
  weg und `chat_participants` mit ihnen (Cascade) — dann findet die Abfrage nichts mehr,
  und die Fäden bleiben mit ihren FESTEN IDs liegen. Der nächste Lauf scheitert dann an
  einem Schlüsselkonflikt in `05_daten.sql` und sieht aus wie kaputte Prüfdaten.
  Zweite Bedingung: Fäden ohne jeden Teilnehmer.
- **Ein verwaister Playwright-Lock sieht aus wie ein laufender Browser.** (2026-09-12)
  `Browser is already in use … use --isolated` — und `pgrep` fand keinen einzigen
  Prozess dazu; der `SingletonLock` in `~/Library/Caches/ms-playwright-mcp/` war zwei
  Tage alt. Löschen (samt `SingletonCookie` und `SingletonSocket`) genügt. Dritte
  Fassung von „prüf zuerst, ob das Messgerät verstellt ist".
- **`auth-js` fällt ohne `localStorage` STILL auf Arbeitsspeicher zurück.** (Phase
  20.3-b1, 2026-09-12) Die Annahme war, `persistSession: true` brauche auf React Native
  zwingend `AsyncStorage` — sonst Absturz oder wenigstens eine Warnung. Nachgesehen in
  `GoTrueClient.js`: Es prüft `supportsLocalStorage()` und nimmt sonst
  `memoryLocalStorageAdapter`. **Kein Absturz, keine Warnung, die Sitzung überlebt nur
  den Neustart nicht.** Damit kostet der Schalter keinen Pod und keinen Build — und die
  Notiz im Dateikopf, die das Gegenteil behauptete, war eine FOLGERUNG und keine
  Messung. Wer eine Bibliothek als Begründung für einen Build anführt, sieht vorher in
  ihren Quelltext.
- **Ein ESM-Import in blankem Node braucht die `.js`-Endung, tsc schreibt sie nicht.**
  (Phase 20.3-b1) Mit `moduleResolution: bundler` bleibt `from './konto'` stehen, weil
  tsc davon ausgeht, dass ein Bundler folgt. Node meldet `ERR_MODULE_NOT_FOUND` mit
  einem Pfad, der **bis auf die fehlenden drei Zeichen richtig aussieht** — man liest
  ihn dreimal, bevor man es sieht. In `60_konto.sh` erledigt das ein `sed` neben den
  `@/`-Aliasen.
- **Ein Prüfstand, der eigenes `node_modules` braucht, gehört INS Projekt.** (Phase
  20.3-b1) `50_lesen.sh` baut nach `mktemp -d` und prüft ausdrücklich, dass kein
  Laufzeit-Import von `supabase-js` übrig bleibt. `konten.ts` hat einen — der
  Standardwert `sb = client()` zieht `lib/supabase.ts` und damit das Paket mit. Von
  außerhalb des Projekts findet Node es nicht. Der Ausweg ist ein git-ignorierter Ordner
  **im** Projekt (`.pruef-konto/`), nicht eine Attrappe für `client()`: Eine Nachbildung
  im Prüfstand prüft die Nachbildung.
- **Ein Screenshot beantwortet nicht, was man ihn fragt.** (2026-09-12) Auf dem
  Prototyp-Bild stand am rechten Stapel-Knopf „Verstanden" statt „Bin dabei", und das
  sah nach einer Regression aus. Es ist die ANLEITUNGSKARTE — deren rechter Knopf heißt
  seit Phase 11 so (`WischStapel.tsx`, `oben.art === 'post'`). **Vor der Fehlersuche
  nachlesen, welcher Zustand gerade gezeichnet ist**; dieselbe Familie wie „ein Bild,
  das falsch aussieht, ist noch kein Fehler" (19e-2).
- **Ein Playwright-Lock ist NICHT immer verwaist.** (2026-09-12) Die Fallen-Liste sagt
  seit dem Vortag, `SingletonLock` löschen genüge. Diesmal liefen **12 echte Prozesse**,
  und die PID im Lock zeigte auf einen davon — ein Browser aus einer früheren Sitzung.
  **Erst `pgrep` gegen die PID im Lock halten, dann entscheiden**, ob man löscht oder
  schließt.
- **`signInWithOtp` nimmt bei einem NEUEN Konto die Vorlage „Confirm signup", nicht
  „Magic Link".** (2026-09-12) Ian hatte „Magic link or OTP" auf `{{ .Token }}`
  umgestellt und bekam trotzdem einen Link: Weil es sein Konto noch nicht gab, war es
  eine Registrierung. **Der Fehler tritt pro Mensch genau EINMAL auf** — beim zweiten
  Versuch existiert das Konto und die Magic-Link-Vorlage greift. Wer selbst testet,
  sieht ihn einmal und hält ihn für behoben, während jeder Neue wieder hineinläuft.
  **Beide Vorlagen brauchen `{{ .Token }}`.** Dieselbe Sorte wie die Attrappen-Falle:
  Der eigene Zustand ist nicht der Zustand, in dem die anderen ankommen.
- **Ein Kommentar, der eine Sicherheitszusage begründet, veraltet lautlos.**
  (2026-09-12) Der Wächter in `50_lesen.sh` sperrte jede nicht-leere Datenbank mit dem
  Satz *„das Abräumen unterscheidet nicht, wem eine Zeile gehört."* Das Abräumen
  daneben war längst umgeschrieben und nannte die fünf UUIDs beim Namen. **Der
  Kommentar war der einzige Grund für die Sperre und der einzige Teil, der nicht mehr
  stimmte** — und der vorgeschlagene Ausweg („nimm ein zweites Supabase-Projekt") hätte
  20 Minuten Klickarbeit und eine zweite driftende Datenbank gekostet. Vor dem Befolgen
  einer Warnung nachsehen, ob der Code darunter sie noch trägt.
- **Eine Prüfung mit `count(*)` über eine ganze Tabelle prüft die Tabelle, nicht sich
  selbst.** (2026-09-12) Nach dem Umbau des Wächters war die nächste Zeile sofort rot:
  `✗ Erwartet: 2 Konten, 0 Profile. Ist: 4 / 1`. Nichts war kaputt — es standen zwei
  fremde Konten daneben. Dieselbe Sorte beim Handle-Vergleich
  (`["@realtimeprobe","ian","ian2"]`). **Die gefährliche Richtung ist die andere:**
  Ein globales `count(*) = 0` nach dem Abräumen ist auch dann grün, wenn MEHR gelöscht
  wurde als die eigenen Zeilen. Gefragt wird mit `where id in (…)`.
- **Ein Prüfstand darf neben echten Daten laufen — der Beleg ist nicht sein grüner
  Lauf.** (2026-09-12) `29 Häkchen, 0 Kreuze` beweist, dass das Skript funktioniert.
  Dass es NICHTS Fremdes angefasst hat, beweist erst die Zählung der fremden Zeilen
  hinterher. Zwei verschiedene Fragen, und nur die zweite ist die, wegen der man den
  Umbau gemacht hat.
- **Supabase Realtime verliert nach einer Ruhepause das ERSTE Ereignis — und meldet
  trotzdem `SUBSCRIBED`.** (2026-09-12, reproduziert) Nach zwölf Minuten ohne
  Verbindung: Kanal verbunden, Schreiben durch, Ereignis weg; ein zweiter Anstoß
  1,5 s später kam an. Warm kamen in fünf von fünf Läufen beide an. Der Beitritt wird
  also bestätigt, bevor der WAL-Leser wirklich an der aktuellen Stelle steht —
  dieselbe Familie wie „Kamerabefehle verpuffen still vor `onMapReady`". **Wer ein
  Realtime-Abo prüft, stupst zweimal und misst beide Anstöße getrennt**; ein `retry`
  macht daraus ein „irgendwann klappt es schon".
- **Ein Mechanismus, den man im fremden Quelltext FINDET, ist eine Hypothese.**
  (2026-09-12) In `RealtimeChannel.js` liest `subscribe()` den Token synchron, während
  `setAuth` async ist und von supabase-js nicht erwartet wird — ein lupenreines
  Wettrennen, sichtbar im Code, und **nicht** die Ursache des Fehlers, den es erklären
  sollte. Vier Läufe mit `await` und vier ohne waren gleich grün. Der Code sagt, was
  passieren KANN; was passiert IST, sagt nur die Messung.
- **Zwei Konfigurationen nacheinander zu messen misst auch die Reihenfolge.**
  (2026-09-12) Der erste Vergleich („ohne `await`" zuerst, „mit" danach) sah eindeutig
  aus: rot, dann grün. Gedreht war er genauso eindeutig — und andersherum. Erst acht
  frische Prozesse, je vier pro Seite, gaben die Antwort (8/8 grün, kein Unterschied).
  Dieselbe Lehre wie „ein Sortierer, den man nur in EINER Stellung sieht, ist nicht
  geprüft" (19h-1), nur auf den Prüfaufbau angewandt statt auf das Geprüfte.
- **Ein `grant` in einer Migration NIMMT am echten Supabase nichts weg.** (Phase 20.5,
  2026-09-12) Dort gilt für `public` eine Voreinstellung, die jeder neuen Tabelle alle
  Rechte an `anon` und `authenticated` gibt; eine Migration fügt danach nur hinzu.
  Gemessen: `group_members` lokal `SELECT`, echt alles. **Das Symptom war ein stilles
  Nichts** — `beitrittZuruecknehmen` löschte am Server nichts und meldete nichts, weil
  bei DELETE eine fehlende Policy null Zeilen ergibt statt eines Fehlers. Wer eine
  Rechteliste durchsetzen will, braucht ein `revoke` davor (harte Regel 85).
- **Ein Wächter, der auch Dateien prüft, die niemand öffnet, sperrt zu viel.**
  (Phase 20.5) Die erste Fassung von `70_schreiben.sh` verlangte, dass in KEINER
  gebauten Datei ein `@/`-Alias steht — und schlug an `mock.js` an. Die wird mitgebaut,
  weil `laden.ts` über `import type { AppState }` bis `store.ts` reicht und **tsc alles
  TYPPRÜFT, was es erreicht, auch das, was zur Laufzeit nie geladen wird.** Gefragt
  werden jetzt die vier Dateien, die wirklich geladen werden, plus eine Gegenprobe, dass
  `senden.js` und `laden.js` `mock` auch über keinen Umweg ziehen.
- **Ein falscher Enum-Wert meldet sich als `22P02` und ist ein guter Beleg.**
  (Phase 20.5) `level: 'egal'` statt `'any'` im Prüfstand — der Fehler kam nicht aus
  TypeScript (das Prüfskript ist `.mjs`), sondern aus Postgres, durch PostgREST hindurch.
  **Damit war nebenbei belegt, dass die ganze Kette wirklich steht**, bevor die erste
  richtige Messung lief.
- **Ein Playwright-Lock ist NICHT immer verwaist — und diesmal war es keines.**
  (2026-09-12, zweite Fassung) `pgrep` gegen die PID im `SingletonLock` fand einen
  echten Chrome aus einer früheren Sitzung. Geschlossen statt gelöscht; danach lief es.
  **Erst messen, dann entscheiden, ob man löscht oder schliesst.**
- **Zwei Screenshots im gleichen Zustand vergleichen, nicht zwei Screenshots.**
  (Phase 20.5) Der erste Vergleich meldete „das ganze Bild ist anders" — der eine zeigte
  den Prototyp-Hinweis beim ersten Öffnen, der andere den Stapel danach. Nach einem
  Klick auf „Verstanden" war die Bounding-Box der Unterschiede **leer**. Dieselbe Familie
  wie „ein Screenshot beantwortet nicht, was man ihn fragt" — hier lag es nicht an der
  Fassung, sondern am ZUSTAND.
- **Eine Attrappe kann auch SCHWÄCHER sein als das Original — und das ist die
  gefährlichere Richtung.** (Phase 20.6, 2026-09-12) Bisher war die Wegwerf-Datenbank
  strenger (0007, die Rechte) oder ärmer an Rauschen (der Trigger-Zähler). Hier fehlte
  ihr Supabases `storage.protect_delete`: Migration 0008 löschte in `konto_loeschen()`
  das Profilbild per SQL, lokal lief es durch, `25_bilder.sql` war grün — **und am
  echten Server war dadurch die Funktion hinter einer Apple-1.2-Pflicht kaputt.** Wer
  ein FREMDES Schema anfasst (`storage`, `auth`), fragt zuerst `pg_trigger` und
  `pg_policies` am Original ab und baut nach, was dort steht.
- **Eine Migration, aus der man eine Zeile HERAUSNIMMT, nimmt sie am Server nicht
  zurück.** (Phase 20.6) Dort steht, was beim ERSTEN Lauf eingespielt wurde. Eine
  berichtigte Datei ist keine Rücknahme — die Funktion muss ausdrücklich auf den alten
  Stand gesetzt werden (`create or replace` mit dem alten Rumpf), und danach wird
  gemessen, nicht angenommen. Dieselbe Lehre wie die 19d-Methode, eine Ebene tiefer.
- **Eine gelöschte Datei ist weg, ihre ADRESSE antwortet trotzdem.** (Phase 20.6)
  Supabase liefert öffentliche Objekte über Cloudflare aus, mit `max-age=3600` als
  Standard von `supabase-js`. Nach dem Löschen: `200` mit `cf=HIT`, mit einem
  Cache-Buster daran `400`. **Wer prüfen will, ob eine Datei wirklich weg ist, fragt
  am Cache vorbei** — und wer einem Menschen „sofort weg" verspricht, misst vorher,
  wie lange „sofort" dauert (Ians Entscheidung 51: `cacheControl` auf 300).
- **`getBucket()` meldet „Bucket not found", wenn man ihn nicht sehen DARF.**
  (Phase 20.6) `storage.buckets` hat RLS an und null Policies, ein gewöhnlicher Nutzer
  sieht also keinen einzigen Bucket. Die Meldung sagt *es gibt ihn nicht*, wo *du
  darfst ihn nicht sehen* gemeint ist — wer sie für bare Münze nimmt, sucht den Fehler
  in der Migration. Die Bucket-Einstellungen misst man über `psql`.
- **Es gibt ZWEI Knöpfe mit der Aufschrift „Verstanden", und sie tun Verschiedenes.**
  (Phase 20.6) Der eine schließt den Prototyp-Hinweis (Vollbild, oben), der andere ist
  der rechte Stapel-Knopf der ANLEITUNGSKARTE (unten, seit Phase 11). Ein Prüfskript,
  das den ersten passenden klickt, wischt die Anleitungskarte weg — und der
  anschließende Pixelvergleich zeigt dann einen Unterschied, der keiner ist. Gemessen
  auf 390 × 844: y = 482 (Hinweis) gegen y = 666 (Karte). **Dritte Fassung von „zwei
  Screenshots im gleichen Zustand vergleichen, nicht zwei Screenshots".**
- **Eine Prüfung, die NAMEN aufzählt, merkt nicht, wenn etwas dazukommt.** (Phase 20.6)
  `70_schreiben.mjs` sagte „genau diese acht warten" und blieb grün, als zwei neue
  Schreib-Aktionen dazukamen — die Aussage stimmte nicht mehr, die Prüfung schon.
  Behoben mit `SCHREIB_AKTIONEN` aus `EINORDNUNG`: Die dritte Prüfung zählt auf, was in
  keiner der beiden Listen steht. **Wer zwei Listen prüft, prüft als Drittes ihre
  Vollständigkeit.**
- **`UID` ist in zsh reserviert.** (Phase 20.6) `UID=… node skript.mjs` scheitert mit
  *„failed to change user ID: operation not permitted"* — das sieht nach einem
  Rechteproblem aus und ist ein Namenskonflikt.
- **Ein Pixelvergleich braucht eine Gegenprobe GEGEN SICH SELBST.** (2026-09-12,
  Lösch-Screen) Der Screenshot nach dem Umbau wich von der Referenz um **4 von
  329.160 Pixeln** ab — verstreut, je genau eine Farbstufe (250→249, 180→181). Das
  sieht nach einer winzigen echten Änderung aus und ist keine: Eine ZWEITE Aufnahme
  derselben, unveränderten Seite wich von der ERSTEN um genau dieselben 4 Pixel ab
  und war mit der Referenz **exakt** identisch. Es ist Aufnahme-Rauschen (eine
  Transition, die noch lief). **Wer „Pixel für Pixel identisch" behaupten oder
  widerlegen will, nimmt zwei Aufnahmen und vergleicht zuerst die miteinander** —
  sonst hält man das Messgerät für den Code. Dieselbe Familie wie der
  hängengebliebene Seitenzoom in 19b und das veraltete Metro-Bündel in 20.4.
- **Länge ist keine Geheimhaltung.** (2026-09-13) `provider-api.py` maskierte seine
  Ausgabe mit `len(v) > 40 → «gesetzt»`. Ians Google-Client-Secret ist **35 Zeichen**
  lang und stand damit im Klartext auf dem Bildschirm. Das Bittere: Die Filterfunktion
  dagegen (`ohne_geheimnisse()`) gab es in derselben Datei längst — sie wurde an der
  einen Stelle nicht benutzt, an der es darauf ankam. **Ein vorhandener Schutz, der
  an einer Stelle umgangen wird, ist schlimmer als keiner**, weil man ihn für
  vorhanden hält. Maskiert wird nach IDENTITÄT (der Wert steht in einer Liste), nie
  nach einer Heuristik. Dieselbe Familie wie „ein Wächter hinter einem anderen ist
  ein ungeprüfter Wächter" (20.4-b).
- **Ein Wächter, der eine ÄHNLICHE Frage stellt, ist kein Wächter.** (2026-09-13)
  `mgmt-token.sh` prüfte einen Management-Token über `/v1/projects` — bequem, weil die
  Antwort den Projekt-Verweis enthält. Falsch aus zwei Gründen, beide gemessen: Ein
  fein zugeschnittener Token DARF dort mit 403 antworten und trotzdem können, wofür er
  geholt wurde; und ein Token, der die Auth-Einstellungen nur LESEN darf, kam glatt
  durch und scheiterte eine Minute später am PATCH — nachdem das Apple-Geheimnis schon
  erzeugt war. **Geprüft wird genau der Aufruf, den man benutzt** — beim Schreiben mit
  einem `PATCH`, der ein vorhandenes Feld auf seinen EIGENEN, aus der GET-Antwort
  gelesenen Wert setzt. Ein geratener Wert wäre selbst eine Änderung.
- **Ein `403` auf mehreren Endpunkten heißt NICHT „der Token kann gar nichts".**
  (2026-09-13, eigene Fehldiagnose) Aus `403` auf Organisationen, Projekten UND
  Auth-Config wurde geschlossen, es sei keine Berechtigung angekommen. Bei einem eng
  zugeschnittenen Token sind die ersten beiden 403 **das erwartete Verhalten**;
  aussagekräftig war nur der dritte. Zweite Lehre daneben: Supabases *scoped* Token
  liefern an manchen Endpunkten 403, wo ein **klassischer** PAT durchgeht — ein
  offener Fehler bei Supabase (Issue #50244), also keine Einstellungssache. **Wer
  Berechtigungen diagnostiziert, fragt die Endpunkte einzeln und weiß vorher, welche
  Antwort bei welchem normal ist.**
- **Eine Einstellung ist angenommen, bevor sie gilt — und eine Prüfung, die zu früh
  fragt, ist ein Fehlalarm.** (2026-09-13) Die Management-API bestätigte den PATCH mit
  200, `/auth/v1/settings` meldete Sekunden später weiter `apple: false`. Nichts war
  kaputt: GoTrue liest seine Konfiguration verzögert neu. Der Lauf meldete trotzdem
  „✗ Nicht alles steht" — und ein Fehlalarm an dieser Stelle schickt jemanden zurück
  ins Dashboard, um etwas zu reparieren, das steht. Jetzt wird in Stufen nachgefragt
  (0 · 3 · 5 · 8 · 12 s) und erst danach geurteilt. **Und die Unterscheidung, die den
  Fall löst, ist billig:** die KONFIGURATION gegen die AUSKUNFT halten — steht es
  dort schon, hinkt nur die Auskunft.
- **Apples `.p8` ist der Stempel, nicht das Dokument.** (2026-09-13) Was Apple „private
  key" nennt, taugt als Geheimnis für Supabase nicht: Verlangt wird ein **JWT, das mit
  dieser Datei unterschrieben ist** (`iss` = Team-ID, `kid` = Key-ID, `sub` =
  Client-ID, `aud` = `https://appleid.apple.com`, ES256). Trägt man den Dateiinhalt
  dort ein, meldet Apple beim ersten Anmeldeversuch `invalid_client` — was nach einer
  falschen Client-ID klingt und keine ist. **Es läuft nach höchstens 180 Tagen ab**
  (Apple weist längere Laufzeiten rundheraus ab), also ist es nichts, was man einmal
  einträgt: `scripts/apple-secret.py` erzeugt es, prüft die eigene Unterschrift im
  selben Lauf gegen den öffentlichen Teil und schreibt das Ablaufdatum hin.
- **Supabase gibt eingetragene Geheimnisse als ABDRUCK zurück, nicht als Wert.**
  (2026-09-13) `external_apple_secret` kam mit 64 Zeichen zurück, obwohl das
  geschickte JWT 306 lang war. Wer daraus schließt, es sei abgeschnitten worden,
  sucht einen Fehler, den es nicht gibt. **Mehrere Client-IDs landen dagegen
  zusammengeführt in EINEM Feld:** `external_google_additional_client_ids` meldete
  `None`, und `external_google_client_id` trug beide, mit Komma getrennt (72 + 1 + 72
  = 145 Zeichen). Geprüft wird deshalb, ob die iOS-ID **im** Wert steht — nicht, ob
  das Feld gefüllt ist, in das man sie geschrieben hat.

- **Ein Prüfstand kann eine Ordnung verlangen, die seine eigene Schwesterprüfung
  ZERSTÖRT.** (2026-09-13, geteilte Sitzung) `pruef()` vergleicht Text; bei einem Objekt
  hängt das an der Feldreihenfolge. `aufteilen()` löscht aber `refresh_token` aus dem
  Datei-Teil — und die Prüfung eine Zeile darüber verlangt ausdrücklich, dass es weg
  ist. Damit war die alte Position unwiederbringlich, und **keine Fassung von
  `zusammensetzen()` hätte bestehen können.** Der Kommentar an der Stelle sagte längst
  das Richtige (*„verglichen wird das GEPARSTE"*), der Code darunter tat es nicht.
  **Am Ausgabetext war der Fehler kaum zu sehen** — 2366 Byte, identisch bis auf ein
  verschobenes Feld. Wer zwei lange JSON-Texte ungleich findet, vergleicht zuerst die
  SORTIERTEN Felder; sind die gleich, ist es die Reihenfolge und kein Inhalt.
  ⚠️ **Und wer eine Prüfung entschärft, um zu bestehen, misst hinterher, ob sie noch
  scharf ist:** Eine Fassung, die das Feld gar nicht wieder einsetzt, muss weiter rot
  werden. Sonst hat man nicht die Prüfung berichtigt, sondern sie abgeschafft.
- **Eine ENTSCHEIDUNG kann von keiner einzigen Prüfung bewacht sein, und das sieht man
  nur, indem man die verworfene Möglichkeit BAUT.** (2026-09-13) Ians Wahl A („den
  Datei-Teil nachsehen") gegen B („ihm glauben") — die verworfene Fassung B bestand alle
  24 Häkchen. Grün heißt dann nur „A ist erlaubt", nicht „A gilt": Die nächste
  Vereinfachung nimmt die Entscheidung still zurück. **Nach jeder Entscheidung von Ian
  also die verworfene Möglichkeit in einem Wegwerf-Ordner gegen den Prüfstand halten** —
  bleibt sie grün, fehlt die Gegenprobe. Dasselbe Muster, das `95_sitzung.mjs` beim
  Tresor-Teil schon selbst anwendet (*„Die Gegenprobe, auf die es ankommt"*).

- **Ein Promise ist immer truthy — `tsc` sagt dazu NICHTS.** (2026-09-13, beim Umbau
  des Anleitungs-Merkers) `anleitungGesehen()` ging von `boolean` auf
  `Promise<boolean>`, und in `(tabs)/index.tsx` stand weiter
  `if (!anleitungGesehen()) setAnleitung(true);`. `!promise` ist **immer `false`**,
  der Zweig lief nie, die Anleitungskarte wäre auf beiden Plattformen **lautlos
  verschwunden** — und `npx tsc --noEmit` gab **0** zurück, weil `!x` auf jedem Typ
  gültiger Code ist. Dieselbe Familie wie `undefined > BILD_MAX_BYTES` (harte
  Regel 91), `string | null` in JSX (20) und `find(p => p.id === undefined)`
  (Phase 16), und die gefährlichste Sorte davon: **Sie zeigt sich als ABWESENHEIT** —
  es steht nichts Falsches da, es fehlt nur etwas. Der Wächter dagegen steht seit
  demselben Tag in `eslint.config.js` (`@typescript-eslint/no-misused-promises`,
  type-aware, `checksVoidReturn: false`); gemessen 81 Probleme vorher wie nachher,
  1,9 s, und mit dem Fehler wieder eingebaut **83**.
- **Eine Signatur von synchron auf asynchron zu ändern ist eine LOCKERUNG.** (gleicher
  Tag) Damit gilt dafür die Phase-16-Lehre unverändert: Der Compiler meldet null
  Stellen, und die Enge muss anderswo neu entstehen — hier als Lint-Regel, weil es
  keine Typ-Ebene gibt, auf der man sie hinstellen könnte.
- **Ein Prüfstand, der einen REPO-ZUSTAND voraussetzt, wird nach der ersten geplanten
  Änderung abgeschaltet statt gelesen.** (2026-09-13) `96_anbieter.sh` nahm die
  Repo-Fassung von `anmeldung.ts` als „die Attrappen-Fassung" und erzeugte die
  umgelegte daneben. Beim Umlegen des Schalters für den Gerätebuild meldete er
  **12 Kreuze**, und kein einziges war ein Fehler im Code.
  **Schlimmer war, was dabei NICHT anschlug:** Sein Wächter fragte
  `grep -q "= 'supabase';"` an der ERZEUGTEN Datei. Steht im Repo schon `'supabase'`,
  ist das trivial wahr — die zwei Fassungen sind dann **identisch**, und der zweite
  Block misst denselben Code noch einmal. Genau der Zustand, vor dem der Wächter
  warnen sollte; sein eigener Kommentar beschrieb ihn wörtlich (*„grün, und ohne
  Aussage"*). **Die richtige Frage ist nicht „steht der Wert drin?", sondern
  „unterscheiden sich die beiden Fassungen?"** — jetzt ein `diff`, der genau zwei
  abweichende Zeilen verlangt. Beide Fassungen werden seither ERZWUNGEN, keine
  stammt aus dem Repo; gegengemessen in beiden Stellungen (48 Häkchen) und gegen eine
  umbenannte Konstante (Abbruch statt grün).
- **Die Quelle NICHT anfassen, während ein Gerätebuild läuft.** (2026-09-13, eigener
  Fehler) Der Build lief ~20 Minuten, und in dieser Zeit wurde `anmeldung.ts` für
  Gegenproben mehrfach umgestellt. Das JS-Bundling (`Bundle React Native code and
  images`) passiert am APP-Target, also weit nach den Pods — es war noch nicht dran,
  und es ist gutgegangen. **Verlassen darf man sich darauf nicht:** Was im Bundle
  gelandet ist, sagt nur das Bundle. Deshalb misst `geraet-bauen.sh` seit demselben
  Tag die Schalterstellung im GEBAUTEN `main.jsbundle` nach — dieselbe Bauart wie die
  Profil-Prüfung vom 2026-09-11, und aus demselben Grund: `BUILD SUCCEEDED`
  beantwortet *„hat er gebaut?"*, nicht *„kann man sich damit anmelden?"*.

- **Ein `update … returning` in psql meldet Erfolg, auch wenn es nichts getan hat.**
  (Phase 20.7, 2026-09-13) psql hängt IMMER seinen Befehlszähler an die Ausgabe, auch
  mit `-tA` und auch mit `returning`. Beim Abhaken einer Meldung stand deshalb
  `✓ Abgehakt: UPDATE 0` da — **das Werkzeug meldete Erfolg, obwohl die Zeile längst
  erledigt war**, weil die Leerprüfung einen nicht-leeren Text sah. **Gefunden nur
  dadurch, dass derselbe Aufruf ZWEIMAL gemacht wurde**; ein einzelner Lauf sah tadellos
  aus. Als `with … select` ist es eine SELECT-Abfrage und gibt genau die Zeilen zurück,
  die es gibt. Dieselbe Familie wie „`expo run:ios` gibt EXIT 0 zurück".
- **Ein Gegenproben-Aufbau, der Fehler verschluckt, kann NUR falsche Entwarnung geben.**
  (Phase 20.7) Die erste Gegenprobe an 0009 meldete dreimal „Wächter schlägt nicht an" —
  und der Wächter war heil. Der Aufbau schickte `drop/create database` und die acht
  Migrationen nach `/dev/null`; scheiterte davon etwas, fand 0009 keine Tabelle und
  meldete etwas anderes als seinen eigenen Text. **Ein Messaufbau versagt in die
  Richtung, die aussieht, als wäre das Geprüfte kaputt.** Er prüft sich seither selbst
  (13 Tabellen), bevor er misst. Dritte Fassung von „prüf zuerst, ob das Messgerät
  verstellt ist" — und am selben Tag noch eine vierte: eine nachgebaute tsconfig ohne
  `"types": ["node"]` meldete `process`-Fehler, die es im echten Prüfstand nicht gibt.
- **Ein Wächter, der EINE Datei prüft, während drei geladen werden, deckt zwei nicht
  ab.** (Phase 20.7) `meldungen.sh` fragt, ob eine Regel-Datei nach dem Übersetzen noch
  Laufzeit-Importe hat — er fragte nur `meldung.mjs`, und der Lauf starb trotzdem mit
  `ERR_MODULE_NOT_FOUND: '@/config'`, weil der Import in `auth/konto.ts` stand.
  **Daraus kam die richtige Ablage:** `konto.ts` zieht `@/config/alter` und
  `@/lib/bezirk`, ist also keine importfreie Regel-Datei — `handleText()` gehört nach
  `lib/handle.ts`. Dieselbe Familie wie „ein Wächter hinter einem anderen ist ein
  ungeprüfter Wächter".
- **Eine Liste von Dateinamen in einem Skript wird irgendwann nicht nachgezogen.**
  (Phase 20.7) `einspielen.sh` zählte die Migrationen von Hand auf und hörte bei **0007**
  auf — `0008_bilder.sql` lag seit dem Vortag im Ordner und wurde bei einem frischen
  Aufbau schlicht nicht eingespielt. **Und keine der neun nachgemessenen Zahlen hätte es
  gefunden**, weil keine den Bucket zählt. Jetzt kommt die Liste aus dem ORDNER, mit
  einem Wächter auf vierstellige Nummern (ohne feste Stellenzahl liefe `0010` vor
  `0009`). Harte Regel 83 in einer zweiten Gestalt.
  🔴 **Der teuerste Fall dieser Falle kam am 2026-09-14, und er betraf dieses
  Gedächtnis selbst.** Phase 20 zog am 13.09. den Volltext von Historie, Regeln und
  Fallen aus CLAUDE.md heraus nach `_gedaechtnis/` — **`scripts/doku.sh` wurde nicht
  nachgezogen.** Es spiegelte weiter `PLAN.md`, `CLAUDE.md` und `_FUER_IAN/*.md` in
  den einzigen Ordner, den git sieht, und ließ 440 kB aus. Einen Tag lang lagen
  HISTORIE, HARTE_REGELN und FALLEN in **keinem Backup**. Gefunden nur, weil beim
  Anhängen von Regel 111 auffiel, dass `git status` sauber blieb.
  **Warum gerade hier besonders teuer:** Seit dem 13.09. trägt der Index in CLAUDE.md
  nur noch die TITEL. Wäre der Ordner verloren gegangen, stünde von 111 Regeln und
  179 Fallen je eine Zeile da — und die Begründung, in der in diesem Projekt fast
  immer die Lehre steckt, wäre weg. **Ein Titel ist kein Ersatz für die Begründung,
  und ein Auszug ist keine Sicherung.**
  Behoben mit einer Schleife über den Ordner (eine vierte Datei käme von allein mit)
  und einem Wächter auf die ZAHL der angekommenen Dateien: *Ein leerer Spiegel ist
  gefährlicher als gar keiner, weil er aussieht wie eine Sicherung.* Gegenprobe
  gebaut — mit ausgeschalteter Spiegelung bricht der Lauf mit EXIT 1 ab.
  ⚠️ **Die allgemeine Lehre, und sie ist neu:** Wer Dateien UMZIEHT, hat damit noch
  nicht alle Skripte umgezogen, die sie kennen. `grep -rn "<alter Pfad>" scripts/`
  gehört zum Umzug, nicht zur Nachbereitung — in derselben Woche hat dieselbe Falle
  auch `60_konto.sh` zweimal getroffen.
- **Zweimal die STILLE repariert, bevor die URSACHE gesucht war.** (2026-09-13, und es
  war mein teuerster Fehler des Tages) Ians Profilbild scheiterte lautlos. Erster
  Anlauf: Fehlerbehandlung in den Bildwähler — der Fehler lag nicht dort. Zweiter
  Anlauf: das Protokoll vom Gerät lesen — ein Release-Build schreibt nichts. Erst der
  dritte, die KETTE lückenlos zu lesen (`einstellungen.tsx` → `bild-waehlen` →
  `social/hooks` → `data/senden` → **`features/store.ts`**), fand sie. **Das eine
  Glied, das ich nie gelesen hatte, war das mit dem Fehler.** Wenn ein Weg schweigt,
  wird er GANZ gelesen, bevor an einem Ende repariert wird — und die Stille ist ein
  zweiter Fehler, nicht der erste.
- **Ein `main.jsbundle` lässt sich nach dem eigenen Code durchsuchen — in ZWEI
  Kodierungen.** (2026-09-13) Nach dem Aufspielen war die erste Frage „ist mein Fix
  überhaupt drin?", und sie ist in Sekunden zu beantworten: `main.jsbundle` nach den
  neuen Sätzen greppen. **Hermes legt reine ASCII-Strings als Latin-1 ab und jeden
  String mit einem Nicht-ASCII-Zeichen als UTF-16** (die Lehre vom 13.09. früh) — ein
  deutscher Satz mit Umlaut steht also NUR in UTF-16 drin. Dieselbe Suche zählt auch,
  wie oft ein Bezeichner vorkommt: `getRandomValues` und `randomUUID` **je einmal** war
  der Beleg, dass niemand sie definiert.
- **Ein neuer Import in einer Regel-Datei bricht JEDEN Prüfstand, der sie lädt — und
  das merkt nur, wer ihn laufen lässt.** (Phase 20.9, 2026-09-13) Beim Aufräumen der
  stillen Knöpfe kamen **drei** Prüfstände heraus, die schon vorher rot waren, alle
  drei seit demselben Morgen: `pruef-schreiben` (`senden.ts` bekam mit der
  `crypto`-Reparatur `@/lib/zufall` — **`80_bilder.sh` wurde nachgezogen,
  `70_schreiben.sh` vergessen**) und `pruef-konto` (`lib/supabase.ts` bekam mit der
  geteilten Sitzung `@/lib/sitzungsspeicher`). **Wer eine Regel-Datei um einen
  Laufzeit-Import erweitert, sucht ALLE Prüfstände, die sie nach JS bringen** —
  `grep -rln "<dateiname>" supabase/pruefen/` — und zieht `files`, die `sed`-Zeile und
  den Wächter mit. Eine Liste von Dateinamen in einem Skript wird sonst irgendwann
  nicht nachgezogen (die 20.7-Lehre an `einspielen.sh`, zum zweiten Mal).
- **Ein Prüfstand OHNE Alias-Wächter stirbt mit einer Meldung, die nach kaputtem Node
  aussieht.** (2026-09-13) `60_konto.sh` war der einzige ohne, und der Fehler kam als
  nacktes `ERR_MODULE_NOT_FOUND: Cannot find package '@/lib'`, tief in einem
  Stapelauszug und **nach** dem Anlegen der Prüfkonten. Mit Wächter steht dort eine
  Zeile im Klartext. **Und der Wächter fragt nur, was wirklich GELADEN wird** — der
  erste Entwurf des neuen `97_programmfehler.sh` fragte alles im Ausgabeordner und
  schlug an zwölf Dateien an, die tsc über Typ-Importe nur MITBAUT. Die Verengung samt
  Begründung steht seit 20.5 in `70_schreiben.sh`, und ich bin trotzdem hineingelaufen.
- **Ein `sed` auf einen Wert trifft auch den KOMMENTAR daneben.** (2026-09-13)
  `s/checksVoidReturn: false/checksVoidReturn: true/` hat in `eslint.config.js` die
  Konfiguration UND den erklärenden Absatz geändert — der behauptete danach das
  Gegenteil seiner eigenen Begründung („`true` ist Absicht … sie hätte nur Lärm
  gemacht"). Gefangen hat es ein `assert` im nächsten Skript, nicht das Auge.
  **Wer einen Wert per `sed` umstellt, greppt hinterher nach dem alten Wort im
  Kommentar** — sonst ist die Datei still auseinandergelaufen (harte Regel 83).
- **Eine Gegenprobe, die aus dem FALSCHEN Grund rot ist, belegt gar nichts.**
  (Phase 20.9) Der neue Prüfstand baut eine Kopie der Quelle ohne Ians Zweige und
  erwartet, dass sie durchfällt. Lag die Kopie in `/tmp`, scheiterte schon `tsc` an
  `@supabase/supabase-js` — **es gibt dort kein `node_modules`**, und der Lauf war rot,
  ohne je eine Regel gemessen zu haben. Der Wegwerf-Ordner liegt deshalb IM Projekt
  (`.pruef-programmfehler/`, git-ignoriert wie `.pruef-konto/`). `baseUrl` + `paths`
  wären der andere Weg und sind seit TypeScript 7 abgeschafft.
- **`find … | grep -v …` unter `set -euo pipefail` tötet das Skript STUMM, sobald
  nichts übrig bleibt.** (Phase 20.8, 2026-09-13) `grep` gibt bei null passenden Zeilen
  `exit 1` zurück, `pipefail` reicht es durch, `set -e` beendet — **vor** der eigens
  dafür geschriebenen Fehlermeldung, also genau in dem Fall, für den sie da ist.
  Zugeschlagen hat es nicht, und zwar aus dem falschen Grund: Es blieb zufällig eine
  Zeile übrig (`gruppe/neu.html`), und die durfte gar nicht mitzählen. **Wo eine Zählung
  auch null ergeben darf, gehört keine Pipe hin** — `while IFS= read -r … done < <(find …)`.
  Dieselbe Familie wie „`set -e` tötete das Skript, bevor die Diagnose lief" (2026-09-12)
  und „ohne `PGCONNECT_TIMEOUT` hängt psql".
- **Ein Export erzeugt ZWEI Sorten Dateien, und nur eine davon ist eine Adresse.**
  (Phase 20.8) `dist/gruppe/neu.html` kommt aus `src/app/gruppe/neu.tsx` (statische
  Route), `dist/gruppe/g1.html` aus `generateStaticParams`. Beide sehen im Dateisystem
  gleich aus; nur die zweite Sorte verschwindet, wenn das Backend die IDs nicht mehr
  beim Bauen kennt. **Wer gebaute Dateien zählt, um eine Aussage über die Daten zu
  treffen, trennt die Sorten vorher** — und zwar an der Eigenschaft (gibt es eine
  gleichnamige Quelldatei?), nicht an einer Namensliste.
- **Expo-Docs versioniert lesen** vor dem Schreiben von Code — Expo ändert sich schnell.


- **Ein `asset.width` vom Bildwähler darf `0` sein — und die EXIF-Drehung
  vertauscht Breite und Höhe.** *(Phase 20.6-d.)* In den eigenen Typen von
  `expo-image-picker` steht an `width` wörtlich *„Can be `0` if the system did not
  provide the width"*. Eine Null ist hier kein Randfall, sondern ein Bild ohne
  Fläche — durch `zuschnittRechteck()` eine Division, deren Ergebnis `Infinity`
  ist, und die reist stumm weiter. Dazu der zweite, teurere Teil: Ein quer
  gehaltenes iPhone speichert das Foto aufrecht und merkt sich den Winkel im EXIF.
  Wer die Maße VOR dem Dekodieren nimmt und den Zuschnitt gegen das DEKODIERTE
  Bild rechnet, vertauscht bei solchen Fotos Breite und Höhe — und der Kreis sitzt
  woanders, als er im Fenster aussah. Die Maße kommen deshalb aus
  `ImageManipulator.manipulate(uri).renderAsync()`, also aus derselben Quelle, die
  gleich auch schneidet. Der Prüfstein ist ein quer aufgenommenes Foto; am Mac ist
  die Frage nicht zu beantworten.

- **`geraet-bauen.sh` macht KEIN `prebuild` und KEIN `pod install` — ein neuer
  nativer Baustein kommt so nie im Xcode-Projekt an.** *(Phase 20.6-d.)* Das ist
  Absicht und richtig so: Ein `expo prebuild` wirft `DEVELOPMENT_TEAM` und
  `CODE_SIGN_STYLE` aus `project.pbxproj` (eigene Falle), das Skript prüft die
  Zeilen deshalb nur. Die Folge ist aber, dass `npm install expo-irgendwas` allein
  **gar nichts** bewirkt: `xcodebuild` baut eine App ohne das Modul, meldet
  `BUILD SUCCEEDED`, und am Gerät ist der Aufruf zur Laufzeit `undefined`. Richtig
  ist `cd ios && pod install` (Expo-Autolinking zieht neue Module aus
  `node_modules`), und **geprüft wird das Ergebnis, nicht der Rückgabewert** —
  `pod install` meldet einen Fehlschlag mit EXIT 0 (eigene Falle). Gemessen wird im
  `Podfile.lock`: `ExpoImageManipulator` von 0 auf 5 Treffer, `ExpoImagePicker`
  unverändert bei 4.

- **React Native kennt keine Maske — ein Kreis entsteht aus einem RING der
  doppelten Kantenlänge.** *(Phase 20.6-d.)* Es gibt kein `mask-image`, und die
  naheliegenden Versuche gehen alle in die falsche Richtung: Ein View mit
  `borderRadius: F/2` und `borderWidth: F/2` füllt den Kreis, statt ihn frei zu
  lassen. Was funktioniert, ist geometrisch: im quadratischen Fenster
  (`overflow: 'hidden'`) ein View der Größe `2F × 2F`, mittig versetzt, mit
  `borderRadius: F` und `borderWidth: F/2`. Sein Rand deckt alles zwischen Radius
  F/2 und F ab — und die Ecken des Quadrats liegen bei F·√2/2 ≈ 0,71·F, also
  mitten im Ring. Innen bleibt der Kreis frei.
  ⚠️ **Der Ring braucht `pointerEvents: 'none'`, und das gehört in den `style`**
  (eigene Falle, seit React Native 0.86). Steht es als Prop, liegt über dem ganzen
  Fenster eine Fläche, die jede Berührung schluckt — das Foto ließe sich nicht mehr
  schieben, und der Fehler sähe nach einem kaputten `PanResponder` aus.

- **Eine Textsuche mit NULL Treffern beweist nichts — sie braucht die Gegenprobe
  im selben Ordner.** *(Phase 20.6-d.)* Gefragt war, ob
  `expo-image-manipulator` im Web-Bündel landet (es soll nicht, Metro muss `.ts`
  statt `.native.ts` nehmen). `grep -r … | wc -l` sagte `0` — was genauso gut
  heißen kann, dass am falschen Ort oder mit falschem Muster gesucht wurde.
  Danebengestellt wurde deshalb dieselbe Suche nach einem Satz, der im Web-Zweig
  WIRKLICH steht: 2 Treffer. Erst zusammen ist es ein Beleg. Das ist
  *„Ein Pixelvergleich braucht eine Gegenprobe GEGEN SICH SELBST"*, angewandt auf
  eine Textsuche — und der Fall kommt öfter vor, weil eine Null so beruhigend
  aussieht.

- **Eine Prüf-Erwartung, die BEQUEMLICHKEIT verlangt, prüft nicht die Regel.**
  *(Phase 20.6-d.)* `91_zuschnitt.mjs` erwartete zuerst, ein Ausschnitt sitze nach
  dem Herauszoomen wieder MITTIG — und wurde rot. Die Regel war richtig und die
  Erwartung falsch: Sie zieht den Ausschnitt nur so weit zurück, bis er hineinpasst,
  und lässt ihn oben, wo der Mensch hingeschoben hatte. Mittig zurückzuspringen
  würde die gerade getroffene Wahl wegwerfen. **Die Versuchung ist hier, den Code an
  den Test anzupassen** — die Prüfung fragt jetzt beides: dass er drin liegt UND dass
  er oben geblieben ist.

- **Ein Prüfstand mit Gegenprobe legt eine Kopie von `src/` INS Projekt — und
  `.gitignore` zählte die Namen einzeln auf.** *(Phase 20.6-d.)* Die Gegenprobe muss
  innerhalb des Projekts bauen, weil es in `/tmp` kein `node_modules` gibt und eine
  Gegenprobe, die aus dem falschen Grund rot ist, gar nichts belegt (eigene Falle).
  Aufgeräumt wird per `trap` — stirbt das Skript vorher (ein Strg-C während der ~20 s
  `tsc`), bleibt eine **vollständige Kopie von `src/`** liegen, und das nächste
  `git add -A` nimmt sie mit. Gesperrt waren `.pruef-konto/` und
  `.pruef-programmfehler/` als einzelne Zeilen; der dritte (`.pruef-zuschnitt/`) fehlte
  prompt. **Das ist „Eine Liste von Dateinamen in einem Skript wird irgendwann nicht
  nachgezogen", nur steht die Liste in `.gitignore`.** Jetzt ein Muster, `.pruef-*/`,
  in beide Richtungen gegengeprüft: greift für alle drei und für einen erfundenen
  vierten, und `pruef-ohne-punkt/` bleibt sichtbar — es ist also nicht zu weit.

- **Ein unquotiertes Heredoc gibt der SHELL den ganzen SQL-Text — und die Behebung,
  die man zuerst hinschreibt, zerlegt das Skript.** *(Phase 21.3, 2026-09-14.)*
  `98_moderation.sh` schickte seinen Aufbau durch `<<SQL`. Damit liest die Shell den
  Rumpf, und in den SQL-Kommentaren darunter stehen Backticks — `` `05_daten.sql` ``,
  `` `konto_loeschen()` ``, `` `delete` ``. Sie wurden als BEFEHLE ausgeführt:
  **6 Zeilen `command not found` je Lauf.** Der Prüfstand blieb trotzdem grün (31
  Häkchen), weil nur Kommentare zerschossen wurden — er war einen Tippfehler davon
  entfernt, eine `insert`-Zeile zu treffen. Das ist *„Eine Prüfung mit Backticks in
  doppelten Anführungszeichen misst NICHTS und meldet grün"*, eine Etage tiefer.
  ⚠️ **Der Fehler, auf den es hier ankommt, ist die BEHEBUNG.** In PLAN.md stand
  bereits notiert: *„`<<'SQL'` statt `<<SQL`"* — und das ist **nachgemessen falsch**.
  Das Heredoc braucht `$POST`, `$LEA`, `$FADEN`, `$ERBGRUPPE` als echte UUIDs; quotiert
  steht wörtlich `values ('$POST', …)` im SQL und der Aufbau scheitert am Datentyp.
  **Eine Behebung, die die eine Hälfte des Heredocs sieht und die andere nicht** — und
  sie stand schon aufgeschrieben da, als hätte jemand sie geprüft.
  **Richtig ist `<<'SQL'` PLUS psql-Variablen:** `-v post="$POST"` am Aufruf, `:'post'`
  im SQL. Dann setzt psql ein, nicht die Shell — und die Shell ist aus dem SQL-Rumpf
  **dauerhaft** heraus, statt dass der nächste Backtick in einem Kommentar sie
  zurückholt. Gemessen: 6 Shell-Fehler → 0, lokal unverändert 171 Häkchen.
  **Gegengemessen über das ganze Projekt:** ein Scanner über alle 26 Heredocs in
  `supabase/pruefen/` und `scripts/` findet keinen zweiten Fall. Die zwei Treffer in
  `50_lesen.sh` und `70_schreiben.sh` sind falsch-positiv — dort steht `\$(`, bewusst
  escaped. **Ein Scanner, der Escapes nicht kennt, meldet Arbeit, die es nicht gibt.**
- **Demo-Daten mit RELATIVEN Zeiten verfallen trotzdem — relativ heißt relativ zum
  LAUF, nicht zum Betrachter.** (Phase 21.5, 2026-09-14) `starts_at = now() +
  interval '2 days'` sieht nach der Lösung des Problems aus, das ein fester
  Zeitstempel hat. Sie ist es nur im Augenblick des Einspielens. Liegt der Lauf vier
  Wochen vor dem App-Review, steht `post_status` wieder auf `past`, und der Reviewer
  sieht einen Feed voller vergangener Termine — was aussieht wie eine kaputte App und
  nicht wie alte Daten. **Die Behebung ist kein SQL, sondern ein Ablauf:**
  `anlegen.sh` ist wiederholbar, frischt die Zeiten auf und lässt das Passwort in
  Ruhe; der Satz „vor JEDEM Einreichen einmal laufen lassen" steht in
  `_FUER_IAN/DEMO_ZUGANG.md` UND in der Ausgabe des Skripts selbst. Geprüft wird
  beides: dass der zweite Lauf die Zeiten ändert und den Hash nicht.
- **Ein zweiter Lauf, der ein Passwort neu erzeugt, macht einen HINTERLEGTEN Zugang
  ungültig — ohne Fehler, ohne Log, ohne Meldung.** (Phase 21.5, 2026-09-14) Sobald
  das Demo-Passwort in App Store Connect steht, ist es eine Angabe an einer zweiten
  Stelle, die niemand mitpflegt. Ein `anlegen.sh`, das bei jedem Lauf `openssl rand`
  nimmt und schreibt, wäre genau die Sorte Skript, die man gutgläubig noch einmal
  startet — und die Ablehnung kommt Tage später. Deshalb setzt der normale Lauf das
  Passwort NICHT (`case when :setze_passwort` in `10_konto.sql`), und der allererste
  Lauf erkennt sich daran, dass es die Zeile noch nicht gibt. **Eine Bedingung, die
  nur in EINER Stellung gemessen wird, ist eine ungeprüfte Bedingung:** Die
  Gegenprobe mit `--neues-passwort` steht direkt daneben, sonst wäre „das Passwort
  bleibt stehen" auch dann grün, wenn das Skript nie eines setzt.
- **Eine `auth.users`-Attrappe mit zwei Spalten trägt kein GoTrue-Konto.** (Phase
  21.5, 2026-09-14) `pruefen/00_supabase_lokal.sql` baut `auth.users` mit `id` und
  `email` nach — für die Policies genügt das, weil die App von dort nichts liest.
  `supabase/demo/10_konto.sql` schreibt aber genau die 17 Spalten, an denen GoTrue
  sonst scheitert, und lief lokal sofort auf `Spalte »instance_id« existiert nicht`.
  Die Spalten werden deshalb in `92_demo.sh` ergänzt und NICHT in
  `00_supabase_lokal.sql`: Jene Datei ist die Grundlage von 171 Häkchen, und eine
  breitere Attrappe dort wäre eine Änderung an allen. **Was der Prüfstand über die
  acht leeren Strings sagt, ist damit eine Aussage über `10_konto.sql` und keine über
  GoTrue** — das ist die Falle *„Eine Attrappe kann auch SCHWÄCHER sein als das
  Original"* von ihrer nützlichen Seite: Man darf sie verbreitern, muss aber
  dazusagen, was damit noch nicht belegt ist.
- **`raise notice` geht nach stderr — wer `2>/dev/null` zählt, zählt 106 statt 171.**
  (2026-09-14) Beim Nachmessen, ob die neue Arbeit etwas gebrochen hat, meldete
  `bash aufbauen.sh 2>/dev/null | grep -c '✓'` plötzlich **106** statt der
  bekannten 171 — und das sah nach einem Befund aus. Es war keiner: Die Blöcke, die
  mit `do $$ … raise notice`, arbeiten, schreiben nach stderr, und stderr lag im
  Papierkorb. Mit `2>&1` sind es 171, 0 Kreuze. **Vierte Fassung von „vor der
  Fehlersuche prüfen, ob das Messgerät stimmt"** — und die billigste, weil sie eine
  halbe Stunde Suche nach einer Regression gekostet hätte, die es nicht gab.
- **Eine Namensliste in einem Wächter kann nicht vollständig sein — die ZAHL kann es.**
  (Phase 21.1, 2026-09-14) `94_altersfreigabe.py` soll bewachen, dass die Antwort
  „Werbung: NEIN" wahr bleibt. Die erste Fassung zählte verdächtige Paketnamen auf:
  `admob`, `analytic`, `sentry`, `firebase` … Die Gegenprobe schmuggelte
  **`react-native-google-mobile-ads`** ein — ein waschechtes Werbepaket von Google —
  und die Liste **ließ es durch**, weil dort `admob` stand und nicht `mobile-ads`.
  Rot wurde der Lauf nur über die zweite Prüfung daneben: die ZAHL der
  Abhängigkeiten. **Das ist die Falle „Eine Prüfung, die NAMEN aufzählt, merkt nicht,
  wenn etwas dazukommt" — im Wächter, der gegen genau diese Falle gebaut war.** Eine
  Namensliste müsste Pakete kennen, die es noch nicht gibt; die Zahl muss gar nichts
  kennen. Beide stehen jetzt da, mit klarer Rangfolge im Kommentar: **die Zahl ist der
  Wächter, die Namen sind die Bequemlichkeit** (sie sagen im Klartext, WAS dazukam,
  statt nur DASS etwas dazukam). Nach der Berichtigung nennt die Gegenprobe das Paket
  beim Namen.
- **Ein Prüfstand, der eine Gegenprobe AUSSERHALB des Projekts anlegt, stolpert über
  `relative_to`.** (Phase 21.1, 2026-09-14) Der Datei-Scanner gab Treffer als
  `p.relative_to(WURZEL)` aus — hübsch für echte Fundstellen und ein `ValueError`,
  sobald die eingebaute Gegenprobe in `tempfile.TemporaryDirectory()` liegt. Der Lauf
  stirbt dann in Zeile eins mit einem Stapelauszug, der nach kaputtem Python aussieht
  und nichts mit der geprüften Sache zu tun hat. `try/except ValueError` und den
  absoluten Pfad nehmen. **Die Lehre ist klein, aber die Richtung zählt:** Die
  Gegenprobe MUSS draußen liegen — läge sie in `src/`, prüfte sie einen Zustand, den
  das Projekt nie hat.
- **Ein Wächter, der eine SCHREIBWEISE aufzählt, merkt nicht, wenn dieselbe Sache
  anders geschrieben dazukommt.** (Phase 21.2, 2026-09-14) `99_etikett.py` las die
  Spaltennamen mit einem Regex über `create table (…)`-Blöcke. Das trug drei Monate,
  weil jede Migration ihre Spalten so anlegte. **`0011` ist die erste mit
  `alter table … add column`** — und die sah der Regex nicht. Harte Regel 107 („der
  Code sagt, was im Etikett stehen MUSS") wäre ab da **still gebrochen** gewesen:
  grün, und zwei Spalten schlicht nicht bemerkt. Gemessen statt vermutet: Die alte
  Fassung meldete `52 Spaltennamen · keine Spalte fehlt · 12 Häkchen, 0 Kreuze`,
  obwohl zwei dazugekommen waren; die reparierte findet **54** und nennt beide beim
  Namen. **Das ist dieselbe Familie wie die Falle, gegen die dieser Prüfstand gebaut
  war** („Eine Prüfung, die NAMEN aufzählt, merkt nicht, wenn etwas dazukommt") — nur
  zählte er keine Namen auf, sondern eine Schreibweise, und das ist derselbe Fehler
  eine Ebene höher. **Wer einen Wächter baut, fragt nicht nur „zählt er alles auf,
  was es gibt?", sondern „zählt er alles auf, wie man es schreiben KANN?"**
- **Ein Wächter, der die eigene BEGRÜNDUNG für den Verstoß hält, wird abgeschaltet
  statt gelesen.** (Phase 21.2, 2026-09-14) `95_zustimmung.mjs` war beim ersten Lauf
  mit zwei Kreuzen rot, beide zu Unrecht: „Prototyp" stand fünfmal in
  `Nutzungsbedingungen.tsx` — weil der **Kommentar** ausführlich begründet, warum es
  dort nicht mehr stehen darf. `not null` stand in `0011` — weil dort erklärt wird,
  warum die Spalten **kein** `not null` haben. Das ist „Ein `sed` auf einen Wert
  trifft auch den KOMMENTAR daneben", eine Ebene höher. In einem Projekt, dessen
  Dateien zu zwei Dritteln aus Begründung bestehen, ist das kein Sonderfall, sondern
  der Normalfall: **Eine Textprüfung über eigenen Quelltext misst, was LÄUFT** —
  Kommentare vorher weg, und eine Gegenprobe, dass dabei nicht einfach alles
  weggeputzt wurde.
- **Solange der Torwächter zeigt, gibt es den `Stack` NICHT — ein `router.push`
  wechselt die Adresse und zeigt nichts.** (Phase 21.2, 2026-09-14) Das Häkchen beim
  ersten Konto muss auf die Nutzungsbedingungen zeigen können, und der naheliegende
  Weg wäre `router.push('/nutzungsbedingungen')`. Er tut nichts Sichtbares: Bei
  `zeigt === 'erstes-konto'` zeichnet `_layout.tsx` den `Stack` **gar nicht** — mit
  Absicht, damit kein Feed dahinter „Noch nichts los" sagt (Entscheidung 43). Die
  Route ist da, der Baum nicht. Verwandt mit „Beim ABBAU eines Navigators schreibt
  `expo-router` die Adresse neu". Der Ausweg ist der, den Regel 7 für das Profil
  schon kennt: **der Inhalt in eine geteilte Komponente**, die Route füllt sie und
  der Torwächter-Zustand auch. Und kein `Modal` — aus demselben Grund, aus dem
  `PrototypHinweis` keines benutzt.
- **Eine Warnung mit einer ZAHL darin veraltet genauso still wie das, wovor sie
  warnt.** (2026-09-14) In PLAN.md Abschnitt 6 stand eine Warnung, dass zwei
  Nummernkreise auseinanderlaufen — mit dem Zusatz „dieser Abschnitt endet bei **40**"
  und der ausdrücklichen Bitte, sie beim Anhängen nachzuziehen. Sie wurde **dreimal**
  falsch: erst „endet bei 37", dann „endet bei 40", und am 14.09. behauptete sie, es
  gebe keinen Punkt 42, 44 oder 55 — alle drei gibt es seit langem, der Abschnitt
  reichte längst bis 67. Wer sie befolgte, suchte an der falschen Stelle. **Eine
  Warnung, die dreimal der Fall war, vor dem sie warnt, wird nicht ein viertes Mal
  nachgezogen — sie wird die Zahl los.** Jetzt steht dort ein `grep`, der nicht
  veraltet. Verwandt mit „Ein Kommentar, der eine Sicherheitszusage begründet,
  veraltet lautlos", nur trifft es hier die Anleitung zum Nachschlagen selbst.
