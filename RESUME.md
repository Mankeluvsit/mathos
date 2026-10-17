# Resume MATHOS here


Latest completed unit: corrected the phone playback/organization experience. Shared playback dock, Activity highlights wording, World/Organism/Results/Setup, map-first view and grouped setup are saved and live. Read STATE.md for source/deployment/CI evidence; do not restart learning or change model rules.

MATHOS is mid-development. Read [AGENTS.md](AGENTS.md), [current state](docs/handoff/STATE.md), then [task cards](docs/handoff/NEXT.md). Clean-machine setup: [Bazzite/macOS/Linux/Windows](docs/handoff/SETUP.md). Continuation choices: [HANDOFF.md](HANDOFF.md).

- **Live review:** [Open MATHOS](https://mankeluvsit.github.io/mathos/?v=mobile4). Ecology-reference@3, learning on, Terminal glyphs by default; Classic cells remains available. Press **Start world** to watch, or **One step** to inspect a single decision. On phone, use World / Organism / Results / Setup; playback stays reachable in every view. Activity highlights is cosmetic and never starts the world.
- **Application source:** `2ef4ed50021bc0a52aaed01e1e1f16f5d3f9373a`, on `codex/integrated-life-baseline`, [PR #4](https://github.com/Mankeluvsit/mathos/pull/4), still open/unmerged. `main` lacks current organism work. Subsequent documentation-only commits need not redeploy this identical application revision.
- **Preview deployment:** `c5616fbb9672158d80e5dea1d1a2e8f16c28616f` on `gh-pages`; preview.json records the application source and artifact hashes. Public Chromium checks passed, including clean source provenance, real learning updates, Node replay agreement, appearance isolation, reduced motion and320/390px layouts; no external runtime requests. Public Firefox was blocked by workspace certificate trust (`SEC_ERROR_UNKNOWN_ISSUER`); full local Firefox workflows passed.
- **Implemented:** whole-body turning, functional organs, three inherited body plans, reproduction/mutation/death/lineage, bounded lifetime learning with newborn reset, learning on/off, readable diagnostics, cancellable six-seed paired comparisons, original terminal role glyphs and optional actual-observation activity cues. V1/v2 remain replayable.
- **Evidence:**150 tests/17 files, lint/types/build, three independent Python references, all old/new goldens and complete Chromium/Firefox workflows passed locally. [Checks and limitations](docs/handoff/STATE.md). Prior milestone CI passed on Linux/macOS/Windows; the current phone-correction source CI is running at this snapshot. Check the linked run in STATE before claiming its final status. First12-run comparison was mixed, with no parameter tuning or general-improvement claim.
- **Delivery authorization (2026-10-17):** Routine plan → implement → verify → self-review → commit/push → existing-preview update → live verification → handoff refresh is authorized. Do not repeatedly ask to publish within the approved scope. Stop for a real blocker, new cost, destructive action or change of direction. Never merge automatically. Keep one writer; no automatic subagents or paid fallback.
- **Not complete:** arbitrary anatomy, predation, spontaneous primordial life, general editable rules, true multi-scale scheduling, workers, resumable checkpoints, installed offline caching and open-ended autonomous research.

Continue in Codex or OpenCode with the same written state and loop. Only one environment edits at a time. Fetch current GitHub source before switching machines; handoff files do not synchronize uncommitted work. Bazzite/free no-personal-key model route is documented. Pinned OpenCode1.19.2 parser passed; the owner's2.0.22 installation is reported separately, not independently validated here. Focus on MATHOS rather than restarting tooling research.

PR #5 additive infrastructure files are preserved without replacing root config. PR #6 remains an unmerged parallel shadow-only implementation with failing final dashboard checks; do not overwrite connected v3 with it. [Reconciliation](docs/handoff/CONVERSATION-RECONCILIATION.md).

First actions:

```sh
git status --short
git log -5 --oneline
npm run verify
```

Resume NEXT.md after inspecting actual local/remote state. Preserve the mixed scientific results and v1/v2 replay; do not restart L3 or silently retune the reward. Update this file and STATE after every unit, interruption or blocker.
