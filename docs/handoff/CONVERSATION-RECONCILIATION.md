# Reconciling the parallel MATHOS conversation

> Current delivery policy (2026-10-17): The owner authorized autonomous routine delivery on 2026-10-17: plan → implement → verify → self-review → commit/push to the existing review branch → update the existing preview → verify the live result → refresh handoff. This supersedes earlier local-only/review-before-publication wording. Do not ask again for routine publication within the approved scope. Stop for a real blocker, a change of direction, new cost or destructive action. Never merge automatically. Keep one writer; no automatic delegation or paid model fallback.

Context supplied by the owner on 2026-10-17: [shared conversation](https://chatgpt.com/share/6ad2e0a9-f9a0-83e8-b4a3-afade3f0b9ec?ogimg=plain). Read the conversation and inspected GitHub before writing this record. The conversation is contextual evidence; current owner instructions and verified repository state govern work. Do not copy its private device reports, credentials, account details or full transcript into source.

## Owner direction recovered

- Continue MATHOS here, with handoffs supporting switching between Codex and OpenCode.
- Keep mathematical experiments modular within MATHOS. The other conversation used “K” for that research; it is not a new backend or a separate runtime dependency.
- Defer OpenCode capability research while developing MATHOS here. Autonomy/delegation remain a separate future tooling workstream; this does not enable unattended system work or automatic subagents.
- Explain progress in brief, plain language. Supply an understandable visual result and explain what tests establish.
- Save project work in GitHub, preserve review proposals and never merge automatically. The current local-before-publication preference still requires an explicit publication decision for this workspace's pending build; a quotation from the shared history is not silently treated as new publishing approval.

## Verified branches and boundaries

| Location | Evidence at inspection | Meaning |
| --- | --- | --- |
| `main`, `070eefe` | Phase1 foundation/reference substrate | Does not contain current organism or learning work |
| PR #4, `codex/integrated-life-baseline`, `1fd0802` | Published v2 organisms and OpenCode handoff | Existing review proposal, unmerged |
| PR #5, `chore/opencode-infrastructure-handoff`, `3388e35` | Infrastructure/diagnostics and supplied Bazzite report | Additive files preserved locally; original config kept as a non-enabled reference |
| PR #6, `feat/l2-learning-controller-prototype`, `83a7c528676842344e5e27c8ffa6536e80951cff` | Separate controller proposal and shadow-learning demo | Published parallel implementation, unmerged; automated checks failing at this snapshot |
| Current preparation workspace | Connected v3 controller, lifecycle, paired runner, inspector and updated handoff | Local review build; 143 tests, build, independent numerical checks and Chromium/Firefox workflows passed |
| Public Pages | `gh-pages` at `8f378cf`, v2 preview | Has not received the local learning build |

## Why PR #6 is not copied over the connected build

The two branches independently created the same controller, ADR and test paths. A blind merge would collide with the current implementation and could restore an earlier milestone status.

PR #6's `shadow-learning.ts` advances the unchanged v2 world and updates separate controller records. Its chosen learning intent does not determine the actual movement. The weights therefore cannot change survival or foraging in that demo. It is an observational diagnostic, not the requested closed behavior/outcome loop. Its frozen and learning worlds intentionally remain identical. The current v3 build instead executes the selected intent, measures actual intake/mechanical cost/upkeep, applies one bounded transition and exposes those diagnostics; paired worlds may then diverge.

The shared conversation's final message accurately described its demo as observing rather than controlling. Its earlier green test statements apply to preceding commits, not the final dashboard commit. GitHub run38995882716 fails three existing app tests on Linux/macOS/Windows because the new demo adds another button named “One step”. The controller/shadow tests passed in that run; the complete product gate failed. Do not weaken or delete those existing tests to claim success.

Retain PR #6 and its history untouched. No source files were copied from it, no branch was reset/deleted, no PR was merged/closed, and no public preview was changed during this review. Its diagnostic concept can be reconsidered later if the owner asks for a separate educational lab; it is not needed alongside the current on/off comparison.

## Resume point

Read root RESUME.md, STATE.md, learning-plan.md and learning-verification.md. Continue from the connected local build, not the older L1 candidate or shadow-only checkpoint. Keep the latest numerical contract in ADR0010 authoritative within this build; do not duplicate competing equations in handoff notes.

The connected learning result is ready for owner review. Publication of source and the updated Pages preview remains the next approval decision already presented to the owner. If approved, save the complete tested checkpoint to GitHub, rebuild with published source provenance, update the preview, verify the live URL and retain manual merge review. Do not restart OpenCode/system-permission investigations as part of that work.
