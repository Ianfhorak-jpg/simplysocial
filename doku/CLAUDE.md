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

🔜 **Als Nächstes: wieder herzeigen.** Am 2026-09-02 haben die drei Mitgründer den
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

**Es wartet gerade keine Frage auf Ian.**

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
   ~~Chat-Liste~~
8. **Wieder herzeigen** ← *hier sind wir* — die drei haben Phase 13 gesehen, nicht 18a
9. Danach: echtes Backend, EAS-Build, App Store

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
22. **Der Prototyp-Hinweis liegt UNTEN und überdeckt.** Ians Urteil am Handy vom
   2026-09-02: oben war er schwerer zu verstehen. Drei Fassungen sind durch, alle drei
   samt Begründung im Kopf von `components/PrototypHinweis.tsx` — **wer ihn verschiebt,
   liest die Liste zuerst**, sonst landet er bei einer, die schon durchgefallen ist.
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
24. **`SsIcon` zeichnet auf Web und nirgends sonst.** Auf iOS/Android steht ein
   sichtbarer Platzhalter, weil es dort kein `<svg>` gibt und `react-native-svg` ein
   Native-Modul wäre (Regel 1, und PLAN.md Phase 14 sagt es wörtlich). **Das ist keine
   Baustelle zum Nebenbei-Beheben** — der Tausch gehört zum ersten EAS-Build und ist
   dann EINE Datei: Pfaddaten (`theme/icons.ts`) und Zeichner (`SsIcon.tsx`) sind
   genau dafür getrennt. Kein Screen wird angefasst.
25. **`landing/icons.js` ist eine KOPIE von `theme/icons.ts`, keine Verbindung** —
   dieselbe Lage wie bei `stil.css` (Regel 13) und derselbe Grund: Die Landing-Page hat
   bewusst kein npm. Wer einen Pfad in der App ändert, ändert die Seite NICHT mit.
   In der Kopie stehen nur die sieben Icons, die die Seite braucht.

26. **Ein neuer Feed-Filter geht über `FeedFilter` und `features/posts/filter.ts`** —
   nie als eigener `useState` im Screen. Zwei Gründe, und beide fallen erst später auf:
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
   Weg zu `/gruppen` liegt deshalb am Profil, nicht in der Tab-Leiste.

35. **`npm run deploy` ist KEINE Sicherung — es schiebt nur `gh-pages`.** Der Zweig
   trägt das gebaute, minifizierte Bündel; `main` mit dem Quellcode fasst das Skript
   nie an. Am 2026-09-03 kam so heraus, dass neun Phasen (54 Dateien, ~7.100 Zeilen)
   ausschließlich lokal lagen, während die Seite tagelang aktuell aussah. **Nach jeder
   Phase committen und pushen.** Die Doku (`PLAN.md`, `CLAUDE.md`, `_FUER_IAN/`) liegt
   außerhalb der Repo-Wurzel und kommt über `doku/` mit — kopiert von
   `scripts/doku.sh`, aufgerufen von `.git/hooks/pre-commit`, damit die Kopie nicht
   still veraltet wie `landing/stil.css` (Regel 13). **Der Hook wird nicht
   mitversioniert**: nach einem frischen Clone neu anlegen, Anleitung in
   `doku/LIESMICH.md`.

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
