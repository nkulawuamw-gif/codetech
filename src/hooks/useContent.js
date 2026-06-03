import { useState, useEffect, useCallback } from 'react'
import * as api from '../services/api'

// Hook: useContent(table, fallback)
// Returns { data, loading, error, refresh } for any of the read endpoints.
export function useContent(table) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      let result
      switch (table) {
        case 'services':      result = await api.getServices(); break
        case 'hosting_plans': result = await api.getHostingPlans(); break
        case 'domains':       result = await api.getDomains(); break
        case 'demo_sites':    result = await api.getDemoSites(); break
        default: throw new Error(`Unknown table: ${table}`)
      }
      setData(result)
      setError(null)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [table])

  useEffect(() => { load() }, [load])

  return { data, loading, error, refresh: load }
}
