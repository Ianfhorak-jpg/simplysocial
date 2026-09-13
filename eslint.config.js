// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');

module.exports = defineConfig([
  expoConfig,

  // ══════════════════════════════════════════════════════════════════════════
  //  EIN WÄCHTER GEGEN EINEN FEHLER, DEN `tsc` NICHT SIEHT — 2026-09-13
  // ══════════════════════════════════════════════════════════════════════════
  //
  // Anlass ist eine gemessene Stelle, kein Vorsatz. Beim Umbau des Anleitungs-
  // Merkers auf `AsyncStorage` (Ians Entscheidung 57) wurde `anleitungGesehen()`
  // von `boolean` auf `Promise<boolean>` umgestellt. In `(tabs)/index.tsx` stand
  //
  //     if (!anleitungGesehen()) setAnleitung(true);
  //
  // und **ein Promise ist immer truthy**: `!promise` ist immer `false`, der Zweig
  // lief nie, die Anleitungskarte wäre auf BEIDEN Plattformen lautlos verschwunden.
  // `npx tsc --noEmit` gab dazu **0** zurück — `!x` ist auf jedem Typ gültiger Code.
  //
  // Das ist dieselbe Familie wie `undefined > BILD_MAX_BYTES` (harte Regel 91),
  // `string | null` in JSX (harte Regel 20) und `find(p => p.id === undefined)`
  // (Phase 16): **Eine Lockerung meldet der Compiler nicht.** Und es ist die
  // gefährlichste Sorte, weil sie sich als ABWESENHEIT zeigt — es steht nichts
  // Falsches da, es fehlt nur etwas.
  //
  // ── Warum nur diese eine Regel ────────────────────────────────────────────
  // Sie ist type-aware, also braucht sie den `projectService`. Gemessen, bevor sie
  // hier stehen blieb: **81 Lint-Probleme vorher wie nachher** (kein einziger neuer
  // Fund in 22 Screens und 66 Haken) und **1,9 s** Laufzeit. Und die Gegenprobe,
  // auf die es ankommt — mit dem alten `if (!anleitungGesehen())` wieder eingebaut
  // meldet sie **83 statt 81**, mit der Stelle im Klartext: *„Expected non-Promise
  // value in a boolean conditional"*. Eine Regel, die nur schweigt, wäre kein
  // Wächter (die 18d-Lehre).
  //
  // ── `checksVoidReturn: true` seit dem 2026-09-13 abends (Phase 20.9) ───────
  // **Hier stand `false`, und die Begründung war falsch.** Sie lautete: Diese
  // Teilregel beanstande `onPress={async () => …}`, das sei in React Native „der
  // übliche und richtige Weg", sie hätte also nur Lärm gemacht.
  //
  // Üblich ja, richtig nein — und gemessen am selben Tag: Ians Profilbild ist am
  // Gerät lautlos gescheitert, weil ein Wurf durch genau so eine Prop hinauslief
  // und React das Promise wegwarf. Der Schalter stand also mit GENAU dem Auge zu,
  // das diese Familie sieht; er kam am 12.09. ins Projekt und war am 13.09. schon
  // zu spät. **Es waren 15 Stellen, nicht null Lärm.**
  //
  // Aufgeräumt sind sie alle (Phase 20.9): `onPress={() => void xAsync()}`, und
  // der Wurf selbst ist keiner mehr — `schreibVorgangIntern` und `datenHolen()`
  // machen aus einem Programmfehler seit Ians Entscheidung 71 einen ZUSTAND.
  // Gegengemessen: **81 Probleme mit `true` wie vorher mit `false`.** Der Schalter
  // bleibt an, und das ist der eigentliche Ertrag der Phase — ohne ihn kommt die
  // Familie beim nächsten Screen still zurück.
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
    },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: true, checksConditionals: true, checksSpreads: false },
      ],
    },
  },

  {
    ignores: ['dist/*'],
  },
]);
