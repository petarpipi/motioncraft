import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { MotionProvider } from '../motion'
import ElasticStudy from './ElasticStudy'
import TypeDisplacement, { fieldFor } from './TypeDisplacement'
import DepthGallery from './DepthGallery'
import ContactForm from '../components/ContactForm'
describe('Non-pointer alternatives', () => {
  it('drives the variable font axes in Width mode', () => {
    const centre = fieldFor('Width', 4, 9, 0.5)
    expect(centre.wdth).toBeCloseTo(125)
    expect(centre.wght).toBeCloseTo(900)
    expect(fieldFor('Width', 0, 9, 0.5).wdth).toBe(62)
    expect(fieldFor('Wave', 4, 9, 0.5)).toMatchObject({ wdth: 100, rotation: 0 })
  })
  it('announces elastic impulses and resets in reduced motion', async () => {
    const user = userEvent.setup()
    render(
      <MotionProvider>
        <ElasticStudy />
      </MotionProvider>,
    )
    const button = screen.getByRole('button', { name: /impulse the magnetic core/ })
    await user.click(button)
    expect(screen.getByRole('status')).toHaveTextContent('Impulse 1. Motion is disabled.')
    button.focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('status')).toHaveTextContent('Impulse 2')
    await user.click(screen.getByRole('button', { name: 'Reset physics' }))
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })
  it('offers selectable type modes, an accessible field slider and replay', async () => {
    const user = userEvent.setup()
    render(
      <MotionProvider>
        <TypeDisplacement />
      </MotionProvider>,
    )
    expect(screen.getByRole('heading', { name: 'Waveform' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Width' }))
    expect(screen.getByRole('button', { name: 'Width' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('slider', { name: 'Typography field position' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Replay type' }))
    expect(screen.getByRole('status')).toHaveTextContent('Type replay 1')
  })
  it('cycles the depth collection and restores the selected image', async () => {
    const user = userEvent.setup()
    render(
      <MotionProvider>
        <DepthGallery />
      </MotionProvider>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Liquid surface')
    await user.click(screen.getByRole('button', { name: 'Next depth image' }))
    expect(screen.getByRole('status')).toHaveTextContent('Interference field')
    expect(screen.getByRole('button', { name: /GENERATIVE.*Interference field/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.click(screen.getByRole('button', { name: 'Reset depth' }))
    expect(screen.getByRole('status')).toHaveTextContent('Liquid surface')
  })
})
describe('Retained honest enquiry', () => {
  it('focuses the first invalid field with associated errors', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.click(screen.getByRole('button', { name: /Preview demo brief/ }))
    expect(screen.getByLabelText(/Your name/)).toHaveFocus()
    expect(screen.getByLabelText(/Email address/)).toHaveAccessibleDescription(
      'Please enter a valid email address.',
    )
  })
  it('validates, discloses a simulation and resets', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.type(screen.getByLabelText(/Your name/), 'Alex Example')
    await user.type(screen.getByLabelText(/Email address/), 'alex@example.com')
    await user.type(
      screen.getByLabelText(/What would/),
      'A cinematic creative development portfolio.',
    )
    await user.click(screen.getByRole('button', { name: /Preview demo brief/ }))
    expect(screen.getByRole('status')).toHaveTextContent('No email was sent')
    await user.click(screen.getByRole('button', { name: /Try another brief/ }))
    expect(screen.getByLabelText(/Your name/)).toHaveValue('')
  })
})
