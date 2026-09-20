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

## 🔴 HIER GEHT ES WEITER — Zweig `dunkel` (2026-09-20, nachts)

> 🔴 **Der AKTUELLE Plan ist
> [`~/.claude/plans/kopfleiste-geradeziehen.md`](~/.claude/plans/kopfleiste-geradeziehen.md)**
> — selbsttragend, ohne Chatverlauf ausführbar. **Zuerst lesen, vor allem die
> Arbeitsregel in Teil 4: EIN Befund pro Gerätedurchgang.**
>
> Er entstand aus Ians **viertem** Durchgang zu Entscheidung 105 (eine Kopfkapsel,
> die sich bewegt). Vier Runden, drei behobene Fehler, immer noch nicht gut — und
> jeder davon war am Mac unsichtbar. Ians Entscheidung dazu: **weitermachen**,
> nicht zurückbauen.
>
> *(Der Plan davor, abgearbeitet:
> [`karte-schaerfen-und-bezirke.md`](~/.claude/plans/karte-schaerfen-und-bezirke.md).)*
> Er wird nicht automatisch geladen; ohne diesen Verweis findet ihn niemand.
> *(Die Pläne davor, alle abgeschlossen: `spicy-sprouting-balloon.md`,
> `oben-wie-unten-glas-kapsel.md`, `ich-will-liquid-glass-calm-pinwheel.md`.)*

### ✅ Der Plan ist ABGEARBEITET — vier Commits, **keiner am Gerät geprüft**

| Commit | Inhalt |
|---|---|
| `fb874e2` | **Teil 2.** Bezirksgrenzen 39-mal genauer (39,1 m → 1,0 m) · Messstelle `scripts/bezirke-messen.py` |
| `e5496ce` | **Teil 4.** Echter Wächter für Entscheidung 99 · die Warnung zu `pruef-glas` war falsch |
| `6c204e1` | **Teil 3 + 1.** Ians Entscheidungen **101–103** — keine Zahlen, Tipp direkt in den Stapel, ✕ in der Kapsel |
| `6e7ad17` | Ians Entscheidung **104** — die Kartenskala wird gleichmäßig |

🔴 **Was jetzt dran ist: ein Gerätedurchgang.** Alles oben ist am Mac belegt
(tsc sauber, `expo lint` 89, alle Wächter grün) — und am Mac ist nur belegbar,
dass nichts kaputtging. **Ob die Zacken weg sind, ob die Bezirke ohne Zahlen
auseinandergehen und ob der direkte Sprung sich richtig anfühlt, sagt nur Ian.**

```bash
cd ~/Desktop/C.C.Projekts_Ian/33_SimplySocial/simplysocial
printf '09CDB3CF-11DC-5B42-AC22-C4C99AE803A6\nj\n' | npm run geraet
```

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
| `bash supabase/pruefen/aufbauen.sh` | **171** | nichts (Wegwerf-DB) |
| `npm run pruef-schreiben` | 50 | echten Server |
| `npm run pruef-konto` | 32 | echten Server |
| `npm run pruef-bilder` | 32 | echten Server |
| `npm run pruef-lesen` | 29 | echten Server |
| `npm run pruef-anbieter` | 48 | nichts |
| `npm run pruef-bildwahl` | 47 | nichts |
| `npm run pruef-moderation` | 31 | nichts |
| `npm run pruef-sitzung` | 29 | nichts |
| `npm run pruef-programmfehler` | 25 | nichts |
| `npm run pruef-zuschnitt` | **47** | nichts |
| `npm run pruef-etikett` | 12 | nichts |
| `npm run pruef-demo` | **32** | nichts (Wegwerf-DB) |
| `npm run pruef-demoregel` | **29** | nichts |
| `npm run pruef-alter` | **16** | nichts |
| `npm run pruef-zustimmung` | **28** | nichts |
| `npm run pruef-glas` | **33** | nichts (bewacht das **Messgerät**, nicht die App — siehe oben) |
| `npm run pruef-farben` | **66** | nichts |
| `npm run pruef-kopf` | **24** | nichts (seit 20.9 auch Ians Entscheidung 99) |

Dazu: `npx tsc --noEmit` sauber · `expo lint` **89 Probleme** (Stand 20.12: 82 vorbestehend, plus vier aus den zwei neuen `pan.x.interpolate()`-Zeilen der WischKarte — jede meldet doppelt; dazu
**einer mit Namen**: `react-hooks/refs` in `BildZuschneiden.tsx` — derselbe, den
`SsWienKarte.tsx:552` trägt, und aus demselben Grund, ein `PanResponder` muss seine
Werte aus einem Ref holen. Jede ANDERE Zahl ist ein Befund, kein Rauschen).

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
   ⚠️ **Apples Fragebogen stand beim Nachsehen auf 28 × `null`** — noch trägt Ian ihn
   ein.
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
   Er startet ihn selbst: Zwei Schritte fassen den Schlüsselbund an und legen in
   seinem Apple-Konto ein **Distribution-Zertifikat** an, und das blockt der
   Auto-Mode. 🔍 **Dabei gefunden:** Build 1 (11.09.) ist bei Apple, aber im Konto ist
   keine Spur davon — kein Distribution-Zertifikat, kein Profil, `eas build:list`
   leer. Wie er signiert wurde, ist unbekannt; ab jetzt steht der Weg im Skript.
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
| **Apple-Programm auf wessen Namen?** — mit 16 üblicherweise über einen Elternteil; daran hängen Anbietername, Verträge und der Sign-in-Schlüssel | `_FUER_IAN/OFFENE_SACHEN.md` | später teuer |
| 🟢 **Die 28 Altersfragen eintragen** — App Store Connect → Allgemeine Informationen → Altersfreigabe. Alles vorbereitet, zwei Urteilsfragen liegen bei Ian | `_FUER_IAN/ALTERSFREIGABE.md` | für Phase 21 ja |
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
npm run geraet            # auf Ians iPhone spielen (iPhone entsperrt lassen)
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
## Fallen — Index

> **Volltext: [`_gedaechtnis/FALLEN.md`](_gedaechtnis/FALLEN.md).** 213 Stück, jede schon
> einmal einen Abend gekostet — die meisten stammen aus ACTA (`17_Tennis_Optimma`), der
> Rest aus diesem Projekt. Hier steht nur der Titel; **die Diagnose steht im Volltext.**

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
