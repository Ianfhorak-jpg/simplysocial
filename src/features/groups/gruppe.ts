import type { ActivityCategory, Group, Visibility, VisibilityKind } from '@/types/models';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS EINE GRUPPE IST UND WIE MAN HINEINKOMMT
 *  Entschieden von Ian am 2026-09-02 (PLAN.md, Abschnitt 6, Punkte 16 und 17).
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Leopold beim Durchklicken am 2026-09-02: *„Gruppen wären noch gut zu adden."* Auf
 * Nachfrage: **Gruppen, die man erstellen kann — zum Beispiel „Marswiese Tennis".**
 *
 * ── Ians Entscheidung 1: eine Gruppe ist eine SICHTBARKEITS-STUFE ─────────────
 * Beim Posten wählt man „Alle", „Nur meine Follower" oder „Nur Marswiese Tennis".
 * **Der Feed bleibt EIN Feed** — Gruppen-Posts stehen dort wie alle anderen, mit dem
 * Gruppennamen an der Karte.
 *   *Verworfen:* ein eigener Tab mit eigenem Feed je Gruppe. Er hätte den Hauptfeed
 *   geleert, und ein leerer Hauptfeed ist am Anfang das größere Problem.
 *   *Ebenfalls verworfen:* die Gruppe als reiner Gruppenchat — zu wenig für das, was
 *   Leopold meinte.
 *
 * ── Ians Entscheidung 2: hinein kommt man AUF ANFRAGE ─────────────────────────
 * Man fragt an, der Gründer bestätigt, dann ist man drin. Bewusst **dasselbe Muster
 * wie „Bin dabei"** bei einer Aktivität — ein Muster weniger, das jemand lernen muss.
 *   *Verworfen:* offen für alle (wer stört, ist schon drin) und nur per Einladung
 *   (dann findet niemand hinein, und genau das Finden ist der Zweck der App).
 *
 * ── Was daraus folgt und NICHT extra entschieden werden musste ────────────────
 * Wer nicht drin ist, sieht die Gruppe trotzdem: Name, Kategorie, Bezirk, wie viele
 * Leute drin sind. Nur die Posts und die Mitgliederliste bleiben zu. Anders wäre
 * „auf Anfrage beitreten" ein leeres Versprechen — man kann nichts anfragen, was
 * man nicht findet.
 *
 * **Diese Regeln sind Ians, nicht Claudes. Nicht ohne Rückfrage ändern.**
 */

/** Wie man in eine Gruppe kommt. */
export type Beitritt = 'offen' | 'anfrage' | 'einladung';

/** Ians Entscheidung vom 2026-09-02 (siehe Kopf). `darfBeitreten()` führt sie aus. */
export const BEITRITT: Beitritt = 'anfrage';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WER DARF JEMANDEN IN EINE GRUPPE EINLADEN?
 *  Phase 18a. Entschieden von Ian am 2026-09-05.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Die Frage stellt sich, weil Phase 17 nur EINE Richtung gebaut hat: von außen
 * anfragen, der Gründer bestätigt. Leopold hat am 2026-09-03 eine Gruppe gegründet
 * und sass allein drin — es gab keinen Weg, jemanden hineinzuholen.
 *
 *   A. NUR DER GRÜNDER. Passt zum Rest: Er ist heute schon der Einzige mit
 *      Rechten (`GRUENDER_AUSTRITT`, `beitrittBestaetigen`), und das ist bewusst so.
 *      Haken: Er ist der Flaschenhals. Wer sechs Leute holen will, muss den Gründer
 *      bitten, sie zu holen — genau die Umständlichkeit, die Leopold gemeldet hat,
 *      nur eine Ebene höher.
 *
 *   B. JEDES MITGLIED. Wer drin ist, darf seine Follower holen. Eine Gruppe wächst
 *      dann so, wie eine Runde im echten Leben wächst: Jeder bringt jemanden mit.
 *      Haken: Der Gründer verliert die Kontrolle darüber, wer dazukommt. Jemand holt
 *      einen Freund, den der Rest nicht kennt.
 *
 *   C. JEDES MITGLIED DARF VORSCHLAGEN, DER GRÜNDER BESTÄTIGT. Sicher.
 *      Haken: ein dritter Zustand („eingeladen, wartet auf den Gründer"), den die
 *      App erklären muss — und Leopolds Problem war gerade, dass zu viel über den
 *      Gründer läuft.
 *
 * ── Ians Entscheidung, 2026-09-05: B, JEDES MITGLIED. ───────────────────────
 * „Marswiese Tennis" ist keine Behörde. Wer drin ist, gehört dazu und darf jemanden
 * mitbringen; C hätte den Flaschenhals von A behalten und noch einen Zustand
 * dazugelegt.
 *
 * **Den Haken kennt er:** Der Gründer kann nicht mehr steuern, wer dazukommt. Zwei
 * Dinge mildern es, und beide gab es schon: Eingeladen wird nur, wem man FOLGT (die
 * Liste in `useEinladbare` kommt aus den eigenen Followern, nicht aus allen
 * Nutzern), und wer dazukommt, kann jederzeit wieder gehen. Ein Rauswerfen gibt es
 * bewusst nicht — das wäre eine Machtfrage mehr, und die Gruppe ist acht Leute groß.
 *
 * ⚠️ **Was das über `creatorId` sagt:** Der Gründer trägt ab jetzt WENIGER als
 * vorher. Er bestätigt Anfragen von außen, mehr nicht. Wer die beiden Rechte
 * gedanklich zusammenwirft, baut irgendwo `istGruender()` ein, wo `darfEinladen()`
 * hingehört — deshalb steht es hier als eigene Regel und nicht als Abfrage im Screen.
 */
export type EinladenDarf = 'nur-gruender' | 'jedes-mitglied' | 'mitglied-schlaegt-vor';

/** Ians Entscheidung vom 2026-09-05 (siehe Kopf darüber). **Nicht ohne Rückfrage.** */
export const EINLADEN_DARF: EinladenDarf = 'jedes-mitglied';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS SIEHT EIN FREMDER VON EINER PRIVATEN GRUPPE?
 *  Phase 18a. Entschieden von Ian am 2026-09-05.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Seit Phase 17 gibt es Gruppen, in die man auf Anfrage kommt. Mit dem Einladen
 * (oben) wird eine zweite Sorte möglich: eine, in die man NUR auf Einladung kommt.
 * `Group.offen` unterscheidet die beiden.
 *
 * Damit stellt sich eine Frage, die es ohne harte Regel 11 gar nicht gäbe: Seit
 * Phase 8 ist JEDER Screen direkt aufrufbar. Ein Link auf `/gruppe/g4` landet in
 * irgendeiner WhatsApp-Gruppe, und irgendwann tippt ihn jemand an, der nicht
 * gemeint war.
 *
 *   A. NAME, KATEGORIE, BEZIRK UND MITGLIEDERZAHL — sonst nichts. Kein Weg hinein,
 *      keine Posts, keine Mitgliederliste.
 *      Haken: Man weiß, DASS es diese Runde gibt, und kommt nicht hinein. Das ist
 *      unangenehm, aber ehrlich.
 *
 *   B. NUR DER NAME. Noch dichter.
 *      Haken: Eine Karte, auf der fast nichts steht, sieht aus wie ein Fehler.
 *
 *   C. GAR NICHTS — „Diese Gruppe gibt es nicht."
 *      Dichteste Variante, und die einzige, bei der man nicht einmal die Existenz
 *      erfährt. Haken: Es ist eine Lüge, und wer den Link von einem Freund hat,
 *      hält die App für kaputt.
 *
 * ── Ians Entscheidung, 2026-09-05: A. ───────────────────────────────────────
 * Nichts über PERSONEN nach außen (keine Mitgliederliste, keine Posts), aber auch
 * keine Lüge über die Gruppe selbst. C hätte den Screen aus `/gruppe/[id]`
 * unterlaufen, der schon sagt „Diese Gruppe gibt es nicht mehr" — zwei verschiedene
 * Sachverhalte mit demselben Satz, und niemand könnte sie auseinanderhalten.
 *
 * **Was daraus für die LISTE folgt und keine eigene Frage war:** In `/gruppen`
 * taucht eine private Gruppe, in der ich nicht bin, NICHT auf (`inGruppenListe`).
 * Das ist kein Widerspruch zu A: A beantwortet „was sehe ich, wenn ich die Adresse
 * habe", die Liste beantwortet „was schlägt die App mir vor". Eine Reihe von Türen,
 * die alle zu sind, ist kein Vorschlag.
 */
export type PrivatSicht = 'name-und-kategorie' | 'nur-name' | 'gar-nichts';

/** Ians Entscheidung vom 2026-09-05 (siehe Kopf darüber). **Nicht ohne Rückfrage.** */
export const PRIVAT_SICHT: PrivatSicht = 'name-und-kategorie';

/**
 * Was beim Gründen voreingestellt ist — Ians Entscheidung vom 2026-09-05: **offen**.
 *
 * Dieselbe Überlegung wie bei `STANDARD` in `app/create.tsx` (harte Regel 18): Die
 * meisten klappen nichts auf, also IST die Voreinstellung das, was fast alle
 * abschicken. „Nur auf Einladung" als Standard hätte fast jede Gruppe unauffindbar
 * gemacht und die Anfrage-Funktion aus Phase 17 stillgelegt — bei einer App, deren
 * ganzer Zweck das Finden ist.
 */
export const NEUE_GRUPPE_OFFEN = true;

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS PASSIERT MIT DEN POSTS, WENN JEMAND DIE GRUPPE VERLÄSST?
 *  Im PLAN.md ausdrücklich offen gelassen: „beim Bauen entscheiden".
 *  Entschieden von Ian am 2026-09-02.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Die Lage: Du hast „Dienstag 17:00 Tennis" gepostet, sichtbar nur für „Marswiese
 * Tennis". Zwei Tage später verlässt du die Gruppe. Der Post läuft noch.
 *
 * Was du selbst danach siehst, ist keine Frage — du bist raus und siehst die
 * Gruppen-Posts nicht mehr, auch deine eigenen nicht. Die Frage ist, was die GRUPPE
 * sieht.
 *
 *   A. DER POST BLEIBT STEHEN, bis er von selbst abläuft.
 *      Ein Post ist ein Angebot an diese Leute, und wer geht, nimmt es nicht
 *      zurück. Wer schon angefragt hat, verliert nichts; eine bestätigte
 *      Verabredung bleibt eine Verabredung.
 *      Haken: Es läuft etwas auf deinen Namen in einer Gruppe, in der du nicht mehr
 *      bist — und du kannst es selbst nicht mehr sehen, um es zurückzuziehen.
 *
 *   B. DER POST VERSCHWINDET MIT DIR. Wie beim Blockieren: alles weg.
 *      Sauber und ohne Rest. Wer geht, geht ganz.
 *      Haken: Wer gerade angefragt hat, steht ohne Erklärung da; eine bestätigte
 *      Verabredung wird abgesagt, weil du eine Gruppe verlassen hast — zwei Sachen,
 *      die im Kopf nichts miteinander zu tun haben.
 *
 *   C. DER POST WIRD ÖFFENTLICH. Die Einschränkung fällt weg, der Post bleibt.
 *      Nichts geht verloren, keine Absage.
 *      Haken: Aus „nur für meine Tennisgruppe" wird still „für ganz Wien" — das
 *      Gegenteil dessen, was der Poster wollte, und niemand hat gefragt.
 *
 * ── Ians Entscheidung, 2026-09-02: A, DER POST BLEIBT STEHEN. ────────────────
 * Es ist die einzige der drei, die niemandem etwas wegnimmt, ohne zu fragen. B
 * sagt fremde Verabredungen ab wegen einer Sache, die damit nichts zu tun hat; C
 * macht aus einer Einschränkung still ihr Gegenteil und ist damit nicht nur
 * unhöflich, sondern der einzige Datenschutz-Fehler unter den dreien.
 *
 * **Den Haken kennt er:** Es läuft etwas auf deinen Namen in einer Gruppe, in der
 * du nicht mehr bist. Leute von dort können weiter „Bin dabei" drücken, und die
 * Anfragen landen bei dir — zu einer Aktivität, die du einer Runde angeboten hast,
 * der du nicht mehr angehörst. Ein Post läuft von selbst ab (Ians Regel aus
 * `posts/lifecycle.ts`, spätestens am Ende seines Tages), das begrenzt es auf
 * Stunden statt auf immer.
 *
 * ⚠️ **Beim Bauen kleiner geworden, als er beschrieben war.** Der Haken hieß
 * zunächst auch „und du siehst deinen eigenen Post nicht mehr". Das stimmt nicht:
 * `darfIchSehen()` in `posts/hooks.ts` gibt bei eigenen Posts sofort `true` zurück
 * — eine ältere Regel, die hier unabhängig weitergilt. Man behält seinen Post also
 * im Feed und sieht, dass er noch läuft. Zwei Regeln, die einzeln richtig sind,
 * ergaben zusammen etwas anderes als der Satz in `austrittFolgen()` versprach; der
 * Satz ist deshalb korrigiert. Aufgefallen ist es erst beim Durchklicken.
 *
 * Falls das im Betrieb stört, ist die Korrektur ein Wort — und der Ort, an dem sie
 * wirkt, ist `postsBeimAustritt()` weiter unten. **Nicht ohne Rückfrage.**
 */
export type AustrittWirkung = 'posts-bleiben' | 'posts-weg' | 'posts-oeffentlich';

/** Ians Entscheidung vom 2026-09-02 (siehe Kopf darüber). **Nicht ohne Rückfrage.** */
export const AUSTRITT_WIRKUNG: AustrittWirkung = 'posts-bleiben';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  KANN DER GRÜNDER SEINE EIGENE GRUPPE VERLASSEN?
 *  Die zweite Hälfte derselben Frage. Entschieden von Ian am 2026-09-02.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sie stellt sich, weil der Gründer der Einzige ist, der Beitritte bestätigt
 * (Ians Entscheidung 2). Geht er, kommt niemand mehr hinein.
 *
 *   A. ER KANN NICHT GEHEN, nur AUFLÖSEN. Die Gruppe verschwindet für alle.
 *      Ehrlich: Ohne ihn gibt es die Gruppe nicht. Ein Knopf, eine Folge.
 *      Haken: Er hängt an etwas fest, das er nicht mehr will — oder er löscht acht
 *      Leuten ihre Gruppe weg, weil er selbst keine Lust mehr hat.
 *
 *   B. DIE LEITUNG GEHT WEITER an das Mitglied, das am längsten dabei ist.
 *      Die Gruppe überlebt ihren Gründer. Wie eine Vereinsübergabe.
 *      Haken: Jemand wird Chef, ohne gefragt worden zu sein, und merkt es erst,
 *      wenn eine Beitritts-Anfrage bei ihm liegt.
 *
 *   C. ER GEHT, DIE GRUPPE BLEIBT OHNE GRÜNDER. Alle bleiben drin, es kommt nur
 *      niemand Neues mehr dazu.
 *      Haken: Eine Gruppe, die sich nicht mehr erklärt — Beitritts-Anfragen bleiben
 *      für immer liegen, und niemand sieht, warum.
 *
 * ── Ians Entscheidung, 2026-09-02: B, DIE LEITUNG GEHT WEITER. ───────────────
 * Die Gruppe gehört den Leuten darin, nicht dem, der zuerst auf „Erstellen" getippt
 * hat. A hätte einem Einzelnen die Macht gegeben, acht anderen ihre Gruppe zu
 * löschen; C hätte eine Gruppe hinterlassen, die niemand mehr aufmachen kann und
 * bei der Anfragen für immer liegen bleiben.
 *
 * **Den Haken kennt er:** Jemand wird Gründer, ohne gefragt worden zu sein. Die App
 * mildert es an der einzigen Stelle, an der es auffällt — auf der Gruppenseite
 * steht dann, dass die Gruppe an einen übergegangen ist.
 *
 * ── Wer „am längsten dabei" ist, steht schon in den Daten ────────────────────
 * `memberIds` wächst hinten (jedes neue Mitglied kommt dazu), und der Gründer steht
 * vorn. Der Nachfolger ist deshalb schlicht der erste Eintrag, der nicht der
 * Gehende ist — siehe `nachfolgerId()`. Es braucht keinen Zeitstempel je
 * Mitgliedschaft, und damit auch kein zweites Feld, das falsch werden kann.
 *
 * ── Der Grenzfall, der sich von selbst erledigt ──────────────────────────────
 * Ist der Gründer allein in seiner Gruppe, gibt es keinen Nachfolger. Dann löst
 * sich die Gruppe auf — und das ist keine Ausnahme, sondern dieselbe Regel: Die
 * Gruppe gehört den Leuten darin, und es sind keine mehr da.
 */
export type GruenderAustritt = 'nur-aufloesen' | 'weitergeben' | 'gruppe-bleibt';

/** Ians Entscheidung vom 2026-09-02 (siehe Kopf darüber). **Nicht ohne Rückfrage.** */
export const GRUENDER_AUSTRITT: GruenderAustritt = 'weitergeben';

// ── Die Regeln ausführen ─────────────────────────────────────────────────────

/**
 * Ist diese Person in der Gruppe?
 *
 * Die EINE Stelle, an der das gefragt wird — nie `gruppe.memberIds.includes(id)` im
 * Screen. Grund ist derselbe wie bei `istDirektChat()` in `chat/direkt.ts`: Eine
 * Frage, die an acht Stellen achtmal leicht anders gestellt wird, ist acht
 * Gelegenheiten, den Gründer zu vergessen (er steht in `memberIds`, aber das muss
 * man wissen) — oder sie im Backend anders zu beantworten, wo Mitglieder später
 * eine Unterkollektion sind und keine Liste.
 */
export function istMitglied(gruppe: Group, userId: string): boolean {
  return gruppe.memberIds.includes(userId);
}

/** Ist diese Person der Gründer — also die, die Beitritte bestätigt? */
export function istGruender(gruppe: Group, userId: string): boolean {
  return gruppe.creatorId === userId;
}

/**
 * Darf diese Person überhaupt beitreten wollen? Führt `BEITRITT` aus.
 *
 * Gibt bei `'offen'` und `'anfrage'` dasselbe zurück — der Unterschied liegt nicht
 * hier, sondern darin, was danach passiert (`beitrittAnfragen` in `hooks.ts` legt
 * bei `'offen'` gar keine Anfrage an, sondern nimmt direkt auf). Die Funktion steht
 * trotzdem da, damit `'einladung'` ein Wort bleibt und kein Umbau.
 */
export function darfBeitreten(gruppe: Group, userId: string): boolean {
  if (istMitglied(gruppe, userId)) return false;
  // Phase 18a: Eine private Gruppe ist die App-weite Regel für DIESE eine Gruppe
  // ausgeschaltet. Steht VOR dem `switch`, weil `Group.offen` das speziellere Wort
  // hat — `BEITRITT` sagt, wie es normalerweise geht, `offen` sagt, ob es hier geht.
  if (!gruppe.offen) return false;
  switch (BEITRITT) {
    case 'offen':
    case 'anfrage':
      return true;
    case 'einladung':
      return false;
  }
}

/**
 * Darf diese Person jemanden in die Gruppe holen? Führt `EINLADEN_DARF` aus.
 *
 * Bewusst NICHT `istGruender()` im Screen: Seit Ians Entscheidung 26 sind das zwei
 * verschiedene Rechte, und sie stehen nur zufällig beide beim Gründer, solange er
 * allein drin ist. Wer im Screen die falsche Frage stellt, merkt es nie — bei einer
 * frisch gegründeten Gruppe geben beide dieselbe Antwort.
 */
export function darfEinladen(gruppe: Group, userId: string): boolean {
  if (!istMitglied(gruppe, userId)) return false;
  switch (EINLADEN_DARF) {
    case 'jedes-mitglied':
    case 'mitglied-schlaegt-vor':
      return true;
    case 'nur-gruender':
      return istGruender(gruppe, userId);
  }
}

/**
 * Gehört diese Gruppe in die Liste auf `/gruppen`? Führt `PRIVAT_SICHT` aus.
 *
 * Eine private Gruppe, in der ich nicht bin, taucht dort nicht auf — auch dann
 * nicht, wenn ihre Seite über einen Link erreichbar bleibt. Die beiden Fragen sind
 * verschieden: „was sehe ich, wenn ich die Adresse habe" gegen „was schlägt die App
 * mir vor". Siehe den Kopf bei `PRIVAT_SICHT`.
 */
export function inGruppenListe(gruppe: Group, userId: string): boolean {
  return gruppe.offen || istMitglied(gruppe, userId);
}

/**
 * Was auf der Gruppenseite steht, wenn man NICHT beitreten kann.
 *
 * Steht hier neben der Regel und nicht im Screen — dieselbe Überlegung wie bei
 * `blockFolgen()` in `safety/block.ts` und `schreibHuerdeText()` in `chat/direkt.ts`:
 * Ändert Ian die Regel, ändert sich der Satz mit. `undefined` heißt „keine Hürde".
 */
export function beitrittHuerdeText(gruppe: Group): string | undefined {
  // Phase 18a: Erst die Gruppe, dann die App-Regel — dieselbe Reihenfolge wie in
  // `darfBeitreten()`, damit die beiden nie auseinanderlaufen können.
  if (!gruppe.offen) {
    return 'Diese Gruppe ist privat. Hinein kommt man nur, wenn jemand von drinnen dich einlädt.';
  }
  switch (BEITRITT) {
    case 'offen':
    case 'anfrage':
      return undefined;
    case 'einladung':
      return 'In diese Gruppe kommt man nur, wenn jemand von drinnen dich einlädt.';
  }
}

/**
 * Der Satz an einer privaten Gruppe, wenn man DRIN ist — die andere Hälfte von
 * `beitrittHuerdeText()`.
 *
 * Von innen ist „privat" keine Hürde, sondern eine Auskunft: Deine Posts für diese
 * Gruppe erreichen nur Leute, die eingeladen wurden. Ohne den Satz sähe eine private
 * Gruppe von innen aus wie jede andere, und niemand wüsste, dass sein Beitrag hier
 * enger läuft als sonst.
 */
export function privatHinweis(gruppe: Group): string | undefined {
  if (gruppe.offen) return undefined;
  return 'Privat — hier kommt nur hinein, wer eingeladen wird.';
}

/**
 * Was passiert, wenn ich diese Gruppe verlasse — als Satz für die Rückfrage.
 *
 * Verlassen fragt vorher nach, wie Blockieren und Kontolöschen (Phase 7). Der Grund
 * ist derselbe: Es ist die einzige Handlung hier, die man nicht mit einem Tipp
 * zurückholen kann — hinein kommt man danach nur über eine neue Anfrage und die
 * Bestätigung von jemand anderem.
 */
export function austrittFolgen(gruppe: Group, ichId: string, nachfolgerName?: string): string[] {
  const folgen = [
    `Du siehst die Posts von „${gruppe.name}" nicht mehr.`,
    'Zurück kommst du nur über eine neue Anfrage.',
  ];

  if (istGruender(gruppe, ichId)) {
    switch (GRUENDER_AUSTRITT) {
      case 'nur-aufloesen':
        folgen.push('Die Gruppe wird für alle aufgelöst — auch für die anderen Mitglieder.');
        break;
      case 'weitergeben':
        // Ohne Nachfolger heißt „weitergeben" auflösen — siehe `nachfolgerId()`.
        // Der Satz muss das sagen, sonst tippt jemand auf „Verlassen" und ist
        // überrascht, dass seine Gruppe weg ist.
        folgen.push(
          nachfolgerName
            ? `Die Gruppe geht an ${nachfolgerName} — wer am längsten dabei ist, führt sie weiter.`
            : 'Du bist allein in der Gruppe: Sie wird damit aufgelöst.',
        );
        break;
      case 'gruppe-bleibt':
        folgen.push('Die Gruppe bleibt bestehen, aber niemand kann mehr Beitritte bestätigen.');
        break;
    }
  }

  switch (AUSTRITT_WIRKUNG) {
    case 'posts-bleiben':
      folgen.push('Deine Posts für diese Gruppe laufen normal weiter.');
      break;
    case 'posts-weg':
      folgen.push('Deine Posts für diese Gruppe werden gelöscht — auch zugesagte Treffen.');
      break;
    case 'posts-oeffentlich':
      folgen.push('Deine Posts für diese Gruppe werden öffentlich sichtbar.');
      break;
  }

  return folgen;
}

/**
 * Wer die Gruppe übernimmt, wenn `wegId` sie verlässt. `null` heißt: niemand mehr
 * da, die Gruppe löst sich auf.
 *
 * Das IST Ians Regel „das Mitglied, das am längsten dabei ist" — sie braucht keine
 * eigene Zeitrechnung, weil `memberIds` schon in Beitrittsreihenfolge steht: Der
 * Gründer legt die Gruppe an und steht vorn, jedes bestätigte Mitglied kommt hinten
 * dazu (`beitrittBestaetigen` in `hooks.ts`). Der Erste, der nicht geht, ist damit
 * der Längste-Dabei.
 *
 * ⚠️ Diese Regel hängt an EINER Eigenschaft der Daten. Wer irgendwo `memberIds`
 * sortiert oder umbaut, ändert damit still, wer eine Gruppe erbt.
 */
export function nachfolgerId(gruppe: Group, wegId: string): string | null {
  return gruppe.memberIds.find((id) => id !== wegId) ?? null;
}

/**
 * Was aus EINEM Post wird, wenn sein Verfasser die Gruppe verlässt. Führt
 * `AUSTRITT_WIRKUNG` aus.
 *
 * `null` heißt „diesen Post löschen". Alles andere ist der Post, wie er weiterlebt.
 *
 * Warum das eine Funktion über EINEN Post ist und keine über die Liste: So steht
 * Ians Regel an genau einer Stelle, und der Aufrufer in `hooks.ts` bleibt eine
 * Zeile (`flatMap`), egal welche der drei Möglichkeiten gilt. Bei einer Regel, die
 * ein Wort später anders lauten kann, ist das der Unterschied zwischen „ändern" und
 * „umbauen".
 */
export function postsBeimAustritt<P extends { visibility: Visibility }>(post: P): P | null {
  // Nur Posts, die WIRKLICH für diese eine Gruppe waren. Ein öffentlicher Post
  // desselben Verfassers geht die Gruppe nichts an — der Aufrufer hat vorher
  // gefiltert, aber diese Funktion darf sich nicht darauf verlassen: Sie ist die
  // Stelle, die Ians Regel ausführt, und eine Regel, die im falschen Fall zuschlägt,
  // ist schlimmer als keine.
  if (post.visibility.kind !== 'group') return post;

  switch (AUSTRITT_WIRKUNG) {
    case 'posts-bleiben':
      return post;
    case 'posts-weg':
      return null;
    case 'posts-oeffentlich':
      return { ...post, visibility: { kind: 'public' } };
  }
}

// ── Sichtbarkeit ─────────────────────────────────────────────────────────────

/**
 * Aus einem Schlüssel und einer vielleicht gewählten Gruppe eine gültige
 * `Visibility` bauen.
 *
 * Das ist die Brücke über die Lücke, die `types/models.ts` beschreibt: Der
 * Erstellen-Screen hält den Schlüssel als Zustand (`SsSegment` vergleicht mit
 * `===`, Objekte scheitern daran) und die Gruppen-ID daneben. Genau dazwischen kann
 * der ungültige Zustand „Gruppe gewählt, aber keine ausgewählt" entstehen.
 *
 * `null` heißt: Aus dieser Kombination lässt sich kein gültiger Post bauen. Der
 * Screen macht daraus einen Fehler, den man sieht — nicht einen Post, den niemand
 * sieht.
 */
export function sichtbarkeitBauen(kind: VisibilityKind, gruppeId: string | null): Visibility | null {
  switch (kind) {
    case 'public':
      return { kind: 'public' };
    case 'followers':
      return { kind: 'followers' };
    case 'group':
      return gruppeId === null ? null : { kind: 'group', groupId: gruppeId };
  }
}

/**
 * Wie eine Gruppe heißt, wenn man ihren Namen nicht kennt.
 *
 * Kommt vor: Ein Post zeigt seinen Gruppennamen, aber der Betrachter darf die Gruppe
 * gar nicht sehen — oder die Gruppe ist inzwischen aufgelöst. Ein leerer Platz sähe
 * dann nach einem Fehler aus.
 */
export const GRUPPE_UNBEKANNT = 'einer Gruppe';

/** Wie viele Mitglieder — Einzahl und Mehrzahl an einer Stelle. */
export function mitgliederText(anzahl: number): string {
  return anzahl === 1 ? '1 Mitglied' : `${anzahl} Mitglieder`;
}

/**
 * Vorschlag für die Kategorie einer neuen Gruppe.
 *
 * Nicht `'sport'` fest verdrahtet: Wer Gruppen anlegt, legt sie meist zu dem an, was
 * er sowieso macht. Die erste eigene Interessens-Kategorie ist der bessere Rat als
 * die erste der Liste — und falls jemand keine gesetzt hat, ist Sport der häufigste
 * Fall (Leopolds Beispiel war eine Tennisgruppe).
 */
export function kategorieVorschlag(interessen: ActivityCategory[]): ActivityCategory {
  return interessen[0] ?? 'sport';
}
