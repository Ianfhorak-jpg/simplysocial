# Die Texte für den App Store

Diese Datei IST der Store-Eintrag. `npm run asc texte -- --wirklich` schickt sie zu
Apple; wer hier etwas ändert, ändert, was im App Store steht.

> **Warum eine Datei und keine Tabelle im Skript:** Der Text ist Ians, nicht der des
> Programms. Er muss ihn lesen, ändern und vorlesen können, ohne Python anzufassen —
> dasselbe Muster wie `pruefnotizen.md`.

**Jede Überschrift `## feld` ist ein Feld bei Apple.** Was darunter steht, bis zur
nächsten Überschrift, ist sein Inhalt. Kommentare (`<!-- … -->`) fliegen raus, die
Längen prüft das Skript vor dem Senden.

⚠️ **Der Ton kommt aus `34_SimplySocial_Marketing/strategie/03_positionierung.md`.**
Dort steht auch die Verbotsliste, und sie gilt hier genauso: **kein** Dating, **kein**
„Fremde treffen", **keine** Einsamkeit, **keine** Startup-Sprache. Wer einen dieser
Begriffe hier hineinschreibt, verkauft eine andere App.

---

## subtitle
<!-- Max. 30 Zeichen. Steht unter dem Namen und ist das Zweite, was jemand liest.
     Der Positionierungssatz „Du willst was machen. Du brauchst wen dafür." passt
     nicht hinein — er steht deshalb als erste Zeile der Beschreibung. -->
Finde Leute für heute — Wien

## keywords
<!-- Max. 100 Zeichen, mit Komma getrennt, KEIN Leerzeichen nach dem Komma (das
     zählt mit und ist verschenkter Platz). Der App-Name und die Kategorie gehören
     NICHT hinein — Apple durchsucht sie ohnehin.
     „Dating" fehlt mit Absicht: Es brächte Sucher, die etwas anderes wollen, und
     genau die Verknüpfung will die Positionierung nicht. -->
wien,treffen,spontan,aktivität,sport,tennis,bouldern,kaffee,lernen,leute,gemeinsam,hobby

## promotionalText
<!-- Max. 170 Zeichen. Der einzige Text, der sich OHNE neue Version ändern lässt —
     deshalb gehört hier das hinein, was sich ändern kann, nicht das Grundsätzliche. -->
Neu in Wien. Poste, was du heute vorhast, und finde jemanden, der mitmacht. Kein Dating, keine Werbung, gratis.

## description
<!-- Max. 4000 Zeichen. Die ersten zwei Zeilen sind das, was ohne „mehr" sichtbar
     ist — dort steht der Positionierungssatz, nicht eine Funktionsliste. -->
Du willst was machen. Du brauchst wen dafür.

Jeder kennt den Nachmittag, an dem im Gruppenchat alle „ja mal schauen" schreiben und dann macht keiner was. SimplySocial ist dagegen gebaut.

SO GEHT ES

1. Poste, was du vorhast. „Tennis, 1220, heute 17:00." Ein Satz reicht.
2. Wer mitmachen will, meldet sich. Du siehst, wer es ist, bevor du zusagst.
3. Du entscheidest, wer dabei ist. Erst dann geht der Chat auf.

Kein Aushandeln über fünf Ecken, kein Vorlauf von zwei Wochen. Was heute stattfindet, steht heute drin.

WAS DU HIER FINDEST

Tennis und Bouldern. Lernen vor der Schularbeit. Kaffee am Yppenplatz. Skaten im Prater. Kino, wenn sonst niemand Zeit hat. Laufen an der Donauinsel. Die Aktivität ist der Anlass — niemand muss sich ein Gespräch ausdenken.

AUCH MIT DEINEN LEUTEN

Du kannst Leuten folgen wie anderswo auch. Bei jedem Post entscheidest du: für alle oder nur für Follower. Wer nur mit Leuten losziehen will, die er schon kennt, kann das — man muss nicht bei Fremden anfangen.

WAS ES NICHT IST

Keine Dating-App. Es geht nicht darum, jemanden kennenzulernen, sondern darum, etwas zu machen. Wer die App zum Anbaggern benutzt, wird gemeldet und fliegt raus.

Keine Werbung. Keine Analyse. Nichts kostet etwas, und es gibt nichts zu kaufen.

FÜR WIEN GEBAUT

Du gibst deinen Bezirk an — 1070, 1220, was auch immer. Die App zeigt dir zuerst, was in der Nähe stattfindet. Deinen Standort fragt sie nie ab.

WER DAHINTERSTECKT

Vier Leute aus Wien, die dasselbe Problem hatten und keine App fanden, die es löst. Wenn dir etwas fehlt oder etwas kaputt ist: ian.fhorak@gmail.com — da antwortet ein Mensch.

## supportUrl
https://ianfhorak-jpg.github.io/simplysocial-landing/hilfe.html

## privacyPolicyUrl
https://ianfhorak-jpg.github.io/simplysocial-landing/datenschutz.html

## copyright
<!-- Max. 200 Zeichen. Apple will hier den RECHTLICHEN BETREIBER, nicht den Autor
     des Codes — es ist die Zeile, die im Store unter „Copyright" steht.
     Gemessen am 2026-09-28: Das Apple-Programm läuft auf Ian Faye Horak selbst
     (`ACCOUNT_HOLDER`), nicht auf einen Elternteil. Ians Entscheidung am selben
     Tag: Er steht auch auf der Datenschutzerklärung.
     ⚠️ Ändert sich das Apple-Konto, ändert sich DIESE Zeile mit — sonst sagen
     Vertrag und Store-Eintrag Verschiedenes, und das fällt bei einer Prüfung auf. -->
2026 Ian Faye Horak
