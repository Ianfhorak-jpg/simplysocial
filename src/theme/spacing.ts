import { Platform, type ViewStyle } from 'react-native';

/**
 * Abstände und Radien. Alles ist ein Vielfaches von 4 — dadurch rasten Abstände
 * automatisch aufeinander ein, ohne dass man je nachmisst.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

/**
 * ⛔️ **AUSSER DIENST seit Phase 20.10 (2026-09-14) — Ians Entscheidung 81.**
 *
 * Bis dahin war das die **Signatur der App** (PLAN.md, Abschnitt 3): der harte Rand
 * unten am Button. Beim Drücken wanderte der Button um genau diesen Betrag nach
 * unten und der Rand verschwand — er wirkte körperlich heruntergedrückt statt nur
 * eingefärbt.
 *
 * **Warum er weg ist:** Ians Urteil *„sieht immer noch wie Android aus"*, gefällt am
 * iPhone, auf dem Liquid Glass seit Phase 19e-2 läuft. Beim Nachmessen war nicht das
 * Glas zu schwach — dieser Rand war zu laut. Ein Knopf mit dicker farbiger
 * Unterkante ist das Erkennungszeichen von Duolingo und Material Design; iOS 26
 * macht das Gegenteil (randlose Kapseln, Tiefe durch Unschärfe und Bewegung). Was
 * beim Drücken stattdessen passiert, steht in `theme/druck.ts`.
 *
 * ── Warum die Zahl trotzdem noch dasteht ────────────────────────────────────
 * **Harte Regel 58: Eine neue Entscheidung überschreibt NIE still eine alte.** Ein
 * ersatzloses Löschen ließe PLAN.md, Abschnitt 3 von einer Signatur sprechen, die im
 * Code nicht mehr vorkommt, und niemand könnte mehr nachlesen, was gemeint war.
 * Wer den Rand je zurückholen will, findet hier den Wert und die Begründung.
 *
 * **Niemand liest sie mehr** — nachgesehen am 2026-09-14, kein `DEPTH` im Code
 * außerhalb dieser Datei. Wer sie wieder importiert, holt eine verworfene
 * Entscheidung zurück und soll das bewusst tun.
 */
export const DEPTH = 4;

/** Breite, ab der der Inhalt im Browser nicht weiter mitwächst — sonst zerreißt es das Handy-Layout am Desktop. */
export const MAX_CONTENT_WIDTH = 520;

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DIE APPLE-ECKE (Phase 20.10)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Ians Urteil am 2026-09-14: *„sieht immer noch wie Android aus"* — und zwar auf
 * dem iPhone, wo Liquid Glass seit Phase 19e-2 schon läuft. Die Antwort war also
 * nicht „mehr Glas", sondern: Es gibt ein halbes Dutzend Kleinigkeiten, die eine
 * Oberfläche als „nicht von hier" verraten, und diese ist die billigste davon.
 *
 * ── Was `continuous` tut ──────────────────────────────────────────────────────
 * Eine normale gerundete Ecke (`circular`) ist ein Viertelkreis: Die Gerade trifft
 * die Rundung mit einem Knick in der Krümmung. Apple zeichnet seit iOS 7 stattdessen
 * ein **Squircle** — die Krümmung wächst allmählich an, die Ecke wirkt weicher und
 * beginnt früher. Jedes App-Symbol auf dem Homescreen ist so gebaut, jede
 * Systemkarte, jedes Blatt. Android und der Browser können es nicht.
 *
 * Man kann es nicht benennen, wenn man es sieht, aber man sieht es. Deshalb steht
 * es hier an EINER Stelle und nicht vierzigmal im Code: Wer einen Radius setzt,
 * setzt die Kurve gleich mit, und niemand muss daran denken.
 *
 * ── Warum `Platform.select` und keine Plattform-Endung ────────────────────────
 * Anders als bei `SsGlas` (harte Regel 52) ist hier nichts zu ZEICHNEN — es ist ein
 * einzelner Stilwert, und auf Web ist er schlicht `undefined`. Eine zweite Datei
 * für ein `undefined` wäre Aufwand ohne Gegenwert. Dieselbe Bauart wie `fonts` in
 * `type.ts`, und aus demselben Grund.
 *
 * `undefined` und nicht `'circular'`: `react-native-web` kennt die Eigenschaft in
 * dieser Fassung gar nicht (nachgesehen in `node_modules`, keine Erwähnung). Ein
 * durchgereichtes `border-curve: circular` wäre totes CSS im Bündel.
 */
export const KURVE = Platform.select({ ios: 'continuous' as const, default: undefined });

/**
 * **Radius UND Kurve in einem — das ist ab jetzt der Weg, eine Ecke zu runden.**
 *
 * ── Warum nicht `borderRadius` plus `borderCurve` nebeneinander ──────────────
 * Weil das genau der Fehler wäre, vor dem `KURVE` oben warnt. Beim Nachmessen am
 * 2026-09-14 standen **24 Radien in 20 Dateien**. Die Kurve daneben zu schreiben
 * heißt: 24 Gelegenheiten, sie zu vergessen, und bei jeder neuen Fläche eine mehr.
 * Und vergessen sieht man ihr nicht an — eine einzelne Ecke im falschen Bogen
 * meldet sich nie, sie macht das Bild nur um eine Spur unruhiger.
 *
 * Als Spread ist es eine Sache, die man ganz nimmt oder gar nicht:
 *
 * ```ts
 * karte: { ...ecke.lg, padding: spacing.lg, backgroundColor: colors.surface },
 * ```
 *
 * Dieselbe Bauart wie `DRUCK` in `druck.ts` (eine Bedeutung, ein Ort) — nur dass es
 * hier vier Größen sind statt einer.
 *
 * ── Warum ein blankes Objekt und kein `StyleSheet.create` ───────────────────
 * Ein `StyleSheet.create`-Eintrag ist nicht verlässlich das Objekt selbst, sondern
 * je nach Fassung eine registrierte Kennung. Ein Spread darüber (`...ecke.lg`) gäbe
 * dann still **nichts** — kein Fehler, keine Ecke, und bemerkt hätte es niemand.
 * Ein blankes Objekt spreadet immer.
 *
 * `pill` fehlt hier absichtlich: Ein Halbkreis ist ein Halbkreis, `continuous`
 * ändert daran nichts. Wer eine Kapsel will, schreibt weiter `radius.pill`.
 */
export const ecke = {
  sm: { borderRadius: radius.sm, borderCurve: KURVE },
  md: { borderRadius: radius.md, borderCurve: KURVE },
  lg: { borderRadius: radius.lg, borderCurve: KURVE },
  xl: { borderRadius: radius.xl, borderCurve: KURVE },
} as const satisfies Record<string, ViewStyle>;
