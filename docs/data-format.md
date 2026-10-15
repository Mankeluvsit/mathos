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
