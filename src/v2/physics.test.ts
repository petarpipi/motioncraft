import { describe, expect, it } from 'vitest'
import { advanceSpring, springSettled } from './physics'
describe('Damped elastic interaction', () => {
  it('keeps a resting body at rest', () => {
    const s = { x: 0, y: 0, vx: 0, vy: 0 }
    expect(advanceSpring(s, { x: 0, y: 0 }, 1 / 60)).toEqual(s)
    expect(springSettled(s, { x: 0, y: 0 })).toBe(true)
  })
  it('carries an impulse into a visible displacement', () => {
    const s = advanceSpring({ x: 0, y: 0, vx: 600, vy: -200 }, { x: 0, y: 0 }, 1 / 60)
    expect(s.x).toBeGreaterThan(5)
    expect(s.y).toBeLessThan(0)
    expect(springSettled(s, { x: 0, y: 0 })).toBe(false)
  })
  it('overshoots and returns to rest after an impulse', () => {
    let s = { x: 0, y: 0, vx: 600, vy: -200 },
      crossed = false
    for (let i = 0; i < 360; i++) {
      s = advanceSpring(s, { x: 0, y: 0 }, 1 / 60)
      if (s.x < 0) crossed = true
    }
    expect(crossed).toBe(true)
    expect(springSettled(s, { x: 0, y: 0 })).toBe(true)
  })
  it('tracks a moved target without a permanent loop', () => {
    let s = { x: 0, y: 0, vx: 0, vy: 0 }
    const target = { x: 80, y: -40 }
    for (let i = 0; i < 360; i++) s = advanceSpring(s, target, 1 / 60)
    expect(s.x).toBeCloseTo(80, 2)
    expect(s.y).toBeCloseTo(-40, 2)
    expect(springSettled(s, target)).toBe(true)
  })
  it('caps a long frame gap to keep the integration stable', () => {
    const s = { x: 20, y: 0, vx: 100, vy: 0 }
    expect(advanceSpring(s, { x: 0, y: 0 }, 5)).toEqual(advanceSpring(s, { x: 0, y: 0 }, 1 / 30))
  })
})
