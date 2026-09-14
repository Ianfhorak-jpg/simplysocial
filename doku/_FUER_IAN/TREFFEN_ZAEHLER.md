# Der Treffen-Zähler — eine Sache, die nur du machen kannst

**Stand: 2026-09-14** · Phase 20.12, deine Entscheidung 83

---

## Worum es geht

Auf jedem Profil steht künftig neben **Follower** und **Folgt** eine dritte Zahl:
**Treffen**. Sie zählt die bestätigten Verabredungen — bei dir und bei allen anderen.

Der Code dafür ist fertig und auf deinem iPhone. **Die Datenbank weiß noch nichts
davon**, und genau das ist der eine Schritt, den nur du machen kannst: An deine echte
Supabase komme ich nicht heran.

---

## ⚠️ Solange du das nicht machst

**Die App geht trotzdem.** Sie zeigt dann überall **0 Treffen** — kein Absturz, keine
Fehlermeldung, nur eine Null, wo eine Zahl stehen sollte. Du kannst dir also erst in
Ruhe ansehen, ob dir die Zahl im Profil überhaupt gefällt, und das hier danach machen.

---

## Der Befehl

```bash
cd ~/Desktop/C.C.Projekts_Ian/33_SimplySocial/simplysocial
npm run einspielen 0012_treffen_zaehler.sql
```

Das war's. Ein Befehl, eine Migration, danach misst das Skript selbst nach.

**Was dabei passiert:**

1. Eine neue Spalte `treffen_anzahl` kommt an die Profile — bei allen erstmal 0.
2. Ein **Trigger** wird eingebaut, der ab sofort automatisch mitzählt: Wird eine
   Anfrage bestätigt, bekommen beide Seiten +1. Wird sie zurückgenommen, −1.
3. **Was vorher schon passiert ist, wird nachgerechnet.** Wer bisher schon Leute
   getroffen hat, startet nicht bei null — die Migration zählt die bestehenden
   Bestätigungen einmalig zusammen.

---

## Was der Zähler zählt — und was nicht

| | |
|---|---|
| ✅ Du fragst an, jemand bestätigt | **+1 für dich, +1 für die andere Person** |
| ✅ Dein Post, du bestätigst jemanden | **+1 für beide** |
| ➖ Dein Post, du bestätigst noch jemanden | **nur der neue Gast bekommt +1** |
| ❌ Zurückgenommen oder abgesagt | **−1, die Zahl geht wieder runter** |

**Warum der dritte Fall so ist:** Ein Post mit drei Plätzen ist *ein* Termin, nicht
drei. Wer einmal Tennis spielt und drei Leute mitnimmt, war bei einem Treffen. Ohne
diese Regel würde der Zähler belohnen, dass man große Runden anlegt — nicht, dass man
sich trifft.

**Warum das Runterzählen wichtig ist:** Sonst wäre die Zahl farmbar. Ein Kumpel legt
Posts an, bestätigt dich zehnmal, du nimmst jedes Mal zurück — und du stehst bei zehn
Treffen. Der Trigger merkt das, weil er auch beim Löschen anspringt. Ich habe genau
diesen Angriff als Prüfung gebaut (`npm run pruef-treffen`, 22 Häkchen).

⚠️ **Was die App nicht weiß: ob ihr euch wirklich getroffen habt.** Es gibt kein
„war da"-Häkchen. Gezählt wird die Zusage. Wenn du das anders willst, ist das eine
eigene Entscheidung — sag Bescheid.

---

## Warum es überhaupt eine Datenbank-Änderung braucht

Das ist die interessante Stelle, und sie ist eure eigene Sicherheitsregel:

Die App darf **fremde Anfragen gar nicht sehen**. In `0002_policies.sql` steht, dass
jeder nur seine eigenen Anfragen sieht und die an seine eigenen Posts — mit der
Begründung, dass man sonst ausrechnen könnte, wo eine Person überall hingeht, auch
aus privaten Gruppen. Dort steht wörtlich: *„sie ist nicht 'nicht eingebaut', sie ist
UNMÖGLICH."*

Deshalb kann die App die Zahl für ein fremdes Profil nicht selbst ausrechnen. Eine
**fertige Zahl** verrät dagegen nichts — nicht mit wem, nicht wann, nicht wo. Die
Spalte ist also nicht der bequemere Weg, sondern der einzige, der eure Zusage nicht
bricht.

---

## Wenn etwas schiefgeht

Das Skript läuft in **einer** Transaktion: Entweder geht alles durch oder gar nichts.
Ein halb eingespielter Zustand kann nicht entstehen.

Sollte es abbrechen, schick mir einfach die Meldung — dann schaue ich nach. Nichts
davon ist kaputt zu machen: Die Spalte kann man auch wieder entfernen.
