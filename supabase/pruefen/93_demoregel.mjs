/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DIE APP-SEITE DES DEMO-ZUGANGS — Phase 21.5.  Aufruf: npm run pruef-demoregel
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  `92_demo.sh` misst die DATENBANK. Hier steht das Gegenstück: die Regel-Datei
 *  `features/auth/demo.ts` und — der eigentliche Grund für diese Datei — der
 *  Riegel in `demoAnmelden()`.
 *
 *  ── Die Attrappe ist hier der ZEUGE, nicht der Prüfling ────────────────────
 *  Sonst gilt in diesem Projekt: *„Eine Nachbildung im Prüfstand prüft die
 *  Nachbildung."* Hier ist es umgekehrt, und das ist der Kniff. Geprüft wird,
 *  dass `demoAnmelden()` bei einer fremden Adresse **gar nicht erst sendet**.
 *  Die Attrappe steht nur da, um mitzuschreiben, ob sie gerufen wurde. Wird sie
 *  gerufen, ist der Riegel gebrochen — und das ist eine Tatsache über den
 *  echten Code, keine über die Attrappe.
 */
const { pathToFileURL } = await import('node:url');
const js = (p) => pathToFileURL(`${process.env.ARBEIT}/js/${p}`).href;

const demo = await import(js('features/auth/demo.js'));
const konten = await import(js('features/auth/konten.js'));

let ja = 0;
let nein = 0;
function pruef(bedingung, satz) {
  if (bedingung) {
    ja += 1;
    console.log(`  ✓ ${satz}`);
  } else {
    nein += 1;
    console.log(`  ✗ ${satz}`);
  }
}

console.log('── 1. Die Adresse selbst ────────────────────────────────────────────────');

pruef(demo.DEMO_EMAIL === demo.DEMO_EMAIL.toLowerCase(),
  'DEMO_EMAIL ist kleingeschrieben — sonst trifft istDemoZugang() nie zu');
// Nicht `.endsWith('.invalid')` allein: Eine Adresse `foo@bar.com.invalid.at`
// endet nicht darauf und wäre trotzdem falsch. Geprüft wird die ENDUNG der
// Domain, also das, was RFC 2606 wirklich reserviert.
pruef(/@[^@]+\.invalid$/.test(demo.DEMO_EMAIL),
  'Die Domain endet auf .invalid — es kann per RFC 2606 nie ein Postfach geben');
pruef(!demo.DEMO_EMAIL.includes('simplysocial.at'),
  'Sie steht NICHT auf simplysocial.at — die Domain gehört uns noch nicht');

console.log('');
console.log('── 2. istDemoZugang(): normalisiert, nicht verglichen ───────────────────');

pruef(demo.istDemoZugang(demo.DEMO_EMAIL), 'Die Adresse selbst wird erkannt');
pruef(demo.istDemoZugang(`  ${demo.DEMO_EMAIL}  `),
  'Mit Leerzeichen davor und dahinter (beim Einfügen aus einer Notiz)');
pruef(demo.istDemoZugang(demo.DEMO_EMAIL.toUpperCase()),
  'Ganz groß geschrieben');
pruef(demo.istDemoZugang('Demo@Simplysocial.INVALID'),
  'Gemischt — so, wie iOS den ersten Buchstaben groß macht');
pruef(demo.istDemoZugang('\tDEMO@simplysocial.invalid\n'),
  'Mit Tabulator und Zeilenumbruch (kopierte Zeile aus App Store Connect)');

// Die andere Richtung, und sie ist die wichtigere: Was NICHT hineindarf.
pruef(!demo.istDemoZugang('ian.fhorak@gmail.com'), 'Eine echte Adresse wird abgelehnt');
pruef(!demo.istDemoZugang(''), 'Die leere Eingabe wird abgelehnt');
pruef(!demo.istDemoZugang('   '), 'Nur Leerzeichen werden abgelehnt');
pruef(!demo.istDemoZugang('demo@simplysocial.at'),
  'Dieselbe Adresse auf der ECHTEN Domain wird abgelehnt');
pruef(!demo.istDemoZugang(`x${demo.DEMO_EMAIL}`), 'Ein Zeichen davor genügt zur Ablehnung');
pruef(!demo.istDemoZugang(`${demo.DEMO_EMAIL}x`), 'Ein Zeichen dahinter genügt zur Ablehnung');

// ── Was im ÖFFENTLICHEN Bündel landet ──────────────────────────────────────
// `DEMO_EMAIL` steht im JS-Bündel, also auch in dem, das auf GitHub Pages liegt.
// Das ist unvermeidlich (die App muss die Adresse kennen) und genau deshalb
// harmlos: Ohne Postfach nützt sie niemandem, und ein Postfach kann es für
// `.invalid` nie geben. **Mit `demo@simplysocial.at` wäre derselbe Fund ein
// Einfallstor gewesen** — Adresse aus dem Bündel lesen, Code anfordern, drin.
// Das ist die schärfste Fassung von harter Regel 109, und sie steht hier, weil
// sie sonst nirgends gemessen wird.
pruef(/@[^@]+\.invalid$/.test(demo.DEMO_EMAIL),
  'Im öffentlichen Bündel steht damit nur eine Adresse OHNE mögliches Postfach');

// Und der Weg dorthin ist im Prototyp ohnehin zu: `anmeldeFolgen('email-code')`
// meldet bei `ANMELDE_QUELLE = 'attrappe'` `bereit: false`, der Knopf ist
// gesperrt, und ohne ihn gibt es keinen E-Mail-Schritt und kein Passwortfeld.
// Gemessen statt angenommen — in der Stellung, die gerade NICHT eingestellt ist,
// wäre es sonst nie geprüft (die 18d-Lehre).
{
  const anm = await import(js('features/auth/anmeldung.js'));
  const lage = { apple: false, google: false };
  const email = anm.anmeldeFolgen('email-code', lage);
  pruef(typeof email.bereit === 'boolean',
    'anmeldeFolgen(email-code) hat ein bereit-Feld — der Zugang hängt daran');
  pruef(email.bereit === (anm.ANMELDE_QUELLE !== 'attrappe'),
    `Im Prototyp ist der E-Mail-Weg zu, also auch der Demo-Schritt dahinter ` +
    `(steht gerade auf '${anm.ANMELDE_QUELLE}')`);
}

console.log('');
console.log('── 3. passwortFehlerText(): drei Lagen, drei Sätze ──────────────────────');

const falsch = demo.passwortFehlerText('invalid_credentials');
const unbekannt = demo.passwortFehlerText('irgendwas-neues');
pruef(falsch !== unbekannt,
  'Ein falsches Passwort sagt etwas ANDERES als ein unbekannter Fehler');
pruef(!falsch.toLowerCase().includes('code'),
  'Der Satz schickt niemanden zu einem Code, den es für dieses Konto nicht gibt');
pruef(!/invalid_credentials/.test(falsch),
  'Der technische Code steht NICHT auf dem Bildschirm (die Lehre vom 2026-09-03)');
pruef(demo.passwortFehlerText('over_request_rate_limit') !== unbekannt,
  'Die Sperre nach zu vielen Versuchen ist beantwortet');

console.log('');
console.log('── 4. DER RIEGEL: demoAnmelden() sendet bei fremder Adresse NICHT ───────');

// Der Zeuge. Er zählt nur mit; ein Aufruf ist schon der Befund.
function zeuge() {
  const notiz = { gerufen: 0, zuletzt: null };
  return {
    notiz,
    sb: {
      auth: {
        signInWithPassword: async (args) => {
          notiz.gerufen += 1;
          notiz.zuletzt = args;
          return { error: null };
        },
      },
    },
  };
}

for (const fremd of [
  'ian.fhorak@gmail.com',
  'demo@simplysocial.at',
  'admin@simplysocial.invalid',
  '',
]) {
  const z = zeuge();
  let geworfen = false;
  try {
    await konten.demoAnmelden(fremd, 'egal', z.sb);
  } catch {
    geworfen = true;
  }
  pruef(geworfen && z.notiz.gerufen === 0,
    `"${fremd || '(leer)'}" wird abgewiesen, BEVOR irgendetwas gesendet wird`);
}

// Die Gegenprobe im selben Lauf: Mit der richtigen Adresse muss er senden.
// Ohne sie wäre der Riegel auch dann grün, wenn die Funktion NIE etwas tut —
// und das wäre ein Demo-Zugang, der niemanden hineinlässt.
{
  const z = zeuge();
  await konten.demoAnmelden(demo.DEMO_EMAIL, 'geheim', z.sb);
  pruef(z.notiz.gerufen === 1, 'Mit der richtigen Adresse wird GENAU EINMAL gesendet');
  pruef(z.notiz.zuletzt?.password === 'geheim',
    'Das Passwort geht ungetrimmt durch — ein Leerzeichen ist dort ein Zeichen');
  pruef(z.notiz.zuletzt?.email === demo.DEMO_EMAIL,
    'Gesendet wird die NORMALISIERTE Adresse, nicht die rohe Eingabe');
}

// Und die Adresse, die der Riegel durchlässt, muss dieselbe sein, die gesendet
// wird. Läuft das auseinander, prüft der Riegel etwas anderes als das, was geht.
{
  const z = zeuge();
  await konten.demoAnmelden('  DEMO@SimplySocial.Invalid  ', 'geheim', z.sb);
  pruef(z.notiz.zuletzt?.email === demo.DEMO_EMAIL,
    'Auch eine groß/verschmutzt getippte Eingabe wird normalisiert gesendet');
}

console.log('');
if (nein > 0) {
  console.log(`✗ ${nein} Kreuze bei ${ja} Häkchen.`);
  process.exit(1);
}
console.log(`════ ${ja} Häkchen · 0 Kreuze ════`);
