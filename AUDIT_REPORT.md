# MOTIONCRAFT V2 → V2.1 — Audit, Repair & Creative Upgrade Report

Scope: `04-motioncraft` only. Auditor and implementer: Claude.

- **Part B** (this first part) records the repair and upgrade to V2.1, the new measurements and the final review.
- **Part A** (further down) is the original independent audit of V2.0 (`e9c19ca`), kept unchanged as the baseline.

Backups:

- local tag `motioncraft-v2-before-claude-upgrade` → `e9c19ca`
- archive `04-motioncraft-pre-upgrade-e9c19ca-20261026.tgz` (local backup)

Nothing was pushed or deployed. No other project was modified.

---

# PART B — Repairs, creative upgrade and final review (V2.1)

## B0. Verdict

V2.1 replaces the generic parts of V2.0 with an authored identity built around one element: **the slat**.

- **3D:** a custom instanced WebGL sculpture made of 26–40 chrome slats. One draw call; every pose is computed in a custom GLSL vertex shader.
- **Carry:** the same sculpture is carried from the hero through a pinned three-scene cinema on desktop **and** mobile.
- **Signature motion:** the same slats drive the route transitions, scene changes, sliced typography and calls to action.
- **Type:** variable-font axes (Archivo `wdth`/`wght`) are animated as real typographic motion. Instrument Serif replaces the Georgia system italic.

All 6 HIGH, 9 MEDIUM and 10 LOW findings were addressed. Each repair was verified by a test, a measurement or both (§B2).

**Final score: 8.4 / 10 overall (§B5).** The upgrade is a large, evidenced improvement, but the 9/10 target is **not** claimed:

- real-device mobile GPU testing, Lighthouse and screen-reader sessions were not possible here;
- several visual details still need refinement (§B6).

## B1. What changed

### New advanced animation effects

| Effect                                             | Technique                                                                                                                                                                                                                                                                 | Where                                    |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Slat sculpture: coiled column → fan → louvred iris | Instanced `RoundedBoxGeometry`; per-instance pose in a GLSL vertex shader with a staggered cascade (`smoothstep` lag per slat); analytic studio fragment shader (sky, two softboxes, strip light, floor bounce, alternating graphite/polished slats, travelling acid rim) | `src/v2/sculpture/`                      |
| Idle life                                          | Continuous breathing/twist; half frame rate after 5 s without input                                                                                                                                                                                                       | engine loop                              |
| Pointer / touch / scroll response                  | Group tilt plus local twist near the pointer; pointer speed, taps and scroll velocity send a damped travelling wave through the slats; **Twist form** applies an elastic spin                                                                                             | engine + `Hero.tsx`                      |
| Assembly intro                                     | Slats shuffle in from alternating sides, bottom first (`uAssemble`)                                                                                                                                                                                                       | hero                                     |
| Hero → cinema carry                                | One fixed canvas; the hero form travels to centre stage on scroll                                                                                                                                                                                                         | `SculptureStage.tsx`, `ScrollCinema.tsx` |
| Variable-font kinetic type                         | GSAP tweens `font-stretch` 62 % → 125 % while characters rise from slat masks                                                                                                                                                                                             | hero, TRANSFORMATION scene               |
| Sliced typography                                  | FORM is cut into six slats that interlace in opposite directions                                                                                                                                                                                                          | FORM scene                               |
| Slat shutters                                      | Ten acid row slats close from the centre; twelve graphite column slats sweep in                                                                                                                                                                                           | cinema scene changes                     |
| Image masking                                      | A circular mask opens inside the iris ring onto a macro render of the sculpture, with a counter-scaled image                                                                                                                                                              | REVEAL scene                             |
| 3D character flip                                  | FEEL characters flip in on `rotationX` with perspective                                                                                                                                                                                                                   | REVEAL scene                             |
| Signature route curtain                            | Nine slats retract from the centre while the page word lifts                                                                                                                                                                                                              | `App.tsx`                                |
| Magnetic field                                     | 91 field slats rotate and stretch toward a spring-driven core                                                                                                                                                                                                             | Experiences 01                           |
| Variable type field                                | Width mode drives the `wdth` and `wght` axes per letter through `quickTo` on CSS variables                                                                                                                                                                                | Experiences 03                           |
| CTA slat fill                                      | Seven slats rise behind the call to action on hover/focus (CSS)                                                                                                                                                                                                           | closing CTA                              |

### Practical demonstrations

Each study in `/experiences` now has a structured “Behind the motion” panel covering:

- what it does
- technology
- how to trigger it
- optimisation
- mobile behaviour
- client use case

The studies are: magnetic spring field, GLSL liquid surface, variable-font type field and CSS 3D depth gallery. Home also gets a “Built for real briefs” index linking to them. The generic “Don’t just look. Play.” and “Less watching. More feeling.” sections were removed.

## B2. Status of every finding

| ID  | Finding                                 | Status                   | Fix                                                                                                                                         | Verification                                                                                                                                                                                                           |
| --- | --------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H1  | Stock torus knot, static at rest        | **Fixed**                | Authored instanced slat sculpture with custom shaders; continuous idle motion                                                               | E2E “H1”: frames keep rising with no input (>15 frames in 1.5 s); pointer moves `data-pointer`; Twist changes `data-spin`                                                                                              |
| H2  | No touch interaction                    | **Fixed**                | `touch-action: pan-y` on the hero; taps pluck the slats; horizontal drag steers them; scroll velocity drives the wave                       | E2E “H2” (tap raises `data-impulse`); `scripts/check-touch.mjs` native CDP drag ✔                                                                                                                                      |
| H3  | 5–9 px typography                       | **Fixed**                | 11 px floor for labels, 13–15 px controls, 44–48 px targets                                                                                 | E2E “H3”: zero visible text nodes under 11 px on 3 routes × 2 devices                                                                                                                                                  |
| H4  | No scroll storytelling on mobile        | **Fixed**                | Same pinned cinema on phones (3.4 vh), portrait layouts, low tier                                                                           | E2E “H4”: the cinema is pinned on mobile and all three scenes and captions appear                                                                                                                                      |
| H5  | Same knot reused 5+ times               | **Fixed**                | Four distinct sculpture poses, a liquid still and a field SVG; old knot stills deleted                                                      | E2E “H5”: no image is used more than twice per page                                                                                                                                                                    |
| H6  | ~0.8 s startup blocking                 | **Improved**             | No PMREM / physical material; `compileAsync`; init on `requestIdleCallback`; analytic shader                                                | Desktop TBT 284 ms (performance script) and 153–212 ms (A/B rounds 1–2), against the 796 ms measured in Part A under load. In the same-load A/B the old build measured 134–163 ms, so treat this as parity, not a gain |
| M1  | Cinema scroll jank                      | **Fixed**                | Clip-path masks and scaled SVG removed from scroll; transforms only                                                                         | Same-load A/B desktop scroll p95: 50–84 ms → 17–33 ms; frames over 50 ms: 20–36 → 0–2                                                                                                                                  |
| M2  | Captions out of sync                    | **Fixed**                | Scene derived from timeline time (`sceneAt`) in the timeline's own `onUpdate`                                                               | Unit test + E2E caption checks at three scroll depths                                                                                                                                                                  |
| M3  | Georgia italic + blend artefacts        | **Fixed**                | Self-hosted Instrument Serif (OFL); `mix-blend-mode` removed from the reveal                                                                | Visual QA                                                                                                                                                                                                              |
| M4  | Caption/object collisions               | **Fixed**                | Hero caption moved into the meta row; per-breakpoint sculpture placement; portrait stacking                                                 | E2E “M4”: no hero text boxes intersect at 6 widths                                                                                                                                                                     |
| M5  | Motion toggle no-op under OS reduce     | **Fixed**                | `auto` / `on` / `off` preference resolved before paint; explicit opt-in; accessible name states “(system setting)”                          | Unit test + E2E: OS reduce → click → WebGL mounts; persists across reload                                                                                                                                              |
| M6  | No error boundary                       | **Fixed**                | Route boundary with reload; scene boundaries with stills                                                                                    | Unit test + E2E: aborted Experiences chunk shows the recoverable error and the header still works                                                                                                                      |
| M7  | No social metadata                      | **Fixed**                | OG/Twitter tags, 1200×630 image, canonical, per-route description, `robots.txt`; `SITE_URL` adds absolute URLs and `sitemap.xml`            | E2E “M7” (tags present, image returns 200)                                                                                                                                                                             |
| M8  | 391 kB main chunk                       | **Fixed**                | `react` / `gsap` vendor groups; Inter removed; physical material, RoomEnvironment and the old ChromeScene removed                           | App chunk **37.5 kB** (12.1 kB gz); vendors cacheable; three.js 522 kB (was 537 kB), loaded after first paint; no chunk advisory                                                                                       |
| M9  | CTA ends in a simulated form            | **Partly**               | `src/config.ts` routes every CTA to an Upwork URL or email when filled                                                                      | Needs **your** Upwork URL or email; until then it opens the honest demo form                                                                                                                                           |
| L1  | Global `scroll-behavior: smooth`        | Fixed                    | Removed                                                                                                                                     | —                                                                                                                                                                                                                      |
| L2  | Gallery controls hidden during pin      | Fixed                    | Controls inside the pinned frame; panel-snapping navigation                                                                                 | E2E: Next is in the viewport during travel                                                                                                                                                                             |
| L3  | Focusable div without role              | Fixed                    | `role="region"` + label                                                                                                                     | axe clean                                                                                                                                                                                                              |
| L4  | Replay didn't replay 3D                 | Fixed                    | Replay re-runs `assemble`                                                                                                                   | E2E replay status                                                                                                                                                                                                      |
| L5  | Menu without focus trap                 | Fixed                    | Focus trap, `inert` outside, global Escape                                                                                                  | E2E mobile: Tab stays in the menu; `inert` set and removed                                                                                                                                                             |
| L6  | Listener growth on navigation           | Fixed (root cause found) | `gsap.matchMedia().revert()` leaves MediaQueryList listeners (`gsap-core.js` 4073–4106); replaced with `mediaContext()`, which removes them | Unit test; probe: listeners flat at 227 over 10 round trips (was +4 per trip). Heap still rises ~0.1 MB per trip and flattens — likely caches, not proven a leak                                                       |
| L7  | Missing 600 weight                      | Fixed                    | Variable Archivo covers 100–900                                                                                                             | —                                                                                                                                                                                                                      |
| L8  | 3,400-line CSS, duplicated reduce rules | Fixed                    | `src/styles/` split into 5 files (36 kB built, was 48 kB); single reduced-motion source via `html[data-motion]`                             | —                                                                                                                                                                                                                      |
| L9  | Elastic study is a lone disc            | Fixed                    | Magnetic field of 91 slats                                                                                                                  | Visual QA + E2E (>20 distinct filing transforms)                                                                                                                                                                       |
| L10 | QA clutter at root                      | Fixed                    | Docs and evidence in `docs/`; outdated V1/V2.0 screenshots and QA JSON removed (preserved in the tag and the archive)                       | —                                                                                                                                                                                                                      |

## B3. Testing (all executed in this session)

| Check                                                       | Result                                                                                   |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| TypeScript `tsc --noEmit`                                   | Pass                                                                                     |
| Prettier `--check`                                          | Pass                                                                                     |
| Production build                                            | Pass, no warnings                                                                        |
| Unit / component (Vitest)                                   | **31 passed / 0 failed** (7 files)                                                       |
| E2E (Playwright, Edge 156, desktop 1440 + mobile 390 touch) | **39 passed / 0 failed / 1 skipped** (H2 is touch-only and skipped on desktop by design) |
| axe-core WCAG 2.0/2.1/2.2 A/AA, both motion modes           | 0 violations (in E2E)                                                                    |
| Native touch checks                                         | **6 / 6 passed** (`docs/qa/touch.json`)                                                  |
| Production smoke (4 routes incl. 404)                       | **4 / 4**, no console/HTTP errors (`docs/qa/production-smoke.json`)                      |
| Runtime errors / warnings across routes                     | 0 (E2E)                                                                                  |

During the work, the first E2E run found 3 failures:

- an axe `label-content-name-mismatch` on the motion toggle — a real accessibility defect, fixed;
- a wrong pin-count expectation for mobile — the test was corrected, since phones intentionally scroll the exhibition natively;
- an axe test timeout — the timeout was raised.

## B4. Measurements

Machine and conditions:

- Windows, Intel UHD integrated GPU, headless Edge 156.
- External processes (other AI agents) kept the CPU at **100 %** for long periods, so early samples were discarded.
- The final samples were taken when load fell to ~25–40 %.

**Production build, `scripts/performance.mjs`** (`docs/qa/performance.json`):

| Profile                                  | FCP/LCP | TBT     | First WebGL frame | CLS   | Cinema scroll p95 | Frames > 50 ms |
| ---------------------------------------- | ------- | ------- | ----------------- | ----- | ----------------- | -------------- |
| Desktop 1440, unthrottled                | 520 ms  | 284 ms  | 816 ms            | 0.031 | **17.0 ms**       | 0              |
| Desktop, CPU 4× + 1.6 Mbps               | 2272 ms | 1278 ms | 4152 ms           | 0.036 | 33.3 ms           | 1              |
| Mobile 390, CPU 4× (load rising to 96 %) | 1056 ms | 1014 ms | 1899 ms           | 0.006 | 33.9 ms           | 12             |

**Interleaved A/B, same load window (rounds 1–2), V2.0 → V2.1:**

| Metric            | Desktop                 | Mobile CPU 4×                                                          |
| ----------------- | ----------------------- | ---------------------------------------------------------------------- |
| Cinema scroll p95 | 50–84 ms → **17–33 ms** | 16.8 ms (V2.0 had no pinned cinema on phones) → 17–33 ms               |
| Frames over 50 ms | 20–36 → **0–2**         | —                                                                      |
| TBT               | 134–163 ms → 153–212 ms | 895–1167 ms → 1151–1381 ms (V2.1 adds WebGL + pinned cinema on phones) |

Idle: the sculpture renders at ~30 frames/s after 5 s without input and stops completely when off-screen or in a hidden tab.

These are lab observations on one machine. **No 60 FPS claim is made.** Lighthouse was not run (not installed). Real phone GPUs were not tested.

## B5. Final scores (evidence-based)

| #   | Area                       | V2.0 | V2.1    | Why                                                                                                                                                                                           |
| --- | -------------------------- | ---- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Visual Design              | 6.5  | **8.5** | Coherent slat identity; confident type pairing (wide variable grotesk + Instrument italic); readable scale; distinct colour per scene. Ring interior still reads a little flat                |
| 2   | Creative Originality       | 5    | **8**   | An authored sculpture and a signature system instead of a stock primitive. The dark + acid palette is still a familiar genre                                                                  |
| 3   | Hero Experience            | 6    | **8.5** | Alive at rest, responds to pointer, touch and scroll, choreographed intro, type over form                                                                                                     |
| 4   | Animation Quality          | 6    | **8.5** | Cascaded GPU morphs, variable-axis type, shutters, masking, carry; smooth desktop scroll measured                                                                                             |
| 5   | Scroll Storytelling        | 5.5  | **8.5** | One object across three distinct compositions, on desktop and phones, captions in sync                                                                                                        |
| 6   | Interactive 3D             | 4.5  | **8**   | Custom instanced shader, three poses, input-driven waves, tiers, disposal. No post-processing or shadows                                                                                      |
| 7   | Responsive Design          | 6    | **8**   | No overflow at 6 widths; portrait-specific compositions; no hero collisions (tested at 6 widths); 1920 reveal re-balanced. Tablet landscape between 1024 and 1100 px is the least tuned width |
| 8   | Performance                | 6    | **8**   | Desktop scroll p95 17 ms, TBT 284 ms, small app chunk. Mobile 4× TBT ≈ 1 s; three.js remains ~130 kB gz                                                                                       |
| 9   | Accessibility              | 6.5  | **8.5** | axe clean in both modes, 11 px floor, label-in-name, trapped menu, full reduced-motion path, explicit opt-in. No screen-reader session                                                        |
| 10  | Technical Quality          | 7.5  | **8.5** | Typed, modular CSS, error boundaries, a GSAP listener leak found and fixed, 31 unit + E2E regression tests                                                                                    |
| 11  | Upwork Portfolio Readiness | 5.5  | **8.5** | Shows advanced GSAP + WebGL + type craft with practical, documented studies. Needs a real contact link and a short screen recording                                                           |

**Overall ≈ 8.4 / 10.** 9/10 is not claimed without the items in §B6.

## B6. Not verified / remaining

1. **Real devices:** iOS Safari, Android Chrome, Firefox and Safari desktop were not tested. Mobile results come from touch emulation on desktop hardware.
2. **Lighthouse and screen readers:** Lighthouse and NVDA/VoiceOver sessions were not run.
3. **Contact link:** `src/config.ts` needs your Upwork profile URL or a public email (M9).
4. **Deployment settings:** set `SITE_URL` when deploying so Open Graph URLs are absolute; static hosts need an SPA fallback.
5. **Visual refinements for a 9:**
   - richer ring interior lighting in the REVEAL scene;
   - optional subtle bloom on the acid rim;
   - a 20–30 s screen recording for the Upwork listing.
6. **Performance headroom:** about 1 s TBT on 4×-throttled mobile is dominated by three.js evaluation; a lighter custom WebGL path would be the next optimisation.

## B7. Prioritised next steps

1. Fill in `src/config.ts`, deploy a preview with `SITE_URL`, and test on one real iPhone and one real Android phone.
2. Record the hero → cinema sequence as a short video for Upwork.
3. Polish the REVEAL ring interior lighting.

---

# PART A — Original independent audit of V2.0 (baseline, unchanged)

## 0. Executive verdict

MotionCraft V2 is a **genuine, technically honest step up from V1**: the WebGL is real, GSAP is used correctly (contexts, matchMedia, scrubbed pinned timelines, containerAnimation, quickTo), resource cleanup is unusually disciplined, and reduced-motion support is better than most agency sites. The desktop scroll sequence and the three horizontal posters are the strongest moments.

It is **not yet an Awwwards-caliber piece**, and it does not yet clearly out-perform the hundreds of "giant grotesk + chrome torus knot + acid lime" portfolios a GSAP client will have already seen. The main problems are creative, not technical:

1. The hero's "interactive 3D sculpture" is a **stock `TorusKnotGeometry` with a stock physical material**, it is **frozen whenever the pointer is still**, and it is **not touch-interactive** on phones.
2. The **same knot image is reused 5+ times** across the site, which reads as a lack of visual range.
3. **Typography micro-labels are 5–9 px** throughout, which looks refined in a screenshot but is unreadable in practice and undermines the premium feel.
4. On **mobile the scroll storytelling is switched off** and replaced by a static stack — the device most Upwork clients will first open the link on gets the weakest version.

**Portfolio readiness: usable with caveats now; needs one focused creative pass (Phase 1 + Phase 3 below) before it can be the lead "advanced animation" piece.**

---

## 1. Method and evidence

| Check                                         | Tooling                                                                                                                                   | Result                                                                                                                                      |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript                                    | `tsc --noEmit` (TS 7.0.2)                                                                                                                 | **Pass**, 0 errors                                                                                                                          |
| Production build                              | `vite build` → isolated scratch `outDir`                                                                                                  | **Pass**; Vite >500 kB chunk advisory for `three.module` (536.7 kB raw / 132 kB gzip)                                                       |
| Unit / component                              | `vitest run`                                                                                                                              | **17 passed / 0 failed / 0 skipped** (3 files)                                                                                              |
| E2E                                           | `playwright test --reporter=list --output <scratch>` (Edge 156, desktop 1440×1000 + mobile 390×844 touch)                                 | **28 passed / 0 failed / 0 skipped** (2.8 min)                                                                                              |
| Accessibility scan                            | axe-core inside the E2E suite (WCAG 2.0/2.1 A/AA)                                                                                         | **0 violations** on 3 routes × 2 projects                                                                                                   |
| Console / HTTP                                | E2E + my own capture script                                                                                                               | **0** page errors, console errors or 4xx/5xx                                                                                                |
| Visual sweep                                  | Own Playwright script: 375, 390, 768, 1024, 1440, 1920 px × 3 routes × 6–9 scroll positions                                               | 178 screenshots, frame sequences for hero intro, replay, scroll cinema (13 frames), horizontal gallery (9 frames), route curtain (6 frames) |
| Runtime measurement                           | CDP: long tasks, LCP, CLS, rAF frame deltas during wheel scroll, heap/listener series over 8 route round-trips, CPU 4× + slow-4G throttle | See §6                                                                                                                                      |
| Lighthouse                                    | **Not run** — not installed in the project; installing it was out of scope for a no-new-dependency audit                                  |
| Real devices, Safari, Firefox, screen readers | **Not tested** — environment limitation                                                                                                   |

Environment: Windows 11, Intel UHD Graphics (ANGLE/D3D11), Node 24.21 (Codex runtime; Node/git are not on PATH). Git state was read from `.git` refs directly because no `git` binary is installed.

Artifacts generated by this audit were kept **outside the project** in the session scratchpad (`dist-audit/`, `shots/`, `pw-output/`, `e2e.log`, `audit.mjs`). The E2E run was given `--reporter=list --output <scratch>` so `qa/e2e-results.json`, `playwright-report/` and `test-results/` were **not overwritten** (verified by timestamps). A local `vite preview` on port 4199 served the isolated build.

---

## 2. Project inspection (Phase 1)

**Architecture.** React 19 + TypeScript + Vite 8 + React Router 7, single `BrowserRouter`. `App.tsx` holds header/footer and `RouteFrame` (curtain transition, focus management, scroll restoration). Routes: `/` (eager), `/experiences` and `/studio` (lazy), `*` 404.

**Components (`src/v2/`)**: `Hero`, `ChromeScene` (Three.js), `ScrollCinema`, `HorizontalShowcase`, `Experiences`, `ElasticStudy`, `FluidCanvas` (Three.js shader), `TypeDisplacement`, `DepthGallery`, `Studio`, `DeferredScene`, `Art` (generated SVG), `physics.ts`. Shared: `motion.tsx` (reduced/paused context), `ContactForm.tsx`, `contact.ts`.

**Animation libraries**: GSAP 3.14 + ScrollTrigger; Three.js 0.186. No Lenis/smooth-scroll, no R3F, no postprocessing.

**Verified GSAP inventory**

| Location                       | What                                                                                            | Verified               |
| ------------------------------ | ----------------------------------------------------------------------------------------------- | ---------------------- |
| `App.tsx:21-43`                | Route curtain timeline (clip-path + per-char stagger) in `gsap.context`                         | Yes, frames captured   |
| `Hero.tsx:16-28`               | Intro timeline: per-char yPercent/rotationX/rotationZ/scaleY, rule scaleX, instrument y         | Yes                    |
| `ScrollCinema.tsx:33-110`      | `matchMedia(min-width:768)` → 1 pinned scrubbed timeline (2.8 vh), 8 tweens, drives WebGL phase | Yes, 13-frame sequence |
| `HorizontalShowcase.tsx:15-50` | Pinned horizontal track + 3 `containerAnimation` parallax triggers                              | Yes, 9-frame sequence  |
| `TypeDisplacement.tsx:14-61`   | 32 `quickTo` setters + elastic replay                                                           | Yes                    |
| `DepthGallery.tsx:15-27`       | 2 `quickTo` tilt setters                                                                        | Yes                    |

ScrollTrigger instances on Home (desktop): 2 pins + 3 nested parallax triggers. Pin spacers: 2 at rest, **0 after leaving the route** (cleanup verified).

**WebGL inventory**: `ChromeScene` (TorusKnot 320×48 seg desktop / 180×24 mobile, `MeshPhysicalMaterial` metalness 1 + clearcoat, `RoomEnvironment` via PMREM, 2 directional lights, ACES tone mapping, DPR ≤1.5/≤1) and `FluidCanvas` (full-screen quad, custom fragment shader: value-noise FBM + domain warp + ripple, DPR ≤1.25/≤0.8). Both render **on demand** and stop when settled, off-screen or tab-hidden.

**Assets**: two 18–20 kB WebP stills of the same knot, one 77 kB generated SVG field, self-hosted Space Grotesk (400/500/700) + Inter (400/500). No HDRs, models, video.

**Tests**: 3 Vitest files (17 tests), 1 Playwright spec (14 tests × 2 projects). Tests are meaningful (frame counters, pixel diffs, pin-spacer cleanup), not superficial.

**README claims vs reality**: every technical claim I checked is accurate. The README is notably honest (it states the shader is not a fluid solver and the depth gallery is CSS 3D). What the README does **not** say is that the hero is static between inputs and not touch-interactive.

---

## 3. Scores (Phase 11)

| #   | Area                       | Score        | Why                                                                                                                                                                                                                                                                                             |
| --- | -------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Visual Design              | **6.5 / 10** | Confident scale, strong poster panels, consistent dark/acid palette. Undermined by 5–9 px micro-type everywhere, a system-font (Georgia) italic as the second display face, caption/object collisions at 390–1024 px, and the same knot image repeated.                                         |
| 2   | Creative Originality       | **5 / 10**   | Giant grotesk + chrome torus knot + acid lime + contour lines is a recognisable 2023–25 trend vocabulary. No proprietary visual idea, no custom 3D form, no signature interaction. The afterimage poster is the most original moment.                                                           |
| 3   | Hero Experience            | **6 / 10**   | Strong typographic composition and a nice char reveal. But the 3D object is a stock primitive, frozen at rest (frame counter stops at 90 frames, ~1.5 s after load), responds only to mouse tilt, and does nothing on touch.                                                                    |
| 4   | Animation Quality          | **6 / 10**   | Choreography is competent and correctly built; easing is varied and appropriate. Few moments feel _authored_: no idle life, no inertia on scroll, no transitions between scenes that carry an object across. Measurable scroll jank in the pinned scene.                                        |
| 5   | Scroll Storytelling        | **5.5 / 10** | Desktop FORM → TRANSFORMATION → REVEAL is genuinely good (7/10 on its own). Mobile receives no scroll animation at all (3/10). Caption state is out of sync with the visual scene.                                                                                                              |
| 6   | Interactive 3D             | **4.5 / 10** | Real WebGL with good lifecycle, but one stock geometry, stock material, pointer-tilt only, no custom shader on the hero, no post-processing, no idle motion, no touch. The fluid shader is the more interesting WebGL piece and it is hidden on the second page.                                |
| 7   | Responsive Design          | **6 / 10**   | No horizontal overflow at any width (verified). But 5–7 px labels on phones, the "FORM 001" caption box covering the knot at 390 px and overlapping "STATIC" at 768/1024 px, and a deliberately reduced mobile story.                                                                           |
| 8   | Performance                | **6 / 10**   | Excellent hygiene (on-demand rendering, DPR caps, deferred scenes, visibility/IO pausing, full disposal). But ~0.8 s total blocking time at startup unthrottled (1.15 s at 4× CPU), a 391 kB main chunk, and p95 frame time ≈50 ms while scrolling the pinned scene on an integrated GPU.       |
| 9   | Accessibility              | **6.5 / 10** | Best-in-class reduced-motion handling, keyboard alternatives for every playground, live regions, skip link, focus on route change, axe-clean. Loses points for pervasive 5–9 px text, a motion toggle that silently does nothing under OS reduced motion, and no focus trap in the mobile menu. |
| 10  | Technical Quality          | **7.5 / 10** | Clean, typed, well-scoped effects; GSAP contexts and Three.js disposal are correct; meaningful tests. No error boundary around lazy routes/WebGL, a 3,400-line monolithic stylesheet with duplicated reduced-motion blocks, minor listener growth across navigations.                           |
| 11  | Upwork Portfolio Readiness | **5.5 / 10** | It will not embarrass you and it proves technical competence. It will not, in its current form, make a client stop scrolling and think "I need this person" — particularly on a phone.                                                                                                          |

---

## 4. Findings

Severity legend: **CRITICAL** = blocks portfolio use · **HIGH** = materially weakens the sales case or a core requirement · **MEDIUM** = noticeable defect / quality gap · **LOW** = polish / hygiene.

No CRITICAL defects were found: nothing crashes, nothing is broken, nothing is misrepresented.

### HIGH

#### H1 — Hero 3D sculpture is static at rest and is a stock primitive

- **Location**: `src/v2/ChromeScene.tsx:75-86` (geometry/material), `:126-130` (render loop stops when settled), `:114` (intro only spins once).
- **Description**: The flagship "interactive 3D sculpture" is `TorusKnotGeometry(1.12, 0.38, …, 2, 3)` with a default-style `MeshPhysicalMaterial`. After the 1.5 s entrance the render loop sleeps; without pointer input the hero is a still image.
- **Root cause**: On-demand rendering was chosen for efficiency (good) but with no ambient motion budget; no custom geometry or shader was authored.
- **Evidence**: Frame counter `data-frames` = 90 at 2.5 s and still 90 after 3 more seconds idle (`report.json → heroIdleFrames`). Screenshots `seq-hero-*`. The torus knot is the default demo object in the Three.js docs and countless templates.
- **Recommended fix**: (a) Add a low-cost ambient loop (slow rotation/breathing, ~30 fps cap, still paused off-screen/hidden/reduced). (b) Replace the knot with an authored form: e.g. a displaced icosphere/metaball or a vertex-shader-deformed surface whose deformation follows pointer velocity, with a custom `onBeforeCompile` fresnel/iridescence or a matcap. (c) Consider letting scroll velocity distort it.
- **Verification**: `data-frames` keeps increasing at rest; visual A/B screenshots; frame-time p95 unchanged (±5 ms) on the same GPU.

#### H2 — Hero 3D is not touch-interactive on mobile

- **Location**: `src/v2/ChromeScene.tsx:158-164`; no `touch-action` on `.chrome-scene` in `src/styles.css:479-488`.
- **Description**: On touch, `move` returns unless `event.buttons` is set; with default `touch-action:auto` the browser claims the gesture for scrolling and fires `pointercancel`. A tap changes nothing.
- **Evidence**: 390 px touch context: rotation `0.380,-0.500,-0.450` before and after a tap (`report.json → mobileHeroTapRotation`). Only the 7 px "Rotate form" button works.
- **Recommended fix**: Use device orientation (with permission prompt on iOS) or a horizontal-drag gesture with `touch-action: pan-y` on the canvas host; add a subtle auto-motion so the object is alive even without input.
- **Verification**: Touch drag in emulation + a real phone test changes `data-rotation` without blocking vertical scroll.

#### H3 — Pervasive 5–9 px typography

- **Location**: `src/styles.css` desktop `:125` (10 px base mono), `:421`, `:498`, `:520`, `:549`, `:572`, `:600`, `:618`, `:666`, `:705`, `:725`; mobile `:2075` (7 px), `:2087` (6 px), `:2122` (6 px), `:2133` (6 px), `:2154` (**5 px** "SCROLL INTO THE EXPERIENCE"), `:2175` (7 px hero buttons), `:2199`.
- **Description**: Navigation-relevant labels and controls ("ENTER THE PLAYGROUND", "Rotate form", "Replay opening", scroll cue, captions) are set at 5–9 px.
- **Evidence**: Automated count of visible text nodes under 11 px: 35–37 on Home, 32–40 on Experiences, 25–28 on Studio at every width; at 375/390 px the sizes include **5 px ×4, 6 px ×9, 7 px ×7** on Home (`report.json → viewports`).
- **Root cause**: Editorial "micro-label" styling taken too far; sizes were scaled down rather than re-composed for small screens.
- **Recommended fix**: Floor at 11 px desktop / 11–12 px mobile for labels, 13–14 px for interactive controls; use weight, tracking and colour for hierarchy instead of size. Raise hero control tap targets to ≥44 px on touch.
- **Verification**: Re-run the <11 px text count → 0 interactive elements, decorative-only exceptions documented.

#### H4 — Mobile receives no scroll storytelling

- **Location**: `src/v2/ScrollCinema.tsx:35` (`matchMedia('(min-width: 768px)')`), `src/v2/HorizontalShowcase.tsx:17`, `src/styles.css:2202-2212`.
- **Description**: Below 768 px the pinned cinema is `display:none` and replaced by three static blocks; the horizontal exhibition becomes a native swiper. The "advanced scroll animation" selling point does not exist on phones.
- **Evidence**: Screenshots `375-home-s1…s8`, `390-home-*`: static headings, a still WebP of the knot, no transitions.
- **Recommended fix**: Design a mobile-specific scrubbed sequence (shorter pin, 1.5–2 vh, transform/opacity only, no clip-path circle) or at least scroll-linked reveals per scene; keep the static stack for reduced motion only.
- **Verification**: 390 px touch run shows a pinned/scrubbed scene; frame p95 measured under 4× CPU throttle.

#### H5 — Visual repetition: the same knot appears 5+ times

- **Location**: `Hero.tsx:59/70`, `ScrollCinema.tsx:133/178`, `HorizontalShowcase.tsx:102`, `DepthGallery.tsx:6-7`, `public/art/chrome-001.webp`, `chrome-002.webp`.
- **Description**: Hero (live), cinema scene 1 (live), exhibition panel 01 (still), depth gallery cards 1 and 2 (stills), reduced-motion fallbacks (still). Two of three "artworks" in the depth gallery are the same object.
- **Evidence**: `seq-cinema-01`, `seq-horizontal-0`, `exp-depth-tilt` screenshots.
- **Recommended fix**: Give each section its own visual material: a second 3D form or the fluid shader for the cinema, original image/photographic/typographic artwork for the gallery. Visual range is what clients pay for.
- **Verification**: Visual inventory — no asset used in more than two sections.

#### H6 — Startup main-thread blocking

- **Location**: `src/v2/ChromeScene.tsx:47-75` (renderer, `PMREMGenerator.fromScene(RoomEnvironment)`, physical-material shader compile), `src/v2/Hero.tsx:7` (three.js fetched immediately on Home).
- **Evidence (measured, production build, 1440×900)**: unthrottled long tasks 210 / 602 / 134 ms → TBT ≈ **796 ms**, LCP 412 ms, first WebGL frame 1230 ms. CPU 4× + ~1.6 Mbps: long tasks up to 786 ms, TBT ≈ **1147 ms**, LCP 2204 ms, first WebGL frame 2647 ms. CLS 0.024–0.027.
- **Root cause**: Three.js parse + PMREM generation + `MeshPhysicalMaterial` (clearcoat) compilation all happen synchronously on the main thread during the intro animation.
- **Recommended fix**: Defer scene init to `requestIdleCallback`/after the char reveal; precompile with `renderer.compileAsync`; replace runtime PMREM with a tiny prebaked env map or matcap; consider `MeshStandardMaterial` on mobile.
- **Verification**: Same CDP script — target longest task <200 ms unthrottled, TBT <300 ms.

### MEDIUM

#### M1 — Scroll jank in the pinned cinema

- **Location**: `src/v2/ScrollCinema.tsx:73-101`; `src/styles.css:640-697`.
- **Evidence**: Wheel-scrolling through the pinned scene: 290 frames, median 16.7 ms, **p95 49.7 ms, max 116.6 ms, 38 frames >33 ms, 8 >50 ms** (integrated Intel GPU, unthrottled).
- **Root cause**: Full-viewport `clip-path` (inset and circle) animations repaint every frame; 15–31 vw text scaled to 3.5×/1.8×; a 62-path SVG (6,262 points) scaled/rotated under `mix-blend-mode: difference`; the WebGL scene re-renders each scroll tick.
- **Fix**: Animate masks with `transform` on a masking wrapper or a WebGL transition; rasterise the contour art (canvas/WebP) or animate only its wrapper; drop `mix-blend-mode` during motion; throttle WebGL updates while scrubbing.
- **Verify**: Same frame-delta probe; target p95 ≤25 ms.

#### M2 — Scene captions desynchronised from visuals

- **Location**: `src/v2/ScrollCinema.tsx:49` (`floor(progress*3)`), timeline positions `:53-101` (total 3.3 s; transform 0.7–1.8, reveal 2.0–3.3).
- **Evidence**: `seq-cinema-08` shows caption "03 / REVEAL" in silver/muted text over the still-lime TRANSFORMATION scene — unreadable and contradicts the visual.
- **Fix**: Drive caption state from timeline labels (`tl.addLabel` + `onUpdate` comparing `tl.time()`), or tween captions inside the timeline.
- **Verify**: 13-frame sequence: caption index always matches visible scene.

#### M3 — Typography system: Georgia as the display italic

- **Location**: `src/styles.css:112-117`; used in every `<i>`/`<em>` headline.
- **Description**: The second display face is a system font with no fallback control; on Android/Linux it falls back to an arbitrary serif. Combined with `mix-blend-mode: difference` on "EVERYTHING." (`:696`), the reveal shows purple interference lines through the letters (`seq-cinema-11`).
- **Fix**: Self-host a deliberate display serif/italic (OFL options exist) and remove the blend mode or constrain it to a solid background.
- **Verify**: Cross-browser screenshot parity; reveal frame without colour artefacts.

#### M4 — Caption/object collisions at 390, 768 and 1024 px

- **Location**: `.hero-form-caption` `src/styles.css:489-500`, `:2118-2125` and the 768–1100 range.
- **Evidence**: `390-home-top` (dark caption box over the knot), `768-home-top` and `1024-home-top` ("FORM 001 / CHROME / REAL-TIME WEBGL" overlaps the knot and "STATIC").
- **Fix**: Anchor the caption to a fixed grid cell or hide it below 1100 px.
- **Verify**: Screenshot sweep at all six widths.

#### M5 — Motion toggle appears broken under OS reduced motion

- **Location**: `src/motion.tsx:25`, `src/App.tsx:173-186`.
- **Evidence**: With `prefers-reduced-motion: reduce`, the button reads "MOTION OFF"; clicking flips only `aria-pressed`/label ("pause" → "resume") while motion stays off (`report.json → osReducedToggle`).
- **Fix**: Either disable the control with an explanation ("Reduced by your system settings") or allow an explicit opt-in override.
- **Verify**: E2E: under OS reduce, the control is disabled or actually enables motion.

#### M6 — No error boundary around lazy routes / WebGL

- **Location**: `src/App.tsx:111-139`, `src/main.tsx` (no boundary anywhere — grep for `ErrorBoundary`/`componentDidCatch` returns nothing).
- **Description**: A failed lazy chunk (deploy skew, flaky network) or a Three.js exception unmounts the whole app (white screen). WebGL _creation_ failure is handled; runtime errors are not.
- **Fix**: Route-level boundary with a styled retry, plus a boundary around each scene that falls back to the still.
- **Verify**: Block `ChromeScene-*.js` / `Experiences-*.js` in Playwright and assert a fallback renders.

#### M7 — SEO/sharing metadata missing for a portfolio piece

- **Location**: `index.html`.
- **Description**: No Open Graph/Twitter tags, no preview image, no canonical, no `robots.txt`/`sitemap.xml`; per-route `<meta name="description">` is not updated; content is client-rendered only.
- **Impact**: A link pasted into Upwork, LinkedIn or Slack shows no preview image — a real cost for a portfolio link.
- **Fix**: Add OG/Twitter tags + a designed 1200×630 preview; per-route description; consider prerendering the three routes.
- **Verify**: Social-preview debugger / `curl` the HTML.

#### M8 — Main bundle size

- **Location**: build output `index-*.js` 391 kB raw / 132 kB gzip (React DOM, Router, GSAP + ScrollTrigger, Lucide, Home tree) + `three.module` 537 kB / 132 kB loaded immediately by the hero.
- **Fix**: Lazy-load ScrollCinema/HorizontalShowcase below the fold; import only `three/src/...` modules needed or accept and document; preload the hero chunk.
- **Verify**: Build report.

#### M9 — "Let's talk" leads to a simulated form

- **Location**: `src/components/ContactForm.tsx:46-48`, header/CTA links to `/studio#contact`.
- **Description**: Honest and well built, but in a sales portfolio every CTA ends in "nothing is sent". A client who is convinced has nowhere to go.
- **Fix**: Make the CTA a real Upwork profile link or `mailto:`; keep the form as an optional demo.

### LOW

| ID  | Location                                      | Issue                                                                                                                                                                                  | Fix / verification                                                                         |
| --- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| L1  | `src/styles.css:7`                            | Global `scroll-behavior: smooth` with ScrollTrigger (GSAP docs advise against; can fight refresh/restoration).                                                                         | Remove or scope to anchor clicks.                                                          |
| L2  | `HorizontalShowcase.tsx:187-195`              | Desktop prev/next buttons sit below the pinned track, so they are not visible while the gallery is active (`seq-horizontal-*`).                                                        | Overlay controls inside the pinned viewport.                                               |
| L3  | `HorizontalShowcase.tsx:88-92`                | Focusable `div` with `aria-label` and no role on desktop (where it does not scroll).                                                                                                   | `role="region"` + only focusable on mobile.                                                |
| L4  | `ChromeScene.tsx:105,114`; `Hero.tsx:105-113` | "Replay opening" replays text but not the 3D entrance (`began` fixed at mount).                                                                                                        | Reset `began` in `api.reset`.                                                              |
| L5  | `App.tsx:202-224`                             | Mobile menu: no focus trap, background not `inert`, Escape works only when focus is inside the nav.                                                                                    | Trap focus / `inert` on `main`.                                                            |
| L6  | Navigation leak probe                         | Over 8 Home↔Experiences round-trips: JS listeners +2 per cycle (201→230), heap after GC 4.6→7.9 MB, DOM nodes +1 per cycle. Small; not proven to be a leak.                            | Heap snapshot diff to locate retained closures.                                            |
| L7  | `src/styles.css:443`                          | `font-weight: 600` requested; only 400/500/700 shipped → browser substitutes 700.                                                                                                      | Ship 600 or use 700.                                                                       |
| L8  | `src/styles.css` (3,400 lines)                | Reduced-motion rules duplicated (`:3042-3117` vs `:3118-3230`), monolithic file.                                                                                                       | Split per component; single reduced-motion source (`[data-motion=reduced]` set from both). |
| L9  | `Experiences.tsx` copy                        | "Elastic physics" is a single draggable disc in an empty box — reads as a tech demo rather than an art-directed study.                                                                 | Creative pass (see Phase 3).                                                               |
| L10 | Project root                                  | `dist/`, `screenshots/`, `qa/`, `playwright-report/`, `test-results/` and several MD reports live alongside source; mostly ignored by git, but clutter for a client browsing the repo. | Move QA evidence to `docs/qa/`.                                                            |

---

## 5. Creative direction audit (Phase 2)

**Desktop.** The opening is confident: "BEYOND / STATIC." at 18–21 vw with the acid full stop is a good poster. The cinema's scene 2 (giant "FORM" sliced by a lime wipe, then "NOTHING STANDS STILL." rotating) is the best sequence on the site, and the three horizontal panels (chrome / vermilion afterimage / lime field) show real art-direction range. That is the core worth keeping.

What feels **generic/template**: the chrome torus knot; acid-lime-on-black; contour-line SVG fields; "experiments in perception", "things you feel", "beyond static" copy (interchangeable with many studio sites); the "04" superscript nav counter; "+" corner crosshairs.

What feels **cheap or unfinished**: 5–9 px labels; Georgia italic headlines; purple blend artefacts in the REVEAL; the knot repeated as a still image in three places; the elastic study as a lone disc; captions overlapping the 3D object on tablet.

What feels **overdesigned**: many decorative micro-labels per screen (4–6 tiny mono strings competing at the edges) without carrying information.

**Mobile.** Clean and readable for headings, but static and visually thin; the cinema becomes three text cards; micro-labels become illegible; the hero object cannot be touched.

**Memorability.** A client will remember "big type and a chrome knot" — which is exactly what they will remember from many other portfolios. There is no single signature interaction they will describe to a colleague.

---

## 6. Performance (Phase 6) — measured vs estimated

**Measured (this audit, production build, Edge 156, Intel UHD, 1440×900):**

| Metric             | Unthrottled      | CPU 4× + ~1.6 Mbps/150 ms |
| ------------------ | ---------------- | ------------------------- |
| FCP / LCP          | 412 / 412 ms     | 2204 / 2204 ms            |
| Long tasks         | 210, 602, 134 ms | 136, 786, 257, 168 ms     |
| TBT (sum >50 ms)   | ~796 ms          | ~1147 ms                  |
| First WebGL frame  | 1230 ms          | 2647 ms                   |
| CLS                | 0.024            | 0.027                     |
| Transfer (initial) | 337 kB           | 337 kB                    |
| JS heap after load | 11 MB            | 9.9 MB                    |

Scroll frame deltas (pinned cinema, wheel): median 16.7 ms, p95 49.7 ms, max 116.6 ms.
Idle: hero and fluid renderers stop issuing frames after settling (verified: counters frozen).
Cleanup: canvases 1 and pin-spacers 2 constant across 8 route round-trips; 0 pin-spacers after leaving Home (E2E).

**Estimated / not measured**: real mobile GPU cost, battery/thermals, Safari/Firefox behaviour, Lighthouse score. No FPS guarantee is implied.

---

## 7. Accessibility (Phase 7)

Strengths (verified): skip link → `#main`; `h1` focused after route change; curtain is `aria-hidden` and does not block the URL change; every pointer study has a keyboard/touch equivalent (arrow keys, range input, buttons) and a live-region announcement; reduced motion removes pins and GPU scenes, keeps a complete natural-order story (`cinema-natural`); visible 2 px acid focus ring; axe 0 violations; contact form focuses first invalid field with `aria-describedby`.

Weaknesses: H3 (5–9 px text — fails practical legibility even where contrast passes), M5 (toggle), L5 (menu focus), L3 (focusable non-interactive region), hero controls ~28–32 px tall on touch. Screen-reader sessions were not run.

---

## 8. Functionality (Phase 8)

| Control                                                                                 | Result                                                  |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Desktop nav, footer nav, logo                                                           | Works                                                   |
| Mobile menu open / link / Escape                                                        | Works (E2E) — no focus trap                             |
| Route transitions + curtain                                                             | Works; URL updates immediately; curtain frames captured |
| Back / forward                                                                          | Works; scroll restored to 0 on Home, focus on `h1`      |
| Rotate form / Replay opening                                                            | Work (replay does not replay 3D entrance — L4)          |
| Scroll cue anchor                                                                       | Works                                                   |
| Horizontal gallery desktop / mobile buttons                                             | Work; desktop buttons not visible during pin (L2)       |
| Elastic, Fluid (Wake/Reset), Type (modes, slider, replay), Depth (cards, arrows, reset) | All work (E2E + captures)                               |
| Contact form                                                                            | Validates, simulated success, no POST (by design)       |
| Back to top                                                                             | Works                                                   |
| Motion toggle                                                                           | Works when OS allows motion; no-op under OS reduce (M5) |

No purely decorative control that pretends to be functional was found.

---

## 9. Code quality & security (Phase 9)

- TypeScript: strict build passes; types are lightweight and adequate.
- GSAP: every timeline is inside `gsap.context`/`gsap.matchMedia` and reverted on cleanup; `invalidateOnRefresh` on function-based values; `containerAnimation` used correctly.
- Three.js: geometry, material, PMREM target, renderer disposed; `forceContextLoss`; context-lost/restored handled; RAF cancelled; observers disconnected.
- Dependencies: lean (8 runtime deps, no unused ones found). No `dangerouslySetInnerHTML`, no network calls, no secrets, no user data stored. No security issues identified.
- Missing: error boundaries (M6), SEO/social metadata (M7).

---

## 10. Overall assessment

Would this attract clients seeking advanced animation work? **It proves you can build it correctly; it does not yet prove you can make it unforgettable.** A technically literate client who opens DevTools will be reassured. A creative director or founder scrolling on a phone will see a well-made, familiar-looking dark portfolio with tiny text and a still knot.

---

## 11. Prioritised repair plan (not implemented)

**PHASE 1 — High-severity defects**

1. H3 — Typographic floor (≥11 px labels, ≥13 px controls, ≥44 px touch targets).
2. H2 — Touch interaction for the hero object + `touch-action` handling.
3. H1 (part a) — Ambient idle motion for the hero, still paused off-screen/hidden/reduced.
4. H6 — Defer/precompile WebGL; replace runtime PMREM; target TBT <300 ms.
5. H4 — Mobile scroll-linked story (light pin or per-scene scrubbed reveals).

**PHASE 2 — Medium functional & performance issues**

- M1 — Remove per-frame clip-path/SVG repaint cost in the cinema; re-measure p95.
- M2 — Label-driven caption sync.
- M4 — Fix caption/object collisions at 390–1100 px.
- M5 — Motion toggle behaviour under OS reduced motion.
- M6 — Error boundaries with styled fallbacks.
- M7 — OG/Twitter/canonical + preview image; per-route descriptions.
- M8 — Code-split below-fold Home sections.

**PHASE 3 — High-impact creative refinements**

- H1 (part b) — Replace the torus knot with an authored form + custom shader (pointer-velocity deformation, fresnel/iridescence).
- H5 — Unique visual material per section; remove repeated knot stills.
- M3 — Self-hosted display serif; remove blend-mode artefacts.
- One signature transition: carry the 3D object from hero into the cinema (shared WebGL canvas) instead of two separate scenes.
- Art-direct the Elastic study (L9) and surface the fluid shader on Home.
- M9 — Real CTA (Upwork/mailto).
- Tighten copy: replace interchangeable slogans with specific claims about what you build.

**PHASE 4 — Low-priority cleanup**

- L1–L8, L10.

---

## 12. Portfolio verdict (Phase 13)

1. **Does it look like a genuine premium creative development project?** Partially. It is genuine and well-engineered; it is not yet premium in finish (micro-type, system italic, repetition).
2. **Advanced or basic animations?** Intermediate. Correct, idiomatic GSAP/ScrollTrigger and real WebGL, but the effects themselves (char stagger, clip-path wipes, pointer tilt, quickTo displacement, CSS 3D cards) are well-known patterns. The fluid shader and pinned cinema are the most advanced parts.
3. **Visually memorable?** Moderately on desktop (scene 2 and the posters); weakly on mobile.
4. **Would it convince a client to pay for GSAP/interactive work?** It would convince a client who needs a reliable implementer. It would not yet win a client looking for a creative lead.
5. **Three changes with the biggest impact:** (1) an authored, always-alive, touch-reactive hero object replacing the stock knot; (2) a real mobile scroll experience with a readable type scale; (3) one signature cross-section transition that carries the 3D form through the story — plus removing the repeated stills.
6. **Ready for public portfolio use?** **Yes as a secondary piece today; not yet as the lead "advanced animation" showcase.** Complete Phase 1 (and ideally items 13–16) before featuring it first on Upwork.
