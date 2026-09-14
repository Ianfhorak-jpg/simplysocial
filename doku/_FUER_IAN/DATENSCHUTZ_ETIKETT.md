# Das Datenschutz-Etikett — Phase 21.3

**Stand: 2026-09-14.** Das hier tippst du in App Store Connect ein, unter
*App-Datenschutz*. Apple fragt dort in einem Klickweg ab, welche Daten die App sammelt.

> ⚠️ **Es muss stimmen, und es ist überprüfbar.** Ein Reviewer kann den Netzwerkverkehr
> der App mitlesen. Ein Etikett, das weniger behauptet, als die App tut, ist ein
> Ablehnungsgrund — und einer der unangenehmen, weil er nach Absicht aussieht.
>
> **Deshalb ist unten jede Zeile aus dem Code hergeleitet, nicht geschätzt.** Hinter
> jedem Eintrag steht, wo es steht. Wer eine Zeile anzweifelt, kann sie nachschlagen.

---

## Die kurze Fassung

SimplySocial sammelt **sieben** Sorten Daten. Alle sieben sind **mit dir verknüpft**
(„Linked to You" — sie hängen an deinem Konto), alle sieben dienen **nur der Funktion
der App** („App Functionality").

**Nichts davon wird zum Tracking benutzt**, es gibt keine Werbung, keine Analyse und
keinen Drittanbieter, der mitliest. Das ist keine Behauptung, sondern nachgezählt:
In `package.json` steht **kein einziges** Analyse-, Werbe- oder Absturzbericht-Paket.
Bei Apples Frage *„Verwendet ihr Daten zum Tracking?"* ist die Antwort **Nein**.

---

## Was einzutippen ist

### 1. Kontaktdaten → E-Mail-Adresse
**Gesammelt: ja · Mit dem Nutzer verknüpft: ja · Tracking: nein · Zweck: App-Funktion**

Sie ist die Anmeldung. Bei „Mit Apple anmelden" kann es Apples Weiterleitungsadresse
sein (`@privaterelay.appleid.com`) — auch die zählt als E-Mail-Adresse.

*Steht in:* Supabase `auth.users`, angelegt von `signInWithOtp` / Apple / Google in
`src/features/auth/anmeldung.ts`.

### 2. Kontaktdaten → Name
**Gesammelt: ja · Verknüpft: ja · Tracking: nein · Zweck: App-Funktion**

Der Anzeigename, den man beim ersten Öffnen eingibt. Muss kein echter Name sein, aber
Apple fragt nicht danach, ob er echt ist.

*Steht in:* `profiles.display_name` (`supabase/migrations/0001_schema.sql`), abgefragt
von `ERSTE_FRAGEN` in `src/features/auth/konto.ts`.

### 3. Benutzerinhalte → Fotos
**Gesammelt: ja · Verknüpft: ja · Tracking: nein · Zweck: App-Funktion**

Das Profilbild. Freiwillig — wer keines setzt, hat keines.

*Steht in:* `profiles.photo_url`, hochgeladen in `bildHochladen()` in
`src/data/senden.ts`, Bucket aus `src/features/social/bild.ts`.

### 4. Benutzerinhalte → Andere Benutzerinhalte
**Gesammelt: ja · Verknüpft: ja · Tracking: nein · Zweck: App-Funktion**

Alles, was Leute selbst schreiben: Aktivitäten (Titel, Notiz, Treffpunkt), Chat-Nachrichten,
Gruppennamen und -beschreibungen, der Profiltext, Anfragetexte und Meldungen.

*Steht in:* `posts.title` / `.note` / `.meeting_point`, `messages.text`, `profiles.bio`,
`groups.name` / `.description`, `join_requests.message`, `group_requests.message`,
`reports.reason` / `.note`.

### 5. Kennungen → Benutzer-ID
**Gesammelt: ja · Verknüpft: ja · Tracking: nein · Zweck: App-Funktion**

Die Konto-Nummer und der @-Name. Ohne sie kann niemandem etwas zugeordnet werden.

*Steht in:* `profiles.id` (ist die `auth.users.id`) und `profiles.handle`.

### 6. Sonstige Daten → Jahrgang und Interessen
**Gesammelt: ja · Verknüpft: ja · Tracking: nein · Zweck: App-Funktion**

Das Geburtsjahr als **Zahl** — **kein Geburtsdatum**, das gibt es in der ganzen App
nicht (Entscheidung aus Phase 18b). Dazu die angekreuzten Kategorien.

*Steht in:* `profiles.jahrgang`, `profiles.interests`.

---

### 7. Standort → Grober Standort
**Gesammelt: ja · Verknüpft: ja · Tracking: nein · Zweck: App-Funktion**

Der Bezirk, den man bei der Anmeldung angibt (z. B. `1070`). **✅ Ians Entscheidung 78
vom 2026-09-14: Das wird als „Grober Standort" angegeben.**

Der Bezirk wird eingetippt, nicht gemessen — man könnte ihn also für eine bloße Angabe
halten, so wie einen Wohnort im Profil. **Verworfen**, aus zwei Gründen: Apple nennt
alles gröber als ~111 Meter „Coarse Location", und ein Wiener Bezirk ist gröber. Vor
allem aber misst der Feed **Entfernungen** davon (`src/features/posts/sort.ts`) —
funktional ist es ein Standort, egal wie er hereinkommt. Untertreiben ist der Fehler,
der Apps aus dem Review wirft; übertreiben nicht.

**In die Datenschutzerklärung (21.2) gehört der Satz, der es einordnet:**

> Du gibst deinen Bezirk selbst an. Wir ermitteln ihn nicht und speichern keine
> Koordinaten.

*Steht in:* `profiles.district` — `not null`, also bei **jedem** Konto vorhanden.
Geschrieben von `bezirkSetzen()` in `src/data/senden.ts`.

---

## 🟢 Was die App NICHT sammelt — und warum das hier steht

Apple fragt es nicht ab, aber es ist der Satz, auf den du stolz sein kannst, und er
gehört in die Datenschutzerklärung (21.2):

> **Der Standort verlässt das Gerät nie.**

Die App darf nach dem Standort fragen (`expo-location` liegt im Projekt). Aber:

| | |
|---|---|
| In der Datenbank | **kein einziges Koordinatenfeld** — nachgezählt über alle 13 Tabellen |
| In dem, was hinausgeht | **kein einziger** Aufruf in `src/data/senden.ts` schickt Koordinaten |
| Im Code überhaupt | Koordinaten kommen in **4 Dateien** vor, und `senden.ts` ist keine davon |
| Gespeichert | nein — ein `useState`, beim nächsten Start weg |
| Angezeigt | nein, auch nicht der Person selbst |

Der Standort geht **ausschließlich** in eine Reihenfolge ein. Das ist keine
Sparsamkeit, die zufällig entstanden ist: Es ist als Regel aufgeschrieben
(`src/features/posts/standort.ts`, harte Regel 47) — samt dem Satz, dass es nicht ohne
Rückfrage geändert werden darf.

**Für Apples Etikett heißt das: Standort wird nicht „gesammelt".** Apples eigene
Definition von *collect* ist „vom Gerät weggeschickt und länger als für die Anfrage
nötig aufbewahrt". Beides trifft nicht zu.

Ebenso nicht gesammelt: Adressen, Telefonnummern, Kontakte, Gesundheits- oder
Finanzdaten, Such- oder Browserverlauf, Nutzungsstatistiken, Absturzberichte, Werbe-IDs.
