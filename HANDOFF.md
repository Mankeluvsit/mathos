# MATHOS → OpenCode handoff

> Current delivery policy (2026-10-17): The owner authorized autonomous routine delivery on 2026-10-17: plan → implement → verify → self-review → commit/push to the existing review branch → update the existing preview → verify the live result → refresh handoff. This supersedes earlier local-only/review-before-publication wording. Do not ask again for routine publication within the approved scope. Stop for a real blocker, a change of direction, new cost or destructive action. Never merge automatically. Keep one writer; no automatic delegation or paid model fallback.

Prepared 2026-10-16 from the repository, live GitHub state, this conversation and official tool documentation. **Owner choices: Bazzite Linux; free OpenCode models requiring no personal API key; autonomous routine implementation, verification and publication to the existing review branch/preview; no automatic merge.** This is a continuation package, not a claim that MATHOS is complete. Start with [RESUME.md](RESUME.md) and the [clean-machine setup](docs/handoff/SETUP.md).

## Continuing here or in OpenCode

This package supports switching between ChatGPT/Codex and OpenCode; it is not a required migration. Continue development in the available environment and keep the same task cards, specifications and verification gates. After each completed unit, update RESUME.md, STATE.md, NEXT.md and affected specifications with actual changes, checks, remaining work and publication status. The next agent must inspect those files and the working tree before acting.

Only one environment should edit a task at a time. Local workspace changes do not automatically appear on another machine. Before switching machines, verify and publish the completed checkpoint to the working GitHub branch under the standing authorization, then fetch it on the receiving machine. Check for local edits first; never overwrite them or assume a chat reset synchronized files. Distinguish unpublished edits from saved GitHub source and the exact deployed application revision.

## Additional infrastructure work discovered on resumption

[PR #5](https://github.com/Mankeluvsit/mathos/pull/5) adds a diagnostic script and owner-supplied acceptance report for OpenCode 2.0.22 on Bazzite, based on older main. The [reconciled infrastructure record](docs/ai-infrastructure/HANDOFF.md) preserves that work locally and distinguishes its 83-test baseline from current learning development. The root launcher remains verified against1.19.2; do not downgrade the owner's working2.0.22 installation or claim a v2 migration was verified. No remote branch was changed or merged during reconciliation.

Parallel development in the second shared conversation produced [PR #6](https://github.com/Mankeluvsit/mathos/pull/6), a shadow-learning demo. Its learned intent does not control organisms, and its final dashboard checks fail. The [reconciliation record](docs/handoff/CONVERSATION-RECONCILIATION.md) explains its relationship to the tested connected v3 build and preserves both histories. Continue MATHOS here; OpenCode capability research is deferred.

Latest owner-requested visual unit: [Cogmind-inspired presentation](docs/visual-direction-cogmind.md), with [real playback/captures](docs/previews/terminal/README.md). Local default glyphs and bounded activity cues are renderer-only; scientific state and previous version replay remain unchanged. Consult STATE.md for completed checks and the authorized delivery checkpoint.

## 1. Usage and the practical work budget

**There is no live account-usage API available to this agent.** The owner subsequently supplied a usage screenshot and later reported that allowance had reset. Screenshots and reports describe their capture time, not a continuously observable balance. Keep personal meter values and screenshots out of repository commits; check the live account interface before planning against remaining allowance. Your stated model is “6 Astra max”; that label does not reveal an allowance and is not an OpenCode provider/model ID. The account fields at the end are deliberately unresolved. If the interface still exposes no amount/reset, record “not displayed”; there is no reliable remaining-task calculation.

Check the desktop account menu → **Settings → Usage** for personal Work/Codex allowances; eligible managed workspaces may show **Usage & billing**. Record each meter's label (used versus remaining), window, reset date/time/timezone and any credit/reset options. Also record the plan from Settings → Billing, the selected workspace, model, reasoning and speed. Chat model limits and Work/Codex limits can differ. [Official usage guidance](https://help.openai.com/en/articles/20001516-managing-usage-with-gpt-6-astra-in-work-and-codex) · [Managed-workspace usage view](https://help.openai.com/en/articles/20001478-reviewing-work-and-codex-usage-and-using-personal-analytics-in-chatgpt-desktop) · [Billing location](https://help.openai.com/en/articles/9039756-managing-billing-for-chatgpt-and-the-api-platform).

Work and Codex share allowance. Where multiple windows apply, all relevant windows need remaining capacity. A percentage is not a fixed number of messages: task size, context, model, reasoning and speed change consumption. Starting another chat or using the same subscription through another client does not establish fresh allowance. If a meter reaches **100% used**, follow the reset/credit/upgrade options actually shown; **100% remaining** means the opposite. [Official usage guidance](https://help.openai.com/en/articles/20001516-managing-usage-with-gpt-6-astra-in-work-and-codex).

Practical allocation for **this project** (planning guidance, not an estimate of your account):

| Capacity situation | Spend model work on | Run without model usage / defer |
| --- | --- | --- |
| Very little remains | Preserve state, inspect the highest-risk learning contract, explain an unresolved design choice | Run existing tests/builds locally; postpone broad rewrites and multi-agent loops |
| Enough for one focused unit | One L1–L6 card from [NEXT](docs/handoff/NEXT.md), its focused fix and review | Batch deterministic checks into `npm run verify`; do not stream entire passing logs into context |
| A new allowance window | First review the contract/invariants, then implement isolated units | Keep routine formatting, searches and repeated builds on local tools |
| Included allowance exhausted | A separately funded provider or a local model can continue using this repository | Tests, browser preview and manual edits still work; another client using the exhausted subscription is not a bypass |

For a rough estimate, note the meter before and after **one comparable unit**. If it used `d` percentage points and `r` remain, `floor(r / d)` is a crude ceiling, not a promise. Reserve at least one unit for verification/repair and checkpoint early. Example only: 12 points left and 4 per comparable unit suggests at most three, with one reserved for review. Do not translate this into hours or tokens without actual measurements. Future allowance is usable after the displayed reset, subject to the plan's other windows.

## 2. Realistic continuation options

| Option | What it can accomplish | Tradeoff / when to choose |
| --- | --- | --- |
| Stay on the current plan | Design/review during available windows; run this full local toolchain between them | Lowest new setup/cost; interruptions remain. Good if resets align with your schedule |
| Change reasoning/model/speed within the plan | More focused implementation/documentation per allowance, depending on actual consumption | Still shares the relevant pool. Reserve strongest reasoning for numerical contracts and reviews |
| Upgrade or use eligible credits/resets | More capacity or earlier continuation where your account offers it | Recurring or usage cost; verify actual entitlement, currency/tax, reset effect and model access before purchasing. No purchase is made by this package |
| OpenCode + free anonymous hosted model | Continue with the supplied launcher, no personal API key or payment method | Selected route. Free availability/limits may change; hosted context leaves the machine; no paid fallback |
| OpenCode + independently billed API provider | Continue after provider setup; capable coding models can handle bounded changes | **Excluded by the owner's no-key/free requirement.** Listed only to compare options, not configured |
| OpenCode + supported subscription login | Reuse a supported provider subscription | Convenient, but still subject to that subscription's allowance. Do not choose the exhausted account as the continuity strategy |
| OpenCode + Ollama local model | Private, offline-after-install edits, searches and bounded tasks with no per-request model bill | Hardware, memory, electricity and speed costs; weaker planning/tool use. Treat model quality as unverified until a trial passes |

**Recommendation for the owner's chosen constraints:** use the supplied Bazzite Distrobox setup and OpenCode's anonymous free hosted route first. It avoids requiring local-model hardware. Keep a local Ollama profile as an optional fallback if hardware permits. Reserve any future stronger-model allowance for architecture and scientific review. Do not upgrade or enroll in paid API services for this handoff. There is no defensible plan-specific upgrade calculation without the account's actual limits; published upgrade/credit options are alternatives to assess only if the owner later changes the no-spend choice. [Current ChatGPT plans](https://chatgpt.com/pricing) · [Pro tier details](https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers).

OpenAI API billing is separate from ChatGPT billing. Other apps' supported ChatGPT login also does not transfer chat memories automatically. The repository package supplies that missing context. [Separate billing](https://help.openai.com/en/articles/9039756-managing-billing-for-chatgpt-and-the-api-platform) · [Using a ChatGPT plan in other apps](https://help.openai.com/en/articles/20001542-using-your-chatgpt-plan-in-other-apps-and-sites).

The provider/cost/OS/automation choices are now settled as stated at the top. The remaining hardware details matter only for optional local inference. The supplied launcher verifies the model catalog's zero prices before opening the session, uses the same free model for background tasks, and never switches to a paid model. This workspace's live anonymous inference probe returned HTTP 403; [setup](docs/handoff/SETUP.md) includes an exact local probe and fallback procedure. Catalog availability and valid configuration are not proof of access from every network.

## 3. Project state and toolkit

**Goal:** a local-first browser mathematical laboratory with recognizable pixel organisms. Confirmed direction: primordial and seeded genesis, pixel/organism/ecosystem scales, neural learning, evolution, morphogenesis, configurable rules and bounded autonomous experiments. Fixed directional controllers and authored body families are implemented. The local continuation connects bounded v3 learning, readable inspection and paired comparisons. Arbitrary anatomy, predation, spontaneous primordial life, general rules, workers, checkpoints and installed offline caching remain pending. Publication of this verified continuation is authorized; consult STATE.md for current evidence. See [state](docs/handoff/STATE.md), [capabilities](docs/capability-status.md) and [master specification](docs/specification.md).

The owner rejected indistinct pixel “mush” and fixed-facing bodies. Preserve readable food/body separation, actual turning/forward locomotion, functional organs, understandable decisions and observable family changes. Life Engine and The Bibites are behavioral references, not code/assets or a requirement to reproduce every feature. Use the dark cyan/purple/green/amber dashboard and separate desktop/mobile layouts. Communicate frequent plain-language progress; do not claim notifications can be enabled from an agent session. [Product context](docs/product-context.md).

Architecture: React controls → validated versioned definitions → bounded private runtime → pure seeded engine → copied Canvas/HTML observations. Native Canvas draws the same geometry used by physics, sensing, selection and camera. Scientific state cannot depend on time, zoom, React or storage. Small starting definitions use version-specific `localStorage` slots; JSON restarts at tick zero. Node/npm/GitHub/OpenCode are development tools, not browser runtime dependencies. [Architecture](docs/architecture.md) · [decisions and rationale](docs/decisions/README.md) · [format](docs/data-format.md).

| Tool / integration | Why / installation |
| --- | --- |
| Node 24, npm, TypeScript 5.9.3 | Build, tests and direct execution of erasable TypeScript model scripts; [OS setup](docs/handoff/SETUP.md). Tested Node 24.19.0/npm 11.9.0 |
| React 19.3.1, Vite 8.3.4 | Existing UI/build, locked by `npm ci`; do not replace the stack |
| Vitest 5.0.5, Testing Library, jsdom, ESLint 10.12.0, AJV 8.20.0 | Behavior/DOM/schema/lint gates; installed by `npm ci`, no service required |
| Python 3.10+ (tested 3.12.14) | Independent substrate/life fixture calculations; standard library only, no pip environment |
| Playwright 1.64.1 + Chromium/Firefox | Real renderer, replay, keyboard, persistence and phone workflows; installed by setup script |
| Git; optional GitHub CLI | Source/review history and remote publishing. Public clone needs no key. Optional browser GitHub login is separate from ChatGPT's connector and from model access |
| OpenCode **1.19.2** | Pinned continuation client; actual parser checked, installed separately from app dependencies |
| Repository skill `mathos-verification` | On-demand project-specific verification checklist; automatically discovered under `.opencode/skills/` |
| Third-party OpenCode plugins | **None required or configured.** Do not port ChatGPT plugin IDs/skills as if they were OpenCode packages |
| MCP | None needed for baseline work. Optional Microsoft Playwright MCP **0.0.83** profile and exact setup are in [SETUP](docs/handoff/SETUP.md); use only for interactive browser investigation |
| GitHub Actions / Pages | CI and existing optional static preview. No new host or backend is needed. Source PR #4 remains unmerged; `gh-pages` holds built assets |

Lockfile versions, not the `^` ranges in package.json, determine installed project dependencies. Avoid `npm update` and automated dependency upgrades during this handoff. No project license has been selected; do not invent one. No personal model API key is needed. The literal `public` in configuration is OpenCode's documented anonymous access value, not a credential placeholder. Do not copy account credentials into MATHOS, screenshots, logs or exports. Hosted model networking is separate from the application's local-first guarantee.

Repository map:

```text
AGENTS.md / RESUME.md / HANDOFF.md  persistent rules, entry point, choices
opencode.json / .opencode/         OpenCode agents, commands, skill, optional profiles
docs/handoff/                     setup, memory, workflow, next task cards, evidence
docs/ + docs/decisions/            authoritative product/model/UX/version decisions
src/domain/ + src/storage/         configuration validation and persistence adapters
src/simulation/                   conservative reference substrate
src/life/                         earlier growth-only life and seed comparisons
src/ecology/                      v1 legacy, v2 oriented life, geometry, dispatch, observations
src/runtime/                      bounded fixed ticks and copied sampled state
src/components/ + src/rendering/  React controls/inspection and native Canvas
schemas/ + examples/              portable starting-definition contracts
tests/ + tests/fixtures/          behavioral tests and versioned replay evidence
scripts/                          verification, browser checks, captures, measurements
.github/workflows/                CI; no automatic merge or source deployment
```

## 4. Capability-matching blueprint

The delivered configuration uses **OpenCode 1 conventions**: root `opencode.json`, root `AGENTS.md`, `.opencode/agents/*.md` with YAML frontmatter, `.opencode/commands/*.md`, and `.opencode/skills/mathos-verification/SKILL.md`. It selects `opencode/deepseek-v4.1-flash-free`; the launcher checks catalog prices/tool support and supports explicit listed free alternatives or the optional local profile. No fabricated `workflows:` schema or model alias. OpenCode 2 is a separate migration; do not mix its commands/configuration into this pinned setup. [Official configuration](https://opencode.ai/docs/config/) · [version-pinned config source](https://github.com/anomalyco/opencode/blob/v1.19.2/packages/core/src/v1/config/config.ts).

| Role | Scope / safeguards |
| --- | --- |
| `mathos` primary | One task card, code/docs edits, checks, then state update; 40 agent steps per turn |
| `mathos-review` subagent | Read-only second pass, specific findings and PASS/NEEDS_CHANGES/BLOCKED; 16 steps; no edits/tests/delegation |
| `mathos-scout` subagent | Optional bounded code/spec map; 12 steps; no shell, edits or delegation |

Agents inherit the model you select; no second provider is silently billed. Calling a subagent can add usage, including with the same model. Delegation asks by default; `/mathos-review` explicitly requests it. Keep a single writer and at most one reviewer/scout at a time. The `steps` cap bounds agent iterations, not tokens, money or wall time. It cannot replace a provider spending limit. [Agent configuration](https://opencode.ai/docs/agents/) · [permissions](https://opencode.ai/docs/permissions/).

Use `/mathos-resume` to recover state, `/mathos-unit L6` to complete the current delivery card, `/mathos-review` for the second pass, and `/mathos-checkpoint` before leaving. Commands are prompts that direct the agent; the actual pass/fail gates are the scripts and CI. The reviewer reads evidence but does not rerun commands. A same-model review is useful separation of context, not independent expertise. [Custom commands](https://opencode.ai/docs/commands/) · [rules](https://opencode.ai/docs/rules/) · [skills](https://opencode.ai/docs/skills/).

The workflow is **read → plan one unit → implement → focused verification → full gate → review → repair or document blocker → update repository memory**. After two failed repairs to the same symptom, capture the failing command, minimal case, hypotheses and next diagnostic; do not spend indefinitely or weaken the gate. [Exact loop and task-card template](docs/handoff/WORKFLOW.md). [L0–L6 inputs, dependencies and done-criteria](docs/handoff/NEXT.md).

Memory is explicit: RESUME is short; STATE holds evidence and unfinished work; NEXT holds scoped task cards; ADRs hold scientific decisions. Auto compaction/pruning is enabled with a 12,000-token reserve, but written state must be updated first. Load only the relevant contracts and tests for each card. Keep passing log output short; save full logs locally under ignored `.artifacts/`. Do not auto-load every fixture, screenshot or the entire chat. One task per session gives a weaker model fewer competing obligations.

Remaining gaps and compensations:

| Gap that configuration cannot remove | Mitigation / stop condition |
| --- | --- |
| Long-horizon architecture and scientific judgment | Specify equations/versions before coding; reserve stronger review for L1 and any disputed scientific assumption |
| Subtle cross-file consistency | Trace model → dispatcher → storage/schema → runtime → renderer → inspector → docs; reviewer checks each affected boundary |
| False confidence from tests | Preserve independent oracles; add hand-worked new-algorithm examples; no generic intelligence or universal-improvement claims |
| Local model tool use/context limits | Trial read-only mapping, one low-risk edit, and full verification first; reject the route if it repeatedly miscalls tools or omits criteria |
| UI judgment/accessibility | Real Chromium/Firefox workflows plus actual desktop/phone review; owner remains the final judge of recognizability |
| Correlated self-review errors | Separate reviewer context, optionally a different selected model; record when only self-review was possible |
| Unattended loops/cost | One card, bounded agent steps, two failed-repair stop, checkpoint, verified routine delivery and no automatic merge |

## Verification and infrastructure

After setup, **`npm run verify`** is the complete local gate. It must exit zero; every reference must match, lint has zero warnings, TypeScript has zero errors, every test passes, Vite builds, and both real browsers finish their workflows. [Commands, expected output and limits](docs/handoff/VERIFICATION.md). Running these commands directly costs no ChatGPT/model allowance; having a model repeatedly read the logs does consume its allowance.

App development needs a normal computer capable of Node and two test browsers, free localhost ports 5173 and 4173/4174/4176/4177, internet for installation and GitHub, and local disk for dependencies/browsers. No database, Docker, GPU, Python package dependencies, mandatory backend, API key or authentication is needed for the app. A local **AI model** is the only optional part with materially larger RAM/VRAM requirements; evaluate your hardware before downloading it. No cross-hardware model performance guarantee is made.

Public preview is [GitHub Pages](https://mankeluvsit.github.io/mathos/?v=learning-terminal3). Application source/deployment and checks are recorded in STATE.md; documentation-only changes do not require redeploying identical application code. Use `npm run dev` locally. Production hosting stays optional; do not create new infrastructure. Source truth is the review branch/PR, not compiled files on `gh-pages`. Browser storage is origin-specific; export starting definitions before changing origins. No guaranteed offline reload or resume-from-checkpoint exists.

## Consolidated owner placeholders — the only unresolved personal inputs

Keep actual values in an ignored local file such as `.artifacts/owner-inputs.md`, not a public commit. No placeholder is embedded in the active OpenCode JSON. Omit optional fields for routes you do not choose.

| Placeholder | Supply this / where used | Required when |
| --- | --- | --- |
| `OWNER_PLAN_WORKSPACE` | Exact ChatGPT plan/tier and active workspace, from Settings → Billing | To tailor the usage/upgrade advice; not to build the app |
| `OWNER_USAGE_WINDOWS` | Each meter's name, used/remaining label/value, reset time/timezone, credit balance/reset option if shown; optionally before/after one unit | To estimate remaining work; not observable to this agent |
| `OWNER_MACHINE_DETAILS` | Bazzite version, CPU architecture, RAM, GPU/VRAM and free disk | Only to assess optional local-model suitability; free hosted setup does not wait on this |
| `OWNER_GIT_NAME` | Commit display name | Before creating local commits |
| `OWNER_GIT_EMAIL` | Commit email or GitHub noreply email from GitHub Settings → Emails | Before creating local commits |
