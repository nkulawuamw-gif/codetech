import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiSend, FiCheck, FiAlertCircle } from 'react-icons/fi'
import { useContent } from '../hooks/useContent'
import * as api from '../services/api'
import './DemoRequest.css'

export default function DemoRequest() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: demos } = useContent('demo_sites')
  const [demo, setDemo] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    projectName: '',
    projectDesc: '',
    budget: '',
  })

  useEffect(() => {
    const found = demos.find(d => String(d.id) === String(id))
    if (found) setDemo(found)
  }, [id, demos])

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await api.submitDemoRequest({
        demoId: demo.id,
        demoTitle: demo.title,
        ...form,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!demo && demos.length > 0) {
    return (
      <div className="demo-request-page">
        <div className="container">
          <div className="empty-state">
            <p>Demo not found.</p>
            <Link to="/demos" className="btn btn-primary">Back to demos</Link>
          </div>
        </div>
      </div>
    )
  }

  if (!demo) {
    return (
      <div className="demo-request-page">
        <div className="container"><div className="empty-state">Loading…</div></div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="demo-request-page">
        <div className="container">
          <div className="request-success">
            <div className="success-icon"><FiCheck /></div>
            <h1>Request sent!</h1>
            <p>Thank you, <strong>{form.fullName}</strong>. We've received your request for the <strong>{demo.title}</strong> demo.</p>
            <p className="muted">Our team will get back to you within 24 hours with access details.</p>
            <div className="success-actions">
              <Link to="/demos" className="btn btn-secondary">Browse more demos</Link>
              <Link to="/" className="btn btn-ghost">Back to home</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="demo-request-page">
      <section className="page-hero">
        <div className="container">
          <Link to="/demos" className="back-link"><FiArrowLeft /> Back to demos</Link>
          <span className="eyebrow">Request a Demo</span>
          <h1><span className="gradient-text">{demo.title}</span></h1>
          <p>Fill in your details and we'll set up a personal walkthrough of this demo for you.</p>
        </div>
      </section>

      <section className="request-section">
        <div className="container">
          <div className="request-layout">
            <div className="request-info">
              <div className="request-demo-card">
                <div className={`request-demo-thumb bg-grad-${demo.id % 6}`}>
                  <span className="request-demo-emoji">{demo.image}</span>
                </div>
                <h3>{demo.title}</h3>
                <span className="demo-category">{demo.category}</span>
                <p className="muted">{demo.desc}</p>
                <div className="demo-tech">
                  {demo.tech.map((t, i) => (
                    <span className="tech-pill" key={i}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={submit} className="request-form">
              <h2>Your Details</h2>
              <p className="form-sub">We'll use this info to prepare a tailored demo experience.</p>

              {error && (
                <div className="form-error">
                  <FiAlertCircle /> {error}
                </div>
              )}

              <div className="form-grid">
                <div className="form-group full">
                  <label htmlFor="fullName">Full name *</label>
                  <input id="fullName" type="text" value={form.fullName} onChange={set('fullName')} required placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input id="email" type="email" value={form.email} onChange={set('email')} required placeholder="john@example.com" />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="+265 999 000 000" />
                </div>
                <div className="form-group">
                  <label htmlFor="company">Company / Organisation</label>
                  <input id="company" type="text" value={form.company} onChange={set('company')} placeholder="Your company name" />
                </div>
                <div className="form-group">
                  <label htmlFor="projectName">Project name</label>
                  <input id="projectName" type="text" value={form.projectName} onChange={set('projectName')} placeholder="Name of your project" />
                </div>
                <div className="form-group full">
                  <label htmlFor="projectDesc">Project description</label>
                  <textarea id="projectDesc" value={form.projectDesc} onChange={set('projectDesc')} rows={4} placeholder="Tell us about your project, goals, and any specific requirements…" />
                </div>
                <div className="form-group">
                  <label htmlFor="budget">Estimated budget</label>
                  <select id="budget" value={form.budget} onChange={set('budget')}>
                    <option value="">Select range</option>
                    <option value="< 500k">Under MWK 500,000</option>
                    <option value="500k - 1M">MWK 500,000 – MWK 1,000,000</option>
                    <option value="1M - 3M">MWK 1,000,000 – MWK 3,000,000</option>
                    <option value="3M - 5M">MWK 3,000,000 – MWK 5,000,000</option>
                    <option value="5M+">MWK 5,000,000+</option>
                    <option value="not-sure">Not sure yet</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={saving}>
                <FiSend /> {saving ? 'Sending…' : 'Request Demo'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
