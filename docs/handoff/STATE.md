# Current development state

Snapshot date: 2026-10-16. This file is repository memory, not a claim of project completion. Check the actual branch and remote before continuing.

## Authoritative locations

- Repository: [Mankeluvsit/mathos](https://github.com/Mankeluvsit/mathos).
- Latest simulation source before this handoff: `19a52a124a615b51611c4af4acbd6550058c22fd`, on `codex/integrated-life-baseline`, [PR #4](https://github.com/Mankeluvsit/mathos/pull/4), **open and unmerged** when inspected.
- `main`: `070eefec4a62ad600dac76af7e969b121c11e261`, merged Phase 1. PRs #1/#3 merged; #2 superseded. `main` is not the full current organism experience.
- Static preview: [Pages](https://mankeluvsit.github.io/mathos/?v=turning2), `gh-pages` deployment `8f378cf2963cce47f673d80b72c1d8aef7074db4`, serving source `19a52a1`. Development-tool additions do not alter that build.
- Handoff working branch in preparation workspace: `codex/opencode-handoff`; target publication is the existing PR #4 source branch. Resolve the latest handoff commit with `git log -1 --format=fuller`; a file cannot contain the hash of its own commit.

## Owner decisions and communication

GitHub is source of truth; keep docs/tests/code together. The owner approved bounded continuation after turning and requested this handoff while work remains active. They chose **Bazzite Linux**, **free models available through OpenCode with no personal API key**, and **automatic local work, review before publishing**. No paid provider enrollment or subscription upgrade is authorized. ChatGPT shows a warning that they will hit a limit, with no numerical limit supplied; plan/reset/time/remaining allowance are unknown. Do not invent them.

Speak plainly and give frequent progress updates. A source branch is work in progress; a PR is a review proposal; a merge adopts it. The owner should not need Git expertise or a chat-history reconstruction to continue. No automatic merge. The original request explicitly authorizes committing this handoff package to the repository; future feature publication uses the newly chosen review gate.

## Delivered project

| Area | Implemented boundary |
| --- | --- |
| Foundation | Strict TS/React/Vite, dark accessible baseline dashboard, small validated settings, JSON/localStorage, CI |
| Mathematical reference | Versioned seeded Uint16 transport, fixed ticks, exact conservation, independent Python fixtures |
| Earlier life | Bounded connected growth/reproduction/mutation, fixed growth gate, three-seed comparison; preserved under technical labs |
| Ecology v1 | Observable foraging/food/functional three-cell bodies and inheritance; original sliding orientation retained for replay |
| Ecology v2 default | Actual cardinal whole-body turns, motor-funded forward travel, rotated mouths/front sensing, dart/grazer/scout plans, resource-funded growth, mutation/death/lineage and real histories |
| User inspection | Heading, plan, decisions, traits, family path, counts/history, export of sampled observations, mobile follow/magnification/fixed playback |
| Handoff increment | OpenCode config/agents/skill/commands, OS setup, one verification entrypoint, key-free model launcher, v2 six-seed measurement baseline |

Unimplemented: lifetime learning, arbitrary anatomy, predation, spontaneous primordial life, general editable universe rules, true slower-scale scheduling, workers/GPU compute, large-data IndexedDB/checkpoints, full autonomous ecology research, installed offline caching. Primordial currently means a food/resource-only start. “Evolution” is a bounded experiment, not proof of open-ended adaptation.

## Invariants and decisions that matter

- Model semantics in ADRs 0004–0009; next learning decision must be separate. V1/v2 fixtures and formats remain replayable; unknown versions reject without migration.
- Ecology v2: fixed 64×48 closed grid; 48 living organisms, 256 lineage entries, 1,600 ticks, 81 history samples, 40 recent events. Integer seeded transitions; ordered-ID conflict bias explicitly disclosed.
- Same heading transform drives occupancy/turn sweeps, mouth/sensor geometry, movement, placement, render, selection and camera. A developed motor is required for both turns and translation; juveniles cannot turn to avoid upkeep/energy bugs.
- Ledger: supplied initial resources + sunlight = food + stored energy + 8×body cells + dissipated. No hidden resource generation; no wall time or `Math.random()` in transitions.
- Runtime owns live state, returns deep snapshots, pauses hidden tabs, guards stale callbacks, handles StrictMode attach/detach, max four ticks and measured 8 ms batch budget. Individual ticks are not preemptible.
- Browser definitions restart at tick 0, observation exports do not resume. Separate storage keys v1/v2; corrupt data never silently replaced. Camera/zoom/rate/mobile tabs do not change the scientific result.
- Owner review requires recognizable behavior, not passing numbers alone. Never claim Life Engine/Bibites parity or intelligence from this baseline.

## Evidence and current unit

Simulation milestone evidence: [turning verification](../turning-body-verification.md), [desktop/phone captures](../previews/turning/README.md), and [passing source19a CI](https://github.com/Mankeluvsit/mathos/actions/runs/38838617859). It had 122 tests. The current measurement addition brings the passing local count to **125**; the complete local gate and OpenCode configuration checks passed. See [handoff verification](VERIFICATION.md) for exact scope and CI links.

Task: **H0 handoff + L0 baseline measurements**. Inputs: repository documents/code, user history and current GitHub/Pages state, official OpenCode 1.19.2 source/docs, Bazzite/Distrobox docs, free-model catalog. Allowed edits: handoff/config/development scripts/tests, documentation/status and CI; new independent measurement helper. Existing simulation transitions and UI unchanged.

Done-criteria: documented three-OS setup with Bazzite first; real OpenCode format and loaded agents/commands/skill; no-key zero-price model route; exact verification loop; short resume; current state and next cards; personal unknowns consolidated once; bounded reproducible measurements; old tests/replay/build/browser gates retained; source committed to GitHub with evidence and no merge.

Remaining access limits: hosted free inference probe from this workspace returned HTTP 403, despite models listing as free and the provider's documented anonymous path. This is not a successful model session and does not establish access on the owner's machine. Actual Bazzite host/GPU, macOS/Windows installer dialogs and local-model inference are unavailable here. Record CI OS execution separately from owner-device testing. Optional local Qwen profile is configured, not quality-certified.

## Next exact action

After a clean local setup and passing `npm run verify`, run `/mathos-unit L1` to finalize the learning contract using [NEXT.md](NEXT.md). L0's measurement script is ready; scientific results stay under ignored `.artifacts/`. Do not claim lifetime learning is already working or promote the draft algorithm to an implemented capability.

Before ending a future unit, replace this unit section with actual branch/commit, changed files, commands/results, review findings, blocker or next step. Keep the invariant/owner-decision sections stable unless evidence or explicit owner instruction changes them.
