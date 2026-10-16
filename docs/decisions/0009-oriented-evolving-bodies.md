# ADR 0009 — heading, inherited bodies and observed evolution

Status: accepted implementation within the owner's instruction to continue the plan including functional turning. Lifetime neural learning remains a subsequent milestone; it must be compared against the fixed-controller baseline rather than asserted as delivered here.

## Version and scope

Preserve ecology-reference@1 code/fixtures/definition/storage unchanged. Default to ecology-reference@2 / mathos-ecology version2, with the same seed/mode envelope and fixed64×48 closed world,48 live organisms,256 lineage records,1600 ticks. Explicitly load/import v1 through a dispatcher; never silently reinterpret its trajectories. V2 saves use mathos.ecology.v2; v1 saves remain available through the model selector.

## Physical geometry

Anchor is the blue controller cell. Local north-facing layouts: controller(0,0), mouth(0,-1), motor(0,1). Heritable body plans: dart (these3 cells), grazer (extra mouth at(1,0)), scout (extra sensor at(1,0)). Juveniles have the first2 cells, grow a motor at age>=10 and energy>=80, and grow their accessory at age>=20 and energy>=100. Every added cell costs8 stored units. Local coordinates rotate clockwise by the body's N/E/S/W heading; intake, selection, outlines, placement and camera use the same transformed cells.

Only bodies with a developed motor perform mechanical actions; a motorless juvenile may feed/develop but cannot turn or move. A tick performs at most one mechanical action: turn90° about the controller (cost1) OR move one site forward (cost2+max(0,cells-3)); no strafing or translation on a turning tick. Reverse requires two turns. Turn collision uses the union of per-cell axis-aligned rectangles between old/new positions, a conservative grid sweep. This overestimates some continuous sweeps but prevents corner tunneling; all swept sites must be in bounds and free of other bodies. Own old cells are excluded. Failed forward actions may try right then left safe quarter-turns; no action changes geometry if blocked.

## Sensing and lifecycle

Sense around the front mouth within Manhattan radius inherited sense (+2 with a developed sensor). Rear half-plane relative to heading is blind. Reduce food into forward/right/back/left signals (back receives no food observations). Score = inherited foodWeight×signal + inherited inertia for forward. Greedy maximum, stable relative tie order; with no signal a seeded draw chooses a relative target. Decisions precede mechanics, then each actual mouth harvests at most24 units from its own/orthogonally adjacent sites, capped at600 stored units. Pay metabolism equal to developed cell count. Energy exhaustion or inherited maximum age causes death, explicitly dissipating stores/structure. Food generation/initial ledger retain v1's declared rules; eight founders start mature with plans cycling dart/grazer/scout and headings cycling N/E/S/W. Initial resources include all founder stores/structure.

Reproduction retains age40, cooldown80, energy260 and116-unit child funding (100 store+16 structure). Child placement uses the inherited heading and actual two-cell footprint. Mutation probability1/4; one additional draw selects sense/foodWeight/inertia/lifespan/bodyPlan and direction of bounded change. V1 gene bounds remain; body plan cycles among the3 layouts. Record birth genes, exact mutation before/after, parent/root family, intake, forward distance, turns and death reason. No claim of unconstrained anatomy or lifetime learning.

## Competition and evidence

Larger bodies pay greater metabolism/movement costs. Extra mouths can intake more; sensors extend a forward view. These are explicit potential tradeoffs, not a guarantee that a plan is optimal. Competition occurs through shared food, physical occupancy and resource-funded offspring. Retain time samples every20 ticks (81 max), family outcomes and full lineage (256 max). Show observed plan counts, population/food history, intake/offspring/deaths and parent/trait provenance. Do not call outcomes proof of adaptation, intelligence or biological realism.

Keep fixed ordered ID conflict priority and integer seeded transitions. Verify all headings, rotating mouth/sensing, turn sweeps/walls/other bodies, no strafing, two-turn reverse, immutable predecessor/snapshot state, exact supplied ledger, growth/mutation/inheritance, history bounds, cross-browser trajectories and old-model replay. Camera/zoom/mobile views never mutate scientific state.
