# UX requirements

## Phase 0

- Lead with MATHOS, current phase, and a plain explanation of available behavior. Label the canvas **Static pixel preview — simulation not implemented**.
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
