import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowUpRight, Check } from 'lucide-react'
import { validateBrief } from '../contact'
import type { Brief, BriefErrors } from '../contact'
import { SectionLabel } from './Shared'

export default function ContactForm() {
  const [brief, setBrief] = useState<Brief>({ name: '', email: '', project: '' })
  const [errors, setErrors] = useState<BriefErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const form = useRef<HTMLFormElement>(null)
  const result = useRef<HTMLDivElement>(null)
  function submit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validateBrief(brief)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      const field = Object.keys(nextErrors)[0]
      form.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus()
      return
    }
    setSubmitted(true)
    requestAnimationFrame(() => result.current?.focus())
  }
  return (
    <section
      id="contact"
      className="contact-section section-pad"
      aria-labelledby="brief-title"
      data-reveal
    >
      <div>
        <SectionLabel number="THE NEXT CHAPTER">Start a conversation</SectionLabel>
        <h2 id="brief-title">
          Your idea.
          <br />
          <em>In motion.</em>
        </h2>
        <p>Thoughtful motion for ambitious digital experiences.</p>
        <div className="demo-disclosure">
          <span className="status-dot" />
          <p>
            <strong>A portfolio demonstration.</strong>
            <br />
            This form validates and prepares a simulated brief. Nothing is sent or stored. Please
            use fictional details.
          </p>
        </div>
      </div>
      {submitted ? (
        <div className="form-result" ref={result} tabIndex={-1} role="status">
          <Check size={34} aria-hidden="true" />
          <h3>That’s a promising start.</h3>
          <p>Demo brief prepared for {brief.name.trim()}.</p>
          <p className="muted">
            This was a simulated submission. No email was sent and no information was stored.
          </p>
          <button
            type="button"
            className="button secondary"
            onClick={() => {
              setSubmitted(false)
              setBrief({ name: '', email: '', project: '' })
              requestAnimationFrame(() => form.current?.querySelector('input')?.focus())
            }}
          >
            Try another brief <ArrowUpRight size={17} />
          </button>
        </div>
      ) : (
        <form ref={form} onSubmit={submit} noValidate className="contact-form">
          <label htmlFor="brief-name">
            Your name <span>(required)</span>
          </label>
          <input
            id="brief-name"
            name="name"
            autoComplete="off"
            placeholder="Alex Morgan"
            value={brief.name}
            maxLength={100}
            onChange={(event) => setBrief({ ...brief, name: event.target.value })}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            required
          />
          {errors.name && (
            <p id="name-error" className="field-error">
              {errors.name}
            </p>
          )}
          <label htmlFor="brief-email">
            Email address <span>(required)</span>
          </label>
          <input
            id="brief-email"
            name="email"
            type="email"
            autoComplete="off"
            placeholder="alex@example.com"
            maxLength={254}
            value={brief.email}
            onChange={(event) => setBrief({ ...brief, email: event.target.value })}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            required
          />
          {errors.email && (
            <p id="email-error" className="field-error">
              {errors.email}
            </p>
          )}
          <label htmlFor="brief-project">
            What would you like to move? <span>(required)</span>
          </label>
          <textarea
            id="brief-project"
            name="project"
            rows={3}
            maxLength={2000}
            placeholder="A little about your idea, the feeling, the ambition…"
            value={brief.project}
            onChange={(event) => setBrief({ ...brief, project: event.target.value })}
            aria-invalid={!!errors.project}
            aria-describedby={errors.project ? 'project-error' : undefined}
            required
          />
          {errors.project && (
            <p id="project-error" className="field-error">
              {errors.project}
            </p>
          )}
          <button type="submit" className="button">
            Preview demo brief <ArrowUpRight size={18} aria-hidden="true" />
          </button>
          <p className="form-note">SIMULATED SUBMISSION · NO BACKEND · NO DATA SENT</p>
        </form>
      )}
    </section>
  )
}
