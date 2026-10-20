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
import sys, json, re, time, glob, os, base64, urllib.request
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

    # ── Der Override ─────────────────────────────────────────────────────────
    # 🔴 **Seit dem 2026-10-20 steht hier 13+** (vorher `NONE`). Gemessen an Apples
    # eigener Ausgabe: Mit `userGeneratedContent`, `messagingAndChat` UND
    # `socialMedia` auf True rechnete Apple trotzdem `FOUR_PLUS` (in Brasilien sogar
    # `L` = für alle). **Die Annahme „daraus FOLGT 13+", die `pruef-alter` und
    # ALTERSFREIGABE.md trugen, stimmte nicht** — Apple macht aus Chat unter Fremden
    # keine Altersgrenze. Ein 4+ bei einer App, in der man sich mit Unbekannten
    # trifft, ist falsch beschriftet, und genau darauf verlassen sich Eltern, die
    # am Kindergerät eine Grenze eingestellt haben.
    #
    # Warum 13+ und nicht mehr: Die Mindestgrenze der App ist 14 (`BRAND.legal.
    # mindestalter`). 16+ würde 14- und 15-Jährige mit eingestellter Grenze
    # aussperren, die wir ausdrücklich dabeihaben wollen; 18+ verbietet es Ian
    # selbst (er ist 17) und fast allen Gründern. Eine Stufe höher ist ein Wort:
    # `SIXTEEN_PLUS`.
    #
    # 🔴 **NUR das V2-Feld, nie das alte `ageRatingOverride`.** Apple lehnt beides
    # zusammen ab (409 `AGE_RATING_OVERRIDE_V1_AND_V2_NOT_ALLOWED`: „The attribute
    # 'ageRatingOverride' cannot be set when 'ageRatingOverrideV2' is set"). Der erste
    # Lauf am 2026-10-20 hat genau das geschickt, den Fehler falsch gedeutet — und
    # still `NINE_PLUS` geschrieben (siehe `KANDIDATEN`). Apple spiegelt V2 selbst in V1.
    'ageRatingOverrideV2': 'THIRTEEN_PLUS',
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
# 🔴 **`appStoreAgeRating` spricht Apples ALTE Namensliste, auch wenn die Stufe neu ist.**
# Am 2026-10-20 stand dort nach dem Override `THIRTEEN_PLUS` (am Formular zurückgelesen) die
# errechnete Stufe `TWELVE_PLUS` — Apples neue Skala (4 · 9 · 13 · 16 · 18) hat im alten Feld keinen
# Namen für 13, Brasilien zeigt dazu `TWELVE`. Die erste Fassung dieser Prüfung kannte nur
# `THIRTEEN_PLUS` und meldete deshalb einen Fehler, der keiner war. Maßgeblich ist, dass der
# OVERRIDE (V2) zurückgelesen `THIRTEEN_PLUS`/`SIXTEEN_PLUS` ist — das prüft `altersfreigabe`
# getrennt gegen `ALTERSFREIGABE`. ⚠️ Dass `TWELVE_PLUS` im Store als „13+“ erscheint, ist
# GEFOLGERT, nicht gesehen: App Store Connect → Allgemeine Informationen → Altersfreigabe zeigt es.
STUFEN_AB_13 = ('TWELVE_PLUS', 'THIRTEEN_PLUS', 'SIXTEEN_PLUS', 'SEVENTEEN_PLUS', 'EIGHTEEN_PLUS')

KANDIDATEN = {
    # 🔴 **Absichtlich NUR ein Wert.** Der Kandidat danach hieß `NINE_PLUS`, und der Fall trat
    # ein: Ein Fehler, der das Feld nur NENNT, schickte die Schleife zum nächsten Kandidaten —
    # und Ian bekam 9+ statt 13+, mit „✓ Geschrieben“. Ein Ausweichwert, der WENIGER schützt
    # als der gewollte, ist kein Ausweichwert, sondern ein stiller Absturz nach unten.
    'ageRatingOverrideV2': ['THIRTEEN_PLUS'],
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
    # 🔴 „Hängt ein Build dran" ist NICHT dieselbe Frage wie „ist er aktuell".
    # Am 2026-09-28 hing Build 3 an der Version, und eine Viertelstunde später war
    # er veraltet, weil `Nutzungsbedingungen.tsx` geändert wurde. Diese Liste hätte
    # weiter ✓ gemeldet — dieselbe Sorte Lücke wie bei `build-anhaengen`, und
    # dieselbe Lehre: *Ein Häkchen, das eine ÄHNLICHE Frage beantwortet, ist kein
    # Häkchen.*
    build_alt, build_grund = False, ''
    if b:
        import datetime as _dt, pathlib as _pl
        _hoch = _dt.datetime.fromisoformat(
            b['attributes']['uploadedDate'].replace('Z', '+00:00'))
        _datei, _zeit = None, 0.0
        for _d in _pl.Path('src').rglob('*'):
            if _d.is_file() and _d.suffix in ('.ts', '.tsx', '.js', '.jsx', '.json'):
                _m = _d.stat().st_mtime
                if _m > _zeit:
                    _zeit, _datei = _m, _d
        _quelle = _dt.datetime.fromtimestamp(_zeit, _dt.timezone.utc)
        if _quelle > _hoch:
            build_alt = True
            build_grund = (f"Build {b['attributes']['version']} hängt dran, ist aber "
                           f"VERALTET — {_datei} wurde danach geändert")
    # 🔴 **ZWEI Fragen, zwei Zeilen — seit dem 2026-10-20.** Vorher trug dieser
    # Punkt beide: „hängt ein Build dran" (Apples Anforderung) und „ist er aktuell"
    # (unsere, strengere). Das ging schief, sobald Ian den Build anhängte und danach
    # eine Zeile Code fiel: Die Liste meldete weiter ✗ und „1 offene Punkte", obwohl
    # Apple zufrieden war — **zwölf von zwölf waren damit unerreichbar**, ohne neu zu
    # bauen. *Eine Meldung, die den eigenen Ablauf nicht kennt, ist keine Auskunft*
    # (FALLEN.md).
    #
    # Gezählt wird jetzt nur, was APPLE verlangt. Die Aktualität steht als eigene
    # Warnung darunter — sichtbar, aber nicht als Sperre, denn ob eine Änderung nach
    # dem Build wirklich zählt, weiß nur ein Mensch. ⚠️ Sie darf NICHT verschwinden:
    # Genau dieser Wächter hat am 17.10. einen Build erwischt, der den roten Kasten
    # noch trug.
    zeile('Build an der Version', bool(b),
          (f"Build {b['attributes']['version']}" if b else
           'KEINER — Einreichen gesperrt. Braucht einen NEUEN Build, nicht den alten'),
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
    gesetzt = [f for f, w in decl.items() if w is not None and f not in ('ageRatingOverride', 'ageRatingOverrideV2')]
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

    # 🔴 Am 2026-09-28 dazugekommen, und der Grund ist derselbe wie am 26.09. beim
    # ganzen Store-Eintrag: Es hat nie jemand gefragt. Die Zeile darüber prüfte
    # `description` und `keywords` — beides steckt in appStoreVersionLocalizations.
    # Apple verlangt aber ZWEI weitere Pflichtfelder, und eines davon liegt in einer
    # ANDEREN Ressource:
    #
    #   supportUrl        appStoreVersionLocalizations  (hängt an der Version)
    #   privacyPolicyUrl  appInfoLocalizations          (hängt an der APP)
    #
    # Ein Werkzeug, das appInfoLocalizations gar nicht abruft, kann deren Felder auch
    # nie als fehlend melden. Beide standen am 2026-09-28 auf None.
    # ⚠️ Eine URL, die 404 liefert, ist SCHLIMMER als keine: Apple klickt sie an
    # (Guideline 1.5), und ein toter Link ist eine Ablehnung mit Ansage.
    ohne_support = [l['attributes']['locale'] for l in lok
                    if not l['attributes'].get('supportUrl')]
    zeile('Support-URL', not ohne_support and bool(lok),
          next((l['attributes']['supportUrl'] for l in lok
                if l['attributes'].get('supportUrl')), None)
          or f"FEHLT ({ohne_support or 'keine Sprache angelegt'}) — Apple verlangt sie",
          '🧑 npm run asc texte -- --wirklich')

    ilok = hole(f"appInfos/{info['id']}/appInfoLocalizations", token)['data']
    ohne_dsgvo = [l['attributes']['locale'] for l in ilok
                  if not l['attributes'].get('privacyPolicyUrl')]
    zeile('Datenschutz-URL', not ohne_dsgvo and bool(ilok),
          next((l['attributes']['privacyPolicyUrl'] for l in ilok
                if l['attributes'].get('privacyPolicyUrl')), None)
          or f"FEHLT ({ohne_dsgvo or 'keine Sprache angelegt'}) — Pflicht bei jeder App mit Konto",
          '🧑 npm run asc texte -- --wirklich')

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
    if stufe not in STUFEN_AB_13:
        print(f"  ⚠️  {stufe or 'keine'} — das ist UNTER 13+. Die App erlaubt ab 14; ein "
              "niedrigeres Etikett\n     beschriftet sie falsch. Zählt nicht als offener Punkt (Apple verlangt es nicht).\n"
              "     [🧑 npm run asc altersfreigabe -- --wirklich]")

    # Kein ✗, sondern ?: Ein Haken oder Kreuz behauptet Wissen. Das Privacy-Label
    # ist über die API weder schreib- NOCH lesbar — in ACTA am 2026-09-13 an neun
    # Pfaden gemessen, alle 404. Ein ✗ hiesse „ist nicht ausgefüllt", und genau
    # das ist von hier aus nicht feststellbar.
    print("\n  ? Privacy-Label                über die API nicht auslesbar — in App Store"
          " Connect nachsehen")
    print("     Steht dort „Bearbeiten\" statt „Erste Schritte\", ist es ausgefüllt.")
    print("     [🧑 Die sieben Einträge stehen in _FUER_IAN/DATENSCHUTZ_ETIKETT.md]")

    # Die Aktualitäts-Warnung steht NACH der Liste und zählt nicht mit — wie das
    # Privacy-Label, und aus verwandtem Grund: Sie behauptet keinen Mangel bei Apple,
    # sondern nennt eine Tatsache, die ein Mensch beurteilen muss.
    if build_alt:
        print(f"\n  ⚠️  {build_grund}")
        print("     Apples Anforderung ist trotzdem erfüllt — ein Build hängt dran.")
        print("     Ob die Änderung zählt, sagt der Diff: `git log` seit dem Upload.")
        print("     [🧑 neu bauen mit `npm run testflight`, oder bewusst so lassen]")

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
    # 🔴 Gegen die ABSICHT prüfen (`ALTERSFREIGABE`), nicht gegen `felder`: Die Schleife
    # oben tauscht Werte aus und nimmt Felder heraus. Wer das Ergebnis gegen die geänderte
    # Tabelle prüft, bekommt immer „gleich“ — so wurde am 2026-10-20 aus 13+ still 9+.
    verfehlt = [f for f in ('ageRatingOverrideV2',)
                if f in ALTERSFREIGABE and nach.get(f) != ALTERSFREIGABE[f]]
    if verfehlt:
        print("\n✗ NICHT, WIE GEWOLLT: "
              + ', '.join(f"{f} steht bei Apple auf {nach.get(f)!r}, gewollt {ALTERSFREIGABE[f]!r}"
                          for f in verfehlt))
    else:
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
    if stufe not in STUFEN_AB_13:
        print("  ✗ Das ist UNTER 13+ — die App erlaubt ab 14. Der Override ist nicht angekommen.")
        sys.exit(1)
    if verfehlt:
        sys.exit(1)


# ═══════════════════════════════════════════════════════════════════════════════
#  Store-Bilder hochladen
#
#  🔴 Am 2026-09-26 gemessen: Bei Apple lag **kein einziges Bild**. In ACTA
#  (Projekt 17) lagen sie als DATEI im Ordner, im Plan stand „Screenshots fertig"
#  — und bei Apple war nichts. *Fertig als Datei ist nicht fertig bei Apple.*
#
#  Apples Upload ist DREISTUFIG, und nichts daran ist optional:
#    1. POST appScreenshots → Apple antwortet mit `uploadOperations`: fertigen
#       HTTP-Anweisungen (URL, Methode, Header, Byte-Bereich). Die URL zeigt NICHT
#       auf api.appstoreconnect.apple.com und bekommt KEINEN Authorization-Header
#       — der Zugang steckt schon in der signierten URL.
#    2. Die Bytes per PUT hinschieben.
#    3. PATCH uploaded=true + MD5. Ohne Schritt 3 bleibt das Bild in einem
#       Halb-Zustand: hochgeladen, aber nie abgenommen.
#
#  ⚠️ „Hochgeladen" und „von Apple ABGENOMMEN" sind zwei Zustände. Ein Bild im
#  falschen Format nimmt der PUT klaglos an und fällt erst im
#  `assetDeliveryState` auf.
SHOT_ORDNER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                           '..', '_FUER_IAN', 'App-Store-Screenshots')

# Die Reihenfolge im Store ist die Reihenfolge hier.
# ⚠️ Sie ist eine MARKETING-Entscheidung und gehört Ian (Projekt 34) — das hier
# ist die Folge, in der die Bilder entstanden sind, nicht sein Urteil darüber.
SHOT_REIHENFOLGE = [
    '01-stapel.png',    # der Wischstapel — was die App ist
    '04-match.png',     # „Ihr seid verabredet" — wofür sie da ist
    '02-posten.png',
    '03-anfragen.png',
    '05-chats.png',
    '06-chat.png',
    '07-profil.png',
    '08-gruppen.png',
]

# Apples 6,9"-Pflichtformat (1320×2868). Es läuft unter dem alten Schlüssel
# APP_IPHONE_67 — Apple hat den Namen nie nachgezogen, als 6,9" dazukam.
SHOT_TYP = 'APP_IPHONE_67'


def _put_roh(op, daten):
    """Ein `uploadOperation` ausführen. Bewusst OHNE Authorization-Header."""
    stueck = daten[op['offset']:op['offset'] + op['length']]
    req = urllib.request.Request(op['url'], data=stueck, method=op['method'])
    for h in op.get('requestHeaders', []):
        req.add_header(h['name'], h['value'])
    with urllib.request.urlopen(req) as r:
        return r.status


def screenshots(token, app, wirklich):
    """Die Bilder aus `_FUER_IAN/App-Store-Screenshots/` zu Apple schieben."""
    import hashlib
    v = offene_version(token, app)
    if not v:
        print("✗ Keine bearbeitbare Version.")
        return

    dateien = []
    fehlt = []
    for name in SHOT_REIHENFOLGE:
        p = os.path.normpath(os.path.join(SHOT_ORDNER, name))
        (dateien.append((name, p)) if os.path.exists(p) else fehlt.append(name))
    if fehlt:
        print(f"✗ Diese Bilder fehlen: {', '.join(fehlt)}")
        print("  → npm run store-bilder   (holt sie vom Simulator)")
        return

    # Die GRÖSSE vorher prüfen, nicht Apple entscheiden lassen: Ein falsches
    # Format fällt sonst erst nach dem Hochladen auf, im `assetDeliveryState`.
    import struct
    schlecht = []
    for name, p in dateien:
        with open(p, 'rb') as f:
            kopf = f.read(24)
        if kopf[:8] != b'\x89PNG\r\n\x1a\n':
            schlecht.append(f"{name}: kein PNG")
            continue
        breite, hoehe = struct.unpack('>II', kopf[16:24])
        if (breite, hoehe) != (1320, 2868):
            schlecht.append(f"{name}: {breite}×{hoehe}, Apple verlangt 1320×2868")
    if schlecht:
        print("✗ " + "\n✗ ".join(schlecht))
        return

    lokal = hole(f"appStoreVersions/{v['id']}/appStoreVersionLocalizations", token)['data']
    print(f"Version {v['attributes']['versionString']} · {len(dateien)} Bilder · "
          f"{len(lokal)} Sprache(n): {', '.join(l['attributes']['locale'] for l in lokal)}")

    if not wirklich:
        print("\n── Was geschickt würde ────────────────────────────────────────")
        for i, (name, p) in enumerate(dateien, 1):
            print(f"  {i}. {name:16} {os.path.getsize(p)//1024:4} KB  1320×2868 ✓")
        print("\n  Alle Grössen geprüft. Es ist NICHTS passiert. Schicken:")
        print("      npm run asc screenshots -- --wirklich")
        return

    for l in lokal:
        loc = l['attributes']['locale']
        print(f"\n{loc}:")
        # Vorhandenes Set wiederverwenden — sonst legt jeder Lauf ein zweites an.
        sets = hole(f"appStoreVersionLocalizations/{l['id']}/appScreenshotSets", token)['data']
        menge = next((s for s in sets
                      if s['attributes']['screenshotDisplayType'] == SHOT_TYP), None)
        if menge:
            print(f"  Set {SHOT_TYP} gibt es schon.")
        else:
            ok, r = sende('POST', 'appScreenshotSets',
                          {'data': {'type': 'appScreenshotSets',
                                    'attributes': {'screenshotDisplayType': SHOT_TYP},
                                    'relationships': {'appStoreVersionLocalization': {
                                        'data': {'type': 'appStoreVersionLocalizations',
                                                 'id': l['id']}}}}}, token)
            if not ok:
                print(f"  ✗ Set anlegen: {r}")
                continue
            menge = r['data']
            print(f"  Set {SHOT_TYP} angelegt.")

        drin = {s['attributes']['fileName']: s
                for s in hole(f"appScreenshotSets/{menge['id']}/appScreenshots", token)['data']}

        ids = []
        for name, pfad in dateien:
            fertig = (drin.get(name, {}).get('attributes', {})
                      .get('assetDeliveryState', {}) or {}).get('state')
            if name in drin and fertig == 'COMPLETE':
                print(f"  = {name} liegt schon da")
                ids.append(drin[name]['id'])
                continue
            roh = open(pfad, 'rb').read()
            ok, r = sende('POST', 'appScreenshots',
                          {'data': {'type': 'appScreenshots',
                                    'attributes': {'fileSize': len(roh), 'fileName': name},
                                    'relationships': {'appScreenshotSet': {
                                        'data': {'type': 'appScreenshotSets',
                                                 'id': menge['id']}}}}}, token)
            if not ok:
                print(f"  ✗ {name} anmelden: {r}")
                continue
            shot = r['data']
            try:
                for op in shot['attributes']['uploadOperations']:
                    _put_roh(op, roh)
            except urllib.error.HTTPError as e:
                print(f"  ✗ {name} hochschieben: HTTP {e.code}")
                continue
            ok, r = sende('PATCH', f"appScreenshots/{shot['id']}",
                          {'data': {'type': 'appScreenshots', 'id': shot['id'],
                                    'attributes': {'uploaded': True,
                                                   'sourceFileChecksum': hashlib.md5(roh).hexdigest()}}},
                          token)
            if not ok:
                print(f"  ✗ {name} abnehmen: {r}")
                continue
            print(f"  ✓ {name} ({len(roh)//1024} KB)")
            ids.append(shot['id'])

        # Reihenfolge festlegen — ohne das sortiert Apple nach EINGANG, und der
        # hängt bei einem Wiederholungslauf davon ab, was schon da war.
        if ids:
            ok, r = sende('PATCH', f"appScreenshotSets/{menge['id']}/relationships/appScreenshots",
                          {'data': [{'type': 'appScreenshots', 'id': i} for i in ids]}, token)
            print("  Reihenfolge gesetzt." if ok else f"  ⚠️ Reihenfolge: {r}")

        # Zurückfragen: „hochgeladen" ist nicht „angenommen".
        nach = hole(f"appScreenshotSets/{menge['id']}/appScreenshots", token)['data']
        kaputt = [s['attributes']['fileName'] for s in nach
                  if (s['attributes'].get('assetDeliveryState') or {}).get('errors')]
        print(f"  {len(nach)} Bilder im Set"
              + (f" · ⚠️ Fehler bei: {kaputt}" if kaputt else ""))


def metadaten(token, app, wirklich):
    """Die drei Felder, die aus dem CODE folgen — Kategorie, Werbe-ID, Inhaltsrechte.

    ── Warum genau diese drei und nicht mehr ──────────────────────────────────
    Sie sind keine Geschmacksfrage: Zwei folgen aus dem, was die App tut, und
    das dritte aus dem, was sie ist. Preis und Copyright stehen bewusst NICHT
    hier — das sind Geld und Recht und gehören Ian (und der Preis lässt sich mit
    diesem Schlüssel ohnehin nicht setzen, Apple antwortet mit FORBIDDEN).
    """
    v = offene_version(token, app)
    info = app_info(token, app)
    if not v or not info:
        print("✗ Keine bearbeitbare Version.")
        return

    prim, sek = kategorien(token, app)
    idfa = v['attributes'].get('usesIdfa')
    cr = hole(f"apps/{app['id']}", token)['data']['attributes'].get('contentRightsDeclaration')

    # Eine Treff-App für Wien mit Feed, Followern und Chat. Apples eigene
    # Beschreibung von SOCIAL_NETWORKING trifft das wörtlich; LIFESTYLE wäre die
    # Alternative und beschreibt eher Einrichtung, Mode und Essen.
    SOLL_KAT = 'SOCIAL_NETWORKING'
    # Es gibt kein Werbe-, Analyse- oder Absturzbericht-Paket unter den
    # Abhängigkeiten — `pruef-alter` misst das am `package.json` und wird rot,
    # sobald eines dazukommt. Dieselbe Tatsache trägt schon das Datenschutz-
    # Etikett und die Altersfreigabe.
    SOLL_IDFA = False
    # 🟢 BERICHTIGUNG 2026-09-28. Hier stand: „NICHT gesetzt, und das ist Absicht"
    # — weil es eine RECHTSfrage ist und keine Ableitung aus dem Code. Die
    # Einordnung war richtig und bleibt es; was fehlte, war Ians Antwort.
    #
    # **Ians Entscheidung 113 (2026-09-28): `USES_THIRD_PARTY_CONTENT`** — „ja,
    # und wir haben die Rechte". Vorgelegt mit beiden Lesarten:
    #
    #   dafür  Die Bezirksgrenzen sind Daten der Stadt Wien (CC BY 4.0, Nennung
    #          steht in Einstellungen → Rechtliches). Dazu alles, was Menschen
    #          selbst hochladen.
    #   dagegen Liest man Apples Frage eng (fremde Musik, Filme, Bilder aus dem
    #          Netz), hat die App davon nichts.
    #
    # Gewählt wurde die weite Lesart, aus demselben Grund wie beim Bezirk im
    # Datenschutz-Etikett (Entscheidung 78): **Untertreiben ist der Fehler, der
    # Apps aus dem Review wirft; übertreiben nicht.**
    #
    # ⚠️ Es bleibt eine Rechtsfrage — dieser Wert steht hier, weil Ian ihn
    # entschieden hat, NICHT weil das Skript ihn herleiten könnte. Wer die
    # Bezirksdaten austauscht oder die Nennung entfernt, fasst auch diese Zeile an.
    SOLL_RECHTE = 'USES_THIRD_PARTY_CONTENT'
    print("Stand bei Apple:")
    print(f"  Kategorie       {prim or '—'}{' + ' + sek if sek else ''}")
    print(f"  Werbe-ID (IDFA) {idfa!r}")
    print(f"  Inhaltsrechte   {cr or '—'}   [🧑 Rechtsfrage, gehört Ian]")

    tun = []
    if prim != SOLL_KAT:
        tun.append(('Kategorie', prim, SOLL_KAT))
    if idfa is not SOLL_IDFA:
        tun.append(('Werbe-ID', idfa, SOLL_IDFA))
    if cr != SOLL_RECHTE:
        tun.append(('Inhaltsrechte', cr, SOLL_RECHTE))
    if not tun:
        print("\n✓ Beides steht schon richtig.")
        return

    print("\n── Was geändert würde ─────────────────────────────────────────")
    for name, ist, soll in tun:
        print(f"  {name:12} {ist!r} → {soll!r}")
    if not wirklich:
        print("\n  Es ist NICHTS passiert. Schreiben:")
        print("      npm run asc metadaten -- --wirklich")
        return

    for name, _ist, soll in tun:
        if name == 'Kategorie':
            ok, r = sende('PATCH', f"appInfos/{info['id']}",
                          {'data': {'type': 'appInfos', 'id': info['id'],
                                    'relationships': {'primaryCategory': {
                                        'data': {'type': 'appCategories', 'id': soll}}}}}, token)
        elif name == 'Werbe-ID':
            ok, r = sende('PATCH', f"appStoreVersions/{v['id']}",
                          {'data': {'type': 'appStoreVersions', 'id': v['id'],
                                    'attributes': {'usesIdfa': soll}}}, token)
        elif name == 'Inhaltsrechte':
            # Hängt an der APP, nicht an der Version — wie `privacyPolicyUrl`.
            ok, r = sende('PATCH', f"apps/{app['id']}",
                          {'data': {'type': 'apps', 'id': app['id'],
                                    'attributes': {'contentRightsDeclaration': soll}}}, token)
        else:
            # 🔴 Hier stand bis zum 2026-09-28 ein blankes `else`, das für ALLES
            # ausser der Kategorie `usesIdfa` gesetzt hat. Das war richtig, solange
            # es genau zwei Fälle gab — und wäre beim dritten still falsch
            # gewesen: Der PATCH ginge durch und setzte die FALSCHE Eigenschaft.
            # *Ein `else` trägt die Annahme „alles Übrige ist der andere Fall".*
            raise SystemExit(f"✗ Unbekanntes Feld {name!r} in `tun` — "
                             f"kein Sendeweg dafür. Nichts weiter gesendet.")
        print(f"  {'✓' if ok else '✗'} {name}" + ('' if ok else f": {r}"))

    # Zurücklesen statt der Erfolgsmeldung glauben.
    prim2, _ = kategorien(token, app)
    idfa2 = offene_version(token, app)['attributes'].get('usesIdfa')
    cr2 = hole(f"apps/{app['id']}", token)['data']['attributes'].get('contentRightsDeclaration')
    print(f"\n  zurückgelesen: Kategorie {prim2} · Werbe-ID {idfa2!r} · Inhaltsrechte {cr2}")


# ── Die Store-Texte ───────────────────────────────────────────────────────────
#  Apples Grenzen. Ein Zeichen zu viel, und der PATCH scheitert mit einer Meldung,
#  die das Feld nicht nennt — deshalb wird VOR dem Senden gezählt.
TEXT_GRENZEN = {
    'subtitle': 30, 'keywords': 100, 'promotionalText': 170,
    'description': 4000, 'supportUrl': 255, 'privacyPolicyUrl': 255,
    'marketingUrl': 255, 'whatsNew': 4000, 'copyright': 200,
}

# Welches Feld bei Apple WO hängt. Das ist der Grund, warum `privacyPolicyUrl` bis
# zum 2026-09-28 niemandem gefehlt hat: Es liegt nicht an der Version, sondern an
# der App, und wer nur appStoreVersionLocalizations abfragt, sieht es nie.
FELD_ORT = {
    'description': 'version', 'keywords': 'version', 'promotionalText': 'version',
    'supportUrl': 'version', 'marketingUrl': 'version', 'whatsNew': 'version',
    'subtitle': 'info', 'privacyPolicyUrl': 'info',
    # Sonderfall: hängt weder an einer Übersetzung noch an der App, sondern an der
    # VERSION selbst — ein Feld, keine Liste. Es steht trotzdem hier und nicht in
    # `metadaten`, weil es eine ANGABE ist wie die Texte, keine Ableitung aus dem
    # Code. Wer es ändert, ändert, wer rechtlich hinter der App steht.
    'copyright': 'version_selbst',
}


def lies_storetexte(pfad='scripts/storetexte.md'):
    """Liest `storetexte.md`. Jede `## feld`-Überschrift ist ein Feld bei Apple.

    Die Datei ist bewusst Markdown und nicht Python: Der Text gehört Ian, und er
    muss ihn ändern können, ohne ein Skript anzufassen (dasselbe wie bei
    `pruefnotizen.md`). Kommentare `<!-- … -->` sind Notizen an ihn und gehen NICHT
    mit — sonst stünde die Begründung im App Store.
    """
    roh = open(pfad, encoding='utf-8').read()
    if '---' not in roh:
        raise SystemExit(f"✗ {pfad}: kein `---` — wo hört der Vorspann auf?")
    felder = {}
    for block in re.split(r'^## ', roh.split('---', 1)[1], flags=re.M)[1:]:
        name, _, rest = block.partition('\n')
        name = name.strip()
        text = re.sub(r'<!--.*?-->', '', rest, flags=re.S).strip()
        if name not in FELD_ORT:
            raise SystemExit(f"✗ {pfad}: `## {name}` kennt Apple nicht. "
                             f"Erlaubt: {', '.join(sorted(FELD_ORT))}")
        if not text:
            raise SystemExit(f"✗ {pfad}: `## {name}` ist leer.")
        felder[name] = text
    return felder


def url_lebt(url, timeout=20):
    """Antwortet die Adresse mit 200? Gibt (ok, auskunft) zurück.

    ⚠️ Das ist KEIN Luxus und keine Höflichkeit gegenüber Apple. Ein leeres Feld
    blockiert die Einreichung sofort und sichtbar; eine URL, die ins Leere zeigt,
    kommt durch JEDE Prüfung durch und fällt erst dem Reviewer auf — dann kostet
    sie eine Ablehnung und Tage. Guideline 1.5 nennt genau das.
    ⚠️ GitHub Pages braucht nach einem `git push` ein bis zwei Minuten. Ein 404
    heisst hier also entweder „nie hochgeladen" oder „gerade erst" — die Meldung
    sagt das, statt nur die Zahl zu drucken.
    """
    req = urllib.request.Request(url, method='GET', headers={'User-Agent': 'asc.py'})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            roh = r.read(4000).decode('utf-8', 'replace')
            # Eine Seite, die antwortet, aber die App als unfertig bezeichnet, ist
            # schlimmer als keine: Apple weist Apps zurück, die sich als Beta
            # ausgeben. Am 2026-09-14 stand genau dieser Satz schon einmal im JSX
            # der Nutzungsbedingungen.
            schlimm = [w for w in ('Prototyp', 'prototype', 'Beta-Version',
                                   'noch nicht öffentlich', 'coming soon')
                       if w.lower() in roh.lower()]
            if schlimm:
                return False, f"HTTP {r.status}, aber die Seite sagt {schlimm} — Apple liest das"
            return r.status == 200, f"HTTP {r.status}"
    except urllib.error.HTTPError as e:
        extra = " (frisch gepusht? GitHub Pages braucht 1–2 Minuten)" if e.code == 404 else ""
        return False, f"HTTP {e.code}{extra}"
    except Exception as e:
        return False, f"nicht erreichbar: {e}"


def build_anhaengen(token, app, wirklich):
    """Hängt den neuesten Build an die offene Version — mit dem Wächter, der zählt.

    ── Warum es diesen Befehl bis zum 2026-09-28 NICHT gab ───────────────────
    Hier stand: *„Zuständigkeit 🧑, obwohl ein PATCH das technisch könnte."* Der
    Grund war nicht die API, sondern der Zustand: Der jüngste Build war der vom
    14.09. und kannte die Entscheidungen 90–110 nicht. **Einen veralteten Build
    anzuhängen und „erledigt" zu melden ist genau der Fehler, den ACTAs
    `build-verknuepfen` schon einmal gemacht hat.**

    Die Bedingung ist seit Build 3 erfüllt — also gibt es den Befehl, aber mit dem
    Wächter, der die alte Sorge trägt statt sie zu vergessen.

    ── Der Wächter misst DREI Dinge, und nur das dritte ist scharf ───────────
      1. Ist es der höchste Build?   — verhindert den Griff zum falschen
      2. Ist er VALID?               — PROCESSING lässt sich nicht anhängen
      3. Ist er JÜNGER als der Quelltext?  ← der eigentliche Test

    ⚠️ **Punkt 3 ist der, den eine Nummer nie verrät.** Man kann bauen, danach am
    Code weiterarbeiten und den Build trotzdem anhängen — die Nummer ist dann immer
    noch die höchste, und der Build trägt den Code von vorher. Verglichen wird
    Apples `uploadedDate` mit der jüngsten Änderung in `src/`.
    """
    import datetime, pathlib

    v = offene_version(token, app)
    if not v:
        print("✗ Keine bearbeitbare Version.")
        return

    dran = hole(f"appStoreVersions/{v['id']}/build", token).get('data')
    builds = hole(f"builds?filter[app]={app['id']}&sort=-version&limit=5", token)['data']
    if not builds:
        print("✗ Bei Apple liegt gar kein Build.")
        return

    # Apple sortiert `version` als TEXT — "10" käme vor "9". Deshalb selbst
    # numerisch sortieren, sobald es zweistellig wird.
    def nr(b):
        try:    return int(b['attributes']['version'])
        except (TypeError, ValueError): return -1
    builds.sort(key=nr, reverse=True)
    neuster = builds[0]
    na = neuster['attributes']

    print(f"Version {v['attributes']['versionString']} "
          f"({v['attributes'].get('appVersionState')})")
    print(f"  Build daran:  {dran['attributes']['version'] if dran else 'KEINER'}")
    print(f"  Neuster Build: {na['version']} · {na.get('processingState')} "
          f"· hochgeladen {na.get('uploadedDate')}\n")

    # 🔴 Die Frische-Prüfung steht VOR der Abkürzung „hängt schon dran", und das
    # ist der Unterschied zwischen zwei Fragen:
    #
    #     „Muss ich etwas ändern?"   — darauf antwortet „hängt schon dran"
    #     „Ist der Zustand richtig?" — dafür ist dieser Befehl gebaut
    #
    # Am 2026-09-28 stand die Prüfung dahinter, und der Fall trat innerhalb einer
    # Stunde ein: Build 3 hing an der Version, danach wurde der rote Kasten aus
    # `Nutzungsbedingungen.tsx` entfernt — der angehängte Build war ab da veraltet,
    # und das Werkzeug meldete „Nichts zu tun". *Ein Wächter, der bei „nichts zu
    # tun" aufhört, ist keiner.*
    hoch = datetime.datetime.fromisoformat(na['uploadedDate'].replace('Z', '+00:00'))
    neuste_datei, neuste_zeit = None, 0.0
    for d in pathlib.Path('src').rglob('*'):
        if d.is_file() and d.suffix in ('.ts', '.tsx', '.js', '.jsx', '.json'):
            m = d.stat().st_mtime
            if m > neuste_zeit:
                neuste_zeit, neuste_datei = m, d
    quelle = datetime.datetime.fromtimestamp(neuste_zeit, datetime.timezone.utc)
    veraltet = quelle > hoch

    if dran and dran['id'] == neuster['id']:
        if not veraltet:
            print(f"✓ Build {na['version']} hängt an der Version und ist aktuell.")
            return
        minuten = (quelle - hoch).total_seconds() / 60
        print(f"⚠️  Build {na['version']} hängt an der Version — aber er ist VERALTET.")
        print(f"    {neuste_datei} wurde {minuten:.0f} Minuten NACH dem Bauen geändert.")
        print(f"    Quelltext: {quelle.astimezone():%Y-%m-%d %H:%M} · "
              f"Build: {hoch.astimezone():%Y-%m-%d %H:%M}")
        print("\n    Einreichen würde eine App verschicken, die diesen Stand nicht hat.")
        print("    → npm run testflight   (baut neu), danach diesen Befehl nochmal.")
        return

    # ── Wächter 2: VALID? ────────────────────────────────────────────────────
    if na.get('processingState') != 'VALID':
        print(f"✗ Build {na['version']} ist {na.get('processingState')}, nicht VALID.")
        print("  Apple verarbeitet ihn noch (5–30 Min). Später nochmal.")
        return

    # ── Wächter 3: trägt er den Code von heute? ──────────────────────────────
    print(f"  Quelltext zuletzt geändert: {quelle.astimezone():%Y-%m-%d %H:%M} "
          f"({neuste_datei})")
    print(f"  Build hochgeladen:          {hoch.astimezone():%Y-%m-%d %H:%M}")

    if veraltet:
        minuten = (quelle - hoch).total_seconds() / 60
        print(f"\n✗ Der Quelltext ist {minuten:.0f} Minuten JÜNGER als der Build.")
        print(f"  {neuste_datei} wurde nach dem Bauen geändert — dieser Build trägt")
        print("  diese Änderung NICHT. Anhängen würde eine App einreichen, die es")
        print("  so nirgends gibt.")
        print("\n  Entweder neu bauen (npm run testflight) oder, wenn die Änderung")
        print("  egal ist (z.B. nur ein Kommentar), mit --trotzdem anhängen.")
        if '--trotzdem' not in sys.argv:
            return
        print("\n  ⚠️ --trotzdem gesetzt — es wird angehängt.")
    else:
        print(f"  ✓ Der Build ist jünger als der Quelltext.")

    if not wirklich:
        print(f"\nTROCKENLAUF. Es würde Build {na['version']} an Version "
              f"{v['attributes']['versionString']} gehängt.")
        print("  Senden:  npm run asc build-anhaengen -- --wirklich")
        return

    ok, r = sende('PATCH', f"appStoreVersions/{v['id']}/relationships/build",
                  {'data': {'type': 'builds', 'id': neuster['id']}}, token)
    if not ok:
        print(f"\n✗ Apple sagt nein:\n{r}")
        return

    # Zurückfragen statt dem 204 glauben — dieselbe Regel wie bei den Screenshots:
    # „geschickt" ist nicht „angekommen".
    nach = hole(f"appStoreVersions/{v['id']}/build", token).get('data')
    if nach and nach['id'] == neuster['id']:
        print(f"\n✓ Build {na['version']} hängt jetzt an Version "
              f"{v['attributes']['versionString']}.")
        print("  Gegenprobe: npm run asc einreichbereit")
    else:
        print(f"\n⚠️ PATCH ging durch, aber die Rückfrage zeigt: "
              f"{nach['attributes']['version'] if nach else 'KEINER'}")


def texte(token, app, wirklich):
    """Schickt die Store-Texte aus `storetexte.md` zu Apple.

    ── Warum dieser Befehl zwei Ressourcen anfasst ────────────────────────────
    Apple verteilt die Texte auf zwei Stellen, und das ist keine Kleinigkeit:

        appStoreVersionLocalizations   description, keywords, supportUrl, …
                                       hängt an DIESER Version
        appInfoLocalizations           subtitle, privacyPolicyUrl
                                       hängt an der APP, überlebt jede Version

    Wer nur die erste kennt, hält `privacyPolicyUrl` für gesetzt, weil er es nie
    abgefragt hat. Genau so stand es hier bis zum 2026-09-28 (siehe
    `einreichbereit`).
    """
    v = offene_version(token, app)
    info = app_info(token, app)
    if not v or not info:
        print("✗ Keine bearbeitbare Version.")
        return

    felder = lies_storetexte()

    # ── Vorprüfung 1: die Längen ──────────────────────────────────────────────
    print("Längen:")
    zu_lang = []
    for name, text in sorted(felder.items()):
        g = TEXT_GRENZEN[name]
        ok = len(text) <= g
        print(f"  {'✓' if ok else '✗'} {name:<18} {len(text):>5} / {g}")
        if not ok:
            zu_lang.append(name)
    if zu_lang:
        print(f"\n✗ Zu lang: {zu_lang}. Apple nennt im Fehler das Feld NICHT — "
              f"deshalb hört es hier auf.")
        return

    # ── Vorprüfung 2: leben die Adressen? ─────────────────────────────────────
    urls = {n: t for n, t in felder.items() if t.startswith('http')}
    if urls:
        print("\nAdressen:")
        tot = []
        for name, u in sorted(urls.items()):
            ok, auskunft = url_lebt(u)
            print(f"  {'✓' if ok else '✗'} {name:<18} {auskunft}  {u}")
            if not ok:
                tot.append(name)
        if tot:
            print(f"\n✗ {tot} antwortet nicht. NICHTS wurde gesendet.")
            print("  Eine tote Adresse im Store-Eintrag ist schlimmer als ein leeres")
            print("  Feld: Sie kommt durch jede Prüfung und fällt erst dem Reviewer auf.")
            return

    # ── Senden ────────────────────────────────────────────────────────────────
    vl = hole(f"appStoreVersions/{v['id']}/appStoreVersionLocalizations", token)['data']
    il = hole(f"appInfos/{info['id']}/appInfoLocalizations", token)['data']
    ziele = {'version': vl, 'info': il}
    typ = {'version': 'appStoreVersionLocalizations', 'info': 'appInfoLocalizations'}

    print()
    if not wirklich:
        print("TROCKENLAUF — es wird nichts geschrieben. Mit `-- --wirklich` senden.\n")

    # Das Copyright sitzt an der Version selbst, nicht an einer Übersetzung.
    if 'copyright' in felder:
        ist = v['attributes'].get('copyright')
        soll = felder['copyright']
        if ist == soll:
            print(f"  = copyright: steht schon auf {soll!r}")
        else:
            print(f"  {'→' if wirklich else '·'} copyright  "
                  f"{ist or 'leer'} → {soll!r}")
            if wirklich:
                ok, r = sende('PATCH', f"appStoreVersions/{v['id']}",
                              {'data': {'type': 'appStoreVersions', 'id': v['id'],
                                        'attributes': {'copyright': soll}}}, token)
                print(f"    {'✓ gesetzt' if ok else '✗ ' + str(r)}")

    for ort in ('version', 'info'):
        meine = {n: t for n, t in felder.items() if FELD_ORT[n] == ort}
        if not meine:
            continue
        for lokal in ziele[ort]:
            loc = lokal['attributes']['locale']
            aenderungen = {n: t for n, t in meine.items()
                           if (lokal['attributes'].get(n) or '') != t}
            if not aenderungen:
                print(f"  = {loc} ({ort}): steht schon so")
                continue
            for n in sorted(aenderungen):
                vorher = lokal['attributes'].get(n)
                kurz = (aenderungen[n][:60] + '…') if len(aenderungen[n]) > 60 else aenderungen[n]
                print(f"  {'→' if wirklich else '·'} {loc} {n:<18} "
                      f"{'leer' if not vorher else str(len(vorher)) + ' Zeichen'} → {kurz!r}")
            if wirklich:
                ok, r = sende('PATCH', f"{typ[ort]}/{lokal['id']}",
                              {'data': {'type': typ[ort], 'id': lokal['id'],
                                        'attributes': aenderungen}}, token)
                print(f"    {'✓ gesetzt' if ok else '✗ ' + str(r)}")

    if wirklich:
        print("\nGegenprobe: `npm run asc einreichbereit`")
    else:
        print("\nNichts geschrieben. Zum Senden:  npm run asc texte -- --wirklich")


def pruefnotizen(token, app, wirklich):
    """Die Prüfnotizen zu Apple schreiben — der Text steht in `pruefnotizen.md`.

    ── 🔴 Warum das eine eigene Sache ist ──────────────────────────────────────
    Am 2026-09-26 war `notes` an Version 1.0 **leer**. Genau das hat ACTA
    (Projekt 17) eine ganze Prüfrunde gekostet: Apples erste Antwort war kein
    Mangel an der App, sondern die Erstentwickler-Routine „Information Needed" —
    Zweck, Zielgruppe, Zugang, Video. Was von Anfang an in den Notizen steht,
    muss nicht erfragt werden.

    Der Text liegt NICHT hier im Code, sondern in `scripts/pruefnotizen.md`:
    Er ist Prosa für einen Menschen, und Prosa in einem String-Literal wird nicht
    gelesen, sondern überblättert. Der HTML-Kommentar am Kopf der Datei erklärt
    ihn und wird nicht mitgeschickt.

    ⚠️ Das Feld hängt an der VERSION, nicht an der App — eine neue Version
    startet ohne Notizen.
    """
    quelle = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pruefnotizen.md')
    if not os.path.exists(quelle):
        print(f"✗ {quelle} fehlt — ohne Text nichts zu schreiben.")
        return
    with open(quelle, encoding='utf-8') as f:
        roh = f.read()
    # Der erklärende HTML-Kommentar gehört uns, nicht Apple.
    text = re.sub(r'<!--.*?-->', '', roh, flags=re.S).strip()

    v = offene_version(token, app)
    if not v:
        print("✗ Keine bearbeitbare Version.")
        return
    rd = hole(f"appStoreVersions/{v['id']}/appStoreReviewDetail", token).get('data')
    if not rd:
        print("✗ Es gibt noch keinen Prüfinfo-Datensatz an dieser Version.")
        print("  Der entsteht, sobald Kontakt und Demo-Zugang eingetragen sind.")
        return
    vorher = rd['attributes'].get('notes') or ''

    # ⚠️ Apples Feld ist auf 4000 Zeichen begrenzt. Ein zu langer Text wird nicht
    # gekürzt, sondern ABGELEHNT — und die Meldung nennt die Zahl nicht.
    print(f"Version {v['attributes']['versionString']} · Prüfnotizen")
    print(f"  bisher: {len(vorher)} Zeichen" + ("" if vorher else "  ← LEER"))
    print(f"  neu:    {len(text)} Zeichen"
          + ("  ⚠️ ÜBER 4000, Apple lehnt das ab" if len(text) > 4000 else "  (Grenze 4000)"))

    if not wirklich:
        print("\n── Was geschickt würde ────────────────────────────────────────")
        for z in text.splitlines()[:14]:
            print(f"  {z}")
        print(f"  … ({len(text.splitlines())} Zeilen insgesamt, ganz in "
              f"scripts/pruefnotizen.md)")
        print("\n  Es ist NICHTS passiert. Schreiben:")
        print("      npm run asc pruefnotizen -- --wirklich")
        return
    if len(text) > 4000:
        print("✗ Zu lang. Nicht geschickt.")
        return

    ok, r = sende('PATCH', f"appStoreReviewDetails/{rd['id']}",
                  {'data': {'type': 'appStoreReviewDetails', 'id': rd['id'],
                            'attributes': {'notes': text}}}, token)
    if not ok:
        print(f"✗ Apple sagt nein:\n{r}")
        return
    # Zurücklesen statt der Erfolgsmeldung glauben.
    nach = hole(f"appStoreVersions/{v['id']}/appStoreReviewDetail",
                token)['data']['attributes'].get('notes') or ''
    if nach.strip() == text.strip():
        print(f"✓ Geschrieben und zurückgelesen: {len(nach)} Zeichen.")
    else:
        print(f"⚠️ Zurückgelesen stehen {len(nach)} Zeichen da, geschickt waren "
              f"{len(text)}. In App Store Connect nachsehen.")


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

    # ⚠️ SCHREIBT ebenfalls — und in ACTA ist genau dieser Befehl einmal als
    # „liest nur" missverstanden worden. Deshalb derselbe Riegel.
    if len(sys.argv) > 1 and sys.argv[1] == 'pruefnotizen':
        print()
        pruefnotizen(t, app, '--wirklich' in sys.argv)
        return

    if len(sys.argv) > 1 and sys.argv[1] == 'texte':
        print()
        texte(t, app, '--wirklich' in sys.argv)
        return

    if len(sys.argv) > 1 and sys.argv[1] == 'build-anhaengen':
        print()
        build_anhaengen(t, app, '--wirklich' in sys.argv)
        return

    if len(sys.argv) > 1 and sys.argv[1] == 'screenshots':
        print()
        screenshots(t, app, '--wirklich' in sys.argv)
        return

    if len(sys.argv) > 1 and sys.argv[1] == 'metadaten':
        print()
        metadaten(t, app, '--wirklich' in sys.argv)
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
