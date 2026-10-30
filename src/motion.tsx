import { createContext, useContext, useEffect, useState } from 'react'
import type { PropsWithChildren } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
// Mobile URL bars resize the viewport while scrolling; don't re-layout pins for that.
ScrollTrigger.config({ ignoreMobileResize: true })

/** 'auto' follows the operating system; 'on' / 'off' are explicit visitor choices. */
export type MotionPreference = 'auto' | 'on' | 'off'
export const MOTION_KEY = 'motioncraft:motion'

export function resolveReduced(preference: MotionPreference, systemReduced: boolean) {
  return preference === 'off' || (preference === 'auto' && systemReduced)
}

export function readPreference(): MotionPreference {
  try {
    const stored = localStorage.getItem(MOTION_KEY)
    if (stored === 'on' || stored === 'off' || stored === 'auto') return stored
    // V2.0 stored a boolean pause flag.
    if (localStorage.getItem('motioncraft:paused') === 'true') return 'off'
  } catch {
    /* Storage is optional. */
  }
  return 'auto'
}

const MotionContext = createContext({
  reduced: false,
  systemReduced: false,
  preference: 'auto' as MotionPreference,
  toggle: () => {},
})

export function MotionProvider({ children }: PropsWithChildren) {
  const [systemReduced, setSystemReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [preference, setPreference] = useState(readPreference)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setSystemReduced(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  const reduced = resolveReduced(preference, systemReduced)
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full'
  }, [reduced])
  const toggle = () => {
    // The button always flips what the visitor currently sees, even when the
    // current state comes from the operating system.
    const next: MotionPreference = reduced ? 'on' : 'off'
    try {
      localStorage.setItem(MOTION_KEY, next)
      localStorage.removeItem('motioncraft:paused')
    } catch {
      /* Storage is optional. */
    }
    setPreference(next)
  }
  return (
    <MotionContext value={{ reduced, systemReduced, preference, toggle }}>{children}</MotionContext>
  )
}
export const useMotion = () => useContext(MotionContext)
