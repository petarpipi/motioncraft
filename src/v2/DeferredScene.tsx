import { useEffect, useRef, useState } from 'react'
import type { PropsWithChildren } from 'react'
export default function DeferredScene({ children }: PropsWithChildren) {
  const host = useRef<HTMLDivElement>(null),
    [ready, setReady] = useState(false)
  useEffect(() => {
    const element = host.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true)
          observer.disconnect()
        }
      },
      { rootMargin: '400px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={host} className="deferred-scene">
      {ready ? children : null}
    </div>
  )
}
