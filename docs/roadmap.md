# Implementation roadmap

Status is tracked in `capability-status.md`. The original phases remain capability tracks. The owner subsequently approved an integrated baseline spanning narrow slices of phases 2–6; see integrated-baseline-plan.md. That scoped approval permits implementation without repeated planning approvals. A working review PR is the next owner gate; later refinements remain distinct.

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

## Phase 1 design review

The [approved Phase 1 design](phase-1-plan.md) specifies the reference substrate, RNG, conservative integer transport, run-definition compatibility, UX, verification gates, and implementation sequence. The owner approved it and ADRs 0004–0006. Phase 0 is merged; the reference substrate is implemented on the review branch. See [verification](phase-1-verification.md). Later phases require their own approved scope.

## Integrated baseline sequencing

Phase 1 is merged. The [integrated plan](integrated-baseline-plan.md) connects genesis → pixel organisms → growth/reproduction → fixed neural decisions → local comparisons on the next review branch. This does not mark phases 2–6 complete. Primordial chemistry/emergence, sophisticated scale schedules/development, lifetime learning and checkpoint orchestration remain planned. See capability-status.md for delivered slices.

## Owner feedback before further phase depth

The [observable-life correction](observable-life-plan.md) is the current acceptance priority: recognizable functional organisms, movement/food/survival and understandable inspection must work before extending advanced systems. The integrated baseline is a reference, not a completed product experience. The next review should assess the corrected live world rather than additional numerical tables.

## Current approved increment

Turning and body geometry → bounded inherited cell layouts → actual food/space/energy tradeoffs → family/trait/population observations are delivered together in ecology-reference@2. The next planned increment is lifetime neural learning, with explicit observations/actions, training budget, inheritance policy and baseline comparisons before claiming improvement. The current preview is an owner review point, not completion of all phases.
