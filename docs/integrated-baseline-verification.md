# Integrated baseline verification

Scope: the experimental integrated life review branch after Phase 1 merge. These checks support a bounded software reference model, not biological realism, intelligence, full accessibility conformance or completion of phases 2–6.

## Automated and independent evidence

- `npm run check`: lint, strict TypeScript, **100 tests**, production build passed locally, including all original 83 tests.
- `python3 scripts/reference-fixtures.py --check` and `python3 scripts/life-reference.py --check`: committed fixture provenance verified.
- Independent Python life oracle uses Jacobi field updates and separately implemented lifecycle logic. Closed/periodic seed-42 8×8 trajectories match full fields, organisms/genomes/controller scores, RNG state, lineage and dissipation at ticks 0, 1, 10, 100, 500 and 2000. TypeScript tests and Chromium 156/Firefox 157 match these same fixtures.
- Tests cover exact resource accounting, connected/nonoverlapping structure, growth/birth/mutation/death, no primordial organism generation, immutable predecessor/snapshot state, format/schema validation, uint32 seed wrap, batch replay/cancellation, bounded scheduling, stale callbacks, tick cap, corrupt storage/import, export availability after quota failure, hidden-tab pause and React StrictMode lifecycle replay.

## Browser workflows

Chromium 156 and Firefox 157 passed the preserved production substrate workflows and the new production life workflows: actual Canvas, Start/Pause/Step, cancelled reset, mobile state preservation, exact accounting, save/export/import restart, same-definition replacement, corrupt import/storage, three-seed cancellation/completion, primordial no-organism behavior, 320/390/1600px reflow, no page errors and zero external runtime requests. Native confirmations are used for discard actions. Existing keyboard/200% CSS-zoom substrate checks remain passing.

Desktop and three phone captures show the working model; see [gallery](previews/life/README.md). Browser screenshot generation is part of scripts/browser-life.mjs and writes temporary review captures, not experiment result datasets.

## Measured bounds

`node scripts/life-benchmark.mjs`, Node 24.19.0, this Linux workspace: one 2000-tick seeded run per size, invariant checks included, rendering excluded. Results vary with runtime/hardware/load; these are observations, not latency guarantees.

| Size | Maximum population | Final births / deaths | Tick p95 | Largest sampled tick |
| --- | --- | --- | --- | --- |
| 16×16 | 64 | 139 / 139 | 0.78 ms | 33.29 ms |
| 32×32 | 64 | 64 / 0 | 0.71 ms | 33.11 ms |
| 64×64 | 64 | 64 / 0 | 0.71 ms | 29.20 ms |

All runs preserve exact accounting. Extinction at 16×16 is a measured consequence of this finite-resource model, not a desired universal outcome. A 500-tick browser sample at 16/64 sizes measured p95 2.9/4.0 ms in Chromium and 2/2 ms in Firefox, with sampled maxima up to 39 ms while other checks shared the machine. This is not a controlled browser benchmark. A single transition is not preemptible; the 8 ms animation budget applies between ticks. Four-tick comparison chunks yield to the event loop; very slow devices may still show pauses. Workers remain deferred pending representative-device profiling.

## Remaining limits

No lifetime neural training, spontaneous genesis chemistry, repair/differentiation, arbitrary templates/rule code, checkpoints/resume, persistent result history, workers, Safari/physical-device validation or screen-reader certification. Lineage caps at 512 total births; full-cap reproduction is suppressed rather than dropping records. Resource palette saturates above 2048; numerical inspection remains exact. Stable older-ID conflict priority is an explicit model bias.

GitHub CI is the delivery gate and repeats both Python provenance checks, all tests/build and all browser suites. Its final run is linked from the review PR.
