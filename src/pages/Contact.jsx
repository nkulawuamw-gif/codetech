import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { FiMail, FiPhone, FiSend, FiCheck, FiClock, FiMessageSquare } from 'react-icons/fi'
import { services } from '../data/content'
import * as api from '../services/api'
import { useNotifications } from '../context/NotificationsContext'
import './Contact.css'
import './shared-pages.css'

export default function Contact() {
  const location = useLocation()
  const initialServices = location.state?.selectedServices || []
  const { addNotification } = useNotifications()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    budget: '',
    message: '',
  })
  const [selectedServices, setSelectedServices] = useState(initialServices)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (initialServices.length) setSelectedServices(initialServices)
  }, [initialServices])

  const toggleService = (title) => {
    setSelectedServices(s => s.includes(title) ? s.filter(x => x !== title) : [...s, title])
  }

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    try {
      await api.submitContactMessage({
        fullName: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        budget: form.budget,
        message: `Services: ${selectedServices.join(', ') || 'None'}\n\n${form.message}`,
      })
    } catch (err) {
      console.warn('Failed to save contact message:', err)
    }
    addNotification({
      type: 'message',
      title: `New message from ${form.name || 'a visitor'}`,
      body: form.message
        ? form.message.slice(0, 140) + (form.message.length > 140 ? '…' : '')
        : 'No message content provided.',
      meta: {
        email: form.email,
        phone: form.phone,
        company: form.company,
        services: selectedServices,
        budget: form.budget,
      },
    })
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setForm({ name: '', email: '', phone: '', company: '', budget: '', message: '' })
      setSelectedServices([])
    }, 4000)
  }

  return (
    <div className="contact-page">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Contact Us</span>
          <h1>Let's build something <span className="gradient-text">amazing together</span></h1>
          <p>Tell us about your project and we'll get back to you within 24 hours with a free, no-obligation quote.</p>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          <div className="contact-layout">
            {/* Form */}
            <div className="contact-form-wrap">
              <h2>Send us a message</h2>
              <p className="form-sub">Fill in the form and our team will get back to you within 24 hours.</p>

              {submitted ? (
                <div className="success-msg">
                  <div className="success-icon"><FiCheck /></div>
                  <h3>Message sent!</h3>
                  <p>Thanks for reaching out. We'll respond within 24 hours.</p>
                </div>
              ) : (
                <form className="contact-form" onSubmit={submit}>
                  <div className="form-row">
                    <div>
                      <label htmlFor="name">Full name *</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={update}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email">Email *</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={update}
                        placeholder="you@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div>
                      <label htmlFor="phone">Phone</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={update}
                        placeholder="+265 9XX XXX XXX"
                      />
                    </div>
                    <div>
                      <label htmlFor="company">Company</label>
                      <input
                        id="company"
                        name="company"
                        type="text"
                        value={form.company}
                        onChange={update}
                        placeholder="Your company"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="budget">Project budget</label>
                    <select id="budget" name="budget" value={form.budget} onChange={update}>
                      <option value="">Select a range</option>
                      <option value="<1m">Less than MWK 1,000,000</option>
                      <option value="1m-5m">MWK 1,000,000 - MWK 5,000,000</option>
                      <option value="5m-15m">MWK 5,000,000 - MWK 15,000,000</option>
                      <option value="15m-50m">MWK 15,000,000 - MWK 50,000,000</option>
                      <option value="50m+">MWK 50,000,000+</option>
                    </select>
                  </div>

                  <div>
                    <label>Services you're interested in</label>
                    <div className="service-chips">
                      {services.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          className={`chip ${selectedServices.includes(s.title) ? 'active' : ''}`}
                          onClick={() => toggleService(s.title)}
                        >
                          {s.icon} {s.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message">Tell us about your project *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={update}
                      placeholder="Describe your project, goals, timeline..."
                      rows={5}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg btn-block">
                    <FiSend /> Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Contact info */}
            <aside className="contact-info">
              <div className="info-card">
                <h3>Get in touch</h3>
                <ul className="info-list">
                  <li>
                    <div className="info-icon"><FiPhone /></div>
                    <div>
                      <strong>Phone</strong>
                      <p>
                        <a
                          href="https://wa.me/265995479580?text=Hello%20CODE%20TECH%2C%20I%27d%20like%20to%20learn%20more%20about%20your%20services."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="phone-wa-link"
                          title="Click to chat on WhatsApp"
                        >
                          +265 995 479 580
                          <span className="wa-inline-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488"/>
                            </svg>
                          </span>
                        </a>
                        <br />
                        <a
                          href="https://wa.me/265995818766?text=Hello%20CODE%20TECH%2C%20I%27d%20like%20to%20learn%20more%20about%20your%20services."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="phone-wa-link"
                          title="Click to chat on WhatsApp"
                        >
                          +265 995 818 766
                          <span className="wa-inline-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488"/>
                            </svg>
                          </span>
                        </a>
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="info-icon wa-icon-bg">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488"/>
                      </svg>
                    </div>
                    <div>
                      <strong>WhatsApp</strong>
                      <p>
                        <a href="https://wa.me/265995479580" target="_blank" rel="noopener noreferrer">+265 995 479 580</a><br />
                        <a href="https://wa.me/265995818766" target="_blank" rel="noopener noreferrer">+265 995 818 766</a>
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="info-icon"><FiMail /></div>
                    <div>
                      <strong>Email</strong>
                      <p>
                        <a href="mailto:hello@codetech.io">hello@codetech.io</a>
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="info-icon"><FiClock /></div>
                    <div>
                      <strong>Hours</strong>
                      <p>Mon-Fri: 8am - 6pm CAT<br />24/7 emergency support</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="chat-card">
                <div className="chat-icon"><FiMessageSquare /></div>
                <h4>Need a quick answer?</h4>
                <p>Message us on WhatsApp for the fastest response. Average reply time: under 5 minutes.</p>
                <a href="https://wa.me/265995479580" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-block">
                  Chat — +265 995 479 580
                </a>
                <a href="https://wa.me/265995818766" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-block">
                  Chat — +265 995 818 766
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
