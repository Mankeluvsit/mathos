# ADR 0010 — bounded learning during an organism's lifetime

Status: accepted design within the owner's authorized learning milestone. The controller, ecology-reference@3 integration, browser controls and paired comparison runner are implemented locally; L6 review/publication is the current gate. This decision does not claim improved survival or intelligence.

## Context and decision

The oriented v2 organisms have fixed directional scores. Changing genes at birth is evolution, not learning during life. Add a small linear action-value controller: four output neurons with six integer weights each. Temporal-difference updates change these weights during one lifetime. An otherwise identical frozen-weight treatment is the control. A hidden-layer network, replay memory, online optimizer or external ML dependency is unnecessary for this first inspectable experiment.

Keep v1/v2 engines, fixtures, definitions and storage semantics unchanged. V3 keeps the v2 geometry, sensing, resource ledger, inherited body plans and physical lifecycle, but replaces direction selection and separates random streams. Those changes mean v2 is historical context, not a learning-off control for v3.

## Numerical contract: linear-td@1

All divisions below truncate toward zero unless `floor` is explicitly written. Normalize a zero result to positive zero. Validate finite integers before computation. Features and weights are copied at ownership boundaries; no input state is mutated.

Feature order is `[bias, foodForward, foodRight, foodBack, foodLeft, energy]`. Bias is 64. Each food feature is `floor(min(rawSignal, 1024) / 16)`; raw signals must be nonnegative safe integers. Energy is `floor(64 * storedEnergy / 600)` for integer stores in 0–600. Each feature is therefore 0–64. Sensing remains v2's mouth-centered, body-relative front half-plane; the back channel is zero in this model, not a new rear sensor.

Actions 0/1/2/3 mean relative forward/right/back/left **intent**. Convert to absolute heading using the heading at observation. Existing mechanics may turn, move, choose a safe fallback turn or remain blocked. Learn the selected intent's row even if mechanics cannot execute it; record the actual mechanical outcome separately. Never replace the learned action with the fallback's direction.

There are four rows of six weights in `[-4096,4096]`. At birth set matching food weight `w[a,a+1] = 256 * foodWeight`, and forward bias `w[0,0] = 16 * inertia`; all other weights are zero. Actual inherited bounds are foodWeight 1–6 and inertia 0–6, so initialization is already within bounds; reject invalid genes rather than silently clamping them. Learned values are not genes. Newborns initialize from their own birth genes with zero updates, never from parental trained weights.

```
Q[a] = trunc(sum(j=0..5, w[a,j] * x[j]) / 64)
greedy action = first maximum in order forward, right, back, left
reward = clamp(actualIntake - actualMechanicalCost - actualUpkeep, -32, 32)
nextQ = terminal ? 0 : max(a, Q[a] evaluated at the next observation)
delta = clamp(256 * reward + trunc(3 * nextQ / 4) - Q[selected], -16384, 16384)
wNew[selected,j] = clamp(w[selected,j] + trunc(delta * x[j] / 4096), -4096, 4096)
```

Use pre-update weights for both Q evaluations and all six increments. Non-selected rows remain equal. One enabled update increments the update counter even if rounding or saturation makes all changes zero. Disabled learning computes the same diagnostics, copies unchanged weights and leaves the counter unchanged. Reports distinguish the computed delta from the six **actual** changes after clipping.

Intake is the actual capped sum from mouths (0–48), mechanical cost is the actual successful action debit (0–3), and upkeep is the actual paid debit `min(energyAfterIntake, sizeBeforeDevelopment)` (0–4). Growth, child funding, death disposal and sunlight are excluded from reward. No invented starvation bonus/penalty. Death still gets its final measured reward and terminal nextQ=0. This designer-chosen reward values immediate feeding efficiency; it does not directly reward reproduction, age or diversity and may produce worse populations.

## Randomness and exploration

Use mulberry32@1 with `ecology-streams@1` derivation, explicit uint32 arithmetic:

| Stream | Initial state | Draw schedule |
| --- | --- | --- |
| Environment | `seed` | 360 initialization attempts, then 3 food-placement attempts per world tick; one draw per attempt even if placement fails |
| Reproduction | `(seed XOR 0xA341316C) >>> 0` | At a valid child placement only: one mutation gate draw; if `word % 4 == 0`, one trait/direction draw as in v2 |
| Exploration for organism ID 1–256 | `(seed XOR 0xC8013EA4 XOR imul(id, 0x9E3779B9)) >>> 0` | Exactly two consecutive draws per motor-eligible decision, in both treatments |

For exploration, consume gate then choice. If `gate % 16 == 0`, select `choice % 4`; otherwise use the first greedy maximum. Consume the choice draw even on a greedy decision. No special no-food branch. Motor eligibility is tested before mechanics/development: juveniles without a motor consume no exploration draws and make no learning transition; a motor developed this tick becomes eligible next tick. A blocked motor-bearing organism is still eligible. Each newborn gets its own stream from seed and ID, not parental RNG state.

The XOR derivation is deterministic domain separation, not a proof of statistical independence or collision freedom across arbitrary seed/ID combinations. A pair starts with the same physical state and random states. Divergent survival/reproduction creates different later draw opportunities and worlds; paired seeds do not guarantee identical later environments.

## Exact v3 lifecycle placement (integration contract)

1. Copy predecessor, reject tick >=1600, replenish food using environment RNG. Process the previous living population in ascending ID order; newborns do not act this tick.
2. Increment age, remove own old occupancy, measure pre-action signals/stores. If motor-eligible, form features, evaluate/select intent using two exploration draws, and retain those exact features/Q/action. Perform v2 mechanics; record turn/move/blocked/juvenile separately from feeding/developing/reproducing text.
3. Apply mouth intake and actual upkeep. Measure reward from these debits/credits, not the difference between starting and final stores.
4. On starvation or maximum age: finalize the eligible transition with terminal nextQ=0 **before disposal**, record its diagnostics/counters in the lineage, dispose stores/structure exactly as v2, and remove the organism. No subsequent update of a dead organism.
5. For a survivor, perform v2 development and reproduction in their existing order. Add shared transformed occupancy; initialize every child controller and stream fresh. Parent growth/offspring transfers change its next energy feature but not its immediate reward.
6. Form the survivor's next observation immediately after its own lifecycle, using the current food and new heading/body/stores, before later organisms act. Finalize exactly one eligible transition. At the end of the last permitted world tick (1600), use terminal nextQ=0 for all eligible transitions, including survivors, because no continuation is modeled.
7. Sort survivors/newborns, increment world tick, record bounded history, check occupancy/ledger/controller invariants. The next world tick never re-applies a previous transition.

This uses the immediate post-action local observation as the bootstrap estimate, not a delayed observation at the next actual decision. Later actors and next tick's food input can change that decision context. The approximation, partial observability, stable ID priority and lack of a clock/age feature are explicit scientific limitations. Do not describe this as a convergence-guaranteed MDP solver.

## Bounds and independent examples

At most 48 decisions/updates per tick, two exploration draws and six weight increments per eligible actor. Each scoring pass has 24 products. Per organism at most 1600 updates; per run at most 76,800. No replay buffer, retained transition history or unbounded optimizer state. One latest diagnostic record per living organism plus final bounded lineage diagnostics is sufficient.

Absolute product <=262,144; six-term sum <=1,572,864; Q <=24,576; discounted next-Q <=18,432; unclipped delta <=51,200; clipped delta-feature product <=1,048,576; increment <=256; pre-clamp weight <=4352. All arithmetic is far below JavaScript's exact integer limit. The bias always equals 64. Controller weights do not represent physical resources and cannot create/debit energy; ledger semantics stay unchanged.

Independent hand anchors (all unspecified rows/weights/features are zero; bias feature remains 64):

| Case | Calculation | Expected selected-row effect |
| --- | --- | --- |
| Positive reward, zero weights, terminal | reward=1, delta=256 | bias +4 |
| Negative reward, zero weights, terminal | reward=-1, delta=-256 | bias -4 |
| Truncation toward zero | selected bias=65, reward=0, terminal; delta=-65 | bias increment -1, final 64; a feature of 1 gets increment 0, not -1 |
| Live bootstrap | selected row zero, next best bias=100, reward=0 | nextQ=100, delta=75, selected bias +1 |
| Terminal counterpart | same weights, reward=0, terminal | nextQ=0, delta=0, no change |
| Positive delta clamp | selected row all -4096, all features64, reward32, terminal | previousQ=-24576, rawdelta32768 ->16384; each selected weight +256 |
| Negative delta clamp | selected row all4096, all features64, reward-32, terminal | previousQ24576, rawdelta-32768 ->-16384; each selected weight -256 |
| Weight saturation | selected bias4095, reward32, terminal | delta4097, proposed +64; final4096, actual change +1 |

Numerical reference cases must be authored independently of the TypeScript controller and checked in CI. Include frozen updates, both weight saturation directions, negative fractional division, all-row isolation, action ties, RNG endpoints and repeated update bounds. Regeneration is explicit; verification must not silently overwrite fixtures.

## Formats, review and consequences

The exact planned v3 envelope and export policy are in [data format](../data-format.md); [learning plan](../learning-plan.md) defines staged verification and honest comparisons. The local v3 validator/schema/storage/dispatcher now implement that contract together. Preserve the 64 KiB limit and small starting definitions. Learning state checkpoints remain deferred.

The four-neuron linear model is inspectable and cheap, but limited. Quantization can stop small updates; clipping can saturate weights; missing observations and reward design can encourage poor choices. Record negative outcomes across every declared seed. A measurable update proves only that the learning mechanism ran; improvement requires the paired comparisons and owner review of understandable live behavior.
