# Offene Sachen — nur Ian kann die erledigen

> Hier sammelt Claude alles, wo es ohne dich nicht weitergeht: Geld, Rechte, Inhalte,
> Entscheidungen. Erledigtes wird abgehakt und stehen gelassen, nicht gelöscht.
>
> Stand: 06.09.2026 — **der Prototyp ist fertig, der Weg zur echten App ist geplant.**
> Drei Entscheidungen von dir sind eingearbeitet (Supabase · erst aufs Handy · drei
> Anmeldewege). **Neu und dringend: Punkt 0 gleich hier drunter.**

---

## 🔴 0. NEU und zeitkritisch — Apple hat diesen Monat die Regeln geändert

**Kurz:** Apple fragt seit Juli 2026 bei jeder App, ob Leute darin fremde Inhalte in
einem Feed sehen. Ab **September 2026** — also ab jetzt — ist die Antwort Pflicht, sonst
darf man gar nicht einreichen.

**Bei SimplySocial ist die Antwort ja.** Ein Feed mit Posts von anderen ist genau das,
was gemeint ist. Die Folge: **Die App bekommt mindestens „13+".** Das kann man nicht
wegverhandeln und es ist auch nichts Schlimmes — Instagram und TikTok stehen viel höher.

**Warum es trotzdem hier steht und nicht nur in PLAN.md:** Apples „13+" ist eine
Ladenschild-Einstufung, **keine Rechtsberatung**. Es sagt, ab wann Apple die App
anzeigt. Es sagt nichts darüber, was in Österreich gilt, wenn 16-Jährige über eine App
Treffen mit Fremden ausmachen. **Das ist weiter Punkt 1**, und Apples Neuerung macht ihn
dringender: Beim Einreichen musst du eine Zahl hinschreiben, und du solltest vorher mit
einem Erwachsenen geredet haben, ob sie stimmt.

---

## ✅ Erledigt am 06.09.2026 — drei Entscheidungen, die den ganzen Rest formen

Ich habe dir drei Fragen gestellt, bevor irgendein Code geschrieben wurde. Das war
Absicht: Alle drei sind später teuer zu ändern.

**1. Die Datenbank: Supabase.** Der Grund in einem Bild — deine wichtigste Regel ist
„wer darf welchen Post sehen" (öffentlich / nur Follower / nur meine Gruppe, und
Blockierte sehen nichts). Bei Firebase kann der Server so eine Regel **nicht anwenden**:
Er kann eine Anfrage nur ganz erlauben oder ganz ablehnen, nicht einzelne Posts
aussortieren. Man müsste in jeden Post hineinschreiben, wer ihn sehen darf — und das bei
jedem Folgen, Entfolgen und Blockieren neu ausrechnen. Bei Supabase ist es **ein Satz**,
und der Server macht den Rest. *Der Haken, den du kennst: Die Gratis-Version schläft
nach 7 stillen Tagen ein und muss aufgeweckt werden. Ab dem echten Start kostet die
Version ohne Schlaf 25 $/Monat.*

**2. Erst aufs Handy, dann das Backend.** Ab jetzt gibt es zwei offene Fragen: *Läuft
die App auf einem iPhone?* und *Läuft sie mit echten Daten?* Wenn beides gleichzeitig
neu ist, weiß man bei keinem Fehler, woher er kommt — genau das hat bei ACTA die teuren
Tage gekostet. Getrennt kostet es einen Nachmittag mehr.

**3. Anmelden: E-Mail-Code UND Google UND Apple.** **Hier hast du gegen meinen Vorschlag
entschieden, und du hattest recht.** Ich wollte nur den E-Mail-Code — weniger zu bauen,
weniger, was kaputtgeht. Dein Argument war besser: Wer beim allerersten Öffnen erst sein
Postfach aufmachen muss, kommt zur Hälfte nicht zurück. Und ausgerechnet am Anfang, wo
der Feed noch leer ist, verträgt die App das am wenigsten.

*Eine Folge davon solltest du wissen:* Sobald Google dabei ist, **verlangt Apple**, dass
„Anmelden mit Apple" auch da ist. Das hast du ohnehin gewählt, also kostet es nichts
extra — aber es legt eine Reihenfolge fest: Apple muss fertig sein, bevor Google
live geht. Andersherum lehnt Apple die App ab.

---

## ✅ Erledigt am 06.09.2026 — die Zeile, die du selbst geschrieben hast

### Was zählt als „schon verabredet"? → **erst, wenn wirklich jemand dabei ist**

**Du hast c) genommen.** Dein eigener Post zählt nicht, solange niemand zugesagt hat;
sobald einer da ist, zählt er wie jede andere Verabredung. Dein Grund, wie er jetzt im
Code steht: *Ein Post ist ein Angebot, bis jemand annimmt.*

Ein Nachsatz, der wichtiger ist, als er aussieht: **Am Code hat sich kein Zeichen
geändert** — genau diese Zeile stand schon da, aber als Platzhalter, mit einem „das ist
keine Entscheidung" darüber. Geändert hat sich, was danebensteht. Wer den Code in einem
halben Jahr liest, sieht jetzt eine Regel mit Grund statt einer offenen Frage.

*Der ursprüngliche Text bleibt zum Nachlesen stehen:*

<details>
<summary>Wie die Frage gestellt war</summary>

**Datei:** `simplysocial/src/features/requests/kollision.ts`, ganz unten —
`zaehltAlsTermin()`. Da steht ein `TODO` mit deinem Namen.

Die App warnt jetzt, wenn du dich doppelt verabredest („Du bist heute 19:30 schon bei
‚Tennis spielen'."). Beim Bauen ist eine Frage aufgetaucht, die vorher in keinem Plan
stand: **Zählt auch ein Post, den du selbst geschrieben hast und bei dem noch niemand
zugesagt hat?**

Drei Antworten, such dir eine aus — es ist wirklich nur die eine Zeile:

| | Zeile | Was das heißt |
|---|---|---|
| **a** | `return true;` | Alles zählt. Denkst du dir am Sonntag drei Sachen aus und postest sie, warnt es ab der zweiten — obwohl noch gar nichts feststeht. |
| **b** | `return t.rolle === 'zugesagt';` | Nur, wo du selbst zugesagt hast. Am leisesten. Dein eigener Post ist dann still, auch wenn schon Leute kommen. |
| **c** | `return t.rolle === 'zugesagt' \|\| t.jemandDabei;` | Dein eigener Post zählt, sobald wirklich jemand dabei ist. **Steht gerade als Platzhalter drin** — das ist keine Entscheidung, nur damit der Prototyp läuft. |

Schreib die Zeile hin und einen Satz darüber, warum — so wie in den anderen
Regel-Dateien. Wenn du magst, sag es mir stattdessen einfach, dann baue ich es ein.

</details>

---

## 🟢 Das Nächste, und es ist keine Programmieraufgabe

### Zeig den Prototyp her — und schreib auf, was gesagt wird

**https://ianfhorak-jpg.github.io/simplysocial-landing/**

Schick die **Landing-Page**, nicht den Prototyp-Link — sie erklärt zuerst, worum es
geht, und führt dann hinein. Der Prototyp allein wirft einen mitten in einen fremden
Feed.

Das ist keine Programmieraufgabe, sondern die wichtigste offene Sache überhaupt. Ab
jetzt ist das, was deine drei Mitgründer und deine Freunde sagen, eine bessere Quelle
für Änderungen als alles, was in PLAN.md steht.

Zwei Sachen dazu:
- **Schick den Erklärsatz mit** (steht in [README.md](README.md) ganz oben). Ohne ihn
  hält man „ich sehe Ians Chats" für ein Datenleck statt für einen fehlenden Login.
- **Frag nicht „gefällt es dir".** Frag: *Was würdest du als Erstes posten? Bei welchem
  Post würdest du auf „Bin dabei" tippen? Was hast du gesucht und nicht gefunden?*
  Auf die erste Frage sagen alle „ja, cool", und du weißt nichts.

---

## 🟡 Wartet auf Christoph und Daria

### Leopolds Rückmeldung ist da — und sie war anders als alles davor

Leopold hat die App als Erster wirklich **benutzt** statt angeschaut: Gruppe gegründet,
gepostet, herumprobiert. Der Unterschied ist der ganze Punkt — er hat in zehn Minuten
etwas gefunden, das ich am selben Tag beim Durchklicken übersehen habe, weil man es nur
merkt, wenn man etwas *erreichen* will:

**Man kann niemanden in eine Gruppe einladen.** Es gibt nur den Weg von aussen (jemand
findet die Gruppe und fragt an, du bestätigst). Wer eine Gruppe gründet, sitzt allein
drin und kann nichts dagegen tun. Das ist kein Wunsch, das ist ein Loch in dem, was im
September gebaut wurde.

**Du hast entschieden** (steht in PLAN.md, Phase 18):
- **Einladen aus der Gruppe heraus** — du wählst aus deinen Followern, die bekommen eine
  Einladung und sagen ja. Nicht per weiterleitbarem Link.
- **Der Schiebe-Balken fürs Alter kommt, über den Jahrgang.** Ich hatte dagegengeredet,
  weil die App gar kein Geburtsdatum kennt — deine Antwort war die Mitte, die ich nicht
  angeboten hatte: nur das Jahr, mehr braucht ihr nicht.

**Beides ist jetzt gebaut** (05.09.). Dazu ist deine eigene Rückmeldung gekommen — dass
die Chat-Liste „noch nicht ganz übersichtlich" ist. Auch die ist erledigt:

- **Einladen** — auf der Gruppenseite steht „Leute einladen", du wählst aus deinen
  Followern, die anderen sagen ja. Und beim Gründen kannst du jetzt „Offen" oder
  „Privat" wählen.
- **Der Jahrgangs-Balken** — im Feed unter „Filter" und beim Posten unter „Mehr
  einstellen". Zwei Griffe, die einander nicht kreuzen können.
- **Die Chat-Liste** — vorher passten 4 Chats auf den Schirm, jetzt 7. Die Karten sind
  Zeilen geworden, und die Aktivität steht klein hinter dem Namen („Lea · Tennis
  spielen") statt in einer eigenen Zeile. **Was dabei wegfällt: Wann das Treffen ist,
  steht nur noch im Chat selbst.** Schau bitte am Handy, ob dir das fehlt — das ist eine
  Zeile Code zurück.

**Es wartet keine Frage auf dich.** Die letzte („was steht am Profil, wenn der Jahrgang
drin ist") hast du am 05.09. beantwortet: **„Jahrgang 2009"** steht offen da. Was das
bedeutet, steht gleich unten bei Punkt 1 — es macht ihn dringender.

### Was Leopold sonst noch wollte
- **Nicht zwei Sachen gleichzeitig zusagen können.** Prüft heute niemand. Gute Idee, und
  klein — sie schützt vor genau der Enttäuschung, an der sich so eine App herumspricht.
- **Private vs. öffentliche Gruppen.** Kommt zusammen mit dem Einladen, sonst wäre eine
  private Gruppe eine, die niemand betreten kann.
- **Eine Kalender-Funktion** — hat er selbst „für später" gesagt.
- **Er musste fragen, wie man eine Gruppe macht.** Der Knopf liegt ganz unten am Profil
  (vorletztes Element, fast zwei Bildschirme runter).

---

## 🟠 Was auf dich zukommt, wenn die echte App gebaut wird

Der Plan für Backend, iPhone-Build und App Store steht (PLAN.md, Abschnitt 5b). Das
meiste davon ist meine Arbeit. **Das hier ist die Liste dessen, was nur du kannst** —
damit dich nichts überrascht.

### Bald, in Phase 19 (aufs Handy)
- **Dein iPhone einmal anmelden — das ist jetzt dran.** Die App läuft seit dem
  06.09. auf einem *simulierten* iPhone; für dein echtes braucht Apple eine
  Registrierung, und die geht nur mit deinem Apple-Login. Befehl und Ablauf stehen in
  `NACH_DEM_CLEAR.md` ganz oben. Alles andere ist vorbereitet.
- ~~**Der Name der App bei Apple wird festgelegt**~~ ✅ **erledigt am 06.09.2026:**
  Du hast `at.simplysocial.app` bestätigt. Der Wert steht jetzt in der App und ist ab
  der ersten Einreichung bei Apple für immer festgelegt. (`at.` weil die App aus Wien
  ist und `simplysocial.at` auf deiner Domain-Liste steht.)

### In Phase 20 (Backend)
- **Ein Supabase-Konto anlegen** (gratis, mit deiner E-Mail). Die Zugangsschlüssel
  kommen dann in die Shell-Umgebung, **nie in den Code** — das ist die feste Regel aus
  dem Hauptordner.
- **Ein Google-Konto für den Google-Login freischalten.** Dauert zehn Minuten und
  braucht deinen Namen, weil es dein Projekt ist.
- **Geldfrage: Supabase Pro, 25 $/Monat.** Erst nötig, wenn die Gratis-Version stört —
  sie schläft nach 7 stillen Tagen ein. Solange ihr testet, reicht Aufwecken. **Ab dem
  Tag, an dem echte Leute die App benutzen, willst du das nicht mehr riskieren.**

### In Phase 21 (App Store)
- **Die Rechtstexte.** Siehe Punkt 1 gleich hier drunter — das ist der große.
- **Der Text im Store.** Beschreibung, Schlagworte, was die App ist. **Das kann ich
  vorschlagen, aber es ist eure Stimme, nicht meine.**
- **Screenshots.** Apple will Bilder aus der App. Die mache ich, aber du wählst aus.
- **Ein Testzugang für Apple.** Ein Prüfer bei Apple muss sich anmelden können, ohne
  deine E-Mail zu haben. Dafür legen wir ein Extra-Konto an. *Das ist der Punkt, den
  fast alle vergessen und an dem die meisten Apps beim ersten Mal abgelehnt werden.*
- **Wer betreibt die App offiziell?** Steht schon bei Punkt 1 — aber im Store steht ein
  Name öffentlich da, und der muss stimmen.

---

## 🔴 Wichtig, bevor die App über euren Freundeskreis hinausgeht

### 1. Rechtliches — hol dir erwachsenen Rat

> ⏫ **Seit 06.09.2026 ist das der dringendste Punkt in dieser Datei.** Nicht weil sich
> etwas an ihm geändert hätte, sondern weil er jetzt einen Termin hat: Beim Einreichen
> im App Store musst du eine Altersfreigabe angeben (Punkt 0), und einen Rechtstext
> hochladen. Beides ohne erwachsenen Rat wäre Raten. **Fang mit deinen Eltern an, bevor
> Phase 20 fertig ist** — dann steht die Antwort da, wenn sie gebraucht wird, statt den
> Start zu blockieren.

Du bist 16 und baust eine App, die **Fremde zusammenbringt, die sich dann wirklich
treffen**. Das ist kein Hobbyprojekt mehr. Vier Punkte, die geklärt sein müssen:

- **Wer betreibt die App offiziell?** Als Minderjähriger kannst du nicht allein
  Betreiber sein. Braucht ein Elternteil, der unterschreibt.
- **Datenschutz (DSGVO).** Ihr speichert Namen, Bezirke, Uhrzeiten, Chats. Dafür braucht
  es eine Datenschutzerklärung — das ist Pflicht, nicht Kür.
- **Mindestalter.** Ab welchem Alter darf man mitmachen? Unter 14 wird es in Österreich
  richtig kompliziert.

  ⚠️ **Seit 05.09. steht auf jedem Profil der Jahrgang** („Jahrgang 2009") — deine
  Entscheidung, und sie ist in Ordnung. Aber sie macht diesen Punkt dringender: Vorher
  stand dort ein grobes Band („14–17"), jetzt rechnet jeder Fremde aus einem Jahrgang das
  genaue Alter aus. Bei einer App, auf der 16-Jährige sich zu Treffen verabreden, ist das
  genau die Frage, die eine erwachsene Person beantworten sollte, bevor die App über
  euren Freundeskreis hinausgeht. **Zurücknehmen ist ein Wort im Code** (`JAHRGANG_ANZEIGE`
  — dann steht wieder ein Band da und der Jahrgang dient nur zum Filtern). Sag Bescheid,
  wenn der Rat das nahelegt.
- **Haftung.** Wenn bei einem Treffen etwas passiert — wer haftet?

**Wen fragen:** deine Eltern zuerst, dann jemand mit Ahnung. Die Wirtschaftskammer hat
eine kostenlose Gründerberatung, und über die Graphische kommst du vielleicht an einen
Lehrer, der Kontakte hat. Frag ruhig auch Schachner oder Niedel.

*Du hast am 31.08. gesagt, du schreibst dir das auf — hier steht es jetzt schwarz auf weiß.*

**Seit 01.09. steht die Lücke auch IN der App.** Der Screen „Nutzungsbedingungen"
(Profil → Einstellungen → Nutzungsbedingungen) ist zweigeteilt: Oben stehen sechs
Hausregeln, die ich schreiben konnte — kein Dating, echter Name, Zusagen gelten, keine
Werbung, erstes Treffen öffentlich, melden statt streiten. Schau sie dir an, das ist
eure Hausordnung, ändere sie ruhig.

Darunter steht ein roter Kasten mit genau den vier Punkten von oben und dem Satz, dass
sie noch fehlen. **Das ist Absicht.** Einen Rechtstext zu erfinden, der echt aussieht,
wäre das Gefährlichste, was ich hier tun könnte — man hält ihn dann für geprüft. Wenn du
den Rat hast, ersetzen wir den Kasten durch den echten Text, und die Stelle dafür steht
schon.

---

## 🟢 Leopolds Karten-Idee — ✅ GEBAUT am 06.09.2026

Eine **Wien-Karte** als dritte Ansicht neben Stapel und Liste: 23 Bezirksflächen,
eingefärbt danach, wo gerade etwas los ist; antippen zeigt die Aktivitäten darunter.
**Du hast vier Sachen entschieden**, sie stehen ausführlich in PLAN.md (Phase 19b).

Die wichtigste war deine eigene Idee und besser als mein Vorschlag: **erst die
Bezirksflächen, eine echte Landkarte mit Stecknadeln vielleicht später** — wenn Leute
die App wirklich benutzen. Der Grund, warum das klug ist: Eine Stecknadel verrät nicht
„1220", sondern die genaue Parkbank um 17:00. Das gehört nicht auf einen Bildschirm,
den Fremde sehen.

**Sie ist online** — Feed öffnen, oben auf „Karte" tippen. Dazu kam beim Bauen deine
fünfte Entscheidung: **Hineinzoomen mit zwei Fingern.** Nötig, weil die Josefstadt auf
einem Handy sonst 14 × 11 Bildpunkte groß ist; ich hatte eine Extra-Karte für die
Innenbezirke vorgeschlagen, dein Weg war der bessere.

**Was noch nichts kostet und trotzdem gut wäre:** Frag Leopold, ob er die Karte so
meinte — Flächen pro Bezirk, oder hatte er Punkte im Kopf? Er hat die Idee gehabt, seine
Antwort ist mehr wert als unsere Vermutung. **Jetzt kann er sie ansehen statt sie sich
vorzustellen**, das macht die Frage leichter zu beantworten.

### 🟢 Eine kleine Frage dazu wartet auf dich: wie stark die Karte einfärbt

Die Karte hat vier Helligkeitsstufen, und der dunkelste Bezirk ist immer der mit den
meisten Posts (so hast du es entschieden). Offen ist nur, wie großzügig gerundet wird:

- **Wie es jetzt ist (aufgerundet):** Jeder Bezirk, in dem überhaupt etwas los ist,
  bekommt sichtbar Farbe. Die Karte zeigt vor allem, **wo überhaupt etwas ist**.
- **Strenger (abgerundet):** Nur der Spitzenreiter sticht heraus, der Rest bleibt blass.
  Die Karte zeigt dann, **wo am MEISTEN ist**.

Am Anfang, wenn es wenige Posts gibt, spricht viel für die erste Variante — deshalb
steht sie drin. Wenn du später findest, dass die Karte „zu voll" aussieht, sind es fünf
Zeilen in einer Datei. Ausgeschrieben in PLAN.md, Abschnitt 6, Punkt 35.

## 🟡 Braucht dich, aber hat noch Zeit

### 2. Schau dir die neuen Icons am Handy an — und sag, ob sie zu blass sind

Christophs „schaut nach AI aus wegen den Emojis" ist erledigt: **Es ist kein einziges
Emoji mehr in der App**, an ihrer Stelle 41 gezeichnete Symbole. Alle in einer
Strichstärke, alle in der Farbe, die dazugehört — die Kategorie-Symbole nehmen jetzt
die Farbe ihrer Kategorie an, was ein Emoji nie konnte.

**Was du beurteilen musst, und nur du kannst das:** Emojis waren bunt und sofort
erkennbar. Striche sind es nicht. Wenn der Feed dir jetzt zu grau vorkommt, ist die App
zwar erwachsener geworden, aber langweiliger — und das wäre kein guter Tausch.

Der Weg zurück ist **nicht** „Emojis wieder rein". Es sind zwei Zahlen im Code
(Strichdicke und Einfärbung), und ich dreh sie in fünf Minuten. Sag einfach:
*„zu blass"* oder *„passt"*.

Am besten anschauen: der **Feed** (die sechs Kategorie-Pillen), die **Leiste unten**
(vier Symbole) und der **Match-Bildschirm** — dort stehen jetzt zwei verschieden
gefärbte Kreise mit euren Anfangsbuchstaben statt Emoji-Gesichtern.

*Nebenbei aufgefallen und behoben: Du und Lea hattet dieselbe Avatarfarbe. Das lag an
der Art, wie die Farbe berechnet wurde, und ist mit den Emojis nie aufgefallen.*

### 2b. Zwei neue Sachen, bei denen nur du sagen kannst, ob sie sich richtig anfühlen

Seit du das letzte Mal geschaut hast, sind **Direktnachrichten** und **Gruppen**
dazugekommen — beides Leopolds Wünsche. Zwei Stellen darin sind Ermessenssachen, und
beide sind ein Wort im Code, wenn du sie anders willst:

**a) Wer darf dir schreiben?** Gerade gilt: **nur bei gegenseitigem Folgen.** Du kannst
also niemandem schreiben, der dir nicht auch folgt — auch dann nicht, wenn ihr beide
wollt. Das ist sicher, aber es könnte zu eng sein. Probier es aus: Geh auf ein fremdes
Profil und schau, ob dort ein „Nachricht"-Knopf steht oder ein Satz, warum nicht.
*Falls zu eng: „einseitig genügt" oder „jeder darf" — beides ist ein Wort
(`SCHREIB_REGEL`).*

**b) Fühlt sich der Alters-Filter zu weich an?** Wer „18–25" wählt, bekommt auch alle
Posts angezeigt, bei denen niemand ein Alter eingestellt hat („für alle") — das war
deine Entscheidung, damit der Feed nicht auf eine Karte zusammenschrumpft. Der Preis
ist, dass der Filter wenig zu filtern scheint. **Das wird erst scharf, wenn Leute die
Altersgruppe wirklich setzen** — also erst bei vielen Posts. Guck es dir an und sag,
ob es dich stört.

### 3. ~~Auf dem Handy fehlen die Symbole~~ ✅ erledigt am 06.09.2026

**Die 41 Symbole zeichnen jetzt auch auf dem iPhone.** Der Einbau war genau das, was
hier seit Wochen angekündigt stand: **eine Datei, kein Bildschirm angefasst.** Möglich
war das nur, weil von Anfang an getrennt lag, *welche* Symbole es gibt
(`theme/icons.ts`) und *wie* sie gezeichnet werden (`SsIcon.tsx`) — geändert wurde nur
das Zweite.

Warum es überhaupt so lange leere Kreise waren: Symbole zeichnen geht im Browser von
selbst, auf dem iPhone braucht es ein Zusatzpaket — und genau die Sorte Paket hat bei
ACTA die Vorschau kaputtgemacht. Deshalb kam es erst jetzt dazu, **vor** dem ersten
echten App-Build und nicht danach. Kommt so ein Paket nämlich *nach* einem Build dazu,
stürzt der bestehende Build ab.

**Was du davon merkst:** Sobald die App auf deinem Handy läuft, sieh dir die Symbole an
und sag, ob sie genauso aussehen wie im Browser. Das ist Punkt 2 oben, jetzt mit echter
Grundlage.

### 4. Logo
Dein Freund zeichnet es. **Sag ihm bitte, bis wann du es brauchst.** Bis dahin baue ich
einen Platzhalter-Schriftzug ein, den ich später in einer Minute austausche.

Was er wissen sollte:
- Die App ist bunt und freundlich, nicht seriös-grau.
- Es braucht das Logo in **quadratisch** (App-Icon, das runde Ecken bekommt) und als
  **breiten Schriftzug** (für die Kopfzeile).
- Am besten als SVG oder PNG mit durchsichtigem Hintergrund.

**Wenn es da ist, schick es einfach her** — das App-Icon hat seinen Platz schon
(`simplysocial/assets/expo.icon`), und der Schriftzug in der Kopfzeile hängt an einer
einzigen Datei (`src/config/brand.ts`, harte Regel 3). Beides ist ein Austausch, keine
Umbauarbeit. **Am besten kommt es, bevor die App eingereicht wird** — das App-Icon ist
das Erste, was im Store zu sehen ist.

### 4b. Farbe — drei Vorschauen liegen bereit (06.09.2026)
Du wolltest die Landing-Page in **Olivgrün, Weinrot und Türkis** sehen. Sie liegen im
Ordner **`landing-vorschau/`** — dort `index.html` doppelklicken, dann hast du alle drei
nebeneinander und kommst zwischen ihnen hin und her. **Die veröffentlichte Seite ist
unberührt**, der Ordner liegt außerhalb ihres Repos.

Was ich von dir brauche, ist nicht nur „welche ist hübscher", sondern eine Stufe darunter:

- **A · Eine Marke, eine Farbe** — so wie in der Vorschau. Auch die sechs
  Kategorie-Farben (Sport gelb, Essen grün, Lernen blau …) werden Abstufungen der
  Leitfarbe. Wirkt aus einem Guss. Preis: Man erkennt eine Aktivität nicht mehr an der
  Farbe, man muss lesen.
- **B · Leitfarbe nur für die Marke** — Knöpfe, Schriftzug und Marker bekommen die neue
  Farbe, die sechs Kategorien bleiben bunt und behalten ihre Auskunft.

**Sag mir die Farbe UND A oder B.** Beides zusammen, dann baue ich es in einem Zug ein —
in die App *und* in die Seite, denn die beiden führen ihre Farben getrennt.

Die ganze Erklärung steht in `landing-vorschau/LIESMICH.md`, auch warum der Marker unter
dem Wort „jetzt" bei Weinrot heller ausfällt als der Rest.

### 5. Fotos für die Landing-Page — falls ihr wollt
Die Seite steht, kurz gehalten, wie du wolltest. Was noch dazukönnte, wenn ihr Lust habt:
- **Fotos von euch vieren.** Der Abschnitt „Wer wir sind" ist die Stelle dafür, die
  Namen sind schon gesetzt. Illustrationen gehen genauso.
- **Ein paar Sätze mehr zur Geschichte** — warum ihr angefangen habt. Im Moment steht
  dort der Nachmittag, den alle kennen („Man hätte Zeit. Man schreibt in vier Gruppen…").
  Wenn ihr eine bessere echte Geschichte habt, ersetzen wir das.

**Kein Muss.** Die Seite funktioniert so, und kurz ist besser als aufgeblasen.

### 5b. Eine eigene Domain — deine Entscheidung, weil sie Geld kostet
`ianfhorak-jpg.github.io/simplysocial-landing/` sagt man nicht am Telefon.
**`simplysocial.at`** kostet ungefähr **15 € im Jahr**. GitHub nimmt eigene Domains
gratis entgegen; für mich sind das zehn Minuten (eine Datei im Repo, zwei DNS-Einträge).
Danach ist das der Link, den du überall hinschreibst — und er bleibt derselbe, auch wenn
später ein echter Server dahinterkommt. Sag Bescheid, wenn du das willst.

### 6. Kaltstart planen
Ihr vier plus Freunde postet in der ersten Woche alles, was ihr sowieso macht, damit die
App nicht leer wirkt. **Überleg dir vorher: welche 20 Posts sind das?** Ein leerer Feed
am ersten Tag ist der häufigste Grund, warum solche Apps sterben.

---

## 🟢 Für später gemerkt

### 7. Was Apple verlangen wird
Sobald Nutzer selbst Inhalte posten, prüft Apple beim Review vier Dinge (Guideline 1.2).
Fehlt eines, kommt die App nicht in den Store:

- [x] Posts und Profile **melden** können — *fertig 01.09.2026*
- [x] Andere Nutzer **blockieren** können — *fertig 01.09.2026*
- [x] **Nutzungsbedingungen** — *Screen fertig, Rechtstext fehlt (Punkt 1)*
- [x] **„Account löschen"** direkt in der App — *fertig 01.09.2026*

Alle vier sind seit Phase 7 als Oberfläche da, und drei davon funktionieren im Prototyp
sogar richtig: Blockieren wirkt (probier es aus), Melden wird gespeichert, Account
löschen zeigt dir echte Zahlen — was da verschwinden würde. Nur der letzte Klick beim
Löschen tut nichts, weil es im Prototyp noch keine Konten gibt; der Screen sagt das
selbst.

**Zwei Sachen fehlen trotzdem noch für Apple, und beide brauchen erst das Backend:**
- Ein Mensch, der die Meldungen wirklich liest. Apple fragt danach.
- Das Häkchen „Ich akzeptiere die Nutzungsbedingungen" beim Anmelden — dafür braucht es
  erst eine Anmeldung.

### 8b. Standort statt Bezirk-Tippen — gemerkt für die echte App
Du hast am 01.09. gefragt, ob man den Bezirk automatisch herausfinden kann. **Ja, aber
erst mit dem Backend**, und nicht so, wie du es dir gedacht hast:

- **IP-Ortung** („durch VPN") trifft in Wien oft den Standort deines Providers, nicht
  deinen Bezirk. Und ein VPN macht sie nicht genauer, sondern **falscher** — es zeigt
  dorthin, wo der Tunnel rauskommt, also vielleicht in die Niederlande.
- **Nach dem Standort fragen** ist der richtige Weg. Aus den Koordinaten den Bezirk
  ausrechnen, **die Koordinaten wegwerfen**, nur „1070" behalten. Das passt genau zu der
  Entscheidung, die du im August selbst getroffen hast: nie GPS speichern, nur Bezirke.
- Warum es im Prototyp nicht geht: Beides braucht einen Aufruf an einen fremden Dienst,
  und der Prototyp darf nichts aus dem Netz holen — das ist die Regel, die verhindert,
  dass die Web-Version kaputtgeht (bei ACTA ist genau das passiert).

Bis dahin setzt sich der Bezirk beim Posten auf **den aus deinem Profil**. Das stimmt
meistens und du siehst es in der Vorschau, bevor du postest — und seit dem 02.09. kannst
du das Feld auch **einfach leer lassen**, dann steht am Post nur „Wien".

### 9. Profilbilder — der Platz steht, das Bild fehlt

Daria wollte „ein Foto von der Person oder halt die Altersgruppe". Du hast gesagt:
**beides.** Die Altersgruppe ist seit 02.09. voll drin — man sieht am Profil „26+" und
am Post, für wen er gedacht ist.

**Beim Foto ist nur der Platz gebaut.** Die App kann ein Profilbild anzeigen, überall,
sofort — es gibt bloß keines hochzuladen. Warum das nicht am Programmieren liegt:

- **Speicher.** Bilder liegen nicht im Code, sie brauchen einen Ort im Netz. Kostet ab
  einer gewissen Menge Geld (siehe Punkt 8).
- **Jemand muss draufschauen.** Wenn Leute Bilder hochladen können, laden Leute
  irgendwann Bilder hoch, die dort nicht hingehören. Das ist bei einer App mit
  16-Jährigen kein Randthema, und Apple fragt im Review danach (Punkt 7).
- **Wer darf ein Bild von wem hochladen?** Ein Foto von jemand anderem hochzuladen ist
  rechtlich etwas ganz anderes als ein Selfie — gehört zu Punkt 1.

**Was du Daria sagen solltest:** Bis zum Backend sieht sie Anfangsbuchstaben, kein
Gesicht. Die halbe Antwort jetzt ist besser als eine ganze in drei Monaten — aber sag
ihr, dass es die halbe ist.

### 8. Backend kostet irgendwann Geld
Solange ihr 200 Leute seid: gratis. Wenn es wächst, kommen laufende Kosten (Datenbank,
Speicher, Push-Nachrichten). Kein Thema für jetzt — nur damit es dich nicht überrascht.

## ✅ Erledigt

- [x] **Zwei weitere Fehler beim Zuendeklicken gefunden und behoben** (03.09.2026) —
  der Durchgang vom Morgen war nicht fertig: Stapel, Filter und Gruppen hatte ich
  angeschaut, den **Kernablauf** (posten → Bin dabei → bestätigen → Chat) und die
  **Direktnachrichten** noch nicht — also genau das, was die drei als Erstes anklicken
  werden. Nachgeholt, und dabei kam heraus:
  **Damit bin ich einmal komplett durch die App durch** — auch die vier
  Sicherheits-Screens (melden, blockieren, Nutzungsbedingungen, Account löschen), die
  seit Phase 7 keiner mehr in Handybreite gesehen hatte. Die sind sauber.

  1. **Beim Posten zeigte der rote Hinweis ins Leere.** Wenn „Mehr einstellen" offen
     war und du den Titel vergessen hattest, stand unten „Es fehlt noch was — die roten
     Stellen" — und auf dem ganzen Bildschirm war nichts rot. Die rote Stelle lag mehr
     als eine Bildschirmhöhe weiter oben. **Du hast entschieden: beides** — der
     Bildschirm springt jetzt hin, UND der Satz sagt, welches Feld es ist („Schau noch
     mal beim Titel."). *Das ist deine fünfzehnte Entscheidung.*
  2. **Du hast selbst einen gefunden: In den Einstellungen standen die NAMEN der
     Symbole statt der Symbole** — „bl att", „m ue ll", „ba us tei ne", in eine schmale
     Spalte gequetscht. Das war ein Rest aus der Zeit vor Phase 14: Dort stand früher
     ein Emoji, und die Zeile war gebaut, um ein Emoji als Text hinzuschreiben. Beim
     grossen Umbau habe ich den Wert getauscht („📄" wurde zu „blatt"), aber nicht die
     Art, wie er gezeichnet wird. **Warum es niemandem aufgefallen ist:** Der
     Typ-Prüfer hätte es gefunden — aber genau diese eine Zeile war als „irgendein
     Text" angemeldet und nicht als „ein Symbol aus der Liste". Ist behoben, und der
     Mülleimer ist jetzt rot wie seine Beschriftung.

     *Und ehrlich dazu:* Ich hatte diesen Screen zwei Stunden vorher geprüft — aber nur
     ausgemessen, nie angeschaut. In meinen eigenen Messwerten stand „muellAccount
     löschen" wörtlich drin, und ich habe darüber hinweggelesen. Es gibt jetzt eine
     Prüfung, die alle 19 Bildschirme nach durchgerutschten Symbol-Namen absucht.

  3. **Im Screen „Nutzungsbedingungen" stand eine Notiz an dich** — „Steht auch in
     `_FUER_IAN/OFFENE_SACHEN.md`.", mitten in dem roten Kasten, den jeder liest, der
     dem Link folgt. Das ist dein privater Arbeitsordner; auf einer Adresse, die du
     weiterschickst, hat er nichts verloren — und ausgerechnet dieser Screen soll
     seriös wirken. Weg. (Der Kasten selbst bleibt natürlich: Der Rechtstext fehlt
     weiter sichtbar, das ist Punkt 1 oben.)
  4. **Bei einer Suche ohne Treffer standen zwei Meldungen übereinander**, die fast
     dasselbe sagten („Hier ist der Stapel durch" und „Dazu ist gerade nichts da") —
     und auf einem kleinen Handy rutschte der Knopf „Filter zurücksetzen" halb hinter
     die Leiste unten. Jetzt steht dort **eine** Meldung, die mit dem Ausweg.
     *Nebeneffekt, der wichtiger ist als der Fehler:* Wenn wirklich einmal gar nichts
     los ist in Wien, stand dort bisher „Das war alles für heute" über einer leeren
     Fläche. Jetzt steht dort „Noch nichts los in deinem Feed" mit dem Knopf „Etwas
     posten" — genau der Moment, den wir beim Kaltstart (Punkt 6) fürchten.

- [x] **Zwei Fehler am Handy gefunden und behoben** (03.09.2026) — den ersten hast du
  selbst gemeldet: Die Karteikarten lagen schief und der Stempel „Weg" war dauerhaft da.
  Den zweiten habe ich beim Durchklicken der fertigen Fassung in Handybreite gefunden:
  **Wenn man im Stapel auf „Filter" tippte, quoll die Karte über die Knöpfe** — auf
  einem kleineren iPhone verdeckte sie ausgerechnet den Alters-Filter. Du hast
  entschieden, dass sich das Filterfeld **drüberlegt statt zu schieben**, wie beim
  Prototyp-Hinweis. Ist drin und hochgeladen.
- [x] **Gruppen** (02.09.2026) — Leopolds „Gruppen wären noch gut zu adden". Eine Gruppe
  ist eine dritte Stufe beim Posten: „Alle", „Nur Follower" oder „Nur Marswiese Tennis".
  Der Post steht im normalen Feed, nur mit dem Gruppennamen an der Karte — **kein
  eigener Bereich**, weil ein zweiter Feed den ersten leer macht. Hinein kommt man auf
  Anfrage, der Gründer bestätigt. Deine zwei Entscheidungen dazu: Beim Austritt bleiben
  die Posts stehen, und wenn der Gründer geht, erbt das Mitglied, das am längsten dabei
  ist.
- [x] **Direktnachrichten** (02.09.2026) — Leopolds „man kann nicht einfach so Leuten
  schreiben". Jetzt geht es. Deine Entscheidungen: schreiben darf man **bei
  gegenseitigem Folgen**, und ein Direktchat entsteht **erst mit der ersten gesendeten
  Nachricht** — wer auf „Nachricht" tippt und es sich anders überlegt, hinterlässt beim
  anderen nichts. *Ob die Regel zu eng ist, ist Punkt 2b oben.*
- [x] **Filter und Altersgruppe** (02.09.2026) — Leopold hatte gesagt, man könne „nicht
  so genau filtern, was ein Problem wird, wenn es viele Anfragen gibt". Jetzt gibt es
  im Feed **Suchen, Bezirk, Wann und Altersgruppe**. Er hatte Hashtags vorgeschlagen —
  die kommen bewusst nicht, weil dann zwei Ordnungssysteme nebeneinander stünden und
  weil man beim Posten wieder mehr tippen müsste. *Falls die Filter sein Problem nicht
  lösen, kommen Hashtags zurück auf den Tisch — sag Bescheid.*
- [x] **Alle Emojis raus** (02.09.2026) — Christoph hatte recht, und es waren 107 Stück
  in 24 Dateien. Jetzt sind es 41 selbst gezeichnete Symbole, dazu **Anfangsbuchstaben
  statt Emoji-Gesichtern** bei den Profilbildern. Die Landing-Page zieht mit.
  *Was du dazu noch sagen musst, steht oben bei Punkt 2 — es ist die einzige Frage,
  die nach dieser Phase offen ist.*
- [x] **Bezirk ist freiwillig** (02.09.2026) — du wolltest „die Option haben, keinen
  Bezirk anzugeben“, wenn man wirklich nicht will. Ist drin: Feld leer lassen genügt,
  am Post steht dann „Wien“ statt einer Zahl. Damit hat sich auch die Frage erledigt,
  was passiert, wenn ein zugeklapptes Feld leer ist — es ist kein Fehler mehr.
- [x] **Die drei Striche statt dem Zahnrad** (02.09.2026) — vor „Mehr einstellen“ steht
  jetzt ☰, so wie du es ursprünglich gesagt hattest.

- [x] **Chats nach dem Treffen entschieden** (01.09.2026) — du hast „B ist gut und C
      auch" gesagt, und daraus ist die Fassung geworden, die beides ist: Der Chat
      rutscht nach dem Treffen in die Gruppe **„Vorbei"** und verschwindet dort nach
      **einer Woche**. So kannst du am nächsten Morgen noch nach deinem Schläger fragen,
      und die Liste wird trotzdem nie zum Friedhof. Beide Bildschirme sagen an, dass der
      Chat abläuft — bevor er weg ist.
      *Die Woche ist eine Zahl im Code (`NACHKLANG_TAGE`), leicht zu ändern.*
- [x] **Was Blockieren bedeutet, entschieden** (01.09.2026) — du hast „alles weg"
      gewählt, die härteste der drei Möglichkeiten. Heißt: Wer blockiert wird, ist raus.
      Posts weg, keine Anfragen mehr, **der Chat verschwindet, und eine schon bestätigte
      Verabredung wird abgesagt** — der Platz im Post wird wieder frei.
      *Warum das passt: Bei Instagram heißt blockieren „sieht meine Bilder nicht mehr".
      Hier heißt es „taucht nicht mehr am selben Ort auf wie ich". Eine Verabredung
      stehen zu lassen wäre genau das Problem, vor dem der Block schützen soll.*
      **Den Haken kennst du:** Ein Fehlgriff kostet eine echte Verabredung, und der
      andere sieht nur, dass die Zusage weg ist — nicht warum. Deshalb ist Blockieren
      neben dem Kontolöschen die einzige Stelle in der App, die vorher nachfragt, und
      in der Rückfrage steht Punkt für Punkt, was passiert.
      *Die Regel ist ein Wort im Code (`BLOCK_WIRKUNG` in `features/safety/block.ts`).
      Die beiden weicheren Möglichkeiten stehen daneben — Umstellen ist eine Zeile.*
- [x] **Reihenfolge der Chat-Liste entschieden** (01.09.2026) — die neuen Chats stehen
      immer ganz oben, auch wenn darunter gerade geschrieben wird.
- [x] **Hinweis beim Öffnen entschieden** (01.09.2026) — du hattest die Wahl zwischen
      einem einmaligen Balken, gar nichts in der App und einem festen Streifen auf jedem
      Bildschirm. Du hast den **einmaligen Balken** genommen. Er sagt genau das, was
      sonst wie ein Fehler aussieht: alles erfunden, kein Login (jeder ist du), Neuladen
      setzt zurück. Einmal wegklicken, dann ist er für diesen Tab weg — auch über
      Neuladen hinweg, aber nicht für immer. Wer in drei Wochen wiederkommt, kriegt ihn
      noch einmal, weil man zwei Sätze in drei Wochen vergisst.
- [x] **Persönliches aus den Fake-Daten** (01.09.2026) — in deiner Bio standen deine
      Schule und deine Klasse, in einem erfundenen Post der echte Name eines Lehrers.
      Du hast „beides neutralisieren" gewählt. Unter deinen Freunden wäre es egal
      gewesen; auf einer Adresse, die jeder öffnen kann, den der Link erreicht, ist es
      etwas anderes — und gefragt hatte den Lehrer niemand. Deine Bio sagt jetzt
      „Bau gerade diese App. Immer für spontan zu haben."
      *Die Regel steht im Kopf von `src/data/mock.ts`, damit neue Fake-Daten sie erben.*
- [x] **Der Prototyp ist online** (01.09.2026) — https://ianfhorak-jpg.github.io/simplysocial/
      Das war Phase 8. Der Punkt, an dem aus „ich erklär dir mal, was wir bauen" ein Link
      wird, den man aufmacht.
- [x] **Landing-Page steht** (01.09.2026) —
      https://ianfhorak-jpg.github.io/simplysocial-landing/
      Kurz gehalten, wie du wolltest. Eure vier Namen stehen groß da (Ian, Christoph,
      **Leopold**, Daria), und über die Rollen steht genau ein Satz — dein Wunsch war
      „einfach, dass wir das als Team bauen", und genau so liest es sich.
      *Das Aussehen ist aus der App abgeleitet: dieselben sechs Kategoriefarben,
      dieselben Karten mit dem Farbstreifen, derselbe Knopf mit dem 4px-Rand unten.
      Die Beispielkarte im Kopf der Seite kannst du anklicken — dann kommt Konfetti,
      genau wie in der App.*
- [x] **Apple Developer Program gekauft** (31.08.2026, 99 $/Jahr) — der Punkt, an dem
      ACTA monatelang gehangen ist, ist für SimplySocial von Anfang an gelöst.
