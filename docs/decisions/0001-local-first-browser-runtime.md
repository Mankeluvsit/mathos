# 0001: Local-first browser runtime

Status: accepted for Phase 0.

Context: MATHOS must remain usable locally without accounts or remote compute. The project is new and needs a maintainable development loop.

Decision: use strict TypeScript, React, Vite, semantic HTML/CSS, and native Canvas/SVG as needed. Build static assets with relative URLs. Require no backend, external runtime API, authentication, analytics, or cloud services. Use npm/GitHub only as development infrastructure.

Consequences: simple deployment and local ownership; browser resource limits constrain workloads. No service worker initially, so offline reload is not guaranteed without a running local server. Browser compatibility and accessible alternatives remain explicit responsibilities.
