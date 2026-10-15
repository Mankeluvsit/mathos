# MATHOS master specification

Status: authoritative product direction; Phase 0 implementation baseline. Requirements below are planned unless identified as implemented in `capability-status.md`. Changes are reviewed in GitHub pull requests.

## Purpose

Provide a local browser laboratory for exploring mathematics, configurable universes, and artificial life at pixel resolution. Support understandable, reproducible experiments without requiring accounts, servers, external APIs, or cloud compute. Favor simplicity, accessibility, modularity, and maintainability over premature performance infrastructure.

## Product requirements

| ID | Requirement | Phase |
| --- | --- | --- |
| FND-01 | TypeScript, React, Vite, native rendering, local configuration persistence, portable JSON | 0 |
| FND-02 | Authoritative specifications, persistent agent instructions, automated checks and CI | 0 |
| LIFE-01 | Pixel-addressable spatial universe with explicit, versioned rules | 1–2 |
| LIFE-02 | Primordial genesis from environmental substrates and seeded genesis from authored organisms | 2 |
| SCALE-01 | Pixel, organism, and ecosystem scales with explicit coupling and scheduling | 3 |
| EVO-01 | Heritable variation, reproduction, selection, and lineage tracking | 4 |
| MORPH-01 | Genome/development rules produce and change spatial organism structure | 4 |
| LEARN-01 | Local neural controllers learn during organism lifetimes | 5 |
| EXP-01 | Autonomous bounded experiment batches, comparisons, provenance, and local results | 6 |
| MATH-01 | Mathematical views of fields, functions, state, and experiment metrics | 1–6 |

Primordial and seeded describe genesis methods, not random-number seed handling: both require an explicit random seed. Primordial emergence is an experimental possibility, not a promised outcome. Neural learning and evolutionary inheritance are separate mechanisms.

## Cross-cutting requirements

- Core use must work without remote services. Installation and optional static hosting are separate from application runtime.
- Essential controls and results must be accessible through semantic HTML and text, not Canvas alone. Target WCAG 2.2 AA; verify incrementally and do not claim certification.
- Future runs use fixed ticks, explicit seeds, ordered updates, and versioned rules. Rendering speed must not change results.
- Invalid or excessive inputs must fail clearly and leave the current valid configuration intact. Storage failure must preserve an export path.
- Users own and can export their data. Do not add telemetry or remote dependencies to runtime without an explicit product decision.
- Every capability has a status and evidence. A configured future feature is not an implemented engine.

## Phase 0 acceptance

1. A fresh checkout supports `npm ci`, `npm run dev`, and passing `npm run check`.
2. An accessible configuration editor supports name, uint32 random seed, bounded width/height, and primordial/seeded selection.
3. Explicit local save/load and JSON import/export validate the versioned format and handle failures without silent replacement.
4. A static native Canvas preview is labeled as such, with a text equivalent. No simulation or pretend run controls.
5. Documentation covers architecture, UX, models, formats, decisions, roadmap, and status. Tests and minimal CI cover the delivered foundation.
6. Changes are proposed in a GitHub PR; no automatic merge.

## Exclusions and unresolved questions

Phase 0 excludes life dynamics, workers, neural training, evolutionary operators, morphogenesis execution, batch runners, charts of fabricated results, and checkpoint storage. GPU acceleration, installed offline/PWA support, large-data persistence, learning algorithms, physical units, and detailed biological parameter values require later evidence and decisions. They do not alter the confirmed direction.
