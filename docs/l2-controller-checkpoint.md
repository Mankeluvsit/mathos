# L2 experimental learning controller — integration checkpoint

This branch starts from PR #4's organism simulation and preserves the existing v1/v2 engines. The pure controller is not wired to ecology v3, UI, save formats, or a paired comparison runner.

Files: `src/ecology/learning-controller.ts` and `tests/learning-controller.test.ts`.

The controller implements the L1 candidate equations from `docs/handoff/NEXT.md`: four actions, six bounded inputs, Q8 integer weights, first-maximum ties, clipped TD update, terminal handling and a frozen arm. Eleven focused test cases are included. The original standalone JavaScript prototype passed 11/11 Node tests; repository TypeScript, lint, Vitest, browser and CI gates must be checked on this branch.

**Open decisions before calling L1 accepted or integrating v3:**
- Verify TD value/reward scaling and integer rounding against an independent oracle.
- Define exploration RNG streams, draw schedule and non-motor juveniles.
- Define rewards using actual movement cost, intake and upkeep, including fallback turns.
- Define precise lifecycle ordering around death, reproduction and next observations.
- Keep learned weights out of inheritance, preserve v1/v2 replay, and establish a fair frozen/learning comparison.

No merge is authorized. OpenCode infrastructure work is outside this branch.
