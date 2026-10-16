# Phase 1 verification

Status: measured on the implementation review branch, 2026-10-16 UTC. Phase 0 is merged. The owner approved Phase 1 design/implementation; Phase 1 PRs remain unmerged until explicitly authorized. These are engineering reference-model results, not artificial-life claims.

## Reproduce locally

Use Node.js 24 and the committed lockfile:

```sh
npm ci
npm run check
python3 scripts/reference-fixtures.py --check
npx playwright install chromium firefox
npm run test:browser
npm run benchmark
```

Browser checks require a build and free loopback ports 4173/4174. They start/stop their servers. Linux system dependencies may require administrator access via `playwright install --with-deps`; on this environment downloading browsers without that option worked with existing libraries. CI installs those dependencies explicitly.

To test interactively, run `npm run dev`, open the printed local URL, follow **Go to substrate lab**, open it, choose an initializer, and prepare from the experiment draft. Start paused, step, inspect, animate, pause, and reset. Import `examples/substrate-run.v1.json` through **Import run JSON** to test a portable definition. Existing experiment files use the original controls.

## Correctness evidence

- Lint, strict TypeScript, production build and 83 automated tests pass, including the original 36 foundation tests.
- The independent Python oracle implements unsigned RNG arithmetic and a per-site neighbor solver, unlike production's once-per-edge delta ledger. Committed fixtures cover seeds 0/1/4294967295 RNG vectors and three complete field trajectories at ticks 0/1/2/10/100. Tests never rewrite fixtures or compute expected data with the production engine.
- Node, Chromium 156.0.8078.4 and Firefox 157.0 match every recorded vector and full golden field. Agreement is scoped to these algorithms, versions, fixtures and environments, not universal browser equality.
- Invariants cover periodic/closed corners, divisors 8/16, rectangular and maximum grids, stable uniform fields, sub-unit gradients, exact totals up to 4,294,901,760, long trajectories, previous-state isolation and invalid internal-state rejection.
- Runtime tests compare direct, manual and scheduled execution, check rate changes, catch-up caps, cancellation/disposal, copied snapshots, engine failure handling, throttled summaries and the exact 10,000-tick stop.
- UI tests exercise paused preparation, isolated active configuration, reset confirmation/cancel, definition import errors, independent storage slots, coordinate validation, quota errors, hidden-tab pause and disposal.
- Production-build browser checks pass in both browsers: keyboard controls, confirmation focus, selected golden values/metrics, native Canvas, true JSON download/upload, invalid imports, no automatic run under reduced motion, storage fallback/export, 320px reflow and 200% CSS-zoom reflow. No external runtime requests or uncaught page errors were observed.
- Wide-layout screenshots were inspected. These checks are not a screen-reader audit, native browser-zoom matrix, mobile-device test, or accessibility certification. Safari remains untested.
- Dependency audit reported zero known vulnerabilities; no new runtime package was added.

## Performance measurements

Reference environment: Linux x64, AMD EPYC 9V74, 3 logical CPUs exposed, Node v24.19.0, headless Chromium/Firefox versions above. Shared cloud execution, no CPU pinning. The browser engine benchmark uses the real modules through a dev-only local harness; the production UI is tested separately. Warmup: 25 ticks per case. Timing is wall-clock duration of a pure engine step; garbage collection and process scheduling may affect tails. Firefox's coarse timer resolution yields some zero medians.

| Browser | Grid | Measured ticks | Median ms | p95 ms |
| --- | --- | --- | --- | --- |
| Chromium | 64×64 | 100 | 0.1 | 0.2 |
| Chromium | 64×64 | 1,000 | 0.1 | 0.2 |
| Chromium | 256×256 | 100 | 1.3 | 2.0 |
| Chromium | 256×256 | 1,000 | 1.3 | 2.4 |
| Firefox | 64×64 | 100 | 0 | 1 |
| Firefox | 64×64 | 1,000 | 0 | 1 |
| Firefox | 256×256 | 100 | 2 | 3 |
| Firefox | 256×256 | 1,000 | 2 | 3 |

Runtime catch-up benchmark through 1,000 ticks (without UI rendering):

| Browser | Grid | Callback p95 ms | Maximum observed ms |
| --- | --- | --- | --- |
| Chromium | 64×64 | 0.6 | 5.9 |
| Chromium | 256×256 | 8.3 | 24.3 |
| Firefox | 64×64 | 1 | 2 |
| Firefox | 256×256 | 8 | 10 |

The measured 64×64 p95 is below the 8 ms target, and sampled runtime batches stayed below 50 ms. Those are observations, not guarantees on other hardware. UI drawing/React work is outside this batch benchmark. The runtime stops batches after its 8 ms work budget but cannot preempt a single tick or an OS stall. Keep dimensions capped at 256 and reduce display rate on slower devices; no worker or GPU implementation is justified by these reference measurements.

## Memory measurements and bounds

Node's benchmark samples process ArrayBuffer allocation after each step and forces GC with an event-loop yield before retained-memory readings. Across the 100/1,000 tick cases, peak sampled allocated buffers were about 2.6/24.7 MB for 64×64 and 39.7/69.6 MB for 256×256. After GC, process ArrayBuffers were about 0.154 MB and 0.400 MB respectively. Peaks include buffers awaiting collection; they are not retained world history. These process readings exclude browser Canvas/GPU memory and are not a hard browser heap bound.

At maximum dimensions, one field is 131,072 bytes and one signed delta buffer is 262,144 bytes. Step temporarily holds old/new fields and deltas. The runtime retains one state; UI metrics and Canvas receive bounded copies, not a history. Snapshot isolation/disposal tests and post-GC measurements support the ownership model, while browser heap profiling on actual target devices remains a future performance check.

## Limits and deferred capabilities

This is one abstract conservative transport field. Integer rounding may leave small gradients stationary; neither physical diffusion accuracy nor spontaneous life is claimed. Initializer noise is not organism genesis. No neural learning, reproduction, evolution, morphogenesis, multi-scale coupling, arbitrary imported code, autonomous batches, checkpoints, IndexedDB, worker/GPU execution, authentication or backend is implemented.

Definition export preserves reproducible inputs and always restarts at tick zero. It cannot resume the displayed tick. Browser storage is best effort and origin-specific; export a portable copy. Existing experiment v1 data is not migrated or overwritten by substrate storage.

## Dashboard alignment revision

The owner supplied the shared concept conversation and requested a dark colorized dashboard with device-specific UI. See [product context](product-context.md) and [four review captures](previews/README.md). The earlier light screenshot documented working substrate progress, not an approved final design.

The revision uses a central desktop field, adjacent model controls and contextual inspection, an intermediate-width stacked inspector, desktop focus mode, and phone Viewport/Setup/Inspect views. Mobile playback stays in normal flow; secondary display controls move to Setup. Preparing a run focuses the viewport. Spectrum/Thermal/Grayscale are render-only palettes.

All 83 existing tests, lint, types and production build pass. Chromium/Firefox workflow checks additionally verify palette changes, focus mode, desktop-to-phone resizing and mobile panel visibility without changing a paused tick or total. The core engine, RNG, rule versions, formats and independent trajectory fixtures are unchanged. The numeric transport benchmarks above remain measurements of that same engine; they do not measure the new dashboard's full drawing cost. The owner can judge visual alignment from the new multi-device captures. Screen-reader and real-mobile-device certification remain unclaimed.
