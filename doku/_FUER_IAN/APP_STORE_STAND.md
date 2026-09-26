# Wie weit sind wir wirklich beim App Store?

**Stand: 2026-09-26 · gemessen, nicht geschätzt**

---

## 🔴 Zuerst die unangenehme Nachricht

In unseren eigenen Notizen stand seit dem 13.09.:

> „Store-Eintrag seit 13.09.2026 **vollständig** (Build 1 VALID und zugeordnet,
> 7 Screenshots, Altersfreigabe 4+, Prüfinfos)."

**Das stimmt nicht.** Ich habe es heute zum ersten Mal wirklich bei Apple
nachgefragt, statt es aus unseren Notizen abzulesen. Von zehn Punkten ist **einer**
fertig.

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

Und die sieben Screenshots waren „fertig" — **als Datei** in `_FUER_IAN/`.
Hochgeladen war nie eines.

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
| **TestFlight / neuer Build** | `npm run testflight` fasst deinen Schlüsselbund an und legt ein Zertifikat in deinem Apple-Konto an | **ja** |
| **Privacy-Label** | Über die Schnittstelle weder les- noch schreibbar. Die sieben Einträge stehen fertig in [`DATENSCHUTZ_ETIKETT.md`](DATENSCHUTZ_ETIKETT.md) | **ja** |

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
4. **Design durchgehen** — die App vom heutigen Stand ist auf deinem iPhone
   (siehe unten). Was dir nicht passt, sagst du; danach ist der Stand stabil.
5. **Neuer Build → TestFlight** — erst wenn das Design steht.
6. **Rechtstext** — das ist der einzige Punkt, der wirklich Zeit braucht und an
   dem kein Werkzeug hilft.

Alles ab Punkt 5 hat nur Sinn, wenn 1–4 stehen: Jeder Build dauert 20 Minuten,
und ein Build mit einem Design, das du danach änderst, ist ein weggeworfener Build.
