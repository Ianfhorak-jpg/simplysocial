import type { ActivityCategory } from '@/types/models';

/**
 * Farben. Grundlage ist PLAN.md, Abschnitt 3 — mit zwei Änderungen von Ian
 * am 2026-08-31: Sport ist gelb statt grün, Essen grün statt Terrakotta.
 *
 * Aufbau: eine ruhige Grundfläche, die sich nie ändert, und darüber sechs kräftige
 * Aktivitätsfarben. Der Feed lebt von den Aktivitätsfarben — die Grundfläche hält sich
 * bewusst zurück, damit sie wirken können.
 *
 * ── Seit dem 2026-09-14 ist die Grundfläche DUNKEL (Ians Entscheidung 84) ────
 * Ians Satz: *„ICH WILL LIQUID GLASS VON APPLE DIREKT NICHT VON DIR NACHGEBAUT."*
 * Der gemessene Befund war, dass es Apples echtes Glas IST (`expo-glass-effect`
 * → `UIGlassEffect`) — **es ist nur unsichtbar, weil dahinter Papierweiß lag.**
 * Glas zeigt sich als UNTERSCHIED zum Untergrund; wo keiner ist, ist auch kein
 * Glas zu sehen. *Mehr Glas einzubauen hätte daran nichts geändert.*
 *
 * **Es gibt KEIN umschaltbares Theme.** Die ganze App baut ihre Styles mit
 * `StyleSheet.create` auf Modulebene; ein Laufzeit-Theme hätte 58 Dateien zu
 * Hooks umgebaut. Ian wollte „die ganze App dunkel", nicht einen Umschalter.
 *
 * ── Was die Umkehr überlebt hat und was nicht ───────────────────────────────
 * **Die sechs `base` sind unangetastet.** Sie sind das Erkennungszeichen der
 * Kategorie; Sport bleibt `#EDA803`. Ebenso `deep` und `onBase`: Das sind
 * ÖRTLICHE Verhältnisse — ein Element gegen sich selbst, vom Untergrund
 * unabhängig. **Zwei Drittel der gemessenen Werte gelten unverändert weiter.**
 *
 * Neu gemischt wurde, was mit dem Untergrund zu tun hat: `soft` (eine Fläche
 * GEHÖRT zum Untergrund — `#FDF2D8` wäre auf Dunkel ein Leuchtfleck), das daraus
 * folgende `onSoft`, und `accent`, der sich umdreht. Dazu ein fünfter Wert
 * `aufGrund`, den es auf hellem Grund nicht brauchte.
 *
 * Bewacht von `npm run pruef-farben` (`supabase/pruefen/32_farben.py`) — der
 * Prüfstand wurde am HELLEN Stand geschrieben und war dort grün, bevor hier eine
 * Zeile umgestellt wurde. Ein Prüfstand, den man erst nach der Änderung zum
 * ersten Mal laufen lässt, kann nicht unterscheiden, ob er einen echten Fehler
 * gefunden hat oder selbst falsch ist.
 */

/**
 * Grundfläche — gilt in der ganzen App gleich. Seit dem 2026-09-14 dunkel.
 *
 * Alle Werte gegen `bg` gemessen (WCAG), die alten Zahlen in Klammern:
 *
 *   ink      16,03  (war 16,73)  — praktisch unverändert, nur gespiegelt
 *   inkSoft   5,78  (war  4,59)  — besser als vorher
 *   surface   1,20  (war  1,05)  — die Karte hebt sich MEHR ab als früher
 *   line      1,32  (war  1,19)
 *
 * ⚠️ **Warum `surface` so nah an `bg` liegen darf und sich trotzdem stärker
 * abhebt als die reinweiße Karte von früher:** Im Nenner der WCAG-Formel steht
 * `+ 0,05`. Im Dunkeln ist dieser Term groß gegenüber der Luminanz und wirkt wie
 * eine Lupe — 5 % Weißanteil ergeben schon 1,14. **Für das Glas ist das genau
 * richtig:** Jede helle Fläche ist Untergrund, den das Glas nicht mehr zeigen
 * kann. Weniger Fläche, mehr Glas.
 */
export const colors = {
  bg: '#14161A', // fast schwarz (Ians Entscheidung 84), nicht #000: Reinschwarz nimmt dem Glas die Tiefe
  surface: '#24262A', // Karten — nur 7 % heller als bg und trotzdem deutlicher als früher (siehe oben)
  ink: '#F2F1ED', // Text: das Papierweiß von früher, jetzt als Schrift. Nicht #FFF — das sticht auf Dunkel
  inkSoft: '#8B929E', // Sekundärtext: derselbe Blaugrau-Ton wie früher (#6B7280), aufgehellt
  line: '#2C2D31', // Trennlinien
} as const;

/**
 * Eine Aktivitätsfarbe besteht aus fünf Werten:
 *   base     — der Farbstreifen, gefüllte Buttons, die Farbe der Kategorie SELBST
 *   soft     — Flächen hinter base (Kategorie-Pillen, Karten-Kopf)
 *   deep     — der Umriss und die Tiefe am Button
 *   onBase   — die Textfarbe AUF base
 *   onSoft   — die Textfarbe AUF soft
 *   aufGrund — dieser Farbton, LESBAR auf der Grundfläche
 *
 * ── Warum es `aufGrund` erst seit dem Dunkelmodus gibt ──────────────────────
 * Auf Papierweiß war `aufGrund` immer `= base` — deshalb hat niemand den Wert
 * vermisst, und deshalb steht an acht Stellen der App `…base` als VORDERGRUND
 * (ein Icon, eine Beschriftung, die Wortmarke). Auf Dunkel stimmt das nicht mehr:
 * `culture.base` kommt dort auf 3,23 und `accent.base` auf 1,74.
 *
 * **`base` aufzuhellen wäre die falsche Antwort gewesen** — das ist eine
 * Identitätsänderung, Sport wäre nicht mehr Sport. Stattdessen ein eigener Wert,
 * und zwar als PFLICHTFELD im Interface: `tsc` schreibt damit die Arbeitsliste,
 * statt dass jemand sie von Hand zusammensucht (dieselbe Technik wie `IconName`
 * in Phase 14). Zwei Kategorien brauchen gar keinen neuen Ton — Sport (8,80) und
 * Outdoor (4,66) sind auf Dunkel von sich aus lesbar, dort ist `aufGrund = base`
 * und das ist kein Versehen.
 *
 * Die beiden `on…`-Farben gibt es, seit Sport gelb ist. Vorher stand überall pauschal
 * weißer Text auf base und base als Text auf soft — mit Gelb ergab das 1,85:1, also
 * praktisch unlesbar. Statt das an jeder Stelle neu zu entscheiden, bringt jede Farbe
 * ihre passenden Textfarben gleich mit; dann kann man es beim nächsten Farbwunsch
 * nicht mehr vergessen.
 *
 * Alle Werte sind gemessen, nicht geschätzt (WCAG-Kontrastverhältnis):
 * onBase/onSoft erreichen mindestens 4,5:1, deep mindestens 2,0:1 gegen base —
 * darunter sieht man die Tiefe des Buttons nicht mehr. `aufGrund` erreicht
 * 4,5:1 gegen `colors.bg`.
 *
 * ⚠️ **Eine Ausnahme steht seit jeher da und ist keine Folge des Dunkelmodus:**
 * `outdoor.onBase/base` ist **3,88** — unter WCAG AA. Das war am hellen Stand
 * genauso und ist in `32_farben.py`, Abschnitt 4, als Befund eingefroren, damit
 * nach der Umkehr unterscheidbar bleibt, was SIE kaputt gemacht hat.
 */
export interface CategoryPalette {
  base: string;
  soft: string;
  deep: string;
  onBase: string;
  onSoft: string;
  /** Dieser Farbton, lesbar auf `colors.bg`. Auf hellem Grund wäre er `= base`. */
  aufGrund: string;
}

/**
 * ⚠️ **`soft` ist der einzige Wert, der seine RICHTUNG geändert hat.** Der alte
 * Kommentar sagte es selbst: *„Flächen hinter base"* — eine Fläche gehört zum
 * Untergrund. Früher hieß das „Farbton Richtung Weiß" (`#FDF2D8`), jetzt heißt
 * es „Farbton Richtung Grund": 16 % der Kategoriefarbe in `bg` eingerührt.
 * `#FDF2D8` auf `#14161A` wäre ein Leuchtfleck gewesen, keine ruhige Fläche.
 * Weil `soft` von hell nach dunkel gewandert ist, musste `onSoft` mitwandern —
 * aus einem mitteldunklen Ton wird ein heller.
 */
export const categoryColors: Record<ActivityCategory, CategoryPalette> = {
  // Gelb — als einzige Farbe hell genug, dass der Text darauf dunkel sein muss.
  // Und die einzige, die auf dem dunklen Grund BESSER dasteht als vorher: 8,80
  // statt 1,95. ⚠️ Deshalb ist ein Blick auf einen Sport-Post kein Beleg dafür,
  // dass die Umkehr überall gelungen ist.
  sport: { base: '#EDA803', soft: '#372D16', deep: '#A47402', onBase: '#17191C', onSoft: '#EDA803', aufGrund: '#EDA803' },
  food: { base: '#2E7D5B', soft: '#182624', deep: '#1B4A36', onBase: '#FFFFFF', onSoft: '#58977C', aufGrund: '#478D6F' },
  study: { base: '#3D6BC2', soft: '#1B2435', deep: '#243F72', onBase: '#FFFFFF', onSoft: '#688CCF', aufGrund: '#5880CB' },
  culture: { base: '#7B4FC2', soft: '#241F35', deep: '#462D6F', onBase: '#FFFFFF', onSoft: '#9B79D1', aufGrund: '#936FCD' },
  outdoor: { base: '#6B8C28', soft: '#22291C', deep: '#435819', onBase: '#FFFFFF', onSoft: '#7A983E', aufGrund: '#6B8C28' },
  creative: { base: '#C23D7B', soft: '#301C2A', deep: '#74254A', onBase: '#FFFFFF', onSoft: '#CF6898', aufGrund: '#CB588D' },
};

/**
 * Die Farbe für Aktionen, die zu keiner Kategorie gehören ("Bin dabei" im Detail,
 * "Posten"). Bewusst keine der sechs Kategoriefarben, sonst behauptet der Button
 * eine Kategorie, die er nicht meint.
 *
 * `base` ist bewusst NICHT reines Schwarz wie der Text (Ians Anmerkung vom 2026-08-31,
 * er hat den Schatten nicht gesehen): der Tiefen-Rand darunter ist schwarz, und zwischen
 * #17191C und #000000 liegt ein Kontrast von 1,15:1 — man sieht schlicht keinen
 * Unterschied, der Button hatte seine Tiefe verloren. #3E4043 ist der hellste Ton, der
 * noch klar als "dunkler Knopf" liest und gegen Schwarz auf 2,0:1 kommt.
 *
 * ── Seit dem Dunkelmodus dreht diese Palette sich um, und die Begründung oben
 *    gilt SPIEGELVERKEHRT (2026-09-14) ────────────────────────────────────────
 * Der Absatz darüber bleibt stehen, weil seine Logik weiter trägt — nur die
 * Richtung kippt. Die BEDEUTUNG von `accent` ist „Knopf ohne Kategorie", und er
 * erreichte sie dadurch, **dunkler als die Seite** zu sein (9,88:1 gegen
 * Papierweiß). Auf `#14161A` kommt `#3E4043` auf **1,74** — ein unsichtbarer
 * Knopf. Ein neutraler Knopf muss auf dunklem Grund **hell** sein.
 *
 * Und Ians Beobachtung wiederholt sich gespiegelt: `base` darf jetzt nicht
 * reines WEISS sein, denn dann müsste `deep` noch heller sein als Weiß.
 * `#FFFFFF` gegen `#E8E7E3` ergibt 1,24:1 — genau der Fall von damals, nur
 * andersherum. **Auf Dunkel ist „tiefer" DUNKLER:** `#9A9995` gegen `#E8E7E3`
 * kommt auf 2,30:1 und ist der geringste Eingriff, der die Tiefe sichtbar lässt.
 */
export const accent: CategoryPalette = {
  base: '#E8E7E3', // hell statt dunkel — 14,64 gegen bg (war 9,88 gegen Papierweiß)
  soft: '#282A2F',
  deep: '#9A9995', // „tiefer" heißt auf Dunkel dunkler, nicht heller — 2,30 gegen base
  onBase: '#17191C', // dreht mit: dunkler Text auf hellem Knopf
  onSoft: '#9EA3AB',
  aufGrund: '#E8E7E3', // = base, weil base schon hell ist
};

/**
 * Rot — für Absagen, Blockieren, Melden. Aufgebaut wie jede andere Palette, damit der
 * Button-Baustein sie ohne Sonderfall verarbeiten kann.
 *
 * Gemessen wie alles andere: Weiß auf `base` 5,46:1 · `deep` gegen `base` 2,12:1 ·
 * `onSoft` auf Weiß 7,01:1. Der naheliegende Ton #7A1C18 als `deep` kam auf 1,92:1 —
 * unter der Grenze von 2,0, ab der man die Tiefe des Knopfes nicht mehr sieht.
 *
 * ⚠️ **`aufGrund` ist hier kein Schönheitswert.** In `einstellungen.tsx:287` steht
 * `danger.base` als Beschriftung unter „Konto löschen" — auf Dunkel wären das
 * **3,32**, also ein Warnhinweis, den man schlechter liest als den Rest der Seite.
 */
export const danger: CategoryPalette = {
  base: '#C2352F',
  soft: '#301B1D',
  deep: '#6E1916',
  onBase: '#FFFFFF',
  onSoft: '#D26A65',
  aufGrund: '#CE5D59', // 4,60 gegen bg — für Text und Icons, nie für Flächen
};

/**
 * Zustandsfarben — sparsam einsetzen, sie sollen aus den Kategoriefarben herausstechen.
 *
 * Bewusst aus `danger` abgeleitet und nicht noch einmal hingeschrieben: dasselbe Rot an
 * zwei Stellen ist zwei Wahrheiten, und die laufen beim nächsten Farbwunsch auseinander.
 */
export const status = {
  danger: danger.base, // Zahl am Anfragen-Tab, Ablehnen, Blockieren, Melden
  dangerSoft: danger.soft,
  dangerAufGrund: danger.aufGrund, // Warntext DIREKT auf der Grundfläche, ohne Knopf darunter
} as const;

/** Die sechs Kategorien in der Reihenfolge, in der sie überall auftauchen sollen. */
export const CATEGORY_ORDER = [
  'sport',
  'food',
  'study',
  'culture',
  'outdoor',
  'creative',
] as const satisfies readonly ActivityCategory[];
