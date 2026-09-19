import { NativeTabs } from 'expo-router/unstable-native-tabs';

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
      badgeBackgroundColor={status.danger}>
      <NativeTabs.Trigger name="index" accessibilityLabel="Start">
        {/* Entscheidung 62: keine Wörter in der Kapsel. Das Label bleibt als
            Text erhalten (Screenreader, Fenstertitel) und wird nur nicht
            gezeichnet — anders als beim Weglassen, das ihm den Namen nähme. */}
        <NativeTabs.Trigger.Label hidden>Start</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="requests" accessibilityLabel="Anfragen">
        <NativeTabs.Trigger.Label hidden>Anfragen</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'hand.raised', selected: 'hand.raised.fill' }} />
        {/* Die Zahl macht sichtbar, dass jemand wartet — der Punkt, an dem die
            App etwas von einem will.
            ⚠️ `Badge` nimmt einen **String**, nicht eine Zahl. Und `' '` ist
            NICHT dasselbe wie `''`: `NativeTabTrigger.js` behandelt ein
            einzelnes Leerzeichen als *Punkt ohne Zahl*. Deshalb `undefined`,
            wenn niemand wartet — nicht der leere String. */}
        <NativeTabs.Trigger.Badge>
          {wartend > 0 ? String(wartend) : undefined}
        </NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="chats" accessibilityLabel="Chats">
        <NativeTabs.Trigger.Label hidden>Chats</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'bubble.left', selected: 'bubble.left.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile" accessibilityLabel="Profil">
        <NativeTabs.Trigger.Label hidden>Profil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
