# 0003: Persistence and reproducibility

Status: accepted configuration storage; checkpoint design deferred.

Context: data should remain on the user's device and portable. Browser storage may fail, be cleared, or contain incompatible data.

Decision: use explicit localStorage save/load for one small validated v1 configuration and JSON import/export. Reject unknown versions/properties. Never silently replace corrupt data. Bound dimensions and input size. Keep an injectable storage adapter; plan IndexedDB for large results only when needed.

Reproducibility requires explicit seeds, versions, initial conditions, deterministic scheduling, and future RNG state/command logs. A v1 configuration records intent only and cannot resume or reproduce a not-yet-implemented simulation.

Consequences: a small understandable format and failure tests now; explicit migrations and separate checkpoint/results formats later. No claim of bitwise browser-independent replay until numerical behavior is specified and tested.
