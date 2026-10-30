// Shared, framework-free state for the slat sculpture. GSAP tweens these plain
// numbers directly; the render loop reads them every frame, so scroll and
// intro choreography never cause React renders.

export type SculptureState = {
  /** Horizontal offset as a fraction of the viewport width (0 = centre). */
  x: number
  /** Vertical offset as a fraction of the viewport height (positive = up). */
  y: number
  scale: number
  /** 0 = twisted column, 1 = fan, 2 = iris ring. */
  morph: number
  /** 0 = scattered slats, 1 = assembled. */
  assemble: number
  /** Column twist in radians across its full height. */
  coil: number
  /** Extra rotation added by the Twist control. */
  spin: number
}

export const SCULPTURE_DEFAULTS: Readonly<SculptureState> = {
  x: 0,
  y: 0,
  scale: 1,
  morph: 0,
  assemble: 0,
  coil: 3.3,
  spin: 0,
}

export const sculptureState: SculptureState = { ...SCULPTURE_DEFAULTS }

export function resetSculptureState(overrides: Partial<SculptureState> = {}) {
  Object.assign(sculptureState, SCULPTURE_DEFAULTS, overrides)
}

export type SculptureStatus = 'idle' | 'ready' | 'failed'
let status: SculptureStatus = 'idle'
const listeners = new Set<() => void>()
export const sculptureStatus = {
  get: () => status,
  set(next: SculptureStatus) {
    if (next === status) return
    status = next
    listeners.forEach((listener) => listener())
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}

/** Impulses (taps, Twist, scroll) are queued here and consumed by the engine. */
export const sculptureInput = {
  pending: 0,
  at: 0.5,
  pluck(strength: number, at = 0.5) {
    this.pending = Math.min(1.6, this.pending + strength)
    this.at = Math.min(1, Math.max(0, at))
  },
}

export type Tier = { name: 'high' | 'mid' | 'low'; blades: number; dpr: number; antialias: boolean }
export function pickTier({
  width,
  coarse,
  cores,
  dpr,
}: {
  width: number
  coarse: boolean
  cores: number
  dpr: number
}): Tier {
  if (coarse || width < 768 || cores <= 4)
    return { name: 'low', blades: 26, dpr: Math.min(dpr, 1.25), antialias: false }
  if (width < 1200) return { name: 'mid', blades: 34, dpr: Math.min(dpr, 1.35), antialias: true }
  return { name: 'high', blades: 40, dpr: Math.min(dpr, 1.6), antialias: true }
}

/**
 * Returns the scene index for a timeline time, given the times at which each
 * subsequent scene becomes the dominant one. Used to keep captions in step
 * with the visuals rather than with raw scroll thirds.
 */
export function sceneAt(time: number, boundaries: readonly number[]) {
  let scene = 0
  for (const boundary of boundaries) if (time >= boundary) scene++
  return scene
}
