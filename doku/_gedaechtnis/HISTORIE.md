# SimplySocial — Historie

> Herausgelöst aus `CLAUDE.md` am 2026-09-13. **Kein Zeichen geändert** — nur
> verschoben, damit die auto-geladene `CLAUDE.md` nicht mehr ~101.500 Tokens je
> Sitzung kostet. Der Index dazu steht in `../CLAUDE.md`; **wer hier etwas anfasst,
> zieht den Index mit.**
>
> Phase 0 bis 20.9 im Volltext, dazu die Reihenfolge der zehn Schritte. **Neuestes steht oben.** Eine fertige Phase gehört hierher, nicht in CLAUDE.md.

---

## Phase 20.6-d — Der runde Zuschnitt ✅ *(2026-09-13 nachts)*

> Ians Wunsch vom Nachmittag: *„bitte kreisförmiges Zuschneiden."* Der Volltext der
> Phase steht in `PLAN.md`, Abschnitt 5b; hier das, was in einem halben Jahr noch
> zählt.

**Was der Kern war, und es ist nicht das Zuschneiden:** Ein rundes BILD gibt es nicht
— JPEG hat keinen Alphakanal. Rund ist das FENSTER, gespeichert wird ein Quadrat, und
`SsAvatar` zeichnet den Kreis. Wer das nicht zuerst versteht, baut einen Tag lang am
falschen Ding. Jetzt **harte Regel 106**.

**Die Bauart.** Vier Dateien, dieselbe Arbeitsteilung wie überall:
`features/social/zuschnitt.ts` weiß, WO das Quadrat liegt (importfrei, damit
`91_zuschnitt.mjs` sie in blankem Node lädt) · `components/BildZuschneiden.tsx` weiß,
wie es AUSSIEHT, und rechnet keine einzige eigene Zahl · `lib/bild-zuschneiden.native.ts`
führt aus · `lib/bild-zuschneiden.ts` ist der Web-Zweig und WIRFT, statt still etwas
zurückzugeben (eine Attrappe, die schwächer ist als das Original, ist die gefährlichere
Richtung).

**Die Entscheidung war eine neue: 512 px (Nummer 77).** Erst seit dem eigenen Fenster
ist die Frage überhaupt stellbar — vorher kam, was aus Apples Dialog fiel. Gemessen
statt geschätzt: größter Avatar 72 Punkte = 216 echte Pixel; 512 kostet ~30 KB und
passt ~35.000-mal ins freie Gigabyte, ungefähre Auflösung vorher 0,7–1,5 MB.

**Entscheidung 54 wurde ABGELÖST, nicht zurückgenommen** (harte Regel 58).
`ZUSCHNEIDEN` sagt weiterhin OB, `ZUSCHNITT_EIGENES_FENSTER` sagt VON WEM. Wer die neue
abstellt, bekommt Apples Dialog zurück — statt dass gar nichts mehr zuschneidet.

**Der Zustand steht in ORIGINAL-PIXELN**, nicht in Bildschirmpunkten, und das ist die
Entscheidung, an der alles hängt: `expo-image-manipulator` will Pixel, und ein Zustand
in Punkten hinge an der Fenstergröße. Geklemmt wird, nicht interpoliert — bei einem
Hochkant-Foto ist der waagrechte Spielraum bei Zoom 1 exakt null, und eine Spanne der
Breite null hat dieses Projekt schon einmal einen Abend gekostet.

**Aus einer Beobachtung wurde eine Anweisung.** Dass ein iPhone-Foto bei uns als JPEG
ankommt, stand seit 20.6-b als Fund aus `ios/ImageUtils.swift` in `bild.ts` — also als
Hypothese über fremden Quelltext. Jetzt steht `format: SaveFormat.JPEG` bei uns.
Nebenbei fallen die ~4 MB base64-Text je Versuch weg.

**Gemessen:** `pruef-zuschnitt` **47 Häkchen** (darunter 4000 Zufallsproben gegen den
Bildrand) mit zwei Gegenproben · lokal **171** unverändert · `tsc` sauber · Lint **82**
statt 81, und der eine neue ist benannt (`react-hooks/refs`, wie `SsWienKarte.tsx:552`,
derselbe Grund) · im Web-Bündel kommt `expo-image-manipulator` **0-mal** vor, der
Web-Zweig 2-mal (Gegenprobe gegen sich selbst) · in der gebauten App liegt
`ExpoImageManipulator.framework`, signiert, Team 5TQTMP2L2H.

**Am Gerät nachgemessen, noch am selben Abend — Durchgang 4, 6 von 6** (iPhone 16):
`ImageRef.width` meldet die **GEDREHTE** Breite, gemessen an einem quer aufgenommenen
Foto; der Kreis saß dort, wo er im Fenster stand. Das war die einzige begründete
Annahme der Phase. Und Ians Urteil zum Gefühl: **„läuft flüssig"** — der `PanResponder`
mit `useState` je Bild reicht auf einem iPhone 16, `react-native-reanimated` wird nicht
gebraucht. Die Rückfallposition ist damit erledigt, statt als ungeprüfte Möglichkeit
stehenzubleiben.

**Und ein Fund nebenbei, der nicht zu dieser Phase gehört:** `98_moderation.sh` schickt
seinen Aufbau durch ein unquoted Heredoc mit Backticks in den SQL-Kommentaren — die
Shell führt sie aus. Der Lauf ist grün, weil nur Kommentare zerschossen werden, aber
`<<'SQL'` gehört dort hin.

---

## Aktueller Stand

> 🔗 **Prototyp: https://ianfhorak-jpg.github.io/simplysocial/**
> (Code: `simplysocial/` · neu hochladen: `npm run deploy`)
> 🔗 **Landing-Page: https://ianfhorak-jpg.github.io/simplysocial-landing/**
> (Code: `landing/` · kein Build, `git push` genügt)
>
> 📁 **Die Belege liegen seit dem 2026-09-12 in `_belege/`** (304 Screenshots, vorher
> alle im Hauptordner). **Verschoben, nicht gelöscht** — die Dateinamen sind
> unverändert, also geht jeder Verweis in PLAN.md weiter auf (`am01`, `ao01`, …).
> Was Ian selbst geschickt hat, liegt in `_belege/von-ian/`. Im Hauptordner sind nur
> die zwei Liquid-Glass-Vorbilder geblieben, weil sie als laufende Vorlage dienen
> und nicht als Beleg. Einzelheiten in `_belege/LIESMICH.md`.

✅ **Phase 20.8 ist FERTIG (2026-09-13) — und sie heißt „Was WEGFÄLLT", es fällt aber
das Gegenteil von dem weg, was der Plan sagte.** Er verlangte seit Phase 8:
*„`features/statisch.ts` gehört gelöscht, nicht angepasst."* **Gemessen mit zwei
vollständigen Web-Exporten, einer je Schalterstellung** (`'attrappe'` per `sed` erzwungen,
Rücknahme mit `git diff` belegt):

    ANMELDE_QUELLE='attrappe'   72 HTML-Dateien   47 konkrete Adressen   17 mit Inhalt
    ANMELDE_QUELLE='supabase'   25 HTML-Dateien    0 konkrete Adressen    0 mit Inhalt

Eine neue Entscheidung von Ian (**75**: die öffentliche Adresse bleibt der Prototyp), ein
neuer Wächter in `deploy.sh`, ein berichtigter Kommentarkopf. `tsc` sauber · **81
Lint-Probleme wie vorher**. Vier Dinge:

1. 🔴 **Die GEFAHR, wegen der gelöscht werden sollte, war längst weg — beseitigt von
   einer ANDEREN Phase.** Der Kommentar in `statisch.ts` warnte, mit echten Daten wäre
   `chat/t1.html` ein öffentlich abrufbarer fremder Chat. Gemessen: Die Datei entsteht
   gar nicht, **null** HTML trägt Mock-Inhalt — weil `startListen()` (`features/store.ts`)
   seit 20.4-b bei `'supabase'` neun LEERE Listen zurückgibt und `generateStaticParams`
   in Node gegen genau diesen Anfangszustand läuft. **Ein Schalter, der für die Laufzeit
   gedacht war, entscheidet auch, welche DATEIEN entstehen.** Wer nur den alten Kommentar
   las, hielt eine erledigte Gefahr für offen — harte Regel 83 innerhalb einer Datei.
2. 🔴 **Und Löschen wäre trotzdem falsch, weil `deploy.sh` seit dem 13.09. NUR aus
   `'attrappe'` heraus deployt** (harte Regel 96). Öffentliche Adresse und echte App sind
   zwei getrennte Stände, und `statisch.ts` gibt dem einen seine 47 Direktlinks.
   **Ians Entscheidung 75** hält das fest; verworfen: abschalten, und auf echte Daten
   nachziehen (bräuchte einen 404-Umweg, und Apple/Google gehen im Browser nicht).
3. 🔴 **Der teuerste Fund war mein EIGENER erster Wächter — er hätte den Zustand
   durchgelassen, gegen den er gebaut ist.** Gezählt wurde mit `grep -v '\['`; bei
   `'supabase'` ergab das nicht 0, sondern **1**: `gruppe/neu.html`, eine STATISCHE Route
   (`src/app/gruppe/neu.tsx`) und keine erzeugte Adresse. **Der Kommentar in `statisch.ts`
   warnt wörtlich davor** — gelesen und trotzdem hineingelaufen. Ausgenommen wird jetzt
   kein NAME (zweite Quelle), sondern die EIGENSCHAFT: Zu einer statischen Route gibt es
   eine gleichnamige Quelldatei unter `src/app/`, **und der Wächter sieht selbst nach.**
   ⚠️ Dazu eine zweite Falle, die nur zufällig nicht zuschlug: Unter `set -euo pipefail`
   gibt `grep -v` bei **null** übrigen Zeilen `exit 1` — `pipefail` reicht es durch,
   `set -e` tötet das Skript **stumm, vor der Fehlermeldung**, also genau im gemeinten
   Fall. Gerettet hat die Datei, die nicht mitzählen darf. Jetzt eine `while read`-Schleife
   ohne Pipe, beide Richtungen mit der ECHTEN Funktion aus `deploy.sh` gemessen (per `sed`
   extrahiert, nicht nachgebaut): `'attrappe'` 20/18/4/5 = **47** durch · `'supabase'`
   0/0/0/0 = **0** Abbruch.
4. **Die Lücke war größer, als sie aussieht, und das ist der Grund für den vierten
   Wächter.** Wer `statisch.ts` löscht oder einem der **sechs** Screens sein
   `generateStaticParams` nimmt, lässt den Schalter unberührt — der Schalter-Wächter ist
   zufrieden, der Deploy läuft durch, **und es gibt keine Fehlermeldung**, weil Expo
   Router dann `post/[id].html` schreibt, mit eckigen Klammern im Namen. **Zwei Gründe an
   einem Wächter sind einer zu viel:** Der Schalter-Wächter deckt es heute nebenbei mit
   ab, und sein eigener Text lädt dazu ein, ihn neu zu fassen.

✅ **Die Latte ist am selben Tag entschieden — Ians Entscheidung 76: (c), je Familie
mindestens eine** (PLAN.md Abschnitt 6, Punkt 40). Vier einzelne Vergleiche statt einer
Latte auf der Summe, **kein `TODO` mehr im Skript.** Verworfen ist (d) „genau
20 / 18 / 4 / 5": Sie wäre schärfer (sie fängt auch, wenn von zwanzig Posts nur noch einer
entsteht), aber die Zahlen stünden dann ZWEIMAL da, hier und in `mock.ts` — harte
Regel 53. **Und ihre Folge wiegt schwerer als der ungefangene Teilausfall: Eine Prüfung,
die bei harmlosen Änderungen rot wird, wird beim dritten Mal entschärft** — dann ist sie
ganz weg, in dem Moment, in dem niemand hinsieht.

🔬 **Bewacht ist sie durch die VERWORFENE Fassung, nicht durch einen grünen Lauf** (die
Lehre vom selben Morgen: *eine Entscheidung, deren verworfene Variante alle Häkchen
besteht, ist unbewacht*). Dafür wurde ein dritter Export gebaut, den es in echt nicht
gibt — `'attrappe'` ohne die vier Chat-Adressen — und der ECHTE Wächterblock per `sed`
aus `deploy.sh` extrahiert (eine nachgebaute Fassung prüft die Nachbildung):

    Fall                                  Platzhalter        (c)
    'attrappe' vollstaendig   20/18/4/5   durch              durch
    'supabase'                 0/0/0/0    ABBRUCH            ABBRUCH
    'attrappe' ohne Chats     20/18/0/5   durch (Summe 43)   ABBRUCH   ← der Beleg

Die dritte Zeile ist der ganze Inhalt der Entscheidung: **Eine Latte auf der SUMME hätte
den Ausfall einer ganzen Routen-Familie unbemerkt durchgelassen.**

⚠️ **Was (c) NICHT fängt, steht im Skript daneben, damit es niemand für gefangen hält:**
Entsteht von zwanzig Posts nur noch einer, läuft der Deploy durch. Der Wächter sagt „aus
jeder Familie kommt etwas an", nicht „es ist vollständig" — und mehr kann er nicht sagen,
ohne die Zahlen ein zweites Mal zu kennen.

ℹ️ **Nebenbei berichtigt:** Der Kopf von PLAN.md Abschnitt 6 sagte *„dieser Abschnitt
endet bei 37"* — er endet bei 40. **Die Warnung war selbst der Fall, vor dem sie warnt.**
Und der Plan sprach von „den vierzehn Posts" in `mock.ts`; seit Phase 18d sind es zwanzig.

🎉 **Phase 20.7-b ist FERTIG (2026-09-13 spätabends) — und damit ist die
Apple-1.2-Pflicht VOLLSTÄNDIG.** Melden · Blockieren · Nutzungsbedingungen · Konto
löschen · Meldungen lesen (20.7) · **und jetzt auch handeln.** Der Leser darf
entfernen und ausschließen: `npm run meldungen -- post-loeschen <id>` und
`-- konto-loeschen <@name>`, beide zeigen ohne `--wirklich` nur eine Vorschau.

Drei Entscheidungen von Ian (**72**: ausschließen heißt löschen · **73**: erledigt ist
erledigt · **74**: der Kasten-Knopf bleibt), eine neue Migration
(`0010_moderation.sql`), ein neuer Prüfstand (`npm run pruef-moderation` — **31
Häkchen**). Gemessen: `tsc` sauber · **81 Lint-Probleme wie vorher** · lokal **171
statt 136** · `pruef-konto` **32** · `pruef-bilder` **32** · `pruef-schreiben` **50** ·
`pruef-lesen` **29** · `pruef-sitzung` **29** · `pruef-bildwahl` **47** ·
`pruef-anbieter` **48** · `pruef-programmfehler` **25** · am echten Server eingespielt,
alle zwölf Zahlen grün, darunter die neue **„Moderation dicht: 0"**. Sieben Dinge:

1. 🔴 **Der teuerste Fund: In Postgres darf `PUBLIC` JEDE neue Funktion ausführen — und
   ohne ein `revoke` wäre `konto_entfernen` ein Knopf gewesen, mit dem jeder
   Angemeldete jedes Konto der App löscht.** Gemessen an der Wegwerf-Datenbank UND am
   echten Supabase, an allen neun bestehenden Funktionen: `anon: true | auth: true`,
   ausnahmslos. Die `grant execute` in 0004 erteilen also etwas, das ohnehin da war —
   **dieselbe Familie wie die Rechteliste aus 0002** (harte Regel 85), nur bei
   Funktionen statt Tabellen. Für die neun ist es folgenlos, **weil jede SELBST prüft,
   wer sie ruft** (harte Regel 70). Genau das kann `konto_entfernen` nicht: Ihr Zweck
   IST das fremde Konto. Harte Regel 104.
2. **`konto_loeschen()` wurde UMGEBAUT, obwohl sie lief.** Der naheliegende Weg wäre
   gewesen, ihren Rumpf zu kopieren und `auth.uid()` durch `wen` zu ersetzen — dann
   stünde die Erbfolge aus Entscheidung 13 **zweimal** da, und wer sie ändert, ändert
   eine von beiden. **Das fällt nie auf, weil man selten fremde Konten löscht.** Jetzt:
   ein gemeinsamer Rumpf (`konto_weg`), zwei Türen davor. `konto_loeschen()` nimmt
   **weiter keine Argumente** — der Wächter aus 0009 bleibt Zeichen für Zeichen
   erfüllt, und ihr Kommentar in 0003 stimmt unverändert.
3. **Es gibt bewusst KEIN `post_entfernen()`**, und das ist harte Regel 70 wörtlich
   angewandt: *Eine Funktion verlangt es, WENN etwas zu entscheiden ist.* Beim Post ist
   nichts zu entscheiden — gemessen: `join_requests` geht per CASCADE mit,
   `chat_threads.post_id` wird `SET NULL`, **der Chat BLEIBT** (Entscheidung 42). Zwei
   Leute, die sich getroffen haben, verlieren ihr Gespräch nicht, weil ein Dritter den
   Aushang gemeldet hat.
4. 🔴 **Der zweitteuerste Fund ist ÄLTER als diese Phase: In `05_daten.sql` gibt es
   keine Gruppe, in der eine Erbfolge stattfinden könnte.** „Marswiese Tennis" ist
   schon aufgelöst, in „Nora allein" ist Nora allein. **Damit war der Erbfolge-Pfad in
   `konto_loeschen()` nie gelaufen** — ausgerechnet der Teil, der die Funktion
   überhaupt rechtfertigt. Die 18d-Lehre: *Eine Regel, die nichts vorfindet, sieht aus
   wie eine Regel, die tut.* `98_moderation.sh` legt seinen Fall jetzt selbst an und
   misst, dass **Lea** erbt und nicht Nora — ein Test auf „irgendwer erbt" hätte eine
   verkehrte Reihenfolge durchgelassen.
5. **`aufbauen.sh` zählte die Migrationen von HAND auf** — genau die Bauart, die in
   20.7 an `einspielen.sh` `0008_bilder.sql` verschluckt hat. Hier wäre es schlimmer
   gewesen: **Ein Prüfstand, der eine Migration auslässt, misst grün an einer
   Datenbank, die es nicht gibt.** Jetzt kommt die Liste aus dem Ordner.
6. **Das `--wirklich`-Gate ist die einzige Zeile zwischen einem Tippfehler und einem
   gelöschten Konto — und gegen den echten Server ist sie prinzipiell nicht prüfbar:**
   Der Beleg wäre ein wirklich gelöschtes Konto. Deshalb nimmt `meldungen.sh` seit
   20.7-b `SS_DB_URL` entgegen, und der Prüfstand misst beide Richtungen. **Die
   Vorschau ist hier kein Komfort:** Eine UUID sagt einem Menschen nichts, und sie
   nennt auch, was Entscheidung 13 tun wird — welche Gruppe an wen geht und welche
   aufhört.
7. **Zwei eigene Fehler, beide am MESSAUFBAU.** Der Gruppen-Aufbau im neuen Prüfstand
   lief durch `>/dev/null`, und als das `insert` an einem falschen Spaltennamen
   scheiterte (**das Schema ist GEMISCHT**: `offen` und `aufgeloest_am` deutsch,
   `description`, `category`, `district` englisch), sah der Lauf aus, als wäre die
   ERBFOLGE kaputt — vier Kreuze, keines am geprüften Code. Und ein `grep -c '@nora'`
   erwartete genau 1 und fand 2: **Ein Test, der an einer ZAHL hängt, wo die Aussage
   „kommt vor" ist, wird beim nächsten Satz rot, ohne dass etwas kaputt ist.**

⚠️ **Was 20.7-b NICHT ist: in der App sichtbar.** Es ist ein Befehl am Mac, und das IST
Ians Entscheidung 58. Auf `reports` steht weiterhin nur `select, insert` — **kein
`update`**, also kann niemand in der App etwas abhaken.

ℹ️ **Und hier steht ausnahmsweise KEIN Pixelvergleich — belegt statt weggelassen.** Die
einzige Änderung an App-Code ist ein Glied eines TYPS (`'spaet-erledigt'` aus
`MeldungsLage`), und Typen existieren zur Laufzeit nicht; `programmfehler.ts` hat null
Code-Zeilen geändert, nur Kommentare. Gemessen dazu: Aus `meldung.ts` importiert die App
allein `zusageText()` (in `nutzungsbedingungen.tsx`), und die ist unverändert. **Ein
Bundle-Effekt ist damit ausgeschlossen, nicht bloß unwahrscheinlich** — wer hier
trotzdem misst, misst Aufnahme-Rauschen (die 20.6-c-Lehre: zwei Aufnahmen derselben
Seite weichen um vier Pixel voneinander ab).

✅ **Zwei Entscheidungen an dem Abend haben FAST KEIN Zeichen Code geändert, und sind
trotzdem nicht dasselbe wie vorher.** Bei **73** (`meldungLage()`) stand A als
Platzhalter und steht jetzt als Entscheidung — dabei fiel `'spaet-erledigt'` aus dem
Union, weil ein Glied, das nie entsteht, genau der Zustand ist, den harte Regel 31
undarstellbar machen will. Bei **74** (`PROGRAMM_KNOPF_LADEN`) stand „das ist meine
Abwägung, nicht seine". **Die 18d-Lehre: Ein Platzhalter, der zufällig richtig ist, und
eine Entscheidung sind zwei verschiedene Zustände** — der Unterschied liegt vollständig
in dem, was die nächste Sitzung liest.

✅ **Phase 20.9 ist FERTIG (2026-09-13 abends): kein Knopf schweigt mehr — und der
teuerste Fund war ein KOMMENTAR, der eine Erlaubnis erteilte, die es nicht mehr gab.**
Die 14 Stellen, an denen eine `async`-Funktion an eine `void`-Prop ging, sind zu; der
Lint-Schalter `checksVoidReturn` steht seither dauerhaft auf `true` — **81 Probleme wie
vorher**, und das IST der Beleg. Eine neue Entscheidung von Ian (**71**: derselbe Ort,
ein eigener Satz), eine neue Regel-Datei (`lib/programmfehler.ts`), ein neuer Prüfstand
(`npm run pruef-programmfehler` — **25 Häkchen, und ohne Ians Zweige 8 Kreuze**).
Gemessen: `tsc` sauber · lokal weiter **136** · `pruef-schreiben` **50** ·
`pruef-bilder` **32** · `pruef-lesen` **29** · `pruef-konto` **32** · `pruef-sitzung`
**29** · `pruef-bildwahl` **47** · `pruef-anbieter` **48** · Prototyp auf 390 × 844
**Pixel für Pixel identisch** (`as01` gegen `ar01`, **0** abweichende Pixel) · Schalter
nachweislich zurück auf `'supabase'`. Sechs Dinge:

1. **Der Kommentar an `schreibVorgang` sagt seit Phase 20.5: *„Gibt ein Promise zurück,
   das NIE abgelehnt wird — Screens dürfen es deshalb liegen lassen."*** Genau darauf
   verlassen sich die 14 Stellen. **Der Satz stimmte seit dem Tag nicht mehr, an dem
   `schreibVorgangIntern` das `throw` für einen Nicht-`SchreibFehler` bekam** — die 14
   `onPress` waren also nicht schlampig, sie folgten einer still weggefallenen Zusage.
   Dieselbe Familie wie der veraltete Wächter-Kommentar in `50_lesen.sh`. **Daraus kam
   der Entwurf:** Ein reines `void` hätte den Lint grün gemacht und den Fehler trotzdem
   unsichtbar gelassen. Repariert sind beide Hälften.
2. **Die dritte Familie war schlimmer als die zwei bekannten: `datenHolen()` warf
   genauso — und ZWEI der 14 Stellen sind `nochmal={datenHolen}`.** Der Knopf, den Ians
   Entscheidung 43 dem Menschen als einzigen Ausweg aus dem Vollbild-Kasten gibt, konnte
   selbst lautlos scheitern: Man steht vor dem Kasten, drückt, und nichts passiert —
   für immer.
3. 🔴 **DREI Prüfstände waren schon vor dieser Phase rot, alle drei seit demselben
   Morgen — und aufgefallen ist es nur, weil sie hier zum ersten Mal wieder liefen.**
   `pruef-schreiben` (die `crypto`-Reparatur zog `80_bilder.sh` nach und vergaß
   `70_schreiben.sh`), `pruef-konto` (die geteilte Sitzung, **und dieser Prüfstand war
   als einziger ohne Alias-Wächter** — der Fehler kam als nacktes
   `ERR_MODULE_NOT_FOUND`), und darin versteckt eine Aktionsliste, in der
   `kontoLoeschen` seit 20.6-c fehlte. **Gefunden hat das Letzte die dritte Prüfung aus
   20.6, die genau dafür gebaut wurde — zum zweiten Mal.**
4. **Ians Entscheidung 71 ist bewacht, und zwar durch die verworfene Fassung.** Der neue
   Prüfstand misst nicht nur, dass sein Satz dasteht, sondern baut danach eine Kopie der
   Quelle mit abgeschalteten Zweigen: dort **8 Kreuze**. Das ist die Lehre vom selben
   Morgen — eine Entscheidung, deren verworfene Variante alle Häkchen besteht, ist
   unbewacht.
5. **`PROGRAMM_CODE` trägt einen Schrägstrich, und das ist gemessen.** Er landet im
   selben Feld wie ein SQLSTATE; `'P0001'` wäre naheliegend und ist ein ECHTER SQLSTATE
   (`raise_exception`), den eine der neun Funktionen werfen kann. Ein `/` kann in einem
   SQLSTATE nicht vorkommen. Harte Regel 103.
6. **Drei eigene Fehler, alle am MESSAUFBAU, alle schon aufgeschrieben.** Ein `sed` traf
   den KOMMENTAR neben dem Wert (er behauptete danach das Gegenteil seiner Begründung,
   gefangen von einem `assert`); eine nachgebaute tsconfig ließ `"types": ["node"]` weg
   (dieselbe Falle wie am Morgen); und der Alias-Wächter des neuen Prüfstands fragte
   erst ALLE gebauten Dateien statt der drei geladenen.

⚠️ **Was 20.9 NICHT ist: am Gerät geprüft.** Dass die Leiste am iPhone wirklich
erscheint, hängt an `features/store.ts` — und die zieht React und `supabase-js` herein,
läuft in keinem Node. Gemessen ist die REGEL; **dass der Zustand gesetzt WIRD, gehört in
den nächsten Gerätedurchgang.**

❓ **Eine Auslegung wartet auf Ian** (blockiert nichts): der Knopf unter dem
Vollbild-KASTEN. Bei der Leiste steht „Alles klar", weil ein neuer Versuch in denselben
Fehler liefe; unter dem Kasten steht nichts, und ohne Knopf verlässt man ihn nur durch
einen Neustart — dort blieb „Nochmal versuchen". **Ein nutzloser Knopf ist besser als
eine Sackgasse, aber das ist meine Abwägung.** Die Korrektur ist ein Wort.

🎉 **DER GERÄTEDURCHGANG IST GEMACHT (2026-09-13, nachmittags) — sieben von sieben,
und der siebte hat drei Anläufe gekostet.** Ians iPhone 16, iOS 26.6.1, Release-Build
über WLAN. **Damit ist das Backend am echten Gerät bewiesen**, nicht mehr nur am Mac:

| | |
|---|---|
| Anmelden mit **Apple** | ✅ Dialog kam, Anmeldung durch |
| Anmelden mit **Google** | ✅ Browserfenster auf, Rücksprung in die App |
| **Neustart** | ✅ **angemeldet geblieben** — der iOS-Schlüsselbund nimmt die 14 Byte (Entscheidung 55) |
| **Profilbild** | ✅ *nach der Reparatur unten* |
| **Merker** | ✅ Anleitungskarte bleibt weg (Entscheidung 57) |
| **Prototyp-Hinweis** | ✅ kommt am Gerät nicht (Entscheidung 56) |
| **@-Namen** | ✅ `@…` steht da (der Fund aus 20.7, harte Regel 99) |

🔴 **Der Fund des Tages: auf React Native gibt es KEIN `globalThis.crypto` — und das
hat jedes Profilbild am Gerät LAUTLOS scheitern lassen.** Bildwähler und Zuschnitt
liefen tadellos, danach passierte **gar nichts**: kein Bild, keine Meldung, keine
Fehlerleiste. Nachgemessen war `photo_url` leer UND der Bucket leer.

Gemessen, nicht vermutet — drei Quellen:
- `react-native/Libraries/Core/InitializeCore.js` richtet **kein** `crypto` ein.
- `expo-crypto` setzt ein globales **nur auf Web** (`ExpoCrypto.web.js`, Zeile 4).
- Im gebauten `main.jsbundle` kamen `getRandomValues` und `randomUUID` **je genau
  EINMAL** vor — das waren meine zwei Zeilen in `zufallsName()`. Niemand definiert sie.

**Warum es so still war, ist der zweite Teil und der lehrreichere.** Der Wurf war ein
gewöhnlicher `Error` und kein `SchreibFehler` — `schreibVorgangIntern` wirft so etwas
**absichtlich weiter**, damit ein Programmfehler „laut" ist statt als „Keine
Verbindung" verkleidet (Zeile 513–516 in `store.ts`). Die Absicht stimmt. **Nur gibt es
in einem Release-Build nichts Lautes:** Er lief durch `onPress={async …}` hinaus und
war weg. Harte Regeln 101 und 102.

⚠️ **Und kein Prüfstand KONNTE das finden.** `pruef-bilder` läuft in Node, und Node hat
`globalThis.crypto`; der Browser auch. Die 32 Häkchen von 20.6-a waren echt und für
diese Frage wertlos — **die Attrappen-Falle in ihrer schärfsten Form: Die Prüfumgebung
bringt etwas mit, das das Gerät nicht hat.** Der Wächter dagegen macht sie jetzt ÄRMER
statt reicher: `90_bildwahl.mjs` nimmt `crypto` für die Dauer einer Messung weg,
**47 statt 35 Häkchen**.

Gebaut: `lib/zufall.ts` / `.native.ts` mit Plattform-Endung (`bild.ts` bleibt
**importfrei** — das trägt zwei Prüfstände), `bildPfad()` nimmt den Zufall entgegen und
**prüft ihn** (32 Hex, sonst Abbruch), `einstellungen.tsx` fängt beide Wege.
**KEIN neuer Baustein** — `ExpoCrypto` liegt seit dem 12.09. im Binary, es kam über
`expo-auth-session` mit (19 Treffer, nachgemessen).

✅ **Danach am echten Server gemessen, und drei Zahlen sind dabei zum ERSTEN Mal vom
Gerät statt aus fremdem Quelltext:**

    Name    b97fc040-…/17eeb6bbe4e740eab1cd8451418392f5.jpg   ← 32 Hex aus expo-crypto
    Größe   176.338 B = 0,17 MB                               ← 3,4 % der 5-MB-Grenze
    Typ     image/jpeg, erste Bytes ffd8ffe0 … JFIF           ← harte Regel 90 belegt
    CDN     HTTP 200, cache-control: public, max-age=300      ← Entscheidung 51 belegt

**Damit ist `BILD_QUALITAET = 0.8` beantwortet** — die Zahl war seit dem 13.09. früh
„begründet, aber nicht nachgemessen"; sie ist großzügig genug. Und Ians Entscheidung 51
reist über den NATIVEN Zweig von `storage-js` mit, obwohl der ein ganz anderer ist als
im Browser (harte Regel 91) — vorher nur in Node belegt, jetzt vom Gerät.

⚠️ **Was der Durchgang NEBENBEI aufgedeckt hat und was offen bleibt: 15 Stellen** in der
App geben eine `async`-Funktion an eine Prop, die `void` erwartet. An jeder kann ein
Fehler genauso spurlos verschwinden wie hier. **Der Lint-Wächter dagegen kam am 12.09.
ins Projekt — mit `checksVoidReturn: false`, also mit genau dem Auge zu, das diese
Familie sieht.** Eine ist seit heute zu, **14 stehen offen**; das gehört als eigener
Durchgang aufgeräumt, nicht nebenbei.

❓ **Ians Wunsch, notiert und noch nicht gebaut: KREISFÖRMIGES Zuschneiden.** Geht mit
`expo-image-picker` auf iOS **nicht** — steht in dessen Typen: `aspect` ist
Android-only *„since on iOS the crop rectangle is always a square"*, und
`shape: 'oval'` trägt `@platform android`. Seine Entscheidung am 13.09.: **erst das
Bild zum Laufen bringen, dann der Kreis** — richtig, sonst hätte jeder Fehler zwei
mögliche Ursachen. Der Weg wäre ein eigener Zuschneide-Bildschirm mit
`expo-image-manipulator` (neuer Baustein, neuer Build).

✅ **Phase 20.7 ist FERTIG (2026-09-13): die Meldungen haben einen Leser — `npm run
meldungen`.** Die letzte offene Apple-1.2-Zusage. Zwei Entscheidungen von Ian (**58**:
ein Befehl am Mac · **59**: 24 h bei Gefahr und Belästigung, 48 h sonst), eine neue
Migration (`0009_meldungen.sql`), zwei neue Dateien (`features/safety/meldung.ts`,
`lib/handle.ts`). Gemessen: `tsc` sauber · **81 Lint-Probleme wie vorher** · lokal weiter
**136 Häkchen, 0 Kreuze** · `pruef-sitzung` **29** · `pruef-bildwahl` **35** ·
`pruef-anbieter` **48** · kein Überlauf auf 390 × 844 und 360 × 600 · Deploy-Wächter
bricht weiter ab · Schalter nachweislich zurück auf `'supabase'`. Sieben Dinge:

1. **Der teuerste Fund macht ein Konto UNLÖSCHBAR — und die Spalte, die ihn verursacht,
   gibt es NUR wegen Apple 1.2.** `reports.erledigt_von` verwies auf `profiles (id)`
   **ohne `on delete`-Klausel** (`NO ACTION`); die Schwesterspalte drei Zeilen darüber
   trägt seit dem 06.09. `on delete set null`. Gemessen am Katalog UND an der Wirkung:
   Nach einer bearbeiteten Meldung scheitert `delete from auth.users where id = ich` —
   **die letzte Zeile von `konto_loeschen()`.** Wer je moderiert, könnte sein Konto nie
   mehr löschen; **die Moderations-Spalte hätte also die Lösch-Pflicht gebrochen, beides
   Apple 1.2.** Der Kommentar in 0001 warnt sieben Zeilen darüber wörtlich davor
   (*„scheitert erst … an dem Tag, an dem es niemand mehr in Ruhe nachsehen kann"*) —
   **die eine Spalte hat die Lehre bekommen, die andere nicht.** Harte Regel 98.
2. **Der zweite Fund gehört gar nicht zu 20.7 und hing an der App, die auf Ians iPhone
   wartet: das `@`.** `mock.ts` und die Prüfdaten trugen es IM WERT (`'@ian'`),
   `handleVorschlag()` gibt `'ian'` zurück — und **zehn Screens zeichneten
   `{person.handle}` roh.** Mit `'attrappe'` sah das vier Wochen richtig aus; mit
   `'supabase'` — der Stellung, in der die App GEBAUT ist — hätte **jeder @-Name sein `@`
   verloren**: Profil, Chat-Kopf, Post-Detail, Anfragen-Tab, Löschbestätigung. `tsc`
   schweigt, beides ist `string`. Aufgefallen, weil das Werkzeug `@@tobi` ausgab. Jetzt
   `handleText()` in `lib/handle.ts` wie `ortText()` (harte Regel 20), drei Häkchen
   halten die zwei Hälften **gegeneinander**. Harte Regel 99.
3. **`einspielen.sh` hörte bei 0007 auf — 0008 fehlte seit dem Vortag**, und **keine der
   neun nachgemessenen Zahlen hätte es gefunden.** Wer frisch aufbaut, bekäme keinen
   Bilder-Bucket. Jetzt kommt die Liste aus dem ORDNER, mit einem Wächter auf
   vierstellige Nummern.
4. **Entscheidung 58 kostet KEINE neue Berechtigung.** Auf `reports` steht weiter nur
   `select, insert` — **kein `update`**, also kann niemand in der App `erledigt_am`
   setzen. Das Werkzeug geht über die db-url, also `postgres`. Möglichkeit B wäre eine
   Rolle gewesen, die jeden Chat liest und jeden Post löscht — **auf einem Handy.**
5. **Zweimal hat mein MESSAUFBAU falsch gemeldet, beide Male sah es nach kaputtem
   Wächter aus.** Die Gegenprobe an 0009 schickte den Datenbankaufbau nach `/dev/null`
   und meldete dreimal „kein Alarm"; eine nachgebaute tsconfig ließ `"types": ["node"]`
   weg. **Zweimal an einem Tag die Lehre „prüf zuerst, ob das Messgerät verstellt ist".**
   Der Aufbau prüft sich jetzt selbst (13 Tabellen), danach schlagen alle drei
   Gegenproben an.
6. **Ein `update … returning` in psql meldete Erfolg, obwohl nichts geschah.** psql hängt
   IMMER seinen Befehlszähler an, auch mit `-tA` — die Ausgabe `UPDATE 0` ist nicht leer.
   **Gefunden nur dadurch, dass derselbe Aufruf ZWEIMAL gemacht wurde.** Jetzt
   `with … select`.
7. **Der Wächter im Werkzeug prüfte EINE Datei, während drei geladen wurden** — der Lauf
   starb trotzdem an `ERR_MODULE_NOT_FOUND`, weil der Import in `auth/konto.ts` stand.
   Das war zugleich der Grund, `handleText()` nach `lib/handle.ts` zu legen.

✅ **Was 20.7 noch NICHT war — handeln — ist seit dem 2026-09-13 abends gebaut
(20.7-b, siehe oben).** Hier stand, `posts_loeschen` lasse nur den Autor durch, auf
`profiles` gebe es kein delete und `konto_loeschen()` nehme **absichtlich keine ID**.
Alle drei Messungen stimmen unverändert — **der Weg geht nicht durch sie hindurch,
sondern daneben:** `konto_entfernen(wen)` ist eine EIGENE Tür (kein `grant`, nur über
die db-url), und `konto_loeschen()` nimmt weiter keinen Parameter, so wie der Wächter
in 0009 es verlangt.

❓ **Eine Auslegung wartet auf Ian, als `TODO(Ian)` im Code:** `meldungLage()` — was
steht in der Liste, wenn ZU SPÄT bearbeitet wurde? Die Einzelmeldung nennt die
Verspätung schon („46 h nach der Zusage"), die Fußzeile zählt sie nicht. **Damit kann das
Werkzeug heute nicht sagen, wie oft die Zusage gebrochen wurde** — und das ist die Zahl,
auf die es gegenüber Apple ankommt. PLAN.md Abschnitt 6, Punkt 60.

🔴 **DIE APP FÜR DEN GERÄTEDURCHGANG IST GEBAUT (2026-09-13) — sie wartet auf Ians
iPhone, und mehr fehlt nicht.** Der Schalter steht auf `'supabase'`, das Binary liegt
fertig da, gültig bis **2027-09-13** (`TimeToLive: 365`). **Für Ian ist es ein
Befehl:**

    cd ~/Desktop/C.C.Projekts_Ian/33_SimplySocial/simplysocial && npm run geraet

iPhone anstecken (oder gleiches WLAN) und **entsperrt lassen** — der Build ist
inkrementell **in 20 Sekunden** durch, danach wird nur installiert. Was dann zu
probieren ist, steht in `_FUER_IAN/HANDY_DURCHGANG.md`, Durchgang 3.

**Und der Schalter war nie der Blocker — das ist bis heute zusammengeworfen worden.**
`npm run deploy` und `npm run geraet` sind zwei Befehle; die öffentliche Adresse
bekommt ihren Stand ausschließlich aus dem ersten (harte Regel 35). Umgelegt, gebaut,
gemessen — **die Webseite ist unberührt, nachgemessen byte-identisch.**

Gemessen: `tsc` sauber in **beiden** Schalterstellungen · **81 Lint-Probleme wie
vorher** · `pruef-anbieter` **48** · `pruef-sitzung` **29** · `pruef-bildwahl` **35** ·
Prototyp auf 390 × 844 **byte-identisch** mit `aq01` UND `ap01` (`ar01`, md5 gleich) ·
Bundle-Schalter am gebauten Binary nachgemessen. Sechs Dinge:

1. **Der teuerste Fund ist eine Zeile, zu der `tsc` GESCHWIEGEN hat — und sie hätte
   die Anleitungskarte spurlos gelöscht.** `anleitungGesehen()` ging von `boolean` auf
   `Promise<boolean>`, und in `(tabs)/index.tsx` stand weiter
   `if (!anleitungGesehen()) setAnleitung(true);`. **Ein Promise ist immer truthy**,
   `!promise` ist immer `false`, der Zweig lief nie — auf BEIDEN Plattformen, und
   `npx tsc --noEmit` gab **0** zurück. Dieselbe Familie wie
   `undefined > BILD_MAX_BYTES` (harte Regel 91) und `string | null` in JSX (20), und
   die übelste Sorte davon: **Sie zeigt sich als ABWESENHEIT.** Der Wächter dagegen
   steht seit heute in `eslint.config.js` (`no-misused-promises`, type-aware);
   gegengemessen **83 statt 81**, mit der Stelle im Klartext.
2. **Die zweite Messung wäre fast selbst ein Fehlschluss geworden, und zwar wegen
   HERMES.** Um zu belegen, dass wirklich `'supabase'` im Binary steckt, wurde nach
   Textmarken gesucht — „Es gibt keinen Login" kam **null** mal vor, und das sah nach
   Wegoptimierung aus. **Es war die Kodierung:** Hermes legt reine ASCII-Strings als
   Latin-1 ab und jeden String mit einem Nicht-ASCII-Zeichen als **UTF-16**. Ein
   Gedankenstrich genügt. In UTF-16 gesucht ist der Satz **da**. Der richtige Marker
   („im Prototyp noch ohne Funktion") ist in **beiden** Kodierungen weg — erst das ist
   der Beleg. `scripts/bundle-schalter.py` sucht seither immer in beiden.
3. **Und genau diese Messung fehlte in `geraet-bauen.sh`.** Es prüft seit dem 11.09.
   das eingebettete Profil, weil *„BUILD SUCCEEDED"* die Frage *„gilt sie ein Jahr?"*
   nicht beantwortet — und beantwortete die Frage *„kann man sich damit anmelden?"*
   genauso wenig. **Der Anlass war ein eigener Fehler:** Während der 20 Minuten wurde
   `anmeldung.ts` für Gegenproben mehrfach umgestellt. Es ist gutgegangen (das
   JS-Bundling läuft am App-Target, lange nach den Pods), aber verlassen kann man sich
   darauf nicht. Jetzt wird das Bundle gegen die QUELLE gehalten, nicht gegen einen
   festen Wert.
4. **Ians Entscheidung 56 hat ein WARNSIGNAL weggenommen — deshalb steht seit heute
   ein Wächter in `deploy.sh`.** Der Prototyp-Hinweis erscheint nur noch bei
   `'attrappe'`; sein Text behauptet mit `'supabase'` **dreimal** etwas Falsches
   (erfundene Namen, kein Login, Neuladen setzt zurück). **Sein Wortlaut ist um kein
   Zeichen angefasst** (harte Regel 22), er bekam eine Bedingung. Der Preis: Ein
   versehentlicher Deploy mit umgelegtem Schalter sähe seither **sauber aus** statt
   offensichtlich kaputt — und läge mit echten Daten auf einer Adresse, die per
   WhatsApp weitergeht. Der Wächter bricht ab, bevor irgendetwas gebaut wird;
   gegengemessen in beiden Stellungen.
5. **Eine Schuld mit eigenem Fälligkeitsdatum ist eingelöst (Entscheidung 57).** Im
   Kopf von `PrototypHinweis.tsx` stand seit Phase 13: *„auf Native gibt es kein
   `sessionStorage` … als Vollbild ist es eine Wand vor jeder Sitzung. Gelöst wird es
   in Phase 20.3."* Die Bausteine liegen seit dem 12.09. im Binary, **der Tausch war
   nie gemacht** — die Anleitungskarte wäre am iPhone bei JEDEM Start gekommen. Jetzt
   `lib/merker.ts` / `.native.ts`: im Browser `sessionStorage` (pro Tab, die alte
   Begründung stimmt dort weiter), am Gerät `AsyncStorage` (für immer). **Und NICHT
   der Schlüsselbund** — der überlebt auf iOS das Löschen der App; wer sie wegwirft und
   neu installiert, bekäme die Anleitung nie wieder.
6. **Der Prüfstand `96_anbieter.sh` setzte einen REPO-ZUSTAND voraus und meldete beim
   Umlegen 12 Kreuze, von denen keines ein Fehler war.** Schlimmer war, was dabei
   NICHT anschlug: Sein Wächter fragte `grep -q "= 'supabase';"` an der erzeugten
   Datei — steht im Repo schon `'supabase'`, ist das trivial wahr, die zwei Fassungen
   sind **identisch**, und der zweite Block misst denselben Code noch einmal. **Genau
   der Zustand, vor dem der Wächter warnen sollte**, und sein eigener Kommentar
   beschrieb ihn wörtlich. Jetzt werden beide Fassungen erzwungen und per `diff`
   gegeneinander gehalten; in beiden Stellungen **48 Häkchen**.

⚠️ **Was das NICHT ist: am Gerät geprüft.** Apple-Dialog, Google-Fenster, Bildwähler
und ob der Schlüsselbund die 14 Byte über einen Neustart trägt — vier ungeprüfte
Sachen, und **keine davon kann ein Mac beantworten.**

✅ **Erledigt am 13.09.: das Testkonto ist weg.** `ian.fhorak+neuzugang@gmail.com`
(nie eingelöst, kein Profil, keine Posts, nie eingeloggt — alles vor dem Löschen
gemessen). In `auth.users` steht jetzt **nur noch Ians Konto**.

✅ **Phase 20.3-b2 ist FERTIG (2026-09-13): man kann sich mit APPLE und GOOGLE
anmelden — und es hat weder einen neuen Baustein noch einen neuen Build noch einen
weiteren Handgriff von Ian gekostet.**

Hier stand seit dem 12.09.: *„die fünf Bausteine sind drin, der Code fehlt noch — und
EINE Sache wartet auf Ian."* Beides ist erledigt. Die sieben Felder hat Ian in der
Nacht auf den 13.09. über die **Management-API** eintragen lassen statt im Dashboard
(`npm run mgmt-token` + `npm run provider-api`), und heute gemessen an derselben
Stelle, an der am 13.09. um 00:30 noch `apple: false` stand:

    apple: true   google: true   email: true      ← /auth/v1/settings, live

**Alle Konten stehen:** Supabase · Apple (Key-ID `F2M3N3K9M5`) · Google (beide
Clients) · Brevo. Sechs Zugänge in `~/.simplysocial/` (600), keiner im Repo.
🔑 **Der Management-Token gehört widerrufen** — er darf alles im Supabase-Konto und
wird nie wieder gebraucht (`https://supabase.com/dashboard/account/tokens` → Revoke).

Gemessen: `tsc` sauber · **81 Lint-Probleme wie vorher** · `npm run pruef-anbieter`
**48 Häkchen, kein Kreuz** · Prototyp auf 390 × 844 **Pixel für Pixel identisch**
(`aq01` gegen `ap01`, **0** abweichende Pixel) · 360 × 600 Überlauf **0** · null
Konsolenfehler · Web-Bündel **494.960 B gzip**. Sechs Dinge:

1. **Der teuerste Fund ist ein NONCE, den es nicht gibt — und er hätte NUR am Gerät
   zugeschlagen.** Zwei Zeilen fremder Quelltext: `expo-apple-authentication` macht in
   `ios/AppleAuthenticationRequest.swift` Zeile 31 `request.nonce = options.nonce` —
   es **reicht durch und hasht nicht**; `auth-js` sagt in `types.d.ts` Zeile 639, es
   vergleiche *„the HASH of this value"*. Wer denselben Rohwert an beide gibt, bekommt
   `invalid_id_token` — eine Absage, die nach einem kaputten Schlüssel aussieht, und
   man sucht tagelang am Key. Richtig wäre gehashter Wert an Apple, roher an Supabase.
   **Nur ist von hier aus nicht nachprüfbar, WIE Supabase hasht** (hex oder base64url),
   und ein geratenes Format scheitert ausschließlich auf einem fremden iPhone. Also
   **kein Nonce bei Apple** — der Weg, den Supabase selbst dokumentiert — und bei
   Google stattdessen **PKCE**, derselbe Schutz ohne ungeprüftes Format. Harte
   Regel 93.
2. **Apple im Browser ist nicht „noch nicht", sondern NIE.** Apples Client-ID in
   Supabase ist die Bundle-ID `at.simplysocial.app`, eine NATIVE Kennung; Apples
   Web-Anmeldung verlangt eine eigene *Services ID*. Ein Apple-Knopf im Browser wäre
   ein Knopf, der lügt. Deshalb hat `anmeldeFolgen()` seit heute einen zweiten
   Parameter (`AnbieterLage`), **Pflicht und nicht `?`** — mit einem optionalen Feld
   wären alle Aufrufstellen stumm durchgelaufen (dieselbe Technik wie `meinOrt` in
   `SortKontext`, 19h-2). Harte Regel 94.
3. **Der naheliegende Google-Weg hätte einen neuen Handgriff von Ian gekostet.**
   `signInWithOAuth()` wäre eine Funktion für beide Anbieter gewesen — sein Rücksprung
   ginge aber DURCH Supabase (`simplysocial://…`) und müsste in Supabases
   Erlaubnisliste stehen. Das ist ein Dashboard-Feld, und der Management-Token dafür
   ist widerrufen. `signInWithIdToken()` braucht davon nichts.
4. **Eine reine Funktion lag in der falschen Datei, und das war mein eigener Fehler.**
   `googleRueckweg()` rechnet aus der Client-ID Googles Rücksprung-Schema. Ich hatte
   sie zwischen die nativen Importe geschrieben — damit wäre sie **nur am Gerät
   prüfbar** gewesen, genau der Fehler, vor dem `95_sitzung.sh` in seinem eigenen Kopf
   warnt. Ein falsches Zeichen ergibt `redirect_uri_mismatch`, in einem Browserfenster,
   auf einem fremden iPhone. Jetzt in der importfreien Regel-Datei, drei Häkchen messen
   sie.
5. **Ein ABBRUCH ist kein Fehler und musste eine eigene Zusage werden.**
   `anbieterFehlerText('abgebrochen')` gibt **`null`** zurück, und dann steht nichts auf
   dem Bildschirm. Wer den Apple-Dialog wegwischt, hat entschieden; eine rote Zeile
   behauptet, es sei etwas schiefgegangen — dieselbe Familie wie „Noch nichts los in
   deinem Feed" bei einem Netzausfall.
6. **Apples Name kommt EINMAL im Leben.** Steht wörtlich im Paket: *„you will only
   receive Apple Authentication Credentials the first time users sign into your app"*
   — ab der zweiten Anmeldung ist `fullName` `null`, auch nach dem Neuinstallieren. Er
   reist durch die Sitzung (`{ zustand: 'neu'; …; name?: string }`) ins Namensfeld des
   Bildschirms fürs erste Konto. ⚠️ **Das Vorausfüllen ist eine AUSLEGUNG von
   Entscheidung 44 und wartet auf Ians Urteil**; die Korrektur wäre `useState('')`.

**Und der Prüfstand misst BEIDE Schalterstellungen — das ist der Entwurf an
`96_anbieter.sh`.** Mit `ANMELDE_QUELLE = 'attrappe'` geben alle drei Wege
`bereit: false` zurück; die ganze neue Regel wäre unsichtbar, und ein grüner Lauf hätte
nichts gemessen (die 18d-Lehre). Also wird `anmeldung.ts` zweimal nach JS gebracht,
einmal mit `'supabase'` an dieser einen Stelle, in einem Wegwerf-Ordner — **das Repo
unberührt**, und ein Wächter belegt, dass die Ersetzung gegriffen hat.

⚠️ **Was 20.3-b2 NICHT ist: am Gerät geprüft.** Ob Apple seinen Dialog zeigt, ob
Googles Fenster aufgeht und ob Supabase die zwei Ausweise annimmt, kann kein Mac
beantworten. Gehört in denselben Durchgang wie der Bildwähler aus 20.6-b.

⚠️ **Und der Schalter steht weiter auf `'attrappe'`.** Umlegen hieße heute einen
Prototyp-Hinweis, der „Es gibt keinen Login" behauptet, während es drei gibt — **der
Satz ist Ians** (harte Regel 22). Dazu stünden auf der öffentlichen Adresse zwei
gesperrte Knöpfe mit „Geht nur in der App am Handy".

✅ **Die GETEILTE SITZUNG ist fertig (2026-09-13) — das `TODO(Ian)` ist weg.**
`expo-secure-store` + `AsyncStorage` sind verdrahtet (Ians Entscheidung 55: der
14-Byte-Dauerschlüssel in den Schlüsselbund, die 2459 Byte Ausweis in eine gewöhnliche
Datei), und `zusammensetzen()` in `features/auth/sitzungsspeicher.ts` steht.
**Ians Wahl an der offenen Stelle: A — NACHSEHEN, nicht glauben.** Der Datei-Teil wird
geprüft, bevor ihm der Schlüssel beigelegt wird; was kein Sitzungs-Objekt ist, gilt als
abgemeldet. `npm run pruef-sitzung` meldet **29 statt 22 Häkchen, kein Kreuz**, `tsc`
sauber, **81 Lint-Probleme wie vorher**. **Zwei Dinge waren teurer als die Funktion, und
beide betrafen den PRÜFSTAND:**

1. **Er verlangte eine Reihenfolge, die KEINE Fassung liefern kann.** `pruef()`
   vergleicht `JSON.stringify(ist) === JSON.stringify(soll)` — bei einem Objekt hängt das
   an der Feldreihenfolge. Drei Zeilen darüber stand wörtlich das Gegenteil (*„verglichen
   wird das GEPARSTE … die Reihenfolge ist ohne Bedeutung"*): Kommentar und Code waren
   auseinandergelaufen, harte Regel 83 in einer Prüfdatei. **Und die alte Ordnung ist
   nicht wiederherstellbar** — `aufteilen()` LÖSCHT `refresh_token` aus dem Datei-Teil,
   und die Schwesterprüfung eine Zeile darüber verlangt genau das. Behoben mit
   `kanonisch()` an dieser einen Stelle; `pruef()` bleibt sonst streng.
2. **Ians Entscheidung war von KEINER Prüfung bewacht — gemessen, nicht vermutet.**
   Variante B (den Schlüssel ungeprüft in den Dateitext schreiben) bestand alle 24
   Häkchen. Die nächste „Vereinfachung" hätte A also still zurückgenommen. Die fehlende
   Gegenprobe ist drin (Tresor heil, Datei kaputt → abgemeldet), **B fällt jetzt mit 5
   Kreuzen durch.** Und der Fall ist nicht ausgedacht: `setItem()` legt bei einer Sitzung
   ohne Dauerschlüssel erst einen LEEREN Text in die Datei und löscht erst danach den
   Tresor — ein Absturz dazwischen hinterlässt genau diese Lage.

⚠️ **Was daran NICHT geprüft ist: das Gerät.** Ob der iOS-Schlüsselbund die 14 Byte
annimmt und ob sie einen Neustart überleben, kann kein Mac beantworten. Gehört in
denselben Durchgang wie Apple, Google und der Bildwähler.

⚠️ **Ein Testkonto liegt in `auth.users`:** `ian.fhorak+neuzugang@gmail.com`, am
12.09. angelegt, um die *Confirm-signup*-Vorlage zu prüfen. Nie eingelöst, also ohne
Profil. **Gehört gelöscht.**

✅ **Phase 20.6-b ist fertig (2026-09-13): man kann am HANDY ein Bild aussuchen — und
sie hing NICHT an Ians Supabase-Klick.** Hier stand, der Bildwähler gehöre „in denselben
Build wie 20.3-b2". Der Build ist seit dem 12.09. nachts gemacht; **die sieben Felder im
Dashboard, auf die 20.3-b2 wartet, braucht `expo-image-picker` gar nicht — es redet mit
iOS, nicht mit Supabase.** Eine neue Entscheidung von Ian (**54**: der Ausschnitt), zwei
neue Dateien (`lib/base64.ts`, `lib/bild-waehlen-typen.ts`), ein neuer Prüfstand
(`npm run pruef-bildwahl` — **35 Häkchen, kein Kreuz**, ohne Gerät und ohne Datenbank).
`tsc` sauber, **81 Lint-Probleme wie vorher**, lokal weiter **136 Häkchen**,
`pruef-bilder` **32 statt 27 am ECHTEN Server**, Prototyp auf 390 × 844 **Pixel für
Pixel identisch** (`ap01` gegen `ao01`, 0 abweichende Pixel). **+1.689 B gzip (+0,34 %)**
auf 495.765 B. Fünf Dinge:

1. **Der teuerste Fund: `uri` ist HEIC, `base64` ist JPEG — und `image/heic` ist
   verboten.** Gemessen in `expo-image-picker/ios/ImageUtils.swift`: Zeile 147 gibt für
   ein HEIC-Foto `rawData` mit `.heic` zurück; Zeile 206 sagt, base64 werde *„always
   JPEG regardless of the source file's original format"*. `BILD_TYPEN` kennt nur JPEG,
   PNG und WebP. **Der naheliegende Weg — Datei über `uri`, Typ aus `asset.mimeType` —
   hätte JEDEM gewöhnlichen iPhone-Foto die Absage „Das geht nur als JPG, PNG oder
   WebP" gegeben.** Nicht der Rand, der Normalfall — dieselbe Familie wie „wer nie ein
   Profilbild hatte" in 20.6-c. Harte Regel 90.
2. **Ein `Blob` funktioniert auf React Native nicht, und das steht wörtlich in der
   Bibliothek.** `storage-js` schreibt an seinem `upload`: *„For React Native, using
   either `Blob`, `File` or `FormData` does not work as intended."* Dreißig Zeilen
   darüber steht der Mechanismus — ein `Blob` wird in `FormData` gewickelt, alles
   andere geht als roher Rumpf hinaus, **und nur dort setzt storage-js `content-type`
   und `cache-control` als HEADER.** **Beide Probleme haben dieselbe Lösung:**
   `base64: true`. Harte Regel 91.
3. **Und der Geräte-Weg ist vom Mac aus MESSBAR — das war nicht vorherzusehen.**
   `storage-js` entscheidet am TYP des Inhalts, nicht an der Plattform; ein
   `Uint8Array` aus Node nimmt denselben Zweig wie ein iPhone. Fünf neue Häkchen in
   `80_bilder.mjs`, darunter: **`cacheControl` überlebt den anderen Zweig** (Ians
   Entscheidung 51). Ungeprüft bleibt allein der Dialog davor.
4. **`bytes` steht im Typ AUSDRÜCKLICH, und das ist die wichtigste Zeile der Phase.**
   Der Screen fragte `wahl.datei.size`. Ein `Uint8Array` hat kein `.size` — und
   `undefined > BILD_MAX_BYTES` ist **`false`**. Die Größenprüfung wäre am Handy
   **still ausgefallen**. Aus demselben Grund trägt `Bilddatei` ein getrenntes
   `vorschau`: Sonst hätte der Attrappen-Zweig `URL.createObjectURL()` auf ein
   `Uint8Array` angewendet — und am Gerät steht `ANMELDE_QUELLE` weiter auf
   `'attrappe'`. **`uri` ist zum Anschauen richtig und zum Hochladen falsch.**
5. **Der eigene Prüfstand hing am Zufall, und das war der lehrreichste Fund.** Ein
   eingebauter Bit-Versatz fiel **nur bei Dateilängen auf, die durch 3 teilbar sind** —
   einer von drei Fällen, und er war bloß durch Glück unter den drei ausgewählten
   Belegen. **Ein gelöschter Beleg hätte gereicht, und der Lauf wäre grün bei kaputtem
   Dekoder gewesen.** Der Kommentar der ersten Fassung wusste es sogar schon
   (*„hängt an `size % 3`, nicht an der Größe"*), der Code daneben nicht. Harte
   Regel 92.

⚠️ **Was 20.6-b NICHT ist: am Gerät geprüft.** Erlaubnis-Dialog, Zuschneide-Fenster und
die echte Dateigröße bei `BILD_QUALITAET = 0.8` brauchen ein iPhone mit echten Fotos.
Die 0,8 ist begründet, aber **nicht nachgemessen** — sie gehört in denselben Durchgang
wie Apple und Google.

✅ **Phase 20.6-c ist fertig (2026-09-12): der Lösch-Knopf LÖSCHT — nach vier Wochen,
in denen er nichts tat.** Seit Phase 7 stand `/account-loeschen` da und sagte beim
letzten Klick selbst, dass nichts passiert; das war richtig, solange es kein Konto gab.
Jetzt ruft er `konto_loeschen()` wirklich auf. Zwei Entscheidungen von Ian (**52**: raus
mit Quittung · **53**: den Preis benennen), gebaut in `loeschVorgang()`
(`features/safety/hooks.ts`). `npm run pruef-bilder` — **27 statt 24 Häkchen, kein Kreuz
am ECHTEN Server**, danach ist die Datenbank sauber. `tsc` sauber, **81 Lint-Probleme
wie vorher**, lokal weiter **136 Häkchen**, Prototyp auf 390 × 844 **Pixel für Pixel
identisch** (`ao01` gegen `an01`, 0 abweichende Pixel). Vier Dinge:

1. **Der teuerste Fund ist ein Fall, den die Entscheidung gar nicht kannte: WER NIE EIN
   BILD HATTE.** `loeschVorgang()` räumt immer zuerst das Bild weg (`BILD_ZUERST`, harte
   Regel 89). Ohne eine zusätzliche Frage bekäme damit **jeder ohne Profilbild** den Satz
   *„dein Profilbild ist aber schon entfernt"* — eine Auskunft über einen Verlust, den es
   nie gegeben hat, dieselbe Familie wie „Noch nichts los in deinem Feed" bei einem
   Netzausfall. **Und das ist heute nicht der Rand, sondern der Normalfall:** Am Handy
   lässt sich bis 20.6-b überhaupt kein Bild aussuchen. Gelöst mit `hatteBild`, gelesen
   **vor** dem Entfernen — danach steht dort in jedem Fall `null`. ⚠️ **Das ist eine
   AUSLEGUNG von Entscheidung 53 und wartet auf Ians Urteil** (PLAN.md Abschnitt 6,
   hinter Punkt 53); die Korrektur wäre ein Wort.
2. **Die zweite Messung war die wichtigere, und sie betrifft eine Apple-Pflicht:
   `profilbildEntfernen` läuft auch dann durch, wenn gar kein Bild da ist.** Hätte es
   geworfen, wäre das Konto **UNLÖSCHBAR** gewesen — und zwar für genau die Mehrheit aus
   Punkt 1. Gemessen in `80_bilder.mjs`, nicht geschlossen.
3. **Der Fall „Schritt 1 scheitert" braucht keine Variable, sondern das Fehlen eines
   `try`.** Geht das Bild-Entfernen schief, verlässt sein `SchreibFehler` die Funktion
   ungefangen: Es ist dann nichts passiert, der Fehler trägt keinen Zusatz, die Leiste
   behauptet keinen Schaden. Der frühe Ausstieg IST die Antwort — eine mitgeschriebene
   `bildSchonWeg`-Variable wäre die umständlichere Fassung davon.
4. **`SchreibFehler` führt seinen `grund` jetzt MIT.** Er stand vorher nur im
   Konstruktor und wurde in die `message` eingebaut; um einen Fehler mit Zusatz
   nachzubauen, hätte man die Meldung verschachteln müssen. Eine Lockerung, kein
   Verhalten — und sie steht nicht auf dem Bildschirm (der Fund vom 2026-09-03).

⚠️ **Was 20.6-c NICHT ist: im Prototyp sichtbar.** `LIEST_AUS_SUPABASE` ist dort `false`,
und `kontoLoeschen()` kehrt vorher mit `'prototyp'` um — der Screen sagt weiter „Hier
wäre Schluss". Das ist Absicht und die einzige Stelle, an der die Abfrage VOR dem
Schreibvorgang steht statt darin: Im Prototyp-Zweig meldete `schreibVorgang` brav
„erfolgreich", darunter liefe `hinausNachLoeschen()`, und die öffentliche Adresse stünde
auf dem Anmelde-Bildschirm mit der Quittung „Dein Konto wurde gelöscht" — hinein käme
niemand mehr.

✅ **Der erste DURCHGANG mit echten Daten ist gemacht (2026-09-12 abends) — und im
ungeprüften Teil von 20.5 lag ein Fehler, der jeden Benutzer bei JEDER FREMDEN
NACHRICHT aus dem Bildschirm geworfen hätte.** Hier stand am Nachmittag, der
`'supabase'`-Zweig von `schreibVorgang()` und Ians Entscheidung 47 seien „typgeprüft,
aber niemand hat sie laufen sehen", und das gehöre beim Umlegen als Erstes angeschaut.
**Angeschaut — ohne auf 20.3-b2 zu warten**, weil man den Schalter zum MESSEN nicht
dauerhaft umlegen muss. Gemessen: `tsc` sauber, **81 Lint-Probleme wie vorher**, lokal
**124 Häkchen**, `pruef-lesen` 29 · `pruef-konto` 29 · `pruef-schreiben` 49, Prototyp
auf 390 × 844 **Pixel für Pixel identisch** (`am01` gegen `al01`, Unterschieds-Rechteck
`None`). Die echte Datenbank stand danach wieder auf **einem Konto — Ians —, sonst
nichts.** Belege `am01`–`am06`, alles in PLAN.md 5b unter „20.5-c". Sechs Dinge:

1. **Der teuerste Fund braucht KEINEN Tastendruck.** Ian steht auf `/post/…` und rührt
   sich nicht; *Lea* schreibt in einen ganz anderen Chat. Ergebnis: Bildschirmtext
   **204 → 12** (~240 ms leer), Adresse `/post/…` → **`/account-loeschen`** → `/`.
   `datenHolen()` setzte **immer** `laden: { zustand: 'laeuft' }`, der Torwächter
   zeichnet dann `null` statt des `Stack` — also baute **jeder der 24 Schreibvorgänge
   und jeder Realtime-Anstoß den ganzen Navigator ab.** `/account-loeschen` ist
   alphabetisch die erste Route unter `app/`: **die Falle aus Phase 20.3-a an einer
   zweiten Stelle.** Behoben mit einem vierten Glied (`'nachladen'`) und einer
   Regel-Funktion mit `never` — harte Regel 87.
2. **Die richtige Frage stand schon in derselben Datei, DREI ZEILEN darüber.** Der
   Kommentar an `useStartFlaecheWeg`, am selben Tag geschrieben: *„Die Frage ist nicht
   ‚sind die Daten da?', sondern ‚steht etwas zum Anschauen?'"* — und der Torwächter
   eine Zeile weiter unten stellte sie nicht. Harte Regel 73: Eine Regel, deren GRUND
   wegfällt, hinterlässt ihre Wirkung.
3. **Ausgerechnet Ians NEUESTE Entscheidung wäre der zuverlässigste Auslöser gewesen.**
   Entscheidung 47 läuft gemessen genau richtig (ruhend 0 Abfragen · Weggehen **0** ·
   Hervorholen **1**) — ohne den Fix hätte jedes Zurückkommen aus WhatsApp den Menschen
   auf den Startbildschirm geworfen.
4. **Alles andere am `'supabase'`-Zweig hält, und zwar zum ersten Mal sichtbar.**
   `"Moment …"` ist mit einem vorher aufgestellten `MutationObserver` gemessen, nicht
   gehofft. Das Konfetti kommt **nach** dem Server (`accepted`, `spots_filled` 0 → 1,
   neuer Chat-Faden, `/requests → push→/match` ohne Umschreibung). **Das Nachladen IST
   die Rücknahme** — mit einem erzwungenen `42501` belegt: Die Leiste sagt „Du bist
   nicht mehr angemeldet", und die Nachricht, die nicht durchkam, steht **nicht** im
   Chat. Realtime treibt die Oberfläche (die **1** am Anfragen-Tab ohne Neuladen). Und
   **RLS greift bis ins Bild**: Tobis Post fehlt im Feed, wegen des Blocks.
5. **Hineingekommen bin ich ohne Apple, ohne Google und ohne Postfach** — und die
   Methode ist wichtiger als der Weg: Konten mit Passwort säen (feste UUIDs, harte
   Regel 83), in Node **denselben Client mit einer Speicher-Attrappe** bauen und
   **nachsehen**, was `auth-js` wirklich ablegt (`sb-<ref>-auth-token`, schlichtes
   JSON), das Paar in den Browser legen. **Das Format wurde gemessen, nicht aus dem
   Bibliothekscode geschlossen** — die Realtime-Lehre vom selben Tag. Schalter
   vorübergehend um, nachweislich zurück (19d-Methode, `git diff`).
6. ✅ **Zwei Sachen waren keine Reparatur, sondern eine Wahl — und Ian hat beide noch
   am selben Abend entschieden (48 und 49).**
   **48: Die Fehlerleiste RÜCKT, sie überdeckt nicht.** Sie lag auf `top: 0`, also
   genau auf dem Zurück-Pfeil (`elementFromPoint` gemessen) — und widersprach damit
   ihrer eigenen Begründung im Dateikopf, die sagt, man könne weiterarbeiten. Nachher
   sitzt der Pfeil auf y = 114 (390) bzw. 92 (360) und wird getroffen. **Dabei kam
   heraus, was nicht angekündigt war:** Seit sie schiebt, kostet jede Zeile Platz —
   der alte Satz plus „Nochmal versuchen" ergaben **vier Zeilen**; beide gekürzt, jetzt
   zwei (`am09`, `am10`).
   **49: Vollbild beim ERSTEN Laden, leise Zeile beim NACHladen.** Genau die
   Nachbesserung, die `quelle.ts` selbst vorhergesagt hatte (*„sobald es etwas zu
   zeigen gibt, was schon da war"*) — und der Augenblick war mit `'nachladen'`
   eingetreten. Belegt: Netz gekappt, **die Chat-Liste blieb stehen**, darüber „Kein
   Netz — du siehst den letzten Stand." (`am08`). Beim Bauen fiel eine Falle an, die
   keine Prüfung gefunden hätte: Der nächste Versuch fragte `=== 'da'` und hätte bei
   `'fehler-nachladen'` ausgerechnet über „Nochmal" den Bildschirm abgerissen, den die
   Zeile gerade gerettet hat — jetzt `stehtSchonEtwas()`, abgeleitet aus
   `ladeSichtFuer()` statt als zweiter `switch` (harte Regel 53).
   **Auch danach ist der Prototyp Pixel für Pixel identisch** (`am07` gegen `al01`
   UND gegen `am01`).
7. ⚠️ **Eine Sache ist im Browser prinzipiell nicht zu belegen und gehört aufs Gerät.**
   Trägt die Leiste den oberen SafeArea-Rand, darf der Screen darunter ihn nicht noch
   einmal nehmen (die ACTA-Falle „doppelter Inset"). **Auf Web ist `insets.top` null** —
   der Fehler träte erst auf Ians iPhone auf, dieselbe Lage wie in Phase 19i, diesmal
   vorher bedacht statt hinterher gemessen. Gelöst über `SafeAreaInsetsContext`
   (`OhneOberenRand` in `app/_layout.tsx`), **ungeprüft.**

✅ **Phase 20.6-a ist fertig (2026-09-12): die App kann PROFILBILDER — Darias Wunsch,
seit Phase 15 vorbereitet.** `npm run pruef-bilder` — **24 Häkchen, kein Kreuz am
ECHTEN Server**, danach ist die Datenbank sauber. Zwei neue Entscheidungen von Ian
(**50**: der Bucket ist offen · **51**: fünf Minuten Zwischenlager), eine neue Migration
(`0008_bilder.sql`), eine neue Regel-Datei (`features/social/bild.ts`). `tsc` sauber,
**81 Lint-Probleme wie vorher**, lokal **136 statt 124 Häkchen**, `pruef-schreiben`
**50 statt 49**, Prototyp auf 390 × 844 **Pixel für Pixel identisch** (`an01` gegen
`am07` UND gegen `al01`). **+2.702 B gzip (+0,55 %)** auf 493.492 B — darin steckt auch
20.5-c, das nie gemessen wurde. Sechs Dinge:

1. **Der teuerste Fund ist eine ABWESENHEIT: `storage.objects.owner` hat KEINEN
   Fremdschlüssel auf `auth.users`.** Gemessen; der einzige FK zeigt auf
   `storage.buckets`. Ein gelöschtes Konto lässt seine Bilder liegen — und bei einem
   OFFENEN Bucket bliebe das Profilbild damit **nach dem Kontolöschen im Netz
   abrufbar**. Ians Entscheidung 39 („alles mit") hätte für Bilder still nicht
   gegolten; es gibt keine Fehlermeldung für eine Datei, die zu viel da ist.
2. **Der naheliegende Fix war falsch, und LOKAL war er grün — die Attrappen-Falle mit
   umgekehrtem Vorzeichen.** 0008 bekam zuerst ein `delete from storage.objects` in
   `konto_loeschen()`. Am echten Server: *„Direct deletion from storage tables is not
   allowed. Use the Storage API instead."* Supabase hängt dort einen `before
   delete`-Trigger hin (`storage.protect_delete`). **Damit war ausgerechnet
   `konto_loeschen()` kaputt — die Funktion hinter einer Apple-1.2-Pflicht.** Bisher
   war die Attrappe immer STRENGER als das Original (0007); hier war sie **schwächer**,
   und das ist die gefährlichere Richtung. Der Trigger steht jetzt wortgleich in
   `00_supabase_lokal.sql`.
3. **Eine Migration, aus der man eine Zeile HERAUSNIMMT, nimmt sie am Server nicht
   zurück.** Nach dem Berichtigen trug Ians Datenbank weiter die kaputte Fassung. 0008
   setzt `konto_loeschen()` deshalb ausdrücklich auf den 0003-Stand zurück, und ein
   Wächter am Dateiende bricht ab, wenn dort je wieder `storage.objects` auftaucht.
4. **Der zweite Fund ist eine Zahl, und aus ihr wurde Entscheidung 51.** `bildFolgen()`
   versprach „sofort weg". Gemessen: Das CDN liefert eine gelöschte Datei bis zu eine
   Stunde weiter (`cf=HIT`, `max-age=3600`), während sie mit Cache-Buster schon `400`
   gibt. **Die Datei ist weg, die Adresse antwortet trotzdem** — ein Satz, der lügt,
   dieselbe Familie wie „Noch nichts los in deinem Feed". Jetzt
   `BILD_CACHE_SEKUNDEN = 300`, und der Satz nennt die Zahl.
5. **In `storage` gibt es nur EINEN Riegel.** `anon` hat dort alle Rechte (dieselbe
   Voreinstellung, die 0007 für `public` weggenommen hat) — **weggenommen wird sie
   NICHT**, weil der Storage-Dienst selbst unter `authenticated` arbeitet. Offen ist
   nichts (RLS an, keine Policy für `anon`, `storage` über PostgREST nicht erreichbar),
   aber jede der vier Policies ist die ganze Absicherung ihrer Richtung.
6. **Drei eigene Fehler, alle am MESSGERÄT.** `getBucket()` meldet einem gewöhnlichen
   Nutzer *„Bucket not found"*, wo *„du darfst ihn nicht sehen"* gemeint ist; die
   `delete`-Policy ist per SQL gar nicht prüfbar, weil der Trigger VOR RLS läuft; und
   der Wächter fragte die Prüf-Gruppe nicht ab, obwohl sie seit Entscheidung 41 ihren
   Gründer überlebt.

✅ **Was 20.6-a noch NICHT war — der Bildwähler am Gerät — ist seit dem 2026-09-13
gebaut (20.6-b, siehe oben).** Hier stand, er gehöre „in denselben Build wie 20.3-b2".
Der Build ist gemacht; **den Supabase-Klick, auf den 20.3-b2 wartet, brauchte er nie.**
Im Browser lief der Upload schon vorher vollständig.

⚠️ **Und eine Lücke ist benannt UND gemessen:** Bricht die App zwischen „Bild wegräumen"
und `konto_loeschen()` ab, bleibt das Bild liegen. Am Server gibt es dagegen kein Netz,
solange die einzige Alternative das Umgehen eines fremden Sicherheitstriggers ist. Wer
den Lösch-Screen anschließt (er ruft `konto_loeschen()` bis heute gar nicht), setzt
`profilbildEntfernen()` DAVOR.

✅ **Phase 20.5 ist FERTIG (2026-09-12): die App SCHREIBT wirklich nach Supabase — und
der Prototyp merkt davon nichts.** Alle 24 Schreib-Aktionen gehen über `data/senden.ts`;
zwei neue Entscheidungen von Ian (**46**: wie sich ein Knopf beim Schreiben verhält ·
**47**: Nachladen beim Hervorholen), zwei neue Migrationen. `npm run pruef-schreiben` —
**49 Häkchen, kein Kreuz am ECHTEN Server**, danach ist die Datenbank wieder sauber.
Lokal **124 statt 121 Häkchen**, `pruef-lesen` und `pruef-konto` weiter 29/29, `tsc`
sauber, **81 Lint-Probleme wie vorher**, Prototyp auf 390 × 844 **Pixel für Pixel
identisch**. Preis: **+3.920 B gzip (+0,80 %)** auf 490.790 B. Sieben Dinge sind
wichtiger als die 24 Aktionen:

1. **Der teuerste Fund war eine ZUSAGE, die am echten Server NIE GALT.** Der Fuß von
   `0002_policies.sql` ist eine Rechteliste, und auf ihr steht das halbe Gebäude dieses
   Projekts — harte Regel 55, harte Regel 70, die Begründung für die sieben Funktionen
   in 0004. Gemessen: `group_members` lokal **SELECT**, echt
   **DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE**. Supabase trägt für
   `public` eine Voreinstellung (`alter default privileges`), die jeder neuen Tabelle
   ALLE Rechte an `anon` und `authenticated` gibt; unsere `grant`-Zeilen kommen danach
   und fügen nur hinzu. **Offen war deswegen nichts** — RLS weist auch mit Grant ab.
   **Was sich unterscheidet, ist die ART der Abweisung, und die ist hier alles:** ein
   fehlender GRANT meldet `42501`, **laut**; eine fehlende POLICY liefert bei DELETE und
   UPDATE **null Zeilen ohne jeden Fehler — still.** Genau so ist es aufgefallen:
   `beitrittZuruecknehmen` löschte am echten Server nichts und meldete nichts. Behoben in
   `0007_rechte.sql`; nachgemessen **`anon` 0 Rechte, `authenticated` 34** an beiden Orten.
2. **Und die Attrappe war schuld, dass es niemand sah.** `00_supabase_lokal.sql` bringt
   die Voreinstellung jetzt MIT. Die Gegenprobe ist der Beleg: **Ohne 0007 sieht die
   Wegwerf-Datenbank seither genauso aus wie der echte Server vorher** — `anon` mit 91
   Grants. Die Attrappen-Falle vom 2026-09-06 in ihrer schärfsten Form.
3. **Die Rechteliste hat zum ZWEITEN Mal die Arbeitsliste geschrieben — diesmal fand sie
   eine LÜCKE.** `beitrittZuruecknehmen` hatte am Server gar keinen Weg: kein
   delete-Recht auf `group_requests`, und die einzige update-Policy lässt nur den
   Gründer durch. **Der Knopf steht seit Phase 17 in der App.** Harte Regel 70 verlangt
   dort die Frage *Zusage oder Lücke?* — bei `group_members` ist es eine Zusage, hier
   eine Lücke, weil die Schwestertabelle `join_requests` es kann. `0006_zuruecknehmen.sql`.
4. **„Zurückrollen" gibt es in dieser Phase NICHT, und das ist der Entwurf.** Der
   naheliegende Weg wären 24 Umkehrfunktionen gewesen — 24 Gelegenheiten, eine falsch zu
   schreiben. **Stattdessen wird NACHGELADEN: Das Nachladen IST die Rücknahme.** Damit
   sagt keine einzige Stelle voraus, was der Server tun wird — genau der Einwand, an dem
   Möglichkeit B gescheitert ist.
5. **Der wichtigste einzelne Knopf steht im Anfragen-Tab.** Er bestätigte UND sprang
   sofort aufs Konfetti. Am Server entscheidet `anfrage_bestaetigen()` mit
   `select … for update`; dass zwei gleichzeitige Bestätigungen ohne die Sperre BEIDE
   durchgehen, ist seit 20.5-SQL gemessen. **Ein Konfetti, das zurückspringt, wäre der
   übelste denkbare Fehler dieser App.**
6. **Drei Prüfungen sind beim Umbau ROT geworden, und das war ihr Zweck.** „anon bekommt
   HTTP 200 · und NULL Posts · RLS filtert, es verweigert nicht" — das stimmte aus dem
   falschen Grund (Punkt 1). `0002` enthält keine Zeile `to anon`; die Regel lautet
   **„anon kommt gar nicht erst heran"**, und seit 0007 gilt sie.
7. **Ein schreibender Prüfstand muss aufräumen, was er beim Start noch nicht kennt.**
   Der Server vergibt IDs. Besonders übel: eine Gruppe, die der Lauf gründet und dann
   VERLÄSST — danach ist `creator_id` vererbt oder `null`, und `52_abraeumen.sql` findet
   Gruppen über ihren Gründer. Nach Entscheidung 45 darf er auch nicht „alle Gruppen ohne
   Chef" löschen. Also schreibt `70_schreiben.mjs` **jede erzeugte ID sofort mit** — bei
   einem Sammeln bis zum Schluss wäre die Liste nach einem Abbruch leer, also genau dann,
   wenn man sie braucht.

⚠️ **Was 20.5 NICHT ist: der Schalter.** `ANMELDE_QUELLE` steht weiter auf `'attrappe'`;
das Umlegen hängt unverändert an 20.3-b2 und an dem Prototyp-Hinweis, der „Es gibt
keinen Login" behauptet (harte Regel 22, der Satz ist Ians).

⚠️ **Was an 20.5 NICHT geprüft ist, und zwar prinzipiell nicht — solange der Schalter
auf `'attrappe'` steht.** Die 49 Häkchen messen `data/senden.ts` **unmittelbar**, mit
einem echten Token gegen den echten Server. Was sie NICHT durchlaufen, ist der Weg
darüber:

- **Der `'supabase'`-Zweig von `schreibVorgang()`** — also der wartende Knopf
  („Moment …"), die Fehlerleiste und das Nachladen als Rücknahme. Er ist typgeprüft und
  im Prototyp nachweislich folgenlos (Pixel für Pixel identisch), aber niemand hat ihn
  laufen sehen.
- **Ians Entscheidung 47** (`useNachladenBeimHervorholen`). Der Haken kehrt bei
  `!LIEST_AUS_SUPABASE` sofort um; im Prototyp gibt es also nichts zu beobachten.

**Beides hängt am selben Nagel wie alles andere: an 20.3-b2.** Ohne echte Anmeldung
kein Token, ohne Token kein `LIEST_AUS_SUPABASE`. Das ist dieselbe Lage wie bei 20.4-b
(„der Schalter lässt sich erst mit 20.3-b umlegen") und kein Versäumnis dieser Phase —
aber es gehört beim Umlegen als Erstes angeschaut, nicht als Letztes.

🎉 **Die Anmeldung LÄUFT — Ian hat sich am 2026-09-12 mit seiner eigenen Mailadresse
am echten Supabase angemeldet.** Der erste echte Login in SimplySocial. Drei Befunde aus
dem Durchgang, zwei davon meine Fehler, und **alle drei hätten ausgerechnet jeden NEUEN
Nutzer getroffen**:

1. **Die erste Mail kam aus der FALSCHEN Vorlage.** Ian hatte „Magic link or OTP" auf
   `{{ .Token }}` umgestellt und bekam trotzdem einen Link: Es gab sein Konto noch
   nicht, also hat `signInWithOtp` ihn **registriert** — und dafür nimmt GoTrue die
   Vorlage **„Confirm signup"**. **Das Tückische ist die Verteilung:** Der Fehler tritt
   pro Mensch genau EINMAL auf, beim allerersten Mal. Wer selbst testet, sieht ihn
   einmal und hält ihn danach für behoben, während jeder Neue wieder hineinläuft.
   **Beide Vorlagen tragen jetzt `{{ .Token }}`.**
2. **Der Code hat ACHT Ziffern, mein Feld nahm sechs — und die App hat Ian für ihren
   eigenen Fehler beschuldigt.** Supabase lässt 6–10 zu (*Email OTP Length*), meine
   `maxLength={6}` war eine Annahme über eine fremde Einstellung. **`maxLength`
   schneidet stillschweigend ab:** richtiger Code eingetippt, zwei Ziffern verworfen,
   „Der Code stimmt nicht". Dieselbe Familie wie „Noch nichts los in deinem Feed" bei
   einem Netzausfall. Jetzt `CODE_MIN`/`CODE_MAX` in der Regel-Datei — **ein zu
   großzügiges Feld kostet nichts, ein zu kleines verwirft Eingaben.**
3. **Der Bezirk ist ab jetzt ein FELD, kein Raster** (Ians Rückmeldung, harte Regel 81).

✅ **ERLEDIGT am 2026-09-12, und die Lage war eine andere als gedacht: die Prüfstände
laufen NEBEN Ians Konto.** Hier stand, `pruef-lesen` und `pruef-konto` verweigerten den
Dienst, seit ein echtes Konto in `auth.users` liegt, und Ian müsse wählen zwischen
„Konto löschen" und „zweites Supabase-Projekt". **Beides war unnötig** (Ians
Entscheidung 45: *der Wächter fragt nur nach den Prüf-IDs*). Fünf Dinge daran:

1. **Die Begründung des Wächters war seit einer Überarbeitung FALSCH.** Er schrieb
   *„das Abräumen unterscheidet nicht, wem eine Zeile gehört."* Nachgesehen statt
   geglaubt: `52_abraeumen.sql` nennt die fünf UUIDs längst beim Namen und sagt im
   eigenen Kopf *„Was nicht an ihnen hängt, wird nicht angefasst."* **Kommentar und
   Code waren auseinandergelaufen** — dieselbe Lage wie `landing/stil.css` gegenüber
   `theme/colors.ts` (harte Regel 13), nur innerhalb einer Datei. Ein Wächter, der
   die falsche Frage stellt, sperrt zu viel oder zu wenig; hier zu viel, und der
   Preis wäre ein zweites Projekt gewesen.
2. **Übrig war EINE stumpfe Zeile, und sie hätte ausgerechnet Entscheidung 42
   gelöscht.** `or not exists (select 1 from chat_participants …)` räumte JEDEN Chat
   ohne Teilnehmer ab — und ein verwaister Chat ist nach harter Regel 56 ein gültiger
   Zustand, den ein echter Mensch haben darf. Die Datei begründet drei Zeilen weiter
   oben richtig, warum eine verwaiste MELDUNG stehen bleiben muss, und macht beim
   Chat genau den Fehler, den sie dort vermeidet. **Und das scharfe Werkzeug stand im
   selben Satz:** *„die Fäden bleiben mit ihren FESTEN IDs liegen."*
3. **`62_abraeumen.sql` tat wörtlich das, wovor die Schwesterdatei warnt.** Dort stand
   `delete from auth.users;` — ALLE Konten — mit der Begründung, ein Wächter in einer
   *anderen* Datei habe vorher aufgepasst. `52_abraeumen.sql` schreibt dagegen: *„ein
   Abräumen, das sich auf einen Wächter in einer ANDEREN Datei verlässt, ist genau so
   lange harmlos, bis jemand es einzeln aufruft."* Die zwei festen UUIDs standen zwei
   Zeilen weiter im aufrufenden Skript.
4. **Der Wächter war nur die auffälligste Stelle, nicht die einzige — und das hat der
   erste Lauf sofort gezeigt.** `✗ Erwartet: 2 Konten, 0 Profile. Ist: 4 / 1`: Die
   Prüfung zählte `count(*) from auth.users`, meinte aber ihre eigenen zwei Zeilen.
   Dasselbe beim Handle-Vergleich (`["@realtimeprobe","ian","ian2"]`). **Wer eine
   Zusage von „die Datenbank gehört mir allein" auf „mir gehören diese IDs" umstellt,
   muss JEDE Zählung mitziehen** — sonst wandert der Abbruch nur eine Zeile nach unten
   (harte Regel 83).
5. **Gemessen, nicht behauptet:** `npm run pruef-konto` → **29 Häkchen, 0 Kreuze**,
   gelaufen neben **zwei fremden Konten**, und beide standen danach unverändert da.
   Das ist der Beleg, der zählt — nicht, dass das Skript durchläuft, sondern dass die
   fremden Zeilen es überleben.

✅ **Phase 20.3-b1 ist fertig (2026-09-12): die App kann sich WIRKLICH anmelden — per
E-Mail-Code, gegen Ians echtes Supabase.** Der Teil von 20.3-b, der OHNE Apple und
Google geht, und wieder ohne neuen Baustein und ohne Build. `npm run pruef-konto` —
**29 Häkchen, kein Kreuz am ECHTEN Server**, danach ist die Datenbank wieder leer. Eine
neue Entscheidung von Ian (44). `tsc` sauber, **81 Lint-Probleme wie vorher**, lokal
weiter 121 Häkchen. Neun Dinge sind wichtiger als der Anmelde-Bildschirm:

1. **Der teuerste Fund war wieder eine ABWESENHEIT: der Anmelde-Bildschirm war
   unsichtbar.** Beim ersten Umlegen des Schalters zeigte die App den Schriftzug auf
   Papierweiß und rührte sich nicht — sie sah aus wie hängengeblieben. Sie war es
   nicht: `useStartFlaecheWeg` hing die Abdeckung aus `+html.tsx` an `laden.zustand`,
   also an den DATEN. **Ohne Anmeldung wird nie geladen**, `laden` bleibt für immer auf
   `'laeuft'`, und der fertig gezeichnete Anmelde-Bildschirm lag darunter. Bis zu diesem
   Tag konnte das niemand sehen, weil es den ausgeloggten Zustand mit `'supabase'` noch
   nie gegeben hat. **Dieselbe Familie wie der unsichtbare Startbildschirm vom
   2026-09-11.** Die Frage ist nicht „sind die Daten da?", sondern **„steht etwas zum
   Anschauen?"**
2. **`Sitzung` hat jetzt VIER Glieder, und `tsc` hätte zu den zwei neuen geschwiegen.**
   `'neu'` (angemeldet, ohne Profil) und `'unbekannt'` (es wird noch nachgesehen) sind
   LOCKERUNGEN — die Phase-16-Lehre: null gemeldete Stellen. Der Torwächter fragte
   `zustand === 'an'`, und das bleibt gültiger Code: **Jemand mit gültigem Token wäre
   wieder vor dem Anmelde-Bildschirm gelandet und hätte einen zweiten Code bekommen.**
   Die Enge sitzt deshalb in `torwaechterZeigt()`, einem erschöpfenden `switch` mit
   `never`. **Gegengemessen:** ein erfundenes fünftes Glied ergibt sofort einen
   Typfehler.
3. **`'unbekannt'` ist Entscheidung 43 noch einmal.** Der naheliegende Anfangswert
   `'aus'` hätte jedem mit gespeicherter Sitzung für einen Lidschlag den
   Anmelde-Bildschirm gezeigt — **„wir wissen es noch nicht" und „niemand ist
   angemeldet" sind zwei Lagen**, wie „kommt noch" und „ist nichts".
4. **`persistSession: false` war eine zu grobe FOLGERUNG, und Nachsehen hat sie
   halbiert.** Der Kopf von `lib/supabase.ts` sagte, eine gespeicherte Sitzung brauche
   einen nativen Baustein. Nachgesehen in `GoTrueClient.js`: `auth-js` sucht sich seinen
   Speicher selbst und fällt ohne `localStorage` **still auf Arbeitsspeicher zurück** —
   kein Absturz, keine Warnung. Also kostet `true` keinen Pod. **Der Preis ist halbiert
   statt beseitigt:** im Browser überlebt die Sitzung das Neuladen, am iPhone nicht.
5. **Der abgeleitete @-Name ist der Grund für die Schleife in `profilAnlegen()`.**
   `handle` ist `unique`; zwei „Ian" ergeben beide `@ian`. Vorher nachzusehen wäre der
   naheliegende Weg und der falsche — dazwischen liegt das Fenster aus harter Regel 71.
   Also wird geschrieben und **`23505` als Antwort genommen**. Gegenprobe gemessen: mit
   nur einem Versuch scheitert der zweite „Ian".
6. **`23505` bedeutet ZWEIERLEI, und die zweite Bedeutung ist der Doppelklick.** Beim
   zweiten „Los geht's" verletzt man `profiles_pkey`, nicht den `handle` — **kein
   Fehler, sondern das Ergebnis.** Jeder ANDERE Code bricht sofort ab, sonst liefe die
   Schleife zwanzigmal gegen eine abgelaufene Anmeldung und meldete „@-Name vergeben".
7. **Zwei Angriffe zum ersten Mal über PostgREST mit echtem Token:** ein Profil auf eine
   FREMDE UUID wird mit **`42501`** abgewiesen, ein Jahrgang 1800 mit `23514` — nicht
   als Kollision.
8. **Was FEHLT, ist ein eigener MAIL-VERSENDER — und eine Runde mit einer echten
   Mail.** ❌ *Am 12.09. stand hier zuerst, Ian müsse nur die Vorlage von
   `{{ .ConfirmationURL }}` auf `{{ .Token }}` umstellen. Das war falsch:* Seit Juni
   2026 dürfen neue GRATIS-Projekte die Vorlagen gar nicht bearbeiten — Supabase
   verlangt dafür eigenes SMTP. **Der wirkliche Grund ist ohnehin größer:** Der
   eingebaute Dienst schickt **2 Mails pro Stunde** und ist laut Supabase nicht für den
   Betrieb gedacht; bei vier Gründern ist nach zwei Anmeldungen eine Stunde Pause.
   **Damit erledigt sich auch der naheliegende Ausweg**, die App den LINK statt einer
   Zahl verarbeiten zu lassen — beide Wege scheitern an denselben zwei Mails. Ians
   Entscheidung: **Brevo** (300/Tag gratis, kein eigener Domainname nötig — bei Resend
   darf man ohne Domain nur an sich selbst schicken). Klick für Klick in
   `KONTEN_EINRICHTEN.md`, Punkt 0. Und die Runde `codeAnfordern` → Postfach →
   `codePruefen` bleibt **ungeprüft**: Der Code steht in einem Postfach, in der
   Datenbank liegt nur sein Hash.
9. **Der Preis: +3.398 B gzip (+0,70 %)** auf 486.870 B. Klein, weil `supabase-js` seit
   20.4-b ohnehin drin ist.

⚠️ **Was 20.3-b1 NICHT ist: der Schalter.** `ANMELDE_QUELLE` steht weiter auf
`'attrappe'`, der Prototyp ist nachgemessen unverändert (`aj01`). Umlegen hieße heute
zwei tote Knöpfe auf der öffentlichen Adresse — Apple und Google sind am Server
nachgemessen aus — und einen Prototyp-Hinweis, der „Es gibt keinen Login" behauptet,
während es einen gibt. **Der Satz ist Ians** (harte Regel 22).

✅ **Der offene Realtime-Befund ist ERLEDIGT (2026-09-12) — und der Verdacht war
falsch.** `pruef-lesen` war in einem von zwei Läufen rot: Kanal verbunden, Schreiben
durch, Ereignis weg. Hier stand, das Token gehe an PostgREST, aber nicht an Realtime.
Vier Dinge:

1. ❌ **Widerlegt, nicht vermutet.** `sb.realtime.accessTokenValue` trug im
   Augenblick des `subscribe()` das **Nutzer-Token**, in jedem gemessenen Lauf. Ein
   ausdrückliches `await sb.realtime.setAuth(token)` davor änderte an **8 von 8**
   Läufen nichts — vier mit, vier ohne. Die Spur war plausibel und im
   Bibliothekscode sogar sichtbar (`subscribe()` liest `accessTokenValue` synchron,
   `setAuth` ist `async` und wird nicht erwartet), und sie war trotzdem nicht die
   Ursache. **Ein Mechanismus, den man im fremden Quelltext findet, ist eine
   Hypothese und kein Befund.**
2. **Die wirkliche Ursache ist ein KALTSTART, und sie ist reproduzierbar.** Nach
   **zwölf Minuten** ohne jede Verbindung geht das **erste** Ereignis nach
   `SUBSCRIBED` verloren; ein zweites 1,5 s später kommt an (`gehört: [B]`). Der
   Lauf unmittelbar danach, warm, meldete `[A, B]` — gleicher Code, Sekunden
   auseinander, einziger Unterschied kalt/warm. Warm: **5 von 5** mit beiden.
   Supabase bestätigt den Beitritt also, **bevor** sein WAL-Leser an der aktuellen
   Stelle steht. Dieselbe Familie wie „Kamerabefehle verpuffen still vor
   `onMapReady`".
3. **Die Antwort ist keine Wiederholung, sondern eine zweite MESSUNG.** Ein `retry`
   hätte aus einer ehrlichen Prüfung ein „irgendwann klappt es schon" gemacht.
   `50_lesen.mjs` stupst jetzt **zweimal** (A sofort, B nach 2 s), prüft die Zusage
   der App (*„spätestens der zweite Anstoß kommt an"*) und **sagt in einem Satz
   daneben**, ob der erste verlorenging. Kommt keiner an, ist Realtime kaputt; kommt
   nur der zweite, war der Dienst kalt — beim nächsten roten Lauf muss also niemand
   mehr raten.
4. ⚠️ **Was daraus für die APP folgt, ist noch offen und gehört Ian.** Die App hat
   **kein Sicherheitsnetz**: Nach dem ersten Laden ist Realtime der einzige Anlass
   nachzuladen. Geht ein Ereignis verloren — kalt, Verbindungsabbruch, abgelaufenes
   Token —, steht der Bildschirm still, bis zufällig das nächste kommt. Im
   Kaltstart-Fenster ist das folgenlos (die Daten wurden gerade geladen); bei einem
   Abbruch ist es das nicht. Die Frage steht in `_FUER_IAN/OFFENE_SACHEN.md`.

🎥 **Und eine Frage von Ian ist beantwortet: Liquid Glass liefert APPLE, wir bauen es
nicht nach.** Sein Screen Recording liegt als `vorbild-liquid-glass-video.MP4` im
Projekt. Der Effekt ist ab iOS 26 ein Betriebssystem-Baustein (`UIGlassEffect`); Expo
reicht ihn als **`expo-glass-effect`** durch, und das Paket ist seit Phase 19e-2 in
Benutzung (`SsGlas.native.tsx`, harte Regel 61). **Es gibt in diesem Projekt keine
Nachbildung** — was `SsGlas.tsx` für Web und Android zeichnet, ist der Rückfall für
Plattformen ohne Apples Glas. Und die 19i-Messung sagt dasselbe: Das Glas LÄUFT
(Grünstich vom Untergrund, +9,2); **was fehlt, ist Untergrund** (33,2 Helligkeitsstufen
bei Ians Vorbild gegen 1,5 bei uns). Wer „mehr Glas" baut, baut am falschen Ende.

✅ **Phase 20.4-b ist fertig (2026-09-12): die App KANN aus Supabase lesen — und der
Prototyp merkt davon nichts.** Der Client, die dreizehn Abfragen, Realtime, der
Ladezustand und Ians Entscheidung 43. `npm run pruef-lesen` — **29 Häkchen, kein Kreuz
am ECHTEN Server**, danach ist die Datenbank wieder leer. `tsc` sauber, **81
Lint-Probleme statt 83**, lokal weiter 121 Häkchen. Zehn Dinge sind wichtiger als die
Abfragen:

1. **`@supabase/supabase-js` ist JS-only — 20.4-b brauchte KEINEN neuen Build.**
   Gemessen statt vermutet: kein `.podspec`, kein `expo-module.config.json`. Native wird
   es erst da, wo die SITZUNG gespeichert werden muss (`AsyncStorage`,
   `expo-secure-store`), und das ist 20.3-b. Deshalb steht `persistSession: false` im
   Client — **keine Bequemlichkeit, sondern die Zeile, die diese Phase ohne Build
   möglich macht.** Der Preis: Wer die App schließt, ist ausgeloggt.
2. **Es gibt genau EINEN Schalter, und er heißt weiter `ANMELDE_QUELLE`.** Ein zweiter
   (`DATEN_QUELLE`) wäre naheliegend gewesen und kann zwei Zustände darstellen, die es
   nicht gibt — beide scheitern **stumm**: `supabase`-Daten mit `attrappe`-Anmeldung
   ergibt kein Token, also **0 Zeilen**, und das sieht aus wie „die Datenbank ist leer".
   `LIEST_AUS_SUPABASE` wird deshalb ABGELEITET, dieselbe Überlegung wie `PROJEKTION`
   (harte Regel 53).
3. **Der teuerste Fund lag am Server und war unsichtbar: die Publication
   `supabase_realtime` war LEER.** Ein Abo auf `postgres_changes` verbindet sich dann
   sauber, meldet `SUBSCRIBED` — **und liefert nie ein Ereignis.** Kein Fehler, keine
   Warnung; für die App sähe das aus, als passierte in Wien nichts.
   `0005_realtime.sql` trägt elf Tabellen ein, `einspielen.sh` misst **neun Zahlen statt
   sieben**, und der Wächter hat am echten Server sofort angeschlagen.
4. **`blocks` und `reports` stehen NICHT in der Publication — harte Regel 10.** Supabase
   wendet RLS auf `postgres_changes` bei INSERT und UPDATE an, **bei DELETE nicht**:
   Dort geht der Primärschlüssel an ALLE Abonnenten, und bei `blocks` ist das
   `(blocker_id, blocked_id)`. Ein Entblocken wäre eine Nachricht an den Blockierten.
   `REPLICA IDENTITY` bleibt aus demselben Grund auf DEFAULT.
5. **Der Realtime-Anstoß ist ein SIGNAL, kein Datentransport.** Aus keinem `payload`
   wird ein Feld gelesen; nachgeladen wird durch die Policies. Damit kann Realtime
   nichts verraten, auch wenn seine RLS-Prüfung aussetzt. Entprellt wird, weil **harte
   Regel 6 hier RÜCKWÄRTS ankommt**: `anfrage_bestaetigen()` ändert drei Tabellen in
   EINER Transaktion — am Kanal werden daraus drei Ereignisse.
6. **Beim Abmelden muss der Zwischenspeicher geleert werden, und das ist kein
   Aufräumen.** Mit echten Daten lägen sonst fremde Chats im Speicher, bis das neue
   Laden durch ist — ein Fehler, der wie ein Flackern aussieht.
7. **Ians Entscheidung 43: der Vollbild-Kasten.** `supabase-js` wirft nicht, und
   `data ?? []` machte aus jedem Fehler „Noch nichts los in deinem Feed" — ein Satz, der
   lügt. Regel in `data/quelle.ts`, Bildschirm in `components/LadeSchirm.tsx`.
8. **Vier eigene Fehler beim Prüfstand, alle dieselbe Familie:** ein abgeschriebenes
   Abräumen (unvollständig, weil ich `05_daten.sql` nur bis Zeile 70 gelesen hatte),
   eine unterdrückte Fehlermeldung (`>/dev/null 2>&1` verschluckte genau die Ursache),
   eine Drift-Prüfung, die sich an einer erfundenen RPC **still selbst übersprungen**
   hätte, und eine Realtime-Prüfung, die EINE Messung war, wo es drei braucht. Dazu:
   **ein Wächter hinter einem anderen ist ein ungeprüfter Wächter** — in `0005` verdeckte
   der Zähler die Regel-10-Prüfung, bis die Reihenfolge gedreht war.
9. **„Database error querying schema" sind acht `NULL`s.** GoTrue liest acht
   Textspalten von `auth.users` in ein `string`, nicht in ein `*string`. Der Fehler nennt
   weder Spalte noch Grund und klingt nach kaputtem Schema. **`null` und `''` sind nicht
   dasselbe.**
10. **Der Preis ist eine Zahl: +74.789 B gzip (+18,3 %)** — deutlich mehr als jeder
   Baustein bisher. **Daraus folgt: `npm run deploy` bleibt liegen, bis der Schalter
   umgelegt wird**; auf der öffentlichen Adresse kostet der Umbau 75 kB und tut nichts.

⚠️ **Was 20.4-b NICHT ist: der Schalter selbst.** `ANMELDE_QUELLE` steht weiter auf
`'attrappe'`, der Prototyp sieht Zeichen für Zeichen aus wie vorher (nachgemessen,
keine Konsolenfehler). **Umlegen lässt er sich erst mit 20.3-b** — ohne echte Anmeldung
kein Token, ohne Token null Zeilen.

🔑 **Und der Zugang für die APP liegt seit demselben Tag in `.env`** —
`npm run anon-key`, wieder über die Zwischenablage. **Damit ist die Konten-Seite von
20.3-b/20.4-b für Supabase vollständig; offen bleiben nur Apple-Sign-in und Google.**
Drei Dinge sind wichtiger als die Datei:

1. **Der anon key ist das GEGENTEIL eines Geheimnisses, und das muss man aussprechen.**
   Er landet zwangsläufig im gebauten Bundle — jeder, der die App hat, kann ihn lesen.
   Das ist kein Versäumnis, sondern das Modell: **Was er darf, entscheiden die 33
   Policies, nicht seine Geheimhaltung.** Deshalb liegt er in `.env` (git-ignoriert,
   mit `.env.example` als sichtbarer Vorlage) und nicht in `~/.simplysocial/` wie der
   Verbindungs-String — und trotzdem nicht im Code, weil ein Wert im Quelltext beim
   nächsten Projekt mitwandert und niemand merkt, dass er zu tauschen wäre.
2. **Der Wächter, auf den es ankommt, liest die Rolle AUS DEM TOKEN.** Auf derselben
   Supabase-Seite steht der `service_role` key: gleiche Länge, gleicher Anfang `eyJ`,
   gleiche Stelle in der Oberfläche — und er hebt **jede** Policy auf. Ein JWT trägt
   seine Rolle als `role` in der Nutzlast, also wird nachgesehen statt dem Namen des
   Feldes vertraut. Beide Richtungen belegt: echter Schlüssel → `anon`, durchgelassen;
   ein **nachgebautes** `service_role`-Token → abgewiesen; `sb_secret_…` → abgewiesen.
3. **Die Project URL wird aus dem Token ABGELEITET, nicht abgetippt.** Der
   Projekt-Verweis steht als `ref` schon drin. Zwei Quellen für dieselbe Angabe sind
   zwei Gelegenheiten, dass sie auseinanderlaufen — dieselbe Überlegung wie
   `PROJEKTION` in `karte-geo.ts` (harte Regel 53).
   **Gegengemessen von aussen, über HTTP, so wie die App es tun wird:**
   `GET /rest/v1/posts?limit=1` mit dem anon key → **HTTP 200**, leere Liste. Damit ist
   nicht nur der Schlüssel geprüft, sondern die ganze Kette bis PostgREST.

✅ **Das Supabase-Projekt STEHT (2026-09-12) — Schema, Regeln und Funktionen sind
eingespielt und am echten Server belegt.** Ians Konto, Region `eu-west-1` (Irland, nicht
das empfohlene Frankfurt — immer noch EU, nur weiter weg). `npm run db-url` +
`npm run einspielen`, danach alle sieben Zahlen grün: **13 Tabellen · 33 Policies · RLS
auf allen 13 · 6 `regel.`-Funktionen · 9 `public.`-Funktionen · 8 Enums · 1 Trigger.**
**Damit ist 20.3-b/20.4-b nicht mehr blockiert** — es fehlt nur noch der `anon key`.
Fünf Dinge sind wichtiger als das Einspielen selbst:

1. **Der Wächter hat beim ERSTEN echten Lauf angeschlagen — und der Fehler war meine
   Messung.** `Trigger 6 statt 1`: Der Zähler war als einziger der sieben **nicht** auf
   `nspname='public'` eingeschränkt und zählte Supabases eigene Trigger in `storage`
   und `realtime` mit. **Lokal ist das folgenlos, weil die Wegwerf-Datenbank diese
   Schemas gar nicht hat** — dieselbe Familie wie die Attrappen-Falle vom 2026-09-06:
   *Eine Nachbildung, die WENIGER mitbringt als das Original, lässt eine Messung
   durchgehen, die am Original falsch ist.* Der Wächter hat trotzdem getan, wofür er
   gebaut ist: Er hat einen Unterschied gemeldet statt „fertig" zu sagen.
2. **Daraus kam eine Verbesserung, die vorher fehlte:** Ist die Datenbank nicht leer,
   bricht `einspielen.sh` nicht mehr ab, sondern **misst nach**. „Steht schon alles
   richtig da" und „da liegt etwas Halbes" sind zwei Lagen, und nur eine ist ein
   Problem. Nach dem berichtigten Zähler war die Datenbank bereits vollständig — ein
   blankes „✗ nicht leer" hätte das verschwiegen.
3. **Supabases echte `auth.uid()` verhält sich wie die Attrappe — gemessen, nicht
   gehofft.** Am echten Server: `set local request.jwt.claims` → `auth.uid()` gibt die
   `sub` zurück. Das ist der Beleg dafür, dass die 121 lokalen Prüfungen überhaupt etwas
   über die echte Datenbank aussagen.
4. **Vier Angriffe am echten Server, alle gehalten:** `anon` sieht **0** Posts, ein
   angemeldeter Fremder sieht **0** Blocks (harte Regel 10), und ein `insert` als `anon`
   scheitert mit **`42501`**. Der erste Versuch dazu war wertlos und sah trotzdem nach
   Erfolg aus: Er scheiterte an einem falschen SPALTENNAMEN, nicht an RLS — genau der
   Fall, gegen den harte Regel 57 den `SQLSTATE`-Vergleich verlangt.
5. **`npm run db-url` legt den Verbindungs-String über die ZWISCHENABLAGE ab**, in zwei
   Schritten: erst der String mit `[YOUR-PASSWORD]` als Entwurf, dann nur noch das
   Passwort — URL-kodiert (Supabase-Passwörter enthalten `@ : / ? #`, und ein blankes
   `@` macht aus dem Rest einen Hostnamen) und über **stdin** statt als Argument, weil
   Argumente in `ps` stehen. Danach wird die Verbindung wirklich aufgebaut.
   **Zwei eigene Fehler dabei, beide „keine Meldung" statt „falsche Meldung":** ohne
   `PGCONNECT_TIMEOUT` hängt psql minutenlang und sieht aus wie ein hängendes Skript;
   und `set -e` tötete das Skript beim psql-Fehlercode, **bevor die eigens gebaute
   Diagnose überhaupt lief** — drei Läufe lang gab es nur `exit=2` und keinen Text.

🔧 **Das Einspielen in ein echtes Supabase ist seit dem 2026-09-12 ein Befehl** —
`supabase/einspielen.sh`, Aufruf `npm run einspielen`. **Ians Entscheidung an dem Tag:
Supabase jetzt anlegen** (gegen „ohne ihn mit einem lokalen Server weiterbauen" und
gegen „erst herzeigen"); der Vier-Dateien-Copy-Paste in `KONTEN_EINRICHTEN.md` ist
damit weg. Das Skript ist in BEIDE Richtungen belegt, bevor es je ein echtes Projekt
gesehen hat. Vier Dinge sind daran wichtiger als die Bequemlichkeit:

1. **Die teuerste denkbare Verwechslung hat einen Namen: `00_supabase_lokal.sql`.**
   Die Attrappe bringt `auth.users` und `auth.uid()` genauso mit wie das Original —
   wer die Ziele vertauscht, spielt 33 Policies gegen eine Datenbank ein, in der
   `auth.uid()` etwas anderes bedeutet, und **bekommt keine einzige Fehlermeldung.**
   Gefragt wird deshalb nach dem, was NUR das echte Supabase hat: Schema `storage`
   und Rolle `service_role`. Gemessen: lokale Wegwerf-DB → 0/0, Abbruch; ein Ziel mit
   beidem → durchgelaufen, alle sieben Zahlen grün. Dieselbe Familie wie die
   Team-Prüfung in `geraet-bauen.sh`.
2. **Alle vier Migrationen in EINER Transaktion** — harte Regel 6 eine Ebene tiefer.
   Ein Abbruch nach `0002` hinterliesse Tabellen **ohne** Schreibwege, und weil ein
   fehlender `grant` hier eine ZUSAGE ist (Regel 70), sähe das aus wie Absicht.
3. **Danach wird NACHGEMESSEN, nicht „fertig" gemeldet** (die Lehre vom 2026-09-11):
   **13 Tabellen · 33 Policies · RLS auf allen 13 · 6 `regel.`-Funktionen ·
   9 `public.`-Funktionen · 8 Enums · 1 Trigger** — die Zahlen der lokalen Datenbank,
   gegen die 121 Prüfungen grün sind. Ändert eine Migration sich, gehören sie
   nachgezogen.
4. **Der Verbindungs-String liegt in `~/.simplysocial/db-url`** (Rechte 600),
   außerhalb des Repos — dasselbe Muster wie `~/.appstoreconnect/`. **Er enthält das
   Datenbankpasswort, und Postgres spiegelt ihn bei Verbindungsfehlern zurück**; der
   Filter dagegen ist nachgemessen, nicht vermutet.

🧪 **TestFlight läuft INTERN (Ians Entscheidung, 2026-09-12) — vorbereitet, es fehlen
drei E-Mail-Adressen.** `npm run asc tester -- Vor:Nach:mail [--wirklich]`. Die drei
werden Benutzer von Ians Konto; dafür entfällt Apples Beta-Prüfung und mit ihr die
Altersfrage aus `OFFENE_SACHEN.md` Punkt 0. Zwei Dinge sind wichtiger als der Aufruf:

- **Apple lässt als interne Tester NUR fünf Rollen zu** (nachgelesen, nicht geraten):
  ACCOUNT_HOLDER, ADMIN, APP_MANAGER, DEVELOPER, MARKETING. **`READ_ONLY` und
  `CUSTOMER_SUPPORT` gehen NICHT** — ausgerechnet die beiden, die am harmlosesten
  klingen. `TESTER_ROLLE = 'MARKETING'` ist die kleinste zulässige; `DEVELOPER` wäre
  der naheliegende Griff und darf **Zertifikate und Provisioning-Profile verwalten**,
  also genau das, woran am 2026-09-11 ein 20-Minuten-Build hing. Dazu
  `allAppsVisible: false` — sie sehen nur diese eine App.
- **Ohne `--wirklich` passiert nichts.** Apple verschickt die Einladung im Moment des
  Anlegens und nur dann, und für interne Tester gibt es keinen Nachschick-Aufruf.
  Die Vorschau ist gegengemessen: 0 offene Einladungen danach.

🍏 **Ian hat das Apple Developer Program (2026-09-11).** Eines der drei Konten aus dem
20.3-b-Engpass ist damit da; offen bleiben **Supabase und Google**. Drei Dinge sind
daran wichtiger als der Kauf:

1. **Der Plan behauptete es seit dem 2026-08-31 — an vier Stellen, und es stimmte
   nicht.** Zeile 71 („gekauft am 2026-08-31"), die Kostentabelle 21.6, die
   MapKit-JS-Zeile und die 19.4-Voraussetzungen standen alle auf „erfüllt", während
   19.4 daneben richtig schrieb *„Ian hat heute nur eine gewöhnliche Apple-ID"*. Die
   Angabe stammt aus dem ersten Brief und ist nie nachgeprüft worden. **Gemerkt hat es
   niemand, weil Phase 19 den Cloud-Weg gar nicht ging** — gebaut wurde lokal mit
   `xcodebuild`, und dort fällt eine fehlende Mitgliedschaft nur als „7 Tage" auf.
   Alle vier Stellen sind berichtigt.
2. **Bezahlt ist nicht dasselbe wie am Rechner verwendbar — und was veraltet war, war
   Xcodes Zwischenspeicher, nicht Apples Antwort.** Um 21:46 meldete
   `com.apple.dt.Xcode.plist` `teamType: "Personal Team"` und
   `isFreeProvisioningTeam: true`; nachdem Ian in Xcode einmal auf sein Konto geklickt
   hatte, stand um 21:55 **`teamType: "Individual"`, `isFreeProvisioningTeam: false`**.
   Die Mitgliedschaft war die ganze Zeit aktiv.
   **Und der teuerste Teil ist, was sich NICHT geändert hat: die Team-ID.** Sie ist
   weiter `5TQTMP2L2H` — Apple hat das bestehende Personal Team **aufgewertet**, statt
   ein zweites anzulegen. Ich hatte das Gegenteil angenommen und Ian nach „der neuen
   Team-ID" gefragt; es gibt keine. `DEVELOPMENT_TEAM` im `project.pbxproj` stimmte
   also schon, und der Gerätebuild lief ohne eine einzige Änderung am Projekt.
   **Ein Feld, das dieselbe Zeichenkette behält, kann trotzdem etwas anderes bedeuten**
   — wer auf die ID schaut, sieht den Unterschied nie; er steht in `teamType`.
3. ✅ **Erledigt am selben Abend: die App auf Ians iPhone gilt jetzt bis 2027-09-11.**
   Vorher `TimeToLive: 7` / `ExpirationDate 2026-09-14 22:00`, nachher **365** /
   `2027-09-11 21:29`. Aufgespielt und gestartet (`at.simplysocial.app`, PID 21296
   gegen `devicectl device info processes` geprüft). **Am Projekt war dafür keine Zeile
   zu ändern** — die Team-ID blieb dieselbe. Der teure Teil steht in der Fallen-Liste:
   Der ERSTE Build lief 20 Minuten durch, meldete `BUILD SUCCEEDED` und hatte trotzdem
   das alte 7-Tage-Profil eingebettet. Mit dem Programm wird daraus ein Jahr, dafür muss sie einmal neu drauf.
   Danach geht **TestFlight**, und damit Punkt 8 der Reihenfolge („wieder herzeigen"),
   der seit dem 2026-09-02 offen liegt.

❓ **Eine Frage wartet auf Ian, und sie ist später teuer:** Läuft das Programm auf
seinen Namen oder auf den eines Erwachsenen? Apple verlangt für ein eigenes Konto
normalerweise 18 Jahre; mit 16 läuft es üblicherweise über einen Elternteil. Daran
hängen Anbietername im Store, Verträge — und der Sign-in-Schlüssel, dessen Wechsel
später jeden Nutzer zum Neuanmelden zwingt.

🚀 **TestFlight steht (2026-09-11): Build 1 ist bei Apple und `VALID`.** App
`SimplySocial` (SKU `simplysocial-1`), hochgeladen um 22:58, gültig bis 2026-12-10.
Damit ist Punkt 8 der Reihenfolge („wieder herzeigen") erreichbar, offen seit dem
2026-09-02. Vier Dinge sind wichtiger als der Upload:

1. **Die App hatte kein eigenes Icon — sie trug das EXPO-Logo, und zwar an zwei
   Stellen.** `ASSETCATALOG_COMPILER_APPICON_NAME = expo` zeigte auf ein
   Icon-Composer-Bundle (`assets/expo.icon`), `AppIcon.appiconset` war **leer**, und
   `assets/images/icon.png` war ebenfalls das Expo-Logo. Ians Platzhalter-Logo
   (`~/Desktop/Logo_simplySocial_Platzhalter.pdf`, weißes „S“ auf `#72B9AE`) ist jetzt
   beides: 1024 × 1024 **ohne Alpha** (mit Alpha weist Apple den Upload ab) und
   zentriert nach MESSUNG — das Motiv saß im Original 3 px von der Feldmitte entfernt,
   also war nichts zu verschieben.
2. **Der Startbildschirm war unsichtbar, und kein Werkzeug hätte das gefunden.**
   `splash-icon.png` war ein **weißes** Logo auf dem konfigurierten Papierweiß
   `#FAF9F6` — 41 % der Fläche gedeckt, davon nichts zu sehen. **Ein Fehler, der nur
   als Abwesenheit auftritt, überlebt jeden Typecheck und jeden grünen Build.** Jetzt
   trägt das „S“ die Logofarbe; der Hintergrund blieb unangetastet, weil er eine
   Entscheidung trägt (Markenfarbe aus `theme/colors.ts`) und das Bild nur ein
   Versehen war. **Die Einfärbung ist eine Auslegung und wartet auf Ians Urteil.**
   Nebenbefund zur Methode: Die erste Fassung legte einen Schleier über das ganze
   Motivrechteck, weil die Alpha-Schwelle (140) UNTER der Helligkeit des Türkis
   (157,7) lag — **eine Schwelle zwischen zwei Farben wird gemessen, nicht geraten.**
3. **`ITSAppUsesNonExemptEncryption` fehlte.** Ohne den Eintrag fragt TestFlight bei
   JEDEM Build nach der Exportverschlüsselung. Steht jetzt als `false` in `app.json`
   unter `ios.infoPlist` — eine Erklärung in Ians Namen, deshalb ausdrücklich mit ihm
   besprochen: Die App bringt keine eigene Kryptographie mit, nur System-HTTPS.
4. **Der Upload läuft über einen App-Store-Connect-API-Schlüssel, nicht über Ians
   Passwort.** Schlüssel und Issuer-ID liegen in `~/.appstoreconnect/` (Rechte 600),
   **außerhalb des Repos** — harte Regel 12 in ihrer schärfsten Form, weil der Prototyp
   öffentlich abrufbar ist. `scripts/asc.py` (`npm run asc`) fragt damit Buildstatus und
   TestFlight-Gruppen ab; das JWT lebt 15 Minuten. **Die Issuer-ID kam über die
   Zwischenablage statt über den Chat** und wird aus jeder Ausgabe herausgefiltert,
   falls Apple sie in einer Fehlermeldung zurückspiegelt.

5. **Ians Entscheidung: erst mal nur er als Tester.** Interne Gruppe `Gründer`,
   `hasAccessToAllBuilds = true` (künftige Uploads landen von selbst darin).
   **Am 2026-09-11 um 23:2x hat er die App über TestFlight installiert — es läuft.**
   Christoph, Leopold und Daria kommen dazu, wenn er die Fassung selbst gesehen hat;
   die Wahl intern/extern steht dann wieder an (extern hieße Apples Beta-Prüfung mit
   der Altersfrage aus `OFFENE_SACHEN.md` Punkt 0).
6. **Der letzte Fehler des Abends kostete drei Anläufe: TestFlight zeigte nur „Code
   einlösen“.** Serverseitig war alles grün — Build `VALID`, der Gruppe zugewiesen,
   Exportcompliance beantwortet, Benutzer `ACCOUNT_HOLDER` mit Zugriff auf alle Apps.
   Der einzige abweichende Wert war `state: NOT_INVITED` am Tester.
   **Apple verschickt die Einladung im Moment des HINZUFÜGENS und nur dann** — ein
   Build, der später dazukommt, holt sie nicht nach, und für INTERNE Tester gibt es
   in der API keinen Einladungs-Aufruf. Herausnehmen und neu hinzufügen erzeugte sie
   sofort (gemessen: `INVITED`, und die Mail von `testflight_no_reply@email.apple.com`
   lag im Postfach).
   ❌ **Eine Zwischendiagnose war falsch und ist zurückgenommen:** `inviteType: EMAIL`
   sah nach „als Fremder per E-Mail angelegt“ aus. Apple kennt aber nur `EMAIL` und
   `PUBLIC_LINK` — für jeden Tester ohne öffentlichen Link steht dort `EMAIL`, auch bei
   internen. **Ein Feld mit zwei möglichen Werten trägt keine Diagnose**, und ich habe
   Ian deswegen unnötig einen Eintrag löschen lassen. Die zweite Spur (Medien-&-Käufe-ID
   statt iCloud-ID) war richtig gedacht, traf hier aber auch nicht zu.

🔧 **Und der Gerätebuild ist seit dem 2026-09-11 ein Skript** —
`scripts/geraet-bauen.sh`, Aufruf `npm run geraet`. Er stand bis dahin nur als Prosa in
der Fallen-Liste; darin stecken sechs Fallen, die alle schon einmal einen Abend
gekostet haben. Drei Dinge sind daran wichtiger als die Bequemlichkeit:

- **Es prüft die ANWESENHEIT von `BUILD SUCCEEDED`**, nicht die Abwesenheit von
  `error:` — der codesign-Fehler vom 2026-09-08 hatte gar keine `error:`-Zeile.
- **Die Team-Prüfung war beim ersten Versuch falsch herum grün.** Sie fragte
  `isFreeProvisioningTeam`; das steht in der Xcode-plist **vor** der `teamID` (ein
  `grep -A` findet es nie) und `plutil -p` schreibt `=> true`, nicht `=> 1`. Beide
  Fehler ergaben still eine **0** — also „kein Gratis-Team“ an einem Gratis-Team.
  Jetzt wird `teamType` gefragt, und **beide Richtungen sind belegt**: echtes Team → 2,
  erfundenes Team → 0. Dieselbe Familie wie die Backticks in `30_wettlauf.sh`.
- ❓ **Eine Zeile wartet auf Ian** (`SPERR_ANTWORT`, blockiert nichts): Was soll
  passieren, wenn das iPhone beim Aufspielen gesperrt ist — abbrechen, warten oder
  einmal bitten? Am 2026-09-07 haben 30 Wiederholungen das Rennen gegen die
  automatische Sperre nicht gewonnen. Drin steht `'bitten'` als **Platzhalter, nicht
  als Entscheidung** (dieselbe Unterscheidung wie bei `zaehltAlsTermin()`).

📋 **Alle Klicks stehen ab jetzt in `_FUER_IAN/KONTEN_EINRICHTEN.md`** — Supabase, die
drei Apple-Handgriffe (App-ID, Sign-in-Schlüssel, Xcode-Konto) und Google, in der
Reihenfolge, die Richtlinie 4.8 vorgibt. **Supabase allein reicht für den größten
Brocken** (20.4-b, echte Daten statt `mock.ts`); Apple und Google hängen nur am
Anmelden.

✅ **Phase 20.4-a ist fertig (2026-09-10): die Übersetzung — was aus einer
Datenbankzeile wird.** Der Teil von 20.4, der OHNE Ians Konten geht, und wieder gegen
die echte Wegwerf-Datenbank belegt: `bash supabase/pruefen/aufbauen.sh` erwartet jetzt
**121 Häkchen statt 78** und ruft ein drittes Prüfskript mit, das echte Zeilen durch
`src/data/zeilen.ts` schickt. Eine neue Entscheidung von Ian (42). `tsc` sauber,
**83 Lint-Probleme vorher wie nachher**. Acht Dinge sind wichtiger als die
Übersetzungsdatei:

1. **Der teuerste Fund ist ein Zeitstempel — und er hätte die REIHENFOLGE der ganzen
   App still verdreht.** Postgres liefert `2026-09-10T07:59:29.833382+01:00`, Supabase
   `…+00:00`, die App schreibt `…833Z`. Derselbe Augenblick, drei Schreibweisen — und
   **neun Stellen sortieren Zeitstempel mit `localeCompare`, also als TEXT**
   (`posts/sort.ts`, `chat/sort.ts`, `requests/hooks.ts`, `groups/hooks.ts`). Gemessen:
   `'…07:59:29.833382+01:00'.localeCompare('…06:59:29.833Z')` ergibt **1** („später"),
   die UTC-Fassung ergibt **−1** („früher"). Der Ausweg ist NICHT, neun Stellen auf
   `Date` umzubauen — das wären neun Gelegenheiten, eine zu vergessen —, sondern EINE
   Zeile in `zeitpunkt()`. Gegenprobe gemessen: ohne die Taufe wird das Prüfskript rot
   (2 Kreuze), die Rücknahme ist nachgewiesen (19d-Methode).
2. **Ein fehlender `grant` war diesmal KEINE Zusage, sondern eine Lücke — und harte
   Regel 70 sagt selbst, woran man das unterscheidet.** Auf `reports` stand nur
   `insert`, mit der Begründung „eine Meldung enthält den Namen dessen, der gemeldet
   hat". Die Begründung stimmt für FREMDE Meldungen; `useMeineMeldung()` liest aber die
   EIGENEN und macht daraus seit Phase 7 den Satz „Du hast das schon gemeldet". Ohne
   select-Recht käme die Liste **leer** zurück — kein Fehler, keine Meldung, der Satz
   verschwände lautlos und dieselbe Sache ließe sich endlos melden. Jetzt
   `melder_sieht_eigene` plus **drei Angriffe**: der Melder sieht seine, eine Fremde
   sieht nichts, **der Gemeldete sieht nichts**.
3. **Die zwei abgesprochenen Schulden sind bezahlt, und die eine hat `tsc` geschrieben,
   die andere nicht — genau wie vorhergesagt.** `ChatThread.ausAktivitaet` als
   PFLICHTfeld meldete **5 Stellen**, `Group.creatorId: string | null` **3**, und
   `Group.aufgeloestAm?` meldete **NULL** (eine Lockerung, die Phase-16-Lehre). Deshalb
   sitzt die Enge dafür in `istAufgeloest()` und in den drei Regel-Funktionen
   `istMitglied` / `istGruender` / `inGruppenListe` — nicht in den Screens.
4. **Und beim Nachsehen von Hand kamen zwei echte Löcher heraus, die kein Compiler
   findet.** Eine Einladung in eine aufgelöste Gruppe stand weiter im Anfragen-Tab —
   `istMitglied()` sagt dort „nein", also war die Zeile *richtig* da, mit einem
   „Annehmen", das einen als einziges Mitglied in eine tote Gruppe gesetzt hätte. Und
   `darfBeitreten()` ließ eine Anfrage zu, weil `offen` beim Auflösen nicht angefasst
   wird — sie hätte für immer dagelegen, weil niemand mehr bestätigt.
5. **Der Prototyp konnte den Zustand gar nicht herstellen, und das war der eigentliche
   Grund.** `gruppeVerlassen` LÖSCHTE die Gruppe aus dem Array; jetzt setzt sie
   `aufgeloestAm`, leert die Mitglieder und nullt `creatorId` — dieselben drei Felder
   wie `gruppe_verlassen()` in 0004. Dazu `g5` und `p20` in `mock.ts`: eine aufgelöste
   Gruppe und ein Post, der sie überlebt. **Ein unsichtbarer Eintrag ist der Beweis**
   (dasselbe Muster wie `p16` in Phase 17): `g5` steht in keiner Liste, `p20` steht im
   Post-Screen und trägt „Sichtbar für · Nur Bouldern Dienstag".
6. **`if (!direkt && !post) return undefined;` stand ZWEIMAL in `chat/hooks.ts` — und
   hätte einen Chat UNÖFFENBAR gemacht.** Der Kommentar daneben sagte „bei einem
   Aktivitäts-Chat ist ein fehlender Post ein kaputter Datensatz". Das war richtig,
   solange sich ein Post nicht löschen lässt. In der Datenbank steht `on delete set
   null`: Der Chat wäre aus der Liste verschwunden und beim Öffnen auf „Diesen Chat gibt
   es nicht" gelandet — weil eine DRITTE Sache weg ist.
7. **Ians Entscheidung 42 (2026-09-10): Person plus leise Zeile.** Ein Chat, dessen
   Aktivität gelöscht wurde, zeigt den Namen wie ein Direktchat und darunter *„Aus einer
   Aktivität, die es nicht mehr gibt."* Verworfen: nur die Person (der Chat sähe aus wie
   ein Direktchat, obwohl er keiner ist) und ein eigener Kasten „Diese Aktivität wurde
   gelöscht" (ein Grabstein in einem Chat, in dem man noch monatelang schreibt). Der
   Satz steht als EINE Konstante in `chat/direkt.ts` (`VERWAIST_TEXT`).
8. **Der Prüf-Chat ist mit SARA, und das ist kein Zufall.** Sie folgt Ian, Ian folgt ihr
   nicht — unter Ians `SCHREIB_REGEL = 'gegenseitig'` könnten die beiden gar keinen
   Direktchat haben. Würde `t4` je fälschlich als Direktchat gelesen, wäre das also
   nicht nur eine falsche Überschrift, sondern ein Chat, den es nach den Regeln der App
   nicht geben dürfte. Genau der Fall, gegen den harte Regel 56 gebaut ist.

⚠️ **Was 20.4-a NICHT ist: das Lesen selbst.** Es gibt keinen Supabase-Client;
`store.ts` liest weiter `mock.ts`. Was fehlt, ist der Teil, der ein Projekt braucht —
Abfragen, Realtime, aus dem Speicher einen Zwischenspeicher machen. **Die Übersetzung
darunter ist fertig und an echten Zeilen belegt.**

❓ **Eine Auslegung wartet auf Ian** (blockiert nichts): Ein verwaister Chat läuft NIE
ab. `chatZustand(undefined)` gibt `'aktiv'`, weil ohne Post kein Termin da ist, an dem
Ians `NACHKLANG_TAGE` hängen könnten. Das ist die vorsichtige Lesart seiner
Entscheidung 41 („was bleibt, bleibt"), aber es ist eine Auslegung: Ein gewöhnlicher
Aktivitäts-Chat verschwindet eine Woche nach dem Treffen, dieser nie.

✅ **Phase 20.5 (SQL-Seite) ist fertig (2026-09-10): die Schreibseite — sieben
Funktionen, nicht drei, und gefunden hat sie die Rechteliste.** Wieder ohne Konto
gebaut und trotzdem bewiesen, wie 20.1/20.2: `bash supabase/pruefen/aufbauen.sh`
erwartete danach **78 Häkchen statt 25** (seit 20.4-a sind es 121) und ruft ein zweites
Prüfskript mit, das zwei echte Verbindungen gleichzeitig öffnet. Eine neue Entscheidung von Ian (41). Sechs
Dinge sind wichtiger als die Funktionen:

1. **Ein fehlender `grant` ist in diesem Projekt eine ZUSAGE, keine Lücke — und er hat
   die Arbeitsliste geschrieben.** `group_members` hat nur `select`, `chat_threads`
   auch. Solange `0004_transaktionen.sql` fehlte, konnte **niemand** einer Gruppe
   beitreten oder einen Chat anfangen, auch nicht rechtmäßig; genau das sagt harte
   Regel 55. **Dieselbe Technik wie `IconName` in Phase 14 (ein enger Typ) und das
   Löschen von `CURRENT_USER_ID` in 20.3-a (ein verschwundener Export), nur mit
   Rechten.** Der Plan nannte drei Funktionen, es sind sieben.
2. **Der teuerste Fund ist ein Fehler, den es im Prototyp gar nicht geben KANN.**
   `anfrageBestaetigen()` hat „zwei Sicherheitsnetze gegen den Doppelklick auf Web" —
   richtig gegen zwei Klicks DERSELBEN Person, wirkungslos gegen zwei gleichzeitige
   Verbindungen. Gegenprobe gemessen (`30_wettlauf.sh`, ein Post mit EINEM Platz):
   ohne `select … for update` sind danach **zwei Anfragen bestätigt, zwei Chats
   angelegt und ein Platz belegt — und niemand bekommt einen Fehler.** Einer der
   beiden hat schlicht keinen Sitz und erfährt es beim Hingehen. Die Sperre wurde
   nachweislich zurückgenommen (19d-Methode, `diff` leer).
3. **Ians Entscheidung 41 ließ sich NICHT so bauen, wie es naheliegt — und das ist
   eine gute Nachricht.** Ein Gruppen-Post überlebt jetzt die Auflösung seiner Gruppe
   (dieselbe Regel wie `AUSTRITT_WIRKUNG`). Der naheliegende Weg `on delete set null`
   ergäbe `visibility_kind = 'group'` OHNE Gruppen-ID — **genau der Zustand, den
   Phase 17 mit einem diskriminierten Union undarstellbar gemacht hat** (harte
   Regel 31), und der CHECK bricht ab. **Die Absicherung von damals hat hier zum
   ersten Mal wirklich etwas verhindert.** Also verschwindet die Gruppe nicht, sie
   HÖRT AUF: `aufgeloest_am`, keine Mitglieder, `creator_id = null`.
4. **Und daran hing sofort der Fehler, aus dem Entscheidung 39 entstanden ist —
   einen Schritt später.** `groups.creator_id` war `not null` ohne Cascade; sobald
   die Gruppe stehen bleibt, scheitert `konto_loeschen()` an
   `groups_creator_id_fkey`. Jetzt `on delete set null` plus
   `constraint chef_oder_aufgeloest`: „ohne Chef" ist NUR bei einer aufgelösten
   Gruppe darstellbar.
5. **Zwei bestehende Prüfungen sind beim Umbau rot geworden, und das war ihr Zweck.**
   Beide behaupteten „die Gruppe ist WEG". **Eine Prüfung, die eine
   Bedeutungsänderung nicht merkt, prüft die Umsetzung und nicht die Regel.**
6. **`last_message_at` ist ein TRIGGER und keine achte Funktion.** Eine
   `security definer`-Funktion umgeht die Policies, müsste also `nachricht_schreiben`
   NACHBAUEN — dann stünde Ians `SCHREIB_REGEL` zweimal da. **Die Regel aus Punkt 1
   hat damit eine Grenze: Ein fehlender Grant verlangt eine Funktion, WENN etwas zu
   entscheiden ist.**

⚠️ **Was 20.5 NICHT ist: die App-Seite.** Die App ruft weiter `aendern()` gegen
`mock.ts`; `tsc` ist unberührt sauber. **Und eine Schuld ist ausdrücklich
abgesprochen:** Der Prototyp kennt `aufgeloest_am` nicht — in 20.4 braucht `Group` ein
`aufgeloestAm?`, und **jede Gruppen-LISTE muss es herausfiltern**, sonst steht eine
tote Gruppe unter „Deine Gruppen". Dieselbe Bauart wie `aus_aktivitaet` (harte
Regel 56).

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
und lässt Angriffe von außen laufen; erwartet waren damals 25 Häkchen und kein Kreuz
(seit 20.4-a sind es 121). Sechs
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


---

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
   deshalb überlebt Entscheidung 1**.* *(Phase 20.3 ist seither fertig.)* **Von den zwei Kartenfehlern war einer keiner** (der 14.
   Bezirk stimmt, gegen die amtlichen Daten nachgerechnet) und einer gehörte einer
   älteren Fassung (der Filter-Knopf, erledigt durch 19f).
10. **Backend** (Phase 20) ← *hier sind wir* — ~~Schema (20.1)~~ ✅ · ~~Policies
   (20.2)~~ ✅ *beide 2026-09-06, ohne Konto gebaut und mit 25 Angriffen belegt* ·
   ~~**Anmelden, die Naht (20.3-a)**~~ ✅ *2026-09-09, ohne Konto und ohne Build:
   `CURRENT_USER_ID` gelöscht, Sitzung, Torwächter, Anmelde-Bildschirm mit Attrappe* ·
   ~~**Schreiben, die SQL-Seite (20.5)**~~ ✅ *2026-09-10, wieder ohne Konto: sieben
   Funktionen und ein Trigger, 78 Häkchen* · ~~**Lesen, die Übersetzung (20.4-a)**~~
   ✅ *2026-09-10, wieder ohne Konto: `data/zeilen.ts`, die zwei abgesprochenen
   Schulden bezahlt, 121 Häkchen* · ~~**Lesen, die Abfragen (20.4-b)**~~ ✅ *2026-09-12
   am echten Server: Client, dreizehn Abfragen, Realtime, Ladezustand, 29 Häkchen —
   **der Schalter bleibt aber auf `'attrappe'`, umlegen geht erst mit 20.3-b*** ·
   ~~**Anmelden, der E-Mail-Code (20.3-b1)**~~ ✅ *2026-09-12 am echten Server: echte
   Anmeldung per Code, vierter Sitzungszustand, Bildschirm fürs erste Konto
   (Entscheidung 44), 29 Häkchen — **ohne neuen Baustein und ohne Build*** ·
   ~~**Schreiben, die App-Seite (20.5)**~~ ✅ *2026-09-12 am echten Server: alle 22
   Schreib-Aktionen über `data/senden.ts`, Entscheidungen 46 und 47, zwei neue
   Migrationen (0006, 0007), **49 Häkchen am echten Server** — und der Prototyp ist
   Pixel für Pixel unverändert. **Dabei kam heraus, dass die Rechteliste aus 0002 am
   echten Supabase nie galt** (harte Regel 85).* ·
   ~~**Profilbilder, der Server (20.6-a)**~~ ✅ *2026-09-12 am echten Server: Bucket,
   vier Policies, `features/social/bild.ts`, Upload über `data/senden.ts`, Bildwahl im
   Browser, Entscheidungen 50 und 51, **24 Häkchen** — und der Prototyp ist Pixel für
   Pixel unverändert. **Dabei kam heraus, dass `storage.objects` an keinem
   Fremdschlüssel hängt und Supabase dort jedes SQL-`delete` verbietet** (harte
   Regeln 88 und 89).* ·
   ~~**Anmelden, Apple und Google (20.3-b2)**~~ ✅ *2026-09-13: beide Wege über
   `signInWithIdToken()` — Apple nativ, Google über Code-Weg mit PKCE. **48 Häkchen**
   in `npm run pruef-anbieter`, der beide Schalterstellungen misst. **Es hat weder
   einen neuen Baustein noch einen neuen Build noch einen weiteren Klick von Ian
   gekostet**: Die fünf Bausteine lagen seit dem 12.09. im Binary, die Provider stehen
   seit derselben Nacht (`apple: true, google: true`, live gemessen). **Dabei kam
   heraus, dass ein NONCE die Anmeldung am Gerät gekippt hätte** — Apple hasht nicht,
   Supabase schon (harte Regeln 93 und 94).* ·
   ~~**Die geteilte Sitzung am Gerät**~~ ✅ *2026-09-13: `zusammensetzen()` steht,
   **Ians Wahl A — nachsehen, nicht glauben**, **29 Häkchen, kein Kreuz**. **Dabei kam
   heraus, dass der Prüfstand eine Feldreihenfolge verlangte, die nach `aufteilen()`
   gar nicht mehr existiert — und dass Ians Entscheidung von keiner einzigen Prüfung
   bewacht war**: Die naheliegende Vereinfachung bestand alle 24 Häkchen. Beides
   behoben, B fällt jetzt mit 5 Kreuzen durch.* ·
   ~~**Der Lösch-Screen wird angeschlossen (20.6-c)**~~ ✅ *2026-09-12: `/account-loeschen`
   ruft `konto_loeschen()` wirklich auf, Entscheidungen 52 und 53, **27 Häkchen am echten
   Server**. **Dabei kam heraus, dass jeder OHNE Profilbild einen Satz über einen Verlust
   bekommen hätte, den es nie gab** — und dass ein Fehler beim Bild-Entfernen das Konto
   unlöschbar gemacht hätte.* ·
   ~~**Profilbilder am Gerät (20.6-b)**~~ ✅ *2026-09-13: `expo-image-picker` mit
   Zuschnitt (Entscheidung 54), `lib/base64.ts`, **35 Häkchen** im neuen
   `pruef-bildwahl` und **32 statt 27** in `pruef-bilder`. **Dabei kam heraus, dass
   `asset.uri` bei einem iPhone-Foto HEIC bleibt und `asset.base64` immer JPEG ist**
   — der naheliegende Weg hätte jedes gewöhnliche Handyfoto abgewiesen (harte
   Regeln 90 und 91). **Hing nachgemessen NICHT an Ians Supabase-Klick.*** ·
   ~~**Meldungen lesen (20.7)**~~ ✅ *2026-09-13: `npm run meldungen`, Entscheidungen
   58 und 59, `0009_meldungen.sql`. **Dabei kam heraus, dass `reports.erledigt_von`
   ein Konto UNLÖSCHBAR gemacht hätte** (harte Regel 98) — und dass zehn Screens den
   @-Namen ohne `@` gezeigt hätten, sobald der Schalter steht (harte Regel 99).
   **Was fehlt, ist HANDELN:** Inhalte entfernen und Nutzer ausschließen, beides
   Apple 1.2, gehört in dasselbe Werkzeug.* ·
   ~~**Aufräumen (20.8)**~~ ✅ *2026-09-13 — und es fällt das Gegenteil von dem weg, was
   der Plan sagte: `statisch.ts` BLEIBT (Ians Entscheidung 75), dafür bekommt `deploy.sh`
   seinen vierten Wächter. **Dabei kam heraus, dass mein eigener erster Wächter genau den
   Zustand durchgelassen hätte, gegen den er gebaut ist** — `gruppe/neu.html` ist eine
   statische Route und zählte mit.*
   Danach fällt 19d-2 nebenbei ab.

10b. ✅ **DER GERÄTEDURCHGANG IST GEMACHT** *(2026-09-13 nachmittags, 7 von 7)*.

10c. ~~**Kein Knopf schweigt mehr (20.9)**~~ ✅ *2026-09-13 abends: alle 14 Stellen zu,
   `checksVoidReturn` steht dauerhaft auf `true` (**81 Probleme wie vorher**), und der
   Wurf selbst ist keiner mehr — Ians **Entscheidung 71** (harte Regel 103) macht aus
   einem Programmfehler einen Zustand statt eines Nichts. Neuer Prüfstand
   `npm run pruef-programmfehler` (**25 Häkchen**, ohne die Zweige 8 Kreuze).*
   🔴 **Dabei kamen DREI Prüfstände heraus, die schon seit demselben Morgen rot waren**
   — `pruef-schreiben`, `pruef-konto` und, darin versteckt, eine Aktionsliste, in der
   `kontoLoeschen` seit 20.6-c fehlte. Alle drei repariert; `pruef-konto` meldet
   seither **32 statt 29**.

10d. ~~**Der Leser darf auch handeln (20.7-b)**~~ ✅ *2026-09-13 abends:
   `npm run meldungen -- post-loeschen` und `-- konto-loeschen`, beide mit Vorschau
   und `--wirklich`. **Damit ist die Apple-1.2-Pflicht vollständig.** Drei
   Entscheidungen von Ian (**72** ausschließen heißt löschen · **73** erledigt ist
   erledigt · **74** der Kasten-Knopf bleibt), eine neue Migration
   (`0010_moderation.sql`), ein neuer Prüfstand (`npm run pruef-moderation`, **31**).
   Lokal **171 statt 136**.*
   🔴 **Dabei kam heraus, dass `PUBLIC` in Postgres JEDE neue Funktion ausführen darf**
   — ohne `revoke` wäre `konto_entfernen` ein Knopf gewesen, mit dem jeder Angemeldete
   jedes Konto löscht (harte Regel 104). **Und dass der Erbfolge-Pfad in
   `konto_loeschen()` nie gelaufen war**: In den Prüfdaten gibt es keine Gruppe, in der
   eine Erbfolge stattfinden könnte.
   ⚠️ **Die zwei vorher gemessenen Fallen haben beide gehalten:** `konto_loeschen()`
   nimmt weiter keinen Parameter (der Wächter aus 0009 ist erfüllt — das fremde Konto
   hat eine EIGENE Tür), und ein blankes `delete from auth.users` gibt es nicht: Beide
   Türen führen auf denselben Rumpf `konto_weg()`, in dem die Erbfolge mitläuft.
   **Der Befehl heißt `konto-loeschen`, nicht `konto-sperren`** — Ian hat „löschen"
   gewählt, und ein Befehl namens „sperren", der löscht, ist ein Name, der lügt.

10e. **Der runde Zuschnitt (20.6-d)** — Ians Wunsch vom 13.09. ⚠️ **Kein rundes BILD:**
   JPEG hat keinen Alphakanal. Gemeint ist ein rundes FENSTER beim Aussuchen; gespeichert
   bleibt ein Quadrat, `SsAvatar` zeichnet ohnehin rund. Braucht `expo-image-manipulator`
   (liegt NICHT in `node_modules`) und damit einen neuen Build — **gern im selben Build
   wie etwas anderes Natives.**
   **Vier ungeprüfte Sachen haben sich auf Ians iPhone gestapelt, alle vom 13.09.:**
   Apple-Login · Google-Login · der Bildwähler (Erlaubnis-Dialog, Zuschnitt, echte
   Dateigröße bei `BILD_QUALITAET = 0.8`) · und ob die Anmeldung einen Neustart
   überlebt (nimmt der Schlüsselbund die 14 Byte an?). **Keine davon kann ein Mac
   beantworten**, und vier ungeprüfte Sachen auf einem Haufen sind die Lage, aus der
   bei ACTA die teuren Tage wurden.
   ✅ **Alles Vorbereitende ist am 13.09. erledigt — es fehlt nur noch das iPhone.**
   Der Schalter steht auf `'supabase'`, die App ist **gebaut** (gültig bis 2027-09-13,
   `TimeToLive: 365` nachgemessen) und im Bundle steckt nachgemessen `'supabase'`.
   **Für Ian ist es ein Befehl:** `npm run geraet` — iPhone anstecken oder gleiches
   WLAN, entsperrt lassen; der Build ist inkrementell **in 20 Sekunden** durch, danach
   wird nur installiert. **Kein neuer Baustein** — die fünf liegen seit dem 12.09. im
   Binary.
   🔑 **Der Schalter war NIE der Blocker, und das wurde bis zum 13.09.
   zusammengeworfen.** `'attrappe'` stand im Weg wegen der ÖFFENTLICHEN Adresse (zwei
   tote Knöpfe, und Ians Prototyp-Hinweis behauptet „Es gibt keinen Login", harte
   Regel 22). Die bekommt ihren Stand aber **nur aus `npm run deploy`** (harte
   Regel 35) — ein Gerätebuild ist etwas anderes. Umgelegt, gebaut, gemessen: **die
   Webseite ist byte-identisch unberührt.** Beide Fragen sind seither getrennt
   bewacht — Entscheidung 56 nimmt dem Hinweis die Lüge, harte Regel 96 dem Deploy das
   Versehen. Ob die Webseite nachzieht, bleibt Ians getrennte Entscheidung.
   Die Schritte für Ian stehen in `_FUER_IAN/HANDY_DURCHGANG.md`, **Durchgang 3**.
11. **App Store** (Phase 21) — 13+, Rechtstexte, TestFlight, einreichen

> Der Plan dazu steht ausgeschrieben in **[PLAN.md, Abschnitt 5b](PLAN.md)**. Die drei
> Wahlen darin sind seit dem 2026-09-06 entschieden.

