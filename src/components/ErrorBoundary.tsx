import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

type Props = { children: ReactNode; fallback: ReactNode; name: string }

/** Keeps a failing scene or lazy route from blanking the whole application. */
export default class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn(`[motioncraft] ${this.props.name} failed`, error, info.componentStack)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export function RouteErrorFallback() {
  return (
    <div className="route-error section-pad" role="alert">
      <p className="eyebrow">Something interrupted the motion</p>
      <h1 tabIndex={-1}>This scene failed to load.</h1>
      <p>A network hiccup or an outdated cached file is the usual cause.</p>
      <button type="button" className="button" onClick={() => window.location.reload()}>
        Reload the page
      </button>
    </div>
  )
}
