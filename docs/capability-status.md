# Capability status

This table describes code on this branch; it becomes the default-branch baseline only after PR review and merge. “Implemented” means delivered behavior, not a scientific claim. Verification evidence belongs in the PR and CI run.

| Capability | Status | Evidence / boundary |
| --- | --- | --- |
| React/TypeScript/Vite foundation | Implemented | `src/app`, build/type/lint scripts |
| Configuration editing and validation | Implemented | `src/domain/experiment.ts`, domain and app tests |
| Local save/load | Implemented | `src/storage`, adapter and app tests; single configuration slot |
| JSON import/export | Implemented | Schema, example, validation and workflow tests |
| Native pixel canvas | Implemented preview | Static checkerboard only, not simulation state |
| Accessibility foundation | Implemented baseline | Semantic controls, labels, focus, status; no conformance certification |
| Automated tests and CI | Implemented definitions | Vitest/Testing Library, `.github/workflows/ci.yml`; execution evidence in PR |
| Pixel universe dynamics and mathematical analysis | Planned | Phase 1 onward |
| Primordial and seeded genesis | Planned | Mode selection only; Phase 2 |
| Multi-scale simulation | Planned | Phase 3 |
| Morphogenesis and evolution | Planned | Phase 4 |
| Neural lifetime learning | Planned | Phase 5 |
| Autonomous experiments and checkpoints | Planned | Phase 6 |
| Worker execution, IndexedDB, installed offline caching | Planned decisions | Add only with evidence; not shipped |
