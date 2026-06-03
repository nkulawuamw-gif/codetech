import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'codetech_notifications_v1'

const NotificationsContext = createContext(null)

const sampleSeed = [
  {
    id: 'n-welcome-1',
    type: 'system',
    title: 'Welcome to CODE TECH',
    body: 'Your account is set up. Browse services or request a free quote anytime.',
    timestamp: Date.now() - 1000 * 60 * 60 * 4,
    read: false,
  },
  {
    id: 'n-promo-1',
    type: 'promo',
    title: 'Bundle discount available',
    body: 'Select 3+ services and save 15%. Select 5+ services and save 20%.',
    timestamp: Date.now() - 1000 * 60 * 60 * 26,
    read: true,
  },
  {
    id: 'n-demo-1',
    type: 'info',
    title: '12 live demos available',
    body: 'Explore our portfolio of management systems on the Demos page.',
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
    read: true,
  },
]

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return sampleSeed
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    return sampleSeed
  } catch {
    return sampleSeed
  }
}

const saveToStorage = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* storage quota or disabled — fail silently */
  }
}

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(loadFromStorage)

  useEffect(() => {
    saveToStorage(notifications)
  }, [notifications])

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => {
      const id = `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const next = [
        {
          id,
          type: notification.type || 'message',
          title: notification.title || 'New message',
          body: notification.body || '',
          meta: notification.meta || null,
          timestamp: Date.now(),
          read: false,
        },
        ...prev,
      ]
      // Cap to last 50 to keep storage tidy
      return next.slice(0, 50)
    })
  }, [])

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
  }

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) {
    throw new Error('useNotifications must be used inside a NotificationsProvider')
  }
  return ctx
}
