# Local setup, with Bazzite first

> Current delivery policy (2026-10-17): The owner authorized autonomous routine delivery on 2026-10-17: plan → implement → verify → self-review → commit/push to the existing review branch → update the existing preview → verify the live result → refresh handoff. This supersedes earlier local-only/review-before-publication wording. Do not ask again for routine publication within the approved scope. Stop for a real blocker, a change of direction, new cost or destructive action. Never merge automatically. Keep one writer; no automatic delegation or paid model fallback.

## Existing Bazzite installation reported in PR #5

PR #5 records Node 24.22.0 and OpenCode 2.0.22 on the owner's machine, with agent/skill discovery and83 tests on the older main baseline. Current scripts accept Node24, so an existing24.22.0 installation does not need replacing. The current integrated launcher/parser were independently verified against OpenCode 1.19.2. Do not automatically downgrade a working owner installation or treat that v2 report as verification of this configuration.

The preparation registry returned `ETARGET` for `opencode-ai@2.0.22`; we could not reproduce that exact client here. The original PR #5 configuration is preserved as `.opencode/compatibility/opencode2-infrastructure.json`, a reference file rather than an activated profile. See [reconciliation](../ai-infrastructure/HANDOFF.md). If you explicitly want the verified1.19.2 route without changing your globally installed client, run from this project:

```sh
npm exec --yes --package=opencode-ai@1.19.2 -- node scripts/check-opencode.mjs
npm exec --yes --package=opencode-ai@1.19.2 -- node scripts/start-opencode.mjs
```

These commands select the pinned executable within that process. They do not certify model inference or the owner's globalv2 setup. Keep model access free and without a personal API key.

The owner chose **Bazzite Linux, free OpenCode models without a personal API key, and automatic local work with review before publishing**. No paid provider setup is required. These instructions also cover a fresh macOS, Ubuntu/Debian, and Windows computer. Commands operate on the current review branch, not the older `main`.

## A. Bazzite: use an Ubuntu development container

Bazzite's base system is managed differently from ordinary Ubuntu. Use its Distrobox integration for Node, Python and Playwright dependencies. This is a development environment; MATHOS itself still has no container/backend requirement. Distrobox normally shares your home directory and network with the host, so it is not a security sandbox. [Bazzite documentation](https://docs.bazzite.gg/Installing_and_Managing_Software/Distrobox/) · [Distrobox create options](https://distrobox.it/usage/distrobox-create/).

In the **Bazzite desktop terminal**, run once:

```sh
distrobox create --name mathos-dev --image docker.io/library/ubuntu:24.04 --yes
distrobox enter mathos-dev -- bash
```

If `mathos-dev` already exists, only run the second command. Do not delete an existing container to repeat setup. Inside its terminal:

```sh
sudo apt-get update
sudo apt-get install -y git curl ca-certificates xz-utils python3
```

Continue with **D** below. Run all subsequent project/npm/OpenCode commands **inside this container**. The host browser can open `http://127.0.0.1:5173` while Vite runs inside it. Do not run `apt-get` on the Bazzite host or layer the browser libraries into its base image.

## B. Other Linux / macOS prerequisites

**Ubuntu 24.04 / Debian:** use the same `apt-get` commands above, directly in your normal terminal, then D. For other Linux distributions, the same Ubuntu Distrobox route is the reproducible browser-test environment; native package names differ. Playwright's supported Linux dependencies target Ubuntu/Debian, not the Bazzite base.

**macOS:** install Apple's command-line tools and finish the installer dialog:

```sh
xcode-select --install
```

If already installed, the message saying so is fine. Install Python using the [Python 3.12.10 macOS universal installer](https://www.python.org/ftp/python/3.12.10/python-3.12.10-macos11.pkg), accepting its defaults. Open a new Terminal window, run `git --version` and `python3 --version`, then D. The project supports Python 3.10+; no pip packages are needed.

## C. Windows native / WSL

Open Windows Terminal/PowerShell. Install Git and Python:

```powershell
winget install --id Git.Git --exact --source winget
winget install --id Python.Python.3.12 --exact --source winget
```

Install Node **24.19.0** using the official [x64 MSI](https://nodejs.org/dist/v24.19.0/node-v24.19.0-x64.msi) for Intel/AMD, or [ARM64 MSI](https://nodejs.org/dist/v24.19.0/node-v24.19.0-arm64.msi) for Windows on ARM. Architecture is shown in Windows Settings → System → About → System type. Keep installer defaults including PATH. Open a **new** terminal:

```powershell
git --version
node --version
npm.cmd --version
py -3 --version
```

Use `npm.cmd` in PowerShell if script execution policy blocks `npm.ps1`; no policy change is necessary. Skip D and continue with E. The Node setup/verification scripts select the available Python launcher and handle npm's Windows command wrapper.

OpenCode recommends WSL for Windows. To choose that route instead, run `wsl --install -d Ubuntu-24.04` in an administrator terminal, restart when requested, finish the Ubuntu user setup, then follow B/D/E **inside Ubuntu**. Keep this checkout in the Linux home folder, not `/mnt/c`, and do not mix Windows and WSL `node_modules`. [OpenCode installation guidance](https://opencode.ai/docs/#windows).

## D. Node on Linux/macOS, including the Bazzite container

Use a dedicated user-owned nvm directory. This block avoids editing your shell startup files; the resume block below reloads it explicitly. It installs the official pinned nvm script and Node release. [nvm v0.40.3](https://github.com/nvm-sh/nvm/tree/v0.40.3) · [Node 24.19.0 downloads/checksums](https://nodejs.org/dist/v24.19.0/).

```sh
export NVM_DIR="$HOME/.local/share/mathos-nvm"
mkdir -p "$NVM_DIR"
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh -o /tmp/mathos-nvm-install.sh
PROFILE=/dev/null bash /tmp/mathos-nvm-install.sh
. "$NVM_DIR/nvm.sh"
nvm install 24.19.0
nvm use 24.19.0
node --version
npm --version
python3 --version
```

Expected Node: `v24.19.0`. Current project requirement is Node 24 (`.nvmrc`); this patch version was used for handoff verification. nvm selects the correct CPU build. Do not use `sudo npm`.

## E. Clone the complete in-progress project

Run this once from your home directory. On Linux/macOS, `cd "$HOME"`; on Windows, `Set-Location $HOME`.

```sh
git clone --branch codex/integrated-life-baseline https://github.com/Mankeluvsit/mathos.git mathos-opencode
cd mathos-opencode
git status --short
git log -3 --oneline
```

The empty `git status --short` output means no local edits. If the folder already exists, enter it and inspect its status; do not overwrite it. The clone is public and needs no GitHub credential. A branch is a named line of work: this branch contains the newer organisms that `main` does not yet have. PR #4 is the proposed update awaiting review.

Install the locked application dependencies and real test browsers:

```sh
node scripts/setup.mjs --with-deps
```

That command is for **Linux**, including the Ubuntu Distrobox. It may ask for the local sudo password to install browser libraries inside the container. On **macOS/Windows**, use this instead:

```sh
node scripts/setup.mjs
```

Now run the complete gate and start the app:

```sh
node scripts/verify.mjs
```

Linux/macOS:

```sh
npm run dev
```

Windows PowerShell:

```powershell
npm.cmd run dev
```

Open Vite's displayed URL (normally `http://127.0.0.1:5173`). Stop the server with Ctrl+C before running browser verification if it occupies a test port. Setup downloads dependencies/browsers; app use after loading has no external runtime service calls.

## F. Install and start free OpenCode

In the project terminal, Linux/macOS:

```sh
npm install -g opencode-ai@1.19.2
npm run opencode:check
npm run agent -- --check
npm run agent
```

Windows PowerShell:

```powershell
npm.cmd install -g opencode-ai@1.19.2
npm.cmd run opencode:check
npm.cmd run agent -- --check
npm.cmd run agent
```

**No `/connect`, account, payment method or personal API key is required for this configured anonymous free route.** The launcher selects `opencode/deepseek-v4.1-flash-free` for both the main agent and small/background model, checks that the installed catalog advertises zero prices/tool support, and uses OpenCode's built-in anonymous `public` token. That literal is not your credential. Only the listed free models are enabled; there is no automatic paid fallback. The official v1.19.2 provider implementation supports this path. [Source](https://github.com/anomalyco/opencode/blob/v1.19.2/packages/opencode/src/provider/provider.ts) · [current free model terms](https://opencode.ai/v2/docs/console/models/#free-models).

At the OpenCode prompt, first send:

```text
Reply exactly MATHOS_FREE_OK without using tools.
```

Seeing the reply establishes live inference on **your machine**. A model listed in a catalog alone does not. Then run:

```text
/mathos-resume
```

If the default free model is unavailable/rate-limited, quit and explicitly choose the other zero-price candidate:

```sh
node scripts/start-opencode.mjs --model=longcat-2.5-preview-free
```

`--model=big-pickle` is another supported free option, with different data-use terms: its free-period data may be used to improve the model. The selected DeepSeek free offering and LongCat preview currently document zero retention/no training. All hosted models send selected context to the provider, require internet and can change/disappear. Read current terms before switching. Do not connect a paid account to work around failure. [Official model terms](https://opencode.ai/v2/docs/console/models/).

The preparation workspace's anonymous inference probe received HTTP 403; no live hosted inference success is claimed. If your local probe also fails: preserve the exact error, try the other explicitly free model once, then use local tests/manual work or the optional local route. No repeated blind retries or claim that a key is required. `--check` sends no model prompt and cannot guarantee service availability or prices beyond the catalog snapshot. Existing organization-managed OpenCode policies can override project settings; a parser mismatch is a blocker to resolve, not permission to bypass them.

## G. Resume on Bazzite tomorrow

From the host desktop terminal:

```sh
distrobox enter mathos-dev -- bash
export NVM_DIR="$HOME/.local/share/mathos-nvm"
. "$NVM_DIR/nvm.sh"
nvm use 24.19.0
cd "$HOME/mathos-opencode"
git status --short
npm run agent
```

Then `/mathos-resume`. Do not run setup again or reclone for every session. Before leaving, `/mathos-checkpoint` writes the useful state into repository files. This is not a simulation checkpoint; it records development progress.

## H. Optional no-key local model

This is a fallback, **not required for your selected free hosted route**. RAM/GPU/CPU remain unknown; do not assume a 9B model plus 64K context fits. The profile is a concrete trial configuration, not a benchmark or a substitute for Astra. Hosted free models avoid this hardware requirement.

Install Ollama from its [macOS](https://ollama.com/download/mac), [Windows](https://ollama.com/download/windows) or [Linux instructions](https://docs.ollama.com/linux). On Bazzite, do not run a host-modifying Linux installer blindly: use the Ubuntu Distrobox for a CPU trial. Inside it:

```sh
curl -fsSL https://ollama.com/install.sh -o /tmp/mathos-ollama-install.sh
sh /tmp/mathos-ollama-install.sh
ollama serve
```

If the installer cannot create a service in Distrobox, keep `ollama serve` running manually in that terminal; no systemd service is required. GPU integration/performance on the owner's Bazzite machine is unverified. On macOS/Windows, launch the installed Ollama app; it normally starts the local server. The project profile expects `127.0.0.1:11434`.

In a **second terminal in the same project environment**, run:

```sh
ollama pull qwen3.5:9b
ollama create mathos-qwen35-9b -f .opencode/ollama/Modelfile
ollama list
node scripts/start-opencode.mjs --local
```

The committed Modelfile sets actual inference context to 65,536 and output to 8,192; the OpenCode profile matches. A model's advertised context alone does not configure Ollama's allocation. Record the Ollama version and pulled model digest locally; tags can change. The Qwen tag and tool support were checked against the official library, but this inference configuration has not been run on your hardware. If memory/tool use fails, stop the trial and use the verified setup/free hosted options; do not silently reduce scientific requirements. [Ollama/OpenCode](https://docs.ollama.com/integrations/opencode) · [Qwen model](https://ollama.com/library/qwen3.5:9b) · [Modelfile](https://docs.ollama.com/modelfile).

## I. Optional interactive browser MCP

The default agent uses repository scripts; it needs no MCP. For interactive browser exploration only, the supplied profile uses Microsoft's `@playwright/mcp@0.0.83` with an isolated headless Firefox profile. It is a separate pinned tool version from the application's test dependency. Install its matching browser once:

```sh
npm exec --yes --package=playwright@1.64.0-alpha-1790635538000 -- playwright install firefox
node scripts/start-opencode.mjs --browser
```

On Windows, use `npm.cmd exec` for the first line. Linux browser libraries were installed by E. Start `npm run dev` in another project terminal; ask the agent to open `http://127.0.0.1:5173`, inspect the world, and report console errors. Browser MCP tools ask before acting. `--local --browser` combines the profiles. MCP is development-only; it adds no browser runtime dependency. [Official MCP documentation](https://opencode.ai/docs/mcp-servers/) · [pinned Microsoft server](https://github.com/microsoft/playwright-mcp/tree/v0.0.83).

## J. Save local work and publish only after review

Before changes, create a separate local branch for the next unit:

```sh
git switch -c opencode/learning-contract
```

If it already exists, inspect `git status` and use `git switch opencode/learning-contract`; do not reset/delete it. `git switch` changes which line of work you edit; it does not publish anything.

Before your first commit, configure the two labeled owner placeholders from [HANDOFF](../../HANDOFF.md#consolidated-owner-placeholders--the-only-unresolved-personal-inputs):

```sh
git config user.name "OWNER_GIT_NAME"
git config user.email "OWNER_GIT_EMAIL"
```

A commit is a local saved revision. A push sends commits to GitHub. A pull request presents proposed changes for review. A merge adopts them into its target branch. The agent should show the actual changed files and check results before asking to publish; never merge automatically. Keep branch/base choices explicit because the active source is still PR #4.

GitHub CLI is optional: install from [cli.github.com](https://cli.github.com/) using its platform installer, then `gh auth login --hostname github.com --git-protocol https --web` and `gh auth setup-git`. This browser login is separate from model access and does not require inventing an API token. `gh pr view 4 --repo Mankeluvsit/mathos` shows the current review. No publishing credential is required to run the project or free OpenCode.

## Troubleshooting

| Symptom | Exact next action |
| --- | --- |
| Node version error | Reload nvm as in G, `nvm use 24.19.0`; Windows reinstall the linked Node 24 MSI and open a new terminal |
| Python missing | Repeat the relevant OS prerequisite; `node scripts/verify.mjs` detects `python3`, `python` or Windows `py -3` |
| Missing browser/libraries | Linux container: `node scripts/setup.mjs --with-deps`; macOS/Windows: `node scripts/setup.mjs` |
| Port already in use | Stop the previous project server/test process; ports 4173/4174/4176/4177 must be free for tests. Do not kill unrelated services |
| OpenCode config rejected | `opencode --version` must be 1.19.2; run `npm run opencode:check`. Do not post full resolved config: user settings may contain secrets |
| Hosted model 403/429/unavailable | Record exact error; try the explicitly named free alternative once; stop if still blocked. No paid fallback |
| Certificate/network error | Correct local CA/proxy configuration; never use disabled TLS verification as a fix |
| Private/corrupt browser storage | Export valid starting definitions if possible; use explicit load/import errors. Do not silently erase saves |

The Linux workspace and CI provide execution evidence; the actual Bazzite host/Distrobox integration still needs the owner's first local run. No claim of testing hardware we cannot access.
