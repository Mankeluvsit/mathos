# Data format

## Implemented: configuration version 1

UTF-8 JSON, MIME type `application/json`, filename extension `.json`. See `schemas/experiment.schema.json` and `examples/experiment.v1.json`. The runtime validator and schema accept only these fields:

| Field | Constraint |
| --- | --- |
| `format` | Literal `mathos-experiment` |
| `schemaVersion` | Integer literal `1` |
| `name` | String of 1–80 characters with at least one non-whitespace character |
| `seed` | Integer 0–4294967295 |
| `universe.width`, `universe.height` | Integers 8–256, measured in pixels |
| `genesis.mode` | `primordial` or `seeded` |

Reject additional properties at every object level, nulls, non-finite numbers, unsupported versions, and invalid JSON. Import limit is 64 KiB, checked before file reading and again on parsed text. Text length uses Unicode code points for the name. Runtime constructs a canonical object and copies only known fields. Pretty-printed export is stable in field order. Neither key order nor formatting affects validity.

The selected genesis mode is intent only; it contains no organism template or substrate recipe. This format is **not** a runnable simulation or checkpoint. Do not add pretend engine versions or result data to a configuration before an engine exists.

## Local persistence

Key: `mathos.experiment.v1`; value: the same validated JSON format. Explicit save replaces this single slot only after validation. Explicit load validates before changing the draft. Startup does not automatically overwrite or migrate anything. Storage access/quota errors and corrupt values are surfaced; export remains available. Browser storage is origin-specific, best effort, and not a backup. Export and import are the portable recovery mechanism.

No migration is needed for v1. Future versions require explicit migration functions, fixtures, and retained original data. Never guess a version or silently downgrade unknown fields.

## Planned formats

Keep configuration, checkpoint, command log, and results distinct. A future runnable configuration will include versioned rules, genesis recipe/template references, numerical assumptions, and run limits. A checkpoint will additionally contain engine version, current tick, all pixel/organism/controller/development state, generator algorithm/version/state, and queued commands. Results will include experiment plan, configuration, seeds, engine/rule versions, metrics definitions, command provenance, and termination reason.

Specify typed-array encoding, compression, checksums, large-file limits, and migrations before adding checkpoint import. Do not claim cross-version replay without golden fixtures. Timestamps may annotate provenance but cannot participate in deterministic transitions. Browser/engine metadata records a compatibility context; bitwise cross-platform equivalence remains unverified.

## Implemented: substrate-run version 1

A separate envelope, schema and example live in `schemas/substrate-run.schema.json` and `examples/substrate-run.v1.json`. It is not a migration of experiment v1 and does not execute its genesis intent.

| Field | Contract |
| --- | --- |
| `format`, `schemaVersion` | `mathos-substrate-run`, integer 1 |
| `name`, `seed`, `universe` | Same name, uint32 seed and 8–256 grid bounds as experiment v1 |
| `engine` | `{ id: substrate-reference, version: 1 }` |
| `rng` | `{ id: mulberry32, version: 1 }` |
| `initializer` | `{ id: uniform-noise or center-impulse, version: 1 }` |
| `rules` | `{ id: conservative-transport, version: 1, boundary: periodic or closed, transferDivisor: 8 or 16 }` |

The table abbreviates JSON strings; the actual JSON example is authoritative syntax. All fields are required, and unknown keys, IDs, versions, coercible arrays, non-finite values, and invalid bounds are rejected. The 64 KiB UTF-8 import cap applies. Canonical order is format/version/name/seed/universe/engine/RNG/initializer/rules.

Local key: `mathos.substrate-run.v1`, separate from the original slot. Save validates before writing; load/import validates before replacement and requires progress-discard confirmation if needed. Storage failure leaves definition export available. Imported and exported definitions restart at tick zero. They contain no current field, tick, resume state, or checkpoint. Rates and other view preferences are not model inputs. Both slots are explicit, origin-local, single-configuration storage, not a backup.

## Implemented experimental life definition v1

See schemas/life-run.schema.json and examples/life-run.v1.json. Envelope: format mathos-life-run, schemaVersion 1, name/uint32 seed, universe dimensions 8–64, engine life-reference@1, rng mulberry32@1, genesis {mode: primordial|seeded, recipe: resource-noise@1, template: center-cell@1}, rules {id: pixel-life@1, boundary: closed|periodic, transferDivisor: 8|16}. Template identity is present in both modes for schema stability but only instantiated in seeded mode. Every listed field is required; unknown keys/versions/coercion/oversize text are rejected. Local slot mathos.life-run.v1 uses explicit validated save/load; previous formats and slots remain unchanged. Imports replace the active life definition only after validation and progress-discard confirmation. Definitions restart, not resume.

Life results are export-only JSON: format mathos-life-results, schemaVersion 1, validated definition, three uint32 seeds, ticksPerSeed (1–500; UI 500), completed/cancelled/failed status, termination reason and runs with seed/status/exact endpoint metrics including partial ticks. Definition carries all model/RNG versions. No checkpoint importer or result-resume claim. Timestamps and rendering preferences do not participate in replay.

## Ecology starting definition v1

Separate envelope {format: mathos-ecology, version: 1, seed: uint32, mode: seeded|primordial}, all four fields required, no extra keys/coercion, 64 KiB UTF-8 import cap. The named ecology-reference@1 model fixes its 64×48 closed world and all lifecycle rules in ADR 0008. These bounds/settings are deliberately not an arbitrary universe-rule editor. Runtime constructs a frozen canonical definition. Local key mathos.ecology.v1; existing slots and models remain unchanged. Files restart at step zero, not checkpoints. No implicit migrations or result importer.

The ecology envelope has a [JSON schema](../schemas/ecology.schema.json) and [example](../examples/ecology.v1.json).

## Ecology definition v2

[Schema](../schemas/ecology-v2.schema.json) and [example](../examples/ecology.v2.json): same four required keys as v1, but version2 selects ecology-reference@2 / ADR0009. Imports never migrate silently. New default slot mathos.ecology.v2; model1 can explicitly read its original mathos.ecology.v1 slot. A stored definition must match the selected slot version. Exports name their version and restart at step0. Checkpoints and large result persistence remain planned.

## Ecology observation export v1

Export observations produces mathos-ecology-observations version1: ecology-reference@2/mulberry32@1 provenance, validated version2 definition, current sampled tick and reason sampled|tick-limit, exact current metrics,20-step history samples and bounded lineage with birth genes, mutation before/after, roots and measured intake/movement/death outcomes. History samples can precede the current tick. Arrays/records are copied; no current food grid or resume-state is included. This export-only format is not a checkpoint, import contract or persistent history store.

## Development measurement export v1

`scripts/ecology-baseline.mjs` writes export-only `mathos-ecology-baseline` version1. It records ecology-reference@2/mulberry32@1, fixed-controller identity and `learning:false`, source commit/dirty flag, Node version, the six declared seeds and 1,600-step horizon. Each run has its validated starting definition, actual ticks/termination, first extinction tick (or null), peak population, total lineage intake, exact endpoint metrics, and populationTicks (sum of living population after ticks1 through the horizon, excluding tick0). It reports every seed and continues to the declared horizon after extinction. Results are local development measurements, not a checkpoint, imported format, learning comparison or proof of improvement. Output files must be new and stay out of source control. [Task/evidence contract](handoff/NEXT.md).

## Implemented locally: ecology definition v3

Exactly five required keys, canonical order as shown:

```json
{"format":"mathos-ecology","version":3,"seed":42,"mode":"seeded","learning":true}
```

`format` and integer `version` are literals; `seed` is uint32; `mode` is `seeded` or `primordial`; `learning` is a required boolean (no default or coercion). Reject extra keys, non-finite values, unsupported versions and imports over 64 KiB. V3 selects ecology-reference@3, linear-td@1, mulberry32@1 and ecology-streams@1 from ADR0010; algorithm parameters are fixed by version, not editable unchecked fields. Both arms use the same controller, changing only whether updates apply. Primordial creates no organisms or learning activity.

The v3 schema, example, frozen canonical validator, dispatcher and `mathos.ecology.v3` storage are implemented together. A stored definition must match its slot version. Export/import restart at tick0; no weights, current RNG states or learned memories are in starting definitions. Keep v1/v2 slots and fixtures unchanged. V1/v2 imports retain their existing semantics.

V3 observation exports use `mathos-ecology-observations` version2 with v3 definition and engine/controller/RNG-stream provenance; version1 remains the v2-only export. Each bounded lineage entry includes update count and its latest decision: tick, pre-action scaled input, raw food signals, relative intent, heading before, actual action text, exploration flag, actual intake/mechanical cost/upkeep, clipped reward, pre-update selected Q, next Q, delta, actual six weight changes, next input (null at terminal), and terminal flag. Records and arrays are copied. This export omits live weights/world grids and cannot resume a world.

## Learning comparison export v1

Export-only `mathos-learning-comparison` version1 names ecology-reference@3, linear-td@1, mulberry32@1 and ecology-streams@1; source revision/dirty flag, the six declared seeds, ticksPerRun (UI1600; runner validated1–1600), status completed|cancelled|failed and reason. Each run includes its validated v3 definition, status, actual ticks, populationTicks, peakPopulation, firstExtinctionTick (null means not observed), totalIntake, total lineage updates, measured computeMs, and complete exact ecology metrics. The CLI additionally records its Node runtime. All frames/outputs are separate from the interactive state.

A cancelled/failed batch keeps finished runs and a partial active run when available. Differences are computed only from two completed arms for the same seed; absent pairs remain incomplete, not zero. No comparison importer, checkpoint resume or silent result persistence. New CLI output files refuse overwrites. Source dirty=true identifies uncommitted changes; it is provenance, not a claim that the base commit alone reproduces that build. Compute time measures engine/measurement work outside the model and varies with device and trajectories; it is not an isolated learning-only overhead estimate.

## V4 inherited-body definitions and observations

Ecology definition4 requires exactly format=mathos-ecology, version=4, uint32 seed, seeded/primordial mode, boolean learning and boolean structuralMutation. Schema/example: ecology-v4.schema.json and ecology.v4.json. Slot mathos.ecology.v4 is isolated; no automatic migration. Structural mutation off preserves layouts, not numerical traits or learned weights. Saved definitions restart at0; no checkpoint.

Internal cell-layout@1 loci have x/y integers−2…2 and role, length3–6, fixed first3 scaffold, unique positions and orthogonally connected prefixes. body-genome-v1.schema.json checks structure; runtime validateLayout additionally checks unique sites and prefix connectivity. This milestone does not import arbitrary starter layouts.

Observations version3 identify ecology-reference@4, cell-layout@1, linear-td@1 and ecology-streams@1. Archive genes include deep-copied birth layout and immutable founder-template tag; developed records the last actual cell count, layoutAttempt the proposal/rejection/disabled outcome, layoutMutation an accepted before/after change. historyCategories labels dart/grazer/scout counts as founder origins. Observations still lack complete resume state. V3 observation2 and older observation1 remain unchanged.

Learning comparison version2 identifies v4 and includes each full v4 starting definition and bodyGenome; version1 remains the v3 comparison. Source revision/dirty flag, all seeds, honest partial statuses and per-treatment measurements remain explicit. Never compare or merge engine-version outputs as if their rules were identical.

## Developer factorial evaluation v1

The strict mathos-ecology-evaluation-plan version1 accepts exactly format/version/id/engine/mode/ticksPerRun/seeds. Engine4 and seeded mode are fixed; id is1–64 lowercase alphanumeric/hyphen characters starting alphanumeric; horizon1–1600 and1–8 unique uint32 seeds. The tool always runs all four learning false/true ×structuralMutation false/true treatments per seed; no treatment can be silently omitted. evaluations/v4-untuned-01.json is the separately preregistered full evaluation, not a mutable default.

Export-only mathos-ecology-evaluation version1 includes the canonical copied plan, engine/body/controller/RNG-stream identities, completed/cancelled/failed batch and per-run status, actual ticks, declared measurements and complete endpoint accounting. Every expected contrast is present, with null differences for incomplete arms. CLI adds clean Git revision, Node runtime, raw-plan SHA256 and ecology-module hashes. Output is never imported as a checkpoint and never silently saved in browser storage. The CLI rejects plans over64KiB and existing output files, requires clean source, handles graceful SIGINT/SIGTERM and refuses overwrite at final exclusive creation. Raw result files remain ignored. See evaluation-plan-v4-01.md for the frozen protocol and failure interpretation.
