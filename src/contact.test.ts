import { describe, expect, it } from 'vitest'
import { validateBrief } from './contact'

describe('Brief validation', () => {
  it('rejects all empty required fields', () =>
    expect(Object.keys(validateBrief({ name: '', email: '', project: '' }))).toEqual([
      'name',
      'email',
      'project',
    ]))
  it('rejects whitespace-only values', () =>
    expect(
      Object.keys(validateBrief({ name: '   ', email: '  ', project: '                        ' })),
    ).toHaveLength(3))
  it.each(['alex', 'alex@', '@example.com', 'alex@exa mple.com'])(
    'rejects invalid email %s',
    (email) =>
      expect(
        validateBrief({
          name: 'Alex',
          email,
          project: 'An interactive website for a small design studio.',
        }).email,
      ).toBeDefined(),
  )
  it('accepts a valid brief and trims surrounding spaces', () =>
    expect(
      validateBrief({
        name: ' Alex ',
        email: ' alex@example.com ',
        project: 'An interactive website for a small design studio.',
      }),
    ).toEqual({}))
})
