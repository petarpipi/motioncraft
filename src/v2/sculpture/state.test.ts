import { describe, expect, it } from 'vitest'
import {
  pickTier,
  resetSculptureState,
  SCULPTURE_DEFAULTS,
  sceneAt,
  sculptureInput,
  sculptureState,
} from './state'
import { CINEMA_SCENE_BOUNDARIES } from '../ScrollCinema'

describe('Sculpture quality tiers', () => {
  it('uses fewer slats, no MSAA and a capped pixel ratio on phones', () => {
    const tier = pickTier({ width: 390, coarse: true, cores: 8, dpr: 3 })
    expect(tier).toEqual({ name: 'low', blades: 26, dpr: 1.25, antialias: false })
  })
  it('treats low-core desktops as low power', () => {
    expect(pickTier({ width: 1600, coarse: false, cores: 4, dpr: 1 }).name).toBe('low')
  })
  it('caps desktop pixel ratio at 1.6', () => {
    const tier = pickTier({ width: 1920, coarse: false, cores: 12, dpr: 2 })
    expect(tier.name).toBe('high')
    expect(tier.dpr).toBe(1.6)
    expect(tier.blades).toBe(40)
  })
  it('uses a middle tier for tablets and small laptops', () => {
    expect(pickTier({ width: 1024, coarse: false, cores: 8, dpr: 2 })).toMatchObject({
      name: 'mid',
      dpr: 1.35,
    })
  })
})

describe('Scene captions follow the timeline', () => {
  it('maps timeline time to the dominant scene, not to scroll thirds', () => {
    expect(sceneAt(0, CINEMA_SCENE_BOUNDARIES)).toBe(0)
    // 3.0 is beyond a third of the 10.2s timeline but the acid shutter has only just closed.
    expect(sceneAt(2.7, CINEMA_SCENE_BOUNDARIES)).toBe(0)
    expect(sceneAt(3.0, CINEMA_SCENE_BOUNDARIES)).toBe(1)
    expect(sceneAt(5.8, CINEMA_SCENE_BOUNDARIES)).toBe(1)
    expect(sceneAt(6.8, CINEMA_SCENE_BOUNDARIES)).toBe(2)
    expect(sceneAt(10.2, CINEMA_SCENE_BOUNDARIES)).toBe(2)
  })
})

describe('Shared sculpture state', () => {
  it('resets every tweened value before a new page builds its timelines', () => {
    Object.assign(sculptureState, { morph: 2, x: 0.4, spin: 9, assemble: 1 })
    resetSculptureState()
    expect(sculptureState).toEqual(SCULPTURE_DEFAULTS)
  })
  it('accumulates and clamps impulses from taps and scrolling', () => {
    sculptureInput.pending = 0
    sculptureInput.pluck(1, 1.4)
    sculptureInput.pluck(1, 0.3)
    expect(sculptureInput.pending).toBe(1.6)
    expect(sculptureInput.at).toBe(0.3)
    sculptureInput.pluck(0, 2)
    expect(sculptureInput.at).toBe(1)
    sculptureInput.pending = 0
  })
})
