import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiLock, FiMail, FiAlertCircle, FiArrowRight } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import './AdminLogin.css'

export default function AdminLogin() {
  const { signIn, isAdmin, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isAdmin) navigate('/admin', { replace: true })
  }, [isAdmin, navigate])

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signIn(email, password)
      navigate('/admin', { replace: true })
    } catch (e) {
      setError(e.message || 'Sign in failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-side">
          <div className="admin-login-brand">
            <Link to="/" className="logo">
              <span className="logo-icon"><FiLock /></span>
              <span className="logo-text">CODE <span className="gradient-text">TECH</span></span>
            </Link>
          </div>
          <h2>Admin Console</h2>
          <p>Sign in to manage services, hosting plans, demos, and orders.</p>
          <ul className="admin-login-feats">
            <li>✓ Edit services & prices</li>
            <li>✓ Update hosting plans & features</li>
            <li>✓ Manage demo portfolio</li>
            <li>✓ View & update orders</li>
          </ul>
        </div>

        <form onSubmit={submit} className="admin-login-form">
          <h1>Sign in</h1>
          <p className="form-sub">Welcome back. Please enter your admin credentials.</p>

          {error && (
            <div className="admin-error">
              <FiAlertCircle /> {error}
            </div>
          )}

          <div>
            <label htmlFor="email">Email</label>
            <div className="admin-input">
              <FiMail />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@codetech.io"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <div className="admin-input">
              <FiLock />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={submitting}
          >
            {submitting ? 'Signing in…' : <>Sign in <FiArrowRight /></>}
          </button>

          <p className="admin-back">
            <Link to="/">← Back to website</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
