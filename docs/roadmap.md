# Implementation roadmap

Status is tracked in `capability-status.md`. Every phase requires its own review; this foundation does not authorize implementation of later scientific systems.

| Phase | Deliverables | Exit criteria |
| --- | --- | --- |
| 0 — foundation | Specifications, ADRs, AGENTS.md, accessible configuration app, static Canvas preview, JSON/localStorage, tests, CI | Clean install and all checks pass; persistence/import failures covered; PR reviewed |
| 1 — deterministic substrate | Versioned RNG, fixed ticks, explicit boundaries/neighborhood/field equations, reference engine, mathematical field inspection | Golden seeded trajectories, accounting invariants, pause/step consistency, bounded reference benchmark |
| 2 — genesis | Primordial substrate recipes and seeded organism templates, validated initial placement | Both modes reproducible; no promise of spontaneous life; invalid placement rejected |
| 3 — scales and runtime | Pixel/organism/ecosystem coupling, inspection, profiled worker boundary if justified | Cadence-independent results, reference equivalence, responsive controls, bounded messaging |
| 4 — development and evolution | Genome/development rules, resource-bounded growth, reproduction, mutation, lineage | Reproducible genotype/phenotype fixtures, resource invariants, lineage and inheritance tests |
| 5 — neural learning | Bounded local controllers, observations/actions, explicit lifetime learning and inheritance policy | Baseline comparisons, numeric checks, seed replay, training budgets and learning diagnostics |
| 6 — experimentation | Local sweeps/batches, comparisons, metrics, results/checkpoints, cancellation | Bounded resumable workflows, provenance, export/replay fixtures, storage-limit handling |

Mathematical visualization grows alongside each phase: field values and functions first, then structure, trajectories, distributions, and experiment comparisons. Use browser-native rendering and accessible numerical summaries.

Before each phase, resolve its open model choices in ADRs, define acceptance fixtures and performance budgets, and update the master specification. GPU acceleration, PWA caching, large-data formats, and advanced editors need demonstrated requirements. No mandatory backend, login, external API, or cloud orchestration enters through a later phase implicitly.
