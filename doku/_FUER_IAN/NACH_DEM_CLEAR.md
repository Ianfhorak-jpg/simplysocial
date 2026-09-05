# Was du nach dem Clear schreiben sollst

> Diese Datei steht hier, weil der Chat nach dem `/clear` weg ist — der Text darin
> also auch. Hier findest du ihn wieder.
>
> Stand: **05.09.2026.** **Phase 0 bis 18a sind fertig und online** — damit ist
> **alles gebaut, was Christoph, Leopold und Daria am 02.09. gesagt haben**: die Emojis
> raus (14), Altersgruppe und Filter (15), Direktnachrichten (16) und Gruppen (17).
> **Und was Leopold am 03.09. beim wirklichen Benutzen gefunden hat, ist seit dem 05.09.
> auch zu** (18a) — siehe gleich unten. Die Liste ist leer.

---

## Das Neueste: man kann jetzt Leute in eine Gruppe einladen (05.09.)

Leopold hat am 03.09. eine Gruppe gegründet — und **sass allein drin**. Es gab keinen Weg,
jemanden hineinzuholen; gebaut war nur die Richtung von aussen nach innen (anfragen, der
Gründer sagt ja). Das ist jetzt zu.

**Was neu ist:** In jeder Gruppe, in der du drin bist, steht unter „Wer dabei ist" ein
Knopf **„Leute einladen"**. Und beim Gründen gibt es unten die Frage **„Wer darf hinein?"**
mit *Offen* oder *Privat*.

**Drei Sachen hast du dabei entschieden:**
1. **Einladen darf jedes Mitglied**, nicht nur der Gründer. Eine Tennisgruppe ist keine
   Behörde.
2. **Private Gruppen stehen in keiner Liste.** Wer den Link bekommt, sieht Name,
   Kategorie, Bezirk und wie viele drin sind — sonst nichts, und keinen Weg hinein.
3. **Voreingestellt ist „Offen"**, weil die meisten nichts umstellen und sonst niemand
   mehr eine Gruppe fände.

Ausführlich mit Ausprobier-Anleitung steht das in `README.md`, Abschnitt „Erledigt:
Leute in eine Gruppe einladen".

---

## Zuerst: der Fehler, den du gefunden hast, ist weg (03.09.)

Du hast geschrieben, dass bei den Karteikarten **„das Weg-Zeichen immer da"** ist und
dass die Karte **komisch gedreht** aussieht. Beides stimmte, und es war **ein einziger
Fehler**, der beides gemacht hat. Er ist behoben und schon hochgeladen — der Link zeigt
die richtige Fassung.

**Was los war, ohne Fachwörter:** Die Karte rechnet aus, wie weit du sie gezogen hast —
gemessen daran, wie breit sie ist. Wenn die Seite gebaut wird, gibt es aber noch keinen
Bildschirm, also ist die Breite *null*. Und „wie weit von null bis null" lässt sich
nicht ausrechnen. Statt einer Fehlermeldung nimmt das Programm dann einfach den
**äußersten** Wert — also genau den, der gilt, wenn man die Karte ganz nach links
gezogen hat. Deshalb lag sie schief, war leicht vergrößert und trug den „Weg"-Stempel:
Die App zeigte einen Zug, den nie jemand gemacht hat.

**Warum es nicht von allein wieder richtig wurde:** Sobald die Seite offen ist, wird die
Karte gemessen und die Rechnung stimmt wieder. Nur schreibt die App das Bild erst dann
neu, wenn sich wirklich etwas **bewegt**. Und bewegt hat sich nichts — bis du eine Karte
angefasst hast. Bis dahin blieb das falsche Bild einfach stehen.

Behoben ist es an der Wurzel: Die Breite darf jetzt nie mehr null sein. Damit stimmt die
Karte schon im allerersten Bild, ohne dass irgendwer sie anfassen muss. Nachgeprüft
habe ich es dreifach — im gebauten Bild, im Browser und danach an der echten Adresse;
und dass das Wischen weiterhin geht (115 px ziehen → Karte kippt mit und fliegt weg).

> **Das Ärgerliche daran, und es gehört dazu:** Genau diesen halben Zustand hatte ich am
> 02.09. schon einmal gesehen (Phase 13) — und ihn damals nur **zugedeckt**, statt die
> Ursache zu suchen. Die Abdeckung ging nach einer Sekunde weg, der Dreh blieb. Deshalb
> hast du ihn gesehen. Steht jetzt als Warnung in den Regeln.

---

## Und noch etwas vom 03.09.: die Arbeit ist jetzt gesichert

Beim Nachsehen kam heraus, dass auf GitHub als **Quellcode noch der Stand vom 01.09.**
lag — neun Phasen Arbeit (rund 7.000 Zeilen) gab es nur auf deinem Laptop. Auch PLAN.md
und dieser Ordner hier lagen in gar keiner Sicherung.

Der Grund ist eine Falle im Namen: `npm run deploy` heißt „hochladen", schiebt aber nur
die **fertig gebaute Seite** ins Netz. Den Quellcode fasst es nie an, und aus der
gebauten Seite bekommt man ihn nicht zurück.

Alles ist inzwischen hochgeladen, die Doku liegt im Ordner `doku/` mit dabei, und sie
frischt sich beim Speichern selbst auf. **Merksatz für später:** `npm run deploy` bringt
die Seite ins Netz, `git push` bringt die Arbeit in Sicherheit — zwei verschiedene
Dinge, du brauchst beide.

---

## Kopier das in den Chat

**Es steht keine Phase mehr an.** Der nächste Schritt passiert nicht im Code, sondern
im Chat mit deinen Mitgründern: **Schick ihnen den Link noch einmal.** Sie haben die
Fassung von *vor* diesen vier Umbauten gesehen.

Wenn du danach zurückkommst, schreib, was sie gesagt haben — zum Beispiel so:

```
Lies PLAN.md. Die drei haben die neue Fassung gesehen, das haben sie gesagt: [...]
```

**Mehr braucht es nicht.** In PLAN.md steht alles: was gebaut ist, welche
Entscheidungen feststehen und warum. Du musst nichts aus dem Kopf wiederholen — nur
das Neue mitbringen, denn das steht nirgends.

**Wenn du stattdessen weiterbauen willst**, sind das die drei großen Brocken (PLAN.md,
Abschnitt 5, „Später"). Alle drei sind größer als jede bisherige Phase:

| Was | Warum es groß ist |
|---|---|
| **Echtes Backend** | Login, Datenbank, Server-Regeln. Bis dahin sind alle Daten erfunden und ein Neuladen setzt zurück. |
| **App-Build (EAS)** | Aus der Website eine echte iPhone-App machen. Dabei kommen auch die Symbole auf iOS dazu (siehe OFFENE_SACHEN.md, Punkt 3). |
| **App Store** | Braucht Backend UND Build, plus den Rechtstext, den nur du besorgen kannst (OFFENE_SACHEN.md, Punkt 1). |

**Mein Rat: zuerst herzeigen.** Alles hier oben lässt sich noch billig ändern. Sobald
eine Datenbank dahintersteht, kostet jede Änderung ein Vielfaches.

> **Zwei Sachen, die du noch selbst erledigen solltest:**
> - **Daria sagen, was „beides" konkret heißt.** Du wolltest, dass beide ihrer Fragen
>   beantwortet werden — das Alter *und* wie die Person aussieht. Das Alter kommt voll;
>   beim Foto wird der **Platz** gebaut, aber noch kein Bild hochgeladen. Bis zum
>   Backend sieht sie also Initialen statt Gesichter. Das ist die halbe Antwort, und
>   sie soll wissen, dass es die halbe ist — sonst wundert sie sich beim nächsten Mal.
> - **Leopold antworten** auf seine Frage „Wäre das alles für die erste Version?" —
>   deine Antwort war: erst weiter im Prototyp, Backend danach. Der Grund lohnt sich zu
>   sagen: Funktionen, die nie jemand geklickt hat, landen sonst fest in einer Datenbank.

## Was am 02.09. abends dazukam: Phase 17, die Gruppen

Leopolds letzter Punkt. **Das Wichtigste zuerst, weil es leicht zu übersehen ist:**
Eine Gruppe ist **kein eigener Ort** in dieser App. Kein Gruppen-Tab, kein
Gruppen-Feed. Eine Gruppe ist eine dritte Einstellung beim Posten — neben „Alle" und
„Nur meine Follower" steht jetzt „Nur Marswiese Tennis". Der Post landet dann im **ganz
normalen Feed**, nur bei weniger Leuten, mit dem Gruppennamen an der Karte.

Der Grund: Ein eigener Feed je Gruppe hätte den Hauptfeed leergesaugt — und am Anfang,
wenn wenig los ist, ist ein leerer Hauptfeed das größere Problem.

**Wo du es findest:** Profil → „Deine Gruppen". Drei sind angelegt, jede zeigt einen
anderen Fall: eine, in der du bist (Marswiese Tennis), deine eigene mit zwei offenen
Beitritts-Anfragen (Lernen fürs Zeugnis), und eine, in der du NICHT bist und angefragt
hast (Kino am Donnerstag). Bei der letzten siehst du weder die Posts noch, wer drin ist
— **das ist der Beweis, dass die Einstellung wirklich etwas tut.**

Die Beitritts-Anfragen liegen im **selben Anfragen-Tab** wie die „Bin dabei"-Anfragen
und zählen in dieselbe rote Zahl. Absicht: Es ist derselbe Vorgang, also soll es sich
gleich anfühlen — ein Muster weniger zum Lernen.

**Deine zwei Entscheidungen von heute stecken darin:** Posts bleiben stehen, wenn du
eine Gruppe verlässt. Und verlässt der Gründer, geht die Gruppe an den weiter, der am
längsten dabei ist — bei „Lernen fürs Zeugnis" sagt dir die Rückfrage vorher „Die
Gruppe geht an Sara".

*Eine Sache ist anders herausgekommen, als ich sie dir beschrieben habe:* Ich hatte
gesagt, du siehst deine eigenen Posts nach dem Austritt nicht mehr. Stimmt nicht —
eigene Posts sieht man in dieser App immer. Der Haken ist damit **kleiner** als
beschrieben.

## Was heute (02.09.) gebaut wurde: Phase 14, die Emojis

**Christoph hatte recht — es waren 107 Stück in 24 Dateien.** Alle sind raus, ersetzt
durch **41 selbst gezeichnete Symbole**. Was du davon merkst:

- **Die Kategorie-Symbole haben jetzt die Farbe ihrer Kategorie.** Ein Emoji ist immer
  bunt, egal worauf es liegt — deshalb sah das Laufen-Emoji auf der gelben Sport-Pille
  aus wie ein Aufkleber, den jemand draufgeklebt hat.
- **Die Leiste unten** unterscheidet ausgewählt und nicht ausgewählt jetzt über die
  Farbe. Vorher waren die anderen drei halb durchsichtig — das sah aus, als wären sie
  kaputt, nicht als wären sie einfach nicht dran.
- **Profilbilder sind Anfangsbuchstaben** auf farbigem Grund. Das ist genau der Platz,
  an dem in Phase 15 das echte Foto sitzt.
- **Die Landing-Page hat dieselben Symbole bekommen.** Sonst hätte man beim Umschalten
  gemerkt, dass das zwei verschiedene Sachen sind.
- *Nebenbei aufgefallen:* Du und Lea hattet **dieselbe Avatarfarbe**. Lag an der Art,
  wie die Farbe berechnet wurde, und ist unter den Emojis nie aufgefallen. Schau dir
  den Match-Bildschirm an — jetzt sind es zwei verschiedene.

> **Die eine Sache, die du beurteilen musst:** Emojis waren bunt und sofort erkennbar,
> Striche sind es nicht. **Kommt dir der Feed jetzt zu grau vor?** Dann ist die App
> zwar erwachsener, aber langweiliger — und das wäre kein guter Tausch. Der Weg zurück
> ist **nicht** "Emojis wieder rein", es sind zwei Zahlen im Code. Sag einfach
> *"zu blass"* oder *"passt"*.
>
> **Und etwas, das du wissen solltest:** Wenn die App später als echte iPhone-App
> läuft (nicht im Browser), stehen an den Stellen der Symbole vorerst **leere Kreise**.
> Kein Fehler — Symbole zeichnen bräuchte dort ein Zusatzpaket, und genau die Sorte
> Paket hat bei ACTA die Vorschau zerlegt. Beim ersten echten App-Build kommt es rein,
> das ist eine Datei und ungefähr eine Stunde. Im Browser, also überall, wo du den Link
> herzeigst, ist alles vollständig da. Steht auch in
> [OFFENE_SACHEN.md](OFFENE_SACHEN.md), Punkt 3.

**Am 02.09. dazugekommen, nachdem du es am Handy geöffnet hast:**
- **Das kurze Komische beim Öffnen auf Chrome ist weg.** Es lag am Standbild, das beim
  Hochladen von jeder Seite gebaut wird: Darin lag die oberste Wischkarte schief, weil
  der Computer beim Bauen weder die Bildschirmbreite noch die Kartengröße kennt. Jetzt
  liegt eine ruhige Fläche mit dem Schriftzug darüber, bis die App wirklich da ist —
  und die verschwindet auch dann, wenn das Laden komplett fehlschlägt.
- **Der Prototyp-Hinweis ist unten**, wie eine Cookie-Abfrage, mit „Verstanden"-Knopf.
- Nebenbei repariert: Die Seite gab sich als englisch aus (deshalb bot Chrome
  „Übersetzen?" an), im Browser-Tab stand kein Name, und die Adressleiste am Handy
  hatte nicht die Farbe der App.

**Es wartet keine Frage mehr auf dich** — die letzten zwei sind am 02.09.2026 erledigt:

1. **Der Bezirk ist jetzt freiwillig.** Gefragt war, was passieren soll, wenn du in
   einem *zugeklappten* Feld etwas kaputt machst. Du hast geantwortet, dass man die
   Option haben soll, gar keinen Bezirk anzugeben — und damit ist der häufigste Fall
   des Problems weg, statt behandelt zu werden. Feld leer lassen genügt; am Post steht
   dann **„Wien"** statt einer Zahl. Ausprobieren: der Post *„Donauinsel spazieren"* im
   Feed hat als einziger keinen Bezirk. Das ist Absicht — die Insel ist 21 km lang und
   geht durch drei Bezirke, eine einzelne Zahl wäre dort falscher als gar keine.
   *Ein Rest bleibt:* Tippst du etwas **Falsches** hinein („9999"), klappt die App beim
   Posten von selbst auf und zeigt dir die Stelle. Ein leeres Feld ist in Ordnung, ein
   falsches nicht.
2. **Die drei Striche** stehen jetzt vor „Mehr einstellen", so wie du es ursprünglich
   gesagt hattest. Ich hatte ein Zahnrad eingebaut und dagegengehalten — du hast es dir
   angeschaut und bist bei deiner Idee geblieben. Passt.
   *(Seit Phase 14 gezeichnet statt als Zeichen getippt — dieselbe Form, aber jetzt
   genau so dick wie jeder andere Strich in der App.)*

Mehr braucht es nicht. `CLAUDE.md` wird automatisch geladen und verweist auf `PLAN.md`,
und dort steht alles: was gebaut ist, welche Entscheidungen feststehen und warum.

**Die eckige Klammer bitte wirklich ausfüllen.** Ab jetzt sind die Rückmeldungen deiner
Freunde die bessere Quelle für Änderungen als der Plan — und die stehen nirgends
aufgeschrieben, wenn du sie nicht mitbringst.

## Was aus deiner Rückmeldung vom 01.09. geworden ist

**Phase 10 — die Landing-Page ✅ fertig und hochgeladen** *(01.09.2026)*
- Das Laufband, das dich gestört hat, fliegt raus. Stattdessen stehen die sechs Farben
  ruhig da, ohne Bewegung.
- Die drei Schritte werden neu formuliert. Du hattest recht bei „erst dann geht der Chat
  auf" — das klingt nach Sperre, und aufgehen tut ein Chat nicht.
- „Wer wir sind" wird auf einen Satz gekürzt. Der Rollen-Satz fliegt **ganz** raus.

**Phase 11 — der Wischstapel ✅ fertig**
Karteikarten, die man wegwischt. Links = weg, rechts = ich will mit. Beim Ziehen kippt
die Karte, hebt sich vom Block ab und bekommt oben eine Abrisskante — wie ein Post-it,
das man abreißt. Der Stapel wird der Startbildschirm.
Die **Liste bleibt daneben** — das war deine Entscheidung, und der Grund steht in
PLAN.md: An einem ruhigen Tag sind nach drei Wischern alle Karten weg. Dann ist der
Bildschirm nicht leer, sondern zeigt die Liste und „poste selbst was".
**Rechts wischen** lässt unten eine Leiste hochfahren, in der schon ein „Hey!" steht —
du kannst tippen, musst aber nicht, Senden reicht.
**Die erste Karte erklärt sich selbst.** Statt einer Einführung, die man wegtippt, ist
die oberste Karte beim ersten Öffnen eine Anleitungskarte: Man lernt das Wischen,
indem man sie wegwischt.

*Drei Sachen sind beim Bauen dazugekommen, die vorher nicht besprochen waren:*
- **Zwei Knöpfe unter dem Stapel** („Weg" und „Bin dabei"). Nicht als Bequemlichkeit:
  Wer die App mit VoiceOver oder am Schreibtisch mit der Tastatur bedient, kann nicht
  wischen — für den wäre der Startbildschirm sonst eine Wand.
- **Ein Zähler** oben rechts („Noch 7 Karten", am Ende „Durch"). Ohne ihn fühlt sich
  jeder Stapel entweder endlos oder gleich zu Ende an.
- **Ein „Rückgängig"** für ein paar Sekunden, wenn du nach links gewischt hast.
  **Das ist mein Vorschlag, nicht deine Entscheidung** — wenn es dich stört, sag es,
  es ist eine Zahl in einer Datei.

**Phase 12 — Posten und die kleinen Fehler ✅ fertig**
- Beim Posten stehen nur noch **Kategorie und Titel** da. Alles andere steckt hinter
  „Mehr einstellen". Wann, Bezirk und Plätze setzen sich von selbst — und du siehst in
  der Vorschau, was gesetzt wurde, bevor du auf Posten tippst. **Ausprobiert:**
  Kategorie tippen, Titel tippen, Posten — fertig ist ein Post mit Zeit, Bezirk und
  drei Plätzen.
- Das „Alle" bei den Aktivitäten klebte am Rand. Behoben, nachgemessen.
- Die Pillenreihe hat jetzt rechts eine **weiche Kante**, wenn dort noch etwas liegt —
  und **nur dann**. Passt alles auf den Schirm, ist keine da; bist du ganz rechts,
  wandert sie nach links. Eine Kante, die immer steht, würde etwas versprechen, das
  nicht kommt.

*Eine Sache ist beim Bauen dazugekommen, die vorher nicht besprochen war:* Wenn ein
**zugeklapptes** Feld ungültig ist, gibt es plötzlich einen Fehler, den man nicht sehen
kann. Den hast du am 02.09. weitgehend aufgelöst, indem du den Bezirk freiwillig
gemacht hast — siehe Punkt 1 ganz oben.

**Zum Standort:** Im Prototyp geht es nicht — beide Wege (IP oder GPS) brauchen einen
Aufruf an einen fremden Dienst, und genau das ist die Regel, die bei ACTA die
Web-Version zerlegt hat. Zwei Sachen noch: IP-Ortung trifft in Wien oft den Provider
statt deinen Bezirk, und ein **VPN macht sie falscher**, nicht besser — es zeigt dorthin,
wo der Tunnel rauskommt. Für die echte App ist der saubere Weg, einmal nach dem Standort
zu fragen, daraus den Bezirk zu bestimmen und **die Koordinaten wegzuwerfen**. Steht in
OFFENE_SACHEN.md.

---

## 🔗 Beides ist online

**Landing-Page:** https://ianfhorak-jpg.github.io/simplysocial-landing/
**Prototyp:** https://ianfhorak-jpg.github.io/simplysocial/

**Schick die Landing-Page**, nicht den Prototyp — sie erklärt zuerst, worum es geht.
Wer den Prototyp direkt aufmacht, landet mitten in einem fremden Feed.

Wenn du den Prototyp trotzdem einzeln herschickst, **schick diesen Satz mit:**

> „Das ist ein Prototyp — alle Posts und Chats sind erfunden. Es gibt noch keinen
> Login, ihr seid deshalb alle als *ich* drin. Und wenn ihr neu ladet, fängt alles
> von vorn an. Sagt mir, was sich falsch anfühlt."

Die App sagt das beim ersten Öffnen selbst — aber Links werden weitergeleitet,
Erklärungen nicht.

Jeder Bildschirm hat eine eigene Adresse, du kannst also auch direkt auf einen Post
verlinken: [.../post/p4](https://ianfhorak-jpg.github.io/simplysocial/post/p4).

Neu hochladen nach einer Änderung: `cd simplysocial && npm run deploy`.

---

## ✅ Deine neun Entscheidungen sind drin

**1. Im Feed steht das Neueste oben.** Schreib einen Post — er steht sofort ganz oben.

**2. Ein Post bleibt bis zum Ende seines Tages** — beim Posten kannst du abweichen
(„Bis es losgeht" · **„Bis Tagesende"** · „Einen Tag länger").

**3. Volle Plätze: die übrigen Anfragen bleiben stehen.** Niemand wird automatisch
abgesagt. Springt jemand ab, kannst du die Anfrage doch noch bestätigen.

**4. Chats nach dem Treffen: erst „Vorbei", dann weg.** Der Chat rutscht nach dem
Treffen in eine Gruppe **„Vorbei"** und verschwindet dort nach **einer Woche**.

**5. Die neuen Chats stehen immer ganz oben.** Auch dann, wenn darunter gerade jemand
schreibt — solange in einem Chat noch nichts steht, ist der Treffpunkt nicht ausgemacht.

**6. Auf ein Profil kommt nur, was gerade läuft.** (neu am 01.09.) Kein Archiv von
Treffen, die schon waren. Das Profil ist ein **Aushang**, kein Lebenslauf — dieselbe
Haltung wie bei Nummer 2 und 4: In deiner App überlebt nichts seinen Anlass.

*Was du dabei in Kauf nimmst:* Wer gerade nichts geplant hat, hat ein leeres Profil —
und das trifft die meisten Leute die meiste Zeit. Genau dann, wenn jemand überlegt, ob
er dir schreiben soll, steht dort nichts.

*Wie die App das abfängt:* Ein Profil ohne Posts zeigt nicht „nichts gefunden", sondern
Bio, Bezirk und **Interessen** — deshalb stehen die Interessen weit oben und nicht als
Beiwerk unten. Sie tragen dort die Last, die sonst die Post-Liste trägt.

*Verworfen hast du damit:* eine zweite Gruppe „Schon gewesen" (wäre das stärkste
Vertrauenssignal der App, aber der einzige Ort, an dem doch alles bleibt) und die reine
Zahl „17 Treffen gepostet" (kann niemand nachprüfen, und sie belohnt Menge).

**7. Blockieren heißt: alles weg.** (neu am 01.09.) Du hast die härteste der drei
Möglichkeiten gewählt. Wer blockiert wird, ist raus: Posts weg, keine Anfragen mehr,
**der Chat verschwindet**, und **eine schon bestätigte Verabredung wird abgesagt** — der
Platz im Post wird wieder frei.

*Warum das in DEINER App richtig ist:* Bei Instagram heißt blockieren „sieht meine
Bilder nicht mehr". Bei dir heißt es „taucht nicht mehr am selben Ort auf wie ich". Eine
Verabredung, die einen Block überlebt, ist genau das Problem, vor dem der Block schützen
soll.

*Was du dabei in Kauf nimmst:* Ein Fehlgriff kostet eine echte Verabredung. Der andere
erfährt nicht, dass er blockiert wurde — er sieht nur, dass die Zusage weg ist.

*Wie die App das abfängt:* Blockieren ist neben „Account löschen" die einzige Stelle in
der App, die **vorher nachfragt**. In der Rückfrage steht Punkt für Punkt, was passiert
— auch, dass eine Verabredung abgesagt wird.

*Verworfen hast du damit:* **LEISE** (nur nichts Neues mehr; Chat und Verabredung
bleiben — Haken: man blockiert meist wegen etwas, das im Chat passiert ist, und genau
der bliebe stehen) und **GETRENNT** (Chat lesbar, aber stumm; absagen wäre ein eigener
Knopf — Haken: zwei halbe Zustände).

Falls sich eine davon im Betrieb komisch anfühlt, sag Bescheid — die verworfenen
Möglichkeiten stehen samt Begründung weiter in den Dateien.

---

## Was in Phase 9 dazukam (die Landing-Page)

Sie erklärt in drei Abschnitten, was SimplySocial ist: die drei Schritte
(posten → jemand meldet sich → du sagst Ja), warum ihr das baut, und wer ihr seid.
**Eure vier Namen stehen groß da** — Ian, Christoph, Leopold, Daria — und über die
Rollen steht genau ein Satz. Du wolltest kein Organigramm, sondern „dass wir das als
Team bauen"; so liest es sich jetzt.

Das Aussehen kommt aus der App: dieselben sechs Kategoriefarben, dieselben Karten mit
dem Farbstreifen links, derselbe Knopf mit dem harten Rand unten. **Die Beispielkarte
oben kannst du anklicken** — dann kommt Konfetti, genau wie beim Bestätigen in der App.

Was NICHT drauf ist: eine Warteliste. Ein Formular, das nichts speichert, wäre schlimmer
als keins — man trägt sich ein und glaubt, es sei angekommen. Kommt mit dem Backend.

---

## Was in Phase 8 dazukam (online stellen)

**8. Der Hinweis beim Öffnen** — du hast den einmaligen Balken gewählt statt „gar
nichts" oder einem festen Streifen. Einmal wegklicken, dann ist er für diesen Tab weg,
auch über Neuladen hinweg. Nicht für immer: Wer in drei Wochen wiederkommt, kriegt ihn
noch mal, weil man zwei Sätze in drei Wochen vergisst.

**9. Nichts Persönliches in den Fake-Daten** — in deiner Bio standen Schule und Klasse,
in einem erfundenen Post der echte Name eines Lehrers. Beides ist raus. Deine Bio sagt
jetzt „Bau gerade diese App. Immer für spontan zu haben." Unter deinen Freunden wäre es
egal gewesen, auf einer offenen Adresse nicht — und den Lehrer hatte niemand gefragt.

**Was technisch dahintersteckt** (falls es dich interessiert): Das Hochladen war der
kleinere Teil. Das Problem war, dass eine Adresse wie `/post/p4` beim direkten Aufruf
ins Leere lief — solange man in der App herumklickt, fällt das nie auf, aber genau das
tut ja niemand, der einen Link aus WhatsApp öffnet. Jetzt ist jeder einzelne Post,
jedes Profil und jeder Chat eine eigene, echte Seite.

---

## Was neu ist (Phase 7 — Sicherheit)

- **Melden** — auf einem fremden Profil ganz unten, und im Post-Detail ganz unten.
  Du wählst einen Grund („Belästigt mich", „Macht mich an", „Fake-Profil", …), kannst
  freiwillig etwas dazuschreiben, fertig. Die Meldung wird gespeichert, aber **niemand
  liest sie** — dafür braucht es das Backend. Die App behauptet auch nichts anderes.
- **Blockieren** — daneben, in Rot. Fragt vorher nach und zählt auf, was passiert.
  Danach sieht das Profil der Person anders aus: nur noch Name und „Du hast diese Person
  blockiert", mit einem Knopf zum Aufheben.
- **Einstellungen** — Tab **Profil**, ganz unten. Dahinter: wen du blockiert hast (mit
  „Aufheben"), die **Nutzungsbedingungen**, **Account löschen** und die Bausteine.
- **Nutzungsbedingungen** — sechs Hausregeln, die ich geschrieben habe (kein Dating,
  echter Name, Zusagen gelten, keine Werbung, erstes Treffen öffentlich, melden statt
  streiten). Darunter ein **roter Kasten** mit dem, was ein Erwachsener schreiben muss.
  Die Lücke ist Absicht — einen Rechtstext zu erfinden, der echt aussieht, wäre das
  Gefährlichste, was ich hier tun könnte.
- **Account löschen** — zeigt dir **echte Zahlen**: 3 Posts, 2 Chats, 2 Anfragen, 8
  Verbindungen. Fragt zweimal. Der letzte Klick tut nichts und sagt das auch selbst —
  im Prototyp gibt es keine Konten, und wenn ich deins löschte, wäre der Prototyp
  danach kaputt.

---

## Was in Phase 6 dazukam (Profile)

- **Dein Profil** (Tab **Profil**) — Bild, Name, Bio, Bezirk, deine **Follower-Zahlen**,
  deine **Interessen** und deine laufenden Posts. Genau das, was andere von dir sehen:
  Es ist derselbe Bildschirm, nur mit einem Knopf mehr bei fremden Profilen.
- **Fremde Profile** — tipp im Post-Detail oben auf **den Namen des Verfassers**
  (die Karte hat jetzt einen kleinen Pfeil rechts). Dort steht dasselbe, plus **Folgen**.
- **Folgen und Entfolgen** — und das wirkt sofort: Wem du folgst, den siehst du im Feed
  unter „Wem ich folge", **und du siehst seine Posts, die nur für Follower sind.**
- **Follower-Listen** — tipp auf die Zahl „Follower" oder „Folgt". Die Liste zeigt, wem
  du schon folgst (mit einem Haken), hat aber **absichtlich keinen Folgen-Knopf**: Folgen
  soll eine Entscheidung nach einem Blick aufs Profil sein, nicht etwas, das man aus
  einer Namensliste heraus abarbeitet.
- **Kein Platzhalter mehr in der App.** Der Profil-Tab war der letzte.

---

## Wenn du schauen willst

**Einfach den Link aufmachen:** https://ianfhorak-jpg.github.io/simplysocial/
Am Handy, am Rechner, egal — seit Phase 8 brauchst du dafür kein Terminal mehr.

Nur wenn du am Code etwas ÄNDERN willst, brauchst du noch:

```
cd simplysocial
npx expo start --web
```

So oder so landest du im **Feed**.

**Der Weg, der Phase 7 am besten zeigt** — das Blockieren wirkt wirklich:

1. Tipp im Feed auf **Leas Tennis** → im Detail oben auf **Leas Namen** → ihr Profil.
   Bei ihrem Tennis steht **„Du bist dabei"** — ihr seid verabredet, und im Tab
   **Chats** steht euer Chat.
2. Ganz unten auf **Blockieren** (rot). Es kommt eine Rückfrage mit fünf Punkten, unter
   anderem **„Euer Chat verschwindet."** und **„Eine bestätigte Verabredung wird
   abgesagt."** Das ist deine Regel Nummer 7, wörtlich.
3. **Ja, blockieren** → Leas Profil zeigt nur noch ihren Namen und die Sperre.
4. **Zurück** → im Feed sind **alle drei Posts von Lea weg**.
5. Tab **Chats** → **euer Chat ist verschwunden**, nur Tobias ist noch da.
6. Tab **Anfragen** → **Geschickt** → dein Tennis mit Lea ist weg. Nur Tobias' Kaffee
   steht noch da.
7. **Profil → Einstellungen** → unter „Blockiert" steht Lea mit einem Knopf
   **„Aufheben"**. Nimmst du ihn, seht ihr euch wieder — **aber der Chat und die Zusage
   kommen nicht zurück.** Das ist der Preis von „alles weg", und er steht auch so da.

⚠️ Mach das **ohne zwischendurch neu zu laden**, sonst fängt alles von vorn an.

**Der Weg, der Phase 6 am besten zeigt** — in dieser Reihenfolge:

1. Unten auf den Tab **Profil**. Da stehst du: Bio, 4 Follower, folgt 4, deine
   Interessen und deine zwei laufenden Posts.
   **Achte darauf, was NICHT dasteht:** „Laufen um den Ring" von gestern fehlt. Das ist
   deine Entscheidung Nummer 6, in echt.
2. Tipp auf **„4 Follower"** → die Liste. Bei Mira, Tobias und Lea steht „Du folgst" mit einem Haken,
   bei **Sara** nicht — ihr folgst du nicht.
3. Tipp auf **Sara** → ihr Profil. Sie hat einen Post („Kino"), und darunter steht
   **„1 Post ist nur für Follower sichtbar."** Da ist etwas, das du nicht siehst.
4. Tipp auf **Folgen** → die Follower-Zahl springt von 1 auf 2, und **der versteckte
   Post erscheint sofort** („Englisch-Referat üben"). Das ist dein Schalter „für alle /
   nur meine Follower" vom Posten — von der anderen Seite gesehen.
5. **Zurück** → im Feed oben auf **„Wem ich folge"** umschalten. Saras Referat steht
   jetzt auch dort. Ohne Neuladen, ohne alles andere anzufassen.
6. Tipp auf eine fremde Karte (z. B. Leas Tennis) → im Detail oben auf **Leas Namen**
   → ihr Profil. Das ist der Weg, den man im Alltag nimmt: *„mit wem verabrede ich mich
   da eigentlich?"*

**Was sonst noch geht:**

- Oben rechts im Feed **„Posten"** → Formular mit Live-Vorschau der Karte
- Tab **Anfragen** → bestätigen, Konfetti, „Zum Chat"
- Tab **Chats** → die Liste der Treffen, der Chat mit dem Post oben
- Unten der Tab **Profil** → **Einstellungen** → dort stehen jetzt auch die
  **Bausteine** (sie sind vom Profil dorthin umgezogen — das Profil ist das, was deine
  Freunde sehen, und ein Entwickler-Knopf gehört da nicht hin)

⚠️ **Wenn du die Seite neu lädst, ist alles wieder auf Anfang.** Absicht, kein Fehler:
der Prototyp hat noch keine Datenbank. Für den Ablauf oben heißt das: **nicht
zwischendurch neu laden**, sonst ist das Folgen wieder weg.

---

## Falls dir an Phase 7 etwas nicht passt

Dann schreib das dazu, zum Beispiel:

```
Lies PLAN.md. Blockieren ist mir zu hart — der Chat soll bleiben,
nur schreiben soll keiner mehr können.

Danach Phase 8.
```

Das wäre die Möglichkeit **GETRENNT**, und sie steht fertig im Code — Umstellen ist ein
Wort in `src/features/safety/block.ts`. Dasselbe gilt für **LEISE**.

Was in Phase 8 kommt: der **Deploy**. Der Prototyp bekommt eine echte Adresse, die du
am Handy öffnen und in WhatsApp weiterschicken kannst. Danach (Phase 9) die
**Landing-Page** mit dem „Über uns"-Teil über euch vier — dafür brauche ich Texte und
Fotos von dir, siehe [OFFENE_SACHEN.md](OFFENE_SACHEN.md), Punkt 3.

Zwei Sachen, die du beim Herzeigen dazusagen solltest:
- **Jedes Neuladen setzt alles zurück.** Der Prototyp hat keine Datenbank.
- **Es gibt keinen Login.** Jeder, der den Link öffnet, ist du — sieht also deine Chats
  und deine Anfragen. Für einen Prototyp ist das richtig so, aber es wundert jeden, der
  es nicht weiß.
