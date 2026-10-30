import { useLayoutEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import gsap from 'gsap'
import { useMotion } from '../motion'
import { sceneAt, sculptureState as S } from './sculpture/state'
import { mediaContext } from './mediaContext'
import { Slats, SplitChars } from './signature'

const scenes = [
  {
    name: 'Form',
    title: 'Everything begins with a form.',
    copy: 'Forty slats, one continuous idea. Scroll coils the column tighter.',
    still: '/art/sculpture-column.webp',
  },
  {
    name: 'Transformation',
    title: 'Nothing stands still.',
    copy: 'The same slats fan open. The type changes width as it moves.',
    still: '/art/sculpture-fan.webp',
  },
  {
    name: 'Reveal',
    title: 'Feel everything.',
    copy: 'The form closes into an iris and opens a window into itself.',
    still: '/art/sculpture-macro.webp',
  },
]
/** Timeline times at which scene 2 and scene 3 dominate the frame. */
export const CINEMA_SCENE_BOUNDARIES = [2.75, 5.85] as const

export default function ScrollCinema() {
  const root = useRef<HTMLElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const { reduced } = useMotion()
  useLayoutEffect(() => {
    if (reduced) return
    return mediaContext(
      {
        desktop: '(min-width: 1024px)',
        tablet: '(min-width: 768px) and (max-width: 1023.98px)',
        mobile: '(max-width: 767.98px)',
      },
      ({ desktop, tablet }) => {
        const hero = desktop
          ? { x: 0.22, y: -0.035, scale: 0.92 }
          : tablet
            ? { x: 0.25, y: 0, scale: 0.82 }
            : { x: 0, y: 0.015, scale: 0.78 }
        // Portrait screens stack type above the form instead of beside it.
        const form = desktop ? { x: 0, y: 0, scale: 1 } : { x: 0, y: -0.1, scale: 0.85 }
        const fan = desktop ? { x: 0.25, y: 0 } : { x: 0, y: -0.17 }
        // The hero form is carried into the cinema rather than replaced.
        gsap.fromTo(S, hero, {
          ...form,
          ease: 'none',
          scrollTrigger: {
            // Outside this component's selector scope, so pass the element.
            trigger: document.getElementById('top'),
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        })
        const once = { immediateRender: false }
        const revealScale = desktop ? 0.68 : tablet ? 0.64 : 0.66
        root.current?.style.setProperty('--reveal-scale', String(revealScale))
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          // Driven by the scrubbed playhead (not raw scroll), so captions stay in
          // step with what is on screen while the scrub catches up.
          onUpdate: () => {
            if (bar.current) bar.current.style.transform = `scaleX(${tl.progress()})`
            const scene = sceneAt(tl.time(), CINEMA_SCENE_BOUNDARIES)
            if (root.current && root.current.dataset.scene !== String(scene))
              root.current.dataset.scene = String(scene)
          },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${innerHeight * (desktop ? 4.2 : 3.4)}`,
            pin: '.cinema-stage',
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        })
        tl.addLabel('form', 0)
          .fromTo(S, { coil: 3.3 }, { coil: 7.5, duration: 2.6, ease: 'power1.inOut', ...once }, 0)
          .fromTo('.form-word', { scale: 1 }, { scale: 1.22, duration: 2.6 }, 0)
          .fromTo(
            '.form-slice > span',
            { xPercent: 0 },
            {
              xPercent: (i: number) => (i % 2 ? -1 : 1) * (10 + i * 6),
              duration: 2.3,
              ease: 'power2.inOut',
            },
            0.2,
          )
          .fromTo(
            '.shutter-a > span',
            { scaleY: 0 },
            {
              scaleY: 1,
              duration: 0.9,
              ease: 'power3.inOut',
              stagger: { each: 0.06, from: 'center' },
            },
            2.2,
          )
          .addLabel('transform', 3.1)
          .fromTo(
            S,
            { morph: 0, ...form },
            {
              morph: 1,
              ...fan,
              scale: desktop ? 1.05 : 0.82,
              duration: 2.2,
              ease: 'power2.inOut',
              ...once,
            },
            2.6,
          )
          .fromTo(
            '.tf-line > span',
            { yPercent: 110, fontStretch: '62%' },
            { yPercent: 0, fontStretch: '125%', duration: 1.2, ease: 'expo.out', stagger: 0.22 },
            3.0,
          )
          .to('.tf-1', { xPercent: -8, duration: 1.8 }, 4.1)
          .to('.tf-2', { skewX: -12, xPercent: 6, duration: 1.8 }, 4.1)
          .to('.tf-3', { xPercent: 9, duration: 1.8 }, 4.1)
          .fromTo(
            '.shutter-b > span',
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 0.9,
              ease: 'power3.inOut',
              stagger: { each: 0.05, from: 'start' },
            },
            5.3,
          )
          .addLabel('reveal', 6.3)
          .fromTo(
            S,
            { morph: 1, ...fan, scale: desktop ? 1.05 : 0.82 },
            {
              morph: 2,
              x: 0,
              y: 0,
              scale: revealScale,
              duration: 2,
              ease: 'power2.inOut',
              ...once,
            },
            5.6,
          )
          .fromTo('.iris', { scale: 0 }, { scale: 1, duration: 1.4, ease: 'power3.out' }, 7)
          .fromTo('.iris img', { scale: 1.8 }, { scale: 1, duration: 1.6, ease: 'power2.out' }, 7)
          .fromTo(
            '.rv-a .char',
            { yPercent: 110, rotationX: -80 },
            { yPercent: 0, rotationX: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06 },
            7.3,
          )
          .fromTo(
            '.rv-b > span',
            { yPercent: 110 },
            { yPercent: 0, duration: 1, ease: 'expo.out' },
            7.6,
          )
          .fromTo(
            S,
            { y: 0, scale: revealScale },
            { y: 0.9, scale: revealScale * 0.4, duration: 1, ease: 'power2.in', ...once },
            9.2,
          )
          .to('.iris', { scale: 1.7, duration: 1, ease: 'power2.in' }, 9.2)
        return () => {
          if (bar.current) bar.current.style.transform = 'scaleX(0)'
          if (root.current) root.current.dataset.scene = '0'
        }
      },
      root.current,
    )
  }, [reduced])
  return (
    <section
      id="scroll-story"
      className="cinema"
      ref={root}
      aria-labelledby="cinema-heading"
      data-scene="0"
    >
      <h2 className="sr-only" id="cinema-heading">
        From form to feeling: a three-scene scroll composition
      </h2>
      <div className="cinema-stage" aria-hidden="true">
        <div className="cin-scene cin-form">
          <div className="form-word">
            {Array.from({ length: 6 }, (_, i) => (
              <span className="form-slice" key={i} style={{ '--i': i } as CSSProperties}>
                <span>FORM</span>
              </span>
            ))}
          </div>
        </div>
        <Slats count={10} axis="rows" className="shutter-a" />
        <div className="cin-scene cin-transform">
          <span className="tf-line tf-1">
            <span>NOTHING</span>
          </span>
          <span className="tf-line tf-2">
            <span>stands</span>
          </span>
          <span className="tf-line tf-3">
            <span>STILL.</span>
          </span>
        </div>
        <Slats count={12} axis="columns" className="shutter-b" />
        <div className="cin-scene cin-reveal">
          <div className="iris">
            <img src="/art/sculpture-macro.webp" alt="" width="900" height="900" />
          </div>
          <div className="cin-reveal-type">
            <span className="rv-a">
              <SplitChars text="FEEL" />
            </span>
            <span className="rv-b">
              <span>everything.</span>
            </span>
          </div>
        </div>
        <div className="cin-hud">
          <div className="cin-hud-top mono">
            <span>01 — A study in transformation</span>
            <span>Your scroll directs the form</span>
          </div>
          <div className="cin-hud-bottom">
            {scenes.map((scene, i) => (
              <div className={`cin-caption cin-caption-${i}`} key={scene.name}>
                <span className="mono">
                  0{i + 1} / {scene.name}
                </span>
                <p>{scene.copy}</p>
              </div>
            ))}
            <div className="cin-progress">
              <span ref={bar} />
            </div>
          </div>
        </div>
      </div>
      <div className="cinema-natural">
        {scenes.map((scene, i) => (
          <article className={`natural-scene natural-scene-${i}`} key={scene.name}>
            <span className="mono">
              0{i + 1} / {scene.name}
            </span>
            <h3>{scene.title}</h3>
            <img
              src={scene.still}
              alt={`Still of the slat sculpture — ${scene.name.toLowerCase()} pose`}
              loading="lazy"
              width="900"
              height="900"
            />
            <p>{scene.copy}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
