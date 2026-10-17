# Verification commands and evidence

Run from the repository root after [setup](SETUP.md). `node scripts/verify.mjs` is equivalent to `npm run verify` and works without shell-specific Python aliases. On Windows PowerShell, use `npm.cmd` for npm commands.

| Command | Passing means |
| --- | --- |
| `npm run verify` | Independent substrate/life/learning fixtures, v1/v2/v3 ecology goldens, lint, types, all unit/DOM tests, production build, then Chromium and Firefox workflows all exit 0 |
| `npm run verify:core` | Same through build, explicitly **without** browsers; useful focused gate, insufficient full release evidence |
| `npm run check` | ESLint zero warnings, strict TypeScript zero errors, Vitest all pass, Vite creates dist |
| `npm test -- tests/learning-controller.test.ts` | Nine controller tests, including independent numerical cases and a repeatable full update-budget exercise; no v3 ecology claim |
| `npm test -- tests/ecology-baseline.test.ts` | Measurement matches direct advancement, deterministic isolation, input/horizon bounds |
| `npm run handoff:check` | Relative handoff links/file references exist, JSON/frontmatter shape readable; this is not OpenCode schema validation |
| `npm run opencode:check` | Installed **OpenCode 1.19.2 itself** parses base/local/MCP profiles and loads all three agents, four commands and the verification skill; no provider inference required |
| `npm run agent -- --check` | The selected hosted model is active, has tool support and advertised zero input/output/cache prices. No inference success/availability guarantee |
| `node scripts/ecology-baseline.mjs .artifacts/fixed-controller-baseline.json` | Six v2 runs ×1,600 steps with exact supplied/accounted ledger and declared provenance; file creation fails if it already exists |

Individual reference checks, when diagnosing a failed full gate:

```sh
python3 scripts/reference-fixtures.py --check
python3 scripts/life-reference.py --check
python3 scripts/learning-reference.py --check
node scripts/ecology-fixtures.mjs
node scripts/oriented-fixtures.mjs
node scripts/learning-fixtures.mjs
```

On Windows use `py -3` in place of `python3` for all three Python commands. The full wrapper detects Python itself. `--check` on Python fixtures and default ecology fixture commands compare without rewriting.

Browser scripts use free local ports 4173/4174/4176/4177/4178 and a current production build. Tests cover actual Canvas, fixed-seed full trajectories, keyboard entry, file upload/download, invalid imports, storage, pause/step/reset, hidden-tab/cancellation behavior, desktop/phone reflow and absence of external app runtime requests. Native dialogs, physical devices, Safari and full screen-reader conformance remain separate evidence. UI screenshots under docs/previews are actual captured states, not tests of all interactions.

## Historical evidence from the published handoff unit (`1fd0802`)

- Previous source `19a52a1`: 122 tests and full CI passed; [run](https://github.com/Mankeluvsit/mathos/actions/runs/38838617859).
- New baseline helper: three focused tests passed locally; the six-seed full-horizon command completed. No learning treatment or improvement claim.
- Client version: `opencode-ai@1.19.2`, upstream tag commit `7901b7d325c34852caa84fc2c325f3a08dd7a473`. Installed CLI reports 1.19.2. Agent/permission/command formats cross-checked against pinned upstream source. The public JSON schema URL returned 403 in this environment; the real installed parser is the validation authority here, not a locally invented schema.
- Free catalog: DeepSeek V4.1 Flash Free, LongCat 2.5 Preview Free and Big Pickle reported zero input/output/cache prices and tool support. Pinned provider source automatically supplies anonymous `public` access without owner credentials. A generic inference probe returned HTTP 403; do not report end-to-end hosted model success.
- Bazzite/Distrobox and optional Ollama/MCP syntax were checked against official docs. Actual owner hardware and local-model quality remain untested. OpenCode configuration parsing cannot prove model quality, authentication or MCP browser launch.

Local full gate on Node 24.19.0/npm 11.9.0/Python 3.12.14: **125 tests in 14 files**, lint/types/build, both independent Python fixtures, both ecology goldens and all Chromium 156/Firefox 157 workflows passed. The built app asset names/hashes remain those of the turning preview: this handoff adds development tooling without changing the browser bundle. `git diff --check` and handoff link checks passed.

OpenCode's actual 1.19.2 parser loaded the base, Ollama and Playwright profiles, all three agents/four commands, and `mathos-verification`. The default launcher catalog check passed without a model prompt. Optional Playwright MCP 0.0.83 was started over stdio, initialized, listed 25 tools, navigated the production MATHOS page in its matching Firefox browser and closed successfully. This proves MCP/browser operation in the Linux preparation workspace, not hosted-model inference.

CI now runs the full project gate on Ubuntu, macOS and Windows, plus actual OpenCode parsing. Consult [PR #4 checks](https://github.com/Mankeluvsit/mathos/pull/4/checks) for the exact published commit/run outcome; adding a workflow is not itself evidence it passed. Owner-device Bazzite/installer tests and optional local inference remain unrun. A future update must record failures rather than relabel them as passed.

Review was a separate read-through by the implementing agent against the checklist below; no independent reviewer/model was run for this package. The supplied reviewer is available to the next session, not evidence of a review already performed.

## Historical local L1/L2 continuation evidence

Starting source `1fd0802` plus the local changes recorded in STATE.md; not published and not a new remote CI run. Node 24.19.0/npm11.9.0/Python3.12.14 on this Linux workspace.

- `npm run verify`: **134 tests in 15 files**, all three independent Python references, both old ecology goldens, lint, strict types, build and all Chromium156/Firefox157 browser workflows passed.
- Nine new controller tests exercise 75 independent update cases, 37 decision cases and nine stream derivations, feature/reward bounds, state isolation, terminal handling, a repeatable1600-update budget and a rewarded later-choice change versus frozen control.
- `npm run handoff:check` and `git diff --check`: passed.
- `npm exec --yes --package=opencode-ai@1.19.2 -- node scripts/check-opencode.mjs`: passed all three profiles, agents/commands and skill discovery. No inference or provider authentication was performed.
- Old engine/renderer/UI files are unchanged. Build assets remain `index-ararBSZg.js` and `index-BIBXj0ij.css`; the isolated controller is not imported into the app. Browser checks establish compatibility, not learning behavior in the world.
- Separate self-review checked ADR equations, hand anchors, gene/range limits, terminal and random-stream contracts, copy boundaries and status consistency. No second agent/model review is claimed. Ecological performance and owner-device behavior remain untested for learning because integration is next.

Logs are saved locally under `.artifacts/learning-controller-verify.log` and `.artifacts/learning-controller-opencode.log`; these generated logs are not committed. The independent numerical fixture is a committed test input when this checkpoint is published, not a generated scientific experiment result.

## Current connected-learning evidence

See [learning verification](../learning-verification.md) for the current full gate, browser outcomes, actual captures and six-seed results. `npm test -- tests/learning-ecology.test.ts tests/ecology-app.test.tsx` checks lifecycle/format/runner/UI integration. `node scripts/browser-learning.mjs` requires the current production build and checks both browsers, comparison completion/cancel, observation parity, settings,320/390px views and no external requests. `npm run experiment:learning -- .artifacts/NEW_NAME.json` writes all 12 measured runs and refuses overwriting an existing file. Historical counts above remain dated milestone evidence, not the current test count.

## Additional infrastructure reconciliation

PR #5 at3388e35 was fetched and inspected after resumption. Its additive diagnostics/reviewer/skill/docs were preserved locally, with historical-scope and current-memory links. Its original config is stored as a non-enabled compatibility reference; root config and learning files were preserved. The stronger parser gate now requires the imported reviewer and mathos-handoff skill. `bash -n scripts/doctor-opencode.sh` passed; its clipboard operation was not executed. The reported OpenCode 2.0.22 package could not be obtained from this registry (`ETARGET`); no independent v2 compatibility or inference claim is made. See STATE.md for actual final check results.

## Terminal presentation verification

Six activity tests check observation-derived cues, reset/initial behavior, skipped ticks, frozen/no-change learning, births and the96-cue bound. `node scripts/browser-terminal.mjs` exercises both browsers: style changes preserve exported observations; pauses preserve pixels; effects off and live reduced-motion changes suppress activity;320/390px views have no horizontal overflow or external requests. `scripts/browser-repro.mjs` additionally verifies the new role glyphs occupy the transformed physical cells in all four headings without mutating the world. The full gate passed149 tests/17 files and all existing/new browser workflows; the extra all-heading terminal glyph check passed in both browsers. Handoff/whitespace and actual OpenCode1.19.2 parser checks passed. See STATE.md for scope and local-only publication status.

`node scripts/browser-terminal.mjs --capture-video` optionally uses system ffmpeg to encode an actual viewport recording. The generated GIF is review evidence, not model state. Normal tests and application runtime do not require ffmpeg. [Research and captures](../visual-direction-cogmind.md).

## Review checklist

1. Are current versus planned capabilities and source versus deployed preview unambiguous?
2. Does a new checkout contain all named files and use the current review branch?
3. Do command/config/tool names come from installed or official versions?
4. Does the configured route obey free/no-personal-key and local-before-publish choices?
5. Are each task's inputs, observable criteria, exact checks and failure stops explicit?
6. Are the old engine/fixture files unchanged, with measurement results excluded from source?
7. Are inaccessible/unrun checks disclosed rather than marked passed?

## Published learning/terminal checkpoint — 2026-10-17

Application source d7b631a5f0cf331cdd3d8b6b0fe7ff44e473a942 passed [CI on Linux, macOS and Windows](https://github.com/Mankeluvsit/mathos/actions/runs/38998336843). Workflow/configuration follow-up315beab30e397b20153d631b85f0c766b220ae5f independently passed [all three CI jobs](https://github.com/Mankeluvsit/mathos/actions/runs/38998550830), including parser assertions for authorized routine pushes and denied automatic merges/force pushes. Each complete run passed149 tests in17 files, the build, independent references and all browser workflows. Final evidence recording changes documentation only.

[Live MATHOS](https://mankeluvsit.github.io/mathos/?v=learning-terminal3) serves clean application source d7b631a, deployed as gh-pages088a87b58d1600cc1f2888e1986a7f7f98effeae. Public preview.json and all current artifact SHA256 values match. Public Chromium passed actual playback/activity/stable pause,20 learning updates, Node replay agreement, style invariance, cancelled-comparison clean-source provenance, reduced motion and320/390px navigation with no external runtime requests. Public Firefox could not navigate because the workspace did not trust its HTTPS issuer (SEC_ERROR_UNKNOWN_ISSUER); TLS validation was not disabled. Local and CI Firefox workflows passed separately. No owner-device Bazzite test is claimed.

Full logs remain ignored under .artifacts/release-source-ci.log and live-release-check.log; native public capture is live-terminal-desktop.png. Scientific outcomes remain mixed and unchanged; do not retune or claim general improvement. Source PR #4 stays open/unmerged. Standing authorization now includes routine verified source/preview delivery and handoff refresh.

## Phone playback and organization — 2026-10-17

Source `2ef4ed50021bc0a52aaed01e1e1f16f5d3f9373a`, [source CI](https://github.com/Mankeluvsit/mathos/actions/runs/38999814373), live deployment `c5616fbb9672158d80e5dea1d1a2e8f16c28616f`. Full local gate passed150 tests/17 files, lint/types/build, three independent Python references, all v1/v2/v3 goldens and complete Chromium/Firefox workflows. Added scripts/browser-mobile.mjs to the standard browser gate. That script uses touch-enabled profiles and checks actual progression with highlights on/off, unchanged exports on effect changes, Node replay, separate/cancelled comparisons retained across navigation, four destinations,320/390/430px/landscape,44px reachable/uncovered playback and desktop reflow. Zero external runtime requests.

Public `node scripts/browser-mobile.mjs --public` passed the same touch/organization/replay workflow in Chromium against [MATHOS](https://mankeluvsit.github.io/mathos/?v=mobile4); ignored public captures/logs under .artifacts/mobile-public. The public manifest and all current file SHA256 values match the clean source build. Local and CI public-network testing are distinct; no physical phone/Safari or new public Firefox certificate validation is claimed. Source CI was running at the final evidence checkpoint; use its linked actual status. Additional lint/handoff/whitespace and actual OpenCode1.19.2 parser passed. No scientific model/format changes.
