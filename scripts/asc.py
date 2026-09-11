#!/usr/bin/env python3
"""
App Store Connect fragen — Buildstatus, TestFlight, Tester.  Aufruf:  npm run asc

── Warum es dieses Skript gibt ──────────────────────────────────────────────
Nach einem Upload steht in App Store Connect minutenlang "Wird verarbeitet",
und ob es durchging, sieht man erst danach. Ohne dieses Skript hiesse das: Ian
klickt sich durch die Weboberfläche und sagt mir, was dort steht. Mit ihm kann
ich selbst nachsehen — dieselbe API, die auch den Upload gemacht hat.

── Wo die Zugangsdaten liegen ───────────────────────────────────────────────
NICHT im Projekt. Der private Schlüssel liegt in
~/.appstoreconnect/private_keys/AuthKey_<KEYID>.p8 (Rechte 600), die Issuer-ID
daneben in ~/.appstoreconnect/issuer_id. Beides ausserhalb des Repos, damit es
nicht versehentlich auf GitHub landet (harte Regel 12 in ihrer schärfsten Form:
Der Prototyp ist öffentlich abrufbar).

Das Token ist absichtlich nur 15 Minuten gültig — Apple erlaubt bis 20, und ein
Token, das länger lebt als der Aufruf, ist ein Schlüssel ohne Schloss.
"""
import sys, json, time, glob, os, urllib.request
import jwt

BASIS = os.path.expanduser('~/.appstoreconnect')
BUNDLE = 'at.simplysocial.app'

# ── Ians Entscheidung: welche Rolle bekommen Christoph, Leopold und Daria? ──────
# Er hat am 2026-09-11 "intern" gewählt: Sie werden Benutzer SEINES Kontos und haben
# die App sofort, ohne Apples Beta-Prüfung. Der Preis steht in derselben Zeile — sie
# sehen das Konto, und zwar in der Rolle, die hier steht.
#
# Apple lässt als interne Tester NUR diese fünf zu (nachgelesen, nicht geraten:
# developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers):
#   ACCOUNT_HOLDER · ADMIN · APP_MANAGER · DEVELOPER · MARKETING
# READ_ONLY und CUSTOMER_SUPPORT scheiden aus — mit ihnen lässt sich niemand als
# interner Tester eintragen, egal wie harmlos sie klingen.
#
# Verworfen und warum:
#   'DEVELOPER'   — der naheliegende Griff und der gefährlichste: Diese Rolle darf
#                   Zertifikate und Provisioning-Profile verwalten. Genau daran hing
#                   am 2026-09-11 ein 20-Minuten-Build. Drei Leute ohne
#                   Coding-Erfahrung brauchen das nie, können es aber kaputtmachen.
#   'APP_MANAGER' — darf die App einreichen, Preise und Verfügbarkeit ändern.
#   'ADMIN'       — darf Benutzer einladen und entfernen, also auch Ian.
#
# 'MARKETING' ist die kleinste Rolle, mit der Apple internes Testen überhaupt
# erlaubt. Sie sieht App-Daten und Marketing-Material, aber keine Schlüssel.
TESTER_ROLLE = 'MARKETING'

# Die interne Gruppe steht seit dem 2026-09-11 und hat `hasAccessToAllBuilds` — jeder
# künftige Upload landet von selbst darin. Sie heisst so, wie die vier sich nennen.
TESTER_GRUPPE = 'Gründer'

def zugang():
    p8 = glob.glob(f'{BASIS}/private_keys/AuthKey_*.p8')
    if not p8:
        sys.exit(f'✗ Kein Schlüssel in {BASIS}/private_keys/')
    key_id = os.path.basename(p8[0]).replace('AuthKey_', '').replace('.p8', '')
    with open(f'{BASIS}/issuer_id') as f:
        issuer = f.read().strip()
    with open(p8[0]) as f:
        geheim = f.read()
    token = jwt.encode(
        {'iss': issuer, 'exp': int(time.time()) + 900, 'aud': 'appstoreconnect-v1'},
        geheim, algorithm='ES256', headers={'kid': key_id, 'typ': 'JWT'})
    return token

def hole(pfad, token):
    req = urllib.request.Request('https://api.appstoreconnect.apple.com/v1/' + pfad,
                                 headers={'Authorization': f'Bearer {token}'})
    with urllib.request.urlopen(req) as r:
        return json.load(r)

def schicke(pfad, token, koerper):
    """Ein POST an die API. Getrennt von `hole`, weil der Unterschied hier keiner
    von Buchstaben ist: Was durch diese Funktion geht, ist nach aussen wirksam und
    nicht zurückzunehmen — eine Einladung verschickt in dem Moment eine E-Mail an
    einen echten Menschen."""
    req = urllib.request.Request(
        'https://api.appstoreconnect.apple.com/v1/' + pfad,
        data=json.dumps(koerper).encode(),
        headers={'Authorization': f'Bearer {token}',
                 'Content-Type': 'application/json'},
        method='POST')
    try:
        with urllib.request.urlopen(req) as r:
            roh = r.read()
            return json.loads(roh) if roh else {}
    except urllib.error.HTTPError as e:
        # Apples Fehler stehen im Körper, nicht im Statustext. Ohne sie zu lesen
        # bleibt "HTTP Error 409: Conflict" übrig — und das war am 2026-09-11
        # schon einmal drei Anläufe wert.
        sys.exit(f'✗ Apple sagt nein ({e.code}):\n{e.read().decode()}')

def tester_einladen(t, app_id, leute, wirklich):
    """Christoph, Leopold und Daria als INTERNE Tester eintragen.

    Es sind zwei Schritte, und das ist keine Umständlichkeit, sondern Apples Modell:
      1. Die Person wird Benutzer des Kontos (`userInvitations`) — sie bekommt eine
         Einladung per Mail und muss sie annehmen.
      2. Erst danach lässt sie sich der internen Gruppe zuordnen.
    Schritt 2 geht deshalb heute NICHT — solange die Einladung offen ist, gibt es
    noch keinen Benutzer, dem man eine Gruppe geben könnte. Das Skript sagt das
    hin, statt es als Fehler zu melden.

    ⚠️ Die Lehre vom 2026-09-11 gilt hier doppelt: Apple verschickt die Einladung im
    Moment des Anlegens und NUR dann. Es gibt keinen "nochmal senden"-Aufruf für
    interne Tester. Ein Skript, das das versehentlich tut, kostet echte Mails an
    echte Menschen — deshalb passiert ohne `--wirklich` gar nichts.
    """
    schon = {u['attributes']['username'].lower()
             for u in hole('users?limit=100', t)['data']}
    offen = {i['attributes']['email'].lower()
             for i in hole('userInvitations?limit=100', t)['data']}

    print(f"Rolle: {TESTER_ROLLE}  ·  Gruppe: {TESTER_GRUPPE}  ·  App: {app_id}")
    print()
    zu_tun = []
    for vor, nach, mail in leute:
        if mail.lower() in schon:
            print(f"  ○ {mail} ist schon Benutzer — übersprungen")
        elif mail.lower() in offen:
            print(f"  ○ {mail} hat eine offene Einladung — übersprungen")
        else:
            print(f"  → {vor} {nach} <{mail}>  wird eingeladen")
            zu_tun.append((vor, nach, mail))

    if not zu_tun:
        print("\nNichts zu tun.")
        return
    if not wirklich:
        print(f"\nDas war die Vorschau. {len(zu_tun)} Einladung(en) gehen erst mit"
              f" --wirklich raus.\nEine verschickte Einladung lässt sich nicht"
              f" zurücknehmen, nur widerrufen.")
        return

    for vor, nach, mail in zu_tun:
        schicke('userInvitations', t, {'data': {
            'type': 'userInvitations',
            'attributes': {'email': mail, 'firstName': vor, 'lastName': nach,
                           'roles': [TESTER_ROLLE], 'allAppsVisible': False,
                           'provisioningAllowed': False},
            'relationships': {'visibleApps': {
                'data': [{'type': 'apps', 'id': app_id}]}}}})
        print(f"  ✓ Einladung an {mail} ist raus")

    # Nachmessen statt "fertig" melden — dieselbe Regel wie beim Gerätebuild.
    danach = {i['attributes']['email'].lower()
              for i in hole('userInvitations?limit=100', t)['data']}
    fehlt = [m for _, _, m in zu_tun if m.lower() not in danach]
    if fehlt:
        sys.exit(f"✗ Diese stehen NICHT als offene Einladung da: {fehlt}")
    print(f"\n✓ {len(zu_tun)} Einladung(en) nachgewiesen offen.")
    print(f"  Sobald jemand annimmt: `npm run asc tester` nochmal — dann trage ich"
          f" ihn in die Gruppe {TESTER_GRUPPE} ein.")

def main():
    t = zugang()
    apps = hole(f'apps?filter[bundleId]={BUNDLE}', t)['data']
    if not apps:
        sys.exit(f'✗ Keine App mit {BUNDLE} in App Store Connect.')
    app = apps[0]
    print(f"App: {app['attributes']['name']}  ·  {app['attributes']['sku']}  ·  id {app['id']}")

    builds = hole(f"builds?filter[app]={app['id']}&limit=5&sort=-version", t)['data']
    if not builds:
        print("Noch kein Build sichtbar. Nach einem Upload dauert das ein paar Minuten.")
        return
    print("\nBuilds:")
    for b in builds:
        a = b['attributes']
        print(f"  Build {a['version']}  ·  {a.get('processingState')}"
              f"  ·  hochgeladen {a.get('uploadedDate')}"
              f"  ·  gültig bis {a.get('expirationDate')}")
        if a.get('processingState') == 'VALID':
            print("     → bereit für TestFlight")

    if len(sys.argv) > 1 and sys.argv[1] == 'tester':
        # Aufruf: npm run asc tester -- Vorname:Nachname:mail [...] [--wirklich]
        wirklich = '--wirklich' in sys.argv
        leute = [tuple(a.split(':', 2)) for a in sys.argv[2:]
                 if a.count(':') == 2]
        if not leute:
            sys.exit("Aufruf: npm run asc tester -- Vor:Nach:mail@… [weitere] "
                     "[--wirklich]")
        print()
        tester_einladen(t, app['id'], leute, wirklich)
        return

    gruppen = hole(f"betaGroups?filter[app]={app['id']}", t)['data']
    print("\nTestFlight-Gruppen:", ', '.join(
        f"{g['attributes']['name']} ({'intern' if g['attributes']['isInternalGroup'] else 'extern'})"
        for g in gruppen) or "keine")

if __name__ == '__main__':
    main()
