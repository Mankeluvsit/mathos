# Live configuration and controlled test field — proposal

Status: **design proposal, awaiting owner approval; not implemented**. The owner requested dashboard-accessible configuration through synchronized easy controls, editable JSON and JSON files, plus a test field controllable on the fly. They explicitly require reviewing an image before accepting implementation.

[Desktop/mobile concept](desktop-mobile-proposal.png) is an AI-generated design illustration based on the current dark MATHOS dashboard, not a capture of functioning software. The JSON shape, sliders, field tools and mobile navigation are illustrative; no new schema, rule version or editable sandbox is implemented by this image. Existing app remains unchanged.

## Proposed interaction

- Desktop: grouped quick controls, central editable test field and a synchronized JSON/file panel. Phone: field first, tool row, configuration sheet and persistent playback controls; include an explicit Apply action when implementing the phone layout.
- View and edit one validated configuration using either semantic controls or JSON. Open/save portable JSON files; show validation errors without replacing the active valid state. Applying changes is explicit; typing incomplete JSON does not mutate the world.
- Run/pause/one step/reset plus selection, food/organism placement, removal and selected-body rotation. Use a small controlled starting layout to inspect cause/effect before a full-world run. Exact tool bounds and energy transfers require a specification before code.
- Apply supported live edits at explicit recorded simulation steps. Clearly distinguish draft from active state. Seed or grid-size edits that require rebuilding should say so before resetting; do not pretend every setting can be changed in place. Preserve export/replay of exact applied changes.
- Undo refers to authored edits with defined bounds, not erasing arbitrary elapsed learning/evolution. Restart restores the declared test setup. Keep setup files distinct from any future complete checkpoint.

## After approval

First resolve the versioned JSON configuration and tick-addressed edit-command contract, including live versus restart-required fields, validation, edit order, resource accounting, bounded undo and reproducibility. Keep v1–4 definitions/engines/fixtures unchanged; any new scientific rules require a separate version. Then implement the dashboard controls and test field in small verified steps, with keyboard/touch workflows and desktop/phone checks. No mandatory server, account or external runtime dependency.

This priority supersedes starting the next diagnostic-trace tool while the owner reviews the dashboard. The completed evaluation report remains useful background, not approval of this proposed UI.
