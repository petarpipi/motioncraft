import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { contactHref } from '../config'
import { Slats } from '../v2/signature'

export default function ContactCta({ eyebrow, lines }: { eyebrow: string; lines: string[] }) {
  const target = contactHref()
  const label = (
    <>
      <span>{lines[0]}</span>
      <span>
        <i>{lines[1]}</i> {lines[2]}
      </span>
      <ArrowUpRight aria-hidden="true" />
    </>
  )
  return (
    <section className="closing-cta pad">
      <Slats count={7} axis="columns" className="cta-slats" />
      <span className="eyebrow">{eyebrow}</span>
      {target.external ? (
        <a href={target.href} target="_blank" rel="noreferrer">
          {label}
        </a>
      ) : (
        <Link to={target.href}>{label}</Link>
      )}
      <div className="mono closing-meta">
        <span>Thoughtful motion. Measured performance.</span>
        <span>Independent portfolio / 2026</span>
      </div>
    </section>
  )
}
