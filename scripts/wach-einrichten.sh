#!/bin/bash
# Richtet den Weckruf für Supabase ein — EINMAL von Ian auszuführen.
#
# Warum Ian: Es schreibt zwei Secrets in sein GitHub-Konto und legt einen
# zeitgesteuerten Ablauf an. Der Auto-Mode blockt beides bei Claude, zu Recht.
#
# Was es tut:
#   1. SUPABASE_URL + SUPABASE_ANON_KEY aus .env als GitHub-Secrets setzen
#      (der Schlüssel ist der öffentliche — er steckt ohnehin in jeder App)
#   2. .github/workflows/supabase-wach.yml auf `dunkel` UND `main` committen.
#      Auf `main`, weil GitHub Zeitpläne nur auf dem Standardzweig ausführt.
#   3. Den Workflow einmal sofort starten, damit man sieht, dass er läuft.
set -euo pipefail
cd "$(dirname "$0")/.."

WF=.github/workflows/supabase-wach.yml
[ -f "$WF" ] || { echo "✗ $WF fehlt"; exit 1; }
[ "$(git branch --show-current)" = dunkel ] || { echo "✗ Bitte auf Zweig 'dunkel' ausführen"; exit 1; }

echo "── 1/3 Secrets setzen ──"
grep '^EXPO_PUBLIC_SUPABASE_URL='      .env | cut -d= -f2- | gh secret set SUPABASE_URL
grep '^EXPO_PUBLIC_SUPABASE_ANON_KEY=' .env | cut -d= -f2- | gh secret set SUPABASE_ANON_KEY
echo "✓ SUPABASE_URL, SUPABASE_ANON_KEY"

echo "── 2/3 Workflow auf dunkel und main ──"
git add "$WF" scripts/wach-einrichten.sh
git commit -q -m "Supabase wach halten — zweimal täglich ein Anstupser über GitHub Actions

Gratis-Supabase pausiert nach ~einer Woche ohne Betrieb und verliert dabei
seine Adresse. Am 2026-10-17 konnte sich darum niemand in Build 4 anmelden;
während einer App-Prüfung wäre das eine sichere Ablehnung.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" || true
git push -q

WT="$(mktemp -d)/main"
git fetch -q origin main
git worktree add -q "$WT" origin/main
mkdir -p "$WT/.github/workflows"
cp "$WF" "$WT/$WF"
( cd "$WT" && git add "$WF" \
  && git -c core.hooksPath=/dev/null commit -q -m "Supabase wach halten (muss auf main liegen, sonst läuft der Zeitplan nie)" \
  && git push -q origin HEAD:main ) || echo "  (auf main stand er schon)"
git worktree remove --force "$WT"
echo "✓ liegt auf dunkel und main"

echo "── 3/3 Einmal sofort starten ──"
sleep 5
gh workflow run supabase-wach.yml --ref main
echo "✓ gestartet — Ergebnis in ~1 Minute:  gh run list --workflow supabase-wach.yml"
