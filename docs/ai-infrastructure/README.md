# OpenCode development infrastructure

This directory documents a portable development environment for Mathos. It does not add runtime dependencies to the Mathos application.

## Quick start

1. Clone the repository and switch to the OpenCode infrastructure branch (or use main after approved merge).
2. Install Node.js 24, npm, Git and OpenCode using their official instructions.
3. Run `bash scripts/doctor-opencode.sh` to inspect prerequisites and project health.
4. Run `npm ci`, then `npm run check`.
5. Run `opencode` from the repository root. Configure your preferred provider/authentication locally, not in Git.
6. Read `AGENTS.md`, `docs/capability-status.md`, and `HANDOFF.md` before proposing changes.

## Boundaries

OpenCode is an alternative coding interface, not an identical Codex environment. Provider subscriptions and usage limits are separate. No external model or MCP provider is required by the Mathos application itself. The project configuration deliberately ships without pre-enabled remote MCP servers or provider credentials. Add integrations only after reviewing their permissions and validating them locally.

See `capabilities.md` for parity status and `HANDOFF.md` for continuation state.
