# MATHOS development instructions

## Authority and scope

- GitHub repository `Mankeluvsit/mathos` is the source of truth. Keep specifications, decisions, code, and tests versioned together.
- Read `docs/specification.md`, `docs/architecture.md`, `docs/capability-status.md`, and the relevant model/format/UX documents before changing behavior.
- Preserve pixel-based artificial life, primordial and seeded genesis, multi-scale simulation, neural learning, evolution, morphogenesis, configurable universe rules, and autonomous experimentation as the confirmed direction.
- Phase 0 establishes foundations only. Do not implement advanced simulation as incidental scope. Follow `docs/roadmap.md` and the user's approved scope.
- Label capabilities implemented, planned, or experimental with evidence. Never present a preview as an active simulation or emergence as a guaranteed result.

## Engineering

- Use TypeScript with strict checks, React, Vite, native browser APIs, and local persistence. No mandatory backend, account, external API, analytics, remote fonts, or cloud service.
- Prefer small modules and minimal dependencies. Keep domain logic independent of React, Canvas, time, and storage. Separate rendering cadence from future fixed simulation ticks.
- Future simulation randomness must use a versioned seeded generator; never use `Math.random()` or wall-clock time in state transitions. Record engine/rules/seed/configuration versions for reproducibility.
- Validate data at import and persistence boundaries. Bound resource use; reject unsupported versions without silently rewriting data. Never silently replace corrupt local data.
- Prefer semantic HTML, keyboard access, visible focus, sufficient contrast, text alternatives, and reduced motion. Canvas is never the only source of essential information.
- Use `localStorage` for small configurations only. Keep persistence behind an adapter. Large checkpoint storage and workers are planned, not current dependencies.
- Update affected specifications and capability status with code changes. Record material architecture changes in `docs/decisions/`. Mark unresolved scientific choices explicitly instead of inventing confirmed requirements.

## Verification and delivery

- Use Node.js 24 (`.nvmrc`) and `npm ci` from the lockfile.
- Run `npm run check` (lint, type checks, tests, production build) before proposing changes. Add meaningful tests for behavior, especially validation, persistence, and user workflows.
- Check keyboard operation and responsive layout when changing the interface. Report browser verification separately from automated DOM tests.
- Do not commit dependencies, build output, credentials, or generated experiment results. Do not select a project license without the owner's instruction.
- Work on a dedicated branch, summarize behavior and checks in a pull request, and disclose failed or unavailable checks. Never merge or enable automatic merging unless the user explicitly requests it.
- Report access failures and blockers immediately. Keep the user informed during ongoing work; do not wait silently on network approvals.
