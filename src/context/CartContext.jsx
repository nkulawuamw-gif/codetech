import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const STORAGE_KEY = 'codetech_cart_v1'

const CartContext = createContext(null)

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    return []
  } catch {
    return []
  }
}

const saveToStorage = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* ignore */
  }
}

const buildLineId = (item) =>
  `${item.type}:${item.id}:${item.billing || 'one-time'}:${item.domainName || ''}`

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadFromStorage)

  useEffect(() => {
    saveToStorage(items)
  }, [items])

  const addItem = useCallback((rawItem) => {
    const item = {
      id: rawItem.id,
      type: rawItem.type, // 'service' | 'hosting' | 'domain'
      title: rawItem.title,
      subtitle: rawItem.subtitle || '',
      icon: rawItem.icon || '📦',
      price: Number(rawItem.price) || 0,
      priceLabel: rawItem.priceLabel || '',
      billing: rawItem.billing || 'one-time',
      domainName: rawItem.domainName || '',
      qty: rawItem.qty || 1,
      addedAt: Date.now(),
    }
    const lineId = buildLineId(item)
    setItems(prev => {
      const existing = prev.findIndex(i => buildLineId(i) === lineId)
      if (existing >= 0) {
        const next = [...prev]
        next[existing] = { ...next[existing], qty: next[existing].qty + (item.qty || 1) }
        return next
      }
      return [...prev, { ...item, lineId }]
    })
    return lineId
  }, [])

  const removeItem = useCallback((lineId) => {
    setItems(prev => prev.filter(i => i.lineId !== lineId))
  }, [])

  const updateQty = useCallback((lineId, qty) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.lineId !== lineId))
      return
    }
    setItems(prev => prev.map(i => i.lineId === lineId ? { ...i, qty } : i))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + (i.qty || 1), 0),
    [items]
  )

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * (i.qty || 1), 0),
    [items]
  )

  // Bundle discount (same logic as Services page): 15% for 3+ items, extra 10% on top for 5+
  const discount = useMemo(() => {
    if (items.length >= 5) return Math.round(subtotal * 0.20)
    if (items.length >= 3) return Math.round(subtotal * 0.15)
    return 0
  }, [items.length, subtotal])

  const total = Math.max(0, subtotal - discount)

  const value = {
    items,
    itemCount,
    subtotal,
    discount,
    total,
    addItem,
    removeItem,
    updateQty,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside a CartProvider')
  return ctx
}
