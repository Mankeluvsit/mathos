# Contributing

Read `AGENTS.md` and the specifications first. Keep changes within the approved roadmap phase. Propose model changes with a decision record and observable acceptance criteria; do not present untested biological hypotheses as established behavior.

Use Node.js 24 and `npm ci`. Use `npm run dev` for development, `npm test` for a single test run, `npm run test:watch` for watch mode, and `npm run check` before opening a pull request. Commit `package-lock.json` when dependencies change. Dependencies are development/build inputs; application runtime must remain local.

For the optional real-browser smoke check, run `npx playwright install chromium` followed by `npm run test:browser`. On Linux CI images, browser installation may require `npx playwright install --with-deps chromium`. The script starts and stops its own local Vite server on port 4173. It checks keyboard entry, save/load, real file download/upload, native Canvas output, narrow-screen reflow, and absence of external runtime requests. It complements the DOM tests; it does not certify accessibility.

Branch from `main` and open a pull request with the problem, resulting behavior, relevant specifications, validation evidence, and limitations. Test behavioral boundaries, rather than mirroring implementation. Check keyboard access, zoom/reflow, narrow screens, storage failures, and exported file portability when relevant. Do not merge automatically.
