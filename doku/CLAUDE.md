# CLAUDE.md — SimplySocial

Kontext für Claude Code in diesem Projekt. Chatsprache: **Deutsch** (englische Fachbegriffe OK).

---

## Vor jeder Aufgabe

> **[`PLAN.md`](PLAN.md) ist die Source of Truth.** Vor der Arbeit lesen, danach die
> Checkboxen aktualisieren. Diese Datei hier gibt nur den Überblick.

> 📚 **Das Langzeitgedächtnis liegt seit dem 2026-09-13 in `_gedaechtnis/`**, weil diese
> Datei auf 406 KB (~101.500 Tokens) gewachsen war und bei **jeder** Sitzung automatisch
> geladen wurde — auch nach `/clear`. **Verschoben, nicht gelöscht**, kein Zeichen
> geändert:
>
> | Datei | Inhalt | statt |
> |---|---|---|
> | `_gedaechtnis/HISTORIE.md` | Phase 0 bis 20.9 im Volltext, alle 75 Entscheidungen | ~49.500 Tk |
> | `_gedaechtnis/HARTE_REGELN.md` | die 116 Regeln im Volltext | ~24.500 Tk |
> | `_gedaechtnis/FALLEN.md` | die 196 Fallen im Volltext | ~23.200 Tk |
>
> **Unten steht von Regeln und Fallen nur der TITEL** (Ians Entscheidung 76). Das genügt,
> um zu wissen, DASS eine Regel existiert — **wer eine anfasst, liest vorher ihren
> Volltext nach.** Ein Titel ist kein Ersatz für die Begründung, und in diesem Projekt
> steckt die Lehre fast immer in der Begründung.

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

---

## Stand heute (2026-09-13)

> 🔗 **Prototyp: https://ianfhorak-jpg.github.io/simplysocial/** (Code: `simplysocial/`, hochladen: `npm run deploy`)
> 🔗 **Landing-Page: https://ianfhorak-jpg.github.io/simplysocial-landing/** (Code: `landing/`, `git push` genügt)
> 📁 **Belege: `_belege/`** (304 Screenshots, Dateinamen unverändert — jeder Verweis in PLAN.md geht weiter auf). Was Ian selbst schickte: `_belege/von-ian/`.

**Es gibt ZWEI getrennte Stände, und das ist Absicht (Entscheidung 75):**

| | Öffentliche Adresse | Ians iPhone |
|---|---|---|
| Schalter | `ANMELDE_QUELLE = 'attrappe'` | `'supabase'` |
| Daten | `mock.ts`, erfundene Namen | echtes Supabase |
| Anmelden | „Weiter als Ian" | Apple · Google · E-Mail-Code |
| Kommt von | `npm run deploy` | `npm run geraet` |

**`deploy.sh` deployt NUR aus `'attrappe'` heraus** (harte Regel 96) — ein versehentlicher
Deploy mit umgelegtem Schalter bricht ab, bevor irgendetwas gebaut wird.

---

## 🔴 HIER GEHT ES WEITER — Stand 2026-10-18, abends

> ## Die App spricht Englisch. Jetzt wirklich — und das ist eine Berichtigung.
>
> **Vollständiger Plan:** `~/.claude/plans/hallo-ich-will-bitte-memoized-turing.md`.
> Zweig `dunkel`.
>
> ### 🔴 Der Befund, der den Plan überholt hat
>
> Der Plan sagte, es fehle nur `lib/zeit.ts`. **Das stimmte nicht.** Nach dem
> Übersetzen von `zeit.ts` standen in der englischen Oberfläche weiter **rund 45
> deutsche Sätze** — im Anfragen-Tab („Du bist dabei"), im Profil („Was du vorhast"),
> im Feed, beim Posten, in den Gruppen, beim Melden und im ganzen Fehlertext-Apparat
> der Datenschicht.
>
> **Warum es niemandem auffiel, und das ist die eigentliche Lehre:** `pruef-sprache`
> meldete 24 Häkchen und `tsc` war sauber. Seine zwei Messungen KONNTEN die Sätze
> nicht sehen — die eine sucht Umlaute („Du bist dabei" hat keinen), die andere feste
> Texte an `label=`/`placeholder=` (das hier sind JSX-Textknoten und Tabellen).
> *Solange eine Zahl auf ihrer Grenze steht, weiß man nur, dass sie nicht GESTIEGEN
> ist — nicht, dass sie alles zählt.*
>
> ### 🔴 Und ein echter Fehler, den Build 4 trägt
>
> `ladeFehlerFolgen()` gab bereits einen Schlüssel zurück, `LadeSchirm.tsx` zeichnete
> ihn **ungewickelt**: Auf dem Ladefehler-Bildschirm stand `laden.keineVerbindung`
> statt „Keine Verbindung". Dieselbe Stelle gab es ein zweites Mal in `LadeZeile`.
> Beide sind behoben — gefunden hat sie der erweiterte Wächter, nicht ein Mensch.
>
> ### Was diese Sitzung getan hat
>
> | | |
> |---|---|
> | `lib/zeit.ts` + neues `i18n/datum.ts` | Wochentage und Monate als LISTE neben dem Wörterbuch (ACTAs Muster), englisches Datum „15 Sep" statt „15.9." — zweideutig wäre es sonst |
> | **`expo-localization` installiert** | `npx expo install` + `pod install`, in `app.json` eingetragen. ⚠️ **KEIN `prebuild`** — die Signatur-Zeilen stehen unangetastet (`DEVELOPMENT_TEAM` nachgesehen) |
> | **Zweite Übersetzungsrunde** | 20 Dateien, ~45 Sätze. Die importfreien Regel-Dateien geben jetzt SCHLÜSSEL heraus (`quelle.ts`, `schreiben.ts`, `programmfehler.ts`, `anmeldung.ts`, `demo.ts`, `auth/konto.ts`, `safety/konto.ts`, `zuschnitt.ts`, `wisch.ts`) |
> | **Der Wächter kann die Lücke jetzt sehen** | `pruef-sprache` **24 → 26**: neue Messung „deutsche Sätze ohne Umlaut" (Funktionswörter, Grenze 1) und Abschnitt 2c liest auch Destrukturierungen. Beide mit Gegenprobe rot gesehen |
> | `pruef-zuschnitt` **47 → 56** | VERENGT, nicht nachgezogen: Er liest die Sätze jetzt aus BEIDEN Wörterbüchern statt nur aus dem deutschen |
>
> ### 🟢 Nachtrag 2026-10-20, Teil 2: **12 von 12 — Build 5 hängt dran**
>
> Ian hat Build 5 gebaut und angehängt (mit `--trotzdem`, siehe unten). Bei Apple
> gemessen: **0 offene Punkte.** Es bleibt das Privacy-Label, das über die API
> nicht lesbar ist, und das Einreichen selbst.
>
> ⚠️ **`--trotzdem` war hier richtig, und das ist gemessen, nicht geschätzt:**
> Zwischen Build und Quelltext lagen **genau 20 Zeilen, alle Löschungen** — die zehn
> toten Schlüssel in beiden Sprachen. Kein Bildschirm las sie, also verhält sich
> Build 5 Zeichen für Zeichen wie der Quelltext. Im Bündel liegen 20 Zeichenketten
> zu viel; keine davon ist heikel (kein Paywall-Wort, kein Beta-Hinweis).
>
> 🔴 **Dabei repariert: `asc einreichbereit` stellte ZWEI Fragen in EINER Zeile.**
> „Hängt ein Build dran" (Apples Anforderung) und „ist er aktuell" (unsere,
> strengere) teilten sich ein Häkchen. Sobald Ian anhängte und danach eine Zeile
> Code fiel, meldete die Liste weiter ✗ und „1 offene Punkte" — **zwölf von zwölf
> waren unerreichbar, ohne neu zu bauen.** Jetzt zählt die Liste nur Apples
> Anforderungen; die Aktualität steht als ⚠️ darunter, wie das Privacy-Label.
> Sie verschwindet NICHT — genau dieser Wächter hat am 17.10. einen Build erwischt,
> der den roten Kasten noch trug.
>
> ### Nachtrag 2026-10-20: zehn tote Schlüssel und ein Wächter dafür
>
> Build-Nummer steht an beiden Stellen auf **5** (`app.json` committet, `Info.plist`
> gesetzt — die ist git-ignoriert und taucht in keinem Diff auf).
>
> **Bei Apple gemessen: 11 von 12**, offen allein „Build an der Version". Das Werkzeug
> nennt sogar den Grund selbst: *„Build 4 hängt dran, ist aber VERALTET —
> `src/components/LadeSchirm.tsx` wurde danach geändert."*
>
> 🔴 **Zehn Schlüssel las kein Bildschirm** (`feed.leerMitFilter`,
> `erstesKonto.nameZuLang`, `erstesKonto.bezirkWaehlen`, `post.posterBestaetigt`,
> `post.bezirkFrage`, `anfrage.zuSpaet`, `konto.treffenGezaehlt`,
> `konto.loeschenWarnung`, `gemein.weiter`, `gemein.nochmal`) — Reste der ersten
> Runde. **Das ganze Wörterbuch landet im Bündel**, und bei ACTAs Prüfung hat Apple
> genau so Paywall-Wörter gefunden, die kein Bildschirm las. Vor dem Löschen geprüft:
> nirgends im Code, und auch nicht als fester Satz in einen Bildschirm abgeschrieben.
> Wörterbuch **516 → 506**.
>
> Neu bewacht: `pruef-sprache` **26 → 28**, Abschnitt 1c („Schlüssel ohne
> Fundstelle", Grenze 0, mit Gegenprobe rot gesehen). ⚠️ Er ist nur erlaubt, **weil es
> keine zusammengesetzten Schlüssel gibt** — gemessen: kein `t(`-Backtick und kein
> `as TSchluessel` in `src/`.
>
> ### Gemessen, alles grün
>
> ```
> tsc sauber · expo lint 88 (unverändert) · Wörterbuch 506/506
> pruef-sprache 28 · pruef-zuschnitt 56 · pruef-alter 35 · pruef-zustimmung 34
> pruef-kopf 48 · pruef-nennung 15 · pruef-anbieter 48 · pruef-bildwahl 48
> pruef-farben 79 · pruef-boden 13 · pruef-glas 33 · pruef-sitzung 29
> pruef-demoregel 29 · pruef-plattform 5 · pruef-etikett 12 · pruef-programmfehler ✓
> deutsche Literale 115 → 108 · feste UI-Texte 21 → 20
> ```
>
> ⚠️ **`pruef-alter` ging rot und hat damit seine Arbeit getan:** Er bewacht die ZAHL
> der Abhängigkeiten, und `expo-localization` war eine mehr. Geprüft und in
> `_FUER_IAN/ALTERSFREIGABE.md` nachgetragen: Es liest nur die eingestellte Sprache und
> schickt nichts — am Datenschutz-Etikett ändert sich nichts.
>
> ### 🔴 Was NICHT belegt ist
>
> **Kein Lauf im Browser und keiner am Gerät.** Dafür müsste `ANMELDE_QUELLE` kurz auf
> `'attrappe'` stehen, und das Umlegen hat der Auto-Mode geblockt — zu Recht, der Wert
> ist bewacht (harte Regel 96). Was trägt: `en.ts` ist `Weiter<typeof de>` und jeder
> Schlüssel ist ein `TSchluessel`, also meldet `tsc` jeden fehlenden Text und jeden
> Tippfehler. Was NICHT trägt: ob ein Satz am Gerät umbricht oder komisch klingt.
>
> ### Was jetzt ansteht — und es gehört Ian
>
> | | wer | |
> |---|---|---|
> | **Build 5** | **Ian** | Build-Nummer 4 → 5 in `app.json` **und** `ios/SimplySocial/Info.plist`, dann `npm run testflight` |
> | **Durchgang am Gerät** | **Ian** | Einstellungen → Sprache auf English, dann durch alle Tabs. Ein deutsches Wort dort ist der Fehler, der ACTA zu Apple ging |
> | Build anhängen · Privacy-Label · einreichen | **Ian** | `npm run asc build-anhaengen -- --wirklich`, dann `npm run asc einreichbereit` (muss 12 von 12 zeigen) |
>
> 📄 In Ians Sprache: [`_FUER_IAN/WAS_DU_JETZT_MACHEN_MUSST.md`](_FUER_IAN/WAS_DU_JETZT_MACHEN_MUSST.md)

## Davor — Stand 2026-10-18, mittags

> ## Die App spricht Englisch. Es fehlen drei Dinge.
>
> **Vollständiger Plan mit allen Zahlen und Fallen:**
> `~/.claude/plans/hallo-ich-will-bitte-memoized-turing.md` — **zuerst lesen.**
> Letzter Commit `0718422`, alles gepusht, Zweig `dunkel`.
>
> ### Was fehlt
>
> | | wer | |
> |---|---|---|
> | **`lib/zeit.ts` übersetzen** | Claude | Der letzte Teil, der auffällt: „Heute 18:30", „vor 2 Tagen", „Mo", „18.10." sind noch deutsch. Braucht ein eigenes `dates.ts` wie ACTA (Wochentage sind eine LISTE, nicht Strings) und den siebten Mehrzahl-Fall |
> | 🔴 **`expo-localization` installieren** | Claude | **Nicht installiert, am 18.10. nachgesehen.** Ohne das Modul gilt IMMER Deutsch — die automatische Erkennung ist tot. `npx expo install expo-localization`, danach `pod install` (⚠️ KEIN `prebuild`, das wirft die Signatur weg) |
> | **Build 5 + einreichen** | **Ian** | Build-Nummer 4 → 5 in `app.json` UND `ios/SimplySocial/Info.plist`, dann `npm run testflight` |
>
> ### Bei Apple gemessen (2026-10-18): 11 von 12
>
> Offen ist allein **„Build an der Version"**: Build 4 hängt dran (Ian hat ihn am 17.10.
> angehängt), ist aber **VERALTET** — die Übersetzung kam danach. Alles andere steht:
> Preis, Altersfreigabe, Texte, Adressen, Screenshots, Inhaltsrechte, Prüfinfos.
> Das Privacy-Label ist über die API nicht lesbar und bleibt ein `?`.
>
> ### Die Übersetzung in Zahlen
>
> | | |
> |---|---|
> | `npm run pruef-sprache` | **24 Häkchen**, jede mit Gegenprobe |
> | feste Texte in UI-Eigenschaften | 131 → **21** |
> | deutsche Literale | 291 → **115** |
> | Vollständigkeitsbeweis | `en.ts` ist `Weiter<typeof de>` → **`tsc` meldet jeden fehlenden Schlüssel** |
>
> Die restlichen Zahlen sind fast nur `bausteine.tsx`, `data/mock.ts` und
> `post-fassungen.tsx` — **bewusst nicht übersetzt**, 110 Texte, die kein Nutzer sieht,
> und das ganze Wörterbuch landet im Bündel.
>
> ### 🔴 Vier Prüfstände gingen beim Übersetzen rot — und wurden VERENGT
>
> Sie benutzten einen deutschen SATZ als Anker. `pruef-zustimmung` 28 → **34**,
> `pruef-kopf` 47 → **48**, `pruef-nennung` 13 → **15**. Der Häkchen-Wächter prüft jetzt
> BEIDE Wörterbücher; vorher deckte er nur Deutsch ab. **Wer übersetzt, fährt danach ALLE
> Prüfstände** — sonst schlagen sie reihum beim nächsten Thema zu und sehen wie Rauschen aus.
>
> ### Was Ian vorgelegt gehört
>
> 🔴 **Die sechs Hausregeln gelten jetzt auch auf Englisch** — wörtlich treu übersetzt,
> und eine Vorrang-Klausel steht absichtlich NICHT da (das wäre eine Rechtsaussage).
> In `src/i18n/WOERTER.md` stand dazu ein offenes Häkchen.
>
> 📄 In Ians Sprache: [`_FUER_IAN/WAS_DU_JETZT_MACHEN_MUSST.md`](_FUER_IAN/WAS_DU_JETZT_MACHEN_MUSST.md)

## Davor — Stand 2026-10-17

> **Bei Apple gemessen: 11 von 12.** Offen ist allein **„Build an der Version"** —
> Build 3 hängt dran, trägt aber noch den roten Kasten (Entscheidung 114). Build 4
> (`app.json` UND `ios/…/Info.plist` sagen 4, bei Apple frei) baut Ian mit
> `npm run testflight`, danach `npm run asc build-anhaengen -- --wirklich`,
> Privacy-Label ansehen, in App Store Connect einreichen.
>
> Am 17.10. erledigt: die Arbeit vom 28.09. war **nie committet** — jetzt ist sie es.
> `npm run asc` war kaputt (Homebrew-`python3` 3.15 ohne `jwt`, siehe neue Falle) und
> `testflight.sh` hätte deswegen blind „Build frei" gemeldet — Wächter eingebaut,
> rot und grün belegt. Vor dem Build grün: `tsc`, `pruef-alter` 35, `pruef-zustimmung` 28,
> `pruef-boden` 13, `pruef-plattform` 5, `ANMELDE_QUELLE = supabase`.
>
> **Build 4 liegt seit dem 17.10. bei Apple (`VALID`)** und ist jünger als die letzte
> Änderung an `Nutzungsbedingungen.tsx` — der rote Kasten ist wirklich draußen.
> Zwei Dinge standen dem im Weg und sind behoben: Xcodes Ablageort zeigte auf eine
> abgesteckte Festplatte (`ARCHIVE FAILED` nach drei Minuten), und **die echte Supabase
> war pausiert** — niemand konnte sich anmelden. Seither hält
> `.github/workflows/supabase-wach.yml` sie wach (auf `main`, Zeitplan aktiv, erster
> Lauf grün: `HTTP 401` mit `42501` von Postgres selbst).
>
> 🔴 **Offen und Ians:** `npm run asc build-anhaengen -- --wirklich` · Privacy-Label ·
> einreichen. Dazu, nicht blockierend: der iPad-Durchgang (Guideline 4) ist am Mac
> belegt und mit keinem Bild angesehen.
>
> Plan: `~/.claude/plans/hallo-ich-will-bitte-memoized-turing.md`

## Davor — Zweig `dunkel` (Stand 2026-09-28, abends)

> ### Das Erste, noch vor allem anderen
>
> ```bash
> cd ~/Desktop/C.C.Projekts_Ian/33_SimplySocial/simplysocial
> npm run asc einreichbereit        # rein lesend, ändert nichts
> ```
>
> **Er zeigt seit dem 2026-09-28 ZWÖLF Punkte statt zehn.** Die zwei neuen sind
> `supportUrl` und `privacyPolicyUrl` — beide Pflicht bei Apple, beide standen auf
> `None`, und **beide wurden vorher nie abgefragt.** Der Grund steht als Falle im
> Register: Apple verteilt die Store-Texte auf zwei Ressourcen, und
> `privacyPolicyUrl` liegt in der, die das Werkzeug gar nicht kannte.
>
> #### Was Ian zwischen dem 26. und 28.09. selbst erledigt hat (bei Apple gemessen)
>
> | | |
> |---|---|
> | ✅ **Preis** | kostenlos, 175 Länder — die härteste Sperre ist weg |
> | ✅ Altersfreigabe | 26 von 30 Feldern, Apple errechnet `FOUR_PLUS` |
> | ✅ Kategorie · Werbe-ID · Prüfinfos · Screenshots | alle grün, Bilder `COMPLETE` |
>
> #### ✅ Was am 2026-09-28 gebaut UND abgeschickt wurde
>
> | | |
> |---|---|
> | `landing/datenschutz.html` | **live** — jede Zeile aus dem Code hergeleitet |
> | `landing/hilfe.html` | **live** — Bedienwege gegen `pruefnotizen.md` geprüft |
> | `scripts/storetexte.md` | die Texte, als Datei — gehören Ian, nicht dem Skript |
> | `asc.py texte` | neu, mit Längen- und Erreichbarkeits-Riegel |
> | Bei **Apple gesetzt** | Beschreibung · Untertitel · Suchwörter · Werbetext · Copyright · beide Adressen |
> | `app.json` | Build-Nummer **2 → 3** (Build 2 lag bei Apple schon — `testflight` wäre daran gescheitert) |
>
> **Stand der Einreich-Liste: 10 von 12.** Vorher waren sechs Punkte offen.
>
> 🔴 **Es bleiben ZWEI, und beide gehören Ian:**
>
> | | |
> |---|---|
> | **Build an der Version** | `npm run testflight` · 20 Min · fasst den Schlüsselbund an. Die vier Vorprüfungen sind einzeln gemessen und grün |
> | **Inhaltsrechte** | Rechtsfrage (Wiener Bezirksgrenzen CC BY 4.0 + UGC), nur im Browser |
>
> Dazu, außerhalb der Liste: der **Rechtstext** (21.2, kein Apple-Feld) und das
> **Privacy-Label** (über die API weder les- noch schreibbar).
>
> ⚠️ **Der Riegel in `asc texte` ist am roten UND am grünen Fall belegt:** Erster
> Lauf abgebrochen (Seiten noch nicht gepusht, 404), nach dem Push durchgelaufen
> (beide 200). Harte Regel 125.
>
> 🟢 **Gemessen am 2026-09-28, und es schließt eine Frage, die hier seit Wochen
> offen stand:** Das Apple-Programm läuft auf **Ian Faye Horak selbst**
> (`ACCOUNT_HOLDER`), nicht auf einen Elternteil. Unten in „Was auf Ian wartet"
> stand das Gegenteil als offene Frage. **Ians Entscheidung 112 vom selben Tag:**
> Er steht auch als Verantwortlicher auf der Datenschutzerklärung, mit E-Mail und
> ohne Postadresse.
>
> 📄 In Ians Sprache: [`_FUER_IAN/WAS_DU_JETZT_MACHEN_MUSST.md`](_FUER_IAN/WAS_DU_JETZT_MACHEN_MUSST.md)

### 🔴 Die eine Sache, die noch NICHT belegt ist

Der iPad-Umbau (Guideline 4, unten ausführlich) ist am Mac vollständig belegt —
**und am Gerät mit keinem Bild angesehen.** Betroffen sind acht Hüllen: sechs
Fehlerseiten, `gruppe/[id]` und der Endzustand von `account-loeschen`.

Der Versuch ist an etwas anderem gescheitert (Mac im Ruhebildschirm → Simulator
ohne Fenster → `tippen.sh` kann nicht klicken, `simctl io screenshot` aber schon;
steht als Falle im Register). **Wer das nachholt:** `gruppe/[id]` ist der
Bildschirm, an dem man einen Fehler am ehesten sähe, und er ist per Deep Link
erreichbar.

⚠️ Der Regressionsvergleich der acht Store-Bilder ist dafür KEIN Ersatz und war
auch nicht nötig: Alle acht Routen laufen über `scroll` oder `scrolltSelbst`,
also durch Zweige, die der Umbau nicht anfasst (nachgesehen: `create.tsx`,
`match.tsx` Hauptzweig, `profile.tsx`).

### Der Zustand, auf den man sich verlassen kann

| | |
|---|---|
| `ANMELDE_QUELLE` | **`supabase`** — in beide Richtungen gegengeprüft |
| Git | sauber, letzter Commit `2c7bfb5` |
| Store-Bilder | 8 Stück, 1320×2868, in `_FUER_IAN/App-Store-Screenshots/` |
| Ians iPhone | trägt den Stand vom 2026-09-26 18:50 |
| Signier-Kette | Zertifikat + Profil gültig bis 2027-09-14 |

---

## Was davor geschah — Zweig `dunkel` (2026-09-26)

> **Diese Sitzung hat drei Dinge getan, und keines war Design:**
> das Backend gemessen, den App-Store-Stand gemessen, und beide Messgeräte gebaut,
> die dafür fehlten. Der Design-Zweig (Entscheidungen 101–110) wartet unverändert
> auf Ians Urteil am Gerät.
>
> *(Der letzte Design-Plan, abgearbeitet:
> [`kopfleiste-geradeziehen.md`](~/.claude/plans/kopfleiste-geradeziehen.md) —
> seine Arbeitsregel gilt weiter: **EIN Befund pro Gerätedurchgang.** Davor:
> `karte-schaerfen-und-bezirke.md`, `spicy-sprouting-balloon.md`,
> `oben-wie-unten-glas-kapsel.md`, `ich-will-liquid-glass-calm-pinwheel.md`.)*
>
> ⚠️ **`i-dont-whant-to-purring-comet.md` gehört NICHT hierher** — das ist ACTAs
> Apple-Rückmeldung (Projekt 17). Die Pläne liegen in einem gemeinsamen Ordner.

### 🔴 Der Befund, der alles andere überholt: der Store-Eintrag ist fast LEER

Am 2026-09-26 zum ersten Mal **die ganze Einreich-Liste bei Apple abgefragt**.
Bisher wurde immer nur nach BUILDS gefragt — **9 von 10 Punkten sind offen:**

| | Punkt | gemessen |
|---|---|---|
| ✓ | Prüfinfos + Demo-Login | steht |
| ✗ | **Build an der Version** | KEINER — Einreichen ist gesperrt |
| ✗ | Altersfreigabe | 27 von 30 Feldern `null` |
| ✗ | Inhaltsrechte · Copyright · **Preis** · Kategorie · Werbe-ID | nichts davon |
| ✗ | Store-Texte · Screenshots | bei Apple liegt **kein einziges Bild** |
| ? | Privacy-Label | über die API nicht lesbar |

**Warum es niemandem auffiel:** Es hat nie jemand gefragt. `npm run asc` konnte nur
Builds listen, und „Build 2 · VALID" beantwortet, ob ein Build bei Apple LIEGT — nicht
ob er an der Version HÄNGT. Für die anderen acht Punkte gab es hier überhaupt kein
Werkzeug.

> 🔴 **Berichtigung zu Commit `319ca57` (2026-09-26).** Seine Beschreibung behauptet,
> in dieser `CLAUDE.md` habe „Store-Eintrag seit 13.09.2026 vollständig (Build 1 VALID
> und zugeordnet, 7 Screenshots, Altersfreigabe 4+, Prüfinfos)" gestanden. **Das ist
> falsch.** Der Satz steht im Haupt-Register `C.C.Projekts_Ian/CLAUDE.md` und gehört
> dort **ACTA (Projekt 17)**. SimplySocials eigene Doku hat das NIE behauptet — sie
> war beim Fragebogen ausdrücklich ehrlich (*„Apples Fragebogen stand beim Nachsehen
> auf 28 × `null`"*), und Store-Screenshots gibt es hier nicht einmal als Datei.
> **Der gemessene Befund bleibt unverändert**, nur seine Geschichte ist eine andere:
> Es war keine falsche Behauptung, sondern eine ungestellte Frage. Zwei Projekte mit
> Apple-Einreichung im selben Ordner, und die Pläne liegen sogar im selben
> Verzeichnis — das ist die Verwechslung, die hier droht.

Neu und rein lesend: **`npm run asc einreichbereit`**. Zehn Punkte, jeder mit
Zuständigkeit. Drei Lehren aus ACTAs zwei Ablehnungen stecken drin: der **Preis**
ist ein harter Blocker ohne eigenes Feld (nur `APP_PRICING_REQUIRED` im 409),
`appVersionState` kann `REJECTED` sein während alles grün ist, und das
Privacy-Label trägt ein `?` statt eines `✗`, weil es von hier aus nicht
feststellbar ist.

📄 **Für Ian in seiner Sprache: [`_FUER_IAN/APP_STORE_STAND.md`](_FUER_IAN/APP_STORE_STAND.md).**

### Der Fragebogen ist jetzt ein Befehl, und er wartet auf Ian

28 Felder von Hand klicken war die Aufgabe. Jetzt Tabelle `ALTERSFREIGABE` in
`scripts/asc.py` mit der Begründung je Feld, bewacht von `pruef-alter` (16 → 32,
liest die Tabelle mit `ast`, nicht per Import).

```bash
npm run asc altersfreigabe                 # zeigt nur (gelaufen, steht)
npm run asc altersfreigabe -- --wirklich    # schreibt — gehört IAN
```

🔴 **Nicht ausgeführt, und das ist richtig:** Es schreibt in Ians Apple-Konto, und
der Auto-Mode blockt das. Dieselbe Grenze wie bei der echten Supabase.

### ✅ Der Gerätestand ist AKTUELL — seit 2026-09-26, 19:09

Der Build von 18:50 (Release, 365 Tage, Schalter im Bündel auf `supabase`) liegt auf
Ians iPhone. `devicectl` hat es selbst bestätigt (`App installed · bundleID
at.simplysocial.app`), nicht nur ein Exit-Code.

Er ging NICHT direkt drauf: Ians iPhone hatte sich während der 15 Minuten Bauzeit
selbst gesperrt. Der Wartelauf von `npm run aufspielen` hat das Entsperren bemerkt
und es allein erledigt — das war sein erster echter Lauf.

```bash
npm run aufspielen        # NEU: spielt das fertige Bündel auf, wartet bis zu 45 Min.
npm run geraet            # baut UND spielt auf (15 Min.)
```

⚠️ **Bauen und Aufspielen sind seither getrennt**, weil die Kopplung der Fehler
war: Bauen dauert 15 Minuten und braucht das iPhone nicht, Aufspielen dauert
Sekunden und braucht es offen. „starte neu" hiess vorher: 15 Minuten für etwas,
das fertig daliegt.

### ✅ Screenshots vom Gerät gehen jetzt selbst — Belege `au00`/`au01`

`npm run knipsen` ist am 2026-09-26 um 19:17 zum ersten Mal am echten iPhone
gelaufen. Damit endet der Vorgang, mit dem bisher JEDE Design-Runde endete
(*„schick mir bitte einen Screenshot"*).

⚠️ **`sudo npm run tunnel` druckt „Waiting for user pairing" und bleibt so stehen.**
Das ist der Normalzustand, nicht ein Hänger — Ian hat deswegen nachgefragt. Ob er
arbeitet, sagt der Port: `curl -s http://127.0.0.1:49151` gibt eine
`tunnel-address` zurück.

🔴 **TIPPEN geht nicht und wird nicht nachgerüstet.** `devicectl` hat keinen
URL-Befehl, `dvt` keinen Tipp-Befehl. Vor allem aber: Am Gerät steht
`ANMELDE_QUELLE` auf `supabase` — ein danebengegangener Tipp ginge in die ECHTE
Datenbank. **Knipsen ist lesend, Tippen wäre es nicht.** Die Arbeitsteilung ist
damit: Ian tippt, Claude knipst und misst.

### ✅ Die zwei Kartenfragen sind am Gerät beantwortet (Beleg `au02`)

| Frage | Antwort |
|---|---|
| **Zacken die Grenzen noch?** | **Nein.** Neunfach vergrössert am Donaukanal: durchgehende glatte Linie, keine Treppenstufen. `fb874e2` (39,1 m → 1,0 m) hält am Gerät |
| **Gehen die Bezirke ohne Zahlen auseinander?** | **Nicht beurteilbar — und das ist ein DATEN-Befund, kein Design-Befund.** Gemessen mit `png_lesen()`: Genau EIN Bezirk (der 1.) trägt eine Fläche, `#828492` bei Helligkeit 132; alle anderen liegen zwischen 44 und 76 und das sind Apples Karteninhalte, nicht unsere Stufen. Die vier Stufen stehen gar nicht nebeneinander auf dem Schirm |

⚠️ Die gemessenen Werte liegen NICHT auf der Skala aus `karte.ts`, weil die Fläche
**halbdurchsichtig über Apples Karte** liegt. Wer hier eine Stufe nachmessen will,
muss das mitrechnen.

🔴 **Was daraus folgt:** Entscheidung 101 (keine Zahlen) lässt sich erst beurteilen,
wenn Posts in MEHREREN Bezirken liegen. Das ist kein weiterer Gerätedurchgang,
sondern eine Datenfrage — im Prototyp (`'attrappe'`) wäre sie sofort zu sehen.

✅ **Entscheidung 102 ist am Gerät abgenommen** (2026-09-26, Ian: *„ja 102 passt"*).
Der direkte Sprung von der Karte in den Stapel bleibt. Damit ist der Plan
`kopfleiste-geradeziehen.md` vollständig durch — vier Runden, geschlossen.

### 🔴 Die Skala ist am GERÄT nur halb so stark wie auf der gezeichneten Karte

Beim Nachrechnen der Kartenfrage gefunden, und es betrifft Entscheidung 104.
`python3 scripts/skala-messen.py` rechnet die Stufen jetzt auch **über Apples
Karte** (neuer Abschnitt, Hintergrund `#222C3D` aus Beleg `au02` gemessen):

| | leer→1 | 1→2 | 2→3 | 3→4 | schwächster | gesamt |
|---|---|---|---|---|---|---|
| gezeichnet (Prototyp, deckend) | 1,89 | 1,84 | 1,93 | 1,90 | **1,84** | **12,73** |
| **am Gerät** (`APPLE_TOENUNG` 0,45) | **1,25** | 1,33 | 1,43 | 1,50 | **1,25** | **3,53** |

**Die Gegenprobe trägt die Zahlen:** Stufe 4 über `#222C3D` ergibt rechnerisch
`#7B8088` — und genau `#7B8088` wurde im 1. Bezirk gemessen. Tönung UND
Hintergrund sind damit am Gerät belegt.

🔴 **Zwei Dinge fallen damit auseinander, die zusammengehören sollten:**

1. **Entscheidung 104 gilt nur für die gezeichnete Karte.** Dort ist die Skala
   gleichmäßig (Spannweite 0,10). Am Gerät wächst sie von 1,25 auf 1,50 —
   Spannweite 0,25, also zweieinhalbmal so ungleich.
2. **Der SCHWÄCHSTE Sprung am Gerät ist der ERSTE** (leer → ein Post, 1,25).
   Seit Entscheidung 101 (keine Zahlen) trägt die Farbe die Grenze
   „leer / nicht leer" ALLEIN — der wichtigste Sprung ist der schwächste.

⚠️ **`APPLE_TOENUNG` allein schließt die Lücke nicht.** Durchgerechnet: selbst bei
0,70 (Stadtplan kaum noch lesbar) kommt der erste Sprung nur auf 1,43 und erreicht
die 1,84 der gezeichneten Karte nie.

| Tönung | leer→1 | schwächster | gesamt |
|---|---|---|---|
| 0,45 *(jetzt)* | 1,25 | 1,25 | 3,53 |
| 0,55 | 1,33 | 1,33 | 4,54 |
| 0,70 | 1,43 | 1,43 | 6,38 |

✅ **Ians Entscheidung 111 (2026-09-26): die Skala bleibt.** Vorgelegt mit allen
Zahlen, geantwortet *„ja es passt, mach weiter"*. Die drei Wege (Stufe 1 heller ·
sichtbare Kontur statt nur Fläche · Skala stauchen) sind damit **nicht offen,
sondern abgelehnt** — sie werden nur auf ausdrückliche Ansage wieder aufgemacht
(harte Regel 58). Die Zahlen oben bleiben als Messung stehen, nicht als Mangel.

`au01` belegt den Stapel, `au02` die Karte. Ob die Zacken weg sind, ob die Bezirke ohne Zahlen
auseinandergehen, ob der direkte Sprung sich richtig anfühlt — am Mac ist nichts
davon belegbar.

### Ians Entscheidungen 112–114 (2026-09-28)

| # | Entscheidung | Stand |
|---|---|---|
| **112** | **Ian selbst ist der Verantwortliche** — auf der Datenschutzerklärung, mit E-Mail und **ohne Postadresse**. Deckt sich mit dem gemessenen Apple-Konto (`ACCOUNT_HOLDER`). Die drei Wege waren: er selbst · ein Elternteil · vertagen | ✅ live |
| **113** | **Inhaltsrechte: `USES_THIRD_PARTY_CONTENT`** — „ja, und wir haben die Rechte". Vorgelegt mit beiden Lesarten (Wiener Bezirksgrenzen CC BY 4.0 + UGC gegen Apples enge Lesart „fremde Musik/Filme"). Gewählt wie bei Entscheidung 78: **untertreiben ist der Fehler, der Apps aus dem Review wirft** | ✅ bei Apple |
| **114** | **Der rote Kasten „Dieser Teil fehlt noch" kommt RAUS** — und ein neuer Build damit. Er sagte *„bevor die App über den Freundeskreis hinausgeht"* auf genau dem Screen, den ein Guideline-1.2-Prüfer öffnet. Ersetzt durch Belegbares, nicht durch erfundenen Rechtstext | ✅ Code, ⬜ Build 4 |

🔴 **Die HAFTUNG bleibt offen** — von den vier Punkten des Kastens ist einer erledigt
(DSGVO, steht jetzt im Netz), zwei sind beantwortet (Alter, Betreiber), und *„wer
haftet, wenn bei einem Treffen etwas passiert"* gehört weiter jemandem vorgelegt, der
sich auskennt. Sie steht in `_FUER_IAN/OFFENE_SACHEN.md` — nur nicht mehr als roter
Kasten im Screen, weil ein Reviewer daraus etwas anderes liest als ein Gründer.

### Ians Entscheidungen 101–104 (2026-09-20, nachts)

| # | Entscheidung | Stand |
|---|---|---|
| **101** | **Keine Zahlen auf der Karte** — *„dass man gar keine zwei oder so sieht."* Die Farbstufe trägt es allein. Schalter `ZAHLEN_AN` in `features/posts/karte.ts`, gilt für BEIDE Zeichner (Regel 52) | ✅ |
| **102** | **Ein Tipp geht DIREKT in den Stapel** — *„draufklickt und dann redirected wird."* Damit fällt der zweite Tipp als Rückweg weg (Entscheidung 49); Ersatz ist 103 | ✅ |
| **103** | **Ein ✕ in der Kapsel wählt den Bezirk ab** — nur in der KARTENansicht. Im Stapel sagt es schon der Filterknopf; zwei Antworten auf dieselbe Frage wären eine zu viel | ✅ |
| **104** | **Die Kartenskala wird gleichmäßig** — der Sprung „leer → ein Post" wächst von 1,62 auf 1,89, die Spannweite fällt von 0,50 auf 0,10 | ✅ |
| — | **Wien 83 pt tiefer: passt so.** Vorgelegt und angenommen; die Kamera bleibt, wo sie ist | ✅ geschlossen |

### 🔴 Die vier Befunde dieser Runde

| # | Befund |
|---|---|
| **1** | **Ein grobes Raster spart nichts.** In `bezirke-bauen.py` wird VOR Douglas-Peucker gerundet — ein grobes Gitter nimmt ihm die Auswahl, und er braucht dann MEHR Punkte für dieselbe Abweichung (`0.25/0.5` → 1863 Punkte, `0.1/0.5` → 1780 bei 2,4× feinerem Gitter). Gespart wird über `TOLERANZ`. Und unter `TOLERANZ = RASTER` bricht der Nutzen weg |
| **2** | **Die Warnung zu `pruef-glas` war falsch.** Er prüft nicht, ob `SsGlas` benutzt wird — `31_glasmessung.py` bewacht das MESSGERÄT und nennt `SsGlas`/`GLAS_AN` kein einziges Mal. Seine 33 Häkchen sind richtig; **nur sein NAME verspricht mehr.** Entscheidung 99 hat jetzt einen echten Wächter in `pruef-kopf` |
| **3** | **Ians „der 14. ist immer noch dunkler" war KEIN Fehler.** `gewaehlt` ist in einer Zeile aus `filter.bezirk` abgeleitet, `find` trifft bei `null` nie etwas — ein markierter Bezirk ohne laufenden Filter kann es nicht geben. Es fehlte keine Reparatur, sondern eine **Auskunft** (→ 103) |
| **4** | **Zwei dokumentierte Kontraste waren veraltet.** Im Kommentar 8,63 und 4,53, gemessen 9,75 und 5,11. Stufe 3 und 4 stimmten weiter — weil sie `DUNKLE_ZAHL` benutzen, während `colors.ink` mit Entscheidung 92 auf Reinweiß ging. Neu: `python3 scripts/skala-messen.py` liest alle zehn Zahlen AUS DEM CODE |

### Die Skala ist eine GERADE, keine Farbsammlung

Nachgerechnet: Die vier Stufen liegen auf einer Geraden im sRGB-Raum von
`KARTE_LEER` nach `accent.base`, auf das Byte genau. Entscheidung 104 verschiebt
deshalb nur die **vier Abtastpunkte** (0,171 · 0,382 · 0,638 · 1,0 →
0,219 · 0,426 · 0,686 · 1,0) und keine Farbe — die Regel *„die Skala läuft auf
`accent.base` zu"* bleibt wörtlich.

⚠️ **Stufe 2 sitzt bewusst nicht exakt auf der Gleichverteilung.** Bei t = 0,435
fiele heller Text auf 4,43:1, also unter WCAG AA. Heute folgenlos (es gibt keine
Zahlen), aber `ZAHLEN_AN` ist eine Zeile — t = 0,426 hält 4,54:1.

### Was von dieser Runde OFFEN blieb

- **Die Bezirksauswahl im Filter** gibt es weiter nicht (Entscheidung 63, von Ian
  selbst gestrichen). Rückgängig nur auf Ansage, und dann als `SsBezirkFeld` (Regel 81)
- **`pruef-moderation` braucht eine lokale Wegwerf-DB**, die hier nicht lief
  (`database "ss" does not exist`) — unabhängig von diesen Änderungen, aber
  `CLAUDE.md` sagt bei ihm „braucht nichts", und das stimmt so nicht

---

### Die Runde davor (2026-09-20, abends) — sechs Commits, alle am Gerät geprüft

| Commit | Inhalt |
|---|---|
| `3ff2f9b` | **Bewegung.** `lib/bewegung.ts` (Tempo-Vokabular), `useDruck`, `useKlappe`, gleitende Pille im `SsSegment` — und **Glas wird matt** |
| `402d62b` | Filterknopf sitzt IN der Kapsel · `npm run demo -- --mir-zeigen <e-mail>` |
| `40c1bc0` | Der gewählte Bezirk hat dieselbe Strichstärke wie die anderen Grenzen |
| `f998226` | Nichts liegt mehr unter der Tab-Kapsel · der Schleier deckt auch oben |
| `e7fdcf5` | Das eigene Konto hat Aktivität, Anfragen und Chat |
| `916c5fc` | Die Karte wird nicht mehr neu aufgebaut · Apples Nennung geht runter |

### 🔴 Die drei Befunde, die mehr sind als ihre Zeile Code

| # | Befund |
|---|---|
| **1** | **`DRUCK` war gar keine Animation.** Ein statischer Style über `pressed && DRUCK` — der Knopf sprang auf 96 % und hart zurück. Ians zwei Zahlen (0,96 · 0,82) sind unverändert; neu ist nur der WEG. Nebenbei behoben: **`SsBack` brach Regel 61**, seit die Kapsel in 20.10 kam — der Zurück-Knopf schaltete sein Liquid Glass beim Drücken ab |
| **2** | **`LayoutAnimation` hätte auf iOS still nichts getan.** RN 0.86 sagt es im eigenen Quelltext: *„unconditionally enabled for Android, and **conditionally enabled on iOS**"*. Der Plan wollte dort „eine Zeile" — es wurde `useKlappe` mit gemessener Höhe |
| **3** | **Apples Nennung sitzt NICHT am Rand der Polsterung.** Der Code nahm das seit Phase 19g an. An Ians Standbild gemessen (iPhone 16, 3×, unterer Rand = null): Apples Zeile **184 pt**, unsere Bezirksgrenzen **93**, Tab-Kapsel **82**. Bei `mapPadding.bottom = 83` müsste Apples Zeile bei ~83 sitzen — **MapKit legt rund 100 pt eigenen Abstand darüber** |

### 🔴 Kein Liquid Glass mehr — und warum das keine Niederlage ist

**Ians Entscheidung 99.** Das Material war **nie** nachgebaut: `SsGlas` ruft
`expo-glass-effect` → `GlassView` → Apples `UIGlassEffect`. An seiner Aufnahme wurde
auch belegt, dass es arbeitet — die Wien-Karte schimmert durch die Kopfkapsel.

**Was fehlt, ist Apples LEISTE, nicht Apples Material.** Die Tab-Leiste unten sieht
richtig aus, weil sie eine echte `UITabBar` ist. Für oben wäre die Entsprechung die
`UINavigationBar` — und die kann React Native heute nicht mit Glas zeichnen
(`react-native-screens` #4021: *„there's no way to make the Stack header adopt the
system Liquid Glass material"*; von drei nötigen Apple-Methoden wird
`configureWithDefaultBackground` gar nicht aufgerufen).

`GLAS_AN = false` in `glas-typen.ts` zwingt iOS deshalb auf den Ersatzweg: matte
Fläche mit Kante und Schatten. **Zurückdrehen ist eine Zeile.**

🔴 **Berichtigung vom 2026-09-20:** Hier stand, `npm run pruef-glas` prüfe, „DASS
`SsGlas` benutzt wird". **Das tut er nicht.** `31_glasmessung.py` bewacht das
MESSGERÄT `scripts/glasmessung.py` — PNG-Dekoder und Helligkeitsrechnung — und
erwähnt `SsGlas`, `GLAS_AN` und `glas-typen` mit **keinem Wort**. Seine 33 Häkchen
sind richtig und von `GLAS_AN` gar nicht berührt; **nur sein NAME verspricht mehr
als er prüft.**

Entscheidung 99 hat seither einen echten Wächter: **`npm run pruef-kopf`** (jetzt
**24** statt 19). Er hält fest, dass `GLAS_AN` auf `false` steht, dass
`SsGlas.native.tsx` ihn liest und dass er die ERSTE Bedingung in `GLAS_DA` ist —
mit Gegenprobe, am umgelegten Schalter rot gesehen.

### Ians Entscheidungen 98–100 (2026-09-20)

| # | Entscheidung | Stand |
|---|---|---|
| **98** | **„In Wien ist gerade nichts los" ist WEG** — *„that's what you see."* Der Fall MIT Filter bleibt: der sagt etwas, das man NICHT sieht | ✅ |
| **99** | **Kein Liquid Glass, sondern matt** — *„so wie die anderen Knöpfe."* Die Tab-Leiste unten bleibt echtes Glas, weil sie Apples eigene ist | ✅ |
| **100** | **Der gewählte Bezirk sieht aus wie die anderen** — gleiche Strichstärke, die Auswahl trägt allein die Farbe. Eine dicke Linie zeigt sonst die Auflösung der Geometrie statt der Grenze | ✅ |

### Die vier Tempo-Zahlen in `lib/bewegung.ts` gehören Ian

| Spur | ms | wofür |
|---|---|---|
| `druckHinein` | 90 | unter ~100 ms liest man es als Teil der eigenen Berührung |
| `druckHeraus` | 240 | der Rückweg ist die App, die loslässt — darf Zeit haben |
| `klappeAuf` / `klappeZu` | 260 / 190 | zu darf schneller sein: die Entscheidung ist gefallen |
| `gleiten` | **420** | in ZWEI Durchgängen von Ian beurteilt (240 → 320 → 420) |

### Was auf Ians Urteil wartet

- ~~**Wien sitzt 83 pt tiefer**~~ ✅ vorgelegt, *„passt so"*
- ~~**Zackige Umrisse beim Hineinzoomen**~~ ✅ 39,1 m → 1,0 m (`fb874e2`)
- ~~**Zahlen weg + direkt in den Stapel**~~ ✅ Entscheidungen 101–103 (`6c204e1`)
- **Die Bezirksauswahl im Filter gibt es nicht** — er hat sie selbst gestrichen
  (Entscheidung 63). Rückgängig nur auf Ansage, und dann als `SsBezirkFeld` (Regel 81)
- 🔴 **Alles aus dieser Runde wartet auf einen Gerätedurchgang** — ob die Zacken weg
  sind, ob die Bezirke ohne Zahlen auseinandergehen und ob der direkte Sprung sich
  richtig anfühlt, ist am Mac nicht zu beantworten

### Ians Entscheidungen 90–97 (2026-09-19/20)

| # | Entscheidung | Stand |
|---|---|---|
| **90** | Oben eine Glaskapsel wie unten, Kategorien in den Regler | ✅ Beleg `at13` |
| **91** | Die Anfragen-Zahl wird TÜRKIS (`#00E5D0`) | ✅ |
| **92** | Die Schrift wird PUR (`ink` Reinweiß, `inkSoft` zieht mit) | ✅ Beleg `at04` |
| **93** | Die Wien-Karte bleibt sichtbar, auch wenn nichts los ist | ✅ (Lesart: die **Kartenansicht**) |
| **94** | Auf iOS ein **Punkt** statt der Zahl — Apple gibt die Schriftfarbe nicht her | ✅ |
| **95** | **Die Suchleiste ist WEG** — *„gib die Suchleiste weg"*. Drei Wege vorgelegt, „ganz weg" gewählt. 🔴 Die MECHANIK bleibt (Regel 51): `filter.suche` und `passtZumText()` stehen unverändert da | ✅ |
| **96** | **Die Kapsel ist so breit wie ihr Inhalt** — Kapsel links, Posten-Knopf rechts. Eine leere Glasfläche liest sich als Fehler, nicht als Ruhe | ✅ Beleg `at13` |
| **97** | **Bewegung: Drücken + die großen Sprünge**, keine Listen | ✅ `3ff2f9b` |

### Was in dieser Runde sonst repariert wurde

🔴 **`useTabRand()` gibt auf iOS seit Entscheidung 85 (NativeTabs) 0 zurück** — der
`BottomTabBarHeightContext` gehört `expo-router/js-tabs` und existiert unter NativeTabs
nicht. Für Inhalt im FLUSS ist die 0 richtig (`react-native-screens` trägt Apples Insets
selbst ein); für alles, was ABSOLUT darüber liegt, ist sie falsch. **Harte Regel 62
trennt genau diese zwei Fälle.** Neu: `useTabUeberdeckung()` mit `.native`-Fassung.

⚠️ **Der erste Anlauf dazu war selbst falsch:** `insets.bottom + 66`, wobei die 66 aus
einem Screenshot abgeleitet waren. Ein Messstreifen in der App hat `insets.bottom` direkt
ausgelesen — **83**, also 34 Home-Indikator PLUS 49 UITabBar. Die Leiste steckt schon
drin. *Eine am Bild gemessene Zahl kann richtig sein und trotzdem falsch verwendet.*

✅ **Die Karte rechnet KORREKT** (Belege `at11`/`at12`): `bereit true`, `eigen false`,
Mitte exakt 48,2203/16,3797, `dLon` auf vier Stellen gleich dem Sollwert. Die drei
Verdächtigen — verpuffter Kamerabefehl, falsches `eigen`, `minZoomLevel` — sind
**ausgeschlossen**. Wien steht mittig mit Bezirken und Zahlen. Der Klecks auf Ians Bild
liess sich am Simulator **nicht** reproduzieren; am nächsten liegt, dass er die Karte
selbst verschoben hatte (dann zentriert die App absichtlich nicht zurück).

### Gemessene Zahlen (grün, Stand 20.9/20.8)

| Prüfstand | Häkchen | braucht |
|---|---|---|
| `bash supabase/pruefen/aufbauen.sh` | **171** | nichts (Wegwerf-DB, heilt sich selbst) |
| `npm run pruef-schreiben` | 50 | echten Server |
| `npm run pruef-konto` | 32 | echten Server |
| `npm run pruef-bilder` | 32 | echten Server |
| `npm run pruef-lesen` | 29 | echten Server |
| `npm run pruef-anbieter` | 48 | nichts |
| `npm run pruef-bildwahl` | 47 | nichts |
| `npm run pruef-moderation` | 31 | eine **frische** Wegwerf-DB — siehe unten |
| `npm run pruef-sitzung` | 29 | nichts |
| `npm run pruef-programmfehler` | 25 | nichts |
| `npm run pruef-zuschnitt` | **47** | nichts |
| `npm run pruef-etikett` | 12 | nichts |
| `npm run pruef-demo` | **32** | nichts (Wegwerf-DB) |
| `npm run pruef-demoregel` | **29** | nichts |
| `npm run pruef-alter` | **35** | nichts (seit 28.9 auch der verengte Webzugriff-Wächter) |
| `npm run pruef-zustimmung` | **28** | nichts |
| `npm run pruef-glas` | **33** | nichts (bewacht das **Messgerät**, nicht die App — siehe oben) |
| `npm run pruef-farben` | **79** | nichts |
| `npm run pruef-kopf` | **47** | nichts (seit 20.9 auch Ians Entscheidung 99) |
| `npm run pruef-nennung` | **13** | nichts |
| `npm run pruef-plattform` | **5** | nichts (vergleicht die 11 `.native`-Paare) |
| `npm run pruef-treffen` | **22** | die Wegwerf-DB aus `aufbauen.sh` |

Dazu: `npx tsc --noEmit` sauber · `expo lint` **89 Probleme** (Stand 20.12: 82 vorbestehend, plus vier aus den zwei neuen `pan.x.interpolate()`-Zeilen der WischKarte — jede meldet doppelt; dazu
**einer mit Namen**: `react-hooks/refs` in `BildZuschneiden.tsx` — derselbe, den
`SsWienKarte.tsx:552` trägt, und aus demselben Grund, ein `PanResponder` muss seine
Werte aus einem Ref holen. Jede ANDERE Zahl ist ein Befund, kein Rauschen).

---

## 🔴 Aus ACTA gelernt — zwei Ablehnungen, die hier NICHT passieren sollen

> Ians Auftrag am 2026-09-26: *„schau dir das mal an, damit nicht die gleichen
> Fehler passieren."* ACTA (`17_Tennis_Optimma`) ist bei seiner dritten
> Einreichung. Beide Ablehnungen waren hier wiederholbar.

### 1 · Guideline 4 — der iPad-Fehler war hier EINGEBAUT ✅ behoben

Apple am 2026-09-22 zu ACTA: *„The login screen was not entirely visible."*
Prüfgerät iPad Air 11". iPhone-only-Apps laufen auf iPadOS in einem
**veränderbaren Fenster**; wird es kürzer als der Inhalt, schneidet ein
`View` mit `flex: 1` ab — ohne Rettung, Knöpfe unerreichbar.

**Nachgemessen: SimplySocial war Zeichen für Zeichen gleich konfiguriert.**
`supportsTablet: false` · `TARGETED_DEVICE_FAMILY = 1` ·
`UIRequiresFullScreen = false` · Portrait-Sperre. Die Portrait-Sperre hat ACTA
nicht gerettet.

🔴 **Die Behebung ist eine ANDERE als in ACTA, und das ist der Punkt.** Dort
liefen die zwei Listen-Screens nicht durch die Hülle — man konnte sie einfach
scrollbar machen. **Hier tun es sieben.** Eine `FlatList` in einer `ScrollView`
verliert ihre Virtualisierung: abgeschrieben wäre die Behebung falsch gewesen.

Stattdessen ist die **Voreinstellung umgedreht** (ACTAs eigene Lehre: *„Eine
Prop, die Rettung ANBIETET, rettet nur die, die sie setzen"*):

| | vorher | jetzt |
|---|---|---|
| ohne Prop | `View` mit `flex: 1` — schneidet ab | `ScrollView` mit `flexGrow: 1` — rettet |
| Liste/Geste | — | `scrolltSelbst` (7 Stellen) |

Dazu `Anmelden.tsx` einzeln: Er läuft nicht durch `SsScreen` (er IST der
Torwächter) und ist **der erste Bildschirm, den Apples Prüfer sieht**.

Bewacht von **`npm run pruef-boden`** (13 Häkchen, mit Gegenprobe).

### 2 · Die erste Ablehnung war gar kein Mangel — leere Prüfnotizen ✅ vorbereitet

ACTAs Runde am 14.09. war die Erstentwickler-Routine „Information Needed":
Zweck, Zielgruppe, Zugang, Video. Kostete ein Video und acht Tage.

**Bei SimplySocial stand `notes` auf LEER.** Jetzt `scripts/pruefnotizen.md`
(2.785 Zeichen, Grenze 4.000) — was die App ist, was sie NICHT ist (kein
Dating), wie man hineinkommt, und **wo genau** Melden · Blockieren ·
Nutzungsbedingungen · Konto-Löschen stecken. ⚠️ Jeder Weg am 2026-09-26 im Code
nachgeprüft; ein falscher Weg dort ist schlimmer als keine Notiz.

### Die anderen ACTA-Lehren, die hier gelten

- **`asc.py einreichbereit` misst FELDER, nicht Erfolg.** Bei ACTA 10/10 grün,
  während die App vier Tage abgelehnt war. Der Grund steht NIE in der API — das
  Resolution Center ist darüber weder les- noch schreibbar. **Er steht in Ians
  Mail.**
- **Der PREIS blockiert hart und taucht in keinem Feld auf** (nur als
  `APP_PRICING_REQUIRED` im 409). Mit unserem Schlüssel nicht setzbar.
- **„Fertig als Datei" ist nicht „fertig bei Apple".** ACTAs sieben Screenshots
  lagen im Ordner, bei Apple keines.
- **Ein sichtbares UI-Element beweist nicht, dass hinten etwas hängt.** ACTAs
  „Konto löschen" rief ins Leere — die Funktion war nie deployt (Guideline
  5.1.1(v)). Hier ist sie server­seitig geprüft (171 Häkchen, `98_moderation`).
- **Ein neuer Build holt die Version aus `REJECTED`** — nicht das Antworten.
- **Testdaten des Demo-Kontos NICHT aufräumen**, solange Apple prüft: Der
  Prüfer meldet sich damit an, und die Daten füllen erst seinen Feed.

### Die vier Befehle, die jetzt für Ian bereitliegen

```bash
npm run asc altersfreigabe -- --wirklich   # 28 Antworten statt 28 Klicks
npm run asc pruefnotizen   -- --wirklich   # der Text gegen Runde 1
npm run asc metadaten      -- --wirklich   # Kategorie + Werbe-ID
npm run asc screenshots    -- --wirklich   # 8 Bilder, 1320×2868
```

Alle vier **ohne** `--wirklich` als Trockenlauf gefahren und belegt. Sie
schreiben in Ians Apple-Konto, deshalb tippt er sie (siehe Memory
`apple-konto-schreiben-gehoert-ian`). Bleiben bei ihm: **Preis**, **Copyright**,
**Rechtstext**, **Store-Texte** (Projekt 34) und der **Build**.

📄 Für Ian: [`_FUER_IAN/WAS_DU_JETZT_MACHEN_MUSST.md`](_FUER_IAN/WAS_DU_JETZT_MACHEN_MUSST.md)

---

## Was als Nächstes ansteht

1. **Phase 21 — App Store.** 13+ (Apples neue Altersfrage ist seit Sept. 2026 Pflicht,
   die Antwort ist ja), Rechtstexte, TestFlight, einreichen.
   **21.3, das Datenschutz-Etikett, ist seit 2026-09-14 fertig** — sieben Einträge,
   jeder aus dem Code hergeleitet, in `_FUER_IAN/DATENSCHUTZ_ETIKETT.md` zum Abtippen.
   Dazu **Ians Entscheidung 78**: der Bezirk zählt als „Grober Standort".
   **21.5 Punkt 1, der Demo-Zugang, ist seit 2026-09-14 fertig** — Ians Entscheidung
   79, harte Regeln 108 und 109. Ein Konto mit Passwort plus eine bespielte Demo-Welt;
   damit ist **Punkt 5 (der leere Zustand) mit erledigt**. Anleitung für Ian in
   `_FUER_IAN/DEMO_ZUGANG.md`. **Vollständig erledigt am 14.09.**: echter Lauf ✓,
   Zugangsdaten in App Store Connect ✓, **Gerätedurchgang 5 — 2 von 2** ✓ (anmelden
   als Demo · und als Ian selbst, ohne Demo-Leute im Feed).
   ⚠️ **Der Build, der eingereicht wird, muss den Code vom 14.09. enthalten** —
   Zugangsdaten ohne passendes Feld sind dieselbe Ablehnung wie gar keine.
   **21.1, die Altersfreigabe, ist seit 2026-09-14 fertig** — Ergebnis **13+**, keine
   Wahl sondern Feststellung. 28 Antworten zum Abtippen in
   `_FUER_IAN/ALTERSFREIGABE.md`, bewacht von `npm run pruef-alter` (harte Regel 110).
   🔴 **Am 2026-09-26 nachgemessen: 27 von 30 Feldern stehen weiter auf `null`** — seit
   dem 14.09. hat sich nichts bewegt. Seither ist es aber kein Abtippen mehr, sondern
   `npm run asc altersfreigabe -- --wirklich`; die Antworten stehen als Tabelle
   `ALTERSFREIGABE` in `scripts/asc.py`, bewacht von `pruef-alter` (16 → 32).
   **21.2, die MECHANIK der Zustimmung, ist seit 2026-09-14 fertig** — Ians
   Entscheidung 80, harte Regel 111. Häkchen beim ersten Konto, festgehalten mit
   Zeitpunkt **und Fassung**; der Riegel sitzt in `profilAnlegen()`, nicht im
   Bildschirm. **Der Rechtstext bleibt offen** — Gefäß und Inhalt sind trennbar,
   sobald Ian ihn hat, ändert sich genau eine Konstante.
   🔴 **Dabei gefunden und behoben: „Prototyp, noch nicht öffentlich" stand fest im
   JSX der Nutzungsbedingungen** — auf genau dem Screen, den ein Reviewer bei einer
   1.2-App aufmacht, und Apple weist Apps zurück, die sich als Beta ausgeben. Der
   Gerätedurchgang „kein Prototyp-Hinweis ✓" meinte das VOLLBILD, nicht diese Zeile.
   **21.4, TestFlight, ist seit 2026-09-14 EIN BEFEHL** — `npm run testflight`,
   sechs Schritte von der Signierung bis zum Upload, mit drei Vorprüfungen VOR dem
   20-Minuten-Build (Build-Nummer frei? Schalter auf `supabase`? Schlüssel da?).
   Er startet ihn selbst, weil das Hochladen nach aussen wirkt.
   🟢 **Berichtigung vom 2026-09-26: Die Signier-Kette ist VOLLSTÄNDIG.** Hier stand
   „kein Distribution-Zertifikat, kein Profil" — das galt am 14.09. Bei Apple
   nachgefragt und im Schlüsselbund nachgesehen:

   | | Zustand | gültig bis |
   |---|---|---|
   | Distribution-Zertifikat | da, auch im Schlüsselbund (`security find-identity`) | 2027-09-14 |
   | Profil `SimplySocial App Store` | **ACTIVE**, `IOS_APP_STORE` | 2027-09-14 |
   | Development-Zertifikat | da | 2027-05-22 |

   Beide tragen das Datum 2026-09-14 — Ians eigener TestFlight-Lauf hat sie
   angelegt, daher Build 2. **Der Schritt, der den Auto-Mode blockte, fällt beim
   nächsten Lauf weg;** es bleibt Bauen und Hochladen.
   **Offen: 21.2 (der Rechtstext selbst, wartet auf Ian) und der LAUF von 21.4.**
2. ~~**Phase 20.6-d — runder Zuschnitt.**~~ ✅ **fertig und am Gerät geprüft**
   (2026-09-13, Durchgang 4: 6 von 6). Nichts mehr offen.
3. **19d-2** (MapKit JS im Browser) — fällt nach Phase 20 nebenbei ab.

## Was auf Ian wartet

| | Wo | Blockiert? |
|---|---|---|
| 🔑 **Simulator einmal als Demo anmelden** — ohne das zeigt der Torwächter, und jeder Deep Link landet auf `<Anmelden />`. Damit ist alles hinter der Anmeldung **ungemessen**: der Wischstapel, die Wien-Karte, die Tab-Kapsel (also das Glas selbst) und `/bausteine`. Das Demo-Passwort wurde **einmal** angezeigt und steht nirgends — `npm run demo -- --neues-passwort` macht ein neues, greift aber auf die echte Supabase | Simulator „iPhone 17 Pro" läuft schon | **für Teil 2 ja** |
| 🔑 **Bedienungshilfen-Berechtigung** — Systemeinstellungen → Datenschutz & Sicherheit → Bedienungshilfen. Erst damit kann `tippen.sh` entstehen (Umschalter, Wischstapel, Kartenauswahl haben keine Route) | | für Teil 3 ja |
| 🎨 **Welche Farbe heißt „Standort an"?** — `einstellungen.tsx:375` unterscheidet den Zustand allein an der Farbe des Symbols. Vorher 1,69, nach der Umkehr **1,09** — praktisch nicht mehr zu sehen. Eine Kategoriefarbe scheidet aus (sie behauptet eine Kategorie). `TODO(Ian)` steht an der Zeile | PLAN.md · `einstellungen.tsx:375` | nein |
| 🎨 **Die drei Post-Fassungen aussuchen** — A (Farbband) · B (bunt) · C (groß und ruhig, steht gerade drin). Am Handy unter Einstellungen → „Für die Entwicklung" → „Post-Fassungen vergleichen". ⚠️ **Der Screen `app/post-fassungen.tsx` und sein Eintrag in `einstellungen.tsx` sind WEGWERF-CODE** und fliegen raus, sobald Ian gewählt hat | am iPhone | nein, aber es blockiert das Aufräumen |
| 🚀 **TestFlight — `npm run testflight`** (ein Befehl, 15–25 Min). Zwei Schritte darin fassen Ians Schlüsselbund an und legen in seinem Apple-Konto ein **Distribution-Zertifikat** an (0 von 2 belegt) — der Auto-Mode blockt das bei mir, zu Recht. Alles andere ist vorbereitet und die Vorprüfungen sind getestet | `_FUER_IAN/TESTFLIGHT.md` | für Phase 21 ja |
| 🔴 **Migration 0012 einspielen** — `npm run einspielen 0012_treffen_zaehler.sql`. Ohne sie steht überall „0 Treffen". An Ians echte Supabase komme ich nicht heran | `_FUER_IAN/TREFFEN_ZAEHLER.md` | für den Zähler ja |
| 🎨 **Sind die Anmelde-Knöpfe zu cremig?** `accent.base` ist weiter `#E8E7E3`; Entscheidung 92 betraf nur die SCHRIFT. Ob Ians *„die Farben sind zu cremig"* die drei großen Knöpfe mitmeinte, sagt nur er — es wäre eine Zeile. ~~Gerätedurchgang 9~~ ist **erledigt, 4 von 4** (2026-09-20) | `_belege/at04` | nein |
| 🔵 **Gerätedurchgang 6 — das Zustimmungs-Häkchen.** Build ist seit 14.09. auf dem iPhone, der Durchgang steht aus. Schritt 1 beweist zugleich, ob der neue Build drauf ist | `_FUER_IAN/HANDY_DURCHGANG.md` | für Phase 21 ja |
| 🔑 **Management-Token widerrufen** — darf alles im Supabase-Konto, wird nie wieder gebraucht. **Am 14.09. nachgesehen: `~/.simplysocial/mgmt-token` existiert nicht mehr** — entweder schon erledigt oder nie abgelegt. Im Dashboard nachsehen | `supabase.com/dashboard/account/tokens` → Revoke | nein |
| **Der Knopf unter dem Vollbild-Kasten** — „Nochmal versuchen" oder nichts | PLAN.md 5b, 20.9 | nein |
| **`meldungLage()` bei ZU SPÄT bearbeitet** | `TODO(Ian)`, PLAN.md 6 Punkt 60 | nein |
| 🟢 ~~**Apple-Programm auf wessen Namen?**~~ **BEANTWORTET am 2026-09-28** — bei Apple abgefragt, nicht geraten: Das Programm läuft auf **Ian Faye Horak selbst** (`ACCOUNT_HOLDER`, `ADMIN`). Hier stand „mit 16 üblicherweise über einen Elternteil" — das war eine Annahme, keine Messung. ⚠️ Die RECHTLICHE Frage, ob das so bleiben soll, ist damit nicht beantwortet, nur die tatsächliche | `_FUER_IAN/OFFENE_SACHEN.md` | nicht mehr |
| 🟢 **Die Altersfreigabe schicken — EIN BEFEHL** (seit 26.09.): `npm run asc altersfreigabe -- --wirklich`. 24 Felder gehen von `null` auf einen Wert; der Trockenlauf ohne `--wirklich` ist gelaufen und steht. Zwei Urteilsfragen (Alkohol, Wellness) liegen bei Ian und sind je eine Zeile | `_FUER_IAN/ALTERSFREIGABE.md` | für Phase 21 ja |
| 🔑 **`sudo npm run tunnel`** — einmal pro Mac-Neustart, dann kann ich mir mit `npm run knipsen` selbst Bilder vom iPhone holen. Ohne ihn endet jede Design-Runde wieder mit „schick mir bitte einen Screenshot", und die Store-Screenshots (bei Apple liegt KEINES) sind blockiert | `scripts/knipsen.sh` | für die Screenshots ja |
| 🟢 ~~**Preis auf kostenlos setzen**~~ ✅ **ERLEDIGT von Ian** — am 2026-09-28 gemessen: kostenlos (0.0) in 175 Ländern. Das war die härteste Sperre (`APP_PRICING_REQUIRED`), und sie ist weg | `_FUER_IAN/APP_STORE_STAND.md` | nicht mehr |
| **Rechtstext für die Nutzungsbedingungen** — kein Text, den Claude erfinden darf. **Das Häkchen dafür steht seit 14.09.**, es wartet nur noch auf den Text | `_FUER_IAN/OFFENE_SACHEN.md` Punkt 1 | für Phase 21 ja |
| **Was passiert, wenn sich der Rechtstext ÄNDERT** — alle neu fragen, nur bei Wesentlichem, oder gar nicht. Vertagbar, ohne etwas zu verlieren (die Fassung wird schon geschrieben), aber am Tag des Rechtstexts fällig | PLAN.md 6, Punkt 67 · `TODO(Ian)` in `zustimmung.ts` | nein |
| **Landing-Page-Farbe** — Olivgrün, Weinrot oder Türkis, dazu bunt vs. Leitfarbe | `landing-vorschau/LIESMICH.md`, OFFENE_SACHEN 4b | nein |

## Stack

**Expo + Expo Router + React Native Web** — ein Projekt, zwei Ausgänge: Browser jetzt,
iOS-App später ohne Neuschreiben. Ordner: `simplysocial/`.

Die **Landing-Page** liegt daneben in `landing/` und ist bewusst etwas ganz anderes:
reines HTML/CSS/JS, kein npm, kein Bundler. Sie hat ein eigenes Repo und einen eigenen Deploy.

```bash
cd simplysocial
npm install
npx expo start --web      # Web-Preview
npx tsc --noEmit          # Typecheck
npm run deploy            # bauen + auf GitHub Pages schieben (NUR gh-pages!)
npm run geraet            # bauen UND auf Ians iPhone spielen (15 Min.)
npm run aufspielen        # NUR aufspielen — wartet, bis das iPhone offen ist
npm run asc einreichbereit  # was Apple vor dem Einreichen noch verlangt (nur lesen)
npm run knipsen           # ein Bild vom iPhone (braucht EINMAL: sudo npm run tunnel)
npm run doku              # Doku nach doku/ spiegeln (macht der pre-commit-Hook selbst)
git add -A && git commit && git push   # ← die Sicherung. Der Deploy ist keine.
```

---

## Harte Regeln — Index

> **Volltext: [`_gedaechtnis/HARTE_REGELN.md`](_gedaechtnis/HARTE_REGELN.md).**
> Hier steht nur der Titel. **Wer eine Regel anfasst, liest zuerst ihren Volltext** —
> dort stehen die Begründung, die verworfenen Möglichkeiten und die Messung.
> Regeln mit „nicht ohne Rückfrage" sind Ians Entscheidungen (harte Regel 58).

  1. Kein Firebase, kein Login, kein Netzwerk im Prototyp
  2. Screens lesen niemals direkt aus `mock.ts`
  3. Der Name `SimplySocial` steht an genau einer Stelle
  4. `_FUER_IAN/OFFENE_SACHEN.md` pflegen
  5. Zurück-Knöpfe nehmen `zurueckOderFeed()`
  6. Was zusammengehört, in EINEM `aendern`
  7. Profil-Inhalt kommt aus `components/Profil.tsx`
  8. Eine Folge-Beziehung steht ZWEIMAL im Datenmodell
  9. Der Chat-Screen ist die eine begründete Ausnahme von „Eingabefeld → `scroll`"
 10. Ein BLOCK steht nur EINMAL im Datenmodell
 11. Jede neue dynamische Route braucht `generateStaticParams`
 12. Fake-Daten enthalten nichts Persönliches
 13. `landing/stil.css` ist eine KOPIE des Design-Systems, keine Verbindung
 14. Die Landing-Page bekommt kein Formular ohne Backend
 15. Im Wischstapel gehört der Tipp der KARTE, nicht ihrem Inhalt
 16. Der Stapel liest über `useStapel`, und das liest über `useFeed`
 17. Was ein Block bewirkt, steht in `safety/block.ts` und nirgends sonst
 18. Die Vorschau im Erstellen-Screen ist kein Extra, sie ist die Absicherung
 19. Eine waagrechte Reihe neben einer Liste ist `SsScrollReihe`
 20. Der Ort eines Posts kommt aus `ortText()`
 21. Was der Browser VOR dem JavaScript sieht, steht in `app/+html.tsx`
 22. Der Prototyp-Hinweis ist ein VOLLBILD beim ersten Öffnen
 23. Es gibt keine Emojis in der Oberfläche — Icons kommen aus `theme/icons.ts`
 24. `SsIcon` zeichnet auf BEIDEN Plattformen — seit Phase 19 auch nativ
 25. `landing/icons.js` ist eine KOPIE von `theme/icons.ts`, keine Verbindung
 26. Ein neuer Feed-Filter geht über `FeedFilter` und `features/posts/filter.ts`
 27. Ein Mensch hat einen `jahrgang: number`, ein Post ein Union `PostAlter`
 28. Ein Chat hat seit Phase 16 vielleicht KEINEN Post
 29. Einem Direktchat NIE einen Ersatz-Post oder eine Ersatz-Kategorie geben
 30. Die Chat-Liste gruppiert nach ZUSTAND, nicht nach SORTE
 31. `Post.visibility` ist ein OBJEKT, kein String
 32. Was eine Gruppe ist und was ein Austritt anrichtet, steht in `features/groups/gruppe.ts` und nirgends sonst
 33. Mitgliedschaft steht NUR EINMAL im Modell
 34. Gruppen bekommen KEINEN eigenen Feed und KEINEN eigenen Tab
 35. `npm run deploy` ist KEINE Sicherung — es schiebt nur `gh-pages`
 36. Was über dem Wischstapel liegen soll, geht durch `WischStapel.blatt` — nie über den Stapelbereich im Screen
 37. „Aufgeklappt" ist nicht „sichtbar", und ein roter Hinweis muss auf etwas zeigen, das im Bild ist
 38. Gründen und Einladen sind zwei verschiedene Rechte
 39. Eine Einladung ist KEINE Anfrage mit umgedrehtem Vorzeichen
 40. Eine Zahl an einem Tab liest denselben Haken wie der Screen darunter
 41. `StapelDurch` ist eine ÜBERSCHRIFT über einer Liste, kein Leer-Zustand
 42. Die Chat-Liste besteht aus ZEILEN, jede andere Liste der App aus Karten
 43. Sollen zwei Texte nebeneinander ungleich nachgeben, bekommt der nachgebende `flex: 1` — nicht der andere ein höheres `flexShrink`
 44. Ein Schiebe-Regler gehört NIE in `SsScrollReihe`
 45. Sind zwei Dinge in einem Moment ununterscheidbar, wird die Entscheidung VERTAGT, nicht geraten
 46. Was eine Terminüberschneidung bedeutet, steht in `features/requests/kollision.ts` und nirgends sonst
 47. Was die App über die Pläne einer Person weiß, sagt sie NUR dieser Person
 48. Die Wien-Karte besteht aus SIEBEN Dateien, und keine davon ist ein Screen
 49. Ein Kneifen ist NIE ein Tipp — auch wenn sich nichts bewegt hat
 50. Was auf einer Karte gewählt ist, IST der Bezirksfilter
 51. Was über der Karte schweben soll, geht durch `SsWienKarte.blase` — nie als Kind der Kartenfläche
 52. Es gibt mehr als einen Kartenzeichner und GENAU EINE Bedeutung
 53. Die Geometrie der Bezirke steht EINMAL da — im Raster
 54. Eine Server-Regel steht im Schema `regel` und NIE in einer Policy
 55. Auf `group_members` gibt es KEIN Insert-Recht, und das ist die Aussage
 56. Die HERKUNFT eines Chats ist eine Tatsache, kein abgeleiteter Wert
 57. Was am Server gilt, wird ANGEGRIFFEN, nicht angeschaut
 58. Eine neue Entscheidung überschreibt NIE still eine alte Regel-Datei
 59. Am Blatt zieht NUR der Griff
 60. Was oben und unten schon STEHT, wird gemessen — nur der Rest ist ein Anteil
 61. Glas bringt seine eigene Kante mit — Kante und Schatten sind der ERSATZ, wo keines ist
 62. Glas braucht RAND, nicht nur Hintergrund — die Tab-Leiste ist eine freistehende Kapsel
 63. Ein Bildschirm zeigt nur, was für die Entscheidung HIER nötig ist
 64. Ein React-Native-`View` klippt seine Kinder NICHT — geklippt wird auf die Höhe, die man SIEHT
 65. Die Reihenfolge des Feeds ist die ENTFERNUNG — und `sort.ts` trägt ZWEI Entscheidungen von Ian, nicht eine
 66. Ein `start`/`end` schlägt ein `left`/`right`, egal wer später kommt — und Web verrät es nicht
 67. Auf dem Bezirks-Vollbild steht nichts außer Karten, Bar, Zurück und dem Bezirksnamen
 68. Was der Standort darf, steht in `features/posts/standort.ts` und nirgends sonst
 69. Wer ich bin, kommt aus der SITZUNG — nie aus einer Konstante
 70. Was die Rechteliste verbietet, macht GENAU EINE Funktion — und ein fehlender `grant` ist eine Zusage, keine Lücke
 71. Ein Sicherheitsnetz gegen den Doppelklick ist KEINES gegen zwei Verbindungen
 72. Ein Zeitstempel aus der Datenbank wird GETAUFT, bevor ihn jemand vergleicht
 73. Eine aufgelöste Gruppe wird nicht gelöscht, sie HÖRT AUF — und gefragt wird mit `istAufgeloest()`
 74. Es gibt EINEN Schalter für Anmeldung und Daten, und er heißt `ANMELDE_QUELLE`
 75. Ein Realtime-Ereignis ist ein SIGNAL und wird nie gelesen
 76. Was dasteht, wenn die Daten nicht kommen, steht in `data/quelle.ts`
 77. Wer den Torwächter liest, nimmt `torwaechterZeigt()` — nie `zustand === 'an'`
 78. Was beim ERSTEN Konto gefragt wird, steht in `features/auth/konto.ts`
 79. Ein abgeleiteter Wert, der `unique` sein muss, wird GESCHRIEBEN und der Fehler als Antwort genommen
 80. Die Startfläche aus `+html.tsx` hängt am TORWÄCHTER, nicht am Laden der Daten
 81. Einen Bezirk gibt man an, man wählt ihn nicht — `SsBezirkFeld`, nie 23 Chips
 82. Eine Längenbegrenzung an einem Eingabefeld ist eine ANNAHME — und `maxLength` schneidet stillschweigend ab
 83. Ein Prüfstand fasst NUR seine eigenen IDs an — und jede Zählung darin auch
 84. Was der Bildschirm macht, während geschrieben wird, steht in `data/schreiben.ts` — und „Zurückrollen" gibt es nicht
 85. Am echten Supabase bekommt JEDE neue Tabelle in `public` alle Rechte — eine Rechteliste gilt erst nach einem `revoke`
 86. Ein Prüfstand, der SCHREIBT, schreibt jede erzeugte ID sofort mit
 87. „Es wird geladen" und „es wird NACHgeladen" sind zwei Lagen — gefragt wird mit `ladeSichtFuer()`, nie mit `laden.zustand === …`
 88. Was ein Profilbild ist und wer es sehen kann, steht in `features/social/bild.ts` — und bei einem OFFENEN Bucket schützt nur der NAME
 89. In `storage` gibt es nur EINEN Riegel, und ein SQL-`delete` gibt es gar nicht
 90. Ein Bild vom GERÄT kommt als base64 herein, nie über seine `uri` — und der Typ ist IMMER `image/jpeg`
 91. `@supabase/storage-js` nimmt auf React Native KEINEN `Blob` — und die Größenangabe muss danebenstehen
 92. Ein Prüfstand, der Beispiele AUSWÄHLT, muss die Eigenschaft erzwingen, an der der Fehler hängt — sonst prüft er den Zufall
 93. Bei Apple und Google gibt es KEINEN Nonce — und das ist gemessen, nicht vergessen
 94. Ein Anmeldeweg ist eine Frage an das GERÄT, nicht an die Plattform — und die Antwort ist ein Pflichtfeld
 95. Eine ABLEITUNG von `ANMELDE_QUELLE` steht NIE in `anmeldung.ts` — sie steht dort, wo ihre Frage gestellt wird
 96. Was am Gerät gilt, entscheidet der Schalter — und `deploy.sh` bewacht ihn seit dem Tag, an dem das WARNSIGNAL wegfiel
 97. Ein „schon gesehen" gehört in `lib/merker.ts` / `.native.ts` — und bedeutet auf den zwei Plattformen absichtlich VERSCHIEDENES
 98. Zwei Spalten, die auf dieselbe Tabelle zeigen, werden GEGENEINANDER geprüft — nicht je gegen einen festen Wert
 99. Ein Sigil gehört der ANZEIGE — `handleText()` aus `lib/handle.ts`, nie `@{person.handle}` im Screen
100. Was eine Meldung ist und wie schnell sie beantwortet wird, steht in `features/safety/meldung.ts` — und das Werkzeug LIEST sie, statt die Zahl zu wiederholen
101. Auf React Native gibt es kein `globalThis.crypto` — und eine Prüfumgebung, die REICHER ist als das Gerät, beweist nichts
102. Ein Fehler, der KEIN `SchreibFehler` ist, verschwindet spurlos — und `onPress={async …}` ist das Loch, durch das er geht
103. Ein PROGRAMMfehler hat einen Ort, und er steht in `lib/programmfehler.ts`
104. In Postgres darf `PUBLIC` jede neue Funktion AUSFÜHREN — ein fehlender `grant` ist bei Funktionen KEINE Zusage
105. `deploy.sh` hat VIER Wächter, und jeder deckt genau eine Frage — wer einen anfasst, liest zuerst, was er allein trägt
106. Ein rundes BILD gibt es nicht — rund ist das FENSTER, und wo das Quadrat liegt, steht in `features/social/zuschnitt.ts`
107. Was die App an Daten sammelt, steht in `_FUER_IAN/DATENSCHUTZ_ETIKETT.md` — und der Code sagt, was drinstehen MUSS, nicht umgekehrt
108. Der Passwort-Weg gehört EINEM Konto — und der Riegel steht in `demoAnmelden()`, nie im Bildschirm
109. Eine Demo-Welt in der ECHTEN Datenbank ist `followers`, nie `public` — und die Adresse des Demo-Kontos endet auf `.invalid`
110. Was Apple über das ALTER fragt, steht in `_FUER_IAN/ALTERSFREIGABE.md` — und die NEIN-Antworten sind die gefährlichen
111. Was eine Zustimmung ist und welcher FASSUNG jemand zugestimmt hat, steht in `features/auth/zustimmung.ts` — und der Riegel sitzt in `profilAnlegen()`, nie im Bildschirm
112. Eine Ecke wird mit `ecke.*` gerundet, nie mit blankem `borderRadius` — und `ecke` ist ein blankes Objekt, kein `StyleSheet.create`
113. Was beim Drücken passiert, steht in `theme/druck.ts` — und nirgends sonst
114. Ein Post sagt, WO er steht — `umgebung`, nie ein `mitRahmen`-Boolean; und der Kategoriename kommt aus `CATEGORIES`, nie aus `post.category`
115. Was die App SPÜREN lässt, steht in `lib/haptik.ts` / `.native.ts` — und die Funktionen heißen nach dem ANLASS, nie nach der Stärke
116. Was der Treffen-Zähler zählt, steht im TRIGGER `treffen_buchen` (0012) — nie in einer Funktion und nie in der App
117. Eine ZAHL an einem Tab gibt es nur, wo uns ihre Schriftfarbe gehört — sonst ist es ein Punkt
118. Das TEMPO einer Bewegung steht in `lib/bewegung.ts` — benannt nach dem ANLASS, nie nach der Dauer
119. Was beim Drücken passiert, kommt aus `useDruck(art)` — und `'glas'` ist die Art ohne Deckkraft (Regel 61)
120. Ein Auf- und Zuklappen MISST seine Höhe (`useKlappe`) — `LayoutAnimation` ist auf iOS unter Fabric nur bedingt an
121. Wo Apple die Leiste selbst zeichnet, bleibt Glas; was wir danebenstellen, ist matt (`GLAS_AN`)
122. Wie genau die Bezirksgrenzen sind, steht in `bezirke-bauen.py` — und ein grobes RASTER spart NICHTS
123. Ob die Karte Zahlen zeigt, steht in `ZAHLEN_AN` — und ohne sie trägt die FARBE die Grenze „leer / nicht leer"
124. Welcher EINE Bezirk gewählt ist, sagt `gewaehlterBezirk()` — nie eine zweite Ableitung
125. Was der App Store an TEXT zeigt, steht in `scripts/storetexte.md` — und jede ADRESSE darin wird angerufen, bevor sie zu Apple geht
## Fallen — Index

> **Volltext: [`_gedaechtnis/FALLEN.md`](_gedaechtnis/FALLEN.md).** 257 Stück, jede schon
> einmal einen Abend gekostet — die meisten stammen aus ACTA (`17_Tennis_Optimma`), der
> Rest aus diesem Projekt. Hier steht nur der Titel; **die Diagnose steht im Volltext.**
>
> 🔴 **Die Zahl ist gemessen, nicht fortgeschrieben** (2026-10-20: **257**; am
> 2026-09-28 standen hier 213 bei 226 gezählten) — *eine Warnung mit einer ZAHL darin
> veraltet genauso still wie das, wovor sie warnt.* Die Messstelle, damit die nächste
> Zahl nicht wieder geraten wird:
>
> ```bash
> python3 -c "s=open('CLAUDE.md',encoding='utf-8').read(); i=s.index('## Fallen — Index'); r=s[i:]; print(sum(1 for z in r[:r.index(chr(10)+'---'+chr(10))].splitlines() if z.startswith('- ')))"
> ```

- Große Display-Fonts clippen auf iOS
- SafeArea auf Tab-Screens:
- Jeder Ordner in `(tabs)/` wird automatisch ein Tab
- Native Module brauchen einen neuen EAS-Build
- Ein `ScrollView` neben einer `FlatList` fällt auf Höhe 0 zusammen
- `StyleSheet.absoluteFillObject` gibt es in React Native 0.86 nicht mehr
- `pointerEvents` gehört in den `style`
- Zwei `Date.now()`-Aufrufe können dieselbe Millisekunde treffen
- `PanResponder` gibt die Geste her, wenn jemand fragt
- Ein Browser schickt nach jedem Ziehen zusätzlich ein `click`
- `flex: 1` heißt in React Native `flexBasis: 0`, im Browser `auto`
- Zwei Stilwerte, die einzeln stimmen, ergeben zusammen den Fehler
- `react-native-web` kennt `experimental_backgroundImage` nicht
- `as const` an einem Standardwerte-Block friert `useState` ein
- Symbol links, zweizeiliger Text daneben: Das Symbol landet an der zweiten Zeile
- In einem Template-Literal gibt es keine Kommentare
- Der statische Web-Export zeigt einen Zustand, den es am Gerät nie gibt
- Der `<title>` war leer und `lang` stand auf `en`
- `string | null` erzwingt in JSX gar nichts
- Eine Summe von Zeichencodes ist kein Hash
- `<svg>` typecheckt in einer `.tsx`, läuft aber nur auf Web
- Ein Union-Typ ist ein Werkzeug, kein bloßer Typ
- Ein Icon in einer Textzeile setzt sich auf die Grundlinie
- Ein Filter, der seine eigene Auswahlliste füttert, sperrt sich selbst ein
- `normalize('NFD')` und `\p{Diacritic}` sind auf Hermes nicht verlässlich
- Ein Typ WEITER zu machen zeigt der Compiler nicht an
- Eine Lockerung kann man auch ENG bauen
- Zwei Regeln, die einzeln richtig sind, ergeben zusammen einen falschen SATZ
- Eine Interpolation mit einer Spanne der Breite null liefert den EXTREMWERT, nicht die Mitte
- Eine `AnimatedInterpolation` ist ein Kanal, kein Wert — ein falscher Anfangswert bleibt stehen
- Ein Metro-Hash ist kein „hat sich etwas geändert"-Test
- Ein `flex: 1`-Kasten mit absolut positionierten Kindern hat keine Mindesthöhe
- Ob ein Knopf verdeckt ist, sagt `document.elementFromPoint`
- Ein Union-Typ schützt nur die Props, die ihn tragen
- Geometrie prüfen ist nicht hinschauen
- Die Prüfung auf durchgerutschte Icon-Namen ist eine TEXT-Prüfung
- `elementFromPoint` sagt, ob etwas getroffen wird — nicht, ob das richtig ist
- Entwickler-Notizen in JSX-TEXT sind öffentlich
- Ein Screen weiss nicht, was im Bild ist
- Zwei Bausteine, die einzeln stimmen, geben zusammen zwei Antworten auf dieselbe Frage
- `onLayout` misst relativ zum ELTERN-Element und meldet auf Web erst nach dem Zeichnen
- Eine Fabrik-Funktion, die ein Ref anfasst, ist ein Lint-Fehler
- Ein NEUER Typ ist kein Netz — nur eine Verengung ist eins
- `SsSegment` schneidet Beschriftungen ab, ohne sich zu beschweren
- Eine Regel, deren GRUND wegfällt, hinterlässt ihre Wirkung
- `scrollWidth > clientWidth` findet abgeschnittenen Text
- Eine Auswahl-Spanne, die 80 % ihrer Breite an niemanden vergibt, ist keine
- Ein Regler, auf den man nur klickt, ist nicht geprüft
- Eine Regel, die nichts vorfindet, sieht aus wie eine Regel, die tut
- Eine relative Zeitangabe in Fake-Daten braucht einen relativen PARTNER
- Eine Farbe hat in diesem Projekt eine Bedeutung, nicht nur einen Kontrastwert
- Ein `click` auf einen Wischstapel-Knopf ist keine Wisch-Prüfung, aber auch keine verlässliche Navigation
- `100dvh` ist auf dem Handy keine verlässliche Antwort, `visualViewport` schon
- Ein Fehler, den man am Mac nicht sieht, wird am Screenshot GERECHNET
- Ein Build-Protokoll darf nie durch `tail` laufen
- Ein Simulator-Build braucht keine Apple-Signatur — ein Gerätebuild schon
- Was wie ein Neustart aussieht, ist oft keiner
- Benachbarte Flächen einzeln zu vereinfachen reißt Lücken
- Der Schwerpunkt einer Fläche liegt oft nicht IN ihr
- `gestureState.dx/dy` ist bei mehreren Fingern der MITTELPUNKT
- Eine feste Höhe ist auf einem kleinen Schirm eine ganz andere Höhe
- Der Web-Export und `visualViewport` können ein Bild verfälschen, ohne dass am Code etwas falsch ist
- `box-none` vererbt sich im Browser anders als auf dem Gerät
- Ein Prüflauf, der das Neue anfasst, misst das Neue und nicht das Alte
- Eine gerechnete Zahl braucht die Angabe, welcher Fall sie ist
- Eine Zoomstufe von `react-native-maps` ist nicht die Zoomstufe aus der Formel
- Drei aufgeschriebene Möglichkeiten sind noch keine drei
- Fast Refresh behält `useState` — ein Anfangswert ändert sich davon nicht
- Ein Klick OHNE jede Bewegung ist im Prüfbrowser kein Tipp
- Ein Anteil kann nicht ausweichen, ein gemessener Deckel schon
- Zwei Größen mit fast gleichem Namen sind der Fehler, den man nur beim Lesen findet
- Ein Native-Baustein ist vielleicht schon da
- Ein Bild, das falsch aussieht, ist noch kein Fehler
- Kamerabefehle an `react-native-maps` verpuffen still vor `onMapReady`
- `npx expo run:ios` gibt EXIT 0 zurück, auch wenn `xcodebuild` darunter gescheitert ist
- Die Team-ID steht im OU-Feld, nicht in der Klammer
- `ios/` ist git-ignoriert (CNG) — was dort eingetragen wird, ist flüchtig
- `CoreDeviceError 12040` heißt fast immer: Das Handy ist GESPERRT — nicht, dass Xcode zu alt ist
- Das Disk-Image braucht man zum DEBUGGEN, nicht zum INSTALLIEREN — und für einen Gestentest ist ein RELEASE-Build ohnehin der richtige
- Eine WEB-Einstellung hat den iOS-Release-Build zerlegt — und im Debug fällt so etwas nie auf
- Der BAUPLATZ darf nicht in iCloud liegen — der Quellcode schon
- Ein gescheiterter Build hat nicht immer eine `error:`-Zeile
- Ein Viewport-Wechsel im Prüfbrowser ist KEIN Tastatur-Test — die App merkt ihn nicht
- `scrollToEnd` landet in diesem Projekt 16 px vor dem rechnerischen Ende, und das ist richtig so
- `minZoomLevel` wird in `react-native-maps` auf iOS NACHGERECHNET — und die Rechnung kennt `mapPadding` nicht
- `isGesture` gibt es in `react-native-maps` nur für Google Maps
- „Steht die Karte auf ihrem Grundausschnitt?" ist NICHT dieselbe Frage wie „hat jemand sie angefasst?"
- Ein Screenshot trägt eine FASSUNG, und die ist erst einmal unbekannt
- Der Simulator lässt sich fernsteuern — die Umrechnung misst man an einer Fläche, die in BEIDEN Bildern vorkommt
- Ein ungenutzter Parameter ist einer, den nie jemand geprüft hat
- Ein Sortierer, den man nur in EINER Stellung sieht, ist nicht geprüft
- Ein echtes Neuladen setzt den Prototyp-Speicher zurück, eine Client-Navigation nicht
- Ein Beleg auf der falschen Plattform ist kein Beleg
- Ein Effekt, der nicht zu sehen ist, ist nicht dasselbe wie ein Effekt, der nicht läuft
- Der Simulator lässt sich nur mit Bedienungshilfen-Berechtigung antippen
- Fast Refresh übernimmt eine geänderte Position im `tabBarStyle` NICHT
- `pod install` verlangt inzwischen `cmake` — und meldet den Fehlschlag mit EXIT 0
- Ein `expo prebuild` OHNE `--clean` wirft die Signatur-Zeilen genauso weg
- Ein `await import(...)` wird im Dev-Server zu einem nachgeladenen Brocken
- Ein schlafender Mac-Bildschirm nimmt dem Simulator sein FENSTER
- Beim ABBAU eines Navigators schreibt `expo-router` die Adresse neu — auf die erste Route im Verzeichnis
- Ein Prüfklick, der „danebengeht", hat oft eine Entscheidung getroffen
- Ein Haken je LISTENZEILE abonniert den Speicher je Zeile
- Eine Prüfung mit Backticks in doppelten Anführungszeichen misst NICHTS und meldet grün
- `perform` gibt es nur INNERHALB von plpgsql
- Eine Prüfung, die eine BEDEUTUNGSÄNDERUNG nicht merkt, prüft die Umsetzung
- Ein veraltetes Metro-Bündel meldet einen Fehler, den es nicht gibt
- Ein `import type` erzeugt keine Abhängigkeit — das macht Regel-Dateien einzeln prüfbar
- `-allowProvisioningUpdates` holt nur ein neues Profil, wenn GAR KEINES passt — ein fast abgelaufenes ist ihm lieber als keines
- Ein Zertifikat und ein Profil laufen verschieden ab, und nur eines davon war je das Problem
- Die Publication `supabase_realtime` ist in einem frischen Projekt LEER — und ein Abo darauf verbindet sich trotzdem sauber
- „Database error querying schema" von GoTrue heißt fast immer: acht `NULL`s in `auth.users`
- Ein Wächter hinter einem anderen ist ein ungeprüfter Wächter
- `n_live_tup` ist ein SCHÄTZWERT, kein Zähler
- Ein Abräumen, das den Zustand eines GESCHEITERTEN Abräumens nicht aufräumen kann, ist nur beim Schönwetter-Lauf vollständig
- Ein verwaister Playwright-Lock sieht aus wie ein laufender Browser
- `auth-js` fällt ohne `localStorage` STILL auf Arbeitsspeicher zurück
- Ein ESM-Import in blankem Node braucht die `.js`-Endung, tsc schreibt sie nicht
- Ein Prüfstand, der eigenes `node_modules` braucht, gehört INS Projekt
- Ein Screenshot beantwortet nicht, was man ihn fragt
- Ein Playwright-Lock ist NICHT immer verwaist
- `signInWithOtp` nimmt bei einem NEUEN Konto die Vorlage „Confirm signup", nicht „Magic Link"
- Ein Kommentar, der eine Sicherheitszusage begründet, veraltet lautlos
- Eine Prüfung mit `count(*)` über eine ganze Tabelle prüft die Tabelle, nicht sich selbst
- Ein Prüfstand darf neben echten Daten laufen — der Beleg ist nicht sein grüner Lauf
- Supabase Realtime verliert nach einer Ruhepause das ERSTE Ereignis — und meldet trotzdem `SUBSCRIBED`
- Ein Mechanismus, den man im fremden Quelltext FINDET, ist eine Hypothese
- Zwei Konfigurationen nacheinander zu messen misst auch die Reihenfolge
- Ein `grant` in einer Migration NIMMT am echten Supabase nichts weg
- Ein Wächter, der auch Dateien prüft, die niemand öffnet, sperrt zu viel
- Ein falscher Enum-Wert meldet sich als `22P02` und ist ein guter Beleg
- Ein Playwright-Lock ist NICHT immer verwaist — und diesmal war es keines
- Zwei Screenshots im gleichen Zustand vergleichen, nicht zwei Screenshots
- Eine Attrappe kann auch SCHWÄCHER sein als das Original — und das ist die gefährlichere Richtung
- Eine Migration, aus der man eine Zeile HERAUSNIMMT, nimmt sie am Server nicht zurück
- Eine gelöschte Datei ist weg, ihre ADRESSE antwortet trotzdem
- `getBucket()` meldet „Bucket not found", wenn man ihn nicht sehen DARF
- Es gibt ZWEI Knöpfe mit der Aufschrift „Verstanden", und sie tun Verschiedenes
- Eine Prüfung, die NAMEN aufzählt, merkt nicht, wenn etwas dazukommt
- `UID` ist in zsh reserviert
- Ein Pixelvergleich braucht eine Gegenprobe GEGEN SICH SELBST
- Länge ist keine Geheimhaltung
- Ein Wächter, der eine ÄHNLICHE Frage stellt, ist kein Wächter
- Ein `403` auf mehreren Endpunkten heißt NICHT „der Token kann gar nichts"
- Eine Einstellung ist angenommen, bevor sie gilt — und eine Prüfung, die zu früh fragt, ist ein Fehlalarm
- Apples `.p8` ist der Stempel, nicht das Dokument
- Supabase gibt eingetragene Geheimnisse als ABDRUCK zurück, nicht als Wert
- Ein Prüfstand kann eine Ordnung verlangen, die seine eigene Schwesterprüfung ZERSTÖRT
- Eine ENTSCHEIDUNG kann von keiner einzigen Prüfung bewacht sein, und das sieht man nur, indem man die verworfene Möglichkeit BAUT
- Ein Promise ist immer truthy — `tsc` sagt dazu NICHTS
- Eine Signatur von synchron auf asynchron zu ändern ist eine LOCKERUNG
- Ein Prüfstand, der einen REPO-ZUSTAND voraussetzt, wird nach der ersten geplanten Änderung abgeschaltet statt gelesen
- Die Quelle NICHT anfassen, während ein Gerätebuild läuft
- Ein `update … returning` in psql meldet Erfolg, auch wenn es nichts getan hat
- Ein Gegenproben-Aufbau, der Fehler verschluckt, kann NUR falsche Entwarnung geben
- Ein Wächter, der EINE Datei prüft, während drei geladen werden, deckt zwei nicht ab
- Eine Liste von Dateinamen in einem Skript wird irgendwann nicht nachgezogen
- Zweimal die STILLE repariert, bevor die URSACHE gesucht war
- Ein `main.jsbundle` lässt sich nach dem eigenen Code durchsuchen — in ZWEI Kodierungen
- Ein neuer Import in einer Regel-Datei bricht JEDEN Prüfstand, der sie lädt — und das merkt nur, wer ihn laufen lässt
- Ein Prüfstand OHNE Alias-Wächter stirbt mit einer Meldung, die nach kaputtem Node aussieht
- Ein `sed` auf einen Wert trifft auch den KOMMENTAR daneben
- Eine Gegenprobe, die aus dem FALSCHEN Grund rot ist, belegt gar nichts
- `find … | grep -v …` unter `set -euo pipefail` tötet das Skript STUMM, sobald nichts übrig bleibt
- Ein Export erzeugt ZWEI Sorten Dateien, und nur eine davon ist eine Adresse
- Expo-Docs versioniert lesen
- Ein `asset.width` vom Bildwähler darf `0` sein — und die EXIF-Drehung vertauscht Breite und Höhe
- `geraet-bauen.sh` macht KEIN `prebuild` und KEIN `pod install` — ein neuer nativer Baustein kommt so nie im Xcode-Projekt an
- React Native kennt keine Maske — ein Kreis entsteht aus einem RING der doppelten Kantenlänge
- Eine Textsuche mit NULL Treffern beweist nichts — sie braucht die Gegenprobe im selben Ordner
- Eine Prüf-Erwartung, die BEQUEMLICHKEIT verlangt, prüft nicht die Regel
- Ein Prüfstand mit Gegenprobe legt eine Kopie von `src/` INS Projekt — und `.gitignore` zählte die Namen einzeln auf
- Ein unquotiertes Heredoc gibt der SHELL den ganzen SQL-Text — und die Behebung, die man zuerst hinschreibt, zerlegt das Skript
- Ein Wächter, der eine SCHREIBWEISE aufzählt, merkt nicht, wenn dieselbe Sache anders geschrieben dazukommt
- Ein Wächter, der die eigene BEGRÜNDUNG für den Verstoß hält, wird abgeschaltet statt gelesen
- Solange der Torwächter zeigt, gibt es den `Stack` NICHT — ein `router.push` wechselt die Adresse und zeigt nichts
- Eine Warnung mit einer ZAHL darin veraltet genauso still wie das, wovor sie warnt
- Wer NUR Dateien ausserhalb des Repos ändert, kann nicht committen — der pre-commit-Hook spiegelt erst DANACH
- Ändert eine Migration KEINE geprüfte Zahl, kann auch keine geprüfte Zahl belegen, dass sie drin ist
- Eine Prüfung, die nur ZÄHLT, weiß nicht, was sie gezählt hat — die Zahl findet Verlust, die Namen finden Verwechslung
- Eine Meldung, die den eigenen Ablauf nicht kennt, ist keine Auskunft — auch nicht nach der Reparatur
- Ein `StyleSheet.create`-Eintrag lässt sich nicht verlässlich spreaden
- `npm run geraet` fragt zurück — im Hintergrund stirbt es daran stumm
- Ein neues Expo-Modul braucht KEIN `prebuild` — `pod install` reicht, und das rettet die Signatur
- Ein `useEffect` mit leerer Liste feuert auch im Leer-Zustand des Screens
- Ein Prüfstand, der sich nur HINTERHERräumt, ist nach dem ersten roten Lauf unbrauchbar
- `unique (post_id, from_user_id)` macht den naheliegenden Farm-Angriff unmöglich — und täuscht über den echten hinweg
- `security import` meldet „wrong password?", wenn OpenSSL 3 die .p12 geschrieben hat — die Ursache ist der MAC-Algorithmus, nicht das Passwort
- Ein Skript, das an einer Stelle abbricht, hat die Schritte DAVOR schon getan
- Ein laufendes Shell-Skript zu ÄNDERN zerlegt es mitten im Lauf — und der Fehler steht in keiner Fassung der Datei
- Eine dokumentierte ZAHL ohne ihre Messstelle ist nicht reproduzierbar — und das merkt man erst, wenn man sie braucht
- Ein iPhone-Screenshot ist oft 16 Bit — und die PNG-Filter rechnen auf BYTES
- Ein Testbild, das den Fehler nicht ERZWINGT, prüft nichts — und `wert × 257` ist genau so eines
- Ein Abbruch, der nur so HEISST
- Ein Anker, der mit der Arbeit mitwandert, ist kein Anker
- Debug-App und Release-App heissen beide `SimplySocial.app` — nach `simctl install` ist dem Bündel die Herkunft nicht mehr anzusehen
- Ein Debug-Build ohne laufenden Metro zeigt den roten Kasten „No script URL provided" — mit 822 Farben und damit ein „gültiges" Bild
- `ioreg -n IODisplayWrangler` hat auf Apple Silicon keinen `IOPowerManagement`-Eintrag
- `awk '… {print; exit}'` in einer Pipe tötet ein Skript unter `set -euo pipefail`
- `CODE_SIGNING_ALLOWED=NO` nimmt einem Simulator-Build die ENTITLEMENTS — und damit den Schlüsselbund
- `keychain-access-groups` lässt sich im Simulator nicht nachrüsten
- `simctl launch` scheitert laut — aber nur, wenn jemand zuhört
- Ein Aktualitäts-Wächter, der nur die QUELLE kennt, merkt eine geänderte BUILD-KONFIGURATION nicht
- Ein Fehler aus Schritt ZWEI, der durch die Fehlerübersetzung von Schritt EINS läuft, wird zur Lüge
- Ein `osascript`-Klick, der ein UI-Element zurückgibt, ist noch kein Klick
- `screencapture -R` mit der Fenstergeometrie eines Programms knipst das OBERSTE Fenster an dieser Stelle
- `timeout` gibt es auf macOS nicht
- Ein `<Badge>`-Element ohne Kind zeichnet einen PUNKT, statt nichts zu zeichnen — und die Doku am Typ sagt das Gegenteil
- Auf iOS gehört einem die Schriftfarbe eines Tab-Badges NICHT
- Ein `block()`, der geschweifte Klammern zählt, gibt die PARAMETERLISTE zurück
- Ein Prüfstand, der seine Gegenprobe durch ÄNDERN der Quelle fährt, darf nicht während eines Gerätebuilds laufen
- Ein Screenshot, über dem ein Vollbild liegt, beantwortet keine Layout-Frage — die ZAHLENREIHE schon
- Ein Änderungs-Skript, das seine Häkchen VOR dem Schreiben druckt, lügt bei jedem Abbruch
- `psql` ersetzt `:'variable'` weder bei `-c` noch in einem `$$`-Block — nur über `-f` und stdin
- Es gibt keine Buchstaben nach `f` — eine UUID ist HEX
- Eine Wegwerf-Datenbank in `/tmp` überlebt macOS' Aufräumen nicht — und das Skript prüft nur, OB das Verzeichnis da ist
- `npx prettier` ohne Projekt-Konfiguration ist kein Formatierer, sondern eine Umschreibung
- `tsc` löst `@/lib/tabs` IMMER auf die Web-Datei auf — eine `.native`-Fassung, die etwas WEGLÄSST, ist am Mac unsichtbar
- Die `Info.plist` im gebauten Bündel ist kein Anker für „wann wurde gebaut"
- „Build 2 · VALID" beantwortet nicht, ob der Build an der VERSION hängt
- Der Ruhebildschirm nimmt dem Simulator sein FENSTER — und eine Helligkeitsmessung merkt das nicht
- `pgrep -f "<App>.app/<App>"` findet die App auf JEDEM laufenden Simulator
- Eine Prop, die Rettung ANBIETET, rettet nur die, die sie setzen
- Apple verteilt die Store-Texte auf ZWEI Ressourcen, und eine davon überlebt jede Version
- Eine tote Adresse im Store-Eintrag ist schlimmer als ein leeres Feld
- Eine Landing-Page, die einen PROTOTYP bewirbt, ist kein Support-Link
- Ein `pkill -f` mit breitem Muster erwischt fremde Prozesse — ein Kommentar ist kein Riegel
- Ein Chrome-Screenshot unter ~500 px Breite ist ein AUSSCHNITT, kein Rendering in dieser Breite
- Ein Wächter, der bei „nichts zu tun" aufhört, beantwortet die falsche Frage
- Ein Wächter, der eine Zusage an Apple schützt, wird VERENGT — nie gelockert
- Ein Homebrew-Upgrade zieht `python3` auf eine Version OHNE `jwt` — und eine Prüfung, die Fehler schluckt, meldet dann „frei"
- Gratis-Supabase pausiert nach ~einer Woche ohne Betrieb — und verliert dabei seine ADRESSE
- Ein Zweigname mit einem LEERZEICHEN bringt jedes `git push` zu Fall — auch eines, das diesen Zweig nicht anfasst
- Eine „importfreie Regel-Datei" verträgt auch kein `import type` — der Grund ist das AUFLÖSEN, nicht die Laufzeit
- `lokal` hängt an der MENGE (Grenze um 20 Zeilen) und hängt STILL — in Blöcken von ~15 arbeiten
- Eine Qualitätsmessung, die an der SPRACHE hängt, steht bei echter Arbeit still
- Ein fest eingetippter Produktname wird NIE übersetzt — er steht in keinem Wörterbuch (harte Regel 3)
- `pathlib.write_text()` LEERT die Datei, bevor es scheitert — Ersatzpaare zuerst zusammenfassen
- Eine Umbenennung, die einen VERSPRECHENDEN Namen korrigiert, bricht die Prüfstände — bis sie grün sind fahren
- `lokal` ist für Übersetzungsblöcke unzuverlässig — 5 von 8 Läufen hingen STILL, je 5+ Minuten
- `examples` in `categories.ts` war toter Code — und das ganze Wörterbuch landet im Bündel
- `CATEGORIES`/`LEVEL_LABELS` sind modulweite Konstanten — ein `t()` darin friert die Startsprache EIN
- Ein Wächter, der eine Apple-Zusage trägt, geht beim Übersetzen rot — und wird dann VERENGT, nicht nachgezogen
- Ein eigener Union-Typ für Schlüssel ist eine Zusage, die man einlösen muss — `tsc` meldet es am AUFRUF
- Mehrzahl geht NICHT mit einem Platzhalter im Satz — zwei Schlüssel, Verzweigung beim Aufruf
- `BRAND.city` ist die TATSACHE, `marke.stadt` die ANZEIGE — und der frei gewordene Import meldet sich nur im Lint
- „Importfrei" bedeutet bei zwei Regel-Dateien VERSCHIEDENES — je nachdem, ob der Prüfstand sie EINZELN übersetzt
- Ein Wörterbuch-SCHLÜSSEL ungewickelt im JSX typecheckt sauber und zeigt `gruppenregel.privat`
- Eine gelöschte Hilfsfunktion hinterlässt Kommentare, die auf sie verweisen — nach dem NAMEN suchen
- Eine Ersetzung „erster Treffer" landet im KOMMENTAR — in Dateien mit langen Köpfen nach ZEILE ersetzen
- Jeder Wächter mit einem deutschen SATZ als Anker geht beim Übersetzen rot — alle Prüfstände danach fahren
- Zwei Messungen, die BEIDE auf ihrer Grenze stehen, können gemeinsam 45 deutsche Sätze übersehen
- Ein Wächter, der Schlüssel-Träger an `const x = fn()` erkennt, sieht eine DESTRUKTURIERUNG nicht
- `pod install` stirbt an einer ASCII-8BIT-Umgebung, und die Meldung zeigt auf Unicode statt auf die Umgebung
- Ein Ersetzungs-Helfer, der je DATEI schreibt, hinterlässt beim Abbruch die Hälfte
- Ein Wörterbuch-Schlüssel, den KEIN Bildschirm liest, landet trotzdem im Bündel
- Ein Häkchen, das ZWEI Fragen trägt, wird unerreichbar, sobald die zweite strenger ist
---

## Was Apple verlangt (Guideline 1.2, User-Generated Content)

✅ **Vollständig seit dem 2026-09-13.** Alle vier stehen seit Phase 7 in der App —
**Melden · Blockieren · Nutzungsbedingungen · Konto löschen** — sie wirken wirklich, und
seit 20.7/20.7-b werden sie auch **gelesen und beantwortet** (`npm run meldungen`).

Was für den Review noch fehlt: das Häkchen „Nutzungsbedingungen akzeptiert" beim Anmelden
— und der **Rechtstext**, den es bestätigen soll. Der fehlt **bewusst sichtbar** (roter
Kasten in `nutzungsbedingungen.tsx`): Er ist kein Text, den Claude erfinden darf
(`_FUER_IAN/OFFENE_SACHEN.md`, Punkt 1).

---

## Wegweiser

| Wenn du … brauchst | lies |
|---|---|
| den Plan, die offenen Punkte, Ians 75 Entscheidungen | `PLAN.md` (Source of Truth) |
| warum eine Phase so gebaut wurde, was sie gekostet hat | `_gedaechtnis/HISTORIE.md` |
| den Volltext einer harten Regel | `_gedaechtnis/HARTE_REGELN.md` |
| die Diagnose zu einer Falle | `_gedaechtnis/FALLEN.md` |
| was nur Ian entscheiden kann | `_FUER_IAN/OFFENE_SACHEN.md` |
| die Schritte für den Gerätedurchgang | `_FUER_IAN/HANDY_DURCHGANG.md` |
| den Demo-Zugang für Apple einrichten | `_FUER_IAN/DEMO_ZUGANG.md` |
| die Altersfreigabe bei Apple eintragen | `_FUER_IAN/ALTERSFREIGABE.md` |
| Klick-für-Klick-Anleitungen für Konten | `_FUER_IAN/KONTEN_EINRICHTEN.md` |
| einen Beleg (`am01`, `ao01`, …) | `_belege/`, Register in `_belege/LIESMICH.md` |

> ⚠️ **Diese Datei wächst nicht mehr mit.** Eine fertige Phase gehört nach
> `_gedaechtnis/HISTORIE.md` (oben anhängen), eine neue Regel mit **Volltext** nach
> `HARTE_REGELN.md` und mit **Titel** in den Index hier. Wer stattdessen hier
> weiterschreibt, baut die 406 KB wieder auf — und die nächste Sitzung beginnt wieder bei
> 150.000 Tokens.
