# MATHOS observable-life browser preview

Live address: https://mankeluvsit.github.io/mathos/?v=foragers1

Source: https://github.com/Mankeluvsit/mathos/tree/4556456d5a8771bdb89ae61835e90dec6b7a99b5 . Source review PR #4 remains unmerged; this branch contains deployment artifacts, not editable source.

This revision responds to the owner's report that the prior experiment looked like pixels turning into mush. The first screen now shows separated organisms, discrete food, food-seeking movement, functional mouth/motor/body cells, energy-funded reproduction, inherited trait changes, death and individual inspection. It is not a complete implementation of Life Engine or The Bibites. Lifetime learning and advanced systems remain planned.

Use Start world. Select an organism or use the Organism view on a phone. Food is green; body/controller blue, mouth amber, motor purple. Magnification/follow are view controls only. Earlier references remain under Open technical reference labs. Everything runs locally in the browser; saves are origin-local and exports restart definitions, not checkpoints.

Source verification:110 tests, build, Python legacy fixtures, ecology golden regressions, Chromium/Firefox production workflows. Final Actions and public checks are recorded in PR #4. preview.json identifies this deployment's source and SHA-256 files. Previous hashed assets are retained temporarily for cached-HTML compatibility.

Reproduce with Node24, npm ci, npm run check, npm run test:browser at the source revision; publish dist plus .nojekyll and provenance on gh-pages. Never edit compiled JavaScript as source.
