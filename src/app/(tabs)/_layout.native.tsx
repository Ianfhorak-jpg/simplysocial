import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { t } from '@/i18n';
import { useMeineEinladungen, useOffeneGruppenAnfragen } from '@/features/groups/hooks';
import { useOffeneAnfragen } from '@/features/requests/hooks';
import { colors, status } from '@/theme';

/**
 * Die Tab-Leiste auf iOS — **Apples eigene, seit Ians Entscheidung 85.**
 *
 * ── Warum diese Datei neben `_layout.tsx` steht und nicht darin ──────────────
 * `getRoutesCore.js` gibt der `.native`-Endung auf iOS Vorrang und ignoriert sie
 * auf Web vollständig. **`_layout.tsx` bleibt damit unangetastet und ist die
 * Web-Fassung.** Das ist die Bauart von `SsGlas.tsx`/`SsGlas.native.tsx`
 * (harte Regel 52) und die Antwort auf den Einwand „zwei Implementierungen, die
 * man doppelt pflegt": Mit Plattform-Endungen pflegt man zwei Dateien **mit
 * Absicht**, genau wie Entscheidung 43 es festhält.
 *
 * **Der Rückbau ist deshalb: diese Datei und `lib/tabs.native.ts` löschen.** iOS
 * fällt auf die nie veränderten Originale zurück. Kein Merge, kein „welche Zeile
 * war vorher wie" — das ist der Grund für diesen Weg statt eines Ersatzes.
 *
 * *Ohne den Kniff ginge Web kaputt:* `NativeTabsView.web.js` ist
 * `@radix-ui/react-tabs` mit `<span>{title}</span>` und **keinem Icon-Zweig**;
 * ein verstecktes Label setzt dort `title = ''` → vier leere, namenlose Knöpfe.
 *
 * ── Warum überhaupt Apples Leiste ───────────────────────────────────────────
 * Die JS-Leiste zeichnete Glas als Untergrund HINTER eigenen Symbolen. Was
 * dabei fehlt, ist das Verhalten: Apples Leiste in iOS 26 schrumpft beim
 * Scrollen zusammen (`minimizeBehavior`) und lässt ihre Symbole beim Auswählen
 * von Umriss auf gefüllt **morphen**. Beides gehört der `UITabBar` und lässt
 * sich nicht nachbauen — das war Ians Punkt: *„LIQUID GLASS VON APPLE DIREKT
 * NICHT VON DIR NACHGEBAUT."*
 *
 * ── SF Symbols, und was sie kosten (Ians Entscheidung 86) ───────────────────
 * `house` · `hand.raised` · `bubble.left` · `person` — motivisch fast
 * deckungsgleich mit `haus`, `hand`, `sprechblase`, `person` aus `theme/icons.ts`.
 *
 * **Der Grund ist das Morph-Verhalten:** Es ist auf SF Symbols abgestimmt, auf
 * den Wechsel Umriss → gefüllt beim Auswählen. **Der eigene Satz kann das
 * nicht** — er hat keine gefüllten Fassungen.
 *
 * **Der Preis ist benannt und angenommen:** Phase 14 entstand aus Christophs
 * *„schaut noch bisschen nach AI aus"*, und der Satz wirkt, weil alles auf
 * demselben 24er-Raster mit einer Strichstärke liegt. Vier Fremdsymbole an der
 * sichtbarsten Stelle brechen das. Vertretbar, weil die Tab-Leiste ab jetzt
 * Apple gehört — überall sonst gilt harte Regel 23 unverändert.
 *
 * ⚠️ **Keine neue `dependency`:** `sf-symbols-typescript` liegt bereits
 * transitiv von `expo-router` da. Die Zahl in `_FUER_IAN/ALTERSFREIGABE.md`
 * bleibt unberührt — sonst wird `npm run pruef-alter` rot.
 */
/**
 * Der Name des Anfragen-Tabs für Screenreader.
 *
 * Er trägt seit Entscheidung 94 die ZAHL, die der Punkt nicht mehr zeigt. Das
 * ist kein Ausgleich aus Höflichkeit: Auf iOS liest VoiceOver den Badge-Wert
 * mit vor — und unser Badge-Wert ist jetzt ein Leerzeichen. Ohne diese Zeile
 * verlöre die gesprochene Fassung die Information ganz, während die sichtbare
 * wenigstens noch „da ist was" sagt.
 */
function anfragenName(wartend: number) {
  if (wartend === 0) return 'Anfragen';
  return `Anfragen, ${wartend} ${wartend === 1 ? 'wartet' : 'warten'}`;
}

export default function TabsLayoutNative() {
  // Wort für Wort dieselben drei Haken wie in der Web-Fassung, und aus demselben
  // Grund: Seit Phase 17 zählt die Zahl beide Anfrage-Sorten, seit 18a auch
  // Einladungen an mich — und zwar über DENSELBEN Haken, den der Screen benutzt
  // (harte Regel 40). Ein eigener Zähler zählte Einladungen mit, deren Zeile der
  // Screen ausblendet: eine Zahl, die man nicht wegbekommt.
  const offene = useOffeneAnfragen();
  const offeneGruppen = useOffeneGruppenAnfragen();
  const einladungen = useMeineEinladungen();
  const wartend = offene.length + offeneGruppen.length + einladungen.length;

  return (
    <NativeTabs
      // ⚠️ **Was hier NICHT stehen darf:** `backgroundColor` und `blurEffect`.
      // `appearance.ios.js` ERSETZT damit das Erscheinungsbild der Leiste — wer
      // sie setzt, schaltet Liquid Glass ab. Dasselbe gilt für einen Schatten.
      // Erlaubt ist nur, was die Leiste EINFÄRBT, nicht was sie ersetzt.
      //
      // Das Morph-Verhalten aus Ians Vorbild: Die Leiste schrumpft beim Scrollen
      // nach unten zusammen und kommt beim Hochscrollen zurück.
      minimizeBehavior="onScrollDown"
      iconColor={{ default: colors.inkSoft, selected: colors.ink }}
      tintColor={colors.ink}
      // ⚠️ **Die Farbe der Zahl steht HIER, nicht am Badge.** Der erste Versuch
      // setzte `backgroundColor` an `Badge` — den Prop gibt es dort nicht (nur
      // `selectedBackgroundColor`), und `tsc` hat es gefangen. Am Badge wäre es
      // ohnehin die falsche Ebene: Die Leiste färbt alle ihre Zahlen gleich.
      //
      // ── Türkis statt Rot (Ians Entscheidung 91) ─────────────────────────────
      // *„warum ist die Hand rot?"* — eine Anfrage ist das Gegenteil von Gefahr.
      //
      // 🔴 **Und hier gilt NICHT, was die Web-Fassung kann.** Dort steht neben
      // der Hintergrundfarbe auch `color: status.hinweisAufFlaeche`, denn Weiß
      // auf Türkis wäre 1,60. **Auf iOS geht dieser zweite Wert nicht** — das
      // ist nachgesehen, nicht vermutet:
      //
      //   · `types.d.ts:350` markiert `badgeTextColor` als `@platform android`
      //     / `@platform web` — iOS steht nicht dabei.
      //   · `appearance.ios.js:26` reicht von den Badge-Werten **allein**
      //     `badgeBackgroundColor` durch.
      //   · `RNSTabBarAppearanceCoordinator.mm:258` setzt entsprechend nur
      //     `tabBarItemStateAppearance.badgeBackgroundColor`. Das Gegenstück
      //     `badgeTextAttributes`, über das UIKit die Schriftfarbe annähme,
      //     wird nie beschrieben — **UIKit zeichnet die Zahl weiß.**
      //
      // Das ist der Preis von Entscheidung 85: Die Leiste gehört ab jetzt Apple,
      // und Apple gibt diesen einen Wert nicht her. Deshalb ist der TON hier
      // eine Entscheidung, die **beide** Plattformen tragen muss, und nicht
      // frei wählbar wie auf Web. Welcher es wird, steht in `theme/colors.ts`
      // bei `status.hinweis` — diese Zeile bleibt gleich.
      badgeBackgroundColor={status.hinweis}>
      <NativeTabs.Trigger name="index" accessibilityLabel={t('tabs.start')}>
        {/* Entscheidung 62: keine Wörter in der Kapsel. Das Label bleibt als
            Text erhalten (Screenreader, Fenstertitel) und wird nur nicht
            gezeichnet — anders als beim Weglassen, das ihm den Namen nähme. */}
        <NativeTabs.Trigger.Label hidden>Start</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name="requests"
        // ⚠️ **Hier steht die Zahl, seit der Punkt sie nicht mehr trägt.** Auf
        // Web liest man sie ab, auf iOS gibt es sie nur noch für VoiceOver —
        // und genau deshalb darf sie hier nicht fehlen: Wer die Leiste hört
        // statt sie zu sehen, bekommt sonst gar nichts.
        accessibilityLabel={anfragenName(wartend)}>
        <NativeTabs.Trigger.Label hidden>Anfragen</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'hand.raised', selected: 'hand.raised.fill' }} />
        {/* Ein PUNKT, keine Zahl — **Ians Entscheidung 94 vom 2026-09-19.**

            Der Grund ist nicht Geschmack, sondern eine Sackgasse: Die Zahl
            wäre weiß auf Türkis und damit 1,60 (siehe `badgeBackgroundColor`
            oben). Vorgelegt wurden drei Wege — pur Türkis mit unlesbarer Zahl ·
            ein gedecktes Petrol, auf dem Weiß lesbar ist · **pur Türkis ohne
            Zahl**. Ian hat den dritten gewählt: *„es muss ja einfach ein
            Problem lösen"*. Der Preis ist benannt — man sieht DASS jemand
            wartet, nicht wie viele. **Auf Web bleibt die Zahl** (`_layout.tsx`),
            dort nimmt der Badge eine eigene Schriftfarbe an.

            🔴 **Beide Props sind nötig, und das ist keine Doppelung.**
            `appendBadgeOptions` (NativeTabTrigger.js:131) hat zwei Zweige, und
            KEINER davon bedeutet „kein Badge":

              · `if (props.children)` → `badgeValue = String(children)`
                — `hidden` wird hier **nicht gelesen**. `hidden` allein genügt
                also nicht, solange ein Kind dasteht.
              · `else if (!props.hidden)` → `badgeValue = ' '`
                — **ein leeres Kind zeichnet einen Punkt**, statt nichts zu
                zeichnen. `children` allein genügt also auch nicht.

            ⚠️ **Genau daran hing ein Fehler, den bis zum 19.09. niemand als
            solchen gelesen hat.** Hier stand `undefined`, wenn niemand wartet,
            mit dem Kommentar, das schalte den Badge ab — und die Doku am Typ
            sagt dasselbe (*„If not provided, the badge will not be displayed"*).
            Der Code daneben tut das Gegenteil: Zweig zwei greift und setzt
            `' '`. **Am Gerät stand also dauerhaft ein roter Punkt an der Hand,
            ohne dass eine einzige Anfrage offen war.** Ians Frage vom selben
            Tag — *„warum ist die Hand rot?"* — passt darauf und nicht auf eine
            Zahl: Sein Feed ist leer, eine Zahl konnte er nie gesehen haben.

            Web ist davon nicht betroffen: Dort ist der Badge `react-navigation`,
            und `undefined` heißt dort wirklich „kein Badge". */}
        <NativeTabs.Trigger.Badge hidden={wartend === 0}>
          {wartend > 0 ? ' ' : undefined}
        </NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="chats" accessibilityLabel={t('tabs.chats')}>
        <NativeTabs.Trigger.Label hidden>Chats</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'bubble.left', selected: 'bubble.left.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile" accessibilityLabel={t('tabs.profil')}>
        <NativeTabs.Trigger.Label hidden>Profil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
