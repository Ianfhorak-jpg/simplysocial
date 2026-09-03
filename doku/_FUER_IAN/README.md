# 33 — SimplySocial

> **Dieser Ordner ist für dich, Ian — nicht für Claude.**

---

## 🔗 Beides ist online

### Die Landing-Page
# **https://ianfhorak-jpg.github.io/simplysocial-landing/**
*Neu seit 01.09.2026.* Die Seite, die erklärt, was SimplySocial ist — mit euren vier
Namen und einem Knopf zum Prototyp. **Das ist ab jetzt der Link, den du herschickst**,
nicht der Prototyp-Link: Die Seite erklärt zuerst, worum es geht, und führt dann hinein.

> **Die Adresse ist lang, ich weiß.** Eine eigene wie `simplysocial.at` kostet rund
> 15 € im Jahr, GitHub nimmt sie gratis entgegen — zwei DNS-Einträge und eine Datei,
> zehn Minuten Arbeit. Sag Bescheid, wenn du das willst; das ist eine Geldfrage,
> deshalb entscheidest du sie.

### Der Prototyp
# **https://ianfhorak-jpg.github.io/simplysocial/**

*Seit 01.09.2026.* Öffne ihn am Handy, schick ihn in die Gruppe. Er braucht keine
Installation und funktioniert in jedem Browser.

**Schick diesen Satz mit** — sonst halten deine Freunde zwei Absichten für Fehler:

> „Das ist ein Prototyp — alle Posts und Chats sind erfunden. Es gibt noch keinen
> Login, ihr seid deshalb alle als *ich* drin. Und wenn ihr neu ladet, fängt alles
> von vorn an. Sagt mir, was sich falsch anfühlt."

*(Denselben Satz sagt die App beim ersten Öffnen auch selbst — aber Links werden
weitergeleitet, Erklärungen nicht.)*

**Jeder Bildschirm hat eine eigene Adresse.** Du kannst also auch direkt auf einen
einzelnen Post verlinken, zum Beispiel
[.../post/p4](https://ianfhorak-jpg.github.io/simplysocial/post/p4) — das war die
eigentliche Arbeit an diesem Schritt.

**Neu hochladen**, wenn sich etwas geändert hat:

    cd simplysocial
    npm run deploy          # der Prototyp

    cd landing
    git add -A && git commit -m "..." && git push    # die Landing-Page

Ein bis zwei Minuten später ist es unter derselben Adresse zu sehen.

## Worum geht es?

Eine App für Wien, mit der man Leute zum gemeinsamen Etwas-Machen findet.
Du postest „Tennis, 1220, heute 17:00", jemand tippt auf „Bin dabei", du sagst Ja —
und dann macht ihr euch im Chat aus, wo ihr euch trefft.

**Kein Dating.** Und nicht nur Sport: auch Kaffee, gemeinsam lernen, Kino, Skaten.

Dazu ein Teil wie bei Instagram: Leute können dir folgen, und bei jedem Post kannst du
wählen, ob ihn alle sehen oder nur deine Follower.

## Wie weit ist es?

**Der Hauptbildschirm steht.** Am 31.08.2026 haben wir zuerst durchgesprochen, wie die
App funktionieren soll, dann das Gerüst gebaut — und jetzt kann man sie zum ersten Mal
wirklich benutzen.

Was jetzt geht:

- **Der Feed.** Die Startseite mit allen Posts. Oben kannst du umschalten zwischen
  *alle* und *nur Leute, denen du folgst*, darunter nach Kategorie filtern —
  Sport, Essen, Lernen, Kultur, Draußen, Kreativ.
- **Der einzelne Post.** Tippst du auf eine Karte, siehst du alles: wann, wo, welcher
  Treffpunkt, wie gut man sein sollte, wie viele Plätze frei sind.
- **„Bin dabei".** Funktioniert. Du kannst eine kurze Nachricht dazuschreiben, und die
  Anfrage bleibt stehen, auch wenn du zwischendurch woanders hingehst.
- **Die Leiste unten** mit vier Tabs. Drei davon sind noch leer und sagen ehrlich, in
  welcher Phase sie drankommen.

- **Posten** (seit 01.09. auf zwei Felder gekürzt): oben rechts im Feed. Da stehen
  jetzt nur noch **Kategorie und Titel**. Alles andere — Wann, Bezirk, Plätze, Können,
  Treffpunkt, Notiz, „für alle / nur Follower" und wie lange der Post sichtbar bleibt —
  liegt hinter der Zeile **„Mehr einstellen"**, und alles davon setzt sich von selbst:
  die nächste halbe Stunde, dein Bezirk aus dem Profil, drei Plätze, egal wie gut.
  Ganz oben siehst du **live die Karte**, wie sie die anderen im Feed sehen — und die
  ist jetzt wichtiger als vorher: **Sie ist die einzige Stelle, an der du siehst, was
  automatisch gesetzt wurde**, bevor du auf Posten tippst. Schau da bitte wirklich hin.
- **Anfragen bestätigen** (neu, Phase 4): Der Tab **Anfragen** zeigt, wer bei deinen
  Posts mitmachen will — nach Post gruppiert, mit der Nachricht, die die Person
  dazugeschrieben hat. **Bestätigen** oder **Ablehnen**, mehr ist es nicht.
  Daneben gibt es „Geschickt": worauf **du** gerade wartest.
- **Der Konfetti-Moment.** Wenn du bestätigst, kommt der Bildschirm, auf den die ganze
  App zuläuft: Konfetti in den Aktivitätsfarben, eure zwei Bilder nebeneinander und
  „Ihr seid verabredet".
- **Der Post schließt sich selbst**, sobald der letzte Platz vergeben ist — im Feed
  steht er dann blass mit „Voll" drin.
- **Deine drei Regeln** (31.08.): Im Feed steht **das Neueste oben**; ein Post bleibt
  **bis zum Ende seines Tages** (beim Posten umstellbar); und wenn alle Plätze voll
  sind, bleiben übrige Anfragen **stehen** statt automatisch abgesagt zu werden.

- **Der Chat** (neu am 01.09.): Tab **Chats**. Für jede Verabredung eine Zeile — mit dem
  Namen, worum es geht und was zuletzt geschrieben wurde. Tippst du drauf, geht der Chat
  auf: **oben steht immer der Post**, damit du siehst, worum es geht, und du kommst mit
  einem Tipp ins Detail. Deine eigenen Nachrichten haben die Farbe der Aktivität. Enter
  schickt ab.
  Vom Konfetti-Bildschirm führt jetzt ein Knopf **„Zum Chat"** direkt hinein — vorher
  stand dort nur ein Hinweis.
- **Deine zwei neuen Regeln** (01.09.): Chats, in denen noch nichts gesagt wurde, stehen
  **immer ganz oben**. Und nach dem Treffen rutscht ein Chat in die Gruppe **„Vorbei"**
  und verschwindet dort nach **einer Woche** — beide Bildschirme sagen vorher an, dass
  er abläuft.

- **Die Profile** (neu am 01.09.): Tab **Profil** — Bild, Bio, Bezirk, deine
  **Follower-Zahlen**, deine **Interessen** und deine laufenden Posts. Genau das, was
  andere von dir sehen. Fremde Profile erreichst du im Post-Detail über den Namen des
  Verfassers, und dort steht ein **Folgen**-Knopf.
  **Folgen wirkt sofort:** Wem du folgst, den siehst du im Feed unter „Wem ich folge" —
  und du siehst seine Posts, die **nur für Follower** sind. Damit ist dein Schalter beim
  Posten zum ersten Mal von der anderen Seite spürbar.
  Auf die Follower-Zahl tippen führt zur Liste, von dort geht es auf die Profile weiter.
- **Deine sechste Regel** (01.09.): Auf ein Profil kommt **nur, was gerade läuft** —
  kein Archiv von Treffen, die schon waren. Das Profil ist ein Aushang, kein Lebenslauf.

- **Melden, Blockieren und die Einstellungen** (neu am 01.09.): Die vier Sachen, ohne
  die Apple die App nicht in den Store lässt, sind jetzt da.
  - Auf einem **fremden Profil** stehen ganz unten **Melden** und **Blockieren**.
  - Im **Post-Detail** steht ganz unten **Post melden**.
  - Über **Profil → Einstellungen** kommst du zu den blockierten Personen, den
    **Nutzungsbedingungen** und **Account löschen**. Die Bausteine sind auch dorthin
    umgezogen — sie standen auf deinem Profil, und das sehen deine Freunde.
  - **Melden** fragt nach einem Grund („Belästigt mich", „Macht mich an", …). Die
    Meldung wird gespeichert, aber niemand liest sie — dafür braucht es das Backend.

- **Deine siebte Regel** (01.09.): **Blockieren heißt alles weg.** Du hast die härteste
  der drei Möglichkeiten gewählt. Probier es aus, es wirkt wirklich: Blockier Lea, dann
  sind ihre Posts aus dem Feed, **euer Chat ist verschwunden** und **euer Tennis am
  Nachmittag ist abgesagt** — der Platz ist wieder frei. Deshalb fragt Blockieren
  vorher nach und zählt dir auf, was passiert.

- **Der Wischstapel** (neu am 01.09., Phase 11): Der Startbildschirm ist jetzt ein
  Stapel Karten, die du wegwischst — links „Weg", rechts „Bin dabei". Beim Ziehen kippt
  die Karte und bekommt oben eine Abrisskante, wie ein Post-it, das man abreißt. Rechts
  fährt unten eine Leiste hoch, in der schon ein Gruß steht; abbrechen legt die Karte
  zurück. **Die Liste ist nicht weg** — sie steht als zweite Ansicht daneben und fängt
  den leeren Stapel auf. Für Tastatur und VoiceOver liegen zwei Knöpfe darunter.

- **Die kleinen Sachen vom 01.09.** (Phase 12): Das „Alle" bei den Kategorien klebte am
  Bildschirmrand — behoben. Und man sah der Pillenreihe nicht an, dass sie seitlich
  weitergeht; jetzt ist rechts eine weiche Kante, **aber nur, wenn dort wirklich noch
  etwas liegt**. Passt alles auf den Schirm, ist keine da.

Was am Rechtstext der **Nutzungsbedingungen** noch fehlt, steht bewusst als roter Kasten
in der App. Sechs Hausregeln habe ich geschrieben (kein Dating, echter Name, Zusagen
gelten, keine Werbung, erstes Treffen öffentlich, melden statt streiten) — schau sie dir
an, das ist eure Hausordnung. Den juristischen Teil darf ich dir nicht erfinden, siehe
[OFFENE_SACHEN.md](OFFENE_SACHEN.md), Punkt 1.

**So schaust du selber rein:**

    cd simplysocial
    npm install
    npx expo start --web

Dann geht der Browser auf und du landest direkt im Feed. Die Bausteine findest du seit
01.09. über **Profil → Einstellungen → Bausteine anschauen**. Sobald der Prototyp online
ist, brauchst du das alles nicht mehr — dann gibt es einfach einen Link.

⚠️ **Wenn du die Seite neu lädst, sind deine Anfragen wieder weg.** Absicht, kein Fehler:
der Prototyp hat noch keine Datenbank. Alles lebt nur so lange, wie die Seite offen ist.

📌 **Nach einem `/clear`:** was du in den Chat schreiben sollst, steht in
[NACH_DEM_CLEAR.md](NACH_DEM_CLEAR.md). Dort steht auch, was aus deinen sieben
Entscheidungen geworden ist und was du zum Ausprobieren anklicken kannst.
**Es wartet gerade nichts auf dich.** Die letzten zwei Fragen hast du am 02.09.2026
beantwortet: Vor „Mehr einstellen" stehen jetzt **die drei Striche ☰** (wie du es
ursprünglich gesagt hattest), und der **Bezirk ist freiwillig** — leer lassen genügt,
am Post steht dann „Wien". Das Zweite war die interessantere Antwort: Gefragt war, was
passieren soll, wenn ein zugeklapptes Feld leer ist, und du hast die Frage weggenommen,
statt sie zu beantworten.

## 🔜 Was als Nächstes dran ist: **noch einmal herzeigen**

Christoph, Leopold und Daria haben den Prototyp am 02.09. durchgeklickt. **Die
Funktion selbst kam gut an** — Leopold: „für die Aktivitäten-Funktion sehr gut, an sich
funktioniert es." Alles, was sie geändert haben wollten, ist gebaut:

| | Was | Wer hat's gesagt |
|---|---|---|
| ~~**1.**~~ | ~~Die **Emojis raus**, echte gezeichnete Icons rein~~ — ✅ **fertig am 02.09.** | Christoph, Leopold |
| ~~**2.**~~ | ~~**Altersgruppe** beim Post und am Profil, **Platz fürs Profilbild**, dazu **Filter** nach Bezirk, Zeit, Alter und ein Suchfeld~~ — ✅ **fertig am 02.09.** | Daria, Leopold |
| ~~**3.**~~ | ~~**Direktnachrichten** — bisher kann man nur über eine Aktivität schreiben~~ — ✅ **fertig am 02.09.** | Leopold |
| ~~**4.**~~ | ~~**Gruppen** wie „Marswiese Tennis", denen man beitreten kann~~ — ✅ **fertig am 02.09.** | Leopold |

**Die Liste ist leer. Deshalb ist der nächste Schritt kein Bauen, sondern ein
Herschicken:** Die drei haben die Fassung von *vor* diesen vier Umbauten gesehen.
Schick ihnen den Link noch einmal und frag, ob sich das jetzt anders anfühlt. Was sie
diesmal sagen, entscheidet, was als Nächstes gebaut wird — mehr als alles, was in
PLAN.md steht.

Erst danach kommt das Große: **echtes Backend, App-Build, App Store.** Alle drei sind
viel Arbeit, und alle drei planen sich leichter, wenn feststeht, dass die App
inhaltlich sitzt.

**Zwei Sachen liegen aber bei dir**, weil nur du sie erledigen kannst:
- **Daria sagen, was „beides" heißt.** Das Alter ist voll drin — man sieht am Profil
  „26+" und am Post, für wen er gedacht ist. Beim Foto ist nur der Platz gebaut: Die App
  kann überall ein Profilbild zeigen, aber hochladen kann man keines, weil dafür ein
  Server nötig ist und jemand, der aufpasst, was hochgeladen wird. Bis dahin stehen
  Initialen dort, wo das Bild hinkommt. *(Ausführlich in OFFENE_SACHEN.md, Punkt 9.)*
- **Leopold antworten** auf „Wäre das alles für die erste richtige Version?" — deine
  Antwort war: erst den Prototyp fertig machen, Backend danach.

## ✅ Erledigt: Gruppen (02.09.)

**Leopold hatte gesagt:** „Gruppen wären noch gut zu adden" — Gruppen, die man selbst
erstellen kann, sein Beispiel war eine Tennisgruppe für die Marswiese.

**Das Wichtigste zuerst, weil es leicht zu übersehen ist:** Eine Gruppe ist in dieser
App **kein eigener Ort**. Es gibt keinen Gruppen-Tab und keinen Gruppen-Feed. Eine
Gruppe ist eine dritte Einstellung beim Posten — neben „Alle" und „Nur meine Follower"
steht jetzt „Nur Marswiese Tennis". Der Post landet dann im **ganz normalen Feed**, nur
eben bei weniger Leuten, und an der Karte steht der Gruppenname.

Der Grund dafür: Ein eigener Feed je Gruppe hätte den Hauptfeed leergesaugt. Am Anfang,
wenn noch wenig los ist, ist ein leerer Hauptfeed das größere Problem.

**Wo du es findest:** Profil → **„Deine Gruppen"**. Dort sind drei angelegt, und jede
zeigt dir einen anderen Fall:

- **Marswiese Tennis** — du bist drin, aber nicht der Gründer. Du siehst die
  Mitglieder und Leas Post „Doppel am Samstag".
- **Lernen fürs Zeugnis** — deine eigene Gruppe. Tobias und Florian wollen hinein;
  ihre Anfragen liegen im **Anfragen-Tab**, zusammen mit den normalen „Bin dabei"-
  Anfragen, und zählen in dieselbe rote Zahl. Das ist Absicht: Es ist derselbe
  Vorgang, also soll es sich auch gleich anfühlen.
- **Kino am Donnerstag** — du bist NICHT drin und hast angefragt. Du siehst Name,
  Kategorie, Bezirk und wie viele drin sind, aber **weder die Posts noch, wer drin
  ist**. Genau das ist der Beweis, dass die Einstellung wirklich etwas tut: Mira hat
  dort einen Kino-Post laufen, und der taucht in deinem Feed nirgends auf.

**Deine zwei Entscheidungen von heute stecken darin:**

- **Verlässt du eine Gruppe, bleiben deine Posts für sie stehen** und laufen normal
  ab. Nichts wird abgesagt, niemand verliert eine Zusage. *Der Haken:* Es läuft etwas
  auf deinen Namen in einer Runde, in der du nicht mehr bist — Leute von dort können
  weiter „Bin dabei" drücken, und die Anfrage landet bei dir.
- **Verlässt der Gründer die Gruppe, geht sie an den weiter, der am längsten dabei
  ist.** Probier es aus: „Lernen fürs Zeugnis" verlassen — die Rückfrage sagt dir
  vorher „Die Gruppe geht an Sara". Bist du allein drin, löst sie sich auf, und das
  steht dann auch so da.

**Eine Sache ist beim Bauen anders herausgekommen, als ich sie dir beschrieben habe:**
Ich hatte gesagt, du siehst deine eigenen Posts nach dem Austritt nicht mehr. Das
stimmt nicht — eigene Posts sieht man in dieser App immer, das ist eine ältere Regel,
die hier weitergilt. Du behältst deinen Post also im Feed und siehst, dass er noch
läuft. Der Haken ist damit **kleiner** als beschrieben, nicht größer.

## ✅ Erledigt: Direktnachrichten (02.09.)

**Leopold hatte gesagt:** „mir ist aufgefallen, dass es nur für Aktivitäten Chats gibt
und man nicht einfach so Leuten schreiben kann." Er hatte recht, und zwar tiefer, als es
aussah: In der App gab es **keine Möglichkeit**, eine Nachricht ohne Aktivität überhaupt
zu speichern. Das ist jetzt umgebaut.

**So geht es:** Auf einem fremden Profil steht unter „Folgen" ein Knopf **„Nachricht"**.
Probier ihn bei **Mira** aus — mit ihr läuft schon ein Gespräch über analoge Fotografie,
ganz ohne Aktivität dahinter.

Vier Sachen, die dir beim Ausprobieren auffallen sollen:

- **Der Knopf steht nicht bei jedem.** Deine Regel: schreiben darf nur, wer dir folgt
  UND wem du folgst. Bei **Florian** steht deshalb kein Knopf, sondern der Satz
  „Schreiben könnt ihr euch, sobald ihr einander folgt" — er folgt dir nicht zurück.
  Das ist Absicht: Ein Knopf, der einfach fehlt, sieht aus, als hätte die App die
  Funktion nicht. Genau das war ja Leopolds Eindruck.
- **In der Chat-Liste siehst du sofort, was was ist.** Ein Chat zu einer Aktivität hat
  den **Farbstreifen** links und darunter steht, worum es geht („Tennis · Morgen
  17:00"). Eine Direktnachricht hat keinen Streifen und darunter steht der Name
  (`@mira`). Bei **Tobias** stehen jetzt beide Zeilen untereinander — der Kaffee und
  eine Nachricht. Das ist kein Fehler, das sind zwei verschiedene Sachen.
- **Direktnachrichten laufen NICHT ab.** Deine 7-Tage-Regel („Vorbei" und dann weg)
  gilt weiter, aber nur noch für Chats zu einer Aktivität — dort ergibt sie Sinn, weil
  das Treffen vorbei ist. Ein Gespräch, das verschwindet, während du auf Antwort
  wartest, würde sich kaputt anfühlen.
- **Der Chat entsteht erst, wenn du wirklich etwas schickst.** Tippst du auf
  „Nachricht" und gehst wieder zurück, hat die andere Person nichts gesehen. Das hast
  du am 02.09. so entschieden. Der Haken: Ein halb getippter Satz ist beim Zurückgehen
  weg.

## ✅ Erledigt: Filter und Altersgruppe (02.09.)

**Leopold hatte gesagt:** „man kann nicht so genau filtern, was ein Problem wird, wenn es
viele Anfragen gibt." Im Feed steht jetzt oben ein **Suchfeld** und daneben ein
**Filter-Knopf**. Dahinter: Bezirk, Wann (Heute · Morgen · Diese Woche) und Für wen.

Vier Sachen, die dir beim Ausprobieren auffallen sollen:

- **Am Knopf steht eine Zahl** — „Filter · 2". Ohne die würdest du morgen einen leeren
  Feed sehen und die App für kaputt halten, dabei wäre nur noch „1220" von gestern
  eingestellt.
- **Bei „Bezirk" stehen nur Bezirke, in denen wirklich was los ist.** Alle 23
  hinzuschreiben wäre eine Liste, bei der zwanzig Einträge ins Leere führen. So ist es
  eine Auskunft: „heute ist in 1070, 1100 und 1220 was."
- **Die Suche versteht „fussball" für „Fußball"** und findet „Fotospaziergang", wenn du
  „foto" tippst. Klingt selbstverständlich, ist es im Deutschen nicht.
- **Die Altersgruppe** stellst du beim Posten ein („Für alle" ist voreingestellt), und
  am Profil steht sie neben dem Bezirk. Ein Post „für alle" taucht bei jedem
  Alters-Filter auf — das hast du am 02.09. so entschieden, und der Haken daran ist,
  dass sich der Filter dadurch etwas weich anfühlt. **Schau es dir am Handy an und sag,
  ob es reicht.**

## ✅ Erledigt: die Emojis (02.09.)

**Christoph hatte recht.** Es waren 107 Emojis, verteilt auf 24 Dateien — Kategorien,
Knöpfe, Profilbilder, die Leiste unten, jeder leere Bildschirm. Alle sind raus.

An ihrer Stelle stehen **41 selbst gezeichnete Symbole**. Der Unterschied ist nicht nur,
dass sie ruhiger aussehen:

- **Sie nehmen Farbe an.** Ein Emoji ist immer bunt, egal worauf es liegt — deshalb sah
  das 🏃 auf der gelben Sport-Pille aus wie ein Aufkleber. Das gezeichnete Symbol hat
  jetzt genau die Farbe der Kategorie.
- **Die Leiste unten hat einen echten Unterschied bekommen.** Vorher waren die drei
  nicht ausgewählten Symbole halb durchsichtig — das sah aus, als wären sie kaputt.
  Jetzt sind sie einfach grau, das ausgewählte schwarz.
- **Profilbilder sind Anfangsbuchstaben** auf farbigem Grund, wie bei WhatsApp. Das ist
  gleichzeitig genau der Platz, an dem später das echte Foto sitzt.
- **Die Landing-Page hat dieselben Symbole bekommen** — sonst hätte man beim Umschalten
  gemerkt, dass es zwei verschiedene Sachen sind.

**Was du dazu noch sagen musst, steht in [OFFENE_SACHEN.md](OFFENE_SACHEN.md), Punkt 2:**
ob es dir jetzt zu grau ist. Das ist die einzige Frage, die diese Phase offen lässt.

## ✅ Erledigt: was du am 03.09. gefunden hast

**„Warum ist die Karteikarte so komisch gedreht?"** — das war ein echter Fehler, und du
hast ihn gesehen, obwohl er vier Wochen lang niemandem aufgefallen wäre. Alle drei
Karten im Stapel lagen schief, ein bisschen zu groß, und der Stempel **„Weg" war
dauerhaft sichtbar** — bis man eine Karte einmal angefasst hat. Danach war alles richtig.

Der Grund ist eine Sache, nicht drei: Die Karte richtet sich nach ihrer eigenen Breite.
Beim Hochladen wird von der Seite ein Standbild gebaut, und dabei gibt es kein Fenster —
die Breite ist also null. Aus „von links nach rechts" wird damit „von null nach null",
und in so einem Fall nimmt das Programm nicht die Mitte, sondern den **linken Rand**:
also voll gekippt und voll gestempelt. Behoben ist es an der Wurzel — wenn keine Breite
gemessen werden kann, wird jetzt eine Notbreite eingesetzt.

**Das Bittere daran**, und der Grund, warum es im Plan ausführlich steht: Diese Fläche
beim Öffnen, die im Abschnitt darunter steht, hatte den Fehler nur *zugedeckt*. Sie
verschwindet nach dem Laden — und darunter stand der falsche Wert immer noch, weil ihn
nie jemand überschrieben hat. **Verdecken ist kein Reparieren.** Die Fläche bleibt
trotzdem, aber jetzt als das, was sie ist: eine Abdeckung fürs erste Bild.

Beides ist behoben, hochgeladen und auf der echten Adresse nachgeprüft.

## ✅ Erledigt am 03.09.: der Filter hat den Stapel kaputt geschoben

**Diesen habe ich gefunden, indem ich die fertige Fassung am schmalen Fenster
durchgeklickt habe** — so, wie deine drei sie am Handy sehen werden. Im Code sieht man
so etwas nie.

Tippte man im Stapel auf **„Filter"**, klappte das Feld auf und drückte die Karte aus
ihrem Platz heraus. Auf deinem iPhone lag sie dann **über den Kategorie-Pillen und über
dem „Bin dabei"-Knopf**; auf einem kleineren iPhone war es schlimmer: Die Karte
verdeckte die Reihe **„Für wen"** — also ausgerechnet den Alters-Filter, den sich Daria
und Leopold gewünscht hatten. Man kam nicht mehr dran.

Der Grund ist einer, der nur zusammen entsteht: Die Fläche für die Karten nimmt sich
„den Rest vom Platz". Nimmt das Filterfeld 250 Pixel, bleibt weniger Rest, als eine
Karte hoch ist — und die Karten schrumpfen nicht mit, weil sie frei übereinanderliegen.
Jeder der beiden Werte ist für sich richtig.

**Du hast entschieden: Das Filterfeld legt sich über die Karten, statt sie
wegzuschieben** — dasselbe Urteil wie beim Prototyp-Hinweis, den du unten haben wolltest.
Damit die Karte nicht einfach spurlos verschwindet, zählt die Anzeige oben live mit
(„Noch 8 Karten" → „Noch 7", sobald du „18–25" tippst).

*Nebenbei: Mein erster Fix war zu kurz gesprungen. Er sah auf zwei Handygrößen richtig
aus und ließ auf der dritten die Knöpfe verschwinden. Jetzt hängt das Feld dort, wo die
Karten selbst wissen, wo sie aufhören — das stimmt auf jeder Größe, auch wenn wir
später eine fünfte Filterreihe dazubauen. Und wenn das Feld einmal nicht ganz
hineinpasst, blendet es unten weich aus und lässt sich schieben, statt abgeschnitten zu
sein.*

Behoben, hochgeladen, auf der echten Adresse nachgeprüft.

## ✅ Erledigt am 03.09.: deine Arbeit liegt jetzt sicher

Das hier hat niemand gemeldet, es ist beim Nachsehen aufgefallen — und es war das
Wichtigste an diesem Tag.

**Auf GitHub stand als Quellcode noch der Stand vom 01.09.** Alles danach — der
Wischstapel, der aufgeräumte Erstellen-Screen, die 41 Icons, die Filter, die
Direktnachrichten, die Gruppen und der Fix von heute Früh — lag **nur auf deinem
Laptop**: 54 Dateien, gut 7.000 Zeilen, neun Phasen Arbeit.

Der Grund ist eine Falle, auf die man leicht hereinfällt: `npm run deploy` heißt
„hochladen" und sieht deshalb aus wie eine Sicherung. Ist es aber nicht. Es schiebt nur
die **fertig gebaute Seite** hinauf, damit sie im Netz steht — den Quellcode fasst es
nie an. Und aus der gebauten Seite bekommt man den Code nicht zurück; der ist dort
zusammengepresst und unlesbar.

Dasselbe galt für **PLAN.md und den ganzen `_FUER_IAN`-Ordner** — die lagen in gar
keiner Sicherung. iCloud zählt nicht: iCloud spiegelt nur. Wenn hier eine Datei kaputt
geht, geht sie dort mit kaputt, und es gibt keine ältere Fassung zum Zurückholen.

**Beides ist jetzt erledigt.** Der gesamte Code steht auf GitHub, die Doku liegt im
Ordner `doku/` mit dabei, und damit sie nicht wieder veraltet, frischt der Computer sie
bei jedem Speichern selbst auf — du musst dafür nichts tun.

**Was du dir merken solltest:** `npm run deploy` bringt die Seite ins Netz.
`git push` bringt die Arbeit in Sicherheit. Das sind zwei verschiedene Dinge, und du
brauchst beide.

## ✅ Erledigt: was du am 02.09. gemeldet hast

**„Auf Chrome am Handy sieht es kurz komisch aus."** — gefunden und behoben. Es lag
nicht an Chrome: Beim Hochladen wird von jeder Seite ein Standbild gebaut, und darin
kann der Wischstapel gar nicht richtig aussehen. Er richtet sich nach der Bildschirm-
breite und der Größe der Karte — beides weiß der Computer beim Bauen noch nicht.
Ergebnis: Die oberste Karte lag schief und halb aus dem Bild, bis das Programm geladen
war. Jetzt liegt beim Öffnen eine ruhige Fläche mit dem Schriftzug darüber, die
weggeblendet wird, sobald die App wirklich da ist. Wenn das Laden mal ganz fehlschlägt,
verschwindet die Fläche nach 8 Sekunden trotzdem — sonst wäre die Seite tot.

Beim Nachmessen sind drei weitere Sachen aufgefallen, die auch niemand gemeldet hätte:
Die Seite gab sich als **englisch** aus (weshalb Chrome am Handy „Übersetzen?" anbot),
der **Name im Browser-Tab fehlte** (dort stand die nackte Adresse — auch in jedem Link,
den du verschickst), und die **Adressleiste am Handy** hatte nicht die Farbe der App.
Alle drei sind jetzt richtig.

**„Der Prototyp-Hinweis soll unten sein wie eine Cookie-Abfrage."** — ist er. Unten,
über der App, mit einem richtigen „Verstanden"-Knopf statt einem kleinen ✕. Es ist die
dritte Fassung; die zwei davor stehen mit Begründung im Code, damit sie niemand
versehentlich wiederholt.

## ✅ Erledigt: du hast die Bausteine abgenommen

Am 31.08.2026 hast du sie dir angeschaut und drei Sachen beanstandet — alle drei sind
behoben:

1. **Man konnte nicht ganz runterscrollen.** Lag an den Handy-Browsern: die rechnen die
   Seitenhöhe gegen den Bildschirm *ohne* Adressleiste, dadurch lag das letzte Stück
   unter der Leiste. Behoben.
2. **Bei „Bin dabei" und „Posten" sah man den Schatten nicht.** Da hattest du einen
   echten Baufehler gefunden: der Knopf war fast schwarz und sein Schatten ganz schwarz.
   Zwischen den beiden liegt nichts, was das Auge sehen könnte. Der Knopf ist jetzt
   dunkelgrau statt schwarz, dazu die graue Umrandung, die du vorgeschlagen hast.
   Beim Nachmessen kam raus: bei Blau, Violett und Magenta war der Schatten auch zu
   schwach — die sind gleich mitkorrigiert.
3. **Sport ist gelb, Essen grün.** Umgesetzt. Auf Gelb musste die Schrift dunkel werden,
   sonst kann man sie nicht lesen.

Dass Essen und Draußen jetzt beide grün sind, hast du bewusst so gelassen.

## Was als Nächstes passiert

1. **Ein klickbarer Prototyp im Browser** — sieht aus wie die fertige App und man kann
   durchklicken, aber die Posts sind erfunden. Damit kannst du deinen drei Mitgründern
   und ersten Interessenten zeigen, wie das Ganze wird. *Ziel: diese Woche.*
   ✅ **Fertig seit 01.09.** Alles steht: posten → im Feed sehen → „Bin dabei" →
   bestätigen → Konfetti → Chat, die Profile mit Folgen, und seit Phase 7 auch Melden,
   Blockieren, Nutzungsbedingungen und Account löschen. **13 Bildschirme statt der
   geplanten 9.** Der nächste Schritt ist nur noch, ihn ins Netz zu stellen.
2. **Ein Link dazu**, den du am Handy öffnen und in WhatsApp weiterschicken kannst.
   ✅ **Fertig seit 01.09.** Steht ganz oben. Ab jetzt ist der nächste Schritt kein
   technischer mehr, sondern deiner: **herzeigen und zuhören.**
3. **Eine Landing-Page** mit einem „Über uns"-Teil über euch vier.
   ✅ **Fertig seit 01.09.** Steht ganz oben. Kurz gehalten, wie du wolltest, und ohne
   Organigramm — die Rollen stehen in einem Satz, der Rest ist „wir bauen das zu viert".
4. **Herzeigen und zuhören.** ✅ Du hast es am 01.09. am Handy angeschaut, und was du
   gesagt hast, ist eingebaut: das **Wischen**, der **vorausgefüllte Gruß**, die
   Landing-Page ohne Laufband, und das **Posten auf zwei Felder gekürzt**.
5. **Nochmal herzeigen — diesmal den anderen.** ← *jetzt dran, und wieder keine
   Programmieraufgabe.* Der Prototyp kann jetzt das, was er können sollte. Was deine
   drei Mitgründer und deine Freunde dazu sagen, entscheidet, was als Nächstes gebaut
   wird — das ist ab jetzt wichtiger als alles, was im Plan steht.
6. Erst danach: die echte App mit echten Nutzern und dem App Store.

## Was du selbst erledigen musst

Steht in **[OFFENE_SACHEN.md](OFFENE_SACHEN.md)** — dort sammle ich alles, wo ich nicht
weiterkomme, weil es Geld, Rechte, Inhalte oder eine Entscheidung von dir braucht.

## Ergebnisse in diesem Ordner

**Die Landing-Page:** https://ianfhorak-jpg.github.io/simplysocial-landing/
**Der Prototyp:** https://ianfhorak-jpg.github.io/simplysocial/

Das ist das erste fertige Ergebnis dieses Projekts — keine Datei, sondern eine Adresse.
Der Code dahinter liegt auf https://github.com/Ianfhorak-jpg/simplysocial.

**Das Repo ist öffentlich** — das musste es sein, weil GitHub Pages sonst Geld kostet.
Drin liegt nur die App selbst; `PLAN.md`, `CLAUDE.md` und dieser Ordner hier bleiben auf
deinem Rechner. Zwei Kleinigkeiten habe ich dafür aus den Fake-Daten genommen: In deiner
Bio standen deine Schule und deine Klasse, und in einem erfundenen Post der echte Name
eines Lehrers. Unter deinen Freunden ist das egal — auf einer Adresse, die jeder öffnen
kann, den der Link erreicht, wollte ich es nicht stehen lassen. Deine Bio sagt jetzt
„Bau gerade diese App. Immer für spontan zu haben." Wenn du es anders willst, ist es
eine Zeile in `src/data/mock.ts`.

Google findet die Seite nicht (`robots.txt`) — sie soll über deinen Link gefunden
werden, nicht über eine Suche.
