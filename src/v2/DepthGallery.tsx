import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import gsap from 'gsap'
import { useMotion } from '../motion'
const artworks = [
  { name: 'Louvred iris', src: '/art/sculpture-ring.webp', tag: 'SCULPTURE / 001' },
  { name: 'Liquid surface', src: '/art/liquid.webp', tag: 'SHADER / 002' },
  { name: 'Interference field', src: '/art/field.svg', tag: 'GENERATIVE / 003' },
]
export default function DepthGallery() {
  const [active, setActive] = useState(1)
  const stack = useRef<HTMLDivElement>(null)
  const { reduced } = useMotion()
  const setters = useRef<{ x?: gsap.QuickToFunc; y?: gsap.QuickToFunc }>({})
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      setters.current = {
        x: gsap.quickTo(stack.current, 'rotationY', { duration: 0.65, ease: 'power3.out' }),
        y: gsap.quickTo(stack.current, 'rotationX', { duration: 0.65, ease: 'power3.out' }),
      }
    })
    return () => {
      ctx.revert()
      setters.current = {}
    }
  }, [reduced])
  const change = (delta: number) => setActive((value) => (value + delta + 3) % 3)
  return (
    <>
      <div
        className="depth-gallery-stage"
        onPointerMove={(event) => {
          if (reduced || event.pointerType !== 'mouse') return
          const r = event.currentTarget.getBoundingClientRect()
          setters.current.x?.(((event.clientX - r.left) / r.width - 0.5) * 20)
          setters.current.y?.(-((event.clientY - r.top) / r.height - 0.5) * 14)
        }}
        onPointerLeave={() => {
          setters.current.x?.(0)
          setters.current.y?.(0)
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            change(1)
          }
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            change(-1)
          }
        }}
      >
        <div className="gallery-horizon" aria-hidden="true" />
        <div className="depth-image-stack" ref={stack}>
          {artworks.map((art, index) => {
            const slot = (index - active + 3) % 3
            return (
              <button
                type="button"
                className={`depth-image depth-slot-${slot}`}
                key={art.name}
                aria-pressed={active === index}
                onClick={() => setActive(index)}
              >
                <img src={art.src} alt="" loading="lazy" width="700" height="700" />
                <span className="mono">{art.tag}</span>
                <span>{art.name}</span>
              </button>
            )
          })}
        </div>
        <span className="depth-coordinate mono" aria-hidden="true">
          PERSPECTIVE / 1200
        </span>
      </div>
      <div className="depth-gallery-controls">
        <button
          type="button"
          className="icon-button"
          aria-label="Previous depth image"
          onClick={() => change(-1)}
        >
          <ArrowLeft />
        </button>
        <span role="status" className="mono">
          0{active + 1} / {artworks[active].name}
        </span>
        <button
          type="button"
          className="icon-button"
          aria-label="Next depth image"
          onClick={() => change(1)}
        >
          <ArrowRight />
        </button>
        <button
          type="button"
          className="text-control"
          onClick={() => {
            setActive(1)
            setters.current.x?.(0)
            setters.current.y?.(0)
          }}
        >
          <RotateCcw size={14} />
          Reset depth
        </button>
      </div>
    </>
  )
}
