# SimplySocial — die 105 harten Regeln

> Herausgelöst aus `CLAUDE.md` am 2026-09-13. **Kein Zeichen geändert** — nur
> verschoben, damit die auto-geladene `CLAUDE.md` nicht mehr ~101.500 Tokens je
> Sitzung kostet. Der Index dazu steht in `../CLAUDE.md`; **wer hier etwas anfasst,
> zieht den Index mit.**
>
> Volltext mit Begründung, verworfenen Möglichkeiten und Messung. Regeln mit `nicht ohne Rückfrage` sind Ians Entscheidungen (harte Regel 58).

---

## Harte Regeln

1. **Kein Firebase, kein Login, kein Netzwerk im Prototyp.** Bei ACTA hat genau das die
   Web-Preview kaputtgemacht (`@react-native-firebase` ist native-only, brauchte Shims).
2. **Screens lesen niemals direkt aus `mock.ts`** — immer über die Hooks. Sonst ist der
   spätere Backend-Tausch eine Suchen-und-Ersetzen-Aktion durch alle Dateien.
3. **Der Name `SimplySocial` steht an genau einer Stelle** (`src/config/brand.ts`).
4. **`_FUER_IAN/OFFENE_SACHEN.md` pflegen**, sobald etwas auftaucht, das nur Ian kann.
5. **Zurück-Knöpfe nehmen `zurueckOderFeed()`** aus `src/lib/navigation.ts`, nie blankes
   `router.back()`. Auf Web kann jeder Screen direkt per Link geöffnet werden — dann gibt
   es kein Zurück, und der Knopf tut sichtbar nichts. Ab Phase 8 ist das der Normalfall.
   Seit Phase 3 gibt es dafür den Baustein `<SsBack />` — den nehmen, nicht selbst bauen.
   **Seit Phase 19f trägt er kein Wort mehr, nur den Pfeil** (Ians Entscheidung 52).
   Die `label`-Prop gibt es weiter, sie ist jetzt das `accessibilityLabel` — ein Knopf
   ohne Namen ist für VoiceOver ein Knopf ohne Funktion. **Und die Fläche ist der
   Preis dafür:** 44 × 44 pt sind Apples Mindestmaß, ein nackter Pfeil misst 22. Wer
   an dem Baustein etwas ändert, misst die Fläche nach — sie ist die einzige, die die
   ganze App auf einmal verliert.
6. **Was zusammengehört, in EINEM `aendern`.** `anfrageBestaetigen` ändert Anfrage, Post
   und Chat in einem Aufruf; `nachrichtSenden` (Phase 5) die Nachricht und das
   `lastMessageAt` am Faden. Zwei getrennte Aufrufe hätten dazwischen einen Zustand, in
   dem die Anfrage bestätigt, der Platz aber noch frei ist — und React zeichnet ihn.
7. **Profil-Inhalt kommt aus `components/Profil.tsx`**, nie direkt in einen der beiden
   Profil-Screens. Sonst zeigt das eigene Profil irgendwann etwas anderes als das, was
   Fremde sehen — und man merkt es nicht.
8. **Eine Folge-Beziehung steht ZWEIMAL im Datenmodell** (`followingIds` bei mir,
   `followerIds` beim anderen). Nur über `folgen` / `entfolgen` aus `social/hooks.ts`
   anfassen — die pflegen beide Seiten in einem `aendern`.
9. **Der Chat-Screen ist die eine begründete Ausnahme von „Eingabefeld → `scroll`".**
   `app/chat/[id].tsx` hat die Eingabe fest unten; die Begründung steht im Dateikopf.
   Wer die nächste Ausnahme macht, schreibt sie genauso hin.
10. **Ein BLOCK steht nur EINMAL im Datenmodell** (`blockedIds` beim Blockierenden) —
   genau umgekehrt zu Regel 8, und aus demselben Grund richtig: Wer blockiert wird, darf
   es nicht merken. Gefragt wird trotzdem in beide Richtungen, über `istBlockiert(a, b)`
   aus `safety/hooks.ts`. Nie selbst `blockedIds` durchsuchen — sonst prüft man eine
   Richtung und die andere nicht, und es fällt niemandem auf.
11. **Jede neue dynamische Route braucht `generateStaticParams`** (aus
   `features/statisch.ts`, nie aus `mock.ts` — das wäre Regel 2). Ohne sie heißt die
   gebaute Datei `[id].html` und jeder Direktaufruf ist 404. Im Dev-Server sieht man das
   nicht, erst auf der echten Adresse. Verschachtelte Kinder unter einem `[id]` brauchen
   eine eigene — der Parameter vererbt sich beim Bauen nicht.
12. **Fake-Daten enthalten nichts Persönliches** — keine Schule, keine Klasse, keinen
   Namen einer echten Person, die nicht gefragt wurde. Seit Phase 8 ist der Prototyp
   öffentlich abrufbar, und Links werden weitergeleitet. Begründung im Kopf von
   `data/mock.ts`.
13. **`landing/stil.css` ist eine KOPIE des Design-Systems, keine Verbindung.** Eine
   Farbe in `src/theme/colors.ts` zu ändern ändert die Landing-Page NICHT mit — beides
   zusammen anfassen, sonst sieht die Seite eines Tages anders aus als die App.
14. **Die Landing-Page bekommt kein Formular ohne Backend.** Eine Warteliste, die nichts
   speichert, ist schlimmer als keine.
15. **Im Wischstapel gehört der Tipp der KARTE, nicht ihrem Inhalt.** `PostCard`
   bekommt dort kein `onPress`; `WischKarte` entscheidet beim Loslassen, ob es ein
   Tipp oder ein Wisch war — und merkt sich dafür, ob sich in der ganzen Berührung
   etwas bewegt hat. Grund: Ein Browser schickt nach jedem Ziehen zusätzlich ein
   `click`, das React Native nicht kennt und nicht abbestellen kann. Mit `onPress` im
   Inhalt wischt man die Karte weg UND landet im Post-Detail.
16. **Der Stapel liest über `useStapel`, und das liest über `useFeed`.** Nicht daneben
   bauen — sonst zeigen die beiden Ansichten eines Tages Verschiedenes, und auffallen
   würde es nur dem, der umschaltet. Was der Stapel zusätzlich wegnimmt, entscheidet
   `posts/wisch.ts`.
17. **Was ein Block bewirkt, steht in `safety/block.ts` und nirgends sonst.** Screens
   lesen nie `BLOCK_WIRKUNG`, sie sehen nur das Ergebnis; Sätze über die Folgen eines
   Blocks kommen aus `blockFolgen()`. Sonst verspricht irgendwann ein Screen etwas, das
   die Regel nicht mehr tut.
18. **Die Vorschau im Erstellen-Screen ist kein Extra, sie ist die Absicherung.** Seit
   Phase 12 liegen acht der zehn Felder hinter „Mehr einstellen" und haben
   Voreinstellungen (`STANDARD` in `app/create.tsx`). Die Vorschau ist die einzige
   Stelle, an der man Zeit, Bezirk und Plätze sieht, ohne aufzuklappen. Wer sie
   entfernt, verkleinert oder nach unten schiebt, macht aus dem Screen ein Formular,
   das stillschweigend Termine erfindet. Und: **die Werte in `STANDARD` sind Ians
   Entscheidung** — nicht ohne Rückfrage ändern.
19. **Eine waagrechte Reihe neben einer Liste ist `SsScrollReihe`**, kein blanker
   `ScrollView`. Der Baustein bringt zwei Dinge mit, die man sonst zweimal falsch
   macht: `flexShrink: 0` (sonst fällt die Reihe neben einer FlatList auf Höhe 0
   zusammen) und die weiche Kante, **die nur steht, wenn wirklich etwas abgeschnitten
   ist**. Eine Kante, die immer da ist, verspricht Inhalt, den es nicht gibt.
20. **Der Ort eines Posts kommt aus `ortText()`** (`lib/bezirk.ts`), nie aus
   `{post.district} Wien`. Seit dem 2026-09-02 ist `Post.district` `string | null`, und
   **der Typecheck fängt den Fehler nicht**: React rendert `null` in JSX klaglos als
   Nichts, ein Template-Literal macht daraus brav den Text „null". Wer die Zeile selbst
   schreibt, bekommt also entweder „ Wien" oder „null Wien" — beides erst am Gerät
   sichtbar, an sieben verschiedenen Stellen. Der Bezirk einer **Person** bleibt Pflicht
   und wird weiter direkt geschrieben; nur der Post darf ohne auskommen.

21. **Was der Browser VOR dem JavaScript sieht, steht in `app/+html.tsx`.** Der
   Web-Export backt einen HTML-Schnappschuss, und der kann den Wischstapel nicht
   richtig zeigen: `useWindowDimensions`, die gemessene Kartenbreite und die
   SafeArea-Insets gibt es beim Bauen alle nicht. Deshalb wird der halbe Zustand nicht
   repariert, sondern von `#ss-start` verdeckt, bis `_layout.tsx` die Klasse
   `ss-bereit` setzt. **Die CSS-Animation `ss-notausgang` ist kein Schmuck:** Ohne sie
   wäre jeder Bundle-Fehler eine für immer leere Seite. Wer an der Fläche etwas ändert,
   prüft beides — dass sie kommt UND dass sie ohne JavaScript wieder geht.
   **Nachtrag 2026-09-03: Verdecken reicht NICHT, und das war ein echter Fehler.**
   Der halbe Zustand war nicht nur hässlich, er blieb: Die Karten standen mit -16°
   schief und der „Weg"-Stempel auf Deckkraft 1, bis jemand eine Karte anfasste. Ian
   hat es gesehen. Behoben ist es an der Wurzel (`NOTBREITE`, siehe Fallen-Liste), und
   `#ss-start` bleibt trotzdem — aber als das, was es ist: eine Abdeckung für den
   ersten Bildaufbau, kein Ersatz für richtige Werte. **Wer hier etwas baut, das beim
   Bauen keine Größe hat, sorgt dafür, dass der Ruhezustand auch OHNE Messung stimmt.**
22. **Der Prototyp-Hinweis ist ein VOLLBILD beim ersten Öffnen.** *(Seit dem
   2026-09-07, Ians Entscheidung 48 — davor eine Leiste unten, davor zwei Fassungen
   oben.)* **Vier** Fassungen sind durch, alle vier samt Begründung im Kopf von
   `components/PrototypHinweis.tsx` — **wer ihn verschiebt, liest die Liste zuerst**,
   sonst landet er bei einer, die schon durchgefallen ist. Das Vollbild ist keine
   Wiederholung von Fassung 1: Die verdeckte einen TEIL der App und ließ sich
   übersehen; ein Vollbild verdeckt alles und danach nichts — der dokumentierte Preis
   von Fassung 3 (dauerhaft verdeckte Tab-Leiste) fällt damit weg. **Das Merken sitzt
   in EINER Funktion** (`schonGesehen()` / `merken()`), weil es auf Native kein
   `sessionStorage` gibt: In Phase 20.3 wird dort nur der Speicher getauscht.
23. **Es gibt keine Emojis in der Oberfläche — Icons kommen aus `theme/icons.ts`.**
   Ein Icon allein ist `<SsIcon name="…">`, ein Icon neben Text ist `<SsIconText>`
   (nie beides von Hand nebeneinanderstellen: Der Baustein bringt den Versatz mit, der
   das Icon auf die Mitte der ERSTEN Zeile schiebt statt in die Mitte des Blocks).
   `IconName` ist eine Whitelist — ein Emoji oder ein Vertipper ist ein Typfehler, kein
   leeres Loch im Screen. **Das gilt aber nur für Props, die `IconName` auch tragen:**
   Eine lokale Komponente mit `icon: string` ist ein Loch im Netz, und genau so hat der
   Einstellungen-Screen bis 2026-09-03 die NAMEN als Text angezeigt. Wer eine Komponente
   baut, die ein Icon durchreicht, tippt die Prop `IconName` — nie `string`. **Ausgenommen ist, was ein Mensch selbst tippt**: Leas
   „Cool, freut mich! 🎾" in `data/mock.ts` bleibt. Ein Emoji, das die App VORSCHLÄGT,
   ist dagegen Oberfläche — deshalb ist das 🙌 aus `grussVorschlag()` weg.
24. **`SsIcon` zeichnet auf BEIDEN Plattformen — seit Phase 19 auch nativ.**
   *(Ersetzt seit dem 2026-09-06 die alte Fassung „zeichnet auf Web und nirgends
   sonst".)* Auf Web `<svg>` über `react-dom`, auf iOS `<Svg>`/`<Path>` aus
   `react-native-svg`. **Beide Zweige lesen dieselben Pfade aus `theme/icons.ts`** —
   der Tausch war EINE Datei und kein Screen, genau wie seit Phase 14 angekündigt.
   Der Web-Zweig bleibt bewusst bei `react-dom`: Es gibt dort nichts zu gewinnen und
   eine seit vier Wochen laufende Seite zu verlieren. **Der Preis des Imports ist
   gemessen:** +49.524 B im Web-Bündel (+3,5 %). Vermeidbar wäre er über
   Plattform-Endungen (`SsIcon.native.tsx`), aber das zerlegt EINEN Zeichner in drei
   Dateien — der Grund, warum es die Trennung Daten/Zeichner gibt, wäre dahin.
25. **`landing/icons.js` ist eine KOPIE von `theme/icons.ts`, keine Verbindung** —
   dieselbe Lage wie bei `stil.css` (Regel 13) und derselbe Grund: Die Landing-Page hat
   bewusst kein npm. Wer einen Pfad in der App ändert, ändert die Seite NICHT mit.
   In der Kopie stehen nur die sieben Icons, die die Seite braucht.

26. **Ein neuer Feed-Filter geht über `FeedFilter` und `features/posts/filter.ts`** —
   nie als eigener `useState` im Screen. **Und seit Entscheidung 63 (2026-09-08) muss
   ein neuer Filter zusätzlich begründen, warum er überhaupt dasteht:** Der
   Bezirks-Filter ist gestrichen, weil die Reihenfolge seine Aufgabe ohne einen
   Handgriff erledigt (`sort.ts`). Das ist harte Regel 63 in ihrer zweiten Richtung —
   sie bremst, was noch nicht gebaut ist. `filter.bezirk` selbst BLEIBT, weil die
   Karte ihn setzt (Regel 50); was im Filterblatt steht, ist seither keine Auswahl
   mehr, sondern eine Rücknahme, und die nur, wenn es etwas zurückzunehmen gibt. Zwei Gründe, und beide fallen erst später auf:
   Was in `FeedFilter` steht, gilt automatisch in BEIDEN Ansichten (Stapel und Liste,
   Regel 16); und die Bedeutung einer Pille („was heißt *diese Woche*?") lebt sonst
   mitten in 600 Zeilen Oberfläche und ist beim nächsten Umbau weg. Zum Zurücksetzen
   `FILTER_LEER` nehmen, nie die Werte von Hand aufzählen.
27. **Ein Mensch hat einen `jahrgang: number`, ein Post ein Union `PostAlter`.**
   *(Ersetzt seit Phase 18b die alte Regel über `AgeGroup` und `AgeBand` — die Typen
   gibt es nicht mehr.)* Der Grund der alten Regel gilt weiter: Eine Aktivität kann
   „für alle" sein, ein Mensch nicht. Im neuen Modell ist er nur nicht mehr
   formulierbar, und das ist der Fortschritt — eine Zahl KANN nicht „egal" sein.
   Gefragt wird nie `post.alter === 'egal'`, sondern `post.alter.kind === 'egal'`.
   Der FILTER benutzt denselben Typ wie der Post, und das ist kein Verstoß gegen
   Regel 39: Zwei Typen braucht es, wenn zwei Dinge verschiedene Daten tragen — hier
   tragen beide dieselbe Spanne, und was sich unterscheidet, ist die Regel
   (`passtZumAlter`). **Die Wörter stehen in `config/alter.ts`**, nie im Screen: `Jg.
   2009–2012` an der Karte, `Jahrgang 2009–2012` im Detail, `Jahrgang 2009` am Profil.
   Am Profil ist es Ians Entscheidung 30 und hängt an einem Wort (`JAHRGANG_ANZEIGE`).

28. **Ein Chat hat seit Phase 16 vielleicht KEINEN Post.** Gefragt wird danach nie mit
   `!thread.postId`, sondern mit `istDirektChat()` aus `features/chat/direkt.ts` — im
   Backend ist ein fehlendes Feld später `null` statt `undefined`, und dann ist es EINE
   Zeile dort statt sechs verstreute. **Seit Phase 20.4 ist genau das eingetreten, und
   es war wirklich eine Zeile:** Die Funktion fragt jetzt `!thread.ausAktivitaet` statt
   `postId === undefined` (harte Regel 56). Ein Aktivitäts-Chat, dessen Post gelöscht
   wurde, ist damit KEIN Direktchat — was oben in ihm steht, sagt `herkunftText()`
   (Ians Entscheidung 42). In Screens fragt man gar nicht am Faden, sondern
   an `ChatEintrag.post`: Der ist optional, und **dort** fängt der Typecheck die Stellen,
   die einen Post voraussetzen. Am Modell fängt er nichts — `find(p => p.id ===
   thread.postId)` ist mit `undefined` gültiger Code.
29. **Einem Direktchat NIE einen Ersatz-Post oder eine Ersatz-Kategorie geben.** Der
   naheliegende Weg wäre ein Platzhalter-Post gewesen; er hätte den Chat-Screen
   unverändert gelassen und dafür durch jede Karte, jede Farbe und jede Ablaufregel der
   App still falsche Antworten getragen. Ein fehlendes Feld beantwortet nichts falsch.
   Dasselbe gilt für den grauen Ersatz-Streifen an der Chat-Karte: Ein Direktchat HAT
   keine Kategorie, und dass seine Karte 6 px schmaler einrückt, ist die Auskunft und
   kein Fehler. Die Farbe im Direktchat ist `accent` — die Grundfarbe der App, wie jede
   Kategoriepalette aufgebaut, deshalb braucht keine Stelle darunter einen Sonderfall.
30. **Die Chat-Liste gruppiert nach ZUSTAND, nicht nach SORTE.** „Aktuell" und „Vorbei"
   sind Ians Regel aus `chat/lifecycle.ts`; ob ein Chat aus einer Aktivität oder aus
   einer Direktnachricht entstanden ist, erkennt man an der ZEILE (Farbstreifen +
   zweite Textzeile), nicht an einer Überschrift. Eine Gruppe je Sorte würde Ians
   Sortierregel zerschneiden — eine Nachricht von vor zwei Minuten stünde unter einem
   Chat von gestern, nur weil sie aus einer anderen Quelle kommt. Warum ein Chat
   entstanden ist, interessiert beim Suchen niemanden.

31. **`Post.visibility` ist ein OBJEKT, kein String.** Seit Phase 17 heißt es
   `post.visibility.kind === 'followers'`, nie `post.visibility === 'followers'`. Das
   ist kein Umstand, sondern der Grund, warum die dritte Stufe überhaupt sicher gebaut
   werden konnte: `{ kind: 'group'; groupId: string }` macht den Zustand
   „Gruppen-Post ohne Gruppe" **undarstellbar**, und weil der alte Vergleich damit
   ungültig wird, findet `tsc` jede Stelle. Die Alternative wäre
   `visibility: 'group'` plus `groupId: string | null` gewesen — also genau die Falle
   von `Post.district` und `ChatThread.postId` zum dritten Mal. Wer den Marken-Text
   dazu braucht, nimmt `<SichtMarke>` bzw. `useSichtText()`, nie eigenes JSX.
32. **Was eine Gruppe ist und was ein Austritt anrichtet, steht in
   `features/groups/gruppe.ts` und nirgends sonst.** Screens lesen `AUSTRITT_WIRKUNG`
   und `GRUENDER_AUSTRITT` nie, sie sehen nur das Ergebnis; die Sätze in der
   Verlassen-Rückfrage kommen aus `austrittFolgen()`. Dieselbe Bauart wie
   `safety/block.ts` (Regel 17) und aus demselben Grund: Sonst verspricht irgendwann
   ein Screen etwas, das die Regel nicht mehr tut — **und genau das ist in Phase 17
   passiert**, siehe die Falle unten.
33. **Mitgliedschaft steht NUR EINMAL im Modell** — als `memberIds` an der Gruppe. Am
   Nutzer gibt es kein `groupIds` (anders als bei den Folge-Beziehungen, Regel 8).
   Gefragt wird über `istMitglied()`, nie über `memberIds.includes()` im Screen: Der
   Gründer steht mit drin, und das muss man wissen. **Die REIHENFOLGE trägt eine
   Regel**: `memberIds` wächst hinten, also ist der zweite Eintrag der, der die Gruppe
   erbt, wenn der Gründer geht (`nachfolgerId()`, Ians Entscheidung). Wer die Liste
   sortiert, ändert still, wem eine Gruppe gehört.
34. **Gruppen bekommen KEINEN eigenen Feed und KEINEN eigenen Tab.** Ians Entscheidung
   16: Eine Gruppe ist eine Sichtbarkeits-Stufe, kein Ort. Die Liste auf
   `/gruppe/[id]` ist kein Widerspruch dazu — sie zeigt dieselben Posts, die im
   Hauptfeed ohnehin stehen, so wie ein Profil auch. Ein eigener TAB hätte den
   Hauptfeed geleert, und ein leerer Hauptfeed ist am Anfang das größere Problem. Der
   Weg zu `/gruppen` liegt deshalb **nicht** in der Tab-Leiste — **seit Ians
   Entscheidung 56 (2026-09-08) aber in der Kopfzeile des Chats-Registers statt am
   Profil**: *„das hat eigentlich nix mit dem Profil zu tun, sondern eher mit dem
   Chatten."* Der GRUND der Regel überlebt das unverändert — ein Knopf in einer
   Kopfzeile schafft weder Tab noch Feed; nur der Wortlaut musste nachgezogen werden.
   Genau der Fall, für den harte Regel 58 gebaut ist.

35. **`npm run deploy` ist KEINE Sicherung — es schiebt nur `gh-pages`.** Der Zweig
   trägt das gebaute, minifizierte Bündel; `main` mit dem Quellcode fasst das Skript
   nie an. Am 2026-09-03 kam so heraus, dass neun Phasen (54 Dateien, ~7.100 Zeilen)
   ausschließlich lokal lagen, während die Seite tagelang aktuell aussah. **Nach jeder
   Phase committen und pushen.** Die Doku (`PLAN.md`, `CLAUDE.md`, `_FUER_IAN/`) liegt
   außerhalb der Repo-Wurzel und kommt über `doku/` mit — kopiert von
   `scripts/doku.sh`, aufgerufen von `.git/hooks/pre-commit`, damit die Kopie nicht
   still veraltet wie `landing/stil.css` (Regel 13). **Der Hook wird nicht
   mitversioniert**: nach einem frischen Clone neu anlegen, Anleitung in
   `doku/LIESMICH.md`. **Und die Falle im Hook selbst (2026-09-06, zweimal
   hineingetappt):** Wurde NUR die Doku außerhalb des Repos geändert, bricht `git
   commit` mit „nothing to commit" ab — Git prüft die Staging-Area, BEVOR der
   pre-commit-Hook läuft, und der Hook füllt sie erst. Dann `npm run doku && git add -A
   && git commit`.

36. **Was über dem Wischstapel liegen soll, geht durch `WischStapel.blatt` — nie über
   den Stapelbereich im Screen.** Der Screen weiß nicht, wo die Karten aufhören und
   die Knöpfe anfangen; er müsste eine Höhe raten. Der Slot hängt IN der Kartenfläche,
   dort heißt `maxHeight: '100%'` wörtlich „bis zu den Knöpfen" — und bleibt richtig,
   wenn eine Filterreihe dazukommt. **Am 2026-09-03 war genau das der Fehler**: Das
   Filterfeld klappte im Fluss auf, nahm dem Stapel 250 px, und weil die Karten
   absolut liegen (also nicht mitschrumpfen), quollen sie über die Kategorien und über
   „Bin dabei". Auf dem iPhone SE verdeckte die Karte den Alters-Filter. Wer hier
   etwas hineinhängt, prüft es auf **360 × 600**, nicht nur auf 390 × 844 — und fragt
   `document.elementFromPoint`, ob die Knöpfe wirklich noch getroffen werden.

37. **„Aufgeklappt" ist nicht „sichtbar", und ein roter Hinweis muss auf etwas zeigen,
   das im Bild ist.** Der Erstellen-Screen ist mit offenem „Mehr einstellen" rund
   2000 px hoch; ein Handy zeigt 667. Wer eine Fehlermeldung baut, die auf eine andere
   Stelle verweist, sorgt dafür, dass man dort auch hinkommt — im Erstellen-Screen
   springt der Screen hin UND der Satz benennt das Feld (`FEHLER_ANTWORT`, Ians
   Entscheidung 15). Die y-Positionen kommen aus `onLayout`-Ankern, nicht aus
   gerechneten Höhen; die drei Felder in `mehrBereich` bekommen dessen y **beim Lesen**
   dazu, nicht beim Merken. Und der Sprung wartet **zwei** `requestAnimationFrame`:
   Auf Web meldet `onLayout` über einen ResizeObserver, also erst nach dem Zeichnen.
38. **Gründen und Einladen sind zwei verschiedene Rechte.** Seit Phase 18a fragt man
   „darf der jemanden holen?" mit `darfEinladen()` aus `features/groups/gruppe.ts`, nie
   mit `istGruender()`. **Die Verwechslung fällt nie auf**, weil in einer frisch
   gegründeten Gruppe beide dasselbe antworten — sie fällt erst dem auf, der in einer
   fremden Gruppe Mitglied ist und den Knopf nicht findet. Dasselbe gilt für die
   Gegenrichtung: `Group.offen` fragt man über `darfBeitreten()` bzw.
   `beitrittHuerdeText()`, nicht mit `!gruppe.offen` im Screen.
39. **Eine Einladung ist KEINE Anfrage mit umgedrehtem Vorzeichen.** `GroupInvite` ist
   ein eigener Typ neben `GroupRequest` (vierte Runde derselben Frage nach
   `ChatThread.postId`, `GroupRequest` und `Visibility`). Wer die beiden in einer Liste
   nebeneinanderlegt, unterscheidet sie an `einladung`, **nie an `gruppe`** — beide
   tragen eine. Bis Phase 17 war `'gruppe' in item` eindeutig, seit Phase 18a nicht mehr,
   und der Typecheck hätte dazu geschwiegen: Eine Einladung wäre als Beitritts-Anfrage
   gezeichnet worden, mit „Aufnehmen"-Knopf.
40. **Eine Zahl an einem Tab liest denselben Haken wie der Screen darunter.** Seit
   Phase 18a addiert `(tabs)/_layout.tsx` `useMeineEinladungen()` — denselben Haken, den
   `requests.tsx` benutzt, und keinen leichteren Filter daneben. Grund: Der Haken blendet
   Einladungen aus, in deren Gruppe man inzwischen ohnehin ist. Ein eigener Zähler zählte
   sie mit, und dann klebt eine Zahl am Tab, die man nicht wegbekommt, weil die Zeile
   dazu gar nicht dasteht.
41. **`StapelDurch` ist eine ÜBERSCHRIFT über einer Liste, kein Leer-Zustand.** Sein
   Text verspricht sie („Alles, was du gesehen hast, steht unten weiter in der Liste").
   Deshalb erscheint er nur, wenn `listeHatWas` — sonst stünde er über nichts, und
   `LeererFeed` sagt darunter dasselbe noch einmal, nur mit dem Ausweg, den die
   Überschrift nicht hat. **Der Unterschied trägt eine Bedeutung:** „Stapel leer"
   heisst durchgewischt (die Liste ist voll, sie nimmt nichts weg), „Liste leer" heisst
   es gibt wirklich nichts — ein zu enger Filter oder der stille Dienstag aus
   Abschnitt 8. Zwei verschiedene Sachverhalte, zwei verschiedene Antworten.

42. **Die Chat-Liste besteht aus ZEILEN, jede andere Liste der App aus Karten.** Seit
   Phase 18c: keine `SsCard`, volle Breite, 1 px Trennlinie hinter dem Avatar, 70 px
   Höhe, zwei Textzeilen. Der Grund ist eine Aussage und kein Geschmack — eine Karte ist
   ein ANGEBOT (Feed, Anfragen: man kann sie annehmen), eine Zeile ist ein WEG. Wer sie
   zurück auf Karten stellt, macht 7 Chats wieder zu 4. **Der Streifen-PLATZ steht dabei
   immer, die Farbe nicht** — das ist kein Verstoß gegen Regel 29, sondern ihre
   Anwendung: Verboten ist ein grauer ERSATZ-Streifen, nicht ein reservierter Platz. In
   einer Karte war „6 px weiter links" die Auskunft; in einer Zeilenliste sind
   ausgefranste Avatar-Spalten genau das „unruhig", gegen das die Phase gebaut ist.
43. **Sollen zwei Texte nebeneinander ungleich nachgeben, bekommt der nachgebende
   `flex: 1` — nicht der andere ein höheres `flexShrink`.** Solange beide `flexBasis:
   auto` haben, teilen sie sich einen Fehlbetrag, und jede Gewichtung dagegen ist ein
   Wert, der beim nächsten längeren Text wieder falsch ist. Mit `flexBasis: 0` an einem
   der beiden entsteht gar kein Fehlbetrag: Der andere behält seine natürliche Breite,
   dieser bekommt exakt den Rest. Am 2026-09-05 in der Chat-Zeile zweimal falsch geraten
   (1 : 4, dann 1 : 24), bevor es nachgemessen war.

44. **Ein Schiebe-Regler gehört NIE in `SsScrollReihe`** — und überhaupt nie in einen
   waagrechten ScrollView. Zwei Gesten-Erkenner übereinander, die beide waagrecht
   ziehen wollen, streiten sich um jede Berührung, und wer gewinnt, hängt an der
   Reihenfolge im Baum. `FilterGruppe` in `(tabs)/index.tsx` hat dafür seit Phase 18b
   die Prop `reihe={false}`. Dazu gelten für jeden Regler die zwei alten Fallen:
   `onPanResponderTerminationRequest: () => false` (Phase 11 — sonst nimmt ein
   senkrechter ScrollView die Geste beim ersten Zucken) und ein Rückfall gegen die
   gemessene Breite **null** (`NOTBREITE`, 2026-09-03 — beim Web-Export gibt es kein
   Fenster, und beide Griffe kleben links).
45. **Sind zwei Dinge in einem Moment ununterscheidbar, wird die Entscheidung VERTAGT,
   nicht geraten.** In `SsJahrgangBalken` stehen manchmal beide Griffe auf demselben
   Wert. Wer dann beim Anfassen über die Tipp-Stelle entscheidet, bekommt ein Paar, das
   festklebt: Ein Druck acht Pixel links der Mitte wählt „von", und „von" kommt von dort
   nur nach links. Die fehlende Auskunft ist die RICHTUNG, und die entsteht erst bei der
   ersten Bewegung — also `aktiv = null`, `schieben` entscheidet beim ersten Move, und
   `loslassen` holt es nach, falls es nie eine Bewegung gab. **Gefunden nur durch echtes
   Ziehen:** Ein `click` löst weder `onPanResponderMove` noch das Kreuzungsverbot aus.

46. **Was eine Terminüberschneidung bedeutet, steht in `features/requests/kollision.ts`
   und nirgends sonst.** Dieselbe Bauart wie `safety/block.ts` (Regel 17) und
   `groups/gruppe.ts` (Regel 32): Screens lesen `DOPPEL_REGEL`, `KOLLISION_FENSTER_MIN`
   und `PRUEFT_BEIM_POSTEN` nie, sie sehen nur das Ergebnis; der Satz kommt aus
   `doppelHinweisText()`. **`KOLLISION_FENSTER_MIN` ist eine SCHÄTZUNG, keine Messung** —
   ein `Post` hat keine Dauer. Genau deshalb warnt die Regel und sperrt nicht: Ein
   ausgegrauter Knopf würde eine Gewissheit behaupten, die die Daten nicht hergeben.
   Wer den Hinweis irgendwo neu zeichnet, nimmt `<DoppelHinweis>` — nicht eigenes JSX.
47. **Was die App über die Pläne einer Person weiß, sagt sie NUR dieser Person.** Beim
   Doppel-Hinweis lag die naheliegende dritte Möglichkeit darin, dem Poster beim
   Bestätigen zu zeigen, dass der Anfragende zur selben Zeit woanders ist. Das hätte
   Termine aus privaten Gruppen und aus Posts nur für Follower an jemanden gegeben, den
   sie nichts angehen — dieselbe Sorte Leck wie der Gründername an einer privaten Gruppe
   (18a), nur eingebaut statt vergessen. **Bei jeder neuen Auskunft fragen: Wem gehört
   die Information, aus der sie gerechnet ist?**

48. **Die Wien-Karte besteht aus SIEBEN Dateien, und keine davon ist ein Screen.**
   *(Seit Phase 19d — bis dahin vier.)*
   `data/wien-bezirke.ts` (**erzeugt** — nicht von Hand ändern, `python3
   scripts/bezirke-bauen.py` baut sie neu) · `features/posts/karte.ts` (was eine Farbe
   bedeutet, wie weit man zoomen darf) · `lib/karte-treffer.ts` (welcher Bezirk unter
   einem Punkt liegt) · `components/ui/SsWienKarte.tsx` (Zeichnen und Geste). Dieselbe
   Bauart wie `theme/icons.ts` + `SsIcon`, und aus demselben Grund: Ein neuer
   Grenzverlauf ist ein Skriptlauf, eine neue Farbe eine Regel-Datei — nie ein Screen.
   **Die Namensnennung (`KARTE_QUELLE`, CC BY 4.0, Stadt Wien) ist Lizenzbedingung** und
   wird IN der Karte gezeichnet, damit sie mitreist.
   **Seit Phase 19d kommen drei dazu:** `lib/karte-geo.ts` (wo eine Fläche auf der ERDE
   liegt) · `components/ui/karte-typen.ts` (die gemeinsame Schnittstelle) ·
   `components/ui/SsAppleKarte.native.tsx` (der zweite Zeichner). Screens nehmen **nur
   `SsKarte`** — die Weiche `SsKarte.tsx` / `SsKarte.native.tsx` entscheidet, wer
   zeichnet.
49. **Ein Kneifen ist NIE ein Tipp — auch wenn sich nichts bewegt hat.**
   `gestureState.dx/dy` misst bei mehreren Fingern den MITTELPUNKT, und der steht beim
   symmetrischen Auseinanderziehen still. Die Bewegungsgrenze aus harter Regel 15 fängt
   das nicht: Sie fragt „hat sich der Finger bewegt?", richtig ist „war das überhaupt
   eine Ein-Finger-Geste?" (`mehrfingrig` in `SsWienKarte`). **Wer einen Erkenner mit
   mehreren Fingern baut, prüft ihn mit echten Touch-Ereignissen** — mit der Maus ist
   der Fehler unsichtbar.
50. **Was auf einer Karte gewählt ist, IST der Bezirksfilter** — es gibt keinen zweiten
   Zustand daneben. Deshalb überlebt eine Auswahl das Umschalten auf Liste oder Stapel,
   und deshalb gilt harte Regel 26 auch hier. Gezählt wird über `useBezirksZaehlung`,
   und `useBezirkeImFeed` leitet seine Liste daraus ab — die Regel „beim Zählen wird
   genau der Bezirksfilter ausgeschaltet und sonst keiner" steht damit an EINER Stelle.
   Ohne sie zeigte die Karte nach dem ersten Tipp eine einzige eingefärbte Fläche in
   einem grauen Wien.
51. **Was über der Karte schweben soll, geht durch `SsWienKarte.blase` — nie als Kind
   der Kartenfläche.** *(Entscheidung 46 nahm die Blase in 19e-1 aus der Anzeige,
   **Entscheidung 57 hat sie am 2026-09-08 zurückgeholt.** Der Satz, der hier seit dem
   2026-09-07 stand — „Ein Aufruf holt sie zurück. Wer sie löscht, wirft sie weg" —
   hat sich nach elf Tagen bezahlt gemacht: Es war wirklich ein Aufruf. **Wer eine
   geprüfte Arbeit ausbaut, löscht sie nicht.**)*
   **Der Anker rechnet gegen den FREIEN STREIFEN, nicht gegen den Bildrand** (19g):
   Im Vollbild steht oben die schwebende Leiste und unten das Blatt; `platzOben` und
   `platzUnten` sind der Platz dazwischen. Und ein Bezirk **ohne Posts bekommt keine
   Blase** — sonst steht ein weißer Balken mit Pfeil über der Stadt, und die Antwort
   „hier ist nichts los" stünde zweimal da. Dasselbe Muster wie `WischStapel.blatt` (harte Regel 36) und aus
   zwei Gründen, die beide erst am Gerät auffallen: Die Fläche hat `overflow: hidden`
   (die Blase wäre halb abgeschnitten) und einen `PanResponder` mit
   `onStartShouldSetPanResponder: () => true` (sie wäre nicht antippbar). Der Slot bekommt
   einen **`KartenAnker`** — die Umkehrung genau der Rechnung, mit der ein Tipp in
   Kartenkoordinaten übersetzt wird, **aus demselben Zustand**; zwei getrennte Rechnungen
   driften beim ersten Zoom auseinander. Und: **`pointerEvents` steht im `style`, nie in
   den Props** (ACTA-Falle) — der Blasenkörper braucht dabei ein ausdrückliches `'auto'`,
   weil `react-native-web` ein geerbtes `box-none` an alle Nachkommen weitergibt außer an
   Text-Knoten. Wie viele Zeilen hineinpassen, rechnet `passform()` aus dem Platz;
   `BLASE_MAX` in `karte.ts` ist die Obergrenze, keine Zusage.

52. **Es gibt mehr als einen Kartenzeichner und GENAU EINE Bedeutung.** Was „viel los"
   heißt, wie weit man zoomen darf, welche Sorte Karte darunter liegt — alles in
   `features/posts/karte.ts`; wo eine Fläche auf der Erde liegt, in `lib/karte-geo.ts`;
   was ein Zeichner können muss, in `components/ui/karte-typen.ts`. Ein Zeichner
   verantwortet **nur** den Hintergrund, das Zeichnen und wie aus einer Geste ein „hier
   wurde getippt" wird. Rutscht die Bedeutung in einen Zeichner, hat die App zwei
   Wahrheiten — und auffallen würde es nur dem, der beide nebeneinanderhält.
   **Die Plattform-Endung ist dabei Pflicht und kein Stil:** Ein `Platform.OS`-Zweig in
   EINER Datei importierte `react-native-maps` auch ins Web-Bündel, wo es MapKit nicht
   gibt. Das ist genau umgekehrt zu `SsIcon` (Regel 24), und der Unterschied ist der
   Grund: Dort zeichnen beide Zweige dasselbe, hier sind es zwei Bibliotheken.
54. **Eine Server-Regel steht im Schema `regel` und NIE in einer Policy.**
   `regel.sind_blockiert()`, `regel.ist_mitglied()`, `regel.folgen_sich_gegenseitig()`,
   `regel.ist_teilnehmer()`, `regel.mitglieder_anzahl()` — dieselbe Bauart wie
   `safety/block.ts` (Regel 17) und `groups/gruppe.ts` (Regel 32), eine Ebene tiefer.
   Der Grund ist diesmal aber nicht nur Ordnung: Eine Policy, die ihre EIGENE Tabelle
   abfragt, ergibt `infinite recursion detected in policy for relation …` — und zwar
   erst beim ersten Lesen, nicht beim Anlegen. `security definer` beendet die Kette
   nach einem Schritt. Jede dieser Funktionen ist damit ein kontrolliertes Loch in der
   Absicherung: Es sind so wenige wie möglich, sie stehen alle beieinander, jede
   beantwortet EINE Ja/Nein-Frage, und `set search_path = ''` ist Pflicht — ohne ihn
   kann jemand mit eigenem Schema eine Tabelle davorschieben.
55. **Auf `group_members` gibt es KEIN Insert-Recht, und das ist die Aussage.**
   Beitreten ist das ERGEBNIS einer bestätigten Anfrage oder angenommenen Einladung,
   kein Schreibvorgang. Stünde dort ein `insert`, könnte sich jeder mit einer Zeile in
   jede Gruppe schreiben und Phase 17 („der Gründer bestätigt") wäre eine
   Höflichkeitsform. Dasselbe fürs Austreten: Ein blankes `delete` überspränge
   `nachfolgerId()` (Ians Entscheidung 13) und damit die Erbfolge. Mitgliedschaften
   ändern sich nur über die Funktionen aus 20.5.
56. **Die HERKUNFT eines Chats ist eine Tatsache, kein abgeleiteter Wert.** In der App
   heißt `istDirektChat(t)` genau `t.postId === undefined` — richtig, solange sich ein
   Post nicht löschen lässt. In der Datenbank lässt er sich löschen, und mit
   `on delete set null` wird aus einem Aktivitäts-Chat lautlos ein Direktchat: Dann
   gilt `SCHREIB_REGEL = 'gegenseitig'`, und zwei Leute, die sich getroffen haben und
   einander nicht folgen, können einander nicht mehr schreiben. Gefragt wird deshalb an
   `chat_threads.aus_aktivitaet`, nie an `post_id`. **Allgemeiner: Wenn ein Wert
   heute aus einem anderen ableitbar ist, heißt das nicht, dass er es morgen noch ist —
   und die Ableitung ändert sich still.**
58. **Eine neue Entscheidung überschreibt NIE still eine alte Regel-Datei.** Ians
   Entscheidung 39 (Kontolöschen: „alles mit") sagte wörtlich „Gruppen weg" — und
   `GRUENDER_AUSTRITT = 'weitergeben'` (Entscheidung 13) sagt, dass eine Gruppe beim
   Weggehen vererbt wird. Beide sind seine, beide gelten, und ein Kontolöschen IST ein
   Weggehen. Der Ausweg war nicht, eine der beiden auszulegen, sondern **nachzufragen**
   — und die Antwort war präziser als beide Fassungen für sich (*A gilt für alles, was
   NUR mir gehört*). **Der Widerspruch war überhaupt nur sichtbar, weil die ältere
   Regel als benannte Konstante an EINER Stelle steht.** Wer eine neue Regel einbaut,
   sucht deshalb zuerst die Regel-Dateien nach dem Fall ab, den sie berührt — und was
   dort „nicht ohne Rückfrage ändern" trägt, ändert man nicht ohne Rückfrage, auch
   nicht als Nebenwirkung.

57. **Was am Server gilt, wird ANGEGRIFFEN, nicht angeschaut.**
   `bash supabase/pruefen/aufbauen.sh` — **erwartet sind 171 Häkchen und kein Kreuz**
   (25 in 20.2, 78 nach 20.5-SQL, 121 seit 20.4-a, 124 seit 0006, 136 seit 0008,
   **171 seit 0010** — vier Angriffe auf `konto_entfernen` und die 31 aus
   `98_moderation.sh`, das seit 20.7-b am Ende mitläuft). **Die Liste der
   Migrationen kommt seit 20.7-b aus dem ORDNER** und steht nicht mehr von Hand
   da: Genau diese Bauart hat in `einspielen.sh` `0008` verschluckt, und in einem
   PRÜFSTAND wäre sie schlimmer — er misst dann grün an einer Datenbank, die es
   nicht gibt.
   **Dazu VIER Prüfstände am ECHTEN Server, und die können etwas, das lokal
   prinzipiell nicht geht:** `npm run pruef-lesen` (29) · `npm run pruef-konto` (**32** seit 20.7 —
   die drei @-Häkchen; bis zum 13.09. abends stand hier 29, **weil der Prüfstand
   seit dem Morgen gar nicht mehr lief**) ·
   `npm run pruef-schreiben` (50, seit 20.5) · `npm run pruef-bilder` (**32**, seit 20.6 —
   **der einzige, der den Weg über das CDN messen kann**, siehe harte Regel 89).
   **Und DREI, die WEDER Server NOCH Datenbank brauchen** — alle drei messen
   importfreie Regel-Dateien in blankem Node (dieselbe Bauart wie `40_uebersetzung.sh`):
   `npm run pruef-bildwahl` (35) hält `lib/base64.ts` gegen echte Bilddateien — **wer
   dort Beispiele auswählt, liest zuerst harte Regel 92** · `npm run pruef-sitzung`
   (**29**, seit dem 2026-09-13 ohne `TODO`) ·
   `npm run pruef-anbieter` (48, seit 20.3-b2) ·
   `npm run pruef-moderation` (**31**, seit 20.7-b — er misst das Werkzeug, das
   LÖSCHT. **Das `--wirklich`-Gate ist die einzige Zeile zwischen einem Tippfehler
   und einem gelöschten Konto, und gegen den echten Server ist sie prinzipiell
   nicht prüfbar:** Der Beleg wäre ein wirklich gelöschtes Konto. Deshalb nimmt
   `meldungen.sh` `SS_DB_URL` entgegen. Er legt seinen Erbfolge-Fall **selbst an**
   — in `05_daten.sql` gibt es keine Gruppe, in der eine stattfinden könnte, und
   damit war der Pfad in `konto_loeschen()` nie gelaufen) ·
   `npm run pruef-programmfehler` (**25**, seit 20.9 — er misst Ians Entscheidung 71
   und **baut danach die verworfene Fassung**, in der sie fehlt: dort 8 Kreuze. Ohne
   diesen zweiten Teil wäre er grün und ohne Aussage). **`pruef-anbieter` kann etwas,
   das die anderen nicht können:** Er bringt `anmeldung.ts` ZWEIMAL nach JS — einmal wie sie
   ist, einmal mit `ANMELDE_QUELLE = 'supabase'` in einem Wegwerf-Ordner — und misst
   damit, was am Tag des Umlegens passiert, **ohne dass jemand den Schalter umlegt und
   ohne dass das Repo angefasst wird.** Ohne das wäre er grün und ohne Aussage, weil
   mit `'attrappe'` alle drei Wege `bereit: false` melden (die 18d-Lehre).
   Warum das nicht dasselbe ist, steht in
   harter Regel 85 — die Wegwerf-Datenbank war bis zum 2026-09-12 STRENGER als das
   Original. Jeder
   Block setzt `set local role authenticated` — **wer als `postgres` prüft, prüft
   nichts**, denn der Eigentümer einer Tabelle umgeht seine eigenen Policies. Und ein
   Test, der nur „ist fehlgeschlagen" abfragt, prüft zu wenig: Er muss `SQLSTATE =
   '42501'` verlangen, sonst zählt ein Insert, der an einem CHECK scheitert, als „von
   RLS abgewiesen".

59. **Am Blatt zieht NUR der Griff.** *(Phase 19e.)* `SsBlatt` liegt über einem
   Kartenzeichner, und der beansprucht mit `onStartShouldSetPanResponder: () => true`
   jede Berührung. Zwei Erkenner übereinander, die beide ziehen wollen, streiten sich
   um jeden Finger, und wer gewinnt, hängt an der Reihenfolge im Baum — dieselbe
   Familie wie harte Regel 44 und die Phase-11-Falle. **Der Ausweg ist keine
   Aushandlung, sondern eine Fläche:** Der Körper des Blattes hat gar keinen Erkenner.
   Wer ihm später einen gibt, macht aus einer klaren Trennung eine Aushandlung — und
   die verhält sich auf Web und auf iOS verschieden, weil dort MapKit seit 19d-1 eigene
   Gesten mitbringt. **Auf iOS ist das ungeprüft**, es gehört in den Gerätedurchgang.
60. **Was oben und unten schon STEHT, wird gemessen — nur der Rest ist ein Anteil.**
   *(Phase 19e, die Berichtigung der 19b-Lehre.)* Die Raststufen des Blattes hängen am
   Schirm (`BLATT_STUFEN`), aber `zu` ist der **gemessene Blattkopf** und `ganz` ist
   durch die **gemessene schwebende Leiste** gedeckelt (`maxOben`); dieselbe Zahl geht
   als `randOben` an die Karte, damit Wien zwischen Leiste und Blatt zentriert wird.
   Ohne den Deckel fuhr das Blatt unter die Pille. Eine feste Leiste ist auf 552 px ein
   anderer Anteil als auf 844, ihre Höhe dagegen überall dieselbe — **die Lehre aus 19b
   gilt für Flächen, die den Rest bekommen, nicht für Dinge, die schon da sind.**
   Dazu: `randUnten` (wo das Blatt anfängt) und `freiUnten`/`verdeckt` (die Geometrie
   nach `KARTE_MIN_BAND`) sind ZWEI Größen. Lizenzzeile und „Ganz Wien"-Knopf weichen
   dem BLATT aus, die Kartengeometrie folgt dem Deckel. Die Verwechslung ist nicht zu
   sehen, nur zu lesen.

61. **Glas bringt seine eigene Kante mit — Kante und Schatten sind der ERSATZ, wo
   keines ist.** *(Phase 19e-2, berichtigt am 2026-09-07 nach Ians Rückmeldung.)*
   `SsGlas` verantwortet den Untergrund **samt Kante**: auf iOS 26 echtes Liquid
   Glass, sonst `glasErsatz` — und bei `schwebt` zusätzlich die 1-px-Linie und den
   Schatten aus `glasSchwebt`. Der Aufrufer bringt **nur Geometrie** mit (Radius,
   Polsterung, `flex`, Position). Die erste Fassung machte es andersherum: Kante und
   Schatten kamen vom Aufrufer und lagen auch AUF dem Glas — daraus wird wieder eine
   Karte mit unscharfem Hintergrund, und genau das meinte Ian mit *„sieht noch nicht
   so gut aus"*. `schwebt` setzt, wer frei über etwas anderem liegt (Tab-Kapsel,
   Umschalter-Pille); wer in einer Fläche sitzt, die ihre Kante schon hat, nicht.
   **Zwei Prüfungen sind Pflicht** (`isGlassEffectAPIAvailable()` UND
   `isLiquidGlassAvailable()`): Es gibt iOS-26-Beta-Fassungen, in denen die API fehlt
   und der Aufruf abstürzt. Und: `opacity: 0` am Glas oder an einem Elternteil
   schaltet den Effekt ab — zum Einblenden `glassEffectStyle` mit `animate` nehmen.
   **Plattform-Endung, kein `Platform.OS`-Zweig** — aber aus einem anderen Grund als
   bei `SsKarte`: `expo-glass-effect` steckt über `expo-router` ohnehin schon im
   Web-Bündel; was nicht ins Web darf, ist der `requireNativeViewManager`-Aufruf beim
   Laden des Moduls.
62. **Glas braucht RAND, nicht nur Hintergrund — die Tab-Leiste ist eine
   freistehende Kapsel.** *(Phase 19e-2.)* **Ians Vorbild liegt als Bild im Projekt:
   `vorbild-liquid-glass-bierbuddy.png`** — derselbe Screenshot, aus dem
   Entscheidung 41 kommt. Die erste Fassung war eine Leiste über die ganze Breite mit
   Trennlinie oben, also die gewohnte iOS-Leiste mit Glas dahinter; sein Urteil war
   *„noch nicht wie ich es dir gezeigt habe"*. Eine Fläche, die an drei Kanten am
   Schirm klebt, sieht aus wie eine getönte Leiste — **erst wenn Inhalt daneben UND
   darunter durchläuft, sieht man, dass sie bricht.** Die Maße stehen in
   `src/lib/tabs.ts` (`TAB_KAPSEL_HOEHE`, `TAB_KAPSEL_SEITE`, `tabKapselUnten()`) und
   nirgends sonst: Drei Stellen brauchen sie — die Leiste, jeder Screen darüber
   (`SsScreen`) und das Blatt auf der Karte (`SsBlatt.unten`).
   **Dasselbe gilt für das Blatt: es ist EIN Material.** Erst war nur sein Kopf aus
   Glas, und die Naht zur deckenden Liste lief quer durchs Bild. Wer eine Fläche
   teilweise verglast, bekommt zwei Materialien, die einander widersprechen.
   **Was fest steht, weicht der Kapsel aus** (`useTabRand()`, siehe `SsScreen`):
   *Was scrollt, scrollt unter das Glas; was fest steht, weicht ihm aus.* Beim
   `scroll`-Zweig wandert die Höhe in den Scroll-INHALT, beim festen Zweig begrenzt
   sie die FLÄCHE — und zwar als `marginBottom`, weil dort absolut positionierte
   Kinder liegen (Antwort-Leiste, Wischkarten) und **Yoga die Polsterung des
   Elternteils anrechnet, der Browser aber nicht**. Die Karte weicht NICHT aus: Dass
   Wien unter der Kapsel durchläuft, ist der Sinn.
   ⚠️ **Und das BLATT weicht seit Phase 19g auch nicht mehr aus.** Bis dahin hörte es
   über der Kapsel auf — die wörtliche Anwendung dieser Regel, und am Gerät sah sie
   falsch aus: Das Blatt endete mitten im Bild, darunter lief wieder Karte, die
   Kapsel schwebte dazwischen. Drei Materialien auf 60 Punkten, Ians *„unten ist es
   so abgeschnitten"*. Jetzt reicht es bis an die Unterkante und die Kapsel liegt
   **darauf**. Der Grund der Regel überlebt das unverändert: `SsBlatt.fuss` ist der
   **Sockel der untersten Raststufe**, damit der Griff nicht hinter der Kapsel liegt
   — das IST das Ausweichen —, und die Liste darin bekommt `paddingBottom` in Höhe
   der Kapsel, am Scroll-INHALT. **Glas auf Glas ist dabei am Gerät nachgesehen und
   in Ordnung** (`ac02`, `ac07`); die Warnung der `expo-glass-effect`-Doku war eine
   Vermutung, jetzt ist es eine Messung.

63. **Ein Bildschirm zeigt nur, was für die Entscheidung HIER nötig ist.**
   *(Ians Entscheidung 50 vom 2026-09-08, nach dem ersten Durchgang am eigenen
   Handy — er hat sie ausdrücklich zum Merken gegeben: „das soll eigentlich immer so
   sein".)* Sie steht über den anderen Regeln, weil sie sagt, wofür die App da ist:
   **Man macht sie impulsiv auf und wischt, bis etwas kommt** — ausdrücklich nicht wie
   beim Shoppen, wo man erst einen Riesenfilter baut und dann zwei Sachen sieht.
   Die Regel wirkt in **zwei** Richtungen, und die zweite ist die ungewohnte: Sie nimmt
   weg, was dasteht, UND sie bremst, was noch nicht gebaut ist — ein neuer Filter, ein
   neuer Umschalter, eine neue Einstellung muss ab jetzt begründen, warum sie im Weg
   stehen darf. **Die Grenze steht im zweiten Halbsatz und ist genauso verbindlich:**
   *„Wenn die Person etwas wissen will, dann soll's auch einfach für sie sein."*
   Wegräumen darf nicht heißen, dass man zweimal tippt für das, weswegen man gekommen
   ist — deshalb fällt am Filter-Knopf das WORT weg und der Zähler nicht (harte
   Regel 26), und deshalb verschwinden Zeit und Ort am Post-Screen nicht, sondern
   werden leise. **Bei jedem Wegnehmen mitprüfen, welche Entscheidung der Screen
   trägt.**
64. **Ein React-Native-`View` klippt seine Kinder NICHT — geklippt wird auf die Höhe,
   die man SIEHT.** *(Phase 19g, und es war die Ursache für fast alles, was Ian am
   Blatt aufgezählt hat.)* `overflow: visible` ist die Voreinstellung; ein Kasten mit
   `height: 0` zeichnet seinen Inhalt trotzdem, einfach daneben. Beim zugezogenen
   Blatt lagen so Suchzeile, Kategorien und Liste **ohne jeden Untergrund auf der
   nackten Karte** — und es sah aus wie ein durchsichtiges Blatt.
   **Der zweite Teil ist der lehrreichere:** Das Blatt HAT ein `overflow: 'hidden'`,
   und es half nicht. Es klippt auf DESSEN Kasten, und der ist die volle
   Containerhöhe — darin lag alles ordnungsgemäß drin. Wer eine Fläche verschiebt und
   nur einen Teil zeigt, klippt **an der Grenze des Gezeigten** (hier: `styles.huelle`),
   nicht am verschobenen Kasten. Dasselbe gilt für den Untergrund: Die Glasfläche
   bekommt `flex: 1`, damit sie **während** des Ziehens mitwächst — der Inhalt tut es
   nicht, die sichtbare Fläche schon.

65. **Die Reihenfolge des Feeds ist die ENTFERNUNG — und `sort.ts` trägt ZWEI
   Entscheidungen von Ian, nicht eine.** *(Entscheidung 63, 2026-09-08.)* Erste Stufe
   ist die Nähe zum eigenen Bezirk (`nachEntfernung`), zweite Stufe das Neueste
   (`nachErstellung`, Entscheidung 1 vom 2026-08-31). Die zweite ist nicht der
   Restposten der ersten: Alle Posts eines Bezirks teilen sich eine Entfernung, also
   entscheidet sie den häufigen Fall — genau dort, wo man am ehesten hingeht.
   **Beide tragen „nicht ohne Rückfrage".** Wer eine dritte Regel davorschaltet,
   fragt vorher; wer die Entfernung ANZEIGEN will, liest zuerst den Absatz über die
   Bezirksmitten in `lib/karte-geo.ts` — die Zahl ist heute nur für eine Ordnung gut
   genug, nicht für eine Auskunft. Ein Post ohne Bezirk hat keine Entfernung; wo er
   landet, sagt `OHNE_BEZIRK_POSITION` und nicht ein `if` in der Vergleichsfunktion.

66. **Ein `start`/`end` schlägt ein `left`/`right`, egal wer später kommt — und Web
   verrät es nicht.** *(Phase 19i, 2026-09-09.)* In Yoga sind das zwei verschiedene
   Eigenschaften, und die richtungsabhängige gewinnt. Die Tab-Leiste bringt
   `start: 0, end: 0` mit; unsere 16 pt standen als `left`/`right` und wirkten auf iOS
   **vier Wochen lang gar nicht**. Auf `react-native-web` werden beide zur selben
   CSS-Eigenschaft, dort gewinnt die spätere — **der Beleg im Browser war also richtig
   und trotzdem wertlos.** Wer die Position einer fremden Komponente überschreibt,
   liest nach, in welcher Schreibweise sie ihre eigene setzt, und nimmt dieselbe.
   Die Maße stehen als `TAB_KAPSEL_SEITE_KANTEN` in `lib/tabs.ts`.
67. **Auf dem Bezirks-Vollbild steht nichts außer Karten, Bar, Zurück und dem
   Bezirksnamen.** *(Ians Entscheidungen 65 und 66, Phase 19i.)* Ein Tipp auf einen
   Bezirk führt über die Blase (`alle N ansehen`) in ein Fenster, das nur noch die
   Frage „hingehen oder nicht" stellt — keine Suche, keine Kategorien, kein Filter,
   kein Posten, kein Umschalter. **Nur dort:** Der Startbildschirm behält alles, das
   hat er ausdrücklich bestätigt. Die zwei Dinge, die trotzdem dastehen, sind der
   zweite Halbsatz von Entscheidung 50 und keine Ausnahme — **ein Vollbild ohne
   Rückweg ist eine Sackgasse**, und ohne den Bezirksnamen sind es dieselben Karten
   wie am Start, nur ohne Bedienung. Der Zustand heißt `bezirkStapel` und ist bewusst
   **keine Route**: `/bezirk/[plz]` trüge die Auswahl in der Adresse, und dann stünde
   sie zweimal da (harte Regel 50).

68. **Was der Standort darf, steht in `features/posts/standort.ts` und nirgends
   sonst.** *(Phase 19h-2, Ians Entscheidungen 69 und 70.)* Dieselbe Bauart wie
   `safety/block.ts` (17), `groups/gruppe.ts` (32) und `requests/kollision.ts` (46):
   Screens lesen `STANDORT_ROLLE` und `STANDORT_FRAGE` nie, die Sätze kommen aus
   `standortFolgen()`. **Der Unterschied zu den anderen dreien ist, was die Datei
   verspricht** — harte Regel 47 in ihrer schärfsten Fassung, und in einer Form, die
   man nachprüfen kann: Der Standort geht **ausschließlich** in eine Reihenfolge ein,
   steht an keinem Post, in keinem Profil, in keinem Chat, wird **nicht gespeichert**
   (er liegt in der Sitzungs-Angabe `standort` im Speicher, wie `weggewischt`, und ist
   beim nächsten Start weg) und wird **nirgends angezeigt, auch nicht der Person
   selbst als Zahl**. Eine angezeigte Entfernung wäre ein Versprechen über
   Genauigkeit, das die Daten nicht abgeben können (siehe die Bezirksmitten in
   `lib/karte-geo.ts`) — und der erste Schritt zu „Lea ist 400 m weg".
   **Wer hier etwas ergänzt, das den Standort ANZEIGT oder SPEICHERT, hebt
   Entscheidung 61 und harte Regel 47 zugleich auf. Nicht ohne Rückfrage.**
   Das gilt ausdrücklich auch für Phase 20.4: Wo aus `weggewischt` später eine
   Sammlung am Nutzer wird, muss `standort` eine Zeile bleiben.

69. **Wer ich bin, kommt aus der SITZUNG — nie aus einer Konstante.** *(Phase 20.3-a,
   2026-09-09.)* In einem Haken `useCurrentUserId()`, in einer Aktion
   `getCurrentUserId()`, beide aus `features/auth/hooks.ts`, beide liefern `string`.
   **Dass sie kein `string | null` liefern, ist keine Bequemlichkeit, sondern eine
   Zusage, die woanders eingelöst wird:** Der Torwächter in `app/_layout.tsx`
   zeichnet den `Stack` gar nicht erst, solange niemand angemeldet ist. Wer diese
   Bedingung aufweicht — einen Screen ausgeloggt rendern, den Torwächter zu einer
   Überdeckung machen —, muss vorher 110 Stellen einen Sonderfall für „kein Ich"
   geben. Was die Regeln des Anmeldens sind, steht in `features/auth/anmeldung.ts`
   und nirgends sonst (dieselbe Bauart wie 17, 32, 46, 68); `ANMELDE_QUELLE` ist der
   eine Schalter, den 20.3-b umlegt. **`data/mock.ts` trägt nur noch
   `ATTRAPPE_ICH_ID`** — welcher Seed-Nutzer der eigene ist, und nicht mehr, wer
   „der aktuelle Nutzer" ist. Wer sie wieder so liest, dreht die Phase zurück.

70. **Was die Rechteliste verbietet, macht GENAU EINE Funktion — und ein fehlender
   `grant` ist eine Zusage, keine Lücke.** *(Phase 20.5, 2026-09-10.)* In
   `0002_policies.sql` haben `group_members`, `chat_threads` und `chat_participants`
   nur `select`. Das heißt nicht „vergessen", sondern: Beitreten ist das ERGEBNIS
   einer bestätigten Anfrage (Regel 55), ein Chat das Ergebnis einer Zusage. Wer
   einen dieser Grants nachträgt, hebt damit still eine Regel auf. Die sieben Wege
   stehen in `migrations/0004_transaktionen.sql`, jeder prüft selbst — denn
   `security definer` schaltet die Policies darunter AUS, und eine Funktion, die
   sich auf die Policy verlässt, verlässt sich auf etwas, das für sie nicht gilt.
   **Die Regel hat eine Grenze, und sie steht am Trigger `nachricht_notiert`:** Ein
   fehlender Grant verlangt eine Funktion, WENN etwas zu entscheiden ist. Beim
   `last_message_at` ist nichts zu entscheiden — dort wäre eine Funktion sogar
   schlechter, weil sie Ians `SCHREIB_REGEL` ein zweites Mal hinschreiben müsste.
   ⚠️ **Und die Regel verlangt an jeder Stelle eine ANTWORT auf die Frage *Zusage oder
   Lücke?* — beide kommen vor** (Phase 20.5, 2026-09-12). Bei `group_members` ist das
   fehlende Insert-Recht eine Zusage; bei `group_requests` war das fehlende
   delete-Recht eine **Lücke**, denn die Schwestertabelle `join_requests` kann es, und
   der Knopf „Anfrage zurückziehen" steht seit Phase 17 in der App
   (`0006_zuruecknehmen.sql`). Wer einen fehlenden Grant findet, sucht zuerst die
   Schwestertabelle und dann den Knopf. **Und ob die Rechteliste überhaupt gilt, sagt
   harte Regel 85** — am echten Supabase galt sie bis zum 2026-09-12 nicht.
71. **Ein Sicherheitsnetz gegen den Doppelklick ist KEINES gegen zwei Verbindungen.**
   *(Phase 20.5.)* `anfrage_bestaetigen()` liest die Post-Zeile mit
   `select … for update`. Ohne die Sperre lesen zwei gleichzeitige Bestätigungen
   denselben Stand, beide finden einen Platz frei — und danach sind **zwei Anfragen
   bestätigt, zwei Chats angelegt und ein Platz belegt, ohne dass irgendwo ein
   Fehler auftaucht.** Gemessen, nicht überlegt: `pruefen/30_wettlauf.sh` öffnet
   zwei echte Verbindungen und wird ohne die Sperre rot. **Wer eine Prüfung „ist
   noch Platz?" schreibt, fragt sich, was zwischen Lesen und Schreiben passieren
   kann** — im Browser war die Antwort „nichts", in einer Datenbank ist sie „alles".

53. **Die Geometrie der Bezirke steht EINMAL da — im Raster.** Wer sie in Grad braucht,
   rechnet über `PROJEKTION` aus `data/wien-bezirke.ts` um (`lib/karte-geo.ts`), und
   schreibt sie **nie** ein zweites Mal in den Generator. Die Projektion ist flach mit
   Kosinus-Korrektur und damit exakt umkehrbar; vier Zahlen ersetzen 886 Punkte. Wer
   eine Umrechnung prüft, prüft sie gegen **echte Orte** (Stephansdom → 1010) und nicht
   gegen sich selbst — ein Round-Trip besteht auch bei beidseitig falschem Vorzeichen.


72. **Ein Zeitstempel aus der Datenbank wird GETAUFT, bevor ihn jemand vergleicht.**
   *(Phase 20.4, 2026-09-10.)* `zeitpunkt()` in `data/zeilen.ts` ist die eine Stelle;
   sie macht aus `2026-09-10T07:59:29.833382+01:00` ein `…833Z`. Der Grund ist nicht
   Ordnung: **Neun Stellen der App sortieren Zeitstempel mit `localeCompare`, also als
   Text** (`posts/sort.ts`, `chat/sort.ts`, `requests/hooks.ts`, `groups/hooks.ts`).
   Gemessen — derselbe Augenblick ist als Text einmal „später" (Versatz `+01:00`) und
   einmal „früher" (`+00:00`) als die App-Schreibweise. Der Ausweg ist NICHT, die neun
   Stellen auf `Date`-Vergleiche umzubauen: Das wären neun Gelegenheiten, eine zu
   vergessen, und der Fehler wäre eine falsche Reihenfolge, die aussieht wie ein
   kaputter Sortierer. **Wer eine zweite Quelle für Zeitstempel anschließt, taucht sie
   durch dieselbe Funktion.**
73. **Eine aufgelöste Gruppe wird nicht gelöscht, sie HÖRT AUF — und gefragt wird mit
   `istAufgeloest()`.** *(Ians Entscheidung 41, gebaut in Phase 20.4.)* Die drei
   Felder gehören zusammen und entstehen gemeinsam: `aufgeloestAm` gesetzt,
   `memberIds` leer, `creatorId` auf `null` (`gruppe_verlassen()` in 0004 und
   `gruppeVerlassen` in `groups/hooks.ts` schreiben dasselbe). **Der Compiler zeigt
   dazu NICHTS an** — ein optionales Feld ist eine Lockerung. Die Enge sitzt deshalb
   in `istMitglied()`, `istGruender()`, `inGruppenListe()` und `darfBeitreten()`, und
   sie steht dort auch, wo sie heute nichts ändert: Dass eine aufgelöste Gruppe ohnehin
   keine Mitglieder hat, ist eine Tatsache über die DATEN und keine über die REGEL —
   und eine Regel, die sich auf die Form ihrer Daten verlässt, wirkt weiter, wenn ihr
   Grund wegfällt (Phase 18a). **Was `tsc` nicht findet, findet nur Nachsehen:** Eine
   Einladung in eine tote Gruppe stand deshalb weiter im Anfragen-Tab, und eine
   Beitritts-Anfrage war weiter möglich, weil `offen` beim Auflösen nicht angefasst
   wird. Ein Post „nur für diese Gruppe" bleibt stehen — das IST die Entscheidung.

74. **Es gibt EINEN Schalter für Anmeldung und Daten, und er heißt `ANMELDE_QUELLE`.**
   *(Phase 20.4-b, 2026-09-12.)* `LIEST_AUS_SUPABASE` in `lib/supabase.ts` wird daraus
   ABGELEITET und steht nicht daneben. Von den vier Kombinationen zweier Schalter
   funktionieren nur zwei, und die anderen beiden scheitern **stumm**: Supabase-Daten
   ohne Token ergeben **0 Zeilen** (die Policies tun ihre Arbeit), und das ist von
   „die Datenbank ist leer" nicht zu unterscheiden; umgekehrt findet eine
   Supabase-UUID in `mock.ts` niemanden. **Ein Schalter, der einen unmöglichen
   Zustand darstellen kann, ist derselbe Fehler wie `visibility: 'group'` mit
   `groupId: null` (Regel 31)** — nur an einer Stelle, an der kein Compiler hinsieht.
   Dieselbe Überlegung wie `PROJEKTION` (Regel 53) und die Project URL aus dem Token.
75. **Ein Realtime-Ereignis ist ein SIGNAL und wird nie gelesen.** *(Phase 20.4-b.)*
   `data/realtime.ts` nimmt aus keinem `payload` ein Feld; es stößt ein Nachladen an,
   und das geht durch die 33 Policies. Der Grund ist nicht Bequemlichkeit: Supabase
   wendet RLS auf `postgres_changes` bei INSERT und UPDATE an, **bei DELETE nicht.**
   Wer `payload.new` in den Speicher legt, hat eine ZWEITE Fassung der
   Sichtbarkeitsregel, und die schwächere. Welche Tabellen überhaupt senden dürfen,
   steht in `migrations/0005_realtime.sql` — **`blocks` und `reports` NICHT** (bei
   `blocks` ist der Primärschlüssel `(blocker_id, blocked_id)`, ein Entblocken wäre
   damit eine Nachricht an den Blockierten, Regel 10). `REPLICA IDENTITY` bleibt
   DEFAULT: Auf `FULL` — die überall empfohlene Einstellung — gehen bei jedem Update
   und Delete **alle Spalten der alten Zeile** über die Leitung.
   **Entprellt wird, weil Regel 6 hier rückwärts ankommt:** Was als EINE Transaktion
   gedacht war, kommt am Kanal als drei Ereignisse an.
76. **Was dasteht, wenn die Daten nicht kommen, steht in `data/quelle.ts`.**
   *(Ians Entscheidung 43, Phase 20.4-b.)* Dieselbe Bauart wie `safety/block.ts` (17),
   `groups/gruppe.ts` (32), `requests/kollision.ts` (46), `posts/standort.ts` (68) und
   `auth/anmeldung.ts` (69). Der Grund ist, dass **`supabase-js` nicht wirft**: Es gibt
   `{ data, error }` zurück, und `data ?? []` macht aus jedem Fehler eine leere Liste —
   die App sagt dann „Noch nichts los in deinem Feed", und das ist ein Satz, der lügt.
   `laden.ts` wirft deshalb einen `LadeFehler` **mit Tabellenname und `code`**; auf den
   BILDSCHIRM kommt keines von beidem (der 2026-09-03-Fund: Entwickler-Notizen in
   JSX-Text sind öffentlich). **Der Knopf tut zwei verschiedene Dinge**, und das
   entscheidet `anmeldenNoetig` in der Regel-Datei, nicht die Oberfläche: Bei `42501`
   ist ein neuer Ladeversuch sinnlos, und ein Knopf, der „Anmelden" sagt und neu lädt,
   ist eine Schleife, die wie ein Defekt aussieht.

77. **Wer den Torwächter liest, nimmt `torwaechterZeigt()` — nie `zustand === 'an'`.**
   *(Phase 20.3-b1, 2026-09-12.)* `Sitzung` hat seit heute VIER Glieder: `'unbekannt'`
   (es wird noch nachgesehen), `'aus'`, `'neu'` (angemeldet, aber ohne Profil) und
   `'an'`. Die zwei neuen sind LOCKERUNGEN, und die Phase-16-Lehre gilt: **`tsc` meldet
   dazu null Stellen.** Der alte Vergleich bleibt gültiger Code und hätte jemanden mit
   gültigem Token wieder vor den Anmelde-Bildschirm gesetzt — samt zweitem Code.
   Deshalb sitzt die Enge in `features/auth/anmeldung.ts`: ein erschöpfender `switch`
   mit `never`-Abschluss. Wer ein fünftes Glied einführt, bekommt dort einen Typfehler
   statt eines stillen Bildschirms. **Und `'neu'` trägt `authId`, nicht `ichId`** — das
   ist kein Namensunterschied: `ichId` ist eine `User.id`, also der Verweis auf eine
   Zeile, die es noch nicht gibt.
78. **Was beim ERSTEN Konto gefragt wird, steht in `features/auth/konto.ts`.**
   *(Ians Entscheidung 44.)* Dieselbe Bauart wie `safety/block.ts` (17),
   `groups/gruppe.ts` (32), `requests/kollision.ts` (46), `posts/standort.ts` (68),
   `auth/anmeldung.ts` (69) und `data/quelle.ts` (76): Screens lesen `ERSTE_FRAGEN` nie,
   die Sätze kommen aus `kontoFolgen()`. Gefragt werden **Name · Bezirk · Jahrgang**;
   der `@handle` wird ABGELEITET (`handleVorschlag()`) und ist Ergebnis, keine Frage.
   Wer ihn eintippbar macht, macht aus Entscheidung 44 die verworfene Möglichkeit B.
   **Und wer ein viertes Feld ergänzt, begründet es gegen harte Regel 63** — beim ersten
   Konto heißt die Entscheidung „ich will rein", und jedes Feld davor ist eine
   Gelegenheit aufzuhören.
79. **Ein abgeleiteter Wert, der `unique` sein muss, wird GESCHRIEBEN und der Fehler als
   Antwort genommen.** *(Phase 20.3-b1.)* `profilAnlegen()` probiert `@ian`, `@ian2`, …
   und liest `23505`. Vorher nachzusehen, ob der Name frei ist, wäre der naheliegende
   Weg und der falsche: Zwischen Nachsehen und Schreiben liegt genau das Fenster aus
   harter Regel 71 — zwei Menschen, die gleichzeitig „Ian" tippen, bekommen beide ein
   „ist frei". **Die Datenbank ist die einzige Stelle, die es wirklich weiß.**
   Dazu: **`23505` bedeutet zweierlei.** Am `handle` ist es die Kollision, an
   `profiles_pkey` der Doppelklick — und der ist **kein Fehler, sondern das Ergebnis**.
   Jeder andere Code bricht sofort ab, sonst läuft die Schleife zwanzigmal gegen eine
   abgelaufene Anmeldung und meldet am Ende etwas, das in die Irre führt.
80. **Die Startfläche aus `+html.tsx` hängt am TORWÄCHTER, nicht am Laden der Daten.**
   *(Phase 20.3-b1.)* Bis 20.4-b stand dort `laden.zustand !== 'laeuft'`, und das war
   richtig, solange es keinen ausgeloggten Zustand gab. Jetzt gibt es ihn: **Ohne
   Anmeldung wird nie geladen**, `laden` bleibt für immer auf `'laeuft'`, und die
   Abdeckung ginge nie weg — der Anmelde-Bildschirm läge fertig gezeichnet darunter, und
   die App sähe aus wie hängengeblieben. Die Frage ist nicht *„sind die Daten da?"*,
   sondern **„steht etwas zum Anschauen?"**. Gemessen am 2026-09-12 beim ersten Umlegen
   des Schalters; dieselbe Familie wie das weiße Logo auf Papierweiß.

81. **Einen Bezirk gibt man an, man wählt ihn nicht — `SsBezirkFeld`, nie 23 Chips.**
   *(Ians Rückmeldung vom 2026-09-12, nach seinem ersten eigenen Durchgang durch den
   Bildschirm fürs erste Konto: „bitte merk dir das endlich mit den Bezirken dass das
   nicht geht, bitte ein Feld wo man seine Postleitzahl eingeben soll.")* Gilt für den
   Bildschirm fürs erste Konto und für den Heimatbezirk in `/einstellungen`.
   **`BEZIRKS_LISTE` bleibt für FILTER richtig** — und genau darin liegt der
   Unterschied: Beim Filtern wählt man aus dem, was da ist (`useBezirkeImFeed`,
   Phase-15-Falle); hier gibt man etwas an, das man ohnehin weiß. Jeder Wiener kennt
   seine vier Ziffern; sie unter 23 Chips zu suchen ist mehr Arbeit als sie zu tippen,
   und auf 360 px sind es sechs Zeilen, die alles darunter aus dem Bild schieben
   (gemessen: 132 px Überhang allein durch das Raster). Harte Regel 63.
   **Ein freies Feld braucht dafür etwas, das eine Liste geschenkt hat:** Eine Liste
   bestätigt sich selbst — was dasteht, gibt es. `1240` sieht aus wie ein Bezirk und
   ist keiner. Deshalb zeigt das Feld den NAMEN zur Zahl, und das fängt auch den
   Zahlendreher ab, den `istWienerBezirk()` allein durchlässt: Wer `1120` statt `1210`
   tippt, liest „Meidling" statt „Floridsdorf".
82. **Eine Längenbegrenzung an einem Eingabefeld ist eine ANNAHME — und `maxLength`
   schneidet stillschweigend ab.** *(2026-09-12, an Ian gemessen.)* `maxLength={6}` am
   Code-Feld war meine Annahme über eine Supabase-Einstellung, die 6 bis 10 zulässt
   (*Email OTP Length*, bei Ian auf 8). Er tippte den richtigen Code, das Feld verwarf
   zwei Ziffern, und die App sagte ihm, der Code sei falsch — **sie hat ihn für ihren
   eigenen Fehler beschuldigt.** Deshalb stehen `CODE_MIN`/`CODE_MAX` in
   `features/auth/anmeldung.ts` und nicht als Zahl im Bildschirm: Die Länge gehört
   Supabase. Allgemein: **Ein zu großzügiges Feld kostet nichts, ein zu kleines
   verwirft Eingaben** — und wer prüfen will, ob eine Eingabe stimmt, fragt die Stelle,
   die sie erzeugt hat, nicht das Feld.

83. **Ein Prüfstand fasst NUR seine eigenen IDs an — und jede Zählung darin auch.**
   *(Ians Entscheidung 45, 2026-09-12.)* `50_lesen.sh` und `60_konto.sh` schreiben in
   die Produktionsdatenbank. Erlaubt ist das, weil beide ausschließlich unter FESTEN
   UUIDs anlegen (`11111111-…` bis `55555555-…`, die zwei Chat-Fäden `0c00000…`,
   `aaaaaaaa-0000-…` und `bbbbbbbb-0000-…`) und seit heute auch nur die wieder
   löschen. **Wer hier eine Zeile ergänzt, die etwas ohne feste ID anfasst, hebt die
   Entscheidung auf** — und man merkt es nicht, weil so eine Zeile im eigenen Lauf
   genau richtig aussieht.
   **Der Fallstrick sind nicht die `delete`s, sondern die MESSUNGEN.** Ein
   `count(*) from auth.users` ist eine Frage an die ganze Datenbank für eine Aussage
   über die eigenen zwei Zeilen: rot, sobald jemand Echtes danebensteht, und grün,
   wenn das Abräumen zu viel gelöscht hat — also falsch in genau dem Fall, der weh
   tut. Dasselbe gilt für jedes `select` ohne `where id in (…)`. Gegengemessen wird
   nicht daran, dass der Lauf grün ist, sondern daran, dass die FREMDEN Zeilen ihn
   überleben.
   **Und die Begründung gehört mitgepflegt:** Der alte Wächter sperrte alles mit einem
   Satz, der zum Zeitpunkt des Sperrens nicht mehr stimmte. Ein Kommentar, der eine
   Sicherheitszusage begründet, ist so viel wert wie eine Messung — nämlich keine,
   wenn er veraltet ist.

84. **Was der Bildschirm macht, während geschrieben wird, steht in
   `data/schreiben.ts` — und „Zurückrollen" gibt es nicht.** *(Ians Entscheidung 46,
   Phase 20.5.)* Dieselbe Bauart wie `safety/block.ts` (17), `groups/gruppe.ts` (32),
   `requests/kollision.ts` (46), `posts/standort.ts` (68), `auth/anmeldung.ts` (69),
   `data/quelle.ts` (76) und `auth/konto.ts` (78): Screens lesen `SCHREIB_ANTWORT` nie,
   sie fragen `useWartetAuf(aktion, marke)` und sehen sonst nur das Ergebnis.
   **Der Trennstrich ist eine FRAGE und keine Liste von Ausnahmen:** *Kann die App das
   Ergebnis selbst hinschreiben, ohne zu raten?* „Nein" hat zwei Gestalten — der Server
   ENTSCHEIDET (ist noch ein Platz frei? wer erbt?), oder er VERGIBT eine ID, zu der
   der Bildschirm springt. Neun Aktionen warten, fünfzehn nicht; `EINORDNUNG` ist ein
   `Record<SchreibAktion, …>`, **eine neue Aktion ohne Eintrag ist ein Typfehler** —
   dieselbe Technik wie `IconName` (Phase 14) und `torwaechterZeigt()` (Regel 77).
   **Und der wichtigste Teil ist, was NICHT dasteht:** Es gibt zu keiner der 24
   Änderungen eine Umkehrfunktion. Geht ein Schreibvorgang schief, wird
   **NACHGELADEN — das Nachladen IST die Rücknahme.** Wer hier ein „Rückgängig" baut,
   schreibt 24 Vorhersagen über das Verhalten des Servers hin, und genau daran ist
   Möglichkeit B gescheitert.
85. **Am echten Supabase bekommt JEDE neue Tabelle in `public` alle Rechte — eine
   Rechteliste gilt erst nach einem `revoke`.** *(Gemessen am 2026-09-12, Phase 20.5.)*
   Supabase trägt dort eine Voreinstellung (`alter default privileges`) für `anon`,
   `authenticated` und `service_role`; ein `grant` in einer Migration kommt danach und
   **fügt nur hinzu**. Der Fuß von `0002_policies.sql` war deshalb am Original eine
   Absichtserklärung — `group_members` hatte lokal `SELECT` und echt alles.
   **Gefährlich ist nicht, dass etwas offen wäre** (RLS weist auch mit Grant ab),
   sondern die Art der Abweisung: fehlender GRANT → `42501`, **laut**; fehlende POLICY
   bei DELETE/UPDATE → **null Zeilen, still.** In diesem Projekt ist still die teure
   Sorte. `0007_rechte.sql` nimmt alles weg und erteilt genau die Liste aus 0002 wieder;
   `service_role` bleibt unangetastet. `einspielen.sh` misst die Zahlen nach
   (**`anon` 0 · `authenticated` 34**). Und `00_supabase_lokal.sql` bringt die
   Voreinstellung seither MIT — sonst prüft die Wegwerf-Datenbank etwas Strengeres als
   das Original, und das ist die Attrappen-Falle vom 2026-09-06.
86. **Ein Prüfstand, der SCHREIBT, schreibt jede erzeugte ID sofort mit.**
   *(Phase 20.5, und es ist die Fortsetzung von harter Regel 83.)* Beim Lesen entstehen
   keine Zeilen; beim Schreiben vergibt der SERVER sie (`gen_random_uuid()`), und die
   stehen in keiner festen Liste. Der teure Fall ist eine Gruppe, die der Lauf gründet
   und dann VERLÄSST: Danach ist `creator_id` vererbt oder `null` (Entscheidung 41),
   und `52_abraeumen.sql` findet Gruppen über ihren Gründer — sie bliebe für immer in
   der echten Datenbank liegen. **Der naheliegende Ausweg ist verboten:** „alle Gruppen
   ohne Chef löschen" ist genau der Rundumschlag, den Entscheidung 45 am selben Tag
   entfernt hat. Also `merken(art, id)` **unmittelbar nach dem Anlegen**, in eine Datei
   ausserhalb von `$ARBEIT` — bei einem Sammeln bis zum Schluss wäre die Liste nach
   einem Abbruch in der Mitte leer, also genau dann, wenn man sie braucht.
87. **„Es wird geladen" und „es wird NACHgeladen" sind zwei Lagen — gefragt wird mit
   `ladeSichtFuer()`, nie mit `laden.zustand === …`.** *(Gemessen am 2026-09-12 beim
   ersten Durchgang mit echten Daten.)* `'laeuft'` heißt **es war noch nie etwas da**
   (Start, und nach dem Abmelden); `'nachladen'` heißt **es steht etwas da und wird
   aufgefrischt**. Die Verwechslung kostete den Bildschirm: `datenHolen()` setzte immer
   `'laeuft'`, der Torwächter zeichnete dann `null` statt des `Stack`, und damit baute
   **jeder der 24 Schreibvorgänge und jeder Realtime-Anstoß den ganzen Navigator ab.**
   Gemessen, ohne dass jemand etwas tut: Ian steht auf `/post/…`, Lea schreibt in einen
   FREMDEN Chat — Bildschirmtext 204 → **12**, Adresse `/post/…` →
   **`/account-loeschen`** → `/`. Das ist die Falle aus Phase 20.3-a an einer zweiten
   Stelle: **Wer einen Navigator bedingt zeichnet, baut ihn bei jeder Zustandsänderung
   ab**, und `expo-router` schreibt die Adresse dann auf die alphabetisch erste Route.
   **Die richtige Frage stand schon drei Zeilen darüber** (`useStartFlaecheWeg`,
   derselbe Tag): *nicht „sind die Daten da?", sondern „steht etwas zum Anschauen?"*.
   Die Enge sitzt deshalb in einem erschöpfenden `switch` mit `never` in
   `data/quelle.ts` — ein neues Glied am Union ist eine Lockerung, und die meldet `tsc`
   nicht (Phase-16-Lehre). **Und der Fehler-Fall ist bewusst noch der alte:** Ein
   gescheitertes NACHladen zeigt weiter den Vollbild-Kasten, obwohl Daten dastehen;
   `LADE_FEHLER = 'zeile'` ist die Nachbesserung, die `quelle.ts` selbst vorhergesagt
   hat — und sie ist Ians Entscheidung, nicht meine.

88. **Was ein Profilbild ist und wer es sehen kann, steht in
   `features/social/bild.ts` — und bei einem OFFENEN Bucket schützt nur der NAME.**
   *(Ians Entscheidungen 50 und 51, Phase 20.6.)* Dieselbe Bauart wie
   `safety/block.ts` (17), `groups/gruppe.ts` (32), `requests/kollision.ts` (46),
   `posts/standort.ts` (68), `auth/anmeldung.ts` (69), `data/quelle.ts` (76),
   `auth/konto.ts` (78) und `data/schreiben.ts` (84): Screens lesen `BILD_SICHT`,
   `BILD_MAX_BYTES` und `BILD_CACHE_SEKUNDEN` nie, die Sätze kommen aus
   `bildFolgen()` und `bildHuerdeText()`.
   **Der Unterschied zu den anderen acht ist, wo die Regel WIRKT:** Bei einem
   offenen Bucket liefert ein CDN die Datei aus — Postgres wird beim Abruf gar nicht
   gefragt, es greift **keine einzige der 34 Policies**. Was ein Bild schützt, sind
   deshalb zwei ganz andere Dinge: der nicht zu ratende Dateiname (`bildPfad()` —
   Ordner = eigene UUID, damit die Policies greifen; Dateiname = 16 Byte Zufall aus
   `crypto`, und **lieber ein Fehler als ein schwacher Zufall**, deshalb wirft
   `zufallsName()` statt auf `Math.random()` zurückzufallen) und die Tatsache, dass
   die Adresse nur in `profiles.photo_url` steht — also in einer Tabelle MIT Policy.
   Deshalb ist `select` auf `storage.objects` auf den eigenen Ordner begrenzt: Sonst
   liest jemand den Zufallsnamen ab, statt ihn raten zu müssen.
   **`BILD_TYPEN` ist eine Whitelist und nie `image/*`:** `image/svg+xml` IST ein
   Bild und kann Skript enthalten — auf einem offenen Bucket wäre das eine Datei auf
   unserer eigenen Adresse, die im Browser läuft.
   ⚠️ **Wer `BILD_SICHT` ändert, ändert drei Dateien** (Bucket in 0008, die Adresse,
   die Sätze). Nicht ohne Rückfrage.
89. **In `storage` gibt es nur EINEN Riegel, und ein SQL-`delete` gibt es gar
   nicht.** *(Phase 20.6, beides gemessen.)* Zwei Dinge, die in `public` gelten,
   gelten dort nicht:
   **(a)** Die Rechteliste ist kein zweiter Riegel. `anon` hat auf `storage.objects`
   und `storage.buckets` ALLE Rechte — dieselbe Supabase-Voreinstellung, die
   `0007_rechte.sql` für `public` weggenommen hat. **Hier wird sie NICHT
   weggenommen**, weil der Storage-Dienst selbst unter `authenticated` arbeitet; ein
   `revoke` repariert die App, indem es sie abschaltet. Offen ist deswegen nichts
   (RLS an, für `anon` keine Policy, `storage` über PostgREST nicht erreichbar) —
   aber **jede der vier Policies aus 0008 ist die ganze Absicherung ihrer
   Richtung.**
   **(b)** `delete from storage.objects` scheitert IMMER, auch als `postgres`:
   Supabase hängt dort `storage.protect_delete` als `before delete`-Trigger hin.
   Er läuft VOR RLS, also ist die `delete`-Policy per SQL überhaupt nicht prüfbar —
   sie wirkt nur über die Storage-Schnittstelle, und gemessen wird sie in
   `80_bilder.mjs`. **Wer einem gelöschten Konto sein Bild mitgeben will, tut das in
   der APP vor dem Aufruf** (`profilbildEntfernen()`), nicht in `konto_loeschen()`.
   Der Schalter `storage.allow_delete_query` gehört ausschließlich in einen
   Prüfstand, dessen Zeilen in derselben Minute wieder weg sind — in der App ließe
   er die DATEI für immer und unauffindbar liegen.

90. **Ein Bild vom GERÄT kommt als base64 herein, nie über seine `uri` — und der Typ
   ist IMMER `image/jpeg`.** *(Phase 20.6-b, 2026-09-13, beides gemessen in
   `node_modules/expo-image-picker/ios/ImageUtils.swift`.)* Zwei Tatsachen, die man
   leicht verwechselt:
   **(a)** `asset.uri` zeigt auf die DATEI, und die bleibt bei einem iPhone-Foto
   **HEIC** (Zeile 147: `case UTType.heic.identifier: return (rawData, ".heic")`).
   `image/heic` steht nicht in `BILD_TYPEN` — wer `asset.mimeType` als Typ nimmt,
   weist damit **jedes gewöhnliche iPhone-Foto** ab. Das ist nicht der Rand, sondern
   der Normalfall, dieselbe Familie wie „wer nie ein Profilbild hatte" (20.6-c).
   **(b)** `asset.base64` ist laut Zeile 206 *„always JPEG regardless of the source
   file's original format"*. Deshalb steht `BILD_TYP_VOM_GERAET` als Konstante in
   `features/social/bild.ts` und wird nicht vom Bild übernommen: Der Inhalt IST JPEG,
   also muss der `content-type` JPEG sagen. Liefe beides auseinander, läge im Bucket
   eine JPEG-Datei mit der Aufschrift „HEIC", und kein Browser zeigte sie an.
   **Die `uri` ist trotzdem nicht wertlos — sie ist die VORSCHAU.** Zum Anschauen
   taugt HEIC (iOS zeigt es an), zum Hochladen nicht; `Bilddatei` trägt beides
   getrennt. Wer die Felder zusammenlegt, macht je nach Zweig einen der beiden Fälle
   still kaputt.
91. **`@supabase/storage-js` nimmt auf React Native KEINEN `Blob` — und die
   Größenangabe muss danebenstehen.** *(Phase 20.6-b.)* Die Bibliothek sagt es in
   ihrem eigenen Quelltext am `upload`: *„For React Native, using either `Blob`,
   `File` or `FormData` does not work as intended. Upload file using `ArrayBuffer`
   from base64 file data instead."* Der Mechanismus steht dreißig Zeilen darüber
   (`StorageFileApi.ts`, Zeile 99 ff.): Ein `Blob` wird in ein `FormData` gewickelt,
   alles andere geht als roher Rumpf hinaus — **und nur in diesem zweiten Zweig setzt
   storage-js `content-type` und `cache-control` als HEADER.** Ians Entscheidung 51
   reist also je nach Plattform auf zwei verschiedenen Wegen mit; dass beide
   ankommen, misst `80_bilder.mjs`, indem es die Header der zwei Wege GEGENEINANDER
   hält statt gegen eine Zeichenkette. **Und weil storage-js am TYP entscheidet und
   nicht an der Plattform, ist der Geräte-Weg vom Mac aus messbar** — ein
   `Uint8Array` aus Node nimmt denselben Zweig wie ein iPhone.
   ⚠️ **Daraus folgt die Zeile, die man vergisst:** `Bilddatei` führt `bytes`
   ausdrücklich mit. Ein `Blob` hat `.size`, ein `Uint8Array` hat `.byteLength` — und
   `undefined > BILD_MAX_BYTES` ist `false`. Ein `wahl.datei.size` am Gerät lässt die
   Größenprüfung **still ausfallen**: kein Typfehler, keine Meldung, jedes Bild geht
   durch, bis der Bucket es ablehnt. Dieselbe Familie wie `Post.district`
   (`string | null` erzwingt in JSX nichts) und `ChatThread.postId`.
92. **Ein Prüfstand, der Beispiele AUSWÄHLT, muss die Eigenschaft erzwingen, an der
   der Fehler hängt — sonst prüft er den Zufall.** *(Phase 20.6-b, am eigenen
   Prüfstand gelernt.)* `90_bildwahl.sh` hielt `lib/base64.ts` gegen „das kleinste,
   ein mittleres, das größte" echte Bild. Ein absichtlich eingebauter Bit-Versatz
   fiel **ausschließlich bei Längen auf, die durch 3 teilbar sind** — einer von drei
   Fällen, und er war nur durch Glück dabei. Ein gelöschter Beleg hätte gereicht, und
   der Lauf wäre grün bei kaputtem Dekoder gewesen.
   **Der Kommentar wusste es schon und der Code nicht** (*„hängt an `size % 3`, nicht
   an der Größe"*) — harte Regel 83 innerhalb einer Datei. Jetzt wird jede Datei in
   allen drei Restklassen angeschnitten; drei verschiedene eingebaute Fehler ergeben
   5, 13 und 3 Kreuze. **Allgemein: Erst benennen, woran der Fehler hängt, dann die
   Auswahl danach bauen — nicht nach der Größe, die man gerade zur Hand hat.**

93. **Bei Apple und Google gibt es KEINEN Nonce — und das ist gemessen, nicht
   vergessen.** *(Phase 20.3-b2, 2026-09-13.)* Zwei Zeilen fremder Quelltext machen
   ihn zur Falle: `expo-apple-authentication/ios/AppleAuthenticationRequest.swift`
   Zeile 31 macht `request.nonce = options.nonce` — es **reicht durch und hasht
   nicht**; `@supabase/auth-js/…/lib/types.d.ts` Zeile 639 sagt, verglichen werde
   *„the HASH of this value"*. Derselbe Rohwert an beide ergibt `invalid_id_token`,
   also eine Absage, die nach einem kaputten Schlüssel aussieht — und man sucht
   tagelang am Key (dieselbe Familie wie das fehlende `usesAppleSignIn`). Richtig
   wäre der gehashte Wert an Apple und der rohe an Supabase. **Nur ist von hier aus
   nicht nachprüfbar, WIE Supabase hasht** (hex oder base64url), und ein geratenes
   Format scheitert ausschließlich auf einem fremden iPhone, mit einer Meldung, die
   niemand liest. Ein Zustand, den man nur beim Nutzer sieht, ist keiner, den man
   annimmt (Ians Entscheidung 55, Möglichkeit A, in zweiter Gestalt).
   **Was stattdessen schützt:** Bei Apple der Weg selbst — der Ausweis geht
   unmittelbar vom Betriebssystem zu Supabase, lebt zehn Minuten und trägt
   `at.simplysocial.app` als Empfänger. Bei Google **PKCE**: Deshalb nimmt
   `googleAusweis()` den Code-Weg und nicht `response_type=id_token`, der einen
   Nonce ERZWINGT. **Wer hier einen Nonce ergänzt, prüft ihn am GERÄT nach und nicht
   im Kopf** — und schreibt dazu, in welchem Format.
94. **Ein Anmeldeweg ist eine Frage an das GERÄT, nicht an die Plattform — und die
   Antwort ist ein Pflichtfeld.** *(Phase 20.3-b2.)* `anmeldeFolgen(weg, lage)` hat
   seit 20.3-b2 einen zweiten Parameter, und der ist absichtlich **Pflicht und nicht
   `?`**: Mit einem optionalen Feld wären alle Aufrufstellen stumm durchgelaufen, und
   der Apple-Knopf stünde im Browser als klickbarer Knopf da (dieselbe Technik wie
   `meinOrt` in `SortKontext`, 19h-2). Woher die Antwort kommt, steht in
   `lib/anmelde-anbieter.ts` / `.native.ts` — Plattform-ENDUNG, und **gemessen ist,
   dass sie hält**: Im Web-Bündel stehen `expo-apple-authentication`,
   `expo-auth-session` und `expo-secure-store` **null Mal**, und die Google-Client-ID
   aus `.env` ebenfalls nicht.
   **Der Grund ist keine Bequemlichkeit, sondern eine Tatsache über die Konten:**
   Apples Client-ID in Supabase ist die Bundle-ID `at.simplysocial.app` — eine native
   Kennung. Apples Web-Anmeldung verlangt eine eigene *Services ID* samt Schlüssel.
   „Apple im Browser" ist also nicht halb fertig, sondern **unmöglich**, und ein Knopf
   dafür wäre ein Knopf, der lügt. **Wer den Weg im Browser öffnen will, legt zuerst
   die Services ID an — nicht zuerst den Knopf.**
   ⚠️ **Und ein ABBRUCH ist kein Fehler:** `anbieterFehlerText('abgebrochen')` gibt
   `null` zurück, und dann steht nichts da. Wer den Apple-Dialog wegwischt, hat
   entschieden; eine rote Zeile behauptet, es sei etwas schiefgegangen — dieselbe
   Familie wie „Noch nichts los in deinem Feed" bei einem Netzausfall.

95. **Eine ABLEITUNG von `ANMELDE_QUELLE` steht NIE in `anmeldung.ts` — sie steht
   dort, wo ihre Frage gestellt wird.** *(2026-09-13, gemessen beim ersten Umlegen
   des Schalters.)* TypeScript verengt ein `const` **innerhalb derselben Datei** per
   Control-Flow-Analyse auf den zugewiesenen Literal; die Union-Annotation gilt erst
   **über Modulgrenzen hinweg**. Ein `ANMELDE_QUELLE === 'attrappe'` neben der
   Deklaration ergibt deshalb `TS2367: This comparison appears to be unintentional`
   — **und zwar nur in EINER der beiden Schalterstellungen**, also in der, in der
   gerade niemand baut. Eine Zwischenvariable mit eigener Annotation hilft nicht;
   beide Fassungen sind gegen `tsc` gehalten worden.
   **Daraus folgt etwas über den Bestand:** `LIEST_AUS_SUPABASE` (harte Regel 74)
   funktioniert nur, WEIL es in `lib/supabase.ts` steht, und `IST_PROTOTYP` (Ians
   Entscheidung 56) nur, weil es in `components/PrototypHinweis.tsx` steht. Wer eines
   davon „aufräumend" zur Quelle schiebt, bricht den Build — und merkt es erst beim
   nächsten Gerätebuild. **Der Ort ist hier kein Stil, sondern eine Bedingung.**
96. **Was am Gerät gilt, entscheidet der Schalter — und `deploy.sh` bewacht ihn seit
   dem Tag, an dem das WARNSIGNAL wegfiel.** *(Ians Entscheidung 56, 2026-09-13.)*
   Bis dahin fiel ein versehentlich umgelegter Schalter auf der öffentlichen Adresse
   von selbst auf: zwei tote Knöpfe (Apple und Google gehen im Browser gar nicht,
   Regel 94) und darüber ein Vollbild, das „Es gibt keinen Login" behauptete. **Seit
   der Hinweis bei `'supabase'` verschwindet, sähe derselbe Fehldeploy sauber aus** —
   und läge mit echten Daten und echter Anmeldung auf einer Adresse, die per WhatsApp
   weitergeht. Der Wächter steht deshalb GANZ OBEN in `scripts/deploy.sh`, vor
   `tsc` und vor dem Export, und liest ausnahmsweise die QUELLE statt des Ergebnisses:
   Der Minifier löst den Vergleich zu einem Wahrheitswert auf, die Zeichenkette kann
   verschwinden, und **eine Prüfung, die MANCHMAL nichts findet, ist schlechter als
   eine, die immer dieselbe Zeile liest.**
   ⚠️ **Und er ist für einen GERÄTEbuild ausdrücklich nicht im Weg:** `npm run geraet`
   ist ein anderer Befehl und fasst `gh-pages` nicht an (harte Regel 35). Genau das
   wurde bis zum 2026-09-13 zusammengeworfen — der Schalter galt als Blocker für den
   Gerätedurchgang, und er war nie einer.
97. **Ein „schon gesehen" gehört in `lib/merker.ts` / `.native.ts` — und bedeutet auf
   den zwei Plattformen absichtlich VERSCHIEDENES.** *(Ians Entscheidung 57,
   2026-09-13.)* Im Browser `sessionStorage` (pro Tab — *wer in drei Wochen
   wiederkommt, hat die Wischgeste vergessen, dann darf die Karte noch einmal
   kommen*), am Gerät `AsyncStorage` (für immer — dort gibt es keine Tab-Sitzung, und
   die Karte stünde bei JEDEM Start im Weg). Wer eine der beiden Dateien anfasst,
   liest zuerst die andere.
   **`AsyncStorage` und nicht `expo-secure-store`, und die Begründung ist schärfer als
   „überflüssig":** Der iOS-Schlüsselbund **überlebt das Löschen der App.** Wer sie
   wegwirft und neu installiert, bekäme die Anleitung nie wieder zu sehen. Dieselbe
   Trennung wie Entscheidung 55, nur mit umgekehrtem Vorzeichen — dort war der
   Schlüsselbund der richtige Ort, hier ist er der falsche.
   ⚠️ **Der Merker wird nie gelöscht, auch nicht beim Abmelden.** Er gehört dem GERÄT
   und nicht dem Konto: Wer sich abmeldet, hat die Wischgeste trotzdem gelernt. Das
   ist der Unterschied zum Zwischenspeicher in `store.ts`, der beim Abmelden geleert
   werden MUSS (Phase 20.4-b).

98. **Zwei Spalten, die auf dieselbe Tabelle zeigen, werden GEGENEINANDER geprüft —
   nicht je gegen einen festen Wert.** *(Phase 20.7, 2026-09-13, gemessen.)*
   `reports.from_user_id` und `reports.erledigt_von` verweisen beide auf `profiles`.
   Die eine hat `on delete set null`, die andere hatte **gar keine Klausel**, also
   `NO ACTION` — und damit war ein Konto nach der ersten bearbeiteten Meldung
   **unlöschbar**, weil `konto_loeschen()` als letzte Zeile `delete from auth.users`
   macht. **Die Spalte, die es nur wegen Apple 1.2 gibt, hätte die andere
   Apple-1.2-Pflicht gebrochen.** Dieselbe Familie wie `groups_creator_id_fkey`
   (Entscheidung 39) und wie das `not null` an `from_user_id`, vor dem 0001 wörtlich
   warnt: **Postgres nimmt die Kombination an und scheitert erst, wenn wirklich jemand
   sein Konto löscht** — also an dem Tag, an dem es niemand mehr in Ruhe nachsehen kann.
   Der Wächter in `0009_meldungen.sql` fragt deshalb nicht „steht `n` da?", sondern
   **„sind die beiden gleich?"**: Das Auseinanderlaufen war der Fehler, und zwei
   getrennte Prüfungen hätten ihn nie als Unterschied gezeigt. Wer eine dritte solche
   Spalte ergänzt, zieht den Vergleich mit.
99. **Ein Sigil gehört der ANZEIGE — `handleText()` aus `lib/handle.ts`, nie
   `@{person.handle}` im Screen.** *(Phase 20.7, gemessen.)* Was gespeichert wird, sagt
   `handleVorschlag()` in `features/auth/konto.ts`: **`'ian'`, ohne `@`** (von
   `60_konto.mjs` am echten Server gemessen, und genau das schreibt `profilAnlegen()`).
   Was dasteht, sagt `handleText()`: `'@ian'`. Bis zum 2026-09-13 trugen `mock.ts` und
   `05_daten.sql` das Zeichen IM WERT und zehn Screens zeichneten roh — **der Prototyp
   sah vier Wochen richtig aus, und mit `ANMELDE_QUELLE = 'supabase'` hätte jeder
   @-Name sein `@` verloren.** `tsc` schweigt, beides ist `string`; dieselbe Familie wie
   `Post.district` und harte Regel 20, deren `ortText()` die Vorlage ist.
   **Zwei Gründe, warum das Zeichen nicht in die Spalte darf:** `handle` ist `unique`,
   und ein Zeichen, das jeder Wert trägt, unterscheidet nichts — es macht nur `'@ian'`
   und `'ian'` zu zwei Namen. Und zehn getippte `@` sind zehn Gelegenheiten zu driften,
   **still**. `handleText()` ist nachsichtig gegen einen alten Wert mit `@` (kein
   `@@ian`); ob der Wert sauber ist, misst `60_konto.mjs`, und zwar indem es die zwei
   Hälften gegeneinander hält.
100. **Was eine Meldung ist und wie schnell sie beantwortet wird, steht in
   `features/safety/meldung.ts` — und das Werkzeug LIEST sie, statt die Zahl zu
   wiederholen.** *(Ians Entscheidungen 58 und 59, Phase 20.7.)* Dieselbe Bauart wie
   `safety/block.ts` (17), `groups/gruppe.ts` (32), `requests/kollision.ts` (46),
   `posts/standort.ts` (68), `auth/anmeldung.ts` (69), `data/quelle.ts` (76),
   `auth/konto.ts` (78), `data/schreiben.ts` (84) und `social/bild.ts` (88).
   **Der Unterschied zu den neun ist, WER liest:** nicht nur ein Screen, sondern auch
   ein Befehl am Mac (`npm run meldungen`). Beide holen sich `zusageText()` und
   `fristStunden()` aus derselben Datei — sie hat **keine Laufzeit-Importe** und läuft
   deshalb in blankem Node (die Technik aus `40_uebersetzung.sh`). Stünde die 24 zweimal
   da, verspräche `/nutzungsbedingungen` eines Tages etwas anderes, als das Werkzeug
   misst; das ist der Lösch-Screen-Fehler vom 2026-09-06 an einer Stelle, die ein
   Apple-Reviewer liest.
   ⚠️ **Moderiert wird über die db-url, nicht über eine Rolle in der App** (Entscheidung
   58). Auf `reports` gibt es deshalb weiter **kein `update`** — wer eines nachträgt,
   hebt die Entscheidung auf. Und wer `konto_loeschen()` eine ID gibt, damit das
   Werkzeug jemanden ausschließen kann, macht aus ihr genau das, wovor ihr Kommentar in
   0003 warnt; der Wächter in 0009 bricht dann ab.

101. **Auf React Native gibt es kein `globalThis.crypto` — und eine Prüfumgebung, die
   REICHER ist als das Gerät, beweist nichts.** *(Gemessen am 2026-09-13 an Ians
   iPhone.)* `zufallsName()` in `bild.ts` holte den Dateinamen eines Profilbilds
   von dort und warf, wenn es keines gibt — richtig gedacht (harte Regel 88: lieber
   ein Fehler als ein erratbarer Name), nur gibt es auf dem Gerät wirklich keines.
   Drei Quellen, alle nachgesehen: `InitializeCore.js` richtet keines ein,
   `expo-crypto` setzt ein globales **nur auf Web** (`ExpoCrypto.web.js`), und im
   gebauten `main.jsbundle` kamen `getRandomValues` und `randomUUID` **je genau
   einmal** vor — die zwei eigenen Zeilen.
   **Wer Entropie braucht, nimmt `lib/zufall.ts` / `.native.ts`** (Plattform-Endung
   wie `bild-waehlen` und `anmelde-anbieter`, harte Regel 94). `bild.ts` bleibt
   importfrei — das trägt `80_bilder.mjs` und `90_bildwahl.mjs` in blankem Node —,
   und `bildPfad()` **prüft** den Zufall, den es bekommt (32 Hex), statt ihn zu
   glauben: Die Plattform liefert die Entropie, die Regel-Datei sagt, wie sie
   auszusehen hat.
   ⚠️ **Der allgemeine Teil ist wichtiger als der Fall.** `pruef-bilder` lief in
   Node, Node HAT `crypto`, also waren 32 Häkchen grün und für diese Frage wertlos.
   **Ein Prüfstand muss die Umgebung ÄRMER machen können, nicht nur reicher** —
   `90_bildwahl.mjs` nimmt `crypto` seither für die Dauer einer Messung weg,
   dieselbe Technik wie das Erzwingen beider Schalterstellungen in `96_anbieter.sh`.
   Dieselbe Familie wie die Attrappen-Falle vom 2026-09-06 und wie „ein Beleg auf
   der falschen Plattform ist kein Beleg" (19i).
102. **Ein Fehler, der KEIN `SchreibFehler` ist, verschwindet spurlos — und
   `onPress={async …}` ist das Loch, durch das er geht.** *(2026-09-13, der zweite
   Teil desselben Fundes.)* `schreibVorgangIntern` legt einen `SchreibFehler` in die
   Fehlerleiste (Entscheidung 48) und wirft alles andere **absichtlich weiter**,
   damit ein Programmfehler „laut" ist statt als „Keine Verbindung" verkleidet
   (`store.ts`, Zeile 513–516). Die Absicht stimmt. **Nur gibt es in einem
   Release-Build nichts Lautes:** Der Wurf läuft aus dem `await` hinaus, React hat
   das Promise längst weggeworfen, und auf dem Bildschirm passiert gar nichts.
   **Gemessen: 15 Stellen** in der App geben eine `async`-Funktion an eine Prop, die
   `void` erwartet (`checksVoidReturn: true` in `eslint.config.js`, gegengemessen
   96 statt 81 Probleme). Der Wächter dagegen kam am 12.09. ins Projekt — **mit
   `checksVoidReturn: false`**, also mit genau dem Auge zu, das diese Familie sieht.
   **Wer einen Knopf baut, der etwas Asynchrones tut, schreibt `onPress={() => void
   xAsync()}` und fängt in `xAsync` auch das Unerwartete** — mit einem Satz, den ein
   Mensch versteht. Ein Fehler, den nur ein Entwickler-Build zeigt, ist auf einem
   fremden Handy kein Fehler, sondern eine App, die nichts tut.
   ✅ **Alle 15 sind zu (Phase 20.9, 2026-09-13 abends)** — und der Wächter steht
   seither auf `checksVoidReturn: true`, gegengemessen **81 Probleme wie vorher**.
   **Der Wurf selbst ist auch keiner mehr:** `schreibVorgangIntern` und `datenHolen()`
   machen aus einem Programmfehler einen ZUSTAND (Ians Entscheidung 71, harte
   Regel 103). Wer eines von beidem zurückdreht, nimmt vierzehn Screens still die
   Erlaubnis weg, die der Kommentar an `schreibVorgang` ihnen gibt.

103. **Ein PROGRAMMfehler hat einen Ort, und er steht in `lib/programmfehler.ts`.**
   *(Ians Entscheidung 71, Phase 20.9, 2026-09-13.)* Dieselbe Bauart wie `lib/handle.ts`
   und `lib/bezirk.ts` — **importfrei**, weil ZWEI Regel-Dateien sie brauchen
   (`data/schreiben.ts` für die Leiste, `data/quelle.ts` für Kasten und Zeile) und
   `schreiben.ts` in blankem Node läuft. Screens lesen `PROGRAMM_TEXT` nie; sie sehen
   das Ergebnis von `schreibFehlerFolgen()` bzw. `ladeFehlerFolgen()`.
   **Der Unterschied zu den zehn anderen Regel-Dateien ist, WAS sie verhindert:** Bis
   zum 13.09. wurde ein Nicht-`SchreibFehler` weitergeworfen, damit er „laut" ist statt
   als „Keine Verbindung" verkleidet. Die Unterscheidung stimmt — **nur gibt es in einem
   Release-Build nichts Lautes** (harte Regel 102). Jetzt wird er UMGEWANDELT:
   `console.error` bekommt das ganze Objekt samt Stapel, der Mensch bekommt einen Satz.
   Das ist mehr als vorher, nicht weniger.
   ⚠️ **`PROGRAMM_CODE` trägt einen Schrägstrich, und das ist kein Schmuck:** Er landet
   im selben Feld wie ein SQLSTATE und ein PostgREST-Code. `'P0001'` ist ein ECHTER
   SQLSTATE (`raise_exception`), den eine der neun Funktionen eines Tages werfen kann —
   dann bekäme ein Datenbankfehler Ians Satz. Ein SQLSTATE ist fünf alphanumerische
   Zeichen; ein `/` kann darin nicht vorkommen. **Unmöglich, nicht unwahrscheinlich.**
   Wer einen zweiten solchen Code einführt, misst dasselbe nach
   (`npm run pruef-programmfehler`).

104. **In Postgres darf `PUBLIC` jede neue Funktion AUSFÜHREN — ein fehlender
   `grant` ist bei Funktionen KEINE Zusage.** *(Phase 20.7-b, 2026-09-13, gemessen
   an der Wegwerf-Datenbank UND am echten Supabase.)* Alle neun bestehenden
   `public.`-Funktionen stehen auf `anon: true | auth: true`, auch ohne jeden
   `grant`; die `grant execute … to authenticated` in 0004 erteilen etwas, das
   ohnehin da war. **Dieselbe Familie wie harte Regel 85** — dort die Rechteliste
   auf Tabellen, hier die auf Funktionen —, und dieselbe Gegenmaßnahme: erst ein
   ausdrückliches `revoke`, dann gilt die Absicht.
   **Für die neun ist das folgenlos, und der Grund ist harte Regel 70:** Jede
   prüft SELBST, wer sie ruft (`auth.uid()` ist null → Abbruch). Genau deshalb
   steht Regel 70 dort, wo sie steht.
   ⚠️ **Gefährlich wird es bei einer Funktion, die das nicht KANN.**
   `konto_entfernen(wen)` löscht ein fremdes Konto — ihr Zweck ist das fremde
   Konto, eine Selbstprüfung gibt es nicht. Ihre einzige Absicherung ist, wer sie
   ausführen darf. Ohne `revoke all … from public, anon, authenticated` wäre sie
   ein Knopf, mit dem jeder Angemeldete jedes Konto der App löscht — das Gegenteil
   von Ians Entscheidung 58 (*„der stärkste Schlüssel des Projekts liegt auf einem
   Mac, nicht auf einem Handy"*).
   **Gefragt wird `has_function_privilege`, NIE das rohe `proacl`:** Ein leeres
   ACL heißt „Standard", und der Standard ist hier ausgerechnet *offen*. Wer die
   Spalte liest, sieht nichts und schließt daraus das Gegenteil. Gemessen wird an
   drei Stellen — im Wächter von `0010`, als Angriff in `10_angriff.sql`
   (`set local role authenticated`, harte Regel 57) und als Zahl in
   `einspielen.sh` („Moderation dicht", weil ein `grant` von Hand am Server keine
   Migration braucht).
   **Wer eine neue `security definer`-Funktion baut, beantwortet also zuerst:
   *Kann sie selbst prüfen, wer sie ruft?* Wenn nein, ist das `revoke` Pflicht
   und kein Feinschliff.**

105. **`deploy.sh` hat VIER Wächter, und jeder deckt genau eine Frage — wer einen
   anfasst, liest zuerst, was er allein trägt.** *(Phase 20.8, 2026-09-13.)*
   `baseUrl` in `app.json` (die Absicht) · `baseUrl` im gebauten HTML (das
   Ergebnis, weil die Wahrheit seit dem 07.09. in `app.config.js` steht) ·
   `ANMELDE_QUELLE = 'attrappe'` (ausnahmsweise die QUELLE, weil der Minifier die
   Zeichenkette auflöst) · und seit 20.8 **die konkreten Adressen**.
   **Der vierte ist der, den man für überflüssig hält.** Er misst, ob
   `dist/post/p1.html` & Co. wirklich entstanden sind — also den ZWECK der Adresse,
   denn ein Link auf EINEN Post ist dort der Normalfall (harte Regel 5). Der
   Schalter-Wächter deckt das heute nebenbei mit ab und ist deshalb **kein Ersatz**:
   Wer `statisch.ts` löscht oder einem der sechs Screens sein `generateStaticParams`
   nimmt, lässt den Schalter unberührt — der Deploy läuft durch, **ohne eine einzige
   Fehlermeldung**, weil Expo Router dann `post/[id].html` schreibt. Zwei Gründe an
   einem Wächter sind einer zu viel (die 20.4-b-Lehre *„ein Wächter hinter einem
   anderen ist ein ungeprüfter Wächter"*).
   ⚠️ **Und ein Wächter, der ZÄHLT, muss sagen können, was NICHT mitzählt.** Der
   erste Entwurf nahm „alles ohne eckige Klammern" und zählte damit
   `gruppe/neu.html` mit — eine STATISCHE Route, keine erzeugte Adresse. Bei
   `'supabase'` stand dadurch **1** statt 0, und `-eq 0` hätte den Deploy genau in
   dem Zustand durchgelassen, gegen den er gebaut ist. Ausgenommen wird deshalb kein
   NAME (das wäre eine zweite Quelle, die beim nächsten statischen Screen veraltet),
   sondern die EIGENSCHAFT: Zu einer statischen Route gibt es eine gleichnamige
   Quelldatei unter `src/app/`, und der Wächter sieht selbst nach.
   **Die Latte ist Ians Entscheidung 76: je Familie mindestens eine**, also vier
   einzelne Vergleiche und nicht einer auf der Summe. Verworfen ist „genau
   20 / 18 / 4 / 5" — schärfer, aber die Zahlen stünden zweimal da (harte Regel 53),
   **und eine Prüfung, die bei harmlosen Änderungen rot wird, wird beim dritten Mal
   entschärft.** Was sie nicht fängt, steht im Skript daneben: Entsteht von zwanzig
   Posts nur noch einer, läuft der Deploy durch — der Wächter sagt „aus jeder Familie
   kommt etwas an", nicht „es ist vollständig".
   **Gegengemessen gehört jeder dieser vier in BEIDEN Richtungen, und die Latte
   zusätzlich gegen ihre VERWORFENE Fassung** — sonst belegt ein grüner Lauf nur, dass
   sie erlaubt ist, nicht dass sie gilt. Gemessen mit der per `sed` extrahierten ECHTEN
   Funktion aus `deploy.sh` (eine nachgebaute hätte die Nachbildung geprüft), an drei
   Exporten, von denen der dritte eigens gebaut wurde:
   `'attrappe'` 20/18/4/5 durch · `'supabase'` 0/0/0/0 Abbruch · **`'attrappe'` ohne
   Chats 20/18/0/5 — Summe 43, also für eine Summen-Latte unauffällig, für diese hier
   ein Abbruch.**


106. **Ein rundes BILD gibt es nicht — rund ist das FENSTER, und wo das Quadrat
   liegt, steht in `features/social/zuschnitt.ts` und nirgends sonst.**
   *(Phase 20.6-d, 2026-09-13.)*
   Ians Wunsch war *„bitte kreisförmiges Zuschneiden"*, und die naheliegende
   Umsetzung ist die falsche: **JPEG hat keinen Alphakanal.** Ein rundes Bild
   müsste ein PNG mit Maske sein — größer, und `BILD_TYPEN` bekäme einen dritten
   Fall, den ab dann jede Prüfung mitschleppt. Gespeichert wird deshalb weiter ein
   QUADRAT; rund ist, wodurch man beim Aussuchen schaut, und rund zeichnet später
   `SsAvatar` (`borderRadius: radius.pill` plus `overflow: hidden`, seit Phase 14).
   **Der Kreis kommt in keiner einzigen Formel vor** — er ist dem Quadrat
   einbeschrieben, und die ganze Rechnung handelt vom Quadrat.
   Dieselbe Bauart wie `safety/block.ts` (17), `groups/gruppe.ts` (32),
   `requests/kollision.ts` (46), `posts/standort.ts` (68), `data/quelle.ts` (76),
   `auth/konto.ts` (78), `data/schreiben.ts` (84) und `social/bild.ts` (88): Der
   Screen hält einen `ZuschnittSicht` und fragt bei jeder Frage die Regel-Datei.
   **Der Zustand steht in ORIGINAL-PIXELN, nicht in Bildschirmpunkten**, und das
   ist die Entscheidung, an der alles andere hängt. Verworfen war „das Bild ist um
   (vx, vy) Punkte verschoben und um z vergrößert" — aus zwei Gründen: (a)
   `expo-image-manipulator` will `{ originX, originY, width, height }` in Pixeln,
   jede Frage bräuchte also eine Umrechnung, und jede Umrechnung ist eine Stelle
   zum Danebengreifen; (b) ein Zustand in Punkten hinge an der Fenstergröße —
   dreht jemand das Handy, wäre der gewählte Ausschnitt ein anderer.
   ⚠️ **Geklemmt wird, nicht interpoliert, und das ist eine Absicherung.** Bei
   einem Hochkant-Foto (3024 × 4032) ist der waagrechte Spielraum bei Zoom 1
   **exakt null** — also bei jedem zweiten Handyfoto, nicht am Rand. Genau diese
   Null hat in diesem Projekt schon einen Abend gekostet: Eine
   `Animated`-Interpolation über eine Spanne der Breite null liefert in React
   Native den EXTREMWERT statt der Mitte (FALLEN.md). `min(max(x, a), b)` mit
   `a === b` gibt `a` — das Quadrat kann waagrecht nicht wandern, weil es nirgends
   hin kann, und genau das steht da.
   **`klemm()` fängt zusätzlich `NaN` ab**, denn `Math.min(Math.max(NaN, a), b)`
   ist `NaN` — und ein `NaN` als `originX` ginge durch jeden Typ und käme erst am
   nativen Baustein als unverständlicher Fehler an. Die Werte kommen aus einer
   Fingergeste, und die kennt keine Grenzen.
   **Die ANZEIGE kommt aus demselben Rechteck wie der Schnitt.**
   `BildZuschneiden.tsx` rechnet nicht aus `sicht` nach, sondern positioniert das
   Bild aus `zuschnittRechteck()` — also aus der Zahl, die gleich bei `crop`
   ankommt, gerundet und geklemmt und alles. Es gibt keine zweite Rechnung, die
   davon abweichen könnte: **Was im Kreis steht, IST der Ausschnitt.**
   **Wer die Regel anfasst, lässt `npm run pruef-zuschnitt` laufen** — 47 Häkchen,
   darunter 4000 Zufallsproben gegen den Bildrand, und zwei Gegenproben, die je
   einen umgedrehten Griff als rot nachweisen (das Vorzeichen beim Schieben, und
   `zuschnittZielKante()`, die aussieht wie eine unnötige Verkomplizierung).

107. **Was die App an Daten sammelt, steht in `_FUER_IAN/DATENSCHUTZ_ETIKETT.md` —
   und der CODE sagt, was drinstehen muss, nicht umgekehrt.**
   *(Phase 21.3, 2026-09-14.)*
   Apples Datenschutz-Etikett ist **eine Liste von Feldnamen**, und damit trägt es
   wörtlich die Falle *„Eine Prüfung, die NAMEN aufzählt, merkt nicht, wenn etwas
   dazukommt."* Ein Dokument, das einmal stimmte, bleibt stehen und wird still
   falsch, sobald eine Migration eine Spalte hinzufügt. **Bei Apple ist genau das
   der teure Fall** — nicht, weil die Strafe hoch wäre, sondern weil ein Reviewer
   den Netzwerkverkehr mitlesen kann und eine Lücke zwischen Etikett und Wirklichkeit
   wie Absicht aussieht, nicht wie Vergesslichkeit.
   **Deshalb ist die Leserichtung umgedreht.** `npm run pruef-etikett`
   (`supabase/pruefen/99_etikett.py`) liest die **Spaltennamen aus allen Migrationen**
   und fragt, ob jeder im Etikett vorkommt — oder in der Liste `TECHNIK` steht, die
   genau eine Aussage trifft: *„Das ist keine Angabe über einen Menschen."* Wer dort
   etwas einträgt, trifft diese Aussage ausdrücklich und mit Begründung daneben,
   statt eine Spalte stillschweigend zu übergehen.
   ⚠️ **Er prüft ERWÄHNUNG, nicht EINORDNUNG.** Ob `profiles.district` unter
   „Grober Standort" oder unter „Sonstige Daten" gehört, ist ein Urteil (Ians
   Entscheidung 78) und keine Messung. Der Wächter kann sagen, dass die Spalte
   vorkommt; er kann nicht sagen, dass sie richtig einsortiert ist.
   **Die schärfste Zusage des Etiketts hat einen eigenen Haken:** *Der Standort
   verlässt das Gerät nie* (harte Regel 47). Sie hängt daran, dass `data/senden.ts`
   — der einzige Weg nach draußen — Koordinaten gar nicht kennt. Genau das wird
   geprüft, **mit der Gegenprobe daneben**: Dieselben Wörter müssen in
   `lib/karte-geo.ts` vorkommen, sonst belegt eine Textsuche mit null Treffern nur,
   dass man sie falsch geschrieben hat (FALLEN.md).
   **Gebaut wurde auch die Gegenprobe des Ganzen:** Eine eingeschmuggelte Spalte
   `profiles.telefon` macht den Wächter rot und nennt sie beim Namen — danach
   zurückgesetzt und `diff`-gleich. Ein Wächter, den man nur in der grünen Stellung
   gesehen hat, ist nicht geprüft.

108. **Der Passwort-Weg gehört EINEM Konto — und der Riegel steht in
   `demoAnmelden()`, nie im Bildschirm.**
   *(Phase 21.5 Punkt 1, 2026-09-14.)*
   Seit dem Demo-Zugang gibt es in dieser App einen vierten Weg hinein, und er ist
   der einzige mit Passwort. Die Versuchung ist, ihn dort abzusichern, wo man ihn
   sieht: Das Passwortfeld erscheint in `Anmelden.tsx` nur, wenn `istDemoZugang()`
   zutrifft — fertig. **Das ist keine Absicherung, sondern eine Anzeige.** Wer den
   Bildschirm umbaut, das Feld versehentlich immer zeigt oder eine zweite Stelle
   ergänzt, hat damit still einen Passwort-Weg für ALLE Konten aufgemacht, und
   weder `tsc` noch ein Lint meldet dazu ein Wort. Dieselbe Unterscheidung wie bei
   den Policies (Regel 70) und bei „wird nicht angeboten ist keine Regel"
   (`posts_schreiben`): Was verboten ist, macht GENAU EINE Funktion.
   `demoAnmelden()` fragt deshalb selbst nach und wirft **vor** dem Netz — ein
   versehentlicher Versuch auf ein fremdes Konto erreicht GoTrue gar nicht erst
   und treibt auch keinen Rate-Limit-Zähler hoch.
   **Und es ist bewusst KEIN `KontoFehler`, sondern ein nackter `Error`.** Ein
   `KontoFehler` trägt einen Code und landet als freundlicher Satz auf dem
   Bildschirm; diesen Zustand soll niemand je lesen. Er bedeutet, dass die App
   gerade etwas versucht, das sie nicht darf — also ein PROGRAMMfehler im Sinn von
   Regel 103.
   **Was den Weg für alle anderen Konten nutzlos macht, ist nicht diese Funktion.**
   Am Server ist `grant_type=password` offen — gemessen am 2026-09-14: Er antwortet
   `invalid_credentials`, nicht `email_provider_disabled`. Nutzlos ist er, weil
   jedes andere Konto ein leeres `auth.users.encrypted_password` hat: Wer per Code
   oder über Apple/Google hereinkam, hat nie eines gesetzt, und bcrypt vergleicht
   gegen nichts. Die Funktion macht den Weg also nicht auf — sie benutzt einen, der
   offen ist, für das einzige Konto, das ein Passwort besitzt. **`92_demo.sql`
   zählt deshalb nach, dass kein zweites Konto einen Hash hat.**
   **Gegenprobe gebaut:** Der Riegel testweise ausgebaut (`if (false && …)`) →
   `npm run pruef-demoregel` wird mit **vier** Kreuzen rot und nennt jede
   abgewiesene Adresse beim Namen; danach zurückgesetzt und `diff`-gleich. Die
   Attrappe darin ist ausnahmsweise erlaubt, weil sie der ZEUGE ist und nicht der
   Prüfling: Sie wird als Argument übergeben, ersetzt kein Modul, und ihre einzige
   Aufgabe ist es, gerufen zu werden — oder eben nicht.

109. **Eine Demo-Welt in der ECHTEN Datenbank ist `followers`, nie `public` — und
   die Adresse des Demo-Kontos endet auf `.invalid`.**
   *(Phase 21.5 Punkt 1, 2026-09-14.)*
   ⚠️ **Zur Zuschreibung, damit sie nicht auseinanderläuft:** Ians Entscheidung 79
   ist, DASS es einen Passwort-Zugang gibt und dass der Reviewer eine bespielte Welt
   sieht statt eines leeren Feeds (vier Möglichkeiten lagen ihm vor). Die beiden
   Punkte hier — `followers` statt `public` und `.invalid` statt `simplysocial.at` —
   sind Herleitungen daraus und **keine** Entscheidungen von ihm. Eine neue
   Entscheidung überschreibt nie still eine alte Regel-Datei (Regel 58); eine
   Herleitung darf sich nicht als Entscheidung ausgeben.
   Zwei Zusagen, die beide still brechen können, und die zweite ist die, die man
   beim Hinschreiben nicht sieht.
   **Erstens die Sichtbarkeit.** Der naheliegende Griff für Demo-Posts ist
   `visibility_kind = 'public'`, und er ist falsch: `posts_lesen` lässt einen
   öffentlichen Post für **jeden Angemeldeten** durch. Die erfundenen Menschen
   stünden damit im Feed von Ian, von Christoph, Leopold und Daria — und später von
   jedem, der die App lädt. Das ist harte Regel 12 eine Ebene gefährlicher: nicht in
   `mock.ts`, sondern in derselben Datenbank, in der die echten Verabredungen
   liegen. Alle Demo-Posts sind deshalb `followers`, und die fünf Demo-Menschen
   folgen einander gegenseitig. Damit trägt dieselbe Policy die Zusage, die auch
   sonst über Follower-Posts entscheidet — es ist keine Einstellung, die jemand
   vergessen kann. **Geprüft wird sie durch einen ANGRIFF** (Regel 57): Ein
   fremdes Konto setzt sich in `authenticated` und versucht zu lesen. Zwei
   Gegenproben stehen daneben — ein Post auf `public` gestellt, und das fremde
   Konto folgt einem Demo-Menschen; beide machen den Lauf rot. **Die zweite ist die
   schärfere: An den Posts ist dann nichts falsch, falsch ist die BEZIEHUNG — und
   genau davon hängt die Zusage ab.**
   **Zweitens die Adresse.** `demo@simplysocial.at` war der erste Griff und ist
   ein Loch: Die Domain gehört uns nicht (OFFENE_SACHEN 5b). Wem sie gehört, dem
   gehört ihr Postfach — und wer das Postfach hat, tippt die Demo-Adresse in den
   ganz normalen E-Mail-Weg, bekommt den Code zugestellt und ist als Demo-Konto
   drin. **Das Passwort schützt davor nichts: Es ist ein ZWEITER Weg zum selben
   Konto, kein Riegel vor dem ersten.** `.invalid` ist nach RFC 2606 reserviert und
   kann von niemandem je registriert werden; der E-Mail-Weg ist für dieses Konto
   damit nicht unwahrscheinlich, sondern **strukturell tot**. Dieselbe Endung
   benutzt `51_konten.sql` seit Phase 20.4-b, und aus demselben Grund.
   **Der Preis ist benannt:** Die Adresse sieht für einen Menschen nach einem
   Tippfehler aus. Deshalb steht in `_FUER_IAN/DEMO_ZUGANG.md` ein Satz dafür, den
   Ian mit ins Review-Feld kopiert.

110. **Was Apple über das ALTER fragt, steht in `_FUER_IAN/ALTERSFREIGABE.md` — und
   die NEIN-Antworten sind die gefährlichen.**
   *(Phase 21.1, 2026-09-14.)*
   Apples Altersfragebogen hat **28 Felder** — nachgesehen an der echten
   Schnittstelle (`GET /v1/appInfos/<id>/ageRatingDeclaration`), nicht an einem
   Blogeintrag. **Beim ersten Blick stand jedes einzelne auf `null`**, der Bogen war
   also unbeantwortet, und ohne ihn lässt sich nicht einreichen.
   **Die JA-Antworten sind ungefährlich:** „Es gibt einen Chat" bleibt wahr, solange
   es die App gibt. **Gefährlich sind die NEIN-Antworten** — sie sind Zusagen über
   etwas, das NICHT da ist, und so etwas wird still falsch, sobald jemand ein Paket
   nachinstalliert oder eine Zeile schreibt. Genau drei hängen an nachprüfbaren
   Tatsachen und werden deshalb bewacht (`npm run pruef-alter`,
   `supabase/pruefen/94_altersfreigabe.py`, **16 Häkchen**): *uneingeschränkter
   Webzugriff* (kein `openURL`/`Linking`/`WebBrowser` im Quellcode), *Werbung* (kein
   Werbe- oder Analysepaket) und *Altersprüfung* (Apples Declared-Age-Range-API wird
   nicht benutzt, der Jahrgang wird eingetippt). Dieselbe umgedrehte Leserichtung wie
   Regel 107: Nicht das Dokument sagt, was die App tut — der Code sagt, was im
   Dokument stehen muss.
   **Das Ergebnis ist 13+, und es ist keine Wahl.** Apple definiert Social Media als
   *„nutzergenerierte Inhalte über einen Feed oder ähnliche Entdeckungsmethoden
   verbreiten, verstärken oder mit ihnen interagieren"* — das IST der Feed plus
   `follows`. Die Ausnahme („altersbeschränkte Social-Media-Funktionen", die eine
   niedrigere Einstufung erlaubte) verlangt DREI Dinge: die Declared-Age-Range-API,
   eine Unter-13-Sperre und „nur altersgerechte Inhalte". Keines ist gebaut, und die
   API ist in Österreich nicht verpflichtend.
   ⚠️ **Was der Wächter NICHT kann, und es ist wichtig:** Er beantwortet keine
   URTEILSFRAGE (zählt „Bier trinken gehen" als Alkoholbezug? ist Sport ein
   Wellness-Thema?) und er weiß nicht, was in App Store Connect **eingetragen wurde**
   — er bewacht das Dokument, nicht das Formular. **Und Apples 13+ ist eine
   Store-Einstufung, kein Rechtsurteil:** Ab welchem Alter Menschen in dieser App sein
   sollen, beantwortet der Rechtstext (21.2) und ein Erwachsener.
   **Gegenprobe gebaut, und sie hat den Wächter selbst korrigiert** — siehe FALLEN.md,
   „Eine Namensliste in einem Wächter kann nicht vollständig sein".

111. **Was eine Zustimmung ist und welcher FASSUNG jemand zugestimmt hat, steht in
   `features/auth/zustimmung.ts` — und der Riegel sitzt in `profilAnlegen()`, nie im
   Bildschirm.** *(Phase 21.2, 2026-09-14, Ians Entscheidung 80)*
   Dieselbe Bauart wie `block.ts` (17), `gruppe.ts` (32), `kollision.ts` (46),
   `standort.ts` (68), `konto.ts` (78), `meldung.ts` (100) und `demo.ts` (108). Die
   Datei ist **importfrei** und damit in blankem Node prüfbar
   (`npm run pruef-zustimmung`, **28 Häkchen**, braucht nichts).
   **Zwei Hälften, beide Ians Entscheidung:** Das Häkchen steht beim **ersten Konto**
   (nicht auf dem Anmelde-Bildschirm — eine Zustimmung ist einmalig, und ein
   Bildschirm, der sie bei jeder Anmeldung einholt, behauptet das Gegenteil; und
   nicht auf einem eigenen Bildschirm davor — harte Regel 63). Festgehalten wird
   **Zeitpunkt UND Fassung** (`terms_accepted_at`, `terms_version` in `0011`), weil
   der Rechtstext noch gar nicht existiert: Ohne Fassung ließe sich später nie
   unterscheiden, ob jemand dem Platzhalter oder dem echten Text zugestimmt hat, und
   **nachtragen lässt sich das nie**.
   **Der Riegel gehört nach unten.** `profilAnlegen()` wirft ohne Zustimmung, und
   zwar VOR dem Netz — derselbe Grund wie bei `demoAnmelden()` (Regel 108): Ein
   Bildschirm prüft auch, aber ein Bildschirm ist nicht die Stelle, an der eine
   Zusage GILT. Wer je einen zweiten Weg zum Konto baut — ein Skript, einen
   Prüfstand, einen Einladungslink —, kommt hier vorbei und nicht dort. Belegt mit
   einer Attrappe als ZEUGEN: Wird sie angefasst, ist der Riegel gebrochen.
   **Beide Spalten sind `null`-fähig, und das ist die Aussage.** Ein `default` für
   die Zeilen, die es schon gab, wäre eine Behauptung über Menschen, die nie gefragt
   wurden — ununterscheidbar von einer echten Zustimmung. `null` sagt die Wahrheit:
   nie zugestimmt, weil es nichts zum Zustimmen gab. Der CHECK prüft die zwei
   Spalten GEGENEINANDER (Regel 98), damit kein Zeitpunkt ohne Fassung entstehen kann.
   ⚠️ **Was hier hinnehmbar ist und anderswo nicht:** Der Zeitstempel kommt vom
   GERÄT. Ein Mensch könnte seine eigene Zustimmung zurückdatieren — er fälschte sie
   zu seinen eigenen Ungunsten, und der Beleg ist die ZEILE, nicht ihre
   Unfälschbarkeit. Wo die Uhr wirklich zählt (`created_at`), steht `default now()`.
   ⚠️ **Der TEXT ist weiterhin offen** (`OFFENE_SACHEN.md` Punkt 1). Gefäß und Inhalt
   sind trennbar, weil die Fassung eine Zeichenkette ist: Sobald Ian den Text hat,
   ändert sich genau eine Konstante. **Was dann passiert, ist noch nicht entschieden**
   — PLAN.md Abschnitt 6, Punkt 67, `TODO(Ian)` in `brauchtNeueZustimmung()`.
