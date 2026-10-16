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
