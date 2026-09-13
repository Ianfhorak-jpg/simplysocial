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
  // `checksVoidReturn: false` ist Absicht und kein Weglassen: Diese Teilregel
  // beanstandet `onPress={async () => …}` und ähnliche Handler. Das ist in React
  // Native der übliche und richtige Weg, sie hätte also nur Lärm gemacht — und ein
  // Wächter, den man wegen Lärm abschaltet, bewacht danach gar nichts mehr.
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
        { checksVoidReturn: false, checksConditionals: true, checksSpreads: false },
      ],
    },
  },

  {
    ignores: ['dist/*'],
  },
]);
