import type { ReactNode } from 'react';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DIE GEMEINSAME SCHNITTSTELLE DER KARTENZEICHNER (Phase 19d)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Seit Ians Entscheidung 35 gibt es mehr als einen Zeichner: die gezeichnete Karte
 * aus 19b (`SsWienKarte`, Web und Rückfall) und die echte Apple-Karte auf iOS
 * (`SsAppleKarte`). Ein dritter kommt in 19d-2 dazu (MapKit JS im Browser).
 *
 * ── Warum diese Datei existiert und die Typen nicht bei einem Zeichner stehen ──
 * Es gibt drei Zeichner und **genau eine** Bedeutung. Stünde die Schnittstelle bei
 * einem von ihnen, wäre dieser der heimliche Maßstab — und der nächste Zeichner
 * bekäme still dessen Eigenheiten mitvererbt. Dieselbe Überlegung wie bei
 * `theme/icons.ts` gegen `SsIcon`: Was alle brauchen, gehört keinem.
 *
 * ── Was OBERHALB der Zeichner bleibt, egal wer zeichnet ───────────────────────
 *   `features/posts/karte.ts`   Tönungsstufen, Grenzen, `BLASE_MAX`, Lizenzzeilen
 *   `data/wien-bezirke.ts`      die Flächen selbst
 *   `lib/karte-geo.ts`          wo eine Fläche auf der ERDE liegt
 *   `KartenBlase`               sie kennt keine Karte, nur einen Anker
 *   die Auswahl                 sie IST der Bezirksfilter (harte Regel 50)
 *
 * Ein Zeichner verantwortet allein: den Hintergrund, das Zeichnen der Flächen, und
 * wie aus einer Geste ein „hier wurde getippt" wird.
 */

/**
 * Wo ein Bezirk gerade auf dem Schirm liegt — alles in Bildpunkten, relativ zur
 * linken oberen Ecke der Kartenfläche.
 *
 * Gebraucht wird das seit Phase 19c von der Blase, die über dem gewählten Bezirk
 * schwebt. **Sie hängt am Bezirk und nicht am Finger** (Ians Rückmeldung sagte „über
 * dem Klick", gemeint ist aber der Bezirk): Der Anker sitzt auf dem
 * Beschriftungspunkt aus `wien-bezirke.ts`, dem Punkt mit dem größten Abstand zum
 * Rand. Das ist zugleich die stabile Wahl — zweimal denselben Bezirk antippen ergibt
 * zweimal dieselbe Stelle, auch wenn man einmal die Mitte und einmal den Zipfel trifft.
 *
 * **Dieser Typ ist die eine Sache, die ein neuer Zeichner beantworten muss.** Solange
 * er einen `KartenAnker` liefert, ändert sich an `KartenBlase` kein Zeichen — die
 * gezeichnete Karte rechnet ihn aus ihrem eigenen Schiebe- und Zoom-Zustand, MapKit
 * beantwortet dieselbe Frage mit `pointForCoordinate`.
 */
export interface KartenAnker {
  /** Der Punkt, auf den die Spitze zeigt. */
  x: number;
  y: number;
  /** Wie viel Platz über bzw. unter dem Anker frei ist, bis die Karte zu Ende ist. */
  platzOben: number;
  platzUnten: number;
  /** Die Kartenfläche selbst — die Blase darf nicht breiter werden. */
  breite: number;
  hoehe: number;
}

/** Was jeder Kartenzeichner können muss. */
export interface SsKarteProps {
  /** Wie viele Posts je Bezirks-PLZ. Fehlt einer, ist er leer. */
  zaehlung: Readonly<Record<string, number>>;
  /** Welcher Bezirk ist gewählt — `null` heißt „ganz Wien". */
  gewaehlt: string | null;
  /** Ein Tipp auf eine Fläche. `null`, wenn jemand ins Umland tippt. */
  onWaehlen: (plz: string | null) => void;
  /**
   * Höchste Höhe in Bildpunkten. Ohne sie nimmt die Karte bei Handybreite 255 px
   * und lässt der Liste darunter auf einem 600-px-Schirm fast nichts — Ians
   * Entscheidung 30 sagt aber ausdrücklich „Posts erscheinen DARUNTER".
   */
  maxHoehe?: number;
  /**
   * Was über dem gewählten Bezirk schweben soll — seit Phase 19c die `KartenBlase`.
   *
   * ── Warum ein Slot und nicht der Inhalt selbst ───────────────────────────────
   * Dasselbe Muster wie `WischStapel.blatt` (harte Regel 36) und aus demselben
   * Grund: Der Screen weiß, WAS über der Karte stehen soll, aber nicht, WO der
   * Bezirk nach Schieben und Zoomen liegt — das weiß nur der Zeichner. Und die
   * Karte darf nichts von Posts wissen, sonst wäre sie kein `ui/`-Baustein mehr.
   *
   * ── Warum der Slot NICHT in der Kartenfläche hängt ───────────────────────────
   * Bei beiden Zeichnern aus demselben Grund, nur mit verschiedenen Namen: Die
   * gezeichnete Karte hat `overflow: hidden` und einen `PanResponder`, der jede
   * Berührung beansprucht; MapKit ist eine native Ansicht, die keine fremden Kinder
   * kennt. Der Slot liegt deshalb als GESCHWISTER darüber, deckungsgleich, mit
   * `pointerEvents: 'box-none'` im `style` (nie als Prop — ACTA-Falle).
   */
  blase?: (anker: KartenAnker) => ReactNode;
}
