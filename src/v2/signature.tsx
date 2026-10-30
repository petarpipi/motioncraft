import type { CSSProperties } from 'react'

/**
 * The MOTIONCRAFT signature: a set of slats. The 3D sculpture is built from
 * them, the route curtain closes and opens with them, and every cinema scene
 * changes through them. Only transforms are animated.
 */
export function Slats({
  count,
  axis,
  className = '',
}: {
  count: number
  axis: 'rows' | 'columns'
  className?: string
}) {
  return (
    <div className={`slats slats-${axis} ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} style={{ '--i': i } as CSSProperties} />
      ))}
    </div>
  )
}

/** Splits text into per-character spans for choreography; screen readers get the label. */
export function SplitChars({ text, className = 'char' }: { text: string; className?: string }) {
  return (
    <>
      {[...text].map((char, i) => (
        <span className={className} key={i} aria-hidden="true">
          {char === ' ' ? ' ' : char}
        </span>
      ))}
    </>
  )
}
