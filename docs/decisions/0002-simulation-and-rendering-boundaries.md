# 0002: Simulation and rendering boundaries

Status: accepted architecture; engine deferred.

Context: pixel artificial life needs reproducibility, inspectability, and eventual multi-scale performance. Coupling physics to React renders would make results depend on frame timing.

Decision: define pure domain validation now; plan deterministic fixed-tick simulation independent of React, Canvas, storage, and time. Render read-only snapshots separately. Use Canvas 2D first and consider workers after correctness/profiling. Keep future learning, evolution, development, and experiment orchestration as distinct modules with explicit contracts.

Consequences: tests can run without a browser renderer; worker adoption can preserve engine semantics. The foundation contains no pretend engine or unnecessary worker abstraction. Detailed equations, RNG choice, and update phases need later reference fixtures and decisions.
