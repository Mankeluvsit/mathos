# Connected learning: review evidence

The first measurements below were captured locally from changes based on source `1fd0802` with a dirty working tree. The unchanged controller/model is now published at `d7b631a5f0cf331cdd3d8b6b0fe7ff44e473a942`; see [current delivery evidence](handoff/STATE.md) for preview and CI. Historical local logs are not retroactively labeled as clean-source runs. No parameters were changed after inspecting these outcomes. Controller linear-td@1 and RNG streams ecology-streams@1 follow ADR0010.

## What changed

Ecology-reference@3 now calls the controller during eligible organism steps, measures actual reward, finalizes death/horizon transitions and resets newborn controllers. It retains v2 physical geometry and costs with separate seeded random streams. V1/v2 code and fixtures remain unchanged. V3 definitions have an explicit learning boolean and separate storage slot.

The default local dashboard now shows learning on. Organism inspection explains the selected intent, actual action, reward, update count, input values and weight changes. Setup can freeze weights for comparison. The bounded runner executes 12 worlds, yields, supports cancellation, reports partial results and exports source/version provenance. It pauses and preserves the interactive world.

## First declared experiment

Six development seeds, both treatments, 1600 ticks each. All 12 completed with exact supplied/accounted resources. Results remain in ignored `.artifacts/learning-comparison-first.json`; `npm run experiment:learning -- .artifacts/NEW_NAME.json` reproduces the scientific values. Output must be a new file. Compute time is runtime/device-dependent and does not participate in scientific transitions.

Differences are learning-on minus frozen. Population-time sums the living population after each step. More births do not alone imply better survival. These are development seeds, not held-out evaluation.

| Seed | Survivors off | Survivors on | Birth difference | Population-time difference | Intake difference |
| --- | --- | --- | --- | --- | --- |
| 0 | 12 | 12 | -8 | -36 | +4915 |
| 1 | 11 | 10 | +9 | +1080 | +7739 |
| 2 | 13 | 16 | +3 | -1639 | -1629 |
| 42 | 11 | 6 | +12 | +5643 | +11352 |
| 123456789 | 12 | 9 | +6 | +2358 | -2804 |
| 4294967295 | 18 | 16 | +8 | -2216 | -5953 |

Learning finished with more survivors in one seed, the same in one and fewer in four. Three seeds gained more total food, three less. Population-time increased in three and decreased in three. This is mixed evidence, not a demonstrated general improvement. The objective rewards feeding efficiency, not directly reproduction or diversity; the local immediate bootstrap and partial observations are known limitations. Preserve these negative outcomes when evaluating later changes.

## Checks

`npm run verify` passed: **143 tests in 16 files**, lint, strict TypeScript, production build, three independent Python references, v1/v2/v3 ecology goldens, and Chromium156/Firefox157 workflows. Both browsers ran all 12 comparison worlds plus cancellation, verified current observations against the Node engine and v3 endpoints against the regression captures, and exercised learning settings/export/import and320/390px layouts with zero external runtime requests. The original v1/v2 model files and captures are unchanged.

One browser test initially clicked an off-screen canvas after switching to the legacy model. Scrolling the canvas into view corrected the test interaction; both browsers subsequently passed. Screenshot review led to a more compact checkbox, earlier learning details, closer desktop comparison placement and a separate progress meter that does not repeatedly announce percentages. Final focused UI rechecks passed:143-test lint/types/test/build gate, then old and new ecology workflows in both browsers after the layout/progress adjustments.

The OpenCode 1.19.2 actual parser passed all profiles/agents/commands/skill; handoff links and diff whitespace checks passed. Separate self-review checked ADR equations/lifecycle order, update eligibility, child reset, copied diagnostics, cancellation and truthful labels. No second agent/model review was performed. This paragraph describes the original local checks. Subsequent remote CI/preview evidence is recorded in handoff/STATE.md; no owner-device Bazzite run is claimed.

## Owner review

Use the [capture index](previews/learning/README.md) for actual desktop/phone states when available. Check whether the explanation connects visibly to one organism's behavior and whether learning on/off is understandable. Captures cannot prove ecological improvement. [Live MATHOS](https://mankeluvsit.github.io/mathos/?v=learning-terminal3) now serves the published connected build. Routine delivery is authorized; visual feedback remains welcome. No automatic merge.
