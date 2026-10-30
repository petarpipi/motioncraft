import type { PropsWithChildren } from 'react'

export function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      MOTIONCRAFT
      <span className="brand-period" aria-hidden="true">
        +
      </span>
    </span>
  )
}
export function SectionLabel({ number, children }: PropsWithChildren<{ number: string }>) {
  return (
    <p className="section-label">
      <span className="tiny-cross" aria-hidden="true">
        +
      </span>
      {number} / {children}
    </p>
  )
}
