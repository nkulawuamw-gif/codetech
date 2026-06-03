import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiCheck, FiX, FiArrowRight, FiCode, FiShoppingCart, FiGlobe, FiServer, FiCpu, FiTrendingUp, FiShield, FiCloud, FiZap, FiMail, FiTool, FiPlus } from 'react-icons/fi'
import { useContent } from '../hooks/useContent'
import { useCart } from '../context/CartContext'
import './Services.css'
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

export default function Services() {
  const [selected, setSelected] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const { addItem, clearCart } = useCart()
  const navigate = useNavigate()
  const { data: services, loading } = useContent('services')

  const toggle = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  const addOneToCart = (svc) => {
    addItem({
      type: 'service',
      id: svc.id,
      title: svc.title,
      subtitle: svc.short,
      icon: svc.icon,
      price: svc.priceValue,
      priceLabel: svc.price,
    })
  }

  const addAllToCart = () => {
    clearCart()
    selectedServices.forEach(addOneToCart)
    navigate('/cart')
  }

  const clear = () => setSelected([])

  const selectedServices = useMemo(
    () => services.filter(s => selected.includes(s.id)),
    [selected, services]
  )

  const total = useMemo(() => {
    const tier1 = ['web-dev', 'domain', 'hosting', 'security', 'email', 'maintenance', 'design']
    const tier2 = ['ecommerce', 'seo']
    const tier3 = ['mobile', 'cloud', 'it-consult']
    let est = 0
    selectedServices.forEach(s => {
      if (tier1.includes(s.id)) est += 500000
      else if (tier2.includes(s.id)) est += 1000000
      else if (tier3.includes(s.id)) est += 3000000
    })
    if (selectedServices.length >= 3) est *= 0.85
    if (selectedServices.length >= 5) est *= 0.9
    return Math.round(est)
  }, [selectedServices])

  return (
    <div className="services-page">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Our Services</span>
          <h1>Select the services <span className="gradient-text">you need</span></h1>
          <p>Choose one or many — we'll tailor a custom package and quote just for you. The more you pick, the more you save.</p>
        </div>
      </section>

      <section className="services-section">
        <div className="container">
          <div className="services-layout">
            {/* Service list */}
            <div className="services-list">
              <div className="services-toolbar">
                <h2>Available services</h2>
                <div className="toolbar-info">
                  <span>{selected.length} selected</span>
                  {selected.length > 0 && (
                    <button className="btn-ghost clear-btn" onClick={clear}>
                      <FiX /> Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-2">
                {services.map(svc => {
                  const Icon = iconMap[svc.id] || FiCode
                  const isSelected = selected.includes(svc.id)
                  return (
                    <div
                      key={svc.id}
                      className={`card service-card selectable ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggle(svc.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="service-card-top">
                        <div className="service-icon">
                          <Icon />
                        </div>
                        <div className="select-check">
                          {isSelected ? <FiCheck /> : <span>+</span>}
                        </div>
                      </div>
                      <h3>{svc.title}</h3>
                      <p className="service-desc">{svc.desc}</p>
                      <ul className="service-features">
                        {svc.features.map((f, i) => (
                          <li key={i}><FiCheck /> {f}</li>
                        ))}
                      </ul>
                      <div className="service-foot">
                        <span className="service-price">{svc.price}</span>
                        <button
                          className="add-to-cart-btn"
                          onClick={(e) => { e.stopPropagation(); addOneToCart(svc) }}
                          aria-label={`Add ${svc.title} to cart`}
                          title="Add to cart"
                        >
                          <FiPlus /> Add
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Selection summary */}
            <aside className="selection-sidebar">
              <div className="summary-card">
                <div className="summary-head">
                  <h3>Your Selection</h3>
                  <span className="summary-count">{selected.length}</span>
                </div>

                {selected.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <p>Click any service on the left to add it to your selection.</p>
                  </div>
                ) : (
                  <>
                    <ul className="selected-list">
                      {selectedServices.map(s => {
                        const Icon = iconMap[s.id] || FiCode
                        return (
                          <li key={s.id}>
                            <div className="sl-icon"><Icon /></div>
                            <div className="sl-info">
                              <strong>{s.title}</strong>
                              <span>{s.price}</span>
                            </div>
                            <button className="sl-remove" onClick={() => toggle(s.id)} aria-label="Remove">
                              <FiX />
                            </button>
                          </li>
                        )
                      })}
                    </ul>

                    {selected.length >= 3 && (
                      <div className="discount-badge">
                        🎉 Bundle discount applied: {selected.length >= 5 ? '20%' : '15%'} off!
                      </div>
                    )}

                    <div className="summary-total">
                      <div className="total-row">
                        <span>Estimated total</span>
                        <span className="total-amount gradient-text">MWK {total.toLocaleString()}</span>
                      </div>
                      <p className="total-note">Final quote tailored to your project scope.</p>
                    </div>

                    <button
                      type="button"
                      onClick={addAllToCart}
                      className="btn btn-primary btn-block btn-lg"
                    >
                      Add to Cart & Checkout <FiArrowRight />
                    </button>
                    <button className="btn btn-secondary btn-block" onClick={clear}>
                      Clear Selection
                    </button>
                  </>
                )}
              </div>

              <div className="trust-card">
                <h4>Why choose us?</h4>
                <ul>
                  <li><FiCheck /> 30-day money-back guarantee</li>
                  <li><FiCheck /> Free initial consultation</li>
                  <li><FiCheck /> Transparent pricing, no surprises</li>
                  <li><FiCheck /> Dedicated project manager</li>
                  <li><FiCheck /> 24/7 priority support</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
