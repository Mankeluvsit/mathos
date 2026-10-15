# 0006: Bounded substrate runtime and separate run definition

Status: proposed for Phase 1; pending approval. Not implemented.

Context: Phase 0 experiment v1 records genesis intent, not a runnable model. A first substrate demo must not pretend it executes primordial or seeded organism genesis. UI frame rate must not change scientific state transitions.

Proposal: keep experiment v1 and its storage slot unchanged. Add a distinct validated mathos-substrate-run v1 definition with dimensions, seed, and versioned engine/RNG/initializer/rules. Persist only small definitions under mathos.substrate-run.v1 and export portable JSON. Export restarts at tick zero; checkpoints remain deferred.

Execute a pure engine through a main-thread runtime with injected scheduling, immutable active configuration, explicit Start/Pause/Step/Reset, and rates 1/10/30 ticks per second. Start paused, advance at most four complete ticks per callback, discard excessive wall-time debt rather than skipping transitions, and stop at tick 10,000. Draw once per animation frame and publish accessible metrics at a bounded rate.

Consequences: a small reference implementation and exact replay at a given tick, while wall-clock throughput may vary. Long/unresponsive batches must be measured and corrected before release. Workers/GPU execution remain future evidence-based decisions. User actions during Phase 1 schedule execution but do not mutate the field or create environmental interventions. Later interventions require tick-addressed command logs.

See ../phase-1-plan.md for UX, compatibility, budgets and implementation sequence.
