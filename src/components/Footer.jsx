import { Link } from 'react-router-dom'
import { FiCode, FiMail, FiPhone, FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiGithub, FiArrowUp } from 'react-icons/fi'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <span className="logo-icon"><FiCode /></span>
              <span className="logo-text">CODE <span className="gradient-text">TECH</span></span>
            </Link>
            <p className="footer-tag">
              Your trusted partner for websites, domains, hosting, and complete IT solutions. We build, deploy, and scale your digital presence.
            </p>
            <div className="socials">
              <a href="#" aria-label="Facebook"><FiFacebook /></a>
              <a href="#" aria-label="Twitter"><FiTwitter /></a>
              <a href="#" aria-label="Instagram"><FiInstagram /></a>
              <a href="#" aria-label="LinkedIn"><FiLinkedin /></a>
              <a href="#" aria-label="GitHub"><FiGithub /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Services</h4>
            <ul>
              <li><Link to="/services">Web Development</Link></li>
              <li><Link to="/services">Domain Registration</Link></li>
              <li><Link to="/hosting">Web Hosting</Link></li>
              <li><Link to="/services">E-commerce</Link></li>
              <li><Link to="/services">SEO & Marketing</Link></li>
              <li><Link to="/services">IT Consulting</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/demos">Portfolio</Link></li>
              <li><Link to="/demos">Live Demos</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/contact">Support</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/notifications">Notifications</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Get in Touch</h4>
            <ul className="contact-list">
              <li>
                <a
                  href="https://wa.me/265995479580?text=Hello%20CODE%20TECH%2C%20I%27d%20like%20to%20learn%20more%20about%20your%20services."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="phone-wa-link"
                  aria-label="Chat with +265 995 479 580 on WhatsApp"
                  title="Click to chat on WhatsApp"
                >
                  <FiPhone /> +265 995 479 580
                  <span className="wa-inline-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488"/>
                    </svg>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/265995818766?text=Hello%20CODE%20TECH%2C%20I%27d%20like%20to%20learn%20more%20about%20your%20services."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="phone-wa-link"
                  aria-label="Chat with +265 995 818 766 on WhatsApp"
                  title="Click to chat on WhatsApp"
                >
                  <FiPhone /> +265 995 818 766
                  <span className="wa-inline-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488"/>
                    </svg>
                  </span>
                </a>
              </li>
              <li><FiMail /> hello@codetech.io</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {year} CODE TECH. All rights reserved. Crafted with passion.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Sitemap</a>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="back-top" aria-label="Back to top">
              <FiArrowUp />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
