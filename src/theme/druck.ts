import { StyleSheet } from 'react-native';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WAS BEIM DRÜCKEN PASSIERT — an EINER Stelle (Phase 20.10)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Bis Phase 20.10 gab es die Rückmeldung zweimal: `SsButton` rechnete sie aus
 * `DEPTH` und dem Umriss aus, und der runde „Posten"-Knopf im Feed rechnete
 * dieselbe Rechnung noch einmal nach — mit einem Kommentar daneben, der sagte
 * *„dieselbe Rechnung wie in `SsButton`, damit sich beide gleich anfühlen"*.
 *
 * **Genau dieser Kommentar ist der Grund für diese Datei.** Wo einer steht, ist die
 * Gleichheit eine Absichtserklärung und keine Tatsache: Sie hält genau so lange,
 * wie sich jemand daran erinnert. Beim nächsten Drehen an der Zahl hätte einer der
 * beiden Knöpfe sie mitbekommen und der andere nicht — und aufgefallen wäre das
 * niemandem, weil die zwei Knöpfe nebeneinander stehen und man Bewegung nicht
 * vergleicht, sondern nur spürt.
 *
 * Dieselbe Bauart und derselbe Grund wie bei `glas-typen.ts` (harte Regel 61) und
 * `karte-typen.ts` (52).
 *
 * ── Warum Schrumpfen und Opazität, und warum BEIDES ──────────────────────────
 * Das Schrumpfen ist das iOS-Idiom: So verhält sich jedes Symbol auf dem
 * Homescreen und jeder Schalter im Kontrollzentrum. Allein reicht es aber nicht —
 * auf einem `block`-Knopf über die volle Breite sind 4 % von rund 340 pt etwa 13 pt,
 * verteilt auf zwei Seiten, und das sieht man kaum. Die Opazität trägt den Rest und
 * wirkt bei jeder Knopfgröße gleich stark.
 *
 * ── Warum `transform` und nicht mehr Layout ─────────────────────────────────
 * Der alte Weg (`borderBottomWidth` weg, `marginTop` dazu) musste die Höhe von Hand
 * konstant halten, sonst wäre alles darunter im Screen geruckt. Ein `transform`
 * wirkt NACH dem Layout: Der Kasten belegt unverändert seinen Platz, es gibt nichts
 * auszugleichen. Deshalb ist die Rückmeldung jetzt reine Darstellung.
 *
 * ── Diese zwei Zahlen sind Gefühl und gehören Ian ────────────────────────────
 * Sie sind am Gerät zu beurteilen, nicht am Mac. Ab etwa 0,92 sieht ein breiter
 * Knopf aus, als kippe er weg, statt gedrückt zu werden — die Bewegung liest sich
 * dann als Animation und nicht mehr als Berührung. Wer dreht, dreht HIER, und es
 * gilt sofort für jeden Knopf der App.
 */
export const DRUCK = StyleSheet.create({
  gedrueckt: { transform: [{ scale: 0.96 }], opacity: 0.82 },
}).gedrueckt;
