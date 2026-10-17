---
name: mathos-verification
description: Verify MATHOS model, data, UI and documentation changes while preserving prior deterministic trajectories.
compatibility: OpenCode 1.19.2; Node.js 24; Python 3.10+; Chromium and Firefox through the repository Playwright lockfile.
---

1. Read the task card, AGENTS.md and relevant model ADR. Record the old version and invariants before editing.
2. For a narrow code change, run its existing focused test file with `npm test -- tests/oriented-ecology.test.ts` (choose the actual affected test). Add behavior tests for new semantics: invalid inputs, version routing, resource accounting, boundedness, immutability, replay, cancellation or import/storage as applicable.
3. Run `npm run verify`. It checks three independent Python references, v1/v2/v3 ecology golden regressions, lint, strict types, all unit/DOM tests, production build and actual Chromium/Firefox workflows. All must exit zero. `npm run verify:core` omits browsers and is not full delivery evidence.
4. Golden ecology files are regression captures from production code, not independent scientific oracles. Never change old fixtures merely to match new behavior. New model rules need a new version, equations, hand-worked examples and an independent oracle where feasible.
5. UI work also needs actual desktop and 320/390px checks, keyboard/focus, mobile view state, reduced-motion behavior, truthful text alternatives and no external runtime requests. Existing automated browser checks help but do not certify accessibility or owner acceptance.
6. Read the diff again against done-criteria; use the read-only reviewer when explicitly requested/allowed. Capture failures and limits. Update docs/handoff/STATE.md, RESUME.md and affected specifications/status before delivery.

When tool/config files change, also run `npm run handoff:check` and `npm run opencode:check` using OpenCode 1.19.2. Provider authentication, model quality and optional MCP execution require separate smoke evidence; a configuration parse is not proof of those capabilities.
