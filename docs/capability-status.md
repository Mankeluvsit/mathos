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
| Primordial and seeded genesis | Planned | Mode selection only; Phase 2 |
| Multi-scale simulation | Planned | Phase 3 |
| Morphogenesis and evolution | Planned | Phase 4 |
| Neural lifetime learning | Planned | Phase 5 |
| Autonomous experiments and checkpoints | Planned | Phase 6 |
| Worker execution, IndexedDB, installed offline caching | Planned decisions | Add only with evidence; not shipped |

## Phase 1 delivery boundary

The owner approved Phase 1 implementation. Its code is on the implementation review branch until explicitly merged. See [verification](phase-1-verification.md). Seeded noise is an initializer, not seeded organism genesis. The scalar field is a mathematical reference substrate, not artificial life. Phase 0 files remain compatible. Learning, evolution, morphogenesis, organism genesis, multi-scale coupling, checkpoints and autonomous experiments are still planned.

## Dashboard presentation revision

Implemented on the review branch: dark colorized dashboard, desktop model/viewport/inspector arrangement, intermediate-width reflow, mobile Viewport/Setup/Inspect navigation, desktop focus mode, and three render-only palettes. See [product context](product-context.md) for the connection to the owner-provided concepts. Simulation state is preserved across presentation changes; future life-system mockup panels are not presented as implemented.
