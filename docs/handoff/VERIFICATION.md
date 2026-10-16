# Verification commands and evidence

Run from the repository root after [setup](SETUP.md). `node scripts/verify.mjs` is equivalent to `npm run verify` and works without shell-specific Python aliases. On Windows PowerShell, use `npm.cmd` for npm commands.

| Command | Passing means |
| --- | --- |
| `npm run verify` | Independent substrate/life fixtures, v1/v2 ecology goldens, lint, types, all unit/DOM tests, production build, then Chromium and Firefox workflows all exit 0 |
| `npm run verify:core` | Same through build, explicitly **without** browsers; useful focused gate, insufficient full release evidence |
| `npm run check` | ESLint zero warnings, strict TypeScript zero errors, Vitest all pass, Vite creates dist |
| `npm test -- tests/ecology-baseline.test.ts` | Measurement matches direct advancement, deterministic isolation, input/horizon bounds |
| `npm run handoff:check` | Relative handoff links/file references exist, JSON/frontmatter shape readable; this is not OpenCode schema validation |
| `npm run opencode:check` | Installed **OpenCode 1.19.2 itself** parses base/local/MCP profiles and loads all three agents, four commands and the verification skill; no provider inference required |
| `npm run agent -- --check` | The selected hosted model is active, has tool support and advertised zero input/output/cache prices. No inference success/availability guarantee |
| `node scripts/ecology-baseline.mjs .artifacts/fixed-controller-baseline.json` | Six v2 runs ×1,600 steps with exact supplied/accounted ledger and declared provenance; file creation fails if it already exists |

Individual reference checks, when diagnosing a failed full gate:

```sh
python3 scripts/reference-fixtures.py --check
python3 scripts/life-reference.py --check
node scripts/ecology-fixtures.mjs
node scripts/oriented-fixtures.mjs
```

Windows alternatives for the first two are `py -3 scripts/reference-fixtures.py --check` and `py -3 scripts/life-reference.py --check`. The full wrapper detects Python itself. `--check` on Python fixtures and default ecology fixture commands compare without rewriting.

Browser scripts use free local ports 4173/4174/4176/4177 and a current production build. Tests cover actual Canvas, fixed-seed full trajectories, keyboard entry, file upload/download, invalid imports, storage, pause/step/reset, hidden-tab/cancellation behavior, desktop/phone reflow and absence of external app runtime requests. Native dialogs, physical devices, Safari and full screen-reader conformance remain separate evidence. UI screenshots under docs/previews are actual captured states, not tests of all interactions.

## Evidence from this handoff unit

- Previous source `19a52a1`: 122 tests and full CI passed; [run](https://github.com/Mankeluvsit/mathos/actions/runs/38838617859).
- New baseline helper: three focused tests passed locally; the six-seed full-horizon command completed. No learning treatment or improvement claim.
- Client version: `opencode-ai@1.19.2`, upstream tag commit `7901b7d325c34852caa84fc2c325f3a08dd7a473`. Installed CLI reports 1.19.2. Agent/permission/command formats cross-checked against pinned upstream source. The public JSON schema URL returned 403 in this environment; the real installed parser is the validation authority here, not a locally invented schema.
- Free catalog: DeepSeek V4.1 Flash Free, LongCat 2.5 Preview Free and Big Pickle reported zero input/output/cache prices and tool support. Pinned provider source automatically supplies anonymous `public` access without owner credentials. A generic inference probe returned HTTP 403; do not report end-to-end hosted model success.
- Bazzite/Distrobox and optional Ollama/MCP syntax were checked against official docs. Actual owner hardware and local-model quality remain untested. OpenCode configuration parsing cannot prove model quality, authentication or MCP browser launch.

Local full gate on Node 24.19.0/npm 11.9.0/Python 3.12.14: **125 tests in 14 files**, lint/types/build, both independent Python fixtures, both ecology goldens and all Chromium 156/Firefox 157 workflows passed. The built app asset names/hashes remain those of the turning preview: this handoff adds development tooling without changing the browser bundle. `git diff --check` and handoff link checks passed.

OpenCode's actual 1.19.2 parser loaded the base, Ollama and Playwright profiles, all three agents/four commands, and `mathos-verification`. The default launcher catalog check passed without a model prompt. Optional Playwright MCP 0.0.83 was started over stdio, initialized, listed 25 tools, navigated the production MATHOS page in its matching Firefox browser and closed successfully. This proves MCP/browser operation in the Linux preparation workspace, not hosted-model inference.

CI now runs the full project gate on Ubuntu, macOS and Windows, plus actual OpenCode parsing. Consult [PR #4 checks](https://github.com/Mankeluvsit/mathos/pull/4/checks) for the exact published commit/run outcome; adding a workflow is not itself evidence it passed. Owner-device Bazzite/installer tests and optional local inference remain unrun. A future update must record failures rather than relabel them as passed.

Review was a separate read-through by the implementing agent against the checklist below; no independent reviewer/model was run for this package. The supplied reviewer is available to the next session, not evidence of a review already performed.

## Review checklist

1. Are current versus planned capabilities and source versus deployed preview unambiguous?
2. Does a new checkout contain all named files and use the current review branch?
3. Do command/config/tool names come from installed or official versions?
4. Does the configured route obey free/no-personal-key and local-before-publish choices?
5. Are each task's inputs, observable criteria, exact checks and failure stops explicit?
6. Are the old engine/fixture files unchanged, with measurement results excluded from source?
7. Are inaccessible/unrun checks disclosed rather than marked passed?
