/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  APPLE UND GOOGLE — Web-Zweig (Phase 20.3-b2)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Im Browser gibt es beide Wege nicht, und das ist **kein „noch nicht"**, sondern
 * eine Tatsache über die eingerichteten Konten:
 *
 *   • **Apple.** Die Client-ID in Supabase ist die Bundle-ID `at.simplysocial.app`
 *     — eine native Kennung. Apples Anmeldung im Browser verlangt eine eigene
 *     *Services ID* samt eigenem Schlüssel und einer eingetragenen Rücksprung-
 *     Adresse. Nichts davon gibt es, und nichts davon wäre nebenbei zu machen.
 *   • **Google.** Ginge im Browser — aber nur über `signInWithOAuth()`, und dessen
 *     Rücksprung muss in Supabases Erlaubnisliste stehen. Das ist ein Dashboard-
 *     Feld, also ein neuer Handgriff von Ian, für einen Weg, den auf der
 *     öffentlichen Adresse niemand gehen kann (dort steht `ANMELDE_QUELLE` auf
 *     `'attrappe'`).
 *
 * ── Warum das trotzdem eine DATEI ist und kein `if` ─────────────────────────
 * Dieselbe Begründung wie bei `sitzungsspeicher` (20.3-b2), `SsGlas` (harte
 * Regel 61) und `SsKarte` (52): `expo-apple-authentication` und
 * `expo-auth-session` gehören ins Geräte-Bündel und nicht ins Web-Bündel. Der
 * Preis eines `Platform.OS`-Zweigs wäre gemessen in Bytes; die Endung kostet
 * nichts.
 *
 * ── Und warum hier trotzdem etwas GEWORFEN wird ─────────────────────────────
 * `anbieterLage()` sagt `false`, also zeichnet der Bildschirm beide Knöpfe
 * ausgegraut mit einem Satz daneben — es sollte hier nie jemand ankommen. Wenn
 * doch, ist das ein Programmfehler, und ein lauter ist besser als ein stiller
 * (dieselbe Haltung wie `meineId()` in `features/auth/hooks.ts`).
 */
import { AnbieterFehler, type AnbieterLage } from '@/features/auth/anmeldung';

import type { Ausweis } from './anmelde-anbieter-typen';

export function anbieterLage(): AnbieterLage {
  return { apple: false, google: false };
}

export function appleAusweis(): Promise<Ausweis> {
  return Promise.reject(
    new AnbieterFehler('apple', 'nicht-hier', 'Apple-Anmeldung gibt es nur in der iPhone-App.'),
  );
}

export function googleAusweis(): Promise<Ausweis> {
  return Promise.reject(
    new AnbieterFehler('google', 'nicht-hier', 'Google-Anmeldung gibt es nur in der App.'),
  );
}
