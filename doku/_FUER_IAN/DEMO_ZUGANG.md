# Der Demo-Zugang für die Apple-Prüfung

**Stand: 2026-09-14 · Phase 21.5 Punkt 1 · gebaut, aber noch nicht am echten Server**

---

## Worum es geht, in drei Sätzen

Bei Apple sitzt ein Mensch, der die App öffnet und schaut, ob sie das tut, was im
Store steht. SimplySocial liegt hinter einer Anmeldung — er kommt also nicht hinein,
wenn wir ihm keinen Zugang geben. **Das ist der Grund, aus dem Apps dieser Art am
häufigsten abgelehnt werden**, und er kostet jedes Mal einen ganzen Prüfdurchgang.

Es gibt jetzt ein Konto nur für ihn. Er tippt eine Adresse und ein Passwort, ist
drin, und sieht eine kleine Welt, in der er alles ausprobieren kann.

---

## Was du tun musst — drei Schritte

### 1. Den Zugang anlegen (am Mac, ein Befehl)

```bash
cd simplysocial
npm run demo
```

Das Skript legt das Konto an, gibt ihm ein Profil und stellt die Demo-Welt auf.
Am Ende zeigt es **einmal** ein Passwort an, so:

```
✓ Demo-Welt steht: 5 Profile, 5 Aktivitäten, 1 offene Anfrage, 3 Nachrichten

  E-Mail:    demo@simplysocial.invalid
  Passwort:  DI6lG6jOhep5d3SXarX6sg7A
```

> ⚠️ **Dieses Passwort steht danach nirgends mehr.** Nicht in einer Datei, nicht im
> Projekt, nicht bei mir. Kopier es sofort in Schritt 2. Wenn es weg ist, ist das
> kein Drama — `npm run demo -- --neues-passwort` macht ein neues —, aber dann musst
> du Schritt 2 noch einmal machen.
>
> **Bitte nicht per Screenshot auf den Schreibtisch legen.** Direkt aus dem Terminal
> ins Formular, dann ist es an genau einer Stelle.

### 2. In App Store Connect eintragen

App Store Connect → deine App → die Version → ganz unten **„App-Prüfungsinformationen"**
(auf Englisch: *App Review Information*).

| Feld | Was hineingehört |
|---|---|
| **Anmeldung erforderlich** | Häkchen setzen |
| **Benutzername** | `demo@simplysocial.invalid` |
| **Passwort** | das aus Schritt 1 |
| **Anmerkungen** | den Text unten |

**Der Text für „Anmerkungen" — einfach kopieren:**

```
Die App erfordert eine Anmeldung. Bitte verwenden Sie den oben angegebenen
Demo-Zugang.

Hinweis zur E-Mail-Adresse: Die Endung ".invalid" ist kein Tippfehler. Sie ist
nach RFC 2606 reserviert. Wir verwenden sie bewusst, damit dieses Testkonto
ausschliesslich per Passwort zugaenglich ist und niemals ueber einen per E-Mail
zugestellten Einmalcode uebernommen werden kann.

So melden Sie sich an:
1. "Mit E-Mail-Code" waehlen
2. demo@simplysocial.invalid eingeben, auf "Code schicken" tippen
3. Es erscheint ein Passwortfeld (nur fuer dieses eine Testkonto).
   Passwort eingeben, auf "Anmelden" tippen.

Was Sie im Testkonto ausprobieren koennen:
- Im Feed auf eine Aktivitaet tippen und "Bin dabei" senden
- Unter "Anfragen" eine offene Anfrage an Ihre eigene Aktivitaet bestaetigen
- Den daraus entstandenen Chat oeffnen und schreiben
- Melden, Blockieren und "Konto loeschen" sind unter dem Profil erreichbar

Die Inhalte im Testkonto sind nur fuer dieses Konto sichtbar und erscheinen
nicht im Feed anderer Nutzer.
```

### 3. Vor **jedem** Einreichen noch einmal `npm run demo`

Die Aktivitäten im Demo-Feed liegen ein paar Tage in der Zukunft — gerechnet ab dem
Moment, in dem das Skript läuft. Liegt der Lauf Wochen vor der Prüfung, sieht der
Reviewer einen Feed voller **vergangener** Termine, und das sieht aus wie eine
kaputte App.

Der zweite Lauf ist harmlos: **Er rührt das Passwort nicht an**, er frischt nur die
Termine auf. (Das ist nicht behauptet, sondern geprüft — `npm run pruef-demo` misst
genau das.)

---

## Was der Reviewer sieht

| | |
|---|---|
| **Vier Menschen** | Lena (1220), Tobias (1070), Mira (1040), Jonas (1010) |
| **Fünf Aktivitäten** | Tennis, Kaffee, Lernen, Kino — und eine eigene: Prater-Spaziergang |
| **Ein Match** | Bei Lenas Tennis ist er schon dabei |
| **Eine offene Anfrage** | Tobias will zum Prater mit — **daran führt er „Bestätigen" vor** |
| **Ein Chat** | Drei Nachrichten mit Lena, die letzte von ihr |

Damit kann er die ganze Kette durchspielen: **posten → Bin dabei → bestätigen → Chat.**
Genau das ist die App, und genau das hätte er in einem leeren Wien nicht gesehen.

---

## Die Frage, die du vielleicht stellen willst

> **„Sehen meine Freunde und ich diese erfundenen Leute jetzt auch im Feed?"**

**Nein.** Das war die wichtigste Frage beim Bauen, und sie ist die einzige, bei der
ein Fehler wirklich weh getan hätte.

Jeder Demo-Post steht auf **„nur meine Follower"**, und die fünf Demo-Leute folgen
nur einander. Für dich, Christoph, Leopold, Daria und jeden späteren Menschen in Wien
sind sie **unsichtbar** — kein Post, kein Chat, keine Anfrage.

Das ist keine Einstellung, die jemand vergessen kann, sondern dieselbe Regel, die
auch sonst über Follower-Posts entscheidet. Und sie wird **angegriffen, nicht
geglaubt**: `npm run pruef-demo` setzt sich in die Rolle eines echten Kontos und
versucht, die Demo-Welt zu lesen. Kommt auch nur eine Zeile zurück, ist der Prüfstand
rot.

> Eine Ausnahme, damit sie nicht überrascht: Die fünf **Profile** sind lesbar, wenn
> jemand ihre ID kennt — das gilt für alle Profile der App und ist Absicht (harte
> Regel 10: Wer blockiert wird, darf es nicht merken). In keiner Liste, keinem Feed
> und keiner Suche tauchen sie auf.

---

## Wenn die App durch ist

```bash
npm run demo -- --abraeumen
```

Löscht die fünf Menschen, ihre Aktivitäten, den Chat — alles. Danach funktioniert
der Zugang in App Store Connect nicht mehr, also **erst machen, wenn die App
freigegeben ist**.

---

## Was noch offen ist

| | |
|---|---|
| ✅ **`npm run demo` am echten Server** | *erledigt am 14.09.* — 5 Profile, 5 Aktivitäten, 1 offene Anfrage, 3 Nachrichten |
| ✅ **Zugangsdaten in App Store Connect** | *erledigt am 14.09.*, gesichert |
| ✅ **Neuer Build aufs iPhone** | *erledigt am 14.09.* (`npm run geraet`) |
| ✅ **Der Durchgang: ZWEI Anmeldungen** | *erledigt am 14.09. — beides hat geklappt.* Die Anleitung unten bleibt stehen, weil du sie vor jedem Einreichen wieder brauchst |
| ⚠️ **Der Build, den du einreichst** | muss den Code vom **14.09.** enthalten. Ein älterer hat das Passwortfeld nicht — dann nützen dem Reviewer die Zugangsdaten nichts |
| ⬜ **Rechtstext** (`OFFENE_SACHEN.md` Punkt 1) | Ohne ihn wird nicht eingereicht — der Demo-Zugang ändert daran nichts |

---

## Der Durchgang am iPhone — zwei Anmeldungen

> ⚠️ **Zuerst `npm run geraet`.** Der Demo-Zugang ist seit dem 14.09. im Code, aber
> die App auf deinem iPhone ist der Build vom 13.09. Ohne neuen Build prüfst du den
> alten Stand — und **derselbe Punkt gilt für den Build, den du einreichst:**
> Zugangsdaten ohne passendes Feld sind dieselbe Ablehnung wie gar keine
> Zugangsdaten.

### 1. Als Demo — geht der Weg, den der Reviewer geht?

| | soll passieren |
|---|---|
| „Mit E-Mail-Code" antippen | der E-Mail-Schritt kommt |
| `demo@simplysocial.invalid` eintippen | der Knopf heißt weiter „Code schicken" |
| draufdrücken | **statt einer Mail erscheint ein Passwortfeld** |
| Passwort eintippen, „Anmelden" | drin, und zwar direkt im Feed — **nicht** im Fragebogen für ein neues Konto |
| im Feed | vier fremde Aktivitäten, eine eigene (Prater) |
| unter „Anfragen" | Tobias' Anfrage steht offen und lässt sich **bestätigen** |
| in den Chats | Lena, drei Nachrichten, die letzte von ihr |

Geht einer der Schritte nicht, sag mir **welcher** — das schränkt die Ursache stark ein.

### 2. Als du selbst — die wichtigere Prüfung 🔴

Abmelden, mit deinem **eigenen** Konto anmelden (Apple oder Google, wie sonst).

**Lena, Tobias, Mira und Jonas dürfen in deinem Feed NICHT auftauchen.** Kein Post,
kein Chat, keine Anfrage.

Warum das die wichtigere Prüfung ist: Die Demo-Welt liegt jetzt in **derselben**
Datenbank wie eure echten Verabredungen. Am Mac ist abgesichert, dass sie unsichtbar
bleibt — angegriffen, nicht geglaubt, mit zwei Gegenproben. Aber das war eine
Wegwerf-Datenbank. **Dein Feed ist der Beleg am echten Server**, und es ist ein Blick,
keine Arbeit.

> Siehst du auch nur einen davon: **sag sofort Bescheid und lade niemanden ein.**
> Das lässt sich in einer Minute beheben (`npm run demo -- --abraeumen`), aber es
> muss jemand merken.
