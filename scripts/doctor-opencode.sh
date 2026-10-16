#!/usr/bin/env bash
set -uo pipefail
cd "$(dirname "$0")/.." || exit 2
state="${XDG_STATE_HOME:-$HOME/.local/state}/mathos"
mkdir -p "$state" || exit 2
log="$state/opencode-doctor-$(date +%Y%m%d-%H%M%S).log"
failed=0
{
 echo "=== MATHOS OPENCODE DOCTOR ==="
 date
 echo "Repository: $(pwd)"
 for cmd in git node npm opencode gh; do
   if command -v "$cmd" >/dev/null 2>&1; then
     echo "PASS $cmd: $(command -v "$cmd")"
   else
     echo "FAIL missing $cmd"
     failed=1
   fi
 done
 if command -v node >/dev/null 2>&1; then
   version="$(node -v 2>&1)"
   echo "Node version: $version"
   if [[ "$version" == v24.* ]]; then echo "PASS Node.js 24"; else echo "FAIL expected Node.js 24"; failed=1; fi
 fi
 if command -v git >/dev/null 2>&1; then
   git status --short --branch 2>&1 || { echo "FAIL git status"; failed=1; }
 fi
 for file in AGENTS.md opencode.json .opencode/agents/reviewer.md .opencode/skills/mathos-handoff/SKILL.md package-lock.json; do
   if [[ -f "$file" ]]; then echo "PASS file $file"; else echo "FAIL missing file $file"; failed=1; fi
 done
 if command -v node >/dev/null 2>&1 && [[ -f opencode.json ]]; then
   if node -e 'JSON.parse(require("fs").readFileSync("opencode.json","utf8"))' 2>&1; then
     echo "PASS opencode.json JSON syntax"
   else
     echo "FAIL opencode.json JSON syntax"
     failed=1
   fi
 fi
 echo "Note: Prerequisite checks do not prove agent, MCP or provider functionality."
 echo "RESULT: $([[ $failed -eq 0 ]] && echo PASS || echo FAIL)"
} 2>&1 | tee "$log"
# wl-copy forks by default; avoid holding non-interactive tool sessions open.
if command -v wl-copy >/dev/null 2>&1; then
  wl-copy --foreground < "$log" >/dev/null 2>&1 &
  clipboard_pid=$!
  sleep 0.2
  if kill -0 "$clipboard_pid" 2>/dev/null; then
    echo "Clipboard handoff started (Wayland)."
  else
    echo "Clipboard transfer ended; report remains on disk."
  fi
elif command -v xclip >/dev/null 2>&1; then
  xclip -selection clipboard < "$log" >/dev/null 2>&1 && echo "Clipboard handoff started (X11)." || true
else
  echo "Clipboard tool unavailable."
fi
echo "Report: $log"
exit "$failed"
