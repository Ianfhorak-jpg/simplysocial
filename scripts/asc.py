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

    gruppen = hole(f"betaGroups?filter[app]={app['id']}", t)['data']
    print("\nTestFlight-Gruppen:", ', '.join(
        f"{g['attributes']['name']} ({'intern' if g['attributes']['isInternalGroup'] else 'extern'})"
        for g in gruppen) or "keine")

if __name__ == '__main__':
    main()
