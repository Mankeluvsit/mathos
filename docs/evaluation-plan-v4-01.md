# Untuned v4 evaluation 01 — frozen before outcomes

This protocol is committed before running any of its worlds. Scientific model: unchanged ecology-reference@4 / cell-layout@1 / linear-td@1, ADR0011. Engine baseline is source855b0acfd6b7abe584b7167a0865e4d05c3ff3d5 (same model as the published06dd544 app). This evaluates the current untuned model; it does not prove general intelligence, open-ended evolution or statistical generality.

## Fixed inputs and budget

Machine-readable authority: evaluations/v4-untuned-01.json. Seeds are the first32 bits, big-endian, of SHA256 of UTF-8 `MATHOS/v4/untuned-evaluation-01/` followed by index0 through5. This rule was chosen before outcomes, not by searching for attractive organisms. The resulting seeds are1790777818,672296274,727214190,34107901,361179395,154452819; none are the six documented development seeds. They are new to this evaluation, not an independently audited external holdout.

For each seed, in listed order: learning=false then true; within each, structuralMutation=false then true. All worlds use seeded genesis, version4 and the same unmodified rules. Every run advances1600 ticks, including after extinction:24 runs /38400 maximum transitions. The runner may accept smaller bounded plans for verification, but those are not this declared experiment. Maximum tool budget:8 unique uint32 seeds ×4 treatments ×1600 ticks. No coefficient, reward, mutation-rate, initializer or fixture change is part of this task.

## Measurements fixed before outcomes

For every run report actual completed ticks and status, final survivors, births, deaths, highest generation, peak population (including tick0), populationTicks (sum after ticks1–1600), first extinction tick or null, total lineage food intake, actual learning update count, enabled structural proposals, accepted structural changes, largest birth genome, largest developed body, distinct birth genomes and complete endpoint resource metrics. Check exact accounting throughout model advancement and at recorded endpoints. Snapshot-derived results must be independent copies.

Four contrasts per seed: learning on minus off at each fixed structural flag; structural on minus off at each fixed learning flag. Report signed differences in final survivors, populationTicks, intake, births and deaths. Report each seed and every treatment, not only averages. A comparison is absent (null), never zero, if either arm is incomplete. These are paired starting conditions, not a shared environment or a guarantee of matched trajectories after treatments diverge.

## Failure, interruption and provenance

Do not replace seeds, retry failed worlds or stop at extinction. Record a failed world's last valid tick/metrics and reason, then continue the remaining worlds; mark the entire batch failed even if other worlds complete. On user interruption, keep completed and active partial results and mark cancelled; omitted worlds remain omitted. An interrupted process killed without graceful handling may have no final result: report that explicitly, never as completed.

Record exact raw-plan SHA256, Git revision/dirty state, engine module hashes, runtime and frozen canonical plan. Require clean source for the real evaluation. Output files must be new; never overwrite prior evidence. Raw scientific results remain ignored under .artifacts; commit the protocol, tooling and a human-readable report with all outcomes and limitations. Do not regenerate old fixtures. Post-outcome corrections must state whether they affect measurements or scientific rules; any later parameter tuning makes these seeds development data for that tuned model.

## Completion criteria

Protocol frozen first; bounded validated runner with deterministic/copy/failure/cancellation/contrast checks; full local verification; clean committed tool source; all24 outcomes reported; exact accounting for completed runs; explicit missing contrasts; no silent tuning; current handoff and review description. Runtime UI and published app do not change in this developer-tool milestone; retain the verified existing preview and identify its source separately.
