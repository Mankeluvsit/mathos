# 0005: Conservative integer reference substrate

Status: proposed for Phase 1; pending approval. Not implemented.

Context: MATHOS needs a pixel-level, testable substrate before adding organisms. Floating-point equations and in-place updates would make the first reproducibility contract harder to audit.

Proposal: one Uint16 scalar field, 8–256 sites per axis, four orthogonal neighbors, periodic boundaries by default and an explicit closed/no-flux alternative. Every undirected edge is visited once. Transfer q = trunc((a - b) / d) from a to b using old values, with d equal to 8 or 16. Accumulate signed deltas, commit synchronously, then increment one integer tick. Use a Number for exact totals, not bitwise uint32 sums.

At most four outgoing edges and d >= 8 keep the field within its previous minimum/maximum. Paired transfers conserve total exactly. Do not clamp invalid results: stop and expose invariant failures. Rounding can freeze small gradients, an intentional quantization effect.

Consequences: simple exact accounting and stable fixtures without physical-unit claims. This is an abstract transport test, not a validated continuous diffusion solver or life model. Neural learning, evolution, morphogenesis, organism genesis, additional fields and multi-scale coupling retain their roadmap phases. Changing numeric semantics, edge traversal, or rule parameters requires explicit versioning and fixtures.

See ../phase-1-plan.md for state ownership, topology details and the verification plan.
