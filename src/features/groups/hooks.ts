import { useMemo } from 'react';

import { istBlockiert } from '../safety/hooks';
import { useUserMap } from '../social/hooks';
import { CURRENT_USER_ID, aendern, neueId, useSlice } from '../store';

import {
  darfEinladen,
  inGruppenListe,
  istGruender,
  istMitglied,
  nachfolgerId,
  postsBeimAustritt,
  BEITRITT,
  EINLADEN_DARF,
} from './gruppe';

import type {
  ActivityCategory,
  Group,
  GroupInvite,
  GroupRequest,
  User,
  Visibility,
} from '@/types/models';

/**
 * Der Zugang zu Gruppen — Phase 17. Screens lesen NIE aus `data/mock.ts`
 * (harte Regel 2), sie fragen hier.
 *
 * Was die Regeln BEDEUTEN, steht nebenan in `gruppe.ts`: wie man hineinkommt, was
 * ein Austritt anrichtet, wer eine Gruppe erbt. Diese Datei führt sie aus und holt
 * die Daten dazu. Dieselbe Trennung wie `posts/filter.ts` neben `posts/hooks.ts`.
 */

/** Eine Gruppe samt allem, was eine Zeile in einer Liste braucht. */
export interface GruppenEintrag {
  gruppe: Group;
  /** Bin ich drin? Kommt aus `istMitglied()` — nie selbst `memberIds` durchsuchen. */
  mitglied: boolean;
  /** Habe ich eine Anfrage laufen, die noch niemand beantwortet hat? */
  angefragt: boolean;
}

/** Alle Gruppen, an denen ich beteiligt bin oder sein möchte — meine zuerst. */
export function useGruppenListe(): GruppenEintrag[] {
  const gruppen = useSlice('groups');
  const anfragen = useSlice('groupRequests');

  return useMemo(() => {
    const offen = new Set(
      anfragen
        .filter((a) => a.fromUserId === CURRENT_USER_ID && a.status === 'pending')
        .map((a) => a.groupId),
    );

    return gruppen
      // Phase 18a: Private Gruppen, in denen ich nicht bin, stehen hier nicht.
      // Die Regel steht in `gruppe.ts` (`inGruppenListe`), nicht hier — sonst
      // beantwortete dieser Haken eine Frage, die Ian entschieden hat.
      .filter((gruppe) => inGruppenListe(gruppe, CURRENT_USER_ID))
      .map((gruppe) => ({
        gruppe,
        mitglied: istMitglied(gruppe, CURRENT_USER_ID),
        angefragt: offen.has(gruppe.id),
      }))
      // Meine Gruppen oben, darunter die angefragten, darunter der Rest. Innerhalb
      // einer Stufe die größte zuerst: Eine Gruppe mit acht Leuten sagt mehr über
      // die Stadt aus als eine mit zwei, und der Screen ist zum Finden da.
      .sort((a, b) => rang(a) - rang(b) || b.gruppe.memberIds.length - a.gruppe.memberIds.length);
  }, [gruppen, anfragen]);
}

function rang(e: GruppenEintrag): number {
  if (e.mitglied) return 0;
  if (e.angefragt) return 1;
  return 2;
}

/** Nur meine Gruppen — für den Erstellen-Screen und die Zeile am Profil. */
export function useMeineGruppen(): Group[] {
  const gruppen = useSlice('groups');
  return useMemo(
    () => gruppen.filter((g) => istMitglied(g, CURRENT_USER_ID)),
    [gruppen],
  );
}

/** Eine einzelne Gruppe. `undefined`, wenn es die ID nicht (mehr) gibt. */
export function useGruppe(id: string | undefined): Group | undefined {
  const gruppen = useSlice('groups');
  return gruppen.find((g) => g.id === id);
}

/**
 * Die Mitglieder als ganze Menschen statt als IDs — der Gründer zuerst.
 *
 * Wer NICHT drin ist, bekommt eine leere Liste, auch wenn die Gruppe voll ist. Das
 * ist die Regel aus `gruppe.ts`: Von außen sieht man, DASS es eine Gruppe gibt und
 * wie viele drin sind, aber nicht WER. Sonst wäre eine geschlossene Gruppe ein
 * öffentliches Verzeichnis mit einem Schloss davor.
 */
export function useMitglieder(gruppe: Group | undefined): User[] {
  const userMap = useUserMap();

  return useMemo(() => {
    if (!gruppe || !istMitglied(gruppe, CURRENT_USER_ID)) return [];
    return gruppe.memberIds.flatMap((id) => {
      const u = userMap.get(id);
      return u ? [u] : [];
    });
  }, [gruppe, userMap]);
}

/**
 * Der Name der Gruppe an einem Post — für die Karte und das Detail.
 *
 * `null` heißt „dieser Post gehört keiner Gruppe". Kennt man die Gruppe nicht (weil
 * sie aufgelöst wurde), steht `GRUPPE_UNBEKANNT` da und kein leerer Platz.
 *
 * Warum ein Haken und keine reine Funktion: Der Name steht in der Gruppe, nicht am
 * Post. Ihn beim Posten mitzuspeichern wäre eine zweite Wahrheit — die Gruppe wird
 * umbenannt, und auf alten Karten steht der alte Name.
 */
export function useGruppenName(visibility: Visibility): string | null {
  const gruppen = useSlice('groups');
  if (visibility.kind !== 'group') return null;
  return gruppen.find((g) => g.id === visibility.groupId)?.name ?? null;
}

// ── Anlegen ──────────────────────────────────────────────────────────────────

/**
 * Was der Erstellen-Screen einsammelt. Wie bei `PostEntwurf` bewusst NICHT `Group`:
 * `id`, `creatorId`, `memberIds` und `createdAt` gehören nicht dem Formular — sie
 * entstehen beim Speichern, später auf dem Server.
 */
export interface GruppenEntwurf {
  name: string;
  description: string;
  category: ActivityCategory;
  district: string | null;
  /** Phase 18a. Voreingestellt auf `NEUE_GRUPPE_OFFEN` — Ians Entscheidung 28. */
  offen: boolean;
}

/** Gruppe anlegen. Gibt die neue ID zurück, damit der Screen dorthin springen kann. */
export function gruppeErstellen(entwurf: GruppenEntwurf): string {
  const id = neueId('g');

  aendern((alt) => {
    const neu: Group = {
      id,
      name: entwurf.name.trim(),
      description: entwurf.description.trim(),
      category: entwurf.category,
      district: entwurf.district,
      offen: entwurf.offen,
      creatorId: CURRENT_USER_ID,
      // Der Gründer ist Mitglied, und zwar an erster Stelle. Beides trägt: Er soll
      // seine eigene Gruppe im Feed sehen, und die Reihenfolge ist die Grundlage
      // für Ians Erbregel (`nachfolgerId` in `gruppe.ts`).
      memberIds: [CURRENT_USER_ID],
      createdAt: new Date().toISOString(),
    };
    return { groups: [...alt.groups, neu] };
  });

  return id;
}

// ── Beitreten ────────────────────────────────────────────────────────────────

/** Meine offene Anfrage an diese Gruppe — falls ich schon eine geschickt habe. */
export function useMeineGruppenAnfrage(gruppeId: string | undefined): GroupRequest | undefined {
  const anfragen = useSlice('groupRequests');
  return anfragen.find(
    (a) => a.groupId === gruppeId && a.fromUserId === CURRENT_USER_ID && a.status === 'pending',
  );
}

/**
 * Beitritt anfragen. Bei `BEITRITT === 'offen'` gäbe es keine Anfrage, sondern
 * sofort eine Mitgliedschaft — deshalb steht die Verzweigung hier und nicht im
 * Screen: Ein Wort in `gruppe.ts` soll den Ablauf ändern, nicht einen Screen.
 */
export function beitrittAnfragen(gruppeId: string, message: string): void {
  aendern((alt) => {
    const gruppe = alt.groups.find((g) => g.id === gruppeId);
    if (!gruppe) return {};
    if (istMitglied(gruppe, CURRENT_USER_ID)) return {};
    // Phase 18a: In eine private Gruppe kommt man nur auf Einladung. Der Screen
    // zeigt den Knopf gar nicht erst — das hier ist das Netz für den direkten
    // Link, dieselbe Vorsicht wie bei der Block-Prüfung ein paar Zeilen weiter.
    if (!gruppe.offen) return {};

    if (BEITRITT === 'offen') {
      return { groups: mitMitglied(alt.groups, gruppeId, CURRENT_USER_ID) };
    }
    if (BEITRITT === 'einladung') return {};

    // Doppelt drücken darf keine zweite Anfrage erzeugen — auf Web ist ein
    // Doppelklick schnell passiert. Dieselbe Vorsicht wie in `anfrageSenden`.
    const schonDa = alt.groupRequests.some(
      (a) => a.groupId === gruppeId && a.fromUserId === CURRENT_USER_ID && a.status === 'pending',
    );
    if (schonDa) return {};

    // Steht ein Block zum Gründer dazwischen, entsteht keine Anfrage. Der Screen
    // zeigt den Knopf gar nicht erst — das hier ist das Netz darunter, für den
    // direkten Link. Sicherheitsregeln gehören dorthin, wo Daten sich ändern.
    const ich = alt.users.find((u) => u.id === CURRENT_USER_ID);
    const gruender = alt.users.find((u) => u.id === gruppe.creatorId);
    if (ich && gruender && istBlockiert(ich, gruender)) return {};

    const neu: GroupRequest = {
      id: neueId('gr'),
      groupId: gruppeId,
      fromUserId: CURRENT_USER_ID,
      message: message.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    return { groupRequests: [...alt.groupRequests, neu] };
  });
}

/** Anfrage zurückziehen, solange sie noch offen ist. */
export function beitrittZuruecknehmen(gruppeId: string): void {
  aendern((alt) => ({
    groupRequests: alt.groupRequests.filter(
      (a) =>
        !(a.groupId === gruppeId && a.fromUserId === CURRENT_USER_ID && a.status === 'pending'),
    ),
  }));
}

/**
 * Bestätigen — Anfrage und Mitgliedschaft in EINEM `aendern` (harte Regel 6).
 *
 * Zwei getrennte Aufrufe hätten dazwischen einen Zustand, in dem die Anfrage schon
 * bestätigt, die Person aber noch draußen ist — und React zeichnet ihn: eine Zeile
 * „bestätigt" über einer Mitgliederliste ohne sie.
 *
 * Anders als `anfrageBestaetigen` bei einem Post entsteht hier KEIN Chat und wird
 * KEIN Platz belegt. Eine Gruppe ist kein Treffen; sie hat weder Plätze noch einen
 * Termin, an dem sie stattfindet.
 */
export function beitrittBestaetigen(anfrageId: string): void {
  aendern((alt) => {
    const anfrage = alt.groupRequests.find((a) => a.id === anfrageId);
    if (!anfrage || anfrage.status !== 'pending') return {};

    const gruppe = alt.groups.find((g) => g.id === anfrage.groupId);
    if (!gruppe) return {};
    // Nur der Gründer bestätigt — Ians Entscheidung 2. Das Netz gegen den
    // Doppelklick steckt in `mitMitglied`: eine ID zweimal in `memberIds` wäre eine
    // Person, die in der Liste doppelt steht und sich nur einmal entfernen lässt.
    if (!istGruender(gruppe, CURRENT_USER_ID)) return {};

    return {
      groupRequests: alt.groupRequests.map((a) =>
        a.id === anfrageId ? { ...a, status: 'accepted' as const } : a,
      ),
      groups: mitMitglied(alt.groups, gruppe.id, anfrage.fromUserId),
    };
  });
}

/** Ablehnen. Ohne Rückfrage — man kann erneut anfragen, wie bei einer Post-Absage. */
export function beitrittAblehnen(anfrageId: string): void {
  aendern((alt) => {
    const anfrage = alt.groupRequests.find((a) => a.id === anfrageId);
    if (!anfrage || anfrage.status !== 'pending') return {};
    const gruppe = alt.groups.find((g) => g.id === anfrage.groupId);
    if (!gruppe || !istGruender(gruppe, CURRENT_USER_ID)) return {};

    return {
      groupRequests: alt.groupRequests.map((a) =>
        a.id === anfrageId ? { ...a, status: 'declined' as const } : a,
      ),
    };
  });
}

// ── Verlassen ────────────────────────────────────────────────────────────────

/**
 * Die Gruppe verlassen. Hier laufen BEIDE Entscheidungen Ians vom 2026-09-02
 * zusammen — was mit den Posts passiert und wer die Gruppe erbt.
 *
 * Alles in EINEM `aendern` (harte Regel 6): Posts, Gruppe und offene Anfragen
 * ändern sich gemeinsam. Getrennt gäbe es einen Moment, in dem ich draußen bin, die
 * Gruppe aber noch mir gehört — und genau dann rechnet der Screen, ob er den
 * Verlassen-Knopf zeigt.
 */
export function gruppeVerlassen(gruppeId: string): void {
  aendern((alt) => {
    const gruppe = alt.groups.find((g) => g.id === gruppeId);
    if (!gruppe || !istMitglied(gruppe, CURRENT_USER_ID)) return {};

    const erbe = istGruender(gruppe, CURRENT_USER_ID)
      ? nachfolgerId(gruppe, CURRENT_USER_ID)
      : null;
    // Gründer ohne Nachfolger heißt: niemand mehr da. Die Gruppe verschwindet — und
    // mit ihr, was auf sie zeigt. Siehe `gruppe.ts`, Ians Entscheidung 2.
    const loest = istGruender(gruppe, CURRENT_USER_ID) && erbe === null;

    const restIds = gruppe.memberIds.filter((id) => id !== CURRENT_USER_ID);
    const groups = loest
      ? alt.groups.filter((g) => g.id !== gruppeId)
      : alt.groups.map((g) =>
          g.id === gruppeId
            ? { ...g, memberIds: restIds, creatorId: erbe ?? g.creatorId }
            : g,
        );

    return {
      groups,
      // Ians Entscheidung 1 steckt in `postsBeimAustritt` — hier steht nur, WELCHE
      // Posts sie überhaupt betrifft: meine, und nur die für DIESE Gruppe.
      posts: alt.posts.flatMap((p) => {
        if (p.authorId !== CURRENT_USER_ID) return [p];
        if (p.visibility.kind !== 'group' || p.visibility.groupId !== gruppeId) return [p];
        const behandelt = postsBeimAustritt(p);
        return behandelt ? [behandelt] : [];
      }),
      // Löst sich die Gruppe auf, gehen die Anfragen darauf mit. Eine Anfrage an
      // etwas, das es nicht mehr gibt, wäre eine Zeile im Anfragen-Tab, die niemand
      // beantworten kann und die niemand wegbekommt.
      groupRequests: loest
        ? alt.groupRequests.filter((a) => a.groupId !== gruppeId)
        : // Meine eigene alte Anfrage auf diese Gruppe ist erledigt: Ich war ja
          // drin. Ohne das stünde nach dem Austritt „Anfrage läuft" bei einer
          // Gruppe, die ich gerade verlassen habe.
          alt.groupRequests.filter(
            (a) => !(a.groupId === gruppeId && a.fromUserId === CURRENT_USER_ID),
          ),
    };
  });
}

/**
 * Eine ID in `memberIds` aufnehmen, falls sie noch nicht drinsteht.
 *
 * Gibt bei nichts zu tun die UNVERÄNDERTE Liste zurück — dieselbe Überlegung wie
 * `mitOderOhne` in `social/hooks.ts`: React vergleicht mit `===`, eine gleich
 * aussehende Kopie wäre eine Änderung und zeichnete umsonst neu.
 */
function mitMitglied(groups: Group[], gruppeId: string, userId: string): Group[] {
  return groups.map((g) => {
    if (g.id !== gruppeId || g.memberIds.includes(userId)) return g;
    // Hinten anhängen, nie vorne: Die Reihenfolge IST die Beitrittsreihenfolge und
    // damit Ians Erbregel (`nachfolgerId`).
    return { ...g, memberIds: [...g.memberIds, userId] };
  });
}

// ── Anfragen ansehen (für den Anfragen-Tab) ──────────────────────────────────

/** Eine Beitritts-Anfrage mit allem, was eine Zeile zeigen muss. */
export interface GruppenAnfrageEintrag {
  anfrage: GroupRequest;
  /** Bei eingehenden: wer hinein will. Bei gesendeten: wem die Gruppe gehört. */
  person: User;
  gruppe: Group;
}

/** Alle offenen Anfragen auf EINE meiner Gruppen — im Screen eine Gruppe mit Kopf. */
export interface GruppenAnfragenGruppe {
  gruppe: Group;
  eintraege: GruppenAnfrageEintrag[];
}

/**
 * Wie viele Leute auf meine Bestätigung warten — zusammen mit den Post-Anfragen die
 * Zahl am Anfragen-Tab.
 *
 * Bewusst ein eigener Haken neben `useOffeneAnfragen` und nicht in ihn hinein: Der
 * dort gibt `JoinRequest[]` zurück, und eine Liste, in der zwei verschiedene Sachen
 * liegen, muss jeder Aufrufer wieder auseinandernehmen. Addiert wird im Tab-Layout,
 * einmal.
 */
export function useOffeneGruppenAnfragen(): GroupRequest[] {
  const anfragen = useSlice('groupRequests');
  const gruppen = useSlice('groups');
  const meine = new Set(
    gruppen.filter((g) => istGruender(g, CURRENT_USER_ID)).map((g) => g.id),
  );
  return anfragen.filter((a) => a.status === 'pending' && meine.has(a.groupId));
}

/** Die eingehenden Beitritts-Anfragen, gruppiert nach Gruppe. */
export function useEingehendeGruppenAnfragen(): GruppenAnfragenGruppe[] {
  const anfragen = useSlice('groupRequests');
  const gruppen = useSlice('groups');
  const userMap = useUserMap();

  return useMemo(() => {
    const ich = userMap.get(CURRENT_USER_ID);
    const ergebnis: GruppenAnfragenGruppe[] = [];

    for (const gruppe of gruppen) {
      if (!istGruender(gruppe, CURRENT_USER_ID)) continue;

      const eintraege: GruppenAnfrageEintrag[] = [];
      for (const anfrage of anfragen) {
        if (anfrage.groupId !== gruppe.id || anfrage.status !== 'pending') continue;
        const person = userMap.get(anfrage.fromUserId);
        if (!person) continue;
        // Phase 7: Wer blockiert ist, taucht auch hier nicht auf — sonst stünde ein
        // Aufnehmen-Knopf für jemanden, mit dem man nichts mehr zu tun haben will.
        if (ich && istBlockiert(ich, person)) continue;
        eintraege.push({ anfrage, person, gruppe });
      }
      if (eintraege.length === 0) continue;
      // Die älteste zuerst: Wer zuerst gefragt hat, steht zuerst da — dieselbe
      // Regel wie bei den Post-Anfragen.
      eintraege.sort((a, b) => a.anfrage.createdAt.localeCompare(b.anfrage.createdAt));
      ergebnis.push({ gruppe, eintraege });
    }

    return ergebnis;
  }, [anfragen, gruppen, userMap]);
}

/** Was ICH angefragt habe — das Neueste zuerst, wie im Feed. */
export function useGesendeteGruppenAnfragen(): GruppenAnfrageEintrag[] {
  const anfragen = useSlice('groupRequests');
  const gruppen = useSlice('groups');
  const userMap = useUserMap();

  return useMemo(() => {
    const ich = userMap.get(CURRENT_USER_ID);
    const eintraege: GruppenAnfrageEintrag[] = [];

    for (const anfrage of anfragen) {
      if (anfrage.fromUserId !== CURRENT_USER_ID) continue;
      if (anfrage.status === 'declined') continue;
      const gruppe = gruppen.find((g) => g.id === anfrage.groupId);
      if (!gruppe) continue;
      const person = userMap.get(gruppe.creatorId);
      if (!person) continue;
      if (ich && istBlockiert(ich, person)) continue;
      eintraege.push({ anfrage, person, gruppe });
    }

    return eintraege.sort((a, b) => b.anfrage.createdAt.localeCompare(a.anfrage.createdAt));
  }, [anfragen, gruppen, userMap]);
}

// ── Einladen (Phase 18a) ─────────────────────────────────────────────────────

/**
 * Eine Einladung samt allem, was eine Zeile braucht.
 *
 * Zwei Personen, nicht eine: Bei einer eingehenden Einladung will man wissen, WER
 * einen geholt hat — bei „Marswiese Tennis" ist das der Unterschied zwischen „Lea
 * hat mich geholt" und „irgendwer hat mich geholt".
 */
export interface EinladungEintrag {
  einladung: GroupInvite;
  /** Wer eingeladen hat. */
  von: User;
  gruppe: Group;
}

/**
 * Wen ich in diese Gruppe holen kann — und in welchem Zustand er gerade ist.
 *
 * `zustand` statt eines Booleans, weil es vier verschiedene Sätze sind und ein
 * `disabled`-Knopf keinen davon sagen kann.
 */
export interface EinladbarEintrag {
  person: User;
  zustand: 'einladbar' | 'drin' | 'eingeladen' | 'angefragt';
}

/**
 * Wen kann ich überhaupt einladen?
 *
 * ── Warum BEIDE Richtungen des Folgens ────────────────────────────────────────
 * Die Liste ist mein Folge-Graph: wem ich folge UND wer mir folgt, zusammengelegt.
 * Nur eine Richtung zu nehmen wäre eine Regel, die man nicht erklären kann — wer
 * seinen Tennispartner einladen will und ihn nicht findet, weil er ihm zwar folgt,
 * aber nicht gefolgt wird, hält die App für kaputt. Das ist genau die Sorte
 * Sackgasse, die Leopold eine Ebene höher gemeldet hat.
 *
 * ── Warum überhaupt eine Schranke ─────────────────────────────────────────────
 * Sie ist die Gegenleistung für Ians Entscheidung 26 (jedes Mitglied darf
 * einladen): Wer holt, holt aus seinem eigenen Umfeld, nicht aus dem
 * Nutzerverzeichnis von ganz Wien. Bewusst ANDERS als `SCHREIB_REGEL`
 * (gegenseitiges Folgen) in `chat/direkt.ts` — eine Nachricht landet ungefragt bei
 * jemandem, eine Einladung ist eine Frage, die man mit einem Tipp wegwischt.
 *
 * Blockierte Leute stehen nicht drin, in keiner Richtung (`istBlockiert`).
 */
export function useEinladbare(gruppe: Group | undefined): EinladbarEintrag[] {
  const einladungen = useSlice('groupInvites');
  const anfragen = useSlice('groupRequests');
  const userMap = useUserMap();

  return useMemo(() => {
    const ich = userMap.get(CURRENT_USER_ID);
    if (!gruppe || !ich || !darfEinladen(gruppe, CURRENT_USER_ID)) return [];

    // `Set` und nicht `concat`: Wer mir folgt UND dem ich folge, stünde sonst
    // zweimal in der Liste — mit demselben `key`, und React beschwert sich zu Recht.
    const bekannte = new Set([...ich.followingIds, ...ich.followerIds]);

    const eingeladen = new Set(
      einladungen
        .filter((e) => e.groupId === gruppe.id && e.status === 'pending')
        .map((e) => e.toUserId),
    );
    const angefragt = new Set(
      anfragen
        .filter((a) => a.groupId === gruppe.id && a.status === 'pending')
        .map((a) => a.fromUserId),
    );

    const eintraege: EinladbarEintrag[] = [];
    for (const id of bekannte) {
      const person = userMap.get(id);
      if (!person) continue;
      if (istBlockiert(ich, person)) continue;

      // Die Reihenfolge der Prüfungen IST die Rangfolge der Auskünfte: „drin"
      // sticht „eingeladen", weil eine angenommene Einladung beides wahr macht.
      const zustand = istMitglied(gruppe, person.id)
        ? ('drin' as const)
        : eingeladen.has(person.id)
          ? ('eingeladen' as const)
          : angefragt.has(person.id)
            ? ('angefragt' as const)
            : ('einladbar' as const);

      eintraege.push({ person, zustand });
    }

    // Wen man holen KANN, zuerst — der Rest ist Auskunft, keine Handlung. Innerhalb
    // einer Stufe alphabetisch, damit die Liste sich nicht bei jedem Öffnen neu
    // sortiert (`Set` behält die Einfügereihenfolge, und die hängt an zwei Listen).
    const rangE = { einladbar: 0, angefragt: 1, eingeladen: 2, drin: 3 };
    return eintraege.sort(
      (a, b) =>
        rangE[a.zustand] - rangE[b.zustand] ||
        a.person.displayName.localeCompare(b.person.displayName),
    );
  }, [gruppe, einladungen, anfragen, userMap]);
}

/**
 * Jemanden einladen.
 *
 * ⚠️ Führt `EINLADEN_DARF` aus — aber nur zwei seiner drei Werte vollständig. Bei
 * `'mitglied-schlaegt-vor'` müsste hier eine Einladung entstehen, die der GRÜNDER
 * erst freigibt, und dafür bräuchte `GroupInvite` einen vierten Zustand. Das ist
 * die eine Stelle in diesem Ordner, an der ein Wechsel der Regel mehr ist als ein
 * Wort — deshalb steht es hier und nicht nur im Kopf von `gruppe.ts`.
 */
export function einladen(gruppeId: string, toUserId: string): void {
  aendern((alt) => {
    const gruppe = alt.groups.find((g) => g.id === gruppeId);
    if (!gruppe) return {};
    if (!darfEinladen(gruppe, CURRENT_USER_ID)) return {};
    if (EINLADEN_DARF === 'mitglied-schlaegt-vor' && !istGruender(gruppe, CURRENT_USER_ID)) {
      return {};
    }
    if (istMitglied(gruppe, toUserId)) return {};

    // Zweimal tippen darf keine zweite Einladung erzeugen — dieselbe Vorsicht wie
    // in `beitrittAnfragen`. Ohne das stünde die Person doppelt in der Liste des
    // Empfängers und er müsste zweimal absagen.
    const schonDa = alt.groupInvites.some(
      (e) => e.groupId === gruppeId && e.toUserId === toUserId && e.status === 'pending',
    );
    if (schonDa) return {};

    const ich = alt.users.find((u) => u.id === CURRENT_USER_ID);
    const ziel = alt.users.find((u) => u.id === toUserId);
    if (!ich || !ziel || istBlockiert(ich, ziel)) return {};

    const neu: GroupInvite = {
      id: neueId('gi'),
      groupId: gruppeId,
      fromUserId: CURRENT_USER_ID,
      toUserId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    return { groupInvites: [...alt.groupInvites, neu] };
  });
}

/**
 * Eine Einladung annehmen — Einladung, Mitgliedschaft und die eigene alte Anfrage
 * in EINEM `aendern` (harte Regel 6).
 *
 * ── Die dritte Änderung ist die, die man vergisst ─────────────────────────────
 * Man kann angefragt HABEN und trotzdem eingeladen werden: Ein Mitglied sieht, dass
 * jemand hinein will, und holt ihn direkt, statt auf den Gründer zu warten. Genau
 * dieser Fall steht in `data/mock.ts` (gr3 und gi1 zeigen beide auf g3). Bliebe die
 * Anfrage stehen, stünde im Anfragen-Tab „Wartet" bei einer Gruppe, in der man
 * schon drin ist — und im Tab des Gründers eine Zeile, die er beantworten soll.
 */
export function einladungAnnehmen(einladungId: string): void {
  aendern((alt) => {
    const einladung = alt.groupInvites.find((e) => e.id === einladungId);
    if (!einladung || einladung.status !== 'pending') return {};
    if (einladung.toUserId !== CURRENT_USER_ID) return {};

    const gruppe = alt.groups.find((g) => g.id === einladung.groupId);
    if (!gruppe) return {};

    return {
      groupInvites: alt.groupInvites.map((e) =>
        e.id === einladungId ? { ...e, status: 'accepted' as const } : e,
      ),
      groups: mitMitglied(alt.groups, gruppe.id, CURRENT_USER_ID),
      groupRequests: alt.groupRequests.filter(
        (a) => !(a.groupId === gruppe.id && a.fromUserId === CURRENT_USER_ID),
      ),
    };
  });
}

/**
 * Eine Einladung ablehnen. Ohne Rückfrage — wie eine abgelehnte Anfrage: Man kann
 * erneut eingeladen werden, es geht nichts unwiederbringlich verloren.
 */
export function einladungAblehnen(einladungId: string): void {
  aendern((alt) => {
    const einladung = alt.groupInvites.find((e) => e.id === einladungId);
    if (!einladung || einladung.status !== 'pending') return {};
    if (einladung.toUserId !== CURRENT_USER_ID) return {};

    return {
      groupInvites: alt.groupInvites.map((e) =>
        e.id === einladungId ? { ...e, status: 'declined' as const } : e,
      ),
    };
  });
}

/** Meine offene Einladung in DIESE Gruppe — für die Gruppenseite. */
export function useMeineEinladung(gruppeId: string | undefined): GroupInvite | undefined {
  const einladungen = useSlice('groupInvites');
  return einladungen.find(
    (e) => e.groupId === gruppeId && e.toUserId === CURRENT_USER_ID && e.status === 'pending',
  );
}

/**
 * Alle Einladungen, die auf meine Antwort warten — für den Anfragen-Tab.
 *
 * Sie liegen dort im selben Tab und in derselben Zahl wie die Beitritts-Anfragen,
 * obwohl sie das Gegenteil davon sind. Der Grund ist derselbe wie in Phase 17: Für
 * den EMPFÄNGER ist es dieselbe Sache — jemand will etwas von mir, und ich sage ja
 * oder nein. Wonach die App gliedert, ist der Zustand, nicht die Herkunft (dieselbe
 * Überlegung wie harte Regel 30 bei der Chat-Liste).
 */
export function useMeineEinladungen(): EinladungEintrag[] {
  const einladungen = useSlice('groupInvites');
  const gruppen = useSlice('groups');
  const userMap = useUserMap();

  return useMemo(() => {
    const ich = userMap.get(CURRENT_USER_ID);
    const eintraege: EinladungEintrag[] = [];

    for (const einladung of einladungen) {
      if (einladung.toUserId !== CURRENT_USER_ID || einladung.status !== 'pending') continue;
      const gruppe = gruppen.find((g) => g.id === einladung.groupId);
      if (!gruppe) continue;
      // Bin ich inzwischen anders hineingekommen (über meine eigene Anfrage), ist
      // die Einladung gegenstandslos. Sie hier zu verstecken ist richtiger, als sie
      // beim Bestätigen wegzuräumen: Der Gründer weiß nichts von der Einladung.
      if (istMitglied(gruppe, CURRENT_USER_ID)) continue;
      const von = userMap.get(einladung.fromUserId);
      if (!von) continue;
      if (ich && istBlockiert(ich, von)) continue;
      eintraege.push({ einladung, von, gruppe });
    }

    // Die neueste zuerst — anders als bei den eingehenden Anfragen, und aus dem
    // umgekehrten Grund: Dort ist die Reihenfolge eine Fairness („wer zuerst
    // gefragt hat"), hier ist sie eine Neuigkeit.
    return eintraege.sort((a, b) =>
      b.einladung.createdAt.localeCompare(a.einladung.createdAt),
    );
  }, [einladungen, gruppen, userMap]);
}
