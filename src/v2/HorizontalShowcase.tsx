import { useLayoutEffect, useRef } from 'react'
import { ArrowDown, ArrowUpRight, ArrowLeft, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import type { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMotion } from '../motion'
import { mediaContext } from './mediaContext'
import { SphereArt } from './Art'

export default function HorizontalShowcase() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const pinned = useRef<HTMLDivElement>(null)
  const travel = useRef<ScrollTrigger | null>(null)
  const { reduced } = useMotion()
  useLayoutEffect(() => {
    if (reduced) return
    return mediaContext(
      { wide: '(min-width: 768px)' },
      () => {
        const distance = () => track.current!.scrollWidth - innerWidth
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinned.current,
            start: 'top top',
            end: () => `+=${distance() * 0.85}`,
            pin: true,
            scrub: 0.75,
            invalidateOnRefresh: true,
          },
        })
        travel.current = tl.scrollTrigger ?? null
        tl.to(track.current, { x: () => -distance(), ease: 'none' })
        gsap.utils.toArray<HTMLElement>('.project-visual').forEach((visual) =>
          gsap.fromTo(
            visual,
            { xPercent: 10 },
            {
              xPercent: -10,
              ease: 'none',
              scrollTrigger: {
                trigger: visual,
                containerAnimation: tl,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            },
          ),
        )
        return () => {
          travel.current = null
        }
      },
      root.current,
    )
  }, [reduced])
  const step = (direction: number) => {
    const el = viewport.current
    const trigger = travel.current
    if (!el) return
    if (!trigger) {
      el.scrollBy({
        left: direction * el.clientWidth * 0.9,
        behavior: reduced ? 'instant' : 'smooth',
      })
      return
    }
    // Move to the previous/next panel boundary of the pinned travel.
    const panels = 3
    const span = trigger.end - trigger.start
    const current = Math.round(((window.scrollY - trigger.start) / span) * (panels - 1))
    const next = Math.max(0, Math.min(panels - 1, current + direction))
    window.scrollTo({ top: trigger.start + (span * next) / (panels - 1), behavior: 'smooth' })
  }
  return (
    <section id="selected-work" className="showcase" ref={root} aria-labelledby="work-heading">
      <div className="work-intro pad">
        <span className="eyebrow">02 / Selected explorations</span>
        <h2 id="work-heading">
          Out of
          <br />
          <i>the ordinary.</i>
        </h2>
        <div>
          <p>Three identities. One restless curiosity.</p>
          <span className="mono">
            <ArrowDown size={15} aria-hidden="true" />
            Scroll vertically. Think sideways.
          </span>
        </div>
      </div>
      <div className="showcase-pin" ref={pinned}>
        <div
          className="project-viewport"
          ref={viewport}
          tabIndex={0}
          role="region"
          aria-label="Project collection. Use the previous and next buttons, or swipe on touch screens."
        >
          <div className="project-track" ref={track}>
            <article className="project-panel project-material">
              <div className="project-panel-top mono">
                <span>001 / Material study</span>
                <span>Self-initiated</span>
              </div>
              <div className="project-visual">
                <img
                  src="/art/sculpture-fan.webp"
                  alt="The slat sculpture fanned open into a deck of chrome blades"
                  loading="lazy"
                  width="900"
                  height="900"
                />
              </div>
              <h3>
                Slat
                <br />
                <i>matter.</i>
              </h3>
              <div className="project-panel-bottom">
                <p>One geometry, forty instances, a shader that decides the pose.</p>
                <Link to="/experiences#depth">
                  Enter the depth study <ArrowUpRight aria-hidden="true" />
                </Link>
                <span className="project-number" aria-hidden="true">
                  01
                </span>
              </div>
            </article>
            <article className="project-panel project-afterimage">
              <div className="project-panel-top mono">
                <span>002 / Typographic experiment</span>
                <span>Self-initiated</span>
              </div>
              <div className="project-visual afterimage-poster" aria-hidden="true">
                <div />
                <div />
                <div />
                <span>
                  AFTER
                  <br />
                  IMAGE
                </span>
              </div>
              <h3>
                Leave an
                <br />
                <i>afterimage.</i>
              </h3>
              <div className="project-panel-bottom">
                <p>Type with tension. Width, weight and rhythm as motion.</p>
                <Link to="/experiences#type">
                  Enter the type study <ArrowUpRight aria-hidden="true" />
                </Link>
                <span className="project-number" aria-hidden="true">
                  02
                </span>
              </div>
            </article>
            <article className="project-panel project-field">
              <div className="project-panel-top mono">
                <span>003 / Generative surface</span>
                <span>Self-initiated</span>
              </div>
              <div className="project-visual field-poster">
                <img
                  src="/art/liquid.webp"
                  alt="A frame of the real-time liquid shader: silver bands with acid highlights"
                  loading="lazy"
                  width="900"
                  height="900"
                />
                <SphereArt />
              </div>
              <h3>
                Enter
                <br />
                <i>the field.</i>
              </h3>
              <div className="project-panel-bottom">
                <p>A living surface. Every touch, a new terrain.</p>
                <Link to="/experiences#fluid">
                  Enter the fluid study <ArrowUpRight aria-hidden="true" />
                </Link>
                <span className="project-number" aria-hidden="true">
                  03
                </span>
              </div>
            </article>
          </div>
        </div>
        <div className="gallery-controls">
          <button type="button" onClick={() => step(-1)} aria-label="Previous project">
            <ArrowLeft aria-hidden="true" />
          </button>
          <span className="mono">Material / Typography / Generative</span>
          <button type="button" onClick={() => step(1)} aria-label="Next project">
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  )
}
