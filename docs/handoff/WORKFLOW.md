# One unit of work

The owner authorized autonomous routine delivery on 2026-10-17: plan → implement → verify → self-review → commit/push to the existing review branch → update the existing preview → verify the live result → refresh handoff. This supersedes earlier local-only/review-before-publication wording. Do not ask again for routine publication within the approved scope. Stop for a real blocker, a change of direction, new cost or destructive action. Never merge automatically. Keep one writer; no automatic delegation or paid model fallback. Model access must stay free and require no personal API key.

## Switching development environments

ChatGPT/Codex and OpenCode follow the same loop. After each unit, refresh RESUME.md and STATE.md, advance NEXT.md only when its criteria pass, and update affected specifications. Record source commit, local changes, actual test results, remaining blockers and the next action. Do not copy private account usage into GitHub.

Use one active writer across environments. Before switching machines, check both working trees for unfinished edits. Save the verified checkpoint to the working GitHub branch under the standing delivery authorization. Fetch that branch on the receiving machine and reconcile any local edits before continuing. A handoff file does not transfer uncommitted source or synchronize machines automatically.

## Loop

1. **Recover:** read AGENTS.md, RESUME.md and STATE.md; inspect `git status`, recent commits and the actual affected files. Preserve unfinished work. Find the active NEXT.md card. Newer code/GitHub evidence beats a stale handoff statement.
2. **Plan:** write a small task card in STATE.md using the template below. Read the relevant ADR and tests. Name exact inputs, allowed files, version boundaries and measurable acceptance. Keep one unit small enough to review in a single diff; split model, runtime, UI and format work when their contracts can be tested separately.
3. **Implement:** one writer. Keep pure engine changes separate from rendering/time/storage. Retain previous version semantics and fixtures. Validate before replacing active state or storage. Do not add dependencies or services merely to make a weaker model's work easier.
4. **Verify narrowly:** run the affected test with `npm test -- tests/NAME.test.ts` using the real filename. Read the actual error; write a minimal case when necessary. Do not broaden edits based on guesses. Data/docs/config changes need their corresponding validator/link/config checks.
5. **Verify fully:** `npm run verify`, plus `npm run handoff:check` for handoff edits and `npm run opencode:check` for agent/config edits. Read every exit code. Never report success based only on a command being started. Save large logs under ignored `.artifacts/`, include concise results in STATE.
6. **Review:** compare the diff with every criterion. Check cross-file contracts, version isolation, truthful labels and user-visible behavior. `/mathos-review` requests the read-only reviewer in a separate context. Without that explicit delegation, do a separate self-review and label it honestly. The reviewer returns PASS, NEEDS_CHANGES or BLOCKED; it does not run tests or publish.
7. **Repair or stop:** fix a concrete failure and repeat the affected checks. After two unsuccessful attempts on the same symptom, record a blocker with command, environment, minimal input, expected/actual result, hypotheses tried and next diagnostic. Stop that unit; no infinite agent loop, fixture rewriting, disabled checks or broad speculative refactor.
8. **Capture and deliver:** update STATE, RESUME and affected model/format/UX/status documents; commit and push the verified coherent unit to the existing PR branch. For application changes, build from a clean committed revision, publish to the existing gh-pages preview, verify the public manifest/assets and actual browser behavior, and record source/deployment/CI evidence. Preserve older hashed assets for cached HTML. Tell the owner what works, what they can try and what remains. Keep PRs unmerged; distinguish local checks, CI, deployment and owner visual acceptance. Docs-only follow-ups need not redeploy identical application code.

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

No unattended scheduler, recursive delegation or paid fallback is configured. Routine delivery is performed by the active agent for one approved card; this is not a background service. Verify before publication and never merge automatically. The owner can explicitly request a review subagent with `/mathos-review`; this is not blanket authorization for parallel writers.

## Exact existing-branch delivery commands

After the source diff and all required checks pass, from the source worktree:

```sh
git add AGENTS.md HANDOFF.md README.md RESUME.md .opencode docs examples schemas scripts src tests package.json vite.config.ts opencode.json
git diff --cached --stat
git commit -m "Describe the verified coherent change"
git push origin HEAD:refs/heads/codex/integrated-life-baseline
```

Stage only paths actually belonging to the reviewed task; inspect existing user edits first. The broad path list above is the integrated release example, not permission to include unrelated edits. Never add .artifacts, dependencies or build output to source. OpenCode permits routine commits and exact pushes to the existing review branch and gh-pages; other pushes still ask. Force pushes and automatic merging remain denied.

For a changed application, build while the source worktree is clean (`git status --porcelain` must be empty), using `npm run build`. Identify the application revision with `git rev-parse HEAD`. In a separate detached worktree based on the latest origin/gh-pages, copy the new dist/index.html and dist/assets into its root/assets, preserving old hashed assets. Update preview.json with the exact application source and SHA256 of every current build file, retain .nojekyll, then commit and push from that preview worktree:

```sh
git add index.html assets preview.json README.md .nojekyll
git commit -m "Publish verified MATHOS preview"
git push origin HEAD:refs/heads/gh-pages
```

This preview is optional hosting, not the source baseline. Verify Pages reports built, fetch the public preview.json and verify its current index/assets hashes, then exercise actual public browser behavior. Record any certificate/network limitation without disabling TLS verification. Keep the source PR open and unmerged; a later docs-only checkpoint does not require publishing identical application code again.
