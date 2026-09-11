# Die Konten — was du klickst, damit es weitergeht

> **Stand: 11.09.2026.** Die App ist fertig gebaut, die Datenbank auch (121 Prüfungen,
> alle grün). Was fehlt, sind **Konten** — und die kann nur jemand anlegen, dem sie
> gehören. Das bist du.
>
> ✅ **Apple Developer Program — hast du seit dem 11.09.**
> ⬜ **Supabase** (die Datenbank) · ⬜ **Google** (der zweite Anmeldeweg)
>
> Reihenfolge ist unten vorgegeben und **nicht beliebig**: Apple muss vor Google fertig
> sein, sonst lehnt Apple die App später ab (Richtlinie 4.8).

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

### 1a. 🔴 **JETZT DRAN:** Xcode die neue Mitgliedschaft zeigen · 2 Minuten
Am Mac ist vom neuen Programm noch **nichts** angekommen — ich habe am 11.09. nachgesehen,
dort liegt nur das alte Gratis-Zertifikat. Deshalb:

1. **Xcode** öffnen → Menü **Xcode → Settings… → Accounts**
2. Deine Apple-ID anklicken. Steht rechts nur *„Personal Team"*, unten auf **„Download
   Manual Profiles"** bzw. das Konto einmal entfernen und neu hinzufügen.
3. Richtig ist es, wenn dort **zwei** Einträge stehen: „Personal Team" **und** ein Team mit
   deinem (oder dem elterlichen) Namen ohne den Zusatz „Personal".

**Danach sag mir die neue Team-ID** (zehn Zeichen, steht in Xcode neben dem Team und
auf developer.apple.com unter *Membership details*) — **den Rest mache ich mit einem
Befehl.** Das Bauen und Aufspielen ist seit dem 11.09. ein Skript (`npm run geraet`);
es prüft von selbst, ob dein Handy das richtige ist und ob es aufgesperrt ist.

> ⏰ **Warum das eilt:** Die App auf deinem Handy ist mit dem alten Gratis-Team signiert
> und läuft **am 14.09. um 22:00** ab. Das steht so im Profil — ich habe nachgemessen,
> nicht geschätzt. Danach startet sie nicht mehr, bis sie neu drauf ist.

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

## 2. Supabase — die Datenbank · **10 Minuten**

Das ist kein Anfang mehr, sondern ein Einspielen: Schema und Regeln liegen fertig da und
sind gegen 121 Angriffe geprüft.

1. [supabase.com](https://supabase.com) → **Start your project** → mit E-Mail oder GitHub
2. **New project**
   - Name: `simplysocial`
   - **Region: Frankfurt (eu-central-1)** — das ist die EU-Region, und sie ist Wien am
     nächsten. Wichtig für die Datenschutzfrage und für die Geschwindigkeit.
   - Database Password: eines erzeugen lassen und **speichern**
3. Warten, bis das Projekt steht (ca. 2 Minuten)
4. Links **SQL Editor** → **New query** → und dann **nacheinander, in dieser Reihenfolge**,
   den Inhalt dieser vier Dateien einfügen und jeweils **Run**:

   | | Datei | Was sie macht |
   |---|---|---|
   | 1 | `simplysocial/supabase/migrations/0001_schema.sql` | die Tabellen |
   | 2 | `…/0002_policies.sql` | wer was sehen darf |
   | 3 | `…/0003_konto_loeschen.sql` | deine 39. Entscheidung |
   | 4 | `…/0004_transaktionen.sql` | die sieben Schreibwege |

   *Wenn dir das zu fummelig ist: sag Bescheid, dann mache ich es über die Kommandozeile —
   dafür brauche ich nur das Datenbankpasswort aus Schritt 2.*

5. **Settings → API** öffnen. Dort stehen zwei Dinge, die ich brauche:
   - **Project URL** (`https://….supabase.co`)
   - **anon public** key

> 🔒 **Auf derselben Seite steht ein `service_role`-Schlüssel. Den schickst du mir nicht
> und niemandem sonst.** Er hebt alle Sicherheitsregeln auf — die 121 Prüfungen wären
> damit wertlos. Der `anon`-Schlüssel dagegen ist dafür gemacht, in der App zu stehen.

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
