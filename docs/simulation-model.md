# Simulation model specification

Status: **Phase 1 reference transport implemented on the review branch; organism/life contracts remain planned**. This document preserves architecture while identifying scientific choices that require later proposals and experiments.

## Universe and pixels

The substrate is a discrete two-dimensional grid. Pixel coordinates are integers with a documented origin and row-major indexing `y * width + x`. A pixel is a simulation site, not necessarily an organism. Fields may represent energy, resources, signals, waste, occupancy, or structural material. Field meaning, ranges, units, conservation rules, neighborhood, and boundary conditions belong to a versioned ruleset.

Before the reference engine, select an initial neighborhood and boundary policy in an ADR; do not silently hard-code them into a renderer. Validate non-finite numbers, dimensions, population limits, and illegal occupancy. Transfers must have explicit accounting; apparent energy generation cannot be hidden in update order.

## Time and update contract

Advance integer ticks with a fixed configured step. Define ordered phases: commands, environmental processes, sensing/controller evaluation, intent resolution, resource accounting, development/reproduction/death, then observation. This is a proposed ordering to ratify in Phase 1. Use stable identifiers and deterministic tie-breaking; avoid in-place iteration advantages unless intentionally specified. Render and metric sampling must not mutate world state.

All stochastic decisions use a named/versioned seeded generator. Checkpoints must include generator state. Configurations alone restart an experiment; they cannot resume one. Future command logs include tick and sequence order. Timing, dropped rendering frames, and UI redraws cannot change state transitions.

## Genesis

- **Primordial:** initialize permitted substrates, environmental gradients, and stochastic material distributions without authored organisms. Define tests for material interactions and candidate self-maintaining/reproducing structures. Emergence may never occur; measure rather than promise it.
- **Seeded:** instantiate explicit organism/genome templates at validated positions with recorded initial conditions. A random seed does not substitute for an organism template. Template import/placement and genome schemas are future work.

Both modes share the same world/rule contracts. Phase 0 records mode selection only; a runnable seeded configuration will later require a versioned template definition, and a runnable primordial configuration a versioned substrate recipe.

## Organisms, morphogenesis, and evolution

Planned organism records include stable identity, occupied structure, resource budget, genome, developmental state, controller state, birth/death ticks, and parent lineage. Define connectedness, ownership conflicts, and identity under splitting/fusion before implementation.

Morphogenesis interprets heritable developmental rules to produce spatial growth, differentiation, repair, and structural changes, subject to occupancy and resource limits. Specify genotype-to-phenotype mapping explicitly. Evolution acts through reproduction, heritable mutation/recombination, and survival/reproductive consequences. Define asexual reproduction first if it minimizes reference complexity; sexual recombination remains a separate design choice. Record lineage and mutation provenance. Do not equate neural weight changes with genetic mutation.

## Neural learning

Planned local neural controllers map bounded observations to bounded action intents. Define architecture, activation functions, observation/action schemas, update algorithm, learning rate limits, and computational budget before implementation. Lifetime learning modifies controller state; inheritance of learned weights is a configurable explicit rule, never assumed. Compare against fixed-controller baselines and record algorithm/version. No external model API is required.

## Multi-scale coupling

Pixel interactions support organism behavior and ecosystem statistics. Slower processes operate at documented integer tick multiples with explicit aggregation/distribution rules. Aggregate summaries cannot replace detailed state invisibly. Zoom changes viewing only. Any approximation affecting outcomes requires a versioned mode, validation against the reference, and recorded provenance.

## Configurable rules and autonomous experiments

Rulesets are validated data with stable identifiers/versions; arbitrary imported JavaScript execution is out of scope. Future rules include fields, boundaries, energy flows, genesis recipes, sensing, development, learning, reproduction, and limits.

Autonomous local runners execute explicit experiment plans: seed lists, parameter sweeps, bounded repetitions, maximum ticks/wall time/resource budgets, observations, and stop conditions. Store completed/cancelled/failed status and termination reason. Compare predefined metrics such as field totals, survival, population, lineage diversity, structure, and controller performance; avoid declaring “intelligence” or “life” from a single metric. Exports retain plan, versions, seeds, interventions, and results. No cloud agent or unattended unlimited loop is required.

## Phase gates

Each later subsystem requires invariants, bounded reference fixtures, deterministic replay tests where applicable, numerical assumptions, performance measurements, and clear scientific limitations. Exact equations, neural algorithm, genome encoding, and emergent-life criteria remain open decisions.

## Implemented Phase 1 reference model

The accepted [Phase 1 design](phase-1-plan.md) and ADRs 0004–0006 define one Uint16 scalar field in abstract resource units. There is no physical-energy or organism claim. The grid uses top-left coordinates, four orthogonal neighbors, and explicit periodic or closed/no-flux boundaries.

Uniform-noise initialization consumes one mulberry32@1 uint32 draw per pixel in row-major order and uses its upper 16 bits. Center-impulse initialization sets the center site to 65535 and consumes no draws. Transport uses no randomness.

For each undirected right/down edge exactly once, compute q = trunc((a - b) / d) from the old field, where d is 8 or 16. Subtract/add paired signed deltas, commit synchronously, then increment tick. Exact total is conserved, and results remain in bounds without clamping. Small gradients can stop changing due to integer quantization. Totals use a JavaScript Number without uint32 coercion.

The current order is tick/limit validation, transport accumulation, commit, tick increment and observation. Full organism lifecycle ordering above remains planned. State contains frozen versioned configuration, tick, RNG state, field and exact sum/min/max; runtime snapshots copy field data. A run definition alone restarts at tick zero. See [verification](phase-1-verification.md) for independent fixtures and tested compatibility.
