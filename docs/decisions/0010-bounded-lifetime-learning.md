# ADR 0010 — Bounded lifetime learning contract (candidate for review)

Status: **proposed**, not accepted or integrated. This document extends ADR 0009 without changing the ecology-reference@1 or @2 models. The standalone L2 controller exists on this branch; no v3 engine is implemented.

## Experiment question

Does a bounded within-lifetime integer action-value update alter measured foraging and survival compared with a frozen controller under equivalent initialization? Improvement is a hypothesis, not a feature claim. An explicit frozen-v3 control isolates weight updates; v2-v3 comparisons alone do not.

## Controller arithmetic

- Relative actions: forward, right, back, left. Physical execution remains limited to one safe quarter-turn OR one forward move; blocked intentions may cause fallback turns. Record **intention and actual movement** separately.
- Inputs: [64, floor(clamp(F,0,1024)/16), floor(clamp(R,0,1024)/16), floor(clamp(B,0,1024)/16), floor(clamp(L,0,1024)/16), floor(64*energy/600)]. Signals are the existing v2 sensing outputs. Rear signals are currently zero due to the rear blind spot.
- Four rows × six integer weights, each in [-4096,4096]; no hidden layers. Initial matching food coefficient 256*foodWeight, forward bias 16*inertia, all others zero. Existing gene ranges: foodWeight 1..6, inertia 0..6.
- Q[a] = trunc(sum_j(w[a,j]*x[j])/64); ties choose first relative action.
- Selected-action TD update: delta = clamp(256*reward + trunc(3*max(Q_next)/4) - Q_previous_selected, -16384, 16384). For terminal transitions Q_next=0. Only the selected row updates: w'[a,j] = clamp(w[a,j] + trunc(delta*x_previous[j]/4096), -4096,4096). Frozen arm computes the same diagnostics but does not update weights.
- Use truncation toward zero, not floor, for signed divisions. At most one row update per living motor-bearing organism per tick.

## Independent numerical cases

All-zero weights, previous input [64,0,0,0,0,0], action 0, next values zero:
- reward +1: delta=256, bias increment trunc(256*64/4096)=+4.
- reward -1: delta=-256, bias increment=-4.
- reward +1 with selected previous Q=64 and terminal: delta=256-64=192; bias increment +3.
- reward +1 with previous Q=0 and next maximum Q=64: delta=256+48=304; bias increment +4 (trunc(304/64)).
- reward 0 with delta 1: bias increment trunc(64/4096)=0. Tiny TD errors can cause no update.
- A weight already at +4096 cannot exceed +4096 even with a positive update.

Absolute sum bound: six inputs <=64 and six weights <=4096 imply |sum| <= 1,572,864, so |Q| <=24,576. Consequently the unclipped delta magnitude can reach at most 8192 + 18432 + 24576 = 51,200; clamp to 16,384 before multiplying by an input. The largest update numerator magnitude is 16,384*64=1,048,576, well within JS safe integers.

## Candidate v3 lifecycle and reward

Candidate order per organism: increment age → observe → choose intended relative action (with reserved exploration draw) → execute actual safe physical action → harvest food → pay upkeep → determine terminal death → observe successor state if alive → update selected action row → development/reproduction if alive → record results. **Must be reconciled with v2's actual ordering**, where development and reproduction follow the death check, and the environment processes organisms sequentially. In particular, the exact successor observation point must be fixed before implementation.

Reward candidate: clamp(actual mouth intake - actual movement/turn cost - actual metabolism, -32,32). These are resource-flow quantities, not a claim of biologically correct motivation. Do not subtract reproduction funding or structural development cost without an explicit decision. Terminal updates must occur at most once; juveniles without a motor must not update or explore.

## Determinism and inheritance

Use a dedicated, named exploration RNG stream with a documented derivation from world seed and organism identity, and a fixed draw schedule for **both** learning and frozen arms. Reserve the same draws in both arms even when policy decisions differ. Parent lifetime weights must never transfer to offspring: initialize offspring weights from inherited birth genes. Preserve ecology v1/v2 definitions, storage, golden fixtures, and replay.

## Comparison and falsifiability

Predeclare six seeds [0,1,2,42,123456789,4294967295] and 1600 ticks. For each seed, run two separate v3 worlds, one learning and one frozen, with identical initial conditions and declared RNG schedules. Report paired per-seed signed differences in population-time, survival, intake, births/deaths, updates and computational overhead, including extinctions and regressions. Six development seeds are **not** held-out evaluation after tuning. Avoid universal improvement claims.

## Remaining decisions before acceptance

1. Verify successor-observation timing relative to reproduction, development, other organisms' sequential turns and terminal death.
2. Decide whether reward includes structural-development funding and justify it scientifically.
3. Specify exact RNG stream derivation, consumption schedule, and whether an exploration choice is allowed when no food is sensed.
4. Verify energy quantization and zero-signal handling; existing v2 selects a seeded random direction when no signal is detected, whereas the candidate controller's first-max tie would choose forward.
5. Define exported learning diagnostics, controller state bounds, and v3 versioned schema.
6. Independently verify arithmetic and compare with a frozen controller before integrating into the ecology world.

No merge or claim of completed L1/L2/L3 until these items are resolved and full project verification passes.
