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

## Continuation and handoff

The owner authorized continued local work and an OpenCode handoff. [Task cards](handoff/NEXT.md) break the learning milestone into contract → pure controller/oracle → v3 integration → paired comparison → inspection → evidence. L0 now provides a bounded six-seed v2 measurement command; it does not implement lifetime learning or a v3 learning ablation. [Resume](../RESUME.md) and [state](handoff/STATE.md) carry progress between agents. Routine verified source/preview delivery is now authorized; keep merges manual.

Local continuation: L1–L5 are implemented locally, including versioned v3 learning lifecycles, paired measurements and readable inspection. L6 verification is complete locally and routine delivery is authorized; current source/preview/CI evidence is in handoff/STATE.md. The first six-seed outcomes are mixed. [Learning plan](learning-plan.md) and [verification](learning-verification.md) distinguish tested behavior from improvement claims.

## Current inherited-body milestone

The owner authorized and continued the richer-body milestone after the completed learning and phone corrections. ADR0011/inherited-body-plan.md now define the bounded v4 implementation: ordered connected genomes, real organ/cost/development effects, structural birth mutation, ancestry inspection and model-correct learning comparisons. Old learning milestones above are historical; capability-status and STATE carry current delivery evidence. Keep arbitrary anatomy editing, predation, general configurable universe rules, true scale scheduling, checkpoints and broader autonomous experiments as subsequent work. Do not mark the full original phase tracks complete.

## Untuned evaluation and next diagnosis

The separate24-run v4 learning/body-mutation evaluation completed without tuning, with exact accounting and mixed effects. See evaluation-results-v4-01.md for every seed/treatment and NEXT for the bounded decision/energy diagnostic task. The next step is to explain observed tradeoffs before changing reward or anatomy parameters; the full original phase tracks remain incomplete. Developer tooling does not imply a new browser experiment UI or completed autonomous research.

## Current configurable testing milestone

Owner approved the dashboard/test-field direction, adding hidden-by-default JSON and prepared owner-run tests with easily shared analytics. ADR0012 and test-field-guide.md define the bounded delivered slice. Current work connects configuration → controlled trial → actual metrics → replayable owner feedback, preserving old models. Advanced controller/rule editors, checkpoints, arbitrary anatomy and broader research remain later work; full phases2–6 are not marked complete.

## Owner-requested visual evolution legibility

Read-only parent/offspring diagrams, changed growth slots, recent accepted structural births and one shared terminal/test-field organ palette improve the existing baseline. See [scope and evidence](evolution-visuals.md). This is an observability increment across Living world model4 and Test field, not a new scientific engine or completion of evolution. Persistent map family accents, lineage trees and further effects remain planned. Prioritize owner feedback/replay before the bounded behavior-diagnostic task; do not silently tune the scientific model.

## Current consolidation priority

[ADR0013](decisions/0013-shared-world-and-testing.md) supersedes feature expansion: one shared world/test engine/configuration, explicit food/run limits and feature/inheritance choices. These simulation corrections are planned, not yet live. Development maintains one progress record; the handover follows it. Current task/evidence: [STATE](handoff/STATE.md).
