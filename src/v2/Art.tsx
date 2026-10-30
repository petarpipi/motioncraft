import { useId } from 'react'
const lines = Array.from({ length: 62 }, (_, i) => {
  const points = Array.from({ length: 101 }, (_, j) => {
    const x = j * 10,
      y = 80 + i * 11
    const distance = Math.hypot((x - 500) * 0.9, (y - 400) * 1.25)
    const bend = Math.sin(distance * 0.019 + i * 0.035) * Math.max(0, 190 - distance * 0.38)
    return `${j ? 'L' : 'M'}${x.toFixed(1)} ${(y + bend).toFixed(1)}`
  }).join(' ')
  return points
})
export function ContourArt({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`contour-art ${className}`}
      viewBox="0 0 1000 820"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      {lines.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="1.5" />
      ))}
    </svg>
  )
}
export function SphereArt() {
  const id = useId().replaceAll(':', '')
  return (
    <svg viewBox="0 0 800 800" className="sphere-art" aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <circle cx="400" cy="400" r="290" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} fill="none" stroke="currentColor" strokeWidth="2">
        {Array.from({ length: 35 }, (_, i) => (
          <ellipse
            key={i}
            cx="400"
            cy="400"
            rx={18 + i * 8.2}
            ry="290"
            transform={`rotate(${i * 2} 400 400)`}
          />
        ))}
        {Array.from({ length: 26 }, (_, i) => (
          <ellipse key={i} cx="400" cy={130 + i * 22} rx="290" ry={Math.abs(13 - i) * 4 + 8} />
        ))}
      </g>
    </svg>
  )
}
