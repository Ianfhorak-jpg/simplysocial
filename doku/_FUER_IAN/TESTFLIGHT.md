# TestFlight — ein Befehl

**Stand: 2026-09-14** · Phase 21.4

---

## Das ist alles

```bash
cd ~/Desktop/C.C.Projekts_Ian/33_SimplySocial/simplysocial
npm run testflight
```

Dauert **15 bis 25 Minuten**, davon die meiste Zeit das Archivieren. Danach
verarbeitet Apple den Build noch 5 bis 30 Minuten, und dann liegt er in deiner
TestFlight-App.

---

## ⚠️ Warum du das startest und nicht ich

Zwei der Schritte fassen deinen **Apple-Schlüsselbund** an und legen in **deinem
Apple-Konto** ein Zertifikat an. Mein Auto-Modus blockt so etwas ab — zu Recht: Das
sind deine Schlüssel, nicht meine.

Alles andere ist vorbereitet und geprüft. Der Befehl macht sechs Schritte und sagt
dir vor jedem, was er vorhat. Mit **Strg-C** brichst du jederzeit ab.

---

## Was der Befehl macht

| | Schritt | Wann |
|---|---|---|
| 1 | **Distribution-Zertifikat** in deinem Apple-Konto anlegen | nur beim ersten Mal |
| 2 | Es in deinen Schlüsselbund legen | nur beim ersten Mal |
| 3 | **Provisioning-Profil** anlegen | nur beim ersten Mal |
| 4 | Archivieren | jedes Mal, ~15 Min |
| 5 | Als `.ipa` exportieren | jedes Mal |
| 6 | Zu App Store Connect hochladen | jedes Mal |

**Ab dem zweiten Mal dauert es nur noch Schritt 4 bis 6.**

### Zu Schritt 1 — das musst du wissen

Für einen Gerätebuild reicht ein **Development**-Zertifikat, für TestFlight braucht
es ein **Distribution**-Zertifikat. In deinem Konto liegt nur das erste.

Ich habe nachgesehen: Du hast **null** Distribution-Zertifikate, Apple erlaubt
**zwei**. Es ist also Platz, und widerrufen kannst du es jederzeit unter
`developer.apple.com` → Certificates. Der private Schlüssel landet in
`~/.appstoreconnect/dist/` mit Rechten 600 — außerhalb des Projektordners, damit er
nie auf GitHub landen kann.

> 🔍 **Merkwürdig, und ich sage es lieber:** Build 1 ist am 11.09. bei Apple gelandet,
> aber im Konto ist keine Spur davon — kein Distribution-Zertifikat, kein Profil, und
> `eas build:list` ist leer. Wie er damals signiert wurde, weiß ich nicht. Ab jetzt
> steht der Weg im Skript und ist wiederholbar.

---

## Was in diesem Build drin ist

- ✅ **Liquid Glass** — Knöpfe als Kapseln, Apple-Ecken, Zurück-Knopf als Glaskreis
- ✅ **Die neuen Posts** — groß und ruhig
- ✅ **Umschalter zweistufig** — Stapel · Karte
- ✅ **Wischgefühl** — Vibration an der Schwelle, Farbton beim Ziehen, Match vibriert
- ✅ **Treffen-Zähler im Profil**
- ✅ **Der Vergleichs-Bildschirm** mit den drei Post-Fassungen
  (Einstellungen → Für die Entwicklung) — den kannst du also auch in TestFlight
  ansehen und mir danach A, B oder C sagen

⚠️ **Der Treffen-Zähler steht auf 0**, solange die Datenbank die neue Spalte nicht
hat. Das ist der andere Befehl, aus `TREFFEN_ZAEHLER.md`:

```bash
npm run einspielen 0012_treffen_zaehler.sql
```

Die beiden sind unabhängig — du kannst TestFlight zuerst machen.

---

## Wer den Build bekommt

Nur du. Die interne Gruppe **„Gründer"** steht auf *„bekommt alle Builds"*, also
landet der neue automatisch darin — du musst nichts zuweisen.

Christoph, Leopold und Daria kommen dazu, wenn du es sagst. Dann steht allerdings
wieder die Frage **intern oder extern** an: Extern hieße Apples Beta-Prüfung, und die
will die Rechtstexte sehen, die noch offen sind.

---

## 🔧 Behoben am 14.09. — falls du die Meldung noch im Terminal hast

Dein erster Lauf ist in Schritt 2 gescheitert:

```
security: SecKeychainItemImport: MAC verification failed
          during PKCS12 import (wrong password?)
```

**Das Passwort war nie das Problem.** Auf deinem Mac ist `openssl` das von Homebrew
(Version 3), und das verpackt Zertifikate in einem neuen Format, das Apples
Schlüsselbund nicht lesen kann. Er kann die Prüfsumme nicht nachrechnen und nennt
das „falsches Passwort" — die irreführendste Fehlermeldung in diesem Projekt.

Ich habe es nachgemessen statt geraten: dasselbe Zertifikat zweimal verpackt, einmal
alt und einmal neu, und beide importiert. Alt: *„1 identity imported."* Neu: exakt
deine Meldung. Im Skript steht jetzt ein `-legacy`, das das alte Format erzwingt.

**Was dein erster Lauf schon geschafft hat:** Das Distribution-Zertifikat ist in
deinem Apple-Konto **angelegt** (gültig bis 14.09.2027) — Schritt 1 lief durch. Beim
nächsten Aufruf überspringt das Skript ihn und macht bei Schritt 2 weiter.

**Ruf einfach nochmal auf:**

```bash
npm run testflight
```

---

## Wenn etwas schiefgeht

Das Skript bricht bei jedem Fehler ab und sagt, wo das Protokoll liegt. Schick mir
einfach die letzten Zeilen.

**Die häufigsten drei, und alle sind abgefangen:**

- *Build-Nummer schon vergeben* — wird **vor** dem Bauen geprüft, nicht nach zwanzig
  Minuten. Steht gerade auf **2**, und 2 ist frei.
- *Falscher Schalter* — das Skript bricht ab, wenn `ANMELDE_QUELLE` nicht auf
  `supabase` steht. Ein TestFlight-Build mit Fake-Daten wäre eine App voller
  erfundener Menschen.
- *Kein Zertifikat frei* — dann sagt es dir, welche zwei da sind und wo du eins
  widerrufst.

## Danach nachsehen

```bash
npm run asc
```

Zeigt Buildstatus und TestFlight-Gruppen. Solange dort `PROCESSING` steht, arbeitet
Apple noch; bei `VALID` ist er in deiner TestFlight-App.
