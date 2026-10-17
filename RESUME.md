# Resume MATHOS here

> Current delivery policy (2026-10-17): The owner authorized autonomous routine delivery on 2026-10-17: plan → implement → verify → self-review → commit/push to the existing review branch → update the existing preview → verify the live result → refresh handoff. This supersedes earlier local-only/review-before-publication wording. Do not ask again for routine publication within the approved scope. Stop for a real blocker, a change of direction, new cost or destructive action. Never merge automatically. Keep one writer; no automatic delegation or paid model fallback.

MATHOS is mid-development. Read [AGENTS.md](AGENTS.md), [current state](docs/handoff/STATE.md), then [next task cards](docs/handoff/NEXT.md). For a new computer, follow [setup](docs/handoff/SETUP.md); for account/provider choices, read [HANDOFF.md](HANDOFF.md).

- **Working code:** `codex/integrated-life-baseline`, [open PR #4](https://github.com/Mankeluvsit/mathos/pull/4). Do not start from `main`: it lacks the current organism work. Never merge automatically.
- **Completed simulation milestone:** ecology-reference@2: whole-body turning, functional mouths/motors/sensors, three inherited body plans, reproduction/mutation/death, family and population observations. Historical source commit: `19a52a124a615b51611c4af4acbd6550058c22fd`.
- **This handoff increment:** OpenCode 1.19.2 configuration, OS setup, a consolidated verification command and a six-seed fixed-controller measurement script. These development tools do not change the browser simulation.
- **Local progress:** v3 learning is connected to organism lifetimes, with on/off settings, readable inspection, separate storage/import/export and six-seed paired comparisons. Local default is learning on. L1–L5 are implemented; L6 verification/owner review is the current delivery gate. See learning-verification.md and STATE.md for actual checks.
- **Preview:** [turning-body preview](https://mankeluvsit.github.io/mathos/?v=turning2). It serves the earlier simulation source, not the new development scripts. Save/export stores starting definitions, not checkpoints.

Continuation can happen in ChatGPT/Codex or OpenCode. Keep this handoff updated after each unit; changing tools does not restart the project. Only one environment edits at a time. Local work must be reviewed and saved to GitHub before another machine can fetch it.

Latest local checkpoint: connected learning and its tests, UI, experiments and documentation, on top of the earlier L1/L2 and continuation work. Previous source was `1fd0802`; source/preview delivery is now authorized and in progress. Consult STATE.md for final publication evidence. Existing v1/v2 semantics and OpenCode configuration remain unchanged. Read STATE.md before further work; do not restart L3.

Additional work discovered on GitHub during resumption: PR #5 (`chore/opencode-infrastructure-handoff`, `3388e35`) adds infrastructure diagnostics, reviewer/skill and a reported Bazzite OpenCode 2.0.22 acceptance test on the older main baseline. Its additive files and original config reference are preserved locally under docs/ai-infrastructure, scripts/doctor-opencode.sh and .opencode/compatibility. Root configuration and simulation work were preserved. See [reconciliation](docs/ai-infrastructure/HANDOFF.md); do not switch to the older baseline and restart development.

Parallel conversation reconciled: [review record](docs/handoff/CONVERSATION-RECONCILIATION.md). PR #6 adds an observational shadow demo on top of the published v2 baseline; its final dashboard checks fail due to duplicate One step buttons. It does not replace this connected v3 build. PR #6 is preserved unchanged. Focus on MATHOS; OpenCode capability/autonomy research is deferred.

Latest visual work: the owner requested a Cogmind-inspired pixel-life presentation. [Research/translation](docs/visual-direction-cogmind.md) and [actual animation/captures](docs/previews/terminal/README.md). The local default is Terminal glyphs with observation-driven cues; Classic cells remains selectable. These are view changes only, with no new model or storage semantics. Preview delivery is now authorized; consult STATE.md for the exact deployed revision. Check STATE.md for current verification and publication status.

First actions from the repository root:

```sh
git status --short
git log -5 --oneline
npm run verify
```

Then use `npm run agent` to launch the selected free anonymous model and run `/mathos-resume`. No `/connect`, personal API key, payment method or `/init` is needed. The owner uses Bazzite; follow the Distrobox setup. Autonomous routine edits, checks, commit/push and existing-preview publication are approved. Verify live and keep handoff current; never merge automatically. If free model access is unavailable, tests and `npm run dev` still work without AI.

Update this file and STATE.md after every completed unit, interruption or blocked check. Resolve newer GitHub/local evidence before trusting this snapshot.
