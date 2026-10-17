# Cogmind-inspired life presentation

Owner request: research Cogmind's animations and colors and translate useful ideas to MATHOS's pixel-life view. Status: implemented in the local review build; the public preview has not been updated. This is a renderer change, not a new scientific engine version.

## Research reviewed

Primary sources from Grid Sage Games, accessed 2026-10-17:

- [Official media](https://www.gridsagegames.com/cogmind/media.html): map/screen presentation references.
- [UI Feedback: Map Dynamics 2.0](https://www.gridsagegames.com/blog/2014/11/ui-feedback-map-dynamics-2-0/): local feedback/labeling, selection framing and optional overlays. Downloaded and inspected sampled frame sequences from its robot-label and spotted-feedback GIFs, including their appearance and fade stages.
- [Making Particles](https://www.gridsagegames.com/blog/2014/04/making-particles/): consistent visual families and color semantics. Inspected eight samples across its 176-frame plasma GIF to understand timing, discrete cell effects and falloff.
- [ASCII Particle Effects](https://www.gridsagegames.com/blog/2014/03/particle-effects/): short procedural effects as readable information on a sparse grid.
- [Color Customization](https://www.gridsagegames.com/blog/2018/01/color-customization/) and [Accommodating Color Blindness](https://www.gridsagegames.com/blog/2014/04/accommodating-colorblindness/): adjustable presentation and redundant shape/style cues.

The browser text service could read the articles; source GIFs were downloaded with curl for frame inspection. No claim is made to have played Cogmind or reviewed every animation. Reference assets remain in a temporary research directory, outside project source. No assets, fonts, sounds, sprites or code from Cogmind ship with MATHOS.

## Translation to the life laboratory

| Observed design principle | MATHOS translation |
| --- | --- |
| Sparse, dark terminal map with selective bright information | Near-black green world, quiet food marks and a very faint four-site coordinate lattice |
| Recognizable glyph families | Original geometric core square, pointed mouth, barred motor and cross sensor; no font dependency for the organs |
| Stable color roles | Core lime, mouth amber, motor teal, sensor lavender; every role also has a different shape and text label |
| Focus stays on the map | Static selected-organism brackets and ID; short cues appear near the observed body |
| Effects have semantic roles | Travel leaves a brief mark at the prior observed anchor; turns use corner marks; feeding uses a plus; births use brackets; changed learning weights use a diamond |
| Customizable/bounded display | Terminal glyphs or Classic cells, optional activity animation, OS reduced-motion support and exact still presentation while paused |

The colors are MATHOS choices, not an extracted Cogmind palette: background#050907, grid#122018, food#65945a, core#a9df78, mouth#ffca70, motor#61d4c3, sensor#bfa3ed, selected#e6f4df. The surrounding dark dashboard retains its established inspection/setup accents. The terminal world's legend and anatomy colors follow the active style.

## Implementation and meaning

`ecology-terminal.ts` draws actual shared cellParts geometry on native Canvas. Body positions/rotations snap to their exact scientific state; there is no collision-affecting interpolation. New glyphs and silhouettes rotate with v2/v3 organs. Classic retains the preceding renderer, including the original v1 presentation limitations.

`observedActivity` compares bounded copied snapshots. It produces at most 96 cues; a renderer interval fades the latest batch over 180ms. No free-running ambient noise, randomized flicker or per-organism idle loop. Travel/turn cues require consecutive sampled ticks, so intermediate poses are not invented when faster playback skips publications. Intake and weight cues describe observed changes, possibly aggregated between samples. Birth cues require a matching newly born lineage record. A weight pulse requires an update count increase and actual nonzero last weight changes, so the frozen arm does not pretend to learn.

Cues are display overlays, not resource particles, new organs or additional behavior. They do not alter RNG, reward, learning weights, physical geometry, settings or metrics. There are no death explosions: current death records do not provide the exact final physical pose, so a particle burst there would be ambiguous.

Animation frames exist only while playback has real cues to show. Pause, toggling effects off, switching to Classic, reduced motion and component cleanup cancel the frame callback and redraw a still state. A live change to prefers-reduced-motion also disables the checkbox. Appearance is a view preference, excluded from exported scientific definitions and observation provenance.

## Verification and review

Six focused activity tests cover real observations, reset/initial behavior, skipped publications, frozen/no-change learning, births and the cue bound. Native Chromium/Firefox checks cover style changes preserving exported observations, exact Node lineage agreement, active cues, motion off, stable paused pixels, live reduced-motion changes,320/390px reflow and zero external requests. The complete `npm run verify` gate passed 149 tests/17 files, lint/types/build, all three independent Python reference checks, v1/v2/v3 goldens and every browser workflow. The expanded native geometry checks also passed in both browsers. Handoff links and actual OpenCode 1.19.2 parsing passed. This paragraph records the local verification. Subsequent source CI and live-preview evidence are in [STATE](handoff/STATE.md); no Bazzite-device test is claimed. A separate self-review checked sources, event semantics, renderer state isolation, RAF cleanup, motion preferences and actual captured frames; no second model review was used.

[Review captures and actual animation](previews/terminal/README.md). This is the first translated visual pass for owner review, not a claim to match every Cogmind effect. Arbitrary anatomy, death-site event logs, smooth physical interpolation, post-processing bloom and sound remain separate possible refinements; no extra runtime dependencies were introduced.
