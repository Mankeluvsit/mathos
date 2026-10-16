# 0004: Versioned deterministic random initialization

Status: accepted by the project owner for Phase 1. Implemented on the Phase 1 review branch.

Context: Phase 0 records a uint32 seed, including zero. Reproducible pixel initialization needs an explicit algorithm and state contract independent of browser timing.

Decision: use mulberry32-v1, a small non-cryptographic uint32 generator with one uint32 state. Accept every uint32 seed as initial state, including zero. Increment state by 0x6D2B79F5 modulo 2^32 for each draw. Let t be that state, apply t = imul(t XOR (t >>> 15), t OR 1), then t = t XOR (t + imul(t XOR (t >>> 7), t OR 61)), then return (t XOR (t >>> 14)) >>> 0. JavaScript bitwise coercions and Math.imul define 32-bit behavior; store the advanced generator state independently of temporary t.

Use upper 16 output bits for uniform-noise pixels in row-major order. Center-impulse initialization consumes no draws. Reference transport consumes no draws. Fix independent known-answer vectors for seeds 0, 1, and 4294967295 before engine integration.

Consequences: tiny dependency-free implementation, explicit zero-seed semantics and restartability. This is not cryptographic randomness or proof of statistical suitability for every later scientific experiment. A later generator change requires a new algorithm identifier/version and cannot silently reinterpret existing run definitions. Future checkpoint formats must include generator state, not only the original seed.

See ../phase-1-plan.md for approval scope and acceptance gates.
