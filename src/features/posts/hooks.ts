import * as Location from 'expo-location';
import { useEffect, useMemo } from 'react';

import { CURRENT_USER_ID, aendern, getState, neueId, useSlice } from '../store';
import { istMitglied } from '../groups/gruppe';
import { istBlockiert } from '../safety/hooks';
import { useUserMap } from '../social/hooks';

import {
  BEZIRK_ALLE,
  passtZumAlter,
  passtZumBezirk,
  passtZumText,
  passtZurZeit,
  type BezirkFilter,
  type WannFilter,
} from './filter';
import { istAktuell } from './lifecycle';
import { gehoertAufsProfil } from './profil';
import { STANDORT_FRISCHE_MS, type MeinOrt, type StandortStand } from './standort';
import { vergleichePosts } from './sort';
import { gehoertInDenStapel, type StapelKontext } from './wisch';

import type { ActivityCategory, Group, Post, PostAlter, SkillLevel, User, Visibility } from '@/types/models';

/**
 * Der Zugang zu Posts. Screens lesen NIE aus `data/mock.ts` (harte Regel 2 aus
 * CLAUDE.md) — sie fragen hier.
 *
 * Was ein Screen bekommt, ist bewusst schon zusammengesetzt: Post UND Verfasser.
 * Eine echte Datenbankabfrage würde beides in einem Rutsch liefern; wenn die Screens
 * sich jetzt schon so verhalten, ändert sich beim Umstieg auf Firestore nichts an
 * ihnen.
 */

/** Ein Post samt seinem Verfasser — was eine Karte im Feed braucht. */
export interface FeedEintrag {
  post: Post;
  author: User;
}

/** "alle" ist bewusst Teil des Typs: der Feed hat immer genau einen Zustand, nie keinen. */
export type KategorieFilter = ActivityCategory | 'alle';

/**
 * Was gerade im Feed eingestellt ist.
 *
 * Seit Phase 15 sind es sechs Angaben statt zwei. Sie stehen bewusst in EINEM
 * Objekt und nicht als sechs Parameter: Der Screen reicht es unverändert an
 * `useFeed` und `useStapel` weiter, und damit ist garantiert, dass beide Ansichten
 * dasselbe zeigen (harte Regel 16). Sechs Einzelwerte hätte man beim nächsten
 * Filter an vier Stellen nachziehen müssen — und eine davon vergessen.
 *
 * Was die einzelnen Werte BEDEUTEN, steht in `filter.ts`, nicht hier.
 */
export interface FeedFilter {
  kategorie: KategorieFilter;
  /** Nur Posts von Leuten, denen ich folge. */
  nurGefolgte: boolean;
  /**
   * Wo. Drei Stufen: überall, ein bestimmter Bezirk, oder ausdrücklich die Posts
   * OHNE Bezirksangabe. Phase 15, seit Phase 19b ein Union statt `string | null` —
   * die Begründung steht bei `BezirkFilter` in `filter.ts`.
   */
  bezirk: BezirkFilter;
  /** Zeitfenster. Phase 15. */
  wann: WannFilter;
  /**
   * Für welche Jahrgänge. `{ kind: 'egal' }` heißt „alles zeigen". Phase 15,
   * seit Phase 18b eine Spanne statt eines Bandes.
   *
   * Bewusst derselbe Typ wie am Post: Beide tragen dieselben Daten und deuten sie
   * gleich. Was sie unterscheidet, ist die REGEL — und die steht in `passtZumAlter`.
   */
  alter: PostAlter;
  /** Freitext über Titel und Notiz. Leer heißt „nicht suchen". Phase 15. */
  suche: string;
}

/**
 * Der Zustand, in dem der Feed nichts wegnimmt.
 *
 * Steht hier und nicht im Screen, weil ihn zwei Stellen brauchen: der Anfangswert
 * beim Öffnen und „Filter zurücksetzen". Zwei Kopien derselben sechs Werte wären
 * zwei Gelegenheiten, dass ein Zurücksetzen etwas stehen lässt.
 */
export const FILTER_LEER: FeedFilter = {
  kategorie: 'alle',
  nurGefolgte: false,
  bezirk: BEZIRK_ALLE,
  wann: 'egal',
  alter: { kind: 'egal' },
  suche: '',
};

/** Wie viele Filter gerade etwas wegnehmen — für die Zahl am Filter-Knopf. */
export function aktiveFilter(filter: FeedFilter): number {
  let n = 0;
  if (filter.kategorie !== 'alle') n += 1;
  if (filter.nurGefolgte) n += 1;
  if (filter.bezirk.kind !== 'alle') n += 1;
  if (filter.wann !== 'egal') n += 1;
  if (filter.alter.kind !== 'egal') n += 1;
  if (filter.suche.trim() !== '') n += 1;
  return n;
}

/**
 * Darf ICH diesen Post überhaupt sehen?
 *
 * Das ist KEIN Filter, den man wegklicken kann, sondern die Sichtbarkeitsregel des
 * Verfassers: "nur meine Follower" heißt, dass ihn nur sieht, wer dem Verfasser
 * folgt. Eigene Posts sieht man immer.
 *
 * Im Prototyp entscheidet das der Browser. Mit echtem Backend muss dieselbe Regel
 * ZUSÄTZLICH auf dem Server stehen (Firestore Security Rules) — was der Browser
 * filtert, hat er vorher trotzdem heruntergeladen.
 */
function darfIchSehen(
  post: Post,
  verfasser: User,
  ichId: string,
  meineGruppen: Set<string>,
): boolean {
  if (post.authorId === ichId) return true;

  switch (post.visibility.kind) {
    case 'public':
      return true;
    case 'followers':
      return verfasser.followerIds.includes(ichId);
    case 'group':
      // Phase 17, die dritte Stufe. Gefragt wird an der Mitgliedschaft, NICHT am
      // Folgen: Wer in der Gruppe ist, sieht den Post, auch wenn er dem Verfasser
      // nicht folgt — genau dafür gibt es Gruppen. Und wer eine Anfrage laufen hat,
      // sieht noch nichts; „auf Anfrage" hieße sonst „auf Anfrage, aber lesen darfst
      // du sofort".
      return meineGruppen.has(post.visibility.groupId);
  }
}

/**
 * Die IDs meiner Gruppen als Menge — einmal je Feed statt einmal je Post.
 *
 * Bei vierzehn Posts ist das egal, bei dreihundert nicht: `memberIds.includes()` je
 * Post und je Gruppe ist eine Schleife in einer Schleife, und der Feed rechnet bei
 * jedem Tastendruck in der Suche neu.
 */
function meineGruppenIds(gruppen: Group[], ichId: string): Set<string> {
  const menge = new Set<string>();
  for (const g of gruppen) if (istMitglied(g, ichId)) menge.add(g.id);
  return menge;
}

/**
 * Der Block als EIGENE Regel neben `darfIchSehen` — bewusst nicht hineingezogen.
 *
 * Beide werfen Posts aus dem Feed, aber aus verschiedenen Gründen, und `useProfilPosts`
 * zählt die von `darfIchSehen` verworfenen als `verborgen` („3 Posts sind nur für
 * Follower sichtbar"). Stünde der Block mit drin, stünde dieser Satz auf dem Profil
 * einer blockierten Person — und würde damit ausgerechnet dort etwas verraten, wo
 * nichts mehr zu sehen sein soll.
 *
 * Phase 7. Die Wirkung geht in beide Richtungen, gespeichert ist sie nur einmal
 * (`features/safety/hooks.ts`).
 */
function blockDazwischen(ich: User, verfasser: User): boolean {
  return istBlockiert(ich, verfasser);
}

/**
 * Der Feed: gefiltert, sortiert, fertig für die Anzeige.
 *
 * Die Reihenfolge kommt aus `sort.ts` — seit Ians Entscheidung vom 2026-08-31 steht
 * dort „das Neueste zuerst".
 */
export function useFeed(filter: FeedFilter): FeedEintrag[] {
  const posts = useSlice('posts');
  const gruppen = useSlice('groups');
  const userMap = useUserMap();
  const ich = userMap.get(CURRENT_USER_ID);
  /** Phase 19h-2. Ist `null`, solange niemand den Schalter umgelegt hat. */
  const meinOrt = useMeinOrt();

  // Neu messen, wenn die letzte Messung alt ist — **hier und nicht in einem
  // Zeitgeber**: Ein Intervall misst auch, während niemand hinschaut, und kostet
  // Strom für eine Antwort, die keiner liest. Der Feed ist die einzige Stelle, an
  // der der Ort etwas BEWIRKT, also fragt er selbst nach. `standortAuffrischen`
  // hält sich an `STANDORT_FRISCHE_MS` und tut meistens gar nichts — deshalb ist
  // die leere Abhängigkeitsliste hier richtig und nicht faul: Der Effekt soll beim
  // Öffnen des Feeds laufen, nicht bei jeder Filteränderung.
  useEffect(() => {
    void standortAuffrischen();
  }, []);

  return useMemo(() => {
    if (!ich) return [];
    const jetzt = new Date();
    const meineGruppen = meineGruppenIds(gruppen, ich.id);

    const eintraege: FeedEintrag[] = [];
    for (const post of posts) {
      const author = userMap.get(post.authorId);
      if (!author) continue;
      if (blockDazwischen(ich, author)) continue;
      if (!darfIchSehen(post, author, ich.id, meineGruppen)) continue;
      if (!istAktuell(post, jetzt)) continue;
      if (filter.kategorie !== 'alle' && post.category !== filter.kategorie) continue;
      if (filter.nurGefolgte && !ich.followingIds.includes(post.authorId)) continue;
      // Phase 15. Die Reihenfolge ist nicht beliebig: erst die billigen Vergleiche
      // (ein Feldvergleich), zuletzt die Suche — sie baut für jeden Post eine
      // normalisierte Zeichenkette. Bei 300 Posts ist das der Unterschied zwischen
      // „tippt flüssig" und „hakt beim Schreiben".
      if (!passtZumBezirk(post, filter.bezirk)) continue;
      if (!passtZumAlter(post, filter.alter)) continue;
      if (!passtZurZeit(post, filter.wann, jetzt)) continue;
      if (!passtZumText(post, filter.suche)) continue;
      eintraege.push({ post, author });
    }

    // Kopie sortieren, nicht das Original: `sort` verändert das Array an Ort und
    // Stelle, und `posts` gehört dem Speicher.
    return eintraege.sort((a, b) =>
      vergleichePosts(a.post, b.post, { jetzt, meinBezirk: ich.district, meinOrt }),
    );
    // `filter` ist im Screen ein `useMemo` über seine sechs Werte — es als Ganzes
    // aufzuführen ist deshalb dasselbe wie sechs einzelne Einträge, nur ohne die
    // Gelegenheit, beim siebten Filter einen zu vergessen.
  }, [posts, gruppen, userMap, ich, filter, meinOrt]);
}

/**
 * Welche Bezirke im Feed gerade überhaupt vorkommen — für die Auswahl im Filter.
 *
 * ── Warum nicht einfach alle 23 Bezirke ──────────────────────────────────────
 * Eine Liste mit 23 Pillen, von denen 20 zu einem leeren Feed führen, ist keine
 * Auswahl, sondern ein Ratespiel. Was hier steht, ist stattdessen eine Auskunft:
 * „Heute ist in 1070, 1100 und 1220 etwas los." Damit beantwortet die Reihe eine
 * Frage, noch bevor man sie stellt.
 *
 * ── Warum der Bezirksfilter dabei ausgeschaltet wird ─────────────────────────
 * Der Hook sieht denselben Feed wie der Screen, aber mit `bezirk: null`. Ohne das
 * wäre die Liste nach dem ersten Tipp genau EINEN Eintrag lang — den, den man
 * gerade gewählt hat — und man käme nicht mehr heraus, ohne zurückzusetzen.
 *
 * Alle ANDEREN Filter gelten weiter, und das ist Absicht: Wer auf „Sport" steht,
 * soll die Bezirke sehen, in denen Sport stattfindet, nicht die mit Kaffee.
 */
/*
 * ⚠️ **Seit Phase 19h ruft diesen Haken niemand mehr auf.** Ians Entscheidung 63
 * hat die Bezirks-Pillenreihe im Filterblatt gestrichen, und sie war die einzige
 * Stelle, die ihn brauchte.
 *
 * Er bleibt trotzdem stehen — dieselbe Überlegung wie bei der Kartenblase
 * (harte Regel 51): Sie wurde in 19e-1 aus der Anzeige genommen, elf Tage später
 * hat ein Aufruf sie zurückgeholt, und weil niemand sie gelöscht hatte, war es
 * wirklich nur ein Aufruf. **Wer eine geprüfte Arbeit ausbaut, löscht sie nicht.**
 * Was in ihm steckt, ist außerdem eine Falle, die sich sonst jemand neu einfängt:
 * Ein Filter, der seine eigene Auswahlliste füttert, sperrt sich selbst ein.
 */
export function useBezirkeImFeed(filter: FeedFilter): string[] {
  const { proBezirk } = useBezirksZaehlung(filter);
  // Aufsteigend. Postleitzahlen sind alle vierstellig, deshalb sortiert die
  // Zeichenkettenordnung hier genauso wie eine Zahlenordnung.
  return useMemo(() => Object.keys(proBezirk).sort(), [proBezirk]);
}

/**
 * Wie viele Posts je Bezirk — die Zahlen, aus denen die Wien-Karte ihre Farben nimmt
 * (Phase 19b).
 *
 * ── Warum das DIESELBE Funktion ist wie die Filter-Auswahl ───────────────────
 * `useBezirkeImFeed` leitet seine Liste seit Phase 19b aus dieser Zählung ab und
 * rechnet nicht mehr selbst. Der Grund ist die Regel, die in beiden steckt und die
 * man leicht ein zweites Mal falsch schreibt: **Beim Zählen wird genau der
 * Bezirksfilter ausgeschaltet und sonst keiner.** Stünde sie zweimal da, sähe die
 * Karte eines Tages andere Bezirke als die Filterreihe — und auffallen würde es nur
 * dem, der beides nebeneinander hält.
 *
 * Auf der Karte hat dieselbe Regel eine zweite Wirkung, die es im Filter nicht gab:
 * Ohne sie zeigte die Karte nach dem ersten Tipp **eine einzige eingefärbte Fläche
 * in einem grauen Wien** — und der einzige Weg zurück wäre der Zurücksetzen-Knopf.
 * Das ist die Phase-15-Falle, nur sichtbarer.
 *
 * `ohneBezirk` ist der zweite Rückgabewert und nicht wegzulassen: Posts ohne
 * Bezirksangabe (seit dem 2026-09-02 möglich) haben auf einer Karte keinen Ort. Eine
 * Ansicht, die sie stillschweigend verschluckt, ist genau die Sorte Fehler, gegen die
 * `LeererFeed` und `StapelDurch` seit dem 2026-09-03 auseinandergehalten werden —
 * deshalb stehen sie als eigene Zeile unter der Karte (Ians Entscheidung 31).
 */
export function useBezirksZaehlung(filter: FeedFilter): {
  proBezirk: Record<string, number>;
  ohneBezirk: number;
} {
  const ohneBezirkFilter = useMemo(() => ({ ...filter, bezirk: BEZIRK_ALLE }), [filter]);
  const eintraege = useFeed(ohneBezirkFilter);

  return useMemo(() => {
    const proBezirk: Record<string, number> = {};
    let ohneBezirk = 0;
    for (const e of eintraege) {
      const bezirk = e.post.district;
      if (bezirk) proBezirk[bezirk] = (proBezirk[bezirk] ?? 0) + 1;
      else ohneBezirk += 1;
    }
    return { proBezirk, ohneBezirk };
  }, [eintraege]);
}

/** Ein einzelner Post samt Verfasser — für `post/[id]`. */
export function usePost(id: string | undefined): FeedEintrag | undefined {
  const posts = useSlice('posts');
  const userMap = useUserMap();

  return useMemo(() => {
    const post = posts.find((p) => p.id === id);
    if (!post) return undefined;
    const author = userMap.get(post.authorId);
    if (!author) return undefined;
    return { post, author };
  }, [posts, userMap, id]);
}

/** Wie viele Plätze noch frei sind. Nie negativ, auch wenn die Daten mal nicht stimmen. */
export function freiePlaetze(post: Post): number {
  return Math.max(0, post.spotsTotal - post.spotsFilled);
}

/** Ist der Post noch offen für Anfragen? */
export function istOffen(post: Post): boolean {
  return post.status === 'open' && freiePlaetze(post) > 0;
}

// ── Posten ───────────────────────────────────────────────────────────────────

/**
 * Was der Erstellen-Screen einsammelt.
 *
 * Bewusst NICHT einfach `Post`: `id`, `authorId`, `createdAt`, `status` und
 * `spotsFilled` gehören nicht dem Formular. Sie entstehen beim Speichern, und mit
 * echtem Backend entstehen sie auf dem Server. Ein Screen, der sie mitschickt,
 * würde etwas behaupten, das er nicht wissen kann — und beim Umstieg auf Firestore
 * müsste man ihn wieder anfassen.
 */
export type PostEntwurf = {
  category: ActivityCategory;
  title: string;
  /** `null` heisst "kein Bezirk angegeben" — Ians Entscheidung vom 2026-09-02. */
  district: string | null;
  startsAt: string;
  /** Wann der Post aus dem Feed verschwindet — gerechnet in `lifecycle.ts`. */
  expiresAt: string;
  level: SkillLevel;
  /** Für wen die Aktivität gedacht ist. Phase 15, Voreinstellung `egal`. */
  alter: PostAlter;
  spotsTotal: number;
  note: string;
  meetingPoint?: string;
  visibility: Visibility;
};

/**
 * Einen Post anlegen. Gibt die neue ID zurück, damit der Screen direkt dorthin
 * springen kann — der beste Beweis, dass es geklappt hat.
 *
 * Kein Haken (`use…`), sondern eine reine Aktion: sie liest nichts und zeichnet
 * nichts neu, sie ändert nur den Speicher. Die Screens erfahren es über ihre Haken.
 */
export function postErstellen(entwurf: PostEntwurf): string {
  const id = neueId('p');

  aendern((alt) => {
    const neu: Post = {
      ...entwurf,
      id,
      authorId: CURRENT_USER_ID,
      spotsFilled: 0,
      status: 'open',
      createdAt: new Date().toISOString(),
      // Ein leeres Textfeld ist im Datenmodell KEIN leerer String, sondern gar kein
      // Treffpunkt (`meetingPoint?`). Das Detail zeigt darauf "Machen wir im Chat aus"
      // statt einer leeren Zeile.
      meetingPoint: entwurf.meetingPoint?.trim() ? entwurf.meetingPoint.trim() : undefined,
      title: entwurf.title.trim(),
      note: entwurf.note.trim(),
    };
    return { posts: [...alt.posts, neu] };
  });

  return id;
}

// ── Phase 6: die Posts einer Person ──────────────────────────────────────────

export interface ProfilPosts {
  /** Was auf dem Profil steht — schon gefiltert und sortiert. */
  eintraege: FeedEintrag[];
  /**
   * Wie viele laufende Posts diese Person hat, die ich NICHT sehen darf — getrennt
   * nach dem GRUND. Das Profil macht daraus eine Zeile je Grund: eine Zahl ist der
   * ehrlichste Grund zu folgen, den die App geben kann, und verrät nichts über den
   * Inhalt.
   *
   * Seit Phase 17 zwei Zahlen statt einer, und das war kein Schönheitsfehler,
   * sondern eine falsche Auskunft: Der Satz lautete „N Posts sind nur für Follower
   * sichtbar", und ein Gruppen-Post wäre stillschweigend mitgezählt worden — mit
   * dem Rat, zu folgen, der bei einer Gruppe nichts nützt.
   *
   * Der Gruppenname steht bewusst NICHT dabei. Er würde verraten, in welcher
   * Gruppe jemand ist, und das gehört zu dem, was eine geschlossene Gruppe
   * zurückhält (`useMitglieder` in `groups/hooks.ts`).
   */
  verborgen: { follower: number; gruppe: number };
}

/**
 * Alle Posts einer Person für ihr Profil.
 *
 * Drei Regeln greifen hier hintereinander, und sie sind bewusst getrennt:
 *   0. Steht ein BLOCK dazwischen (`blockDazwischen`) — dann ist das Profil leer,
 *      noch bevor die anderen beiden überhaupt gefragt werden. Phase 7.
 *   1. DARF ich ihn sehen (`darfIchSehen`) — die Sichtbarkeitsregel des Verfassers,
 *      dieselbe wie im Feed.
 *   2. GEHÖRT er aufs Profil (`gehoertAufsProfil`) — Ians Regel 6.6, nur Zeit.
 *
 * Wären sie eine Funktion, könnte man `verborgen` nicht zählen: dann wüsste man am
 * Ende nur, dass ein Post fehlt, aber nicht, warum.
 */
export function useProfilPosts(userId: string | undefined): ProfilPosts {
  const posts = useSlice('posts');
  const gruppen = useSlice('groups');
  const userMap = useUserMap();
  const meinOrt = useMeinOrt();

  return useMemo(() => {
    const leer = { eintraege: [], verborgen: { follower: 0, gruppe: 0 } };
    const person = userId ? userMap.get(userId) : undefined;
    if (!person) return leer;

    // Ein Block leert das Profil, ohne `verborgen` hochzuzählen — sonst stünde dort
    // „N Posts sind nur für Follower sichtbar" und die leere Seite hätte eine falsche
    // Erklärung. Was der Screen STATTDESSEN zeigt, entscheidet er selbst: Habe ich
    // blockiert, steht dort der Aufheben-Knopf; hat die andere Person mich blockiert,
    // sieht es aus wie ein Profil ohne Pläne. Das ist Absicht (`safety/hooks.ts`).
    const ich = userMap.get(CURRENT_USER_ID);
    if (ich && blockDazwischen(ich, person)) return leer;

    const jetzt = new Date();
    const ctx = { jetzt };
    const meineGruppen = meineGruppenIds(gruppen, CURRENT_USER_ID);
    const eintraege: FeedEintrag[] = [];
    const verborgen = { follower: 0, gruppe: 0 };

    for (const post of posts) {
      if (post.authorId !== person.id) continue;
      if (!gehoertAufsProfil(post, ctx)) continue;
      if (!darfIchSehen(post, person, CURRENT_USER_ID, meineGruppen)) {
        // Nach dem GRUND zählen, nicht bloß zählen. `'public'` kommt hier nie an —
        // ein öffentlicher Post ist immer sichtbar —, aber der Zweig steht da,
        // damit eine vierte Stufe eines Tages einen Typfehler auslöst statt still
        // unter „Follower" zu landen.
        if (post.visibility.kind === 'group') verborgen.gruppe += 1;
        else verborgen.follower += 1;
        continue;
      }
      eintraege.push({ post, author: person });
    }

    // Dieselbe Reihenfolge wie im Feed — ein Profil ist ein Feed mit nur einem
    // Verfasser, und zwei Reihenfolgen für dieselbe Sache müsste man erklären.
    //
    // ⚠️ Hier stand bis Phase 19h `person.district` — der Bezirk der ANGESCHAUTEN
    // Person. Das war folgenlos, solange `vergleichePosts` seinen Kontext gar nicht
    // las (er hieß dort `_ctx`); seit Entscheidung 63 wären Leas Posts nach der
    // Entfernung von LEAS Wohnung sortiert gewesen. Sortiert wird für den, der
    // schaut. **Ein ungenutzter Parameter ist einer, den nie jemand geprüft hat.**
    return {
      eintraege: eintraege.sort((a, b) =>
        // `meinOrt` gehört hier genauso dazu wie im Feed: Sortiert wird für den, der
        // SCHAUT — das ist die Berichtigung aus 19h-1, eine Ebene weitergedacht.
        vergleichePosts(a.post, b.post, { jetzt, meinBezirk: ich?.district ?? '', meinOrt }),
      ),
      verborgen,
    };
  }, [posts, gruppen, userMap, userId, meinOrt]);
}

/**
 * Die laufenden Posts EINER Gruppe — für die Gruppenseite.
 *
 * ── Ist das nicht der verworfene Gruppen-Feed? ────────────────────────────────
 * Nein, und der Unterschied ist der ganze Punkt von Ians Entscheidung 1: Verworfen
 * war ein eigener TAB je Gruppe, weil er den Hauptfeed geleert hätte — man wäre
 * dort und nicht mehr im Feed. Diese Liste zeigt dieselben Posts, die im Hauptfeed
 * ohnehin stehen, noch einmal an einem Ort, den man gezielt aufsucht. Genau wie ein
 * Profil: `useProfilPosts` ist auch „der Feed einer Person" und hat den Feed nie
 * ersetzt.
 *
 * Wer nicht drin ist, bekommt eine leere Liste — dieselbe Regel wie bei
 * `useMitglieder`. Das ist nicht doppelt gemoppelt zu `darfIchSehen`: Der Aufrufer
 * ist ein anderer Screen, und eine Sicherheitsregel, die nur an einer von zwei
 * Stellen steht, ist eine, die man an der zweiten vergisst.
 */
export function useGruppenPosts(gruppe: Group | undefined): FeedEintrag[] {
  const posts = useSlice('posts');
  const userMap = useUserMap();
  const meinOrt = useMeinOrt();

  return useMemo(() => {
    if (!gruppe || !istMitglied(gruppe, CURRENT_USER_ID)) return [];
    const ich = userMap.get(CURRENT_USER_ID);
    const jetzt = new Date();

    const eintraege: FeedEintrag[] = [];
    for (const post of posts) {
      if (post.visibility.kind !== 'group' || post.visibility.groupId !== gruppe.id) continue;
      if (!istAktuell(post, jetzt)) continue;
      const author = userMap.get(post.authorId);
      if (!author) continue;
      if (ich && blockDazwischen(ich, author)) continue;
      eintraege.push({ post, author });
    }

    // Dieselbe Reihenfolge wie im Feed — zwei Reihenfolgen für dieselbe Sache
    // müsste die App erklären.
    return eintraege.sort((a, b) =>
      // `meinBezirk` ist am Menschen Pflicht; der Ersatz greift nur, wenn der
      // eigene Nutzer fehlt — und dann ist an den Daten grundlegend etwas kaputt.
      vergleichePosts(a.post, b.post, { jetzt, meinBezirk: ich?.district ?? '', meinOrt }),
    );
  }, [posts, userMap, gruppe, meinOrt]);
}

// ── Phase 11: der Wischstapel ────────────────────────────────────────────────

/**
 * Der Stapel: derselbe Feed, nur strenger.
 *
 * Bewusst AUF `useFeed` aufgesetzt und nicht daneben gebaut. Der Umschalter im
 * Screen wechselt die Darstellung, nicht die Daten — Kategorie, "Wem ich folge",
 * Sichtbarkeitsregeln, Blocks und die Reihenfolge sind in beiden Ansichten
 * dieselben. Zwei getrennte Abfragen wären zwei Gelegenheiten, das auseinander-
 * laufen zu lassen, und aufgefallen wäre es erst jemandem, der umschaltet und
 * plötzlich etwas anderes sieht.
 *
 * Was der Stapel zusätzlich wegnimmt, steht in `wisch.ts` — es ist Ians Regel,
 * nicht die Meinung dieses Hakens.
 */
export function useStapel(filter: FeedFilter): FeedEintrag[] {
  const eintraege = useFeed(filter);
  const anfragen = useSlice('joinRequests');
  const weggewischt = useSlice('weggewischt');

  return useMemo(() => {
    const ctx: StapelKontext = {
      ichId: CURRENT_USER_ID,
      // Die Regel fragt, sie rechnet nicht — siehe `StapelKontext` in `wisch.ts`.
      istOffen,
      angefragt: new Set(
        anfragen.filter((a) => a.fromUserId === CURRENT_USER_ID).map((a) => a.postId),
      ),
      weggewischt: new Set(weggewischt),
    };
    return eintraege.filter((e) => gehoertInDenStapel(e.post, ctx));
  }, [eintraege, anfragen, weggewischt]);
}

/**
 * Nach links gewischt: raus aus dem Stapel.
 *
 * Ians Regel `'sitzung'` (`wisch.ts`) steckt genau hier — die ID landet im Speicher
 * und sonst nirgends. Wäre die Regel `'immer'`, käme an dieser Stelle ein Schreiben
 * in `localStorage` dazu; alles andere in der App bliebe gleich. Das ist der Grund,
 * warum die Regel eine Zeile und keine Umbauaktion ist.
 *
 * Doppelt gewischt gibt es nicht: Die Prüfung verhindert, dass dieselbe ID zweimal
 * in der Liste steht — sonst würde ein einziges "Rückgängig" sie nicht mehr los.
 */
export function wegwischen(postId: string): void {
  aendern((alt) => (alt.weggewischt.includes(postId) ? {} : { weggewischt: [...alt.weggewischt, postId] }));
}

/** "Rückgängig" — die Karte kommt an ihren Platz im Stapel zurück. */
export function wischRueckgaengig(postId: string): void {
  aendern((alt) => ({ weggewischt: alt.weggewischt.filter((id) => id !== postId) }));
}

// ── Phase 19h-2: der Standort ────────────────────────────────────────────────
//
// Die REGEL steht in `standort.ts`, hier steht nur die Ausführung — dieselbe
// Trennung wie zwischen `wisch.ts` und `wegwischen()` acht Zeilen weiter oben.
//
// **Eine Datei, kein Plattform-Zweig, und ein GEWÖHNLICHER Import.** `expo-location`
// bringt für den Browser eine eigene Umsetzung mit (`navigator.geolocation`); anders
// als bei `SsKarte` (harte Regel 52) sind es nicht zwei Bibliotheken, sondern eine
// mit zwei Böden, und anders als bei `SsGlas` (Regel 61) wird beim Laden kein
// `requireNativeViewManager` gerufen — es gibt keine View, nur Funktionen. Damit
// fällt beide Male der Grund für eine Plattform-Endung weg.
//
// ⚠️ Hier stand zuerst ein `await import('expo-location')`, als Vorsicht gegen genau
// den Ladezeitpunkt, den es hier gar nicht gibt. Der Preis war real: Der Dev-Server
// bündelt lazy, also wurde daraus ein NACHGELADENER Brocken — und der braucht Metro
// ausgerechnet in dem Moment, in dem jemand den Schalter drückt. Beim Prüfen ist
// genau das passiert. **Eine Vorsichtsmaßnahme gegen ein Problem, das man nicht hat,
// ist keine Vorsicht, sondern eine zusätzliche Fehlerquelle.**

/**
 * Der Standort, wie der Rest der App ihn sieht.
 *
 * Gibt **nur** den Ort zurück, nicht den Zustand — wer sortiert, soll nicht wissen
 * können, ob jemand die Erlaubnis verweigert hat. Der Schalter in den Einstellungen
 * nimmt `useStandortStand()` eine Zeile weiter unten.
 */
export function useMeinOrt(): MeinOrt {
  return useSlice('standort').ort;
}

/** Für den Schalter in den Einstellungen — der braucht den ganzen Stand. */
export function useStandortStand(): StandortStand {
  return useSlice('standort');
}

/**
 * Anschalten: fragen, messen, eintragen.
 *
 * ── Warum hier zwei Aufrufe stehen und nicht einer ───────────────────────────
 * `requestForegroundPermissionsAsync()` zeigt den Systemdialog **nur beim ersten
 * Mal**. Danach antwortet es sofort mit dem gemerkten Ergebnis, ohne dass etwas zu
 * sehen ist. Ein Schalter, der beim zweiten Umlegen scheinbar nichts tut, ist genau
 * der Fall, für den `STANDORT_FRAGE = 'einstellung'` gebaut ist: Der Screen zeigt
 * über `standortFolgen('verweigert')`, dass der Weg zurück über die Systemeinstel-
 * lungen führt — die App kann ihn nicht selbst gehen.
 */
export async function standortAnschalten(): Promise<void> {
  if (!(await Location.hasServicesEnabledAsync().catch(() => true))) {
    aendern(() => ({ standort: { zustand: 'unmoeglich', ort: null, gemessenUm: null } }));
    return;
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    aendern(() => ({ standort: { zustand: 'verweigert', ort: null, gemessenUm: null } }));
    return;
  }

  // `Balanced` und nicht `Highest`: Die Frage lautet „in welcher Ecke von Wien bin
  // ich?", und die beantworten hundert Meter genauso gut wie fünf. `Highest` weckt
  // dafür das GPS auf und kostet spürbar Strom — für eine Genauigkeit, die in einer
  // Reihenfolge ohnehin untergeht (siehe die Bezirksmitten in `lib/karte-geo.ts`).
  const messung = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  }).catch(() => null);

  if (!messung) {
    aendern(() => ({ standort: { zustand: 'unmoeglich', ort: null, gemessenUm: null } }));
    return;
  }

  aendern(() => ({
    standort: {
      zustand: 'an',
      ort: { latitude: messung.coords.latitude, longitude: messung.coords.longitude },
      gemessenUm: Date.now(),
    },
  }));
}

/**
 * Ausschalten.
 *
 * Der Ort wird dabei **gelöscht**, nicht nur ignoriert — das ist der sichtbare Teil
 * der Zusage aus `standort.ts`. Die iOS-Erlaubnis bleibt bestehen; sie zurückzunehmen
 * kann nur die Person selbst, und das ist richtig so.
 */
export function standortAusschalten(): void {
  aendern(() => ({ standort: { zustand: 'aus', ort: null, gemessenUm: null } }));
}

/**
 * Neu messen, wenn die letzte Messung älter ist als `STANDORT_FRISCHE_MS`.
 *
 * Aufgerufen wird das dort, wo der Ort WIRKT (im Feed), und nicht in einem
 * Zeitgeber: Ein Intervall würde auch messen, während die App gar nicht angeschaut
 * wird — Strom für eine Antwort, die niemand liest.
 */
export async function standortAuffrischen(): Promise<void> {
  const stand = getState().standort;
  if (stand.zustand !== 'an') return;
  if (stand.gemessenUm !== null && Date.now() - stand.gemessenUm < STANDORT_FRISCHE_MS) return;
  await standortAnschalten();
}
