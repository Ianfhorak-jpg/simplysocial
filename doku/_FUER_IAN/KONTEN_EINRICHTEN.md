# Die Konten — was du klickst, damit es weitergeht

> **Stand: 12.09.2026.** Die App ist fertig gebaut, die Datenbank auch (121 Prüfungen,
> alle grün). Was fehlt, sind **Konten** — und die kann nur jemand anlegen, dem sie
> gehören. Das bist du.
>
> ✅ **Apple Developer Program — hast du seit dem 11.09.**
> ✅ **Supabase** — steht seit dem 12.09.2026
> 🆕 ⬜ **EINE Einstellung in Supabase** (Punkt 0 gleich hier unten) · **2 Minuten**,
> und danach funktioniert das Anmelden per E-Mail wirklich
> ⬜ **Google** (der zweite Anmeldeweg) · ⬜ **zwei Apple-Handgriffe** (1b und 1c unten)
>
> Reihenfolge ist unten vorgegeben und **nicht beliebig**: Apple muss vor Google fertig
> sein, sonst lehnt Apple die App später ab (Richtlinie 4.8).

---

## 0. 🆕 Supabase: die Mail soll eine ZAHL schicken, keinen Link · **2 Minuten**

**Das ist der kürzeste Punkt auf dieser Seite und im Moment der wichtigste.** Seit dem
12.09. kann die App sich wirklich anmelden — du tippst deine E-Mail ein, bekommst eine
Mail, tippst die Zahl daraus ein, fertig. Nur: **Supabase schickt von Haus aus einen
Link statt einer Zahl**, und die App fragt nach einer Zahl.

So stellst du es um:

1. [supabase.com](https://supabase.com) → dein Projekt → links unten **Authentication**
2. → **Emails** (bei manchen Fassungen: *Email Templates*) → Reiter **Magic Link**
3. Im Textfeld steht irgendwo `{{ .ConfirmationURL }}`. Ersetz die ganze Zeile mit dem
   Link durch:

   ```
   Dein Code: {{ .Token }}
   ```

4. **Save**

Danach steht in der Mail eine sechsstellige Zahl. Sag mir Bescheid, wenn es erledigt
ist — dann probieren wir es einmal mit deiner echten Adresse durch. **Das ist das
einzige Stück am Anmelden, das ich nicht selbst prüfen kann**, weil der Code in deinem
Postfach landet und nicht in der Datenbank.

> ⚠️ **Eine Sache, die du wissen solltest, bevor Leute die App benutzen:** Supabase
> verschickt gratis nur **ein paar Mails pro Stunde**. Zum Ausprobieren zu zweit
> reicht das; sobald sich mehr Leute anmelden, brauchen wir einen eigenen
> Mail-Versender (kostet ein paar Euro im Monat oder ist bis zu einer Menge gratis).
> **Das ist noch nicht dringend, aber es ist auch nichts, was von selbst weggeht.**

---

## ✅ Beantwortet am 11.09.: das Programm läuft auf **dich**

Damit gehört die App deinem eigenen Team, und im App Store steht dein Name als
Anbieter. Gut zu wissen, weil es später nicht mehr gratis zu ändern ist.

> ⚠️ **Eine Sache, die daraus folgt und die du im Blick behalten solltest:** Apple
> verlangt für ein eigenes Developer-Konto normalerweise **18 Jahre**. Wenn beim
> Einreichen (Phase 21) Verträge, Steuer- oder Bankdaten drankommen, kann das noch
> einmal Thema werden — **das ist nichts, was ich für dich entscheiden kann**, und es
> gehört zu derselben Frage wie Punkt 1 in `OFFENE_SACHEN.md`: einmal mit einem
> Erwachsenen darüber reden, bevor die App in den Store geht. Für alles bis dahin
> (Bauen, TestFlight, Anmelden) ändert es **nichts**.

---

## 1. Apple — drei Handgriffe, die erst jetzt möglich sind · **20 Minuten**

### 1a. ~~Xcode die neue Mitgliedschaft zeigen~~ ✅ *erledigt am 11.09., 21:55*

Du hast Xcode geöffnet und dein Konto angeklickt — **das war schon alles.** Unter *Teams*
steht jetzt „ian Faye Horak · **Admin**" statt „Personal Team".

**Und es gibt keine neue Team-ID.** Ich hatte dich danach gefragt, das war falsch: Apple
hat dein bisheriges Team **aufgewertet**, die Nummer ist dieselbe geblieben
(`5TQTMP2L2H`). Was sich geändert hat, steht nicht in der Nummer, sondern daneben —
vorher „Personal Team, gratis", jetzt „Individual". Am Projekt musste deshalb **nichts**
geändert werden.

### 1b. Die App-ID registrieren und „Anmelden mit Apple" freischalten · 10 Minuten
1. [developer.apple.com/account](https://developer.apple.com/account) → **Identifiers** → **+**
2. **App IDs** → **App** → weiter
3. Description: `SimplySocial` · Bundle ID: **explicit**, genau `at.simplysocial.app`
   *(genau diese Schreibweise — sie steht schon in der App und auf deinem Handy)*
4. In der Liste der Capabilities **„Sign In with Apple"** ankreuzen → **Continue** → **Register**

### 1c. Der Schlüssel für „Anmelden mit Apple" · 8 Minuten
1. Gleiche Seite → **Keys** → **+**
2. Name: `SimplySocial Sign In` · **„Sign In with Apple"** ankreuzen → **Configure** →
   als Primary App ID `at.simplysocial.app` wählen
3. **Continue → Register → Download**

> ⚠️ **Die heruntergeladene Datei (`AuthKey_XXXXXXXXXX.p8`) gibt es genau EINMAL.**
> Apple zeigt sie nie wieder. Leg sie an einen Ort, den du wiederfindest — **nicht** in
> den Projektordner, der geht ins Internet.

**Was ich davon brauche:** die **Key-ID** (die zehn Zeichen im Dateinamen), deine
**Team-ID** (steht unter *Membership details*) und die Datei selbst.

---

## 2. ~~Supabase — die Datenbank~~ ✅ *erledigt am 12.09.2026*

**Steht.** Projekt in der EU (Irland), alles eingespielt und am echten Server
nachgemessen: 13 Tabellen · 33 Regeln · RLS auf allen 13 · 15 Funktionen. Der Zugang
für die App liegt in `.env`. **Du musst hier nichts mehr tun** — die Schritte unten
stehen nur noch als Gedächtnis, falls das Projekt je neu aufgesetzt werden muss.

<details><summary>Die Schritte von damals</summary>

Das war kein Anfang mehr, sondern ein Einspielen: Schema und Regeln lagen fertig da und
waren gegen 121 Angriffe geprüft.

1. [supabase.com](https://supabase.com) → **Start your project** → mit E-Mail oder GitHub
2. **New project**
   - Name: `simplysocial`
   - **Region: Frankfurt (eu-central-1)** — das ist die EU-Region, und sie ist Wien am
     nächsten. Wichtig für die Datenschutzfrage und für die Geschwindigkeit.
   - Database Password: eines erzeugen lassen und **speichern**
3. Warten, bis das Projekt steht (ca. 2 Minuten)
4. **Und dann sagst du mir nur Bescheid — das Einspielen mache ich.**

   Dafür brauche ich den Verbindungs-String deiner Datenbank:
   **Connect** (oben auf der Projektseite) → **Session pooler** oder
   **Direct connection** → kopieren. Darin steht `[YOUR-PASSWORD]` — das ersetzt du
   durch das Passwort aus Schritt 2.

   > 🔒 **Schick ihn mir NICHT in den Chat.** Leg ihn stattdessen hier ab, dann liest
   > ihn nur mein Skript und niemand sonst:
   > ```
   > mkdir -p ~/.simplysocial && chmod 700 ~/.simplysocial
   > printf '%s' 'postgresql://…hier einfügen…' > ~/.simplysocial/db-url
   > chmod 600 ~/.simplysocial/db-url
   > ```
   > Das ist derselbe Ort wie bei Apple (`~/.appstoreconnect/`) und aus demselben
   > Grund: **außerhalb des Projektordners**, der geht ins Internet.

   Danach laufen die vier Dateien mit **einem** Befehl (`npm run einspielen`) — in
   der richtigen Reihenfolge, in **einer** Transaktion, und danach wird nachgemessen,
   ob wirklich 13 Tabellen, 33 Regeln und 9 Funktionen dastehen. Bricht etwas ab,
   bleibt die Datenbank leer statt halb gefüllt.

   <details><summary>Falls du es doch lieber selbst klickst</summary>

   SQL-Editor → New query → nacheinander einfügen und jeweils **Run**:
   `0001_schema.sql` (die Tabellen) · `0002_policies.sql` (wer was sehen darf) ·
   `0003_konto_loeschen.sql` (deine 39. Entscheidung) · `0004_transaktionen.sql`
   (die sieben Schreibwege). Alle vier in `simplysocial/supabase/migrations/`.
   **Die Reihenfolge ist Pflicht**, und `00_supabase_lokal.sql` aus dem
   `pruefen/`-Ordner gehört ausdrücklich **nicht** dazu — das ist die Attrappe für
   meine Tests, Supabase bringt das Echte selbst mit.
   </details>

5. **Settings → API** öffnen. Dort stehen zwei Dinge, die ich brauche:
   - **Project URL** (`https://….supabase.co`)
   - **anon public** key

> 🔒 **Auf derselben Seite steht ein `service_role`-Schlüssel. Den schickst du mir nicht
> und niemandem sonst.** Er hebt alle Sicherheitsregeln auf — die 121 Prüfungen wären
> damit wertlos. Der `anon`-Schlüssel dagegen ist dafür gemacht, in der App zu stehen.

</details>

---

## 3. Google — der zweite Anmeldeweg · **15 Minuten**

**Erst machen, wenn Punkt 1 fertig ist.** Grund: Sobald Google dabei ist, verlangt Apple
laut Richtlinie 4.8, dass „Anmelden mit Apple" daneben steht. Andersherum ist es eine
Ablehnung im Review.

1. [console.cloud.google.com](https://console.cloud.google.com) → neues Projekt `SimplySocial`
2. **APIs & Services → OAuth consent screen** → **External** → App-Name `SimplySocial`,
   deine E-Mail als Kontakt. Mehr braucht es für den Anfang nicht.
3. **Credentials → Create Credentials → OAuth client ID**, und zwar **zweimal**:
   - **Web application** — Redirect-URI: `https://<deine-projekt-url>.supabase.co/auth/v1/callback`
     *(die URL aus Punkt 2.5)*
   - **iOS** — Bundle ID: `at.simplysocial.app`
4. **Was ich brauche:** von der Web-Variante **Client ID und Client Secret**, von der
   iOS-Variante nur die **Client ID**.

---

## Und dann?

Sobald ich **Projekt-URL + anon key** habe, kann ich anfangen — Supabase allein reicht für
den größten Brocken (die App liest echte Daten statt der erfundenen). Apple und Google sind
für das *Anmelden* nötig, nicht für das Lesen.

**Schick mir also ruhig, was zuerst fertig ist.** Du musst nicht warten, bis alle drei
stehen.
