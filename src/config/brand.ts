/**
 * Die EINZIGE Stelle, an der der Produktname steht.
 * Harte Regel aus CLAUDE.md — kein Screen tippt "SimplySocial" selbst.
 * Wenn der Name sich ändert oder das Logo vom Freund kommt: nur hier anfassen.
 */
export const BRAND = {
  name: 'SimplySocial',

  /** Kurzer Claim für Kopfzeile, Landing-Page und App-Store-Untertitel. */
  claim: 'Finde Leute, die jetzt Lust haben.',

  /** Ein Satz, der erklärt, was die App ist — für leere Zustände und Onboarding. */
  pitch: 'Poste, was du vorhast. Wer mitmachen will, meldet sich. Du entscheidest, wer dabei ist.',

  /**
   * Platzhalter-Wortmarke, bis das echte Logo da ist (siehe _FUER_IAN/OFFENE_SACHEN.md).
   * Zweigeteilt, damit die Wortmarke zweifarbig gesetzt werden kann: "Simply" + "Social".
   */
  wordmark: { first: 'Simply', second: 'Social' },

  /** Die Stadt, für die v1 gebaut ist. Steht im Feed-Header und in leeren Zuständen. */
  city: 'Wien',

  /**
   * Das Rechtliche — seit dem 2026-09-28, und jede Zeile ist gemessen oder Ians
   * Entscheidung, keine davon erfunden.
   *
   * ⚠️ **Die zwei Adressen stehen AUCH in `scripts/storetexte.md`** und von dort
   * im App-Store-Eintrag. Das ist eine Doppelung, die man kennen muss: Wer eine
   * davon umbenennt, benennt sie an BEIDEN Stellen um — sonst zeigt die App
   * woandershin als der Store, und ein toter Link ist ein Ablehnungsgrund
   * (Guideline 1.5). Zusammengeführt sind sie nicht, weil eine `.md`-Datei für
   * Apple und ein TypeScript-Modul für die App keine gemeinsame Quelle haben,
   * die ohne Bauschritt auskommt.
   */
  legal: {
    /**
     * Der rechtliche Betreiber. Am 2026-09-28 bei Apple abgefragt, nicht geraten:
     * Das Entwicklerprogramm läuft auf diese Person (`ACCOUNT_HOLDER`, `ADMIN`).
     * ⚠️ Ändert sich das Apple-Konto, ändert sich DIESE Zeile mit — und das
     * `copyright` in `scripts/storetexte.md` ebenso.
     */
    betreiber: 'Ian Faye Horak',
    kontakt: 'ian.fhorak@gmail.com',

    /** Die Datenschutzerklärung. Steht bei Apple als `privacyPolicyUrl`. */
    datenschutzUrl: 'https://ianfhorak-jpg.github.io/simplysocial-landing/datenschutz.html',
    /** Hilfe und Kontakt. Steht bei Apple als `supportUrl`. */
    hilfeUrl: 'https://ianfhorak-jpg.github.io/simplysocial-landing/hilfe.html',

    /**
     * Apples Standard-Lizenzvertrag. **Das ist kein Notbehelf, sondern der
     * vorgesehene Weg:** Apple verlangt eine EULA und stellt für alle, die keine
     * eigene haben, diese hier — sie gilt automatisch, wenn man keine andere
     * angibt. Sie zu verlinken behauptet also nichts, was nicht ohnehin gälte.
     * ⚠️ Sie ersetzt NICHT die eigenen Hausregeln (die sechs Regeln im Screen)
     * und nicht die Datenschutzerklärung.
     */
    eulaUrl: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',

    /**
     * Ab wann man mitmachen darf. **Seit dem 2026-10-20 14** (vorher 13).
     *
     * 🔴 **Warum 14:** In Österreich braucht man bis zum vollendeten 14.
     * Lebensjahr die Zustimmung der Eltern, damit Daten verarbeitet werden dürfen
     * (§ 4 Abs. 4 DSG). Diese Zustimmung kann die App nicht belegen — „frag deine
     * Eltern" war ein Satz ohne Prüfung. Ab 14 entfällt sie, und die Zahl stimmt mit
     * dem Jahrgangs-Schieber überein (`MINDESTALTER = 14` in `config/alter.ts`):
     * Vorher konnte ein 13-Jähriger seinen Jahrgang gar nicht eintragen, obwohl die
     * Bedingungen ihn einluden. **Eine Zahl, drei Stellen, jetzt alle gleich.**
     *
     * Die Altersfreigabe bei Apple (13+) bleibt darunter: Sie ist die ALTERSGRENZE
     * des Stores, 14 die der App — die engere gilt.
     */
    mindestalter: 14,
  },
} as const;
