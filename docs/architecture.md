# Architecture

## Implemented foundation and reference substrate

Static React application built with Vite and strict TypeScript. Foundation controls retain experiment-v1 editing, validation, JSON and localStorage. The dark dashboard’s explicitly opened substrate lab adds a versioned integer transport reference model. The separate integrated life section below describes the new experimental baseline; full later life systems remain planned.

```text
React configuration controls → domain validation → small localStorage/JSON definitions
                          → substrate runtime → pure initialize/step engine
                                               → copied Canvas snapshots
                                               → sampled HTML metrics/inspector
```

`src/domain` cannot import React, storage or rendering. The run validator preserves experiment v1 and canonicalizes a separate substrate-run v1 definition. Definition objects and nested records are frozen. Storage adapters have injected browser-compatible ports, validate boundaries, and report failures without silent replacement.

`src/simulation` implements `initialize(definition) → state` and `step(state) → nextState`. It imports no DOM, storage, timers or React. Each step allocates a new field, uses signed deltas for synchronous integer edge transfers, checks bounds/conservation, increments one tick, and leaves the previous state intact. RNG state is explicit and changes only during noise initialization in this version.

`src/runtime` owns its state privately, accepts an injected scheduler, and exposes immutable summaries plus field copies. React and Canvas cannot access the writable live field. Start/pause/reset/rate changes cancel stale callbacks with an epoch guard. The runtime executes at most four ticks per callback, stops a batch after an 8 ms measured work budget, discards excessive timing debt, and stops at tick 10,000. A single tick cannot be preempted; this is not a hard real-time guarantee.

Canvas uses a fixed full-range palette and draws at most once per scheduled animation frame. Metrics and the HTML pixel inspector share a copied sampled tick, published at most four times per second while running and immediately on control actions. Pause makes inspection exact. The UI pauses hidden tabs and disposes the runtime on replacement/unmount. There is no history of retained snapshots.

## Persistence and compatibility

The original `mathos.experiment.v1` slot and format remain unchanged. `mathos.substrate-run.v1` holds one separate validated small run definition. An explicit conversion copies name/seed/dimensions only; it does not execute the selected genesis intent. Active definitions never change when the experiment draft is edited.

JSON definition export restarts at tick zero and is not a checkpoint. Browser storage is origin-specific and best effort. Large results/checkpoints and IndexedDB remain planned. No router, state-management framework, backend, external runtime client, or service worker is needed.

## Future simulation boundary

Later organisms will extend the pure engine with explicit ordered lifecycle phases, tick-addressed environmental commands and replay logs. Pixel, organism and ecosystem scales must use explicit coupling; zoom is only a view operation. Neural learning, inheritance, development and experiment orchestration remain separate contracts in the simulation specification.

A worker may host the same reference semantics after profiling justifies it. Worker payload versions, bounded queues, snapshot ownership and pause/step/reset behavior require review. GPU rendering, large-data encodings and fidelity-changing approximations remain evidence-based decisions rather than current dependencies.

## Runtime, reproducibility and measured limits

No external requests, remote fonts, authentication, analytics or cloud runtime dependencies. npm and GitHub Actions are development infrastructure. Static assets use relative URLs; a local HTTP server is sufficient. Offline installation/reload caching is deferred.

Reproducibility is scoped to named engine/rule/RNG/initializer versions and known fixtures. Node, Chromium and Firefox match the independent reference fixtures; this does not establish equivalence for untested future algorithms or every browser/platform. See [Phase 1 verification](phase-1-verification.md) for timings, memory measurements and practical limits. Bound dimensions, import size, ticks, callback batches and UI sampling before adding performance infrastructure.

## Responsive presentation boundary

Desktop model/viewport/inspection regions share one runtime. Mobile Viewport/Setup/Inspect switches presentation through CSS while keeping the components and runtime mounted. Focus mode is scoped to desktop widths. View-only palette lookup tables change Canvas colors, never engine values or configuration formats. The owner-provided shared conversation is recorded in product-context.md as contextual design evidence; it does not add remote services or unimplemented subsystems.

## Integrated life reference

The header explicitly switches between the preserved substrate laboratory and a separate life-reference@1 lab, confirming discarded progress. Only one runtime is active. src/domain/life-run.ts validates frozen small definitions; src/life/engine.ts owns initialization, fixed-tick lifecycle and accounting; src/runtime/life-runtime.ts owns bounded scheduling and deep copied snapshots. React/Canvas never mutate the live model. The runtime pauses immediately on detach and defers final disposal through a microtask so React StrictMode effect replay can reattach safely.

The life storage adapter uses mathos.life-run.v1 without migrating either previous slot. The life experiment runner shares the pure engine and yields after four transitions. It retains only endpoint metrics/partial termination information for three seeds, not full world histories. Views remain mounted across mobile navigation. Replacement/unmount aborts comparison work and prevents stale UI publication. No worker or new runtime dependency. ADR 0007 documents sequential organism-ID bias and reference equations.

## Observable ecology reference

The opening experience now uses a separately versioned ecology-reference@1 engine in src/ecology/model.ts. Its fixed small definition and storage slot do not migrate existing formats. src/runtime/ecology-runtime.ts retains bounded, scheduler-independent ticks and deep snapshots. EcologyLab renders outlined functional bodies and discrete food at higher pixel density, with camera magnification/follow independent of the model. A ?lab=reference URL or the technical-labs button opens earlier references. Desktop world/organism/setup panels become World/Organism/Setup on phones. Mobile defaults to 2× magnification and following the selected organism; the whole-world option and touch/keyboard scrolling remain available.

The model's replenishment is explicit sunlight input in an integer ledger; it is not hidden energy creation. It uses fixed integer directional neural scores, bounded lifespan/cooldown/reproduction and mature three-cell bodies. No workers, APIs, learning service or new dependency. ADR 0008 defines the exact lifecycle.
