/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS PASSIERT MIT MEINEN SACHEN, WENN ICH MEIN KONTO LÖSCHE?
 *  Die Frage kam beim Bauen von Phase 20 aus dem SCHEMA und stand in keinem Plan.
 *  Entschieden von Ian am 2026-09-06: ALLES MIT — außer der Gruppe.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Bis Phase 20 war das keine Frage, weil es ohne Login kein Konto gab; der letzte
 * Klick auf `/account-loeschen` tat nichts, und der Screen sagte das selbst. Beim
 * Anlegen des Schemas hat die Datenbank sie gestellt:
 *
 *     delete from auth.users where id = <Ian>;
 *     ERROR:  violates foreign key constraint "groups_creator_id_fkey"
 *
 * Wer je gepostet oder eine Gruppe gegründet hatte, konnte sein Konto überhaupt
 * nicht löschen. Den Screen dafür verlangt Apple (Richtlinie 1.2).
 *
 *   A. ALLES MIT — Posts weg, Chats weg, Nachrichten weg.
 *      Die sauberste Auskunft gegenüber dem, der geht, und die einfachste gegenüber
 *      der DSGVO. „Gelöscht" heißt gelöscht.
 *      Haken: Wer morgen 17:00 mit vier Leuten verabredet war, sagt allen vieren
 *      kommentarlos ab.
 *
 *   B. DAS PROFIL WIRD GELEERT, DAS VERABREDETE BLEIBT.
 *      Name, Bio, Bild und Jahrgang verschwinden, die Zeile bleibt als „Gelöschtes
 *      Konto" stehen; laufende Posts und Chats bleiben lesbar. Die konsequente
 *      Fortsetzung von `AUSTRITT_WIRKUNG` (Entscheidung 12).
 *      Haken: „gelöscht" heißt dann nicht „weg" — meine Sätze stehen weiter in
 *      fremden Chats. Rechtlich der heikelste der drei.
 *
 *   C. GETEILT — Posts ohne Zusagen gehen, Posts mit Zusagen bleiben bis zum Ablauf.
 *      Sachlich das Genaueste.
 *      Haken: Zwei Leute löschen am selben Tag, bei einem bleiben drei Posts stehen
 *      und beim anderen keiner. Sieht von außen willkürlich aus.
 *
 * ── Ians Wahl, und die zweite Hälfte davon ────────────────────────────────────
 * Er hat A genommen. A hieß in der Frage aber auch „Gruppen weg", und damit stieß es
 * mit `GRUENDER_AUSTRITT = 'weitergeben'` zusammen (seine Entscheidung 13, in
 * `groups/gruppe.ts` als „nicht ohne Rückfrage ändern" markiert): Ein Konto zu
 * löschen IST ein Verlassen. Nachgefragt, und seine Antwort war präziser als beide
 * Fassungen für sich:
 *
 *     **A gilt für alles, was NUR mir gehört. Eine Gruppe gehört acht Leuten.**
 *
 * Entscheidung 13 bleibt damit unangetastet. Ist niemand sonst in der Gruppe, löst
 * sie sich auf — keine Ausnahme, sondern dieselbe Regel, siehe `nachfolgerId()`.
 *
 * ── Wo diese Regel WIRKLICH ausgeführt wird ───────────────────────────────────
 * In `supabase/migrations/0003_konto_loeschen.sql`, als eine Transaktion. Diese
 * Datei hier ist die App-Seite derselben Regel — genau wie `block.ts` neben seiner
 * Policy steht. **Sie führt nichts aus, sie schreibt es AUF**, und der Screen liest
 * nur `loeschFolgen()`. Dieselbe Bauart und derselbe Grund wie bei `blockFolgen()`
 * (harte Regel 17): Ein Screen, der die Folgen selbst formuliert, verspricht
 * irgendwann etwas, das die Regel nicht mehr tut.
 *
 * Genau das war am 2026-09-06 der Fall: Der Screen sagte „die Nachrichten selbst
 * bleiben bei den anderen stehen" — das ist Möglichkeit B, und Ian hat A gewählt.
 * Der Satz stand seit Phase 7 fest im JSX, also gab es keine Stelle, die er beim
 * Entscheiden mitgeändert hätte.
 */

/** Was ein Kontolöschen anfasst — die zwei Dinge, über die A, B und C sich uneinig sind. */
export interface LoeschWirkung {
  /**
   * `weg`      — Posts und Chats verschwinden, auch bei den anderen.
   * `bleibt`   — sie bleiben stehen, das Profil wird nur geleert.
   * `geteilt`  — nur was niemandem zugesagt ist, verschwindet.
   */
  inhalte: 'weg' | 'bleibt' | 'geteilt';
  /**
   * `mit`      — eine gegründete Gruppe wird aufgelöst.
   * `vererbt`  — sie geht an das Mitglied, das am längsten dabei ist.
   */
  gruppen: 'mit' | 'vererbt';
}

/** Möglichkeit A, wie sie gefragt wurde. */
export const ALLES_MIT: LoeschWirkung = { inhalte: 'weg', gruppen: 'mit' };

/** Möglichkeit B. */
export const PROFIL_GELEERT: LoeschWirkung = { inhalte: 'bleibt', gruppen: 'vererbt' };

/** Möglichkeit C. */
export const GETEILT: LoeschWirkung = { inhalte: 'geteilt', gruppen: 'vererbt' };

/**
 * Ians Entscheidung 39 vom 2026-09-06 — A, **mit der Gruppe als Ausnahme.**
 *
 * Das ist keine vierte Möglichkeit und kein Kompromiss, sondern die Anwendung von
 * Entscheidung 13 auf einen Fall, den sie schon abdeckte. **Nicht ohne Rückfrage
 * ändern** — und wer sie ändert, ändert `0003_konto_loeschen.sql` mit.
 */
export const LOESCH_WIRKUNG: LoeschWirkung = { inhalte: 'weg', gruppen: 'vererbt' };

/**
 * Die Sätze, die auf dem Lösch-Screen stehen. Führen `LOESCH_WIRKUNG` aus.
 *
 * `nachfolgerName` ist der Mensch, der eine gegründete Gruppe erben würde — `null`,
 * wenn es keine Gruppe gibt oder man allein darin ist. Der Screen holt ihn, weil nur
 * er weiß, WER gerade davorsteht; welche Sätze daraus werden, entscheidet diese
 * Datei.
 */
export function loeschFolgen(
  gruppenAlsGruender: number,
  nachfolgerName: string | null,
  wirkung: LoeschWirkung = LOESCH_WIRKUNG,
): string[] {
  const folgen: string[] = [];

  if (wirkung.inhalte === 'weg') {
    // Beide Hälften in EINEM Satz, weil sie zusammen die unangenehme Auskunft
    // ergeben: Es geht nicht nur um meine Sachen, es sagt fremde Termine ab.
    folgen.push(
      'Deine Posts verschwinden aus dem Feed — auch die, für die schon jemand ' +
        'zugesagt hat. Diese Verabredungen sind damit abgesagt, ohne dass die anderen ' +
        'erfahren, warum.',
    );
    folgen.push(
      'Eure gemeinsamen Chats verschwinden mitsamt allen Nachrichten, auch bei den ' +
        'anderen.',
    );
  }
  if (wirkung.inhalte === 'bleibt') {
    folgen.push(
      'Deine Posts und Chats bleiben stehen. Statt deines Namens steht dort ' +
        '„Gelöschtes Konto" — die Nachrichten selbst kannst du aus fremden Verläufen ' +
        'nicht herauslöschen.',
    );
  }
  if (wirkung.inhalte === 'geteilt') {
    folgen.push(
      'Posts, für die noch niemand zugesagt hat, verschwinden. Posts mit Zusagen ' +
        'bleiben bis zu ihrem Ende stehen, damit die Verabredung hält.',
    );
  }

  // Über Gruppen wird nur geredet, wenn es welche gibt. Ein Satz über eine Gruppe,
  // die man nicht hat, ist keine Beruhigung, sondern eine Frage mehr.
  if (gruppenAlsGruender > 0) {
    const wort = gruppenAlsGruender === 1 ? 'Deine Gruppe' : 'Deine Gruppen';
    if (wirkung.gruppen === 'mit') {
      folgen.push(`${wort} wird aufgelöst — auch für alle anderen darin.`);
    } else {
      folgen.push(
        nachfolgerName
          ? `${wort} bleibt bestehen und geht an ${nachfolgerName} — wer am längsten ` +
              'dabei ist, führt sie weiter.'
          : `${wort} wird aufgelöst: Du bist allein darin.`,
      );
    }
  }

  // Steht bei allen drei Möglichkeiten und ist deshalb kein Fall im `if`.
  // Wer jemanden gemeldet hat, nimmt den Beleg NICHT mit — sonst hätte, wer gemeldet
  // wird, einen Weg, ihn verschwinden zu lassen (`reports.from_user_id` ist
  // `on delete set null`, nicht `cascade`).
  folgen.push(
    'Meldungen, die du geschrieben hast, bleiben bei uns liegen — ohne deinen Namen.',
  );

  return folgen;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 *  WAS NACH DEM LETZTEN KLICK PASSIERT — Ians Entscheidungen 52 und 53
 *  Gefragt am 2026-09-12, als der Screen endlich an `konto_loeschen()` ging.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Bis heute war das keine Frage: Der Screen setzte `schritt = 'fertig'`, zeigte
 * „Hier wäre Schluss" und sagte selbst, dass nichts gelöscht wurde. Sobald wirklich
 * gelöscht wird, zerfällt der letzte Klick in zwei Dinge, die nichts miteinander zu
 * tun haben — WAS am Server passiert (das ist Entscheidung 39, oben) und WAS der
 * Mensch danach sieht.
 *
 *   A. RAUS, UND EIN SATZ BEIM ANMELDEN.
 *      Gelöscht → abgemeldet → Anmelde-Bildschirm, darüber eine Zeile.
 *      Haken: Der Anmelde-Bildschirm trägt damit einen Zustand, den er sonst nie hat.
 *
 *   B. ERST EIN ABSCHLUSS-BILDSCHIRM, DANN RAUS.
 *      Der Weg, den der Screen bis heute vormachte.
 *      Haken — und er ist kein Geschmack, sondern harte Regel 87: Zwischen dem
 *      Löschen und dem Klick läuft die App mit einem TOTEN Konto weiter. Kommt in
 *      dieser Zeit ein Realtime-Anstoß, lädt sie nach, bekommt `42501`, und der
 *      Vollbild-Kasten aus `LadeSchirm` reißt den Abschluss-Bildschirm weg.
 *
 *   C. RAUS, OHNE SATZ.
 *      Am wenigsten Bau, kein toter Zwischenzustand.
 *      Haken: Die stärkste Handlung der App endet ohne Quittung — von „Abmelden"
 *      nicht zu unterscheiden.
 *
 * ── Ians Wahl: A ─────────────────────────────────────────────────────────────
 * **Nicht ohne Rückfrage ändern.** Wer B einbaut, baut die Falle aus 20.5-c ein
 * zweites Mal; wer C einbaut, nimmt die Quittung weg.
 */
export const LOESCH_ABSCHLUSS: 'raus-mit-satz' | 'abschluss-bildschirm' | 'raus-still' =
  'raus-mit-satz';

/**
 * Die Quittung auf dem Anmelde-Bildschirm.
 *
 * Sie steht hier und nicht im Screen — dieselbe Bauart und derselbe Grund wie
 * `loeschFolgen()` und `blockFolgen()` (harte Regel 17). **Vergangenheit und kein
 * Versprechen:** „Dein Konto wird gelöscht" wäre eine Zusage über etwas, das schon
 * passiert ist, und beim kleinsten Zweifel liest sich das wie „es läuft noch".
 *
 * KEIN „schade, dass du gehst". Wer bis hierher gekommen ist, hat zweimal bestätigt;
 * ein Bedauern an dieser Stelle ist die App, die sich wichtiger nimmt als der Mensch,
 * der gerade gegangen ist.
 */
export const LOESCH_QUITTUNG = 'Dein Konto wurde gelöscht.';

/**
 * Das Profilbild geht VOR dem Konto — und das ist keine Reihenfolge, sondern eine
 * Notwendigkeit aus harter Regel 89.
 *
 * `storage.objects.owner` hängt an KEINEM Fremdschlüssel auf `auth.users` (gemessen
 * in 20.6-a), und Supabase verbietet jedes SQL-`delete` in `storage` — deshalb kann
 * `konto_loeschen()` das Bild nicht mitnehmen. Danach geht es auch nicht mehr: Das
 * Token ist tot, der Storage-Aufruf käme nicht mehr durch. Bliebe das Bild liegen,
 * wäre es bei einem OFFENEN Bucket (Ians Entscheidung 50) dauerhaft im Netz
 * abrufbar — ein gelöschtes Konto mit einem Gesicht, das jeder weiter sehen kann.
 *
 * **Der Preis steht in `loeschFehlerText()`** und ist Ians Entscheidung 53.
 */
export const BILD_ZUERST = true;

/**
 * Ians 53. Entscheidung vom 2026-09-12: **den Preis benennen, nicht verschweigen.**
 *
 * Geht das Löschen schief, NACHDEM das Bild schon weg ist, steht ein Mensch mit
 * einem Konto da, dem etwas fehlt. Die drei Möglichkeiten:
 *
 *   A. EHRLICH BENENNEN — die Leiste sagt beides. Ians Wahl.
 *      Haken: eine Zeile mehr in einer Leiste, die seit Entscheidung 48 SCHIEBT,
 *      also echten Platz kostet.
 *   B. NUR „hat nicht geklappt" — wie jeder andere Schreibvorgang.
 *      Haken: Das Bild ist still weg, und beim nächsten Blick aufs Profil ist da
 *      ein Loch, das niemand erklärt hat. Dieselbe Familie wie „Noch nichts los in
 *      deinem Feed" bei einem Netzausfall: ein Bildschirm, der lügt.
 *   C. BILD ERST NACH DEM LÖSCHEN — dann kostet ein Fehlschlag nichts.
 *      Haken: unmöglich, siehe `BILD_ZUERST`. Wurde ihm vorgelegt und abgelehnt.
 *
 * ── Warum das nicht in `schreibFehlerFolgen()` steht ─────────────────────────
 * Weil die Auskunft nicht vom FEHLERCODE abhängt, sondern davon, wie weit der
 * Vorgang gekommen war. `data/schreiben.ts` weiß das nicht und soll es nicht wissen
 * müssen — es kennt Aktionen, keine Zwischenstände. Der Satz wird deshalb hier
 * gebildet und vom Aufrufer angehängt.
 *
 * @param bildSchonWeg `true`, wenn es ein Bild GAB und `profilbildEntfernen()`
 *   bereits durch war. **Beides zusammen** — wer nie eines hatte, hat nichts
 *   verloren, und ein Satz über seinen Verlust wäre genau der lügende Bildschirm,
 *   gegen den die Entscheidung gebaut ist. Gelesen wird das in `loeschVorgang()`
 *   (`safety/hooks.ts`), und zwar VOR dem Entfernen: Danach steht dort in jedem
 *   Fall `null`.
 */
export function loeschFehlerText(bildSchonWeg: boolean): string | null {
  if (!bildSchonWeg) return null;
  // Zwei kurze Hauptsätze statt eines langen: Der erste beruhigt, der zweite nennt
  // den Schaden. Andersherum liest man die Beruhigung erst nach dem Schreck.
  return 'Dein Konto ist noch da — dein Profilbild ist aber schon entfernt.';
}
