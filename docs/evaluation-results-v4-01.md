# Untuned v4 evaluation01 — results

**Completed:**24/24 runs,1600 ticks each, zero failures/interruption/extinctions, exact resource accounting throughout. No parameters or fixtures changed after outcomes. The live browser application is unchanged.

## What the results mean

Learning and inherited spatial changes are operational, but their ecological effects depend on the starting condition and treatment. Final survivors and population over time can disagree; neither alone establishes general fitness or intelligence. Five-cell genomes developed naturally; six-cell support remains controlled-test evidence. There were31 accepted structural changes from62 enabled proposals across the12 mutation-enabled worlds. Disabled worlds accepted none.

Each row below compares on minus off across the six predeclared seeds. H/L/S means higher/lower/same; populationTicks sums the living population after every step, excluding tick0.

| Changed factor | Fixed other setting | Final survivors H/L/S | PopulationTicks H/L/S | Food intake H/L/S |
| --- | --- | --- | --- | --- |
| Learning | Body mutation off | 4 / 1 / 1 | 4 / 2 / 0 | 4 / 2 / 0 |
| Learning | Body mutation on | 2 / 4 / 0 | 3 / 3 / 0 | 3 / 3 / 0 |
| Body mutation | Learning off | 3 / 0 / 3 | 1 / 3 / 2 | 3 / 1 / 2 |
| Body mutation | Learning on | 1 / 2 / 3 | 2 / 2 / 2 | 2 / 2 / 2 |

Example of a tradeoff: seed154452819 with learning off had17 more final survivors when body mutation was enabled, but2903 fewer populationTicks. A stronger final count did not mean more organisms throughout the run. With body mutation enabled, turning learning on in that same seed reduced final survivors by13 but increased populationTicks by3845. Do not collapse these into one success score.

**Next development priority:** diagnose actual decisions and energy tradeoffs before changing reward or anatomy coefficients. Use bounded traces of observed food, intended versus actual movement, intake/upkeep and weight updates to explain a documented regression and a contrasting outcome. Those selected cases become diagnostic development examples, not a new holdout. Keep model4 and its replay fixtures unchanged during diagnosis.

## Provenance and reproduction

- Frozen protocol: [plan](evaluation-plan-v4-01.md), committed first asdcf0637a95f21221d59e7edf8f665a2fc6719a51. Plan SHA256:`e64be2849ccbeadf8b7db25e08b433dfa653e3133fe6f1da52f3c9a4221a46cd`.
- Evaluator/model source:`6d65a2e70fae3159480a158a4a1433d42c0bca8b`, dirty=false; runtime`v24.19.0`. Existing ecology modules exactly match855b0ac; only the separate evaluation module is new. Model rules are the same as the published06dd544 application.
- Original ignored raw output:.artifacts/v4-untuned-01-first.json, SHA256:`700688a210c7fcbd60dcf2be7e6770194f0c777215b09675d2b58256d7f982eb`. Raw data includes all module hashes and contrasts; it is not committed scientific output or a checkpoint.
- Reproduce from the exact tool source with a NEW output filename:

```sh
npm run experiment:evaluate -- evaluations/v4-untuned-01.json .artifacts/v4-untuned-01-reproduction.json
```

The command requires a clean checkout. Later documentation-only revisions keep model outputs unchanged but legitimately change source provenance. Full exported bytes differ when source/runtime differ. Source/run limits and failure handling are in the frozen protocol. These six seeds were chosen before outcomes by a hash rule; they are not an externally audited holdout, and are development data for any subsequent tuning.

## All outcomes

L/M below means learning/body mutation:0 off,1 on. All rows completed1600 ticks. First extinction was null in every row. These are all four treatments for every seed, not selected favorable cases.

<details>
<summary>Population, food and reproduction — all24 runs</summary>

| Seed | L/M | Final population | PopulationTicks | Peak | Intake | Births | Deaths | Max generation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1790777818 | 0/0 | 15 | 18591 | 21 | 101453 | 122 | 115 | 10 |
| 1790777818 | 0/1 | 15 | 18587 | 21 | 101549 | 122 | 115 | 10 |
| 1790777818 | 1/0 | 6 | 16326 | 22 | 98377 | 107 | 109 | 11 |
| 1790777818 | 1/1 | 14 | 17964 | 19 | 101796 | 121 | 115 | 7 |
| 672296274 | 0/0 | 8 | 16135 | 17 | 98693 | 115 | 115 | 9 |
| 672296274 | 0/1 | 12 | 16848 | 17 | 102546 | 117 | 113 | 12 |
| 672296274 | 1/0 | 8 | 16346 | 17 | 99711 | 119 | 119 | 8 |
| 672296274 | 1/1 | 5 | 16294 | 17 | 97124 | 115 | 118 | 8 |
| 727214190 | 0/0 | 2 | 15639 | 27 | 93141 | 103 | 109 | 8 |
| 727214190 | 0/1 | 2 | 15639 | 27 | 93141 | 103 | 109 | 8 |
| 727214190 | 1/0 | 9 | 19978 | 18 | 101374 | 120 | 119 | 10 |
| 727214190 | 1/1 | 9 | 19978 | 18 | 101374 | 120 | 119 | 10 |
| 34107901 | 0/0 | 10 | 18625 | 19 | 102464 | 117 | 115 | 11 |
| 34107901 | 0/1 | 14 | 16057 | 21 | 98127 | 101 | 95 | 13 |
| 34107901 | 1/0 | 17 | 20839 | 26 | 104026 | 130 | 121 | 11 |
| 34107901 | 1/1 | 12 | 20017 | 22 | 102885 | 121 | 117 | 7 |
| 361179395 | 0/0 | 8 | 18514 | 27 | 97741 | 122 | 122 | 11 |
| 361179395 | 0/1 | 8 | 18514 | 27 | 97741 | 122 | 122 | 11 |
| 361179395 | 1/0 | 14 | 17974 | 25 | 94252 | 128 | 122 | 8 |
| 361179395 | 1/1 | 14 | 17974 | 25 | 94252 | 128 | 122 | 8 |
| 154452819 | 0/0 | 7 | 18769 | 20 | 99672 | 116 | 117 | 9 |
| 154452819 | 0/1 | 24 | 15866 | 26 | 102629 | 116 | 100 | 9 |
| 154452819 | 1/0 | 11 | 19435 | 21 | 101184 | 122 | 119 | 9 |
| 154452819 | 1/1 | 11 | 19711 | 21 | 102580 | 117 | 114 | 9 |

</details>

<details>
<summary>Body variation and actual learning — all24 runs</summary>

| Seed | L/M | Enabled proposals | Accepted changes | Largest genome | Largest developed | Distinct birth genomes | Learning updates |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1790777818 | 0/0 | 0 | 0 | 4 | 4 | 3 | 0 |
| 1790777818 | 0/1 | 5 | 2 | 5 | 4 | 5 | 0 |
| 1790777818 | 1/0 | 0 | 0 | 4 | 4 | 3 | 14999 |
| 1790777818 | 1/1 | 5 | 4 | 5 | 5 | 6 | 16470 |
| 672296274 | 0/0 | 0 | 0 | 4 | 4 | 3 | 0 |
| 672296274 | 0/1 | 4 | 3 | 4 | 4 | 4 | 0 |
| 672296274 | 1/0 | 0 | 0 | 4 | 4 | 3 | 14892 |
| 672296274 | 1/1 | 3 | 1 | 4 | 4 | 3 | 14659 |
| 727214190 | 0/0 | 0 | 0 | 4 | 4 | 3 | 0 |
| 727214190 | 0/1 | 3 | 2 | 5 | 4 | 4 | 0 |
| 727214190 | 1/0 | 0 | 0 | 4 | 4 | 3 | 18605 |
| 727214190 | 1/1 | 4 | 0 | 4 | 4 | 3 | 18605 |
| 34107901 | 0/0 | 0 | 0 | 4 | 4 | 3 | 0 |
| 34107901 | 0/1 | 9 | 7 | 4 | 4 | 7 | 0 |
| 34107901 | 1/0 | 0 | 0 | 4 | 4 | 3 | 18978 |
| 34107901 | 1/1 | 9 | 4 | 5 | 4 | 7 | 18367 |
| 361179395 | 0/0 | 0 | 0 | 4 | 4 | 3 | 0 |
| 361179395 | 0/1 | 1 | 0 | 4 | 4 | 3 | 0 |
| 361179395 | 1/0 | 0 | 0 | 4 | 4 | 3 | 16409 |
| 361179395 | 1/1 | 1 | 0 | 4 | 4 | 3 | 16409 |
| 154452819 | 0/0 | 0 | 0 | 4 | 4 | 3 | 0 |
| 154452819 | 0/1 | 9 | 7 | 5 | 5 | 6 | 0 |
| 154452819 | 1/0 | 0 | 0 | 4 | 4 | 3 | 18052 |
| 154452819 | 1/1 | 9 | 1 | 5 | 5 | 4 | 18062 |

</details>

<details>
<summary>Complete endpoint resource accounting — all24 runs</summary>

Every supplied total equals food+stores+structure+dissipated. Pellets counts occupied food sites.

| Seed | L/M | Supplied | Food | Stores | Structure | Dissipated | Accounted | Pellets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1790777818 | 0/0 | 109840 | 7195 | 3088 | 360 | 99197 | 109840 | 300 |
| 1790777818 | 0/1 | 109888 | 7147 | 3088 | 360 | 99293 | 109888 | 298 |
| 1790777818 | 1/0 | 110416 | 10847 | 1352 | 168 | 98049 | 110416 | 456 |
| 1790777818 | 1/1 | 110944 | 7956 | 3395 | 376 | 99217 | 110944 | 342 |
| 672296274 | 0/0 | 109912 | 10027 | 2603 | 240 | 97042 | 109912 | 451 |
| 672296274 | 0/1 | 110632 | 6894 | 2291 | 344 | 101103 | 110632 | 294 |
| 672296274 | 1/0 | 110920 | 10017 | 2062 | 248 | 98593 | 110920 | 436 |
| 672296274 | 1/1 | 110656 | 12340 | 1843 | 152 | 96321 | 110656 | 538 |
| 727214190 | 0/0 | 107512 | 13179 | 1192 | 64 | 93077 | 107512 | 556 |
| 727214190 | 0/1 | 107512 | 13179 | 1192 | 64 | 93077 | 107512 | 556 |
| 727214190 | 1/0 | 111040 | 8474 | 1308 | 216 | 101042 | 111040 | 355 |
| 727214190 | 1/1 | 111040 | 8474 | 1308 | 216 | 101042 | 111040 | 355 |
| 34107901 | 0/0 | 110752 | 7096 | 1860 | 232 | 101564 | 110752 | 297 |
| 34107901 | 0/1 | 109408 | 10089 | 3328 | 376 | 95615 | 109408 | 453 |
| 34107901 | 1/0 | 110944 | 5726 | 3224 | 408 | 101586 | 110944 | 240 |
| 34107901 | 1/1 | 111880 | 7803 | 2894 | 288 | 100895 | 111880 | 327 |
| 361179395 | 0/0 | 108448 | 9515 | 1709 | 192 | 97032 | 108448 | 401 |
| 361179395 | 0/1 | 108448 | 9515 | 1709 | 192 | 97032 | 108448 | 401 |
| 361179395 | 1/0 | 107728 | 12284 | 3093 | 304 | 92047 | 107728 | 532 |
| 361179395 | 1/1 | 107728 | 12284 | 3093 | 304 | 92047 | 107728 | 532 |
| 154452819 | 0/0 | 109672 | 8808 | 678 | 160 | 100026 | 109672 | 368 |
| 154452819 | 0/1 | 108472 | 4651 | 6251 | 720 | 96850 | 108472 | 223 |
| 154452819 | 1/0 | 110848 | 8472 | 1890 | 264 | 100222 | 110848 | 353 |
| 154452819 | 1/1 | 110656 | 6884 | 2348 | 264 | 101160 | 110656 | 290 |

</details>

<details>
<summary>Every signed contrast — on minus off</summary>

| Seed | Changed factor | Fixed other flag | Survivors | PopulationTicks | Intake | Births | Deaths |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1790777818 | learning | structuralMutation=false | -9 | -2265 | -3076 | -15 | -6 |
| 1790777818 | learning | structuralMutation=true | -1 | -623 | 247 | -1 | 0 |
| 1790777818 | structuralMutation | learning=false | 0 | -4 | 96 | 0 | 0 |
| 1790777818 | structuralMutation | learning=true | 8 | 1638 | 3419 | 14 | 6 |
| 672296274 | learning | structuralMutation=false | 0 | 211 | 1018 | 4 | 4 |
| 672296274 | learning | structuralMutation=true | -7 | -554 | -5422 | -2 | 5 |
| 672296274 | structuralMutation | learning=false | 4 | 713 | 3853 | 2 | -2 |
| 672296274 | structuralMutation | learning=true | -3 | -52 | -2587 | -4 | -1 |
| 727214190 | learning | structuralMutation=false | 7 | 4339 | 8233 | 17 | 10 |
| 727214190 | learning | structuralMutation=true | 7 | 4339 | 8233 | 17 | 10 |
| 727214190 | structuralMutation | learning=false | 0 | 0 | 0 | 0 | 0 |
| 727214190 | structuralMutation | learning=true | 0 | 0 | 0 | 0 | 0 |
| 34107901 | learning | structuralMutation=false | 7 | 2214 | 1562 | 13 | 6 |
| 34107901 | learning | structuralMutation=true | -2 | 3960 | 4758 | 20 | 22 |
| 34107901 | structuralMutation | learning=false | 4 | -2568 | -4337 | -16 | -20 |
| 34107901 | structuralMutation | learning=true | -5 | -822 | -1141 | -9 | -4 |
| 361179395 | learning | structuralMutation=false | 6 | -540 | -3489 | 6 | 0 |
| 361179395 | learning | structuralMutation=true | 6 | -540 | -3489 | 6 | 0 |
| 361179395 | structuralMutation | learning=false | 0 | 0 | 0 | 0 | 0 |
| 361179395 | structuralMutation | learning=true | 0 | 0 | 0 | 0 | 0 |
| 154452819 | learning | structuralMutation=false | 4 | 666 | 1512 | 6 | 2 |
| 154452819 | learning | structuralMutation=true | -13 | 3845 | -49 | 1 | 14 |
| 154452819 | structuralMutation | learning=false | 17 | -2903 | 2957 | 0 | -17 |
| 154452819 | structuralMutation | learning=true | 0 | 276 | 1396 | -5 | -5 |

</details>

## Verification and limits

Full local verification passed173 tests/20 files, lint/types/build, four independent Python references and every Chromium/Firefox workflow, including preserved v1–4 full-state regressions. The six new evaluation tests cover validation/budgets, direct trajectory agreement, copy/replay independence, partial cancellation, retained failed arms and signed contrast arithmetic. The actual clean-source CLI also refused an existing output without altering it and handled SIGINT with one complete1600-tick run plus an8-tick partial run; incomplete contrasts stayed null and endpoint accounting remained exact. OpenCode1.19.2 parsing and handoff checks passed. Source CI status is recorded separately in handoff/STATE.md.

Independent references check specified arithmetic/geometry; they are not an independent oracle for all ecology dynamics. No physical-phone/Safari certification or independent-model review is claimed. There is no parameter search, significance claim, broad-controller upgrade or UI change in this milestone.
