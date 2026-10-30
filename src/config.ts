// Public contact routes for the portfolio. Fill these in before publishing;
// while both are empty, calls to action fall back to the simulated brief form.
export const contact = {
  /** e.g. https://www.upwork.com/freelancers/~yourprofile */
  upworkUrl: '',
  /** e.g. hello@example.com */
  email: '',
}

export function contactHref() {
  if (contact.upworkUrl) return { href: contact.upworkUrl, external: true }
  if (contact.email) return { href: `mailto:${contact.email}`, external: true }
  return { href: '/studio#contact', external: false }
}
