# Asset provenance — MOTIONCRAFT V2.1

MOTIONCRAFT is a fictional, self-initiated portfolio identity. All visual compositions and English copy were created for this project. There are no client logos, stock photographs, testimonials, AI-generated images or externally hosted image/model assets.

## Original artwork and code

- **Slat sculpture:** original Three.js scene (`src/v2/sculpture/`). One `RoundedBoxGeometry` slat is instanced 26–40 times; a custom GLSL vertex shader computes every slat's pose (coiled column, fan, louvred iris) and a custom fragment shader shades it with an analytic studio environment. No environment map, model or texture is downloaded.
- **Sculpture stills:** `public/art/sculpture-column.webp`, `sculpture-fan.webp`, `sculpture-ring.webp`, `sculpture-macro.webp` — rendered from that live scene by `scripts/render-posters.mjs` (engine `snapshot()`), used for reduced motion, the WebGL fallback, the exhibition and the reveal mask.
- **Liquid still:** `public/art/liquid.webp`, captured from the live GLSL surface in `src/v2/FluidCanvas.tsx` by the same script.
- **Open Graph image:** `public/og-image.jpg`, a 1200×630 capture of the live hero.
- **Contour field:** original mathematical paths in `src/v2/Art.tsx` and `public/art/field.svg` (`scripts/generate-field.mjs`).
- **Magnetic field study:** original spring integration in `src/v2/physics.ts` and `ElasticStudy.tsx`.
- **Afterimage composition, slat signature, logo and favicon:** original CSS / vector artwork.

## Third-party assets and notices

| Item                                                 | Version / source                                                                                                                         | License                                                                                                               | Retained notice                                                                  |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Archivo (variable, wdth 62–125, wght 100–900), Latin | `@fontsource-variable/archivo` 5.3.0 files, self-hosted in `src/assets/fonts`; [project](https://github.com/Omnibus-Type/Archivo)        | SIL OFL 1.1                                                                                                           | `public/licenses/Archivo-OFL.txt`                                                |
| Instrument Serif Italic, Latin                       | `@fontsource/instrument-serif` 5.3.0 files, self-hosted in `src/assets/fonts`; [project](https://github.com/Instrument/instrument-serif) | SIL OFL 1.1                                                                                                           | `public/licenses/Instrument-Serif-OFL.txt`                                       |
| Space Grotesk, Latin 500 (labels)                    | `@fontsource/space-grotesk` 5.3.0; [project](https://github.com/floriankarsten/space-grotesk)                                            | SIL OFL 1.1                                                                                                           | `public/licenses/Space-Grotesk-OFL.txt`                                          |
| Lucide React icons                                   | 1.61.0; [Lucide](https://lucide.dev/)                                                                                                    | ISC                                                                                                                   | `public/licenses/Lucide-ISC.txt`                                                 |
| Three.js and RoundedBoxGeometry addon                | 0.186.1; [Three.js](https://threejs.org/)                                                                                                | MIT, as declared in the installed package                                                                             | `public/licenses/Three-MIT.txt`                                                  |
| GSAP / ScrollTrigger                                 | 3.x; [GSAP](https://gsap.com/)                                                                                                           | Installed package declares the Standard “no charge” license at [this upstream URL](https://gsap.com/standard-license) | Upstream package metadata retained in the lockfile; GSAP is not described as MIT |

The two OFL font files were taken unmodified from the published Fontsource packages and are served from the same origin. Inter and Georgia are no longer used; the Inter dependency and its notice were removed.

React, React Router, Vite, TypeScript, testing tools and Prettier retain their own upstream license notices in the installed packages. `pnpm-lock.yaml` records the exact dependency graph. A redistributor must preserve the notices applicable to their distribution; this document grants no extra rights.
