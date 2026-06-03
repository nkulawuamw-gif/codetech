import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { FiMenu, FiX, FiCode, FiShoppingCart, FiLock } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import './Navbar.css'

const links = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/domains', label: 'Domains' },
  { to: '/hosting', label: 'Hosting' },
  { to: '/demos', label: 'Demos' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { itemCount } = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [location.pathname])

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-inner">
        <Link to="/" className="logo">
          <span className="logo-icon"><FiCode /></span>
          <span className="logo-text">CODE <span className="gradient-text">TECH</span></span>
        </Link>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end={l.to === '/'}
            >
              {l.label}
            </NavLink>
          ))}
          <Link to="/contact" className="btn btn-primary nav-cta">Get Started</Link>
        </nav>

        <div className="nav-actions">
          <Link to="/admin/login" className="staff-link" title="Staff login">
            <FiLock />
          </Link>
          <Link
            to="/cart"
            className="cart-link"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
            title="View cart"
          >
            <FiShoppingCart />
            {itemCount > 0 && (
              <span className="cart-badge" aria-hidden="true">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
          <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </header>
  )
}
