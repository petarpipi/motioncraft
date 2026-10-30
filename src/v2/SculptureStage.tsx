import { useEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { pickTier, sculptureStatus } from './sculpture/state'
import type { SculptureHandle } from './sculpture/engine'

declare global {
  interface Window {
    __sculpture?: SculptureHandle
  }
}

const whenIdle = (callback: () => void) => {
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(callback, { timeout: 700 })
    return () => window.cancelIdleCallback(id)
  }
  const id = setTimeout(callback, 120)
  return () => clearTimeout(id)
}

/**
 * One fixed, full-viewport canvas shared by the hero and the scroll cinema, so
 * the same form is carried from the opening into every scene. Initialised
 * after first paint; rendering stops once the intro + cinema leave the screen.
 */
export default function SculptureStage({ scope }: { scope: string }) {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = host.current
    if (!element) return
    let handle: SculptureHandle | undefined
    let cancelled = false
    let trigger: ScrollTrigger | undefined
    const stopIdle = whenIdle(() => {
      import('./sculpture/engine')
        .then(({ createSculpture }) =>
          createSculpture(
            element,
            pickTier({
              width: window.innerWidth,
              coarse: window.matchMedia('(pointer: coarse)').matches,
              cores: navigator.hardwareConcurrency || 4,
              dpr: window.devicePixelRatio || 1,
            }),
            () => sculptureStatus.set('failed'),
          ),
        )
        .then((created) => {
          if (cancelled) return created.dispose()
          handle = created
          if (import.meta.env.DEV) window.__sculpture = created
          trigger = ScrollTrigger.create({
            trigger: scope,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) => {
              created.setActive(self.isActive)
              element.dataset.active = String(self.isActive)
            },
          })
          element.dataset.active = String(trigger.isActive)
          created.setActive(trigger.isActive)
          sculptureStatus.set('ready')
        })
        .catch(() => {
          if (!cancelled) sculptureStatus.set('failed')
        })
    })
    return () => {
      cancelled = true
      stopIdle()
      trigger?.kill()
      handle?.dispose()
      if (window.__sculpture === handle) delete window.__sculpture
      sculptureStatus.set('idle')
    }
  }, [scope])
  return <div className="sculpture-stage" ref={host} aria-hidden="true" />
}
