import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, RotateCcw } from 'lucide-react'
import { useMotion } from '../motion'
import { advanceSpring, springSettled } from './physics'

const COLUMNS = 13
const ROWS = 7

/**
 * Magnetic field: a damped spring carries the core, and a field of slats
 * (iron-filing style) turns toward it, so the force is visible everywhere.
 */
export default function ElasticStudy() {
  const host = useRef<HTMLDivElement>(null)
  const controls = useRef({ kick: (_x: number, _y: number) => {}, reset: () => {} })
  const [impulses, setImpulses] = useState(0)
  const { reduced } = useMotion()
  useEffect(() => {
    const el = host.current
    if (!el) return
    const core = el.querySelector<HTMLElement>('.elastic-core')!,
      tether = el.querySelector<SVGPathElement>('.elastic-tether')!,
      readout = el.querySelector<HTMLElement>('.elastic-readout')!,
      filings = [...el.querySelectorAll<HTMLElement>('.filing')]
    let state = { x: 0, y: 0, vx: 0, vy: 0 },
      target = { x: 0, y: 0 },
      frame = 0,
      last = 0,
      visible = true,
      disposed = false,
      dragging = false
    let width = el.clientWidth || 600,
      height = el.clientHeight || 450
    let centres: { x: number; y: number }[] = []
    const measure = () => {
      width = el.clientWidth || 600
      height = el.clientHeight || 450
      centres = filings.map((f) => ({
        x: f.offsetLeft + f.offsetWidth / 2 - width / 2,
        y: f.offsetTop + f.offsetHeight / 2 - height / 2,
      }))
    }
    measure()
    const reach = () => Math.max(width, height) * 0.55
    const paint = () => {
      const speed = Math.min(1, Math.hypot(state.vx, state.vy) / 550)
      core.style.transform = `translate(${state.x}px,${state.y}px) scale(${1 + speed * 0.15},${1 - speed * 0.1})`
      const r = reach()
      for (let i = 0; i < filings.length; i++) {
        const dx = state.x - centres[i].x,
          dy = state.y - centres[i].y
        const distance = Math.hypot(dx, dy)
        const pull = Math.max(0, 1 - distance / r)
        filings[i].style.transform =
          `rotate(${Math.atan2(dy, dx)}rad) scaleX(${0.35 + pull * 1.15})`
        filings[i].style.opacity = String(0.22 + pull * 0.78)
      }
      const sx = (state.x * 600) / width,
        sy = (state.y * 450) / height
      tether.setAttribute(
        'd',
        `M 300 225 Q ${300 - sx * 0.5} ${225 + sy * 0.6} ${300 + sx} ${225 + sy}`,
      )
      readout.textContent = `Tension ${Math.round(Math.hypot(state.x, state.y)).toString().padStart(3, '0')}`
      el.dataset.position = `${state.x.toFixed(2)},${state.y.toFixed(2)}`
    }
    const draw = (now: number) => {
      frame = 0
      if (disposed || !visible || document.hidden) return
      state = reduced
        ? { x: 0, y: 0, vx: 0, vy: 0 }
        : advanceSpring(state, target, (now - (last || now)) / 1000 || 0.016)
      last = now
      paint()
      if (!reduced && !springSettled(state, target)) requestDraw()
    }
    function requestDraw() {
      if (!frame && !disposed && visible && !document.hidden) frame = requestAnimationFrame(draw)
    }
    const move = (event: PointerEvent) => {
      if (reduced || (event.pointerType === 'touch' && !dragging)) return
      const r = el.getBoundingClientRect()
      target = {
        x: Math.max(
          -width * 0.38,
          Math.min(width * 0.38, (event.clientX - r.left - r.width / 2) * 0.6),
        ),
        y: Math.max(
          -height * 0.36,
          Math.min(height * 0.36, (event.clientY - r.top - r.height / 2) * 0.6),
        ),
      }
      requestDraw()
    }
    const leave = () => {
      target = { x: 0, y: 0 }
      requestDraw()
    }
    const down = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return
      dragging = true
      const button = event.target instanceof Element ? event.target.closest('button') : null
      ;(button || el).setPointerCapture(event.pointerId)
      move(event)
    }
    const up = () => {
      dragging = false
      leave()
    }
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame)
        frame = 0
      } else {
        last = 0
        requestDraw()
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) {
        last = 0
        requestDraw()
      } else {
        cancelAnimationFrame(frame)
        frame = 0
      }
    })
    observer.observe(el)
    const resize = new ResizeObserver(() => {
      measure()
      paint()
    })
    resize.observe(el)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    document.addEventListener('visibilitychange', visibility)
    controls.current = {
      kick: (x, y) => {
        state.vx += x
        state.vy += y
        target = { x: 0, y: 0 }
        requestDraw()
      },
      reset: () => {
        state = { x: 0, y: 0, vx: 0, vy: 0 }
        target = { x: 0, y: 0 }
        paint()
      },
    }
    paint()
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      resize.disconnect()
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      document.removeEventListener('visibilitychange', visibility)
      core.style.transform = ''
      controls.current = { kick: () => {}, reset: () => {} }
    }
  }, [reduced])
  return (
    <>
      <div className="elastic-stage" ref={host}>
        <div className="filings" aria-hidden="true">
          {Array.from({ length: COLUMNS * ROWS }, (_, i) => (
            <span className="filing" key={i} />
          ))}
        </div>
        <svg
          viewBox="0 0 600 450"
          preserveAspectRatio="none"
          className="elastic-lines"
          aria-hidden="true"
        >
          <path className="elastic-tether" d="M300 225 L300 225" />
          <circle cx="300" cy="225" r="3" />
        </svg>
        <button
          className="elastic-core"
          type="button"
          aria-label="Pull — impulse the magnetic core"
          onClick={() => {
            controls.current.kick(620, -280)
            setImpulses((n) => n + 1)
          }}
          onKeyDown={(event) => {
            const map: Record<string, [number, number]> = {
              ArrowRight: [650, 0],
              ArrowLeft: [-650, 0],
              ArrowUp: [0, -650],
              ArrowDown: [0, 650],
            }
            if (map[event.key]) {
              event.preventDefault()
              controls.current.kick(...map[event.key])
              setImpulses((n) => n + 1)
            }
          }}
        >
          <span>Pull</span>
          <ArrowUpRight size={24} aria-hidden="true" />
        </button>
        <span className="elastic-anchor mono" aria-hidden="true">
          Rest position / 0,0
        </span>
        <span className="elastic-readout mono" aria-hidden="true">
          Tension 000
        </span>
      </div>
      <div className="study-controls">
        <span className="mono muted">Move close · drag on touch · arrow keys add force</span>
        <button
          type="button"
          className="text-control"
          onClick={() => {
            controls.current.reset()
            setImpulses(0)
          }}
        >
          <RotateCcw size={14} aria-hidden="true" />
          Reset physics
        </button>
      </div>
      <span className="sr-only" role="status">
        {impulses ? `Impulse ${impulses}${reduced ? '. Motion is disabled.' : ''}` : ''}
      </span>
    </>
  )
}
