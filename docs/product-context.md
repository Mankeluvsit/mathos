# Product context and visual direction

## Source and authority

Owner-provided context: [Mathematical Visualization Terms — shared ChatGPT conversation](https://chatgpt.com/share/6ad16958-ac04-83e8-adf2-f7d57f1b019e?ogimg=plain).

The conversation and its three concept images were read during the dashboard revision. It includes early mathematical-laboratory concepts, a pixel-art village interpretation, a later pixel-life mockup, UX recommendations, and development handoff. It is contextual design evidence. The owner's current instructions and this repository's approved specifications/roadmap remain authoritative. Earlier phase numbering, broad library lists and optional service ideas do not silently replace those decisions.

The owner clarified that the previous light-theme screenshot was insufficient to establish visual alignment. It showed the Phase 1 implementation's progression, not a final design or proof of concept equivalence. Exact copying is not required. A dark, colorized dashboard with deliberate desktop/mobile differences is now the confirmed direction.

## Connection to the concepts

| Concept direction | Current Phase 1 expression | Planned boundary |
| --- | --- | --- |
| Central pixel universe | Primary native Canvas viewport with real scalar-field data | Pixel organisms and ecosystems remain later phases |
| Mathematics connected to visuals | The actual transport equation, same active field, exact totals and coordinate inspector | Editable expression/node graphs and general mathematical translation remain planned |
| Contextual inspection | Selected x/y, measured value, tick, bounds and conservation | Organism, brain, genome and lineage inspectors are not implemented |
| Experimental control | Prepare/start/pause/step/reset, explicit inputs and portable definitions | Checkpoints, comparison histories and autonomous batches remain planned |
| Dark colorized laboratory | Near-black/blue surfaces; cyan/blue model controls, purple inspection, green measured totals, amber status | No fabricated charts, neural activity, population or biological metrics |

The pixel-life concept is the relevant visual reference. The earlier illustrated village does not change the confirmed pixel-as-simulation-substrate architecture. Images are conceptual mockups, not evidence that their depicted subsystems already exist.

## Visual system

- Dark by default: background `#060c14`, panel `#0c1725`, raised surfaces `#101f31`.
- Primary text `#e0eaf6`, secondary text `#a0b2c9`, cyan `#6cdaee`, purple `#bfa5ff`, green `#81dfb5`, amber `#f5c47d`.
- Thin panel boundaries, compact labeled controls, restrained color, and system fonts. Mathematical values use monospace. No external font/CDN or decorative animation.
- Spectrum, Thermal and Grayscale are view-only palettes with a fixed 0–65535 legend. A palette change cannot alter the seed, tick, active definition or values.
- Light mode, arbitrary panel docking, advanced equation editors and other concept controls are not added merely to imitate the mockups.

## Desktop

At wide widths, show model inputs on the left, the pixel viewport in the center and contextual field analysis on the right. Keep the current model identity and phase visible. Put playback next to the viewport and group preparation/persistence below it. Focus viewport hides side panels without replacing or resetting the run. At intermediate widths, move inspection below the viewport rather than compressing it into an unreadable rail.

## Mobile

Use Viewport / Setup / Inspect navigation rather than shrinking the desktop grid. Viewport prioritizes the world and reachable playback. Setup reveals draft inputs and run preparation/persistence. Inspect reveals exact values and model context. Panels stay mounted: navigation must not reset, reinitialize or discard a run. Preparing a run returns to the viewport, paused. A desktop focus preference must not hide mobile Setup/Inspect after resizing.

Touch controls are at least 44px high, with safe-area spacing, visible keyboard focus, readable labels and no horizontal page overflow at 320px. Navigation, focus mode and palettes are view changes, not scientific interventions.

## Review evidence

Desktop, phone viewport, phone setup and phone inspector previews accompany this revision. They show the working Phase 1 reference model, not organisms or future scientific capabilities. Functional browser checks cover both Chromium and Firefox, panel visibility/state preservation, palettes, keyboard controls, storage paths and reflow. The owner can judge visual alignment from multiple device views; an isolated desktop screenshot is not sufficient evidence of the mobile design.

[Review the desktop and three phone captures](previews/README.md).

## Owner review: observable artificial life

After trying the live integrated preview, the owner reported that it looked like pixels turning into mush and supplied [Life Engine](https://thelifeengine.net/) and [The Bibites](https://www.thebibites.com/) / [its channel](https://www.youtube.com/c/TheBibitesDigitalLife). Life Engine explicitly describes colored cells with functions, reproducing/competing/evolving organisms and world/organism controls. The Bibites describes gene-dependent appearances, neural brains and biological/energy processes. These primary references were read; no source code/assets were imported.

The relevant requirement is comprehensible organism behavior: distinguish bodies from food/environment, observe locomotion/intake/survival/offspring, select an organism and understand its traits and decisions. MATHOS also retains its mathematics, reproducibility, pixel basis, configurable-universe direction and local-first constraints. The old proof did not satisfy that experience. [Correction plan](observable-life-plan.md) and ADR 0008 define the new independently versioned model, not a retroactive claim that life-reference@1 already delivered it.

## Owner feedback: facing and organism movement

The owner observed that bodies moved but always faced horizontally. The approved correction makes orientation functional, rather than changing the arrow alone. The next body-evolution/competition/observability milestones are connected to it. The point remains recognizable artificial life with mathematics that explains the world. No lifetime-learning claim is introduced by fixed directional controller evaluation.
