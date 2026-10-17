# Mobile organization review

Actual production-build Chromium captures using a touch-enabled390x844 phone context. No mockups or invented simulation frames. The run starts from ecology-reference@3, seed42, learning on, selected organism1; actual capture tick and status are in capture-state.json. Timing-dependent playback determines this tick; it is not a scientific fixture.

- [World](phone-world.png): map and selected organism, shared playback and navigation.
- [Organism](phone-organism.png): selected body and measured learning.
- [Results](phone-results.png): comparison/history view, real cancelled comparison preserved.
- [Setup](phone-setup.png): starting settings, saving and advanced actions.
- [Desktop](desktop.png): the same paused session after desktop reflow.

Reproduce after npm run build with node scripts/browser-mobile.mjs. Both browsers also exercise320px,430px and landscape; only the390px Chromium profile is captured here. Screenshots do not establish physical-phone/Safari compatibility. See ../../mobile-ux-verification.md and ../../handoff/STATE.md for scope and completed evidence.
