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
| Endziel | Echte iOS-App im App Store (**Apple Developer Program hat Ian am 2026-09-11 gekauft** — die Zeile sagte bis dahin „2026-08-31", das war eine Annahme aus dem Brief und nie wahr) |
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

> ✅ **Seit dem 2026-09-06 ist das kein Sammelbecken mehr, sondern ein Plan:**
> **Abschnitt 5b, Phasen 19 bis 21.** Die drei offenen Wahlen darin sind entschieden —
> Supabase, Gerät vor Backend, drei Anmeldewege.

- ~~Echtes Backend (Firebase oder Supabase — noch nicht entschieden)~~ → **Supabase**,
  Phase 20. Der Grund ist eine einzige Eigenschaft: Firestore-Regeln filtern keine
  Zeilen, Postgres-Policies schon — und die zentrale Regel dieser App IST ein
  Zeilenfilter.
- ~~Login / Registrierung~~ → Phase 20.3, Ians Entscheidung 35.
- **Push-Nachrichten** — weiter offen und bewusst nicht in 19–21. Sie brauchen einen
  Grund („jemand hat zugesagt"), und den gibt es erst, wenn echte Leute posten.
- ~~EAS-Build, TestFlight, App Store~~ → Phasen 19 und 21.

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

### Nachtrag 2026-09-06 — der tote Streifen unter der Tab-Leiste ✅

**Ian am Handy, Chrome:** *„die Website bugt unten, mit einem Refresh lässt sich das
fixen aber ich will das weg haben."* Auf dem Bild steht unter der Tab-Leiste ein Streifen
in der Grundfarbe, dann erst Chromes eigene Leiste.

**Gefunden wurde es nicht im Browser, sondern im Screenshot.** Am Schreibtisch ist die
Lücke nicht herstellbar: Dort sind Layout-Fenster und Sicht-Fenster dasselbe, und
`browser_resize` erzeugt genau den Fall nicht, um den es geht. Drei Vermutungen standen
gleich plausibel nebeneinander (veraltete SafeArea-Insets, ein gecachter Frame in
`react-native-safe-area-context`, die Tab-Leiste selbst). Entschieden hat erst das
Ausmessen von Ians Bild:

| | |
|---|---|
| sichtbare Seitenhöhe | 661 pt |
| App-Höhe | 610 pt |
| Tab-Leiste | 52 pt — **korrekt**, nicht ihr Fehler |
| **Lücke** | **51 pt** ≈ Höhe von Chromes unterer Leiste |

Damit war die Ursache benannt: **Chrome zieht seine eigene Leiste zweimal ab.** Das
Fenster endet ohnehin schon über ihr, und `100dvh` rechnet sie noch einmal heraus. Ians
Chrome hat die Adressleiste UNTEN — diese Stellung ist neuer als die dvh-Umsetzung in
WebKit. Ein Neuladen half, weil der Browser dabei ohnehin neu rechnet.

**Die Ironie gehört zur Lehre:** `100dvh` stand in `global.css` als Fix gegen `100vh`,
das zu GROSS war und den Inhalt unter der Adressleiste versteckte. Der Kommentar dort
beschrieb genau das. Dieselbe Zeile erzeugt jetzt den umgekehrten Fehler.

**Der Fix ist eine dritte Stufe**, kein Ersetzen: `100%` → `100dvh` → `var(--ss-hoehe)`,
alle drei in `global.css` untereinander, gesetzt aus `window.visualViewport.height` von
einem Skript in `app/+html.tsx`. Der Unterschied ist grundsätzlich — eine CSS-Einheit
rührt der Browser nur an, wenn er ohnehin neu rechnet; `visualViewport` **meldet** seine
Änderung. Vier Dinge daran sind wichtiger als die Zeilen:

1. **Die offene Tastatur darf die Höhe NICHT verändern.** `visualViewport.height`
   schrumpft auch bei ihr. Ließe man die App mitschrumpfen, änderte sich das Verhalten
   des Chat-Screens (harte Regel 9: Eingabe fest unten) still mit — aus einem Fehlerfix
   würde nebenbei eine Umgestaltung. Deshalb der Schwellwert von drei Vierteln.
2. **Der Vergleichswert kalibriert sich selbst und wird beim Drehen zurückgesetzt.**
   Ohne das Zurücksetzen hielte das Skript jede Drehung ins Querformat für eine offene
   Tastatur — quer ist ein Fenster wirklich um die Hälfte niedriger.
3. **Ohne JavaScript passiert nichts, und Stufe 2 gilt weiter.** Eine Seite, deren Höhe
   an einem Skript hängt, das nie ankommt, wäre auf Höhe null. Derselbe Gedanke wie das
   Sicherheitsnetz `ss-notausgang` (harte Regel 21).
4. **Die Klasse `ss-hoehe-echt` verbindet zwei Dateien.** Sie steht im Skript und im
   CSS; wer eine der beiden Hälften anfasst, muss die andere kennen. Ihr Selektor trägt
   `html.` nur mit, um Expos eigenen Reset (`#root{height:100%}`) zu schlagen — gegen
   eine ID gewinnt keine Reihenfolge, nur mehr Gewicht.

Nachgeprüft am gebauten Bündel in vier Fällen: Leistenwechsel (folgt, Lücke 0), Tastatur
(hält den letzten guten Wert), Drehen (setzt zurück und folgt), ohne Skript (Stufe 2
trägt, keine Höhe null).

### Phase 18 — Was aus Leopolds und Ians Rückmeldung folgt

> **Der Abschnitt war ein Plan und ist jetzt großteils ein Bericht.** Ian am 2026-09-03:
> *„Fang schon mal an einen Plan zu schreiben was man ändern muss, aber ich wart noch
> auf die zwei anderen dass sie sich melden."* Am **2026-09-05** hat er zweimal gesagt:
> *„mit Plan weitermachen."* **18a, 18b und 18c sind damit gebaut** (siehe unten), 18d
> steht weiter als Vorrat da.

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

#### 18b — Jahrgang statt Alters-Bänder ✅ *(gebaut am 2026-09-05)*

> ✅ **Ians Entscheidung 17: der Schiebe-Balken kommt, auf JAHRGANG** — „mehr als
> Jahrgang brauchen wir nicht" (Abschnitt 6). Und **Entscheidung 30 vom 2026-09-05:
> am Profil steht der Jahrgang offen** („Jahrgang 2009").

Der Eingriff mit den weitesten Folgen in diesem Plan, weil er das **Datenmodell** ändert
und nicht eine Oberfläche. Vorher:

```
AgeGroup = 'egal' | '14-17' | '18-25' | '26+'     ← am POST
AgeBand  = Exclude<AgeGroup, 'egal'>              ← am MENSCHEN
```

Jetzt:

```
User.jahrgang: number
Post.alter: { kind: 'egal' } | { kind: 'spanne'; vonJahrgang: number; bisJahrgang: number }
```

**Warum wieder ein Union und nicht zwei Zahlen mit `| null`:** Sonst ist „Spanne ohne
Grenzen" darstellbar, und jede Anzeigestelle muss raten. Vierte Runde derselben Frage
(`Post.district`, `ChatThread.postId`, `Visibility`) — und es hat genauso funktioniert
wie beim dritten Mal: Sobald `post.ageGroup === 'egal'` ungültig wurde, hat `tsc` **37
Fehler in acht Dateien** gemeldet, und das war die vollständige Arbeitsliste.

**Was weggefallen ist:** Harte Regel 27 (`AgeGroup` vs. `AgeBand`) — *der Grund dahinter
bleibt aber wahr*: Eine Aktivität kann „für alle" sein, ein Mensch nicht. Im neuen Modell
ist das sogar sauberer, weil es sich gar nicht mehr AUSDRÜCKEN lässt: Ein `jahrgang` ist
eine Zahl und kann nicht „egal" sein. **Ians Entscheidung 18 ist unangetastet:** Ein Post
„für alle" passt weiter zu jedem Alters-Filter (`ALTER_REGEL`).

**Neu gebaut: `SsJahrgangBalken`** — zwei Griffe auf einer Schiene, JS-only
(`PanResponder`, harte Regel 1). Benutzt an **drei** Stellen: Feed-Filter, Erstellen-Screen
und `/bausteine`. Bewusst ein Baustein und keine lokale Komponente: Zwei Regler mit
verschiedenem Rastverhalten sind ein Fehler, den man erst merkt, wenn jemand beides
hintereinander bedient.

#### Was beim Bauen herauskam *(2026-09-05)*

**1. Die zwei bekannten Gesten-Fallen waren beide da, und beide vorher bedacht.**
`onPanResponderTerminationRequest: () => false` (sonst nimmt der ScrollView die Geste,
Phase 11), und `NOTBREITE` gegen die gemessene Breite null (sonst kleben beim Web-Export
beide Griffe links, wie die schiefen Karteikarten am 2026-09-03). Ein Unterschied zum
Wischstapel ist wichtig: Hier repariert sich das nach der Messung von selbst, weil es
gewöhnliche Styles sind und keine `AnimatedInterpolation`, die auf einen Eingang wartet.

**Dazu eine dritte, die im Plan nicht stand:** Der Regler darf NICHT in `SsScrollReihe`
liegen. Der Filterbereich packt jede Gruppe in einen waagrechten ScrollView — zwei
Gesten-Erkenner übereinander, die beide waagrecht ziehen wollen. `FilterGruppe` hat
deshalb seit 18b eine Prop `reihe`.

**2. `HOECHSTALTER` war zuerst 70 — großzügig gedacht, in der Bedienung das Gegenteil.**
Am Regler nachgemessen: 56 Jahrgänge auf 280 px, und ALLE wirklichen Nutzer drängen sich
im rechten Fünftel. Ein Regler, dessen brauchbarer Teil 50 px breit ist, ist keiner. Jetzt
50 — weit genug, dass die App nicht behauptet, sie sei nur für Jugendliche, und eng genug,
dass ein Jahrgang gut 7 px bekommt. **Das war im Code nicht zu sehen und auf dem
Screenshot sofort.**

**3. Der Fehler, den nur ECHTES Ziehen gefunden hat: ein zusammengeschobenes Griffpaar
klemmte.** Beide Griffe auf demselben Wert, nach rechts ziehen — nichts passierte. Die
Ursache ist ein Denkfehler in der Frage: Ich habe beim ANFASSEN entschieden, welchen Griff
jemand meint, und zwar über die Tipp-Stelle. Bei zwei Griffen auf demselben Wert gibt es
diese Auskunft nicht: Ein Druck acht Pixel links der Mitte wählte „von", und „von" kommt
von dort nur nach links.

Die fehlende Auskunft ist die **RICHTUNG**, und die entsteht erst bei der ersten Bewegung.
Die Entscheidung wird deshalb vertagt (`aktiv = null`) statt geraten; `schieben` fällt sie
beim ersten Move, `loslassen` holt sie nach, falls es nie eine Bewegung gab (dann zählt
doch die Tipp-Stelle — sie sagt, in welche Richtung das Paar aufgehen soll).

**Die Lehre ist allgemeiner als der Regler:** Wenn zwei Dinge ununterscheidbar sind, ist
die Antwort nicht „nimm eines", sondern „warte auf die Auskunft, die sie unterscheidet".

**4. Geprüft wurde mit echten Zeigergesten, nicht mit `click`.** Ein Regler, auf den man
nur klickt, ist nicht geprüft: `click` löst weder `onPanResponderMove` noch das
Kreuzungsverbot aus. Vier Fälle durchgespielt — kreuzen, aus der Klemme lösen, Tipp weit
weg, Tipp auf das Paar — und der dritte Fehler kam erst im zweiten davon heraus.

**Was den Regler ehrlich macht, ist der Kartenzähler:** Beim Aufziehen von 2007–2012 auf
1984–2011 geht „Noch 7 Karten" auf „Noch 8". Ohne diese Zahl daneben sähe man einen Regler,
der sich bewegt, und wüsste nie, ob er etwas tut.

#### 18c — Die Chats übersichtlicher machen ✅ *(gebaut am 2026-09-05)*

Ian am 2026-09-03: *„ich finde es ist noch nicht ganz übersichtlich, inspiriere dich von
WhatsApp oder so für die Chats."*

**Nachgemessen auf 360 × 600, damit „übersichtlich" eine Zahl bekommt:**

| | vorher | nachher | WhatsApp |
|---|---|---|---|
| Höhe einer Zeile | **100–118 px** — ungleich, weil die Nachricht umbrach | **70 px, immer gleich** | ~72 px |
| Abstand dazwischen | 12 px Lücke + Rahmen (jeder Chat eine KARTE) | 1 px Trennlinie | 1 px Trennlinie |
| Textzeilen je Chat | **3** (Name + Zeit · Aktivität · Nachricht) | **2** | 2 |
| **Chats auf einem Schirm** | **4** | **7** | 7 |

**Was gebaut wurde, in dieser Reihenfolge:**
1. **Karten zu Zeilen.** Jeder Chat war eine `SsCard` mit Rahmen und 12 px Luft. Das ist
   im Feed richtig (dort ist eine Karte ein ANGEBOT, das man annehmen kann) und in einer
   Chat-Liste falsch — dort ist eine Zeile ein WEG. Die Zeilen gehen jetzt über die volle
   Breite; die Trennlinie beginnt hinter dem Avatar, damit die Avatare eine
   ununterbrochene Spalte bilden.
2. **`numberOfLines={1}` auf die Nachricht.** 70 statt 100–118 px, und vor allem: **immer
   gleich**. Ungleiche Höhen waren der Hauptgrund, warum die Liste „unruhig" aussah.
3. **Die dritte Zeile — Ians Entscheidung 29 (Abschnitt 6).** Die Aktivität steht jetzt
   klein hinter dem Namen („Lea · Tennis spielen"), die Verabredungs-Zeit fällt aus der
   Liste. Verworfen: die Zeit behalten und den Titel streichen; alle drei Zeilen behalten.

**Was NICHT geändert wurde, und warum:**
- **Die Gruppen „Aktuell" und „Vorbei" bleiben** (harte Regel 30). WhatsApp hat keine
  Abschnitte, aber die beiden hier sind Ians Regel aus `chat/lifecycle.ts` — ein Chat,
  der abläuft, muss sich von einem unterscheiden, der läuft. Eine flache Liste würde
  seine Sortierregel zerschneiden.
- **Der Farbstreifen links bleibt** (harte Regel 29). Er trägt eine Auskunft, die
  WhatsApp nicht braucht: dass ein Direktchat KEINE Kategorie hat und deshalb keinen
  Streifen bekommt.

#### Was beim Bauen herauskam *(2026-09-05)*

**Der Streifen-PLATZ steht jetzt auch dann, wenn er leer bleibt — und das ist kein
Verstoß gegen harte Regel 29, sondern ihre Anwendung.** Verboten ist ein grauer
ERSATZ-Streifen, und der kommt nicht: Ein Direktchat bekommt keine Farbe. Er bekommt nur
dieselben 6 px Platz. In einer KARTE durfte der Inhalt 6 px weiter links anfangen, das
war die Auskunft; in einer ZEILENLISTE sind ausgefranste Avatar-Spalten genau das
„unruhig", gegen das diese Phase gebaut ist. Die Auskunft steckt weiter im Platz: keine
Farbe = keine Aktivität.

**Zwei Fehler, beide erst am Schirm sichtbar:**

1. **„Lea· Tennis spielen" — der Abstand vor dem Trennpunkt fehlte.** Im Code stand
   `` {` · ${post.title}`} `` mit führendem Leerzeichen. `react-native-web` rendert Text
   als HTML, und **HTML frisst führende Leerzeichen**. Auf Native wäre es dagegen stehen
   geblieben — ein Leerzeichen im Text hätte also je nach Plattform ein anderes Ergebnis.
   Der Abstand steht jetzt als `marginLeft` im Style und ist damit überall derselbe.
2. **„Tobi… · Kaffee nach der Sc…" — beide Texte kürzten sich, statt nur die Aktivität.**
   Der erste Versuch war, das über `flexShrink` zu gewichten (1 gegen 4, dann 1 gegen 24).
   Am Gerät nachgemessen war der Name trotzdem „Tobi…". Der Grund stand in den berechneten
   Stilen: **Beide Texte haben `flexBasis: auto`**, also ihre natürliche Breite — damit
   gibt es einen Fehlbetrag, den sich beide teilen, und jede Gewichtung dagegen ist ein
   Wert, der beim nächsten längeren Titel wieder falsch ist.

   Richtig ist `flex: 1` an der **Aktivität** (also `flexBasis: 0`): Dann gibt es gar
   keinen Fehlbetrag. Der Name behält seine natürliche Breite, die Aktivität bekommt
   exakt den Rest und kürzt sich darin selbst. Erst wenn der Name ALLEIN breiter ist als
   die Zeile, greift Shrink — und dann muss er es auch, sonst drückt ein langer Name die
   Uhrzeit aus dem Bild. **Die Lehre: Wer an `flexShrink` dreht, verteilt einen
   Fehlbetrag; wer `flexBasis: 0` setzt, lässt keinen entstehen.**

**Ein Prüfschritt war nötig, den die Fake-Daten nicht hergeben:** Es gibt keinen
abgelaufenen Chat in `mock.ts`, also wird die Gruppe „Vorbei" nie gezeichnet — und genau
deren Ränder hatte ich geändert (die Liste hat ihren Seitenrand verloren, die Überschrift
musste ihn bekommen). Geprüft mit einem kurzzeitigen Eingriff in die Gruppierung,
Screenshot, zurückgesetzt. **Ein Zustand, den die Fake-Daten nicht erzeugen, ist ein
Zustand, den niemand ansieht.**

#### 18d — Nicht zwei Sachen gleichzeitig ✅ *(gebaut am 2026-09-05)*

> ✅ **Fertig — seit dem 2026-09-06 auch die letzte Zeile** (`zaehltAlsTermin`, siehe
> unten). Die zwei ersten Punkte des Vorrats sind gebaut, der dritte bleibt liegen.

**Leopolds Wunsch beim Benutzen am 2026-09-03: *„nicht 2 Sachen gleichzeitig."*** Bis
dahin prüfte das nichts. Man konnte um 17:00 beim Tennis zusagen und um 17:15 beim
Kaffee — und musste einem von beiden absagen. Genau die Enttäuschung, an der sich so
eine App herumspricht.

**Ians drei Entscheidungen dazu (Abschnitt 6, Punkte 31–33):**

| Frage | Antwort | Wo sie steht |
|---|---|---|
| Sperren oder warnen? | **warnen, aber durchlassen** | `DOPPEL_REGEL` |
| Was heißt „gleichzeitig", wenn ein Post keine Dauer hat? | **eine Stunde** | `KOLLISION_FENSTER_MIN` |
| Gilt es auch beim Selbst-Posten? | **ja, gleich behandeln** | `PRUEFT_BEIM_POSTEN` |

**Was gebaut wurde:**

| Datei | Was |
|---|---|
| `features/requests/kollision.ts` | **Die Regel**, wie `block.ts`, `wisch.ts`, `direkt.ts` und `gruppe.ts`. Drei Konstanten, `kollidiert()`, `doppelHinweisText()`. Screens lesen die Konstanten nie. |
| `features/requests/hooks.ts` | `useKollisionen(startsAt, ausserPostId?)` — sammelt nur, was in Frage kommt, und lässt die Regel entscheiden. |
| `components/DoppelHinweis.tsx` | Der Kasten über dem Knopf. Ein Baustein, weil er an DREI Stellen steht. |
| `app/post/[id].tsx` · `AntwortLeiste.tsx` · `app/create.tsx` | Die drei Stellen. |
| `data/mock.ts` | **`p18` „Eis essen gehen"** — der Post, an dem man die Warnung überhaupt sieht. |

**Und der zweite Vorrats-Punkt gleich mit: „Deine Gruppen" liegt jetzt oben.**
Nachgemessen auf 360 × 600: **y = 305 von 1388** statt vorher **1168 von 1380** — ohne
Scrollen im Bild. Umgesetzt über einen dritten Slot `nachKopf` in `components/Profil.tsx`
und nicht im Screen: Harte Regel 7 will Profil-Inhalt in dieser einen Datei, damit das
eigene Profil nie etwas anderes zeigt als das, was Fremde sehen. Auf einem fremden Profil
bleibt der Slot leer, und das ist richtig — welche Gruppen jemand hat, gehört zu dem, was
eine geschlossene Gruppe zurückhält (`PRIVAT_SICHT`, Phase 18a).

**Offen bleibt: Kalender-Funktion** (Leopold, ausdrücklich „für später").

#### Was beim Bauen herauskam *(2026-09-05)*

**1. Die Regel musste eine Lücke im DATENMODELL überbrücken, und das ist der Grund
gegen das Sperren.** Ein `Post` hat `startsAt` und **keine Dauer**. „Überschneidung" ist
damit kein Fakt, den die Daten hergeben, sondern eine Festlegung — 60 Minuten. Eine
Sperre behauptet Gewissheit; die App hat hier nur eine Schätzung. Das Argument gegen B
ist also nicht Bequemlichkeit, sondern Ehrlichkeit. Der Weg heraus stünde fest, falls
sich 60 Minuten als zu grob erweisen: ein Feld `dauerMinuten` am Post — verworfen, weil
Phase 12 den Erstellen-Screen gerade auf zwei Felder leergeräumt hat (harte Regel 18).

**2. Möglichkeit C wäre ein eingebauter Datenschutzfehler gewesen.** „Nur der Poster
sieht es" klingt harmlos und hätte der App beigebracht, fremden Leuten zu verraten, wo
jemand sonst noch hingeht — auch aus privaten Gruppen und aus Posts nur für Follower.
Das ist **derselbe Fehler wie der Gründername an einer privaten Gruppe** (Phase 18a),
nur schlimmer: Dort war er vergessen, hier wäre er die Funktion gewesen.

**3. Ohne `p18` in `mock.ts` hätte diese Phase gar nichts getan — und niemand hätte es
gemerkt.** In den Fake-Daten gab es vorher **keine einzige** Überschneidung: Ians zwei
bestätigte Zusagen (`p1`, `p2`) liegen genau eine Stunde auseinander, alle anderen Posts
an anderen Tagen. Die Prüfung wäre im Code richtig und auf dem Schirm unsichtbar
gewesen. Das ist die Lehre aus Phase 18c beim zweiten Mal — **ein Zustand, den die
Fake-Daten nicht erzeugen, ist ein Zustand, den niemand ansieht.**

Die Zeit von `p18` steht als **`bald(2.5, '17:30')`** neben `p1`s `bald(2, '17:00')` und
nicht als feste Uhrzeit. Beide runden auf dieselbe halbe Stunde, also liegen sie zu JEDER
Tageszeit genau 30 Minuten auseinander — auch nach 22 Uhr, wenn beide auf morgen
rutschen. Mit einer festen Uhrzeit wäre die Kollision abends still verschwunden, und wer
den Prototyp am Abend aufmacht, hätte die Warnung nie gesehen.

**4. Die Warnung ist nicht rot, und das ist eine Entscheidung.** `status.danger` ist in
`theme/colors.ts` für **Absagen, Blockieren, Melden** vergeben. Eine Überschneidung ist
nichts davon — Ians Regel lässt sie ausdrücklich zu. Rot hier würde die stärkste Farbe
der App für etwas verbrauchen, das man bewusst überschreiben darf, und wäre beim
nächsten echten Fehler abgenutzt. Es ist deshalb `accent.soft` mit einem Streifen links
— dieselbe Sprache wie die Chat-Zeile aus Phase 18c. Das Icon ist `uhr` und nicht
`warnung`: Der Satz sagt eine Uhrzeit, keine Gefahr.

**5. Der Hinweis steht AUSSERHALB der Vorschau im Erstellen-Screen.** Über der Vorschau
steht „So sehen es die anderen" — und dass du dich doppelt verabredest, sehen die
anderen gerade nicht. Er gehört zu dir, nicht zur Karte. Ein Kasten innerhalb der
Vorschau hätte die Absicherung aus harter Regel 18 stillschweigend zu einer Lüge gemacht.

**6. Geprüft wurde in Handybreite, und die Antwortleiste war der Grund dafür.** Die drei
Stellen sind verschieden eng: Das Post-Detail scrollt, der Erstellen-Screen auch — die
Antwortleiste im Wischstapel ist ein Blatt mit fester Unterkante, das nach OBEN wächst.
Auf 360 × 600 passt sie mit dem zusätzlichen Kasten weiter ganz ins Bild; nachgesehen
mit `elementFromPoint`, `scrollWidth > clientWidth` und der Überquell-Prüfung, alle drei
Screens sauber.

#### 18d — die letzte Zeile ✅ *(entschieden am 2026-09-06)*

**`zaehltAlsTermin()` in `features/requests/kollision.ts` stand als `TODO` da.** Die
Frage ist beim Bauen aufgetaucht und stand in keinem Plan: *Was zählt überhaupt als
„schon verabredet"?* Drei Antworten, alle drei vertretbar, alle drei im Kopfkommentar
der Funktion — es war eine Zeile:

| | Zeile | Haken |
|---|---|---|
| a | `return true;` | Wer sich am Sonntag drei Sachen ausdenkt und postet, wird ab dem zweiten gewarnt, obwohl noch nichts feststeht. |
| b | `return t.rolle === 'zugesagt';` | Der eigene Post ist auch eine Verabredung, sobald jemand kommt — dort wäre die Warnung still. |
| **c** ✅ | `return t.rolle === 'zugesagt' \|\| t.jemandDabei;` | Eine Bedingung mehr, die man erklären muss. **Ians Entscheidung 34.** |

Sichtbar wird der Unterschied sofort an `p17`: Ians eigener Post „Physik-Zusammenfassung
durchgehen" liegt zur selben Zeit wie Leas „Donauinsel spazieren" und hat
`spotsFilled: 0`. Unter **a** warnt `/post/p7`, unter **b** und **c** nicht.

> **Warum das trotzdem eine Änderung war, obwohl keine Zeile Code sich bewegt hat.**
> `c` stand als Platzhalter drin, damit der Prototyp läuft — mit einem `TODO Ian`
> darüber und dem ausdrücklichen Satz „das ist keine Entscheidung". Ein Platzhalter,
> der zufällig richtig ist, und eine Entscheidung sind zwei verschiedene Zustände: Der
> Unterschied liegt vollständig in dem, was die nächste Sitzung liest. Deshalb ist der
> Kopfkommentar jetzt so gebaut wie in `block.ts`, `direkt.ts` und `gruppe.ts` —
> verworfene Möglichkeiten samt Grund, Ians Haken, und „nicht ohne Rückfrage ändern".
> **Und deshalb war kein Deploy nötig:** Das Bündel verhält sich identisch. Ein Deploy
> hätte nur einen neuen Metro-Hash erzeugt und so ausgesehen, als hätte sich etwas
> geändert (siehe Fallen-Liste).

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

## 5b. Der Weg zur echten App — Phasen 19 bis 21

> **Geplant am 2026-09-06.** Bis hierher war jede Phase eine Verbesserung an etwas, das
> schon lief. Ab hier sind es drei Dinge, die es noch NICHT gibt: die App auf einem
> Gerät, echte Daten und ein Eintrag im Store. Alle drei sind groß, und der häufigste
> Fehler ist, sie gleichzeitig anzufangen.

**Drei Entscheidungen von Ian, alle am 2026-09-06, alle vor dem ersten Handgriff:**

| Frage | Entscheidung | Folge |
|---|---|---|
| Welche Datenbank? | **Supabase** | Die Sichtbarkeits-Regel steht als EINE Regel auf dem Server. Abschnitt 20.2. |
| Womit anfangen? | **Erst aufs Gerät** | Phase 19 vor Phase 20 — damit beim ersten Fehler nur EINE Sache neu ist. |
| Wie anmelden? | **E-Mail-Code UND Google UND Apple** | Ians siebenundzwanzigste Entscheidung, Abschnitt 6, Punkt 35. Macht „Anmelden mit Apple" zur Pflicht. |

**Warum die Reihenfolge die wichtigste der drei ist.** Es gibt ab jetzt zwei offene
Fragen: *Läuft die App auf einem iPhone?* und *Läuft sie mit echten Daten?* Beantwortet
man sie zusammen, hat jeder Fehler zwei mögliche Ursachen, und man kann keine davon
ausschließen. Das ist die Lage, aus der bei ACTA die teuren Tage geworden sind. Getrennt
kostet es einen Nachmittag mehr und einen Build von fünfzehn.

---

### Phase 19 — Aufs Gerät: der erste echte Build ⬜

**Ziel:** SimplySocial läuft auf Ians iPhone, mit den Fake-Daten von heute. Kein
Backend, kein Login — nur die Frage, was ein echtes Gerät anders macht als ein Browser.

#### Was heute schon sicher kaputt ist

**Die 41 Symbole sind auf iOS leere Kreise.** Das ist keine Überraschung und kein
Versehen, sondern harte Regel 24: `SsIcon` zeichnet `<svg>`, und das gibt es auf Native
nicht. Der Platzhalter ist absichtlich sichtbar. **Der Weg heraus ist EINE Datei** —
`components/ui/SsIcon.tsx` —, weil Pfaddaten (`theme/icons.ts`) und Zeichner genau dafür
getrennt liegen. Kein Screen wird angefasst.

#### Was heute überraschend gut steht — nachgeprüft, nicht gehofft

`grep -rn "document\.\|window\.\|navigator\." src/` liefert außerhalb von `+html.tsx`
**elf** Treffer, und **jeder einzelne** steht hinter einem `Platform.OS !== 'web'`:
`_layout.tsx` (Startfläche und Tab-Titel), `PrototypHinweis` und `WischStapel`
(`sessionStorage`). Die App startet also nicht in einen weißen Bildschirm. Das ist der
Ertrag von harter Regel 1, drei Wochen später eingelöst.

#### Was niemand vorher wissen kann — und genau deshalb der Build

- **Der Wischstapel unter einem echten Finger.** Der `PanResponder` ist gegen
  Maus-Ereignisse gebaut worden. Ein iOS-Finger liefert andere Zeitabstände, und
  `onPanResponderTerminationRequest` (Phase 11) hat auf Native einen zweiten Gegner:
  die Zurück-Wischgeste vom Bildschirmrand.
- **`NOTBREITE` darf nicht greifen.** Der Rückfall gegen die gemessene Breite null
  (2026-09-03) ist für den Web-Export da. Springt er auf dem Gerät an, liegen die Karten
  wieder schief — und diesmal ohne `dist/index.html` zum Vergleichen.
- **Reanimated 4 mit der neuen Architektur.** `react-native-worklets` ist ein
  Native-Baustein. Im Browser läuft er als JavaScript, auf dem Gerät als echter Code.
- **Die SafeArea unten.** Der ganze Höhen-Nachtrag vom 2026-09-06 ist Web-Logik
  (`visualViewport`). Auf Native macht das `react-native-safe-area-context`, also ein
  völlig anderer Mechanismus für dasselbe Problem. Beides muss stimmen, keins hilft dem
  anderen.
- **Die Tastatur im Chat.** Harte Regel 9 (Eingabe fest unten) ist im Browser geprüft.
  Auf iOS schiebt die Tastatur die Ansicht, und `KeyboardAvoidingView` verhält sich auf
  iOS anders als auf Android.

> ### Stand 19.1 bis 19.3 — fertig am 2026-09-06
>
> **Ians vierundzwanzigste Entscheidung dieser Art, und die einzige unumkehrbare des
> ganzen Projekts: der Bundle Identifier ist `at.simplysocial.app`.** Verworfen sind
> `com.simplysocial.app` (die internationale Schreibweise — aber `simplysocial.com`
> gehört ihnen nicht, `simplysocial.at` steht auf der Domain-Liste) und
> `at.simplysocial.simplysocial` (das, was Expo von selbst erfunden hätte). **Nach der
> ersten Einreichung ist der Wert bei Apple für immer festgelegt.**
>
> **Das EAS-Projekt existiert:** `@ian43566/simplysocial`, ID
> `a37d2454-0fd5-4db3-a06a-8da62057c380`, angelegt mit `eas init --force`. Ian war bei
> Expo bereits eingeloggt; die Wahl zwischen persönlichem Konto und `ian43566s-team`
> fiel auf das persönliche — anders als die Bundle-ID ist ein Projekt jederzeit in eine
> Organisation übertragbar. `owner: "ian43566"` steht deshalb in `app.json`, sonst
> fragt jeder Befehl neu.
>
> **`channel` ist aus `eas.json` wieder herausgeflogen, und das ist kein Detail.** Ein
> Kanal gehört zu `expo-updates` — dem Baustein, mit dem eine gebaute App später neuen
> JavaScript-Code über die Luft nachlädt. Der ist hier nicht installiert. Ein Kanal, auf
> den nie jemand sendet, ist Konfiguration für etwas, das nicht existiert: EAS warnt
> beim Build, und in vier Wochen liest jemand die Zeile und glaubt, Over-the-Air-Updates
> seien eingerichtet. `appVersionSource: "remote"` bleibt dagegen — es nimmt die
> Handarbeit weg, die man garantiert vergisst: Apple lehnt jeden TestFlight-Upload ab,
> dessen `buildNumber` schon einmal da war.
>
> **Vier Messungen statt vier Vermutungen — alle vor dem ersten Build:**
>
> 1. **Der Preis des Imports ist bekannt: +49.524 Bytes, +3,5 %.** Das Web-Bündel wächst
>    von 1.398.342 auf 1.447.866 (roh; gzip gesamt 390.064). Ein statisches `import`
>    zieht den ganzen Modulbaum ins Bündel, auch wenn der Web-Zweig
>    `react-native-svg` nie aufruft. **Vermeidbar wäre es**, über Metros
>    Plattform-Endungen (`SsIcon.native.tsx` / `SsIcon.web.tsx`) — dann bliebe die
>    Bibliothek ganz aus dem Web-Bündel. **Bewusst nicht gemacht:** Das zerlegt EINEN
>    Zeichner in drei Dateien, und der ganze Zweck der Trennung von `theme/icons.ts`
>    (Daten) und `SsIcon.tsx` (Zeichnen) war, dass ein Icon-Wechsel EINE Datei ist.
> 2. **Das iOS-Bündel baut durch** — `expo export --platform ios` liefert 2,9 MB
>    Hermes-Bytecode. Das ist mehr als ein Typecheck: Metro muss dabei jedes Modul für
>    die Plattform iOS auflösen. Ein Import, den es auf Native nicht gibt, fällt hier
>    auf — in einer Minute am Mac statt nach fünfzehn in der Cloud.
> 3. **Die elf Web-Zugriffe stehen wirklich alle hinter `Platform.OS !== 'web'`** —
>    nachgezählt, nicht geglaubt: `_layout.tsx` (Startfläche, Tab-Titel),
>    `PrototypHinweis` und `WischStapel` (je zwei `sessionStorage`).
> 4. **Die laufende Web-Fassung ist unbeschädigt:** gebautes `dist/` lokal serviert,
>    390 × 844, Feed rendert vollständig, **null Konsolenfehler**. Der Web-Zweig ist
>    unverändert — geprüft wurde, ob der neue Import einen Seiteneffekt hat.
>
> **`expo-doctor`: 20 von 21 Prüfungen sauber.** Der eine Befund sind fünf
> Patch-Versionen (`expo` 57.0.18 statt .20, dazu `expo-constants`, `-font`, `-linking`,
> `-router`). **Bewusst nicht aktualisiert vor dem ersten Build.** Der ganze Zweck von
> „erst aufs Gerät" ist, dass beim ersten Fehler nur EINE Sache neu ist — und
> `react-native-svg` ist diese eine Sache. Patch-Stände blockieren keinen EAS-Build; sie
> werden nachgezogen, wenn der Build einmal durch ist. **Wer sie vorher anfasst, fasst
> zugleich die Web-Fassung an, die live ist.**

#### 19.1 — `app.json` ergänzen ✅ *(2026-09-06)*

Heute fehlt **`ios.bundleIdentifier` komplett**. `eas build:configure` würde einen
erfinden. Selbst setzen, und zwar bewusst:

```json
"ios": {
  "bundleIdentifier": "at.simplysocial.app",
  "supportsTablet": false,
  "icon": "./assets/expo.icon"
}
```

> ⚠️ **Der Bundle Identifier ist nach der ersten Einreichung nicht mehr änderbar.** Er
> ist die Identität der App bei Apple, für immer. Umgekehrte Domain-Schreibweise ist die
> Konvention; `at.` passt, weil die App aus Wien kommt und die Domain `simplysocial.at`
> ohnehin auf Ians Liste steht (`OFFENE_SACHEN.md`, Punkt 5b).
>
> `supportsTablet: false` ist ebenfalls eine Entscheidung: Die App ist `orientation:
> portrait` und für eine Hand gebaut. Ein iPad-Ja bedeutet zusätzlich einen eigenen
> Screenshot-Satz für den Store und einen Review, der auf einem iPad stattfindet.

`experiments.baseUrl: "/simplysocial"` bleibt unangetastet — das ist **web-only** und
betrifft nur GitHub Pages. Wer es für den Build entfernt, macht die Landing-Adresse
kaputt.

#### 19.2 — `eas.json` anlegen ✅ *(2026-09-06)*

Gibt es heute nicht. Drei Profile, und der Unterschied ist nicht kosmetisch:

| Profil | Wofür | Besonderheit |
|---|---|---|
| `development` | Ians Gerät, zum Entwickeln | `developmentClient: true` — die App lädt den Code vom Mac, man muss also **nicht für jede Änderung neu bauen** |
| `preview` | Die drei Mitgründer | Fertiges Bündel, kein Mac nötig. Läuft ohne Store. |
| `production` | TestFlight und Store | Was eingereicht wird |

**Der Unterschied, den man beim ersten Mal falsch versteht:** Ein `development`-Build
ist eine *Hülle*. Man baut ihn EINMAL und lädt danach den JavaScript-Code hinein. Neu
gebaut werden muss er nur, wenn ein **Native-Baustein** dazukommt — genau die ACTA-Falle
aus CLAUDE.md. Deshalb steht 19.3 vor 19.4.

#### 19.3 — `react-native-svg` einbauen ✅ *(2026-09-06)*

```bash
npx expo install react-native-svg
```

Dann in `SsIcon.tsx` den Native-Zweig ersetzen: `<Svg>`/`<Path>` statt `<svg>`/`<path>`,
dieselben Pfadstrings, dieselben Props. **Der Web-Zweig bleibt, wie er ist** — dort
braucht es die Bibliothek nicht, und `react-dom` zeichnet ein echtes `<svg>`.

> **Warum das VOR dem ersten Build passiert und nicht danach.** Ein Native-Import, der
> nach dem Build dazukommt, lässt den bestehenden Dev-Build sofort abstürzen (ACTA).
> Ein Build mit den Kreisen wäre also einer, den man wegwirft, sobald man die Symbole
> will — und man will sie sofort, weil ein Durchgang mit 41 leeren Kreisen keine
> brauchbare Beurteilung des Aussehens ergibt.
>
> **Warum trotzdem NUR dieser eine Baustein und nicht gleich alle.** Die
> Anmelde-Bausteine aus Phase 20 (`expo-apple-authentication`, `expo-auth-session`,
> `expo-secure-store`) könnte man mit hineinnehmen und einen Build sparen. Das wäre
> falsch: Der ganze Zweck von „erst aufs Gerät" ist, dass beim ersten Fehler nur EINE
> Sache neu ist. Vier neue Native-Bausteine auf einmal heben genau das wieder auf.

> ### Der Weg, den der Plan nicht vorgesehen hatte: erst der Simulator
>
> **Phase 19 lässt sich noch einmal halbieren, und das war am 2026-09-06 der Fortschritt
> des Tages.** Der Plan sah einen Cloud-Build vor, der Ians Apple-Zugangsdaten braucht —
> also einen Halt. Ein **Simulator-Build braucht keine Signatur**: keine Zertifikate,
> kein registriertes Gerät, keinen Apple-Login. Apple verlangt das alles nur für echte
> Hardware.
>
> Damit zerfällt „läuft die App auf iOS?" in zwei Fragen, die getrennt beantwortbar sind
> — dieselbe Logik, aus der Phase 19 überhaupt vor Phase 20 steht:
>
> | Frage | Wer beantwortet sie | Braucht |
> |---|---|---|
> | Startet die App nativ? Zeichnen die 41 Icons? Stimmt die SafeArea? | **Simulator** ✅ | nichts |
> | Wie fühlt sich der Wischstapel unter einem Finger an? | **Ians iPhone** ⬜ | Apple-Login |
>
> `npx expo run:ios` erzeugt dabei den `ios/`-Ordner, den EAS sonst in der Cloud anlegt.
> Er steht schon in `.gitignore`, und das ist richtig: Bei Expos „Continuous Native
> Generation" ist `app.json` die Quelle und `ios/` das Erzeugnis. **Wer den Ordner
> eincheckt, hat ab da zwei Wahrheiten.**
>
> **Der erste Lauf scheiterte an zwei Compilerfehlern — der zweite lief durch, ohne dass
> irgendetwas geändert wurde.** Beim ersten Mal kompilierte Xcode noch die Pods, während
> der Icon Composer lief; beim zweiten standen die Zwischenergebnisse. **Wichtiger als
> der Fehler ist, dass er beinahe unsichtbar geblieben wäre:** Der Aufruf war
> `npx expo run:ios 2>&1 | tail -60` — und `tail` hat genau die `error:`-Zeilen
> weggeworfen, wegen derer er lief. Übrig blieb „2 error(s)" ohne einen einzigen Grund.
> **Bei einem Build-Lauf nie durch `tail` filtern; ganz ins Protokoll schreiben und
> hinterher `grep`en.**
>
> **Was der Screen-Durchgang am Simulator (iPhone 17 Pro, iOS 26.5) gezeigt hat:**
>
> 1. **Die Icons zeichnen.** Stift am „Posten", Lupe im Suchfeld, Regler am Filter, die
>    sechs Kategoriesymbole, X und Hand auf den Stapelknöpfen, die vier Tab-Icons, Blatt
>    und roter Mülleimer in den Einstellungen. `react-native-svg` liest dieselben Pfade
>    aus `theme/icons.ts` wie der Browser — **kein Screen wurde angefasst**, wie seit
>    Phase 14 angekündigt. Belege: `p19-ios-*.png`.
> 2. **Die SafeArea stimmt oben und unten** — der Schriftzug sitzt unter der Notch, die
>    Tab-Leiste über dem Home-Indikator. Der ganze `visualViewport`-Nachtrag vom selben
>    Tag ist reine Web-Logik; auf Native macht das `react-native-safe-area-context`, und
>    es tut es.
> 3. **Deep Links funktionieren nativ.** `xcrun simctl openurl booted
>    "simplysocial://einstellungen"` springt in den Screen. Das ist mehr als eine
>    Spielerei: **Damit ist der Screen-Durchgang ohne Finger machbar** — genau die
>    Prüfwerkzeuge, von denen der Plan sagte, es gebe sie auf dem Gerät nicht.
> 4. **Der Doppel-Hinweis aus 18d läuft nativ**, in Grau und nicht in Rot, mit Uhr-Icon.
>    Der letzte Eingriff vor dieser Phase überlebt den Plattformwechsel unverändert.
>
> **Was der Simulator NICHT beantworten kann und deshalb offen bleibt:** der Wischstapel
> unter einem echten Finger samt der Zurück-Wischgeste vom Bildschirmrand, die Tastatur
> im Chat (harte Regel 9), der Jahrgangs-Balken mit zwei Griffen und einem Finger
> (Regel 45), und ob `NOTBREITE` anspringt. **Ein Mausklick am Simulator ist keine
> Gestenprüfung** — dieselbe Lehre wie aus Phase 18b, wo genau dieser Irrtum den Fehler
> im Griffpaar verdeckt hat.
>
> **19.6 ist bestätigt, nicht nur vermutet.** Nach einem echten Kaltstart (Prozess
> nachweislich beendet, dann `simctl launch`) sind Anleitungskarte UND Prototyp-Hinweis
> wieder da. `weggeklickt` in `PrototypHinweis.tsx` ist ein Modul-`let`, und
> `sessionStorage` gibt es auf Native nicht. **Bleibt liegen bis Phase 20**, wo
> `expo-secure-store` ohnehin dazukommt — ein zweiter Native-Baustein jetzt hätte den
> Zweck der ganzen Phase aufgehoben.
>
> **Eine Falle dabei fast übersehen:** Ein erster `terminate` + `launch` zeigte die
> Hinweise NICHT — was die Vorhersage widerlegt hätte. Der Prozess war aber gar nicht
> tot; `launch` hatte die App nur nach vorn geholt. Erst mit `pgrep`-Prüfung dazwischen
> war es ein echter Kaltstart. **Dieselbe Falle wie das `browser_navigate` in Phase 18d:
> Was wie ein Neustart aussieht, ist oft keiner.**

#### 19.4 — Der Build ✅ *(2026-09-06, Simulator)* / ⬜ *(Gerät)*

```bash
npx eas-cli login
npx eas-cli build --profile development --platform ios
```

**Voraussetzungen, die alle schon erfüllt sind:** Apple Developer Program (gekauft am
**2026-09-11** — bis dahin stand hier fälschlich der 2026-08-31, siehe Abschnitt 1), `eas-cli` 20.5.0 läuft über `npx`, und **Xcode 26.5 ist installiert**.
Letzteres ist mehr wert, als es klingt: Mit `--local` baut der Mac selbst, und dann sind
die **15 Gratis-Builds pro Monat keine Grenze**. Der erste Build geht trotzdem in die
Cloud — dort legt EAS die Apple-Zertifikate von selbst an, und das ist der Teil, den man
sich nicht antun muss.

Ians Gerät muss einmalig registriert werden (`eas device:create`) — bei einem
`development`-Profil führt EAS da durch.

#### 19.5 — Der Durchgang ✅ *(Screens, 2026-09-06)* / ⬜ *(Gesten)*

Dieselbe Sorgfalt wie bei den Web-Durchgängen, aber **die Prüfwerkzeuge von dort gibt es
hier nicht**: kein `document.elementFromPoint`, kein `scrollWidth > clientWidth`, kein
`innerText`. Auf dem Gerät zählt das Auge und der Finger. Deshalb: **von jedem Screen
ein Screenshot**, so wie es die Lehre vom 2026-09-03 verlangt.

Reihenfolge nach Risiko, nicht nach Bildschirm-Reihenfolge:

1. **Der Wischstapel** — ziehen, kreuzen, zurücklegen, die Randgeste provozieren.
2. **Der Chat mit offener Tastatur** — harte Regel 9.
3. **Der Erstellen-Screen mit offenem „Mehr einstellen"** — der Sprung zum roten Feld
   (Regel 37) wartet auf zwei `requestAnimationFrame`; das war auf Web knapp.
4. **Der Jahrgangs-Balken** — zwei Griffe, ein Finger (Regel 45).
5. **Die Tab-Leiste über der Home-Anzeige** und die SafeArea unten.
6. **Die 41 Symbole** — sind sie nach dem Tausch dieselben wie im Browser?

#### 19.6 — Was der Durchgang mit Sicherheit findet ✅ *(bestätigt, 2026-09-06)*

**Zwei Hinweise kommen auf iOS bei jedem Kaltstart wieder.** `anleitungGesehen()` im
`WischStapel` und `merken()` im `PrototypHinweis` fallen auf Native beide auf einen
Merker im Arbeitsspeicher zurück (`gesehenImLauf`), weil es dort kein `sessionStorage`
gibt. Innerhalb einer Sitzung stimmt das; wer die App schließt und wieder aufmacht,
bekommt die Anleitungskarte erneut. Im Browser ist das nie aufgefallen, weil ein Tab
selten wirklich zugeht.

Das ist **kein Fehler im Code**, sondern eine Lücke, die erst auf dem Gerät eine wird —
und die Reparatur ist wieder ein Native-Baustein (`expo-secure-store` oder
`AsyncStorage`). Also: **notieren, nicht sofort beheben.** Sie kommt mit Phase 20, wo
der Baustein ohnehin dazukommt. Genau dafür ist der Durchgang da — Befunde sammeln, und
den Build erst dann noch einmal machen, wenn alle Native-Bausteine beisammen sind.

---

### Phase 19b — Die Wien-Karte ✅ *(Leopolds Idee, gebaut am 2026-09-06)*

> **Woher sie kommt.** Leopold hat sich eine Karte gewünscht, auf der man sieht, wo
> gerade etwas los ist — „klein anfangen, nur Wien" (Ians Zusatz). Es ist die zweite
> Idee von ihm, die aus dem BENUTZEN kommt und nicht aus dem Anschauen.

**Sie steht hier und nicht bei den Phasen 20/21, weil sie reine Oberfläche auf
vorhandenen Daten ist — das Backend macht sie um keinen Handgriff leichter.** Und sie
ist das erste Stück, das `react-native-svg` aus Phase 19 wirklich ausnutzt.

#### Warum das überhaupt billig ist

**An jedem Post steht seit Phase 2 `district: '1070'`** — die zweite und dritte Ziffer
der Postleitzahl IST die Bezirksnummer. Die Daten für die Karte liegen seit vier Wochen
da, sie werden nur nie als Fläche gezeigt. **Kein Feld kommt dazu, keins ändert sich.**

#### Ians achtundzwanzigste bis dreiunddreißigste Entscheidung (alle 2026-09-06)

| Frage | Entscheidung | Verworfen — und warum |
|---|---|---|
| Welche Karte? | **Gezeichnete Bezirksflächen. „Erst A, später vielleicht B"** | Echte Landkarte mit Stecknadeln: braucht `react-native-maps` (neuer Native-Baustein, auf Web gar nicht), **Koordinaten am Post** (Datenmodell) — und verrät statt „1220" die genaue Parkbank. Das ist die Sorte Auskunft, gegen die harte Regel 47 gebaut ist. **Ians Formulierung ist besser als meine Empfehlung:** B bleibt offen, bis echte Leute die App benutzen. |
| Wo lebt sie? | **Dritter Umschalter: `Stapel · Liste · Karte`** | Eigener Tab (leert den Hauptfeed — harte Regel 34, dasselbe Argument wie bei Gruppen; und die Tab-Leiste ist auf 360 px schon eng). Nur im Filter (dann ist es ein Filter-Werkzeug, nicht Leopolds „auf die Karte gehen"). |
| Was tut ein Tipp? | **Karte bleibt stehen, Posts erscheinen darunter** | In die Liste springen (die Karte wäre ein Knopf, und jeder Vergleich kostet einen Rückweg). In den Stapel springen (man sieht nicht mehr, was man gewählt hat). |
| Posts ohne Bezirk? | **Antippbare Zeile unter der Karte: „2 ohne Bezirk"** | Weglassen (eine Ansicht, die still Posts verschluckt — genau die Sorte Fehler wie die zwei Leer-Zustände vom 03.09.). Überall mitfärben (behauptet Aktivität an 23 Orten, die es nicht gibt). |
| Einfärben? | **Relativ zum stärksten Bezirk** | Feste Stufen (bei fünf Posts wäre ganz Wien blassgrau). Nur Zahlen (dann ist es eine Tabelle in Kartenform). |
| Wie kommt man an die Innenbezirke? *(kam erst beim Bauen auf, 06.09.)* | **Schieben und Zoomen mit zwei Fingern** — Ians Entscheidung 33, **gegen meine Empfehlung** | Eine **Lupe** (zweite, größere Karte nur für die Bezirke 1–9, so machen es Papierkarten): braucht keine Geste und wäre das Sicherste — aber man muss zwei Karten übereinander erst verstehen, und von einer Karte erwartet man heute Zoom. **Karte nur zum Anschauen** mit einer Auswahlreihe darunter: am wenigsten Arbeit, und praktisch das, was Ian beim Filter schon verworfen hat. **Die Messung dahinter:** Josefstadt 14 × 11 px bei Handybreite; „nächster Beschriftungspunkt gewinnt" ergäbe 11 × 11 px, also schlechter als nichts zu tun. **Der Haken, den er kennt:** dritter Gesten-Erkenner der App, und die beiden anderen sind am echten iPhone noch ungeprüft. |

#### Was zu bauen ist

| Baustein | Woher | Anmerkung |
|---|---|---|
| 23 Bezirksumrisse als SVG-Pfade | Stadt Wien, `data.gv.at`, GeoJSON → einmal umgerechnet | **Eine Datei**, gebaut wie `theme/icons.ts`: Daten getrennt vom Zeichner. **CC BY** — eine Zeile Namensnennung nötig, kein Geld, keine Erlaubnis. |
| `SsWienKarte` | neu | Flächen, Farbskala, Antippen. Nach dem Muster von `SsIcon`: ein Raster, eine Regel. |
| Zählung je Bezirk | **`useBezirkeImFeed` gibt es schon** (Phase 15) | ⚠️ **Nicht danebenbauen.** Der Haken schaltet beim Zählen genau den Bezirksfilter aus und lässt alle anderen gelten — sonst sperrt sich die Karte nach dem ersten Tipp selbst ein (die Phase-15-Falle). |
| Regel-Datei `features/posts/karte.ts` | neu | Wie `wisch.ts`, `filter.ts`, `kollision.ts`: Die Farbskala und „was heißt viel los" gehören dorthin, nicht in den Screen. |

#### Drei Dinge, die beim Bauen schiefgehen werden

1. **`SsSegment` mit DREI Beschriftungen auf 360 px.** „Sta…" (Phase 11) und
   „Jeder kann anfr…" (Phase 18a) waren dieselbe Falle mit zwei verschiedenen Ursachen.
   Drei Wörter statt zwei ist die dritte Gelegenheit. **Vor dem Einbau auf 360 × 600
   nachmessen**, nicht nur auf 390 × 844.
2. **Farbe allein ist keine Auskunft.** Wer die Karte nur einfärbt, gibt Menschen mit
   Farbsehschwäche gar nichts — und der Kontrast zwischen „2 Posts" und „3 Posts" ist
   ohnehin kaum zu sehen. **Die Zahl gehört in die Fläche**, wo sie hineinpasst.
3. **Eine Karte hat ein Kaltstart-Problem, das eine Liste nicht hat.** Ein leerer Feed
   zeigt einen Satz und einen Ausweg (`LeererFeed`, seit dem 03.09.). Eine leere Karte
   zeigt **23 graue Flächen** — sie sieht nicht leer aus, sondern kaputt. Es braucht
   denselben Satz und denselben Ausweg wie die Liste, nur über der Karte.

> ### Gebaut am 2026-09-06 — was daraus geworden ist
>
> **Die Karte steht, auf Web und nativ auf iOS.** Dritte Stufe im Umschalter
> („Stapel · Liste · Karte"), 23 echte Bezirksflächen, eingefärbt nach Posts,
> antippbar, mit Schieben und Zoomen. Belege: `r01`–`r04` (Web, 360 × 600 und
> 390 × 844) und **`r05-ios-karte.png`** (iPhone 17 Pro, iOS 26.5).
>
> **Die vier Dateien und warum es vier sind:**
>
> | Datei | Was darin steht | Warum getrennt |
> |---|---|---|
> | `data/wien-bezirke.ts` | 23 SVG-Pfade, Name, PLZ, Beschriftungspunkt | **Erzeugt.** Wie `theme/icons.ts`: nur Daten |
> | `features/posts/karte.ts` | Farbskala, Zoomgrenzen, Lizenzzeile, Ians Entscheidungen | Wie `wisch.ts`, `filter.ts`, `kollision.ts` |
> | `lib/karte-treffer.ts` | „welcher Bezirk liegt unter diesem Punkt" | Reine Geometrie, plattformgleich |
> | `components/ui/SsWienKarte.tsx` | Zeichnen und Geste | Der Zeichner, wie `SsIcon` |
>
> **Sieben Dinge, die wichtiger sind als das Bild:**
>
> 1. **Aus 3 MB wurden 11 kB — und das Verfahren ist der Punkt, nicht die Zahl.**
>    `scripts/bezirke-bauen.py` holt die amtlichen Grenzen (Stadt Wien, CC BY 4.0)
>    und macht aus **118.683 Stützpunkten 886** (0,7 %). Entscheidend ist die
>    REIHENFOLGE: **erst auf ein Raster runden, dann vereinfachen.** Zwei Nachbarn
>    teilen sich eine Grenze; vereinfacht jeder sie für sich, entstehen Lücken.
>    Gerundet sind die geteilten Punkte vorher bitgleich, und Douglas-Peucker ist
>    umkehrungsinvariant.
> 2. **Der Beschriftungspunkt ist NICHT der Schwerpunkt.** Bei den gebogenen
>    Bezirken (13., 21., 22.) läge der außerhalb der Fläche und die Zahl stünde
>    beim Nachbarn. Gesucht wird der Punkt mit dem größten Abstand zum Rand — und
>    dieser Abstand wird als `label.r` MITGESPEICHERT, weil der Zeichner daran
>    entscheidet, ob die Zahl überhaupt hineinpasst.
> 3. **Die Josefstadt ist bei Handybreite 14 × 11 Bildpunkte groß.** Neun der 23
>    Bezirke liegen unter 30 px, und ausgerechnet dort liegen die meisten Posts.
>    Nachgemessen wurde auch der naheliegendste Ausweg — „der Bezirk mit dem
>    nächsten Beschriftungspunkt gewinnt" ergibt **11 × 11 px**, also schlechter
>    als nichts zu tun. **Was zu klein ist, ist das BILD, nicht die Logik.**
> 4. **`FeedFilter.bezirk` ist ein Union geworden** (`BezirkFilter`: `alle` ·
>    `einer` · `ohne`) — die vierte Runde derselben Frage nach `Post.district`,
>    `ChatThread.postId` und `Visibility`, und wieder hat `tsc` die Arbeitsliste
>    geschrieben (vier Stellen, alle im Filterfeld). Nebengewinn: Posts ohne
>    Bezirk sind zum ersten Mal ausdrücklich auswählbar statt nur unter „Überall"
>    auffindbar.
> 5. **`useBezirksZaehlung` ist die neue Quelle, `useBezirkeImFeed` leitet ab.**
>    Nicht danebengebaut — die Regel „beim Zählen wird genau der Bezirksfilter
>    ausgeschaltet" steht damit weiter an EINER Stelle. Auf der Karte hätte ihr
>    Fehlen eine sichtbarere Wirkung als im Filter: nach dem ersten Tipp eine
>    einzige eingefärbte Fläche in einem grauen Wien.
> 6. **Die Kartenhöhe hängt am Schirm (28 %), nicht an einer festen Zahl.** Mit
>    festen 230 px bekam die Liste auf 390 × 844 gute 266 px und auf **360 × 600
>    genau 22 px** — einen blauen Streifen. „Posts erscheinen darunter" ist aber
>    Ians Entscheidung 30; eine Ansicht, die sie nur auf großen Geräten einlöst,
>    löst sie nicht ein.
> 7. **Der Umschalter mit DREI Beschriftungen ist die vorhergesagte Falle — und
>    sie ist eingetreten.** „Sta…", zum dritten Mal nach Phase 11 und 18a.
>    Nachgemessen statt geraten: Die Zeile hat 328 px, rechts steht „Noch 12
>    Karten" (84 px), also bleiben 232 für den Balken; bei 12 px Innenabstand
>    bekommt „Stapel" davon 47,33 px und braucht 47. Das geht auf dem Zehntelpixel
>    auf — deshalb ist der Innenabstand in `SsSegment` auf 8 px gefallen (55,3
>    gegen 47). Die zweistufigen Leisten gewinnen dadurch mit.
>
> #### Der Fehler, den nur echte Touch-Ereignisse gezeigt haben
>
> **Ein Kneifen wurde als Tipp gewertet.** Beim Auseinanderziehen sprang die
> Auswahl vom 8. in den 1. Bezirk. Der Grund ist eine Eigenschaft von
> `PanResponder`, auf die man nicht kommt: **`gestureState.dx/dy` misst bei
> mehreren Fingern den MITTELPUNKT.** Wer zwei Finger symmetrisch auseinanderzieht,
> lässt den Mittelpunkt stehen — `dx` und `dy` bleiben null, und beim Loslassen
> sieht die Berührung aus wie ein Tipp.
>
> Die Bewegungsgrenze (harte Regel 15) kann das nicht abfangen, weil sie die
> falsche Frage stellt. Die richtige ist nicht „hat sich der Finger bewegt?",
> sondern **„war das überhaupt eine Ein-Finger-Geste?"** — ein Kneifen ist nie ein
> Tipp, auch wenn es sich um keinen Pixel verschiebt (`mehrfingrig`).
>
> **Gefunden nur, weil echte Touch-Ereignisse geschickt wurden** (CDP
> `Input.dispatchTouchEvent`), nicht mit der Maus. Dritte Fassung der
> Phase-18b-Lehre. Geprüft sind seither alle vier Fälle: Kneifen auf (1 → 3,64),
> Kneifen zu (→ 1), Schieben bei Zoom 4 (ohne Auswahl), Ein-Finger-Tipp (wählt).
>
> #### Beim Zoomen wird um die MITTE gedreht, nicht um die Fingerstelle
>
> Der Lehrbuchweg hält die Stelle zwischen den Fingern fest. Er braucht die
> Fingerposition **relativ zur Karte** — und `touches` liefert `pageX`, also
> Seitenkoordinaten. Der Unterschied ist der Kartenursprung, und der kürzt sich nur
> in DIFFERENZEN weg, nicht in „wie weit ist der Finger von der Mitte entfernt".
> Ihn zu besorgen hieße, während der Geste zu messen — auf Web meldet `onLayout`
> erst nach dem Zeichnen. **Falls es sich am Gerät falsch anfühlt**, ist der Weg
> heraus, die Kartenposition EINMAL nach dem Einblenden zu messen, nicht die Formel
> zu erraten.
>
> #### Was offen bleibt
>
> - **Der Finger-Durchgang am echten iPhone** — wie alles aus Phase 19.5. Am
>   Simulator ist die Karte gezeichnet, aber nicht angefasst worden: `xcrun simctl`
>   kann keinen Tipp schicken, und `idb` ist nicht installiert. Belegt ist sie dort
>   über eine **vorübergehend** auf `'karte'` gestellte Startansicht (zurückgenommen).
> - **Bei Zoom 1 fehlt ausgerechnet die Zahl des stärksten Bezirks** (1070 mit
>   fünf Posts ist 20 px breit). Die Aussage der Karte steht also erst nach dem
>   Hineinzoomen ganz da. Das ist die Folge von Wiens Geografie und der Grund,
>   warum die Geste überhaupt gebaut wurde — kein Fehler, aber es gehört gewusst.
> - **`stufeFuer()` in `karte.ts` ist die eine Stelle, an der noch eine echte Wahl
>   steckt** (siehe unten, „Ian schreibt selbst").

### Phase 19c — Die Aktivitäten springen aus der Karte ✅ *(gebaut am 2026-09-06)*

> **Woher es kommt.** Ian hat die fertige Karte aus 19b benutzt und zwei Dinge gesagt:
> *„Ich finde die Map nicht schön, sie sollte zum App-Interface passen, ich mag Karten
> von Apple"* und *„wenn man auf einen Bezirk klickt, sollen die Aktivitäten über dem
> Klick herausspringen, klein, mit dem Minimum an Info — und wenn ich interessiert bin,
> klicke ich drauf und sehe die ganze."*
>
> Das sind **zwei verschiedene Wünsche**, und sie werden getrennt gebaut. Warum, steht
> gleich unten — es ist derselbe Grund, aus dem Phase 19 vor Phase 20 steht.

#### Warum 19c und 19d zwei Phasen sind und nicht eine

| | 19c — Herausspringen | 19d — Echte Apple-Karte |
|---|---|---|
| Was es ändert | **Wie man die Karte benutzt** | **Wie die Karte aussieht** |
| Neue Abhängigkeit | keine | `react-native-maps` (nativ) + MapKit JS (Web) |
| Neuer Build nötig | nein | **ja** |
| Wartet auf Ian | nein | **ja** — Apple-Schlüssel |
| Läuft im Web-Prototyp | sofort | erst mit Schlüssel |

**Beide zusammen zu bauen hebt genau den Nutzen auf, für den Phase 19 vor Phase 20
steht.** Springt danach etwas nicht heraus, gibt es zwei mögliche Ursachen: die neue
Blase oder die neue Karten-Bibliothek. Getrennt ist jede Frage einzeln beantwortbar —
und 19c ist zugleich die Absicherung: **Wenn die Blase auf der gezeichneten Karte
funktioniert, ist sie beim Tausch der Karte darunter nicht mehr neu.**

Dazu kommt ein Argument, das erst beim Nachdenken auftaucht: **19c ist der Teil, der
die App besser MACHT; 19d ist der Teil, der sie schöner macht.** Heute muss man nach
einem Tipp nach unten schauen, um zu sehen, was in dem Bezirk los ist — die Karte
beantwortet also nur die halbe Frage. Das behebt 19c, ganz ohne Apple.

#### Ians vierunddreißigste Entscheidung (2026-09-06)

| Frage | Entscheidung | Verworfen — und warum |
|---|---|---|
| Wie viele Aktivitäten springen heraus? | **Bis zu drei übereinander, darunter „alle 5 ansehen"** | **Alle, waagrecht durchwischbar** (wie die Ortskarten in Apple Karten): kommt an alles heran, ist aber der VIERTE Wisch-Erkenner der App — und er läge direkt über einer Karte, die selbst geschoben wird. Genau der Streit, vor dem harte Regel 44 warnt. **Eine große mit Blätterpfeilen**: am ruhigsten, aber man muss fünfmal tippen, um zu sehen, was es gibt — und das Überblicken war der Grund für die Karte. |

#### Ians siebenunddreißigste Entscheidung (2026-09-06, beim Bauen dazugekommen)

| Frage | Entscheidung | Verworfen — und warum |
|---|---|---|
| Auf einen Bezirk mit fünf Posts passen ein bis zwei Zeilen — welche? | **Was als Nächstes losgeht** (`BLASE_REIHENFOLGE = 'naechste'`) | **Neueste zuerst**, wie die Liste darunter (`sort.ts`, Entscheidung 1): eine Wahrheit statt zweier — und genau daran scheitert es. Ein Post, der in zwanzig Minuten losgeht, fiele aus der Blase, weil jemand später etwas für Samstag gepostet hat. Im Feed ist das Neueste richtig, weil dort ALLES steht; in einer Auswahl von zwei aus fünf ist es die falsche Frage. **Erst die mit freien Plätzen**: sortiert sich um, während man hinschaut. |

**Den Haken kennt er:** Blase und Liste darunter sortieren verschieden. Das ist
vertretbar, weil die Blase eine AUSWAHL ist und die Liste die vollständige Menge — anders
als bei `StapelDurch` und `LeererFeed` (2026-09-03) geben sie nicht zwei Antworten auf
dieselbe Frage, sondern eine kurze und eine lange auf zwei. Der Vergleich selbst ist
`nachStartzeit` aus `sort.ts`, also keine zweite Rechnung.

#### Was zu bauen ist

| Baustein | Wo | Anmerkung |
|---|---|---|
| `KartenBlase` | `components/` (neu) | Die Sprechblase über dem Bezirk: bis zu drei Mini-Karten, ein Pfeil nach unten, eine Fußzeile. **Kein eigener Gesten-Erkenner.** |
| `MiniPostKarte` | in `KartenBlase` | Eine Zeile je Aktivität. **Nicht `PostCard` verkleinern** — siehe unten. |
| `BLASE_MAX` | `features/posts/karte.ts` | Ians Drei. Gehört zu den Regeln, nicht in den Screen (Regel 48). |
| Ankerpunkt-Rechnung | `SsWienKarte` | Bezirks-Label → Bildschirmpunkt, über dieselbe Umkehrrechnung, die der Tipp schon benutzt. |

#### Die fünf Entscheidungen, die beim Bauen anfallen — schon getroffen, damit sie nicht geraten werden

1. **Die Blase hängt am BEZIRK, nicht am Finger.** Ian sagte „über dem Klick", und
   wörtlich genommen hieße das: Tippt man Donaustadt am äußersten Rand an, steht die
   Blase am Rand. Sie soll aber auf den Bezirk zeigen, den sie meint — also sitzt der
   Anker auf dem **Beschriftungspunkt** aus `wien-bezirke.ts` (`label.x/y`), dem Punkt
   mit dem größten Abstand zum Rand. Das ist auch die stabile Wahl: Zweimal denselben
   Bezirk antippen ergibt zweimal dieselbe Stelle.
2. **Die Blase kippt nach unten, wenn oben kein Platz ist.** Bei den Bezirken 19, 21
   und 22 säße sie sonst über dem oberen Kartenrand. Standardverhalten jeder Sprechblase,
   und ohne es ist die halbe Karte unbrauchbar. Der Pfeil wechselt mit.
3. **Während einer Geste ist die Blase weg, danach setzt sie sich neu an.** Mitzuwandern
   hieße, während des Schiebens zu rendern — und **genau das vermeidet `SsWienKarte`
   bewusst** (die Geste bewegt eine `Animated.View`, es rendert nichts neu). Der Zoom
   wird ohnehin schon beim Loslassen in den State übernommen (`zoomStufe`); an derselben
   Stelle wird die Blase neu gesetzt. Kein neuer Mechanismus, nur ein zweiter Nutzer
   eines vorhandenen.
4. **Die Mini-Karte ist NICHT `PostCard` mit kleinerer Schrift.** Sie zeigt
   **Kategoriefarbe · Titel · Zeit** und sonst nichts. Was bewusst FEHLT, ist der
   Bezirk — den hat man gerade selbst angetippt, er stünde in jeder der drei Zeilen
   dasselbe. (Dieselbe Überlegung wie in 18c bei der Chat-Liste: Was der Zusammenhang
   schon sagt, ist in der Zeile Ballast.) `PostCard` zu verkleinern wäre der falsche
   Weg — sie trägt Sichtbarkeits-Marke, Notiz, Plätze, Anfrage-Zustand und den
   Doppel-Hinweis; das alles auf 44 px Höhe ist keine Karte mehr, sondern eine
   unleserliche Karte.
5. **„alle 5 ansehen" wechselt in die Listenansicht** und lässt den Bezirksfilter
   stehen. Der Filter überlebt das Umschalten ohnehin (harte Regel 26), und es gibt das
   Muster schon: `StapelDurch` hat seit Phase 13 die Zeile „Zur Listenansicht wechseln".
   **Verworfen:** die Blase einfach schließen, weil die Liste unter der Karte ja schon
   gefiltert ist — ein Knopf, der scheinbar nichts tut, ist schlimmer als keiner.

#### Was dabei schiefgehen wird

1. **Die Blase verdeckt die Karte, die man gerade lesen will.** Drei Mini-Karten sind
   rund 150 px hoch, und die Karte ist auf 360 × 600 nur 168 px hoch. **Vor dem Bauen
   nachmessen**, nicht danach: Passt die Blase nicht, ist die Antwort nicht „kleinere
   Schrift", sondern **weniger als drei bei kleinen Schirmen** — dieselbe Rechnung wie
   `KARTE_ANTEIL`.
2. **Ein Tipp auf die Blase darf nicht als Tipp auf die KARTE ankommen.** Die Blase
   liegt über einer Fläche, die einen `PanResponder` hat, und der beansprucht die
   Berührung beim Beginn (`onStartShouldSetPanResponder: () => true`). Die Blase gehört
   deshalb **nicht in die Karten-Fläche**, sondern als Geschwister darüber — dasselbe
   Muster wie `WischStapel.blatt` (harte Regel 36), nur andersherum begründet.
3. **Ein leerer Bezirk hat nichts zum Herausspringen.** Tippt man den 8. an und dort
   liegt nichts, darf keine leere Blase erscheinen. Entweder gar keine — oder eine mit
   einem Satz. **Vorschlag: gar keine**, und die Zeile unter der Karte sagt weiter
   „1080 Wien · 0 Posts". Eine Blase, die „nichts" sagt, ist ein Klick, der bestraft wird.
4. **Die Zahl im 7. Bezirk passt weiterhin nicht hinein.** 19c ändert daran nichts —
   das ist die bekannte Folge von Wiens Geografie (siehe 19b). Wer beim Bauen der Blase
   in Versuchung kommt, das „gleich mitzumachen", macht zwei Sachen gleichzeitig.

#### Was beim Bauen herauskam *(2026-09-06)*

**Gebaut sind vier Dateien und keine davon ist ein Screen** — dieselbe Aufteilung wie
19b: `features/posts/karte.ts` (`BLASE_MAX`, `BLASE_REIHENFOLGE`, `blaseAlleText`) ·
`components/KartenBlase.tsx` (Zeichnen und Passform) · `components/ui/SsWienKarte.tsx`
(`KartenAnker`, der Slot `blase`) · `lib/zeit.ts` (`kurzStart`). Der Screen reicht nur
durch. Belege: `s01`–`s09` im Projektordner.

**1. Die Platzrechnung stand VOR dem ersten Handgriff — und sie war zu pessimistisch.**
Vorhergesagt hatte ich eine Zeile auf 360 × 600 und zwei auf 390 × 844. Nachgemessen im
Browser: Die Kartenfläche ist auf 360 × 600 tatsächlich **216 × 168 px**, auf 390 × 844
**296 × 230 px** — beide Zahlen auf den Punkt. Falsch war die Folgerung, weil ich mit dem
Anker der Inneren Stadt gerechnet habe: Der 7. Bezirk sitzt tiefer, hat also mehr Platz
über sich, und dort passen auf dem großen Handy **alle drei** (`s08`). Auf 360 × 600
bleibt es bei einer Zeile plus „alle 3 ansehen" (`s03`). **Die Lehre ist nicht „nicht
rechnen", sondern: Ein Wertebereich hat einen ungünstigsten Fall UND einen mittleren, und
die Zahl, die man herzeigt, muss sagen, welcher von beiden sie ist.** Dieselbe Sorte Fund
wie `HOECHSTALTER = 70` in 18b.

**2. Der teuerste Fehler war ein FEHLENDER Fänger, und er sah aus wie ein kaputter
Zustand.** Nach dem Einbau bewegte sich die Blase beim Schieben und Zoomen nicht mehr mit
— und die Karte schien mitgesperrt. Die Ursache ist eine Eigenheit von
`react-native-web`: Ein `box-none` wird dort zu CSS `pointer-events: none`, und CSS
vererbt das an alle Nachkommen — **an alle außer den Text-Knoten, denen RNW selbst ein
`auto` mitgibt.** Die Blase ließ also überall durch, nur nicht auf den Buchstaben; ein Zug
über sie markierte Text, statt die Karte zu bewegen. Ein ausdrückliches
`pointerEvents: 'auto'` am Blasenkörper macht daraus wieder eine Fläche mit einer Kante,
und `userSelect: 'none'` nimmt die Markierung. **Beides stimmt auf iOS genauso** —
nachgesehen, nicht gehofft: `pointerEvents`, `userSelect` und `boxShadow` (als String)
stehen alle drei in `StyleSheetTypes.d.ts` als `ViewStyle`-Props von React Native 0.86.

**3. Mein eigener Prüflauf hat den Fehler zuerst falsch beschrieben.** Der Schiebe-Test
fasste die Karte in ihrer Mitte an — also **auf der Blase**, die dort seit fünf Minuten
lag. Gemessen wurde damit das Overlay und nicht die Karte, und der erste Befund
(„Schieben geht gar nicht mehr") war falsch. Erst ein Zug **unterhalb** der Blase zeigte
die Wahrheit: Schieben, Zoomen und das Ausblenden während der Geste liefen längst richtig
(`deckkraft: 0` während, `1` danach, `s07`). **Wer ein Overlay einbaut, muss seine
Gestentests außerhalb davon ansetzen — sonst prüft er das Neue gegen sich selbst.**

**4. Zwei Warnungen in der Konsole waren beide meine, und eine steht wörtlich in
CLAUDE.md.** `props.pointerEvents is deprecated` — die ACTA-Falle aus Phase 4, in die ich
trotzdem gelaufen bin, weil jedes Beispiel im Netz es als Prop schreibt. Dazu
`"shadow*" style props are deprecated`; das Projekt hat den richtigen Weg seit Phase 13
in `PrototypHinweis.tsx` stehen (`boxShadow` als String). **Der Beleg war nicht der Code,
sondern die Konsole — eine Warnung JE AUFRUF.**

**5. Was die Blase NICHT anfasst.** Der Titel wird auf 360 × 600 bei langen Namen
gekürzt („Physik-Zusammenfas…"), weil die ganze Karte dort nur 216 px breit ist. Die
Antwort darauf wäre, die Blase über den Kartenrand hinausragen zu lassen — das ist
bewusst NICHT gebaut: Sie liegt deckungsgleich über der Kartenfläche, und alles andere
wäre eine Ausnahme, die man beim nächsten Umbau erklären muss. Ein gekürzter Titel in
einer Zeile ist auch nicht neu — die Chat-Liste macht es seit 18c genauso.

---

### Phase 19d — Die echte Apple-Karte · **19d-1 ✅ (2026-09-06)** · 19d-2 ⬜ *(Ians Entscheidung, gegen meine Empfehlung)*

> **Ians fünfunddreißigste Entscheidung, 2026-09-06.** Gefragt war, wie weit „wie Apple
> Karten" gehen soll. Angeboten hatte ich drei Wege; **empfohlen hatte ich den
> gezeichneten Apple-Stil** (Donau blau, Parks grün, warmes Beige — eine Datei mehr,
> läuft überall, kein neuer Baustein). **Ian hat die echte Apple-Karte gewählt.**
>
> Das ist seine Entscheidung und sie wird gebaut. Der Preis stand in der Frage und
> gehört hierher, damit ihn niemand später „entdeckt":

| Was | Folge |
|---|---|
| `react-native-maps` ist ein **Native-Baustein** | Neuer Build. Nach ihm stürzt der alte Dev-Build ab (die ACTA-Falle) |
| Auf **Web gibt es MapKit nicht** | Der Prototyp, den Ian herzeigt, hätte ohne Weiteres **keine Karte** |
| MapKit JS braucht einen **Apple-Schlüssel** | Wartet auf Ian — **Developer-Programm seit dem 2026-09-11**, der Schlüssel selbst ist noch nicht angelegt |
| Apple verlangt **Namensnennung** | Apple-Logo und Rechtelink auf der Karte, nicht verhandelbar |

#### Der Befund, der alles andere ordnet: eine echte Karte macht die App NICHT genauer

**An einem Post steht seit Phase 2 nur `district: '1070'` — keine Koordinate.** Eine
echte Apple-Karte darunter ändert daran kein Zeichen. Sie kann Straßen zeigen, aber
nicht, WO die Aktivität ist, weil die App es selbst nicht weiß.

Daraus folgen zwei Dinge, und beide sind wichtiger als jede Zeile Code dieser Phase:

1. **Unsere Bezirksflächen bleiben oben drauf.** Die Apple-Karte ist der HINTERGRUND,
   nicht der Ersatz. `wien-bezirke.ts` wird nicht überflüssig — es wird zur Auflage.
2. **Harte Regel 47 bleibt unangetastet, und die Versuchung wächst.** Wer eine echte
   Karte sieht, denkt an Stecknadeln. Eine Stecknadel verrät statt „1220" die genaue
   Parkbank um 17:00. **Ians Entscheidung 28 gilt weiter** — und sie gilt jetzt gegen
   einen stärkeren Reiz als vorher.

#### Warum die Phase noch einmal in zwei Hälften zerfällt

| Hälfte | Was | Braucht | Kann wann |
|---|---|---|---|
| **19d-1 · iOS** | `react-native-maps` mit Apple-Provider | einen neuen Build | **sofort nach 19c** |
| **19d-2 · Web** | MapKit JS | Maps-ID + Schlüssel + ein **JWT** | am besten **nach Phase 20** |

**Der Grund für die Trennung ist ein technischer, den man vorher wissen muss:** MapKit
JS wird nicht mit einem einfachen Schlüssel freigeschaltet, sondern mit einem **signierten
Token (JWT)**, das ablaufen soll. Ein Token, das ein Jahr gilt und im Quelltext einer
öffentlichen Seite steht, ist genau die Sorte Schlüssel-im-Code, die harte Regel 1 aus
der Haupt-CLAUDE.md verbietet. Sauber ist es, wenn eine kleine Serverfunktion es
ausstellt — **und einen Server gibt es ab Phase 20 (Supabase Edge Function).**

**Bis dahin behält der Web-Prototyp die gezeichnete Karte aus 19b.** Das ist kein
Notbehelf, sondern die Bauart:

> **`SsWienKarte` bleibt und wird der Rückfall.** Wo kein Apple-Schlüssel eingerichtet
> ist — im Web-Prototyp, in jeder Vorschau, in jedem Screenshot-Durchgang —, zeichnet
> die App weiter ihre eigene Karte. **Damit ist 19b nicht weggeworfen**, sondern das
> Netz unter 19d.

#### Ians sechsunddreißigste Entscheidung (2026-09-06)

| Frage | Entscheidung | Verworfen — und warum |
|---|---|---|
| Wie zeigt eine geografische Karte, wo etwas los ist? | **Die Bezirke werden zart getönt** — je mehr los ist, desto kräftiger | **Zahlen-Blasen wie Apple-Pins** (meine Empfehlung): am nächsten an Apples Sprache, und sie lösen nebenbei das Problem, dass die Zahl im 7. Bezirk nicht in die Fläche passt. **Beides zusammen**: die meiste Auskunft und das meiste, was gleichzeitig um Aufmerksamkeit kämpft. |

> **Was aus der Entscheidung folgt, und es ist ein Haken:** Mit dem Tönen bleibt die
> **Zahl in der Fläche** — also bleibt auch das Problem aus 19b, dass sie im 7., 8. und
> 1. Bezirk erst beim Hineinzoomen erscheint. Eine Blase hätte keinen Platz IN der
> Fläche gebraucht. **Das ist kein Grund, die Entscheidung zu ändern**, aber es ist der
> erste Ort, an dem man nachsieht, falls sich die Karte später „zu leer" anfühlt.
>
> Und ein zweiter, der beim Bauen auffallen wird: **Ein Farbschleier über einer echten
> Karte macht Grün und Blau darunter schmutzig.** Apples Wasser ist ein gesättigtes
> Blau; ein grauer oder farbiger Schleier darauf sieht nach Schmutz aus, nicht nach
> Auskunft. **Vorschlag zum Ausprobieren, nicht zum Beschließen:** den Schleier nur auf
> das LAND legen und die Wasserflächen aussparen — Apple liefert dafür keine Maske, wohl
> aber `GRUENGEWOGD` von der Stadt Wien (sieben saubere Flächen: Donau, Neue Donau, Alte
> Donau, Donaukanal, Bäche, stehende Gewässer, Donaunebengewässer). **Nachgeprüft am
> 2026-09-06, der Datensatz ist da und klein.**

#### Was zu bauen ist

| Schritt | Was | Anmerkung |
|---|---|---|
| 19d-1a ✅ | `npx expo install react-native-maps` | 1.27.2, SDK-57-tauglich. **Nur dieser eine neue Baustein**, wie bei `react-native-svg` in Phase 19 |
| 19d-1b ✅ | Neuer Build | Beim ERSTEN Versuch durch, 0 Fehler. Simulator, keine Signatur (Phase-19-Erkenntnis) |
| 19d-1c ✅ | `SsAppleKarte.native.tsx` | `<MapView>` + `<Polygon>` je Bezirk, Zahlen als `<Marker>` (so wandern sie ohne JS mit) |
| 19d-1d ✅ | Eine gemeinsame Schnittstelle | `components/ui/karte-typen.ts` + die Weiche `SsKarte.tsx` / `SsKarte.native.tsx`. Dazu `lib/karte-geo.ts` — siehe Baubericht |
| 19d-2a | Maps-ID + Schlüssel bei Apple | **Nur Ian** |
| 19d-2b | Token-Ausgabe | Supabase Edge Function (Phase 20) |
| 19d-2c | `SsAppleKarte.web.tsx` | MapKit JS, `mapkit.PolygonOverlay` |

#### Der Entwurf, an dem diese Phase steht oder fällt

**Es gibt ab 19d drei Kartenzeichner** (gezeichnet · MapKit nativ · MapKit JS) und
**genau eine** Bedeutung. Wenn die Bedeutung in die Zeichner rutscht, hat die App drei
Wahrheiten darüber, was „viel los" heißt — und auffallen würde es nur dem, der alle
drei nebeneinander hält.

Was deshalb **oberhalb** der Zeichner bleibt, egal welcher zeichnet:

- `features/posts/karte.ts` — Tönungsstufen, Zoomgrenzen, `BLASE_MAX`, Lizenzzeilen
- `data/wien-bezirke.ts` — die Flächen selbst
- `KartenBlase` samt Mini-Karten aus 19c — sie kennt die Karte nicht, nur einen Punkt
- die Auswahl — sie IST der Bezirksfilter (harte Regel 50), nicht ein Zustand im Zeichner

Was ein Zeichner **allein** verantwortet: den Hintergrund, das Zeichnen der Polygone,
und wie aus einer Geste ein „hier wurde getippt" wird.

> **Eine gute Nachricht, die man beim Planen leicht übersieht:** Mit MapKit fällt unser
> eigener `PanResponder` weg — die Karte schiebt und zoomt dann selbst. **Das ist ein
> Gesten-Erkenner WENIGER**, und ausgerechnet der, dessen Verhalten unter einem echten
> Finger noch ungeprüft ist. Der Preis (ein Native-Baustein) und dieser Gewinn gehören
> zusammen genannt.

#### Was dabei schiefgehen wird

1. **`react-native-maps` auf Web ist nicht dasselbe Paket.** Es gibt Web-Anläufe dazu,
   sie zeichnen Google-Karten. **Nicht danach greifen**, um sich die zweite Hälfte zu
   sparen — das ergäbe eine App, die auf dem Handy Apple und im Browser Google zeigt.
2. **Plattform-Endungen zerlegen einen Zeichner in drei Dateien** — genau das, was
   Phase 19 bei `SsIcon` bewusst NICHT getan hat (harte Regel 24). Hier ist es richtig
   und dort war es falsch, und der Unterschied ist der Grund: Bei `SsIcon` sind die
   Zeichner gleich und nur die Elemente heißen anders. Hier sind es **wirklich
   verschiedene Karten-Bibliotheken**. Wer das mit einem `Platform.OS`-Zweig in einer
   Datei löst, importiert beide Bibliotheken in beide Bündel.
3. **Apples Namensnennung ist keine Zeile Text.** MapKit verlangt das Apple-Logo und
   einen Rechtelink an der Karte. Kommt zu `KARTE_QUELLE` dazu, ersetzt es nicht — die
   Bezirksflächen bleiben ja von der Stadt Wien (CC BY).
4. **Der Zoom hört auf, unser Zoom zu sein.** `ZOOM_MIN`/`ZOOM_MAX` aus `karte.ts`
   gelten für die gezeichnete Karte; MapKit rechnet in Kamera-Höhen. Beides gleich
   nennen zu wollen wäre eine Scheingenauigkeit — **die Grenzen gehören je Zeichner
   ausgedrückt, die REGEL („man muss an die Innenbezirke herankommen") bleibt gemeinsam.**
5. **Der Prüfweg von 19b funktioniert nicht mehr.** Der Treffer-Test lief bisher in
   JavaScript (`lib/karte-treffer.ts`) und war damit auf beiden Plattformen derselbe;
   mit MapKit beantwortet ihn die Bibliothek. **`karte-treffer.ts` bleibt trotzdem** —
   der gezeichnete Rückfall braucht ihn weiter.

#### Was nur Ian kann

- **Maps-ID und privaten Schlüssel** im Apple-Developer-Konto anlegen (Certificates,
  Identifiers & Profiles → Maps IDs). Kostet nichts, dauert ein paar Minuten, braucht
  aber seinen Login. Steht in `_FUER_IAN/OFFENE_SACHEN.md`.
- **Beurteilen, ob es sich richtig anfühlt.** Eine echte Karte unter unseren Flächen
  kann auch unruhig wirken — Straßennamen und Geschäfte konkurrieren mit dem, was die
  App sagen will. Das ist keine Messung, das ist ein Urteil.

---

#### Was beim Bauen herauskam *(19d-1, 2026-09-06)*

**Die iOS-Hälfte läuft.** Unter den Bezirksflächen liegt eine echte Apple-Karte, sie
öffnet auf ganz Wien, die Auswahl umrandet den richtigen Bezirk und die Blase aus 19c
hängt unverändert daran. Belege `t01` bis `t04` im Projektordner. **Der Web-Prototyp ist
unberührt** — 23 SVG-Pfade wie vorher, null MapKit im Bündel, null Konsolenwarnungen.

Sechs Dinge sind wichtiger als das Bild:

1. **Die Geometrie wird UMGERECHNET, nicht ein zweites Mal gespeichert — das ist der
   Entwurf der Phase.** MapKit rechnet in Grad, `wien-bezirke.ts` steht im Raster. Der
   naheliegende Weg wäre gewesen, `bezirke-bauen.py` die Punkte zusätzlich in Grad
   ausgeben zu lassen: dieselben 886 Punkte in zwei Einheiten, und die zweite ist die,
   die beim nächsten Skriptlauf still veraltet. Die Projektion des Skripts ist flach mit
   Kosinus-Korrektur und damit **exakt umkehrbar** — **vier Zahlen** (`PROJEKTION`)
   ersetzen 886 Punkte. Gerechnet wird in `lib/karte-geo.ts`.
2. **Der Beweis dafür ist ein Ortstest, kein Round-Trip.** Raster → Geo → Raster hätte
   auch dann bestanden, wenn beide Richtungen denselben Vorzeichenfehler hätten. Geprüft
   wurde gegen sechs echte Orte: Stephansdom → 1010, Schönbrunn → 1130, Donauturm →
   1220, Praterstern → 1020, Hauptbahnhof → 1100, Grinzing → 1190. Alle sechs richtig.
3. **`minZoomLevel` hat den ANFANGSAUSSCHNITT überschrieben — der einzige echte Fehler
   der Phase.** Mit dem gerechneten Wert 10 öffnete die Karte auf rund einem Drittel von
   Wien. `react-native-maps` setzt die Zoomstufen auf iOS über `cameraZoomRange` in
   ENTFERNUNGEN um, und seine Umrechnung liegt gut anderthalb Stufen neben der
   Lehrbuchformel. Bei 9 passt Wien hinein, bei 10 nicht. **Punkt 4 der Vorhersage war
   richtig und noch zu milde formuliert:** Die Grenze verschob nicht bloß den erlaubten
   Bereich, sie bestimmte, was man beim Öffnen sieht.
4. **Die Obergrenze ist eine Entscheidung geworden, keine Technik.** `APPLE_ZOOM_MAX =
   15` ist Stadtviertel-Ebene. Weiter hinein wäre möglich und wäre falsch: **Die App
   kennt keine Koordinaten.** Wer bis auf ein Haus zoomen darf, dem verspricht die Karte
   eine Genauigkeit, die die Daten nicht haben — harte Regel 47, diesmal gegen den Zoom
   statt gegen einen Pin.
5. **Apples Namensnennung ist KEINE Arbeit gewesen.** Vorhergesagt war „Logo und
   Rechtelink an der Karte, nicht verhandelbar" — MapKit zeichnet beides selbst
   („Maps · Legal", auf `t01` zu sehen). Sie zusätzlich hinzuschreiben wäre eine zweite,
   verschiebbare Fassung derselben Pflicht gewesen. Was bleibt, ist `KARTE_QUELLE`: Die
   **Bezirksflächen** kommen weiter von der Stadt Wien (CC BY 4.0). Zwei Nennungen
   nebeneinander, weil sie zwei verschiedene Dinge betreffen. **Für MapKit JS in 19d-2
   gilt das NICHT** — dort ist die Nennung Handarbeit.
6. **Der eigene `PanResponder` ist weg, und damit ein ganzes Risiko.** MapKit schiebt und
   zoomt selbst. Der dritte Gesten-Erkenner der App, dessen Verhalten unter einem echten
   Finger nie geprüft war, existiert auf iOS nicht mehr — im Browser bleibt er.

##### Was NICHT geprüft ist, und warum

**Der Tipp auf die Karte.** Der Simulator lässt sich ohne Bedienungshilfen-Berechtigung
nicht antippen (`osascript` → Fehler −1719), und die kann nur Ian geben. Geprüft wurde
stattdessen, was daran hängt und schwerer zu treffen war: `nachRaster` + `bezirkAn` gegen
sechs echte Orte (Punkt 2), und die Auswahl samt Blase, indem der Bezirksfilter
vorübergehend auf `1220` gesetzt wurde (`t02` — Donaustadt östlich der Donau umrandet,
Blase am Beschriftungspunkt, zwei Posts nach Startzeit). **Offen bleibt allein, dass
MapKits `onPress` die Koordinate liefert** — Standard-API, aber ungeprüft. Es gehört in
denselben Durchgang wie der Wischstapel und der Jahrgangs-Balken: **auf Ians Gerät.**

##### Zwei Dinge, die man am Bild sieht und die keine Fehler sind

- **Die Zahlen der kleinen Innenbezirke fehlen beim Öffnen.** `zahlPasst` entscheidet
  unverändert; auf ganz Wien ist die Josefstadt zu klein. Genau dafür gibt es den Zoom.
- **Die Tönung ist zurückhaltend.** Das ist Ians Entscheidung 36 („zart"), keine
  schwache Umsetzung. `APPLE_TOENUNG = 0.45` ist die eine Zahl, an der es hängt.

##### Das Wasser-Problem ist da, mild, und bleibt liegen

Vorhergesagt war, dass ein Farbschleier Apples Wasserblau schmutzig macht. Er tut es —
sichtbar, wo die Donau durch die Donaustadt läuft, aber schwach genug, dass es niemandem
zuerst auffällt. Der Ausweg (`GRUENGEWOGD`-Maske der Stadt Wien) bleibt **Vorschlag, nicht
Beschluss**: Er kostet einen zweiten Datensatz, eine zweite Erzeugung und eine zweite
Kopie derselben Sorte Geometrie — für ein Problem, das Ian am Gerät vielleicht gar nicht
stört. **Erst schauen lassen, dann bauen.**

---

### Phase 19e — Die Karte wird zur App ✅ *(19e-1 und 19e-2 fertig, beide 2026-09-07)*

**Ziel:** Aus der Kartenansicht wird das, was Ian beschrieben hat — *„wenn man auf Karte
drückt, sieht man wirklich nur die Karte auf dem ganzen Screen, so wie wenn man bei Apple
auf Karten geht."* Dazu räumt der Start-Bildschirm auf: Der Schriftzug verschwindet,
„Posten" zieht um, und unten kommt eine Liquid-Glass-Leiste.

**Sie zerfällt in ZWEI Schritte, und das ist die wichtigste Festlegung des Plans:**

| | Was | Neuer Build? |
|---|---|---|
| **19e-1** ✅ | Das ganze Design: Vollbild-Karte, Blatt, Kopf weg, Posten umziehen, Blase weg, Hinweis als Vollbild | **Nein** — läuft sofort im Browser und im Simulator |
| **19e-2** ✅ | Echtes Liquid Glass (`expo-glass-effect`) | ~~**Ja** — ein einziger neuer Baustein~~ **Nein.** Das Paket lag schon da: `expo-router` 57 hängt selbst davon ab, Autolinking hat es mitgenommen, und es ist seit dem 19d-1-Build einkompiliert (siehe 19e-2, Befund 1) |

> **Warum getrennt (Ians Entscheidung 52):** Phase 19 hat gelehrt, dass nur EIN neuer
> Native-Baustein auf einmal in einen Build gehört — sonst hat jeder Fehler mehrere
> mögliche Ursachen. Phase 20.3 bringt vier weitere mit (Anmelden). Alle fünf zusammen
> wäre genau die Lage, aus der bei ACTA die teuren Tage wurden. Und 19e-1 macht die App
> schon ohne jeden Build besser.

#### Ians Entscheidungen 40 bis 49 *(2026-09-07)*

**40. Die Karte wird Vollbild, die Liste wird ein ziehbares Blatt.**
Wie bei Apple Karten: Die Karte füllt den Schirm, unten liegt ein Blatt mit Griff, das
man auf drei Stufen ziehen kann (zu · halb · ganz). Tippt man einen Bezirk an, fährt es
auf die mittlere Stufe und zeigt dessen Posts.
*Verworfen:* nur Karte mit der Blase (auf 360 px passt in die Blase **eine** Zeile —
gemessen in 19c) und Karte auf 60 % mit fester Liste darunter (die Karte wäre nie frei).

**41. „Posten" ist ein runder Knopf rechts vom Umschalter.**
Ians Vorgabe war „auf die Ebene von Stapel · Liste · Karte". Als **viertes Feld** im
Umschalter wäre es aber falsch: Die ersten drei WECHSELN eine Ansicht und bleiben
gedrückt, „Posten" öffnet einen anderen Screen und springt zurück. Ein runder Knopf
DANEBEN steht auf derselben Ebene und sagt durch seine Form, dass er etwas anderes tut.
*Das Muster stammt von Ian selbst* — aus dem BierBuddy-Screenshot, den er geschickt hat:
vier Punkte in der Leiste, der Einchecken-Knopf als eigener Kreis daneben.
*Verworfen:* viertes Feld im Umschalter · schwebender Knopf über der Tab-Leiste (die
Begründung gegen den schwebenden steht seit Phase 12 im Code: Er verdeckt immer genau
die unterste Karte).

**42. Die Filter leben IM Blatt, nicht über der Karte.**
Oben im Blatt, gleich über der Liste. Die Karte bleibt damit völlig frei von
Bedienelementen.
*Verworfen:* schwebende Pillenreihe über dem oberen Kartenrand (hätte die Karte oben
angeschnitten) und ein einzelner Filter-Knopf mit Zahl (was gefiltert ist, stünde dann
nicht mehr da — nur wie VIELE).

**43. Liquid Glass nur auf iOS. Der Browser bleibt schlicht.**
`expo-glass-effect` ist Apples echtes Glas und braucht **iOS 26+**; auf Web und Android
fällt es still auf eine gewöhnliche Fläche zurück.
*Verworfen:* es im Browser mit `backdrop-filter: blur()` nachbauen. **Der Haken ist
ausgesprochen und angenommen:** Genau die Fassung, die Ian den drei Mitgründern schickt,
ist damit die schlichtere.

**44. Der Umschalter schwebt über der Karte.**
Die Karte läuft randlos bis ganz nach oben, Umschalter und Posten-Knopf schweben darüber
— wie die Suchleiste bei Apple Karten. Auf iOS bekommt diese Pille in 19e-2 echtes Glas.
*Verworfen:* im Kopf des Blattes (beim Zuziehen wandert der Umschalter mit hinaus) und
als feste Zeile oben (dann ist die Karte nicht randlos, und genau das war der Wunsch).

**45. Das Blatt zeigt ohne Auswahl ALLE Posts.**
Kopf: „Ganz Wien · 12 Posts". Nach einem Tipp auf 1070: „1070 Wien · 3 Posts" mit einem
✕ zum Aufheben.
*Verworfen:* nur Filter plus „Tippe einen Bezirk an" (ein leeres Blatt beim ersten
Öffnen sieht aus wie „nichts los") und ein zugezogenes Blatt (dann sind die Filter
versteckt — und Ian wollte sie ausdrücklich sehen).

**46. Die Sprechblase aus Phase 19c fällt weg.**
Sie war die Antwort auf ein Problem, das mit dem Blatt verschwindet: Bis heute stand die
Liste weit unten, also musste die Auswahl OBEN beantwortet werden. Jetzt beantwortet das
Blatt dieselbe Frage — vollständig statt in einer Zeile.
> ⚠️ **`KartenBlase` und der `blase`-Slot samt `KartenAnker` bleiben im Code stehen**
> (harte Regel 51), nur ohne Benutzer. Sie sind geprüfte Arbeit und die Rechnung
> „wo liegt ein Bezirk auf dem Schirm" ist nicht trivial. Wer sie löscht, wirft sie weg;
> wer sie stehen lässt, holt sie mit einer Zeile zurück.
*Verworfen:* Blase nur bei zugezogenem Blatt (zwei Zustände, die einander kennen müssen
— genau daraus entstehen die Fehler, die man erst am Gerät sieht) und beide gleichzeitig
(dieselben drei Zeilen zweimal auf dem Schirm).

**47. Der Zähler „Noch 8 Karten" fällt ersatzlos weg.**
Neben dem Umschalter ist kein Platz mehr, sobald der runde Posten-Knopf dort steht.
> ⚠️ **Das ist die einzige Entscheidung dieser Runde GEGEN meine Empfehlung, und der
> Preis ist benannt:** Der Zähler war die Stütze von **Ians Entscheidung 14** — das
> Filterfeld legt sich über den Stapel, statt zu schieben, und der live mitzählende
> Zähler war die einzige Rückmeldung, dass gerade gefiltert wird. Ohne ihn filtert man
> blind, bis man das Feld zuklappt. **Das ist kein Widerspruch zu Entscheidung 14** (das
> Feld überdeckt weiter), sondern eine Stütze weniger. Was bleibt, ist die Zahl am
> Filter-Knopf. **Die Korrektur ist eine Zeile:** die Zahl klein unter den Stapel setzen
> — sie steht als Möglichkeit im Kopf des Screens.

**48. Der Prototyp-Hinweis wird ein Vollbild beim ersten Öffnen.**
Ians Worte: *„der wird noch größer, dass die Leute wirklich draufklicken auf Okay."*
Man muss „Verstanden" tippen, um weiterzukommen; danach ist er für die Sitzung weg und
verdeckt **nie wieder etwas**.
> **Harte Regel 22 wurde vorher gelesen, wie sie es verlangt.** Zwei Fassungen sind
> schon durchgefallen: als Ebene OBEN (verdeckte Wortmarke, „Posten" und Umschalter) und
> oben im Fluss (Ians Urteil am Handy: *„oben ist es schwieriger zu verstehen"*). **Ein
> Vollbild wurde nie versucht** — das ist also ein neuer Weg, keine Wiederholung. Es
> löst außerdem einen dokumentierten Nebeneffekt: Bisher verdeckte der Hinweis dauerhaft
> die Tab-Leiste (in Phase 13 als „zwei verdeckte Knöpfe" gemessen und damals bewusst
> hingenommen). Nach einem Vollbild ist nichts mehr verdeckt.
>
> ⚠️ **Die bekannte Falle dazu:** Auf Native gibt es kein `sessionStorage` (Vorhersage
> 19.6, am 2026-09-06 bestätigt) — der Hinweis käme nach JEDEM Kaltstart wieder, und als
> Vollbild wäre das viel lästiger als als Leiste. Gelöst wird das erst mit
> `expo-secure-store` in Phase 20.3. **Deshalb muss das Merken in EINER Funktion sitzen**
> (`schonGesehen()` / `merken()`), damit dort später nur der Speicher getauscht wird.

**49. Ein Tipp auf denselben Bezirk hebt die Auswahl wieder auf.**
Ians Ausgangspunkt: *„wenn man dann noch mal auf diesen Bezirk klickt, dass es dann
weggeht, weil das kann echt stören."* Heute klebt eine einmal getroffene Auswahl.
Zusätzlich ein ✕ im Blatt-Kopf, weil ein zweiter Tipp auf einen 14 × 11 px großen Bezirk
(die Josefstadt, gemessen in 19b) nicht zuverlässig zu treffen ist.
> **Harte Regel 50 gilt weiter:** Was auf der Karte gewählt ist, IST der Bezirksfilter —
> es gibt keinen zweiten Zustand daneben. Das Aufheben setzt also `filter.bezirk` auf
> `{ kind: 'alle' }`, nicht eine eigene Variable.

**Bestätigt, aber nicht geändert:** Der **Stapel bleibt der Start** (er stellt eine
Frage, die Karte beantwortet nur eine — und beim Kaltstart zeigt eine Karte fast nur
leeres Wien). **Alle drei Ansichten bleiben** (eine Karte im Feed ist ein ANGEBOT mit
„Bin dabei", eine Zeile im Blatt ist ein WEG — harte Regel 42, zwei Detailgrade für zwei
Fragen). Der **Schriftzug „SimplySocial" verschwindet** vom Start-Bildschirm; er steht
nur dort (nachgesehen), die anderen Tabs haben eigene Titel, die bleiben.

#### 19e-1 — Das Design, ohne neuen Build ✅ *(fertig 2026-09-07)*

**Was angefasst wurde:**

1. **`src/app/(tabs)/index.tsx`** — `styles.kopf` mit Wortmarke und „Posten"-Knopf ist
   weg, `KARTE_ANTEIL`/`KARTE_MAX_HOEHE` sind weg, der Zähler ist weg
   (Entscheidung 47). Der Screen hat jetzt **zwei Bäume**: einen gewöhnlichen
   `SsScreen` für Stapel und Liste, und `KarteVollbild` ohne `SsScreen`. Suchzeile,
   Kategorien und Umschalter werden EINMAL gebaut und in beide eingehängt — zwei
   Kopien wären der schnellste Weg dahin, dass die Karte eines Tages einen Filter
   weniger hat als die Liste.
2. **`src/components/ui/SsBlatt.tsx`** — neu, das ziehbare Blatt mit drei Raststufen.
3. **`SsKarte`** hat `fuellt`, `randUnten` und `randOben` bekommen; der Slot `blase`
   steht unbenutzt weiter da (Entscheidung 46, harte Regel 51).
4. **`src/components/PrototypHinweis.tsx`** — aus der Leiste ist ein Vollbild
   geworden, die vierte Fassung steht mit Begründung im Dateikopf.
5. **`src/features/posts/karte.ts`** — `KARTE_MIN_BAND` ist dazugekommen, siehe
   Befund 2.

**Die drei vorher benannten Fallen — was daraus geworden ist:**

> **a) Zwei Gesten-Erkenner übereinander: gehalten, und zwar gemessen.**
> Der Griff ist der einzige Ort mit einem Erkenner. Nachgewiesen mit echten
> Zeigergesten auf 360 × 600: Ein Zug auf der Karte verschiebt die Karte
> (`matrix(1.12, …, −21.3, −16.5)`) und lässt den Griff bei y = 288 stehen; ein Zug am
> Griff bringt ihn auf y = 74 und lässt die Karten-Transformation **auf das Zeichen
> genau** unverändert. **Auf iOS ist die Lage eine andere** (MapKit bringt eigene
> Gesten mit) — das bleibt für den Gerätedurchgang offen.

> **b) Vollbild heißt, aus `SsScreen` auszubrechen: so gebaut.** `KarteVollbild` ist
> ein blanker `View` mit `flex: 1`; der Sicherheitsabstand sitzt an der schwebenden
> Leiste (`insets.top`), nicht mehr am Screen.

> **c) Die Höhen hängen am Schirm: ja — aber nicht alle drei.** Das war die
> Vorhersage, und sie war zur Hälfte falsch. **Eine der drei Stufen ist ein Anteil,
> zwei Grenzen sind gemessen**, und beide Male aus demselben Grund: Was oben und unten
> schon steht, ist keine Frage des Schirms.
>   • `zu` ist die **gemessene Höhe des Blattkopfes** — ein Kopf ist eine Zeile Text
>     mit einem Griff, kein Anteil.
>   • `ganz` ist `min(0,92 × Höhe, Höhe − maxOben)`, wobei `maxOben` die **gemessene
>     schwebende Leiste** ist. Siehe Befund 1.
>   • Nur `halb` ist ein reiner Anteil geblieben.

**Vier Befunde, alle erst am Bild oder an der Messung sichtbar:**

1. **Mit `ganz` als reinem Anteil fuhr das Blatt UNTER die schwebende Pille.** Griff
   und Überschrift „Ganz Wien · 15 Posts" lagen dahinter, und die Lizenzzeile blitzte
   daneben durch. Der Anteil 0,92 ist auf 552 px eine andere Zahl als auf 844, die
   Leiste dagegen ist überall gleich hoch. **Die Karte hat daraufhin `randOben`
   bekommen** — Wien wird jetzt zwischen Leiste und Blatt zentriert, nicht im ganzen
   Fenster. Nach dem Fix: Leiste endet bei y = 49, Griff sitzt bei y = 75.
2. **Ohne Grenze schrumpfte Wien beim Aufziehen auf 44 px Höhe.** Gemessen auf
   360 × 600. Schlimmer als klein ist dabei, dass die Karte bei JEDEM Zug am Griff
   ihren Maßstab wechselt — man zieht eine Liste hoch und die Stadt zappelt.
   `KARTE_MIN_BAND = 0.5` in `features/posts/karte.ts`: Ab da läuft die Karte lieber
   HINTER das Blatt, statt weiter zu schrumpfen. **Die Zahl steht in der Regel-Datei
   und nicht im Zeichner** (harte Regel 52) — es gibt zwei Zeichner und eine
   Bedeutung.
3. **Zwei Größen, die fast gleich heißen und Verschiedenes bedeuten.** `randUnten` ist,
   wo das Blatt wirklich anfängt; `freiUnten` (bzw. `verdeckt` auf iOS) ist die
   Geometrie nach dem Deckel aus Befund 2. Die Lizenzzeile und der „Ganz Wien"-Knopf
   müssen dem BLATT ausweichen und nicht der Geometrie — mit dem gedeckelten Wert
   lägen sie bei aufgezogenem Blatt dahinter, und eine Nennung, die niemand sehen
   kann, ist keine. **Der Fehler wäre nicht zu sehen gewesen, sondern nur zu lesen**;
   er war im nativen Zeichner schon eingebaut und ist beim Nachlesen aufgefallen.
4. **Der „ohne Bezirk"-Chip ragte bei offenem Filter unten aus dem Blatt.** Auf
   360 × 600 fehlten fünf Pixel. Der Ausweg war nicht mehr Platz, sondern die
   Feststellung, dass es **eine Dopplung** war: Der aufgeklappte Filterbereich hat
   „Ohne Bezirk" in seiner Bezirksreihe längst. Der Chip im Blatt ist die Abkürzung
   für den ZUGEKLAPPTEN Zustand — und steht jetzt nur dort.

**Was geprüft ist (360 × 600 und 390 × 844, beides im Browser):**

| Prüfung | Ergebnis |
|---|---|
| Raster aus Abschnitt 9b: Überquellen, `elementFromPoint`, `scrollWidth > clientWidth` | kein abgeschnittener Text, kein verdeckter Knopf, keine Icon-Namen als Text |
| Konsole | 0 Warnungen, 0 Fehler |
| Blatt ziehen (echte Zeigergesten, viele Moves) | halb → ganz → zu, rastet auf allen drei Stufen ein |
| Karte gegen Blatt (Falle a) | getrennt, siehe oben |
| Tipp auf einen Bezirk | „1020 Wien · 1 Post", Auswahl-Umriss erscheint |
| **Entscheidung 49**: zweiter Tipp auf denselben Bezirk | hebt auf → „Ganz Wien · 15 Posts" |
| ✕ im Blattkopf | hebt auf |
| Filter öffnen | Blatt fährt auf `ganz`, alle vier Filterreihen im Bild |
| **Entscheidung 48**: Prototyp-Vollbild | fängt jede Berührung ab — auch auf der Tab-Leiste (`elementFromPoint` bei y = 578) |
| `tsc --noEmit` · eslint | sauber; 76 Meldungen statt 78 auf HEAD, alle 70 Fehler sind die bekannte `react-hooks/refs`-Altlast |

Belege: `v01`–`v09` im Projektordner.

> ❌ **Dieser Befund ist am 2026-09-07 nachgemessen und ZURÜCKGENOMMEN. Hier stand:**
> *„Im Stapel mit aufgeklapptem Filter sind ‚Alter egal' und ‚Bestimmte Jahrgänge' auf
> 360 × 600 von den Stapel-Knöpfen verdeckt."* **Sie sind nicht verdeckt — sie sind
> herausgescrollt, und die Kante, die genau das anzeigt, war die ganze Zeit da.**
>
> | | gemessen auf 360 × 600 | auf 390 × 844 |
> |---|---|---|
> | Blatt sichtbar (`clientHeight`) | 232 px | 296 px |
> | Filterinhalt (`scrollHeight`) | 296 px | 296 px |
> | **Überhang** | **64 px** | **0** |
> | „Alter egal" | y = 421, Blattkante 410 | y = 421, sichtbar |
> | nach `scrollTop = scrollHeight` | `elementFromPoint` trifft ihn **frei** | — |
> | weiche Kante (`Blatt` in `WischStapel.tsx`) | steht, y = 382, 28 px, 7 Streifen | steht nicht (richtig: nichts abgeschnitten) |
>
> **Der Satz „der Slot begrenzt korrekt, der Inhalt ist höher als der Platz" war schon
> damals richtig — nur die Folgerung daraus war falsch.** Harte Regel 36 hält, der
> ScrollView scrollt, und `untenAb` schaltet die Kante genau dann ein, wenn etwas
> fehlt: Auf dem kleinen Schirm blendet „Jahrgang" sichtbar aus, auf dem großen ist
> keine Kante da, weil nichts abgeschnitten ist. Beleg: `aa01-blatt-kante-360.png`.
>
> **Woher der Irrtum kam, ist das Lehrreiche:** `elementFromPoint` an der Mitte des
> Knopfes meldete „Weg" — den Stapel-Knopf. Das liest sich wie „verdeckt", heißt aber
> nur *an dieser Stelle liegt etwas anderes*. Warum der Knopf nicht dort ist, sagt es
> nicht. **Wer eine Überdeckung misst, misst als Zweites `scrollHeight` gegen
> `clientHeight`** — sonst hält man jedes herausgescrollte Element für verdeckt.
>
> **Was von dem Befund BLEIBT**, ist der andere, unabhängige Teil: Mit dem Zähler aus
> Entscheidung 47 fiel die einzige Rückmeldung weg, dass gerade gefiltert wird. Das
> ist kein Fehler, sondern der benannte Preis einer Entscheidung — die mögliche
> Korrektur steht weiter im Kopf von `(tabs)/index.tsx`. **In der Kartenansicht
> besteht auch das nicht**, dort fährt das Blatt auf und die Liste steht daneben.

> 📏 **Eine Messnotiz, die beim nächsten Gestentest Zeit spart:** Ein `mouse.down`
> gefolgt von `mouse.up` **ohne jede Bewegung dazwischen** löst im Prüfbrowser keinen
> `onPanResponderRelease` aus — der erste Tippversuch auf einen Bezirk sah deshalb aus,
> als sei die Trefferrechnung durch `fuellt` kaputt. Sie war es nicht: Mit einem
> Ein-Pixel-Ruck (was ein echter Finger immer tut) wählte derselbe Punkt sofort den
> richtigen Bezirk. **Das ist die vierte Fassung der Phase-18b-Lehre** — und diesmal
> war die Prüfgeste nicht zu grob, sondern zu sauber.

#### 19e-2 — Liquid Glass ✅ *(fertig 2026-09-07 — und OHNE neuen Build)*

`expo-glass-effect` — `GlassView`, dazu `isLiquidGlassAvailable()` und
`isGlassEffectAPIAvailable()`. **Beide Prüfungen sind Pflicht**, nicht Zierde: Die Doku
nennt iOS-26-Beta-Fassungen, in denen die API fehlt und der Aufruf **abstürzt**
(expo/expo#40911).

Glas bekommen haben: **die Tab-Leiste unten (als freistehende Kapsel), die schwebende
Umschalter-Pille und das ganze Blatt.** Auf Web und Android fällt alles drei auf die heutige helle Fläche
zurück — das ist Entscheidung 43 und kein Mangel. Belegt auf **iOS 26.5 (Simulator)**
und auf Web (360 × 600 und 390 × 844). Belege `y01`–`y05` und `x01` im Projektordner.

> 🔁 **Nachgebessert am selben Abend, und das ist der wichtigere Teil dieser Phase.**
> Ian hat die erste Fassung gesehen: *„noch nicht wie ich es dir gezeigt habe … sieht
> echt noch nicht so gut aus."* **Sein Vorbild liegt jetzt als Bild im Projekt —
> `vorbild-liquid-glass-bierbuddy.png`**, derselbe BierBuddy-Screenshot, aus dem schon
> Entscheidung 41 kam (runder Knopf neben der Leiste). Drei Dinge waren falsch, und
> **keines davon war der Effekt:**
>
> **a) Die FORM der Tab-Leiste — der größte Unterschied.**
> Erste Fassung: volle Breite, unten bündig, Trennlinie oben. Also die gewohnte
> iOS-Leiste, nur mit Glas dahinter. Vorbild: eine **freistehende Kapsel**, Abstand zu
> allen vier Kanten, voll gerundet, keine Linie.
> **Der Satz dahinter: Glas braucht RAND, nicht nur Hintergrund.** Eine Fläche, die an
> drei Kanten am Schirm klebt, sieht aus wie eine getönte Leiste — erst wenn Inhalt
> **daneben UND darunter** durchläuft, sieht man, dass sie bricht. Am Vorbild
> abgelesen und auf das Raster der App gerundet: 16 pt Seitenrand, 56 pt hoch, ~24 pt
> über dem unteren Rand, Radius = halbe Höhe. Die Maße stehen in `src/lib/tabs.ts`,
> weil DREI Stellen sie brauchen (die Leiste, `SsScreen`, `SsBlatt.unten`) — eine
> geschätzte Höhe an einer davon ist der Grund, warum eine Zeile hinter der Leiste
> landet.
>
> **b) Kante und Schatten lagen AUF dem Glas.** Der erste Entwurf hatte die Regel
> „Glas ersetzt die Fläche, nicht den Rahmen" — Kante und Schatten kamen vom Aufrufer
> und galten in beiden Zweigen. Am Bild ist das falsch: Echtes Liquid Glass zeichnet
> seine helle Kante selbst und wirft keinen Schlagschatten. Eine 1-px-Linie plus
> Schatten darüber macht daraus wieder **eine Karte mit unscharfem Hintergrund** —
> genau der Eindruck, den Ian beschrieben hat. **Kante und Schatten sind also nicht
> Zierde, sondern der ERSATZ für das, was Glas mitbringt**: jetzt in `glasSchwebt`,
> hinter der Prop `schwebt`, und nur im Rückfall gezeichnet. (Harte Regel 61 ist
> entsprechend berichtigt — sie war zwei Stunden alt.)
>
> **c) Das Blatt war halb Glas, halb Weiß.** Verglast war nur der Kopf; direkt darunter
> begann die deckende Liste, und die Naht zwischen den zwei Materialien lief quer
> durchs Bild. Ein Blatt ist EIN Ding, bei Apple Karten auch. Jetzt umschließt eine
> `SsGlas` Kopf und Körper. Der Preis ist benannt und angenommen: Die Liste liegt auf
> mattiertem Glas statt auf Weiß — `regular` ist dick genug, dass der Text steht, die
> dünne Stufe `clear` wäre es nicht.
>
> **Die Lehre über die drei Punkte hinweg:** Bei einem Material-Effekt ist das
> Ergebnis nicht der Effekt, sondern **die Form, die man ihm gibt**. Alle drei Fehler
> waren im Code unsichtbar und auf dem ersten Screenshot sofort zu sehen — und Ian hat
> sie gesehen, bevor ich sie gesucht habe. Belege: `z01`–`z05`.

**Was angefasst wurde:**

1. **`components/ui/glas-typen.ts`** — neu, die geteilte Bedeutung: der Rückfall
   (`glasErsatz`), `GLAS_FARBSCHEMA`, `GLAS_STIL`, die Schnittstelle. Dieselbe Bauart
   wie `karte-typen.ts` neben den zwei Kartenzeichnern (harte Regel 52).
2. **`components/ui/SsGlas.tsx` / `SsGlas.native.tsx`** — neu, die zwei Zeichner.
3. **`lib/tabs.ts`** — neu: die Maße der Kapsel (`TAB_KAPSEL_HOEHE`,
   `TAB_KAPSEL_SEITE`, `tabKapselUnten()`) und `useTabRand()` — wie viel unten belegt
   ist, 0 wo keine Leiste ist.
4. **`(tabs)/_layout.tsx`** — die Leiste schwebt (`position: 'absolute'`), ihr
   Untergrund kommt aus `tabBarBackground`. Import von `expo-router/js-tabs` statt
   `expo-router` (dort ist er veraltet, und nur der Unterweg gibt den Kontext her).
5. **`SsScreen.tsx`** — die eine Regel dafür, siehe Befund 3.
6. **`SsBlatt.tsx`** — Glaskopf, neue Prop `unten`, und zwei Berichtigungen (Befunde 4
   und 5).
7. **`(tabs)/index.tsx`** — die Pille liegt in einer `SsGlas`, `unten={tabRand}` am
   Blatt, `randUnten={blattRand + tabRand}` an der Karte.

**Sieben Befunde. Der erste hat die Phase halbiert, der letzte hat sie fast verlängert:**

> **1. Der Baustein war schon da — es gab NICHTS zu bauen.** `expo-glass-effect@57.0.1`
> liegt seit Phase 19 in `node_modules`: **`expo-router` 57 hängt selbst davon ab.**
> Autolinking hat es mitgenommen, es steht in `ios/Podfile.lock`, und `strings` auf dem
> Binary vom 2026-09-06 findet `ExpoGlassEffect` und `GlassEffectModule`. Der native
> Teil ist seit dem 19d-1-Build einkompiliert. **Die Zeile „19e-2 · Neuer Build? Ja" in
> der Tabelle oben war falsch** — die ganze Phase ist eine JS-Änderung. Nachgetragen ist
> das Paket trotzdem in `package.json`: Wer sich auf die Abhängigkeit einer Abhängigkeit
> verlässt, verliert sie beim nächsten Patch von expo-router, ohne es zu merken.

> **2. Glas ersetzt die FLÄCHE, nicht den Rahmen — und deshalb kostet es keinen
> doppelten Stil.** `SsGlas` bringt genau eine Eigenschaft mit: den Untergrund. Radius,
> Kante, Schatten, Polsterung und `flex` kommen vom Aufrufer und gelten in **beiden**
> Zweigen. Der erste Entwurf hatte Kante und Schatten im Rückfall — damit hätte die
> Tab-Leiste den Schatten der Umschalter-Pille geerbt, und niemand hätte gefunden, woher.

> **3. Echtes Glas braucht etwas dahinter — das ist der wirkliche Preis der Phase.**
> Eine Tab-Leiste, unter der nichts durchläuft, bricht nichts; sie wäre eine teure helle
> Fläche. Also nimmt sie keinen Platz mehr im Layout weg. Damit reicht jeder Tab-Screen
> bis an die Unterkante des Fensters, und ohne Zutun läge seine unterste Zeile dahinter.
> **Die Regel dagegen ist EINE und steht in `SsScreen`:**
>
>   *Was scrollt, scrollt unter das Glas. Was fest steht, weicht ihm aus.*
>
> Beim `scroll`-Zweig wandert die Leistenhöhe in den Scroll-INHALT, beim festen Zweig
> begrenzt sie die FLÄCHE — sonst lägen Stapel-Knöpfe und Antwort-Leiste dahinter.
> **Und zwar als `marginBottom`, nicht `paddingBottom`:** In beiden Fällen liegen dort
> absolut positionierte Kinder, und *Yoga rechnet die Polsterung des Elternteils bei
> absoluten Kindern an, der Browser macht es andersherum* (die Falle steht seit Phase 11
> im Kommentar von `(tabs)/index.tsx`). Ein Rand AUSSEN ist auf beiden Plattformen
> derselbe. **Nachgemessen auf 360 × 600 und 390 × 844, alle vier Tabs plus Karte plus
> Stapel-mit-Filter: kein Knopf in der Leistenzone**, und auf dem ganz
> heruntergescrollten Profil endet „Einstellungen" 92 px über der Leiste.

> **4. Eine Berichtigung aus 19e-1: bei zugezogenem Blatt stand nur der GRIFF da.**
> `zu` ist „der gemessene Blattkopf" — gemessen wurde aber nur der `kopf`-Knoten,
> während darüber noch die 28 px Griff-Fläche gezeichnet werden. Sichtbar waren damit
> genau diese 28 px, und die Titelzeile („Ganz Wien · 15 Posts"), die laut Prop-Doku
> *„auch bei zugezogenem Blatt zu sehen sein soll"*, lag darunter abgeschnitten. Der
> `onLayout` sitzt jetzt an der Glasfläche, die Griff UND Kopf umfasst — **eine Messung
> statt einer Addition, die jemand vergessen kann.** Nachgemessen: Griff bei y = 508,
> Titel-Unterkante 544, Tab-Leiste ab 551.

> **5. Ein Zug am Griff markierte im Browser den Text ringsum blau.** Die Geste beginnt
> auf dem Griff, und Chrome fängt dort eine Auswahl an. `userSelect: 'none'` — dieselbe
> Zeile und derselbe Grund wie an der Blase in 19c. Am Gerät sieht man es nie, im
> Prototyp bei jedem Ziehen. Nachher: `getSelection()` leer nach Zug hinunter UND hinauf.

> **6. Ein „Fehler", der keiner war — und der teuerste Umweg der Phase.** Auf dem
> Simulator öffnet die Karte mit viel Umland: Korneuburg, Klosterneuburg, Gerasdorf,
> und Wiens Süden liegt hinter dem Blatt. Das sah nach einem Fehler in `initialRegion`
> aus (einmal beim Einhängen gelesen, als noch nichts gemessen war). **Vier Versuche
> und die Rechnung sagen: es stimmt so.** `KARTE_MIN_BAND = 0.5` lässt die Karte
> ausdrücklich HINTER das Blatt laufen, statt weiter zu schrumpfen (Befund 2 aus
> 19e-1) — `verdeckt` ist deshalb auf 360 px gedeckelt, während das Blatt bei 463 px
> anfängt. Wien wird in den gedeckelten Streifen eingepasst, ist dort breitenbegrenzt
> (Seitenverhältnis 1,29 gegen ein hochkantes Fenster) und lässt oben und unten Luft.
> Genau dasselbe steht auf Web: SVG von y = 72 bis 352, Blattkante bei 275.
> **Der spekulative Fix ist zurückgenommen** (`git checkout` auf
> `SsAppleKarte.native.tsx`), weil er dasselbe Bild erzeugte wie vorher. Zwei Sachen
> sind aus dem Umweg trotzdem zu behalten:
> - **`fitToCoordinates` und `animateToRegion` verpuffen still vor `onMapReady`.** Ein
>   Aufruf, der nichts tut, sieht genauso aus wie ein Aufruf, der nicht stattfindet —
>   das kostete zwei Durchgänge. Wer die Kamera je wirklich setzen muss, braucht das
>   Flag.
> - **`fitToCoordinates` zählt `mapPadding` NICHT mit, `setRegion` schon.** Mit
>   `edgePadding = verdeckt + Luft` zoomte die Karte auf halb Niederösterreich hinaus,
>   weil beide Polsterungen zusammenkamen.
>
> **Die Lehre: ein Bild, das falsch aussieht, ist noch kein Fehler.** Vor dem Reparieren
> die Regel nachrechnen, die das Bild erzeugt — hier stand sie seit einem Tag als
> benannte Konstante da.

> **7. Das Web-Bündel wächst um 15.402 B (+0,36 %) — und das Paket war schon drin.**
> Gemessen gegen HEAD (4.230.145 → 4.245.547 B). Im Bündel steht
> `isLiquidGlassAvailable()` an einer Stelle, die niemand hier geschrieben hat: in
> **expo-routers eigenem `NativeStackNavigator`**. Damit gilt die in harter Regel 52
> genannte BEGRÜNDUNG für Plattform-Endungen hier nicht („sonst landet es im
> Web-Bündel") — die Endung bleibt trotzdem richtig, aus dem anderen Grund: Der
> native Zweig ruft `requireNativeViewManager` beim Laden des Moduls, und das darf im
> Browser nie passieren. Der größere Teil der 15 kB ist ohnehin der Wechsel des
> `Tabs`-Imports auf `expo-router/js-tabs`, das die ganze bottom-tabs-Sammlung
> mitexportiert.

**Was geprüft ist:**

| Prüfung | Ergebnis |
|---|---|
| iOS 26.5, Simulator: Glas an allen drei Flächen | Karte scheint durch Pille, Blattkopf und Tab-Leiste (`y01`) |
| Web 360 × 600 und 390 × 844: Rückfall | unverändert wie vor der Phase (`y03`–`y05`) |
| Leistenzone: alle vier Tabs, Karte, Stapel-mit-Filter, beide Größen | kein Knopf dahinter |
| Profil ganz heruntergescrollt | „Einstellungen" 92 px über der Leiste |
| Blatt: `zu` → Kopf ganz sichtbar (Befund 4) | Titel-Unterkante 544, Leiste ab 551 |
| Blatt: `ganz` → nicht unter die Pille (19e-1 hält) | Pille endet 49, Griff bei 75 |
| Ziehen am Griff, echte Zeigergesten | rastet auf allen drei Stufen, keine Textmarkierung |
| Konsole | keine Warnung, kein Fehler aus dem App-Code |
| `tsc --noEmit` · eslint | sauber; 76 Meldungen wie auf HEAD, alle die bekannte `react-hooks/refs`-Altlast |

> ⚠️ **Was NICHT geprüft ist und in den Gerätedurchgang gehört:** wie sich Glas unter
> einem echten Finger anfühlt (der Simulator zeigt es, er lässt sich aber nicht
> antippen), ob `isGlassEffectAPIAvailable()` auf Ians iOS-Fassung anders antwortet als
> auf 26.5 — und weiter offen aus 19e-1: **ob sich Blatt und Apple-Karte auf iOS um
> dieselbe Berührung streiten.**


#### Der Gerätebuild, parallel ⬜ *(braucht Ian einmal persönlich)*

Ian hat **heute nur eine gewöhnliche Apple-ID**, das Developer-Programm kommt später.
Damit ist der Weg **nicht** EAS, sondern lokal:

```bash
npx expo run:ios --device
```

- iPhone **einmal per Kabel** an den Mac, danach geht es über WLAN.
- Auf dem iPhone einmal „Vertrauen" bestätigen (Einstellungen → Allgemein → VPN & Geräteverwaltung).
- Die App läuft dann **7 Tage** und muss danach neu installiert werden — das ist die
  Grenze der gratis Apple-ID, kein Fehler.
- ⚠️ **Ians eigener Hinweis:** Im WLAN hängen mehrere Geräte. Vor dem Installieren
  `xcrun devicectl list devices` lesen und den Namen bestätigen lassen — **nicht das
  erstbeste Gerät nehmen.**

**Wofür der Build da ist** (offen seit Phase 19, jetzt mit zwei Punkten mehr): der
Wischstapel unter einem echten Finger · die Tastatur im Chat · der Jahrgangs-Balken mit
zwei Fingern · ob ein Tipp auf die Apple-Karte den richtigen Bezirk wählt · **und neu:
ob sich Blatt und Karte um dieselbe Berührung streiten.**

Sobald das Developer-Programm da ist, wird daraus EAS und TestFlight — dann können auch
Christoph, Leopold und Daria die App auf ihre eigenen Handys holen.

---

### Der Durchgang am eigenen Handy — was er ergeben hat (2026-09-08)

Ian hat die App auf seinem iPhone 16 (iOS 26.6) durchgespielt. **Das ist der erste
Durchgang mit einem echten Finger überhaupt** — alles davor war Maus am Mac oder
Simulator. Die sechs Punkte aus `_FUER_IAN/HANDY_DURCHGANG.md`:

| # | Was | Ergebnis |
|---|-----|----------|
| 1 | Wischstapel | ✅ **„super, funktioniert gut"** — die Phase-11-Trennung Tipp/Wisch hält unter einem Finger |
| 2 | Tastatur im Chat | 🟡 geht, aber die Ansicht springt nicht ans Ende |
| 3 | Jahrgangs-Regler | ✅ **„das ist gut"** — auch das Griffpaar aus 18b hält |
| 4 | Karte antippen | ✅ trifft, auch nach Zoomen und Schieben |
| 5 | Blatt gegen Karte | ✅ **kein Gestenstreit** — Karte schieben geht, das Blatt zieht am Griff |
| 6 | Liquid Glass | ❌ **„sieht noch gar nicht danach aus"** |

**Zwei davon sind Antworten auf Fragen, die im Browser prinzipiell nicht zu stellen
waren** — und beide sind gut ausgegangen: Der Wischstapel verwechselt Tipp und Wisch
auch mit einem echten Finger nicht (harte Regel 15 hält), und **die als kritisch
benannte Stelle ist unkritisch**: MapKit und das Blatt streiten sich auf iOS *nicht*
um dieselbe Berührung. Die Vorsichtsmaßnahme aus harter Regel 59 — der Blattkörper
bekommt gar keinen Erkenner — hat also getragen, ohne dass jemand verhandeln musste.

**Punkt 6 ist der wichtigste Befund, und er ist gemessen statt vermutet.** Ian hat auf
Nachfrage geprüft, ob die Karte unter der Tab-Leiste durchscheint: **sie tut es.** Damit
steht fest, dass **echtes Apple-Glas läuft** — `isGlassEffectAPIAvailable()` und
`isLiquidGlassAvailable()` sagen beide ja, das Bundle trägt **kein**
`UIDesignRequiresCompatibility`, gebaut ist gegen das iOS-26.5-SDK. **Es ist also keine
Technikfrage, sondern eine Formfrage** — zum zweiten Mal nach 19e-2, nur an einer
anderen Fläche. *(Und das ist genau der Grund, warum diese eine Ja/Nein-Frage vor dem
Plan stand: Wäre die Antwort „blickdicht" gewesen, wäre die ganze Phase eine andere.)*

---

### Ians Grundsatz — Entscheidung 50, und sie steht über allen anderen

> **„Wir wollen, dass die Person nicht alles auf einmal sieht, sondern nur das, was sie
> in diesem Moment auch wirklich braucht. Und wenn die Person etwas wissen will, dann
> soll's auch einfach für sie sein."** — *„das soll eigentlich immer so sein"*

Das ist keine Bemerkung zu einem Screen, sondern seine Antwort auf die Frage, wofür die
App da ist: **Man macht sie impulsiv auf und wischt, bis etwas kommt** — ausdrücklich
*nicht* wie beim Shoppen, wo man erst einen Filter baut und dann zwei Sachen sieht.

Deshalb wirkt der Satz in **zwei Richtungen**, und die zweite ist die ungewohnte:
1. Er **nimmt weg**, was auf einem Bildschirm steht, ohne dort gebraucht zu werden.
2. Er **bremst**, was noch gar nicht gebaut ist. Ein neuer Filter, ein neuer Umschalter,
   eine neue Einstellung muss ab jetzt begründen, warum sie im Weg stehen darf.

**Die Grenze steht im zweiten Halbsatz** und ist genauso verbindlich: *Wegräumen darf
nicht heißen, dass man zweimal tippt für das, weswegen man gekommen ist.* Bei jedem
Wegnehmen also mitprüfen, welche Entscheidung der Screen eigentlich trägt.

Als harte Regel 63 in `CLAUDE.md` und als Gedächtnis über Sitzungen hinaus abgelegt.

---

### Phase 19f — Weniger sehen ✅ *(gebaut am 2026-09-08, ohne neuen Build)*

Der Grundsatz, angewandt auf die Screens, die Ian genannt hat. **Reine Oberfläche auf
vorhandenen Daten** — deshalb steht sie vorn.

**Entscheidung 51 — der Post-Screen zeigt Titel, Person, Knopf.** Ian hat aus drei
Vorschauen die radikalste gewählt. Heute baut `app/post/[id].tsx` jede Angabe
**zweizeilig** (erst das Wort „Wann", darunter „heute 22:00") und das viermal
untereinander in einer Karte — dazu oben ein Krümelpfad aus Kategorie-Chip und Titel,
über dem noch einmal „Zurück" steht. Seine Worte: *„Sport, Zurück, Sport, Tennis
spielen — alles untereinander."*

> **Der Haken ist benannt und angenommen:** An Zeit und Ort entscheidet man „geh ich
> hin?". Deshalb verschwinden sie **nicht**, sie werden leise: In der Vorschau, die er
> gewählt hat, steht unter dem Knopf klein `heute 22:00 · 1220 Wien` und darunter
> „Mehr ansehen ⌄". **Das ist Teil der Entscheidung, nicht meine Auslegung** — er hat
> das Bild gewählt, auf dem es so steht.

**Entscheidung 52 — „Zurück" ist ein Pfeil ohne Wort.** Betrifft `SsBack` und damit
jeden Screen auf einmal (harte Regel 5). Zu prüfen ist dabei die Trefferfläche: Ein
Pfeil allein ist kleiner als Pfeil-plus-Wort, und 44 × 44 pt sind Apples Mindestmaß.

**Entscheidung 53 — der Filter-Knopf ist ein Symbol, kein Wort.** Das Wort „Filter"
fällt weg. Der **Zähler daneben bleibt** — er ist kein Schmuck (harte Regel 26,
Phase 15): Ohne ihn ist ein vergessener Filter der schnellste Weg zu einem Feed, den
jemand für kaputt hält. *Das ist die Grenze aus Entscheidung 50 in ihrer ersten
Anwendung: Das Wort ist entbehrlich, die Rückmeldung nicht.*

**Entscheidung 54 — der Umschalter bleibt, aber nur als Symbole.** Ian hatte den Stapel
als Vollbild beschrieben („alles weg, nur Zurück-Pfeil, Karten und die Leiste unten").
Auf die Frage, wie man dann zur Karte kommt, hat er **die vorsichtigste der drei
Möglichkeiten gewählt**: Stapel · Liste · Karte bleiben umschaltbar, die Pille
schrumpft auf drei Symbole ohne Beschriftung. Verworfen: Karte als Start und Stapel als
Vollbild darin, und die Umkehrung davon. **Nebengewinn:** Das erledigt zum vierten Mal
das „Sta…"-Problem (Phase 11, 18a, 19b) — ein Symbol kann nicht abgeschnitten werden.

**Entscheidung 55 — beim Antippen des Eingabefelds bleibt der Chat unten.** Heute
scrollt die Ansicht beim Öffnen der Tastatur nicht mit ans Ende; man muss selbst
runterwischen, um die letzten Nachrichten zu sehen. Das ist der einzige echte
Bedienfehler aus den Punkten 1–5.

**Entscheidung 56 — „Gruppe erstellen" zieht ins Chats-Register, oben rechts.** Ians
Begründung: *„das hat eigentlich nix mit dem Profil zu tun, sondern eher mit dem
Chatten."*

> ⚠️ **Berührt harte Regel 34 — und deshalb hier ausdrücklich geprüft (harte Regel 58).**
> Regel 34 sagt: *„Der Weg zu `/gruppen` liegt am Profil, nicht in der Tab-Leiste."*
> Ihr **Grund** war aber ein anderer als ihr Wortlaut: Eine Gruppe soll **kein eigener
> Ort** werden — kein eigener Tab, kein eigener Feed, weil das den Hauptfeed leert.
> Ein Knopf in der Kopfzeile des Chats-Registers schafft **weder Tab noch Feed**. Der
> Grund überlebt also unverändert, nur der Satz muss nachgezogen werden. **Das ist kein
> stilles Überschreiben, sondern der Fall, für den Regel 58 gebaut ist.**

---

#### Was beim Bauen von 19f herauskam (2026-09-08)

**Alle sechs Entscheidungen sind gebaut, kein neuer Baustein von außen, kein neuer
Build.** Belege `ab01`–`ab08` im Projektordner, nachgemessen auf 360 × 600 und
390 × 844. Typecheck sauber, `eslint` ohne neuen Befund (die vier bestehenden sind
älter), keine Konsolenwarnung. Sieben Dinge sind daran wichtiger als das Aufräumen:

1. **Der Post-Screen passt jetzt auf EINEN Bildschirm — das war vorher nicht so.**
   Auf 360 × 600 stand er zugeklappt bei 600 von 600 px; aufgeklappt sind es 1041.
   Vorher musste man in jedem Fall scrollen, um „Bin dabei" zu sehen. **Das ist der
   eigentliche Ertrag von Entscheidung 51**, und er war im Voraus nicht angekündigt:
   Gemeint war „weniger sehen", herausgekommen ist „nicht mehr scrollen müssen für
   das, weswegen man da ist".

2. **Zwei Stellen musste ich innerhalb von Entscheidung 51 selbst entscheiden — sie
   stehen hier, damit Ian sie überstimmen kann.**
   - **Der Kategorie-Chip ist geblieben**, aber in derselben ZEILE wie der Pfeil.
     Ians Satz war *„Sport, Zurück, Sport, Tennis spielen — alles untereinander"* —
     das Wort *untereinander* ist der Befund, nicht das Wort *Sport*. Die sechs
     Kategoriefarben sind seit Phase 14 das Erkennungszeichen der App, und der Chip
     ist auf diesem Screen die einzige Stelle, die noch eine trägt. Weggenommen ist
     die Zeile, die er verbraucht hat.
   - **Die Notiz des Verfassers („Lea schreibt: Hab zwei Schläger dabei…") liegt
     jetzt hinter „Mehr ansehen".** Das ist die wörtliche Lesart von *Titel, Person,
     Knopf* — und die Stelle, an der ich am wenigsten sicher bin: Eine Notiz ist das
     Persönlichste am Post und könnte genau das sein, was jemanden zusagen lässt.
     Sie zurückzuholen ist ein Verschieben um vier Zeilen.

3. **Was NICHT hinter „Mehr ansehen" liegt, ist der Beweis dafür, dass die Grenze aus
   Entscheidung 50 ernst gemeint ist.** Zeit und Ort stehen als eine leise Zeile unter
   dem Knopf (`Heute 21:30 · 1220 Wien`) — an ihnen entscheidet man ja gerade. Und im
   Aufgeklappten stehen sie **nicht noch einmal**: Dieselbe Angabe zweimal ist genau
   das, was Ian aufgefallen ist.

4. **Der Beweis für Entscheidung 55 wäre fast an einem verstellten Messgerät
   gescheitert.** Ein `browser_resize` auf 360 × 420 bewirkte **gar nichts** — die App
   misst ihre Höhe seit dem 2026-09-06 über `window.visualViewport`, und Playwrights
   Viewport-Wechsel löst dessen `resize`-Ereignis nicht aus; `--ss-hoehe` stand weiter
   auf 600 px. Erst das Setzen der CSS-Variablen von Hand hat die Tastatur echt
   nachgestellt: sichtbare Fläche **386 → 206 px**, und die Liste sprang von 0 auf ans
   Ende. **Zweite Fassung der 19b-Lehre — vor der Fehlersuche im eigenen Code prüfen,
   ob das Messgerät verstellt ist.**

5. **`onFocus` allein hätte Entscheidung 55 NICHT erledigt, und das ist der lehrreiche
   Teil.** Beim Antippen des Feldes ändert sich der **Inhalt** der Liste nicht, nur das
   **Fenster** darauf — `onContentSizeChange` schweigt also zu Recht. Der Fokus kommt
   außerdem VOR der fertig hochgefahrenen Tastatur. Deshalb tun es zwei Handgriffe:
   `onFocus` springt sofort (sonst steht die Liste eine Animation lang sichtbar
   falsch), `onLayout` an der Liste holt nach, wenn die Fläche wirklich kürzer ist.
   Beide rufen dieselbe Funktion `nachUnten()` — drei Anlässe, eine Stelle.

6. **Entscheidung 52 kostet Trefferfläche, und die ist bezahlt statt behauptet.** Aus
   Pfeil-plus-Wort (rund 90 × 26 pt) wären 22 × 22 geworden — ein Viertel von Apples
   Mindestmaß. `SsBack` ist jetzt **44 × 44 auf allen 14 Screens nachgemessen**, und
   der Pfeil sitzt darin **links oben ausgerichtet statt zentriert**: So bleibt er in
   einer Flucht mit dem Inhalt darunter, und die Fläche wächst nach rechts und unten,
   wo Platz ist. Ein zentrierter Pfeil hätte einen negativen Rand gegen den Seitenrand
   von `SsScreen` gebraucht — und genau das ist in Phase 12 schon einmal
   schiefgegangen. Derselbe Bau beim Gruppen-Knopf im Chats-Register (rechtsbündig,
   44 × 44, rechte Kante bei genau 16 px).

7. **Der Umschalter aus Entscheidung 54 brauchte drei Icons, die es nicht gab** —
   `stapel`, `liste`, `karte` in `theme/icons.ts`. `liste` ist bewusst **nicht** `menu`:
   Die drei Striche bedeuten in dieser App seit dem 2026-09-02 „Mehr einstellen" (Ians
   Wahl). Dasselbe Zeichen für zwei Dinge ist genau die Unschärfe, gegen die eine
   Icon-Datei gebaut ist. **In der Werkstatt (`/bausteine`) tauchten alle drei von
   selbst auf**, weil die Galerie aus `Object.keys(ICONS)` liest — das ist der Ertrag
   der Trennung Daten/Zeichner aus Phase 14, drei Wochen später eingelöst.

**Zwei Sachen sind ausdrücklich NICHT angefasst worden:**
- **Das Nachrichtenfeld über „Bin dabei" steht weiter offen.** Nach Entscheidung 50
  wäre der Gedanke naheliegend, es erst nach dem Zusagen zu zeigen — wie die
  Antwort-Leiste im Wischstapel (Entscheidung 8). Das ist aber eine SIEBTE
  Entscheidung und stand in keinem Plan; sie gehört Ian, nicht mir.
- **Die Höhe des Umschalters bleibt 35 pt** und damit unter Apples 44. Das ist so seit
  Phase 19b und war nie Teil einer Rückmeldung; hier eine Zahl zu ändern, hieße die
  Kapsel-Form aus 19e-2 anzufassen — und die steht in 19g ohnehin zur Debatte.

**Harte Regel 34 ist nachgezogen, nicht überschrieben** (harte Regel 58): Ihr Wortlaut
sagte *„der Weg zu `/gruppen` liegt am Profil"*, ihr GRUND war *„eine Gruppe wird kein
eigener Ort"*. Ein Knopf in einer Kopfzeile schafft weder Tab noch Feed — der Grund
überlebt unverändert. Der Knopf führt auf `/gruppen` und **nicht** direkt auf
`/gruppe/neu`: „Gruppe erstellen" ist dort das erste Element, und die Liste ist der
einzige Weg zu den Gruppen, in denen man schon ist.

---

### Phase 19g — Die Karte fertig machen ✅ *(gebaut am 2026-09-08, ohne neuen Build)*

Hier liegt Ians stärkste Formulierung: *„Bitte wirklich Liquid Glass machen, dass es
genauso aussieht wie das Original. Ganz wichtig."*

**Der Befund vorweg: das Glas IST echt** (siehe oben). Was fehlt, ist die Form — und
die Ursache ist eine **Kollision zweier eigener Entscheidungen aus derselben Nacht**:

> 19e-1 hat das Blatt gebaut, das unten am Bildschirm sitzt. 19e-2 hat die Tab-Leiste
> zu einer **freistehenden Kapsel** gemacht, die 24 pt über dem unteren Rand schwebt —
> und `SsBlatt.unten` weicht ihr aus (harte Regel 62: *was fest steht, weicht ihm aus*).
> **Damit endet das Blatt mitten im Bild**, und darunter läuft die Karte weiter. Genau
> das meint Ian mit *„unten ist es so abgeschnitten … das sieht echt scheiße aus"*.
> Bei Apple Karten gibt es diesen Fall nicht: Dort läuft das Blatt bis an die Unterkante
> und es gibt **gar keine Tab-Leiste**.
>
> **Zwei Auswege, und sie schließen einander aus:**
> **(a)** Das Blatt läuft bis zur Unterkante, die Kapsel schwebt darauf — Glas auf Glas.
> Nah am Vorbild, aber zwei Glasflächen übereinander sind genau das, wovor die Doku von
> `expo-glass-effect` warnt (sie summieren sich zu Milch).
> **(b)** Das Blatt läuft bis zur Unterkante und die Kapsel wird **Teil des Blattes**,
> wie bei „Wo ist?" — dort sitzen die Register IM Blatt.
> **Meine Empfehlung ist (b)**, weil sie ohne Glas-auf-Glas auskommt und die Kapsel
> mitfährt statt zu schweben. **Das ist aber eine Formfrage, und Ian urteilt am Bild** —
> gebaut wird sie als Vorschau, nicht als Tatsache.

#### Ians Screenshot vom 2026-09-08, ausgemessen — EINE Ursache für fast alles

*(iPhone 16, 393 × 852 pt. **Das Bild selbst liegt als `fehler-blatt-glas-393x852.png`
im Projektordner** — Ian hat es gespeichert, weil der Chat danach gelöscht wurde. Wer
hier arbeitet, sieht es sich an; die Zahlen unten sind daraus abgelesen.)*

**Das Blatt ist DURCHSICHTIG, und das erklärt fast jede seiner Beschwerden auf einmal.**
Auf dem Bild liest man **Achau, Himberg, Laxenburg, Gumpoldskirchen, Baden,
Oberwaltersdorf** — allesamt südlich von Wien — **quer durch das Blatt hindurch**. Die
Kartenbeschriftungen laufen durch die Liste.

**Der Fehler ist meiner, und er hat einen Namen:** In 19e-2 steht als Punkt 3 die
Entscheidung *„Das Blatt ist EIN Material"* — mit dem ausdrücklich angenommenen Preis
*„Die Liste liegt auf mattiertem Glas; `regular` ist dick genug, dass der Text steht."*
**Genau dieser Satz ist nie auf echtem Glas geprüft worden.** Belegt wurde er auf Web
und auf `glasErsatz` — also auf einer deckenden hellen Fläche, wo die Frage gar nicht
entstehen kann. Apples echtes Liquid Glass ist **erheblich durchlässiger** als der
Ersatz. *(Zweite Fassung der 18d-Lehre: Eine Regel, die nichts vorfindet, sieht aus wie
eine Regel, die tut — hier war es eine Prüfung, die das Falsche vorfand.)*

**Daraus folgt der Rest ohne weitere Ursache:**
- **Die Apple-Nennung („Maps · Legal", y ≈ 659 pt) und die CC-BY-Zeile (y ≈ 695 pt)
  liegen INNERHALB des Blattes** (Oberkante y ≈ 510 pt) und scheinen hindurch. Sie waren
  richtig platziert, solange das Blatt deckte. **Entscheidung 58 ist damit nicht nur ein
  Wunsch, sondern eine Lizenzfrage:** Eine Nennung, die hinter Glas mit Text darüber
  liegt, ist keine.
- **Der „Ganz Wien"-Knopf (y ≈ 660–685 pt)** liegt ebenfalls hinter dem Blatt — er ist
  nicht weg, er schimmert durch. Genau deshalb wirkt **Entscheidung 59** („bei
  aufgezogenem Blatt verschwinden") richtig.
- **„Unten abgeschnitten"**: Weil das Blatt durchsichtig ist, sieht man seine Unterkante
  gar nicht — es hört einfach auf. Die Tab-Kapsel (y ≈ 792–836 pt) schwebt darunter, und
  darunter läuft wieder Karte. Drei Materialien auf 60 pt.

> **Was daraus für 19g folgt — und es ändert die Reihenfolge:** Die Formfrage
> (Kapsel im Blatt oder darüber) ist **nachrangig**. Zuerst muss das Blatt LESBAR
> werden. Zwei Stellschrauben, beide ohne neuen Baustein:
> **(1)** `GLAS_STIL` von `regular` auf einen dichteren Wert, bzw. eine deckende
> Trägerfläche UNTER der Liste und Glas nur am Kopf — das nimmt Punkt 3 aus 19e-2
> zurück, und zwar begründet: *Ein Material, durch das man den Untergrund liest, ist
> für eine Textliste das falsche.*
> **(2)** Apple selbst macht es so: In Karten ist das Blatt **oben Glas und unten
> deckend**, sobald Inhalt kommt. Die Naht, die ich in 19e-2 als Fehler beschrieben
> habe, ist bei Apple keine — sie liegt dort nur an einer anderen Stelle.
> **Das ist der Punkt, an dem Ian am Bild urteilt.** Als Vorschau bauen, nicht als
> Tatsache.

**Zwei handfeste Layout-Fehler, am Bild nachgemessen, unabhängig vom Glas:**
- 🐞 **Der Filter-Knopf liegt AUF der Suchzeile.** Schwarzer Knopf x ≈ 268–377 pt,
  y ≈ 538–576 pt; die Suchzeile beginnt bei y ≈ 558 pt. Der Platzhalter bricht als
  „Suchen — Tennis, lernen, k…" ab, und **darunter steht das eigentliche Eingabefeld als
  leerer weißer Balken** (y ≈ 565–578 pt). Auf 390 × 844 im Browser fällt das nicht auf —
  ein weiterer Fall von „zwei Stilwerte, die einzeln stimmen".
- 🐞 **Der 14. Bezirk greift über die Stadtgrenze.** Im Westen deckt die Fläche
  Purkersdorf und Mauerbach mit ab, also Niederösterreich. Das ist Ians *„beim
  Vierzehnten sieht's ganz komisch aus"*. Verdacht: die Vereinfachung aus 19b
  (118.683 → 886 Punkte) hat an einer langen, dünnen Ausbuchtung zu grob gerundet.
  **Gegen die amtlichen Daten nachrechnen, nicht nach Augenmaß korrigieren** —
  `scripts/bezirke-bauen.py` liegt vor, und `data/wien-bezirke.ts` ist erzeugt
  (harte Regel 48: nicht von Hand ändern).

**Und ein dritter Befund, den Ian nicht genannt hat:** Die Karte öffnet auf dem Gerät
mit **Stockerau, Korneuburg, Schwechat und Baden** im Bild — Wien füllt vielleicht 40 %
der Höhe. In 19e-2 wurde das als „kein Fehler" abgehakt (`KARTE_MIN_BAND = 0.5` lässt
die Karte absichtlich hinter das Blatt laufen). **Das war für den Web-Prototyp richtig
und ist am Gerät trotzdem zu viel** — und es passt zu seinem Satz *„es ist noch zu viel
auf dem Bildschirm"*. Gehört mit in 19g.

**Entscheidung 57 — die Blase kommt zurück.** Ian: *„Wenn man auf einen Bezirk klickt,
sollten über dem Finger die verschiedenen Posts kommen. Und wenn's mehrere sind, kann
man draufklicken — dann kommt das Blatt und man kann sich's genau anschauen."*
**Das ist wörtlich `KartenBlase` aus Phase 19c**, die Entscheidung 46 aus der Anzeige
genommen hatte. **Sie ist noch da** — harte Regel 51 sagt seit dem 2026-09-07: *„Ein
Aufruf holt sie zurück. Wer sie löscht, wirft sie weg."* Genau dieser Fall ist jetzt
eingetreten, elf Tage später. Es bleibt trotzdem Arbeit: Der Weg *Blase → Blatt* ist neu.

**Entscheidung 58 — Apples Nennung steht direkt über dem Blatt und ist immer sichtbar.**
Heute weicht die Zeile dem Blatt aus (harte Regel 60) und wandert dabei. Ian will sie
**fest über der Blattkante**, mitfahrend. Das ist keine Geschmacksfrage: Eine
Namensnennung, die niemand sieht, ist keine — und MapKits Nennung ist Lizenzbedingung.

**Entscheidung 59 — „Ganz Wien" verschwindet, wenn das Blatt aufgezogen ist.** Sein
Argument ist das Prinzip aus Entscheidung 50: Wer gerade eine Liste liest, braucht den
Knopf nicht, der die Karte zurücksetzt.

**Entscheidung 60 — Übergänge poppen leicht auf.** *„Es ist ja jetzt eigentlich instant
— vielleicht, dass es so rauspoppt, so eine leichte Transition, die man fast gar nicht
merkt."* Gilt für Blase, Blatt-Rastung und das Umschalten der Ansicht. `Animated` reicht,
kein neuer Baustein (harte Regel: Native-Module bleiben draußen, ACTA-Falle).

**Dazu zwei Fehler, die keine Entscheidung brauchen:**
- 🐞 **Die Bezirksgrenzen sind ungleich, der 14. sieht kaputt aus.** Ians Worte: *„diese
  schwarzen Linien sind nicht immer gleich, beim Vierzehnten sieht's ganz komisch aus."*
  Verdacht: ein Rest aus der Vereinfachung in 19b (118.683 Punkte → 886). **Nicht raten
  — gegen die amtlichen Daten nachrechnen**, der Generator liegt als Skript vor.
- 🐞 **Die Karte nach oben wischen sieht komisch aus.** Ian schickt einen Screenshot;
  **ohne ihn wird daran nicht gearbeitet.** Ein Bild, das falsch aussieht, ist noch kein
  Fehler (die Lehre aus 19e-2, `KARTE_MIN_BAND`) — erst recht keiner, den man ohne das
  Bild sucht.


#### Was beim Bauen von 19g herauskam (2026-09-08)

**Der Kern der Phase steht in einem Satz: Fast alles, was Ian aufgezählt hat, war
EIN Fehler — und es war ein anderer als der, den dieser Plan vermutet hat.**

Gearbeitet wurde diesmal nicht am Bild, sondern **am laufenden iPhone-Simulator**
(iOS 26.5, iPhone 17 Pro, Debug-Build mit Metro — also jede Änderung eine Sekunde
später sichtbar, ohne neuen Build). Belege `ac01`–`ac09` im Projektordner.

---

**1. Ian benutzte eine ÄLTERE Fassung, als sein Bild entstand — und das war der
erste Fund.** Auf `fehler-blatt-glas-393x852.png` trägt der Umschalter noch die
WÖRTER „Stapel · Liste · Karte" und der Filter-Knopf noch das Wort „Filter".
Entscheidung 53 und 54 (Phase 19f) haben beides am selben Tag ersetzt. **Damit
erledigt sich der erste der beiden „handfesten Layout-Fehler" oben von selbst:** Der
Filter-Knopf lag nicht auf der Suchzeile, er war der ALTE, breite Knopf — nachgemessen
109 pt breit gegen heute 44. Auf dem heutigen Build sitzen Feld und Knopf in einer
Zeile. **Wer einen Screenshot bekommt, fragt zuerst, welche Fassung darauf zu sehen
ist.**

**2. Das Blatt war nicht durchsichtig — es war bei zugezogenem Blatt GAR NICHT DA.**
Das ist die eigentliche Ursache, und sie ist reproduziert (`ac01`, dasselbe Bild wie
Ians, erzeugt durch Zuziehen des Blattes):

> Bei der Stufe `zu` ist `koerperHoehe` gleich **null**. Ein React-Native-`View`
> **klippt seine Kinder nicht** — `overflow: visible` ist die Voreinstellung. Suchzeile,
> Kategorien und Liste liefen also aus dem Blatt heraus und wurden **ohne jeden
> Untergrund auf die nackte Karte gezeichnet**. Die Glasfläche war nur so hoch wie
> Kopf plus Körper, endete also nach dem Kopf; darunter lag Karte.

Daraus folgt Ians ganze Liste ohne weitere Ursache: das „unten abgeschnitten", der
Text quer durch die Liste (das war die Karte selbst), die Apple-Nennung und die
CC-BY-Zeile „hinter" dem Blatt (sie lagen daneben), und der weiße Balken unter dem
Suchtext (das Feld, halb im Nichts).

**Die 19e-2-Entscheidung „das Blatt ist EIN Material" war also richtig; falsch war
die Annahme, das Glas sei zu dünn.** Nachgemessen bei halb offenem Blatt (`ac03`):
Der Text steht, die Karte darunter ist zu Farbe verwischt. `GLAS_STIL` bleibt
`regular` — die im Plan vorgeschlagene Stellschraube (1) wurde **nicht** gebraucht.

Behoben mit drei Zeilen in `SsBlatt`, und jede beantwortet eine andere Frage:
- `styles.huelle` bekommt `overflow: 'hidden'` — das Blatt zeichnet nie unter seine
  Unterkante. *(Das `overflow` am Blatt selbst half nicht: Es klippt auf DESSEN
  Kasten, und darin liegt alles ordnungsgemäß. Geklippt werden muss auf die Höhe,
  die man SIEHT.)*
- Die Glasfläche bekommt `flex: 1` — sie füllt immer das ganze Blatt, auch **während**
  des Ziehens, wo die sichtbare Fläche wächst und der Inhalt nicht.
- Der Körper bekommt `overflow: 'hidden'` und bei `zu` die Höhe null. **`zu` heißt zu.**

Dazu ein vierter Punkt, der erst beim Ausprobieren auffiel: Zieht man aus `zu` nach
oben, wuchs ein LEERES Blatt und der Inhalt erschien erst beim Loslassen. Der Körper
bekommt deshalb **während der Geste** die Höhe der obersten Stufe (`ziehen`) — zwei
Layouts je Zug statt sechzig je Sekunde, die Begründung von 19e-1 bleibt gültig, sie
war nur einen Fall zu eng gefasst.

**3. Die Formfrage ist entschieden, und zwar am Bild: (a), nicht (b).** Das Blatt
läuft bis an die Unterkante, die Tab-Kapsel liegt **darauf**. Beide oben genannten
Wege wurden gebaut und angeschaut:
- **(b) „Kapsel im Blatt" scheidet praktisch aus** — die Kapsel gehört allen vier
  Tabs, nicht nur der Karte. Sie in ein Blatt zu verlegen, das es nur auf einem
  Screen gibt, hieße zwei Tab-Leisten zu bauen.
- **Die Sorge „Glas auf Glas wird Milch" hat sich am Gerät NICHT bestätigt** (`ac02`,
  `ac07`): Die Kapsel steht sauber lesbar auf dem Blatt. Sie war begründet, aber sie
  war eine Vermutung; jetzt ist sie gemessen.

Der Preis war eine neue Prop: `SsBlatt.unten` ist zu **`SsBlatt.fuss`** geworden.
Vorher hörte das Blatt über der Kapsel auf; jetzt ist der Wert der **Sockel der
untersten Raststufe**, damit der Griff bei zugezogenem Blatt nicht dahinter liegt.
Harte Regel 62 gilt unverändert — der Sockel IST das Ausweichen —, und was scrollt,
scrollt unter das Glas: Die Liste im Blatt bekommt `paddingBottom` in Höhe der
Kapsel, am Scroll-INHALT und nicht an der Fläche.

**4. Entscheidung 58 kollidiert mit MapKit, und die Nennung gewinnt.** MapKit
zeichnet Logo und Rechtelink selbst — an den unteren Rand seines gepolsterten
Bereichs. Es gibt also **einen** Regler (`mapPadding`) für **zwei** Fragen: wo Wien
sitzt und wo die Nennung sitzt. Bis heute folgte die Polsterung `KARTE_MIN_BAND`;
nachgerechnet lag Apples Nennung bei halb offenem Blatt **122 Punkte hinter der
Blattkante**. Solange das Blatt durchsichtig war, sah das nach einem
Schönheitsfehler aus — mit deckendem Blatt wäre die Nennung schlicht **weg**, und
das ist eine Lizenzfrage. Die Polsterung folgt jetzt dem Blatt (`NENNUNG_MIN_KARTE`
als Untergrenze); bei ganz aufgezogenem Blatt ist von der Karte nur ein Streifen da,
dort darf die Nennung mit ihr verschwinden.

**5. Der teuerste Fund der Phase, und er erklärt Ians „zu viel auf dem Bildschirm":
`minZoomLevel` hat die Karte eine Sekunde nach jedem Einpassen wieder aufgerissen.**

`react-native-maps` erzwingt diese Grenze auf iOS **nicht** über MapKits
`cameraZoomRange`, sondern über eine eigene Nachrechnung: `applyLegacyZoomConstrains`
läuft nach JEDER Ausschnittsänderung, rechnet aus Kartenbreite und `region.span` eine
Zoomstufe und setzt den Ausschnitt hart neu, wenn sie unter der Grenze liegt
(`AIRMapManager.m`, `getZoomLevel`). **Diese Rechnung kennt `mapPadding` nicht.**
Gemessen im Protokoll:

```
region 0.5641   ← richtig eingepasst, Wien füllt den freien Streifen
region 2.2032   ← eine Sekunde später, viermal so weit heraus
```

Der richtige Ausschnitt ergibt über die volle Kartenhöhe gerechnet **8,97**, die
Grenze stand auf **9**. `APPLE_ZOOM_MIN` ist deshalb auf **8** gesenkt — mit Abstand,
weil jede künftige Änderung an der Polsterung die gerechnete Stufe mitverschiebt.
**Am Bild war das nicht zu sehen**, es sah aus wie ein falscher `initialRegion` und
steht oben genau so im Plan; entschieden hat es die Zahlenfolge.

Dazu kommt ein Effekt, der Wien beim Aufschlagen **neu einpasst**, sobald sich die
Polsterung ändert (`animateToRegion`, 280 ms — Entscheidung 60). Ohne ihn zoomt
MapKit beim ersten Setzen des Blattrands heraus, und die Wirkung multipliziert sich.
Er läuft nur, solange niemand die Karte selbst angefasst hat.

**6. „Hat jemand die Karte angefasst?" darf NICHT aus dem Ausschnitt kommen.** Der
naheliegende Weg war `verschoben` — dieselbe Frage, die den „Ganz Wien"-Knopf
einblendet. Als Bedingung fürs Einpassen ist sie falsch: Solange Wien noch nicht
richtig eingepasst IST, steht der Ausschnitt weit daneben, die Bedingung ist also
genau dann erfüllt, wenn sie es nicht sein darf — und das Einpassen fände nie statt.
**Auf Ians Bild sieht man dieselbe Ursache von der anderen Seite: Der „Ganz
Wien"-Knopf stand da, ohne dass er die Karte angefasst hatte.** Jetzt meldet
`onPanDrag` echte Finger. (`isGesture` an `onRegionChange` wäre die direktere
Auskunft — die gibt es in `react-native-maps` **nur für Google Maps**, nachgesehen in
der Typdatei, nicht vermutet.) Der benannte Preis: Ein reines Kneifen ohne jedes
Schieben bleibt unerkannt.

**7. Der 14. Bezirk ist in Ordnung — die Vermutung oben ist WIDERLEGT.** Der Plan
verdächtigte die Vereinfachung aus 19b und verlangte, gegen die amtlichen Daten
nachzurechnen. Genau das ist geschehen: Die 3 MB von data.wien.gv.at geladen, den
14. Bezirk projiziert und Punkt für Punkt gegen `wien-bezirke.ts` gehalten.

| Ort | amtlich | erzeugt |
|-----|---------|---------|
| Purkersdorf | außerhalb | außerhalb |
| Mauerbach | außerhalb | außerhalb |
| Gablitz | außerhalb | außerhalb |
| Wolfersberg | innerhalb | innerhalb |
| Hadersdorf | innerhalb | innerhalb |
| Hütteldorf | innerhalb | innerhalb |

Die Bounding-Box weicht um **0,4 Rastereinheiten** ab, das sind rund **12 Meter**.
Am Gerät liegt der Umriss auf Apples eigener Stadtgrenze (`ac03`, westlicher
Ausschnitt). **Der Bezirk sah komisch aus, weil die Karte viermal zu weit heraus
stand** — bei diesem Maßstab fällt der lange dünne Westzipfel zu einem Klumpen
zusammen, und Purkersdorfs Beschriftung rutscht darüber. Mit Punkt 5 ist es weg.
**Das ist die Lehre aus 19e-2 zum zweiten Mal: Ein Bild, das falsch aussieht, ist
noch kein Fehler.**

**8. Die Blase ist zurück (Entscheidung 57) — und harte Regel 51 hat sich bezahlt
gemacht.** Sie sagte am 2026-09-07: *„Ein Aufruf holt sie zurück. Wer sie löscht,
wirft sie weg."* Elf Tage später ist der Fall eingetreten, und es war wirklich ein
Aufruf. Zwei Dinge waren trotzdem Arbeit:
- **Der Anker rechnete gegen die falsche Fläche.** Er nahm den Platz bis zum
  Bildrand; im Vollbild ist das falsch, denn oben steht die Leiste und unten das
  Blatt. In BEIDEN Zeichnern berichtigt. Solange der Slot leer stand, fiel es
  niemandem auf.
- **Ein leerer Bezirk bekam eine leere Blase** — ein weißer Balken mit Pfeil über der
  Stadt. Jetzt bekommt er keine; die Antwort „hier ist nichts los" gibt der Blattkopf.

**Der Weg Blase → Blatt ist neu und Ians eigentlicher Wunsch:** „alle 4 ansehen"
zieht das Blatt auf `ganz` (`ac05` → `ac06`), statt wie in 19c in die Listenansicht
zu wechseln. Technisch ist das eine **einmalige Bitte**, die sich selbst zurücknimmt:
`SsBlatt.mindestens` wirkt, wenn es sich ÄNDERT — bliebe „ganz" stehen, käme die
zweite Bitte nicht an.

> ❓ **Eine Auslegung ist meine und wartet auf Ians Urteil** (blockiert nichts): Sein
> Satz *„wenn's mehrere sind, kann man draufklicken — dann kommt das Blatt"* lässt
> offen, ob **eine Zeile** der Blase das Blatt öffnen soll oder nur die Fußzeile.
> Gebaut ist: Zeile → Post-Detail (das ist 19c, von ihm abgenommen), Fußzeile →
> Blatt. **Er urteilt am Bild: `ac05` und `ac06` herzeigen.**

**9. Ohne einen vierten Post im 7. Bezirk wäre der ganze Weg unsichtbar geblieben.**
Die Fußzeile „alle N ansehen" steht nur da, wenn NICHT alles in die Blase passt
(`BLASE_MAX` = 3) — und kein Bezirk hatte mehr als drei Posts. Auf einem großen Handy
wäre die Zeile nie erschienen. `p19` in `mock.ts` ist die **dritte Fassung der Lehre
aus 18c/18d**: Nach dem Bauen nicht fragen „läuft der Code?", sondern „welche Daten
bringen ihn zum Sprechen?"

**10. Entscheidung 60 hat eine Grenze, und sie steht in den eigenen Regeln.** Das
Blatt fährt beim Öffnen der Karte jetzt von unten herauf, die Blase poppt aus dem
angetippten Bezirk heraus (Ursprung an der Spitze — skalierte sie um ihre Mitte,
zeigte sie einen Wimpernschlag lang auf den falschen Ort), und der Kartenausschnitt
wechselt in 280 ms. **Was NICHT eingeblendet wird, ist die Ansicht als Ganzes:**
harte Regel 61 sagt, `opacity` unter 1 schaltet echtes Liquid Glass ab. Ein
Einblenden hätte also ein Blatt OHNE Glas eingeblendet und am Ende hart umgeschaltet
— ein Übergang, der schlechter ist als gar keiner. Verschieben und Skalieren berühren
den Effekt nicht, Deckkraft schon.

**11. Was NICHT bearbeitet wurde, und warum:** *„Die Karte nach oben wischen sieht
komisch aus."* Ohne Ians Screenshot wird daran nicht gearbeitet — so steht es oben,
und Punkt 7 ist der Beleg dafür, dass die Regel richtig ist.

**Nachgemessen:** iOS 402 × 874 (alle drei Raststufen, Blase, Blase → Blatt), Web
360 × 600 und 390 × 844 (Stapel · Liste · Karte, alle vier Tab-Knöpfe frei, kein
abgeschnittener Text, das Blatt bei `zu` sauber geklippt). `npx tsc --noEmit` sauber.

---

---

### Phase 19h — Nähe statt Filter · **19h-1 ✅ (2026-09-08, ohne Build) · 19h-2 ✅ (2026-09-09, mit Build)**

**Entscheidung 61 — der Heimatbezirk ist die Grundlage, der Standort kommt optional
dazu.** Ian über den Bezirks-Filter: *„Bezirk ist too viel, das sieht echt nicht gut
aus."* Sein Gegenentwurf ist kein besserer Filter, sondern **gar keiner**: Man gibt am
Anfang seinen Bezirk an, und die App zeigt von dort aus nach außen — *„und dann entfernt
man sich immer weiter."*

**Das zerfällt in zwei Schritte, und die Trennung ist dieselbe wie „Gerät vor Backend":**
- **19h-1 (ohne Build):** `User.district` gibt es seit Phase 2, es ist Pflichtfeld. Aus
  Bezirksnummern eine Nachbarschaft zu machen ist reine Rechnung — die Mittelpunkte
  liegen seit 19b in `data/wien-bezirke.ts`, und seit 19d-1 lassen sie sich über
  `PROJEKTION` in echte Koordinaten umrechnen (harte Regel 53). **Kein neues Feld.**
- **19h-2 (neuer Baustein, neuer Build):** `expo-location`. Erlaubnis-Dialog, ein
  Eintrag in Apples Datenschutz-Angaben, und **harte Regel 47 wird hier scharf**: Was
  die App über den Aufenthalt einer Person weiß, sagt sie nur dieser Person. Ein
  Standort darf die Reihenfolge im Feed bestimmen — er darf nirgends stehen.

**Die Suche bleibt vorerst**, aber kleiner (*„das lassen wir mal … oder vielleicht schon,
aber einfach kleiner"*). Das ist ausdrücklich keine feste Entscheidung.

#### Was beim Bauen von 19h-1 herauskam (2026-09-08)

Belege `ad01`–`ad10` im Projektordner, nachgemessen auf 360 × 600 und 390 × 844.
**Drei neue Entscheidungen von Ian, alle an diesem Abend** — und die mittlere ist die
folgenreichste des ganzen Projekts seit Phase 2.

---

**Entscheidung 62 — die Tab-Leiste trägt keine Wörter mehr.** *„unten soll der Text
auch weg, also Start, Anfragen …"* Vier Symbole, sonst nichts (`tabBarShowLabel:
false`, `TAB_SYMBOL` 22 → 26). Zwei Dinge sind daran wichtiger als der Handgriff:

1. **Die Entscheidung geht gegen sein EIGENES Vorbild.** Auf
   `vorbild-liquid-glass-bierbuddy.png` — der Grundlage von Entscheidung 41 und 43 —
   stehen die Wörter sehr wohl da: „Home · Ma… · Stats · Me", das dritte davon schon
   abgeschnitten. Entscheidung 50 ist einen Tag jünger und die allgemeinere, also
   gewinnt sie. **Das abgeschnittene „Ma…" ist nebenbei das beste Argument dafür.**
2. **Der Preis ist gemessen, nicht vermutet.** Ein Symbol ohne Wort hat für einen
   Screenreader keinen Namen. Nachgesehen in `expo-router`s `BottomTabBar.js`: Der
   eingebaute Ersatz („Start, tab, 1 of 4") entsteht **nur auf iOS**, im Browser
   bleibt der Knopf namenlos. Deshalb steht an jedem Tab ein
   `tabBarAccessibilityLabel` — dieselbe Bauart wie `SsBack` seit Entscheidung 52.
   Nachgeprüft im DOM: vier `role="tab"`, sichtbarer Text leer, `aria-label` gesetzt,
   Trefferfläche **82 × 56 pt** und alle vier frei (Apples Mindestmaß ist 44 × 44).

---

**Entscheidung 63 — die Reihenfolge des Feeds ist die Entfernung.** Das ist die
Ausführung von Entscheidung 61, und sie **ersetzt Entscheidung 1 („das Neueste
zuerst") vom 2026-08-31**. Gefragt wurde vorher, nach harter Regel 58 — eine neue
Entscheidung überschreibt keine alte Regel-Datei, ohne dass jemand gefragt hat, und
`sort.ts` trägt seit dem ersten Tag „nicht ohne Rückfrage umstellen". Drei Lesarten
seines Satzes *„und dann entfernt man sich immer weiter"* lagen ihm vor:

| | | |
|---|---|---|
| **(a)** | Umkreis, der beim Durchwischen mitwächst; innerhalb bleibt das Neueste oben | **meine Empfehlung** — Entscheidung 1 bliebe unangetastet |
| **(b)** | ✅ **die Reihenfolge selbst**: das Nächste oben, das Weiteste unten | seine Wahl |
| **(c)** | beides zusammen: Ringe UND innerhalb nach Entfernung | Entscheidung 1 gälte nirgends mehr |

**Den Haken kennt er, er stand in der Frage:** Ein frisch geposteter Post aus 1220
kommt bei jemandem aus 1070 nie mehr nach oben — genau der Haken, gegen den
Entscheidung 1 gebaut war („postet überhaupt jemand"). Was ihn kleiner macht: Die
Liste ist kurz, und Wien ist an der weitesten Stelle 29 km breit.

**Was von Entscheidung 1 bleibt, ist mehr, als es klingt:** Sie ist die **zweite
Stufe**. Bei gleicher Entfernung steht weiter das Neueste oben — und gleiche
Entfernung heißt in der Praxis *derselbe Bezirk*. Genau dort, wo man am ehesten
hingeht, gilt seine alte Regel unverändert. Sichtbar im Beleg: vier 1070er Posts
untereinander, nach dem Neuesten sortiert.

Vier Befunde aus dem Bauen:

1. **Die Rechnung war fast geschenkt, und der Grund ist die Projektion aus 19d.**
   `PROJEKTION` trägt die Kosinus-Korrektur schon in sich, also ist ein Schritt nach
   rechts im Raster genauso lang wie einer nach unten — `Math.hypot` reicht, keine
   Haversine-Formel. Eine Rastereinheit sind **29,35 m** (gegengerechnet: 776,7
   Einheiten Kartenhöhe = 22,8 km, Wien ist nord-süd 22,4 km lang). *Nebenbefund: Der
   erzeugte Kopf von `wien-bezirke.ts` sagt „rund 20 m" — das ist eine grobe Angabe
   aus dem Skript und um ein Drittel daneben.*
2. **Ein ungenutzter Parameter ist einer, den nie jemand geprüft hat.**
   `useProfilPosts` reichte seit Phase 6 `meinBezirk: person.district` durch — den
   Bezirk der ANGESCHAUTEN Person. Folgenlos, solange `vergleichePosts` seinen
   Kontext gar nicht las (er hieß dort `_ctx`, und der Unterstrich war das
   Warnzeichen). Ab dieser Phase wären Leas Posts nach der Entfernung von *Leas*
   Wohnung sortiert gewesen. Berichtigt, bevor es jemand sehen konnte.
3. **Die bekannte Ungenauigkeit ist gemessen und angenommen.** Als Bezirksmitte dient
   der Beschriftungspunkt (`label`) — der innerste Punkt der Fläche, nicht der
   Schwerpunkt. Bei den großen Flächenbezirken liegt der im Grünen: Hietzings Mitte
   sitzt im Lainzer Tiergarten, von Neubau aus kommen **8,7 km** heraus statt rund 5.
   **Angenommen, weil die Zahl nirgends steht** — sie geht nur in eine REIHENFOLGE
   ein, und die stimmt trotzdem. *Sobald jemand eine Entfernung anzeigen will („4 km
   entfernt"), ist dieser Absatz die Stelle, an der zuerst nachgerechnet werden muss.*
   Der Schwerpunkt wäre der falsche Ausweg: Bei den gebogenen Bezirken (13., 21., 22.)
   liegt er teilweise gar nicht IN der Fläche (Lehre aus 19b).
4. **Belegt wurde es durch UMSTELLEN, nicht durch Hinschauen.** Aus 1070 heraus:
   1070 ×4 → 1060 → 1040 → 1030 → 1020 → 1170 → 1190. Nach dem Umstellen auf 1220:
   1220 ×2 → 1020 → 1030 → 1040 → 1070 ×4 → 1060 → 1190 → 1100. Beide Folgen gegen
   die gerechneten Kilometer gehalten, beide monoton steigend. **Ein Sortierer, den
   man nur in einer Stellung sieht, ist nicht geprüft** — er könnte auch nach etwas
   ganz anderem sortieren, das zufällig gleich aussieht.

---

**Entscheidung 64 — der Heimatbezirk steht in den Einstellungen.** Ganz oben, vor
allem anderen: Es ist die einzige Einstellung, die verändert, was man SIEHT. Im
fertigen Produkt fragt danach das Anmelden (20.3, *„man gibt am Anfang seinen Bezirk
an"*); bis dahin ist diese Zeile der einzige Weg dorthin. **Ohne sie wäre
Entscheidung 63 am Gerät gar nicht zu beurteilen** — man müsste den Code lesen, um zu
merken, dass die Regel wirkt. Alle 23 Bezirke stehen zur Wahl, und das ist kein
Widerspruch zur Phase-15-Falle („eine Reihe mit allen 23 wäre zu 20 Teilen eine
Sackgasse"): Beim FILTER war das richtig, hier ist die Frage eine andere — man wohnt
in genau einem Bezirk, und keiner davon ist eine Sackgasse.

---

**Was NICHT gestrichen wurde, und warum:** `filter.bezirk` selbst. Harte Regel 50
sagt, was auf der Karte gewählt ist, IST der Bezirksfilter — ein Tipp auf die Karte
setzt ihn weiter, und er überlebt das Umschalten auf Stapel oder Liste. Ohne einen
Ausweg käme man damit in einen Zustand, den nur noch „Alle Filter zurücksetzen"
verlässt, also der Holzhammer, der auch Suche und Jahrgang wegwirft. **Das ist die
Grenze in Entscheidung 50** (*„wenn die Person etwas wissen will, dann soll's auch
einfach für sie sein"*): Wegräumen darf keinen Zustand ohne Ausweg erzeugen. Im
Filterblatt steht deshalb keine Auswahl mehr, sondern eine **Rücknahme** — „Von der
Karte · Nur 1100 Wien" —, und nur dann, wenn es etwas zurückzunehmen gibt (`ad10`).

**`useBezirkeImFeed` ruft seitdem niemand mehr auf und bleibt trotzdem stehen** —
dieselbe Überlegung wie bei der Kartenblase (harte Regel 51): Sie wurde in 19e-1 aus
der Anzeige genommen, elf Tage später hat ein Aufruf sie zurückgeholt, und weil
niemand sie gelöscht hatte, war es wirklich nur ein Aufruf.

**Nachgemessen:** Web 360 × 600 und 390 × 844 — kein abgeschnittener Text
(`scrollWidth > clientWidth` über alle Blattknoten), alle vier Tab-Knöpfe frei
(`elementFromPoint`), `npx tsc --noEmit` sauber. **19h-2 (`expo-location`) ist
unberührt und braucht weiter einen neuen Build.**

---

### Phase 19i — Der Bezirk als Vollbild, und das Glas überall ✅ *(2026-09-09, ohne neuen Build)*

**Ians fünf Punkte vom 09.09.2026 nachts**, nachdem die 19h-Fassung auf seinem iPhone
lief. Zwei Auslegungsfragen waren dabei offen und sind **vor dem Clear von ihm
beantwortet** — sie stehen unten bei den Entscheidungen, nicht als Vermutung.

⚠️ **Sein Handy bleibt NICHT angesteckt.** Alle fünf Punkte gehen ohne neuen
Native-Baustein (`expo-glass-effect` liegt seit 19e-2 im Binary) — gebaut und geprüft
wird am **Simulator** (iOS 26.5, dort ist echtes Liquid Glass belegt, siehe 19e-2).
**Auf sein Gerät kommt es erst beim nächsten Anstecken**, weil der Release-Build sein
JavaScript eingebacken hat.

---

**Entscheidung 65 — das Blatt auf der Karte fällt weg; ein Bezirk ist ein VOLLBILD.**
*„Die Leiste ist okay, aber würde sie ehrlich gesagt weglassen und es so machen, dass
man direkt, wenn man auf einen Bezirk draufklickt, auf ein Fenster kommt, auf den
Stapel."* **Rückgefragt und bestätigt: gemeint ist das weiße Panel (`SsBlatt`)**, nicht
die Blase und nicht die Tab-Kapsel.

Das ist die vierte Fassung dieses Screens (19e-1 Vollbild+Blatt · 19c Blase · 19g Blatt
bis zur Unterkante · jetzt). **Was daran zu bedenken ist, bevor jemand anfängt:**

- **Die Blase bleibt** — sie ist Entscheidung 57 und er hat sie ausdrücklich nicht
  genannt. Der Weg ist damit: Bezirk antippen → Blase; von dort in einen Post ODER
  über die Fußzeile („alle 4 ansehen") ins neue Vollbild. **Die 19g-Frage, ob eine
  ZEILE das Blatt öffnet, erledigt sich damit nicht — sie wird zur Frage, ob eine
  Zeile das Vollbild öffnet.** Weiter offen, weiter am Bild zu entscheiden.
- **Wo die Filter im Blatt lagen, ist jetzt nichts.** Entscheidung 42 („die Filter
  leben IM Blatt, damit die Karte frei von Bedienelementen bleibt") verliert ihren
  Ort. Der Kartenscreen hat danach oben den Umschalter und sonst Karte — was aus
  Suche und Kategorien auf der KARTE wird, ist die eine offene Frage dieser Phase.
  *Vorschlag, nicht entschieden:* Sie fallen dort weg; die Karte beantwortet „wo ist
  was los" ohnehin räumlich, und Regel 63 verlangt eine Begründung für alles, was
  im Weg steht. Der Startbildschirm behält sie (Entscheidung 66).
- **`SsBlatt` NICHT löschen** — harte Regel 51, dieselbe Lehre wie bei der Blase:
  Sie war elf Tage aus der Anzeige und kam mit EINEM Aufruf zurück. Der Baustein
  bleibt stehen, auch wenn ihn niemand mehr ruft.
- **`useTabRand()` und harte Regel 62 gelten weiter** — das Vollbild ist ein Screen
  wie jeder andere: Was scrollt, scrollt unter die Kapsel; was fest steht, weicht ihr
  aus. Der Wischstapel hat absolut positionierte Kinder, also `marginBottom`.

**Entscheidung 66 — auf diesem Fenster ist nichts außer Karten und der Bar unten.**
*„Sport und so weg, Suchleiste und Filter weg, Posten weg und drei Icons auch weg —
also man sollte nur das unten sehen können."* **Rückgefragt und bestätigt: NUR auf
diesem Fenster.** Der Startbildschirm behält Suche, Kategorien, Filter, Posten und den
Umschalter.

Das ist harte Regel 63 in Reinform — *ein Bildschirm zeigt nur, was für die
Entscheidung HIER nötig ist.* Man ist hier, weil man einen Bezirk gewählt hat; die
Entscheidung lautet „hingehen oder nicht". **Zwei Dinge, die dabei nicht untergehen
dürfen:**
- **Man muss wieder herauskommen.** Ein Vollbild ohne Zurück ist eine Sackgasse —
  `SsBack` (44 × 44, Entscheidung 52) oder ein Wisch. Das ist der zweite Halbsatz von
  Entscheidung 50 und keine Verhandlungssache.
- **Man muss sehen, WELCHER Bezirk.** Sonst sind es dieselben Karten wie am Start,
  nur ohne Bedienung. Eine Zeile („1100 Wien · 3 Posts") ist keine Verletzung von
  Entscheidung 66 — sie ist die Antwort auf „wo bin ich hier".

**Entscheidung 67 — die vier Icons in der Tab-Kapsel sitzen zu weit oben.** *„Unten
bei der Bar sind die vier Icons nicht mittig, sondern zu weit oben."* **Das ist ein
Fehler aus Phase 19h-1**, hineingekommen mit `tabBarShowLabel: false`: Der
Label-Platz wird weiter gerechnet, das Symbol sitzt in der oberen Hälfte. Zu
beheben in `(tabs)/_layout.tsx` (`tabBarItemStyle` / `tabBarIconStyle`) — **und
nachzumessen, nicht anzuschauen:** Mitte des Icons gegen Mitte der 56-pt-Kapsel, auf
360 × 600 und 390 × 844.

**Entscheidung 68 — Liquid Glass überall, und das jetzige ist noch keines.** *„Liquid
Glass soll nicht nur bei der Kartenansicht sein, sondern überall — und wie gesagt, das
du da hast, ist immer noch kein richtiges Liquid Glass."*

**Das ist die dritte Runde an derselben Sache** (19e-2 erste Fassung → Form geändert;
19g → Blatt bis zur Unterkante), und die ersten beiden Male lag es NICHT am Effekt,
sondern an Form und Untergrund. **Deshalb zuerst messen, dann ändern:**

1. **Ein Vorbild anfordern, bevor irgendetwas angefasst wird.** Bei Entscheidung 41
   und 43 war der Screenshot die Entscheidung — `vorbild-liquid-glass-bierbuddy.png`
   liegt im Projekt und hat zwei Runden lang die Fragen beantwortet, die keine
   Beschreibung beantworten konnte. **Ohne ein Bild von dem, was er „richtig" nennt,
   ist das Raten.**
2. **Prüfen, was der Simulator wirklich zeichnet.** `isGlassEffectAPIAvailable()` UND
   `isLiquidGlassAvailable()` (harte Regel 61), und ob `GLAS_STIL` = `regular` oder
   `clear` das ist, was er meint — `clear` ist deutlich durchlässiger und näher an
   Apples eigenen schwebenden Elementen.
3. **Die bekannten Abschalter durchgehen:** `opacity` unter 1 an der Fläche oder an
   einem Elternteil schaltet den Effekt ab (harte Regel 61); ein `tintColor` macht
   ihn milchig; und **echtes Glas braucht bewegten, kontrastreichen Inhalt
   dahinter** — auf einer weißen Fläche sieht selbst richtiges Liquid Glass nach
   nichts aus. Das ist der wahrscheinlichste Grund, warum es „überall" gefordert wird
   und dort erst recht nicht wirken wird: **Auf den meisten Screens liegt Papierweiß
   dahinter.**
4. **„Überall" ist deshalb eine Frage, kein Auftrag mit klarem Ziel.** Was genau soll
   Glas werden — Karten (`SsCard`), die Kopfzeilen, die Chips, die Antwort-Leiste?
   Erst Punkt 1 und 3 klären, dann ihm Möglichkeiten am Bild zeigen. **Nicht die ganze
   App verglasen und hoffen.**

---

#### Was beim Bauen von 19i herauskam *(2026-09-09)*

Belege `ae01`–`ae08` im Projektordner. **Gebaut am Simulator (iOS 26.5, Debug-Build mit
Metro) und im Browser** — Ians Handy war nicht angesteckt, wie angekündigt.

**1. Die Tab-Kapsel klebte auf iOS an BEIDEN Rändern, seit es sie gibt — und das ist
eine der Ursachen von Entscheidung 68.** `styles.bottom` der Tab-Leiste setzt
`start: 0, end: 0`; im `tabBarStyle` stand `left: 16, right: 16`. Im Style-Array kam
das später, also schien es zu gewinnen — **aber `start`/`end` und `left`/`right` sind
in Yoga zwei verschiedene Eigenschaften, und die richtungsabhängige gewinnt gegen die
absolute, unabhängig von der Reihenfolge.** Gemessen auf Ians iPhone (`IMG_0713.PNG`)
und am Simulator: Seitenrand **0 statt 16 pt**, Kapselbreite = Bildschirmbreite.

> **Warum es vier Wochen niemand gesehen hat, ist der lehrreiche Teil:** Auf Web
> stimmte es. `react-native-web` macht aus beiden Schreibweisen dieselbe
> CSS-Eigenschaft, dort gewinnt die spätere Angabe — und der 19e-2-Beleg
> `z01-web-kapsel-360.png` zeigte brav *„x = 16, 328 breit"*. **Geprüft wurde genau
> die Plattform, auf der der Fehler nicht auftritt.** Harte Regel 62 sagt wörtlich,
> eine Fläche, die an drei Kanten am Schirm klebt, sehe aus wie eine getönte Leiste;
> **auf dem einzigen Gerät, das echtes Glas zeichnet, war diese Bedingung nie
> erfüllt.** Zum dritten Mal lag es an der Form und nicht am Effekt.

**2. Entscheidung 67: Rechnung und Messung decken sich auf 0,7 pt.** Der Symbolrahmen
ist in `BottomTabItem.js` 28 pt hoch (`ICON_SIZE_TALL`), der Eintrag hat `padding: 5`
und `justifyContent: 'flex-start'`. In einer 56 pt hohen Kapsel liegt die Symbolmitte
damit bei 5 + 14 = **19** statt bei **28** — 9 pt zu hoch, und genau 9,0 pt sind auf
Ians Screenshot nachgemessen. Nach dem Ausgleich: **+0,67 pt** (der Rest ist die
Asymmetrie der Icon-Tinte, nicht des Rahmens).

> **Warum ein `marginTop` und nicht `justifyContent: 'center'`:** An die Stelle kommt
> man nicht heran — `tabBarItemStyle` landet auf dem äußeren View, das
> `justifyContent` sitzt auf dem Knopf darin, und der bekommt sein `flex: 1` von der
> Leiste. Der andere naheliegende Weg (`height`/`flex` am Symbolrahmen über
> `tabBarIconStyle`) ist falsch: **Die Zahl am Anfragen-Tab hängt mit `top: -3` an
> genau diesem Rahmen** und wäre nach oben aus der Kapsel gewandert. Ein `marginTop`
> ist der einzige Griff, der Symbol und Zahl zusammenhält.

**3. Die Fußzeile der Blase hätte den Weg ins Vollbild verschlossen — auf Ians eigenem
Screenshot ist sie nicht da.** `mitFuss` hing an `sortiert.length > zeigen`: Bei zwei
Posts, die beide in die Blase passen, gab es *„alle 2 ansehen"* gar nicht. Solange sie
ins Blatt führte, war das richtig — das Blatt konnte man auch am Griff hochziehen.
**Seit Entscheidung 65 ist sie der einzige Weg**, und ohne die Änderung wäre der
Bezirk mit den WENIGSTEN Posts der einzige gewesen, den man nicht öffnen kann.
Auf `IMG_0712.PNG` (1140 Wien, zwei Posts) sieht man genau diesen Fall.

> Der Text bleibt *„alle 2 ansehen"*, obwohl beide schon dastehen, und das ist kein
> Widerspruch: **Die Blase ist eine Vorschau (Titel und Zeit), das Vollbild der Ort,
> an dem man handelt** — dort liegen die ganzen Karten mit „Bin dabei".

**4. Das Glas LÄUFT — belegt, nicht vermutet.** Auf der Karte nimmt das Blatt einen
Grünstich vom Untergrund an (Grün minus Blau **+9,2**); eine deckende
`colors.surface`-Fläche könnte das nicht. Was fehlt, ist nicht der Effekt, sondern
**Untergrund**:

| | Kapsel hebt sich vom Untergrund ab um |
|---|---|
| Ians Vorbild (`vorbild-liquid-glass-bierbuddy.png`, dunkle Karte) | **33,2** Helligkeitsstufen |
| SimplySocial, Startbildschirm (`IMG_0713.PNG`) | **3,3** |
| SimplySocial, über der hellen Apple-Karte | **1,5** |

> **Liquid Glass zeigt sich als Unterschied zum Untergrund.** Hinter unseren Flächen
> liegt überall Papierweiß (248) oder die helle Apple-Karte (233), und das Glas nimmt
> genau diese Helligkeit an. Auf Ians Vorbild ist die Karte dunkelblau — daher die
> 33 Stufen. **„Überall" ist damit keine Bauaufgabe, sondern eine Frage nach dem
> Untergrund.** Vorgelegt am 2026-09-09; **seine Antwort: erst anschauen** (`ae01`
> Kapsel vorher/nachher, `ae06` gegen `ae07` unsere Kapsel gegen sein Vorbild).
> Gut möglich, dass die zwei Formfehler oben der ganze Grund waren — es wäre das
> dritte Mal.

**5. Der Chip „3 Posts ohne Bezirk" fällt ersatzlos weg, und das ist eine AUSLEGUNG.**
Er stand für Ians Entscheidung 31 — *eine Ansicht darf nicht **still** Posts
verschlucken.* Das Wort, auf das es ankommt, ist *still*: Gemeint war eine LISTE, in
der etwas fehlt. Seit 19i gibt es in der Kartenansicht keine Liste mehr, aus der etwas
fehlen könnte; die Karte zeigt Orte, und ein Post ohne Ort hat dort keinen.
Vollständig sind Stapel und Liste, beide einen Tipp entfernt. **Gehört ihm trotzdem
vorgelegt — es ist meine Auslegung, nicht seine Entscheidung.**

**6. Das ✕ ist mit dem Blatt weggefallen, und sein GRUND besteht weiter.** Entscheidung
49 (zweiter Tipp hebt die Auswahl auf) hatte es ausdrücklich *„zusätzlich und nicht
ersatzweise"* daneben, weil ein zweiter Tipp auf einen 14 × 11 px großen Bezirk (die
Josefstadt) nicht zuverlässig zu treffen ist. **Der Ort dafür ist weg, die Schwierigkeit
nicht.** Wenn ihn ein klebender Bezirk stört, ist der Ersatz ein kleines ✕ neben dem
Umschalter — eine Zeile. Vermerkt statt still hingenommen.

**7. Ohne Blatt zeigt die Karte MEHR Umland, und das ist Geometrie, kein Fehler.**
Wien ist breit, ein iPhone-Schirm ist hoch. Solange das Blatt die untere Hälfte deckte,
war der freie Streifen breiter als hoch und Wien füllte ihn; jetzt füllt Wien die
Breite (gemessen: bis an beide Kanten) und oben wie unten bleibt Niederösterreich
stehen. **Vor dem Reparieren die Regel nachrechnen, die das Bild erzeugt** — die
19e-2-Lehre, zum zweiten Mal an derselben Karte. Wer es enger will, muss Wien oben und
unten beschneiden, und das ist eine Entscheidung, keine Korrektur.

**8. `bezirkStapel` ist ein ZUSTAND und keine Route — wegen harter Regel 50.**
`/bezirk/[plz]` wäre der erste Gedanke und trüge die Auswahl in der Adresse; damit
stünde sie zweimal da, einmal in `filter.bezirk` und einmal im Pfad. *Was auf der Karte
gewählt ist, IST der Bezirksfilter — es gibt keinen zweiten Zustand daneben.* Nebenbei
erspart es `generateStaticParams` (harte Regel 11). Der Zustand fällt beim
Ansichtswechsel zu, der Bezirksfilter überlebt ihn.

**9. `SsBack` hat ein optionales `onPress` bekommen, und harte Regel 5 bleibt heil.**
Nicht jedes „zurück" ist ein Screen-Wechsel: Auf dem Bezirks-Vollbild führte
`zurueckOderFeed()` aus der Karte hinaus statt eine Ebene zurück. **Wer nichts angibt,
bekommt weiter `zurueckOderFeed()`** — es gibt keinen zweiten Zurück-Knopf, nur eine
Stelle, die ausdrücklich sagt, dass ihr Rückweg ein anderer ist.

**Was geprüft ist:** Vollbild auf 390 × 844 und 360 × 600 im Browser (kein waagrechter
Überlauf, Zurück-Knopf 44 × 44 und getroffen, auf dem Screen nur *Zurück · Weg · Bin
dabei* plus die vier Tabs) und auf iOS (`ae08`, SafeArea unter der Dynamic Island).
Der Weg Karte → Bezirk → Blase → Vollbild → zurück ist mit echten Zeigergesten
durchgespielt, **mit Bewegung zwischen `down` und `up`** (Phase-19e-1-Falle). Der
leere Stapel im Vollbild ist durch echtes Wischen erzeugt worden, nicht behauptet
(`ae04`) — die 18d-Lehre.

**Was NICHT geprüft ist:** der Tipp am Simulator. `osascript` verweigert den
Hilfszugriff (Fehler −25211), und die Berechtigung kann nur Ian geben
(Systemeinstellungen → Datenschutz → Bedienungshilfen). Gemessen wurde deshalb am
Simulator nur, was ohne Berührung erreichbar ist; alles Interaktive im Browser, wo die
Geometrie laut Phase 19e-2 dieselbe ist.

**Nebenbefund, vorbestehend und nicht behoben:** Wischt man im Browser die letzte Karte
weg, markiert der Zug den Text, der darunter auftaucht, blau. `WischKarte` hat
`userSelect: 'none'`, die Auswahl entsteht erst, wenn die Karte mitten im Zug
verschwindet. Trifft den Startbildschirm genauso und nur im Browser.

---

### Phase 19h-2 — Der Standort ✅ *(2026-09-09, mit neuem Build)*

**Die Ausführung von Ians Entscheidung 61**, und die erste Phase seit 19d-1, die einen
neuen Native-Baustein braucht: `expo-location@~57.0.16`. Zwei neue Entscheidungen von
ihm (69 und 70), Belege `af01`–`af06`.

#### Was gebaut ist

Ein Schalter in `/einstellungen`, direkt unter „Dein Bezirk" und im selben Block: Ist
er an, misst der Feed ab dem gemessenen Ort statt ab der eigenen Bezirksmitte. Der
Zielpunkt bleibt in beiden Fällen die Bezirksmitte des Posts.

| Datei | Was drin steht |
|---|---|
| `features/posts/standort.ts` | **die Regel** — `STANDORT_ROLLE`, `STANDORT_FRAGE`, `STANDORT_FRISCHE_MS`, `standortFolgen()` |
| `features/posts/hooks.ts` | die Ausführung — `useMeinOrt`, `standortAnschalten/-Ausschalten/-Auffrischen` |
| `lib/karte-geo.ts` | die Rechnung — `abstandVonOrtMeter()`, `bezirkAmOrt()` |
| `features/posts/sort.ts` | `SortKontext.meinOrt`, und `entfernungMeter` liest ihn |
| `features/store.ts` | die Sitzungs-Angabe `standort` (wie `weggewischt`) |

#### Ians Entscheidung 69 — der Standort ist der genauere AUSGANGSPUNKT

Drei Lesarten von „kommt optional dazu" lagen ihm vor; er nahm die wörtliche:
Der Heimatbezirk bleibt gesetzt und gilt immer, der Standort verfeinert nur, **wo**
gemessen wird. Verworfen: *nur den Bezirk setzen* (überschreibt eine Angabe, die die
Person selbst gemacht hat, für fast keinen Gewinn) und *nur auf Knopfdruck* (ein
Bedienelement mehr, gegen harte Regel 63).

**Den Haken kennt er, er stand in der Frage:** Die Reihenfolge ändert sich, ohne dass
jemand etwas getan hat — und die App darf es nicht sagen, weil sie den Standort
nirgends anzeigen darf. Die einzige Rückmeldung ist das Wort „An" in den Einstellungen.

#### Ians Entscheidung 70 — gefragt wird NUR im Schalter

Kein Dialog beim Start, keiner beim ersten Feed. Der Preis stand in der Frage und ist
angenommen: **Die meisten Leute finden den Schalter nie.** Genau deshalb ist der
Heimatbezirk die Grundlage — die App muss ohne den Standort vollständig funktionieren,
und sie tut es. Dahinter steht ein Sachverhalt, der die Wahl schwerer macht, als sie
aussieht: **iOS zeigt den Systemdialog nur ein einziges Mal.** Ein Fehlgriff in einem
Moment, in dem jemand etwas ganz anderes vorhat, kostet die Funktion dauerhaft.

#### Sechs Dinge, die wichtiger sind als der Schalter

1. **Der Zielpunkt bleibt die Bezirksmitte — und das rettet Entscheidung 1.** Ein Post
   trägt seit Phase 2 nur `district` (harte Regel 47). Genauer wird also nur die eine
   Hälfte der Rechnung. **Weil der Zielpunkt gleich bleibt, haben alle Posts eines
   Bezirks auch mit GPS exakt dieselbe Entfernung** — der Gleichstand bleibt, und die
   zweite Stufe („bei gleicher Entfernung das Neueste") greift unverändert. Gemessen im
   Browser: die vier 1070er Posts liegen alle auf 6,45 km und stehen weiter nach dem
   Neuesten. **Läge am Post eine Koordinate, wäre Entscheidung 1 still verschwunden.**
2. **`meinOrt` ist ein PFLICHTFELD in `SortKontext`, und das war die halbe Arbeit.**
   Ein `meinOrt?:` hätte alle drei Aufrufstellen stumm durchlaufen lassen — dieselbe
   Falle wie `ChatThread.postId` (16) und `Post.district` (12). Und ausgerechnet eine
   dieser drei (`useProfilPosts`) hat in 19h-1 vier Wochen lang den falschen Bezirk
   durchgereicht, **weil niemand hinsehen musste.** So hat `tsc` die Arbeitsliste
   geschrieben: drei Fehler, drei angesehene Stellen.
3. **Belegt wurde durch UMSTELLEN, wie in 19h-1 — und diesmal zusätzlich durch
   ZURÜCKSTELLEN.** Aus 1070 heraus: `1070 ×4 → 1060 → 1040 → 1030 → 1020 → 1170 →
   1190 → 1100 → 1140 ×2 → 1220 ×2`. Mit nachgestelltem Standort am Donauturm dreht
   sich alles: `1020 → 1030 → 1190 → 1220 ×2 → 1040 → 1070 ×4 → 1060 → 1170 → 1100 →
   1140 ×2`. Beide Folgen gegen die gerechneten Kilometer gehalten, beide monoton
   steigend. **Und nach dem Ausschalten steht wieder Zeichen für Zeichen die erste
   Folge da** — das ist der Beleg dafür, dass der Ort wirklich gelöscht wird und nicht
   nur ignoriert.
4. **Die bekannte Schwäche zeigt sich an einem neuen Ort.** Vom Donauturm aus steht
   **1220 nicht oben**, obwohl die Person im 22. Bezirk steht: Der Beschriftungspunkt
   der Donaustadt liegt 5,95 km weiter östlich. Das ist dieselbe Ungenauigkeit wie
   Hietzings Mitte im Lainzer Tiergarten (19h-1), nur fällt sie mit einem genauen
   Ausgangspunkt stärker auf. **Ein genauerer Ausgangspunkt macht einen ungenauen
   Zielpunkt nicht besser — er verschiebt nur, wo die Ungenauigkeit sitzt.**
   Angenommen, weil die Zahl weiterhin nirgends steht.
5. **Der dynamische Import war eine Vorsicht gegen ein Problem, das es nicht gibt.**
   Zuerst stand da `await import('expo-location')`, nach dem Muster von harter Regel 61.
   Die Regel begründet die Trennung aber mit einem `requireNativeViewManager` beim Laden
   — und `expo-location` hat **keine View, nur Funktionen**. Der Preis war dafür real:
   Der Dev-Server bündelt lazy, also wurde daraus ein NACHGELADENER Brocken, der Metro
   ausgerechnet in dem Moment braucht, in dem jemand den Schalter drückt. **Beim Prüfen
   ist genau das passiert** (Metro war unter der Last des parallelen Xcode-Builds kurz
   weg, die Seite lud neu, der Speicher war zurückgesetzt). Jetzt ein gewöhnlicher
   Import. **Eine Vorsichtsmaßnahme gegen ein Problem, das man nicht hat, ist keine
   Vorsicht, sondern eine zusätzliche Fehlerquelle.**
6. **Der Prebuild hat die Signatur-Zeilen weggeworfen — genau wie es in der Fallen-Liste
   steht.** `npx expo prebuild -p ios` (ohne `--clean`) hat `DEVELOPMENT_TEAM` und
   `CODE_SIGN_STYLE` aus `project.pbxproj` entfernt; ohne die vorher angelegte Kopie
   wäre der nächste Gerätebuild an etwas gescheitert, das am 2026-09-07 schon einmal
   gelöst war. **Die Notiz hat sich nach zwei Tagen bezahlt gemacht.** Neu dazugekommen:
   `pod install` verlangt inzwischen **`cmake`** (`hermes-engine.podspec` ruft
   `Pod::Executable::which!('cmake')`), und der Aufruf meldete den Fehler mit **EXIT 0**
   — dieselbe Familie wie „`expo run:ios` gibt EXIT 0 zurück".

#### Was geprüft ist

- **Rechnung gegen echte Orte** (die 19d-Methode, kein Round-Trip): Stephansdom → 1010,
  Schönbrunn → 1130, Donauturm → 1220, Praterstern → 1020, Hauptbahnhof → 1100,
  Grinzing → 1190, Marswiese → 1170. Sieben von sieben.
- **Der ganze Weg im Browser**, 390 × 844, per Klick statt per Navigation (die
  19h-1-Falle: ein echtes Neuladen setzt den Speicher zurück): Schalter an → Text
  wechselt auf die `'an'`-Fassung aus `standortFolgen()` → Feed sortiert um → Schalter
  aus → Feed steht wieder wie vorher.
- **iOS**: Build durch (`BUILD SUCCEEDED`, keine `error:`-Zeile), App startet,
  `ExpoLocation.framework` liegt im gebauten Bundle, und der deutsche Erlaubnis-Satz
  steht im **gebauten** `Info.plist` — nicht nur in `app.json`.
- `npx tsc --noEmit` sauber. `expo lint`: 83 Probleme vorher, 83 nachher — alle
  vorbestehend, keines aus dieser Phase.
- **Web-Bündel: 1.489.368 → 1.507.340 B, also +17.972 B (+1,21 %).**

#### Was NICHT geprüft ist

**Der echte Erlaubnis-Dialog von iOS.** Im Browser ist die Betriebssystem-Grenze
nachgestellt (`navigator.permissions.query` und `navigator.geolocation.getCurrentPosition`
überschrieben) — **genau diese eine Grenze und sonst nichts**; alles darüber,
`expo-location` eingeschlossen, ist echt gelaufen. Wie sich der Dialog auf Ians Gerät
anfühlt und ob er den Weg über die Systemeinstellungen findet, wenn er ihn einmal
wegdrückt, gehört in den nächsten Gerätedurchgang.

---

### Phase 20 — Das Backend: Supabase · **20.1 ✅ · 20.2 ✅ (2026-09-06)** · 20.3–20.8 ⬜

**Ians Entscheidung vom 2026-09-06.** Der Punkt stand seit dem 2026-08-31 in Abschnitt 8
offen und ist die folgenreichste technische Wahl des Projekts.

#### Warum Supabase und nicht Firebase — die eine Frage, an der es hing

Die zentrale Regel dieser App ist ein **Zeilenfilter**:

> Ich sehe einen Post, wenn er öffentlich ist ODER ich dem Verfasser folge ODER ich in
> seiner Gruppe bin — und wenn wir uns nicht gegenseitig blockiert haben.

**Firestore kann diese Regel nicht durchsetzen**, und das ist keine Meinung, sondern
dokumentiertes Verhalten: *„Security rules are not filters."* Eine Abfrage wird gegen
ihre **mögliche** Ergebnismenge geprüft, nicht gegen die tatsächlichen Zeilen. Könnte
`posts` auch nur ein Dokument liefern, das ich nicht sehen darf, schlägt die **ganze**
Abfrage fehl. Der Feed ist damit nicht abfragbar, solange auch nur ein Follower-Post
darin liegt.

Der übliche Ausweg ist Denormalisierung: an jeden Post eine Liste der Erlaubten
schreiben und sie bei jedem Folgen, Entfolgen, Blockieren, Beitreten und Austreten neu
berechnen. **Damit läge die Regel IN den Daten, verteilt über alle Posts** — das genaue
Gegenteil des Prinzips, nach dem dieses Projekt gebaut ist (harte Regeln 17, 32, 46:
eine Regel, eine Datei, Screens lesen sie nie).

In Postgres ist dieselbe Regel eine `SELECT`-Policy, und sie **filtert**:

```sql
create policy "sichtbare_posts" on posts for select using (
  not exists (select 1 from blocks
              where (blocker_id = auth.uid() and blocked_id = posts.author_id)
                 or (blocker_id = posts.author_id and blocked_id = auth.uid()))
  and (
       visibility_kind = 'public'
    or (visibility_kind = 'followers'
        and exists (select 1 from follows
                    where follower_id = auth.uid() and followee_id = posts.author_id))
    or (visibility_kind = 'group'
        and exists (select 1 from group_members
                    where group_id = posts.visibility_group_id and user_id = auth.uid()))
    or author_id = auth.uid()
  )
);
```

Ein schlichtes `select * from posts` liefert danach exakt die erlaubten Zeilen. **Das
ist dieselbe Bauart wie `features/posts/hooks.ts` heute, nur eine Ebene tiefer** — und
damit an der Stelle, an der sie auch gegen jemanden hält, der nicht die App benutzt.

**Was dagegen spricht, und es ist echt:**

| | |
|---|---|
| **Die Gratis-Stufe schläft nach 7 stillen Tagen ein.** | Ein pausiertes Projekt behält die Daten, aber die App ist tot, bis jemand sie im Dashboard aufweckt. Für eine App, die man herzeigt, ist das der schlimmste denkbare Moment. **Gegenmittel:** vor jedem Herzeigen aufwecken — oder ab dem echten Start Pro, 25 $/Monat, dann fällt die Pause weg. |
| **Ian kennt Firebase, nicht Postgres.** | Aus ACTA, und das Plugin ist installiert. SQL und RLS sind wirklich mehr zu lernen als Firestore-Regeln. |
| **Das Datenmodell ist heute dokument-förmig.** | `memberIds`, `followerIds`, `blockedIds` sind Arrays IM Objekt. In Postgres werden daraus eigene Tabellen — ein echter Übersetzungsschritt, siehe 20.1. |

**Was für Supabase zusätzlich spricht, ohne dass danach gefragt war:** Bilder-Speicher
ist mit 1 GB dabei. Bei Firebase ist Cloud Storage **seit dem 2026-02-03 nicht mehr in
der Gratis-Stufe** und verlangt auch bei winzigen Mengen ein Zahlungsmittel. Darias
Wunsch nach Profilbildern (`User.photoUrl?`, seit Phase 15 vorbereitet) wäre damit
sofort ein Kostenpunkt gewesen.

#### 20.1 — Das Schema, und was auf dem Weg verlorengeht ✅ *(2026-09-06)*

Die Übersetzung ist an drei Stellen keine Übersetzung, sondern eine Entscheidung.

**a) Arrays werden Tabellen — und die Reihenfolge wird dabei ehrlich.**

| Heute | In Postgres |
|---|---|
| `User.followerIds` / `followingIds` | `follows(follower_id, followee_id)` — eine Zeile statt zwei Listen. **Harte Regel 8 löst sich damit auf**: Die Beziehung stand zweimal im Modell, weil es kein besseres Mittel gab. Jetzt steht sie einmal. |
| `User.blockedIds` | `blocks(blocker_id, blocked_id)` — **einseitig bleibt einseitig** (Regel 10). Der Blockierte darf die Zeile nicht lesen; das ist eine RLS-Policy, kein Weglassen. |
| `Group.memberIds` | `group_members(group_id, user_id, joined_at)` |
| `User.interests` | **bleibt ein Array.** Postgres kann das, und es ist eine Werteliste, keine Beziehung. |

> **Die `memberIds`-Reihenfolge trägt eine Regel** (Regel 33): Die Liste wächst hinten,
> also erbt der zweite Eintrag die Gruppe, wenn der Gründer geht (`nachfolgerId()`,
> Ians Entscheidung 13). In einer Tabelle gibt es keine Reihenfolge — sie muss als
> `joined_at` ausgeschrieben und mit `order by` gelesen werden. **Das ist eine
> Verbesserung, keine Anpassung:** Heute hängt eine Erbfolge an einer Array-Reihenfolge,
> die jeder unabsichtlich umsortieren kann. Danach steht sie als Datum da.

**b) Die Union-Typen müssen als `CHECK` neu entstehen — sonst sind sie weg.**

`Visibility` (Phase 17) und `PostAlter` (Phase 18b) sind mit viel Bedacht als
diskriminierte Unions gebaut worden, damit der Zustand „Gruppen-Post ohne Gruppe"
**undarstellbar** ist. Eine Tabelle mit `visibility_kind text` und `visibility_group_id
uuid` kann ihn wieder darstellen — die Garantie überlebt die Reise nicht von selbst:

```sql
constraint sicht_vollstaendig check (
  (visibility_kind = 'group') = (visibility_group_id is not null)
)
```

> **Das ist die Phase-16-Lehre zum fünften Mal** („wo ein Typ weiter wird, muss die Enge
> eine Ebene höher neu entstehen"), diesmal an der Grenze zwischen TypeScript und SQL.
> Ohne den `CHECK` ist der ganze Aufwand von Phase 17 auf der Serverseite verloren, und
> zwar lautlos.

**c) `Post.district` bleibt `null`-fähig, `User.district` bleibt Pflicht.** Ians
Entscheidung 9, unverändert — in SQL heißt das `null` erlaubt gegen `not null`. Und:
**keine Koordinaten-Spalte**, nirgends. Das war Ians eigene Intuition vom August und ist
datenschutzrechtlich die richtige.

#### 20.2 — Die Regeln auf den Server ✅ *(2026-09-06)*

**Was der Browser ausfiltert, hat er vorher heruntergeladen.** Der Satz steht seit
Phase 2 in PLAN.md und wird hier eingelöst. Jede Regel, die heute in einer Regel-Datei
lebt, braucht ihr Gegenstück als Policy:

| Regel-Datei | Policy |
|---|---|
| `posts/hooks.ts` — Sichtbarkeit | die `select`-Policy oben |
| `safety/block.ts` — `BLOCK_WIRKUNG` | im `not exists` derselben Policy, **in beide Richtungen** (Regel 10) |
| `groups/gruppe.ts` — `PRIVAT_SICHT` | eigene Policy auf `group_members`: Name, Kategorie, Bezirk und Anzahl für alle, die **Liste** nur für Mitglieder |
| `chat/direkt.ts` — `SCHREIB_REGEL` | Policy auf `messages` — gegenseitiges Folgen prüfen, nicht nur den Knopf ausblenden |
| `requests/kollision.ts` — Regel 47 | **die heikelste.** Die Doppelbuchungs-Warnung rechnet aus fremden Terminen. Auf dem Server heißt das: `zaehltAlsTermin()` darf nur Zeilen sehen, die dem **anfragenden** Nutzer gehören. |

> **Der Prüfstein für diese Phase ist nicht, dass die App läuft.** Sie läuft auch mit
> offenen Policies. Der Prüfstein ist: **mit dem Zugangsschlüssel eines zweiten Kontos
> direkt an der Datenbank vorbei versuchen, einen Follower-Post zu lesen.** Was dabei
> nicht kommt, ist geschützt. Alles andere ist geglaubt.


#### Was beim Bauen von 20.1 und 20.2 herauskam *(2026-09-06)*

Beides liegt in `simplysocial/supabase/`. **Ohne Supabase-Konto gebaut und trotzdem
bewiesen** — das ist der erste Befund und der, der die Reihenfolge des Rests ändert:

**0. Die Absicherung ist ein POSTGRES-Ding, kein Supabase-Ding.** Der Plan hatte den
Prüfstein an ein zweites Konto gehängt („mit dem Zugangsschlüssel eines zweiten Kontos
direkt an der Datenbank vorbei"), und das las sich, als brauchte er ein Projekt in der
Cloud. Er braucht keines: `brew install postgresql@17`, `auth.uid()` in vier Zeilen
nachgebaut, `set local role authenticated` — und der Angriff läuft. Das ist dieselbe
Trennung wie „Simulator statt EAS-Build" in Phase 19, eine Ebene tiefer: **Die Frage
*halten die Regeln?* und die Frage *ist das Projekt eingerichtet?* sind zwei Fragen, und
nur die zweite braucht Ian.** `supabase/pruefen/aufbauen.sh` baut alles neu auf und
lässt 18 Prüfungen laufen.

**1. Eine Policy, die ihre eigene Tabelle abfragt, rekursiert — und sagt es erst beim
ersten Lesen.** „Die Mitgliederliste sehen nur Mitglieder" naheliegend hingeschrieben
ergibt `infinite recursion detected in policy for relation "group_members"`. Kein
Nachdenken hätte das verhindert; es steht in keinem Typ und in keinem Kommentar. Der
Ausweg sind die Funktionen im Schema `regel`: `security definer`, also einmal
kontrolliert an RLS vorbei. **Das ist dieselbe Bauart wie `safety/block.ts` (harte Regel
17), nur in SQL** — die Regel steht an EINER Stelle, alle Policies sehen ihr Ergebnis.
Und `set search_path = ''` ist dabei Pflicht, keine Sorgfalt.

**2. Ein `count(*)` auf einer geschützten Tabelle LÜGT, es verweigert nicht.**
`PRIVAT_SICHT = 'name-und-kategorie'` verspricht einem Fremden Name, Kategorie, Bezirk
**und die Mitgliederzahl**. Zählt er selbst, bekommt er nicht „Zugriff verweigert",
sondern die Zahl **0** — eine falsche Auskunft, die wie eine leere Gruppe aussieht.
Deshalb `regel.mitglieder_anzahl()`. **Die ZAHL ja, die LISTE nein**, und das ist zwei
verschiedene Rechte, nicht eines mit einer Ausnahme.

**3. Ein gelöschter Post hätte einen bestehenden Chat still zugesperrt — mein eigener
Fehler, gefunden beim Nachlesen der Policy.** `chat_threads.post_id` war
`on delete set null`, und `istDirektChat()` heißt in der App „kein Post am Faden". Also:
Post löschen → aus dem Aktivitäts-Chat wird ein Direktchat → es gilt Ians
`SCHREIB_REGEL = 'gegenseitig'` → zwei Leute, die sich getroffen haben und einander
nicht folgen, können einander nicht mehr schreiben. **Wegen einer dritten Sache, und
niemand hat es entschieden.** Im Prototyp konnte das nicht auffallen: Dort lässt sich
ein Post gar nicht löschen. Die Herkunft eines Chats ist eine TATSACHE über seine
Entstehung und kein abgeleiteter Wert — sie steht jetzt als `aus_aktivitaet` da.
**Gegengeprüft:** Stellt man die Policy auf `post_id` zurück, wird der Test rot
(Phase-18d-Lehre — eine Regel, die nichts vorfindet, sieht aus wie eine Regel, die tut).

**4. Ein Test, der nur „ist fehlgeschlagen" prüft, prüft zu wenig.** Die vier
Schreibversuche fingen zuerst `insufficient_privilege OR check_violation` ab — ein Insert,
der an einem CHECK scheitert, hätte damit als „von RLS abgewiesen" gezählt. Jetzt wird
`SQLSTATE = '42501'` verlangt. Drei der vier melden wörtlich *„new row violates
row-level security policy"*, der vierte *„permission denied for table group_members"* —
und das ist richtig so: Auf `group_members` gibt es bewusst **kein** Insert-Recht.

**5. `zaehltAlsTermin()` und harte Regel 47 sind jetzt nicht mehr „nicht eingebaut",
sondern UNMÖGLICH.** Die verworfene dritte Möglichkeit aus Phase 18d (dem Poster
zeigen, dass der Anfragende woanders ist) scheitert an der `select`-Policy auf
`join_requests`: Ein Poster sieht nur Anfragen an SEINE Posts. Der Prüffall steht in
den Daten — Lea hat zwei Anfragen laufen, Ian sieht genau eine.

**6. Die Kontolöschung ist eine Frage an Ian geworden — und noch am selben Tag seine
39. Entscheidung (siehe Abschnitt 6, Punkt 39). Sie kam aus dem Schema.**
`delete from auth.users` scheitert heute an `groups_creator_id_fkey`: Wer je gepostet
oder gegründet hat, kann sein Konto nicht löschen. Den Screen dafür gibt es seit Phase 7
und Apple verlangt ihn. Es ist dieselbe Frage wie `AUSTRITT_WIRKUNG` (Entscheidung 12),
nur größer. **Ians Antwort: A, alles mit — außer der Gruppe, die gehört acht Leuten
und wird nach Entscheidung 13 vererbt.** Gebaut in `0003_konto_loeschen.sql`, geprüft
mit sieben weiteren Fällen (jetzt 25 statt 18). Die verworfenen Möglichkeiten stehen in
`supabase/entscheidungen/konto-loeschen.sql`, **außerhalb von `migrations/`**, damit sie
nicht versehentlich laufen — dieselbe Anordnung wie `landing-vorschau/` neben `landing/`.

**Und dabei kam ein zweiter eigener Fehler heraus:** `reports.from_user_id` war
`not null` UND `on delete set null`. Postgres nimmt das an und scheitert erst beim
ersten echten Kontolöschen. Ausgerechnet an der einen Stelle, von der ich geschrieben
hatte, sie stünde bei allen drei Möglichkeiten schon fest — **eine Meldung überlebt das
Konto dessen, der sie geschrieben hat**, sonst nimmt jeder Anzeigende beim Löschen den
Beleg mit. Sie tut es jetzt auch wirklich.

#### 20.3 — Anmelden · **20.3-a ✅ (2026-09-09)** · 20.3-b ⬜ *(Ians 27. Entscheidung)*

**E-Mail-Code UND Google UND Apple.** Er hat gegen meine Empfehlung entschieden, und die
Begründung dahinter zählt: Für 16-Jährige ist ein Tipp weniger Reibung als eine
abgetippte E-Mail-Adresse, und Reibung beim Anmelden ist der Punkt, an dem eine App mit
leerem Feed verliert.

**Die Folge, die er kennt:** Sobald Google dabei ist, verlangt Apple laut Richtlinie 4.8
zusätzlich einen Anmeldeweg, der nur Name und E-Mail nimmt und das Verstecken der
E-Mail-Adresse erlaubt. „Anmelden mit Apple" erfüllt das — und ist damit **Pflicht, nicht
Zierde**. Weil er Apple ohnehin gewählt hat, entsteht daraus keine Extraarbeit, sondern
nur eine Reihenfolge: **Apple muss fertig sein, bevor Google live geht.** Umgekehrt wäre
es eine Ablehnung im Review.

Verworfen ist **nur E-Mail-Code**: Das hätte Richtlinie 4.8 gar nicht erst ausgelöst und
einen Anmeldeweg statt drei bedeutet — drei zu testen, drei zum Kaputtgehen. Sein
Gegenargument ist das bessere Produkt, meins der geringere Aufwand.

Native-Bausteine, die dabei dazukommen — **alle vier zusammen, dann ein Build**:
`expo-apple-authentication` · `expo-auth-session` + `expo-web-browser` (Google) ·
`expo-secure-store` · `@react-native-async-storage/async-storage`.

> **`CURRENT_USER_ID` ist heute eine Konstante und wird ein Wert, der sich ändert.**
> Sechs Stellen lesen sie direkt aus `store.ts` — `melden.tsx`, `chats.tsx`,
> `chat/[id].tsx`, `user/[id]/index.tsx`, `FolgeListe.tsx`, `Profil.tsx`. Dazu liest
> `post/[id].tsx` `useSlice` direkt.
>
> **Der Weg ist, die Konstante ERSATZLOS zu löschen**, nicht sie auf `string | null` zu
> setzen. Ein `string | null` wäre die `Post.district`-Falle zum fünften Mal: In JSX
> rendert `null` klaglos als Nichts, und `find(u => u.id === null)` ist gültiger Code.
> Verschwindet der Export dagegen ganz, schreibt `tsc` die Arbeitsliste — dieselbe
> Technik wie `IconName` in Phase 14. An ihre Stelle kommt `useCurrentUserId()`, und der
> ausgeloggte Zustand wird **eine Ebene höher** behandelt: Ein Screen, der einen
> angemeldeten Nutzer braucht, wird gar nicht erst gezeichnet.

#### Was beim Bauen von 20.3-a herauskam *(2026-09-09)*

**20.3 zerfällt in zwei Hälften, und nur die zweite braucht Ians Konten.** Das ist
dieselbe Trennung wie bei 20.1/20.2 (*halten die Regeln?* gegen *ist das Projekt
eingerichtet?*) und wie „Simulator statt EAS-Build" in Phase 19. Gebaut ist die erste:

| | |
|---|---|
| **20.3-a ✅** | Die NAHT. `CURRENT_USER_ID` gelöscht, Sitzung im Zustand, `useCurrentUserId()`/`getCurrentUserId()`, Torwächter, Anmelde-Bildschirm, Abmelden. Kein Konto, kein neuer Baustein, kein Build. |
| **20.3-b ⬜** | Die KONTEN. Supabase-Auth, Apple, Google, E-Mail-Code, `expo-secure-store`, die Bezirksfrage beim ersten Konto. Vier Native-Bausteine in EINEM Build. |

**Acht Befunde:**

**1. Die Konstante zu LÖSCHEN war die Methode, nicht das Ergebnis.** Der Plan sagte es
voraus, und es hat genau so funktioniert: `npx tsc --noEmit` meldete **12 Dateien**,
und diese Liste war die Arbeitsliste. Mit `string | null` wären es **null** gewesen —
`find(u => u.id === null)` ist gültiger Code. Dieselbe Technik wie `IconName` in
Phase 14, dieselbe Falle vermieden wie bei `Post.district` und `ChatThread.postId`.

**2. Zwei Zugänge, weil React zwei Sorten Code kennt.** In einem HAKEN darf man einen
Haken rufen und muss es — sonst zeichnet der Screen beim Abmelden nicht neu. In einer
AKTION (`folgen`, `blockieren`, `nachrichtSenden`, `postErstellen` …) darf man keinen.
Also `useCurrentUserId()` und `getCurrentUserId()`, wie `useSlice()` und `getState()`
seit Phase 1 danebenstehen. **Der eigentliche Prüfstein war der Linter:** In 34
`useMemo`-Blöcken kam ein neuer Wert dazu, und ein vergessenes Dep hätte einen Feed
ergeben, der nach dem Abmelden noch nach dem Vorgänger sortiert. `expo lint` zählt
**83 Probleme vorher wie nachher**, keine einzige neue `exhaustive-deps`-Warnung.

**3. Der teuerste Fund war UNSICHTBAR — die Adresse.** Abmelden aus `/einstellungen`
zeigte richtig den Anmelde-Bildschirm; `location.href` stand danach auf
**`/account-loeschen`**. Ursache: Der Torwächter zeichnet den `Stack` nicht mehr, und
`expo-router` schreibt beim ABBAU die Adresse neu — auf die erste Route im Verzeichnis,
und `account-loeschen.tsx` ist alphabetisch die erste unter `app/`. **Am Bild war
nichts falsch. Erst das nächste Neuladen hätte jemanden auf dem Lösch-Screen
abgesetzt.** Behoben mit einem absichtlichen `router.replace('/')` vor dem Abmelden —
kein Trick gegen den Router, sondern die richtige Aussage: Wer sich abmeldet, steht
nicht mehr in den Einstellungen. Gemessen: `/einstellungen?x=2` → `/`.

**4. Der Torwächter zeichnet den Stack GAR NICHT — und nur deshalb darf der Zugang
`string` liefern.** Die naheliegende Bauweise wäre eine Überdeckung wie beim
Prototyp-Hinweis gewesen. Dann hingen die Screens weiter im Baum, würden zeichnen und
`useCurrentUserId()` würde werfen. Der Gegenbeweis ist gemessen: `/post/p1` ausgeloggt
geöffnet zeigt Anmelden, und **`Bin dabei` steht nicht im Text der Seite** — der Screen
existiert nicht, er ist nicht nur verdeckt.

**5. Keine Route `/anmelden`, und der Grund ist die Adresse.** Belegt, indem der
ausgeloggte Start vorübergehend im Code erzwungen und per `git diff` nachweislich
zurückgenommen wurde (die 19d-Methode): `/post/p1` ohne Sitzung → Anmelden, Adresse
bleibt `/post/p1` → „Weiter als Ian" → **man steht auf `/post/p1`, bei Leas Tennis.**
Keine Stelle merkt sich ein Ziel, weil nie navigiert wird. Eine Route hätte nach
`/anmelden` umgeleitet und das Ziel verloren — bei einer App, in der seit Phase 8 jede
Adresse die erste sein kann (harte Regel 5), ist das kein Randfall.

**6. Dreimal derselbe Satz kostete zwölf Bildpunkte — und war schon vorher falsch.**
Unter jedem der drei Wege stand „Kommt mit dem Konto — im Prototyp noch ohne
Funktion." Auf **360 × 600** war der Kasten dadurch 612 hoch und stand über beiden
Kanten (gemessen: `scrollHeight` 606 gegen `innerHeight` 600, angemeldet 600 = 600).
Der Satz steht jetzt EINMAL unter der Gruppe — und das ist nicht die Reparatur,
sondern **Entscheidung 50**: Dreimal dasselbe ist genau das, was ein Bildschirm nicht
zeigen soll. Nachher Überlauf **0** auf beiden Größen, alle vier Knöpfe mit
`elementFromPoint` frei getroffen.

**7. Die Wortmarke hätte beim ausgeloggten Kaltstart die Farbe gewechselt.** „Social"
steht im Startbild (`app/+html.tsx`) und auf der Landing-Page in
`categoryColors.creative` (`#C23D7B`), auf der ersten Fassung des Anmelde-Bildschirms
in `accent` (`#3E4043`, ein Grau). Ausgeloggt liegt Anmelden unmittelbar hinter dem
Startbild — die Marke wäre mitten im Bildaufbau von Pink auf Grau gesprungen. Dritte
Fassung von harte Regel 13: **Was an mehreren Orten steht, driftet, sobald einer neu
gebaut wird.**

**8. Zwei Sachen, die nur die Attrappe betreffen, und beide sind EIN Wort.**
`ANMELDE_QUELLE = 'attrappe'` in `features/auth/anmeldung.ts` entscheidet, ob die App
angemeldet startet; `attrappeSitzung()` in `store.ts` ist der einzige Weg, wie der
Seed-Nutzer hineinkommt. **Sie gibt eine `Sitzung` heraus und keine ID** — eine
exportierte ID wäre `CURRENT_USER_ID` unter neuem Namen. Und sie steht in `store.ts`,
weil das die einzige Datei ist, die `@/data/mock` importieren darf (harte Regel 2).

**Was 20.3-a ausdrücklich NICHT enthält, und warum:**

- **Die Bezirksfrage beim Anmelden** (Ians Entscheidung 64, *„man gibt am Anfang seinen
  Bezirk an"*). Sie gehört an das erste NEUE Konto. Die Attrappe meldet einen Menschen
  an, der seinen Bezirk längst hat — ein Schritt, der etwas Beantwortetes fragt, ist
  kein Beleg für den Schritt (die 18d-Lehre: *welche Daten bringen ihn zum Sprechen?*).
  Die Regel dazu steht schon geschrieben, im Kopf von `features/auth/anmeldung.ts`.
- **Der Standort.** `STANDORT_FRAGE = 'einstellung'` (Entscheidung 70) sagt es
  ausdrücklich, und iOS fragt EINMAL: Wer im Anmelden wegdrückt, drückt für immer weg.
- **`expo-secure-store`.** Der Prototyp-Hinweis merkt sich sein „Verstanden" weiter in
  `sessionStorage` und kommt auf Native nach jedem Kaltstart wieder (Vorhersage 19.6).
  Der Tausch ist in `PrototypHinweis.tsx` auf zwei Funktionen eingeengt und gehört in
  denselben Build wie die drei Auth-Bausteine.

#### 20.4 — `store.ts` austauschen, Teil 1: Lesen · **Übersetzung ✅ (2026-09-10)** · Abfragen ⬜

**Die Zusage aus Phase 1 wird hier eingelöst oder gebrochen.** Im Kopf von `store.ts`
steht seit dem 2026-08-31: *„Später ersetzt Firestore (oder Supabase) das Innere dieser
Datei. Die Hooks und damit alle Screens bleiben unverändert."*

Das hält, und zwar überraschend genau: `useSyncExternalStore` bleibt, wo es ist.
Supabase Realtime meldet Änderungen über einen Kanal, der Kanal ruft `aendern()`, und
alles darüber merkt nichts. **Die 66 Haken und alle 22 Screens bleiben unangetastet.**

**Was sich trotzdem ändert, und man muss es aussprechen:** Heute liegt der ganze
Datenbestand im Arbeitsspeicher, weil es vierzehn Posts sind. Mit echten Daten geht das
nicht mehr — aus dem Speicher wird ein **Zwischenspeicher**, der nur hält, was gerade
gebraucht wird. Für `useFeed` heißt das: Die Sortier- und Filterarbeit aus
`posts/sort.ts` und `posts/filter.ts` wandert schrittweise in die Abfrage. **Nicht als
Erstes** — zuerst wird alles geladen wie bisher, damit man einen Unterschied hat, an dem
man messen kann.

> ✅ **Die Übersetzung ist gebaut und an echten Zeilen belegt, wieder ohne Konto.**
> `src/data/zeilen.ts`, Prüfungen in `pruefen/40_uebersetzung.sh` (+ `.mjs`).
> **121 Häkchen statt 78, kein Kreuz.** Was dabei herauskam, steht unter „Was beim
> Bauen von 20.4-a herauskam".

#### Was beim Bauen von 20.4-a herauskam *(2026-09-10)*

**Die Übersetzung entscheidet an drei Stellen etwas und benennt nicht nur um — und
genau deshalb ist sie eine eigene Datei.** Acht Dinge sind wichtiger als die Datei:

1. **Der teuerste Fund ist ein Zeitstempel.** Postgres liefert
   `2026-09-10T07:59:29.833382+01:00`, Supabase `…+00:00`, die App schreibt `…833Z`.
   Derselbe Augenblick — und **neun Stellen sortieren Zeitstempel mit `localeCompare`,
   also als TEXT**. Gemessen: gegen die App-Schreibweise ergibt die eine Fassung `1`
   („später"), die andere `−1` („früher"). Ungetauft stünde im Feed und in der
   Chat-Liste eine falsche Reihenfolge — **eine, die aussieht wie ein kaputter
   Sortierer und keiner ist.** Der Ausweg ist nicht, neun Stellen auf `Date`
   umzubauen, sondern EINE Zeile (`zeitpunkt()`). Gegenprobe gemessen: ohne sie wird
   das Prüfskript rot, die Rücknahme ist nachgewiesen (19d-Methode). Jetzt harte
   Regel 72.
2. **Ein fehlender `grant` war diesmal KEINE Zusage — und harte Regel 70 sagt selbst,
   woran man das unterscheidet.** Auf `reports` stand nur `insert`, begründet mit „eine
   Meldung enthält den Namen dessen, der gemeldet hat". Das trifft FREMDE Meldungen;
   `useMeineMeldung()` liest die EIGENEN und macht daraus seit Phase 7 „Du hast das
   schon gemeldet". Ohne select-Recht käme die Liste **leer** zurück — kein Fehler,
   keine Meldung, der Satz verschwände lautlos, und dieselbe Sache ließe sich endlos
   melden. Jetzt `melder_sieht_eigene`, dazu drei Angriffe: der Melder sieht seine,
   eine Fremde nichts, **der Gemeldete nichts**. Die Berichtigung steht ausdrücklich
   an der alten Begründung in 0002 und nicht still daneben (harte Regel 58).
3. **Die zwei abgesprochenen Schulden sind bezahlt — und die Vorhersage stimmte auf
   die Fehlerzahl.** `ChatThread.ausAktivitaet` als PFLICHTfeld meldete **5** Stellen,
   `Group.creatorId: string | null` **3**, und `Group.aufgeloestAm?` meldete **NULL**.
   Eine Lockerung meldet nichts (die Phase-16-Lehre), deshalb sitzt die Enge dafür in
   `istAufgeloest()` und in den Regel-Funktionen.
4. **Zwei echte Löcher fand nur Nachsehen von Hand.** Eine Einladung in eine aufgelöste
   Gruppe stand weiter im Anfragen-Tab — `istMitglied()` sagt dort „nein", die Zeile war
   also *richtig* da, mit einem „Annehmen", das einen als einziges Mitglied in eine tote
   Gruppe gesetzt hätte. Und `darfBeitreten()` ließ eine Anfrage zu, weil `offen` beim
   Auflösen nicht angefasst wird; sie hätte für immer dagelegen.
5. **Der Prototyp konnte den Zustand gar nicht herstellen.** `gruppeVerlassen` LÖSCHTE
   die Gruppe aus dem Array. Jetzt schreibt sie dieselben drei Felder wie
   `gruppe_verlassen()` in 0004. Dazu `g5` und `p20` in `mock.ts` — **ein unsichtbarer
   Eintrag ist der Beweis** (dasselbe Muster wie `p16` in Phase 17): `g5` steht in
   keiner Liste, `p20` steht im Post-Screen mit „Sichtbar für · Nur Bouldern Dienstag".
6. **`if (!direkt && !post) return undefined;` stand ZWEIMAL in `chat/hooks.ts`** — mit
   dem Kommentar „bei einem Aktivitäts-Chat ist ein fehlender Post ein kaputter
   Datensatz". Richtig, solange sich ein Post nicht löschen lässt. Gegen die Datenbank
   wäre der Chat aus der Liste verschwunden und beim Öffnen auf „Diesen Chat gibt es
   nicht" gelandet — **weil eine DRITTE Sache weg ist.**
7. **Ians Entscheidung 42** — Abschnitt 6, Punkt 42.
8. **Der Prüf-Chat ist mit SARA, und das ist kein Zufall.** Sie folgt Ian, Ian folgt ihr
   nicht: Unter `SCHREIB_REGEL = 'gegenseitig'` könnten die beiden gar keinen Direktchat
   haben. Würde `t4` je fälschlich als Direktchat gelesen, wäre das kein Schönheitsfehler,
   sondern ein Chat, den es nach den Regeln der App nicht geben dürfte.

**Was NICHT gemacht ist und ausdrücklich in 20.4-b gehört:** der Supabase-Client, die
Abfragen, Realtime und der Umbau vom Speicher zum Zwischenspeicher. `store.ts` liest
weiter `mock.ts`. Die Übersetzung darunter ist fertig.

> ✅ **20.4-b ist gebaut und am ECHTEN Server belegt (2026-09-12).** Der Client, die
> dreizehn Abfragen, Realtime, der Ladezustand und Ians Entscheidung 43.
> `npm run pruef-lesen` — **29 Häkchen, kein Kreuz**, und die Datenbank ist danach
> wieder leer. Was dabei herauskam, steht unter „Was beim Bauen von 20.4-b herauskam".

#### Was beim Bauen von 20.4-b herauskam *(2026-09-12)*

**Neu:** `lib/supabase.ts` · `data/laden.ts` · `data/quelle.ts` · `data/realtime.ts` ·
`components/LadeSchirm.tsx` · `migrations/0005_realtime.sql` ·
`pruefen/50_lesen.{sh,mjs}` · `pruefen/51_konten.sql` · `pruefen/52_abraeumen.sql`.
Geändert: `store.ts`, `auth/hooks.ts`, `app/_layout.tsx`, `einspielen.sh`,
`pruefen/aufbauen.sh`, `pruefen/00_supabase_lokal.sql`.
`tsc` sauber, **Lint 81 statt 83** (siehe Punkt 8), lokal weiter 121 Häkchen.

**Zehn Dinge sind wichtiger als die Abfragen:**

**1. `@supabase/supabase-js` ist JS-only — 20.4-b braucht KEINEN neuen Build.** Gemessen
statt vermutet: kein `.podspec`, kein `expo-module.config.json` in `node_modules/
@supabase/`. Native wird es erst da, wo die SITZUNG gespeichert werden muss
(`AsyncStorage`, `expo-secure-store`), und das ist 20.3-b. Deshalb steht
`persistSession: false` im Client — **es ist keine Bequemlichkeit, sondern die Zeile,
die diese Phase ohne Build möglich macht.** Der Preis ist benannt: Wer die App
schließt, ist ausgeloggt.

**2. Es gibt genau EINEN Schalter, und er heißt weiter `ANMELDE_QUELLE`.** Der
naheliegende Entwurf wäre ein zweiter (`DATEN_QUELLE`) gewesen. Von den vier
Kombinationen funktionieren aber nur zwei, und die beiden anderen scheitern **stumm**:
`supabase`-Daten mit `attrappe`-Anmeldung ergibt kein Token, also lassen die 33
Policies **0 Zeilen** durch — das sieht aus wie „die Datenbank ist leer"; umgekehrt ist
`ichId` eine Supabase-UUID, die in `mock.ts` niemanden findet. Ein Schalter, der einen
unmöglichen Zustand DARSTELLEN kann, ist derselbe Fehler wie `visibility: 'group'` mit
`groupId: null` (harte Regel 31), nur an einer Stelle, an der kein Compiler hinsieht.
`LIEST_AUS_SUPABASE` wird deshalb ABGELEITET — dieselbe Überlegung wie `PROJEKTION`
(Regel 53) und die Project URL aus dem Token.

**3. Der teuerste Fund liegt am Server und war unsichtbar: die Publication
`supabase_realtime` war LEER.** In einem frischen Supabase-Projekt steht keine einzige
Tabelle drin. Ein Abo auf `postgres_changes` verbindet sich dann sauber, meldet
`SUBSCRIBED` — **und liefert nie ein Ereignis.** Kein Fehler, keine Warnung. Für die
App sähe das aus, als passierte in Wien nichts. `0005_realtime.sql` trägt elf Tabellen
ein, und `einspielen.sh` misst seither **neun Zahlen statt sieben** — der Wächter hat
am echten Server sofort angeschlagen (`Realtime-Tabellen 0, erwartet 11`).

**4. `blocks` und `reports` stehen NICHT in der Publication, und das ist harte Regel 10.**
Supabase wendet RLS auf `postgres_changes` bei INSERT und UPDATE an — **bei DELETE
nicht.** Dort geht der Primärschlüssel der gelöschten Zeile an ALLE Abonnenten, und der
Primärschlüssel von `blocks` ist `(blocker_id, blocked_id)`. Ein Entblocken wäre damit
eine Nachricht an den Blockierten, dass die Kante je bestanden hat. Dazu bleibt
`REPLICA IDENTITY` auf DEFAULT: Auf `FULL` — die Einstellung, die man überall empfohlen
findet — schickt Postgres bei jedem Update und Delete **alle Spalten der alten Zeile**
über die Leitung.

**5. Der Realtime-Anstoß ist ein SIGNAL und kein Datentransport, und genau das macht
ihn sicher.** `data/realtime.ts` liest aus keinem `payload` auch nur ein Feld; es wird
nachgeladen, und das Nachladen geht durch die Policies. Damit kann Realtime selbst dann
nichts verraten, wenn seine RLS-Prüfung aussetzt — die Sichtbarkeit hängt an EINER
Stelle statt an zweien. Der Preis ist benannt: Jede fremde Nachricht kostet dreizehn
Abfragen, und das wird bei vierzehn Posts nicht auffallen. **Entprellt wird, weil harte
Regel 6 hier RÜCKWÄRTS ankommt:** `anfrage_bestaetigen()` ändert Anfrage, Post und Chat
in EINER Transaktion — am Kanal werden daraus drei Ereignisse.

**6. Beim Abmelden muss der Zwischenspeicher geleert werden, und das ist kein
Aufräumen.** Heute wäre es folgenlos, `mock.ts` ist für alle dieselbe erfundene Welt.
Mit echten Daten liegen nach dem Abmelden **fremde Chats, fremde Anfragen und fremde
Meldungen** im Speicher, und wer sich als Nächstes anmeldet, sieht sie, bis das neue
Laden durch ist — ein Fehler, der wie ein Flackern aussieht und keiner ist. `abmelden()`
nimmt sie jetzt mit, aus derselben Begründung, mit der es seit 20.3-a `weggewischt` und
`standort` mitnimmt; nur sind es hier fremde Daten statt eigener.

**7. Der Prüfstand schreibt in die Produktionsdatenbank — und hat eine Bedingung,
unter der er sich weigert.** `50_lesen.sh` bricht ab, wenn `auth.users` nicht leer ist.
Solange niemand drin ist, sind Aufbauen/Messen/Abräumen harmlos; sobald echte Menschen
drin sind, wäre derselbe Ablauf ein Eingriff in fremde Daten, und das Abräumen
unterscheidet nicht, wem eine Zeile gehört. **Ab dann gehört diese Prüfung in ein
zweites Supabase-Projekt.** Dieselbe Bauart wie der dritte Wächter in `einspielen.sh`.
Die Prüfkonten entstehen dabei per SQL und nicht über `signUp`: **so geht keine einzige
Mail an eine erfundene Adresse raus.**

**8. Vier eigene Fehler beim Prüfstand, und alle vier sind dieselbe Familie.**
   - **Das Abräumen war unvollständig**, weil ich die Gruppen-IDs aus `05_daten.sql`
     abgeschrieben und die Datei nur bis Zeile 70 gelesen hatte. Die zweite Gruppe
     („Nora allein") fehlte, das Abräumen scheiterte am `chef_oder_aufgeloest` und ließ
     fünf erfundene Menschen in einer echten Datenbank liegen. **Eine Liste, die aus
     einer anderen Datei abgeschrieben wird, ist eine Kopie** (harte Regel 13 in klein)
     — jetzt wird abgeleitet (`where creator_id in (…)`).
   - **Und die Meldung dazu hatte ich unterdrückt** (`>/dev/null 2>&1`). Übrig blieb „es
     stehen noch 5 Zeilen" ohne Grund. Dieselbe Falle wie das `set -e`, das in
     `db-url.sh` die eigens gebaute Diagnose tötete.
   - **Die Drift-Prüfung hätte sich still selbst übersprungen:** Sie hing an einer RPC,
     die es gar nicht gibt, mit einem Rückfall auf `null` — kein Häkchen, kein Kreuz,
     keine Spur. Dieselbe Familie wie die Backticks in `30_wettlauf.sh`. Jetzt kommt die
     Liste über `psql`.
   - **Die Realtime-Prüfung war EINE Messung, wo es drei braucht.** „Kommt das Ereignis
     an?" → nein kann dreierlei heißen: Kanal nicht verbunden, Änderung hat nie
     stattgefunden, Realtime schweigt. Jetzt werden alle drei einzeln gemessen — harte
     Regel 57 in ihrer allgemeinen Form.
   - Dazu ein fünfter, der KEINER war: Ein Wächter schlug an, der andere kam nie dran.
     Die Reihenfolge in `0005` ist gedreht, weil der Zähler („12 statt 11") die
     Regel-10-Prüfung verdeckte — **ein Wächter hinter einem anderen ist ein ungeprüfter
     Wächter.** Beide sind jetzt EINZELN belegt: falsche Zahl → Zähler greift; `blocks`
     gegen `follows` getauscht (Zahl bleibt 11) → Regel-10-Prüfung greift.

**9. „Database error querying schema" sind acht `NULL`s.** GoTrue ist in Go geschrieben
und liest `confirmation_token`, `recovery_token`, `email_change` und fünf weitere
Textspalten in ein `string`, nicht in ein `*string`. Ein `NULL` lässt sich dorthin nicht
scannen, und der Fehler nennt weder Spalte noch Grund — er klingt nach kaputtem Schema.
**`null` und `''` sind nicht dasselbe**, dieselbe Unterscheidung, die `zeilen.ts` an
sieben Stellen trifft. Beim normalen `signUp` schreibt GoTrue selbst leere Strings
hinein; wer direkt in `auth.users` schreibt, macht es nach.

**10. Ich habe selbst zwei Fallen aus CLAUDE.md gebaut und wieder entfernt.** Die
`await import()` in `_layout.tsx` waren die 19h-2-Falle (*ein dynamischer Import lohnt
nur gegen einen Nebeneffekt beim Laden — gibt es keinen, ist er reine Fehlerquelle*), und
es gibt hier keinen: `lib/supabase.ts` baut den Client ausdrücklich erst beim ersten
`client()`. Und `react-hooks/rules-of-hooks` meldete `datenLaden` — **statt nur meine
eine wegzumachen, heißen jetzt alle drei Helfer `use…`** (`useStartFlaecheWeg`,
`useTabTitel`, `useDatenLaden`); zwei davon waren seit Phase 13 gemeldet. Das Projekt
hat dafür längst ein Muster: `useSlice`, `useTabRand`, `useSichtText` — `use` plus
deutsches Wort. **81 Lint-Probleme statt 83.**

**Der Preis dieser Phase ist eine Zahl: +74.789 B gzip (+18,3 %).** Roh +293.727 B
(+19,5 %). Deutlich mehr als jeder Baustein bisher (`react-native-svg` +3,5 %,
`expo-glass-effect` +0,36 %). `storage-js` und `functions-js` sind dabei wirklich tote
Last — wer sie loswerden will, muss `postgrest-js`, `realtime-js` und `auth-js` einzeln
verdrahten, und `createClient` macht genau die Verdrahtung, die man dann selbst bauen
müsste: **das Auth-Token an PostgREST UND an Realtime weiterreichen.** Vergisst man das
zweite, greift RLS am Kanal nicht wie erwartet, und der Fehler ist still. 30 kB gegen
eine selbstgebaute Auth-Verdrahtung ist kein guter Handel. **Daraus folgt: `npm run
deploy` bleibt liegen, bis der Schalter umgelegt wird** — auf der öffentlichen
Prototyp-Adresse kostet der Umbau 75 kB und tut nichts.

⚠️ **Was 20.4-b NICHT ist: der Schalter selbst.** `ANMELDE_QUELLE` steht weiter auf
`'attrappe'`, der Prototyp liest weiter `mock.ts` und sieht Zeichen für Zeichen aus wie
vorher (nachgemessen auf 390 × 844, keine Konsolenfehler). **Umlegen lässt er sich erst
mit 20.3-b**, weil ohne echte Anmeldung kein Token da ist und die Policies dann null
Zeilen durchlassen. Belegt ist bis dahin die ganze Kette darunter — inklusive der
Sichtbarkeitsregeln über PostgREST — und der Ladefehler-Schirm an der App selbst
(erzwungen und per `diff` nachweislich zurückgenommen, die 19d-Methode).

#### 20.5 — `store.ts` austauschen, Teil 2: Schreiben · **SQL-Seite ✅ (2026-09-10)** · App-Seite ⬜

> ✅ **Die SQL-Seite ist gebaut und bewiesen, ohne Konto — dieselbe Trennung wie bei
> 20.1/20.2** (*halten die Regeln?* gegen *ist das Projekt eingerichtet?*).
> `migrations/0004_transaktionen.sql`, Prüfungen in `pruefen/20_transaktionen.sql`
> und `pruefen/30_wettlauf.sh`. **78 Häkchen statt 25, kein Kreuz.** Was dabei
> herauskam, steht unter „Was beim Bauen von 20.5 (SQL) herauskam".

23 Stellen rufen `aendern()`. Bei den meisten ist es eine Zeile mehr. Bei dreien nicht:

> **Harte Regel 6 wird hier von einer Oberflächen-Regel zu einer Daten-Regel.** Heute
> heißt „was zusammengehört, in EINEM `aendern`", dass React keinen Zwischenzustand
> zeichnet. Mit einer Datenbank heißt es, dass kein Zwischenzustand **gespeichert
> bleibt**. `anfrageBestaetigen` ändert Anfrage, Post und Chat; bricht die Verbindung
> nach dem ersten Schreibvorgang ab, ist die Anfrage bestätigt und der Platz noch frei —
> und zwar dauerhaft, für alle, bis jemand es von Hand richtet.
>
> Die drei betroffenen: `anfrageBestaetigen` · `blockieren` (Ians Entscheidung 7, „alles
> weg" — löst Chat, Zusage und Platz auf einmal) · `gruppeVerlassen` (mit
> `nachfolgerId()`). Alle drei werden **eine Postgres-Funktion** und über `rpc()`
> aufgerufen. Eine Transaktion ist entweder ganz passiert oder gar nicht.

#### Was beim Bauen von 20.5 (SQL) herauskam *(2026-09-10)*

**Sieben Funktionen, nicht drei — und gefunden hat sie nicht jemand, sondern die
Rechteliste aus 0002.** Sechs Dinge sind wichtiger als die Funktionen selbst:

1. **Ein fehlender `grant` ist in diesem Projekt eine ZUSAGE, keine Lücke.**
   `group_members` hat nur `select`, `chat_threads` auch. Solange 0004 fehlte, konnte
   also **niemand** einer Gruppe beitreten oder einen Chat anfangen — auch nicht
   rechtmäßig. Genau das sagt harte Regel 55: Beitreten ist das ERGEBNIS einer
   bestätigten Anfrage, kein Schreibvorgang. **Damit hat die Rechteliste die
   Arbeitsliste geschrieben**, dieselbe Technik wie `IconName` in Phase 14 (ein enger
   Typ) und das Löschen von `CURRENT_USER_ID` in 20.3-a (ein verschwundener Export),
   nur mit Rechten statt mit TypeScript.
2. **Das Wettrennen ist der einzige Teil, für den es im Prototyp kein Gegenstück
   gibt — und es ist nachgestellt, nicht behauptet.** In `anfrageBestaetigen()` stehen
   „zwei Sicherheitsnetze gegen den Doppelklick auf Web"; sie sind gegen zwei Klicks
   DERSELBEN Person richtig und gegen zwei gleichzeitige Verbindungen wirkungslos.
   `30_wettlauf.sh` öffnet zwei echte Verbindungen auf einen Post mit EINEM Platz.
   **Die Gegenprobe ist der eigentliche Beleg** (die 18d-Lehre): Ohne
   `select … for update` sind danach **zwei Anfragen bestätigt, zwei Chats angelegt
   und ein Platz belegt** — und niemand bekommt einen Fehler. Einer der beiden hat
   schlicht keinen Sitz und erfährt es beim Hingehen. Die Sperre wurde nachweislich
   zurückgenommen (`diff` gegen die Sicherung leer, die 19d-Methode).
3. **Ians Entscheidung 41 ließ sich NICHT so bauen, wie es naheliegt — und das ist
   eine gute Nachricht.** Er hat entschieden, dass ein Gruppen-Post die Auflösung
   seiner Gruppe überlebt. Der naheliegende Weg wäre `on delete set null` an
   `posts.visibility_group_id` gewesen; dann stünde am Post `visibility_kind =
   'group'` OHNE Gruppen-ID — **genau der Zustand, den Phase 17 mit einem
   diskriminierten Union undarstellbar gemacht hat** (harte Regel 31), und der CHECK
   `sicht_vollstaendig` bricht den Löschvorgang ab. **Die Absicherung von damals hat
   hier zum ersten Mal wirklich etwas verhindert.** Der Ausweg ist, dass die Gruppe
   nicht verschwindet, sondern AUFHÖRT: `aufgeloest_am`, Mitgliederliste leer,
   `creator_id` auf `null`. Beide Zusagen bleiben heil — der Union ist vollständig,
   der Fremdschlüssel gültig.
4. **Und daran hing sofort der Fehler, aus dem Entscheidung 39 überhaupt entstanden
   ist, einen Schritt später.** `groups.creator_id` war `not null references profiles
   (id)` ohne Cascade. Solange die Gruppe gelöscht wurde, ging `konto_loeschen()`
   durch; sobald sie stehen bleibt, scheitert es an `groups_creator_id_fkey`. Jetzt
   `on delete set null` plus `constraint chef_oder_aufgeloest` — „ohne Chef" ist NUR
   bei einer aufgelösten Gruppe darstellbar. Eine lebende Gruppe ohne Gründer wäre
   eine, in der niemand mehr Anfragen bestätigt, und die Zeilen lägen für immer da.
5. **Zwei bestehende Prüfungen sind beim Umbau ROT geworden, und das war ihr Zweck.**
   Beide behaupteten „die Gruppe ist WEG" (`count(*) = 0`). Entscheidung 41 hat sie
   überholt — sie fragen jetzt nach `aufgeloest_am is not null and creator_id is
   null`. **Eine Prüfung, die eine Bedeutungsänderung nicht merkt, prüft die
   Umsetzung und nicht die Regel.**
6. **`last_message_at` ist ein TRIGGER geworden und keine achte Funktion — aus einem
   Grund, der nicht Bequemlichkeit ist.** Eine `security definer`-Funktion umgeht die
   Policies, also müsste sie `nachricht_schreiben` aus 0002 NACHBAUEN, und damit
   stünde Ians `SCHREIB_REGEL` zweimal da. Mit dem Trigger bleibt das Senden ein
   gewöhnliches `insert into messages` unter der bestehenden Policy, und harte
   Regel 6 ist trotzdem erfüllt: Der Trigger läuft in derselben Transaktion.
   **Die Regel aus Punkt 1 hat also eine Grenze — ein fehlender Grant verlangt eine
   Funktion, WENN etwas zu entscheiden ist. Hier ist nichts zu entscheiden.**

**Ein kleiner Fund am Rande, der beinahe unbemerkt geblieben wäre:** In
`30_wettlauf.sh` stand eine Prüfung mit Backticks in doppelten Anführungszeichen
(``pruef "… auf `full`" "$STATUS" "full"``). Die Shell hat `full` als BEFEHL
ausgeführt, beide Seiten des Vergleichs waren leer — **und die Prüfung meldete grün,
ohne irgendetwas zu messen.** Gesehen nur, weil `full: command not found` daneben
stand.

**Was noch NICHT gemacht ist und ausdrücklich in 20.4 gehört:** Der Prototyp kennt
`aufgeloest_am` nicht — er löscht die Gruppe aus seinem Array und zeigt am Post
`GRUPPE_UNBEKANNT = 'einer Gruppe'`. Sobald `store.ts` aus der Datenbank liest, braucht
`Group` ein `aufgeloestAm?`, und **jede Gruppen-LISTE muss es herausfiltern**, sonst
steht eine tote Gruppe unter „Deine Gruppen". Dieselbe abgesprochene Schuld wie
`aus_aktivitaet` (harte Regel 56) — sie steht am Feld in 0001 und hier, nicht nur an
einer Stelle.

#### 20.6 — Profilbilder ⬜

Darias Wunsch vom 2026-09-02, seit Phase 15 vorbereitet: `User.photoUrl?` gibt es, alle
elf Aufrufstellen reichen es durch, `SsAvatar` kann es zeichnen. **Es fehlt nur der
Upload** — und der brauchte genau das, was jetzt da ist.

Was dazugehört und nicht vergessen werden darf: **jemand muss draufschauen können.**
Sobald Leute Bilder hochladen, laden Leute irgendwann Bilder hoch, die dort nicht
hingehören — bei einer App mit 16-Jährigen kein Randthema, und Apple fragt im Review
danach. Mindestens: melden (steht seit Phase 7), löschen können, und eine Adresse, an
der eine Meldung ankommt.

#### 20.7 — Die Meldungen bekommen einen Leser ⬜

`Report` wird seit Phase 7 gespeichert und von niemandem gelesen. Für Apple 1.2 ist das
die letzte offene Zusage: **ein Mensch, der Meldungen sieht und handeln kann.** Es
braucht keine Oberfläche — die Supabase-Tabellenansicht genügt für vier Gründer. Es
braucht eine **Zusage, wie schnell**, und die gehört in die Nutzungsbedingungen.

#### 20.8 — Was WEGFÄLLT ⬜

- **`features/statisch.ts` gehört gelöscht, nicht angepasst.** Es existiert nur, weil
  der statische Web-Export für jede dynamische Route beim Bauen alle IDs kennen muss
  (harte Regel 11). Mit echten Daten gibt es die beim Bauen nicht mehr — und braucht sie
  auch nicht. Steht so schon in PLAN.md, Phase 8.
- **`data/mock.ts` wird zu Startdaten**, nicht zu Müll. Die vierzehn Posts sind über
  Wochen so gebaut worden, dass jede Regel an ihnen sichtbar wird (`p7` ohne Bezirk,
  `p16` in einer fremden Gruppe, `p18` als Terminkollision). Als Seed für eine leere
  Datenbank sind sie genau das, was ein Kaltstart braucht. **Harte Regel 12 gilt weiter.**

---

### Phase 21 — In den App Store ⬜

#### 21.1 — Was seit diesem Monat neu ist ⬜

> ⚠️ **Apple hat im Juli 2026 neue Pflichtfragen zur Altersfreigabe eingeführt, und sie
> sind ab September 2026 verpflichtend** — also ab jetzt, für jede neue App und jedes
> Update. Gefragt wird, ob die App nutzergenerierte Inhalte über einen Feed verbreitet.
>
> **SimplySocial ist genau die App, die gemeint ist.** Die Antwort ist ja, und das
> Ergebnis ist eine Altersfreigabe von **mindestens 13+**. Das ist keine Wahl, sondern
> eine Feststellung.

Das macht die rote Frage aus `OFFENE_SACHEN.md` Punkt 1 dringender, nicht lockerer:
Apples 13+ ist eine **Store-Einstufung**, keine Rechtsberatung. Was in Österreich für
eine App gilt, die 16-Jährige zu Treffen verabredet, beantwortet weiterhin nur ein
Erwachsener.

*Nicht betroffen:* Apples „Declared Age Range"-Schnittstelle ist bisher nur dort
verpflichtend, wo Gesetze es verlangen — Texas, Utah, Louisiana, Australien, Brasilien,
Singapur. Österreich ist nicht darunter.

#### 21.2 — Rechtstexte ⬜ *(nur Ian, mit erwachsener Hilfe)*

Der rote Kasten in `nutzungsbedingungen.tsx` steht seit Phase 7 bewusst da. Hier wird er
ersetzt — **oder die App wird nicht eingereicht.** Es braucht Datenschutzerklärung,
Nutzungsbedingungen, ein Mindestalter und eine Antwort auf die Haftungsfrage. Dazu das
Häkchen „akzeptiert" beim Anmelden, das ohne Login nie gebaut werden konnte.

#### 21.3 — Das Datenschutz-Etikett ⬜

Apple verlangt eine Aufstellung, welche Daten die App sammelt. **Sie muss stimmen** —
und sie ist überprüfbar, weil ein Reviewer den Netzwerkverkehr sehen kann. Für
SimplySocial: E-Mail (Konto), Name, Jahrgang, Bezirk, Chats, Fotos. **Keine
Koordinaten** — und das ist ein Satz, den man mit Stolz hinschreiben kann, weil er
seit August wahr ist.

#### 21.4 — TestFlight ⬜

**Der einfachere Weg für die drei Mitgründer**, einfacher als jede Alternative: Wer im
App-Store-Connect-Team steht, ist *interner* Tester — bis zu 100 Personen, **kein
Apple-Review nötig**, Installation über die TestFlight-App. Der Umweg über registrierte
Geräte-Nummern (`ad hoc`) entfällt damit.

```bash
npx eas-cli build --profile production --platform ios
npx eas-cli submit --platform ios --latest
```

#### 21.5 — Einreichen ⬜

Was bei einer App dieser Art erfahrungsgemäß zu Ablehnungen führt — alles vermeidbar:

1. **Kein Demo-Zugang.** Die App liegt hinter einem Login; ein Reviewer kommt ohne
   Testkonto nicht hinein und lehnt ab. **Das wird am häufigsten vergessen.** Es gehört
   in das Feld „App Review Information", samt einer Anmeldung, die ohne fremde E-Mail
   funktioniert.
2. **1.2 (UGC)** — melden, blockieren, Nutzungsbedingungen, Account löschen. Alle vier
   stehen seit Phase 7; nach Phase 20 wirken sie auch wirklich.
3. **4.8 (Login)** — siehe 20.3. Apple muss neben Google stehen.
4. **5.1.1 (Datensammlung)** — nichts abfragen, was die App nicht braucht. Der Jahrgang
   ist begründbar, ein Geburtsdatum wäre es nicht — und es gibt keins (Phase 18b).
5. **Leerer Zustand.** Ein Reviewer öffnet die App in einem leeren Wien. Der Kaltstart
   (`OFFENE_SACHEN.md`, Punkt 6) ist damit nicht nur ein Marketing-Thema, sondern eine
   Review-Frage — und `LeererFeed` mit „Etwas posten" (2026-09-03) ist die Antwort.

#### 21.6 — Was das alles kostet ⬜

| Posten | Kosten | Stand |
|---|---|---|
| Apple Developer Program | 99 $/Jahr | ✅ bezahlt am **2026-09-11** |
| EAS Build | 0 € | 15 iOS-Builds/Monat gratis; mit Xcode lokal unbegrenzt |
| Supabase Gratis-Stufe | 0 € | 500 MB Datenbank, 1 GB Bilder, 50.000 Nutzer/Monat — **schläft nach 7 stillen Tagen** |
| Supabase Pro | 25 $/Monat | erst nötig, wenn die Pause stört — also ab dem echten Start |
| `simplysocial.at` | ~15 €/Jahr | offen, Ians Entscheidung (`OFFENE_SACHEN.md` 5b) |

**Für die ersten 200 Leute reicht die Gratis-Stufe.** Der erste Posten, der wirklich
anfällt, ist Supabase Pro — und der fällt erst an, wenn die App genug benutzt wird, dass
sieben stille Tage nicht mehr vorkommen. Das ist ein gutes Problem.

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

   🔁 **Am 2026-09-08 ERSETZT — Ians Entscheidung 63: nach ENTFERNUNG** (Phase 19h-1,
   Abschnitt 5b). Der Feed sortiert von der eigenen Haustür aus nach außen. Das war
   eine echte Rückfrage nach harter Regel 58 und nicht eine stille Änderung: Drei
   Lesarten lagen ihm vor, er hat die stärkste gewählt, gegen meine Empfehlung.
   **Entscheidung 1 ist damit nicht weg, sondern die zweite Stufe** — bei gleicher
   Entfernung, also im selben Bezirk, steht weiter das Neueste oben. Der alte Haken
   ist geblieben und hat einen neuen bekommen: Ein frischer Post vom anderen Ende der
   Stadt kommt nicht mehr nach oben. **Beides weiter nicht ohne Rückfrage ändern.**

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

29. ✅ **Welche Zeile in der Chat-Liste weichen muss** (`app/(tabs)/chats.tsx`) —
    **entschieden am 2026-09-05: die Aktivität rückt klein HINTER den Namen, die
    Verabredungs-Zeit fällt aus der Liste.** *(Ians einundzwanzigste Entscheidung.)*

    Die Frage ist seine eigene: *„ich finde es ist noch nicht ganz übersichtlich,
    inspiriere dich von WhatsApp oder so für die Chats."* Nachgemessen auf 360 × 600 war
    das keine Geschmacksfrage — **4 Chats** passten auf den Schirm, bei WhatsApp sind es
    **7**. Zwei Ursachen: Jeder Chat war eine Karte (Rahmen + 12 px Lücke), und drei
    Textzeilen ergaben 100–118 px, ungleich hoch, weil die Nachricht umbrach.

    Karten zu Zeilen zu machen war keine Frage. Die Frage war die **dritte Zeile**, weil
    genau sie diese App von WhatsApp unterscheidet: Ein Chat gehört hier zu einer
    Verabredung. Verworfen:
    - **Die Verabredungs-Zeit behalten und den Titel streichen** („Cool, freut mich!  ·
      Heute 19:30"). Die Kategorie trägt zwar der Farbstreifen, aber woran man einen Chat
      WIEDERERKENNT, ist „Tennis spielen" — eine Uhrzeit ist es nicht.
    - **Alle drei Zeilen behalten** und nur die Karten abschaffen. Hätte 5–6 Chats
      gebracht statt 7, also den halben Gewinn für dieselbe Arbeit.

    **Den Haken kennt er:** Wann das Treffen ist, steht in der Liste nicht mehr — nur noch
    im Chat selbst. Und bei einem Direktchat fällt der Handle weg, der bisher die zweite
    Zeile füllte; bei zwei Leuten mit demselben Vornamen unterscheidet sie dann nur noch
    die Avatarfarbe. Beides ist eine Zeile Code wert, falls es sich am Handy anders
    anfühlt als am Papier.

30. ✅ **Was das Alter am Profil sagt** (`components/Profil.tsx`) —
    **entschieden am 2026-09-05: „Jahrgang 2009".** *(Ians zweiundzwanzigste
    Entscheidung, `JAHRGANG_ANZEIGE`.)*

    Die Frage stand seit dem Plan zu 18b offen und ist die Kehrseite seiner Entscheidung
    17 (der Filter läuft über den Jahrgang): Ein Jahrgang ist genauer als ein Band — das
    ist der Sinn, und das ist der Preis. Verworfen: **weiter ein grobes Band zeigen**
    (genau filtern, grob zeigen — hätte am wenigsten preisgegeben, aber zwei Wahrheiten
    über dasselbe Feld nebeneinandergestellt) und **das ausgerechnete Alter** („17
    Jahre" — dasselbe Wissen, nur noch direkter).

    **Den Haken kennt er, und er hängt an einer offenen Frage:** Aus einem Jahrgang
    rechnet jeder Fremde das Alter aus. Bei einer App mit 16-Jährigen gehört das zu
    Abschnitt 8, Punkt 1 (Mindestalter, DSGVO) — das wartet weiter auf erwachsenen Rat.
    Die Korrektur ist ein Wort (`JAHRGANG_ANZEIGE` in `config/alter.ts`).

31. ✅ **Was passiert, wenn man sich doppelt verabredet** (`features/requests/kollision.ts`)
    — **entschieden am 2026-09-05: warnen, aber durchlassen.** *(Ians dreiundzwanzigste
    Entscheidung, `DOPPEL_REGEL`.)*

    Leopolds Wunsch vom 2026-09-03: *„nicht 2 Sachen gleichzeitig."* Über dem Knopf steht
    jetzt, womit es sich beißt — tippen kann man trotzdem. Verworfen:
    - **Hart sperren.** Der Knopf wäre aus. Das Argument dagegen ist kein
      Bequemlichkeits-Argument, sondern ein ehrliches: Ein Post hat **keine Dauer**, die
      App schätzt also. Eine Sperre behauptet Gewissheit, die sie nicht hat.
    - **Nur der Poster sieht es** („Sara ist um die Zeit schon woanders"). Damit
      verriete die App Saras Pläne an jemanden, den sie nichts angehen — auch Pläne aus
      privaten Gruppen. Derselbe Fehler wie der Gründername an einer privaten Gruppe
      (Phase 18a), nur eingebaut statt vergessen.

    **Den Haken kennt er:** Wer die Warnung wegklickt, ist trotzdem doppelt verabredet.
    Die App verhindert es nicht, sie macht es sichtbar. Die Korrektur ist ein Wort;
    alle drei Regeln stehen fertig in der Datei.

32. ✅ **Was „gleichzeitig" heißt, wenn ein Post keine Dauer hat**
    (`features/requests/kollision.ts`) — **entschieden am 2026-09-05: eine Stunde.**
    *(Ians vierundzwanzigste Entscheidung, `KOLLISION_FENSTER_MIN`.)*

    Verworfen: **zwei Stunden** (vorsichtiger, warnt aber oft ohne Not — und eine
    Warnung, die man dauernd wegklickt, liest nach der dritten niemand mehr, dann ist
    auch die richtige weg) und **ein eigenes Feld `dauerMinuten` am Post** (ehrlich statt
    geschätzt, aber ein Feld mehr in einem Screen, den Phase 12 gerade auf zwei
    leergeräumt hat — harte Regel 18). Das Feld bleibt der Weg heraus, falls sich
    60 Minuten im Betrieb als zu grob erweisen.

33. ✅ **Ob die Regel auch beim Selbst-Posten gilt** (`features/requests/kollision.ts`)
    — **entschieden am 2026-09-05: ja, gleich behandeln.** *(Ians fünfundzwanzigste
    Entscheidung, `PRUEFT_BEIM_POSTEN`.)* Doppelbuchung ist Doppelbuchung, egal von
    welcher Seite man hineinläuft, und weil es dieselbe Funktion ist, kostet die zweite
    Stelle fast nichts. Verworfen: nur beim Anfragen — das Argument dafür („ein eigener
    Post ist noch keine Verabredung, es kann ja niemand kommen") ist richtig, gehört
    aber nicht in den Screen, sondern in `zaehltAlsTermin()`. Dort steht es jetzt.

34. ✅ **Was als „schon verabredet" zählt** (`features/requests/kollision.ts`) —
    **entschieden am 2026-09-06: erst, wenn wirklich jemand dabei ist.** *(Ians
    sechsundzwanzigste Entscheidung, `zaehltAlsTermin()`.)*

    Ein eigener Post zählt nicht, solange niemand zugesagt hat; sobald einer da ist,
    zählt er wie jede andere Verabredung. Sein Grund: **Ein Post ist ein ANGEBOT, bis
    jemand annimmt** — dieselbe Unterscheidung, die im Feed eine Karte von einer
    Chat-Zeile trennt (Phase 18c). Solange `spotsFilled` null ist, hat man niemandem
    etwas versprochen. Verworfen:
    - **Alles zählt** (`return true`). Streng und in einem Satz erklärbar, aber die
      Warnung käme dort, wo noch nichts feststeht: Wer sich am Sonntag drei Sachen
      ausdenkt und postet, wird ab dem zweiten gewarnt. Derselbe Schaden wie ein
      Zwei-Stunden-Fenster (Punkt 32) — eine Warnung, die man dauernd wegklickt, liest
      nach der dritten niemand mehr, und dann ist auch die richtige weg.
    - **Nur eigene Zusagen** (`t.rolle === 'zugesagt'`). Am leisesten, aber der eigene
      Post ist auch eine Verabredung, sobald jemand kommt — und wer acht Leute zum
      Tennis eingeladen hat und dann woanders zusagt, lässt acht stehen, nicht einen.

    **Den Haken kennt er:** Es ist eine Bedingung mehr, als man in einem Satz erklärt.
    Auf „warum warnt es hier und dort nicht?" ist die Antwort nicht „weil es dein Post
    ist", sondern „weil bei deinem noch niemand dabei ist".

    **Der Code hat sich dabei um kein Zeichen geändert** — c) stand als Platzhalter
    drin. Geändert hat sich sein Status, und das ist keine Formalität: Über der Zeile
    stand ein `TODO Ian` mit dem Satz „das ist keine Entscheidung", und genau darauf
    verlässt sich die nächste Sitzung.


35. ✅ **Wie sich Leute anmelden** (`src/features/auth/anmelden.ts`, kommt mit Phase 20)
    — **entschieden am 2026-09-06: E-Mail-Code UND Google UND Apple.** *(Ians
    siebenundzwanzigste Entscheidung, `ANMELDE_WEGE`.)*

    **Er hat gegen meine Empfehlung entschieden, und das gehört hierher notiert**, weil
    sein Argument das bessere Produkt beschreibt und meines nur den geringeren Aufwand.
    Ich hatte „nur E-Mail-Code" vorgeschlagen: ein Weg statt drei, kein Passwort zum
    Vergessen — und vor allem löst er Apples Richtlinie 4.8 gar nicht erst aus. Seine
    Gegenrechnung: Für 16-Jährige ist ein Tipp weniger Reibung als eine abgetippte
    E-Mail-Adresse, und Reibung beim Anmelden ist genau der Punkt, an dem eine App mit
    noch leerem Feed jemanden verliert. Wer beim ersten Öffnen sein Postfach aufmachen
    muss, kommt zur Hälfte nicht zurück.

    **Die Folge, die er kennt — und sie ist eine Reihenfolge, keine Extraarbeit.**
    Sobald Google dabei ist, verlangt Apple laut Richtlinie 4.8 zusätzlich einen
    Anmeldeweg, der nur Name und E-Mail nimmt und das Verstecken der Adresse erlaubt.
    „Anmelden mit Apple" erfüllt das und ist damit **Pflicht, nicht Zierde**. Weil er
    Apple ohnehin gewählt hat, entsteht kein zusätzlicher Baustein — aber eine harte
    Reihenfolge: **Apple muss fertig und geprüft sein, bevor Google live geht.**
    Andersherum ist es eine Ablehnung im Review, und zwar eine, die man vorher weiß.

    Verworfen:
    - **Nur E-Mail-Code.** Ein Weg zu bauen, einer zu testen, einer zum Kaputtgehen, und
      Richtlinie 4.8 bliebe unberührt. Der Preis ist die Hürde beim allerersten Öffnen —
      und die trifft ausgerechnet den Kaltstart, also den Moment, den die App am
      wenigsten verträgt (`OFFENE_SACHEN.md`, Punkt 6).
    - **Nur Google und Apple, ohne E-Mail.** Verworfen, ohne dass danach gefragt wurde:
      Wer keines von beiden Konten benutzen will, käme gar nicht hinein. Bei einer App,
      die im Freundeskreis anfängt, ist ein ausgeschlossener Mensch teurer als ein
      dritter Anmeldeweg.

    **Den Haken kennt er:** Drei Wege heißen drei Wege, die kaputtgehen können, und sie
    gehen zu verschiedenen Zeiten kaputt — ein abgelaufener Google-Schlüssel sieht anders
    aus als ein abgelehnter Apple-Token. Deshalb gehört an jeden Weg eine eigene
    Fehlermeldung, die sagt, WELCHER nicht ging. Eine gemeinsame Meldung „Anmelden hat
    nicht geklappt" wäre bei drei Wegen die nutzloseste Auskunft der ganzen App.

---

### 35. Was „viel los" heißt — `stufeFuer()` in `features/posts/karte.ts` ✅

> **Ians achtunddreißigste Entscheidung, 2026-09-06: es bleibt bei gleich breiten
> Stufen.** Die Karte sagt damit weiter, *wo überhaupt etwas ist* — und bleibt im Kopf
> zurückrechenbar.

**Vorher ist etwas herausgekommen, das die Frage selbst verändert hat:** Von den drei
Möglichkeiten, die hier standen, waren **zwei fast dieselbe.** `Math.ceil(x) - 1` und
`Math.floor(x)` unterscheiden sich nur, wenn `x` genau eine ganze Zahl trifft — bei
`hoechst = 5` also bei **null von fünf** möglichen Werten, bei `hoechst = 10` bei einem
von zehn. „Aufrunden gegen Abrunden" ist keine Aussage über die Karte, sondern eine
Randkonvention. Das stand hier drei Wochen als echte Wahl.

**Die Lehre ist größer als der Punkt:** Wer drei Möglichkeiten aufschreibt, hat sie
damit noch nicht unterschieden. Nachgerechnet wurde erst, als jemand fragen sollte.

Gegenübergestellt wurden deshalb die drei, die sich wirklich unterscheiden:

| | heute (stärkster Bezirk: 5) | später (einer zieht davon: 50) |
|---|---|---|
| **gleich breite Stufen** ✅ | 5·3·2·1 → alle vier Stufen im Einsatz | 22 Bezirke auf derselben blassen Stufe |
| logarithmisch | dunkler, 3 und 5 nicht mehr zu trennen | die Mitte bleibt unterscheidbar |
| nach Rang (je ein Viertel) | immer genau so verteilt | sieht IMMER gleich aus, egal wie viel los ist |

**Den Haken kennt er:** Zieht ein Bezirk wirklich davon, wird die Karte am unteren
Ende blind. Das ist heute kein Zustand, den es gibt — der stärkste Bezirk hat fünf
Posts —, und die Korrektur ist eine Zeile. **Der Grund gegen „nach Rang" ist der
stärkere:** Eine Karte, die immer gleich aussieht, beantwortet die Frage nicht mehr,
für die es sie gibt.

### 39. Was beim Kontolöschen mit den eigenen Sachen passiert ✅

**Entschieden von Ian am 2026-09-06: A — alles mit.** Gebaut in
`simplysocial/supabase/migrations/0003_konto_loeschen.sql`; die verworfenen
Möglichkeiten stehen weiter in `supabase/entscheidungen/konto-loeschen.sql`.

**Die Frage kam aus dem Schema, nicht aus dem Plan.** `delete from auth.users`
scheiterte an `groups_creator_id_fkey`: Wer je gepostet oder eine Gruppe gegründet
hatte, konnte sein Konto überhaupt nicht löschen. Den Screen dafür gibt es seit
Phase 7 und Apple verlangt ihn (Richtlinie 1.2).

Verworfen sind **B** (Profil leeren, Verabredetes bleibt stehen) und **C** (nur
Posts ohne Zusagen gehen). Den Haken von A kennt er und hat ihn gewählt: Wer morgen
17:00 mit vier Leuten verabredet war, sagt allen vieren kommentarlos ab.

> **Die zweite Hälfte dieser Entscheidung ist die interessantere.** A sagte
> „Gruppen weg" — und kollidierte damit mit `GRUENDER_AUSTRITT = 'weitergeben'`
> (seine Entscheidung 13), die in `features/groups/gruppe.ts` als „nicht ohne
> Rückfrage ändern" markiert ist. Ein Konto zu löschen IST ein Verlassen. Gefragt,
> ob A das überschreibt, war seine Antwort die genauere von beiden:
>
> **A gilt für alles, was NUR mir gehört. Eine Gruppe gehört acht Leuten.**
>
> Damit bleibt Entscheidung 13 unangetastet: Die Gruppe geht an das Mitglied, das am
> längsten dabei ist (kleinstes `joined_at`). Ist niemand sonst drin, löst sie sich
> auf — keine Ausnahme, sondern dieselbe Regel, und genau so stand es schon im Kopf
> von `nachfolgerId()`.
>
> **Das ist der Grund, warum ein Screen eine Regel-Datei nie überstimmen darf:** Der
> Widerspruch war nur sichtbar, weil `GRUENDER_AUSTRITT` als benannte Konstante an
> EINER Stelle steht. Läge dieselbe Regel verstreut in drei Screens, hätte A sie
> still überschrieben.

**Der Screen versprach seit Phase 7 das Gegenteil, und niemand hätte es gemerkt.**
In `/account-loeschen` stand fest im JSX: „die Nachrichten selbst bleiben bei den
anderen stehen" — das ist Möglichkeit **B**. Über Gruppen stand gar nichts. Ein fest
getippter Satz ändert sich nicht mit, wenn jemand die Regel entscheidet; es gab keine
Stelle, die beim Wählen von A mitgewandert wäre. Behoben nach derselben Bauart wie
`blockFolgen()` (harte Regel 17): Die Sätze kommen jetzt aus `loeschFolgen()` in
`features/safety/konto.ts`, wo auch `LOESCH_WIRKUNG` und die verworfenen Möglichkeiten
stehen. **Das ist der eigentliche Ertrag der Regel-Dateien** — sie sind nicht Ordnung,
sie sind der Grund, warum eine Entscheidung überhaupt irgendwo ankommt.

**Zwei weitere Fehler kamen heraus, beide erst beim Ausführen:**
1. `reports.from_user_id` war `not null` UND `on delete set null`. Postgres nimmt
   diese Kombination beim Anlegen an und scheitert erst, wenn wirklich jemand sein
   Konto löscht — also am denkbar schlechtesten Tag. Ausgerechnet bei der Meldung,
   von der im Plan stand, sie sei bei allen drei Möglichkeiten gleich geregelt.
2. Die `auth.uid()`-Attrappe war **nicht** wortgleich mit Supabase: Sie castete vor
   dem `nullif`. Eine mit `set local` gesetzte und zurückgerollte Sitzungsvariable
   steht danach auf dem leeren String, und `''::json` ist `22P02`. Der Fehler sah aus
   wie einer in der Policy. **Eine Attrappe, die vom Original abweicht, prüft die
   Attrappe.**

---

### 40. Was der Standort darf — `features/posts/standort.ts` ✅

**Zwei Entscheidungen von Ian am 2026-09-09, beide vor dem ersten Handgriff an der
Oberfläche gestellt.** Sie führen seine Entscheidung 61 aus (*der Heimatbezirk ist die
Grundlage, der Standort kommt optional dazu*) und stehen als `STANDORT_ROLLE` und
`STANDORT_FRAGE` in einer Regel-Datei — die verworfenen Möglichkeiten samt Begründung
im Kopfkommentar, wie in allen sieben davor.

**Entscheidung 69 — A, der genauere AUSGANGSPUNKT.** Der Bezirk bleibt gesetzt und
gilt immer; solange ein Standort da ist, wird ab IHM gemessen statt ab der
Bezirksmitte. Verworfen:

| | | |
|---|---|---|
| **A** | ✅ genauerer Ausgangspunkt | seine Wahl — die wörtliche Lesart von Entscheidung 61 |
| **B** | nur den Bezirk automatisch setzen | überschreibt eine Angabe, die er selbst gemacht hat, für fast keinen Gewinn |
| **C** | ein Knopf „von hier aus" | ein Bedienelement mehr auf dem Startbildschirm, gegen harte Regel 63 |

**Den Haken kennt er, er stand in der Frage:** Die Reihenfolge ändert sich, ohne dass
jemand etwas getan hat — und die App darf es nicht erklären, weil sie den Standort
nirgends anzeigen darf (harte Regel 47). Die einzige Rückmeldung ist das Wort „An" in
den Einstellungen. Der Wechsel wäre EIN Wort; alle drei Rollen stehen fertig da.

**Entscheidung 70 — gefragt wird NUR im Schalter.** Kein Dialog beim Start, keiner
beim ersten Feed. Dahinter steht ein Sachverhalt, der die Wahl schwerer macht, als sie
aussieht: **iOS zeigt den Systemdialog nur ein einziges Mal.** Wer ihn wegdrückt,
kommt nur noch über die Systemeinstellungen zurück — ein Fehlgriff in einem Moment,
in dem jemand etwas ganz anderes vorhat, kostet die Funktion dauerhaft.

**Der Preis stand in der Frage und ist angenommen: Die meisten Leute finden den
Schalter nie.** Genau deshalb ist der Heimatbezirk die Grundlage und nicht der
Standort — die App muss ohne ihn vollständig funktionieren, und seit 19h-1 tut sie es.

### 41. Was aus einem Gruppen-Post wird, wenn die Gruppe aufhört ✅

**Ians Entscheidung vom 2026-09-10, gefragt beim Bauen von 20.5 (SQL).** Sie kam nicht
aus einem Screen, sondern aus einem WIDERSPRUCH zwischen zwei Dingen, die beide schon
da waren — und ohne harte Regel 58 wäre sie still entschieden worden.

**Der Widerspruch:** `AUSTRITT_WIRKUNG = 'posts-bleiben'` (seine Entscheidung 12) sagt,
dass die Posts eines Austretenden stehen bleiben. Löst sich die Gruppe aber ganz auf,
nahm `posts.visibility_group_id` mit `on delete cascade` sie mit. Zwei Regeln, beide
für sich richtig, mit gegensätzlichem Ergebnis — **und keine davon hatte jemand für
diesen Fall gefragt.**

**Gewählt: der Post bleibt stehen.** Verworfen:

| | | |
|---|---|---|
| **A** | ✅ Post bleibt stehen | seine Wahl — Entscheidung 12 gilt auch hier |
| **B** | Post geht mit der Gruppe | hätte über `useChatListe` still den CHAT zur Verabredung mitgenommen: Ein Aktivitäts-Chat ohne Post gilt dort als kaputter Datensatz und fällt aus der Liste |
| **C** | Post bleibt und wird öffentlich | genau das hat er am 2026-09-02 beim Austritt schon verworfen — macht aus „nur für meine Tennisgruppe" still „für ganz Wien" |

**Was daran technisch interessant ist, steht in Abschnitt 5b unter „Was beim Bauen von
20.5 (SQL) herauskam", Punkte 3 und 4:** A ließ sich nicht so bauen, wie es naheliegt.
`on delete set null` hätte einen Post mit `visibility_kind = 'group'` ohne Gruppen-ID
ergeben — den Zustand, den Phase 17 undarstellbar gemacht hat. Also verschwindet die
Gruppe nicht, sie HÖRT AUF (`aufgeloest_am`, keine Mitglieder, `creator_id = null`).

**Den Haken kennt er nicht ausdrücklich, und er ist klein:** Der Post ist danach nur
noch für seinen Verfasser sichtbar — `posts_lesen` fragt `regel.ist_mitglied`, und
Mitglieder gibt es keine mehr. Er läuft also weiter, aber niemand Neues kann ihn
finden. Wer schon zugesagt hat, behält Chat und Termin. **Genau deshalb ist A kein
Datenschutzproblem und C eines.**

---

### 42. Was oben im Chat steht, wenn die Aktivität gelöscht wurde ✅

**Ians Entscheidung vom 2026-09-10, gefragt beim Bauen von 20.4-a.** Auch sie kam nicht
aus einem Screen, sondern aus einem Zustand, den es im Prototyp GAR NICHT GEBEN KANN.

**Die Lage:** In der Datenbank steht an `chat_threads.post_id` ein `on delete set null`.
Löscht der Verfasser seinen Post — oder sein Konto, dann gehen die Posts mit
(Entscheidung 39) —, bleibt der Chat stehen und verliert seine Aktivität. Beide dürfen
sich weiter schreiben; dafür sorgt `aus_aktivitaet` (harte Regel 56). Aber der
Aktivitäts-Kopf oben im Chat hat nichts mehr anzuzeigen.

**Ohne Entscheidung sähe der Chat aus wie ein Direktchat** — als hätten die zwei sich
einfach so geschrieben. Das ist nicht wahr, und es ist genau die Stelle, an der man sich
nach zwei Wochen nicht mehr erinnert, woher man sich kennt.

**Gewählt: die Person, und darunter leise der Satz.** Verworfen:

| | | |
|---|---|---|
| **A** | ✅ Person + leise Zeile „Aus einer Aktivität, die es nicht mehr gibt." | seine Wahl — sagt die Wahrheit, ohne den Chat zum Grabstein zu machen |
| **B** | nur die Person, wie bisher | am ruhigsten, aber der Chat behauptet, ein Direktchat zu sein — und woher man sich kennt, ist das Einzige, was hier fehlt |
| **C** | ein eigener Kasten „Diese Aktivität wurde gelöscht" | am ehrlichsten und am lautesten: Er stünde für immer da, auch wenn die beiden noch monatelang schreiben |

**Der Satz steht als EINE Konstante** (`VERWAIST_TEXT` in `features/chat/direkt.ts`) und
kommt über `herkunftText()` in den Screen — dieselbe Bauart wie `blockFolgen()` und
`schreibHuerdeText()`. **Ein anderer Wortlaut ist damit ein Wort, keine Suche durch drei
Dateien.**

**Was beim Bauen daran hing, steht in Abschnitt 5b unter „Was beim Bauen von 20.4-a
herauskam", Punkt 6:** In `chat/hooks.ts` stand zweimal `if (!direkt && !post) return
undefined;`. Ohne Entscheidung 42 wäre der Chat nicht nur falsch beschriftet gewesen,
sondern aus der Liste verschwunden und **nicht mehr zu öffnen**.

❓ **Eine Frage bleibt offen und wartet auf ihn** (blockiert nichts): **Läuft so ein
Chat je ab?** Ein gewöhnlicher Aktivitäts-Chat verschwindet eine Woche nach dem Treffen
(`NACHKLANG_TAGE`, seine Entscheidung vom 2026-09-01). Ein verwaister hat keinen Termin
mehr, an dem diese Woche hängen könnte — `chatZustand(undefined)` gibt heute `'aktiv'`,
also bleibt er für immer. Das ist die vorsichtige Lesart von Entscheidung 41 („was
bleibt, bleibt"), aber es ist meine Auslegung und nicht seine Entscheidung.

### 43. Was dasteht, wenn die Daten nicht kommen ✅

**Ians Entscheidung vom 2026-09-12, gefragt beim Bauen von 20.4-b.** Die dritte in
Folge, die nicht aus einem Screen kam, sondern aus einer Eigenschaft der Technik
darunter.

**Die Lage:** `supabase-js` WIRFT NICHT. Es gibt `{ data, error }` zurück, und `data`
ist im Fehlerfall `null`. Der naheliegende Griff `data ?? []` macht aus **jedem**
Fehler — Netz weg, Token abgelaufen, Tabelle umbenannt — eine leere Liste. Und eine
leere Liste sagt in dieser App seit Phase 13:

> „Noch nichts los in deinem Feed"

**Das ist ein Satz, der lügt.** „Hier ist nichts" und „ich komme nicht dran" sind zwei
Lagen, und nur eine davon kann man beheben. Dieselbe Familie wie der unsichtbare
Startbildschirm vom 2026-09-11 (weißes Logo auf Papierweiß): **Ein Fehler, der nur als
ABWESENHEIT auftritt, überlebt jeden Typecheck und jeden grünen Lauf, weil niemand
hinsehen muss.**

**Gewählt: A, der Vollbild-Kasten.** Verworfen:

| | | |
|---|---|---|
| **A** | ✅ Vollbild-Kasten mit „Nochmal versuchen" | seine Wahl — unübersehbar, und der Ausweg steht daneben |
| **B** | leise Zeile über dem Feed | näher an Entscheidung 50, und an ihrer eigenen Stärke gescheitert: Ein LEERER Feed mit einem schmalen Streifen darüber sieht auf den ersten Blick immer noch aus wie „nichts los" |
| **C** | Rückfall auf `mock.ts` | gar nicht erst angeboten, und der Grund gehört aufgeschrieben: Er zeigt einem echten Menschen erfundene Leute mit erfundenen Verabredungen, ohne dass irgendwo steht, dass sie erfunden sind. Harte Regel 12 verbietet Persönliches in den Fake-Daten — hier wäre die Fälschung die Funktion |

**Der Haken ist benannt und gehört zu 20.3-b:** Wer im U-Bahn-Tunnel aufmacht, sieht
von der App gar nichts — auch nicht die Chats, die er vorhin gelesen hat. Das wird erst
besser, wenn es einen Speicher gibt, aus dem sich etwas zeigen ließe
(`expo-secure-store` / `AsyncStorage` kommen mit 20.3-b). **Dann ist B die
naheliegende Nachbesserung**, und `LADE_FEHLER` ist das eine Wort dafür.

**Die Regel steht in `src/data/quelle.ts`** (`LADE_FEHLER`, `ladeFehlerFolgen()`) —
dieselbe Bauart wie `safety/block.ts` (harte Regel 17), `groups/gruppe.ts` (32),
`requests/kollision.ts` (46), `posts/standort.ts` (68) und `auth/anmeldung.ts` (69).
Screens lesen die Konstante nie.

**Zwei Dinge kamen beim Bauen dazu, und beide sind keine Oberfläche:**

1. **Der Text sagt bei einer abgelaufenen Anmeldung etwas anderes.** `42501` heißt, dass
   die Datenbank den Zugriff verweigert hat — die Policies haben getan, wofür sie da
   sind, und die Ursache ist fast immer ein abgelaufenes Token. „Prüf dein Internet"
   wäre dort falsch beraten und schickt jemanden eine Viertelstunde zum Router.
   Dieselbe Unterscheidung, die harte Regel 57 von einer PRÜFUNG verlangt — hier für
   den Menschen davor.
2. **Und daran hing ein echter Mangel.** Beim ersten Bauen rief der Knopf in beiden
   Fällen `datenHolen()`: Er sagte „Anmelden" und lud neu. Bei abgelaufenem Token
   scheitern die nächsten dreizehn Abfragen genauso — eine Schleife, die wie ein
   kaputter Knopf aussieht. **Zwei für sich richtige Teile ergeben zusammen einen
   falschen Satz**, dieselbe Sorte wie die Verlassen-Rückfrage in Phase 17. Jetzt ruft
   er `abmelden()`, und der Torwächter zeigt den Anmelde-Bildschirm. Gemessen: „Du bist
   nicht mehr angemeldet" → Klick → Anmelde-Bildschirm, Adresse unverändert.

---

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
- ✅ **Backend-Wahl — entschieden am 2026-09-06: Supabase.** Die Begründung steht in
  Abschnitt 5b, Phase 20, und sie hängt an genau einer Eigenschaft: Firestore prüft eine
  Abfrage gegen ihre *mögliche* Ergebnismenge („security rules are not filters"), kann
  den Feed also nicht nach Sichtbarkeit filtern; eine Postgres-Policy tut es. Der
  bekannte Haken: Die Gratis-Stufe schläft nach 7 stillen Tagen ein.
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

> ❓ **Davor eine Frage, die auf Ian wartet — sie kostet keine Arbeitszeit, blockiert
> aber sonst still (2026-09-06):** Er hat die Landing-Page in drei Farben angefragt.
> Die Vorschauen liegen in **`landing-vorschau/`** (Olivgrün `#6E7B33`, Weinrot
> `#8A2540`, Türkis `#0E8189`). **Nicht im `landing/`-Repo** — sie können nicht
> versehentlich live gehen, und `git status` dort war nach dem Bauen leer.
>
> Offen ist **Farbe UND A oder B**: (A) auch die sechs Kategoriefarben werden
> Abstufungen der Leitfarbe — aus einem Guss, aber die Kategorie verrät sich nicht mehr
> über die Farbe; (B) nur Marke, Kategorien bleiben bunt. Steht ausgeschrieben in
> `landing-vorschau/LIESMICH.md` und in `_FUER_IAN/OFFENE_SACHEN.md`, Punkt 4b.
>
> **Wenn die Antwort da ist, drei Dinge, die man sonst übersieht:**
> 1. **Die Farbe muss an ZWEI Orte** — `simplysocial/src/theme/colors.ts` und
>    `landing/stil.css`. Letztere ist eine Kopie, keine Verbindung (harte Regel 13);
>    nur eine zu ändern fällt erst auf, wenn beides nebeneinander auf einem Schirm liegt.
> 2. **Elf Farbwerte hängen an keiner Variable.** Fünf in `stil.css` (Marker unter
>    „jetzt", Strich am Zitat, „Social" im Schriftzug, Live-Punkt, `::selection`) und
>    sechs als Liste im Code von `seite.js` (Konfetti — als Inline-Style gesetzt, dagegen
>    kommt CSS nur mit `!important` an). Alle elf stehen in den `farben-*.css` schon
>    aufgeschrieben; beim echten Einbau gehören sie in Variablen, dann ist die nächste
>    Farbänderung eine Zeile.
> 3. **Der Marker unter „jetzt" ist ein Textmarker-Strich, kein Rechteck** — `height:
>    .46em` deckt nur die untere Worthälfte, die obere steht auf Papierweiß. Der Text
>    muss deshalb DUNKEL bleiben, und die Fläche wird aufgehellt, bis er 4.5:1 erreicht.
>    Satt eingefärbt mit weißem Text verschwindet das Wort oben — beim Bauen genau so
>    passiert und erst am Screenshot gesehen, nicht im Code.
>
> Erzeugt wird alles von `landing-vorschau/erzeugen-palette.py` (leitet die Palette ab
> und misst jeden Kontrast) und `erzeugen-seiten.py` (baut die drei HTML-Hüllen). Eine
> vierte Farbe ist damit ein Eintrag im `LEIT`-Wörterbuch.

> ✅ **Phase 20.4-b ist fertig (2026-09-12): die App KANN aus Supabase lesen — und der
> Prototyp merkt davon nichts.** `npm run pruef-lesen` — **29 Häkchen, kein Kreuz am
> ECHTEN Server**, danach ist die Datenbank wieder leer. Eine neue Entscheidung von Ian
> (43). `tsc` sauber, **81 Lint-Probleme statt 83**, lokal weiter 121 Häkchen.
> Die vollständige Liste steht in Abschnitt 5b unter „Was beim Bauen von 20.4-b
> herauskam". Sechs Dinge, die eine frische Sitzung zuerst wissen muss:
>
> 1. **Der Schalter ist NICHT umgelegt, und das geht auch nicht.** `ANMELDE_QUELLE`
>    steht weiter auf `'attrappe'`; ohne echte Anmeldung gibt es kein Token, und die 33
>    Policies lassen dann null Zeilen durch. **20.4-b ist fertig, das Umlegen ist
>    20.3-b.** Was belegt ist, ist die ganze Kette darunter: echtes Supabase → PostgREST
>    → `supabase-js` → `zeilen.ts` → `AppState`, mit den Sichtbarkeitsregeln über HTTP
>    (Ian sieht vier Posts, Tobis fehlt wegen des Blocks, fremde Anfragen bleiben
>    unsichtbar).
> 2. **Es gibt genau EINEN Schalter.** `LIEST_AUS_SUPABASE` in `lib/supabase.ts` wird
>    aus `ANMELDE_QUELLE` ABGELEITET. Ein zweiter daneben könnte zwei Zustände
>    darstellen, die es nicht gibt — und beide scheitern stumm (siehe 5b, Punkt 2).
> 3. **`@supabase/supabase-js` ist JS-only: kein neuer Build.** Gemessen, nicht
>    vermutet. `persistSession: false` ist die Zeile, die das möglich macht — eine
>    gespeicherte Sitzung braucht `AsyncStorage`, und das ist nativ. **Der Preis dafür
>    gehört zu 20.3-b:** Wer die App schließt, ist ausgeloggt.
> 4. **Am Server ist etwas dazugekommen: `0005_realtime.sql`.** Die Publication
>    `supabase_realtime` war LEER — ein Abo hätte sich sauber verbunden und nie etwas
>    gemeldet. `einspielen.sh` misst jetzt **neun Zahlen statt sieben**, und es kann
>    einzelne Migrationen nachziehen: `npm run einspielen -- 0005_realtime.sql`.
>    **`blocks` und `reports` gehören NICHT hinein** (harte Regel 10, siehe 5b Punkt 4).
> 5. **`npm run deploy` bleibt ausdrücklich liegen.** Der Umbau kostet **+74.789 B gzip
>    (+18,3 %)** und tut auf der öffentlichen Prototyp-Adresse nichts, solange der
>    Schalter auf `'attrappe'` steht. Erst zusammen mit 20.3-b hochladen.
> 6. **Der neue Prüfstand weigert sich, sobald jemand ein Konto hat.**
>    `50_lesen.sh` bricht ab, wenn `auth.users` nicht leer ist — er schreibt in die
>    Produktionsdatenbank und räumt ab, und das Abräumen unterscheidet nicht, wem eine
>    Zeile gehört. **Ab dem ersten echten Nutzer gehört er in ein zweites
>    Supabase-Projekt.**
>
> 🔑 **Und der Zugang für die APP liegt seit demselben Tag in `.env`** —
> `npm run anon-key`, wieder über die Zwischenablage. **Damit ist die Konten-Seite von
> 20.3-b/20.4-b für Supabase vollständig; offen bleiben nur Apple-Sign-in und Google.**
> Drei Dinge sind wichtiger als die Datei:
> 
> 1. **Der anon key ist das GEGENTEIL eines Geheimnisses, und das muss man aussprechen.**
>    Er landet zwangsläufig im gebauten Bundle — jeder, der die App hat, kann ihn lesen.
>    Das ist kein Versäumnis, sondern das Modell: **Was er darf, entscheiden die 33
>    Policies, nicht seine Geheimhaltung.** Deshalb liegt er in `.env` (git-ignoriert,
>    mit `.env.example` als sichtbarer Vorlage) und nicht in `~/.simplysocial/` wie der
>    Verbindungs-String — und trotzdem nicht im Code, weil ein Wert im Quelltext beim
>    nächsten Projekt mitwandert und niemand merkt, dass er zu tauschen wäre.
> 2. **Der Wächter, auf den es ankommt, liest die Rolle AUS DEM TOKEN.** Auf derselben
>    Supabase-Seite steht der `service_role` key: gleiche Länge, gleicher Anfang `eyJ`,
>    gleiche Stelle in der Oberfläche — und er hebt **jede** Policy auf. Ein JWT trägt
>    seine Rolle als `role` in der Nutzlast, also wird nachgesehen statt dem Namen des
>    Feldes vertraut. Beide Richtungen belegt: echter Schlüssel → `anon`, durchgelassen;
>    ein **nachgebautes** `service_role`-Token → abgewiesen; `sb_secret_…` → abgewiesen.
> 3. **Die Project URL wird aus dem Token ABGELEITET, nicht abgetippt.** Der
>    Projekt-Verweis steht als `ref` schon drin. Zwei Quellen für dieselbe Angabe sind
>    zwei Gelegenheiten, dass sie auseinanderlaufen — dieselbe Überlegung wie
>    `PROJEKTION` in `karte-geo.ts` (harte Regel 53).
>    **Gegengemessen von aussen, über HTTP, so wie die App es tun wird:**
>    `GET /rest/v1/posts?limit=1` mit dem anon key → **HTTP 200**, leere Liste. Damit ist
>    nicht nur der Schlüssel geprüft, sondern die ganze Kette bis PostgREST.
>
>
> ✅ **Das Supabase-Projekt STEHT (2026-09-12) — Schema, Regeln und Funktionen sind
> eingespielt und am echten Server belegt.** Ians Konto, Region `eu-west-1` (Irland, nicht
> das empfohlene Frankfurt — immer noch EU, nur weiter weg). `npm run db-url` +
> `npm run einspielen`, danach alle sieben Zahlen grün: **13 Tabellen · 33 Policies · RLS
> auf allen 13 · 6 `regel.`-Funktionen · 9 `public.`-Funktionen · 8 Enums · 1 Trigger.**
> **Damit ist 20.3-b/20.4-b nicht mehr blockiert** — es fehlt nur noch der `anon key`.
> Fünf Dinge sind wichtiger als das Einspielen selbst:
> 
> 1. **Der Wächter hat beim ERSTEN echten Lauf angeschlagen — und der Fehler war meine
>    Messung.** `Trigger 6 statt 1`: Der Zähler war als einziger der sieben **nicht** auf
>    `nspname='public'` eingeschränkt und zählte Supabases eigene Trigger in `storage`
>    und `realtime` mit. **Lokal ist das folgenlos, weil die Wegwerf-Datenbank diese
>    Schemas gar nicht hat** — dieselbe Familie wie die Attrappen-Falle vom 2026-09-06:
>    *Eine Nachbildung, die WENIGER mitbringt als das Original, lässt eine Messung
>    durchgehen, die am Original falsch ist.* Der Wächter hat trotzdem getan, wofür er
>    gebaut ist: Er hat einen Unterschied gemeldet statt „fertig" zu sagen.
> 2. **Daraus kam eine Verbesserung, die vorher fehlte:** Ist die Datenbank nicht leer,
>    bricht `einspielen.sh` nicht mehr ab, sondern **misst nach**. „Steht schon alles
>    richtig da" und „da liegt etwas Halbes" sind zwei Lagen, und nur eine ist ein
>    Problem. Nach dem berichtigten Zähler war die Datenbank bereits vollständig — ein
>    blankes „✗ nicht leer" hätte das verschwiegen.
> 3. **Supabases echte `auth.uid()` verhält sich wie die Attrappe — gemessen, nicht
>    gehofft.** Am echten Server: `set local request.jwt.claims` → `auth.uid()` gibt die
>    `sub` zurück. Das ist der Beleg dafür, dass die 121 lokalen Prüfungen überhaupt etwas
>    über die echte Datenbank aussagen.
> 4. **Vier Angriffe am echten Server, alle gehalten:** `anon` sieht **0** Posts, ein
>    angemeldeter Fremder sieht **0** Blocks (harte Regel 10), und ein `insert` als `anon`
>    scheitert mit **`42501`**. Der erste Versuch dazu war wertlos und sah trotzdem nach
>    Erfolg aus: Er scheiterte an einem falschen SPALTENNAMEN, nicht an RLS — genau der
>    Fall, gegen den harte Regel 57 den `SQLSTATE`-Vergleich verlangt.
> 5. **`npm run db-url` legt den Verbindungs-String über die ZWISCHENABLAGE ab**, in zwei
>    Schritten: erst der String mit `[YOUR-PASSWORD]` als Entwurf, dann nur noch das
>    Passwort — URL-kodiert (Supabase-Passwörter enthalten `@ : / ? #`, und ein blankes
>    `@` macht aus dem Rest einen Hostnamen) und über **stdin** statt als Argument, weil
>    Argumente in `ps` stehen. Danach wird die Verbindung wirklich aufgebaut.
>    **Zwei eigene Fehler dabei, beide „keine Meldung" statt „falsche Meldung":** ohne
>    `PGCONNECT_TIMEOUT` hängt psql minutenlang und sieht aus wie ein hängendes Skript;
>    und `set -e` tötete das Skript beim psql-Fehlercode, **bevor die eigens gebaute
>    Diagnose überhaupt lief** — drei Läufe lang gab es nur `exit=2` und keinen Text.
>
>
> 🔜 **Das Erste, was zu tun ist (Stand 2026-09-12, SPÄTESTER Eintrag): Ian legt
> Supabase an — und das Einspielen ist seither ein Befehl statt vier Copy-Paste.**
> Zwei Entscheidungen von ihm an dem Tag, beide in dieser Sitzung:
>
> - **Supabase jetzt** (gegen „ohne ihn mit einem lokalen Server weiterbauen" und
>   gegen „erst herzeigen"). Damit ist 20.4-b der nächste Bauschritt.
> - **TestFlight INTERN** für Christoph, Leopold und Daria — sie werden Benutzer
>   seines Kontos, dafür entfällt Apples Beta-Prüfung und mit ihr die Altersfrage.
>
> **`supabase/einspielen.sh` (`npm run einspielen`) ist neu und in BEIDE Richtungen
> belegt**, bevor es je ein echtes Projekt gesehen hat:
>
> 1. **Die teuerste denkbare Verwechslung hat einen Namen: `00_supabase_lokal.sql`.**
>    Die Attrappe bringt `auth.users` und `auth.uid()` genauso mit wie das Original —
>    wer die beiden Ziele vertauscht, spielt 33 Policies gegen eine Datenbank ein, in
>    der `auth.uid()` etwas anderes bedeutet, und **bekommt keine einzige
>    Fehlermeldung**. Gefragt wird deshalb nach dem, was NUR das echte Supabase hat:
>    Schema `storage` und Rolle `service_role`. Gemessen: lokale Wegwerf-DB → 0/0,
>    Abbruch; ein Ziel mit beidem → durchgelaufen und alle sieben Zahlen grün.
> 2. **Alle vier Migrationen laufen in EINER Transaktion** (`--single-transaction`).
>    Harte Regel 6 eine Ebene tiefer: Ein Abbruch nach `0002` hinterliesse Tabellen
>    **ohne** Schreibwege — und weil ein fehlender `grant` in diesem Projekt eine
>    Zusage ist (Regel 70), sähe die halb eingespielte Datenbank aus wie eine
>    absichtlich strenge.
> 3. **Danach wird NACHGEMESSEN, nicht „fertig" gemeldet.** `psql` gibt 0 zurück,
>    wenn es lief — die Frage ist aber „steht jetzt dasselbe da wie lokal?".
>    Sieben Zahlen aus der Datenbank, gegen die 121 Prüfungen grün sind:
>    **13 Tabellen · 33 Policies · RLS auf allen 13 · 6 `regel.`-Funktionen ·
>    9 `public.`-Funktionen · 8 Enums · 1 Trigger.** Ändert eine Migration sich,
>    gehören die Zahlen im Skript nachgezogen — eine Erwartung, die niemand misst,
>    wird zur nächsten Vorhersage 19.4.
> 4. **Der dritte Wächter ist der langweiligste und der wichtigste:** Läuft das
>    Skript ein zweites Mal, bricht es ab, weil `public` nicht mehr leer ist.
>    Eine Produktionsdatenbank neu aufzubauen ist eine Entscheidung von Ian, keine
>    Nebenwirkung eines Skriptlaufs.
> 5. **Nebenbefund am Passwortfilter, im Test aufgetaucht:** Postgres spiegelt bei
>    einem Verbindungsfehler den ganzen String zurück, Passwort inklusive — der
>    Filter ist also nicht Zierde. Er ersetzt aber stumpf jedes Vorkommen: Mit dem
>    Testpasswort `x` wurde aus „does not exist" ein „does not e«PASSWORT»ist".
>    **Der Fehler geht in die harmlose Richtung** — er verstümmelt eine Meldung,
>    statt ein Geheimnis durchzulassen. Wer ihn „repariert" (Wortgrenzen), tauscht
>    einen Schönheitsfehler gegen ein Leck.
>
> **Für TestFlight ist alles vorbereitet, es fehlen drei E-Mail-Adressen** (die
> Apple-IDs der drei). `npm run asc tester -- Vor:Nach:mail [--wirklich]`. Zwei Dinge
> sind daran wichtiger als der Aufruf:
>
> - **Die Rolle ist eine Entscheidung und steht als Konstante** (`TESTER_ROLLE`,
>   `scripts/asc.py`). Apple lässt als interne Tester **nur fünf** Rollen zu
>   (nachgelesen, nicht geraten): ACCOUNT_HOLDER, ADMIN, APP_MANAGER, DEVELOPER,
>   MARKETING. **`READ_ONLY` und `CUSTOMER_SUPPORT` gehen NICHT** — ausgerechnet die
>   beiden, die am harmlosesten klingen. Gewählt ist `MARKETING`, die kleinste
>   zulässige; `DEVELOPER` wäre der naheliegende Griff und darf **Zertifikate und
>   Provisioning-Profile verwalten**, also genau das, woran am 2026-09-11 ein
>   20-Minuten-Build hing. Dazu `allAppsVisible: false`: nur diese eine App.
> - **Ohne `--wirklich` passiert nichts.** Apple verschickt die Einladung im Moment
>   des Anlegens und NUR dann (die Lehre vom 2026-09-11), und für interne Tester gibt
>   es keinen Nachschick-Aufruf. Die Vorschau ist gegengemessen: 0 offene
>   Einladungen danach.
>
> ---
>
> 🔜 **Das Erste, was zu tun ist (Stand 2026-09-10 abends, SPÄTESTER Eintrag): Ians
> Konten sind jetzt der EINZIGE Engpass.** ✅ **20.4-a ist gebaut** — die Übersetzung
> (`src/data/zeilen.ts`), beide abgesprochenen Schulden bezahlt, Belege `ah01`–`ah03`;
> **121 Häkchen statt 78** (Einzelheiten in Abschnitt 5b unter „Was beim Bauen von
> 20.4-a herauskam"). Sieben Dinge, die eine frische Sitzung zuerst wissen muss:
>
> - **Ohne Ians Konten ist alles gebaut, was ohne sie ging.** 20.1, 20.2, 20.3-a, 20.5
>   (SQL) und 20.4-a sind fertig. Was bleibt, braucht ein eingerichtetes Projekt:
>   **20.3-b** (Supabase, Apple, Google — vier Native-Bausteine in EINEM Build) und
>   **20.4-b** (der Client, die Abfragen, Realtime).
> - **`bash supabase/pruefen/aufbauen.sh` erwartet ab jetzt 121 Häkchen und kein
>   Kreuz.** Es ruft `30_wettlauf.sh` UND `40_uebersetzung.sh` mit; letzteres **ändert
>   die Datenbank** (löst eine Gruppe auf, löscht einen Post) und läuft deshalb als
>   letzte. Wer `postgresql@17` nicht hat: `brew install postgresql@17`.
> - **Der Zeitstempel ist der Fund, den man beim Weiterbauen im Kopf haben muss.**
>   Jeder Wert aus der Datenbank geht durch `zeitpunkt()` — neun Stellen der App
>   sortieren Zeitstempel als TEXT (harte Regel 72). Wer eine zweite Quelle
>   anschließt, taucht sie durch dieselbe Funktion.
> - **`data/zeilen.ts` importiert AUSSCHLIESSLICH Typen, und das ist Absicht.** Nach
>   `tsc` bleibt kein Import übrig, also läuft die Datei in blankem Node — nur deshalb
>   kann `40_uebersetzung.sh` echte Postgres-Zeilen durch die echte Regel-Datei
>   schicken. Wer dort einen Baustein hineinimportiert, nimmt dem Prüfskript die
>   Grundlage.
> - **Ians 42. Entscheidung ist neu** (Abschnitt 6): Ein Chat, dessen Aktivität
>   gelöscht wurde, zeigt die Person und darunter leise *„Aus einer Aktivität, die es
>   nicht mehr gibt."* Der Satz steht als EINE Konstante (`VERWAIST_TEXT`).
> - ❓ **Eine Auslegung wartet auf ihn** (blockiert nichts): Ein verwaister Chat läuft
>   NIE ab, weil ohne Post kein Termin da ist, an dem `NACHKLANG_TAGE` hängen könnte.
>   Steht am Ende von Abschnitt 6, Punkt 42.
> - **Was `tsc` bei dieser Sorte Arbeit NICHT findet, steht in harter Regel 73.** Eine
>   Lockerung (`aufgeloestAm?`) meldet null Fehler; die zwei echten Löcher (Einladung
>   in eine tote Gruppe, Beitritt in eine tote Gruppe) fand nur Nachsehen von Hand.
>
> ---
>
> 🍏 **Neu am 2026-09-11: Ian hat das Apple Developer Program.** Der Engpass 20.3-b
> besteht weiter — es fehlen **Supabase und Google** —, aber drei Dinge haben sich
> geändert:
>
> - **Vier Stellen dieses Plans behaupteten seit dem 2026-08-31, das Programm sei
>   gekauft, und das war falsch.** Abschnitt 1 („Endziel"), die Kostentabelle in 21.6,
>   die MapKit-JS-Zeile in Abschnitt 5b und die Voraussetzungen von 19.4 — während
>   19.4 daneben richtig schrieb, Ian habe *„heute nur eine gewöhnliche Apple-ID"*.
>   Die Angabe stammt aus dem Brief und wurde nie nachgeprüft. **Aufgefallen ist es
>   nie, weil Phase 19 den EAS-Weg gar nicht ging** — der lokale `xcodebuild`-Weg
>   braucht keine Mitgliedschaft, dort zeigt sich ihr Fehlen nur als „7 Tage".
>   Alle vier sind berichtigt. **Eine Voraussetzung, die nie jemand misst, steht
>   irgendwann falsch da** — dieselbe Familie wie der ungenutzte Parameter `_ctx`
>   aus 19h-1.
> - **Die Team-ID bleibt `5TQTMP2L2H` — Apple wertet das Personal Team AUF, statt ein
>   zweites anzulegen.** Gemessen an derselben Datei im Abstand von neun Minuten:
>   21:46 `teamType: "Personal Team"` / `isFreeProvisioningTeam: true`, nach einem Klick
>   auf das Konto in Xcode 21:55 `teamType: "Individual"` / `false`. **Veraltet war
>   Xcodes Zwischenspeicher, nicht Apples Antwort.** Die Annahme „es kommt eine NEUE
>   Team-ID" war falsch und stand kurzzeitig in allen vier Dateien; `DEVELOPMENT_TEAM`
>   im `project.pbxproj` musste nicht angefasst werden. **Wer nur auf die ID schaut,
>   sieht den Unterschied nie — er steht in `teamType`.**
> - **Die Fassung auf Ians iPhone läuft am 2026-09-14 um 22:00 UTC ab.** Gemessen im
>   eingebetteten Profil (`TimeToLive: 7`, erzeugt 2026-09-07 22:00), nicht geschätzt.
>   **Der Gerätebuild ist seit dem 2026-09-11 ein Skript** (`npm run geraet`).
>   Der nächste Gerätebuild gilt ein Jahr; danach ist **TestFlight** möglich und damit
>   Punkt 8 der Reihenfolge — Christoph, Leopold und Daria auf ihren eigenen Handys.
>
> ❓ **Offen und später teuer:** Läuft das Programm auf Ian (16) oder auf einen
> Erwachsenen? Davon hängen Anbietername, Verträge und der Sign-in-Schlüssel ab.
> Die Klickfolge für alle drei Konten steht in `_FUER_IAN/KONTEN_EINRICHTEN.md`.
>
> ---
>
> 📎 **Stand davor (er gilt weiter, wo er nicht überholt ist).**
> 🔜 **(Stand 2026-09-10 früh): Phase 20.4 —
> `store.ts` aus der Datenbank lesen. Und die Konten von Ian sind weiter der einzige
> echte Engpass (20.3-b).** ✅ **Die SQL-Seite von 20.5 ist gebaut** (sieben Funktionen
> und ein Trigger in `migrations/0004_transaktionen.sql`; **78 Häkchen statt 25**,
> Einzelheiten in Abschnitt 5b unter „Was beim Bauen von 20.5 (SQL) herauskam").
> Sechs Dinge, die eine frische Sitzung zuerst wissen muss:
>
> - **20.3-b braucht Supabase, Apple und Google und sonst nichts.** Daran hat sich
>   nichts geändert. `ANMELDE_QUELLE` in `features/auth/anmeldung.ts` ist der eine
>   Schalter; alles darüber ist schon das Echte.
> - **Warum 20.5 vor 20.4 kam:** Dieselbe Trennung, die bei 20.1/20.2 getragen hat —
>   *halten die Regeln?* geht ohne Konto, *ist das Projekt eingerichtet?* nicht.
>   20.4 (Lesen) braucht einen echten Server, 20.5 (Schreiben, SQL) nicht.
> - **Die Rechteliste aus 0002 hat die Arbeitsliste geschrieben.** Der Plan nannte
>   drei Funktionen; es sind sieben, und die vier zusätzlichen ergaben sich aus
>   fehlenden `grant`s (`group_members`, `chat_threads`, `chat_participants` haben
>   nur `select`). Ein fehlender Grant ist in diesem Projekt eine ZUSAGE.
> - **Ians 41. Entscheidung ist neu und steht in Abschnitt 6:** Löst sich eine
>   Gruppe auf, BLEIBT ein Gruppen-Post stehen. Die Gruppe wird deshalb nicht mehr
>   gelöscht, sondern hört auf (`aufgeloest_am`, `creator_id = null`).
> - ⚠️ **Die Schuld daraus liegt in 20.4 und ist ausdrücklich abgesprochen:** `Group`
>   braucht ein `aufgeloestAm?`, und **jede Gruppen-LISTE muss es herausfiltern** —
>   sonst steht eine tote Gruppe unter „Deine Gruppen". Steht am Feld in 0001 und in
>   Abschnitt 5b, nicht nur an einer Stelle. Dieselbe Bauart wie `aus_aktivitaet`
>   (harte Regel 56).
> - **`bash supabase/pruefen/aufbauen.sh` erwartet ab jetzt 78 Häkchen und kein
>   Kreuz** und ruft `30_wettlauf.sh` mit. Wer `postgresql@17` nicht hat:
>   `brew install postgresql@17`.
>
> ---
>
> 📎 **Stand davor (die Ausschreibung von 20.3-b).**
> 🔜 **(Stand 2026-09-09 nachts):
> Phase 20.3-b — die Konten. Und das ist die erste Aufgabe, die WIRKLICH auf Ian
> wartet.** ✅ **20.3-a ist gebaut** (die Naht: Konstante gelöscht, Sitzung,
> Torwächter, Anmelde-Bildschirm mit Attrappe, Abmelden; Belege `ag01`–`ag03`,
> Einzelheiten in Abschnitt 5b unter „Was beim Bauen von 20.3-a herauskam"). Sechs
> Dinge, die eine frische Sitzung zuerst wissen muss:
>
> - **Es fehlen genau drei Konten: Supabase, Apple Developer, Google.** Alles, was
>   ohne sie ging, ist gemacht. Der Umbau der 110 Fundstellen ist durch, `tsc` sauber,
>   83 Lint-Probleme wie vorher.
> - **`ANMELDE_QUELLE` in `features/auth/anmeldung.ts` ist der eine Schalter.** Steht
>   er auf `'supabase'`, startet die App ausgeloggt, der Attrappen-Knopf verschwindet
>   und die drei Wege werden `bereit`. Alles darüber ist schon das Echte.
> - **Die Bezirksfrage (Entscheidung 64) gehört in 20.3-b**, an das erste NEUE Konto —
>   nicht in den Anmelde-Bildschirm der Attrappe, die einen Menschen anmeldet, der
>   seinen Bezirk längst hat. Der Schalter in `/einstellungen` bleibt daneben bestehen.
> - **Reihenfolge, die Apple erzwingt:** Sobald Google dabei ist, ist „Anmelden mit
>   Apple" nach Richtlinie 4.8 **Pflicht**. Apple muss also fertig sein, BEVOR Google
>   live geht. Steht als Kommentar an `ANMELDE_WEGE`.
> - **Vier Bausteine kommen in EINEN Build** (`expo-apple-authentication`,
>   `expo-auth-session` + `expo-web-browser`, `expo-secure-store`, `async-storage`).
>   **Vor jedem `expo prebuild` eine Kopie von
>   `ios/SimplySocial.xcodeproj/project.pbxproj`** — auch der Lauf OHNE `--clean` wirft
>   `DEVELOPMENT_TEAM` und `CODE_SIGN_STYLE` weg. Und **Bauplatz außerhalb von iCloud**
>   (`-derivedDataPath ~/Library/Developer/Xcode/DerivedData/SimplySocial-geraet`).
> - **Wer am Torwächter etwas ändert, misst danach `location.href`, nicht den
>   Bildschirm.** Beim Abbau des Navigators schreibt `expo-router` die Adresse neu; das
>   hat 20.3-a einmal auf `/account-loeschen` gesetzt, ohne dass am Bild etwas falsch
>   aussah (harte Regel 69 und die Fallen-Liste).
>
> ---
>
> 📎 **Stand davor (die Ausschreibung von 20.3, aus der 20.3-a gebaut wurde).**
> 19i und 19h-2 sind beide gebaut; damit ist **die ganze Phase 19 fertig
> bis auf 19d-2 (MapKit JS im Browser), und die hängt selbst an 20.3.** Sieben Dinge,
> die eine frische Sitzung zuerst wissen muss:
>
> - **Ohne Ians Konten geht 20.3 nicht weiter:** Supabase-Projekt, Apple Developer,
>   Google. **Was OHNE sie geht und zuerst drankommt, ist der JS-Teil**:
>   `CURRENT_USER_ID` **ersatzlos löschen** (nicht auf `string | null` setzen — das
>   wäre die `Post.district`-Falle zum fünften Mal), `useCurrentUserId()` an ihre
>   Stelle, und der ausgeloggte Zustand eine Ebene höher. Sechs Stellen lesen die
>   Konstante direkt; `tsc` schreibt die Arbeitsliste. Einzelheiten in Abschnitt 5b
>   unter 20.3.
> - **Dieselbe Trennung hat schon bei 20.1/20.2 getragen:** *halten die Regeln?* und
>   *ist das Projekt eingerichtet?* sind zwei Fragen. 25 Angriffe liefen gegen eine
>   Wegwerf-Datenbank, ohne dass es ein Supabase-Konto gab
>   (`bash supabase/pruefen/aufbauen.sh`).
> - **Der Standort ist seit 19h-2 gebaut und wartet auf einen Gerätedurchgang.** Was
>   im Browser nicht zu prüfen war, ist der echte iOS-Erlaubnis-Dialog — dort ist nur
>   die Betriebssystem-Grenze nachgestellt. **Wichtig für 20.3:** *„man gibt am Anfang
>   seinen Bezirk an"* (Entscheidung 64) gehört ins Anmelden; der Schalter in
>   `/einstellungen` bleibt daneben bestehen.
> - **`expo-location` ist drin, der nächste Build braucht also nichts Neues mehr für
>   19h-2** — 20.3 bringt aber vier weitere Bausteine mit
>   (`expo-apple-authentication`, `expo-auth-session` + `expo-web-browser`,
>   `expo-secure-store`, `async-storage`), und die kommen **alle zusammen in EINEN
>   Build**.
> - **Reihenfolge, die Apple erzwingt:** Sobald Google dabei ist, ist „Anmelden mit
>   Apple" nach Richtlinie 4.8 **Pflicht**. Also muss Apple fertig sein, BEVOR Google
>   live geht — sonst Ablehnung im Review.
> - **Vor jedem `expo prebuild` eine Kopie von `ios/SimplySocial.xcodeproj/project.pbxproj`
>   anlegen.** Am 2026-09-09 hat auch der Lauf OHNE `--clean` `DEVELOPMENT_TEAM` und
>   `CODE_SIGN_STYLE` weggeworfen. Für einen Simulator-Build fällt das nicht auf —
>   erst der nächste GERÄTEbuild scheitert daran. Und **Bauplatz außerhalb von iCloud**
>   (`-derivedDataPath ~/Library/Developer/Xcode/DerivedData/SimplySocial-geraet`).
> - **Der Hilfszugriff für den Simulator ist inzwischen erlaubt** — der 19i-Blocker ist
>   weg. Wenn `count of windows` trotzdem 0 meldet, **schläft der Bildschirm**; das
>   sieht gleich aus und ist eine andere Ursache.
>
> ---
>
> 📎 **Stand davor (erledigt): Phase 19i — „Der Bezirk als Vollbild, und das Glas
> überall".** Ians fünf Punkte,
> nachdem 19h-1 auf seinem iPhone lief; **er hat danach gecleart, der Auftrag steht
> vollständig in Abschnitt 5b unter Phase 19i.** Sechs Dinge, die eine frische
> Sitzung zuerst wissen muss:
>
> - **Die zwei Auslegungsfragen sind schon beantwortet** — vor dem Clear gefragt: Es
>   geht um das **Blatt** (`SsBlatt`), nicht um Blase oder Tab-Kapsel; und „nur die
>   Bar unten" gilt **nur auf dem neuen Bezirks-Vollbild**, nicht am Startbildschirm.
>   **Nicht noch einmal fragen, das ist erledigt.**
> - **Sein Handy bleibt nicht angesteckt.** Alles geht ohne neuen Baustein, gebaut und
>   geprüft wird am Simulator (iOS 26.5). Auf sein Gerät kommt es beim nächsten
>   Anstecken — der Release-Build hat sein JS eingebacken.
> - **Beim Glas zuerst ein VORBILD anfordern, bevor irgendetwas angefasst wird.**
>   Zweimal lag es an Form und Untergrund, nicht am Effekt; beide Male hat erst ein
>   Screenshot die Frage entschieden. Und der wahrscheinlichste Grund, warum es
>   „überall" nicht wirken wird, steht schon im Plan: **Glas braucht bewegten Inhalt
>   dahinter, und auf den meisten Screens liegt Papierweiß.**
> - **Die zu weit oben sitzenden Tab-Icons sind mein eigener Fehler aus 19h-1**
>   (`tabBarShowLabel: false` lässt den Label-Platz stehen). Nachmessen, nicht
>   anschauen.
> - **`SsBlatt` nicht löschen**, auch wenn es niemand mehr ruft — harte Regel 51.
> - **Danach offen wie bisher:** 19h-2 (`expo-location`, braucht einen Build) oder
>   gleich Phase 20.3 (Anmelden). **Weil dann ein Build ansteht: Bauplatz außerhalb
>   von iCloud** (`-derivedDataPath ~/Library/Developer/Xcode/DerivedData/SimplySocial-geraet`).
>
> ---
>
> 📎 **Stand davor (erledigt): Phase 19h-1 — „Nähe statt Filter".** ✅ **19h-1 ist
> gebaut** (Entscheidungen 62, 63, 64 — ohne neuen Build; Belege `ad01`–`ad10`,
> Einzelheiten in Abschnitt 5b unter „Was beim Bauen von 19h-1 herauskam"). Fünf
> Dinge, die eine frische Sitzung zuerst wissen muss:
>
> - **Die Reihenfolge des Feeds ist seit heute die ENTFERNUNG** (Entscheidung 63,
>   `features/posts/sort.ts`) — sie hat Entscheidung 1 vom ersten Projekttag
>   abgelöst, nach ausdrücklicher Rückfrage (harte Regel 58). Wer daran etwas
>   ändert, liest zuerst den Kopf der Datei: **Entscheidung 1 ist nicht gelöscht,
>   sie ist die zweite Stufe.** Beide tragen weiter „nicht ohne Rückfrage".
> - **Der Bezirks-Filter ist weg, `filter.bezirk` ist es NICHT.** Die Karte setzt
>   ihn weiter (harte Regel 50); im Filterblatt steht statt einer Auswahl nur noch
>   eine Rücknahme, und die nur, wenn etwas zu widerrufen ist. Wer die Pillenreihe
>   „vermisst", hat Entscheidung 63 nicht gelesen.
> - **Der Heimatbezirk steht in `/einstellungen`, ganz oben** (Entscheidung 64) —
>   und er ist im Prototyp der EINZIGE Weg, die Nähe-Regel überhaupt auszuprobieren.
>   In Phase 20.3 fragt danach das Anmelden; die Einstellung bleibt trotzdem.
> - **19h-2 (`expo-location`) ist unberührt und braucht einen neuen Build** —
>   Erlaubnis-Dialog, ein Eintrag in Apples Datenschutz-Angaben, und harte Regel 47
>   wird dort scharf: Ein Standort darf die Reihenfolge bestimmen, er darf nirgends
>   stehen. **Weil ein Build ansteht: Bauplatz außerhalb von iCloud**
>   (`-derivedDataPath ~/Library/Developer/Xcode/DerivedData/SimplySocial-geraet`),
>   sonst scheitert `codesign`.
> - **Zwei Auslegungen aus 19f/19g warten weiter auf Ians Urteil, keine blockiert:**
>   Kategorie-Chip und Verfasser-Notiz am Post-Screen (`ab01`/`ab02`), und ob eine
>   ZEILE der Kartenblase das Blatt öffnen soll oder nur die Fußzeile (`ac05`/`ac06`).
>   **Er urteilt am Bild, nicht an einer Beschreibung.**
>
> ---
>
> 📎 **Stand davor (erledigt): Phase 19g — „Die Karte fertig machen".** ✅ **19f ist gebaut** (alle sechs
> Entscheidungen 51–56, ohne neuen Build; Belege `ab01`–`ab08`, Einzelheiten in
> Abschnitt 5b unter „Was beim Bauen von 19f herauskam"). Fünf Dinge, die eine frische
> Sitzung zuerst wissen muss:
>
> - **Zwei Stellen aus 19f warten auf Ians Urteil, keine davon blockiert:** der
>   Kategorie-Chip steht jetzt in der Zeile des Zurück-Pfeils statt darüber, und die
>   **Notiz des Verfassers liegt hinter „Mehr ansehen"**. Beides sind meine
>   Auslegungen innerhalb seiner Entscheidung 51, beide in einer Minute rückgängig.
>   **Er urteilt am Bild — `ab01-post-zu-360.png` und `ab02-post-mehr-360.png`
>   herzeigen, nicht beschreiben.**
> - **Harte Regel 63 steht weiter über allem**, und ihre zweite Richtung ist die
>   ungewohnte: Sie bremst, was noch nicht gebaut ist. In 19g heißt das, dass eine
>   neue Bedienfläche auf der Karte begründen muss, warum sie im Weg stehen darf.
> - **Das Liquid Glass ist echt und sieht trotzdem falsch aus.** Nicht die Technik
>   anfassen (das ist gemessen), sondern die FORM — die Kollision Blatt gegen
>   schwebende Tab-Kapsel. Zwei Auswege stehen in 19g, meine Empfehlung ist (b);
>   **als Vorschau bauen, nicht als Tatsache.**
> - **Auf einen Screenshot wird gewartet:** „Karte nach oben wischen sieht komisch
>   aus". Ohne das Bild wird daran nicht gearbeitet — ein Bild, das falsch aussieht,
>   ist noch kein Fehler (die Lehre aus 19e-2).
> - **Der Bauplatz gehört außerhalb von iCloud** (`-derivedDataPath
>   ~/Library/Developer/Xcode/DerivedData/SimplySocial-geraet`), sonst scheitert
>   `codesign`. Erst nötig, wenn wieder ein Gerätebuild ansteht — 19g braucht keinen.
>
> ---
>
> 📎 **Stand davor (erledigt): Phase 19f bauen — „Weniger sehen".** Der Gerätedurchgang IST gemacht, Ians Feedback
> steht ausgeschrieben in Abschnitt 5b (Phasen 19f, 19g, 19h; zwölf Entscheidungen,
> 50–61). **19f und 19g brauchen keinen neuen Baustein und keinen neuen Build.**
> Vier Dinge, die eine frische Sitzung zuerst wissen muss:
>
> - **Harte Regel 63 (Ians Entscheidung 50) steht über allem, was jetzt kommt:** Ein
>   Bildschirm zeigt nur, was für die Entscheidung HIER nötig ist — und die Regel
>   BREMST auch, was noch nicht gebaut ist. Vor jedem neuen Element fragen, ob es im
>   Weg stehen darf.
> - **Das Liquid Glass ist echt und sieht trotzdem falsch aus.** Nicht die Technik
>   anfassen (das ist gemessen), sondern die FORM — die Kollision Blatt gegen
>   schwebende Tab-Kapsel, siehe 19g. Zwei Auswege stehen dort, meine Empfehlung ist
>   (b); **Ian urteilt am Bild, also als Vorschau bauen, nicht als Tatsache.**
> - **Auf einen Screenshot wird gewartet:** „Karte nach oben wischen sieht komisch aus".
>   Ohne das Bild wird daran nicht gearbeitet — ein Bild, das falsch aussieht, ist noch
>   kein Fehler (die Lehre aus 19e-2).
> - **Der Bauplatz gehört außerhalb von iCloud** (`-derivedDataPath
>   ~/Library/Developer/Xcode/DerivedData/SimplySocial-geraet`), sonst scheitert
>   `codesign`. Die Befehle stehen im Eintrag darunter.
>
> ---
>
> 📎 **Stand 2026-09-08 nachmittags (erledigt): die App auf Ians iPhone bekommen.**
> Fünf Dinge, die dabei herauskamen:
>
> 1. **Sie läuft** — `App installed: at.simplysocial.app`, dann `Launched application`,
>    Prozess lebt (PID gegen `devicectl device info processes` geprüft). Release-Build,
>    48 MB, `main.jsbundle` 3,0 MB eingebacken, signiert (`Apple Development:
>    ian.fhorak@gmail.com`, Personal Team, **7 Tage**). **Der letzte Schritt war Ians:**
>    Ein erster Start scheiterte mit `FBSOpenApplicationServiceErrorDomain error 1` →
>    *„profile has not been explicitly trusted by the user"*. Das ist **kein Fehler,
>    sondern Apples Absicht** — Einstellungen → Allgemein → VPN & Geräteverwaltung →
>    Profil antippen → vertrauen. Danach `xcrun devicectl device process launch
>    --device <udid> at.simplysocial.app`.
>    **Offen ist der Durchgang selbst:** Wischstapel, Tastatur im Chat,
>    Jahrgangs-Regler, Tipp auf die Apple-Karte, **Blatt gegen Karte** (der kritische)
>    und wie das Glas auf iOS 26.6 aussieht.
> 2. **Der Bauplatz darf NICHT in iCloud liegen — und das hat einen ganzen Build
>    gekostet.** `C.C.Projekts_Ian` liegt auf dem Schreibtisch, den iCloud verwaltet;
>    iCloud hängt an Framework-Ordner `com.apple.FinderInfo`, und `codesign` bricht dann
>    ab mit *„resource fork, Finder information, or similar detritus not allowed"*.
>    **Wegräumen hilft nicht** — gemessen: `xattr -c`, und nach fünf Sekunden ist das
>    Attribut wieder da. Deshalb:
>    ```
>    D=~/Library/Developer/Xcode/DerivedData/SimplySocial-geraet
>    xcodebuild -workspace <abs>/ios/SimplySocial.xcworkspace -scheme SimplySocial \
>      -configuration Release -destination 'generic/platform=iOS' \
>      -derivedDataPath "$D" -allowProvisioningUpdates
>    xcrun devicectl device install app --device <udid> "$D"/Build/Products/Release-iphoneos/SimplySocial.app
>    ```
>    Die QUELLEN dürfen in iCloud bleiben: `rsync -a` kopiert auf macOS keine
>    erweiterten Attribute — die Markierung entsteht am ZIELORT. **Der Fehler war
>    hausgemacht:** Am Vortag lag der Bauplatz unter `/private/tmp` und lief durch; ich
>    habe ihn in den Projektordner verlegt, damit die App die Sitzung überlebt, und
>    genau diese „Verbesserung" hat ihn zerlegt.
> 3. **iOS 26.6 und Xcode 26.5 passen zusammen — die Frage von gestern ist beantwortet.**
>    `xcrun devicectl device info ddiServices --device <udid>` meldet `buildUpdate: 17F42`,
>    `contentIsCompatible: true`, `isUsable: true`. Derselbe Aufruf ist **der beste
>    Sperr-Test**: Das Disk-Image mountet nur bei offenem Display, ein Tunnel dagegen
>    braucht nur Vertrauen — genau die Unterscheidung, an der die Fehldiagnose vom
>    07.09. hing.
> 4. **`grep "error:"` reicht nicht, um einen Build zu beurteilen.** Der codesign-Fehler
>    stand als nackter Satz im Protokoll, gefolgt von `Command PhaseScriptExecution
>    failed with a nonzero exit code` — **mitten drin**, und `xcodebuild` gab trotzdem
>    EXIT 0 zurück. Der belastbare Test ist die ANWESENHEIT von `BUILD SUCCEEDED`.
> 5. **Drei Zustände, die man nicht verwechseln darf**, alle drei an diesem Abend einzeln
>    getroffen: *gepaart* (Kabel-Vertrauen) · *entsperrt* (Display offen, nötig fürs
>    Disk-Image) · *Profil bestätigt* (nötig zum Starten). Jeder meldet sich mit einer
>    anderen Meldung, und keine davon nennt ihren Grund.

> 📎 **Stand 2026-09-07 spätabends (überholt, siehe den Eintrag darüber): die App auf
> Ians iPhone installieren.** Fünf Dinge, die damals offen waren:
>
> 1. **Der Release-Build läuft und liegt fertig da** — `BUILD SUCCEEDED`, 48 MB,
>    `main.jsbundle` (3 MB) eingebacken. Er liegt im Scratchpad der Sitzung und ist
>    damit **weg**; neu bauen mit:
>    ```
>    xcodebuild -workspace ios/SimplySocial.xcworkspace -scheme SimplySocial \
>      -configuration Release -destination 'generic/platform=iOS' \
>      -derivedDataPath <ordner> -allowProvisioningUpdates
>    xcrun devicectl device install app --device <udid> <ordner>/Build/Products/Release-iphoneos/SimplySocial.app
>    ```
>    **Warum Release und nicht `expo run:ios --device`:** Der Release-Build braucht kein
>    verbundenes Gerät (`generic/platform=iOS`) und hat sein JavaScript eingebacken —
>    die App läuft danach **ohne Kabel und ohne Mac**. Genau das, was man jemandem in
>    die Hand drückt. Für den Gestentest ist das die richtige Fassung.
> 2. **Woran es gescheitert ist: das Handy war gesperrt.** `CoreDeviceError 12040`
>    („developer disk image could not be mounted") nennt den Grund nicht; er steht erst
>    in der Detailausgabe von `devicectl`: `kAMDMobileImageMounterDeviceLocked`.
>    **Ich habe daraus zuerst falsch geschlossen, Xcode 26.5 sei zu alt für iOS 26.6** —
>    weil `Acquired tunnel connection to device` eine Zeile darüber stand. Ein Tunnel
>    braucht VERTRAUEN, kein entsperrtes Display. **Vor dem nächsten Versuch: Auto-Sperre
>    auf „Nie".** Eine Schleife im Sekundentakt gewinnt das Rennen nicht (30 Versuche,
>    kein Treffer). ✅ **Am 2026-09-08 beantwortet:** `devicectl device info ddiServices`
>    meldet `buildUpdate: 17F42`, `contentIsCompatible: true`, `isUsable: true` — 26.6 und
>    Xcode 26.5 passen zusammen, die Sperre war der einzige Grund. Derselbe Aufruf ist
>    zugleich der beste Sperr-Test: Das Disk-Image mountet nur bei offenem Display.
> 3. **Signatur und Team stehen** — `DEVELOPMENT_TEAM = 5TQTMP2L2H` und
>    `CODE_SIGN_STYLE = Automatic` in beiden Konfigurationen der pbxproj, Zertifikat
>    `Apple Development: ian.fhorak@gmail.com`, Personal Team (7 Tage). **`ios/` ist
>    git-ignoriert** — ein `expo prebuild --clean` wirft beide Zeilen weg.
> 4. **Ein Fehler, der ALLE künftigen Release-Builds getroffen hätte, ist behoben:**
>    `experiments.baseUrl` (die GitHub-Pages-Einstellung) landete auch in den
>    iOS-Asset-Pfaden und kollidierte dort mit der App-Binärdatei. Neu ist
>    `app.config.js`; die ganze Begründung steht in dieser Datei. **Ohne sie wäre auch
>    der App-Store-Build in Phase 21 gescheitert**, und zwar erst dort.
> 5. **Die Prüfliste für Ian liegt fertig in `_FUER_IAN/HANDY_DURCHGANG.md`** — sechs
>    Punkte, in seiner Sprache, mit der Begründung, warum jeder nur am Gerät zu
>    beantworten ist.
>
> 📎 **Der vorige Eintrag, weil er weiter gilt: der GERÄTEDURCHGANG.** Phase 19e ist
> ganz fertig, 19e-1 und 19e-2 (Abschnitt 5b). Sieben Dinge, die eine frische Sitzung
> wissen muss:
>
> 1. **19e-2 hat keinen Build gebraucht, und das ist der wichtigste Satz hier.**
>    `expo-glass-effect` lag schon in `node_modules` — **`expo-router` 57 hängt selbst
>    davon ab.** Es steht in `ios/Podfile.lock` und ist seit dem 19d-1-Build ins Binary
>    kompiliert. Wer wieder einen Native-Baustein braucht, schaut **zuerst nach, ob er
>    schon da ist** (`grep` in `Podfile.lock`, `strings` auf dem Binary) — das spart
>    einen halben Tag.
> 2. **Glas läuft, belegt auf iOS 26.5 im Simulator** (`z03`): Die Apple-Karte scheint
>    durch die Umschalter-Pille, durch das ganze Blatt und durch die Tab-Kapsel. Auf Web
>    steht überall dieselbe helle Fläche wie vorher (Ians Entscheidung 43).
>    **Die erste Fassung hat Ian abgelehnt, und sein Vorbild liegt jetzt im Projekt:
>    `vorbild-liquid-glass-bierbuddy.png`.** Was daran falsch war, steht in Abschnitt 5b
>    unter „Nachgebessert am selben Abend" — kurz: die FORM (Kapsel statt Leiste), Kante
>    und Schatten lagen auf dem Glas, und das Blatt war halb Glas, halb Weiß.
>    **Wer hier weiterarbeitet, legt das Vorbild daneben, bevor er etwas ändert.**
> 3. **Die Tab-Leiste ist eine freistehende KAPSEL** (`position: 'absolute'`, 16 pt
>    Seitenrand, 56 pt hoch, ~24 pt über dem Rand — `lib/tabs.ts`), weil Glas etwas
>    braucht, das daneben UND darunter durchläuft. Der Preis steht an einer Stelle und heißt
>    `useTabRand()` (`lib/tabs.ts`): *Was scrollt, scrollt unter das Glas; was fest
>    steht, weicht ihm aus* (`SsScreen`). Wer einen neuen Tab-Screen baut, bekommt das
>    geschenkt — wer daneben baut, legt seine unterste Zeile hinter die Leiste.
> 4. **Zwei Berichtigungen aus 19e-1 stecken darin:** Bei zugezogenem Blatt stand nur
>    der Griff da (die Titelzeile lag abgeschnitten darunter), und ein Zug am Griff
>    markierte im Browser den Text ringsum blau. Beides gemessen behoben, Zahlen in
>    Abschnitt 5b.
> 5. **Ein Umweg, der KEIN Fehler war, steht dort ausführlich (Befund 6): der
>    Kartenausschnitt auf iOS.** Viel Umland, Wiens Süden hinter dem Blatt — das ist
>    `KARTE_MIN_BAND = 0.5`, das die Karte ausdrücklich hinter das Blatt laufen lässt.
>    Der spekulative Fix ist zurückgenommen. **Wer das Bild trotzdem ändern will,
>    ändert die Konstante — nicht den Zeichner.**
> 6. **Der Gerätebuild ist der nächste Handgriff und braucht Ian einmal persönlich.**
>    Er hat heute nur eine gewöhnliche Apple-ID — also `npx expo run:ios --device` mit
>    Kabel, nicht EAS. Er hat selbst gewarnt: im WLAN hängen fremde Geräte, **vor dem
>    Installieren `xcrun devicectl list devices` lesen und den Namen bestätigen
>    lassen.** Offen sind: Wischstapel unter einem Finger · Tastatur im Chat ·
>    Jahrgangs-Balken mit zwei Fingern · Tipp auf die Apple-Karte · **ob sich Blatt und
>    Karte auf iOS um dieselbe Berührung streiten** · und neu: wie sich Glas anfühlt.
> 7. ✅ **`npm run deploy` ist am 2026-09-07 gelaufen — die Live-Seite zeigt jetzt 19e.**
>    Bis dahin stand hier „bewusst nicht gelaufen, weil 19e auf keinem echten Gerät
>    war"; **Ian hat es an dem Abend entschieden**, und am selben Abend kam das Gerät
>    dazu. Auf der echten Adresse nachgemessen (360 × 600): Prototyp-Hinweis deckt
>    600 von 600 px (Vollbild, Entscheidung 48), Tab-Kapsel bei x = 16, 328 breit,
>    56 hoch, 12 px über dem Rand — die Maße aus `lib/tabs.ts`. Der Quellcode ist
>    gepusht (harte Regel 35); der Deploy ersetzt das nicht.
>
> ❌ **Der „offene Befund" von gestern ist am 2026-09-07 nachgemessen und KEINER.**
> „Alter egal" und „Bestimmte Jahrgänge" sind auf 360 × 600 nicht verdeckt, sondern
> **herausgescrollt** (64 px Überhang), und die weiche Kante, die das anzeigt, war
> immer da. Zahlen und die Lehre stehen bei Phase 19e in Abschnitt 5b. **Hier nur das
> Wichtige für die nächste Sitzung: Es gibt dort nichts zu reparieren.** Was bleibt,
> ist der benannte Preis von Entscheidung 47 (keine Rückmeldung im Stapel, dass
> gefiltert wird) — eine mögliche Zeile, kein Fehler.

> 📎 **Der vorige Eintrag, weil er noch Gültiges enthält: der Stand nach 19e-1**
> (Abschnitt 5b, Phase 19e). Sechs Dinge, die eine frische Sitzung wissen muss:
>
> 1. **Was 19e-1 gebracht hat, steht in Abschnitt 5b mit vier Befunden und einer
>    Prüftabelle.** Kurz: Vollbild-Karte, ziehbares Blatt (`components/ui/SsBlatt.tsx`,
>    neu), Kopf weg, „Posten" als runder Knopf, Blase aus der Anzeige, Prototyp-Hinweis
>    als Vollbild. `npm run deploy` ist **noch nicht gelaufen** — die Live-Seite zeigt
>    weiter 19d.
> 2. **Die teuerste Stelle hält auf Web und ist auf iOS UNGEPRÜFT.** Griff gegen Karte
>    ist mit echten Zeigergesten getrennt nachgewiesen (Zahlen in Abschnitt 5b). Auf
>    iOS zeichnet MapKit selbst und bringt eigene Gesten mit — **das ist eine andere
>    Lage, keine Wiederholung.** Sie gehört in denselben Durchgang wie Wischstapel,
>    Tastatur, Jahrgangs-Balken und der Tipp auf die Apple-Karte.
> 3. **Der Gerätebuild ist der nächste Handgriff und braucht Ian einmal persönlich.**
>    Er hat heute nur eine gewöhnliche Apple-ID — also `npx expo run:ios --device` mit
>    Kabel, nicht EAS. Er hat selbst gewarnt: im WLAN hängen fremde Geräte, **vor dem
>    Installieren `xcrun devicectl list devices` lesen und den Namen bestätigen
>    lassen.**
> 4. **19e-2 ist danach, und es ist EIN Baustein:** `expo-glass-effect`, mit BEIDEN
>    Prüfungen (`isLiquidGlassAvailable()` und `isGlassEffectAPIAvailable()` — die Doku
>    nennt iOS-26-Beta-Fassungen, in denen der Aufruf abstürzt). Glas bekommen: die
>    Tab-Leiste, die schwebende Umschalter-Pille (`styles.ansichtSchwebend`, dort steht
>    es im Kommentar) und der Kopf des Blattes. **Plattform-Endung, kein
>    `Platform.OS`-Zweig** (harte Regel 52).
> 5. **Ein Befund liegt offen und ist ÄLTER als 19e-1:** Im Stapel mit aufgeklapptem
>    Filter sind „Alter egal" und „Bestimmte Jahrgänge" auf 360 × 600 verdeckt —
>    gegengeprüft auf HEAD, dort genauso. Neu ist nur, dass Entscheidung 47 die einzige
>    Rückmeldung weggenommen hat, dass gefiltert wird. **Die Korrektur ist eine Zeile**
>    (Zähler klein unter den Stapel), und sie steht im Kopf von `(tabs)/index.tsx`.
> 6. **Das Merken des Prototyp-Hinweises sitzt in EINER Funktion**, wie Entscheidung 48
>    es verlangt (`schonGesehen()` / `merken()`). Auf Native gibt es kein
>    `sessionStorage`, also käme das Vollbild nach jedem Kaltstart wieder. **In 20.3
>    wird dort nur der Speicher getauscht** — zwei Funktionsrümpfe, kein Screen.

> 📎 **Der vorige Eintrag, weil er weiter gilt: Phase 20.3 — Anmelden.** 20.1 (Schema) und 20.2 (Regeln) sind **gebaut und geprüft**,
> siehe Abschnitt 5b, „Was beim Bauen von 20.1 und 20.2 herauskam". Sechs Dinge, die
> eine frische Sitzung wissen muss:
>
> 1. **Es liegt alles in `simplysocial/supabase/`, und es läuft ohne Supabase-Konto.**
>    `bash supabase/pruefen/aufbauen.sh` baut eine Wegwerf-Datenbank und lässt 25
>    Prüfungen laufen. Erwartet: 25 Häkchen, kein Kreuz. Braucht nur
>    `brew install postgresql@17`. **Vor jeder Änderung an einer Policy laufen lassen,
>    danach wieder** — das ist der einzige Test, den dieses Projekt hat.
> 2. **Die Absicherung ist ein Postgres-Ding, kein Supabase-Ding.** Deshalb ging 20.2
>    vor 20.3, obwohl der Plan die Reihenfolge andersherum nahelegte. Dieselbe Trennung
>    wie „Simulator statt EAS-Build" in Phase 19: *halten die Regeln?* und *ist das
>    Projekt eingerichtet?* sind zwei Fragen, und nur die zweite braucht Ian.
> 3. **Regeln stehen im Schema `regel`, nie in einer Policy** (harte Regel 54). Wer
>    „ist X Mitglied?" in eine Policy schreibt statt `regel.ist_mitglied()` zu rufen,
>    bekommt `infinite recursion detected` — und zwar erst beim ersten Lesen.
> 4. **Auf `group_members` gibt es bewusst KEIN Insert-Recht.** Beitreten ist das
>    Ergebnis einer bestätigten Anfrage, kein Schreibvorgang. Es kommt mit 20.5 als
>    Postgres-Funktion. Wer stattdessen eine Insert-Policy hinzufügt, macht Phase 17
>    („der Gründer bestätigt") zu einer Höflichkeitsform.
> 5. **Es wartet KEINE Frage mehr auf Ian.** Die Kontolöschung war am 2026-09-06 die
>    letzte und ist seine 39. Entscheidung: **A, alles mit — außer der Gruppe**, die
>    nach Entscheidung 13 vererbt wird (`0003_konto_loeschen.sql`, Abschnitt 6
>    Punkt 39). Was auf ihn wartet, sind Konten, keine Entscheidungen.
> 6. **20.3 ist die erste Aufgabe, die wirklich auf Ian wartet**: Supabase-Konto,
>    Google-Freischaltung, und Apple VOR Google (Richtlinie 4.8). Was NICHT auf ihn
>    wartet, ist der Umbau von `CURRENT_USER_ID` — die Konstante ERSATZLOS löschen,
>    dann schreibt `tsc` die Arbeitsliste (siehe 20.3 in Abschnitt 5b).

> 📎 **Der vorige Eintrag, weil er noch Gültiges enthält: Phase 20 —
> das Backend (Supabase).** Der Kartenzweig ist bis auf eine Hälfte zu Ende: **19d-1
> (iOS) ist gebaut**, 19d-2 (MapKit JS im Browser) wartet bewusst auf Phase 20, weil sie
> einen Server zum Ausstellen des Tokens braucht. Fünf Dinge, die eine frische Sitzung
> wissen muss:
>
> 1. **Es wartet KEINE Frage auf Ian, aber zwei Handgriffe.** Der eine ist sein
>    Gerätebuild samt Gesten-Durchgang (offen seit Phase 19, jetzt mit einem Punkt mehr:
>    ob ein Tipp auf die Apple-Karte den richtigen Bezirk wählt). Der andere ist die
>    Maps-ID plus privater Schlüssel im Apple-Developer-Konto — **erst für 19d-2**, also
>    nicht dringend.
> 2. **Die Karte hat jetzt SIEBEN Dateien, und keine davon ist ein Screen.**
>    `data/wien-bezirke.ts` (erzeugt) · `features/posts/karte.ts` (Bedeutung) ·
>    `lib/karte-treffer.ts` (welcher Bezirk unter einem Punkt) · `lib/karte-geo.ts`
>    (wo eine Fläche auf der ERDE liegt) · `components/ui/karte-typen.ts` (die
>    gemeinsame Schnittstelle) · `SsWienKarte.tsx` (gezeichnet, Web) ·
>    `SsAppleKarte.native.tsx` (MapKit, iOS). Die Weiche ist `SsKarte.tsx` /
>    `SsKarte.native.tsx`; **Screens nehmen nur `SsKarte`.**
> 3. **`PROJEKTION` in `wien-bezirke.ts` ist der Grund, warum die Geometrie nur EINMAL
>    dasteht.** Vier Zahlen, exakt umkehrbar. Wer je versucht ist, Geo-Punkte
>    danebenzuschreiben, liest den Kopf von `lib/karte-geo.ts`.
> 4. **Zoomstufen von `react-native-maps` sind NICHT die Lehrbuchformel.** Mit
>    `minZoomLevel={10}` öffnete die Karte auf einem Drittel von Wien; 9 ist gemessen.
>    Wer die Kartenhöhe oder das Gerät ändert, misst nach — nicht rechnet.
> 5. **Danach ist es Phase 20, und die ist eine andere Sorte Arbeit.** 19b, 19c und
>    19d-1 waren alle reine Oberfläche auf Daten, die es seit Phase 2 gibt. Phase 20
>    ändert, woher die Daten kommen.

> 📎 **Der alte Eintrag, weil er noch Gültiges enthält: Phase 19d —
> die echte Apple-Karte.** ~~19c~~ ist seit dem 2026-09-06 gebaut (Abschnitt 5b, samt
> „Was beim Bauen herauskam"). Fünf Dinge, die eine frische Sitzung wissen muss, BEVOR
> sie anfängt:
>
> 1. **19d wartet auf Ian, 19c tat das nicht.** `react-native-maps` ist ein
>    Native-Baustein: neuer Build, und MapKit JS im Web braucht einen **Apple-Schlüssel**
>    aus seinem Developer-Account. Ohne den hätte der Prototyp, den er herzeigt, keine
>    Karte mehr. **Vor dem ersten Handgriff klären, ob der Schlüssel da ist.**
> 2. **19d ist Ians Entscheidung GEGEN meine Empfehlung** (ich hatte den gezeichneten
>    Apple-Stil vorgeschlagen). Sie wird gebaut, nicht neu verhandelt. Der Preis steht
>    in der Phase, damit ihn niemand später „entdeckt".
> 3. **Eine echte Apple-Karte macht die App NICHT genauer.** Am Post steht nur
>    `district`, keine Koordinate. Die Apple-Karte ist der Hintergrund, unsere
>    Bezirksflächen bleiben oben drauf — und harte Regel 47 gilt gegen einen stärkeren
>    Reiz als vorher.
> 4. **Die Blase aus 19c muss den Tausch überleben, und dafür ist sie gebaut.** Sie
>    hängt am `KartenAnker` aus `SsWienKarte`, nicht an einer Kartenbibliothek. Wer die
>    Fläche darunter austauscht, muss genau eine Sache neu beantworten: **Wo liegt der
>    Beschriftungspunkt eines Bezirks auf dem Schirm?** Solange `SsWienKarte` weiter
>    einen `KartenAnker` liefert, ändert sich an `KartenBlase` kein Zeichen.
> 5. **Danach ist der Kartenzweig zu Ende und es kommt Phase 20 (Supabase).** 19c und
>    19d waren beide reine Oberfläche auf Daten, die es seit Phase 2 gibt.

> ✅ **Phase 19c ist seit dem 2026-09-06 fertig — die Blase über dem Bezirk.** Was eine
> frische Sitzung davon wissen muss:
> - **Was über der Karte schwebt, geht durch `SsWienKarte.blase`** — einen Slot, der
>   einen `KartenAnker` bekommt (harte Regel 51). Nie ein Kind der Kartenfläche: Die hat
>   `overflow: hidden` und einen `PanResponder`, der jede Berührung beansprucht.
> - **`pointerEvents` gehört in den `style`, nicht in die Props** (ACTA-Falle) — und der
>   Blasenkörper braucht ein ausdrückliches `pointerEvents: 'auto'`, weil
>   `react-native-web` ein geerbtes `box-none` an alle Nachkommen weitergibt AUSSER an
>   Text-Knoten. Ohne das markiert ein Zug über die Blase Text, statt die Karte zu
>   schieben.
> - **Wie viele Zeilen passen, rechnet `passform()` aus dem Platz** — `BLASE_MAX = 3` ist
>   eine Obergrenze, keine Zusage. Auf 360 × 600 ist es eine Zeile plus „alle 3 ansehen",
>   auf 390 × 844 sind es drei.
> - **Ians Entscheidung 37: das zeitlich Nächste zuerst** (`BLASE_REIHENFOLGE`), über
>   `nachStartzeit` aus `sort.ts`. Die Liste darunter sortiert weiter nach dem Neuesten —
>   das ist kein Widerspruch, sondern Auswahl gegen Gesamtmenge.
> - **Ein leerer Bezirk bekommt gar keine Blase.** Die Zeile darunter sagt weiter
>   „1230 Wien · 0 Posts" (`s09`).

> ✅ **Phase 19b ist seit dem 2026-09-06 fertig — die Wien-Karte.** Was eine frische
> Sitzung davon wissen muss:
> - **Vier Dateien, und die Aufteilung ist die Regel, nicht der Zufall:**
>   `data/wien-bezirke.ts` (erzeugt, nur Daten) · `features/posts/karte.ts` (was eine
>   Farbe bedeutet) · `lib/karte-treffer.ts` (Geometrie) · `components/ui/SsWienKarte.tsx`
>   (Zeichnen und Geste). Wer eine Farbe ändern will, fasst NICHT den Screen an.
> - **`data/wien-bezirke.ts` ist ERZEUGT.** Nicht von Hand ändern —
>   `python3 scripts/bezirke-bauen.py` baut sie neu. Der Kopf der Datei sagt es auch.
> - **Die Namensnennung ist Pflicht** (CC BY 4.0, Stadt Wien). Sie steht als
>   `KARTE_QUELLE` in `karte.ts` und wird IN der Karte gezeichnet, nicht daneben im
>   Screen — was neben einem Baustein steht, bleibt beim nächsten Umbau liegen.
> - **`FeedFilter.bezirk` ist seit 19b ein Union** (`BezirkFilter`). `filter.bezirk === null`
>   gibt es nicht mehr; gefragt wird `filter.bezirk.kind`.
> - **Ein Kneifen ist nie ein Tipp** (`mehrfingrig` in `SsWienKarte`). Wer den
>   Erkenner anfasst, prüft mit ECHTEN Touch-Ereignissen nach — mit der Maus ist der
>   Fehler unsichtbar.
> - **Die Karte lässt sich schieben und zoomen** (Ians Entscheidung 33, gegen meine
>   Empfehlung „Lupe"). Der Grund ist eine Messung und steht bei `KARTE_GESTE`.

> 🚀 **Stand 2026-09-06: Der Weg zur echten App ist geplant — Abschnitt 5b, Phasen 19
> bis 21.** Das Erste ist damit nicht mehr eine Frage, sondern ein Handgriff:
> **Phase 19.1**, `ios.bundleIdentifier` in `app.json`. Er fehlt heute komplett, und
> er ist nach der ersten Store-Einreichung nie wieder änderbar — deshalb steht er vor
> allem anderen und wird nicht von `eas build:configure` erfunden.
>
> Drei Dinge, die eine frische Sitzung wissen muss, bevor sie dort anfängt:
> 1. **Die Reihenfolge ist eine Entscheidung, kein Zufall.** Gerät VOR Backend, damit
>    beim ersten Fehler nur EINE Sache neu ist. Wer Phase 20 vorzieht, weil sie
>    wichtiger klingt, hebt genau den Nutzen auf.
> 2. **Nur `react-native-svg` kommt in den ersten Build**, nicht gleich alle vier
>    Native-Bausteine. Aus demselben Grund.
> 3. **`CURRENT_USER_ID` wird in Phase 20.3 ERSATZLOS gelöscht**, nicht auf
>    `string | null` gesetzt. Sonst ist es die `Post.district`-Falle zum fünften Mal:
>    `null` rendert in JSX klaglos als Nichts.

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

**Phase 18b ist seit dem 2026-09-05 fertig** (Jahrgang statt Alters-Bänder).
Was eine frische Sitzung davon wissen muss:
- **`AgeGroup` und `AgeBand` gibt es nicht mehr.** Am Menschen steht `jahrgang: number`,
  am Post ein Union `PostAlter`. Harte Regel 27 ist damit ersetzt — der Grund dahinter
  gilt weiter, er ist nur nicht mehr formulierbar: Ein Jahrgang KANN nicht „egal" sein.
- **Der Filter benutzt denselben Typ wie der Post** (`PostAlter`), und das ist kein
  Widerspruch zu Phase 18a: Dort ging es um zwei Dinge mit VERSCHIEDENEN Daten
  (`GroupRequest` trägt einen Satz, `GroupInvite` nicht). Hier tragen beide dieselben und
  deuten sie gleich. Was sich unterscheidet, ist die Regel — und die steht in
  `passtZumAlter`.
- **`SsJahrgangBalken` liegt in `components/ui/` und wird an drei Stellen benutzt.**
  Er darf NIE in `SsScrollReihe` — zwei waagrechte Gesten-Erkenner übereinander.
  `FilterGruppe` hat dafür die Prop `reihe`.
- **`MINDESTALTER` und `HOECHSTALTER` sind ANZEIGE-Grenzen**, keine Prüfung. Ein
  Jahrgang außerhalb bleibt gültig, er ist nur mit diesem Regler nicht einstellbar.
- **`JAHRGANG_ANZEIGE` ist Ians Entscheidung 30 und die Umkehrstelle**, falls der
  Datenschutz-Rat gegen den offenen Jahrgang spricht (`'band'` rechnet die alten drei
  Bänder zurück — die verworfene Möglichkeit ist ein echter Rückweg, kein Kommentar).
- **`data/mock.ts` rechnet Jahrgänge aus ALTERN** (`jahrgang(16)`, `fuerAlter(14, 17)`).
  Feste Jahreszahlen wären am 1. Jänner still falsch.

**Phase 18c ist seit dem 2026-09-05 fertig** (die Chat-Liste, Ians eigener Einwand).
Was eine frische Sitzung davon wissen muss:
- **Die Chat-Liste ist die einzige Liste der App aus ZEILEN statt Karten.** Das ist kein
  Versehen und keine halbe Umstellung: Eine Karte ist ein ANGEBOT (Feed, Anfragen), eine
  Zeile ist ein WEG. Wer die Chat-Liste wieder auf `SsCard` umstellt, macht 7 Chats
  wieder zu 4.
- **Der Streifen-Platz steht immer, die Farbe nicht.** Harte Regel 29 gilt unverändert
  (kein grauer Ersatz-Streifen für Direktchats) — nur der 6 px breite PLATZ bleibt
  reserviert, damit die Avatare eine Spalte bilden.
- **`flexBasis: 0` statt `flexShrink`-Tuning.** Zwei Texte nebeneinander, von denen einer
  zuerst nachgeben soll: Der, der nachgibt, bekommt `flex: 1`. An `flexShrink` zu drehen
  verteilt einen Fehlbetrag und ist beim nächsten längeren Text wieder falsch.
- **`mock.ts` hat keinen abgelaufenen Chat** — die Gruppe „Vorbei" wird nie gezeichnet.
  Wer an ihren Rändern etwas ändert, muss sie kurzzeitig erzwingen, um sie zu sehen.

**Phase 18d ist seit dem 2026-09-05 fertig** (nicht zwei Sachen gleichzeitig — Leopolds
Wunsch, und „Deine Gruppen" nach oben). Was eine frische Sitzung davon wissen muss:
- **Die Regel steht in `features/requests/kollision.ts`**, wie `block.ts`, `wisch.ts`,
  `direkt.ts` und `gruppe.ts`. Drei Konstanten (`DOPPEL_REGEL`, `KOLLISION_FENSTER_MIN`,
  `PRUEFT_BEIM_POSTEN`), und der Satz kommt aus `doppelHinweisText()` — Screens lesen
  die Konstanten nie.
- **`KOLLISION_FENSTER_MIN` überbrückt eine Lücke im Datenmodell.** Ein `Post` hat
  `startsAt` und KEINE Dauer. „Überschneidung" ist deshalb geschätzt, und genau das ist
  der Grund, warum die Regel warnt statt zu sperren.
- **`zaehltAlsTermin()` ist seit dem 2026-09-06 entschieden** (Abschnitt 6, Punkt 34):
  **erst, wenn wirklich jemand dabei ist.** Ein eigener Post ohne Zusage zählt nicht —
  ein Post ist ein Angebot, bis jemand annimmt. Der Wert stand vorher schon als
  Platzhalter da; das `TODO` ist weg, der Kopfkommentar ist jetzt wie in `block.ts`
  gebaut. **Nicht ohne Rückfrage ändern.**
- **`p18` in `mock.ts` ist der einzige Grund, warum man die Warnung überhaupt SIEHT.**
  Nicht „aufräumen". Seine Zeit steht als `bald(2.5, …)` neben `p1`s `bald(2, …)`, damit
  die 30 Minuten Abstand zu jeder Tageszeit gelten — auch nach 22 Uhr, wenn beide auf
  morgen rutschen.
- **`Profil.tsx` hat einen dritten Slot `nachKopf`**, und „Deine Gruppen" steckt dort.
  Nicht in den Screen zurückschieben: Harte Regel 7 will Profil-Inhalt in dieser einen
  Datei.

**Alles aus dem Feedback der Mitgründer ist gebaut — Phase 14 bis 18d sind fertig.**
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

> ✅ **Wieder gültig seit dem 2026-09-06.** Die eine offene Frage (Punkt 34,
> `zaehltAlsTermin()`) hat Ian an diesem Tag beantwortet: **erst, wenn jemand dabei
> ist.** Der Wert im Code blieb derselbe — was sich geändert hat, ist sein Status.

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
| `app/(tabs)/chats.tsx` | Welche Zeile weicht in der Chat-Liste? | ✅ **die Verabredungs-Zeit** — die Aktivität rückt hinter den Namen *(Phase 18c)* |
| `config/alter.ts` | Was steht als Alter am Profil? | ✅ **„Jahrgang 2009"**, offen *(Phase 18b)* |
| `features/requests/kollision.ts` | Zwei Sachen gleichzeitig — sperren oder warnen? | ✅ **warnen, aber durchlassen** *(Phase 18d)* |
| `features/requests/kollision.ts` | Was heißt „gleichzeitig" ohne Dauer am Post? | ✅ **eine Stunde** *(Phase 18d)* |
| `features/requests/kollision.ts` | Gilt das auch beim Selbst-Posten? | ✅ **ja** *(Phase 18d)* |
| `features/requests/kollision.ts` | Was zählt als „schon verabredet"? | ✅ **erst, wenn jemand dabei ist** *(2026-09-06)* |
| `components/Profil.tsx` | Wo liegt der Weg zu den Gruppen? | ✅ **gleich unter der Kopfkarte**, y = 305 statt 1168 *(Phase 18d)* |

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

> **Seit dem 2026-09-06 ist das nur noch der NEBEN-Vorrat.** Der Hauptweg steht in
> Abschnitt 5b als Phasen 19 bis 21 und ist der Reihe nach abzuarbeiten. Was hier steht,
> läuft daneben und hängt an Ian, nicht am Code.

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
- ~~**Das Backend.**~~ → **geplant, Abschnitt 5b, Phase 20.** Die Wahl ist getroffen
  (Supabase), die Naht `features/store.ts` ist weiterhin die Stelle, an der es andockt —
  und sie bleibt bis Phase 20.4 unangetastet.
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
