import { Link } from 'react-router-dom'
import { FiArrowRight, FiTarget, FiHeart, FiAward, FiUsers, FiCode, FiZap, FiGlobe, FiCheck, FiCpu } from 'react-icons/fi'
import { technologies, stats } from '../data/content'
import './About.css'
import './shared-pages.css'

const team = [
  { name: 'Alex Morgan', role: 'CEO & Founder', initials: 'AM', color: 'from-indigo-500 to-purple-500' },
  { name: 'Sarah Chen', role: 'CTO', initials: 'SC', color: 'from-cyan-500 to-blue-500' },
  { name: 'Marcus Johnson', role: 'Head of Design', initials: 'MJ', color: 'from-pink-500 to-rose-500' },
  { name: 'Priya Patel', role: 'Lead Developer', initials: 'PP', color: 'from-amber-500 to-orange-500' },
  { name: 'David Kim', role: 'DevOps Engineer', initials: 'DK', color: 'from-emerald-500 to-teal-500' },
  { name: 'Emma Wilson', role: 'Project Manager', initials: 'EW', color: 'from-sky-500 to-indigo-500' },
]

const values = [
  {
    icon: <FiTarget />,
    title: 'Results-Driven',
    desc: 'We focus on outcomes, not output. Every line of code serves a business goal.'
  },
  {
    icon: <FiHeart />,
    title: 'Customer First',
    desc: 'Your success is our success. We build relationships, not just software.'
  },
  {
    icon: <FiAward />,
    title: 'Quality Always',
    desc: 'We never ship work we are not proud of. Excellence is non-negotiable.'
  },
  {
    icon: <FiZap />,
    title: 'Move Fast',
    desc: 'Agile sprints, daily updates, and a bias for action. No endless meetings.'
  }
]

const milestones = [
  { year: '2018', title: 'Founded', desc: 'Started in a small garage with a big vision.' },
  { year: '2020', title: '100 Projects', desc: 'Reached our 100th successful launch.' },
  { year: '2022', title: 'Global Team', desc: 'Expanded to 25+ team members across 6 countries.' },
  { year: '2024', title: 'AWS Partner', desc: 'Became an official AWS Select Tier partner.' },
  { year: '2026', title: '500+ Projects', desc: 'Now serving 150+ happy clients worldwide.' }
]

export default function About() {
  return (
    <div className="about-page">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">About CODE TECH</span>
          <h1>We're builders, dreamers, and <span className="gradient-text">tech enthusiasts</span></h1>
          <p>For over 7 years, we've been helping businesses of all sizes launch, scale, and succeed online. From scrappy startups to Fortune 500s, we bring the same passion to every project.</p>
        </div>
      </section>

      {/* Mission */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-visual">
              <div className="mission-card">
                <FiCode />
                <span>Code</span>
              </div>
              <div className="mission-card delay-1">
                <FiGlobe />
                <span>Deploy</span>
              </div>
              <div className="mission-card delay-2">
                <FiCpu />
                <span>Scale</span>
              </div>
              <div className="mission-center">
                <FiTarget />
              </div>
            </div>
            <div className="mission-content">
              <span className="eyebrow">Our mission</span>
              <h2>Make great technology accessible to every business</h2>
              <p>We believe world-class technology shouldn't be reserved for tech giants. CODE TECH was founded to democratize access to premium web development, hosting, and IT services — at prices that make sense for businesses of any size.</p>
              <p>Today, we serve over 150 clients across 12 countries, from solo entrepreneurs to established enterprises. Every project gets the same level of care, attention, and craftsmanship.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div className="stat" key={i}>
                <div className="stat-value gradient-text">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Our values</span>
            <h2>What we stand for</h2>
            <p>The principles that guide every decision, every project, every interaction.</p>
          </div>
          <div className="grid grid-2">
            {values.map((v, i) => (
              <div className="card value-card" key={i}>
                <div className="value-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="tech-section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Tech stack</span>
            <h2>Technologies we love working with</h2>
            <p>Modern, proven tools chosen for performance, scalability, and developer happiness.</p>
          </div>
          <div className="tech-grid">
            {technologies.map((t, i) => (
              <div className="tech-chip" key={i} style={{ '--c': t.color }}>
                <span className="tech-icon">{t.icon}</span>
                <span>{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="team-section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">The team</span>
            <h2>Meet our talented crew</h2>
            <p>A diverse team of engineers, designers, and strategists passionate about building great things.</p>
          </div>
          <div className="grid grid-3">
            {team.map((m, i) => (
              <div className="card team-card" key={i}>
                <div className={`team-avatar bg-${m.color}`}>{m.initials}</div>
                <h3>{m.name}</h3>
                <p>{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="timeline-section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Our journey</span>
            <h2>From garage to global</h2>
            <p>Key milestones in our story.</p>
          </div>
          <div className="timeline">
            {milestones.map((m, i) => (
              <div className="timeline-item" key={i}>
                <div className="timeline-dot" />
                <div className="timeline-year">{m.year}</div>
                <div className="timeline-content">
                  <h3>{m.title}</h3>
                  <p>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container">
          <div className="cta-banner">
            <div className="cta-bg" />
            <div className="cta-content">
              <FiUsers className="cta-icon" />
              <h2>Join our growing list of happy clients</h2>
              <p>Let's talk about how we can help you build, launch, and scale your next big idea.</p>
              <div className="cta-actions">
                <Link to="/contact" className="btn btn-primary btn-lg">
                  Start a Project <FiArrowRight />
                </Link>
                <Link to="/demos" className="btn btn-secondary btn-lg">
                  See Our Work
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
