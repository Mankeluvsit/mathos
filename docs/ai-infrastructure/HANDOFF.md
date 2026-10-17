# OpenCode infrastructure handoff — PR #5 historical record

## Reconciliation with current development

Imported locally from PR #5, branch `chore/opencode-infrastructure-handoff`, commit `3388e3529f5b477b2ad92c287d78859b5a9f67d0`. The report below records that branch's acceptance test and older main baseline. Current owner instructions authorize continuing organism/learning work; the old Phase2 approval warning below is historical, not a new restriction.

Start with root [RESUME.md](../../RESUME.md), [HANDOFF.md](../../HANDOFF.md) and [current state](../handoff/STATE.md). The current local working copy has connected v3 learning and143 passing tests, while PR #4 contains the published v2/handoff baseline. Neither PR has been merged. Keep the acceptance report's83-test result separate from the newer code's evidence.

OpenCode 2.0.22 was reported working on the owner's Bazzite setup; the existing project's optional launcher/parser checks target1.19.2. Do not downgrade a working owner installation or assume these clients/configurations are interchangeable. The exact PR #5 configuration is preserved under `.opencode/compatibility/opencode2-infrastructure.json` as a reference, not an enabled profile. Root configuration was not overwritten. A consolidated v2 migration still needs real-client verification.

## Historical authority
Repository: Mankeluvsit/mathos. Read AGENTS.md, docs/specification.md, and docs/capability-status.md first. Infrastructure review branch: `chore/opencode-infrastructure-handoff`.

## Verified project state (2026-10-16)
Phase 0 and Phase 1 are merged into main. Phase 1 substrate implementation was merged in PR #3; the acceptance tester verified its ancestry and presence in main. PR #4 (`codex/integrated-life-baseline`, organism evolution) remains open and unapproved. Do not merge PR #4 or begin Phase 2 implementation without explicit approval.

## OpenCode acceptance test (user-supplied, 2026-10-16)
- OpenCode v2.0.22 loaded project config and discovered the reviewer agent and mathos-handoff skill.
- Node v24.22.0, npm, Git and authenticated gh CLI available on Bazzite.
- `npm run check` passed: lint, typecheck, 83 tests, production build.
- Playwright MCP was available through the user's **global** OpenCode configuration, not this repository. Browser inspection exercised a 64×64 seeded substrate, simulation progression, and mobile layout without retained source changes.
- BrowserOS Neo and local MCP Sandbox were unavailable at the time; neither blocks Mathos development.
- The user's local provider/model catalog was enumerated, but individual model execution was not verified by this acceptance test.

## Infrastructure boundaries
This repository deliberately does not include credentials or enable remote MCP servers. A fresh clone needs local OpenCode provider authentication and optional browser tooling setup. See README.md and capabilities.md in this directory.

## Continuation
Fix any new diagnostic issues before merging infrastructure PR #5. Confirm PR and branch state afresh before development. Preserve offline/local-first application behavior. Never commit secrets or merge without explicit approval.
