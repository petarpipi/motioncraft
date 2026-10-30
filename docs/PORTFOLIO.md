# Upwork portfolio — MOTIONCRAFT V2.1

## Title

MOTIONCRAFT — Real-time WebGL sculpture, GSAP scroll cinema and variable-font motion

## Short description

A creative development showcase built around one element: the slat. A custom WebGL sculpture made of 40 instanced chrome slats coils, fans open and closes into an iris as you scroll. It is carried from the hero through a pinned three-scene cinema on desktop and phones. The same slats drive route transitions, scene shutters and sliced typography. Four practical studies follow: magnetic spring physics, a GLSL liquid surface, a variable-font type field and a 3D depth gallery. Each has keyboard, touch and reduced-motion support.

Self-initiated demonstration project, not a commercial client commission.

## Technologies

React 19 · TypeScript · Vite · GSAP · ScrollTrigger · Three.js · custom GLSL (vertex + fragment) · instanced rendering · variable fonts (wdth / wght) · CSS 3D · Vitest · Playwright · axe-core

## Key work

- Custom instanced WebGL sculpture: one draw call, with per-slat poses computed in a vertex shader and a staggered cascade between three poses.
- An analytic studio fragment shader (softboxes, strip light, acid rim) with no environment maps or PMREM.
- The sculpture responds to the pointer, taps, horizontal drags and scroll velocity. It keeps breathing at rest, drops to a half-rate idle loop and stops off-screen.
- One fixed canvas carries the form from the hero into a pinned FORM → TRANSFORMATION → REVEAL cinema, with slat shutters, sliced type, variable-width headlines and an iris image mask.
- A signature slat route transition, with immediate URL/history updates and focus management.
- Practical studies, each documented with what it does, how it is optimised and how it behaves on mobile.

## Measured results (local lab, production build)

- Desktop cinema scroll: p95 frame time 17 ms, and no frames over 50 ms. On the same machine V2.0 had a p95 of 50–84 ms.
- Desktop: TBT 284 ms, LCP 520 ms, CLS 0.03.
- App code is a 37.5 kB chunk; Three.js is loaded after first paint.
- 31 unit tests and a Playwright suite (desktop + touch mobile) are included, with axe checks in both motion modes.

## Problems solved

**Making 3D worth its cost.** The object is the story. It changes form with the scroll, responds to every input type, and costs one draw call.

**One visual language.** Slats connect the sculpture, the transitions, the typography and the logo, so the site reads as authored rather than as a collection of effects.

**Motion for everyone.** Text never drops below 11 px, controls are 44 px or larger, every pointer interaction has a keyboard/touch equivalent, and the reduced-motion path is complete. Visitors can also explicitly opt back in to motion.
