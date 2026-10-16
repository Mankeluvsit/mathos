# Mathos development handoff

## Authority
Repository: Mankeluvsit/mathos. Read AGENTS.md and docs/specification.md first. The current branch for infrastructure review is `chore/opencode-infrastructure-handoff`.

## Last known project state
Documentation on the default branch reports Phase 0 merged, with Phase 1 deterministic substrate and dark dashboard work on a review branch. Confirm current PR/merge status before asserting that these features are in main. Phases 2–6 remain planned per docs/roadmap.md.

## Infrastructure changes proposed
- OpenCode project configuration, no provider credentials and no pre-enabled MCP services.
- Read-only reviewer agent and reusable handoff skill.
- Setup guidance, capability matrix and a diagnostic script.

## Verification needed on Bazzite
- OpenCode installed and can load project instructions, reviewer agent and skill.
- Model provider authentication works for the chosen provider.
- Node.js 24, npm, git, and optionally gh and Playwright browser dependencies available.
- npm ci, npm run check, browser checks and optional benchmarks pass.
- GitHub permissions permit branch and PR workflows.

## Continuation
Do not implement Phase 2 until approved. Inspect open PRs and status before modifying simulation code. Keep Mathos application offline/local-first. Never commit secrets, merge without approval, or equate configuration presence with verified tool functionality.
