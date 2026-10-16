# MATHOS

A fully local-first, browser-based platform for mathematical visualization and pixel-level artificial-life experimentation.

**Status: Phase 1 merged; integrated life baseline on this review branch.** The reference substrate remains available. **Open life baseline** adds an experimental model with seeded/primordial initialization, pixel organisms, resource-bounded growth, asexual reproduction, mutation, lineage, a fixed neural controller and local three-seed comparisons. Lifetime learning, spontaneous organism formation, richer ecology and checkpoints remain planned.

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
- [UX requirements](docs/ux-requirements.md) and [product context / visual direction](docs/product-context.md)
- [Simulation model](docs/simulation-model.md)
- [Data format](docs/data-format.md) and [JSON Schema](schemas/experiment.schema.json)
- [Roadmap](docs/roadmap.md) and [capability status](docs/capability-status.md)
- [Integrated baseline plan](docs/integrated-baseline-plan.md) and [verification](docs/integrated-baseline-verification.md)
- [Approved Phase 1 design](docs/phase-1-plan.md) and [verification](docs/phase-1-verification.md)
- [Development instructions](AGENTS.md) and [contributing](CONTRIBUTING.md)

GitHub is the authoritative source of truth. Documentation describes both current behavior and planned capabilities; consult capability status before treating a design as implemented. No license has been selected.

## Dashboard previews

See the [desktop and phone review captures](docs/previews/README.md) and [shared-concept context](docs/product-context.md). The dark laboratory connects the same rule, field and measurements; phone navigation preserves the run across Viewport, Setup and Inspect.

## Try the testable phase

1. Start the app, choose **Open substrate lab** in the central workspace. On a phone, this opens Setup.
2. Set the experiment draft seed/dimensions above, choose **Center impulse** or **Seeded uniform noise**, then **Prepare substrate from draft**. The run starts paused.
3. Use **Step** for one tick or **Start/Pause** for animation. Total resource units remain constant while the field redistributes. Inspect any pixel through its x/y controls.
4. Reset to reproduce the initial field. Saving/exporting a **run definition** preserves inputs and restarts at tick zero; it is not a checkpoint.

The foundation's original experiment files and genesis selection are retained as intent. A substrate run does not execute either organism genesis mode. Integer quantization can leave small gradients unchanged.

## Try the integrated baseline

Choose **Open life baseline** and confirm leaving the reference run. The default 32×32 seeded world starts paused with one center-cell organism. Step or Start to observe connected growth, reproduction and lineage. On phones use Setup for draft configuration/comparisons and Inspect for exact resources, organisms and genomes. Primordial starts with resources only.

Save/load uses a separate life-definition slot. Export active definition restarts at tick zero. Compare three seeds runs at most 3×500 ticks locally, supports cancellation and exports measured results; it does not alter the interactive world. Model equations, biases and limits are in [ADR 0007](docs/decisions/0007-integrated-life-baseline.md).

## Verify

```sh
npm run check
python3 scripts/reference-fixtures.py --check
python3 scripts/life-reference.py --check
npx playwright install chromium firefox
npm run test:browser
npm run benchmark
```

The browser suite needs a production build (`npm run check` builds it) and free local ports 4173/4174/4176. Linux CI may need `npx playwright install --with-deps chromium firefox`; package installation can require administrator access. Tests compare independent RNG/field fixtures in both browsers and exercise the production UI. No new runtime dependency or network service was added.
