# MATHOS

A fully local-first, browser-based platform for mathematical visualization and pixel-level artificial-life experimentation.

**Status: Phase 0 foundation.** The application edits, validates, saves, imports, and exports experiment configurations. Its pixel canvas is a static preview. There is no simulation engine, neural learning, evolution, morphogenesis, or autonomous experimentation yet.

## Run locally

Use Node.js 24 and npm. Installation needs access to the npm registry; the running application uses no network services.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Run `npm run check` for lint, type checks, tests, and production build. `npm run preview` serves the built application. Build output in `dist/` can be served by any static HTTP server, including a local server. No deployment is required.

Configurations are stored only in this browser and origin. Export JSON for a portable copy; browser storage can be cleared or unavailable. Phase 0 has no service worker or guaranteed offline page reload after shutting down the local server. Once loaded, application operations require no external network calls.

## Authoritative documents

- [Master specification](docs/specification.md)
- [Architecture](docs/architecture.md) and [design decisions](docs/decisions/README.md)
- [UX requirements](docs/ux-requirements.md)
- [Simulation model](docs/simulation-model.md)
- [Data format](docs/data-format.md) and [JSON Schema](schemas/experiment.schema.json)
- [Roadmap](docs/roadmap.md) and [capability status](docs/capability-status.md)
- [Phase 1 proposal](docs/phase-1-plan.md) — awaiting approval; no implementation
- [Development instructions](AGENTS.md) and [contributing](CONTRIBUTING.md)

GitHub is the authoritative source of truth. Documentation describes both current behavior and planned capabilities; consult capability status before treating a design as implemented. No license has been selected.
