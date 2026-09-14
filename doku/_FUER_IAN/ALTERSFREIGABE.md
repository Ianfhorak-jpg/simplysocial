# Die Altersfreigabe — zum Abtippen in App Store Connect

**Stand: 2026-09-14 · Phase 21.1 · Ergebnis: 13+**

---

## Was das ist

Apple stellt vor dem Einreichen einen Fragebogen: Was ist in eurer App drin? Aus den
Antworten rechnet Apple die Altersfreigabe aus — du wählst sie nicht, sie **ergibt
sich**.

> 🔴 **Nachgesehen am 14.09. über Apples eigene Schnittstelle: Von den 28 Feldern ist
> bisher KEIN EINZIGES beantwortet** (alle stehen auf `null`). Ohne diesen Fragebogen
> lässt sich die App nicht einreichen. Das ist kein Schönheitsfehler, sondern eine
> Sperre.

**Wo:** App Store Connect → SimplySocial → links **„Allgemeine Informationen"** →
Abschnitt **„Altersfreigabe"** → **Bearbeiten**.

---

## Die Antworten

### Teil 1 — die drei, auf die es ankommt

| Frage | Antwort | Warum, nachgemessen |
|---|---|---|
| **Nutzergenerierte Inhalte** | **JA** | Menschen schreiben in dieser App: `posts.title/note/meeting_point`, `messages.text`, `profiles.bio`, `groups.name/description`, `*_requests.message` — dazu Profilbilder. Das ist der Kern der App, nicht ein Nebenfeature |
| **Nachrichten und Chat** | **JA** | `messages` + `chat_threads`, dazu Direktnachrichten seit Phase 16 |
| **Social-Media-Funktionen** | **JA** | Apples Wortlaut: *„nutzergenerierte Inhalte über einen Feed oder ähnliche Entdeckungsmethoden verbreiten, verstärken oder mit ihnen interagieren."* Genau das ist der Feed plus `follows` |

**Aus diesen dreien folgt die Freigabe: mindestens 13+.** Das ist keine Wahl, sondern
eine Feststellung.

### Teil 2 — die neuen Fragen von September 2026

| Frage | Antwort | Warum |
|---|---|---|
| **Social-Media-Funktionen altersbeschränkt?** | **NEIN** | Dafür verlangt Apple **drei** Dinge, nicht nur ein Häkchen: die *Declared Age Range API* nutzen (iOS 26+), Unter-13-Jährige aussperren und „nur altersgerechte Inhalte" ausliefern. Keines davon ist gebaut — und die Declared-Age-Range-API ist in Österreich nicht verpflichtend (PLAN.md 21.1) |
| **Altersprüfung (Age Assurance)?** | **NEIN** | Der Jahrgang wird beim ersten Konto **eingetippt** (`features/auth/konto.ts`) und von niemandem geprüft. Eine Eingabe ist keine Prüfung |
| **Kindersicherung?** | **NEIN** | Gibt es nicht |

> ⚠️ **Was das Ja bei „Social Media" kostet, damit es dich nicht überrascht:** Die App
> bekommt auf ihrer Store-Seite einen sichtbaren **„Social Media"-Hinweis** und fällt
> unter Apples neue **Bildschirmzeit-Kategorie für Social Media** — unabhängig davon,
> in welcher Kategorie ihr die App einordnet. Das ist der Preis dafür, die Wahrheit zu
> sagen, und er ist niedriger als eine Ablehnung.

### Teil 3 — die Inhalte: überall „Keine"

Alle folgenden Fragen haben drei Möglichkeiten (*Keine · Selten/mild · Häufig/intensiv*).
**Überall „Keine" wählen:**

| | |
|---|---|
| Anzügliche Themen | **Keine** — die App ist ausdrücklich **kein Dating** (steht so in `CLAUDE.md` und in der Beschreibung) |
| Gewalt (Comic, realistisch, ausgedehnt) | **Keine** |
| Horror / Angstthemen | **Keine** |
| Schimpfwörter / derber Humor | **Keine** |
| Alkohol, Tabak, Drogen | **Keine** ← *siehe die Frage an dich unten* |
| Waffen | **Keine** |
| Sexuelle Inhalte / Nacktheit (beide Fragen) | **Keine** |
| Glücksspiel · simuliertes Glücksspiel · Lootboxen | **Keine** |
| Medizinische Informationen | **Keine** |
| Gesundheits- und Wellness-Themen | **NEIN** ← *siehe die Frage an dich unten* |
| Gewinnspiele / Wettbewerbe | **NEIN** |
| Uneingeschränkter Webzugriff | **NEIN** — im ganzen Quellcode steht **kein einziges** `openURL`, `Linking` oder `WebBrowser`. Das einzige Browserfenster ist Googles Anmeldeseite über `expo-auth-session`, und das ist eine feste Adresse, kein freier Webzugang |
| Werbung | **NEIN** — unter **30** Abhängigkeiten ist **kein** Werbe-, Analyse- oder Absturzbericht-Paket. Dieselbe Zählung trägt schon das Datenschutz-Etikett |

### Teil 4 — nicht anfassen

| | |
|---|---|
| **Altersfreigabe heraufsetzen** | **Nein.** Apple lässt zu, freiwillig höher einzustufen. Bei 17+ dürftest **du selbst die App nicht laden** — und eure Zielgruppe auch nicht |
| **Kinder-Kategorie** (Ages 5+/6+/9+) | **Leer lassen.** Das ist die „Kids"-Kategorie mit eigenen, sehr strengen Regeln |
| **Korea-Sondereinstufung** | **Keine** |

---

## Zwei Fragen, die dir gehören

### 1. Zählt „Bier trinken gehen" als Alkohol-Bezug?

Ich habe **„Keine"** eingetragen, weil die Frage auf Inhalte zielt, die **die App
selbst** mitbringt — und die App bringt keine mit. Dass jemand eine Aktivität „Wir
gehen auf ein Bier" posten *kann*, ist nutzergenerierter Inhalt, und genau dafür ist
das Ja bei „Nutzergenerierte Inhalte" da.

**Das ist meine Auslegung, nicht Apples Wortlaut.** Wenn du sicherer gehen willst,
wäre „Selten/mild" die vorsichtigere Antwort — sie kostet bei 13+ nichts, weil die
Freigabe schon durch den Feed bestimmt ist.

### 2. Sind Sport-Aktivitäten „Gesundheits- und Wellness-Themen"?

Ich habe **Nein** eingetragen. Die App vermittelt Treffen und gibt keine
Gesundheitsinformationen — kein Trainingsplan, keine Kalorien, keine Ratschläge. Dass
viele Aktivitäten Sport sind, macht sie noch nicht zu einer Gesundheits-App.

---

## 🔴 Und eine Sache, die kein Fragebogen beantwortet

**Apples 13+ ist eine Store-Einstufung. Sie sagt nichts darüber, ab welchem Alter ihr
Menschen in eurer App haben WOLLT.**

Eure App verabredet echte Treffen zwischen Menschen, die sich nicht kennen. Bei 13+
darf ein 13-Jähriger sie laden. Ob ihr das wollt — und was ihr dagegen tut — ist keine
Apple-Frage, sondern genau die, die im Rechtstext steht
([`OFFENE_SACHEN.md`](OFFENE_SACHEN.md) Punkt 1) und die **ein Erwachsener** mit dir
beantworten muss.

Ein eigenes Mindestalter in den Nutzungsbedingungen ist davon unabhängig und
üblich. Die App kennt den Jahrgang bereits — technisch wäre eine Grenze also machbar,
falls ihr eine wollt.
