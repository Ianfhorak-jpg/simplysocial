/**
 * Warum es diese Datei gibt: `baseUrl` gilt NUR fürs Web.
 *
 * ── Der Fehler, gegen den sie gebaut ist (2026-09-07) ────────────────────────
 * In `app.json` steht `experiments.baseUrl: "/simplysocial"`. Das ist der
 * Unterordner, in dem GitHub Pages die Seite ausliefert — ohne ihn laden alle
 * Skripte von "/" und die Seite bleibt weiß. `scripts/deploy.sh` prüft den Wert
 * deshalb ausdrücklich, bevor es baut.
 *
 * Metro stellt dieselbe `baseUrl` aber auch beim **iOS-Embed** allen Asset-Pfaden
 * voran. Im App-Bundle entsteht dadurch ein Ordner `simplysocial/` — und der
 * kollidiert mit der Binärdatei `SimplySocial`, weil macOS Groß- und
 * Kleinschreibung nicht unterscheidet. Der Release-Build stirbt dann mit
 * `ENOTDIR: not a directory, mkdir …/SimplySocial.app/simplysocial/assets/…`,
 * und zwar NACH dem Bündeln, im Schritt „Copying 22 asset files".
 *
 * **Im Debug-Build fällt das nie auf**, weil dort keine Assets eingebacken werden
 * — das JavaScript kommt live vom Metro-Server. Deshalb lief der Simulator-Build
 * vom 2026-09-06 sauber durch und der erste RELEASE-Build ist gescheitert. Ohne
 * diese Datei wäre auch der App-Store-Build in Phase 21 daran gescheitert.
 *
 * ── Warum die Wahrheit trotzdem in `app.json` stehen bleibt ──────────────────
 * Sie ist dort für Menschen lesbar, und `deploy.sh` grept sie. Diese Datei nimmt
 * den Wert nur für alles heraus, was NICHT Web ist — `app.json` bleibt
 * unverändert, damit die Sicherung im Deploy-Skript weiter greift.
 *
 * ── Woran „ist das ein Web-Export?" erkannt wird ─────────────────────────────
 * An zwei Dingen, absichtlich doppelt: `deploy.sh` ruft `expo export --platform
 * web` auf (also steht es in `process.argv`), und es setzt zusätzlich
 * `SS_WEB_EXPORT=1`. Fällt eines der beiden bei einem Umbau weg, hält das andere.
 * Ein Dev-Server (`expo start --web`) braucht die baseUrl nicht — er liefert von
 * "/" aus.
 */

const WEB_BASIS = '/simplysocial';

function istWebExport() {
  if (process.env.SS_WEB_EXPORT === '1') return true;
  const argv = process.argv.join(' ');
  return argv.includes('export') && argv.includes('--platform web');
}

module.exports = ({ config }) => {
  const experiments = { ...config.experiments };

  if (istWebExport()) {
    experiments.baseUrl = WEB_BASIS;
  } else {
    delete experiments.baseUrl;
  }

  return { ...config, experiments };
};
