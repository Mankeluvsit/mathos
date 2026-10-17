# ADR0012 — configurable, replayable test field

Accepted under owner approval of the desktop/mobile concept and request for hideable JSON, easy on-the-fly dashboard controls, prepared tests, analytics and copy/paste reports. This is a separate bounded laboratory, not a silent rule change to ecology-reference@1–4. Implementation/evidence status is in STATE.

## Scientific boundary

New identity test-field-reference@1, configuration mathos-test-field version1. Reuse cell-layout@1 and linear-td@1 arithmetic and explicit ecology streams; parameterize a separate lifecycle/measurement module. Preserve all old model files/formats/fixtures. At most eight ticks per runtime batch; stop after a measured8ms (individual ticks cannot be preempted),1600 absolute ticks,48 living/256 archive entries,81 history samples and256 accepted author edits. No mandatory service or new dependency.

Strict config keys: format/version/name/seed/world/rules/organisms/test. Name1–80 characters; uint32 seed; world exactly width16–64,height16–48. Rules exactly foodEnergy1–96 (energy per newly supplied food patch), sunlight0–8 (placement attempts per step, not guaranteed patches), upkeep1–3 (energy per developed cell per step). Organisms exactly startingEnergy40–300 (new authored organisms), learning boolean, structuralMutation boolean. Test exactly preset feeding|growth|inheritance|empty and steps1–1600. Integers only, no coercion, unknown keys reject,64KiB imports. Nested configs frozen/copied. Schema/example and controls describe the same contract. Advanced controller equations, arbitrary code, mutation-rate editors, arbitrary genome editors and predation remain planned.

Width,height,seed,preset require explicit Prepare/reset; other fields apply at a step boundary. Starting-energy changes affect subsequently authored organisms, never refill existing ones. Changing learning freezes/resumes updates without erasing earlier experience; newborns still reset. Test horizon is an absolute target from preparation; reaching it pauses/completes. Increasing it allows continued execution up to1600. Draft/invalid JSON never mutates the active world. JSON is hidden by default and toggleable without losing draft text; controls and valid JSON synchronize. Invalid text remains editable; controls cannot silently overwrite it. Restart-required edits are labeled and never trigger a hidden reset.

## Test engine and accounting

Same fixed scaffold and shared cardinal geometry, prefix development,48/256 caps, intake24 per mouth/storage600, movement/turn/reproduction/genetic ranges as ADR0011, with explicit grid dimensions and configured upkeep/sunlight/new-patch energy. Reward remains clamp(intake−mechanical−actualUpkeep,−32,32); measured-input limits expand to upkeep18. Versioned separate lifecycle makes old ecology fixtures immutable. The new engine is not numerically interchangeable with old ecology runs.

Three authored demonstrations plus an empty field: feeding (one mature grazer, nearby food), growth (two juveniles with resources), inheritance (four mature bodies/resources). Exact initialization is code-versioned; seed controls random food and streams. These are illustrative test setups, not held-out fitness evaluation or guaranteed evolutionary success. Prepare sets the scenario, pauses at0 and clears prior edits/history/report; Run executes to the chosen horizon, Pause/Step allow inspection.

Author tools: select, add food, add a mature dart/grazer/scout at a grid site, erase food/body, rotate selected body by a quarter-turn, clear field. UI supports pointer/touch and coordinate inputs/keyboard alternatives. Place/rotate must pass geometry/collision checks; bodies share geometry with rendering. Author-added organisms receive fresh stream/controller, unique archive ID and explicit external energy. Erased organisms are recorded as removed by user, distinct from biological deaths/births. No unsupported walls in this slice.

Ledger: initial + sunlight + externalIn = food + stores +8×developedCells + dissipated + externalOut. Food edits top up a site to the configured amount, never silently remove excess; only the positive difference is input. Erase/clear transfer removed food/store/structure to externalOut. Live rule/heading edits create no resource. Every transition validates exact accounting and bounds.

## Edit/replay contract

Commands have exact tick (boundary before next transition), kind and validated payload; sequential array order resolves same-tick edits. Kinds config(full canonical config), food(x,y), add(x,y,direction,bodyPlan), erase(x,y), rotate(id,turn left|right), clear. Inputs/caps/placement validate before mutation. Accepted edits only are retained, at most256; rejection leaves world/log unchanged and produces a readable error. Replay applies edits at recorded boundaries, including current endpoint edits, and advances fixed steps from the complete initial config. Rate, views, selection, JSON visibility, notes and rendering never enter scientific state.

One bounded Undo restores the immediately previous author edit only while still at that tick; advancing invalidates undo. Undo removes that edit from the effective replay list and is disclosed in the report. No arbitrary time reversal or checkpoint claim. Reset begins a new declared test.

## Analytics and owner-to-agent workflow

Owner selects a prepared scenario, presses Prepare, runs/steps/edits, adds optional observations, then presses Copy test report or Save test report. Reports stay local until the owner deliberately shares them. No telemetry/transmission or automatic messages.

mathos-test-report version1 contains engine/geometry/controller/RNG identities, application revision/dirty flag, initial config, accepted tick-addressed edit list, actual final tick, test status, final SHA256 of canonical complete scientific state, resource ledger and exact-accounting check, births/biological deaths/authored removals/introduced organisms, intake, movement/turns, learning updates, structural proposals/accepted changes/developed sizes, bounded history, up to10 recent errors, up to2000 characters owner notes and basic viewport/browser context. It is a replay recipe plus observations, not an importable snapshot. Byte limit1MiB. Human-readable clipboard text includes the machine JSON so the agent can reproduce the exact run; download provides JSON. Clipboard failure exposes selectable text as a fallback, never claims success.

Reports label edited versus unedited tests, actual versus requested steps, interrupted/incomplete versus completed, and measured outcomes versus mechanical checks. Passing accounting/replay is not proof of beneficial learning or adaptation. A Node replay tool verifies final hash and metrics from the recipe; native-browser tests check the same path and source provenance. Any bounded output limit is explicit; never truncate replay commands and claim completeness.

## Layout and verification

Keep the working Living world, add a Test field workspace that preserves and pauses each on switching. Desktop quick controls / field / optional JSON; phone field/tools first with separate settings/results destinations and persistent playback. Hiding JSON leaves more room for the field. Essential results and tools use semantic HTML; high contrast,44px touch targets, keyboard access and reduced motion.

Verify strict config/schema parity; hand-worked resource/edit/growth costs; deterministic initialization/full trajectories; dimension-aware geometry; learning toggle/fresh authors; edit rejection/undo/caps/replay/report hash; runtime pause/hidden-tab/dispose; desktop/phone JSON show/hide/import/export/synchronization; prepared test completion, clipboard success/fallback and downloaded report Node replay. Preserve all old references/fixtures/browser workflows. Publish actual screenshots and complete checks, not the concept image as implemented evidence.

## Initialization and fingerprint details

For presets other than empty, make1/2/4 founders for feeding/growth/inheritance respectively. Single feeding grazer starts at(floor(width/2)−3,floor(height/2)), north. Others use x=floor(width×0.3/0.7), y=center for growth or floor(height×0.3/0.7) for inheritance; headings id−1 modulo4, templates cycle dart/grazer/scout. Growth begins with2 developed cells; other presets use the full founder layout. Initial energy is the configured new-organism energy. Make floor(width×height/3) seeded food-placement attempts, then ensure a configured food patch at each initial mouth and its cardinal neighbors if empty/in-bounds; every successful addition enters initial accounting. Empty has no initial resources/organisms. These exact authored scenarios are versioned, not parameter tuning of the original ecology.

Canonical scientific-state encoding recursively sorts object keys, preserves array order and encodes Uint16Array as numeric arrays before SHA256. Live config changes cannot lower the target below the current tick. If an author edit occurs at an existing sampled-history tick, replace that sample with the edited boundary state; do not fabricate extra intermediate history.
