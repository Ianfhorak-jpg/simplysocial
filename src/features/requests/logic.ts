import type { JoinRequest, Post } from '@/types/models';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS PASSIERT, WENN DIE PLÄTZE VOLL SIND?
 *  Entschieden von Ian am 2026-08-31 (PLAN.md, Abschnitt 6.3).
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Die Lage: Du hast „Für die Mathe-Schularbeit lernen" gepostet, drei Plätze, einer
 * schon vergeben. Sara, Tobias und Mira fragen an. Du bestätigst Sara und Tobias —
 * der Post ist voll. Und Mira?
 *
 * ── IANS ENTSCHEIDUNG: Warteliste, still ──────────────────────────────────────
 * Miras Anfrage bleibt einfach stehen (`pending`). Sie wird NICHT automatisch
 * abgesagt. Springt Tobias ab, wird ein Platz frei, und du kannst sie doch noch
 * bestätigen. Bis dahin passiert nichts — es gibt keinen eigenen Zustand
 * „Warteliste", keine zusätzliche Beschriftung, keine Extra-Gruppe im Screen.
 *
 * Was das im Alltag heißt: Absagen sind bei Verabredungen der Normalfall, gerade
 * spontanen. Wer schon gefragt hat, bleibt in der Schlange, statt für immer draußen
 * zu sein, weil er zehn Minuten später dran war.
 *
 * ── Der Haken, den Ian dabei kennt ────────────────────────────────────────────
 * Mira sieht weiterhin „Anfrage geschickt · Ian muss noch bestätigen" — auf etwas,
 * das meistens nie kommt. Und die Zahl am Anfragen-Tab zählt sie mit, obwohl du sie
 * gerade gar nicht bestätigen KANNST. Beides ist die bewusst in Kauf genommene
 * Kehrseite; der Screen mildert es, indem er am ausgegrauten Knopf dazuschreibt,
 * warum er nicht geht.
 *
 * ── Was NICHT gewählt wurde (als Gedächtnis, nicht als Einladung) ─────────────
 *   A) Automatisch absagen — alle übrigen Anfragen auf `declined`. Niemand wartet
 *      umsonst, aber für Mira läse es sich, als hättest DU abgesagt, obwohl du nur
 *      andere zuerst bestätigt hast. Und bei einem Absprung wäre sie schon weg.
 *   C) Warteliste mit eigener Beschriftung — „Auf der Warteliste" bei Mira, eine
 *      eigene Gruppe bei dir. Ehrlicher, aber ein Zustand mehr, den die App
 *      erklären muss.
 *
 * **Diese Regel ist Ians, nicht Claudes. Nicht ohne Rückfrage ändern.**
 * Falls sie sich im Betrieb beißt: ansprechen. Der Weg zu A oder C ist jeweils eine
 * Zeile in `uebrigeAnfragenBeiVollemPost` unten.
 */

/**
 * Ist der Post nach dieser Bestätigung voll?
 *
 * Entschieden und nie offen gewesen (PLAN.md, Phase 4): „Post schließt automatisch,
 * wenn alle Plätze voll sind". Offen war nur, was mit den ÜBRIGEN Anfragen passiert.
 */
export function istDannVoll(post: Post): boolean {
  return post.spotsFilled + 1 >= post.spotsTotal;
}

/**
 * Der Post, nachdem eine Anfrage bestätigt wurde: ein Platz weniger, und wenn es der
 * letzte war, schließt er sich selbst.
 *
 * Gibt ein NEUES Objekt zurück und verändert das alte nicht — `store.ts` erkennt
 * Änderungen am Vergleich der Referenz, ein `post.spotsFilled++` wäre für React
 * unsichtbar (siehe Kommentar in `store.ts`).
 */
export function postNachBestaetigung(post: Post): Post {
  const gefuellt = post.spotsFilled + 1;
  return {
    ...post,
    spotsFilled: gefuellt,
    // `past` bleibt `past`: was der Verfasser selbst geschlossen hat, macht eine
    // Bestätigung nicht wieder auf.
    status: post.status === 'past' ? 'past' : gefuellt >= post.spotsTotal ? 'full' : 'open',
  };
}

/**
 * Die übrigen offenen Anfragen, nachdem der letzte Platz vergeben wurde.
 *
 * Ians Regel (siehe Kopf dieser Datei): sie bleiben unverändert stehen. Deshalb gibt
 * die Funktion die Liste zurück, wie sie hereinkam.
 *
 * Sie ist trotzdem eine eigene Funktion und kein weggelassener Schritt — an genau
 * dieser Stelle im Ablauf fällt die Entscheidung, und sie soll auffindbar bleiben.
 * Wäre sie im Aufrufer verschwunden, müsste man beim nächsten Mal erst suchen, wo
 * „automatisch absagen" hinkäme.
 *
 * Für A) automatisch absagen stünde hier:
 *     return uebrige.map((a) => ({ ...a, status: 'declined' as const }));
 * Wichtig dabei: nie die übergebenen Objekte verändern, immer neue zurückgeben.
 */
export function uebrigeAnfragenBeiVollemPost(uebrige: JoinRequest[], _post: Post): JoinRequest[] {
  return uebrige;
}
