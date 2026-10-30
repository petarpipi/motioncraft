import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ErrorBoundary, { RouteErrorFallback } from './ErrorBoundary'

function Broken(): never {
  throw new Error('WebGL exploded')
}

describe('ErrorBoundary', () => {
  it('replaces a failing scene with its fallback instead of blanking the page', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <main>
        <p>Surrounding content</p>
        <ErrorBoundary name="test" fallback={<RouteErrorFallback />}>
          <Broken />
        </ErrorBoundary>
      </main>,
    )
    expect(screen.getByText('Surrounding content')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('This scene failed to load.')
    expect(screen.getByRole('button', { name: 'Reload the page' })).toBeInTheDocument()
  })
  it('renders children when nothing fails', () => {
    render(
      <ErrorBoundary name="test" fallback={<p>fallback</p>}>
        <p>healthy</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('healthy')).toBeInTheDocument()
  })
})
