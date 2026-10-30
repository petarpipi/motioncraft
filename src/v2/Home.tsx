import { lazy, Suspense, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useMotion } from '../motion'
import ErrorBoundary from '../components/ErrorBoundary'
import ContactCta from '../components/ContactCta'
import Hero from './Hero'
import ScrollCinema from './ScrollCinema'
import HorizontalShowcase from './HorizontalShowcase'
import { resetSculptureState } from './sculpture/state'
import { studies } from './studies'
const SculptureStage = lazy(() => import('./SculptureStage'))

export default function Home() {
  const { reduced } = useMotion()
  // Reset before children's layout effects build their timelines on this state.
  useState(() => resetSculptureState())
  return (
    <div className="home">
      {!reduced && (
        <ErrorBoundary fallback={null} name="sculpture">
          <Suspense fallback={null}>
            <SculptureStage scope="#home-intro" />
          </Suspense>
        </ErrorBoundary>
      )}
      <div id="home-intro">
        <Hero />
        <ScrollCinema />
      </div>
      <HorizontalShowcase />
      <section className="studies-index pad" aria-labelledby="studies-heading">
        <div className="studies-index-head">
          <span className="eyebrow">03 / Practical studies</span>
          <h2 id="studies-heading">
            Built for <i>real</i> briefs.
          </h2>
          <p>
            Each study is a pattern clients ask for — isolated, measurable and usable by keyboard,
            touch and reduced motion.
          </p>
        </div>
        <ol className="studies-list">
          {studies.map((study) => (
            <li key={study.id}>
              <Link to={`/experiences#${study.id}`}>
                <span className="mono">{study.index}</span>
                <span className="studies-name">{study.name}</span>
                <span className="studies-use">{study.use}</span>
                <span className="studies-tech mono">{study.tech}</span>
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
      </section>
      <ContactCta eyebrow="Have something in mind?" lines={['Let’s make', 'something', 'move.']} />
    </div>
  )
}
