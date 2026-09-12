/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DIE LEITUNG ZUM ANMELDEDIENST — Phase 20.3-b1
 *  Die einzige Datei, die GoTrue anfasst.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sie steht zu `features/auth/` wie `data/laden.ts` zu `data/`: Die REGELN stehen
 * daneben (`anmeldung.ts`, `konto.ts`), hier steht nur der Weg nach draußen. Kein
 * Screen importiert diese Datei — die Screens reden mit `hooks.ts`.
 *
 * ── Was 20.3-b1 ist und was nicht ────────────────────────────────────────────
 * Gebaut ist der E-MAIL-CODE, und zwar gegen Ians echtes Supabase. Apple und Google
 * sind am Server nachgemessen aus (`/auth/v1/settings` meldet `apple: false`,
 * `google: false`) und kommen in 20.3-b2 zusammen mit den vier nativen Bausteinen
 * in EINEM Build. Dieselbe Trennung wie 20.1/20.2, 20.3-a/b und 20.4-a/b:
 * *hält der Weg?* und *ist das Konto eingerichtet?* sind zwei Fragen.
 *
 * ── `supabase-js` wirft nicht, und das ist hier gefährlicher als beim Lesen ───
 * Beim Lesen machte `data ?? []` aus einem Fehler eine leere Liste (Entscheidung 43).
 * Beim ANMELDEN macht ein ignoriertes `error` aus einem falschen Code ein stilles
 * „nichts passiert" — der Knopf federt zurück, und niemand weiß, warum. Deshalb
 * trägt jede Funktion hier ihren Fehler als `KontoFehler` heraus, mit `code`.
 *
 * ── Warum kein `signUp` und kein Passwort ────────────────────────────────────
 * `signInWithOtp` legt das Konto beim ersten richtigen Code selbst an
 * (`shouldCreateUser`). Anmelden und Registrieren sind damit EIN Weg und nicht
 * zwei — es gibt keinen Zustand „Konto da, aber falsch angemeldet", und niemand
 * muss sich ein Passwort merken, das er in einer Treff-App ohnehin nie wieder
 * eintippt. Das ist Ians Entscheidung 27 in ihrer technischen Form.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import { client } from '@/lib/supabase';

import type { Sitzung } from './anmeldung';
import { HANDLE_VERSUCHE, handleVorschlag, naechsterHandle } from './konto';

/**
 * Ein Fehler beim Anmelden — mit `code`, nicht nur mit Text.
 *
 * Dieselbe Bauart und derselbe Grund wie `LadeFehler` in `data/laden.ts`: Harte
 * Regel 57 verlangt schon vom PRÜFSTAND, dass er den `SQLSTATE` vergleicht statt
 * „ist fehlgeschlagen" zu fragen. Für den Menschen davor gilt dasselbe — ein
 * abgelaufener Code (`otp_expired`) und ein falsch getippter (`otp_invalid`) sind
 * zwei Lagen, und nur eine davon behebt man durch Nachschauen in der Mail.
 */
export class KontoFehler extends Error {
  constructor(
    readonly schritt: string,
    readonly code: string,
    grund: string,
  ) {
    super(`Anmelden gescheitert bei "${schritt}" (${code}): ${grund}`);
    this.name = 'KontoFehler';
  }
}

/**
 * Schritt 1: Code anfordern.
 *
 * ── `shouldCreateUser: true` ist eine Entscheidung, keine Voreinstellung ──────
 * Damit gibt es kein „Registrieren" neben dem „Anmelden". Der Preis ist benannt:
 * Wer sich vertippt, legt ein Konto auf einer fremden Adresse an — und kommt nie
 * an den Code, kann es also nicht benutzen. Ein Konto ohne Profil ist ein Eintrag
 * in `auth.users` und sonst nichts; es taucht in keiner Liste der App auf, weil
 * jede von ihnen über `profiles` geht.
 *
 * ── Was diese Funktion NICHT weiß ────────────────────────────────────────────
 * Ob die Mail eine ZAHL enthält oder einen Link. Das entscheidet die Vorlage im
 * Supabase-Dashboard (`{{ .Token }}` statt `{{ .ConfirmationURL }}`), und das ist
 * ein Handgriff, den nur Ian machen kann — er steht in
 * `_FUER_IAN/KONTEN_EINRICHTEN.md`. Am Code hier ändert sich dadurch nichts:
 * `verifyOtp` nimmt die Zahl.
 */
export async function codeAnfordern(email: string, sb: SupabaseClient = client()): Promise<void> {
  const { error } = await sb.auth.signInWithOtp({
    email: email.trim(),
    options: { shouldCreateUser: true },
  });
  if (error) {
    throw new KontoFehler('code-anfordern', error.code ?? String(error.status ?? '?'), error.message);
  }
}

/**
 * Schritt 2: Code prüfen. Danach gibt es eine Supabase-Sitzung — aber noch keine
 * `Sitzung` im Sinn dieser App: Ob dahinter ein Profil steht, sagt `sitzungLesen()`.
 *
 * `type: 'email'` deckt BEIDE Fälle ab — den ersten Code eines neuen Kontos und
 * jeden späteren. Das ist der Grund, warum es hier keine Fallunterscheidung gibt:
 * GoTrue kennt `signup` und `magiclink` als eigene Typen, `email` nimmt beide an.
 */
export async function codePruefen(
  email: string,
  code: string,
  sb: SupabaseClient = client(),
): Promise<void> {
  const { error } = await sb.auth.verifyOtp({
    email: email.trim(),
    token: code.trim(),
    type: 'email',
  });
  if (error) {
    throw new KontoFehler('code-pruefen', error.code ?? String(error.status ?? '?'), error.message);
  }
}

/**
 * Wer ist gerade angemeldet — und hat die Person schon ein Profil?
 *
 * ── Das ist die Stelle, an der der dritte Zustand entsteht ───────────────────
 * Eine Supabase-Sitzung sagt nur, dass jemand seine Mailadresse belegt hat. Die
 * App braucht eine `User.id`, und die gibt es erst mit einer Zeile in `profiles`.
 * Weil `profiles.id` auf `auth.users.id` zeigt, ist beides DIESELBE UUID — es gibt
 * also keine zweite Zuordnung, die auseinanderlaufen könnte.
 *
 * ── Warum `maybeSingle()` und nicht `single()` ───────────────────────────────
 * `single()` macht aus „kein Profil da" einen FEHLER (`PGRST116`), und genau das
 * ist hier der zu erwartende Normalfall beim ersten Mal. Ein Fehler, der den
 * Regelfall meldet, ist eine Meldung, die man wegsieht — und beim nächsten Mal
 * sieht man eine echte mit weg.
 */
export async function sitzungLesen(sb: SupabaseClient = client()): Promise<Sitzung> {
  const { data: sitzungsdaten } = await sb.auth.getSession();
  const nutzer = sitzungsdaten.session?.user;
  if (!nutzer) return { zustand: 'aus' };

  const { data, error } = await sb.from('profiles').select('id').eq('id', nutzer.id).maybeSingle();
  if (error) {
    throw new KontoFehler('profil-suchen', error.code ?? '?', error.message);
  }
  if (!data) {
    return { zustand: 'neu', authId: nutzer.id, email: nutzer.email ?? '' };
  }
  return { zustand: 'an', ichId: nutzer.id };
}

/** Was ein neues Profil mitbringt. `bio` und `interests` haben ihre Voreinstellung. */
export interface NeuesProfil {
  authId: string;
  name: string;
  bezirk: string;
  jahrgang: number;
}

/**
 * Das Profil anlegen — Ians Entscheidung 44, ausgeführt.
 *
 * ── Die Schleife ist der ganze Punkt dieser Funktion ─────────────────────────
 * `handle` ist `unique`. Der @-Name wird abgeleitet (Entscheidung 44), also KANN
 * er kollidieren — nicht bei mir, sondern zwischen zwei Menschen, die beide „Ian"
 * heißen. Vorher nachzusehen, ob `@ian` frei ist, wäre der naheliegende Weg und
 * der falsche: Zwischen dem Nachsehen und dem Schreiben liegt genau das Fenster,
 * gegen das harte Regel 71 gebaut ist. **Die Datenbank ist die einzige Stelle, die
 * es wirklich weiß**, und sie sagt es mit `23505`.
 *
 * Jeder andere Fehlercode bricht sofort ab. Sonst liefe die Schleife zwanzigmal
 * gegen eine abgelaufene Anmeldung und meldete am Ende „@-Name vergeben" — eine
 * Meldung, die in die Irre führt und dabei zwanzig Umläufe nach Irland kostet.
 */
export async function profilAnlegen(
  neu: NeuesProfil,
  sb: SupabaseClient = client(),
): Promise<Sitzung> {
  const basis = handleVorschlag(neu.name);

  for (let versuch = 0; versuch < HANDLE_VERSUCHE; versuch += 1) {
    const handle = versuch === 0 ? basis : naechsterHandle(basis, versuch);
    const { error } = await sb.from('profiles').insert({
      id: neu.authId,
      handle,
      display_name: neu.name.trim(),
      district: neu.bezirk,
      jahrgang: neu.jahrgang,
    });

    if (!error) return { zustand: 'an', ichId: neu.authId };
    if (error.code !== '23505') {
      throw new KontoFehler('profil-anlegen', error.code ?? '?', error.message);
    }
    // `23505` kann AUCH der Primärschlüssel sein: Wer zweimal auf „Los geht's"
    // tippt, legt beim zweiten Mal dasselbe Profil an. Das ist kein Fehler,
    // sondern das Ergebnis — dieselbe Überlegung wie die zwei Sicherheitsnetze
    // gegen den Doppelklick in `anfrageBestaetigen()`.
    if ((error.message ?? '').includes('profiles_pkey')) {
      return { zustand: 'an', ichId: neu.authId };
    }
  }

  throw new KontoFehler(
    'profil-anlegen',
    '23505',
    `Nach ${HANDLE_VERSUCHE} Versuchen war kein @-Name frei (Basis "${basis}").`,
  );
}

/** Abmelden bei Supabase. Das Aufräumen im Speicher macht `hooks.ts`. */
export async function supabaseAbmelden(sb: SupabaseClient = client()): Promise<void> {
  const { error } = await sb.auth.signOut();
  // Ein gescheitertes Abmelden am SERVER darf das Abmelden in der APP nicht
  // aufhalten: Wer auf „Abmelden" tippt, will weg, und ein Token, das lokal
  // gelöscht ist, kommt nicht zurück. Deshalb eine Notiz in der Konsole statt
  // eines geworfenen Fehlers — die einzige Stelle in dieser Datei, an der das gilt.
  if (error) console.warn(`Abmelden am Server gescheitert (${error.code ?? '?'}): ${error.message}`);
}
