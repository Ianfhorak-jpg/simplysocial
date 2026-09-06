-- ═══════════════════════════════════════════════════════════════════════════════
--  WAS PASSIERT MIT DEN SACHEN EINES MENSCHEN, DER SEIN KONTO LÖSCHT?
--
--  ⚠️  DIESE DATEI LIEGT ABSICHTLICH NICHT IN `migrations/`.
--      Sie läuft nicht mit. Sie ist der vorbereitete Platz für Ians Entscheidung —
--      dieselbe Anordnung wie `landing-vorschau/` neben `landing/`.
--
--  ── Warum die Frage jetzt kommt und nicht früher ─────────────────────────────
--  Den Screen `/account-loeschen` gibt es seit Phase 7, und Apple verlangt ihn
--  (Richtlinie 1.2). Im Prototyp tut der letzte Klick nichts, weil es ohne Login
--  kein Konto gibt — der Screen sagt das selbst. Mit Phase 20 gibt es eines.
--
--  Gemessen am 2026-09-06 gegen das frische Schema:
--
--      delete from auth.users where id = <Ian>;
--      ERROR:  update or delete on table "profiles" violates foreign key
--              constraint "groups_creator_id_fkey" on table "groups"
--
--  Heute ist Kontolöschung also für jeden UNMÖGLICH, der je gepostet oder eine
--  Gruppe gegründet hat. Das ist kein Zustand, den man lassen kann — es ist nur
--  der ehrlichste: Die Datenbank weigert sich, statt still etwas zu tun, das
--  niemand entschieden hat.
--
--  ── Warum das Ians Frage ist und nicht meine ─────────────────────────────────
--  Es ist dieselbe Frage wie bei `AUSTRITT_WIRKUNG` (seine Entscheidung 12: verlässt
--  jemand eine Gruppe, BLEIBEN seine Posts stehen). Dort ging es um eine Gruppe,
--  hier um die ganze App — und die Begründung von damals zeigt in beide Richtungen:
--  Posts zu löschen sagt fremde Verabredungen ab wegen einer Sache, die die anderen
--  nichts angeht. Aber ein Konto zu löschen heißt auch etwas, das ein Gruppenaustritt
--  nicht heißt: „ich will hier weg", und das ist ein Recht, kein Wunsch.
--
--  ═══════════════════════════════════════════════════════════════════════════════
--   GEWÄHLT:  ✅ **A — alles mit**, Ian am 2026-09-06 (seine 39. Entscheidung).
--
--   MIT EINER AUSNAHME, DIE ER SELBST GEZOGEN HAT: A kollidierte mit
--   `GRUENDER_AUSTRITT = 'weitergeben'` (Entscheidung 13), und ein Konto zu löschen
--   IST ein Verlassen. Nachgefragt, und seine Antwort war die genauere von beiden:
--
--       **A gilt für alles, was NUR mir gehört. Eine Gruppe gehört acht Leuten.**
--
--   Gebaut in `../migrations/0003_konto_loeschen.sql`. B und C bleiben unten stehen —
--   als Gedächtnis, nicht als Einladung.
--  ═══════════════════════════════════════════════════════════════════════════════


-- ── A. ALLES MIT ────────────────────────────────────────────────────────────
--
-- Konto weg heißt: Posts weg, Gruppen weg, Nachrichten weg. Die sauberste Auskunft
-- gegenüber dem, der geht, und die einfachste gegenüber der DSGVO.
--
-- Der Haken, und er ist derselbe wie bei „Posts löschen" in Entscheidung 12, nur
-- größer: Wer morgen 17:00 mit vier Leuten Tennis spielen wollte, sagt allen vieren
-- kommentarlos ab. Und wenn er eine Gruppe gegründet hat, verlieren acht Leute ihre
-- Gruppe, weil EINER geht — genau das hat Ian bei `GRUENDER_AUSTRITT` verworfen.

-- alter table posts  drop constraint posts_author_id_fkey,
--   add constraint posts_author_id_fkey  foreign key (author_id)  references profiles (id) on delete cascade;
-- alter table groups drop constraint groups_creator_id_fkey,
--   add constraint groups_creator_id_fkey foreign key (creator_id) references profiles (id) on delete cascade;


-- ── B. DER MENSCH GEHT, DAS VERABREDETE BLEIBT ──────────────────────────────
--
-- Das Profil wird geleert statt gelöscht: Name, Handle, Bio, Bild und Jahrgang
-- verschwinden, die Zeile bleibt als „Gelöschtes Konto" stehen. Laufende Posts und
-- Chats bleiben lesbar, die Gruppe wird vererbt (`nachfolgerId()`, Entscheidung 13).
--
-- Das ist die konsequente Fortsetzung von Entscheidung 12. Der Haken ist ein
-- rechtlicher, und er gehört zu der offenen Frage in `_FUER_IAN/OFFENE_SACHEN.md`,
-- Punkt 1: „gelöscht" heißt dann nicht „weg". Was bleibt, sind fremde Chatverläufe
-- mit meinen Sätzen darin — die gehören auch dem anderen, aber ich habe sie
-- geschrieben.

-- alter table profiles add column geloescht_am timestamptz;
-- -- Anonymisieren statt löschen; `handle` muss eindeutig bleiben.
-- update profiles set display_name = 'Gelöschtes Konto', handle = '@geloescht_' || left(id::text, 8),
--                     bio = '', photo_url = null, geloescht_am = now()
--   where id = <wer geht>;


-- ── C. GETEILT: was nur mir gehört, geht — was geteilt ist, bleibt ──────────
--
-- Posts, an denen NIEMAND hängt (keine bestätigte Zusage), werden gelöscht. Posts
-- mit Zusagen bleiben bis zu ihrem Ablauf stehen und verschwinden dann von selbst.
-- Chats bleiben, das Profil wird wie in B anonymisiert.
--
-- Sachlich die genaueste Antwort — und die einzige, die ein zweites Mal erklärt
-- werden muss: Zwei Leute löschen ihr Konto am selben Tag, bei dem einen bleiben
-- drei Posts stehen und bei dem anderen keiner. Das sieht von außen willkürlich aus,
-- obwohl es die genaueste Regel von den dreien ist.

-- (Braucht eine Funktion, keine Fremdschlüssel-Änderung — siehe 20.5.)


-- ═══════════════════════════════════════════════════════════════════════════════
--  WAS BEI ALLEN DREIEN GLEICH IST — und deshalb schon feststeht
--
--  `reports.from_user_id` ist bereits `on delete set null`: Eine MELDUNG überlebt
--  das Konto dessen, der sie geschrieben hat. Sonst hätte jeder, der jemanden
--  angezeigt hat, mit dem Löschen seines Kontos den Beleg mitgenommen — und wer
--  gemeldet WIRD, hätte einen Weg, ihn verschwinden zu lassen.
--  Das ist keine der drei Möglichkeiten, sondern die Voraussetzung von allen.
-- ═══════════════════════════════════════════════════════════════════════════════
