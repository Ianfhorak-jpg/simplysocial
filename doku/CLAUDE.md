# CLAUDE.md — SimplySocial

Kontext für Claude Code in diesem Projekt. Chatsprache: **Deutsch** (englische Fachbegriffe OK).

---

## Vor jeder Aufgabe

> **[`PLAN.md`](PLAN.md) ist die Source of Truth.** Vor der Arbeit lesen, danach die
> Checkboxen aktualisieren. Diese Datei hier gibt nur den Überblick.

---

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

## Aktueller Stand

> 🔗 **Prototyp: https://ianfhorak-jpg.github.io/simplysocial/**
> (Code: `simplysocial/` · neu hochladen: `npm run deploy`)
> 🔗 **Landing-Page: https://ianfhorak-jpg.github.io/simplysocial-landing/**
> (Code: `landing/` · kein Build, `git push` genügt)

✅ **Phase 20.3-a ist fertig (2026-09-09): die Naht fürs Anmelden — und der Prototyp
merkt davon nichts.** Der Teil von 20.3, der OHNE Ians Konten geht: `CURRENT_USER_ID`
ist ersatzlos gelöscht, an ihrer Stelle steht eine Sitzung. Belege `ag01`–`ag03`,
`tsc` sauber, **83 Lint-Probleme vorher wie nachher**. Sieben Dinge sind wichtiger als
der Anmelde-Bildschirm:

1. **Die Konstante ZU LÖSCHEN statt sie auf `string | null` zu setzen, war die ganze
   Methode — und sie hat 12 Dateien gemeldet.** `string | null` wäre die
   `Post.district`-Falle zum fünften Mal gewesen: `find(u => u.id === null)` ist
   gültiger Code, und in JSX rendert `null` klaglos als Nichts. So hat `tsc` die
   Arbeitsliste geschrieben, wie `IconName` in Phase 14.
2. **Die 110 Fundstellen zerfallen in zwei Sorten, und der Unterschied ist eine Regel
   von React.** In einem HAKEN darf man einen Haken rufen und MUSS es (sonst zeichnet
   der Screen beim Abmelden nicht neu) — `useCurrentUserId()`. In einer AKTION
   (`folgen`, `blockieren`, `nachrichtSenden`) darf man keinen — `getCurrentUserId()`.
   Dieselbe Teilung, die seit Phase 1 als `useSlice()`/`getState()` danebensteht.
3. **Der teuerste Fund war unsichtbar: Beim Abbau des Navigators schreibt
   `expo-router` die ADRESSE NEU.** Abmelden aus `/einstellungen` zeigte richtig den
   Anmelde-Bildschirm — und die Adresse stand danach auf **`/account-loeschen`**, einer
   Seite, die niemand geöffnet hatte. Sie ist schlicht die erste Route im Verzeichnis.
   **Am Bild war nichts zu sehen; erst das nächste Neuladen hätte jemanden auf dem
   Lösch-Screen abgesetzt.** Behoben mit einem absichtlichen `router.replace('/')` VOR
   dem Abmelden — gemessen: `/einstellungen?x=2` → `/`.
4. **Der Torwächter zeichnet den `Stack` GAR NICHT, statt ihn zu überdecken.** Nur
   deshalb darf `useCurrentUserId()` ein `string` sein: Ein Screen, der ein Ich
   braucht, hängt ausgeloggt nicht im Baum. Belegt mit dem umgekehrten Test — `/post/p1`
   ausgeloggt geöffnet zeigt Anmelden und **`Bin dabei` steht nicht im Text**.
5. **Die Adresse überlebt den ausgeloggten Kaltstart, und das war der Grund für die
   Bauweise.** `/post/p1` ohne Sitzung → Anmelden, Adresse bleibt `/post/p1` →
   „Weiter als Ian" → **man steht auf `/post/p1`, bei Leas Tennis.** Keine Stelle muss
   sich ein Ziel merken. Geprüft, indem der ausgeloggte Start vorübergehend im Code
   erzwungen und per `git diff` nachweislich zurückgenommen wurde (die 19d-Methode).
6. **Dreimal derselbe Hinweis kostete zwölf Bildpunkte.** Unter jedem der drei
   Anmeldewege stand „Kommt mit dem Konto — im Prototyp noch ohne Funktion." Auf
   360 × 600 war der Kasten dadurch **612 statt 600 hoch** und stand über beiden
   Kanten. Jetzt steht der Satz EINMAL unter der Gruppe — und das ist nicht der Fix,
   sondern Entscheidung 50: Dreimal dasselbe ist genau das, was ein Bildschirm nicht
   zeigen soll. Nachher Überlauf **0** auf 360 × 600 und 390 × 844.
7. **Die Wortmarke hätte beim Kaltstart die Farbe gewechselt.** „Social" steht im
   Startbild (`+html.tsx`) und auf der Landing-Page in `categoryColors.creative`
   (`#C23D7B`), auf meinem ersten Anmelde-Bildschirm in `accent` (`#3E4043`, ein
   Grau). Ausgeloggt liegt Anmelden unmittelbar hinter dem Startbild — die Marke wäre
   mitten im Bildaufbau von Pink auf Grau gesprungen.

⚠️ **Was 20.3-a NICHT ist: das Anmelden selbst.** Es gibt keinen Login — die drei
Knöpfe sind sichtbar ohne Funktion, hinein kommt man über „Weiter als Ian"
(`ANMELDE_QUELLE = 'attrappe'`, EIN Wort in `features/auth/anmeldung.ts`). **Die
Frage nach dem Heimatbezirk (Entscheidung 64) fehlt bewusst**: Sie gehört an das
erste NEUE Konto, und die Attrappe meldet einen Menschen an, der seinen Bezirk längst
hat — ein Schritt, der etwas Beantwortetes fragt, ist kein Beleg für den Schritt.
**Beides kommt in 20.3-b, und das braucht Ians Konten** (Supabase, Apple, Google) und
vier Native-Bausteine in EINEM Build.

✅ **Phase 19h-2 ist fertig (2026-09-09): der Standort — und das ist die erste Phase
seit 19d-1 mit einem neuen Native-Baustein** (`expo-location@~57.0.16`). Ein Schalter in
`/einstellungen`, direkt unter dem Heimatbezirk: Ist er an, misst der Feed ab dem
gemessenen Ort statt ab der eigenen Bezirksmitte. Zwei neue Entscheidungen von Ian (69
und 70), Belege `af01`–`af04`. Sieben Dinge sind wichtiger als der Schalter:

1. **Der Zielpunkt bleibt die Bezirksmitte — und genau das rettet Entscheidung 1.**
   Ein Post trägt seit Phase 2 nur `district` (harte Regel 47), genauer wird also nur,
   WO ICH STEHE. Weil der Zielpunkt gleich bleibt, haben **alle Posts eines Bezirks auch
   mit GPS exakt dieselbe Entfernung** — der Gleichstand bleibt, und die zweite Stufe
   („bei gleicher Entfernung das Neueste") greift unverändert. Gemessen: die vier
   1070er Posts liegen alle auf 6,45 km. **Läge am Post eine Koordinate, wäre
   Entscheidung 1 still verschwunden.**
2. **`meinOrt` ist PFLICHTFELD in `SortKontext`, und das war die halbe Arbeit.** Ein
   `meinOrt?:` hätte alle drei Aufrufstellen stumm durchlaufen lassen — dieselbe Falle
   wie `ChatThread.postId` (16) und `Post.district` (12). Ausgerechnet eine der drei
   (`useProfilPosts`) hat in 19h-1 vier Wochen lang den falschen Bezirk durchgereicht,
   **weil niemand hinsehen musste.** So hat `tsc` die Arbeitsliste geschrieben.
3. **Belegt durch Umstellen UND Zurückstellen.** Aus 1070: `1070 ×4 → 1060 → 1040 →
   1030 → 1020 → 1170 → 1190 → 1100 → 1140 ×2 → 1220 ×2`. Mit Standort am Donauturm:
   `1020 → 1030 → 1190 → 1220 ×2 → 1040 → 1070 ×4 → 1060 → 1170 → 1100 → 1140 ×2`.
   Beide gegen die gerechneten Kilometer gehalten, beide monoton. **Nach dem Ausschalten
   steht wieder Zeichen für Zeichen die erste Folge da** — das ist der Beleg, dass der
   Ort gelöscht und nicht nur ignoriert wird.
4. **Die bekannte Schwäche zeigt sich an einem neuen Ort.** Vom Donauturm aus steht
   **1220 nicht oben**, obwohl man im 22. Bezirk steht: Der Beschriftungspunkt der
   Donaustadt liegt 5,95 km weiter östlich. **Ein genauerer Ausgangspunkt macht einen
   ungenauen Zielpunkt nicht besser — er verschiebt nur, wo die Ungenauigkeit sitzt.**
   Angenommen, weil die Zahl weiterhin nirgends steht.
5. **Der dynamische Import war Vorsicht gegen ein Problem, das es nicht gibt.** Zuerst
   stand da `await import('expo-location')`, nach dem Muster von harter Regel 61 — die
   begründet die Trennung aber mit einem `requireNativeViewManager` beim Laden, und
   `expo-location` hat **keine View, nur Funktionen**. Der Preis war real: Der
   Dev-Server bündelt lazy, also wurde daraus ein nachgeladener Brocken, der Metro
   ausgerechnet beim Drücken des Schalters braucht — **und genau das ist beim Prüfen
   passiert.** Jetzt ein gewöhnlicher Import.
6. **Der Prebuild hat die Signatur-Zeilen weggeworfen, wie es in der Fallen-Liste
   steht** — die Notiz vom 2026-09-07 hat sich nach zwei Tagen bezahlt gemacht. Neu:
   `pod install` verlangt inzwischen **`cmake`**, und der Aufruf meldete den Fehler mit
   **EXIT 0** (dieselbe Familie wie „`expo run:ios` gibt EXIT 0 zurück").
7. **Web-Bündel +17.972 B (+1,21 %).** `tsc` sauber; `expo lint` 83 Probleme vorher wie
   nachher, alle vorbestehend.

⚠️ **Nicht geprüft: der echte Erlaubnis-Dialog von iOS.** Im Browser ist genau die
Betriebssystem-Grenze nachgestellt (`navigator.permissions.query` und
`navigator.geolocation.getCurrentPosition` überschrieben) und **sonst nichts** — alles
darüber, `expo-location` eingeschlossen, lief echt. Wie sich der Dialog am Gerät anfühlt,
gehört in den nächsten Durchgang.

✅ **Der Hilfszugriff für den Simulator ist inzwischen ERLAUBT** (Ian hat das Häkchen
gesetzt) — der 19i-Blocker ist weg. Was am 2026-09-09 abends stattdessen im Weg stand:
**Ians Bildschirm schlief.** Ohne wachen Bildschirm hat die Simulator-App gar kein
Fenster (`count of windows` = 0), und ohne Fenster gibt es keine Stelle zum Antippen.
Das Menü ließ sich lesen — daran erkennt man, dass es NICHT an der Berechtigung liegt.

✅ **Phase 19i ist fertig (2026-09-09): Der Bezirk als Vollbild — und zwei echte
Ursachen für „das ist kein Liquid Glass".** Ians fünf Punkte vom Durchgang am eigenen
Handy (Entscheidungen 65–68), gebaut am Simulator und im Browser, **ohne neuen Build**.
Belege `ae01`–`ae08`. Neun Dinge sind wichtiger als das neue Fenster:

1. **Die Tab-Kapsel klebte auf iOS an BEIDEN Rändern, seit es sie gibt.**
   `styles.bottom` der Tab-Leiste setzt `start: 0, end: 0`; im `tabBarStyle` stand
   `left: 16, right: 16`. Das kam SPÄTER im Array und schien zu gewinnen — **aber
   `start`/`end` und `left`/`right` sind in Yoga zwei verschiedene Eigenschaften, und
   die richtungsabhängige gewinnt gegen die absolute, unabhängig von der Reihenfolge.**
   Gemessen auf Ians iPhone und am Simulator: Seitenrand **0 statt 16 pt**.
2. **Warum es vier Wochen niemand sah, ist der lehrreichere Teil: Auf Web stimmte es.**
   `react-native-web` macht aus beiden Schreibweisen dieselbe CSS-Eigenschaft, dort
   gewinnt die spätere. Der 19e-2-Beleg `z01-web-kapsel-360.png` zeigte brav „x = 16,
   328 breit" — **geprüft wurde genau die Plattform, auf der der Fehler nicht
   auftritt.** Harte Regel 62 sagt wörtlich, eine Fläche, die an drei Kanten am Schirm
   klebt, sehe aus wie eine getönte Leiste; **auf dem einzigen Gerät, das echtes Glas
   zeichnet, war diese Bedingung nie erfüllt.** Zum dritten Mal lag es an der Form.
3. **Entscheidung 67 stimmt in Rechnung UND Messung.** Symbolrahmen 28 pt
   (`ICON_SIZE_TALL`), Eintrag `padding: 5`, `justifyContent: 'flex-start'` → Mitte bei
   5 + 14 = **19** statt **28**, also 9 pt zu hoch; genau 9,0 pt sind auf Ians
   Screenshot nachgemessen. Nachher **+0,67 pt**. Ein `marginTop` und kein
   `justifyContent`, weil **die Zahl am Anfragen-Tab mit `top: -3` am Symbolrahmen
   hängt** und mitwandern muss.
4. **Die Blasen-Fußzeile hätte den neuen Weg verschlossen — auf Ians eigenem Bild fehlt
   sie.** *„alle N ansehen"* stand nur, wenn nicht alles in die Blase passte. Solange
   sie ins Blatt führte, war das richtig (das Blatt ließ sich auch am Griff ziehen);
   **seit Entscheidung 65 ist sie der einzige Weg ins Vollbild.** Ohne die Änderung wäre
   der Bezirk mit den WENIGSTEN Posts der einzige gewesen, den man nicht öffnen kann.
   `IMG_0712.PNG` zeigt genau den Fall: 1140 Wien, zwei Posts, keine Fußzeile.
5. **Das Glas LÄUFT, und was fehlt, ist Untergrund.** Belegt: Das Blatt nimmt auf der
   Karte einen Grünstich an (Grün minus Blau **+9,2**) — eine deckende Fläche könnte
   das nicht. Der Unterschied zum Untergrund beträgt bei Ians Vorbild **33,2**
   Helligkeitsstufen, bei uns **3,3** (Startbildschirm) bzw. **1,5** (über der hellen
   Apple-Karte). **Liquid Glass zeigt sich als Unterschied zum Untergrund, und hinter
   unseren Flächen liegt überall Papierweiß.** „Überall" ist damit keine Bauaufgabe,
   sondern eine Frage nach dem Untergrund — **Ians Antwort am 2026-09-09: erst
   anschauen** (`ae01`, `ae06` gegen `ae07`).
6. **Der Chip „3 Posts ohne Bezirk" fällt weg, und das ist MEINE Auslegung.**
   Entscheidung 31 verbietet, dass eine Ansicht **still** Posts verschluckt — gemeint
   war eine LISTE, in der etwas fehlt. Die Kartenansicht hat seit 19i keine Liste mehr;
   sie zeigt Orte, und ein Post ohne Ort hat dort keinen. **Gehört ihm vorgelegt.**
7. **Das ✕ ist mit dem Blatt weggefallen, sein GRUND besteht weiter.** Es stand
   ausdrücklich „zusätzlich und nicht ersatzweise" neben Entscheidung 49, weil ein
   zweiter Tipp auf einen 14 × 11 px großen Bezirk nicht zuverlässig zu treffen ist.
   Der Ort ist weg, die Schwierigkeit nicht — Ersatz wäre ein kleines ✕ neben dem
   Umschalter, eine Zeile.
8. **Ohne Blatt zeigt die Karte mehr Umland — Geometrie, kein Fehler.** Wien ist breit,
   der Schirm ist hoch. Solange das Blatt die untere Hälfte deckte, war der freie
   Streifen breiter als hoch. **Zweite Fassung der 19e-2-Lehre an derselben Karte:**
   vor dem Reparieren die Regel nachrechnen, die das Bild erzeugt.
9. **`bezirkStapel` ist ein Zustand und keine Route — wegen harter Regel 50.**
   `/bezirk/[plz]` trüge die Auswahl in der Adresse, damit stünde sie zweimal da.
   Und `SsBack` hat ein optionales `onPress` bekommen: **Wer nichts angibt, bekommt
   weiter `zurueckOderFeed()`**, also bleibt Regel 5 heil.

⚠️ **Der Tipp am Simulator ist NICHT geprüft:** `osascript` verweigert den Hilfszugriff
(Fehler −25211), und die Berechtigung kann nur Ian geben (Systemeinstellungen →
Datenschutz → Bedienungshilfen). Alles Interaktive ist deshalb im Browser belegt, wo
die Geometrie laut 19e-2 dieselbe ist; am Simulator nur, was ohne Berührung erreichbar
ist.

❓ **Was auf Ians Urteil wartet** (blockiert nichts): das Glas (Punkt 5), der
weggefallene Ohne-Bezirk-Chip (6), das fehlende ✕ (7) — und weiter die 19g-Frage, ob
eine ZEILE der Blase das Vollbild öffnen soll statt nur die Fußzeile.

✅ **Phase 19h-1 ist fertig (2026-09-08): Nähe statt Filter — und wieder ohne neuen
Build.** Drei neue Entscheidungen von Ian (62, 63, 64), Belege `ad01`–`ad10`. Fünf Dinge
sind wichtiger als der gestrichene Filter:

1. **Die Reihenfolge des Feeds ist ab heute die ENTFERNUNG — und das ersetzt die ERSTE
   Entscheidung des Projekts.** Ians 63.: *„Bezirk ist too viel, das sieht echt nicht gut
   aus"* → gar kein Filter, sondern von der eigenen Haustür aus nach außen. **Gefragt
   statt geraten** (harte Regel 58): `sort.ts` trägt seit dem 2026-08-31 „das Neueste
   zuerst" und „nicht ohne Rückfrage umstellen". Drei Lesarten lagen ihm vor, er nahm
   die stärkste — gegen meine Empfehlung. **Entscheidung 1 ist trotzdem nicht weg,
   sondern die zweite Stufe:** Bei gleicher Entfernung — also im selben Bezirk — steht
   weiter das Neueste oben. Genau dort, wo man am ehesten hingeht, gilt sie unverändert.
2. **Ein Sortierer, den man nur in EINER Stellung sieht, ist nicht geprüft.** Belegt
   wurde durch Umstellen: aus 1070 heraus 1070 ×4 → 1060 → 1040 → 1030 → 1020 → 1170;
   nach dem Wechsel auf 1220 dreht sich alles um (1220 ×2 → 1020 → 1030 → 1040 → 1070
   ×4). Beide Folgen gegen die gerechneten Kilometer gehalten, beide monoton steigend.
   Eine einzelne Ansicht hätte auch zu einer ganz anderen Regel gepasst.
3. **Ein ungenutzter Parameter ist einer, den nie jemand geprüft hat.**
   `useProfilPosts` reichte seit Phase 6 den Bezirk der ANGESCHAUTEN Person als
   `meinBezirk` durch. Folgenlos, solange `vergleichePosts` seinen Kontext ignorierte
   (er hieß dort `_ctx` — **der Unterstrich war das Warnzeichen**). Ab dieser Phase
   wären Leas Posts nach der Entfernung von *Leas* Wohnung sortiert gewesen.
4. **Die Rechnung war fast geschenkt, weil 19d sie vorbereitet hat.** `PROJEKTION`
   trägt die Kosinus-Korrektur in sich, also reicht `Math.hypot` im Raster — keine
   Haversine-Formel. Eine Rastereinheit sind **29,35 m**, gegengerechnet an Wiens
   echter Nord-Süd-Ausdehnung. Die bekannte Ungenauigkeit ist gemessen und angenommen:
   Hietzings Mitte liegt im Lainzer Tiergarten (8,7 km statt 5 von Neubau) — **folgenlos,
   solange die Zahl nirgends steht**, weil nur die Ordnung zählt.
5. **Entscheidung 62 geht gegen Ians EIGENES Vorbild, und die neuere Regel gewinnt.**
   *„unten soll der Text auch weg, also Start, Anfragen …"* — auf
   `vorbild-liquid-glass-bierbuddy.png` stehen die Tab-Wörter sehr wohl da, das dritte
   („Ma…") schon abgeschnitten. Das ist selbst das beste Argument. Der Preis ist
   nachgesehen, nicht vermutet: `expo-router` setzt einen Screenreader-Ersatznamen
   **nur auf iOS**, im Browser bleibt der Knopf namenlos — deshalb trägt jeder Tab ein
   `tabBarAccessibilityLabel` (wie `SsBack` seit Entscheidung 52). Nachgemessen:
   82 × 56 pt, alle vier frei.

❗ **Was dabei NICHT gestrichen wurde: `filter.bezirk`.** Die Karte setzt ihn weiter
(harte Regel 50). Im Filterblatt steht statt der Auswahl nur noch eine **Rücknahme**
(„Von der Karte · Nur 1100 Wien"), und nur, wenn es etwas zurückzunehmen gibt — sonst
käme man in einen Zustand, den bloß noch „Alle Filter zurücksetzen" verlässt. **Das ist
die Grenze in Entscheidung 50**, zweiter Halbsatz.

✅ **Phase 19g ist fertig (2026-09-08): die Karte fertig gemacht — und wieder ohne
neuen Build.** Gearbeitet wurde diesmal nicht am Screenshot, sondern **am laufenden
iPhone-Simulator** (iOS 26.5, Debug-Build mit Metro: jede Änderung eine Sekunde später
sichtbar). Belege `ac01`–`ac09`. Acht Dinge sind wichtiger als die Liste der
Entscheidungen:

1. **Fast alles, was Ian aufgezählt hat, war EIN Fehler — und ein anderer als der
   vermutete.** Bei zugezogenem Blatt ist `koerperHoehe` null, und **ein
   React-Native-`View` klippt seine Kinder nicht** (`overflow: visible` ist die
   Voreinstellung). Suchzeile, Kategorien und Liste liefen aus dem Blatt heraus und
   wurden **ohne Untergrund auf die nackte Karte gezeichnet**; die Glasfläche endete
   nach dem Kopf. Daraus folgt seine ganze Liste: „unten abgeschnitten", Text quer
   durch die Liste, Apple-Nennung und CC-BY-Zeile „hinter" dem Blatt, der weiße
   Balken unter dem Suchtext. **Reproduziert (`ac01`) und behoben (`ac02`).**
   **Damit ist der 19g-Befund „das Blatt ist DURCHSICHTIG" zurückgenommen:**
   `GLAS_STIL = regular` trägt den Text, nachgemessen bei halb offenem Blatt.
   Das `overflow` am Blatt selbst half nicht — es klippt auf DESSEN Kasten, und darin
   liegt alles ordnungsgemäß. **Geklippt werden muss auf die Höhe, die man SIEHT.**
2. **Ians Screenshot zeigte eine ÄLTERE Fassung, und das erledigt einen der zwei
   „handfesten Layout-Fehler" von selbst.** Der Umschalter trägt darauf noch WÖRTER
   und der Filter-Knopf noch das Wort „Filter" — beides hat Phase 19f am selben Tag
   ersetzt. Der Knopf lag nicht auf der Suchzeile, er war der ALTE (109 pt breit
   gegen heute 44). **Wer einen Screenshot bekommt, fragt zuerst, welche Fassung
   darauf zu sehen ist.**
3. **Die Formfrage ist am Bild entschieden: (a), nicht meine Empfehlung (b).** Das
   Blatt läuft bis an die Unterkante, die Tab-Kapsel liegt **darauf**. (b) scheidet
   praktisch aus — die Kapsel gehört allen vier Tabs. Und **„Glas auf Glas wird
   Milch" hat sich am Gerät nicht bestätigt**; die Sorge war begründet, aber sie war
   eine Vermutung. `SsBlatt.unten` heißt jetzt `fuss` und ist der **Sockel der
   untersten Raststufe**, damit der Griff nicht hinter der Kapsel liegt.
4. **Der teuerste Fund erklärt „es ist noch zu viel auf dem Bildschirm":
   `minZoomLevel` riss die Karte eine Sekunde nach jedem Einpassen wieder auf.**
   `react-native-maps` erzwingt die Grenze auf iOS über eine **eigene** Nachrechnung
   (`applyLegacyZoomConstrains`), **die `mapPadding` nicht kennt**. Der richtige
   Ausschnitt ergab über die volle Höhe gerechnet 8,97, die Grenze stand auf 9. Am
   Bild sah das wie ein falscher `initialRegion` aus — **entschieden hat die
   Zahlenfolge im Protokoll** (0,5641 → eine Sekunde später 2,2032).
5. **Der 14. Bezirk ist in Ordnung — die Vermutung im Plan ist WIDERLEGT.** Gegen die
   amtlichen Daten nachgerechnet: Purkersdorf, Mauerbach und Gablitz liegen in beiden
   Fassungen außerhalb, Wolfersberg, Hadersdorf und Hütteldorf in beiden innerhalb,
   die Bounding-Box weicht um 12 Meter ab. **Er sah komisch aus, weil die Karte
   viermal zu weit heraus stand** (Punkt 4). Zweite Fassung der 19e-2-Lehre: Ein
   Bild, das falsch aussieht, ist noch kein Fehler.
6. **Entscheidung 58 kollidiert mit MapKit, und die Nennung gewinnt.** `mapPadding`
   ist EIN Regler für ZWEI Fragen — wo Wien sitzt und wo Apples Nennung sitzt. Mit
   dem alten Wert lag sie bei halb offenem Blatt 122 pt DAHINTER; solange das Blatt
   durchsichtig war, hielt man das für einen Schönheitsfehler. Jetzt folgt die
   Polsterung dem Blatt (`NENNUNG_MIN_KARTE` als Untergrenze).
7. **Die Blase ist zurück (Entscheidung 57), und harte Regel 51 hat sich bezahlt
   gemacht** — *„Ein Aufruf holt sie zurück"*, elf Tage später eingetreten. Zwei
   Dinge waren trotzdem Arbeit: Der **Anker** rechnete seinen Platz gegen den
   Bildrand statt gegen den freien Streifen zwischen Leiste und Blatt (in BEIDEN
   Zeichnern berichtigt), und ein **leerer Bezirk** bekam eine leere Blase. Der Weg
   **Blase → Blatt** ist neu: „alle 4 ansehen" zieht das Blatt auf — und **ohne einen
   vierten Post im 7. Bezirk (`p19`) wäre er unsichtbar geblieben**, weil kein Bezirk
   mehr als drei Posts hatte (dritte Fassung der 18c/18d-Lehre).
8. **Entscheidung 60 hat eine Grenze, und sie steht in den eigenen Regeln.** Blatt
   fährt herauf, Blase poppt aus dem Bezirk, Ausschnitt wechselt in 280 ms. **Die
   Ansicht als Ganzes wird NICHT eingeblendet:** Harte Regel 61 sagt, `opacity` unter
   1 schaltet echtes Liquid Glass ab — es wäre ein Blatt OHNE Glas eingeblendet und
   am Ende hart umgeschaltet worden.

❓ **Eine Auslegung wartet auf Ian** (blockiert nichts): Sein Satz *„wenn's mehrere
sind, kann man draufklicken — dann kommt das Blatt"* lässt offen, ob **eine Zeile**
der Blase das Blatt öffnet oder nur die Fußzeile. Gebaut ist: Zeile → Post-Detail
(das ist 19c, von ihm abgenommen), Fußzeile → Blatt. **Er urteilt am Bild: `ac05`
und `ac06` herzeigen.**

✅ **Phase 19f ist fertig (2026-09-08): weniger sehen — und ohne neuen Build.**
Ians Grundsatz (Entscheidung 50, harte Regel 63) angewandt auf die sechs Screens, die
er nach dem Durchgang am eigenen Handy genannt hat: Entscheidungen 51–56. Belege
`ab01`–`ab08`, nachgemessen auf 360 × 600 und 390 × 844. Sechs Dinge sind daran
wichtiger als das Aufräumen:
1. **Der Post-Screen passt jetzt auf EINEN Bildschirm — vorher nie.** Zugeklappt
   600 von 600 px, aufgeklappt 1041. Bis heute musste man in jedem Fall scrollen, um
   „Bin dabei" zu sehen. **Das ist der eigentliche Ertrag und war nicht angekündigt:**
   Gemeint war „weniger sehen", herausgekommen ist „nicht mehr scrollen müssen für
   das, weswegen man da ist".
2. **Zeit und Ort sind NICHT weg, sie sind leise** — `Heute 21:30 · 1220 Wien` unter
   dem Knopf. An ihnen entscheidet man „geh ich hin?", und der zweite Halbsatz von
   Entscheidung 50 ist genauso verbindlich wie der erste. Im Aufgeklappten stehen sie
   **nicht noch einmal**: dieselbe Angabe zweimal ist genau das, was Ian aufgefallen ist.
3. **Zwei Auslegungen innerhalb von Entscheidung 51 sind meine und warten auf sein
   Urteil** (blockieren nichts): Der Kategorie-Chip ist geblieben, aber in der ZEILE
   des Pfeils — sein Satz war *„alles untereinander"*, das Wort *untereinander* ist der
   Befund. Und die **Notiz des Verfassers liegt hinter „Mehr ansehen"** — die wörtliche
   Lesart von *Titel, Person, Knopf*, und die Stelle, an der ich am wenigsten sicher
   bin. **Er urteilt am Bild: `ab01`/`ab02` herzeigen.**
4. **`onFocus` allein hätte Entscheidung 55 nicht erledigt.** Beim Antippen des Feldes
   ändert sich der INHALT der Liste nicht, nur das FENSTER darauf — `onContentSizeChange`
   schweigt zu Recht. Und der Fokus kommt VOR der fertig hochgefahrenen Tastatur.
   Deshalb zwei Anlässe auf eine Funktion (`nachUnten()`): `onFocus` springt sofort,
   `onLayout` an der Liste holt nach, wenn die Fläche wirklich kürzer ist.
5. **Der Beweis dafür wäre fast an einem verstellten Messgerät gescheitert.** Ein
   `browser_resize` auf 360 × 420 bewirkte **gar nichts** — die App misst ihre Höhe seit
   dem 2026-09-06 über `visualViewport`, und Playwrights Viewport-Wechsel löst dessen
   `resize` nicht aus. Erst `--ss-hoehe` von Hand gesetzt: sichtbare Fläche 386 → 206,
   Liste sprang ans Ende. **Zweite Fassung der 19b-Lehre.**
6. **Entscheidung 52 kostet Trefferfläche, und die ist bezahlt statt behauptet.** Aus
   Pfeil-plus-Wort wären 22 × 22 pt geworden — ein Viertel von Apples Mindestmaß.
   `SsBack` ist jetzt auf **allen 14 Screens als 44 × 44 nachgemessen**, und der Pfeil
   sitzt darin **links ausgerichtet statt zentriert**: So bleibt er in einer Flucht mit
   dem Inhalt, und die Fläche wächst nach rechts und unten. Ein zentrierter Pfeil hätte
   einen negativen Rand gegen `SsScreen` gebraucht — schon einmal schiefgegangen
   (Phase 12).

✅ **Die App LÄUFT auf Ians iPhone, und der erste Durchgang mit einem echten Finger ist
gemacht (2026-09-08).** `at.simplysocial.app`, Release-Build, ohne Kabel und ohne Mac,
7 Tage gültig. Vier Dinge sind daran wichtiger als die Installation:
1. **Die beiden Fragen, die im Browser prinzipiell nicht zu stellen waren, sind beide
   gut ausgegangen.** Der Wischstapel verwechselt Tipp und Wisch auch unter einem
   echten Finger nicht, und **die als kritisch benannte Stelle ist unkritisch**: MapKit
   und das Blatt streiten sich auf iOS *nicht* um dieselbe Berührung. Harte Regel 59
   (der Blattkörper bekommt gar keinen Erkenner) hat getragen, ohne dass jemand
   verhandeln musste.
2. ❌ **Dieser Punkt war FALSCH und ist am 2026-09-08 in Phase 19g zurückgenommen.**
   Er steht als Gedächtnis hier — die Diagnose war plausibel, gemessen und trotzdem
   daneben. **Das Blatt war nicht durchsichtig, es war bei zugezogenem Blatt gar nicht
   da:** `koerperHoehe` ist dort null, und ein React-Native-`View` klippt seine Kinder
   nicht (harte Regel 64). Was auf Ians Bild „durch die Liste" zu lesen war, war die
   Karte selbst — die Liste lag daneben, ohne Untergrund. `GLAS_STIL = regular` trägt
   den Text; nachgemessen bei halb offenem Blatt. **Die Lehre ist nicht, dass ich
   schlecht gemessen hätte, sondern WAS ich gemessen habe:** Ich habe geprüft, ob die
   Karte durchscheint (sie tut es), und daraus geschlossen, das Blatt sei zu dünn.
   Die Frage „steht an dieser Stelle überhaupt Blatt?" wurde nie gestellt.
   Der ursprüngliche Wortlaut:
   **Das Liquid Glass ist ECHT — und das Blatt ist DURCHSICHTIG.** Ians Screenshot
   (`fehler-blatt-glas-393x852.png`, ausgemessen in PLAN.md 5b/19g) zeigt Achau,
   Laxenburg und Baden **quer durch die Liste hindurch**. Der Fehler ist meiner:
   19e-2 entschied *„das Blatt ist EIN Material"* mit dem Preis *„`regular` ist dick
   genug, dass der Text steht"* — **belegt wurde das nur auf `glasErsatz`, also auf
   einer deckenden Fläche, wo die Frage gar nicht entstehen kann.** Echtes Liquid
   Glass ist viel durchlässiger. **Daraus folgt fast alles andere ohne weitere
   Ursache:** Apple-Nennung, CC-BY-Zeile und der „Ganz Wien"-Knopf liegen HINTER dem
   Blatt und scheinen durch — sie waren richtig platziert, solange es deckte. Gemessen statt
   vermutet: Ian hat geprüft, ob die Karte unter der Tab-Leiste durchscheint, und sie
   tut es; das Bundle trägt kein `UIDesignRequiresCompatibility`, gebaut ist gegen das
   iOS-26.5-SDK. Dazu die zweite Kollision: Das Blatt weicht der schwebenden Tab-Kapsel
   aus (Regel 62) und **endet dadurch mitten im Bild** — bei Apple Karten gibt es den
   Fall nicht, dort ist gar keine Tab-Leiste. **Die Reihenfolge ist trotzdem: erst
   lesbar, dann schön.**
3. **Ians Entscheidung 50 steht über allem, was danach kommt** — als harte Regel 63:
   *Ein Bildschirm zeigt nur, was für die Entscheidung HIER nötig ist.* Sie nimmt weg,
   was dasteht, **und bremst, was noch nicht gebaut ist**. Die Grenze steht im zweiten
   Halbsatz und ist genauso verbindlich: Wegräumen darf nicht heißen, dass man zweimal
   tippt für das, weswegen man gekommen ist.
4. **Der Bauplatz darf nicht in iCloud liegen — und dieser Fehler war meiner.** Ich
   hatte ihn vom Zwischenspeicher in den Projektordner verlegt, damit die fertige App
   die Sitzung überlebt; der Schreibtisch wird von iCloud verwaltet, iCloud hängt an
   Framework-Ordner `com.apple.FinderInfo`, und `codesign` bricht dann ab. Gemessen:
   nach dem Löschen ist das Attribut in fünf Sekunden zurück. **Ein Ortswechsel ist eine
   Änderung, auch wenn keine Zeile Code anders ist.** Einzelheiten in der Fallen-Liste.

📋 **Daraus kommen drei Phasen, alle in PLAN.md Abschnitt 5b: 19f · 19g · 19h.**
Zwölf neue Entscheidungen von Ian (50–61). **19f und 19g brauchen keinen neuen Baustein
und keinen neuen Build** — deshalb stehen sie vor 19h-2 und vor dem Backend.

🔁 **Nachgebessert am selben Abend (2026-09-07), nach Ians Urteil über die erste
Fassung: *„noch nicht wie ich es dir gezeigt habe … sieht echt noch nicht so gut aus".***
**Sein Vorbild liegt jetzt als Bild im Projekt: `vorbild-liquid-glass-bierbuddy.png`** —
derselbe Screenshot, aus dem schon Entscheidung 41 kam. Drei Dinge waren falsch, und
keines davon war der Effekt:
1. **Die FORM der Tab-Leiste.** Erste Fassung: volle Breite, unten bündig, Trennlinie
   oben — die gewohnte iOS-Leiste mit Glas dahinter. Vorbild: eine **freistehende
   Kapsel** mit Abstand zu allen vier Kanten, voll gerundet, ohne Linie. **Glas braucht
   Rand, nicht nur Hintergrund:** Was an drei Kanten am Schirm klebt, sieht aus wie eine
   getönte Leiste; erst wenn Inhalt daneben UND darunter durchläuft, sieht man, dass es
   bricht. Maße in `src/lib/tabs.ts`, gemessen am Vorbild (16 pt Seitenrand, 56 pt hoch,
   ~24 pt über dem unteren Rand).
2. **Kante und Schatten lagen AUF dem Glas.** Regel 61 sagte zuerst „Glas ersetzt die
   Fläche, nicht den Rahmen" — am Bild war das falsch. Echtes Liquid Glass zeichnet
   seine helle Kante selbst und wirft keinen Schlagschatten; eine 1-px-Linie plus
   Schatten darüber macht daraus wieder eine Karte mit unscharfem Hintergrund. **Kante
   und Schatten sind der ERSATZ für das, was Glas mitbringt** — jetzt in `glasSchwebt`
   und nur im Rückfall.
3. **Das Blatt war halb Glas, halb Weiß.** Nur der Kopf war verglast, direkt darunter
   begann die deckende Liste — die Naht lief quer durchs Bild. Jetzt ist das ganze Blatt
   EIN Material, wie bei Apple Karten. Der Preis ist angenommen: Die Liste liegt auf
   mattiertem Glas; `regular` ist dick genug, dass der Text steht.

Belege: `z02`/`z03` (iOS), `z01`/`z04`/`z05` (Web). Nachgemessen auf 360 × 600 und
390 × 844, alle vier Tabs: kein verdeckter Knopf, kein Überlauf.

✅ **Phase 19e-2 ist fertig (2026-09-07): Liquid Glass — und OHNE neuen Build.**
Glas haben **die Tab-Leiste (als Kapsel), die schwebende Umschalter-Pille und das ganze
Blatt**;
auf Web und Android steht überall dieselbe helle Fläche wie vorher (Ians Entscheidung
43). Belegt auf **iOS 26.5 im Simulator** und auf Web (360 × 600 und 390 × 844). Sieben Dinge sind daran wichtiger als der Effekt:
1. **Der Baustein war schon da — es gab nichts zu installieren.**
   `expo-glass-effect@57.0.1` liegt seit Phase 19 in `node_modules`, weil **`expo-router`
   57 selbst davon abhängt**. Autolinking hat es mitgenommen, es steht in
   `ios/Podfile.lock`, und `strings` findet `ExpoGlassEffect` im Binary vom 2026-09-06.
   **Der Plan sagte „Neuer Build? Ja" — falsch.** Eingetragen ist das Paket trotzdem in
   `package.json`: Wer sich auf die Abhängigkeit einer Abhängigkeit verlässt, verliert
   sie beim nächsten Patch, ohne es zu merken.
2. **Glas ersetzt die FLÄCHE, nicht den Rahmen.** `SsGlas` bringt genau eine Eigenschaft
   mit — den Untergrund. Radius, Kante, Schatten und `flex` kommen vom Aufrufer und
   gelten in beiden Zweigen. Deshalb hat der Umbau keinen einzigen Stil verdoppelt.
3. **Echtes Glas braucht etwas dahinter, und DAS ist der Preis der Phase: die
   Tab-Leiste schwebt jetzt.** Damit reicht jeder Tab-Screen bis an die Unterkante des
   Fensters. Die Regel dagegen ist EINE und steht in `SsScreen`: *Was scrollt, scrollt
   unter das Glas; was fest steht, weicht ihm aus* (`useTabRand()` in `lib/tabs.ts`).
   Als `marginBottom`, nicht `paddingBottom` — dort liegen absolut positionierte Kinder,
   und Yoga rechnet die Polsterung des Elternteils an, der Browser nicht.
4. **Zwei Berichtigungen aus 19e-1 fielen dabei an.** Bei zugezogenem Blatt stand nur
   der **Griff** da: `zu` war der gemessene `kopf`-Knoten, die 28 px Griff darüber zählten
   nicht mit — die Titelzeile lag abgeschnitten darunter. Jetzt misst der `onLayout` die
   Glasfläche, die beides umfasst: **eine Messung statt einer Addition, die jemand
   vergessen kann.** Und ein Zug am Griff markierte im Browser den Text ringsum blau
   (`userSelect: 'none'`, wie an der Blase in 19c).
5. **Der teuerste Umweg war ein „Fehler", der keiner ist.** Auf iOS öffnet die Karte mit
   viel Umland und Wiens Süden hinter dem Blatt. Vier Versuche später: Das ist
   `KARTE_MIN_BAND = 0.5`, das die Karte ausdrücklich hinter das Blatt laufen lässt,
   statt weiter zu schrumpfen — auf Web steht dasselbe (SVG bis y = 352, Blattkante 275).
   Der spekulative Fix ist zurückgenommen. **Ein Bild, das falsch aussieht, ist noch kein
   Fehler: vorher die Regel nachrechnen, die es erzeugt.**
6. **Zwei Sachen aus dem Umweg sind trotzdem zu behalten:** `fitToCoordinates` und
   `animateToRegion` **verpuffen still vor `onMapReady`** (ein Aufruf, der nichts tut,
   sieht aus wie einer, der nicht stattfindet), und `fitToCoordinates` zählt `mapPadding`
   **nicht** mit, `setRegion` schon.
7. **Das Web-Bündel wächst um 15.402 B (+0,36 %) — und das Paket war schon drin**,
   über expo-routers eigenen `NativeStackNavigator`. Die in harter Regel 52 genannte
   Begründung für Plattform-Endungen greift hier also nicht; die Endung bleibt trotzdem
   richtig, aus dem anderen Grund: Der native Zweig ruft `requireNativeViewManager` beim
   Laden, und das darf im Browser nie passieren.

✅ **Phase 19e-1 ist fertig (2026-09-07): die Karte IST jetzt die App.** Ian hatte die
fertige Karte BENUTZT und **zehn Entscheidungen** getroffen (40–49, PLAN.md Abschnitt 5b).
Gebaut ist alles außer dem Glas: Die Kartenansicht ist **Vollbild mit einem ziehbaren
Blatt** wie bei Apple Karten, der Schriftzug oben ist weg, **„Posten" ist ein runder
Knopf neben dem Umschalter**, die Blase aus 19c ist aus der Anzeige, und der
Prototyp-Hinweis ist ein Vollbild. **Kein neuer Baustein von außen, kein neuer Build** —
genau deshalb war das der erste Schritt. Belege `v01`–`v10` im Projektordner.
Sechs Dinge sind daran wichtiger als das Aussehen:
1. **Die im Voraus als teuerste benannte Stelle hält — und sie ist GEMESSEN, nicht
   angeschaut.** `SsWienKarte` beansprucht jede Berührung
   (`onStartShouldSetPanResponder: () => true`), das Blatt will senkrecht ziehen. Nur der
   GRIFF zieht. Nachgewiesen mit echten Zeigergesten: Zug auf der Karte verschiebt die
   Karte und lässt den Griff bei y = 288 stehen; Zug am Griff bringt ihn auf y = 74 und
   lässt die Karten-Transformation aufs Zeichen genau unverändert. **Auf iOS ist die Lage
   eine andere** (MapKit bringt eigene Gesten mit) — ungeprüft, gehört auf Ians Gerät.
2. **„Anteile statt Zahlen" war zur Hälfte falsch, und die Hälfte kostete zwei Fehler.**
   Der Plan sagte, die drei Raststufen seien Anteile (Lehre aus 19b). Richtig ist: Was
   oben und unten schon STEHT, ist keine Frage des Schirms. `zu` ist der **gemessene
   Blattkopf**, `ganz` ist durch die **gemessene schwebende Leiste** gedeckelt — ohne
   diesen Deckel fuhr das Blatt unter die Pille, Griff und Überschrift lagen dahinter.
   Nur `halb` ist ein reiner Anteil geblieben.
3. **Wien schrumpfte beim Aufziehen auf 44 px.** Weil die Karte in den freien Streifen
   zeichnet, wurde der Streifen beim Aufziehen winzig — und die Stadt wechselte bei JEDEM
   Zug am Griff ihren Maßstab. `KARTE_MIN_BAND = 0.5` in `features/posts/karte.ts`: Ab da
   läuft die Karte lieber HINTER das Blatt. **Die Zahl steht in der Regel-Datei, nicht im
   Zeichner** — es gibt zwei Zeichner und eine Bedeutung (harte Regel 52).
4. **Zwei Größen, die fast gleich heißen: `randUnten` und `freiUnten`.** Die eine sagt,
   wo das Blatt anfängt; die andere ist die Geometrie nach dem Deckel aus Punkt 3. Die
   Lizenzzeile muss dem BLATT ausweichen, nicht der Geometrie — sonst läge sie bei
   aufgezogenem Blatt dahinter, **und eine Nennung, die niemand sehen kann, ist keine.**
   Der Fehler war im nativen Zeichner schon eingebaut und nur beim NACHLESEN zu finden,
   nicht am Bild.
5. **Ein „Fehler", der keiner war, kostete den längsten Umweg der Phase.** Der erste
   Tippversuch auf einen Bezirk tat nichts, und das sah nach einer durch `fuellt`
   kaputten Trefferrechnung aus. Sie war unversehrt: Ein `mouse.down` gefolgt von
   `mouse.up` **ohne jede Bewegung dazwischen** löst keinen `onPanResponderRelease` aus.
   Mit einem Ein-Pixel-Ruck — was ein echter Finger immer tut — wählte derselbe Punkt
   sofort „1020 Wien · 1 Post". **Vierte Fassung der Phase-18b-Lehre, diesmal andersherum:
   Die Prüfgeste war nicht zu grob, sondern zu sauber.**
6. **Der Preis von Entscheidung 47 ist jetzt sichtbar, und er trifft nur den STAPEL.**
   Ohne den Zähler fiel die einzige Rückmeldung weg, dass gerade gefiltert wird. In der
   KARTE besteht das Problem nicht: Dort fährt das Blatt auf und die Liste steht
   daneben. Korrektur ist eine Zeile, sie steht im Kopf von `(tabs)/index.tsx`.
   ❌ **Der zweite Teil dieses Befunds war FALSCH und ist am 2026-09-07 zurückgenommen:**
   Hier stand, „Alter egal" und „Bestimmte Jahrgänge" seien auf 360 × 600 „von den
   Stapel-Knöpfen verdeckt". **Sie sind es nicht — sie sind herausgescrollt.**
   Nachgemessen: Das Blatt zeigt 232 px, der Filterinhalt ist 296 px hoch, **64 px
   Überhang**; der Knopf sitzt bei y = 421, die Blattkante bei 410. Nach dem Scrollen
   trifft `elementFromPoint` ihn frei. Auf 390 × 844 ist der Überhang **0**. Und die
   weiche Kante, die genau das anzeigt, **war die ganze Zeit da** (`Blatt` in
   `WischStapel.tsx`, y = 382, 28 px, 7 Streifen — „Jahrgang" blendet sichtbar aus).
   **Es gibt hier nichts zu reparieren.** Die Fehldiagnose kam von `elementFromPoint`:
   Es meldet, WAS an einem Punkt liegt, nicht WARUM der Knopf nicht dort ist — die
   Falle steht seit dem 2026-09-03 in der Fallen-Liste und hat trotzdem wieder
   zugeschlagen. **Wer eine Überdeckung misst, misst als Zweites `scrollHeight` gegen
   `clientHeight`.**

✅ **`npm run deploy` ist am 2026-09-07 gelaufen — die Live-Seite zeigt jetzt 19e**
(Ians Entscheidung an dem Abend). Belegt auf der echten Adresse, 360 × 600: Der
Prototyp-Hinweis deckt 600 von 600 px (Vollbild, Entscheidung 48), die Tab-Leiste
steht als Kapsel bei x = 16, 328 breit, 56 hoch, 12 px über dem Rand — genau die Maße
aus `lib/tabs.ts`.

✅ **Phase 20.1 und 20.2 sind fertig (2026-09-06): das Schema und die Regeln auf dem
Server.** Alles in `simplysocial/supabase/` — und **ohne Supabase-Konto gebaut und
trotzdem bewiesen.** `bash supabase/pruefen/aufbauen.sh` baut eine Wegwerf-Datenbank
und lässt 25 Angriffe von außen laufen; erwartet sind 25 Häkchen und kein Kreuz. Sechs
Dinge sind daran wichtiger als die Tabellen:
1. **Die Absicherung ist ein POSTGRES-Ding, kein Supabase-Ding — deshalb ging 20.2 vor
   20.3.** Der Plan hängte den Prüfstein an „den Zugangsschlüssel eines zweiten Kontos",
   und das las sich, als brauchte er ein Projekt in der Cloud. Er braucht keines:
   `auth.uid()` sind vier Zeilen, `set local role authenticated` ist wortgleich das,
   was PostgREST tut. **Dieselbe Trennung wie „Simulator statt EAS-Build" in Phase 19:**
   *halten die Regeln?* und *ist das Projekt eingerichtet?* sind zwei Fragen.
2. **Eine Policy, die ihre eigene Tabelle abfragt, rekursiert — und sagt es erst beim
   ersten Lesen.** „Die Mitgliederliste sehen nur Mitglieder" naheliegend hingeschrieben
   ergibt `infinite recursion detected in policy for relation "group_members"`. Der
   Ausweg sind `security definer`-Funktionen im Schema `regel` — dieselbe Bauart wie
   `safety/block.ts`, nur in SQL.
3. **Ein `count(*)` auf einer geschützten Tabelle LÜGT, es verweigert nicht.** Ein
   Fremder bekommt für eine private Gruppe die Zahl **0** statt „Zugriff verweigert" —
   `PRIVAT_SICHT` verspricht aber die richtige Zahl. Die **ZAHL ja, die LISTE nein**,
   und das sind zwei Rechte, nicht eines mit einer Ausnahme.
4. **Ein gelöschter Post hätte einen bestehenden Chat still zugesperrt** — mein eigener
   Fehler, gefunden beim Nachlesen. `on delete set null` machte aus einem
   Aktivitäts-Chat einen Direktchat, und dort gilt `SCHREIB_REGEL = 'gegenseitig'`: Zwei
   Leute, die sich getroffen haben und einander nicht folgen, hätten einander nicht mehr
   schreiben können. Die Herkunft eines Chats ist eine TATSACHE (`aus_aktivitaet`), kein
   abgeleiteter Wert. **Gegengeprüft** — der Test wird rot, wenn man es zurückstellt.
5. **Harte Regel 47 ist jetzt nicht „nicht eingebaut", sondern UNMÖGLICH.** Die
   verworfene dritte Möglichkeit aus 18d scheitert an der Policy auf `join_requests`:
   Ein Poster sieht nur Anfragen an SEINE Posts.
6. **Aus dem Schema kam eine Frage an Ian — und noch am selben Tag seine 39.
   Entscheidung: A, „alles mit" — außer der Gruppe.** `delete from auth.users`
   scheiterte an `groups_creator_id_fkey`: Wer je gepostet oder gegründet hatte, konnte
   sein Konto gar nicht löschen. **Die zweite Hälfte der Entscheidung ist die
   interessantere:** A sagte „Gruppen weg" und kollidierte damit mit
   `GRUENDER_AUSTRITT = 'weitergeben'` (Entscheidung 13). Seine Antwort war die
   genauere — *A gilt für alles, was NUR mir gehört; eine Gruppe gehört acht Leuten.*
   Der Widerspruch war überhaupt nur sichtbar, **weil die Regel als benannte Konstante
   an EINER Stelle steht**; verstreut in drei Screens hätte A sie still überschrieben.
   Gebaut in `0003_konto_loeschen.sql`.
7. **Der Lösch-Screen versprach seit Phase 7 das GEGENTEIL.** Dort stand fest im JSX
   „die Nachrichten selbst bleiben bei den anderen stehen" — das ist Möglichkeit B,
   und über Gruppen stand nichts. Ein getippter Satz wandert nicht mit, wenn jemand die
   Regel entscheidet. Jetzt kommen die Sätze aus `loeschFolgen()` in
   `features/safety/konto.ts` (harte Regel 17, wie `blockFolgen()`). **Das ist der
   eigentliche Ertrag der Regel-Dateien: nicht Ordnung, sondern der Grund, warum eine
   Entscheidung überhaupt irgendwo ankommt.**
8. **Zwei eigene Fehler, beide erst beim AUSFÜHREN sichtbar.** `reports.from_user_id`
   war `not null` UND `on delete set null` — Postgres nimmt das an und scheitert erst,
   wenn wirklich jemand sein Konto löscht. Und die `auth.uid()`-Attrappe war **nicht**
   wortgleich mit Supabase (Cast vor `nullif` statt danach), was eine Prüfung falsch
   rot machte: **Eine Attrappe, die vom Original abweicht, prüft die Attrappe.**

🚀 **Der Weg zur echten App ist geplant (2026-09-06): PLAN.md, Abschnitt 5b, Phasen 19
bis 21.** Bis hierher war jede Phase eine Verbesserung an etwas, das schon lief; ab hier
sind es drei Dinge, die es noch nicht gibt. **Ians drei Entscheidungen dazu, alle vor dem
ersten Handgriff getroffen:**

1. **Supabase, nicht Firebase.** Es hängt an einer einzigen Eigenschaft: Die zentrale
   Regel dieser App („wer sieht welchen Post") ist ein **Zeilenfilter**, und Firestore
   kann keinen — dort gilt *„security rules are not filters"*: Eine Abfrage wird gegen
   ihre MÖGLICHE Ergebnismenge geprüft und schlägt ganz fehl, wenn ein einziges Dokument
   darunter verboten wäre. Der Ausweg wäre, die Erlaubten-Liste in jeden Post zu
   kopieren — **die Regel läge dann IN den Daten**, das Gegenteil der harten Regeln 17,
   32 und 46. Eine Postgres-Policy filtert Zeilen und bleibt EINE Regel an EINER Stelle.
   *Nebenbefund:* Firebase-Speicher für Bilder ist seit dem 2026-02-03 nicht mehr gratis
   — Darias Profilbilder wären dort sofort ein Kostenpunkt gewesen.
2. **Gerät VOR Backend.** Es gibt ab jetzt zwei offene Fragen — läuft die App auf einem
   iPhone, und läuft sie mit echten Daten. Zusammen beantwortet, hat jeder Fehler zwei
   mögliche Ursachen. Das ist die Lage, aus der bei ACTA die teuren Tage wurden.
   **Deshalb kommt auch nur `react-native-svg` in den ersten Build**, nicht gleich alle
   vier Native-Bausteine: Vier neue auf einmal heben denselben Nutzen wieder auf.
3. **Drei Anmeldewege: E-Mail-Code, Google, Apple** — *gegen* meine Empfehlung, und sein
   Argument ist das bessere: Reibung beim Anmelden trifft ausgerechnet den Kaltstart.
   Die Folge ist eine Reihenfolge, keine Extraarbeit: Sobald Google dabei ist, ist
   „Anmelden mit Apple" nach Richtlinie 4.8 **Pflicht** — also muss Apple fertig sein,
   bevor Google live geht.

⚠️ **Zeitkritisch und von aussen gekommen:** Apples neue Pflichtfrage zur Altersfreigabe
(nutzergenerierte Inhalte in einem Feed) ist **ab September 2026 verpflichtend** — also
jetzt. SimplySocial ist genau die gemeinte App, die Antwort ist ja, und daraus folgt
**mindestens 13+**. Das ist eine Feststellung, keine Wahl — und es macht die offene
Rechtsfrage in `_FUER_IAN/OFFENE_SACHEN.md` (Punkt 1) dringender, nicht lockerer.

✅ **Phase 18d ist fertig (2026-09-05): nicht zwei Sachen gleichzeitig.** Leopolds
letzter offener Wunsch — und der erste Eingriff, bei dem eine Regel eine **Lücke im
Datenmodell** überbrücken musste. Fünf Dinge sind daran wichtiger als der Hinweiskasten:
1. **Ein `Post` hat `startsAt` und KEINE Dauer.** „Überschneidung" ist damit kein Fakt,
   den die Daten hergeben, sondern eine Festlegung — `KOLLISION_FENSTER_MIN = 60`. Und
   genau das ist der Grund, warum **Ians Entscheidung 31 „warnen" heißt und nicht
   „sperren"**: Eine Sperre behauptet Gewissheit, die App hat eine Schätzung.
2. **Die dritte Möglichkeit wäre ein eingebauter Datenschutzfehler gewesen.** „Nur der
   Poster sieht es" hätte der App beigebracht, fremden Leuten zu verraten, wo jemand
   sonst noch hingeht — auch aus privaten Gruppen. Derselbe Fehler wie der Gründername
   an einer privaten Gruppe (18a), nur wäre er hier die Funktion gewesen statt ein
   Versehen.
3. **Ohne `p18` in `mock.ts` hätte die Phase nichts getan, und niemand hätte es
   gemerkt.** In den Fake-Daten gab es vorher KEINE Überschneidung: Ians zwei Zusagen
   liegen genau eine Stunde auseinander, alle anderen Posts an anderen Tagen. Das ist
   die Lehre aus 18c zum zweiten Mal.
4. **Der Hinweis ist nicht rot, und das ist eine Entscheidung.** `status.danger` gehört
   Absagen, Blockieren und Melden. Eine Überschneidung ist nichts davon — die Regel
   lässt sie ausdrücklich zu. Rot hier verbraucht die stärkste Farbe der App für etwas,
   das man bewusst überschreiben darf.
5. **Die letzte Zeile ist seit dem 2026-09-06 entschieden:** `zaehltAlsTermin()` — was
   überhaupt als „schon verabredet" zählt (PLAN.md, Abschnitt 6, Punkt 34). **Ians
   sechsundzwanzigste Entscheidung: erst, wenn wirklich jemand dabei ist.** Ein eigener
   Post ohne Zusage zählt nicht — ein Post ist ein ANGEBOT, bis jemand annimmt, dieselbe
   Unterscheidung wie Karte gegen Chat-Zeile in 18c. Der Code hat sich dabei um kein
   Zeichen geändert: Genau dieser Wert stand als Platzhalter drin. **Ein Platzhalter, der
   zufällig richtig ist, und eine Entscheidung sind trotzdem zwei verschiedene Zustände**
   — der Unterschied liegt vollständig in dem, was die nächste Sitzung liest.

Dazu der zweite Vorrats-Punkt: **„Deine Gruppen" liegt jetzt bei y = 305 von 1388** statt
bei 1168 von 1380 — über einen dritten Slot `nachKopf` in `Profil.tsx`, nicht im Screen
(harte Regel 7). Leopold musste fragen, wie man eine Gruppe macht; im Code war nichts
kaputt, der Weg war nur zu weit unten.

✅ **Phase 18a ist fertig (2026-09-05): einladen, und privat vs. offen.** Leopold hatte
die neue Fassung als Erster wirklich BENUTZT statt angeschaut — Gruppe gegründet,
gepostet — und in zehn Minuten ein **Loch** gefunden, das beim Durchklicken am selben Tag
niemandem auffiel: **Man kann niemanden in eine Gruppe einladen.** Phase 17 hatte nur die
Richtung von aussen nach innen gebaut; wer gründete, sass allein drin. Das ist zu. Vier
Dinge sind daran wichtiger als die Knöpfe:
1. **Gründen und Einladen sind ab jetzt ZWEI Rechte.** `creatorId` trägt WENIGER als
   vorher — der Gründer bestätigt Anfragen von aussen, mehr nicht. Wer im Screen
   `istGruender()` schreibt, wo `darfEinladen()` hingehört, merkt es **nie**: In einer
   frisch gegründeten Gruppe antworten beide gleich.
2. **`GroupInvite` ist ein eigener Typ, `Group.offen` ein Boolean** — und das ist kein
   Widerspruch, sondern dieselbe Regel zweimal richtig angewandt. Ein Union braucht es,
   wenn die neue Stufe zusätzliche Daten BRAUCHT (`Visibility` braucht eine `groupId`);
   „privat" braucht nichts.
3. **Ein neuer Typ ist kein Netz.** `Group.offen` hinzuzufügen meldete sofort vier
   Stellen. `GroupInvite` meldete **null** — ihn las ja noch niemand. Die eine Stelle, an
   der das gefährlich war, ist `requests.tsx`: Die Zeilen wurden mit `'gruppe' in item`
   unterschieden, und eine Einladung trägt AUCH eine `gruppe`. Sie wäre still als
   Beitritts-Anfrage mit „Aufnehmen"-Knopf gezeichnet worden.
4. **Drei Fehler kamen nur durchs Durchklicken heraus**, keiner im Code sichtbar: der
   Gründername stand bei einer privaten Gruppe da (ein Name aus der Liste, die zubleiben
   soll), der Umschalter wurde auf 360 px zu „Jeder kann anfr…" abgeschnitten, und eine
   private Gruppe zeigte „Anfragen ansehen" für Anfragen, die es dort nicht geben kann.

✅ **Phase 18c ist fertig (2026-09-05): die Chat-Liste.** Ians eigener Einwand („noch
nicht ganz übersichtlich, inspiriere dich von WhatsApp") war nachmessbar: Auf 360 × 600
passten **4** Chats auf den Schirm, bei WhatsApp **7**. Jetzt sind es 7. Drei Dinge sind
daran wichtiger als das Aussehen:
1. **Aus Karten wurden ZEILEN — und das ist eine Aussage, kein Stil.** Eine `SsCard` ist
   im Feed richtig, weil eine Karte dort ein ANGEBOT ist, das man annehmen kann. In einer
   Chat-Liste ist eine Zeile ein WEG. Der Unterschied kostete Rahmen, Radius und 12 px
   Lücke je Chat.
2. **Ians Entscheidung 29 war, welche der drei Textzeilen weicht:** Die Aktivität rückt
   klein hinter den Namen („Lea · Tennis spielen"), die **Verabredungs-Zeit fällt aus der
   Liste**. Verworfen: die Zeit behalten und den Titel streichen (woran man einen Chat
   wiedererkennt, ist der Titel — nicht eine Uhrzeit), und alle drei Zeilen behalten
   (halber Gewinn für dieselbe Arbeit).
3. **`flexShrink` zu gewichten war der falsche Griff.** „Tobi… · Kaffee nach der Sc…" —
   beide Texte kürzten sich, und 1 gegen 4 und dann 1 gegen 24 änderten daran fast
   nichts. Der Grund stand in den berechneten Stilen: Beide haben `flexBasis: auto`, also
   teilen sie sich einen Fehlbetrag. **`flex: 1` an dem Text, der nachgeben soll, lässt
   gar keinen entstehen.**

✅ **Phase 18b ist fertig (2026-09-05): Jahrgang statt Alters-Bänder.** Der Eingriff mit
den weitesten Folgen, weil er das DATENMODELL ändert: `AgeGroup` und `AgeBand` sind weg,
am Menschen steht `jahrgang: number`, am Post ein Union `PostAlter`. Dazu ein neuer
Baustein `SsJahrgangBalken` — zwei Griffe auf einer Schiene, JS-only. Vier Dinge sind
daran wichtiger als der Regler:
1. **Der Compiler hat wieder die Arbeitsliste geschrieben — 37 Fehler in acht Dateien.**
   Vierte Runde derselben Frage nach `Post.district`, `ChatThread.postId` und
   `Visibility`, und dieselbe Antwort: Braucht eine Stufe zusätzliche Daten, ist es ein
   Union. Mit `vonJahrgang: number | null` wäre „Spanne ohne Grenzen" darstellbar
   gewesen — und `tsc` hätte geschwiegen.
2. **Der Filter benutzt DENSELBEN Typ wie der Post, und das widerspricht 18a nicht.**
   `GroupRequest` und `GroupInvite` sind zwei Typen, weil sie verschiedene Daten tragen.
   Filter und Post tragen dieselben und deuten sie gleich; was sich unterscheidet, ist
   die REGEL (`passtZumAlter`). Zwei gleich geformte Typen mit zwei Namen wären eine
   Unterscheidung, die niemand anwenden kann.
3. **`HOECHSTALTER` war zuerst 70 — großzügig gedacht, in der Bedienung das Gegenteil.**
   56 Jahrgänge auf 280 px, und alle wirklichen Nutzer drängen sich im rechten Fünftel.
   Im Code nicht zu sehen, am Screenshot sofort. Jetzt 50.
4. **Ein Fehler kam nur durch ECHTES Ziehen heraus: ein zusammengeschobenes Griffpaar
   klemmte.** Ich entschied beim ANFASSEN über die Tipp-Stelle, welchen Griff jemand
   meint — bei zwei Griffen auf demselben Wert gibt es diese Auskunft aber nicht. Die
   fehlende ist die RICHTUNG, und die entsteht erst bei der ersten Bewegung. **Wenn zwei
   Dinge ununterscheidbar sind, ist die Antwort nicht „nimm eines", sondern „warte auf
   die Auskunft, die sie unterscheidet."**

📝 **18d ist weiter Vorrat, nicht Code.** Zwei Entscheidungen aus 18a/18b als Gedächtnis:
- **Ians sechzehnte: Einladen aus der Gruppe heraus**, nicht per Link — dasselbe Muster
  wie „Bin dabei", eine Seite bietet an, die andere bestätigt. Verworfen ist der
  weiterleitbare Link (landet irgendwann in einer fremden Gruppe). **Gebaut in 18a.**
- **Ians siebzehnte: der Schiebe-Balken fürs Alter kommt, auf JAHRGANG.** Ich hatte
  dagegengehalten, weil das Modell kein Geburtsdatum kannte und ein Balken über drei
  Bändern eine schlechtere Pillenreihe wäre. Seine Antwort war eine, die ich nicht
  angeboten hatte: nur das Jahr. Damit fallen `AgeGroup`/`AgeBand` (harte Regel 27) weg —
  `User.jahrgang: number`, und am Post ein Union `{ kind: 'egal' } | { kind: 'spanne'; … }`.
  **Offen bleibt, was am Profil steht** (Jahrgang, Alter, oder weiter ein grobes Band).

✅ **Phase 19 läuft — SimplySocial ist eine echte iOS-App (2026-09-06).** Sie startet
auf einem iPhone-Simulator (17 Pro, iOS 26.5), **alle geprüften Icons zeichnen**, die
SafeArea stimmt oben und unten, Deep Links funktionieren nativ. Belege liegen als
`p19-ios-*.png` im Projektordner. Vier Dinge sind daran wichtiger als der Screenshot:
1. **Der Plan sah einen Cloud-Build vor, der auf Ians Apple-Login gewartet hätte — ein
   Simulator-Build braucht keine Signatur.** Damit zerfällt „läuft es auf iOS?" in zwei
   getrennt beantwortbare Fragen: *startet die App und zeichnet sie richtig* (Simulator,
   erledigt) und *wie fühlt sie sich unter einem Finger an* (Ians Gerät, offen). Das ist
   dieselbe Trennung, aus der Phase 19 überhaupt vor Phase 20 steht — nur eine Stufe
   feiner.
2. **`react-native-svg` war der einzige neue Native-Baustein, und das war der Punkt.**
   Der erste Build scheiterte an zwei Compilerfehlern; der zweite lief durch, ohne dass
   etwas geändert wurde (Xcode kompilierte beim ersten Mal noch Pods, während der Icon
   Composer lief). Weil nur EINE Sache neu war, war diese Diagnose in Minuten fertig.
3. **Die Fehlermeldung wäre fast verlorengegangen** — der Aufruf lief durch `tail -60`,
   und genau die `error:`-Zeilen wurden weggeworfen. Übrig blieb „2 error(s)" ohne einen
   Grund. Ein Build-Protokoll gehört ganz in eine Datei und wird hinterher gegrept.
4. **Vorhersage 19.6 ist bestätigt:** Nach einem echten Kaltstart kommen Anleitungskarte
   und Prototyp-Hinweis wieder — auf Native gibt es kein `sessionStorage`. **Das bleibt
   bis Phase 20 liegen**, wo `expo-secure-store` ohnehin dazukommt.

🔜 **Was jetzt auf Ian wartet: der Build auf sein echtes iPhone** (EAS, braucht seinen
Apple-Login) und der Gesten-Durchgang. **Ein Mausklick am Simulator ist keine
Gestenprüfung** — Wischstapel, Tastatur im Chat und der Jahrgangs-Balken sind unbelegt.

🔜 **Neu und geplant, noch nicht gebaut (2026-09-06): Phase 19c und 19d.** Ian hat die
fertige Karte BENUTZT und zwei Dinge gesagt — *„ich finde die Map nicht schön, sie sollte
zum App-Interface passen, ich mag Karten von Apple"* und *„wenn man auf einen Bezirk
klickt, sollen die Aktivitäten über dem Klick herausspringen, klein, mit dem Minimum an
Info — und wenn ich interessiert bin, klicke ich drauf und sehe die ganze."* Beides steht
ausgeschrieben in **PLAN.md, Abschnitt 5b, Phasen 19c und 19d.** Vier Dinge daraus:

1. **Es sind zwei Phasen, und das ist die wichtigste Entscheidung des Plans.** 19c ändert
   die BEDIENUNG und braucht nichts Neues; 19d ändert die KARTE und braucht einen
   Native-Baustein, einen neuen Build und Ians Apple-Schlüssel. Zusammen gebaut hätte
   jeder Fehler zwei mögliche Ursachen — dieselbe Überlegung wie „Gerät vor Backend".
2. **Mit 19c anfangen**, sie läuft sofort und macht die App besser statt schöner: Heute
   beantwortet ein Tipp auf die Karte nur die halbe Frage, man muss nach unten schauen.
3. **19d ist Ians Entscheidung gegen meine Empfehlung** — ich hatte den *gezeichneten*
   Apple-Stil vorgeschlagen (Donau blau, Parks grün, warmes Beige; eine Datei, läuft
   überall, kein neuer Baustein). Er will die echte. Wird gebaut, nicht neu verhandelt.
4. **Eine echte Apple-Karte macht die App NICHT genauer.** Am Post steht seit Phase 2 nur
   `district`, keine Koordinate. Die Apple-Karte ist der Hintergrund, `wien-bezirke.ts`
   bleibt die Auflage darüber — und **harte Regel 47 gilt jetzt gegen einen stärkeren
   Reiz**: Wer eine echte Karte sieht, denkt an Stecknadeln, und eine Stecknadel verrät
   statt „1220" die genaue Parkbank um 17:00.

✅ **Phase 19d-1 ist fertig (2026-09-06): unter den Bezirken liegt eine echte
Apple-Karte.** Ians Entscheidung 35, gegen meine Empfehlung — und sie läuft auf dem
iPhone-Simulator: Karte öffnet auf ganz Wien, Bezirke zart getönt, Auswahl umrandet,
Blase aus 19c unverändert daran. **Der Web-Prototyp ist unberührt** (23 SVG-Pfade wie
vorher, null MapKit im Bündel, null Konsolenwarnungen). Belege `t01`–`t04` im
Projektordner. Sechs Dinge sind daran wichtiger als das Bild:
1. **Die Geometrie wird umgerechnet, nicht zweimal gespeichert — das ist der Entwurf
   der Phase.** MapKit rechnet in Grad, `wien-bezirke.ts` steht im Raster. Der
   naheliegende Weg (Geo-Punkte ZUSÄTZLICH erzeugen) hätte dieselben 886 Punkte in zwei
   Einheiten hinterlassen, und die zweite wäre die still veraltende gewesen. Die
   Projektion des Skripts ist flach mit Kosinus-Korrektur und **exakt umkehrbar**:
   **vier Zahlen** (`PROJEKTION`) statt 886 Punkte, gerechnet in `lib/karte-geo.ts`.
2. **Der Beweis ist ein ORTSTEST, kein Round-Trip.** Raster → Geo → Raster hätte auch
   bei einem beidseitigen Vorzeichenfehler bestanden. Geprüft gegen sechs echte Orte —
   Stephansdom → 1010, Schönbrunn → 1130, Donauturm → 1220, Praterstern → 1020,
   Hauptbahnhof → 1100, Grinzing → 1190. Alle sechs richtig.
3. **`minZoomLevel` hat den ANFANGSAUSSCHNITT überschrieben** — der einzige echte Fehler
   der Phase. Mit dem gerechneten Wert 10 öffnete die Karte auf einem Drittel von Wien;
   `react-native-maps` setzt Zoomstufen auf iOS über Kamera-ENTFERNUNGEN um und liegt
   anderthalb Stufen neben der Lehrbuchformel. **9 ist gemessen, nicht gerechnet.**
4. **`APPLE_ZOOM_MAX = 15` ist eine Entscheidung, keine Technik.** Die App kennt keine
   Koordinaten; wer bis auf ein Haus zoomen darf, dem verspricht die Karte eine
   Genauigkeit, die die Daten nicht haben — harte Regel 47 gegen den Zoom.
5. **Apples Namensnennung war KEINE Arbeit.** Vorhergesagt als „nicht verhandelbar" —
   MapKit zeichnet „Maps · Legal" selbst. `KARTE_QUELLE` bleibt trotzdem: Die
   Bezirksflächen sind weiter von der Stadt Wien (CC BY). Zwei Nennungen, zwei Sachen.
   **Für MapKit JS (19d-2) gilt das nicht** — dort ist es Handarbeit.
6. **Der eigene `PanResponder` fällt auf iOS weg.** MapKit schiebt und zoomt selbst —
   ein Gesten-Erkenner weniger, und ausgerechnet der ungeprüfte.

⚠️ **Was an 19d-1 NICHT geprüft ist: der Tipp auf die Karte.** Der Simulator lässt sich
ohne Bedienungshilfen-Berechtigung nicht antippen (`osascript` → −1719), und die kann nur
Ian geben. Geprüft wurde, was daran hängt: die Umrechnung gegen sechs echte Orte, und
Auswahl samt Blase über einen vorübergehend gesetzten Bezirksfilter (`t02`). Offen ist
allein, dass MapKits `onPress` die Koordinate liefert. **Gehört in denselben Durchgang
wie Wischstapel und Jahrgangs-Balken: auf Ians Gerät.**

✅ **Phase 19c ist fertig (2026-09-06): die Aktivitäten springen aus der Karte.** Ians
erste von zwei Rückmeldungen zu 19b — bis dahin beantwortete ein Tipp auf die Karte nur
die halbe Frage, man musste nach UNTEN schauen. Jetzt schwebt über dem angetippten Bezirk
eine Sprechblase mit bis zu drei Zeilen (Kategoriefarbe · Titel · Zeit), darunter „alle 3
ansehen". **Kein neuer Baustein von außen, kein neuer Build** — genau deshalb steht sie
vor 19d. Belege `s01`–`s09` im Projektordner. Fünf Dinge sind daran wichtiger als die
Blase selbst:
1. **Die Platzrechnung stand vor dem ersten Handgriff — und war zu pessimistisch.** Die
   Kartenfläche ist auf 360 × 600 tatsächlich 216 × 168 px und auf 390 × 844 296 × 230,
   beide Zahlen auf den Punkt. Falsch war die FOLGERUNG: gerechnet mit dem Anker der
   Inneren Stadt, aber der 7. Bezirk sitzt tiefer und hat mehr Platz über sich — dort
   passen auf dem großen Handy alle drei. **Ein Wertebereich hat einen ungünstigsten und
   einen mittleren Fall, und eine hergezeigte Zahl muss sagen, welcher sie ist.**
2. **Der teuerste Fehler war ein FEHLENDER Fänger und sah aus wie ein kaputter Zustand.**
   `react-native-web` macht aus `box-none` ein CSS `pointer-events: none` und vererbt das
   an alle Nachkommen — **außer an Text-Knoten, denen RNW selbst ein `auto` gibt.** Die
   Blase ließ also überall durch, nur nicht auf den Buchstaben: Ein Zug über sie
   markierte Text, statt die Karte zu schieben. Ein ausdrückliches `pointerEvents:
   'auto'` am Körper behebt es, `userSelect: 'none'` nimmt die Markierung.
3. **Mein eigener Prüflauf hat den Fehler zuerst falsch beschrieben.** Der Schiebe-Test
   fasste die Karte in der Mitte an — also auf der Blase. Gemessen wurde das Overlay und
   nicht die Karte. **Wer ein Overlay einbaut, setzt seine Gestentests außerhalb davon
   an**, sonst prüft er das Neue gegen sich selbst.
4. **Zwei Konsolenwarnungen waren beide meine, und eine steht wörtlich in dieser Datei**
   (`pointerEvents` als Prop, ACTA-Falle aus Phase 4). Der Beleg war nicht der Code,
   sondern die Konsole — eine Warnung JE AUFRUF.
5. **Ians siebenunddreißigste Entscheidung: in der Blase steht oben, was als Nächstes
   losgeht** (`BLASE_REIHENFOLGE`, über `nachStartzeit` aus `sort.ts`). Die Liste
   darunter sortiert weiter nach dem Neuesten. Das ist kein Widerspruch wie bei
   `StapelDurch`/`LeererFeed`, sondern eine kurze und eine lange Antwort auf zwei
   verschiedene Fragen — die Blase ist eine AUSWAHL, die Liste die ganze Menge.

✅ **Phase 19b ist fertig (2026-09-06): die Wien-Karte.** Leopolds zweite Idee, und
das erste Stück, das `react-native-svg` aus Phase 19 wirklich ausnutzt. Dritte Stufe im
Umschalter („Stapel · Liste · Karte"), 23 echte Bezirksflächen aus den amtlichen Daten
der Stadt Wien, eingefärbt nach „wie viel ist hier los", antippbar, mit Schieben und
Zoomen. **Belegt auf Web UND nativ auf iOS** (`r01`–`r04`, `r05-ios-karte.png`). Sechs
Dinge sind daran wichtiger als das Bild:
1. **Aus 3 MB wurden 11 kB, und das Verfahren ist der Punkt.** 118.683 amtliche
   Stützpunkte → 886 (0,7 %). Entscheidend ist die REIHENFOLGE: **erst auf ein Raster
   runden, dann vereinfachen.** Zwei Nachbarbezirke teilen sich eine Grenze; vereinfacht
   jeder sie für sich, entstehen Lücken. Gerundet sind die geteilten Punkte vorher
   bitgleich.
2. **Die Josefstadt ist bei Handybreite 14 × 11 Bildpunkte groß** — neun der 23 Bezirke
   liegen unter 30 px, und genau dort liegen die meisten Posts. Nachgemessen wurde auch
   der naheliegendste Ausweg: „nächster Beschriftungspunkt gewinnt" ergibt **11 × 11 px**,
   also schlechter als nichts zu tun. **Was zu klein ist, ist das BILD, nicht die
   Logik** — deshalb Ians Entscheidung 33 (Zoom), gegen meine Empfehlung.
3. **Ein Kneifen wurde als Tipp gewertet** — der einzige echte Fehler der Phase, und nur
   mit ECHTEN Touch-Ereignissen zu finden. `gestureState.dx/dy` misst bei mehreren
   Fingern den MITTELPUNKT; zwei symmetrisch auseinandergezogene Finger lassen ihn
   stehen. Die Bewegungsgrenze (Regel 15) stellt hier die falsche Frage.
4. **`FeedFilter.bezirk` ist ein Union geworden** — vierte Runde nach `Post.district`,
   `ChatThread.postId` und `Visibility`, und wieder hat `tsc` die Arbeitsliste
   geschrieben. Nebengewinn: Posts ohne Bezirk sind erstmals ausdrücklich wählbar.
5. **Die Kartenhöhe hängt am Schirm (28 %), nicht an einer festen Zahl.** Mit festen
   230 px bekam die Liste auf 390 × 844 gute 266 px und auf **360 × 600 genau 22 px**.
6. **„Sta…" ist zum dritten Mal aufgetreten** (nach Phase 11 und 18a) und diesmal
   nachgerechnet: Bei 12 px Innenabstand bekommt „Stapel" 47,33 px und braucht 47 —
   deshalb steht `SsSegment` jetzt auf 8 px.

🗺️ **Wie sie spezifiziert wurde (2026-09-06): Phase 19b — die Wien-Karte.** Leopolds zweite
Idee aus dem BENUTZEN. Eine dritte Ansicht neben Stapel und Liste: 23 gezeichnete
Bezirksflächen, eingefärbt nach „wie viel ist hier los", Tippen zeigt die Posts darunter.
**Sie ist billig, weil an jedem Post seit Phase 2 `district: '1070'` steht** — die
Bezirksnummer liegt in der Postleitzahl, kein Feld kommt dazu. Vier Entscheidungen von
Ian stehen in PLAN.md, Phase 19b; die wichtigste ist seine eigene Formulierung: **erst
die Bezirksflächen, echte Karte mit Stecknadeln erst, wenn Leute die App benutzen** —
denn ein Pin verrät statt „1220" die genaue Parkbank (harte Regel 47). Gebaut wird sie
NACH Phase 19 und VOR dem Backend, weil sie reine Oberfläche auf vorhandenen Daten ist.

🔜 **Daneben weiter: wieder herzeigen.** Am 2026-09-02 haben die drei Mitgründer den
Prototyp am Handy durchgeklickt. Ihr Urteil zur Sache war gut (Leopold: „für die
Aktivitäten-Funktion sehr gut, an sich funktioniert es"), die Kritik betraf das
Aussehen: **„schaut noch bisschen nach AI aus, wegen den Emojis"** (Christoph) — **das
ist mit Phase 14 erledigt**. Leopolds Hinweis, dass man nicht genau genug filtern kann,
**ist mit Phase 15 erledigt**, dass man niemandem einfach schreiben kann, **mit
Phase 16**, und sein Wunsch nach **Gruppen mit Phase 17**. **Damit ist alles aus dem
Feedback gebaut.** Das Nächste ist deshalb keine Phase, sondern eine Frage an Menschen:
die drei sollen die neue Fassung ansehen. Erst danach kommt das Große — Backend,
EAS-Build, App Store.

🐞 **Der Durchgang war noch nicht fertig — zu Ende geklickt kamen zwei weitere
Fehler heraus (2026-09-03).** Abgedeckt waren Stapel, Filter, Gruppen und Chat-Liste;
NICHT abgedeckt war ausgerechnet der Kernablauf (posten → Bin dabei → bestätigen →
Chat) und die Direktnachrichten — also die Wege, die die drei als Erstes gehen.
Nachgeholt auf 375 × 667 und 360 × 600, beide Fehler behoben und hochgeladen:
1. **Der rote Hinweis zeigte aus dem Bild hinaus.** Bei offenem „Mehr einstellen" ist
   der Erstellen-Screen 1991 px hoch, das Fenster 667. Wer unten „Posten" tippt und den
   Titel vergessen hat, las „Es fehlt noch was — die roten Stellen" — und nichts war
   rot: Die Zeile stand bei **y = −752**. `VERSTECKTER_FEHLER` behandelt genau diesen
   Fall, aber nur für *zugeklappte* Felder — der Code setzt sichtbar mit **aufgeklappt**
   gleich statt mit **im Bild**. **Ians fünfzehnte Entscheidung: beides — hinspringen
   UND das Feld benennen** (`FEHLER_ANTWORT`). Der Satz heisst jetzt „Schau noch mal
   beim Titel." und nicht „Es fehlt noch der Titel": Zwei der fünf Meldungen betreffen
   ein Feld, das ausgefüllt und trotzdem falsch ist.
2. **Der Einstellungen-Screen zeigte die Icon-NAMEN statt der Icons** — „bl att",
   „m ue ll", „ba us tei ne", umgebrochen in einer 22 px schmalen Spalte. **Ian hat es
   gemeldet.** Ein Rest aus der Emoji-Zeit: Die lokale Komponente `Zeile` rendert
   `<SsText>{icon}</SsText>` — richtig, solange dort „📄" stand. Phase 14 hat den WERT
   auf `"blatt"` umgestellt, nicht den ZEICHNER. Überlebt hat es, weil `Zeile` eine
   **eigene** Prop `icon: string` hatte: Damit war „blatt" gültig, und der Compiler hat
   die Stelle nicht auf die Arbeitsliste gesetzt. **Ein Union-Typ schützt nur die Props,
   die ihn tragen.** Behoben, und der Mülleimer ist jetzt rot wie sein Text.
3. **Eine Entwickler-Notiz stand im Nutzungsbedingungen-Screen.** Im roten Kasten
   stand als letzte Zeile „Steht auch in `_FUER_IAN/OFFENE_SACHEN.md`." — Backticks als
   Zeichen mitgerendert, und ein privater Arbeitsordner auf einer öffentlich abrufbaren
   Adresse (harte Regel 12), ausgerechnet auf dem Screen, der seriös wirken soll.
   Entfernt; der Zeiger stand ohnehin im Dateikopf. **Damit ist der Durchgang
   vollständig:** `/einstellungen`, `/nutzungsbedingungen`, `/account-loeschen`,
   `/melden`, die Follower-Listen und `/post/[id]` sind auf 360 × 600 nachgeprüft —
   kein Überquellen, kein verdeckter Knopf.
4. **Zwei Leer-Zustände übereinander.** Sucht man nach einem Wort, das in keinem Post
   vorkommt, standen „Hier ist der Stapel durch" und „Dazu ist gerade nichts da"
   untereinander und widersprachen einander; der Ausweg („Filter zurücksetzen") lag auf
   360 × 600 halb hinter der Tab-Leiste. `StapelDurch` ist eine **Überschrift über
   einer Liste** und verspricht sie im Text — leert ein Filter beide, ist sie eine
   Überschrift über nichts. Behoben mit `listeHatWas`. **Das trifft auch den stillen
   Dienstag**: ohne Post stand bisher „Das war alles für heute" über einer leeren
   Fläche, jetzt steht dort „Noch nichts los in deinem Feed" mit „Etwas posten".

🐞 **Beim Durchklicken der Live-Fassung in Handybreite (2026-09-03) kam noch ein
zweiter echter Fehler heraus: Das Filterfeld schob den Wischstapel kaputt.** Klappte
man im Stapel „Filter" auf, nahm das Feld dem Stapel rund 250 px — und weil die Karten
`position: absolute` liegen, schrumpften sie nicht mit, sondern quollen über die
Kategorie-Pillen und über „Bin dabei". Auf einem iPhone SE verdeckte die Karte
ausgerechnet den **Alters-Filter**, den Daria und Leopold sich gewünscht hatten.
Behoben, hochgeladen. Drei Dinge sind daran wichtiger als der Fix:
1. **Ians vierzehnte Entscheidung: Das Feld legt sich drüber, es schiebt nicht** —
   dasselbe Urteil wie beim Prototyp-Hinweis (Regel 22). Getragen wird das vom Zähler
   „Noch 8 Karten" oben, der beim Tippen live mitzählt.
2. **Der erste Fix war zu kurz gesprungen.** Das Blatt lag im Screen über dem ganzen
   Stapelbereich; auf 390 × 844 und 375 × 667 sah das richtig aus, auf **360 × 600
   verschwanden die Knöpfe dahinter**. Der Screen weiß nicht, wo die Karten aufhören.
   Als Slot IN der Kartenfläche (`WischStapel.blatt`, harte Regel 36) stimmt es überall.
3. **Gefunden nur durch Durchklicken am schmalen Fenster.** Im Code sieht man es nie:
   Zwei für sich richtige Stilwerte ergeben zusammen den Fehler.

🐞 **Davor, gleicher Tag, hat Ian selbst einen gefunden: Die Karteikarten lagen
schief.** Alle drei standen im Ruhezustand auf
-16°, leicht vergrößert, und der Stempel **„Weg" war dauerhaft sichtbar** — bis man
eine Karte anfasste. Das ist behoben und hochgeladen. Es war **eine** Ursache für
beide Symptome: Beim Web-Export ist die Kartenbreite null, damit wird `[-b, 0, b]` zu
`[-0, 0, 0]`, und eine Interpolation ohne Spannweite liefert ihren ERSTEN Ausgabewert
statt den mittleren. Zwei Dinge sind daran wichtiger als der Fix:
1. **Verdecken ist kein Reparieren.** Phase 13 hatte genau diesen halben Zustand
   gesehen und mit `#ss-start` zugedeckt. Der Wert darunter blieb falsch — und weil
   eine `AnimatedInterpolation` nur schreibt, wenn ihr Eingang sich bewegt, hat ihn
   nie jemand überschrieben. Harte Regel 21 hat dazu jetzt einen Nachtrag.
2. **Der Beweis stand im gebauten HTML, nicht im Browser.** `dist/index.html`
   enthielt wörtlich `rotate(-16deg)` und beim „Weg"-Stempel `opacity:1`. Wer so
   etwas sucht, vergleicht das gebaute HTML mit dem laufenden DOM: Stehen dort
   dieselben Zahlen, hat nie jemand nachgeschrieben.

✅ **Phase 17 ist fertig (2026-09-02): Gruppen.** Leopolds Wunsch, und das einzige
Stück, das ein NEUES Konzept in die App bringt statt ein vorhandenes zu verbessern.
Eine Gruppe ist eine **dritte Sichtbarkeits-Stufe**, kein zweiter Ort: Beim Posten
wählt man „Alle", „Nur Follower" oder „Nur Marswiese Tennis", und der Post steht im
GANZEN Feed, nur mit dem Gruppennamen an der Karte. Hinein kommt man auf Anfrage, der
Gründer bestätigt — dasselbe Muster wie „Bin dabei", deshalb liegen die Anfragen im
selben Tab und zählen in dieselbe Zahl. Vier Dinge sind daran wichtiger als die
Screens:
1. **`Visibility` ist ein diskriminiertes Union geworden**, kein erweiterter String.
   Das ist die dritte Runde derselben Frage nach `Post.district` und
   `ChatThread.postId` — und die erste, in der der Compiler geholfen hat: Weil
   `post.visibility === 'followers'` ungültig wurde, hat `tsc` die Arbeitsliste
   geschrieben (sieben Stellen in vier Dateien). **Faustregel: Braucht eine neue Stufe
   zusätzliche Daten, ist es ein Union — kein zweites Feld daneben.**
2. **Ians zwei neue Entscheidungen stehen in `features/groups/gruppe.ts`**, wie
   `block.ts` und `direkt.ts`: `AUSTRITT_WIRKUNG = 'posts-bleiben'` und
   `GRUENDER_AUSTRITT = 'weitergeben'`. Screens lesen sie nie; die Sätze in der
   Verlassen-Rückfrage kommen aus `austrittFolgen()`.
3. **`GroupRequest` ist ein EIGENER Typ**, kein `JoinRequest` mit optionalem `postId`.
   Das wäre die Phase-16-Falle noch einmal gewesen. An der Oberfläche ist es trotzdem
   dasselbe Muster — das ist Absicht, kein Anlass, die Daten zu verschmelzen.
4. **Ein unsichtbarer Post ist der Beweis.** In `mock.ts` ist `g3` eine Gruppe, in der
   Ian NICHT ist, und `p16` fehlt deshalb in seinem Feed. Ohne diesen einen Post sähe
   man nur ein Etikett an einer Karte und wüsste nie, ob die Stufe wirklich etwas tut.

> ✅ **Ians zwölfte und dreizehnte Entscheidung, 2026-09-02:** `features/groups/gruppe.ts`
> — **verlässt jemand eine Gruppe, bleiben seine Posts stehen** (`AUSTRITT_WIRKUNG`),
> und **verlässt der GRÜNDER sie, geht die Leitung an das Mitglied, das am längsten
> dabei ist** (`GRUENDER_AUSTRITT`). Die erste Frage stand im PLAN.md ausdrücklich
> offen; die zweite kam beim Bauen dazu. Verworfen: Posts löschen (sagt fremde
> Verabredungen ab wegen einer Sache, die nichts damit zu tun hat) und Posts öffentlich
> machen (macht aus „nur für meine Tennisgruppe" still „für ganz Wien" — der einzige
> echte Datenschutzfehler unter den dreien). Beim Gründer verworfen: nur auflösen (ein
> Einzelner löscht acht Leuten ihre Gruppe) und Gruppe ohne Chef (Anfragen bleiben für
> immer liegen). **Wer „am längsten dabei" ist, steht schon in den Daten** —
> `memberIds` wächst hinten, also ist es der erste Eintrag, der nicht der Gehende ist
> (`nachfolgerId()`). Wer `memberIds` umsortiert, ändert still, wer eine Gruppe erbt.
> **Es wartet keine Frage auf Ian.**

✅ **Phase 16 ist fertig (2026-09-02): Direktnachrichten.** Bis dahin gab es keine
Nachricht ohne Aktivität — nicht, weil der Knopf fehlte, sondern weil `ChatThread.postId`
ein **Pflichtfeld** war. Genau das hatte Leopold gemeldet. Vier Dinge sind daran wichtiger
als der Knopf selbst:
1. **Die Regel steht in `features/chat/direkt.ts`**, wie `block.ts` und `wisch.ts`:
   `SCHREIB_REGEL = 'gegenseitig'` (Ians Entscheidung), alle drei Möglichkeiten im
   Kopfkommentar, `darfSchreiben()` führt sie aus und `schreibHuerdeText()` schreibt sie
   auf. Der Screen kennt die Regel nicht, er sieht nur ihr Ergebnis.
2. **Es gibt jetzt ZWEI Sorten Chats mit ZWEI Ablaufregeln.** Ians 7-Tage-Regel gilt nur
   noch für Aktivitäts-Chats; ein Direktchat läuft nie ab. `chatZustand()` nimmt deshalb
   einen optionalen Post — die Funktionen darunter (`nachklangEnde` &c.) bleiben bewusst
   bei einem Pflicht-Post, weil sie Fragen beantworten, die es ohne Treffen nicht gibt.
3. **Wo ein Typ weiter wird, muss die Enge eine Ebene höher neu entstehen.**
   `ChatThread.postId?` erzeugte NULL Typfehler (`find(p => p.id === undefined)` ist
   gültiger Code). `ChatEintrag.post?` erzeugte acht — in genau den zwei Screens, die
   einen Post voraussetzen. Das ist die Umkehrung der Phase-14-Lehre und die Wiederholung
   der `string | null`-Falle vom selben Tag.
4. **Steht der Knopf nicht da, steht ein Satz da.** Ein fehlender Knopf sieht aus wie
   eine App, die die Funktion nicht hat — genau Leopolds ursprünglicher Eindruck.

> ✅ **Ians elfte Entscheidung, 2026-09-02:** `src/features/chat/direkt.ts` —
> **ein Direktchat entsteht erst mit der ersten gesendeten Nachricht** (`ENTSTEHUNG`).
> Die Frage kam beim Bauen auf und stand in keinem Plan: Was sieht die andere Person,
> wenn ich auf „Nachricht" tippe und es mir überlege? Beim Aktivitäts-Chat wäre das
> keine Frage — dort IST ein stummer Chat eine Nachricht („ihr seid verabredet, keiner
> hat sich gemeldet"), und genau deshalb steht er nach seiner Regel ganz oben. Ein
> stummer Direktchat heißt nichts, und mit `'beim-tippen'` hätte ein Fehlgriff bei der
> anderen Person genau dort oben gelegen. Den Haken kennt er: Ein halb getippter
> Entwurf ist beim Zurückgehen weg. **Es wartet keine Frage auf Ian.**

✅ **Phase 15 ist fertig (2026-09-02): Altersgruppe und vier neue Filter.** Der Feed hat
jetzt **Suche · Bezirk · Wann · Altersgruppe** dazu — zusammen mit Kategorie und „Wem ich
folge" sechs Stück, und deshalb ist `FeedFilter` ein Objekt geworden statt Einzelwerte.
Vier Dinge sind daran wichtiger als die Pillen selbst:
1. **Die Regeln stehen in `features/posts/filter.ts`, nicht im Screen** — dieselbe
   Trennung wie `sort.ts` und `lifecycle.ts`. Ein Filter, der im `useState` eines
   550-Zeilen-Screens lebt, ist beim nächsten Umbau weg.
2. **`AgeGroup` und `AgeBand` sind zwei Typen.** Eine Aktivität kann „für alle" sein,
   ein Mensch nicht. `AgeBand = Exclude<AgeGroup, 'egal'>` — ein neues Band käme an
   EINER Stelle dazu.
3. **Der Bezirks-Filter zeigt nur Bezirke, in denen wirklich etwas los ist.** Eine Reihe
   mit allen 23 wäre zu zwanzig Teilen eine Sackgasse.
4. **Der Zähler am Filter-Knopf ist kein Schmuck.** Vier Filter liegen zugeklappt hinter
   ihm; ohne die Zahl daneben ist ein vergessener Filter der schnellste Weg zu einem
   Feed, den jemand für kaputt hält.

`User.photoUrl?` gibt es seither auch — **aber kein Bild**. `SsAvatar` kann es zeichnen
und alle elf Aufrufstellen reichen es durch; es fehlt nur der Upload, und der braucht ein
Backend. Bis dahin stehen die Initialen aus Phase 14. Das ist die halbe Antwort auf
Darias Frage, und sie soll wissen, dass es die halbe ist.

> ✅ **Ians zehnte Entscheidung, 2026-09-02:** `src/features/posts/filter.ts` —
> **ein Post „für alle" passt zu JEDEM Alters-Filter.** Die Frage kam beim Bauen auf
> und stand in keinem Plan: Wer „18–25" wählt, sieht auch die Posts ohne Altersangabe.
> Grund: „Für alle" ist die Voreinstellung beim Posten, also die Mehrheit — die strenge
> Regel hätte ausgerechnet die offensten Posts weggeworfen, und ein Feed, der von zwölf
> Karten auf eine schrumpft, wird nicht wieder angefasst. Den Haken kennt er: Der Filter
> fühlt sich dadurch weich an. Er wird erst scharf, wenn Leute die Altersgruppe wirklich
> setzen — und das tun sie erst bei vielen Posts. `ALTER_REGEL`, ein Wort.

✅ **Phase 14 ist fertig und hochgeladen (2026-09-02): kein einziges Emoji mehr in der
Oberfläche.** An ihrer Stelle **41 gezeichnete Icons** in `src/theme/icons.ts` — eine
Datei, ein Raster (24×24), eine Strichstärke. Drei Dinge sind daran wichtiger als die
Bilder selbst:
1. **`IconName` ist ein Union-Typ, kein `string`.** Deshalb war der Umbau überhaupt
   machbar: `SsButton.icon` eng zu machen hieß, dass `npx tsc --noEmit` die
   Arbeitsliste schreibt (25 Stellen). Wer jetzt ein Emoji hinschreibt, bekommt einen
   Typfehler. Das ist die **Umkehrung** der Bezirks-Lehre vom selben Tag — `string |
   null` erzwingt nichts, eine Whitelist schon.
2. **Icons nehmen die Farbe an, Emojis konnten das nie.** Deshalb fallen zwei Behelfe
   weg: die Deckkraft in der Tab-Leiste und das fehlende Symbol am Folgen-Knopf. Und
   deshalb ist der bekannte Haken („zu blass = langweilig") jetzt überhaupt steuerbar.
3. **`SsIcon` zeichnet NUR auf Web.** Auf Native gibt es kein `<svg>`, und die
   Bibliothek dafür wäre ein Native-Modul (harte Regel 1). Dort steht ein *sichtbarer*
   Platzhalter. Der Weg heraus ist eine Datei, kein Screen —
   `_FUER_IAN/OFFENE_SACHEN.md`, Punkt 3.

Avatare sind seither **Initialen auf farbigem Grund**; `User.avatar` gibt es nicht mehr.
Dabei kam ein Fehler heraus, den die Emojis verdeckt hatten: Die Avatarfarbe kam aus
einer Summe von Zeichencodes, und Ian und Lea landeten auf derselben — auf dem
Match-Screen zwei identische Kreise nebeneinander. Jetzt FNV-1a (`streuen()`).

✅ **Phase 0 bis 13 sind fertig und hochgeladen.** Phase 13 (2026-09-02) kam aus zwei
Rückmeldungen, die Ian am Handy hatte: der halb fertige Wischstapel beim Öffnen auf
Chrome, und der Prototyp-Hinweis, der nach unten sollte. Beides ist behoben, samt drei
Fehlern im ausgelieferten HTML, die dabei aufgefallen sind (`lang="en"`, leerer
`<title>`, kein `theme-color`) — Einzelheiten in `app/+html.tsx` und PLAN.md, Phase 13.

**Seit Phase 12 hat der Erstellen-Screen zwei Felder statt zehn:** Kategorie und Titel.
Alles andere liegt hinter der Zeile „Mehr einstellen" und hat eine Voreinstellung, die
für sich allein einen gültigen Post ergibt (`STANDARD` im Kopf von `app/create.tsx` —
**Ians Werte, nicht ohne Rückfrage ändern**). Die **Live-Vorschau ganz oben ist die
Absicherung dafür**: Sie ist die einzige Stelle, an der man sieht, was die
Voreinstellungen gesetzt haben. Wer sie wegräumt, macht aus dem Screen ein Formular,
das heimlich Termine erfindet.

> ✅ **Ians neunte Entscheidung, 2026-09-02: der Bezirk ist freiwillig.** Gefragt war,
> was bei einem *versteckten* ungültigen Feld passieren soll — er hat keine der drei
> Möglichkeiten genommen, sondern die Frage weggenommen: Wer keinen Bezirk angeben
> will, muss keinen angeben. Damit ist ein leeres Feld kein Fehler mehr.
>
> Das reicht tiefer als ins Formular: **`Post.district` ist `string | null`** (der User
> behält seinen Pflicht-Bezirk, nur der Post darf ohne), und **`ortText()` in
> `lib/bezirk.ts`** ist die eine Stelle, die daraus „1220 Wien" oder „Wien" macht —
> für alle sieben Screens, die den Ort zeigen. In `data/mock.ts` hat **p7 „Donauinsel
> spazieren" als einziger keinen Bezirk**; ohne diesen Post sieht niemand, wie der Fall
> aussieht. Den Haken kennt er: „Wien" ist als Ortsangabe fast nichts — lassen viele das
> Feld leer, verliert der Feed die Angabe, mit der man entscheidet, ob man hingeht. Die
> Korrektur ist ein Wort (`BEZIRK_FREIWILLIG` in `app/create.tsx`).
>
> ✅ **Und die kleine Frage daneben, gleicher Tag:** Vor „Mehr einstellen" stehen jetzt
> **die drei Striche ☰**, nicht ⚙️ — wie er es ursprünglich gesagt hatte. `MEHR_SYMBOL`.

✅ **Alle Regel-Entscheidungen sind getroffen (Stand 2026-09-06).** Zuletzt die
**neununddreißigste: beim Kontolöschen geht alles mit — außer der Gruppe.**
(`supabase/migrations/0003_konto_loeschen.sql`, PLAN.md Abschnitt 6, Punkt 39.) Sie
ist die erste, die aus dem SCHEMA kam statt aus einem Screen, und die erste, bei der
eine neue Entscheidung eine ältere hätte überschreiben können: A hieß „Gruppen weg",
`GRUENDER_AUSTRITT` hieß „vererben". Gefragt statt geraten — *eine Gruppe gehört acht
Leuten.* Davor die achtunddreißigste: **die Kartenfarbe bleibt bei gleich breiten Stufen** (`stufeFuer()`
in `features/posts/karte.ts`, PLAN.md Abschnitt 6, Punkt 35) — die Karte sagt damit
weiter, *wo überhaupt etwas ist*, und bleibt im Kopf zurückrechenbar. Dabei kam heraus,
dass zwei der drei angebotenen Möglichkeiten **fast dieselbe Regel** waren; die
Gegenüberstellung im Plan ist entsprechend berichtigt. Davor die dreiunddreißigste:
**die Karte lässt sich schieben und zoomen** (`KARTE_GESTE`) — gegen meine Empfehlung
„Lupe“, und sein Argument war das bessere.
Die letzte — `zaehltAlsTermin()` in `features/requests/kollision.ts` — hat er an diesem
Tag beantwortet: **erst, wenn wirklich jemand dabei ist.** Die verworfenen Möglichkeiten
stehen in allen sieben Regel-Dateien weiter im Kopfkommentar — als Gedächtnis, nicht als
Einladung.

❓ **Eine Frage wartet trotzdem auf Ian, und sie betrifft KEINE Regel-Datei
(2026-09-06):** Er wollte die Landing-Page in **Olivgrün, Weinrot und Türkis** sehen.
Die drei Vorschauen liegen in **`landing-vorschau/`** — nicht in `landing/`, damit sie
nicht mit hochgeladen werden können. Sie kopieren die Seite nicht, sondern laden sie aus
`../landing/` und legen nur eine Farbdatei darüber; ändert sich die echte Seite, ziehen
alle drei mit. **Was noch nicht entschieden ist, steht in
`landing-vorschau/LIESMICH.md` und als Punkt 4b in `_FUER_IAN/OFFENE_SACHEN.md`:**
Farbe *und* ob die sechs Kategoriefarben mit auf die Leitfarbe gehen (A) oder bunt
bleiben (B). **Vor dem Einbau der gewählten Farbe harte Regel 13 lesen** — sie muss in
`simplysocial/src/theme/colors.ts` UND in `landing/stil.css`, sonst driften App und
Seite. Dazu liegen in `stil.css` **fünf Farbwerte ohne Variable** (Marker unter „jetzt",
Strich am Zitat, „Social" im Schriftzug, Live-Punkt, `::selection`) und **sechs im
Code von `seite.js`** (Konfetti); alle elf stehen in den `farben-*.css` schon
aufgeschrieben und gehören beim echten Einbau in Variablen aufgelöst.

**Seit Phase 11 ist der Startbildschirm ein Wischstapel** („wie so ein bisschen
Tinder"): Karteikarten, die kippen, sich mit einer Abrisskante vom Block lösen und
einen Stempel bekommen — links „Weg", rechts „Bin dabei". Rechts fährt unten eine
Leiste hoch mit vorausgefülltem Gruß; abbrechen legt die Karte zurück. **Der Feed ist
NICHT weg**, er ist die zweite Ansicht daneben und das Auffangnetz für den leeren
Stapel. **Wer daran etwas ändert, liest zuerst PLAN.md Abschnitt 1** („Warum Feed statt
Swipe"): Das Argument GEGEN das Wischen gilt weiter, es wird nur anders beantwortet —
wer nur die Aufgabe liest, räumt eine der beiden Ansichten weg, und das ist nicht
gemeint.

**Phase 0 bis 11 fertig (Phase 10 und 11 am 2026-09-01).** Seit Phase 9 gibt es die
**Landing-Page**: was SimplySocial ist, wie es geht, warum, und die vier Namen —
Ian, Christoph, Leopold, Daria. Bewusst kurz und **ohne Organigramm**, das war Ians
Vorgabe. Kein Build: HTML, CSS, etwas JavaScript.

**Phase 0 bis 8 (Stand davor):** Seit Phase 8 hat der Prototyp eine
Adresse, die Ian weiterschicken kann, und **jeder Bildschirm ist einzeln verlinkbar** —
das war die eigentliche Arbeit, nicht das Hochladen. Beim ersten Öffnen sagt die App
selbst, dass alles erfunden ist, dass es keinen Login gibt und dass Neuladen zurücksetzt.

**Phase 0 bis 7 (Stand davor):** Der Kernablauf läuft von Anfang bis
Ende und hört nicht mehr beim Konfetti auf: posten → im Feed sehen → „Bin dabei" → der
Verfasser bestätigt → Konfetti → **Chat**. Der Post schließt sich selbst, wenn der letzte
Platz weg ist. Seit Phase 6 gibt es Profile: nachsehen, wer jemand ist, folgen und
entfolgen — was live den Feed verändert. Seit Phase 7 steht die **Sicherheits-Oberfläche**
(Apple 1.2): melden, blockieren, Nutzungsbedingungen, Account löschen — erreichbar über
Post-Detail, fremdes Profil und `/einstellungen`. **Einen Platzhalter gibt es nicht mehr.**

> ✅ **Ians siebte Entscheidung, 2026-09-01:** `src/features/safety/block.ts` —
> **Blockieren heißt: alles weg.** Die härteste der drei Möglichkeiten. Der Chat
> verschwindet, eine bestätigte Verabredung wird abgesagt, der Platz wird frei. Seine
> Begründung sinngemäß: Bei Instagram heißt blockieren „sieht meine Bilder nicht mehr",
> hier heißt es „taucht nicht mehr am selben Ort auf wie ich". Den Haken kennt er — ein
> Fehlgriff kostet eine echte Verabredung; deshalb fragt Blockieren als einzige Aktion
> neben dem Kontolöschen vorher nach.

> ✅ **Drei weitere Entscheidungen von Ian am 2026-09-01, alle eingebaut:**
> - `src/features/chat/lifecycle.ts` — ein Chat rutscht nach dem Treffen unter
>   **„Vorbei"** und verschwindet dort nach **einer Woche** (`NACHKLANG_TAGE`).
>   Seine Worte waren „B ist gut und C auch" — die beiden nacheinander.
> - `src/features/chat/sort.ts` — in der Chat-Liste stehen **die neuen (noch stummen)
>   Chats immer ganz oben**, darunter alles nach Bewegung.
> - `src/features/posts/profil.ts` — auf ein Profil kommt **nur, was gerade läuft**.
>   Kein Archiv gewesener Treffen: das Profil ist ein Aushang. Den Haken kennt er —
>   wer nichts geplant hat, hat ein leeres Profil; deshalb tragen dort Bio und
>   Interessen die Last.

> ✅ **Ians achte Entscheidung, 2026-09-01:** `src/features/posts/wisch.ts` —
> **links heißt „weg für diese Sitzung", rechts heißt „Leiste mit vorgeschriebenem
> Gruß".** Verworfen sind *weg für immer* / *nur nach hinten* und *sofort anfragen* /
> *aufs Detail springen*; alle stehen als benannte Konstanten in der Datei. Den Haken
> kennt er: Lassen alle den vorgeschlagenen Satz stehen, steht beim Poster zehnmal
> derselbe. Das „Rückgängig" nach einem Wisch nach links ist mein Vorschlag, den er
> streichen kann (`RUECKGAENGIG_MS`).

> ✅ **Ians sieben Regeln davor sind entschieden und eingebaut.** Alle sind **seine**
> Entscheidungen — nicht ohne Rückfrage ändern. Die ersten drei vom 2026-08-31:
> - `src/features/posts/sort.ts` — **das Neueste zuerst** im Feed.
> - `src/features/posts/lifecycle.ts` — ein Post bleibt **bis zum Ende seines Tages**,
>   der Poster darf beim Erstellen kürzer oder länger wählen (`expiresAt` am Post).
> - `src/features/requests/logic.ts` — bei vollen Plätzen **Warteliste, still**: übrige
>   Anfragen bleiben stehen, statt automatisch abgesagt zu werden.
>
> In allen sieben Dateien stehen die verworfenen Möglichkeiten samt Begründung weiter im
> Kopfkommentar — als Gedächtnis, nicht als Einladung.
>
> Kompletter Übergabestand: [PLAN.md, Abschnitt 9](PLAN.md).

## Reihenfolge

1. ~~Klickbarer Web-Prototyp~~ ✅ *fertig, 13 Screens statt 9*
2. ~~Deploy auf echte URL~~ ✅ *fertig, GitHub Pages, 2026-09-01*
3. ~~Landing-Page mit „Über uns"~~ ✅ *fertig, 2026-09-01*
4. ~~Herzeigen und zuhören~~ ✅ *Ian hat beides am Handy angeschaut, 2026-09-01*
5. ~~Umbau nach seinem Feedback~~ ✅ *Phase 10, 11 und 12, alle am 2026-09-01*
6. ~~Wieder herzeigen~~ ✅ *alle drei Mitgründer, 2026-09-02*
7. ~~Umbau nach ihrem Feedback~~ ✅ *Phase 14 bis 17 am 2026-09-02, Phase 18a bis 18c am
   2026-09-05:* ~~Icons statt Emojis~~ · ~~Altersgruppe + Filter~~ ·
   ~~Direktnachrichten~~ · ~~Gruppen~~ · ~~in Gruppen einladen~~ · ~~Jahrgang~~ ·
   ~~Chat-Liste~~ ·
   ~~nicht 2 Sachen gleichzeitig~~
8. **Wieder herzeigen** — die drei haben Phase 13 gesehen, nicht 18a. Läuft neben 9.
9. **Aufs Gerät** (Phase 19) ← *hier sind wir* — erster EAS-Build, `react-native-svg`,
   Durchgang am iPhone. ~~Wien-Karte (19b)~~ ✅ *2026-09-06*
9c. ~~**Karte wird zur App** (Phase 19e)~~ ✅ *beide Teile am 2026-09-07, beide ohne
   Build:* ~~**19e-1**: Vollbild-Karte, ziehbares Blatt, Kopf weg, Posten als runder
   Knopf, Hinweis als Vollbild~~ · ~~**19e-2**: Liquid Glass an Tab-Leiste, Pille und
   Blattkopf~~ — der Baustein lag schon in `node_modules`, siehe oben.
9d. **Aufs echte Gerät** — ✅ **die App LÄUFT seit dem 2026-09-08 auf Ians iPhone** (`at.simplysocial.app`, Release-Build, JavaScript eingebacken, läuft
   ohne Kabel und ohne Mac, 7 Tage gültig). Gebaut wird **nicht** mit `expo run:ios`,
   sondern mit `xcodebuild -destination 'generic/platform=iOS'` und
   `-derivedDataPath ~/Library/Developer/Xcode/DerivedData/SimplySocial-geraet`
   (**außerhalb von iCloud** — siehe Fallen-Liste), dann
   `xcrun devicectl device install app`. Den Entwickler hat Ian am Gerät bestätigt
   (Einstellungen → Allgemein → VPN & Geräteverwaltung) — ohne das startet sie nicht.
   ← *Hier geht es weiter:* der Durchgang aus `_FUER_IAN/HANDY_DURCHGANG.md`. Offen
   sind: Wischstapel unter einem Finger, Tastatur im
   Chat, Jahrgangs-Balken mit zwei Fingern, Tipp auf die Apple-Karte, **ob sich Blatt
   und Karte auf iOS um dieselbe Berührung streiten** — und neu: wie sich das Glas unter
   einem Finger anfühlt und ob `isGlassEffectAPIAvailable()` auf seiner iOS-Fassung
   genauso antwortet wie auf 26.5.
9b. ~~**Karte nachbessern**~~ — ~~**19c** (Aktivitäten springen heraus)~~ ✅ und
   ~~**19d-1** (echte Apple-Karte auf iOS)~~ ✅, beide *2026-09-06*. **19d-2** (MapKit JS
   im Browser) wartet auf Phase 20: Der Token muss von einem Server ausgestellt werden.
   PLAN.md Abschnitt 5b.
9e. **Ians Durchgang ist gemacht — und daraus kommen drei Phasen** (2026-09-08,
   PLAN.md Abschnitt 5b) ← *hier geht es weiter*. Vier von sechs Punkten hielten, auch
   die beiden, die im Browser prinzipiell nicht zu prüfen waren (Wischstapel unter
   einem Finger · **kein Gestenstreit zwischen Blatt und Apple-Karte**). Offen ist,
   was er gesehen hat: ~~**19f** „Weniger sehen" (Post-Screen, Zurück-Pfeil,
   Filter-Symbol, Umschalter, Tastatur im Chat, Gruppe-erstellen ins Chats-Register)~~
   ✅ *2026-09-08, ohne neuen Build* ·
   ~~**19g** „Die Karte fertig machen" (Glas-FORM, Blase zurück, Apple-Nennung, Ganz
   Wien, Übergänge, zwei Kartenfehler)~~ ✅ *2026-09-08, ohne neuen Build* ·
   ~~**19h-1** „Nähe statt Filter" (Heimatbezirk, Reihenfolge nach Entfernung,
   Bezirks-Filter weg, Tab-Wörter weg)~~ ✅ *2026-09-08, ohne neuen Build* ·
   ~~**19i** „Der Bezirk als Vollbild, und das Glas überall" (Blatt weg, Bezirk als
   Vollbild, Tab-Symbole mittig, zwei Glas-Ursachen)~~ ✅ *2026-09-09, ohne neuen
   Build* — **die Kapsel klebte auf iOS seit 19e-2 an beiden Rändern, und das war
   eine der Ursachen für „das ist kein Liquid Glass"** ·
   ~~**19h-2** „Standort" (`expo-location`, mit neuem Build)~~ ✅ *2026-09-09 — der
   Feed misst ab dem gemessenen Ort; **der Zielpunkt bleibt die Bezirksmitte, und
   deshalb überlebt Entscheidung 1**.* ← *hier geht es weiter: **Phase 20.3
   (Anmelden)**, und das braucht Ians Konten*. **Von den zwei Kartenfehlern war einer keiner** (der 14.
   Bezirk stimmt, gegen die amtlichen Daten nachgerechnet) und einer gehörte einer
   älteren Fassung (der Filter-Knopf, erledigt durch 19f).
10. **Backend** (Phase 20) ← *hier sind wir* — ~~Schema (20.1)~~ ✅ · ~~Policies
   (20.2)~~ ✅ *beide 2026-09-06, ohne Konto gebaut und mit 25 Angriffen belegt* ·
   ~~**Anmelden, die Naht (20.3-a)**~~ ✅ *2026-09-09, ohne Konto und ohne Build:
   `CURRENT_USER_ID` gelöscht, Sitzung, Torwächter, Anmelde-Bildschirm mit Attrappe* ·
   **Anmelden, die Konten (20.3-b)** ← *hier geht es weiter, und NUR das braucht Ians
   Konten* · `store.ts` tauschen (20.4/20.5) · Profilbilder · Meldungen lesen.
   Danach fällt 19d-2 nebenbei ab.
11. **App Store** (Phase 21) — 13+, Rechtstexte, TestFlight, einreichen

> Der Plan dazu steht ausgeschrieben in **[PLAN.md, Abschnitt 5b](PLAN.md)**. Die drei
> Wahlen darin sind seit dem 2026-09-06 entschieden.

## Stack

**Expo + Expo Router + React Native Web** — ein Projekt, zwei Ausgänge: Browser jetzt,
iOS-App später ohne Neuschreiben. Ordner: `simplysocial/`.

Die **Landing-Page** liegt daneben in `landing/` und ist bewusst etwas ganz anderes:
reines HTML/CSS/JS, kein npm, kein Bundler. Für sechs Dateien wäre eine Werkzeugkette
ein Wartungsposten ohne Gegenwert. Sie hat ein eigenes Repo und einen eigenen Deploy.

Der Prototyp läuft **komplett auf Fake-Daten** aus `src/data/mock.ts`. Kein Login,
kein Firebase, kein Server. Alle Screens lesen über Hooks in `src/features/*/hooks.ts` —
das ist die Naht, an der später die echte Datenbank angeschlossen wird.

```bash
cd simplysocial
npm install
npx expo start --web      # Web-Preview
npx tsc --noEmit          # Typecheck
npm run deploy            # bauen + auf GitHub Pages schieben (NUR gh-pages!)
npm run doku              # Doku nach doku/ spiegeln (macht der pre-commit-Hook selbst)
git add -A && git commit && git push   # ← die Sicherung. Der Deploy ist keine.
```

## Harte Regeln

1. **Kein Firebase, kein Login, kein Netzwerk im Prototyp.** Bei ACTA hat genau das die
   Web-Preview kaputtgemacht (`@react-native-firebase` ist native-only, brauchte Shims).
2. **Screens lesen niemals direkt aus `mock.ts`** — immer über die Hooks. Sonst ist der
   spätere Backend-Tausch eine Suchen-und-Ersetzen-Aktion durch alle Dateien.
3. **Der Name `SimplySocial` steht an genau einer Stelle** (`src/config/brand.ts`).
4. **`_FUER_IAN/OFFENE_SACHEN.md` pflegen**, sobald etwas auftaucht, das nur Ian kann.
5. **Zurück-Knöpfe nehmen `zurueckOderFeed()`** aus `src/lib/navigation.ts`, nie blankes
   `router.back()`. Auf Web kann jeder Screen direkt per Link geöffnet werden — dann gibt
   es kein Zurück, und der Knopf tut sichtbar nichts. Ab Phase 8 ist das der Normalfall.
   Seit Phase 3 gibt es dafür den Baustein `<SsBack />` — den nehmen, nicht selbst bauen.
   **Seit Phase 19f trägt er kein Wort mehr, nur den Pfeil** (Ians Entscheidung 52).
   Die `label`-Prop gibt es weiter, sie ist jetzt das `accessibilityLabel` — ein Knopf
   ohne Namen ist für VoiceOver ein Knopf ohne Funktion. **Und die Fläche ist der
   Preis dafür:** 44 × 44 pt sind Apples Mindestmaß, ein nackter Pfeil misst 22. Wer
   an dem Baustein etwas ändert, misst die Fläche nach — sie ist die einzige, die die
   ganze App auf einmal verliert.
6. **Was zusammengehört, in EINEM `aendern`.** `anfrageBestaetigen` ändert Anfrage, Post
   und Chat in einem Aufruf; `nachrichtSenden` (Phase 5) die Nachricht und das
   `lastMessageAt` am Faden. Zwei getrennte Aufrufe hätten dazwischen einen Zustand, in
   dem die Anfrage bestätigt, der Platz aber noch frei ist — und React zeichnet ihn.
7. **Profil-Inhalt kommt aus `components/Profil.tsx`**, nie direkt in einen der beiden
   Profil-Screens. Sonst zeigt das eigene Profil irgendwann etwas anderes als das, was
   Fremde sehen — und man merkt es nicht.
8. **Eine Folge-Beziehung steht ZWEIMAL im Datenmodell** (`followingIds` bei mir,
   `followerIds` beim anderen). Nur über `folgen` / `entfolgen` aus `social/hooks.ts`
   anfassen — die pflegen beide Seiten in einem `aendern`.
9. **Der Chat-Screen ist die eine begründete Ausnahme von „Eingabefeld → `scroll`".**
   `app/chat/[id].tsx` hat die Eingabe fest unten; die Begründung steht im Dateikopf.
   Wer die nächste Ausnahme macht, schreibt sie genauso hin.
10. **Ein BLOCK steht nur EINMAL im Datenmodell** (`blockedIds` beim Blockierenden) —
   genau umgekehrt zu Regel 8, und aus demselben Grund richtig: Wer blockiert wird, darf
   es nicht merken. Gefragt wird trotzdem in beide Richtungen, über `istBlockiert(a, b)`
   aus `safety/hooks.ts`. Nie selbst `blockedIds` durchsuchen — sonst prüft man eine
   Richtung und die andere nicht, und es fällt niemandem auf.
11. **Jede neue dynamische Route braucht `generateStaticParams`** (aus
   `features/statisch.ts`, nie aus `mock.ts` — das wäre Regel 2). Ohne sie heißt die
   gebaute Datei `[id].html` und jeder Direktaufruf ist 404. Im Dev-Server sieht man das
   nicht, erst auf der echten Adresse. Verschachtelte Kinder unter einem `[id]` brauchen
   eine eigene — der Parameter vererbt sich beim Bauen nicht.
12. **Fake-Daten enthalten nichts Persönliches** — keine Schule, keine Klasse, keinen
   Namen einer echten Person, die nicht gefragt wurde. Seit Phase 8 ist der Prototyp
   öffentlich abrufbar, und Links werden weitergeleitet. Begründung im Kopf von
   `data/mock.ts`.
13. **`landing/stil.css` ist eine KOPIE des Design-Systems, keine Verbindung.** Eine
   Farbe in `src/theme/colors.ts` zu ändern ändert die Landing-Page NICHT mit — beides
   zusammen anfassen, sonst sieht die Seite eines Tages anders aus als die App.
14. **Die Landing-Page bekommt kein Formular ohne Backend.** Eine Warteliste, die nichts
   speichert, ist schlimmer als keine.
15. **Im Wischstapel gehört der Tipp der KARTE, nicht ihrem Inhalt.** `PostCard`
   bekommt dort kein `onPress`; `WischKarte` entscheidet beim Loslassen, ob es ein
   Tipp oder ein Wisch war — und merkt sich dafür, ob sich in der ganzen Berührung
   etwas bewegt hat. Grund: Ein Browser schickt nach jedem Ziehen zusätzlich ein
   `click`, das React Native nicht kennt und nicht abbestellen kann. Mit `onPress` im
   Inhalt wischt man die Karte weg UND landet im Post-Detail.
16. **Der Stapel liest über `useStapel`, und das liest über `useFeed`.** Nicht daneben
   bauen — sonst zeigen die beiden Ansichten eines Tages Verschiedenes, und auffallen
   würde es nur dem, der umschaltet. Was der Stapel zusätzlich wegnimmt, entscheidet
   `posts/wisch.ts`.
17. **Was ein Block bewirkt, steht in `safety/block.ts` und nirgends sonst.** Screens
   lesen nie `BLOCK_WIRKUNG`, sie sehen nur das Ergebnis; Sätze über die Folgen eines
   Blocks kommen aus `blockFolgen()`. Sonst verspricht irgendwann ein Screen etwas, das
   die Regel nicht mehr tut.
18. **Die Vorschau im Erstellen-Screen ist kein Extra, sie ist die Absicherung.** Seit
   Phase 12 liegen acht der zehn Felder hinter „Mehr einstellen" und haben
   Voreinstellungen (`STANDARD` in `app/create.tsx`). Die Vorschau ist die einzige
   Stelle, an der man Zeit, Bezirk und Plätze sieht, ohne aufzuklappen. Wer sie
   entfernt, verkleinert oder nach unten schiebt, macht aus dem Screen ein Formular,
   das stillschweigend Termine erfindet. Und: **die Werte in `STANDARD` sind Ians
   Entscheidung** — nicht ohne Rückfrage ändern.
19. **Eine waagrechte Reihe neben einer Liste ist `SsScrollReihe`**, kein blanker
   `ScrollView`. Der Baustein bringt zwei Dinge mit, die man sonst zweimal falsch
   macht: `flexShrink: 0` (sonst fällt die Reihe neben einer FlatList auf Höhe 0
   zusammen) und die weiche Kante, **die nur steht, wenn wirklich etwas abgeschnitten
   ist**. Eine Kante, die immer da ist, verspricht Inhalt, den es nicht gibt.
20. **Der Ort eines Posts kommt aus `ortText()`** (`lib/bezirk.ts`), nie aus
   `{post.district} Wien`. Seit dem 2026-09-02 ist `Post.district` `string | null`, und
   **der Typecheck fängt den Fehler nicht**: React rendert `null` in JSX klaglos als
   Nichts, ein Template-Literal macht daraus brav den Text „null". Wer die Zeile selbst
   schreibt, bekommt also entweder „ Wien" oder „null Wien" — beides erst am Gerät
   sichtbar, an sieben verschiedenen Stellen. Der Bezirk einer **Person** bleibt Pflicht
   und wird weiter direkt geschrieben; nur der Post darf ohne auskommen.

21. **Was der Browser VOR dem JavaScript sieht, steht in `app/+html.tsx`.** Der
   Web-Export backt einen HTML-Schnappschuss, und der kann den Wischstapel nicht
   richtig zeigen: `useWindowDimensions`, die gemessene Kartenbreite und die
   SafeArea-Insets gibt es beim Bauen alle nicht. Deshalb wird der halbe Zustand nicht
   repariert, sondern von `#ss-start` verdeckt, bis `_layout.tsx` die Klasse
   `ss-bereit` setzt. **Die CSS-Animation `ss-notausgang` ist kein Schmuck:** Ohne sie
   wäre jeder Bundle-Fehler eine für immer leere Seite. Wer an der Fläche etwas ändert,
   prüft beides — dass sie kommt UND dass sie ohne JavaScript wieder geht.
   **Nachtrag 2026-09-03: Verdecken reicht NICHT, und das war ein echter Fehler.**
   Der halbe Zustand war nicht nur hässlich, er blieb: Die Karten standen mit -16°
   schief und der „Weg"-Stempel auf Deckkraft 1, bis jemand eine Karte anfasste. Ian
   hat es gesehen. Behoben ist es an der Wurzel (`NOTBREITE`, siehe Fallen-Liste), und
   `#ss-start` bleibt trotzdem — aber als das, was es ist: eine Abdeckung für den
   ersten Bildaufbau, kein Ersatz für richtige Werte. **Wer hier etwas baut, das beim
   Bauen keine Größe hat, sorgt dafür, dass der Ruhezustand auch OHNE Messung stimmt.**
22. **Der Prototyp-Hinweis ist ein VOLLBILD beim ersten Öffnen.** *(Seit dem
   2026-09-07, Ians Entscheidung 48 — davor eine Leiste unten, davor zwei Fassungen
   oben.)* **Vier** Fassungen sind durch, alle vier samt Begründung im Kopf von
   `components/PrototypHinweis.tsx` — **wer ihn verschiebt, liest die Liste zuerst**,
   sonst landet er bei einer, die schon durchgefallen ist. Das Vollbild ist keine
   Wiederholung von Fassung 1: Die verdeckte einen TEIL der App und ließ sich
   übersehen; ein Vollbild verdeckt alles und danach nichts — der dokumentierte Preis
   von Fassung 3 (dauerhaft verdeckte Tab-Leiste) fällt damit weg. **Das Merken sitzt
   in EINER Funktion** (`schonGesehen()` / `merken()`), weil es auf Native kein
   `sessionStorage` gibt: In Phase 20.3 wird dort nur der Speicher getauscht.
23. **Es gibt keine Emojis in der Oberfläche — Icons kommen aus `theme/icons.ts`.**
   Ein Icon allein ist `<SsIcon name="…">`, ein Icon neben Text ist `<SsIconText>`
   (nie beides von Hand nebeneinanderstellen: Der Baustein bringt den Versatz mit, der
   das Icon auf die Mitte der ERSTEN Zeile schiebt statt in die Mitte des Blocks).
   `IconName` ist eine Whitelist — ein Emoji oder ein Vertipper ist ein Typfehler, kein
   leeres Loch im Screen. **Das gilt aber nur für Props, die `IconName` auch tragen:**
   Eine lokale Komponente mit `icon: string` ist ein Loch im Netz, und genau so hat der
   Einstellungen-Screen bis 2026-09-03 die NAMEN als Text angezeigt. Wer eine Komponente
   baut, die ein Icon durchreicht, tippt die Prop `IconName` — nie `string`. **Ausgenommen ist, was ein Mensch selbst tippt**: Leas
   „Cool, freut mich! 🎾" in `data/mock.ts` bleibt. Ein Emoji, das die App VORSCHLÄGT,
   ist dagegen Oberfläche — deshalb ist das 🙌 aus `grussVorschlag()` weg.
24. **`SsIcon` zeichnet auf BEIDEN Plattformen — seit Phase 19 auch nativ.**
   *(Ersetzt seit dem 2026-09-06 die alte Fassung „zeichnet auf Web und nirgends
   sonst".)* Auf Web `<svg>` über `react-dom`, auf iOS `<Svg>`/`<Path>` aus
   `react-native-svg`. **Beide Zweige lesen dieselben Pfade aus `theme/icons.ts`** —
   der Tausch war EINE Datei und kein Screen, genau wie seit Phase 14 angekündigt.
   Der Web-Zweig bleibt bewusst bei `react-dom`: Es gibt dort nichts zu gewinnen und
   eine seit vier Wochen laufende Seite zu verlieren. **Der Preis des Imports ist
   gemessen:** +49.524 B im Web-Bündel (+3,5 %). Vermeidbar wäre er über
   Plattform-Endungen (`SsIcon.native.tsx`), aber das zerlegt EINEN Zeichner in drei
   Dateien — der Grund, warum es die Trennung Daten/Zeichner gibt, wäre dahin.
25. **`landing/icons.js` ist eine KOPIE von `theme/icons.ts`, keine Verbindung** —
   dieselbe Lage wie bei `stil.css` (Regel 13) und derselbe Grund: Die Landing-Page hat
   bewusst kein npm. Wer einen Pfad in der App ändert, ändert die Seite NICHT mit.
   In der Kopie stehen nur die sieben Icons, die die Seite braucht.

26. **Ein neuer Feed-Filter geht über `FeedFilter` und `features/posts/filter.ts`** —
   nie als eigener `useState` im Screen. **Und seit Entscheidung 63 (2026-09-08) muss
   ein neuer Filter zusätzlich begründen, warum er überhaupt dasteht:** Der
   Bezirks-Filter ist gestrichen, weil die Reihenfolge seine Aufgabe ohne einen
   Handgriff erledigt (`sort.ts`). Das ist harte Regel 63 in ihrer zweiten Richtung —
   sie bremst, was noch nicht gebaut ist. `filter.bezirk` selbst BLEIBT, weil die
   Karte ihn setzt (Regel 50); was im Filterblatt steht, ist seither keine Auswahl
   mehr, sondern eine Rücknahme, und die nur, wenn es etwas zurückzunehmen gibt. Zwei Gründe, und beide fallen erst später auf:
   Was in `FeedFilter` steht, gilt automatisch in BEIDEN Ansichten (Stapel und Liste,
   Regel 16); und die Bedeutung einer Pille („was heißt *diese Woche*?") lebt sonst
   mitten in 600 Zeilen Oberfläche und ist beim nächsten Umbau weg. Zum Zurücksetzen
   `FILTER_LEER` nehmen, nie die Werte von Hand aufzählen.
27. **Ein Mensch hat einen `jahrgang: number`, ein Post ein Union `PostAlter`.**
   *(Ersetzt seit Phase 18b die alte Regel über `AgeGroup` und `AgeBand` — die Typen
   gibt es nicht mehr.)* Der Grund der alten Regel gilt weiter: Eine Aktivität kann
   „für alle" sein, ein Mensch nicht. Im neuen Modell ist er nur nicht mehr
   formulierbar, und das ist der Fortschritt — eine Zahl KANN nicht „egal" sein.
   Gefragt wird nie `post.alter === 'egal'`, sondern `post.alter.kind === 'egal'`.
   Der FILTER benutzt denselben Typ wie der Post, und das ist kein Verstoß gegen
   Regel 39: Zwei Typen braucht es, wenn zwei Dinge verschiedene Daten tragen — hier
   tragen beide dieselbe Spanne, und was sich unterscheidet, ist die Regel
   (`passtZumAlter`). **Die Wörter stehen in `config/alter.ts`**, nie im Screen: `Jg.
   2009–2012` an der Karte, `Jahrgang 2009–2012` im Detail, `Jahrgang 2009` am Profil.
   Am Profil ist es Ians Entscheidung 30 und hängt an einem Wort (`JAHRGANG_ANZEIGE`).

28. **Ein Chat hat seit Phase 16 vielleicht KEINEN Post.** Gefragt wird danach nie mit
   `!thread.postId`, sondern mit `istDirektChat()` aus `features/chat/direkt.ts` — im
   Backend ist ein fehlendes Feld später `null` statt `undefined`, und dann ist es EINE
   Zeile dort statt sechs verstreute. In Screens fragt man gar nicht am Faden, sondern
   an `ChatEintrag.post`: Der ist optional, und **dort** fängt der Typecheck die Stellen,
   die einen Post voraussetzen. Am Modell fängt er nichts — `find(p => p.id ===
   thread.postId)` ist mit `undefined` gültiger Code.
29. **Einem Direktchat NIE einen Ersatz-Post oder eine Ersatz-Kategorie geben.** Der
   naheliegende Weg wäre ein Platzhalter-Post gewesen; er hätte den Chat-Screen
   unverändert gelassen und dafür durch jede Karte, jede Farbe und jede Ablaufregel der
   App still falsche Antworten getragen. Ein fehlendes Feld beantwortet nichts falsch.
   Dasselbe gilt für den grauen Ersatz-Streifen an der Chat-Karte: Ein Direktchat HAT
   keine Kategorie, und dass seine Karte 6 px schmaler einrückt, ist die Auskunft und
   kein Fehler. Die Farbe im Direktchat ist `accent` — die Grundfarbe der App, wie jede
   Kategoriepalette aufgebaut, deshalb braucht keine Stelle darunter einen Sonderfall.
30. **Die Chat-Liste gruppiert nach ZUSTAND, nicht nach SORTE.** „Aktuell" und „Vorbei"
   sind Ians Regel aus `chat/lifecycle.ts`; ob ein Chat aus einer Aktivität oder aus
   einer Direktnachricht entstanden ist, erkennt man an der ZEILE (Farbstreifen +
   zweite Textzeile), nicht an einer Überschrift. Eine Gruppe je Sorte würde Ians
   Sortierregel zerschneiden — eine Nachricht von vor zwei Minuten stünde unter einem
   Chat von gestern, nur weil sie aus einer anderen Quelle kommt. Warum ein Chat
   entstanden ist, interessiert beim Suchen niemanden.

31. **`Post.visibility` ist ein OBJEKT, kein String.** Seit Phase 17 heißt es
   `post.visibility.kind === 'followers'`, nie `post.visibility === 'followers'`. Das
   ist kein Umstand, sondern der Grund, warum die dritte Stufe überhaupt sicher gebaut
   werden konnte: `{ kind: 'group'; groupId: string }` macht den Zustand
   „Gruppen-Post ohne Gruppe" **undarstellbar**, und weil der alte Vergleich damit
   ungültig wird, findet `tsc` jede Stelle. Die Alternative wäre
   `visibility: 'group'` plus `groupId: string | null` gewesen — also genau die Falle
   von `Post.district` und `ChatThread.postId` zum dritten Mal. Wer den Marken-Text
   dazu braucht, nimmt `<SichtMarke>` bzw. `useSichtText()`, nie eigenes JSX.
32. **Was eine Gruppe ist und was ein Austritt anrichtet, steht in
   `features/groups/gruppe.ts` und nirgends sonst.** Screens lesen `AUSTRITT_WIRKUNG`
   und `GRUENDER_AUSTRITT` nie, sie sehen nur das Ergebnis; die Sätze in der
   Verlassen-Rückfrage kommen aus `austrittFolgen()`. Dieselbe Bauart wie
   `safety/block.ts` (Regel 17) und aus demselben Grund: Sonst verspricht irgendwann
   ein Screen etwas, das die Regel nicht mehr tut — **und genau das ist in Phase 17
   passiert**, siehe die Falle unten.
33. **Mitgliedschaft steht NUR EINMAL im Modell** — als `memberIds` an der Gruppe. Am
   Nutzer gibt es kein `groupIds` (anders als bei den Folge-Beziehungen, Regel 8).
   Gefragt wird über `istMitglied()`, nie über `memberIds.includes()` im Screen: Der
   Gründer steht mit drin, und das muss man wissen. **Die REIHENFOLGE trägt eine
   Regel**: `memberIds` wächst hinten, also ist der zweite Eintrag der, der die Gruppe
   erbt, wenn der Gründer geht (`nachfolgerId()`, Ians Entscheidung). Wer die Liste
   sortiert, ändert still, wem eine Gruppe gehört.
34. **Gruppen bekommen KEINEN eigenen Feed und KEINEN eigenen Tab.** Ians Entscheidung
   16: Eine Gruppe ist eine Sichtbarkeits-Stufe, kein Ort. Die Liste auf
   `/gruppe/[id]` ist kein Widerspruch dazu — sie zeigt dieselben Posts, die im
   Hauptfeed ohnehin stehen, so wie ein Profil auch. Ein eigener TAB hätte den
   Hauptfeed geleert, und ein leerer Hauptfeed ist am Anfang das größere Problem. Der
   Weg zu `/gruppen` liegt deshalb **nicht** in der Tab-Leiste — **seit Ians
   Entscheidung 56 (2026-09-08) aber in der Kopfzeile des Chats-Registers statt am
   Profil**: *„das hat eigentlich nix mit dem Profil zu tun, sondern eher mit dem
   Chatten."* Der GRUND der Regel überlebt das unverändert — ein Knopf in einer
   Kopfzeile schafft weder Tab noch Feed; nur der Wortlaut musste nachgezogen werden.
   Genau der Fall, für den harte Regel 58 gebaut ist.

35. **`npm run deploy` ist KEINE Sicherung — es schiebt nur `gh-pages`.** Der Zweig
   trägt das gebaute, minifizierte Bündel; `main` mit dem Quellcode fasst das Skript
   nie an. Am 2026-09-03 kam so heraus, dass neun Phasen (54 Dateien, ~7.100 Zeilen)
   ausschließlich lokal lagen, während die Seite tagelang aktuell aussah. **Nach jeder
   Phase committen und pushen.** Die Doku (`PLAN.md`, `CLAUDE.md`, `_FUER_IAN/`) liegt
   außerhalb der Repo-Wurzel und kommt über `doku/` mit — kopiert von
   `scripts/doku.sh`, aufgerufen von `.git/hooks/pre-commit`, damit die Kopie nicht
   still veraltet wie `landing/stil.css` (Regel 13). **Der Hook wird nicht
   mitversioniert**: nach einem frischen Clone neu anlegen, Anleitung in
   `doku/LIESMICH.md`. **Und die Falle im Hook selbst (2026-09-06, zweimal
   hineingetappt):** Wurde NUR die Doku außerhalb des Repos geändert, bricht `git
   commit` mit „nothing to commit" ab — Git prüft die Staging-Area, BEVOR der
   pre-commit-Hook läuft, und der Hook füllt sie erst. Dann `npm run doku && git add -A
   && git commit`.

36. **Was über dem Wischstapel liegen soll, geht durch `WischStapel.blatt` — nie über
   den Stapelbereich im Screen.** Der Screen weiß nicht, wo die Karten aufhören und
   die Knöpfe anfangen; er müsste eine Höhe raten. Der Slot hängt IN der Kartenfläche,
   dort heißt `maxHeight: '100%'` wörtlich „bis zu den Knöpfen" — und bleibt richtig,
   wenn eine Filterreihe dazukommt. **Am 2026-09-03 war genau das der Fehler**: Das
   Filterfeld klappte im Fluss auf, nahm dem Stapel 250 px, und weil die Karten
   absolut liegen (also nicht mitschrumpfen), quollen sie über die Kategorien und über
   „Bin dabei". Auf dem iPhone SE verdeckte die Karte den Alters-Filter. Wer hier
   etwas hineinhängt, prüft es auf **360 × 600**, nicht nur auf 390 × 844 — und fragt
   `document.elementFromPoint`, ob die Knöpfe wirklich noch getroffen werden.

37. **„Aufgeklappt" ist nicht „sichtbar", und ein roter Hinweis muss auf etwas zeigen,
   das im Bild ist.** Der Erstellen-Screen ist mit offenem „Mehr einstellen" rund
   2000 px hoch; ein Handy zeigt 667. Wer eine Fehlermeldung baut, die auf eine andere
   Stelle verweist, sorgt dafür, dass man dort auch hinkommt — im Erstellen-Screen
   springt der Screen hin UND der Satz benennt das Feld (`FEHLER_ANTWORT`, Ians
   Entscheidung 15). Die y-Positionen kommen aus `onLayout`-Ankern, nicht aus
   gerechneten Höhen; die drei Felder in `mehrBereich` bekommen dessen y **beim Lesen**
   dazu, nicht beim Merken. Und der Sprung wartet **zwei** `requestAnimationFrame`:
   Auf Web meldet `onLayout` über einen ResizeObserver, also erst nach dem Zeichnen.
38. **Gründen und Einladen sind zwei verschiedene Rechte.** Seit Phase 18a fragt man
   „darf der jemanden holen?" mit `darfEinladen()` aus `features/groups/gruppe.ts`, nie
   mit `istGruender()`. **Die Verwechslung fällt nie auf**, weil in einer frisch
   gegründeten Gruppe beide dasselbe antworten — sie fällt erst dem auf, der in einer
   fremden Gruppe Mitglied ist und den Knopf nicht findet. Dasselbe gilt für die
   Gegenrichtung: `Group.offen` fragt man über `darfBeitreten()` bzw.
   `beitrittHuerdeText()`, nicht mit `!gruppe.offen` im Screen.
39. **Eine Einladung ist KEINE Anfrage mit umgedrehtem Vorzeichen.** `GroupInvite` ist
   ein eigener Typ neben `GroupRequest` (vierte Runde derselben Frage nach
   `ChatThread.postId`, `GroupRequest` und `Visibility`). Wer die beiden in einer Liste
   nebeneinanderlegt, unterscheidet sie an `einladung`, **nie an `gruppe`** — beide
   tragen eine. Bis Phase 17 war `'gruppe' in item` eindeutig, seit Phase 18a nicht mehr,
   und der Typecheck hätte dazu geschwiegen: Eine Einladung wäre als Beitritts-Anfrage
   gezeichnet worden, mit „Aufnehmen"-Knopf.
40. **Eine Zahl an einem Tab liest denselben Haken wie der Screen darunter.** Seit
   Phase 18a addiert `(tabs)/_layout.tsx` `useMeineEinladungen()` — denselben Haken, den
   `requests.tsx` benutzt, und keinen leichteren Filter daneben. Grund: Der Haken blendet
   Einladungen aus, in deren Gruppe man inzwischen ohnehin ist. Ein eigener Zähler zählte
   sie mit, und dann klebt eine Zahl am Tab, die man nicht wegbekommt, weil die Zeile
   dazu gar nicht dasteht.
41. **`StapelDurch` ist eine ÜBERSCHRIFT über einer Liste, kein Leer-Zustand.** Sein
   Text verspricht sie („Alles, was du gesehen hast, steht unten weiter in der Liste").
   Deshalb erscheint er nur, wenn `listeHatWas` — sonst stünde er über nichts, und
   `LeererFeed` sagt darunter dasselbe noch einmal, nur mit dem Ausweg, den die
   Überschrift nicht hat. **Der Unterschied trägt eine Bedeutung:** „Stapel leer"
   heisst durchgewischt (die Liste ist voll, sie nimmt nichts weg), „Liste leer" heisst
   es gibt wirklich nichts — ein zu enger Filter oder der stille Dienstag aus
   Abschnitt 8. Zwei verschiedene Sachverhalte, zwei verschiedene Antworten.

42. **Die Chat-Liste besteht aus ZEILEN, jede andere Liste der App aus Karten.** Seit
   Phase 18c: keine `SsCard`, volle Breite, 1 px Trennlinie hinter dem Avatar, 70 px
   Höhe, zwei Textzeilen. Der Grund ist eine Aussage und kein Geschmack — eine Karte ist
   ein ANGEBOT (Feed, Anfragen: man kann sie annehmen), eine Zeile ist ein WEG. Wer sie
   zurück auf Karten stellt, macht 7 Chats wieder zu 4. **Der Streifen-PLATZ steht dabei
   immer, die Farbe nicht** — das ist kein Verstoß gegen Regel 29, sondern ihre
   Anwendung: Verboten ist ein grauer ERSATZ-Streifen, nicht ein reservierter Platz. In
   einer Karte war „6 px weiter links" die Auskunft; in einer Zeilenliste sind
   ausgefranste Avatar-Spalten genau das „unruhig", gegen das die Phase gebaut ist.
43. **Sollen zwei Texte nebeneinander ungleich nachgeben, bekommt der nachgebende
   `flex: 1` — nicht der andere ein höheres `flexShrink`.** Solange beide `flexBasis:
   auto` haben, teilen sie sich einen Fehlbetrag, und jede Gewichtung dagegen ist ein
   Wert, der beim nächsten längeren Text wieder falsch ist. Mit `flexBasis: 0` an einem
   der beiden entsteht gar kein Fehlbetrag: Der andere behält seine natürliche Breite,
   dieser bekommt exakt den Rest. Am 2026-09-05 in der Chat-Zeile zweimal falsch geraten
   (1 : 4, dann 1 : 24), bevor es nachgemessen war.

44. **Ein Schiebe-Regler gehört NIE in `SsScrollReihe`** — und überhaupt nie in einen
   waagrechten ScrollView. Zwei Gesten-Erkenner übereinander, die beide waagrecht
   ziehen wollen, streiten sich um jede Berührung, und wer gewinnt, hängt an der
   Reihenfolge im Baum. `FilterGruppe` in `(tabs)/index.tsx` hat dafür seit Phase 18b
   die Prop `reihe={false}`. Dazu gelten für jeden Regler die zwei alten Fallen:
   `onPanResponderTerminationRequest: () => false` (Phase 11 — sonst nimmt ein
   senkrechter ScrollView die Geste beim ersten Zucken) und ein Rückfall gegen die
   gemessene Breite **null** (`NOTBREITE`, 2026-09-03 — beim Web-Export gibt es kein
   Fenster, und beide Griffe kleben links).
45. **Sind zwei Dinge in einem Moment ununterscheidbar, wird die Entscheidung VERTAGT,
   nicht geraten.** In `SsJahrgangBalken` stehen manchmal beide Griffe auf demselben
   Wert. Wer dann beim Anfassen über die Tipp-Stelle entscheidet, bekommt ein Paar, das
   festklebt: Ein Druck acht Pixel links der Mitte wählt „von", und „von" kommt von dort
   nur nach links. Die fehlende Auskunft ist die RICHTUNG, und die entsteht erst bei der
   ersten Bewegung — also `aktiv = null`, `schieben` entscheidet beim ersten Move, und
   `loslassen` holt es nach, falls es nie eine Bewegung gab. **Gefunden nur durch echtes
   Ziehen:** Ein `click` löst weder `onPanResponderMove` noch das Kreuzungsverbot aus.

46. **Was eine Terminüberschneidung bedeutet, steht in `features/requests/kollision.ts`
   und nirgends sonst.** Dieselbe Bauart wie `safety/block.ts` (Regel 17) und
   `groups/gruppe.ts` (Regel 32): Screens lesen `DOPPEL_REGEL`, `KOLLISION_FENSTER_MIN`
   und `PRUEFT_BEIM_POSTEN` nie, sie sehen nur das Ergebnis; der Satz kommt aus
   `doppelHinweisText()`. **`KOLLISION_FENSTER_MIN` ist eine SCHÄTZUNG, keine Messung** —
   ein `Post` hat keine Dauer. Genau deshalb warnt die Regel und sperrt nicht: Ein
   ausgegrauter Knopf würde eine Gewissheit behaupten, die die Daten nicht hergeben.
   Wer den Hinweis irgendwo neu zeichnet, nimmt `<DoppelHinweis>` — nicht eigenes JSX.
47. **Was die App über die Pläne einer Person weiß, sagt sie NUR dieser Person.** Beim
   Doppel-Hinweis lag die naheliegende dritte Möglichkeit darin, dem Poster beim
   Bestätigen zu zeigen, dass der Anfragende zur selben Zeit woanders ist. Das hätte
   Termine aus privaten Gruppen und aus Posts nur für Follower an jemanden gegeben, den
   sie nichts angehen — dieselbe Sorte Leck wie der Gründername an einer privaten Gruppe
   (18a), nur eingebaut statt vergessen. **Bei jeder neuen Auskunft fragen: Wem gehört
   die Information, aus der sie gerechnet ist?**

48. **Die Wien-Karte besteht aus SIEBEN Dateien, und keine davon ist ein Screen.**
   *(Seit Phase 19d — bis dahin vier.)*
   `data/wien-bezirke.ts` (**erzeugt** — nicht von Hand ändern, `python3
   scripts/bezirke-bauen.py` baut sie neu) · `features/posts/karte.ts` (was eine Farbe
   bedeutet, wie weit man zoomen darf) · `lib/karte-treffer.ts` (welcher Bezirk unter
   einem Punkt liegt) · `components/ui/SsWienKarte.tsx` (Zeichnen und Geste). Dieselbe
   Bauart wie `theme/icons.ts` + `SsIcon`, und aus demselben Grund: Ein neuer
   Grenzverlauf ist ein Skriptlauf, eine neue Farbe eine Regel-Datei — nie ein Screen.
   **Die Namensnennung (`KARTE_QUELLE`, CC BY 4.0, Stadt Wien) ist Lizenzbedingung** und
   wird IN der Karte gezeichnet, damit sie mitreist.
   **Seit Phase 19d kommen drei dazu:** `lib/karte-geo.ts` (wo eine Fläche auf der ERDE
   liegt) · `components/ui/karte-typen.ts` (die gemeinsame Schnittstelle) ·
   `components/ui/SsAppleKarte.native.tsx` (der zweite Zeichner). Screens nehmen **nur
   `SsKarte`** — die Weiche `SsKarte.tsx` / `SsKarte.native.tsx` entscheidet, wer
   zeichnet.
49. **Ein Kneifen ist NIE ein Tipp — auch wenn sich nichts bewegt hat.**
   `gestureState.dx/dy` misst bei mehreren Fingern den MITTELPUNKT, und der steht beim
   symmetrischen Auseinanderziehen still. Die Bewegungsgrenze aus harter Regel 15 fängt
   das nicht: Sie fragt „hat sich der Finger bewegt?", richtig ist „war das überhaupt
   eine Ein-Finger-Geste?" (`mehrfingrig` in `SsWienKarte`). **Wer einen Erkenner mit
   mehreren Fingern baut, prüft ihn mit echten Touch-Ereignissen** — mit der Maus ist
   der Fehler unsichtbar.
50. **Was auf einer Karte gewählt ist, IST der Bezirksfilter** — es gibt keinen zweiten
   Zustand daneben. Deshalb überlebt eine Auswahl das Umschalten auf Liste oder Stapel,
   und deshalb gilt harte Regel 26 auch hier. Gezählt wird über `useBezirksZaehlung`,
   und `useBezirkeImFeed` leitet seine Liste daraus ab — die Regel „beim Zählen wird
   genau der Bezirksfilter ausgeschaltet und sonst keiner" steht damit an EINER Stelle.
   Ohne sie zeigte die Karte nach dem ersten Tipp eine einzige eingefärbte Fläche in
   einem grauen Wien.
51. **Was über der Karte schweben soll, geht durch `SsWienKarte.blase` — nie als Kind
   der Kartenfläche.** *(Entscheidung 46 nahm die Blase in 19e-1 aus der Anzeige,
   **Entscheidung 57 hat sie am 2026-09-08 zurückgeholt.** Der Satz, der hier seit dem
   2026-09-07 stand — „Ein Aufruf holt sie zurück. Wer sie löscht, wirft sie weg" —
   hat sich nach elf Tagen bezahlt gemacht: Es war wirklich ein Aufruf. **Wer eine
   geprüfte Arbeit ausbaut, löscht sie nicht.**)*
   **Der Anker rechnet gegen den FREIEN STREIFEN, nicht gegen den Bildrand** (19g):
   Im Vollbild steht oben die schwebende Leiste und unten das Blatt; `platzOben` und
   `platzUnten` sind der Platz dazwischen. Und ein Bezirk **ohne Posts bekommt keine
   Blase** — sonst steht ein weißer Balken mit Pfeil über der Stadt, und die Antwort
   „hier ist nichts los" stünde zweimal da. Dasselbe Muster wie `WischStapel.blatt` (harte Regel 36) und aus
   zwei Gründen, die beide erst am Gerät auffallen: Die Fläche hat `overflow: hidden`
   (die Blase wäre halb abgeschnitten) und einen `PanResponder` mit
   `onStartShouldSetPanResponder: () => true` (sie wäre nicht antippbar). Der Slot bekommt
   einen **`KartenAnker`** — die Umkehrung genau der Rechnung, mit der ein Tipp in
   Kartenkoordinaten übersetzt wird, **aus demselben Zustand**; zwei getrennte Rechnungen
   driften beim ersten Zoom auseinander. Und: **`pointerEvents` steht im `style`, nie in
   den Props** (ACTA-Falle) — der Blasenkörper braucht dabei ein ausdrückliches `'auto'`,
   weil `react-native-web` ein geerbtes `box-none` an alle Nachkommen weitergibt außer an
   Text-Knoten. Wie viele Zeilen hineinpassen, rechnet `passform()` aus dem Platz;
   `BLASE_MAX` in `karte.ts` ist die Obergrenze, keine Zusage.

52. **Es gibt mehr als einen Kartenzeichner und GENAU EINE Bedeutung.** Was „viel los"
   heißt, wie weit man zoomen darf, welche Sorte Karte darunter liegt — alles in
   `features/posts/karte.ts`; wo eine Fläche auf der Erde liegt, in `lib/karte-geo.ts`;
   was ein Zeichner können muss, in `components/ui/karte-typen.ts`. Ein Zeichner
   verantwortet **nur** den Hintergrund, das Zeichnen und wie aus einer Geste ein „hier
   wurde getippt" wird. Rutscht die Bedeutung in einen Zeichner, hat die App zwei
   Wahrheiten — und auffallen würde es nur dem, der beide nebeneinanderhält.
   **Die Plattform-Endung ist dabei Pflicht und kein Stil:** Ein `Platform.OS`-Zweig in
   EINER Datei importierte `react-native-maps` auch ins Web-Bündel, wo es MapKit nicht
   gibt. Das ist genau umgekehrt zu `SsIcon` (Regel 24), und der Unterschied ist der
   Grund: Dort zeichnen beide Zweige dasselbe, hier sind es zwei Bibliotheken.
54. **Eine Server-Regel steht im Schema `regel` und NIE in einer Policy.**
   `regel.sind_blockiert()`, `regel.ist_mitglied()`, `regel.folgen_sich_gegenseitig()`,
   `regel.ist_teilnehmer()`, `regel.mitglieder_anzahl()` — dieselbe Bauart wie
   `safety/block.ts` (Regel 17) und `groups/gruppe.ts` (Regel 32), eine Ebene tiefer.
   Der Grund ist diesmal aber nicht nur Ordnung: Eine Policy, die ihre EIGENE Tabelle
   abfragt, ergibt `infinite recursion detected in policy for relation …` — und zwar
   erst beim ersten Lesen, nicht beim Anlegen. `security definer` beendet die Kette
   nach einem Schritt. Jede dieser Funktionen ist damit ein kontrolliertes Loch in der
   Absicherung: Es sind so wenige wie möglich, sie stehen alle beieinander, jede
   beantwortet EINE Ja/Nein-Frage, und `set search_path = ''` ist Pflicht — ohne ihn
   kann jemand mit eigenem Schema eine Tabelle davorschieben.
55. **Auf `group_members` gibt es KEIN Insert-Recht, und das ist die Aussage.**
   Beitreten ist das ERGEBNIS einer bestätigten Anfrage oder angenommenen Einladung,
   kein Schreibvorgang. Stünde dort ein `insert`, könnte sich jeder mit einer Zeile in
   jede Gruppe schreiben und Phase 17 („der Gründer bestätigt") wäre eine
   Höflichkeitsform. Dasselbe fürs Austreten: Ein blankes `delete` überspränge
   `nachfolgerId()` (Ians Entscheidung 13) und damit die Erbfolge. Mitgliedschaften
   ändern sich nur über die Funktionen aus 20.5.
56. **Die HERKUNFT eines Chats ist eine Tatsache, kein abgeleiteter Wert.** In der App
   heißt `istDirektChat(t)` genau `t.postId === undefined` — richtig, solange sich ein
   Post nicht löschen lässt. In der Datenbank lässt er sich löschen, und mit
   `on delete set null` wird aus einem Aktivitäts-Chat lautlos ein Direktchat: Dann
   gilt `SCHREIB_REGEL = 'gegenseitig'`, und zwei Leute, die sich getroffen haben und
   einander nicht folgen, können einander nicht mehr schreiben. Gefragt wird deshalb an
   `chat_threads.aus_aktivitaet`, nie an `post_id`. **Allgemeiner: Wenn ein Wert
   heute aus einem anderen ableitbar ist, heißt das nicht, dass er es morgen noch ist —
   und die Ableitung ändert sich still.**
58. **Eine neue Entscheidung überschreibt NIE still eine alte Regel-Datei.** Ians
   Entscheidung 39 (Kontolöschen: „alles mit") sagte wörtlich „Gruppen weg" — und
   `GRUENDER_AUSTRITT = 'weitergeben'` (Entscheidung 13) sagt, dass eine Gruppe beim
   Weggehen vererbt wird. Beide sind seine, beide gelten, und ein Kontolöschen IST ein
   Weggehen. Der Ausweg war nicht, eine der beiden auszulegen, sondern **nachzufragen**
   — und die Antwort war präziser als beide Fassungen für sich (*A gilt für alles, was
   NUR mir gehört*). **Der Widerspruch war überhaupt nur sichtbar, weil die ältere
   Regel als benannte Konstante an EINER Stelle steht.** Wer eine neue Regel einbaut,
   sucht deshalb zuerst die Regel-Dateien nach dem Fall ab, den sie berührt — und was
   dort „nicht ohne Rückfrage ändern" trägt, ändert man nicht ohne Rückfrage, auch
   nicht als Nebenwirkung.

57. **Was am Server gilt, wird ANGEGRIFFEN, nicht angeschaut.**
   `bash supabase/pruefen/aufbauen.sh`, 25 Prüfungen, erwartet sind 25 Häkchen. Jeder
   Block setzt `set local role authenticated` — **wer als `postgres` prüft, prüft
   nichts**, denn der Eigentümer einer Tabelle umgeht seine eigenen Policies. Und ein
   Test, der nur „ist fehlgeschlagen" abfragt, prüft zu wenig: Er muss `SQLSTATE =
   '42501'` verlangen, sonst zählt ein Insert, der an einem CHECK scheitert, als „von
   RLS abgewiesen".

59. **Am Blatt zieht NUR der Griff.** *(Phase 19e.)* `SsBlatt` liegt über einem
   Kartenzeichner, und der beansprucht mit `onStartShouldSetPanResponder: () => true`
   jede Berührung. Zwei Erkenner übereinander, die beide ziehen wollen, streiten sich
   um jeden Finger, und wer gewinnt, hängt an der Reihenfolge im Baum — dieselbe
   Familie wie harte Regel 44 und die Phase-11-Falle. **Der Ausweg ist keine
   Aushandlung, sondern eine Fläche:** Der Körper des Blattes hat gar keinen Erkenner.
   Wer ihm später einen gibt, macht aus einer klaren Trennung eine Aushandlung — und
   die verhält sich auf Web und auf iOS verschieden, weil dort MapKit seit 19d-1 eigene
   Gesten mitbringt. **Auf iOS ist das ungeprüft**, es gehört in den Gerätedurchgang.
60. **Was oben und unten schon STEHT, wird gemessen — nur der Rest ist ein Anteil.**
   *(Phase 19e, die Berichtigung der 19b-Lehre.)* Die Raststufen des Blattes hängen am
   Schirm (`BLATT_STUFEN`), aber `zu` ist der **gemessene Blattkopf** und `ganz` ist
   durch die **gemessene schwebende Leiste** gedeckelt (`maxOben`); dieselbe Zahl geht
   als `randOben` an die Karte, damit Wien zwischen Leiste und Blatt zentriert wird.
   Ohne den Deckel fuhr das Blatt unter die Pille. Eine feste Leiste ist auf 552 px ein
   anderer Anteil als auf 844, ihre Höhe dagegen überall dieselbe — **die Lehre aus 19b
   gilt für Flächen, die den Rest bekommen, nicht für Dinge, die schon da sind.**
   Dazu: `randUnten` (wo das Blatt anfängt) und `freiUnten`/`verdeckt` (die Geometrie
   nach `KARTE_MIN_BAND`) sind ZWEI Größen. Lizenzzeile und „Ganz Wien"-Knopf weichen
   dem BLATT aus, die Kartengeometrie folgt dem Deckel. Die Verwechslung ist nicht zu
   sehen, nur zu lesen.

61. **Glas bringt seine eigene Kante mit — Kante und Schatten sind der ERSATZ, wo
   keines ist.** *(Phase 19e-2, berichtigt am 2026-09-07 nach Ians Rückmeldung.)*
   `SsGlas` verantwortet den Untergrund **samt Kante**: auf iOS 26 echtes Liquid
   Glass, sonst `glasErsatz` — und bei `schwebt` zusätzlich die 1-px-Linie und den
   Schatten aus `glasSchwebt`. Der Aufrufer bringt **nur Geometrie** mit (Radius,
   Polsterung, `flex`, Position). Die erste Fassung machte es andersherum: Kante und
   Schatten kamen vom Aufrufer und lagen auch AUF dem Glas — daraus wird wieder eine
   Karte mit unscharfem Hintergrund, und genau das meinte Ian mit *„sieht noch nicht
   so gut aus"*. `schwebt` setzt, wer frei über etwas anderem liegt (Tab-Kapsel,
   Umschalter-Pille); wer in einer Fläche sitzt, die ihre Kante schon hat, nicht.
   **Zwei Prüfungen sind Pflicht** (`isGlassEffectAPIAvailable()` UND
   `isLiquidGlassAvailable()`): Es gibt iOS-26-Beta-Fassungen, in denen die API fehlt
   und der Aufruf abstürzt. Und: `opacity: 0` am Glas oder an einem Elternteil
   schaltet den Effekt ab — zum Einblenden `glassEffectStyle` mit `animate` nehmen.
   **Plattform-Endung, kein `Platform.OS`-Zweig** — aber aus einem anderen Grund als
   bei `SsKarte`: `expo-glass-effect` steckt über `expo-router` ohnehin schon im
   Web-Bündel; was nicht ins Web darf, ist der `requireNativeViewManager`-Aufruf beim
   Laden des Moduls.
62. **Glas braucht RAND, nicht nur Hintergrund — die Tab-Leiste ist eine
   freistehende Kapsel.** *(Phase 19e-2.)* **Ians Vorbild liegt als Bild im Projekt:
   `vorbild-liquid-glass-bierbuddy.png`** — derselbe Screenshot, aus dem
   Entscheidung 41 kommt. Die erste Fassung war eine Leiste über die ganze Breite mit
   Trennlinie oben, also die gewohnte iOS-Leiste mit Glas dahinter; sein Urteil war
   *„noch nicht wie ich es dir gezeigt habe"*. Eine Fläche, die an drei Kanten am
   Schirm klebt, sieht aus wie eine getönte Leiste — **erst wenn Inhalt daneben UND
   darunter durchläuft, sieht man, dass sie bricht.** Die Maße stehen in
   `src/lib/tabs.ts` (`TAB_KAPSEL_HOEHE`, `TAB_KAPSEL_SEITE`, `tabKapselUnten()`) und
   nirgends sonst: Drei Stellen brauchen sie — die Leiste, jeder Screen darüber
   (`SsScreen`) und das Blatt auf der Karte (`SsBlatt.unten`).
   **Dasselbe gilt für das Blatt: es ist EIN Material.** Erst war nur sein Kopf aus
   Glas, und die Naht zur deckenden Liste lief quer durchs Bild. Wer eine Fläche
   teilweise verglast, bekommt zwei Materialien, die einander widersprechen.
   **Was fest steht, weicht der Kapsel aus** (`useTabRand()`, siehe `SsScreen`):
   *Was scrollt, scrollt unter das Glas; was fest steht, weicht ihm aus.* Beim
   `scroll`-Zweig wandert die Höhe in den Scroll-INHALT, beim festen Zweig begrenzt
   sie die FLÄCHE — und zwar als `marginBottom`, weil dort absolut positionierte
   Kinder liegen (Antwort-Leiste, Wischkarten) und **Yoga die Polsterung des
   Elternteils anrechnet, der Browser aber nicht**. Die Karte weicht NICHT aus: Dass
   Wien unter der Kapsel durchläuft, ist der Sinn.
   ⚠️ **Und das BLATT weicht seit Phase 19g auch nicht mehr aus.** Bis dahin hörte es
   über der Kapsel auf — die wörtliche Anwendung dieser Regel, und am Gerät sah sie
   falsch aus: Das Blatt endete mitten im Bild, darunter lief wieder Karte, die
   Kapsel schwebte dazwischen. Drei Materialien auf 60 Punkten, Ians *„unten ist es
   so abgeschnitten"*. Jetzt reicht es bis an die Unterkante und die Kapsel liegt
   **darauf**. Der Grund der Regel überlebt das unverändert: `SsBlatt.fuss` ist der
   **Sockel der untersten Raststufe**, damit der Griff nicht hinter der Kapsel liegt
   — das IST das Ausweichen —, und die Liste darin bekommt `paddingBottom` in Höhe
   der Kapsel, am Scroll-INHALT. **Glas auf Glas ist dabei am Gerät nachgesehen und
   in Ordnung** (`ac02`, `ac07`); die Warnung der `expo-glass-effect`-Doku war eine
   Vermutung, jetzt ist es eine Messung.

63. **Ein Bildschirm zeigt nur, was für die Entscheidung HIER nötig ist.**
   *(Ians Entscheidung 50 vom 2026-09-08, nach dem ersten Durchgang am eigenen
   Handy — er hat sie ausdrücklich zum Merken gegeben: „das soll eigentlich immer so
   sein".)* Sie steht über den anderen Regeln, weil sie sagt, wofür die App da ist:
   **Man macht sie impulsiv auf und wischt, bis etwas kommt** — ausdrücklich nicht wie
   beim Shoppen, wo man erst einen Riesenfilter baut und dann zwei Sachen sieht.
   Die Regel wirkt in **zwei** Richtungen, und die zweite ist die ungewohnte: Sie nimmt
   weg, was dasteht, UND sie bremst, was noch nicht gebaut ist — ein neuer Filter, ein
   neuer Umschalter, eine neue Einstellung muss ab jetzt begründen, warum sie im Weg
   stehen darf. **Die Grenze steht im zweiten Halbsatz und ist genauso verbindlich:**
   *„Wenn die Person etwas wissen will, dann soll's auch einfach für sie sein."*
   Wegräumen darf nicht heißen, dass man zweimal tippt für das, weswegen man gekommen
   ist — deshalb fällt am Filter-Knopf das WORT weg und der Zähler nicht (harte
   Regel 26), und deshalb verschwinden Zeit und Ort am Post-Screen nicht, sondern
   werden leise. **Bei jedem Wegnehmen mitprüfen, welche Entscheidung der Screen
   trägt.**
64. **Ein React-Native-`View` klippt seine Kinder NICHT — geklippt wird auf die Höhe,
   die man SIEHT.** *(Phase 19g, und es war die Ursache für fast alles, was Ian am
   Blatt aufgezählt hat.)* `overflow: visible` ist die Voreinstellung; ein Kasten mit
   `height: 0` zeichnet seinen Inhalt trotzdem, einfach daneben. Beim zugezogenen
   Blatt lagen so Suchzeile, Kategorien und Liste **ohne jeden Untergrund auf der
   nackten Karte** — und es sah aus wie ein durchsichtiges Blatt.
   **Der zweite Teil ist der lehrreichere:** Das Blatt HAT ein `overflow: 'hidden'`,
   und es half nicht. Es klippt auf DESSEN Kasten, und der ist die volle
   Containerhöhe — darin lag alles ordnungsgemäß drin. Wer eine Fläche verschiebt und
   nur einen Teil zeigt, klippt **an der Grenze des Gezeigten** (hier: `styles.huelle`),
   nicht am verschobenen Kasten. Dasselbe gilt für den Untergrund: Die Glasfläche
   bekommt `flex: 1`, damit sie **während** des Ziehens mitwächst — der Inhalt tut es
   nicht, die sichtbare Fläche schon.

65. **Die Reihenfolge des Feeds ist die ENTFERNUNG — und `sort.ts` trägt ZWEI
   Entscheidungen von Ian, nicht eine.** *(Entscheidung 63, 2026-09-08.)* Erste Stufe
   ist die Nähe zum eigenen Bezirk (`nachEntfernung`), zweite Stufe das Neueste
   (`nachErstellung`, Entscheidung 1 vom 2026-08-31). Die zweite ist nicht der
   Restposten der ersten: Alle Posts eines Bezirks teilen sich eine Entfernung, also
   entscheidet sie den häufigen Fall — genau dort, wo man am ehesten hingeht.
   **Beide tragen „nicht ohne Rückfrage".** Wer eine dritte Regel davorschaltet,
   fragt vorher; wer die Entfernung ANZEIGEN will, liest zuerst den Absatz über die
   Bezirksmitten in `lib/karte-geo.ts` — die Zahl ist heute nur für eine Ordnung gut
   genug, nicht für eine Auskunft. Ein Post ohne Bezirk hat keine Entfernung; wo er
   landet, sagt `OHNE_BEZIRK_POSITION` und nicht ein `if` in der Vergleichsfunktion.

66. **Ein `start`/`end` schlägt ein `left`/`right`, egal wer später kommt — und Web
   verrät es nicht.** *(Phase 19i, 2026-09-09.)* In Yoga sind das zwei verschiedene
   Eigenschaften, und die richtungsabhängige gewinnt. Die Tab-Leiste bringt
   `start: 0, end: 0` mit; unsere 16 pt standen als `left`/`right` und wirkten auf iOS
   **vier Wochen lang gar nicht**. Auf `react-native-web` werden beide zur selben
   CSS-Eigenschaft, dort gewinnt die spätere — **der Beleg im Browser war also richtig
   und trotzdem wertlos.** Wer die Position einer fremden Komponente überschreibt,
   liest nach, in welcher Schreibweise sie ihre eigene setzt, und nimmt dieselbe.
   Die Maße stehen als `TAB_KAPSEL_SEITE_KANTEN` in `lib/tabs.ts`.
67. **Auf dem Bezirks-Vollbild steht nichts außer Karten, Bar, Zurück und dem
   Bezirksnamen.** *(Ians Entscheidungen 65 und 66, Phase 19i.)* Ein Tipp auf einen
   Bezirk führt über die Blase (`alle N ansehen`) in ein Fenster, das nur noch die
   Frage „hingehen oder nicht" stellt — keine Suche, keine Kategorien, kein Filter,
   kein Posten, kein Umschalter. **Nur dort:** Der Startbildschirm behält alles, das
   hat er ausdrücklich bestätigt. Die zwei Dinge, die trotzdem dastehen, sind der
   zweite Halbsatz von Entscheidung 50 und keine Ausnahme — **ein Vollbild ohne
   Rückweg ist eine Sackgasse**, und ohne den Bezirksnamen sind es dieselben Karten
   wie am Start, nur ohne Bedienung. Der Zustand heißt `bezirkStapel` und ist bewusst
   **keine Route**: `/bezirk/[plz]` trüge die Auswahl in der Adresse, und dann stünde
   sie zweimal da (harte Regel 50).

68. **Was der Standort darf, steht in `features/posts/standort.ts` und nirgends
   sonst.** *(Phase 19h-2, Ians Entscheidungen 69 und 70.)* Dieselbe Bauart wie
   `safety/block.ts` (17), `groups/gruppe.ts` (32) und `requests/kollision.ts` (46):
   Screens lesen `STANDORT_ROLLE` und `STANDORT_FRAGE` nie, die Sätze kommen aus
   `standortFolgen()`. **Der Unterschied zu den anderen dreien ist, was die Datei
   verspricht** — harte Regel 47 in ihrer schärfsten Fassung, und in einer Form, die
   man nachprüfen kann: Der Standort geht **ausschließlich** in eine Reihenfolge ein,
   steht an keinem Post, in keinem Profil, in keinem Chat, wird **nicht gespeichert**
   (er liegt in der Sitzungs-Angabe `standort` im Speicher, wie `weggewischt`, und ist
   beim nächsten Start weg) und wird **nirgends angezeigt, auch nicht der Person
   selbst als Zahl**. Eine angezeigte Entfernung wäre ein Versprechen über
   Genauigkeit, das die Daten nicht abgeben können (siehe die Bezirksmitten in
   `lib/karte-geo.ts`) — und der erste Schritt zu „Lea ist 400 m weg".
   **Wer hier etwas ergänzt, das den Standort ANZEIGT oder SPEICHERT, hebt
   Entscheidung 61 und harte Regel 47 zugleich auf. Nicht ohne Rückfrage.**
   Das gilt ausdrücklich auch für Phase 20.4: Wo aus `weggewischt` später eine
   Sammlung am Nutzer wird, muss `standort` eine Zeile bleiben.

69. **Wer ich bin, kommt aus der SITZUNG — nie aus einer Konstante.** *(Phase 20.3-a,
   2026-09-09.)* In einem Haken `useCurrentUserId()`, in einer Aktion
   `getCurrentUserId()`, beide aus `features/auth/hooks.ts`, beide liefern `string`.
   **Dass sie kein `string | null` liefern, ist keine Bequemlichkeit, sondern eine
   Zusage, die woanders eingelöst wird:** Der Torwächter in `app/_layout.tsx`
   zeichnet den `Stack` gar nicht erst, solange niemand angemeldet ist. Wer diese
   Bedingung aufweicht — einen Screen ausgeloggt rendern, den Torwächter zu einer
   Überdeckung machen —, muss vorher 110 Stellen einen Sonderfall für „kein Ich"
   geben. Was die Regeln des Anmeldens sind, steht in `features/auth/anmeldung.ts`
   und nirgends sonst (dieselbe Bauart wie 17, 32, 46, 68); `ANMELDE_QUELLE` ist der
   eine Schalter, den 20.3-b umlegt. **`data/mock.ts` trägt nur noch
   `ATTRAPPE_ICH_ID`** — welcher Seed-Nutzer der eigene ist, und nicht mehr, wer
   „der aktuelle Nutzer" ist. Wer sie wieder so liest, dreht die Phase zurück.

53. **Die Geometrie der Bezirke steht EINMAL da — im Raster.** Wer sie in Grad braucht,
   rechnet über `PROJEKTION` aus `data/wien-bezirke.ts` um (`lib/karte-geo.ts`), und
   schreibt sie **nie** ein zweites Mal in den Generator. Die Projektion ist flach mit
   Kosinus-Korrektur und damit exakt umkehrbar; vier Zahlen ersetzen 886 Punkte. Wer
   eine Umrechnung prüft, prüft sie gegen **echte Orte** (Stephansdom → 1010) und nicht
   gegen sich selbst — ein Round-Trip besteht auch bei beidseitig falschem Vorzeichen.


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
- **Expo-Docs versioniert lesen** vor dem Schreiben von Code — Expo ändert sich schnell.

## Was Apple später verlangt (Guideline 1.2, User-Generated Content)

Alle vier stehen seit Phase 7 in der App: **Melden · Blockieren · Nutzungsbedingungen ·
Account löschen.** Drei davon wirken im Prototyp sogar richtig — Blockieren verändert
Feed, Anfragen und Chat, Melden wird gespeichert, Account löschen zeigt echte Zahlen.
Nur der letzte Klick beim Löschen tut nichts, weil es ohne Login kein Konto gibt; der
Screen sagt das selbst.

Was für den Review trotzdem noch fehlt und erst mit dem Backend kommt: ein Mensch, der
die Meldungen liest, und das Häkchen „Nutzungsbedingungen akzeptiert" beim Anmelden.
Der **Rechtstext selbst fehlt bewusst sichtbar** (roter Kasten in
`nutzungsbedingungen.tsx`) — er ist kein Text, den Claude erfinden darf
(`_FUER_IAN/OFFENE_SACHEN.md`, Punkt 1).
