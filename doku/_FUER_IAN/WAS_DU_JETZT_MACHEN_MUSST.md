# 🚀 Was du jetzt machen musst — Weg in den App Store

**Stand: 2026-09-26 · alles gemessen, nicht geschätzt**

---

## In einem Satz

Ich habe alles vorbereitet, was sich vorbereiten lässt. **Es bleiben sechs Dinge,
und fünf davon sind ein Befehl.** Das Sechste ist der Rechtstext, und der braucht
dich wirklich.

Warum ich die Befehle nicht selbst laufen lasse: Sie schreiben in **dein**
Apple-Konto. Alles, was nach außen wirkt, machst du — das ist die Regel, die
verhindert, dass ein Versehen von mir bei Apple landet.

---

## Zuerst: Was ich aus ACTA gelernt habe

Du hast gesagt, ich soll mir dein Tennis-Projekt ansehen, damit nicht dieselben
Fehler passieren. **Das hat sich gelohnt — zwei ACTA-Ablehnungen wären hier
genauso passiert.**

### 🔴 Fehler 1, der hier schon eingebaut war: der iPad

Apple hat ACTA am 22.09. abgelehnt: *„The login screen was not entirely visible."*
Geprüft auf einem iPad Air 11".

ACTA ist iPhone-only — trotzdem läuft die App auf einem iPad in einem **Fenster,
das man kleiner ziehen kann**. Und wenn das Fenster kürzer wird als der Inhalt,
wurde einfach abgeschnitten. Die Knöpfe waren **nicht mehr erreichbar**.

**SimplySocial war Zeichen für Zeichen gleich eingestellt.** Ich habe es
nachgemessen: dieselbe iPad-Einstellung, dieselbe Hochkant-Sperre (die ACTA nicht
gerettet hat), dieselbe Bauweise in der Screen-Hülle.

Behoben — aber **anders als bei ACTA**, und das ist der Punkt:

> Bei ACTA konnte man einfach alles scrollbar machen. Hier geht das nicht: Sechs
> Bildschirme haben eine Liste drin, und eine Liste in einem Scroll-Bereich
> zerlegt sich. Ich habe deshalb die **Voreinstellung umgedreht** — gerettet ist
> jetzt der Normalfall, und die sechs Listen-Bildschirme sagen ausdrücklich
> „ich scrolle selbst".

Das ist übrigens genau die Lehre, die in ACTAs Notizen steht: *„Eine Prop, die
Rettung anbietet, rettet nur die, die sie setzen."*

### 🔴 Fehler 2, der hier noch offen war: leere Prüfnotizen

ACTAs **erste** Ablehnung am 14.09. war gar kein Mangel an der App. Apple fragte
als Routine bei Erstentwicklern: Was ist das, für wen, wie kommen wir rein? Das
kostete dich ein Video und acht Tage.

**Bei SimplySocial war das Notizfeld leer.** Ich habe den Text geschrieben — was
die App ist, für wen, wie man sich anmeldet, und **wo genau** Melden, Blockieren,
Nutzungsbedingungen und Konto-Löschen stecken. Jeden Weg habe ich im Code
nachgeprüft; ein falscher Weg in den Notizen ist schlimmer als keine Notiz.

---

## Die sechs Dinge

Alle Befehle laufen hier:

```bash
cd ~/Desktop/C.C.Projekts_Ian/33_SimplySocial/simplysocial
```

Jeder Befehl **ohne** `--wirklich` zeigt dir nur, was passieren würde. Ich habe
alle vier in dieser Form laufen lassen — sie funktionieren.

### 1 · Altersfreigabe · 1 Minute

```bash
npm run asc altersfreigabe -- --wirklich
```

28 Antworten, die sonst einzeln ins Webformular geklickt werden müssten.
Ergebnis: **13+**, und das ist keine Wahl, sondern folgt aus Feed, Chat und
Social-Media-Funktion. Begründung je Antwort: [`ALTERSFREIGABE.md`](ALTERSFREIGABE.md).

### 2 · Prüfnotizen · 1 Minute

```bash
npm run asc pruefnotizen -- --wirklich
```

Der Text, der ACTAs erste Runde erspart hätte. 2.785 Zeichen, Apples Grenze
liegt bei 4.000.

### 3 · Kategorie und Werbe-ID · 1 Minute

```bash
npm run asc metadaten -- --wirklich
```

Setzt **Soziale Netze** als Kategorie und beantwortet Apples Werbe-ID-Frage mit
Nein (die App hat kein einziges Werbe- oder Analyse-Paket).

### 4 · Screenshots hochladen · 2 Minuten

```bash
npm run asc screenshots -- --wirklich
```

Acht Bilder, alle in Apples Pflichtformat 1320×2868. **Ich habe sie selbst
gemacht** — vom Simulator, mit den erfundenen Daten aus dem Prototyp, damit keine
echten Menschen mit Namen und Bezirk im Store stehen.

> ⚠️ ACTAs Lehre dazu: Dort lagen die Bilder als **Datei** im Ordner, im Plan
> stand „Screenshots fertig" — und bei Apple lag keines. *Fertig als Datei ist
> nicht fertig bei Apple.* Deshalb prüft der Befehl danach nach, ob sie wirklich
> angekommen sind.

### 5 · Preis auf kostenlos · nur im Browser

**Das ist die härteste Sperre**, und mein Schlüssel darf nicht daran — Apple
antwortet mit „nicht erlaubt". Preise brauchen Admin-Rechte in der Weboberfläche.

App Store Connect → SimplySocial → **Preise und Verfügbarkeit** → kostenlos.

Ohne das lehnt Apple die Einreichung mit `APP_PRICING_REQUIRED` ab — und zwar
ohne dass es irgendwo als fehlendes Feld auftaucht. Bei ACTA meldete der Bericht
7 von 7 grün, und Apple sagte trotzdem nein.

### 6 · Der Rechtstext · der einzige echte Brocken

Die Nutzungsbedingungen. **Kein Text, den ich erfinden darf.** Das Häkchen dafür
steht seit dem 14.09. in der App und wartet nur auf den Inhalt. Dazu gehört die
Frage, ab welchem Alter ihr Leute in der App haben *wollt* — Apples 13+ ist eine
Store-Einstufung und keine Antwort darauf.

Dazu passt das **Copyright**-Feld: Da gehört rein, wer die App rechtlich
betreibt. Das hängt an der Frage, auf wessen Namen das Apple-Programm läuft.

---

## Danach: Build und Einreichen

🟢 **Gute Nachricht:** In unseren Notizen stand, TestFlight müsse erst ein
Zertifikat in deinem Konto anlegen und ich dürfe da nicht dran. Das galt am 14.09.
**Heute nachgesehen: Zertifikat und Profil sind da, beide gültig bis 14.09.2027.**
Dein eigener Lauf am 14.09. hat sie angelegt. Der Schritt fällt weg.

```bash
npm run testflight        # baut und lädt hoch, 15–25 Minuten
```

⚠️ **Vorher muss der Schalter zurück auf `supabase` stehen.** Für die Screenshots
habe ich ihn auf die Attrappe gestellt und danach zurückgedreht — `deploy.sh` und
`geraet-bauen.sh` bewachen das, aber sieh im Zweifel nach.

Danach prüfst du mit einem Blick, ob alles steht:

```bash
npm run asc einreichbereit
```

Dieser Befehl ändert nichts. Er fragt Apple und zeigt dir die zehn Punkte.

> 🔴 **Und die wichtigste Lehre aus ACTA:** Der Bericht misst, ob die **Felder
> gefüllt** sind — nicht, ob Apple zufrieden ist. Bei ACTA meldete er zehn von
> zehn grün, während die App seit vier Tagen **abgelehnt** war. Der Grund steht
> nie in der Schnittstelle, sondern in deiner **Mail von Apple**.

---

## Was ich heute sonst noch gemacht habe

| | |
|---|---|
| **Backend geprüft** | 171 Server-Prüfungen grün. Zwei Fehler im Prüfstand selbst behoben — er lief gar nicht mehr an |
| **App auf dein iPhone** | Der Stand von heute liegt drauf (seit 19:09, hat sich selbst aufgespielt, als du das Handy aufgemacht hast) |
| **Screenshots von deinem iPhone** | Gehen jetzt ohne dich — ich hole sie mir selbst, solange der Tunnel läuft |
| **Simulator antippen** | Geht jetzt auch. Das stand seit Monaten als „blockiert" in der Doku — die Berechtigung war längst erteilt |
| **Kartengrenzen** | Am Gerät nachgemessen: die Zacken sind weg |

---

## Die Reihenfolge, die ich vorschlagen würde

1. **Punkte 1 bis 4** — vier Befehle, zusammen keine fünf Minuten.
2. **Punkt 5**, der Preis — im Browser, und danach `npm run asc einreichbereit`.
3. **Punkt 6**, der Rechtstext — nimm dir Zeit, das ist der einzige, der welche braucht.
4. **Store-Texte** — Beschreibung und Suchbegriffe. Die gehören in dein
   Marketing-Projekt (34), weil dort die Positionierung steht. Apples
   Zeichengrenzen habe ich in [`APP_STORE_STAND.md`](APP_STORE_STAND.md) hinterlegt.
5. **Build + einreichen.**
