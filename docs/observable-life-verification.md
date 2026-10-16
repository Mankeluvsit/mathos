# Observable-life correction verification

This document reports software behavior and measured examples, not biological realism, intelligence, or product acceptance on the owner's behalf. Primary design context is recorded in product-context.md and observable-life-plan.md.

## Checks

- Local lint, strict TypeScript, production build and 110 tests pass, including the previous 100 tests. Earlier workflow tests explicitly open ?lab=reference because the default experience is now the observable world.
- Model tests exercise real sensing and movement, immutable predecessors, exact resource input/accounting, bounded bodies/population/lineage/events, juvenile growth, birth/mutation/death, deterministic replay, primordial no-organism behavior and import rejection.
- React tests include StrictMode, individual selection/step, cancelled replacement, storage failure and retained export access.
- Ecology golden files record whole-state SHA-256 captures from the named TypeScript engine (seeds 0 and42, steps0/20/100/400/1600). These are regression captures, not an independent oracle. Browser tests compare them in Chromium/Firefox. Prior independent substrate and life-reference Python fixtures remain unchanged and checked.
- Production browser workflows cover the new opening world, actual playback, selection, magnification/follow, mobile state/reflow, reset cancellation, JSON export, invalid import, local save/load and primordial preparation; old substrate/life lab workflows remain required regressions.

## A measured example

Seed42, ecology-reference@1, 1600 steps: 22 live organisms, 161 births,147 deaths, maximum descendant generation8. The final ledger is118680 supplied =1617 food +3798 stores +528 structure +112737 dissipation. At step101 there are20 living organisms and12 births; at step401 there are32 living organisms,59 births and35 deaths. These counts describe this particular model/seed, not guaranteed outcomes for other experiments.

## Measured engine cost

One 1600-step seeded run on Node24.19.0 in this workspace reached36 live organisms at peak. Engine transitions (including invariant checks, excluding Canvas/browser) measured p95 0.30ms and maximum1.75ms. These are single-run observations under this hardware/load, not representative-device guarantees or a hard real-time bound.

## Limits

Bodies mature to three cells; no arbitrary differentiated anatomy. The local integer controller has inherited sensing/response/persistence traits, not learned lifetime weights. Newborn placement is discrete within a bounded neighborhood, not physical pregnancy or continuous mechanics. Older-ID priority, local steering, a fixed world/food input and bounded histories are model choices, not validated ecosystem laws. Predation, multi-scale process scheduling, richer morphogenesis, chemistry and autonomous ecology batches remain planned.

[Desktop and phone captures](previews/ecology/README.md) document the working correction. Screenshots demonstrate readability; final visual/product acceptance belongs to the owner. Browser automation does not establish full accessibility conformance, Safari or physical-device compatibility. Live preview provenance and final CI status are recorded in the source review change.
