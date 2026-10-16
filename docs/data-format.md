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
