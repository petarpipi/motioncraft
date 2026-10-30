# MOTIONCRAFT V2.1 — verification report

Run on 26–27 October 2026 on Windows with installed Edge 156 and Node 24.22. Every result below was executed in this session. Nothing is extrapolated.

## Checks

| Check            | Command                                                                       | Result                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| TypeScript       | `pnpm typecheck`                                                              | Pass                                                                                                                  |
| Formatting       | `pnpm format:check`                                                           | Pass                                                                                                                  |
| Production build | `pnpm build`                                                                  | Pass, no warnings                                                                                                     |
| Unit / component | `pnpm test`                                                                   | **31 passed**, 7 files                                                                                                |
| Browser suite    | `pnpm test:e2e`                                                               | **39 passed / 0 failed / 1 skipped** (H2 is touch-only and skipped on desktop by design) (`docs/qa/e2e-results.json`) |
| Accessibility    | axe-core WCAG 2.0/2.1/2.2 A/AA, 3 routes × both motion modes × desktop/mobile | 0 violations                                                                                                          |
| Native touch     | `node scripts/check-touch.mjs`                                                | 6 / 6 (`docs/qa/touch.json`)                                                                                          |
| Production smoke | `node scripts/smoke-production.mjs`                                           | 4 / 4 routes, no console/runtime/HTTP errors                                                                          |
| Performance      | `pnpm performance`                                                            | `docs/qa/performance.json` — see `AUDIT_REPORT.md` §B4                                                                |
| Screenshots      | `pnpm screenshots`                                                            | 96 captures: 6 widths and frame sequences (`docs/screenshots`, `docs/qa/screenshot-manifest.json`)                    |

## Regression coverage for the audit findings

Each finding has its own check:

- **H1:** the sculpture renders frames with no input; the same instance is kept; pointer and Twist change its state.
- **H2:** a touch tap raises the impulse.
- **H3:** no visible text is smaller than 11 px.
- **H4 / M2:** the cinema is pinned on mobile, and its captions follow the timeline (unit test `sceneAt` + E2E).
- **H5:** no image is used more than twice per page.
- **M4:** hero text boxes don't intersect at 6 widths.
- **M5:** under OS reduced motion the toggle turns motion on, and the choice persists (unit test + E2E).
- **M6:** an aborted route chunk shows the recoverable error (unit test + E2E).
- **M7:** Open Graph and Twitter tags are present, the image returns 200, and the description changes per route.
- **L2:** gallery controls stay visible during the pinned travel.
- **L5:** the mobile menu traps focus and sets `inert`.
- **L6:** `mediaContext` removes its media listeners (unit test).

## Environment notes

- External processes kept the CPU at 100 % for long periods. Performance samples were repeated in a lower-load window, and an interleaved V2.0/V2.1 A/B was used for comparisons.
- In one full run, the Vite **dev** server lost its websocket under that load and reloaded the page mid-test. The trace shows `[vite] server connection lost`. This caused one H1 failure; the test passed 4/4 on repeat. The test now also asserts that the renderer instance stays the same.
- Mobile is touch emulation on desktop hardware. Real phones, Safari, Firefox, screen readers and Lighthouse were **not** tested.
