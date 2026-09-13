/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS DASTEHT, WENN DIE APP SELBST EINEN FEHLER HAT — Ians Entscheidung 71
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Eine eigene Datei aus demselben Grund wie `lib/handle.ts` und `lib/bezirk.ts`:
 * **Sie hat keine Importe.** Gebraucht wird sie an ZWEI Orten, die einander nicht
 * kennen dürfen — `data/schreiben.ts` (die Leiste) und `data/quelle.ts` (der
 * Kasten) —, und `schreiben.ts` läuft in blankem Node (`70_schreiben.sh`). Stünde
 * der Code in einer der beiden, hätte die andere ihn abgeschrieben, und zwei
 * abgeschriebene Konstanten driften still.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WOHER DIESE DATEI KOMMT — der 13.09. und Ians Profilbild
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Bildwähler und Zuschnitt liefen tadellos, danach passierte **gar nichts**: kein
 * Bild, keine Meldung, keine Fehlerleiste. Die Ursache war ein fehlendes
 * `globalThis.crypto` (harte Regel 101) — aber das ist nur die Hälfte. Die andere
 * Hälfte ist, dass der Wurf ein gewöhnlicher `Error` war und kein `SchreibFehler`:
 * `schreibVorgangIntern` wirft so etwas **absichtlich weiter**, damit ein
 * Programmfehler „laut" ist statt als „Keine Verbindung" verkleidet.
 *
 * **Die Absicht stimmt. Nur gibt es in einem Release-Build nichts Lautes** — der
 * Wurf lief durch `onPress={async …}` hinaus, React warf das Promise weg, und
 * damit war er weg. Harte Regeln 101 und 102.
 *
 * ── Die Frage, die daraus wurde, und Ians Antwort ────────────────────────────
 * Es gab zwei Orte für einen Fehler und keiner passte: die Leiste oben
 * (Entscheidung 48) für einen `SchreibFehler`, und ein Satz neben dem Knopf für
 * eine Hürde, die der Mensch beheben kann. Ein Programmfehler ist keines von
 * beidem. Ians Wahl am 2026-09-13: **A — derselbe Ort, ein eigener Satz.**
 *
 * Verworfen: **B, eine zweite andersfarbige Leiste** — ehrlich getrennt, aber ein
 * zweites Ding auf dem Schirm, und das geht gegen seine eigene Entscheidung 50
 * (harte Regel 63). Und **C, ein Satz je Screen** — am nächsten an der Stelle, an
 * der es passiert ist, aber vierzehnmal eine passende Stelle suchen, und in einer
 * Liste (Anfragen-Tab) gibt es keine.
 *
 * Seine Begründung, sinngemäß: Ein Mensch kann bei einem Programmfehler ohnehin
 * nichts tun. Was er braucht, ist die Auskunft, **dass es nicht an ihm lag** und
 * dass es nicht stillschweigend passiert ist.
 */

/**
 * Der Code, an dem beide Seiten einen Programmfehler erkennen.
 *
 * ── Warum ein Schrägstrich drin steht, und das ist kein Schmuck ──────────────
 * Er landet in demselben Feld wie ein SQLSTATE (`42501`, `23505`) und ein
 * PostgREST-Code (`PGRST301`). Ein Wert wie `'P0001'` sähe aus wie beides — und
 * `P0001` ist ein echter SQLSTATE (`raise_exception`), den eine unserer neun
 * Funktionen eines Tages wirklich werfen kann. Dann bekäme ein Datenbankfehler
 * diesen Satz hier, und niemand würde es merken.
 *
 * Ein SQLSTATE ist **fünf alphanumerische Zeichen**, mehr nicht. Ein `/` kann
 * darin nicht vorkommen — die Kollision ist damit nicht unwahrscheinlich, sondern
 * unmöglich.
 */
export const PROGRAMM_CODE = 'app/programmfehler';

/**
 * Ians Satz (Entscheidung 71) — er steht EINMAL da, für beide Orte.
 *
 * ⚠️ **Was hier NICHT stehen darf:** kein Fehlertext, kein Dateiname, kein
 * Stapelauszug (der Fund vom 2026-09-03: Entwickler-Notizen in JSX-Text sind
 * öffentlich). Der echte Fehler geht auf die Konsole, und nur dorthin.
 *
 * Und er ist KURZ, weil die Leiste seit Entscheidung 48 den Bildschirm schiebt:
 * Jede Zeile kostet echten Platz vor dem, weswegen jemand gekommen ist.
 */
export const PROGRAMM_TEXT = 'Da ist etwas schiefgegangen, das nicht an dir liegt.';

/** Ist dieser Fehler ein Fehler der APP — und keine Absage des Servers? */
export function istProgrammFehler(code: string): boolean {
  return code === PROGRAMM_CODE;
}

/**
 * Dieselbe Auskunft für den KASTEN — Titel und Erklärung getrennt.
 *
 * ── Warum das kein zweiter Wortlaut ist, sondern das bestehende Muster ───────
 * Die Leiste sagt „Du bist nicht mehr angemeldet."; der Kasten sagt dasselbe als
 * Titel und setzt einen erklärenden Satz darunter („Melde dich noch einmal an,
 * dann ist alles wieder da."). Der Unterschied steht im Kopf von
 * `components/SchreibFehler.tsx` und ist eine Lage, kein Geschmack: **Die Leiste
 * SCHIEBT den Bildschirm, der Kasten IST der Bildschirm.** Vor einer Leiste steht
 * das, weswegen jemand gekommen ist — dort kostet jede Zeile echten Platz; vor
 * einem Kasten steht nichts, und ein Titel allein ließe jemanden ratlos zurück.
 */
export const PROGRAMM_TITEL = 'Da ist etwas schiefgegangen';
export const PROGRAMM_ERKLAERUNG =
  'Es liegt nicht an dir und nicht an deinem Netz — der Fehler steckt in der App selbst.';

/**
 * Der Knopf unter dem Kasten und neben der Zeile.
 *
 * ⚠️ **Das ist eine AUSLEGUNG von Entscheidung 71 und wartet auf Ians Urteil.**
 * Bei der LEISTE steht „Alles klar", und die Begründung ist hart: Ein neuer
 * Versuch läuft in denselben Programmfehler, und ein Knopf, der erkennbar nichts
 * ändert, ist eine Schleife, die wie ein Defekt aussieht (harte Regel 76).
 *
 * **Beim Laden gilt dieselbe Begründung und trotzdem das Gegenteil**, weil die
 * Lage eine andere ist: Unter der Leiste steht der richtige Inhalt, unter dem
 * Kasten steht NICHTS. `LadeSchirm` zeichnet seinen Knopf immer, und er ruft
 * `nochmal` — ein Knopf namens „Alles klar", der neu lädt, wäre eine Lüge, und
 * gar kein Knopf wäre ein Bildschirm, den man nur durch Neustarten verlässt.
 * **Ein nutzloser Knopf ist besser als eine Sackgasse — aber das ist meine
 * Abwägung, nicht seine.** Die Korrektur wäre ein Wort.
 */
export const PROGRAMM_KNOPF_LADEN = 'Nochmal versuchen';

/**
 * Was als „Tabelle" in einem `LadeFehler` steht, wenn es gar keine gab.
 *
 * `LadeFehler` verlangt eine — seine `message` lautet *„Tabelle X konnte nicht
 * gelesen werden"*. Bei einem Programmfehler ist das die falsche Frage, und
 * deshalb steht hier ein Wert, der die Meldung in der Konsole ehrlich lässt statt
 * einen Tabellennamen zu erfinden. **Auf den Bildschirm kommt er nie** (harte
 * Regel 76: kein Tabellenname, kein Code).
 */
export const PROGRAMM_TABELLE = '(keine — die App selbst)';
