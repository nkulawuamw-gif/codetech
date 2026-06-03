import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSearch, FiCheck, FiArrowRight, FiGlobe, FiShield, FiRefreshCw, FiHeadphones, FiStar, FiShoppingCart, FiAlertCircle } from 'react-icons/fi'
import { useContent } from '../hooks/useContent'
import { useCart } from '../context/CartContext'
import * as api from '../services/api'
import './Domains.css'
import './shared-pages.css'

export default function Domains() {
  const [query, setQuery] = useState('')
  const [tld, setTld] = useState('')
  const { addItem } = useCart()
  const navigate = useNavigate()
  const { data: domains } = useContent('domains')
  const [filter, setFilter] = useState('all')
  const [results, setResults] = useState(null)
  const [searchedDomain, setSearchedDomain] = useState('')
  const [checking, setChecking] = useState(false)

  const filtered = useMemo(() => {
    return domains.filter(d => {
      if (filter === 'popular' && !d.popular) return false
      if (tld && d.name !== tld) return false
      if (query) {
        const q = query.toLowerCase()
        return d.name.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q)
      }
      return true
    })
  }, [query, tld, filter])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query) return
    setSearchedDomain(query)
    setChecking(true)
    setResults(null)

    // Check availability for up to 8 TLDs in parallel
    const tlds = domains.slice(0, 8)
    const checks = tlds.map(async (d) => {
      const result = await api.checkDomain(`${query}${d.name}`)
      return {
        tld: d.name,
        price: d.price,
        available: result.available,
        registered: result.registered,
        error: result.error,
        method: result.method,
      }
    })
    const res = await Promise.all(checks)
    setResults(res)
    setChecking(false)
  }

  const addDomainToCart = (tld, price, domainName = '') => {
    addItem({
      type: 'domain',
      id: tld,
      title: domainName ? `${domainName}${tld}` : `Domain ${tld}`,
      subtitle: domainName ? `Domain registration` : `${tld} TLD`,
      icon: '🌐',
      price: Number(price),
      priceLabel: `MWK ${Math.round(Number(price) / 12).toLocaleString()} /mo`,
      domainName,
      billing: 'monthly',
    })
    navigate('/cart')
  }

  return (
    <div className="domains-page">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Domain Search</span>
          <h1>Find your perfect <span className="gradient-text">domain name</span></h1>
          <p>Search across 500+ TLDs and register your ideal domain in seconds.</p>

          <form className="domain-search-form" onSubmit={handleSearch}>
            <div className="search-input-wrap">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="yourname.com, yourbrand.io, yourstartup.dev..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg">
              Search <FiArrowRight />
            </button>
          </form>
        </div>
      </section>

      {/* Search results */}
      {checking && (
        <section className="search-results-section">
          <div className="container">
            <h2>Checking "{searchedDomain}"…</h2>
            <div className="results-grid">
              {domains.slice(0, 8).map((_, i) => (
                <div className="result-card loading" key={i}>
                  <div className="result-domain">
                    <span className="result-name placeholder">&nbsp;</span>
                    <span className="badge placeholder">&nbsp;</span>
                  </div>
                  <div className="result-foot">
                    <span className="result-price placeholder">&nbsp;</span>
                    <span className="btn placeholder">&nbsp;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {results && !checking && (
        <section className="search-results-section">
          <div className="container">
            <h2>Results for "{searchedDomain}"</h2>
            <p className="search-method-note">
              Results based on real-time WHOIS/RDAP lookup and DNS verification.
            </p>
            <div className="results-grid">
              {results.map((r, i) => (
                <div className={`result-card ${r.available === true ? 'available' : ''} ${r.available === false ? 'taken' : ''} ${r.error ? 'error' : ''}`} key={i}>
                  <div className="result-domain">
                    <span className="result-name">{searchedDomain}{r.tld}</span>
                    {r.available === true && (
                      <span className="badge badge-ok">✓ Available — register now!</span>
                    )}
                    {r.available === false && r.registered && (
                      <span className="badge badge-bad">✗ Not available — already registered</span>
                    )}
                    {r.available === false && !r.registered && (
                      <span className="badge badge-bad">Not available</span>
                    )}
                    {r.available === null && (
                      <span className="badge badge-warn">
                        <FiAlertCircle /> {r.error || 'Could not verify'}
                      </span>
                    )}
                  </div>
                  <div className="result-foot">
                    <span className="result-price">
                      {r.available === true ? (
                        <>MWK {Math.round(Number(r.price) / 12).toLocaleString()}<span>/mo</span></>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </span>
                    {r.available === true ? (
                      <button
                        className="btn btn-primary"
                        onClick={() => addDomainToCart(r.tld, r.price, searchedDomain)}
                      >
                        <FiShoppingCart /> Register now
                      </button>
                    ) : (
                      <button className="btn btn-secondary" disabled>
                        {r.available === false ? 'Already registered' : 'Unavailable'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Domain list */}
      <section className="domains-list-section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Pricing</span>
            <h2>Browse all available TLDs</h2>
            <p>Filter, sort, and find the perfect extension for your brand.</p>
          </div>

          <div className="domain-filters">
            <div className="filter-pills">
              {[
                { id: 'all', label: 'All' },
                { id: 'popular', label: '⭐ Popular' },
              ].map(f => (
                <button
                  key={f.id}
                  className={`pill ${filter === f.id ? 'active' : ''}`}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="domain-search-mini">
              <FiSearch />
              <input
                type="text"
                placeholder="Filter TLDs..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="domains-grid">
            {filtered.map((d, i) => (
              <div className="card domain-card" key={i}>
                {d.popular && (
                  <div className="popular-tag">
                    <FiStar /> Popular
                  </div>
                )}
                <div className="domain-tld">{d.name}</div>
                <p className="domain-desc">{d.desc}</p>
                <div className="domain-foot">
                  <div className="domain-price">
                    <span className="from">from</span>
                    <span className="amount">MWK {Math.round(Number(d.price) / 12).toLocaleString()}</span>
                    <span className="period">/mo</span>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => addDomainToCart(d.name, d.price)}
                  >
                    <FiShoppingCart /> Register
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <p>No TLDs match your filter. Try a different keyword.</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="domain-features">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Why register with us</span>
            <h2>Everything you need in one place</h2>
          </div>
          <div className="grid grid-4">
            {[
              { icon: <FiShield />, title: 'Free WHOIS Privacy', desc: 'Keep your personal info private on all domains.' },
              { icon: <FiRefreshCw />, title: 'Easy Transfers', desc: 'Move your domain to us in minutes, no downtime.' },
              { icon: <FiGlobe />, title: 'Free DNS Management', desc: 'Powerful DNS with global anycast network.' },
              { icon: <FiHeadphones />, title: '24/7 Support', desc: 'Real humans ready to help, anytime.' },
            ].map((f, i) => (
              <div className="card feat-card" key={i}>
                <div className="feat-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
