/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DIE GETEILTE SITZUNG — Ians Entscheidung 55 (Phase 20.3-b2)
 *  Wird von `95_sitzung.sh` gerufen, nie von Hand.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
const ARBEIT = process.env.ARBEIT;
const { aufteilen, zusammensetzen, TRESOR_FELD, SITZUNG_TEILUNG, HALBE_SITZUNG } =
  await import(`${ARBEIT}/js/features/auth/sitzungsspeicher.mjs`);

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

/**
 * Felder rekursiv nach Namen ordnen, damit ZWEI Objekte mit denselben Feldern
 * gleich sind, egal in welcher Reihenfolge sie geschrieben wurden.
 *
 * **Warum das hier gebraucht wird und `pruef()` trotzdem streng bleibt:**
 * `pruef()` vergleicht Text, und bei einem Objekt hängt der an der Reihenfolge.
 * Für alles andere in dieser Datei ist das richtig. Bei der Sitzung ist es
 * falsch, und zwar nachweisbar: `aufteilen()` LÖSCHT `refresh_token` aus dem
 * Datei-Teil — die Prüfung eine Zeile darüber verlangt das ausdrücklich —, und
 * damit ist die ursprüngliche Position des Feldes weg. Eine Prüfung auf die alte
 * Reihenfolge könnte also KEINE Fassung von `zusammensetzen()` bestehen.
 *
 * Gemessen am 2026-09-13: Der Inhalt stimmte aufs Zeichen, nur `refresh_token`
 * stand hinten statt in der Mitte. Der Kommentar an der Prüfung sagte das
 * Richtige (*„verglichen wird das GEPARSTE"*), der Code darunter tat es nicht —
 * dieselbe Familie wie harte Regel 83.
 */
function kanonisch(wert) {
  if (Array.isArray(wert)) return wert.map(kanonisch);
  if (wert === null || typeof wert !== 'object') return wert;
  return Object.fromEntries(
    Object.keys(wert).sort().map((k) => [k, kanonisch(wert[k])]),
  );
}

// ── Die Sitzungen, gegen die geprüft wird ────────────────────────────────────
// Die FELDER und ihre GRÖSSEN sind am 2026-09-13 am echten Supabase gemessen
// (Client mit untergeschobener Speicher-Attrappe). Die Werte selbst sind
// Füllzeichen und keine echten Token — ein echter Dauerschlüssel gehört in
// keine Datei, die im Repo liegt (harte Regel 12).
function jwt(bytes) {
  const kopf = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.';
  return kopf + 'x'.repeat(Math.max(0, bytes - kopf.length - 44)) + '.' + 'y'.repeat(43);
}
function sitzung({ userBytes, tokenBytes }) {
  return {
    access_token: jwt(tokenBytes),
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: 1789012345,
    refresh_token: 'z3k9pq2mx7wt',
    user: { id: '11111111-1111-4111-8111-111111111111', fuellung: 'u'.repeat(userBytes) },
  };
}
const EMAIL = sitzung({ userBytes: 380, tokenBytes: 780 });
const GOOGLE = sitzung({ userBytes: 830, tokenBytes: 1386 });

console.log('\n── Die Regel selbst ──');
pruef('Ians Entscheidung 55 steht da', SITZUNG_TEILUNG, 'dauerschluessel-getrennt');
pruef('eine halbe Sitzung gilt als abgemeldet', HALBE_SITZUNG, 'abgemeldet');
pruef('in den Tresor geht der Dauerschlüssel', TRESOR_FELD, 'refresh_token');

console.log('\n── Teilen und wieder zusammensetzen ──');
for (const [name, s] of [['E-Mail-Konto', EMAIL], ['Google-Konto', GOOGLE]]) {
  const roh = JSON.stringify(s);
  const teile = aufteilen(roh);
  pruef(`${name}: der Dauerschlüssel liegt im Tresor`, teile.tresor, s.refresh_token);

  // Die Gegenprobe, auf die es ankommt. Ohne sie bestünde eine Fassung, die den
  // Schlüssel in den Tresor KOPIERT und in der Datei stehen lässt, jede andere
  // Prüfung hier — und der ganze Gewinn von Entscheidung 55 wäre weg, ohne dass
  // irgendetwas rot wird.
  pruef(
    `${name}: und steht NICHT mehr in der Datei`,
    String(teile.datei).includes(s.refresh_token),
    false,
  );

  // Verglichen wird das GEPARSTE, nicht der Text: `auth-js` liest mit
  // `JSON.parse`, also ist die Reihenfolge der Felder ohne Bedeutung — ein
  // Textvergleich würde hier eine Ordnung verlangen, die niemand zugesagt hat.
  const zurueck = zusammensetzen(teile);
  pruef(
    `${name}: kommt vollständig zurück`,
    zurueck === null ? null : kanonisch(JSON.parse(zurueck)),
    kanonisch(s),
  );
}

console.log('\n── Beide Hälften gegen die 2048-Byte-Warnung ──');
{
  const teile = aufteilen(JSON.stringify(GOOGLE));
  const tresor = Buffer.byteLength(teile.tresor ?? '', 'utf8');
  const datei = Buffer.byteLength(teile.datei ?? '', 'utf8');
  console.log(`     Tresor ${tresor} B · Datei ${datei} B · ungeteilt wären es ${tresor + datei} B`);
  pruef('der Tresor-Teil bleibt unter 2048 B', tresor < 2048, true);
  // Der Beleg dafür, dass die Teilung überhaupt nötig war: ungeteilt ist es zu viel.
  pruef('ungeteilt wäre es über 2048 B gewesen', tresor + datei > 2048, true);
}

console.log('\n── Wenn nur eine Hälfte da ist (Ians zweiter Halbsatz) ──');
{
  const teile = aufteilen(JSON.stringify(GOOGLE));
  pruef('nur der Ausweis, kein Schlüssel → abgemeldet',
    zusammensetzen({ tresor: null, datei: teile.datei }), null);
  pruef('nur der Schlüssel, kein Ausweis → abgemeldet',
    zusammensetzen({ tresor: teile.tresor, datei: null }), null);
  pruef('gar nichts → abgemeldet', zusammensetzen({ tresor: null, datei: null }), null);
}

console.log('\n── Tresor heil, Datei kaputt (Ians Wahl A: nachsehen) ──');
// **Die Gegenprobe, auf die es bei DIESER Funktion ankommt.** Ohne sie besteht
// eine Fassung, die den Schlüssel ungeprüft in den Dateitext schreibt, jede
// andere Prüfung hier — gemessen am 2026-09-13: 24 Häkchen, 0 Kreuze. Ians
// Entscheidung wäre dann von nichts bewacht, und die nächste „Vereinfachung"
// nähme sie still zurück.
//
// Der Fall ist nicht ausgedacht, er steht in `lib/sitzungsspeicher.native.ts`:
// `setItem()` legt bei einer Sitzung OHNE Dauerschlüssel erst einen LEEREN Text
// in die Datei und löscht erst danach den Tresor. Stürzt die App dazwischen ab,
// liegt ein gültiger alter Schlüssel neben einem leeren Dateitext — und das ist
// eine halbe Sitzung, auch wenn beide Plätze belegt sind.
{
  const tresor = 'z3k9pq2mx7wt';
  for (const datei of ['', 'nicht-json', '"nur ein string"', '[1,2,3]', 'null']) {
    pruef(`Schlüssel + ${datei === '' ? '(leere Datei)' : datei} → abgemeldet`,
      zusammensetzen({ tresor, datei }), null);
  }
}

console.log('\n── Was keine Sitzung ist, ist keine Sitzung ──');
// Gemessen schreibt `auth-js` genau EINEN Schlüssel, und darunter steht immer
// eine Sitzung — ein Text ohne Dauerschlüssel kann hier also gar nicht
// auftauchen. Geprüft wird trotzdem, und zwar auf die EINE Regel ohne Ausnahme:
// Eine erste Fassung dieses Prüfstands verlangte hier, solcher Inhalt komme
// „unverändert zurück" — das widerspricht Ians zweitem Halbsatz, und zwei
// Regeln, die einander widersprechen, sind keine Regel.
for (const fremd of ['nicht-json', '"nur ein string"', '[1,2,3]', 'null', '{"a":1}']) {
  const teile = aufteilen(fremd);
  pruef(`${fremd} → nichts in den Tresor`, teile.tresor, null);
  pruef(`${fremd} → gilt als abgemeldet`, zusammensetzen(teile), null);
}

console.log(`\n════ ${haken} Häkchen · ${kreuze} Kreuze ════`);
if (kreuze > 0) {
  console.log('\nSteht `zusammensetzen()` noch auf dem TODO? Dann ist das erwartet —');
  console.log('die Funktion schreibt Ian selbst (PLAN.md, Abschnitt 6, Punkt 36).');
}
process.exit(kreuze > 0 ? 1 : 0);
