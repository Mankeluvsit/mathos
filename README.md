# MATHOS browser preview

Deployment files only. Authoritative source: https://github.com/Mankeluvsit/mathos/tree/008fb03592952becd23ff5f816b05ecfb8a1ae69

This is the experimental integrated life baseline from PR #4, published for browser review without merging it into main. Source checks: 100 tests, build, independent Python fixtures, Chromium/Firefox workflows passed in Actions run 38832090319.

Enable GitHub Pages using **Deploy from a branch**, branch **gh-pages**, folder **/ (root)**. Expected address after enabling/building: https://mankeluvsit.github.io/mathos/

Open the site, choose Open life baseline, confirm, then Start life. No account, backend or external runtime API. Experiment saves stay in this browser/origin. Exports restart configurations; no checkpoints.

Build provenance and SHA-256 checksums are in preview.json. Rebuild from the pinned source using Node 24, npm ci, npm run build. Add .nojekyll, preserve relative asset URLs and publish the dist contents to this deployment branch. Never edit these compiled files as source. Future preview updates must identify and verify their source revision.
