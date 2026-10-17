# Wie weit sind wir wirklich beim App Store?

**Stand: 2026-09-26 · gemessen, nicht geschätzt**

> ## ⚠️ Diese Datei ist vom 26.09. und an drei Stellen überholt
>
> Am 2026-09-28 noch einmal bei Apple nachgefragt. **Du hast inzwischen viel
> erledigt, was hier unten noch als offen steht:**
>
> | steht unten als | ist in Wirklichkeit |
> |---|---|
> | 🔴 Preis fehlt — „die härteste Sperre" | ✅ **kostenlos, 175 Länder** |
> | 🔴 Altersfreigabe leer (27 × `null`) | ✅ **26 von 30 beantwortet** |
> | 🔴 kein einziges Bild bei Apple | ✅ **Screenshots da und abgenommen** |
>
> **Dafür sind zwei Punkte dazugekommen, die hier gar nicht vorkommen:** Apple
> verlangt eine Seite mit der **Datenschutzerklärung** und eine mit **Hilfe** —
> beide standen auf leer, und das Prüfwerkzeug hat sie nie abgefragt. Beide sind
> inzwischen gebaut und warten nur darauf, dass du sie ins Netz stellst.
>
> 📄 **Der aktuelle Stand und was zu tun ist:**
> [`WAS_DU_JETZT_MACHEN_MUSST.md`](WAS_DU_JETZT_MACHEN_MUSST.md)
>
> Was unten steht, ist trotzdem nicht falsch — es ist die **Erklärung**, warum die
> Punkte existieren und was sie bedeuten. Nur die Häkchen stimmen nicht mehr.
> Nachmessen kannst du jederzeit selbst:
>
> ```bash
> cd ~/Desktop/C.C.Projekts_Ian/33_SimplySocial/simplysocial
> npm run asc einreichbereit
> ```

---

## 🔴 Zuerst die unangenehme Nachricht

Ich habe heute zum ersten Mal **die ganze Einreich-Liste** bei Apple abgefragt.
Bisher haben wir immer nur nach Builds gefragt. Von zehn Punkten ist **einer**
fertig.

> ⚠️ **Eine Berichtigung an mir selbst, damit du der Liste trauen kannst.** Als ich
> das vorhin zum ersten Mal aufgeschrieben habe, stand hier, unsere Notizen hätten
> behauptet, der Store-Eintrag sei „vollständig". **Das war mein Fehler.** Dieser
> Satz steht im Haupt-Register und gehört dort **ACTA** — deinem Tennis-Projekt, das
> auch gerade bei Apple ist. SimplySocials Notizen haben das nie behauptet; beim
> Fragebogen stand sogar ausdrücklich, dass er leer ist.
>
> **An der Liste unten ändert das nichts** — die ist gemessen. Es ist nur eine andere
> Geschichte: Niemand hat gelogen, es hat nur nie jemand gefragt.

| | Punkt | Was wirklich dasteht |
|---|---|---|
| ✅ | Prüfinfos + Demo-Login | steht: Kontakt, Demo-Konto, Telefon |
| ❌ | Build an der Version | **keiner** — ohne das ist Einreichen gesperrt |
| ❌ | Altersfreigabe | 27 von 30 Feldern leer |
| ❌ | Inhaltsrechte | nicht beantwortet |
| ❌ | Copyright | leer |
| ❌ | Preis | **fehlt** — Apple nimmt die App sonst gar nicht an |
| ❌ | Kategorie | fehlt |
| ❌ | Werbe-ID-Frage | nie beantwortet |
| ❌ | Store-Texte | unvollständig |
| ❌ | Screenshots | bei Apple liegt **kein einziges** |
| ❓ | Privacy-Label | über die Schnittstelle nicht lesbar — nur im Browser sichtbar |

### Warum das niemandem aufgefallen ist

`npm run asc` zeigte immer brav „Build 2 · VALID". Das beantwortet aber eine
**andere** Frage: ob ein Build bei Apple *liegt* — nicht, ob er an der Version
*hängt*. Genau diese Verwechslung hat bei ACTA (deinem anderen Projekt) zwei
Sitzungen gekostet.

Für die anderen acht Punkte gab es hier überhaupt kein Werkzeug. Store-Screenshots
zum Beispiel gibt es noch nicht einmal als Datei — die müssen erst gemacht werden,
und dafür brauche ich Bilder von deinem iPhone (siehe unten).

**Ab jetzt gibt es dafür einen Befehl**, und der rät nicht:

```bash
cd ~/Desktop/C.C.Projekts_Ian/33_SimplySocial/simplysocial
npm run asc einreichbereit
```

Er fragt Apple und zeigt dir die Liste oben — immer aktuell, immer gemessen.
Er ändert **nichts**.

---

## Was du machst, und was ich mache

Die Aufteilung ist nicht willkürlich: **Alles, was nach außen wirkt — dein
Apple-Konto, Geld, Rechtstexte — machst du.** Ich bereite es so weit vor, dass es
ein Befehl oder ein Klick ist.

### 🟢 Fertig vorbereitet — du tippst einen Befehl

| Was | Befehl | Dauer |
|---|---|---|
| **Altersfreigabe** (28 Antworten) | `npm run asc altersfreigabe` → ansehen<br>`npm run asc altersfreigabe -- --wirklich` → schicken | 1 Minute |

Details und die Begründung je Antwort: [`ALTERSFREIGABE.md`](ALTERSFREIGABE.md).

### 🟡 Brauche ich einen Handgriff von dir, dann läuft es

| Was | Dein Handgriff | Was danach geht |
|---|---|---|
| **Screenshots vom Handy** | einmal pro Mac-Neustart:<br>`cd …/simplysocial && sudo npm run tunnel`<br>(Fenster offen lassen) | Ich kann mir selbst Bilder von deinem iPhone holen — für den App Store **und** um Design-Fehler nachzumessen, statt dich jedes Mal um einen Screenshot zu bitten |
| **Simulator anmelden** | einmal im Simulator als Demo-Konto anmelden | Ich kann Bildschirme automatisch knipsen und prüfen |

> Warum `sudo`? Seit iOS 17 geht Knipsen nur über einen Tunnel, und der legt ein
> Netzwerk-Interface an — das darf nur der Verwalter. Das lässt sich nicht
> wegprogrammieren. **Es ist ein Befehl pro Mac-Neustart, sonst nie wieder.**

### 🔴 Das kann nur dir gehören

| Was | Warum | Blockiert? |
|---|---|---|
| **Preis setzen** (kostenlos) | Apple lässt unseren Schlüssel nicht an Preise — das braucht Admin-/Finanzrechte in der Weboberfläche. Und es ist Geld | **ja, hart** |
| **Copyright** | Das ist der rechtliche Betreiber der App. Hängt an der Frage, auf wessen Namen das Apple-Programm läuft | **ja** |
| **Rechtstext** für die Nutzungsbedingungen | Kein Text, den ich erfinden darf. Das Häkchen dafür steht seit dem 14.09. und wartet nur auf den Text | **ja** |
| **Apple-Programm auf wessen Namen** | mit 16 üblicherweise über einen Elternteil | später teuer |
| **TestFlight / neuer Build** | `npm run testflight` lädt zu Apple hoch — das wirkt nach außen, also machst du es. 🟢 **Aber es ist leichter geworden, siehe unten** | **ja** |
| **Privacy-Label** | Über die Schnittstelle weder les- noch schreibbar. Die sieben Einträge stehen fertig in [`DATENSCHUTZ_ETIKETT.md`](DATENSCHUTZ_ETIKETT.md) | **ja** |

---

## Die Store-Texte — warum ich sie NICHT geschrieben habe

Das ist der eine Punkt, bei dem ich absichtlich stehen bleibe. Zwei Gründe:

1. **Es sind Inhalte, und Inhalte gehören dir.** Ein Store-Text ist das, was
   jemand über deine App liest, bevor er sie lädt. Den erfinde ich dir nicht
   nebenbei.
2. **Das Marketing liegt bewusst in einem anderen Projekt** (`34_SimplySocial_Marketing`),
   und dort steht die Positionierung schon: *„Du willst was machen. Du brauchst wen
   dafür."* — mit deiner **offenen Frage daneben**, ob der Satz so stimmt
   (`strategie/03_positionierung.md`). Wenn ich hier einen Store-Text schreibe,
   beantworte ich die Frage still mit.

**Was Apple genau verlangt**, damit die Arbeit in Projekt 34 ohne Rückfrage geht:

| Feld | Zeichen | was es ist |
|---|---|---|
| Name | **30** | steht: „SimplySocial" |
| Untertitel | **30** | die Zeile unter dem Namen im Store |
| Werbetext | **170** | änderbar OHNE neuen Build — der einzige Text, den man später frei drehen kann |
| Beschreibung | **4.000** | der lange Text. Die ersten ~3 Zeilen sind das, was ohne „mehr" sichtbar ist |
| Keywords | **100** | komma-getrennt, NICHT sichtbar, nur für die Suche. Wörter aus Name und Untertitel nicht wiederholen — sie zählen schon |
| Support-URL | — | Pflicht. Die Landing-Page geht |
| Marketing-URL | — | freiwillig |

> ⚠️ **Der Werbetext ist der wichtigste Trick dabei:** Er lässt sich jederzeit
> ändern, ohne einen neuen Build und ohne neue Prüfung. Alles, was sich noch
> bewegen könnte, gehört dorthin und nicht in die Beschreibung.

---

## 🟢 Gute Nachricht: TestFlight ist nicht mehr der Brocken, der es war

In unseren Notizen steht, `npm run testflight` müsse erst ein **Distribution-Zertifikat**
in deinem Apple-Konto anlegen, und dass ich genau daran nicht darf. Das galt am 14.09.

**Heute nachgesehen — es ist alles schon da:**

| | Zustand | gültig bis |
|---|---|---|
| Distribution-Zertifikat | vorhanden, auch in deinem Schlüsselbund | **14.09.2027** |
| Profil „SimplySocial App Store" | **ACTIVE** | **14.09.2027** |
| Development-Zertifikat | vorhanden | 22.05.2027 |

Das hat dein eigener TestFlight-Lauf am 14.09. angelegt (daher Build 2). Der
Schritt, der damals gehakt hat, **fällt beim nächsten Mal weg** — es bleibt Bauen
und Hochladen, rund 20 Minuten, und du musst nur danebensitzen.

> Warum ich den Lauf trotzdem nicht selbst mache: Hochladen wirkt nach außen. Alles,
> was bei Apple, in der echten Datenbank oder in deinem Konto landet, machst du.

---

## Der Build: was drauf ist und was fehlt

Bei Apple liegen zwei Builds:

| | hochgeladen | was drin ist |
|---|---|---|
| Build 1 | 11.09. | alt |
| Build 2 | 14.09. abends | Zustimmungs-Häkchen ✓ · dunkle Fassung ✓ |

**Build 2 ist 12 Tage und rund 40 Commits alt.** Nichts aus deinen Entscheidungen
90 bis 110 ist drin: keine Kopfkapsel, keine geschärften Bezirksgrenzen, nicht die
Reparatur der hellen Streifen.

**Ich hänge ihn deshalb bewusst nicht an die Version.** Einen veralteten Build
anzuhängen und „erledigt" zu melden ist genau der Fehler, der bei ACTA schon
einmal passiert ist. Was zu Apple geht, muss den Code von heute tragen — also
braucht es vorher einen neuen Build.

---

## Die Reihenfolge, die ich vorschlagen würde

1. **Altersfreigabe schicken** — ein Befehl, sofort, kostet nichts.
2. **Preis auf kostenlos setzen** — das ist die harte Sperre, und nur du kommst dran.
3. **Der Tunnel-Befehl**, damit ich Screenshots holen kann.
4. ✅ **Der heutige Stand ist seit 19:09 auf deinem iPhone** — der Wartelauf hat
   das Entsperren bemerkt und selbst aufgespielt. **Jetzt bist du dran:** Mach die
   App auf und sag, was dir nicht passt. Danach ist der Stand stabil.
   *(Falls sie sich nicht öffnen lässt: Einstellungen → Allgemein → VPN &
   Geräteverwaltung → Profil → Vertrauen.)*
5. **Neuer Build → TestFlight** — erst wenn das Design steht.
6. **Rechtstext** — das ist der einzige Punkt, der wirklich Zeit braucht und an
   dem kein Werkzeug hilft.

Alles ab Punkt 5 hat nur Sinn, wenn 1–4 stehen: Jeder Build dauert 20 Minuten,
und ein Build mit einem Design, das du danach änderst, ist ein weggeworfener Build.
