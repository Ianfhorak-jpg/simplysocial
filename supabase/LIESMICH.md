# `supabase/` — das Backend

Phase 20 aus [PLAN.md, Abschnitt 5b](../../PLAN.md). **Stand 2026-09-10: 20.1, 20.2
und die SQL-Seite von 20.5 sind fertig und geprüft.** Offen sind 20.3-b (braucht Ians
Konten), 20.4 und der App-Teil von 20.5.

Hier liegt noch **kein Anschluss an ein echtes Supabase-Projekt** — die App liest weiter
aus `src/data/mock.ts`. Was hier liegt, ist das Schema und die Regeln, und beides ist
gegen einen echten Postgres bewiesen, nicht behauptet.

## Der Aufbau

| Datei | Was drinsteht |
|---|---|
| `migrations/0001_schema.sql` | Die Tabellen. Übersetzt `src/types/models.ts` — an drei Stellen ist das eine Entscheidung und keine Übersetzung, die stehen dort im Kommentar. |
| `migrations/0002_policies.sql` | **Die Regeln.** Jede Regel-Datei der App hat hier ihr Gegenstück. |
| `migrations/0003_konto_loeschen.sql` | Ians Entscheidung 39 (A, „alles mit“) — die Gruppe ist die Ausnahme und wird nach Entscheidung 13 vererbt. |
| `migrations/0004_transaktionen.sql` | **Die Schreibseite.** Sieben Funktionen und ein Trigger — alles, was die Rechteliste bewusst unmöglich macht. |
| `pruefen/` | Der Angriff von außen. Läuft ohne Supabase-Konto. |
| `entscheidungen/` | Vorbereitete Plätze für Ians Entscheidungen. Läuft NICHT mit — dieselbe Anordnung wie `landing-vorschau/` neben `landing/`. |

## Selber laufen lassen

```bash
brew install postgresql@17          # einmalig
bash supabase/pruefen/aufbauen.sh
```

Baut eine Wegwerf-Datenbank auf `127.0.0.1:55432`, spielt beide Migrationen und die
Prüfdaten ein und lässt den Angriff laufen. **Es braucht dafür kein Supabase-Konto und
kein Netz:** RLS ist ein Postgres-Feature. Was Supabase mitbringt (`auth.users`,
`auth.uid()`), steht wortgleich nachgebaut in `pruefen/00_supabase_lokal.sql`.

Erwartet sind **121 Häkchen und kein Kreuz.**

| Datei | Was sie fragt |
|---|---|
| `pruefen/10_angriff.sql` | *Kommt jemand an Daten, an die er nicht darf?* |
| `pruefen/20_transaktionen.sql` | *Tut ein rechtmäßiger Schreibvorgang genau das, was Ians Regel sagt — und ein unrechtmäßiger GAR NICHTS?* |
| `pruefen/30_wettlauf.sh` | *Was passiert bei ZWEI gleichzeitigen Bestätigungen auf denselben letzten Platz?* Braucht zwei echte Verbindungen und geht deshalb nicht als `.sql`-Datei. |
| `pruefen/40_uebersetzung.sh` | *Wird aus einer echten Zeile das richtige App-Objekt?* Stellt erst mit den echten Funktionen aus 0004 die zwei Zustände her, die es im Prototyp nicht geben kann (eine aufgelöste Gruppe, ein Chat ohne Aktivität), holt die Zeilen als JSON und schickt sie durch `src/data/zeilen.ts`. Braucht Node und **ändert die Datenbank** — läuft deshalb als letzte. |

## Warum es `0004_transaktionen.sql` gibt

**Ein fehlender `grant` in `0002_policies.sql` ist keine Lücke, sondern eine Zusage.**
`group_members` hat nur `select`, `chat_threads` auch. Solange es 0004 nicht gab,
konnte also niemand einer Gruppe beitreten oder einen Chat anfangen — auch nicht
rechtmäßig. Das ist Absicht: Beitreten ist das ERGEBNIS einer bestätigten Anfrage,
kein Schreibvorgang (harte Regel 55).

**Damit hat die Rechteliste die Arbeitsliste geschrieben** — dieselbe Technik wie
`IconName` in Phase 14 (ein enger Typ) und das Löschen von `CURRENT_USER_ID` in
20.3-a (ein verschwundener Export), nur mit Rechten statt mit TypeScript. Der Plan
nannte drei Funktionen; es sind sieben.

## Warum es diesen Angriff gibt

> „Der Prüfstein für diese Phase ist nicht, dass die App läuft. Sie läuft auch mit
> offenen Policies. Der Prüfstein ist: mit dem Zugangsschlüssel eines zweiten Kontos
> direkt an der Datenbank vorbei versuchen, einen Follower-Post zu lesen. Was dabei
> nicht kommt, ist geschützt. Alles andere ist geglaubt."
> — PLAN.md, Abschnitt 5b

`10_angriff.sql` setzt sich dafür in die Rolle `authenticated` und legt ein
JWT-Claim an. Das ist Zeile für Zeile das, was PostgREST tut, wenn jemand mit einem
gültigen Schlüssel die REST-Schnittstelle aufruft. **Die App kommt darin nicht vor —
sie ist nicht die Absicherung.**

⚠️ Wer die Prüfung als `postgres` laufen lässt, bekommt überall Zeilen und hält das für
ein Ergebnis: Der Eigentümer einer Tabelle umgeht seine eigenen Policies. Deshalb steht
in jedem Block `set local role authenticated`.

## Fünf Sachen, die beim Bauen herauskamen

1. **Eine Policy, die ihre eigene Tabelle abfragt, rekursiert.** Der naheliegende Weg
   für „die Mitgliederliste sehen nur Mitglieder" ist ein `exists (select 1 from
   group_members …)` in der Policy auf `group_members` — Postgres antwortet
   `infinite recursion detected in policy for relation "group_members"`, und zwar erst,
   wenn zum ersten Mal jemand liest. Der Ausweg sind die Funktionen im Schema `regel`:
   `security definer`, also einmal an RLS vorbei, an einer benannten Stelle.
2. **Ein `count(*)` auf einer geschützten Tabelle lügt, es verweigert nicht.** Ein
   Fremder bekommt für eine private Gruppe nicht „Zugriff verweigert", sondern die Zahl
   **0**. `PRIVAT_SICHT` verlangt aber die richtige Zahl — deshalb gibt es
   `regel.mitglieder_anzahl()`. Die ZAHL ja, die LISTE nein.
3. **`on delete set null` hätte einen Chat still zugesperrt.** Löscht jemand seinen
   Post, wurde aus dem Aktivitäts-Chat ein Direktchat — und für einen Direktchat gilt
   `SCHREIB_REGEL = 'gegenseitig'`. Zwei Leute, die sich getroffen haben und einander
   nicht folgen, hätten einander nicht mehr schreiben können, wegen einer dritten Sache.
   Deshalb steht die Herkunft eines Chats als eigene Spalte da (`aus_aktivitaet`) und
   wird nicht aus `post_id` erraten. Der Test dazu ist gegengeprüft: Er wird rot, wenn
   man die Policy auf `post_id` zurückstellt.

4. **`on delete set null` auf einer `not null`-Spalte nimmt Postgres AN** — und
   scheitert erst, wenn wirklich jemand sein Konto löscht (`null value in column
   "from_user_id" violates not-null constraint`). Ausgerechnet bei der Meldung, von der
   ich geschrieben hatte, sie stünde schon fest. Die Spalte ist jetzt `null`-fähig;
   `null` heißt dort „der Melder hat sein Konto gelöscht“.
5. **Die Attrappe war nicht wortgleich, und das hat eine Prüfung falsch rot gemacht.**
   Mein `auth.uid()` castete zuerst nach `json` und prüfte danach auf leer — Supabase
   macht `nullif(..., '')` VOR dem Cast. Eine Sitzungsvariable, die mit `set local`
   gesetzt und zurückgerollt wurde, steht danach auf dem leeren String, und `''::json`
   ist ein Fehler. Das sah aus wie ein Fehler in der Policy und war einer in der
   Attrappe. **Eine Attrappe, die vom Original abweicht, prüft die Attrappe.**

## Was noch NICHT hier steht

- **20.3 Anmelden** — braucht Ians Apple- und Google-Zugänge.
- **20.5 Die drei Transaktionen** (`anfrageBestaetigen`, `blockieren`, `gruppeVerlassen`)
  als Postgres-Funktionen. Bis dahin gibt es auf `group_members` bewusst **kein**
  Insert-Recht: Beitreten ist das Ergebnis einer bestätigten Anfrage, kein Schreibvorgang.
~~- **Die Kontolöschung**~~ ✅ *entschieden am 06.09.2026 und gebaut (0003).*
