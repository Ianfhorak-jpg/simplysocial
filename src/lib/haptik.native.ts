import * as Haptics from 'expo-haptics';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DER TASTSINN — was die App spüren lässt · iOS-Zweig (Phase 20.12)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Der Web-Zweig daneben (`haptik.ts`) erklärt, **warum** es diese Datei gibt und
 * warum sie im Browser leer ist. Hier steht, **wie stark** sich was anfühlt — und
 * das ist die eigentliche Entscheidung.
 *
 * ── Warum die Anlässe benannt sind und nicht die Stärken ─────────────────────
 * Ein Screen ruft `haptik.schwelle()`, nicht `Haptics.impactAsync(Light)`. Sonst wäre
 * die Frage „wie stark fühlt sich ein Wisch an" dort entschieden — und beim nächsten
 * Ort, der wischt, noch einmal, vielleicht anders. Derselbe Gedanke wie bei
 * `theme/druck.ts` (harte Regel 113): **Ein Gefühl gehört dem Anlass, nicht dem
 * Bildschirm.**
 *
 * ── Warum die Stärken so gewählt sind ───────────────────────────────────────
 * Apple unterscheidet zwei Familien, und die Trennung ist nicht Geschmack:
 *
 *   `impactAsync`        „etwas ist gegen etwas gestoßen" — für BEWEGUNG, die man
 *                        selbst gemacht hat. Ein Wisch gehört hierher.
 *   `notificationAsync`  „das System sagt dir etwas" — ein Ergebnis, das ANKOMMT.
 *                        Der Match gehört hierher, weil er nicht aus der Bewegung
 *                        folgt, sondern aus der Antwort einer anderen Person.
 *
 * Deshalb ist `match` ein `Success` und kein `Heavy`: Es ist eine Nachricht, keine
 * Kollision. Und `schwelle` ist `Light` und nicht `Medium` — eine Geste, die man
 * zwanzigmal hintereinander macht, darf nicht zwanzigmal poltern. **Genau daran
 * scheitern Apps, die Haptik entdecken:** Sie setzen sie überall und gleich stark,
 * und nach zwei Minuten schaltet man sie im System ab.
 *
 * ── Wo BEWUSST nichts vibriert ──────────────────────────────────────────────
 * Beim Tippen auf eine Karte, beim Scrollen, beim Öffnen eines Screens, beim
 * Filtern. Haptik markiert die paar Momente, die wirklich zählen; wo alles
 * vibriert, bedeutet es nichts. Das ist dieselbe Überlegung wie bei harter Regel 63
 * (nur zeigen, was für die Entscheidung HIER nötig ist), angewandt auf den Tastsinn.
 *
 * ── Warum die Promises nicht abgewartet werden ──────────────────────────────
 * Jede dieser Funktionen gibt ein `Promise` zurück, und keines wird gebraucht: Ob
 * die Vibration angekommen ist, ändert nichts am Ablauf. Sie werden aber auch nicht
 * einfach fallen gelassen — ein abgelehntes `Promise` ohne `catch` ist genau die
 * Falle, die `lib/programmfehler.ts` beschreibt (*„ein Fehler, der KEIN SchreibFehler
 * ist, verschwindet spurlos"*). Deshalb hat jede ein `.catch(() => {})`, und das ist
 * hier ausdrücklich richtig: **Eine nicht ausgelöste Vibration ist kein Fehler, den
 * irgendjemand sehen müsste** — auf einem Gerät mit abgeschalteter System-Haptik
 * ist sie der Normalfall.
 */

/** Ein `Promise`, dessen Fehlschlag folgenlos ist — siehe Kopfkommentar. */
const egal = (p: Promise<void>) => void p.catch(() => {});

export const haptik = {
  /**
   * Eine Karte ist weit genug gezogen — ab hier ZÄHLT der Wisch.
   *
   * **Der wichtigste Anlass, und er liegt mitten in der Bewegung**, nicht am Ende:
   * Genau das macht Tinder aus. Man spürt, dass der Wisch reicht, **während der
   * Finger noch unten ist** — und kann noch zurück. Eine Vibration erst beim
   * Wegfliegen käme zu spät, um noch etwas zu ändern; sie wäre eine Meldung statt
   * einer Auskunft.
   *
   * `Light`, weil diese Geste die häufigste der App ist: Sie markiert den Moment,
   * sie begleitet nicht die Bewegung.
   */
  schwelle: () => egal(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),

  /**
   * Eine Karte ist zurückgeschnappt, weil nicht weit genug gezogen wurde.
   *
   * `Rigid` und nicht `Light`: Es ist ein Anstoßen an eine Grenze, kein Auslösen.
   * Der Unterschied ist genau die Auskunft, die man hier braucht — „nichts passiert,
   * zieh weiter" —, und er ist zu spüren, ohne hinzusehen.
   */
  zurueck: () => egal(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)),

  /**
   * Der Match-Moment: aus einer Anfrage ist eine Verabredung geworden.
   *
   * Das Lauteste, was die App kann — und sie kann es genau hier. `Success` ist
   * Apples dreiteiliges Muster (·—·), das sich deutlich von jedem `impact`
   * unterscheidet; es ist die einzige Stelle, an der ein Mensch etwas spürt, das er
   * nicht selbst ausgelöst hat.
   */
  match: () => egal(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),

  /** Etwas ist bestätigt worden — „Bin dabei" abgeschickt, Anfrage angenommen. */
  erfolg: () => egal(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),

  /** Etwas ist schiefgegangen. */
  fehler: () => egal(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
