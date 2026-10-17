# ADR0013 — one world model, explicit choices, integrated progress

Status: accepted product direction from owner feedback. The shared-world increment is implemented on the working branch; deployment is verified through the preview manifest and PR. See ../shared-world-guide.md for exact delivered controls and boundaries. Supersedes ADR0012's separate active product workspace/model direction for future development; existing formats and scientific replays remain preserved.

## Problem observed in the repository

The app keeps Living world and Test field mounted as separate paused/preserved simulations. Test field has a copied, parameterized lifecycle. Its authored demonstrations place extra food beside mouths, and its presets change population, maturity, energy and mutation settings together. Those examples aid explanation; they are not neutral experimental controls. Replenishment has no configurable standing-food or cumulative-supply cap. The world has a hard1600-tick endpoint, not an optional user stopping rule. Old lineage/archive limits can also stop reproduction. Repeated status copies in RESUME/STATE/NEXT and separate handover commits have obscured product work.

## Product decision

- One canonical configurable world engine and configuration contract serve ordinary play and controlled testing. Test field exposes tools/protocols around that same model. Switching tools or views preserves the same active run; it does not initialize a second hidden world.
- Independent worlds are created only for explicitly requested trials/comparisons. They use the same engine and recorded settings. Old engines remain replay compatibility/reference code, not a new dashboard destination for every feature.
- Default configuration changes are explicit and reviewed. A new feature does not silently change existing saved configurations or every organism. Unsupported choices are labeled planned rather than represented by working-looking switches.
- Mathematical/reference models remain accessible as intentional technical references; their existence must not be confused with multiple biological rule sets for the main world.

## Configurable resources and stopping

Expose equivalent dashboard controls and validated JSON for these independent choices:

| Choice | Meaning |
| --- | --- |
| Initial food | Amount/distribution supplied at genesis; independent of later replenishment |
| Replenishment on/off and rate | Whether new food is supplied, and placement attempts per tick |
| Standing food cap on/off + value | Maximum food energy present at once, including partly eaten patches |
| Replenishment budget on/off + value | Maximum cumulative energy supplied after genesis; consuming food does not renew this budget |
| Stop at step on/off + value | A chosen endpoint, or run until paused; reporting uses actual observed ticks |

“No cap” means no user-imposed resource cap, not infinite food in one cell. Patch capacity, energy accounting and finite space stay explicit. Do not quietly delete food when lowering a cap: pause/reject an incompatible edit, leaving the prior state intact. Record all accepted edits and supplied/removed energy. Initial food and manual additions are separate ledger entries, not hidden free replenishment.

Run-until-paused requires removing the1600 engine terminal and decoupling historical storage from reproduction. Bound CPU batches/history/storage independently, and make resource-related pauses explicit; never report them as scientific completion. Keep deterministic continuation and feasible replay/report verification. A checkbox over the current hard limits would not satisfy this requirement. Old endpoint-dependent learning/replay semantics stay unchanged in old versions.

## Feature adoption and biological inheritance are different

Every new scientific capability declares its configuration key, default, live/restart behavior, effects, interactions, inheritance policy and verification. The same choices must exist in the testing tools before adoption into the ordinary world profile. Presentation-only preferences never become inherited genes.

| Control group | Examples / intended effect |
| --- | --- |
| World capability | Enable learning updates, reproduction or structural mutation under common rules |
| Inherited traits | Explicit policy for body layout and scalar genetic traits; copying versus resetting to the configured founder baseline |
| Learned state | Reset child controller weights (current policy), or an explicitly selected/tested experimental weight-copy policy |
| Mutation | Whether inherited material may vary, independently of whether a parent trait is copied |

These are planned policy choices, not claims they are all implemented. Keep developmental growth distinct from birth mutation, and inherited learned weights distinct from new learning updates. Define energy/cost/reset semantics before each policy is implemented. New scientific settings require a new shared version; do not retrofit old reports.

## Neutral tests and demonstrations

Label authored demonstrations separately. A neutral test uses recorded initialization without individual food gifts, common rules/energy/allocation, and a declared placement/orientation policy. A seed makes a trial reproducible; it does not prove fairness. Compare feature treatments using a frozen protocol, explicit changed factors, repeated seeds and counterbalanced positions/headings where relevant. Separate environmental randomness from organism decisions. Record manual interventions as edited trials, and retain negative outcomes. Avoid changing several unreported factors under a single “test” label.

## Work and continuity

STATE.md is the single current development record: task, results, open work and next action. The active agent updates it as part of the same coherent work unit, using the progress/evidence already gathered. RESUME/NEXT remain stable pointers; HANDOFF/setup/provider documentation changes only when environment or workflow changes. No owner-maintained handover checklist, separate management phase, or extra commit solely to copy status across files. Before interruption, save one concise partial record. Derive chat updates from this same work; do not automatically invent summaries, successful checks or unseen repository state.

## Delivery sequence and acceptance

1. **Workflow correction (this unit):** establish this contract; remove duplicate current-status records and conflicting agent instructions. App remains unchanged.
2. **Shared model/configuration:** implement one next-version engine, explicit resource/stopping policies, neutral versus demonstration initialization and safe bounded history. Preserve old reports and add deterministic ledger/cap/long-run tests. No second new active lab.
3. **One dashboard/run:** connect the same active state/config to world and testing controls, hideable JSON, presets with visible differences, partial/completed reports and explicit intervention labels. Verify equivalent results from dashboard versus JSON and view switches without extra sessions.
4. **Feature policies and comparisons:** add explicit adoption/inheritance controls incrementally, with meaningful on/off/reset/copy tests and a common comparison protocol. Explain what each option changes before treating it as supported. Then owner-run tests feed normal development; no separate handover workstream.

Do not add family-map accents, another showcase mode or unrelated simulation features ahead of this correction. Current delivery evidence and the next bounded implementation task live only in ../handoff/STATE.md.
