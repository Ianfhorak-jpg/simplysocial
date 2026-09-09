import type { GeoPunkt } from '@/lib/karte-geo';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS DER STANDORT DARF — UND WAS ER NIEMALS DARF
 *  Phase 19h-2. Die Ausführung von Ians Entscheidung 61 vom 2026-09-08.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Seine Worte zum Bezirks-Filter waren *„Bezirk ist too viel, das sieht echt nicht
 * gut aus"*, und sein Gegenentwurf war kein besserer Filter, sondern gar keiner: Man
 * gibt seinen Bezirk einmal an, und die App zeigt von dort aus nach außen — *„und
 * dann entfernt man sich immer weiter."* Das ist seit 19h-1 gebaut (Entscheidung 63,
 * `sort.ts`). Entscheidung 61 hat dabei schon gesagt, wie es weitergeht:
 *
 *     **der Heimatbezirk ist die GRUNDLAGE, der Standort kommt OPTIONAL dazu.**
 *
 * Diese Datei ist die eine Stelle, an der steht, was „optional dazu" heißt. Screens
 * lesen die Konstanten nie — sie sehen nur das Ergebnis, und die Sätze über den
 * Standort kommen aus `standortFolgen()`. Dieselbe Bauart wie `safety/block.ts`
 * (harte Regel 17), `groups/gruppe.ts` (32) und `requests/kollision.ts` (46), und aus
 * demselben Grund: Sonst verspricht irgendwann ein Screen etwas, das die Regel nicht
 * mehr tut.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DIE HARTE ZUSAGE, DIE HIER SCHARF WIRD — REGEL 47
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * *Was die App über eine Person weiß, sagt sie NUR dieser Person.* Bisher betraf das
 * Termine (Phase 18d). Ein Aufenthaltsort ist die schärfere Fassung derselben Regel,
 * und sie hat hier eine Form, die man nachprüfen kann:
 *
 *   • Der Standort geht **ausschließlich** in eine REIHENFOLGE ein (`sort.ts`).
 *   • Er steht **an keinem Post**, in **keinem Profil**, in **keinem Chat**.
 *   • Er wird **nicht gespeichert** — kein Feld am `User`, keine Zeile im Speicher.
 *     Er lebt in genau einem `useState` und ist beim nächsten Start wieder weg.
 *   • Er wird **nicht angezeigt**, auch nicht der Person selbst als Zahl. Eine
 *     angezeigte Entfernung wäre ein Versprechen über Genauigkeit, das die Daten
 *     nicht abgeben können (siehe den Absatz über die Bezirksmitten in
 *     `lib/karte-geo.ts`) — und sie wäre der erste Schritt zu „Lea ist 400 m weg".
 *
 * **Wer hier etwas hinzufügt, das den Standort ANZEIGT oder SPEICHERT, hebt
 * Entscheidung 61 und harte Regel 47 zugleich auf. Nicht ohne Rückfrage.**
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS DER STANDORT MIT DEM HEIMATBEZIRK MACHT — die Entscheidung dieser Phase
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Drei Lesarten von „kommt optional dazu", und sie verhalten sich am Gerät
 * verschieden:
 *
 *   A. GENAUERER AUSGANGSPUNKT  (`'ausgangspunkt'`)
 *      Der Heimatbezirk bleibt stehen und bleibt die Grundlage; solange ein
 *      Standort da ist, wird ab IHM gemessen statt ab der Bezirksmitte. Wer am
 *      Wochenende in 1010 sitzt, sieht, was um ihn herum ist — und beim nächsten
 *      Öffnen ohne Erlaubnis wieder seinen Bezirk.
 *      Haken: Die Reihenfolge ändert sich, ohne dass man etwas getan hat. Wer nicht
 *      weiß, dass die App den Standort benutzt, hält das für Zufall.
 *
 *   B. NUR DEN BEZIRK SETZEN  (`'bezirk-setzen'`)
 *      Der Standort beantwortet einmal die Frage „in welchem Bezirk bist du?" und
 *      trägt die Antwort in die Einstellung ein. Gemessen wird weiter ab der
 *      Bezirksmitte.
 *      Haken: Der Gewinn ist fast null — es erspart ein Antippen beim Einrichten und
 *      sonst nichts. Dafür einen Erlaubnis-Dialog zu stellen, ist zu teuer.
 *      Schlimmer: Es ÜBERSCHREIBT eine Angabe, die die Person selbst gemacht hat.
 *
 *   C. NUR AUF ANFRAGE  (`'nur-knopf'`)
 *      Der Heimatbezirk gilt immer. Es gibt einen Knopf „von hier aus", der die
 *      Reihenfolge für diesen einen Moment umstellt.
 *      Haken: Ein Knopf mehr auf dem Startbildschirm — und harte Regel 63
 *      (Entscheidung 50) sagt, dass ein neues Bedienelement begründen muss, warum
 *      es im Weg stehen darf. Ein Knopf, den man erst drücken muss, damit die App
 *      das Naheliegende tut, begründet das schlecht.
 *
 * ── Ians Entscheidung 69, 2026-09-09: A, GENAUERER AUSGANGSPUNKT. ────────────
 * Die wörtliche Lesart von Entscheidung 61: *Grundlage* — der Bezirk bleibt gesetzt
 * und gilt immer, auch ohne Erlaubnis — *plus optional dazu*: Solange ein Standort
 * da ist, verfeinert er, WO gemessen wird.
 *
 * **Den Haken kennt er, er stand in der Frage:** Die Reihenfolge ändert sich, ohne
 * dass jemand etwas getan hat. Wer nicht mehr weiß, dass der Schalter an ist, hält
 * das für Zufall — und die App sagt es ihm nicht, weil sie den Standort nirgends
 * anzeigen darf (Regel 47 oben). Die einzige Rückmeldung ist das Wort „An" in den
 * Einstellungen. Falls sich das im Betrieb beißt, ist der Wechsel EIN Wort;
 * alle drei Rollen stehen fertig da. **Nicht ohne Rückfrage ändern.**
 *
 * Belegt vor der Entscheidung, nicht behauptet: Wohnsitz 1010, gemessener Ort
 * Floridsdorf — aus `1010 → 1070 → 1210 → 1220 → 1130` wird
 * `1210 → 1010 → 1220 → 1070 → 1130`.
 */
export type StandortRolle = 'ausgangspunkt' | 'bezirk-setzen' | 'nur-knopf';

/** Ians Entscheidung 69 vom 2026-09-09 (siehe Kopf dieser Datei). Nicht ohne Rückfrage ändern. */
export const STANDORT_ROLLE: StandortRolle = 'ausgangspunkt';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WANN GEFRAGT WIRD
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * **Ians Entscheidung 70 vom 2026-09-09: `'einstellung'`** — nur, wenn jemand in den
 * Einstellungen den Schalter selbst umlegt. Niemand wird gefragt, der nicht hingeht.
 *
 * Verworfen, mit Begründung, als Gedächtnis:
 *   'beim-start'  Der Dialog beim ersten Öffnen. Das ist genau das, was Ians
 *                 Entscheidung 50 verbietet: Man macht die App impulsiv auf und
 *                 wischt, bis etwas kommt — und bekommt stattdessen eine Frage über
 *                 etwas, das man noch gar nicht benutzt hat. Wer sie in dem Moment
 *                 wegdrückt, drückt sie für immer weg; iOS zeigt den Systemdialog
 *                 **nur ein einziges Mal**, danach führt der Weg über die
 *                 Systemeinstellungen. Ein einziger Fehlgriff kostet die Funktion
 *                 dauerhaft.
 *   'beim-feed'   Beim ersten Blick in den Feed. Besser begründet als 'beim-start',
 *                 aber derselbe Fehler: Der Feed ist genau der Bildschirm, auf dem
 *                 man etwas anderes vorhat.
 *
 * **Der Preis stand in der Frage und ist angenommen: Die meisten Leute finden den
 * Schalter nie** — die Funktion ist dann faktisch aus. Genau deshalb ist der
 * Heimatbezirk die Grundlage und nicht der Standort: Die App muss ohne ihn
 * vollständig funktionieren, und sie tut es (Stand 19h-1). Der Schalter steht in den
 * Einstellungen ganz oben, direkt unter dem Bezirk, den er verfeinert.
 *
 * Verworfen ist damit ausdrücklich auch `'beim-feed'` — es hätte mehr Leute
 * erreicht, und der Grund dagegen ist Entscheidung 50 in ihrer zweiten Richtung
 * (harte Regel 63): *Man macht die App impulsiv auf und wischt, bis etwas kommt.*
 */
export const STANDORT_FRAGE: 'einstellung' | 'beim-start' | 'beim-feed' = 'einstellung';

/**
 * Wie alt eine Messung höchstens sein darf, bevor neu gefragt wird.
 *
 * Fünf Minuten, und die Zahl ist eine Festlegung wie `KOLLISION_FENSTER_MIN` — keine
 * Messung. Sie hängt an der Frage, die der Standort beantwortet: „ist das bei mir um
 * die Ecke?" Wer in fünf Minuten weit genug fährt, um die Antwort zu ändern, sitzt in
 * der U-Bahn und schaut nicht in den Feed. Kürzer wäre teurer (jede Messung kostet
 * Strom und weckt das GPS), länger wäre falsch, wenn jemand wirklich unterwegs ist.
 */
export const STANDORT_FRISCHE_MS = 5 * 60 * 1000;

/**
 * Der gemessene Ort, so wie der Rest der App ihn sieht.
 *
 * **Es gibt bewusst keinen Zeitstempel und keine Genauigkeit darin.** Beides wäre
 * eine Auskunft, die niemand braucht und die irgendwann jemand anzeigt — die Frische
 * regelt `useMeinOrt()` für sich, und die Genauigkeit ginge in einer Reihenfolge
 * ohnehin unter.
 */
export type MeinOrt = GeoPunkt | null;

/** Woran der Schalter in den Einstellungen gerade ist. */
export type StandortZustand =
  /** Noch nie gefragt. */
  | 'aus'
  /** Gefragt, erlaubt — und die Messung läuft oder ist da. */
  | 'an'
  /** Gefragt und abgelehnt. Führt über die Systemeinstellungen zurück, nicht über uns. */
  | 'verweigert'
  /** Die Plattform kann es nicht (siehe `standortMoeglich`). */
  | 'unmoeglich';

/**
 * Die Sätze, die die Oberfläche über den Standort sagt — an EINER Stelle, damit sie
 * nicht auseinanderlaufen, wenn `STANDORT_ROLLE` sich ändert.
 *
 * Dieselbe Bauart wie `blockFolgen()` und `austrittFolgen()`. Der Screen tippt keinen
 * dieser Sätze selbst; sonst steht dort eines Tages etwas, das die Regel nicht mehr
 * tut — genau das ist in Phase 17 passiert und stand bis Phase 20.1 im Lösch-Screen.
 */
export function standortFolgen(zustand: StandortZustand): {
  titel: string;
  erklaerung: string;
} {
  switch (zustand) {
    case 'an':
      return {
        titel: 'Von deinem Standort aus',
        erklaerung:
          STANDORT_ROLLE === 'ausgangspunkt'
            ? 'Dein Feed sortiert ab da, wo du gerade bist. Niemand sieht deinen Standort.'
            : 'Dein Bezirk wird automatisch gesetzt. Niemand sieht deinen Standort.',
      };
    case 'verweigert':
      return {
        titel: 'Standort ist aus',
        erklaerung:
          'Du hast das abgelehnt — das ändert man in den Einstellungen deines Handys. Dein Feed sortiert weiter ab deinem Bezirk.',
      };
    case 'unmoeglich':
      return {
        titel: 'Standort gibt es hier nicht',
        erklaerung: 'Dein Feed sortiert ab deinem Bezirk.',
      };
    case 'aus':
    default:
      return {
        titel: 'Von deinem Standort aus',
        erklaerung:
          'Statt ab deinem Bezirk sortiert der Feed dann ab da, wo du gerade bist. Der Standort wird nirgends angezeigt und nicht gespeichert.',
      };
  }
}

/**
 * Was der Speicher über den Standort führt — und mehr wird es nicht.
 *
 * `gemessenUm` steht hier und **nicht** in `MeinOrt`, weil es eine Frage an die
 * MESSUNG ist und keine an den Ort: „muss ich neu fragen?" (`STANDORT_FRISCHE_MS`).
 * Wer den Ort weiterreicht, soll den Zeitstempel gar nicht erst in der Hand haben —
 * sonst steht er eines Tages irgendwo („zuletzt gesehen vor 3 Minuten").
 */
export interface StandortStand {
  zustand: StandortZustand;
  ort: MeinOrt;
  /** `Date.now()` der letzten Messung, oder `null`. Nur `useMeinOrt()` liest das. */
  gemessenUm: number | null;
}
