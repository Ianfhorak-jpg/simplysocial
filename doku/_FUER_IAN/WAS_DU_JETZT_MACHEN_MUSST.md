# 🚀 Was du jetzt machen musst — Weg in den App Store

**Stand: 2026-10-17 · heute nochmal bei Apple nachgefragt: 11 von 12, es fehlt nur Build 4**

> Am 17.10. repariert: `npm run asc` lief nach einem Python-Update nicht mehr — geht wieder.
> Und die Änderungen vom 28.09. waren nicht gesichert — jetzt sind sie es.

> Die Fassung vom 26.09. ist überholt: Fünf der sechs Punkte darin hast du
> inzwischen erledigt. Die alte Datei liegt als Kopie im Zwischenspeicher, falls
> du nachsehen willst — gebraucht wird sie nicht.

---

## In einem Satz

**Es fehlt genau noch EINE Sache: ein neuer Build.** Alles andere steht.

---

## ✅ Was am 2026-09-28 erledigt wurde

| | |
|---|---|
| ✅ Datenschutz-Seite | [live](https://ianfhorak-jpg.github.io/simplysocial-landing/datenschutz.html) |
| ✅ Hilfe-Seite | [live](https://ianfhorak-jpg.github.io/simplysocial-landing/hilfe.html) |
| ✅ Store-Texte, Untertitel, Suchwörter, Werbetext | bei Apple |
| ✅ Copyright | `2026 Ian Faye Horak` |
| ✅ Beide Pflicht-Adressen | bei Apple, erreichbar |
| ✅ Inhaltsrechte | `USES_THIRD_PARTY_CONTENT` |
| ✅ **Build 3 gebaut und angehängt** | von dir |
| ✅ Der rote Kasten im Rechtstext-Screen | **raus** |

---

## 🔴 Warum es trotzdem noch einen Build braucht

Du hast Build 3 gebaut und ich habe ihn an die Version gehängt — **dann haben wir
den Nutzungsbedingungen-Screen geändert.** Damit ist Build 3 veraltet: Er trägt den
roten Kasten noch in sich.

**Was in dem Kasten stand** (und was ein Apple-Prüfer gelesen hätte):

> „Dieser Teil fehlt noch — mit Absicht … die Gründer sind selbst noch minderjährig
> … **bevor die App über den Freundeskreis hinausgeht**"

Genau diesen Bildschirm öffnet ein Prüfer bei einer App mit Nutzerinhalten. Ein
Screen, der selbst erklärt, dass die Nutzungsbedingungen fehlen, ist dort kein
Zeichen von Ehrlichkeit, sondern ein Ablehnungsgrund.

**Was jetzt an seiner Stelle steht** — und nichts davon ist erfunden:

- wer die App betreibt (du, bei Apple abgefragt) und wie man dich erreicht
- ab welchem Alter man mitmachen darf, und die Sache mit den Eltern unter 14
- was passiert, wenn jemand sich nicht an die Regeln hält (`konto_weg()` kann das wirklich)
- ein Verweis auf **deine Datenschutzerklärung**, die seit heute im Netz steht
- ein Verweis auf **Apples Standard-Lizenzvertrag** — der gilt ohnehin, wenn man
  keinen eigenen angibt

Die sechs Hausregeln darüber („Das hier ist kein Dating", „Zusagen gelten", …)
standen schon vorher da und sind unverändert.

---

## Was du jetzt machst

```bash
cd ~/Desktop/C.C.Projekts_Ian/33_SimplySocial/simplysocial

npm run testflight                        # 1 · Build 4 · 20 Minuten
npm run asc build-anhaengen -- --wirklich # 2 · dranhängen · 5 Sekunden
npm run asc einreichbereit                # 3 · gegenprüfen
```

**Die Build-Nummer steht schon auf 4** — darum musst du dich nicht kümmern.

⚠️ **Zwischen Schritt 1 und 2 liegen ein paar Minuten**, in denen Apple den Build
verarbeitet. Sagt Schritt 2 *„ist PROCESSING, nicht VALID"*, einfach kurz warten und
nochmal.

### Bevor du einreichst: sieh dir den Screen einmal an

Am iPhone unter **Einstellungen → Rechtliches → Nutzungsbedingungen**. Ich habe ihn
geändert, ohne ihn am Gerät gesehen zu haben — `tsc` und alle Prüfstände sind grün,
aber das ist nicht dasselbe wie hinschauen. Es ist der Bildschirm, den der Prüfer
öffnet.

---

## Dann: einreichen

In App Store Connect auf **„Zur Prüfung einreichen"**.

⚠️ **Die Warnung aus ACTA, die dort Tage gekostet hat:** `npm run asc
einreichbereit` misst **Felder, nicht Erfolg.** Bei ACTA standen alle Punkte grün,
während die App vier Tage abgelehnt war — der Grund steht nie in Apples
Schnittstelle, sondern **in deiner Mail.** Wenn Apple sich meldet, ist die Mail die
Wahrheit, nicht diese Liste.

---

## Der Rechtstext — für die Einreichung erledigt

Im Screen stehen jetzt deine sechs Hausregeln, wer die App betreibt, ab welchem Alter,
was bei Regelbruch passiert, deine Datenschutzerklärung und **Apples
Standard-Lizenzvertrag** (der gilt ohnehin, wenn man keinen eigenen hat). Das reicht
für Apple.

Offen bleibt nur die Frage **„wer haftet, wenn bei einem Treffen etwas passiert"** —
die gehört jemandem vorgelegt, der sich auskennt (`OFFENE_SACHEN.md`). Sie hält die
Einreichung nicht auf.

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

1. **`npm run testflight`** — Build 4, 20 Minuten
2. **`npm run asc build-anhaengen -- --wirklich`**
3. **Screen am iPhone ansehen** (Einstellungen → Rechtliches)
4. **Datenschutz-Etikett** nachsehen, ob es steht
5. **Einreichen**

Nach jedem Schritt:

```bash
npm run asc einreichbereit
```

Zwölf Punkte. Wenn nur noch das Privacy-Label ein `?` trägt, bist du fertig.

Der **Rechtstext** (unten) blockiert das Einreichen nicht — er ist die Sache, die
danach ansteht, sobald die App über den Freundeskreis hinausgeht.
