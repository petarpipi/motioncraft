import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation, useNavigationType } from 'react-router-dom'
import { ArrowUp, ArrowUpRight, Menu, Pause, Play, X } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Brand } from './components/Shared'
import ErrorBoundary, { RouteErrorFallback } from './components/ErrorBoundary'
import { contactHref } from './config'
import { useMotion } from './motion'
import { Slats } from './v2/signature'
import Home from './v2/Home'

const Experiences = lazy(() => import('./v2/Experiences'))
const Studio = lazy(() => import('./v2/Studio'))
const positions = new Map<string, number>()

export const routeMeta: Record<string, { title: string; description: string; word: string }> = {
  '/': {
    title: 'Beyond static',
    word: 'BEYOND.',
    description:
      'MOTIONCRAFT — a creative development portfolio: a real-time WebGL slat sculpture, scroll-directed GSAP cinema and kinetic variable type.',
  },
  '/experiences': {
    title: 'The interactive playground',
    word: 'PLAY.',
    description:
      'Four practical interaction studies: magnetic spring physics, a GLSL liquid surface, a variable-font type field and a CSS 3D depth gallery.',
  },
  '/studio': {
    title: 'The studio',
    word: 'INTENT.',
    description:
      'The principles behind MOTIONCRAFT: motion with intention, measured performance and accessible alternatives for every interaction.',
  },
}
const notFound = {
  title: 'Page not found',
  word: 'LOST.',
  description: 'This page is off the timeline.',
}

function RouteFrame() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const initialKey = useRef(location.key)
  const hasNavigated = useRef(false)
  const frame = useRef<HTMLDivElement>(null)
  const { reduced } = useMotion()
  const meta = routeMeta[location.pathname] ?? notFound
  // Signature transition: slats sweep away from the centre while the word lifts.
  useLayoutEffect(() => {
    if (reduced || (location.key === initialKey.current && !hasNavigated.current)) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          onComplete: () => {
            gsap.set('.route-curtain', { visibility: 'hidden' })
            ScrollTrigger.refresh()
          },
        })
        .set('.route-curtain', { visibility: 'visible' })
        .fromTo(
          '.route-curtain .slats > span',
          { scaleY: 1 },
          {
            scaleY: 0,
            duration: 0.7,
            ease: 'power3.inOut',
            stagger: { each: 0.035, from: 'center' },
          },
          0.12,
        )
        .fromTo(
          '.curtain-char',
          { yPercent: 0 },
          { yPercent: -120, duration: 0.5, stagger: 0.02, ease: 'power3.in' },
          0,
        )
    }, frame)
    return () => ctx.revert()
  }, [location.key, reduced])
  useLayoutEffect(() => {
    const key = location.key
    if (key !== initialKey.current) hasNavigated.current = true
    const isFirst = !hasNavigated.current
    document.title = `MOTIONCRAFT — ${meta.title}`
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description)
    // Lazy route chunks may resolve after this effect. Observe until the page heading exists.
    const settle = () => {
      const heading = frame.current?.querySelector<HTMLElement>('h1')
      if (!heading) return false
      if (!isFirst) heading.focus({ preventScroll: true })
      if (location.hash) {
        let anchor = location.hash.slice(1)
        try {
          anchor = decodeURIComponent(anchor)
        } catch {
          /* Malformed hashes are plain IDs. */
        }
        document.getElementById(anchor)?.scrollIntoView({ behavior: 'instant' })
      } else
        window.scrollTo({
          top: navigationType === 'POP' ? (positions.get(key) ?? 0) : 0,
          behavior: 'instant',
        })
      ScrollTrigger.refresh()
      return true
    }
    const observer = new MutationObserver(() => {
      if (settle()) observer.disconnect()
    })
    if (!settle() && frame.current)
      observer.observe(frame.current, { childList: true, subtree: true })
    return () => {
      positions.set(key, window.scrollY)
      observer.disconnect()
    }
  }, [location.key, location.pathname, location.hash, navigationType, meta])
  return (
    <div ref={frame} className="route-frame">
      <div
        className={`route-curtain curtain-${location.pathname === '/studio' ? 'studio' : 'play'}`}
        aria-hidden="true"
      >
        <Slats count={9} axis="columns" />
        <span className="mono curtain-label">MOTIONCRAFT / Change of perspective</span>
        <div className="curtain-word">
          {[...meta.word].map((letter, i) => (
            <span className="curtain-char" key={i}>
              {letter}
            </span>
          ))}
        </div>
      </div>
      <ErrorBoundary key={location.pathname} name="route" fallback={<RouteErrorFallback />}>
        <Suspense
          fallback={
            <div className="route-loading" role="status">
              Preparing the experience…
            </div>
          }
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/studio" element={<Studio />} />
            <Route
              path="*"
              element={
                <div className="not-found section-pad">
                  <p className="eyebrow">404 / Off the timeline</p>
                  <h1 tabIndex={-1}>
                    A little out
                    <br />
                    <i>of motion.</i>
                  </h1>
                  <Link className="button" to="/">
                    Back to home <ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

function MobileMenu({ onClose }: { onClose: (restoreFocus: boolean) => void }) {
  const nav = useRef<HTMLElement>(null)
  useEffect(() => {
    const outside = [document.getElementById('main'), document.querySelector('.site-footer')]
    outside.forEach((el) => el?.setAttribute('inert', ''))
    nav.current?.querySelector<HTMLElement>('a')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose(true)
      if (event.key !== 'Tab' || !nav.current) return
      const items = [...document.querySelectorAll<HTMLElement>('.menu-button, #mobile-menu a')]
      const index = items.indexOf(document.activeElement as HTMLElement)
      const next = event.shiftKey ? index - 1 : index + 1
      if (next < 0 || next >= items.length) {
        event.preventDefault()
        items[event.shiftKey ? items.length - 1 : 0].focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      outside.forEach((el) => el?.removeAttribute('inert'))
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])
  const cta = contactHref()
  return (
    <nav id="mobile-menu" className="mobile-nav" aria-label="Mobile navigation" ref={nav}>
      <NavLink to="/" end>
        Home <span>01</span>
      </NavLink>
      <NavLink to="/experiences">
        Experiences <span>02</span>
      </NavLink>
      <NavLink to="/studio">
        Studio <span>03</span>
      </NavLink>
      {cta.external ? (
        <a href={cta.href} target="_blank" rel="noreferrer">
          Let’s talk <ArrowUpRight aria-hidden="true" />
        </a>
      ) : (
        <Link to={cta.href}>
          Let’s talk <ArrowUpRight aria-hidden="true" />
        </Link>
      )}
    </nav>
  )
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const menuButton = useRef<HTMLButtonElement>(null)
  const { reduced, systemReduced, preference, toggle } = useMotion()
  useEffect(() => setMenuOpen(false), [location])
  const closeMenu = useRef((restoreFocus: boolean) => {
    setMenuOpen(false)
    if (restoreFocus) menuButton.current?.focus()
  }).current
  const cta = contactHref()
  const motionNote = preference === 'auto' && systemReduced ? ' (system setting)' : ''
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <Link to="/" aria-label="MOTIONCRAFT home">
          <Brand />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/experiences">
            Experiences <span aria-hidden="true">04</span>
          </NavLink>
          <NavLink to="/studio">Studio</NavLink>
        </nav>
        <div className="header-actions">
          <button
            className="motion-toggle"
            type="button"
            onClick={toggle}
            title={reduced ? 'Select to turn motion on.' : 'Select to turn motion off.'}
          >
            {reduced ? (
              <Play size={14} aria-hidden="true" />
            ) : (
              <Pause size={14} aria-hidden="true" />
            )}
            {/* The visible state is the accessible name (WCAG 2.5.3 label in name). */}
            <span>
              <span className="motion-word">Motion </span>
              {reduced ? 'off' : 'on'}
            </span>
            {motionNote && <span className="sr-only">{motionNote}</span>}
          </button>
          {cta.external ? (
            <a href={cta.href} className="header-contact" target="_blank" rel="noreferrer">
              Let’s talk <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          ) : (
            <Link to={cta.href} className="header-contact">
              Let’s talk <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          )}
          <button
            type="button"
            ref={menuButton}
            className="menu-button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => (menuOpen ? closeMenu(true) : setMenuOpen(true))}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
        {menuOpen && <MobileMenu onClose={closeMenu} />}
      </header>
      <main id="main" tabIndex={-1}>
        <RouteFrame />
      </main>
      <footer className="site-footer section-pad">
        <div className="footer-main">
          <Link to="/" aria-label="MOTIONCRAFT home">
            <Brand />
          </Link>
          <p>
            Independent by design.
            <br />
            <i>Expressive by nature.</i>
          </p>
          <nav aria-label="Footer navigation">
            <Link to="/">Home</Link>
            <Link to="/experiences">Experiences</Link>
            <Link to="/studio">Studio</Link>
          </nav>
          <button
            type="button"
            className="back-top"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' })
              document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true })
            }}
          >
            Back to top <ArrowUp size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="footer-word" aria-hidden="true">
          {[...'MOTIONCRAFT'].map((letter, i) => (
            <span key={i}>{letter}</span>
          ))}
        </div>
        <div className="footer-bottom mono">
          <span>© 2026 MOTIONCRAFT</span>
          <span>React · GSAP · Three.js · GLSL</span>
          <span>Self-initiated portfolio demo</span>
        </div>
      </footer>
    </>
  )
}
