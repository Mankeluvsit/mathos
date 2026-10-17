# One world, shared rules and testing

The default dashboard uses one active mathos-world@1 session. **Testing tools · same world** reveals field-editing tools; it never prepares or starts another simulation. World / Rules / Results on phones are views of this same state. JSON is hidden by default and can be shown/hidden without losing a draft. Settings apply explicitly at the next boundary; initial conditions require a confirmed Prepare/reset.

## Available choices

| Control / JSON key | Meaning |
| --- | --- |
| Initial food target / rules.initialFood | Seeded patch target, subject to free space and standing energy cap; reset required |
| Replenish food / rules.replenishment | Turn automatic input on/off |
| Spawn attempts / rules.spawnAttempts | Placement attempts per tick,0–8; occupied/food sites can reject a candidate |
| Available food cap / rules.foodCap | Maximum total food energy present, including partial patches and genesis/manual food; null turns cap off |
| Total replenishment / rules.supplyBudget | Cumulative automatic energy supplied since genesis; null turns budget off. Eating/clearing food does not renew it |
| Stop at chosen step / test.steps | Absolute stopping tick or null to run until paused; can remove or extend an endpoint without replacing the world |
| Reproduction / organisms.reproduction | Permit future births, independently of learning/mutation |
| Learning / organisms.learning | Permit weight updates; off freezes existing learned weights |
| Body / scalar mutation | Independent structuralMutation and traitMutation switches |
| Inherit body / scalar traits | inheritBody and inheritTraits choose parent material or configured founder baseline for future offspring |
| Inherit controller weights | inheritWeights copies parent weights at birth before the parent's current update; child updates reset to0. Default off and labeled experimental |

The same settings are available in controls, JSON/files and browser configuration storage. [Example](../examples/world.v1.json), [schema](../schemas/world-v1.schema.json). The runtime additionally checks initialFood against the configured grid area. Energy-per-patch1–96, grid16–64 by16–48, organism count0–8 and maintenance1–3 are explicit supported ranges. Live population capacity48 remains a stated world rule. Disabling user caps does not remove finite space, numeric precision or CPU protection. Invalid cap reductions fail and preserve active state; food is not silently deleted. Manual additions are recorded external inputs and respect the standing cap; automatic budgets exclude manual interventions.

## Comparable starts versus demonstrations

The default neutral starting profile gives identical configured bodies/energy to founders, balances headings as far as count allows, and supplies seeded environmental food with no individual food gifts. Birth placement uses a separately seeded shuffled candidate order; the first processed organism rotates with the tick instead of always favoring the lowest ID. Environmental, birth-placement, mutation and individual decision streams remain separate. Reproducibility/common rules do not prove absence of bias: compare multiple seeds and counterbalance initial positions/headings when interpreting treatments.

Feeding, growth and reproduction profiles are explicitly labeled demonstrations. They supply authored mouth-adjacent food and/or alter energy, maturity or mutation settings. Selecting a profile visibly replaces the draft; it never silently applies it. These examples are not neutral evaluation controls. World controls and testing tools operate the same engine; independent trials require an intentional Prepare/new definition, not navigation to another hidden world.

## Try and share

1. Open Rules, choose settings, then Apply live settings or Prepare world for initial conditions.
2. Start/Pause or One world step. Toggle Testing tools only when interventions are wanted; all accepted edits are recorded.
3. Results → add observations → Copy test report. Copy denial provides selectable text; Save test report downloads JSON. Paste the complete text into the project chat.

`npm run test:replay -- path/to/report.json` accepts new world reports and old test-field reports automatically. One command is enough; the owner does not manage browser/device checks.

## Long runs, evidence and boundaries

The1600-tick engine terminal and256-total-organism birth stop are removed from this version. IDs are monotonic; the archive retains at most256 records while all living records remain present. Retired-record aggregate outcomes preserve cumulative births/deaths/intake/movement/updates. Recent history retains81 samples, events40. Lost parent details are labeled unavailable; no fabricated genealogy. Retained-genome counts are not all-time unique counts.

Reports carry a saved boundary plus at most1000 subsequent ticks and256 edits; boundaries roll automatically without stopping the world. The verifier checks resources, recorded changes, resulting state hash and metrics for that segment. From-genesis reports additionally check the genesis state. Later reports explicitly do **not** independently verify earlier summarized history. They are bounded continuation evidence, not proof of adaptation or a full resumable-app feature. Reports remain local until shared. Browser reload does not restore a live run; only small configurations are saved locally.

Numeric/resource failure pauses distinctly from reaching a chosen endpoint. Newborn controller updates start at0 even when weights are copied; old linear-td arithmetic remains bounded within the existing lifespan limits. Old ecological/test-field engines, formats and reference checks remain frozen behind explicit compatibility URLs (`?lab=legacy`, `?lab=reference`) and replay tools, not default product modes.

Browser/mobile behavior is part of the normal automated baseline (`npm run verify` / CI). Actual owner visual feedback remains valuable; routine viewport assertions are not an owner-managed phase.
