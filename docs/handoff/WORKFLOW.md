# One unit of work

The owner approved automatic **local** implementation and verification, followed by review before publishing. Do not repeatedly ask to run reversible local checks. Do not push, publish a preview, merge or purchase services under that local-only setting. Present the concrete result before asking to publish. Model access must stay free and require no personal API key.

## Loop

1. **Recover:** read AGENTS.md, RESUME.md and STATE.md; inspect `git status`, recent commits and the actual affected files. Preserve unfinished work. Find the active NEXT.md card. Newer code/GitHub evidence beats a stale handoff statement.
2. **Plan:** write a small task card in STATE.md using the template below. Read the relevant ADR and tests. Name exact inputs, allowed files, version boundaries and measurable acceptance. Keep one unit small enough to review in a single diff; split model, runtime, UI and format work when their contracts can be tested separately.
3. **Implement:** one writer. Keep pure engine changes separate from rendering/time/storage. Retain previous version semantics and fixtures. Validate before replacing active state or storage. Do not add dependencies or services merely to make a weaker model's work easier.
4. **Verify narrowly:** run the affected test with `npm test -- tests/NAME.test.ts` using the real filename. Read the actual error; write a minimal case when necessary. Do not broaden edits based on guesses. Data/docs/config changes need their corresponding validator/link/config checks.
5. **Verify fully:** `npm run verify`, plus `npm run handoff:check` for handoff edits and `npm run opencode:check` for agent/config edits. Read every exit code. Never report success based only on a command being started. Save large logs under ignored `.artifacts/`, include concise results in STATE.
6. **Review:** compare the diff with every criterion. Check cross-file contracts, version isolation, truthful labels and user-visible behavior. `/mathos-review` requests the read-only reviewer in a separate context. Without that explicit delegation, do a separate self-review and label it honestly. The reviewer returns PASS, NEEDS_CHANGES or BLOCKED; it does not run tests or publish.
7. **Repair or stop:** fix a concrete failure and repeat the affected checks. After two unsuccessful attempts on the same symptom, record a blocker with command, environment, minimal input, expected/actual result, hypotheses tried and next diagnostic. Stop that unit; no infinite agent loop, fixture rewriting, disabled checks or broad speculative refactor.
8. **Capture and deliver:** update STATE, RESUME and affected model/format/UX/status documents. Tell the owner what works, what was checked, what they can try and what remains. Local check success is not CI, source publication, preview deployment or owner visual approval.

## Task-card template

Copy this structure into STATE and fill it with facts from the chosen NEXT card (these are work fields, not personal setup placeholders):

```text
Task ID / goal:
Starting branch and commit:
Inputs read:
Allowed files / version boundary:
Explicit non-goals:
Done-criteria (each observable):
Verification commands and actual outcomes:
Review method and findings:
Decision or blocker:
Next exact action:
```

## Gates a weaker model must not waive

- Model: deterministic seeded integer ticks, copied state, exact ledger, bounded numeric/population/history/work, shared heading geometry; old v1/v2 trajectories remain unchanged.
- Learning: measured reward/action/observations, bounded updates, separately versioned learned state, explicit inheritance/reset policy, fixed-policy ablation and negative results. Genetic variation alone is not learning.
- Data: schema/runtime validator/example/storage key agree; unknown versions and oversize inputs reject; exports say starting definition or observations, never checkpoint without resume state.
- UI: recognizable organisms, real motion/turning, accessible text values, keyboard/focus and mobile state preservation; no fabricated charts or runtime network calls.
- Tooling: actual OpenCode parser, exact executable/package versions, platform-appropriate commands; do not transfer ChatGPT-only connectors as executable tools.
- Delivery: existing user edits retained, no secrets/data results/dependencies/build output in source, no automatic merge. Do not select a license.

## Context and cost

Use file search to locate relevant modules; read a bounded set. Keep only the current contract, failing example and recent diff in active context. Repository documents hold long-term memory. The task step limit is a backstop, not a budget guarantee. Free endpoints can rate-limit or disappear. A session reset does not reset the provider's allowance.

Before `/compact`, switching models, an interruption or leaving the terminal, use `/mathos-checkpoint`. `opencode stats` reports local client usage estimates, not remaining ChatGPT allowance or a guaranteed provider quota. Never infer a percentage from conversation length.

No unattended scheduler, recursive delegation, paid fallback, or auto-publish loop is configured. The default automated work is the local edit/test/repair loop for one card. The owner can explicitly request a review subagent with `/mathos-review`; this is not blanket authorization for parallel writers.
