/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  APPLE UND GOOGLE — die Regel (Phase 20.3-b2)
 *  Wird von `96_anbieter.sh` gerufen, nie von Hand.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
const ARBEIT = process.env.ARBEIT;
const jetzt = await import(`${ARBEIT}/jetzt/anmeldung.mjs`);
const umgelegt = await import(`${ARBEIT}/umgelegt/anmeldung.mjs`);

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

// Die zwei Lagen, die es wirklich gibt. `web` ist gemessen (beide Zweige geben
// das zurück), `geraet` ist die Lage auf einem iPhone mit gesetzter Client-ID.
const WEB = { apple: false, google: false };
const GERAET = { apple: true, google: true };
// Und die dritte, die es gibt und die niemand plant: ein Gerät ohne .env-Eintrag.
const OHNE_GOOGLE = { apple: true, google: false };

console.log('── Die Reihenfolge ist Apples Richtlinie 4.8, kein Geschmack ──');
pruef('Apple steht VOR Google', jetzt.ANMELDE_WEGE.indexOf('apple') < jetzt.ANMELDE_WEGE.indexOf('google'), true);
pruef('drei Wege, nicht mehr und nicht weniger', [...jetzt.ANMELDE_WEGE], ['apple', 'google', 'email-code']);
pruef('der Schalter steht im Repo auf attrappe', jetzt.ANMELDE_QUELLE, 'attrappe');
pruef('und in der zweiten Fassung auf supabase', umgelegt.ANMELDE_QUELLE, 'supabase');

console.log('\n── HEUTE (attrappe): kein Weg ist bereit, und alle sagen dasselbe ──');
// Das ist die Zusage, an der die öffentliche Adresse hängt: Solange der Schalter
// nicht umgelegt ist, ändert 20.3-b2 am Prototyp NICHTS.
for (const lage of [WEB, GERAET]) {
  const name = lage.apple ? 'Gerät' : 'Web';
  for (const weg of jetzt.ANMELDE_WEGE) {
    const { bereit, hinweis } = jetzt.anmeldeFolgen(weg, lage);
    pruef(`${name}/${weg}: nicht bereit`, bereit, false);
    pruef(`${name}/${weg}: „kommt mit dem Konto"`, hinweis, 'Kommt mit dem Konto — im Prototyp noch ohne Funktion.');
  }
}
{
  // Der Bildschirm entdoppelt die Hinweise. Sagen alle drei dasselbe, steht der
  // Satz EINMAL da — das ist Ians Entscheidung 50, nachgemessen: Dreimal derselbe
  // Satz kostete auf 360 × 600 zwölf Bildpunkte zu viel.
  const saetze = [...new Set(jetzt.ANMELDE_WEGE.map((w) => jetzt.anmeldeFolgen(w, WEB).hinweis))].filter(Boolean);
  pruef('der Bildschirm zeigt genau EINEN Hinweis', saetze.length, 1);
}

console.log('\n── NACH dem Umlegen: das Gerät kann, der Browser nicht ──');
pruef('Gerät/apple ist bereit', umgelegt.anmeldeFolgen('apple', GERAET).bereit, true);
pruef('Gerät/google ist bereit', umgelegt.anmeldeFolgen('google', GERAET).bereit, true);
pruef('Gerät/email-code ist bereit', umgelegt.anmeldeFolgen('email-code', GERAET).bereit, true);
// Der Kern der Phase: Apple im Browser ist nicht „noch nicht", sondern nie —
// Supabases Apple-Client-ID ist die Bundle-ID, und die gilt nur nativ.
pruef('Web/apple ist NICHT bereit', umgelegt.anmeldeFolgen('apple', WEB).bereit, false);
pruef('Web/google ist NICHT bereit', umgelegt.anmeldeFolgen('google', WEB).bereit, false);
pruef('Web/email-code ist trotzdem bereit', umgelegt.anmeldeFolgen('email-code', WEB).bereit, true);
pruef('Gerät ohne .env-Eintrag: Google zu, Apple offen', [
  umgelegt.anmeldeFolgen('google', OHNE_GOOGLE).bereit,
  umgelegt.anmeldeFolgen('apple', OHNE_GOOGLE).bereit,
], [false, true]);

console.log('\n── Ein Knopf, der nicht kann, SAGT warum ──');
// „Steht der Knopf nicht da, steht ein Satz da" (dieselbe Regel wie
// `schreibHuerdeText()`). Die Gegenprobe ist der zweite Teil: Ein FERTIGER Weg
// bringt keinen Hinweis mit — sonst stünde auf dem Anmelde-Bildschirm dauerhaft
// ein Satz über etwas, das gerade niemanden beschäftigt (harte Regel 63).
for (const weg of ['apple', 'google']) {
  pruef(`Web/${weg}: sagt, dass es nur am Handy geht`, umgelegt.anmeldeFolgen(weg, WEB).hinweis, 'Geht nur in der App am Handy.');
  pruef(`Gerät/${weg}: sagt GAR NICHTS mehr`, umgelegt.anmeldeFolgen(weg, GERAET).hinweis, '');
}
pruef('Gerät/email-code erklärt den Code', umgelegt.anmeldeFolgen('email-code', GERAET).hinweis, 'Wir schicken dir eine Zahl, kein Passwort.');

console.log('\n── Ein ABBRUCH ist kein Fehler — und muss SCHWEIGEN ──');
// Die wichtigste einzelne Zusage dieser Datei. Wer den Apple-Dialog wegwischt,
// hat entschieden; eine rote Zeile danach behauptet, es sei etwas schiefgegangen
// — dieselbe Familie wie „Noch nichts los in deinem Feed" bei einem Netzausfall.
pruef('abgebrochen → null, also steht nichts da', jetzt.anbieterFehlerText('abgebrochen'), null);
for (const code of ['nicht-hier', 'kein-zugang', 'kein-ausweis', 'unbekannt', 'irgendwas']) {
  const text = jetzt.anbieterFehlerText(code);
  pruef(`${code} → ein Satz für Menschen`, typeof text === 'string' && text.length > 0, true);
  // Der `code` gehört in die KONSOLE, nicht auf den Bildschirm (der Fund vom
  // 2026-09-03: Entwickler-Notizen in JSX-Text sind öffentlich abrufbar).
  pruef(`${code} → und der Code steht NICHT darin`, String(text).includes(code), false);
}

console.log('\n── Der Rücksprung von Google, an dem ein Zeichen alles kippt ──');
// Ein falsches Zeichen ergibt `redirect_uri_mismatch` — in einem Browserfenster,
// auf einem fremden iPhone, wo niemand danebensteht. Deshalb steht die Funktion
// in der importfreien Datei und wird HIER gemessen statt am Gerät geraten.
pruef(
  'aus der Client-ID wird das umgedrehte Schema',
  jetzt.googleRueckweg('132215869376-abc123.apps.googleusercontent.com'),
  'com.googleusercontent.apps.132215869376-abc123:/oauthredirect',
);
pruef(
  'der Suffix wird nur am ENDE abgeschnitten',
  jetzt.googleRueckweg('x.apps.googleusercontent.com.apps.googleusercontent.com'),
  'com.googleusercontent.apps.x.apps.googleusercontent.com:/oauthredirect',
);
pruef(
  'ohne Suffix bleibt die ID stehen, statt still etwas zu erfinden',
  jetzt.googleRueckweg('132215869376-abc123'),
  'com.googleusercontent.apps.132215869376-abc123:/oauthredirect',
);

console.log('\n── Der Torwächter hat vier Glieder, und keines ist dazugekommen ──');
pruef('unbekannt → wartet', jetzt.torwaechterZeigt({ zustand: 'unbekannt' }), 'wartet');
pruef('aus → anmelden', jetzt.torwaechterZeigt({ zustand: 'aus' }), 'anmelden');
// `name` ist seit 20.3-b2 an `'neu'` dabei (Apple gibt ihn nur EINMAL heraus).
// Das ist eine Lockerung, also meldet `tsc` dazu nichts — die Prüfung steht hier,
// weil der Torwächter sich davon nicht beirren lassen darf.
pruef('neu MIT Namen → weiter erstes-konto', jetzt.torwaechterZeigt({ zustand: 'neu', authId: 'u', email: 'a@b.at', name: 'Ian' }), 'erstes-konto');
pruef('neu OHNE Namen → dasselbe', jetzt.torwaechterZeigt({ zustand: 'neu', authId: 'u', email: 'a@b.at' }), 'erstes-konto');
pruef('an → app', jetzt.torwaechterZeigt({ zustand: 'an', ichId: 'u' }), 'app');

console.log(`\n════ ${haken} Häkchen · ${kreuze} Kreuze ════`);
process.exit(kreuze > 0 ? 1 : 0);
