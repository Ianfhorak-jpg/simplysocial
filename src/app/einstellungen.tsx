import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  SsAvatar,
  SsBack,
  SsBezirkFeld,
  SsButton,
  SsCard,
  SsIcon,
  SsScreen,
  SsText,
} from '@/components/ui';
import { BRAND } from '@/config/brand';
import { abmelden } from '@/features/auth/hooks';
import { entblocken, useBlockierte } from '@/features/safety/hooks';
import { standortAnschalten, standortAusschalten, useStandortStand } from '@/features/posts/hooks';
import { standortFolgen } from '@/features/posts/standort';
import {
  bezirkSetzen,
  profilbildEntfernen,
  profilbildSetzen,
  useCurrentUser,
} from '@/features/social/hooks';
import {
  bildFehlerText,
  bildFolgen,
  bildHuerdeText,
  BildWahlFehler,
} from '@/features/social/bild';
import { BILDWAHL_LAEUFT, bildWaehlen } from '@/lib/bild-waehlen';
import { bildZuschneiden } from '@/lib/bild-zuschneiden';
import { BildZuschneiden } from '@/components/BildZuschneiden';
import { istZuschneidbar, type ZuschnittSicht } from '@/features/social/zuschnitt';
import type { Bilddatei, Bildquelle } from '@/lib/bild-waehlen-typen';
import { WARTE_TEXT } from '@/data/schreiben';
import { useWartetAuf } from '@/features/store';
import { istWienerBezirk } from '@/lib/bezirk';
import { accent, colors, danger, radius, spacing } from '@/theme';
import type { IconName } from '@/theme/icons';
import { handleText } from '@/lib/handle';

/**
 * Einstellungen — der Ort für alles, was kein Screen für sich ist.
 *
 * ── Warum es diesen Screen gibt ───────────────────────────────────────────────
 * Apple verlangt nach Guideline 1.2 vier Dinge (CLAUDE.md, letzter Abschnitt).
 * Melden und Blockieren gehören dorthin, wo der Anlass ist — an den Post und an das
 * Profil. Die anderen beiden, Nutzungsbedingungen und Account löschen, haben keinen
 * Anlass: Man sucht sie, wenn man sie braucht. Genau dafür ist ein Einstellungs-Screen
 * da, und deshalb entsteht er erst jetzt und nicht auf Vorrat in Phase 1.
 *
 * ── Warum die blockierten Personen HIER stehen und nicht auf einem eigenen Screen ──
 * Ein Block ist etwas, das man setzt und dann vergisst. Die Liste braucht man genau
 * einmal: wenn man sich anders überlegt hat. Als eigener Screen wäre sie ein Eintrag
 * mehr, hinter dem meistens nichts steht — hier steht direkt da, dass niemand
 * blockiert ist, und man muss nicht nachsehen, um es zu wissen.
 *
 * ── Der Werkstatt-Knopf ist von hier aus erreichbar ───────────────────────────
 * Er stand seit Phase 2 auf dem Profil-Tab, mit der Notiz, dass er „spätestens mit den
 * Einstellungen aus Phase 7" verschwindet. Er verschwindet nicht ganz, sondern zieht
 * um: `/bausteine` ist die einzige Seite, auf der alle Bausteine nebeneinander stehen,
 * und solange der Prototyp beurteilt wird, ist der Weg dorthin mehr wert als die
 * Reinheit des Screens. Nur gehört er nicht mehr aufs Profil — das ist ein
 * Produkt-Screen, den Ians Freunde sehen.
 */
export default function EinstellungenScreen() {
  const blockierte = useBlockierte();
  const ich = useCurrentUser();
  /** Das Bezirksfeld steht zugeklappt — harte Regel 63. */
  const [bezirkOffen, setBezirkOffen] = useState(false);

  // Die Hürde ist ein ZUSTAND und kein `alert`: Der Satz muss neben dem Knopf
  // stehen bleiben, bis jemand es noch einmal versucht — ein Hinweis, der von
  // selbst verschwindet, ist bei „warum geht mein Foto nicht" wertlos.
  const [bildHuerde, setBildHuerde] = useState<string | null>(null);
  const bildLaeuft = useWartetAuf('profilbildSetzen', ich.id);

  // ── Phase 20.6-d: das runde Fenster ──────────────────────────────────────
  // Ein Zustand und kein eigener Screen unter `app/`: Das ausgesuchte Foto müsste
  // sonst als Adressparameter durch `expo-router` reisen, und eine `Bildquelle`
  // ist kein Text. Dazu die Falle vom 2026-09-09 — beim ABBAU eines Navigators
  // schreibt `expo-router` die Adresse neu. Ein `Modal` hat beides nicht.
  const [zuschnitt, setZuschnitt] = useState<Bildquelle | null>(null);
  // Getrennt von `bildLaeuft`: Das Zuschneiden passiert VOR dem Hochladen und
  // dauert selbst einen Moment (das Foto wird nativ dekodiert und neu kodiert).
  // Ohne eigenen Zustand sähe der „Übernehmen"-Knopf in dieser Zeit untätig aus.
  const [schneidet, setSchneidet] = useState(false);

  // ⚠️ **`void` und nicht `async` — das ist die Lehre vom 2026-09-13.**
  // Hier stand `onPress={bildAussuchen}` mit einer `async`-Funktion: React ruft sie,
  // bekommt ein Promise und wirft es weg. Wirft irgendetwas darin, ist das eine
  // unbehandelte Ablehnung — im Entwicklungs-Build eine gelbe Warnung, **im
  // Release-Build gar nichts.** Ian hat am iPhone ein Foto ausgesucht,
  // zugeschnitten, und danach war der Bildschirm unverändert: kein Bild, keine
  // Meldung. Nachgemessen war der Bucket leer, es war also nie etwas losgelaufen.
  //
  // Gemessen: `checksVoidReturn: true` findet **15 solche Stellen** in der App.
  function bildAussuchen() {
    void bildAussuchenAsync();
  }

  async function bildAussuchenAsync() {
    let wahl;
    try {
      wahl = await bildWaehlen();
    } catch (fehler) {
      // Die Sätze kommen aus `bild.ts` und nicht von hier (harte Regel 88). Was
      // wirklich passiert ist, trägt der Fehler in seiner `cause` — auf den
      // Bildschirm kommt es nicht (der Fund vom 2026-09-03).
      setBildHuerde(
        fehler instanceof BildWahlFehler
          ? bildFehlerText(fehler.stufe)
          : bildFehlerText('lesen'),
      );
      return;
    }

    // Abgebrochen ist kein Fehler — und vor allem keine Meldung wert.
    if (!wahl) return;

    // Ein neuer Versuch räumt die alte Meldung weg. Ohne diese Zeile stünde nach
    // einem geglückten zweiten Anlauf immer noch der Satz vom ersten da.
    setBildHuerde(null);

    // ── Seit 20.6-d gibt es ZWEI Antworten, und der Compiler zählt mit ───────
    // Am Gerät kommt ein Foto zurück, das erst durchs runde Fenster muss; im
    // Browser ein fertiges Bild (siehe `Bildwahl`). Ein vergessener Fall wäre hier
    // ein Übersetzungsfehler und kein leerer Bildschirm — genau dafür ist das
    // Union da (harte Regel 27).
    if (wahl.art === 'zuschneiden') {
      if (!istZuschneidbar(wahl.quelle)) {
        // Ein Foto ohne Fläche. `zuschnittRechteck()` würde werfen, und der Wurf
        // käme aus dem Render heraus — also aus einer Stelle, an der ihn niemand
        // fängt. Gefragt wird deshalb HIER, bevor das Fenster aufgeht.
        setBildHuerde(bildFehlerText('lesen'));
        return;
      }
      setZuschnitt(wahl.quelle);
      return;
    }
    await hochladen(wahl.datei);
  }

  /** `void` und nicht `async` — dieselbe Lehre wie oben bei `bildAussuchen`. */
  function uebernehmen(sicht: ZuschnittSicht) {
    void uebernehmenAsync(sicht);
  }

  async function uebernehmenAsync(sicht: ZuschnittSicht) {
    const quelle = zuschnitt;
    if (!quelle) return;

    let datei;
    setSchneidet(true);
    try {
      datei = await bildZuschneiden(quelle, sicht);
    } catch (fehler) {
      // Das Fenster geht ZU, und die Meldung steht darunter auf dem Screen. Der
      // Grund ist der Rat selbst: `bildFehlerText('lesen')` sagt „nimm ein
      // anderes" — das kann man im offenen Zuschneide-Fenster gar nicht.
      setZuschnitt(null);
      setBildHuerde(
        fehler instanceof BildWahlFehler
          ? bildFehlerText(fehler.stufe)
          : bildFehlerText('umwandeln'),
      );
      return;
    } finally {
      // `finally` und nicht am Ende: Auf dem Erfolgsweg steht unten ein `await`,
      // und bis das zurückkommt, stünde der Knopf sonst weiter auf „warte".
      setSchneidet(false);
    }

    setZuschnitt(null);
    await hochladen(datei);
  }

  /**
   * Der gemeinsame letzte Abschnitt beider Wege.
   *
   * **Die Hürde wird hier gefragt und nicht zweimal:** Im Browser liegt eine
   * fremde Datei vor (sie kann ein 20-MB-SVG sein), am Gerät ein eigener 512er
   * JPEG. Der zweite Fall kommt nie an die Grenzen — die Prüfung steht trotzdem
   * auf beiden Wegen, weil eine Prüfung, die nur der Theorie nach überflüssig ist,
   * genau dann fehlt, wenn sich die Theorie ändert.
   */
  async function hochladen(datei: Bilddatei) {
    // Vor dem Hochladen fragen, nicht danach: Der Bucket weist dieselben Fälle ab
    // (gemessen in `80_bilder.mjs`), aber erst nach dem Warten und mit einer
    // Meldung auf Englisch. Die Regel steht in `bild.ts`, nicht hier.
    const huerde = bildHuerdeText(datei.typ, datei.bytes);
    setBildHuerde(huerde);
    if (huerde) return;

    // ⚠️ **`schreibVorgang` fängt NICHT alles, und das war der zweite Teil des
    // Fehlers vom 2026-09-13.** Ein `SchreibFehler` landet in der Leiste oben
    // (Ians Entscheidung 48) — alles andere wird in `schreibVorgangIntern`
    // ausdrücklich WEITERGEWORFEN, damit ein Programmfehler „laut" ist statt als
    // „Keine Verbindung" verkleidet. Die Absicht stimmt; nur gibt es in einem
    // Release-Build kein Lautes: Der Wurf lief durch dieses `await` hinaus und
    // verschwand. Genau so ist `zufallsName()` gestorben, ohne ein Zeichen.
    try {
      await profilbildSetzen(datei);
    } catch {
      setBildHuerde('Das Hochladen ist an etwas Unerwartetem gescheitert. Sag Ian Bescheid.');
    }
  }

  // Der Entwurf steht NEBEN dem gespeicherten Wert und nicht an seiner Stelle: Beim
  // Tippen durchläuft das Feld `1`, `12`, `122` — Zustände, die kein Bezirk sind. Wer
  // sie direkt ins Profil schreibt, sortiert den Feed zwischendurch ab einem Ort, den
  // es nicht gibt. Übernommen wird erst, was `istWienerBezirk()` durchlässt.
  const [entwurf, setEntwurf] = useState(ich.district);
  const standort = useStandortStand();
  // Die Sätze kommen aus der Regel-Datei, nicht aus diesem Screen — sonst steht hier
  // eines Tages etwas, das `STANDORT_ROLLE` nicht mehr tut (harte Regel 17).
  const standortText = standortFolgen(standort.zustand);

  return (
    <SsScreen scroll contentStyle={styles.seite}>
      <SsBack />

      <SsText variant="title">Einstellungen</SsText>

      {/* ── Das Bild steht ÜBER dem Bezirk, und das ist keine Rangfolge ───────
          Es ist das Einzige auf diesem Screen, das andere Leute sehen. Der
          Bezirk darunter verändert, was ICH sehe (Entscheidung 63), alles
          weitere ist Verwaltung — drei Sorten, in dieser Reihenfolge.

          Harte Regel 63 ist dabei mitgeprüft: Der Block zeigt EINEN Avatar und
          EINEN Knopf. Die drei Sätze aus `bildFolgen()` stehen nur da, wenn
          wirklich ein Bild da ist — vorher beantworten sie eine Frage, die
          niemand gestellt hat. */}
      <View style={styles.block}>
        <SsText variant="label" color={colors.inkSoft}>
          Dein Bild
        </SsText>

        <View style={styles.bildZeile}>
          <SsAvatar name={ich.displayName} seed={ich.id} photoUrl={ich.photoUrl} size="lg" />
          <View style={styles.bildText}>
            {BILDWAHL_LAEUFT ? (
              <>
                <SsButton
                  variant="ghost"
                  label={
                    bildLaeuft
                      ? WARTE_TEXT
                      : ich.photoUrl
                        ? 'Anderes Bild'
                        : 'Bild aussuchen'
                  }
                  disabled={bildLaeuft}
                  onPress={bildAussuchen}
                />
                {ich.photoUrl ? (
                  <SsButton variant="ghost" label="Bild entfernen" onPress={() => void profilbildEntfernen()} />
                ) : null}
              </>
            ) : (
              /* Steht der Knopf nicht da, steht ein SATZ da — die Lehre aus
                 Phase 16. Ein Knopf, der nichts tut, sieht aus wie eine App,
                 die die Funktion nicht hat. */
              <SsText variant="caption" color={colors.inkSoft}>
                Ein Bild aussuchen geht am Handy noch nicht — das kommt mit dem
                nächsten App-Update. Im Browser geht es schon.
              </SsText>
            )}
          </View>
        </View>

        {/* Das runde Fenster liegt als `Modal` über allem und wird nur gezeichnet,
            wenn wirklich ein Foto darauf wartet. Kein `visible`-Prop von außen:
            Ein Fenster ohne Foto hätte keinen Zustand, den es zeigen könnte. */}
        {zuschnitt ? (
          <BildZuschneiden
            quelle={zuschnitt}
            wartet={schneidet}
            onAbbrechen={() => setZuschnitt(null)}
            onUebernehmen={uebernehmen}
          />
        ) : null}

        {bildHuerde ? (
          <SsText variant="caption" color={danger.base}>
            {bildHuerde}
          </SsText>
        ) : null}

        {ich.photoUrl
          ? bildFolgen().map((satz) => (
              <SsText key={satz} variant="caption" color={colors.inkSoft}>
                {satz}
              </SsText>
            ))
          : null}
      </View>

      {/* ── Ganz oben, und das ist die Aussage ────────────────────────────────
          Es ist die einzige Einstellung, die verändert, was man SIEHT: Seit
          Ians Entscheidung 63 sortiert der Feed von hier aus nach außen. Alles
          darunter ist Verwaltung. */}
      <View style={styles.block}>
        <SsText variant="label" color={colors.inkSoft}>
          Dein Bezirk
        </SsText>

        <Pressable
          onPress={() => setBezirkOffen((o) => !o)}
          accessibilityRole="button"
          accessibilityLabel={`Dein Bezirk: ${ich.district} Wien. Zum Ändern antippen.`}
          style={({ pressed }) => [styles.zeile, pressed && styles.zeileGedrueckt]}>
          <View style={styles.zeileIcon}>
            <SsIcon name="pin" size={20} color={colors.ink} />
          </View>
          <View style={styles.zeileText}>
            <SsText variant="bodyStrong">{ich.district} Wien</SsText>
            {/* Der Satz sagt, was die Einstellung TUT — sonst wäre sie eine
                Angabe über einen selbst, und niemand käme auf die Idee, dass
                davon die Reihenfolge des Feeds abhängt. */}
            <SsText variant="caption" color={colors.inkSoft}>
              Von hier aus sortiert dein Feed nach außen
            </SsText>
          </View>
          <SsIcon name={bezirkOffen ? 'chevronUnten' : 'chevronRechts'} size={18} color={colors.inkSoft} />
        </Pressable>

        {/* Ein FELD, kein Raster aus 23 Chips — Ians Rückmeldung vom 2026-09-12.
            Die Begründung steht im Kopf von `SsBezirkFeld`. Sie gilt hier genauso
            wie beim ersten Konto: Man WÄHLT hier nichts aus, man GIBT an, wo man
            wohnt, und das weiß man.

            Zugeklappt wird NICHT mehr von selbst. Beim Raster war das richtig — ein
            Tipp, eine Wahl, fertig. Bei einem Feld gibt es diesen Augenblick nicht:
            Nach der vierten Ziffer wegzuklappen nähme jemandem die Zeile weg, an
            der er gerade abliest, ob er sich vertippt hat. */}
        {bezirkOffen ? (
          <View style={styles.bezirkFeld}>
            <SsBezirkFeld
              wert={entwurf}
              setzen={(plz) => {
                setEntwurf(plz);
                // Erst übernehmen, wenn es wirklich ein Bezirk ist. Sonst stünde
                // nach der ersten Ziffer eine `1` im Profil, und der Feed sortierte
                // ab einem Ort, den es nicht gibt.
                if (istWienerBezirk(plz)) bezirkSetzen(plz);
              }}
              label="Dein Heimatbezirk"
            />
          </View>
        ) : null}

        {/* ── Phase 19h-2: der Standort, direkt UNTER dem Bezirk ──────────────
            Und zwar in demselben Block, nicht in einem eigenen: Er ist kein
            zweiter Ort, sondern die Verfeinerung des einen darüber (Ians
            Entscheidung 61 — *der Heimatbezirk ist die Grundlage, der Standort
            kommt optional dazu*). Ein eigener Abschnitt mit eigener Überschrift
            würde daraus zwei gleichrangige Einstellungen machen, und dann fragt
            sich zu Recht jemand, welche von beiden gilt.

            Hier steht auch der einzige Erlaubnis-Dialog der App
            (`STANDORT_FRAGE = 'einstellung'`, Begründung in `standort.ts`). */}
        <Pressable
          onPress={() => (standort.zustand === 'an' ? standortAusschalten() : void standortAnschalten())}
          accessibilityRole="switch"
          accessibilityState={{ checked: standort.zustand === 'an' }}
          accessibilityLabel={`${standortText.titel}. ${standortText.erklaerung}`}
          style={({ pressed }) => [styles.zeile, pressed && styles.zeileGedrueckt]}>
          <View style={styles.zeileIcon}>
            <SsIcon
              name="ziel"
              size={20}
              color={standort.zustand === 'an' ? accent.base : colors.ink}
            />
          </View>
          <View style={styles.zeileText}>
            <SsText variant="bodyStrong">{standortText.titel}</SsText>
            <SsText variant="caption" color={colors.inkSoft}>
              {standortText.erklaerung}
            </SsText>
          </View>
          {/* Kein React-Native-`Switch`: Die App hat keinen, und einer allein für
              diese Zeile wäre ein Baustein, den niemand sonst benutzt. Das Wort
              sagt dasselbe und passt zur Zeile darüber. */}
          <SsText variant="label" color={standort.zustand === 'an' ? accent.base : colors.inkSoft}>
            {standort.zustand === 'an' ? 'An' : 'Aus'}
          </SsText>
        </Pressable>
      </View>

      <View style={styles.block}>
        <SsText variant="label" color={colors.inkSoft}>
          Blockiert
        </SsText>

        {blockierte.length === 0 ? (
          <SsCard>
            <SsText variant="body" color={colors.inkSoft}>
              Du hast niemanden blockiert.
            </SsText>
            <SsText variant="caption" color={colors.inkSoft}>
              Blockieren kannst du auf dem Profil einer Person.
            </SsText>
          </SsCard>
        ) : (
          blockierte.map((person) => (
            <SsCard key={person.id}>
              <View style={styles.person}>
                <SsAvatar name={person.displayName} seed={person.id} photoUrl={person.photoUrl} size="md" />
                <View style={styles.personText}>
                  <SsText variant="bodyStrong" numberOfLines={1}>
                    {person.displayName}
                  </SsText>
                  <SsText variant="caption" color={colors.inkSoft}>
                    {handleText(person.handle)}
                  </SsText>
                </View>
                {/* „Aufheben" und nicht „Entblocken": Das Wort steht neben einem Namen,
                    und es soll die harmlosere der beiden Richtungen sein. */}
                <SsButton variant="ghost" label="Aufheben" onPress={() => void entblocken(person.id)} />
              </View>
            </SsCard>
          ))
        )}
      </View>

      <View style={styles.block}>
        <SsText variant="label" color={colors.inkSoft}>
          Rechtliches
        </SsText>
        <Zeile
          icon="blatt"
          label="Nutzungsbedingungen"
          hinweis="Was hier gilt und ab welchem Alter"
          href="/nutzungsbedingungen"
        />
      </View>

      <View style={styles.block}>
        <SsText variant="label" color={colors.inkSoft}>
          Dein Konto
        </SsText>
        {/* Abmelden steht ÜBER dem Löschen und ist kein Vorzimmer davon: Das eine ist
            umkehrbar, das andere nicht. Die Reihenfolge sagt das mit — wer nach dem
            Ausstieg sucht, findet zuerst den, von dem er zurückkommt. */}
        <Zeile
          icon="pfeilRechts"
          label="Abmelden"
          hinweis={`Zurück zum Anmelden von ${BRAND.name}`}
          onPress={hinaus}
        />
        <Zeile
          icon="muell"
          label="Account löschen"
          hinweis="Dein Profil, deine Posts und deine Chats"
          href="/account-loeschen"
          rot
        />
      </View>

      <View style={styles.block}>
        <SsText variant="label" color={colors.inkSoft}>
          Für die Entwicklung
        </SsText>
        <Zeile
          icon="bausteine"
          label="Bausteine anschauen"
          hinweis="Alle Elemente der App nebeneinander"
          href="/bausteine"
        />
      </View>

      <SsText variant="caption" color={colors.inkSoft} center style={styles.fuss}>
        {BRAND.name} · Prototyp
      </SsText>
    </SsScreen>
  );
}

/**
 * Abmelden — und dabei die Adresse mitnehmen.
 *
 * ── Warum hier ein `replace` steht und nicht nur `abmelden()` ─────────────────
 * Der Torwächter in `app/_layout.tsx` zeichnet den `Stack` nicht mehr, sobald die
 * Sitzung weg ist. **Beim Abbau schreibt `expo-router` die Adresse neu** — gemessen
 * am 2026-09-09: Aus `/einstellungen` wurde `/account-loeschen`, eine Seite, die
 * niemand geöffnet hatte. Sie ist schlicht die erste Route im Verzeichnis; ohne
 * Navigator fällt der Router darauf zurück. Sichtbar war davon nichts (der
 * Anmelde-Bildschirm stand richtig da) — **erst beim nächsten Neuladen hätte es
 * jemanden auf dem Lösch-Screen abgesetzt.**
 *
 * `replace('/')` ist deshalb kein Trick gegen den Router, sondern die richtige
 * Aussage: Wer sich abmeldet, steht nicht mehr in den Einstellungen. Und weil die
 * Adresse ABSICHTLICH gesetzt wird, hat der Abbau nichts mehr zu raten.
 *
 * `replace` und nicht `push`: Die Einstellungen sollen nicht im Zurück-Verlauf
 * liegenbleiben, sonst führt der Zurück-Knopf des Browsers nach dem nächsten
 * Anmelden in einen Screen, den man gerade verlassen hat.
 *
 * **Das gilt nur für den Weg über diesen Knopf.** Wer die App ausgeloggt ÖFFNET
 * (Phase 20.3-b), behält seine Adresse — dort wird nie ein Navigator abgebaut.
 * Belegt am 2026-09-09: `/post/p1` ausgeloggt geöffnet, angemeldet, und man steht
 * auf `/post/p1`.
 */
function hinaus(): void {
  router.replace('/');
  abmelden();
}

/**
 * Wohin eine Zeile führt — ein Weg ODER eine Tat, nie beides und nie keines.
 *
 * Dasselbe Muster wie `SsButtonVariantProps` (Kategoriefarbe nur bei
 * `variant="category"`, dort aber Pflicht): Eine Zeile ohne Ziel wäre tippbar und
 * täte nichts, eine mit zweien hätte zwei Bedeutungen. Beides ist so nicht tippbar.
 */
type ZeileZiel = { href: Href; onPress?: never } | { onPress: () => void; href?: never };

/**
 * Eine Zeile, die woanders hinführt oder etwas tut.
 *
 * Das Winkelzeichen rechts ist dasselbe wie auf der Verfasser-Karte im Post-Detail —
 * in dieser App heisst der Chevron immer: hier geht es weiter. `rot` färbt nur den Text, nicht
 * die Fläche; dieselbe Haltung wie bei `SsButton variant="danger"` (Begründung im Kopf
 * von `SsButton.tsx`): Die unfreundliche Aktion soll erkennbar sein, ohne der lauteste
 * Punkt auf dem Bildschirm zu werden.
 */
function Zeile(
  props: {
    // `IconName` und NICHT `string` — genau daran ist diese Zeile in Phase 14
    // vorbeigerutscht. Solange hier `string` stand, war „blatt" ein gültiger Wert,
    // und `tsc` hatte keinen Grund, sich zu melden. Siehe den Kommentar bei `SsIcon`
    // unten.
    icon: IconName;
    label: string;
    hinweis: string;
    rot?: boolean;
  } & ZeileZiel,
) {
  const { icon, label, hinweis, rot } = props;
  // Nicht destrukturieren: Ein `...ziel` verliert die Verzweigung des Unions, und
  // `tsc` sieht danach ein `Href | undefined`. Am ganzen `props` narrowt er sauber.
  const fuehrt = props.href !== undefined;

  return (
    <Pressable
      onPress={() => (props.href !== undefined ? router.push(props.href) : props.onPress())}
      accessibilityRole="button"
      style={({ pressed }) => [styles.zeile, pressed && styles.zeileGedrueckt]}>
      {/* Hier stand `<SsText>{icon}</SsText>` — richtig, solange `icon` ein Emoji war
          („📄"), und ab Phase 14 falsch: Der Wert wurde auf den NAMEN umgestellt, der
          Zeichner nicht. Auf dem Screen stand dann „bl att" untereinander in einer
          22 px breiten Spalte. Der Chevron zwei Zeilen tiefer war schon richtig — es
          war genau diese eine Stelle, und nur, weil die Prop `string` blieb. */}
      <View style={styles.zeileIcon}>
        <SsIcon name={icon} size={20} color={rot ? danger.onSoft : colors.ink} />
      </View>
      <View style={styles.zeileText}>
        <SsText variant="bodyStrong" color={rot ? danger.onSoft : colors.ink}>
          {label}
        </SsText>
        <SsText variant="caption" color={colors.inkSoft}>
          {hinweis}
        </SsText>
      </View>
      {/* Der Chevron heißt in dieser App IMMER „hier geht es weiter". Eine Zeile, die
          etwas TUT statt zu führen, bekommt deshalb keinen — sonst verspricht das
          Zeichen einen Bildschirm, der nicht kommt. */}
      {fuehrt ? <SsIcon name="chevronRechts" size={18} color={colors.inkSoft} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  seite: { gap: spacing.lg, paddingTop: spacing.sm },
  block: { gap: spacing.sm },

  // Umbrechendes Pillenfeld statt einer waagrechten Reihe: 23 Bezirke in EINER
  // Zeile hieße scrollen, um Liesing zu finden — und man sucht hier genau einen
  // bestimmten, nicht „irgendeinen".
  // Das Chip-Raster ist mit Ians Rückmeldung vom 2026-09-12 weg; übrig bleibt
  // die Einrückung, damit das Feld unter der Zeile steht statt neben ihr.
  bezirkFeld: { paddingTop: spacing.xs },

  // Avatar links, Knöpfe rechts — dieselbe Form wie `person` darunter, damit der
  // Block nicht wie ein Fremdkörper über der Liste steht.
  bildZeile: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12 },
  // `flex: 1` an dem, was nachgeben soll — nicht `flexShrink` am anderen (harte
  // Regel 43, am 2026-09-05 in der Chat-Zeile zweimal falsch geraten).
  bildText: { flex: 1, gap: 8, alignItems: 'flex-start' as const },
  person: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  personText: { flex: 1, minWidth: 0, gap: 2 },

  zeile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    cursor: 'pointer',
  },
  zeileGedrueckt: { backgroundColor: colors.bg },
  // Feste Breite, damit die Textspalte aller Zeilen auf derselben Kante steht — die
  // Icons sind zwar alle 20 px, aber die Breite gehoert der Spalte, nicht dem Bild.
  zeileIcon: { width: 22, alignItems: 'center' },
  zeileText: { flex: 1, minWidth: 0, gap: 1 },

  fuss: { marginTop: spacing.md },
});
