# Capability status

This table describes code on this branch; it becomes the default-branch baseline only after PR review and merge. “Implemented” means delivered behavior, not a scientific claim. Verification evidence belongs in the PR and CI run.

| Capability | Status | Evidence / boundary |
| --- | --- | --- |
| React/TypeScript/Vite foundation | Implemented | `src/app`, build/type/lint scripts |
| Configuration editing and validation | Implemented | `src/domain/experiment.ts`, domain and app tests |
| Local save/load | Implemented | `src/storage`, adapter and app tests; single configuration slot |
| JSON import/export | Implemented | Schema, example, validation and workflow tests |
| Native pixel canvas | Implemented | Static foundation preview plus live fixed-scale substrate field |
| Accessibility foundation | Implemented baseline | Semantic controls, labels, focus, status; no conformance certification |
| Automated tests and CI | Implemented definitions | Vitest/Testing Library, `.github/workflows/ci.yml`; execution evidence in PR |
| Reference substrate dynamics and field inspection | Implemented on review branch | Versioned integer transport, exact metrics, fixed ticks; see verification |
| Primordial and seeded genesis | Experimental baseline | Life lab executes resource recipe/center-cell template; full Phase 2 remains planned |
| Multi-scale simulation | Experimental baseline | Pixel/organism/ecosystem inspection; full Phase 3 remains planned |
| Morphogenesis and evolution | Experimental baseline | Bounded growth/reproduction/mutation; full Phase 4 remains planned |
| Neural lifetime learning | Experimental, on review branch and preview | v3 bounded updates, fresh newborn controllers, on/off inspection and six-seed comparisons; outcomes mixed; source/deployment verification in handoff/STATE.md |
| OpenCode continuation and fixed-controller measurements | Implemented development tooling | Pinned agent configuration, setup/verification workflow, six-seed v2 CLI measurements; no learning treatment or app runtime service |
| Autonomous experiments and checkpoints | Partial baseline | Local seed comparisons implemented; checkpoints and full Phase 6 planned |
| Worker execution, IndexedDB, installed offline caching | Planned decisions | Add only with evidence; not shipped |

## Historical Phase 1 delivery boundary

The owner approved Phase 1 implementation. Its code was merged in PR #3; this paragraph records its original scope. See [verification](phase-1-verification.md). Seeded noise is an initializer, not seeded organism genesis. The scalar field is a mathematical reference substrate, not artificial life. Phase 0 files remain compatible. Learning, evolution, morphogenesis, organism genesis, multi-scale coupling, checkpoints and autonomous experiments are still planned.

## Dashboard presentation revision

Implemented on the review branch: dark colorized dashboard, desktop model/viewport/inspector arrangement, intermediate-width reflow, mobile Viewport/Setup/Inspect navigation, desktop focus mode, and three render-only palettes. See [product context](product-context.md) for the connection to the owner-provided concepts. Simulation state is preserved across presentation changes; future life-system mockup panels are not presented as implemented.

## Integrated baseline on this review branch

The Phase 1 implementation is merged. A separate experimental life lab now connects these narrow slices; the original phase table above describes the full capabilities, not completion of these tracks.

| Slice | Implemented behavior | Remaining scope |
| --- | --- | --- |
| Genesis | Versioned resource-noise recipe and center-cell template | Primordial material chemistry and spontaneous structures |
| Scales | Explicit pixels, connected organisms and exact ecosystem totals each tick | Slower-scale process scheduling and validated approximations |
| Morphogenesis | Genome-limited connected one-pixel growth | Differentiation, repair and richer developmental programs |
| Evolution | Resource-funded asexual reproduction, bounded mutation, lineage | Broader selection studies and inheritance strategies |
| Neural control | Fixed integer single-neuron growth gate | Lifetime learning/training remains planned |
| Experiments | Cancellable three-seed comparisons with exported measured endpoints | Checkpoints/resume, general sweeps and persistent history |

See [plan](integrated-baseline-plan.md), [model decision](decisions/0007-integrated-life-baseline.md) and [verification](integrated-baseline-verification.md). No claim of biological realism, emergence or intelligence.

## Observable ecology correction

Implemented on the new correction review branch: the default living-world experience, eight seeded foragers (or primordial food-only environment), separated body/mouth/motor cells, local food sensing, motor-funded movement, intake, juvenile growth, reproduction cooldown/placement, inherited trait mutations, age/starvation death, lineage/event inspection and explicit sunlight accounting. Magnification/follow and mobile view changes do not affect simulation state. Earlier models remain compatible under technical labs.

This does not implement The Bibites/Life Engine feature sets, predation, arbitrary organ/genome editors, lifetime learning, spontaneous genesis or general autonomous ecological experiments. See [plan](observable-life-plan.md), [decision](decisions/0008-observable-ecology.md) and [verification](observable-life-verification.md).

## Turning, inherited bodies and measured evolution

Implemented on the current review branch: ecology-reference@2 whole-body cardinal rotation, separate quarter-turn/forward actions, conservative turn collision, rotating mouths and front-half-plane sensing, higher-cadence normal playback, heritable dart/grazer/scout plans, juvenile motor/accessory development, per-cell costs, mutation before/after provenance, family path, offspring/deaths/intake and bounded population/body-plan histories. V1 definitions and trajectories remain available explicitly. Three authored plan families are a bounded genome/development encoding, not arbitrary anatomy or proof of open-ended evolution. Lifetime neural learning, predation and broader autonomy remain planned.

## Connected learning (v3 review branch and preview)

Ecology-reference@3 integrates linear-td@1 updates with the actual lifecycle, separate random streams, inherited-trait initialization and fresh child weights. The UI defaults to v3, exposes learning on/off as starting settings, and shows real intent/action/reward/update/weight diagnostics. A separate cancellable runner compares both arms across six seeds and exports all outcomes/provenance. V1/v2 remain selectable and replayable. See [verification](learning-verification.md) for actual checks and mixed experiment outcomes; this is not proof of intelligence or general improvement; preview publication is recorded in handoff/STATE.md.

## Cogmind-inspired life presentation

Implemented on review branch and preview: original role glyphs, a dark green terminal world, geometry-aligned selection brackets, classic/terminal view selection and bounded cues for observed travel/turns, feeding, births and actual weight changes. Pause/effects off/reduced motion stop the overlay animation. [Research and verification contract](visual-direction-cogmind.md) and [actual captures](previews/terminal/README.md). Simulation rules/trajectories remain unchanged; the published source/deployment is recorded in handoff/STATE.md.

## Phone interaction correction

Implemented on this working branch: world-first layout, compact selected-organism summary, four mobile destinations (World / Organism / Results / Setup), persistent shared playback dock, grouped view controls and explicit Activity highlights wording. Results and configuration no longer spill into mobile World. Actual movement works with highlights off; changing an effect cannot secretly start the run. Setup groups starting settings, file/browser saving, restart and technical labs. [Verification and capture index](mobile-ux-verification.md). Model trajectories and storage formats are unchanged.
