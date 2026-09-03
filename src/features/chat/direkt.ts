import type { ChatThread, User } from '@/types/models';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WER DARF MIR SCHREIBEN — UND WANN ENTSTEHT EIN DIREKTCHAT?
 *  Die erste Frage hat Ian am 2026-09-02 entschieden (PLAN.md, Abschnitt 6.14):
 *  NUR BEI GEGENSEITIGEM FOLGEN. Die zweite kam beim Bauen auf und steht unten.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Leopold beim Durchklicken am 2026-09-02: *„mir ist aufgefallen, dass es nur für
 * Aktivitäten Chats gibt und man nicht einfach so Leuten schreiben kann."*
 *
 * Er hatte recht, und zwar nicht an der Oberfläche: `ChatThread.postId` war ein
 * PFLICHTFELD. Es gab keine Nachricht ohne Aktivität — nicht, weil der Knopf fehlte,
 * sondern weil das Datenmodell sie nicht darstellen konnte. Bis Phase 16 war das
 * Absicht und stand als Satz in `chat/logic.ts`: „ohne Zusage kein Kanal."
 *
 * Dieser Satz gilt weiter — er hat nur eine zweite Tür bekommen, und die ist enger.
 *
 * ── Die drei Möglichkeiten, wer schreiben darf ────────────────────────────────
 *
 *   A. JEDER DARF JEDEM  (wie Instagram)
 *      Auf jedem Profil steht ein Nachricht-Knopf. Am einfachsten zu verstehen und
 *      das, was alle kennen.
 *      Haken: Bei einer App mit 16-Jährigen ist das der Punkt, an dem Apple im Review
 *      nachfragt und Eltern abwinken. Ein offener Kanal zu Minderjährigen, ohne dass
 *      irgendetwas vorher passiert sein muss, ist genau das Risiko, gegen das die
 *      ganze Bestätigen-Mechanik der App gebaut ist.
 *
 *   B. NUR BEI GEGENSEITIGEM FOLGEN
 *      Der Knopf erscheint erst, wenn beide einander folgen. Folgen ist einseitig und
 *      kostenlos; GEGENSEITIG zu folgen ist eine Handlung von beiden Seiten — es ist
 *      die schwächste Form von „wir kennen uns", die die App überhaupt kennt.
 *      Haken: Man kann jemanden, dessen Post man gerade gesehen hat, nicht einfach
 *      etwas fragen. Der Weg dorthin führt über „Bin dabei" — also über den Kanal,
 *      den die App ohnehin dafür hat.
 *
 *   C. NUR, WER SCHON ZUSAMMEN WAR  (eine bestätigte Verabredung in der Vergangenheit)
 *      Am nächsten an der Idee der App: Aus einem Treffen wächst ein Kontakt.
 *      Haken: Es löst Leopolds Problem nur halb. Wer sich aus der Schule kennt und
 *      sich hier gegenseitig folgt, müsste erst eine Aktivität durchspielen, um
 *      „wann hast du frei?" fragen zu dürfen. Und es beißt sich mit Ians Regel aus
 *      `chat/lifecycle.ts`: Nach sieben Tagen ist der Chat weg — der Anspruch,
 *      schreiben zu dürfen, müsste dann anderswo weiterleben.
 *
 * ── Ians Entscheidung, 2026-09-02: B, GEGENSEITIGES FOLGEN. ──────────────────
 * Der Knopf „Nachricht" erscheint auf einem fremden Profil erst, wenn beide einander
 * folgen. Vorher steht dort, was fehlt — nicht nichts: Ein Knopf, der einfach nicht
 * da ist, sieht aus wie eine App, die die Funktion nicht hat (genau Leopolds
 * ursprünglicher Eindruck).
 *
 * **Den Haken kennt er:** Zwei Leute, die sich nur einseitig folgen, können einander
 * nicht schreiben — auch wenn beide es wollten. Die Auflösung ist ein Tipp auf
 * „Folgen", und die steht auf dem Profil als Satz dabei.
 *
 * Falls sich das im Betrieb als zu eng erweist, ist der Wechsel EIN Wort:
 * `SCHREIB_REGEL` unten. Alle drei Regeln stehen fertig da. **Nicht ohne Rückfrage.**
 */

/** Wer einen Direktchat beginnen darf. */
export type SchreibRegel = 'jeder' | 'gegenseitig' | 'schon-getroffen';

/**
 * Ians Entscheidung vom 2026-09-02 (siehe Kopf dieser Datei).
 *
 * Der Rest der App liest nur diesen Wert — `darfSchreiben()` führt ihn aus und
 * `schreibHuerdeText()` schreibt ihn auf.
 */
export const SCHREIB_REGEL: SchreibRegel = 'gegenseitig';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WANN ENTSTEHT EIN DIREKTCHAT?
 *  Die Frage kam beim Bauen von Phase 16 auf und stand in keinem Plan.
 *  Entschieden von Ian am 2026-09-02: ERST MIT DER ERSTEN NACHRICHT.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sie klingt nach einer Zeile Code und entscheidet, was die ANDERE Person sieht,
 * wenn ich auf „Nachricht" tippe und es mir dann überlege:
 *
 *   'beim-tippen'  — Der Chat entsteht beim Tippen auf den Knopf. Er steht sofort in
 *                    beiden Listen, leer. Ehrlich: Was man anfängt, ist da.
 *                    Haken: Wegen Ians eigener Regel aus `chat/sort.ts` („die stummen
 *                    immer ganz oben") landet ein versehentlicher Tipp bei der
 *                    anderen Person GANZ OBEN — und bleibt dort, bis jemand
 *                    hineinschreibt.
 *
 *   'beim-senden'  — Der Chat erscheint erst mit der ersten Nachricht. Vorher ist er
 *                    ein leerer Raum, den nur ich sehe; ein Fehlgriff hinterlässt bei
 *                    niemandem etwas.
 *                    Haken: Ein halb getippter Entwurf ist beim Zurückgehen weg, und
 *                    man sieht in der eigenen Liste nicht, mit wem man schon
 *                    angefangen hat.
 *
 * Warum das überhaupt eine Frage ist — und beim Aktivitäts-Chat keine wäre: Dort IST
 * der stumme Chat eine Nachricht, er heißt „ihr seid verabredet und keiner hat sich
 * gemeldet". Genau deshalb steht er nach Ians Regel oben. Ein stummer Direktchat
 * heißt gar nichts.
 *
 * ── Ians Entscheidung, 2026-09-02: 'beim-senden'. ────────────────────────────
 * Es ist das, was Leute von WhatsApp und Instagram kennen, und es macht den
 * Fehlgriff folgenlos.
 *
 * ── Wie es umgesetzt ist, und warum nicht anders ─────────────────────────────
 * NICHT dadurch, dass der Faden später angelegt wird — dann bräuchte der Chat-Screen
 * eine Adresse für etwas, das es noch nicht gibt, also eine zweite Route und ein
 * `generateStaticParams` dazu (harte Regel 11). Stattdessen entsteht der Faden sofort
 * und ein LEERER Direktchat steht in keiner Liste (`useChatListe` in `chat/hooks.ts`).
 * Von außen ist das Ergebnis dasselbe; von innen ist es eine Zeile statt einer Route.
 */
export type ChatEntstehung = 'beim-tippen' | 'beim-senden';

/** Ians Entscheidung vom 2026-09-02 (siehe Kopf darüber). **Nicht ohne Rückfrage.** */
export const ENTSTEHUNG: ChatEntstehung = 'beim-senden';

// ── Die Regel ausführen ──────────────────────────────────────────────────────

/**
 * Folgen sich die beiden gegenseitig?
 *
 * Gefragt wird über BEIDE Personen und nicht nur über meine `followingIds`: Eine
 * Folge-Beziehung steht zweimal im Modell (harte Regel 8), und wer nur eine Seite
 * liest, prüft in Wahrheit nur die halbe Bedingung. Hier fällt das besonders auf,
 * weil die beiden Richtungen ja gerade das sind, was unterschieden werden soll.
 */
export function folgenSichGegenseitig(a: User, b: User): boolean {
  return a.followingIds.includes(b.id) && b.followingIds.includes(a.id);
}

/**
 * Darf ich dieser Person schreiben? Ians Regel (siehe Kopf).
 *
 * `schonGetroffen` muss der Aufrufer beisteuern, weil nur er die Anfragen kennt —
 * diese Datei soll die REGEL enthalten und nicht den halben Datenzugriff. Unter der
 * geltenden Regel wird der Wert gar nicht gelesen; er steht da, damit ein Wechsel
 * auf `'schon-getroffen'` wirklich ein Wort ist und nicht ein Umbau.
 */
export function darfSchreiben(ich: User, andere: User, schonGetroffen: boolean): boolean {
  // Sich selbst schreiben gibt es nicht. Über die Oberfläche unmöglich (das eigene
  // Profil leitet um), über einen getippten Link nicht.
  if (ich.id === andere.id) return false;

  switch (SCHREIB_REGEL) {
    case 'jeder':
      return true;
    case 'gegenseitig':
      return folgenSichGegenseitig(ich, andere);
    case 'schon-getroffen':
      return schonGetroffen;
  }
}

/**
 * Was auf dem Profil steht, wenn man NICHT schreiben darf.
 *
 * Steht hier neben der Regel und nicht im Screen — dieselbe Überlegung wie bei
 * `blockFolgen()` in `safety/block.ts`: Ändert Ian die Regel, ändert sich der Satz
 * mit. Ein Screen, der eine andere Bedingung nennt, als die App prüft, schickt Leute
 * auf einen Weg, der nicht funktioniert.
 *
 * `undefined` heißt: Es gibt keine Hürde, der Knopf steht da.
 */
export function schreibHuerdeText(name: string): string | undefined {
  switch (SCHREIB_REGEL) {
    case 'jeder':
      return undefined;
    case 'gegenseitig':
      return `Schreiben könnt ihr euch, sobald ihr einander folgt. ${name} muss dir also auch folgen.`;
    case 'schon-getroffen':
      return `Schreiben könnt ihr euch, sobald ihr einmal gemeinsam bei einer Aktivität wart.`;
  }
}

// ── Was ein Direktchat IST ───────────────────────────────────────────────────

/**
 * Ist dieser Faden ein Direktchat — also einer ohne Aktivität?
 *
 * Eine eigene Funktion für einen `=== undefined`-Vergleich sieht nach Übertreibung
 * aus, ist aber genau das, was verhindert, dass die Frage an sechs Stellen sechsmal
 * leicht anders gestellt wird. `!t.postId` etwa wäre bei einem leeren String schon
 * eine andere Frage, und im Backend ist ein fehlendes Feld später `null` und nicht
 * `undefined`. Dann ist es EINE Zeile hier.
 */
export function istDirektChat(thread: ChatThread): boolean {
  return thread.postId === undefined;
}
