# ADR0011 — bounded inherited cell layouts

Accepted for implementation under the owner's Continue instruction. Defines ecology-reference@4 / cell-layout@1; v1/v2/v3 stay unchanged. Implementation/evidence status is separate in capability-status and handoff/STATE.

## Genome and geometry

Ordered3–6 loci `{x,y,role}`, integer x/y in−2…2, unique sites. Fixed first loci: body(0,0), mouth(0,−1), motor(0,1). Optional loci are mouth/motor/sensor, each orthogonally touching an earlier locus. Every prefix is connected. First `size` loci are developed. Cardinal rotation about the core drives occupancy, conservative swept-turn collisions, feeding, sensing, rendering, selection and camera. All newborns share the two-cell prefix; find placement before mutation. Walls/bodies may block growth without resource charge.

The legacy bodyPlan field is an immutable **founder-template tag** for ancestry counts, not geometry. Label it as origin and show actual genome separately. This is bounded development, not arbitrary anatomy or spontaneous morphogenesis.

## Functions, costs and order

V4 uses the unchanged ADR0010 reward clamp/intake-minus-mechanical-minus-upkeep equation, with a separate measured-input adapter validating intake0–96 (four mouths), mechanical0–5 and upkeep0–6. The v3 helper retains0–48/0–3/0–4 limits; its code and learning arithmetic are unchanged.

Retain v3 bounds:64×48,48 living organisms,256 lineage entries,1,600 ticks,81 history samples,40 events. Separate lifecycle module; retain linear-td@1, fresh children, reward and named streams. Each developed mouth takes at most24 units from its own site then north/east/south/west, capped at600 stored energy. Sensing stays relative to the fixed front mouth; each developed sensor adds2 range, capped at12. Forward cost = `max(1,2+max(0,size−3)−(motors−1))`. Extra motors reduce cost, never increase speed. Turns cost1; at most one quarter-turn or one-site move per tick. Upkeep = developed size.

After action/intake/upkeep/death, grow at most one next cell if age≥`10*(size−1)`, energy≥`80+20*max(0,size−2)` and the next prefix fits. Transfer8 stored units into structure. Then reproduction uses v3 age40/cooldown80/energy260/caps/placement, additionally requiring developed motor. Transfer116 parent units into child100+two cells. Development/reproduction stay excluded from immediate food-efficiency learning reward (ADR0010). Death dissipates stores+8*size. Exact ledger: initial+sunlight = food+stores+8*developedCells+dissipated.

## Birth mutation schedule

Deep-copy birth genes. On successful placement, test reproduction RNG word%4==0; if true consume one more word. `%5` chooses sense/foodWeight/inertia/lifespan/layout. Numeric ranges/sign/lifespan step stay v3. No mutation draws without placement. Layout uses no extra RNG: operation `(word>>>4)%4` = add/remove-last/change-role/relocate. Add base `(word>>>20)%length`, direction `(word>>>12)%4`, role `(word>>>16)%3` in mouth/motor/sensor order. Remove only final optional locus. Change/relocate index = `3+(word>>>8)%(length−3)`; role advances1+bit18 in that list. Relocate adds the chosen direction. Invalid length/bounds/uniqueness/connected-prefix proposals reject without retries/resampling. Record attempted/rejected operations separately from actual accepted before/after changes. Rejection is not a mutation.

Starting structuralMutation boolean disables only layout changes; numeric mutations still occur. Draw schedule remains unchanged; disabled attempts are recorded. Founder-template tag never mutates. Structural inheritance and lifetime learning are distinct; accepted changes need not improve survival.

## Data and interface

V4 definition has exactly format/version/seed/mode/learning/structuralMutation; own schema/example and mathos.ecology.v4 slot, no migration. Settings restart at0. Observations version3 identify engine4/cell-layout@1, birth genomes, attempted/accepted changes, developed size and learning diagnostics; not checkpoints. Separate blueprint schema; no arbitrary starter-layout editor/import in this milestone.

After verification default to v4, retaining1–3 selection. Inspect north-facing inherited blueprint versus developed cells, actual role/cost counts and mutations. Ancestry charts label founding categories, not current anatomy. Preserve four phone destinations and shared playback. Paired learning comparisons run the chosen v3/v4 rules and export exact definitions/versions.

## Verification

Independent Python geometry/validation cases and hand-worked costs/growth anchors; mutation accept/reject/inheritance/reset/copy tests; exact accounting; unchanged old fixtures; new full-horizon regressions labeled as production captures, not an independent world oracle. Native all-heading geometry/selection, phone/desktop workflows, actual growth and inherited variation. Evaluate existing six development seeds without tuning afterward. Predation, arbitrary sizes, chemistry, jointed motion, checkpoints and open-ended evolution remain planned.
