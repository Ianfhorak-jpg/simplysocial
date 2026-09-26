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
import sys, json, time, glob, os, base64, urllib.request
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

# ═══════════════════════════════════════════════════════════════════════════════
#  Apples Inhaltsfragebogen — die 28 Antworten aus `_FUER_IAN/ALTERSFREIGABE.md`
#
#  🔴 Gemessen am 2026-09-26 über Apples eigene Schnittstelle: **28 von 30 Feldern
#  standen auf `null`.** Das Dokument war seit dem 14.09. fertig, eingetragen war
#  nichts — und ein halber Fragebogen sperrt das Einreichen.
#
#  Das Ergebnis ist **13+**, und das ist keine Wahl, sondern eine Feststellung: Sie
#  folgt zwingend aus den drei JA unten (Feed · Chat · Social Media).
#
#  ── Warum das hier steht und nicht abgetippt wird ───────────────────────────
#  28 Felder von Hand in ein Webformular zu klicken ist genau die Handarbeit, die
#  in diesem Projekt bei Ian nicht anfallen soll. Und ein Formular vergisst, was
#  es weiss: Diese Tabelle kann man lesen, bewachen und begründen.
#
#  ── Die Leserichtung (harte Regel 107, wie beim Datenschutz-Etikett) ────────
#  Nicht das Dokument sagt, was die App tut — der CODE sagt, was im Dokument und
#  damit hier stehen muss. `npm run pruef-alter` bewacht die Richtung.
#
#  ⚠️ Die NEIN-Antworten sind die gefährlichen. „Es gibt einen Chat" bleibt wahr,
#  solange es die App gibt. „Es gibt keine Werbung" wird still falsch, sobald
#  jemand ein Paket nachinstalliert.
# ═══════════════════════════════════════════════════════════════════════════════
ALTERSFREIGABE = {
    # ── Die drei JA, aus denen 13+ FOLGT ─────────────────────────────────────
    # Menschen schreiben in dieser App: posts.title/note/meeting_point,
    # messages.text, profiles.bio, groups.name/description, *_requests.message —
    # dazu Profilbilder. Der Kern der App, kein Nebenfeature.
    'userGeneratedContent': True,
    # `messages` + `chat_threads`, dazu Direktnachrichten seit Phase 16.
    'messagingAndChat': True,
    # Apples Wortlaut: nutzergenerierte Inhalte über einen Feed verbreiten und mit
    # ihnen interagieren. Genau das ist der Feed plus `follows`.
    'socialMedia': True,

    # ── Die drei neuen Fragen von September 2026 ──────────────────────────────
    # Dafür verlangt Apple DREI Dinge: Declared Age Range API (iOS 26+),
    # Unter-13 aussperren, nur altersgerechte Inhalte. Keines ist gebaut.
    'socialMediaAgeRestricted': False,
    # Der Jahrgang wird beim ersten Konto EINGETIPPT (features/auth/konto.ts) und
    # von niemandem geprüft. Eine Eingabe ist keine Prüfung.
    'ageAssurance': False,
    # Gibt es nicht.
    'parentalControls': False,

    # ── Die Inhalte: überall „keine" ─────────────────────────────────────────
    # ⚠️ „Bier trinken gehen" zählt hier NICHT: Die Frage zielt auf Inhalte, die
    # die APP mitbringt, und die App bringt keine mit. Dass jemand „wir gehen auf
    # ein Bier" posten kann, ist nutzergenerierter Inhalt — dafür steht das JA
    # oben. Das ist eine AUSLEGUNG und gehört Ian (ALTERSFREIGABE.md, Frage 1);
    # „INFREQUENT_OR_MILD" wäre die vorsichtigere Antwort und kostet bei 13+
    # nichts, weil die Stufe schon durch den Feed bestimmt ist.
    'alcoholTobaccoOrDrugUseOrReferences': 'NONE',
    'matureOrSuggestiveThemes': 'NONE',      # die App ist ausdrücklich KEIN Dating
    'violenceCartoonOrFantasy': 'NONE',
    'violenceRealistic': 'NONE',
    'violenceRealisticProlongedGraphicOrSadistic': 'NONE',
    'horrorOrFearThemes': 'NONE',
    'profanityOrCrudeHumor': 'NONE',
    'gunsOrOtherWeapons': 'NONE',
    'sexualContentOrNudity': 'NONE',
    'sexualContentGraphicAndNudity': 'NONE',
    'gambling': False,
    'gamblingSimulated': 'NONE',
    'lootBox': False,
    'contests': 'NONE',
    'medicalOrTreatmentInformation': 'NONE',
    # ⚠️ Anders als in ACTA (Projekt 17) FALSE: Dort planen KI-Coach und RPE
    # wirklich Training. Diese App vermittelt Treffen und gibt keine
    # Gesundheitsinformationen — kein Plan, keine Kalorien, kein Ratschlag. Dass
    # viele Aktivitäten Sport sind, macht sie nicht zur Gesundheits-App.
    # Auch das ist eine Auslegung und gehört Ian (ALTERSFREIGABE.md, Frage 2).
    'healthOrWellnessTopics': False,
    # Im ganzen Quellcode kein einziges `openURL`, `Linking` oder `WebBrowser`.
    # Das einzige Browserfenster ist Googles Anmeldeseite über
    # `expo-auth-session` — eine feste Adresse, kein freier Webzugang.
    'unrestrictedWebAccess': False,
    # Unter 31 Abhängigkeiten KEIN Werbe-, Analyse- oder Absturzbericht-Paket.
    # Dieselbe Zählung trägt das Datenschutz-Etikett. `pruef-alter` wird rot,
    # sobald ein Paket dazukommt — das ist kein Fehlalarm, sondern die Frage.
    'advertising': False,

    # ── Nicht anfassen ───────────────────────────────────────────────────────
    # Freiwillig heraufsetzen: nein. Bei 17+ dürfte Ian seine eigene App nicht
    # laden, und die Zielgruppe auch nicht.
    'ageRatingOverride': 'NONE',
}

# `kidsAgeBand` steht ABSICHTLICH nicht in der Tabelle oben und bleibt `null`: Das
# ist Apples „Kids"-Kategorie mit eigenen, sehr strengen Regeln. Ein Wert hier wäre
# eine Zusage, keine Antwort. Dasselbe gilt für `gracRatingClassificationNumber`
# (Korea) und `developerAgeRatingInfoUrl`.

# Apple erwartet einzelne Felder je nach Konto anders getypt — `gambling` und
# `lootBox` sind Booleans, `gamblingSimulated` ist ein Enum, und `ageAssurance` kam
# 2025 dazu und ist wider Erwarten ebenfalls Boolean (in ACTA wurden alle vier
# Enum-Werte abgelehnt). Ein einzelnes unbekanntes Feld darf nicht den ganzen
# Fragebogen verhindern, deshalb je Feld eine Kandidatenliste. Wunschantwort zuerst.
KANDIDATEN = {
    'ageAssurance': [False, 'NONE'],
    'socialMediaAgeRestricted': [False, 'NONE'],
    'parentalControls': [False, 'NONE'],
    'userGeneratedContent': [True, 'FREQUENT_OR_INTENSE'],
    'messagingAndChat': [True, 'FREQUENT_OR_INTENSE'],
    'socialMedia': [True, 'FREQUENT_OR_INTENSE'],
    'healthOrWellnessTopics': [False, 'NONE'],
    'advertising': [False, 'NONE'],
    'unrestrictedWebAccess': [False, 'NONE'],
    'gambling': [False, 'NONE'],
    'lootBox': [False, 'NONE'],
    'contests': ['NONE', False],
    'gunsOrOtherWeapons': ['NONE', False],
    'medicalOrTreatmentInformation': ['NONE', False],
}

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

# ═══════════════════════════════════════════════════════════════════════════════
#  „Was fehlt noch, bevor eingereicht werden kann?" — NUR LESEN
#
#  Diese Frage konnte hier bis zum 2026-09-26 niemand beantworten. `npm run asc`
#  zeigte „Build 2 · VALID", und das beantwortet eine ANDERE Frage: ob ein Build
#  bei Apple liegt, nicht ob er an der Version HÄNGT. In ACTA (Projekt 17) hat
#  genau diese Verwechslung zwei Sitzungen gekostet — dort lag Build 1 sichtbar
#  bei Apple, und an Version 1.0 hing keiner.
#
#  🔴 Drei Lehren aus ACTAs zwei Ablehnungen stehen deshalb hier von Anfang an
#  drin, statt sie ein zweites Mal zu bezahlen:
#
#    1. Der PREIS ist ein harter Blocker und steht in keinem Feld des Berichts.
#       Sichtbar wird er nur als `APP_PRICING_REQUIRED` im 409 des Einreichens.
#       ACTA meldete 7 von 7 grün und Apple lehnte ab.
#    2. `appVersionState` kann `REJECTED` sein, WÄHREND alle Häkchen grün sind.
#       Der Bericht misst Feld-Vollständigkeit, nicht Erfolg bei Apple. In ACTA
#       stand die Ablehnung vier Tage lang in einem Wort der Überschrift.
#    3. Das Privacy-Label ist über die API weder schreib- NOCH lesbar (neun
#       Pfade geben 404). Hier steht deshalb ein `?`, kein `✗` — ein Kreuz
#       würde behaupten „ist nicht ausgefüllt", und das ist von hier aus nicht
#       feststellbar.
#
#  Alles hier ist lesend. Kein Aufruf dieser Funktionen ändert bei Apple etwas.
# ═══════════════════════════════════════════════════════════════════════════════

# Eine Version, an der man noch arbeiten kann. Alles andere ist bei Apple oder
# durch — und dann ist „was fehlt" die falsche Frage.
OFFENE_ZUSTAENDE = {
    'PREPARE_FOR_SUBMISSION', 'DEVELOPER_REJECTED', 'REJECTED',
    'METADATA_REJECTED', 'INVALID_BINARY', 'WAITING_FOR_REVIEW', 'IN_REVIEW',
}

def hole_weich(pfad, token):
    """Wie `hole`, aber ein HTTP-Fehler beendet das Skript NICHT — er kommt als
    `{'_http': <code>}` zurück.

    Gebraucht für Pfade, deren FEHLEN selbst die Information ist: Apple antwortet
    auf `appPriceSchedules/{id}/manualPrices` mit **404**, solange für die App gar
    kein Preis gesetzt ist. `hole` würde hier aussteigen."""
    req = urllib.request.Request('https://api.appstoreconnect.apple.com/v1/' + pfad,
                                 headers={'Authorization': f'Bearer {token}'})
    try:
        with urllib.request.urlopen(req) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        return {'_http': e.code}

def offene_version(token, app):
    for v in hole(f"apps/{app['id']}/appStoreVersions?limit=10", token)['data']:
        if v['attributes'].get('appVersionState') in OFFENE_ZUSTAENDE:
            return v
    return None

def app_info(token, app):
    """Der appInfo-Datensatz — daran hängen Altersfreigabe UND Kategorien.
    Beide liegen NICHT an der Version; unter `appStoreVersions/…` geben sie 404,
    und das sieht aus wie „gibt es nicht"."""
    for d in hole(f"apps/{app['id']}/appInfos", token)['data']:
        return d
    return None

def kategorien(token, app):
    """(primär, sekundär) — oder (None, None).

    🐞 Messfalle: Apple liefert `relationships.primaryCategory.data` bei einem
    schlichten GET auf `appInfos` **nicht mit**. Ohne `?include=` sieht eine
    gesetzte Kategorie genau wie eine fehlende aus."""
    infos = hole(f"apps/{app['id']}/appInfos?limit=1", token)['data']
    if not infos:
        return (None, None)
    r = hole(f"appInfos/{infos[0]['id']}?include=primaryCategory,secondaryCategory", token)
    rel = r['data'].get('relationships', {})
    hol = lambda n: ((rel.get(n) or {}).get('data') or {}).get('id')
    return (hol('primaryCategory'), hol('secondaryCategory'))

def preis_stand(token, app):
    """Was der Preis WIRKLICH ist — nicht nur, ob einer existiert.

    Die Zahl gehört in den Bericht, nicht ihre Abwesenheit von Null: Eine App, die
    versehentlich 4,99 kostet, liefe bei „Preis vorhanden ✓" grün durch. Ohne Preis
    antwortet Apple auf BEIDE Pfade mit 404, nicht mit einer leeren Liste."""
    betraege, laender, gesetzt = set(), 0, False
    for art in ('manualPrices', 'automaticPrices'):
        r = hole_weich(f"appPriceSchedules/{app['id']}/{art}"
                       "?limit=200&include=appPricePoint"
                       "&fields[appPricePoints]=customerPrice", token)
        if '_http' in r:
            continue
        if r.get('data'):
            gesetzt = True
        laender += r.get('meta', {}).get('paging', {}).get('total', len(r.get('data', [])))
        for inc in r.get('included', []):
            if inc['type'] == 'appPricePoints':
                betraege.add(inc['attributes'].get('customerPrice'))
    return {'gesetzt': gesetzt, 'betraege': betraege, 'laender': laender}

def zustand_deutung(zustand):
    """Was Apples `appVersionState` für den Menschen davor bedeutet.

    Gibt (dringlich, text) zurück — `dringlich=True` heisst: der Bericht darunter
    beantwortet gerade NICHT die Frage, die der Leser hat."""
    abgelehnt = {
        'REJECTED': 'Apple hat die Version ABGELEHNT.',
        'METADATA_REJECTED': 'Apple hat die METADATEN abgelehnt (Texte/Bilder, nicht den Build).',
        'DEVELOPER_REJECTED': 'Die Einreichung wurde von EUCH zurückgezogen.',
        'INVALID_BINARY': 'Der Build ist ungültig — ein neuer Upload ist nötig.',
    }
    if zustand in abgelehnt:
        return True, (
            f"{abgelehnt[zustand]}\n"
            "     Der GRUND steht NICHT in dieser Schnittstelle — das Resolution Center\n"
            "     ist über die API nicht lesbar. Nachsehen in Apples Mail an Ian.\n"
            "     Die Häkchen unten sagen nur, dass die FELDER gefüllt sind.")
    laufend = {
        'WAITING_FOR_REVIEW': 'Die Version wartet auf die Prüfung — eingereicht, noch nicht dran.',
        'IN_REVIEW': 'Die Version wird gerade geprüft.',
        'PENDING_APPLE_RELEASE': 'Freigegeben — Apple veröffentlicht sie noch.',
        'PENDING_DEVELOPER_RELEASE': 'Freigegeben — wartet auf EUREN Klick.',
        'READY_FOR_DISTRIBUTION': 'Die Version ist LIVE im Store.',
        'READY_FOR_SALE': 'Die Version ist LIVE im Store.',
    }
    if zustand in laufend:
        return True, laufend[zustand] + "\n     Die Häkchen unten prüfen die Felder, nicht diesen Zustand."
    return False, ''

def einreichbereit(token, app):
    """Nur lesen: was Apple vor „Submit for Review" verlangt und was davon steht."""
    v = offene_version(token, app)
    if not v:
        print("\nKeine bearbeitbare Version — nichts zu prüfen.")
        print("  (Alle Versionen sind bei Apple, live, oder es gibt noch keine.)")
        return
    va = v['attributes']
    info = app_info(token, app)
    zustand = va.get('appVersionState')
    dringlich, deutung = zustand_deutung(zustand)

    print(f"\nEinreich-Bereitschaft für Version {va['versionString']} ({zustand}):\n")
    if dringlich:
        print("  " + "━" * 68)
        print(f"  ⚠️  {deutung}")
        print("  " + "━" * 68 + "\n")

    offen = []
    def zeile(name, erfuellt, was, wer=''):
        print(f"  {'✓' if erfuellt else '✗'} {name:<26} {was}"
              + (f"   [{wer}]" if not erfuellt and wer else ''))
        if not erfuellt:
            offen.append(name)

    # 🔴 DIE Frage, die `npm run asc` nicht stellt. „Build 2 · VALID" heisst, dass
    # er bei Apple liegt — nicht, dass er an dieser Version hängt.
    # ⚠️ Zuständigkeit 🧑, obwohl ein PATCH das technisch könnte. Anhängen wäre nur
    # dann Fortschritt, wenn der Build den Code von HEUTE trägt — und das tut der
    # jüngste hier nicht (Build 2, 14.09., ohne die Entscheidungen 90–110). Einen
    # veralteten Build anzuhängen und „erledigt" zu melden ist genau der Fehler, den
    # ACTAs `build-verknuepfen` schon einmal gemacht hat. Es braucht vorher
    # `npm run testflight`, und das fasst Ians Schlüsselbund an.
    b = hole(f"appStoreVersions/{v['id']}/build", token).get('data')
    zeile('Build an der Version', bool(b),
          f"Build {b['attributes']['version']}" if b else
          'KEINER — Einreichen gesperrt. Braucht einen NEUEN Build, nicht den alten',
          '🧑 npm run testflight')

    rd = hole(f"appStoreVersions/{v['id']}/appStoreReviewDetail", token).get('data')
    if rd:
        ra = rd['attributes']
        voll = bool(ra.get('demoAccountName') and ra.get('contactEmail'))
        zeile('Prüfinfos + Demo-Login', voll,
              f"Kontakt {ra.get('contactEmail') or 'FEHLT'} · "
              f"Demo {ra.get('demoAccountName') or 'FEHLT'} · "
              f"Tel {ra.get('contactPhone') or 'FEHLT'}", '🧑 _FUER_IAN/DEMO_ZUGANG.md')
    else:
        zeile('Prüfinfos + Demo-Login', False, 'noch gar nichts eingetragen',
              '🧑 _FUER_IAN/DEMO_ZUGANG.md')

    decl = hole(f"appInfos/{info['id']}/ageRatingDeclaration", token)['data']['attributes']
    gesetzt = [f for f, w in decl.items() if w is not None and f != 'ageRatingOverride']
    zeile('Altersfreigabe', len(gesetzt) > 3,
          f"{len(gesetzt)} von {len(decl)} Feldern beantwortet" if gesetzt else 'komplett leer',
          '🧑 _FUER_IAN/ALTERSFREIGABE.md')

    cr = hole(f"apps/{app['id']}", token)['data']['attributes'].get('contentRightsDeclaration')
    zeile('Inhaltsrechte', bool(cr), cr or 'nicht beantwortet', '🧑')

    zeile('Copyright', bool(va.get('copyright')),
          va.get('copyright') or 'leer — = rechtlicher Betreiber, hängt am Apple-Programm',
          '🧑 Ian + Eltern')

    # Steht bewusst direkt hinter dem Copyright: beides ist „Geld/Recht", beides
    # blockiert hart, und beides kann dieses Skript NICHT setzen.
    preis = preis_stand(token, app)
    if not preis['gesetzt']:
        text = 'FEHLT — Apple nimmt die App sonst nicht an (APP_PRICING_REQUIRED)'
    elif preis['betraege'] and all(float(b or 0) == 0 for b in preis['betraege']):
        text = f"kostenlos (0.0) in {preis['laender']} Ländern"
    else:
        text = (f"KOSTENPFLICHTIG: {sorted(b for b in preis['betraege'] if b)} "
                f"in {preis['laender']} Ländern — gewollt?")
    zeile('Preis gesetzt', preis['gesetzt'], text, '🧑')

    prim, sek = kategorien(token, app)
    zeile('Kategorie', bool(prim),
          f"{prim}{' + ' + sek if sek else ''}" if prim
          else 'FEHLT — Apple nimmt die Version sonst nicht an', '🧑')

    idfa = va.get('usesIdfa')
    zeile('Werbe-ID erklärt', idfa is not None,
          {True: 'ja, App nutzt IDFA', False: 'nein — keine Werbe-ID'}.get(
              idfa, 'NIE BEANTWORTET — blockiert die Einreichung'), '🧑')

    lok = hole(f"appStoreVersions/{v['id']}/appStoreVersionLocalizations", token)['data']
    fehlend = [l['attributes']['locale'] for l in lok
               if not (l['attributes'].get('description') and l['attributes'].get('keywords'))]
    zeile('Store-Texte', not fehlend and bool(lok),
          f"{len(lok)} Sprachen vollständig" if lok and not fehlend
          else f"unvollständig: {fehlend or 'keine Sprache angelegt'}", '🧑')

    # „Hochgeladen" und „von Apple abgenommen" sind ZWEI Zustände. Ein Bild im
    # falschen Format nimmt der PUT klaglos an und fällt erst im
    # `assetDeliveryState` auf — gezählt wird deshalb der Zustand, nicht die Datei.
    ohne_bild, unfertig = [], []
    for l in lok:
        loc = l['attributes']['locale']
        mengen = hole(f"appStoreVersionLocalizations/{l['id']}/appScreenshotSets", token)['data']
        bilder = [b for m in mengen
                  for b in hole(f"appScreenshotSets/{m['id']}/appScreenshots", token)['data']]
        if not bilder:
            ohne_bild.append(loc)
            continue
        schlecht = [b['attributes']['fileName'] for b in bilder
                    if (b['attributes'].get('assetDeliveryState') or {}).get('state') != 'COMPLETE']
        if schlecht:
            unfertig.append(f"{loc}: {schlecht}")
    zeile('Screenshots abgenommen', bool(lok) and not ohne_bild and not unfertig,
          f"{len(lok)} Sprachen, alle COMPLETE" if lok and not ohne_bild and not unfertig
          else f"ohne Bild: {ohne_bild} · nicht COMPLETE: {unfertig}", '🧑')

    stufe = hole(f"appInfos/{info['id']}", token)['data']['attributes'].get('appStoreAgeRating')
    print(f"\n  → Von Apple errechnete Altersstufe: {stufe or 'noch keine'}")

    # Kein ✗, sondern ?: Ein Haken oder Kreuz behauptet Wissen. Das Privacy-Label
    # ist über die API weder schreib- NOCH lesbar — in ACTA am 2026-09-13 an neun
    # Pfaden gemessen, alle 404. Ein ✗ hiesse „ist nicht ausgefüllt", und genau
    # das ist von hier aus nicht feststellbar.
    print("\n  ? Privacy-Label                über die API nicht auslesbar — in App Store"
          " Connect nachsehen")
    print("     Steht dort „Bearbeiten\" statt „Erste Schritte\", ist es ausgefüllt.")
    print("     [🧑 Die sieben Einträge stehen in _FUER_IAN/DATENSCHUTZ_ETIKETT.md]")

    print(f"\n  ── {len(offen)} offene Punkte" + (f": {', '.join(offen)}" if offen else " — Felder vollständig"))

    # Noch einmal, ganz unten: Wer eine Liste von Häkchen liest, hört oben auf zu
    # lesen, sobald sie grün aussieht. Genau so blieb in ACTA vier Tage lang eine
    # Ablehnung unbemerkt.
    if dringlich:
        print("\n  " + "━" * 68)
        print(f"  ⚠️  ZUSTAND: {zustand} — {deutung.splitlines()[0]}")
        print("      Alle Häkchen oben können grün sein und trotzdem nichts daran ändern.")
        print("  " + "━" * 68)


def sende(methode, pfad, koerper, token):
    """PATCH/POST mit Apples Fehlertext. Gibt (ok, text) zurück, statt auszusteigen —
    der Fehlertext IST hier die Information: In ihm steht, welches Feld Apple nicht
    mochte, und darauf baut die Ausweichlogik in `altersfreigabe()` auf."""
    req = urllib.request.Request(
        'https://api.appstoreconnect.apple.com/v1/' + pfad,
        data=json.dumps(koerper).encode(),
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
        method=methode)
    try:
        with urllib.request.urlopen(req) as r:
            roh = r.read()
            return True, (json.loads(roh) if roh else {})
    except urllib.error.HTTPError as e:
        return False, e.read().decode()


def altersfreigabe(token, app):
    """Apples Inhaltsfragebogen ausfüllen — SCHREIBT bei Apple.

    Die Ressource heisst `ageRatingDeclarations` und hängt am `appInfo`, nicht an
    der Version. Sie hat über die Jahre Felder dazubekommen, und einzelne sind je
    nach Konto anders getypt. Deshalb wird bei einem Feld-Fehler der nächste
    Kandidat versucht und zuletzt das Feld entfernt, statt alles scheitern zu
    lassen — sonst verhindert ein einziges unbekanntes Feld den ganzen Fragebogen.

    ⚠️ Das hier ändert etwas in Ians Apple-Konto. Es reicht die App NICHT ein, und
    es ist jederzeit überschreibbar: Der Fragebogen ist ein Formular, kein Versand.
    """
    info = app_info(token, app)
    if not info:
        print("✗ Kein appInfo-Datensatz gefunden.")
        return
    decl = hole(f"appInfos/{info['id']}/ageRatingDeclaration", token)['data']
    vorher = decl['attributes']
    offen_vorher = [f for f, w in vorher.items() if w is None]
    print(f"Fragebogen {decl['id']}")
    print(f"  vorher: {len(offen_vorher)} von {len(vorher)} Feldern unbeantwortet")

    felder = dict(ALTERSFREIGABE)
    # Merken, was pro Feld schon durchgefallen ist. Ohne das pendelt die Schleife
    # zwischen zwei Kandidaten hin und her, bis der Zähler abgelaufen ist — genau
    # das ist in ACTA am 2026-09-13 passiert: 14 Versuche, zwei Werte, keine
    # Erkenntnis.
    verbraucht = {}

    for _ in range(14):
        ok, r = sende('PATCH', f"ageRatingDeclarations/{decl['id']}",
                      {'data': {'type': 'ageRatingDeclarations', 'id': decl['id'],
                                'attributes': felder}}, token)
        if ok:
            break

        # Fall A: Apple verlangt ein Feld, das die Tabelle nicht hat. Der erlaubte
        # Wert steht NICHT in der Fehlermeldung, also der Reihe nach probieren.
        fehlt = None
        if 'missing a required attribute' in r or 'must provide a value' in r.lower():
            for f in KANDIDATEN:
                if f"'{f}'" in r:
                    fehlt = f
                    break
        if fehlt and fehlt not in felder:
            felder[fehlt] = KANDIDATEN[fehlt][0]
            verbraucht.setdefault(fehlt, set()).add(repr(felder[fehlt]))
            print(f"  … Apple verlangt '{fehlt}' — versuche {felder[fehlt]!r}.")
            continue

        # Fall B: ein Wert passt nicht. Nächsten Kandidaten, sonst Feld raus.
        schuldig = [f for f in felder if f"'{f}'" in r or f'"{f}"' in r]
        if not schuldig:
            print(f"✗ Abgelehnt, und kein Feld benannt. Apple sagt wörtlich:\n{r}")
            return
        for f in schuldig:
            benutzt = verbraucht.setdefault(f, set())
            benutzt.add(repr(felder[f]))
            rest = [w for w in KANDIDATEN.get(f, []) if repr(w) not in benutzt]
            if rest:
                felder[f] = rest[0]
                benutzt.add(repr(rest[0]))
                print(f"  … '{f}' abgelehnt — versuche {rest[0]!r}.")
            else:
                # Apples Wortlaut ist ab hier die einzige Spur — ungekürzt ausgeben.
                print(f"  ✗ '{f}': alle Kandidaten durch. Apple sagt wörtlich:")
                print(f"      {r}")
                felder.pop(f)
    else:
        print("✗ Nach 14 Versuchen immer noch abgelehnt.")
        return

    # 🔴 Zurückfragen statt der Erfolgsmeldung glauben. Ein 200 heisst „angenommen",
    # nicht „steht so da" — dieselbe Lehre wie „BUILD SUCCEEDED beantwortet nicht
    # die Frage, wegen der man gebaut hat".
    nach = hole(f"appInfos/{info['id']}/ageRatingDeclaration", token)['data']['attributes']
    abweichung = [f for f, soll in felder.items() if nach.get(f) != soll]
    rest_leer = [f for f, w in nach.items() if w is None]
    print(f"✓ Geschrieben: {len(felder)} Felder, zurückgelesen.")
    if abweichung:
        print("  ⚠️ Anders da als geschickt:",
              ', '.join(f"{f}={nach.get(f)!r} (soll {felder[f]!r})" for f in abweichung))
    print(f"  noch leer: {', '.join(rest_leer) if rest_leer else '—'}")
    ja = [f for f, w in nach.items()
          if w is True or (isinstance(w, str) and w not in ('NONE', ''))]
    print("  auf 'ja'/gesetzt:", ', '.join(sorted(ja)) or '—')

    stufe = hole(f"appInfos/{info['id']}", token)['data']['attributes'].get('appStoreAgeRating')
    print(f"\n  → Von Apple errechnete Altersstufe: {stufe or 'noch keine'}")
    print("     (Erwartet: 13+ — sie FOLGT aus Feed · Chat · Social Media.)")


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

def zertifikat_anlegen(t):
    """Ein Distribution-Zertifikat anlegen — Phase 21.4.

    ⚠️ **Das wirkt nach aussen und verbraucht ein Kontingent.** Apple erlaubt zwei
    Distribution-Zertifikate je Konto; ist keins mehr frei, muss eins widerrufen
    werden (developer.apple.com → Certificates). Deshalb geht der Aufruf durch
    `schicke()` und nicht durch `hole()` — dieselbe Trennung wie bei den Einladungen.

    ── Warum es das überhaupt braucht ────────────────────────────────────────
    Ein Gerätebuild wird mit `Apple Development` signiert, ein TestFlight-Build
    mit `Apple Distribution`. Am 2026-09-14 lag im Konto NUR das Development-
    Zertifikat und kein einziges Profil — Build 1 vom 11.09. ist bei Apple, aber
    wie er signiert wurde, steht nirgends und ist im Konto nicht mehr zu sehen.

    Der private Schlüssel wird NICHT hier erzeugt: Er liegt schon in
    ~/.appstoreconnect/dist/dist.key, weil er niemals durch ein Python-Skript
    gehen soll, das auch Netzwerkaufrufe macht. Hier geht nur die CSR hinaus —
    die ist öffentlich, sie enthält den öffentlichen Schlüssel.
    """
    csr_pfad = f'{BASIS}/dist/dist.csr'
    if not os.path.exists(csr_pfad):
        sys.exit(f'✗ Keine CSR in {csr_pfad} — erst `npm run testflight` aufrufen.')
    with open(csr_pfad) as f:
        csr = f.read()

    vorhanden = hole('certificates?filter[certificateType]=DISTRIBUTION&limit=10', t)['data']
    if len(vorhanden) >= 2:
        print('✗ Es gibt schon zwei Distribution-Zertifikate — Apple erlaubt nicht mehr.')
        for c in vorhanden:
            a = c['attributes']
            print(f"    · {a['displayName']}  läuft ab {a['expirationDate'][:10]}  id={c['id']}")
        sys.exit('  Widerrufe eins unter developer.apple.com → Certificates.')

    antwort = schicke('certificates', t, {'data': {
        'type': 'certificates',
        'attributes': {'certificateType': 'DISTRIBUTION', 'csrContent': csr}}})
    a = antwort['data']['attributes']
    ziel = f'{BASIS}/dist/dist.cer'
    with open(ziel, 'wb') as f:
        f.write(base64.b64decode(a['certificateContent']))
    os.chmod(ziel, 0o600)
    print(f"✓ Zertifikat angelegt: {a['displayName']}  ·  läuft ab {a['expirationDate'][:10]}")
    print(f"  abgelegt in {ziel} (Rechte 600, ausserhalb des Repos)")


def profil_anlegen(t):
    """Ein App-Store-Provisioning-Profil anlegen — Phase 21.4.

    Ein Profil bindet drei Dinge zusammen: die Bundle-ID, das Zertifikat und das
    Team. Fehlt es, scheitert `xcodebuild archive` mit einer Meldung über fehlende
    Signatur — nach den zwanzig Minuten, die der Build gebraucht hat.

    ⚠️ `IOS_APP_STORE` und nicht `IOS_APP_DEVELOPMENT`: Ein Development-Profil
    baut durch und wird von App Store Connect danach ABGELEHNT. Der Unterschied
    kostet also nicht eine Fehlermeldung, sondern einen ganzen Durchgang.
    """
    bundles = hole(f'bundleIds?filter[identifier]={BUNDLE}&limit=1', t)['data']
    if not bundles:
        sys.exit(f'✗ Die Bundle-ID {BUNDLE} gibt es im Entwicklerkonto nicht.')
    bundle_id = bundles[0]['id']

    zerts = hole('certificates?filter[certificateType]=DISTRIBUTION&limit=10', t)['data']
    if not zerts:
        sys.exit('✗ Kein Distribution-Zertifikat — erst `zertifikat-anlegen`.')
    zert_id = zerts[0]['id']

    name = 'SimplySocial App Store'
    # Ein gleichnamiges Profil wird zuerst weggeräumt: Apple lässt zwei mit
    # demselben Namen zu, und `xcodebuild` nimmt dann irgendeins davon.
    for p in hole('profiles?limit=50', t)['data']:
        if p['attributes']['name'] == name:
            loesche(f"profiles/{p['id']}", t)
            print(f'  (altes Profil {name} entfernt)')

    antwort = schicke('profiles', t, {'data': {
        'type': 'profiles',
        'attributes': {'name': name, 'profileType': 'IOS_APP_STORE'},
        'relationships': {
            'bundleId': {'data': {'type': 'bundleIds', 'id': bundle_id}},
            'certificates': {'data': [{'type': 'certificates', 'id': zert_id}]}}}})
    a = antwort['data']['attributes']
    ziel = f'{BASIS}/dist/simplysocial_appstore.mobileprovision'
    with open(ziel, 'wb') as f:
        f.write(base64.b64decode(a['profileContent']))
    os.chmod(ziel, 0o600)
    print(f"✓ Profil angelegt: {a['name']}  ·  {a['profileState']}")


def loesche(pfad, token):
    """Ein DELETE an die API. Wie `schicke()` nach aussen wirksam — deshalb eigen."""
    req = urllib.request.Request('https://api.appstoreconnect.apple.com/v1/' + pfad,
                                 headers={'Authorization': f'Bearer {token}'},
                                 method='DELETE')
    try:
        urllib.request.urlopen(req)
    except urllib.error.HTTPError as e:
        sys.exit(f'✗ Apple sagt nein ({e.code}):\n{e.read().decode()}')


def main():
    t = zugang()

    # Diese zwei laufen aus `scripts/testflight.sh` und brauchen weder App noch
    # Buildliste — sie stehen deshalb VOR dem Rest und geben danach zurück.
    if len(sys.argv) > 1 and sys.argv[1] == 'zertifikat-anlegen':
        zertifikat_anlegen(t)
        return
    if len(sys.argv) > 1 and sys.argv[1] == 'profil-anlegen':
        profil_anlegen(t)
        return
    # `builds` ist dasselbe wie der Aufruf ohne Argument — es gibt ihn als eigenen
    # Namen, damit `testflight.sh` lesbar bleibt (`asc.py builds`) und damit klar
    # ist, dass dort nur GELESEN wird.

    apps = hole(f'apps?filter[bundleId]={BUNDLE}', t)['data']
    if not apps:
        sys.exit(f'✗ Keine App mit {BUNDLE} in App Store Connect.')
    app = apps[0]
    print(f"App: {app['attributes']['name']}  ·  {app['attributes']['sku']}  ·  id {app['id']}")

    # Nur lesend, und deshalb VOR der Buildliste: Wer „was fehlt noch" fragt,
    # braucht keine fünf Buildzeilen davor — und die Frage „hängt ein Build an der
    # VERSION" beantwortet die Liste gerade nicht.
    if len(sys.argv) > 1 and sys.argv[1] == 'einreichbereit':
        einreichbereit(t, app)
        return

    # ⚠️ SCHREIBT in Ians Apple-Konto — deshalb das `--wirklich` davor, wie beim
    # Werkzeug, das löscht (harte Regel: das Gate ist das Einzige zwischen einem
    # Tippfehler und einer Änderung nach aussen). Ohne es wird nur GEZEIGT, was
    # geschickt würde; das ist der Lauf, den man vorher macht.
    if len(sys.argv) > 1 and sys.argv[1] == 'altersfreigabe':
        print()
        if '--wirklich' not in sys.argv:
            decl = hole(f"appInfos/{app_info(t, app)['id']}/ageRatingDeclaration", t)['data']
            leer = [f for f, w in decl['attributes'].items() if w is None]
            print(f"Fragebogen {decl['id']}  ·  {len(leer)} von "
                  f"{len(decl['attributes'])} Feldern unbeantwortet\n")
            print(f"Das würde geschickt ({len(ALTERSFREIGABE)} Felder):")
            for f, w in sorted(ALTERSFREIGABE.items()):
                ist = decl['attributes'].get(f)
                zeichen = '=' if ist == w else '→'
                print(f"  {f:44} {ist!r:8} {zeichen} {w!r}")
            print("\n  Es ist NICHTS passiert. Schreiben:")
            print("      npm run asc altersfreigabe -- --wirklich")
            print("\n  Die Begründung je Feld steht in scripts/asc.py an der Tabelle")
            print("  ALTERSFREIGABE, in Ians Sprache in _FUER_IAN/ALTERSFREIGABE.md.")
            return
        altersfreigabe(t, app)
        return

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
