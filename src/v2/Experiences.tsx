import { lazy, Suspense, useRef, useState } from 'react'
import { ArrowUpRight, RotateCcw } from 'lucide-react'
import ElasticStudy from './ElasticStudy'
import TypeDisplacement from './TypeDisplacement'
import DepthGallery from './DepthGallery'
import type { FluidHandle } from './FluidCanvas'
import DeferredScene from './DeferredScene'
import ErrorBoundary from '../components/ErrorBoundary'
import ContactCta from '../components/ContactCta'
import { useMotion } from '../motion'
import { ContourArt } from './Art'
import { studies } from './studies'
const FluidCanvas = lazy(() => import('./FluidCanvas'))

type Notes = { does: string; trigger: string; optimised: string; mobile: string }
function StudyNotes({ id, notes }: { id: (typeof studies)[number]['id']; notes: Notes }) {
  const study = studies.find((item) => item.id === id)!
  return (
    <details className="study-notes">
      <summary>Behind the motion</summary>
      <dl>
        <div>
          <dt>What it does</dt>
          <dd>{notes.does}</dd>
        </div>
        <div>
          <dt>Technology</dt>
          <dd>{study.tech}</dd>
        </div>
        <div>
          <dt>How to trigger it</dt>
          <dd>{notes.trigger}</dd>
        </div>
        <div>
          <dt>Optimisation</dt>
          <dd>{notes.optimised}</dd>
        </div>
        <div>
          <dt>On mobile</dt>
          <dd>{notes.mobile}</dd>
        </div>
        <div>
          <dt>Use it for</dt>
          <dd>{study.use}</dd>
        </div>
      </dl>
    </details>
  )
}

function StudyTitle({
  index,
  kicker,
  id,
  lines,
  copy,
}: {
  index: string
  kicker: string
  id: string
  lines: [string, string]
  copy: string
}) {
  return (
    <div className="study-title pad">
      <span className="mono">
        {index} / {kicker}
      </span>
      <h2 id={`${id}-title`}>
        {lines[0]}
        <br />
        <i>{lines[1]}</i>
      </h2>
      <p>{copy}</p>
    </div>
  )
}

export default function Experiences() {
  const { reduced } = useMotion()
  const fluid = useRef<FluidHandle>(null),
    [pulses, setPulses] = useState(0)
  return (
    <div className="playground-page">
      <section className="playground-heading pad">
        <span className="eyebrow">The interactive playground / 04 live studies</span>
        <h1 tabIndex={-1}>
          Feel the
          <br />
          <i>response.</i>
        </h1>
        <div>
          <p>
            Four practical patterns, each isolated and measurable.
            <br />
            <span className="muted">Every one works by pointer, touch and keyboard.</span>
          </p>
          <nav aria-label="Playground studies">
            {studies.map((study) => (
              <a href={`#${study.id}`} key={study.id}>
                {study.index} / {study.name}
              </a>
            ))}
          </nav>
        </div>
      </section>
      <section
        className="motion-study magnetic-study"
        id="magnetic"
        aria-labelledby="magnetic-title"
      >
        <StudyTitle
          index="01"
          kicker="Spring physics"
          id="magnetic"
          lines={['A little', 'attraction.']}
          copy="A magnetic core on a damped spring. Every slat in the field turns to face it."
        />
        <div className="pad">
          <ElasticStudy />
          <StudyNotes
            id="magnetic"
            notes={{
              does: 'A mass-spring integrator with real velocity and overshoot pulls the core toward the pointer; 91 field slats rotate toward it and lengthen with proximity.',
              trigger:
                'Move the pointer over the field, drag on touch, press the core, or use arrow keys on the focused core. Reset physics returns it to rest.',
              optimised:
                'One requestAnimationFrame loop that sleeps once the spring settles, pauses off-screen and in hidden tabs, and writes transforms only — no React state per frame.',
              mobile:
                'Touch dragging uses pointer capture; tapping the core adds an impulse. Reduced motion keeps the core at rest and announces activation.',
            }}
          />
        </div>
      </section>
      <section className="motion-study fluid-study" id="fluid" aria-labelledby="fluid-title">
        <StudyTitle
          index="02"
          kicker="Procedural liquid"
          id="fluid"
          lines={['Break the', 'surface.']}
          copy="A silver field. Move through it and leave an impression."
        />
        <div className="fluid-stage">
          {reduced ? (
            <div
              className="fluid-still"
              role="img"
              aria-label="Still contour field. Real-time rendering is disabled by the motion preference."
            >
              <ContourArt />
            </div>
          ) : (
            <ErrorBoundary
              name="fluid"
              fallback={
                <div className="fluid-still" role="img" aria-label="Still contour field.">
                  <ContourArt />
                </div>
              }
            >
              <DeferredScene>
                <Suspense fallback={<div className="scene-preparing">Preparing the field</div>}>
                  <FluidCanvas ref={fluid} />
                </Suspense>
              </DeferredScene>
            </ErrorBoundary>
          )}
          <span className="fluid-annotation mono" aria-hidden="true">
            {reduced ? 'Still field / reduced motion' : 'Liquid study / touch the surface'}
          </span>
          <button
            type="button"
            className="fluid-pulse"
            disabled={reduced}
            onClick={() => {
              fluid.current?.pulse()
              setPulses((n) => n + 1)
            }}
          >
            Wake the surface <ArrowUpRight size={19} aria-hidden="true" />
          </button>
        </div>
        <div className="pad">
          <div className="study-controls">
            <span className="mono muted">Real-time fragment shader / finite ripple field</span>
            <button
              type="button"
              className="text-control"
              onClick={() => {
                fluid.current?.reset()
                setPulses(0)
              }}
            >
              <RotateCcw size={14} aria-hidden="true" />
              Reset surface
            </button>
          </div>
          <StudyNotes
            id="fluid"
            notes={{
              does: 'A full-screen fragment shader layers value noise, domain warping and reflective bands, with a pointer-centred ripple whose energy decays. It is an analytical liquid look, not a Navier–Stokes simulation.',
              trigger:
                'Move or touch the surface. Wake the surface sends a pulse for keyboard and touch; Reset surface clears it.',
              optimised:
                'One quad, capped pixel ratio (1.25 desktop / 0.8 mobile), mounted only near the viewport, and the loop freezes once the ripple energy dissipates.',
              mobile:
                'Touching the surface sets the ripple origin. Reduced motion and WebGL failures show a labelled still.',
            }}
          />
        </div>
        <span role="status" className="sr-only">
          {pulses ? `Surface pulse ${pulses}` : ''}
        </span>
      </section>
      <section className="motion-study type-study" id="type" aria-labelledby="type-title">
        <StudyTitle
          index="03"
          kicker="Variable type field"
          id="type"
          lines={['Words with', 'a wavelength.']}
          copy="Type is a material too. Bend its baseline, its width and its weight."
        />
        <div className="pad">
          <TypeDisplacement />
          <StudyNotes
            id="type"
            notes={{
              does: 'A distance field maps the pointer to each letter. Wave moves the baseline, Width drives the variable font’s wdth and wght axes, Twist rotates the letters.',
              trigger:
                'Move across the word, or use the Field position slider. Replay type sends an elastic impulse through the letters.',
              optimised:
                'GSAP quickTo setters reuse one tween per property per letter; nothing re-renders in React while the field moves.',
              mobile:
                'The slider gives the same control by touch. Screen readers receive the unsplit word; reduced motion keeps it undistorted.',
            }}
          />
        </div>
      </section>
      <section className="motion-study depth-study" id="depth" aria-labelledby="depth-title">
        <StudyTitle
          index="04"
          kicker="Spatial image system"
          id="depth"
          lines={['Another', 'point of view.']}
          copy="Three artworks. What comes forward changes the whole picture."
        />
        <div className="pad">
          <DepthGallery />
          <StudyNotes
            id="depth"
            notes={{
              does: 'Image planes sit at different translateZ depths in one perspective. Selecting an image changes its real depth and layer order; the pointer tilts the shared space.',
              trigger:
                'Select an image, use the previous / next buttons, or arrow keys while an image is focused.',
              optimised:
                'Two quickTo setters for the tilt and CSS transforms for depth — the browser composites the planes on the GPU.',
              mobile:
                'Tilt is pointer-only; touch uses the image buttons and arrows. Reduced motion swaps the selection instantly.',
            }}
          />
        </div>
      </section>
      <ContactCta eyebrow="Now imagine what we could make." lines={['Your next', 'move.', '']} />
    </div>
  )
}
