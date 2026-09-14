import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SsButton, SsInput, SsText } from '@/components/ui';
import { BRAND } from '@/config/brand';
import {
  type Anbieter,
  AnbieterFehler,
  anbieterFehlerText,
  ANMELDE_QUELLE,
  ANMELDE_WEGE,
  anmeldeFolgen,
  CODE_MAX,
  CODE_MIN,
  codeFehlerText,
} from '@/features/auth/anmeldung';
import {
  anmeldenAlsDemo,
  anmeldenMitAnbieter,
  anmeldenMitCode,
  attrappeAnmelden,
  codeSchicken,
  useSitzung,
} from '@/features/auth/hooks';
import { istDemoZugang, passwortFehlerText } from '@/features/auth/demo';
import { anbieterLage } from '@/lib/anmelde-anbieter';
import { LOESCH_QUITTUNG } from '@/features/safety/konto';
import { KontoFehler } from '@/features/auth/konten';
import { categoryColors, colors, MAX_CONTENT_WIDTH, radius, spacing, status } from '@/theme';

/**
 * Der Weg hinein — Phase 20.3.
 *
 * ── Warum das eine KOMPONENTE ist und keine Route ─────────────────────────────
 * `app/_layout.tsx` zeichnet sie ANSTELLE des Stacks, wenn niemand angemeldet ist.
 * Eine Route `/anmelden` wäre der naheliegende Weg und hat zwei Nachteile, die beide
 * erst später auffallen:
 *
 *   1. **Die Adresse würde verlorengehen.** Seit Phase 8 kann jeder Bildschirm der
 *      erste sein, den jemand öffnet (harte Regel 5). Wer einen Link auf `/post/p1`
 *      bekommt und nicht angemeldet ist, soll nach dem Anmelden BEI `/post/p1`
 *      landen. Wird hier nicht navigiert, bleibt die Adresse einfach stehen und der
 *      Stack löst sie auf, sobald er kommt. Ein Umweg über `/anmelden` müsste sich
 *      das Ziel merken und danach dorthin zurückspringen — zwei Zustände statt keinem.
 *   2. **Eine Route wäre umgehbar.** Solange die Screens im Baum hängen, zeichnen sie
 *      — und jeder, der `useCurrentUserId()` ruft, wirft. Der Torwächter muss sie
 *      GAR NICHT ERST zeichnen, und das kann nur die Ebene über dem Stack.
 *
 * ── Was hier NICHT steht ──────────────────────────────────────────────────────
 * Die Frage nach dem Heimatbezirk (Ians Entscheidung 64: *„man gibt am Anfang seinen
 * Bezirk an"*). Sie gehört hierher, sobald es ein NEUES Konto gibt — heute meldet
 * sich die Attrappe als ein Mensch an, der seinen Bezirk längst hat, und ein Schritt,
 * der etwas Beantwortetes fragt, ist kein Beleg für den Schritt. Er kommt in 20.3-b,
 * zusammen mit dem ersten echten Konto. Die Regel dazu steht schon geschrieben, im
 * Kopf von `features/auth/anmeldung.ts`.
 *
 * Und der Standort steht hier ausdrücklich nicht: `STANDORT_FRAGE = 'einstellung'`
 * (Ians Entscheidung 70). iOS fragt EINMAL — wer hier wegdrückt, drückt für immer weg.
 */
export function Anmelden() {
  const insets = useSafeAreaInsets();
  // `'wahl'` → `'email'` → `'code'`. Ein Schritt je Bildschirm, und der Rückweg ist
  // immer da: Wer sich in der Adresse vertippt hat, merkt es erst, wenn keine Mail
  // kommt — ohne „Andere Adresse" säße er dann fest und müsste die App neu laden.
  //
  // `'passwort'` ist seit Phase 21.5 die vierte Stellung und **kein vierter Weg**:
  // Man kommt nur dorthin, wenn im Adressfeld die eine Demo-Adresse steht
  // (`istDemoZugang()`), und für alle anderen ändert sich kein Bildpunkt. Warum es
  // diesen Zugang überhaupt gibt und warum er nicht unter Apples 2.3.1 fällt,
  // steht ausgeschrieben in `features/auth/demo.ts`.
  const [schritt, setSchritt] = useState<'wahl' | 'email' | 'code' | 'passwort'>('wahl');
  const sitzung = useSitzung();
  // Ians Entscheidung 52: Wer sein Konto gelöscht hat, liest hier die Quittung.
  //
  // **Nur im Schritt `'wahl'`** — aus demselben Grund wie die Hinweise weiter unten
  // (harte Regel 63): Wer schon auf „Mit E-Mail anmelden" getippt hat, legt gerade
  // ein neues Konto an, und ein Satz über das alte steht dann im Weg. Der Zustand
  // in der Sitzung bleibt trotzdem stehen — er ist die Antwort auf „was ist gerade
  // passiert?", nicht auf „was tue ich jetzt?".
  const quittung =
    schritt === 'wahl' && sitzung.zustand === 'aus' && sitzung.grund === 'konto-geloescht';

  // Was dieses Gerät kann — EINMAL gelesen und nicht je Knopf. Die Antwort
  // hängt an der Plattform und ändert sich innerhalb einer Sitzung nie; ein
  // Aufruf je Zeile wäre dieselbe Verschwendung wie ein `useCurrentUserId()`
  // je Listenzeile (Phase 20.3-a).
  const lage = useMemo(() => anbieterLage(), []);

  // Welcher Anbieter-Knopf gerade wartet, und was danebensteht. Beides liegt
  // HIER und nicht in einem Knopf: Während Apple läuft, darf Google nicht auch
  // noch losgehen — zwei offene Anmeldedialoge sind ein Zustand, aus dem man
  // nur durch Neustart herauskommt.
  const [laeuft, setLaeuft] = useState<Anbieter | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  async function ueberAnbieter(weg: Anbieter) {
    if (laeuft) return;
    setLaeuft(weg);
    setFehler(null);
    try {
      await anmeldenMitAnbieter(weg);
      // Kein `setLaeuft(null)`: Der Torwächter tauscht diesen Bildschirm im
      // selben Augenblick aus — ein `setState` danach ist eine Warnung ohne
      // Adressaten. Dieselbe Stelle und derselbe Grund wie in `pruefen()`.
    } catch (f) {
      // Ein Abbruch ist keine Fehlermeldung wert: `anbieterFehlerText` gibt
      // dafür `null`, und dann steht danach nichts da. Wer den Apple-Dialog
      // wegwischt, hat entschieden — eine rote Zeile würde behaupten, es sei
      // etwas schiefgegangen (Ians Entscheidung 43, dieselbe Familie).
      const code = f instanceof AnbieterFehler ? f.code : 'unbekannt';
      console.warn(String(f));
      setFehler(anbieterFehlerText(code));
      setLaeuft(null);
    }
  }

  const hinweise = [...new Set(ANMELDE_WEGE.map((weg) => anmeldeFolgen(weg, lage).hinweis))].filter(
    Boolean,
  );

  return (
    <View
      style={[
        styles.huelle,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg },
      ]}>
      <View style={styles.kasten}>
        {/* ÜBER der Wortmarke und nicht darunter: Sie ist die Antwort auf den
            letzten Klick und gehört an die Stelle, auf die das Auge zuerst fällt.
            Unter der Marke stünde sie da, wo sonst der Claim steht — also da, wo
            man Werbung erwartet und nicht eine Quittung. */}
        {quittung ? (
          <View style={styles.quittung}>
            <SsText variant="bodyStrong" center>
              {LOESCH_QUITTUNG}
            </SsText>
          </View>
        ) : null}
        <SsText variant="display" center>
          <SsText variant="display" color={colors.ink}>
            {BRAND.wordmark.first}
          </SsText>
          {/* Dieselbe Farbe wie im Startbild (`app/+html.tsx`) und auf der
              Landing-Page: die Wortmarke ist an allen drei Orten dieselbe, sonst
              wechselt sie beim ausgeloggten Kaltstart mitten im Bildaufbau. */}
          <SsText variant="display" color={categoryColors.creative.base}>
            {BRAND.wordmark.second}
          </SsText>
        </SsText>
        <SsText variant="body" center color={colors.inkSoft} style={styles.claim}>
          {BRAND.claim}
        </SsText>

        {schritt === 'wahl' ? (
          <>
            <View style={styles.wege}>
              {ANMELDE_WEGE.map((weg) => {
                const { titel, bereit } = anmeldeFolgen(weg, lage);
                const wartet = laeuft === weg;
                return (
                  <SsButton
                    key={weg}
                    label={wartet ? 'Einen Moment …' : titel}
                    block
                    size="lg"
                    // `laeuft` sperrt ALLE drei, nicht nur den laufenden: Während
                    // der Anmeldedialog offen ist, darf daneben kein zweiter Weg
                    // anfangen. Ein Knopf, der nicht kann, bleibt ohnehin gesperrt
                    // und trägt den Satz aus `anmeldeFolgen()` — ein Knopf, der
                    // nichts tut UND nichts sagt, sieht aus wie ein Fehler
                    // (dieselbe Überlegung wie `schreibHuerdeText()`).
                    disabled={!bereit || laeuft !== null}
                    onPress={
                      weg === 'email-code'
                        ? () => setSchritt('email')
                        : () => void ueberAnbieter(weg)
                    }
                  />
                );
              })}
              {fehler ? (
                <SsText variant="caption" center color={status.danger}>
                  {fehler}
                </SsText>
              ) : null}
            </View>
            {/* Die Hinweise stehen nur bei der WAHL. In den beiden Schritten danach
                wäre „Apple kommt als Nächstes" ein Satz über etwas, das gerade
                niemanden beschäftigt — harte Regel 63. */}
            {hinweise.map((satz) => (
              <SsText key={satz} variant="caption" center color={colors.inkSoft}>
                {satz}
              </SsText>
            ))}
          </>
        ) : (
          <EmailWeg schritt={schritt} setSchritt={setSchritt} />
        )}

        {/* Die Hinweise stehen EINMAL je verschiedenem Satz unter der ganzen Gruppe,
            nicht je Knopf. Heute sagen alle drei dasselbe („kommt mit dem Konto"),
            und dreimal derselbe Satz ist genau das, wogegen Entscheidung 50 gebaut
            ist — nachgemessen kostete er auf 360 × 600 zwölf Bildpunkte zu viel und
            schob den Kasten über beide Kanten hinaus. In 20.3-b werden es von selbst
            weniger: Was fertig ist, bringt gar keinen Hinweis mehr mit. */}
        {/* Der Weg, den es nur im Prototyp gibt. Er steht ABGESETZT unter den drei
            echten und nicht zwischen ihnen: Sonst sähe die Anordnung aus wie vier
            gleichwertige Anmeldewege, und genau das ist er nicht. */}
        {ANMELDE_QUELLE === 'attrappe' && schritt === 'wahl' ? (
          <View style={styles.attrappe}>
            <SsButton
              label="Weiter als Ian"
              variant="ghost"
              block
              onPress={attrappeAnmelden}
            />
            <SsText variant="caption" center color={colors.inkSoft}>
              Im Prototyp gibt es keine Konten — das ist der einzige Weg hinein.
            </SsText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/**
 * Die zwei Schritte des E-Mail-Wegs — Adresse, dann Zahl.
 *
 * ── Warum ZWEI Schritte und nicht ein Feld mit zwei Zeilen ───────────────────
 * Weil dazwischen etwas passiert, das nicht in der App stattfindet: Man wechselt
 * ins Mailprogramm. Ein Bildschirm, auf dem beide Felder stehen, sieht beim ersten
 * Blick aus, als müsste man beides schon wissen. Harte Regel 63 in ihrer ersten
 * Richtung — der Bildschirm zeigt, was für die Entscheidung HIER nötig ist.
 *
 * ── Und warum der Rückweg an beiden Stellen dasteht ──────────────────────────
 * Ein Tippfehler in der Adresse fällt erst dadurch auf, dass keine Mail kommt.
 * Ohne „Andere Adresse" wäre der einzige Ausweg, die App neu zu laden — und auf
 * Native gibt es das nicht einmal.
 */
function EmailWeg({
  schritt,
  setSchritt,
}: {
  schritt: 'email' | 'code' | 'passwort';
  setSchritt: (s: 'wahl' | 'email' | 'code' | 'passwort') => void;
}) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [passwort, setPasswort] = useState('');
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  // Ein `KontoFehler` trägt einen `code` und ist damit beantwortbar; alles andere
  // ist ein PROGRAMMfehler und soll laut sein statt als „kein Netz" verkleidet.
  // Dieselbe Unterscheidung wie in `datenHolen()` zwischen `LadeFehler` und Rest.
  function melden(f: unknown) {
    if (f instanceof KontoFehler) {
      console.warn(f.message);
      setFehler(codeFehlerText(f.code));
      return;
    }
    console.warn(String(f));
    setFehler(codeFehlerText('unbekannt'));
  }

  /**
   * Was der Knopf unter dem Adressfeld tut — **die einzige Verzweigung im ganzen
   * Demo-Zugang.**
   *
   * Für jeden Menschen ist das „Code schicken". Für die eine Demo-Adresse ist es
   * ein Schritt weiter, und zwar OHNE Netz: Es wird nichts angefordert, weil es
   * nichts anzufordern gibt — `demo@simplysocial.invalid` hat kein Postfach und
   * kann per RFC 2606 nie eines haben (siehe `demo.ts`). Ein `codeSchicken()`
   * hier wäre eine Mail an ein Nichts, ein Bounce bei Brevo und ein Bildschirm,
   * der dem Reviewer sagt, er solle in seinem Postfach nachsehen.
   */
  async function schicken() {
    if (laeuft) return;
    // Der Sprung passiert VOR `setLaeuft(true)`: Er ist ein Bildschirmwechsel und
    // kein Vorgang, und ein „Wird geschickt …" für eine Zehntelsekunde wäre eine
    // Rückmeldung über etwas, das gar nicht stattfindet.
    if (istDemoZugang(email)) {
      setFehler(null);
      setSchritt('passwort');
      return;
    }
    setLaeuft(true);
    setFehler(null);
    try {
      await codeSchicken(email);
      setSchritt('code');
    } catch (f) {
      melden(f);
    } finally {
      setLaeuft(false);
    }
  }

  /**
   * Der Demo-Zugang einlösen — Phase 21.5.
   *
   * Wort für Wort gebaut wie `pruefen()` daneben, mit zwei Unterschieden, und
   * beide sind begründet:
   *   · `passwortFehlerText()` statt `codeFehlerText()` — andere Codes, andere
   *     nächste Handlung (siehe `demo.ts`).
   *   · Kein `setLaeuft(false)` im Erfolgsfall, weil der Torwächter diesen
   *     Bildschirm im selben Augenblick austauscht. Dieselbe Stelle und derselbe
   *     Grund wie oben.
   */
  async function demoPruefen() {
    if (laeuft) return;
    setLaeuft(true);
    setFehler(null);
    try {
      await anmeldenAlsDemo(email, passwort);
    } catch (f) {
      // Ein `KontoFehler` ist beantwortbar; alles andere ist der Riegel aus
      // `demoAnmelden()` und damit ein PROGRAMMfehler (harte Regel 103) — er
      // soll laut in der Konsole stehen und nicht als „kein Netz" verkleidet.
      if (f instanceof KontoFehler) {
        console.warn(f.message);
        setFehler(passwortFehlerText(f.code));
      } else {
        console.warn(String(f));
        setFehler(passwortFehlerText('unbekannt'));
      }
      setLaeuft(false);
    }
  }

  async function pruefen() {
    if (laeuft) return;
    setLaeuft(true);
    setFehler(null);
    try {
      await anmeldenMitCode(email, code);
      // Kein `setLaeuft(false)`: Der Torwächter tauscht diesen Bildschirm im selben
      // Augenblick aus — ein `setState` danach ist eine Warnung ohne Adressaten.
    } catch (f) {
      melden(f);
      setLaeuft(false);
    }
  }

  return (
    <View style={styles.wege}>
      {schritt === 'email' ? (
        <>
          <SsInput
            label="Deine E-Mail"
            value={email}
            onChangeText={setEmail}
            placeholder="du@beispiel.at"
            keyboardType="email-address"
            autoFocus
            onSubmitEditing={() => void schicken()}
          />
          <SsButton
            label={laeuft ? 'Wird geschickt …' : 'Code schicken'}
            block
            size="lg"
            disabled={laeuft || email.trim().length === 0}
            onPress={() => void schicken()}
          />
        </>
      ) : schritt === 'passwort' ? (
        /* Der Demo-Zugang. Diesen Zweig sieht genau ein Mensch — der Apple-Reviewer
           —, und er sieht ihn nur, weil er die Adresse aus dem Feld „App Review
           Information" abgetippt hat. Alles hier ist auf diesen einen Durchgang
           gebaut: keine Erklärung, warum es das Feld gibt (er weiß es), kein
           „Passwort vergessen" (es gibt nichts zurückzusetzen, das Konto legt
           `supabase/demo/anlegen.sh` an) und kein Hinweis auf den Code-Weg (für
           diese Adresse gibt es keinen). Harte Regel 63. */
        <>
          <SsText variant="caption" center color={colors.inkSoft}>
            Demo-Zugang für {email.trim()}
          </SsText>
          <SsInput
            label="Passwort"
            value={passwort}
            onChangeText={setPasswort}
            // Nicht getrimmt und nicht gefiltert — anders als beim Code eine Zeile
            // tiefer. Ein Leerzeichen ist dort ein Kopierfehler und hier ein
            // Zeichen des Passworts; wer es wegschneidet, macht aus einem gültigen
            // still ein anderes. Dieselbe Entscheidung steht in `demoAnmelden()`.
            secureTextEntry
            autoFocus
            onSubmitEditing={() => void demoPruefen()}
          />
          <SsButton
            label={laeuft ? 'Einen Moment …' : 'Anmelden'}
            block
            size="lg"
            disabled={laeuft || passwort.length === 0}
            onPress={() => void demoPruefen()}
          />
        </>
      ) : (
        <>
          <SsText variant="caption" center color={colors.inkSoft}>
            Wir haben dir eine Zahl an {email.trim()} geschickt.
          </SsText>
          <SsInput
            label="Die Zahl aus der Mail"
            value={code}
            // Nur Ziffern, und NICHT abgeschnitten: `maxLength` steht auf dem, was
            // Supabase höchstens schicken kann (CODE_MAX), nicht auf dem, was wir
            // erwarten. Der Filter ist trotzdem da, weil beim Kopieren aus einer
            // Mail gern ein Leerzeichen mitkommt — und ein unsichtbares Zeichen im
            // Code ist genau die Sorte Fehler, die als „Code falsch" erscheint.
            onChangeText={(wert) => setCode(wert.replace(/\D/g, ''))}
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={CODE_MAX}
            autoFocus
            onSubmitEditing={() => void pruefen()}
          />
          <SsButton
            label={laeuft ? 'Einen Moment …' : 'Weiter'}
            block
            size="lg"
            disabled={laeuft || code.trim().length < CODE_MIN}
            onPress={() => void pruefen()}
          />
        </>
      )}

      {fehler ? (
        <SsText variant="caption" center color={status.danger}>
          {fehler}
        </SsText>
      ) : null}

      {/* Der Rückweg ist an ALLEN drei Stellen da, und aus demselben Grund wie seit
          20.3-b1: Ein Tippfehler in der Adresse fällt erst dadurch auf, dass nichts
          kommt. Beim Demo-Zugang wiegt das schwerer als sonst — wer sich dort
          vertippt, landet im Passwort-Schritt eines Kontos, das er nicht meint,
          und ohne diesen Knopf säße ausgerechnet der Reviewer fest. */}
      <SsButton
        label={schritt === 'email' ? 'Doch anders anmelden' : 'Andere Adresse'}
        variant="ghost"
        block
        onPress={() => {
          setFehler(null);
          setSchritt(schritt === 'email' ? 'wahl' : 'email');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Ausgeschriebene Kanten statt `absoluteFill` — das ist eine registrierte Style-ID
  // und lässt sich nicht mit eigenen Werten mischen (ACTA-Falle, siehe CLAUDE.md).
  huelle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  kasten: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  /**
   * Abgesetzt durch eine Linie darunter, nicht durch eine Farbe.
   *
   * `status.danger` wäre der naheliegende Griff und ist falsch: Das Rot gehört in
   * dieser App dem Absagen, Blockieren und Melden (siehe den Kommentar an der Farbe
   * in `theme/colors.ts`). Ein gelöschtes Konto ist keine Warnung mehr — es IST
   * schon passiert, und zwar genau so, wie der Mensch es zweimal bestätigt hat.
   */
  quittung: {
    paddingBottom: spacing.md,
    marginBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  claim: { marginBottom: spacing.md },
  wege: { gap: spacing.md },
  weg: { gap: spacing.xs },
  attrappe: { marginTop: spacing.lg, gap: spacing.xs },
});
