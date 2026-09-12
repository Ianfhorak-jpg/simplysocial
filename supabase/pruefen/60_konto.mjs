/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DAS ERSTE KONTO am ECHTEN Supabase — Phase 20.3-b1
 *  Wird von `60_konto.sh` gerufen, nie von Hand.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Geprüft wird der Weg, den die App nach dem richtigen Code geht — mit DEN Dateien
 * der App, nicht mit einer Nachbildung (die Lehre vom 2026-09-06: eine Attrappe,
 * die vom Original abweicht, prüft die Attrappe).
 */
import { createClient } from '@supabase/supabase-js';

const ARBEIT = process.env.ARBEIT;
const { torwaechterZeigt } = await import(`${ARBEIT}/js/features/auth/anmeldung.js`);
const { handleVorschlag, fehltNoch, naechsterHandle } = await import(
  `${ARBEIT}/js/features/auth/konto.js`
);
const { sitzungLesen, profilAnlegen, KontoFehler } = await import(
  `${ARBEIT}/js/features/auth/konten.js`
);

const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const PASSWORT = process.env.PRUEF_PASSWORT;
const KONTO_A = process.env.KONTO_A;
const KONTO_B = process.env.KONTO_B;
const MAIL_A = process.env.MAIL_A;
const MAIL_B = process.env.MAIL_B;

let haken = 0;
let kreuze = 0;
function pruef(was, ist, soll) {
  const gut = JSON.stringify(ist) === JSON.stringify(soll);
  if (gut) {
    haken += 1;
    console.log(`  ✓ ${was}`);
  } else {
    kreuze += 1;
    console.log(`  ✗ ${was}\n      ist:  ${JSON.stringify(ist)}\n      soll: ${JSON.stringify(soll)}`);
  }
}

/** Ein eigener Client je Mensch — zwei Sitzungen dürfen sich nicht überschreiben. */
function frischerClient() {
  return createClient(URL, ANON, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

async function anmelden(sb, mail) {
  const { error } = await sb.auth.signInWithPassword({ email: mail, password: PASSWORT });
  if (error) throw new Error(`Anmelden als ${mail} gescheitert: ${error.message}`);
}

// ── 1. Die reinen Regeln — ohne Netz ─────────────────────────────────────────
// Sie laufen zuerst, weil ein Fehler hier jeden Befund danach wertlos macht.
console.log('\n── Die Regeln aus konto.ts (ohne Netz) ──');
pruef('@-Name aus "Ian"', handleVorschlag('Ian'), 'ian');
pruef('Umlaut bleibt erhalten', handleVorschlag('Jürgen Öhler'), 'juergenoehler');
pruef('ß wird zu ss', handleVorschlag('Straßer'), 'strasser');
// Der Rückfall ist die Zusage der Funktion: Sie gibt IMMER etwas zurück, womit
// `not null` zufrieden ist. Ohne ihn wäre ein leerer `handle` möglich, und `''`
// ist für Postgres ein gültiger Wert.
pruef('Name ganz ohne Buchstaben', handleVorschlag('🙂'), 'mensch');
pruef('zweiter Versuch heißt ian2', naechsterHandle('ian', 1), 'ian2');
pruef('leerer Name wird gemeldet', typeof fehltNoch('name', ''), 'string');
pruef('1220 ist in Ordnung', fehltNoch('bezirk', '1220'), null);
// 1240 gibt es nicht. Die Regel „vierstellig, fängt mit 1 an" ließe sie durch.
pruef('1240 gibt es nicht', typeof fehltNoch('bezirk', '1240'), 'string');
pruef('Jahrgang 1900 ist außerhalb', typeof fehltNoch('jahrgang', '1900'), 'string');

console.log('\n── Der Torwächter (erschöpfender switch) ──');
pruef('unbekannt → wartet', torwaechterZeigt({ zustand: 'unbekannt' }), 'wartet');
pruef('aus → anmelden', torwaechterZeigt({ zustand: 'aus' }), 'anmelden');
pruef(
  'neu → erstes-konto',
  torwaechterZeigt({ zustand: 'neu', authId: 'x', email: 'y' }),
  'erstes-konto',
);
pruef('an → app', torwaechterZeigt({ zustand: 'an', ichId: 'x' }), 'app');

// ── 2. Angemeldet, aber ohne Profil — der dritte Zustand ─────────────────────
console.log('\n── Der dritte Zustand am ECHTEN Server ──');
const sbA = frischerClient();
await anmelden(sbA, MAIL_A);
const vorher = await sitzungLesen(sbA);
pruef('ohne Profil ist die Sitzung "neu"', vorher.zustand, 'neu');
pruef('und sie trägt die authId', vorher.authId, KONTO_A);
pruef('und die E-Mail', vorher.email, MAIL_A);
pruef('der Torwächter zeigt das erste Konto', torwaechterZeigt(vorher), 'erstes-konto');

// ── 3. Profil anlegen ────────────────────────────────────────────────────────
console.log('\n── Das Profil anlegen ──');
const nachher = await profilAnlegen(
  { authId: KONTO_A, name: 'Ian', bezirk: '1220', jahrgang: 2009 },
  sbA,
);
pruef('danach ist die Sitzung "an"', nachher.zustand, 'an');
pruef('ichId ist dieselbe UUID wie authId', nachher.ichId, KONTO_A);
pruef('der Torwächter lässt in die App', torwaechterZeigt(nachher), 'app');
// Frisch gelesen und nicht aus dem Rückgabewert: Der sagt, was die Funktion
// GLAUBT — die Datenbank sagt, was dasteht.
const nochmalGelesen = await sitzungLesen(sbA);
pruef('frisch gelesen steht dasselbe da', nochmalGelesen, { zustand: 'an', ichId: KONTO_A });

// ── 4. Zweimal „Los geht's" ──────────────────────────────────────────────────
// Der Doppelklick auf Web. Er scheitert an `profiles_pkey` und ist trotzdem kein
// Fehler: Das Profil IST angelegt, und genau das ist das gewünschte Ergebnis.
console.log('\n── Zweimal auf „Los geht\'s" ──');
const zweimal = await profilAnlegen(
  { authId: KONTO_A, name: 'Ian', bezirk: '1220', jahrgang: 2009 },
  sbA,
);
pruef('der zweite Versuch meldet keinen Fehler', zweimal, { zustand: 'an', ichId: KONTO_A });

// ── 5. Der @-Name kollidiert ─────────────────────────────────────────────────
// Der eigentliche Grund, warum `profilAnlegen` eine Schleife hat. Zwei Menschen
// heißen „Ian"; abgeleitet wäre beides `@ian`, und `handle` ist `unique`.
console.log('\n── Zwei Menschen heißen Ian ──');
const sbB = frischerClient();
await anmelden(sbB, MAIL_B);
const zweiter = await profilAnlegen(
  { authId: KONTO_B, name: 'Ian', bezirk: '1070', jahrgang: 2007 },
  sbB,
);
pruef('auch der zweite kommt durch', zweiter.zustand, 'an');
// `.in('id', …)` statt aller Profile: Diese Zeile fragt nach den ZWEI Menschen
// dieses Laufs, nicht nach der Bevölkerung der Datenbank. Ohne die Einschränkung
// war sie am 2026-09-12 rot, sobald irgendein echtes Profil existierte — und der
// Text daneben („die @-Namen sind ian und ian2") behauptete dann etwas über die
// ganze Tabelle, was er nie gemeint hat. Dieselbe Berichtigung wie am Wächter und
// an der Konten-Zählung: **die Prüfung fasst nur ihre eigenen IDs an.**
const { data: handles } = await sbB
  .from('profiles')
  .select('id, handle')
  .in('id', [KONTO_A, KONTO_B])
  .order('handle', { ascending: true });
pruef(
  'die @-Namen sind ian und ian2',
  handles.map((z) => z.handle),
  ['ian', 'ian2'],
);
pruef(
  'und ian2 gehört dem ZWEITEN',
  handles.find((z) => z.handle === 'ian2').id,
  KONTO_B,
);

// ── 6. Ein Fehler, der KEINE Kollision ist, bricht sofort ab ────────────────
// Ohne diese Unterscheidung liefe die Schleife zwanzigmal gegen eine abgelaufene
// Anmeldung und meldete am Ende „@-Name vergeben" — eine Meldung, die in die Irre
// führt. Geprüft mit einem Bezirk, den der CHECK der Datenbank ablehnt.
console.log('\n── Ein anderer Fehler bricht sofort ab ──');
let gefangen = null;
try {
  await profilAnlegen({ authId: KONTO_B, name: 'Neu', bezirk: '1220', jahrgang: 1800 }, sbB);
} catch (f) {
  gefangen = f;
}
pruef('es fliegt ein KontoFehler', gefangen instanceof KontoFehler, true);
// Harte Regel 57 für die App-Seite: „ist fehlgeschlagen" ist zu wenig. `23514` ist
// ein verletzter CHECK — wäre hier `23505` zu lesen, hätte die Schleife gegriffen.
pruef('und er trägt den Code des CHECKs', gefangen?.code, '23514');

// ── 7. Fremde dürfen kein Profil auf eine fremde UUID legen ─────────────────
// `profil_anlegen` verlangt `id = auth.uid()`. Das ist eine Policy und wurde in
// 20.2 lokal geprüft — hier zum ersten Mal über PostgREST mit echtem Token.
console.log('\n── Angriff: ein Profil auf eine fremde UUID ──');
let angriff = null;
try {
  await profilAnlegen({ authId: KONTO_A, name: 'Dieb', bezirk: '1010', jahrgang: 2000 }, sbB);
} catch (f) {
  angriff = f;
}
pruef('abgewiesen', angriff instanceof KontoFehler, true);
pruef('und zwar von der Policy (42501)', angriff?.code, '42501');

console.log(`\n── ${haken} Häkchen, ${kreuze} Kreuze ──`);
process.exit(kreuze === 0 ? 0 : 1);
