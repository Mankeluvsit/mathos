# Capability status

This table describes code on this branch; it becomes the default-branch baseline only after PR review and merge. “Implemented” means delivered behavior, not a scientific claim. Verification evidence belongs in the PR and CI run.

| Capability | Status | Evidence / boundary |
| --- | --- | --- |
| React/TypeScript/Vite foundation | Implemented | `src/app`, build/type/lint scripts |
| Configuration editing and validation | Implemented | `src/domain/experiment.ts`, domain and app tests |
| Local save/load | Implemented | `src/storage`, adapter and app tests; single configuration slot |
| JSON import/export | Implemented | Schema, example, validation and workflow tests |
| Native pixel canvas | Implemented | Static foundation preview plus live fixed-scale substrate field |
| Accessibility foundation | Implemented baseline | Semantic controls, labels, focus, status; no conformance certification |
| Automated tests and CI | Implemented definitions | Vitest/Testing Library, `.github/workflows/ci.yml`; execution evidence in PR |
| Reference substrate dynamics and field inspection | Implemented on review branch | Versioned integer transport, exact metrics, fixed ticks; see verification |
| Primordial and seeded genesis | Experimental baseline | Life lab executes resource recipe/center-cell template; full Phase 2 remains planned |
| Multi-scale simulation | Experimental baseline | Pixel/organism/ecosystem inspection; full Phase 3 remains planned |
| Morphogenesis and evolution | Experimental baseline | Bounded growth/reproduction/mutation; full Phase 4 remains planned |
| Neural lifetime learning | Planned | Phase 5 |
| Autonomous experiments and checkpoints | Partial baseline | Local seed comparisons implemented; checkpoints and full Phase 6 planned |
| Worker execution, IndexedDB, installed offline caching | Planned decisions | Add only with evidence; not shipped |

## Historical Phase 1 delivery boundary

The owner approved Phase 1 implementation. Its code was merged in PR #3; this paragraph records its original scope. See [verification](phase-1-verification.md). Seeded noise is an initializer, not seeded organism genesis. The scalar field is a mathematical reference substrate, not artificial life. Phase 0 files remain compatible. Learning, evolution, morphogenesis, organism genesis, multi-scale coupling, checkpoints and autonomous experiments are still planned.

## Dashboard presentation revision

Implemented on the review branch: dark colorized dashboard, desktop model/viewport/inspector arrangement, intermediate-width reflow, mobile Viewport/Setup/Inspect navigation, desktop focus mode, and three render-only palettes. See [product context](product-context.md) for the connection to the owner-provided concepts. Simulation state is preserved across presentation changes; future life-system mockup panels are not presented as implemented.

## Integrated baseline on this review branch

The Phase 1 implementation is merged. A separate experimental life lab now connects these narrow slices; the original phase table above describes the full capabilities, not completion of these tracks.

| Slice | Implemented behavior | Remaining scope |
| --- | --- | --- |
| Genesis | Versioned resource-noise recipe and center-cell template | Primordial material chemistry and spontaneous structures |
| Scales | Explicit pixels, connected organisms and exact ecosystem totals each tick | Slower-scale process scheduling and validated approximations |
| Morphogenesis | Genome-limited connected one-pixel growth | Differentiation, repair and richer developmental programs |
| Evolution | Resource-funded asexual reproduction, bounded mutation, lineage | Broader selection studies and inheritance strategies |
| Neural control | Fixed integer single-neuron growth gate | Lifetime learning/training remains planned |
| Experiments | Cancellable three-seed comparisons with exported measured endpoints | Checkpoints/resume, general sweeps and persistent history |

See [plan](integrated-baseline-plan.md), [model decision](decisions/0007-integrated-life-baseline.md) and [verification](integrated-baseline-verification.md). No claim of biological realism, emergence or intelligence.
