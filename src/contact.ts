export type Brief = { name: string; email: string; project: string }
export type BriefErrors = Partial<Record<keyof Brief, string>>
export function validateBrief(brief: Brief): BriefErrors {
  const errors: BriefErrors = {}
  if (brief.name.trim().length < 2) errors.name = 'Please enter a name with at least 2 characters.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(brief.email.trim()))
    errors.email = 'Please enter a valid email address.'
  if (brief.project.trim().length < 20)
    errors.project = 'Tell us a little more (at least 20 characters).'
  return errors
}
