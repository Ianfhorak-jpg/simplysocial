/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  WO DIE ANMELDUNG AUF DEM GERÄT LIEGT — Phase 20.3-b2
 *  Ians Entscheidung 55 (2026-09-13). Nicht ohne Rückfrage ändern.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Dieselbe Bauart wie `safety/block.ts` (harte Regel 17), `groups/gruppe.ts` (32),
 * `requests/kollision.ts` (46), `posts/standort.ts` (68), `auth/anmeldung.ts` (69),
 * `data/quelle.ts` (76), `auth/konto.ts` (78), `data/schreiben.ts` (84) und
 * `social/bild.ts` (88): **Screens lesen hier nie etwas.** Sie sehen nur das
 * Ergebnis, nämlich dass man nach dem Schließen der App noch angemeldet ist.
 *
 * ── Warum es die Datei überhaupt gibt ────────────────────────────────────────
 * Bis 20.3-b1 stand in `lib/supabase.ts` `persistSession: true`, und das war im
 * Browser vollständig und am iPhone folgenlos: `auth-js` sucht sich seinen
 * Speicher selbst, findet auf React Native kein `localStorage` und fällt **still
 * auf den Arbeitsspeicher zurück** — kein Absturz, keine Warnung, die Sitzung
 * überlebt nur den Neustart nicht. Der Speicher muss also von aussen kommen.
 *
 * ── Der Fund, aus dem die Entscheidung wurde — GEMESSEN am echten Server ─────
 * `auth-js` legt genau EINEN Schlüssel ab (`sb-<ref>-auth-token`), und darin
 * steht die ganze Sitzung als schlichtes JSON. Gemessen am 2026-09-13, mit einem
 * Client, dem eine Speicher-Attrappe untergeschoben wurde (dieselbe Methode wie
 * in 20.5-c — nachsehen, was die Bibliothek WIRKLICH schreibt, statt es aus
 * ihrem Quelltext zu schließen):
 *
 *     E-Mail-Konto, leeres user_metadata     1412 B    69 % der Warngrenze
 *     Google-/Apple-Konto                    2473 B   121 % der Warngrenze
 *       davon access_token                   1390 B   (läuft nach 1 h ab)
 *       davon user                            942 B   (Name, Bild, Anbieter-ID)
 *       davon refresh_token                    14 B   ← der eigentliche Schlüssel
 *
 * **Der teuerste Teil des Fundes ist die VERTEILUNG, nicht die Zahl.** Der
 * naheliegende Weg — die ganze Sitzung in `expo-secure-store` — läuft bei einem
 * E-Mail-Konto tadellos und trifft bei Google und Apple die 2048-Byte-Warnung von
 * Expo. Also genau bei den zwei Wegen, um die 20.3-b2 überhaupt geht, und NICHT
 * bei dem, mit dem man selbst testet. Dieselbe Familie wie „ein iPhone-Foto ist
 * HEIC" (20.6-b) und „wer nie ein Profilbild hatte" (20.6-c): **der Normalfall
 * fällt aus, der eigene Fall läuft.**
 *
 * Und die Meldung dazu hilft niemandem: `SecureStoreModule.swift` prüft **keine
 * Größe** (nachgesehen, nicht vermutet — es gibt im ganzen Paket keine `2048`).
 * Es reicht die Bytes an den iOS-Schlüsselbund weiter und wirft bei Ablehnung
 * `KeyChainException(status)`, also eine nackte Zahl ohne Grund, auf einem Gerät,
 * bei dem man nicht danebensteht.
 *
 * ── Ians Entscheidung 55: GETEILT ────────────────────────────────────────────
 * Die 14 Byte, die dauerhaft ins Konto lassen, kommen in den Schlüsselbund; die
 * 2459 Byte, die nach einer Stunde wertlos sind, in eine gewöhnliche Datei.
 * Beide Hälften sind damit gemessen weit unter jeder Grenze, und der Gewinn ist
 * nicht die Größe, sondern was ein Diebstahl noch wert ist: **eine Stunde statt
 * für immer.**
 *
 * Verworfen, beide samt Grund, als Gedächtnis und nicht als Einladung:
 *
 * **A) Alles in den Schlüsselbund.** Der sicherste Ort, den iOS hat — und
 *    gemessen 121 % der Warngrenze. Ob ein echtes iPhone das annimmt, ist vom Mac
 *    aus PRINZIPIELL nicht zu messen; es entscheidet sich am Gerät, und wenn es
 *    schiefgeht, steht dort eine Zahl. Ein Zustand, den man nur beim Nutzer sieht,
 *    ist keiner, den man annimmt.
 *
 * **C) Alles in eine gewöhnliche Datei.** Läuft garantiert, am wenigsten Code —
 *    und legt den Dauerschlüssel unverschlüsselt in den App-Ordner. iOS sperrt
 *    den gegen andere Apps ab; wer aber ein entsperrtes oder geknacktes Handy in
 *    die Hand bekommt, bleibt drin, bis sich jemand abmeldet.
 *
 * ── Was diese Datei NICHT tut, und das ist Absicht ───────────────────────────
 * Sie fasst weder `expo-secure-store` noch `AsyncStorage` an. Sie enthält
 * ausschließlich die REGEL — was wohin gehört und was eine halbe Sitzung
 * bedeutet — und importiert nur Typen. Damit läuft sie in blankem Node und ist
 * ohne Gerät und ohne Datenbank prüfbar (dieselbe Bauart wie `lib/base64.ts` und
 * `data/zeilen.ts`, siehe die Falle „ein `import type` erzeugt keine
 * Abhängigkeit"). Die zwei Bausteine kommen in `lib/sitzungsspeicher.native.ts`
 * dazu, und **nur dort**, weil sie beim Laden nativ werden (harte Regel 61).
 */

/**
 * Wie die Sitzung auf dem Gerät verteilt wird. Ians Entscheidung 55.
 *
 * Ein Wort, und daran hängt die ganze Datei — wie `BLOCK_WIRKUNG`,
 * `SCHREIB_REGEL` und `BILD_SICHT`.
 */
export const SITZUNG_TEILUNG: 'dauerschluessel-getrennt' | 'alles-tresor' | 'alles-datei' =
  'dauerschluessel-getrennt';

/**
 * Das eine Feld, das in den Schlüsselbund geht.
 *
 * **Warum ausgerechnet dieses und kein zweites:** `refresh_token` ist der
 * einzige Wert der Sitzung ohne Ablaufdatum — mit ihm holt man sich beliebig
 * viele neue Ausweise. Alles andere ist entweder in einer Stunde wertlos
 * (`access_token`, `expires_at`) oder steht ohnehin in `profiles` und damit in
 * der App auf dem Bildschirm (`user`). Ein Feld mehr im Tresor kostet Größe und
 * gewinnt nichts.
 */
export const TRESOR_FELD = 'refresh_token' as const;

/**
 * Was eine HALBE Sitzung bedeutet — Ians Entscheidung 55, zweiter Halbsatz.
 *
 * Der Fall ist nicht ausgedacht: Zwei Speicher heißen zwei Schreibvorgänge, und
 * dazwischen kann die App abstürzen, der Platz ausgehen oder iOS den Zugriff
 * verweigern. Danach liegt ein Ausweis ohne Dauerschlüssel da — oder umgekehrt.
 *
 * `'abgemeldet'` heißt: Es wird gar nichts zurückgegeben, die Person meldet sich
 * neu an. Die Alternative wäre gewesen, mit der vorhandenen Hälfte
 * weiterzumachen, und die ist in BEIDE Richtungen schlecht: Nur der Ausweis
 * ergibt eine Sitzung, die nach einer Stunde stirbt und dabei aussieht wie ein
 * Fehler; nur der Dauerschlüssel ergibt einen `auth-js`-Zustand, den es in seinem
 * eigenen Typ gar nicht gibt.
 */
export const HALBE_SITZUNG: 'abgemeldet' = 'abgemeldet';

/** Die zwei Hälften. `null` heißt „an diesem Ort liegt nichts". */
export type SitzungsTeile = {
  /** Der Dauerschlüssel für den Schlüsselbund — 14 B gemessen. */
  tresor: string | null;
  /** Der Rest als JSON für die gewöhnliche Datei — 2459 B gemessen. */
  datei: string | null;
};

/**
 * Aus dem, was `auth-js` schreibt, die zwei Hälften machen.
 *
 * **Kommt etwas herein, das kein Sitzungs-JSON ist, geht nichts in den Tresor** —
 * und damit gilt es beim Lesen als abgemeldet. Das ist keine Ausnahme, sondern
 * dieselbe Regel: *Was keinen Dauerschlüssel hat, ist keine Sitzung.*
 *
 * Eine erste Fassung ließ solchen Inhalt „unverändert durch". Das klang
 * vorsichtig und war ein zweiter, widersprechender Weg durch dieselbe Funktion —
 * gefunden hat es der Prüfstand, indem beide Zusagen nebeneinander rot wurden.
 * Gemessen schreibt `auth-js` ohnehin genau EINEN Schlüssel, und darunter steht
 * immer eine Sitzung: Der Fall, für den die Nachsicht gedacht war, kommt nicht
 * vor (die 18d-Lehre — eine Regel, die nichts vorfindet, sieht aus wie eine, die
 * tut).
 */
export function aufteilen(roh: string): SitzungsTeile {
  let sitzung: Record<string, unknown>;
  try {
    const geparst: unknown = JSON.parse(roh);
    if (geparst === null || typeof geparst !== 'object' || Array.isArray(geparst)) {
      return { tresor: null, datei: roh };
    }
    sitzung = geparst as Record<string, unknown>;
  } catch {
    return { tresor: null, datei: roh };
  }

  const schluessel = sitzung[TRESOR_FELD];
  if (typeof schluessel !== 'string' || schluessel.length === 0) {
    // Eine Sitzung ohne Dauerschlüssel gibt es bei `signInWithPassword` und
    // `verifyOtp` nicht — aber `auth-js` schreibt denselben Schlüssel auch bei
    // einem Zwischenstand. Nichts in den Tresor zu legen ist dann richtig.
    return { tresor: null, datei: roh };
  }

  const ohneSchluessel = { ...sitzung };
  delete ohneSchluessel[TRESOR_FELD];
  return { tresor: schluessel, datei: JSON.stringify(ohneSchluessel) };
}

/**
 * Aus den zwei Hälften wieder das machen, was `auth-js` erwartet.
 *
 * Gibt `null` zurück, wenn daraus keine vollständige Sitzung wird — `auth-js`
 * liest das als „niemand angemeldet" und zeigt den Anmelde-Bildschirm.
 *
 * TODO(Ian): Diese Funktion schreibt Ian selbst — siehe PLAN.md, Abschnitt 6,
 * Punkt 36. Vorbereitet ist alles drumherum; hier steckt das Urteil.
 */
export function zusammensetzen(teile: SitzungsTeile): string | null {
  // TODO(Ian)
  void teile;
  return null;
}
