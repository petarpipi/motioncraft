import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { RotateCcw } from 'lucide-react'
import { useMotion } from '../motion'
const word = 'WAVEFORM'
const modes = ['Wave', 'Width', 'Twist'] as const
type Mode = (typeof modes)[number]

/** Per-character displacement for a field position in [0, 1]. Exported for tests. */
export function fieldFor(mode: Mode, index: number, count: number, value: number) {
  const distance = (index / (count - 1) - value) * 2
  const influence = Math.max(0, 1 - Math.abs(distance))
  return {
    y: mode === 'Wave' ? -Math.cos(distance * Math.PI) * influence * 85 : 0,
    rotation: mode === 'Twist' ? distance * influence * 65 : 0,
    // Real typographic deformation through the font's width and weight axes.
    wdth: mode === 'Width' ? 62 + influence * 63 : 100,
    wght: mode === 'Width' ? 300 + influence * 600 : 760,
  }
}

export default function TypeDisplacement() {
  const root = useRef<HTMLDivElement>(null),
    slider = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<Mode>('Wave'),
    [replays, setReplays] = useState(0)
  const { reduced } = useMotion()
  const api = useRef({ field: (_value: number) => {}, reset: () => {} })
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const letters = gsap.utils.toArray<HTMLElement>('.displaced-char')
      const ease = { duration: 0.55, ease: 'power3.out' }
      const setters = letters.map((el) => ({
        y: gsap.quickTo(el, 'y', ease),
        r: gsap.quickTo(el, 'rotationZ', ease),
        wdth: gsap.quickTo(el, '--wdth', ease),
        wght: gsap.quickTo(el, '--wght', ease),
      }))
      api.current = {
        field: (value) => {
          if (reduced) return
          setters.forEach((set, i) => {
            const next = fieldFor(mode, i, letters.length, value)
            set.y(next.y)
            set.r(next.rotation)
            set.wdth(next.wdth)
            set.wght(next.wght)
          })
          root.current?.setAttribute('data-field', value.toFixed(2))
        },
        reset: () => {
          setters.forEach((set) => {
            set.y(0)
            set.r(0)
            set.wdth(100)
            set.wght(760)
          })
        },
      }
      if (replays && !reduced)
        gsap.fromTo(
          letters,
          { '--wdth': 62, rotationZ: 12, y: 65 },
          {
            '--wdth': 100,
            rotationZ: 0,
            y: 0,
            stagger: { each: 0.06, from: 'center' },
            duration: 1,
            ease: 'elastic.out(1,.6)',
          },
        )
    }, root)
    return () => {
      ctx.revert()
      api.current = { field: () => {}, reset: () => {} }
    }
  }, [mode, replays, reduced])
  return (
    <div ref={root}>
      <div
        className="type-displacement-stage"
        onPointerMove={(event) => {
          if (reduced) return
          const r = event.currentTarget.getBoundingClientRect(),
            value = (event.clientX - r.left) / r.width
          api.current.field(value)
          if (slider.current) slider.current.value = String(Math.round(value * 100))
        }}
        onPointerLeave={() => api.current.reset()}
      >
        <div className="type-baseline" aria-hidden="true" />
        <h3 className="displacement-word">
          <span className="sr-only">Waveform</span>
          <span aria-hidden="true">
            {[...word].map((letter, i) => (
              <span className="displaced-char" key={i}>
                {letter}
              </span>
            ))}
          </span>
        </h3>
        <span className="type-axis mono" aria-hidden="true">
          wdth 62–125 · wght 300–900
        </span>
      </div>
      <div className="type-field-controls">
        <div className="mode-select" role="group" aria-label="Displacement mode">
          {modes.map((item) => (
            <button
              type="button"
              aria-pressed={mode === item}
              key={item}
              onClick={() => setMode(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="field-range">
          <span className="mono">Field position</span>
          <input
            type="range"
            ref={slider}
            min="0"
            max="100"
            defaultValue="50"
            aria-label="Typography field position"
            onChange={(event) => api.current.field(Number(event.currentTarget.value) / 100)}
          />
        </label>
        <button
          type="button"
          className="text-control"
          onClick={() => {
            api.current.reset()
            setReplays((n) => n + 1)
            if (slider.current) slider.current.value = '50'
          }}
        >
          <RotateCcw size={14} aria-hidden="true" />
          Replay type
        </button>
      </div>
      <span role="status" className="sr-only">
        {replays ? `Type replay ${replays}` : ''}
      </span>
    </div>
  )
}
