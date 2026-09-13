#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════════
  DAS APPLE-GEHEIMNIS ERZEUGEN — Phase 20.3-b2
  Aufruf:  python3 scripts/apple-secret.py [--tage N]
═══════════════════════════════════════════════════════════════════════════════

── Was hier eigentlich passiert, und warum es nicht offensichtlich ist ────────
Apple gibt einem eine Datei (`AuthKey_F2M3N3K9M5.p8`) und nennt sie „private
key". Als GEHEIMNIS für Supabase taugt sie nicht: Apple will kein Schlüsselfile,
sondern ein kurzlebiges Token, das MIT diesem Schlüssel unterschrieben ist. Die
Datei ist der Stempel, nicht das Dokument.

Das ist die Stelle, an der man ohne Not stundenlang sucht: Trägt man den Inhalt
der .p8 dort ein, wo ein Token hingehört, meldet Apple beim ersten Anmeldeversuch
`invalid_client` — eine Meldung, die nach einer falschen Client-ID klingt und
nicht nach einem falschen Geheimnis.

── Die vier Angaben und woher sie kommen ─────────────────────────────────────
  iss  Team-ID        5TQTMP2L2H   — steht auch in `project.pbxproj` als
                                     DEVELOPMENT_TEAM (gemessen, nicht getippt)
  kid  Key-ID         F2M3N3K9M5   — steht im Dateinamen der .p8
  sub  Client-ID      at.simplysocial.app
  aud  immer          https://appleid.apple.com

── Warum es ABLÄUFT, und was daran wichtig ist ───────────────────────────────
Apple lässt höchstens **sechs Monate** zu (15 777 000 Sekunden) und weist ein
Token mit längerer Laufzeit rundheraus ab. Das heißt: Dieses Geheimnis ist
nichts, was man einmal einträgt und vergisst — es MUSS erneuert werden, sonst
steht eines Tages „Anmelden mit Apple" da und tut nichts. Dieselbe Sorte Falle
wie das 7-Tage-Profil vom 2026-09-07: `BUILD SUCCEEDED`, und trotzdem tot.
Deshalb schreibt das Skript das Ablaufdatum ausdrücklich hin, statt es zu
verschweigen.

Die .p8 selbst wird NICHT ausgegeben und wandert nirgendwohin — sie bleibt in
~/.simplysocial/ (Rechte 600) und wird hier nur zum Unterschreiben gelesen.
"""
import argparse
import datetime as dt
import pathlib
import sys

try:
    import jwt
except ImportError:
    sys.exit("✗ PyJWT fehlt:  python3 -m pip install pyjwt cryptography")

TEAM_ID = "5TQTMP2L2H"
KEY_ID = "F2M3N3K9M5"
CLIENT_ID = "at.simplysocial.app"
SCHLUESSEL = pathlib.Path.home() / ".simplysocial" / f"AuthKey_{KEY_ID}.p8"
APPLE_MAX_TAGE = 180  # Apples Grenze: 6 Monate. Mehr wird abgewiesen.

p = argparse.ArgumentParser()
p.add_argument("--tage", type=int, default=APPLE_MAX_TAGE)
p.add_argument("--client-id", default=CLIENT_ID)
p.add_argument("--nur-datum", action="store_true", help="nur das Ablaufdatum melden")
a = p.parse_args()

if a.tage > APPLE_MAX_TAGE:
    sys.exit(f"✗ {a.tage} Tage — Apple lässt höchstens {APPLE_MAX_TAGE} zu und weist mehr ab.")
if not SCHLUESSEL.is_file():
    sys.exit(f"✗ Der Apple-Schlüssel fehlt: {SCHLUESSEL}")

jetzt = dt.datetime.now(dt.timezone.utc)
ende = jetzt + dt.timedelta(days=a.tage)

if a.nur_datum:
    print(ende.strftime("%Y-%m-%d"))
    sys.exit(0)

geheimnis = jwt.encode(
    {
        "iss": TEAM_ID,
        "iat": int(jetzt.timestamp()),
        "exp": int(ende.timestamp()),
        "aud": "https://appleid.apple.com",
        "sub": a.client_id,
    },
    SCHLUESSEL.read_text(),
    algorithm="ES256",
    headers={"kid": KEY_ID},
)

# Gegenprobe im selben Lauf: Was gerade unterschrieben wurde, wird sofort wieder
# geprüft. Ein Geheimnis, das man nur ERZEUGT, ist eine Behauptung — und der
# Fehler fiele sonst erst bei Apple auf, mit `invalid_client`.
from cryptography.hazmat.primitives import serialization  # noqa: E402

oeffentlich = (
    serialization.load_pem_private_key(SCHLUESSEL.read_bytes(), password=None)
    .public_key()
    .public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
)
jwt.decode(geheimnis, oeffentlich, algorithms=["ES256"], audience="https://appleid.apple.com")

print(geheimnis)
print(f"# gültig bis {ende:%Y-%m-%d %H:%M} UTC ({a.tage} Tage)", file=sys.stderr)
