# Resume MATHOS here

MATHOS is mid-development. Read [AGENTS.md](AGENTS.md), [current state](docs/handoff/STATE.md), then [next task cards](docs/handoff/NEXT.md). For a new computer, follow [setup](docs/handoff/SETUP.md); for account/provider choices, read [HANDOFF.md](HANDOFF.md).

- **Working code:** `codex/integrated-life-baseline`, [open PR #4](https://github.com/Mankeluvsit/mathos/pull/4). Do not start from `main`: it lacks the current organism work. Never merge automatically.
- **Completed simulation milestone:** ecology-reference@2: whole-body turning, functional mouths/motors/sensors, three inherited body plans, reproduction/mutation/death, family and population observations. Historical source commit: `19a52a124a615b51611c4af4acbd6550058c22fd`.
- **This handoff increment:** OpenCode 1.19.2 configuration, OS setup, a consolidated verification command and a six-seed fixed-controller measurement script. These development tools do not change the browser simulation.
- **Next feature:** bounded lifetime learning with a fixed-controller comparison. No learning engine has been implemented. First uncompleted card: **L1, learning contract**, in NEXT.md. L0 supplies the measurement baseline.
- **Preview:** [turning-body preview](https://mankeluvsit.github.io/mathos/?v=turning2). It serves the earlier simulation source, not the new development scripts. Save/export stores starting definitions, not checkpoints.

First actions from the repository root:

```sh
git status --short
git log -5 --oneline
npm run verify
```

Then use `npm run agent` to launch the selected free anonymous model and run `/mathos-resume`. No `/connect`, personal API key, payment method or `/init` is needed. The owner uses Bazzite; follow the Distrobox setup. Automatic local work is approved; review before publishing. If free model access is unavailable, tests and `npm run dev` still work without AI.

Update this file and STATE.md after every completed unit, interruption or blocked check. Resolve newer GitHub/local evidence before trusting this snapshot.
