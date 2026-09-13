import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SsButton, SsIcon, SsText } from '@/components/ui';
import { ANMELDE_QUELLE } from '@/features/auth/anmeldung';
import { accent, colors, MAX_CONTENT_WIDTH, radius, spacing } from '@/theme';

/**
 * Der Satz, den jeder braucht, der den Link bekommt — einmal, dann nie wieder.
 *
 * ── Warum es ihn ab Phase 8 gibt ──────────────────────────────────────────────
 * Bis jetzt hat den Prototyp nur angeschaut, wer daneben saß und die Erklärung
 * mitgeliefert bekam. Ab dem Deploy ist er ein Link in einer WhatsApp-Gruppe, und
 * Links werden weitergeleitet — die Erklärung nicht. Zwei Dinge fallen dann sofort
 * auf und sehen beide wie ein Fehler aus, obwohl beide Absicht sind:
 *   1. Neuladen setzt alles zurück (der Zustand lebt nur im Browser-Speicher).
 *   2. Wer den Link öffnet, IST Ian — es gibt keinen Login, also auch keine Wahl.
 * Ohne den Hinweis hält man Nummer 2 für ein Datenleck und Nummer 1 für einen Absturz.
 *
 * ── Warum er auf dem Server NICHTS rendert ────────────────────────────────────
 * Das ist keine Kleinigkeit, sondern der Grund für den Aufbau dieser Datei.
 * Der Web-Export backt zur Build-Zeit einen HTML-Schnappschuss jeder Seite. Wäre der
 * Balken dort schon drin, hätte das zwei Fehler zur Folge:
 *   • Er stünde auch für den, der ihn längst weggeklickt hat, im ausgelieferten HTML
 *     und würde erst verschwinden, wenn das JavaScript geladen hat — ein Blinken.
 *   • React vergleicht beim Hydrieren Server- und Browser-Ergebnis. Verschieden =
 *     Fehler in der Konsole.
 * Deshalb startet `sichtbar` auf `false` und wird erst in einem `useEffect` gesetzt.
 * Effekte laufen NUR im Browser, nie beim Vorrendern. Server und erster Browser-Lauf
 * liefern damit beide „nichts" — identisch, kein Mismatch —, und der Balken kommt
 * einen Wimpernschlag später dazu.
 *
 * ── Die vier Fassungen, und warum diese (Ian, 2026-09-02 und 2026-09-07) ─────
 * Er hat vier Fassungen erlebt, und die Begründung hat sich dabei zweimal gedreht —
 * deshalb steht sie hier ganz. **Wer ihn wieder umbaut, liest zuerst diese Liste**
 * (harte Regel 22), sonst landet er bei einer, die schon durchgefallen ist:
 *   1. Als Ebene über der App OBEN. Falsch: Verdeckt waren Wortmarke, „Posten" und
 *      der Umschalter — genau das, was man beim Herzeigen zuerst sieht.
 *   2. Im Fluss ganz oben, den Inhalt nach unten schiebend. Technisch sauber, aber
 *      Ians Urteil am Handy: **„oben ist es schwieriger zu verstehen."** Ein Kasten,
 *      der oben mitläuft, liest sich wie eine Kopfzeile der App — also wie etwas, das
 *      dazugehört, statt wie eine Ansage über sie.
 *   3. Eine Leiste UNTEN über der App, wie eine Cookie-Abfrage. Sie war ein Jahr
 *      lang richtig und hatte einen dokumentierten Preis: Sie verdeckte dauerhaft
 *      die Tab-Leiste (in Phase 13 als „zwei verdeckte Knöpfe" gemessen und damals
 *      bewusst hingenommen).
 *   4. **Jetzt: ein Vollbild beim ersten Öffnen** — Ians Entscheidung 48, seine
 *      Worte: *„der wird noch größer, dass die Leute wirklich draufklicken auf
 *      Okay."* Man muss „Verstanden" tippen, um weiterzukommen.
 *
 * ── Und seit dem 2026-09-13 hat er eine BEDINGUNG (Ians Entscheidung 56) ────
 * Er erscheint nur noch, solange `ANMELDE_QUELLE` auf `'attrappe'` steht
 * (`IST_PROTOTYP`). **Das ist keine fünfte Fassung** — der Text oben ist um kein
 * Zeichen angefasst, und die vier Fassungen gelten unverändert für den Ort, an dem
 * er noch erscheint: die öffentliche Web-Adresse. Was dazukam, ist die Frage, OB er
 * gilt, und die Antwort ist gemessen: Mit `'supabase'` sind alle drei Sätze falsch.
 *
 * **Das ist keine Wiederholung von Fassung 1.** Die war eine Ebene, die einen Teil
 * der App verdeckte und den Rest zeigte — man konnte daran vorbeisehen und
 * weiterklicken. Ein Vollbild verdeckt ALLES und danach NICHTS: Der Preis von
 * Fassung 3 fällt damit weg, die Tab-Leiste ist nie wieder verdeckt.
 *
 * ── Warum ein Vollbild und trotzdem kein `Modal` ──────────────────────────────
 * `Modal` aus React Native ist auf Web eine eigene Ebene mit eigener Größenlogik und
 * bringt auf iOS eine eigene Präsentation mit — für einen Kasten, der einmal je
 * Sitzung erscheint, ist das eine Bauart mehr, die auf zwei Plattformen verschieden
 * ist. Diese Fläche liegt schlicht im Wurzel-Layout ÜBER der Bühne (`_layout.tsx`)
 * und fängt jede Berührung ab, weil sie nichts durchlässt.
 *
 * ── Warum `insets` auf allen vier Seiten ──────────────────────────────────────
 * Seit die Leiste unten sitzt, zählt der untere Sicherheitsabstand: die Streifen-Geste
 * am iPhone und die Navigationsleiste auf Android. Seit `app/+html.tsx` steht auch
 * `viewport-fit=cover` im HTML — vorher lieferte `env(safe-area-inset-*)` im Browser
 * gar nichts, und der Abstand war immer 0.
 *
 * ── Warum `sessionStorage` und nicht `localStorage` ───────────────────────────
 * `localStorage` würde den Balken für immer verstecken. Das ist zu viel: Wer den
 * Prototyp in drei Wochen wieder aufmacht, hat die zwei Sätze vergessen. Mit
 * `sessionStorage` gilt „weggeklickt" für diesen Tab — inklusive Neuladen, was am
 * Handy oft von selbst passiert (Tab-Wechsel, Speicherdruck) — und nicht darüber
 * hinaus. Beides in `try/catch`: Im privaten Modus wirft schon der Zugriff.
 */

const SCHLUESSEL = 'ss_hinweis_weg';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DAS MERKEN STEHT AN GENAU EINER STELLE — und das ist kein Zufall.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * `schonGesehen()` und `merken()` sind die einzigen zwei Funktionen, die wissen, WO
 * gespeichert wird. Der Grund ist eine bekannte, noch offene Falle:
 *
 * **Auf Native gibt es kein `sessionStorage`** (Vorhersage 19.6, am 2026-09-06 auf
 * dem Simulator bestätigt). Der Merker `weggeklickt` lebt nur, solange die App
 * läuft — nach jedem echten Kaltstart käme der Hinweis wieder. Als Leiste war das
 * lästig, **als Vollbild ist es eine Wand vor jeder Sitzung**.
 *
 * **Und dieser Tausch findet NICHT mehr statt — er ist gegenstandslos geworden,
 * nicht erledigt.** Hier stand bis zum 2026-09-13, er komme mit `expo-secure-store`
 * in Phase 20.3. Die Bausteine liegen seit dem 12.09. im Binary, aber Entscheidung 56
 * hat inzwischen die Frage darunter weggenommen: Am Gerät läuft `'supabase'`, dort
 * erscheint das Vollbild überhaupt nicht mehr. Im Browser läuft `'attrappe'`, und
 * dort gibt es `sessionStorage`.
 *
 * ⚠️ **Ein Fall bleibt, und er soll dastehen statt behauptet zu werden:** ein
 * Simulator- oder Gerätebuild mit `'attrappe'`. Dort kommt die Wand weiter bei jedem
 * Kaltstart. Das trifft niemanden außer dem, der so prüft — und wer daraus eines
 * Tages ein Problem macht, tauscht die zwei Rümpfe unten gegen `AsyncStorage`,
 * genau wie es `anleitungGesehen()` in `WischStapel.tsx` seit demselben Tag vormacht.
 */
let weggeklickt = false;

function schonGesehen(): boolean {
  if (weggeklickt) return true;
  if (Platform.OS !== 'web') return false;
  try {
    return window.sessionStorage.getItem(SCHLUESSEL) === '1';
  } catch {
    return false;
  }
}

function merken(): void {
  weggeklickt = true;
  if (Platform.OS !== 'web') return;
  try {
    window.sessionStorage.setItem(SCHLUESSEL, '1');
  } catch {
    // Privater Modus. Der Merker oben reicht, solange die Seite nicht neu lädt.
  }
}

/**
 * Ob dieser Hinweis überhaupt gilt. **Ians Entscheidung 56 (2026-09-13).**
 *
 * Der Text unten behauptet drei Dinge, und mit `ANMELDE_QUELLE = 'supabase'` ist
 * **jedes einzelne falsch**: Die Namen sind nicht erfunden, es gibt einen Login
 * (drei sogar), und Neuladen setzt nichts zurück — seit dem Sitzungsspeicher
 * überlebt die Anmeldung sogar den Neustart. Ein Vollbild, das beim Start dreimal
 * lügt und das man wegdrücken MUSS, ist dieselbe Familie wie „Noch nichts los in
 * deinem Feed" bei einem Netzausfall.
 *
 * **Sein Text wird dabei um kein Zeichen angefasst** (harte Regel 22 — er ist
 * Ians); er bekommt nur eine Bedingung. Die vier Fassungen oben bleiben gültig und
 * lesbar, sie gelten dem Ort, an dem er noch erscheint: der öffentlichen Adresse.
 *
 * ── Warum die Zeile HIER steht und nicht in `anmeldung.ts` ──────────────────
 * Weil sie dort nicht compiliert. TypeScript verengt ein `const` innerhalb
 * derselben Datei auf seinen Wert, die Union-Annotation gilt erst über
 * Modulgrenzen — `ANMELDE_QUELLE === 'attrappe'` neben der Deklaration ergibt
 * `TS2367`, und zwar nur in einer der beiden Stellungen. Gemessen am 2026-09-13;
 * die ganze Begründung steht in `anmeldung.ts` neben dem Schalter.
 * **Es ist dieselbe Bauart wie `LIEST_AUS_SUPABASE` in `lib/supabase.ts`**
 * (harte Regel 74): eine ABLEITUNG des einen Schalters, abgelegt dort, wo ihre
 * Frage gestellt wird.
 *
 * ⚠️ **Der Preis ist benannt und noch nicht bezahlt:** Die App am Gerät sagt
 * nirgends mehr, dass sie früh ist. Für TestFlight mit Christoph, Leopold und
 * Daria braucht es einen eigenen, ehrlichen Satz — Phase 21, und wieder Ians.
 */
const IST_PROTOTYP = ANMELDE_QUELLE === 'attrappe';

export function PrototypHinweis() {
  const [sichtbar, setSichtbar] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Ians Entscheidung 56 (2026-09-13): Der Hinweis gilt dem PROTOTYP, nicht der App.
    // Steht `ANMELDE_QUELLE` auf `'supabase'`, ist jeder seiner drei Sätze falsch —
    // die Namen sind echt, es gibt drei Logins, und Neuladen setzt nichts zurück.
    // Die Frage steht hier und nicht in `schonGesehen()`: „gilt der Satz überhaupt?"
    // und „habe ich ihn schon gesehen?" sind zwei Fragen, und nur die zweite hat
    // etwas mit einem Speicher zu tun.
    if (!IST_PROTOTYP) return;
    if (!schonGesehen()) setSichtbar(true);
  }, []);

  if (!sichtbar) return null;

  return (
    <View
      style={[
        styles.huelle,
        {
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
        },
      ]}>
      <View style={styles.kasten}>
        {/* Das Symbol steht groß und allein über dem Titel, nicht klein daneben:
            Auf einem Vollbild ist eine Zeile mit einem 16-px-Icon eine Kopfzeile,
            und genau danach soll es nicht aussehen (Fassung 2 in der Liste oben). */}
        <SsIcon name="kolben" size={44} color={accent.base} />
        <SsText variant="heading" center>
          Das hier ist ein Prototyp
        </SsText>
        <SsText variant="body" center color={colors.inkSoft}>
          Alle Namen, Posts und Chats sind erfunden. Es gibt keinen Login — du bist
          gerade Ian. Neuladen setzt alles zurück.
        </SsText>
        <SsButton
          label="Verstanden"
          block
          size="lg"
          onPress={() => {
            merken();
            setSichtbar(false);
          }}
          style={styles.knopf}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Ausgeschriebene Kanten statt `absoluteFill`: Das ist eine registrierte Style-ID
  // und lässt sich nicht mit eigenen Werten mischen (ACTA-Falle, siehe CLAUDE.md).
  // Seit Entscheidung 48 ist auch `top` gesetzt — die Fläche deckt ALLES ab, und
  // genau daran hängt, dass man „Verstanden" wirklich drückt.
  huelle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    // Der Grund liegt unter einem Schleier statt hinter einer weißen Wand: Man sieht,
    // dass die App dahinter schon da ist — sonst liest sich das Vollbild wie ein
    // Ladebildschirm, und darauf wartet man, statt zu tippen.
    backgroundColor: 'rgba(23, 25, 28, 0.55)',
  },
  kasten: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.xl,
    gap: spacing.md,
    alignItems: 'center',
    // Der Schatten trägt Bedeutung und ist keine Zier: Der Kasten liegt ÜBER der App
    // und muss sich von ihr abheben. Seit Entscheidung 48 fällt er nach ALLEN Seiten
    // — der alte Wert warf ihn nur nach oben, weil der Kasten damals am unteren Rand
    // klebte und unten gar nichts zu beschatten war.
    boxShadow: '0 8px 32px rgba(23, 25, 28, 0.24)',
  },
  knopf: { marginTop: spacing.sm, alignSelf: 'stretch' },
});
