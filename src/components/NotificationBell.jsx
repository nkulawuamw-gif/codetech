import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FiBell, FiCheck, FiX, FiTrash2, FiInbox, FiMessageSquare, FiTag, FiInfo } from 'react-icons/fi'
import { useNotifications } from '../context/NotificationsContext'
import './NotificationBell.css'

const iconForType = (type) => {
  switch (type) {
    case 'message': return <FiMessageSquare />
    case 'promo': return <FiTag />
    case 'system': return <FiInfo />
    default: return <FiBell />
  }
}

const formatTime = (ts) => {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(ts).toLocaleDateString()
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  const recent = notifications.slice(0, 6)

  return (
    <div className="notif-wrap" ref={ref}>
      <button
        type="button"
        className={`notif-bell ${open ? 'active' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications, ${unreadCount} unread`}
        title="Notifications"
      >
        <FiBell />
        {unreadCount > 0 && (
          <span className="notif-badge" aria-hidden="true">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-panel" role="dialog" aria-label="Notifications">
          <div className="notif-head">
            <div>
              <h3>Notifications</h3>
              <span className="notif-count">
                {unreadCount > 0 ? `${unreadCount} new` : 'All caught up'}
              </span>
            </div>
            <div className="notif-head-actions">
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="notif-link"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  <FiCheck /> Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  className="notif-link danger"
                  onClick={clearAll}
                  title="Clear all"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          </div>

          <div className="notif-body">
            {recent.length === 0 ? (
              <div className="notif-empty">
                <FiInbox />
                <p>No notifications yet</p>
                <span>We'll let you know when something happens.</span>
              </div>
            ) : (
              <ul className="notif-list">
                {recent.map((n) => (
                  <li
                    key={n.id}
                    className={`notif-item ${n.read ? 'read' : 'unread'}`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className={`notif-icon type-${n.type}`}>
                      {iconForType(n.type)}
                    </div>
                    <div className="notif-content">
                      <div className="notif-row">
                        <strong>{n.title}</strong>
                        <span className="notif-time">{formatTime(n.timestamp)}</span>
                      </div>
                      {n.body && <p>{n.body}</p>}
                      {n.meta && (
                        <div className="notif-meta">
                          {n.meta.services && (
                            <span className="notif-meta-chip">
                              {n.meta.services.length} service{n.meta.services.length === 1 ? '' : 's'}
                            </span>
                          )}
                          {n.meta.email && <span>{n.meta.email}</span>}
                        </div>
                      )}
                    </div>
                    {!n.read && <span className="notif-dot" aria-label="Unread" />}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="notif-foot">
            <Link to="/notifications" onClick={() => setOpen(false)} className="notif-view-all">
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
