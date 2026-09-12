import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SsButton, SsInput, SsText } from '@/components/ui';
import { BRAND } from '@/config/brand';
import {
  ANMELDE_QUELLE,
  ANMELDE_WEGE,
  anmeldeFolgen,
  codeFehlerText,
} from '@/features/auth/anmeldung';
import { anmeldenMitCode, attrappeAnmelden, codeSchicken } from '@/features/auth/hooks';
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
  const [schritt, setSchritt] = useState<'wahl' | 'email' | 'code'>('wahl');
  const hinweise = [...new Set(ANMELDE_WEGE.map((weg) => anmeldeFolgen(weg).hinweis))].filter(
    Boolean,
  );

  return (
    <View
      style={[
        styles.huelle,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg },
      ]}>
      <View style={styles.kasten}>
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
                const { titel, bereit } = anmeldeFolgen(weg);
                return (
                  <SsButton
                    key={weg}
                    label={titel}
                    block
                    size="lg"
                    disabled={!bereit}
                    // Nur der E-Mail-Weg tut seit 20.3-b1 etwas. Die anderen beiden
                    // sind `disabled` und tragen den Satz aus `anmeldeFolgen()` —
                    // ein Knopf, der nichts tut UND nichts sagt, sieht aus wie ein
                    // Fehler (dieselbe Überlegung wie `schreibHuerdeText()`).
                    onPress={weg === 'email-code' ? () => setSchritt('email') : undefined}
                  />
                );
              })}
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
  schritt: 'email' | 'code';
  setSchritt: (s: 'wahl' | 'email' | 'code') => void;
}) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
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

  async function schicken() {
    if (laeuft) return;
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
      ) : (
        <>
          <SsText variant="caption" center color={colors.inkSoft}>
            Wir haben dir eine Zahl an {email.trim()} geschickt.
          </SsText>
          <SsInput
            label="Die Zahl aus der Mail"
            value={code}
            onChangeText={setCode}
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            onSubmitEditing={() => void pruefen()}
          />
          <SsButton
            label={laeuft ? 'Einen Moment …' : 'Weiter'}
            block
            size="lg"
            disabled={laeuft || code.trim().length === 0}
            onPress={() => void pruefen()}
          />
        </>
      )}

      {fehler ? (
        <SsText variant="caption" center color={status.danger}>
          {fehler}
        </SsText>
      ) : null}

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
  claim: { marginBottom: spacing.md },
  wege: { gap: spacing.md },
  weg: { gap: spacing.xs },
  attrappe: { marginTop: spacing.lg, gap: spacing.xs },
});
