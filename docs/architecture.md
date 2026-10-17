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

## Oriented body model and version dispatch

The legacy ecology/model.ts remains unchanged. ecology/oriented-geometry.ts supplies canonical local parts, cardinal transforms, footprint and conservative swept-turn checks. ecology/oriented-model.ts owns v2 lifecycle, inherited plans, family records and bounded history. ecology/world.ts dispatches validate/initialize/step/copy explicitly by definition version. The renderer, selection and camera share cellParts; they cannot invent facing independently. Existing substrate/life/ecology-v1 fixtures remain valid.

The ecology runtime publishes v2 snapshots at up to12.5Hz while advancing so normal10step/s playback exposes individual turn actions; the older v1 sampling behavior remains unchanged. Engine ticks stay independent of that publication cadence. EvolutionPanel consumes recorded20-step samples (81 max), birth genes and measured family outcomes. UI labels avoid treating food intake as fitness or universal plan superiority. Storage uses version-specific slots and rejects a mismatched version in a slot.

## Learning component and connected v3 (local implementation)

`src/ecology/learning-controller.ts` contains pure bounded observation/scoring/exploration/update functions and explicit stream derivation, importing only the versioned RNG. Its inputs are measured integers and copied controller state; it has no world, browser, persistence or clock dependency. Independent Python-generated fixtures verify numerical behavior through the normal test gate. The separate learning-model.ts v3 engine owns controller/RNG state and exact lifecycle timing; world.ts dispatches v3 explicitly while preserving v1/v2. Snapshots and observation exports deep-copy weights/diagnostic arrays as appropriate. LearningComparison runs independent worlds with four-tick/8ms yield budgets, cancellation on hidden tab or disposal, and no mutation of the interactive world. Vite embeds Git revision/dirty metadata at build time for result provenance; no network call is made by the app. [Contract](decisions/0010-bounded-lifetime-learning.md).

## Terminal presentation layer

`rendering/ecology-terminal.ts` consumes immutable snapshots and shared geometry. A bounded observation-difference helper creates up to96 display cues; EcosystemCanvas schedules their180ms fade separately from simulation ticks. View settings, reduced-motion queries and animation timestamps never enter an engine transition or saved definition. Cleanup cancels the frame request; pausing renders an exact still state. Classic continues using the preceding renderer. [Visual contract](visual-direction-cogmind.md).

## Ecology mobile presentation

EcologySession keeps one shared playback control surface outside the mobile-hidden panels. World / Organism / Results / Setup are presentation destinations, not routes or new runtimes. Results groups the mounted comparison, history and event components; switching views does not cancel work, reset selected IDs or mutate world state. Only view navigation updates focus/scroll. Display preferences live in the mounted canvas component; Activity highlights never call runtime start/step. Setup keeps explicit replacement confirmation and separates starting settings from live controls. No scientific model, persistence version or dependency changed for this correction.

## Inherited-body v4 boundary

Pure body-genome.ts validates cell-layout@1 and supplies prefix geometry, sweeps, role counts and deterministic structural proposals. genome-mechanics.ts uses that geometry for sensing/action and a wider physical reward-input adapter, retaining linear-td@1 arithmetic. genome-model.ts is a separate lifecycle module; old engines and controller remain unchanged. world.ts dispatches every operation, including rendering/selection parts, by actual model/genome. V4 snapshots/archive/export deep-copy locus arrays and diagnostics.

Genes retain the old bodyPlan field strictly as a founder-origin tag; it no longer determines anatomy in v4. Blueprint inspection and observed birth/growth records are separate from ancestry charts. The shared comparison runner defaults to v3 for compatibility, accepts explicit v4 settings, initializes both treatments under the same chosen rules and exports distinct provenance/version. Phone organization/playback remain shared and view-only. No new runtime dependency or service.
