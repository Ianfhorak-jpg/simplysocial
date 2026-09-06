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
