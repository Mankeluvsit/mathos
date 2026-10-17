# UX requirements

## Foundation controls (Phase 0 baseline retained)

- Lead with MATHOS, current phase, and a plain explanation of available behavior. Label the foundation canvas **Static pixel preview — configuration only**; the substrate lab has its own live field.
- Provide labeled name, random seed, width, height, and genesis controls. Explain primordial versus seeded without implying either engine exists.
- Keep changes in a draft; Save, Load, Import, and Export are explicit actions. No autosave overwriting existing or corrupt data. State that import/load replaces the unsaved draft; saves require an explicit action.
- Validate before save/export and after load/import. Associate errors with the editor and announce status through a polite live region. Failed operations leave the draft and stored valid configuration intact.
- State that local data belongs to the current browser/origin and can be cleared. Offer export even if localStorage is inaccessible. Import rejects oversized files before reading.
- Use semantic headings/forms/buttons, visible focus, logical tab order, keyboard operation, adequate contrast, and 44px minimum control heights. At 320px widths or 200% zoom, controls reflow without overlap. Color is never the only status indicator.
- Use system fonts and no decorative motion. Respect reduced motion if motion is introduced. Canvas has a text alternative reporting configured dimensions and its static status.
- Do not display Run, Train, Evolve, or fabricated metrics before those capabilities work.

## Planned laboratory

Provide a universe canvas, configuration panel, organism/field inspector, and experiment history. Pause, single-step, reset, speed, zoom, pan, and selections must have keyboard equivalents. Announce state changes without flooding assistive technology each tick. Users can inspect numerical values and summaries outside the canvas.

Clearly distinguish configuration changes for a future run from tick-addressed interventions in an active run. Warn before losing unsaved experiment results. Display seed, engine/rule versions, tick count, resource budgets, and experiment status. Separate user pause, completion, cancellation, and resource-limit termination. Autonomous experiments are explicit, local, bounded, cancellable, and do not rely on remote agents.

## Verification

Automated DOM tests cover accessible labels and configuration workflows. Manual browser checks cover keyboard navigation, focus, zoom/reflow, Canvas appearance, download/upload, and storage errors. Record checks performed; automated DOM tests alone do not establish browser compatibility or WCAG conformance.

## Implemented Phase 1 substrate laboratory

The central dashboard viewport hosts the lab. Open it explicitly, choose initializer/boundary/divisor, and prepare from the validated draft name/seed/dimensions. Genesis intent remains separate and clearly planned. Prepare starts paused, and no reduced-motion user receives an automatic run.

Start/Pause, Step, Reset and display rate are keyboard-operable native controls. Reset/replacement after progress pauses and opens an inline discard confirmation, focuses it, disables execution while pending, and restores the triggering focus after the choice. Cancel preserves progress and stays paused. Hidden tabs pause and require explicit resumption.

Show the active configuration, seed and engine/RNG/rule versions. Live Canvas uses a fixed palette; HTML metrics and x/y pixel inspection share a sampled tick, at most four updates per second while running. Pause/step/reset update immediately. Dynamic ticks do not enter a live announcement region. Completion at tick 10,000 and invariant errors are distinct from pause.

Save/load and JSON import/export use separate run-definition actions and explain restart-at-zero semantics. Draft edits never silently alter the active run. Browser checks cover production builds, keyboard entry and controls, focus in reset confirmation, 320px/200% CSS-zoom reflow, definition failures and storage fallback. Other assistive technologies and full accessibility certification remain unverified.

## Dark dashboard and responsive workspace

The owner-provided [product context](product-context.md) establishes the dark, colorized laboratory direction. Desktop uses model inputs, central field and contextual inspection; tablet widths reflow inspection below the field. Mobile uses Viewport / Setup / Inspect buttons with pressed state and preserved runtime state. Preparing explicitly focuses the new viewport. Desktop focus mode, mobile view changes and palette changes never reset the active run.

Use the documented neutral/blue surfaces with cyan/blue model accents, purple inspection, green exact totals and amber status. Fixed-scale Spectrum/Thermal/Grayscale palettes affect rendering only. Show the actual transport equation next to its measured field information; do not imitate concept charts with invented data. The previous light-theme image represented implementation progress, not an approved final visual design.

## Integrated experimental life lab

Open life baseline confirms leaving the reference substrate. A seeded 32×32 world starts paused, with working Start/Step/Reset. Life draft fields do not change the active definition. Reset/replacement pauses and uses native keyboard-operable discard confirmation; cancelling preserves the run. Save/load/import/export have separate life labels and a separate storage slot. Failed import/load preserves valid state; blocked storage keeps export available.

Desktop model/world/inspector panels reflow into mobile Viewport/Setup/Inspect with 44px controls. Canvas clicking is optional: coordinate inputs and organism ID provide a keyboard alternative. Exact field, organism, lineage, controller score and ecosystem accounting share the same sampled tick. Blue resource colors saturate above 2048 and are labeled; HTML values remain exact. A fixed controller is not labeled learning.

Comparisons live under Setup on phones, pause but do not overwrite interactive state, report progress/status, allow cancellation and export partial or completed endpoints. Hidden tabs pause interactive execution and cancel comparisons. No per-tick screen-reader announcements. Full screen-reader/Safari/physical-device conformance remains unverified.

## Observable life first experience

Open directly into the living world, paused, with a short explanation and consistent food/body/mouth/motor legend. Boundaries and directional marks identify bodies. Select through the Canvas or a labeled organism dropdown. Show actual behavior, energy, age, family and inherited traits before technical equations. Describe dead/absent selections honestly. Quantities must come from the same copied sampled tick.

Phone users receive World/Organism/Results/Setup, magnification and optional selected-organism camera follow. Scrolling/panning, selecting and magnification cannot change engine state. Desktop retains a world-first layout. Reset/replacement pauses and confirms discarded progress. Explicit save/load/import/export handles corrupt/oversized files and unavailable storage. Existing technical labs remain reachable with clear scope.

## Physical facing and visible evolution

Body outlines/cells/nose rotate together. A turn remains at the anchor; forward travel follows the nose. Mouth and sensor geometry must match the visible cells, including collision, Canvas click selection, magnification and follow. Text names the selected heading, body plan, forward distance and turn count. Slow playback makes individual actions inspectable.

Inherited plans and added sensor color have text equivalents. Show the selected family path, exact mutation before/after and children, plus real plan/population history and family intake/birth/death outcomes. All graph samples have an HTML table. State that initial plans are authored, children inherit/mutate them, and v1/v2 controllers stay fixed. Explicit model selector distinguishes the old fixed-facing replay from v2; changing it changes only draft settings until preparation.

Export observations downloads the current measured histories/family records with model provenance. Keep this separate from starting-setting export and label it as non-resumable.

On phones, starting playback from World focuses the world viewport; a single fixed playback dock above the four-destination navigation keeps Start/Pause, One step, speed and current step reachable in every view. Enabling camera follow focuses the world without changing simulation state.

## Connected learning inspection and comparisons (local v3)

Default local setup uses model3 with learning on. Show its active on/off status beside the model identity. The labeled Enable lifetime learning checkbox edits starting settings only; Prepare new world applies it after confirming discarded progress. V1/v2 remain selectable for replay. Children inherit traits but not learned weights.

In Organism, show the measured intent, actual action, reward breakdown and update count before optional detailed tables. Distinguish exploring from highest estimated value, blocked actions from intent, juvenile waiting from inactive failure, and terminal transitions from continuing ones. Explain that changed weights do not prove improved survival. Detailed inputs, four rows of weights and actual clipped changes use accessible tables and horizontal table scrolling, never page overflow.

The Results tab on phones provides an explicit twelve-world learning comparison, alongside population/family history and recent events, separate from the interactive world; desktop retains these panels together. Pause/preserve that world when starting; support cancel, hidden-tab cancellation and export of partial/completed results. Show every seed and signed on-minus-off differences only for completed pairs. Report extinction, update counts and device-dependent compute times in detailed results. No seed filtering or manufactured success message. Static captures and automated320/390px checks supplement numerical tests; full assistive-technology/device certification is not claimed.

## Terminal life appearance

The local default world appearance is Terminal glyphs; Classic cells preserves the prior map rendering. Appearance and Activity highlights are labeled, keyboard-operable controls inside View controls, below the world. Explain that highlights only decorate actual observed changes during playback and do not start or pause the organisms. Organ roles have distinct shapes as well as colors. The main legend and anatomy colors agree with the active presentation. Selection brackets/ID and heading glyphs reflect the actual shared geometry.

Brief travel/turn/feeding/birth/weight cues derive from observed transitions. Faster sampled playback may omit intermediate motion cues; the inspector remains authoritative for exact values. Pause produces a still exact world. Reduced motion, effects off and Classic disable the animation loop; the OS preference is respected even if changed while running. No per-frame live-region announcements or flashing full-screen effects. [Research and acceptance](visual-direction-cogmind.md).

## Mobile organization correction

The first phone screen prioritizes the world and selected-organism summary. Keep view preferences and the reading guide in separate disclosures below the map. Organism shows the selected body and learning; Results holds comparisons/history/events; Setup groups new-world settings, Save & transfer, restart and technical references. Do not scatter these panels through World or silently start playback when changing an effect.

Switching destinations preserves runtime, selection, comparisons and view preferences. Move focus to the destination heading and return to the top on phones. Prepare/restart retain explicit discard confirmation. Keep Start/Pause, One step and speed visible above a four-button bottom navigation, with44px touch targets, safe-area padding, scroll margins and no overlay-covered controls. Support320px phones,390/430px phones and landscape; reflow to the desktop workspace without losing state. Reduced motion disables cosmetic highlights while explicit playback can still advance the scientific world.

Native touch/browser checks are in scripts/browser-mobile.mjs. These verify actual progression with effects on/off, exported Node replay equality, navigation/state preservation, independent comparison cancellation, control reachability, viewport placement and zero external runtime requests. Headless checks do not establish physical-device or Safari certification.

## Inherited-body inspection

Model4 is the new verified default;1–3 remain explicit replay options. Learning and structural mutation settings edit drafts only. Show active mutation on/off beside model/learning, and label founder tags as origins, not current anatomy. Organism shows north-facing birth blueprint, developed versus waiting cells, actual role counts, upkeep/move costs and accepted/rejected birth proposal. A dead selection retains its last developed count and death status. World physical orientation continues to use the shared parts.

Setup’s optional body-change example loads a labeled starting draft only, with explicit Prepare/discard behavior. Results can inspect the latest actual accepted body change without advancing/resetting the world. The illustrative seed is disclosed separately from six-seed outcomes; it does not inject a successful mutation. Learning comparisons explicitly run model3 or4 as selected. Preserve all four phone destinations and single playback dock.

## Owner-run controlled testing

Living world and Test field are separate preserved/paused workspaces. Desktop quick controls, field and optional JSON; phone Field/Controls/Results plus one persistent playback dock. JSON is hidden by default, available from Field/Controls and can be hidden without losing draft text. Invalid text never mutates active state. Label reset-required fields and make Apply/Prepare distinct. Prepared test → Run/Step/Edit → notes → Copy test report is the owner workflow. Copy denial exposes selectable text; downloadable JSON is an alternative. Analytics show actual behavior and exact accounting, not a fabricated fitness verdict. Pointer tools have coordinate and keyboard alternatives. Keep the actual map above the dock on tested short phones.

## Independent desktop life columns

Living world and its results stack independently of the organism/setup sidebar. Expanding an inspector must not insert a blank grid row below the world. Retain the bounded desktop content width; zooming out naturally makes it visually smaller. On phones, the existing four destinations remain separate with preserved state. Native layout regression checks cover1024,1600 and6400 CSS-pixel widths plus phone navigation.

## Readable inherited-body differences

Living world model4 and Test field show read-only north-facing parent/offspring birth blueprints, explicit ordered-locus differences and a bounded recent accepted-change list. Growth, learning and inherited changes remain distinct; selection cannot alter scientific state. Missing parents and dead selections are handled explicitly. Family map accents, lineage trees and new effects remain planned. [Visual contract and verification](evolution-visuals.md); actual delivery status is in handoff/STATE.md.

## Unified presentation language

[Design system and staged component plan](design-system.md) defines a calm dashboard by default, shared semantic tokens and a reversible World-only view retaining playback and contextual tools. The first token/style/view slice is implemented; further control grouping, camera navigation and observation overlays remain planned. Presentation remains outside mathos-world configuration/RNG/state/report hashes. Browser/mobile assertions stay in the automatic baseline.
