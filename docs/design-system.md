# MATHOS visual and interaction system

Status: implementation-ready contract plus the first implemented slice. The default is a calm dashboard; World-only is one tap away, as explicitly chosen by the owner. Read current publication evidence in the preview manifest/PR, not a concept drawing. [Actual captures](previews/design/README.md).

## Identity and reference translation

MATHOS is a quiet instrument panel around a vivid, inspectable living grid. Surfaces organize decisions; geometry and selective color explain life. Soft interface containers frame square world cells. Use plain language for decisions and compact, precise values for observations. Avoid decorating every surface with terminal effects or turning the world into Material cards.

| Reference principle | MATHOS expression | Boundary |
| --- | --- | --- |
| Material 3 semantic color pairs | Named surface/text, primary/on-primary, outline, warning and error tokens | A small original palette; no Material framework or dynamic wallpaper colors required |
| Material 3 hierarchy and consistent states | Clear primary actions, visible focus, selected-state underline plus color, progressive disclosure | Native React/HTML controls; no claim to implement every M3 component or certification |
| Adaptive layout | One content/state model rearranged for phones and desktops | Project breakpoints follow working layouts, not copied platform dimensions |
| Cogmind map focus | Sparse dark grid, original geometric organ glyphs and contextual tools | No copied assets, fonts, sounds, sprites or combat mechanics |
| Cogmind informational effects | Short optional cues only for measured events | No ambient movement, fake feeding or unobserved intelligence |

Primary sources reviewed: [M3 color roles](https://m3.material.io/styles/color/roles), [M3 states](https://m3.material.io/foundations/interaction/states/overview), [M3 buttons](https://m3.material.io/components/buttons/overview), and Grid Sage Games' [Map Dynamics 2.0](https://www.gridsagegames.com/blog/2014/11/ui-feedback-map-dynamics-2-0/). These primary pages were read in a browser. Prior animation research and its exact limits remain in [visual-direction-cogmind.md](visual-direction-cogmind.md). This increment reviewed the article's map/context principles, not a new frame-by-frame animation study.

## Requirements, assumptions and open choices

**Owner requirements:** a unified original language drawing on M3 and Cogmind; simulation independent of interface; always reversible interface hiding with appropriate world controls; a calm dashboard by default; achievable incremental work with usable specifications. Existing local-first/no mandatory account or backend constraints remain.

**Implementation choices for this slice:** dark theme, existing organ colors, native controls, no new dependency, and a view-local World-only mode instead of browser fullscreen. These preserve the working project and avoid additional permissions. None changes scientific rules or exported world definitions. View-only preferences reset on reload for now.

**Choices still open:**

| Decision | Recommended next experiment | Alternative and tradeoff |
| --- | --- | --- |
| Information density | Comfortable control sizes; collapse infrequent rule groups | A compact desktop setting fits more data but increases scanning burden; never shrink touch targets |
| Map labels and effects | Selection-only labels; optional observation-driven cues | Always-on labels help comparison but obscure small bodies and become noisy at48 organisms |
| Palette customization | Curated accessible presets first | Arbitrary theme JSON needs contrast validation, role distinction and recovery from unreadable imports |
| Camera navigation | Add integer zoom, explicit pan tool and Fit after baseline review | Free gestures feel immediate but conflict with cell editing and need additional keyboard/touch behavior |

These are options to explore, not hidden commitments. No new research model, camera or automatic experimentation is authorized merely by this design document.

## Shared schema and ownership

`src/design/tokens.json` is the bundled `mathos-presentation@1` contract. It is machine-readable source, not yet an owner-importable theme format. `presentation.ts` maps interface roles to scoped CSS custom properties and exposes world presentation values. `organ-colors.ts` reads the same organ palette. `presentation.css` applies the language only to the canonical dashboard, preserving legacy layouts.

| Namespace | Consumers | Meaning |
| --- | --- | --- |
| interface | Shell, controls, messages, panels | canvas, surface, surfaceRaised, surfaceActive, text, muted, outline, divider, primary, onPrimary, secondary, warning, error |
| world | Read-only world renderer and anatomy diagrams | background, grid, food, bodyOutline, selection, cursor, organs |
| shape / space / motion | CSS presentation | control10px, panel16px,4px base/16px principal gap,120ms control feedback |

Do not merge presentation JSON into `mathos-world@1`. World configuration defines scientific inputs; presentation defines how those inputs and observations are shown. Changing a theme, panel, selection or view must not consume RNG, edit a session, reset learning, alter world geometry, increment ticks or change canonical report hashes. Playback and authored interventions remain explicit actions. Scientific modules must not import design or React modules.

```text
world configuration → TestSession → copied observations → renderer
                                   ↘ metrics / reports
presentation tokens → CSS / glyph colors / view controls
UI actions → existing validated session commands
```

## Visual specification

| Role | Value | Use |
| --- | --- | --- |
| Canvas / surface / raised | #080e13 / #101b22 / #172730 | Page, panels, controls; hierarchy through tone rather than heavy shadows |
| Text / muted | #e2edf0 / #a8bcc4 | Primary labels and secondary explanations; muted does not mean unreadable |
| Primary / on-primary | #83d8d2 / #092f30 | Run/Apply/Copy emphasis, with dark text on the filled action |
| Active / outline | #203e49 / #718b96 | Selected control fill; usable control boundaries |
| Secondary / warning / error | #c9b7ef / #ffca70 / #ffb4ab | Optional secondary emphasis, consequences/focus, failures; pair with words/icons |
| World roles | Lime core, amber mouth, teal motor, lavender sensor | Functional identity, reinforced by four original shapes |
| Selection / cursor | Cyan brackets / pale cursor | User attention; never an inherited trait or success score |

Current world colors/geometry are deliberately preserved. Future grid-density and overlay changes require their own view acceptance, not new world rules. A food mark denotes a resource patch; it must not resemble a moving organism. Family identity may later use a secondary outline or inspected annotation, never replace functional-role colors across the whole body.

Typography uses installed system sans-serif. Use16px body text,14px controls,13px secondary help,18–28px headings where space allows. JSON and numerical inspection may use installed monospace and tabular numbers. Avoid all-caps paragraphs, tiny dashboard copy and remote fonts. The implemented slice improves help/control text; older detailed analytics still need the planned component pass.

Use4/8/12/16/24/32px spacing increments. Controls remain at least44px high; preserve visible focus outlines. Panels use16px corners, controls10px, world cells0px. Avoid pills for every setting. Subtle120ms background transitions express control feedback; no panel motion is required. Reduced motion disables these transitions. State changes remain readable without animation.

Semantic foreground/background pairs are tested to at least4.5:1 for normal text and3:1 for control outlines on supported surfaces. This is token-pair evidence, not complete WCAG certification or a guarantee for arbitrary colors/opacity. Color is supplemented by glyph geometry, labels, selected-state indicators and textual status.

## Interaction and responsive contract

| Context | Layout and behavior | Persistent access |
| --- | --- | --- |
| Desktop, over1200 CSS px | Rules sidebar, independent world/results column; optional JSON third column | Playback, World-only toggle, explicit Apply/Prepare |
| Medium,901–1200 | Two columns; JSON below the world | Same actions; avoid shrinking the world to create another narrow panel |
| Compact,320–900 | World / Rules / Results destinations; JSON is optional in the editing view | One playback dock,44px targets and view-state preservation |
| World-only, all widths | Hide header, intro, Rules, Results, JSON and phone navigation; retain one canvas | Show dashboard, Run/Pause, Step, Reset confirmation, speed/status; enabled field tools and expandable Inspect & tool options |

World-only is an application view, not the browser Fullscreen API. It works without fullscreen permission and remains available on phones. The same canvas/session stays mounted. Enter moves keyboard focus to the canvas; Show dashboard or Escape exits and restores focus to the view button. Hidden drafts, invalid JSON, notes, tool choice, selection and scientific state remain intact. Entering/exiting does not pause or start playback. Browser-tab hiding still pauses as before. Escape restores the dashboard; browser fullscreen is a separate future enhancement.

Testing tools remain an explicit intervention switch. World-only never enables editing silently. When enabled, Select/Add food/Add organism/Erase remain beside the world; coordinate inputs, placement heading/body and inspection remain in an expandable contextual section. Arrows move the cursor; Enter/Space uses the active tool. No unlabeled gesture is the only route to an action. Selecting is safe; editing invokes the existing validated recorded commands.

Do not make hovering mandatory. Tool names remain visible on touch devices; destructive tools keep a distinct label and recorded result. Repeated paint/brush gestures, long-press menus and multi-touch camera controls are planned, not implemented. Avoid assigning Space to playback globally: it already activates the canvas tool. Never intercept typing in JSON or numeric fields for future shortcuts.

Configuration has three distinct states: active world, draft controls/JSON and proposed initial conditions. Apply changes live-safe rules at a recorded boundary; Prepare resets initial conditions and confirms loss of a progressed run. Invalid drafts do not change the world, hide away errors or export accidental unlimited rules. JSON visibility does not apply or discard it. Unlimited choices display explicit Off/no cap/until paused rather than an ambiguous0.

Reports stay accessible through Results in the dashboard; World-only is not a second reporting session. Failure status remains visible in playback and detailed feedback remains available. Tick updates must not flood live regions. Current same-world note/report behavior remains unchanged.

## Component guidance and boundaries

| Component/module | Inputs and ownership | Required states / next work |
| --- | --- | --- |
| WorldLab (existing orchestrator) | Owns TestSession, copied world, drafts, tool/view state | Preserve one session; do not create a second lab to implement layout |
| Presentation tokens + CSS (implemented) | Bundled visual roles; no scientific state | Canonical shell scoped, reduced motion, tested contrast pairs |
| World viewport (currently inside WorldLab) | Copied world, selection, cursor, appearance; emits coordinate actions | Same canvas in both views; later extract without altering lifecycle |
| World-only control (implemented inside WorldLab) | View state only | Reversible touch/keyboard entry, focus recovery, persistent playback/tools |
| PlaybackDock (planned extraction) | running/rate/status/tick + existing callbacks | Run/Pause/Step, complete/error/disabled; never own a second timer |
| RuleGroup / ConfigField (planned extraction) | Draft value, limits, validation, live/reset metadata | Label, help, errors, pending/applied distinction, group disclosure |
| ContextInspector (planned extraction) | Read-only selected observation + explicit editing actions | Missing/dead selection, role legend, compact world context |
| ResultsPanel (existing section; extraction planned) | Actual metrics/history, owner notes, report actions | Exact/failed ledger, bounded-history caveat, copy fallback, no fabricated trends |

Use native elements before new component libraries. Extract a component when it removes a real responsibility from WorldLab, not merely to create a file per visual box. Keep callback names tied to existing commands; callbacks do not get permission to mutate snapshots. The token file is the source for the first theme; CSS layout remains explicit rather than generated from a new UI-builder schema.

## World presentation and future effects

Draw actual parts and heading from scientific geometry in both Terminal and Classic styles. Evolution is visible as changed inherited cell layouts and their developed occupied cells; age/growth, learned weights and inherited mutation are distinct observations. A pulse alone cannot mean intelligence or evolutionary success. Preserve actual parent/offspring comparison and honest missing-parent handling.

A later observation overlay must declare: source fields, event test, sampling limitation, visual shape, duration, maximum cue count and reduced-motion substitute. Candidate cues reuse the earlier bounded180ms/96-cue precedent only after checking it against the shared world's observations. The canonical world currently does not implement those legacy animated cues. Never imply that skipped ticks provide exact movement paths or that a death record without a final pose permits a death-site burst. Pause freezes optional cues; no ambient random shimmer. World overlays must remain readable with the dashboard hidden and never become biological state.

## Bounded implementation plan

| Slice | Deliverable | Done criteria | Status |
| --- | --- | --- | --- |
| 1 — shared language and hiding | Token contract, scoped styling, World-only, contextual controls | Same canvas/hash after view round trip; retained invalid draft; actual playback and phone recovery work | Implemented in this increment; delivery evidence follows normal verification/publication |
| 2 — clearer configuration | Group Rules by Environment, Organisms, Inheritance, Run limits; extract reusable labeled fields | All current settings remain available; draft/live/reset/error states understandable; no schema/rule change | Planned |
| 3 — world reading | Selection summary and opt-in labels; evaluate zoom/pan interaction | Exact physical geometry; no fake events; keyboard/touch equivalent; deterministic reports unchanged | Planned; settle overlay/camera choices first |
| 4 — measured polish | Optional cues/accessibility presets and denser desktop layout if wanted | Readability under population load; reduced motion; no color-only meaning or fabricated adaptation | Planned |

Deliver one slice at a time with an explicit file boundary and observable acceptance. Do not combine anatomy expansion, physics changes and a dashboard redesign in a single task. Reuse npm run verify and CI for browser/mobile checks; no separate owner-managed matrix. Save actual captures from the automated workflow, label their state and distinguish them from mockups. Keep continuity in the existing single STATE record. This keeps work feasible within usage/context limits without assuming an account allowance or reducing verification.

## Verification for this design

The normal baseline includes semantic token contrasts, DOM view/draft preservation and real Chromium/Firefox workflows. Browser checks exercise paused world-only round-trip hash equality, unchanged canvas identity, focus/Escape recovery, running to a chosen endpoint while hidden, editing controls, phone touch restore and canvas/playback reachability. Existing scientific/legacy fixtures remain gates. The public smoke checks the clean source identity and deployed assets. No second browser-management workflow, synthetic user approval or claim of physical-device certification is introduced.
