# ADR 0007: bounded integrated life reference

Status: accepted implementation decision within the owner's authorization to build a testable integrated baseline. Experimental, not a biological claim.

## Context and decision

Connect a narrow slice of phases 2–6 without changing substrate-reference v1. Add life-reference@1 / pixel-life@1, mulberry32@1, a resource-noise@1 recipe and center-cell@1 template. Separate definition and storage formats preserve earlier files.

Resources are abstract integer units. Each pixel starts at 1024 + (RNG uint32 >>> 22). Draw once per row-major site. Seeded genesis withdraws 288 units from the center site: 256 stored in organism 1 and 32 as structural material. Primordial creates no organisms. Periodic/closed conservative transport with divisor 8/16 is reused unchanged.

## Tick order

1. Transport environmental resources synchronously.
2. Visit organisms present at tick start in increasing ID order. Earlier IDs intentionally win contested sites; this is an explicit reference-model bias.
3. Harvest up to 32 units per occupied pixel, capped at 8192 stored units per organism. Pay metabolism 2 × pixel count into cumulative dissipation. If insufficient energy remains, die and return stored/structural units to former sites. Each site's uint16 capacity is respected; overflow is explicitly dissipated.
4. Sense the richest unoccupied orthogonal neighbor of the connected body. Tie order is body insertion order then north/east/south/west. Apply boundary policy. Perceptron score = bias + resourceWeight × floor(candidateResource/256) + energyWeight × floor(storedEnergy/32). With a candidate, nonnegative score and sufficient energy, grow one pixel up to genome.maxCells, converting 32 stored units to structure.
5. Recompute the candidate after growth. At >=512 energy and >=2 pixels, spawn a one-pixel child if population <64 and lifetime births <512. Deduct 288: child store 256 + structure 32. Newborns act next tick. One RNG draw decides mutation (low two bits zero = mutate); on mutation a second draw picks one of maxCells/bias/resourceWeight/energyWeight and +/-1. Clamp maxCells to 2–8 and weights to -8–8; record whether a value actually changed. Learned weights are never inherited because learning is not implemented.
6. Increment tick and compute organism/ecosystem metrics. Verify occupancy, connectedness, bounds and exact accounting. Cap at 2000 ticks.

A zero-energy organism dies after metabolism before growth. No spontaneous birth, movement, splitting/fusion, repair, predation or replenishment. Finite resources eventually constrain survival. Every lineage record retains ID, parent, birth/death tick and mutation flag, bounded by lifetime births.

## Runtime and experimentation

Run paused initially. At most four ticks per animation callback with an 8 ms work budget, 10 ticks/second and hidden-tab pause; wall time affects pacing only. Summaries publish at most four times/second. No history of full world snapshots is retained. Batch runner executes at most three seeds ×500 ticks, four transitions per yielded callback, records completed/cancelled/failed status and partial-run ticks. Hidden tabs cancel batches. Results contain definition, seed list, versions and exact measured summaries, not checkpoints.

## Consequences

An integer single-neuron controller avoids transcendental numeric differences and provides a fixed baseline for future learning comparisons. Stable sequential lifecycle resolution is simple and reproducible but biased. Resource metrics are accounting, not physical thermodynamics or evidence of intelligence. Performance budgets are bounded and measured; workers remain evidence-driven.
