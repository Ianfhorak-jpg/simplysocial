/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS DER BILDSCHIRM MACHT, WÄHREND GESCHRIEBEN WIRD
 *  Phase 20.5 (App-Seite). Ians 46. Entscheidung, vom 2026-09-12.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Dieselbe Bauart wie `data/quelle.ts` (harte Regel 76), `safety/block.ts` (17),
 * `groups/gruppe.ts` (32), `requests/kollision.ts` (46), `posts/standort.ts` (68)
 * und `auth/anmeldung.ts` (69): Screens lesen `SCHREIB_ANTWORT` nie, sie sehen nur
 * das Ergebnis, und die Sätze kommen aus `schreibFehlerFolgen()`.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DIE FRAGE — und warum es sie im Prototyp nicht gab
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * `aendern()` war bis heute AUGENBLICKLICH. Der Speicher lag im Arbeitsspeicher,
 * zwischen „Bin dabei" und dem neu gezeichneten Bildschirm lag nichts. Mit einer
 * Datenbank in Irland liegen dort ein paar Zehntelsekunden — und damit gibt es
 * einen dritten Zustand, den die App vorher nicht kannte:
 *
 *     abgeschickt, aber noch nicht bestätigt.
 *
 * Wer ihn nicht benennt, bekommt ihn trotzdem. Er sieht dann so aus: Man tippt
 * „Bin dabei", nichts passiert, man tippt noch einmal.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DREI MÖGLICHKEITEN — Ians Wahl ist A
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   A. GEMISCHT — je nachdem, wer das Ergebnis bestimmt   ← **seine Wahl**
 *      Wo die App das Ergebnis selbst hinschreiben kann, ändert sich der
 *      Bildschirm sofort. Wo der SERVER es bestimmt, wartet der Knopf sichtbar.
 *      **Der Haken, den er kennt:** Zwei Verhaltensweisen in einer App. Das ist
 *      nur zu rechtfertigen, wenn der Trennstrich eine SACHE benennt und nicht ein
 *      Gefühl — deshalb steht er unten als Frage und nicht als Liste von Ausnahmen.
 *
 *   B. IMMER SOFORT, Fehler nimmt es zurück  (verworfen)
 *      Jeder Knopf wirkt augenblicklich. Verloren hat sie an einer Sache, die man
 *      erst sieht, wenn man es hinschreiben will: **Die App müsste vorhersagen,
 *      was der Server tun wird.** Bei `anfrageBestaetigen` heißt das, Ians
 *      Platz-Regel steht ZWEIMAL da — einmal als `select … for update` in
 *      `0004_transaktionen.sql`, einmal als `if (post.spotsFilled >= …)` in
 *      TypeScript. Genau die zwei Wahrheiten, gegen die harte Regel 70 gebaut ist.
 *      Und der sichtbare Preis wäre der übelste: ein Konfetti, das zurückspringt.
 *
 *   C. IMMER WARTEN  (verworfen)
 *      Die ehrlichste: Was dasteht, ist wirklich passiert, und keine Regel steht
 *      zweimal da. Verloren hat sie im Chat. Eine getippte Nachricht, die erst
 *      nach dem Umlauf nach Irland erscheint, fühlt sich kaputt an — bei WhatsApp
 *      steht sie sofort, und daran misst jeder eine Chat-App. Dasselbe Argument
 *      wie bei Entscheidung 50: nicht zweimal tippen für das, weswegen man da ist.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DER TRENNSTRICH — eine Frage, keine Liste von Ausnahmen
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *     Kann die App das Ergebnis selbst hinschreiben, ohne zu raten?
 *
 * Nein heißt warten. Und „nein" hat GENAU ZWEI Gestalten — das ist wichtig, weil
 * die zweite beim ersten Hinsehen wie etwas anderes aussieht:
 *
 *   1. **Der Server ENTSCHEIDET.** `anfrage_bestaetigen()` prüft mit
 *      `select … for update`, ob noch ein Platz frei ist; `gruppe_verlassen()`
 *      bestimmt über `nachfolgerId()`, wer die Gruppe erbt. Die App kennt die
 *      Antwort nicht, sie kann sie nur nachbauen — siehe Möglichkeit B.
 *
 *   2. **Der Server VERGIBT eine ID, zu der der Bildschirm gleich hinspringt.**
 *      `postErstellen` gibt seine ID an `router.replace('/post/' + id)` weiter,
 *      `direktChatOeffnen` an den Chat-Screen. Eine erfundene ID (`p_neu1`) würde
 *      dort auf einen Post führen, den es auf dem Server nicht gibt — und der
 *      Bildschirm sagte „Diesen Post gibt es nicht mehr", eine halbe Sekunde
 *      nachdem man ihn geschrieben hat.
 *
 * **Wer eine neue Schreib-Aktion baut, beantwortet die Frage — er sucht sich
 * nicht aus, ob er wartet.** `EINORDNUNG` ist ein `Record` über alle Aktionen:
 * Eine neue Aktion ohne Eintrag ist ein Typfehler, kein stiller Vorgabewert.
 * Dieselbe Technik wie `IconName` (Phase 14) und der erschöpfende `switch` in
 * `torwaechterZeigt()` (harte Regel 77).
 */

/**
 * Jede Stelle, an der die App etwas schreibt — 22 Stück.
 *
 * Die drei rein örtlichen Sachen stehen NICHT dabei: `wegwischen`,
 * `wischRueckgaengig` und der Standort. Die gehen nie an einen Server (bei
 * `weggewischt` ist das Ians Regel `'sitzung'` aus `posts/wisch.ts`, beim Standort
 * die Zusage aus harter Regel 68), also gibt es dort auch nichts zu warten.
 */
export type SchreibAktion =
  // ── Posts ──
  | 'postErstellen'
  // ── Anfragen an einen Post ──
  | 'anfrageSenden'
  | 'anfrageZuruecknehmen'
  | 'anfrageBestaetigen'
  | 'anfrageAblehnen'
  // ── Chat ──
  | 'nachrichtSenden'
  | 'direktChatOeffnen'
  // ── Gruppen ──
  | 'gruppeErstellen'
  | 'beitrittAnfragen'
  | 'beitrittZuruecknehmen'
  | 'beitrittBestaetigen'
  | 'beitrittAblehnen'
  | 'gruppeVerlassen'
  | 'einladen'
  | 'einladungAnnehmen'
  | 'einladungAblehnen'
  // ── Social ──
  | 'folgen'
  | 'entfolgen'
  | 'bezirkSetzen'
  // ── Sicherheit ──
  | 'blockieren'
  | 'entblocken'
  | 'melden';

/**
 * Ians 46. Entscheidung. Nicht ohne Rückfrage ändern.
 *
 * `'sofort'` und `'warten'` sind die beiden verworfenen Möglichkeiten (B und C im
 * Kopf) und stehen hier als Wert, damit man sie im Betrieb einmal ausprobieren
 * kann, ohne 22 Stellen anzufassen — **nicht als Einladung.**
 */
export const SCHREIB_ANTWORT: 'gemischt' | 'sofort' | 'warten' = 'gemischt';

/**
 * Der Trennstrich, Aktion für Aktion.
 *
 * Neben jedem `'warten'` steht, WELCHE der zwei Gestalten aus dem Kopf zutrifft —
 * wer das nicht hinschreiben kann, hat wahrscheinlich keinen Grund zu warten.
 */
const EINORDNUNG: Record<SchreibAktion, 'sofort' | 'warten'> = {
  // ── warten, weil der Server ENTSCHEIDET ────────────────────────────────────
  /** Ist noch ein Platz frei? Das weiß nur `select … for update` (0004). */
  anfrageBestaetigen: 'warten',
  /** Ians Entscheidung 7 — löst Chat, Zusage und Platz in EINER Transaktion auf. */
  blockieren: 'warten',
  /** `nachfolgerId()`: Wer erbt die Gruppe? Das bestimmt die Funktion in 0004. */
  gruppeVerlassen: 'warten',
  /** Legt die Mitgliedschaft an — `group_members` hat kein Insert-Recht (Regel 55). */
  beitrittBestaetigen: 'warten',
  /** Dasselbe von der anderen Seite. */
  einladungAnnehmen: 'warten',

  // ── warten, weil der Server eine ID VERGIBT, zu der gesprungen wird ────────
  /** `router.replace('/post/' + id)` — eine erfundene ID führt ins Leere. */
  postErstellen: 'warten',
  /** Der Screen springt auf `/gruppe/[id]`. */
  gruppeErstellen: 'warten',
  /** Gibt die Faden-ID heraus, der Chat-Screen öffnet sie. */
  direktChatOeffnen: 'warten',

  // ── sofort: die App kennt das Ergebnis vollständig ─────────────────────────
  /** Eine Zeile mehr in `join_requests`. Die ID braucht niemand. */
  anfrageSenden: 'sofort',
  /** Eine Zeile weniger (`anfragen_zuruecknehmen`, delete). */
  anfrageZuruecknehmen: 'sofort',
  /** `status = 'declined'`. Kein Platz, kein Chat — nichts zu entscheiden. */
  anfrageAblehnen: 'sofort',
  /** Der Grund, warum C verworfen ist: Im Chat steht der Text sofort. */
  nachrichtSenden: 'sofort',
  /** Eine Zeile in `group_requests`. */
  beitrittAnfragen: 'sofort',
  /** Siehe `senden.ts` — hier fehlte am Server bis 20.5-b der Weg. */
  beitrittZuruecknehmen: 'sofort',
  /** `status = 'declined'`, vom Gründer. */
  beitrittAblehnen: 'sofort',
  /** Eine Zeile in `group_invites`. */
  einladen: 'sofort',
  /** `status = 'declined'`, von der eingeladenen Person. */
  einladungAblehnen: 'sofort',
  /** Eine Kante an. Beide Seiten kennt die App (harte Regel 8). */
  folgen: 'sofort',
  /** Eine Kante aus. */
  entfolgen: 'sofort',
  /** Ein Feld am eigenen Profil. */
  bezirkSetzen: 'sofort',
  /** Eine Zeile weniger in `blocks`. Das Auflösen war beim BLOCKIEREN, nicht hier. */
  entblocken: 'sofort',
  /** Eine Zeile in `reports`. Die ID braucht niemand. */
  melden: 'sofort',
};

/**
 * Wartet der Bildschirm bei dieser Aktion auf den Server?
 *
 * Der Zweig über `SCHREIB_ANTWORT` ist die Stelle, an der die zwei verworfenen
 * Möglichkeiten wirklich wirken — sonst wären sie eine Behauptung im Kommentar.
 */
export function wartetAufServer(aktion: SchreibAktion): boolean {
  if (SCHREIB_ANTWORT === 'sofort') return false;
  if (SCHREIB_ANTWORT === 'warten') return true;
  return EINORDNUNG[aktion] === 'warten';
}

/**
 * Was auf einem wartenden Knopf steht.
 *
 * EIN Wort und kein Kreisel: Ein Ladekringel sagt „da passiert etwas", ein Wort
 * sagt „ich habe dich gehört". Und er steht hier statt in `SsButton`, damit ihn
 * keine vierzehn Screens einzeln formulieren — dieselbe Überlegung wie bei
 * `VERWAIST_TEXT` in `chat/direkt.ts`.
 *
 * **Die Beschriftung wechselt, die BREITE soll es möglichst nicht** — ein Knopf,
 * der beim Drücken schmaler wird, sieht aus, als wäre etwas kaputtgegangen.
 * Deshalb ein kurzes Wort und kein Satz.
 */
export const WARTE_TEXT = 'Moment …';

/**
 * Ein Schreibvorgang, der nicht durchkam.
 *
 * Trägt die AKTION und den `code`, nicht nur einen Satz — aus demselben Grund wie
 * `LadeFehler` in `laden.ts` (harte Regel 57): `42501` (die Policy hat abgewiesen)
 * und `23505` (die Zeile gibt es schon) sind zwei völlig verschiedene Lagen, und
 * nur eine davon ist ein Programmfehler.
 */
export class SchreibFehler extends Error {
  constructor(
    readonly aktion: SchreibAktion,
    readonly code: string,
    grund: string,
  ) {
    super(`Schreiben "${aktion}" ging nicht durch (${code}): ${grund}`);
    this.name = 'SchreibFehler';
  }
}

/**
 * Was der Mensch davor liest, wenn es nicht durchging.
 *
 * ── Warum das NICHT dieselbe Funktion wie `ladeFehlerFolgen()` ist ───────────
 * Weil die Lage eine andere ist. Beim Laden ist der Bildschirm leer und die Frage
 * lautet „kommen die Daten?". Beim Schreiben steht alles da, und die Frage lautet
 * **„ist das, was ich gerade getan habe, wirklich passiert?"** — darauf ist
 * „Nochmal versuchen" die Antwort und nicht „Prüf dein Internet".
 *
 * Auch hier gilt der Fund vom 2026-09-03: kein Tabellenname, kein Fehlercode, kein
 * Pfad auf den Bildschirm. Der `code` steht im `SchreibFehler` und gehört in die
 * Konsole.
 */
export function schreibFehlerFolgen(fehler: SchreibFehler): {
  text: string;
  knopf: string;
  /** `true`, wenn ein neuer Versuch die Lage gar nicht ändern kann. */
  anmeldenNoetig: boolean;
} {
  // ── Die Sätze sind KURZ, und das ist seit Ians Entscheidung 48 kein Geschmack ─
  // Solange die Leiste sich über den Bildschirm legte, kostete eine Zeile mehr
  // nichts. Seit sie den Inhalt SCHIEBT, kostet jede Zeile echten Platz — und
  // gemessen am 2026-09-12: „Das hat gerade nicht geklappt. Das liegt meistens am
  // Netz." plus der Knopf „Nochmal versuchen" ergaben auf 390 px **vier Zeilen**,
  // die den halben Bildschirm nach unten schoben. Harte Regel 63 gilt für eine
  // Leiste schärfer als für einen Vollbild-Kasten: Der Kasten IST der Bildschirm,
  // die Leiste steht vor dem, weswegen man gekommen ist.
  if (fehler.code === '42501' || fehler.code === 'PGRST301') {
    return {
      text: 'Du bist nicht mehr angemeldet.',
      knopf: 'Anmelden',
      anmeldenNoetig: true,
    };
  }
  // `23505` heißt: die Zeile gibt es schon. Das ist fast immer ein Doppelklick,
  // also kein Fehler, sondern das Ergebnis — dieselbe Unterscheidung wie in
  // `profilAnlegen()` (harte Regel 79). Der Aufrufer behandelt ihn vorher; steht
  // er trotzdem hier, ist „nochmal" der falsche Rat.
  if (fehler.code === '23505') {
    return {
      text: 'Das hat schon geklappt.',
      knopf: 'Alles klar',
      anmeldenNoetig: false,
    };
  }
  return {
    text: 'Das hat nicht geklappt — meistens liegt es am Netz.',
    knopf: 'Nochmal',
    anmeldenNoetig: false,
  };
}
