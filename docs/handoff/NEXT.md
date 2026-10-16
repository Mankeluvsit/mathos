# Next milestone: learning that can be inspected and compared

User authorization: continue the plan after the turning/body-inheritance milestone, while preparing this handoff. The owner now requests automatic local work and review before publishing. This package advances **measurement preparation**, not a finished learning feature. Do not restart Phase 0 or rewrite the working ecology.

## L0 — fixed-controller measurement baseline (implemented in this increment)

Inputs: ecology-reference@2, its six fixed seeds `[0, 1, 2, 42, 123456789, 4294967295]`, 1,600 steps each. Run:

```sh
node scripts/ecology-baseline.mjs .artifacts/fixed-controller-baseline.json
```

The file must not already exist; use a new filename for a later run so evidence is not overwritten. Each run reports actual resource accounting, births/deaths/survivors/generation, peak population, first extinction tick, total intake, and the sum of post-step living populations over the requested horizon. All seeds are reported, including poor outcomes. No wall-clock measurement enters the model. Source revision/dirty flag and Node version accompany the export; results stay out of Git.

Done: direct advancement and measurement agree; repeated calls are independent; invalid seeds/horizons fail; all old trajectories remain unchanged. Files: `src/ecology/baseline.ts`, `scripts/ecology-baseline.mjs`, `tests/ecology-baseline.test.ts`. These v2 measurements are historical context, **not yet a same-engine learning ablation**.

## L1 — finalize the learning contract (first uncompleted card)

Read: master/model/data specifications; ADR0009; oriented-model/geometry; world dispatcher; baseline measurement; existing tests. Output: `docs/decisions/0010-bounded-lifetime-learning.md`, `docs/learning-plan.md`, updates to roadmap/status. Do not change old engines during this card.

Recommended first experiment: a small **integer linear action-value controller** with within-life temporal-difference updates, plus an otherwise identical frozen-weight control. This is a proposal for the next agent to check with hand-worked examples, not a confirmed implemented algorithm. Use these explicit candidate parameters as the starting point, so the next agent does not invent a large neural stack:

| Contract | Candidate definition / decision to finalize |
| --- | --- |
| Model identity | ecology-reference@3; keep all v1/v2 exports, slots, fixtures and replay untouched |
| Input vector | Six bounded integers: bias 64; four relative food signals `floor(clamp(signal,0,1024)/16)`; stored energy `floor(64*energy/600)` |
| Outputs/actions | Four relative desired directions forward/right/back/left; existing physical rules still allow at most one quarter-turn or one forward move |
| Network | Four linear output neurons, six weights each, no hidden layer; integer Q8 values; each weight bounded to `[-4096,4096]` |
| Evaluation | `Q[a] = trunc(sum(weight[a,j] * input[j]) / 64)`; stable action tie order; no floating activation or nondeterministic ML library |
| Initial weights | Food coefficient for each action's matching signal: `256 * min(inheritedFoodWeight,16)`; forward bias: `clamp(16*inertia,-4096,4096)`; other coefficients zero. Check these against actual gene bounds |
| Exploration | Proposed probability 1/16; reserve deterministic draws per eligible decision in a separate named RNG stream in both arms. Document exact initialization/draw order and how turns with no motor are handled |
| Reward | Actual mouth intake minus actual turn/translation cost minus cell upkeep for the acted tick, clipped to `[-32,32]`; exclude reproduction transfer/growth funding. Explain this designer-chosen objective, including how death/no-action is treated |
| Update | One selected-action row per eligible transition. `delta = clamp(256*reward + trunc(3*maxQNext/4) - QPrevious,-16384,16384)`; terminal next-Q is zero. `weight[j] = clamp(weight[j] + trunc(delta*inputPrevious[j]/4096),-4096,4096)` |
| Budget | At most one update of six weights per living motor-bearing organism per tick; retain current 48-organism/1,600-step bounds. Count updates and demonstrate numeric intermediate bounds |
| Inheritance | Genes mutate/inherit as before. Each newborn initializes controller weights from its own birth genes; parent-learned weights/experience are reset, never silently inherited |
| Control arm | Same v3 initial weights, RNG schedule, exploration, body rules and conditions, with updates disabled. This isolates learning better than calling v2-v3 differences a learning effect |
| Observability | Inspector shows chosen intent, actual action, food signals, reward, update count and a small readable weight/change table; explicitly label frozen versus learning |

Hand example for the proposed update: only bias input is 64, all weights/Q/next-Q are zero, reward is +1. Delta is 256, the selected bias weight increases by 4, others stay zero. Also derive negative reward, terminal death, clipping, non-selected rows and maximum integer sums **independently** before accepting the contract. If the candidate is unsuitable, change the documented proposal with concrete reasoning and examples; do not implement an ambiguous half-version.

Decide lifecycle placement precisely: previous observation/action → actual mechanics/intake/upkeep → terminal/development/reproduction handling → next observation → one update. Current simulation ordering and rewards must agree in both equations and code. RNG streams for environment, reproduction and exploration must have named derivation/order; paired seeds guarantee matching starts, not identical worlds after policies diverge. Treat the original fixed-v2 data only as contextual evidence.

Done: no undefined action/reward/terminal/inheritance/rounding rule; all ranges and per-tick work bounded; full format version proposal; explicit fairness/negative-result criteria; hand examples reviewed. Scientific parameter choices are hypotheses, not promised improvement. Use the owner's prior authorization for bounded decisions; ask only if a choice changes product intent, costs or publishing authority.

## L2 — pure controller with independent numerical checks

Depends on L1. Inputs: accepted ADR equations and hand cases. Allowed new modules/tests: `src/ecology/learning-controller.ts`, `tests/learning-controller.test.ts`, a small independent Python reference if warranted. No React, Canvas, storage, timers or external neural package.

Done: known examples exact; disabled learning leaves weights unchanged; only selected row updates; saturation/truncation/terminal rules exact; deep copies; bounded number of operations; same input/seed reproduces. Independent examples must not be generated by the production implementation. Run focused tests and core/full gates before integration.

## L3 — v3 lifecycle and explicit data boundary

Depends on L2. Inputs: controller + accepted lifecycle/format. Add v3 engine/definition/schema/example/slot and explicit dispatcher, preserving old modules. Do not refactor old semantics as part of introducing v3.

Done: deterministic learning-on/off starting states; exact resource accounting; movement/turning still uses shared geometry; child resets learned experience; no update after terminal disposal; per-creature budgets/total bounds; invalid or mismatched versions reject; old fixtures unchanged; v3 golden captures clearly labeled regression evidence; independent controller oracle still passes.

## L4 — bounded paired comparison runner

Depends on L3. Inputs: both v3 arms with the same initial configuration and the six predeclared L0 seeds. Paired run means one frozen and one learning run for each seed, not running the two organisms in a shared world with unequal treatment.

Done: at most 12 × 1,600 steps, yields/cancellation and completed/cancelled/failed provenance, honest partial results, no mutation of the interactive world; per-seed outcomes plus signed differences, not only an average. Report survival/population-time/intake/births/deaths/learning updates and learning overhead. Do not tune on these six and call them held-out. Predeclare additional unseen seeds before a separate evaluation if parameters are tuned. Show regressions and mixed/no improvement without hiding runs. Terminal extinction still permits explicit environmental evolution until the agreed horizon.

## L5 — understandable live learning inspection

Depends on L3; comparison UI also depends on L4. Read EcologyLab/EvolutionPanel/CSS/runtime/renderer. Keep learning controls explicit in starting definitions; draft changes cannot alter active runs. Make learning/frozen status and actual action/reward/weight changes understandable on desktop and phone. Never imply moving/turning alone proves learning.

Done: browser tests for setup/version choice, inspect/update text, paused exact step, mobile navigation/follow/playback, save/import/export, comparison/cancel and zero runtime external requests. Capture actual desktop, 320/390px phone World/Organism/Setup. No invented activity visualization. Keyboard, text alternatives and reduced motion remain usable.

## L6 — evidence and owner review

Inputs: all cards and real verification output. Run full gate, old/new browser replay, declared comparisons and a small measured compute budget. Update specification/model/format/architecture/UX/capabilities, current memory and review description. Distinguish within-life weight updates from heritable variation and measured outcomes from general improvement.

Done: concrete locally testable result, no unexplained failing checks, limitations documented, reviewer findings resolved or recorded. Ask the owner to review the result **before** publishing this next feature. No merge, paid service, general neural editor, predation, checkpoint or unlimited experiment loop enters scope through this card.
