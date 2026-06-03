import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiExternalLink, FiX, FiCheck, FiSend } from 'react-icons/fi'
import { useContent } from '../hooks/useContent'
import * as api from '../services/api'
import './Demos.css'
import './shared-pages.css'

export default function Demos() {
  const [filter, setFilter] = useState('All')
  const [activeDemo, setActiveDemo] = useState(null)
  const [testimonials, setTestimonials] = useState([])
  const { data: demoSites } = useContent('demo_sites')

  useEffect(() => {
    api.getTestimonials().then(setTestimonials).catch(() => {})
  }, [])

  const categories = useMemo(
    () => ['All', ...new Set(demoSites.map(d => d.category))],
    []
  )

  const filtered = useMemo(
    () => filter === 'All' ? demoSites : demoSites.filter(d => d.category === filter),
    [filter, demoSites]
  )

  return (
    <div className="demos-page">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Live Demos</span>
          <h1>Websites we've <span className="gradient-text">built & launched</span></h1>
          <p>Explore real, production-ready websites we've crafted for clients across industries. Click any to dive into the live demo.</p>
        </div>
      </section>

      <section className="demos-section">
        <div className="container">
          <div className="filter-bar">
            {categories.map(c => (
              <button
                key={c}
                className={`pill ${filter === c ? 'active' : ''}`}
                onClick={() => setFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>

              <div className="demos-grid">
            {filtered.map(d => (
              <div className="card demo-card" key={d.id}>
                <div className={`demo-thumb bg-grad-${d.id % 6}`}>
                  <span className="demo-emoji">{d.image}</span>
                  <Link to={`/demos/request/${d.id}`} className="view-demo">
                    <FiSend /> Request Demo
                  </Link>
                </div>
                <div className="demo-info">
                  <span className="demo-category">{d.category}</span>
                  <h3>{d.title}</h3>
                  <p>{d.desc}</p>
                  <div className="demo-tech">
                    {d.tech.map((t, i) => (
                      <span className="tech-pill" key={i}>{t}</span>
                    ))}
                  </div>
                  <div className="demo-card-actions">
                    <Link to={`/demos/request/${d.id}`} className="btn btn-primary demo-btn">
                      <FiSend /> Request Demo
                    </Link>
                    <button className="btn btn-ghost demo-btn-slim" onClick={() => setActiveDemo(d)}>
                      Details <FiExternalLink />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <p>No demos in this category yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Demo Modal */}
      {activeDemo && (
        <div className="modal-overlay" onClick={() => setActiveDemo(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveDemo(null)} aria-label="Close">
              <FiX />
            </button>
            <div className={`modal-hero bg-grad-${activeDemo.id % 6}`}>
              <span className="modal-emoji">{activeDemo.image}</span>
              <div className="modal-overlay-content">
                <span className="demo-category">{activeDemo.category}</span>
                <h2>{activeDemo.title}</h2>
              </div>
            </div>
            <div className="modal-body">
              <p className="modal-desc">{activeDemo.desc}</p>

              <div className="modal-section">
                <h4>Technologies Used</h4>
                <div className="demo-tech">
                  {activeDemo.tech.map((t, i) => (
                    <span className="tech-pill" key={i}>{t}</span>
                  ))}
                </div>
              </div>

              <div className="modal-section">
                <h4>Key Features</h4>
                <ul className="modal-features">
                  {activeDemo.features.map((f, i) => (
                    <li key={i}><FiCheck /> {f}</li>
                  ))}
                </ul>
              </div>

              <div className="modal-actions">
                <Link to={`/demos/request/${activeDemo.id}`} className="btn btn-primary btn-lg" onClick={() => setActiveDemo(null)}>
                  <FiSend /> Request Demo
                </Link>
                <Link to="/contact" className="btn btn-secondary btn-lg" onClick={() => setActiveDemo(null)}>
                  Build Similar <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Client words</span>
            <h2>Trusted by founders and teams</h2>
          </div>
          <div className="grid grid-3">
            {(testimonials.length ? testimonials.filter(t => t.active !== false) : []).map((t, i) => (
              <div className="card testimonial" key={i}>
                <div className="quote-mark">"</div>
                <p className="quote">{t.quote}</p>
                <div className="author">
                  <div className="author-avatar">{t.initials}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
            {testimonials.length > 0 && testimonials.filter(t => t.active !== false).length === 0 && null}
            {testimonials.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <p>Testimonials coming soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
