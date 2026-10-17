# Current development state

> Current delivery policy (2026-10-17): The owner authorized autonomous routine delivery on 2026-10-17: plan → implement → verify → self-review → commit/push to the existing review branch → update the existing preview → verify the live result → refresh handoff. This supersedes earlier local-only/review-before-publication wording. Do not ask again for routine publication within the approved scope. Stop for a real blocker, a change of direction, new cost or destructive action. Never merge automatically. Keep one writer; no automatic delegation or paid model fallback.

Snapshot date: 2026-10-17. This file is repository memory, not a claim of project completion. Check the actual branch and remote before continuing.

## Current published checkpoint

- Application source: `d7b631a5f0cf331cdd3d8b6b0fe7ff44e473a942` on `codex/integrated-life-baseline`, [PR #4](https://github.com/Mankeluvsit/mathos/pull/4), open and unmerged.
- [Live MATHOS](https://mankeluvsit.github.io/mathos/?v=learning-terminal3), deployment `088a87b58d1600cc1f2888e1986a7f7f98effeae` on gh-pages. Public preview.json and every current asset SHA256 match the clean source build. Older hashed assets are retained for cached HTML.
- Public Chromium verification passed:20 actual learning updates, Node lineage replay agreement, Classic/Terminal observation equality, cancelled comparison export with source revision/dirty=false, reduced motion,320/390px navigation and zero external runtime requests. Public Firefox navigation is blocked by this workspace's certificate trust (`SEC_ERROR_UNKNOWN_ISSUER`); TLS checks were not bypassed. Full local Firefox tests passed separately.
- Complete local gate passed149 tests/17 files, lint/types/build, three independent Python references, v1/v2/v3 goldens and all Chromium/Firefox workflows. Expanded heading glyph checks passed both browsers. Actual pinned OpenCode1.19.2 parser and handoff checks passed after policy changes. Self-review, not a second model review.
- Remote CI passed all three jobs (Linux, macOS, Windows) for both the [application source d7b631a](https://github.com/Mankeluvsit/mathos/actions/runs/38998336843) and [workflow/configuration follow-up315beab](https://github.com/Mankeluvsit/mathos/actions/runs/38998550830). Each complete gate includes149 tests, build, independent references, all Chromium/Firefox workflows, handoff checks and actual OpenCode parsing. This final evidence checkpoint changes documentation only; it does not change the deployed application. PR #4 remains unmerged. Future docs-only commits can leave the application serving the precisely identified source above.
- `main` remains Phase1 (`070eefe`); PR #5/#6 are preserved unchanged and unmerged. The active source is PR #4, not main.
- Next action: inspect any current owner visual feedback, then continue the next bounded roadmap unit under standing delivery authorization. No further publication approval is needed. Visual feedback may guide refinement, but routine delivery is not blocked on another permission question.

## Historical preparation evidence

The sections below retain development chronology. References to local-only work, publication pending, old source1fd0802 or v2 Pages describe earlier checkpoints, not the current delivery policy or live build.

## Owner decisions and communication

GitHub is source of truth; keep docs/tests/code together. The owner approved bounded continuation after turning and requested this handoff while work remains active. They chose **Bazzite Linux**, **free models available through OpenCode with no personal API key**, and **autonomous routine implementation, verification and publication to the existing review branch/preview**. No paid provider enrollment or subscription upgrade is authorized. The owner wants to continue in ChatGPT/Codex while keeping this handoff current for OpenCode. Usage screenshots and later reset reports are private, point-in-time evidence; do not store personal meter values in the repository or infer a live allowance. The account tier is still unconfirmed.

Speak plainly and give frequent progress updates. A source branch is work in progress; a PR is a review proposal; a merge adopts it. The owner should not need Git expertise or a chat-history reconstruction to continue. No automatic merge. The original request explicitly authorizes committing this handoff package to the repository; routine feature publication now follows the standing authorization above; no automatic merges.

## Delivered project

| Area | Implemented boundary |
| --- | --- |
| Foundation | Strict TS/React/Vite, dark accessible baseline dashboard, small validated settings, JSON/localStorage, CI |
| Mathematical reference | Versioned seeded Uint16 transport, fixed ticks, exact conservation, independent Python fixtures |
| Earlier life | Bounded connected growth/reproduction/mutation, fixed growth gate, three-seed comparison; preserved under technical labs |
| Ecology v1 | Observable foraging/food/functional three-cell bodies and inheritance; original sliding orientation retained for replay |
| Ecology v2 public preview | Actual cardinal whole-body turns, motor-funded forward travel, rotated mouths/front sensing, dart/grazer/scout plans, resource-funded growth, mutation/death/lineage and real histories |
| Ecology v3 local default | Bounded within-life learning, fresh children, separate streams, readable reward/action diagnostics, on/off settings and cancellable six-seed comparisons |
| User inspection | Heading, plan, decisions, traits, family path, counts/history, export of sampled observations, mobile follow/magnification/fixed playback |
| Handoff increment | OpenCode config/agents/skill/commands, OS setup, one verification entrypoint, key-free model launcher, v2 six-seed measurement baseline |

Unimplemented: arbitrary anatomy, predation, spontaneous primordial life, general editable universe rules, true slower-scale scheduling, workers/GPU compute, large-data IndexedDB/checkpoints, full autonomous ecology research, installed offline caching. Primordial currently means a food/resource-only start. “Evolution” is a bounded experiment, not proof of open-ended adaptation.

## Invariants and decisions that matter

- Existing model semantics are in ADRs 0004–0009. ADR0010 separately defines the new learning controller and implemented local v3 lifecycle. V1/v2 fixtures and formats remain replayable; unknown versions reject without migration.
- Ecology v2: fixed 64×48 closed grid; 48 living organisms, 256 lineage entries, 1,600 ticks, 81 history samples, 40 recent events. Integer seeded transitions; ordered-ID conflict bias explicitly disclosed.
- Same heading transform drives occupancy/turn sweeps, mouth/sensor geometry, movement, placement, render, selection and camera. A developed motor is required for both turns and translation; juveniles cannot turn to avoid upkeep/energy bugs.
- Ledger: supplied initial resources + sunlight = food + stored energy + 8×body cells + dissipated. No hidden resource generation; no wall time or `Math.random()` in transitions.
- Runtime owns live state, returns deep snapshots, pauses hidden tabs, guards stale callbacks, handles StrictMode attach/detach, max four ticks and measured 8 ms batch budget. Individual ticks are not preemptible.
- Browser definitions restart at tick 0, observation exports do not resume. Separate storage keys v1/v2/v3; corrupt data never silently replaced. Camera/zoom/rate/mobile tabs do not change the scientific result.
- Owner review requires recognizable behavior, not passing numbers alone. Never claim Life Engine/Bibites parity or intelligence from this baseline.

## Current visual unit: Cogmind-inspired pixel life

Owner requested research into Cogmind colors/animations and a translation into MATHOS. Read primary developer sources and inspected actual GIF frame sequences. Implemented original role glyphs and near-black/green world, static selection brackets, Classic/Terminal view selector,96-cue/180ms activity overlays derived from observed changes, motion-off and live OS reduced-motion support. Canvas geometry still comes from cellParts; scientific engines, resources and RNG are unchanged.

Files: rendering/ecology-terminal.ts; EcosystemCanvas/legend view wiring; CSS; six activity tests; browser-terminal.mjs. Native captures and a four-second real playback GIF are under docs/previews/terminal. Reference Cogmind assets remain outside source. Research/design rationale: docs/visual-direction-cogmind.md.

Verification complete:149 tests/17 files, lint/types/build, three independent Python references, v1/v2/v3 ecology goldens and the full Chromium156/Firefox157 workflows passed. An additional geometry check verified every role glyph in all four headings without world mutation, in both browsers. Handoff links, diff whitespace and actual OpenCode1.19.2 parsing also passed. Six new activity tests cover observation-derived cues and boundedness. No numerical engine files changed in this visual unit. Logs are saved under ignored .artifacts/terminal-*.log; no new remote CI or owner-device run is claimed. The optional movie export uses local ffmpeg only; app and normal CI do not need it. Source/Pages publication is now explicitly authorized; delivery is in progress. Earlier publication restrictions below are historical and superseded by the current policy.

Next exact action: publish the verified source, rebuild from its clean revision, update the existing preview and verify the live result; keep PR #4 unmerged. Preserve all connected learning and PR #5/#6 reconciliation work. No scientific parameter tuning or OpenCode research is part of this visual unit.

## Completed local learning unit (L3–L6 implementation; publication pending)

- Task: connect the tested controller to actual organisms, readable UI, frozen treatment and paired comparisons, as explicitly requested by the owner.
- Starting published source remains `1fd0802`; preserve all local L1/L2/continuation work. No source or preview publication yet.
- Implemented locally: new learning-model.ts v3 lifecycle, strict schema/example/slot/dispatch, copied diagnostics/observations, learning panel and settings, six-seed paired runner with cancellation/export and source provenance. Default local browser experience is now v3 learning on; v1/v2 remain selectable.
- Verification: full `npm run verify` passed 143 tests/16 files, lint/types/build, three independent Python references, v1/v2/v3 goldens and all Chromium156/Firefox157 workflows. OpenCode 1.19.2 parser and handoff checks passed. First declared12-run comparison completed with exact accounting; mixed outcomes, no tuning or improvement claim.
- Review: separate self-review; no second agent/model. Initial legacy browser canvas click failed because switching models scrolled it outside the visible area; the corrected interaction passed both browsers. Actual captures reviewed. Final UI layout/progress refinements passed a fresh 143-test check/build plus old/new ecology browser reruns in Chromium and Firefox. Logs: .artifacts/connected-learning-* when captured below.
- Next action: present this verified result and request owner approval to publish source and the preview. GitHub/Pages remain unchanged. Review package: docs/learning-verification.md and docs/previews/learning/README.md; handoff/specifications synchronized.

## Resumption: additional GitHub work reconciled

Fresh fetch found PR #5, `chore/opencode-infrastructure-handoff` at `3388e3529f5b477b2ad92c287d78859b5a9f67d0`, based on main `070eefe`. PR #4 is still open at `1fd0802`; main and gh-pages have not advanced. No new simulation code was present in PR #5.

Preserved its diagnostic script, reviewer agent, handoff skill and infrastructure documents locally. Kept the original config under `.opencode/compatibility/opencode2-infrastructure.json`; did not overwrite root config. Added cross-links and historical-scope notices so its 83-test baseline and old Phase2 restriction do not supersede the owner's current learning authorization. No remote branch was rewritten or merged.

The PR #5 report says OpenCode 2.0.22/Node 24.22.0 worked on Bazzite. Treat that as a supplied acceptance report. An independent npm probe here returned ETARGET for opencode-ai@2.0.22; v2 configuration/model execution is therefore not independently validated. Current1.19.2 compatibility checks remain the verified route; SETUP.md offers an isolated invocation rather than replacing the owner's global client. No hosted inference was attempted or paid provider enabled.

Reconciliation checks passed: strengthened OpenCode 1.19.2 parser assertions loaded all three profiles, four agents (including the imported reviewer), four commands and both skills. Lint, handoff link checks, bash syntax and git diff whitespace checks passed. Script syntax checked with bash -n, without running its clipboard operation. No simulation files changed during this resumption, so the completed143-test/build/browser evidence remains applicable.

## Parallel conversation reviewed (2026-10-17)

Owner supplied the shared conversation linked in [reconciliation](CONVERSATION-RECONCILIATION.md). Read the actual user messages and final development state, then inspected PR #6 at83a7c52. It independently adds overlapping ADR/controller/tests and an observational shadow-learning UI. That demo does not control organism actions. Its final CI run38995882716 fails existing app queries because two buttons are named One step; earlier green reports refer to earlier revisions.

No PR #6 code was copied over the tested local v3 build, and no remote branch/PR was merged, closed or reset. Preserve both histories. The current owner direction is MATHOS development here with mathematical experiments modular, two-way handoffs, brief understandable updates and a visual review. OpenCode capability research remains deferred. Publication approval for the prepared source/preview is still pending; do not infer it merely from the shared conversation's quoted history.

## Published milestone evidence

Simulation milestone evidence: [turning verification](../turning-body-verification.md), [desktop/phone captures](../previews/turning/README.md), and [passing source19a CI](https://github.com/Mankeluvsit/mathos/actions/runs/38838617859). It had 122 tests. The published measurement addition brought the passing count to **125**; the complete local gate and OpenCode configuration checks passed. See [handoff verification](VERIFICATION.md) for exact scope and CI links.

Published task completed at `1fd0802`: **H0 handoff + L0 baseline measurements**. Inputs: repository documents/code, user history and current GitHub/Pages state, official OpenCode 1.19.2 source/docs, Bazzite/Distrobox docs, free-model catalog. Allowed edits: handoff/config/development scripts/tests, documentation/status and CI; new independent measurement helper. Existing simulation transitions and UI unchanged.

Done-criteria: documented three-OS setup with Bazzite first; real OpenCode format and loaded agents/commands/skill; no-key zero-price model route; exact verification loop; short resume; current state and next cards; personal unknowns consolidated once; bounded reproducible measurements; old tests/replay/build/browser gates retained; source committed to GitHub with evidence and no merge.

Remaining access limits: hosted free inference probe from this workspace returned HTTP 403, despite models listing as free and the provider's documented anonymous path. This is not a successful model session and does not establish access on the owner's machine. Actual Bazzite host/GPU, macOS/Windows installer dialogs and local-model inference are unavailable here. Record CI OS execution separately from owner-device testing. Optional local Qwen profile is configured, not quality-certified.

## Historical delivery action (now completed)

Publish [terminal animation/captures](../previews/terminal/README.md), [visual research](../visual-direction-cogmind.md) and [connected learning evidence](../learning-verification.md) with their tested implementation. The owner has now authorized autonomous routine publication. Rebuild the clean committed revision, update the existing Pages preview, verify live assets/browser behavior and record source/deployment/CI evidence here. Keep PR #4 unmerged. Do not restart L3 or silently tune the parameters.

Before ending a future unit, replace this unit section with actual branch/commit, changed files, commands/results, review findings, blocker or next step. Keep the invariant/owner-decision sections stable unless evidence or explicit owner instruction changes them.
