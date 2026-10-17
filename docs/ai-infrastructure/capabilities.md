# PR #5 capability map — historical scope

This table records PR #5 configuration scope. The owner-supplied acceptance report subsequently verified discovery on OpenCode 2.0.22 and project checks on its 83-test main baseline; it did not verify model inference. For the current integrated code and 143-test evidence, use [root handoff](../../HANDOFF.md) and [current verification](../handoff/VERIFICATION.md).

| Capability | OpenCode path | Status |
| --- | --- | --- |
| Project instructions | Root AGENTS.md and opencode.json instructions | Configured; local discovery unverified |
| Code editing | Native OpenCode tools | Available upstream; local verification pending |
| Specialized review | .opencode/agents/reviewer.md | Configured; local verification pending |
| Reusable handoff workflow | .opencode/skills/mathos-handoff/SKILL.md | Configured; local verification pending |
| GitHub operations | Local git and optional authenticated gh CLI | Not provisioned by this repo |
| Browser tests | Existing Playwright scripts via npm run test:browser | Repository workflow; local execution pending |
| MCP tools | OpenCode mcp configuration | No servers enabled; needs explicit selection |
| Model provider | User's local OpenCode authentication/configuration | Not provisioned; no shared credentials |
| Session continuity | Versioned docs and git history | Documented; does not transfer conversation history |
| Verification | scripts/doctor-opencode.sh and existing project checks | Diagnostic script provided; execution pending |

Do not describe functional parity as verified until the actual OpenCode instance has executed representative tasks. Document missing tools and alternative implementations before enabling integrations.
