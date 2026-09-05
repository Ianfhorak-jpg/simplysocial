import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  SsBack,
  SsButton,
  SsCard,
  SsChip,
  SsIconText,
  SsInput,
  SsScreen,
  SsSegment,
  SsText,
} from '@/components/ui';
import { kategorieVorschlag, mitgliederText, NEUE_GRUPPE_OFFEN } from '@/features/groups/gruppe';
import { gruppeErstellen } from '@/features/groups/hooks';
import { useCurrentUser } from '@/features/social/hooks';
import { istWienerBezirk, ortText } from '@/lib/bezirk';
import { CATEGORY_ORDER, colors, spacing } from '@/theme';
import type { ActivityCategory } from '@/types/models';

/**
 * Eine Gruppe anlegen — Phase 17.
 *
 * ── Warum dieser Screen kürzer ist als der zum Posten ─────────────────────────
 * Ein Post hat zehn Felder, weil ein Treffen zehn Fragen beantworten muss (wann, wo,
 * wie viele …). Eine Gruppe hat keine davon: Sie findet nicht statt, sie besteht.
 * Übrig bleiben drei Angaben plus eine freiwillige — und deshalb gibt es hier auch
 * kein „Mehr einstellen" wie in `create.tsx`. Ein zugeklapptes Menü für ein einziges
 * Feld wäre mehr Bedienung als das Feld selbst.
 *
 * ── Was die Vorschau soll ─────────────────────────────────────────────────────
 * Dasselbe wie im Erstellen-Screen (harte Regel 18): zeigen, was die
 * Voreinstellungen gesetzt haben. Hier ist es weniger dramatisch — es gibt keine
 * versteckten Felder —, aber die Zeile beantwortet die Frage, die man beim Anlegen
 * wirklich hat: Wie sieht das gleich in der Liste aus?
 */
export default function GruppeNeuScreen() {
  const ich = useCurrentUser();

  const [name, setName] = useState('');
  // Vorbelegt aus den eigenen Interessen, nicht mit der ersten Kategorie der Liste:
  // Wer eine Gruppe anlegt, legt sie meist zu dem an, was er sowieso macht.
  const [kategorie, setKategorie] = useState<ActivityCategory>(kategorieVorschlag(ich.interests));
  const [beschreibung, setBeschreibung] = useState('');
  const [bezirk, setBezirk] = useState(ich.district);
  // Phase 18a. `useState<boolean>` ausgeschrieben — sonst erbt der Zustand den
  // Literaltyp der Konstante und lässt sich nicht mehr umschalten (die Falle aus
  // Phase 12 mit `STANDARD.plaetze`).
  const [offen, setOffen] = useState<boolean>(NEUE_GRUPPE_OFFEN);
  const [geprueft, setGeprueft] = useState(false);

  const nameSauber = name.trim();
  const bezirkLeer = bezirk.trim() === '';

  const fehler = {
    // Drei Zeichen, wie beim Post-Titel. „TT" wäre für die anderen nicht zu deuten.
    name: nameSauber.length >= 3 ? '' : 'Ein Name, an dem man die Gruppe erkennt.',
    // Der Bezirk ist freiwillig — Ians Entscheidung vom 2026-09-02 gilt hier genauso
    // wie am Post: Eine Kinogruppe ist in keinem Bezirk zu Hause.
    bezirk: bezirkLeer || istWienerBezirk(bezirk) ? '' : 'Vier Ziffern, z. B. 1070 — oder leer lassen.',
  };
  const allesOk = Object.values(fehler).every((f) => f === '');
  const zeigen = (feld: keyof typeof fehler) => (geprueft ? fehler[feld] : '');

  function absenden() {
    setGeprueft(true);
    if (!allesOk) return;

    const id = gruppeErstellen({
      name: nameSauber,
      description: beschreibung,
      category: kategorie,
      district: bezirkLeer ? null : bezirk.trim(),
      offen,
    });

    // `replace` wie beim Posten: Das halb ausgefüllte Formular soll nicht hinter der
    // fertigen Gruppe liegen bleiben.
    router.replace({ pathname: '/gruppe/[id]', params: { id } });
  }

  return (
    <SsScreen scroll keyboard contentStyle={styles.seite}>
      <SsBack />

      <SsText variant="title">Neue Gruppe</SsText>
      <SsText variant="caption" color={colors.inkSoft}>
        {/* Seit Phase 18a stimmt „du bestätigst, wer dazukommt" nur noch halb: Von
            aussen anfragen läuft weiter über den Gründer, aber einladen darf jedes
            Mitglied (Ians Entscheidung 26). Der Satz sagt jetzt beides — sonst
            verspricht der Screen eine Kontrolle, die es nicht mehr gibt. */}
        Du bist danach der Gründer. Anfragen von aussen bestätigst du; einladen darf
        später jeder, der drin ist.
      </SsText>

      <SsCard category={kategorie}>
        <SsChip category={kategorie} />
        <SsText variant="heading">{nameSauber || 'Name der Gruppe'}</SsText>
        {beschreibung.trim() ? (
          <SsText variant="caption" color={colors.inkSoft} numberOfLines={2}>
            {beschreibung.trim()}
          </SsText>
        ) : null}
        <SsText variant="caption" color={colors.inkSoft}>
          {mitgliederText(1)}   ·   {ortText(istWienerBezirk(bezirk) ? bezirk.trim() : null)}
        </SsText>
        {/* Harte Regel 18 gilt auch hier: Die Vorschau ist die Stelle, an der man
            sieht, was eingestellt IST. Ein Schloss, das nur im Formular steht, wäre
            genau die Einstellung, die man beim Abschicken vergessen hat. */}
        {offen ? null : <SsIconText icon="schloss">Privat</SsIconText>}
      </SsCard>

      <SsInput
        label="Name"
        placeholder="Marswiese Tennis"
        value={name}
        onChangeText={setName}
        maxLength={40}
        error={zeigen('name')}
      />

      <View style={styles.feld}>
        <SsText variant="label">Worum geht es?</SsText>
        <View style={styles.pillen}>
          {CATEGORY_ORDER.map((k) => (
            <SsChip key={k} category={k} selected={kategorie === k} onPress={() => setKategorie(k)} />
          ))}
        </View>
      </View>

      <SsInput
        label="Beschreibung"
        hint="freiwillig"
        value={beschreibung}
        onChangeText={setBeschreibung}
        placeholder="Wir spielen meistens am Wochenende."
        multiline
        maxLength={160}
      />

      <SsInput
        label="Bezirk"
        hint="freiwillig"
        value={bezirk}
        onChangeText={setBezirk}
        placeholder="1070"
        keyboardType="number-pad"
        maxLength={4}
        error={zeigen('bezirk')}
      />

      <View style={styles.feld}>
        <SsText variant="label">Wer darf hinein?</SsText>
        {/* Eine geteilte Fläche und keine zwei Pillen — es ist ein Entweder-oder,
            und `SsSegment` sagt das von selbst (siehe den Kopf des Bausteins).

            ⚠️ EIN WORT je Seite, und das ist keine Kürze um der Kürze willen. Auf
            360 px stand hier zuerst „Jeder kann anfragen" / „Nur auf Einladung" —
            und die linke Hälfte zeigte „Jeder kann anfr…". `SsSegment` teilt die
            Breite und schneidet ab, ohne sich zu beschweren; am breiten Fenster
            sieht man es nie (dieselbe Falle wie mit „Sta…" in Phase 11, nur mit
            einer anderen Ursache: dort war es `flex`, hier ist der Text zu lang).
            Was die beiden Wörter BEDEUTEN, steht in der Zeile darunter — und
            „Privat" ist dasselbe Wort, das die Vorschau und die Gruppenseite
            benutzen. Ein Umschalter, der etwas anderes heißt als das Ergebnis, ist
            zwei Vokabeln für eine Sache. */}
        <SsSegment<boolean>
          value={offen}
          onChange={setOffen}
          options={[
            { wert: true, label: 'Offen' },
            { wert: false, label: 'Privat' },
          ]}
        />
        <SsText variant="caption" color={colors.inkSoft}>
          {offen
            ? 'Die Gruppe steht in der Liste. Wer hinein will, fragt an — du bestätigst.'
            : 'Die Gruppe steht in keiner Liste. Hinein kommt nur, wen jemand von drinnen einlädt.'}
        </SsText>
      </View>

      <SsButton label="Gruppe erstellen" icon="personen" block size="lg" onPress={absenden} />
    </SsScreen>
  );
}

const styles = StyleSheet.create({
  seite: { gap: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  feld: { gap: spacing.sm },
  pillen: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
