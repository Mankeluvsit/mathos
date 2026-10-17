# Current development progress

## Active priority: consolidate the world and its testing

Owner feedback supersedes feature expansion: multiple active simulation experiences and implicit rules muddy a neutral playing field. Tests must evaluate the same configurable world. Food limits, optional step limits, feature adoption and offspring inheritance must be explicit choices. Continuity must follow ordinary development progress rather than become a separate management project.

[ADR0013](../decisions/0013-shared-world-and-testing.md) records the accepted direction, actual shortcomings, delivery sequence and acceptance criteria. Its simulation changes are **planned**, not live. Workflow correction and single-record continuity are implemented in this documentation/agent-instruction unit. No app/engine/schema changes in this unit; the preview retains the verified baseline below.

## This corrective unit

Completed: ADR0013, one current progress record, stable RESUME/NEXT entry points, and aligned development/OpenCode instructions. Verification: npm run check passed191 tests/22 files plus lint, strict types and production build; handoff links and actual OpenCode1.19.2 parsing passed all profiles/agents/commands. No app/engine/test/schema files changed, so existing native/public/three-platform evidence below remains the runtime baseline. No preview redeployment or separate handover-only commit is needed. The new simulation policies remain planned.

## Verified baseline

- Review: https://mankeluvsit.github.io/mathos/?v=inheritance1
- App source: c3e7ebc1751b7435bd9b2e5ae6b627fe218e8e10; Pages deployment: e0848b97fca8215e5234f94c3f572562c4ccbad8.
- Source CI39056254497 passed Linux, Windows and macOS. Full local gate passed191 tests/22 files, four independent references/old fixtures and native Chromium/Firefox workflows. Public Chromium verified diagrams, Node lineage/report replay, phone layout and all current artifact hashes, with no external runtime requests.
- Current behavior: separate Living world model4 and test-field-reference@1; body inheritance, bounded lifetime learning, prepared tests, JSON/files and copyable replay reports. Authored food placement aids demonstrations. No user food-supply cap or optional hard endpoint. Old archive limits affect reproduction; these must be addressed before advertising run-until-paused.
- [Visual contract/capture](../evolution-visuals.md), [test-field guide](../test-field-guide.md), [untuned evaluation outcomes](../evaluation-results-v4-01.md). Mixed outcomes; no general adaptive-improvement claim. Physical-device/Safari certification remains unavailable.
- PR4 remains open/unmerged. Preserve old engines, fixtures and replay formats. Existing source/preview publication remains authorized; never auto merge.

## Next bounded implementation

Implement the shared next-version rule/configuration contract and pure engine before another visual feature. Start by inventorying the duplicated lifecycle and defining exact food-cap/budget, stop policy, neutral initialization and archive/offspring-ID behavior. Separate biological rules from runtime/storage protection; define compatible report replay before exposing a run-until-paused switch. Do not add another user-facing engine/workspace. ADR0013 defines the choices, not final numerical defaults or an already implemented format.

Done: one pure canonical implementation, dashboard/JSON-ready validated settings, exact resource-accounting tests at cap boundaries, deterministic longer-than1600 continuation without an archive-induced reproduction stop, explicit resource pauses and unchanged old replays. Follow with one dashboard/session and common test protocols; then expose supported feature/inheritance options incrementally. The bounded behavior-trace investigation and map-family effects are lower priority until this correction is coherent.

## Working convention

This is the single current progress/evidence record. Update it once per coherent unit or actual interruption using the work already done. RESUME/NEXT are stable pointers; setup/HANDOFF changes only for real environment/workflow changes. Include the next action and failed/unrun checks here. No owner-maintained handover task or separate handover-only milestone. Historical delivery snapshots remain in Git; inspect actual code/GitHub rather than reconstructing them from chat.
