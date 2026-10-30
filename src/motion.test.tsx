import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MOTION_KEY, MotionProvider, readPreference, resolveReduced, useMotion } from './motion'

function Probe() {
  const { reduced, toggle } = useMotion()
  return (
    <button type="button" aria-pressed={reduced} onClick={toggle}>
      Reduce motion
    </button>
  )
}

describe('Motion preference', () => {
  it('follows the system only while the visitor has not chosen', () => {
    expect(resolveReduced('auto', true)).toBe(true)
    expect(resolveReduced('auto', false)).toBe(false)
    expect(resolveReduced('on', true)).toBe(false)
    expect(resolveReduced('off', false)).toBe(true)
  })
  it('migrates the V2.0 pause flag', () => {
    localStorage.setItem('motioncraft:paused', 'true')
    expect(readPreference()).toBe('off')
  })
  it('lets the toggle turn motion on even when the OS asks for reduced motion', async () => {
    // test-setup reports prefers-reduced-motion: reduce.
    const user = userEvent.setup()
    render(
      <MotionProvider>
        <Probe />
      </MotionProvider>,
    )
    const button = screen.getByRole('button', { name: 'Reduce motion' })
    expect(button).toHaveAttribute('aria-pressed', 'true')
    await user.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(localStorage.getItem(MOTION_KEY)).toBe('on')
    expect(document.documentElement.dataset.motion).toBe('full')
    await user.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement.dataset.motion).toBe('reduced')
  })
})
