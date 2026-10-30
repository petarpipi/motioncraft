# Motion guide — MOTIONCRAFT V2.1

## The signature: slats

Everything moves through one element family — the slat.

- The **3D sculpture** is 26–40 instanced slats whose poses are computed on the GPU.
- The **route curtain** is nine slats that sweep away from the centre while the page word lifts.
- **Cinema scene changes** close through horizontal acid slats (FORM → TRANSFORMATION) and vertical graphite slats (→ REVEAL).
- **Typography** is sliced into slats (the FORM word), and the closing call to action fills with slats on hover/focus.
- The **logo** is three slats.

Only `transform` is animated on DOM slats; nothing animates layout, `clip-path` or filters during scroll.

## The sculpture (`src/v2/sculpture/`)

| File                    | Role                                                                                                                                                                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `state.ts`              | Plain numbers (`x, y, scale, morph, assemble, coil, spin`) that GSAP tweens directly, plus the input queue, quality tiers and `sceneAt()`                                                                                              |
| `shaders.ts`            | Vertex shader: per-slat pose from instance index for three poses with a staggered cascade, intro scatter, pointer focus and a travelling impulse wave. Fragment shader: analytic studio reflection, graphite/polished rhythm, acid rim |
| `engine.ts`             | Renderer, instanced geometry, `compileAsync`, loop, input, resize, disposal, `snapshot()` for stills                                                                                                                                   |
| `../SculptureStage.tsx` | One fixed full-viewport canvas for hero + cinema, created after first paint (`requestIdleCallback`), active only while `#home-intro` is on screen                                                                                      |

Inputs: pointer position (group tilt + local twist near the pointer), pointer speed and taps (impulse wave), scroll velocity (impulse wave), **Twist form** (elastic `spin`). Idle: the form keeps breathing; after 5 s without input mid/low tiers render every second frame.

Quality tiers: `high` 40 slats, DPR ≤ 1.6, MSAA · `mid` 34 slats, DPR ≤ 1.35 · `low` (phones, coarse pointers, ≤ 4 cores) 26 slats, DPR ≤ 1.25, no MSAA. One draw call in every tier.

## Choreography

| Where            | Trigger            | What happens                                                                                                                                                                                                                         |
| ---------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hero opening     | mount / Replay     | BEYOND characters rise from slat masks while widening through the variable `wdth` axis (62 % → 125 %); _static._ slides in with a skew; rule and labels reveal; the sculpture's slats shuffle in from alternating sides (`assemble`) |
| Hero → cinema    | scroll, scrub 0.6  | the same form travels from its hero position to centre stage                                                                                                                                                                         |
| FORM             | pinned, scrub 0.8  | column coils tighter (`coil` 3.3 → 7.5), the sliced FORM word interlaces                                                                                                                                                             |
| → TRANSFORMATION |                    | acid row slats close from the centre; form fans open (`morph` 0 → 1) and moves aside; NOTHING / _stands_ / STILL. rise while widening                                                                                                |
| → REVEAL         |                    | graphite column slats sweep in; form closes into a louvred iris (`morph` 1 → 2); a circular mask opens inside the ring onto a macro still of the slats; FEEL flips in per character, _everything._ rises                             |
| Exit             |                    | form lifts out, mask expands                                                                                                                                                                                                         |
| Exhibition       | pinned, scrub 0.75 | vertical scroll moves three panels sideways; artwork parallax via `containerAnimation`; prev/next buttons snap between panels                                                                                                        |
| Route change     | navigation         | slat curtain, URL and history update immediately                                                                                                                                                                                     |

Captions and the progress bar are driven by the timeline's own `onUpdate`, so they always match the frame on screen while scrub catches up (`CINEMA_SCENE_BOUNDARIES`).

Mobile uses the same pinned cinema with a shorter distance (3.4 vs 4.2 viewport heights), a smaller reveal and the low sculpture tier.

## Lifecycle and cleanup

- Every timeline lives in `gsap.context()` or `gsap.matchMedia()` and is reverted on unmount or breakpoint change; pin spacers return to zero after leaving Home (tested).
- The sculpture and liquid renderers dispose geometry, material and renderer, force context loss, cancel RAF and remove every listener and observer.
- Loops stop in hidden tabs and when their section is off screen; the liquid shader and the magnetic spring stop entirely once settled.
- `ScrollTrigger.config({ ignoreMobileResize: true })` avoids pin re-layout when mobile URL bars resize the viewport.

## Reduced motion

`html[data-motion]` is resolved before first paint in `index.html` from the OS setting and the visitor's stored choice. Reduced mode: no pins, no curtain, no WebGL; the cinema becomes a natural three-scene layout with stills of the real sculpture; all controls stay usable and announce state. The header control can explicitly turn motion on or off, and its accessible name says when the current state comes from the system setting.
