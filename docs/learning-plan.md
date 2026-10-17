# Learning milestone

Status: the local build connects the controller to ecology-reference@3, with inspection, on/off settings and paired comparisons. GitHub Pages still serves the older v2 preview until publication. [Evidence and limitations](learning-verification.md).

## What this does, in plain language

1. An organism senses nearby food and its stored energy.
2. It chooses a direction. Its body must still turn or move according to the physical rules; walls and other organisms can block it.
3. Food gained helps its reward; movement and upkeep reduce it. Those measured results adjust small internal weights used for future choices.
4. Offspring inherit traits but start with fresh weights. Learning during life and evolution across generations remain separate.
5. Switching learning off freezes those weights. The comparison runs both settings across the same six seeds and reports every result, including worse outcomes.

Try the local build: press One step, select Organism, and read Learning during life. Inspect the latest reward and actual weight changes. In Setup, uncheck Enable lifetime learning and Prepare new world to run the frozen treatment. On the World view, Compare learning on / off runs separate test worlds without replacing yours.

The tests first check that calculations, lifecycle, save/load and controls work. Experiments then ask whether outcomes improve. A passing test suite does not guarantee improved survival; the first six-seed experiment had mixed outcomes.

## Deliverable sequence

1. **L1 contract:** bounded features/actions/reward/update, lifecycle order, RNG streams, terminal behavior, inheritance reset, integer examples and explicit v3 format. Use the ADR as the algorithm authority; do not keep a competing equation in task cards.
2. **L2 isolated controller:** pure TypeScript, no browser/engine imports except the existing seeded RNG; independent Python fixtures and hand-checked anchors. Test action choice, enabled/disabled updates, copying, validation, saturation and bounded repeated transitions. This was completed before integration.
3. **L3 v3 integration:** new engine, strict definition/schema/example/storage and explicit dispatch, exact accounting, newborn reset, terminal diagnostics and unchanged v1/v2 fixtures. Keep v2 selectable and replayable. Verify lifecycle timing including juvenile motor development, blocked actions, death and the last permitted tick.
4. **L4 paired runner:** frozen and learning v3 for each seed `[0,1,2,42,123456789,4294967295]`, 1600 steps each (maximum12 runs). Start both with matching world/controller/RNG state except the learning flag. Yield/cancel without mutating the interactive world; preserve completed/partial/failed outcomes.
5. **L5 inspection:** show learning/frozen, food inputs, chosen intent versus actual movement, last reward/delta, update count and actual weight changes. Label juveniles as not yet eligible. Maintain accessible text, phone navigation, fixed-step inspection, working save/import/export and no runtime network calls.
6. **L6 evidence:** full checks, browser replay, paired reports, responsive captures, measured overhead, synchronized handoff and owner review before publication. No automatic merge.

## Comparison and done-criteria

The hypothesis is that within-life updates can alter decisions and may improve feeding efficiency or persistence under these authored rules. Neither improvement nor emergence is promised. Freeze the ADR parameters before running the paired comparison. Report each seed's learning-minus-frozen difference for births, deaths, survivors, first extinction tick, population-time and total intake; also report peak population, generations and actual update counts. Keep exact resource accounting for both arms.

The six seeds already used for baseline preparation are development seeds, not held-out evaluation. If results inform parameter changes, disclose the tuning and the version change; predeclare additional unseen seeds before a later evaluation. Do not omit extinct or worse-performing runs or substitute v2 for the same-engine frozen control. Describe mixed or no improvement directly. No significance or universal superiority claim follows from these six runs.

Record source commit plus dirty state, engine/controller/RNG-stream versions, complete starting definitions, declared seeds/horizon, actual completed ticks, cancellation/failure reasons and metric definitions. Scientific results stay in ignored `.artifacts/`; small independent algorithm fixtures are committed test inputs. Performance observations use wall time only outside the engine and must state hardware/runtime; they never affect decisions or rewards.

## Verification gates

- Controller: independent arithmetic fixtures and fixed hand cases, exact signed truncation, counters and numeric bounds; disabled learning changes neither weights nor update count. Deterministic exploration consumes two words even when the greedy action wins.
- Integration: transitions use retained pre-action observation and selected intent; actual debits determine reward; motorless juveniles get no update; death and horizon terminate bootstrap; each child resets controller and receives its own stream. Every diagnostic agrees with the action actually performed.
- Compatibility: original Python references and v1/v2 ecology goldens pass unchanged. Definition validators, schema, examples, dispatch, storage and export identities agree; no implicit migration or checkpoint claim.
- Product: moving pixels alone do not prove learning. Review real action/reward/weight changes in both desktop and mobile inspection. Comparison work yields/cancels and never stalls or changes the active world.

Run `npm run verify` for delivery and `npm run handoff:check` for current memory links. Keep the next exact action and passing/failing checks in [STATE](handoff/STATE.md) and [RESUME](../RESUME.md). Only advance a card when its own criteria pass.
