import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiCheck, FiArrowRight, FiServer, FiCloud, FiCpu, FiShield, FiZap, FiRefreshCw, FiHeadphones, FiHardDrive, FiGlobe, FiLock, FiShoppingCart } from 'react-icons/fi'
import { useContent } from '../hooks/useContent'
import { useCart } from '../context/CartContext'
import './Hosting.css'
import './shared-pages.css'

const yearlyDiscount = 0.83 // ~17% off

export default function Hosting() {
  const [billing, setBilling] = useState('monthly')
  const { addItem } = useCart()
  const navigate = useNavigate()
  const { data: hostingPlans, loading } = useContent('hosting_plans')

  const price = (p) => billing === 'yearly' ? Math.round(p * yearlyDiscount) : p
  const fmt = (n) => Number(n).toLocaleString()

  const addToCart = (p) => {
    addItem({
      type: 'hosting',
      id: p.name.toLowerCase(),
      title: `${p.name} Hosting`,
      subtitle: p.desc,
      icon: p.icon,
      price: price(p.price),
      priceLabel: `MWK ${fmt(price(p.price))} / ${billing === 'monthly' ? 'mo' : 'yr'}`,
      billing,
    })
    navigate('/cart')
  }

  return (
    <div className="hosting-page">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Web Hosting</span>
          <h1>Hosting that <span className="gradient-text">just works</span></h1>
          <p>Lightning-fast SSD/NVMe servers, 99.99% uptime, free SSL, daily backups, and 24/7 expert support — all in one plan.</p>

          <div className="billing-toggle">
            <button
              className={billing === 'monthly' ? 'active' : ''}
              onClick={() => setBilling('monthly')}
            >
              Monthly
            </button>
            <button
              className={billing === 'yearly' ? 'active' : ''}
              onClick={() => setBilling('yearly')}
            >
              Yearly <span className="save-badge">Save 17%</span>
            </button>
          </div>
        </div>
      </section>

      <section className="plans-section">
        <div className="container">
          <div className="plans-grid">
            {hostingPlans.map((p, i) => (
              <div className={`card plan-card ${p.popular ? 'popular' : ''}`} key={i}>
                {p.popular && <div className="popular-tag">Most Popular</div>}
                <div className="plan-head">
                  <span className="plan-icon">{p.icon}</span>
                  <h3>{p.name}</h3>
                </div>
                <p className="plan-desc">{p.desc}</p>
                <div className="plan-price">
                  <span className="price-currency">MWK</span>
                  <span className="price-amount">{fmt(price(p.price))}</span>
                  <span className="price-period">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                <ul className="plan-features">
                  {p.features.map((f, j) => (
                    <li key={j}><FiCheck /> {f}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => addToCart(p)}
                  className={`btn ${p.popular ? 'btn-primary' : 'btn-secondary'} btn-block`}
                >
                  <FiShoppingCart /> Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hosting types */}
      <section className="hosting-types">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Hosting types</span>
            <h2>Whatever your scale, we have a solution</h2>
          </div>
          <div className="grid grid-3">
            {[
              {
                icon: <FiServer />,
                title: 'Shared Hosting',
                desc: 'Affordable, easy-to-use hosting for small sites and blogs. Perfect starting point.',
                tag: 'Beginner friendly'
              },
              {
                icon: <FiCpu />,
                title: 'VPS Hosting',
                desc: 'Dedicated resources, full root access, and complete control. For developers and growing apps.',
                tag: 'For developers'
              },
              {
                icon: <FiCloud />,
                title: 'Cloud Hosting',
                desc: 'Auto-scaling infrastructure that grows with your traffic. Pay only for what you use.',
                tag: 'Scalable'
              },
              {
                icon: <FiHardDrive />,
                title: 'Dedicated Servers',
                desc: 'Enterprise-grade hardware exclusively for you. Maximum performance and security.',
                tag: 'Maximum power'
              },
              {
                icon: <FiGlobe />,
                title: 'WordPress Hosting',
                desc: 'Optimized specifically for WordPress with auto-updates, caching, and staging.',
                tag: 'WordPress optimized'
              },
              {
                icon: <FiZap />,
                title: 'Reseller Hosting',
                desc: 'Start your own hosting business with white-label control panel and resources.',
                tag: 'For agencies'
              }
            ].map((h, i) => (
              <div className="card type-card" key={i}>
                <div className="type-icon">{h.icon}</div>
                <span className="type-tag">{h.tag}</span>
                <h3>{h.title}</h3>
                <p>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="hosting-features">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Included with every plan</span>
            <h2>Built for performance and peace of mind</h2>
          </div>
          <div className="features-grid">
            {[
              { icon: <FiShield />, title: 'Free SSL Certificate', desc: 'Encrypt all traffic and boost SEO rankings.' },
              { icon: <FiRefreshCw />, title: 'Daily Backups', desc: 'Automatic backups with one-click restore.' },
              { icon: <FiZap />, title: 'LiteSpeed Servers', desc: 'Up to 10x faster than traditional Apache.' },
              { icon: <FiGlobe />, title: 'Global CDN', desc: 'Content delivered from 200+ locations.' },
              { icon: <FiLock />, title: 'DDoS Protection', desc: 'Enterprise-grade protection included free.' },
              { icon: <FiHeadphones />, title: '24/7 Expert Support', desc: 'Real engineers, not chatbots. Always ready.' },
            ].map((f, i) => (
              <div className="card mini-feat" key={i}>
                <div className="mini-icon">{f.icon}</div>
                <div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
