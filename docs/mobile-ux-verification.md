# Phone playback and organization correction

Owner report: tapping Animate seemed ineffective, and the phone UI was scattered. The former Animate observed activity checkbox enabled brief cosmetic cues only while an already-running world changed. It did not start organisms. Comparisons/history also remained below the world on phones.

## Delivered behavior

- One persistent Start/Pause, One step and speed dock works in every phone view, with current state/step and a clear paused instruction.
- Four bottom destinations: World for the map, Organism for selected-body/learning inspection, Results for comparisons/history/events, Setup for starting settings and saving.
- The map comes before optional View controls and How to read the world. A compact selected-organism card opens inspection.
- Activity highlights names the cosmetic option and explains that Start world moves organisms. Off/reduced-motion/Classic can suppress highlights while explicit playback still advances the world. No automatic playback when toggling an effect.
- Setup separates Prepare new world, Save & transfer, confirmed restart and technical reference labs.
- Focus and scroll reset to the chosen view on phones; model/selection/comparison state remains mounted. Safe-area padding and scroll margins protect touch controls. Desktop retains the combined workspace.

No changes to engines, equations, learning parameters, schemas, resource accounting or storage. V1/v2 replay is preserved.

## Verification

The new scripts/browser-mobile.mjs uses touch-enabled Chromium/Firefox contexts. It checks initial390px map placement above playback, actual tap-driven progression and observed cues, real movement with highlights off, unchanged exported observations on toggling highlights, Node lineage replay agreement, persistent One step from Organism, separate/cancelled comparisons retained across navigation, and320/390/430px plus844x390 landscape layouts. Every destination checks44px reachable/uncovered playback buttons and no page overflow. Desktop reflow and zero external runtime requests are also checked.

The full gate includes this script in npm run test:browser. Existing terminal/legacy workflows now open the relevant disclosure explicitly and use the shared playback surface. One new DOM test covers the highlights-versus-playback contract. Full local npm run verify passed150 tests/17 files, lint/types/build, independent references, all goldens and all Chromium/Firefox workflows. Handoff checks, an additional lint pass and the actual pinned OpenCode parser also passed. Separate self-review inspected actual phone/desktop captures and cross-file contracts. See handoff/STATE.md for source/deployment/CI evidence. These are headless browser checks, not a physical phone or Safari certification.

[Actual phone/desktop captures](previews/mobile/README.md). Captures show a real paused run with an actual cancelled comparison; tick and device profile are in capture-state.json.

After deployment, `node scripts/browser-mobile.mjs --public` runs the same touch/organization/replay checks in Chromium against the existing GitHub Pages preview, writing captures only under ignored .artifacts/mobile-public. Normal verification still covers Chromium and Firefox locally; the public-only command does not claim Firefox certificate or physical-device verification.
