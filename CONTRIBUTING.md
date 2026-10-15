# Contributing

Read `AGENTS.md` and the specifications first. Keep changes within the approved roadmap phase. Propose model changes with a decision record and observable acceptance criteria; do not present untested biological hypotheses as established behavior.

Use Node.js 24 and `npm ci`. Use `npm run dev` for development, `npm test` for a single test run, `npm run test:watch` for watch mode, and `npm run check` before opening a pull request. Commit `package-lock.json` when dependencies change. Dependencies are development/build inputs; application runtime must remain local.

Branch from `main` and open a pull request with the problem, resulting behavior, relevant specifications, validation evidence, and limitations. Test behavioral boundaries, rather than mirroring implementation. Check keyboard access, zoom/reflow, narrow screens, storage failures, and exported file portability when relevant. Do not merge automatically.
