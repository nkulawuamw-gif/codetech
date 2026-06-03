import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiBell, FiCheck, FiTrash2, FiInbox, FiMessageSquare, FiTag, FiInfo,
  FiFilter, FiMail,
} from 'react-icons/fi'
import { useNotifications } from '../context/NotificationsContext'
import './Notifications.css'
import './shared-pages.css'

const iconForType = (type) => {
  switch (type) {
    case 'message': return <FiMessageSquare />
    case 'promo': return <FiTag />
    case 'system': return <FiInfo />
    default: return <FiBell />
  }
}

const formatFull = (ts) => {
  const d = new Date(ts)
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, removeNotification } = useNotifications()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all'
    ? notifications
    : filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications.filter((n) => n.type === filter)

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'message', label: 'Messages' },
    { id: 'promo', label: 'Promos' },
    { id: 'system', label: 'System' },
  ]

  return (
    <div className="notif-page">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Notifications</span>
          <h1>Your <span className="gradient-text">activity center</span></h1>
          <p>Track every message, request, and update in one place. New notifications appear here as soon as they happen.</p>
        </div>
      </section>

      <section className="notif-page-section">
        <div className="container">
          <div className="notif-page-toolbar">
            <div className="notif-stat">
              <strong>{notifications.length}</strong>
              <span>total</span>
            </div>
            <div className="notif-stat">
              <strong className="text-unread">{unreadCount}</strong>
              <span>unread</span>
            </div>
            <div className="notif-filters">
              {filters.map(f => (
                <button
                  key={f.id}
                  className={`pill ${filter === f.id ? 'active' : ''}`}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="notif-page-actions">
              {unreadCount > 0 && (
                <button className="btn btn-secondary" onClick={markAllAsRead}>
                  <FiCheck /> Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button className="btn btn-secondary danger" onClick={clearAll}>
                  <FiTrash2 /> Clear all
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="notif-page-empty">
              <FiInbox />
              <h3>{filter === 'unread' ? 'No unread notifications' : 'Nothing here yet'}</h3>
              <p>
                {filter === 'unread'
                  ? "You're all caught up. We'll let you know when something new arrives."
                  : 'Notifications will appear here as you interact with the site.'}
              </p>
              <Link to="/contact" className="btn btn-primary">
                <FiMail /> Send a message
              </Link>
            </div>
          ) : (
            <ul className="notif-page-list">
              {filtered.map(n => (
                <li
                  key={n.id}
                  className={`notif-page-item ${n.read ? 'read' : 'unread'}`}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className={`notif-page-icon type-${n.type}`}>
                    {iconForType(n.type)}
                  </div>
                  <div className="notif-page-body">
                    <div className="notif-page-head">
                      <h3>{n.title}</h3>
                      <span className="notif-page-time" title={formatFull(n.timestamp)}>
                        {formatFull(n.timestamp)}
                      </span>
                    </div>
                    {n.body && <p className="notif-page-text">{n.body}</p>}
                    {n.meta && (
                      <div className="notif-page-meta">
                        {n.meta.email && (
                          <span><FiMail /> {n.meta.email}</span>
                        )}
                        {n.meta.phone && (
                          <span>📞 {n.meta.phone}</span>
                        )}
                        {n.meta.company && (
                          <span>🏢 {n.meta.company}</span>
                        )}
                        {n.meta.budget && (
                          <span>💰 {n.meta.budget}</span>
                        )}
                        {n.meta.services && n.meta.services.length > 0 && (
                          <div className="notif-page-services">
                            {n.meta.services.map((s, i) => (
                              <span className="notif-page-service-chip" key={i}>{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="notif-page-side">
                    {!n.read && <span className="notif-page-dot" aria-label="Unread" />}
                    <button
                      className="notif-page-delete"
                      onClick={(e) => { e.stopPropagation(); removeNotification(n.id) }}
                      aria-label="Delete notification"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
