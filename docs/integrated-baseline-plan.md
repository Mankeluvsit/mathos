# Integrated life baseline

Status: owner-authorized implementation, following the request to mesh phases into a testable skeleton and continue until a working review is needed. This changes sequencing, not the confirmed architecture. Phase 1 was merged in PR #3.

## Delivery sequence

1. Preserve the reference substrate and existing formats. Add a separate experimental life definition, pure engine and explicit model decision.
2. Connect reproducible primordial resource recipes and a seeded organism template to pixel occupancy, energy, bounded growth, asexual reproduction, mutation and lineage.
3. Expose pixel, organism and ecosystem inspection in a dark responsive laboratory. Add a fixed integer neural controller as a testable baseline; lifetime learning remains planned.
4. Add bounded cancellable local seed comparisons, metrics and portable definition/result exports. Keep checkpoint resume planned.
5. Verify invariants, deterministic replay, prior workflows and Chromium/Firefox behavior; deliver a new unmerged PR with desktop/mobile evidence for owner review.

## Model and limits

See ADR 0007 for the precise equations and ordering. Limits: 8–64 pixels per side, 64 live organisms, eight pixels per organism, 512 lifetime births, 2,000 ticks. One template starts at the center. Primordial mode contains resource noise only; it has no mechanism for spontaneous organism formation. Both modes consume the same row-major RNG draws before optional placement.

A genome controls maximum size and three fixed perceptron weights. Neural evaluation chooses growth versus rest, not learning. Stable ID ordering resolves occupancy conflicts. Mutation is genetic and does not represent lifetime training. The immutable reference engine is the source of truth; Canvas, mobile navigation, tick pacing and rendering never change outcomes.

The initial runner compares three consecutive uint32 seeds for up to 500 ticks each, yields to the browser in short batches and supports cancellation. It reports measured totals and termination reasons. No background/cloud agent, arbitrary rule code, worker, large-data storage or third-party runtime service.

## Acceptance

- Same definition and tick produce identical fields, organisms, lineage and RNG state; predecessor states and caller-owned definitions remain unchanged.
- Exact resource accounting: field + organism stores + structural units + cumulative dissipation equals the initial total on every tick.
- No overlapping/disconnected organisms, illegal placement, unbounded population/history, negative resources or unsupported imports.
- Demonstrate actual growth, births, mutation and death in deterministic fixtures. Primordial remains organism-free.
- Pause/step, hidden-tab pause, reset/discard, view switching and export/import work; local-storage failures preserve export.
- Existing 83 tests and substrate workflows remain valid; new model/runtime/format/UI checks and both browser suites pass.

## Later refinement

Lifetime learning, richer genesis chemistry, editable templates, differentiated morphogenesis, ecological selection studies, slower-scale coupling, checkpoints, broad parameter sweeps and advanced mathematical editors remain planned. This baseline supplies working connections, not completion or scientific validation of every phase.
