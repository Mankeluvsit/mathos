#!/usr/bin/env bash
set -uo pipefail
cd "$(dirname "$0")/.."
mkdir -p "${XDG_STATE_HOME:-$HOME/.local/state}/mathos"
log="${XDG_STATE_HOME:-$HOME/.local/state}/mathos/opencode-doctor-$(date +%Y%m%d-%H%M%S).log"
{
 echo "=== MATHOS OPENCODE DOCTOR ==="
 date
 echo "Repository: $(pwd)"
 for cmd in git node npm opencode gh xclip wl-copy; do
   if command -v "$cmd" >/dev/null 2>&1; then
     echo "PASS $cmd: $(command -v "$cmd")"
   else
     echo "MISSING $cmd"
   fi
 done
 if command -v node >/dev/null 2>&1; then
   version="$(node -v)"
   echo "Node version: $version"
   [[ "$version" == v24.* ]] && echo "PASS Node.js 24" || echo "WARN expected Node.js 24"
 fi
 git status --short --branch 2>&1 || true
 for file in AGENTS.md opencode.json .opencode/agents/reviewer.md .opencode/skills/mathos-handoff/SKILL.md package-lock.json; do
   [[ -f "$file" ]] && echo "PASS file $file" || echo "MISSING file $file"
 done
 if command -v node >/dev/null 2>&1; then
   node -e 'JSON.parse(require("fs").readFileSync("opencode.json","utf8")); console.log("PASS opencode.json JSON syntax")' 2>&1 || true
 fi
 echo "Note: This is a non-destructive prerequisite check, not proof of OpenCode tool integration."
} 2>&1 | tee "$log"
if command -v wl-copy >/dev/null 2>&1; then
  wl-copy < "$log" && echo "Report copied to Wayland clipboard."
elif command -v xclip >/dev/null 2>&1; then
  xclip -selection clipboard < "$log" && echo "Report copied to X11 clipboard."
else
  echo "Clipboard tool unavailable. Report saved: $log"
fi
echo "Report: $log"
