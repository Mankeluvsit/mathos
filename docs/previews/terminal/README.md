# Terminal life visual review

Actual MATHOS captures from the production build. No Cogmind artwork or source GIF frames are included. The style is an original translation of the researched visual principles.

- [Recorded activity animation](activity.gif): native Chromium playback, seed42, ecology-reference@3, learning on,10ticks/s,3x magnification, following organism1. Four seconds were cropped from the real viewport recording and encoded at12fps. Capture ends at tick65; this is a visual example, not a performance benchmark.
- [Terminal world](terminal-world.png): paused tick20, full-world view.
- [Classic world](classic-world.png): exactly the same paused world and selected organism, different presentation.
- [Desktop dashboard](desktop.png).
- [Phone world](phone-world.png):390x844,3x view following the selected organism.
- [Phone organism](phone-organism.png).
- [Phone setup](phone-setup.png).

Both browsers also check320px layouts, style invariance, reduced motion, motion off, paused pixels and observation equality with the Node model. Capture metadata is in capture-state.json. Publication is authorized; consult ../../handoff/STATE.md for the exact deployed source and live verification.

Reproduce static/browser verification after `npm run build` with `node scripts/browser-terminal.mjs`. Optional `--capture-video` also needs system ffmpeg; normal tests and application use do not require it. Raw recordings stay in ignored .artifacts/. Reduced-motion preference suppresses the real activity cues and keeps the glyph presentation static. Birth/feeding/weight cues can aggregate observed changes between publications; they are not an exact event replay or new model physics.
