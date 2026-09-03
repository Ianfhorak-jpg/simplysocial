import { useMemo } from 'react';

import { istBlockiert } from '../safety/hooks';
import { useUserMap } from '../social/hooks';
import { CURRENT_USER_ID, aendern, neueId, useSlice } from '../store';

import { istGruender, istMitglied, nachfolgerId, postsBeimAustritt, BEITRITT } from './gruppe';

import type { ActivityCategory, Group, GroupRequest, User, Visibility } from '@/types/models';

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
