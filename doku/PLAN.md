# SimplySocial — PLAN

> **Source of Truth.** Vor jeder Aufgabe lesen, danach Checkboxen aktualisieren.
> Erstellt 2026-08-31 nach einer Grill-Runde mit Ian. Alle Entscheidungen unten sind
> **von Ian bestätigt** — nicht ohne Rückfrage ändern.

**Status:** Phase 0 bis **10** erledigt (Phase 10 am 2026-09-01).
**Prototyp: https://ianfhorak-jpg.github.io/simplysocial/**
**Landing-Page: https://ianfhorak-jpg.github.io/simplysocial-landing/** Der Kernablauf der App läuft
von Anfang bis Ende und hört nicht mehr beim Konfetti auf: posten → im Feed sehen →
„Bin dabei" → bestätigen → Konfetti → **Chat**. Der Post schließt sich selbst, wenn der
letzte Platz weg ist. Seit Phase 6 gibt es **Profile und den Social-Layer**: man kann
nachsehen, wer jemand ist, folgen und entfolgen — und das verändert live den Feed.
Seit Phase 7 gibt es die **Sicherheits-Oberfläche**: melden, blockieren,
Nutzungsbedingungen, Account löschen — die vier Punkte aus Apples Guideline 1.2.

**Es gibt keinen Platzhalter mehr in der App.**

✅ **Alle drei Entscheidungen aus Abschnitt 6 sind gefallen (2026-08-31):**

1. **Feed-Sortierung: das Neueste zuerst** (6.1) — `posts/sort.ts`.
2. **Lebensdauer: bis zum Ende des Tages, mit Wahlmöglichkeit beim Posten** (6.2) —
   `posts/lifecycle.ts` + Feld „Wie lange sichtbar?" im Erstellen-Screen.
3. **Volle Plätze: Warteliste, still** (6.3) — `requests/logic.ts`. Übrige Anfragen
   bleiben stehen statt automatisch abgesagt zu werden.

✅ **Drei weitere Entscheidungen von Ian am 2026-09-01, alle eingebaut:**

4. **Chats nach dem Treffen: erst „Vorbei", dann weg** (6.4) — `chat/lifecycle.ts`.
5. **Chat-Liste: die neuen immer ganz oben** (6.5) — `chat/sort.ts`.
6. **Profil: nur, was gerade läuft** (6.6) — `posts/profil.ts`. Kein Archiv gewesener
   Treffen; das Profil ist ein Aushang.

✅ **Die siebte Entscheidung, ebenfalls am 2026-09-01:**

7. **Blockieren heißt: alles weg** (6.7) — `safety/block.ts`. Die härteste der drei
   Möglichkeiten. Der Chat verschwindet, eine bestätigte Verabredung wird abgesagt.

**Es wartet nichts mehr auf Ian.** Abschnitt 6 ist wieder vollständig abgearbeitet.

✅ **Phase 8 ist fertig (2026-09-01).** Der Prototyp hat eine Adresse, die Ian
weiterschicken kann. Jeder Bildschirm ist einzeln verlinkbar — das war die eigentliche
Arbeit, nicht das Hochladen (siehe Phase 8 unten).

✅ **Phase 9 ist fertig (2026-09-01).** Die Landing-Page steht.

🔴 **Das Feedback ist da, und es ist groß.** Ian hat am 2026-09-01 beides am Handy
angeschaut. Die Landing-Page gefällt ihm bis auf drei Kleinigkeiten. Am Prototyp hat er
etwas Grundsätzliches gesagt: **Er hat es sich als Wischstapel vorgestellt** — „wie so
ein bisschen Tinder", Karteikarten, die man wegwischt. Daraus sind **Phase 10 bis 12**
geworden, und **vier neue Entscheidungen von ihm** (Nummer 10 bis 13).

✅ **Phase 10 ist fertig (2026-09-01).** Die drei kleinen Sachen an der Landing-Page
sind erledigt: Das Laufband steht still, die drei Schritte sind neu formuliert, und
„Wer wir sind" ist ein Satz plus vier Namen. **Noch nicht deployt** — die Änderungen
liegen in `landing/`, der Push ist ein Wort.

**Nächster Schritt: Phase 11, der Wischstapel** — der große Umbau. **Vor der ersten
Zeile Code Abschnitt 1 lesen**, „Warum Feed statt Swipe": Das Argument GEGEN das Wischen
gilt weiter, es wird nur anders beantwortet. Wer nur die Aufgabe liest, baut den Feed
weg — das ist nicht gemeint. **Es wartet keine Frage auf Ian.**

---

## 1. Der Brief (entschieden, nicht mehr offen)

| Frage | Entscheidung |
|---|---|
| Was ist es? | Treff-App für Aktivitäten in Wien. **Kein Dating.** |
| Erster Schritt | Klickbarer Web-Prototyp mit Fake-Daten |
| Endziel | Echte iOS-App im App Store (Apple Developer Program hat Ian am 2026-08-31 gekauft) |
| Antwort auf einen Post | **Wischstapel** — links weg, rechts mitmachen. *Revidiert am 2026-09-01, siehe unten* |
| Nach „Bin dabei" | **Poster bestätigt zuerst**, dann erst Chat |
| Aktivitäten | **Alles** — Sport, Kaffee, Lernen, Kultur, Draußen, Kreativ |
| Startgruppe | Freundeskreis + Graphische Wien, ~50–200 Leute |
| Design | Bunt und lebendig, **dicke Buttons mit Tiefe**, **Konfetti beim Match**. Kein Maskottchen in v1. |
| Name | **SimplySocial** ist final |
| Umfang Prototyp | Kernablauf **+ Social-Layer** (9 Screens) |
| Zeit | Diese Woche (Woche vom 2026-08-31), in Runden mit Zwischen-Feedback |

### Warum Feed statt Swipe — und warum es seit 2026-09-01 BEIDES ist

**Der ursprüngliche Grund gegen das Wischen (31.08.), er gilt weiterhin:**
Ein Swipe-Deck braucht Nachschub. Bei 100 Leuten aus einer Schule gibt es vielleicht
5 Anfragen am Tag — ein Stapel, der nach drei Wischern leer ist, fühlt sich kaputt an.
Eine kurze Liste mit 5 Einträgen fühlt sich normal an.

**Warum Ian am 01.09. umgeschwenkt ist.** Er hat den fertigen Prototyp am Handy
aufgemacht und gesagt, er habe es sich anders vorgestellt: „wie so ein bisschen Tinder",
mit Karteikarten, die man wegwischt. Das ist kein Widerspruch zum Argument oben — es ist
eine andere Frage. Das Argument oben handelt davon, was passiert, wenn der Stapel LEER
ist. Es sagt nichts darüber, wie es sich anfühlt, wenn er voll ist.

**Die Lösung, die er gewählt hat: beides, mit dem Feed als Auffangnetz.** Der Wischstapel
ist der Startbildschirm — das Erste, worauf man trifft. Ist er leer, steht dort keine
leere Fläche, sondern die Liste mit allem schon Gesehenen plus der Aufforderung, selbst
zu posten. Damit gilt das Argument von oben weiter und wird beantwortet, statt
überschrieben zu werden.

**Das ist die teurere Variante, und das mit Absicht.** Ein Umschalter mehr, zwei
Ansichten statt einer. Der Grund, das zu bezahlen: Der leere Dienstag ist der Moment, an
dem jemand die App zum ersten Mal aufmacht und entscheidet, ob sie tot ist.

### Warum der Poster bestätigt
Das ist gleichzeitig das wichtigste Sicherheitsfeature (man entscheidet selbst, wen man
trifft) **und** der emotionale Höhepunkt der App (der Match-Moment mit Konfetti).
Beides in einem Schritt — deshalb wird dieser Screen zuerst richtig gebaut, nicht zuletzt.

---

## 2. Datenmodell

Landet in `src/types/models.ts`. Die Feldnamen sind so gewählt, dass sie später 1:1
Firestore-Felder werden können.

```ts
export type ActivityCategory =
  | 'sport'      // Tennis, Laufen, Fußball, Bouldern
  | 'food'       // Kaffee, Mittagessen, Kochen
  | 'study'      // Lernen, Hausübung, Projektpartner
  | 'culture'    // Kino, Konzert, Museum, Fortgehen
  | 'outdoor'    // Spazieren, Wandern, Donauinsel, Picknick
  | 'creative';  // Fotografieren, Musik, Zeichnen, Basteln

export type SkillLevel = 'any' | 'beginner' | 'intermediate' | 'advanced';
export type Visibility = 'public' | 'followers';

// ── Ab Phase 15/17 (entschieden 2026-09-02, noch nicht gebaut) ──────────────
export type AgeGroup = 'any' | '14-17' | '18-25' | '26+';

// Gruppen sind eine dritte Sichtbarkeits-Stufe, KEIN eigener Ort:
//   type Visibility = 'public' | 'followers' | { group: string }
// Der Feed bleibt EIN Feed. Warum das so entschieden wurde: Abschnitt 6, Punkt 16.

interface Group {
  id: string;
  name: string;          // "MARS Wiese Tennis"
  ownerId: string;       // bestaetigt Beitritts-Anfragen (Abschnitt 6, Punkt 17)
  memberIds: string[];
  createdAt: string;
}

// Am Post kommt dazu:  ageGroup: AgeGroup   (Voreinstellung 'any')
// Am User kommt dazu:  ageGroup: AgeGroup
//                      photoUrl?: string    — fehlt es, zeigt die App Initialen.
//                      Die ANZEIGE wird gebaut, der UPLOAD nicht (Abschnitt 7).
// Am ChatThread wird:  postId?: string      — fehlt er, ist es ein Direktchat.
//                      Die 7-Tage-Regel gilt dann NICHT (Abschnitt 6, Punkt 15).
export type PostStatus = 'open' | 'full' | 'past';
export type RequestStatus = 'pending' | 'accepted' | 'declined';

export interface Post {
  id: string;
  authorId: string;
  category: ActivityCategory;
  title: string;            // "Tennis spielen"
  district: string;         // "1220" — nur Bezirk, nie GPS
  startsAt: string;         // ISO 8601
  level: SkillLevel;
  spotsTotal: number;
  spotsFilled: number;
  note: string;             // "Hab 2 Schläger dabei"
  meetingPoint?: string;    // OPTIONAL — der Poster entscheidet
  expiresAt?: string;       // OPTIONAL — wann der Post aus dem Feed verschwindet
  visibility: Visibility;
  status: PostStatus;
  createdAt: string;
}

export interface JoinRequest {
  id: string;
  postId: string;
  fromUserId: string;
  message: string;          // "Hey, bin dabei! Passt 17:00?"
  status: RequestStatus;
  createdAt: string;
}

export interface User {
  id: string;
  handle: string;           // "@ian"
  displayName: string;
  avatar: string;           // Emoji im Prototyp, später Bild-URL
  bio: string;
  district: string;
  interests: ActivityCategory[];
  followerIds: string[];
  followingIds: string[];
}

export interface ChatThread {
  id: string;
  postId: string;
  participantIds: string[];
  lastMessageAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  sentAt: string;
}
```

**Bewusst weggelassen:** GPS-Koordinaten. Nur der Bezirk wird gespeichert — das war
Ians eigene Intuition und ist datenschutzrechtlich die richtige.

**Nachträglich dazugekommen (2026-08-31):** `expiresAt` am Post. Es folgt direkt aus
Ians Lebensdauer-Entscheidung (Abschnitt 6.2): Standard ist „bis zum Ende des Tages",
aber der Poster darf beim Erstellen kürzer oder länger wählen. Fehlt das Feld — bei
allen Fake-Daten aus `mock.ts` ist das so —, gilt der Standard. Ein Zeitstempel und
keine Aufzählung, weil Firestore später genau darauf seine Ablaufregeln setzen kann.

---

## 3. Design-System

Landet in `src/theme/`. Kein Copy-Paste von Duolingo, aber dasselbe *Gefühl*: anfassbar.

### Grundfläche (bleibt immer gleich)
```
bg          #FAF9F6   Papierweiß
surface     #FFFFFF   Karten
ink         #17191C   Text
inkSoft     #6B7280   Sekundärtext
line        #E8E6E0   Trennlinien
```

### Aktivitätsfarben (davon lebt der Feed)

*Stand 2026-08-31, nach Ians Korrektur: **Sport ist gelb, Essen grün** (vorher Grün und
Terrakotta). Alle Werte sind gegen das WCAG-Kontrastverhältnis gemessen, nicht geschätzt.*

Jede Farbe besteht aus fünf Werten. Die beiden `on…`-Textfarben kamen mit dem Gelb dazu:
weißer Text auf Gelb ist unlesbar, und Gelb auf Hellgelb kam auf 1,85:1.

| | base | soft | deep | onBase | onSoft |
|---|---|---|---|---|---|
| sport (Gelb) | `#EDA803` | `#FDF2D8` | `#A47402` | `#17191C` | `#916602` |
| food (Grün) | `#2E7D5B` | `#E6F2EC` | `#1B4A36` | `#FFFFFF` | `#2D7958` |
| study (Blau) | `#3D6BC2` | `#E4EBF8` | `#243F72` | `#FFFFFF` | `#3B68BC` |
| culture (Violett) | `#7B4FC2` | `#EDE6F8` | `#462D6F` | `#FFFFFF` | `#7B4FC2` |
| outdoor (Limette) | `#6B8C28` | `#EEF4E0` | `#435819` | `#FFFFFF` | `#5B7722` |
| creative (Magenta) | `#C23D7B` | `#F8E4EF` | `#74254A` | `#FFFFFF` | `#B63974` |

- `base` — Farbstreifen an der Karte, gefüllte Buttons
- `soft` — helle Fläche (Pillen)
- `deep` — Umriss **und** der 4px-Rand unten am Button. **Mindestens 2,0:1 gegen `base`**,
  sonst sieht man die Tiefe nicht.
- `onBase` / `onSoft` — die Textfarben darauf, jeweils mindestens 4,5:1.

**Neutrale Aktionsfarbe** (`accent` in `theme/colors.ts`), für Buttons ohne Kategorie:
base `#3E4043`, deep `#000000`, onBase `#FFFFFF`. Bewusst **kein** reines Schwarz —
zwischen `#17191C` und Schwarz liegen 1,15:1, da ist der Tiefen-Rand unsichtbar.

**Rot** (`danger`, dazugekommen in Phase 4 für „Ablehnen"): base `#C2352F`, soft
`#F8E5E4`, deep `#6E1916`, onBase `#FFFFFF`, onSoft `#A62B26`. Gleich aufgebaut wie die
Kategoriefarben, damit `SsButton` sie ohne Sonderfall verarbeitet. `status.danger` (die
Zahl am Anfragen-Tab) ist daraus **abgeleitet**, nicht noch einmal hingeschrieben.
Gemessen: Weiß auf base 5,46:1 · deep gegen base 2,12:1 · onSoft auf Weiß 7,01:1.
Der naheliegende Ton `#7A1C18` kam auf 1,92:1 und fiel damit durch.

> **Wenn eine Farbe geändert wird:** hinterher die Kontraste nachrechnen. `deep` braucht
> 2,0:1 gegen `base`, `onBase`/`onSoft` je 4,5:1. Sonst verschwindet entweder die Tiefe
> oder der Text.

### Die Signatur: Button mit Tiefe
Der wichtigste Baustein der App. Kein Schatten-Blur, sondern ein **harter Rand unten**,
der beim Drücken verschwindet:

```
Ruhezustand                 Gedrückt
┌──────────────────┐        (Button 4px runter,
│   BIN DABEI      │         Rand weg — er wird
└──────────────────┘         wirklich runtergedrückt)
 ████████████████     ← 4px in der "tief"-Farbe
```
Umsetzung (siehe Phase 1 für die Begründung der Abweichung): ein 1px-Umriss in `deep`
rundum, unten `borderBottomWidth: 4` in `deep`. Gedrückt bleibt nur der Umriss stehen
und `marginTop` gleicht die Differenz aus. JS-only, Web und nativ identisch.

### Typografie
Eine kräftige Display-Schrift für Überschriften, eine gut lesbare für den Rest.
**Achtung ACTA-Falle:** `lineHeight ≈ 1.2 × fontSize`, sonst clippt iOS die Oberlängen.

### Der Match-Moment
Konfetti mit `Animated` (kein Native-Modul): 30–40 kleine Rechtecke in den
Aktivitätsfarben, die von oben fallen und dabei rotieren. Dazu die Zeile
„Ihr seid verabredet" und der Weg direkt in den Chat.

---

## 4. Ordnerstruktur

```
33_SimplySocial/
├── CLAUDE.md              ← Überblick, wird automatisch geladen
├── PLAN.md                ← diese Datei, Source of Truth
├── _FUER_IAN/
│   ├── README.md          ← was das Projekt ist, in Ians Sprache
│   └── OFFENE_SACHEN.md   ← was nur Ian erledigen kann
├── simplysocial/          ← die App (Expo)
│   └── src/
│       ├── app/           ← Screens (Expo Router)
│       │   ├── (tabs)/    ← Start · Anfragen · Chats · Profil
│       │   ├── post/[id].tsx
│       │   ├── create.tsx
│       │   ├── match.tsx
│       │   ├── chat/[id].tsx
│       │   └── user/[id].tsx
│       ├── components/ui/ ← SsButton, SsCard, SsText, SsScreen, SsChip …
│       ├── features/      ← posts, requests, chat, social — je hooks.ts + logic.ts
│       ├── data/mock.ts   ← ALLE Fake-Daten an einer Stelle
│       ├── theme/         ← colors.ts, spacing.ts, type.ts
│       ├── types/models.ts
│       └── config/
│           ├── brand.ts     ← Name, Claim, Platzhalter-Logo
│           └── categories.ts ← Label, Emoji und Beispiele der 6 Kategorien
└── landing/               ← Landing-Page (Phase 9, nach dem Prototyp)
```

---

## 5. Phasenplan

### Phase 0 — Projekt aufsetzen ✅ *(2026-08-31)*
- [x] Expo-Projekt `simplysocial/` mit TypeScript + Expo Router anlegen
- [x] `npx expo start --web` läuft und zeigt einen leeren Screen
- [x] `src/config/brand.ts` mit Name + Claim + Platzhalter-Wortmarke
- [x] `src/types/models.ts` aus Abschnitt 2
- [x] `src/theme/` aus Abschnitt 3
- [x] `src/data/mock.ts` — 6 Nutzer, 14 Posts über alle Kategorien, 4 offene Anfragen,
      2 Chats. Realistische Wiener Bezirke und Uhrzeiten, keine Lorem-ipsum-Platzhalter.

**Was dabei entschieden wurde** (nicht im ursprünglichen Brief, aber nötig):

- **Expo SDK 57.** Das Standard-Template bringt `NativeTabs` mit — einen Wrapper um
  SwiftUI-/Jetpack-Tabs, der auf Web durch eine *zweite, separate* Implementierung
  ersetzt wird. Zwei Tab-Leisten doppelt pflegen ist der falsche Anfang. Stattdessen die
  klassischen `Tabs` aus `expo-router` — eine Implementierung, Web und iOS identisch,
  und genau die, für die die ACTA-Fallen in CLAUDE.md gelten (`href: null` usw.).
- **Native-only Pakete entfernt:** `@expo/ui`, `expo-glass-effect`, `expo-symbols`,
  `expo-device`, `expo-web-browser`, `expo-image`. Harte Regel 1 — im Prototyp bleibt
  alles JS-only, damit die Web-Version verlässlich läuft.
- **Termine in `mock.ts` sind relativ zu heute**, nicht fest eingetippt. Sonst ist der
  Feed leer, sobald Ian den Prototyp ein paar Tage später herzeigt. Posts für „heute"
  rechnen ab *jetzt* (aufgerundet auf die nächste halbe Stunde) — mit fester Uhrzeit
  wären sie am Abend schon abgelaufen und stünden trotzdem auf „offen".
- **`src/config/categories.ts` dazugekommen:** die *Wörter* zu den sechs Kategorien
  (Label, Emoji, Beispiele). Getrennt von `theme/colors.ts`, wo nur die Farben stehen —
  Aussehen und Beschriftung ändert man selten gleichzeitig.
- **Kein Dark Mode** (`userInterfaceStyle: 'light'`). Die Aktivitätsfarben sind auf die
  helle Papierfläche abgestimmt; ein zweites Farbschema wäre doppelte Arbeit an jedem
  der 9 Screens, ohne dass es den Prototyp besser beurteilbar macht.

### Phase 1 — Design-System ✅ *(2026-08-31)*
- [x] `SsButton` mit Tiefe (Varianten: primary, kategoriefarbig, ghost) + Drück-Animation
- [x] `SsCard`, `SsText`, `SsScreen`, `SsChip` (Kategorie-Pille), `SsAvatar`
- [x] Ein „Bausteine"-Screen, der alle Komponenten zeigt — damit Ian das Gefühl
      beurteilen kann, bevor 9 Screens darauf aufbauen → Route `/bausteine`
- [x] **→ Ian zeigen, Feedback einholen, bevor es weitergeht** — erledigt, siehe unten

**Die Bausteine** (alle in `src/components/ui/`, ein Import über `@/components/ui`):

| Baustein | Was er kann |
|---|---|
| `SsText` | `variant` (7 Stufen), `color`, `center`. Bringt die Zeilenhöhe immer mit. |
| `SsScreen` | Sicherheitsabstände, Hintergrund, Breitenbegrenzung. `tabScreen`, `scroll`. |
| `SsButton` | `variant` primary/category/ghost, `size` md/lg, `icon`, `block`, `disabled`. |
| `SsCard` | Optionaler Kategorie-Farbstreifen links, optional antippbar. |
| `SsChip` | Entweder `category` (Farbe+Emoji+Label automatisch) oder freies `label`. `selected`. |
| `SsAvatar` | Emoji im Kreis, `size` sm/md/lg. Farbe wird aus der Nutzer-ID gerechnet. |

**Was dabei entschieden wurde:**

- **Die Tiefe entsteht über `marginTop`, nicht über `translateY`** — anders als in
  Abschnitt 3 skizziert. Grund: der untere Rand zählt zur Höhe. Fällt er beim Drücken
  weg, schrumpft der Button um 4px und alles darunter ruckt hoch. Mit
  `borderBottomWidth: 0` **plus** `marginTop: 4` hebt sich das exakt auf.
  *Nachgemessen im Browser: Außenhöhe 58px vor und nach dem Drücken, Fläche wandert 4px.*
- **Der Ghost-Button behält beim Drücken 2px Rand** (statt 0), sonst hätte er unten ein
  Loch im Rahmen. Der Versatz ist immer die Differenz — Höhe bleibt bei jeder Variante gleich.
- **Deaktivierte Buttons behalten ihren unteren Rand**, nur in derselben Farbe wie die
  Fläche. Sie sehen flach aus, springen aber beim Umschalten nicht.
- **Karten haben bewusst KEINE Tiefe.** Wenn im Feed alles hervorsteht, sticht nichts
  mehr hervor — die Tiefe bleibt den Aktionen vorbehalten.
- **Nur ein schmaler Farbstreifen links an der Karte**, keine kategoriefarbige Fläche.
  Zehn bunte Karten untereinander wären ein Flickenteppich.
- **Avatar-Farben werden aus der Nutzer-ID gerechnet**, nicht zufällig gewählt — sonst
  sieht Lea nach jedem Neuladen anders aus.
- **Keine Großbuchstaben auf Buttons.** Die ASCII-Skizze in Abschnitt 3 zeigt
  „BIN DABEI", das war aber nur Zeichnung. „Bin dabei" liest sich freundlicher.
- **`SsButton` hat noch keine `danger`-Variante.** Wird in Phase 4 (Ablehnen) und
  Phase 7 (Blockieren/Melden) gebraucht; `status.danger` liegt in `theme/colors.ts` bereit.

**Ians Rückmeldung zur ersten Fassung — schon eingearbeitet (2026-08-31):**

1. *„Ich kann nicht ganz runterscrollen."* — Handy-Browser rechnen `100vh` gegen den
   Bildschirm **ohne** Adressleiste; die Leiste lag über den letzten Pixeln, und der
   Scroll-Bereich hielt sich für am Ende. Behoben in `src/global.css` mit `100dvh`
   (mit `@supports`-Rückfallebene). Zusätzlich gibt `SsScreen` scrollenden Screens jetzt
   grundsätzlich `insets.bottom + 48px` Luft **innen** im Scroll-Inhalt statt außen —
   sonst hätten Feed, Chat und Profil später dasselbe Problem.
2. *„Bei Bin dabei und Posten mehr Kontrast, vielleicht eine graue Umrandung, damit man
   den Schatten sieht."* — Berechtigt, und der Grund war ein Konstruktionsfehler: der
   Knopf war `#17191C`, sein Tiefen-Rand `#000000` — 1,15:1, unsichtbar. Bei fast-schwarz
   gibt es kein „dunkler" mehr. Behoben durch Aufhellen der Fläche auf `#3E4043`
   (2,0:1 gegen den Rand) **plus** Ians Umrandung: ein 1px-Umriss in `deep`, den jetzt
   alle Varianten haben. Die Messung zeigte, dass auch Blau, Violett und Magenta unter
   1,6:1 lagen — deren `deep` wurde mit nachgezogen.
3. *„Sport gelb, Essen grün."* — Umgesetzt. Machte `onBase`/`onSoft` nötig (siehe
   Abschnitt 3): auf Gelb muss der Text dunkel sein, und Gelb auf Hellgelb kam auf 1,85:1.

4. **Zwei Grüntöne — von Ian bewusst so entschieden.** Essen (`#2E7D5B`, Waldgrün) und
   Draußen (`#6B8C28`, Olivgrün) sind beide grün. Ich hatte angemerkt, dass das beim
   schnellen Scrollen durch den Feed heikel werden kann, und Terrakotta oder Petrol für
   Draußen vorgeschlagen. Ian hat sich am 2026-08-31 für „so lassen" entschieden.
   **Nicht ohne Rückfrage ändern.** Falls es sich im fertigen Feed doch beißt: ansprechen,
   nicht eigenmächtig umfärben.

### Phase 2 — Feed + Post-Detail ✅ *(2026-08-31)*
- [x] `(tabs)/index.tsx` — Feed mit Post-Karten, Kategorie-Farbstreifen
- [x] Filter: „Alle / Nur Follower" + Kategorie-Filter
- [x] `post/[id].tsx` — Detail mit allen Feldern und „Bin dabei"
- [x] Leerer Zustand („Noch nichts los in deinem Feed — poste doch selbst was")
- [x] *(nicht geplant, aber nötig)* Tab-Leiste mit vier Tabs — drei noch Platzhalter
- [x] *(nicht geplant, aber nötig)* Zustandsspeicher, damit „Bin dabei" den
      Bildschirmwechsel überlebt
- [ ] **→ Ian schreibt `features/posts/sort.ts`** (Abschnitt 6.1) — vorbereitet, offen

**Was dabei entschieden wurde:**

- **Ein eigener kleiner Zustandsspeicher** (`src/features/store.ts`, ~40 Zeilen auf
  Basis von Reacts `useSyncExternalStore`) statt Redux, Zustand oder MobX. Ab „Bin
  dabei" verändert der Prototyp zum ersten Mal Daten, und die Anfrage muss den
  Bildschirmwechsel überleben — mit `useState` im Screen wäre sie beim Zurückgehen weg
  und der Prototyp fühlte sich kaputt an. Harte Regel 1 gilt auch für Abhängigkeiten:
  jedes zusätzliche Paket ist eins, das beim ersten iOS-Build Ärger machen kann.
  **Das ist die Naht zum Backend** — später wird das Innere dieser einen Datei durch
  Firestore ersetzt, Hooks und Screens bleiben unverändert.
- **`store.ts` ist die einzige Datei, die `data/mock.ts` importiert.** Harte Regel 2
  ist damit nicht nur eine Bitte, sondern nachprüfbar:
  `grep -rn "from '@/data/mock'" src/` liefert genau einen Treffer.
- **Die Tab-Leiste kam vorgezogen.** Sie stand erst ab Phase 4 im Plan, nimmt aber
  unten Platz weg — den muss man mitsehen, wenn man den Feed beurteilt. Die drei noch
  leeren Tabs sagen ehrlich „kommt in Phase X", statt später die Leiste wachsen zu
  lassen und alles zu verschieben. Am Anfragen-Tab hängt schon die echte Zahl der
  offenen Anfragen.
- **Der Feed benutzt `FlatList`, nicht `ScrollView` + `.map()`.** Bei 14 Fake-Posts
  wäre es egal; bei 300 echten ist es der Unterschied zwischen flüssig und ruckelig.
  Folge: `SsScreen` bekommt im Feed **kein** `scroll` — eine FlatList in einem
  ScrollView verliert genau diese Fähigkeit.
- **Kopf und Filter scrollen nicht mit.** Wer filtert, will sofort weiterfiltern; ein
  Filter, den man erst wieder hochscrollen muss, wird nicht benutzt.
- **Der Filter heißt „Wem ich folge", nicht „Nur Follower".** Wörtlich wären
  „Follower" die Leute, die *mir* folgen — nützlich ist die andere Richtung. Die
  Beschriftung in Abschnitt 1 war so gemeint, aber missverständlich formuliert.
- **Die Sichtbarkeitsregel ist kein Filter.** `visibility: 'followers'` blendet den
  Post für alle aus, die dem Verfasser nicht folgen — unabhängig davon, was man
  eingestellt hat. Steht in `features/posts/hooks.ts` mit dem Hinweis, dass dieselbe
  Regel mit echtem Backend **zusätzlich** auf dem Server stehen muss: was der Browser
  ausfiltert, hat er vorher trotzdem heruntergeladen.
- **Zwei verschiedene leere Zustände.** „Filter zu eng" bekommt einen Ausweg
  („Filter zurücksetzen"), „wirklich nichts los" die Aufforderung, selbst zu posten.
  Ein Text für beides wäre in einem der zwei Fälle die falsche Antwort.
- **„Bin dabei" belegt keinen Platz.** Es entsteht nur eine Anfrage mit Status
  `pending`; `spotsFilled` steigt erst, wenn der Verfasser in Phase 4 bestätigt.
- **Die Karte im Feed zeigt Treffpunkt und Können-Niveau NICHT.** Beides interessiert
  erst, wenn man den Post ernsthaft erwägt. Die Karte beantwortet „ist das was für
  mich?", das Detail beantwortet „wie komme ich hin?".
- **Volle Posts bleiben im Feed**, aber mit 62 % Deckkraft und „Voll". Man soll sehen,
  dass etwas läuft, ohne es für eine Einladung zu halten.
- **Vorläufige Lebensdauer-Regel:** ein Post verschwindet, sobald seine Startzeit
  vorbei ist. Das ist **nicht** die Entscheidung aus Abschnitt 6.2 — die steht noch
  aus. Die Regel steht als kommentierte Funktion `istAktuell` in
  `features/posts/hooks.ts` und wandert in Phase 3 oder 4 nach `lifecycle.ts`.

**Zwei Fehler, die dabei gefunden und behoben wurden:**

1. **Die Kategorie-Pillen waren unsichtbar.** Ein `ScrollView` bringt von sich aus
   `flexGrow: 1, flexShrink: 1` mit. Neben der FlatList, die den Rest des Screens
   beansprucht, wurde die Pillenreihe auf Höhe 0 zusammengedrückt — im DOM war sie
   vollständig da, zu sehen war ein Strich. `flexShrink: 0` behebt es.
   *Merken: horizontale Pillenleisten neben einer Liste brauchen `flexShrink: 0`.*
2. **`bausteine.tsx` hatte einen toten Zurück-Knopf** — `router.back()` ohne Prüfung.
   Auf Web kann jeder Screen direkt per Adresse geöffnet werden; dann gibt es kein
   Zurück, und in der Konsole steht `GO_BACK was not handled by any navigator`. Ab
   Phase 8 ist genau das der Normalfall (Ian schickt Links auf einzelne Posts).
   Behoben mit `src/lib/navigation.ts` → `zurueckOderFeed()`, das beide Screens
   benutzen. **Jeder neue Zurück-Knopf nimmt diese Funktion.**

**Zwei Kleinigkeiten am Design-System, die dabei auffielen** (Phase 1 war abgenommen,
das hier sind Fehler, keine Geschmacksänderungen):

- `SsButton`: das Emoji wuchs bei `size="lg"` nicht mit dem Text mit, und eine
  Emoji-Glyphe zeichnet breiter als ihre Box — dadurch klebte „🙌" am „Bin dabei".
  Gemessen: 6 px Boxabstand, optisch fast 0. Behoben.
- `bausteine.tsx` war nur noch über die Adresszeile erreichbar, weil die
  Platzhalter-Startseite dem Feed weichen musste. Der Weg dorthin hängt jetzt im
  Profil-Platzhalter — **in Phase 6 mit entfernen**, es ist ein Entwicklungswerkzeug.

### Phase 3 — Post erstellen ✅ *(2026-08-31)*
- [x] `create.tsx` — Kategorie, Titel, Bezirk, Zeit, Level, Plätze, Notiz,
      optionaler Treffpunkt, Sichtbarkeits-Schalter
- [x] Vorschau der Karte, während man tippt
- [x] *(nicht geplant, aber nötig)* `SsInput` — der Baustein für Eingabefelder
- [x] *(nicht geplant, aber nötig)* Zwei Wege zum Posten: Knopf im Feed-Kopf und im
      leeren Feed
- [x] **Ian hat `features/posts/lifecycle.ts` entschieden** (Abschnitt 6.2) — umgesetzt
- [x] *(daraus gefolgt)* Feld „Wie lange sichtbar?" im Erstellen-Screen + `expiresAt`
      am Datenmodell

**Was dabei entschieden wurde:**

- **Kein Kalender und keine Uhr-Auswahl, sondern sieben Tag-Pillen und ein Zahlenfeld.**
  Die schönen Rad-Auswahlfelder von iOS sind native Module — harte Regel 1. Das ist aber
  nicht bloß der Notbehelf, nach dem es klingt: fast alles in dieser App findet heute oder
  morgen statt. Sieben Pillen decken den echten Fall in *einem* Tipp ab, ein Kalender
  bräuchte dafür drei.
- **Die Uhrzeit wird großzügig gelesen** (`parseUhrzeit` in `lib/zeit.ts`): „18:30",
  „1830", „18.30" und „18" ergeben alle dasselbe. Auf dem Handy liegt der Doppelpunkt
  auf der zweiten Tastaturebene — daran soll ein Formular nicht scheitern. Streng bleibt
  es nur bei dem, was keine Uhrzeit ist: 25:00 und 18:70 gibt es nicht.
- **Vorgeschlagen wird die übernächste volle Stunde**, nachts 10:00 am nächsten Tag.
  Ein Formular, das mit „jetzt" aufmacht, ist im Moment des Absendens schon abgelaufen.
- **Die Vorschau steht oben und benutzt dieselbe `PostCard` wie der Feed** — keine
  nachgebaute Karte, die „ungefähr so" aussieht. Eine zweite Karte wäre spätestens beim
  nächsten Feed-Umbau eine Lüge, und die Vorschau ist das Eine, was man nicht anzweifeln
  darf. Oben und nicht unten: sonst kommt man erst nach dem Ausfüllen dorthin, und dann
  ist es keine Vorschau mehr, sondern eine Bestätigung.
- **Fehler erst nach dem ersten Druck auf „Posten" — außer bei der Zeit.** Ein Formular,
  das anmeckert, bevor man angefangen hat, liest sich wie ein Vorwurf. Tag und Uhrzeit
  hat man aber gerade selbst eingestellt und sieht sie in der Vorschau stehen: „Das ist
  schon vorbei" muss genau dort auffallen und nicht erst am Ende.
- **Der Bezirk ist mit dem eigenen vorbelegt** und wird gegen die 23 echten Wiener
  Postleitzahlen geprüft (`lib/bezirk.ts`). „Vierstellig, fängt mit 1 an" hätte auch
  1000, 1234 und 1240 durchgelassen — die gibt es alle nicht.
- **`spotsTotal` zählt den Verfasser nicht mit** („Wie viele können mitkommen?").
  So stand es schon in den Fake-Daten; jetzt steht es auch im Formular.
- **Nach dem Posten geht es direkt auf den neuen Post**, nicht zurück in den Feed —
  und mit `replace`, damit der halb ausgefüllte Erstellen-Screen nicht dahinter liegen
  bleibt. Zurück führt von dort in den Feed. Im Feed würde der neue Post derzeit ganz
  unten landen (siehe `sort.ts`), und „hat es geklappt?" wäre unbeantwortet.
- **Der Weg zum Posten steht im Feed-Kopf, nicht als schwebender Knopf.** Ein
  schwebender Knopf verdeckt immer genau die Karte, die man gerade liest — und unten
  ist schon die Tab-Leiste. Der leere Feed bekommt zusätzlich einen großen Knopf: dort
  hat der Bildschirm nichts Besseres zu tun, und die Aufforderung „poste doch selbst
  was" ohne Weg dorthin wäre eine leere Ansage.

**Nachtrag am selben Tag — Ians zwei Entscheidungen sind eingebaut:**

- **Der Feed sortiert nach dem Neuesten** (Abschnitt 6.1). Sofort sichtbar: ein frisch
  geschriebener Post steht ganz oben statt ganz unten.
- **Ein Post bleibt bis zum Ende seines Tages** (Abschnitt 6.2) — und der Poster darf
  abweichen. Daraus wurde mehr als eine Zeile:
  - `Post` hat ein optionales **`expiresAt`** bekommen (Abschnitt 2). Leer = Standard.
  - `lifecycle.ts` hält die drei Möglichkeiten samt Beschriftung an **einer** Stelle
    (`SICHTDAUERN`); der Erstellen-Screen zeigt nur an, was dort steht. Sonst hätte
    das Wort im Screen und die Rechenregel in der Logik gestanden — zwei Orte, die
    irgendwann auseinanderlaufen.
  - Der Screen zeigt beim Umschalten mit, **wann** der Post verschwindet
    („bis Morgen 23:59"). Eine Auswahl, deren Folge man erst später sieht, wird geraten.
  - **Nebenwirkung, die mitkommen musste:** seitdem stehen Posts im Feed, die schon
    angefangen haben. „Heute 14:00" um 23 Uhr läse sich wie eine Einladung — Karte und
    Detail schreiben deshalb „Seit 14:00" (`startOderSeit` in `lib/zeit.ts`).
  - Nachgerechnet mit acht Fällen (Standard, alle drei Optionen, Mitternachtsgrenze,
    geschlossener Post): stimmen alle.

**Drei Bausteine sind dazugekommen** (alle in `src/components/ui/`):

| Baustein | Warum |
|---|---|
| `SsInput` | Stand so in Abschnitt 9 als Auftrag. Label, Hinweis, Suffix („Wien"), Fehlerzeile, dunkler Rahmen bei Fokus. Das Nachrichtenfeld im Post-Detail ist mit umgezogen. |
| `SsSegment` | Die geteilte Fläche für ein Entweder-oder. Der Feed hatte sie schon selbstgebaut, `create.tsx` brauchte dieselbe — statt sie zu kopieren, ist sie jetzt ein Baustein, und der Feed benutzt ihn. |
| `SsBack` | Es gibt jetzt genau **einen** Zurück-Knopf. Die Regel „nimm `zurueckOderFeed()`" ist in Phase 2 schon einmal gebrochen worden; eine Regel, an die man sich erinnern muss, wird irgendwann gebrochen — ein Baustein, den man einfach nimmt, nicht. |

`SsScreen` hat dazu ein `keyboard`-Merkmal bekommen (`KeyboardAvoidingView`, nur auf
iOS aktiv). Android schiebt selbst hoch, im Browser gibt es das Problem nicht — dort
würde `behavior="padding"` nur unten Luft einfügen, die niemand braucht.

**Drei Fallen, die dabei Zeit gekostet haben** — alle drei in `SsInput`:

1. **Ein `flex: 1`-Kind schrumpft nicht unter seine Inhaltsbreite.** In CSS steht
   `min-width` standardmäßig auf `auto`. Im schmalen Uhrzeit-Feld (160 px) quoll das
   Suffix „Uhr" dadurch rechts aus dem Rahmen heraus, statt dass das Eingabefeld Platz
   macht. `minWidth: 0` hebt die Sperre auf.
2. **`outlineWidth: 0` allein entfernt den blauen Fokus-Ring im Browser nicht.** Chrome
   benutzt `outline-style: auto` und zeichnet den Ring dann in fester Breite, egal was
   dasteht. Es braucht zusätzlich `outlineStyle: 'solid'`. Das Naheliegende —
   `outlineStyle: 'none'` — ist reines Web-CSS und wirft einen Typfehler, React Native
   kennt nur `solid | dotted | dashed`. (Dieselbe Falle wie bei `cursor` in Phase 0.)
3. **Ein `"` in einem JSX-Attribut beendet das Attribut.** Deutsche Anführungszeichen
   im Text sind `„…“` — das schließende ist ein anderes Zeichen. Wer aus Versehen `"`
   tippt, bekommt fünf Syntaxfehler an ganz anderer Stelle gemeldet.

### Phase 4 — Anfragen + Match (das Herzstück) ✅ *(2026-08-31)*
- [x] `(tabs)/requests.tsx` — eingehende Zusagen, Bestätigen / Ablehnen
- [x] `match.tsx` — Konfetti, „Ihr seid verabredet"
- [x] Post schließt automatisch, wenn alle Plätze voll sind
- [x] **Ian hat `features/requests/logic.ts` entschieden** (Abschnitt 6.3) — Warteliste, still
- [x] *(nicht geplant, aber nötig)* `SsButton`-Variante `danger` + die Rot-Palette dazu
- [x] *(nicht geplant, aber nötig)* `SsKonfetti` als Baustein
- [x] *(nicht geplant, aber nötig)* Zweite Ansicht „Geschickt" im Anfragen-Tab
- [x] *(nicht geplant, aber nötig)* `features/chat/logic.ts` — der Chat entsteht beim Bestätigen
- [ ] „Weg in den Chat" vom Match-Screen — **bewusst in Phase 5 geschoben**, siehe unten

**Was dabei entschieden wurde:**

- **Der `danger`-Button ist ein Umriss, keine rote Fläche.** Der Plan sagte nur „erste
  `danger`-Variante". Rot GEFÜLLT neben „Bestätigen" wäre das Lauteste auf einem
  Bildschirm, dessen ganzer Zweck das Zusagen ist — das Auge landet zuerst auf der
  Absage. Rot als Umriss sagt dasselbe, ohne die Reihenfolge umzudrehen. Für Phase 7
  (Blockieren, Melden) passt es genauso: auch dort ist die harte Aktion nie der Hauptweg.
- **Ablehnen links, Bestätigen rechts.** Rechts unten landet der Daumen von selbst. Ein
  versehentliches „Bestätigen" kostet ein Gespräch, ein versehentliches „Ablehnen"
  kostet einer echten Person die Verabredung.
- **Die Anfragen sind nach Post gruppiert, nicht flach aufgelistet.** „Sara will
  mitmachen" ist ohne „wobei?" keine Information. Den Titel in jede Zeile zu schreiben
  wäre die Alternative — bei drei Anfragen auf dasselbe Tennis stünde er dreimal da und
  die Zeilen sähen aus wie drei verschiedene Sachen.
- **Der Tab hat eine zweite Ansicht bekommen: „Geschickt".** Stand nicht im Plan, fehlte
  aber sofort: Nach „Bin dabei" gab es keinen Ort, an dem man nachsieht, worauf man
  wartet — man müsste sich merken, welcher Post es war, und ihn im Feed wiederfinden.
  Bewusst NICHT mit der `PostCard` aus dem Feed gebaut: die beantwortet „ist das was für
  mich?", hier geht es nur noch um den Stand („⏳ Wartet" · „🎉 Du bist dabei" ·
  „🙁 Diesmal nicht").
- **Der Chat entsteht beim Bestätigen** — und zwar in `features/chat/logic.ts`, nicht in
  `requests/hooks.ts`. Das ist das Sicherheitsversprechen der App als Code: ohne Zusage
  kein Kanal. Phase 5 findet an dieser Stelle, wo ihre Daten herkommen. Pro Zusage ein
  eigener Faden, kein Gruppenchat — Leute, die einander nicht kennen, in einen Raum zu
  setzen wäre eine andere App.
- **Der Match-Screen verändert nichts.** Bestätigt wird im Anfragen-Tab; `/match` feiert
  nur. Ein Screen, der beim Öffnen speichert, würde beim Neuladen im Browser ein zweites
  Mal speichern — und im Web ist jede Adresse jederzeit direkt erreichbar.
- **Kein „Zum Chat"-Knopf auf dem Match-Screen.** `chat/[id].tsx` gibt es erst in
  Phase 5. Ein Knopf, der auf einen Screen zeigt, den es nicht gibt, wäre der erste
  kaputte Weg im Prototyp — ausgerechnet an der Stelle, die man herzeigt. Stattdessen
  steht ehrlich da: „Euer Chat ist angelegt. Aufmachen kann man ihn ab Phase 5."
- **Konfetti: EIN `Animated.Value` für alle 34 Schnipsel.** Naheliegend wäre je Schnipsel
  eine eigene Animation mit eigenem `delay` — 34 Timer, die einzeln aufgeräumt werden
  müssen. Stattdessen läuft ein Wert von 0 auf 1, und jeder Schnipsel rechnet sich per
  `interpolate` seinen Ausschnitt heraus: die Verzögerung ist Mathematik statt
  Zeitsteuerung. Wer „Bewegung reduzieren" eingeschaltet hat, bekommt kein Konfetti —
  der Screen sagt die frohe Botschaft ohnehin in Worten.
- **Eine dritte Anfrage in `mock.ts` (r7, Mira auf p3).** Ohne sie ist Ians Frage aus
  6.3 im Prototyp gar nicht auslösbar: p3 hatte zwei freie Plätze und genau zwei
  Anfragen. Jetzt bleibt beim zweiten Bestätigen eine Anfrage übrig, für die kein Platz
  mehr da ist — genau die Lage, um die es geht.
- **Die Zahl am Anfragen-Tab zählt wartende Anfragen mit**, auch wenn der Post voll ist
  und man sie gerade nicht bestätigen kann. Das ist die bewusst in Kauf genommene
  Kehrseite von Ians „Warteliste, still" (6.3) — sie zu verstecken hieße, heimlich
  Möglichkeit C zu bauen. Der Screen mildert es mit einem Satz am ausgegrauten Knopf.

**Zwei Fallen, die dabei Zeit gekostet haben:**

1. **`StyleSheet.absoluteFillObject` gibt es in React Native 0.86 nicht mehr** (nur
   `absoluteFill`, und das ist eine registrierte Style-ID, die sich nicht mit `overflow`
   mischen lässt). `position`, `top`, `right`, `bottom`, `left` ausschreiben.
2. **`pointerEvents` als Prop ist veraltet** — seit React Native 0.76 gehört es in den
   `style`. Als Prop schreibt es bei jedem Match eine Warnung in die Konsole.

### Phase 5 — Chats ✅ *(2026-09-01)*
- [x] `features/chat/hooks.ts` — `useChatListe`, `useChat`, `useChatZuPost`, `nachrichtSenden`
- [x] `features/chat/lifecycle.ts` — ✅ Ians Regel 6.4: erst „Vorbei", nach 7 Tagen weg
- [x] `features/chat/sort.ts` — ✅ Ians Regel 6.5: die neuen Chats immer ganz oben
- [x] `(tabs)/chats.tsx` — Liste mit letzter Nachricht, Zeit und dem Treffen darunter
- [x] `chat/[id].tsx` — Verlauf mit Post-Kopfzeile oben, Blasen in der Kategoriefarbe,
      Tagestrenner, Eingabe fest unten
- [x] Den Weg dorthin nachgetragen: Match-Screen hat „Zum Chat" statt des Hinweises,
      Post-Detail ebenso bei bestätigter Anfrage
- [x] `SsInput` um `onSubmitEditing` erweitert — Enter schickt die Nachricht ab

**Drei Sachen, die dabei bewusst so entschieden wurden:**

1. **Die Chat-Liste ist eine Liste von TREFFEN, nicht von Menschen.** Unter jedem Namen
   steht, worum es geht. Zwei Verabredungen mit derselben Person sind zwei Zeilen —
   das folgt direkt daraus, dass ein Chat immer an einem Post hängt.
2. **Der Chat-Screen bricht harte Regel 4** (`SsScreen scroll keyboard`) und benutzt
   `SsScreen keyboard` ohne `scroll`. Kopfzeile fest oben, Eingabe fest unten, nur der
   Verlauf scrollt — bei einem Formular ist die Regel richtig, bei einem Chat nicht.
   Begründet im Kopf von `app/chat/[id].tsx`.
3. **Eigene Blasen tragen die Kategoriefarbe des Treffens.** Der Chat ist der einzige
   Screen, auf dem man länger bleibt; ohne die Farbe wäre er ein grauer Messenger, der
   zufällig in SimplySocial eingebaut ist. Textfarbe kommt aus `onBase` — bei Sport
   (gelb) wäre pauschales Weiß unlesbar.

### Phase 6 — Profile + Social-Layer ✅ *(2026-09-01)*
- [x] `features/social/hooks.ts` — `folgen`, `entfolgen`, `useFolgeListe` dazu
- [x] `features/posts/profil.ts` — ✅ Ians Regel 6.6: nur, was gerade läuft
- [x] `features/posts/hooks.ts` — `useProfilPosts` (Sichtbarkeit + Zeit getrennt)
- [x] `components/Profil.tsx` — der Profilinhalt, für eigenes und fremdes Profil derselbe
- [x] `components/FolgeListe.tsx` — der Inhalt beider Listen-Screens
- [x] `(tabs)/profile.tsx` — eigenes Profil (der letzte Platzhalter ist weg)
- [x] `user/[id]/index.tsx` — fremdes Profil mit Folgen-Knopf, eigenes wird umgeleitet
- [x] `user/[id]/follower.tsx` + `user/[id]/following.tsx` — die zwei Listen
- [x] Post-Detail: die Verfasser-Karte führt aufs Profil (vorher gab es keinen Weg hin)

**Vier Sachen, die dabei bewusst so entschieden wurden:**

1. **Eigenes und fremdes Profil teilen sich einen Baustein** (`components/Profil.tsx`).
   Man muss sich darauf verlassen können, dass das eigene Profil zeigt, was Fremde
   sehen. Zwei Screens wären beim ersten Umbau auseinandergelaufen.
2. **In den Follower-Listen steht KEIN Folgen-Knopf**, nur „✓ Du folgst" als Auskunft.
   In einer App, in der man sich mit Fremden trifft, soll „folgen" eine Entscheidung
   nach einem Blick aufs Profil sein — nicht eine, die man aus einer Namensliste heraus
   abarbeitet.
3. **Zwei echte Dateien statt `[liste].tsx`.** `typedRoutes` kennt dadurch
   `/user/[id]/follower` und `/user/[id]/following` als Literale; ein Tippfehler im
   `router.push` ist ein Compile-Fehler statt eines toten Klicks. Ein dynamisches
   Segment hätte auch `/user/u_lea/quatsch` gematcht.
4. **Der Werkstatt-Knopf bleibt** — entgegen dem TODO aus Phase 2, nur leiser und weiter
   unten. `/bausteine` ist sonst nur über die Adresszeile erreichbar, und am Handy tippt
   das niemand. Er verschwindet mit den Einstellungen aus Phase 7.

### Phase 7 — Sicherheits-UI (Apple 1.2) ✅ *(2026-09-01)*
- [x] `features/safety/block.ts` — ✅ Ians Regel 6.7: alles weg (`BLOCK_WIRKUNG`)
- [x] `features/safety/hooks.ts` — `blockieren`, `entblocken`, `melden`, `istBlockiert`,
      `useBlockierte`, `useMeineMeldung`, `useMeineSpuren`
- [x] `config/melden.ts` — die Melde-Gründe, getrennt für Post und Person
- [x] `types/models.ts` — `blockedIds` am `User`, `Report` als neuer Typ
- [x] `melden.tsx` — Melde-Screen für Post (`?art=post`) und Person (`?art=user`)
- [x] `einstellungen.tsx` — blockierte Personen, Nutzungsbedingungen, Account löschen,
      Werkstatt (umgezogen vom Profil-Tab)
- [x] `nutzungsbedingungen.tsx` — sechs Hausregeln + sichtbare Lücke fürs Rechtliche
- [x] `account-loeschen.tsx` — echte Zahlen, zwei Schritte, ehrliches Ende
- [x] Wege dorthin: Post-Detail (melden), fremdes Profil (melden + blockieren),
      Profil-Tab (Einstellungen)
- [x] Der Block WIRKT: Feed, Profil, beide Anfragen-Listen, Chat

**Vier Sachen, die dabei bewusst so entschieden wurden:**

1. **Blockieren wirkt im Prototyp wirklich, Melden nicht.** Das ist kein halber Job,
   sondern die ehrliche Grenze: Eine Sperre kann der Browser selbst durchsetzen, und an
   einer Sperre, die man ausprobieren kann, sieht man sofort, ob sie sich richtig
   anfühlt — genau die Frage, die Ian in 6.7 beantwortet hat. Eine Meldung braucht einen
   Menschen, der sie liest. Sie wird gespeichert (`state.reports`, die Form der späteren
   Firestore-Sammlung) und der Screen merkt sich, dass man gemeldet hat. Mehr zu
   behaupten wäre gelogen.
2. **Ein Block steht nur EINMAL im Datenmodell** (`blockedIds` beim Blockierenden) —
   das genaue Gegenteil der Folge-Beziehung aus harter Regel 8, und aus demselben Grund
   richtig: Wer blockiert wird, darf es nicht merken. Ein `blockedByIds` beim anderen
   wäre über jede Abfrage sichtbar, die dieser Nutzer auf sich selbst macht. Die WIRKUNG
   ist trotzdem symmetrisch — sie wird gelesen, nicht gespeichert (`istBlockiert`).
3. **Melden und Blockieren sind zwei Knöpfe, nicht einer.** Melden heißt „schaut euch
   das an" und richtet sich an die Moderation; Blockieren heißt „ich will damit nichts
   zu tun haben" und richtet sich an niemanden. Ein gemeinsamer Knopf brächte Leute
   dazu, das eine zu tun, weil sie das andere wollten. Nach dem Melden einer PERSON
   steht der Blockieren-Knopf trotzdem da — dort ist es keine Kopplung, sondern der
   naheliegende nächste Schritt. **In dieser Reihenfolge:** erst melden, dann blockieren.
   Unter Ians Regel HART löscht ein Block den Chat, und damit den Beleg. Wer erst meldet,
   hat den Vorgang bei der Moderation abgelegt, bevor er ihn bei sich wegräumt.
4. **Der Rechtstext fehlt sichtbar.** Der Screen `nutzungsbedingungen.tsx` zerfällt in
   zwei Hälften: sechs Hausregeln (eine Produktfrage — die stehen ausformuliert da) und
   einen roten Kasten mit den vier Rechtsfragen, die niemand im Team beantworten kann.
   Ein plausibel klingender Absatz wäre schlimmer als die Lücke — man würde ihn für
   geprüft halten. `_FUER_IAN/OFFENE_SACHEN.md`, Punkt 1.

### Phase 8 — Web-Deploy ✅ *(2026-09-01)*
- [x] `npx expo export --platform web` → statisches Bündel
- [x] `features/statisch.ts` + `generateStaticParams` in fünf Routen — **das eigentliche
      Stück Arbeit**, siehe unten
- [x] `experiments.baseUrl: "/simplysocial"` in `app.json` (Unterordner auf Pages)
- [x] `public/.nojekyll` und `public/robots.txt` — im Build, nicht als Handgriff
- [x] `components/PrototypHinweis.tsx` — einmaliger Hinweis beim Öffnen (Ians Wahl)
- [x] Persönliches aus `data/mock.ts` entfernt (Ians Entscheidung, siehe unten)
- [x] **Live: https://ianfhorak-jpg.github.io/simplysocial/** · Code:
      https://github.com/Ianfhorak-jpg/simplysocial
- [x] `npm run deploy` (`scripts/deploy.sh`) — bauen, prüfen, hochladen in einem Befehl
- [x] Link in `_FUER_IAN/README.md`

**Warum Vercel doch nicht, obwohl es hier so stand:** Vercel hätte einen Account und
einen Login im Terminal gebraucht — genau den manuellen Zwischenschritt, den Ians
CLAUDE.md ausschließt. Das `gh`-CLI war auf dem Rechner bereits eingeloggt, damit ging
GitHub Pages ohne jede Handarbeit. Der Preis (Unterordner statt Wurzel) ist genau die
Falle, die weiter unten schon notiert war — eine Zeile `experiments.baseUrl`. Vercel
bleibt jederzeit nachrüstbar; dann muss nur `baseUrl` wieder raus.

**Das eigentliche Problem war nicht das Hochladen, sondern die dynamischen Routen.**
`expo export` erzeugt je Routen-MUSTER eine Datei, nicht je Adresse: aus
`app/post/[id].tsx` wird `dist/post/[id].html`, mit eckigen Klammern im Dateinamen.
Beim Klicken im Feed fällt das nie auf — der Router wechselt den Screen, ohne die Seite
neu zu laden. Beim DIREKTEN Aufruf fällt es immer auf, und ab Phase 8 ist der direkte
Aufruf der Normalfall (harte Regel 5): ein Link in der Gruppe, ein Neuladen am Handy.
Gemessen vor dem Umbau: `/post/p4`, `/chat/t1`, `/user/u_lea` → **404**.

Gelöst mit `generateStaticParams` — der Funktion, die Expo Router genau dafür hat. Sie
läuft beim Bauen in Node und sagt, welche IDs es gibt; für jede entsteht eine echte
Datei. Das geht hier, **weil der Prototyp auf festen Fake-Daten läuft**: Jede ID, die es
geben kann, steht beim Bauen fest. Danach braucht es keinen schlauen Server, keine
Umschreibe-Regeln, keinen 404-Umweg — das Bündel läuft auf jedem dummen Datei-Hoster.
Aus 22 Routen wurden 56 Dateien.

Die IDs kommen über `getState()` aus `features/statisch.ts`, **nicht** aus `mock.ts`:
`generateStaticParams` steht im Screen, und scharfe Regel 1 sagt, dass kein Screen
`mock.ts` importiert. Die Naht war schon da.

**⚠️ Mit dem echten Backend gehört `features/statisch.ts` WEG, nicht angepasst.** Zwei
Gründe stehen im Kopf der Datei: Statisches Vorrendern backt den Inhalt ins HTML (bei
Fake-Daten ein Vorteil, bei echten wäre `chat/t1.html` ein öffentlich abrufbarer fremder
Chat), und mit einer Datenbank sind die IDs beim Bauen nicht mehr bekannt. Der Ersatz
ist dann eine Umschreibe-Regel auf dem Server — und ein Hoster, der mehr kann als
Dateien ausliefern.

**Ians achte Entscheidung (2026-09-01): der Hinweis beim Öffnen.** Zur Wahl standen ein
einmaliger Balken, gar nichts in der App, und ein fester Streifen auf jedem Screen.
Er hat den **einmaligen Balken** gewählt. Er sagt die zwei Dinge, die sonst wie Fehler
aussehen: alles erfunden, kein Login (jeder ist Ian), Neuladen setzt zurück. Gemerkt
wird das Wegklicken in `sessionStorage` — gilt für den Tab inklusive Neuladen, aber
nicht für immer; wer in drei Wochen wiederkommt, hat die Sätze vergessen.

**Ians neunte Entscheidung (2026-09-01): Persönliches raus aus den Fake-Daten.** In
seiner Bio standen Schule und Klasse, in einem erfundenen Post der echte Name eines
Lehrers. Unter 200 Leuten derselben Schule harmlos, auf einer offenen URL nicht — und
der Lehrer wurde nicht gefragt. Er hat „beides neutralisieren" gewählt. Die Regel steht
jetzt im Kopf von `data/mock.ts`, damit neue Fake-Daten sie erben.

### Phase 9 — Landing-Page ✅ *(2026-09-01)*
- [x] `landing/` — eigene Seite: was SimplySocial ist, wie es funktioniert, warum
- [x] **„Über uns"** — die vier Namen: **Ian · Christoph · Leopold · Daria**
- [x] Link zum Prototyp (dreimal: Kopfzeile, Hero, Schluss)
- [x] **Live: https://ianfhorak-jpg.github.io/simplysocial-landing/** · Code:
      https://github.com/Ianfhorak-jpg/simplysocial-landing
- [ ] ~~Warteliste~~ — **bewusst nicht gebaut.** Ein Formular ohne Backend, das nichts
      speichert, ist schlimmer als keins: Man trägt sich ein und glaubt, es sei
      angekommen. Kommt mit dem Backend.

**Kein Build.** Reines HTML, CSS und etwas JavaScript — kein npm, kein Bundler, kein
Framework. Was im Ordner liegt, ist das, was ausgeliefert wird; GitHub Pages nimmt den
`main`-Zweig direkt. Für eine Seite aus sechs Dateien wäre eine Werkzeugkette ein
Wartungsposten ohne Gegenwert, und in zwei Jahren lässt sie sich nicht mehr bauen.

**Ians Vorgaben, wörtlich umgesetzt:**
- **Vier Namen, ausgeschrieben:** Ian, Christoph, **Leopold** (nicht Leo), Daria.
- **Wenig Inhalt.** Drei Abschnitte plus Hero und Schluss, mehr nicht.
- **Kein Organigramm.** Die Rollen stehen in EINEM Satz nach den Namen, nicht als
  Karten mit Titeln. Sein Satz war: „ich will eigentlich nicht, dass da so viel über
  die Rollen gesprochen wird, sondern eher einfach, dass wir halt als Team das bauen."
- **Startup-Ton, kleine Animationen, nicht nach KI aussehend.**
- **Design aus dem App-Design abgeleitet.**

**Wie das Design an die App gebunden ist.** `stil.css` wiederholt die Werte aus
`simplysocial/src/theme/` als CSS-Variablen: die sechs Kategoriefarben mit allen fünf
Stufen, die Radien, die Abstände und `--tiefe: 4px` — den Rand unten am Knopf, die
Signatur der App. Die Post-Karten im Hero sind die Karten aus dem Feed, samt Farbstreifen
links. **Das ist eine Kopie, keine Verbindung:** Wird in `theme/colors.ts` etwas
umgestellt, muss es hier nachgezogen werden. Der Kopf von `stil.css` sagt das.

**Die eine bewusste Abweichung ist die Schrift.** Die App benutzt die Systemschrift —
ein Platzhalter, so steht es in `theme/type.ts`. Die Seite benutzt **Bricolage Grotesque**
(Display) und **Hanken Grotesk** (Text). Wenn die App eine echte Schrift bekommt, ist
Bricolage der naheliegende Kandidat; dann stimmt auch das wieder überein.

**Die Schriften liegen im Repo, sie werden nicht von Google geladen.** Wer Google Fonts
per `<link>` einbindet, schickt die IP-Adresse jedes Besuchers an Google — in der EU ein
DSGVO-Problem. Bei einem Projekt, das die DSGVO als offenen Punkt führt, wäre das eine
schlechte Pointe. Beides sind Variable Fonts: eine Datei je Schrift deckt alle Gewichte
ab, zusammen 164 KB.

### Phase 10 — Landing-Page nachbessern ✅ *(2026-09-01)*
*Ians Rückmeldung vom 2026-09-01, nachdem er die Seite am Handy gesehen hat.*
Klein, eindeutig, kein offener Punkt. Ordner `landing/`, kein Build.

- [x] **Das Laufband raus.** „Dieser Balken, der sich immer nach links bewegt, das mag
      ich irgendwie nicht." Ersatz — **Ians dreizehnte Entscheidung, 2026-09-01:
      dieselben sechs Farben, still stehend** — eine ruhige Reihe, auf schmalen Schirmen umgebrochen statt seitlich
      weglaufend. Betrifft `.band*` in `stil.css` und den Block, der die Liste in
      `seite.js` füllt (die Verdopplung für die Endlosschleife fällt mit weg).
- [x] **Die drei Schritte neu formulieren.** Sein Einwand galt Schritt 3: „erst dann
      geht der Chat auf" — „hört sich nicht sehr schön an und auch nicht ganz richtig".
      Er hat recht: Es klingt nach einer Sperre, und *aufgehen* tut ein Chat nicht.
      Die Sache dahinter bleibt (der Poster bestätigt zuerst), nur der Satz nicht.
      Richtung: aus der Sperre eine Zusage machen — nicht „erst dann darfst du
      schreiben", sondern „ihr seid verabredet, und dann schreibt ihr euch". Alle drei
      Schritte gemeinsam durchgehen, nicht nur den dritten.
- [x] **„Wer wir sind" auf einen Satz.** Der Rollen-Satz fliegt **ganz** raus, auch der
      eine übrig gebliebene. Seine Worte: „Ich will eigentlich gar nicht, dass man weiß,
      okay, dass Ian sich irgendwie um den Code kümmert. Einfach nur, dass man sieht:
      wir arbeiten zusammen als Team." Also: die vier Namen, ein Satz über das Team,
      Schluss. `.wir-nach` in `index.html` entfällt.

**Was beim Bauen dazukam — alles im Browser gemessen, nicht geschätzt:**

- **Ein Laufband abzuschalten ist mehr als `animation: none`.** Die Bewegung brauchte
  zwei Dinge, die eine stehende Reihe genau nicht will: die Liste **doppelt im DOM**
  (damit die Schleife bei −50 % nahtlos von vorn beginnt) und `width: max-content`
  (damit sie überhaupt breiter als der Schirm sein darf). Nur die Animation zu
  entfernen hätte sechs Kategorien zwölfmal stehen lassen, die Hälfte `aria-hidden`.
- **Die Beispieltexte fliegen unter 700 px raus, und das ist gemessen.** Mit ihnen ist
  jede Pille rund 300 px breit; bei 343 px nutzbarer Breite passt nie eine zweite
  daneben, alle sechs stehen untereinander, und die Reihe wird **386 px hoch** — eine
  halbe Bildschirmhöhe für ein Element, das nur zeigen soll „es geht um mehr als Sport".
  Ohne sie: **140 px**, zwei Zeilen à drei. Die Information geht nicht verloren, direkt
  darunter stehen die drei Schritte.
- **Zwei Punkt kleinere Schrift entscheiden über 3 | 3 statt 3 | 2 | 1.** Bei voller
  Größe sind die drei breitesten Pillen zusammen 346 px — drei Pixel mehr, als bei
  375 px Schirmbreite Platz ist. Das ergab eine Treppe mit einer einsam stehenden Pille
  in der letzten Zeile.
- **Überschriften nebeneinander brauchen eine Mindesthöhe.** Der neue dritte Titel ist
  zweizeilig, die anderen zwei nicht — dadurch begann in Karte 3 der Fließtext eine
  Zeile tiefer als in 1 und 2. `min-height` auf zwei Zeilen behebt nicht nur diesen
  Fall, sondern jeden künftigen; ohne sie zerlegt der nächste Textumbau das Raster
  wieder, und niemand denkt daran.
- **Wo eine Überschrift bricht, sagt man ihr besser hin.** Zwei Versuche mit
  `white-space: nowrap` ergaben erst einen Umbruch mitten in „ihr seid verabredet",
  dann einen Gedankenstrich als erstes Zeichen der zweiten Zeile, dann einen Bruch nach
  „Du sagst". Ein `<br>` an der richtigen Stelle ist hier ehrlicher als drei Tricks,
  die sich gegenseitig ausbremsen.
- **Die Reveal-Falle aus Phase 9 trifft auch beim Prüfen.** Ein Element-Screenshot
  direkt nach dem Laden lieferte eine leere Fläche: Der Abschnitt stand noch auf
  `opacity: 0`, weil der `IntersectionObserver` nie gefeuert hatte. Vor jeder Aufnahme
  hinscrollen **und die gestaffelten Übergänge auslaufen lassen** — eine Messung
  600 ms nach dem Scroll traf noch mitten in die Transition und meldete falsche
  Positionen.

---

### Phase 11 — Der Wischstapel ✅ *(2026-09-01)*

> **Ians zehnte Entscheidung, 2026-09-01: beides, und der Stapel steht vorn.**
> Begründung und der Grund, warum das Argument von 2026-08-31 weiter gilt:
> Abschnitt 1, „Warum Feed statt Swipe".

**Gebaut**

- [x] `features/posts/wisch.ts` — **die Regeldatei.** Was links heißt, was rechts heißt,
      was den Stapel verlässt und wann. Im selben Stil wie `sort.ts`, `lifecycle.ts`,
      `block.ts`: die verworfenen Möglichkeiten bleiben im Kopfkommentar stehen.
      Enthält außerdem `SCHWELLE`, `SCHWUNG`, `RUECKGAENGIG_MS`, `SICHTBARE_KARTEN`
      und den vorgeschlagenen Gruß (`grussVorschlag`).
- [x] `components/WischKarte.tsx` — eine Karteikarte, die man ziehen kann.
- [x] `components/WischStapel.tsx` — der Stapel darüber: drei Karten sichtbar,
      die hinteren leicht versetzt und kleiner; darunter die zwei Knöpfe.
- [x] `app/(tabs)/index.tsx` — zwei Betriebsarten: **Stapel** (Standard) und
      **Liste** (das bisherige Verhalten). Umschalter oben, kein neuer Tab, keine neue
      Route, **dieselben Filter** in beiden Ansichten.
- [x] `components/AntwortLeiste.tsx` — die Leiste, die nach rechts-Wischen hochfährt.
- [x] **Dazugekommen:** `features/store.ts` bekam die Liste `weggewischt` (die einzige
      ohne Gegenstück in `mock.ts`), `features/posts/hooks.ts` den Haken `useStapel`
      und die Aktionen `wegwischen` / `wischRueckgaengig`.

**Was beim Bauen anders wurde als hier geplant — jeweils mit Grund**

- **Kein Schatten.** PLAN.md sagte „hebt sich (Schatten wächst)". In SimplySocial hat
  aber keine Karte einen Schatten; die Tiefe gehört den Buttons (Abschnitt 3). Das
  Abheben macht jetzt die Abrisskante plus zwei Prozent Vergrößerung — dieselbe
  Aussage, ohne ein zweites Gestaltungsprinzip einzuführen.
- **Zwei Knöpfe unter dem Stapel („Weg" / „Bin dabei").** Standen nicht im Plan. Grund
  ist nicht Bequemlichkeit, sondern Bedienbarkeit: Wer mit VoiceOver oder Tastatur
  arbeitet, kann nicht wischen — ohne Knöpfe wäre der Startbildschirm für ihn eine
  Wand. Sie lösen dieselbe Flugbahn aus wie der Finger, damit man die Geste dabei
  nebenbei sieht.
- **Ein Zähler in der Umschalt-Zeile** („Noch 7 Karten" · „Durch"). „Wie viel kommt
  noch" ist die Frage, die man sich nach der zweiten Karte stellt; ohne Antwort
  fühlt sich jeder Stapel entweder endlos oder gleich zu Ende an.
- **„Rückgängig" ist keine schwebende Leiste**, sondern steht im Fußnoten-Streifen
  unter den Knöpfen (`fussnote` an `WischStapel`), wo sonst der Geste-Hinweis steht.
  Etwas, das über den Knöpfen schwebt, verdeckt genau die Aktion, die man als
  Nächstes braucht. Der Streifen hat feste Höhe, damit der Stapel nicht zuckt.
- **Die Stempel sitzen auf der GEGENÜBERLIEGENDEN Seite der Zugrichtung und unten.**
  Erst standen sie oben auf der Zugseite — im Browser sofort zu sehen, warum das
  zweimal falsch ist: Beim Ziehen nach rechts verlässt der rechte Rand als Erstes das
  Bild (Stempel weg, wenn er gebraucht wird), und oben verdeckte er den Titel, also
  genau das, woran man die Karte erkennt.
- **Der Umschalter „Stapel | Liste" braucht `minWidth`.** Siehe Fallen unten.
- **Die Karten stehen senkrecht MITTIG in ihrer Fläche**, nicht oben. Am Handy klebte
  der Stapel sonst unter den Filtern und darunter war eine Handbreit Leere. Gelöst,
  indem `top` an der Karte weggelassen wird und die Fläche `justifyContent: 'center'`
  bekommt — sollte eine Plattform das anders rechnen, fallen die Karten nach oben,
  also auf das vorherige Verhalten. Kaputt geht dabei nichts.

**Am Browser nachgemessen (nicht geschätzt)**

| Was | Ergebnis |
|---|---|
| Wisch links über einer Post-Karte | Karte fliegt, Zähler 7 → 6, keine Navigation |
| Wisch rechts | Leiste fährt hoch, Gruß vorausgefüllt („Hey Mira! Bin dabei 🙌") |
| „Doch nicht" | Zähler 6 → 7, **dieselbe** Karte liegt wieder oben |
| „Schicken" | Anfrage steht, Post fällt von selbst aus dem Stapel |
| Knopf „Weg" 7× | 7 → 6 → … → „Durch", dann „Das war alles für heute" + Liste |
| Tipp auf die Karte | öffnet das Post-Detail |
| Ziehen und wieder zurück | öffnet **nichts** (siehe Fallen) |
| Wisch in **Handybreite** (390 px) | ging erst NICHT — siehe Fallen, `onPanResponderTerminationRequest` |
| Karten senkrecht mittig statt oben klebend | ja, in beiden Breiten |
| Konsole | 0 Fehler, 0 Warnungen |

**Wie sich das Wischen anfühlt** *(Ians Bild: „als würde man ein Post-it vom Block
abreißen und nach links werfen")*

- Beim Ziehen kippt die Karte um bis zu ~8°, hebt sich (Schatten wächst), und am oberen
  Rand wird eine **Abrisskante** sichtbar — die Karte löst sich vom Block darunter.
- Ab einer Schwelle erscheint ein Stempel: links grau **„Weg"**, rechts in der
  Kategoriefarbe **„Bin dabei"**. Vorher passiert nichts Endgültiges.
- Loslassen unter der Schwelle: die Karte federt zurück.
- Über der Schwelle: sie fliegt in Wischrichtung aus dem Bild, die nächste rückt auf.
- **JS-only:** `PanResponder` + `Animated` aus React Native, keine Geste-Bibliothek.
  Derselbe Grund wie beim Konfetti in Phase 4 — `react-native-gesture-handler` und
  `reanimated` sind zwar installiert, aber auf Web sind sie das Risiko, das der Prototyp
  sich nicht leisten kann (ACTA-Falle). Wenn `PanResponder` sich am Handy zäh anfühlt,
  ist das der Punkt, an dem man das neu bewertet — **erst messen, dann tauschen.**

**Was links und rechts bedeuten**

- **Links = weg.** Der Post verschwindet aus dem Stapel und kommt nicht wieder.
      Ohne Backend gilt das für die Sitzung; nach dem Neuladen ist er wieder da, wie
      alles andere auch.
      → Vorschlag von mir, **Ian kann ihn streichen:** ein kurzes **„Rückgängig"**
      unten für ein paar Sekunden. Ein Fehlwisch ist die häufigste Beschwerde bei
      Wisch-Oberflächen überhaupt, und hier kostet er eine echte Verabredung.
- **Rechts = ich will mit** (Ians elfte Entscheidung, 2026-09-01): Die Karte fliegt raus,
      unten fährt eine schmale Leiste hoch mit einem Textfeld, **vorausgefüllt** mit
      einem kurzen Gruß, und einem Senden-Knopf. Seine Worte: „mit einem vorgeschriebenen
      HEY oder so, damit wenn er keine Lust hat zu schreiben, einfach schicken kann."
      Tippen ist also freiwillig, Senden ist ein Tipp. Abbrechen legt die Karte zurück.
      *Warum nicht ganz automatisch:* Der Poster entscheidet, wen er trifft — das ist das
      Sicherheitsversprechen der App. Ein Satz ist das, woran er das festmacht.
- **Was gar nicht erst in den Stapel kommt:** eigene Posts, Posts mit schon gestellter
      Anfrage, volle Posts, blockierte Personen. In der **Liste** bleibt alles sichtbar —
      dort ist Vollständigkeit richtig, im Stapel wäre sie Arbeit.
      *Beim Bauen prüfen, ob sich das mit `useFeed` deckt oder ob `wisch.ts` filtert.*

**Der leere Stapel** — der Grund, warum es die Liste noch gibt: Kein leerer Bildschirm,
sondern „Das war alles für heute", die Liste des schon Gesehenen und ein Knopf zum
Posten.

**Die erste Karte bringt sich selbst bei.** Statt einer Einführung, die man wegtippt, ist
die oberste Karte beim allerersten Öffnen eine **Anleitungskarte**: „Nach links, wenn es
nichts für dich ist. Nach rechts, wenn du mitwillst." Man lernt die Geste, indem man sie
macht. Deckt Ians Wunsch ab, dass die App „ein bisschen zeigt, wie das funktioniert" —
ohne einen Bildschirm, den man einmal sieht und nie wieder.

---

### Phase 12 — Posten aufräumen und die kleinen Fehler ✅ *(2026-09-01)*

- [x] **`app/create.tsx`: von zehn Feldern auf zwei.** Ians zwölfte Entscheidung
      (2026-09-01): sichtbar bleiben **Kategorie und Titel**, sonst nichts. Alles andere
      — Wann, Bezirk, Plätze, Können, Treffpunkt, Notiz, Sichtbarkeit, Sichtdauer —
      steckt hinter einer Zeile **„Mehr einstellen"** mit Symbol, die man auftippt.
      - **Standardwerte, damit ohne Öffnen ein gültiger Post entsteht:** stehen als
        Block `STANDARD` im Kopf der Datei — Wann = nächste halbe Stunde mit 90 Minuten
        Vorlauf; Bezirk = der eigene aus dem Profil; Plätze = 3; Können = egal; sichtbar
        für alle; läuft am Ende des Tages ab. **Gemessen:** Kategorie tippen, Titel
        tippen, Posten — der fertige Post hat „Morgen 10:00 · 1070 Wien · 3 von 3 frei".
      - **Die Live-Vorschau bleibt und wird wichtiger.** Sie ist ab jetzt die einzige
        Stelle, an der man sieht, was die Standardwerte gesetzt haben.
      - **Kein Burger-Symbol**, sondern eine beschriftete Zeile mit Pfeil (⚙️ · „Mehr
        einstellen" · ▸/▾) und darunter ein Halbsatz, was dahinter liegt. **Will Ian das
        Symbol trotzdem, ist es ein Wort:** `MEHR_SYMBOL` im Kopf der Datei.
- [x] **Die Kategorie-Pillen kleben am Rand.** Behoben und nachgemessen: erste Pille
      jetzt bei **x = 16** statt x = 0, die Reihe selbst weiter von Kante zu Kante (0–390).
- [x] **Man sieht der Pillenreihe nicht an, dass sie scrollt.** Neuer Baustein
      `components/ui/SsScrollReihe.tsx` mit weicher Kante — und zwar **nur, wenn wirklich
      etwas abgeschnitten ist**. Steht auch auf `/bausteine`, mit beiden Fällen
      nebeneinander.
- [x] **Standort: NICHT im Prototyp, aber gemerkt.** Steht als Punkt 6b in
      `_FUER_IAN/OFFENE_SACHEN.md`, mit beiden Gründen fürs Warten (harte Regel 1 —
      kein Netzwerk; und IP-Ortung trifft in Wien den Provider, ein VPN macht sie
      falscher statt genauer). Der saubere Weg für die echte App: einmal nach dem
      Standort fragen, daraus den Bezirk bestimmen, **die Koordinaten wegwerfen**.

**Was beim Bauen dazukam — alles im Browser gemessen, nicht geschätzt:**

- **Ein Formular mit versteckten Feldern hat einen Fehlerzustand, den es vorher nicht
  gab: ungültig UND unsichtbar.** Wer den Bezirk aufklappt, leert und wieder zuklappt,
  bekam „Es fehlt noch was — die roten Stellen" und sah nichts Rotes. Eingebaut ist
  `VERSTECKTER_FEHLER = 'aufklappen'`: Der Bereich geht beim Absenden von selbst auf.
  Die beiden Alternativen (`'reparieren'` — still auf den Standard zurücksetzen;
  `'nur melden'`) stehen als Konstanten daneben. **Das ist eine offene Frage an Ian**,
  siehe Abschnitt 6, Punkt 9.
- **Der Rand-Fehler an den Pillen war ein Erbstück, kein Zufall.** `marginHorizontal:
  -spacing.lg` war richtig, solange `SsScreen` seine eigenen 16 px Seitenrand hatte.
  Seit Phase 2 überschreibt der Feed das mit `paddingHorizontal: 0` — seitdem hob der
  negative Rand nichts mehr auf, sondern zog die Reihe 16 px ÜBER die Kante, und das
  Innenmaß schob die erste Pille exakt auf x = 0. **Zwei Werte, die einzeln stimmen,
  ergeben zusammen den Fehler** — deshalb war er im Code nicht zu sehen.
- **Für die Verlaufskante gibt es hier keinen Verlauf.** Beide Wege sind zu: React
  Native 0.86 kennt `experimental_backgroundImage` mit `linear-gradient`,
  `react-native-web` nicht (nachgesehen in dessen `dist/`, kein Treffer) — und der
  Prototyp läuft zuerst im Browser. `expo-linear-gradient` wäre ein Native-Modul, das
  harte Regel 1 verbietet. Also **acht 4-px-Streifen in der Grundfarbe mit steigender
  Deckkraft** (0,063 → 0,938). Bei der Breite sieht man die Stufen nicht.
- **Die Kante muss messen, nicht raten.** Eine Kante, die immer steht, verspricht etwas,
  das nicht kommt. Alle drei Fälle sind nachgemessen: nichts abgeschnitten (358 = 358)
  → **null** Kanten; links stehend → nur rechts eine; ganz nach rechts gescrollt → die
  rechte weg, die linke da.
- **`as const` an einem Standardwerte-Block friert den Zustand ein.** `STANDARD.plaetze
  = 3` bekam durch `as const` den Literaltyp `3`, und `useState(STANDARD.plaetze)` erbte
  ihn — der Zähler durfte die Zahl danach nicht mehr ändern. `useState<number>(…)`
  ausschreiben. Der Typecheck hat es gefunden, der Browser hätte es nicht.
- **Das ⚙️ stand neben der falschen Zeile.** Symbol links und daneben eine Spalte aus
  Titel + Untertitel heißt: Das Symbol sitzt auf halber Höhe des Blocks, also neben der
  ZWEITEN Zeile. Am Bildschirmfoto sofort zu sehen, im Code nicht. Jetzt Symbol, Titel
  und Pfeil in einer Zeile, der Untertitel darunter — eingerückt über eine feste
  Symbolbreite, weil Emojis je nach Gerät verschieden breit sind.
- **Die Rundung auf die halbe Stunde ist umgezogen.** Sie lag in `bald()` in `mock.ts`,
  und der Erstellen-Screen darf dort nicht hineingreifen (harte Regel 2). Jetzt
  `naechsteHalbeStunde()` in `lib/zeit.ts`, von beiden benutzt.

### Später (nicht diese Woche)
- Echtes Backend (Firebase oder Supabase — noch nicht entschieden)
- Login / Registrierung
- Push-Nachrichten
- EAS-Build, TestFlight, App Store

---

### Phase 13 — Wie es beim Öffnen aussieht ✅ *(2026-09-02)*

Ians zwei Rückmeldungen vom Handy, beide am selben Tag eingearbeitet.

- [x] **„Auf Chrome am Handy sieht es echt kurz komisch aus."**
      Nachgemessen, statt geraten: `dist/index.html` OHNE seine `<script>`-Tags
      gerendert — das ist exakt der erste Bildaufbau. Dort lag die oberste Wischkarte
      **schief und halb aus dem Bild**, der Stempel „Weg" war sichtbar, und die
      Wortmarke klebte oben ohne Sicherheitsabstand.
      **Kein Fehler im Stapel**, sondern eine Eigenschaft des statischen Exports:
      `useWindowDimensions`, die gemessene Kartenbreite und die SafeArea-Insets gibt es
      beim Bauen alle nicht. Der Vorab-Zustand *kann* nicht stimmen.
      Fix: neues **`app/+html.tsx`** mit `#ss-start` — eine Fläche in der Grundfarbe mit
      der Wortmarke, die vom ersten Bildpunkt an über allem liegt und weggeblendet wird,
      sobald `_layout.tsx` die Klasse `ss-bereit` setzt.
- [x] **Sicherheitsnetz dazu**, und das ist der wichtigere Teil: Käme das JavaScript nie
      an, läge die Fläche für immer über der App. Die CSS-Animation `ss-notausgang`
      blendet sie nach 8 Sekunden auch ohne JavaScript weg. Lieber der schiefe Stapel
      als eine tote Seite.
- [x] **Drei Fehler, die beim Nachmessen nebenbei auffielen** — alle drei erzeugt Expo
      selbst, solange es kein `+html.tsx` gibt:
      `<html lang="en">` bei einer deutschen App (Chrome auf Android bietet dann
      „Übersetzen?" an), ein **leerer `<title>`** (im Tab und in jedem geteilten Link
      stand die nackte URL) und **kein `theme-color`** (Androids Adressleiste blieb weiß
      gegen das Papierweiß der App). Dazu `viewport-fit=cover`, ohne das
      `env(safe-area-inset-*)` gar nichts liefert.
- [x] **„Der Prototyp-Hinweis soll unten sein wie eine Cookie-Abfrage."**
      Ians Begründung: oben ist er schwerer zu verstehen. Jetzt eine Leiste unten, die
      überdeckt statt zu schieben, mit einem **„Verstanden"-Knopf statt einem ✕** — das
      Muster kennt jeder und es sagt selbst, dass man es wegdrückt.
      Es ist die **dritte** Fassung; alle drei stehen samt Begründung im Kopf von
      `components/PrototypHinweis.tsx`. Der alte Einwand („darf die App nicht
      verdecken") gilt weiter und wird nur anders beantwortet: Verdeckt ist jetzt die
      Tab-Leiste, und die braucht man erst, nachdem man den Feed gesehen hat.

**Was beim Bauen dazukam:** In einem Template-Literal gibt es keine Kommentare — ein
Dateiname in Backticks im CSS-Block beendete die Zeichenkette und erzeugte 22
Folgefehler. Und der `<title>` kostete drei Anläufe: Im gebauten HTML stand er richtig,
live blieb der Tab leer, weil es **zwei** `title`-Tags gibt — Expo Router rendert einen
leeren über react-helmet, und der steht vorne. Weder `screenOptions.title` noch
`<Head>` aus `expo-router/head` greifen (der eine ist die Navigations-Kopfzeile, der
andere braucht einen Navigator um sich). Am Ende `document.title` in einem Effekt
(`tabTitel()`). **Nur auf der echten Adresse zu sehen**, nicht im gebauten HTML — der
erste Fix sah im Build korrekt aus und wirkte trotzdem nicht. Und: Der Emoji-Abstand im Hinweis brauchte zwei Elemente mit `gap`, ein
Leerzeichen im Text reicht nicht (dieselbe Falle wie bei „Mehr einstellen").

---

### Phase 14 — Der Look: Icons statt Emojis ✅ *(2026-09-02)*

**Warum zuerst:** Es war die Rückmeldung, die alle drei geteilt haben, und die einzige,
die nichts Neues baut — sie macht das Vorhandene ernst. Christoph hat es diagnostiziert
(„wegen den Emojis"), Leopold bestätigt, beide sagen im selben Atemzug, dass die
Funktion steht. Gemessen waren es **107 Emojis in 24 Dateien**.

- [x] **Ein Icon-Satz als SVG im Code** — `simplysocial/src/theme/icons.ts`.
      **41 Icons**, alle auf demselben Raster: viewBox 24×24, Inhalt zwischen 3 und 21,
      eine Strichstärke (`STRICH = 1.9`), runde Enden. Kein Native-Modul, keine
      Schrift-Icons, keine Bilddatei — reine Pfadangaben.
      Kreise sind als Pfad ausgerechnet (`kreis()`), damit der Zeichner nur EINE Form
      kennt: zwei Formen hießen zwei Codewege, und der zweite wird beim nächsten Icon
      vergessen.
- [x] **Der Zeichner: `components/ui/SsIcon.tsx`.** Auf Web ein echtes `<svg>` über
      `react-dom` — dafür braucht es keine Bibliothek, und der Prototyp IST eine
      Webseite. **Die Strichstärke folgt der Größe mit einer Wurzel** (`strichFuer`):
      Ohne das wäre der Strich bei 14 px 1,1 Gerätepixel (blass, ausgefranst) und bei
      44 px 3,5 (plump) — und der Feed zeigt beide Größen nebeneinander.
      **Das ist zugleich die Stellschraube für den Haken unten.**
- [x] **Alle Stellen ersetzt.** Der Weg dahin war der eigentliche Trick, und er ist
      die Umkehrung der Bezirks-Lehre vom selben Tag: **`SsButton.icon` wurde von
      `string` auf den Union-Typ `IconName` umgestellt, DANN hat `tsc` die Arbeitsliste
      geschrieben** — 25 Aufrufstellen auf einen Schlag. `string | null` erzwingt in JSX
      gar nichts, ein Union-Typ ist eine Whitelist.
      Was `tsc` nicht sieht, sind Emojis IM Text (`🔒 Nur Follower`); die wurden per
      `grep` gesucht und über den neuen Baustein `SsIconText` ersetzt.
- [x] **Auch die sechs Kategorie-Emojis** (`config/categories.ts`): `emoji: string`
      heißt jetzt `icon: IconName`. Neu und nur mit Pfaden möglich: **Das Icon nimmt
      die Kategoriefarbe an** — auf der hellen Pille dieselbe abgedunkelte Variante
      (`onSoft`) wie die Schrift daneben. Ein Emoji blieb immer bunt und saß auf der
      Pille wie ein Aufkleber.
- [x] **Avatare: Initialen auf farbigem Grund.** `User.avatar` ist **ersatzlos aus dem
      Datenmodell weg** statt umbenannt — die Initialen kommen aus `displayName`, die
      Farbe aus `id`, es gibt nichts mehr zu speichern. Phase 15 setzt `photoUrl?` an
      dieselbe Stelle; ein umbenanntes Emoji-Feld hätte bis dahin nur Müll gehalten.
      Gemessen: alle sechs Initialen-Farben liegen zwischen **4,51:1 und 4,62:1** auf
      ihrem Kreis.
- [x] **Ein Fehler, den erst diese Phase sichtbar gemacht hat:** Die Avatarfarbe kam aus
      einer **Summe von Zeichencodes** — und `'u_ian'` (524) und `'u_lea'` (518) landen
      beide auf Rest 2. Auf dem **Match-Bildschirm standen Ian und Lea als zwei
      identische Kreise nebeneinander**, auf dem einen Screen, dessen ganzer Inhalt
      „ihr zwei" ist. Mit Emojis darüber ist das nie aufgefallen.
      Ersetzt durch FNV-1a mit Mischschritt (`streuen()` in `SsAvatar.tsx`), gemessen an
      6000 IDs: 965 bis 1061 je Farbe statt Klumpen.
- [x] **Farbbild geschärft, ohne neue Farben** — wie Leopold vorgeschlagen hatte:
      · In der **Tab-Leiste** fällt ein Behelf weg. Weil Emojis keine Farbe annehmen,
        unterschied bisher die **Deckkraft** aktiv von inaktiv (`opacity: 0.45`) — ein
        halbdurchsichtiges Symbol sieht aber *deaktiviert* aus, nicht *unausgewählt*.
        Jetzt eine echte zweite Farbe, dieselbe, die die Beschriftung schon hatte.
      · Der **Folgen-Knopf** bekommt sein Plus zurück: Als Zeichen „➕" war es ein
        graues Glyph und auf dunklem Grund ein Fleck; gezeichnet ist es weiß wie die
        Schrift. Damit stehen sich zwei Zustände mit zwei Zeichen gegenüber (Plus /
        Haken) statt einem und keinem.
      · **Auch die Schriftzeichen sind raus**, obwohl sie nie Teil der Kritik waren:
        `› ▾ ▸ ← →` waren in der Systemschrift anders dick als jeder Strich daneben.
        In einem Satz, dessen ganzer Sinn EINE Strichstärke ist, fällt das auf.
- [x] **`landing/` mitgezogen** (harte Regel 13). Neue Datei `landing/icons.js` — eine
      **KOPIE** der sieben dort gebrauchten Pfade, kein Import: Die Seite hat bewusst
      kein npm. `currentColor` statt fester Farben, dieselbe Wurzel-Regel für den
      Strich. Das Avatar auf der Beispielkarte zeigt „L".
- [x] **`/bausteine` zeigt den ganzen Satz** — alle 41 Icons mit Namen, dazu eine Fahne
      in vier Größen nebeneinander (dort sieht man, ob die Strichregel noch stimmt) und
      `SsIconText` ein- und mehrzeilig.
- [x] **`components/Platzhalter.tsx` gelöscht.** Tote Datei seit Phase 7 — und die
      letzte Stelle im Code, an der ein `emoji: string` als Schnittstelle existierte.
      Wäre sie geblieben, käme beim nächsten Gebrauch ein Emoji zurück.

**Zwei Icons haben einen zweiten Anlauf gebraucht, beide am Gerät gefunden:**
Die **Filmklappe** für „Kultur" sah bei 15 px aus wie eine Handtasche — vier schräge
Balken über einem Kasten verschmelzen in der Kategorie-Pille zu einem Fleck. Ersetzt
durch eine **Eintrittskarte**, die außerdem alle vier Beispiele abdeckt (Kino, Konzert,
Museum, Fortgehen) statt nur das Kino. Und die **Lauffigur** hatte fünf Striche; der
hintere Arm trug nichts bei und kostete zwei Kreuzungen auf engstem Raum — jetzt vier.

**Was NICHT rausgeflogen ist, und warum:** Das 🎾 in Leas Chat-Nachricht
(`data/mock.ts`). Das ist kein Oberflächen-Emoji, das ist jemand, der schreibt.
Weggefallen ist dagegen das 🙌 im **vorgeschlagenen Gruß** (`posts/wisch.ts`) — es war
das einzige Emoji, das die App einem Menschen in den Mund gelegt hat, und der Haken
dieser Regel steht schon in der Datei: Lassen alle den Vorschlag stehen, liest der
Poster zehnmal denselben Satz. Zehnmal derselbe Satz mit demselben Emoji ist genau das,
was Christoph gemeint hat.

> **Der Haken, den Ian kennt — und was jetzt daraus geworden ist:** Emojis sind bunt und
> sofort erkennbar, Strich-Icons sind es nicht. Der Feed lebt von den sechs
> Aktivitätsfarben. Die Icons NEHMEN diese Farben jetzt an, das ist der Ausgleich — aber
> ob es reicht, sieht man erst am Handy. Falls es zu blass wirkt, ist der Weg zurück
> **nicht** „Emojis wieder rein", sondern kräftiger einfärben oder dicker zeichnen.
> Beides ist eine Zahl: `STRICH` in `theme/icons.ts` und `strichFuer()` in `SsIcon.tsx`.

> ⚠️ **Die eine offene Lücke, die dabei entstanden ist:** `SsIcon` zeichnet nur auf Web.
> Auf iOS und Android gibt es kein `<svg>`, und die Bibliothek dafür (`react-native-svg`)
> ist ein Native-Modul — genau das, was PLAN.md und harte Regel 1 hier ausschließen.
> Auf Native steht deshalb ein **sichtbarer** Platzhalter (Kreis in der Icon-Farbe),
> kein leeres Nichts: Ein leerer Platz sieht aus wie Gestaltung, ein Kreis wie eine
> Baustelle. Der Weg heraus ist EINE Datei und kein einziger Screen — genau dafür sind
> Pfaddaten (`theme/icons.ts`) und Zeichner (`SsIcon.tsx`) getrennt. Steht in
> `_FUER_IAN/OFFENE_SACHEN.md` (Punkt 3) und kommt mit dem ersten EAS-Build.

---

### Phase 15 — Altersgruppe und Filter ✅ *(2026-09-02)*

Zwei Rückmeldungen, die dasselbe Feld brauchen: Darias „Foto oder Altersgruppe" und
Leopolds „man kann nicht genau genug filtern, das wird ein Problem bei vielen Anfragen".

- [x] **Altersgruppe am Post**, nicht als Matching-System — **Leopolds Vereinfachung**:
      Der Poster stellt ein, für wen die Aktivität ist. Vier Stufen:
      `egal · 14–17 · 18–25 · 26+`, Voreinstellung **egal**.
      Neues Feld `ageGroup` am `Post`, neuer Typ `AgeGroup` (`types/models.ts`),
      Beschriftungen in `config/alter.ts`, Feld im Erstellen-Screen hinter
      „Mehr einstellen" (nach „Können", weil beide dieselbe Frage stellen).
- [x] **Altersgruppe am Profil** — als **eigener Typ `AgeBand`**, das sind dieselben
      Bänder OHNE `egal`. Eine Aktivität kann „für alle" sein, ein Mensch nicht;
      stünde an der Person `'egal'`, müsste jede Anzeigestelle raten, ob das „keine
      Angabe" oder „jedes Alter" heißt. Steht im Profilkopf: „@mira · 1050 Wien · 26+".
- [x] **Filter im Feed**, alle vier von Ian gewählt:
      **Bezirk · Wann · Altersgruppe · Freitext-Suche.** Dazu die zwei alten
      (Kategorie, „Wem ich folge") — macht sechs, und deshalb steht `FeedFilter` jetzt
      als EIN Objekt da (`features/posts/hooks.ts`) statt als Einzelwerte.
      Die Regeln selbst liegen in **`features/posts/filter.ts`** — dieselbe Trennung
      wie bei `sort.ts` und `lifecycle.ts`: Der Screen zeigt Pillen, die Bedeutung
      steht in der Feature-Datei.
- [x] **Freitext-Suche** über Titel und Notiz. **Das ist eine bewusste Abkehr von
      Abschnitt 7**, wo „Suche" bisher unter „bewusst NICHT im Prototyp" stand — dort
      ist es entsprechend geändert. Grund: Sie löst Leopolds Problem direkter als
      Hashtags und verlangt niemandem ab, beim Posten Schlagwörter zu tippen.
      Gesucht wird **ohne Rücksicht auf Umlaute** (`fussball` findet `Fußball`) und
      nach **Wortteilen** (`foto` findet `Fotospaziergang`) — im Deutschen ist das
      kein Extra, sondern der halbe Nutzen. Nicht im Namen des Verfassers: sonst
      würde aus der Aktivitätensuche eine Personensuche.
- [x] **Keine Hashtags.** Leopold hat sie vorgeschlagen, aber als *Lösung* für das
      Filter-Problem, nicht als Selbstzweck. Zwei Ordnungssysteme nebeneinander
      (sechs feste Kategorien **und** freie Hashtags) verwirren mehr, als sie helfen —
      und die sechs Farben der App hängen an den Kategorien. Falls die Filter das
      Problem nicht lösen, kommen Hashtags zurück auf den Tisch.

- [x] **Profilbild: der Platz ist gebaut, der Upload nicht.** Ian am 2026-09-02 zu
      Darias Punkt: **„Beides sollte klar sein"** — man soll sehen, mit wem man es zu
      tun hat, UND wie alt die Person ist.
      Was das im Prototyp konkret heißt:
      - `User` hat **`photoUrl?: string`**. Fehlt es, zeigen die Initialen aus
        Phase 14 — dieselbe Stelle, dieselbe Größe, derselbe Rahmen.
      - **`SsAvatar` kann das Bild zeichnen, und alle elf Aufrufstellen reichen das
        Feld schon durch.** Wenn das Backend kommt, fehlt nur noch der Upload — kein
        Screen muss dafür noch einmal angefasst werden.
      - **In `data/mock.ts` steht KEIN Foto** (harte Regel 12: keine echten Personen
        in öffentlich abrufbaren Fake-Daten). Die erfundenen Leute behalten Initialen.

**Was beim Bauen dazugekommen ist und im Plan nicht stand:**

- [x] **Der Bezirks-Filter zeigt nur Bezirke, in denen wirklich etwas los ist**
      (`useBezirkeImFeed`). Eine Reihe mit allen 23 wäre zu zwanzig Teilen eine
      Sackgasse; so ist sie eine Auskunft („heute ist in 1070, 1100 und 1220 was").
      Der Hook schaltet dabei NUR den Bezirksfilter aus und lässt alle anderen
      gelten — sonst wäre die Liste nach dem ersten Tipp einen Eintrag lang.
- [x] **Die vier neuen Filter liegen hinter einem Knopf mit Zähler**, Suche und
      Kategorien bleiben sichtbar. Vier Reihen offen wären die halbe Bildschirmhöhe,
      und der Wischstapel hätte keine mehr. Der **Zähler ist dabei das Wichtigste**:
      Ein zugeklappter Filter, den man nicht mehr sieht, ist der schnellste Weg zu
      einem Feed, den jemand für kaputt hält.
- [x] **`SsInput` kann jetzt ein Icon links und ein X rechts** (`icon`, `onClear`).
      Ein Suchfeld ohne Löschknopf ist am Handy eine Falle.
- [x] **„Wem ich folge" ist in den Filterbereich gewandert.** Es ist ein Filter wie
      jeder andere; mit sechs Stück an drei verschiedenen Orten sähe niemand mehr,
      was eingestellt ist.

> **Die ehrliche Einschränkung, und die gehört Daria gesagt:** Mit Initialen ist die
> Frage „wie sieht die Person aus?" **nicht** beantwortet — sie ist nur vorbereitet.
> Echte Fotos brauchen Speicherplatz, jemanden der prüft, was hochgeladen wird, und eine
> Antwort auf „wer darf ein Bild von wem hochladen". Alle drei gibt es ohne Backend
> nicht (Abschnitt 7). Was der Prototyp ab Phase 15 kann: das **Alter** zeigen und den
> **Platz** fürs Bild bereithalten. Was er nicht kann: das Bild selbst.

> **Der Haken beim Alters-Filter:** Eine Altersgruppe *anzeigen* ist harmlos. Danach zu
> *filtern* heißt, Menschen auszusortieren — bei einer App, die Minderjährige und
> Erwachsene zusammenbringt, ist das der Punkt, an dem Eltern und später Apple
> nachfragen. Gehört in die Rechtsfrage in Abschnitt 8, nicht nebenbei entschieden.

---

### Phase 16 — Direktnachrichten ✅ *(2026-09-02)*

Leopold: „mir ist aufgefallen, dass es nur für Aktivitäten Chats gibt und man nicht
einfach so Leuten schreiben kann." Nachgesehen — er hat recht, und zwar strukturell:
`ChatThread.postId` ist ein Pflichtfeld. Es *gibt* keine Nachricht ohne Aktivität.

- [x] **`ChatThread.postId` wird optional.** Fehlt er, ist es ein Direktchat.
- [x] **Schreiben darf, wer mir folgt UND wem ich folge** — Ians Entscheidung. Auf einem
      fremden Profil erscheint der Knopf „Nachricht" also erst, wenn beide sich folgen.
      Begründung: Bei einer App mit 16-Jährigen ist „jeder darf jedem schreiben" der
      Punkt, an dem Apple im Review nachfragt und Eltern abwinken.
- [x] **Ein Direktchat läuft NICHT ab** — Ians Entscheidung. Die 7-Tage-Regel aus
      `features/chat/lifecycle.ts` gilt weiter, aber **nur noch für Aktivitäts-Chats**.
      Das ist wichtig: `nachklangEnde(post)` braucht einen Post; ohne Fallunterscheidung
      bricht die Funktion. Zwei Sorten Chats mit zwei Regeln, jede aus einem Grund.
- [x] **Die Chat-Liste muss beide zeigen** und auseinanderhalten. `chat/sort.ts` (neue
      stumme Chats oben) gilt weiter.

**Neu dazugekommen beim Bauen:**

- [x] **`features/chat/direkt.ts`** — die Regeldatei, gebaut wie `block.ts` und
      `wisch.ts`: `SCHREIB_REGEL` mit allen drei Möglichkeiten im Kopf, `darfSchreiben()`
      führt sie aus, `schreibHuerdeText()` schreibt sie auf.
- [x] **Ein *sichtbarer* Hinweis, wenn man NICHT schreiben darf.** Ein Knopf, der einfach
      fehlt, sieht aus wie eine App, die die Funktion nicht hat — genau Leopolds
      ursprünglicher Eindruck. Auf Florians Profil (Ian folgt ihm, er Ian nicht) steht
      deshalb: „Schreiben könnt ihr euch, sobald ihr einander folgt."
- [x] **`PersonKopf` im Chat-Screen** — bei einem Direktchat steht oben die Person statt
      des Posts, der Tipp führt aufs Profil statt auf die Aktivität.
- [x] **`t3` in `data/mock.ts`** — ein Direktchat mit Mira, bewusst mit jemandem OHNE
      Aktivitäts-Chat. Dieselbe Überlegung wie bei p7 (dem Post ohne Bezirk): Ein Fall,
      den kein Datensatz zeigt, ist ein Fall, den niemand prüft.

**Was NICHT gebaut wurde und warum:**

- **Keine eigene Gruppe „Nachrichten" in der Chat-Liste.** Sie hätte Ians Sortierregel
  (`chat/sort.ts`) zerschnitten: Eine Direktnachricht von vor zwei Minuten stünde unter
  einem Aktivitäts-Chat von gestern, nur weil sie aus einer anderen Quelle kommt.
  Gruppiert wird nach ZUSTAND (aktiv/vorbei — Ians Regel), unterschieden wird je Zeile.
  Die Überschrift heißt deshalb jetzt „Aktuell" statt „Verabredet": Eine
  Direktnachricht ist keine Verabredung.
- **Kein Ersatz-Post für Direktchats.** Der hätte diesen einen Screen unverändert
  gelassen und dafür durch jede Farbe, jede Karte und jede Ablaufregel der App still
  falsche Antworten getragen. Stattdessen ist `ChatEintrag.post` optional — und genau
  DAS war der Hebel des ganzen Umbaus (siehe unten).
- **Kein grauer Ersatz-Streifen** an der Karte eines Direktchats. Er HAT keine
  Kategorie; ihm eine zu geben wäre dieselbe Notlüge wie der Ersatz-Post.

> 🔑 **Die Lehre aus Phase 16, und sie ist die Umkehrung von Phase 14:**
> `ChatThread.postId` optional zu machen erzeugte **null** Typfehler —
> `posts.find(p => p.id === thread.postId)` ist mit `undefined` gültiger Code und gibt
> still `undefined` zurück. Dieselbe Falle wie bei `Post.district` am selben Tag.
> `ChatEintrag.post` optional zu machen erzeugte **acht**, in genau den zwei Screens,
> die einen Post voraussetzen. **Wo ein Typ weiter wird, muss die Enge eine Ebene höher
> neu entstehen** — sonst prüft niemand mehr. Phase 14 hat einen Typ eng gemacht, damit
> `tsc` die Arbeitsliste schreibt; hier musste dafür erst die richtige Ebene gefunden
> werden.

---

### Phase 17 — Gruppen ✅ *(2026-09-02)*

Leopold: „Gruppen wären noch gut zu adden." Auf Nachfrage präzisiert: **Gruppen, die man
erstellen kann — zum Beispiel „MARS Wiese Tennis Gruppe".**

- [x] **Eine Gruppe ist eine dritte Sichtbarkeits-Stufe, kein zweiter Ort** — Ians
      Entscheidung. Beim Posten wählt man statt „Alle" oder „Nur Follower" auch „Nur
      Marswiese Tennis". `Visibility` ist dafür **ein diskriminiertes Union geworden**,
      kein erweiterter String (siehe unten, „Die Lehre").
      **Der Feed bleibt EIN Feed** — Gruppen-Posts erscheinen dort, mit dem Gruppennamen
      an der Karte (`components/SichtMarke.tsx`).
      *Verworfen:* eigener Tab mit eigenem Feed je Gruppe. Er hätte den Hauptfeed
      geleert, und ein leerer Hauptfeed ist am Anfang das größere Problem.
- [x] **Beitritt auf Anfrage, der Ersteller bestätigt** — Ians Entscheidung, und
      bewusst **dasselbe Muster wie „Bin dabei"** bei einer Aktivität: anfragen,
      bestätigen, drin. Deshalb liegen die Beitritts-Anfragen auch **im selben
      Anfragen-Tab** und zählen in **dieselbe Zahl** an der Tab-Leiste. Zwei Tabs
      hätten aus dem einen Muster wieder zwei gemacht.
      *Verworfen:* offen für alle (wer stört, ist schon drin) und nur per Einladung
      (dann findet niemand hinein, und genau das Finden ist der Zweck der App).
- [x] **Gruppe erstellen, beitreten, verlassen, Mitglieder sehen.** Drei Screens:
      `/gruppen` (finden), `/gruppe/neu` (anlegen), `/gruppe/[id]` (ansehen). Der Weg
      dorthin liegt am eigenen Profil, nicht in der Tab-Leiste — eine fünfte
      Schaltfläche für etwas, das laut Entscheidung 1 gerade KEIN eigener Ort ist,
      hätte das Gegenteil behauptet.
- [x] **Was passiert mit Gruppen-Posts, wenn jemand die Gruppe verlässt?**
      **Entschieden am 2026-09-02: sie bleiben stehen** (Abschnitt 6, Punkt 20).
      Und die zweite Hälfte derselben Frage, die vorher in keinem Plan stand:
      **Was, wenn der GRÜNDER geht? Die Leitung geht weiter** (Punkt 21).

**Was von außen sichtbar ist und was nicht** — das ist der Beweis, dass die Stufe
wirklich etwas tut: Wer nicht drin ist, sieht Name, Kategorie, Bezirk und die
Mitglieder**zahl**, aber weder die Posts noch die Mitglieder**liste**. In `mock.ts`
steht `g3` („Kino am Donnerstag") genau dafür: Ian ist nicht drin, und `p16` fehlt
deshalb in seinem Feed. Ohne diesen einen unsichtbaren Post sähe man nur ein Etikett
an einer Karte.

> **Die Lehre aus dieser Phase: eine Lockerung kann man auch ENG bauen.**
> Zweimal hat dieses Projekt dieselbe Falle bezahlt — `Post.district` (`string | null`)
> und `ChatThread.postId` (optional). Beide Male wurde ein Typ weiter, und der Compiler
> sagte zu keiner einzigen Stelle etwas.
>
> Hier stand die Frage zum dritten Mal an: `'public' | 'followers'` plus ein Feld
> `groupId: string | null` wäre der naheliegende Weg gewesen — und hätte den
> ungültigen Zustand „Gruppen-Post ohne Gruppe" erlaubt, den niemand sieht, bis ein
> Post im Feed fehlt. Als **diskriminiertes Union** (`{ kind: 'group'; groupId: string }`)
> ist dieser Zustand nicht darstellbar, und weil `post.visibility === 'followers'`
> damit ungültiger Code wird, hat `tsc` die Arbeitsliste geschrieben: **sieben Stellen
> in vier Dateien**, alle gefunden, bevor irgendetwas lief. Das ist dieselbe Technik
> wie `IconName` in Phase 14, nur auf ein Datenfeld statt auf eine Prop angewandt.
>
> **Der Preis steht auch dazu:** `SsSegment` vergleicht mit `===`, kann also keine
> Objekte auswählen. Der Erstellen-Screen hält deshalb den Schlüssel im Zustand und
> baut das Objekt beim Absenden (`sichtbarkeitBauen`). Der ungültige Zwischenzustand
> lebt damit im Screen — wo er behandelt wird — und nicht in den Daten.

> **Beim Durchklicken gefunden, und nur so zu finden:** Der Satz in der
> Verlassen-Rückfrage lautete „Deine Posts laufen weiter — du siehst sie nur nicht
> mehr." Das stimmte nicht. `darfIchSehen()` gibt bei EIGENEN Posts sofort `true`
> zurück, unabhängig von jeder Sichtbarkeitsstufe — eine ältere Regel, die hier
> weitergilt. Zwei Regeln, die einzeln richtig sind, ergaben zusammen etwas anderes,
> als der Erklärtext versprach. Der Satz ist korrigiert; der Haken an Ians
> Entscheidung ist dadurch **kleiner** geworden, als er ihm beschrieben wurde, und
> das steht so in `features/groups/gruppe.ts`.

---

### Phase 18 — Was aus Leopolds und Ians Rückmeldung folgt

> **Der Abschnitt war ein Plan und ist jetzt teils ein Bericht.** Ian am 2026-09-03:
> *„Fang schon mal an einen Plan zu schreiben was man ändern muss, aber ich wart noch
> auf die zwei anderen dass sie sich melden."* Am **2026-09-05** hat er gesagt: *„mit
> Plan weitermachen."* **18a ist damit gebaut** (siehe unten), 18b bis 18d stehen weiter
> als Plan da.

#### 18a — Gruppen: einladen, und privat vs. öffentlich ✅ *(gebaut am 2026-09-05)*

> ✅ **Fertig.** Leopolds Loch ist zu: Wer eine Gruppe gründet, sitzt nicht mehr allein
> drin. Was dabei entschieden und was dabei gefunden wurde, steht am Ende dieses
> Unterabschnitts unter „Was beim Bauen herauskam".

**Das Loch:** Phase 17 hat nur eine Richtung gebaut. Von aussen anfragen geht
(`beitrittAnfragen` → `beitrittBestaetigen`), von innen jemanden holen nicht. Leopold hat
eine Gruppe gegründet und sass allein drin.

> ✅ **Ians Entscheidung 24: Einladen aus der Gruppe heraus** (Abschnitt 6). Nicht der
> Einladungs-Link.

**Was zu bauen ist:**

| Datei | Was |
|---|---|
| `types/models.ts` | **`GroupInvite`** — eigener Typ, nicht `GroupRequest` mit einem Richtungs-Feld. Dritte Runde derselben Frage; die Antwort war zweimal „eigener Typ" (Phase 16 `ChatThread`, Phase 17 `GroupRequest`) und ist es hier wieder: Eine Anfrage trägt den Satz, den der Fragende geschrieben hat, eine Einladung trägt den nicht. |
| `types/models.ts` | **`Group.offen: boolean`** — bewusst ein Boolean und KEIN Union: Die zweite Stufe braucht keine zusätzlichen Daten (die Regel aus Phase 17 gilt genau dann, wenn sie welche braucht). |
| `features/groups/hooks.ts` | `einladen()`, `einladungAnnehmen()`, `einladungAblehnen()`, `useMeineEinladungen()`. Alles, was zusammengehört, in EINEM `aendern` (harte Regel 6). |
| `features/groups/gruppe.ts` | Die Regeln daneben, wie `AUSTRITT_WIRKUNG`: **wer einladen darf** und **was „privat" bedeutet**. Screens lesen sie nie (harte Regel 32). |
| `app/gruppe/[id].tsx` | Knopf „Leute einladen" → Liste der eigenen Follower, je ein „Einladen". Wer schon drin oder eingeladen ist, steht mit Zustand da statt mit Knopf. |
| `app/(tabs)/requests.tsx` | Eingegangene Einladungen — **im selben Tab und in derselben Zahl** wie Beitritts-Anfragen. Dasselbe Muster wie Phase 17, und aus demselben Grund: Es ist für den Empfänger dieselbe Sache („jemand will was von mir"). |
| `app/gruppe/neu.tsx` | Ein Schalter „offen / nur auf Einladung" beim Gründen. |
| `app/gruppen.tsx` | Private Gruppen, in denen ich nicht bin, tauchen in der Liste NICHT auf. |

**Zwei Fragen, die beim Bauen beantwortet werden müssen** — sie stehen hier, damit sie
nicht wieder erst im Code auffallen:
1. ✅ **Wer darf einladen — nur der Gründer oder jedes Mitglied?**
   **Ians Entscheidung 26 vom 2026-09-05: jedes Mitglied.** (`EINLADEN_DARF`)
2. ✅ **Was sieht ein Fremder, der den Link einer PRIVATEN Gruppe bekommt?**
   **Ians Entscheidung 27: Name, Kategorie, Bezirk und Mitgliederzahl — sonst nichts.**
   (`PRIVAT_SICHT`)

Dazu kam eine dritte, die im Plan nicht stand:
3. ✅ **Was ist beim Gründen voreingestellt? Ians Entscheidung 28: offen.**
   (`NEUE_GRUPPE_OFFEN`) Begründung wie bei `STANDARD` in `create.tsx`: Die
   Voreinstellung IST das, was fast alle abschicken.

#### Was beim Bauen herauskam *(2026-09-05)*

**Der Compiler hat wieder die Arbeitsliste geschrieben — diesmal nur zur Hälfte.**
`Group.offen: boolean` hinzuzufügen ist eine VERENGUNG: `tsc` meldete sofort die vier
Stellen, die eine Gruppe bauen. `GroupInvite` dagegen erzeugte **null** Fehler, weil
ihn noch niemand liest. **Ein neuer Typ ist kein Netz** — dort musste die Enge von Hand
entstehen, und die eine Stelle, an der sie gefehlt hätte, war `requests.tsx`: Die
Unterscheidung der Zeilen hing an `'gruppe' in item`, und eine Einladung trägt AUCH
eine `gruppe`. Sie wäre still als Beitritts-Anfrage gezeichnet worden, mit
„Aufnehmen"-Knopf. Geprüft wird jetzt an `einladung` — dem Feld, das nur eine der drei
Sorten hat.

**Drei Fehler, alle nur durchs Durchklicken gefunden**, keiner im Code sichtbar:

1. **Bei einer privaten Gruppe stand „Aufgemacht von Mira."** — ein Name aus genau der
   Mitgliederliste, die zubleiben soll. Zwei einzeln richtige Regeln: Phase 17 zeigt den
   Gründer, damit man weiß, wer die Anfrage bestätigt; Phase 18a verbirgt die Mitglieder.
   Bei einer privaten Gruppe **fällt der Grund für die erste weg und das Leck der zweiten
   bleibt**. Das ist dieselbe Sorte Fehler wie der falsche Satz in `austrittFolgen()`
   (Phase 17) — und wieder war der Beweis eine Zeile im gerenderten Text.
2. **Der Umschalter „Jeder kann anfragen" / „Nur auf Einladung" wurde auf 360 px zu
   „Jeder kann anfr…"** abgeschnitten. `SsSegment` teilt die Breite und schneidet ab,
   ohne sich zu beschweren. Dieselbe Falle wie „Sta…" in Phase 11, aber mit anderer
   Ursache: dort war es `flex: 1`, hier ist der Text schlicht zu lang. Jetzt **ein Wort
   je Seite** („Offen" / „Privat"), und zwar dasselbe Wort, das die Vorschau und die
   Gruppenseite benutzen.
3. **Eine private Gruppe zeigte ihrem Gründer „Anfragen ansehen".** Ein Knopf, der auf
   einen Vorgang zeigt, den es für diese Gruppe nicht gibt.

**Ein Prüfschritt ist dabei neu und lohnt sich weiter:** `scrollWidth > clientWidth` über
alle Textknoten findet abgeschnittenen Text — das Gegenstück zu `elementFromPoint` für
verdeckte Knöpfe. Beides zusammen mit der Überquell- und der Icon-Namen-Prüfung ist jetzt
ein Durchgang statt vier.

#### 18b — Jahrgang statt Alters-Bänder

> ✅ **Ians Entscheidung 25: der Schiebe-Balken kommt, auf JAHRGANG** — „mehr als
> Jahrgang brauchen wir nicht" (Abschnitt 6).

Das ist der Eingriff mit den weitesten Folgen in diesem Plan, weil er das **Datenmodell**
ändert und nicht eine Oberfläche. Heute:

```
AgeGroup = 'egal' | '14-17' | '18-25' | '26+'     ← am POST
AgeBand  = Exclude<AgeGroup, 'egal'>              ← am MENSCHEN
```

Danach: Ein Mensch hat einen **Jahrgang** (`2009`), ein Post eine **Spanne**. Vorschlag
für die Typen — dieselbe Bauart wie `Visibility` in Phase 17:

```
User.jahrgang: number
Post.alter: { kind: 'egal' } | { kind: 'spanne'; vonJahrgang: number; bisJahrgang: number }
```

**Warum wieder ein Union und nicht zwei Zahlen mit `| null`:** Sonst ist
„Spanne ohne Grenzen" darstellbar, und jede Anzeigestelle muss raten. Das ist die
vierte Runde derselben Frage (`Post.district`, `ChatThread.postId`, `Visibility`) — und
beim dritten Mal hat der Compiler die Arbeitsliste geschrieben. Hier ebenso: Sobald
`post.ageGroup === 'egal'` ungültig wird, findet `tsc` jede Stelle.

**Was dabei wegfällt und was bleibt:** Harte Regel 27 (`AgeGroup` vs. `AgeBand`) wird
ersetzt — *der Grund dahinter bleibt aber wahr*: Eine Aktivität kann „für alle" sein, ein
Mensch kann nicht „egal" alt sein. Im neuen Modell ist das sogar sauberer, weil ein
Jahrgang gar nicht „egal" sein KANN. **Ians Entscheidung 18 bleibt unangetastet:** Ein
Post „für alle" passt weiter zu jedem Alters-Filter (`ALTER_REGEL`).

**Betroffen:** `config/alter.ts` (die Bänder-Tabelle verschwindet), `features/posts/filter.ts`,
`app/create.tsx`, `components/PostCard.tsx`, `components/Profil.tsx`, `data/mock.ts`
(sechs Nutzer bekommen Jahrgänge), plus jede Stelle, die `AGE_LABELS` liest.

**Zwei Warnungen, die vor dem Bauen gehört werden wollen:**
1. **Ein Schieberegler in einem Scroll-Bereich ist die Phase-11-Geste noch einmal.**
   `PanResponder` gibt die Geste her, wenn jemand fragt — auf einem Handy nimmt der
   ScrollView sie beim ersten senkrechten Zucken. `onPanResponderTerminationRequest`
   muss auf `false`, sonst „läuft am Schreibtisch, klemmt am Handy" (Falle aus Phase 11).
   JS-only ist er machbar, ein Native-Modul kommt nicht in Frage (harte Regel 1).
2. **Ein Jahrgang ist genauer als ein Band, und das ist der Punkt — aber auch der Preis.**
   Auf einem Profil steht dann nicht mehr „26+", sondern etwas, aus dem man das Alter
   ausrechnen kann. Bei einer App mit 16-Jährigen hängt das an Abschnitt 8, Punkt 1
   (Mindestalter, DSGVO) — offen, wartet auf erwachsenen Rat.
   **Offene Frage für Ian:** Was steht am Profil — „Jahrgang 2009", „17", oder weiterhin
   ein grobes Band, während der Jahrgang nur zum Filtern dient? Das Letzte gäbe Leopold
   seinen Balken und Daria ihre Antwort, ohne jedem das genaue Alter anzuschreiben.

#### 18c — Die Chats übersichtlicher machen

Ian am 2026-09-03: *„ich finde es ist noch nicht ganz übersichtlich, inspiriere dich von
WhatsApp oder so für die Chats."*

**Nachgemessen auf 360 × 600, damit „übersichtlich" eine Zahl bekommt:**

| | SimplySocial heute | WhatsApp |
|---|---|---|
| Höhe einer Zeile | **100–118 px** — ungleich, weil die Nachricht umbricht | ~72 px, immer gleich |
| Abstand dazwischen | 12 px Lücke + Rahmen (jeder Chat ist eine KARTE) | 0, nur eine dünne Trennlinie |
| Textzeilen je Chat | **3** (Name + Zeit · Aktivität · Nachricht) | 2 |
| **Chats auf einem Schirm** | **4** | 7 |

**Was den Unterschied macht, in dieser Reihenfolge:**
1. **Karten zu Zeilen.** Jeder Chat ist heute eine eigene Karte mit Rahmen und 12 px
   Luft. Das ist im Feed richtig (dort ist eine Karte ein Angebot) und in einer Chat-Liste
   falsch — dort ist eine Zeile ein Weg. Allein das bringt drei Chats mehr aufs Bild.
2. **`numberOfLines={1}` auf die Nachricht.** 100 gegen 118 px ist der Unterschied
   zwischen einer Liste und einer Ansammlung; ungleiche Höhen sind der Hauptgrund,
   warum etwas „unruhig" aussieht.
3. **Die dritte Zeile ist die eigentliche Frage — und sie ist Ians.** „Tennis spielen ·
   Heute 19:30" ist genau das, was diese App von WhatsApp unterscheidet: Ein Chat gehört
   hier zu einer Verabredung. Streicht man sie, sieht die Liste aus wie WhatsApp und
   beantwortet nicht mehr, worum es geht. **Vorschlag:** Zeile behalten, aber klein und
   einzeilig neben die Uhrzeit statt als eigene Zeile — oder nur die Uhrzeit der
   Verabredung, weil der Kategorie-Streifen links das Thema schon trägt.

**Was NICHT geändert wird, und warum:**
- **Die Gruppen „Aktuell" und „Vorbei" bleiben** (harte Regel 30). WhatsApp hat keine
  Abschnitte, aber die beiden hier sind Ians Regel aus `chat/lifecycle.ts` — ein Chat,
  der abläuft, muss sich von einem unterscheiden, der läuft. Eine flache Liste würde
  seine Sortierregel zerschneiden.
- **Der Farbstreifen links bleibt** (harte Regel 29). Er trägt eine Auskunft, die
  WhatsApp nicht braucht: dass ein Direktchat KEINE Kategorie hat und deshalb keinen
  Streifen bekommt.

#### 18d — Im Vorrat, noch nicht entschieden

- **„Nicht 2 Sachen gleichzeitig"** (Leopold). Nichts prüft das heute. Kleines,
  eigenständiges Stück in `features/requests/logic.ts`, und es schützt vor genau der
  Enttäuschung, an der sich so eine App herumspricht — jemand kommt nicht. **Die Frage
  dahinter ist, ob es hart sperrt oder nur warnt.**
- **„Deine Gruppen" höher aufs Profil.** Der Knopf liegt bei **y = 1168 von 1380** —
  vorletztes Element. Leopold musste fragen, wie man eine Gruppe macht. Ians
  Entscheidung 16 (kein eigener Tab) bleibt davon unberührt; es geht nur darum, wie weit
  man scrollen muss.
- **Kalender-Funktion** (Leopold, ausdrücklich „für später").

### Nachtrag 2026-09-03 — die schiefen Karteikarten ✅

**Kein Phasen-Umbau, ein Fehler.** Ian beim Durchsehen am Computer: „bei den
Karteikarten ist das Weg-Zeichen immer da, das stört" und „ich weiß auch nicht, warum
sie so komisch gedreht ist". Beides stimmte, beides war **dieselbe Ursache**, und sie
saß seit Phase 11 drin.

**Was los war.** `WischKarte` rechnet alles aus der Zugstrecke, gemessen an der
Kartenbreite `b`: `inputRange: [-b, 0, b]`. Beim Web-Export gibt es kein Fenster —
`useWindowDimensions()` ist 0 und `onLayout` hat nie gefeuert, also ist `b` null. Aus
`[-b, 0, b]` wird `[-0, 0, 0]`, eine Spanne der Breite null, und React Native gibt bei
`inputMin === inputMax` den **ersten** Ausgabewert zurück statt den mittleren:

| Was | Sollwert in Ruhe | Was tatsächlich stand |
|---|---|---|
| Kippung | `0deg` | **`-16deg`** (= `MAX_KIPPUNG_GRAD × 2`) |
| Anheben | `1` | **`1.02`** |
| Stempel „Weg" | `0` | **`1`** — Ausgabe ist `[1, 0, 0]` |
| Stempel „Bin dabei" | `0` | `0` — Ausgabe ist `[0, 0, 1]` |

Deshalb war ausgerechnet **„Weg" sichtbar und „Bin dabei" nicht**: Die beiden Stempel
haben spiegelverkehrte Ausgabebereiche, und bei einer Spanne der Breite null entscheidet
allein, welche Zahl vorne steht.

**Warum es sich nicht von selbst repariert hat — das ist die eigentliche Lehre.** Nach
dem Start wird die Karte gemessen, `b` stimmt, `useMemo` baut die Interpolation neu.
Am Bild ändert sich trotzdem nichts: Eine `AnimatedInterpolation` schreibt nur dann in
den DOM, wenn ihr **Eingangswert** sich ändert. `pan.x` bleibt 0, bis jemand die Karte
anfasst — bis dahin steht der Bau-Zustand da. **Phase 13 hatte genau diesen Zustand
gesehen und mit `#ss-start` zugedeckt** (harte Regel 21). Verdecken repariert keinen
eingefrorenen Wert; die Abdeckung ging weg, der Dreh blieb.

**Der Fix ist eine Zeile plus eine Begründung:** `NOTBREITE = 320` in
`features/posts/wisch.ts`, und in `WischKarte` heißt es jetzt
`breite || fensterBreite || NOTBREITE`. Damit kann `b` nie null sein, die Spanne nie
zusammenfallen, und der Ruhezustand stimmt **schon im gebauten HTML** — ganz ohne
Messung. Der genaue Wert ist fast egal; dass er nicht 0 ist, ist der ganze Punkt.

**Wie es nachgewiesen wurde**, weil das Verfahren wiederverwendbar ist:
`dist/index.html` enthielt wörtlich `rotate(-16deg) scale(0.918|0.969|1.02)` und beim
„Weg"-Stempel `opacity:1` — dieselben Zahlen, die im laufenden Browser standen. **Wenn
gebautes HTML und laufender DOM dieselben Werte zeigen, hat nie jemand nachgeschrieben.**
Nach dem Fix: `rotate(0deg) scale(0.9|0.95|1)`, alle Stempel auf 0, und beim Ziehen um
115 px kippt die oberste Karte auf +5,1° und verlässt den Stapel (Zähler 8 → 7).

> **Nebenbefund, gleicher Tag:** Ein geänderter Metro-Hash beweist keine inhaltliche
> Änderung — Metro nummeriert die Module bei jedem Lauf neu, also ändert schon ein
> Kommentar den Dateinamen. Belastbar wird der Vergleich, wenn man `},<id>,[deps])` am
> Modulende wegschneidet und die Rümpfe als MENGE vergleicht. So ließ sich zeigen, dass
> alle 850 Module gleich waren und ein Deploy gar nicht nötig gewesen wäre.

---

### Nachtrag 2026-09-03 (2) — das Filterfeld schob den Stapel kaputt ✅

**Gefunden beim Durchklicken der LIVE-Fassung in Handybreite**, nicht im Code. Das war
der Zweck des Durchgangs: Die drei Mitgründer kennen Phase 13; Filter, Direktchats und
Gruppen hat am Handy noch nie jemand angefasst.

**Was los war.** Tippt man im Stapel auf „Filter", klappte das Feld im normalen
Layoutfluss auf und nahm dem Stapel rund 250 px. Die Kartenfläche ist aber
`flex: 1` — sie bekommt den **Rest**, nicht ein Mindestmaß. Und die Karten darin liegen
`position: absolute`, schrumpfen also **nicht** mit: Sie quollen aus ihrer Fläche
heraus, wegen `justifyContent: 'center'` gleich nach beiden Seiten.

Gemessen auf 390 × 844:

| Element | y-Bereich | Was passierte |
|---|---|---|
| Kategorie-Pillen | 494–544 | Karte lag **darüber** |
| Kartenfläche | 535–681 (146 px) | 67 px zu kurz für die Karte |
| Oberste Karte | 502–715 (213 px) | **34 px Überstand je Seite** |
| „Bin dabei" | 681–712 | lag **über** der Karte |

Auf einem iPhone SE (375 × 667) war es eindeutig kaputt: Die Karte verdeckte die
Reihe **„Für wen"** — ausgerechnet den Alters-Filter, den Daria und Leopold wollten —,
die Knöpfe lagen mitten im Kartentext, und die Kategorie-Reihe war ganz weg.

**Warum es nie jemandem aufgefallen ist.** Am breiten Fenster passt beides nebeneinander;
der Fehler braucht wenig Höhe UND ein offenes Filterfeld. Dieselbe Sorte wie der
`PanResponder` in Phase 11: „läuft am Schreibtisch, klemmt am Handy".

> ✅ **Ians vierzehnte Entscheidung, 2026-09-03: das Filterfeld legt sich über die
> Karten, statt sie wegzuschieben.** Verworfen: beim Filtern automatisch auf die Liste
> springen (die App wechselt die Ansicht, ohne dass man es gesagt hat) und ein eigener
> Filter-Bildschirm (am meisten Platz — aber Abschnitt 9b sagt schon jetzt, dass 17
> Routen zu viele sind). Dasselbe Muster wie sein Urteil zum Prototyp-Hinweis (harte
> Regel 22): **Was nur eine Weile da ist, überdeckt — es schiebt nicht.** Den Haken
> kennt er: Beim Filtern sieht man die Karte nicht. Getragen wird das vom Zähler
> „Noch 8 Karten" oben, der beim Tippen live mitzählt (nachgemessen: 8 → 2 bei „Sport",
> 8 → 7 bei „18–25").

**Der erste Anlauf war zu kurz gesprungen, und das ist die Lehre.** Das Blatt lag
zunächst im Screen über dem ganzen Stapelbereich. Auf 390 × 844 und 375 × 667 sah das
richtig aus — auf **360 × 600 verschwanden „Weg" und „Bin dabei" vollständig
dahinter**. Der Screen weiß eben nicht, wo die Karten aufhören und die Knöpfe anfangen;
er hätte eine Höhe raten müssen.

**Der Fix ist deshalb ein Slot, kein Overlay im Screen.** `WischStapel` nimmt jetzt
`blatt?: ReactNode` und hängt es **in die Kartenfläche** — dort heißt
`maxHeight: '100%'` wörtlich „bis zu den Knöpfen und keinen Punkt weiter", ohne dass
irgendwo eine Zahl steht, die jemand nachziehen müsste, wenn eine fünfte Filterreihe
dazukommt. Passt es nicht, scrollt das Blatt, statt abgeschnitten zu werden — ein
Filter, dessen unterste Reihe hinter der Kante liegt, wäre derselbe Fehler noch einmal,
nur leiser.

**Und weil ein abgeschnittener Kasten seine untere Rahmenlinie verliert**, sieht er
abgerissen aus statt fortgesetzt. Deshalb hat das Blatt unten eine **weiche Kante** —
dieselbe Technik wie `SsScrollReihe` (gestapelte Flächen statt eines Verlaufs, harte
Regel 19), senkrecht, und mit derselben Regel: **nur, wenn wirklich etwas
abgeschnitten ist.** Nachgemessen: auf 360 × 600 da, ganz unten weg, auf 390 × 844 gar
nicht erst vorhanden.

**Nachgewiesen mit `elementFromPoint`, nicht mit dem Auge.** Eine erste Messung an den
Text-Knoten legte nahe, die Knöpfe seien verdeckt — sie waren es nicht. Wer wissen
will, ob ein Knopf bedienbar ist, fragt den Browser, wer an dieser Stelle wirklich
getroffen wird. Endstand auf 360 × 600: Blatt endet bei y = 437, „Bin dabei" beginnt
bei y = 449, Treffer bei Knopfmitte = „Bin dabei".

**Was dabei sonst geprüft wurde** (alles in Ordnung): der Wischstapel steht nach dem
`NOTBREITE`-Fix live gerade und ohne „Weg"-Stempel · die Gruppen-Liste, die
Gruppen-Detailseite und die Verlassen-Rückfrage samt dem in Phase 17 korrigierten Satz
· die Chat-Liste mit gemischten Aktivitäts- und Direktchats · die waagrechten
Filterreihen scrollen auch **geschachtelt** im senkrechten Blatt · React #418 in der
Konsole ist die bekannte, dokumentierte Hydration-Warnung.

### Nachtrag 2026-09-03 (3) — der Durchgang zu Ende geklickt ✅

**Der Durchgang vom Morgen war nicht fertig.** Abgedeckt waren Stapel, Filter,
Gruppen und Chat-Liste; **nicht** abgedeckt war ausgerechnet der Kernablauf — posten,
„Bin dabei", bestätigen, Chat — und die Direktnachrichten. Also genau die Wege, die
die drei Mitgründer als Erstes gehen werden. Nachgeholt auf **375 × 667 und
360 × 600**, auf der Live-Fassung. Zwei echte Fehler, beide von derselben Bauart wie
die zwei am Morgen: **im Code ist jede Zeile für sich richtig, falsch wird erst die
Zusammensetzung.**

#### Fund 1 — der rote Hinweis zeigte aus dem Bild hinaus

Bei offenem „Mehr einstellen" ist der Erstellen-Screen **1991 px** hoch, das Fenster
eines iPhone SE **667**. Wer unten auf „Posten" tippt und den Titel vergessen hat, las
„Es fehlt noch was — die roten Stellen" — und auf dem ganzen Bildschirm war nichts rot.

Gemessen auf 375 × 667, im Moment des Tippens:

| Was | Wert |
|---|---|
| Scrollposition | 1294 von 1991 |
| Sichtfenster | 667 px |
| Rote Zeile „Ein paar Wörter, damit man weiß, was los ist." | **y = −752** |

Also mehr als eine volle Bildschirmhöhe über der Kante. **Warum es durchgerutscht ist:**
`VERSTECKTER_FEHLER` (Abschnitt 6, Punkt 9) behandelt genau diesen Fall — aber nur für
*zugeklappte* Felder. Der Code setzt Sichtbarkeit mit **aufgeklappt** gleich statt mit
**im Bild**, und der Fall „aufgeklappt, aber 752 px weiter oben" fällt zwischen beide.

Behoben nach Ians Entscheidung 15 (Abschnitt 6, Punkt 23): Der Screen springt zur
ersten roten Stelle, **und** der Satz benennt das Feld. Drei Sachen daran sind wichtiger
als der Sprung:

1. **Die Reihenfolge, in der `fehler` geschrieben ist, IST die Sprungreihenfolge.**
   `Object.keys` hält die Schreibreihenfolge ein, und die entspricht dem Bildschirm —
   deshalb steht keine zweite Liste daneben, die jemand nachziehen müsste.
2. **`SsScreen` hat jetzt ein `scrollRef`.** Der Scroll-Bereich liegt im Baustein, also
   muss der Griff darauf von dort kommen. Bewusst ein Ref und keine `scrollZu()`-Prop:
   Wer scrollen will, braucht irgendwann auch `scrollToEnd` — und dann baut man
   `ScrollView` im Baustein nach.
3. **Der Satz heißt „Schau noch mal beim Titel", nicht „Es fehlt noch der Titel".**
   Zwei der fünf Meldungen betreffen ein Feld, das ausgefüllt und trotzdem falsch ist
   („Das ist schon vorbei.", „Ein Wiener Bezirk zwischen 1010 und 1230."). „Es fehlt"
   wäre dort schlicht unwahr. Ab drei Fehlern bleibt der alte allgemeine Satz.

Nachgemessen nach dem Fix, beide Fälle:

| Fall | Scroll vorher | Scroll nachher | Feld danach bei | Satz |
|---|---|---|---|---|
| offenes Formular, Titel leer | 1210 | 434 | y = **+53** | „Schau noch mal beim Titel." |
| **zugeklappt**, Bezirk „9999" | 0 | 792 | y = **+53** | „Schau noch mal beim Bezirk." |

Der zweite ist der heikle: Das Feld existiert im DOM noch gar nicht, wenn man tippt —
`VERSTECKTER_FEHLER` klappt erst auf. Deshalb wartet der Sprung **zwei** Bilder
(`requestAnimationFrame` doppelt): Auf Web meldet `onLayout` über einen ResizeObserver
und damit erst nach dem Zeichnen. Ein einzelnes Bild hätte am Mac funktioniert und auf
einem langsameren Gerät nicht — die Sorte Fehler, die man nie wieder findet.

#### Fund 2 — zwei Leer-Zustände übereinander

Sucht man im Feed nach einem Wort, das in keinem Post vorkommt, standen **zwei**
Leer-Zustände untereinander, die einander widersprachen:

- „**Hier ist der Stapel durch**" — *Mit einem anderen Filter liegen vielleicht noch
  Karten da.* + Posten + „Zur Listenansicht wechseln"
- „**Dazu ist gerade nichts da**" — *Mit einem anderen Filter findest du vielleicht
  mehr.* + „Filter zurücksetzen"

Der zweite lief auf 360 × 600 unten aus dem Bild; der Ausweg („Filter zurücksetzen")
lag zur Hälfte hinter der Tab-Leiste.

**Die Ursache ist eine stille Annahme, kein Tippfehler.** `StapelDurch` ist als
**Überschrift über einer Liste** gebaut — sein eigener Kommentar sagt das ausdrücklich,
und sein Text verspricht sie („Alles, was du gesehen hast, steht unten weiter in der
Liste"). Das stimmt fast immer, weil der Stapel wegnimmt, was man gesehen hat, und die
Liste nicht. Nur wenn ein Filter beide leert, ist die Überschrift eine Überschrift über
nichts — und `LeererFeed` sagt dasselbe darunter noch einmal, mit dem Ausweg, den die
Überschrift nicht hat.

Behoben mit `listeHatWas`: `StapelDurch` erscheint nur, wenn darunter wirklich eine
Liste steht. **Das trifft auch den wichtigsten leeren Zustand der App** — den stillen
Dienstag aus Abschnitt 8. Ohne Filter und ohne einen einzigen Post stand bisher „Das
war alles für heute" über einer leeren Fläche; jetzt steht dort „Noch nichts los in
deinem Feed" mit dem Knopf „Etwas posten". Genau das, was Abschnitt 9b als den echten
Haken der App benennt.

Beide Zweige nachgeprüft: durchgewischt → Überschrift **plus** volle Liste; wirklich
leer → **ein** Leer-Zustand mit dem Ausweg, vollständig im Bild.

#### Fund 3 — eine Entwickler-Notiz stand im Nutzungsbedingungen-Screen

Im roten Kasten („Dieser Teil fehlt noch — mit Absicht") stand als letzte Zeile:
**„Steht auch in `_FUER_IAN/OFFENE_SACHEN.md`."** Zwei Fehler in einer Zeile:

1. **Die Backticks wurden als Zeichen mitgerendert.** Eine Markdown-Konvention an einer
   Stelle, an der es kein Markdown gibt — dieselbe Sorte wie das Backtick im CSS-Block
   von `+html.tsx` (Falle vom 2026-09-02), nur harmloser: Dort brach der Build, hier
   sah es bloss nach Formatierungsfehler aus.
2. **`_FUER_IAN/` ist ein privater Arbeitsordner.** Harte Regel 12 sagt, der Prototyp
   ist öffentlich abrufbar und Links werden weitergeleitet — und ausgerechnet der
   Nutzungsbedingungen-Screen ist der, der seriös wirken soll. Ein Fremder las dort
   einen Dateinamen, der an eine einzelne Person adressiert ist.

Entfernt; der Zeiger auf die Datei stand ohnehin schon im Dateikopf, wo er hingehört.
**Nachgeprüft, dass es die einzige Stelle war:** `document.body.innerText` auf dem
Screen enthält jetzt null Backticks und kein `_FUER_IAN` — alle übrigen Treffer im Code
stehen in Kommentaren, nicht in gerendertem Text.

#### Fund 4 — der Einstellungen-Screen zeigte die Icon-NAMEN als Text

**Ian hat ihn gemeldet, mit einem Screenshot.** Auf `/einstellungen` stand links neben
jeder Zeile nicht das Symbol, sondern sein Name — umgebrochen in einer 22 px schmalen
Spalte, also „bl / att", „m / ue / ll", „ba / us / tei / ne".

**Ein Rest aus der Emoji-Zeit, und er hat aus genau einem Grund überlebt.** Die lokale
Komponente `Zeile` in `einstellungen.tsx` rendert das Symbol seit jeher als
`<SsText>{icon}</SsText>` — richtig, solange `icon` ein Emoji war („📄"). Phase 14 hat
den **Wert** auf `"blatt"` umgestellt, aber nicht den **Zeichner**. Der Chevron zwei
Zeilen tiefer war schon `<SsIcon>`; es war diese eine Stelle.

> **Und das ist die Umkehrung der Phase-14-Lehre, nicht ihr Gegenbeispiel.** Dort steht:
> „Der ganze Umbau von ~100 Emojis war nur deshalb vollständig, weil `SsButton.icon` von
> `string` auf `IconName` umgestellt wurde, BEVOR die Ersetzung anfing." Genau das ist
> hier nicht passiert: `Zeile` hatte eine **eigene** Prop, und die blieb `icon: string`.
> Damit war `"blatt"` ein gültiger Wert, `tsc` hatte keinen Grund sich zu melden, und die
> Stelle fiel aus der Arbeitsliste heraus, die der Compiler geschrieben hat.
> **Ein Union-Typ schützt nur die Props, die ihn tragen** — eine lokale Komponente mit
> `string` ist ein Loch im Netz.

Behoben: `icon: IconName`, `<SsIcon name={icon} size={20} …>`, und die Farbe folgt dem
`rot`-Zustand — der Mülleimer ist jetzt rot wie sein Text, was ein Emoji nie konnte.

**Die Prüfung, die so etwas findet, gibt es jetzt** und sie ist eine andere als die
bisherigen: keine Geometrie, sondern Text. Über **19 Routen** wurde
`document.body.innerText` gegen die Liste der 42 Icon-Namen aus `theme/icons.ts`
geprüft. Ergebnis nach dem Fix: zwei Treffer, beide richtig — „treffen" in einem echten
Chatsatz („Passt, dann treffen wir uns direkt am Platz.") und `/bausteine`, die
Werkstatt, die die Namen absichtlich zeigt.

> **Der unangenehme Teil:** Der Beweis stand schon in meinen eigenen Messdaten. Beim
> Durchgang über `/einstellungen` gab die Knopf-Prüfung `"txt": "muellAccount
> löschenDein Pro…"` und `"txt": "blattNutzungsbedingungen…"` aus — der Icon-Name klebte
> im `textContent`, sichtbar in der Ausgabe. Ich habe auf das Feld geschaut, das ich
> suchte (verdeckt: ja/nein), und den Rest der Zeile überlesen. **Wer misst, liest den
> ganzen Datensatz, nicht nur die Spalte, wegen der er gemessen hat.** Und: Ein
> Screenshot hätte es sofort gezeigt — auf diesem Screen wurde nur gerechnet, nie
> hingeschaut.

#### Die restlichen Screens in Handybreite — alle sauber

Damit ist der Gang vollständig. Nachgeholt am 2026-09-03 auf **360 × 600**, live:
`/einstellungen` · `/nutzungsbedingungen` · `/account-loeschen` · `/melden` ·
`/user/[id]/follower` · `/post/[id]`. Geprüft wurde je Screen dasselbe Raster: quillt
etwas seitlich heraus, und wird jeder Knopf per `document.elementFromPoint` an seiner
Mitte wirklich getroffen. **Ergebnis: kein seitliches Überquellen, kein verdeckter
Knopf.**

> **Ein Beinahe-Fehlalarm, und er ist die Lehre:** Auf `/einstellungen` meldete das
> Raster zuerst zwei verdeckte Knöpfe („Account löschen", „Bausteine anschauen"). Oben
> lag der **Prototyp-Hinweis** — und der SOLL überdecken (harte Regel 22, Ians
> Entscheidung). Sein „Verstanden" liegt mit im Kasten und ist erreichbar; danach war
> kein Knopf mehr verdeckt. **`elementFromPoint` sagt, ob etwas getroffen wird, nicht
> ob das richtig ist.** Wer nur die Zahl liest, repariert eine Entscheidung.

#### Was dabei sonst geprüft wurde — alles in Ordnung

Erstellen-Screen mit Gruppen-Sichtbarkeit (die Vorschau zeigt „Nur Marswiese Tennis") ·
Post-Detail mit „Sichtbar für" · Anfragen-Tab mit **gemischten** Aktivitäts- und
Gruppen-Anfragen (eigener Kopf je Gruppe, „Aufnehmen" statt „Bestätigen") ·
Match-Screen mit zwei verschieden gefärbten Kreisen (der Phase-14-Fix hält) · Chat aus
dem Match · Direktchat mit Mira (kein Post-Kopf, richtig) · die Schreib-Hürde bei
Florian (Satz statt Knopf) · die Antwort-Leiste auf 360 × 600 (Vollbild-Blatt, alles
erreichbar) · „Doch nicht" legt die Karte zurück (Zähler 7 → 8) · Gruppe gründen ·
kein seitliches Überquellen auf /gruppen und /profile · die Tab-Leiste ist per
`elementFromPoint` überall getroffen.

**Der zugeklappte Erstellen-Screen sieht nach dem Umbau pixelgleich aus.** Die fünf
`View`s um die rot werdenden Felder sind reine Anker für `onLayout` und bekommen
absichtlich kein `style` — der Abstand kommt weiter vom `gap` des Scroll-Inhalts.

---

## 6. Ian schreibt selbst

Stellen mit echten Trade-offs, an denen Ians Meinung das Produkt formt. Jeweils
Datei anlegen, Signatur + Kommentar vorbereiten, `TODO` setzen, dann fragen.

1. ✅ **Feed-Sortierung** (`src/features/posts/sort.ts`) — **entschieden am 2026-08-31:
   das Neueste zuerst.** Ians Begründung sinngemäß: Wer postet, soll gesehen werden.
   Bei fünfzig Leuten aus der Graphischen ist das Problem nicht „zu viele Posts",
   sondern „postet überhaupt jemand".
   Den Haken kennt er: ein Post für ein Konzert in drei Wochen steht direkt nach dem
   Absenden über dem Tennis in zwei Stunden. Falls sich das im Betrieb beißt, steht die
   Korrektur als zwei Zeilen im Kopf der Datei (`heuteZuerst` davorschalten) — das wäre
   eine Verfeinerung, keine Abkehr. **Nicht ohne Rückfrage umstellen.**

2. ✅ **Wann ein Post verschwindet** (`src/features/posts/lifecycle.ts`) —
   **entschieden am 2026-08-31: bis zum Ende des Tages, und der Poster darf wählen.**
   Ians Worte: *„Wenn man schreibt 'wer will heute Tennis spielen', verschwindet es am
   nächsten Tag. Es sollte aber eine Option geben, wo man beim Posten sagen kann, dass
   man's kürzer oder länger haben will — wenn man das ignoriert, sollte es ein Tag sein."*
   Umgesetzt als drei Möglichkeiten im Erstellen-Screen: „Bis es losgeht" ·
   **„Bis Tagesende"** (Standard) · „Einen Tag länger". Technisch am `expiresAt` des
   Posts; fehlt es, greift der Standard.

3. ✅ **Was passiert, wenn Plätze voll sind** (`src/features/requests/logic.ts`) —
   **entschieden am 2026-08-31: Warteliste, still.** Übrige Anfragen bleiben stehen
   (`pending`) statt automatisch abgesagt zu werden. Springt jemand ab, kann der Poster
   sie doch noch bestätigen. Kein eigener Zustand „Warteliste", keine zusätzliche
   Beschriftung, keine Extra-Gruppe im Screen — Ian hat unter drei Möglichkeiten die
   stille gewählt.
   Den Haken kennt er: Wer wartet, sieht weiter „Anfrage geschickt · muss noch
   bestätigen" — auf etwas, das meistens nie kommt. Und die Zahl am Anfragen-Tab zählt
   diese Anfragen mit, obwohl man sie gerade nicht bestätigen KANN. Der Screen mildert
   es mit einem Satz am ausgegrauten Knopf.
   Verworfen: **A) automatisch absagen** (läse sich für den Wartenden wie eine Absage
   des Posters, und bei einem Absprung wäre er schon weg) und **C) Warteliste mit
   eigener Beschriftung** (ehrlicher, aber ein Zustand mehr, den die App erklären muss).
   Beide stehen samt Begründung im Kopf von `logic.ts`. **Nicht ohne Rückfrage ändern.**

4. ✅ **Was mit einem Chat passiert, wenn das Treffen vorbei ist**
   (`src/features/chat/lifecycle.ts`) — **entschieden am 2026-09-01: erst C, dann B.**

   Die Frage folgt direkt aus Ians Regel 6.2: Ein Post verschwindet am Ende seines
   Tages aus dem Feed. Der Chat dazu lebt weiter — und niemand hatte gesagt, wie lange.
   Daran hängt, was die App über ein Jahr ist: ein Verzeichnis von Leuten, die man mal
   getroffen hat, oder ein Werkzeug für heute Nachmittag.

   Ians Antwort auf die drei Möglichkeiten war **„B ist gut und C auch"**. In reiner
   Form schließen die beiden einander aus — B löscht, C hebt auf. *Nacheinander* sind
   sie aber genau eins, und er hat diese Fassung gewählt:

   > Der Chat rutscht nach dem Treffen in die Gruppe **„Vorbei"** (C) und verschwindet
   > dort nach **einer Woche** von selbst (B).

   Das nimmt beiden ihren Haken: Bs Problem war der Chat, der um 23:30 weg ist, während
   man noch schreibt — die Woche Nachklang räumt es weg. Cs Problem war, dass „Vorbei"
   mit der Zeit zum Friedhof wird — dass die Gruppe sich selbst leert, räumt es weg.

   **Was Ian dabei in Kauf genommen hat:** Nach der Woche ist der Kontakt wirklich weg.
   Wer Lea wieder treffen will, findet sie über ihren Post oder ihr Profil, nicht über
   den alten Chat. Möglichkeit **A** (aus Treffen wachsen dauerhafte Kontakte) ist damit
   bewusst verworfen — die Freundschaftsfunktion ist der Social-Layer aus Phase 6, nicht
   das Postfach.

   Die Woche steht als **eine Zahl** im Code (`NACHKLANG_TAGE`), weil sie
   erfahrungsabhängig ist. Beide Screens sagen die Regel an: die Gruppenüberschrift
   („Verschwindet 7 Tage nach dem Treffen.") und der Chat selbst („Der Chat verschwindet
   in 6 Tagen."). Etwas, das von allein verschwindet, muss das vorher ankündigen —
   sonst sieht es wie ein Fehler aus.

5. ✅ **Was in der Chat-Liste oben steht** (`src/features/chat/sort.ts`) —
   **entschieden am 2026-09-01: die neuen Chats, immer.**

   Ians Satz: *„Die neuen Chats sollten immer ganz oben sein."* Das **„immer"** ist der
   Inhalt der Entscheidung. Nach Zeit sortiert stünde ein frisches Treffen zwar auch
   oben — aber nur, bis in einem alten Chat jemand schreibt. Dann rutscht ausgerechnet
   der eine Chat darunter, in dem noch NIE etwas gesagt wurde. Genau der ist aber der
   wichtigste: Solange dort nichts steht, ist der Treffpunkt nicht ausgemacht.

   Umgesetzt als „stumme zuerst, darunter nach Bewegung". „Neu" heißt dabei **noch
   stumm**, nicht zuletzt angelegt — ein Chat von gestern, in dem nie jemand etwas
   gesagt hat, braucht denselben Anstoß wie einer von vor fünf Minuten.

   Dieselbe Haltung wie bei 6.1 (das Neueste zuerst im Feed): Was gerade entstanden
   ist, soll gesehen werden.

   **Den Haken kennt er:** Ein leerer Chat bleibt oben, auch wenn darunter ein Gespräch
   läuft, das gerade wichtiger ist. Die Regel räumt sich von selbst auf — mit der ersten
   Nachricht ordnet der Chat sich normal ein. Falls sich das im Betrieb festfährt, ist
   die Verfeinerung eine Zeile (`frischeZuerst` weglassen). **Nicht ohne Rückfrage.**

6. ✅ **Was auf einem Profil steht** (`src/features/posts/profil.ts`) —
   **entschieden am 2026-09-01: nur, was gerade läuft.**

   Die Frage folgt direkt aus 6.2 und 6.4: Ein Post verschwindet am Ende seines Tages,
   ein Chat eine Woche nach dem Treffen. In SimplySocial überlebt nichts seinen Anlass.
   Das Profil war die erste Stelle, an der das eine echte Frage aufwirft — denn ein
   Profil beantwortet für jemand Fremden: *„soll ich mit dieser Person Tennis spielen?"*

   Ian hat **A** gewählt: das Profil zeigt genau die Posts, die auch im Feed stehen.
   Ein Aushang, kein Archiv. Verworfen sind damit **B** (zusätzlich eine Gruppe
   „Schon gewesen" — das stärkste Vertrauenssignal, das die App ohne Bewertungen hätte,
   aber der einzige Ort, an dem doch alles bleibt) und **C** (das Gewesene nur als Zahl
   „17 Treffen gepostet" — eine Zahl, die niemand nachprüfen kann und die Menge statt
   Verlässlichkeit belohnt).

   **Was er in Kauf genommen hat:** Wer gerade nichts geplant hat, hat ein leeres
   Profil — und das trifft die meisten Leute die meiste Zeit, ausgerechnet dann, wenn
   jemand überlegt, ob er schreiben soll.

   Die Oberfläche fängt genau das ab: Ein Profil ohne laufende Posts zeigt nicht „nichts
   gefunden", sondern Bio, Bezirk und Interessen — und darunter einen Satz, dass gerade
   nichts geplant ist. **Die Interessen tragen dort die Last, die sonst die Post-Liste
   trägt.** Deshalb stehen sie weit oben und nicht als Beiwerk unten.

   Falls sich das im Betrieb beißt, ist die Korrektur eine Zeile (`auchVergangene` statt
   `nurAktuelle`) plus die zweite Gruppe im Screen. **Nicht ohne Rückfrage.**

7. ✅ **Was „blockieren" bedeutet** (`src/features/safety/block.ts`) —
   **entschieden am 2026-09-01: alles weg.** Die härteste der drei Möglichkeiten.
   Ians Wahl war „Hart: alles weg": Der Chat verschwindet, eine bestätigte Verabredung
   wird abgesagt, der Platz im Post wird wieder frei.

   Die Frage ist in dieser App eine andere als in jeder Chat-App, und daran hängt die
   Antwort: Bei Instagram heißt blockieren „sieht meine Bilder nicht mehr". In
   SimplySocial heißt es „taucht nicht mehr am selben Ort auf wie ich". Eine
   Verabredung, die einen Block überlebt, ist genau das Problem, vor dem der Block
   schützen soll.

   **Den Haken kennt er:** Ein Fehlgriff kostet eine echte Verabredung, und die andere
   Person erlebt sie als kommentarlose Absage — sie erfährt nicht, dass sie blockiert
   wurde, sie sieht nur, dass die Zusage weg ist. Deshalb ist Blockieren neben dem
   Löschen des Kontos die einzige Aktion in der App, die vorher **nachfragt**, und in
   dieser Rückfrage steht Punkt für Punkt, was passiert — aus `blockFolgen()`, damit
   dort nie etwas anderes steht, als die Regel tut.

   Verworfen: **LEISE** (nur nichts Neues mehr — Haken: man blockiert meistens wegen
   etwas, das im Chat passiert ist, und genau der bliebe stehen) und **GETRENNT**
   (Chat lesbar, aber stumm; absagen als eigener Schritt — Haken: zwei halbe Zustände,
   man muss verstehen, dass „blockiert" nicht „abgesagt" heißt). Beide stehen als
   fertige Konstanten in `block.ts`; Umstellen ist ein Wort. **Nicht ohne Rückfrage.**

8. ✅ **Was ein Wisch bedeutet** (`src/features/posts/wisch.ts`) — **entschieden am
   2026-09-01: links = weg für diese Sitzung, rechts = Leiste mit vorausgefülltem
   Gruß.** Ians zehnte und elfte Entscheidung, umgesetzt in Phase 11.

   Die Frage steht anders da als die sieben davor, weil sie zwei Teile hat. Der erste
   ist beantwortet, bevor diese Datei anfängt: **Wischstapel ODER Feed?** Ians Antwort
   war „beides, Stapel vorn" — die Begründung steht in Abschnitt 1 und gilt weiter.

   Offen war nur, was die beiden Richtungen HEISSEN:
   - **Links** ist „weg für diese Sitzung". Verworfen: *weg für immer* (ein Fehlwisch
     wäre endgültig, und ein Prototyp, der bei jedem Neuladen von vorn anfängt, kann
     diese Endgültigkeit gar nicht halten) und *nur nach hinten* (dann heißt links
     „nicht jetzt" statt „nein", und der Stapel dreht sich im Kreis, statt fertig zu
     werden).
   - **Rechts** ist die Leiste mit vorgeschriebenem Gruß. Ians Worte: *„mit einem
     vorgeschriebenen HEY oder so, damit wenn er keine Lust hat zu schreiben, einfach
     schicken kann."* Verworfen: *sofort anfragen ohne Text* (der Poster entscheidet,
     wen er trifft — woran soll er das bei zehn wortlosen Anfragen festmachen?) und
     *aufs Detail springen* (dann ist der Wisch keine Antwort, sondern nur Blättern).

   **Den Haken kennt er:** Wenn alle den vorgeschlagenen Satz stehen lassen, steht
   beim Poster zehnmal derselbe — dann unterscheidet er niemanden mehr, sondern
   bestätigt nur. Das ist der Preis dafür, dass Zusagen billig bleiben darf.

   **Von mir dazu, und er kann es streichen:** ein „Rückgängig" für ein paar Sekunden
   nach dem Wisch nach links (`RUECKGAENGIG_MS`, 0 schaltet es ab). Der Fehlwisch ist
   die häufigste Beschwerde bei Wisch-Oberflächen, und hier kostet er eine mögliche
   Verabredung.

   Alle drei mal drei Möglichkeiten stehen als benannte Konstanten in der Datei
   (`SITZUNG_UND_GRUSS`, `SCHNELL`, `NUR_BLAETTERN`). Umstellen ist ein Wort — bei
   `'immer'` kommt ein Speicher in `wegwischen()` dazu. **Nicht ohne Rückfrage.**

9. ✅ **Was passiert, wenn ein VERSTECKTES Feld ungültig ist** (`src/app/create.tsx`)
   — **entschieden am 2026-09-02, und zwar anders als gefragt.**

   Zur Wahl standen `'aufklappen'`, `'reparieren'` und `'nur melden'`. Ian hat keine
   davon genommen, sondern die Frage weggenommen: **„Ich würde es optional machen,
   dass man, wenn man wirklich nicht will, die Option hat, keinen Bezirk anzugeben."**

   Damit ist ein leeres Bezirksfeld kein Fehler mehr, und der häufigste Fall des
   Problems existiert nicht mehr. Das ist keine Ausweichantwort — es ist die bessere:
   Ein Fehlerzustand, den man wegdefinieren kann, muss nicht behandelt werden.

   **Was daran hing** (mehr, als die Frage vermuten ließ):
   - `types/models.ts` — `Post.district` ist jetzt `string | null`. Der User behält
     seinen Pflicht-Bezirk; nur der **Post** darf ohne auskommen.
   - `lib/bezirk.ts` — neu `ortText()`, die eine Stelle, die entscheidet, was statt
     der Zahl dasteht. Eingebaut ist **„Wien"** (`OHNE_BEZIRK`, ein Wort zum Ändern).
     Verworfen: „Ort offen" (klingt nach Lücke), „Bezirk egal" (behauptet etwas über
     die Aktivität), Zeile weglassen (dann hängt das „·" davor im Leeren).
   - Sieben Screens zeigten `{post.district} Wien` — alle auf `ortText()` umgestellt.
   - `create.tsx` — `BEZIRK_FREIWILLIG = true`. Auf `false` ist das Feld wieder Pflicht.
   - `data/mock.ts` — **p7 „Donauinsel spazieren" hat als einziger keinen Bezirk.**
     Absicht: Ohne ihn sieht niemand, wie der Fall aussieht. Nicht „aufräumen".

   **Der Rest der Frage bleibt und ist beantwortet:** Ein *falsch* ausgefülltes
   verstecktes Feld („9999", „99:99") gibt es weiter. Dafür steht `VERSTECKTER_FEHLER`
   weiter auf `'aufklappen'` — jetzt als Randfall, nicht als offene Entscheidung.

   **Den Haken kennt er:** „Wien" ist als Ortsangabe fast nichts. Lassen viele das Feld
   leer, verliert der Feed genau die Angabe, mit der man entscheidet, ob man hingeht.
   Die Korrektur ist ein Wort (`BEZIRK_FREIWILLIG`).

10. ✅ **Welches Symbol vor „Mehr einstellen"** — **entschieden am 2026-09-02: die drei
    Striche (`☰`).** Ich hatte ⚙️ eingebaut und dagegengehalten, dass drei Striche
    überall Menü bedeuten und man dahinter den Weg woandershin sucht, nicht
    Einstellungen. Er hat es sich angesehen und ist bei seiner ersten Idee geblieben.
    `MEHR_SYMBOL` im Kopf von `create.tsx`.


11. ✅ **Wie weit die Emojis rausfliegen** — **entschieden am 2026-09-02: alle 107.**
    Christoph hat die Ursache benannt („wegen den Emojis"), Ian hat den radikalen Weg
    gewählt statt des halben. Ersatz sind gezeichnete SVG-Icons im Code, eine
    Strichstärke, eingefärbt über die Theme-Farbe — kein Native-Modul (harte Regel 1).
    Auch die **sechs Kategorie-Emojis** gehen, obwohl sie Erkennungszeichen sind; sie
    brauchen Icons, die dieselbe Rolle übernehmen.
    *Verworfen:* nur die auffälligen ersetzen (die Kategorien wären die auffälligsten
    Emojis geblieben — genau das, was Christoph gemeint hat) und „erst einen Screen
    zeigen" (Ian wollte nicht warten).
    **Der Haken:** Der Feed lebt von den sechs Farben. Werden die Icons zu blass, ist
    die App erwachsener und langweiliger. Der Weg zurück ist dann kräftigeres Einfärben,
    nicht „Emojis wieder rein".
    **Gebaut am 2026-09-02** (Phase 14, Abschnitt 5): 41 Icons in `theme/icons.ts`.
    Der Ausgleich zum Haken ist eingebaut — die Icons nehmen die Kategoriefarbe an,
    was ein Emoji nie konnte. **Ob es reicht, kann nur Ian am Handy sagen.** Falls
    nicht: `STRICH` in `theme/icons.ts` und `strichFuer()` in `SsIcon.tsx`, zwei Zahlen.

12. ✅ **Foto oder Altersgruppe** — **entschieden am 2026-09-02: beides**, mit einer
    Einschränkung beim Foto. Ians Worte: **„Beides sollte klar sein."**
    Daria hatte „Foto von der Person oder halt Altersgruppe" geschrieben — zwei
    verschiedene Fragen (*wie sieht die aus?* und *ist die in meinem Alter?*), und beide
    sollen beantwortet werden.
    - **Altersgruppe: voll gebaut**, in **Leopolds vereinfachter Form** — der Poster
      stellt selbst ein, für wen die Aktivität ist (`egal · 14–17 · 18–25 · 26+`),
      statt dass die App Menschen zusammenrechnet.
    - **Foto: der Platz gebaut, der Upload nicht.** `User.photoUrl?` kommt ins Modell,
      jede Avatar-Stelle kann ein Bild zeigen, und ohne Bild stehen die Initialen aus
      Phase 14. Echte Uploads brauchen Speicher und Moderation und bleiben in
      Abschnitt 7 — sie kommen mit dem Backend, und dann ist nur noch der Upload zu
      bauen, kein Screen.
    **Das gehört Daria trotzdem gesagt:** Bis zum Backend sieht sie Initialen, kein
    Gesicht. Die halbe Antwort jetzt ist besser als eine ganze in drei Monaten — aber
    sie soll wissen, dass es die halbe ist.

13. ✅ **Hashtags oder Filter** — **entschieden am 2026-09-02: Filter.**
    Leopolds Problem war „man kann nicht so genau filtern, was ein Problem wird, wenn es
    viele Anfragen gibt". Seine vorgeschlagene Lösung waren Hashtags; gebaut werden
    **Bezirk · Wann · Altersgruppe · Freitext-Suche**.
    Begründung: Drei der vier brauchen keine neuen Daten, und niemand muss beim Posten
    Schlagwörter tippen — ihr habt die Felder gerade erst von zehn auf zwei reduziert
    (Phase 12). Zwei Ordnungssysteme nebeneinander (sechs feste Kategorien **und** freie
    Hashtags) verwirren mehr, als sie helfen; die sechs Farben der App hängen an den
    Kategorien. **Falls die Filter das Problem nicht lösen, kommen Hashtags zurück.**

14. ✅ **Wer mir schreiben darf** — **entschieden am 2026-09-02: nur bei gegenseitigem
    Folgen.** Der Knopf „Nachricht" erscheint auf einem fremden Profil erst, wenn beide
    einander folgen.
    *Verworfen:* jeder darf jedem (wie Instagram) — bei einer App mit 16-Jährigen ist
    das der Punkt, an dem Apple im Review nachfragt; und „wer schon zusammen war"
    (näher an der Idee der App, aber es hätte Leopolds Problem nur halb gelöst).

15. ✅ **Ob ein Direktchat abläuft** — **entschieden am 2026-09-02: nein.**
    Er bleibt, bis jemand ihn löscht. Ians 7-Tage-Regel aus `features/chat/lifecycle.ts`
    gilt weiter, aber **nur noch für Aktivitäts-Chats** — dort ergibt sie Sinn, weil das
    Treffen vorbei ist. **Technisch wichtig:** `nachklangEnde(post)` braucht einen Post;
    ohne Fallunterscheidung bricht die Funktion beim ersten Direktchat.
    *Verworfen:* dieselbe Regel für beide (ein Chatverlauf, der von selbst verschwindet,
    während man auf Antwort wartet, fühlt sich kaputt an).

16. ✅ **Was eine Gruppe ist** — **entschieden am 2026-09-02: eine dritte
    Sichtbarkeits-Stufe.** Beim Posten wählt man „Alle", „Nur Follower" oder „Nur MARS
    Wiese Tennis". **Der Feed bleibt EIN Feed.**
    *Verworfen:* ein eigener Tab mit eigenem Feed je Gruppe — er hätte den Hauptfeed
    geleert, und ein leerer Hauptfeed ist am Anfang das größere Problem. Ebenfalls
    verworfen: Gruppe als reiner Gruppenchat (zu wenig für das, was Leopold meinte).

17. ✅ **Wie man in eine Gruppe kommt** — **entschieden am 2026-09-02: auf Anfrage, der
    Ersteller bestätigt.** Bewusst **dasselbe Muster wie „Bin dabei"** — ein Muster
    weniger, das jemand lernen muss.
    *Verworfen:* offen für alle (wer stört, ist schon drin) und nur per Einladung (dann
    findet niemand hinein, und das Finden ist der Zweck der App).
    **Gebaut in Phase 17** (`features/groups/gruppe.ts`, `BEITRITT`). Weil es dasselbe
    Muster ist, liegen die Beitritts-Anfragen im selben Anfragen-Tab wie die
    Post-Anfragen und zählen in dieselbe Zahl an der Tab-Leiste.

---

18. ✅ **Was der Alters-Filter mit „für alle"-Posts macht**
    (`src/features/posts/filter.ts`) — **entschieden am 2026-09-02: sie passen immer.**

    Die Frage kam beim Bauen von Phase 15 auf und stand vorher in keinem Plan: Wenn
    jemand auf „18–25" filtert, sieht er dann auch die Posts, die für ALLE offen
    sind? Sie klingt nach einer Zeile Code und entscheidet, ob der Filter benutzbar
    ist.

    Ians Antwort war **ja**. Der Grund ist die Voreinstellung: „Für alle" ist das,
    was beim Posten dasteht, wenn niemand aufklappt (`STANDARD.alter`) — die meisten
    Posts werden es tragen. Unter der strengen Regel würde der Alters-Filter also
    ausgerechnet die offensten Posts wegwerfen: Man tippt auf „18–25" und der Feed
    schrumpft von zwölf Karten auf eine. So einen Filter benutzt man genau einmal.

    **Den Haken kennt er:** Der Filter fühlt sich dadurch weich an — man wählt
    „14–17" und sieht trotzdem fast alles. Er wird erst scharf, wenn Leute die
    Altersgruppe wirklich setzen, und das tun sie erst, wenn es viele Posts gibt.
    In dieser Reihenfolge ist es richtig herum: erst voller Feed, dann scharfe Filter.

    Verworfen: **'streng'** (nur exakte Übereinstimmung — tut genau, was draufsteht,
    ist aber bei wenigen Nutzern fast immer leer und belohnt Poster dafür, eng
    einzustellen) und **'zu-mir'** (ein Schalter „Nur, wo ich hineinpasse", der das
    eigene Profil heranzieht — beantwortet die echte Frage mit einem Tipp, aber man
    kann dann nicht mehr für jemand anderen schauen). Beide stehen samt Begründung
    im Kopf von `filter.ts`. Der Wechsel ist ein Wort (`ALTER_REGEL`).

---

19. ✅ **Wann ein Direktchat entsteht** (`src/features/chat/direkt.ts`) —
    **entschieden am 2026-09-02: erst mit der ersten gesendeten Nachricht.**

    Sie kam beim Bauen von Phase 16 auf und stand vorher in keinem Plan. Sie klingt
    nach einer Zeile Code und entscheidet, was die ANDERE Person sieht, wenn man auf
    „Nachricht" tippt und es sich dann überlegt:

    - **`'beim-tippen'`** — Der Chat entsteht mit dem Tipp auf den Knopf und steht
      sofort in beiden Listen, leer. Ehrlich: Was ich anfange, ist da.
      *Haken:* Wegen Ians eigener Regel aus `chat/sort.ts` („die stummen Chats immer
      ganz oben") landet ein versehentlicher Tipp bei der anderen Person GANZ OBEN in
      der Liste — und bleibt dort, bis jemand hineinschreibt.
    - **`'beim-senden'`** — Der Chat erscheint erst mit der ersten Nachricht. Vorher
      ist er ein leerer Raum, den nur ich sehe; ein Fehlgriff hinterlässt nichts. Das
      ist, was man von WhatsApp und Instagram kennt.
      *Haken:* Ein halb geschriebener Entwurf ist beim Zurückgehen weg, und in der
      eigenen Liste sieht man nicht, mit wem man schon angefangen hat.

    Der Unterschied zum Aktivitäts-Chat ist der Grund, warum das überhaupt eine Frage
    ist: Dort IST ein stummer Chat eine Nachricht („ihr seid verabredet und keiner hat
    sich gemeldet") — genau deshalb steht er nach Ians Regel oben. Ein stummer
    Direktchat bedeutet nichts.

    **Ians Antwort war `'beim-senden'`** — es ist das, was Leute von WhatsApp und
    Instagram kennen, und es macht den Fehlgriff folgenlos.

    **Den Haken kennt er:** Ein halb getippter Entwurf ist beim Zurückgehen weg, und
    in der eigenen Liste sieht man nicht, mit wem man schon angefangen hat.

    Umgesetzt ist es NICHT dadurch, dass der Faden später angelegt wird — dann
    bräuchte der Chat-Screen eine Adresse für etwas, das es noch nicht gibt, also eine
    zweite Route samt `generateStaticParams` (harte Regel 11). Stattdessen entsteht
    der Faden sofort und ein LEERER Direktchat steht in keiner Liste. Von außen
    dasselbe, von innen eine Zeile statt einer Route. Der Wechsel ist ein Wort:
    `ENTSTEHUNG`.

---

20. ✅ **Was mit Gruppen-Posts passiert, wenn jemand die Gruppe verlässt**
    (`src/features/groups/gruppe.ts`) — **entschieden am 2026-09-02: sie bleiben
    stehen.**

    Die Frage stand im Plan ausdrücklich offen („beim Bauen entscheiden"). Die Lage:
    Du hast „Dienstag 17:00 Tennis" gepostet, sichtbar nur für „Marswiese Tennis".
    Zwei Tage später verlässt du die Gruppe. Der Post läuft noch — was sieht die
    Gruppe?

    Ians Antwort war **A**. Ein Post ist ein Angebot an diese Leute, und wer geht,
    nimmt es nicht zurück: Wer schon angefragt hat, verliert nichts, eine bestätigte
    Verabredung bleibt eine Verabredung.

    *Verworfen:* **B) der Post verschwindet mit** (sauber, aber er sagt fremde
    Verabredungen ab wegen einer Sache, die im Kopf nichts damit zu tun hat) und
    **C) der Post wird öffentlich** (nichts geht verloren, aber aus „nur für meine
    Tennisgruppe" wird still „für ganz Wien" — die einzige der drei, die ein
    Datenschutzfehler ist und nicht nur eine Geschmacksfrage).

    **Den Haken kennt er:** Es läuft etwas auf seinen Namen in einer Gruppe, in der
    er nicht mehr ist; Leute von dort können weiter „Bin dabei" drücken, und die
    Anfragen landen bei ihm. Ein Post läuft von selbst ab (Regel 6.2), das begrenzt
    es auf Stunden. **Beim Bauen wurde der Haken kleiner als beschrieben:** Er sieht
    seinen eigenen Post weiterhin, weil `darfIchSehen()` eigene Posts immer
    durchlässt. Der Satz in der Rückfrage ist entsprechend korrigiert.

    Die Korrektur wäre ein Wort: `AUSTRITT_WIRKUNG`. **Nicht ohne Rückfrage.**

21. ✅ **Ob der Gründer seine eigene Gruppe verlassen kann**
    (`src/features/groups/gruppe.ts`) — **entschieden am 2026-09-02: die Leitung geht
    weiter.**

    Die zweite Hälfte derselben Frage, und sie stand vorher in keinem Plan: Der
    Gründer ist der Einzige, der Beitritte bestätigt. Geht er, kommt niemand mehr
    hinein.

    Ians Antwort war **B**: Die Gruppe geht an das Mitglied, das am längsten dabei
    ist. Seine Begründung sinngemäß — die Gruppe gehört den Leuten darin, nicht dem,
    der zuerst auf „Erstellen" getippt hat.

    *Verworfen:* **A) er kann nur auflösen** (hätte einem Einzelnen die Macht
    gegeben, acht anderen ihre Gruppe zu löschen) und **C) die Gruppe bleibt ohne
    Gründer** (dann bleiben Beitritts-Anfragen für immer liegen, und niemand sieht,
    warum).

    **Den Haken kennt er:** Jemand wird Gründer, ohne gefragt worden zu sein. Die
    Gruppenseite sagt es ihm wenigstens („Aufgemacht von …").

    **Wer „am längsten dabei" ist, steht schon in den Daten:** `memberIds` wächst
    hinten, der Gründer steht vorn — der Nachfolger ist der erste Eintrag, der nicht
    der Gehende ist (`nachfolgerId()`). Kein Zeitstempel je Mitgliedschaft, also auch
    kein zweites Feld, das falsch werden kann. **Wer `memberIds` umsortiert, ändert
    still, wer eine Gruppe erbt.** Und der Grenzfall erledigt sich von selbst: Ist der
    Gründer allein, gibt es keinen Nachfolger — dann löst sich die Gruppe auf, nach
    derselben Regel.

22. ✅ **Was das Filterfeld im Wischstapel tut** (`app/(tabs)/index.tsx` ·
    `WischStapel.blatt`) — **entschieden am 2026-09-03: es legt sich drüber, es
    schiebt nicht.** *(Ians vierzehnte Entscheidung — die ganze Geschichte samt
    Messwerten steht als „Nachtrag 2026-09-03 (2)" am Ende von Abschnitt 5; hier
    steht sie, damit die Liste vollständig ist.)*

    *Verworfen:* **beim Filtern automatisch auf die Liste springen** (die App
    wechselt die Ansicht, ohne dass man es gesagt hat) und **ein eigener
    Filter-Bildschirm** (am meisten Platz, aber Abschnitt 9b sagt schon jetzt, dass
    17 Routen zu viele sind).

    **Den Haken kennt er:** Beim Filtern sieht man die Karte nicht. Getragen wird
    das vom Zähler „Noch 8 Karten" oben, der beim Tippen live mitzählt.

23. ✅ **Was passiert, wenn die rote Stelle außerhalb des Bildschirms liegt**
    (`src/app/create.tsx`, `FEHLER_ANTWORT`) — **entschieden am 2026-09-03: beides —
    hinspringen UND das Feld benennen.** *(Ians fünfzehnte Entscheidung.)*

    Die Frage stand in keinem Plan und kam beim Durchklicken heraus. `VERSTECKTER_FEHLER`
    (Punkt 9) setzt Sichtbarkeit mit *aufgeklappt* gleich — und genau dort war eine
    Lücke: Bei offenem „Mehr einstellen" ist der Erstellen-Screen rund 2000 px hoch,
    das Fenster eines Handys 667. Wer unten auf „Posten" tippt und den Titel vergessen
    hat, las „Es fehlt noch was — die roten Stellen", und auf dem ganzen Bildschirm
    war nichts rot. **Nachgemessen auf 375 × 667: die rote Zeile stand bei y = −752.**

    Ians Antwort war **beides**: Der Screen springt zur ersten roten Stelle, und der
    Satz unten sagt, um welches Feld es geht („Schau noch mal beim Titel.").

    *Verworfen:* **nur benennen** (passt zwar zu seinem Urteil vom selben Tag —
    „was nur eine Weile da ist, überdeckt, es schiebt nicht" —, lässt einen bei zwei
    Fehlern aber trotzdem 2000 px absuchen) und **nur hinspringen** (der Satz bliebe
    „die roten Stellen"; er stimmt dann, sagt aber immer noch nicht, was fehlt, wenn
    man zum Knopf zurückscrollt).

    **Den Haken kennt er:** Die App bewegt den Bildschirm, ohne dass man es gesagt
    hat — dieselbe Sorte, die er am selben Tag beim Filter verworfen hat (Punkt 22).
    Der Unterschied ist der Auslöser: Dort wechselte die Ansicht beim Tippen in ein
    Filterfeld, hier hat man gerade selbst auf „Posten" gedrückt und bekommt die
    Antwort darauf.

    **Warum beide Hälften gebraucht werden:** Sie werden an verschiedenen Orten
    gelesen. Nach dem Sprung steht der Satz unten außerhalb des Bildes — dort trägt
    die rote Zeile am Feld. Scrollt man zum Knopf zurück, trägt der Satz. Die
    Korrektur wäre ein Wort: `FEHLER_ANTWORT`. **Nicht ohne Rückfrage.**

24. ✅ **Wie jemand in eine Gruppe hineinkommt** (`features/groups/gruppe.ts`) —
    **entschieden am 2026-09-03: Einladen aus der Gruppe heraus.** *(Ians sechzehnte
    Entscheidung. Geplant, noch nicht gebaut — Phase 18a.)*

    Die Frage kam von **Leopold**, und zwar nicht als Wunsch, sondern als Befund: „ich
    hab nicht gesehen wie man Leute added, sondern nur die Gruppe erstellen." Es gab es
    tatsächlich nicht — Phase 17 hat nur die Richtung von aussen nach innen gebaut.

    Ians Antwort war **A**: Der Gründer tippt „Leute einladen", wählt aus seinen
    Followern, die bekommen eine Einladung und sagen ja. **Dasselbe Muster wie
    „Bin dabei"**: Eine Seite bietet an, die andere bestätigt — niemand landet ungefragt
    in einer Gruppe.

    *Verworfen:* **B) ein Einladungs-Link zum Weiterschicken** (läge nahe, weil die vier
    ohnehin über WhatsApp reden — aber ein weitergeleiteter Link ist nicht mehr
    kontrollierbar und landet irgendwann in einer fremden Gruppe) und **C) beides**
    (zwei Wege zum selben Ziel, und Abschnitt 9b sagt schon jetzt, dass die App zu viele
    Bildschirme hat).

    **Offen und beim Bauen zu entscheiden:** ob nur der Gründer einladen darf oder jedes
    Mitglied. Siehe Phase 18a.

25. ✅ **Der Schiebe-Balken fürs Alter** — **entschieden am 2026-09-03: er kommt, und er
    läuft über den JAHRGANG.** *(Ians siebzehnte Entscheidung. Geplant, noch nicht
    gebaut — Phase 18b.)*

    Auch das kam von Leopold: „Kann man theoretisch die Altersauswahl mit so einem
    Schiebe-Balken machen?" Ian hat ihm „Sicher" geantwortet. **Ich habe dagegengehalten**
    — nicht gegen den Balken, sondern gegen das, was er verspricht: Das Modell kannte
    kein Geburtsdatum, ein Mensch hatte eines von drei Bändern (`AgeBand`). Ein Balken
    darüber wäre eine schlechtere Pillenreihe gewesen: schwerer zu treffen, und man sieht
    die Möglichkeiten nicht mehr alle auf einmal.

    Ians Antwort war eine, die ich nicht angeboten hatte: **„mach ma das mit nur dem
    Jahrgang als Schiebe-Balken, aber mehr als Jahrgang brauchen wir nicht."** Also
    weder die Bänder behalten noch ein volles Geburtsdatum einführen, sondern die Mitte —
    das Jahr genügt. Damit bekommt der Balken echte Werte, ohne dass jemand Tag und Monat
    hergeben muss.

    **Den Haken kennt er:** Ein Jahrgang ist genauer als ein Band, und das ist der Sinn
    der Sache — aber auf einem Profil steht dann etwas, aus dem man das Alter ausrechnen
    kann. Bei einer App mit 16-Jährigen hängt das an Abschnitt 8, Punkt 1 (Mindestalter,
    DSGVO), und der wartet auf erwachsenen Rat. **Eine Frage bleibt deshalb offen und
    steht in Phase 18b:** ob am Profil der Jahrgang steht, das Alter, oder weiterhin nur
    ein grobes Band, während der Jahrgang bloss zum Filtern dient.

26. ✅ **Wer jemanden in eine Gruppe einladen darf** (`features/groups/gruppe.ts`) —
    **entschieden am 2026-09-05: jedes Mitglied.** *(Ians achtzehnte Entscheidung,
    gebaut in Phase 18a.)*

    Verworfen: **nur der Gründer** (passt zum Rest — er ist heute schon der Einzige mit
    Rechten —, macht ihn aber zum Flaschenhals, und genau diese Umständlichkeit hat
    Leopold eine Ebene höher gemeldet) und **jedes Mitglied schlägt vor, der Gründer
    bestätigt** (sicher, aber ein dritter Zustand, den die App erklären muss).

    **Den Haken kennt er:** Der Gründer kann nicht mehr steuern, wer dazukommt. Zwei
    Dinge mildern es, und beide gab es schon — eingeladen wird nur, wen man kennt (die
    Liste kommt aus dem eigenen Folge-Graph, nicht aus allen Nutzern), und wer dazukommt,
    kann jederzeit wieder gehen. Ein Rauswerfen gibt es bewusst nicht.

    ⚠️ **Was das über `creatorId` sagt:** Der Gründer trägt ab jetzt WENIGER als vorher —
    er bestätigt Anfragen von außen, mehr nicht. Wer die beiden Rechte gedanklich
    zusammenwirft, schreibt irgendwo `istGruender()`, wo `darfEinladen()` hingehört. **Und
    es fällt nie auf**, weil beide in einer frisch gegründeten Gruppe dasselbe antworten.

27. ✅ **Was ein Fremder von einer PRIVATEN Gruppe sieht** (`features/groups/gruppe.ts`) —
    **entschieden am 2026-09-05: Name, Kategorie, Bezirk und Mitgliederzahl. Sonst
    nichts.** *(Ians neunzehnte Entscheidung, `PRIVAT_SICHT`.)*

    Die Frage gäbe es ohne harte Regel 11 gar nicht: Seit Phase 8 ist jeder Screen direkt
    aufrufbar, und ein Link landet irgendwann in einer fremden WhatsApp-Gruppe. Verworfen:
    **nur der Name** (eine Karte, auf der fast nichts steht, sieht aus wie ein Fehler) und
    **„Diese Gruppe gibt es nicht"** (eine Lüge — und sie hätte den Satz unterlaufen, den
    derselbe Screen für eine wirklich aufgelöste Gruppe zeigt).

    **Was daraus für die Liste folgt und keine eigene Frage war:** In `/gruppen` taucht
    eine private Gruppe, in der ich nicht bin, NICHT auf. Das ist kein Widerspruch —
    die Entscheidung beantwortet „was sehe ich, wenn ich die Adresse habe", die Liste
    beantwortet „was schlägt die App mir vor".

28. ✅ **Was beim Gründen voreingestellt ist** (`features/groups/gruppe.ts`) —
    **entschieden am 2026-09-05: offen.** *(Ians zwanzigste Entscheidung,
    `NEUE_GRUPPE_OFFEN`.)*

    Dieselbe Überlegung wie bei `STANDARD` in `create.tsx` (harte Regel 18): Die meisten
    klappen nichts auf, also IST die Voreinstellung das, was fast alle abschicken. „Nur
    auf Einladung" als Standard hätte fast jede Gruppe unauffindbar gemacht und die
    Anfrage-Funktion aus Phase 17 stillgelegt — bei einer App, deren ganzer Zweck das
    Finden ist.

---

## 7. Bewusst NICHT im Prototyp

Login · Karte · Push-Nachrichten · Bezahlung · **echte Bilder-Uploads** ·
Backend jeder Art. Wenn eines davon auftaucht: erst PLAN.md ändern, dann bauen.

> **Geändert am 2026-09-02: „Suche" steht nicht mehr auf dieser Liste.** Leopold hat
> gemeldet, dass man „nicht so genau filtern kann, was ein Problem wird, wenn es viele
> Anfragen gibt" — und Ian hat Freitext-Suche ausgewählt (Phase 15). Das ist genau der
> Weg, den dieser Abschnitt vorschreibt: erst hier ändern, dann bauen.
>
> **Bilder-UPLOADS bleiben draußen** — sie brauchen Speicher, Moderation und eine
> Antwort auf „wer darf ein Bild von wem hochladen"; alles drei gibt es ohne Backend
> nicht. **Die Bild-ANZEIGE ist seit Phase 15 trotzdem gebaut** (`User.photoUrl?`), damit
> beim Backend-Start kein Screen mehr angefasst werden muss. Ohne Bild stehen die
> Initialen aus Phase 14. Der Unterschied ist wichtig: Ein Feld, das ein Bild anzeigen
> KANN, ist kein Upload — und genau deshalb passt es in den Prototyp.

---

## 8. Offene Punkte

- **Logo** — der Freund zeichnet, Termin unbekannt. Bis dahin Platzhalter-Wortmarke.
- **Backend-Wahl** — Firebase (Ian hat Erfahrung aus ACTA, MCP-Plugin installiert) vs.
  Supabase. Erst entscheiden, wenn der Prototyp steht.
- **Recht** — Ian ist 16, die App führt Fremde zusammen. DSGVO, Mindestalter, Haftung.
  Braucht erwachsenen Rat, bevor es über den Freundeskreis hinausgeht.
  Steht in `_FUER_IAN/OFFENE_SACHEN.md`.
- **Kaltstart** — die vier Gründer + Freunde posten in Woche 1 alles, was sie sowieso
  machen, damit der Feed nicht leer ist. Von Ian bestätigt.

### Rückmeldungen der Mitgründer, 2026-09-02

Alle drei haben den Prototyp am Handy durchgeklickt. **Der Kern der Nachricht ist, dass
es funktioniert** — Leopold: „Es ist schon für die Aktivitäten-Funktion sehr gut […] an
sich funktioniert es." Was danach kam, ist Verbesserung, nicht Zweifel.

| Wer | Was | Wohin |
|---|---|---|
| Christoph | „schaut bisschen zu sehr nach AI aus **wegen den Emojis**" | ✅ Phase 14 |
| Leopold | Look ans Farbenbild anpassen | ✅ Phase 14 |
| Leopold | „nur für Aktivitäten Chats, man kann nicht einfach so Leuten schreiben" | Phase 16 |
| Leopold | „**Gruppen** wären noch gut zu adden" (z. B. „MARS Wiese Tennis") | Phase 17 |
| Leopold | „man kann nicht so genau **filtern** […] Problem, wenn es viele Anfragen gibt" | Phase 15 |
| Leopold | Altersgruppe selbst beim Post einstellen, kein Matching-System | Phase 15 |
| Daria | „Foto von der Person oder halt Altersgruppe dazugeschrieben" | Phase 15 — **beides** |

**Noch zu klären, von Ian:**
- **Daria sagen, was „beides" konkret heißt.** Ian am 2026-09-02: „Beides sollte klar
  sein" — ihre zwei Fragen (*wie sieht die aus?* und *ist die in meinem Alter?*) sollen
  beide beantwortet werden. Das Alter kommt voll; beim Foto wird nur der **Platz**
  gebaut, weil ein Upload Speicher und Moderation braucht (Abschnitt 7). Bis zum Backend
  sieht sie Initialen. **Die halbe Antwort ist in Ordnung — aber sie soll wissen, dass
  es die halbe ist.**
- **Darias Vater** hat „nichts zur App gesagt, es sei gerade nicht das Wichtigste."
  Das ist keine Kritik an der App und braucht keine Antwort im Code — aber es ist der
  erste Erwachsene, der davon gehört hat, und die Rechtsfrage oben wartet weiter auf
  genau so jemanden.
- **Leopolds eigentliche Frage** war: „Wäre das alles, was wir in die erste Version der
  richtigen App tun würden?" Ians Antwort am 2026-09-02: **erst weiter im Prototyp**,
  Backend danach. Die Begründung gehört in die Gruppe, nicht nur hierher: Funktionen,
  die nie jemand geklickt hat, landen sonst fest in einer Datenbank.

### Rückmeldung von Leopold, 2026-09-03 — die erste aus echter BENUTZUNG

Leopold hat die neue Fassung nicht angeschaut, sondern **benutzt**: Gruppe gegründet,
gepostet, herumprobiert. Der Unterschied zeigt sich sofort — er findet in zehn Minuten
zwei Dinge, die beim Durchklicken vom selben Tag keiner gesehen hat, weil man sie nur
merkt, wenn man etwas *erreichen* will.

| Was er sagt | Art | Befund im Code |
|---|---|---|
| „ich hab nicht gesehen wie man Leute added, sondern nur die Gruppe erstellen" | **Loch** | Es gibt keinen Einladen-Weg. Nur `beitrittAnfragen` (von aussen) + `beitrittBestaetigen` (Gründer). Wer gründet, sitzt allein drin. |
| „Wie macht man die Gruppen?" (musste fragen) | **Auffindbarkeit** | „Deine Gruppen" liegt bei **y = 1168** von 1380, bei 600 px Fenster — vorletztes Element auf dem Profil. |
| „das man nicht 2 Sachen gleichzeitig machen kann" | Wunsch, gut | Nichts prüft das, nirgends. Man kann für zwei Aktivitäten zur selben Zeit zusagen. |
| „private vs öffentliche" Gruppen | Wunsch | Alle Gruppen stehen für jeden in `/gruppen`. |
| „Altersauswahl mit so einem Schiebe-Balken?" | Wunsch, ⚠️ | Siehe unten — das Modell kennt kein Geburtsdatum. |
| „für später vielleicht eine Kalender-Funktion" | Wunsch, ausdrücklich später | — |

**Das Loch bei den Gruppen ist die Nachricht.** Phase 17 hat **eine Richtung** gebaut —
von aussen anfragen, Gründer bestätigt — und die andere nicht: Der Gründer hat keinen
Weg, jemanden hereinzuholen. Bei vier Gründern und einem leeren Feed heisst das: Man
gründet „Marswiese Tennis" und wartet darauf, dass jemand die Gruppe von selbst findet.
Derselbe blinde Fleck wie bei den zwei Leer-Zuständen am selben Tag — jedes Stück für
sich stimmt, aber die Frage „und wie kommt der Gründer zu Mitgliedern?" hat nie jemand
gestellt. **Sie zu stellen brauchte kein Durchklicken, sondern jemanden, der etwas
erreichen wollte.**

> ⚠️ **Zum Schiebe-Balken, und es ist eine Datenfrage, keine Oberflächenfrage.** Ian hat
> Leopold „Sicher" geantwortet — machbar ist er. Aber ein Balken verspricht eine
> Genauigkeit, die es nicht gibt: Ein Post könnte „16 bis 24" sagen, ein MENSCH hat aber
> nur eines von drei Bändern (`AgeBand`, harte Regel 27) — ein Geburtsdatum steht
> nirgends im Modell. Also entweder rastet der Balken auf dieselben drei Bänder ein
> (dann ist er eine schlechtere Pillenreihe: schwerer zu treffen, und man sieht die
> Möglichkeiten nicht mehr alle auf einmal), oder alle geben ihr echtes Alter an — und
> das ist eine ganz andere Entscheidung, die an Abschnitt 8, Punkt 1 hängt (Mindestalter,
> DSGVO). **Nicht bauen, ohne das entschieden zu haben.**

**Einladen und „privat vs. öffentlich" sind EIN Stück Arbeit, nicht zwei.** Sobald es
ein Einladen gibt, bekommt „privat" erst seine Bedeutung: eine Gruppe, in die man nur
auf Einladung kommt, statt auf Anfrage. Getrennt gebaut, wäre „privat" eine Gruppe, die
niemand betreten kann.

---

## 9b. Ein Prüfraster von außen *(Ian gefunden, 2026-09-02)*

Ian hat im Web eine Grafik gefunden — „What good app design looks like" — und sie
hierher gegeben. Sie beschreibt fünf Stufen von der Rohidee zum auslieferbaren MVP,
jede mit einer Prüffrage, an der man hängen bleibt oder weitergeht:

| Stufe | Was zu tun ist | Prüffrage |
|---|---|---|
| **1. Core Function** | Die EINE Sache benennen | *In einem Satz sagbar? Wenn nein: aufhören.* |
| **2. Core Loop** | Aktion → Belohnung, unter 30 Sekunden | *Wiederholbar?* |
| **3. Accessory Features** | Nur dazubauen, was den Loop stützt | *Dient es dem Loop? Wenn nein: streichen.* |
| **4. Surface Area** | Bildschirme zählen — höchstens 5–7 | *Über 7? Kürzen.* |
| **5. Retention Hook** | Einen unfertigen Zustand erzeugen | → auslieferbarer MVP |

**SimplySocial dagegen geprüft, ehrlich:**

1. **Core Function ✅** — „Aktivität posten, jemand tippt *Bin dabei*, ihr trefft euch."
   Ein Satz, steht so in Abschnitt 1.
2. **Core Loop ✅** — posten → Anfrage → bestätigen → Konfetti → Chat. Der Wischstapel
   aus Phase 11 hat ihn sogar unter 30 Sekunden gebracht: wischen, Gruß steht schon da,
   abschicken.
3. **Accessory Features — hier ist die Stelle zum Aufpassen.** Follower, Gruppen und
   Direktnachrichten dienen dem Loop nur *mittelbar*. Sie kommen aus echten
   Rückmeldungen und sind entschieden, aber die Frage „dient es dem Treffen?" ist die
   richtige, wenn Phase 17 groß wird.
4. **Surface Area ⚠️ — das ist der Befund.** 17 Routen, davon 13 echte Bildschirme.
   Deutlich über 7. Erklärbar ist es (4 Screens sind Apple-Pflicht aus Guideline 1.2,
   `/bausteine` ist eine Werkstatt und kein Produktscreen), aber **erklärbar ist nicht
   dasselbe wie richtig**. Beim ersten echten Umbau ist das die Liste, an der man
   zusammenstreicht — nicht bei den Funktionen.
5. **Retention Hook ⚠️ — fehlt bewusst.** Die App erzeugt keinen unfertigen Zustand,
   der einen zurückholt (keine Serien, keine Punkte, keine Push-Nachrichten). Der Grund
   ist gut: Das Ziel ist ein Treffen, nicht Bildschirmzeit. Der *echte* Haken ist ein
   anderer und steht in Abschnitt 8 — der **Kaltstart**: Wer die App an einem stillen
   Dienstag öffnet und nichts findet, kommt nicht wieder. Dagegen hilft kein Hook,
   sondern der leere Zustand, der zum Posten auffordert (`LeererFeed` im Feed-Screen).

> **Warum das Raster hier steht und nicht in `_FUER_IAN/`:** Es ist ein Werkzeug zum
> Prüfen, kein Ergebnis. Und die zwei ⚠️ oben sind der Grund, es aufzuheben: Sie werden
> vor dem ersten App-Store-Build wieder wichtig.

---

## 9. Stand für die nächste Sitzung

> Fortgeschrieben am 2026-08-31 nach Phase 4, weil der Chatverlauf danach gelöscht wird.
> Alles, was eine frische Sitzung wissen muss, steht in Dateien — nicht im Gespräch.

### Das Erste, was zu tun ist

> ⚠️ **Zuerst lesen, wenn am Wischstapel etwas geändert wird:** Am 2026-09-03 hat Ian
> gemeldet, dass die Karteikarten schief lagen und der „Weg"-Stempel immer sichtbar war.
> Ursache war eine Interpolation mit einer Spanne der Breite null (`b = 0` beim
> Web-Export). Behoben über `NOTBREITE`, hochgeladen und live geprüft — die ganze
> Geschichte steht als „Nachtrag 2026-09-03" am Ende von Abschnitt 5. **Wer eine neue
> Größe misst und in einen `inputRange` steckt, sichert sie gegen null ab.**

> ⚠️ **Und zuerst lesen, wenn am Erstellen-Screen oder am leeren Feed etwas geändert
> wird:** Am 2026-09-03 sind beim Zuendeklicken des Durchgangs zwei weitere Fehler
> herausgekommen — der rote Hinweis zeigte aus dem Bild hinaus (y = −752), und bei
> leerem Filter standen zwei Leer-Zustände übereinander. Beide behoben, hochgeladen,
> live geprüft; die Geschichte steht als „Nachtrag 2026-09-03 (3)" am Ende von
> Abschnitt 5. **Die Lehre daraus in einem Satz: Ein Screen weiss nicht, was im Bild
> ist — „aufgeklappt" ist nicht dasselbe wie „sichtbar", und „Stapel leer" ist nicht
> dasselbe wie „es gibt nichts".**

**Phase 18a ist seit dem 2026-09-05 fertig** (Gruppen: einladen, und privat vs. offen).
Was eine frische Sitzung davon wissen muss:
- **`GroupInvite` ist ein EIGENER Typ**, kein `GroupRequest` mit Richtungsfeld — die
  vierte Runde derselben Frage und dieselbe Antwort. Sachlich sind es auch zwei Dinge:
  Eine Anfrage hat einen Absender, der etwas will, und einen Satz, den er geschrieben
  hat; eine Einladung hat einen EMPFÄNGER, der nichts wollte, und deshalb keinen Text.
- **`Group.offen` ist ein Boolean und bewusst KEIN Union.** Die Regel aus Phase 17
  („braucht eine neue Stufe zusätzliche Daten, ist es ein Union") gilt genau dann, wenn
  sie welche BRAUCHT. Eine private Gruppe trägt nichts mit sich, was eine offene nicht
  auch hat.
- **Gründen und Einladen sind ZWEI Rechte.** Nie `istGruender()` schreiben, wo
  `darfEinladen()` hingehört — in einer frisch gegründeten Gruppe antworten beide gleich,
  also fällt die Verwechslung nie auf.
- **In `requests.tsx` wird an `einladung` unterschieden, nicht an `gruppe`.** Bis Phase 17
  reichte `'gruppe' in item`; eine Einladung trägt auch eine.
- **Die Zahl am Anfragen-Tab liest denselben Haken wie der Screen** (`useMeineEinladungen`).
  Ein eigener, leichterer Zähler daneben zählte Einladungen mit, die der Screen ausblendet
  — und die Zahl klebte dann für immer am Tab.

**Alles aus dem Feedback der Mitgründer ist gebaut — Phase 14 bis 18a sind fertig.**
Das Nächste ist deshalb keine Phase, sondern eine Frage an Menschen:
**den Prototyp noch einmal herzeigen.** Die drei haben ihn am 2026-09-02 in der Fassung
von Phase 13 durchgeklickt; seither sind die Emojis raus, sechs Filter, Direktchats und
Gruppen dazugekommen. Was sie diesmal sagen, ist wieder die wichtigste Quelle für alles
Weitere — wichtiger als alles, was in diesem Plan steht (Abschnitt 8).

Erst danach kommt das, was in Abschnitt 5 unter „Später" steht: **echtes Backend,
EAS-Build, App Store.** Alle drei sind groß, und alle drei sind leichter zu planen,
wenn feststeht, dass die App inhaltlich sitzt.

**Phase 17 ist seit dem 2026-09-02 fertig** (Gruppen). Was eine frische Sitzung davon
wissen muss:
- **Eine Gruppe ist eine Sichtbarkeits-Stufe, kein Ort.** Der Feed bleibt EIN Feed,
  es gibt keinen Gruppen-Tab, und `/gruppen` liegt am Profil. Wer daran etwas ändert,
  liest zuerst Abschnitt 6, Punkt 16 — das Argument gegen den eigenen Gruppen-Feed
  gilt weiter.
- **`Visibility` ist ein Union von Objekten**, kein String mehr. `post.visibility.kind`
  fragen, nie `post.visibility === '…'`. Die Begründung steht ausführlich in
  `types/models.ts` und ist die wichtigste Lehre dieser Phase.
- **Was eine Gruppe ist und was ein Austritt anrichtet, steht in
  `features/groups/gruppe.ts`** — wie `block.ts`, `wisch.ts` und `direkt.ts`. Screens
  lesen `AUSTRITT_WIRKUNG` und `GRUENDER_AUSTRITT` nie, sie sehen nur das Ergebnis;
  die Sätze in der Verlassen-Rückfrage kommen aus `austrittFolgen()`.
- **`GroupRequest` ist ein eigener Typ, kein `JoinRequest` mit optionalem `postId`.**
  Das wäre exakt die Phase-16-Falle noch einmal gewesen — ein Typ, der weiter wird,
  und ein Compiler, der dazu schweigt. An der Oberfläche ist es trotzdem dasselbe
  Muster, und das ist Ians Entscheidung 17.
- **Der Gründer steht in `memberIds` an erster Stelle, danach die Beitrittsreihenfolge.**
  Daran hängt, wer die Gruppe erbt (`nachfolgerId`). Umsortieren ändert die Regel.

**Phase 16 ist seit dem 2026-09-02 fertig** (Direktnachrichten). Was eine frische
Sitzung davon wissen muss:
- **Es gibt jetzt zwei Sorten Chats.** Ein Aktivitäts-Chat hat einen Post und läuft nach
  Ians 7-Tage-Regel ab; ein Direktchat hat keinen und läuft nie ab. `chatZustand()` nimmt
  deshalb einen OPTIONALEN Post, `nachklangEnde()` und die anderen bleiben bei einem
  Pflicht-Post — sie beantworten Fragen, die es ohne Treffen nicht gibt.
- **Nie `!thread.postId` schreiben, immer `istDirektChat()`** (harte Regel 28). Im
  Backend ist ein fehlendes Feld später `null` statt `undefined`.
- **Die Regel, wer schreiben darf, steht in `features/chat/direkt.ts`** — wie `block.ts`
  und `wisch.ts`. Screens lesen `SCHREIB_REGEL` nie, sie sehen nur das Ergebnis von
  `useDarfSchreiben()`, und der Satz für den Fall „darfst du nicht" kommt aus
  `schreibHuerdeText()`, damit er sich mit der Regel mitändert.
- **`ChatEintrag.post` ist optional, `ChatThread.postId` auch — aber nur das erste hilft.**
  Siehe die Lehre am Ende von Phase 16: Wo ein Typ weiter wird, muss die Enge eine Ebene
  höher neu entstehen.

**Phase 15 ist seit dem 2026-09-02 fertig** (Altersgruppe und Filter). Was eine frische
Sitzung davon wissen muss:
- **Filterregeln stehen in `features/posts/filter.ts`, nicht im Screen.** Dieselbe
  Trennung wie `sort.ts` und `lifecycle.ts`. Wer einen Filter dazubaut, baut ihn dort
  und reicht ihn über `FeedFilter` durch — dann gilt er automatisch in BEIDEN Ansichten
  (Stapel und Liste, harte Regel 16).
- **`FeedFilter` ist EIN Objekt mit sechs Feldern**, und `FILTER_LEER` ist der Zustand,
  in dem nichts weggenommen wird. Beim Zurücksetzen `FILTER_LEER` nehmen, nie die Werte
  von Hand aufzählen — sonst bleibt beim siebten Filter einer stehen.
- **`AgeGroup` (Post, mit `egal`) und `AgeBand` (Mensch, ohne `egal`) sind zwei Typen.**
  `AgeBand` ist als `Exclude<AgeGroup, 'egal'>` definiert: Ein neues Band kommt an EINER
  Stelle dazu und gilt sofort für beide.
- **`User.photoUrl?` gibt es, aber kein Bild.** `SsAvatar` kann es zeichnen und alle elf
  Aufrufstellen reichen es durch — es fehlt nur der Upload, und der braucht ein Backend
  (`_FUER_IAN/OFFENE_SACHEN.md`, Punkt 9).

**Phase 14 ist seit dem 2026-09-02 fertig und hochgeladen** (Icons statt Emojis, 41
Stück, alle Emojis der Oberfläche raus). Was davon weiter gilt:
- **Icons kommen aus `theme/icons.ts` und werden mit `<SsIcon>` gezeichnet**, ein Icon
  neben Text ist `<SsIconText>`. Nie ein Emoji hinschreiben — `IconName` ist eine
  Whitelist, der Typecheck fängt es.
- **`SsIcon` zeichnet nur auf Web.** Auf Native steht ein sichtbarer Platzhalter. Das
  ist bekannt und dokumentiert (`OFFENE_SACHEN.md`, Punkt 3), kein Fehler zum Beheben,
  solange kein EAS-Build ansteht.
- **`User.avatar` gibt es nicht mehr.** Wer ein Profilbild braucht, nimmt
  `<SsAvatar name={person.displayName} seed={person.id} photoUrl={person.photoUrl} />`.

**Was am 2026-09-02 passiert ist:** Die drei Mitgründer haben den Prototyp am Handy
durchgeklickt und geantwortet. **Ihr Urteil zur Sache war gut** — Leopold: „für die
Aktivitäten-Funktion sehr gut, an sich funktioniert es." Die Kritik betraf das Aussehen
(„schaut noch bisschen nach AI aus, wegen den Emojis" — Christoph) und zwei fehlende
Funktionen (Gruppen, Direktnachrichten). Alles davon steht in Abschnitt 8 mit Namen
dahinter, und alles ist in Phase 14–17 einsortiert.

**Ians acht Entscheidungen dazu sind alle gefallen** (Abschnitt 6, Punkte 11–18) — es
wartet nichts. Was NICHT gebaut wird und warum, steht dort genauso wie das, was gebaut
wird: keine Hashtags, kein Foto-**Upload** (die Anzeige schon), kein eigener
Gruppen-Feed. Punkt 18 ist beim Bauen von Phase 15 dazugekommen und stand vorher in
keinem Plan: Ein Post „für alle" passt zu jedem Alters-Filter.

> **Ein Satz, der beim Bauen wichtig wird:** Der Prototyp hat kein Backend und soll
> keines bekommen (Abschnitt 7). Gruppen, Direktnachrichten und Filter entstehen alle
> auf Fake-Daten aus `data/mock.ts`, gelesen über die Hooks (harte Regel 2). Wer beim
> Bauen merkt, dass etwas „ohne Server nicht geht", hat fast immer einen Weg übersehen —
> der Prototyp muss nicht echt sein, er muss sich echt anfühlen.

**Es wartet keine Frage mehr auf Ian.** Die letzten beiden hat er am 2026-09-02 beim
Bauen von Phase 17 beantwortet (Abschnitt 6, Punkte 20 und 21: Gruppen-Posts bleiben
beim Austritt stehen, und die Leitung einer Gruppe geht weiter). Davor am selben Tag
Punkt 19 (ein Direktchat entsteht erst mit der ersten gesendeten Nachricht) und die
Punkte 9, 10, 18:
- Das Symbol vor „Mehr einstellen" sind **die drei Striche** ☰, wie er es ursprünglich
  gesagt hatte.
- Der **Bezirk ist freiwillig** — damit ist die Frage nach dem ungültigen versteckten
  Feld für den häufigen Fall gegenstandslos. Was daran hing, steht bei Punkt 9; es war
  mehr als ein Formular-Schalter: `Post.district` ist jetzt `string | null`, und
  `ortText()` in `lib/bezirk.ts` ist die eine Stelle, die „Wien" daraus macht.

**Was in Phase 12 dazugekommen ist und man leicht übersieht:**
- **`STANDARD` im Kopf von `create.tsx`** ist kein Vorbelegungs-Kleinkram mehr, sondern
  der Post, den die meisten wirklich abschicken werden — das Formular ist zu. Ändern
  heißt: das Verhalten für alle ändern, die nie aufklappen. Ians Werte.
- **`SsScrollReihe`** ist der neue Baustein für waagrechte Reihen (harte Regel 19).
  Auf `/bausteine` steht er zweimal untereinander: einmal mit Inhalt, der hineinpasst
  (keine Kante), einmal mit Überstand (Kante rechts). Wer die Kante anfasst, sieht dort
  sofort, ob sie noch ehrlich ist.
- **`naechsteHalbeStunde()` in `lib/zeit.ts`** wird von zwei Seiten benutzt — vom
  Erstellen-Screen und von `bald()` in `mock.ts`. Nicht wieder auseinanderziehen.
- **`ortText()` in `lib/bezirk.ts`** (seit 2026-09-02) ist dasselbe Muster für den Ort:
  sieben Screens, eine Antwort. Wer `{post.district} Wien` neu hinschreibt, bekommt bei
  einem Post ohne Bezirk still „ Wien" — und **der Typecheck sagt nichts**, weil React
  `null` in JSX klaglos als Nichts rendert.

**Was vor jeder Änderung am Startbildschirm zu lesen ist:** Abschnitt 1, „Warum Feed
statt Swipe". Dort steht, warum das Argument gegen das Wischen von 2026-08-31 **weiter
gilt** und warum trotzdem gewischt wird. Beide Ansichten sind Absicht; wer eine davon
für einen Rest hält und wegräumt, nimmt der App ihr Auffangnetz. Der Prototyp ist seit
2026-09-01 online, und Ian wollte ihn seinen drei Mitgründern und Freunden schicken.
Was die gesagt haben, ist ab jetzt die wichtigste Quelle für Änderungen — wichtiger als
alles, was in diesem Plan steht. Rückmeldungen gehören in Abschnitt 8.

**Alle Punkte von 1 bis 21 sind entschieden UND gebaut.** Es steht nichts mehr offen.
Die Punkte 19, 20 und 21 sind erst beim Bauen entstanden und standen vorher in keinem
Plan — das ist der Normalfall geworden und kein Versäumnis: Fragen wie „wann entsteht
ein Direktchat" oder „wer erbt eine Gruppe" sieht man erst, wenn der Code danebensteht.

Dazu drei Rückmeldungen, die nur Ian geben kann: **ob die Icons am Handy zu blass
wirken** (der Weg zurück ist eine Zahl, nicht die Emojis), **ob der Alters-Filter sich
zu weich anfühlt** (er zeigt bewusst auch die „für alle"-Posts mit) und **ob die
Schreib-Hürde zu eng ist** — gegenseitiges Folgen heißt, dass zwei Leute, die sich nur
einseitig folgen, einander nicht schreiben können, auch wenn beide wollten
(`SCHREIB_REGEL`, ein Wort).

| Datei | Frage | Zustand |
|---|---|---|
| `features/posts/sort.ts` | Was steht im Feed oben? | ✅ das Neueste zuerst |
| `features/posts/lifecycle.ts` | Wann verschwindet ein Post? | ✅ bis Tagesende, Poster darf wählen |
| `features/requests/logic.ts` | Was passiert bei vollen Plätzen? | ✅ Warteliste, still |
| `features/chat/lifecycle.ts` | Was wird aus einem Chat danach? | ✅ erst „Vorbei", nach 7 Tagen weg |
| `features/chat/sort.ts` | Was steht in der Chat-Liste oben? | ✅ die neuen (noch stummen) immer |
| `features/posts/profil.ts` | Was steht auf einem Profil? | ✅ nur, was gerade läuft |
| `features/safety/block.ts` | Was bedeutet Blockieren? | ✅ alles weg (Chat + Verabredung) |
| `components/PrototypHinweis.tsx` | Was sieht ein Fremder als Erstes? | ✅ einmaliger Balken |
| `data/mock.ts` | Was darf öffentlich stehen? | ✅ nichts Persönliches |
| `landing/index.html` | Wie stellt sich das Team dar? | ✅ vier Namen, GAR keine Rollen |
| `landing/stil.css` | Bewegt sich die Farbreihe? | ✅ nein, sie steht still *(Phase 10)* |
| `features/posts/wisch.ts` | Feed oder Wischstapel? | ✅ beides, Stapel vorn *(Phase 11)* |
| `components/AntwortLeiste.tsx` | Was passiert beim Rechts-Wischen? | ✅ Leiste mit vorausgefülltem Gruß |
| `app/create.tsx` | Wie viel steht beim Posten da? | ✅ Kategorie + Titel, Rest im Menü *(Phase 12)* |
| `app/create.tsx` | Was, wenn ein VERSTECKTES Feld ungültig ist? | ✅ Frage weggenommen: Bezirk ist freiwillig |
| `lib/bezirk.ts` | Was steht bei einem Post ohne Bezirk? | ✅ „Wien" *(2026-09-02)* |
| `app/create.tsx` | Welches Symbol vor „Mehr einstellen"? | ✅ die drei Striche ☰ *(2026-09-02)* |
| `app/+html.tsx` | Was sieht man VOR dem JavaScript? | ✅ Wortmarke auf Grundfarbe *(Phase 13)* |
| `components/PrototypHinweis.tsx` | Wo steht der Prototyp-Hinweis? | ✅ unten, wie eine Cookie-Abfrage *(Phase 13)* |
| `theme/icons.ts` | Wie weit raus mit den Emojis? | ✅ **alle**, 41 gezeichnete Icons *(Phase 14)* |
| `config/alter.ts` | Foto oder Altersgruppe? | ✅ **beides** — Alter voll, fürs Foto nur der Platz *(Phase 15)* |
| `features/posts/filter.ts` | Hashtags oder Filter? | ✅ **Filter** (Bezirk · Wann · Alter · Suche), keine Hashtags *(Phase 15)* |
| `features/posts/filter.ts` | Passt ein „für alle"-Post zum Alters-Filter? | ✅ **ja, immer** *(2026-09-02)* |
| `features/chat/direkt.ts` | Wer darf mir schreiben? | ✅ **nur bei gegenseitigem Folgen** *(Phase 16)* |
| `features/chat/lifecycle.ts` | Läuft ein Direktchat ab? | ✅ **nein** — die 7-Tage-Regel gilt nur für Aktivitäts-Chats |
| `features/chat/direkt.ts` | Wann entsteht ein Direktchat? | ✅ **erst mit der ersten Nachricht** *(2026-09-02)* |
| `features/groups/gruppe.ts` | Was ist eine Gruppe? | ✅ **dritte Sichtbarkeits-Stufe**, kein eigener Feed *(Phase 17)* |
| `features/groups/gruppe.ts` | Wie kommt man hinein? | ✅ **auf Anfrage**, Gründer bestätigt *(Phase 17)* |
| `features/groups/gruppe.ts` | Was wird aus meinen Posts beim Austritt? | ✅ **sie bleiben stehen** *(Phase 17)* |
| `features/groups/gruppe.ts` | Kann der Gründer gehen? | ✅ **ja — die Leitung geht weiter** *(Phase 17)* |
| `app/(tabs)/index.tsx` · `WischStapel` | Was tut das Filterfeld im Stapel? | ✅ **es legt sich drüber**, es schiebt nicht *(2026-09-03)* |
| `app/create.tsx` | Was, wenn die rote Stelle aus dem Bild fällt? | ✅ **hinspringen UND benennen** *(2026-09-03)* |
| `app/(tabs)/index.tsx` | Was steht da, wenn Stapel UND Liste leer sind? | ✅ **ein** Leer-Zustand, der mit dem Ausweg *(2026-09-03)* |
| `features/groups/gruppe.ts` | Wer darf jemanden einladen? | ✅ **jedes Mitglied** *(Phase 18a)* |
| `features/groups/gruppe.ts` | Was sieht ein Fremder von einer privaten Gruppe? | ✅ **Name, Kategorie, Bezirk, Anzahl** — sonst nichts *(Phase 18a)* |
| `features/groups/gruppe.ts` | Was ist beim Gründen voreingestellt? | ✅ **offen** *(Phase 18a)* |

**Diese Regeln sind Ians, nicht Claudes.** In allen Dateien stehen die
verworfenen Möglichkeiten samt Begründung weiter im Kopfkommentar — als Gedächtnis,
nicht als Einladung. Änderungswünsche gehen an ihn, nicht in den Code.

### Was läuft

```bash
cd simplysocial
npm install          # nur beim ersten Mal
npx expo start --web # Prototyp im Browser
npm run typecheck    # tsc --noEmit  → war beim Übergeben sauber
npm run deploy       # bauen + auf GitHub Pages schieben (scripts/deploy.sh)
npm run doku         # PLAN.md/CLAUDE.md/_FUER_IAN → doku/ (macht der pre-commit-Hook selbst)
git add -A && git commit && git push   # ← DAS ist die Sicherung, nicht der Deploy
```

**Prototyp: https://ianfhorak-jpg.github.io/simplysocial/** · Code:
https://github.com/Ianfhorak-jpg/simplysocial (Zweig `main` = Quellcode,
`gh-pages` = gebautes Bündel, ein Commit, wird bei jedem Deploy überschrieben).
**`npm run deploy` fasst `main` NICHT an** — wer nur deployt, sichert nichts. Seit dem
2026-09-03 liegt auch die Doku im Repo (`doku/`, siehe `doku/LIESMICH.md`).

**Landing-Page: https://ianfhorak-jpg.github.io/simplysocial-landing/** · Code:
https://github.com/Ianfhorak-jpg/simplysocial-landing · Quelle liegt in `landing/`.
Kein Build — `git push` im Ordner `landing/` genügt, Pages nimmt `main` direkt.

Alle Adressen unten funktionieren auch **direkt aufgerufen** — dafür war Phase 8 da.
Zum Nachprüfen nach einer Änderung an Routen:
`curl -sL -o /dev/null -w '%{http_code}' https://ianfhorak-jpg.github.io/simplysocial/post/p4`

`npm run lint` läuft **nicht** — ESLint ist im Projekt nicht installiert. Kein Fehler,
nur nicht eingerichtet; der Typecheck ist die Prüfung, die zählt.

| Route | Was |
|---|---|
| `/` | **Start** — seit Phase 11 zwei Ansichten: **Stapel** (Standard, wischbare Karten + „Weg"/„Bin dabei") und **Liste** (die Post-Karten wie bisher). Umschalter oben, dazu „Alle / Wem ich folge", Kategorie-Pillen, „Posten" |
| `/create` | **Posten** — Formular mit Live-Vorschau der Karte |
| `/post/<id>` | **Detail** — alle Felder, Nachrichtenfeld, „Bin dabei" (z. B. `/post/p4`) |
| `/requests` | **Anfragen** — „Bekommen" (bestätigen/ablehnen, nach Post gruppiert) und „Geschickt" |
| `/match?postId=…&userId=…` | **Match** — Konfetti, „Ihr seid verabredet", „Zum Chat" |
| `/chats` | **Chat-Liste** — je Treffen eine Zeile mit letzter Nachricht und Zeit |
| `/chat/<id>` | **Chat** — Verlauf mit Post-Kopfzeile (z. B. `/chat/t1`) |
| `/profile` | **Eigenes Profil** — Bio, Zahlen, Interessen, eigene Posts |
| `/user/<id>` | **Fremdes Profil** mit Folgen-Knopf (z. B. `/user/u_lea`); `/user/u_ian` leitet auf `/profile` um |
| `/user/<id>/follower` | **Wer dieser Person folgt** |
| `/user/<id>/following` | **Wem diese Person folgt** |
| `/melden?art=post&id=…` | **Post melden** — Gründe, freiwillige Notiz (z. B. `?art=post&id=p4`) |
| `/melden?art=user&id=…` | **Person melden** — andere Gründe, danach Angebot zu blockieren |
| `/einstellungen` | **Einstellungen** — Blockierte, Nutzungsbedingungen, Account löschen, Werkstatt |
| `/nutzungsbedingungen` | **Regeln** — sechs Hausregeln + sichtbare Lücke fürs Rechtliche |
| `/account-loeschen` | **Konto löschen** — echte Zahlen, zwei Schritte |
| `/bausteine` | Werkstatt mit allen Bausteinen — seit Phase 7 über die Einstellungen |

### Was jetzt steht

```
simplysocial/src/
├── app/
│   ├── _layout.tsx           Stack, headerShown:false, SafeAreaProvider
│   ├── (tabs)/
│   │   ├── _layout.tsx       Tab-Leiste, Zahl am Anfragen-Tab
│   │   ├── index.tsx         FEED
│   │   ├── requests.tsx      ANFRAGEN — Bekommen/Geschickt, Bestätigen/Ablehnen
│   │   ├── chats.tsx         CHAT-LISTE — Gruppen „Verabredet" / „Vorbei"
│   │   └── profile.tsx       EIGENES PROFIL + Weg zur Werkstatt
│   ├── post/[id].tsx         POST-DETAIL (Verfasser-Karte führt aufs Profil)
│   ├── chat/[id].tsx         CHAT — Post-Kopfzeile, Blasen, Tagestrenner, Eingabe
│   ├── user/[id]/
│   │   ├── index.tsx         FREMDES PROFIL — Folgen-Knopf, eigenes wird umgeleitet
│   │   ├── follower.tsx      wer dieser Person folgt
│   │   └── following.tsx     wem diese Person folgt
│   ├── create.tsx            POSTEN — Formular + Vorschau
│   ├── match.tsx             MATCH — Konfetti, „Zum Chat"
│   ├── melden.tsx            MELDEN — Post oder Person, je nach `?art=`
│   ├── einstellungen.tsx     EINSTELLUNGEN — Blockierte, Recht, Konto, Werkstatt
│   ├── nutzungsbedingungen.tsx  REGELN — Hausregeln + Lücke fürs Rechtliche
│   ├── account-loeschen.tsx  KONTO LÖSCHEN — echte Zahlen, zwei Schritte
│   └── bausteine.tsx         Werkstatt (kein Produkt-Screen, kein Tab)
├── components/
│   ├── ui/                   SsText SsScreen SsButton SsCard SsChip SsAvatar
│   │                         SsInput SsSegment SsBack SsKonfetti
│   ├── PostCard.tsx          eine Zeile im Feed UND die Karte im Stapel
│   ├── WischKarte.tsx        ziehbare Karte: Kippung, Abrisskante, Stempel (Phase 11)
│   ├── WischStapel.tsx       drei Karten übereinander + Knöpfe + Anleitungskarte
│   ├── AntwortLeiste.tsx     fährt nach rechts-Wischen hoch, Gruß vorausgefüllt
│   ├── Profil.tsx            der Profilinhalt — eigenes UND fremdes Profil
│   ├── FolgeListe.tsx        der Inhalt beider Follower-Listen
│   ├── PrototypHinweis.tsx   ✅ Ians Regel: einmaliger Hinweis beim Öffnen
│   └── Platzhalter.tsx       „kommt in Phase X" — seit Phase 6 nirgends mehr benutzt
├── features/
│   ├── store.ts              ★ der Zustand — EINZIGE Datei, die mock.ts importiert
│   │                         (seit Phase 11 mit `weggewischt`, ohne Vorbild in mock.ts)
│   ├── posts/hooks.ts        useFeed, useStapel, usePost, freiePlaetze, istOffen,
│   │                         postErstellen, wegwischen, wischRueckgaengig
│   ├── posts/sort.ts         ✅ Ians Regel: das Neueste zuerst
│   ├── posts/profil.ts       ✅ Ians Regel: aufs Profil nur, was gerade läuft
│   ├── posts/lifecycle.ts    ✅ Ians Regel: bis Tagesende + SICHTDAUERN
│   ├── posts/wisch.ts        ✅ Ians Regel: links = weg (Sitzung), rechts = Gruß-Leiste
│   ├── requests/hooks.ts     useMeineAnfrage, anfrageSenden, useOffeneAnfragen,
│   │                         useEingehendeAnfragen, useGesendeteAnfragen,
│   │                         anfrageBestaetigen, anfrageAblehnen
│   ├── requests/logic.ts     ✅ Ians Regel: Warteliste, still + postNachBestaetigung
│   ├── chat/logic.ts         mitChatFuerTreffen — der Chat entsteht beim Bestätigen
│   ├── chat/hooks.ts         useChatListe, useChat, useChatZuPost, nachrichtSenden
│   ├── chat/lifecycle.ts     ✅ Ians Regel: erst „Vorbei", dann weg + NACHKLANG_TAGE
│   ├── chat/sort.ts          ✅ Ians Regel: die neuen (stummen) Chats immer oben
│   ├── social/hooks.ts       useCurrentUser, useUser, useUserMap, useFolgeIch,
│   │                         folgen, entfolgen, useFolgeListe
│   ├── statisch.ts           ★ Phase 8: welche IDs es beim BAUEN gibt (Deploy-Krücke)
│   ├── safety/block.ts       ✅ Ians Regel: alles weg + LEISE/HART/GETRENNT
│   └── safety/hooks.ts       istBlockiert, blockieren, entblocken, useBlockierte,
│                             melden, useMeineMeldung, useMeineSpuren
├── lib/
│   ├── zeit.ts               „Heute 18:30", „Seit 14:00", parseUhrzeit, zeitpunkt
│   ├── bezirk.ts             istWienerBezirk — die 23 echten Wiener PLZ
│   └── navigation.ts         zurueckOderFeed() — steckt in SsBack
├── config/                   brand.ts (einzige Stelle mit „SimplySocial"), categories.ts,
│                             melden.ts (die Melde-Gründe)
├── theme/                    colors.ts (inkl. danger) spacing.ts type.ts
├── types/models.ts           Abschnitt 2 + `blockedIds` am User und `Report` (Phase 7)
└── data/mock.ts              6 Nutzer · 14 Posts · 7 Anfragen · 2 Chats · 9 Nachrichten
                              · 0 Meldungen, 0 Blocks (beide bewusst leer)
```

Leer ist nichts mehr, und **Platzhalter ist seit Phase 6 keiner mehr**.

### Regeln, die scharf sind

1. **Kein Screen importiert `data/mock.ts`.** Nur `features/store.ts` tut das.
   Nachprüfbar: `grep -rn "from '@/data/mock'" src/` muss genau **einen** Treffer liefern.
2. **Zurück-Knöpfe sind `<SsBack />`.** Den Baustein nehmen, dann kann man es nicht
   falsch machen.
3. **Jeder Tab-Screen bekommt `<SsScreen tabScreen>`**, sonst doppelter
   Sicherheitsabstand über der Leiste (ACTA-Falle).
4. **Screens mit Eingabefeldern bekommen `<SsScreen scroll keyboard>`.**
   *Eine begründete Ausnahme seit Phase 5:* `app/chat/[id].tsx`. Ein Chat hat die
   Eingabe fest unten und scrollt nur den Verlauf — mit `scroll` müsste man vor jeder
   Nachricht ans Seitenende scrollen. Wer die nächste Ausnahme macht, schreibt die
   Begründung genauso in den Dateikopf.
5. **Jede neue Datei in `(tabs)/` wird automatisch ein Tab.** Ausblenden nur mit
   `<Tabs.Screen name="..." options={{ href: null }} />`.
6. **Neue Eingabefelder sind `SsInput`**, keine blanken `TextInput`. Fehlt eine
   Eigenschaft, kommt sie an den Baustein (so kam `onSubmitEditing` in Phase 5 dazu).
7. **Startzeiten im Feed gehen durch `startOderSeit`**, nicht durch `startText`.
8. **Die acht entschiedenen Regeln** (`posts/sort.ts`, `posts/lifecycle.ts`,
   `posts/profil.ts`, `posts/wisch.ts`, `requests/logic.ts`, `chat/lifecycle.ts`,
   `chat/sort.ts`, `safety/block.ts`) sind Ians. Änderungswünsche gehen an ihn, nicht
   in den Code.
9. **Alles, was zusammengehört, in EINEM `aendern`.** `anfrageBestaetigen` ändert
   Anfrage, Post und Chat in einem Aufruf; `nachrichtSenden` die Nachricht und
   `lastMessageAt` am Faden. Zwei getrennte Aufrufe hätten dazwischen einen halben
   Zustand — und React zeichnet ihn.
10. **Profil-Inhalt kommt aus `components/Profil.tsx`**, nie direkt in einen der beiden
   Profil-Screens geschrieben. Sonst zeigt das eigene Profil irgendwann etwas anderes
   als das, was Fremde sehen — und man merkt es nicht.
11. **Eine Folge-Beziehung steht ZWEIMAL im Datenmodell** (`followingIds` bei mir,
   `followerIds` beim anderen). Sie nur über `folgen` / `entfolgen` aus
   `social/hooks.ts` anfassen — die pflegen beide Seiten in einem `aendern`.
12. **Ein BLOCK steht dagegen nur EINMAL** (`blockedIds` beim Blockierenden) — und das
   ist keine Inkonsequenz, sondern der Kern: Wer blockiert wird, darf es nicht merken.
   Gefragt wird trotzdem in beide Richtungen, über `istBlockiert(a, b)` aus
   `safety/hooks.ts`. Nie selbst `blockedIds` durchsuchen — dann prüft man eine Richtung
   und die andere nicht, und der Fehler fällt niemandem auf.
13. **Neue dynamische Route = neues `generateStaticParams`.** Sonst heißt die gebaute
   Datei `[id].html` und jeder Direktaufruf ist 404 — im Dev-Server unsichtbar, erst
   auf der echten Adresse zu merken. Die IDs kommen aus `features/statisch.ts`, nie
   aus `mock.ts` (das wäre Regel 1). Auch verschachtelte Kinder unter einem `[id]`
   brauchen eine eigene — der Parameter vererbt sich beim Bauen NICHT von allein
   (in Phase 8 an `user/[id]/follower.tsx` gemessen).
14. **Fake-Daten enthalten nichts Persönliches.** Keine Schule, keine Klasse, kein
   Name einer echten Person, die nicht gefragt wurde. Seit Phase 8 liegt der Prototyp
   auf einer öffentlichen Adresse, und Links werden weitergeleitet. Die Begründung
   steht im Kopf von `data/mock.ts`.
15. **`landing/stil.css` ist eine KOPIE des Design-Systems, keine Verbindung.** Wird in
   `src/theme/colors.ts` eine Farbe geändert, ändert sich die Landing-Page NICHT mit.
   Beides zusammen anfassen — sonst sieht die Seite, die die App vorstellt, eines Tages
   anders aus als die App.
16. **Die Landing-Page bekommt kein Formular ohne Backend.** Eine Warteliste, die nichts
   speichert, ist schlimmer als keine: Man trägt sich ein und glaubt, es sei angekommen.
   Dieselbe Haltung wie beim Rechtstext in Phase 7.
17. **Im Stapel gehört der Tipp der KARTE, nicht ihrem Inhalt.** `PostCard` bekommt
   dort kein `onPress` — `WischKarte` entscheidet beim Loslassen, ob es ein Tipp oder
   ein Wisch war. Wer dem Inhalt wieder ein `onPress` gibt, baut den Fehler aus
   Phase 11 nach: wischen und trotzdem im Post-Detail landen (siehe Fallen).
18. **Der Stapel liest über `useStapel`, und das liest über `useFeed`.** Nicht daneben
   bauen: Kategorie, „Wem ich folge", Sichtbarkeit, Blocks und Reihenfolge sollen in
   beiden Ansichten dieselben sein. Was der Stapel ZUSÄTZLICH wegnimmt, entscheidet
   `posts/wisch.ts` — Ians Regel, nicht die Meinung des Hakens.
19. **Was ein Block anfasst, steht in `safety/block.ts` und nirgends sonst.** Screens
   lesen nie `BLOCK_WIRKUNG` direkt, sondern sehen nur das Ergebnis; Texte über Folgen
   eines Blocks kommen aus `blockFolgen()`. Sonst behauptet irgendwann ein Screen etwas,
   das die Regel nicht mehr tut — und es merkt niemand, weil man nur die eigene Seite
   sieht.

### Was als Nächstes anstehen KÖNNTE — entschieden wird es am Feedback

Der Plan ist abgearbeitet. Diese Liste ist ein Vorrat, keine Reihenfolge.

- **Eine eigene Domain.** `ianfhorak-jpg.github.io/simplysocial-landing/` sagt man nicht
  am Telefon. `simplysocial.at` kostet rund 15 € im Jahr, und GitHub Pages nimmt eigene
  Domains gratis: ein `CNAME` im Repo, zwei DNS-Einträge, fertig. **Ians Entscheidung,
  weil es Geld kostet.** Danach ist das der Link, den er überall hinschreibt.
- **Fotos und die längere Geschichte** für die Landing-Page. Sie steht bewusst kurz —
  das war Ians Vorgabe. Wenn Fotos der vier kommen, ist der Abschnitt „Wer wir sind"
  die Stelle dafür, und die Namen sind schon gesetzt.
- **Das Logo.** Der Freund zeichnet es (`OFFENE_SACHEN.md`, Punkt 3). Es wird an ZWEI
  Stellen gebraucht: `config/brand.ts` in der App und die Wortmarke in
  `landing/index.html`. Beide zusammen tauschen.
- **Das Backend.** Die Naht dafür ist `features/store.ts` und bleibt bis dahin
  unangetastet. Vorher steht die Wahl an: Firebase oder Supabase (Abschnitt 8).
- **Was die Freunde gesagt haben.** Kommt vor allem anderen — siehe oben.

### Was der Deploy im Betrieb bedeutet

- **Der Zustand lebt nur im Browser-Speicher.** Jedes Neuladen setzt alles auf die
  Fake-Daten zurück; am Handy passiert das öfter als am Schreibtisch. Seit Phase 8 sagt
  die App das beim ersten Öffnen selbst (`components/PrototypHinweis.tsx`) — der Satz
  steht zusätzlich in `_FUER_IAN/README.md` zum Mitschicken, weil Links weitergeleitet
  werden und Erklärungen nicht.
- **Es gibt keinen Login.** Jeder, der den Link öffnet, ist Ian und sieht Ians Chats.
  Für einen Prototyp richtig — steht deshalb ebenfalls im Hinweis.
- **Der HTML-Schnappschuss ist von der BAUZEIT.** Die Fake-Daten rechnen relativ zu
  „jetzt" (`data/mock.ts`), das vorgerenderte HTML kennt aber nur das „jetzt" des
  Deploys. Beim Laden korrigiert React die Zeiten sofort; sichtbar ist nichts, in der
  Konsole steht eine Hydration-Warnung (React #418). Im Chat gemessen, kein Fehler.
  **Wer lange nicht deployt hat, sollte trotzdem `npm run deploy` laufen lassen** —
  sonst zeigt die erste Zehntelsekunde alte Termine.

### Fallen, die bisher Zeit gekostet haben

- **Ein Screen weiss nicht, was im Bild ist.** (2026-09-03) `VERSTECKTER_FEHLER` im
  Erstellen-Screen behandelt genau den Fall „rote Stelle nicht sichtbar" — aber es
  setzt sichtbar mit **aufgeklappt** gleich. Bei 1991 px Inhalt in einem 667-px-Fenster
  ist ein aufgeklapptes Feld trotzdem 752 px weit weg. **Wer „ist das zu sehen?"
  beantworten will, braucht eine Position und eine Fensterhöhe — kein `useState`
  über offen/zu.**
- **Zwei Bausteine, die einzeln stimmen, ergeben zusammen zwei Antworten auf dieselbe
  Frage.** (2026-09-03) `StapelDurch` ist als Überschrift ÜBER einer Liste gebaut und
  verspricht sie im Text; `LeererFeed` ist gebaut, als wäre es allein auf dem Schirm.
  Leert ein Filter beide, stehen sie übereinander und widersprechen einander. Keiner
  der beiden kennt den anderen — und der Kommentar an der Zusammensetzung hat die
  Frage nie gestellt. **Dieselbe Bauart wie die zwei Stilwerte aus Phase 12.**
- **`onLayout` meldet auf Web über einen ResizeObserver — also erst NACH dem
  Zeichnen.** (2026-09-03) Wer im selben Klick etwas einblendet und dann dorthin
  scrollen will, hat die neue Position noch nicht. Ein `requestAnimationFrame` reicht
  am Mac und auf einem langsameren Gerät nicht; zwei geschachtelte schon. Am
  Schreibtisch ist der Unterschied unsichtbar.
- **`onLayout` misst relativ zum ELTERN-Element, nicht zum Scroll-Inhalt.** (2026-09-03)
  Drei der fünf Felder im Erstellen-Screen liegen in `mehrBereich`. Deren y-Werte
  brauchen dessen eigenes y dazu — und zwar **beim Lesen**, nicht beim Merken: Der
  Elternteil meldet seine Position womöglich später als seine Kinder.
- **Eine Fabrik-Funktion, die ein Ref anfasst, ist ein Lint-Fehler.** (2026-09-03)
  `merkePosition(feld)` gab einen Handler zurück — aufgerufen wird die Fabrik aber
  beim RENDERN, und `react-hooks/refs` verbietet das zu Recht. Der Ausweg ist keine
  Ausnahme, sondern die andere Form: eine gewöhnliche Funktion, aufgerufen aus einem
  `onLayout`-Handler heraus.

- **Ein `flex: 1`-Kasten mit absolut positionierten Kindern hat keine Mindesthöhe.**
  (2026-09-03) Der Kommentar daneben sagte es schon falsch: „braucht die Fläche selbst
  keine Höhe — sie bekommt sie vom `flex: 1`". `flex: 1` heißt **Restplatz**. Nimmt ein
  aufgeklapptes Feld daneben 250 px, bleibt weniger übrig, als eine Karte hoch ist —
  und weil die Karten `position: absolute` sind, schrumpfen sie nicht mit, sondern
  quellen heraus. Ein normales Kind hätte den Kasten aufgedrückt oder wäre gestaucht
  worden; ein absolutes Kind weiß nichts von seinem Kasten und der Kasten nichts von
  ihm. Beide Werte sind einzeln richtig, der Fehler entsteht erst zusammen. **Und
  `justifyContent: 'center'` macht es symmetrisch schlimm**: Der Überstand ging nach
  oben UND unten — über die Kategorie-Pillen und über „Weg"/„Bin dabei".
- **„Wo endet der Platz?" weiß der Baustein, nicht der Screen.** (2026-09-03) Der erste
  Fix legte das Filterfeld im Screen über den ganzen Stapelbereich. Auf 390 × 844 und
  375 × 667 sah das richtig aus — auf **360 × 600 verschwanden die Knöpfe vollständig
  dahinter**. Der Screen kann nicht wissen, wo die Karten aufhören; er hätte eine Höhe
  raten müssen. Als Slot IN der Kartenfläche (`WischStapel.blatt`) heißt
  `maxHeight: '100%'` genau das Richtige — und bleibt richtig, wenn eine Filterreihe
  dazukommt. Gleiche Familie wie `NOTBREITE` in `wisch.ts`: **Die Grenze gehört dorthin,
  wo die Geometrie bekannt ist.**
- **Ob ein Knopf verdeckt ist, sagt `document.elementFromPoint`** — nicht das Auge und
  nicht die Textgeometrie. (2026-09-03) Eine Messung am Text-Knoten („Weg" bei y = 448)
  legte nahe, der Knopf liege hinter dem Filterfeld. Er lag es nicht: Der Knopf-Kasten
  begann bei y = 516, der Textknoten hat seine eigene Lage. Die ehrliche Frage ist,
  wer an der Knopfmitte wirklich getroffen wird.
- **`npm run deploy` sichert NICHTS.** (2026-09-03, zwei Tage lang unbemerkt) Das Skript
  baut und schiebt den Zweig `gh-pages` — den gebauten, minifizierten Zustand. `main`
  fasst es nie an. Dadurch stand als Quellcode auf GitHub noch „Phase 0 bis 8" vom
  01.09., während **neun Phasen (54 Dateien, ~7.100 Zeilen) nur lokal lagen**. Aus dem
  Bündel auf `gh-pages` bekommt man keinen lesbaren Quellcode zurück; iCloud spiegelt
  nur und hebt keine Versionen auf. Die Täuschung ist die Wortwahl: Ein Skript, das
  „hochladen" heißt, sieht aus wie eine Sicherung. **Nach jeder Phase committen — der
  Deploy ist keine.** Seit dem 03.09. liegt die Doku über `doku/` mit im Repo
  (`npm run doku`, plus ein `pre-commit`-Hook, der es selbst tut).
- **`*/` in einem Blockkommentar beendet den Kommentar.** (Phase 0, `mock.ts`)
- **React Native kennt bei `cursor` nur `'auto'` und `'pointer'`.** (Phase 0)
  Dasselbe gilt für `outlineStyle: 'none'` (Phase 3).
- **Ein `ScrollView` neben einer `FlatList` wird auf Höhe 0 zusammengedrückt.** (Phase 2)
  Horizontale Pillenleisten brauchen `flexShrink: 0`.
- **`router.back()` ohne `canGoBack()` ist auf Web ein toter Knopf.** (Phase 2)
  Steckt jetzt in `SsBack`.
- **Emoji-Glyphen zeichnen breiter als ihre Box.** (Phase 2)
- **`flex: 1` schrumpft nicht unter die Inhaltsbreite.** (Phase 3) `minWidth: 0` setzen.
- **Ein Browser schickt nach jedem Ziehen zusätzlich ein `click`.** (Phase 11, teuer)
  Er feuert es auf dem gemeinsamen Vorfahren von `mousedown` und `mouseup` — egal, wie
  weit die Maus dazwischen gewandert ist. Das Responder-System von React Native kennt
  dieses Ereignis nicht und kann es nicht abbestellen; das `Pressable` von
  react-native-web hört aber darauf. Folge: Karte weggewischt **und** Post-Detail
  geöffnet. Lösung ist nicht, den Klick zu unterdrücken, sondern **Tipp und Wisch aus
  einer Hand**: Die Karte nimmt die Berührung selbst an (`onStartShouldSetPanResponder`)
  und entscheidet beim Loslassen, was es war. Der Inhalt bekommt kein `onPress`.
- **`PanResponder` gibt die Geste auf Nachfrage her — und sagt von sich aus JA.**
  (Phase 11, am teuersten) Am breiten Fenster lief das Wischen einwandfrei, in
  Handybreite bewegte sich die Karte keinen Millimeter. Die Spur aus einer Sonde in
  den Handlern: `start:0 · grant · move:-18 · terminationRequest · TERMINATE`. Nach
  dem ERSTEN Move fragt jemand, ob er die Geste haben darf; die Voreinstellung von
  `onPanResponderTerminationRequest` ist „ja", und danach federt die Karte zurück,
  während der Finger weiterzieht. Für einen Wischstapel ist die Antwort immer
  **`false`**. Lehre fürs nächste Mal: Wenn eine Geste „manchmal" nicht geht, in die
  Handler hineinmessen statt Größen zu variieren — die Spur sagt es in einer Zeile.
- **„Ist das ein Tipp?" darf nicht nur `dx` beim Loslassen fragen.** (Phase 11) Wer eine
  Karte anschiebt und wieder zurückzieht, hat beim Loslassen `dx ≈ 0` — und landete
  prompt im Post-Detail, den er gerade nicht wollte. Es braucht einen Merker über die
  ganze Berührung (`bewegt` in `WischKarte.tsx`).
- **`flex: 1` heißt in React Native `flexBasis: 0`, im Browser `auto`.** (Phase 11)
  Deshalb melden die Hälften von `SsSegment` Breite null an. Als einziges Kind einer
  Spalte wird das Segment gestreckt und es fällt nicht auf — in einer ZEILE neben
  anderem Inhalt fällt es auf seine Polsterung zusammen, aus „Stapel" wurde „Sta…".
  Segmente in Zeilen brauchen `minWidth`.
- **Absolute Kinder und Polsterung sind auf Web und nativ nicht dasselbe.** (Phase 11)
  Yoga rechnet dem absolut positionierten Kind die Polsterung des Elternteils an, CSS
  nicht. Deshalb bekommt der Stapel seinen Seitenabstand von einem Rahmen AUSSEN
  (`stapelBereich`), nicht von der Kartenfläche.
- **Der blaue Fokus-Ring im Browser braucht `outlineStyle: 'solid'` PLUS
  `outlineWidth: 0`.** (Phase 3)
- **Ein `"` in einem JSX-Attribut beendet das Attribut.** (Phase 3) Deutsche
  Anführungszeichen sind `„…“` — das schließende ist ein anderes Zeichen.
- **`StyleSheet.absoluteFillObject` gibt es in React Native 0.86 nicht mehr.** (Phase 4)
  Ausschreiben: `position: 'absolute', top: 0, right: 0, bottom: 0, left: 0`.
- **`pointerEvents` gehört in den `style`, nicht in die Props.** (Phase 4) Als Prop ist
  es seit React Native 0.76 veraltet und warnt in der Konsole.
- **Der Zustand lebt nur im Browser-Speicher.** (Phase 4) Beim Prüfen im Browser gilt:
  jedes Neuladen setzt Posts und Anfragen auf die Fake-Daten zurück. Einen Ablauf über
  mehrere Schritte muss man ohne Reload durchklicken.
- **`typedRoutes` kennt eine neue Route erst nach einem Dev-Server-Lauf.** (Phase 6)
  In `app.json` steht `experiments.typedRoutes: true` — Expo schreibt daraus
  `.expo/types/router.d.ts`, eine Liste ALLER existierenden Pfade als Typ. Das ist
  wertvoll (ein Tippfehler in `router.push` wird ein Compile-Fehler), heißt aber: Nach
  dem Anlegen einer neuen Route meldet `npx tsc --noEmit` den Pfad als unbekannt, bis
  `npx expo start` einmal gelaufen ist und die Datei neu geschrieben hat. Kein Fehler
  im Code — erst den Server starten, dann den Typecheck glauben.
- **Emoji auf dunklem Grund verschwinden.** (Phase 6) `➕` ist ein graues Glyph und
  nimmt keine Textfarbe an; auf der dunklen Fläche des Hauptknopfes wurde daraus ein
  schmutziger Fleck. Dieselbe Eigenschaft, die bei den Tab-Symbolen gewollt ist
  (deshalb dort die Deckkraft und keine Farbe). Vor jedem Emoji auf gefülltem Grund
  einmal hinschauen — oder es weglassen.
- **Zwei Zeitstempel können exakt gleich sein.** (Phase 5) `Date.now()` löst in
  Millisekunden auf, und zwei Zeilen Code laufen ohne Weiteres in derselben — in
  `data/mock.ts` sind die letzten zwei Nachrichten von Chat t2 auf die Millisekunde
  gleich alt. „Die neueste suchen" mit `>` nahm dadurch die falsche, und die Chat-Liste
  zeigte Tobis Frage statt der Antwort darauf. Bei einer Liste, die nur hinten wächst,
  ist `>=` richtig: bei Gleichstand gewinnt die spätere Position.
  Im Browser gefunden, nicht am Schreibtisch.

- **Ein neues Feld am `User` bricht `UserSeed`.** (Phase 7) `data/mock.ts` baut die
  Nutzer aus `USER_SEEDS` und rechnet die Beziehungslisten dazu; der Seed-Typ ist
  `Omit<User, 'followerIds' | 'followingIds'>`. Kommt ein Feld am `User` dazu, das
  ebenfalls berechnet wird (`blockedIds`), verlangt TypeScript es plötzlich an jedem
  der sechs Seeds. Die Lösung ist, es in den `Omit` aufzunehmen — nicht, es sechsmal
  hinzuschreiben. Ein abgeleiteter Typ ist eine Regel, keine Abkürzung.
- **Ein Text, der eine Regel beschreibt, muss AUS der Regel kommen.** (Phase 7) In
  `blockFolgen()` stand als Schlusssatz „Die Person erfährt nichts davon." — richtig
  unter zwei der drei Möglichkeiten. Als Ians Entscheidung auf HART fiel, war er falsch:
  Wessen Zusage zurückgenommen wird, DER MERKT ETWAS. Nicht was, aber dass. Der Satz
  hängt jetzt wie alle anderen an `wirkung`. Das ist die Art Fehler, die niemand
  bemerkt — man sieht beim Testen ja nur die eigene Seite.

- **`expo export` baut je Routen-MUSTER eine Datei, nicht je Adresse.** (Phase 8)
  `dist/post/[id].html` — mit eckigen Klammern im Dateinamen. Im Dev-Server unsichtbar,
  auf dem echten Hoster 404. Lösung: `generateStaticParams`. Verschachtelte Kinder
  (`user/[id]/follower.tsx`) brauchen eine EIGENE — der Parameter des Elternteils
  vererbt sich beim Bauen nicht von allein.
- **GitHub Pages schiebt alles durch Jekyll, und Jekyll überspringt jeden Ordner, der
  mit `_` anfängt.** (Phase 8) Expo legt das komplette Bündel in `_expo/` ab. Ohne eine
  leere `.nojekyll` deployt alles fehlerfrei — und die Seite bleibt weiß, ohne
  Fehlermeldung. Sie liegt in `public/`, damit sie im Build steckt und kein Handgriff ist.
- **Ein Hinweis, der über der App liegt, verdeckt die App.** (Phase 8) Der Prototyp-
  Balken lag zuerst als Ebene obendrauf und verdeckte auf dem Feed genau die Wortmarke,
  den „Posten"-Knopf und den Umschalter — das Erste, was man beim Herzeigen sieht. Im
  Browser sofort zu sehen, am Schreibtisch nicht. Jetzt schiebt er statt zu überdecken.
- **Etwas löschen und im Kommentar zitieren, warum, löscht es nicht.** (Phase 8) Beim
  Entfernen von Schule und Klasse aus `mock.ts` stand beides wörtlich in dem Kommentar,
  der die Entfernung begründete — im öffentlichen Repo wäre es unverändert dringestanden.
  Dieselbe Falle wie ein Passwort, das man aus dem Code nimmt und in die Git-History
  schreibt. Vor dem ersten Push mit `git grep` gegenprüfen, nicht nur mit den Augen.
- **Etwas, das ein Zustand ist, gehört nicht in einen Verlauf.** (Phase 8) Der Zweig
  `gh-pages` bekommt bei jedem Deploy genau EINEN Commit (`--force`). 2 MB erzeugte
  Dateien, die sich jedes Mal komplett unterscheiden, machen jeden Verlauf unlesbar.
- **`sessionStorage` beim Testen im Browser nicht vergessen.** (Phase 8) Der einmalige
  Hinweis kam nach dem Neubauen nicht wieder — nicht kaputt, sondern korrekt gemerkt.
  Zum Prüfen `sessionStorage.clear()` in der Konsole.
- **Alles, was nur im Browser existiert, gehört in einen `useEffect`.** (Phase 8) Der
  Hinweis-Balken startet auf `sichtbar = false` und wird erst im Effekt gesetzt. Effekte
  laufen nie beim Vorrendern — Server und erster Browser-Lauf liefern damit beide
  „nichts", identisch, kein Hydration-Fehler. Hätte er gleich gerendert, würde er auch
  für den erscheinen, der ihn längst weggeklickt hat.

- **Reveal-beim-Scrollen kann Elemente ÜBERSPRINGEN.** (Phase 9) Ein
  `IntersectionObserver` meldet nur, was er zwischen zwei Bildern sieht. Springt die
  Seite in einem Bild um tausend Pixel — harter Wisch am Handy, Ankerlink, oder ein
  Testskript, das in 400er-Schritten scrollt —, rauscht ein Element komplett durchs
  Fenster und wird nie „sichtbar". Getroffen hat es ausgerechnet den letzten Knopf der
  Seite, den mit dem Link auf den Prototyp. Die Behebung ist, bei jeder Meldung
  nachzuziehen, was inzwischen oberhalb der Fensterunterkante steht.
- **Was sich zum Auftauchen versteckt, muss sich an JavaScript binden.** (Phase 9)
  `.reveal { opacity: 0 }` im Stylesheet heißt: Läuft das JavaScript nicht, ist die
  Seite weiß. Genau so sah der erste Vollseiten-Screenshot aus — alles unterhalb des
  Heros leer. Die Regeln hängen jetzt an einer Klasse `.js`, die ein Inline-Skript im
  `<head>` setzt, bevor gezeichnet wird. Ohne JavaScript greift keine davon.
- **Google Fonts per `<link>` ist in der EU ein Rechtsproblem.** (Phase 9) Der Browser
  holt die Datei bei Google und schickt dabei die IP des Besuchers mit; das LG München
  hat 2022 entschieden, dass das ohne Einwilligung nicht geht. Selbst hosten ist ein
  `curl` und ein `@font-face` — und bei einem Projekt, das die DSGVO als offenen Punkt
  führt, das Mindeste.
- **Deko muss man lesen können.** (Phase 9) Die zwei Nebenkarten im Hero lagen zuerst so
  übereinander, dass eine Überschrift mittendurch geschnitten war. Im Code sah das nach
  „Stapel" aus, im Browser nach Darstellungsfehler. Die Positionen sind jetzt gegen die
  gemessenen Kartenhöhen gesetzt, nicht geschätzt.
- **Zu viel Weißraum liest sich nicht großzügig, sondern unfertig.** (Phase 9)
  `padding: clamp(72px, 11vw, 140px)` oben und unten ergab am großen Schirm 280 px
  zwischen zwei Abschnitten. Der erste Eindruck war „da fehlt etwas".
