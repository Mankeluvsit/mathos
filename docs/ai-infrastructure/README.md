# OpenCode development infrastructure

Portable development guidance for Mathos; no runtime cloud or backend dependency is added.

This directory preserves the additional infrastructure work from [PR #5](https://github.com/Mankeluvsit/mathos/pull/5). For the current integrated project, start with [RESUME.md](../../RESUME.md) and the [main setup guide](../handoff/SETUP.md). The quick start below describes PR #5's older baseline; selecting that branch does not include current organism or learning development. Its OpenCode 2.0.22 acceptance does not validate the pinned1.19.2 launcher, or vice versa. See this directory's HANDOFF.md for reconciliation.

## Historical PR #5 quick start
1. Clone the repository; select the infrastructure branch until PR #5 is reviewed and merged.
2. Install Node.js 24, npm, Git and OpenCode from trusted sources.
3. Run `bash scripts/doctor-opencode.sh`. It saves a report under `~/.local/state/mathos/` and tries to copy it to the system clipboard (Wayland `wl-copy` or X11 `xclip`); review before sharing.
4. Run `npm ci && npm run check`.
5. Launch `opencode` from the repository root. Keep provider credentials in your own OpenCode configuration, not Git.
6. Read `AGENTS.md`, `docs/capability-status.md`, and `HANDOFF.md`.

## Optional Playwright browser MCP
The 2026-10-16 Bazzite acceptance test used a Playwright MCP server already configured globally in `~/.config/opencode/opencode.json`. **It is not provisioned by this repository**. Fresh clones will not automatically have browser MCP tools.

To use browser automation, install a trusted Playwright MCP implementation compatible with your OpenCode version, configure it in your user-level OpenCode MCP settings, and confirm `opencode mcp list` reports it connected. Check `opencode mcp add --help` for your installed version's setup flow. Review its browser/file permissions. Do not copy another user's absolute paths or credentials. Separately, Mathos's existing browser test suite can be run using `npx playwright install chromium firefox` and `npm run test:browser` after the production build; browser binaries and OS dependencies may require installation.

## Boundaries
OpenCode is not identical to Codex. External providers and MCP integrations are optional **development tools**, not Mathos application dependencies. No credentials or remote MCP services are committed. Confirm any permissions before enabling agents. See `capabilities.md` for status and `HANDOFF.md` for verified continuation state.
