# MATHOS development instructions

## Authority and scope

- GitHub repository `Mankeluvsit/mathos` is the source of truth. Keep specifications, decisions, code, and tests versioned together.
- Read `docs/specification.md`, `docs/architecture.md`, `docs/capability-status.md`, `docs/product-context.md`, and the relevant model/format/UX documents before changing behavior.
- Preserve pixel-based artificial life, primordial and seeded genesis, multi-scale simulation, neural learning, evolution, morphogenesis, configurable universe rules, and autonomous experimentation as the confirmed direction.
- Phase 0 establishes foundations; Phase 1 and the integrated/oriented baselines are delivered as described in the roadmap. The owner authorized continuing to a bounded lifetime-learning milestone and preparing an OpenCode handoff. Follow `docs/handoff/NEXT.md`: ADR0010 and ecology-reference@3 are implemented and published, including the controller/oracle, lifecycle, paired runner and inspection. Keep v1/v2 replay unchanged; record mixed comparison outcomes honestly. Keep other deferred systems planned.
- The owner authorized the inherited-body milestone (ADR0011), implemented as separate ecology-reference@4 / cell-layout@1, with final delivery evidence in STATE. Preserve v1–3 and their fixtures, distinguish founder-origin labels from actual layouts, keep connected learning/reset semantics and report structural outcomes without tuning/fitness claims. Read inherited-body-plan.md and current STATE.
- Owner review requires recognizable organisms and observable behavior, drawing on Life Engine and The Bibites. Read docs/observable-life-plan.md. Passing accounting tests or displaying a changing pixel field is insufficient product acceptance. Preserve the mathematical laboratory and both genesis directions; never claim the references’ full feature sets are implemented.
- Label capabilities implemented, planned, or experimental with evidence. Never present a preview as an active simulation or emergence as a guaranteed result.

## Current corrective priority

- Follow ADR0013: one canonical configurable world with test tools using the same engine/configuration and active session. Preserve older replays as compatibility code; do not add a new active lab for each feature. Resource/run caps and neutral versus demonstration initialization must be explicit. World feature switches and offspring-inheritance policies are separate choices.
- This direction supersedes the separate-product implementation pattern in ADR0012. The shared-world corrections are implemented and verified as documented in docs/shared-world-guide.md. Do not present demonstration presets as neutral controls; preserve the tested removal of tick/archive-induced reproduction stops and the explicit resource limits.
- STATE.md is the single current progress/evidence record, maintained as part of the work itself. RESUME/NEXT are stable pointers. Update HANDOFF/setup only for real environment/workflow changes; no triplicated milestone summaries or separate handover-management phase. Include continuity in the same coherent work unit, not an extra status-only commit after each delivery.

## Controlled owner testing

- Owner approved the dashboard/test-field proposal and requested hideable JSON, simple live controls, prepared owner-run tests, analytics and copy/paste reports. ADR0013 and docs/shared-world-guide.md govern the default dashboard; ADR0012 and docs/test-field-guide.md remain legacy-reference documentation. Routine implementation/delivery is authorized.
- Keep test-field-reference@1 isolated from old ecology1–4. Version rules/config/commands/reports together; preserve exact external-input/output accounting and deterministic edit replay. Do not silently apply reset-required settings or discard invalid JSON drafts.
- When the owner supplies test output, save/replay their JSON or complete clipboard text with `npm run test:replay -- path/to/report.json` before proposing fixes. Inspect notes, actual tick/status, seed/settings/edits and measured behavior; resource/replay checks are not proof of adaptive success. Keep reports local unless the owner shares them; no telemetry or automatic transmission.

## Engineering

- Use TypeScript with strict checks, React, Vite, native browser APIs, and local persistence. No mandatory backend, account, external API, analytics, remote fonts, or cloud service.
- Prefer small modules and minimal dependencies. Keep domain logic independent of React, Canvas, time, and storage. Separate rendering cadence from future fixed simulation ticks.
- Future simulation randomness must use a versioned seeded generator; never use `Math.random()` or wall-clock time in state transitions. Record engine/rules/seed/configuration versions for reproducibility.
- Validate data at import and persistence boundaries. Bound resource use; reject unsupported versions without silently rewriting data. Never silently replace corrupt local data.
- Preserve the confirmed dark, colorized dashboard direction. Use the shared-conversation context as design evidence, not as authority to implement every concept feature. Verify desktop and mobile layouts separately, and keep view changes independent of simulation state.
- Preserve the owner-requested Cogmind-inspired terminal life direction documented in docs/visual-direction-cogmind.md: original role glyphs, optional bounded observation-driven cues, Classic view and reduced motion. Cosmetic effects never change scientific state or imply unobserved behavior.
- On phones, keep the default shared world organized into World / Rules / Results with one persistent playback dock; World / Organism / Results / Setup remains the legacy reference layout. Activity highlights are cosmetic, never a substitute for Start/Pause; label and explain the distinction. Keep comparisons/history out of the mobile World view and preserve active state across navigation.
- Prefer semantic HTML, keyboard access, visible focus, sufficient contrast, text alternatives, and reduced motion. Canvas is never the only source of essential information.
- Use `localStorage` for small configurations only. Keep persistence behind an adapter. Large checkpoint storage and workers are planned, not current dependencies.
- Update affected specifications and capability status with code changes. Record material architecture changes in `docs/decisions/`. Mark unresolved scientific choices explicitly instead of inventing confirmed requirements.

## Verification and delivery

- Browser/mobile coverage is a baseline automatic gate in npm run verify and CI, not a separate owner-managed workstream or repeated approval phase. Maintain those assertions with behavior changes; report delivery-impacting failures and a short final verification summary. Do not turn routine viewport checks into their own progress milestones or ask the owner to manage the matrix.

- Use Node.js 24 (`.nvmrc`) and `npm ci` from the lockfile.
- Run `npm run check` (lint, type checks, tests, production build) before proposing changes. Add meaningful tests for behavior, especially validation, persistence, and user workflows.
- Check keyboard operation and responsive layout when changing the interface. Report browser verification separately from automated DOM tests.
- Do not commit dependencies, build output, credentials, or generated scientific experiment results. UI review screenshots may be stored under docs/previews with their capture state identified. Do not select a project license without the owner's instruction.
- Work on a dedicated branch, summarize behavior and checks in a pull request, and disclose failed or unavailable checks. Never merge or enable automatic merging unless the user explicitly requests it.
- Report access failures and blockers immediately. Keep the user informed during ongoing work; do not wait silently on network approvals.
- Owner communication preference: report task progress and completion at meaningful changes, scaling detail to findings, decisions and blockers. Always include a short plain-language overall-project status. Do not invent completion percentages or repeat identical update templates.

- Heading is scientific state: body occupancy, mouths, sensing, placement, collision, selection and rendering must share transformed geometry. Keep prior engine versions replayable when changing rules. Observe body variation/competition before claiming adaptive success.

## Continuation in OpenCode

- Read `RESUME.md`, `docs/handoff/STATE.md` and the current task card in `docs/handoff/NEXT.md`. Update the single STATE record before ending or compacting; chat memory is not authoritative.
- Owner environment: Bazzite Linux. Use the documented Ubuntu Distrobox setup for development dependencies. Model access must be free and require no personal API key. Use `npm run agent`; do not enroll in paid services or silently fall back to a paid model.
- The owner authorized autonomous routine delivery on 2026-10-17: plan → implement → verify → self-review → commit/push to the existing review branch → update the existing preview → verify the live result, maintaining the single progress record within that same unit. This supersedes earlier local-only/review-before-publication wording. Do not ask again for routine publication within the approved scope. Stop for a real blocker, a change of direction, new cost or destructive action. Never merge automatically. Keep one writer; no automatic delegation or paid model fallback.
- Keep one writer and one bounded task. Subagents are optional and require an explicit request (such as `/mathos-review`) or permission; no recursive or automatic parallel writers.
- Run `npm run verify` for complete delivery evidence; `npm run verify:core` omits real browsers. For handoff/config edits also run `npm run handoff:check` and the actual OpenCode parser via `npm run opencode:check` with version 1.19.2.
- Distinguish catalog/configuration validation from successful model inference. The preparation workspace's free inference probe returned HTTP 403; do not claim that hosted or local inference was tested on the owner's machine.
