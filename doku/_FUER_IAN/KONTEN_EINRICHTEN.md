# Die Konten — was du klickst, damit es weitergeht

> **Stand: 12.09.2026.** Die App ist fertig gebaut, die Datenbank auch (121 Prüfungen,
> alle grün). Was fehlt, sind **Konten** — und die kann nur jemand anlegen, dem sie
> gehören. Das bist du.
>
> ✅ **Apple Developer Program — hast du seit dem 11.09.**
> ✅ **Supabase** — steht seit dem 12.09.2026
> 🆕 ⬜ **Ein Mail-Versender** (Punkt 0 gleich hier unten) · **15 Minuten** — ohne ihn
> kommt beim Anmelden per E-Mail niemand hinein, und ihr könnt es zu viert gar nicht
> ausprobieren (Supabase gratis: **2 Mails pro Stunde**)
> ⬜ **Google** (der zweite Anmeldeweg) · ⬜ **zwei Apple-Handgriffe** (1b und 1c unten)
>
> Reihenfolge ist unten vorgegeben und **nicht beliebig**: Apple muss vor Google fertig
> sein, sonst lehnt Apple die App später ab (Richtlinie 4.8).

---

## 0. 🆕 Ein Mail-Versender (Brevo) · **15 Minuten** · **das Wichtigste gerade**

> **Deine Entscheidung vom 12.09.** — und der Grund ist ein anderer, als ich zuerst
> geschrieben hatte. Meine erste Fassung dieses Punktes war falsch: Ich hatte dir
> gesagt, du sollst die Mail-Vorlage in Supabase umstellen. **Das geht nicht** — seit
> Juni 2026 dürfen neue Gratis-Projekte die Vorlagen gar nicht mehr bearbeiten. Genau
> das stand in deinem Screenshot.

**Der eigentliche Grund ist aber ein größerer, und er wäre so oder so gekommen:**
Supabases eingebauter Mail-Dienst schickt **2 Mails pro Stunde** und ist laut Supabase
ausdrücklich *nicht für den echten Betrieb* gedacht. Ihr seid zu viert — nach zwei
Anmeldungen wäre eine Stunde Pause. **Ein eigener Mail-Versender ist also nicht die
Lösung für die Vorlage, sondern ohnehin fällig; die Vorlage kommt gratis dazu.**

Wir nehmen **Brevo**: 300 Mails am Tag gratis, und — das ist der Grund gegen Resend,
das Supabase selbst zuerst empfiehlt — **es braucht keinen eigenen Domainnamen.** Bei
Resend dürftest du gratis nur an dich selbst schicken, solange dir keine Domain gehört.

### 0a. Brevo-Konto anlegen · 5 Minuten

1. [brevo.com](https://www.brevo.com) → **Sign up free** → mit deiner Gmail-Adresse
2. Die Bestätigungsmail von Brevo anklicken
3. Brevo fragt nach ein paar Sachen zur Firma — such dir was Passendes aus, das ist
   nur für ihre Statistik

> ⚠️ **Brevo prüft neue Konten von Hand, bevor sie senden dürfen.** Wenn oben eine
> Meldung steht wie *„your account is under review"*, kann das ein paar Stunden
> dauern. Das ist normal und kein Fehler.

### 0b. Deine Absender-Adresse bestätigen · 2 Minuten

Brevo will wissen, von welcher Adresse die Mails kommen sollen.

1. Links auf deinen Namen (oben rechts) → **Senders, Domains & Dedicated IPs**
2. → **Senders** → **Add a sender**
3. Name: `SimplySocial` · Adresse: deine Gmail-Adresse
4. Brevo schickt dir eine Bestätigungsmail — anklicken

### 0c. Den SMTP-Schlüssel holen · 3 Minuten

1. Oben rechts auf deinen Namen → **SMTP & API**
2. Reiter **SMTP**
3. **Generate a new SMTP key** → Name egal → erzeugen
4. **Dieses Fenster jetzt offen lassen.** Auf derselben Seite stehen vier Sachen, die
   wir gleich brauchen:
   - **SMTP server** (`smtp-relay.brevo.com`)
   - **Port** (`587`)
   - **Login** — eine Adresse, die so aussieht: `8a1b2c@smtp-brevo.com`
   - **Der Schlüssel**, den du gerade erzeugt hast (lange Zeichenkette)

> ⚠️ **Der Schlüssel ist nur EINMAL zu sehen.** Kopier ihn dir weg, bevor du die Seite
> schließt. Wenn er weg ist: einfach einen neuen erzeugen, den alten löschen.
>
> ⚠️ **Und das ist NICHT dein Brevo-Passwort.** Zwei verschiedene Dinge, die beide wie
> ein Passwort aussehen.

### 0d. In Supabase eintragen · 3 Minuten

1. [supabase.com](https://supabase.com) → dein Projekt → **Authentication** → **Emails**
2. Ganz oben der Kasten **„Set up custom SMTP"** → **Set up SMTP**
3. Eintragen:

   | Feld | Was hinein muss |
   |---|---|
   | Sender email | deine Gmail-Adresse (dieselbe wie in 0b!) |
   | Sender name | `SimplySocial` |
   | Host | `smtp-relay.brevo.com` |
   | Port number | `587` |
   | Username | **das, was Brevo auf der SMTP-Seite als „Login" anzeigt** |
   | Password | der SMTP-Schlüssel aus 0c |

4. **Save**

> ⚠️ **Zwei Fallen, beide schon von anderen bezahlt:**
>
> 1. **Beim Einfügen von `smtp-relay.brevo.com` rutscht leicht ein LEERZEICHEN mit
>    hinein.** Dann geht gar nichts, und die Meldung sagt nicht, warum. Nach dem
>    Einfügen einmal ans Ende und an den Anfang klicken und nachsehen.
> 2. **Beim „Username" widersprechen sich die Anleitungen im Netz** — manche sagen
>    deine Gmail-Adresse, manche die `…@smtp-brevo.com`. **Nimm, was auf Brevos
>    SMTP-Seite unter „Login" steht.** Wenn es nicht geht, probier das andere; es ist
>    eines von beiden und nichts kaputt.

### 0e. Jetzt erst: die Mail soll eine ZAHL schicken · 2 Minuten

**Das geht erst, wenn 0d erledigt ist** — vorher ist das Feld grau.

1. **Authentication** → **Emails** → **Magic link or OTP**
2. Bei **Body** auf **Source** umschalten (nicht *Preview*)
3. Den ganzen Text ersetzen durch:

   ```html
   <h2>Dein Code für SimplySocial</h2>
   <p>Gib diese Zahl in der App ein:</p>
   <p style="font-size:32px;letter-spacing:6px;"><strong>{{ .Token }}</strong></p>
   <p>Sie gilt eine Stunde und nur einmal. Wenn du das nicht warst, ignorier die Mail.</p>
   ```

4. Bei **Subject** hineinschreiben: `Dein Code für SimplySocial`
5. **Save**

### 0f. Und dann sagst du mir Bescheid

Dann probieren wir es **einmal mit deiner echten Adresse durch** — du tippst sie in der
App ein, bekommst die Mail, tippst die Zahl ein, gibst Name, Bezirk und Jahrgang an und
bist drin. **Das ist das einzige Stück am Anmelden, das ich nicht selbst prüfen kann**,
weil der Code in deinem Postfach landet und in der Datenbank nur ein Abdruck davon
liegt. Alles danach ist am echten Server geprüft (29 Häkchen).

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
