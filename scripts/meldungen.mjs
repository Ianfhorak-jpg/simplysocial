// ═══════════════════════════════════════════════════════════════════════════════
//  Aus Datenbankzeilen wird etwas, das ein Mensch entscheiden kann.
//  Aufgerufen von `meldungen.sh` — Phase 20.7.
//
//  ── Was diese Datei NICHT tut ───────────────────────────────────────────────
//  Sie entscheidet nichts. Die Frist kommt aus `features/safety/meldung.ts`
//  (Ians Entscheidung 59), die Wörter aus `config/melden.ts`. Hier steht nur,
//  wie es auf dem Schirm aussieht — dieselbe Trennung wie zwischen
//  `features/posts/karte.ts` und den zwei Kartenzeichnern (harte Regel 52).
// ═══════════════════════════════════════════════════════════════════════════════
import { readFileSync } from 'node:fs';

const ARBEIT = process.env.ARBEIT;
const ALLE = process.env.BEFEHL === 'alle';

const { meldungLage, fristStunden, fristEndeAm, istDringend, zusageText } = await import(
  `${ARBEIT}/js/features/safety/meldung.mjs`
);
const { MELDE_GRUENDE } = await import(`${ARBEIT}/js/config/melden.mjs`);
// Das `@` setzt dieselbe Funktion, die es auch in der App setzt — nicht ein
// `'@' + handle` hier. Beim ersten Lauf am 2026-09-13 stand hier genau das, und
// es kam `@@tobi` heraus: Die Prüfdaten trugen das Zeichen damals noch im WERT.
// Aus dem Schönheitsfehler wurde der Fund, dass zehn Screens es gar nicht setzen.
const { handleText } = await import(`${ARBEIT}/js/lib/handle.mjs`);

const zeilen = JSON.parse(readFileSync(`${ARBEIT}/meldungen.json`, 'utf8'));
const JETZT = new Date().toISOString();

// Die Wörter kommen aus derselben Liste, die dem Melder angezeigt wurde — und je
// nach Ziel ist es ein ANDERES Wort: `gefahr` heißt am Post „Könnte gefährlich
// werden" und am Menschen „Ich fühle mich unsicher". Wer hier eine eigene Tabelle
// hinschriebe, läse eine Meldung anders, als sie abgegeben wurde.
const grundWort = (zielArt, grund) =>
  MELDE_GRUENDE[zielArt]?.find((g) => g.wert === grund)?.label ?? grund;

const LAGE_MARKE = {
  ueberfaellig: '🔴 ÜBERFÄLLIG',
  faellig: '🟠 wird knapp',
  offen: '🟡 offen',
  erledigt: '✓  erledigt',
  'spaet-erledigt': '✓! erledigt, zu spät',
};

// Sortiert wird nach LAGE und dann nach Fälligkeit — nicht nach Eingang. Das ist
// die sichtbare Hälfte von Entscheidung 59: Eine Zusage, die nach Grund
// unterscheidet, muss in der Liste unterscheidbar sein, sonst ist sie nur ein
// Satz im Rechtstext. Der Index in 0009 steht aus demselben Grund auf
// (reason, created_at) statt auf (created_at desc).
const RANG = { ueberfaellig: 0, faellig: 1, offen: 2, 'spaet-erledigt': 3, erledigt: 4 };

const stunden = (von, bis) => (new Date(bis) - new Date(von)) / 3600_000;
const dauer = (h) => {
  const a = Math.abs(h);
  if (a < 1) return `${Math.round(a * 60)} min`;
  if (a < 48) return `${a.toFixed(a < 10 ? 1 : 0)} h`;
  return `${Math.round(a / 24)} Tage`;
};

const angereichert = zeilen
  .map((z) => {
    const lage = meldungLage(z.created_at, z.reason, z.erledigt_am, JETZT);
    return { ...z, lage, schluss: fristEndeAm(z.created_at, z.reason) };
  })
  .sort((a, b) => RANG[a.lage] - RANG[b.lage] || a.schluss.localeCompare(b.schluss));

// ── Das Ziel in einem Satz ──────────────────────────────────────────────────
//
// Der Fall „es gibt das Ziel nicht mehr" wird AUSGESPROCHEN und nicht durch eine
// leere Zeile angedeutet. `target_id` hat keinen Fremdschlüssel (polymorph), eine
// Meldung kann also ins Leere zeigen — und das ist kein Fehler, sondern der
// Normalfall, sobald jemand seinen gemeldeten Post löscht. Eine Meldung, deren
// Ziel weg ist, hat sich meistens von selbst erledigt; DASS sie es hat, muss aber
// jemand sehen können.
function ziel(z) {
  if (z.target_type === 'post') {
    if (!z.ziel_da_post) return '⌀ Post gibt es nicht mehr (gelöscht oder Konto weg)';
    const ort = z.district ? `${z.district} Wien` : 'Wien';
    return `Post „${z.title}" · ${z.category} · ${ort} · von ${handleText(z.post_autor)}`;
  }
  if (!z.ziel_da_user) return '⌀ Konto gibt es nicht mehr';
  return `${handleText(z.ziel_handle)} (${z.ziel_name})`;
}

// ═══════════════════════════════════════════════════════════════════════════════
console.log('');
console.log('════ MELDUNGEN ════════════════════════════════════════════════════════');
console.log(`  Zusage: ${zusageText()}`);
console.log(`  Stand:  ${new Date().toLocaleString('de-AT')}`);
console.log('');

if (angereichert.length === 0) {
  console.log(ALLE ? '  Es gibt keine Meldungen.' : '  Keine offenen Meldungen.');
  console.log('');
} else {
  for (const z of angereichert) {
    const marke = LAGE_MARKE[z.lage] ?? z.lage;

    console.log(`${marke}   ${z.id}`);
    console.log(`   Ziel     ${ziel(z)}`);
    console.log(
      `   Grund    ${grundWort(z.target_type, z.reason)}  (${z.reason} · Frist ` +
        `${fristStunden(z.reason)} h${istDringend(z.reason) ? ', dringend' : ''})`,
    );
    console.log(
      `   Von      ${z.melder_weg ? '— Melder hat sein Konto gelöscht' : handleText(z.melder)}` +
        `   ·   vor ${dauer(stunden(z.created_at, JETZT))}`,
    );

    if (z.erledigt_am) {
      // `hat_bearbeiter` wird getrennt mitgeholt: Seit 0009 steht `erledigt_von`
      // auf `on delete set null`, also ist „erledigt, aber von niemandem" ein
      // GÜLTIGER Zustand — der Bearbeiter hat sein Konto gelöscht. Ohne diese
      // Unterscheidung sähe das aus wie eine kaputte Zeile.
      const wer = z.hat_bearbeiter
        ? handleText(z.erledigt_von_handle)
        : '— Bearbeiter-Konto gelöscht';
      const spaet = stunden(z.schluss, z.erledigt_am);
      const wie = spaet > 0 ? `${dauer(spaet)} nach der Zusage` : 'innerhalb der Zusage';
      console.log(`   Erledigt ${wer}  ·  ${wie}`);
    } else {
      const rest = stunden(JETZT, z.schluss);
      console.log(
        `   Frist    ${rest >= 0 ? `noch ${dauer(rest)}` : `seit ${dauer(rest)} überschritten`}`,
      );
    }

    if (Number(z.anzahl_gegen_ziel) > 1) {
      // Die Zahl, die eine einzelne Meldung nicht hergibt. Fünf Meldungen wegen
      // `spam` gegen denselben Menschen sind etwas anderes als fünf verschiedene
      // Menschen mit je einer — und genau dafür gibt es die feste Gründeliste
      // statt Freitext (siehe den Kopf von `ReportReason`).
      console.log(`   ⚠  ${z.anzahl_gegen_ziel} Meldungen gegen dasselbe Ziel`);
    }
    if (z.note) {
      for (const zeile of z.note.split('\n')) console.log(`   │ ${zeile}`);
    }
    console.log('');
  }

  const offen = angereichert.filter((z) => !z.erledigt_am).length;
  const ueber = angereichert.filter((z) => z.lage === 'ueberfaellig').length;
  const spaet = angereichert.filter((z) => z.lage === 'spaet-erledigt').length;
  console.log('───────────────────────────────────────────────────────────────────────');
  console.log(`  ${angereichert.length} angezeigt · ${offen} offen · ${ueber} überfällig`);
  if (spaet > 0) console.log(`  ${spaet} wurden zu spät bearbeitet — die Zusage war zu knapp?`);
  console.log('');
  console.log('  Abhaken:  npm run meldungen -- erledigt <id> "was getan wurde"');
  console.log('');
}
