import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SsBack, SsButton, SsCard, SsChip, SsInput, SsScreen, SsText } from '@/components/ui';
import { kategorieVorschlag, mitgliederText } from '@/features/groups/gruppe';
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
        Du bist danach der Gründer und bestätigst, wer dazukommt.
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

      <SsButton label="Gruppe erstellen" icon="personen" block size="lg" onPress={absenden} />
    </SsScreen>
  );
}

const styles = StyleSheet.create({
  seite: { gap: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  feld: { gap: spacing.sm },
  pillen: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
