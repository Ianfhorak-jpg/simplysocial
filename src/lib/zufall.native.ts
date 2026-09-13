/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  SICHERER ZUFALL — die Fassung fürs GERÄT
 *  Die Begründung steht vollständig in `zufall.ts`. Kurz: Es gibt dort kein
 *  `globalThis.crypto`, und genau das hat am 2026-09-13 das Profilbild lautlos
 *  scheitern lassen.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * `expo-crypto` liegt seit dem 12.09. im Binary — es kommt über `expo-auth-session`
 * mit (nachgemessen: `ExpoCrypto` steht in `ios/Podfile.lock` und 19-mal im
 * gebauten Binary). **Diese Reparatur kostet also KEINEN neuen Baustein**, nur
 * einen neuen Build. Eingetragen ist das Paket trotzdem ausdrücklich in
 * `package.json` — wer sich auf die Abhängigkeit einer Abhängigkeit verlässt,
 * verliert sie beim nächsten Patch, ohne es zu merken (die Lehre aus 19e-2).
 *
 * `randomUUID()` und nicht `getRandomBytesAsync()`: Es ist synchron, und
 * `bildPfad()` ist eine reine Funktion. Eine asynchrone Zufallsquelle machte aus
 * ihr eine `async`-Funktion und damit aus jeder Aufrufstelle eine mehr, an der ein
 * Promise verlorengehen kann — und genau daran hing dieser Fehler.
 */
import * as Crypto from 'expo-crypto';

export function zufallsHex(): string {
  return Crypto.randomUUID().replace(/-/g, '');
}
