# 🚀 Was du jetzt machen musst — Weg in den App Store

**Stand: 2026-10-20, abends · Build 6 ist nötig — und warum**

> Du wolltest die App absichern, bevor du drei Wochen weg bist. Das ist passiert —
> und dabei sind zwei Dinge ans Licht gekommen, die **vor** dem Einreichen stehen müssen.

---

## Die Reihenfolge (alles von deinem Mac, auch aus dem Ausland)

```bash
cd ~/Desktop/C.C.Projekts_Ian/33_SimplySocial/simplysocial

npm run testflight                           # 1 · Build 6 bauen, ~20 Min
npm run asc build-anhaengen -- --wirklich    # 2 · dranhängen (ohne --trotzdem: es ist ein frischer Build)
npm run asc altersfreigabe                   # 3 · Trockenlauf: muss "NONE → THIRTEEN_PLUS" zeigen
npm run asc altersfreigabe -- --wirklich     # 4 · 13+ bei Apple setzen
npm run asc einreichbereit                   # 5 · muss 0 offene Punkte zeigen
```

Dann in App Store Connect **„Zur Prüfung hinzufügen“**. Das Privacy-Label hast du schon.

⚠️ **Build 5 nicht einreichen.** Er sagt noch „ab 13“, zeigt den Jahrgang auf das Jahr
genau, und der Treffpunkt steht für alle sichtbar am Post.

## Was in Build 6 anders ist

| | |
|---|---|
| **Mindestalter 14** | war 13. Ab 14 braucht man in Österreich keine Zustimmung der Eltern für die Daten — die konnte die App ohnehin nie belegen. Passt jetzt zum Jahrgangs-Schieber (der fing schon bei 14 an: ein 13-Jähriger konnte seinen Jahrgang gar nicht eintragen) |
| **Am Profil steht „14–17“** | statt „Jahrgang 2011“. Das kehrt deine Entscheidung 30 um — **ein Wort** in `config/alter.ts` (`JAHRGANG_ANZEIGE`), falls du es zurück willst |
| **Treffpunkt** | sieht nur noch der Host und wer bestätigt wurde. ⚠️ Das ist die ANZEIGE, nicht der Server — siehe „Was noch offen ist“ |
| **Hinweis beim Treffpunkt-Feld** | „Für alle sichtbar — nimm einen öffentlichen Ort, keine Adresse von zu Hause“ |
| **Hinweis im Chat** | „Triff dich beim ersten Mal an einem öffentlichen Ort … Niemand darf dich zu etwas drängen“ |
| **Nutzungsbedingungen** | neuer Satz: Wer Minderjährige belästigt, wird entfernt, schwere Fälle gehen an die Polizei. **Lies ihn — es ist eine Zusage in deinem Namen** |
| **Melden** | „Ich fühle mich unsicher“ nennt jetzt ausdrücklich Erwachsene, die Minderjährige bedrängen (zählt als „gefährlich“ = 24 Stunden) |
| **Altersfreigabe 13+** | war bei Apple **4+** (siehe unten) |
| **Datenschutzseite** | ist schon aktualisiert und online („ab 14“, Fassung 1.1) |

## Zwei Dinge, die ich gefunden habe

**1. Die Altersfreigabe bei Apple war falsch beschriftet.** Wir haben „Chat“, „Nutzerinhalte“
und „Soziale Netzwerke“ auf Ja gesetzt, und Apple hat trotzdem **4+** ausgerechnet. Eure
Doku sagte „daraus folgt 13+“ — das stimmte nicht. Schritt 3/4 oben behebt es.

**2. Die englische App war noch nicht so englisch wie behauptet.** Beim Durchsehen standen
noch rund 40 deutsche Texte drin: „Anfragen“, „Wem ich folge“, „Post melden“, „Zurück“,
„freiwillig“ … alle ersetzt, und die Prüfung findet so etwas jetzt selbst.

## Wenn du weg bist — das Wichtigste

**Wer liest die Meldungen?** In den Nutzungsbedingungen steht: gefährlich/Belästigung in
**24 Stunden**. Das kannst du nur halten, wenn du jeden Tag nachsiehst:

```bash
cd ~/Desktop/C.C.Projekts_Ian/33_SimplySocial/simplysocial && npm run meldungen
```

Er zeigt das Dringendste oben. Einen Post entfernen:
`npm run meldungen -- post-loeschen <post-id> --wirklich`, ein Konto:
`npm run meldungen -- konto-loeschen <@name> --wirklich`.

⚠️ **Frag, bevor du fliegst, ob du das unterwegs wirklich kannst** (Laptop, Internet).
Wenn nicht: einer der Mitgründer braucht deinen Zugang, oder du reichst erst nach deiner
Rückkehr ein. Eine Zusage, die man nicht hält, ist schlechter als eine vorsichtigere
— und genau dieses Versprechen liest der Prüfer.

## Was noch offen ist — und für das Gründerservice

| | |
|---|---|
| 🔴 **Erwachsene und Minderjährige sind nicht getrennt** | Das größte, was bleibt. Ein Erwachsener sieht jedes Profil und kann bei jedem Post „Bin dabei“ tippen. Die Trennung (unter 18 / ab 18) ist die wirksamste Maßnahme, braucht aber eine Datenbankänderung und ist **deine Entscheidung**, weil sie die Reichweite kleiner macht |
| 🔴 **Der Treffpunkt ist nur versteckt, nicht gesperrt** | Wer die Schnittstelle direkt ansprechen kann, liest ihn weiter. Echte Lösung: eine Server-Regel |
| 🔴 **Dein Apple-Entwicklerkonto** | Läuft auf **deinen** Namen, und du bist 17. Ich glaube, Apple verlangt für das Programm die **Volljährigkeit** — **das habe ich nicht nachgesehen, sieh bei Apple nach.** Falls ja, könnte das Konto gesperrt werden, und das ist genau deine Sorge. Eine Lösung wäre, dass ein Elternteil das Konto führt. Bring das mit zum Gründerservice |
| 🟡 **Haftung als Betreiber mit 17** | war schon offen, ist wichtiger geworden |
| 🟡 **Kein „Melden“-Grund nur für Minderjährige** | würde eine Datenbankänderung brauchen. Bis dahin tragen „unsicher“ und „Belästigung“ das |
| 🟡 **Konten sperren** | `konto-loeschen` löscht — wer dieselbe E-Mail neu anmeldet, ist wieder da. Es gibt keine Sperrliste |

---

# (Der Stand davor)


**Stand: 2026-10-18 · die App spricht Englisch**

> Am 17. und 18.10. ist die Übersetzung gebaut worden: Die ganze Oberfläche gibt es
> jetzt auf Deutsch UND Englisch, mit einem Umschalter in den Einstellungen.
> Was du selbst gefunden hast („Alle, die SimplySocial verwenden" stand noch deutsch),
> war mehr als ein vergessener Satz — es war eine gebrochene Regel, die niemand
> bemerkt hatte.

---

## In einem Satz

**Meine zwei Sachen sind fertig. Jetzt bist du dran — aber lies bitte den Kasten
darunter, da ist etwas aufgetaucht.**

| | wer | was |
|---|---|---|
| 1 | ich ✅ | Die **Zeitangaben** übersetzt („Heute 18:30" → „Today 18:30", „vor 2 Tagen" → „2 days ago", „Mo" → „Mon") |
| 2 | ich ✅ | Den **Baustein nachinstalliert**, der die iPhone-Sprache erkennt. Ab Build 5 stellt sich die App von selbst auf Englisch, wenn dein iPhone Englisch spricht |
| 3 | **du** | **Build 5 bauen und einreichen** |

---

## 🔴 Dabei ist etwas herausgekommen, das du wissen solltest

**Die App war noch nicht so englisch, wie hier stand.** Nachdem ich die Zeitangaben
fertig hatte, habe ich nachgemessen — und es standen noch **rund 45 deutsche Sätze**
in der englischen Oberfläche. Zum Beispiel „Du bist dabei" im Anfragen-Tab, „Was du
vorhast" auf dem Profil und alles, was die App sagt, wenn etwas schiefgeht.

**Warum das niemandem auffiel:** Die automatische Prüfung meldete grün. Sie sucht
deutsche Sätze an den Umlauten — und „Du bist dabei" hat keinen. Sie konnte diese
Sätze gar nicht sehen.

**Erledigt:** Alle 45 sind übersetzt, und die Prüfung kann die Lücke jetzt sehen
(sie sucht zusätzlich nach deutschen Wörtern wie „du", „nicht", „noch").

**Nebenbei gefunden und behoben:** Auf dem Fehlerbildschirm („keine Verbindung")
stand ein Stück Programmiersprache statt eines Satzes — `laden.keineVerbindung`.
Das ist in Build 4 drin und ab Build 5 weg.

⚠️ **Was ich NICHT prüfen konnte:** wie es am Gerät aussieht. Dafür hätte ich einen
Schalter umlegen müssen, den ich nicht anfassen darf (er entscheidet, ob die App an
die echten Daten geht). **Deshalb ist dein Durchgang am Handy diesmal wichtiger als
sonst:** Sprache auf English stellen und einmal durch alle Tabs.

⚠️ **Build 4 liegt bei Apple und ist jetzt veraltet.** Nicht weil etwas kaputt ist —
sondern weil die Übersetzung danach kam. Er würde eine App verschicken, die nur
Deutsch spricht.

---

## Wenn ich mit 1 und 2 fertig bin, machst du das

```bash
cd ~/Desktop/C.C.Projekts_Ian/33_SimplySocial/simplysocial

npm run testflight                         # 1 · Build 5 · 20 Minuten
npm run asc build-anhaengen -- --wirklich  # 2 · dranhängen
npm run asc einreichbereit                 # 3 · muss 12 von 12 zeigen
```

Dann in App Store Connect: **Datenschutz-Etikett** nachsehen (steht dort „Bearbeiten",
ist es fertig) und **„Zur Prüfung hinzufügen"** klicken.

⚠️ Die Build-Nummer zähle ich vorher hoch — darum musst du dich nicht kümmern.

---

## Eine Sache gehört dir, und sie ist nicht technisch

🔴 **Deine sechs Hausregeln gelten jetzt auch auf Englisch.**

Ich habe sie **wörtlich treu** übersetzt, nicht neu formuliert — es sind Regeln, die
du aufstellst und für die du haftest. Einen Satz wie „im Zweifel gilt die deutsche
Fassung" habe ich **nicht** hingeschrieben: Das wäre eine Rechtsaussage, und die darf
ich nicht erfinden.

**Schau dir die englische Fassung an**, bevor du einreichst. Am Handy unter
Einstellungen → Sprache → English, dann Einstellungen → Rechtliches.

In `simplysocial/src/i18n/WOERTER.md` stand dazu ein Häkchen, das du noch nicht
gesetzt hattest — deshalb sage ich es hier noch einmal deutlich.

---


## ✅ Was längst erledigt ist — damit du es nicht noch einmal suchst

| | |
|---|---|
| ✅ Datenschutz-Seite | [live](https://ianfhorak-jpg.github.io/simplysocial-landing/datenschutz.html) |
| ✅ Hilfe-Seite | [live](https://ianfhorak-jpg.github.io/simplysocial-landing/hilfe.html) |
| ✅ Store-Texte, Untertitel, Suchwörter, Werbetext | bei Apple |
| ✅ Preis (kostenlos, 175 Länder) · Altersfreigabe · Kategorie · Werbe-ID | bei Apple |
| ✅ Screenshots · Prüfinfos · Copyright · Inhaltsrechte | bei Apple |
| ✅ Der rote Kasten im Rechtstext-Screen | raus |
| ✅ Deine Supabase wird wachgehalten | zweimal täglich, automatisch |
| ✅ Der Rechtstext im Screen | deine sechs Regeln, Betreiber, Alter, Datenschutz, Apples Lizenzvertrag |

**Bei Apple stehen 11 von 12 Punkten.** Der einzige offene ist der Build.

---

## Der eine Punkt, den ich nicht messen kann

**Das Datenschutz-Etikett** (in App Store Connect unter *App-Datenschutz*).
Apple lässt es über die Schnittstelle weder lesen noch schreiben — ich kann dir
nicht sagen, ob es ausgefüllt ist.

**So siehst du es:** Steht dort *„Bearbeiten"*, ist es ausgefüllt. Steht dort
*„Erste Schritte"*, fehlt es noch. Die sieben Einträge zum Abtippen liegen in
`_FUER_IAN/DATENSCHUTZ_ETIKETT.md`.

---

## Die Reihenfolge

**Warte, bis ich dir sage, dass 1 und 2 fertig sind** (Zeitangaben übersetzt, Baustein
installiert). Dann:

1. **`npm run testflight`** — Build **5**, 20 Minuten
2. **`npm run asc build-anhaengen -- --wirklich`**
3. **Am iPhone umschalten und hinschauen** — Einstellungen → Sprache → English, dann
   durch alle Tabs. **Ein deutsches Wort in englischer Oberfläche ist genau der Fehler,
   der ACTA zu Apple geschickt hat.** Besonders: Einstellungen → Rechtliches
4. **Datenschutz-Etikett** nachsehen, ob es steht
5. **Einreichen**

Nach jedem Schritt:

```bash
npm run asc einreichbereit
```

Zwölf Punkte. Wenn nur noch das Privacy-Label ein `?` trägt, bist du fertig.

⚠️ **Die Warnung, die bei ACTA Tage gekostet hat:** `einreichbereit` misst **Felder,
nicht Erfolg.** Dort standen alle Punkte grün, während die App vier Tage abgelehnt war.
Der Grund steht **nie** in Apples Schnittstelle — er steht **in deiner Mail**. Wenn
Apple sich meldet, schick sie mir.

⚠️ **Räum das Demo-Konto nicht auf**, solange Apple prüft. Der Prüfer meldet sich damit
an, und die Demo-Daten füllen erst seinen Feed.
