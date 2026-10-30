import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import ContactForm from '../components/ContactForm'
import { ContourArt } from './Art'
const principles = [
  [
    '01',
    'FEELING FIRST.',
    'Motion begins with intention. The right movement can turn an interface into an experience people remember.',
  ],
  [
    '02',
    'MAKE IT RESPOND.',
    'A good interaction is a conversation. Give every input a considered response, with room for curiosity and surprise.',
  ],
  [
    '03',
    'CRAFT THE IN-BETWEEN.',
    'The transformation matters as much as the destination. Timing, tension and rhythm connect one moment to the next.',
  ],
  [
    '04',
    'RESPECT THE PERSON.',
    'Performance and accessibility are part of the creative work. Every experience has a quieter way in.',
  ],
]
export default function Studio() {
  return (
    <div className="studio-page">
      <section className="studio-heading pad">
        <span className="eyebrow">THE PRACTICE / DESIGN IN MOTION</span>
        <h1 tabIndex={-1}>
          NOTHING
          <br />
          BY <i>ACCIDENT.</i>
        </h1>
        <div className="studio-visual">
          <ContourArt />
          <span className="mono">INTENTION IN EVERY INTERACTION.</span>
        </div>
        <div className="studio-lead">
          <span className="mono">MOTIONCRAFT / AN INDEPENDENT EXPLORATION</span>
          <p>
            We work in the space
            <br />
            between <i>“what if”</i>
            <br />
            and <span className="muted">“what’s next.”</span>
          </p>
        </div>
      </section>
      <section className="studio-principles pad" id="principles">
        <div className="principles-title">
          <span className="eyebrow">A FEW THINGS WE BELIEVE.</span>
          <p>
            A practice of making the familiar
            <br />
            <span className="muted">feel a little less familiar.</span>
          </p>
        </div>
        {principles.map(([number, title, copy]) => (
          <article key={number}>
            <span className="mono">{number}</span>
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>
      <section className="studio-about pad">
        <span className="eyebrow">ABOUT THIS EXPLORATION</span>
        <p>
          MOTIONCRAFT is a self-initiated creative development portfolio. A space to explore
          real-time materials, choreographed scroll, expressive typography and responsive
          interaction.
        </p>
        <div>
          <span className="mono muted">REACT / TYPESCRIPT / GSAP / THREE.JS</span>
          <Link to="/experiences" className="arrow-link">
            Enter the playground <ArrowUpRight size={19} />
          </Link>
        </div>
      </section>
      <ContactForm />
    </div>
  )
}
