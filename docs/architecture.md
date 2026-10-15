# Architecture

## Current foundation

Single static React application, built by Vite using strict TypeScript. HTML controls edit an experiment draft. A pure domain validator converts untrusted JSON into a canonical configuration. A small storage adapter persists validated configuration JSON under a versioned key. Canvas 2D displays a static bounded checkerboard, not state from a simulator.

```text
React app → domain validation
          → localStorage adapter → validated JSON
          → native Canvas preview
JSON import/export ↔ domain validation
```

`src/domain` cannot import React, storage, or rendering. `src/storage` depends on domain types and injected browser-compatible storage. `src/rendering` may use browser APIs but does not own domain data. The React application orchestrates user actions and reports failures. No state management library, router, backend, network client, or service worker is needed in Phase 0.

## Planned simulation boundary

Future pure engine: `step(state, configuration, commands, rngState) → nextState + events`. State is serializable; transitions cannot depend on wall-clock time, UI order, or draw rate. Typed arrays may represent pixel fields, while organism records hold identity, genome, developmental state, and controllers. Select exact layouts after profiling a reference implementation.

A runtime scheduler will translate user commands into tick-addressed events, advance fixed ticks, and publish read-only snapshots. React handles controls and summaries; Canvas consumes snapshots independently via animation frames. A Web Worker can host the same engine after a baseline is correct. Worker messages need versioned payloads, bounded queues, explicit pause/step/reset semantics, and deterministic command ordering. Workers and those controls are not implemented yet.

## Scale and persistence

One world coordinate system underlies pixels, organisms, and ecosystem summaries. Multi-scale means explicit coupling of fine dynamics and slower aggregate processes, not merely zooming a camera. Sampling or reduced fidelity must be labeled and recorded if it changes dynamics.

Use `localStorage` only for small settings/configurations. Store one named working configuration in Phase 0. Export is user-initiated and portable. Plan IndexedDB behind the adapter for checkpoints/results, with quota handling and explicit deletion/export. Do not use localStorage as a large simulation database.

## Runtime and deployment

No network calls, fonts, authentication, analytics, or cloud runtime dependencies. npm and GitHub Actions are development tools. Static hosting is optional; local HTTP serving is sufficient. Relative asset URLs support subpath hosting. Offline installation and reload caching require a later service-worker decision. Modern browsers with ES2022, Canvas 2D, localStorage, File, Blob, and object URLs are the initial target; report inaccessible storage and fall back to import/export.

## Reproducibility and performance

Reproducibility requires configuration, generator/version/state, rule/engine versions, command log, and initial conditions. Cross-engine/browser bitwise equality is not yet guaranteed; later phases must define numeric behavior and test golden trajectories before claiming it. Bound input dimensions, imported file size, worker backlog, run duration, population, and local result retention. Benchmark before adding WebGL, WebGPU, or complex caches.
