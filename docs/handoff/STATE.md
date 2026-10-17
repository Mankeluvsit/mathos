# Current development progress

## Delivered implementation: one shared configurable world

ADR0013 is implemented as `mathos-world@1`, the canonical path in src/world and the default WorldLab dashboard. Testing tools reveal controls on the same active session, without a second world or a reset. Old engines, fixtures and replay formats remain compatible behind explicit legacy/reference URLs. Follow [the shared-world guide](../shared-world-guide.md) for the actual settings and limitations.

- Rules/JSON/files expose replenishment, standing food-energy cap, cumulative automatic-supply budget and optional stopping. Each cap/endpoint can be disabled. Applying live rules preserves the run; changing initial conditions requires an explicit reset. Invalid drafts are retained, never exported as accidental unlimited settings.
- Neutral founders share genes/energy with balanced headings and no individual food gifts; authored demonstrations are labeled. This reduces known setup bias; it is not a claim that every model rule is unbiased.
- Reproduction, learning, scalar/structural mutation and offspring body/trait/controller inheritance are separate switches. Actual inheritance choices are recorded at birth. Controller copying is experimental, not demonstrated adaptive success.
- Runs continue past1600 ticks and256 historical identities. Monotonic IDs, bounded archives and rotating processing remove the prior artificial stops. Population/numeric/resource limits remain explicit. Reports verify genesis or the latest bounded checkpoint segment; earlier summarized history is not independently verified by a recent-segment report. Reload does not restore a running world.
- World / Rules / Results share state on phones, with persistent playback and hideable JSON. Results include notes, ledger/behavior analytics and copy/save reports for owner feedback. No telemetry or mandatory service.

## Verification and delivery evidence

Starting source: 3f1995d4c8347138246e0a81606b9f2ed92846b4; the current checkout and preview manifest are authoritative.

The implementation unit passed `npm run verify`:205 tests in24 files; lint, TypeScript, production build; independent references and frozen fixtures; native Chromium/Firefox workflows, including the default shared world, touch controls, report replay and desktop/phone layouts. CLI replay also matched a2201-tick latest-segment report. Handoff/config checks passed, including the actual OpenCode1.19.2 parser. A separate self-review checked version isolation, exact accounting, control semantics and truthful report scope. No physical-device or Safari certification is claimed.

Publication is the final step of the same unit, not another handover task. For exact current source/deployment/CI facts, inspect the [public preview manifest](https://mankeluvsit.github.io/mathos/preview.json), [existing review PR4](https://github.com/Mankeluvsit/mathos/pull/4) and its checks. Source is built from a clean commit; public smoke must verify that manifest and the shipped controls. Do not infer live delivery merely from this file or a screenshot. Review URL: https://mankeluvsit.github.io/mathos/?v=shared1 . PR4 stays open/unmerged.

## Next action

On resumption, fetch GitHub, inspect local changes and compare the preview manifest with the branch before editing. If publication/live verification is still pending, finish it first under standing authorization. Otherwise continue the next small model-observation task: investigate behavior traces and map-family effects using this shared world, preserving untuned outcomes and old replay boundaries. Prioritize actual owner-reported failures or shared-world test reports over adding another workspace. Do not infer a new visual or scientific claim from accounting tests alone.

The broader project remains active: arbitrary anatomy, predation, true primordial genesis, multi-scale simulation and autonomous research remain planned. Existing learning is bounded linear TD; no claim of generally improving intelligence. Historical evaluation outcomes remain in [evaluation-results-v4-01.md](../evaluation-results-v4-01.md), not a validation of new-world neutrality or success.

## Working convention

Maintain this single progress record within normal implementation work. RESUME/NEXT remain stable pointers. Setup/HANDOFF changes only for actual environment/workflow changes. Browser/mobile checks are an automatic verify/CI baseline, not an owner-managed workstream. Never merge automatically, introduce paid services or silently replace old fixtures. Preserve unfinished work when switching machines or agents.
