/**
 * Der Icon-Satz — Phase 14.
 *
 * ── Warum es diese Datei gibt ────────────────────────────────────────────────
 * Die drei Mitgründer haben den Prototyp am 2026-09-02 durchgeklickt. Christophs
 * Urteil war: „schaut noch bisschen nach AI aus, wegen den Emojis". Gemessen waren
 * es rund hundert Stück in fünfundzwanzig Dateien. Ians Entscheidung (PLAN.md,
 * Abschnitt 6, Punkt 11): ALLE raus, Ersatz sind gezeichnete Pfade.
 *
 * ── Wie ein Icon hier aussieht ───────────────────────────────────────────────
 * Alles liegt auf demselben Raster: viewBox 24×24, Inhalt zwischen 3 und 21,
 * eine Strichstärke (`STRICH`), runde Enden. Genau das macht aus Einzelzeichnungen
 * einen Satz — nicht die Motive, sondern das gemeinsame Maß.
 *
 * `striche` werden mit `stroke` gezeichnet, `flaechen` mit `fill`. Zwei Listen und
 * nicht ein Flag pro Pfad, weil fast jedes Icon reiner Strich ist; die Fläche ist
 * die Ausnahme (der Punkt in der Zielscheibe, die Kleckse auf der Palette).
 *
 * ── Die Falle, die hier eingebaut vermieden ist ──────────────────────────────
 * `IconName` ist ein Union-Typ über die Schlüssel dieses Objekts, kein `string`.
 * Beim Bezirk (2026-09-02) war die Lehre, dass `string | null` in JSX gar nichts
 * erzwingt. Ein Union-Typ dagegen ist eine Whitelist: Wer `icon="🚩"` stehen lässt
 * oder sich bei einem Namen vertippt, bekommt einen Typfehler statt ein leeres Loch
 * im Screen. Deshalb steht der Satz in EINER Datei und nicht verteilt.
 */

/** Strichstärke im 24er-Raster. Ein Wert für alle — sonst zerfällt der Satz. */
export const STRICH = 1.9;

/**
 * Ein Kreis als Pfad statt als `<circle>`.
 *
 * Warum umgerechnet: Der Renderer (`components/ui/SsIcon`) kennt dann nur EINE Form.
 * Zwei Formen hießen zwei Codewege, und der zweite wird beim nächsten Icon vergessen.
 */
function kreis(cx: number, cy: number, r: number): string {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
}

/** Ein Punkt — für Kleckse und Zeichensetzung. Immer eine Fläche, nie ein Strich. */
function punkt(cx: number, cy: number, r = 1.15): string {
  return kreis(cx, cy, r);
}

export interface IconForm {
  striche: string[];
  flaechen?: string[];
}

/**
 * Die Motive.
 *
 * Reihenfolge: erst die sechs Kategorien (sie tragen die Farbe der App), dann die
 * Navigation, dann Aktionen und Zustände, zuletzt die leeren Zustände.
 */
export const ICONS = {
  // ── Die sechs Kategorien ───────────────────────────────────────────────────
  // Sie ersetzen 🏃 ☕ 📚 🎬 🌳 🎨. Achtung: Diese sechs sind keine Verzierung,
  // sie sind das Erkennungszeichen der Kategorie (PLAN.md, Phase 14). Wenn eines
  // davon unklar wird, ist die Kategorie unklar — nicht bloß hässlich.

  /**
   * Laufende Figur — Sport.
   *
   * Vier Striche und ein Kopf, nicht fünf: Der hintere Arm war anfangs dabei und
   * hat die Figur bei 15 Pixeln — der Größe in der Kategorie-Pille — zu einem
   * Gekritzel gemacht. Was eine Laufhaltung ausmacht, sind das gebeugte vordere
   * Bein und der nach hinten gestreckte Fuß; der zweite Arm trägt nichts bei und
   * kostet zwei Kreuzungen auf engstem Raum.
   */
  laufen: {
    striche: [
      kreis(15.9, 5.4, 2.1),
      'M13.4 9.8 12.2 14.1l2.5 3.1-1.1 3.7',
      'M12.2 14.1 8.3 15.6l-.9 4.6',
      'M13.4 9.8l4.2 1.9 2.1-2',
    ],
  },

  /** Tasse mit Dampf — Essen und Kaffee. */
  tasse: {
    striche: [
      'M4.6 8.6h11.8v5.5a4.7 4.7 0 0 1-4.7 4.7H9.3a4.7 4.7 0 0 1-4.7-4.7z',
      'M16.4 10h1.7a2.7 2.7 0 0 1 0 5.4h-1.7',
      'M7.4 3.4v2.2M10.5 3.4v2.2M13.6 3.4v2.2',
      'M3.6 21h14.2',
    ],
  },

  /** Aufgeschlagenes Buch — Lernen. */
  buch: {
    striche: [
      'M12 7.4C10.2 5.7 7.5 5.1 4.4 5.3v12.4c3.1-.2 5.8.4 7.6 2.1',
      'M12 7.4c1.8-1.7 4.5-2.3 7.6-2.1v12.4c-3.1-.2-5.8.4-7.6 2.1',
      'M12 7.4v12.4',
    ],
  },

  /**
   * Eintrittskarte — Kultur (Kino, Konzert, Museum, Fortgehen).
   *
   * Erster Versuch war eine Filmklappe. Am Gerät sah sie aus wie eine Handtasche:
   * Eine Klappe braucht im 24er-Raster vier schräge Balken über einem Kasten, und
   * bei 15 Pixeln in der Kategorie-Pille verschmelzen die zu einem Fleck. Die Karte
   * hat nur eine Kontur und drei Striche — und sie deckt alle vier Beispiele ab
   * statt nur das Kino.
   */
  ticket: {
    striche: [
      'M4.4 7.4h15.2v2.8a2 2 0 0 0 0 3.6v2.8H4.4v-2.8a2 2 0 0 0 0-3.6z',
      'M12 8.8v1.4M12 11.3v1.4M12 13.8v1.4',
    ],
  },

  /** Nadelbaum — Draußen. */
  baum: {
    striche: ['M12 3.4 6.4 11.4h3.1L5.3 17h13.4l-4.2-5.6h3.1z', 'M12 17v3.8'],
  },

  /** Malerpalette — Kreativ. Die vier Kleckse sind Flächen, sonst sind es Ringe. */
  pinsel: {
    striche: [
      'M12 3.4a8.7 8.7 0 0 0 0 17.4c1.3 0 2.4-1.1 2.4-2.4 0-.6-.2-1.2-.6-1.6a2.4 2.4 0 0 1 1.8-4h2.3a4.7 4.7 0 0 0 4.7-4.7c0-2.6-4.7-4.7-10.6-4.7z',
    ],
    flaechen: [punkt(7.4, 8.6), punkt(11.4, 6.9), punkt(15.6, 8.4), punkt(6.8, 13.4)],
  },

  // ── Navigation: die vier Tabs ──────────────────────────────────────────────
  // Ersetzen 🏠 🙋 💬 👤. Neu und nur mit Pfaden möglich: Sie nehmen die Farbe an,
  // also unterscheidet ab jetzt die FARBE aktiv von inaktiv, nicht mehr die
  // Deckkraft (der alte Behelf in `(tabs)/_layout.tsx`, weil Emoji keine Farbe
  // annehmen).

  /** Haus — Start. */
  haus: { striche: ['M3.6 11.4 12 4.3l8.4 7.1', 'M6.2 9.6v10h11.6v-10'] },

  /**
   * Offene, erhobene Hand — Anfragen.
   *
   * Dasselbe Icon steht auf dem Knopf „Bin dabei". Das ist Absicht und keine
   * Sparsamkeit: Vorher waren es 🙋 und 🙌, zwei Bilder für eine einzige Geste.
   * Die Hand heben heißt an beiden Stellen dasselbe — ich mache mit.
   */
  hand: {
    striche: [
      'M6.2 13.6v-3.4a1.5 1.5 0 0 1 3 0v1.8',
      'M9.2 12.2V6.1a1.5 1.5 0 0 1 3 0v5.5',
      'M12.2 11.7V5a1.5 1.5 0 0 1 3 0v6.6',
      'M15.2 12.2V7.6a1.5 1.5 0 0 1 3 0V15',
      'M6.2 13.6v1.5a5.9 5.9 0 0 0 5.9 5.9h.3a5.9 5.9 0 0 0 5.8-5.9',
    ],
  },

  /** Sprechblase — Chats. */
  sprechblase: {
    striche: [
      'M20.6 12.3c0 4.1-3.8 7.4-8.6 7.4-1 0-1.9-.1-2.8-.4L4 21.2l1.5-3.8c-1.4-1.4-2.1-3.1-2.1-5.1C3.4 8.2 7.2 5 12 5s8.6 3.2 8.6 7.3z',
    ],
  },

  /** Eine Person — Profil. */
  person: {
    striche: [kreis(12, 8, 3.9), 'M4.9 20.5v-1.3a5.6 5.6 0 0 1 5.6-5.6h3a5.6 5.6 0 0 1 5.6 5.6v1.3'],
  },

  /** Zwei Personen — Plätze, Follower. */
  personen: {
    striche: [
      kreis(9.2, 7.8, 3.5),
      'M3 20.4v-1.3a5.2 5.2 0 0 1 5.2-5.2h2a5.2 5.2 0 0 1 5.2 5.2v1.3',
      'M15.6 4.5a3.5 3.5 0 0 1 0 6.6',
      'M17 14.2a5.2 5.2 0 0 1 4 5v1.2',
    ],
  },

  // ── Aktionen ──────────────────────────────────────────────────────────────

  /** Stift — posten, schreiben. Ersetzt ✏️ und ✍️. */
  stift: {
    striche: ['M4.3 19.7l.9-3.9L15.8 5.2a2.4 2.4 0 0 1 3.4 3.4L8.2 19.2z', 'M14.1 6.9l3.4 3.4'],
  },

  /**
   * Schieberegler — Einstellungen. Ersetzt ⚙️.
   *
   * Bewusst kein Zahnrad: Ein Zahnrad im 24er-Raster braucht acht Zähne, die bei
   * 20 Pixeln Tab-Größe zu einem grauen Kranz verschmelzen. Regler bleiben bei
   * jeder Größe drei Zeilen — und sie zeigen, was der Screen tut.
   */
  regler: {
    striche: [
      'M3.6 6.9h6.2M14.2 6.9h6.2',
      'M3.6 12h1.8M9.8 12h10.6',
      'M3.6 17.1h8.8M16.8 17.1h3.6',
      kreis(12, 6.9, 2.3),
      kreis(7.6, 12, 2.3),
      kreis(14.6, 17.1, 2.3),
    ],
  },

  /** Wimpel — Treffpunkt und Melden. Ersetzt 🚩. */
  fahne: { striche: ['M5.6 21V3.4', 'M5.6 4.6h11.6l-2.3 3.9 2.3 3.9H5.6'] },

  /** Durchgestrichener Kreis — blockiert, geschlossen. Ersetzt 🚫. */
  verboten: { striche: [kreis(12, 12, 8.6), 'M5.9 5.9 18.1 18.1'] },

  /** Schloss — „nur Follower". Ersetzt 🔒. */
  schloss: {
    striche: [
      'M5.8 10.4h12.4a1.6 1.6 0 0 1 1.6 1.6v7.4a1.6 1.6 0 0 1-1.6 1.6H5.8a1.6 1.6 0 0 1-1.6-1.6V12a1.6 1.6 0 0 1 1.6-1.6z',
      'M8.1 10.4V7.5a3.9 3.9 0 0 1 7.8 0v2.9',
    ],
  },

  /** Papierkorb — löschen. Ersetzt 🗑️. */
  muell: {
    striche: [
      'M4.4 6.8h15.2',
      'M9.4 6.8V4.9a1.3 1.3 0 0 1 1.3-1.3h2.6a1.3 1.3 0 0 1 1.3 1.3v1.9',
      'M6.7 6.8l.9 12.2a1.7 1.7 0 0 0 1.7 1.6h5.4a1.7 1.7 0 0 0 1.7-1.6l.9-12.2',
      'M10.3 10.6v6.3M13.7 10.6v6.3',
    ],
  },

  /** Blatt Papier — Nutzungsbedingungen. Ersetzt 📄. */
  blatt: {
    striche: [
      'M14 3.4H7.2a2 2 0 0 0-2 2v13.2a2 2 0 0 0 2 2h9.6a2 2 0 0 0 2-2V8.4z',
      'M14 3.4v5h4.8',
      'M8.6 13h6.8M8.6 16.6h6.8',
    ],
  },

  /** Menü, die drei Striche — „Mehr einstellen". Ersetzt ☰, Ians Wahl vom 2026-09-02. */
  menu: { striche: ['M4.4 7.4h15.2', 'M4.4 12h15.2', 'M4.4 16.6h15.2'] },

  /** Plus. */
  plus: { striche: ['M12 4.8v14.4', 'M4.8 12h14.4'] },

  // ── Richtungen ────────────────────────────────────────────────────────────
  // Vorher standen hier Schriftzeichen: › ▾ ▸ ← →. Die sind keine Emojis und waren
  // deshalb nicht Teil von Christophs Kritik — aber sie sind in der Systemschrift
  // anders dick als jeder gezeichnete Strich daneben, und je nach Gerät anders
  // breit. In einem Satz, dessen ganzer Sinn EINE Strichstärke ist, fällt das auf.

  /** Chevron nach rechts — „hier geht es weiter". Ersetzt ›. */
  chevronRechts: { striche: ['M9.6 5.4 16.2 12l-6.6 6.6'] },

  /** Chevron nach unten — aufgeklappt. Ersetzt ▾ (zu ▸ gehört `chevronRechts`). */
  chevronUnten: { striche: ['M5.4 9.6 12 16.2l6.6-6.6'] },

  /** Pfeil nach links — zurück. Ersetzt ← in `SsBack`. */
  pfeilLinks: { striche: ['M19.2 12H5.2', 'M11.4 5.8 5.2 12l6.2 6.2'] },

  /** Pfeil nach rechts — die Wischrichtung auf der Anleitungskarte. */
  pfeilRechts: { striche: ['M4.8 12h14', 'M12.6 5.8 18.8 12l-6.2 6.2'] },

  /** Kreuz — schließen, wegwerfen. Ersetzt ✕ und 👋 („Weg" im Wischstapel). */
  kreuz: { striche: ['M6 6l12 12', 'M18 6L6 18'] },

  // ── Zustände: was aus einer Anfrage geworden ist ──────────────────────────

  /** Haken — angefragt, du folgst. Ersetzt ✓. */
  haken: { striche: ['M4.8 12.6 9.6 17.4 19.2 6.6'] },

  /** Haken im Kreis — geschickt, erledigt. Ersetzt ✅. */
  hakenKreis: { striche: [kreis(12, 12, 8.6), 'M8.1 12.2l2.9 2.9 5-5.9'] },

  /** Kreuz im Kreis — abgesagt. Ersetzt 🙁 („Diesmal nicht"). */
  kreuzKreis: { striche: [kreis(12, 12, 8.6), 'M9.2 9.2l5.6 5.6', 'M14.8 9.2l-5.6 5.6'] },

  /** Daumen hoch — verstanden, alles klar. Ersetzt 👍. */
  daumen: {
    striche: [
      'M7.4 20.4v-9.7h1.9l3.4-6.2a2 2 0 0 1 2.9 2.4l-1.1 3.8h4.1a1.9 1.9 0 0 1 1.85 2.35l-1.2 5.1a2.4 2.4 0 0 1-2.33 1.85z',
      'M3.6 10.7h3.8v9.7H3.6z',
    ],
  },

  /**
   * Funken — der Match-Moment und „du bist dabei". Ersetzt 🎉 und 🎊.
   *
   * Ein großer Funke und ein kleiner daneben. Warum nicht die Konfetti-Kanone:
   * Die Kanone erzählt „Party", der Funke erzählt „gerade eben passiert" — und
   * genau darum geht es an der Stelle.
   */
  funken: {
    striche: [
      'M10.4 3.6c.7 4.4 2.4 6.1 6.8 6.8-4.4.7-6.1 2.4-6.8 6.8-.7-4.4-2.4-6.1-6.8-6.8 4.4-.7 6.1-2.4 6.8-6.8z',
      'M17.8 14.4c.35 2.2 1.15 3 3.35 3.35-2.2.35-3 1.15-3.35 3.35-.35-2.2-1.15-3-3.35-3.35 2.2-.35 3-1.15 3.35-3.35z',
    ],
  },

  /**
   * Zwei überlappende Kreise — ihr zwei. Ersetzt 🤝.
   *
   * Ein gezeichneter Handschlag braucht auf 24 Pixeln vier Finger und zwei
   * Ärmel und wird zum Knäuel. Zwei Kreise, die sich überschneiden, sagen
   * dasselbe und bleiben bis in die Tab-Größe hinunter lesbar.
   */
  treffen: { striche: [kreis(9.2, 12, 5.4), kreis(14.8, 12, 5.4)] },

  // ── Angaben am Post ───────────────────────────────────────────────────────

  /** Uhr — wann. Ersetzt 🕒. */
  uhr: { striche: [kreis(12, 12, 8.6), 'M12 6.9V12l3.4 2'] },

  /** Ortsnadel — wo. Ersetzt 📍. */
  pin: {
    striche: ['M12 21.2s7-5.7 7-11.2a7 7 0 1 0-14 0c0 5.5 7 11.2 7 11.2z', kreis(12, 10, 2.6)],
  },

  /** Zielscheibe — Können. Ersetzt 🎯. */
  ziel: { striche: [kreis(12, 12, 8.6), kreis(12, 12, 4.8)], flaechen: [punkt(12, 12, 1.5)] },

  // ── Leere Zustände und Hinweise ───────────────────────────────────────────

  /** Lupe — nichts gefunden, suchen. Ersetzt 🔍. */
  lupe: { striche: [kreis(10.6, 10.6, 6.6), 'M15.3 15.3 20.6 20.6'] },

  /** Keimling — hier ist noch nichts, aber es könnte etwas werden. Ersetzt 🌱. */
  spross: {
    striche: [
      'M12 20.8v-7.6',
      'M12 13.2C12 9.1 9 6.3 4.8 6.3c-.4 4.1 2.8 6.9 7.2 6.9z',
      'M12 13.2c0-3.5 2.5-6 6.1-6 .3 3.5-2.3 6-6.1 6z',
    ],
  },

  /** Auge — noch nichts zu sehen. Ersetzt 👀. */
  auge: {
    striche: ['M2.6 12S6 5.8 12 5.8 21.4 12 21.4 12 18 18.2 12 18.2 2.6 12 2.6 12z', kreis(12, 12, 3)],
  },

  /** Fragezeichen im Kreis — gibt es nicht. Ersetzt 🤷 und 🙃. */
  frage: {
    striche: [kreis(12, 12, 8.6), 'M9.5 9.4a2.6 2.6 0 0 1 5.05.87c0 1.73-2.55 2.6-2.55 2.6v1.03'],
    flaechen: [punkt(12, 17.2, 1.05)],
  },

  /** Warndreieck — der fehlende Rechtstext. Ersetzt ⚠️. */
  warnung: {
    striche: [
      'M10.7 4.9a1.5 1.5 0 0 1 2.6 0l7.9 13.8a1.5 1.5 0 0 1-1.3 2.25H4.1a1.5 1.5 0 0 1-1.3-2.25z',
      'M12 9.8v4.5',
    ],
    flaechen: [punkt(12, 17.6, 1.05)],
  },

  /** Erlenmeyerkolben — „das ist ein Prototyp". Ersetzt 🧪. */
  kolben: {
    striche: [
      'M9.4 3.6v6L4.3 18a2 2 0 0 0 1.7 3h12a2 2 0 0 0 1.7-3l-5.1-8.4v-6',
      'M8 3.6h8',
      'M6.6 14.6h10.8',
    ],
  },

  /** Drei Ziegel — die Werkstatt. Ersetzt 🧱. */
  bausteine: {
    striche: ['M3 4.4h8v5.6H3z', 'M13 4.4h8v5.6h-8z', 'M8 13.6h8v5.6H8z'],
  },
} as const satisfies Record<string, IconForm>;

/**
 * Die erlaubten Namen — eine Whitelist, kein `string`.
 *
 * Das ist der Grund, warum die Umstellung von Phase 14 überhaupt zu Ende gebracht
 * werden konnte: `SsButton.icon` hat vorher `string` genommen, also war jedes
 * vergessene Emoji unsichtbar. Mit diesem Typ zeigt `npx tsc --noEmit` jede Stelle.
 */
export type IconName = keyof typeof ICONS;
