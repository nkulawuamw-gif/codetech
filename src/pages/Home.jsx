import { Link } from 'react-router-dom'
import { FiArrowRight, FiCheck, FiZap, FiGlobe, FiServer, FiShield, FiTrendingUp, FiCode, FiShoppingCart, FiCpu, FiMail, FiCloud, FiTool } from 'react-icons/fi'
import * as local from '../data/content'
import { useContent } from '../hooks/useContent'
import './Home.css'
import './shared-pages.css'

const iconMap = {
  'web-dev': FiCode,
  'ecommerce': FiShoppingCart,
  'domain': FiGlobe,
  'hosting': FiServer,
  'mobile': FiCpu,
  'seo': FiTrendingUp,
  'security': FiShield,
  'cloud': FiCloud,
  'it-consult': FiZap,
  'email': FiMail,
  'maintenance': FiTool,
}

export default function Home() {
  const { data: services } = useContent('services')
  const { data: hostingPlans } = useContent('hosting_plans')
  const { data: demoSites } = useContent('demo_sites')
  const { technologies, stats } = local
  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content fade-up">
              <div className="hero-badge">
                <span className="badge-dot" />
                <span>Now accepting new projects for 2026</span>
              </div>
              <h1>
                Build, launch & scale your <span className="gradient-text">digital presence</span>
              </h1>
              <p className="hero-sub">
                From stunning websites and powerful e-commerce stores to rock-solid hosting and strategic IT consulting — CODE TECH is your all-in-one technology partner.
              </p>
              <div className="hero-actions">
                <Link to="/services" className="btn btn-primary btn-lg">
                  Explore Services <FiArrowRight />
                </Link>
                <Link to="/demos" className="btn btn-secondary btn-lg">
                  See Our Work
                </Link>
              </div>
              <div className="hero-trust">
                <div className="trust-item">
                  <FiCheck /> <span>Free consultation</span>
                </div>
                <div className="trust-item">
                  <FiCheck /> <span>30-day money-back</span>
                </div>
                <div className="trust-item">
                  <FiCheck /> <span>24/7 expert support</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="orbit">
                <div className="orbit-center">
                  <div className="orbit-inner">
                    <FiCode />
                  </div>
                </div>
                <div className="orbit-item orbit-1">⚛️</div>
                <div className="orbit-item orbit-2">🚀</div>
                <div className="orbit-item orbit-3">☁️</div>
                <div className="orbit-item orbit-4">🔒</div>
                <div className="orbit-item orbit-5">🌐</div>
                <div className="orbit-item orbit-6">📱</div>
              </div>
              <div className="floating-card card-1">
                <div className="fc-icon">📈</div>
                <div>
                  <div className="fc-label">Uptime</div>
                  <div className="fc-value">99.99%</div>
                </div>
              </div>
              <div className="floating-card card-2">
                <div className="fc-icon">⚡</div>
                <div>
                  <div className="fc-label">Avg. Load</div>
                  <div className="fc-value">0.4s</div>
                </div>
              </div>
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

      {/* Services */}
      <section id="services">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">What we do</span>
            <h2>Complete IT solutions under one roof</h2>
            <p>Websites, domains, hosting, security, mobile apps, and more — we've got you covered from idea to launch and beyond.</p>
          </div>
          <div className="grid grid-3">
            {services.slice(0, 6).map(svc => {
              const Icon = iconMap[svc.id] || FiCode
              return (
                <div className="card service-card" key={svc.id}>
                  <div className="service-icon">
                    <Icon />
                  </div>
                  <h3>{svc.title}</h3>
                  <p>{svc.short}</p>
                  <ul className="service-features">
                    {svc.features.slice(0, 3).map((f, i) => (
                      <li key={i}><FiCheck /> {f}</li>
                    ))}
                  </ul>
                  <div className="service-foot">
                    <span className="service-price">{svc.price}</span>
                    <Link to="/services" className="btn btn-ghost">
                      Learn more <FiArrowRight />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="section-cta">
            <Link to="/services" className="btn btn-secondary btn-lg">
              View all services <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="tech-section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Our stack</span>
            <h2>Technologies we master</h2>
            <p>Modern, battle-tested tools to build fast, secure, and scalable solutions.</p>
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

      {/* Hosting preview */}
      <section>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Hosting</span>
            <h2>Hosting plans that grow with you</h2>
            <p>From starter sites to enterprise applications — pick a plan or let us craft a custom one.</p>
          </div>
          <div className="grid grid-2">
            {hostingPlans.slice(0, 3).map((p, i) => (
              <div className={`card plan-card ${p.popular ? 'popular' : ''}`} key={i}>
                {p.popular && <div className="popular-tag">Most Popular</div>}
                <div className="plan-head">
                  <span className="plan-icon">{p.icon}</span>
                  <h3>{p.name}</h3>
                </div>
                <p className="plan-desc">{p.desc}</p>
                <div className="plan-price">
                  <span className="price-currency">MWK</span>
                  <span className="price-amount">{p.price.toLocaleString()}</span>
                  <span className="price-period">/mo</span>
                </div>
                <ul className="plan-features">
                  {p.features.slice(0, 5).map((f, j) => (
                    <li key={j}><FiCheck /> {f}</li>
                  ))}
                </ul>
                <Link to="/hosting" className={`btn ${p.popular ? 'btn-primary' : 'btn-secondary'} btn-block`}>
                  Choose {p.name}
                </Link>
              </div>
            ))}
          </div>
          <div className="section-cta">
            <Link to="/hosting" className="btn btn-ghost">
              Compare all plans <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Demo preview */}
      <section className="demos-section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Portfolio</span>
            <h2>Websites we've crafted</h2>
            <p>Real projects, real clients, real results. Click any to explore the live demo.</p>
          </div>
          <div className="grid grid-3">
            {demoSites.slice(0, 6).map(d => (
              <div className="card demo-card" key={d.id}>
                <div className={`demo-thumb bg-grad-${d.id % 6}`}>
                  <span className="demo-emoji">{d.image}</span>
                </div>
                <div className="demo-info">
                  <span className="demo-category">{d.category}</span>
                  <h3>{d.title}</h3>
                  <p>{d.desc}</p>
                  <div className="demo-tech">
                    {d.tech.slice(0, 3).map((t, i) => (
                      <span className="tech-pill" key={i}>{t}</span>
                    ))}
                  </div>
                  <Link to="/demos" className="btn btn-ghost demo-btn">
                    Live demo <FiArrowRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="section-cta">
            <Link to="/demos" className="btn btn-secondary btn-lg">
              See all demos <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container">
          <div className="cta-banner">
            <div className="cta-bg" />
            <div className="cta-content">
              <h2>Ready to start your project?</h2>
              <p>Get a free consultation and a custom quote. We'll respond within 24 hours.</p>
              <div className="cta-actions">
                <Link to="/contact" className="btn btn-primary btn-lg">
                  Get a Free Quote <FiArrowRight />
                </Link>
                <Link to="/services" className="btn btn-secondary btn-lg">
                  Choose Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
