import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import {
  FiLogOut, FiSave, FiCheck, FiAlertCircle, FiRefreshCw, FiPackage,
  FiServer, FiBox, FiShoppingBag, FiEdit2, FiX, FiSearch, FiGlobe, FiUsers,
  FiMail, FiStar, FiSettings, FiTrash2, FiPlus,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useContent } from '../hooks/useContent'
import * as api from '../services/api'
import { isSupabaseConfigured } from '../lib/supabase'
import NotificationBell from '../components/NotificationBell'
import './Admin.css'

const TABS = [
  { id: 'services',    label: 'Services',     icon: <FiPackage /> },
  { id: 'hosting',     label: 'Hosting',      icon: <FiServer /> },
  { id: 'domains',     label: 'Domains',      icon: <FiGlobe /> },
  { id: 'demos',       label: 'Demos',        icon: <FiBox /> },
  { id: 'orders',      label: 'Orders',       icon: <FiShoppingBag /> },
  { id: 'requests',    label: 'Requests',     icon: <FiUsers /> },
  { id: 'messages',    label: 'Messages',     icon: <FiMail /> },
  { id: 'testimonials',label: 'Testimonials', icon: <FiStar /> },
  { id: 'settings',    label: 'Settings',     icon: <FiSettings /> },
]

export default function Admin() {
  const { isAdmin, loading, user, signOut, isSupabaseConfigured } = useAuth()
  const [tab, setTab] = useState('services')
  const [toast, setToast] = useState(null)

  const showToast = (msg, kind = 'success') => {
    setToast({ msg, kind })
    setTimeout(() => setToast(null), 3500)
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="admin-not-configured">
            <h2>Supabase is not configured</h2>
            <p>Add your Supabase credentials to <code>.env.local</code> and restart the dev server to access the admin panel.</p>
            <Link to="/admin/login" className="btn btn-primary">Go to sign-in</Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="admin-loading">Checking your session…</div>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="admin-page">
      <div className="container">
        {/* Header */}
        <div className="admin-header">
          <div>
            <span className="eyebrow">Admin Console</span>
            <h1>Welcome back, <span className="gradient-text">{user.email?.split('@')[0]}</span></h1>
            <p>Manage services, hosting, domains, demos, orders, messages, testimonials, and site settings.</p>
          </div>
          <div className="admin-header-actions">
            <Link to="/" className="btn btn-ghost">View site</Link>
            <NotificationBell />
            <button className="btn btn-secondary" onClick={signOut}>
              <FiLogOut /> Sign out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`admin-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {toast && (
          <div className={`admin-toast ${toast.kind}`}>
            {toast.kind === 'success' ? <FiCheck /> : <FiAlertCircle />}
            {toast.msg}
          </div>
        )}

        {/* Tab content */}
        {tab === 'services'  && <ServicesPanel showToast={showToast} />}
        {tab === 'hosting'   && <HostingPanel showToast={showToast} />}
        {tab === 'domains'   && <DomainsPanel showToast={showToast} />}
        {tab === 'demos'     && <DemosPanel showToast={showToast} />}
        {tab === 'orders'       && <OrdersPanel showToast={showToast} />}
        {tab === 'requests'     && <RequestsPanel showToast={showToast} />}
        {tab === 'messages'     && <MessagesPanel showToast={showToast} />}
        {tab === 'testimonials' && <TestimonialsPanel showToast={showToast} />}
        {tab === 'settings'     && <SettingsPanel showToast={showToast} />}
      </div>
    </div>
  )
}

// ============================================================================
// Services panel
// ============================================================================
function ServicesPanel({ showToast }) {
  const { data, loading, refresh } = useContent('services')
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await api.updateService(editing.id, {
        title: editing.title,
        short: editing.short,
        description: editing.desc,
        price: editing.price,
        priceValue: Number(editing.priceValue) || 0,
        features: editing.features,
        icon: editing.icon,
      })
      showToast(`Saved "${editing.title}"`)
      setEditing(null)
      refresh()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PanelLoading />

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>Services ({data.length})</h2>
        <button className="btn btn-ghost" onClick={refresh}><FiRefreshCw /> Refresh</button>
      </div>

      {editing && (
        <div className="admin-edit-card">
          <div className="admin-edit-head">
            <h3>Edit service</h3>
            <button className="admin-close" onClick={() => setEditing(null)}><FiX /></button>
          </div>
          <div className="admin-form-grid">
            <Field label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
            <Field label="Icon (emoji)" value={editing.icon} onChange={(v) => setEditing({ ...editing, icon: v })} />
            <Field label="Short blurb" value={editing.short} onChange={(v) => setEditing({ ...editing, short: v })} full />
            <Field label="Full description" value={editing.desc} onChange={(v) => setEditing({ ...editing, desc: v })} full textarea />
            <Field label="Price (display)" value={editing.price} onChange={(v) => setEditing({ ...editing, price: v })} />
            <Field label="Price value (MWK)" value={editing.priceValue} onChange={(v) => setEditing({ ...editing, priceValue: v })} type="number" />
            <Field
              label="Features (one per line)"
              value={(editing.features || []).join('\n')}
              onChange={(v) => setEditing({ ...editing, features: v.split('\n').map(s => s.trim()).filter(Boolean) })}
              full
              textarea
            />
          </div>
          <div className="admin-edit-actions">
            <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              <FiSave /> {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Price</th>
            <th>Features</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.map(s => (
            <tr key={s.id}>
              <td>
                <div className="admin-table-title">
                  <span className="admin-emoji">{s.icon}</span>
                  <div>
                    <strong>{s.title}</strong>
                    <span>{s.short}</span>
                  </div>
                </div>
              </td>
              <td>
                <strong className="gradient-text">{s.price}</strong>
                <span className="muted">MWK {Number(s.priceValue).toLocaleString()}</span>
              </td>
              <td>
                <div className="admin-chips">
                  {(s.features || []).slice(0, 3).map((f, i) => <span className="admin-chip" key={i}>{f}</span>)}
                  {(s.features || []).length > 3 && <span className="muted">+{s.features.length - 3} more</span>}
                </div>
              </td>
              <td>
                <button className="btn btn-ghost" onClick={() => setEditing(s)}>
                  <FiEdit2 /> Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================================================
// Hosting panel
// ============================================================================
function HostingPanel({ showToast }) {
  const { data, loading, refresh } = useContent('hosting_plans')
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await api.updateHostingPlan(editing.id, {
        name: editing.name,
        description: editing.desc,
        price: Number(editing.price) || 0,
        features: editing.features,
        popular: editing.popular,
      })
      showToast(`Saved "${editing.name}"`)
      setEditing(null)
      refresh()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PanelLoading />

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>Hosting plans ({data.length})</h2>
        <button className="btn btn-ghost" onClick={refresh}><FiRefreshCw /> Refresh</button>
      </div>

      {editing && (
        <div className="admin-edit-card">
          <div className="admin-edit-head">
            <h3>Edit plan: {editing.name}</h3>
            <button className="admin-close" onClick={() => setEditing(null)}><FiX /></button>
          </div>
          <div className="admin-form-grid">
            <Field label="Plan name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
            <Field
              label="Monthly price (MWK)"
              value={editing.price}
              onChange={(v) => setEditing({ ...editing, price: v })}
              type="number"
            />
            <Field label="Description" value={editing.desc} onChange={(v) => setEditing({ ...editing, desc: v })} full />
            <label className="admin-check">
              <input
                type="checkbox"
                checked={Boolean(editing.popular)}
                onChange={(e) => setEditing({ ...editing, popular: e.target.checked })}
              />
              Mark as "Most Popular"
            </label>
            <Field
              label="Features (one per line)"
              value={(editing.features || []).join('\n')}
              onChange={(v) => setEditing({ ...editing, features: v.split('\n').map(s => s.trim()).filter(Boolean) })}
              full
              textarea
            />
          </div>
          <div className="admin-edit-actions">
            <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              <FiSave /> {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      )}

      <div className="admin-plan-grid">
        {data.map(p => (
          <div key={p.id} className={`admin-plan-card ${p.popular ? 'popular' : ''}`}>
            <div className="admin-plan-head">
              <span className="admin-emoji">{p.icon}</span>
              <strong>{p.name}</strong>
              {p.popular && <span className="admin-popular-tag">Popular</span>}
            </div>
            <p className="muted">{p.desc}</p>
            <div className="admin-plan-price">MWK {Number(p.price).toLocaleString()}<span>/mo</span></div>
            <ul className="admin-plan-feats">
              {(p.features || []).slice(0, 4).map((f, i) => <li key={i}>{f}</li>)}
              {(p.features || []).length > 4 && <li className="muted">+{p.features.length - 4} more</li>}
            </ul>
            <button className="btn btn-secondary btn-block" onClick={() => setEditing(p)}>
              <FiEdit2 /> Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Domains panel
// ============================================================================
function DomainsPanel({ showToast }) {
  const { data, loading, refresh } = useContent('domains')
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await api.updateDomain(editing.name, {
        price: Number(editing.price) || 0,
        popular: editing.popular,
        description: editing.desc,
      })
      showToast(`Saved "${editing.name}"`)
      setEditing(null)
      refresh()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PanelLoading />

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>Domains ({data.length})</h2>
        <button className="btn btn-ghost" onClick={refresh}><FiRefreshCw /> Refresh</button>
      </div>

      {editing && (
        <div className="admin-edit-card">
          <div className="admin-edit-head">
            <h3>Edit domain: {editing.name}</h3>
            <button className="admin-close" onClick={() => setEditing(null)}><FiX /></button>
          </div>
          <div className="admin-form-grid">
            <Field label="Domain name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} disabled />
            <Field
              label="Price (MWK/mo)"
              value={editing.price}
              onChange={(v) => setEditing({ ...editing, price: v })}
              type="number"
            />
            <Field label="Description" value={editing.desc} onChange={(v) => setEditing({ ...editing, desc: v })} full />
            <label className="admin-check">
              <input
                type="checkbox"
                checked={Boolean(editing.popular)}
                onChange={(e) => setEditing({ ...editing, popular: e.target.checked })}
              />
              Mark as "Popular"
            </label>
          </div>
          <div className="admin-edit-actions">
            <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              <FiSave /> {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Domain</th>
            <th>Price</th>
            <th>Popular</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.map(d => (
            <tr key={d.name}>
              <td>
                <div className="admin-table-title">
                  <div>
                    <strong>{d.name}</strong>
                    <span className="muted">{d.desc}</span>
                  </div>
                </div>
              </td>
              <td>
                <strong className="gradient-text">MWK {Math.round(Number(d.price) / 12).toLocaleString()}</strong>
                <span className="muted">/mo</span>
              </td>
              <td>
                {d.popular && <span className="admin-popular-tag" style={{ position: 'static' }}>Popular</span>}
              </td>
              <td>
                <button className="btn btn-ghost" onClick={() => setEditing(d)}>
                  <FiEdit2 /> Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================================================
// Demos panel
// ============================================================================
function DemosPanel({ showToast }) {
  const { data, loading, refresh } = useContent('demo_sites')
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await api.updateDemoSite(editing.id, {
        title: editing.title,
        category: editing.category,
        description: editing.desc,
        tech: editing.tech,
        image: editing.image,
        url: editing.url,
        features: editing.features,
      })
      showToast(`Saved "${editing.title}"`)
      setEditing(null)
      refresh()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PanelLoading />

  const filtered = data.filter(d =>
    !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>Demo sites ({data.length})</h2>
        <div className="admin-panel-tools">
          <div className="admin-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Filter demos…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-ghost" onClick={refresh}><FiRefreshCw /> Refresh</button>
        </div>
      </div>

      {editing && (
        <div className="admin-edit-card">
          <div className="admin-edit-head">
            <h3>Edit demo: {editing.title}</h3>
            <button className="admin-close" onClick={() => setEditing(null)}><FiX /></button>
          </div>
          <div className="admin-form-grid">
            <Field label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
            <Field label="Category" value={editing.category} onChange={(v) => setEditing({ ...editing, category: v })} />
            <Field label="Image (emoji)" value={editing.image} onChange={(v) => setEditing({ ...editing, image: v })} />
            <Field label="URL / anchor" value={editing.url || ''} onChange={(v) => setEditing({ ...editing, url: v })} />
            <Field label="Description" value={editing.desc} onChange={(v) => setEditing({ ...editing, desc: v })} full textarea />
            <Field
              label="Tech stack (one per line)"
              value={(editing.tech || []).join('\n')}
              onChange={(v) => setEditing({ ...editing, tech: v.split('\n').map(s => s.trim()).filter(Boolean) })}
              full
              textarea
            />
            <Field
              label="Features (one per line)"
              value={(editing.features || []).join('\n')}
              onChange={(v) => setEditing({ ...editing, features: v.split('\n').map(s => s.trim()).filter(Boolean) })}
              full
              textarea
            />
          </div>
          <div className="admin-edit-actions">
            <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              <FiSave /> {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Demo</th>
            <th>Category</th>
            <th>Tech</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(d => (
            <tr key={d.id}>
              <td>
                <div className="admin-table-title">
                  <span className="admin-emoji">{d.image}</span>
                  <div>
                    <strong>{d.title}</strong>
                    <span>{d.desc}</span>
                  </div>
                </div>
              </td>
              <td><span className="admin-chip">{d.category}</span></td>
              <td>
                <div className="admin-chips">
                  {(d.tech || []).map((t, i) => <span className="admin-chip alt" key={i}>{t}</span>)}
                </div>
              </td>
              <td>
                <button className="btn btn-ghost" onClick={() => setEditing(d)}>
                  <FiEdit2 /> Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================================================
// Orders panel
// ============================================================================
function OrdersPanel({ showToast }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(null)

  const load = async () => {
    setLoading(true)
    const data = await api.getOrders()
    setOrders(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const setStatus = async (id, status) => {
    setBusy(id)
    try {
      await api.updateOrderStatus(id, status)
      showToast(`Order updated: ${status}`)
      load()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <PanelLoading />

  const statusColor = (s) => s === 'paid' ? 'success' : s === 'cancelled' ? 'danger' : s === 'fulfilled' ? 'info' : 'pending'

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>Orders ({orders.length})</h2>
        <button className="btn btn-ghost" onClick={load}><FiRefreshCw /> Refresh</button>
      </div>

      {orders.length === 0 ? (
        <div className="admin-empty">
          <h3>No orders yet</h3>
          <p>When customers complete checkout, their orders will appear here.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Method</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>
                  <strong>{o.reference}</strong>
                  <span className="muted">{new Date(o.created_at).toLocaleString()}</span>
                </td>
                <td>
                  <strong>{o.customer_name}</strong>
                  <span className="muted">{o.customer_email}</span>
                </td>
                <td>
                  <div className="admin-chips">
                    {(o.order_items || []).map((it, i) => (
                      <span className="admin-chip alt" key={i}>
                        {it.title}{it.qty > 1 ? ` ×${it.qty}` : ''}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <strong className="gradient-text">MWK {Number(o.total).toLocaleString()}</strong>
                  {o.discount > 0 && <span className="muted">−MWK {Number(o.discount).toLocaleString()} disc.</span>}
                </td>
                <td><span className="admin-chip">{o.payment_method.toUpperCase()}</span></td>
                <td>
                  <span className={`admin-status status-${statusColor(o.status)}`}>{o.status}</span>
                </td>
                <td>
                  <select
                    className="admin-status-select"
                    value={o.status}
                    onChange={(e) => setStatus(o.id, e.target.value)}
                    disabled={busy === o.id}
                  >
                    <option value="pending">pending</option>
                    <option value="paid">paid</option>
                    <option value="fulfilled">fulfilled</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ============================================================================
// Demo Requests panel
// ============================================================================
function RequestsPanel({ showToast }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const data = await api.getDemoRequests()
    setRequests(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  if (loading) return <PanelLoading />

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>Demo requests ({requests.length})</h2>
        <button className="btn btn-ghost" onClick={load}><FiRefreshCw /> Refresh</button>
      </div>

      {requests.length === 0 ? (
        <div className="admin-empty">
          <h3>No demo requests yet</h3>
          <p>When visitors request demos, their details will appear here.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Company / Project</th>
              <th>Demo</th>
              <th>Budget</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr key={r.id}>
                <td>
                  <span className="muted" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </td>
                <td><strong>{r.full_name}</strong></td>
                <td>
                  <div style={{ fontSize: 13 }}>{r.email}</div>
                  {r.phone && <span className="muted">{r.phone}</span>}
                </td>
                <td>
                  <div style={{ fontSize: 13 }}>{r.company || '—'}</div>
                  {r.project_name && <span className="muted">{r.project_name}</span>}
                </td>
                <td><span className="admin-chip">{r.demo_title}</span></td>
                <td><span className="muted">{r.budget || '—'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ============================================================================
// Messages panel
// ============================================================================
function MessagesPanel({ showToast }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const data = await api.getContactMessages()
    setMessages(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const markRead = async (id) => {
    await api.markMessageRead(id)
    load()
  }

  if (loading) return <PanelLoading />

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>Messages ({messages.length})</h2>
        <button className="btn btn-ghost" onClick={load}><FiRefreshCw /> Refresh</button>
      </div>

      {messages.length === 0 ? (
        <div className="admin-empty">
          <h3>No messages yet</h3>
          <p>Contact form submissions will appear here.</p>
        </div>
      ) : (
        <div className="admin-messages-list">
          {messages.map(m => (
            <div key={m.id} className={`admin-message ${m.read ? '' : 'unread'}`} onClick={() => !m.read && markRead(m.id)}>
              <div className="admin-msg-head">
                <strong>{m.full_name}</strong>
                <span className="muted">{new Date(m.created_at).toLocaleString()}</span>
                {!m.read && <span className="admin-badge">New</span>}
              </div>
              <div className="admin-msg-meta">
                <span>{m.email}</span>
                {m.phone && <span>{m.phone}</span>}
                {m.company && <span>{m.company}</span>}
                {m.budget && <span>Budget: {m.budget}</span>}
              </div>
              <p className="admin-msg-body">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Testimonials panel
// ============================================================================
function TestimonialsPanel({ showToast }) {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newItem, setNewItem] = useState({ quote: '', name: '', role: '', initials: '', sortOrder: 0 })

  const load = async () => {
    setLoading(true)
    const data = await api.getTestimonials()
    setTestimonials(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true)
    try {
      await api.updateTestimonial(editing.id, {
        quote: editing.quote,
        name: editing.name,
        role: editing.role,
        initials: editing.initials,
        active: editing.active,
      })
      showToast('Testimonial saved')
      setEditing(null)
      load()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const create = async () => {
    if (!newItem.quote || !newItem.name) { showToast('Quote and name are required', 'error'); return }
    setSaving(true)
    try {
      await api.createTestimonial(newItem)
      showToast('Testimonial created')
      setCreating(false)
      setNewItem({ quote: '', name: '', role: '', initials: '', sortOrder: 0 })
      load()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return
    try {
      await api.deleteTestimonial(id)
      showToast('Deleted')
      load()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  if (loading) return <PanelLoading />

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>Testimonials ({testimonials.length})</h2>
        <div className="admin-panel-tools">
          <button className="btn btn-primary" onClick={() => setCreating(true)}><FiPlus /> Add</button>
          <button className="btn btn-ghost" onClick={load}><FiRefreshCw /> Refresh</button>
        </div>
      </div>

      {creating && (
        <div className="admin-edit-card">
          <div className="admin-edit-head">
            <h3>New testimonial</h3>
            <button className="admin-close" onClick={() => setCreating(false)}><FiX /></button>
          </div>
          <div className="admin-form-grid">
            <Field label="Quote *" value={newItem.quote} onChange={(v) => setNewItem({...newItem, quote: v})} full textarea />
            <Field label="Name *" value={newItem.name} onChange={(v) => setNewItem({...newItem, name: v})} />
            <Field label="Role / title" value={newItem.role} onChange={(v) => setNewItem({...newItem, role: v})} />
            <Field label="Initials (e.g. SM)" value={newItem.initials} onChange={(v) => setNewItem({...newItem, initials: v})} />
          </div>
          <div className="admin-edit-actions">
            <button className="btn btn-secondary" onClick={() => setCreating(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={create} disabled={saving}>
              <FiSave /> {saving ? 'Saving…' : 'Create testimonial'}
            </button>
          </div>
        </div>
      )}

      {editing && (
        <div className="admin-edit-card">
          <div className="admin-edit-head">
            <h3>Edit testimonial</h3>
            <button className="admin-close" onClick={() => setEditing(null)}><FiX /></button>
          </div>
          <div className="admin-form-grid">
            <Field label="Quote" value={editing.quote} onChange={(v) => setEditing({...editing, quote: v})} full textarea />
            <Field label="Name" value={editing.name} onChange={(v) => setEditing({...editing, name: v})} />
            <Field label="Role / title" value={editing.role} onChange={(v) => setEditing({...editing, role: v})} />
            <Field label="Initials" value={editing.initials} onChange={(v) => setEditing({...editing, initials: v})} />
            <label className="admin-check">
              <input type="checkbox" checked={Boolean(editing.active)} onChange={(e) => setEditing({...editing, active: e.target.checked})} />
              Active (show on site)
            </label>
          </div>
          <div className="admin-edit-actions">
            <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              <FiSave /> {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Author</th>
            <th>Quote</th>
            <th>Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {testimonials.map(t => (
            <tr key={t.id}>
              <td>
                <strong>{t.name}</strong>
                <span className="muted">{t.role}</span>
              </td>
              <td><em>{t.quote?.slice(0, 100)}{t.quote?.length > 100 ? '…' : ''}</em></td>
              <td>{t.active !== false ? <FiCheck style={{ color: 'var(--green)' }} /> : <FiX style={{ color: 'var(--danger)' }} />}</td>
              <td>
                <div className="admin-cell-actions">
                  <button className="btn btn-ghost" onClick={() => setEditing(t)}><FiEdit2 /></button>
                  <button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => remove(t.id)}><FiTrash2 /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================================================
// Site Settings panel
// ============================================================================
function SettingsPanel({ showToast }) {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const data = await api.getSiteSettings()
    setSettings(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true)
    try {
      await api.updateSiteSetting(editing.key, editing.value)
      showToast(`Saved "${editing.key}"`)
      setEditing(null)
      load()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PanelLoading />

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>Site settings</h2>
        <button className="btn btn-ghost" onClick={load}><FiRefreshCw /> Refresh</button>
      </div>

      {editing && (
        <div className="admin-edit-card">
          <div className="admin-edit-head">
            <h3>Edit: {editing.key}</h3>
            <button className="admin-close" onClick={() => setEditing(null)}><FiX /></button>
          </div>
          <div className="admin-form-grid">
            <Field label="Key" value={editing.key} onChange={(v) => setEditing({...editing, key: v})} disabled />
            <Field label="Value" value={editing.value} onChange={(v) => setEditing({...editing, value: v})} full textarea />
          </div>
          <div className="admin-edit-actions">
            <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              <FiSave /> {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(settings).map(([key, value]) => (
            <tr key={key}>
              <td><strong>{key}</strong></td>
              <td><span className="muted">{typeof value === 'string' ? value.slice(0, 120) : JSON.stringify(value).slice(0, 120)}{value?.length > 120 ? '…' : ''}</span></td>
              <td>
                <button className="btn btn-ghost" onClick={() => setEditing({ key, value: typeof value === 'string' ? value : JSON.stringify(value) })}>
                  <FiEdit2 /> Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================================================
// Helpers
// ============================================================================
function Field({ label, value, onChange, type = 'text', full = false, textarea = false, disabled = false }) {
  return (
    <div className={full ? 'admin-field full' : 'admin-field'}>
      <label>{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} disabled={disabled} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
      )}
    </div>
  )
}

function PanelLoading() {
  return <div className="admin-loading">Loading…</div>
}
