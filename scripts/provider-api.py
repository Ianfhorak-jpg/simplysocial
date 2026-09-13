#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════════
  APPLE UND GOOGLE EINTRAGEN — ohne einen einzigen Klick (Phase 20.3-b2)
  Aufruf:  npm run provider-api        (vorher: npm run mgmt-token)
═══════════════════════════════════════════════════════════════════════════════

── Warum es das neben `provider-einrichten.sh` gibt ──────────────────────────
Das ältere Skript führt Feld für Feld durchs Dashboard und ist gut darin. Es
setzt nur voraus, dass man die richtige Seite findet — und genau daran ist es
zweimal gescheitert: *Authentication → Emails* und *Authentication → Sign In*
liegen nebeneinander, und die Mail-Vorlagen hatte Ian vorher schon bearbeitet.
Ein Weg, der zwanzig Klicks an einer verwechselbaren Stelle verlangt, ist nicht
dadurch besser, dass die Zwischenablage mithilft.

── Der Entwurf: erst NACHSEHEN, dann eintragen ───────────────────────────────
Die Feldnamen der Management-API werden **nicht geraten**. Das Skript holt die
Konfiguration zuerst ab und trägt nur ein, was es dort wirklich vorfindet. Wer
`external_apple_secret` blind schickt, bekommt entweder ein stilles Ignorieren
oder einen 400, der nicht sagt, welches Feld gemeint war — dieselbe Familie wie
„eine Nachbildung, die vom Original abweicht, prüft die Nachbildung".

── Und danach wird GEMESSEN, nicht „fertig" gemeldet ─────────────────────────
Die Antwort der API ist nur die Zusage, dass sie es entgegengenommen hat.
Geprüft wird an der Stelle, an der die APP nachsieht: `/auth/v1/settings` mit
dem anon key — dieselbe Abfrage, mit der am 13.09. `apple: false` gemessen
wurde. (Die Lehre vom 2026-09-11: `BUILD SUCCEEDED` beantwortet eine andere
Frage als die, wegen der man gebaut hat.)

── Was hier NIE ausgegeben wird ──────────────────────────────────────────────
Der Management-Token, das Google-Geheimnis und das Apple-Token. Supabase
spiegelt Werte in Fehlermeldungen zurück; jede Ausgabe läuft deshalb durch
`ohne_geheimnisse()` — dasselbe Muster wie der Filter in `db-url.sh`.
"""
import json
import pathlib
import subprocess
import sys
import urllib.error
import urllib.request

REF = "iwvakdbefwpshzhlhmgj"
ORDNER = pathlib.Path.home() / ".simplysocial"
API = f"https://api.supabase.com/v1/projects/{REF}/config/auth"

BUNDLE = "at.simplysocial.app"

GEHEIM: list[str] = []


def ohne_geheimnisse(text: str) -> str:
    """Ersetzt jeden bekannten Geheimwert — unabhängig von seiner LÄNGE.

    Wer hier einen Wert ergänzt, der geheim ist, muss ihn auch in `GEHEIM`
    eintragen; eine Heuristik („lange Zeichenketten sind Geheimnisse") ist
    genau der Fehler, der am 2026-09-13 passiert ist.
    """
    for g in sorted(GEHEIM, key=len, reverse=True):
        if g:
            text = text.replace(g, "«geheim»")
    return text


def lies(name: str, pflicht: bool = True) -> str:
    p = ORDNER / name
    if not p.is_file() or p.stat().st_size == 0:
        if pflicht:
            sys.exit(f"✗ Fehlt: {p}")
        return ""
    return p.read_text().strip()


def ruf(methode: str, daten: dict | None = None) -> dict:
    rumpf = json.dumps(daten).encode() if daten is not None else None
    anfrage = urllib.request.Request(API, data=rumpf, method=methode)
    anfrage.add_header("Authorization", f"Bearer {TOKEN}")
    anfrage.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(anfrage, timeout=30) as antwort:
            return json.loads(antwort.read())
    except urllib.error.HTTPError as e:
        text = ohne_geheimnisse(e.read().decode(errors="replace"))[:400]
        sys.exit(f"✗ Supabase antwortet mit HTTP {e.code}\n  {text}")
    except urllib.error.URLError as e:
        sys.exit(f"✗ Keine Verbindung zu api.supabase.com: {e.reason}")


# ── Die Zugänge ─────────────────────────────────────────────────────────────
TOKEN = lies("mgmt-token")
GEHEIM.append(TOKEN)
GOOGLE_SECRET = lies("google-client-secret")
GOOGLE_WEB = lies("google-web-client-id")
GOOGLE_IOS = lies("google-ios-client-id", pflicht=False)
GEHEIM.append(GOOGLE_SECRET)

apple_secret = subprocess.run(
    [sys.executable, str(pathlib.Path(__file__).with_name("apple-secret.py"))],
    capture_output=True, text=True,
)
if apple_secret.returncode != 0:
    sys.exit(f"✗ Apple-Geheimnis konnte nicht erzeugt werden:\n{apple_secret.stderr.strip()}")
APPLE_SECRET = apple_secret.stdout.strip()
GEHEIM.append(APPLE_SECRET)
print(f"✓ Apple-Geheimnis erzeugt — {apple_secret.stderr.strip().lstrip('# ')}")

if not GOOGLE_IOS:
    print("⚠️  Die iOS-Client-ID von Google fehlt. Ohne sie weist Supabase die")
    print("    Anmeldung AUS DER IPHONE-APP ab — im Browser fiele es nicht auf.")

# ── 1. Nachsehen, wie die Felder wirklich heißen ────────────────────────────
print("\n── 1. Was steht heute da? ──")
jetzt = ruf("GET")
vorher = {k: v for k, v in jetzt.items() if k.startswith(("external_apple", "external_google"))}
for k in sorted(vorher):
    wert = vorher[k]
    if isinstance(wert, str) and wert:
        wert = f"«{len(wert)} Zeichen»"
    print(f"    {k:45} {wert}")
if not vorher:
    sys.exit("✗ Die Konfiguration nennt kein einziges external_apple/google-Feld.\n"
             "  Dann hat sich die API geändert — hier nichts raten, erst nachlesen.")

# ── 2. Nur eintragen, was es wirklich gibt ──────────────────────────────────
# Apple: Die Anmeldung am iPhone trägt als Empfänger die BUNDLE-ID, nicht eine
# Services-ID. Steht sie nicht in der Liste, weist Supabase das Token als
# "falscher Empfänger" ab — und die Meldung nennt weder Feld noch Grund.
gewuenscht = {
    "external_apple_enabled": True,
    "external_apple_client_id": BUNDLE,
    "external_apple_secret": APPLE_SECRET,
    "external_google_enabled": True,
    "external_google_client_id": GOOGLE_WEB,
    "external_google_secret": GOOGLE_SECRET,
    "external_google_additional_client_ids": GOOGLE_IOS,
}
patch = {k: v for k, v in gewuenscht.items() if k in jetzt}
uebrig = [k for k in gewuenscht if k not in jetzt]
if uebrig:
    print("\n  ⚠️  Diese Felder kennt die API nicht und werden NICHT geschickt:")
    for k in uebrig:
        print(f"       {k}")

print("\n── 2. Eintragen ──")
for k in sorted(patch):
    # `ohne_geheimnisse()` und NICHT die Länge. Die erste Fassung fragte
    # `len(v) > 40` — und genau daran ist am 2026-09-13 das Google-Geheimnis auf
    # dem Bildschirm gelandet: Es ist 35 Zeichen lang. **Länge ist keine
    # Geheimhaltung.** Es gab die Filterfunktion längst, sie wurde an der einen
    # Stelle nicht benutzt, an der es darauf ankam.
    print(f"    {k:45} {ohne_geheimnisse(str(patch[k]))}")
ruf("PATCH", patch)
print("  ✓ von der Management-API angenommen")

# ── 3. Messen — dort, wo die APP nachsieht ──────────────────────────────────
# **Und mit Geduld.** Die API nimmt den PATCH sofort an; GoTrue liest seine
# Einstellungen aber erst ein paar Sekunden später neu. Der erste Lauf am
# 2026-09-13 meldete deshalb "✗ Nicht alles steht", während alles stand —
# eine Prüfung, die zu früh fragt, ist keine Prüfung, sondern ein Fehlalarm.
# Und ein Fehlalarm an dieser Stelle ist teuer: Er schickt jemanden zurück ins
# Dashboard, um etwas zu reparieren, das gar nicht kaputt ist.
import time  # noqa: E402

print("\n── 3. Nachgemessen an /auth/v1/settings (wie die App) ──")
env = pathlib.Path(__file__).resolve().parents[1] / ".env"
anon = ""
for zeile in env.read_text().splitlines():
    if zeile.startswith("EXPO_PUBLIC_SUPABASE_ANON_KEY="):
        anon = zeile.split("=", 1)[1].strip()
url = f"https://{REF}.supabase.co/auth/v1/settings"


def settings() -> dict:
    a = urllib.request.Request(url)
    a.add_header("apikey", anon)
    with urllib.request.urlopen(a, timeout=25) as antwort:
        return json.loads(antwort.read())["external"]


WARTE = [0, 3, 5, 8, 12]  # Sekunden; gemessen kam es beim zweiten Anlauf
extern: dict = {}
for i, pause in enumerate(WARTE):
    if pause:
        print(f"    … noch nicht übernommen, {pause}s warten")
        time.sleep(pause)
    extern = settings()
    if extern.get("apple") is True and extern.get("google") is True:
        break

fehler = 0
for name in ("apple", "google", "email"):
    gut = extern.get(name) is True
    print(f"    {'✓' if gut else '✗'} {name}: {extern.get(name)}")
    if not gut:
        fehler += 1

print()
if fehler:
    sys.exit(
        "✗ Nach " + str(sum(WARTE)) + "s steht es immer noch nicht.\n"
        "  Die Felder unter 1. und 2. zeigen, was angekommen ist — wenn dort\n"
        "  enabled=True steht, ist es eingetragen und nur die Auskunft hinkt."
    )
print("✓ Apple, Google und E-Mail stehen — gemessen, nicht geglaubt.")
print("\n  Der Management-Token wird jetzt nicht mehr gebraucht. Widerrufen:")
print("  https://supabase.com/dashboard/account/tokens → Revoke")
