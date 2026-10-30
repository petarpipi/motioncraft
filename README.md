# MOTIONCRAFT V2.1 — Beyond static

A cinematic creative-development portfolio built around one idea: **the slat**. A real-time WebGL sculpture made of instanced chrome slats is carried from the hero through a pinned, three-scene scroll cinema; the same slats drive the route transitions, scene changes and typography. Four practical studies show patterns clients actually ask for.

Self-initiated demonstration. No commercial client, award, customer outcome or real enquiry delivery is claimed.

## Run locally

Node.js 22.12+ and pnpm 11.25.0. Inside `04-motioncraft`:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

**Development: http://127.0.0.1:5184/**

```sh
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm preview
```

**Production preview: http://127.0.0.1:4184/**

Set `SITE_URL=https://your-domain` when building for deployment to get absolute Open Graph URLs, a canonical link and `sitemap.xml`. Fill in `src/config.ts` (Upwork profile or email) so every “Let’s talk” leads somewhere real; until then it opens the simulated brief form. Static hosts need an SPA fallback to `index.html`.

## What to look at

1. **Hero** — move the pointer (or tap / drag horizontally on a phone): the slats twist toward you and a wave runs through them. **Twist form** and **Replay opening** replay the choreography. The type widens through the variable font's width axis as it rises.
2. **Scroll** — the same object travels into the cinema: FORM (the column coils, the sliced word interlaces) → TRANSFORMATION (acid slat shutter, the form fans open, type changes width) → REVEAL (graphite slat shutter, the form closes into an iris and a mask opens inside it). Works on phones too.
3. **Exhibition** — vertical scroll drives three full-frame posters sideways; the prev/next buttons stay on screen.
4. **Experiences** — magnetic spring field, GLSL liquid surface, variable-font type field, CSS 3D depth gallery. Each has keyboard and touch controls and a “Behind the motion” panel with what it does, how it is optimised and how it behaves on mobile.
5. **Motion control** in the header — turns motion off, or back on even when the OS asks for reduced motion.

## Stack

React 19 · TypeScript · Vite 8 · React Router 7 · GSAP 3 + ScrollTrigger · Three.js 0.186 with custom GLSL · self-hosted Archivo Variable, Instrument Serif and Space Grotesk · Vitest · Testing Library · Playwright · axe-core.

Source map: `src/App.tsx` (shell, route curtain, menu), `src/motion.tsx` (motion preference), `src/v2/sculpture/` (WebGL engine and shaders), `src/v2/` (sections and studies), `src/styles/` (tokens, layout, home, pages, reduced motion).

## Scripts

```sh
pnpm posters      # stills + OG image from the live scenes (needs pnpm dev)
pnpm screenshots  # docs/screenshots at six widths + animation sequences (needs pnpm dev)
pnpm performance  # docs/qa/performance.json (needs pnpm build && pnpm preview)
pnpm format:check
```

## Documentation

- `AUDIT_REPORT.md` — independent audit, repairs and final scores.
- `docs/MOTION_GUIDE.md` — choreography, sculpture architecture, lifecycle and reduced motion.
- `docs/TEST_REPORT.md` — what was actually run and measured.
- `docs/PORTFOLIO.md` — Upwork case-study copy.
- `docs/ASSET_CREDITS.md` — provenance and licences.


## GitHub and Cloudflare Pages

Prepared as the standalone **motioncraft** repository. Run all commands from the cloned repository root. The package name is `motioncraft`; it is an internal package identifier. `private: true` prevents accidental npm publication and does not make a GitHub repository private.

| Setting | Value |
| --- | --- |
| Framework | React, TypeScript, React Router and Vite |
| Package manager | pnpm 11.25.0 |
| Verified Node.js | 24.22.1 |
| Build command | `pnpm install --frozen-lockfile && pnpm run build` |
| Build output | `dist` |
| Root directory | Leave empty (repository root) |
| Required application secrets | None |

The existing `build` package script also works with `npm run build` after dependencies are installed; pnpm is used for reproducible installation from the committed lockfile. See [CLOUDFLARE_PAGES.md](CLOUDFLARE_PAGES.md) for the build environment and connection instructions.

This repository is a frontend portfolio demonstration. No hosting deployment is performed by these preparation steps.
