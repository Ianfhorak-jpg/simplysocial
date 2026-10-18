# 🚀 Was du jetzt machen musst — Weg in den App Store

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
