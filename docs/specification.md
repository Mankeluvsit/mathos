# MATHOS master specification

Status: authoritative product direction; Phase 1 merged, integrated experimental baseline on the review branch. Requirements below are planned unless identified as implemented in `capability-status.md`. Changes are reviewed in GitHub pull requests.

## Purpose

Provide a local browser laboratory for exploring mathematics, configurable universes, and artificial life at pixel resolution. Support understandable, reproducible experiments without requiring accounts, servers, external APIs, or cloud compute. Favor simplicity, accessibility, modularity, and maintainability over premature performance infrastructure.

## Product requirements

| ID | Requirement | Phase |
| --- | --- | --- |
| FND-01 | TypeScript, React, Vite, native rendering, local configuration persistence, portable JSON | 0 |
| FND-02 | Authoritative specifications, persistent agent instructions, automated checks and CI | 0 |
| LIFE-01 | Pixel-addressable spatial universe with explicit, versioned rules | 1–2 |
| LIFE-02 | Primordial genesis from environmental substrates and seeded genesis from authored organisms | 2 |
| SCALE-01 | Pixel, organism, and ecosystem scales with explicit coupling and scheduling | 3 |
| EVO-01 | Heritable variation, reproduction, selection, and lineage tracking | 4 |
| MORPH-01 | Genome/development rules produce and change spatial organism structure | 4 |
| LEARN-01 | Local neural controllers learn during organism lifetimes | 5 |
| EXP-01 | Autonomous bounded experiment batches, comparisons, provenance, and local results | 6 |
| MATH-01 | Mathematical views of fields, functions, state, and experiment metrics | 1–6 |

Primordial and seeded describe genesis methods, not random-number seed handling: both require an explicit random seed. Primordial emergence is an experimental possibility, not a promised outcome. Neural learning and evolutionary inheritance are separate mechanisms.

## Cross-cutting requirements

- Core use must work without remote services. Installation and optional static hosting are separate from application runtime.
- Essential controls and results must be accessible through semantic HTML and text, not Canvas alone. Target WCAG 2.2 AA; verify incrementally and do not claim certification.
- Future runs use fixed ticks, explicit seeds, ordered updates, and versioned rules. Rendering speed must not change results.
- Invalid or excessive inputs must fail clearly and leave the current valid configuration intact. Storage failure must preserve an export path.
- Users own and can export their data. Do not add telemetry or remote dependencies to runtime without an explicit product decision.
- Every capability has a status and evidence. A configured future feature is not an implemented engine.

## Phase 0 acceptance (historical baseline)

1. A fresh checkout supports `npm ci`, `npm run dev`, and passing `npm run check`.
2. An accessible configuration editor supports name, uint32 random seed, bounded width/height, and primordial/seeded selection.
3. Explicit local save/load and JSON import/export validate the versioned format and handle failures without silent replacement.
4. A static native Canvas preview is labeled as such, with a text equivalent. No simulation or pretend run controls.
5. Documentation covers architecture, UX, models, formats, decisions, roadmap, and status. Tests and minimal CI cover the delivered foundation.
6. Changes are proposed in a GitHub PR; no automatic merge.

## Exclusions and unresolved questions

Phase 0 excluded life dynamics, workers, neural training, evolutionary operators, morphogenesis execution, batch runners, charts of fabricated results, and checkpoint storage. GPU acceleration, installed offline/PWA support, large-data persistence, learning algorithms, physical units, and detailed biological parameter values require later evidence and decisions. They do not alter the confirmed direction.

## Phase 1 acceptance

The owner approved the [Phase 1 design](phase-1-plan.md) and ADRs 0004–0006.

1. Deliver the versioned integer reference field, seeded initialization, periodic/closed boundaries, synchronous conservative transfers, exact metrics, and immutable state/snapshot contracts.
2. Provide explicit prepare/start/pause/step/reset, rates 1/10/30, bounded batches, a 10,000-tick stop, hidden-tab pause, and disposal without stale callbacks.
3. Keep active definitions separate from draft edits; confirm lost progress and preserve keyboard focus. Offer fixed-scale Canvas and HTML pixel/metric inspection at a shared sampled tick.
4. Preserve experiment v1 and its storage slot; add separately validated substrate-run v1 definitions, schema/example, portable JSON, and failure-safe local persistence. Exports restart, not resume.
5. Preserve the original 36 tests and verify the new model against independent fixtures. Compare production UI and full reference trajectories in Chromium and Firefox. Record measured performance and remaining limits in [verification](phase-1-verification.md).
6. Propose the implementation in an unmerged PR. Organism genesis, multi-scale dynamics, neural learning, evolution, morphogenesis, autonomous batches and checkpoints remain planned.

## Integrated baseline acceptance

The owner authorized meshing narrow phase slices into a working skeleton, merging PR #3 and continuing until a working review is needed. [Integrated plan](integrated-baseline-plan.md) and ADR 0007 define the authorized scope and exact model. Preserve prior formats/reference behavior; verify deterministic genesis/lifecycle, exact resource accounting, bounded organism/lineage growth, fixed neural decisions and cancellable local comparisons. Neural lifetime learning and checkpoint resume remain planned. Deliver evidence and a separate unmerged PR for owner review.

## Observable-life review correction

The owner's hands-on review rejected the indistinct pixel-growth experience. The next browser preview opens directly into the [observable ecology plan](observable-life-plan.md). Acceptance includes separated functional pixel bodies, discrete food, actual movement/intake/metabolism, observable reproduction/death, individual selection, inherited traits and explained decisions. Mathematics remains connected to real behavior and available through detailed inspection. These requirements complement deterministic/accounting tests; those tests alone cannot establish product acceptance. Existing reference models/formats remain unchanged and accessible under technical labs.

## Oriented bodies and visible inheritance milestone

The owner approved continuing the plan with turning added. Ecology-reference@2 now makes heading physical: rotate whole bodies, turn before forward movement, reject swept collisions, and rotate mouths/front sensing. Inherited dart/grazer/scout layouts develop functional cells with different intake/range/cost tradeoffs. Family provenance, mutation details and measured population/plan histories connect visible behavior to evolution. See ADR0009 and turning-body-plan.md. This implements the next bounded body/competition/observation milestone; lifetime learning remains the subsequent experimental milestone, not a delivered feature.

## Learning preparation boundary

The owner authorized continued development here while maintaining the OpenCode handoff. The [learning plan](learning-plan.md) and ADR0010 establish the next bounded milestone. L1/L2 delivered its contract and independently checked controller. The local L3–L5 implementation now connects v3 lifecycles, frozen-versus-learning comparisons and readable inspection. L6 verification and owner review remain the delivery gate. Initial outcomes are mixed; no general improvement claim follows.

## Current inherited-body increment

The owner authorized continuing from richer-body development. ADR0011 and inherited-body-plan.md define a new bounded v4 implementation: inherited3–6-cell connected-prefix genomes, real organ effects, resource-funded development, structural birth mutations, readable blueprint/growth/ancestry and version-correct learning comparisons. Old v1–3 remain replayable. The implementation status and evidence are in capability-status/handoff/STATE; historical phase exclusions above do not mean later delivered features are absent. Primordial spontaneous life, arbitrary anatomy editing, predation, general universe rules, workers, checkpoints and open-ended research remain planned.

## Owner-approved configurable testing increment

The owner approved the desktop/mobile concept and requested optional JSON, dashboard controls and a test field prepared for hands-on testing with copy/paste analytics for the agent. ADR0012 is the exact contract. Acceptance includes valid JSON/control synchronization with hidden draft preservation; bounded live-safe edits and explicit reset-only settings; four prepared cases and accessible field tools; exact resource accounting and deterministic edit replay; completed/partial/edited labels; useful metrics/notes and one-action report copy/download with fallback; desktop and short-phone verification. This is a bounded local laboratory, not a completed arbitrary universe editor or autonomous research system.
