import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { ArrowDown, ArrowUpRight, RotateCcw, Rotate3D } from 'lucide-react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { useMotion } from '../motion'
import { sculptureInput, sculptureState, sculptureStatus } from './sculpture/state'
import { SplitChars } from './signature'

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const [replays, setReplays] = useState(0)
  const { reduced } = useMotion()
  const status = useSyncExternalStore(sculptureStatus.subscribe, sculptureStatus.get, () => 'idle')
  const live = !reduced && status !== 'failed'

  // Typographic opening: slat-masked characters widen through the variable
  // width axis while the sculpture's slats shuffle into place.
  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.fromTo(
        '.hero-word-a .char',
        { yPercent: 110, fontStretch: '62%' },
        {
          yPercent: 0,
          // Phones use the regular width so the word still fits at its final size.
          fontStretch: () => (window.innerWidth < 768 ? '100%' : '125%'),
          duration: 1.4,
          stagger: 0.045,
        },
        0.05,
      )
        .fromTo(
          '.hero-word-b .char',
          { yPercent: 120, skewX: -18 },
          { yPercent: 0, skewX: 0, duration: 1.2, stagger: 0.05 },
          0.3,
        )
        .fromTo('.hero-rule', { scaleX: 0 }, { scaleX: 1, duration: 1.3 }, 0.35)
        .fromTo(
          '.hero-reveal',
          { yPercent: 100 },
          { yPercent: 0, duration: 0.9, stagger: 0.06 },
          0.55,
        )
    }, root)
    return () => ctx.revert()
  }, [reduced, replays])

  useLayoutEffect(() => {
    if (reduced || status !== 'ready') return
    const tween = gsap.fromTo(
      sculptureState,
      { assemble: 0 },
      { assemble: 1, duration: 2.4, ease: 'power3.out' },
    )
    return () => {
      tween.kill()
      sculptureState.assemble = 1
    }
  }, [reduced, status, replays])

  return (
    <section
      className="hero"
      id="top"
      ref={root}
      aria-labelledby="hero-heading"
      data-sculpture={status}
    >
      <div className="hero-meta mono">
        <span className="hero-mask">
          <span className="hero-reveal">
            <span className="status-dot" aria-hidden="true" />
            Independent creative development
          </span>
        </span>
        <span className="hero-mask">
          <span className="hero-reveal">
            {live ? 'Form 003 — real-time WebGL · custom GLSL' : 'Form 003 — still frame'}
          </span>
        </span>
      </div>
      <h1 id="hero-heading" className="hero-title" tabIndex={-1} aria-label="Beyond static.">
        <span className="hero-word hero-word-a">
          <SplitChars text="BEYOND" />
        </span>
        <span className="hero-word hero-word-b">
          <SplitChars text="static" />
          <span className="char acid" aria-hidden="true">
            .
          </span>
        </span>
      </h1>
      {!live && (
        <figure className="hero-still">
          <img
            src="/art/sculpture-column.webp"
            alt="Still of the slat sculpture: forty chrome slats coiled into a column."
            width="900"
            height="1100"
          />
          <figcaption className="mono">
            {reduced ? 'Still study / reduced motion' : 'Still study / WebGL unavailable'}
          </figcaption>
        </figure>
      )}
      <div className="hero-rule" aria-hidden="true" />
      <div className="hero-bar">
        <a href="#scroll-story" className="hero-scroll">
          <span className="scroll-disc" aria-hidden="true">
            <ArrowDown size={18} />
          </span>
          <span className="hero-mask">
            <span className="hero-reveal">Scroll into the experience</span>
          </span>
        </a>
        <p className="hero-lede">
          <span className="hero-mask">
            <span className="hero-reveal">Interfaces that respond</span>
          </span>
          <span className="hero-mask">
            <span className="hero-reveal muted">to touch, scroll and intent.</span>
          </span>
        </p>
        <div className="hero-actions">
          <button
            type="button"
            disabled={!live}
            onClick={() => {
              gsap.to(sculptureState, {
                spin: `+=${Math.PI / 2}`,
                duration: 1.6,
                ease: 'elastic.out(1, 0.5)',
              })
              sculptureInput.pluck(1, 0.5)
            }}
          >
            <Rotate3D size={16} aria-hidden="true" />
            Twist form
          </button>
          <button type="button" onClick={() => setReplays((v) => v + 1)}>
            <RotateCcw size={16} aria-hidden="true" />
            Replay opening
          </button>
          <Link to="/experiences" className="hero-enter">
            Enter the playground <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <span className="sr-only" role="status">
        {replays ? `Opening replay ${replays}` : ''}
      </span>
    </section>
  )
}
