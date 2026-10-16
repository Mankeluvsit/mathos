# Phase 1 design: deterministic pixel substrate

Status: **approved by the project owner**. Phase 0 was merged in PR #1. The owner subsequently approved the decisions needed for a testable Phase 1. The reference substrate is implemented on the Phase 1 review branch; see [verification](phase-1-verification.md). Neither Phase 1 PR is merged automatically.

## Goal and limits

Deliver a small, reproducible mathematical substrate on which later artificial-life systems can be built: a bounded integer pixel field, a versioned seeded initializer, deterministic transport, and accessible inspection. Demonstrate correctness before introducing organisms.

Preserve the confirmed direction: pixel artificial life; primordial and seeded genesis; multi-scale processes; neural lifetime learning; evolution; morphogenesis; configurable rules; autonomous local experiments. Phase 1 implements only their deterministic substrate. Organisms, genesis execution, neural controllers, evolution, development, workers, GPU rendering, checkpoints, and experiment batches stay in their later roadmap phases. The reference transport rule is a mathematical test model, not a claim about biological or physical realism.

## Accepted decisions

Companion ADRs 0004–0006 are accepted.

| Topic | Decision |
| --- | --- |
| Grid | 2D, top-left origin, x right/y down, row-major index y * width + x; retain 8–256 pixels per side |
| Field | One unsigned 16-bit scalar, 0–65535 abstract resource units per site; no physical energy units yet |
| Initialization | Versioned seeded uniform noise or a fixed center impulse; distinct from organism genesis |
| RNG | mulberry32-v1 with explicit uint32 state, including seed zero |
| Neighborhood | Four orthogonal neighbors |
| Boundary | Periodic by default; closed/no-flux as an explicit alternative |
| Transport | Conservative synchronous integer pairwise flux; divisor 8 or 16 |
| Time | Integer ticks; one step is one complete transition; display rates 1, 10, or 30 ticks/second |
| Execution | Pure reference engine on the main thread; bounded batches, independent Canvas draw cadence |
| Run limit | Stop at 10,000 ticks; no unlimited unattended loop |
| Persistence | Preserve existing experiment v1 unchanged; a separate small versioned substrate-run definition, exported as JSON |
| Inspection | Fixed-scale heatmap, tick/seed/versions, sum/min/max, and selected pixel coordinates/value in HTML |

Resource units are a scalar test field. There is no implied resource metabolism, organism ownership, or neural signal semantics.

## Exact reference model

### State and ownership

World state contains dimensions, integer tick, RNG state, and the field. Use Uint16Array for the field and Int32Array for flux deltas. At the 256 × 256 limit the field plus one delta buffer needs 393,216 bytes; additional snapshots/working buffers must be measured and bounded.

The engine cannot import React, DOM, storage, timers, or rendering. Configuration is immutable during a run. The runtime owns mutable working state and never exposes a writable live buffer to React or the renderer. Define a public read-only snapshot/copy boundary; prove the previous public state is not mutated by a subsequent step.

### Initial conditions

- Uniform noise: advance the RNG once per pixel in ascending row-major order; assign the upper 16 bits of its uint32 output. Do not use floating-point sampling or Math.random().
- Center impulse: initialize all pixels to zero and set the pixel at (floor(width/2), floor(height/2)) to 65535. Consume no RNG outputs.
- Persist the selected initializer, seed, dimensions, and all algorithm versions. Both initializers work with seed zero. A seed alone never identifies an organism template.
- Tick zero is the initialized field; reset reconstructs precisely that field and generator state.

### One transition

Visit each undirected horizontal and vertical edge exactly once in a specified row-major order. Periodic worlds include right/bottom wrap edges; closed worlds omit edges crossing the boundary. With dimensions at least eight there are no duplicate edges from one/two-cell axes.

For an edge with old endpoint values a and b, define q = trunc((a - b) / d), where d is the configured divisor (8 or 16). Accumulate -q at a and +q at b. All fluxes read the old field; commit all deltas simultaneously, then increment tick once. Transport consumes no RNG outputs.

Never clamp after updating: clamping would hide broken accounting. Detect an out-of-range result as an engine invariant failure, stop the run, and report it. With at most four incident edges and d >= 8, outgoing transfer is bounded; the discrete maximum principle keeps values within the old minimum/maximum. Sum is exactly conserved. Maximum world total is 65,536 × 65,535 = 4,294,901,760, exactly representable as a JavaScript Number; do not accumulate totals with uint32 bitwise operations.

Small gradients may stop changing because integer flux truncates to zero. This quantization is intentional and must be visible in documentation, not described as a continuous diffusion solution. Use a fixed full-range color scale so a still field cannot appear to change merely through rescaling.

### Deterministic ordering

The Phase 0 full lifecycle ordering remains reserved for later systems. Phase 1 uses only: validate tick boundary/limits, read old field, accumulate transport deltas, commit, increment tick, observe. No empty controller/reproduction modules are needed.

Start/pause/speed changes schedule ticks but do not modify field dynamics or consume RNG outputs. There are no in-run environmental edits or stochastic transitions in this reference model. Later intervention commands will require tick/sequence logs and an explicitly versioned transition order.

## Runtime and UX

1. Create a substrate run explicitly; show its independent model identity. Derive name/seed/dimensions from a validated Phase 0 draft only through an explicit action.
2. Keep genesis controls labeled planned. Explain that a substrate run does not execute the draft's primordial or seeded genesis mode.
3. Start paused. Offer Start/Pause, Step, Reset, and the three display rates using normal buttons/selects. Step is available while paused and advances exactly one tick.
4. Freeze active configuration. Editing a draft does not silently change a running world. Applying another configuration/reset after progress requires an explicit discard confirmation in the app.
5. A runtime callback executes at most four ticks, preserving every transition. Cap accumulated wall-time debt and slow down if needed; never skip simulation ticks to catch up. Pause clears timing debt. Run-rate choices change wall time, not the state at a given tick.
6. Stop at tick 10,000 or on invariant failure, with a distinct visible status. Reset is always available. Auto-stop is reproducible by tick; any future wall-time safety stop is an operational reason, not a scientific outcome.
7. Draw at most once per animation frame. Publish compact metrics at a bounded rate (target 4 updates/second) and immediately on pause/step/reset; do not announce every tick to screen readers.
8. Provide HTML sum/min/max/tick and labeled integer x/y selectors with a value readout. Canvas pointer selection may be supplementary. Keyboard users must reach equivalent information.
9. Keep visible focus, adequate contrast, 320px reflow, 200% zoom support, and 44px controls. No run starts automatically, including for reduced-motion users.
10. Label static versus live views truthfully when the implementation ships. Do not change the current Phase 0 screen in this planning PR.

## Configuration and compatibility

Keep mathos-experiment schemaVersion 1, its schema/example, import behavior, storage key, and genesis intent untouched. Do not silently reinterpret v1 files as runnable organism experiments.

Use a distinct JSON envelope: format mathos-substrate-run, schemaVersion 1; name; seed; universe width/height; engine id/version; RNG id/version; initializer id/version; and rules id/version/boundary/transferDivisor. Fix concrete IDs in fixtures before implementation: engine substrate-reference@1, RNG mulberry32@1, initializer uniform-noise@1 or center-impulse@1, rules conservative-transport@1.

Accept only known keys/IDs/versions and validated bounds. Keep the 64 KiB import cap. Canonical serialization orders fields explicitly. Local key: mathos.substrate-run.v1. Save/load/import/export remain explicit and errors leave valid data intact.

A run-definition export restarts at tick zero. It contains no field buffers, learned state, resume position, or claimed checkpoint support. Keep display preferences outside the deterministic model. Display the current tick for inspecting a repeated run; do not add a misleading saved-state button.

No v1 migration is needed because the formats are distinct. Any future unified experiment v2 needs a separately reviewed migration and retained originals. No arbitrary JavaScript rules may be imported.

## Architecture and proposed file structure

```text
src/
  domain/substrate-run.ts       # definition and boundary validation
  simulation/
    rng.ts                     # versioned uint32 generator
    state.ts                   # state/snapshot contracts
    initialize.ts              # noise and impulse recipes
    transport.ts               # synchronous conservative reference rule
    step.ts                    # transition/limit/invariant orchestration
    metrics.ts                 # exact sum/min/max and point inspection
  runtime/substrate-runtime.ts # start/pause/step/reset, bounded scheduling
  rendering/field-renderer.ts   # fixed-scale Canvas output
  components/SubstrateControls.tsx
  components/FieldInspector.tsx
  storage/substrate-storage.ts
schemas/substrate-run.schema.json
examples/substrate-run.v1.json
tests/                         # domain, RNG, engine, runtime and app behavior
tests/fixtures/substrate/      # reviewed vectors and golden trajectories
scripts/substrate-benchmark.mjs
docs/phase-1-plan.md
docs/decisions/0004-*.md through 0006-*.md
```

These paths describe the intended boundaries; implementation details may combine small components. Reuse existing UI/storage helpers only when actual shared behavior warrants extraction. No new runtime dependency is expected.

## Approved implementation sequence

| Step | Work | Reviewable completion evidence |
| --- | --- | --- |
| 1 | Ratify ADRs and schema; add separate validated run definition and example | Schema/runtime agreement, known/unknown version tests, original v1 regression tests |
| 2 | Implement RNG and initializers without UI coupling | Independently checked uint32 vectors for seeds 0, 1, and max; exact row-major fields and reset equality |
| 3 | Implement reference transport, state ownership, metrics, and step | Hand-calculated edge fixtures, conservation/bounds, stable uniform field, impulse symmetry, golden trajectories |
| 4 | Implement bounded runtime behind an injected scheduler | Pause/step/reset, rate-independent trajectories, exact tick limit, no stale callback after disposal |
| 5 | Add live Canvas, accessible controls, inspector, separate persistence | Real browser keyboard, no-autostart, configuration isolation, import/export, rendering and responsive checks |
| 6 | Measure limits, reconcile docs/status, and open implementation PR | All checks, reproducibility evidence, benchmark report, disclosed limitations |

Prefer one focused implementation branch/PR with these logical commits; split only if it improves review. Approval authorizes this listed reference substrate, not later life systems. Do not merge the planning or implementation PR automatically.

## Verification and acceptance gates

- Preserve all 36 Phase 0 tests; add behavior tests, not copies of implementation.
- RNG vectors and golden fixtures must have independent provenance. Do not regenerate expected output using the production function and call that verification.
- Test both boundaries and divisors on 8×8 and rectangular grids; test maximum dimensions and seeds. Include corner wrap/no-flux cases, uniform and center-impulse cases, and rounding-to-zero cases.
- Check exact integer sum and field bounds over long deterministic trajectories. Assert previous public snapshots cannot change through engine/runtime mutation.
- Compare direct N steps, N paused single steps, and multiple display/scheduler schedules at the same tick. Verify no skipped transitions and a hard stop at exactly 10,000.
- Compare repeated initialization, reset, serialized-definition replay, and production-build browser behavior at selected golden ticks.
- Run existing lint/type/tests/build CI plus Chromium smoke checks. Extend browser checks to the new controls, accessible inspection, keyboard operation, persistence failures, and zero external runtime requests.
- Test RNG/golden outputs in Chromium and Firefox before claiming cross-browser equality; scope the initial guarantee to the tested engine/rule versions and fixtures. Broader cross-platform equality remains unclaimed.
- Benchmark 64×64 and 256×256 over 100 and 1,000 ticks, recording browser/runtime version, hardware/runner, warmup, median and p95 tick time, and peak retained buffers. Initial target: 64×64 p95 <= 8 ms and no runtime batch above 50 ms on the documented reference device. These are targets to measure, not current results. If unmet, lower scheduling rate/batch size or narrow tested UI limits transparently; do not add worker/GPU complexity without review.
- Check disposal/hidden-tab behavior, 320px reflow, 200% zoom, focus visibility, and explicit no-autostart. Automated accessibility checks do not substitute for keyboard/manual inspection.
- Update master specification, architecture, UX, simulation/data-format documents, roadmap, and capability status alongside implementation. Only label Phase 1 implemented after evidence exists.

## Review status

The owner approved the reference model and implementation scope. Review the implementation PR and verification report before merging. Later artificial-life systems remain outside this phase.
